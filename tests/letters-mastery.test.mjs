import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  LETTER_FORMS, LISTENING_TOTAL, MIN_LISTENING_FIRST_TRY,
  evidenceStorageKey, emptyLetterEvidence, normalizeLetterEvidence,
  recordVerifiedWriting, recordListeningExercise,
  verifiedFormCount, isVerifiedLetterMastered, masteredFromEvidence, assessInkSamples
} from '../utils/letterMastery.js';

const page = readFileSync(new URL('../pages/Letters.tsx', import.meta.url), 'utf8');
const form = 'isolated';
const sameLearner = evidenceStorageKey('student-1');
assert.notEqual(sameLearner, evidenceStorageKey('student-2'));
assert.notEqual(evidenceStorageKey(null), sameLearner);
assert.deepEqual(normalizeLetterEvidence(null), emptyLetterEvidence());
assert.deepEqual(normalizeLetterEvidence({version:1,letters:{ب:{forms:{isolated:{stars:3}}}}}), emptyLetterEvidence());

let state = emptyLetterEvidence();
assert.deepEqual(masteredFromEvidence(state), []);
assert.deepEqual(LETTER_FORMS, ['isolated','initial','medial','final']);
assert.equal(LISTENING_TOTAL, 15);
assert.equal(MIN_LISTENING_FIRST_TRY, 12);

state = recordVerifiedWriting(state, 'ب', form, 3, '2026-11-05T10:00:00Z');
assert.equal(verifiedFormCount(state, 'ب'), 1);
assert.deepEqual(masteredFromEvidence(state), [], 'One writing success cannot award mastery');
const beforeInvalid = structuredClone(state);
state = recordVerifiedWriting(state, 'ب', 'other', 3);
state = recordVerifiedWriting(state, 'ب', 'initial', 1);
state = recordVerifiedWriting(state, 'ب', 'medial', NaN);
assert.deepEqual(state, beforeInvalid, 'Invalid shape or low stars must not count');

for (const shape of LETTER_FORMS.slice(1)) state = recordVerifiedWriting(state, 'ب', shape, 2);
assert.equal(verifiedFormCount(state, 'ب'), 4);
assert.equal(state.letters['ب'].forms.isolated.stars, 3);
assert.equal(masteredFromEvidence(state).length, 0, 'Four written forms alone are not full letter mastery');

state = recordListeningExercise(state, 'ب', 11, 15);
assert.deepEqual(masteredFromEvidence(state), [], '11/15 first tries is not enough');
state = recordListeningExercise(state, 'ب', 12, 15);
assert.deepEqual(masteredFromEvidence(state), ['ب'], 'Four forms and 12/15 listening earn mastery');
assert.ok(isVerifiedLetterMastered(state.letters['ب']));
state = recordListeningExercise(state, 'ب', 6, 15);
assert.equal(state.letters['ب'].listening.score, 12, 'Lower retakes must not erase progress');

state = recordVerifiedWriting(state, 'ب', 'initial', 2);
assert.equal(state.letters['ب'].forms.initial.stars, 2, 'Same shape cannot increment a multi-shape counter');
state = recordListeningExercise(state, 'ج', 15, 15);
assert.deepEqual(masteredFromEvidence(state), ['ب'], 'Listening alone cannot award a badge to another letter');
state = recordVerifiedWriting(state, 'ج', 'isolated', 2);
assert.deepEqual(masteredFromEvidence(state), ['ب'], 'Other letters need their own independent forms');

const unchanged = structuredClone(state);
state = recordListeningExercise(state, 'ج', 14, 14);
state = recordListeningExercise(state, 'ج', 16, 15);
assert.deepEqual(state, unchanged, 'Invalid quiz totals must not count');
assert.deepEqual(normalizeLetterEvidence(state), state, 'Persistence roundtrip must keep validated evidence');
assert.deepEqual(normalizeLetterEvidence(JSON.parse(JSON.stringify(state))), state);

const ink = (width, height, points) => {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (const [x,y] of points) pixels[(y * width + x) * 4 + 3] = 255;
  return {width,height,data:pixels};
};
assert.equal(assessInkSamples(null, 200).sufficient, false);
assert.equal(assessInkSamples(ink(850,220,[]), 10).sufficient, false, 'Blank board must fail');
assert.equal(assessInkSamples(ink(850,220,[[100,100]]), 10).sufficient, false, 'One dot must fail');
const stroke = [];
for (let y=30;y<131;y++) for (let x=110;x<118;x++) stroke.push([x,y]);
assert.equal(assessInkSamples(ink(850,220,stroke),2).sufficient, false, 'A low-movement stroke cannot pass');
assert.equal(assessInkSamples(ink(850,220,stroke),5).sufficient, true, 'A plausible simple alif should be eligible for model checking');
const shortStroke=[];
for(let y=30;y<41;y++) for(let x=110;x<118;x++)shortStroke.push([x,y]);
assert.equal(assessInkSamples(ink(850,220,shortStroke),9).sufficient,false);

// Connection guard: handwriting is counted only after the model confirms the correct positional form.
const board = page.slice(page.indexOf('const TracingBoard:'), page.indexOf('const SoundLab:'));
const game = page.slice(page.indexOf('const AuditoryGame:'), page.indexOf('const LETTER_WORDS:'));
const parent = page.slice(page.indexOf('export const Letters: React.FC'));
for(const fragment of [
  "assessInkSamples(ctx.getImageData", "if (!ink.sufficient)",
  "assessmentLockRef.current", "canvasRevisionRef.current === lastCheckedRevisionRef.current",
  "if (id !== assessmentSeqRef.current) return", "raw.isCorrect === true && stars >= 2",
  "onVerified?.(activeShape, stars)", "const next = LETTER_FORMS.find(",
  "LETTER_FORMS.filter(form => verifiedForms[form]).length", "setCheckError(",
]) assert.ok(board.includes(fragment), 'Missing handwriting verification safeguard: ' + fragment);
assert.ok(!board.includes('onMastered(result.stars)'), 'Single assessment cannot issue a mastery badge');
assert.ok(game.includes('latestCompleteRef.current?.(firstTryTotal, LISTENING_TOTAL_QUESTIONS)'), 'Only completed listening exercise can record accuracy');
assert.ok(game.includes('reportedRef.current = true'), 'A finished quiz is reported once');
assert.ok(parent.includes('masteredFromEvidence(skillEvidence)'), 'Badges must be derived from verified evidence');
assert.ok(parent.includes('recordVerifiedWriting(previous, char, form, stars)'), 'Writing evidence persisted separately per form');
assert.ok(parent.includes('recordListeningExercise(previous, char, firstTryCorrect, total)'), 'Real listening evidence is included');
assert.ok(parent.includes('verifiedForms={skillEvidence.letters?.[selectedChar.char]?.forms || {}}'));
assert.ok(parent.includes('onPracticeComplete={(score, total) => saveListeningPractice(selectedChar.char, score, total)}'));
assert.ok(!parent.includes('saveMastery('), 'Worksheet upload and single writing submissions cannot issue mastery');
assert.ok(!parent.includes("localStorage.setItem('hub_mastered_letters'"), 'Legacy historical badges must not be silently overwritten');
assert.ok(!parent.includes("localStorage.setItem('hub_mastered_letters_detailed'"), 'Legacy historical scores must not be silently overwritten');
assert.ok(page.includes("lang === 'ar' ? 'طباعة الملاحظات' : 'Print Feedback'"), 'Worksheet must not falsely declare mastery');

console.log('Letter mastery OK: four individually evaluated forms, 12/15 listening evidence, device-account isolation, ink checks and legacy data preservation.');
