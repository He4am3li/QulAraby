import { paintSpeechMouth } from './speechMouth.mjs';

export const FATIMA_MANIFEST_URL = '/avatars/fatima-facial-v1.json';
export const FATIMA_ORIGINAL_URL = '/avatars/fatima-original.png';
const required = ['Blink_R_Closed', 'Blink_L_Closed', 'Eyes_Left', 'Eyes_Right', 'Brows_Thinking',
  ...['Closed', 'A', 'E', 'O', 'FV', 'Smile'].map(shape => `Mouth_${shape}`)];

export function validateFatimaManifest(value) {
  if (!value || value.version !== 1 || value.status !== 'reviewed' || value.characterId !== 'egypt_female' ||
      value.width !== 1024 || value.height !== 1536 || value.source !== FATIMA_ORIGINAL_URL ||
      !value.layers || required.some(name => !Object.hasOwn(value.layers, name))) return null;
  for (const layer of Object.values(value.layers)) {
    if (!layer || ![layer.x, layer.y, layer.w, layer.h].every(Number.isInteger) ||
        layer.x < 0 || layer.y < 0 || layer.w <= 0 || layer.h <= 0 ||
        layer.x + layer.w > value.width || layer.y + layer.h > value.height ||
        typeof layer.visible !== 'boolean' || typeof layer.url !== 'string' ||
        !/^\/avatars\/fatima-layers\/[A-Za-z0-9_-]+\.png$/.test(layer.url)) return null;
  }
  const mouth = value.layers.Mouth_Closed;
  if (['A', 'E', 'O', 'FV', 'Smile'].some(shape => ['x', 'y', 'w', 'h'].some(key =>
    value.layers[`Mouth_${shape}`][key] !== mouth[key]))) return null;
  return value;
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : 0));
/** The active speaker owns attention; never borrow the partner's audio for Fatima's mouth. */
export function resolveFatimaAttention({ isSpeaking = false, isListening = false, isLoading = false,
  partnerSpeaking = false, partnerDirection = 'left', reaction = 'idle' } = {}) {
  if (isSpeaking) return { state: 'speaking', gazeX: 0 };
  if (partnerSpeaking) return { state: 'listening', gazeX: partnerDirection === 'right' ? 1 : -1 };
  if (isListening) return { state: 'listening', gazeX: 0 };
  if (isLoading) return { state: 'thinking', gazeX: 0 };
  return { state: reaction, gazeX: 0 };
}

/** Facial patches are registered to the source; dress, veil and jewelry remain untouched. */
export function planFatimaFrame(manifest, { blink = 0, gazeX = 0, state = 'idle', emphasis = 0 } = {}) {
  const commands = [];
  const add = (name, alpha = 1) => commands.push({ name, alpha });
  const closed = clamp(blink, 0, 1), gaze = clamp(gazeX, -1, 1);
  if (state === 'thinking') add('Brows_Thinking');
  else if (state === 'listening') add('Brows_Thinking', 0.16);
  else if (state === 'speaking' && emphasis > 0) add('Brows_Thinking', clamp(emphasis, 0, 0.35));
  // Replace the complete eye patch: crossfading it with the original produces double pupils.
  // The avatar changes direction under a blink instead.
  if (gaze && closed < 1) add(gaze < 0 ? 'Eyes_Left' : 'Eyes_Right');
  if (closed) for (const side of ['R', 'L']) add(`Blink_${side}_Closed`, closed);
  return commands;
}

export function paintFatima(context, assets, options = {}) {
  context.drawImage(assets.original, 0, 0, assets.manifest.width, assets.manifest.height);
  const commands = planFatimaFrame(assets.manifest, options);
  for (const { name, alpha } of commands) {
    const layer = assets.manifest.layers[name];
    context.save(); context.globalAlpha = alpha;
    context.drawImage(assets.images[name], layer.x, layer.y, layer.w, layer.h);
    context.restore();
  }
  if (options.lips?.active) paintSpeechMouth(context, assets.mouth, options.lips);
  else if (['correct', 'greeting', 'retry', 'listening'].includes(options.state)) {
    const layer = assets.manifest.layers.Mouth_Smile;
    context.drawImage(assets.images.Mouth_Smile, layer.x, layer.y, layer.w, layer.h);
  }
  return commands;
}
