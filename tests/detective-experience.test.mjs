import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const src = path => readFileSync(join(process.cwd(), path), 'utf8');
const meta = src('components/games/detectiveNarratives.ts');
const prefix = 'export const DETECTIVE_NARRATIVES: Record<number, DetectiveNarrative> = ';
const start = meta.indexOf(prefix);
assert(start >= 0, 'Bilingual narratives must exist');
const narratives = JSON.parse(meta.slice(start + prefix.length).trim().replace(/;\s*$/, ''));
const raw = src('components/games/beginnerDetectiveCases.ts');
const seedStart = 'export const BEGINNER_CASE_SEEDS: BeginnerSeed[] = ';
const seedEnd = ';\n\nexport const BEGINNER_DETECTIVE_CASES';
const a = raw.indexOf(seedStart), b = raw.indexOf(seedEnd, a);
assert(a >= 0 && b > a, 'Beginner case seeds missing');
const cases = JSON.parse(raw.slice(a + seedStart.length, b));
assert.equal(cases.length, 10);

for (const c of cases) {
  const caseId = 100 + c.number;
  const narration = narratives[caseId];
  assert(narration, 'Missing narrative for beginner case ' + c.number);
  assert.equal(narration.cluesEn.length, c.clues.length, 'Clue translations must match all Arabic clues');
  assert(narration.finalEvidenceAr.length >= 25, 'Final evidence must be meaningful');
  assert(narration.finalEvidenceEn.length >= 25, 'Final evidence English translation missing');
  const eliminated = c.clues.flatMap(clue => clue.innocentIndices);
  assert.equal(new Set(eliminated).size, 5, 'Only five innocents should be cleared');
  assert(!eliminated.includes(c.culpritIndex), 'Must not clear culprit');
  for (const term of c.evidence) {
    assert((c.description + c.clues.map(x => x.speech).join(' ')).includes(term.ar),
      'Vocabulary must come directly from the case');
  }
}
for (let id = 1; id <= 6; id++) assert(narratives[id], 'Keep bilingual metadata for legacy case ' + id);
for (let id of [201, 202]) assert(narratives[id], 'Missing advanced bilingual narrative ' + id);
const gameModule = src('components/games/DetectiveMystery.tsx');
const newAdvanced = src('components/games/advancedDetectiveCases.ts');
assert(gameModule.includes('...createAdvancedDetectiveCases(ALL_24_SUSPECTS)'), 'Advanced mode must use separate dossiers');
assert(newAdvanced.includes("level: 'advanced'"), 'Advanced dossiers must remain playable');
for (const n of [5,6]) {
  assert(gameModule.includes("level: 'intermediate',\n    caseNumber: " + n),
    'Original case ' + n + ' must appear in intermediate only');
}

const view = src('components/games/DetectiveExperience.tsx');
const games = src('pages/Games.tsx');
assert(games.includes('DetectiveExperience as DetectiveMystery'), 'Game menu must render responsive experience');
for (const feature of ['speechSynthesis.speak', 'localStorage.setItem', 'submitAccusation', 'activeCase.culpritId',
  'markCaseSolved', 'wordOptions', 'answerWord', 'nextCase', 'downloadPdf', 'aria-live',
  'grid-cols-3', 'setLanguage', 'setShowTranslation']) {
  assert(view.includes(feature), 'Missing detective functionality: ' + feature);
}
assert(view.includes('reason !== ' + "'evidence'"), 'Accusation must require an evidence-based reason');
assert(!view.includes("left: '23.2%'"), 'No static image hotspots in responsive UI');
console.log('Detective experience: bilingual support, accusation gate, practice, mobile grid and progress verified.');
