import test from 'node:test';
import assert from 'node:assert/strict';
import { planSaraFrame, validateSaraManifest } from '../services/saraFacialRig.mjs';

const sourceNames = ['Body', 'Face_Base', 'Brow_R', 'Brow_L', 'EyeWhite_R_Original', 'EyeWhite_L_Original', 'LidUpper_R', 'LidUpper_L', 'LidLower_R', 'LidLower_L', 'Iris_R', 'Iris_L', 'Pupil_R', 'Pupil_L', 'Lip_Original_Static', 'FaceCover'];
const hiddenNames = ['Face_HiddenSkin_Rebuilt', 'EyeWhite_R_Rebuilt', 'EyeWhite_L_Rebuilt', 'Blink_R_Closed', 'Blink_L_Closed', 'Brow_R_Thinking', 'Brow_L_Thinking', 'Brow_R_Attentive', 'Brow_L_Attentive'];
function fixture() {
  const layers = {};
  for (const name of [...sourceNames, ...hiddenNames]) layers[name] = {
    x: 430, y: 100, w: 50, h: 35, visible: sourceNames.includes(name), url: '/avatars/sara-layers/' + name + '.png'
  };
  return { width: 1024, height: 1536, mouthVisible: false, layers, order: Object.keys(layers), eyeClips: { R: 'M430 100h50v35h-50Z', L: 'M500 100h50v35h-50Z' } };
}

test('valid Sara source contract accepts the full set without enabling hidden artwork', () => {
  const manifest = validateSaraManifest(fixture());
  assert.ok(manifest);
  const plan = planSaraFrame(manifest);
  assert.equal(plan.length, sourceNames.length);
  assert.deepEqual(new Set(plan.map(c => c.name)), new Set(sourceNames));
  assert.ok(plan.every(c => c.dx === 0 && c.dy === 0 && c.alpha === 1));
});

test('closed-eye state replaces original eye parts and protects the unchanged face covering', () => {
  const manifest = validateSaraManifest(fixture());
  const plan = planSaraFrame(manifest, { blink: 1, state: 'speaking' });
  assert.ok(plan.some(c => c.name === 'Blink_R_Closed' && c.alpha === 1));
  assert.ok(plan.some(c => c.name === 'Blink_L_Closed' && c.alpha === 1));
  assert.ok(!plan.some(c => /^(?:Iris|Pupil|Lid|EyeWhite_[RL]_Original)/.test(c.name)));
  assert.equal(plan.at(-1).name, 'FaceCover');
  assert.deepEqual(plan.find(c => c.name === 'Lip_Original_Static'), { name: 'Lip_Original_Static', alpha: 1, dx: 0, dy: 0 });
});

test('gaze moves only pupils and irises inside their own eye apertures', () => {
  const plan = planSaraFrame(validateSaraManifest(fixture()), { gazeX: 99, gazeY: -99, state: 'thinking' });
  const moved = plan.filter(c => c.dx !== 0 || c.dy !== 0);
  assert.equal(moved.length, 4);
  assert.ok(moved.every(c => /^(?:Iris|Pupil)_[RL]$/.test(c.name) && c.dx === 2 && c.dy === -1.5 && ['R', 'L'].includes(c.clip)));
  assert.ok(plan.some(c => c.name === 'EyeWhite_R_Rebuilt'));
  assert.ok(plan.some(c => c.name === 'EyeWhite_L_Rebuilt'));
});

test('speech never introduces mouth shapes or moves clothing or the source lips', () => {
  const manifest = validateSaraManifest(fixture());
  for (const state of ['idle', 'speaking', 'listening', 'thinking', 'correct', 'retry', 'greeting']) {
    const plan = planSaraFrame(manifest, { state, blink: .5, gazeX: .5 });
    assert.ok(!plan.some(c => /^Mouth_/.test(c.name)));
    assert.deepEqual(plan.find(c => c.name === 'Lip_Original_Static'), { name: 'Lip_Original_Static', alpha: 1, dx: 0, dy: 0 });
    assert.deepEqual(plan.find(c => c.name === 'Body'), { name: 'Body', alpha: 1, dx: 0, dy: 0 });
  }
});

test('invalid sprite locations, decoded dimensions metadata and incomplete order are rejected', () => {
  for (const mutate of [
    m => { m.layers.Brow_R.url = 'https://example.com/other-face.png'; },
    m => { m.layers.Brow_R.x = 1020; },
    m => { m.layers.Brow_R.w = -1; },
    m => { m.order.pop(); },
    m => { m.order[1] = m.order[0]; },
    m => { delete m.layers.Blink_L_Closed; },
    m => { m.eyeClips.R = ''; },
    m => { m.layers.FaceCover.visible = false; }
  ]) {
    const m = fixture(); mutate(m); assert.equal(validateSaraManifest(m), null);
  }
});

test('a mouth-visible manifest or an accidental speaking mouth cannot activate Sara', () => {
  const wrongFace = fixture(); wrongFace.mouthVisible = true;
  assert.equal(validateSaraManifest(wrongFace), null);
  const wrongMouth = fixture(); wrongMouth.layers.Mouth_A = { ...wrongMouth.layers.Brow_R }; wrongMouth.order.push('Mouth_A');
  assert.equal(validateSaraManifest(wrongMouth), null);
});
