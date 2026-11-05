/** Only the active speaker uses speech animation; both tutors attend to the student. */
export function resolveTutorAttention({ isSpeaking = false, isListening = false, isLoading = false,
  partnerSpeaking = false, partnerDirection = 'left', reaction = 'idle' } = {}) {
  if (isSpeaking) return { state: 'speaking', gazeX: 0 };
  if (partnerSpeaking) return { state: 'listening', gazeX: partnerDirection === 'right' ? 1 : -1 };
  if (isListening) return { state: 'listening', gazeX: 0 };
  if (isLoading) return { state: 'thinking', gazeX: 0 };
  return { state: reaction, gazeX: 0 };
}
