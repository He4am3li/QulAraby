import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Shield, Star, Trophy, ArrowRight, ArrowLeft, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ArabicSpaceJourneyProps {
  onWin: (xp: number) => void;
  onBack: () => void;
}

interface PlanetChallenge {
  id: number;
  planetName: string;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  color: string;
}

const PLANETS: PlanetChallenge[] = [
  {
    id: 1,
    planetName: 'كوكب الكلمة',
    topic: 'أقسام الكلمة',
    question: 'ما نوع كلمة "يَكْتُبُ" من أقسام الكلمة؟',
    options: ['اسم', 'فعل', 'حرف', 'صفة'],
    correct: 1,
    explanation: 'كلمة "يكتب" تدل على حدث مقترن بزمن فهو فعل مضارع.',
    color: 'from-blue-600 to-indigo-900',
  },
  {
    id: 2,
    planetName: 'كوكب الهمزات',
    topic: 'قواعد الإملاء',
    question: 'أي من الكلمات التالية همزتها همزة وصل؟',
    options: ['أَحْمَد', 'إِبْرَاهِيم', 'انْطَلَقَ', 'أَسَد'],
    correct: 2,
    explanation: '"انطلق" فعل ماض خماسي همزته همزة وصل.',
    color: 'from-amber-600 to-red-900',
  },
  {
    id: 3,
    planetName: 'كوكب الجملة',
    topic: 'أنواع الجمل',
    question: 'ما نوع الجملة: "العِلْمُ نُورٌ"؟',
    options: ['جملة اسمية', 'جملة فعلية', 'شبه جملة', 'جملة شرطية'],
    correct: 0,
    explanation: 'تبدأ باسم (العلم) وتتكون من مبتدأ وخبر، فهي جملة اسمية.',
    color: 'from-emerald-600 to-teal-950',
  },
  {
    id: 4,
    planetName: 'كوكب الإعراب',
    topic: 'المبتدأ والخبر',
    question: 'ما حكم المبتدأ الإعرابي دائماً في الأصل؟',
    options: ['المنصوب', 'المجرور', 'المرفوع', 'المجزوم'],
    correct: 2,
    explanation: 'المبتدأ والخبر من مرفوعات الأسماء دائماً.',
    color: 'from-purple-600 to-fuchsia-950',
  },
  {
    id: 5,
    planetName: 'كوكب التراكيب',
    topic: 'حروف الجر',
    question: 'أي مما يلي يُعد من حروف الجر؟',
    options: ['فِي', 'لَنْ', 'كَيْ', 'إنَّ'],
    correct: 0,
    explanation: '"في" من حروف الجر التي تجر الاسم الذي يليها.',
    color: 'from-cyan-600 to-blue-950',
  },
];

export const ArabicSpaceJourney: React.FC<ArabicSpaceJourneyProps> = ({ onWin, onBack }) => {
  const [currentPlanetIdx, setCurrentPlanetIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shields, setShields] = useState(3);
  const [stars, setStars] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);

  const planet = PLANETS[currentPlanetIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered || isGameOver || isGameWon) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);

    const isCorrect = idx === planet.correct;
    if (isCorrect) {
      setStars(prev => prev + 1);
    } else {
      setShields(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setIsGameOver(true);
        }
        return next;
      });
    }
  };

  const handleNext = () => {
    if (currentPlanetIdx < PLANETS.length - 1) {
      setCurrentPlanetIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsGameWon(true);
      onWin(stars * 20 + 50);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
    }
  };

  const handleRestart = () => {
    setCurrentPlanetIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShields(3);
    setStars(0);
    setIsGameOver(false);
    setIsGameWon(false);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 select-none overflow-hidden" dir="rtl">
      {/* Background Starfield */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-black pointer-events-none" />

      {/* Top HUD */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition text-xs font-bold"
        >
          <ArrowRight size={16} />
          <span>خروج</span>
        </button>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
            <Star size={16} fill="currentColor" />
            <span className="font-bold font-mono text-sm">{stars}</span>
          </div>

          <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
            <Shield size={16} />
            <span className="font-bold font-mono text-sm">{shields} دروع</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full py-6">
        {isGameWon ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-6 bg-slate-900/90 border border-emerald-500/40 p-8 rounded-3xl backdrop-blur-xl shadow-2xl"
          >
            <Trophy size={64} className="text-amber-400 mx-auto animate-bounce" />
            <h2 className="text-3xl font-black text-emerald-400 arabic-font">تم فتح جميع الكواكب بنجاح!</h2>
            <p className="text-slate-300">أحسنت يا رائد الفضاء، أكملت الرحلة بحصولك على {stars} نجمة!</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleRestart}
                className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition"
              >
                <RotateCcw size={18} />
                <span>العب مجدداً</span>
              </button>
              <button
                onClick={onBack}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-xl font-black transition"
              >
                العودة للألعاب
              </button>
            </div>
          </motion.div>
        ) : isGameOver ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-6 bg-slate-900/90 border border-red-500/40 p-8 rounded-3xl backdrop-blur-xl shadow-2xl"
          >
            <XCircle size={64} className="text-red-500 mx-auto" />
            <h2 className="text-2xl font-black text-red-400 arabic-font">نفدت دروع المركبة!</h2>
            <p className="text-slate-300">لا تيأس، المعرفة رحلة مستمرة. حاول مرة أخرى!</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleRestart}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-xl font-black transition"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={onBack}
                className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl font-bold transition"
              >
                خروج
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={planet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col gap-6"
          >
            {/* Planet Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${planet.color} shadow-lg flex items-center justify-center ring-2 ring-white/20`}>
                  <Rocket size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black arabic-font text-white">{planet.planetName}</h3>
                  <span className="text-xs text-slate-400 font-bold">{planet.topic}</span>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                كوكب {currentPlanetIdx + 1} / {PLANETS.length}
              </span>
            </div>

            {/* Question Box */}
            <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-md">
              <p className="text-xl font-bold leading-relaxed text-amber-200 arabic-font text-center">
                {planet.question}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {planet.options.map((opt, idx) => {
                const isChosen = selectedAnswer === idx;
                const isCorrect = idx === planet.correct;
                let btnStyle = 'bg-slate-900/60 hover:bg-white/10 border-white/10 text-white';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-600/80 border-emerald-400 text-white shadow-lg shadow-emerald-900/40';
                  } else if (isChosen) {
                    btnStyle = 'bg-red-600/80 border-red-400 text-white shadow-lg shadow-red-900/40';
                  } else {
                    btnStyle = 'bg-slate-900/30 border-white/5 text-white/40';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border-2 text-base font-bold arabic-font transition-all text-center flex items-center justify-center min-h-[60px] ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next Button */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-amber-400 block mb-0.5">معلومة فضائية:</span>
                  {planet.explanation}
                </div>
                <button
                  onClick={handleNext}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl transition text-sm flex items-center gap-1.5 shrink-0"
                >
                  <span>الكوكب التالي</span>
                  <ArrowLeft size={16} />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom Progress Bar */}
      <div className="relative z-10 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500"
          style={{ width: `${((currentPlanetIdx + (isGameWon ? 1 : 0)) / PLANETS.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
