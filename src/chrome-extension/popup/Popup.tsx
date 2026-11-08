import React, { useState } from 'react';
import { BookOpen, Search, Sparkles, CheckCircle2 } from 'lucide-react';

export const Popup: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = () => {
    if (!query.trim()) return;
    setLoading(true);
    // Trigger content script action / mock AI lookup
    setTimeout(() => {
      setResult(`AI Definition for "${query}": Advanced vocabulary item with interactive flashcard support.`);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="w-80 bg-slate-900 text-slate-100 p-4 font-sans shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white">VOCABWORLD AI</h1>
            <p className="text-xs text-slate-400">Smart Vocabulary Assistant</p>
          </div>
        </div>
        <BookOpen className="w-5 h-5 text-indigo-400" />
      </div>

      {/* Search & Lookup Section */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            placeholder="Search word or phrase..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <button
          onClick={handleLookup}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span className="animate-pulse">Searching AI...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Instant AI Lookup</span>
            </>
          )}
        </button>

        {/* Result Display */}
        {result && (
          <div className="mt-3 p-3 bg-slate-800 border border-indigo-500/30 rounded-lg text-xs space-y-1">
            <div className="flex items-center space-x-1 text-indigo-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lookup Result</span>
            </div>
            <p className="text-slate-300">{result}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 text-center text-[10px] text-slate-500">
        VOCABWORLD AI Extension v1.0.0
      </div>
    </div>
  );
};

export default Popup;
