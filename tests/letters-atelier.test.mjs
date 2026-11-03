import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const file = readFileSync(new URL('../pages/Letters.tsx', import.meta.url), 'utf8');
const app = file.slice(file.indexOf('export const Letters: React.FC'));
const tracing = file.slice(file.indexOf('const TracingBoard:'), file.indexOf('const SoundLab:'));
const tokens = [
  'Letter Atelier', 'مَرْسَم الحروف', 'خزانة الحروف', 'رحلة الحرف',
  'أدوات التدريب', 'lg:grid-cols-[minmax(190px',
  "id: 'listen'", "id: 'trace'", "id: 'write'", "id: 'practice'", "id: 'master'",
  "id: 'soundlab'", "id: 'game'", "id: 'words'", "id: 'tashkeel'",
  "<SoundLab", "<AuditoryGame", "<WordDiscriminationGame", "<WordTashkeelGame",
  '<LetterWorksheetPreviewModal', '<LetterHomeworkInboxModal',
  'setShowWorksheetPreview(true)', 'setShowTeacherInbox(true)',
  "fileInputRef.current?.click()", 'onChange={(e) => e.target.files && handleUpload(e)}',
  'pendingSubmissionsCount > 0', 'isTeacher ?',
  'handlePlayLetterName(item.char)', 'handlePlayLetterName(selectedChar.char)',
  'preloadLetterNames()', 'getCombinedChar(selectedChar.char, value.symbol)',
  "role=\"group\"", "lg:overflow-visible", "overflow-x-auto"
];
for (const token of tokens) assert.ok(app.includes(token), 'Missing letter atelier capability: ' + token);
assert.equal((app.match(/<PageHeader/g) || []).length, 1, 'One compact header only');
assert.ok(!app.includes('Sidebar Detail'), 'Old crowded sidebar must be removed');
assert.ok(!app.includes('grid grid-cols-7 gap-2'), 'Old alphabet grid must be replaced');
assert.ok(app.includes("useState<typeof ALPHABET[0] | null>(ALPHABET[1])"), 'Preview should show an example letter immediately');
assert.ok(tracing.includes("mode?: 'trace' | 'free'"), 'Tracing and independent writing need separate modes');
assert.ok(tracing.includes("mode === 'trace' &&"), 'Free writing must hide the hint');
assert.ok(tracing.includes('shapeOptions.map((option)'), 'All four shapes belong in one row');
assert.ok(tracing.includes('onPointerDown={startDrawing}'), 'Touch precision must be preserved');
assert.ok(tracing.includes('letterCanvasPoint('), 'Canvas coordinate scaling must be preserved');
assert.equal((app.match(/<LetterWorksheetPreviewModal/g)||[]).length, 1);
assert.equal((app.match(/<LetterHomeworkInboxModal/g)||[]).length, 1);
assert.ok(app.includes("lang === 'ar' ? 'مَرْسَم الحروف'"), 'Both languages must be supported');
console.log('Letter atelier OK: 3 panels, 5 journey stages, 4 training tools, live audio, worksheet and inbox.');
