import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TeacherProfile, ClassRoom, StudentProfile, Assignment, StudentResult } from '../../types/auth';
import {
  getTeacherClasses, createClass, deleteClass, getStudentsInClass,
  addStudentToClass, removeStudentFromClass, regenerateJoinCode,
  createAssignment, getClassAssignments, deleteAssignment,
  getClassResults, getAllResults, findUserById, saveUser, findClassById
} from '../../store/authStore';
import { CURRICULUM_UNITS } from '../../data/curriculum';
import { INITIAL_VOCABULARY_CARDS } from '../../data/curriculum';
import {
  GraduationCap, Users, BookOpen, BarChart2, Plus, Trash2, RefreshCw,
  Copy, Check, Edit3, LogOut, ChevronRight, Award, Clock, FileText,
  Download, Eye, AlertCircle, X, CheckCircle, Hash, Layers, Target
} from 'lucide-react';

type TeacherTab = 'classes' | 'students' | 'assignments' | 'reports';

export function TeacherDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const teacher = user as TeacherProfile;

  const [activeTab, setActiveTab] = useState<TeacherTab>('classes');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);

  // Create class form
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<6 | 7 | 8 | 9>(7);
  const [newClassDesc, setNewClassDesc] = useState('');

  // Create assignment form
  const [aTitle, setATitle] = useState('');
  const [aDesc, setADesc] = useState('');
  const [aUnit, setAUnit] = useState(1);
  const [aType, setAType] = useState<Assignment['type']>('vocabulary');
  const [aDueDate, setADueDate] = useState('');

  const loadClasses = () => {
    const cls = getTeacherClasses(teacher.id);
    setClasses(cls);
    if (selectedClass) {
      const updated = cls.find(c => c.id === selectedClass.id);
      setSelectedClass(updated || null);
    }
  };

  useEffect(() => { loadClasses(); }, [teacher.id]);

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    createClass(teacher.id, newClassName.trim(), newClassGrade, newClassDesc.trim() || undefined);
    loadClasses(); setShowCreateClass(false);
    setNewClassName(''); setNewClassDesc('');
  };

  const handleDeleteClass = (classId: string) => {
    if (!confirm('Xóa lớp này? Dữ liệu học sinh sẽ không bị xóa.')) return;
    deleteClass(classId);
    if (selectedClass?.id === classId) setSelectedClass(null);
    loadClasses();
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRegenerateCode = (classId: string) => {
    regenerateJoinCode(classId);
    loadClasses();
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    const units = CURRICULUM_UNITS[selectedClass.grade];
    const unit = units.find(u => u.number === aUnit);
    const cards = INITIAL_VOCABULARY_CARDS.filter(c => c.grade === selectedClass.grade && c.unitNumber === aUnit);
    const dueTs = aDueDate ? new Date(aDueDate).getTime() : undefined;
    createAssignment(
      teacher.id, selectedClass.id, aTitle.trim(), selectedClass.grade,
      aUnit, unit?.title || `Unit ${aUnit}`, aType,
      cards.map(c => c.id), dueTs, aDesc.trim() || undefined
    );
    setShowCreateAssignment(false);
    setATitle(''); setADesc(''); setADueDate('');
    loadClasses();
  };

  const handleExportExcel = () => {
    if (!selectedClass) return;
    exportClassReportCSV(selectedClass);
  };

  const students = selectedClass ? getStudentsInClass(selectedClass.id) : [];
  const assignments = selectedClass ? getClassAssignments(selectedClass.id) : [];
  const classResults = selectedClass ? getClassResults(selectedClass.id) : [];

  const TAB_BUTTONS: { key: TeacherTab; label: string; icon: React.ReactNode }[] = [
    { key: 'classes', label: 'Lớp học', icon: <Layers className="w-4 h-4" /> },
    { key: 'students', label: 'Học sinh', icon: <Users className="w-4 h-4" /> },
    { key: 'assignments', label: 'Bài tập', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'reports', label: 'Báo cáo', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">{teacher.displayName}</h1>
            <p className="text-xs text-slate-400">{teacher.schoolName || 'Giáo viên'} • {classes.length} lớp</p>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all">
          <LogOut className="w-3.5 h-3.5" /> Đăng xuất
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Classes */}
        <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col p-4 gap-3 overflow-y-auto hidden lg:flex">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lớp của tôi</h2>
            <button onClick={() => setShowCreateClass(true)}
              className="w-6 h-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {classes.map(cls => (
              <button key={cls.id}
                onClick={() => { setSelectedClass(cls); setActiveTab('students'); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group ${selectedClass?.id === cls.id ? 'bg-indigo-600/20 border border-indigo-500/40 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{cls.name}</span>
                  <span className="text-xs text-slate-500">Lớp {cls.grade}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{cls.studentIds.length} học sinh</div>
              </button>
            ))}
            {classes.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">Chưa có lớp nào. Tạo lớp đầu tiên!</p>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Top Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {TAB_BUTTONS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${activeTab === t.key ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {t.icon} {t.label}
              </button>
            ))}
            {selectedClass && (
              <div className="ml-auto flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400 hidden sm:inline">Lớp đang chọn:</span>
                <span className="px-2 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">{selectedClass.name}</span>
              </div>
            )}
          </div>

          {/* TAB: Classes */}
          {activeTab === 'classes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Danh sách lớp học</h2>
                <button onClick={() => setShowCreateClass(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all">
                  <Plus className="w-4 h-4" /> Tạo lớp mới
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {classes.map(cls => (
                  <ClassCard key={cls.id} cls={cls}
                    onSelect={() => { setSelectedClass(cls); setActiveTab('students'); }}
                    onDelete={() => handleDeleteClass(cls.id)}
                    onCopyCode={() => handleCopyCode(cls.joinCode)}
                    onRegenerateCode={() => handleRegenerateCode(cls.id)}
                    copied={copiedCode === cls.joinCode}
                  />
                ))}
                <button onClick={() => setShowCreateClass(true)}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 transition-all group">
                  <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold">Tạo lớp mới</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: Students */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              {!selectedClass ? (
                <SelectClassPrompt onSelect={() => setActiveTab('classes')} />
              ) : (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-white">Học sinh - {selectedClass.name}</h2>
                      <p className="text-xs text-slate-400">{students.length} học sinh • Lớp {selectedClass.grade}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Mã lớp:</span>
                      <code className="px-2 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm font-mono font-bold tracking-widest">
                        {selectedClass.joinCode}
                      </code>
                      <button onClick={() => handleCopyCode(selectedClass.joinCode)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
                        {copiedCode === selectedClass.joinCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleRegenerateCode(selectedClass.id)}
                        title="Tạo mã mới"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <StudentsTable students={students} classId={selectedClass.id} results={classResults} onRefresh={loadClasses} />
                </>
              )}
            </div>
          )}

          {/* TAB: Assignments */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              {!selectedClass ? (
                <SelectClassPrompt onSelect={() => setActiveTab('classes')} />
              ) : (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-white">Bài tập - {selectedClass.name}</h2>
                      <p className="text-xs text-slate-400">{assignments.length} bài tập</p>
                    </div>
                    <button onClick={() => setShowCreateAssignment(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all">
                      <Plus className="w-4 h-4" /> Giao bài tập
                    </button>
                  </div>
                  <AssignmentsTable assignments={assignments} onDelete={(id) => { deleteAssignment(id); loadClasses(); }} />
                </>
              )}
            </div>
          )}

          {/* TAB: Reports */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {!selectedClass ? (
                <SelectClassPrompt onSelect={() => setActiveTab('classes')} />
              ) : (
                <ReportsPanel cls={selectedClass} students={students} results={classResults} onExport={handleExportExcel} />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal: Create Class */}
      {showCreateClass && (
        <Modal title="Tạo lớp mới" onClose={() => setShowCreateClass(false)}>
          <form onSubmit={handleCreateClass} className="space-y-4">
            <FormField label="Tên lớp" required>
              <input value={newClassName} onChange={e => setNewClassName(e.target.value)}
                placeholder="VD: 7A1, Lớp 8B..." required
                className="form-input" />
            </FormField>
            <FormField label="Khối lớp" required>
              <select value={newClassGrade} onChange={e => setNewClassGrade(parseInt(e.target.value) as any)}
                className="form-input">
                {[6, 7, 8, 9].map(g => <option key={g} value={g}>Lớp {g}</option>)}
              </select>
            </FormField>
            <FormField label="Mô tả (tùy chọn)">
              <input value={newClassDesc} onChange={e => setNewClassDesc(e.target.value)}
                placeholder="Mô tả ngắn về lớp..."
                className="form-input" />
            </FormField>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowCreateClass(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all">
                Hủy
              </button>
              <button type="submit"
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all">
                Tạo lớp
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Create Assignment */}
      {showCreateAssignment && selectedClass && (
        <Modal title="Giao bài tập" onClose={() => setShowCreateAssignment(false)}>
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <FormField label="Tiêu đề bài tập" required>
              <input value={aTitle} onChange={e => setATitle(e.target.value)}
                placeholder="VD: Học từ vựng Unit 3" required className="form-input" />
            </FormField>
            <FormField label="Unit">
              <select value={aUnit} onChange={e => setAUnit(parseInt(e.target.value))} className="form-input">
                {CURRICULUM_UNITS[selectedClass.grade].map(u => (
                  <option key={u.number} value={u.number}>Unit {u.number}: {u.title}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Loại bài tập">
              <select value={aType} onChange={e => setAType(e.target.value as any)} className="form-input">
                <option value="vocabulary">Học từ vựng</option>
                <option value="quiz">Kiểm tra trắc nghiệm</option>
                <option value="exercise">Bài luyện tập</option>
              </select>
            </FormField>
            <FormField label="Hạn nộp (tùy chọn)">
              <input type="datetime-local" value={aDueDate} onChange={e => setADueDate(e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Ghi chú (tùy chọn)">
              <textarea value={aDesc} onChange={e => setADesc(e.target.value)}
                placeholder="Hướng dẫn thêm cho học sinh..."
                className="form-input resize-none" rows={2} />
            </FormField>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowCreateAssignment(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all">Hủy</button>
              <button type="submit"
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all">Giao bài</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ClassCard({ cls, onSelect, onDelete, onCopyCode, onRegenerateCode, copied }: {
  cls: ClassRoom; onSelect: () => void; onDelete: () => void;
  onCopyCode: () => void; onRegenerateCode: () => void; copied: boolean;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col gap-3 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-white text-base">{cls.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Khối {cls.grade} • {cls.studentIds.length} học sinh</p>
          {cls.description && <p className="text-xs text-slate-500 mt-1">{cls.description}</p>}
        </div>
        <button onClick={onDelete}
          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Mã lớp:</span>
        <code className="px-2 py-0.5 rounded-lg bg-slate-800 text-indigo-300 text-sm font-mono font-bold tracking-widest">{cls.joinCode}</code>
        <button onClick={onCopyCode} className="p-1 rounded text-slate-500 hover:text-white transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <button onClick={onRegenerateCode} title="Tạo mã mới" className="p-1 rounded text-slate-500 hover:text-amber-400 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <button onClick={onSelect}
        className="mt-auto w-full py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all">
        Quản lý lớp <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function StudentsTable({ students, classId, results, onRefresh }: {
  students: StudentProfile[]; classId: string;
  results: StudentResult[]; onRefresh: () => void;
}) {
  const handleRemove = (studentId: string) => {
    if (!confirm('Xóa học sinh này khỏi lớp?')) return;
    removeStudentFromClass(classId, studentId);
    onRefresh();
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Chưa có học sinh trong lớp.</p>
        <p className="text-xs mt-1">Chia sẻ mã lớp để học sinh tham gia.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Học sinh</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Tên đăng nhập</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400">XP</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400">Từ đã học</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400">Bài đã làm</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400"></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => {
            const sResults = results.filter(r => r.studentId === s.id);
            const avgScore = sResults.length > 0
              ? Math.round(sResults.reduce((sum, r) => sum + r.score, 0) / sResults.length)
              : null;
            return (
              <tr key={s.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/50'}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                      {s.displayName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-xs">{s.displayName}</p>
                      <p className="text-xs text-slate-500">{s.rankTitle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">{s.username}</td>
                <td className="px-4 py-3 text-center text-xs font-bold text-indigo-300">{s.xp.toLocaleString()}</td>
                <td className="px-4 py-3 text-center text-xs text-emerald-400">{s.wordsMastered}</td>
                <td className="px-4 py-3 text-center">
                  {avgScore !== null
                    ? <span className={`text-xs font-bold ${avgScore >= 80 ? 'text-emerald-400' : avgScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{avgScore}%</span>
                    : <span className="text-xs text-slate-600">—</span>
                  }
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleRemove(s.id)}
                    className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AssignmentsTable({ assignments, onDelete }: { assignments: Assignment[]; onDelete: (id: string) => void }) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Chưa có bài tập nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map(a => (
        <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-sm">{a.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.type === 'vocabulary' ? 'bg-indigo-500/20 text-indigo-300' : a.type === 'quiz' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {a.type === 'vocabulary' ? 'Từ vựng' : a.type === 'quiz' ? 'Trắc nghiệm' : 'Bài tập'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Unit {a.unitNumber}: {a.unitTitle} • Lớp {a.grade}</p>
            {a.dueDate && (
              <p className="text-xs text-amber-400 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}
              </p>
            )}
            {a.description && <p className="text-xs text-slate-500 mt-1">{a.description}</p>}
          </div>
          <button onClick={() => { if (confirm('Xóa bài tập này?')) onDelete(a.id); }}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ReportsPanel({ cls, students, results, onExport }: {
  cls: ClassRoom; students: StudentProfile[];
  results: StudentResult[]; onExport: () => void;
}) {
  const totalSubmissions = results.length;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0;
  const totalXP = students.reduce((sum, s) => sum + s.xp, 0);
  const topStudent = students.sort((a, b) => b.xp - a.xp)[0];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Báo cáo - {cls.name}</h2>
          <p className="text-xs text-slate-400">Lớp {cls.grade} • {students.length} học sinh</p>
        </div>
        <button onClick={onExport}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20">
          <Download className="w-4 h-4" /> Xuất Excel (CSV)
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Học sinh', value: students.length, icon: <Users className="w-5 h-5" />, color: 'from-indigo-500 to-blue-600' },
          { label: 'Bài đã nộp', value: totalSubmissions, icon: <FileText className="w-5 h-5" />, color: 'from-pink-500 to-rose-600' },
          { label: 'Điểm TB', value: `${avgScore}%`, icon: <Target className="w-5 h-5" />, color: 'from-amber-500 to-orange-600' },
          { label: 'Tổng XP', value: totalXP.toLocaleString(), icon: <Award className="w-5 h-5" />, color: 'from-emerald-500 to-teal-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white mb-3`}>
              {stat.icon}
            </div>
            <p className="text-xl font-black text-white">{stat.value}</p>
            <p className="text-xs text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Per-student breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <h3 className="font-bold text-white text-sm">Chi tiết từng học sinh</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="text-left px-4 py-2.5 text-xs text-slate-400">Học sinh</th>
              <th className="text-center px-4 py-2.5 text-xs text-slate-400">XP</th>
              <th className="text-center px-4 py-2.5 text-xs text-slate-400">Từ học</th>
              <th className="text-center px-4 py-2.5 text-xs text-slate-400">Bài làm</th>
              <th className="text-center px-4 py-2.5 text-xs text-slate-400">Điểm TB</th>
              <th className="text-center px-4 py-2.5 text-xs text-slate-400">Streak</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => {
              const sResults = results.filter(r => r.studentId === s.id);
              const avg = sResults.length > 0 ? Math.round(sResults.reduce((sum, r) => sum + r.score, 0) / sResults.length) : null;
              return (
                <tr key={s.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {s.displayName.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-white">{s.displayName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center text-xs font-bold text-indigo-300">{s.xp.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-center text-xs text-emerald-400">{s.wordsMastered}</td>
                  <td className="px-4 py-2.5 text-center text-xs text-slate-300">{sResults.length}</td>
                  <td className="px-4 py-2.5 text-center">
                    {avg !== null
                      ? <span className={`text-xs font-bold ${avg >= 80 ? 'text-emerald-400' : avg >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{avg}%</span>
                      : <span className="text-xs text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-center text-xs text-orange-400">{s.streakDays} ngày</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SelectClassPrompt({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="text-center py-16 space-y-3">
      <Layers className="w-12 h-12 mx-auto text-slate-600" />
      <p className="text-slate-400 text-sm">Vui lòng chọn một lớp để xem nội dung.</p>
      <button onClick={onSelect}
        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all">
        Chọn lớp học
      </button>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white text-base">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-300">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

// ─── Export CSV ───────────────────────────────────────────────────────────────
function exportClassReportCSV(cls: ClassRoom) {
  const students = getStudentsInClass(cls.id);
  const results = getClassResults(cls.id);

  const headers = ['Họ tên', 'Tên đăng nhập', 'XP', 'Từ đã học', 'PvP Wins', 'Streak (ngày)', 'Bài đã nộp', 'Điểm TB (%)'];
  const rows = students.map(s => {
    const sResults = results.filter(r => r.studentId === s.id);
    const avg = sResults.length > 0
      ? Math.round(sResults.reduce((sum, r) => sum + r.score, 0) / sResults.length) : 0;
    return [
      s.displayName, s.username, s.xp, s.wordsMastered,
      s.pvpWins, s.streakDays, sResults.length, avg
    ];
  });

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bao-cao-${cls.name}-${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
