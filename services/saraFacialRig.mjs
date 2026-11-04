import { paintSpeechMouth } from './speechMouth.mjs';
/** Sara uses original-pixel face layers. This is not a Cubism model loader. */
export const SARA_MANIFEST_URL = '/avatars/sara-layers.json';
export const SARA_ORIGINAL_URL = '/avatars/sara-original.png';

const EYE_PART = /^(?:EyeWhite_[RL]_Original|Lid(?:Upper|Lower)_[RL]|Iris_[RL]|Pupil_[RL])$/;
const MOVING_PUPIL = /^(?:Iris|Pupil)_([RL])$/;
const FORBIDDEN_MOUTH = /^Mouth_(?:A|E|O|Open|Smile|Viseme)(?:_|$)/i;
const REQUIRED = [
  'Brow_R', 'Brow_L', 'EyeWhite_R_Original', 'EyeWhite_L_Original',
  'Iris_R', 'Iris_L', 'Pupil_R', 'Pupil_L', 'Blink_R_Closed', 'Blink_L_Closed',
  'Face_HiddenSkin_Rebuilt', 'EyeWhite_R_Rebuilt', 'EyeWhite_L_Rebuilt', 'FaceCover'
];
const clamp = (value, lower, upper) => Math.min(upper, Math.max(lower, value));

export function validateSaraManifest(value) {
  if (!value || value.width !== 1024 || value.height !== 1536 || value.mouthVisible !== false ||
      !value.layers || typeof value.layers !== 'object' || Array.isArray(value.layers)) return null;
  const entries = Object.entries(value.layers);
  if (entries.length === 0 || REQUIRED.some(name => !Object.hasOwn(value.layers, name))) return null;
  if (value.layers.FaceCover?.visible !== true) return null;
  for (const [name, layer] of entries) {
    if (FORBIDDEN_MOUTH.test(name) || !layer || typeof layer.visible !== 'boolean' ||
        ![layer.x, layer.y, layer.w, layer.h].every(Number.isInteger) ||
        layer.x < 0 || layer.y < 0 || layer.w <= 0 || layer.h <= 0 ||
        layer.x + layer.w > value.width || layer.y + layer.h > value.height ||
        typeof layer.url !== 'string' ||
        !(/^(?:\/avatars\/sara-layers\/[A-Za-z0-9_-]+\.png|data:image\/png;base64,[A-Za-z0-9+/=]+)$/.test(layer.url))) return null;
  }
  const order = value.order ?? entries.map(([name]) => name).reverse();
  if (!Array.isArray(order) || order.length !== entries.length || new Set(order).size !== entries.length ||
      order.some(name => typeof name !== 'string' || !Object.hasOwn(value.layers, name))) return null;
  if (!value.eyeClips || !['R', 'L'].every(side => typeof value.eyeClips[side] === 'string' && value.eyeClips[side].length > 0)) return null;
  return { ...value, order };
}

/** The neutral plan draws only original visible parts, in their authored order. */
export function planSaraFrame(manifest, { blink = 0, state = 'idle', gazeX = 0, gazeY = 0 } = {}) {
  const commands = [];
  const amount = clamp(Number.isFinite(blink) ? blink : 0, 0, 1);
  const dx = clamp(Number.isFinite(gazeX) ? gazeX : 0, -2, 2);
  const dy = clamp(Number.isFinite(gazeY) ? gazeY : 0, -1.5, 1.5);
  const suffix = state === 'thinking' ? '_Thinking'
    : ['listening', 'speaking', 'greeting', 'correct', 'retry'].includes(state) ? '_Attentive' : '';
  const replacingBrows = suffix && ['R', 'L'].every(side => manifest.layers['Brow_' + side + suffix]);
  const covers = manifest.order.filter(name => /^FaceCover(?:_|$)/.test(name) && manifest.layers[name].visible);
  const add = (name, alpha = 1, x = 0, y = 0, clip) => {
    if (manifest.layers[name] && alpha > 0) commands.push({ name, alpha, dx: x, dy: y, ...(clip ? { clip } : {}) });
  };
  if (amount > 0 || replacingBrows) add('Face_HiddenSkin_Rebuilt');
  if (dx !== 0 || dy !== 0) {
    add('EyeWhite_R_Rebuilt');
    add('EyeWhite_L_Rebuilt');
  }
  for (const name of manifest.order) {
    if (!manifest.layers[name].visible) continue;
    if (covers.includes(name)) continue;
    if (name === 'Brow_R' || name === 'Brow_L') {
      add(replacingBrows ? name + suffix : name);
      continue;
    }
    const pupil = MOVING_PUPIL.exec(name);
    add(name, EYE_PART.test(name) ? 1 - amount : 1, pupil ? dx : 0, pupil ? dy : 0,
      pupil && (dx !== 0 || dy !== 0) ? pupil[1] : undefined);
  }
  if (amount > 0) {
    add('Blink_R_Closed', amount);
    add('Blink_L_Closed', amount);
  }
  for (const name of covers) add(name);
  return commands;
}

/**
 * Shared by the app and deterministic native-resolution artwork QA.
 * The caller owns canvas clearing and viewport/device-pixel transforms.
 * Node callers supply their canvas implementation's Path2D class or clips.
 */
export function paintSara(context, assets, options = {}, Path2DClass = globalThis.Path2D) {
  const { manifest, images } = assets;
  const commands = planSaraFrame(manifest, {
    ...options,
    gazeX: options.gazeX ?? options.gaze?.x ?? 0,
    gazeY: options.gazeY ?? options.gaze?.y ?? 0
  });
  let clips = assets.clips;
  if (commands.some(command => command.clip) && !clips) {
    if (!Path2DClass) throw new Error('Sara gaze requires eye clipping support');
    clips = { R: new Path2DClass(manifest.eyeClips.R), L: new Path2DClass(manifest.eyeClips.L) };
  }
  let mouthPainted = false;
  for (const command of commands) {
    // Speech is confined to the original visible mouth; metal covering stays on top.
    if (!mouthPainted && assets.mouth && options.lips?.active && /^FaceCover(?:_|$)/.test(command.name)) {
      paintSpeechMouth(context, assets.mouth, options.lips);
      mouthPainted = true;
    }
    const layer = manifest.layers[command.name];
    const sprite = images[command.name];
    if (!layer || !sprite) throw new Error('Missing Sara painting layer: ' + command.name);
    context.save();
    if (command.clip) context.clip(clips[command.clip]);
    context.globalAlpha = command.alpha;
    context.drawImage(sprite, layer.x + command.dx, layer.y + command.dy, layer.w, layer.h);
    context.restore();
  }
  return commands;
}
