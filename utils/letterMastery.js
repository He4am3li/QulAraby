/**
 * Evidence-based letter learning progress for QUL.
 *
 * A badge requires four individually checked contextual writing forms and
 * a listening exercise score of at least 12/15 on the first try.
 *
 * The legacy single-success mastery store remains untouched as history.
 * v2 evidence is scoped per signed-in account to avoid sharing mastery across
 * learners using the same browser.
 */
export const LETTER_FORMS = Object.freeze(['isolated', 'initial', 'medial', 'final']);
export const LISTENING_TOTAL = 15;
export const MIN_LISTENING_FIRST_TRY = 12;
export const MIN_ACCEPTED_WRITING_STARS = 2;
export const LETTER_EVIDENCE_VERSION = 2;

export function evidenceStorageKey(userId) {
  const user = typeof userId === 'string' && userId.trim() ? userId.trim() : 'guest';
  return 'hub_letter_skill_evidence_v2:' + user;
}

export function emptyLetterEvidence() {
  return { version: LETTER_EVIDENCE_VERSION, letters: {} };
}

export function normalizeLetterEvidence(value) {
  if (!value || typeof value !== 'object' || value.version !== LETTER_EVIDENCE_VERSION ||
      !value.letters || typeof value.letters !== 'object' || Array.isArray(value.letters)) {
    return emptyLetterEvidence();
  }
  return {
    version: LETTER_EVIDENCE_VERSION,
    letters: Object.fromEntries(
      Object.entries(value.letters)
        .filter(([key, record]) => key && record && typeof record === 'object' && !Array.isArray(record))
        .map(([key, record]) => [key, {
          forms: Object.fromEntries(LETTER_FORMS
            .filter(shape => Number.isInteger(record.forms?.[shape]?.stars)
              && record.forms[shape].stars >= MIN_ACCEPTED_WRITING_STARS
              && record.forms[shape].stars <= 3)
            .map(shape => [shape, {
              stars: record.forms[shape].stars,
              date: String(record.forms[shape].date || '')
            }])),
          listening: (Number.isInteger(record.listening?.score) &&
            Number.isInteger(record.listening?.total) &&
            record.listening.total === LISTENING_TOTAL &&
            record.listening.score >= 0 &&
            record.listening.score <= LISTENING_TOTAL)
            ? { score: record.listening.score, total: LISTENING_TOTAL, date: String(record.listening.date || '') }
            : null
        }])
    )
  };
}

export function recordVerifiedWriting(evidence, char, shape, stars, now = new Date().toISOString()) {
  const safe = normalizeLetterEvidence(evidence);
  if (typeof char !== 'string' || !char || !LETTER_FORMS.includes(shape) ||
      !Number.isInteger(stars) || stars < MIN_ACCEPTED_WRITING_STARS || stars > 3) return safe;
  const previous = safe.letters[char] || { forms: {}, listening: null };
  return {
    version: LETTER_EVIDENCE_VERSION,
    letters: {
      ...safe.letters,
      [char]: {
        ...previous,
        forms: {
          ...previous.forms,
          [shape]: {
            stars: Math.max(previous.forms?.[shape]?.stars || 0, stars),
            date: now
          }
        }
      }
    }
  };
}

export function recordListeningExercise(evidence, char, firstTryScore, total, now = new Date().toISOString()) {
  const safe = normalizeLetterEvidence(evidence);
  if (typeof char !== 'string' || !char || total !== LISTENING_TOTAL ||
      !Number.isInteger(firstTryScore) || firstTryScore < 0 || firstTryScore > total) return safe;
  const previous = safe.letters[char] || { forms: {}, listening: null };
  const best = Math.max(previous.listening?.score || 0, firstTryScore);
  return {
    version: LETTER_EVIDENCE_VERSION,
    letters: {
      ...safe.letters,
      [char]: {
        ...previous,
        listening: { score: best, total, date: now }
      }
    }
  };
}

export function verifiedFormCount(evidence, char) {
  const record = normalizeLetterEvidence(evidence).letters[char];
  return LETTER_FORMS.filter(shape => record?.forms?.[shape]?.stars >= MIN_ACCEPTED_WRITING_STARS).length;
}

export function isVerifiedLetterMastered(record) {
  return Boolean(record && LETTER_FORMS.every(shape =>
    record.forms?.[shape]?.stars >= MIN_ACCEPTED_WRITING_STARS
  ) && record.listening?.total === LISTENING_TOTAL &&
    record.listening.score >= MIN_LISTENING_FIRST_TRY);
}

export function masteredFromEvidence(evidence) {
  const safe = normalizeLetterEvidence(evidence);
  return Object.keys(safe.letters).filter(char => isVerifiedLetterMastered(safe.letters[char]));
}

/**
 * Analyze the ink-only transparent canvas, never the background tracing guide.
 * A tap, an empty canvas, a stray dot or a very short stroke is not enough
 * evidence to send to the model. This is a guard, not handwriting recognition.
 */
export function assessInkSamples(imageData, moveCount = 0) {
  if (!imageData || !Number.isInteger(imageData.width) || !Number.isInteger(imageData.height) ||
      !imageData.data || imageData.width < 1 || imageData.height < 1 ||
      imageData.data.length < imageData.width * imageData.height * 4) {
    return { sufficient: false, pixels: 0, span: 0 };
  }
  let pixels = 0;
  let left = imageData.width, right = -1, top = imageData.height, bottom = -1;
  const { width, height, data } = imageData;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha < 65) continue;
      pixels++;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
  const span = Math.max(Math.max(0, right - left + 1), Math.max(0, bottom - top + 1));
  return { sufficient: pixels >= 350 && span >= 45 && moveCount >= 3, pixels, span };
}
