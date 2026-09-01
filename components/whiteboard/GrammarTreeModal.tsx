import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitFork, CheckCircle2, AlertCircle, Plus, RotateCcw, Volume2, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WhiteboardElement } from '../../types/whiteboard';

interface GrammarTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCard: (element: WhiteboardElement) => void;
}

type GrammarMode = 'parts_of_speech' | 'gender' | 'number';

interface WordItem {
  id: string;
  word: string;
  category: string;
  translation: string;
}

const GAME_MODES: Record<GrammarMode, {
  title: string;
  description: string;
  bins: { id: string; name: string; color: string; bg: string }[];
  words: WordItem[];
}> = {
  parts_of_speech: {
    title: 'أقسام الكلمة (Parts of Speech)',
    description: 'صنّف الكلمات الآتية في صندوقها النحوي المناسب:',
    bins: [
      { id: 'noun', name: 'اسم (Noun)', color: 'border-emerald-300 text-emerald-800', bg: 'bg-emerald-50/80 hover:bg-emerald-100/80' },
      { id: 'verb', name: 'فعل (Verb)', color: 'border-sky-300 text-sky-800', bg: 'bg-sky-50/80 hover:bg-sky-100/80' },
      { id: 'particle', name: 'حرف (Particle)', color: 'border-amber-300 text-amber-800', bg: 'bg-amber-50/80 hover:bg-amber-100/80' }
    ],
    words: [
      { id: 'w1', word: 'كِتَابٌ', category: 'noun', translation: 'Book' },
      { id: 'w2', word: 'يَكْتُبُ', category: 'verb', translation: 'Writes' },
      { id: 'w3', word: 'فِي', category: 'particle', translation: 'In' },
      { id: 'w4', word: 'سَافَرَ', category: 'verb', translation: 'Traveled' },
      { id: 'w5', word: 'شَمْسٌ', category: 'noun', translation: 'Sun' },
      { id: 'w6', word: 'عَلَى', category: 'particle', translation: 'On' },
      { id: 'w7', word: 'مَدْرَسَةٌ', category: 'noun', translation: 'School' },
      { id: 'w8', word: 'مِنْ', category: 'particle', translation: 'From' }
    ]
  },
  gender: {
    title: 'المذكر والمؤنث (Masculine & Feminine)',
    description: 'صنّف الكلمات حسب نوعها اللغوي:',
    bins: [
      { id: 'masculine', name: 'مُذَكَّر (Masculine)', color: 'border-sky-300 text-sky-800', bg: 'bg-sky-50/80 hover:bg-sky-100/80' },
      { id: 'feminine', name: 'مُؤَنَّث (Feminine)', color: 'border-rose-300 text-rose-800', bg: 'bg-rose-50/80 hover:bg-rose-100/80' }
    ],
    words: [
      { id: 'g1', word: 'قَلَمٌ', category: 'masculine', translation: 'Pen' },
      { id: 'g2', word: 'حَدِيقَةٌ', category: 'feminine', translation: 'Garden' },
      { id: 'g3', word: 'طَبِيبٌ', category: 'masculine', translation: 'Doctor' },
      { id: 'g4', word: 'شَجَرَةٌ', category: 'feminine', translation: 'Tree' },
      { id: 'g5', word: 'بَيْتٌ', category: 'masculine', translation: 'House' },
      { id: 'g6', word: 'طَالِبَةٌ', category: 'feminine', translation: 'Female Student' }
    ]
  },
  number: {
    title: 'العدد: المفرد والمثنى والجمع (Number)',
    description: 'صنّف الأسماء حسب صيغتها العددية:',
    bins: [
      { id: 'singular', name: 'مُفْرَد (Singular)', color: 'border-teal-300 text-teal-800', bg: 'bg-teal-50/80 hover:bg-teal-100/80' },
      { id: 'dual', name: 'مُثَنَّى (Dual)', color: 'border-purple-300 text-purple-800', bg: 'bg-purple-50/80 hover:bg-purple-100/80' },
      { id: 'plural', name: 'جَمْع (Plural)', color: 'border-amber-300 text-amber-800', bg: 'bg-amber-50/80 hover:bg-amber-100/80' }
    ],
    words: [
      { id: 'n1', word: 'مُعَلِّمٌ', category: 'singular', translation: 'One teacher' },
      { id: 'n2', word: 'كِتَابَانِ', category: 'dual', translation: 'Two books' },
      { id: 'n3', word: 'مُهَنْدِسُونَ', category: 'plural', translation: 'Engineers' },
      { id: 'n4', word: 'سَيَّارَتَانِ', category: 'dual', translation: 'Two cars' },
      { id: 'n5', word: 'أَبْوَابٌ', category: 'plural', translation: 'Doors' },
      { id: 'n6', word: 'طَالِبٌ', category: 'singular', translation: 'Student' }
    ]
  }
};

export const GrammarTreeModal: React.FC<GrammarTreeModalProps> = ({
  isOpen,
  onClose,
  onInsertCard
}) => {
  const [activeMode, setActiveMode] = useState<GrammarMode>('parts_of_speech');
  const [placedWords, setPlacedWords] = useState<Record<string, string>>({});
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const currentConfig = GAME_MODES[activeMode];
  const unplacedWords = currentConfig.words.filter(w => !placedWords[w.id]);

  const speakArabic = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectWord = (wordId: string) => {
    setActiveWordId(wordId);
    const w = currentConfig.words.find(item => item.id === wordId);
    if (w) speakArabic(w.word);
  };

  const handlePlaceInBin = (binId: string) => {
    if (!activeWordId) return;

    const wordObj = currentConfig.words.find(w => w.id === activeWordId);
    if (!wordObj) return;

    if (wordObj.category === binId) {
      setPlacedWords(prev => ({ ...prev, [activeWordId]: binId }));
      setActiveWordId(null);
      setFeedback({ isCorrect: true, message: `إجابة صحيحة! أحسنت 🎯 (${wordObj.word})` });

      const newPlacedCount = Object.keys(placedWords).length + 1;
      if (newPlacedCount === currentConfig.words.length) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      setFeedback({ isCorrect: false, message: `حاول مرة أخرى! 🤔` });
    }

    setTimeout(() => {
      setFeedback(null);
    }, 2000);
  };

  const handleReset = () => {
    setPlacedWords({});
    setActiveWordId(null);
    setFeedback(null);
  };

  const handleInsertWordToBoard = (wordObj: WordItem) => {
    const newElement: WhiteboardElement = {
      id: `grammar_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: 'grammar_card',
      x: 180 + Math.random() * 80,
      y: 130 + Math.random() * 80,
      color: '#7c3aed',
      strokeWidth: 2,
      cardData: {
        word: wordObj.word,
        translation: wordObj.translation,
        grammarCategory: currentConfig.bins.find(b => b.id === wordObj.category)?.name || wordObj.category
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
          className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 w-full max-w-3xl shadow-2xl text-slate-800 relative overflow-hidden flex flex-col max-h-[88vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60 shadow-sm">
                <GitFork size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 arabic-font flex items-center gap-2">
                  شجرة النحو والتصنيف اللغوي 🌳
                </h3>
                <p className="text-xs text-slate-500 font-medium">نشاط تفاعلي لتدريب الطلاب على تصنيف أقسام الكلمة وأنواعها</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-100/80 p-1.5 rounded-2xl shrink-0">
            {(['parts_of_speech', 'gender', 'number'] as GrammarMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => {
                  setActiveMode(mode);
                  handleReset();
                }}
                className={`py-2 px-2 text-xs sm:text-sm font-bold rounded-xl transition-all arabic-font ${
                  activeMode === mode
                    ? 'bg-white text-purple-700 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {GAME_MODES[mode].title.split('(')[0]}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto custom-scroll space-y-4 pr-1">
            <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
              <span>{currentConfig.description}</span>
              <button
                onClick={handleReset}
                className="text-purple-600 hover:text-purple-700 flex items-center gap-1 font-bold transition"
              >
                <RotateCcw size={13} />
                إعادة ضبط
              </button>
            </div>

            {/* Unplaced Words Tray */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 min-h-[90px] flex flex-wrap items-center gap-2">
              {unplacedWords.length === 0 ? (
                <div className="w-full text-center text-emerald-700 font-black text-sm py-3 flex items-center justify-center gap-2">
                  <Trophy size={18} className="text-amber-500" />
                  رائع جداً! تم تصنيف جميع الكلمات بنجاح 🌟
                </div>
              ) : (
                unplacedWords.map(w => (
                  <motion.div
                    key={w.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectWord(w.id)}
                    className={`px-4 py-2 rounded-2xl border-2 font-black text-base arabic-font cursor-pointer transition shadow-sm flex items-center gap-2 ${
                      activeWordId === w.id
                        ? 'bg-purple-600 border-purple-700 text-white shadow-md scale-105'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-purple-300'
                    }`}
                  >
                    <span>{w.word}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInsertWordToBoard(w);
                      }}
                      className="p-1 hover:bg-black/10 rounded-lg text-xs"
                      title="إدراج كبطاقة للسبورة"
                    >
                      <Plus size={12} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Classification Bins */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentConfig.bins.map(bin => {
                const wordsInBin = currentConfig.words.filter(w => placedWords[w.id] === bin.id);
                return (
                  <div
                    key={bin.id}
                    onClick={() => handlePlaceInBin(bin.id)}
                    className={`p-4 rounded-2xl border-2 border-dashed ${bin.color} ${bin.bg} transition-all flex flex-col justify-between min-h-[140px] cursor-pointer shadow-sm`}
                  >
                    <div className="text-center font-black text-sm arabic-font mb-2">
                      {bin.name}
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center justify-center flex-1">
                      {wordsInBin.map(w => (
                        <span
                          key={w.id}
                          className="px-2.5 py-1 bg-white text-slate-800 font-black rounded-xl text-xs border border-slate-200 shadow-xs arabic-font"
                        >
                          {w.word}
                        </span>
                      ))}
                      {wordsInBin.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">
                          {activeWordId ? 'اضغط هنا لوضع الكلمة' : 'فارغ'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-2xl border text-xs font-bold text-center flex items-center justify-center gap-2 ${
                  feedback.isCorrect
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {feedback.isCorrect ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{feedback.message}</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
