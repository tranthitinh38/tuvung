import React from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';

export default function App() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-600 mx-auto flex items-center justify-center animate-pulse">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">Đang khởi động Global Success Vocab...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  if (user.role === 'teacher') {
    return <TeacherDashboard />;
  }

  if (user.role === 'student') {
    return <StudentDashboard />;
  }

  return <LoginPage />;
}
