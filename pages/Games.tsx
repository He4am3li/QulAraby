import React from 'react';
import { 
  Gamepad2, Trophy, Star, RefreshCcw, 
  ArrowRight, ArrowLeft, CheckCircle2, XCircle, 
  Sparkles, Brain, Zap, Target,
  Volume2, MousePointer2, LayoutList, Type as TypeIcon,
  CheckCircle, Timer, Award, Lock, 
  Flame, Ghost, Search, BookOpen, Music, 
  Image as ImageIcon, Puzzle, Rocket, Globe,
  Heart, Zap as ZapIcon, Shield, Coins,
  Check, X, HelpCircle, Dice5, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { generateSpeech, decodeAudioData } from '../services/gemini';
import { SnakesAndLadders } from '../components/games/SnakesAndLadders';
import { VocabRace } from '../components/games/VocabRace';
import { ArabicAngler } from '../components/games/ArabicAngler';
import { WordHunt } from '../components/games/WordHunt';
import { GrammarHero } from '../components/games/GrammarHero';
import { SyntaxSoccer } from '../components/games/SyntaxSoccer';
import { ChessPro } from '../components/games/ChessPro';
import { CandyQuest } from '../components/games/CandyQuest';
import { PenaltyShootout } from '../components/games/PenaltyShootout';
import { MemoryMatch } from '../components/games/MemoryMatch';
import { useAuth } from '../components/AuthProvider';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { Vocabulary } from '../types';

// --- Types ---

const SnakeLadderIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4V20M18 4V20M6 8H18M6 12H18M6 16H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 18C14 18 16 16 16 14C16 12 12 12 12 10C12 8 14 6 14 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

interface GameDef {
  id: string;
  category: string;
  categoryAr: string;
  categoryEn: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  detailsAr: string;
  detailsEn: string;
  samples: { ar: string, en: string }[];
  cover: string;
  hero: string;
  color: string;
  icon: React.ReactNode;
  locked?: boolean;
}

// --- Enhanced Game Data ---
const CONSOLE_GAMES: GameDef[] = [
  { 
    id: 'chess-pro', 
    category: 'strategy',
    categoryAr: 'استراتيجية',
    categoryEn: 'Strategy',
    titleAr: 'الشطرنج', 
    titleEn: 'Chess',
    descriptionAr: 'تجربة شطرنج سينمائية بمستوى ألعاب الكونسول؛ واجه صديقك.',
    descriptionEn: 'A cinematic chess experience at console level; face your friend.',
    detailsAr: 'لعبة الذكاء الكلاسيكية. حرك قطعك بحكمة وحاول محاصرة ملك الخصم.',
    detailsEn: 'The classic game of intelligence. Move your pieces wisely and try to trap the opponent\'s king.',
    samples: [],
    cover: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=1000&auto=format&fit=crop',
    hero: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=2000&auto=format&fit=crop',
    color: 'from-amber-600 to-yellow-900',
    icon: <Trophy size={32} />
  },
  { 
    id: 'candy-quest', 
    category: 'puzzles',
    categoryAr: 'الألغاز',
    categoryEn: 'Puzzles',
    titleAr: 'كاندي كويست', 
    titleEn: 'Candy Quest',
    descriptionAr: 'لعبة مطابقة الحلوى المبتكرة؛ طابق القطع وأجب على الأسئلة لتطوير مستواك المعرفي.',
    descriptionEn: 'Innovative candy matching game; match pieces and answer questions to grow your knowledge.',
    detailsAr: 'طابق قطع الحلوى الملونة. كل مطابقة ناجحة تمنحك سؤالاً لغوياً، أجب عليه لزيادة نقاطك.',
    detailsEn: 'Match colorful candy pieces. Every successful match gives you a linguistic question, answer it to increase your points.',
    samples: [],
    cover: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?q=80&w=1000&auto=format&fit=crop',
    hero: 'https://images.unsplash.com/photo-1553484771-047a44eee27b?q=80&w=2000&auto=format&fit=crop',
    color: 'from-purple-500 to-amber-500',
    icon: <Sparkles size={32} />
  },
  { 
    id: 'snakes-ladders', 
    category: 'puzzles',
    categoryAr: 'الألغاز',
    categoryEn: 'Puzzles',
    titleAr: 'السلم والثعبان', 
    titleEn: 'Snakes & Ladders',
    descriptionAr: 'لعبة الألغاز الكلاسيكية مطورة بتحديات لغوية مذهلة.',
    descriptionEn: 'Classic puzzle game enhanced with amazing linguistic challenges.',
    detailsAr: 'تحرك في اللوحة، اصعد السلالم وتجنب الثعابين. للإجابة على الأسئلة التعليمية، ستحتاج لاختيار الكلمة الصحيحة للتقدم.',
    detailsEn: 'Move across the board, climb ladders and avoid snakes. To answer educational questions, you will need to choose the correct word to advance.',
    samples: [],
    cover: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=1000&auto=format&fit=crop',
    hero: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2000&auto=format&fit=crop',
    color: 'from-emerald-500 to-teal-700',
    icon: <SnakeLadderIcon size={32} />
  },
  { 
    id: 'penalty-shootout', 
    category: 'sports',
    categoryAr: 'الرياضة',
    categoryEn: 'Sports',
    titleAr: 'ركلات الترجيح', 
    titleEn: 'Penalty Shootout',
    descriptionAr: 'تجربة ركلات ترجيح واقعية بنمط ألعاب الكونسول؛ سدد وتصدَّ للكرات باحترافية.',
    descriptionEn: 'Realistic console-style penalty shootout; shoot and save like a pro.',
    detailsAr: 'تحدي ركلات الترجيح. اختر زاوية التسديد بدقة، ثم حاول التصدي لركلات الخصم كحارس مرمى.',
    detailsEn: 'Penalty shootout challenge. Choose the shooting angle accurately, then try to block the opponent\'s kicks as a goalkeeper.',
    samples: [],
    cover: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop',
    hero: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2000&auto=format&fit=crop',
    color: 'from-blue-600 to-indigo-900',
    icon: <Trophy size={32} />
  },
  { 
    id: 'memory-match', 
    category: 'puzzles',
    categoryAr: 'الألغاز',
    categoryEn: 'Puzzles',
    titleAr: 'ميمورا', 
    titleEn: 'Memora',
    descriptionAr: 'تحدي الذاكرة الثنائي؛ طابق الكلمات بمعانيها في تجربة سينمائية.',
    descriptionEn: 'Dual memory challenge; match words with their meanings in a cinematic experience.',
    detailsAr: 'اقلب الكروت وحاول مطابقة الكلمة العربية بترجمتها الإنجليزية. تحدَّ صديقك في اختبار للذاكرة والسرعة.',
    detailsEn: 'Flip the cards and try to match the Arabic word with its English translation. Challenge your friend in a test of memory and speed.',
    samples: [],
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop',
    hero: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop',
    color: 'from-amber-900 to-black',
    icon: <Brain size={32} />
  }
];

const LoadingScreen: React.FC<{ lang: string, onComplete: () => void }> = ({ lang, onComplete }) => {
  const [progress, setProgress] = React.useState(0);
  const tips = [
    lang === 'ar' ? 'نصيحة: مراجعة الكلمات يومياً تزيد من سرعة حفظك بنسبة 40%.' : 'Tip: Reviewing words daily increases your retention by 40%.',
    lang === 'ar' ? 'نصيحة: حاول نطق الكلمات بصوت عالٍ أثناء اللعب.' : 'Tip: Try pronouncing words out loud while playing.',
    lang === 'ar' ? 'نصيحة: الأخطاء هي طريقك للتعلم، لا تخف منها!' : 'Tip: Mistakes are your path to learning, don\'t fear them!'
  ];
  const [tipIdx] = React.useState(Math.floor(Math.random() * tips.length));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-[200] bg-gradient-to-b from-[#0f172a] to-[#064e3b] flex flex-col items-center justify-center p-12"
    >
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-white font-black text-2xl tracking-tighter uppercase italic">Loading Experience...</h2>
            <p className="text-blue-400 font-bold text-sm animate-pulse">{lang === 'ar' ? 'جاري تهيئة عالم اللعبة...' : 'Initializing game world...'}</p>
          </div>
          <span className="text-white font-black text-4xl italic">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" style={{ width: `${progress}%` }} />
        </div>
        <div className="pt-12 border-t border-white/10">
          <p className="text-slate-400 text-center italic text-sm font-medium leading-relaxed">
            {tips[tipIdx]}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = React.useState(0);

  React.useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1000), // Logo
      setTimeout(() => setStage(2), 3000), // Glow
      setTimeout(() => onComplete(), 4500), // Finish
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="absolute inset-0 z-[300] bg-gradient-to-b from-[#0f172a] to-[#064e3b] flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === 1 && (
          <motion.div 
            key="logo"
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)]">
              <Gamepad2 size={48} className="text-black" />
            </div>
            <h1 className="text-white text-6xl font-black tracking-tighter italic">QUL <span className="text-blue-500">OS</span></h1>
            <div className="flex gap-1">
               {[...Array(3)].map((_, i) => (
                 <motion.div 
                   key={i}
                   animate={{ opacity: [0.2, 1, 0.2] }}
                   transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                   className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                 />
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-10 text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">System Version 2.0.4 • 2026</div>
    </div>
  );
};


const DetailsModal: React.FC<{ game: GameDef, lang: 'ar' | 'en', onClose: () => void }> = ({ game, lang, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
        className="bg-[#1a1a1a] border border-white/10 rounded-[3rem] p-12 max-w-2xl w-full relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
        
        <div className="flex items-center gap-6 mb-8">
          <div className={`w-20 h-20 bg-gradient-to-br ${game.color} rounded-3xl flex items-center justify-center shadow-2xl`}>
            {game.icon}
          </div>
          <div>
            <h3 className="text-white text-4xl font-black tracking-tighter italic uppercase">
              {lang === 'ar' ? game.titleAr : game.titleEn}
            </h3>
            <p className="text-blue-400 font-black text-xs uppercase tracking-widest">
              {lang === 'ar' ? game.categoryAr : game.categoryEn}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
              {lang === 'ar' ? 'طريقة اللعب' : 'How to Play'}
            </h4>
            <p className="text-white/80 text-xl font-bold leading-relaxed">
              {lang === 'ar' ? game.detailsAr : game.detailsEn}
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="mt-12 w-full bg-white text-black py-5 rounded-2xl font-black text-xl hover:bg-blue-500 hover:text-white transition-all shadow-xl"
        >
          {lang === 'ar' ? 'فهمت، لنبدأ!' : 'Got it, let\'s play!'}
        </button>
      </motion.div>
    </motion.div>
  );
};


// --- Constants ---

export const Games: React.FC = () => {
  const { user } = useAuth();
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  React.useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  
  const [isBooting, setIsBooting] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeGame, setActiveGame] = React.useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [level, setLevel] = React.useState(1);
  const [vocabWords, setVocabWords] = React.useState<Vocabulary[]>([]);
  const [loadingVocab, setLoadingVocab] = React.useState(false);
  const [isWon, setIsWon] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);

  React.useEffect(() => {
    if (user) fetchVocab();
  }, [user]);

  const fetchVocab = async () => {
    if (!user) return;
    setLoadingVocab(true);
    try {
      const vocabRef = collection(db, 'users', user.uid, 'vocabulary');
      const q = query(vocabRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setVocabWords(querySnapshot.docs.map(doc => doc.data() as Vocabulary));
    } catch (err) { console.error(err); }
    finally { setLoadingVocab(false); }
  };

  const playSound = (type: 'nav' | 'select' | 'boot') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'nav') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'select') {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {}
  };

  const handleGameSelect = (id: string) => {
    if (CONSOLE_GAMES.find(g => g.id === id)?.locked) return;
    playSound('select');
    setIsLoading(true);
  };

  const t = {
    title: lang === 'ar' ? 'منصة الألعاب' : 'QUL Console',
    back: lang === 'ar' ? 'عودة' : 'Back',
    score: lang === 'ar' ? 'النقاط' : 'Score',
    level: lang === 'ar' ? 'المستوى' : 'Level',
    start: lang === 'ar' ? 'اضغط (X) للبدء' : 'Press (X) to Start',
    congrats: lang === 'ar' ? 'أنت بطل!' : 'You are a Champion!',
  };

  return (
    <div className="w-full h-full bg-black overflow-hidden relative">
      
      <AnimatePresence>
        {isBooting && <BootSequence onComplete={() => setIsBooting(false)} />}
        {isLoading && <LoadingScreen lang={lang} onComplete={() => { setIsLoading(false); setActiveGame(CONSOLE_GAMES[selectedIdx].id); }} />}
        {showDetails && <DetailsModal game={CONSOLE_GAMES[selectedIdx]} lang={lang} onClose={() => setShowDetails(false)} />}
      </AnimatePresence>

      {/* Console Dashboard */}
      {!activeGame && !isBooting && (
        <div className="h-full flex flex-col bg-black relative overflow-hidden">
          {/* Dynamic Hero Background */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={CONSOLE_GAMES[selectedIdx].id}
              initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              animate={{ opacity: 0.5, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-0"
            >
              <motion.img 
                src={CONSOLE_GAMES[selectedIdx].hero} 
                className="w-full h-full object-cover scale-105" 
                alt=""
                animate={{ scale: 1.1 }}
                transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
              {/* Cinematic Vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
              {/* Color accent */}
              <div className={`absolute inset-0 bg-gradient-to-tr ${CONSOLE_GAMES[selectedIdx].color} opacity-20 mix-blend-color-dodge`} />
            </motion.div>
          </AnimatePresence>

      {/* System Top Bar - Unified */}
      <PageHeader
        title="QUL OS"
        icon={Gamepad2}
        lang={lang}
        onToggle={toggleLang}
      />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-end pb-12 relative z-10">
            {/* Hero Info */}
            <div className="px-12 mb-12 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={`info-${selectedIdx}`}
                className="space-y-2"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                    {lang === 'ar' ? CONSOLE_GAMES[selectedIdx].categoryAr : CONSOLE_GAMES[selectedIdx].categoryEn}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                  </div>
                </div>
                <h2 className="text-white text-5xl font-black tracking-tighter italic uppercase leading-none">
                  {lang === 'ar' ? CONSOLE_GAMES[selectedIdx].titleAr : CONSOLE_GAMES[selectedIdx].titleEn}
                </h2>
              </motion.div>

              <div className="flex items-center gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGameSelect(CONSOLE_GAMES[selectedIdx].id)}
                  className="bg-white text-black px-10 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-blue-500 hover:text-white transition-all"
                >
                  <Rocket size={24} />
                  {lang === 'ar' ? 'العب الآن' : 'Play Now'}
                </motion.button>
                <button 
                  onClick={() => setShowDetails(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-black text-lg backdrop-blur-md border border-white/10 transition-all"
                >
                  {lang === 'ar' ? 'التفاصيل' : 'Details'}
                </button>
              </div>
            </div>

            {/* Game Shelf */}
            <div className="relative">
              <div className="flex gap-6 px-12 overflow-x-auto no-scrollbar pb-8 pt-4">
                {CONSOLE_GAMES.map((game, idx) => (
                  <motion.button
                    key={game.id}
                    onMouseEnter={() => { setSelectedIdx(idx); playSound('nav'); }}
                    onClick={() => { setSelectedIdx(idx); handleGameSelect(game.id); }}
                    whileHover={{ y: -10 }}
                    className={`relative shrink-0 w-48 h-64 rounded-[1.5rem] overflow-hidden border-4 transition-all duration-500 group
                      ${selectedIdx === idx ? 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)] scale-105 z-20' : 'border-white/10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}
                    `}
                  >
                    <img src={game.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 left-4 right-4 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-black text-xs truncate">{lang === 'ar' ? game.titleAr : game.titleEn}</p>
                    </div>
                    {game.locked && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                        <Lock size={32} className="text-white/40" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Navigation Bar */}
          <div className="px-12 py-6 flex items-center justify-between border-t border-white/5 bg-black/40 backdrop-blur-xl relative z-20">
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-black text-[10px] shadow-lg shadow-blue-500/40">X</div>
                <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{lang === 'ar' ? 'اختيار' : 'Select'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-[10px]">O</div>
                <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{lang === 'ar' ? 'رجوع' : 'Back'}</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <Trophy size={14} className="text-amber-500" />
                <span className="text-white font-black text-xs">{score} XP</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <Coins size={14} className="text-yellow-400" />
                <span className="text-white font-black text-xs">1,250</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Game View */}
      {activeGame && (
        <div className="fixed inset-0 z-[200] bg-[#020617] flex flex-col">
          {/* Floating Back Button */}
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setActiveGame(null)}
            whileHover={{ scale: 1.1, x: 5 }}
            className="absolute top-6 left-6 z-[150] w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all border border-white/10"
          >
            <ArrowLeft size={24} />
          </motion.button>

          <div className="flex-1 relative">
            {activeGame === 'snakes-ladders' && (
              <SnakesAndLadders 
                onWin={() => {
                  setIsWon(true);
                  setScore(s => s + 100);
                  confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                }} 
                lang={lang} 
                customVocab={vocabWords}
              />
            )}
            {activeGame === 'vocab-race' && (
              <VocabRace 
                onWin={(xp) => setScore(s => s + xp)}
                lang={lang}
                customVocab={vocabWords}
              />
            )}
            {activeGame === 'arabic-angler' && (
              <ArabicAngler 
                onWin={(xp) => setScore(s => s + xp)}
                lang={lang}
                customVocab={vocabWords}
              />
            )}
            {activeGame === 'word-hunt' && (
              <WordHunt 
                onWin={(xp) => setScore(s => s + xp)}
                lang={lang}
                customVocab={vocabWords}
              />
            )}
            {activeGame === 'grammar-hero' && (
              <GrammarHero 
                onWin={(xp) => setScore(s => s + xp)}
                lang={lang}
                customVocab={vocabWords}
              />
            )}
            {activeGame === 'syntax-soccer' && (
              <SyntaxSoccer 
                onWin={(xp) => setScore(s => s + xp)}
                lang={lang}
                customVocab={vocabWords}
              />
            )}
            {activeGame === 'chess-pro' && (
              <ChessPro onBack={() => setActiveGame(null)} />
            )}
            {activeGame === 'candy-quest' && (
              <CandyQuest onBack={() => setActiveGame(null)} />
            )}
            {activeGame === 'penalty-shootout' && (
              <PenaltyShootout onBack={() => setActiveGame(null)} />
            )}
            {activeGame === 'memory-match' && (
              <MemoryMatch 
                onWin={(xp) => setScore(s => s + xp)}
                onBack={() => setActiveGame(null)}
                lang={lang}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components for new games ---



export default Games;
