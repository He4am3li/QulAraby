import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../pages/Letters.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../pages/LettersGlass.css', import.meta.url), 'utf8');
const app = page.slice(page.indexOf('export const Letters: React.FC'));
const tracing = page.slice(page.indexOf('const TracingBoard:'), page.indexOf('const SoundLab:'));

for (const marker of [
  "import './LettersGlass.css'",
  'letters-liquid-page', 'letters-liquid-alphabet', 'letters-liquid-activity',
  'letters-liquid-letter', 'letters-liquid-tab', 'letters-liquid-sidebar',
  'letters-liquid-sidecell', 'letters-liquid-action',
  'letters-liquid-shapes', "data-glass-selected={selectedChar?.char === item.char}",
  '<SoundLab', '<AuditoryGame', '<WordDiscriminationGame', '<WordTashkeelGame',
  '<LetterWorksheetPreviewModal', '<LetterHomeworkInboxModal',
  'setShowWorksheetPreview(true)', 'setShowTeacherInbox(true)',
  'onChange={(e) => e.target.files && handleUpload(e)}',
  'handlePlayLetterName(item.char)', 'preloadLetterNames()'
]) assert.ok(page.includes(marker), 'Glass update must preserve: ' + marker);

assert.ok(app.includes('grid grid-cols-7 gap-2'), 'Original alphabet layout preserved');
assert.ok(app.includes('md:w-72'), 'Original detail sidebar preserved');
assert.ok(app.includes('md:flex-row'), 'Original workspace geometry preserved');
assert.ok(app.includes("setActiveTab('practice')"), 'Drawing tab preserved');
assert.ok(tracing.includes('letterCanvasPoint('), 'Canvas coordinate correction preserved');
assert.ok(tracing.includes('onPointerDown={startDrawing}'), 'Stylus and touch support preserved');
assert.ok(tracing.includes('width={850}') && tracing.includes('height={220}'), 'Canvas backing bounds preserved');
assert.ok(tracing.includes('bg-white flex items-center justify-center p-2 cursor-crosshair'), 'Opaque white writing board preserved');
assert.equal((app.match(/<LetterWorksheetPreviewModal/g) || []).length, 1);
assert.equal((app.match(/<LetterHomeworkInboxModal/g) || []).length, 1);
assert.equal((app.match(/data-glass-active=/g) || []).length, 5, 'All five existing tabs styled');

for (const rule of [
  '.letters-liquid-page', '.letters-liquid-panel', '.letters-liquid-letter',
  '.letters-liquid-tab', '.letters-liquid-sidecell', '.letters-liquid-action',
  '[data-glass-selected="true"]', '[data-glass-active="false"]',
  '@media (max-width: 767px)', 'prefers-reduced-motion', 'prefers-reduced-transparency'
]) assert.ok(css.includes(rule), 'Missing scoped visual safeguard: ' + rule);

assert.ok(!css.includes('canvas {'), 'Never style or blur the drawing canvas');
assert.ok(!css.includes('position: fixed'), 'No new layout overlay');
assert.ok(!css.includes('overflow-y:'), 'Do not change original scrolling behavior');
console.log('Letters Liquid Glass OK: original UI, 5 tools, local audio, drawing, worksheet and inbox preserved.');
