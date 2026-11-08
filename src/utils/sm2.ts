import { VocabCard } from '../types';

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm Implementation
 * 
 * Given the current card parameters and a quality rating (0 to 5):
 * - Quality 0: Complete blackout
 * - Quality 1: Incorrect response; correct remembered
 * - Quality 2: Incorrect response; easy to recall
 * - Quality 3: Correct with serious difficulty
 * - Correctness ratings 4 & 5
 */
export interface SM2Result {
  repetitionCount: number;
  easeFactor: number;
  intervalDays: number;
  masteryLevel: number;
  nextReviewTimestamp: number;
  lastReviewedTimestamp: number;
  stars: number;
}

export function calculateSM2(
  card: VocabCard,
  quality: number // 0 to 5
): SM2Result {
  const now = Date.now();
  const q = Math.max(0, Math.min(5, quality));

  let n = card.repetitionCount || 0;
  let ef = (card as any).easeFactor !== undefined ? (card as any).easeFactor : 2.5;
  let interval = (card as any).intervalDays !== undefined ? (card as any).intervalDays : 1;

  if (q >= 3) {
    if (n === 0) {
      interval = 1;
    } else if (n === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    n += 1;
  } else {
    n = 0;
    interval = 1;
  }

  ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ef < 1.3) ef = 1.3;

  const stars = Math.max(1, Math.min(5, Math.round((q / 5) * 4) + 1));
  const currentMastery = card.masteryLevel || 20;
  const newMastery = Math.min(
    100,
    Math.max(10, Math.round(currentMastery * 0.5 + (q / 5) * 50))
  );

  const nextReviewTimestamp = now + interval * 24 * 60 * 60 * 1000;

  return {
    repetitionCount: n,
    easeFactor: Number(ef.toFixed(2)),
    intervalDays: interval,
    masteryLevel: newMastery,
    nextReviewTimestamp,
    lastReviewedTimestamp: now,
    stars,
  };
}

export function scheduleNextReviewSM2(
  card: VocabCard,
  rating: number
): SM2Result {
  const quality = Math.max(0, Math.min(5, rating));
  return calculateSM2(card, quality);
}
