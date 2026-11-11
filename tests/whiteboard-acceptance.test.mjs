import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const app = read('App.tsx');
const page = read('pages/Whiteboard.tsx');
const archive = read('components/whiteboard/SessionHistoryModal.tsx');
const capture = read('services/mediaRecordingService.ts');
const teacher = read('components/TeacherToolbar.tsx');
const rules = read('firestore.rules');

test('student tools are routed to active whiteboard controls', () => {
  assert.doesNotMatch(app, /console\.log\('Student action:'/);
  assert.match(app, /qul_set_whiteboard_tool/);
  assert.match(app, /qul_open_whiteboard_media/);
  assert.match(app, /qul_student_submit_answer/);
  assert.match(page, /qul_open_whiteboard_media/);
  assert.match(page, /qul_student_submit_answer/);
});

test('teacher lock is reflected in the canvas local permission', () => {
  assert.match(teacher, /qul_whiteboard_toggle_lock/);
  assert.match(page, /addEventListener\('qul_whiteboard_toggle_lock'/);
  assert.match(page, /isReadOnly=\{!isTeacher && session\.isLocked\}/);
});

test('no fabricated class roster, answers, or archive records appear by default', () => {
  assert.doesNotMatch(page, /'st_1':|studentName: 'سارة محمد'/);
  assert.match(page, /students: \{\s*\}/);
  assert.match(page, /isActive: false,\s*submissions: \{\}/);
  assert.doesNotMatch(archive, /QUL-9821|QUL-4412/);
});

test('student action never promises remote receipt for a local-only submission', () => {
  assert.doesNotMatch(page, /تم إرسال إجابتك بنجاح إلى المعلم!/);
  assert.match(page, /لم تصل إلى المعلم بعد/);
  assert.match(page, /!session\.activeActivity\?\.isActive/);
});

test('PNG export uses a full layered DOM capture, not the drawing canvas alone', () => {
  assert.match(page, /captureWhiteboardScreenshot\(\)/);
  assert.match(capture, /html2canvas\(targetElement/);
  assert.match(capture, /#whiteboard-canvas-container/);
});

test('current architecture blockers remain explicitly tracked', () => {
  // A passing test here does NOT mean these requirements work.
  // This describes why live multi-client acceptance is still blocked.
  assert.match(page, /qul_active_whiteboard_session/);
  assert.match(teacher, /'live_sessions', 'global'/);
  assert.match(rules, /match \/live_sessions\/\{sessionId\}/);
});

test.todo('30 signed-in browser clients receive one class session and 30 distinct acknowledgements');
test.todo('teacher from school A cannot read or change school B class session');
test.todo('teacher lock prevents edits from a second device after reconnect');
test.todo('PDF exports all pages with cards, embedded media and handwriting');
test.todo('desktop, iPhone and iPad preserve canvas hit-testing and readable controls');
test.todo('offline reconnect reconciles strokes and submissions without losing or duplicating work');

console.log('Whiteboard local regression gates checked. Multi-client items remain unverified.');
