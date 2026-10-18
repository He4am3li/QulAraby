import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sword, Zap, Trophy, ArrowLeft, Heart, Star, AlertCircle, Timer, Skull } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Vocabulary } from '../../types';

interface GrammarHeroProps {
  onWin: (xp: number) => void;
  lang: 'ar' | 'en';
  customVocab: Vocabulary[];
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  word: string;
  isCorrect: boolean;
  hp: number;
  type: 'minion' | 'boss';
}

export const GrammarHero: React.FC<GrammarHeroProps> = ({ onWin, lang, customVocab }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver' | 'won'>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<{ q: string; a: string } | null>(null);
  const [playerPos, setPlayerPos] = useState(50);
  const [isAttacking, setIsAttacking] = useState(false);
  const [wave, setWave] = useState(1);
  const gameLoopRef = useRef<number | null>(null);

  const t = {
    start: lang === 'ar' ? 'ابدأ المعركة' : 'Start Battle',
    gameOver: lang === 'ar' ? 'سقط البطل' : 'Hero Fallen',
    win: lang === 'ar' ? 'انتصرت في المعركة!' : 'Victory in Battle!',
    score: lang === 'ar' ? 'النقاط' : 'Score',
    wave: lang === 'ar' ? 'الموجة' : 'Wave',
    retry: lang === 'ar' ? 'إعادة المحاولة' : 'Retry',
    back: lang === 'ar' ? 'العودة للمنصة' : 'Back to Console',
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setWave(1);
    setEnemies([]);
    setPlayerPos(50);
    nextQuestion();
  };

  const nextQuestion = () => {
    if (customVocab.length === 0) return;
    const word = customVocab[Math.floor(Math.random() * customVocab.length)];
    setCurrentQuestion({
      q: lang === 'ar' ? `دمر الخطأ لـ: ${word.original_word}` : `Destroy error for: ${word.original_word}`,
      a: word.translation
    });
  };

  const spawnEnemy = () => {
    if (enemies.length > 5) return;
    const isCorrect = Math.random() > 0.7;
    let word = '';
    
    if (isCorrect && currentQuestion) {
      word = currentQuestion.a;
    } else {
      const randomWord = customVocab[Math.floor(Math.random() * customVocab.length)];
      word = randomWord?.translation || '...';
    }

    const newEnemy: Enemy = {
      id: Math.random(),
      x: Math.random() * 80 + 10,
      y: -10,
      word,
      isCorrect,
      hp: isCorrect ? 1 : 2,
      type: 'minion'
    };
    setEnemies(prev => [...prev, newEnemy]);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = () => {
      if (Math.random() > 0.97) spawnEnemy();

      setEnemies(prev => {
        const next = prev.map(e => ({ ...e, y: e.y + 0.5 + (wave * 0.1) }))
          .filter(e => e.y < 110);

        // Check if enemy reached bottom
        const reachedBottom = next.find(e => e.y > 90);
        if (reachedBottom) {
          if (!reachedBottom.isCorrect) {
            setLives(l => {
              if (l <= 1) setGameState('gameOver');
              return l - 1;
            });
          }
          return next.filter(e => e.id !== reachedBottom.id);
        }

        return next;
      });

      if (score >= wave * 200) {
        setWave(w => w + 1);
        if (wave >= 5) {
          setGameState('won');
          onWin(1000);
          confetti({ particleCount: 200, spread: 80 });
        }
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, score, wave]);

  const handleAttack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    
    setEnemies(prev => {
      const target = prev.find(e => Math.abs(e.x - playerPos) < 15 && e.y > 60);
      if (target) {
        if (!target.isCorrect) {
          setScore(s => s + 50);
          nextQuestion();
          return prev.filter(e => e.id !== target.id);
        } else {
          setLives(l => Math.max(l - 1, 0));
          return prev.filter(e => e.id !== target.id);
        }
      }
      return prev;
    });

    setTimeout(() => setIsAttacking(false), 300);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPlayerPos(prev => Math.max(prev - 5, 10));
      if (e.key === 'ArrowRight') setPlayerPos(prev => Math.min(prev + 5, 90));
      if (e.key === ' ' || e.key === 'ArrowUp') handleAttack();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [playerPos, isAttacking]);

  return (
    <div className="w-full h-full bg-slate-950 relative overflow-hidden flex flex-col font-sans select-none">
      {/* Dark Arena Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,#1e1b4b_0%,#020617_100%)]" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        {/* Animated Grid */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[linear-gradient(rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)]" />
      </div>

      {/* HUD */}
      <div className="relative z-50 p-6 flex justify-between items-start">
        <div className="space-y-4">
          <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-white/40 text-[8px] font-black uppercase tracking-widest leading-none mb-1">{t.score}</p>
              <p className="text-white font-mono text-xl font-black leading-none">{score}</p>
            </div>
          </div>
          <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Skull size={20} />
            </div>
            <div>
              <p className="text-white/40 text-[8px] font-black uppercase tracking-widest leading-none mb-1">{t.wave}</p>
              <p className="text-white font-mono text-xl font-black leading-none">{wave}/5</p>
            </div>
          </div>
        </div>

        {currentQuestion && gameState === 'playing' && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-2xl border-2 border-purple-400/50 px-8 py-4 rounded-3xl shadow-2xl text-center max-w-md"
          >
            <p className="text-purple-300 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Battle Order</p>
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

      {/* Enemies */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {enemies.map(enemy => (
          <motion.div
            key={enemy.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              left: `${enemy.x}%`,
              top: `${enemy.y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-2xl
              ${enemy.isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-rose-500/20 border-rose-500 text-rose-400'}
            `}>
              <Skull size={32} />
            </div>
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
              <span className="text-white text-[10px] font-black whitespace-nowrap">{enemy.word}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Player Hero */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <motion.div
          animate={{ x: (playerPos - 50) * 10 }}
          style={{ left: `${playerPos}%` }}
          className="absolute -translate-x-1/2 flex flex-col items-center"
        >
          {/* Attack Effect */}
          <AnimatePresence>
            {isAttacking && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 2, 0], opacity: [1, 1, 0] }}
                className="absolute -top-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"
              />
            )}
          </AnimatePresence>

          <div className="relative">
            <motion.div 
              animate={isAttacking ? { y: [-20, 0], scale: [1.2, 1] } : { y: 0 }}
              className="w-20 h-24 bg-gradient-to-b from-indigo-400 to-indigo-700 rounded-2xl border-2 border-white/20 shadow-2xl flex items-center justify-center"
            >
              <Shield size={40} className="text-white/80" />
            </motion.div>
            <motion.div 
              animate={isAttacking ? { rotate: [0, -45, 0], x: [0, 20, 0] } : { rotate: 0 }}
              className="absolute -right-8 top-0"
            >
              <Sword size={48} className="text-slate-300 drop-shadow-xl" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Screens */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-12">
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="w-32 h-32 bg-purple-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(168,85,247,0.5)]">
              <Sword size={64} className="text-white" />
            </motion.div>
            <h1 className="text-white text-6xl font-black italic tracking-tighter mb-4">GRAMMAR <span className="text-purple-400">HERO</span></h1>
            <p className="text-slate-400 font-bold text-xl mb-12 text-center max-w-md">
              {lang === 'ar' ? 'دمر الأخطاء النحوية بسيف المعرفة وكن البطل الذي تحتاجه اللغة!' : 'Destroy grammar mistakes with the sword of knowledge and be the hero the language needs!'}
            </p>
            <button onClick={startGame} className="bg-white text-black px-12 py-5 rounded-2xl font-black text-2xl hover:bg-purple-500 hover:text-white transition-all active:scale-95 shadow-2xl">
              {t.start}
            </button>
          </motion.div>
        )}

        {(gameState === 'gameOver' || gameState === 'won') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-2xl border-4 border-white/20 ${gameState === 'won' ? 'bg-amber-500' : 'bg-rose-500'}`}>
              {gameState === 'won' ? <Trophy size={64} className="text-white" /> : <Skull size={64} className="text-white" />}
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
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Wave</p>
                <p className="text-white text-4xl font-black font-mono">{wave}/5</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={startGame} className="bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:bg-purple-500 hover:text-white transition-all">
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
