import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anchor, Waves, Fish, Trophy, ArrowLeft, Heart, Star, AlertCircle, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Vocabulary } from '../../types';

interface ArabicAnglerProps {
  onWin: (xp: number) => void;
  lang: 'ar' | 'en';
  customVocab: Vocabulary[];
}

interface FishData {
  id: number;
  x: number;
  y: number;
  speed: number;
  word: string;
  isCorrect: boolean;
  direction: 1 | -1;
  color: string;
}

export const ArabicAngler: React.FC<ArabicAnglerProps> = ({ onWin, lang, customVocab }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver' | 'won'>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [hookX, setHookX] = useState(50);
  const [hookY, setHookY] = useState(10);
  const [isHooking, setIsHooking] = useState(false);
  const [fishes, setFishes] = useState<FishData[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<{ q: string; a: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const gameLoopRef = useRef<number | null>(null);

  const t = {
    start: lang === 'ar' ? 'ابدأ الصيد' : 'Start Fishing',
    gameOver: lang === 'ar' ? 'انتهى الوقت' : 'Time Over',
    win: lang === 'ar' ? 'صياد ماهر!' : 'Master Angler!',
    score: lang === 'ar' ? 'النقاط' : 'Score',
    time: lang === 'ar' ? 'الوقت' : 'Time',
    retry: lang === 'ar' ? 'إعادة المحاولة' : 'Retry',
    back: lang === 'ar' ? 'العودة للمنصة' : 'Back to Console',
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setTimeRemaining(60);
    setFishes([]);
    setHookX(50);
    setHookY(10);
    setIsHooking(false);
    nextQuestion();
  };

  const nextQuestion = () => {
    if (customVocab.length === 0) return;
    const word = customVocab[Math.floor(Math.random() * customVocab.length)];
    setCurrentQuestion({
      q: lang === 'ar' ? `اصطد معنى: ${word.original_word}` : `Catch meaning of: ${word.original_word}`,
      a: word.translation
    });
  };

  const spawnFish = () => {
    if (fishes.length > 8) return;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const isCorrect = Math.random() > 0.7;
    let word = '';
    
    if (isCorrect && currentQuestion) {
      word = currentQuestion.a;
    } else {
      const randomWord = customVocab[Math.floor(Math.random() * customVocab.length)];
      word = randomWord?.translation || '...';
    }

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const newFish: FishData = {
      id: Math.random(),
      x: direction === 1 ? -20 : 120,
      y: 30 + Math.random() * 60,
      speed: 0.2 + Math.random() * 0.5,
      word,
      isCorrect,
      direction,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setFishes(prev => [...prev, newFish]);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameState(score >= 100 ? 'won' : 'gameOver');
          if (score >= 100) onWin(500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, score]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = () => {
      if (Math.random() > 0.98) spawnFish();

      setFishes(prev => prev.map(f => ({
        ...f,
        x: f.x + f.speed * f.direction
      })).filter(f => f.x > -30 && f.x < 130));

      if (isHooking) {
        setHookY(prev => {
          if (prev >= 90) {
            setIsHooking(false);
            return 90;
          }
          return prev + 2;
        });
      } else {
        setHookY(prev => Math.max(prev - 1, 10));
      }

      // Collision Detection
      setFishes(prev => {
        const caught = prev.find(f => 
          Math.abs(f.x - hookX) < 5 && 
          Math.abs(f.y - hookY) < 5
        );

        if (caught) {
          if (caught.isCorrect) {
            setScore(s => s + 20);
            nextQuestion();
            confetti({ particleCount: 50, spread: 40, origin: { x: hookX / 100, y: hookY / 100 } });
          } else {
            setLives(l => Math.max(l - 1, 0));
            setScore(s => Math.max(s - 10, 0));
          }
          setIsHooking(false);
          setHookY(10);
          return prev.filter(f => f.id !== caught.id);
        }
        return prev;
      });

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, isHooking, hookX, hookY]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setHookX(prev => Math.max(prev - 5, 5));
      if (e.key === 'ArrowRight') setHookX(prev => Math.min(prev + 5, 95));
      if (e.key === ' ' || e.key === 'ArrowDown') setIsHooking(true);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="w-full h-full bg-sky-900 relative overflow-hidden flex flex-col font-sans select-none">
      {/* Parallax Ocean Layers */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-600 to-indigo-900" />
        {/* Animated Waves */}
        <motion.div 
          animate={{ x: [-100, 0], y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="absolute top-0 left-0 w-[200%] h-32 bg-white/10 blur-xl"
        />
        {/* Light Rays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.2)_0%,transparent_60%)]" />
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
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Timer size={20} />
            </div>
            <div>
              <p className="text-white/40 text-[8px] font-black uppercase tracking-widest leading-none mb-1">{t.time}</p>
              <p className="text-white font-mono text-xl font-black leading-none">{timeRemaining}s</p>
            </div>
          </div>
        </div>

        {currentQuestion && gameState === 'playing' && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-2xl border-2 border-sky-400/50 px-8 py-4 rounded-3xl shadow-2xl text-center max-w-md"
          >
            <p className="text-sky-300 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Target Fish</p>
            <h2 className="text-white text-3xl font-black italic">{currentQuestion.q}</h2>
          </motion.div>
        )}

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

      {/* Fishing Hook & Line */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        <motion.div 
          animate={{ left: `${hookX}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="absolute top-0 bottom-0 w-0.5 bg-white/40"
        >
          <motion.div 
            animate={{ top: `${hookY}%` }}
            className="absolute left-1/2 -translate-x-1/2 w-8 h-12 flex flex-col items-center"
          >
            <div className="w-0.5 h-full bg-white/60" />
            <Anchor size={32} className="text-slate-300 drop-shadow-xl" />
          </motion.div>
        </motion.div>
      </div>

      {/* Fishes */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {fishes.map(fish => (
          <motion.div
            key={fish.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              left: `${fish.x}%`,
              top: `${fish.y}%`,
              rotateY: fish.direction === 1 ? 0 : 180
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
          >
            <div className="relative">
              <Fish size={48} style={{ color: fish.color, fill: fish.color }} className="drop-shadow-2xl" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-2 -right-2 w-4 h-4 bg-white/20 rounded-full blur-sm"
              />
            </div>
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
              <span className="text-white text-[10px] font-black whitespace-nowrap">{fish.word}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Screens */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-12">
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="w-32 h-32 bg-sky-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(14,165,233,0.5)]">
              <Anchor size={64} className="text-white" />
            </motion.div>
            <h1 className="text-white text-6xl font-black italic tracking-tighter mb-4">ARABIC <span className="text-sky-400">ANGLER</span></h1>
            <p className="text-slate-400 font-bold text-xl mb-12 text-center max-w-md">
              {lang === 'ar' ? 'اصطد الأسماك التي تحمل المعاني الصحيحة لتصبح سيد البحار!' : 'Catch the fish with the correct meanings to become the master of the seas!'}
            </p>
            <button onClick={startGame} className="bg-white text-black px-12 py-5 rounded-2xl font-black text-2xl hover:bg-sky-500 hover:text-white transition-all active:scale-95 shadow-2xl">
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
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Target</p>
                <p className="text-white text-4xl font-black font-mono">100</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={startGame} className="bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:bg-sky-500 hover:text-white transition-all">
                {t.retry}
              </button>
              <button onClick={() => window.location.reload()} className="bg-white/10 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-white/20 transition-all border border-white/10">
                {t.back}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubbles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ y: [-100, 1000], x: [0, Math.random() * 50 - 25, 0] }}
          transition={{ repeat: Infinity, duration: 5 + Math.random() * 10, delay: Math.random() * 5 }}
          className="absolute w-4 h-4 bg-white/10 rounded-full blur-sm"
          style={{ left: `${Math.random() * 100}%`, top: -50 }}
        />
      ))}
    </div>
  );
};
