import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, User, Users, RotateCcw, Home, Volume2, VolumeX, 
  CheckCircle2, XCircle, Sparkles, Brain, Languages, ArrowLeft,
  Star, Zap, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateSpeech, decodeAudioData, speak as globalSpeak } from '../../services/gemini';

// --- Types ---
interface Card {
  id: number;
  pairId: number;
  content: string;
  type: 'word' | 'match' | 'image';
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchProps {
  onWin?: (score: number) => void;
  onBack?: () => void;
  lang?: 'ar' | 'en';
}

// --- Constants ---
const LEVELS_DATA = [
  {
    level: 1,
    title: { ar: 'المستوى الأول: الكلمة والصورة', en: 'Level 1: Word & Image' },
    pairs: [
      { id: 1, word: 'أسد', match: '🦁' },
      { id: 2, word: 'فيل', match: '🐘' },
      { id: 3, word: 'قمر', match: '🌙' },
      { id: 4, word: 'شمس', match: '☀️' },
      { id: 5, word: 'كتاب', match: '📚' },
      { id: 6, word: 'تفاحة', match: '🍎' },
      { id: 7, word: 'سيارة', match: '🚗' },
      { id: 8, word: 'بيت', match: '🏠' },
      { id: 9, word: 'كلب', match: '🐶' },
      { id: 10, word: 'قطة', match: '🐱' },
      { id: 11, word: 'شجرة', match: '🌳' },
      { id: 12, word: 'وردة', match: '🌹' },
      { id: 13, word: 'طائرة', match: '✈️' },
      { id: 14, word: 'ساعة', match: '⌚' },
      { id: 15, word: 'موز', match: '🍌' },
      { id: 16, word: 'ثلج', match: '❄️' },
    ]
  },
  {
    level: 2,
    title: { ar: 'المستوى الثاني: الكلمة والترجمة', en: 'Level 2: Word & Translation' },
    pairs: [
      { id: 1, word: 'مدرسة', match: 'School' },
      { id: 2, word: 'معلم', match: 'Teacher' },
      { id: 3, word: 'طالب', match: 'Student' },
      { id: 4, word: 'حلم', match: 'Dream' },
      { id: 5, word: 'سفر', match: 'Travel' },
      { id: 6, word: 'صديق', match: 'Friend' },
      { id: 7, word: 'وقت', match: 'Time' },
      { id: 8, word: 'عالم', match: 'World' },
      { id: 9, word: 'سماء', match: 'Sky' },
      { id: 10, word: 'بحر', match: 'Sea' },
      { id: 11, word: 'جبل', match: 'Mountain' },
      { id: 12, word: 'نهر', match: 'River' },
      { id: 13, word: 'قمر', match: 'Moon' },
      { id: 14, word: 'نجم', match: 'Star' },
      { id: 15, word: 'قلب', match: 'Heart' },
      { id: 16, word: 'روح', match: 'Soul' },
    ]
  },
  {
    level: 3,
    title: { ar: 'المستوى الثالث: الكلمة والجمع', en: 'Level 3: Word & Plural' },
    pairs: [
      { id: 1, word: 'قلم', match: 'أقلام' },
      { id: 2, word: 'كتاب', match: 'كتب' },
      { id: 3, word: 'رجل', match: 'رجال' },
      { id: 4, word: 'بنت', match: 'بنات' },
      { id: 5, word: 'شجرة', match: 'أشجار' },
      { id: 6, word: 'بيت', match: 'بيوت' },
      { id: 7, word: 'عين', match: 'عيون' },
      { id: 8, word: 'قلب', match: 'قلوب' },
      { id: 9, word: 'مدينة', match: 'مدن' },
      { id: 10, word: 'طالب', match: 'طلاب' },
      { id: 11, word: 'طبيب', match: 'أطباء' },
      { id: 12, word: 'يوم', match: 'أيام' },
      { id: 13, word: 'شهر', match: 'شهور' },
      { id: 14, word: 'سنة', match: 'سنوات' },
      { id: 15, word: 'باب', match: 'أبواب' },
      { id: 16, word: 'نافذة', match: 'نوافذ' },
    ]
  },
  {
    level: 4,
    title: { ar: 'المستوى الرابع: الكلمة والضد', en: 'Level 4: Word & Antonym' },
    pairs: [
      { id: 1, word: 'سريع', match: 'بطيء' },
      { id: 2, word: 'كبير', match: 'صغير' },
      { id: 3, word: 'قوي', match: 'ضعيف' },
      { id: 4, word: 'طويل', match: 'قصير' },
      { id: 5, word: 'جميل', match: 'قبيح' },
      { id: 6, word: 'سعيد', match: 'حزين' },
      { id: 7, word: 'نور', match: 'ظلام' },
      { id: 8, word: 'نهار', match: 'ليل' },
      { id: 9, word: 'غني', match: 'فقير' },
      { id: 10, word: 'شجاع', match: 'جبان' },
      { id: 11, word: 'كريم', match: 'بخيل' },
      { id: 12, word: 'صادق', match: 'كاذب' },
      { id: 13, word: 'قريب', match: 'بعيد' },
      { id: 14, word: 'سهل', match: 'صعب' },
      { id: 15, word: 'جديد', match: 'قديم' },
      { id: 16, word: 'بارد', match: 'ساخن' },
    ]
  },
  {
    level: 5,
    title: { ar: 'المستوى الخامس: الكلمة والمعنى', en: 'Level 5: Word & Meaning' },
    pairs: [
      { id: 1, word: 'غيث', match: 'مطر' },
      { id: 2, word: 'ليث', match: 'أسد' },
      { id: 3, word: 'بيداء', match: 'صحراء' },
      { id: 4, word: 'وسيم', match: 'جميل' },
      { id: 5, word: 'فطن', match: 'ذكي' },
      { id: 6, word: 'مقدام', match: 'شجاع' },
      { id: 7, word: 'بأس', match: 'قوة' },
      { id: 8, word: 'كَرَم', match: 'جود' },
      { id: 9, word: 'هزبر', match: 'أسد' },
      { id: 10, word: 'حسام', match: 'سيف' },
      { id: 11, word: 'منزل', match: 'بيت' },
      { id: 12, word: 'مبصر', match: 'رائي' },
      { id: 13, word: 'بحر', match: 'يم' },
      { id: 14, word: 'نور', match: 'ضياء' },
      { id: 15, word: 'صراط', match: 'طريق' },
      { id: 16, word: 'مغفرة', match: 'تسامح' },
    ]
  }
];

// --- Sub-Components ---

const CardComponent: React.FC<{ 
  card: Card; 
  onClick: () => void; 
  disabled: boolean;
}> = ({ card, onClick, disabled }) => {
  // Soft colors for borders based on type
  const borderColor = card.type === 'word' ? 'border-amber-400/60' : 'border-blue-400/60';
  const glowColor = card.type === 'word' ? 'shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'shadow-[0_0_15px_rgba(96,165,250,0.4)]';

  return (
    <motion.div 
      whileTap={{ scale: 0.85, rotate: -2 }}
      whileHover={{ scale: 1.02 }}
      className="relative w-full aspect-[3/4] perspective-[1000px] cursor-pointer group"
      onClick={() => {
        if (!disabled && !card.isFlipped && !card.isMatched) {
          if (navigator.vibrate) navigator.vibrate(10);
          onClick();
        }
      }}
    >
      <motion.div
        animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front (Hidden) */}
        <div className="absolute inset-0 backface-hidden bg-[#1a1a1a] border-2 border-[#d4bc96]/20 rounded-xl flex items-center justify-center shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/gold-scale.png')] opacity-10" />
          <div className="relative w-12 h-12 border-2 border-[#d4bc96]/30 rounded-full flex items-center justify-center">
            <Brain className="text-[#d4bc96]/30" size={24} />
          </div>
          <div className="absolute inset-2 border border-[#d4bc96]/5 rounded-lg pointer-events-none" />
        </div>

        {/* Back (Revealed) */}
        <div 
          className={`absolute inset-0 backface-hidden bg-[#fdfbf7] border-4 rounded-xl flex flex-col items-center justify-center shadow-2xl p-4 text-center rotate-y-180 transition-all duration-300 ${
            card.isFlipped || card.isMatched ? `${borderColor} ${glowColor}` : 'border-transparent'
          }`}
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40" />
          
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative z-10 font-serif font-bold text-[#1a1a1a] ${
              card.type === 'image' ? 'text-7xl' : (card.content.length > 10 ? 'text-lg' : 'text-3xl')
            }`}
          >
            {card.content}
          </motion.span>

          {card.isMatched && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1.8, opacity: [1, 0] }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center text-green-500/50 pointer-events-none"
            >
              <CheckCircle2 size={64} />
            </motion.div>
          )}
          
          <div className="absolute inset-1 border border-[#d4bc96]/10 rounded-lg pointer-events-none" />
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main Component ---

export const MemoryMatch: React.FC<MemoryMatchProps> = ({ onWin, onBack, lang = 'ar' }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | 'draw' | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false); 
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [multiplier, setMultiplier] = useState(1);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const speak = async (text: string) => {
    if (!voiceEnabled || !soundEnabled) return;
    await globalSpeak(text, 'ar');
  };

  const initGame = useCallback((level: number = 1) => {
    const levelData = LEVELS_DATA.find(l => l.level === level) || LEVELS_DATA[0];
    
    // Pick 8 random pairs from the pool to avoid repetition
    const shuffledPool = [...levelData.pairs].sort(() => Math.random() - 0.5);
    const selectedPairs = shuffledPool.slice(0, 8);
    
    const gameCards: Card[] = [];
    
    selectedPairs.forEach((pair, idx) => {
      gameCards.push({
        id: idx * 2,
        pairId: pair.id,
        content: pair.word,
        type: 'word',
        isFlipped: false,
        isMatched: false,
      });
      gameCards.push({
        id: idx * 2 + 1,
        pairId: pair.id,
        content: pair.match,
        type: level === 1 ? 'image' : 'match',
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(gameCards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setTurn(1);
    setScores({ p1: 0, p2: 0 });
    setWinner(null);
    setIsProcessing(false);
    setMultiplier(1);
  }, []);

  useEffect(() => {
    initGame(currentLevel);
  }, [currentLevel, initGame]);

  const playSound = (type: 'flip' | 'match' | 'wrong' | 'win') => {
    if (!soundEnabled) return;
    const sounds = {
      flip: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
      match: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
      wrong: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
      win: 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3'
    };
    new Audio(sounds[type]).play().catch(() => {});
  };

  const handleCardClick = (id: number) => {
    if (isProcessing || flippedCards.length === 2) return;
    
    const card = cards.find(c => c.id === id);
    if (!card) return;

    playSound('flip');
    speak(card.content);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId)!;
      const secondCard = cards.find(c => c.id === secondId)!;

      if (firstCard.pairId === secondCard.pairId) {
        setTimeout(() => {
          playSound('match');
          if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
          
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true, isFlipped: false } 
              : c
          ));
          
          const points = 1 * multiplier;
          setScores(prev => ({
            ...prev,
            [turn === 1 ? 'p1' : 'p2']: prev[turn === 1 ? 'p1' : 'p2'] + points
          }));
          
          setMultiplier(prev => Math.min(prev + 1, 5));
          setFlippedCards([]);
          setIsProcessing(false);
          
          const matchedCount = cards.filter(c => c.isMatched).length + 2;
          if (matchedCount === cards.length) {
            const finalP1 = turn === 1 ? scores.p1 + points : scores.p1;
            const finalP2 = turn === 2 ? scores.p2 + points : scores.p2;
            
            let winResult: 1 | 2 | 'draw' = 'draw';
            if (finalP1 > finalP2) winResult = 1;
            else if (finalP2 > finalP1) winResult = 2;
            
            setWinner(winResult);
            playSound('win');
            confetti({ particleCount: 200, spread: 80, origin: { y: 0.5 } });
            if (onWin) onWin(finalP1 * 100);
          }
        }, 800);
      } else {
        setTimeout(() => {
          playSound('wrong');
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedCards([]);
          setTurn(turn === 1 ? 2 : 1);
          setIsProcessing(false);
          setMultiplier(1);
        }, 1200);
      }
    }
  };

  const nextLevel = () => {
    if (currentLevel < 5) {
      setCurrentLevel(prev => prev + 1);
    } else {
      initGame(1);
      setCurrentLevel(1);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0f172a] to-[#064e3b] flex flex-col items-center justify-center overflow-hidden font-sans select-none z-[200]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm" />
        <motion.div 
          animate={{ 
            x: mousePos.x,
            y: mousePos.y,
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,188,150,0.1)_0%,transparent_70%)]" 
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30" />
      </div>

      {/* Floating Back Button */}
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        whileHover={{ scale: 1.1, x: 5 }}
        className="absolute top-8 left-8 z-[250] w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all border border-white/10"
      >
        <ArrowLeft size={28} />
      </motion.button>

      {/* Header / Scoreboard */}
      <div className="relative z-10 w-full max-w-6xl px-12 mb-12 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-1"
        >
          <h1 className="text-6xl font-serif font-bold text-[#d4bc96] tracking-tight drop-shadow-2xl">
            {lang === 'ar' ? 'ميمورا' : 'Memora'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-[#d4bc96]/30" />
            <p className="text-[12px] uppercase tracking-[0.5em] text-[#d4bc96]/60 font-black">
              {LEVELS_DATA[currentLevel - 1].title[lang]}
            </p>
          </div>
        </motion.div>

        <div className="flex items-center gap-12 bg-black/20 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <div className={`flex items-center gap-4 transition-all duration-500 ${turn === 1 ? 'scale-110' : 'opacity-40'}`}>
            <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center ${turn === 1 ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'border-white/10'}`}>
              <User size={28} className={turn === 1 ? 'text-amber-500' : 'text-white/40'} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{lang === 'ar' ? 'اللاعب 1' : 'Player 1'}</span>
              <span className="text-3xl font-serif font-bold text-white leading-none">{scores.p1}</span>
            </div>
          </div>

          <div className="h-12 w-px bg-white/10" />

          <div className={`flex items-center gap-4 transition-all duration-500 ${turn === 2 ? 'scale-110' : 'opacity-40'}`}>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{lang === 'ar' ? 'اللاعب 2' : 'Player 2'}</span>
              <span className="text-3xl font-serif font-bold text-white leading-none">{scores.p2}</span>
            </div>
            <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center ${turn === 2 ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'border-white/10'}`}>
              <Users size={28} className={turn === 2 ? 'text-blue-500' : 'text-white/40'} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center mr-4">
            <span className="text-[10px] font-black text-[#d4bc96]/60 uppercase tracking-widest mb-1">Multiplier</span>
            <div className="flex items-center gap-1 text-amber-500 font-black text-xl">
              <Zap size={16} />
              x{multiplier}
            </div>
          </div>
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title={lang === 'ar' ? 'تفعيل/تعطيل النطق' : 'Toggle Voice'}
            className={`w-14 h-14 rounded-2xl border transition-all flex items-center justify-center ${voiceEnabled ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-white/40'}`}
          >
            <Brain size={24} />
          </button>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center"
          >
            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
          <button 
            onClick={() => initGame(currentLevel)}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      {/* Game Grid */}
      <div className="relative z-10 w-full max-w-7xl px-12">
        <motion.div 
          key={currentLevel}
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            rotateX: mousePos.y * 0.1,
            rotateY: mousePos.x * 0.1,
          }}
          className="grid grid-cols-4 lg:grid-cols-8 gap-6 perspective-[2000px]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <CardComponent 
                card={card} 
                onClick={() => handleCardClick(card.id)}
                disabled={isProcessing}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 mt-16 flex items-center gap-16 text-[#d4bc96]/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#d4bc96]/10 flex items-center justify-center">
            <Languages size={18} />
          </div>
          <span className="text-[12px] font-black uppercase tracking-[0.2em]">
            {lang === 'ar' ? 'عربي - إنجليزي' : 'Arabic - English'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#d4bc96]/10 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <span className="text-[12px] font-black uppercase tracking-[0.2em]">
            {lang === 'ar' ? 'تطابق المعاني' : 'Meaning Match'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#d4bc96]/10 flex items-center justify-center">
            <Award size={18} />
          </div>
          <span className="text-[12px] font-black uppercase tracking-[0.2em]">
            {lang === 'ar' ? `المستوى ${currentLevel}` : `Level ${currentLevel}`}
          </span>
        </div>
      </div>

      {/* Winner Modal */}
      <AnimatePresence>
        {winner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative w-full max-w-lg bg-[#1a1a1a] border border-[#d4bc96]/30 rounded-[3rem] p-12 text-center shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/gold-scale.png')] opacity-5" />
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-[#d4bc96]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#d4bc96]/20">
                  <Trophy size={48} className="text-[#d4bc96]" />
                </div>

                <h2 className="text-4xl font-serif font-bold text-white mb-2">
                  {winner === 'draw' 
                    ? (lang === 'ar' ? 'تعادل!' : 'It\'s a Draw!')
                    : (lang === 'ar' ? `فوز اللاعب ${winner}!` : `Player ${winner} Wins!`)}
                </h2>
                
                <p className="text-[#d4bc96]/60 font-serif italic mb-12">
                  {lang === 'ar' ? 'لقد أظهرتم حكمة وذاكرة استثنائية' : 'You have shown exceptional wisdom and memory'}
                </p>

                <div className="flex flex-col gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={nextLevel}
                    className="w-full py-4 bg-[#d4bc96] text-[#1a1a1a] font-bold rounded-xl shadow-xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                  >
                    <Star size={18} />
                    {currentLevel < 5 
                      ? (lang === 'ar' ? 'المستوى التالي' : 'Next Level')
                      : (lang === 'ar' ? 'إعادة التحدي' : 'Restart Challenge')}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onBack}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                  >
                    <Home size={18} />
                    {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS for 3D */}
      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
};

export default MemoryMatch;
