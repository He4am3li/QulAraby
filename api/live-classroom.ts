import { randomBytes } from 'node:crypto';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { checkGatewayQuota, readGatewayBody, requireFirebaseUser, type GatewayRequest, type GatewayResponse } from './_geminiAuth.js';
import { ROOM_TTL_MS, ROOM_CAP, ROOM_ID_RE, ROOM_CODE_RE, roomScope, canResumeRoom, canJoinRoom } from './_classroomAccess.mjs';

const DB_ID = 'ai-studio-d8ed89a2-6662-4aa5-9cc7-1e8d0693722e';
const OWNER_EMAIL = 'he4amali22@gmail.com';
type Profile = { role?: string; schoolId?: string; classId?: string; approved?: boolean; email?: string };
type Body = { action?: string; sessionId?: string; code?: string };

function send(res: GatewayResponse, status: number, data: Record<string, unknown>) {
  res.statusCode = status;
  res.end(JSON.stringify(data));
}
function getDb() {
  // Authentication has initialized and approved this named Firebase Admin app.
  const app = getApps().find(a => a.name === 'qul-gemini-gateway');
  if (!app) throw Error('SESSION_AUTH_UNAVAILABLE');
  return getFirestore(app, DB_ID);
}

export default async function handler(req: GatewayRequest, res: GatewayResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    send(res, 405, { error: 'Method not allowed' });
    return;
  }
  try {
    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
    const host = typeof req.headers.host === 'string' ? req.headers.host : '';
    if (origin && (!host || new URL(origin).origin !== 'https://' + host)) {
      send(res, 403, { error: 'Forbidden origin' });
      return;
    }
  } catch {
    send(res, 403, { error: 'Forbidden origin' });
    return;
  }

  const uid = await requireFirebaseUser(req, res);
  if (!uid || !checkGatewayQuota(uid, res, 24)) return;
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
    send(res, 415, { error: 'JSON body required' });
    return;
  }

  let body: Body;
  try {
    body = JSON.parse((await readGatewayBody(req, 2048)).toString('utf8'));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw Error('INVALID_BODY');
  } catch {
    send(res, 400, { error: 'Invalid classroom request' });
    return;
  }
  if (!['start', 'join', 'resume', 'leave', 'end'].includes(body.action || '')) {
    send(res, 400, { error: 'Unsupported classroom action' });
    return;
  }
  try {
    const db = getDb();
    const snapshot = await db.doc('users/' + uid).get();
    const profile: Profile = snapshot.exists ? (snapshot.data() || {}) : {};
    // Verify owner identity from the signed Firebase token, never request headers.
    const adminApp = getApps().find(app => app.name === 'qul-gemini-gateway');
    if (!adminApp) throw Error('SESSION_AUTH_UNAVAILABLE');
    const token = String(req.headers.authorization || '').replace(/^Bearer /, '');
    const claims = await getAuth(adminApp).verifyIdToken(token, true);
    const owner = claims.uid === uid && claims.email_verified === true && claims.email === OWNER_EMAIL;
    const teacher = profile.role === 'teacher' || profile.role === 'admin' || owner;

    if (body.action === 'start') {
      if (!teacher) {
        send(res, 403, { error: 'Teacher account required' });
        return;
      }
      const id = randomBytes(16).toString('hex');
      const code = randomBytes(4).toString('hex').toUpperCase();
      const now = Timestamp.now();
      const expiry = Timestamp.fromMillis(now.toMillis() + ROOM_TTL_MS);
      const sessionRef = db.doc('live_sessions/' + id);
      const inviteRef = db.doc('live_session_invites/' + code);
      const scope = roomScope(profile);
      await db.runTransaction(async tx => {
        const duplicate = await tx.get(inviteRef);
        if (duplicate.exists && duplicate.data()?.expiresAt?.toMillis?.() > Date.now()) {
          throw Error('CODE_COLLISION');
        }
        tx.create(sessionRef, {
          teacherId: uid,
          schoolId: scope.schoolId,
          classId: scope.classId,
          participants: {},
          status: 'active',
          createdAt: now,
          expiresAt: expiry,
          joinCode: code,
          poll: { isActive: false, votes: {} },
          exercise: { isActive: false, answers: {} },
          timer: { isActive: false, duration: 60, endTime: null },
          highlights: [], stickyNotes: [], stickers: [], texts: []
        });
        tx.set(inviteRef, { sessionId: id, teacherId: uid, expiresAt: expiry });
      });
      send(res, 200, { sessionId: id, code, expiresAt: expiry.toMillis() });
      return;
    }

    if (body.action === 'join') {
      const code = String(body.code || '').trim().toUpperCase();
      if (!ROOM_CODE_RE.test(code)) {
        send(res, 400, { error: 'Invalid classroom code' });
        return;
      }
      const inviteRef = db.doc('live_session_invites/' + code);
      let sessionId = '';
      await db.runTransaction(async tx => {
        const invite = await tx.get(inviteRef);
        const inviteData = invite.data();
        if (!invite.exists || inviteData?.expiresAt?.toMillis?.() <= Date.now()) {
          throw Error('INVALID_INVITATION');
        }
        const sessionRef = db.doc('live_sessions/' + inviteData!.sessionId);
        const session = await tx.get(sessionRef);
        const data = session.data();
        if (!data || data.status !== 'active' || data.expiresAt?.toMillis?.() <= Date.now() ||
            !canJoinRoom(data, uid, profile)) {
          throw Error('INVALID_INVITATION');
        }
        tx.update(sessionRef, { ['participants.' + uid]: true });
        sessionId = sessionRef.id;
      });
      send(res, 200, { sessionId, code });
      return;
    }

    if (typeof body.sessionId !== 'string' || !ROOM_ID_RE.test(body.sessionId)) {
      send(res, 400, { error: 'Invalid classroom session' });
      return;
    }
    const sessionRef = db.doc('live_sessions/' + body.sessionId);
    if (body.action === 'resume') {
      const doc = await sessionRef.get();
      const data = doc.data();
      if (!data || !canResumeRoom(data, uid, profile)) {
        send(res, 403, { error: 'Classroom session unavailable' });
        return;
      }
      send(res, 200, { sessionId: doc.id, code: data.teacherId === uid ? data.joinCode : null });
      return;
    }
    await db.runTransaction(async tx => {
      const doc = await tx.get(sessionRef);
      const data = doc.data();
      if (!data || !canResumeRoom(data, uid, profile)) throw Error('SESSION_UNAVAILABLE');
      if (body.action === 'end') {
        if (data.teacherId !== uid || !teacher) throw Error('NOT_TEACHER');
        tx.update(sessionRef, { status: 'ended', endedAt: Timestamp.now() });
        if (typeof data.joinCode === 'string') {
          tx.delete(db.doc('live_session_invites/' + data.joinCode));
        }
      } else if (body.action === 'leave') {
        if (data.teacherId === uid) throw Error('TEACHER_MUST_END');
        tx.update(sessionRef, { ['participants.' + uid]: FieldValue.delete() });
      }
    });
    send(res, 200, { ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'INVALID_INVITATION' || message === 'SESSION_UNAVAILABLE') {
      send(res, 404, { error: 'Classroom session not found, expired, or inaccessible' });
    } else if (message === 'NOT_TEACHER' || message === 'TEACHER_MUST_END') {
      send(res, 403, { error: 'Not permitted' });
    } else if (message === 'SESSION_FULL' || message === 'CODE_COLLISION') {
      send(res, 409, { error: 'Classroom not available, please retry' });
    } else {
      console.error('Classroom session request failed', error);
      send(res, 503, { error: 'Classroom service unavailable' });
    }
  }
}
