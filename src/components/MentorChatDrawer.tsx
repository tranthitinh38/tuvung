import React, { useState, useRef, useEffect } from 'react';
import { Grade, ChatMessage, VocabCard } from '../types';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  Flame,
  MessageSquare,
  BookOpen,
  Mic,
} from 'lucide-react';

interface MentorChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentGrade: Grade;
  currentCard?: VocabCard | null;
}

export const MentorChatDrawer: React.FC<MentorChatDrawerProps> = ({
  isOpen,
  onClose,
  currentGrade,
  currentCard,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Yo! Chào bạn! Mình là **Global Success AI Vocabulary Architect** – Mentor đồng hành cùng bạn phá đảo tiếng Anh THCS lớp ${currentGrade}! 🔥\n\nBạn cần mẹo ghi nhớ siêu tốc (Mnemonics), giải mã ngữ cảnh phim ảnh Marvel/Taylor Swift, hay kiểm tra phát âm chuẩn không cần chỉnh? Hãy nhắn cho mình ngay nhé!`,
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentWord: currentCard ? currentCard.word : undefined,
          grade: currentGrade,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Oops! Có chút trục trặc kết nối với AI Architect. Bạn thử lại nha!',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-slate-900 border-l border-indigo-500/30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-950/80 border-b border-indigo-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-pink-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              AI Vocabulary Architect
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400">
              Mentor THCS • Song ngữ Anh - Việt Gen Z
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Current Context Pill if a card is selected */}
      {currentCard && (
        <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-500/20 flex items-center justify-between text-xs">
          <span className="text-slate-400">Đang thảo luận từ:</span>
          <span className="font-bold text-pink-400">
            "{currentCard.word}" ({currentCard.ipa})
          </span>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${
              m.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gradient-to-tr from-pink-500 to-purple-600 text-white'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none shadow-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 italic pl-10">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>AI Architect đang suy nghĩ câu trả lời cực trendy...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-2.5 bg-slate-950/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleSendMessage('Cho mình một mẹo ghi nhớ (Mnemonic) thật hài hước để thuộc từ này vĩnh viễn!')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700 font-medium"
        >
          💡 Mẹo Mnemonics
        </button>
        <button
          onClick={() => handleSendMessage('Cho mình câu ví dụ từ bài hát US-UK hoặc phim bom tấn về từ này!')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-pink-300 whitespace-nowrap border border-slate-700 font-medium"
        >
          🎬 Pop-Culture Quote
        </button>
        <button
          onClick={() => handleSendMessage('Phân tích trọng âm và các âm cuối dễ phát âm sai của từ này.')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-300 whitespace-nowrap border border-slate-700 font-medium"
        >
          🎙️ Phân tích phát âm
        </button>
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-950 border-t border-indigo-500/20 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Hỏi AI Architect bất cứ điều gì về Global Success..."
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputText.trim()}
          className="p-2 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 text-white disabled:opacity-40 transition-all hover:scale-105 active:scale-95 shadow-md shadow-pink-600/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
