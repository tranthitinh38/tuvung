import React, { useState } from 'react';
import { VocabCard } from '../types';
import { calculateRetentionRate, formatTimeUntilReview } from '../utils/spacedRepetition';
import {
  Zap,
  TrendingDown,
  Clock,
  Sparkles,
  CheckCircle,
  RotateCcw,
  Volume2,
  Star,
  Brain,
  ShieldCheck,
} from 'lucide-react';
import { speakText } from '../utils/speech';

interface SpacedRepetitionTrackerProps {
  cards: VocabCard[];
  onRateRecall: (card: VocabCard, rating: number) => void;
  onSelectCard: (card: VocabCard) => void;
}

export const SpacedRepetitionTracker: React.FC<SpacedRepetitionTrackerProps> = ({
  cards,
  onRateRecall,
  onSelectCard,
}) => {
  const [activeReviewCard, setActiveReviewCard] = useState<VocabCard | null>(null);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  const now = Date.now();
  // Filter cards due for review
  const dueCards = cards.filter((c) => c.nextReviewTimestamp <= now);
  const upcomingCards = cards
    .filter((c) => c.nextReviewTimestamp > now)
    .sort((a, b) => a.nextReviewTimestamp - b.nextReviewTimestamp);

  // Overall average retention
  const avgRetention = cards.length > 0
    ? Math.round(cards.reduce((acc, c) => acc + calculateRetentionRate(c), 0) / cards.length)
    : 85;

  const handleStartQuickReview = (card: VocabCard) => {
    setActiveReviewCard(card);
    setShowAnswer(false);
  };

  const handleRateQuickReview = (rating: number) => {
    if (!activeReviewCard) return;
    onRateRecall(activeReviewCard, rating);

    // Pick next due card
    const nextDue = dueCards.find((c) => c.id !== activeReviewCard.id);
    if (nextDue) {
      setActiveReviewCard(nextDue);
      setShowAnswer(false);
    } else {
      setActiveReviewCard(null);
      setShowAnswer(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Forgetting Curve Stats */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Zap className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white">
                Thuật Toán Spaced Repetition
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dựa trên đường cong lãng quên Ebbinghaus, AI tự động tính toán thời điểm "sắp quên" của từng từ để kích hoạt nhắc lại kịp thời, biến trí nhớ ngắn hạn thành trí nhớ vĩnh viễn.
            </p>
          </div>

          {/* Average Memory Retention Meter */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold mb-1">
              Độ bền trí nhớ trung bình (Retention Rate)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                {avgRetention}%
              </span>
              <span className="text-xs font-bold text-emerald-400">Tối ưu</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-cyan-400 to-emerald-400 rounded-full"
                style={{ width: `${avgRetention}%` }}
              />
            </div>
          </div>

          {/* Due Review Summary */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold mb-1">
              Số từ cần ôn hôm nay
            </span>
            <div className="text-4xl font-black text-pink-400">
              {dueCards.length}
            </div>
            {dueCards.length > 0 ? (
              <button
                onClick={() => handleStartQuickReview(dueCards[0])}
                className="mt-2 px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-md shadow-pink-600/30 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                Ôn Ngay (Quick Recall)
              </button>
            ) : (
              <span className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Bạn đã hoàn thành hết bài ôn!
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Forgetting Curve Graph Visualizer */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Biểu Đồ Lãng Quên & Chu Kỳ Nhắc Lại (Ebbinghaus Forgetting Curve)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            R = e^(-t / S)
          </span>
        </div>

        {/* CSS Chart Representation */}
        <div className="grid grid-cols-5 gap-2 text-center pt-2">
          {[
            { label: '20 Phút', retention: '100% → 58%', rep: 'Lần 1', color: 'from-rose-500 to-pink-500' },
            { label: '1 Ngày', retention: '60% → 85%', rep: 'Lần 2 (Nhắc lại)', color: 'from-amber-500 to-orange-500' },
            { label: '3 Ngày', retention: '70% → 92%', rep: 'Lần 3 (Kích hoạt)', color: 'from-cyan-500 to-blue-500' },
            { label: '7 Ngày', retention: '80% → 96%', rep: 'Lần 4 (Củng cố)', color: 'from-indigo-500 to-purple-500' },
            { label: '30 Ngày', retention: '95% → 99%', rep: 'Trí nhớ vĩnh viễn', color: 'from-emerald-500 to-teal-500' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5"
            >
              <span className="text-[11px] font-bold text-slate-400 block">
                {item.label}
              </span>
              <div className={`h-1.5 rounded-full bg-gradient-to-r ${item.color}`} />
              <div className="text-xs font-black text-white">{item.retention}</div>
              <div className="text-[10px] text-indigo-300 font-medium">{item.rep}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Due Cards Quick Recall Flash Modal */}
      {activeReviewCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-pink-500/40 rounded-3xl p-6 shadow-2xl shadow-pink-950/60 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-pink-400 font-bold">
                FLASH RECALL (SPACED REPETITION)
              </span>
              <button
                onClick={() => setActiveReviewCard(null)}
                className="text-slate-400 hover:text-white"
              >
                Đóng
              </button>
            </div>

            <div className="text-center py-6 space-y-2">
              <span className="text-xs text-indigo-400 font-semibold">
                {activeReviewCard.globalSuccessContext}
              </span>
              <h3 className="text-3xl font-black text-white">
                {activeReviewCard.word}
              </h3>
              <p className="text-sm font-mono text-cyan-400 font-semibold">
                {activeReviewCard.ipa}
              </p>
              <button
                onClick={() => speakText(activeReviewCard.word, 0.9)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 mt-2"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Nghe phát âm
              </button>
            </div>

            {/* Answer Display */}
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                Xem Nghĩa & Pop-culture Quote
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-lg font-bold text-white">
                    {activeReviewCard.meaning}
                  </div>
                  <div className="text-xs text-pink-300 italic">
                    "{activeReviewCard.popCultureExample}" ({activeReviewCard.popCultureSource})
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-center text-slate-400">
                    Bạn nhớ từ này ở mức độ nào?
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleRateQuickReview(1)}
                      className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30"
                    >
                      Quên sạch (1★)
                    </button>
                    <button
                      onClick={() => handleRateQuickReview(2)}
                      className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30"
                    >
                      Hơi khó (2★)
                    </button>
                    <button
                      onClick={() => handleRateQuickReview(4)}
                      className="p-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold border border-blue-500/30"
                    >
                      Nhớ tốt (4★)
                    </button>
                    <button
                      onClick={() => handleRateQuickReview(5)}
                      className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30"
                    >
                      Dễ ợt (5★)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Due & Upcoming Vocab Queue Tables */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Lịch trình ôn tập tiếp theo của kho từ vựng
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((card) => {
            const retention = calculateRetentionRate(card);
            const isDue = card.nextReviewTimestamp <= now;

            return (
              <div
                key={card.id}
                onClick={() => onSelectCard(card)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
                  isDue
                    ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                    : 'bg-slate-900 border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-extrabold text-white">
                    {card.word}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isDue
                        ? 'bg-rose-500/20 text-rose-300 animate-pulse'
                        : 'bg-slate-800 text-cyan-300'
                    }`}
                  >
                    {formatTimeUntilReview(card.nextReviewTimestamp)}
                  </span>
                </div>

                <div className="text-xs text-slate-300 mb-2 truncate">
                  {card.meaning}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Trí nhớ: <strong className="text-white">{retention}%</strong></span>
                  <span className="flex items-center gap-0.5 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" /> {card.stars}★
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
