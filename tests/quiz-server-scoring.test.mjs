import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gradeQuestions, publicQuestion } from '../api/_quizGrading.mjs';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
let checks = 0;
function check(label, fn) {
  try { fn(); checks++; console.log('PASS: ' + label); }
  catch (error) { console.error('FAIL: ' + label); throw error; }
}
const q = [
  { id: 'q1', data: { type: 'mcq', text: '١', options: ['صح', 'خطأ'], points: 2, correctAnswer: 'صح', feedback: 'Private explanation' } },
  { id: 'q2', data: { type: 'true_false', text: '٢', options: ['صح','خطأ'], points: 1, correctAnswer: 'خطأ' } },
  { id: 'q3', data: { type: 'ordering', text: '٣', options: ['ب', 'أ'], points: 3, correctAnswer: 'أ|ب' } },
  { id: 'q4', data: { type: 'short_answer', text: '٤', options: [], points: 4, correctAnswer: 'المَدرَسَة' } },
  { id: 'q5', data: { type: 'chess_puzzle', text: '٥', options: [], points: 5, correctAnswer: 'CHESS_MASTERED', chessConfig: { boardSize: 3, gridData: [], initialPos: {x:0,y:0}, targetPos: {x:2,y:1}, pieceType:'knight' } } }
];
check('public question excludes correctAnswer and explanation', () => {
  const view = publicQuestion('q1', q[0].data);
  assert.equal(view.text, '١');
  assert.equal(view.correctAnswer, undefined);
  assert.equal(view.feedback, undefined);
  assert.deepEqual(new Set(view.options), new Set(['صح', 'خطأ']));
  assert.deepEqual(Object.keys(view).sort(), ['id','options','points','text','type']);
});
check('server awards correct answers without trusting submitted score', () => {
  const output = gradeQuestions(q, { q1: 'صح', q2: 'خطأ', q3:['أ','ب'], q4:'المَدرَسَة', q5:'CHESS_MASTERED' });
  assert.equal(output.score, 10);
  assert.equal(output.totalPoints, 15);
  assert.equal(output.correctCount, 4);
});
check('wrong order is not credited', () => {
  assert.equal(gradeQuestions(q, {q3:['ب','أ']}).score, 0);
});
check('answer map cannot inject unknown question IDs', () => {
  assert.throws(() => gradeQuestions(q, { adminScore: 999999 }), /INVALID_ANSWERS/);
});
check('chess flag from browser cannot earn points', () => {
  assert.equal(gradeQuestions(q, { q5:'CHESS_MASTERED' }).score, 0);
});
check('forged client point bonus and score are ignored', () => {
  assert.throws(() => gradeQuestions(q, {q1:'خطأ', score:1000}), /INVALID_ANSWERS/);
});
check('invalid oversized text is rejected as incorrect', () => {
  assert.equal(gradeQuestions(q, { q4:'x'.repeat(5001) }).score, 0);
});
check('multiple-choice requires actual stored correct answer', () => {
  assert.equal(gradeQuestions(q, {q1:'خطأ'}).score, 0);
  assert.equal(gradeQuestions(q, {q1:' صح '}).score, 2);
});
check('public chess fields do not expose private keys', () => {
  const obj = publicQuestion('q5', { ...q[4].data, solution:'secret' });
  assert.equal(obj.solution, undefined);
  assert.equal(obj.correctAnswer, undefined);
  assert.equal(obj.chessConfig.boardSize, 3);
});
check('no points are awarded for invalid points field', () => {
  assert.equal(gradeQuestions([{id:'s',data:{type:'mcq',correctAnswer:'yes',points:100000}}],{s:'yes'}).score,0);
});
const player = read('components/QuizPlayer.tsx');
const page = read('pages/Quizzes.tsx');
const endpoint = read('api/quiz-play.ts');
check('student does not fetch direct question documents or answer keys', () => {
  assert.doesNotMatch(player, /correctAnswer/);
  assert.doesNotMatch(player, /getDocs\s*\(/);
  assert.match(player, /action:\s*'start'/);
});
check('score is authoritative server response, not client value', () => {
  assert.match(player, /action:\s*'submit'/);
  assert.match(player, /setScore\(data.score\)/);
  assert.doesNotMatch(player, /addDoc\(collection\(db,\s*'quizzes'/);
});
check('join code resolved by server, not Firestore browser query', () => {
  assert.match(page, /action:\s*'lookup'/);
  assert.doesNotMatch(page.slice(page.indexOf('const handleStartSolving'), page.indexOf('const \[filter')), /where\('joinCode'/);
});
check('API requires verified Firebase approval, locks attempt, grades on server', () => {
  assert.match(endpoint, /requireFirebaseUser\(req,\s*res\)/);
  assert.match(endpoint, /tx.update\(attemptRef,\s*\{\s*state:\s*'submitted'/);
  assert.match(endpoint, /gradeQuestions\(/);
  assert.match(endpoint, /verifyIdToken\(token,\s*true\)/);
  assert.match(endpoint, /userId:\s*uid/);
  assert.match(endpoint, /userEmail:\s*verified.email/);
});
console.log('Server-side quiz security tests passed: ' + checks);
