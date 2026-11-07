import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const src = readFileSync(join(root, 'components/games/advancedDetectiveCases.ts'), 'utf8');
const start = 'export const ADVANCED_CASE_SEEDS: AdvancedSeed[] = ';
const end = ';\n\nexport const createAdvancedDetectiveCases';
const i = src.indexOf(start), j = src.indexOf(end, i + start.length);
assert(i >= 0 && j > i, 'Advanced case seeds not readable');
const cases = JSON.parse(src.slice(i + start.length, j));
assert.equal(cases.length, 10, 'Advanced must have exactly ten cases');
assert.deepEqual(cases.map(c => c.id), [201,202,203,204,205,206,207,208,209,210]);

const text = readFileSync(join(root, 'components/games/detectiveNarratives.ts'), 'utf8');
const marker = 'export const DETECTIVE_NARRATIVES: Record<number, DetectiveNarrative> = ';
const found = text.indexOf(marker);
assert(found >= 0, 'Narrative metadata missing');
const narratives = JSON.parse(text.slice(found + marker.length).trim().replace(/;\s*$/, ''));
let portraits = 0;
for (const c of cases) {
  const prefix = String(c.caseNumber).padStart(2, '0');
  assert(c.suspects.length >= 10 && c.suspects.length <= 12, 'Keep the exact roster size for case '+prefix);
  assert.equal(new Set(c.suspects.map(s => s.name)).size, c.suspects.length, 'Duplicate names in case '+prefix);
  assert.equal(new Set(c.suspects.map(s => s.id)).size, c.suspects.length, 'Duplicate IDs');
  assert(c.suspects.some(s => s.id === c.culpritId));
  assert.equal(c.clues.length, 4, 'Advanced must use four successive evidence rounds');
  assert.equal(c.evidenceTerms.length, 5);
  const eliminated = c.clues.flatMap(x => x.innocentIds);
  assert.equal(eliminated.length, c.suspects.length - 1, 'Every innocent must be clearable');
  assert.equal(new Set(eliminated).size, eliminated.length, 'No suspect eliminated twice');
  assert(!eliminated.includes(c.culpritId), 'Culprit cannot be cleared');
  for(const clue of c.clues) {
    assert.equal(clue.options.length, 3, 'Cipher offers three choices');
    assert(clue.options.includes(clue.key), 'Cipher key must be available');
    assert(clue.hint.includes([...clue.key].reverse().join('')), 'Cipher should be solvable without guessing');
  }
  const poster = join(root,'public/detective/advanced','scene-'+prefix+'.webp');
  assert(existsSync(poster), 'Missing cinematic scene '+prefix);
  for(const suspect of c.suspects) {
    assert(existsSync(join(root,'public',suspect.image.slice(1))), 'Missing portrait '+suspect.id);
    portraits++;
  }
  const locale = narratives[c.id];
  assert(locale, 'Missing advanced case translation '+prefix);
  assert.equal(locale.cluesEn.length, c.clues.length, 'Translated clues must align');
  assert.equal(locale.accusationProofs.length, 2, 'Two independently verified reasons required');
  for(const q of locale.accusationProofs) {
    assert.equal(q.choicesAr.length,3);
    assert.equal(q.choicesEn.length,3);
    assert(q.correctIndex >= 0 && q.correctIndex < 3);
    assert(q.choicesAr[q.correctIndex] && q.choicesEn[q.correctIndex]);
  }
}
assert.equal(portraits,106,'Exactly 106 distinct advanced portraits');
const ui=readFileSync(join(root,'components/games/DetectiveExperience.tsx'),'utf8');
assert(ui.includes('advancedProofsCorrect'), 'Advanced evidence proof gate missing');
assert(!ui.includes('mobileAccusationSuspects'), 'Do not paginate the accusation roster');
assert(ui.includes('suspectColumns') && ui.includes('suspectRows'), 'All advanced suspects must fit into one responsive scene');
assert(ui.includes('activeCase.suspects.length - 1'), 'Hardcoded five-innocent counter remains');
assert(!ui.includes('suspectPage'), 'No more suspect pages or navigation arrows');
console.log('Advanced detective: 10 scenes, 106 portraits, 40 cipher clues and 20 proof questions verified.');
