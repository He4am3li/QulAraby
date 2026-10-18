import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scissors, Plus, Volume2, Sparkles, Check } from 'lucide-react';
import { analyzeArabicWord, speakArabic } from './ArabicLinguisticData';

interface WordSlicerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCard: (element: any) => void;
}

const PRESET_WORDS = ['مَدْرَسَة', 'كِتَابٌ', 'اسْتِخْرَاج', 'مُعَلِّمُونَ', 'يَتَكَلَّمُ', 'سَيَّارَة'];

export const WordSlicerModal: React.FC<WordSlicerModalProps> = ({
  isOpen,
  onClose,
  onInsertCard,
}) => {
  const [word, setWord] = useState('مَدْرَسَة');
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = (targetWord: string) => {
    setWord(targetWord);
    const result = analyzeArabicWord(targetWord);
    setAnalysis(result);
  };

  React.useEffect(() => {
    if (isOpen) {
      handleAnalyze(word);
    }
  }, [isOpen]);

  const handleInsert = () => {
    if (!analysis) return;
    onInsertCard({
      type: 'text',
      text: `${word}\nالجذر: ${analysis.root || '-'}\nالوزن: ${analysis.wazn || '-'}\nالنوع: ${analysis.type || '-'}`,
      x: 200,
      y: 200,
      fontSize: 22,
      color: '#1e293b',
      slicerData: {
        word,
        letters: word.split(''),
        root: analysis.root,
        wazn: analysis.wazn,
        type: analysis.type,
      }
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl text-white flex flex-col gap-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Scissors size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg arabic-font">مُشرِّح الكلمات والجذور</h3>
                <p className="text-xs text-slate-400">تحليل الحروف والمقاطع والوزن الصرفي</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition">
              <X size={18} />
            </button>
          </div>

          {/* Word Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-bold">الكلمة المراد تشريحها:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="اكتب كلمة عربية..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-bold text-white arabic-font focus:outline-none focus:border-amber-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(word)}
              />
              <button
                onClick={() => handleAnalyze(word)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl transition text-sm flex items-center gap-1.5"
              >
                <span>تشريح</span>
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {PRESET_WORDS.map((w) => (
                <button
                  key={w}
                  onClick={() => handleAnalyze(w)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition font-medium arabic-font ${
                    word === w ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Result */}
          {analysis && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              {/* Syllables / Slices */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">المقاطع والحروف:</span>
                <button
                  onClick={() => speakArabic(word)}
                  className="p-1 hover:bg-slate-800 text-amber-400 rounded-lg transition"
                  title="نطق الكلمة"
                >
                  <Volume2 size={16} />
                </button>
              </div>

              <div className="flex gap-2 justify-center py-2 overflow-x-auto">
                {word.split('').map((char, index) => (
                  <div
                    key={index}
                    className="w-12 h-14 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-500/30 flex flex-col items-center justify-center shadow-lg"
                  >
                    <span className="text-xl font-bold text-amber-300 arabic-font">{char}</span>
                    <span className="text-[9px] text-slate-500 mt-1">{index + 1}</span>
                  </div>
                ))}
              </div>

              {/* Morphology details */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">الجذر الثلاثي</span>
                  <span className="text-sm font-bold text-emerald-400 arabic-font">{analysis.root || 'ـ'}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">الوزن الصرفي</span>
                  <span className="text-sm font-bold text-sky-400 arabic-font">{analysis.wazn || 'ـ'}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">نوع الكلمة</span>
                  <span className="text-sm font-bold text-amber-400 arabic-font">{analysis.type || 'اسم'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              إلغاء
            </button>
            <button
              onClick={handleInsert}
              disabled={!analysis}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-lg"
            >
              <Plus size={14} />
              <span>إدراج في السبورة</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
