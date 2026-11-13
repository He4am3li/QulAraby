// Shared whiteboard validation is deliberately side-effect-free. Only the
// allowed teacher canvas fields are broadcast; private student answers do not
// belong in a shared room canvas snapshot.
export const MAX_CANVAS_BYTES = 700000;
export const MAX_SUBMISSION_BYTES = 250000;

const byteLength = value => new TextEncoder().encode(JSON.stringify(value)).length;
const clone = data => JSON.parse(JSON.stringify(data));

export function pickCanvasState(source) {
  if (!source || typeof source !== 'object' ||
      !Array.isArray(source.pages) || source.pages.length < 1 || source.pages.length > 25 ||
      source.pages.some(page => !page || typeof page.id !== 'string' || !Array.isArray(page.elements))) {
    throw new Error('INVALID_CANVAS_STATE');
  }
  const index = Number.isInteger(source.currentPageIndex) ? source.currentPageIndex : 0;
  if (index < 0 || index >= source.pages.length) throw new Error('INVALID_CANVAS_PAGE');
  const snapshot = clone({
    pages: source.pages,
    currentPageIndex: index,
    isLocked: !!source.isLocked,
    wordBox: Array.isArray(source.wordBox) ? source.wordBox.slice(0, 100) : [],
    title: String(source.title || 'السبورة التفاعلية').slice(0, 120)
  });
  if (byteLength(snapshot) > MAX_CANVAS_BYTES) throw new Error('CANVAS_TOO_LARGE');
  return snapshot;
}

export function pickStudentDrawing(elements) {
  if (!Array.isArray(elements) || elements.length > 150) throw new Error('TOO_MANY_ELEMENTS');
  if (elements.some(item => !item || typeof item !== 'object' ||
      typeof item.id !== 'string' || typeof item.type !== 'string')) {
    throw new Error('INVALID_DRAWING');
  }
  const drawing = clone(elements);
  if (byteLength(drawing) > MAX_SUBMISSION_BYTES) throw new Error('DRAWING_TOO_LARGE');
  return drawing;
}
