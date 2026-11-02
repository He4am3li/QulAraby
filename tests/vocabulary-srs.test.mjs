/**
 * Exercise the real TypeScript SRS implementation with deterministic dates.
 * TypeScript is already a devDependency; transpilation avoids a test-runner dependency.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../utils/srs.ts', import.meta.url), 'utf8');
const isolatedSource = source.replace(
  "import { MasteryLevel, Vocabulary } from '../types';",
  "const MasteryLevel = { NEW: 1, LEARNING: 2, FLUENT: 3, MASTERED: 4 };"
);
assert.notEqual(isolatedSource, source, 'SRS test must load actual helper source');
const { outputText } = ts.transpileModule(isolatedSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
});
const { updateSRS, isDueForReview } = await import(
  'data:text/javascript;charset=utf-8,' + encodeURIComponent(outputText)
);
const date = s => new Date(s + 'T10:00:00.000Z');
const base = {
  id: 'sample', original_word: 'مكتبة', translation: 'Library',
  mastery_level: 1, review_count: 0, correct_reviews: 0,
  last_reviewed: '', next_review: date('2026-11-02').toISOString()
};
let word = updateSRS(base, 'easy', date('2026-11-02'));
assert.equal(word.mastery_level, 2, 'First verified success is learning, not fluent');
assert.equal(word.correct_reviews, 1);
assert.equal(word.review_count, 1);
assert.equal(isDueForReview(word, date('2026-11-03')), false);
const sameDay = updateSRS(word, 'easy', date('2026-11-02'));
assert.equal(sameDay.correct_reviews, 1, 'Repeated attempts on same day cannot farm mastery');
assert.equal(sameDay.next_review, word.next_review, 'Early repeats cannot postpone due dates');
word = updateSRS(word, 'easy', date('2026-11-04'));
assert.equal(word.correct_reviews, 2);
assert.equal(word.mastery_level, 2, 'Two verified successes are still learning');
word = updateSRS(word, 'easy', date('2026-11-06'));
assert.equal(word.correct_reviews, 3);
assert.equal(word.mastery_level, 3, 'Three correctly spaced reviews earn Fluent');
assert.equal(isDueForReview(word, date('2026-11-10')), false);
for (const day of ['2026-11-13', '2026-11-20', '2026-11-27']) {
  word = updateSRS(word, 'easy', date(day));
}
assert.equal(word.correct_reviews, 6);
assert.equal(word.mastery_level, 4, 'Six spaced reviews earn Mastered');
const wrong = updateSRS(word, 'hard', date('2026-12-01'));
assert.equal(wrong.correct_reviews, 5);
assert.equal(wrong.mastery_level, 3, 'A wrong answer lowers verified mastery');
assert.equal(isDueForReview(wrong, date('2026-12-02')), true, 'Wrong answer schedules next-day review');
const legacy = { ...base, mastery_level: 3, correct_reviews: undefined };
assert.equal(updateSRS(legacy, 'easy', date('2026-11-02')).mastery_level, 2,
  'Legacy self-reported fluency is not an automatic verified pass');
console.log('Verified SRS OK: spaced success, no same-day farming, review schedules, error downgrade.');
