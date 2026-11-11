import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const app = read('App.tsx');
const page = read('pages/Whiteboard.tsx');
const archive = read('components/whiteboard/SessionHistoryModal.tsx');
const capture = read('services/mediaRecordingService.ts');
const teacher = read('components/TeacherToolbar.tsx');
const toolbar = read('components/StudentToolbar.tsx');
const cloud = read('services/whiteboardCloud.ts');
const rules = read('firestore.rules');

test('class has a nonenumerable unpredictable join code', () => {
  assert.match(cloud, /crypto\.getRandomValues/);
  assert.match(cloud, /\^QUL-\[0-9A-Z\]\{8\}\$/);
  assert.match(rules, /match \/whiteboard_sessions\/\{code\} \{\s+allow get: if mayReadWhiteboard\(resource\.data\);\s+allow list: if false;/);
  assert.match(rules, /data\.schoolId != 'independent' && belongsToSchool\(data\.schoolId\)/);
  assert.match(page, /getDoc\(boardRef\)/);
});

test('teachers own the only writable board surface, students read cloud snapshots', () => {
  assert.match(rules, /allow update: if whiteboardOwner\(code\)/);
  assert.match(page, /onSnapshot\(boardRef/);
  assert.match(page, /whiteboardCloudPayload\(session, classroomSchoolId\)/);
  assert.match(page, /isReadOnly=\{!isTeacher \|\| !cloudReady\}/);
  assert.match(page, /isWhiteboardPayloadSizeSafe\(payload\)/);
});

test('all 30 students can write to distinct presence and answer document IDs', () => {
  assert.match(rules, /match \/participants\/\{studentId\}/);
  assert.match(rules, /match \/answers\/\{studentId\}/);
  assert.match(rules, /request\.auth\.uid == studentId/);
  assert.match(rules, /request\.resource\.data\.score == 0/);
  assert.match(page, /'participants', user\.uid/);
  assert.match(page, /'answers', user\.uid/);
  assert.match(page, /onSnapshot\(participants/);
  assert.match(page, /onSnapshot\(answers/);
  assert.match(page, /updateDoc\(participantRef/);
});

test('student toolbar performs only supported actions', () => {
  assert.doesNotMatch(app, /console\.log\('Student action:'/);
  assert.match(app, /qul_student_focus_answer/);
  assert.match(app, /qul_student_raise_hand/);
  assert.match(app, /qul_student_submit_answer/);
  assert.match(page, /qul_student_focus_answer/);
  assert.match(page, /qul_student_raise_hand/);
  assert.match(toolbar, /id: 'answer'/);
  assert.match(toolbar, /id: 'hand'/);
  assert.doesNotMatch(toolbar, /id: 'pen'|id: 'image'|id: 'sticky'/);
});

test('answer receipt is shown only after setDoc resolves', () => {
  assert.match(page, /await setDoc\(doc\(db, 'whiteboard_sessions', cloudCode, 'answers', user\.uid\)/);
  assert.match(page, /setStudentAnswerSent\(true\)/);
  assert.match(page, /catch \(error\) \{\s+console\.error\('Whiteboard submission failed:'/);
  assert.match(page, /تم تسجيل الإجابة في الحصة بنجاح/);
  assert.match(page, /جارٍ تسليم الإجابة/);
});

test('teacher controls no longer use the shared global document', () => {
  assert.doesNotMatch(teacher, /doc\(db, 'live_sessions', 'global'\)/);
  assert.match(teacher, /doc\(db, 'live_sessions', user\?\.uid \|\| 'unavailable'\)/);
  assert.match(rules, /allow create, update, delete: if isTeacher\(\) && sessionId == request\.auth\.uid/);
  assert.match(rules, /allow list: if false/);
});

test('fake student roster and fabricated archive records are removed', () => {
  assert.doesNotMatch(page, /'st_1':|studentName: 'سارة محمد'/);
  assert.match(page, /students: \{\s*\}/);
  assert.doesNotMatch(teacher, /s1: \{ name: 'أحمد بن محمد'/);
  assert.doesNotMatch(archive, /QUL-9821|QUL-4412/);
});

test('PNG export captures board DOM layers', () => {
  assert.match(page, /captureWhiteboardScreenshot\(\)/);
  assert.match(capture, /html2canvas\(targetElement/);
});

test.todo('Firebase Emulator proves cross-school, unauthenticated and false-role requests are denied');
test.todo('30 signed-in browsers concurrently submit 30 separate answers and 30 presence records');
test.todo('teacher lock prevents board edits on a second device after reconnect');
test.todo('PDF exports all pages with cards, embedded media and handwriting');
test.todo('desktop, iPhone and iPad preserve touch precision and readable controls');
test.todo('offline reconnect does not lose or duplicate work');

console.log('Whiteboard class protocol regression gates checked. Browser and emulator validation remains pending.');
