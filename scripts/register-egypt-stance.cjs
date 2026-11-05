// Register the existing authored facial sprites to the ImageGen-edited body poses.
// This calibrates sprite geometry and skin color; it does not invent facial artwork.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const [ahmedInput, fatimaInput] = process.argv.slice(2);
if (!ahmedInput || !fatimaInput) throw new Error('Supply the two edited full-body PNGs: Ahmed then Fatima');
const configs = [
  { name: 'ahmed', input: ahmedInput, facing: 'left', side: 'right',
    groups: { eyes: { x: 457, y: 137, tx: 456, ty: 137, sx: 114 / 113, sy: 1 }, mouth: { x: 480, y: 198, tx: 479, ty: 198, sx: 71 / 70, sy: 1 } } },
  { name: 'fatima', input: fatimaInput, facing: 'right', side: 'left',
    groups: { eyes: { x: 436, y: 121, tx: 436, ty: 121, sx: 1, sy: 39 / 38 }, mouth: { x: 482, y: 183, tx: 482, ty: 183, sx: 1, sy: 30 / 29 } } }
];
const median = values => values.sort((a, b) => a - b)[Math.floor(values.length / 2)] || 0;
const groupFor = name => name.startsWith('Mouth_') ? 'mouth' : /^(Blink_|Eyes_|EyeWhite_|Iris_|Pupil_)/.test(name) ? 'eyes' : 'brows';
const identity = { x: 0, y: 0, tx: 0, ty: 0, sx: 1, sy: 1 };
const rect = (layer, t) => ({ x: Math.round(t.tx + (layer.x - t.x) * t.sx), y: Math.round(t.ty + (layer.y - t.y) * t.sy),
  w: Math.round(layer.w * t.sx), h: Math.round(layer.h * t.sy) });
const crop = (image, r) => sharp(image).extract({ left: r.x, top: r.y, width: r.w, height: r.h });
async function register(config) {
  const { name, input } = config;
  const old = JSON.parse(fs.readFileSync(`public/avatars/${name}-facial-v1.json`));
  const oldSource = fs.readFileSync('public' + old.source);
  const metadata = await sharp(input).metadata();
  if (metadata.width !== 1024 || metadata.height !== 1536 || !metadata.hasAlpha) throw new Error('Unexpected pose dimensions or missing alpha: ' + name);
  const source = `/avatars/${name}-stance-v2.webp`;
  await sharp(input).webp({ lossless: true, effort: 6 }).toFile('public' + source);
  const nextSource = fs.readFileSync('public' + source);
  const directory = `/avatars/${name}-stance-v2`;
  fs.mkdirSync('public' + directory, { recursive: true });
  const layers = {};
  for (const [key, layer] of Object.entries(old.layers)) {
    const transform = config.groups[groupFor(key)] || identity;
    const next = rect(layer, transform);
    const sprite = layer.url.startsWith('data:') ? Buffer.from(layer.url.split(',')[1], 'base64') : fs.readFileSync('public' + layer.url);
    const authored = await sharp(sprite).resize(next.w, next.h).ensureAlpha().raw().toBuffer();
    const previous = await crop(oldSource, layer).resize(next.w, next.h).ensureAlpha().raw().toBuffer();
    const neutral = await crop(nextSource, next).ensureAlpha().raw().toBuffer();
    const samples = [[], [], []];
    for (let y = 0; y < next.h; y++) for (let x = 0; x < next.w; x++) {
      if (x > 2 && x < next.w - 3 && y > 2 && y < next.h - 3) continue;
      const i = (y * next.w + x) * 4;
      if (previous[i] < 70 || previous[i + 1] < 40 || previous[i] <= previous[i + 1] || previous[i + 1] <= previous[i + 2]) continue;
      for (let c = 0; c < 3; c++) samples[c].push(neutral[i + c] - previous[i + c]);
    }
    const delta = samples.map(values => Math.max(-20, Math.min(20, median(values))));
    const useNeutral = key === 'Mouth_Closed' || /^Brow_[RL]$/.test(key);
    for (let i = 0; i < authored.length; i += 4) {
      if (useNeutral) {
        for (let c = 0; c < 3; c++) authored[i + c] = neutral[i + c];
        authored[i + 3] = key === 'Mouth_Closed' ? neutral[i + 3] : Math.round(authored[i + 3] * neutral[i + 3] / 255);
      } else if (!/^(Iris_|Pupil_)/.test(key)) {
        for (let c = 0; c < 3; c++) authored[i + c] = Math.max(0, Math.min(255, authored[i + c] + delta[c]));
      }
    }
    const url = `${directory}/${key}.png`;
    await sharp(authored, { raw: { width: next.w, height: next.h, channels: 4 } }).png().toFile('public' + url);
    layers[key] = { ...next, visible: layer.visible, url };
  }
  const result = { ...old, version: 2, source, sourceSha256: crypto.createHash('sha256').update(nextSource).digest('hex'),
    pose: { bodyFacing: config.facing, bodyTurnDegrees: 18, headFacing: 'student', stageSide: config.side }, layers };
  if (old.eyeClips) {
    const t = config.groups.eyes;
    result.eyeClips = Object.fromEntries(Object.entries(old.eyeClips).map(([key, value]) => {
      let index = 0;
      return [key, value.replace(/-?\d+(?:\.\d+)?/g, number => {
        const x = index++ % 2 === 0;
        return String(Math.round((x ? t.tx + (Number(number) - t.x) * t.sx : t.ty + (Number(number) - t.y) * t.sy) * 1000) / 1000);
      })];
    }));
  }
  if (old.mouthBounds) result.mouthBounds = rect(old.mouthBounds, config.groups.mouth);
  fs.writeFileSync(`public/avatars/${name}-facial-v2.json`, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ name, source, bytes: nextSource.length, layers: Object.keys(layers).length, pose: result.pose }));
}
(async () => { for (const config of configs) await register(config); })().catch(error => { console.error(error); process.exit(1); });
