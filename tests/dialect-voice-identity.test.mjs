import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transform } from 'esbuild';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const page = read('pages/Dialects.tsx');
const halo = read('components/DialectVoiceHalo.tsx');
const voices = read('services/dialectVoiceProfiles.ts');
const policy = read('services/dialectTutorPolicy.ts');
const compiled = await transform(policy, { loader: 'ts', target: 'es2022', format: 'esm' });
const { getDialectTutorIdentity } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled.code).toString('base64')
);
const extractPalette = gender => {
  const rx = new RegExp('\\b' + gender + ': \\[([^\\]]+)\\]');
  const list = rx.exec(voices)?.[1];
  assert.ok(list, 'Missing ' + gender + ' voice palette');
  return [...list.matchAll(/'([^']+)'/g)].map(match => match[1]);
};
const maleVoices = extractPalette('male');
const femaleVoices = extractPalette('female');

test('approved and default voice palettes are disjoint between male and female', () => {
  assert.ok(maleVoices.length >= 3 && femaleVoices.length >= 3);
  for (const voice of maleVoices) assert.ok(!femaleVoices.includes(voice), voice);
  assert.match(voices, /VOICE_PALETTE\[data\.gender as DialectVoiceGender\]\.includes\(data\.voiceName\)/);
  assert.match(voices, /candidate\?\.approved && candidate\.reviewedArabic && candidate\.reviewedEnglish/);
});

test('a session selects its voice from the active real tutor, not cached UI selection', () => {
  const egypt = {
    characterMale: { nameAr: 'أحمد', nameEn: 'Ahmed' },
    characterFemale: { nameAr: 'فاطمة', nameEn: 'Fatima' }
  };
  const male = getDialectTutorIdentity(egypt, egypt.characterMale);
  const female = getDialectTutorIdentity(egypt, egypt.characterFemale);
  assert.equal(male.tutorGender, 'male');
  assert.equal(female.tutorGender, 'female');
  assert.notEqual(male.tutorGender, female.tutorGender);
  assert.match(page, /const tutorIdentity = getDialectTutorIdentity\(country, persona\)/);
  assert.match(page, /const liveGender = tutorIdentity\.tutorGender/);
  assert.match(page, /const liveProfile = publishedVoice\(tutorVoices, country\.id, liveGender\)/);
  assert.match(page, /VOICE_PALETTE\[liveGender\]\.includes\(liveProfile\.voiceName\)/);
  assert.match(page, /voiceConfig: \{ prebuiltVoiceConfig: \{ voiceName: liveProfile\.voiceName \} \}/);
  assert.doesNotMatch(page, /voiceName: publishedVoice\(tutorVoices, country\.id, persona\.nameEn/);
});

test('stale male session cannot send audio or microphone frames after female handoff', () => {
  assert.match(page, /liveSpeakerIdentityRef\.current = null/);
  assert.match(page, /generation, countryId: country\.id, nameEn: persona\.nameEn/);
  assert.match(page, /liveSpeakerIdentityRef\.current\?\.generation === generation/);
  assert.match(page, /liveSpeakerIdentityRef\.current\?\.gender === liveGender/);
  assert.match(page, /liveSpeakerIdentityRef\.current\?\.voiceName === liveProfile\.voiceName/);
  assert.match(page, /setupMicrophone\(session, generation\)/);
  assert.match(page, /generation !== liveGenerationRef\.current/);
  assert.match(page, /if \(!stillCurrent\(\)\) return;/);
  assert.match(page, /stopLiveConversation\(\);\s*setSelectedPersona\(target\);/);
  assert.match(page, /startLiveConversation\(target, speech\)/);
});

test('TTS dialogue and archive replay use the original speaker even if another is selected', () => {
  assert.match(page, /playAudio\(modelText, currentPersona\)/);
  assert.match(page, /getDialectTutorIdentity\(speechCountry, speechTutor\)\.tutorGender/);
  assert.match(page, /publishedVoice\(tutorVoices, speechCountry\.id, speechGender\)/);
  assert.match(halo, /onPronounce\(source, displayedRecord\?\.speakerName\)/);
  assert.match(page, /speakerName === selectedCountry\.characterFemale\.nameAr/);
  assert.match(page, /speakerName === selectedCountry\.characterMale\.nameAr/);
  assert.match(page, /void playAudio\(text, originalTutor\)/);
});

test('a delayed text response cannot speak with the previous tutor after switching', () => {
  assert.match(page, /const typedTurnVersionRef = React\.useRef\(0\)/);
  assert.match(page, /const typedTurnVersion = \+\+typedTurnVersionRef\.current/);
  assert.match(page, /if \(!typedTurnIsCurrent\(\)\) return/);
  assert.match(page, /typedTurnVersionRef\.current\+\+;\s+setIsChatLoading\(false\);\s+stopOneShotAudio\(\)/);
  assert.match(page, /if \(typedTurnIsCurrent\(\)\) setIsChatLoading\(false\)/);
});
