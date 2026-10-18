
import React from 'react';
import { Trophy, HelpCircle, ArrowRight, Zap } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { Vocabulary } from '../types';

export const Quiz: React.FC = () => {
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );
  const [vocab, setVocab] = React.useState<Vocabulary[]>([]);
  const [quizStarted, setQuizStarted] = React.useState(false);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [options, setOptions] = React.useState<string[]>([]);
  const [score, setScore] = React.useState(0);
  const [isFinished, setIsFinished] = React.useState(false);

  React.useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    const saved = JSON.parse(localStorage.getItem('hub_vocab') || '[]');
    setVocab(saved);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  const STRINGS = {
    ar: { title: 'تحدي الإتقان', subtitle: 'اختبر ذاكرتك في المفردات' },
    en: { title: 'Mastery Quiz', subtitle: 'Test your vocabulary memory' }
  };
  const t = STRINGS[lang];

  const startQuiz = () => {
    if (vocab.length < 4) {
      alert("Add at least 4 words to start a quiz!");
      return;
    }
    setQuizStarted(true);
    generateQuestion(0);
  };

  const generateQuestion = (index: number) => {
    const correct = vocab[index].translation;
    const others = vocab
      .filter(v => v.id !== vocab[index].id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(v => v.translation);
    
    setOptions([...others, correct].sort(() => Math.random() - 0.5));
  };

  const handleAnswer = (option: string) => {
    if (option === vocab[currentQuestion].translation) {
      setScore(prev => prev + 1);
    }

    if (currentQuestion < Math.min(vocab.length, 10) - 1) {
      const next = currentQuestion + 1;
      setCurrentQuestion(next);
      generateQuestion(next);
    } else {
      setIsFinished(true);
    }
  };

  if (!quizStarted) {
    return (
      <div className={`max-w-full mx-auto flex flex-col h-full bg-white shadow-[0_15px_50px_rgba(0,0,0,0.08)] rounded-[1.5rem] overflow-hidden border border-slate-100 animate-in fade-in duration-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <PageHeader
          title={t.title}
          icon={Zap}
          lang={lang}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50/30 text-center space-y-8">
          <div className="inline-block p-8 bg-emerald-50 rounded-[2.5rem] shadow-sm">
            <HelpCircle size={80} className="text-emerald-500" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-800">Mastery Quiz</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Test your memory and level up your Arabic. We'll pick 10 random words from your vocabulary.
          </p>
          <button
            onClick={startQuiz}
            className="bg-emerald-600 text-white px-12 py-4 rounded-3xl font-bold text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all hover:scale-105 flex items-center gap-2 mx-auto"
          >
            Start Challenge <Zap size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const total = Math.min(vocab.length, 10);
    return (
      <div className={`max-w-full mx-auto flex flex-col h-full bg-white shadow-[0_15px_50px_rgba(0,0,0,0.08)] rounded-[1.5rem] overflow-hidden border border-slate-100 animate-in fade-in duration-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <PageHeader
          title={t.title}
          icon={Zap}
          lang={lang}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50/30 text-center">
          <div className="inline-block p-8 bg-amber-50 rounded-[2.5rem] mb-6 shadow-sm">
            <Trophy size={80} className="text-amber-500" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-800">Great Job!</h2>
          <p className="text-2xl font-bold text-emerald-600 mt-2">Score: {score} / {total}</p>
          <p className="text-slate-500 mt-4">You're making incredible progress. Keep it up!</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-10 px-10 py-4 bg-slate-800 text-white rounded-3xl font-bold hover:bg-slate-900 transition-all"
          >
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-full mx-auto flex flex-col h-full bg-white shadow-[0_15px_50px_rgba(0,0,0,0.08)] rounded-[1.5rem] overflow-hidden border border-slate-100 animate-in fade-in duration-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <PageHeader
        title={t.title}
        icon={Zap}
        lang={lang}
      />

      <div className="flex-1 flex flex-col p-8 space-y-8 bg-slate-50/30 overflow-y-auto custom-scroll">
        <div className="max-w-5xl mx-auto w-full flex flex-col space-y-8">
          <div className="flex justify-between items-center px-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                {currentQuestion + 1}
              </div>
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Question</span>
            </div>
            <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-sm font-bold">
              Score: {score}
            </div>
          </div>

          <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center flex-1 flex flex-col justify-center min-h-[300px]">
            <p className="text-slate-400 text-sm font-medium mb-4">What is the translation of:</p>
            <h3 className={`text-5xl font-bold ${vocab[currentQuestion].is_english_to_arabic ? 'text-slate-800' : 'arabic-font text-emerald-700'}`}>
              {vocab[currentQuestion].original_word}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0 pb-4">
            {options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                className="group flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
              >
                <span className={`text-xl font-bold ${!vocab[currentQuestion].is_english_to_arabic ? '' : 'arabic-font'}`}>
                  {option}
                </span>
                <ArrowRight size={20} className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
