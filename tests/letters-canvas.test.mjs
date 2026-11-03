import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { letterCanvasPoint } from '../utils/letterCanvas.js';

const page = readFileSync(new URL('../pages/Letters.tsx', import.meta.url), 'utf8');
const board = page.slice(page.indexOf('const TracingBoard:'), page.indexOf('const SoundLab:'));

// Exact coordinates at full size, at half size, and when CSS resizes X/Y differently.
const same = letterCanvasPoint(425, 110, { left: 0, top: 0, width: 850, height: 220 }, 850, 220);
assert.deepEqual(same, { x: 425, y: 110 });
const half = letterCanvasPoint(312.5, 75, { left: 100, top: 20, width: 425, height: 110 }, 850, 220);
assert.deepEqual(half, { x: 425, y: 110 });
const squeezed = letterCanvasPoint(220, 145, { left: 20, top: 45, width: 400, height: 100 }, 850, 220);
assert.ok(Math.abs(squeezed.x - 425) < 1e-7 && Math.abs(squeezed.y - 220) < 1e-7,
  'Touch point must be scaled independently in both axes');
assert.deepEqual(letterCanvasPoint(10, 10, { left: 10, top: 10, width: 300, height: 90 }, 850, 220), { x: 0, y: 0 });

// Pointer capture holds the stroke even when the finger moves outside the canvas.
for (const marker of ['onPointerDown={startDrawing}', 'onPointerMove={draw}',
  'onPointerUp={stopDrawing}', 'onPointerCancel={stopDrawing}',
  'onLostPointerCapture={stopDrawing}', 'setPointerCapture(e.pointerId)',
  'letterCanvasPoint(e.clientX, e.clientY, canvas.getBoundingClientRect(), canvas.width, canvas.height)',
  "style={{ touchAction: 'none' }}", 'ctx.lineTo(x + 0.01, y + 0.01)']) {
  assert.ok(board.includes(marker), 'Missing tracing guard: ' + marker);
}
assert.ok(!board.includes('onMouseDown={startDrawing}'), 'Remove duplicate mouse handlers');
assert.ok(!board.includes('onTouchStart={startDrawing}'), 'Remove duplicate touch handlers');
assert.ok(!board.includes("React.useState(false);\n  const [activeShape"), 'Drawing must use a synchronous pointer ref');
assert.ok(board.includes('}, [activeShape, char]);'), 'Changing letters should clear the old drawing');

// Pale guide and canvas must be stacked inside exactly one shared layout box.
const guideStart = board.indexOf('identical bounds for the pale guide');
const wrapper = board.slice(guideStart, board.indexOf('{/* AI Feedback Overlay */}', guideStart));
assert.ok(guideStart >= 0 && wrapper.includes('relative w-full h-full max-w-[850px] max-h-[220px]'));
assert.ok(wrapper.includes('absolute inset-0 flex items-center justify-center'));
assert.ok(wrapper.includes('className="absolute inset-0 z-10 w-full h-full cursor-crosshair"'));
assert.ok(wrapper.includes('pointer-events-none'), 'Guide must not steal pointer events');
console.log('Letter tracing alignment OK: scaled viewport coordinates, pointer capture, guide overlap.');
