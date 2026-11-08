import React, { useState } from 'react';
import { VocabCard } from '../types';
import {
  X,
  Brain,
  Network,
  Lightbulb,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  GitBranch,
} from 'lucide-react';

interface MemoryBoosterModalProps {
  card: VocabCard;
  onClose: () => void;
}

export const MemoryBoosterModal: React.FC<MemoryBoosterModalProps> = ({ card, onClose }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Categorize mind map links into related clusters
  const links = card.mindMapLinks && card.mindMapLinks.length > 0
    ? card.mindMapLinks
    : ['collocation', 'synonym', 'word family'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/60 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/80 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Memory Booster: Mnemonics & Mind-Map
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                  ĐỘ KHÓ: {card.difficultyLevel}★
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Phương pháp ghi nhớ siêu tốc qua sơ đồ tư duy & bắc cầu âm thanh tương tự
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Mnemonic Story Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <Lightbulb className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Mẹo ghi nhớ (Mnemonic Hint)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                    NEURAL LINK
                  </span>
                </div>
                <p className="text-sm text-slate-100 font-medium leading-relaxed">
                  "{card.mnemonicHint}"
                </p>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>
                    Liên kết âm thanh hoặc câu chuyện ngộ nghĩnh giúp lưu trữ vào bộ nhớ dài hạn (Long-term Memory).
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Mind-Map Visualization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Network className="w-4 h-4 text-cyan-400" />
                Sơ đồ tư duy liên kết (Mind-Map Link):
              </span>
              <span className="text-[11px] text-slate-400">
                Bấm vào các nhánh để kích hoạt liên tưởng
              </span>
            </div>

            {/* Mind-map Graphic Canvas Area */}
            <div className="relative min-h-[220px] rounded-2xl bg-slate-950/90 border border-slate-800 p-4 flex flex-col items-center justify-center overflow-hidden">
              {/* Radial gradient background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12)_0%,transparent_70%)] pointer-events-none" />

              {/* Central Target Node */}
              <div className="relative z-10 flex flex-col items-center justify-center px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400/40 text-center animate-pulse-glow">
                <span className="text-lg font-black tracking-wide">{card.word}</span>
                <span className="text-[11px] font-mono text-purple-200">{card.ipa}</span>
              </div>

              {/* Orbiting Satellite Branches */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-6 z-10">
                {links.map((link, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedNode(link)}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                      selectedNode === link
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-purple-500/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                      <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                      <span>{link}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Common Exam Trap / Note */}
          {card.commonMistake && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-rose-400">Bẫy đề thi THCS hay gặp:</span>
                <p className="text-xs text-rose-200 font-medium mt-0.5 leading-relaxed">
                  {card.commonMistake}
                </p>
              </div>
            </div>
          )}

          {/* Pop-Culture Context Highlight */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Ngữ cảnh văn hóa đại chúng (Pop-culture quote):</span>
            <p className="text-sm font-semibold text-pink-300 italic">
              "{card.popCultureExample}"
            </p>
            <p className="text-xs text-slate-400 font-medium">
              — Nguồn: <span className="text-white font-bold">{card.popCultureSource}</span>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
