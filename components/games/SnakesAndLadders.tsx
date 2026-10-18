import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Trophy, User, Monitor, Users, Play, RotateCcw, Languages, Home,
  CheckCircle2, XCircle, RefreshCcw, ArrowRight, Settings, Volume2, VolumeX,
  ChevronLeft, Heart, Coins, Gift, Wrench, Gamepad2, Sparkles, Zap, Shield, Sword
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Vocabulary } from '../../types';

// --- Types ---
interface Question {
  q: string;
  options: string[];
  correct: number;
  level?: 'easy' | 'medium' | 'hard';
}

interface SnakesAndLaddersProps {
  onWin: (score: number) => void;
  lang: 'ar' | 'en';
  customVocab?: Vocabulary[];
}

// --- Constants (مرتبة بدقة لتجنب التداخل) ---
const SNAKES_CONFIG = [
  { start: 99, end: 54, color: '#4a3728' }, // ثعبان طويل قرب النهاية
  { start: 95, end: 72, color: '#4a3728' },
  { start: 87, end: 36, color: '#4a3728' }, // ثعبان خطير جداً
  { start: 62, end: 19, color: '#4a3728' }, // هبوط حاد
  { start: 48, end: 26, color: '#4a3728' },
  { start: 16, end: 6, color: '#4a3728' }   // ثعبان صغير في البداية
];

const LADDERS_CONFIG = [
  { start: 2, end: 38, color: '#4a3728' },  // سلم طويل للبداية السريعة
  { start: 7, end: 14, color: '#4a3728' },
  { start: 15, end: 45, color: '#4a3728' }, // قفزة متوسطة
  { start: 28, end: 84, color: '#4a3728' }, // سلم ذهبي كبير
  { start: 51, end: 67, color: '#4a3728' },
  { start: 71, end: 91, color: '#4a3728' }, // قرب النهاية
  { start: 78, end: 98, color: '#4a3728' }  // الخطوة قبل الأخيرة
];

const QUESTIONS_AR: Question[] = [
  { q: "ما هو جمع 'قلم'؟", options: ["أقلام", "قلمات", "قلام", "تقليم"], correct: 0, level: 'easy' },
  { q: "ما عكس 'النهار'؟", options: ["الليل", "الصبح", "المساء", "الضحى"], correct: 0, level: 'easy' },
  { q: "اختر الفعل الماضي:", options: ["ذهب", "يذهب", "اذهب", "ذاهب"], correct: 0, level: 'medium' },
  { q: "ما معنى 'الصبر مفتاح الفرج'؟", options: ["التفاؤل", "اليأس", "العجلة", "الكسل"], correct: 0, level: 'hard' },
  { q: "ما هي لغة القران الكريم؟", options: ["العربية", "الإنجليزية", "الفرنسية", "الفارسية"], correct: 0, level: 'easy' },
  { q: "كم عدد أركان الإسلام؟", options: ["5", "4", "3", "6"], correct: 0, level: 'easy' },
  { q: "ما هو المثنى من كلمة 'كتاب'؟", options: ["كتابان", "كتب", "مكاتب", "كتيبات"], correct: 0, level: 'medium' },
  { q: "أي كلمة تبدأ بـ 'لام شمسية'؟", options: ["الشمس", "القمر", "الولد", "البنت"], correct: 0, level: 'medium' },
  { q: "ما هو نوع الفعل في كلمة 'اكتب'؟", options: ["أمر", "ماضٍ", "مضارع", "مستقبل"], correct: 0, level: 'medium' },
  { q: "أي كلمة تحتوي على 'تاء مربوطة'؟", options: ["مدرسة", "بيت", "بنت", "حوت"], correct: 0, level: 'hard' }
];

const QUESTIONS_EN: Question[] = [
  { q: "What is the plural of 'Book'?", options: ["Books", "Bookes", "Library", "Bookies"], correct: 0, level: 'easy' },
  { q: "What is the opposite of 'Big'?", options: ["Small", "Long", "Wide", "Beautiful"], correct: 0, level: 'easy' },
  { q: "Which word is a 'Noun'?", options: ["Apple", "Run", "Happy", "Quickly"], correct: 0, level: 'medium' },
  { q: "What is the past tense of 'Eat'?", options: ["Ate", "Eated", "Eating", "Eats"], correct: 0, level: 'medium' },
  { q: "What is the synonym of 'Happy'?", options: ["Glad", "Sad", "Angry", "Tired"], correct: 0, level: 'medium' },
  { q: "Which of these is a 'Vowel'?", options: ["E", "B", "C", "D"], correct: 0, level: 'easy' },
  { q: "Pick the correct spelling:", options: ["Receive", "Recieve", "Receve", "Recive"], correct: 0, level: 'hard' },
  { q: "What is the plural of 'Child'?", options: ["Children", "Childs", "Childrens", "Childes"], correct: 0, level: 'hard' },
  { q: "What type of word is 'Quickly'?", options: ["Adverb", "Noun", "Verb", "Pronoun"], correct: 0, level: 'hard' },
  { q: "What is the opposite of 'Hot'?", options: ["Cold", "Warm", "Dry", "Wet"], correct: 0, level: 'easy' }
];

const gameRules: Record<number, number> = {
  ...SNAKES_CONFIG.reduce((acc, s) => ({ ...acc, [s.start]: s.end }), {}),
  ...LADDERS_CONFIG.reduce((acc, l) => ({ ...acc, [l.start]: l.end }), {})
};

// --- Sub-Components ---

const GamePawn: React.FC<{ type: 'player' | 'cpu' | 'p2'; position: number; isActive: boolean }> = ({ type, position, isActive }) => {
  const getIcon = () => {
    switch (type) {
      case 'player': return <User size={24} className="text-[#4a3728]" />;
      case 'cpu': return <Monitor size={24} className="text-[#4a3728]" />;
      case 'p2': return <Users size={24} className="text-[#4a3728]" />;
    }
  };

  return (
    <motion.div
      key={position}
      layoutId={`${type}-pawn`}
      className="relative w-12 h-12 flex items-center justify-center z-50"
      initial={false}
      transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.8 }}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 bg-[#4a3728]/10 rounded-full blur-[10px] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          y: isActive ? [0, -8, 0] : 0,
          rotate: isActive ? [0, 5, -5, 0] : 0,
        }}
        transition={{
          y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
        }}
        className="relative w-10 h-10 rounded-full border-2 border-[#4a3728]/30 shadow-lg flex items-center justify-center overflow-hidden"
        style={{ 
          backgroundColor: '#e5d3b3',
          backgroundImage: 'url(https://www.transparenttextures.com/patterns/wood-pattern.png)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.3)'
        }}
      >
        <div className="opacity-60">{getIcon()}</div>
        <div className="absolute inset-1 border border-[#4a3728]/20 rounded-full pointer-events-none" />
      </motion.div>
      
      <motion.div 
        animate={{ scale: isActive ? [1, 0.8, 1] : 1, opacity: isActive ? [0.3, 0.1, 0.3] : 0.3 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        className="absolute -bottom-1 w-8 h-2 bg-black/40 rounded-full blur-[2px]" 
      />
    </motion.div>
  );
};

const Dice3D: React.FC<{ value: number; isRolling: boolean }> = ({ value, isRolling }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let interval: any;
    if (isRolling) {
      interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 50);
    } else {
      setDisplayValue(value);
    }
    return () => clearInterval(interval);
  }, [isRolling, value]);

  const getRotation = (val: number) => {
    switch (val) {
      case 1: return "rotateX(0deg) rotateY(0deg)";
      case 6: return "rotateX(0deg) rotateY(180deg)";
      case 3: return "rotateX(0deg) rotateY(-90deg)";
      case 4: return "rotateX(0deg) rotateY(90deg)";
      case 2: return "rotateX(-90deg) rotateY(0deg)";
      case 5: return "rotateX(90deg) rotateY(0deg)";
      default: return "rotateX(0deg) rotateY(0deg)";
    }
  };

  const renderDots = (dots: number) => {
    const dotPositions: Record<number, string[]> = {
      1: ['top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'],
      2: ['top-2 right-2', 'bottom-2 left-2'],
      3: ['top-2 right-2', 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', 'bottom-2 left-2'],
      4: ['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'],
      5: ['top-2 left-2', 'top-2 right-2', 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', 'bottom-2 left-2', 'bottom-2 right-2'],
      6: ['top-2 left-2', 'top-2 right-2', 'top-1/2 left-2 -translate-y-1/2', 'top-1/2 right-2 -translate-y-1/2', 'bottom-2 left-2', 'bottom-2 right-2'],
    };

    return (
      <div className="relative w-full h-full p-2">
        {dotPositions[dots].map((pos, idx) => (
          <div 
            key={idx} 
            className={`absolute w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)] ${pos}`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .dice-container {
            display: flex;
            justify-content: center;
            align-items: center;
            perspective: 800px;
            width: 44px;
            height: 44px;
        }

        .box-card {
            width: 100%;
            height: 100%;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
        }

        .box-card.is-rolling {
            animation: dice-rotate3d 0.2s infinite linear;
        }

        .face {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 8px;
            background: linear-gradient(145deg, #1e293b, #020617);
            border: 2px solid rgba(255, 255, 255, 0.4);
            box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
        }

        /* 3D Sides Construction */
        .face.front  { transform: rotateY(0deg) translateZ(22px); }
        .face.back   { transform: rotateY(180deg) translateZ(22px); }
        .face.right  { transform: rotateY(90deg) translateZ(22px); }
        .face.left   { transform: rotateY(-90deg) translateZ(22px); }
        .face.top    { transform: rotateX(90deg) translateZ(22px); }
        .face.bottom { transform: rotateX(-90deg) translateZ(22px); }

        @keyframes dice-rotate3d {
            0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
            100% { transform: rotateX(360deg) rotateY(720deg) rotateZ(360deg); }
        }
      ` }} />
      <div className="dice-container">
        <div 
          className={`box-card ${isRolling ? 'is-rolling' : ''}`}
          style={{ 
            transform: isRolling ? undefined : getRotation(displayValue)
          }}
        >
          <div className="face front">{renderDots(1)}</div>
          <div className="face back">{renderDots(6)}</div>
          <div className="face right">{renderDots(3)}</div>
          <div className="face left">{renderDots(4)}</div>
          <div className="face top">{renderDots(2)}</div>
          <div className="face bottom">{renderDots(5)}</div>
        </div>
      </div>
    </>
  );
};

// --- Main Component ---

export const SnakesAndLadders: React.FC<SnakesAndLaddersProps> = ({ onWin, lang, customVocab }) => {
  const [currentLang, setCurrentLang] = useState<'ar' | 'en'>(lang);
  const [customQuestions, setCustomQuestions] = useState<Question[] | null>(null);
  const [player1Pos, setPlayer1Pos] = useState(1);
  const [player2Pos, setPlayer2Pos] = useState(1);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [dicePosition, setDicePosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [gameMode, setGameMode] = useState<'pvc' | 'pvp'>('pvc');
  const [gameStarted, setGameStarted] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [pendingMove, setPendingMove] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isShaking, setIsShaking] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 });
  const rotateX = useTransform(springY, [-500, 500], [5, -5]);
  const rotateY = useTransform(springX, [-500, 500], [-5, 5]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const t = {
    title: currentLang === 'ar' ? 'لعبة السلم والثعبان' : 'Snakes & Ladders',
    pvc: currentLang === 'ar' ? 'ضد الكمبيوتر' : 'Vs Computer',
    pvp: currentLang === 'ar' ? 'لاعب ضد لاعب' : 'Player Vs Player',
    p1: currentLang === 'ar' ? 'اللاعب 1' : 'Player 1',
    p2: currentLang === 'ar' ? 'اللاعب 2' : 'Player 2',
    cpu: currentLang === 'ar' ? 'الكمبيوتر' : 'Computer',
    rollDice: currentLang === 'ar' ? 'ارمي النرد' : 'Roll Dice',
    winTitle: currentLang === 'ar' ? 'مبروك الفوز!' : 'You Win!',
    playAgain: currentLang === 'ar' ? 'لعب مرة أخرى' : 'Play Again',
    mode: currentLang === 'ar' ? 'الوضع' : 'Mode',
    reset: currentLang === 'ar' ? 'إعادة المباراة' : 'Reset Match',
    start: currentLang === 'ar' ? 'ابدأ اللعب' : 'Start Game'
  };

  useEffect(() => {
    if (customVocab && customVocab.length >= 4) {
      const qs: Question[] = customVocab.map((v, idx) => {
        const correct = lang === 'ar' ? v.arabic_definition : v.english_definition;
        const otherWords = customVocab.filter((_, i) => i !== idx);
        const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
        const wrongOptions = shuffledOthers.slice(0, 3).map(ow => lang === 'ar' ? ow.arabic_definition : ow.english_definition);
        const optionsSet = new Set([correct, ...wrongOptions]);
        while (optionsSet.size < 4) optionsSet.add(lang === 'ar' ? `خيار إضافي ${optionsSet.size}` : `Extra Option ${optionsSet.size}`);
        const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
        return { q: lang === 'ar' ? `ما معنى كلمة '${v.original_word}'؟` : `What is the meaning of '${v.original_word}'?`, options, correct: options.indexOf(correct) };
      });
      setCustomQuestions(qs);
    }
  }, [customVocab, lang]);

  const QUESTIONS = customQuestions || (currentLang === 'ar' ? QUESTIONS_AR : QUESTIONS_EN);

  const playSound = (type: 'roll' | 'move' | 'snake' | 'ladder' | 'correct' | 'wrong' | 'win') => {
    if (!soundEnabled) return;
    const sounds = {
      roll: 'https://assets.mixkit.co/active_storage/sfx/2016/2016-preview.mp3', // Wood roll/Impact
      move: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Pop/Step
      snake: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3', // Disappointment
      ladder: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Achievement/Sparkle
      correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
      wrong: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
      win: 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3'
    };
    const audio = new Audio(sounds[type]);
    audio.volume = type === 'move' ? 0.2 : 0.5;
    audio.play().catch(() => {});
  };

  const rollDice = () => {
    if (isRolling || winner || activeQuestion || isMoving || !gameStarted) return;
    setIsRolling(true);
    playSound('roll');
    
    // Stable rolling animation
    setDicePosition({ x: -20, y: -20 });
    
    setTimeout(() => {
      const finalVal = Math.floor(Math.random() * 6) + 1;
      setDiceValue(finalVal);
      setIsRolling(false);
      setDicePosition({ x: 0, y: 0 });
      
      // Clear delay to see the number settled
      setTimeout(() => {
        processMove(finalVal);
      }, 700);
    }, 1200);
  };

  const processMove = async (value: number) => {
    const currentPos = turn === 1 ? player1Pos : player2Pos;
    let targetPos = currentPos + value;
    if (targetPos > 100) targetPos = 100;

    // Move step by step to the target position first
    await animateMovement(turn, currentPos, targetPos);
    
    // Check for challenge at the target position
    const specialEnd = gameRules[targetPos];
    if (specialEnd) {
      const isSnake = specialEnd < targetPos;
      
      if (gameMode === 'pvc' && turn === 2) {
        // CPU logic: 70% chance to answer correctly
        const isCorrect = Math.random() > 0.3;
        setTimeout(() => {
          if (isCorrect) {
            if (isSnake) {
              // Survive snake
              playSound('correct');
              setTurn(1);
            } else {
              // Climb ladder
              playSound('ladder');
              animateMovement(2, targetPos, specialEnd);
            }
          } else {
            if (isSnake) {
              // Slide down
              playSound('snake');
              animateMovement(2, targetPos, specialEnd);
            } else {
              // Miss ladder
              playSound('wrong');
              setTurn(1);
            }
          }
        }, 1000);
      } else {
        // Human challenge
        let level: 'easy' | 'medium' | 'hard' = 'easy';
        if (targetPos > 70) level = 'hard'; else if (targetPos > 35) level = 'medium';
        const levelQuestions = QUESTIONS.filter(q => q.level === level || !q.level);
        const randomQ = levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
        
        setPendingMove(specialEnd);
        setActiveQuestion(randomQ);
      }
    } else {
      // No special square, just end turn or win
      if (targetPos === 100) {
        setWinner(turn);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#FACC15', '#22C55E', '#3B82F6'] });
        onWin(1000);
        playSound('win');
      } else {
        setTurn(turn === 1 ? 2 : 1);
      }
    }
  };

  const handleAnswer = async (index: number) => {
    if (!activeQuestion || pendingMove === null) return;
    
    const currentPos = turn === 1 ? player1Pos : player2Pos;
    const isSnake = pendingMove < currentPos;
    
    if (index === activeQuestion.correct) {
      setFeedback('correct');
      playSound('correct');
      setTimeout(async () => {
        setFeedback(null);
        setActiveQuestion(null);
        
        if (!isSnake) {
          // Correct + Ladder = Climb
          playSound('ladder');
          await animateMovement(turn, currentPos, pendingMove);
        }
        // Correct + Snake = Stay (Survive)
        
        if ((turn === 1 ? player1Pos : player2Pos) === 100) {
          setWinner(turn);
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#FACC15', '#22C55E', '#3B82F6'] });
          onWin(1000);
          playSound('win');
        } else {
          setTurn(turn === 1 ? 2 : 1);
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      playSound('wrong');
      setTimeout(async () => {
        setFeedback(null);
        setActiveQuestion(null);
        
        if (isSnake) {
          // Wrong + Snake = Slide down
          playSound('snake');
          await animateMovement(turn, currentPos, pendingMove);
        }
        // Wrong + Ladder = Stay (Miss)
        
        setTurn(turn === 1 ? 2 : 1);
      }, 1500);
    }
  };

  const animateMovement = async (who: 1 | 2, start: number, end: number) => {
    setIsMoving(true);
    let current = start;
    
    if (start < end) {
      while (current < end) {
        current++;
        if (who === 1) setPlayer1Pos(current); else setPlayer2Pos(current);
        playSound('move');
        await new Promise(r => setTimeout(r, 20)); // Even faster steps
      }
    } else {
      while (current > end) {
        current--;
        if (who === 1) setPlayer1Pos(current); else setPlayer2Pos(current);
        playSound('move');
        await new Promise(r => setTimeout(r, 15));
      }
    }
    
    setIsMoving(false);
  };

  useEffect(() => {
    if (gameStarted && gameMode === 'pvc' && turn === 2 && !winner && !isRolling && !activeQuestion && !isMoving) {
      const timer = setTimeout(() => rollDice(), 1500);
      return () => clearTimeout(timer);
    }
  }, [turn, winner, isRolling, activeQuestion, isMoving, gameMode, gameStarted]);

  const getCellCoords = (num: number) => {
    const row = Math.floor((num - 1) / 10);
    const col = (num - 1) % 10;
    const x = row % 2 === 0 ? col : 9 - col;
    const y = 9 - row;
    return { x, y };
  };

  const resetGame = () => {
    setPlayer1Pos(1); setPlayer2Pos(1); setTurn(1); setDiceValue(1); setWinner(null);
    setGameStarted(false); setActiveQuestion(null); setFeedback(null);
  };

  const renderBoard = () => {
    const cells = [];
    for (let r = 9; r >= 0; r--) {
      const isEvenRow = r % 2 === 0;
      for (let c = 0; c < 10; c++) {
        const col = isEvenRow ? c : 9 - c;
        const num = r * 10 + col + 1;
        cells.push(
          <div key={num} className="relative flex items-center justify-center border border-[#4a3728]/20 shadow-[inset_0_0_10px_rgba(0,0,0,0.05)]">
            <span className="text-lg font-serif font-bold text-[#4a3728]/60 select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">{num}</span>
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <div className="flex gap-0.5 scale-90">
                {player1Pos === num && <GamePawn type="player" position={player1Pos} isActive={turn === 1} />}
                {player2Pos === num && <GamePawn type={gameMode === 'pvc' ? 'cpu' : 'p2'} position={player2Pos} isActive={turn === 2} />}
              </div>
            </div>
          </div>
        );
      }
    }
    return (
      <div className="w-full h-full grid grid-cols-10 grid-rows-10 relative rounded-lg overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.4)] border-[12px] border-[#d4bc96]"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?q=80&w=2070&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/5 pointer-events-none mix-blend-multiply" />
        {cells}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 100 100">
          <defs><filter id="engrave" x="-20%" y="-20%" width="140%" height="140%"><feOffset dx="0.2" dy="0.2" result="offset" /><feGaussianBlur in="SourceAlpha" stdDeviation="0.1" result="blur" /><feComposite in="blur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadow" /><feFlood floodColor="black" floodOpacity="0.5" result="color" /><feComposite in="color" in2="shadow" operator="in" result="engrave" /></filter></defs>
          {LADDERS_CONFIG.map((ladder, idx) => {
            const s = getCellCoords(ladder.start); const e = getCellCoords(ladder.end);
            const x1 = s.x * 10 + 5, y1 = s.y * 10 + 5, x2 = e.x * 10 + 5, y2 = e.y * 10 + 5;
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const dist = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
            
            return (
              <g key={`ladder-${idx}`} style={{ filter: 'drop-shadow(0.3px 0.3px 0.3px rgba(255,255,255,0.4))' }}>
                {/* Rails - Thicker for better engraving feel */}
                <line x1={x1 - Math.sin(angle)*1.4} y1={y1 + Math.cos(angle)*1.4} x2={x2 - Math.sin(angle)*1.4} y2={y2 + Math.cos(angle)*1.4} stroke="#4a3728" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                <line x1={x1 + Math.sin(angle)*1.4} y1={y1 - Math.cos(angle)*1.4} x2={x2 + Math.sin(angle)*1.4} y2={y2 - Math.cos(angle)*1.4} stroke="#4a3728" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                {/* Rungs - Dynamic count based on distance */}
                {Array.from({ length: Math.floor(dist / 2.5) }).map((_, i) => {
                  const t = (i + 1) / (Math.floor(dist / 2.5) + 1);
                  const lx = x1 + (x2 - x1) * t, ly = y1 + (y2 - y1) * t;
                  const rx1 = lx - Math.sin(angle) * 1.8, ry1 = ly + Math.cos(angle) * 1.8, rx2 = lx + Math.sin(angle) * 1.8, ry2 = ly - Math.cos(angle) * 1.8;
                  return <line key={i} x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#4a3728" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />;
                })}
              </g>
            );
          })}
          {SNAKES_CONFIG.map((snake: any, idx) => {
            const s = getCellCoords(snake.start); const e = getCellCoords(snake.end);
            const x1 = s.x * 10 + 5, y1 = s.y * 10 + 5, x2 = e.x * 10 + 5, y2 = e.y * 10 + 5;
            const cp1x = x1 + (idx % 2 === 0 ? 10 : -10), cp1y = y1 + (y2 - y1) * 0.3, cp2x = x2 + (idx % 2 === 0 ? -10 : 10), cp2y = y1 + (y2 - y1) * 0.7;
            const path = `M ${x1} ${y1} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x2} ${y2}`;
            const snakeColor = "#4a3728";
            return (
              <g key={`snake-${idx}`} style={{ filter: 'drop-shadow(0.2px 0.2px 0.2px rgba(255,255,255,0.5))' }}>
                <path d={path} fill="none" stroke={snakeColor} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
                <circle cx={x1} cy={y1} r="2" fill={snakeColor} opacity="0.8" />
                <circle cx={x1-0.5} cy={y1-0.5} r="0.4" fill="#e5d3b3" />
                <circle cx={x1+0.5} cy={y1-0.5} r="0.4" fill="#e5d3b3" />
                <path d={path} fill="none" stroke={snakeColor} strokeWidth="0.5" strokeDasharray="0.8,2" opacity="0.4" />
                <path d={`M ${x1} ${y1-2} L ${x1} ${y1-3.5} M ${x1-0.5} ${y1-4} L ${x1} ${y1-3.5} L ${x1+0.5} ${y1-4}`} stroke={snakeColor} strokeWidth="0.3" opacity="0.8" />
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <motion.div animate={isShaking ? { x: [-10, 10, -10, 10, 0], y: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.4 }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f172a] overflow-hidden font-sans select-none" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1580234811497-9bd7fd0f37a9?q=80&w=2067&auto=format&fit=crop" alt="Cinematic Dice" className="w-full h-full object-cover opacity-10 grayscale" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-transparent to-[#064e3b]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />
      </div>

      <div className="absolute left-12 top-12 bottom-12 w-64 flex flex-col gap-4 justify-center pointer-events-none">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] flex flex-col gap-5 shadow-2xl pointer-events-auto min-h-[400px] justify-center">
          <motion.div animate={turn === 1 ? { scale: 1.05, opacity: 1 } : { scale: 0.9, opacity: 0.4 }} className={`relative p-4 rounded-2xl transition-all duration-500 ${turn === 1 ? 'bg-white/10 border border-white/20 shadow-xl' : 'bg-white/5 border border-white/5'}`}>
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-white/20 shadow-xl flex items-center justify-center" style={{ backgroundColor: '#FACC15' }}><User size={32} className="text-amber-900" /></div>
                {turn === 1 && <motion.div layoutId="active-ring" className="absolute -inset-2 border-2 border-amber-500/50 rounded-full animate-ping" />}
              </div>
              <div className="text-center"><p className="text-white/40 text-[8px] font-black uppercase tracking-[0.4em] mb-1">{t.p1}</p><p className="text-white font-mono text-lg font-black tracking-tighter">POS: {player1Pos}</p></div>
            </div>
          </motion.div>
          <div className="h-px bg-white/10 w-1/2 mx-auto" />
          <motion.div animate={turn === 2 ? { scale: 1.05, opacity: 1 } : { scale: 0.9, opacity: 0.4 }} className={`relative p-4 rounded-2xl transition-all duration-500 ${turn === 2 ? 'bg-white/10 border border-white/20 shadow-xl' : 'bg-white/5 border border-white/5'}`}>
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-white/20 shadow-xl flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>{gameMode === 'pvc' ? <Monitor size={32} className="text-slate-900" /> : <User size={32} className="text-slate-900" />}</div>
                {turn === 2 && <motion.div layoutId="active-ring" className="absolute -inset-2 border-2 border-white/50 rounded-full animate-ping" />}
              </div>
              <div className="text-center"><p className="text-white/40 text-[8px] font-black uppercase tracking-[0.4em] mb-1">{gameMode === 'pvc' ? t.cpu : t.p2}</p><p className="text-white font-mono text-lg font-black tracking-tighter">POS: {player2Pos}</p></div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="relative flex flex-col items-center justify-center p-4 gap-6 perspective-[1000px]">
        <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative p-3 bg-[#1a1a1a]/60 backdrop-blur-md rounded-[32px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-[10px] border-white/5 overflow-visible">
          <div className="relative w-[600px] h-[600px] rounded-xl overflow-hidden shadow-inner">{renderBoard()}</div>
          <div className="absolute -right-20 -bottom-4 pointer-events-auto">
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/40 text-[8px] font-black uppercase tracking-widest">{t.rollDice}</p>
              <motion.div animate={{ x: dicePosition.x, y: dicePosition.y }} transition={{ duration: 1.6, ease: "easeOut" }} className="relative preserve-3d">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={rollDice} className={`group cursor-pointer relative preserve-3d ${isRolling || isMoving || !!activeQuestion || !!winner || (gameMode === 'pvc' && turn === 2) || !gameStarted ? 'pointer-events-none opacity-50' : ''}`}>
                  <Dice3D value={diceValue} isRolling={isRolling} />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="absolute right-12 top-12 bottom-12 w-64 flex flex-col gap-4 justify-center pointer-events-none">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] flex flex-col gap-5 shadow-2xl pointer-events-auto min-h-[400px] justify-center">
          <div className="flex flex-col gap-2">
            <p className="text-white/40 text-[8px] font-black uppercase tracking-widest px-2">{t.mode}</p>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => setGameMode('pvc')} className={`py-3 rounded-xl font-black text-[9px] tracking-widest uppercase transition-all ${gameMode === 'pvc' ? 'bg-white text-slate-900' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>{t.pvc}</button>
              <button onClick={() => setGameMode('pvp')} className={`py-3 rounded-xl font-black text-[9px] tracking-widest uppercase transition-all ${gameMode === 'pvp' ? 'bg-white text-slate-900' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>{t.pvp}</button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-white/40 text-[8px] font-black uppercase tracking-widest px-2">Status</p>
            <div className="bg-white/10 border border-white/10 px-4 py-3 rounded-xl flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full animate-pulse ${turn === 1 ? 'bg-amber-400' : 'bg-slate-400'}`} />
              <span className="text-white font-bold text-[10px] uppercase tracking-widest truncate">{turn === 1 ? t.p1 : (gameMode === 'pvc' ? t.cpu : t.p2)}</span>
            </div>
          </div>
          <div className="h-px bg-white/10 w-1/2 mx-auto" />
          {!gameStarted ? (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setGameStarted(true)} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-xl transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"><Play size={14} /> {t.start}</motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={resetGame} className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black rounded-xl transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"><RotateCcw size={14} /> {t.reset}</motion.button>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setCurrentLang(currentLang === 'ar' ? 'en' : 'ar')} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[9px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-white/10 transition-all"><Languages size={14} /> {currentLang === 'ar' ? 'English' : 'العربية'}</motion.button>
        </div>
      </div>

      <button onClick={() => onWin(0)} className="absolute bottom-4 left-4 p-4 bg-white/20 hover:bg-white/40 rounded-2xl text-white backdrop-blur-md transition-all z-50"><Home size={28} /></button>

      <AnimatePresence>
        {activeQuestion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-xl flex items-center justify-center p-8">
            <motion.div initial={{ scale: 0.8, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 50 }} className="relative w-full max-w-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-3xl">
              <div className="p-16 flex flex-col items-center text-center">
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="px-10 py-3 bg-white/5 border border-white/10 rounded-full mb-12"><span className="text-[10px] font-black text-white/40 tracking-[0.5em] uppercase">{currentLang === 'ar' ? 'تحدي اللغة العربية' : 'ARABIC CHALLENGE'}</span></motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-5xl sm:text-6xl font-black text-white mb-16 leading-tight tracking-tight" style={{ fontFamily: currentLang === 'ar' ? 'serif' : 'inherit' }}>{activeQuestion.q}</motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                  {activeQuestion.options.map((opt, idx) => (
                    <motion.button key={idx} onClick={() => handleAnswer(idx)} whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + idx * 0.1 }} className={`group relative p-8 rounded-2xl text-xl font-bold border transition-all flex items-center justify-center min-h-[100px] ${feedback === 'correct' && idx === activeQuestion.correct ? 'bg-green-500/20 border-green-400/50 text-white' : feedback === 'wrong' && idx === activeQuestion.correct ? 'bg-green-500/10 border-green-400/20 text-white/30' : feedback === 'wrong' && idx !== activeQuestion.correct ? 'bg-red-500/20 border-red-400/50 text-white' : 'bg-white/5 border-white/10 text-white/80 hover:text-white hover:border-white/30'}`}><span className="relative z-10">{opt}</span></motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[110] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-8">
            <motion.div initial={{ scale: 0.5, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} className="relative bg-gradient-to-b from-white/20 to-white/5 border border-white/30 p-16 rounded-[4rem] text-center shadow-[0_100px_200px_rgba(0,0,0,0.8)] max-w-lg w-full backdrop-blur-3xl overflow-hidden">
              <div className="w-32 h-32 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center text-amber-400 mx-auto mb-12 shadow-2xl border border-white/20"><Trophy size={64} className="drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" /></div>
              <h2 className="text-6xl font-black text-white mb-4 tracking-tighter">{winner === 1 ? t.p1 : (gameMode === 'pvc' ? t.cpu : t.p2)}</h2>
              <p className="text-xl font-black text-white/40 mb-16 uppercase tracking-[0.6em]">{t.winTitle}</p>
              <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,1)' }} whileTap={{ scale: 0.98 }} onClick={resetGame} className="w-full py-8 bg-white/90 text-slate-900 font-black rounded-2xl shadow-2xl transition-all text-xl uppercase tracking-widest">{t.playAgain}</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SnakesAndLadders;
