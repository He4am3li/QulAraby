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

// The empty-state panel must align exactly with the upper alphabet panel.
assert.ok(
  app.includes('letters-liquid-welcome bg-white w-full max-w-5xl mx-auto'),
  'The welcome panel must use the same horizontal bounds as the alphabet grid'
);
assert.ok(
  app.includes('letters-liquid-alphabet bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-none max-w-5xl mx-auto w-full'),
  'The alphabet panel retains its original width constraint'
);
assert.ok(app.includes('letters-liquid-welcome-orb'), 'Welcome should feature a crystal Arabic glyph');
assert.ok(app.includes('letters-liquid-welcome-steps'), 'Empty state should explain the learning flow');
assert.ok(app.includes('letters-liquid-action--worksheet'), 'Worksheet is a green-tinted crystal control');
assert.ok(app.includes('letters-liquid-action--inbox'), 'Teacher inbox is a blue-tinted crystal control');
assert.ok(app.includes('letters-liquid-action--upload'), 'Student upload shares the new crystal control');
assert.ok(app.includes('data-glass-tone="emerald"'), 'Word discrimination uses green tint rather than flat button');
assert.ok(app.includes('data-glass-tone="ocean"'), 'Writing uses blue tint rather than flat button');
for(const style of ['.letters-liquid-welcome-orb', '.letters-liquid-action--worksheet',
  '.letters-liquid-action--inbox', '.letters-liquid-tab[data-glass-active="true"]',
  'max-width: 64rem', '@media (max-height: 680px)']) {
  assert.ok(css.includes(style), 'Missing design refinement: '+style);
}
console.log('Letters Liquid Glass OK: original UI, 5 tools, local audio, drawing, worksheet and inbox preserved.');
