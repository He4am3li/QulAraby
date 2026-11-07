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
assert(newAdvanced.includes("level:'advanced'") || newAdvanced.includes("level: 'advanced'"), 'Advanced dossiers must remain playable');
for (const n of [5,6]) {
  assert(gameModule.includes("level: 'intermediate',\n    caseNumber: " + n),
    'Original case ' + n + ' must appear in intermediate only');
}

const view = src('components/games/DetectiveExperience.tsx');
const games = src('pages/Games.tsx');
assert(games.includes('DetectiveExperience as DetectiveMystery'), 'Game menu must render responsive experience');
for (const feature of ['localStorage.setItem', 'submitAccusation', 'activeCase.culpritId',
  'markCaseSolved', 'wordOptions', 'answerWord', 'nextCase', 'downloadPdf', 'aria-live',
  'suspectColumns', 'setLanguage', 'setShowTranslation']) {
  assert(view.includes(feature), 'Missing detective functionality: ' + feature);
}
assert(view.includes('reason !== ' + "'evidence'"), 'Accusation must require an evidence-based reason');
assert(view.includes('left: \'23.2%\''), 'Original cinematic level-selection click area must be preserved');
assert(view.includes('detectiveRectStyle(getDetectiveStartRect(level, activeCase.caseNumber))'), 'Case-specific poster start-button alignment missing');
assert(view.includes('url("/٨.jpeg")'), 'Investigation must use original artwork');
assert(view.includes('url("/٩.jpeg")'), 'Report must use original artwork');
assert(view.includes("left:'65.5%'"), 'Vocabulary must fill original preprinted slots');
assert(!view.includes('SpeechSynthesisUtterance'), 'Robotic Arabic speech must not return');
assert(!view.includes('speechSynthesis.speak'), 'The game must use only cinematic sound effects');
assert(!view.includes('showClueDetail'), 'Separate cipher window must be removed');
assert(!view.includes('suspectPage'), 'Suspect paging must not return');
assert(!view.includes('mobileAccusationSuspects'), 'Accusation must show everyone at once');
assert(view.includes('activeCase.suspects.map((person, suspectIndex) => {'), 'Every suspect must appear directly in the scene');
assert((view.match(/activeCase\.suspects\.map/g) || []).length >= 2, 'Accusation must also show the full roster');
assert(view.includes('activeClue.cipherOptions'), 'Cipher choices must be rendered directly in the scene');
assert(view.includes('setCipherOpened(true)'), 'Inline cipher must unlock original clue');
assert(view.includes('object-cover object-top'), 'Portraits must fill image frames');
assert(view.includes('rounded-b-[3px]'), 'Each portrait must have a separate gold nameplate');
assert(view.includes('suspectRows'), '10 to 12 suspects must fit into two rows');
assert(!view.includes("import confetti"), 'Celebration particle library should not be used');
assert(!view.includes('confetti('), 'No particles should be fired after solving');
assert(view.includes("left: '6.9%'") && view.includes("top: '30.6%'") && view.includes("width: '27.9%'") && view.includes("height: '22.1%'"), 'Cipher must be centered on the actual printed parchment');
assert(view.includes('grid-cols-3 items-stretch'), 'Use three compact evidence tags, not full-width answer bars');
assert(!view.includes('grid-rows-3 gap-[2px]'), 'Do not restore primitive full-width stacked answers');
assert(view.includes('getAdvancedPosterPortraitStyle(activeCase.caseNumber, suspectIndex'), 'Use source poster crops, not misaligned thumbnail enlargements');
assert(view.includes('Hide the six obsolete blank frames'), 'Old ghost portrait placeholders must be covered');
console.log('Detective experience: case-specific buttons, centered parchment, accurate image crops and quiet ending verified.');
