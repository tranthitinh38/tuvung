import React from 'react';
import { Grade, UserProfile } from '../types';
import { Sparkles, Flame, Trophy, Scan, Swords, Bot, GraduationCap, Zap } from 'lucide-react';

interface HeaderProps {
  currentGrade: Grade;
  onSelectGrade: (grade: Grade) => void;
  userProfile: UserProfile;
  onOpenScan: () => void;
  onOpenPvP: () => void;
  onOpenMentorChat: () => void;
  activeTab: 'study' | 'spaced-repetition' | 'pvp' | 'curriculum';
  setActiveTab: (tab: 'study' | 'spaced-repetition' | 'pvp' | 'curriculum') => void;
  dueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentGrade,
  onSelectGrade,
  userProfile,
  onOpenScan,
  onOpenPvP,
  onOpenMentorChat,
  activeTab,
  setActiveTab,
  dueCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-indigo-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/30">
              <Sparkles className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '8s' }} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                  Global Success <span className="text-pink-400 font-black">AI</span>
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  THCS THÍCH ỨNG
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Architect Luyện Từ Vựng Đột Phá • AR 3D • Spaced Repetition
              </p>
            </div>
          </div>

          {/* Grade Selector (Lớp 6, 7, 8, 9) */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
            <span className="text-xs font-semibold text-slate-400 pl-2 pr-1 hidden md:inline flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              Khối:
            </span>
            {([6, 7, 8, 9] as Grade[]).map((g) => (
              <button
                key={g}
                onClick={() => onSelectGrade(g)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentGrade === g
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Lớp {g}
              </button>
            ))}
          </div>

          {/* User Gamification Stats */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold" title="Chuỗi ngày học liên tục">
              <Flame className="w-4 h-4 fill-orange-400 text-orange-400 animate-bounce" />
              <span>{userProfile.streakDays}d</span>
            </div>

            {/* XP and Rank */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>{userProfile.xp.toLocaleString()} XP</span>
              <span className="text-slate-500">•</span>
              <span className="text-yellow-300 text-[11px] font-extrabold">{userProfile.rankTitle}</span>
            </div>

            {/* Action Buttons */}
            <button
              onClick={onOpenScan}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              title="Quét ảnh SGK hoặc dán văn bản để AI Architect phân tích"
            >
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">Smart Scan</span>
            </button>

            <button
              onClick={onOpenPvP}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition-all hover:scale-105 active:scale-95"
              title="Vào Đấu trường Metaverse PvP"
            >
              <Swords className="w-4 h-4" />
              <span className="hidden sm:inline">Đấu Trường PvP</span>
            </button>

            {/* Mentor Chat Drawer Toggle */}
            <button
              onClick={onOpenMentorChat}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all hover:border-indigo-400"
              title="Trò chuyện với AI Mentor Architect"
            >
              <Bot className="w-4 h-4 text-pink-400" />
              <span className="hidden lg:inline">AI Mentor</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 sm:gap-2 pb-2.5 pt-1 overflow-x-auto border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('study')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'study'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Học Từ Vựng & AR 3D
          </button>

          <button
            onClick={() => setActiveTab('spaced-repetition')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all relative ${
              activeTab === 'spaced-repetition'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Biểu Đồ Quên & Spaced Repetition
            {dueCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-pink-500 text-white animate-pulse">
                {dueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'curriculum'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            Khung Chương Trình Global Success (Lớp {currentGrade})
          </button>

          <button
            onClick={() => setActiveTab('pvp')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'pvp'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-rose-400" />
            Metaverse Arena PvP
          </button>
        </div>
      </div>
    </header>
  );
};
