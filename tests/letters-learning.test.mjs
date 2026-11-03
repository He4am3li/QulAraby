/**
 * Regression checks for the Arabic letters module.
 * Run: npm run test:letters
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeLetterKey, letterCanvasPoint, normalizeAssessmentScore } from '../utils/letterLearning.js';

const src = readFileSync(new URL('../pages/Letters.tsx', import.meta.url), 'utf8');
const inbox = readFileSync(new URL('../components/LetterHomeworkInboxModal.tsx', import.meta.url), 'utf8');
const alphabet = src.slice(src.indexOf('const ALPHABET = ['), src.indexOf('];', src.indexOf('const ALPHABET = [')));
const alphabetEntries = [...alphabet.matchAll(/char: '([^']+)'/g)].map(m => m[1]);

assert.equal(alphabetEntries.length, 28, 'Alphabet must contain 28 letters');
assert.equal(new Set(alphabetEntries).size, 28, 'Alphabet must not contain duplicate entries');
assert.ok(alphabetEntries.includes('هـ'), 'Haa must be present');
assert.equal(normalizeLetterKey('هـ'), 'هـ', 'Haa presentation form must match data keys');
assert.equal(normalizeLetterKey('ه'), 'هـ', 'Haa without a tatweel must match data keys');
assert.equal(normalizeLetterKey('ـبـ'), 'ب');
assert.equal(normalizeLetterKey('ـق'), 'ق');
assert.equal((src.match(/const cleanChar = normalizeLetterKey\(char\);/g) || []).length, 3,
  'Auditory, word-discrimination and tashkeel games should use the same letter keys');

const removeTashkeel = word => word.replace(/[\u064B-\u065F\u0670]/g, '');
const words = src.slice(src.indexOf('const LETTER_WORDS'), src.indexOf('const WordDiscriminationGame'));
let wordCount = 0;
let letter = null;
for (const line of words.split('\n')) {
  const heading = line.match(/^  '([^']+)': \{/);
  if (heading) letter = heading[1];
  const match = line.match(/\{ word: '([^']+)', position: '(initial|medial|final)'/);
  if (!match) continue;
  const strippedWord = removeTashkeel(match[1]);
  const key = letter === 'هـ' ? 'ه' : letter;
  const at = strippedWord.indexOf(key);
  assert.ok(at >= 0, `${letter}: example ${match[1]} must contain its letter`);
  const actual = at === 0 ? 'initial' : at === strippedWord.length - 1 ? 'final' : 'medial';
  assert.equal(match[2], actual, `${letter}: ${match[1]} must really be in ${match[2]} position`);
  wordCount++;
}
assert.equal(wordCount, 112, 'All 28 letters need four position examples');

const diacritics = src.slice(src.indexOf('const TASHKEEL_WORDS'), src.indexOf('const WordTashkeelGame'));
let diacriticCount = 0;
for (const [, kind, word, markedLetter] of diacritics.matchAll(/^\s{4}(fatha|damma|kasra|sukoon): \{ word: '([^']+)', charWithDiacritic: '([^']+)'/gm)) {
  assert.ok(word.includes(markedLetter),
    `${kind}: example ${word} must actually contain ${markedLetter}`);
  diacriticCount++;
}
assert.equal(diacriticCount, 112, 'All 28 letters need four correctly marked examples');

assert.deepEqual(letterCanvasPoint(150, 60, { left: 100, top: 10, width: 200, height: 100 }, 800, 200), { x: 200, y: 100 });
const scaledPoint = letterCanvasPoint(300, 210, { left: 100, top: 10, width: 200, height: 200 }, 850, 220);
assert.ok(Math.abs(scaledPoint.x - 850) < 1e-7 && Math.abs(scaledPoint.y - 220) < 1e-7,
  'Canvas coordinates should agree within floating-point precision');
assert.match(src, /onPointerDown=\{startDrawing\}/);
assert.match(src, /onPointerMove=\{draw\}/);
assert.match(src, /onPointerCancel=\{stopDrawing\}/);
assert.match(src, /hasStrokesRef\.current/);
assert.ok(!src.includes('onTouchMove={draw}'), 'Do not mix touch and mouse drawing handlers');

assert.equal(normalizeAssessmentScore(87), 87);
assert.equal(normalizeAssessmentScore(0), 0);
assert.equal(normalizeAssessmentScore(105), 100);
assert.equal(normalizeAssessmentScore(-5), 0);
assert.equal(normalizeAssessmentScore(undefined), null);
assert.equal(normalizeAssessmentScore('95'), null);
assert.ok(src.includes('normalizeAssessmentScore(result.score)'));
assert.ok(!src.includes('result.passed ? 95 : 75'));
assert.ok(!src.includes('teacherGrade: result.passed ? 5 : 4'));
assert.ok(!inbox.includes('sub.aiFeedback.score || 90'));
assert.ok(inbox.includes('disabled={isSaving || grade === 0}'));
assert.ok(inbox.includes('setGrade(currentSub.teacherGrade ?? 0)'));

console.log(`Letters OK: ${alphabetEntries.length} letters, ${wordCount} position examples, ${diacriticCount} marked examples, pointer and grading checks.`);
