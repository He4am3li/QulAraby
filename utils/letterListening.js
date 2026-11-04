/**
 * QUL letter-listening exercises.
 *
 * Each of the first four stages asks all three pronunciation variants once,
 * in a rotated order. Stage five contrasts the chosen letter with two nearby
 * letters, using the original locally recorded letter names for playback.
 * This is recognition practice, not automated pronunciation scoring.
 */
export const LISTENING_QUESTIONS_PER_STAGE = 3;
export const LISTENING_STAGE_COUNT = 5;
export const LISTENING_TOTAL_QUESTIONS = LISTENING_QUESTIONS_PER_STAGE * LISTENING_STAGE_COUNT;

export function shuffleListeningOptions(options, random = Math.random) {
  const result = [...options];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const raw = random();
    const safe = Number.isFinite(raw) ? Math.max(0, Math.min(0.999999999, raw)) : 0;
    const other = Math.floor(safe * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function makeListeningQuestion({
  char, stage, round, rotation = 0, harakat, shadda, mad, tanween,
  similarSounds, combine, random = Math.random
}) {
  if (!char || !Number.isInteger(stage) || stage < 1 || stage > LISTENING_STAGE_COUNT) {
    throw new Error('Invalid letter listening stage');
  }
  if (!Number.isInteger(round) || round < 1 || round > LISTENING_QUESTIONS_PER_STAGE) {
    throw new Error('Invalid letter listening round');
  }
  // Preserve the QUL letter key 'هـ' for recorded names and contrast lookup.
  // getCombinedChar handles its decorative tatweel for vowel display separately.
  const cleanChar = char.trim();
  const groups = { 1: harakat.slice(0, 3), 2: shadda, 3: mad, 4: tanween };
  let labels;
  let target;
  let audioKind = 'variant';

  if (stage === 5) {
    const similar = similarSounds[cleanChar] || [];
    const candidates = [cleanChar, ...similar.filter(item => item !== cleanChar)];
    const unique = [...new Set(candidates)];
    if (unique.length < 4) throw new Error('Insufficient contrasting Arabic letters for ' + cleanChar);
    labels = unique.slice(0, 4);
    const targets = labels.slice(0, 3);
    target = targets[((round - 1 + rotation) % targets.length + targets.length) % targets.length];
    audioKind = 'letter-name';
  } else {
    const variants = groups[stage];
    if (!Array.isArray(variants) || variants.length !== 3) {
      throw new Error('Every listening stage requires three Arabic pronunciation variants');
    }
    labels = variants.map(({ symbol }) => combine(cleanChar, symbol));
    const selected = ((round - 1 + rotation) % 3 + 3) % 3;
    target = labels[selected];
  }

  if (new Set(labels).size !== labels.length) {
    throw new Error('Listening exercise has duplicate choices for ' + cleanChar);
  }
  const options = shuffleListeningOptions(
    labels.map(label => ({ label, isCorrect: label === target })),
    random
  );
  if (options.filter(item => item.isCorrect).length !== 1) {
    throw new Error('Listening exercise requires exactly one correct response');
  }
  return { target, options, audioKind, stage, round };
}
