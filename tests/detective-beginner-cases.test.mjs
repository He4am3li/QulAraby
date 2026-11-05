import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const source = readFileSync(join(root, 'components/games/beginnerDetectiveCases.ts'), 'utf8');
const start = 'export const BEGINNER_CASE_SEEDS: BeginnerSeed[] = ';
const end = ';\n\nexport const BEGINNER_DETECTIVE_CASES';
const first = source.indexOf(start), last = source.indexOf(end, first + start.length);
assert(first >= 0 && last > first, 'Beginner case seeds missing');
const cases = JSON.parse(source.slice(first + start.length, last));
assert.equal(cases.length, 10, 'Ten beginner cases are required');
assert.deepEqual(cases.map(entry => entry.number), Array.from({ length: 10 }, (_, i) => i + 1));

for (const c of cases) {
  const prefix = String(c.number).padStart(2, '0');
  assert.equal(c.people.length, 6, 'Case ' + prefix + ': six suspects');
  assert.equal(c.evidence.length, 5, 'Case ' + prefix + ': five words');
  assert.equal(c.clues.length, 3, 'Case ' + prefix + ': three investigation steps');
  assert(c.culpritIndex >= 0 && c.culpritIndex < 6);
  assert.equal(new Set(c.people.map(p => p[0])).size, 6);
  const eliminated = c.clues.flatMap(clue => clue.innocentIndices);
  assert.equal(eliminated.length, 5);
  assert.equal(new Set(eliminated).size, 5);
  assert(!eliminated.includes(c.culpritIndex));
  const story = c.description + c.clues.map(clue => clue.speech).join(' ');
  for (const term of c.evidence) {
    assert(story.includes(term.ar), 'Case ' + prefix + ': word not in story: ' + term.ar);
    assert(term.en, 'Case ' + prefix + ': missing translation');
  }
  assert(existsSync(join(root, 'public/detective/beginner', 'scene-' + prefix + '.webp')), 'Missing scene ' + prefix);
  for (let i = 0; i < 6; i++) {
    assert(existsSync(join(root, 'public/detective/beginner/portraits', 'case-' + prefix + '-suspect-' + i + '.webp')),
      'Missing portrait ' + prefix + '/' + i);
  }
}
const game = readFileSync(join(root, 'components/games/DetectiveMystery.tsx'), 'utf8');
assert(game.includes('...BEGINNER_DETECTIVE_CASES'), 'Game must load new beginner cases');
const originalSection = game.slice(game.indexOf('export const CASES_DATABASE'), game.indexOf('// LEVEL 2:'));
assert.equal((originalSection.match(/level: 'beginner'/g) || []).length, 0,
  'Original cases must no longer be beginner cases');
console.log('Detective: 10 cases, 60 portraits, vocabulary, and three-step elimination validated.');
