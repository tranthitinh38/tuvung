import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile, Assignment, StudentResult, ReviewSchedule } from '../../types/auth';
import {
  getStudentAssignments, getStudentResults, submitResult,
  getStudentReviews, saveReview, findClassById, generateId
} from '../../store/authStore';
import { CURRICULUM_UNITS, INITIAL_VOCABULARY_CARDS } from '../../data/curriculum';
import { VocabCard, Grade } from '../../types';
import {
  BookOpen, Award, Flame, Zap, LogOut, Clock, CheckCircle,
  Star, Trophy, Calendar, TrendingUp, ChevronRight, Play,
  X, RotateCcw, ThumbsUp, ThumbsDown, BarChart2, Users
} from 'lucide-react';

type StudentTab = 'home' | 'study' | 'assignments' | 'results' | 'schedule';

export function StudentDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const student = user as StudentProfile;
  const [activeTab, setActiveTab] = useState<StudentTab>('home');
  const [studyAssignment, setStudyAssignment] = useState<Assignment | null>(null);

  const assignments = getStudentAssignments(student.id);
  const results = getStudentResults(student.id);
  const reviews = getStudentReviews(student.id);
  const cls = student.classId ? findClassById(student.classId) : null;

  // Due reviews
  const now = Date.now();
  const dueReviews = reviews.filter(r => r.nextReview <= now);

  const TAB_BUTTONS: { key: StudentTab; label: string; icon: React.ReactNode }[] = [
    { key: 'home', label: 'Trang chủ', icon: <Award className="w-4 h-4" /> },
    { key: 'study', label: 'Học từ vựng', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'assignments', label: 'Bài tập', icon: <Zap className="w-4 h-4" /> },
    { key: 'results', label: 'Kết quả', icon: <BarChart2 className="w-4 h-4" /> },
    { key: 'schedule', label: 'Lịch ôn', icon: <Calendar className="w-4 h-4" /> },
  ];

  if (studyAssignment) {
    return (
      <StudySession
        student={student}
        assignment={studyAssignment}
        onFinish={(result) => {
          setStudyAssignment(null);
          refreshUser();
          setActiveTab('results');
        }}
        onCancel={() => setStudyAssignment(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-600 flex items-center justify-center text-white font-black text-sm">
            {student.displayName.charAt(0)}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">{student.displayName}</h1>
            <p className="text-xs text-slate-400">{student.rankTitle} • {cls ? cls.name : 'Chưa vào lớp'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300">{student.xp.toLocaleString()} XP</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-600/20 border border-orange-500/30">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-bold text-orange-300">{student.streakDays} ngày</span>
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all">
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất
          </button>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 flex gap-1 overflow-x-auto">
        {TAB_BUTTONS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${activeTab === t.key ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            {t.icon} {t.label}
            {t.key === 'assignments' && assignments.length > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-black">
                {assignments.length}
              </span>
            )}
            {t.key === 'schedule' && dueReviews.length > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-black">
                {dueReviews.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full">
        {/* HOME */}
        {activeTab === 'home' && (
          <HomeTab student={student} cls={cls} assignments={assignments}
            results={results} dueReviews={dueReviews}
            onGoStudy={() => setActiveTab('study')}
            onGoAssignments={() => setActiveTab('assignments')}
          />
        )}

        {/* STUDY */}
        {activeTab === 'study' && (
          <StudyTab student={student} onStartAssignment={(a) => setStudyAssignment(a)} />
        )}

        {/* ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <AssignmentsTab
            assignments={assignments}
            results={results}
            onStart={(a) => setStudyAssignment(a)}
          />
        )}

        {/* RESULTS */}
        {activeTab === 'results' && (
          <ResultsTab results={results} student={student} />
        )}

        {/* SCHEDULE */}
        {activeTab === 'schedule' && (
          <ScheduleTab reviews={reviews} student={student} />
        )}
      </main>
    </div>
  );
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────
function HomeTab({ student, cls, assignments, results, dueReviews, onGoStudy, onGoAssignments }: {
  student: StudentProfile; cls: any; assignments: Assignment[];
  results: StudentResult[]; dueReviews: ReviewSchedule[];
  onGoStudy: () => void; onGoAssignments: () => void;
}) {
  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;

  return (
    <div className="space-y-5">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-950 via-slate-900 to-indigo-950 border border-pink-500/20 p-6 shadow-2xl">
        <div className="relative z-10">
          <p className="text-pink-300 text-sm font-semibold mb-1">Chào mừng trở lại! 👋</p>
          <h2 className="text-2xl font-black text-white">{student.displayName}</h2>
          <p className="text-slate-400 text-sm mt-1">{student.rankTitle} • Lớp {student.grade || '?'} • {cls?.name || 'Chưa vào lớp'}</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <StatChip icon={<Zap className="w-3.5 h-3.5" />} value={`${student.xp.toLocaleString()} XP`} color="indigo" />
            <StatChip icon={<Flame className="w-3.5 h-3.5" />} value={`${student.streakDays} ngày liên tiếp`} color="orange" />
            <StatChip icon={<BookOpen className="w-3.5 h-3.5" />} value={`${student.wordsMastered} từ đã học`} color="emerald" />
            <StatChip icon={<Trophy className="w-3.5 h-3.5" />} value={`${student.pvpWins} chiến thắng PvP`} color="amber" />
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Điểm TB" value={`${avgScore}%`} icon={<BarChart2 className="w-5 h-5" />} color="from-indigo-500 to-blue-600" />
        <StatCard label="Bài đã làm" value={results.length} icon={<CheckCircle className="w-5 h-5" />} color="from-pink-500 to-rose-600" />
        <StatCard label="Cần ôn tập" value={dueReviews.length} icon={<RotateCcw className="w-5 h-5" />} color="from-amber-500 to-orange-600" />
        <StatCard label="Bài chờ làm" value={assignments.length} icon={<Zap className="w-5 h-5" />} color="from-emerald-500 to-teal-600" />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ActionCard
          title="Học từ vựng"
          desc="Học các từ vựng theo Unit chương trình Global Success"
          icon={<BookOpen className="w-6 h-6" />}
          color="from-pink-600 to-rose-600"
          onClick={onGoStudy}
        />
        {assignments.length > 0 && (
          <ActionCard
            title={`${assignments.length} Bài tập chờ`}
            desc="Giáo viên đã giao bài tập. Làm ngay để tích XP!"
            icon={<Zap className="w-6 h-6" />}
            color="from-amber-600 to-orange-600"
            onClick={onGoAssignments}
          />
        )}
      </div>
    </div>
  );
}

function StatChip({ icon, value, color }: { icon: React.ReactNode; value: string; color: string }) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${colors[color]}`}>
      {icon} {value}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${color} flex items-center justify-center text-white mb-3`}>{icon}</div>
      <p className="text-xl font-black text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function ActionCard({ title, desc, icon, color, onClick }: {
  title: string; desc: string; icon: React.ReactNode; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`text-left p-5 rounded-2xl bg-gradient-to-br ${color} text-white shadow-xl hover:scale-[1.02] active:scale-100 transition-all group`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 opacity-90">{icon}</div>
        <div>
          <h3 className="font-bold text-base">{title}</h3>
          <p className="text-xs opacity-80 mt-0.5">{desc}</p>
        </div>
        <ChevronRight className="ml-auto mt-0.5 w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
}

// ─── Study Tab (Free Study) ───────────────────────────────────────────────────
function StudyTab({ student, onStartAssignment }: {
  student: StudentProfile; onStartAssignment: (a: Assignment) => void;
}) {
  const grade = (student.grade || 7) as Grade;
  const units = CURRICULUM_UNITS[grade] || [];
  const [selectedUnit, setSelectedUnit] = useState(units[0]?.number || 1);
  const cards = INITIAL_VOCABULARY_CARDS.filter(c => c.grade === grade && c.unitNumber === selectedUnit);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">Học từ vựng tự do</h2>
        <p className="text-xs text-slate-400">Chương trình Global Success • Lớp {grade}</p>
      </div>

      {/* Unit Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {units.map(u => (
          <button key={u.number}
            onClick={() => setSelectedUnit(u.number)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedUnit === u.number ? 'bg-pink-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            Unit {u.number}
          </button>
        ))}
      </div>

      {/* Unit Info */}
      {units.find(u => u.number === selectedUnit) && (() => {
        const unit = units.find(u => u.number === selectedUnit)!;
        return (
          <div className={`p-4 rounded-2xl bg-gradient-to-r ${unit.themeColor} text-white`}>
            <h3 className="font-bold">Unit {unit.number}: {unit.title}</h3>
            <p className="text-xs opacity-80 mt-0.5">{unit.vietnameseTitle}</p>
            <p className="text-xs opacity-70 mt-1">📖 Ngữ pháp: {unit.grammarFocus}</p>
          </div>
        );
      })()}

      {/* Vocab Cards */}
      {cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cards.map(card => (
            <VocabMiniCard key={card.id} card={card} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-500">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Chưa có từ vựng cho Unit này.</p>
        </div>
      )}
    </div>
  );
}

function VocabMiniCard({ card }: { card: VocabCard }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={`bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 cursor-pointer transition-all ${flipped ? 'bg-indigo-950/50 border-indigo-500/30' : ''}`}
      onClick={() => setFlipped(!flipped)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{card.word}</span>
            <span className="text-xs text-slate-500 italic">{card.partOfSpeech}</span>
          </div>
          <span className="text-xs text-indigo-300 font-mono">{card.ipa}</span>
        </div>
        <div className="flex">
          {Array.from({ length: card.difficultyLevel }).map((_, i) => (
            <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
          ))}
        </div>
      </div>
      {flipped && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1.5">
          <p className="text-sm text-emerald-300 font-semibold">{card.meaning}</p>
          {card.mnemonicHint && <p className="text-xs text-slate-400">💡 {card.mnemonicHint}</p>}
          {card.popCultureExample && <p className="text-xs text-pink-300 italic">"{card.popCultureExample}"</p>}
        </div>
      )}
      {!flipped && <p className="text-xs text-slate-600 mt-2">Nhấn để xem nghĩa →</p>}
    </div>
  );
}

// ─── Assignments Tab ──────────────────────────────────────────────────────────
function AssignmentsTab({ assignments, results, onStart }: {
  assignments: Assignment[]; results: StudentResult[];
  onStart: (a: Assignment) => void;
}) {
  const completedIds = results.map(r => r.assignmentId);

  if (assignments.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Chưa có bài tập nào từ giáo viên.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Bài tập được giao</h2>
      {assignments.map(a => {
        const done = completedIds.includes(a.id);
        const myResult = results.find(r => r.assignmentId === a.id);
        return (
          <div key={a.id} className={`bg-slate-900 border rounded-2xl p-4 ${done ? 'border-emerald-500/30' : 'border-slate-800'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-white text-sm">{a.title}</h3>
                  {done && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold"><CheckCircle className="w-3 h-3" /> Đã làm</span>}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Unit {a.unitNumber}: {a.unitTitle}</p>
                {a.dueDate && (
                  <p className={`text-xs mt-0.5 flex items-center gap-1 ${a.dueDate < Date.now() && !done ? 'text-red-400' : 'text-amber-400'}`}>
                    <Clock className="w-3 h-3" />
                    {a.dueDate < Date.now() && !done ? 'Quá hạn: ' : 'Hạn: '}
                    {new Date(a.dueDate).toLocaleDateString('vi-VN')}
                  </p>
                )}
                {myResult && (
                  <p className="text-xs text-indigo-300 mt-1">Điểm của bạn: <span className="font-bold">{myResult.score}%</span></p>
                )}
              </div>
              {!done && (
                <button onClick={() => onStart(a)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shrink-0">
                  <Play className="w-3.5 h-3.5" /> Làm bài
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Results Tab ──────────────────────────────────────────────────────────────
function ResultsTab({ results, student }: { results: StudentResult[]; student: StudentProfile }) {
  if (results.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Chưa có kết quả nào.</p>
        <p className="text-xs mt-1">Hoàn thành bài tập để xem kết quả của bạn.</p>
      </div>
    );
  }

  const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  const totalWords = results.reduce((s, r) => s + r.wordsLearned, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">Kết quả cá nhân</h2>
        <p className="text-xs text-slate-400">Chỉ bạn mới thấy kết quả của mình</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-white">{results.length}</p>
          <p className="text-xs text-slate-400 mt-1">Bài đã làm</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className={`text-2xl font-black ${avgScore >= 80 ? 'text-emerald-400' : avgScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{avgScore}%</p>
          <p className="text-xs text-slate-400 mt-1">Điểm TB</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-indigo-300">{totalWords}</p>
          <p className="text-xs text-slate-400 mt-1">Từ đã học</p>
        </div>
      </div>

      <div className="space-y-3">
        {results.slice().reverse().map(r => (
          <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm font-semibold text-white">Bài tập • {new Date(r.completedAt).toLocaleDateString('vi-VN')}</p>
                <p className="text-xs text-slate-400 mt-0.5">{r.wordsLearned} từ đúng • {r.wordsFailed} từ sai • {Math.round(r.timeSpentSeconds / 60)} phút</p>
              </div>
              <div className="text-right">
                <span className={`text-xl font-black ${r.score >= 80 ? 'text-emerald-400' : r.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {r.score}%
                </span>
              </div>
            </div>
            {/* Score bar */}
            <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${r.score >= 80 ? 'bg-emerald-500' : r.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${r.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Schedule Tab ─────────────────────────────────────────────────────────────
function ScheduleTab({ reviews, student }: { reviews: ReviewSchedule[]; student: StudentProfile }) {
  const now = Date.now();
  const due = reviews.filter(r => r.nextReview <= now);
  const upcoming = reviews.filter(r => r.nextReview > now).sort((a, b) => a.nextReview - b.nextReview);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">Lịch ôn tập (Spaced Repetition)</h2>
        <p className="text-xs text-slate-400">Dựa trên đường cong quên của Ebbinghaus</p>
      </div>

      {due.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-red-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Cần ôn ngay ({due.length} từ)
          </h3>
          {due.map(r => (
            <ReviewCard key={r.cardId} review={r} urgent />
          ))}
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> Lịch ôn tới ({upcoming.length} từ)
          </h3>
          {upcoming.slice(0, 10).map(r => (
            <ReviewCard key={r.cardId} review={r} />
          ))}
        </div>
      )}

      {reviews.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Chưa có lịch ôn tập.</p>
          <p className="text-xs mt-1">Học và làm bài để hệ thống tạo lịch ôn tối ưu.</p>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review, urgent }: { review: ReviewSchedule; urgent?: boolean }) {
  const timeStr = urgent
    ? 'Cần ôn ngay!'
    : (() => {
        const diff = review.nextReview - Date.now();
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(hours / 24);
        return days > 0 ? `Sau ${days} ngày` : `Sau ${hours} giờ`;
      })();

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${urgent ? 'bg-red-950/30 border-red-500/30' : 'bg-slate-900 border-slate-800'}`}>
      <div>
        <span className="font-bold text-white text-sm">{review.word}</span>
        <p className="text-xs text-slate-500">Lặp lại lần {review.repetitions}</p>
      </div>
      <span className={`text-xs font-semibold ${urgent ? 'text-red-400' : 'text-slate-400'}`}>{timeStr}</span>
    </div>
  );
}

// ─── Study Session (Quiz Mode) ────────────────────────────────────────────────
function StudySession({ student, assignment, onFinish, onCancel }: {
  student: StudentProfile; assignment: Assignment;
  onFinish: (result: StudentResult) => void; onCancel: () => void;
}) {
  const cards = INITIAL_VOCABULARY_CARDS.filter(c => assignment.vocabCardIds.includes(c.id));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [wrongWords, setWrongWords] = useState<string[]>([]);

  const card = cards[currentIdx];

  // Generate MCQ options for each card
  const getOptions = (card: VocabCard) => {
    const others = INITIAL_VOCABULARY_CARDS
      .filter(c => c.id !== card.id && c.grade === card.grade)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.meaning);
    const options = [...others, card.meaning].sort(() => Math.random() - 0.5);
    const correctIdx = options.indexOf(card.meaning);
    return { options, correctIdx };
  };

  const [currentQuestion, setCurrentQuestion] = useState(() => card ? getOptions(card) : { options: [], correctIdx: 0 });

  useEffect(() => {
    if (card) setCurrentQuestion(getOptions(card));
  }, [currentIdx]);

  const handleAnswer = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowAnswer(true);
    const correct = idx === currentQuestion.correctIdx;
    if (correct) setScore(s => s + 1);
    else setWrongWords(w => [...w, card.word]);
    setTimeout(() => {
      if (currentIdx + 1 >= cards.length) {
        setFinished(true);
      } else {
        setCurrentIdx(i => i + 1);
        setSelectedOption(null);
        setShowAnswer(false);
      }
    }, 1200);
  };

  const handleSubmit = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const finalScore = Math.round((score / Math.max(cards.length, 1)) * 100);
    const passedCards = cards.filter((c, i) => !wrongWords.includes(c.word)).map(c => c.id);

    const result = submitResult(
      student.id, assignment.id, assignment.classId,
      finalScore, timeSpent, passedCards, wrongWords.length
    );

    // Schedule reviews for wrong words
    wrongWords.forEach(word => {
      const c = cards.find(c => c.word === word);
      if (c) {
        saveReview({
          studentId: student.id, cardId: c.id, word: c.word,
          nextReview: Date.now() + 4 * 3600000, // 4 hours
          interval: 1, easeFactor: 2.5, repetitions: 1
        });
      }
    });

    onFinish(result);
  };

  if (!card && !finished) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>Bài tập này không có từ vựng.</p>
        <button onClick={onCancel} className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Quay lại</button>
      </div>
    );
  }

  if (finished) {
    const finalScore = Math.round((score / Math.max(cards.length, 1)) * 100);
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 text-center space-y-5">
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${finalScore >= 80 ? 'bg-emerald-500/20' : finalScore >= 60 ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
            <Trophy className={`w-10 h-10 ${finalScore >= 80 ? 'text-emerald-400' : finalScore >= 60 ? 'text-amber-400' : 'text-red-400'}`} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Hoàn thành!</h2>
            <p className={`text-5xl font-black mt-3 ${finalScore >= 80 ? 'text-emerald-400' : finalScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
              {finalScore}%
            </p>
            <p className="text-slate-400 text-sm mt-2">{score}/{cards.length} câu đúng</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <ThumbsUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="font-bold text-emerald-400">{score} đúng</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <ThumbsDown className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="font-bold text-red-400">{wrongWords.length} sai</p>
            </div>
          </div>
          <p className="text-xs text-indigo-300">+{Math.round(finalScore * 0.5)} XP đã được cộng vào tài khoản!</p>
          <button onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-sm shadow-xl transition-all hover:scale-105">
            Xem kết quả
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Quiz Header */}
      <div className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button onClick={onCancel} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors">
          <X className="w-4 h-4" /> Thoát
        </button>
        <div className="text-center">
          <p className="text-xs text-slate-400">{assignment.title}</p>
          <p className="text-sm font-bold text-white">{currentIdx + 1} / {cards.length}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Điểm</p>
          <p className="text-sm font-bold text-emerald-400">{score} đúng</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-800">
        <div className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all"
          style={{ width: `${((currentIdx) / cards.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Chọn nghĩa đúng của từ</p>
            <h2 className="text-4xl font-black text-white">{card.word}</h2>
            <p className="text-indigo-300 font-mono text-sm">{card.ipa}</p>
            <p className="text-xs text-slate-500 italic">{card.partOfSpeech}</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((opt, idx) => {
              let cls = 'bg-slate-800 border-slate-700 text-white hover:border-slate-500';
              if (selectedOption !== null) {
                if (idx === currentQuestion.correctIdx) cls = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                else if (idx === selectedOption) cls = 'bg-red-500/20 border-red-500 text-red-300';
                else cls = 'bg-slate-800 border-slate-700 text-slate-500 opacity-50';
              }
              return (
                <button key={idx} onClick={() => handleAnswer(idx)}
                  className={`w-full px-4 py-3.5 rounded-2xl border text-left text-sm font-semibold transition-all ${cls} ${selectedOption === null ? 'hover:scale-[1.01] active:scale-[0.99]' : ''}`}>
                  <span className="inline-flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                      {['A', 'B', 'C', 'D'][idx]}
                    </span>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
