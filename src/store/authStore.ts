/**
 * authStore.ts - Secure Authentication & Data Store
 * Passwords are hashed using a simple but effective client-side hash (SHA-256 via Web Crypto API)
 * Never stores plain-text passwords.
 */

import {
  AuthUser,
  TeacherProfile,
  StudentProfile,
  ClassRoom,
  Assignment,
  StudentResult,
  StudySession,
  AuthSession,
  ReviewSchedule,
} from '../types/auth';

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const KEY_USERS = 'auth_users_v2';
const KEY_SESSION = 'auth_session_v2';
const KEY_CLASSES = 'auth_classes_v2';
const KEY_ASSIGNMENTS = 'auth_assignments_v2';
const KEY_RESULTS = 'auth_results_v2';
const KEY_SESSIONS = 'auth_study_sessions_v2';
const KEY_REVIEWS = 'auth_reviews_v2';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// ─── Password Hashing (SHA-256 via Web Crypto) ────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  const salt = 'gs_vocab_2026_salt_'; // static salt prefix
  const data = new TextEncoder().encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

// ─── Generic Storage Helpers ──────────────────────────────────────────────────
function readStore<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function readMap<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ─── Random ID / Code Generators ─────────────────────────────────────────────
export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function generateSessionToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── User Management ──────────────────────────────────────────────────────────
export function getAllUsers(): AuthUser[] {
  return readStore<AuthUser>(KEY_USERS);
}

export function findUserByUsername(username: string): AuthUser | undefined {
  return getAllUsers().find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export function findUserById(id: string): AuthUser | undefined {
  return getAllUsers().find((u) => u.id === id);
}

export function saveUser(user: AuthUser): void {
  const users = getAllUsers().filter((u) => u.id !== user.id);
  users.push(user);
  writeStore(KEY_USERS, users);
}

export function deleteUser(userId: string): void {
  const users = getAllUsers().filter((u) => u.id !== userId);
  writeStore(KEY_USERS, users);
}

// ─── Registration ─────────────────────────────────────────────────────────────
export async function registerTeacher(
  username: string,
  password: string,
  displayName: string,
  schoolName?: string
): Promise<{ success: boolean; error?: string; user?: TeacherProfile }> {
  if (findUserByUsername(username)) {
    return { success: false, error: 'Tên đăng nhập đã tồn tại.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' };
  }
  const hash = await hashPassword(password);
  const user: TeacherProfile = {
    id: generateId(),
    username,
    passwordHash: hash,
    role: 'teacher',
    displayName,
    schoolName,
    classIds: [],
    createdAt: Date.now(),
    failedLoginAttempts: 0,
  };
  saveUser(user);
  return { success: true, user };
}

export async function registerStudent(
  username: string,
  password: string,
  displayName: string,
  classCode?: string
): Promise<{ success: boolean; error?: string; user?: StudentProfile }> {
  if (findUserByUsername(username)) {
    return { success: false, error: 'Tên đăng nhập đã tồn tại.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' };
  }
  const hash = await hashPassword(password);

  let classId: string | undefined;
  let grade: 6 | 7 | 8 | 9 | undefined;

  if (classCode) {
    const cls = findClassByCode(classCode);
    if (!cls) return { success: false, error: 'Mã lớp không hợp lệ.' };
    classId = cls.id;
    grade = cls.grade;
  }

  const user: StudentProfile = {
    id: generateId(),
    username,
    passwordHash: hash,
    role: 'student',
    displayName,
    classId,
    grade,
    xp: 0,
    rankTitle: 'Tân Binh 🌱',
    streakDays: 0,
    wordsMastered: 0,
    pvpWins: 0,
    pvpLosses: 0,
    createdAt: Date.now(),
    failedLoginAttempts: 0,
  };
  saveUser(user);

  // Add student to class roster
  if (classId) {
    const cls = findClassById(classId);
    if (cls && !cls.studentIds.includes(user.id)) {
      cls.studentIds.push(user.id);
      saveClass(cls);
    }
  }

  return { success: true, user };
}

// ─── Login / Logout ───────────────────────────────────────────────────────────
export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string; session?: AuthSession; user?: AuthUser }> {
  const user = findUserByUsername(username);
  if (!user) {
    return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng.' };
  }

  // Check lockout
  if (user.lockedUntil && user.lockedUntil > Date.now()) {
    const remaining = Math.ceil((user.lockedUntil - Date.now()) / 60000);
    return { success: false, error: `Tài khoản bị khóa. Thử lại sau ${remaining} phút.` };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      user.failedLoginAttempts = 0;
      saveUser(user);
      return { success: false, error: 'Nhập sai quá nhiều lần. Tài khoản bị khóa 15 phút.' };
    }
    saveUser(user);
    const remaining = MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;
    return { success: false, error: `Mật khẩu không đúng. Còn ${remaining} lần thử.` };
  }

  // Reset failed attempts on success
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  user.lastLoginAt = Date.now();
  saveUser(user);

  const session: AuthSession = {
    userId: user.id,
    role: user.role,
    token: generateSessionToken(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  localStorage.setItem(KEY_SESSION, JSON.stringify(session));

  return { success: true, session, user };
}

export function logout(): void {
  localStorage.removeItem(KEY_SESSION);
}

export function getActiveSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(KEY_SESSION);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(KEY_SESSION);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  const session = getActiveSession();
  if (!session) return null;
  return findUserById(session.userId) || null;
}

// ─── Class Management ─────────────────────────────────────────────────────────
export function getAllClasses(): ClassRoom[] {
  return readStore<ClassRoom>(KEY_CLASSES);
}

export function findClassById(id: string): ClassRoom | undefined {
  return getAllClasses().find((c) => c.id === id);
}

export function findClassByCode(code: string): ClassRoom | undefined {
  return getAllClasses().find((c) => c.joinCode.toUpperCase() === code.toUpperCase());
}

export function getTeacherClasses(teacherId: string): ClassRoom[] {
  return getAllClasses().filter((c) => c.teacherId === teacherId);
}

export function saveClass(cls: ClassRoom): void {
  const classes = getAllClasses().filter((c) => c.id !== cls.id);
  classes.push(cls);
  writeStore(KEY_CLASSES, classes);
  // Update teacher's classIds
  const teacher = findUserById(cls.teacherId) as TeacherProfile | undefined;
  if (teacher && !teacher.classIds.includes(cls.id)) {
    teacher.classIds.push(cls.id);
    saveUser(teacher);
  }
}

export function deleteClass(classId: string): void {
  const classes = getAllClasses().filter((c) => c.id !== classId);
  writeStore(KEY_CLASSES, classes);
}

export function createClass(
  teacherId: string,
  name: string,
  grade: 6 | 7 | 8 | 9,
  description?: string
): ClassRoom {
  const cls: ClassRoom = {
    id: generateId(),
    name,
    grade,
    teacherId,
    joinCode: generateJoinCode(),
    studentIds: [],
    createdAt: Date.now(),
    description,
    assignments: [],
  };
  saveClass(cls);
  return cls;
}

export function regenerateJoinCode(classId: string): string {
  const cls = findClassById(classId);
  if (!cls) return '';
  cls.joinCode = generateJoinCode();
  saveClass(cls);
  return cls.joinCode;
}

export function addStudentToClass(classId: string, studentId: string): boolean {
  const cls = findClassById(classId);
  if (!cls || cls.studentIds.includes(studentId)) return false;
  cls.studentIds.push(studentId);
  saveClass(cls);
  // Update student's classId
  const student = findUserById(studentId) as StudentProfile | undefined;
  if (student) {
    student.classId = classId;
    student.grade = cls.grade;
    saveUser(student);
  }
  return true;
}

export function removeStudentFromClass(classId: string, studentId: string): void {
  const cls = findClassById(classId);
  if (!cls) return;
  cls.studentIds = cls.studentIds.filter((id) => id !== studentId);
  saveClass(cls);
}

export function getStudentsInClass(classId: string): StudentProfile[] {
  const cls = findClassById(classId);
  if (!cls) return [];
  return cls.studentIds
    .map((id) => findUserById(id) as StudentProfile | undefined)
    .filter(Boolean) as StudentProfile[];
}

// ─── Assignment Management ────────────────────────────────────────────────────
export function getAllAssignments(): Assignment[] {
  return readStore<Assignment>(KEY_ASSIGNMENTS);
}

export function getClassAssignments(classId: string): Assignment[] {
  return getAllAssignments().filter((a) => a.classId === classId);
}

export function getStudentAssignments(studentId: string): Assignment[] {
  const student = findUserById(studentId) as StudentProfile | undefined;
  if (!student?.classId) return [];
  return getClassAssignments(student.classId);
}

export function saveAssignment(assignment: Assignment): void {
  const assignments = getAllAssignments().filter((a) => a.id !== assignment.id);
  assignments.push(assignment);
  writeStore(KEY_ASSIGNMENTS, assignments);
}

export function deleteAssignment(assignmentId: string): void {
  const assignments = getAllAssignments().filter((a) => a.id !== assignmentId);
  writeStore(KEY_ASSIGNMENTS, assignments);
}

export function createAssignment(
  teacherId: string,
  classId: string,
  title: string,
  grade: 6 | 7 | 8 | 9,
  unitNumber: number,
  unitTitle: string,
  type: Assignment['type'],
  vocabCardIds: string[],
  dueDate?: number,
  description?: string
): Assignment {
  const assignment: Assignment = {
    id: generateId(),
    classId,
    teacherId,
    title,
    description,
    grade,
    unitNumber,
    unitTitle,
    type,
    dueDate,
    createdAt: Date.now(),
    vocabCardIds,
  };
  saveAssignment(assignment);
  return assignment;
}

// ─── Results Management ───────────────────────────────────────────────────────
export function getAllResults(): StudentResult[] {
  return readStore<StudentResult>(KEY_RESULTS);
}

export function getStudentResults(studentId: string): StudentResult[] {
  return getAllResults().filter((r) => r.studentId === studentId);
}

export function getClassResults(classId: string): StudentResult[] {
  return getAllResults().filter((r) => r.classId === classId);
}

export function getAssignmentResults(assignmentId: string): StudentResult[] {
  return getAllResults().filter((r) => r.assignmentId === assignmentId);
}

export function saveResult(result: StudentResult): void {
  const results = getAllResults().filter((r) => r.id !== result.id);
  results.push(result);
  writeStore(KEY_RESULTS, results);
}

export function submitResult(
  studentId: string,
  assignmentId: string,
  classId: string,
  score: number,
  timeSpentSeconds: number,
  wordsPassed: string[],
  wordsFailed: number,
  details?: StudentResult['details']
): StudentResult {
  const result: StudentResult = {
    id: generateId(),
    studentId,
    assignmentId,
    classId,
    completedAt: Date.now(),
    score,
    timeSpentSeconds,
    wordsLearned: wordsPassed.length,
    wordsFailed,
    wordsPassed,
    details,
  };
  saveResult(result);

  // Update student XP
  const student = findUserById(studentId) as StudentProfile | undefined;
  if (student) {
    student.xp = (student.xp || 0) + Math.round(score * 0.5);
    student.wordsMastered = (student.wordsMastered || 0) + wordsPassed.length;
    // Update rank
    const xp = student.xp;
    if (xp >= 5000) student.rankTitle = 'Thần Đồng 👑';
    else if (xp >= 3000) student.rankTitle = 'Bậc Thầy 🌟';
    else if (xp >= 1500) student.rankTitle = 'Tinh Anh ⚡';
    else if (xp >= 500) student.rankTitle = 'Khá Giỏi 🔥';
    else student.rankTitle = 'Tân Binh 🌱';
    saveUser(student);
  }

  return result;
}

// ─── Study Sessions ───────────────────────────────────────────────────────────
export function getAllStudySessions(): StudySession[] {
  return readStore<StudySession>(KEY_SESSIONS);
}

export function getStudentStudySessions(studentId: string): StudySession[] {
  return getAllStudySessions().filter((s) => s.studentId === studentId);
}

// ─── Review Schedules ─────────────────────────────────────────────────────────
export function getStudentReviews(studentId: string): ReviewSchedule[] {
  const all = readStore<ReviewSchedule>(KEY_REVIEWS);
  return all.filter((r) => r.studentId === studentId);
}

export function saveReview(review: ReviewSchedule): void {
  const all = readStore<ReviewSchedule>(KEY_REVIEWS);
  const filtered = all.filter((r) => !(r.studentId === review.studentId && r.cardId === review.cardId));
  filtered.push(review);
  writeStore(KEY_REVIEWS, filtered);
}

// ─── Seed Demo Data ───────────────────────────────────────────────────────────
export async function seedDemoData(): Promise<void> {
  if (getAllUsers().length > 0) return; // already seeded

  // Create demo teacher
  const teacherResult = await registerTeacher('giaovien', 'giaovien123', 'Thầy Minh Tuấn', 'THCS Nguyễn Du');
  if (!teacherResult.user) return;

  const teacher = teacherResult.user as TeacherProfile;

  // Create classes
  const class7A = createClass(teacher.id, '7A1', 7, 'Lớp 7A1 - Tiếng Anh nâng cao');
  const class8B = createClass(teacher.id, '8B2', 8, 'Lớp 8B2 - Tiếng Anh cơ bản');

  // Create demo students
  const s1 = await registerStudent('hocsinh1', 'hocsinh123', 'Nguyễn Minh Anh', class7A.joinCode);
  const s2 = await registerStudent('hocsinh2', 'hocsinh123', 'Trần Bảo Long', class7A.joinCode);
  const s3 = await registerStudent('hocsinh3', 'hocsinh123', 'Lê Thị Hà My', class8B.joinCode);

  // Update XP for demo
  if (s1.user) {
    const u = s1.user as StudentProfile;
    u.xp = 1250; u.wordsMastered = 18; u.streakDays = 5; u.pvpWins = 7; u.rankTitle = 'Tinh Anh ⚡';
    saveUser(u);
  }
  if (s2.user) {
    const u = s2.user as StudentProfile;
    u.xp = 820; u.wordsMastered = 12; u.streakDays = 3; u.pvpWins = 3; u.rankTitle = 'Khá Giỏi 🔥';
    saveUser(u);
  }
  if (s3.user) {
    const u = s3.user as StudentProfile;
    u.xp = 350; u.wordsMastered = 6; u.streakDays = 1; u.pvpWins = 1; u.rankTitle = 'Tân Binh 🌱';
    saveUser(u);
  }
}
