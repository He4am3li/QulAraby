
import React from 'react';
import { RefreshCw, Check, X, RotateCcw, BrainCircuit, Star } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { Vocabulary, MasteryLevel } from '../types';
import { isDueForReview, updateSRS } from '../utils/srs';

export const Flashcards: React.FC = () => {
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );
  const [sessionQueue, setSessionQueue] = React.useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);

  React.useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    const saved = JSON.parse(localStorage.getItem('hub_vocab') || '[]');
    const due = saved.filter(v => isDueForReview(v)).sort(() => Math.random() - 0.5);
    setSessionQueue(due);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  const STRINGS = {
    ar: { title: 'مراجعة البطاقات', subtitle: 'تثبيت المفردات في الذاكرة' },
    en: { title: 'Flashcards', subtitle: 'Memorize your vocabulary' }
  };
  const t = STRINGS[lang];

  const handleReview = (difficulty: 'easy' | 'medium' | 'hard') => {
    const currentWord = sessionQueue[currentIndex];
    const updatedWord = updateSRS(currentWord, difficulty);

    // Update localStorage
    const saved = JSON.parse(localStorage.getItem('hub_vocab') || '[]');
    const newSaved = saved.map((v: Vocabulary) => v.id === updatedWord.id ? updatedWord : v);
    localStorage.setItem('hub_vocab', JSON.stringify(newSaved));

    if (currentIndex < sessionQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setCompleted(true);
    }
  };

  if (sessionQueue.length === 0 && !completed) {
    return (
      <div className={`max-w-full mx-auto flex flex-col h-full bg-white shadow-[0_15px_50px_rgba(0,0,0,0.08)] rounded-[1.5rem] overflow-hidden border border-slate-100 animate-in fade-in duration-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <PageHeader
          title={t.title}
          icon={BrainCircuit}
          lang={lang}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50/30">
          <div className="inline-block p-6 bg-emerald-50 rounded-full mb-6">
            <Check size={64} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">All caught up!</h2>
          <p className="text-slate-500 mt-2">No words due for review today. Great job!</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className={`max-w-full mx-auto flex flex-col h-full bg-white shadow-[0_15px_50px_rgba(0,0,0,0.08)] rounded-[1.5rem] overflow-hidden border border-slate-100 animate-in fade-in duration-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <PageHeader
          title={t.title}
          icon={BrainCircuit}
          lang={lang}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50/30">
          <div className="inline-block p-6 bg-amber-50 rounded-full mb-6">
            <Star size={64} className="text-amber-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Session Complete!</h2>
          <p className="text-slate-500 mt-2">You've reviewed {sessionQueue.length} words.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
          >
            Finish Session
          </button>
        </div>
      </div>
    );
  }

  const word = sessionQueue[currentIndex];
  const progress = ((currentIndex) / sessionQueue.length) * 100;

  return (
    <div className={`max-w-full mx-auto flex flex-col h-full bg-white shadow-[0_15px_50px_rgba(0,0,0,0.08)] rounded-[1.5rem] overflow-hidden border border-slate-100 animate-in fade-in duration-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <PageHeader
        title={t.title}
        icon={BrainCircuit}
        lang={lang}
      />

      <div className="flex-1 flex flex-col p-8 space-y-8 bg-slate-50/30 overflow-y-auto custom-scroll">
        <div className="max-w-2xl mx-auto w-full flex flex-col space-y-8">
          <div className="flex justify-between items-center px-4 shrink-0">
            <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Review Session</h3>
            <span className="text-xs font-bold text-emerald-600">{currentIndex + 1} / {sessionQueue.length}</span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shrink-0">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>

          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative perspective-[1000px] flex-1 cursor-pointer group min-h-[400px]"
          >
            <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className="absolute w-full h-full backface-hidden bg-white rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center p-12 text-center">
                <span className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest">Question</span>
                <h2 className={`text-5xl font-bold ${word.is_english_to_arabic ? 'text-slate-800' : 'arabic-font text-emerald-700'}`}>
                  {word.original_word}
                </h2>
                <div className="mt-auto flex items-center gap-2 text-slate-300 group-hover:text-emerald-500 transition-colors">
                  <RefreshCw size={20} className="animate-spin-slow" />
                  <span className="text-sm font-medium">Click to flip</span>
                </div>
              </div>

              {/* Back */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-emerald-900 rounded-[3rem] shadow-xl flex flex-col items-center justify-center p-12 text-center text-white">
                <span className="text-xs font-bold text-emerald-400 mb-6 uppercase tracking-widest">Meaning</span>
                <h2 className={`text-4xl font-bold ${!word.is_english_to_arabic ? 'text-white' : 'arabic-font text-white'}`}>
                  {word.translation}
                </h2>
                <div className="mt-8 space-y-4 max-w-sm">
                  <p className="text-emerald-100 text-sm italic">
                    "{word.is_english_to_arabic ? word.analysis.details_ar.example : word.analysis.details_en.example}"
                  </p>
                  <p className="text-emerald-400 text-xs opacity-75">
                    {word.is_english_to_arabic ? word.analysis.details_en.example : word.analysis.details_ar.example}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isFlipped && (
            <div className="flex gap-4 animate-in slide-in-from-top-4 shrink-0 pb-4">
              <DifficultyBtn label="Hard" color="bg-red-50 text-red-600 hover:bg-red-100" icon={<X size={18} />} onClick={() => handleReview('hard')} />
              <DifficultyBtn label="Medium" color="bg-blue-50 text-blue-600 hover:bg-blue-100" icon={<RotateCcw size={18} />} onClick={() => handleReview('medium')} />
              <DifficultyBtn label="Easy" color="bg-emerald-50 text-emerald-600 hover:bg-emerald-100" icon={<Check size={18} />} onClick={() => handleReview('easy')} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DifficultyBtn: React.FC<{ label: string, color: string, icon: React.ReactNode, onClick: () => void }> = ({ label, color, icon, onClick }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`flex-1 flex flex-col items-center gap-2 p-6 rounded-3xl font-bold transition-all transform hover:scale-105 ${color}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
