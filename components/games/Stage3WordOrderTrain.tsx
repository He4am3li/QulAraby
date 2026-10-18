import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  Volume2, 
  GripVertical,
  ChevronLeft
} from 'lucide-react';
import { GrammarRule } from '../../src/data/grammarRulesData';

export interface Stage3Puzzle {
  id: number;
  targetType: string;
  sentence: string;
  words: string[];
  correctOrder: string[];
  hint: string;
}

interface Stage3WordOrderTrainProps {
  puzzle: Stage3Puzzle;
  puzzleIndex: number;
  totalPuzzles: number;
  score: number;
  stars: number;
  onCorrect: (bonus: number) => void;
  onNextPuzzle: () => void;
  onCompleteStage: () => void;
  playSound: (type: 'whistle' | 'correct' | 'error' | 'click' | 'victory' | 'trainMove' | 'brake' | 'barrier_alarm') => void;
  lang?: 'ar' | 'en';
}

export const Stage3WordOrderTrain: React.FC<Stage3WordOrderTrainProps> = ({
  puzzle,
  puzzleIndex,
  totalPuzzles,
  score,
  stars,
  onCorrect,
  onNextPuzzle,
  onCompleteStage,
  playSound,
  lang = 'ar',
}) => {
  const is4Carriages = puzzle.words.length === 4;

  // Selected words placed into train carriages in order of clicking
  const [assembled, setAssembled] = useState<string[]>([]);
  const [isDeparting, setIsDeparting] = useState<boolean>(false);
  const [isEntering, setIsEntering] = useState<boolean>(false);
  const [isWrongShake, setIsWrongShake] = useState<boolean>(false);
  const [wheelAngle, setWheelAngle] = useState<number>(0);
  const [trainOffset, setTrainOffset] = useState<number>(0);
  const [bgReady, setBgReady] = useState<boolean>(false);

  // Pre-check if background image is already cached to eliminate train-before-background pop-in
  useEffect(() => {
    const img = new Image();
    img.src = '/train_station_word_order_bg.jpg';
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

  // Reset state when puzzle changes
  useEffect(() => {
    setAssembled([]);
    setIsDeparting(false);
    setIsWrongShake(false);

    // Realistic arrival: train glides smoothly into the station from the right
    setIsEntering(true);
    setTrainOffset(420);

    let start: number | null = null;
    const duration = 1100; // 1.1s arrival

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentX = 420 * (1 - ease);
      setTrainOffset(currentX);
      setWheelAngle(prev => (prev - 8) % 360);

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
  }, [puzzle.id]);

  // Handle word selection from platform depot
  const handleSelectWord = (word: string) => {
    if (isDeparting || isEntering) return;
    playSound('click');

    if (assembled.includes(word)) {
      // Remove word if already selected
      setAssembled(prev => prev.filter(w => w !== word));
    } else {
      if (assembled.length < puzzle.words.length) {
        setAssembled(prev => [...prev, word]);
      }
    }
  };

  // Remove word from specific carriage slot
  const handleRemoveCarriage = (word: string) => {
    if (isDeparting || isEntering) return;
    playSound('click');
    setAssembled(prev => prev.filter(w => w !== word));
  };

  // Check arrangement and trigger realistic train departure
  const handleCheckAndDepart = () => {
    if (assembled.length !== puzzle.words.length || isDeparting || isEntering) return;

    const isCorrect = assembled.join(' ') === puzzle.correctOrder.join(' ');

    if (isCorrect) {
      playSound('correct');
      playSound('whistle');
      playSound('trainMove');
      setIsDeparting(true);
      onCorrect(30);

      // Realistic departure acceleration physics
      let start: number | null = null;
      const departDuration = 1800; // 1.8s departure

      const animateDeparture = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / departDuration, 1);

        // Quad in acceleration
        const ease = Math.pow(progress, 2.5);
        const currentX = -ease * 1400; // moves off-screen to the left
        setTrainOffset(currentX);
        setWheelAngle(prev => (prev - 16) % 360);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animateDeparture);
        } else {
          // Advance to next puzzle or next stage
          if (puzzleIndex + 1 < totalPuzzles) {
            onNextPuzzle();
          } else {
            onCompleteStage();
          }
        }
      };

      animFrameRef.current = requestAnimationFrame(animateDeparture);
    } else {
      playSound('barrier_alarm');
      playSound('brake');
      setIsWrongShake(true);
      setTimeout(() => setIsWrongShake(false), 900);
    }
  };

  // Helper to format the prompt target text dynamically for the lesson
  const getPromptTargetText = () => {
    const t = puzzle.targetType || '';
    if (t.includes('فعلية')) return lang === 'en' ? 'Verbal Sentence' : 'جملة فعلية';
    if (t.includes('اسمية')) return lang === 'en' ? 'Nominal Sentence' : 'جملة اسمية';
    if (t.includes('كان')) return lang === 'en' ? 'Kana & its Sisters' : 'كان وأخواتها';
    if (t.includes('إن')) return lang === 'en' ? 'Inna & its Sisters' : 'إنّ وأخواتها';
    if (t.includes('جر')) return lang === 'en' ? 'Preposition' : 'حرف جر';
    if (t.includes('مذكر')) return lang === 'en' ? 'Sound Masculine Plural' : 'جمع مذكر سالم';
    if (t.includes('مؤنث')) return lang === 'en' ? 'Sound Feminine Plural' : 'جمع مؤنث سالم';
    if (t.includes('تكسير')) return lang === 'en' ? 'Broken Plural' : 'جمع تكسير';
    return t;
  };

  // Mapping assembled words into Carriages:
  // In RTL, reading from Right to Left:
  // Word 0 is always in the rightmost carriage (Slot 1 of the sentence)
  // Word 1 is in the next carriage to the left
  // Word 2 is in the next carriage
  // Word 3 (if 4 words) is in the carriage closest to the Locomotive
  const carriageWordFarRight = assembled[0] || null; // Slot 1 (Start of sentence)
  const carriageWordMidRight = assembled[1] || null; // Slot 2
  const carriageWordMidLeft = assembled[2] || null;  // Slot 3
  const carriageWordNearLoco = is4Carriages ? (assembled[3] || null) : null; // Slot 4 if 4 carriages

  // SVG dimensions
  const svgWidth = is4Carriages ? 1080 : 880;
  const sleepersCount = Math.ceil(svgWidth / 20) + 1;

  return (
    <div className={`flex-1 flex flex-col justify-between relative overflow-hidden select-none min-h-[calc(100vh-5rem)] bg-[#02090e] transition-opacity duration-200 ${
      bgReady ? 'opacity-100' : 'opacity-90'
    }`}>
      {/* 1. Cinematic Nighttime Railway Station Background (With lag prevention) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/train_station_word_order_bg.jpg"
          alt="Nighttime Train Station"
          loading="eager"
          decoding="sync"
          // @ts-ignore
          fetchPriority="high"
          onLoad={() => setBgReady(true)}
          onError={(e) => {
            e.currentTarget.src = '/station2_night_rail.jpg';
            setBgReady(true);
          }}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.82] contrast-[1.05]"
        />
        {/* Cinematic Vignette & Deep Night Mist Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#010c10]/95 via-[#031b22]/40 to-[#010c10]/60" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#010b10]/25 to-[#01070a]/70" />
      </div>

      {/* 2. Top Station Banner: Dynamic Question Prompt */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4 flex flex-col items-center">
        {/* Hanging Antique Lamp */}
        <div className="relative flex flex-col items-center -mb-2 z-10">
          <div className="w-0.5 h-6 bg-gradient-to-b from-amber-600 to-amber-400" />
          <div className="w-9 h-4 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 rounded-t-full shadow-md" />
          <div className="w-7 h-2 bg-amber-200 rounded-b-full shadow-[0_0_15px_rgba(254,240,138,0.9)] animate-pulse" />
        </div>

        {/* Station Signboard for Prompt (Unified Dimensions across Stages 2, 3 & 4) */}
        <div className="relative w-full max-w-2xl px-4 sm:px-8 py-2.5 sm:py-3 min-h-[72px] sm:min-h-[82px] flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[#09222c]/95 via-[#05171e]/98 to-[#09222c]/95 border-2 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.25),inset_0_1px_4px_rgba(255,255,255,0.2)] text-center backdrop-blur-md overflow-hidden">
          <div className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
          <div className="absolute top-1.5 left-2 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
          <div className="absolute bottom-1.5 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
          <div className="absolute bottom-1.5 left-2 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />

          <h2 className="font-black text-amber-100 drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)] font-serif flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden max-w-full px-2" dir={lang === 'en' ? 'ltr' : 'rtl'}>
            <span className={lang === 'en' ? 'text-xs sm:text-sm md:text-base font-bold whitespace-nowrap' : 'text-base sm:text-xl font-bold whitespace-nowrap'}>
              {lang === 'en' ? 'Arrange the words to form a sentence containing' : 'رتّب الكلمات لتكوين جملة تحوي'}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-yellow-200 to-amber-400 underline decoration-amber-400/60 underline-offset-4 shrink-0 font-bold" dir={lang === 'en' ? 'ltr' : 'rtl'}>
              «{getPromptTargetText()}»
            </span>
          </h2>
        </div>

        {/* Question Progress Dots under the question rectangle (Unifying Stage 2, 3 & 4) */}
        <div className="flex items-center justify-center gap-2 mt-2.5 sm:mt-3" dir="rtl">
          {Array.from({ length: totalPuzzles }).map((_, idx) => {
            const isCleared = idx < puzzleIndex || (idx === puzzleIndex && isDeparting);
            const isCurrent = idx === puzzleIndex && !isDeparting;
            return (
              <div
                key={`s3-pip-${idx}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCleared
                    ? 'w-4 sm:w-5 bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                    : isCurrent
                    ? 'w-6 sm:w-8 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse ring-2 ring-amber-400/40'
                    : 'w-2.5 sm:w-3 bg-slate-800/80 border border-slate-700/60'
                }`}
                title={`اللغز ${idx + 1} من ${totalPuzzles}`}
              />
            );
          })}
        </div>
      </div>

      {/* 3. Main Stage: Moving Train & Rail SVG (Supports 3 or 4 Carriages) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-2 sm:px-4 my-auto">
        <div className={`relative w-full overflow-hidden rounded-3xl bg-transparent p-1 sm:p-2 select-none ${
          isWrongShake && !isDeparting ? 'animate-shake' : ''
        }`}>
          <svg
            viewBox={`0 0 ${svgWidth} 230`}
            className="w-full h-auto overflow-visible select-none"
            preserveAspectRatio="xMidYMid meet"
            style={{ filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.85))' }}
          >
            <defs>
              {/* Metallic Locomotive Paint */}
              <linearGradient id="locoNavy" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="40%" stopColor="#172554" />
                <stop offset="70%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* Carriage Prussian Blue Gradient */}
              <linearGradient id="carriageBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="30%" stopColor="#1e3a8a" />
                <stop offset="70%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* Polished Brass/Gold Trim */}
              <linearGradient id="goldBevel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              {/* Headlight Beam */}
              <radialGradient id="cyclopsBeam" cx="100%" cy="50%" r="90%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#fde047" stopOpacity="0.5" />
                <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </radialGradient>

              {/* Steam Particle */}
              <radialGradient id="steamSmoke" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* 1. Railway Track System */}
            <g>
              <rect x="0" y="176" width={svgWidth} height="24" fill="#0b131f" opacity="0.8" />
              {Array.from({ length: sleepersCount }).map((_, i) => (
                <rect
                  key={`tie-${i}`}
                  x={i * 20 + 2}
                  y="174"
                  width="12"
                  height="18"
                  rx="2"
                  fill="#2d1609"
                  stroke="#170c04"
                  strokeWidth="1"
                />
              ))}
              <rect x="0" y="171" width={svgWidth} height="5" rx="1.5" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />
              <rect x="0" y="170" width={svgWidth} height="1.5" fill="#ffffff" opacity="0.9" />
              <rect x="0" y="186" width={svgWidth} height="3" fill="#334155" opacity="0.6" />
            </g>

            {/* 2. THE ENTIRE STEAM TRAIN ASSEMBLY */}
            <g transform={`translate(${trainOffset}, 0)`}>
              
              {/* Headlight Beam */}
              <polygon
                points="-120,136 10,140 10,150 -120,170"
                fill="url(#cyclopsBeam)"
                opacity="0.85"
              />

              {/* Steam Smoke Puffs from Smokestack */}
              <g id="steam-smoke-plume">
                {[
                  { cx: 58, cy: 52, r: 12, drift: 0 },
                  { cx: 40, cy: 38, r: 18, drift: -6 },
                  { cx: 16, cy: 24, r: 24, drift: -14 },
                  { cx: -14, cy: 12, r: 30, drift: -26 },
                ].map((puff, idx) => {
                  const puffX = isDeparting ? puff.cx - 24 * idx : puff.cx;
                  const puffY = isDeparting ? puff.cy - 6 * idx : puff.cy;
                  const puffR = isDeparting ? puff.r * 1.35 : puff.r;
                  return (
                    <circle
                      key={`puff-${idx}`}
                      cx={puffX}
                      cy={puffY}
                      r={puffR}
                      fill="url(#steamSmoke)"
                      className={isDeparting ? 'animate-ping' : ''}
                      style={{ animationDuration: `${1.2 + idx * 0.4}s` }}
                    />
                  );
                })}
              </g>

              {/* =====================================================
                  LOCOMOTIVE (Facing Left at x=10 to x=180)
                 ===================================================== */}
              <g id="locomotive-body">
                <ellipse cx="98" cy="184" rx="88" ry="8" fill="#000" opacity="0.6" filter="blur(3px)" />
                <polygon points="12,174 2,174 12,148 32,148" fill="#091e28" stroke="#d97706" strokeWidth="1.5" />
                <line x1="6" y1="172" x2="20" y2="152" stroke="#f59e0b" strokeWidth="1.4" />
                <line x1="12" y1="172" x2="26" y2="152" stroke="#f59e0b" strokeWidth="1.4" />

                <rect x="10" y="136" width="16" height="18" rx="3" fill="#0f172a" stroke="#d97706" strokeWidth="1.2" />
                <circle cx="16" cy="145" r="6" fill="#fde047" stroke="#b45309" strokeWidth="1.2" />
                <circle cx="16" cy="145" r="3.5" fill="#ffffff" filter="drop-shadow(0 0 6px #fef08a)" />

                <rect x="24" y="96" width="94" height="66" rx="10" fill="url(#locoNavy)" stroke="#38bdf8" strokeWidth="1.4" />
                {[46, 72, 98].map((bx, i) => (
                  <line key={`band-${i}`} x1={bx} y1="96" x2={bx} y2="162" stroke="url(#goldBevel)" strokeWidth="2.5" />
                ))}

                <path d="M 58 96 L 62 62 L 74 62 L 78 96 Z" fill="#0f172a" stroke="#d97706" strokeWidth="1.5" />
                <ellipse cx="68" cy="62" rx="9" ry="3.5" fill="url(#goldBevel)" stroke="#78350f" strokeWidth="1" />
                <path d="M 86 96 C 86 80, 102 80, 102 96 Z" fill="url(#goldBevel)" stroke="#78350f" strokeWidth="1.2" />

                <rect x="114" y="74" width="64" height="88" rx="6" fill="url(#locoNavy)" stroke="#38bdf8" strokeWidth="1.5" />
                <rect x="108" y="70" width="76" height="8" rx="3" fill="url(#goldBevel)" stroke="#78350f" strokeWidth="1" />
                <rect x="122" y="86" width="20" height="26" rx="4" fill="#fef08a" stroke="#78350f" strokeWidth="1.2" />
                <rect x="150" y="86" width="20" height="26" rx="4" fill="#fef08a" stroke="#78350f" strokeWidth="1.2" />
                <circle cx="132" cy="98" r="5" fill="#78350f" />
                <polygon points="146,134 154,126 146,118 138,126" fill="url(#goldBevel)" stroke="#78350f" strokeWidth="0.8" />

                {/* Locomotive Wheels */}
                {[46, 88, 130].map((wx, i) => {
                  const rad = (wheelAngle * Math.PI) / 180;
                  const pinX = wx + Math.cos(rad) * 9;
                  const pinY = 166 + Math.sin(rad) * 9;
                  return (
                    <g key={`wheel-${i}`}>
                      <circle cx={wx} cy="166" r="16" fill="#020617" stroke="url(#goldBevel)" strokeWidth="2.5" />
                      <circle cx={wx} cy="166" r="11" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                      {[0, 60, 120].map(deg => {
                        const sRad = ((deg + wheelAngle) * Math.PI) / 180;
                        return (
                          <line
                            key={`spoke-${deg}`}
                            x1={wx - Math.cos(sRad) * 11}
                            y1={166 - Math.sin(sRad) * 11}
                            x2={wx + Math.cos(sRad) * 11}
                            y2={166 + Math.sin(sRad) * 11}
                            stroke="#94a3b8"
                            strokeWidth="1.2"
                          />
                        );
                      })}
                      <circle cx={wx} cy="166" r="4" fill="url(#goldBevel)" />
                      <circle cx={pinX} cy={pinY} r="2.5" fill="#ffffff" />
                    </g>
                  );
                })}

                {/* Connecting Rod */}
                {(() => {
                  const rad = (wheelAngle * Math.PI) / 180;
                  const p1x = 46 + Math.cos(rad) * 9;
                  const p1y = 166 + Math.sin(rad) * 9;
                  const p3x = 130 + Math.cos(rad) * 9;
                  const p3y = 166 + Math.sin(rad) * 9;
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

                <rect x="178" y="160" width="18" height="6" rx="2" fill="url(#goldBevel)" stroke="#78350f" strokeWidth="0.8" />
              </g>

              {/* =====================================================
                  CARRIAGE 1 (Nearest to Locomotive)
                  If 4 words: holds 4th Word (carriageWordNearLoco)
                  If 3 words: holds 3rd Word (carriageWordMidLeft)
                 ===================================================== */}
              {(() => {
                const word = is4Carriages ? carriageWordNearLoco : carriageWordMidLeft;
                const slotNumEn = is4Carriages ? '4' : '3';
                const slotNumAr = is4Carriages ? '٤' : '٣';
                return (
                  <g
                    id="carriage-near-loco"
                    transform="translate(196, 0)"
                    className="cursor-pointer group select-none"
                    onClick={() => word && handleRemoveCarriage(word)}
                  >
                    <ellipse cx="98" cy="184" rx="94" ry="8" fill="#000" opacity="0.6" filter="blur(3px)" />
                    {[28, 56, 140, 168].map((wx, i) => (
                      <g key={`c-near-wheel-${i}`}>
                        <circle cx={wx} cy="168" r="13" fill="#020617" stroke="url(#goldBevel)" strokeWidth="2" />
                        <circle cx={wx} cy="168" r="7" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                        <circle cx={wx} cy="168" r="3" fill="url(#goldBevel)" />
                      </g>
                    ))}
                    <rect x="8" y="86" width="184" height="78" rx="8" fill="url(#carriageBlue)" stroke="url(#goldBevel)" strokeWidth="2.8" className="transition-all group-hover:brightness-110" />
                    <rect x="4" y="82" width="192" height="7" rx="2.5" fill="url(#goldBevel)" stroke="#78350f" strokeWidth="0.8" />
                    <rect
                      x="18"
                      y="98"
                      width="164"
                      height="54"
                      rx="6"
                      fill={word ? '#041d22' : '#0a1428'}
                      stroke={word ? '#f59e0b' : '#38bdf8'}
                      strokeWidth="1.8"
                      strokeDasharray={word ? 'none' : '4 3'}
                      className="transition-all group-hover:stroke-amber-300"
                    />
                    {word ? (
                      <g>
                        <text
                          x="100"
                          y="134"
                          textAnchor="middle"
                          fill="#fef08a"
                          fontSize="24"
                          fontWeight="900"
                          fontFamily="serif"
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))"
                        >
                          {word}
                        </text>
                      </g>
                    ) : (
                      <text x="100" y="131" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold" opacity="0.65">
                        {lang === 'en' ? `Carriage ${slotNumEn}` : `العربة ${slotNumAr}`}
                      </text>
                    )}
                    <rect x="192" y="160" width="16" height="6" rx="2" fill="url(#goldBevel)" stroke="#78350f" strokeWidth="0.8" />
                  </g>
                );
              })()}

              {/* =====================================================
                  CARRIAGE 2 (Middle Carriage)
                  If 4 words: holds 3rd Word (carriageWordMidLeft)
                  If 3 words: holds 2nd Word (carriageWordMidRight)
                 ===================================================== */}
              {(() => {
                const word = is4Carriages ? carriageWordMidLeft : carriageWordMidRight;
                const slotNumEn = is4Carriages ? '3' : '2';
                const slotNumAr = is4Carriages ? '٣' : '٢';
                return (
                  <g
                    id="carriage-mid"
                    transform="translate(404, 0)"
                    className="cursor-pointer group select-none"
                    onClick={() => word && handleRemoveCarriage(word)}
                  >
                    <ellipse cx="98" cy="184" rx="94" ry="8" fill="#000" opacity="0.6" filter="blur(3px)" />
                    {[28, 56, 140, 168].map((wx, i) => (
                      <g key={`c-mid-wheel-${i}`}>
                        <circle cx={wx} cy="168" r="13" fill="#020617" stroke="url(#goldBevel)" strokeWidth="2" />
                        <circle cx={wx} cy="168" r="7" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                        <circle cx={wx} cy="168" r="3" fill="url(#goldBevel)" />
                      </g>
                    ))}
                    <rect x="8" y="86" width="184" height="78" rx="8" fill="url(#carriageBlue)" stroke="url(#goldBevel)" strokeWidth="2.8" className="transition-all group-hover:brightness-110" />
                    <rect x="4" y="82" width="192" height="7" rx="2.5" fill="url(#goldBevel)" stroke="#78350f" strokeWidth="0.8" />
                    <rect
                      x="18"
                      y="98"
                      width="164"
                      height="54"
                      rx="6"
                      fill={word ? '#041d22' : '#0a1428'}
                      stroke={word ? '#f59e0b' : '#38bdf8'}
                      strokeWidth="1.8"
                      strokeDasharray={word ? 'none' : '4 3'}
                      className="transition-all group-hover:stroke-amber-300"
                    />
                    {word ? (
                      <g>
                        <text
                          x="100"
                          y="134"
                          textAnchor="middle"
                          fill="#fef08a"
                          fontSize="24"
                          fontWeight="900"
                          fontFamily="serif"
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))"
                        >
                          {word}
                        </text>
                      </g>
                    ) : (
                      <text x="100" y="131" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold" opacity="0.65">
                        {lang === 'en' ? `Carriage ${slotNumEn}` : `العربة ${slotNumAr}`}
                      </text>
                    )}
                    <rect x="192" y="160" width="16" height="6" rx="2" fill="url(#goldBevel)" stroke="#78350f" strokeWidth="0.8" />
                  </g>
                );
              })()}

              {/* =====================================================
                  CARRIAGE 3:
                  If 4 words: holds 2nd Word (carriageWordMidRight)
                  If 3 words: holds 1st Word (carriageWordFarRight - Far Right / Start of sentence)
                 ===================================================== */}
              {(() => {
                const word = is4Carriages ? carriageWordMidRight : carriageWordFarRight;
                const isTailOfTrain = !is4Carriages;
                const slotNumEn = is4Carriages ? '2' : '1';
                const slotNumAr = is4Carriages ? '٢' : '١';
                return (
                  <g
                    id="carriage-3"
                    transform="translate(612, 0)"
                    className="cursor-pointer group select-none"
                    onClick={() => word && handleRemoveCarriage(word)}
                  >
                    <ellipse cx="98" cy="184" rx="94" ry="8" fill="#000" opacity="0.6" filter="blur(3px)" />
                    {[28, 56, 140, 168].map((wx, i) => (
                      <g key={`c-3-wheel-${i}`}>
                        <circle cx={wx} cy="168" r="13" fill="#020617" stroke="url(#goldBevel)" strokeWidth="2" />
                        <circle cx={wx} cy="168" r="7" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                        <circle cx={wx} cy="168" r="3" fill="url(#goldBevel)" />
                      </g>
                    ))}
                    <rect x="8" y="86" width="184" height="78" rx="8" fill="url(#carriageBlue)" stroke="url(#goldBevel)" strokeWidth="2.8" className="transition-all group-hover:brightness-110" />
                    <rect x="4" y="82" width="192" height="7" rx="2.5" fill="url(#goldBevel)" stroke="#78350f" strokeWidth="0.8" />
                    <rect
                      x="18"
                      y="98"
                      width="164"
                      height="54"
                      rx="6"
                      fill={word ? '#041d22' : '#0a1428'}
                      stroke={word ? '#f59e0b' : '#38bdf8'}
                      strokeWidth="1.8"
                      strokeDasharray={word ? 'none' : '4 3'}
                      className="transition-all group-hover:stroke-amber-300"
                    />
                    {word ? (
                      <g>
                        <text
                          x="100"
                          y="134"
                          textAnchor="middle"
                          fill="#fef08a"
                          fontSize="24"
                          fontWeight="900"
                          fontFamily="serif"
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))"
                        >
                          {word}
                        </text>
                      </g>
                    ) : (
                      <text x="100" y="131" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold" opacity="0.65">
                        {lang === 'en' ? `Carriage ${slotNumEn}` : `العربة ${slotNumAr}`}
                      </text>
                    )}

                    {is4Carriages ? (
                      <rect x="192" y="160" width="16" height="6" rx="2" fill="url(#goldBevel)" stroke="#78350f" strokeWidth="0.8" />
                    ) : (
                      // Rear Red Tail Lanterns
                      <g>
                        <rect x="192" y="96" width="5" height="12" rx="1.5" fill="#0f172a" stroke="#d97706" strokeWidth="0.8" />
                        <circle cx="194" cy="102" r="3" fill="#ef4444" filter="drop-shadow(0 0 5px #ef4444)" />
                      </g>
                    )}
                  </g>
                );
              })()}

              {/* =====================================================
                  CARRIAGE 4 (Only shown for 4-word sentences):
                  Far Right / Start of Sentence!
                  Holds 1st Word (carriageWordFarRight)
                 ===================================================== */}
              {is4Carriages && (
                <g
                  id="carriage-4-rear"
                  transform="translate(820, 0)"
                  className="cursor-pointer group select-none"
                  onClick={() => carriageWordFarRight && handleRemoveCarriage(carriageWordFarRight)}
                >
                  <ellipse cx="98" cy="184" rx="94" ry="8" fill="#000" opacity="0.6" filter="blur(3px)" />
                  {[28, 56, 140, 168].map((wx, i) => (
                    <g key={`c-4-wheel-${i}`}>
                      <circle cx={wx} cy="168" r="13" fill="#020617" stroke="url(#goldBevel)" strokeWidth="2" />
                      <circle cx={wx} cy="168" r="7" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                      <circle cx={wx} cy="168" r="3" fill="url(#goldBevel)" />
                    </g>
                  ))}
                  <rect x="8" y="86" width="184" height="78" rx="8" fill="url(#carriageBlue)" stroke="url(#goldBevel)" strokeWidth="2.8" className="transition-all group-hover:brightness-110" />
                  <rect x="4" y="82" width="192" height="7" rx="2.5" fill="url(#goldBevel)" stroke="#78350f" strokeWidth="0.8" />
                  <rect
                    x="18"
                    y="98"
                    width="164"
                    height="54"
                    rx="6"
                    fill={carriageWordFarRight ? '#041d22' : '#0a1428'}
                    stroke={carriageWordFarRight ? '#f59e0b' : '#38bdf8'}
                    strokeWidth="1.8"
                    strokeDasharray={carriageWordFarRight ? 'none' : '4 3'}
                    className="transition-all group-hover:stroke-amber-300"
                  />
                  {carriageWordFarRight ? (
                    <g>
                      <text
                        x="100"
                        y="134"
                        textAnchor="middle"
                        fill="#fef08a"
                        fontSize="24"
                        fontWeight="900"
                        fontFamily="serif"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))"
                      >
                        {carriageWordFarRight}
                      </text>
                    </g>
                  ) : (
                    <text x="100" y="131" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold" opacity="0.65">
                      {lang === 'en' ? 'Carriage 1' : 'العربة ١'}
                    </text>
                  )}

                  {/* Rear Red Tail Lanterns on Carriage 4 */}
                  <rect x="192" y="96" width="5" height="12" rx="1.5" fill="#0f172a" stroke="#d97706" strokeWidth="0.8" />
                  <circle cx="194" cy="102" r="3" fill="#ef4444" filter="drop-shadow(0 0 5px #ef4444)" />
                </g>
              )}

            </g>
          </svg>
        </div>
      </div>

      {/* 4. Bottom Station Platform: Word Depot Tiles & Action Button */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-3 sm:px-6 pb-3 sm:pb-6 space-y-3 sm:space-y-4">
        {/* Word Depot Tiles */}
        <div className="w-full my-1 sm:my-2">
          <div
            dir="rtl"
            className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap"
          >
            {puzzle.words.map((word, idx) => {
              const isCoupled = assembled.includes(word);
              return (
                <motion.button
                  key={`word-tile-${idx}`}
                  whileHover={!isDeparting ? { scale: 1.03, y: -2 } : undefined}
                  whileTap={!isDeparting ? { scale: 0.96 } : undefined}
                  onClick={() => handleSelectWord(word)}
                  disabled={isDeparting || isEntering}
                  title={isCoupled 
                    ? (lang === 'en' ? 'Click to uncouple word' : 'اضغط لإلغاء اختيار الكلمة') 
                    : (lang === 'en' ? 'Click to couple word to train' : 'اضغط لوصل الكلمة بالقطار')}
                  className={`relative min-w-[120px] sm:min-w-[160px] px-4 sm:px-6 py-3 rounded-xl border transition-all flex items-center justify-between gap-3 select-none cursor-pointer overflow-hidden ${
                    isCoupled
                      ? 'bg-[#06151a]/60 border-teal-900/40 text-teal-400/40 shadow-none opacity-50'
                      : 'bg-gradient-to-b from-[#162736]/95 via-[#0e1c27]/98 to-[#060e15]/98 border-amber-500/60 text-amber-100 shadow-[0_10px_25px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(254,240,138,0.25)] hover:border-amber-300 hover:brightness-110'
                  }`}
                >
                  <div className="flex items-center text-amber-400/60 shrink-0">
                    <GripVertical size={20} className="stroke-[2.5]" />
                  </div>

                  <span className="text-xl sm:text-2xl md:text-3xl font-black font-serif tracking-wide text-center flex-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {word}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-center pt-1.5 pb-2.5 sm:pb-3.5">
          <motion.button
            whileHover={
              assembled.length === puzzle.words.length && !isDeparting
                ? { scale: 1.03 }
                : undefined
            }
            whileTap={
              assembled.length === puzzle.words.length && !isDeparting
                ? { scale: 0.96 }
                : undefined
            }
            disabled={assembled.length !== puzzle.words.length || isDeparting}
            onClick={handleCheckAndDepart}
            className={`px-8 sm:px-11 py-2 sm:py-2.5 rounded-xl font-black text-sm sm:text-base flex items-center justify-center border-2 transition-all cursor-pointer ${
              assembled.length === puzzle.words.length && !isDeparting
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
