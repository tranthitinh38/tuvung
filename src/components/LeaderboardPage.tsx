import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Trophy, Award, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  streak: number;
  avatar: string;
  className: string;
}

const TOP_STUDENTS: LeaderboardUser[] = [
  { id: '1', name: 'Nguyễn Văn Minh', xp: 4850, streak: 14, avatar: '👦', className: 'Lớp 8A' },
  { id: '2', name: 'Trần Bảo Ngọc', xp: 4420, streak: 21, avatar: '👧', className: 'Lớp 8B' },
  { id: '3', name: 'Lê Hoàng Long', xp: 3910, streak: 9, avatar: '🧑', className: 'Lớp 8A' },
  { id: '4', name: 'Phạm Quỳnh Anh', xp: 3750, streak: 12, avatar: '👩', className: 'Lớp 8C' },
  { id: '5', name: 'Đỗ Gia Huy', xp: 3400, streak: 7, avatar: '👦', className: 'Lớp 8B' },
];

export const LeaderboardPage: React.FC = () => {
  const { t } = useTranslation();

  const chartData = {
    labels: TOP_STUDENTS.map((s) => s.name),
    datasets: [
      {
        label: 'XP (Điểm kinh nghiệm)',
        data: TOP_STUDENTS.map((s) => s.xp),
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
        ],
        borderColor: [
          'rgb(245, 158, 11)',
          'rgb(168, 85, 247)',
          'rgb(59, 130, 246)',
          'rgb(236, 72, 153)',
          'rgb(20, 184, 166)',
        ],
        borderWidth: 2,
        borderRadius: 12,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top XP Champions',
        color: '#f8fafc',
        font: { size: 16, weight: 'bold' as const },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' },
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        ticks: { color: '#94a3b8' },
      },
    },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm tracking-wide">
            <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
            VOCABWORLD LEADERBOARD
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t('topStudents')}
          </h1>
          <p className="text-sm text-slate-300">
            Cập nhật thời gian thực theo thành tích học tập, ôn tập từ vựng & đấu trường PvP AI.
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Leaderboard List Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 font-bold text-white text-lg flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Bảng Vàng Xếp Hạng Toàn Quốc
        </div>
        <div className="divide-y divide-slate-800/80">
          {TOP_STUDENTS.map((student, index) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base shadow-lg ${
                    index === 0
                      ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                      : index === 1
                      ? 'bg-slate-300 text-slate-950 shadow-slate-300/30'
                      : index === 2
                      ? 'bg-amber-700 text-white shadow-amber-700/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  #{index + 1}
                </div>
                <div className="text-2xl">{student.avatar}</div>
                <div>
                  <h4 className="font-extrabold text-white text-base sm:text-lg">
                    {student.name}
                  </h4>
                  <span className="text-xs text-indigo-400 font-mono font-semibold">
                    {student.className}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 text-pink-400 font-bold text-sm">
                  <Flame className="w-4 h-4" />
                  <span>{student.streak} ngày</span>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-black text-sm sm:text-base">
                  {student.xp.toLocaleString()} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
