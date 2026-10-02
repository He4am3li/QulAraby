import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  Flag, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GrammarRule, Stage4Sentence } from '../../src/data/grammarRulesData';

interface Stage4ChallengeYardProps {
  activeRule: GrammarRule;
  score: number;
  stars: number;
  onAddScore: (points: number) => void;
  onAddStar: () => void;
  onCompleteStage: () => void;
  playSound: (type: 'whistle' | 'correct' | 'error' | 'click' | 'victory' | 'trainMove' | 'brake' | 'barrier_alarm') => void;
  lang?: 'ar' | 'en';
}

// Concise badge helper for card buttons to prevent any line breaks or container overflow
const getButtonShortLabel = (bucketKey: string, fallbackBadge: string, lang: 'ar' | 'en' = 'ar') => {
  if (lang === 'en') {
    switch (bucketKey) {
      case 'verb': return 'Verb';
      case 'noun': return fallbackBadge.includes('إن') || fallbackBadge.includes('إنّ') ? 'Inna Noun' : 'Kana Noun';
      case 'predicate': return fallbackBadge.includes('إن') || fallbackBadge.includes('إنّ') ? 'Inna Pred.' : 'Kana Pred.';
      case 'particle': return 'Particle';
      case 'mudhakkar': return 'Masc.';
      case 'muannath': return 'Fem.';
      case 'takseer': return 'Broken';
      case 'nominal': return fallbackBadge.includes('جر') ? 'Prep.' : 'Nominal';
      case 'verbal': return fallbackBadge.includes('مجرور') ? 'Genitive' : 'Verbal';
      default: return fallbackBadge || 'Carriage';
    }
  }
  switch (bucketKey) {
    case 'verb': return 'فعل ناسخ';
    case 'noun': return fallbackBadge.includes('إن') || fallbackBadge.includes('إنّ') ? 'اسم إنّ' : 'اسم كان';
    case 'predicate': return fallbackBadge.includes('إن') || fallbackBadge.includes('إنّ') ? 'خبر إنّ' : 'خبر كان';
    case 'particle': return 'حرف ناسخ';
    case 'mudhakkar': return 'مذكر';
    case 'muannath': return 'مؤنث';
    case 'takseer': return 'تكسير';
    case 'nominal': return fallbackBadge.includes('جر') ? 'حرف جر' : 'اسمية';
    case 'verbal': return fallbackBadge.includes('مجرور') ? 'اسم مجرور' : 'فعلية';
    default: return fallbackBadge || 'عربة';
  }
};

// Translated bucket titles for carriage signboards and placeholders
const getTranslatedBucketTitle = (bucket: { key: string; title: string }, lang: 'ar' | 'en' = 'ar') => {
  if (lang === 'en') {
    switch (bucket.key) {
      case 'verb': return 'Abrogating Verb';
      case 'noun': return bucket.title.includes('إن') || bucket.title.includes('إنّ') ? 'Inna Noun' : 'Kana Noun';
      case 'predicate': return bucket.title.includes('إن') || bucket.title.includes('إنّ') ? 'Inna Predicate' : 'Kana Predicate';
      case 'particle': return 'Abrogating Particle';
      case 'mudhakkar': return 'Sound Masculine Plural';
      case 'muannath': return 'Sound Feminine Plural';
      case 'takseer': return 'Broken Plural';
      case 'nominal': return bucket.title.includes('جر') ? 'Preposition' : 'Nominal Sentence';
      case 'verbal': return bucket.title.includes('مجرور') ? 'Genitive Noun' : 'Verbal Sentence';
      default: return bucket.title;
    }
  }
  return bucket.title;
};

// Slot placeholder text inside each carriage
const getBucketSlotLabel = (bucket: { key: string; title: string }, lang: 'ar' | 'en', isSelectedCard: boolean) => {
  const title = getTranslatedBucketTitle(bucket, lang);
  if (lang === 'en') {
    return isSelectedCard ? `Click to place (${title}) here` : `Slot for ${title}`;
  }
  return isSelectedCard ? `اضغط لوضع بطاقة (${bucket.title}) هنا` : `موضع ${bucket.title}`;
};

// Localized Stage 4 signboard prompt
const getStage4PromptTitle = (ruleId: string, lang: 'ar' | 'en', fallbackTitle: string) => {
  if (lang === 'en') {
    switch (ruleId) {
      case 'kana_sisters': return 'Classify elements of Kana & its Sisters';
      case 'inna_sisters': return 'Classify elements of Inna & its Sisters';
      case 'prepositions': return 'Classify: Preposition vs. Genitive Noun';
      case 'plurals': return 'Classify words by plural type';
      case 'nominal_verbal': return 'Classify sentences: Nominal vs. Verbal';
      default: return 'Classify cards into the correct carriages';
    }
  }
  if (ruleId === 'prepositions') {
    return 'صنّف الكلمات: حرف جر أم اسم مجرور';
  }
  return fallbackTitle || 'ضع كل بطاقة في العربة المناسبة';
};

// Helper to provide context-appropriate closed carriage per grammar lesson
const getClosedCarriageInfo = (ruleId: string, lang: 'ar' | 'en' = 'ar') => {
  if (lang === 'en') {
    switch (ruleId) {
      case 'nominal_verbal':
        return { title: 'Semi-sentence Wagon', status: 'Completed & Locked' };
      case 'plurals':
        return { title: 'Singular & Dual Wagon', status: 'Completed & Locked' };
      case 'kana_sisters':
        return { title: 'Inna & Sisters Wagon', status: 'Completed & Locked' };
      case 'inna_sisters':
        return { title: 'Kana & Sisters Wagon', status: 'Completed & Locked' };
      case 'prepositions':
        return { title: 'Nominative Nouns Wagon', status: 'Completed & Locked' };
      default:
        return { title: 'Reserved Wagon', status: 'Completed & Locked' };
    }
  }
  switch (ruleId) {
    case 'nominal_verbal':
      return { title: 'عربة شبه الجملة', status: 'مكتملة ومغلقة' };
    case 'plurals':
      return { title: 'عربة المفرد والمثنى', status: 'مكتملة ومغلقة' };
    case 'kana_sisters':
      return { title: 'عربة الحروف الناسخة', status: 'مكتملة ومغلقة' };
    case 'inna_sisters':
      return { title: 'عربة الأفعال الناسخة', status: 'مكتملة ومغلقة' };
    case 'prepositions':
      return { title: 'عربة الأسماء المرفوعة', status: 'مكتملة ومغلقة' };
    default:
      return { title: 'عربة الركاب المحجوزة', status: 'مكتملة ومغلقة' };
  }
};

// Simple shuffle utility
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const Stage4ChallengeYard: React.FC<Stage4ChallengeYardProps> = ({
  activeRule,
  score,
  stars,
  onAddScore,
  onAddStar,
  onCompleteStage,
  playSound,
  lang = 'ar',
}) => {
  const is3Buckets = (activeRule.stage4Buckets && activeRule.stage4Buckets.length >= 3) || ['kana_sisters', 'inna_sisters', 'plurals'].includes(activeRule.id);

  const bucket1 = activeRule.stage4Buckets[0] || { key: 'nominal', title: 'عربة الجملة الاسمية', color: 'sky', badge: 'اسمية' };
  const bucket2 = activeRule.stage4Buckets[1] || { key: 'verbal', title: 'عربة الجملة الفعلية', color: 'emerald', badge: 'فعلية' };
  const bucket3 = is3Buckets ? (activeRule.stage4Buckets[2] || { key: 'takseer', title: 'عربة جمع التكسير', color: 'amber', badge: 'تكسير' }) : null;
  const closedCarriage = getClosedCarriageInfo(activeRule.id, lang);

  const c2Bucket = is3Buckets ? bucket2 : bucket1;
  const c3Bucket = is3Buckets ? (bucket3 || bucket2) : bucket2;

  // Shuffled sentences pool for this round
  const [sentences, setSentences] = useState<Stage4Sentence[]>([]);

  // Placements of sentences into carriages:
  // c1: Carriage 1 (active in 3-bucket mode)
  // c2: Carriage 2
  // c3: Carriage 3
  const [placements, setPlacements] = useState<{ [sentenceId: string]: 'c1' | 'c2' | 'c3' | null }>({});

  // Selected card in bottom tray waiting for carriage click
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Train animation state
  const [trainOffset, setTrainOffset] = useState<number>(0);
  const [wheelAngle, setWheelAngle] = useState<number>(0);
  const [isEntering, setIsEntering] = useState<boolean>(true);
  const [isDeparting, setIsDeparting] = useState<boolean>(false);

  // Verification states
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [isBraking, setIsBraking] = useState<boolean>(false);
  const [wrongSentenceIds, setWrongSentenceIds] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [bgReady, setBgReady] = useState<boolean>(false);

  // Pre-check if background image is already cached to eliminate train-before-background pop-in
  useEffect(() => {
    const img = new Image();
    img.src = '/station4_depot_bg.jpg';
    if (img.complete) {
      setBgReady(true);
    } else {
      img.onload = () => setBgReady(true);
      img.onerror = () => setBgReady(true);
      const timer = setTimeout(() => setBgReady(true), 150);
      return () => clearTimeout(timer);
    }
  }, []);

  const animFrameRef = useRef<number | null>(null);

  // Initialize and randomize sentences when rule changes
  useEffect(() => {
    const allSentences = activeRule.stage4Sentences || [];
    let combined: Stage4Sentence[] = [];

    if (is3Buckets && bucket3) {
      const fromB1 = allSentences.filter(s => s.type === bucket1.key);
      const fromB2 = allSentences.filter(s => s.type === bucket2.key);
      const fromB3 = allSentences.filter(s => s.type === bucket3.key);

      const pickedB1 = shuffleArray(fromB1).slice(0, 2);
      const pickedB2 = shuffleArray(fromB2).slice(0, 2);
      const pickedB3 = shuffleArray(fromB3).slice(0, 2);
      combined = shuffleArray([...pickedB1, ...pickedB2, ...pickedB3]);
    } else {
      const fromB1 = allSentences.filter(s => s.type === bucket1.key);
      const fromB2 = allSentences.filter(s => s.type === bucket2.key);

      const pickedB1 = shuffleArray(fromB1).slice(0, 2);
      const pickedB2 = shuffleArray(fromB2).slice(0, 2);
      combined = shuffleArray([...pickedB1, ...pickedB2]);
    }

    setSentences(combined);
    const initialPlacements: { [k: string]: null } = {};
    combined.forEach((s: Stage4Sentence) => { initialPlacements[s.id] = null; });
    setPlacements(initialPlacements);
    setSelectedCardId(null);
    setIsWrong(false);
    setIsBraking(false);
    setWrongSentenceIds([]);
    setFeedbackMessage(null);

    // Initial Arrival Train Animation
    setIsEntering(true);
    setTrainOffset(380);
    let start: number | null = null;
    const duration = 1200;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentX = 380 * (1 - ease);
      setTrainOffset(currentX);
      setWheelAngle(prev => (prev - 7) % 360);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setTrainOffset(0);
        setIsEntering(false);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeRule.id]);

  // Derived placed sentences
  const placedInC1 = sentences.filter(s => placements[s.id] === 'c1');
  const placedInC2 = sentences.filter(s => placements[s.id] === 'c2');
  const placedInC3 = sentences.filter(s => placements[s.id] === 'c3');
  const totalPlacedCount = Object.values(placements).filter(Boolean).length;
  const allPlaced = sentences.length > 0 && totalPlacedCount === sentences.length;

  const handleCardClick = (id: string) => {
    if (isDeparting || isEntering) return;
    playSound('click');
    setIsWrong(false);
    setWrongSentenceIds([]);
    setFeedbackMessage(null);
    setSelectedCardId(prev => (prev === id ? null : id));
  };

  const handleAssignToCarriage = (carriage: 'c1' | 'c2' | 'c3') => {
    if (!selectedCardId || isDeparting || isEntering) return;
    playSound('click');
    setIsWrong(false);
    setWrongSentenceIds([]);
    setFeedbackMessage(null);

    setPlacements(prev => {
      const next = { ...prev };
      const existingInCarriage = Object.keys(next).filter(k => next[k] === carriage);
      if (existingInCarriage.length >= 2 && !existingInCarriage.includes(selectedCardId)) {
        next[existingInCarriage[0]] = null;
      }
      next[selectedCardId] = carriage;
      return next;
    });

    setSelectedCardId(null);
  };

  const handleQuickAssign = (sentenceId: string, carriage: 'c1' | 'c2' | 'c3') => {
    if (isDeparting || isEntering) return;
    playSound('click');
    setIsWrong(false);
    setWrongSentenceIds([]);
    setFeedbackMessage(null);

    setPlacements(prev => {
      const next = { ...prev };
      const existingInCarriage = Object.keys(next).filter(k => next[k] === carriage);
      if (existingInCarriage.length >= 2 && !existingInCarriage.includes(sentenceId)) {
        next[existingInCarriage[0]] = null;
      }
      next[sentenceId] = carriage;
      return next;
    });

    if (selectedCardId === sentenceId) setSelectedCardId(null);
  };

  const handleRemoveFromCarriage = (sentenceId: string) => {
    if (isDeparting || isEntering) return;
    playSound('click');
    setPlacements(prev => ({
      ...prev,
      [sentenceId]: null
    }));
    setIsWrong(false);
    setWrongSentenceIds([]);
    setFeedbackMessage(null);
  };

  const handleReset = () => {
    if (isDeparting || isEntering) return;
    playSound('click');
    const resetPlacements: { [k: string]: null } = {};
    sentences.forEach(s => { resetPlacements[s.id] = null; });
    setPlacements(resetPlacements);
    setSelectedCardId(null);
    setIsWrong(false);
    setIsBraking(false);
    setWrongSentenceIds([]);
    setFeedbackMessage(null);
  };

  // Verification & Departure
  const handleCheckAndDepart = () => {
    if (isDeparting || isEntering) return;

    if (!allPlaced) {
      playSound('click');
      setFeedbackMessage('ضع كل بطاقة في العربة المناسبة أولاً قبل التحقق والانطلاق!');
      return;
    }

    const wrongIds: string[] = [];

    sentences.forEach(sentence => {
      const assigned = placements[sentence.id];
      if (is3Buckets) {
        if (sentence.type === bucket1.key) {
          if (assigned !== 'c1') wrongIds.push(sentence.id);
        } else if (sentence.type === bucket2.key) {
          if (assigned !== 'c2') wrongIds.push(sentence.id);
        } else if (bucket3 && sentence.type === bucket3.key) {
          if (assigned !== 'c3') wrongIds.push(sentence.id);
        }
      } else {
        if (sentence.type === bucket1.key) {
          if (assigned !== 'c2') wrongIds.push(sentence.id);
        } else if (sentence.type === bucket2.key) {
          if (assigned !== 'c3') wrongIds.push(sentence.id);
        }
      }
    });

    if (wrongIds.length === 0) {
      setIsWrong(false);
      setIsBraking(false);
      setFeedbackMessage(null);
      playSound('correct');
      playSound('whistle');
      playSound('trainMove');
      setIsDeparting(true);
      onAddScore(40);
      onAddStar();

      let start: number | null = null;
      const duration = 2200;

      const animateDeparture = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = Math.pow(progress, 2.8);
        const currentX = -ease * 1400;
        setTrainOffset(currentX);
        setWheelAngle(prev => (prev - 16) % 360);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animateDeparture);
        } else {
          onCompleteStage();
        }
      };

      animFrameRef.current = requestAnimationFrame(animateDeparture);
    } else {
      setIsWrong(true);
      setIsBraking(true);
      setWrongSentenceIds(wrongIds);
      playSound('barrier_alarm');
      playSound('brake');
      setFeedbackMessage(`تنبيه السكة: توجد ${wrongIds.length} بطاقة في عربة غير صحيحة، راجع التصنيف وحاول ثانية!`);
      setTimeout(() => {
        setIsBraking(false);
      }, 1400);
    }
  };

  return (
    <div 
      dir="rtl"
      className={`flex-1 flex flex-col justify-between relative overflow-hidden select-none min-h-[calc(100vh-5rem)] bg-[#020a0d] transition-opacity duration-200 ${
        bgReady ? 'opacity-100' : 'opacity-90'
      }`}
    >
      {/* 1. Cinematic Background with lag prevention & robust fallback */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/station4_depot_bg.jpg"
          alt="Nighttime Railway Yard"
          loading="eager"
          decoding="sync"
          // @ts-ignore
          fetchPriority="high"
          onLoad={() => setBgReady(true)}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.indexOf('train_depot_yard_bg.jpg') === -1) {
              target.src = '/train_depot_yard_bg.jpg';
            } else if (target.src.indexOf('train_yard.jpg') === -1) {
              target.src = '/train_yard.jpg';
            } else {
              target.src = '/station_night_bg.jpg';
            }
            setBgReady(true);
          }}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.80] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#010c10]/95 via-[#031b22]/40 to-[#010c10]/60" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#010b10]/25 to-[#01070a]/70" />
      </div>

      {/* 2. Top Station Plaque: Dynamic Prompt from active rule */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4 flex flex-col items-center">
        <div className="relative flex flex-col items-center -mb-2 z-10">
          <div className="w-0.5 h-6 bg-gradient-to-b from-amber-600 to-amber-400" />
          <div className="w-9 h-4 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 rounded-t-full shadow-md" />
          <div className="w-7 h-2 bg-amber-200 rounded-b-full shadow-[0_0_15px_rgba(254,240,138,0.9)] animate-pulse" />
        </div>

        {/* Station Signboard for Prompt (Unified Dimensions across Stages 2, 3 & 4) */}
        <div className="relative w-full max-w-2xl px-4 sm:px-8 py-2 sm:py-2.5 h-[72px] sm:h-[80px] flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[#09222c]/95 via-[#05171e]/98 to-[#09222c]/95 border-2 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.25),inset_0_1px_4px_rgba(255,255,255,0.2)] text-center backdrop-blur-md overflow-hidden">
          <div className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
          <div className="absolute top-1.5 left-2 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
          <div className="absolute bottom-1.5 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
          <div className="absolute bottom-1.5 left-2 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />

          {(() => {
            const promptTitle = getStage4PromptTitle(activeRule.id, lang, activeRule.stage4Prompt?.title || '');
            return (
              <h1 className={`font-black text-amber-200 tracking-wide font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-2 ${
                promptTitle.length > 38
                  ? 'text-xs sm:text-sm md:text-base'
                  : promptTitle.length > 25
                  ? 'text-sm sm:text-base md:text-lg'
                  : 'text-base sm:text-xl md:text-2xl'
              }`} dir={lang === 'en' ? 'ltr' : 'rtl'}>
                {promptTitle}
              </h1>
            );
          })()}
        </div>

        {/* Question Progress Dots under the question rectangle (Unifying Stage 2, 3 & 4) */}
        <div className="flex items-center justify-center gap-2 mt-2.5 sm:mt-3" dir="rtl">
          {sentences.map((sentence, idx) => {
            const isCorrect = isDeparting || (
              is3Buckets
                ? (sentence.type === bucket1.key && placements[sentence.id] === 'c1') ||
                  (sentence.type === bucket2.key && placements[sentence.id] === 'c2') ||
                  (bucket3 && sentence.type === bucket3.key && placements[sentence.id] === 'c3')
                : (sentence.type === bucket1.key && placements[sentence.id] === 'c2') ||
                  (sentence.type === bucket2.key && placements[sentence.id] === 'c3')
            );
            const isAssigned = placements[sentence.id] !== null;
            return (
              <div
                key={`s4-pip-${sentence.id || idx}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCorrect
                    ? 'w-4 sm:w-5 bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                    : isAssigned
                    ? 'w-4 sm:w-5 bg-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                    : 'w-2.5 sm:w-3 bg-slate-800/80 border border-slate-700/60'
                }`}
                title={`البطاقة ${idx + 1} من ${sentences.length}`}
              />
            );
          })}
        </div>
      </div>

      {/* 3. Main Stage: Moving Train SVG with Dynamic Closed & Open Carriages */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-2 sm:px-4 my-auto">
        <div className={`relative w-full overflow-hidden rounded-3xl bg-transparent p-1 sm:p-2 select-none ${
          isWrong && !isDeparting ? 'animate-shake' : ''
        }`}>
          <svg
            viewBox="0 0 980 230"
            className="w-full h-auto select-none"
            style={{ filter: isBraking ? 'drop-shadow(0 0 15px rgba(239,68,68,0.7))' : 'drop-shadow(0 10px 25px rgba(0,0,0,0.85))' }}
          >
            <defs>
              <linearGradient id="s4LocoNavy" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="40%" stopColor="#172554" />
                <stop offset="70%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              <linearGradient id="s4CarriageBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="30%" stopColor="#1e3a8a" />
                <stop offset="70%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              <linearGradient id="s4GoldBevel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              <linearGradient id="s4HeadlightBeam" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#fde047" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="s4HeadlightRedBeam" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#ff4d4d" stopOpacity="0.95" />
                <stop offset="40%" stopColor="#ef4444" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
              </linearGradient>

              <radialGradient id="s4SteamSmoke" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Tracks */}
            <g id="railway-tracks">
              <rect x="0" y="180" width="980" height="26" fill="#0b131f" opacity="0.85" />
              {Array.from({ length: 49 }).map((_, i) => (
                <rect
                  key={`tie-${i}`}
                  x={i * 20 + 2}
                  y="178"
                  width="13"
                  height="19"
                  rx="2"
                  fill="#2a1408"
                  stroke="#150a04"
                  strokeWidth="1"
                />
              ))}
              <rect x="0" y="174" width="980" height="5.5" rx="1.5" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />
              <rect x="0" y="173" width="980" height="1.8" fill="#ffffff" opacity="0.95" />
              <rect x="0" y="191" width="980" height="3" fill="#334155" opacity="0.6" />
            </g>

            {/* Train Group */}
            <g transform={`translate(${trainOffset}, 0)`}>
              {/* Headlight Beam */}
              <polygon
                points="-140,140 10,143 10,155 -140,175"
                fill={isBraking ? 'url(#s4HeadlightRedBeam)' : 'url(#s4HeadlightBeam)'}
                opacity={isBraking ? 0.95 : 0.85}
              />

              {/* Steam Plume */}
              <g id="steam-smoke-plume">
                {[
                  { cx: 58, cy: 54, r: 12, drift: 0 },
                  { cx: 38, cy: 38, r: 18, drift: -8 },
                  { cx: 12, cy: 22, r: 25, drift: -16 },
                  { cx: -18, cy: 8, r: 32, drift: -28 },
                ].map((puff, idx) => {
                  const puffX = isDeparting ? puff.cx - 28 * idx : puff.cx;
                  const puffY = isDeparting ? puff.cy - 7 * idx : puff.cy;
                  const puffR = isDeparting ? puff.r * 1.4 : puff.r;
                  return (
                    <circle
                      key={`puff-${idx}`}
                      cx={puffX}
                      cy={puffY}
                      r={puffR}
                      fill="url(#s4SteamSmoke)"
                      className={isDeparting ? 'animate-ping' : ''}
                      style={{ animationDuration: `${1.2 + idx * 0.4}s` }}
                    />
                  );
                })}
              </g>

              {/* Locomotive */}
              <g id="locomotive-body">
                <ellipse cx="98" cy="188" rx="88" ry="8" fill="#000" opacity="0.65" filter="blur(3px)" />
                <polygon points="12,176 2,176 12,150 32,150" fill="#091e28" stroke="#d97706" strokeWidth="1.5" />
                <line x1="6" y1="174" x2="20" y2="154" stroke="#f59e0b" strokeWidth="1.4" />
                <line x1="12" y1="174" x2="26" y2="154" stroke="#f59e0b" strokeWidth="1.4" />

                <rect x="10" y="138" width="16" height="18" rx="3" fill="#0f172a" stroke={isBraking ? '#ef4444' : '#d97706'} strokeWidth="1.2" />
                <circle cx="16" cy="147" r="6" fill={isBraking ? '#ef4444' : '#fde047'} stroke={isBraking ? '#b91c1c' : '#b45309'} strokeWidth="1.2" />
                <circle cx="16" cy="147" r="3.5" fill="#ffffff" filter={`drop-shadow(0 0 6px ${isBraking ? '#f87171' : '#fef08a'})`} />

                <rect x="24" y="98" width="94" height="68" rx="10" fill="url(#s4LocoNavy)" stroke="#38bdf8" strokeWidth="1.4" />
                {[46, 72, 98].map((bx, i) => (
                  <g key={`band-${i}`}>
                    <line x1={bx} y1="98" x2={bx} y2="166" stroke="url(#s4GoldBevel)" strokeWidth="2.5" />
                    <circle cx={bx} cy="104" r="1.2" fill="#fef08a" />
                    <circle cx={bx} cy="160" r="1.2" fill="#fef08a" />
                  </g>
                ))}

                <path d="M 58 98 L 62 64 L 74 64 L 78 98 Z" fill="#0f172a" stroke="#d97706" strokeWidth="1.5" />
                <ellipse cx="68" cy="64" rx="9" ry="3.5" fill="url(#s4GoldBevel)" stroke="#78350f" strokeWidth="1" />
                <path d="M 86 98 C 86 82, 102 82, 102 98 Z" fill="url(#s4GoldBevel)" stroke="#78350f" strokeWidth="1.2" />

                <rect x="114" y="76" width="64" height="90" rx="6" fill="url(#s4LocoNavy)" stroke="#38bdf8" strokeWidth="1.5" />
                <rect x="108" y="72" width="76" height="8" rx="3" fill="url(#s4GoldBevel)" stroke="#78350f" strokeWidth="1" />
                <rect x="122" y="88" width="20" height="26" rx="4" fill="#fef08a" stroke="#78350f" strokeWidth="1.2" />
                <rect x="150" y="88" width="20" height="26" rx="4" fill="#fef08a" stroke="#78350f" strokeWidth="1.2" />
                <circle cx="132" cy="100" r="5" fill="#78350f" />
                <polygon points="146,136 154,128 146,120 138,128" fill="url(#s4GoldBevel)" stroke="#78350f" strokeWidth="0.8" />

                {[46, 88, 130].map((wx, i) => {
                  const rad = (wheelAngle * Math.PI) / 180;
                  const pinX = wx + Math.cos(rad) * 9;
                  const pinY = 170 + Math.sin(rad) * 9;
                  return (
                    <g key={`wheel-${i}`}>
                      <circle cx={wx} cy="170" r="16" fill="#020617" stroke="url(#s4GoldBevel)" strokeWidth="2.5" />
                      <circle cx={wx} cy="170" r="11" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                      {[0, 60, 120].map(deg => {
                        const sRad = ((deg + wheelAngle) * Math.PI) / 180;
                        return (
                          <line
                            key={`spoke-${deg}`}
                            x1={wx - Math.cos(sRad) * 11}
                            y1={170 - Math.sin(sRad) * 11}
                            x2={wx + Math.cos(sRad) * 11}
                            y2={170 + Math.sin(sRad) * 11}
                            stroke="#94a3b8"
                            strokeWidth="1.2"
                          />
                        );
                      })}
                      <circle cx={wx} cy="170" r="4" fill="url(#s4GoldBevel)" />
                      <circle cx={pinX} cy={pinY} r="2.5" fill="#ffffff" />
                    </g>
                  );
                })}

                {(() => {
                  const rad = (wheelAngle * Math.PI) / 180;
                  const p1x = 46 + Math.cos(rad) * 9;
                  const p1y = 170 + Math.sin(rad) * 9;
                  const p3x = 130 + Math.cos(rad) * 9;
                  const p3y = 170 + Math.sin(rad) * 9;
                  return (
                    <line
                      x1={p1x}
                      y1={p1y}
                      x2={p3x}
                      y2={p3y}
                      stroke="#e2e8f0"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
                    />
                  );
                })()}

                <rect x="178" y="164" width="18" height="6" rx="2" fill="url(#s4GoldBevel)" stroke="#78350f" strokeWidth="0.8" />
              </g>

              {/* =========================================================
                  CARRIAGE 1 (Leftmost Carriage: Bucket 1 in 3-bucket mode, else Closed)
                 ========================================================= */}
              {is3Buckets ? (
                <g
                  id="carriage-1-bucket1"
                  transform="translate(196, 0)"
                  className="cursor-pointer group select-none"
                  onClick={() => {
                    if (selectedCardId) handleAssignToCarriage('c1');
                  }}
                >
                  <ellipse cx="120" cy="188" rx="114" ry="8" fill="#000" opacity="0.65" filter="blur(3px)" />
                  {[32, 64, 176, 208].map((wx, i) => (
                    <g key={`c1-wheel-${i}`}>
                      <circle cx={wx} cy="172" r="13" fill="#020617" stroke="url(#s4GoldBevel)" strokeWidth="2" />
                      <circle cx={wx} cy="172" r="7" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                      <circle cx={wx} cy="172" r="3" fill="url(#s4GoldBevel)" />
                    </g>
                  ))}

                  <rect
                    x="10"
                    y="86"
                    width="220"
                    height="82"
                    rx="8"
                    fill="url(#s4CarriageBlue)"
                    stroke={
                      placedInC1.some(s => wrongSentenceIds.includes(s.id))
                        ? '#ef4444'
                        : selectedCardId && placedInC1.length < 2
                        ? '#c084fc'
                        : 'url(#s4GoldBevel)'
                    }
                    strokeWidth={selectedCardId && placedInC1.length < 2 ? '3' : '2.8'}
                    className="transition-all group-hover:brightness-110"
                  />
                  <rect x="6" y="82" width="228" height="7" rx="2.5" fill="url(#s4GoldBevel)" stroke="#78350f" strokeWidth="0.8" />

                  {/* Carriage Header */}
                  <rect x="20" y="92" width="200" height="20" rx="4" fill="#031118" stroke="#7e22ce" strokeWidth="1" />
                  {placedInC1.length >= 2 ? (
                    <g>
                      <circle cx="196" cy="102" r="7.5" fill="#c084fc" stroke="#fef08a" strokeWidth="1.2" filter="drop-shadow(0 0 5px rgba(192,132,252,0.8))" />
                      <path d="M 193 102 L 195 104 L 199 99.5" fill="none" stroke="#3b0764" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <text x="110" y="106" textAnchor="middle" fill="#f3e8ff" fontSize="12" fontWeight="900" fontFamily="serif">
                        {getTranslatedBucketTitle(bucket1, lang)} ({placedInC1.length}/2)
                      </text>
                    </g>
                  ) : (
                    <text x="120" y="106" textAnchor="middle" fill="#c084fc" fontSize="12" fontWeight="900" fontFamily="serif">
                      {getTranslatedBucketTitle(bucket1, lang)}
                    </text>
                  )}

                  {/* Slots */}
                  <rect
                    x="20"
                    y="116"
                    width="200"
                    height="46"
                    rx="6"
                    fill={placedInC1.length > 0 ? '#1b0d2a' : '#12071f'}
                    stroke={
                      placedInC1.some(s => wrongSentenceIds.includes(s.id))
                        ? '#ef4444'
                        : placedInC1.length > 0
                        ? '#c084fc'
                        : selectedCardId
                        ? '#e9d5ff'
                        : '#581c87'
                    }
                    strokeWidth={placedInC1.length > 0 ? '2' : '1.5'}
                    strokeDasharray={placedInC1.length > 0 ? 'none' : '4 3'}
                    className="transition-all"
                  />

                  {placedInC1.length > 0 ? (
                    <g>
                      {placedInC1.map((s, idx) => {
                        const total = placedInC1.length;
                        const py = total === 1 ? 144 : idx === 0 ? 131 : 151;
                        const isItemWrong = wrongSentenceIds.includes(s.id);
                        return (
                          <g
                            key={s.id}
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromCarriage(s.id);
                            }}
                          >
                            <rect
                              x="24"
                              y={py - 12}
                              width="192"
                              height={total === 1 ? 26 : 18}
                              rx="4"
                              fill={isItemWrong ? '#fecdd3' : '#faf5ff'}
                              stroke={isItemWrong ? '#ef4444' : '#9333ea'}
                              strokeWidth="1"
                            />
                            <text
                              x="120"
                              y={total === 1 ? py + 5 : py + 2}
                              textAnchor="middle"
                              fill="#3b0764"
                              fontSize={total === 1 ? '12' : '10'}
                              fontWeight="900"
                              fontFamily="Amiri, 'Noto Naskh Arabic', serif"
                            >
                              {s.text}
                            </text>
                            {isItemWrong && (
                              <g>
                                <circle cx="204" cy={total === 1 ? py - 1 : py - 3} r="5" fill="#dc2626" />
                                <text x="204" y={total === 1 ? py + 2 : py} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">✕</text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  ) : (
                    <text x="120" y="143" textAnchor="middle" fill="#94a3b8" fontSize="11" opacity="0.7">
                      {getBucketSlotLabel(bucket1, lang, !!selectedCardId)}
                    </text>
                  )}

                  <rect x="230" y="164" width="18" height="6" rx="2" fill="url(#s4GoldBevel)" stroke="#78350f" strokeWidth="0.8" />
                </g>
              ) : (
                <g
                  id="carriage-1-closed"
                  transform="translate(196, 0)"
                  className="select-none pointer-events-none"
                >
                  <ellipse cx="120" cy="188" rx="114" ry="8" fill="#000" opacity="0.65" filter="blur(3px)" />
                  {[32, 64, 176, 208].map((wx, i) => (
                    <g key={`c1-wheel-${i}`}>
                      <circle cx={wx} cy="172" r="13" fill="#020617" stroke="url(#s4GoldBevel)" strokeWidth="2" />
                      <circle cx={wx} cy="172" r="7" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                      <circle cx={wx} cy="172" r="3" fill="url(#s4GoldBevel)" />
                    </g>
                  ))}

                  <rect
                    x="10"
                    y="86"
                    width="220"
                    height="82"
                    rx="8"
                    fill="url(#s4CarriageBlue)"
                    stroke="url(#s4GoldBevel)"
                    strokeWidth="2.8"
                    opacity="0.9"
                  />
                  <rect x="6" y="82" width="228" height="7" rx="2.5" fill="url(#s4GoldBevel)" stroke="#78350f" strokeWidth="0.8" />

                  {/* Carriage Header with Lesson-specific Closed Carriage Title */}
                  <rect x="20" y="92" width="200" height="20" rx="4" fill="#031118" stroke="#d97706" strokeWidth="1" />
                  <g>
                    <circle cx="196" cy="102" r="7.5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.2" filter="drop-shadow(0 0 5px rgba(245,158,11,0.8))" />
                    <path d="M 193 102 L 195 104 L 199 99.5" fill="none" stroke="#451a03" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="110" y="106" textAnchor="middle" fill="#fef08a" fontSize="12" fontWeight="900" fontFamily="serif">
                      {closedCarriage.title}
                    </text>
                  </g>

                  {/* Closed Sealed Compartment */}
                  <g>
                    <rect
                      x="20"
                      y="116"
                      width="200"
                      height="46"
                      rx="6"
                      fill="#020d14"
                      stroke="#78350f"
                      strokeWidth="1.5"
                    />
                    {[123, 130, 137, 144, 151].map((sy, i) => (
                      <line key={`slat-${i}`} x1="24" y1={sy} x2="216" y2={sy} stroke="#0c2331" strokeWidth="1.2" />
                    ))}
                    <rect x="58" y="125" width="124" height="28" rx="6" fill="#04141e" stroke="#d97706" strokeWidth="1.2" />
                    <path d="M 75 137 L 75 133 C 75 129.5 80 129.5 80 133 L 80 137" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                    <rect x="71.5" y="137" width="12" height="10" rx="2" fill="#d97706" stroke="#fef08a" strokeWidth="0.8" />
                    <circle cx="77.5" cy="141" r="1.2" fill="#451a03" />
                    <text x="126" y="144" textAnchor="middle" fill="#fef08a" fontSize="12" fontWeight="900" fontFamily="serif">
                      {closedCarriage.status}
                    </text>
                  </g>

                  <rect x="230" y="164" width="18" height="6" rx="2" fill="url(#s4GoldBevel)" stroke="#78350f" strokeWidth="0.8" />
                </g>
              )}

              {/* =========================================================
                  CARRIAGE 2 (Middle Carriage: Bucket 1)
                 ========================================================= */}
              <g
                id="carriage-2-bucket1"
                transform="translate(444, 0)"
                className="cursor-pointer group select-none"
                onClick={() => {
                  if (selectedCardId) handleAssignToCarriage('c2');
                }}
              >
                <ellipse cx="120" cy="188" rx="114" ry="8" fill="#000" opacity="0.65" filter="blur(3px)" />
                {[32, 64, 176, 208].map((wx, i) => (
                  <g key={`c2-wheel-${i}`}>
                    <circle cx={wx} cy="172" r="13" fill="#020617" stroke="url(#s4GoldBevel)" strokeWidth="2" />
                    <circle cx={wx} cy="172" r="7" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                    <circle cx={wx} cy="172" r="3" fill="url(#s4GoldBevel)" />
                  </g>
                ))}

                <rect
                  x="10"
                  y="86"
                  width="220"
                  height="82"
                  rx="8"
                  fill="url(#s4CarriageBlue)"
                  stroke={
                    placedInC2.some(s => wrongSentenceIds.includes(s.id))
                      ? '#ef4444'
                      : selectedCardId && placedInC2.length < 2
                      ? '#38bdf8'
                      : 'url(#s4GoldBevel)'
                  }
                  strokeWidth={selectedCardId && placedInC2.length < 2 ? '3' : '2.8'}
                  className="transition-all group-hover:brightness-110"
                />
                <rect x="6" y="82" width="228" height="7" rx="2.5" fill="url(#s4GoldBevel)" stroke="#78350f" strokeWidth="0.8" />

                {/* Carriage Header */}
                <rect x="20" y="92" width="200" height="20" rx="4" fill="#031118" stroke="#155e75" strokeWidth="1" />
                {placedInC2.length >= 2 ? (
                  <g>
                    <circle cx="196" cy="102" r="7.5" fill="#38bdf8" stroke="#fef08a" strokeWidth="1.2" filter="drop-shadow(0 0 5px rgba(56,189,248,0.8))" />
                    <path d="M 193 102 L 195 104 L 199 99.5" fill="none" stroke="#082f49" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="110" y="106" textAnchor="middle" fill="#bae6fd" fontSize="12" fontWeight="900" fontFamily="serif">
                      {getTranslatedBucketTitle(c2Bucket, lang)} ({placedInC2.length}/2)
                    </text>
                  </g>
                ) : (
                  <text x="120" y="106" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="900" fontFamily="serif">
                    {getTranslatedBucketTitle(c2Bucket, lang)}
                  </text>
                )}

                {/* Slots */}
                <rect
                  x="20"
                  y="116"
                  width="200"
                  height="46"
                  rx="6"
                  fill={placedInC2.length > 0 ? '#021622' : '#051822'}
                  stroke={
                    placedInC2.some(s => wrongSentenceIds.includes(s.id))
                      ? '#ef4444'
                      : placedInC2.length > 0
                      ? '#38bdf8'
                      : selectedCardId
                      ? '#7dd3fc'
                      : '#1e3a8a'
                  }
                  strokeWidth={placedInC2.length > 0 ? '2' : '1.5'}
                  strokeDasharray={placedInC2.length > 0 ? 'none' : '4 3'}
                  className="transition-all"
                />

                {placedInC2.length > 0 ? (
                  <g>
                    {placedInC2.map((s, idx) => {
                      const total = placedInC2.length;
                      const py = total === 1 ? 144 : idx === 0 ? 131 : 151;
                      const isItemWrong = wrongSentenceIds.includes(s.id);
                      return (
                        <g
                          key={s.id}
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromCarriage(s.id);
                          }}
                        >
                          <rect
                            x="24"
                            y={py - 12}
                            width="192"
                            height={total === 1 ? 26 : 18}
                            rx="4"
                            fill={isItemWrong ? '#fecdd3' : '#e0f2fe'}
                            stroke={isItemWrong ? '#ef4444' : '#0284c7'}
                            strokeWidth="1"
                          />
                          <text
                            x="120"
                            y={total === 1 ? py + 5 : py + 2}
                            textAnchor="middle"
                            fill="#082f49"
                            fontSize={total === 1 ? '12' : '10'}
                            fontWeight="900"
                            fontFamily="Amiri, 'Noto Naskh Arabic', serif"
                          >
                            {s.text}
                          </text>
                          {isItemWrong && (
                            <g>
                              <circle cx="204" cy={total === 1 ? py - 1 : py - 3} r="5" fill="#dc2626" />
                              <text x="204" y={total === 1 ? py + 2 : py} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">✕</text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                ) : (
                  <text x="120" y="143" textAnchor="middle" fill="#94a3b8" fontSize="11" opacity="0.7">
                    {getBucketSlotLabel(c2Bucket, lang, !!selectedCardId)}
                  </text>
                )}

                <rect x="230" y="164" width="18" height="6" rx="2" fill="url(#s4GoldBevel)" stroke="#78350f" strokeWidth="0.8" />
              </g>

              {/* =========================================================
                  CARRIAGE 3 (Rightmost Carriage: Bucket 2 or Bucket 3)
                 ========================================================= */}
              <g
                id="carriage-3-rear"
                transform="translate(692, 0)"
                className="cursor-pointer group select-none"
                onClick={() => {
                  if (selectedCardId) handleAssignToCarriage('c3');
                }}
              >
                <ellipse cx="126" cy="188" rx="120" ry="8" fill="#000" opacity="0.65" filter="blur(3px)" />
                {[34, 68, 184, 218].map((wx, i) => (
                  <g key={`c3-wheel-${i}`}>
                    <circle cx={wx} cy="172" r="13" fill="#020617" stroke="url(#s4GoldBevel)" strokeWidth="2" />
                    <circle cx={wx} cy="172" r="7" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                    <circle cx={wx} cy="172" r="3" fill="url(#s4GoldBevel)" />
                  </g>
                ))}

                <rect
                  x="10"
                  y="86"
                  width="220"
                  height="82"
                  rx="8"
                  fill="url(#s4CarriageBlue)"
                  stroke={
                    placedInC3.some(s => wrongSentenceIds.includes(s.id))
                      ? '#ef4444'
                      : selectedCardId && placedInC3.length < 2
                      ? '#34d399'
                      : 'url(#s4GoldBevel)'
                  }
                  strokeWidth={selectedCardId && placedInC3.length < 2 ? '3' : '2.8'}
                  className="transition-all group-hover:brightness-110"
                />
                <rect x="6" y="82" width="228" height="7" rx="2.5" fill="url(#s4GoldBevel)" stroke="#78350f" strokeWidth="0.8" />

                <rect x="20" y="92" width="200" height="20" rx="4" fill="#031118" stroke="#065f46" strokeWidth="1" />
                {placedInC3.length >= 2 ? (
                  <g>
                    <circle cx="196" cy="102" r="7.5" fill="#34d399" stroke="#fef08a" strokeWidth="1.2" filter="drop-shadow(0 0 5px rgba(52,211,153,0.8))" />
                    <path d="M 193 102 L 195 104 L 199 99.5" fill="none" stroke="#064e3b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="110" y="106" textAnchor="middle" fill="#a7f3d0" fontSize="12" fontWeight="900" fontFamily="serif">
                      {getTranslatedBucketTitle(c3Bucket, lang)} ({placedInC3.length}/2)
                    </text>
                  </g>
                ) : (
                  <text x="120" y="106" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="900" fontFamily="serif">
                    {getTranslatedBucketTitle(c3Bucket, lang)}
                  </text>
                )}

                <rect
                  x="20"
                  y="116"
                  width="200"
                  height="46"
                  rx="6"
                  fill={placedInC3.length > 0 ? '#021e14' : '#031710'}
                  stroke={
                    placedInC3.some(s => wrongSentenceIds.includes(s.id))
                      ? '#ef4444'
                      : placedInC3.length > 0
                      ? '#34d399'
                      : selectedCardId
                      ? '#6ee7b7'
                      : '#064e3b'
                  }
                  strokeWidth={placedInC3.length > 0 ? '2' : '1.5'}
                  strokeDasharray={placedInC3.length > 0 ? 'none' : '4 3'}
                  className="transition-all"
                />

                {placedInC3.length > 0 ? (
                  <g>
                    {placedInC3.map((s, idx) => {
                      const total = placedInC3.length;
                      const py = total === 1 ? 144 : idx === 0 ? 131 : 151;
                      const isItemWrong = wrongSentenceIds.includes(s.id);
                      return (
                        <g
                          key={s.id}
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromCarriage(s.id);
                          }}
                        >
                          <rect
                            x="24"
                            y={py - 12}
                            width="192"
                            height={total === 1 ? 26 : 18}
                            rx="4"
                            fill={isItemWrong ? '#fecdd3' : '#dcfce7'}
                            stroke={isItemWrong ? '#ef4444' : '#059669'}
                            strokeWidth="1"
                          />
                          <text
                            x="120"
                            y={total === 1 ? py + 5 : py + 2}
                            textAnchor="middle"
                            fill="#064e3b"
                            fontSize={total === 1 ? '12' : '10'}
                            fontWeight="900"
                            fontFamily="Amiri, 'Noto Naskh Arabic', serif"
                          >
                            {s.text}
                          </text>
                          {isItemWrong && (
                            <g>
                              <circle cx="204" cy={total === 1 ? py - 1 : py - 3} r="5" fill="#dc2626" />
                              <text x="204" y={total === 1 ? py + 2 : py} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">✕</text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                ) : (
                  <text x="120" y="143" textAnchor="middle" fill="#94a3b8" fontSize="11" opacity="0.7">
                    {getBucketSlotLabel(c3Bucket, lang, !!selectedCardId)}
                  </text>
                )}

                {/* Rear Lanterns */}
                <rect x="228" y="96" width="5" height="12" rx="1.5" fill="#0f172a" stroke="#d97706" strokeWidth="0.8" />
                <circle cx="230" cy="102" r="3" fill="#ef4444" filter="drop-shadow(0 0 5px #ef4444)" />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* 4. Bottom Platform: Sentence Cards Tray & Action Controls */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-2 sm:px-4 pb-2 sm:pb-3 space-y-2">
        {/* Feedback Message */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-center py-1.5 px-4 rounded-xl text-xs sm:text-sm font-black border backdrop-blur-md flex items-center justify-center gap-2 ${
                isWrong
                  ? 'bg-rose-950/80 border-rose-500/80 text-rose-200'
                  : 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200'
              }`}
            >
              {isWrong ? <AlertTriangle size={16} className="text-rose-400" /> : <CheckCircle2 size={16} className="text-emerald-400" />}
              <span>{feedbackMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sentence Cards Tray: Enforce single-row horizontal layout for all cards */}
        <div className="w-full overflow-x-auto pb-1 scrollbar-none">
          <div className={`grid gap-1.5 sm:gap-2.5 w-full ${
            is3Buckets
              ? 'grid-cols-6 min-w-[650px] sm:min-w-0'
              : 'grid-cols-4 min-w-[460px] sm:min-w-0'
          }`}>
            {sentences.map((card) => {
              const placement = placements[card.id];
              const isAssigned = placement !== null;
              const isSelected = selectedCardId === card.id;
              const isCardWrong = wrongSentenceIds.includes(card.id);

              const label1 = getButtonShortLabel(bucket1.key, bucket1.badge || bucket1.title, lang);
              const label2 = getButtonShortLabel(bucket2.key, bucket2.badge || bucket2.title, lang);
              const label3 = bucket3 ? getButtonShortLabel(bucket3.key, bucket3.badge || bucket3.title, lang) : '';

              return (
                <motion.div
                  key={card.id}
                  whileHover={!isAssigned ? { scale: 1.02, y: -1 } : undefined}
                  whileTap={!isAssigned ? { scale: 0.98 } : undefined}
                  className={`relative rounded-xl p-2 sm:p-2.5 border transition-all flex flex-col justify-between select-none overflow-hidden ${
                    isCardWrong
                      ? 'bg-[#2a0c10]/95 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] ring-1 ring-rose-500/50'
                      : isSelected
                      ? 'bg-[#0e2733]/98 border-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.6)] ring-1 ring-amber-400/50'
                      : isAssigned
                      ? 'bg-[#061219]/70 border-slate-700/60 opacity-60'
                      : 'bg-gradient-to-b from-[#162736]/95 via-[#0e1c27]/98 to-[#060e15]/98 border-amber-500/60 shadow-md hover:border-amber-400 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!isAssigned) handleCardClick(card.id);
                  }}
                >
                  {/* Sentence Plate (Compact & Crisp) */}
                  <div className="text-center py-1 px-1 min-h-[36px] flex items-center justify-center bg-[#040a0e]/50 rounded-lg border border-amber-900/30">
                    <p className={`font-serif font-black text-xs sm:text-sm leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
                      isCardWrong ? 'text-rose-200' : isAssigned ? 'text-slate-400 line-through' : 'text-amber-100'
                    }`}>
                      «{card.text}»
                    </p>
                  </div>

                  {/* Direct quick target buttons on card */}
                  {!isAssigned ? (
                    <div className="pt-1.5 mt-1 border-t border-amber-500/20">
                      {is3Buckets ? (
                        <div className="grid grid-cols-3 gap-1 w-full">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAssign(card.id, 'c1');
                            }}
                            title={getTranslatedBucketTitle(bucket1, lang)}
                            className="py-1 px-0.5 rounded-md bg-gradient-to-b from-purple-800 to-purple-950 hover:from-purple-700 hover:to-purple-900 text-purple-100 font-black font-serif text-[10px] sm:text-[11px] border border-purple-400/70 shadow-xs active:scale-95 transition-all cursor-pointer truncate text-center"
                          >
                            {label1}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAssign(card.id, 'c2');
                            }}
                            title={getTranslatedBucketTitle(bucket2, lang)}
                            className="py-1 px-0.5 rounded-md bg-gradient-to-b from-sky-800 to-sky-950 hover:from-sky-700 hover:to-sky-900 text-sky-100 font-black font-serif text-[10px] sm:text-[11px] border border-sky-400/70 shadow-xs active:scale-95 transition-all cursor-pointer truncate text-center"
                          >
                            {label2}
                          </button>
                          {bucket3 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAssign(card.id, 'c3');
                              }}
                              title={getTranslatedBucketTitle(bucket3, lang)}
                              className="py-1 px-0.5 rounded-md bg-gradient-to-b from-amber-700 to-amber-950 hover:from-amber-600 hover:to-amber-900 text-amber-100 font-black font-serif text-[10px] sm:text-[11px] border border-amber-400/70 shadow-xs active:scale-95 transition-all cursor-pointer truncate text-center"
                            >
                              {label3}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5 w-full">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAssign(card.id, 'c2');
                            }}
                            title={getTranslatedBucketTitle(bucket1, lang)}
                            className="py-1 px-1 rounded-md bg-gradient-to-b from-sky-800 to-sky-950 hover:from-sky-700 hover:to-sky-900 text-sky-100 font-black font-serif text-[11px] sm:text-xs border border-sky-400/70 shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap text-center"
                          >
                            {label1}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAssign(card.id, 'c3');
                            }}
                            title={getTranslatedBucketTitle(bucket2, lang)}
                            className="py-1 px-1 rounded-md bg-gradient-to-b from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-emerald-100 font-black font-serif text-[11px] sm:text-xs border border-emerald-400/70 shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap text-center"
                          >
                            {label2}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromCarriage(card.id);
                      }}
                      className="text-center pt-1 mt-0.5 border-t border-slate-700/60 flex items-center justify-center gap-1 cursor-pointer group"
                      title={lang === 'en' ? 'Click to unassign and return card' : 'انقر لإلغاء الفرز وإعادة البطاقة'}
                    >
                      <span className="text-[10px] sm:text-[11px] font-black text-amber-300 font-serif truncate">
                        ✓ {
                          placement === 'c1' ? getButtonShortLabel(bucket1.key, bucket1.badge || bucket1.title, lang) :
                          placement === 'c2' ? (is3Buckets ? getButtonShortLabel(bucket2.key, bucket2.badge || bucket2.title, lang) : getButtonShortLabel(bucket1.key, bucket1.badge || bucket1.title, lang)) :
                          (is3Buckets ? (bucket3 ? getButtonShortLabel(bucket3.key, bucket3.badge || bucket3.title, lang) : '') : getButtonShortLabel(bucket2.key, bucket2.badge || bucket2.title, lang))
                        }
                      </span>
                      <span className="text-[9.5px] text-slate-400 group-hover:text-rose-400">
                        ✕
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions Bar - Centered Check and Depart */}
        <div className="flex items-center justify-center pt-1.5 pb-2.5 sm:pb-3.5">
          <motion.button
            whileHover={allPlaced && !isDeparting ? { scale: 1.03 } : undefined}
            whileTap={allPlaced && !isDeparting ? { scale: 0.96 } : undefined}
            disabled={!allPlaced || isDeparting}
            onClick={handleCheckAndDepart}
            className={`px-8 sm:px-11 py-2 sm:py-2.5 rounded-xl font-black text-sm sm:text-base flex items-center justify-center border-2 transition-all cursor-pointer ${
              allPlaced && !isDeparting
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-500 text-stone-950 border-yellow-200 shadow-[0_6px_25px_rgba(245,158,11,0.5),inset_0_1px_2px_rgba(255,255,255,0.7)] animate-pulse'
                : 'bg-[#1e293b]/70 border-slate-700 text-slate-500 cursor-not-allowed opacity-50 shadow-none'
            }`}
          >
            <span>{lang === 'en' ? 'Check & Depart' : 'تحقق وانطلق'}</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
