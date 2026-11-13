import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { validateSaudiManifest, planSaudiFrame, paintSaudi, resolveSaudiAttention } from '../services/saudiFacialRig.mjs';
import { getTutorStageDirection, getTutorPartnerDirection, TUTOR_BODY_VIEWPORT } from '../services/tutorAttention.mjs';
const manifests = Object.fromEntries(['salman', 'sara'].map(name => [name, JSON.parse(fs.readFileSync(new URL(`../public/avatars/${name}-facial-v2.json`, import.meta.url)))]));

test('both Saudi sources and all registered facial sprites match the reviewed files', () => {
  for (const [name, manifest] of Object.entries(manifests)) {
    assert.ok(validateSaudiManifest(manifest, name));
    const source = fs.readFileSync(new URL('../public' + manifest.source, import.meta.url));
    assert.equal(crypto.createHash('sha256').update(source).digest('hex'), manifest.sourceSha256);
    assert.equal(manifest.pose.bodyFacing, name === 'salman' ? 'left' : 'right');
    assert.equal(manifest.pose.headFacing, 'student');
    for (const layer of Object.values(manifest.layers)) {
      const png = fs.readFileSync(new URL('../public' + layer.url, import.meta.url));
      assert.equal(png.readUInt32BE(16), layer.w); assert.equal(png.readUInt32BE(20), layer.h);
      assert.ok(layer.y >= 80 && layer.y + layer.h <= 260, 'facial sprites cannot touch the new body pose');
    }
  }
});
test('Saudi identity, version, mouth registration, clip paths and cover protection fail closed', () => {
  for (const [name, original] of Object.entries(manifests)) for (const change of [
    m => m.version = 1, m => m.characterId = 'egypt_male', m => m.source = '/avatars/ahmed-stance-v2.webp',
    m => delete m.layers.Mouth_FV, m => m.layers.Mouth_A.x++, m => m.eyeClips.R = '',
    m => m.layers.Brow_R.url = '/avatars/' + name + '-stance-v2/../wrong.png', m => m.layers.Brow_R.x = 1024
  ]) {
    const manifest = structuredClone(original); change(manifest); assert.equal(validateSaudiManifest(manifest, name), null);
  }
  for (const change of [m => m.coverings.pop(), m => m.layers.FaceCover.visible = false]) {
    const manifest = structuredClone(manifests.sara); change(manifest); assert.equal(validateSaudiManifest(manifest, 'sara'), null);
  }
});
test('Saudi turn-taking faces the partner then returns to the student in both languages', () => {
  for (const lang of ['ar', 'en']) {
    assert.equal(getTutorStageDirection('saudi', lang), 'rtl');
    for (const gender of ['male', 'female']) {
      const direction = getTutorPartnerDirection('saudi', gender, lang);
      assert.deepEqual(resolveSaudiAttention({ partnerSpeaking: true, partnerDirection: direction }), { state: 'listening', gazeX: gender === 'male' ? -1 : 1 });
      assert.deepEqual(resolveSaudiAttention({ isSpeaking: true, partnerSpeaking: true }), { state: 'speaking', gazeX: 0 });
      assert.deepEqual(resolveSaudiAttention({ isListening: true }), { state: 'listening', gazeX: 0 });
    }
  }
  assert.deepEqual(TUTOR_BODY_VIEWPORT, { x: 100, y: 0, w: 824, h: 1536 });
  assert.equal(getTutorStageDirection('bahrain', 'en'), 'ltr');
});
test('pupil movement is clipped and full blinks suppress open eyes without moving body or covering', () => {
  for (const manifest of Object.values(manifests)) {
    const plan = planSaudiFrame(manifest, { state: 'thinking', gazeX: 99 });
    const moved = plan.filter(c => c.dx || c.dy);
    assert.equal(moved.length, 4);
    assert.ok(moved.every(c => /^(Iris|Pupil)_[RL]$/.test(c.name) && c.dx === 2 && c.dy === 0 && c.clip));
    const blink = planSaudiFrame(manifest, { blink: 1, gazeX: -2 });
    assert.ok(!blink.some(c => /^(Iris|Pupil|EyeWhite|Lid)/.test(c.name)));
    assert.equal(blink.filter(c => c.name.startsWith('Blink_')).length, 2);
    assert.ok(plan.every(c => !/Body|Torso|Arm|Hand|Foot|Shemagh/.test(c.name)));
  }
});
test('speech brows stay bounded, and partner audio cannot reach the listening mouth', () => {
  for (const manifest of Object.values(manifests)) {
    const plan = planSaudiFrame(manifest, { state: 'speaking', emphasis: 99 });
    assert.ok(plan.filter(c => /^Brow_[RL]$/.test(c.name)).every(c => c.dy >= -1.05 && c.dy < 0));
    const calls = [], images = Object.fromEntries(Object.keys(manifest.layers).map(name => [name, { name }]));
    const context = { drawImage: (...args) => calls.push(args), save() {}, restore() {}, clip() {} };
    // An invalid compositor would throw if the partner's active cue reached speech painting.
    assert.doesNotThrow(() => paintSaudi(context, { original: {}, manifest, images, clips: { R: {}, L: {} }, mouth: {} }, { state: 'listening', lips: { active: true } }));
    if (manifest.coverings.length) assert.deepEqual(calls.slice(-3).map(c => c[0].name), manifest.coverings);
  }
});
