import { VocabCard } from '../types';

/**
 * Ebbinghaus Forgetting Curve: R = e^(-t / S)
 * Where:
 * - R is memory retention percentage (0 - 100%)
 * - t is time elapsed since last review (in hours)
 * - S is memory stability (in hours), increasing with repetition count and star rating
 */
export function calculateRetentionRate(card: VocabCard): number {
  if (!card.lastReviewedTimestamp) return 100;

  const now = Date.now();
  const hoursElapsed = Math.max(0, (now - card.lastReviewedTimestamp) / (1000 * 60 * 60));

  // Base stability based on stars (1 to 5) and repetition count
  const baseStabilityHours = Math.pow(card.stars || 2, 1.8) * Math.max(1, card.repetitionCount || 1) * 12;
  const retention = Math.exp(-hoursElapsed / Math.max(2, baseStabilityHours)) * 100;

  return Math.min(100, Math.max(10, Math.round(retention)));
}

/**
 * Calculates new Spaced Repetition parameters when student rates their recall (1 to 5 stars)
 */
export function scheduleNextReview(
  card: VocabCard,
  rating: number // 1: Forgot/Difficult -> 5: Perfect/Easy
): {
  stars: number;
  repetitionCount: number;
  masteryLevel: number;
  nextReviewTimestamp: number;
  lastReviewedTimestamp: number;
} {
  const now = Date.now();
  const repetitionCount = rating >= 3 ? card.repetitionCount + 1 : Math.max(0, card.repetitionCount - 1);

  // Interval table in minutes based on rating & repetition
  let intervalMinutes = 30; // default 30 mins

  if (rating === 1) {
    intervalMinutes = 15; // 15 mins (urgent review)
  } else if (rating === 2) {
    intervalMinutes = 120; // 2 hours
  } else if (rating === 3) {
    intervalMinutes = 24 * 60; // 1 day
  } else if (rating === 4) {
    intervalMinutes = (repetitionCount + 1) * 2 * 24 * 60; // 2-4 days
  } else if (rating === 5) {
    intervalMinutes = (repetitionCount + 2) * 4 * 24 * 60; // 7-14 days
  }

  // Calculate new mastery level (0-100%)
  const newMastery = Math.min(
    100,
    Math.max(10, Math.round((card.masteryLevel * 0.4) + (rating * 20 * 0.6)))
  );

  return {
    stars: rating,
    repetitionCount,
    masteryLevel: newMastery,
    nextReviewTimestamp: now + intervalMinutes * 60 * 1000,
    lastReviewedTimestamp: now,
  };
}

export function formatTimeUntilReview(nextReviewTimestamp: number): string {
  const diffMs = nextReviewTimestamp - Date.now();
  if (diffMs <= 0) return 'Đến lúc ôn ngay!';

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày tới`;
  if (hours > 0) return `${hours} giờ tới`;
  return `${minutes} phút nữa`;
}
