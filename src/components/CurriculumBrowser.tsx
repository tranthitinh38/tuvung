import React from 'react';
import { Grade, UnitInfo, VocabCard } from '../types';
import { CURRICULUM_UNITS } from '../data/curriculum';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface CurriculumBrowserProps {
  currentGrade: Grade;
  selectedUnitNumber: number | null;
  onSelectUnit: (unitNumber: number | null) => void;
  cards: VocabCard[];
  onOpenScanForUnit: (unitTitle: string) => void;
}

export const CurriculumBrowser: React.FC<CurriculumBrowserProps> = ({
  currentGrade,
  selectedUnitNumber,
  onSelectUnit,
  cards,
  onOpenScanForUnit,
}) => {
  const units: UnitInfo[] = CURRICULUM_UNITS[currentGrade] || [];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              Khung Chương Trình Global Success THCS (Lớp {currentGrade})
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Chuẩn hóa 12 Unit theo sách giáo khoa tiếng Anh mới nhất của Bộ Giáo dục & Đào tạo. Tích hợp từ vựng trọng điểm, cấu trúc ngữ pháp và chủ đề bài thi.
          </p>
        </div>

        {selectedUnitNumber && (
          <button
            onClick={() => onSelectUnit(null)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold border border-slate-700 self-start"
          >
            Hiển thị tất cả các Unit
          </button>
        )}
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit) => {
          const isSelected = selectedUnitNumber === unit.number;
          const unitCardsCount = cards.filter(
            (c) => c.grade === currentGrade && c.unitNumber === unit.number
          ).length;

          return (
            <div
              key={unit.number}
              onClick={() => onSelectUnit(isSelected ? null : unit.number)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/50 scale-[1.01]'
                  : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                  UNIT {unit.number}
                </span>

                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  {unitCardsCount} từ vựng
                </span>
              </div>

              <h3 className="text-base font-extrabold text-white group-hover:text-indigo-200 transition-colors">
                {unit.title}
              </h3>
              <p className="text-xs text-slate-400 mb-3 font-medium">
                {unit.vietnameseTitle}
              </p>

              <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 mb-3">
                <div>
                  <span className="font-bold text-indigo-400">Từ vựng:</span>{' '}
                  <span className="text-slate-300">{unit.vocabularyFocus}</span>
                </div>
                <div>
                  <span className="font-bold text-pink-400">Ngữ pháp:</span>{' '}
                  <span className="text-slate-300">{unit.grammarFocus}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  {isSelected ? 'Đang lọc Unit này' : 'Lọc thẻ từ vựng'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenScanForUnit(`Grade ${currentGrade} - Unit ${unit.number}: ${unit.title}`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1"
                  title="Quét thêm từ vựng cho Unit này với AI"
                >
                  <Sparkles className="w-3 h-3" />
                  Quét thêm
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
