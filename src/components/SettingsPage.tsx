import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Moon, Sun, Download, Upload, Shield } from 'lucide-react';

interface SettingsPageProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ darkMode, setDarkMode }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('vocabworld_lang', nextLang);
  };

  const handleExportBackup = () => {
    const data = {
      userState: localStorage.getItem('vocabworld_user') || '{}',
      progress: localStorage.getItem('vocabworld_progress') || '{}',
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocabworld-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.userState) localStorage.setItem('vocabworld_user', json.userState);
        if (json.progress) localStorage.setItem('vocabworld_progress', json.progress);
        alert('Khôi phục dữ liệu sao lưu thành công! Hãy tải lại trang.');
        window.location.reload();
      } catch (err) {
        alert('Tệp sao lưu không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">{t('settings')}</h1>
        <p className="text-sm text-slate-400">Tùy chỉnh giao diện, ngôn ngữ và sao lưu dữ liệu học tập.</p>
      </div>

      <div className="grid gap-4">
        {/* Language Switcher */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-indigo-400" />
            <div>
              <h3 className="font-bold text-white text-base">Ngôn ngữ hiển thị (Language)</h3>
              <p className="text-xs text-slate-400">Chuyển đổi giữa Tiếng Việt và Tiếng Anh</p>
            </div>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            {i18n.language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-6 h-6 text-cyan-400" /> : <Sun className="w-6 h-6 text-amber-400" />}
            <div>
              <h3 className="font-bold text-white text-base">{t('darkTheme')}</h3>
              <p className="text-xs text-slate-400">Bật/tắt chế độ tối chuyên nghiệp cho lớp học</p>
            </div>
          </div>
          <button
            onClick={() => {
              setDarkMode(!darkMode);
              localStorage.setItem('vocabworld_dark', String(!darkMode));
            }}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${
              darkMode ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Export / Import Backup */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="font-bold text-white text-base">Sao lưu & Khôi phục dữ liệu</h3>
              <p className="text-xs text-slate-400">Xuất tệp JSON hoặc nhập lịch sử ôn tập</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportBackup}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition-all"
            >
              <Download className="w-4 h-4" />
              {t('exportBackup')}
            </button>
            <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs cursor-pointer transition-all">
              <Upload className="w-4 h-4" />
              {t('importBackup')}
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
