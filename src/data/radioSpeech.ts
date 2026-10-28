import { RADIO_REVIEWED_VOCABULARY } from './radioReviewedVocabulary';

// Known extraction artifacts, reviewed against Arabic spelling. Do not apply
// a global lam/alif swap: that would damage correctly spelled words.
const speechRepairs = new Map<string, string>([
  ['ال', 'لا'], ['ألن', 'لأن'], ['ألنه', 'لأنه'], ['ألنها', 'لأنها'],
  ['ألنني', 'لأنني'], ['ألننا', 'لأننا'], ['أوال', 'أولا'], ['ثالث', 'ثلاث'],
  ['خالل', 'خلال'], ['مالبس', 'ملابس'],
]);
for (const selection of Object.values(RADIO_REVIEWED_VOCABULARY)) {
  for (const [word, , surface] of selection) if (surface) speechRepairs.set(surface, word);
}

/** Only installed Arabic voices qualify for zero-network speech playback. */
export function localArabicVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices.filter(voice => voice.localService && /^ar(?:[-_]|$)/i.test(voice.lang))
    .sort((a, b) => Number(/premium|enhanced|natural|neural/i.test(b.name))
      - Number(/premium|enhanced|natural|neural/i.test(a.name)) || a.name.localeCompare(b.name));
}

// Imported Word text contains misplaced vowel marks and split final alifs.
// Clean the spoken copy only. The authored transcript/questions stay intact.
export function radioSpeechChunks(text: string): string[] {
  const clean = text.normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/([\u0621-\u064A])\s+ا(?=[\s،.!؟؛]|$)/g, '$1ا')
    .replace(/[\u0621-\u064A]+/g, word => speechRepairs.get(word)
      || word.replace(/^([وفبك]?)(ا)([أإآا])ل/, '$1$2ل$3'))
    .replace(/\s+([،.؛:؟!])/g, '$1').replace(/([،.؛:؟!])(?=\S)/g, '$1 ')
    .replace(/\s+/g, ' ').trim();
  const sentences = clean.match(/[^.!؟؛]+[.!؟؛]?/g) || [];
  return sentences.flatMap(sentence => {
    const chunks: string[] = [];
    let chunk = '';
    for (const word of sentence.trim().split(/\s+/)) {
      if (chunk && chunk.length + 1 + word.length > 190) { chunks.push(chunk); chunk = ''; }
      chunk += (chunk ? ' ' : '') + word;
    }
    if (chunk) chunks.push(chunk);
    return chunks;
  });
}
