/**
 * Pure helpers for the Arabic letters module.
 * Keep the display form of haa (هـ) intact for lookup tables.
 */
export function normalizeLetterKey(char) {
  if (char === 'هـ' || char === 'ه') return 'هـ';
  return char.replace(/\u0640/g, '').trim();
}

/** Translate browser pointer coordinates into canvas pixel coordinates. */
export function letterCanvasPoint(clientX, clientY, bounds, canvasWidth, canvasHeight) {
  const scaleX = bounds.width > 0 ? canvasWidth / bounds.width : 1;
  const scaleY = bounds.height > 0 ? canvasHeight / bounds.height : 1;
  return {
    x: (clientX - bounds.left) * scaleX,
    y: (clientY - bounds.top) * scaleY
  };
}

/** Scores are optional, not a fixed value inferred from a pass/fail result. */
export function normalizeAssessmentScore(score) {
  if (typeof score !== 'number' || !Number.isFinite(score)) return null;
  return Math.max(0, Math.min(100, score));
}
