import { createHash } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { isApprovedGatewayProfile } from './_gatewayApproval.mjs';
import { classifyFirebaseAuthFailure } from './_firebaseAuthFailure.mjs';
import { verifyFirebaseRevocationViaLookup } from './_firebaseAuthRevocationFallback.mjs';
import firebaseConfig from '../firebase-applet-config.json';

// These identifiers are public Firebase configuration, never credentials.
const FIREBASE_PROJECT_ID = 'gen-lang-client-0558881211';
const FIRESTORE_DATABASE_ID = 'ai-studio-d8ed89a2-6662-4aa5-9cc7-1e8d0693722e';
const OWNER_EMAIL = 'he4amali22@gmail.com';
const APP_NAME = 'qul-gemini-gateway';
const minuteCounters = new Map<string, { minute: number; count: number }>();

type AuthRequest = IncomingMessage & { body?: unknown; query?: Record<string, unknown> };
export type GatewayRequest = AuthRequest;
export type GatewayResponse = ServerResponse;

/** Use Firebase's maintained verifier, not hand-written JWT validation. */
function getAdminServices() {
  const existing = getApps().find(app => app.name === APP_NAME);
  if (existing) return { auth: getAuth(existing), db: getFirestore(existing, FIRESTORE_DATABASE_ID) };

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('ADMIN_CREDENTIALS_NOT_CONFIGURED');
  const account = JSON.parse(raw) as {
    project_id?: string; client_email?: string; private_key?: string;
  };
  if (account.project_id !== FIREBASE_PROJECT_ID || !account.client_email || !account.private_key) {
    throw new Error('ADMIN_CREDENTIALS_PROJECT_MISMATCH');
  }
  const app = initializeApp({
    credential: cert({
      projectId: account.project_id,
      clientEmail: account.client_email,
      privateKey: account.private_key.replace(/\\n/g, '\n'),
    }),
    projectId: FIREBASE_PROJECT_ID,
  }, APP_NAME);
  return { auth: getAuth(app), db: getFirestore(app, FIRESTORE_DATABASE_ID) };
}

/**
 * Firebase sign-in proves identity, not platform access. Verify token revocation
 * and the CURRENT Firestore approval before exposing paid Gemini endpoints.
 * The owner exception matches the existing verified-email Firestore policy.
 */
export async function requireFirebaseUser(req: GatewayRequest, res: GatewayResponse): Promise<string | null> {
  const authorization = req.headers.authorization || '';
  const match = /^Bearer ([A-Za-z0-9._-]+)$/.exec(authorization);
  if (!match || match[1].length > 8192) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Sign in required' }));
    return null;
  }

  let services: ReturnType<typeof getAdminServices>;
  try {
    services = getAdminServices();
  } catch {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'Authentication service unavailable' }));
    return null;
  }

  let decoded;
  try {
    // checkRevoked=true also checks for disabled/deleted Firebase users.
    decoded = await services.auth.verifyIdToken(match[1], true);
  } catch (error) {
    if ((error as { code?: string })?.code === 'auth/insufficient-permission') {
      // Use Google's own account lookup to check disabled/deleted/revoked
      // status when the service credential cannot call Admin getUser().
      // Firebase Admin STILL validates the token's signature and claims.
      // The fallback fails closed if the lookup cannot prove session status.
      try {
        decoded = await verifyFirebaseRevocationViaLookup(
          match[1], services.auth, firebaseConfig.apiKey,
        );
        console.info('Firebase Auth: secure REST revocation fallback succeeded');
      } catch (fallbackError) {
        const failure = classifyFirebaseAuthFailure(fallbackError);
        if (failure.statusCode === 503) console.error('Firebase Auth REST fallback:', failure.code);
        res.statusCode = failure.statusCode;
        res.end(JSON.stringify({ error: failure.error, code: failure.code }));
        return null;
      }
    } else {
      const failure = classifyFirebaseAuthFailure(error);
      if (failure.statusCode === 503) console.error('Firebase Admin verification:', failure.code);
      res.statusCode = failure.statusCode;
      res.end(JSON.stringify({ error: failure.error, code: failure.code }));
      return null;
    }
  }

  if (decoded.email_verified !== true || typeof decoded.email !== 'string') {
    res.statusCode = 403;
    res.end(JSON.stringify({ error: 'Verified account required' }));
    return null;
  }
  if (decoded.email === OWNER_EMAIL) return decoded.uid;

  try {
    const snapshot = await services.db.doc('users/' + decoded.uid).get();
    const profile = snapshot.data();
    if (!snapshot.exists || !isApprovedGatewayProfile(profile, decoded.email)) {
      res.statusCode = 403;
      res.end(JSON.stringify({ error: 'Account approval required' }));
      return null;
    }
  } catch {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'Account authorization unavailable' }));
    return null;
  }

  return decoded.uid;
}

/** Best-effort local throttling, with provider quotas as additional enforcement. */
export function checkGatewayQuota(uid: string, res: GatewayResponse, limit = 60): boolean {
  const key = createHash('sha256').update(uid).digest('hex');
  const minute = Math.floor(Date.now() / 60000);
  const previous = minuteCounters.get(key);
  const count = previous?.minute === minute ? previous.count + 1 : 1;
  minuteCounters.set(key, { minute, count });
  if (minuteCounters.size > 1500) {
    for (const [id, state] of minuteCounters) if (state.minute < minute) minuteCounters.delete(id);
  }
  if (count > limit) {
    res.statusCode = 429;
    res.setHeader('Retry-After', '60');
    res.end(JSON.stringify({ error: 'Too many requests. Please try again shortly.' }));
    return false;
  }
  return true;
}

export async function readGatewayBody(req: GatewayRequest, maxBytes = 4 * 1024 * 1024): Promise<Buffer> {
  const input = req.body;
  if (input !== undefined) {
    const body = Buffer.isBuffer(input) ? input :
      typeof input === 'string' ? Buffer.from(input) : Buffer.from(JSON.stringify(input));
    if (body.length > maxBytes) throw new Error('REQUEST_TOO_LARGE');
    return body;
  }
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const part of req) {
    const chunk = Buffer.isBuffer(part) ? part : Buffer.from(part);
    total += chunk.length;
    if (total > maxBytes) throw new Error('REQUEST_TOO_LARGE');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
