/**
 * Arabic alphabet and shared types for the interactive telephone directory.
 * Contact records live in speakingEverydayContacts.ts and use short, practical words.
 */
export const ARABIC_DIRECTORY_LETTERS = [
  'أ','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص',
  'ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي',
] as const;

export type SpeakingPhoneContact = {
  id: string;
  extension: string;
  voice: string;
  ar: string;
  en: string;
  agentAr: string;
  agentEn: string;
  symbol: string;
  aimAr: string;
  aimEn: string;
  objectivesAr: readonly string[];
  objectivesEn: readonly string[];
  complication: string;
  accent: string;
};

/** Normalize Arabic initial letters so plain and hamzated alif share the same tab. */
export const directoryLetterOf = (name: string): string => {
  const first = name.trim().normalize('NFC').replace(/^[\u064B-\u065F]+/, '')[0] || '';
  if ('اأإآٱ'.includes(first)) return 'أ';
  if (first === 'ة' || first === 'ه') return 'ه';
  if (first === 'ى') return 'ي';
  return first;
};
