import type { RadioCorpusText } from './radioTextCorpus';
import { RADIO_REVIEWED_VOCABULARY } from './radioReviewedVocabulary';
export type VerifiedRadioWord = { word: string; meaningEn: string; meaningAr: string; sourceSurface: string };
// The corpus audit verifies all 600 surfaces and their source English excerpts.
export function getRadioDifficultWords(source: RadioCorpusText): VerifiedRadioWord[] {
  return (RADIO_REVIEWED_VOCABULARY[source.id] || []).map(([word, meaningEn, sourceSurface]) => ({
    word, meaningEn, meaningAr: '', sourceSurface: sourceSurface || word
  }));
}
