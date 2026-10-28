import { RADIO_TEXT_CORPUS } from './radioTextCorpus';
import type { RadioCorpusText } from './radioTextCorpus';
import { RADIO_AUTHORED_EXERCISES } from './radioAuthoredExercises';
import { RADIO_BILINGUAL_GLOSSARY } from './radioBilingualGlossary';

export type VerifiedRadioWord = { word: string; meaningEn: string; meaningAr: string; difficulty: number };

/**
 * Deterministic, zero-API vocabulary:
 * - candidate MUST occur in the selected Arabic source transcript;
 * - English gloss MUST actually occur in the user's English translation;
 * - rank by rarity across all 150 source transcripts, length and morphology;
 * - never invent a word or silently produce an unverified translation.
 *
 * A corpus audit found at least four eligible matches for ALL 150 documents.
 * This dictionary is source-grounded, NOT machine translation.
 */
const arabicKey = (value: string): string =>
  value.normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/اا(?=ل)/g, 'ا')
    .replace(/[^\u0621-\u064A]/g, '');

const englishKey = (value: string): string =>
  ' ' + value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';

const CONTENT_STOP = new Set([
  'انا', 'انت', 'نحن', 'هذا', 'هذه', 'ذلك', 'تلك', 'الذي', 'التي', 'الذين',
  'هناك', 'هنا', 'وكان', 'كانت', 'لكنه', 'كانت', 'معها', 'فكان', 'حيث', 'عندما',
  'بينما', 'الآن', 'اليوم', 'فقال', 'فقالت', 'قال', 'قالت', 'فقط',
  'ولكن', 'ايضا', 'إلى', 'على', 'كانت', 'لأن', 'يمكن', 'مثلا', 'اخرى',
  'أحد', 'بعض', 'وهو', 'وهي'
].map(arabicKey));

const dictionary = new Map<string, string[]>();
for (const [arabic, ...english] of RADIO_BILINGUAL_GLOSSARY) {
  const key = arabicKey(arabic);
  if (!key) continue;
  dictionary.set(key, [...new Set([...(dictionary.get(key) || []), ...english])]);
}

// Normalize common prefixes and the definite article for rarity scoring so
// e.g. "وفتحت" and "فتحت" are not treated as unrelated obscure vocabulary.
const lexicalRoot = (word: string): string => word
  .replace(/^[وفبكل](?=ال)/, '')
  .replace(/^(?:ال|لل)/, '')
  .replace(/^[وفبكل](?=.{4,})/, '');

const frequency = new Map<string, number>();
for (const source of RADIO_TEXT_CORPUS) {
  const seen = new Set((RADIO_AUTHORED_EXERCISES[source.id]?.transcript || '')
    .match(/[\u0621-\u064A\u064B-\u065F\u0670]+/g)?.map(word => lexicalRoot(arabicKey(word))) || []);
  for (const word of seen) {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  }
}

const variants = (key: string): string[] => [
  key,
  key.replace(/^[وفبكل]/, ''),
  key.replace(/^لل/, 'ال'),
  key.replace(/^ال/, ''),
  key.replace(/^[وفبكل](?=ال)/, ''),
  key.replace(/^[وفبكل](?=ال)/, '').replace(/^ال/, '')
];

export function getRadioDifficultWords(
  source: RadioCorpusText,
  transcript: string
): VerifiedRadioWord[] {
  const englishEvidence = englishKey(source.translationEn);
  const candidates: VerifiedRadioWord[] = [];
  const seen = new Set<string>();
  const words = transcript.match(/[\u0621-\u064A\u064B-\u065F\u0670]+/g) || [];

  for (const raw of words) {
    const key = arabicKey(raw);
    if (key.length < 4 || seen.has(key) || CONTENT_STOP.has(key)) continue;
    const meanings = variants(key).flatMap(variant => dictionary.get(variant) || []);
    // A gloss is accepted only if it occurs verbatim as a word/phrase in the
    // parallel translation provided by the user, not a generated dictionary.
    const meaningEn = meanings.find(term =>
      term.length > 1 && englishEvidence.includes(englishKey(term))
    );
    if (!meaningEn) continue;
    seen.add(key);
    const lexeme = lexicalRoot(key);
    const documentFrequency = frequency.get(lexeme) || 1;
    const rarity = Math.log((RADIO_TEXT_CORPUS.length + 1) / (documentFrequency + 1));
    const length = Math.min(lexeme.length, 14);
    const morphology = /(?:ات|يون|يات|يه|يين)$/.test(lexeme) ? 0.65 : 0;
    // Simple everyday speech verbs are not harder vocabulary than concrete
    // and abstract curriculum words, even if a particular inflection is rare.
    const routine = new Set([
      'said','saw','entered','opened','closed','sat','went','came',
      'gave','took','was','were','put','asked','read','wrote','want',
      'like','morning','today','yesterday','day','now','home','good',
      'am','is','are','had','did','have','can','go'
    ]);
    const routinePenalty = routine.has(meaningEn.toLowerCase()) ? 6.5 : 0;
    const difficulty = rarity * 4 + length * 0.72 + morphology - routinePenalty;
    const cleanWord = raw.replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, '').replace(/^اال/, 'ال');
    candidates.push({ word: cleanWord, meaningEn, meaningAr: '', difficulty });
  }

  candidates.sort((a, b) => b.difficulty - a.difficulty
    || b.word.length - a.word.length || a.word.localeCompare(b.word, 'ar'));

  return candidates.slice(0, 4);
}
