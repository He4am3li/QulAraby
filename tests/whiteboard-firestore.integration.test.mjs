import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, getDoc, getDocs, collection } from 'firebase/firestore';

const projectId = 'demo-qul-whiteboard-security';
const code = 'QUL-ABC12345';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const environment = await initializeTestEnvironment({
  projectId,
  firestore: { rules, host: '127.0.0.1', port: 8080 },
});
after(async () => { await environment.cleanup(); });

const users = [
  ['teacherA', 'teacher-a@example.com', 'teacher', 'schoolA', true],
  ['teacherB', 'teacher-b@example.com', 'teacher', 'schoolB', true],
  ['studentA', 'student-a@example.com', 'student', 'schoolA', true],
  ['studentB', 'student-b@example.com', 'student', 'schoolB', true],
  ['studentUnapproved', 'unapproved@example.com', 'student', 'schoolA', false],
];

await environment.withSecurityRulesDisabled(async context => {
  for (const [uid, email, role, schoolId, approved] of users) {
    await setDoc(doc(context.firestore(), 'users', uid), { uid, email, role, schoolId, approved });
  }
});

const asUser = (uid, email) => environment.authenticatedContext(uid, { email, email_verified: true }).firestore();
const teacherA = asUser('teacherA', 'teacher-a@example.com');
const teacherB = asUser('teacherB', 'teacher-b@example.com');
const studentA = asUser('studentA', 'student-a@example.com');
const studentB = asUser('studentB', 'student-b@example.com');
const unapproved = asUser('studentUnapproved', 'unapproved@example.com');

const classroom = {
  code,
  id: code,
  teacherId: 'teacherA',
  teacherName: 'Teacher A',
  schoolId: 'schoolA',
  pages: [{ id: 'page1', elements: [], background: 'blackboard_slate', title: 'Page 1' }],
  isLocked: false,
  activeActivity: {
    id: 'activity1', question: 'اكتب جملة عن المدرسة', title: 'نشاط الحصة',
    type: 'qa', isActive: true, submissions: {},
  },
};

test('teacher owns class; school A student reads by code; school B cannot read', async () => {
  await assertSucceeds(setDoc(doc(teacherA, 'whiteboard_sessions', code), classroom));
  await assertSucceeds(getDoc(doc(studentA, 'whiteboard_sessions', code)));
  await assertFails(getDoc(doc(studentB, 'whiteboard_sessions', code)));
  await assertFails(getDoc(doc(unapproved, 'whiteboard_sessions', code)));
  await assertFails(getDocs(collection(studentA, 'whiteboard_sessions')));
  await assertFails(updateDoc(doc(teacherB, 'whiteboard_sessions', code), { isLocked: true }));
  await assertFails(updateDoc(doc(studentA, 'whiteboard_sessions', code), { pages: [] }));
  await assertSucceeds(updateDoc(doc(teacherA, 'whiteboard_sessions', code), { isLocked: true }));
});

test('separate presence documents prevent student score forgery and cross-school writes', async () => {
  const path = ['whiteboard_sessions', code, 'participants', 'studentA'];
  await assertSucceeds(setDoc(doc(studentA, ...path), {
    id: 'studentA', name: 'Student A', score: 0, handRaised: false,
    isOnline: true, lastActive: Date.now(),
  }));
  await assertSucceeds(updateDoc(doc(studentA, ...path), { handRaised: true, lastActive: Date.now() }));
  await assertFails(updateDoc(doc(studentA, ...path), { score: 500 }));
  await assertFails(updateDoc(doc(studentB, ...path), { handRaised: false }));
  await assertSucceeds(updateDoc(doc(teacherA, ...path), { score: 1 }));
  await assertSucceeds(getDocs(collection(teacherA, 'whiteboard_sessions', code, 'participants')));
  await assertFails(getDocs(collection(studentA, 'whiteboard_sessions', code, 'participants')));
});

test('answers belong to their own learner and active activity', async () => {
  const path = ['whiteboard_sessions', code, 'answers', 'studentA'];
  await assertSucceeds(setDoc(doc(studentA, ...path), {
    studentId: 'studentA', studentName: 'Student A',
    activityId: 'activity1', answer: 'هذه مدرستي', timestamp: Date.now(),
  }));
  await assertFails(setDoc(doc(studentB, ...path), {
    studentId: 'studentA', studentName: 'Student B',
    activityId: 'activity1', answer: 'سرقة إجابة', timestamp: Date.now(),
  }));
  await assertFails(updateDoc(doc(studentA, ...path), { evaluated: true, score: 100 }));
  await assertSucceeds(getDocs(collection(teacherA, 'whiteboard_sessions', code, 'answers')));
  await assertFails(getDocs(collection(studentB, 'whiteboard_sessions', code, 'answers')));
  await assertSucceeds(updateDoc(doc(teacherA, ...path), { feedback: 'ممتاز', evaluated: true }));
});

test('students cannot read or overwrite legacy teacher toolbar documents', async () => {
  await assertSucceeds(setDoc(doc(teacherA, 'live_sessions', 'teacherA'), { activeTool: 'pen' }));
  await assertFails(getDoc(doc(studentA, 'live_sessions', 'teacherA')));
  await assertFails(getDoc(doc(teacherB, 'live_sessions', 'teacherA')));
  await assertFails(setDoc(doc(studentA, 'live_sessions', 'global'), { poll: { votes: {} } }));
  await assertSucceeds(updateDoc(doc(teacherA, 'live_sessions', 'teacherA'), { activeTool: 'text' }));
});

test('only the owner can resolve their latest classroom from another device', async () => {
  const indexPath = ['whiteboard_teacher_index', 'teacherA'];
  await assertSucceeds(getDoc(doc(teacherA, ...indexPath)));
  await assertSucceeds(setDoc(doc(teacherA, ...indexPath), {
    teacherId: 'teacherA', schoolId: 'schoolA', sessionCode: code,
  }));
  await assertFails(getDoc(doc(studentA, ...indexPath)));
  await assertFails(getDoc(doc(teacherB, ...indexPath)));
  await assertFails(getDocs(collection(teacherA, 'whiteboard_teacher_index')));
  await assertFails(setDoc(doc(teacherB, 'whiteboard_teacher_index', 'teacherB'), {
    teacherId: 'teacherB', schoolId: 'schoolA', sessionCode: code,
  }));
});

test('30 verified classroom identities submit independently without overwriting another learner', async () => {
  const classSize = 30;
  await environment.withSecurityRulesDisabled(async context => {
    const writes = [];
    for (let i = 1; i <= classSize; i += 1) {
      const uid = 'classStudent' + String(i).padStart(2, '0');
      const email = uid.toLowerCase() + '@example.com';
      writes.push(setDoc(doc(context.firestore(), 'users', uid), {
        uid, email, role: 'student', schoolId: 'schoolA', approved: true,
      }));
    }
    await Promise.all(writes);
  });
  const writes = [];
  for (let i = 1; i <= classSize; i += 1) {
    const uid = 'classStudent' + String(i).padStart(2, '0');
    const email = uid.toLowerCase() + '@example.com';
    const student = asUser(uid, email);
    writes.push(assertSucceeds(setDoc(doc(student, 'whiteboard_sessions', code, 'participants', uid), {
      id: uid, name: uid, score: 0, handRaised: false, isOnline: true, lastActive: Date.now(),
    })));
    writes.push(assertSucceeds(setDoc(doc(student, 'whiteboard_sessions', code, 'answers', uid), {
      studentId: uid, studentName: uid, answer: 'إجابة مستقلة رقم ' + i,
      activityId: 'activity1', timestamp: Date.now(),
    })));
  }
  await Promise.all(writes);
  const participants = await assertSucceeds(getDocs(collection(teacherA, 'whiteboard_sessions', code, 'participants')));
  const answers = await assertSucceeds(getDocs(collection(teacherA, 'whiteboard_sessions', code, 'answers')));
  assert.ok(participants.size >= classSize, 'All 30 learner presence documents must persist');
  assert.ok(answers.size >= classSize, 'All 30 learner answers must persist');
  const observed = new Set(answers.docs.map(item => item.id));
  for (let i = 1; i <= classSize; i += 1) {
    assert.ok(observed.has('classStudent' + String(i).padStart(2, '0')));
  }
});

test('reject outsider attempts to create or enumerate another classroom', async () => {
  await assertFails(setDoc(doc(teacherB, 'whiteboard_sessions', 'QUL-CCCCCCCC'), {
    ...classroom, code: 'QUL-CCCCCCCC', id: 'QUL-CCCCCCCC', schoolId: 'schoolA',
    teacherId: 'teacherB',
  }));
  await assertFails(setDoc(doc(studentA, 'whiteboard_sessions', 'QUL-DDDDDDDD'), {
    ...classroom, code: 'QUL-DDDDDDDD', id: 'QUL-DDDDDDDD', teacherId: 'studentA',
  }));
  assert.ok(true);
});
