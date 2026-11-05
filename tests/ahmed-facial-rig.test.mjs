import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { validateAhmedManifest, planAhmedFrame, paintAhmed, resolveAhmedAttention } from '../services/ahmedFacialRig.mjs';
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
test('Ahmed attends to Fatima in either layout and faces the student on his own turn', () => {
  assert.deepEqual(resolveAhmedAttention({ partnerSpeaking: true, partnerDirection: 'left' }), { state: 'listening', gazeX: -1 });
  assert.deepEqual(resolveAhmedAttention({ partnerSpeaking: true, partnerDirection: 'right' }), { state: 'listening', gazeX: 1 });
  assert.deepEqual(resolveAhmedAttention({ isSpeaking: true, partnerSpeaking: true }), { state: 'speaking', gazeX: 0 });
  assert.deepEqual(resolveAhmedAttention({ isListening: true }), { state: 'listening', gazeX: 0 });
  assert.deepEqual(resolveAhmedAttention({ isLoading: true }), { state: 'thinking', gazeX: 0 });
  assert.deepEqual(resolveAhmedAttention(), { state: 'idle', gazeX: 0 });
});
test('speech emphasis moves a single brow outline within its facial patch and rests without audio', () => {
  assert.deepEqual(planAhmedFrame(manifest, { state: 'speaking', emphasis: 0 }), []);
  for (const emphasis of [0.1, 0.35, 99]) {
    const plan = planAhmedFrame(manifest, { state: 'speaking', emphasis });
    assert.deepEqual(plan.map(c => c.name), ['Face_BrowSkin_Rebuilt', 'Brow_R', 'Brow_L']);
    assert.ok(plan.slice(1).every(c => c.dy >= -1.05 && c.dy < 0 && c.dx === 0 && c.alpha === 1));
  }
});
test('listening draws attentive brows and a closed smile without introducing speech shapes', () => {
  const calls = [], images = Object.fromEntries(Object.keys(manifest.layers).map(name => [name, { name }]));
  paintAhmed({ drawImage: (...args) => calls.push(args), save() {}, restore() {} },
    { original: {}, manifest, images }, { state: 'listening', lips: REST_LIPS });
  assert.deepEqual(calls.slice(1).map(c => c[0].name), ['Face_BrowSkin_Rebuilt', 'Brow_R_Attentive', 'Brow_L_Attentive', 'Mouth_Smile']);
});
