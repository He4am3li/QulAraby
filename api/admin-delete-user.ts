import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore, type Firestore, type DocumentReference } from 'firebase-admin/firestore';
import { readGatewayBody, type GatewayRequest, type GatewayResponse } from './_geminiAuth.js';

const PROJECT_ID = 'gen-lang-client-0558881211';
const FIRESTORE_DATABASE_ID = 'ai-studio-d8ed89a2-6662-4aa5-9cc7-1e8d0693722e';
const OWNER_EMAIL = 'he4amali22@gmail.com';
const APP_NAME = 'qul-account-administration';

function send(res: GatewayResponse, status: number, errorOrResult: Record<string, unknown>) {
  res.statusCode = status;
  res.end(JSON.stringify(errorOrResult));
}

function getAdminServices() {
  const existing = getApps().find(app => app.name === APP_NAME);
  if (existing) return { auth: getAuth(existing), db: getFirestore(existing, FIRESTORE_DATABASE_ID) };
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('ADMIN_CREDENTIALS_NOT_CONFIGURED');
  const parsed = JSON.parse(raw) as {
    project_id?: string; client_email?: string; private_key?: string;
  };
  if (parsed.project_id !== PROJECT_ID || !parsed.client_email || !parsed.private_key) {
    throw new Error('ADMIN_CREDENTIALS_PROJECT_MISMATCH');
  }
  const app = initializeApp({
    credential: cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, '\n'),
    }),
    projectId: PROJECT_ID,
  }, APP_NAME);
  return { auth: getAuth(app), db: getFirestore(app, FIRESTORE_DATABASE_ID) };
}

async function purgeDirectLearnerRecords(db: Firestore, path: string, field: string, uid: string): Promise<void> {
  // Idempotent: if a partially completed operation is retried, already-deleted
  // documents are skipped. Keep memory bounded for long-lived student accounts.
  for (;;) {
    const snapshot = await db.collection(path).where(field, '==', uid).limit(50).get();
    if (snapshot.empty) return;
    await Promise.all(snapshot.docs.map(doc => db.recursiveDelete(doc.ref)));
  }
}

/**
 * Account deletion must be made server-side. Never trust a role stored in
 * browser state, a client-supplied email, or a Firebase uid without token verification.
 * Retains shared classroom material to avoid damaging other students' records.
 */
export default async function handler(req: GatewayRequest, res: GatewayResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    send(res, 405, { error: 'Method not allowed' });
    return;
  }

  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
  const host = typeof req.headers.host === 'string' ? req.headers.host : '';
  if (origin && (!host || !origin.startsWith('https://' + host) || new URL(origin).host !== host)) {
    send(res, 403, { error: 'Forbidden origin' });
    return;
  }

  const authorization = req.headers.authorization || '';
  const match = /^Bearer ([A-Za-z0-9._-]+)$/.exec(authorization);
  if (!match || match[1].length > 8192) {
    send(res, 401, { error: 'Owner sign-in required' });
    return;
  }

  let uid: string;
  let confirmationEmail: string;
  try {
    if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
      send(res, 415, { error: 'JSON required' });
      return;
    }
    const raw = await readGatewayBody(req, 2048);
    const body: unknown = JSON.parse(raw.toString('utf8'));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Malformed body');
    const data = body as Record<string, unknown>;
    if (typeof data.uid !== 'string' || typeof data.confirmationEmail !== 'string') throw new Error('Malformed body');
    uid = data.uid;
    confirmationEmail = data.confirmationEmail.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_-]{6,128}$/.test(uid) || confirmationEmail.length > 254) throw new Error('Malformed body');
  } catch {
    send(res, 400, { error: 'Invalid deletion request' });
    return;
  }

  let auditRef: DocumentReference | null = null;
  try {
    const { auth, db } = getAdminServices();
    const decoded = await auth.verifyIdToken(match[1], true);
    const recent = Number.isFinite(decoded.auth_time) &&
      (Math.floor(Date.now() / 1000) - decoded.auth_time) < 300;
    if (decoded.email?.toLowerCase() !== OWNER_EMAIL || decoded.email_verified !== true || !recent) {
      send(res, 403, { error: 'Only the verified platform owner may delete accounts. Sign in again.' });
      return;
    }

    if (uid === decoded.uid) {
      send(res, 403, { error: 'The owner account cannot be deleted from this console.' });
      return;
    }
    const ownerRecord = await db.doc('users/' + decoded.uid).get();
    if (!ownerRecord.exists || ownerRecord.data()?.role !== 'admin') {
      send(res, 403, { error: 'Platform owner permissions could not be verified.' });
      return;
    }

    const profileRef = db.doc('users/' + uid);
    const profile = await profileRef.get();
    if (!profile.exists) {
      send(res, 404, { error: 'This account was already deleted or is not registered.' });
      return;
    }
    const savedEmail = String(profile.data()?.email || '').trim().toLowerCase();
    if (savedEmail !== confirmationEmail || savedEmail === OWNER_EMAIL) {
      send(res, 409, { error: 'Account confirmation does not match the selected user.' });
      return;
    }

    let authUserExists = true;
    try {
      const target = await auth.getUser(uid);
      if (target.email?.toLowerCase() !== savedEmail) {
        send(res, 409, { error: 'Authentication record does not match profile.' });
        return;
      }
    } catch (error: any) {
      if (error?.code === 'auth/user-not-found') authUserExists = false;
      else throw error;
    }

    auditRef = db.collection('admin_audit_logs').doc();
    await auditRef.set({
      action: 'حذف حساب',
      target: uid,
      actorUid: decoded.uid,
      actorEmail: OWNER_EMAIL,
      details: 'حذف حساب المستخدم وبياناته الشخصية المباشرة',
      status: 'started',
      createdAt: FieldValue.serverTimestamp(),
    });

    // Block access first even if a downstream service fails.
    await profileRef.update({ approved: false, updatedAt: FieldValue.serverTimestamp() });
    if (authUserExists) {
      await auth.updateUser(uid, { disabled: true });
      // Delete identity before content so the user can never reactivate a session.
      await auth.deleteUser(uid);
    }

    // Delete personal learning records. Shared classroom artifacts, including
    // teacher-authored quizzes and communal results, are retained on purpose.
    await purgeDirectLearnerRecords(db, 'placement_results', 'userId', uid);
    await purgeDirectLearnerRecords(db, 'letter_submissions', 'studentId', uid);
    // Purge all /users/{uid} subcollections as well as the profile itself.
    await db.recursiveDelete(profileRef);
    await auditRef.update({ status: 'completed', completedAt: FieldValue.serverTimestamp() });
    send(res, 200, { deleted: true, uid });
  } catch (error) {
    console.error('Owner account deletion failed:', error);
    if (auditRef) {
      try { await auditRef.update({ status: 'failed', updatedAt: FieldValue.serverTimestamp() }); }
      catch (auditError) { console.error('Could not update deletion audit:', auditError); }
    }
    send(res, error instanceof Error && error.message.startsWith('ADMIN_CREDENTIALS_') ? 503 : 500, {
      error: 'تعذر إكمال حذف الحساب. قد يكون الدخول معطلًا بالفعل، ويمكن إعادة المحاولة من لوحة الإدارة.',
    });
  }
}
