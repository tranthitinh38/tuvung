import React, { useState, useEffect } from 'react';
import { Grade, PvPQuestion, UserProfile } from '../types';
import confetti from 'canvas-confetti';
import {
  X,
  Swords,
  Shield,
  Trophy,
  Flame,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  Bot,
} from 'lucide-react';

interface PvPArenaProps {
  currentGrade: Grade;
  userProfile: UserProfile;
  onClose: () => void;
  onVictory: (xpGained: number) => void;
}

const OPPONENT_POOL = [
  { name: 'Minh Khang', school: 'THCS Chu Văn An - Hà Nội', rank: 'Kim Cương', avatar: '⚡' },
  { name: 'Linh Đan', school: 'THCS Lê Quý Đôn - TP.HCM', rank: 'Tinh Anh', avatar: '🌸' },
  { name: 'Gia Huy', school: 'THCS Nguyễn Du - Đà Nẵng', rank: 'Bậc Thầy', avatar: '🔥' },
  { name: 'Bảo Châu', school: 'THCS Trần Phú - Hải Phòng', rank: 'Thần Đồng', avatar: '🌟' },
];

export const PvPArena: React.FC<PvPArenaProps> = ({
  currentGrade,
  userProfile,
  onClose,
  onVictory,
}) => {
  const [matchState, setMatchState] = useState<'matchmaking' | 'battle' | 'finished'>('matchmaking');
  const [opponent, setOpponent] = useState(OPPONENT_POOL[0]);
  const [questions, setQuestions] = useState<PvPQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [timeLeft, setTimeLeft] = useState(12);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [combo, setCombo] = useState(0);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Initialize Match & Load Questions
  useEffect(() => {
    const opp = OPPONENT_POOL[Math.floor(Math.random() * OPPONENT_POOL.length)];
    setOpponent(opp);

    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const response = await fetch('/api/generate-pvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grade: currentGrade,
            unit: 'Chương trình Global Success',
            opponentName: opp.name,
          }),
        });

        const data = await response.json();
        if (data.success && data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          useFallbackQuestions();
        }
      } catch (err) {
        useFallbackQuestions();
      } finally {
        setIsLoadingQuestions(false);
        // Delay matchmaking screen for realism
        setTimeout(() => {
          setMatchState('battle');
        }, 1800);
      }
    };

    loadQuestions();
  }, [currentGrade]);

  const useFallbackQuestions = () => {
    setQuestions([
      {
        question: 'Which word describes a person who offers to do community work without pay?',
        contextQuote: '"I volunteer as tribute!" — The Hunger Games',
        options: ['Volunteer', 'Craftsman', 'Artisan', 'Landlord'],
        correctIndex: 0,
        explanation: 'Volunteer (n/v) có nghĩa là tình nguyện viên, tự nguyện làm việc nghĩa.',
        targetWord: 'volunteer',
      },
      {
        question: 'Choose the word with the stress on the THIRD syllable (nhấn trọng âm 3):',
        options: ['environment', 'volunteer', 'activity', 'community'],
        correctIndex: 1,
        explanation: 'vol-un-TEER có trọng âm rơi vào âm tiết thứ 3, các từ còn lại nhấn âm 2.',
        targetWord: 'volunteer',
      },
      {
        question: 'Complete the sentence: "Bat Trang is famous for traditional _____ made by skilled craftsmen."',
        contextQuote: 'Global Success Grade 9 - Unit 1: Local Community',
        options: ['pottery', 'gadgets', 'appliances', 'holograms'],
        correctIndex: 0,
        explanation: 'pottery (n) có nghĩa là đồ gốm thủ công.',
        targetWord: 'pottery',
      },
      {
        question: 'What is a 3D visual projection of an object created with laser beams called?',
        contextQuote: '"Help me, Obi-Wan Kenobi" — Star Wars Hologram',
        options: ['Telescope', 'Hologram', 'Microscope', 'Compass'],
        correctIndex: 1,
        explanation: 'Hologram (n) là ảnh ảo 3D ba chiều.',
        targetWord: 'hologram',
      },
    ]);
  };

  // Battle Countdown Timer
  useEffect(() => {
    if (matchState !== 'battle' || isAnswered) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, matchState, isAnswered]);

  const handleTimeout = () => {
    setIsAnswered(true);
    setPlayerHP((hp) => Math.max(0, hp - 25));
    setCombo(0);
    proceedNextQuestion();
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedOption(optionIdx);

    const currentQ = questions[currentIndex];
    const isCorrect = optionIdx === currentQ.correctIndex;

    if (isCorrect) {
      const speedBonus = Math.max(10, timeLeft * 4);
      const earned = 60 + speedBonus + combo * 15;
      setTotalXPEarned((xp) => xp + earned);
      setCombo((c) => c + 1);
      setOpponentHP((hp) => Math.max(0, hp - 35));
    } else {
      setCombo(0);
      setPlayerHP((hp) => Math.max(0, hp - 25));
    }

    proceedNextQuestion();
  };

  const proceedNextQuestion = () => {
    setTimeout(() => {
      if (currentIndex + 1 < questions.length && playerHP > 0 && opponentHP > 0) {
        setCurrentIndex((i) => i + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setTimeLeft(12);
      } else {
        // Battle finished
        setMatchState('finished');
        if (playerHP >= opponentHP) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
          onVictory(totalXPEarned + 100);
        }
      }
    }, 1800);
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-pink-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-pink-950/70 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-pink-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Swords className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Metaverse PvP Arena • Global Success THCS
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono">
                  LIVE BATTLE
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State 1: Matchmaking Radar */}
        {matchState === 'matchmaking' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-pink-500/10 border-2 border-pink-500/40">
              <span className="text-4xl animate-pulse">{opponent.avatar}</span>
              <div className="absolute inset-0 rounded-full border border-pink-400 animate-ping opacity-30" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                Đang ghép đấu đối thủ Metaverse...
              </h3>
              <p className="text-xs text-slate-400">
                Tìm kiếm bạn học khối THCS cùng trình độ trên khắp Việt Nam
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 w-full max-w-md space-y-1">
              <div className="text-xs font-bold text-pink-400">ĐÃ TÌM THẤY ĐỐI THỦ:</div>
              <div className="text-base font-extrabold text-white">{opponent.name}</div>
              <div className="text-xs text-slate-400">{opponent.school} • Rank {opponent.rank}</div>
            </div>
          </div>
        )}

        {/* State 2: Active Battle Screen */}
        {matchState === 'battle' && currentQ && (
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Health & Arena HUD */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              {/* Player Side */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    {userProfile.name} (Bạn)
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">{playerHP} HP</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-300"
                    style={{ width: `${playerHP}%` }}
                  />
                </div>
              </div>

              {/* Opponent Side */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-pink-400 font-bold">{opponentHP} HP</span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {opponent.name}
                    <Bot className="w-3.5 h-3.5 text-pink-400" />
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-300 ml-auto"
                    style={{ width: `${opponentHP}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Battle Round Timer & Combo */}
            <div className="flex items-center justify-between px-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-orange-400">
                <Flame className="w-4 h-4" />
                <span>COMBO x{combo}</span>
              </div>

              <div className="flex items-center gap-2 font-mono font-bold text-pink-300 bg-pink-950/40 px-3 py-1 rounded-xl border border-pink-500/30">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s</span>
              </div>

              <div className="font-bold text-indigo-300">
                Câu {currentIndex + 1}/{questions.length}
              </div>
            </div>

            {/* Question Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-950/30 to-slate-950 border border-indigo-500/30 space-y-3 text-center">
              {currentQ.contextQuote && (
                <div className="text-xs font-semibold text-pink-300 italic">
                  "{currentQ.contextQuote}"
                </div>
              )}
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                {currentQ.question}
              </h2>
            </div>

            {/* Multiple Choice Answers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((option, idx) => {
                let btnStyle = 'bg-slate-800/80 border-slate-700 hover:border-pink-500/50 text-white';
                if (isAnswered) {
                  if (idx === currentQ.correctIndex) {
                    btnStyle = 'bg-emerald-600/30 border-emerald-400 text-emerald-300 font-bold';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-rose-600/30 border-rose-400 text-rose-300';
                  } else {
                    btnStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(idx)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border text-left font-semibold text-sm transition-all active:scale-98 flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && idx === currentQ.correctIndex && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation once answered */}
            {isAnswered && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 animate-in fade-in">
                <span className="font-bold text-indigo-400">Giải thích:</span> {currentQ.explanation}
              </div>
            )}
          </div>
        )}

        {/* State 3: Battle Finished Screen */}
        {matchState === 'finished' && (
          <div className="p-8 text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-yellow-500 to-amber-600 text-white flex items-center justify-center shadow-xl shadow-yellow-500/30 mx-auto">
                <Trophy className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-indigo-300">
                {playerHP >= opponentHP ? 'CHIẾN THẮNG ĐẤU TRƯỜNG!' : 'NỖ LỰC ĐÁNG KHEN!'}
              </h2>
              <p className="text-xs text-slate-400">
                Trận quyết đấu từ vựng kết thúc ngoạn mục
              </p>
            </div>

            {/* Gamification Output Format strictly following instructions */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-md mx-auto space-y-3 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">XP Gained:</span>
                <span className="font-bold text-yellow-400">+{totalXPEarned + 100} XP</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Rank Status:</span>
                <span className="font-bold text-pink-400">Top 5% Khối THCS Metaverse</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-xs text-indigo-300">
                <span className="font-bold">Challenge Invitation:</span> Bạn đã mở khóa thử thách Đấu trường Boss AI tuần này!
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 active:scale-95 transition-all"
              >
                Nhận Thưởng & Quay Lại
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
