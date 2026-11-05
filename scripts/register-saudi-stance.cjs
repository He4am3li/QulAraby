// Register the approved authored Saudi face layers to ImageGen-edited body poses.
const fs = require('node:fs');
const crypto = require('node:crypto');
const sharp = require('sharp');
const [salmanInput, saraInput] = process.argv.slice(2);
if (!salmanInput || !saraInput) throw new Error('Supply Salman and Sara edited full-body PNGs');
const identity = { x: 0, y: 0, tx: 0, ty: 0, sx: 1, sy: 1 };
const configs = [
  { name: 'salman', input: salmanInput, gender: 'male', facing: 'left',
    groups: { eyes: { x: 468, y: 118, tx: 467, ty: 118, sx: 120 / 119, sy: 1 }, mouth: { x: 486, y: 183, tx: 485, ty: 183, sx: 78 / 77, sy: 1 }, brows: { x: 452, y: 96, tx: 451, ty: 96, sx: 147 / 146, sy: 1 } } },
  { name: 'sara', input: saraInput, gender: 'female', facing: 'right',
    groups: { eyes: { x: 420, y: 124, tx: 420, ty: 124, sx: 1, sy: 31 / 30 }, mouth: { x: 453, y: 190, tx: 453, ty: 191, sx: 68 / 66, sy: 1 }, brows: { x: 415, y: 103, tx: 415, ty: 104, sx: 1, sy: 24 / 25 }, cover: { x: 411, y: 145, tx: 411, ty: 145, sx: 1, sy: 51 / 50 } } }
];
const bytesFor = layer => layer.url.startsWith('data:') ? Buffer.from(layer.url.split(',')[1], 'base64') : fs.readFileSync('public' + layer.url);
const crop = (image, r) => sharp(image).extract({ left: r.x, top: r.y, width: r.w, height: r.h });
const transformRect = (r, t) => ({ x: Math.round(t.tx + (r.x - t.x) * t.sx), y: Math.round(t.ty + (r.y - t.y) * t.sy), w: Math.round(r.w * t.sx), h: Math.round(r.h * t.sy) });
const median = values => values.sort((a, b) => a - b)[Math.floor(values.length / 2)] || 0;
const smooth = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
async function register(config) {
  const { name, input } = config;
  const old = JSON.parse(fs.readFileSync(`public/avatars/${name}-layers.json`));
  let oldSource;
  if (name === 'salman') {
    const hidden = new Set(['Face_HiddenSkin_Rebuilt', 'Neck_HiddenExtension_Rebuilt', 'Torso_HiddenShoulders_Rebuilt', 'EyeWhite_R_Rebuilt', 'EyeWhite_L_Rebuilt']);
    oldSource = await sharp({ create: { width: 1024, height: 1536, channels: 4, background: '#00000000' } }).composite(
      Object.keys(old.layers).reverse().filter(key => old.layers[key].visible && !hidden.has(key)).map(key => ({ input: bytesFor(old.layers[key]), left: old.layers[key].x, top: old.layers[key].y }))
    ).png().toBuffer();
  } else oldSource = fs.readFileSync('public/avatars/sara-original.png');
  const meta = await sharp(input).metadata();
  if (meta.width !== 1024 || meta.height !== 1536 || !meta.hasAlpha) throw new Error('Invalid transparent pose: ' + name);
  const source = `/avatars/${name}-stance-v2.webp`;
  await sharp(input).webp({ lossless: true, effort: 6 }).toFile('public' + source);
  const nextSource = fs.readFileSync('public' + source), parts = {};
  for (const [key, layer] of Object.entries(old.layers)) {
    if (/^(Brow_|EyeWhite_.*_Rebuilt|Iris_|Pupil_|Lid|Blink_|FaceCover)/.test(key)) parts[key] = { ...layer, data: bytesFor(layer) };
    if (name === 'salman' && /^Mouth_/.test(key)) parts[key] = { ...layer, data: bytesFor(layer) };
  }
  const skin = old.layers.Face_HiddenSkin_Rebuilt;
  const skinBounds = name === 'salman' ? { x: 449, y: 92, w: 151, h: 35 } : { x: 418, y: 105, w: 133, h: 24 };
  parts.Face_BrowSkin_Rebuilt = { ...skinBounds, visible: false, data: await sharp(bytesFor(skin)).extract({ left: skinBounds.x - skin.x, top: skinBounds.y - skin.y, width: skinBounds.w, height: skinBounds.h }).png().toBuffer() };
  if (name === 'salman') {
    parts.Mouth_Closed = { ...parts.Mouth_A, visible: true, neutral: true };
    parts.Mouth_FV = { ...parts.Mouth_E, visible: false };
  } else {
    const mouth = JSON.parse(fs.readFileSync('public/avatars/sara-mouth-v1.json'));
    for (const key of ['Closed', 'A', 'E', 'O', 'FV']) parts['Mouth_' + key] = { ...mouth.layers[key], data: bytesFor(mouth.layers[key]), visible: key === 'Closed', neutral: key === 'Closed' };
  }
  const directory = `/avatars/${name}-stance-v2`;
  fs.mkdirSync('public' + directory, { recursive: true });
  const layers = {};
  for (const [key, part] of Object.entries(parts)) {
    const group = key.startsWith('Mouth_') ? 'mouth' : /^(Brow_|Face_Brow)/.test(key) ? 'brows' : key === 'FaceCover' ? 'cover' : /^FaceCover_/.test(key) ? 'none' : 'eyes';
    const t = config.groups[group] || identity, next = transformRect(part, t);
    const authored = await sharp(part.data).resize(next.w, next.h).ensureAlpha().raw().toBuffer();
    const previous = await crop(oldSource, part).resize(next.w, next.h).ensureAlpha().raw().toBuffer();
    const neutral = await crop(nextSource, next).ensureAlpha().raw().toBuffer(), samples = [[], [], []];
    for (let y = 0; y < next.h; y++) for (let x = 0; x < next.w; x++) {
      if (x > 2 && x < next.w - 3 && y > 2 && y < next.h - 3) continue;
      const i = (y * next.w + x) * 4;
      if (previous[i] < 70 || previous[i + 1] < 40 || previous[i] <= previous[i + 1] || previous[i + 1] <= previous[i + 2]) continue;
      for (let c = 0; c < 3; c++) samples[c].push(neutral[i + c] - previous[i + c]);
    }
    const delta = samples.map(values => Math.max(-20, Math.min(20, median(values))));
    const useNeutral = part.neutral || /^Brow_[RL]$/.test(key) || /^(FaceCover|Lid|Iris_|Pupil_)/.test(key);
    for (let i = 0; i < authored.length; i += 4) {
      if (useNeutral) {
        for (let c = 0; c < 3; c++) authored[i + c] = neutral[i + c];
        authored[i + 3] = part.neutral ? neutral[i + 3] : Math.round(authored[i + 3] * neutral[i + 3] / 255);
      } else if (!/^(Iris_|Pupil_|Lid)/.test(key)) {
        for (let c = 0; c < 3; c++) authored[i + c] = Math.max(0, Math.min(255, authored[i + c] + delta[c]));
      }
    }
    // Authored brow rectangles include surrounding skin. Feather that skin locally
    // rather than placing a visible rectangular patch across the forehead or eyes.
    if (/^(Brow_|Face_Brow)/.test(key)) {
      const sides = key.startsWith('Brow_R') ? ['R'] : key.startsWith('Brow_L') ? ['L'] : ['R', 'L'];
      const bounds = sides.map(side => transformRect(old.layers['Brow_' + side], config.groups.brows));
      for (let y = 0; y < next.h; y++) for (let x = 0; x < next.w; x++) {
        let opacity = 0;
        for (const b of bounds) {
          const radius = Math.hypot((next.x + x - b.x - b.w / 2) / (b.w / 2 + 4), (next.y + y - b.y - b.h / 2) / (b.h / 2 + 2));
          opacity = Math.max(opacity, smooth((1 - radius) / 0.25));
        }
        const i = (y * next.w + x) * 4; authored[i + 3] = Math.round(authored[i + 3] * opacity);
      }
    }
    const url = `${directory}/${key}.png`;
    await sharp(authored, { raw: { width: next.w, height: next.h, channels: 4 } }).png().toFile('public' + url);
    layers[key] = { ...next, visible: part.visible, url };
  }
  const paths = name === 'sara' ? old.eyeClips : {
    R: 'M472 130Q485 117 497 120Q507 121 515 129Q506 142 493 141Q480 141 472 132Z',
    L: 'M542 131Q550 118 562 121Q574 121 582 130Q573 142 561 142Q550 141 542 133Z'
  };
  const t = config.groups.eyes;
  const eyeClips = Object.fromEntries(Object.entries(paths).map(([key, value]) => {
    let index = 0;
    return [key, value.replace(/-?\d+(?:\.\d+)?/g, number => {
      const x = index++ % 2 === 0;
      return String(Math.round((x ? t.tx + (Number(number) - t.x) * t.sx : t.ty + (Number(number) - t.y) * t.sy) * 1000) / 1000);
    })];
  }));
  const result = { version: 2, status: 'reviewed', characterId: 'saudi_' + config.gender, width: 1024, height: 1536,
    source, sourceSha256: crypto.createHash('sha256').update(nextSource).digest('hex'),
    pose: { bodyFacing: config.facing, bodyTurnDegrees: 18, headFacing: 'student', stageSide: config.gender === 'male' ? 'right' : 'left' },
    coverings: name === 'sara' ? ['FaceCover', 'FaceCover_Band', 'FaceCover_Strap'] : [],
    mouthVisible: true, eyeClips, layers };
  fs.writeFileSync(`public/avatars/${name}-facial-v2.json`, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ name, bytes: nextSource.length, layers: Object.keys(layers).length }));
}
(async () => { for (const config of configs) await register(config); })().catch(error => { console.error(error); process.exit(1); });
