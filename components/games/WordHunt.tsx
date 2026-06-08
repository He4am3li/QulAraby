import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Map, Search, Trophy, ArrowLeft, Heart, Star, AlertCircle, Timer, TreePine } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Vocabulary } from '../../types';

interface WordHuntProps {
  onWin: (xp: number) => void;
  lang: 'ar' | 'en';
  customVocab: Vocabulary[];
}

interface Tile {
  id: number;
  word: string;
  isFound: boolean;
  isHidden: boolean;
  x: number;
  y: number;
}

export const WordHunt: React.FC<WordHuntProps> = ({ onWin, lang, customVocab }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver' | 'won'>('menu');
  const [score, setScore] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [targetWord, setTargetWord] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [foundCount, setFoundCount] = useState(0);

  const t = {
    start: lang === 'ar' ? 'ابدأ المغامرة' : 'Start Adventure',
    gameOver: lang === 'ar' ? 'انتهى الوقت' : 'Time Over',
    win: lang === 'ar' ? 'مكتشف عظيم!' : 'Great Explorer!',
    score: lang === 'ar' ? 'النقاط' : 'Score',
    time: lang === 'ar' ? 'الوقت' : 'Time',
    retry: lang === 'ar' ? 'إعادة المحاولة' : 'Retry',
    back: lang === 'ar' ? 'العودة للمنصة' : 'Back to Console',
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeRemaining(90);
    setFoundCount(0);
    generateBoard();
  };

  const generateBoard = () => {
    if (customVocab.length < 5) return;
    
    const selectedWords = [...customVocab]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    const newTiles: Tile[] = [];
    const gridSize = 5;
    
    // Fill with random words and target words
    for (let i = 0; i < gridSize * gridSize; i++) {
      const isTarget = Math.random() > 0.7 && selectedWords.length > 0;
      const wordObj = isTarget 
        ? selectedWords.pop() 
        : customVocab[Math.floor(Math.random() * customVocab.length)];
      
      newTiles.push({
        id: i,
        word: wordObj?.translation || '...',
        isFound: false,
        isHidden: true,
        x: i % gridSize,
        y: Math.floor(i / gridSize)
      });
    }

    setTiles(newTiles);
    setTargetWord(customVocab[Math.floor(Math.random() * customVocab.length)].translation);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameState(foundCount >= 5 ? 'won' : 'gameOver');
          if (foundCount >= 5) onWin(500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, foundCount]);

  const handleTileClick = (tile: Tile) => {
    if (gameState !== 'playing' || !tile.isHidden) return;

    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, isHidden: false } : t));

    if (tile.word === targetWord) {
      setScore(s => s + 50);
      setFoundCount(f => f + 1);
      confetti({ particleCount: 50, spread: 40 });
      
      // Pick new target
      const remaining = customVocab.filter(v => v.translation !== targetWord);
      if (remaining.length > 0) {
        setTargetWord(remaining[Math.floor(Math.random() * remaining.length)].translation);
      }
    } else {
      setScore(s => Math.max(s - 10, 0));
      // Hide back after delay
      setTimeout(() => {
        setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, isHidden: true } : t));
      }, 1000);
    }
  };

  return (
    <div className="w-full h-full bg-emerald-950 relative overflow-hidden flex flex-col font-sans select-none">
      {/* Jungle Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-800 via-emerald-900 to-slate-950" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leaves.png')]" />
        {/* Floating Leaves */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, 1000], 
              x: [0, Math.random() * 100 - 50, 0],
              rotate: [0, 360]
            }}
            transition={{ repeat: Infinity, duration: 10 + Math.random() * 10, delay: Math.random() * 5 }}
            className="absolute text-emerald-500/20"
            style={{ left: `${Math.random() * 100}%`, top: -50 }}
          >
            <TreePine size={24 + Math.random() * 24} />
          </motion.div>
        ))}
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
              <Timer size={20} />
            </div>
            <div>
              <p className="text-white/40 text-[8px] font-black uppercase tracking-widest leading-none mb-1">{t.time}</p>
              <p className="text-white font-mono text-xl font-black leading-none">{timeRemaining}s</p>
            </div>
          </div>
        </div>

        {targetWord && gameState === 'playing' && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-2xl border-2 border-emerald-400/50 px-8 py-4 rounded-3xl shadow-2xl text-center max-w-md"
          >
            <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Target Discovery</p>
            <h2 className="text-white text-3xl font-black italic">{targetWord}</h2>
          </motion.div>
        )}

        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-4">
           <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Map size={20} />
            </div>
            <div>
              <p className="text-white/40 text-[8px] font-black uppercase tracking-widest leading-none mb-1">Found</p>
              <p className="text-white font-mono text-xl font-black leading-none">{foundCount}/5</p>
            </div>
        </div>
      </div>

      {/* Grid Board */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="grid grid-cols-5 gap-4 max-w-2xl w-full aspect-square">
          {tiles.map(tile => (
            <motion.div
              key={tile.id}
              whileHover={{ scale: tile.isHidden ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTileClick(tile)}
              className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-500 flex items-center justify-center text-center p-2
                ${tile.isHidden 
                  ? 'bg-emerald-900/60 border-emerald-700/50 shadow-lg' 
                  : (tile.word === targetWord ? 'bg-amber-500 border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.5)]' : 'bg-rose-900/80 border-rose-700')
                }
              `}
            >
              <AnimatePresence mode="wait">
                {tile.isHidden ? (
                  <motion.div key="hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Compass size={32} className="text-emerald-700/50" />
                  </motion.div>
                ) : (
                  <motion.span key="word" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} className="text-white font-black text-[10px] md:text-sm uppercase tracking-tighter">
                    {tile.word}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Screens */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-12">
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="w-32 h-32 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.5)]">
              <Map size={64} className="text-white" />
            </motion.div>
            <h1 className="text-white text-6xl font-black italic tracking-tighter mb-4">WORD <span className="text-emerald-400">HUNT</span></h1>
            <p className="text-slate-400 font-bold text-xl mb-12 text-center max-w-md">
              {lang === 'ar' ? 'استكشف الغابة المفقودة وابحث عن الكلمات المخفية تحت البوصلات!' : 'Explore the lost forest and find hidden words under the compasses!'}
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
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Found</p>
                <p className="text-white text-4xl font-black font-mono">{foundCount}/5</p>
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
