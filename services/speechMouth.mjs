import { REST_LIPS } from './speechLipSync.mjs';

export function createMouthCompositor(layers, images, mapping, makeCanvas, cutouts = []) {
  const names = [...new Set(Object.values(mapping))];
  if (names.some(name => !layers[name] || !images[name])) throw new Error('Missing speech mouth artwork');
  const x = Math.min(...names.map(name => layers[name].x));
  const y = Math.min(...names.map(name => layers[name].y));
  const w = Math.max(...names.map(name => layers[name].x + layers[name].w)) - x;
  const h = Math.max(...names.map(name => layers[name].y + layers[name].h)) - y;
  const canvas = makeCanvas(w, h); canvas.width = w; canvas.height = h;
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) throw new Error('Speech mouth canvas unavailable');
  let exclusion = null;
  if (cutouts.length) {
    exclusion = makeCanvas(w, h); exclusion.width = w; exclusion.height = h;
    const mask = exclusion.getContext('2d', { alpha: true });
    if (!mask) throw new Error('Speech mouth mask unavailable');
    for (const part of cutouts) mask.drawImage(part.image, part.x - x, part.y - y, part.w, part.h);
    const pixels = mask.getImageData(0, 0, w, h);
    for (let i = 3; i < pixels.data.length; i += 4) pixels.data[i] = pixels.data[i] > 0 ? 255 : 0;
    mask.putImageData(pixels, 0, 0);
  }
  return { layers, images, mapping, canvas, context, exclusion, x, y, w, h };
}

/** Blend premultiplied textures offscreen so transitions do not expose old lips. */
export function paintSpeechMouth(destination, compositor, frame = REST_LIPS) {
  const { layers, images, mapping, context, canvas, x, y, w, h } = compositor;
  context.clearRect(0, 0, w, h);
  const weights = {}, input = frame?.weights || REST_LIPS.weights;
  let sum = 0;
  for (const [shape, name] of Object.entries(mapping)) {
    const value = Number.isFinite(input[shape]) ? Math.max(0, input[shape]) : 0;
    weights[name] = (weights[name] || 0) + value; sum += value;
  }
  if (sum < 1e-8) { weights[mapping.Closed] = 1; sum = 1; }
  context.save();
  context.globalCompositeOperation = 'lighter';
  for (const [name, value] of Object.entries(weights)) {
    if (value <= 1e-5) continue;
    const layer = layers[name]; context.globalAlpha = value / sum;
    context.drawImage(images[name], layer.x - x, layer.y - y, layer.w, layer.h);
  }
  if (compositor.exclusion) {
    context.globalAlpha = 1; context.globalCompositeOperation = 'destination-out';
    context.drawImage(compositor.exclusion, 0, 0);
  }
  context.restore();
  destination.drawImage(canvas, x, y);
}
