import React, { useState } from 'react';
import { Grade, VocabCard } from '../types';
import { SAMPLE_TEXTBOOK_EXTRACTS } from '../data/curriculum';
import {
  X,
  Scan,
  Upload,
  FileText,
  Sparkles,
  Camera,
  CheckCircle2,
  Loader2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface SmartScanModalProps {
  currentGrade: Grade;
  onClose: () => void;
  onAddCards: (cards: VocabCard[]) => void;
}

export const SmartScanModal: React.FC<SmartScanModalProps> = ({
  currentGrade,
  onClose,
  onAddCards,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'samples'>('samples');
  const [inputText, setInputText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [unitTopic, setUnitTopic] = useState<string>('Global Success Tiếng Anh THCS');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedResults, setScannedResults] = useState<any[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof SAMPLE_TEXTBOOK_EXTRACTS[0]) => {
    setInputText(sample.snippet);
    setUnitTopic(sample.unit);
    setActiveTab('text');
  };

  const handleExecuteScan = async () => {
    if (!inputText && !selectedImage) {
      setErrorMessage('Vui lòng chọn trích đoạn mẫu, nhập nội dung bài đọc hoặc tải ảnh trang sách giáo khoa.');
      return;
    }

    setIsScanning(true);
    setErrorMessage(null);
    setScannedResults(null);

    try {
      const response = await fetch('/api/scan-vocab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          imageBase64: selectedImage,
          grade: currentGrade,
          unitTopic,
        }),
      });

      const data = await response.json();
      if (data.success && data.vocabulary) {
        setScannedResults(data.vocabulary);
      } else {
        setErrorMessage(data.error || 'Không trích xuất được từ vựng. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi mạng khi gọi Gemini Smart Scan.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleImportToLibrary = () => {
    if (!scannedResults) return;

    const newCards: VocabCard[] = scannedResults.map((item, index) => ({
      id: `scan-${Date.now()}-${index}`,
      word: item.word,
      partOfSpeech: item.partOfSpeech || 'noun',
      ipa: item.ipa || '/.../',
      meaning: item.meaning || '',
      grade: currentGrade,
      unitNumber: 1,
      unitTopic: unitTopic,
      globalSuccessContext: item.globalSuccessContext || `Grade ${currentGrade} - ${unitTopic}`,
      arPrompt: item.arPrompt || 'Mô hình 3D holographic tương tác',
      popCultureExample: item.popCultureExample || '',
      popCultureSource: item.popCultureSource || 'Pop Culture',
      mnemonicHint: item.mnemonicHint || 'Liên tưởng âm thanh tương tự',
      mindMapLinks: item.mindMapLinks || ['word family', 'synonym', 'collocation'],
      difficultyLevel: item.difficultyLevel || 3,
      commonMistake: item.commonMistake,
      masteryLevel: 25,
      stars: 2,
      repetitionCount: 1,
      nextReviewTimestamp: Date.now() + 1000 * 60 * 30, // 30 minutes
      retentionRate: 40,
    }));

    onAddCards(newCards);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950/60 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/80 border-b border-emerald-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scan className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Smart Scan AI Sách Giáo Khoa Global Success
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  LỚP {currentGrade}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tự động nhận diện từ khóa, tạo mô hình AR, phiên âm IPA & câu trích dẫn trendy
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

        {/* Mode Tabs */}
        <div className="flex items-center px-6 pt-4 gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('samples')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'samples'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Trích đoạn SGK mẫu
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'text'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Dán văn bản bài học
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'image'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Quét ảnh trang sách (OCR)
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'samples' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-medium">
                Chọn một trích đoạn bài tập/hội thoại từ sách giáo khoa Global Success THCS để AI Architect phân tích:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_TEXTBOOK_EXTRACTS.map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSample(sample)}
                    className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-emerald-500/40 cursor-pointer transition-all hover:scale-[1.01] group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-emerald-400">
                        {sample.unit}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                        Lớp {sample.grade}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-3 italic">
                      "{sample.snippet}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chủ đề bài học (Unit Topic):
                </label>
                <input
                  type="text"
                  value={unitTopic}
                  onChange={(e) => setUnitTopic(e.target.value)}
                  placeholder="Ví dụ: Unit 3: Community Service"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Đoạn văn bản hoặc danh sách từ cần bóc tách:
                </label>
                <textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Dán đoạn hội thoại, bài đọc Reading, hoặc câu hỏi trong sách giáo khoa vào đây..."
                  className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="space-y-3 text-center">
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-6 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="textbook-image-upload"
                />
                <label
                  htmlFor="textbook-image-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white">
                    Tải lên ảnh chụp sách giáo khoa hoặc vở ghi
                  </span>
                  <span className="text-[11px] text-slate-400">
                    PNG, JPG, WEBP (Tối đa 10MB)
                  </span>
                </label>
              </div>

              {selectedImage && (
                <div className="relative inline-block mt-2 rounded-xl overflow-hidden border border-emerald-500/40 max-h-40">
                  <img
                    src={selectedImage}
                    alt="Textbook preview"
                    className="max-h-40 object-cover rounded-xl"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/90 text-emerald-400 text-[10px] font-mono">
                    READY FOR OCR
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleExecuteScan}
              disabled={isScanning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Architect đang quét & trích xuất AR Prompt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bắt đầu Smart Scan với Gemini</span>
                </>
              )}
            </button>
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              {errorMessage}
            </p>
          )}

          {/* Scan Results Preview */}
          {scannedResults && scannedResults.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã bóc tách thành công {scannedResults.length} thẻ từ vựng:
                </span>
                <button
                  onClick={handleImportToLibrary}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1"
                >
                  Thêm tất cả vào Thư viện học
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {scannedResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">
                          {item.word}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {item.ipa}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                          {item.partOfSpeech}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-300">
                        {item.meaning}
                      </span>
                    </div>

                    <div className="text-[11px] text-cyan-300/90 bg-cyan-950/30 p-2 rounded-lg border border-cyan-500/20">
                      <span className="font-bold text-cyan-400">AR Prompt:</span> "{item.arPrompt}"
                    </div>

                    <div className="text-[11px] text-pink-300/90 italic">
                      <span className="font-semibold text-pink-400">Pop-culture:</span> "{item.popCultureExample}" — <span className="font-bold">{item.popCultureSource}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
