import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'VOCABWORLD AI',
      dashboard: 'Dashboard',
      leaderboard: 'Leaderboard',
      pvpArena: 'PvP Arena',
      settings: 'Settings',
      logout: 'Logout',
      welcome: 'Welcome back',
      xp: 'XP',
      streak: 'Streak',
      mastery: 'Mastery',
      reviewNow: 'Review Now',
      arView: '3D AR View',
      aiPronunciation: 'AI Pronunciation',
      mindMap: 'Mind-Map',
      darkTheme: 'Dark Theme',
      exportBackup: 'Export Backup (JSON)',
      importBackup: 'Import Backup (JSON)',
      topStudents: 'Top Students Leaderboard',
    },
  },
  vi: {
    translation: {
      appName: 'VOCABWORLD AI',
      dashboard: 'Bảng Điều Khiển',
      leaderboard: 'Bảng Xếp Hạng',
      pvpArena: 'Đấu Trường PvP',
      settings: 'Cài Đặt',
      logout: 'Đăng Xuất',
      welcome: 'Chào mừng trở lại',
      xp: 'Điểm XP',
      streak: 'Chuỗi Ngày',
      mastery: 'Độ Thành Thạo',
      reviewNow: 'Ôn Tập Ngay',
      arView: 'Xem 3D AR',
      aiPronunciation: 'Phát Âm AI',
      mindMap: 'Sơ Đồ Tư Duy',
      darkTheme: 'Chế Độ Tối',
      exportBackup: 'Xuất Sao Lưu (JSON)',
      importBackup: 'Nhập Sao Lưu (JSON)',
      topStudents: 'Bảng Xếp Hạng Học Sinh Xuất Sắc',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('vocabworld_lang') || 'vi',
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
