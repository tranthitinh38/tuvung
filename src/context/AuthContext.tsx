import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AuthUser, AuthSession, TeacherProfile, StudentProfile
} from '../types/auth';
import {
  getActiveSession, getCurrentUser, login as authLogin, logout as authLogout,
  seedDemoData
} from '../store/authStore';

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(() => {
    const sess = getActiveSession();
    const usr = getCurrentUser();
    setSession(sess);
    setUser(usr);
  }, []);

  useEffect(() => {
    // Seed demo data on first load
    seedDemoData().then(() => {
      refreshUser();
      setIsLoading(false);
    });
  }, [refreshUser]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await authLogin(username, password);
    if (result.success && result.session && result.user) {
      setSession(result.session);
      setUser(result.user);
    }
    return { success: result.success, error: result.error };
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, session, isLoading,
      isAuthenticated: !!user,
      login, logout, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useTeacher() {
  const { user } = useAuth();
  if (user?.role !== 'teacher') return null;
  return user as TeacherProfile;
}

export function useStudent() {
  const { user } = useAuth();
  if (user?.role !== 'student') return null;
  return user as StudentProfile;
}
