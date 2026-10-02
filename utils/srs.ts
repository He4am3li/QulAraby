
import { MasteryLevel, Vocabulary } from '../types';

const INTERVALS = {
  [MasteryLevel.NEW]: 1,
  [MasteryLevel.LEARNING]: 3,
  [MasteryLevel.FLUENT]: 7,
  [MasteryLevel.MASTERED]: 30,
};

export const updateSRS = (vocab: Vocabulary, difficulty: 'easy' | 'medium' | 'hard'): Vocabulary => {
  let newLevel = vocab.mastery_level;
  
  if (difficulty === 'easy') {
    newLevel = Math.min(MasteryLevel.MASTERED, vocab.mastery_level + 1);
  } else if (difficulty === 'hard') {
    newLevel = Math.max(MasteryLevel.NEW, vocab.mastery_level - 1);
  }

  const interval = INTERVALS[newLevel as MasteryLevel];
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    ...vocab,
    mastery_level: newLevel,
    review_count: vocab.review_count + 1,
    last_reviewed: new Date().toISOString(),
    next_review: nextReviewDate.toISOString(),
  };
};

export const isDueForReview = (vocab: Vocabulary): boolean => {
  return new Date(vocab.next_review) <= new Date();
};
