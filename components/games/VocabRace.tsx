import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Zap, Trophy, ArrowLeft, Timer, Star, Heart, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Vocabulary } from '../../types';

interface VocabRaceProps {
  onWin: (xp: number) => void;
  lang: 'ar' | 'en';
  customVocab: Vocabulary[];
}

interface Obstacle {
  id: number;
  x: number; // -1 (left), 0 (center), 1 (right)
  y: number; // 0 to 100 (distance from player)
  word: string;
  isCorrect: boolean;
}

export const VocabRace: React.FC<VocabRaceProps> = ({ onWin, lang, customVocab }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver' | 'won'>('menu');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playerX, setPlayerX] = useState(0); // -1, 0, 1
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<{ q: string; a: string } | null>(null);
  const [lives, setLives] = useState(3);
  const [distance, setDistance] = useState(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastObstacleTime = useRef(0);

  const t = {
    start: lang === 'ar' ? 'ابدأ السباق' : 'Start Race',
    gameOver: lang === 'ar' ? 'انتهت اللعبة' : 'Game Over',
    win: lang === 'ar' ? 'وصلت لخط النهاية!' : 'Reached the Finish Line!',
    score: lang === 'ar' ? 'النقاط' : 'Score',
    speed: lang === 'ar' ? 'السرعة' : 'Speed',
    lives: lang === 'ar' ? 'الأرواح' : 'Lives',
    retry: lang === 'ar' ? 'إعادة المحاولة' : 'Retry',
    back: lang === 'ar' ? 'العودة للمنصة' : 'Back to Console',
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setSpeed(1);
    setPlayerX(0);
    setObstacles([]);
    setLives(3);
    setDistance(0);
    nextQuestion();
  };

  const nextQuestion = () => {
    if (customVocab.length === 0) return;
    const word = customVocab[Math.floor(Math.random() * customVocab.length)];
    setCurrentQuestion({
      q: lang === 'ar' ? `ما معنى: ${word.original_word}` : `Meaning of: ${word.original_word}`,
      a: word.translation
    });
  };

  const spawnObstacle = (time: number) => {
    if (time - lastObstacleTime.current < 2000 / speed) return;
    lastObstacleTime.current = time;

    const lanes = [-1, 0, 1];
    const correctLane = lanes[Math.floor(Math.random() * 3)];
    
    const newObstacles: Obstacle[] = lanes.map(lane => {
      const isCorrect = lane === correctLane;
      let word = '';
      if (isCorrect && currentQuestion) {
        word = currentQuestion.a;
      } else {
        const randomWord = customVocab[Math.floor(Math.random() * customVocab.length)];
        word = randomWord?.translation || '...';
      }

      return {
        id: Math.random(),
        x: lane,
        y: 100,
        word,
        isCorrect
      };
    });

    setObstacles(prev => [...prev, ...newObstacles]);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = (time: number) => {
      setDistance(prev => prev + speed * 0.1);
      spawnObstacle(time);

      setObstacles(prev => {
        const next = prev.map(obs => ({ ...obs, y: obs.y - speed * 1.5 }))
          .filter(obs => obs.y > -10);

        // Collision Detection
        const colliding = next.find(obs => obs.y < 15 && obs.y > 5 && obs.x === playerX);
        if (colliding) {
          if (colliding.isCorrect) {
            setScore(s => s + 10);
            setSpeed(sp => Math.min(sp + 0.1, 3));
            nextQuestion();
            // Remove colliding group
            return next.filter(obs => obs.y > 20 || obs.y < 0);
          } else {
            setLives(l => {
              if (l <= 1) setGameState('gameOver');
              return l - 1;
            });
            return next.filter(obs => obs.y > 20 || obs.y < 0);
          }
        }

        return next;
      });

      if (distance >= 1000) {
        setGameState('won');
        onWin(500);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, speed, playerX, currentQuestion, distance]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPlayerX(prev => Math.max(prev - 1, -1));
      if (e.key === 'ArrowRight') setPlayerX(prev => Math.min(prev + 1, 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="w-full h-full bg-slate-900 relative overflow-hidden flex flex-col font-sans select-none">
      {/* 3D Perspective Road */}
      <div className="absolute inset-0 perspective-1000">
        <div 
          className="absolute inset-0 bg-slate-800"
          style={{ 
            transform: 'rotateX(60deg) translateY(-100px)',
            transformOrigin: 'bottom',
            backgroundImage: `
              linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 100%),
              repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 80px)
            `
          }}
        >
          {/* Road Lines */}
          <div className="absolute inset-0 flex justify-center gap-40">
            <div className="w-2 h-full bg-white/20" />
            <div className="w-2 h-full bg-white/20" />
          </div>

          {/* Moving Obstacles */}
          {obstacles.map(obs => (
            <motion.div
              key={obs.id}
              initial={{ scale: 0 }}
              animate={{ 
                scale: 1 - (obs.y / 100) * 0.8,
                left: `${50 + obs.x * 30}%`,
                top: `${100 - obs.y}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-xl border-2 font-black text-white shadow-2xl backdrop-blur-md
                ${obs.isCorrect ? 'bg-emerald-500/80 border-emerald-300' : 'bg-rose-500/80 border-rose-300'}
              `}
            >
              {obs.word}
            </motion.div>
          ))}
        </div>
      </div>

      {/* HUD */}
      <div className="relative z-50 p-6 flex justify-between items-start">
        <div className="space-y-4">
          <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-white/40 text-[8px] font-black uppercase tracking-widest leading-none mb-1">{t.score}</p>
              <p className="text-white font-mono text-xl font-black leading-none">{score}</p>
            </div>
          </div>
          <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-white/40 text-[8px] font-black uppercase tracking-widest leading-none mb-1">{t.speed}</p>
              <p className="text-white font-mono text-xl font-black leading-none">{speed.toFixed(1)}x</p>
            </div>
          </div>
        </div>

        {currentQuestion && gameState === 'playing' && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-2xl border-2 border-blue-500/50 px-8 py-4 rounded-3xl shadow-2xl text-center max-w-md"
          >
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Target Word</p>
            <h2 className="text-white text-3xl font-black italic">{currentQuestion.q}</h2>
          </motion.div>
        )}

        <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart 
              key={i} 
              size={24} 
              className={i < lives ? "text-rose-500 fill-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "text-white/10"} 
            />
          ))}
        </div>
      </div>

      {/* Player Car */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <motion.div
          animate={{ x: playerX * 150, rotate: playerX * 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative"
        >
          <div className="w-24 h-40 bg-gradient-to-b from-blue-400 to-blue-700 rounded-2xl shadow-2xl border-2 border-white/20 relative overflow-hidden">
             {/* Windshield */}
             <div className="absolute top-4 left-2 right-2 h-12 bg-slate-900/80 rounded-lg border border-white/10" />
             {/* Lights */}
             <div className="absolute top-2 left-2 w-4 h-2 bg-white rounded-full shadow-[0_0_20px_white]" />
             <div className="absolute top-2 right-2 w-4 h-2 bg-white rounded-full shadow-[0_0_20px_white]" />
             {/* Spoiler */}
             <div className="absolute bottom-2 left-0 right-0 h-4 bg-blue-900 border-t border-white/20" />
          </div>
          {/* Exhaust Particles */}
          <motion.div 
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
            transition={{ repeat: Infinity, duration: 0.2 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-orange-500/40 rounded-full blur-xl" 
          />
        </motion.div>
      </div>

      {/* Screens */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-12">
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="w-32 h-32 bg-blue-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(59,130,246,0.5)]">
              <Car size={64} className="text-white" />
            </motion.div>
            <h1 className="text-white text-6xl font-black italic tracking-tighter mb-4">VOCAB <span className="text-blue-500">RACE</span></h1>
            <p className="text-slate-400 font-bold text-xl mb-12 text-center max-w-md">
              {lang === 'ar' ? 'قد سيارتك نحو الكلمات الصحيحة وتجنب الأخطاء لتصل لخط النهاية!' : 'Drive towards correct words and avoid mistakes to reach the finish line!'}
            </p>
            <button onClick={startGame} className="bg-white text-black px-12 py-5 rounded-2xl font-black text-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-2xl">
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
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Distance</p>
                <p className="text-white text-4xl font-black font-mono">{Math.round(distance)}m</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={startGame} className="bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-500 hover:text-white transition-all">
                {t.retry}
              </button>
              <button onClick={() => window.location.reload()} className="bg-white/10 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-white/20 transition-all border border-white/10">
                {t.back}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/5">
        <motion.div 
          className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
          style={{ width: `${(distance / 1000) * 100}%` }} 
        />
      </div>
    </div>
  );
};
