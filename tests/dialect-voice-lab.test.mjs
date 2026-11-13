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
