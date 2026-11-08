import React, { useState } from 'react';
import { VocabCard } from '../types';
import { speakText } from '../utils/speech';
import { formatTimeUntilReview } from '../utils/spacedRepetition';
import {
  Volume2,
  Box,
  Mic,
  Brain,
  Star,
  Film,
  Sparkles,
  Clock,
  CheckCircle2,
  Trophy,
  Swords,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface VocabularyCardViewProps {
  card: VocabCard;
  onOpenAR: (card: VocabCard) => void;
  onOpenPronunciation: (card: VocabCard) => void;
  onOpenMemoryBooster: (card: VocabCard) => void;
  onRateRecall: (card: VocabCard, rating: number) => void;
  onLaunchPvPWithWord?: (word: string) => void;
}

export const VocabularyCardView: React.FC<VocabularyCardViewProps> = ({
  card,
  onOpenAR,
  onOpenPronunciation,
  onOpenMemoryBooster,
  onRateRecall,
  onLaunchPvPWithWord,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSpeak = (speed: number = 0.9) => {
    setIsPlayingAudio(true);
    speakText(card.word, speed).finally(() => setIsPlayingAudio(false));
  };

  const timeUntilReviewStr = formatTimeUntilReview(card.nextReviewTimestamp);

  return (
    <div className="group relative bg-slate-900/90 hover:bg-slate-900 rounded-3xl border border-slate-800 hover:border-indigo-500/40 shadow-xl shadow-slate-950/50 p-5 sm:p-6 transition-all duration-300 hover:shadow-indigo-950/30 flex flex-col justify-between">
      
      {/* Top Bar: Global Success Context Tag & Mastery Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono tracking-tight">
          {card.globalSuccessContext}
        </span>

        {/* Spaced Repetition Due Reminder */}
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className={card.nextReviewTimestamp <= Date.now() ? 'text-pink-400 font-bold animate-pulse' : ''}>
            {timeUntilReviewStr}
          </span>
        </div>
      </div>

      {/* Main Word Header */}
      <div className="space-y-1 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-indigo-200 group-hover:to-pink-400 transition-all">
              {card.word}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-mono italic">
              ({card.partOfSpeech})
            </span>
          </div>

          {/* Audio Pronunciation Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSpeak(0.9)}
              disabled={isPlayingAudio}
              className="p-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all active:scale-90"
              title="Nghe phát âm chuẩn US/UK"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSpeak(0.7)}
              className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 border border-slate-700"
              title="Nghe phát âm chậm 0.7x"
            >
              0.7x
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-cyan-400 font-bold">
            {card.ipa}
          </span>
        </div>

        <p className="text-sm sm:text-base font-semibold text-slate-200 mt-1">
          {card.meaning}
        </p>
      </div>

      {/* Section 1: Pop-Culture Example Quote (Contextual Intelligence) */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-4 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-pink-400">
          <Film className="w-3.5 h-3.5" />
          <span>Pop-culture Context:</span>
        </div>
        <p className="text-xs text-slate-200 italic font-medium">
          "{card.popCultureExample}"
        </p>
        <p className="text-[11px] text-slate-400 font-semibold text-right">
          — {card.popCultureSource}
        </p>
      </div>

      {/* Section 2: AR Prompt Preview */}
      <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 mb-4 flex items-start gap-2.5">
        <Box className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed flex-1">
          <span className="font-bold text-cyan-400">AR 3D Model:</span> {card.arPrompt}
        </div>
      </div>

      {/* Expandable Mnemonic & Mind Map Links */}
      {isExpanded && (
        <div className="space-y-3 mb-4 animate-in fade-in duration-200">
          {/* Mnemonic Hint */}
          <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Mẹo ghi nhớ (Mnemonic):
            </span>
            <p className="text-xs text-purple-200 italic">
              "{card.mnemonicHint}"
            </p>
          </div>

          {/* Mind-map keywords */}
          {card.mindMapLinks && card.mindMapLinks.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400">Từ liên quan:</span>
              {card.mindMapLinks.map((link, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700"
                >
                  {link}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mastery Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            Mastery Level
          </span>
          <span className="font-bold text-indigo-300">{card.masteryLevel}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${card.masteryLevel}%` }}
          />
        </div>
      </div>

      {/* Action Toolbar: AR 3D, Pronunciation Lab, Memory Booster */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => onOpenAR(card)}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all hover:scale-105 active:scale-95"
          title="Xem mô hình 3D Hologram không gian AR"
        >
          <Box className="w-3.5 h-3.5 text-cyan-400" />
          <span>AR 3D</span>
        </button>

        <button
          onClick={() => onOpenPronunciation(card)}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold transition-all hover:scale-105 active:scale-95"
          title="Kiểm tra phát âm & phân tích âm phổ với AI"
        >
          <Mic className="w-3.5 h-3.5 text-pink-400" />
          <span>Phát Âm AI</span>
        </button>

        <button
          onClick={() => onOpenMemoryBooster(card)}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all hover:scale-105 active:scale-95"
          title="Mẹo ghi nhớ Mnemonics & Sơ đồ tư duy"
        >
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span>Mind-Map</span>
        </button>
      </div>

      {/* Spaced Repetition Star Rating (1 to 5 stars) */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Đánh giá nhớ:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRateRecall(card, star)}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-500 hover:text-amber-400 transition-colors"
              title={`Đánh giá ${star} sao theo thuật toán Lặp lại ngắt quãng (Spaced Repetition)`}
            >
              <Star
                className={`w-4 h-4 ${
                  star <= card.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                }`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-slate-400 hover:text-white rounded-md text-xs flex items-center gap-0.5"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

    </div>
  );
};
