import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Heart, Star, AlertCircle, Timer, Target, Goal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Vocabulary } from '../../types';

interface SyntaxSoccerProps {
  onWin: (xp: number) => void;
  lang: 'ar' | 'en';
  customVocab: Vocabulary[];
}

export const SyntaxSoccer: React.FC<SyntaxSoccerProps> = ({ onWin, lang, customVocab }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver' | 'won'>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState<{ q: string; a: string; options: string[] } | null>(null);
  const [isKicking, setIsKicking] = useState(false);
  const [kickResult, setKickResult] = useState<'goal' | 'miss' | null>(null);
  const [goals, setGoals] = useState(0);

  const t = {
    start: lang === 'ar' ? 'ابدأ المباراة' : 'Start Match',
    gameOver: lang === 'ar' ? 'خسرت المباراة' : 'Match Lost',
    win: lang === 'ar' ? 'بطل الدوري!' : 'League Champion!',
    score: lang === 'ar' ? 'النقاط' : 'Score',
    goals: lang === 'ar' ? 'الأهداف' : 'Goals',
    retry: lang === 'ar' ? 'إعادة المحاولة' : 'Retry',
    back: lang === 'ar' ? 'العودة للمنصة' : 'Back to Console',
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setGoals(0);
    setIsKicking(false);
    setKickResult(null);
    nextQuestion();
  };

  const nextQuestion = () => {
    if (customVocab.length < 4) return;
    const word = customVocab[Math.floor(Math.random() * customVocab.length)];
    const options = [word.translation];
    while (options.length < 4) {
      const random = customVocab[Math.floor(Math.random() * customVocab.length)].translation;
      if (!options.includes(random)) options.push(random);
    }
    setCurrentQuestion({
      q: lang === 'ar' ? `سجل الهدف باختيار معنى: ${word.original_word}` : `Score by choosing meaning of: ${word.original_word}`,
      a: word.translation,
      options: options.sort(() => Math.random() - 0.5)
    });
  };

  const handleKick = (option: string) => {
    if (isKicking || gameState !== 'playing') return;
    setIsKicking(true);

    const isCorrect = option === currentQuestion?.a;
    
    setTimeout(() => {
      if (isCorrect) {
        setKickResult('goal');
        setGoals(g => g + 1);
        setScore(s => s + 100);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        setKickResult('miss');
        setLives(l => {
          if (l <= 1) setGameState('gameOver');
          return l - 1;
        });
      }

      setTimeout(() => {
        setIsKicking(false);
        setKickResult(null);
        if (goals + (isCorrect ? 1 : 0) >= 10) {
          setGameState('won');
          onWin(1000);
        } else {
          nextQuestion();
        }
      }, 2000);
    }, 500);
  };

  return (
    <div className="w-full h-full bg-emerald-900 relative overflow-hidden flex flex-col font-sans select-none">
      {/* Stadium Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-emerald-600 to-emerald-900" />
        {/* Pitch Lines */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-emerald-700 border-t-8 border-white/20 [transform:perspective(500px)_rotateX(60deg)]">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 border-4 border-white/20 rounded-b-full" />
        </div>
        {/* Goal Post */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-48 border-8 border-white/80 border-b-0 rounded-t-xl bg-white/5 backdrop-blur-sm shadow-2xl flex items-center justify-center">
           <Goal size={120} className="text-white/10" />
        </div>
      </div>

      {/* HUD */}
      <div className="relative z-50 p-6 flex justify-between items-start">
        <div className="space-y-4">
          <div className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-white/40 text-[8px] font-black uppercase tracking-widest leading-none mb-1">{t.score}</p>
              <p className="text-white font-mono text-xl font-black leading-none">{score}</p>
            </div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Target size={20} />
            </div>
            <div>
              <p className="text-white/40 text-[8px] font-black uppercase tracking-widest leading-none mb-1">{t.goals}</p>
              <p className="text-white font-mono text-xl font-black leading-none">{goals}/10</p>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart 
              key={i} 
              size={24} 
              className={i < lives ? "text-rose-500 fill-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "text-white/10"} 
            />
          ))}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        {currentQuestion && !kickResult && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur-3xl border-2 border-white/20 p-12 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] text-center max-w-4xl w-full"
          >
            <p className="text-emerald-300 text-xs font-black uppercase tracking-[0.4em] mb-4">Penalty Shootout</p>
            <h2 className="text-white text-4xl font-black italic mb-12 leading-tight">{currentQuestion.q}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentQuestion.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleKick(opt)}
                  className="p-6 rounded-2xl border-2 border-white/10 bg-white/5 text-white text-xl font-black transition-all"
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Kick Animation */}
        <AnimatePresence>
          {kickResult && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-[60]"
            >
              <div className={`text-8xl font-black italic uppercase tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,1)]
                ${kickResult === 'goal' ? 'text-amber-400' : 'text-rose-500'}
              `}>
                {kickResult === 'goal' ? 'GOAL!!!' : 'MISS!'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ball */}
        <motion.div 
          animate={
            kickResult === 'goal' ? { y: -400, scale: 0.2, rotate: 720 } :
            kickResult === 'miss' ? { y: -400, x: 300, scale: 0.2, rotate: 360 } :
            { y: 0, scale: 1 }
          }
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute bottom-20 w-24 h-24 bg-white rounded-full shadow-2xl border-4 border-slate-200 flex items-center justify-center overflow-hidden"
        >
          <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/football.png')] bg-center bg-cover opacity-60" />
        </motion.div>
      </div>

      {/* Screens */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-12">
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="w-32 h-32 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.5)]">
              <Target size={64} className="text-white" />
            </motion.div>
            <h1 className="text-white text-6xl font-black italic tracking-tighter mb-4">SYNTAX <span className="text-emerald-400">SOCCER</span></h1>
            <p className="text-slate-400 font-bold text-xl mb-12 text-center max-w-md">
              {lang === 'ar' ? 'سجل الأهداف عن طريق حل الألغاز النحوية المعقدة وكن هداف اللغة العربية!' : 'Score goals by solving complex syntax puzzles and become the top scorer of Arabic!'}
            </p>
            <button onClick={startGame} className="bg-white text-black px-12 py-5 rounded-2xl font-black text-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-2xl">
              {t.start}
            </button>
          </motion.div>
        )}

        {(gameState === 'gameOver' || gameState === 'won') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-2xl border-4 border-white/20 ${gameState === 'won' ? 'bg-amber-500' : 'bg-rose-500'}`}>
              {gameState === 'won' ? <Trophy size={64} className="text-white" /> : <AlertCircle size={64} className="text-white" />}
            </div>
            <h2 className="text-white text-5xl font-black mb-4 italic uppercase tracking-tighter">
              {gameState === 'won' ? t.win : t.gameOver}
            </h2>
            <div className="flex gap-8 mb-12">
              <div className="text-center">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{t.score}</p>
                <p className="text-white text-4xl font-black font-mono">{score}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Goals</p>
                <p className="text-white text-4xl font-black font-mono">{goals}/10</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={startGame} className="bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:bg-emerald-500 hover:text-white transition-all">
                {t.retry}
              </button>
              <button onClick={() => window.location.reload()} className="bg-white/10 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-white/20 transition-all border border-white/10">
                {t.back}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
