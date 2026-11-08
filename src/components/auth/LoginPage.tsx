import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { registerTeacher, registerStudent, findClassByCode } from '../../store/authStore';
import { GraduationCap, BookOpen, Eye, EyeOff, Lock, User, AlertCircle, CheckCircle, KeyRound, Shield } from 'lucide-react';

type AuthMode = 'login' | 'register-teacher' | 'register-student';

export function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setError(''); setSuccess('');
    setUsername(''); setPassword(''); setConfirmPassword('');
    setDisplayName(''); setSchoolName(''); setClassCode('');
  };

  const switchMode = (m: AuthMode) => { reset(); setMode(m); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (!result.success) setError(result.error || 'Đăng nhập thất bại.');
  };

  const handleRegisterTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Mật khẩu xác nhận không khớp.');
    setLoading(true);
    const result = await registerTeacher(username.trim(), password, displayName.trim(), schoolName.trim() || undefined);
    setLoading(false);
    if (result.success) {
      setSuccess('Đăng ký thành công! Hãy đăng nhập.');
      setTimeout(() => switchMode('login'), 1500);
    } else {
      setError(result.error || 'Đăng ký thất bại.');
    }
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Mật khẩu xác nhận không khớp.');
    if (classCode && !findClassByCode(classCode.trim())) {
      return setError('Mã lớp không hợp lệ. Vui lòng kiểm tra lại.');
    }
    setLoading(true);
    const result = await registerStudent(username.trim(), password, displayName.trim(), classCode.trim() || undefined);
    setLoading(false);
    if (result.success) {
      setSuccess('Đăng ký thành công! Hãy đăng nhập.');
      setTimeout(() => switchMode('login'), 1500);
    } else {
      setError(result.error || 'Đăng ký thất bại.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-pink-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-600 shadow-2xl shadow-indigo-500/30 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Global Success Vocab</h1>
          <p className="text-sm text-slate-400 mt-1">Hệ thống học từ vựng thông minh THCS</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
          {/* Mode Tabs */}
          {mode === 'login' && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => switchMode('register-teacher')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                Đăng ký Giáo viên
              </button>
              <button
                onClick={() => switchMode('register-student')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                <BookOpen className="w-4 h-4 text-pink-400" />
                Đăng ký Học sinh
              </button>
            </div>
          )}

          {/* Title */}
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            {mode === 'login' && <><Lock className="w-5 h-5 text-indigo-400" /> Đăng nhập</>}
            {mode === 'register-teacher' && <><GraduationCap className="w-5 h-5 text-indigo-400" /> Đăng ký Giáo viên</>}
            {mode === 'register-student' && <><BookOpen className="w-5 h-5 text-pink-400" /> Đăng ký Học sinh</>}
          </h2>

          {/* Alert Messages */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm mb-4">
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <InputField label="Tên đăng nhập" value={username} onChange={setUsername}
                icon={<User className="w-4 h-4" />} placeholder="giaovien hoặc hocsinh1" autoComplete="username" />
              <PasswordField label="Mật khẩu" value={password} onChange={setPassword}
                show={showPassword} onToggle={() => setShowPassword(!showPassword)} />

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
              </button>

              {/* Demo hint */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40 space-y-1">
                <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" /> Tài khoản demo:
                </p>
                <p className="text-xs text-slate-400">🎓 Giáo viên: <span className="text-indigo-300 font-mono">giaovien / giaovien123</span></p>
                <p className="text-xs text-slate-400">📚 Học sinh: <span className="text-pink-300 font-mono">hocsinh1 / hocsinh123</span></p>
              </div>
            </form>
          )}

          {/* REGISTER TEACHER FORM */}
          {mode === 'register-teacher' && (
            <form onSubmit={handleRegisterTeacher} className="space-y-4">
              <InputField label="Họ và tên" value={displayName} onChange={setDisplayName}
                icon={<User className="w-4 h-4" />} placeholder="Nguyễn Văn A" />
              <InputField label="Tên trường (tùy chọn)" value={schoolName} onChange={setSchoolName}
                icon={<GraduationCap className="w-4 h-4" />} placeholder="THCS Nguyễn Du" />
              <InputField label="Tên đăng nhập" value={username} onChange={setUsername}
                icon={<KeyRound className="w-4 h-4" />} placeholder="giaovien_nguyena" autoComplete="username" />
              <PasswordField label="Mật khẩu (ít nhất 6 ký tự)" value={password} onChange={setPassword}
                show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              <PasswordField label="Xác nhận mật khẩu" value={confirmPassword} onChange={setConfirmPassword}
                show={showPassword} onToggle={() => setShowPassword(!showPassword)} placeholder="Nhập lại mật khẩu" />

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm transition-all disabled:opacity-60">
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký Giáo viên'}
              </button>
              <button type="button" onClick={() => switchMode('login')}
                className="w-full py-2 text-slate-400 hover:text-white text-xs transition-colors">
                ← Quay lại đăng nhập
              </button>
            </form>
          )}

          {/* REGISTER STUDENT FORM */}
          {mode === 'register-student' && (
            <form onSubmit={handleRegisterStudent} className="space-y-4">
              <InputField label="Họ và tên" value={displayName} onChange={setDisplayName}
                icon={<User className="w-4 h-4" />} placeholder="Nguyễn Thị B" />
              <InputField label="Tên đăng nhập" value={username} onChange={setUsername}
                icon={<KeyRound className="w-4 h-4" />} placeholder="nguyenthib_7a" autoComplete="username" />
              <PasswordField label="Mật khẩu (ít nhất 6 ký tự)" value={password} onChange={setPassword}
                show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              <PasswordField label="Xác nhận mật khẩu" value={confirmPassword} onChange={setConfirmPassword}
                show={showPassword} onToggle={() => setShowPassword(!showPassword)} placeholder="Nhập lại mật khẩu" />
              <InputField label="Mã lớp (nếu có)" value={classCode} onChange={setClassCode}
                icon={<BookOpen className="w-4 h-4" />} placeholder="VD: ABCD12" />
              <p className="text-xs text-slate-500 -mt-2">Hỏi giáo viên để lấy mã lớp. Có thể để trống và tham gia sau.</p>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-sm transition-all disabled:opacity-60">
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký Học sinh'}
              </button>
              <button type="button" onClick={() => switchMode('login')}
                className="w-full py-2 text-slate-400 hover:text-white text-xs transition-colors">
                ← Quay lại đăng nhập
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          🔒 Mật khẩu được mã hóa SHA-256 • Phiên làm việc 8 giờ
        </p>
      </div>
    </div>
  );
}

// ─── Shared Input Components ───────────────────────────────────────────────────
function InputField({
  label, value, onChange, icon, placeholder, autoComplete, type = 'text'
}: {
  label: string; value: string; onChange: (v: string) => void;
  icon?: React.ReactNode; placeholder?: string; autoComplete?: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-300">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete} required
          className={`w-full ${icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-indigo-500 text-white text-sm placeholder-slate-500 outline-none transition-colors`}
        />
      </div>
    </div>
  );
}

function PasswordField({
  label, value, onChange, show, onToggle, placeholder
}: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-300">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder || 'Nhập mật khẩu'} required autoComplete="current-password"
          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-indigo-500 text-white text-sm placeholder-slate-500 outline-none transition-colors"
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
