export type UserRole = 'teacher' | 'student';

export interface AuthUser {
  id: string;
  username: string;
  passwordHash: string; // bcrypt-style hash stored in localStorage
  role: UserRole;
  displayName: string;
  createdAt: number;
  lastLoginAt?: number;
  failedLoginAttempts: number;
  lockedUntil?: number; // timestamp - account locked until this time
  avatar?: string; // emoji or initials
}

export interface TeacherProfile extends AuthUser {
  role: 'teacher';
  classIds: string[]; // IDs of classes this teacher manages
  schoolName?: string;
}

export interface StudentProfile extends AuthUser {
  role: 'student';
  classId?: string; // current enrolled class
  grade?: 6 | 7 | 8 | 9;
  xp: number;
  rankTitle: string;
  streakDays: number;
  wordsMastered: number;
  pvpWins: number;
  pvpLosses: number;
  lastStudyDate?: string; // ISO date string
  studyStreak?: number;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "7A1", "Lớp 8B"
  grade: 6 | 7 | 8 | 9;
  teacherId: string;
  joinCode: string; // 6-char code like "ABCD12"
  studentIds: string[];
  createdAt: number;
  description?: string;
  currentUnit?: number;
  assignments: Assignment[];
}

export interface Assignment {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  description?: string;
  grade: 6 | 7 | 8 | 9;
  unitNumber: number;
  unitTitle: string;
  type: 'vocabulary' | 'quiz' | 'exercise';
  dueDate?: number; // timestamp
  createdAt: number;
  vocabCardIds: string[]; // which cards are in this assignment
  targetWordCount?: number;
}

export interface StudentResult {
  id: string;
  studentId: string;
  assignmentId: string;
  classId: string;
  completedAt: number;
  score: number; // 0-100
  timeSpentSeconds: number;
  wordsLearned: number;
  wordsFailed: number;
  wordsPassed: string[]; // card IDs
  details?: {
    cardId: string;
    attempts: number;
    correct: boolean;
    timeMs: number;
  }[];
}

export interface StudySession {
  id: string;
  studentId: string;
  classId?: string;
  assignmentId?: string;
  grade: 6 | 7 | 8 | 9;
  unitNumber: number;
  startedAt: number;
  endedAt?: number;
  wordsStudied: string[];
  xpGained: number;
  mode: 'free' | 'assigned' | 'review';
}

export interface AuthSession {
  userId: string;
  role: UserRole;
  token: string; // random session token
  expiresAt: number; // timestamp
}

export interface ReviewSchedule {
  studentId: string;
  cardId: string;
  word: string;
  nextReview: number; // timestamp
  interval: number; // days
  easeFactor: number;
  repetitions: number;
}
