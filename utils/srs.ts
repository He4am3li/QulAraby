import { MasteryLevel, Vocabulary } from '../types';

/**
 * SRS mastery is earned from verified recall on DIFFERENT scheduled days.
 * Self-reporting "I know it" never creates a verified review.
 */
const INTERVALS: Record<MasteryLevel, number> = {
  [MasteryLevel.NEW]: 1,
  [MasteryLevel.LEARNING]: 2,
  [MasteryLevel.FLUENT]: 7,
  [MasteryLevel.MASTERED]: 30,
};

const validDate = (input: string | undefined): number | null => {
  if (!input) return null;
  const value = Date.parse(input);
  return Number.isFinite(value) ? value : null;
};

export const updateSRS = (
  vocab: Vocabulary,
  difficulty: 'easy' | 'medium' | 'hard',
  now: Date = new Date()
): Vocabulary => {
  const nowMs = now.getTime();
  const today = now.toISOString().slice(0, 10);
  const previousSuccess = validDate(vocab.last_successful_review);
  const reviewDue = validDate(vocab.next_review);
  const eligible = (reviewDue === null || reviewDue <= nowMs) &&
    (previousSuccess === null || new Date(previousSuccess).toISOString().slice(0, 10) !== today);

  let correct = Math.max(0, vocab.correct_reviews ?? 0);
  let lastSuccessfulReview = vocab.last_successful_review;
  let nextReview = vocab.next_review;
  if (difficulty === 'hard') {
    correct = Math.max(0, correct - 1);
    nextReview = new Date(nowMs + 24 * 60 * 60 * 1000).toISOString();
  } else if (difficulty === 'easy' && eligible) {
    correct += 1;
    lastSuccessfulReview = now.toISOString();
  }
  // One success alone is not fluency. Three spaced successes demonstrate
  // fluency and six spaced successes demonstrate stronger retention.
  const mastery = correct >= 6 ? MasteryLevel.MASTERED
    : correct >= 3 ? MasteryLevel.FLUENT
    : correct >= 1 ? MasteryLevel.LEARNING
    : MasteryLevel.NEW;
  if (difficulty === 'easy' && eligible) {
    nextReview = new Date(nowMs + INTERVALS[mastery] * 24 * 60 * 60 * 1000).toISOString();
  }
  return {
    ...vocab,
    mastery_level: mastery,
    correct_reviews: correct,
    last_successful_review: lastSuccessfulReview,
    review_count: (vocab.review_count || 0) + 1,
    last_reviewed: now.toISOString(),
    next_review: nextReview || now.toISOString(),
  };
};

export const isDueForReview = (vocab: Vocabulary, now: Date = new Date()): boolean => {
  const date = validDate(vocab.next_review);
  return date === null || date <= now.getTime();
};
