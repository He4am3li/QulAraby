import test from 'node:test';
import assert from 'node:assert/strict';
import { RADIO_TEXT_CORPUS } from '../src/data/radioTextCorpus';
import { RADIO_AUTHORED_EXERCISES } from '../src/data/radioAuthoredExercises';
import { RADIO_REVIEWED_VOCABULARY } from '../src/data/radioReviewedVocabulary';
import { getRadioDifficultWords } from '../src/data/radioVocabulary';
import { localArabicVoices, radioSpeechChunks } from '../src/data/radioSpeech';

const normalize = (value: string) => value.normalize('NFKC')
  .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
  .replace(/([\u0621-\u064A])\s+ا(?=[\s،.!؟؛]|$)/g, '$1ا')
  .replace(/[^\u0621-\u064A]+/g, ' ').trim();

test('all 150 passages have exactly four unique, source-grounded vocabulary items', () => {
  assert.equal(RADIO_TEXT_CORPUS.length, 150);
  assert.deepEqual(Object.keys(RADIO_REVIEWED_VOCABULARY).sort(), RADIO_TEXT_CORPUS.map(p => p.id).sort());
  let total = 0;
  for (const passage of RADIO_TEXT_CORPUS) {
    const words = getRadioDifficultWords(passage);
    const tokens = new Set(normalize(RADIO_AUTHORED_EXERCISES[passage.id].transcript).split(' '));
    assert.equal(words.length, 4, passage.id);
    assert.equal(new Set(words.map(word => normalize(word.word))).size, 4, passage.id);
    for (const word of words) {
      assert.ok(tokens.has(normalize(word.sourceSurface)), `${passage.id}: missing Arabic ${word.word} (${word.sourceSurface})`);
      const escaped = word.meaningEn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      assert.match(passage.translationEn, new RegExp(`(?<![\\p{L}])${escaped}(?![\\p{L}])`, 'iu'), `${passage.id}: missing English ${word.meaningEn}`);
      assert.ok(!/unknown|unavailable|vocabulary item/i.test(word.meaningEn));
      total++;
    }
  }
  assert.equal(total, 600);
});

test('polysemous words keep the meaning from their own passage', () => {
  const gloss = (id: string, word: string) => RADIO_REVIEWED_VOCABULARY[id].find(item => item[0] === word)?.[1];
  assert.equal(gloss('beginner-story-02', 'أوراق'), 'leaves');
  assert.equal(gloss('beginner-riddle-01', 'أوراق'), 'pages');
  assert.equal(gloss('beginner-scenario-06', 'غسلت'), 'washed');
  assert.equal(gloss('beginner-scenario-10', 'غسلت'), 'brushed');
  assert.equal(gloss('advanced-dialogue-02', 'الصحة'), 'accuracy');
});

test('local speech never picks a cloud voice or a non-Arabic fallback', () => {
  const voices = [
    { name: 'Arabic', voiceURI: 'local', lang: 'ar-SA', localService: true },
    { name: 'Arabic Enhanced', voiceURI: 'enhanced', lang: 'ar_AE', localService: true },
    { name: 'Neural Arabic', voiceURI: 'cloud', lang: 'ar-SA', localService: false },
    { name: 'English', voiceURI: 'english', lang: 'en-US', localService: true },
  ] as SpeechSynthesisVoice[];
  assert.deepEqual(localArabicVoices(voices).map(voice => voice.voiceURI), ['enhanced', 'local']);
  assert.deepEqual(localArabicVoices(voices.slice(2)), []);
});

test('speech handles Word extraction artifacts and long texts without mutating the source', () => {
  const original = 'دخلت الصف صباًح ا. ثم قرأت،بهدوء!';
  assert.deepEqual(radioSpeechChunks(original), ['دخلت الصف صباحا.', 'ثم قرأت، بهدوء!']);
  assert.equal(original, 'دخلت الصف صباًح ا. ثم قرأت،بهدوء!');
  assert.deepEqual(radioSpeechChunks('ال أؤجل اإلخالء ألن األطفال هنا.'), ['لا أؤجل الإخلاء لأن الأطفال هنا.']);
  const long = Array(500).fill('القراءة').join(' ');
  const chunks = radioSpeechChunks(long);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every(chunk => chunk.length <= 190));
  assert.equal(chunks.join(' '), long);
});
