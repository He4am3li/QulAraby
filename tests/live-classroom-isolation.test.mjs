import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { roomScope, permittedRoomScope, canResumeRoom, canJoinRoom, ROOM_CAP } from '../api/_classroomAccess.mjs';

let count = 0;
const test = (name, fn) => { fn(); count++; console.log('PASS: ' + name); };
const teacherId = 'teacherA', studentId = 'studentA';
const expiry = { toMillis: () => Date.now() + 60000 };
const session = {
  teacherId, schoolId: 'schoolA', classId: 'grade10A',
  participants: { studentA: true }, status: 'active', expiresAt: expiry
};
test('a class member can resume only their own joined room', () =>
  assert.equal(canResumeRoom(session, studentId, { schoolId: 'schoolA', classId: 'grade10A' }), true));
test('other school cannot resume by guessing a session id', () =>
  assert.equal(canResumeRoom(session, studentId, { schoolId: 'schoolB', classId: 'grade10A' }), false));
test('another class cannot resume by guessing a session id', () =>
  assert.equal(canResumeRoom(session, studentId, { schoolId: 'schoolA', classId: 'grade10B' }), false));
test('a non-participant cannot resume even in the same school and class', () =>
  assert.equal(canResumeRoom(session, 'outsider', { schoolId: 'schoolA', classId: 'grade10A' }), false));
test('teacher can resume their own active classroom', () =>
  assert.equal(canResumeRoom(session, teacherId, { schoolId: 'schoolA' }), true));
test('classroom invitation never authorizes a different school', () =>
  assert.equal(canJoinRoom(session, 'outsider', { schoolId: 'schoolB', classId: 'grade10A' }), false));
test('classroom invitation never authorizes a different class', () =>
  assert.equal(canJoinRoom(session, 'outsider', { schoolId: 'schoolA', classId: 'grade10B' }), false));
test('matching school and class may join with an invitation', () =>
  assert.equal(canJoinRoom(session, 'outsider', { schoolId: 'schoolA', classId: 'grade10A' }), true));
test('expired classroom cannot be resumed', () =>
  assert.equal(canResumeRoom({...session, expiresAt:{ toMillis:()=>Date.now()-1 }}, studentId, {schoolId:'schoolA',classId:'grade10A'}), false));
test('ended classroom cannot accept new members', () =>
  assert.equal(canJoinRoom({...session, status:'ended'}, 'outsider', {schoolId:'schoolA',classId:'grade10A'}), false));
test('member cap applies to unknown students, not existing participants', () => {
  const full = {...session, participants:Object.fromEntries(Array.from({length:ROOM_CAP},(_,i)=>['s'+i,true]))};
  assert.equal(canJoinRoom(full,'outsider',{schoolId:'schoolA',classId:'grade10A'}),false);
  assert.equal(canJoinRoom(full,'s4',{schoolId:'schoolA',classId:'grade10A'}),true);
});
test('independent teachers cannot join a named school room', () =>
  assert.equal(permittedRoomScope({}, session), false));
test('independent students can only join independent scope', () =>
  assert.deepEqual(roomScope({}), { schoolId:'independent',classId:'' }));
const file = path => readFileSync(new URL('../'+path, import.meta.url), 'utf8');
const teacher = file('components/TeacherToolbar.tsx');
const layer = file('components/LiveInteractionLayer.tsx');
const page = file('pages/Whiteboard.tsx');
const app = file('App.tsx');
const api = file('api/live-classroom.ts');
test('all old shared global live session document references removed from active components', () => {
  for (const s of [teacher, layer, page]) assert.doesNotMatch(s,/['"]live_sessions['"]\s*,\s*['"]global['"]/);
});
test('teacher tools and overlay are gated by session membership', () => {
  assert.match(app,/ScopedTeacherToolbar/);
  assert.match(app,/sessionId\s*\?\s*<TeacherToolbar/);
  assert.match(app,/sessionId\s*\?\s*<LiveInteractionLayer/);
});
test('UI does not display a locally generated code as a real classroom invitation', () => {
  assert.doesNotMatch(page, /<span[^>]*>\{session\.code\}<\/span>/);
  assert.match(page, /onClick=\{\(\) => void join\(enteredClassroomCode\)\}/);
});
test('server invitation uses verified token identity and transactions', () => {
  assert.match(api,/requireFirebaseUser\(req,\s*res\)/);
  assert.match(api,/verifyIdToken\(token,\s*true\)/);
  assert.match(api,/db\.runTransaction/);
  assert.match(api,/canJoinRoom\(data,\s*uid,\s*profile\)/);
  assert.match(api,/participants\.' \+ uid/);
  assert.match(api,/status:\s*'ended'/);
});
console.log('Isolated classroom policy tests passed: ' + count);
