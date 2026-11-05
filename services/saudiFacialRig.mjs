import { paintSpeechMouth } from './speechMouth.mjs';
export { resolveTutorAttention as resolveSaudiAttention } from './tutorAttention.mjs';

export const SAUDI_MANIFEST_URLS = Object.freeze({ salman: '/avatars/salman-facial-v2.json', sara: '/avatars/sara-facial-v2.json' });
export const SAUDI_SOURCE_URLS = Object.freeze({ salman: '/avatars/salman-stance-v2.webp', sara: '/avatars/sara-stance-v2.webp' });
const REQUIRED = ['Face_BrowSkin_Rebuilt', ...['R', 'L'].flatMap(side => [
  `Brow_${side}`, `Brow_${side}_Thinking`, `Brow_${side}_Attentive`, `EyeWhite_${side}_Rebuilt`,
  `LidUpper_${side}`, `LidLower_${side}`, `Iris_${side}`, `Pupil_${side}`, `Blink_${side}_Closed`
]), ...['Closed', 'A', 'E', 'O', 'FV'].map(name => `Mouth_${name}`)];
const COVERS = ['FaceCover', 'FaceCover_Band', 'FaceCover_Strap'];
const clamp = (number, min, max) => Math.min(max, Math.max(min, Number.isFinite(number) ? number : 0));

export function validateSaudiManifest(value, name) {
  if (!['salman', 'sara'].includes(name) || !value || value.version !== 2 || value.status !== 'reviewed' ||
      value.characterId !== (name === 'salman' ? 'saudi_male' : 'saudi_female') ||
      value.width !== 1024 || value.height !== 1536 || value.source !== SAUDI_SOURCE_URLS[name] ||
      !value.layers || REQUIRED.some(key => !value.layers[key]) || !Array.isArray(value.coverings) ||
      !value.eyeClips || !['R', 'L'].every(side => typeof value.eyeClips[side] === 'string' && value.eyeClips[side].length)) return null;
  const location = new RegExp('^/avatars/' + name + '-stance-v2/[A-Za-z0-9_-]+\\.png$');
  for (const layer of Object.values(value.layers)) {
    if (!layer || ![layer.x, layer.y, layer.w, layer.h].every(Number.isInteger) ||
        layer.x < 0 || layer.y < 0 || layer.w <= 0 || layer.h <= 0 ||
        layer.x + layer.w > value.width || layer.y + layer.h > value.height ||
        typeof layer.visible !== 'boolean' || typeof layer.url !== 'string' || !location.test(layer.url)) return null;
  }
  const closed = value.layers.Mouth_Closed;
  if (['A', 'E', 'O', 'FV'].some(shape => ['x', 'y', 'w', 'h'].some(key => value.layers[`Mouth_${shape}`][key] !== closed[key]))) return null;
  if (name === 'sara') {
    if (value.coverings.length !== COVERS.length || COVERS.some(key => !value.coverings.includes(key) || value.layers[key]?.visible !== true)) return null;
  } else if (value.coverings.length) return null;
  return value;
}

/** Face-only overlays. The edited body is never rebuilt from the old body layers. */
export function planSaudiFrame(manifest, { state = 'idle', blink = 0, gazeX = 0, emphasis = 0 } = {}) {
  const result = [], amount = clamp(blink, 0, 1), dx = clamp(gazeX, -2, 2);
  const add = (name, alpha = 1, x = 0, y = 0, clip) => result.push({ name, alpha, dx: x, dy: y, ...(clip ? { clip } : {}) });
  const suffix = state === 'thinking' ? 'Thinking' : ['listening', 'correct', 'greeting', 'retry'].includes(state) ? 'Attentive' : '';
  const speakingBrows = state === 'speaking' && emphasis > 0;
  if (suffix || speakingBrows) {
    add('Face_BrowSkin_Rebuilt');
    for (const side of ['R', 'L']) add(`Brow_${side}${suffix ? '_' + suffix : ''}`, 1, 0, speakingBrows ? -3 * clamp(emphasis, 0, 0.35) : 0);
  }
  if (dx && amount < 1) {
    for (const side of ['R', 'L']) {
      add(`EyeWhite_${side}_Rebuilt`, 1, 0, 0, side);
      add(`Iris_${side}`, 1, dx, 0, side); add(`Pupil_${side}`, 1, dx, 0, side);
    }
  }
  if (amount) for (const side of ['R', 'L']) add(`Blink_${side}_Closed`, amount);
  for (const name of manifest.coverings) add(name);
  return result;
}

export function paintSaudi(context, assets, options = {}) {
  context.drawImage(assets.original, 0, 0, assets.manifest.width, assets.manifest.height);
  const commands = planSaudiFrame(assets.manifest, options);
  const draw = command => {
    const layer = assets.manifest.layers[command.name];
    context.save();
    if (command.clip) context.clip(assets.clips[command.clip]);
    if (command.name.startsWith('EyeWhite_')) {
      // Clear the original iris only. Keep the edited source's eyelashes, corners
      // and surrounding eye whites untouched while the authored iris moves.
      const iris = assets.manifest.layers['Iris_' + command.clip];
      context.beginPath(); context.rect(iris.x - 1, iris.y - 1, iris.w + 2, iris.h + 2); context.clip();
    }
    context.globalAlpha = command.alpha;
    context.drawImage(assets.images[command.name], layer.x + command.dx, layer.y + command.dy, layer.w, layer.h);
    context.restore();
  };
  const covers = new Set(assets.manifest.coverings);
  for (const command of commands) if (!covers.has(command.name)) draw(command);
  if (options.state === 'speaking' && options.lips?.active && assets.mouth) paintSpeechMouth(context, assets.mouth, options.lips);
  else if (['listening', 'correct', 'greeting', 'retry'].includes(options.state) && assets.manifest.layers.Mouth_Smile) {
    draw({ name: 'Mouth_Smile', alpha: 1, dx: 0, dy: 0 });
  }
  // Mouth compositing also excludes this mask. Draw the unchanged metal parts last.
  for (const command of commands) if (covers.has(command.name)) draw(command);
  return commands;
}
