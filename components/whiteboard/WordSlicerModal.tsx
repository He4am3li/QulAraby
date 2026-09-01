import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scissors, Sparkles, Volume2, Plus, RefreshCw, Layers } from 'lucide-react';
import { WhiteboardElement } from '../../types/whiteboard';

interface WordSlicerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCard: (element: WhiteboardElement) => void;
}

interface SlicedWordSample {
  word: string;
  syllables: string[];
  root: string;
  wazn: string;
  meaning: string;
  analysis: string;
}

const PRESET_WORDS: SlicedWordSample[] = [
  {
    word: 'مَسْجِدٌ',
    syllables: ['مَسْـ', 'ـجِـ', 'ـدٌ'],
    root: 'س - ج - د',
    wazn: 'مَفْعِل',
    meaning: 'Place of worship / Mosque',
    analysis: 'اسم مكان مشتق من الفعل الثلاثي (سَجَدَ)'
  },
  {
    word: 'مُسْتَشْفَى',
    syllables: ['مُسْـ', 'ـتَشْـ', 'ـفَى'],
    root: 'ش - ف - ي',
    wazn: 'مُسْتَفْعَل',
    meaning: 'Hospital',
    analysis: 'اسم مكان مشتق من الفعل السداسي (اسْتَشْفَى)'
  },
  {
    word: 'مَدْرَسَةٌ',
    syllables: ['مَدْ', 'رَ', 'سَ', 'ةٌ'],
    root: 'د - ر - س',
    wazn: 'مَفْعَلَة',
    meaning: 'School',
    analysis: 'اسم مكان مشتق من الفعل (دَرَسَ)'
  },
  {
    word: 'مُعَلِّمُونَ',
    syllables: ['مُـ', 'ـعَلْـ', 'ـلِـ', 'ـمُو', 'نَ'],
    root: 'ع - ل - م',
    wazn: 'مُفَعِّلُونَ',
    meaning: 'Teachers (Plural)',
    analysis: 'جمع مذكر سالم مشتق من اسم الفاعل (مُعَلِّم)'
  },
  {
    word: 'اسْتِقْبَالٌ',
    syllables: ['اِسْـ', 'ـتِقْـ', 'ـبَا', 'لٌ'],
    root: 'ق - ب - ل',
    wazn: 'اِسْتِفْعَال',
    meaning: 'Reception / Welcoming',
    analysis: 'مصدر صريح للفعل السداسي (اسْتَقْبَلَ)'
  },
  {
    word: 'كِتَابٌ',
    syllables: ['كِـ', 'ـتَا', 'بٌ'],
    root: 'ك - ت - ب',
    wazn: 'فِعَال',
    meaning: 'Book',
    analysis: 'اسم مشتق من الجذر (ك - ت - ب)'
  },
  {
    word: 'مَكْتَبَةٌ',
    syllables: ['مَكْـ', 'ـتَـ', 'ـبَـ', 'ـةٌ'],
    root: 'ك - ت - ب',
    wazn: 'مَفْعَلَة',
    meaning: 'Library / Bookstore',
    analysis: 'اسم مكان على وزن مَفْعَلَة'
  }
];

export const WordSlicerModal: React.FC<WordSlicerModalProps> = ({
  isOpen,
  onClose,
  onInsertCard
}) => {
  const [selectedWord, setSelectedWord] = useState<SlicedWordSample>(PRESET_WORDS[0]);
  const [customWord, setCustomWord] = useState('');
  const [customRoot, setCustomRoot] = useState('');
  const [customWazn, setCustomWazn] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  if (!isOpen) return null;

  const speakArabic = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCustomSubmit = () => {
    if (!customWord.trim()) return;
    const parts = customWord.includes('-')
      ? customWord.split('-').map(s => s.trim())
      : customWord.split('').filter(c => c.trim());

    const newSample: SlicedWordSample = {
      word: customWord.replace(/-/g, ''),
      syllables: parts,
      root: customRoot || 'غير محدد',
      wazn: customWazn || 'غير محدد',
      meaning: 'كلمة مخصصة من المعلم',
      analysis: 'تحليل مقطعي وصرفي مخصص'
    };
    setSelectedWord(newSample);
    setIsCustomMode(false);
  };

  const handleInsert = () => {
    const newElement: WhiteboardElement = {
      id: `slicer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: 'word_slicer_card',
      x: 180 + Math.random() * 60,
      y: 130 + Math.random() * 60,
      color: '#0284c7',
      strokeWidth: 2,
      cardData: {
        word: selectedWord.word,
        syllables: selectedWord.syllables,
        root: selectedWord.root,
        wazn: selectedWord.wazn,
        meaning: selectedWord.meaning,
        translation: selectedWord.analysis
      }
    };
    onInsertCard(newElement);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 w-full max-w-2xl shadow-2xl text-slate-800 relative overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200/60 shadow-sm">
                <Scissors size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 arabic-font flex items-center gap-2">
                  مجزّئ ومحلل الكلمات والجذور ✂️
                </h3>
                <p className="text-xs text-slate-500 font-medium">تقطيع الكلمة إلى مقاطع صوتية واستخراج الجذر الثلاثي والوزن</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Preset Words Selector */}
          <div className="mb-5">
            <div className="text-xs font-bold text-slate-600 mb-2 flex items-center justify-between">
              <span>اختر كلمة نموذجية للتحليل:</span>
              <button
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-xs text-sky-600 hover:text-sky-700 font-bold transition flex items-center gap-1"
              >
                <Plus size={14} />
                {isCustomMode ? 'العودة للنماذج' : 'إدخال كلمة مخصصة'}
              </button>
            </div>

            {!isCustomMode ? (
              <div className="flex flex-wrap gap-2">
                {PRESET_WORDS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedWord(item)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-black arabic-font transition border ${
                      selectedWord.word === item.word
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                    }`}
                  >
                    {item.word}
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 font-bold block mb-1">الكلمة مع التشكيل:</label>
                    <input
                      type="text"
                      value={customWord}
                      onChange={(e) => setCustomWord(e.target.value)}
                      placeholder="مثال: مُسْتَقْبَلٌ أو مُسْ-تَقْ-بَ-لٌ"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 arabic-font focus:outline-none focus:border-sky-500 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 font-bold block mb-1">الجذر الثلاثي (اختياري):</label>
                    <input
                      type="text"
                      value={customRoot}
                      onChange={(e) => setCustomRoot(e.target.value)}
                      placeholder="مثال: ق - ب - ل"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 arabic-font focus:outline-none focus:border-sky-500 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 font-bold block mb-1">الوزن الصرفي (اختياري):</label>
                    <input
                      type="text"
                      value={customWazn}
                      onChange={(e) => setCustomWazn(e.target.value)}
                      placeholder="مثال: مُسْتَفْعَل"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 arabic-font focus:outline-none focus:border-sky-500 text-sm shadow-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customWord.trim()}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition"
                >
                  اعتماد الكلمة للتحليل
                </button>
              </div>
            )}
          </div>

          {/* Interactive Card Preview */}
          <div className="bg-gradient-to-br from-sky-50/80 via-indigo-50/40 to-slate-50 border border-sky-200/80 rounded-3xl p-5 mb-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-sky-200/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-slate-900 arabic-font">{selectedWord.word}</span>
                <span className="text-xs text-slate-500 font-sans">({selectedWord.meaning})</span>
              </div>
              <button
                onClick={() => speakArabic(selectedWord.word)}
                className="p-2.5 bg-white border border-slate-200 text-sky-600 hover:bg-sky-50 rounded-xl shadow-sm transition"
                title="استماع للنطق الصحيح"
              >
                <Volume2 size={18} />
              </button>
            </div>

            {/* Slices representation */}
            <div className="mb-4">
              <div className="text-xs font-bold text-slate-500 mb-2">المقاطع الصوتية التفاعلية:</div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedWord.syllables.map((s, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => speakArabic(s)}
                    className="px-4 py-2.5 bg-white border-2 border-sky-400 hover:border-sky-600 rounded-2xl text-sky-700 font-black text-xl arabic-font shadow-sm transition flex items-center gap-1.5"
                  >
                    <span>{s}</span>
                    <Volume2 size={12} className="opacity-60" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Root & Wazn */}
            <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border border-sky-100 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">جذر</span>
                <div>
                  <div className="text-[11px] text-slate-400 font-bold">الجذر اللغوي:</div>
                  <div className="text-sm font-black text-emerald-700 arabic-font">{selectedWord.root}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">وزن</span>
                <div>
                  <div className="text-[11px] text-slate-400 font-bold">الوزن الصرفي:</div>
                  <div className="text-sm font-black text-amber-700 arabic-font">{selectedWord.wazn}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleInsert}
              className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-black arabic-font flex items-center justify-center gap-2 shadow-md transition"
            >
              <Plus size={18} />
              إدراج بطاقة التحليل الصوتي والصرفي للسبورة
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition text-xs"
            >
              إلغاء
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
