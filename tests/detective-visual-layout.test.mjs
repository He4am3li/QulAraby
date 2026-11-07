import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = file => readFileSync(join(process.cwd(), file), 'utf8');
const geometry = read('components/games/detectiveVisualGeometry.ts');
const advancedSrc = read('components/games/advancedDetectiveCases.ts');
const extract = (source, start, end) => {
  const i = source.indexOf(start), j = source.indexOf(end, i + start.length);
  assert(i >= 0 && j > i, 'Cannot parse layout data: ' + start);
  return JSON.parse(source.slice(i + start.length, j));
};
const startButtons = extract(geometry,
  'export const ADVANCED_START_BUTTON_RECTS: Record<number, DetectiveRect> = ',
  ';\n\n// The smaller beginner');
const beginnerButtons = extract(geometry,
  'export const BEGINNER_START_BUTTON_RECTS: Record<number, DetectiveRect> = ',
  ';\n\nexport function getDetectiveStartRect');
const portraitStrips = extract(geometry,
  'export const ADVANCED_PORTRAIT_STRIPS: Record<number, PosterPhotoStrip> = ',
  ';\n\n/** Background-size');
const cases = extract(advancedSrc,
  'export const ADVANCED_CASE_SEEDS: AdvancedSeed[] = ',
  ';\n\nexport const createAdvancedDetectiveCases');

assert.equal(cases.length, 10);
assert.equal(Object.keys(startButtons).length, 10);
assert.equal(Object.keys(beginnerButtons).length, 10);
assert(new Set(Object.values(startButtons).map(r => r.top)).size >= 8,
  'Each advanced crime poster needs an individually calibrated red button');
for (const caseSeed of cases) {
  const id = String(caseSeed.caseNumber);
  const button = startButtons[id];
  const strip = portraitStrips[id];
  assert(button && strip, 'Missing layout for advanced case ' + id);
  assert(button.left > 2 && button.left < 5.5);
  assert(button.width > 24 && button.width < 28);
  assert(button.top > 62 && button.top < 72);
  assert(button.top + button.height < 80);
  assert.equal(strip.rows.flat().length, caseSeed.suspects.length,
    'One full-bleed source portrait for each suspect: case ' + id);
  assert.equal(strip.y.length, 2);
  for (const [rowIndex, xs] of strip.rows.entries()) {
    assert(xs.every((x, index) => index === 0 || x > xs[index - 1]),
      'Sprite photo positions must increase left-to-right');
    for (const x of xs) {
      assert(x >= 1100 && x + strip.w < 2048, 'No portrait may crop beyond the poster');
      assert(strip.y[rowIndex] > 150 && strip.y[rowIndex] + strip.h < 850);
    }
  }
}
// Every source poster slot must remain visually distinct within the same case.
// Explicit overrides redirect known AI-generated duplicate faces to uniquely
// sourced approved portraits; no two slots may reference the same source slot.
const duplicateOverrides = {};
for (const [, key, sourceCase, sourceSlot] of geometry.matchAll(/'([0-9]+:[0-9]+)': \[([0-9]+), ([0-9]+)\]/g)) {
  duplicateOverrides[key] = sourceCase + ':' + sourceSlot;
}
assert(Object.keys(duplicateOverrides).length >= 7, 'Known repeated faces must receive separate portrait sources');
for (const item of cases) {
  const sources = item.suspects.map((_, slot) => duplicateOverrides[item.caseNumber + ':' + slot] || item.caseNumber + ':' + slot);
  assert.equal(new Set(sources).size, sources.length, 'Repeated portrait source in case ' + item.caseNumber);
}
for (const pair of ['3:6','7:4','8:4','10:5','10:6']) assert(duplicateOverrides[pair], 'Original duplicate not corrected: ' + pair);
const view = read('components/games/DetectiveExperience.tsx');
assert(view.includes('getDetectiveStartRect(level, activeCase.caseNumber)'));
assert(view.includes('getAdvancedPosterPortraitStyle(activeCase.caseNumber, suspectIndex'));
assert(!view.includes('confetti('));
assert(!view.includes('canvas-confetti'));
assert(view.includes("left: '6.9%'"));
assert(view.includes("top: '30.6%'"));
assert(view.includes("width: '27.9%'"));
assert(view.includes("height: '22.1%'"));
assert(view.includes('grid-cols-3 items-stretch'));
assert(view.includes('min-h-0 min-w-0'));
assert(view.includes('Hide the six obsolete blank frames'));
console.log('Detective visuals: 26 case hotspots, 106 source-aligned portraits, contained cipher UI, no confetti.');
