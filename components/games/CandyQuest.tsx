import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Trophy, 
  Brain, 
  Timer, 
  Star, 
  Zap, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Heart,
  Moon,
  Sun,
  Hexagon,
  Circle,
  Triangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---
type CandyColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
type CandyType = 'normal' | 'striped-h' | 'striped-v' | 'wrapped' | 'color-bomb';

interface Question {
  id: number;
  category: string;
  text: string;
  options: string[];
  correct: number;
  level: number;
}

interface Candy {
  id: string;
  color: CandyColor;
  type: CandyType;
  isFrozen?: boolean; // Ice Block
  isAdvancedIce?: boolean; // Needs question to break
  isLocked?: boolean; // Locked Candy
}

interface Mission {
  id: number;
  title: string;
  targetScore: number;
  targetCandies: { color: CandyColor; count: number }[];
  targetSkills: { category: string; count: number }[];
}

interface CandyQuestProps {
  onBack: () => void;
}

const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "بداية الرحلة",
    targetScore: 5000,
    targetCandies: [{ color: 'blue', count: 30 }],
    targetSkills: [{ category: 'grammar', count: 1 }]
  },
  {
    id: 2,
    title: "تحدي الجليد",
    targetScore: 8000,
    targetCandies: [{ color: 'red', count: 40 }, { color: 'green', count: 20 }],
    targetSkills: [{ category: 'meanings', count: 2 }]
  }
];

// --- Constants ---
const GRID_SIZE = 8;
const CANDY_COLORS: CandyColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

const COLOR_MAP: Record<CandyColor, string> = {
  red: 'from-rose-500 to-rose-700',
  blue: 'from-blue-500 to-blue-700',
  green: 'from-emerald-500 to-emerald-700',
  yellow: 'from-amber-400 to-amber-600',
  purple: 'from-purple-500 to-purple-700',
  orange: 'from-orange-500 to-orange-700',
};

const ICON_MAP: Record<CandyColor, any> = {
  red: Heart,
  blue: Star,
  green: Triangle,
  yellow: Sun,
  purple: Moon,
  orange: Hexagon,
};

const ARABIC_SKILLS = [
  { id: 'meanings', label: 'المعاني', color: 'text-blue-400' },
  { id: 'antonyms', label: 'التضاد', color: 'text-rose-400' },
  { id: 'grammar', label: 'القواعد', color: 'text-emerald-400' },
  { id: 'spelling', label: 'الإملاء', color: 'text-amber-400' },
];

// --- Refocused Arabic Questions ---
const CANDY_QUESTIONS: Question[] = [
  // Meanings (معاني)
  { id: 101, text: "ما معنى كلمة 'باسل'؟", options: ["خائف", "شجاع", "كريم", "سريع"], correct: 1, level: 1, category: "meanings" },
  { id: 102, text: "ما مرادف كلمة 'الوسن'؟", options: ["النوم", "التعب", "بداية النعاس", "اليقظة"], correct: 2, level: 3, category: "meanings" },
  
  // Antonyms (تضاد)
  { id: 201, text: "ما ضد كلمة 'إخفاء'؟", options: ["ستر", "إظهار", "كتمان", "تغطية"], correct: 1, level: 1, category: "antonyms" },
  { id: 202, text: "ما عكس كلمة 'القنوط'؟", options: ["اليأس", "الأمل", "الحزن", "الغضب"], correct: 1, level: 4, category: "antonyms" },

  // Grammar (قواعد)
  { id: 301, text: "ما إعراب الفاعل في الجملة الفعلية؟", options: ["منصوب", "مجرور", "مرفوع", "مجزوم"], correct: 2, level: 2, category: "grammar" },
  { id: 302, text: "أي من هذه الأفعال هو 'فعل أمر'؟", options: ["كتب", "يكتب", "اكتب", "كتابة"], correct: 2, level: 1, category: "grammar" },
  { id: 303, text: "كان وأخواتها تدخل على الجملة...", options: ["الفعلية", "الاسمية", "شبه الجملة", "الظرفية"], correct: 1, level: 3, category: "grammar" },

  // Spelling (إملاء)
  { id: 401, text: "كيف تكتب كلمة 'سماء' عند التنوين بالفتح؟", options: ["سماءً", "سماءاً", "سماءن", "سماأً"], correct: 0, level: 2, category: "spelling" },
  { id: 402, text: "ما هي الكتابة الصحيحة لكلمة 'مسؤول'؟", options: ["مسئول", "مسؤول", "كلاهما صحيح", "مسؤل"], correct: 2, level: 4, category: "spelling" },

  // Level 5 (Advanced)
  { id: 501, text: "ما هو جمع كلمة 'عنكبوت'؟", options: ["عناكب", "عناكيب", "عنكبوتات", "عناكبون"], correct: 0, level: 5, category: "meanings" },
  { id: 502, text: "ما هو إعراب 'اللاعبون' في: 'فاز اللاعبون'؟", options: ["فاعل مرفوع بالضمة", "فاعل مرفوع بالواو", "مبتدأ مرفوع بالواو", "مفعول به منصوب"], correct: 1, level: 5, category: "grammar" },
];

// --- Helper Functions ---
const createCandy = (color?: CandyColor, type: CandyType = 'normal'): Candy => {
  const isFrozen = Math.random() < 0.05;
  const isLocked = !isFrozen && Math.random() < 0.05;
  const isAdvancedIce = isFrozen && Math.random() < 0.3;

  return {
    id: Math.random().toString(36).substr(2, 9),
    color: color || CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)],
    type,
    isFrozen,
    isAdvancedIce,
    isLocked
  };
};

const generateInitialGrid = () => {
  let grid: (Candy | null)[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    grid[r] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      let candy;
      do {
        candy = createCandy();
      } while (
        (c >= 2 && grid[r][c - 1]?.color === candy.color && grid[r][c - 2]?.color === candy.color) ||
        (r >= 2 && grid[r - 1][c]?.color === candy.color && grid[r - 2][c]?.color === candy.color)
      );
      grid[r][c] = candy;
    }
  }
  return grid;
};

// --- Main Component ---
export const CandyQuest: React.FC<CandyQuestProps> = ({ onBack }) => {
  const [grid, setGrid] = useState<(Candy | null)[][]>(generateInitialGrid());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [moves, setMoves] = useState(25);
  const [selectedCandy, setSelectedCandy] = useState<{ r: number, c: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Knowledge System
  const [knowledgeLevel, setKnowledgeLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [pendingPowerUp, setPendingPowerUp] = useState<(() => void) | null>(null);
  const [usedQuestionIds, setUsedQuestionIds] = useState<number[]>([]);
  const [combo, setCombo] = useState(0);
  const [draggedCandy, setDraggedCandy] = useState<{ r: number, c: number } | null>(null);

  const [isShaking, setIsShaking] = useState(false);
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);
  const [missionProgress, setMissionProgress] = useState({
    score: 0,
    candies: {} as Record<string, number>,
    skills: {} as Record<string, number>
  });
  
  const [skillProgress, setSkillProgress] = useState<Record<string, number>>({
    meanings: 0,
    antonyms: 0,
    grammar: 0,
    spelling: 0,
  });

  const [floatingScores, setFloatingScores] = useState<{ id: number, x: number, y: number, score: number }[]>([]);
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, color: string, vx: number, vy: number, life: number }[]>([]);

  const audioCtx = useRef<AudioContext | null>(null);
  const masterGain = useRef<GainNode | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // --- Sound System ---
  const initAudio = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGain.current = audioCtx.current.createGain();
      const compressor = audioCtx.current.createDynamicsCompressor();
      
      masterGain.current.connect(compressor);
      compressor.connect(audioCtx.current.destination);
      masterGain.current.gain.value = 0.3;
    }
  }, []);

  const playSound = useCallback((freq: number, type: OscillatorType = 'sine', duration = 0.1, volume = 0.1) => {
    try {
      initAudio();
      const ctx = audioCtx.current!;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.1, ctx.currentTime + duration);
      
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(masterGain.current!);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }, [initAudio]);

  const spawnParticles = useCallback((x: number, y: number, color: string) => {
    const newParticles = Array.from({ length: 8 }).map(() => ({
      id: Math.random(),
      x,
      y,
      color,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1.0
    }));
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.05 }))
        .filter(p => p.life > 0)
      );
    }, 16);
    return () => clearInterval(timer);
  }, []);

  // --- Game Logic ---
  const checkMatches = useCallback((currentGrid: (Candy | null)[][]) => {
    let matches: { r: number, c: number }[] = [];
    
    // Horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
      let matchCount = 1;
      for (let c = 0; c < GRID_SIZE; c++) {
        const color = currentGrid[r][c]?.color;
        if (color && c < GRID_SIZE - 1 && currentGrid[r][c+1]?.color === color) {
          matchCount++;
        } else {
          if (matchCount >= 3) {
            const match = [];
            for (let i = 0; i < matchCount; i++) match.push({ r, c: c - i });
            matches.push(...match);
            
            // Special Candy Logic
            if (matchCount === 4) {
              // Striped
            } else if (matchCount >= 5) {
              // Color Bomb
            }
          }
          matchCount = 1;
        }
      }
    }
    
    // Vertical
    for (let c = 0; c < GRID_SIZE; c++) {
      let matchCount = 1;
      for (let r = 0; r < GRID_SIZE; r++) {
        const color = currentGrid[r][c]?.color;
        if (color && r < GRID_SIZE - 1 && currentGrid[r+1][c]?.color === color) {
          matchCount++;
        } else {
          if (matchCount >= 3) {
            const match = [];
            for (let i = 0; i < matchCount; i++) match.push({ r: r - i, c });
            matches.push(...match);
          }
          matchCount = 1;
        }
      }
    }
    
    return Array.from(new Set(matches.map(m => `${m.r},${m.c}`))).map(s => {
      const [r, c] = s.split(',').map(Number);
      return { r, c };
    });
  }, []);

  const triggerQuestion = (onCorrect: () => void) => {
    // Select question based on knowledge level
    let available = CANDY_QUESTIONS.filter(q => q.level === knowledgeLevel && !usedQuestionIds.includes(q.id));
    
    if (available.length === 0) {
      // If no questions left at this level, try adjacent levels
      available = CANDY_QUESTIONS.filter(q => Math.abs(q.level - knowledgeLevel) <= 1 && !usedQuestionIds.includes(q.id));
    }
    
    if (available.length === 0) {
      // Reset if all used or no matches found
      setUsedQuestionIds([]);
      available = CANDY_QUESTIONS.filter(q => q.level === knowledgeLevel);
    }

    // Final fallback: any question from the entire pool
    if (available.length === 0) {
      available = CANDY_QUESTIONS;
    }

    const randomQ = available[Math.floor(Math.random() * available.length)];
    
    if (!randomQ) {
      console.error("No questions available in CANDY_QUESTIONS");
      return;
    }

    setCurrentQuestion(randomQ);
    setUsedQuestionIds(prev => [...prev, randomQ.id]);
    setPendingPowerUp(() => onCorrect);
    setShowQuestion(true);
  };

  const processGrid = useCallback(async (currentGrid: (Candy | null)[][], isManualSwap = false) => {
    setIsProcessing(true);
    let matches = checkMatches(currentGrid);
    
    if (matches.length === 0) {
      setIsProcessing(false);
      setCombo(0);
      return;
    }

    // Screen Shake for big matches
    if (matches.length >= 4) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 200);
    }

    // Sound for match
    const baseFreq = 400 + (combo * 100);
    playSound(baseFreq, 'triangle', 0.1, 0.2);
    playSound(baseFreq * 1.5, 'sine', 0.05, 0.1);

    // Educational Trigger
    if (isManualSwap && matches.length >= 4) {
      // Brief "Hit Stop" for impact
      const hitStopDuration = matches.length >= 5 ? 200 : 100;
      await new Promise(r => setTimeout(r, hitStopDuration));
      triggerQuestion(() => {
        setScore(prev => prev + 2000);
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
        
        // Power Up: Clear a random color
        const randomColor = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
        const nextGrid = grid.map((row, r) => row.map((c, col) => {
          if (c?.color === randomColor) {
            spawnParticles(col * 65 + 32, r * 65 + 32, randomColor);
            return null;
          }
          return c;
        }));
        setGrid(nextGrid);
        playSound(1200, 'sine', 0.5, 0.3);
        processGrid(nextGrid);
      });
    }

    // Remove matches and check for ice breaking
    const newGrid = [...currentGrid.map(row => [...row])];
    const collectedColors: Record<string, number> = {};

    // Identify special candies within matches to trigger their effects
    const specialTriggers: { r: number, c: number, type: string, color: string }[] = [];
    matches.forEach(({ r, c }) => {
      const candy = currentGrid[r][c];
      if (candy && candy.type !== 'normal') {
        specialTriggers.push({ r, c, type: candy.type, color: candy.color });
      }
    });

    // Process Special Effects (Expand matches based on special candies)
    specialTriggers.forEach(trigger => {
      if (trigger.type === 'striped-h') {
        // Clear entire row
        for (let c = 0; c < GRID_SIZE; c++) {
          if (!matches.some(m => m.r === trigger.r && m.c === c)) {
            matches.push({ r: trigger.r, c });
          }
        }
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 200);
      } else if (trigger.type === 'striped-v') {
        // Clear entire column
        for (let r = 0; r < GRID_SIZE; r++) {
          if (!matches.some(m => m.r === r && m.c === trigger.c)) {
            matches.push({ r, c: trigger.c });
          }
        }
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 200);
      } else if (trigger.type === 'color-bomb') {
        // Clear all of same color
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (currentGrid[r][c]?.color === trigger.color) {
              if (!matches.some(m => m.r === r && m.c === c)) {
                matches.push({ r, c });
              }
            }
          }
        }
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
      }
    });

    matches.forEach(({ r, c }) => {
      const candy = newGrid[r][c];
      if (candy) {
        collectedColors[candy.color] = (collectedColors[candy.color] || 0) + 1;
        
        // Spawn particles
        spawnParticles(c * 65 + 32, r * 65 + 32, candy.color);

        // Break adjacent ice
        const neighbors = [
          { r: r - 1, c }, { r: r + 1, c }, { r, c: c - 1 }, { r, c: c + 1 }
        ];
        neighbors.forEach(n => {
          if (n.r >= 0 && n.r < GRID_SIZE && n.c >= 0 && n.c < GRID_SIZE) {
            const neighbor = newGrid[n.r][n.c];
            if (neighbor?.isFrozen) {
              if (neighbor.isAdvancedIce) {
                // Advanced ice needs question
                triggerQuestion(() => {
                  setGrid(g => {
                    const next = [...g.map(row => [...row])];
                    if (next[n.r][n.c]) next[n.r][n.c]!.isFrozen = false;
                    return next;
                  });
                });
              } else {
                neighbor.isFrozen = false;
              }
            }
          }
        });
      }
      newGrid[r][c] = null;
    });

    // Special Candy Creation (if 4 or 5 matches)
    if (matches.length === 4) {
      const { r, c } = matches[0];
      const color = currentGrid[r][c]?.color || CANDY_COLORS[0];
      newGrid[r][c] = createCandy(color, Math.random() > 0.5 ? 'striped-h' : 'striped-v');
      playSound(1500, 'triangle', 0.2, 0.1);
    } else if (matches.length >= 5) {
      const { r, c } = matches[0];
      const color = currentGrid[r][c]?.color || CANDY_COLORS[0];
      newGrid[r][c] = createCandy(color, 'color-bomb');
      playSound(2000, 'sawtooth', 0.3, 0.2);
    }
    
    // Update mission progress
    setMissionProgress(prev => {
      const nextCandies = { ...prev.candies };
      Object.entries(collectedColors).forEach(([color, count]) => {
        nextCandies[color] = (nextCandies[color] || 0) + count;
      });
      return { ...prev, candies: nextCandies };
    });

    const matchScore = matches.length * 50 * (combo + 1);
    
    // Floating score
    const firstMatch = matches[0];
    if (firstMatch) {
      const newScore = { id: Date.now(), x: firstMatch.c * 50, y: firstMatch.r * 50, score: matchScore };
      setFloatingScores(prev => [...prev, newScore]);
      setTimeout(() => setFloatingScores(prev => prev.filter(s => s.id !== newScore.id)), 800);
    }

    setScore(prev => prev + matchScore);
    setCombo(prev => prev + 1);
    
    // Combo Sound
    const comboFreq = 400 + (combo * 100);
    playSound(comboFreq, 'sine', 0.1, 0.1);
    if (combo > 3) playSound(comboFreq * 1.5, 'triangle', 0.05, 0.1);

    setGrid(newGrid);
    
    await new Promise(r => setTimeout(r, 0)); // Super fast

    // Drop candies
    for (let c = 0; c < GRID_SIZE; c++) {
      let emptySlots = 0;
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        if (newGrid[r][c] === null) {
          emptySlots++;
        } else if (emptySlots > 0) {
          newGrid[r + emptySlots][c] = newGrid[r][c];
          newGrid[r][c] = null;
        }
      }
      for (let r = 0; r < emptySlots; r++) {
        newGrid[r][c] = createCandy();
      }
    }
    
    setGrid(newGrid);
    playSound(1200, 'sine', 0.05, 0.05); // Drop sound
    await new Promise(r => setTimeout(r, 0)); // Super fast
    
    processGrid(newGrid);
  }, [checkMatches, knowledgeLevel, usedQuestionIds, combo, playSound, spawnParticles]);

  const handleSwap = async (r1: number, c1: number, r2: number, c2: number) => {
    if (isProcessing || moves <= 0) return;

    const c1Data = grid[r1][c1];
    const c2Data = grid[r2][c2];

    // Prevent moving frozen or locked candies
    if (c1Data?.isFrozen || c1Data?.isLocked || c2Data?.isFrozen || c2Data?.isLocked) {
      playSound(150, 'square', 0.2);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 200);
      return;
    }

    const newGrid = [...grid.map(row => [...row])];
    const temp = newGrid[r1][c1];
    newGrid[r1][c1] = newGrid[r2][c2];
    newGrid[r2][c2] = temp;

    const matches = checkMatches(newGrid);
    if (matches.length > 0) {
      setGrid(newGrid);
      setMoves(prev => prev - 1);
      playSound(800, 'sine', 0.05, 0.1);
      playSound(1200, 'sine', 0.1, 0.05); // Whoosh
      processGrid(newGrid, true);
    } else {
      playSound(200, 'square', 0.1, 0.1);
      setGrid([...grid]);
    }
    setSelectedCandy(null);
    setDraggedCandy(null);
  };

  const onCandyDragStart = (r: number, c: number) => {
    if (isProcessing || moves <= 0) return;
    setDraggedCandy({ r, c });
    playSound(800, 'sine', 0.05);
  };

  const onCandyDragEnd = (r: number, c: number, info: any) => {
    if (!draggedCandy || isProcessing || moves <= 0) return;
    
    const threshold = 5; // Instant sensitivity
    const { x, y } = info.offset;
    
    let targetR = draggedCandy.r;
    let targetC = draggedCandy.c;

    if (Math.abs(x) > Math.abs(y)) {
      if (x > threshold) targetC = Math.min(GRID_SIZE - 1, draggedCandy.c + 1);
      else if (x < -threshold) targetC = Math.max(0, draggedCandy.c - 1);
    } else {
      if (y > threshold) targetR = Math.min(GRID_SIZE - 1, draggedCandy.r + 1);
      else if (y < -threshold) targetR = Math.max(0, draggedCandy.r - 1);
    }

    if (targetR !== draggedCandy.r || targetC !== draggedCandy.c) {
      handleSwap(draggedCandy.r, draggedCandy.c, targetR, targetC);
    } else {
      setDraggedCandy(null);
    }
  };

  const onCandyClick = (r: number, c: number) => {
    if (isProcessing || moves <= 0) return;

    if (!selectedCandy) {
      setSelectedCandy({ r, c });
    } else {
      const dr = Math.abs(selectedCandy.r - r);
      const dc = Math.abs(selectedCandy.c - c);
      
      if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        handleSwap(selectedCandy.r, selectedCandy.c, r, c);
      } else {
        setSelectedCandy({ r, c });
      }
    }
  };

  const handleAnswer = (index: number) => {
    if (!currentQuestion) return;

    if (index === currentQuestion.correct) {
      // Correct!
      if (pendingPowerUp) pendingPowerUp();
      setKnowledgeLevel(prev => Math.min(5, prev + 1));
      
      // Update skill progress
      setSkillProgress(prev => ({
        ...prev,
        [currentQuestion.category]: Math.min(100, prev[currentQuestion.category] + 10)
      }));

      // Update mission progress
      setMissionProgress(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [currentQuestion.category]: (prev.skills[currentQuestion.category] || 0) + 1
        }
      }));

      // Unlock locked candies if it was a meaning question
      if (currentQuestion.category === 'meanings') {
        setGrid(g => g.map(row => row.map(c => c ? { ...c, isLocked: false } : null)));
      }
      
      setShowQuestion(false);
    } else {
      // Wrong
      setKnowledgeLevel(prev => Math.max(1, prev - 1));
      setShowQuestion(false);
    }
  };

  const currentMission = MISSIONS[currentMissionIdx];
  const isMissionComplete = currentMission && 
    score >= currentMission.targetScore &&
    currentMission.targetCandies.every(tc => (missionProgress.candies[tc.color] || 0) >= tc.count) &&
    currentMission.targetSkills.every(ts => (missionProgress.skills[ts.category] || 0) >= ts.count);

  return (
    <div className={`h-full bg-gradient-to-b ${combo > 5 ? 'from-[#1e1b4b] to-[#4c1d95]' : combo > 2 ? 'from-[#0f172a] to-[#1e3a8a]' : 'from-[#0f172a] to-[#064e3b]'} text-white p-4 font-sans relative overflow-hidden flex flex-col transition-colors duration-500 ${isShaking ? 'animate-shake' : ''}`}>
      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col h-full">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] gap-6 items-center flex-1">
          {/* Left Panel: Mission Card */}
          <div className="space-y-4 self-start pt-4">
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-blue-400" size={18} />
                <h3 className="text-[12px] font-black uppercase tracking-widest">بطاقة المهمة</h3>
              </div>
              
              <div className="space-y-4">
                <div className="text-[13px] font-bold text-blue-200 mb-3">{currentMission.title}</div>
                
                {/* Score Goal */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-white/40">
                    <span>النقاط المستهدفة</span>
                    <span>{score} / {currentMission.targetScore}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" style={{ width: `${Math.min(100, (score / currentMission.targetScore) * 100)}%` }} />
                  </div>
                </div>

                {/* Candy Goals */}
                {currentMission.targetCandies.map(tc => (
                  <div key={tc.color} className="space-y-2">
                    <div className="flex justify-between text-[10px] text-white/40">
                      <span>جمع {tc.count} قطعة {tc.color === 'blue' ? 'زرقاء' : tc.color === 'red' ? 'حمراء' : 'خضراء'}</span>
                      <motion.span 
                        key={missionProgress.candies[tc.color]}
                        animate={{ scale: [1, 1.5, 1], color: ['#fff', '#60a5fa', '#fff'] }}
                      >
                        {missionProgress.candies[tc.color] || 0} / {tc.count}
                      </motion.span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={false}
                        animate={{ width: `${Math.min(100, ((missionProgress.candies[tc.color] || 0) / tc.count) * 100)}%` }}
                        className={`h-full bg-current ${COLOR_MAP[tc.color]} shadow-[0_0_10px_currentColor]`} 
                      />
                    </div>
                  </div>
                ))}

                {/* Skill Goals */}
                {currentMission.targetSkills.map(ts => (
                  <div key={ts.category} className="space-y-2">
                    <div className="flex justify-between text-[10px] text-white/40">
                      <span>إجابات {ARABIC_SKILLS.find(s => s.id === ts.category)?.label}</span>
                      <span>{missionProgress.skills[ts.category] || 0} / {ts.count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: `${Math.min(100, ((missionProgress.skills[ts.category] || 0) / ts.count) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Moves & Score Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center">
                <div className="text-[8px] text-white/40 uppercase font-black mb-1">الحركات</div>
                <div className={`text-xl font-black ${moves <= 5 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>{moves}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center">
                <div className="text-[8px] text-white/40 uppercase font-black mb-1">النقاط</div>
                <div className="text-xl font-black text-blue-400">{score}</div>
              </div>
            </div>
          </div>

          {/* Center: Game Board */}
          <div className="relative group flex justify-center items-center py-4">
            <div className="absolute -inset-20 bg-blue-500/10 blur-[100px] rounded-full opacity-50" />
            <div 
              ref={boardRef}
              className="relative bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[32px] p-3 shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden"
            >
              <div 
                className="grid gap-1.5 relative"
                style={{ 
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  width: '520px',
                  height: '520px',
                  background: 'radial-gradient(circle at center, rgba(30,58,138,0.2) 0%, transparent 70%)'
                }}
              >
                {/* Background Stars */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        opacity: [0.1, 0.4, 0.1],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 2 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 5
                      }}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{ 
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                      }}
                    />
                  ))}
                </div>

                {/* Particles */}
                {particles.map(p => (
                  <div
                    key={p.id}
                    className="absolute z-40 w-1.5 h-1.5 rounded-full pointer-events-none"
                    style={{
                      left: p.x,
                      top: p.y,
                      backgroundColor: p.color === 'blue' ? '#60a5fa' : p.color === 'red' ? '#f87171' : p.color === 'green' ? '#34d399' : p.color === 'yellow' ? '#fbbf24' : p.color === 'purple' ? '#a78bfa' : '#fb923c',
                      opacity: p.life,
                      boxShadow: `0 0 10px ${p.color === 'blue' ? '#60a5fa' : p.color === 'red' ? '#f87171' : p.color === 'green' ? '#34d399' : p.color === 'yellow' ? '#fbbf24' : p.color === 'purple' ? '#a78bfa' : '#fb923c'}`
                    }}
                  />
                ))}

                {/* Floating Scores */}
                <AnimatePresence mode="popLayout">
                  {combo > 1 && (
                    <motion.div
                      key={`combo-${combo}`}
                      initial={{ scale: 0, opacity: 0, y: 20 }}
                      animate={{ scale: [1, 1.8, 1], opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 2 }}
                      className="absolute top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-6xl font-black text-amber-400 italic drop-shadow-[0_0_30px_rgba(251,191,36,1)] uppercase tracking-tighter">
                          {combo}x COMBO!
                        </span>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          className="h-1 bg-amber-400 mt-1 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                        />
                      </div>
                    </motion.div>
                  )}
                  {floatingScores.map(fs => (
                    <motion.div
                      key={fs.id}
                      initial={{ opacity: 0, y: fs.y, x: fs.x }}
                      animate={{ opacity: 1, y: fs.y - 50 }}
                      exit={{ opacity: 0 }}
                      className="absolute z-50 text-blue-400 font-black text-lg pointer-events-none drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                    >
                      +{fs.score}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {grid.map((row, r) => row.map((candy, c) => (
                  <div 
                    key={`${r}-${c}`}
                    className={`relative aspect-square rounded-md flex items-center justify-center
                      ${selectedCandy?.r === r && selectedCandy?.c === c ? 'ring-2 ring-blue-400 z-10 scale-105' : ''}
                      ${candy === null ? 'opacity-0' : 'opacity-100'}
                    `}
                  >
                    {candy && (
                      <motion.div
                        layoutId={candy.id}
                        drag
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        dragElastic={0.6}
                        onDragStart={() => onCandyDragStart(r, c)}
                        onDragEnd={(_, info) => onCandyDragEnd(r, c, info)}
                        onClick={() => onCandyClick(r, c)}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: 1, 
                          opacity: 1,
                          boxShadow: candy.type !== 'normal' ? [
                            "0 0 10px rgba(255,255,255,0.3)",
                            "0 0 20px rgba(255,255,255,0.6)",
                            "0 0 10px rgba(255,255,255,0.3)"
                          ] : "0 4px 15px rgba(0,0,0,0.6)"
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ 
                          // Movement animation (Spring for organic feel)
                          layout: {
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            mass: 0.8,
                            bounce: 0.2
                          },
                          // Glow animation
                          boxShadow: { repeat: Infinity, duration: 1.5 },
                          // Initial appearance
                          scale: { type: "spring", stiffness: 400, damping: 20 }
                        }}
                        layout
                        whileHover={{ scale: 1.05 }}
                        whileDrag={{ scale: 1.15, zIndex: 50 }}
                        className={`w-[94%] h-[94%] rounded-lg bg-gradient-to-br ${COLOR_MAP[candy.color]} flex items-center justify-center relative overflow-hidden cursor-grab active:cursor-grabbing border border-white/10
                          ${candy.isFrozen ? 'brightness-150 saturate-50' : ''}
                          ${candy.isLocked ? 'grayscale' : ''}
                          ${candy.type !== 'normal' ? 'ring-2 ring-white ring-offset-2 ring-offset-black/20' : ''}
                        `}
                      >
                        {/* Ultra Premium Glass Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-black/50 pointer-events-none" />
                        <div className="absolute top-0.5 left-0.5 w-1/2 h-1/3 bg-white/50 rounded-full blur-[0.5px] -rotate-12 pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] pointer-events-none" />
                        
                        {/* Ice Overlay */}
                        {candy.isFrozen && (
                          <div className="absolute inset-0 bg-blue-200/40 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="w-full h-full border-2 border-white/30 rounded-lg" />
                            {candy.isAdvancedIce && <Sparkles className="text-white absolute" size={12} />}
                          </div>
                        )}

                        {/* Lock Overlay */}
                        {candy.isLocked && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white/50 rounded-full flex items-center justify-center">
                              <div className="w-1 h-1 bg-white rounded-full" />
                            </div>
                          </div>
                        )}

                        {/* Icon */}
                        {React.createElement(ICON_MAP[candy.color], {
                          size: 16,
                          className: "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] relative z-10"
                        })}

                        {/* Special Effects */}
                        {candy.type === 'striped-h' && (
                          <div className="absolute inset-0 flex flex-col justify-around py-1 opacity-50">
                            {[1, 2, 3].map(i => <div key={i} className="h-0.5 bg-white w-full" />)}
                          </div>
                        )}
                        {candy.type === 'striped-v' && (
                          <div className="absolute inset-0 flex justify-around px-1 opacity-50">
                            {[1, 2, 3].map(i => <div key={i} className="w-0.5 bg-white h-full" />)}
                          </div>
                        )}
                        {candy.type === 'wrapped' && (
                          <div className="absolute inset-0 border-4 border-white/30 rounded-lg animate-pulse" />
                        )}
                        {candy.type === 'color-bomb' && (
                          <div className="absolute inset-0 bg-[radial-gradient(circle,white_0%,transparent_70%)] animate-spin duration-1000" />
                        )}
                      </motion.div>
                    )}
                  </div>
                )))}
              </div>
            </div>
          </div>

          {/* Right Panel: Skills & Rules */}
          <div className="space-y-4 self-start pt-4">
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl p-5">
              <h4 className="text-white/60 text-[12px] mb-4 flex items-center gap-2 font-black uppercase tracking-widest">
                <Brain size={16} className="text-blue-400" />
                مهاراتك اللغوية
              </h4>
              <div className="space-y-4">
                {ARABIC_SKILLS.map(skill => (
                  <div key={skill.id} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-white/40">{skill.label}</span>
                      <span className={`${skill.color} opacity-80`}>
                        {skillProgress[skill.id]}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${skillProgress[skill.id]}%` }}
                        className={`h-full bg-current ${skill.color} shadow-[0_0_10px_currentColor]`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl p-5">
              <h3 className="text-[12px] font-black text-blue-400 mb-4 flex items-center gap-2 italic uppercase tracking-tighter">
                <Sparkles size={16} />
                قواعد اللعبة
              </h3>
              <ul className="space-y-3 text-[10px] text-white/50 font-bold leading-relaxed">
                <li className="flex gap-2">
                  <div className="w-5 h-5 rounded bg-blue-400/20 flex items-center justify-center text-blue-400 shrink-0 shadow-inner text-[10px]">1</div>
                  <p>اسحب القطع بسرعة للمطابقة.</p>
                </li>
                <li className="flex gap-2">
                  <div className="w-5 h-5 rounded bg-blue-400/20 flex items-center justify-center text-blue-400 shrink-0 shadow-inner text-[10px]">2</div>
                  <p>المطابقات الكبرى تفتح تحديات لغوية.</p>
                </li>
                <li className="flex gap-2">
                  <div className="w-5 h-5 rounded bg-blue-400/20 flex items-center justify-center text-blue-400 shrink-0 shadow-inner text-[10px]">3</div>
                  <p>أجب لتفعيل الكومبو المتفجر.</p>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setGrid(generateInitialGrid());
                setScore(0);
                setMoves(25);
                setCombo(0);
              }}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-3 transition-all group text-[12px] font-black uppercase tracking-widest"
            >
              <RotateCcw size={14} className="text-white/40 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-white/60">إعادة البدء</span>
            </button>
          </div>
        </div>

        {/* Mission Complete Modal */}
      <AnimatePresence>
        {isMissionComplete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-white/5 border border-white/10 rounded-[40px] p-12 text-center max-w-md w-full"
            >
              <div className="w-24 h-24 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Sparkles size={48} className="text-blue-400" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">تمت المهمة!</h2>
              <p className="text-white/40 mb-8">{currentMission.title}</p>
              
              <button
                onClick={() => {
                  if (currentMissionIdx < MISSIONS.length - 1) {
                    setCurrentMissionIdx(prev => prev + 1);
                    setMissionProgress({ score: 0, candies: {}, skills: {} });
                    setGrid(generateInitialGrid());
                    setMoves(25);
                  } else {
                    onBack();
                  }
                }}
                className="w-full py-4 bg-blue-400 text-black font-bold rounded-2xl hover:bg-blue-300 transition-colors"
              >
                المرحلة التالية
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Question Modal */}
      <AnimatePresence>
        {showQuestion && currentQuestion && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-400/20 rounded-xl">
                    <Brain className="text-amber-400" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">تحدي اللغة العربية</h4>
                    <p className="text-xs text-white/40">المستوى {currentQuestion.level} • {ARABIC_SKILLS.find(s => s.id === currentQuestion.category)?.label}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-white/40 uppercase tracking-widest">
                  Knowledge Boost
                </div>
              </div>

              {/* Question Text */}
              <h3 className="text-2xl font-bold text-white mb-8 text-right leading-relaxed">
                {currentQuestion.text}
              </h3>

              {/* Options */}
              <div className="grid gap-3">
                {currentQuestion.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(idx)}
                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-right text-white/80 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-white/20 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-lg">{option}</span>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                <p className="text-xs text-white/20">أجب بشكل صحيح لتفعيل القوى الخارقة</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentQuestion.level ? 'bg-amber-400' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {moves === 0 && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-white/5 border border-white/10 rounded-[40px] p-12 text-center max-w-md w-full"
            >
              <div className="w-24 h-24 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Trophy size={48} className="text-amber-400" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">انتهت الحركات!</h2>
              <p className="text-white/40 mb-8">لقد حققت نتيجة رائعة في هذا المستوى</p>
              
              <div className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/5">
                <div className="text-sm text-white/40 mb-1">النتيجة النهائية</div>
                <div className="text-5xl font-bold text-amber-400 tabular-nums">{score.toLocaleString()}</div>
                {combo > 0 && (
                  <div className="text-amber-400/60 text-sm mt-2">أعلى كومبو: {combo}x</div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setGrid(generateInitialGrid());
                    setScore(0);
                    setMoves(25);
                  }}
                  className="flex-1 py-4 bg-amber-400 text-black font-bold rounded-2xl hover:bg-amber-300 transition-colors"
                >
                  لعب مرة أخرى
                </button>
                <button
                  onClick={onBack}
                  className="flex-1 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors"
                >
                  الرئيسية
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
};
