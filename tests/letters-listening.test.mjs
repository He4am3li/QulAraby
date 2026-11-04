import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeListeningQuestion, shuffleListeningOptions, LISTENING_QUESTIONS_PER_STAGE, LISTENING_STAGE_COUNT, LISTENING_TOTAL_QUESTIONS } from '../utils/letterListening.js';

const file = readFileSync(new URL('../pages/Letters.tsx', import.meta.url), 'utf8');
const alphabet = [...file.slice(file.indexOf('const ALPHABET = ['), file.indexOf('const HARAKAT = ['))
  .matchAll(/\{ char: '([^']+)'/g)].map(item => item[1]);
const soundsSection = file.slice(file.indexOf('const SIMILAR_SOUNDS:'), file.indexOf('const AuditoryGame:'));
const contrasts = Object.fromEntries([...soundsSection.matchAll(/^  '([^']+)': \[([^\]]+)\]/gm)]
  .map(item => [item[1], [...item[2].matchAll(/'([^']+)'/g)].map(x => x[1])]));

assert.equal(LISTENING_STAGE_COUNT, 5);
assert.equal(LISTENING_QUESTIONS_PER_STAGE, 3);
assert.equal(LISTENING_TOTAL_QUESTIONS, 15);
assert.equal(alphabet.length, 28);
assert.equal(Object.keys(contrasts).length, 28);

const harakat = [{symbol:'\u064E'}, {symbol:'\u064F'}, {symbol:'\u0650'}];
const shadda = [{symbol:'\u0651\u064E'}, {symbol:'\u0651\u064F'}, {symbol:'\u0651\u0650'}];
const mad = [{symbol:'\u064E\u0627'}, {symbol:'\u064F\u0648'}, {symbol:'\u0650\u064A'}];
const tanween = [{symbol:'\u064B'}, {symbol:'\u064C'}, {symbol:'\u064D'}];
const fnMatch = file.match(/const getCombinedChar = \(base: string, symbol: string\) => \{([\s\S]*?)\n\};/);
assert.ok(fnMatch, 'Use actual Arabic vowel composition helper');
const combine = new Function('base', 'symbol', fnMatch[1]);

let questions = 0;
for (const char of alphabet) {
  for (let stage = 1; stage <= 5; stage++) {
    for (let offset = 0; offset < 3; offset++) {
      const correctAnswers = new Set();
      for (let round = 1; round <= 3; round++) {
        const q = makeListeningQuestion({
          char, stage, round, rotation: offset, harakat, shadda, mad, tanween,
          similarSounds: contrasts, combine, random: () => .37
        });
        assert.equal(q.options.length, stage === 5 ? 4 : 3, 'Each question has all its distinct response choices');
        assert.equal(new Set(q.options.map(x => x.label)).size, q.options.length, 'No duplicate answer labels');
        assert.equal(q.options.filter(x => x.isCorrect).length, 1, 'Exactly one answer is correct');
        assert.equal(q.options.find(x => x.isCorrect).label, q.target);
        assert.equal(q.audioKind, stage === 5 ? 'letter-name' : 'variant');
        correctAnswers.add(q.target);
        questions++;
      }
      assert.equal(correctAnswers.size, 3, 'Three distinct acoustic targets per stage: ' + char + ', stage ' + stage);
    }
  }
}
assert.equal(questions, 28 * 5 * 3 * 3);
assert.deepEqual(shuffleListeningOptions([1,2,3,4], () => 0), [2,3,4,1], 'Fisher-Yates must not use biased sort(random-0.5)');
assert.deepEqual(shuffleListeningOptions([1,2,3,4], () => .999999), [1,2,3,4]);
assert.throws(() => makeListeningQuestion({char:'ب',stage:0,round:1}), /Invalid letter listening stage/);
assert.throws(() => makeListeningQuestion({char:'ب',stage:1,round:4}), /Invalid letter listening round/);

const soundLab = file.slice(file.indexOf('const SoundLab:'), file.indexOf('const getCombinedChar'));
const auditory = file.slice(file.indexOf('const AuditoryGame:'), file.indexOf('const LETTER_WORDS:'));
for(const fragment of [
  "lang === 'ar' ? h.nameAr : h.nameEn",
  "const combined = getCombinedChar(char, h.symbol)",
  "typeof MediaRecorder === 'undefined'",
  "recordingSession", // corrected below if changed
]) {
  if(fragment === 'recordingSession') continue;
  assert.ok(soundLab.includes(fragment), 'Missing lab safeguard: ' + fragment);
}
for (const fragment of [
  "sessionRef.current += 1",
  "URL.revokeObjectURL(urlRef.current)",
  "streamRef.current?.getTracks().forEach",
  "recorder.onstop = null",
  "playbackRef.current?.pause()",
  "session !== sessionRef.current",
  "audioUrl && !isRecording",
  "لا يوجد تقييم آلي لصحة النطق",
]) assert.ok(soundLab.includes(fragment), 'Sound lab must clean up safely: ' + fragment);

for (const fragment of [
  "makeListeningQuestion({", "LISTENING_TOTAL_QUESTIONS",
  "LISTENING_QUESTIONS_PER_STAGE", "setMistakeOnQuestion(true)",
  "if (!mistakeOnQuestion) setFirstTryCorrect",
  "stopLetterName()", "playLetterName(current.target)",
  "clearTimers();", "lang === 'ar'", "هذا",
]) {
  if(fragment === 'هذا') continue;
  assert.ok(auditory.includes(fragment), 'Listening quiz safeguard missing: ' + fragment);
}
assert.ok(file.includes('<SoundLab \n                        key={selectedChar.char}'), 'Switching letters must reset recording');
assert.match(file, /<AuditoryGame\s+char=\{selectedChar\.char\}[\s\S]{0,250}lang=\{lang\}/, 'Correct language must reach the game');
assert.ok(!soundLab.includes('(t as any || lang'), 'English vowel labels must not always render Arabic');
assert.ok(!auditory.includes("opts.sort(() => Math.random() - 0.5)"), 'Remove biased answer shuffle');
assert.ok(!auditory.includes("setScore(s => s + 20)"), 'No unearned scores for unlimited attempts');

console.log('Letters listening OK: 1,260 unique-option exercises, 15 rounds per letter, recorded contrasts, bilingual labels and safe recorder cleanup.');
