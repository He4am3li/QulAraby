import { createHash } from 'node:crypto';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { checkGatewayQuota, readGatewayBody, requireFirebaseUser, type GatewayRequest, type GatewayResponse } from './_geminiAuth.js';
import { canDirect, canSupport, canViewAnnouncement, isOwner, validProfile, OWNER_EMAIL } from './_wesalPolicy.mjs';

const DATABASE = 'ai-studio-d8ed89a2-6662-4aa5-9cc7-1e8d0693722e';
const USER_ID = /^[A-Za-z0-9_-]{6,128}$/;
const RECORD_ID = /^[A-Za-z0-9_-]{8,128}$/;
type Profile = { uid: string; email: string; role: string; approved?: boolean; schoolId?: string; classId?: string; displayName?: string };
type Contact = { uid: string; name: string; role: string; kind: 'direct' | 'support' };

function output(res: GatewayResponse, status: number, payload: Record<string, unknown>): void {
  res.statusCode = status;
  res.end(JSON.stringify(payload));
}

function services() {
  const app = getApps().find(item => item.name === 'qul-gemini-gateway');
  if (!app) throw Error('SERVICE_UNAVAILABLE');
  return { db: getFirestore(app, DATABASE), auth: getAuth(app) };
}

async function profileOf(db: ReturnType<typeof getFirestore>, uid: string): Promise<Profile | null> {
  if (!USER_ID.test(uid)) return null;
  const snap = await db.collection('users').doc(uid).get();
  if (!snap.exists) return null;
  const p = { ...snap.data(), uid: snap.id } as Profile;
  return validProfile(p) ? p : null;
}

function schoolOf(a: Profile, b: Profile, kind: string): string {
  return kind === 'support' ? String(isOwner(a) ? b.schoolId : a.schoolId) : String(a.schoolId);
}

function threadKey(schoolId: string, kind: string, a: string, b: string): string {
  return createHash('sha256').update(JSON.stringify([schoolId, kind, ...[a, b].sort()])).digest('hex').slice(0, 48);
}

function displayName(p: Profile, kind: 'direct' | 'support'): string {
  return kind === 'support' && isOwner(p) ? 'دعم قُل' :
    String(p.displayName || (p.role === 'schoolAdmin' ? 'إدارة المدرسة' : p.role === 'teacher' ? 'المعلم' : 'مستخدم قُل')).slice(0, 80);
}

function compactProfile(p: Profile): { uid: string; name: string; role: string } {
  return { uid: p.uid, name: String(p.displayName || 'مستخدم قُل').slice(0, 80), role: p.role };
}

function classroomFor(a: Profile, b: Profile, classrooms: Map<string, { id: string; teacherId: string }>) {
  return classrooms.get(String(a.role === 'student' ? a.classId : b.role === 'student' ? b.classId : '')) || null;
}

function authorized(a: Profile, b: Profile, kind: string, classrooms: Map<string, { id: string; teacherId: string }>): boolean {
  if (kind === 'support') return canSupport(a, b);
  if (kind === 'direct') return canDirect(a, b, classroomFor(a, b, classrooms));
  return false;
}

function normalText(value: unknown, max: number): string {
  if (typeof value !== 'string') throw Error('INVALID_MESSAGE');
  const clean = value.replace(/\r\n/g, '\n').trim();
  if (!clean || clean.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(clean)) throw Error('INVALID_MESSAGE');
  return clean;
}

/** Simple authenticated JSON API. All Firestore operations use the server-side named database.
 * No client-side Firestore rules are weakened to support messaging.
 */
export default async function handler(req: GatewayRequest, res: GatewayResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    output(res, 405, { error: 'Method not allowed' });
    return;
  }
  try {
    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
    const host = typeof req.headers.host === 'string' ? req.headers.host : '';
    if (origin) {
      const parsed = new URL(origin);
      if (parsed.host !== host || !['https:', ...(host.startsWith('localhost:') ? ['http:'] : [])].includes(parsed.protocol)) {
        output(res, 403, { error: 'Forbidden origin' }); return;
      }
    }
  } catch {
    output(res, 403, { error: 'Forbidden origin' }); return;
  }

  const uid = await requireFirebaseUser(req, res);
  if (!uid || !checkGatewayQuota(uid, res, 90)) return;
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
    output(res, 415, { error: 'JSON required' }); return;
  }
  let body: Record<string, unknown>;
  try {
    const raw = await readGatewayBody(req, 5000);
    body = JSON.parse(raw.toString('utf8'));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw Error('INVALID_JSON');
  } catch { output(res, 400, { error: 'Invalid request' }); return; }

  try {
    const { db, auth } = services();
    const token = String(req.headers.authorization || '').replace(/^Bearer /, '');
    const decoded = await auth.verifyIdToken(token, true);
    const me = await profileOf(db, uid);
    if (!me || decoded.uid !== me.uid || decoded.email_verified !== true ||
        decoded.email?.toLowerCase() !== me.email.toLowerCase()) {
      output(res, 403, { error: 'Verified, approved account required' }); return;
    }
    const schoolId = typeof me.schoolId === 'string' && me.schoolId !== '__demo__' ? me.schoolId : '';
    const classes = new Map<string, { id: string; teacherId: string }>();
    if (schoolId && !isOwner(me)) {
      const snapshots = await db.collection('schools').doc(schoolId).collection('classes').limit(160).get();
      for (const doc of snapshots.docs) classes.set(doc.id, { id: doc.id, teacherId: String(doc.data().teacherId || '') });
    }

    const action = body.action;
    if (action === 'bootstrap') {
      let users: Profile[] = [];
      if (isOwner(me)) {
        const snap = await db.collection('users').where('role', '==', 'schoolAdmin').limit(120).get();
        users = snap.docs.map(d => ({ ...d.data(), uid: d.id } as Profile)).filter(validProfile);
      } else if (schoolId) {
        const snap = await db.collection('users').where('schoolId', '==', schoolId).limit(500).get();
        users = snap.docs.map(d => ({ ...d.data(), uid: d.id } as Profile)).filter(validProfile);
        if (me.role === 'schoolAdmin') {
          const ownerSnap = await db.collection('users').where('email', '==', OWNER_EMAIL).limit(1).get();
          users.push(...ownerSnap.docs.map(d => ({ ...d.data(), uid: d.id } as Profile)).filter(validProfile));
        }
      }
      const contacts: Contact[] = [];
      for (const other of users) {
        if (other.uid === uid) continue;
        const kind = canSupport(me, other) ? 'support' : 'direct';
        if (authorized(me, other, kind, classes)) contacts.push({ uid: other.uid, name: displayName(other, kind), role: other.role, kind });
      }
      contacts.sort((a, b) => a.kind === b.kind ? a.name.localeCompare(b.name, 'ar') : (a.kind === 'support' ? -1 : 1));

      const snap = await db.collection('wesal_threads').where('members', 'array-contains', uid).limit(90).get();
      const cached = new Map<string, Profile>();
      users.forEach(p => cached.set(p.uid, p));
      const threads: Record<string, unknown>[] = [];
      for (const thread of snap.docs) {
        const value = thread.data();
        if (!Array.isArray(value.members) || value.members.length !== 2 || !value.members.includes(uid)) continue;
        const peerId = value.members.find((p: unknown) => p !== uid);
        if (typeof peerId !== 'string' || !USER_ID.test(peerId)) continue;
        const peer = cached.get(peerId) || await profileOf(db, peerId);
        if (!peer || !authorized(me, peer, value.kind, classes) || value.schoolId !== schoolOf(me, peer, value.kind)) continue;
        threads.push({
          id: thread.id, peerUid: peerId, peerName: displayName(peer, value.kind), peerRole: peer.role,
          kind: value.kind, lastText: String(value.lastText || '').slice(0, 140),
          lastAt: Number(value.lastAt?.toMillis?.() || 0),
          unread: Array.isArray(value.unreadFor) && value.unreadFor.includes(uid),
        });
      }
      threads.sort((a, b) => Number(b.lastAt) - Number(a.lastAt));

      const announcements: Record<string, unknown>[] = [];
      if (schoolId && !isOwner(me)) {
        const snapA = await db.collection('wesal_announcements').where('schoolId', '==', schoolId).limit(90).get();
        for (const document of snapA.docs) {
          const a = document.data();
          if (!canViewAnnouncement(me, a, classes.get(String(a.classId || '')))) continue;
          announcements.push({
            id: document.id, title: String(a.title || '').slice(0, 90),
            body: String(a.body || '').slice(0, 800), audience: a.audience,
            createdAt: Number(a.createdAt?.toMillis?.() || 0),
            authorName: String(a.authorName || 'إدارة المدرسة').slice(0, 80),
            readCount: Array.isArray(a.readBy) ? a.readBy.length : 0,
            seen: Array.isArray(a.readBy) && a.readBy.includes(uid),
          });
        }
      }
      announcements.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
      output(res, 200, {
        me: compactProfile(me), contacts, threads, announcements,
        unreadCount: threads.filter(t => t.unread).length,
        guardianAvailable: false,
        schoolLinked: !!schoolId || isOwner(me),
      });
      return;
    }

    if (action === 'send') {
      const targetUid = body.targetUid;
      const kind = body.kind;
      if (typeof targetUid !== 'string' || !USER_ID.test(targetUid) || (kind !== 'direct' && kind !== 'support')) {
        output(res, 400, { error: 'Invalid recipient' }); return;
      }
      const peer = await profileOf(db, targetUid);
      if (!peer || !authorized(me, peer, kind, classes)) {
        output(res, 403, { error: 'This recipient is not available to your account' }); return;
      }
      const content = normalText(body.text, 1100);
      const pairSchool = schoolOf(me, peer, kind);
      if (!pairSchool) { output(res, 403, { error: 'School link required' }); return; }
      const threadId = threadKey(pairSchool, kind, uid, peer.uid);
      const ref = db.collection('wesal_threads').doc(threadId);
      const msgRef = ref.collection('messages').doc();
      const now = Timestamp.now();
      await db.runTransaction(async tx => {
        const old = await tx.get(ref);
        if (old.exists) {
          const d = old.data()!;
          if (d.schoolId !== pairSchool || d.kind !== kind ||
              !Array.isArray(d.members) || d.members.length !== 2 || !d.members.includes(uid) || !d.members.includes(peer.uid)) throw Error('FORBIDDEN');
          if (d.lastSenderUid === uid && now.toMillis() - Number(d.lastAt?.toMillis?.() || 0) < 850) throw Error('RATE_LIMIT');
          tx.update(ref, { lastText: content.slice(0, 140), lastSenderUid: uid, lastAt: now, unreadFor: [peer.uid] });
        } else {
          tx.create(ref, {
            schoolId: pairSchool, kind, members: [uid, peer.uid].sort(),
            createdAt: now, lastAt: now, lastSenderUid: uid,
            lastText: content.slice(0, 140), unreadFor: [peer.uid],
          });
        }
        tx.create(msgRef, { senderUid: uid, text: content, createdAt: now });
      });
      output(res, 200, { sent: true, threadId, message: { id: msgRef.id, senderUid: uid, text: content, createdAt: now.toMillis() } });
      return;
    }

    if (action === 'history') {
      const threadId = body.threadId;
      if (typeof threadId !== 'string' || !/^[a-f0-9]{48}$/.test(threadId)) {
        output(res, 400, { error: 'Invalid thread' }); return;
      }
      const ref = db.collection('wesal_threads').doc(threadId);
      const snapshot = await ref.get();
      const thread = snapshot.data();
      if (!thread || !Array.isArray(thread.members) || thread.members.length !== 2 || !thread.members.includes(uid)) {
        output(res, 404, { error: 'Conversation not found' }); return;
      }
      const peerId = thread.members.find((id: unknown) => id !== uid);
      const peer = typeof peerId === 'string' ? await profileOf(db, peerId) : null;
      if (!peer || !authorized(me, peer, thread.kind, classes) || thread.schoolId !== schoolOf(me, peer, thread.kind)) {
        output(res, 403, { error: 'Conversation access unavailable' }); return;
      }
      const messages = await ref.collection('messages').orderBy('createdAt', 'desc').limit(80).get();
      if (Array.isArray(thread.unreadFor) && thread.unreadFor.includes(uid)) {
        await ref.update({ unreadFor: FieldValue.arrayRemove(uid) });
      }
      output(res, 200, {
        threadId, messages: messages.docs.reverse().map(d => ({
          id: d.id, text: String(d.data().text || '').slice(0, 1100),
          senderUid: d.data().senderUid,
          createdAt: Number(d.data().createdAt?.toMillis?.() || 0),
        })),
      });
      return;
    }

    if (action === 'announce') {
      const audience = body.audience;
      const classId = body.classId;
      let allowed = false;
      if (me.role === 'schoolAdmin' && audience === 'teachers' && schoolId) allowed = true;
      if (me.role === 'teacher' && audience === 'class' && schoolId && typeof classId === 'string' && classes.get(classId)?.teacherId === uid) allowed = true;
      if (!allowed) { output(res, 403, { error: 'Announcement is not permitted for your role' }); return; }
      const title = normalText(body.title, 85);
      const content = normalText(body.text, 750);
      const ref = db.collection('wesal_announcements').doc();
      await ref.set({
        schoolId, audience, classId: audience === 'class' ? classId : '',
        title, body: content, authorUid: uid,
        authorName: String(me.displayName || 'إدارة المدرسة').slice(0, 80),
        createdAt: Timestamp.now(), readBy: [uid],
      });
      output(res, 200, { created: true, id: ref.id });
      return;
    }

    if (action === 'ack') {
      const id = body.id;
      if (typeof id !== 'string' || !RECORD_ID.test(id) || !schoolId) {
        output(res, 400, { error: 'Invalid announcement' }); return;
      }
      const ref = db.collection('wesal_announcements').doc(id);
      const a = await ref.get();
      if (!a.exists || !canViewAnnouncement(me, a.data(), classes.get(String(a.data()?.classId || '')))) {
        output(res, 403, { error: 'Announcement access unavailable' }); return;
      }
      await ref.update({ readBy: FieldValue.arrayUnion(uid) });
      output(res, 200, { seen: true });
      return;
    }

    output(res, 400, { error: 'Unknown request action' });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'INVALID_MESSAGE') output(res, 400, { error: 'اكتب رسالة مختصرة وصحيحة.' });
    else if (code === 'RATE_LIMIT') output(res, 429, { error: 'أرسل رسالة واحدة كل لحظة من فضلك.' });
    else if (code === 'FORBIDDEN') output(res, 403, { error: 'غير مسموح بهذه المحادثة.' });
    else {
      // Never log students' message text, authentication tokens, or recipient identities.
      console.error('Wesal operation unavailable:', code.slice(0, 100));
      output(res, 503, { error: 'تعذر الاتصال بخدمة وِصال حاليًا. حاول مرة أخرى.' });
    }
  }
}