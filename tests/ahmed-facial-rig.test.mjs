import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { validateAhmedManifest, planAhmedFrame, paintAhmed } from '../services/ahmedFacialRig.mjs';
import { REST_LIPS, SpeechLipSync } from '../services/speechLipSync.mjs';

const manifest = JSON.parse(fs.readFileSync(new URL('../public/avatars/ahmed-facial-v1.json', import.meta.url)));
test('Ahmed uses the exact prepared original with all required expressions', () => {
  assert.ok(validateAhmedManifest(manifest));
  const hash = crypto.createHash('sha256').update(fs.readFileSync(new URL('../public/avatars/ahmed-original.png', import.meta.url))).digest('hex');
  assert.equal(hash, manifest.sourceSha256);
  assert.deepEqual(planAhmedFrame(manifest), []);
});
test('incomplete, unapproved, other-character and out-of-bounds artwork cannot activate', () => {
  for (const mutate of [m => m.status = 'draft', m => m.characterId = 'saudi_male',
    m => delete m.layers.Mouth_O, m => m.layers.Blink_L_Closed.x = 1024,
    m => m.layers.Mouth_A.url = 'https://example.com/face.png', m => m.eyeClips.R = '']) {
    const m = structuredClone(manifest); mutate(m); assert.equal(validateAhmedManifest(m), null);
  }
});
test('gaze is clipped and bounded, only irises and pupils move', () => {
  const plan = planAhmedFrame(manifest, { gazeX: 99, gazeY: -99, state: 'thinking', blink: .5 });
  const moved = plan.filter(c => c.dx || c.dy);
  assert.equal(moved.length, 4);
  assert.ok(moved.every(c => /^(Iris|Pupil)_[RL]$/.test(c.name) && c.dx === 2 && c.dy === -1.5 && c.clip));
  assert.ok(plan.every(c => /^(Brow_|Face_Brow|EyeWhite_|Iris_|Pupil_|Blink_)/.test(c.name)));
  assert.equal(plan.filter(c => c.name.startsWith('Blink_')).length, 2);
});
test('speech state without actual output audio leaves the mouth closed', () => {
  const sync = new SpeechLipSync();
  const calls = [];
  const context = { drawImage: (...args) => calls.push(args) };
  const original = {};
  paintAhmed(context, { original, manifest }, { state: 'idle', lips: sync.read() });
  assert.equal(sync.read(), REST_LIPS);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], original);
  assert.ok(!planAhmedFrame(manifest, { state: 'speaking' }).some(c => c.name.startsWith('Mouth_')));
});
