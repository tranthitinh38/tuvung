import { describe, it, expect } from 'vitest';
import { calculateSM2 } from '../src/utils/sm2';
import { VocabCard } from '../src/types';

describe('SM-2 Spaced Repetition Algorithm', () => {
  const sampleCard: VocabCard = {
    id: 'test-1',
    word: 'Resilience',
    ipa: '/rɪˈzɪliəns/',
    partOfSpeech: 'noun',
    meaning: 'Sự kiên cường, khả năng hồi phục nhanh',
    globalSuccessContext: 'Global Success Grade 8 - Unit 3',
    popCultureExample: 'Spider-Man showed incredible resilience.',
    popCultureSource: 'Marvel Cinematic Universe',
    arPrompt: 'A glowing shield protecting a dynamic glowing core',
    mnemonicHint: 'Re-silence: đứng vững sau khi bị bắt im lặng',
    mindMapLinks: ['bravery', 'strength'],
    stars: 3,
    repetitionCount: 1,
    masteryLevel: 50,
    nextReviewTimestamp: Date.now(),
    lastReviewedTimestamp: Date.now(),
  };

  it('should increase interval and repetition count on successful recall (quality 5)', () => {
    const result = calculateSM2(sampleCard, 5);
    expect(result.repetitionCount).toBe(2);
    expect(result.intervalDays).toBeGreaterThan(1);
    expect(result.masteryLevel).toBeGreaterThan(50);
  });

  it('should reset repetition count on failure (quality 1)', () => {
    const result = calculateSM2(sampleCard, 1);
    expect(result.repetitionCount).toBe(0);
    expect(result.intervalDays).toBe(1);
  });
});
