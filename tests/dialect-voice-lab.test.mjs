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
