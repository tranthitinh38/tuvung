export type Grade = 6 | 7 | 8 | 9;

export interface VocabCard {
  id: string;
  word: string;
  partOfSpeech: string;
  ipa: string;
  meaning: string;
  grade: Grade;
  unitNumber: number;
  unitTopic: string;
  globalSuccessContext: string;
  arPrompt: string;
  popCultureExample: string;
  popCultureSource: string;
  mnemonicHint: string;
  mindMapLinks: string[];
  difficultyLevel: number; // 1 - 5 stars
  commonMistake?: string;

  // Spaced Repetition fields
  masteryLevel: number; // 0 - 100%
  stars: number; // 1 - 5 stars
  repetitionCount: number;
  nextReviewTimestamp: number;
  lastReviewedTimestamp?: number;
  retentionRate?: number; // % retention estimated by Ebbinghaus
}

export interface PronunciationFeedback {
  pronunciationScore: number;
  masteryLevel: number;
  stressFeedback: string;
  endingSoundsFeedback: string;
  intonationTip?: string;
  mentorComment: string;
  nextReview: string;
  xpGained: number;
  phonemes?: {
    sound: string;
    status: 'perfect' | 'needs-work' | 'good';
    note?: string;
  }[];
}

export interface PvPQuestion {
  id?: string;
  question: string;
  contextQuote?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  targetWord: string;
  timeLimitSeconds?: number;
  xpReward?: number;
}

export interface UnitInfo {
  number: number;
  title: string;
  vietnameseTitle: string;
  grammarFocus: string;
  vocabularyFocus: string;
  themeColor: string;
}

export interface UserProfile {
  name: string;
  grade: Grade;
  xp: number;
  rankTitle: string;
  streakDays: number;
  wordsMastered: number;
  pvpWins: number;
  pvpLosses: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
