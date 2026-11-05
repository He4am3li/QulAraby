import { paintSpeechMouth } from './speechMouth.mjs';
export { resolveTutorAttention as resolveAhmedAttention } from './tutorAttention.mjs';

export const AHMED_MANIFEST_URL = '/avatars/ahmed-facial-v2.json';
export const AHMED_ORIGINAL_URL = '/avatars/ahmed-stance-v2.webp';
const required = ['Face_BrowSkin_Rebuilt', ...['R', 'L'].flatMap(s => [
  `Brow_${s}`, `Brow_${s}_Thinking`, `Brow_${s}_Attentive`, `EyeWhite_${s}_Rebuilt`,
  `Iris_${s}`, `Pupil_${s}`, `Blink_${s}_Closed`
]), ...['Closed', 'A', 'E', 'O', 'FV', 'Smile'].map(s => `Mouth_${s}`)];

export function validateAhmedManifest(value) {
  if (!value || value.version !== 2 || value.status !== 'approved' || value.characterId !== 'egypt_male' ||
      value.width !== 1024 || value.height !== 1536 || value.source !== AHMED_ORIGINAL_URL ||
      !value.layers || required.some(name => !value.layers[name]) ||
      !['R', 'L'].every(s => typeof value.eyeClips?.[s] === 'string' && value.eyeClips[s].length)) return null;
  for (const layer of Object.values(value.layers)) {
    if (!layer || ![layer.x, layer.y, layer.w, layer.h].every(Number.isInteger) ||
        layer.x < 0 || layer.y < 0 || layer.w <= 0 || layer.h <= 0 ||
        layer.x + layer.w > value.width || layer.y + layer.h > value.height ||
        typeof layer.visible !== 'boolean' || typeof layer.url !== 'string' ||
        !/^\/avatars\/ahmed-stance-v2\/[A-Za-z0-9_-]+\.png$/.test(layer.url)) return null;
  }
  return value;
}

const clamp = (n, a, b) => Math.min(b, Math.max(a, Number.isFinite(n) ? n : 0));
/** The original is drawn once. Only reviewed facial patches may overlay it. */
export function planAhmedFrame(manifest, { blink = 0, gazeX = 0, gazeY = 0, state = 'idle', emphasis = 0 } = {}) {
  const result = [];
  const add = (name, alpha = 1, dx = 0, dy = 0, clip) => result.push({ name, alpha, dx, dy, ...(clip ? { clip } : {}) });
  const amount = clamp(blink, 0, 1), dx = clamp(gazeX, -2, 2), dy = clamp(gazeY, -1.5, 1.5);
  const suffix = state === 'thinking' ? 'Thinking' : ['listening', 'greeting', 'correct', 'retry'].includes(state) ? 'Attentive' : '';
  if (suffix) {
    add('Face_BrowSkin_Rebuilt');
    for (const s of ['R', 'L']) add(`Brow_${s}_${suffix}`);
  } else if (state === 'speaking' && emphasis > 0) {
    add('Face_BrowSkin_Rebuilt');
    // Reposition each original brow on rebuilt skin, keeping a single brow outline.
    for (const s of ['R', 'L']) add(`Brow_${s}`, 1, 0, -3 * clamp(emphasis, 0, 0.35));
  }
  if (dx || dy) for (const s of ['R', 'L']) {
    add(`EyeWhite_${s}_Rebuilt`, 1, 0, 0, s);
    add(`Iris_${s}`, 1, dx, dy, s);
    add(`Pupil_${s}`, 1, dx, dy, s);
  }
  if (amount) for (const s of ['R', 'L']) add(`Blink_${s}_Closed`, amount);
  return result;
}

export function paintAhmed(context, assets, options = {}) {
  context.drawImage(assets.original, 0, 0, assets.manifest.width, assets.manifest.height);
  const commands = planAhmedFrame(assets.manifest, options);
  for (const command of commands) {
    const layer = assets.manifest.layers[command.name];
    context.save();
    if (command.clip) context.clip(assets.clips[command.clip]);
    context.globalAlpha = command.alpha;
    context.drawImage(assets.images[command.name], layer.x + command.dx, layer.y + command.dy, layer.w, layer.h);
    context.restore();
  }
  if (options.lips?.active) paintSpeechMouth(context, assets.mouth, options.lips);
  else if (['correct', 'greeting', 'retry', 'listening'].includes(options.state)) {
    const layer = assets.manifest.layers.Mouth_Smile;
    context.drawImage(assets.images.Mouth_Smile, layer.x, layer.y, layer.w, layer.h);
  }
  return commands;
}
