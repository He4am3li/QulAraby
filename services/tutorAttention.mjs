// Both full-body portraits use the same camera scale and foot plane.
export const TUTOR_BODY_VIEWPORT = Object.freeze({ x: 100, y: 0, w: 824, h: 1536 });
export const EGYPT_BODY_VIEWPORT = TUTOR_BODY_VIEWPORT;

/** Only the active speaker uses speech animation; both tutors attend to the student. */
export function resolveTutorAttention({ isSpeaking = false, isListening = false, isLoading = false,
  partnerSpeaking = false, partnerDirection = 'left', reaction = 'idle' } = {}) {
  if (isSpeaking) return { state: 'speaking', gazeX: 0 };
  if (partnerSpeaking) return { state: 'listening', gazeX: partnerDirection === 'right' ? 1 : -1 };
  if (isListening) return { state: 'listening', gazeX: 0 };
  if (isLoading) return { state: 'thinking', gazeX: 0 };
  return { state: reaction, gazeX: 0 };
}

/** Authored inward-facing pairs retain their physical order in both languages. */
export function getTutorStageDirection(countryId, lang) {
  return countryId === 'egypt' || countryId === 'saudi' || countryId === 'uae' || countryId === 'morocco' || countryId === 'iraq' || countryId === 'lebanon' || countryId === 'tunisia' || countryId === 'algeria' || countryId === 'libya' || countryId === 'jordan' || countryId === 'syria' || countryId === 'qatar' || lang === 'ar' ? 'rtl' : 'ltr';
}

export function getTutorPartnerDirection(countryId, gender, lang) {
  const maleOnRight = getTutorStageDirection(countryId, lang) === 'rtl';
  return gender === 'female' ? (maleOnRight ? 'right' : 'left') : (maleOnRight ? 'left' : 'right');
}
