import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const lab = read('pages/VoiceLab.tsx');
const app = read('App.tsx');
const dialect = read('pages/Dialects.tsx');
const voices = read('services/dialectVoiceProfiles.ts');
const gateway = read('services/gemini.ts');
const rules = read('firestore.rules');

test('voice lab is staff-only and linked to dialects', () => {
  assert.match(app, /path="\/voice-lab" element=\{isTeacher \? <VoiceLab \/>/);
  assert.match(dialect, /staffVoiceLab && <button/);
  assert.match(lab, /const isAdmin = profile\?\.role === 'admin'/);
});

test('Arabic and English must both be played and reviewed to approve a voice', () => {
  assert.match(lab, /!played\.ar \|\| !played\.en \|\| !reviewed\.ar \|\| !reviewed\.en/);
  assert.match(voices, /!normalized\.reviewedArabic \|\| !normalized\.reviewedEnglish/);
  assert.match(voices, /candidate\?\.approved && candidate\.reviewedArabic && candidate\.reviewedEnglish/);
});

test('students cannot publish approved voice identities', () => {
  assert.match(rules, /match \/dialect_voice_profiles\/\{profileId\}/);
  assert.match(rules, /allow create, update: if isAdmin\(\)/);
  assert.match(rules, /request\.resource\.data\.reviewedEnglish == true/);
});

test('country and gender voice identities are used for live and synthesized speech', () => {
  assert.match(dialect, /publishedVoice\(tutorVoices, country\.id/);
  assert.match(dialect, /publishedVoice\(tutorVoices, speechCountry\.id, speechGender\)/);
  assert.match(voices, /voiceProfileKey = \(countryId: string, gender: DialectVoiceGender\)/);
});

test('Gemini TTS cache isolates voices and WAV decoding is not mistaken for raw PCM', () => {
  assert.match(gateway, /tts_v2_\$\{lang\}_\$\{voiceName\}_/);
  assert.match(gateway, /ctx\.decodeAudioData\(bufferArray\)/);
  assert.match(gateway, /data\[0\] === 82 && data\[1\] === 73 && data\[2\] === 70 && data\[3\] === 70/);
});

import { getDialectLiveError } from '../services/dialectLiveErrors.mjs';

test('dialect voice failures give specific safe Arabic and English guidance', () => {
  assert.match(getDialectLiveError({ name: 'NotAllowedError' }), /الميكروفون/);
  assert.match(getDialectLiveError({ name: 'NotFoundError' }, 'en'), /No microphone/);
  assert.match(getDialectLiveError({ code: 'LIVE_AUTH_REQUIRED' }, 'en'), /Sign in again/);
  assert.match(getDialectLiveError({ code: 'LIVE_ACCESS_DENIED' }), /صلاحية/);
  assert.match(getDialectLiveError({ code: 'LIVE_CLOSED' }), /انقطع الاتصال/);
  assert.doesNotMatch(getDialectLiveError(new Error('api key is secret')), /secret/);
});

test('dialect voice button reports connection progress and microphone failures', () => {
  const halo = read('components/DialectVoiceHalo.tsx');
  const orb = read('components/DialectVoiceOrb.tsx');
  assert.match(dialect, /setIsLiveConnecting\(true\)/);
  assert.match(dialect, /context\.resume\(\)/);
  assert.match(dialect, /\.catch\(failLiveConversation\)/);
  assert.match(dialect, /setLiveVoiceError\(getDialectLiveError\(error, lang\)\)/);
  assert.match(dialect, /setIsListening\(true\)/);
  assert.match(dialect, /console\.error\("Microphone Error:", err\);\s+throw err;/);
  assert.match(halo, /role="alert"/);
  assert.match(orb, /aria-busy=\{connecting\}/);
  const liveRequest = read('services/liveTokenRequest.mjs');
  assert.match(liveRequest, /LIVE_ACCESS_DENIED/);
});

test('voice orb renders the approved floating glass sphere without changing its audio behavior', () => {
  const orb = read('components/DialectVoiceOrb.tsx');
  const css = read('components/DialectVoiceOrb.css');
  const halo = read('components/DialectVoiceHalo.tsx');
  assert.match(orb, /import '\.\/DialectVoiceOrb\.css'/);
  assert.match(orb, /onClick=\{onToggle\}/);
  assert.match(orb, /aria-pressed=\{active\}/);
  assert.match(orb, /aria-busy=\{connecting\}/);
  assert.match(orb, /disabled=\{disabled\}/);
  assert.match(orb, /data-phase=\{phase\}/);
  assert.match(orb, /React\.useId\(\)/);
  assert.match(orb, /<svg className="dialect-orb__waves"/);
  assert.doesNotMatch(orb, /<img|backgroundImage:|https?:\/\//);
  for (const phase of ['connecting', 'listening', 'speaking', 'loading', 'active']) {
    assert.match(css, new RegExp('data-phase="' + phase + '"'));
  }
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /focus-visible/);
  assert.match(css, /touch-action:\s*manipulation/);
  assert.match(halo, /<DialectVoiceOrb/);
});

test('all 22 dialect voice orbs use their national colours with a neutral fallback', async () => {
  const { DIALECT_FLAG_ORB_PALETTES, getDialectFlagOrbPalette } = await import('../services/dialectFlagOrbPalette.mjs');
  const ids = [...dialect.slice(dialect.indexOf('export const COUNTRY_DATA = [')).matchAll(/^\s+id: '([a-z]+)',/gm)].map(match => match[1]);
  const countries = ids.slice(0, 22);
  assert.equal(countries.length, 22, 'The dialect catalogue has 22 countries');
  assert.equal(new Set(countries).size, 22, 'Country IDs are unique');
  assert.deepEqual(Object.keys(DIALECT_FLAG_ORB_PALETTES).sort(), countries.sort(), 'Every country needs a distinct national palette');
  for (const countryId of countries) {
    const palette = getDialectFlagOrbPalette(countryId);
    assert.ok(Object.isFrozen(palette) === false || Object.keys(palette).length === 5);
    assert.equal(Object.keys(palette).length, 5);
    for (const key of ['primary','secondary','accent','core','glow']) {
      assert.match(palette[key], /^#[0-9A-Fa-f]{6}$/, countryId + ' / ' + key);
    }
  }
  assert.notDeepEqual(getDialectFlagOrbPalette('uae'), getDialectFlagOrbPalette('jordan'));
  assert.notDeepEqual(getDialectFlagOrbPalette('egypt'), getDialectFlagOrbPalette('saudi'));
  assert.notDeepEqual(getDialectFlagOrbPalette('sudan'), getDialectFlagOrbPalette('somalia'));
  assert.notDeepEqual(getDialectFlagOrbPalette('nonexistent-country'), getDialectFlagOrbPalette('uae'), 'Unknown countries do not impersonate a flag');
});

test('flag colour follows the chosen dialect stage without changing voice control behaviour', () => {
  const halo = read('components/DialectVoiceHalo.tsx');
  const orb = read('components/DialectVoiceOrb.tsx');
  const css = read('components/DialectVoiceOrb.css');
  assert.match(dialect, /<DialectVoiceHalo/);
  assert.match(dialect, /countryId=\{selectedCountry\.id\}/);
  assert.match(halo, /<DialectVoiceOrb\s+countryId=\{countryId\}/);
  assert.match(orb, /getDialectFlagOrbPalette\(countryId\)/);
  assert.match(orb, /data-country=\{countryId\}/);
  assert.match(orb, /'--orb-primary': palette\.primary/);
  assert.match(orb, /getDialectGlassFlagLights\(countryId\)/, 'National optical colours must follow selected country');
  assert.match(orb, /className="dialect-orb__microphone"/, 'The microphone remains visibly on top of the glass');
  assert.match(orb, /onClick=\{onToggle\}/);
  assert.match(orb, /aria-busy=\{connecting\}/);
  assert.match(orb, /disabled=\{disabled\}/);
  assert.match(css, /color-mix\(in srgb, var\(--orb-primary\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(css, /#e358f5|#00d9f4|#f27ac1/i, 'Do not retain default Siri neon accents');
});


test('the crystal orb remains a microphone with subtle national flag pigments, not a pasted flag', async () => {
  const orb = read('components/DialectVoiceOrb.tsx');
  const css = read('components/DialectVoiceOrb.css');
  const oldLiteralFlags = read('components/DialectFlagGlassArt.tsx');
  const { DIALECT_GLASS_FLAG_LIGHTS, getDialectGlassFlagLights } =
    await import('../services/dialectOrbGlassIdentity.mjs');

  const countries = [
    'uae', 'egypt', 'saudi', 'palestine', 'syria', 'jordan', 'lebanon',
    'iraq', 'libya', 'tunisia', 'morocco', 'algeria', 'oman', 'bahrain',
    'qatar', 'kuwait', 'yemen', 'sudan', 'mauritania', 'somalia', 'comoros', 'djibouti'
  ];
  assert.deepEqual(Object.keys(DIALECT_GLASS_FLAG_LIGHTS).sort(), countries.sort());
  for (const id of countries) {
    const identity = getDialectGlassFlagLights(id);
    assert.deepEqual(Object.keys(identity).sort(), ['bottom','edge','middle','top']);
    for (const colour of Object.values(identity)) {
      assert.match(colour, /^#[A-Fa-f0-9]{6}$/, id + ' light map should use CSS hex colours');
    }
  }
  assert.notDeepEqual(getDialectGlassFlagLights('uae'), getDialectGlassFlagLights('egypt'));
  assert.notDeepEqual(getDialectGlassFlagLights('uae'), getDialectGlassFlagLights('nonexistent'));
  assert.equal(getDialectGlassFlagLights('uae').top, '#00843D');
  assert.equal(getDialectGlassFlagLights('uae').edge, '#CE1126');
  assert.equal(getDialectGlassFlagLights('uae').bottom, '#101820');

  assert.match(orb, /className="dialect-orb__microphone"/);
  assert.match(orb, /viewBox="0 0 48 48"/);
  assert.match(css, /\.dialect-orb__microphone/);
  assert.match(css, /z-index: 5/);
  assert.match(orb, /<svg className="dialect-orb__waves"/);
  assert.match(orb, /clipPath=\{'url\(#' \+ clipId \+ '\)'\}/);
  assert.doesNotMatch(orb, /<DialectFlagGlassArt|<rect[^>]*width="100"[^>]*height="100"/,
    'Flat literal flags must not render inside the voice orb');
  assert.ok(oldLiteralFlags.includes('export const DialectFlagGlassArt'),
    'The former emblem artwork may remain as a source file but is not rendered as the voice control');
  assert.match(orb, /dialect-orb__fabric--top/);
  assert.match(orb, /dialect-orb__fabric--middle/);
  assert.match(orb, /dialect-orb__fabric--bottom/);
  assert.match(orb, /dialect-orb__fabric--side/);
  assert.doesNotMatch(orb, /<image\b|<img\b|flagcdn|twemoji/);
});

test('clicking the voice control flutters only the inner light and emits outer audio ripples', () => {
  const orb = read('components/DialectVoiceOrb.tsx');
  const css = read('components/DialectVoiceOrb.css');
  for (const ring of ['one', 'two', 'three']) {
    assert.match(orb, new RegExp('dialect-orb__pulse--' + ring));
  }
  assert.match(css, /@keyframes dialect-orb-outer-ripple/);
  assert.match(css, /@keyframes dialect-orb-flag-flutter-a/);
  assert.match(css, /@keyframes dialect-orb-flag-flutter-b/);
  assert.match(css, /@keyframes dialect-orb-flag-flutter-c/);
  for (const phase of ['connecting', 'listening', 'speaking', 'loading', 'active']) {
    assert.ok(css.includes('[data-phase="' + phase + '"]'),
      'Animation must be active in phase ' + phase);
  }
  assert.match(css, /\.dialect-orb__pulse \{/);
  assert.match(css, /\.dialect-orb__fabric--top \{/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.dialect-orb__pulse \{ opacity: 0 !important; \}/);
  assert.match(orb, /aria-label=\{actionLabel\}/);
  assert.match(orb, /onClick=\{onToggle\}/);
  assert.match(orb, /disabled=\{disabled\}/);
});
