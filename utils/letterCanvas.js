/** Convert viewport pointer coordinates to intrinsic canvas pixels.
 * The writing surface may be narrower or shorter than its backing bitmap on
 * mobile or zoomed layouts, so both axes must be scaled independently.
 */
export function letterCanvasPoint(clientX, clientY, rect, width, height) {
  const scaleX = rect.width > 0 ? width / rect.width : 1;
  const scaleY = rect.height > 0 ? height / rect.height : 1;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}
