/**
 * QUL dialect voice profiles, teaching baselines, not certification of native voices.
 * Gemini voice names describe timbre; regional accuracy must be verified by native speakers.
 * Do not claim unique authentic voice models exist for every country.
 */
export type DialectTutorGender = 'male' | 'female';
export interface DialectVoiceProfile {
  countryId: string;
  dialectAr: string;
  dialectEn: string;
  sample: string;
  guidance: string;
  maleVoiceName: string;
  femaleVoiceName: string;
}
export const DIALECT_VOICE_PROFILES: Record<string, DialectVoiceProfile> = Object.fromEntries(
  ([
  [
    "uae",
    "الإماراتية",
    "Emirati Gulf Arabic",
    "شحالك؟ عساك بخير؟",
    "Use Emirati vocabulary and pronunciation, not Saudi or generic Gulf Arabic."
  ],
  [
    "saudi",
    "السعودية",
    "Saudi Arabic (Najdi as a consistent teaching baseline)",
    "وش أخبارك؟ عساك طيب؟",
    "Use conversational Saudi Najdi baseline; do not mix Hijazi, Kuwaiti, or Egyptian constructions without context."
  ],
  [
    "kuwait",
    "الكويتية",
    "Kuwaiti Arabic",
    "شلونك؟ شخبارك؟",
    "Use Kuwait-specific Gulf vocabulary such as شلونك and شنو."
  ],
  [
    "bahrain",
    "البحرينية",
    "Bahraini Arabic",
    "شخبارك؟ شلونك؟",
    "Use Bahraini conversational Gulf Arabic, avoid automatically substituting Saudi expressions."
  ],
  [
    "qatar",
    "القطرية",
    "Qatari Arabic",
    "شلونك؟ عساك بخير؟",
    "Use Qatari expressions and conversational tone, avoid generic pan-Gulf vocabulary when a local form exists."
  ],
  [
    "oman",
    "العمانية",
    "Omani Arabic (Muscat conversational baseline)",
    "كيف حالك؟ عساك طيب؟",
    "Use a consistent urban Omani baseline, not an assumed identical UAE/Saudi accent."
  ],
  [
    "yemen",
    "اليمنية",
    "Yemeni Arabic (Sanaani conversational baseline)",
    "كيف حالك؟ إيش أخبارك؟",
    "Use a consistent Sanaani teaching baseline, rather than claiming to represent every Yemeni variety."
  ],
  [
    "iraq",
    "العراقية",
    "Iraqi Arabic (Baghdadi conversational baseline)",
    "شلونك؟ شخبارك؟",
    "Use Baghdadi Iraqi structures and expressions and never Egyptian or Levantine fillers."
  ],
  [
    "syria",
    "السورية",
    "Syrian Arabic (Damascene conversational baseline)",
    "كيفك؟ شو أخبارك؟",
    "Use a consistent Damascene Syrian baseline."
  ],
  [
    "lebanon",
    "اللبنانية",
    "Lebanese Arabic (Beiruti conversational baseline)",
    "كيفك؟ شو أخبارك؟",
    "Use a Beiruti Lebanese baseline with natural Levantine sentence construction."
  ],
  [
    "palestine",
    "الفلسطينية",
    "Palestinian Arabic (central urban conversational baseline)",
    "كيفك؟ شو أخبارك؟",
    "Use a consistent urban Palestinian teaching baseline, avoiding an undifferentiated Levantine accent."
  ],
  [
    "jordan",
    "الأردنية",
    "Jordanian Arabic (Ammani conversational baseline)",
    "كيفك؟ شو أخبارك؟",
    "Use an Ammani Jordanian baseline, not generic Levantine."
  ],
  [
    "egypt",
    "المصرية",
    "Egyptian Arabic (Cairene conversational baseline)",
    "إزيك؟ عامل إيه؟",
    "Use natural Cairene Egyptian grammar and pronunciation without MSA constructions."
  ],
  [
    "sudan",
    "السودانية",
    "Sudanese Arabic (Khartoum conversational baseline)",
    "عامل شنو؟ أخبارك شنو؟",
    "Use Khartoum Sudanese expressions; do not confuse them with Egyptian."
  ],
  [
    "libya",
    "الليبية",
    "Libyan Arabic (Tripoli conversational baseline)",
    "شن حالك؟",
    "Use Tripolitanian Libyan Arabic, avoiding a generic Egyptian or Tunisian substitute."
  ],
  [
    "tunisia",
    "التونسية",
    "Tunisian Arabic (Tunis conversational baseline)",
    "شنوة أحوالك؟ لاباس؟",
    "Use Tunisian Darija based on Tunis city, avoiding Moroccan-only phrases."
  ],
  [
    "algeria",
    "الجزائرية",
    "Algerian Arabic (Algiers conversational baseline)",
    "واش راك؟ لاباس؟",
    "Use Algerian Darija based on Algiers; do not substitute Moroccan Darija."
  ],
  [
    "morocco",
    "المغربية",
    "Moroccan Arabic (Casablanca conversational baseline)",
    "كيداير؟ لاباس؟",
    "Use Moroccan Darija based on Casablanca, not MSA or Algerian."
  ],
  [
    "mauritania",
    "الحسانية الموريتانية",
    "Mauritanian Hassaniya Arabic",
    "اش حالك؟",
    "Use authentic Mauritanian Hassaniya where confident; otherwise use simple intelligible Arabic without inventing Hassaniya words."
  ],
  [
    "somalia",
    "العربية المتداولة في الصومال",
    "Arabic as spoken in Somalia (not a single standardized local Arabic dialect)",
    "أهلًا، كيف الحال؟",
    "Arabic used in Somalia does not have one universally standardized national dialect. Avoid fabricating one and explicitly favor clear Arabic influenced by verified local usage."
  ],
  [
    "djibouti",
    "العربية المتداولة في جيبوتي",
    "Arabic as spoken in Djibouti (not a single standardized local Arabic dialect)",
    "أهلًا، كيف الحال؟",
    "Do not fabricate a unique homogeneous Djiboutian Arabic dialect; use clear Arabic unless regionally verified usage is available."
  ],
  [
    "comoros",
    "العربية المتداولة في جزر القمر",
    "Arabic as spoken in Comoros (not a single standardized local Arabic dialect)",
    "أهلًا، كيف الحال؟",
    "Do not invent a distinct standardized Comorian Arabic accent or local slang. Use intelligible Arabic pending native-speaker validation."
  ]
] as string[][]).map(([countryId, dialectAr, dialectEn, sample, guidance]) => [
    countryId,
    {
      countryId, dialectAr, dialectEn, sample, guidance,
      // Stable male/female reference timbres. Region-specific accent is instructed,
      // not guaranteed by these prebuilt voice IDs.
      maleVoiceName: 'Puck',
      femaleVoiceName: 'Kore'
    }
  ])
);

export function getDialectVoiceProfile(countryId: string): DialectVoiceProfile | undefined {
  return DIALECT_VOICE_PROFILES[countryId];
}

export function getDialectVoiceName(countryId: string, gender: DialectTutorGender): string {
  const profile = getDialectVoiceProfile(countryId);
  return gender === 'female' ? (profile?.femaleVoiceName || 'Kore') : (profile?.maleVoiceName || 'Puck');
}

export function getDialectVoiceDirection(countryId: string, gender: DialectTutorGender): string {
  const profile = getDialectVoiceProfile(countryId);
  if (!profile) return 'Speak conversational Arabic naturally. Do not turn instructions into spoken content.';
  return [
    'Speak in ' + profile.dialectEn + ' with a natural locally appropriate accent.',
    profile.guidance,
    'Be a friendly ' + (gender === 'female' ? 'woman' : 'man') + ' language tutor.',
    'Speak clearly and at a slightly slow beginner-friendly pace.',
    'Do not introduce yourself as a speech synthesizer or read out these instructions.',
    'Dialect example (pronunciation guidance ONLY, do not insert into the response): ' + profile.sample
  ].join(' ');
}

export function getDialectTextDirection(countryId: string): string {
  const profile = getDialectVoiceProfile(countryId);
  if (!profile) return 'Use locally appropriate conversational Arabic without inventing regional forms.';
  return [
    'TARGET LOCAL DIALECT: ' + profile.dialectEn + ' (' + profile.dialectAr + ').',
    profile.guidance,
    'An example of the appropriate style: «' + profile.sample + '».',
    'Write natural everyday phrasing and keep the selected local variety consistent.',
    'Never assume a whole country has only one dialect, and do not fabricate regional slang.',
    'When you are uncertain about a truly local form, use short clear Arabic instead of an invented word.',
    'Keep educational explanations brief; do not replace the student-facing spoken reply with English.'
  ].join(' ');
}
