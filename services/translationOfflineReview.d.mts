export type OfflineTranslationReview = { accuracy:number; isCorrect:boolean; feedbackAr:string; feedbackEn:string; vocalizedArabic:string; transliteration:string; grammarTip:string; reviewKind:'exact'|'transliteration'|'untranslated'|'ungraded' };
export function reviewTranslationOffline(promptEn:string, answer:string, reference?:string): OfflineTranslationReview;
