import { createHash, createVerify } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
// Public Firebase project identifier, must match firebase-applet-config.json.
const FIREBASE_PROJECT_ID = 'gen-lang-client-0558881211';

type AuthRequest = IncomingMessage & { body?: unknown; query?: Record<string, unknown> };
export type GatewayRequest = AuthRequest;
export type GatewayResponse = ServerResponse;

let certificateCache: { certificates: Record<string, string>; expiresAt: number } | null = null;
const minuteCounters = new Map<string, { minute: number; count: number }>();

function decodePart(part: string): any {
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
}

async function getFirebaseCertificates(): Promise<Record<string, string>> {
  if (certificateCache && certificateCache.expiresAt > Date.now()) return certificateCache.certificates;
  const response = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com', {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('Firebase public keys are unavailable');
  const certificates = await response.json() as Record<string, string>;
  const age = Number(response.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1] ?? 1800);
  certificateCache = { certificates, expiresAt: Date.now() + Math.max(60, Math.min(age, 3600)) * 1000 };
  return certificates;
}

/**
 * Verify the signature, issuer, audience, timestamps and identity of a Firebase
 * ID token. No Firebase admin credentials or client-supplied user ID are trusted.
 */
export async function requireFirebaseUser(req: GatewayRequest, res: GatewayResponse): Promise<string | null> {
  const authorization = req.headers.authorization || '';
  const match = /^Bearer ([A-Za-z0-9._-]+)$/.exec(authorization);
  if (!match || match[1].length > 8192) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Sign in required' }));
    return null;
  }
  try {
    const parts = match[1].split('.');
    if (parts.length !== 3) throw new Error('Malformed token');
    const header = decodePart(parts[0]);
    const payload = decodePart(parts[1]);
    const now = Math.floor(Date.now() / 1000);
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' ||
        payload.aud !== FIREBASE_PROJECT_ID ||
        payload.iss !== 'https://securetoken.google.com/' + FIREBASE_PROJECT_ID ||
        typeof payload.sub !== 'string' || payload.sub.length < 1 || payload.sub.length > 128 ||
        typeof payload.exp !== 'number' || payload.exp <= now ||
        typeof payload.iat !== 'number' || payload.iat > now ||
        typeof payload.auth_time !== 'number' || payload.auth_time > now) {
      throw new Error('Invalid Firebase claims');
    }
    const cert = (await getFirebaseCertificates())[header.kid];
    if (!cert) throw new Error('Unknown Firebase signing key');
    const verify = createVerify('RSA-SHA256');
    verify.update(parts[0] + '.' + parts[1]);
    verify.end();
    if (!verify.verify(cert, Buffer.from(parts[2], 'base64url'))) throw new Error('Invalid signature');
    return payload.sub;
  } catch {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Invalid or expired session' }));
    return null;
  }
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
