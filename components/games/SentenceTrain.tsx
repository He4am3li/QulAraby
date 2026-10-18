import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, ArrowLeft, Star, Volume2, VolumeX, RefreshCw, 
  Printer, CheckCircle2, XCircle, Sparkles, ChevronRight,
  Train, Check, ArrowRight, Award, Settings, BarChart3,
  BookOpen, User, Tag, Puzzle, Flag, Search,
  List, CheckCircle, Lightbulb, ShieldCheck, Zap, X, Compass,
  LayoutGrid, ChevronLeft
} from 'lucide-react';
import { CinematicTrainScene } from './CinematicTrainScene';
import { Stage3WordOrderTrain, Stage3Puzzle } from './Stage3WordOrderTrain';
import { Stage4ChallengeYard } from './Stage4ChallengeYard';
import { VintageStationClock } from './VintageStationClock';
import { TicketCounterDock, DESTINATION_LINES, DestinationLine } from './TicketCounterDock';
import { CentralGrammarStation } from './CentralGrammarStation';
import { Stage1DiscoverTicketOffice } from './Stage1DiscoverTicketOffice';
import { Stage5ArrivalStation } from './Stage5ArrivalStation';
import { GRAMMAR_RULES } from '../../src/data/grammarRulesData';

interface SentenceTrainProps {
  onWin?: (xp: number) => void;
  onBack: () => void;
  lang: 'ar' | 'en';
}

interface Question {
  id: number;
  text: string;
  parts: { text: string; color: string; role: string }[];
  type: 'nominal' | 'verbal';
  explanation: string;
  hint: string;
}

// Shuffle helper for question bank randomization
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const SentenceTrain: React.FC<SentenceTrainProps> = ({ onWin, onBack, lang }) => {
  // Current screen / stage
  // 0: start (Welcome & Ticket), 1: discover, 2: classify, 3: arrange, 4: challenge, 5: golden
  const [currentStage, setCurrentStage] = useState<number>(0);

  // Player state
  const [passengerName, setPassengerName] = useState<string>(() => {
    return localStorage.getItem('sentence_train_passenger') || 'هشام السرري';
  });
  const [score, setScore] = useState<number>(620);
  const [stars, setStars] = useState<number>(18);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [stationTime, setStationTime] = useState<Date>(new Date());
  const [selectedLine, setSelectedLine] = useState<DestinationLine>(DESTINATION_LINES[0]);
  const [tripDurationSeconds, setTripDurationSeconds] = useState<number>(0);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [maxUnlockedStage, setMaxUnlockedStage] = useState<number>(1);

  useEffect(() => {
    const timer = setInterval(() => setStationTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Track active real-time journey duration across stages 1 through 5 (pauses when arrival mission is solved)
  useEffect(() => {
    let timer: any = null;
    if (currentStage >= 1 && currentStage <= 5 && !isTimerPaused) {
      timer = setInterval(() => {
        setTripDurationSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentStage, isTimerPaused]);

  // Preload and decode all station backgrounds in browser cache to eliminate image pop-in/lag across stages 2, 3, 4
  useEffect(() => {
    const imagesToPreload = [
      '/stage5_arrival_station_bg.jpg',
      '/station2_night_rail.jpg',
      '/train_station_word_order_bg.jpg',
      '/station4_depot_bg.jpg',
      '/train_depot_yard_bg.jpg',
      '/train_golden_station.jpg',
      '/cinematic_station_master_clean.jpg',
      '/vintage_ticket_office_bg.jpg'
    ];
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Active Modals
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState<boolean>(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);

  // Active Rule Selection (5 tracks)
  const [selectedRuleId, setSelectedRuleId] = useState<string>('nominal_verbal');
  const activeRule = GRAMMAR_RULES[selectedRuleId] || GRAMMAR_RULES.nominal_verbal;

  // Stage 1 (Discover / اكتشف) state
  const [s1ActiveTabId, setS1ActiveTabId] = useState<string>('');
  const [s1Tab, setS1Tab] = useState<'nominal' | 'verbal'>('nominal');
  const [s1ExIndex, setS1ExIndex] = useState<number>(0);

  const activeS1Tab = activeRule.stage1.tabs.find(t => t.id === s1ActiveTabId) || activeRule.stage1.tabs[0];

  // Limit for questions shown in Stage 2 (Classify / صنف) - Exactly 5 questions
  const STAGE2_QUESTIONS_LIMIT = 5;
  // Limit for questions shown in Stage 3 (Arrange / رتب) - Exactly 5 questions from the sentence bank
  const STAGE3_PUZZLES_LIMIT = 5;

  // Helper function to pick strictly 5 random questions from the rule's question bank
  const getRandomStage2Questions = (ruleId: string): any[] => {
    const rule = GRAMMAR_RULES[ruleId] || GRAMMAR_RULES.nominal_verbal;
    const bank = (rule.stage2Questions && rule.stage2Questions.length > 0)
      ? rule.stage2Questions
      : [];
    const shuffled = shuffleArray([...bank]);
    return shuffled.slice(0, STAGE2_QUESTIONS_LIMIT);
  };

  // Helper function to pick strictly 5 random sentences from the rule's Stage 3 sentence bank
  const getRandomStage3Puzzles = (ruleId: string): Stage3Puzzle[] => {
    const rule = GRAMMAR_RULES[ruleId] || GRAMMAR_RULES.nominal_verbal;
    const bank = (rule.stage3Puzzles && rule.stage3Puzzles.length > 0)
      ? rule.stage3Puzzles
      : [];
    const shuffled = shuffleArray([...bank]).slice(0, STAGE3_PUZZLES_LIMIT);
    return shuffled.map(p => {
      let wordsShuffled = shuffleArray(p.words);
      if (wordsShuffled.join(' ') === p.correctOrder.join(' ') && wordsShuffled.length > 1) {
        wordsShuffled = [wordsShuffled[1], wordsShuffled[0], ...wordsShuffled.slice(2)];
      }
      return {
        ...p,
        words: wordsShuffled
      };
    });
  };

  const [s2Index, setS2Index] = useState<number>(0);
  const [s2SelectedChoice, setS2SelectedChoice] = useState<'nominal' | 'verbal' | null>(null);
  const [s2AnswerState, setS2AnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [trainMovement, setTrainMovement] = useState<'station' | 'toNominal' | 'toVerbal' | 'departed'>('station');

  // Stage 3 (Arrange / رتب) puzzle state: 5 dynamic grammatical sentences
  const stage3Puzzles: Stage3Puzzle[] = [
    {
      id: 1,
      targetType: 'فعلية',
      sentence: 'يَلْعَبُ الطِّفْلُ بِالكُرَةِ',
      words: ['بِالكُرَةِ', 'يَلْعَبُ', 'الطِّفْلُ'],
      correctOrder: ['يَلْعَبُ', 'الطِّفْلُ', 'بِالكُرَةِ'],
      hint: 'الجملة الفعلية تبدأ بالفعل (يَلْعَبُ)'
    },
    {
      id: 2,
      targetType: 'اسمية',
      sentence: 'القَمَرُ يُنِيرُ اللَّيْلَ',
      words: ['اللَّيْلَ', 'يُنِيرُ', 'القَمَرُ'],
      correctOrder: ['القَمَرُ', 'يُنِيرُ', 'اللَّيْلَ'],
      hint: 'الجملة الاسمية تبدأ بالمبتدأ (القَمَرُ)'
    },
    {
      id: 3,
      targetType: 'فعلية',
      sentence: 'يَسْقِي الفَلاَّحُ الزَّرْعَ',
      words: ['الزَّرْعَ', 'يَسْقِي', 'الفَلاَّحُ'],
      correctOrder: ['يَسْقِي', 'الفَلاَّحُ', 'الزَّرْعَ'],
      hint: 'الجملة الفعلية تبدأ بالفعل (يَسْقِي)'
    },
    {
      id: 4,
      targetType: 'اسمية',
      sentence: 'العِلْمُ نُورٌ سَاطِعٌ',
      words: ['سَاطِعٌ', 'نُورٌ', 'العِلْمُ'],
      correctOrder: ['العِلْمُ', 'نُورٌ', 'سَاطِعٌ'],
      hint: 'الجملة الاسمية تبدأ بالمبتدأ (العِلْمُ)'
    },
    {
      id: 5,
      targetType: 'فعلية',
      sentence: 'قَرَأَ الطَّالِبُ الدَّرْسَ',
      words: ['الدَّرْسَ', 'قَرَأَ', 'الطَّالِبُ'],
      correctOrder: ['قَرَأَ', 'الطَّالِبُ', 'الدَّرْسَ'],
      hint: 'الجملة الفعلية تبدأ بالفعل (قَرَأَ)'
    }
  ];
  const [s3Index, setS3Index] = useState<number>(0);

  // Stage 4 (Challenge / تحدى) sorting cards
  const [s4Cards, setS4Cards] = useState([
    { id: '1', text: 'سَافَرَ الأَبُ إِلَى مَكَّةَ', type: 'verbal' as const },
    { id: '2', text: 'الأَزْهَارُ جَمِيلَةٌ فِي الرَّبِيعِ', type: 'nominal' as const },
    { id: '3', text: 'يَكْتُبُ الشَّاعِرُ قَصِيدَةً', type: 'verbal' as const },
    { id: '4', text: 'الصِّدْقُ خُلُقٌ عَظِيمٌ', type: 'nominal' as const }
  ]);
  const [s4NominalBucket, setS4NominalBucket] = useState<string[]>([]);
  const [s4VerbalBucket, setS4VerbalBucket] = useState<string[]>([]);

  // Web Audio Synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = (
    type: 'whistle' | 'correct' | 'error' | 'click' | 'victory' | 'trainMove' | 'brake' | 'barrier_open' | 'barrier_alarm' | 'wrong'
  ) => {
    if (!soundEnabled) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'brake') {
        // Authentic Emergency Air Brake Hiss + Steel Friction Screech
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.45);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100, now);
        filter.Q.setValueAtTime(4.5, now);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (type === 'whistle') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(554.37, now);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.75);
        osc2.stop(now + 0.75);
      } else if (type === 'trainMove') {
        // Authentic steam train rhythmic chuffs
        [0, 0.15, 0.32, 0.52, 0.75, 1.0].forEach((t, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80 + (i % 2) * 30, now + t);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(280, now + t);
          gain.gain.setValueAtTime(0.08, now + t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.12);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + t);
          osc.stop(now + t + 0.14);
        });
      } else if (type === 'correct') {
        // Authentic conductor ticket punch click + station brass counter bell ting
        // 1. Crisp puncher transient (metal click)
        const punchOsc = ctx.createOscillator();
        const punchGain = ctx.createGain();
        punchOsc.type = 'square';
        punchOsc.frequency.setValueAtTime(1750, now);
        punchOsc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        punchGain.gain.setValueAtTime(0.12, now);
        punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        punchOsc.connect(punchGain);
        punchGain.connect(ctx.destination);
        punchOsc.start(now);
        punchOsc.stop(now + 0.05);

        // 2. Brass ticket counter bell (pure warm resonant ring)
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(880, now + 0.03); // A5 brass bell
        bellGain.gain.setValueAtTime(0.15, now + 0.03);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        bellOsc.connect(bellGain);
        bellGain.connect(ctx.destination);
        bellOsc.start(now + 0.03);
        bellOsc.stop(now + 0.65);
      } else if (type === 'error' || type === 'wrong') {
        // Railway pneumatic air pressure dump + heavy buffer clunk
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, now);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'barrier_open') {
        // Mechanical heavy iron lever ratchet clicks + gentle classic brass crossing bell
        // 1. Ratchet clicks (heavy lever moving)
        [0, 0.07, 0.14].forEach((t) => {
          const clickOsc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          clickOsc.type = 'triangle';
          clickOsc.frequency.setValueAtTime(320, now + t);
          clickGain.gain.setValueAtTime(0.09, now + t);
          clickGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.04);
          clickOsc.connect(clickGain);
          clickGain.connect(ctx.destination);
          clickOsc.start(now + t);
          clickOsc.stop(now + t + 0.05);
        });

        // 2. Station crossing bell (two harmonic brass chimes)
        [0.22, 0.48].forEach((t, i) => {
          const bell = ctx.createOscillator();
          const bGain = ctx.createGain();
          bell.type = 'sine';
          bell.frequency.setValueAtTime(i === 0 ? 1046.5 : 1318.5, now + t); // C6 then E6
          bGain.gain.setValueAtTime(0.13, now + t);
          bGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.45);
          bell.connect(bGain);
          bGain.connect(ctx.destination);
          bell.start(now + t);
          bell.stop(now + t + 0.5);
        });
      } else if (type === 'barrier_alarm') {
        // Authentic railway mechanical warning horn / buzzer
        [0, 0.18, 0.36].forEach((t, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(i % 2 === 0 ? 440 : 370, now + t);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(700, now + t);
          gain.gain.setValueAtTime(0.12, now + t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.14);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + t);
          osc.stop(now + t + 0.15);
        });
      } else if (type === 'victory') {
        // Mechanical ticket dispenser gear ticks + solid brass wax stamp thud impact
        // 1. Roller gear feed clicks
        [0, 0.08, 0.16, 0.24].forEach((t) => {
          const rOsc = ctx.createOscillator();
          const rGain = ctx.createGain();
          rOsc.type = 'triangle';
          rOsc.frequency.setValueAtTime(540, now + t);
          rGain.gain.setValueAtTime(0.06, now + t);
          rGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.035);
          rOsc.connect(rGain);
          rGain.connect(ctx.destination);
          rOsc.start(now + t);
          rOsc.stop(now + t + 0.04);
        });

        // 2. Heavy mechanical stamp impact (solid thud at 0.32s)
        const stampOsc = ctx.createOscillator();
        const stampGain = ctx.createGain();
        stampOsc.type = 'sine';
        stampOsc.frequency.setValueAtTime(90, now + 0.32);
        stampOsc.frequency.exponentialRampToValueAtTime(35, now + 0.55);
        stampGain.gain.setValueAtTime(0.18, now + 0.32);
        stampGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        stampOsc.connect(stampGain);
        stampGain.connect(ctx.destination);
        stampOsc.start(now + 0.32);
        stampOsc.stop(now + 0.65);

        // 3. Resonant brass confirmation ring
        const ringOsc = ctx.createOscillator();
        const ringGain = ctx.createGain();
        ringOsc.type = 'sine';
        ringOsc.frequency.setValueAtTime(1174.66, now + 0.36); // D6
        ringGain.gain.setValueAtTime(0.12, now + 0.36);
        ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        ringOsc.connect(ringGain);
        ringGain.connect(ctx.destination);
        ringOsc.start(now + 0.36);
        ringOsc.stop(now + 0.95);
      }
    } catch (e) {}
  };

  // Start Journey
  const handleStartJourney = () => {
    playSound('whistle');
    const name = passengerName.trim() || 'بطل اللغة';
    setPassengerName(name);
    try {
      localStorage.setItem('sentence_train_passenger', name);
    } catch (e) {}
    setStartTime(Date.now());
    setCurrentStage(1); // Proceed to Stage 1 (Discover)
  };

  // Randomized questions & puzzles state from question bank
  const [shuffledStage2Questions, setShuffledStage2Questions] = useState<any[]>(() =>
    getRandomStage2Questions('nominal_verbal')
  );
  const [shuffledStage3Puzzles, setShuffledStage3Puzzles] = useState<Stage3Puzzle[]>(() =>
    getRandomStage3Puzzles('nominal_verbal')
  );

  // Function to randomize question bank for any rule (strictly 5 questions for Stage 2 and Stage 3)
  const randomizeRuleBank = (ruleId: string) => {
    setShuffledStage2Questions(getRandomStage2Questions(ruleId));
    setShuffledStage3Puzzles(getRandomStage3Puzzles(ruleId));
  };

  useEffect(() => {
    randomizeRuleBank(selectedRuleId);
  }, [selectedRuleId]);

  // Every time the student enters Stage 2 (Classify / محطة التحويلة), pick 5 random questions from the bank
  useEffect(() => {
    if (currentStage === 2) {
      setShuffledStage2Questions(getRandomStage2Questions(selectedRuleId));
      setS2Index(0);
      setS2AnswerState('idle');
      setS2SelectedChoice(null);
      setTrainMovement('station');
    }
  }, [currentStage, selectedRuleId]);

  // Every time the student enters Stage 3 (Arrange / محطة الاصطفاف), pick 5 random sentences from the bank
  useEffect(() => {
    if (currentStage === 3) {
      setShuffledStage3Puzzles(getRandomStage3Puzzles(selectedRuleId));
      setS3Index(0);
      setTrainMovement('station');
    }
  }, [currentStage, selectedRuleId]);

  // Active Questions & Puzzles for current rule (strictly 5 questions, randomized each time)
  const activeStage2Questions = (
    shuffledStage2Questions.length > 0 
      ? shuffledStage2Questions 
      : getRandomStage2Questions(selectedRuleId)
  ).slice(0, STAGE2_QUESTIONS_LIMIT);
  const currentQ = activeStage2Questions[s2Index] || activeStage2Questions[0];
  const activeStage3Puzzles = (
    shuffledStage3Puzzles.length > 0 
      ? shuffledStage3Puzzles 
      : getRandomStage3Puzzles(selectedRuleId)
  ).slice(0, STAGE3_PUZZLES_LIMIT);
  const currentS3Puzzle = activeStage3Puzzles[s3Index] || activeStage3Puzzles[0];

  const handleStage2Choice = (choice: any) => {
    if (s2AnswerState === 'correct') return;
    setS2SelectedChoice(choice);
    const isCorrect = choice === currentQ.type;

    if (isCorrect) {
      // Barrier opens and train moves forward
      setTrainMovement('toNominal');
      const isLastQ = s2Index + 1 >= activeStage2Questions.length;
      if (isLastQ) {
        // Sound of the train departing on final question
        playSound('whistle');
        playSound('trainMove');
      } else {
        playSound('trainMove');
      }
      setS2AnswerState('correct');
      setScore(prev => prev + 25);
      setStars(prev => prev + 1);

      // Smoothly advance to next question/barrier after train finishes moving forward
      setTimeout(() => {
        handleStage2Next();
      }, isLastQ ? 1750 : 1350);
    } else {
      // Wrong Answer:
      // Barrier does NOT open, red light flashes, alarm and brake sound play
      setTrainMovement('station');
      playSound('barrier_alarm');
      playSound('brake');
      setS2AnswerState('wrong');

      // Reset to idle after 1100ms so user can immediately click again without text banners
      setTimeout(() => {
        setS2AnswerState('idle');
        setS2SelectedChoice(null);
      }, 1100);
    }
  };

  // Stage 2 Retry Handler (Return smoothly to station for another attempt)
  const handleStage2Retry = () => {
    playSound('click');
    setS2AnswerState('idle');
    setS2SelectedChoice(null);
    setTrainMovement('station');
  };

  // Stage 2 Next Question
  const handleStage2Next = () => {
    playSound('click');
    setS2SelectedChoice(null);
    setS2AnswerState('idle');
    setTrainMovement('station');

    if (s2Index + 1 < activeStage2Questions.length) {
      setS2Index(prev => prev + 1);
    } else {
      // Train departure sound at the end of Stage 2
      playSound('whistle');
      playSound('trainMove');
      setMaxUnlockedStage(prev => Math.max(prev, 3));
      setCurrentStage(3); // Proceed to Stage 3 (Arrange)
    }
  };

  return (
    <div 
      className="w-full h-full min-h-screen bg-[#0a1526] text-slate-100 font-['Tajawal',sans-serif] flex flex-col select-none overflow-x-hidden relative"
      dir={lang === 'en' ? 'ltr' : 'rtl'}
    >
      {/* =========================================================================
          1. TOP NAVIGATION HEADER (Only on Stages 2-4; Stages 0, 1 & 5 have their own full station views)
         ========================================================================= */}
      {currentStage > 1 && currentStage < 5 && (
        <header className="h-20 px-4 sm:px-8 flex items-center justify-between shadow-2xl z-30 shrink-0 bg-[#041619]/80 backdrop-blur-xl border-b border-teal-500/30 transition-all relative">
          {/* Top-left spacer to keep timeline stepper symmetrically centered */}
          <div className="w-11 sm:w-14 z-10" />

          {/* Center Section: Interactive 5-Stage Timeline Nodes */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto z-10">
            <div className="flex flex-col items-center select-none" dir={lang === 'en' ? 'ltr' : 'rtl'}>
              {/* Visual Nodes Timeline */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {[
                  { id: 1, label: lang === 'en' ? 'Ticket Office' : 'شباك التذاكر' },
                  { id: 2, label: lang === 'en' ? 'Switchyard' : 'محطة التحويلة' },
                  { id: 3, label: lang === 'en' ? 'Coupling Station' : 'محطة الاصطفاف' },
                  { id: 4, label: lang === 'en' ? 'Sorting Depot' : 'محطة الفرز' },
                  { id: 5, label: lang === 'en' ? 'Arrival Station' : 'محطة الوصول' }
                ].map((st, idx, arr) => (
                  <div key={st.id} className="flex items-center">
                    <button
                      onClick={() => {
                        if (st.id <= maxUnlockedStage) {
                          playSound('click');
                          setCurrentStage(st.id);
                        }
                      }}
                      disabled={st.id > maxUnlockedStage}
                      className={`h-7 sm:h-8 px-2 sm:px-3 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black transition-all whitespace-nowrap ${
                        st.id > maxUnlockedStage
                          ? 'opacity-40 cursor-not-allowed bg-[#031013]/90 text-slate-500 border border-slate-700/30'
                          : currentStage === st.id 
                          ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-stone-950 ring-4 ring-amber-400/30 shadow-[0_0_18px_rgba(245,158,11,0.5)] scale-105 cursor-pointer active:scale-95' 
                          : 'bg-teal-800/90 text-teal-100 border border-teal-500/50 hover:bg-teal-700 cursor-pointer active:scale-95'
                      }`}
                      title={st.id > maxUnlockedStage ? (lang === 'en' ? 'Stage locked, complete previous stages first' : 'المحطة مقفلة، أكمل المحطات السابقة أولاً') : (lang === 'en' ? `Go to: ${st.label}` : `الانتقال إلى: ${st.label}`)}
                    >
                      <span>{st.label}</span>
                    </button>
                    {idx < arr.length - 1 && (
                      <div className={`w-2 sm:w-3.5 h-[2px] mx-0.5 rounded-full ${
                        currentStage > st.id ? 'bg-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-teal-900/60'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges (Stars & Score) */}
          <div className="flex items-center gap-2 sm:gap-2.5 z-10 min-w-[88px] justify-end">
            {![2, 3, 4].includes(currentStage) && (
              <>
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-2xl bg-[#061e22]/80 border border-teal-500/40 shadow-md">
                  <Star size={17} className="fill-amber-400 text-amber-400 drop-shadow" />
                  <div className="flex flex-col text-right">
                    <span className="text-xs sm:text-sm font-black leading-tight text-amber-100">{stars}</span>
                    <span className="text-[9px] text-teal-300/80 font-bold">{lang === 'en' ? 'Stars' : 'النجوم'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-2xl bg-[#061e22]/80 border border-teal-500/40 shadow-md">
                  <Trophy size={17} className="text-amber-400 drop-shadow" />
                  <div className="flex flex-col text-right">
                    <span className="text-xs sm:text-sm font-black leading-tight text-amber-100">{score}</span>
                    <span className="text-[9px] text-teal-300/80 font-bold">{lang === 'en' ? 'Points' : 'النقاط'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>
      )}

      {/* =========================================================================
          2. MAIN GAME VIEWPORT
         ========================================================================= */}
      <main className="flex-1 relative flex flex-col justify-between overflow-hidden">
        {/* =====================================================================
            SCREEN 0: CENTRAL GRAMMAR STATION TERMINAL (5 Arched Platforms)
           ===================================================================== */}
        {currentStage === 0 && (
          <CentralGrammarStation
            passengerName={passengerName}
            onUpdatePassengerName={(name) => {
              setPassengerName(name);
              try {
                localStorage.setItem('sentence_train_passenger', name);
              } catch (e) {}
            }}
            selectedRuleId={selectedRuleId}
            onSelectAndStartRule={(ruleId, targetStage = 1) => {
              setSelectedRuleId(ruleId);
              randomizeRuleBank(ruleId);
              setS1ActiveTabId('');
              setS1ExIndex(0);
              setS2Index(0);
              setS2AnswerState('idle');
              setS2SelectedChoice(null);
              setS3Index(0);
              setTripDurationSeconds(0);
              setIsTimerPaused(false);
              setMaxUnlockedStage(targetStage);
              setCurrentStage(targetStage);
              if (!startTime) setStartTime(Date.now());
            }}
            onBack={onBack}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onOpenMenu={() => setShowSettingsModal(true)}
            playSound={playSound}
            currentStationIndex={1}
            totalStations={4}
            lang={lang}
          />
        )}

        {/* =====================================================================
            STAGE 1: DISCOVERY WORKSHOP & TICKET OFFICE (المحطة 1: تعرّف على وجهتك واحجز تذكرتك)
           ===================================================================== */}
        {currentStage === 1 && (
          <Stage1DiscoverTicketOffice
            activeRule={activeRule}
            passengerName={passengerName}
            onProceedToStage2={() => {
              playSound('whistle');
              setMaxUnlockedStage(prev => Math.max(prev, 2));
              setCurrentStage(2);
            }}
            onBackToStation={() => {
              playSound('click');
              setCurrentStage(0);
            }}
            playSound={playSound}
            soundEnabled={soundEnabled}
            lang={lang}
          />
        )}

        {/* =====================================================================
            STAGE 2: IN-GAME CLASSIFICATION (المحطة 2: صنّف)
           ===================================================================== */}
        {currentStage === 2 && (
          <CinematicTrainScene
            currentQ={currentQ}
            s2Index={s2Index}
            totalQuestions={activeStage2Questions.length}
            s2AnswerState={s2AnswerState}
            s2SelectedChoice={s2SelectedChoice}
            trainMovement={trainMovement}
            customChoices={activeRule.stage2Choices}
            onChoice={handleStage2Choice}
            onNext={handleStage2Next}
            onRetry={handleStage2Retry}
            onWhistle={() => playSound('whistle')}
            onNavigateStage={(stage) => {
              if (stage <= maxUnlockedStage) {
                playSound('click');
                setCurrentStage(stage);
              }
            }}
            ruleId={selectedRuleId}
            lang={lang}
          />
        )}

        {/* =====================================================================
            STAGE 3: ARRANGE CARRIAGES (المحطة 3: وصل ورتّب العربات)
           ===================================================================== */}
        {currentStage === 3 && (
          <Stage3WordOrderTrain
            puzzle={activeStage3Puzzles[s3Index] || activeStage3Puzzles[0]}
            puzzleIndex={s3Index}
            totalPuzzles={activeStage3Puzzles.length}
            score={score}
            stars={stars}
            onCorrect={(bonus) => {
              setScore(prev => prev + bonus);
              setStars(prev => prev + 1);
            }}
            onNextPuzzle={() => {
              setS3Index(prev => prev + 1);
            }}
            onCompleteStage={() => {
              setMaxUnlockedStage(prev => Math.max(prev, 4));
              setCurrentStage(4);
            }}
            playSound={playSound}
            lang={lang}
          />
        )}

        {/* =====================================================================
            STAGE 4: CHALLENGE SWITCHING YARD (المحطة 4: تحدّي التحويل والفرز)
           ===================================================================== */}
        {currentStage === 4 && (
          <Stage4ChallengeYard
            activeRule={activeRule}
            score={score}
            stars={stars}
            onAddScore={(pts) => setScore(prev => prev + pts)}
            onAddStar={() => setStars(prev => prev + 1)}
            onCompleteStage={() => {
              setMaxUnlockedStage(prev => Math.max(prev, 5));
              if (onWin) onWin(score);
              setCurrentStage(5);
            }}
            playSound={playSound}
            lang={lang}
          />
        )}

        {/* =====================================================================
            STAGE 5: ARRIVAL STATION (المحطة 5: محطة الوصول ومهمة إثبات الإتقان)
           ===================================================================== */}
        {currentStage === 5 && (
          <Stage5ArrivalStation
            activeRule={activeRule}
            passengerName={passengerName}
            score={score}
            stars={stars}
            tripDurationSeconds={tripDurationSeconds}
            maxUnlockedStage={maxUnlockedStage}
            soundEnabled={soundEnabled}
            playSound={playSound}
            lang={lang}
            onStopTimer={() => setIsTimerPaused(true)}
            onNavigateStage={(st) => {
              if (st <= maxUnlockedStage) {
                playSound('click');
                setCurrentStage(st);
              }
            }}
            onRestartTrip={() => {
              setTripDurationSeconds(0);
              setIsTimerPaused(false);
              setS2Index(0);
              setS3Index(0);
              randomizeRuleBank(selectedRuleId);
              setCurrentStage(1);
            }}
            onChooseNewDestination={() => {
              setTripDurationSeconds(0);
              setIsTimerPaused(false);
              setMaxUnlockedStage(1);
              setCurrentStage(0);
            }}
            onBackToCentral={() => {
              setTripDurationSeconds(0);
              setIsTimerPaused(false);
              setMaxUnlockedStage(1);
              setCurrentStage(0);
            }}
          />
        )}
      </main>

      {/* =========================================================================
          3. COMPREHENSIVE MODALS (Settings, How to Play, Achievements, Stats)
         ========================================================================= */}
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div 
              dir={lang === 'en' ? 'ltr' : 'rtl'}
              className="bg-[#11233d] border-2 border-[#1e3a66] rounded-3xl max-w-md w-full p-6 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#1e3a66] mb-4">
                <h3 className="text-xl font-black">{lang === 'en' ? 'Game Settings' : 'إعدادات اللعبة'}</h3>
                <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">
                  <X size={22} />
                </button>
              </div>
              <div className="space-y-4 text-sm font-bold">
                <div className="flex items-center justify-between">
                  <span>{lang === 'en' ? 'Sound Effects & Whistle' : 'المؤثرات الصوتية والصفارة'}</span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${
                      soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-600 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>{lang === 'en' ? 'Player Name' : 'اسم اللاعب'}</span>
                  <span className="text-amber-400">{passengerName}</span>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full mt-6 py-3 rounded-xl bg-blue-600 text-white font-bold cursor-pointer"
              >
                {lang === 'en' ? 'Close' : 'إغلاق'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How to Play Modal */}
      <AnimatePresence>
        {showHowToPlayModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div 
              dir={lang === 'en' ? 'ltr' : 'rtl'}
              className="bg-[#11233d] border-2 border-[#1e3a66] rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#1e3a66] mb-4">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <BookOpen size={22} className="text-sky-400" />
                  <span>{lang === 'en' ? 'How to Play Sentence Train?' : 'كيف ألعب قطار الجمل؟'}</span>
                </h3>
                <button onClick={() => setShowHowToPlayModal(false)} className="text-slate-400 hover:text-white">
                  <X size={22} />
                </button>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                <p>• <strong>{lang === 'en' ? 'Ticket Office:' : 'شباك التذاكر:'}</strong> {lang === 'en' ? 'Explore grammar concepts and get your departure ticket.' : 'تعرف على المبتدأ والخبر والفعل والفاعل واحصل على تذكرتك.'}</p>
                <p>• <strong>{lang === 'en' ? 'Switchyard:' : 'محطة التحويلة:'}</strong> {lang === 'en' ? 'Switch tracks to steer the locomotive to the correct route.' : 'اختر السكة لتوجيه القاطرة نحو المسار الصحيح.'}</p>
                <p>• <strong>{lang === 'en' ? 'Coupling Station:' : 'محطة الاصطفاف:'}</strong> {lang === 'en' ? 'Arrange wagons in the correct order to couple them to the train.' : 'اضغط على الكلمات بالترتيب الصحيح لربط العربات بالقاطرة.'}</p>
                <p>• <strong>{lang === 'en' ? 'Sorting Depot:' : 'محطة الفرز:'}</strong> {lang === 'en' ? 'Sort sentences into their matching freight wagons.' : 'افرز الجمل المعروضة وضع كل بطاقة في عربتها الصحيحة.'}</p>
                <p>• <strong>{lang === 'en' ? 'Arrival Station:' : 'محطة الوصول:'}</strong> {lang === 'en' ? 'Pass final inspection and earn your official Master Certificate.' : 'احصل على وسام القبطان وشهادة التميز النحوي.'}</p>
              </div>
              <button
                onClick={() => setShowHowToPlayModal(false)}
                className="w-full mt-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-black cursor-pointer"
              >
                {lang === 'en' ? "Understood! Let's Go!" : 'فهمت القواعد، فلننطلق!'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievementsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div 
              dir={lang === 'en' ? 'ltr' : 'rtl'}
              className="bg-[#11233d] border-2 border-[#1e3a66] rounded-3xl max-w-md w-full p-6 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#1e3a66] mb-4">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Trophy size={22} className="text-amber-400" />
                  <span>{lang === 'en' ? 'Achievement Badges' : 'أوسمة الإنجاز'}</span>
                </h3>
                <button onClick={() => setShowAchievementsModal(false)} className="text-slate-400 hover:text-white">
                  <X size={22} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Star size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">{lang === 'en' ? 'Star Hunter' : 'صائد النجوم'}</span>
                    <span className="text-xs text-slate-400">
                      {lang === 'en' ? `Collected ${stars} grammar stars` : `جمعت ${stars} نجمة نحوية`}
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Train size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">{lang === 'en' ? 'Grammar Captain' : 'قبطان القواعد'}</span>
                    <span className="text-xs text-slate-400">
                      {lang === 'en' ? 'Accurate railway routing and shunting' : 'توجيه دقيق لمسارات السكك الحديدية'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAchievementsModal(false)}
                className="w-full mt-6 py-3 rounded-xl bg-blue-600 text-white font-bold cursor-pointer"
              >
                {lang === 'en' ? 'Close' : 'إغلاق'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Modal */}
      <AnimatePresence>
        {showStatsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div 
              dir={lang === 'en' ? 'ltr' : 'rtl'}
              className="bg-[#11233d] border-2 border-[#1e3a66] rounded-3xl max-w-md w-full p-6 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#1e3a66] mb-4">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <BarChart3 size={22} className="text-emerald-400" />
                  <span>{lang === 'en' ? 'My Progress Board' : 'لوحة إنجازاتي'}</span>
                </h3>
                <button onClick={() => setShowStatsModal(false)} className="text-slate-400 hover:text-white">
                  <X size={22} />
                </button>
              </div>
              <div className="space-y-3 font-bold text-sm">
                <div className="flex justify-between p-2.5 bg-white/5 rounded-xl">
                  <span className="text-slate-400">{lang === 'en' ? 'Passenger:' : 'المسافر:'}</span>
                  <span className="text-white">{passengerName}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-white/5 rounded-xl">
                  <span className="text-slate-400">{lang === 'en' ? 'Total Points:' : 'إجمالي النقاط:'}</span>
                  <span className="text-amber-400">{score} XP</span>
                </div>
                <div className="flex justify-between p-2.5 bg-white/5 rounded-xl">
                  <span className="text-slate-400">{lang === 'en' ? 'Stars:' : 'النجوم:'}</span>
                  <span className="text-amber-400">⭐ {stars}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-white/5 rounded-xl">
                  <span className="text-slate-400">{lang === 'en' ? 'Accuracy:' : 'دقة الإجابات:'}</span>
                  <span className="text-emerald-400">95%</span>
                </div>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-full mt-6 py-3 rounded-xl bg-blue-600 text-white font-bold cursor-pointer"
              >
                {lang === 'en' ? 'Close' : 'إغلاق'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Floating Sound Toggle Button (أسفل يسار الصفحة) - Consistent across ALL stages & pages */}
      <motion.button
        id="sentence-train-global-sound-button"
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setSoundEnabled(!soundEnabled)}
        title={lang === 'en' ? (soundEnabled ? 'Mute' : 'Unmute') : (soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت')}
        className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#041c22]/90 border border-teal-400/50 hover:border-amber-400 text-teal-200 hover:text-amber-300 shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
      >
        {soundEnabled ? <Volume2 size={22} className="stroke-[2.2]" /> : <VolumeX size={22} className="text-red-400 stroke-[2.2]" />}
      </motion.button>

      {/* Persistent off-screen image cache to keep decoded GPU textures warm across stage transitions */}
      <div className="hidden pointer-events-none select-none opacity-0 fixed -top-[9999px] -left-[9999px]" aria-hidden="true">
        <img src="/station2_night_rail.jpg" alt="" loading="eager" decoding="sync" />
        <img src="/train_station_word_order_bg.jpg" alt="" loading="eager" decoding="sync" />
        <img src="/station4_depot_bg.jpg" alt="" loading="eager" decoding="sync" />
        <img src="/train_depot_yard_bg.jpg" alt="" loading="eager" decoding="sync" />
        <img src="/train_golden_station.jpg" alt="" loading="eager" decoding="sync" />
      </div>
    </div>
  );
};
