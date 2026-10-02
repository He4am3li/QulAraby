import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  parts?: { text: string; color: string; role: string }[];
  type: string;
  explanation: string;
  hint: string;
}

export interface ChoiceOption {
  key: string;
  label: string;
}

interface CinematicTrainSceneProps {
  currentQ: Question;
  s2Index: number;
  totalQuestions: number;
  s2AnswerState: 'idle' | 'correct' | 'wrong';
  s2SelectedChoice: string | null;
  trainMovement: 'station' | 'toNominal' | 'toVerbal' | 'departed';
  onChoice: (choice: any) => void;
  onNext: () => void;
  onRetry?: () => void;
  onWhistle: () => void;
  onNavigateStage: (stage: number) => void;
  customChoices?: ChoiceOption[];
  ruleId?: string;
  lang?: 'ar' | 'en';
}

// 5 Barrier X positions along the 1100px track (Right to Left: Barrier 1 to Barrier 5)
// Spaced symmetrically and professionally across the station (860, 700, 540, 380, 220)
const BARRIER_X_POSITIONS = [860, 700, 540, 380, 220];
const STEP_DISTANCE = 160;
const TRAIN_START_X = 885;

export const CinematicTrainScene: React.FC<CinematicTrainSceneProps> = ({
  currentQ,
  s2Index,
  totalQuestions,
  s2AnswerState,
  s2SelectedChoice,
  onChoice,
  customChoices,
  ruleId,
  lang = 'ar',
}) => {
  const activeChoices: ChoiceOption[] = customChoices && customChoices.length > 0 
    ? customChoices 
    : [
        { key: 'nominal', label: 'جملة اسمية' },
        { key: 'verbal', label: 'جملة فعلية' }
      ];

  const isPluralRule = ruleId === 'plurals' || activeChoices.some(c => c.key.includes('salem') || c.key.includes('takseer'));
  let promptPrefix = 'ما نوع الجملة/';
  if (lang === 'en') {
    if (isPluralRule || currentQ.text.includes('جمع')) {
      promptPrefix = 'Plural type in / ';
    } else if (ruleId === 'kana_sisters' || currentQ.text.includes('كان') || currentQ.text.includes('أصبح')) {
      promptPrefix = 'Kana element in / ';
    } else if (ruleId === 'inna_sisters' || currentQ.text.includes('إنّ') || currentQ.text.includes('لعل')) {
      promptPrefix = 'Inna element in / ';
    } else if (ruleId === 'prepositions') {
      promptPrefix = 'Preposition in / ';
    } else {
      promptPrefix = 'Sentence type in / ';
    }
  } else {
    if (isPluralRule || currentQ.text.includes('جمع')) {
      promptPrefix = 'ما نوع الجمع في جملة/';
    } else if (ruleId === 'kana_sisters' || currentQ.text.includes('كان') || currentQ.text.includes('أصبح')) {
      promptPrefix = 'حدّد ركن كان في جملة/';
    } else if (ruleId === 'inna_sisters' || currentQ.text.includes('إنّ') || currentQ.text.includes('لعل')) {
      promptPrefix = 'حدّد ركن إنّ في جملة/';
    } else if (ruleId === 'prepositions') {
      promptPrefix = 'حدّد حرف الجر في جملة/';
    } else if (currentQ.text.includes('كلمة') || currentQ.text.includes(':')) {
      promptPrefix = 'حدّد التصنيف المطلوب/';
    }
  }

  // Wheel rotation angle: ONLY active while moving forward
  const [wheelAngle, setWheelAngle] = useState<number>(0);
  const [isWheelsRolling, setIsWheelsRolling] = useState<boolean>(false);
  const [bgReady, setBgReady] = useState<boolean>(false);

  // Pre-check if background image is already cached to eliminate train-before-background pop-in
  useEffect(() => {
    const img = new Image();
    img.src = '/station2_night_rail.jpg';
    if (img.complete) {
      setBgReady(true);
    } else {
      img.onload = () => setBgReady(true);
      img.onerror = () => setBgReady(true);
      const timer = setTimeout(() => setBgReady(true), 150);
      return () => clearTimeout(timer);
    }
  }, []);

  const isFinalDeparture = s2Index === totalQuestions - 1 && s2AnswerState === 'correct';

  // Drive wheels ONLY during actual motion (1.25 seconds after correct answer)
  useEffect(() => {
    if (s2AnswerState === 'correct') {
      setIsWheelsRolling(true);
      const timer = setTimeout(() => {
        setIsWheelsRolling(false);
      }, isFinalDeparture ? 1750 : 1250);
      return () => clearTimeout(timer);
    } else {
      setIsWheelsRolling(false);
    }
  }, [s2AnswerState, s2Index]);

  // Rotate wheels smoothly only when rolling
  useEffect(() => {
    if (!isWheelsRolling) return;
    let animId: number;
    let lastTime = performance.now();
    const animateWheels = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setWheelAngle(prev => (prev - dt * 420) % 360);
      animId = requestAnimationFrame(animateWheels);
    };
    animId = requestAnimationFrame(animateWheels);
    return () => cancelAnimationFrame(animId);
  }, [isWheelsRolling]);

  // Train Cowcatcher X Position
  // Initially at question 0: train sits at x = 885, just in front of Barrier 1 at x = 860
  // When each question is answered correctly, it moves forward by 160px to the next barrier
  // When final question is answered, it accelerates all the way off-screen
  const initialX = TRAIN_START_X - s2Index * STEP_DISTANCE;
  const targetX = isFinalDeparture 
    ? -850 
    : s2AnswerState === 'correct' 
      ? TRAIN_START_X - (s2Index + 1) * STEP_DISTANCE 
      : initialX;

  return (
    <div className={`relative w-full flex-1 flex flex-col justify-between overflow-hidden select-none bg-[#030d12] transition-opacity duration-200 ${
      bgReady ? 'opacity-100' : 'opacity-90'
    }`}>
      {/* 1. Cinematic Night Sky & Rolling Hills Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/station2_night_rail.jpg"
          alt="Night Railroad Scene"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="sync"
          // @ts-ignore
          fetchPriority="high"
          onLoad={() => setBgReady(true)}
          onError={(e) => {
            e.currentTarget.src = '/train_cinematic_bg.jpg';
            setBgReady(true);
          }}
        />
        {/* Soft vignette gradients to ensure high UI readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020b0f] via-transparent to-[#020b0f]/80" />
        <div className="absolute inset-0 bg-radial-vignette opacity-40" />
      </div>

      {/* 2. Top Ornate Station Banner with Hanging Vintage Lamp (Matching Stage 3 & 4) */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4 flex flex-col items-center">
        {/* Hanging Antique Lamp casting spotlight */}
        <div className="relative flex flex-col items-center -mb-2 z-10">
          <div className="w-0.5 h-6 bg-gradient-to-b from-amber-600 to-amber-400" />
          <div className="w-9 h-4 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 rounded-t-full shadow-md" />
          <div className="w-7 h-2 bg-amber-200 rounded-b-full shadow-[0_0_15px_rgba(254,240,138,0.9)] animate-pulse" />
        </div>

        {/* Station Signboard for Prompt (Unified Dimensions across Stages 2, 3 & 4) */}
        <div className="relative w-full max-w-2xl px-4 sm:px-8 py-2 sm:py-2.5 h-[72px] sm:h-[80px] flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[#09222c]/95 via-[#05171e]/98 to-[#09222c]/95 border-2 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.25),inset_0_1px_4px_rgba(255,255,255,0.2)] text-center backdrop-blur-md overflow-hidden">
          {/* 4 Corner Brass Studs */}
          <div className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
          <div className="absolute top-1.5 left-2 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
          <div className="absolute bottom-1.5 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
          <div className="absolute bottom-1.5 left-2 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />

          {/* Unified single-line heading matching Stage 3 & 4 - shrinks font to prevent downward movement */}
          <h2 className={`font-black text-amber-100 drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)] font-serif flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-2 ${
            (promptPrefix.length + currentQ.text.length) > 35
              ? 'text-xs sm:text-sm md:text-base'
              : (promptPrefix.length + currentQ.text.length) > 22
              ? 'text-sm sm:text-base md:text-lg'
              : 'text-base sm:text-xl md:text-2xl'
          }`} dir={lang === 'en' ? 'ltr' : 'rtl'}>
            <span className="shrink-0">
              {promptPrefix}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-yellow-200 to-amber-400 truncate">
              «{currentQ.text}»
            </span>
          </h2>
        </div>

        {/* Question Progress Dots under the question rectangle (Unifying Stage 2, 3 & 4) */}
        <div className="flex items-center justify-center gap-2 mt-2.5 sm:mt-3" dir="rtl">
          {Array.from({ length: totalQuestions || 5 }).map((_, idx) => {
            const isCleared = idx < s2Index || (idx === s2Index && s2AnswerState === 'correct');
            const isCurrent = idx === s2Index && s2AnswerState !== 'correct';
            return (
              <div
                key={`s2-pip-${idx}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCleared
                    ? 'w-4 sm:w-5 bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                    : isCurrent
                    ? 'w-6 sm:w-8 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse ring-2 ring-amber-400/40'
                    : 'w-2.5 sm:w-3 bg-slate-800/80 border border-slate-700/60'
                }`}
                title={lang === 'en' ? `Question ${idx + 1} of ${totalQuestions || 5}` : `السؤال ${idx + 1} من ${totalQuestions || 5}`}
              />
            );
          })}
        </div>
      </div>

      {/* 3. The Straight Rail Track, 5 Animated Barriers & Moving Locomotive SVG */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-2 sm:px-4 my-auto">
        <svg
          viewBox="0 0 1100 280"
          className="w-full h-auto overflow-visible select-none"
          preserveAspectRatio="xMidYMid meet"
          style={{ filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.9))' }}
        >
          <defs>
            {/* Metallic Locomotive Paint */}
            <linearGradient id="s2LocoNavy" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="35%" stopColor="#172554" />
              <stop offset="70%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Carriage Prussian Blue */}
            <linearGradient id="s2CarriageBlue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="30%" stopColor="#1e3a8a" />
              <stop offset="70%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Polished Brass Gold Trim */}
            <linearGradient id="s2GoldBevel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Headlight Volumetric Light Beam */}
            <radialGradient id="s2HeadlightBeam" cx="100%" cy="50%" r="90%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#fde047" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </radialGradient>

            {/* Steam Smoke Particle */}
            <radialGradient id="s2SteamSmoke" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 3.1 Ground Embankment & Straight Railroad Track */}
          <g id="railroad-track">
            {/* Dark Stone Ballast */}
            <rect x="0" y="196" width="1100" height="34" fill="#0c141d" opacity="0.9" />
            <polygon points="0,230 1100,230 1100,240 0,240" fill="#060b10" opacity="0.7" />

            {/* Wooden Ties (Sleepers) */}
            {Array.from({ length: 55 }).map((_, i) => (
              <rect
                key={`tie-${i}`}
                x={i * 20 + 2}
                y="194"
                width="13"
                height="22"
                rx="2"
                fill="#271408"
                stroke="#120803"
                strokeWidth="1.2"
              />
            ))}

            {/* Steel Rails */}
            {/* Top Rail */}
            <rect x="0" y="192" width="1100" height="4.5" fill="url(#s2GoldBevel)" />
            <line x1="0" y1="192.5" x2="1100" y2="192.5" stroke="#ffffff" strokeWidth="1.2" />

            {/* Bottom Rail */}
            <rect x="0" y="210" width="1100" height="4" fill="#475569" />
            <line x1="0" y1="210.5" x2="1100" y2="210.5" stroke="#94a3b8" strokeWidth="1.2" />
          </g>

          {/* 3.2 THE 8 RAILROAD CROSSING BARRIERS */}
          {BARRIER_X_POSITIONS.map((bx, i) => {
            const isCleared = i < s2Index;
            const isCurrent = i === s2Index;
            const isOpen = isCleared || (isCurrent && s2AnswerState === 'correct');
            const isWrong = isCurrent && s2AnswerState === 'wrong';

            return (
              <g key={`barrier-group-${i}`} id={`barrier-group-${i}`}>
                {/* Vintage Steel Signal Post sitting behind the upper rail */}
                <rect x={bx - 4} y="116" width="8" height="66" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />

                {/* Base Anchor on Track */}
                <polygon points={`${bx - 8},186 ${bx + 8},186 ${bx + 5},176 ${bx - 5},176`} fill="#1e293b" stroke="#0f172a" strokeWidth="1" />

                {/* Signal Housing Head */}
                <rect x={bx - 10} y="106" width="20" height="26" rx="4" fill="#020617" stroke="#475569" strokeWidth="1.2" />
                {/* Sun Visor Hood */}
                <path d={`M ${bx - 11} 109 Q ${bx} 103 ${bx + 11} 109`} fill="none" stroke="#64748b" strokeWidth="2.5" />

                {/* Signal Lamp (Red = Closed, Green = Open, Pulsing Crimson = Wrong) */}
                {isOpen ? (
                  // GREEN LAMP (OPEN)
                  <g>
                    <circle cx={bx} cy="119" r="14" fill="#22c55e" opacity="0.3" />
                    <circle cx={bx} cy="119" r="8" fill="#22c55e" stroke="#86efac" strokeWidth="1.5" />
                    <circle cx={bx} cy="119" r="3.5" fill="#ffffff" filter="drop-shadow(0 0 6px #4ade80)" />
                  </g>
                ) : isWrong ? (
                  // FLASHING ALARM RED LAMP (WRONG)
                  <g className="animate-pulse">
                    <circle cx={bx} cy="119" r="18" fill="#ef4444" opacity="0.45" />
                    <circle cx={bx} cy="119" r="8" fill="#ef4444" stroke="#fca5a5" strokeWidth="1.8" />
                    <circle cx={bx} cy="119" r="3.5" fill="#ffffff" filter="drop-shadow(0 0 10px #ef4444)" />
                  </g>
                ) : (
                  // STEADY RED LAMP (CLOSED / WAITING)
                  <g>
                    <circle cx={bx} cy="119" r="10" fill="#dc2626" opacity="0.25" />
                    <circle cx={bx} cy="119" r="7.5" fill="#dc2626" stroke="#f87171" strokeWidth="1.2" />
                    <circle cx={bx} cy="119" r="3" fill="#fecaca" />
                  </g>
                )}

                {/* Front Catch Stanchion (resting on the front ballast across the track) */}
                <rect x={bx - 29} y="214" width="6" height="14" rx="1.5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <rect x={bx - 32} y="226" width="12" height="4" rx="1" fill="#1e293b" />

                {/* Boom Barrier Arm Pivot Mechanism */}
                <circle cx={bx} cy="172" r="6" fill="#0f172a" stroke="#d97706" strokeWidth="1.5" />
                <circle cx={bx} cy="172" r="2.5" fill="#f59e0b" />

                {/* 
                  Striped Crossing Gate Arm:
                  When CLOSED: rotated by 64°, spans diagonally down-forward across the tracks to front catch.
                  When OPEN: rotated by -90°, raises straight up into the air vertically!
                */}
                <motion.g
                  initial={false}
                  animate={{
                    rotate: isOpen ? -90 : 64,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 70,
                    damping: 14,
                  }}
                  style={{ transformOrigin: `${bx}px 172px` }}
                >
                  {/* Counterweight extension behind pivot */}
                  <rect x={bx} y="169" width="14" height="6" rx="1.5" fill="#334155" stroke="#0f172a" strokeWidth="1" />
                  <rect x={bx + 8} y="167" width="8" height="10" rx="1.5" fill="#1e293b" />

                  {/* Striped Arm extending along negative local X */}
                  <g transform={`translate(${bx}, 172)`}>
                    {/* Main White Beam */}
                    <polygon points="0,-3.5 -58,-3.5 -58,3.5 0,3.5" fill="#f8fafc" stroke="#334155" strokeWidth="0.8" />

                    {/* Red Stripes (Matching Screenshot) */}
                    <polygon points="-10,-3.5 -2,-3.5 -2,3.5 -10,3.5" fill="#dc2626" />
                    <polygon points="-26,-3.5 -18,-3.5 -18,3.5 -26,3.5" fill="#dc2626" />
                    <polygon points="-42,-3.5 -34,-3.5 -34,3.5 -42,3.5" fill="#dc2626" />
                    <polygon points="-58,-3.5 -50,-3.5 -50,3.5 -58,3.5" fill="#dc2626" />

                    {/* Bottom Edge Shadow */}
                    <line x1="0" y1="3.5" x2="-58" y2="3.5" stroke="#0f172a" strokeWidth="1" opacity="0.6" />
                  </g>
                </motion.g>
              </g>
            );
          })}

          {/* 3.3 THE VINTAGE STEAM TRAIN (Locomotive on Left, Facing Left, Carriages on Right) */}
          <motion.g
            initial={false}
            animate={{ x: targetX }}
            transition={{
              type: 'spring',
              stiffness: isFinalDeparture ? 25 : 50,
              damping: isFinalDeparture ? 20 : 16,
              mass: 1.2,
            }}
          >
            {/* Headlight Light Beam Shining Left Forward */}
            <polygon
              points="10,166 -220,105 -220,225 10,178"
              fill="url(#s2HeadlightBeam)"
              opacity={isWheelsRolling ? 0.95 : 0.75}
            />

            {/* Billowing Steam Clouds from Smokestack */}
            <g transform="translate(65, 110)">
              {[0, 1, 2, 3].map(idx => {
                const animScale = isWheelsRolling ? 1.3 : 1.0;
                const puffY = -10 - idx * 14 * animScale;
                const puffX = (idx % 2 === 0 ? 1 : -1) * (idx * 6 + (isWheelsRolling ? idx * 10 : 0));
                const puffR = (7 + idx * 6) * animScale;
                return (
                  <circle
                    key={`steam-puff-${idx}`}
                    cx={puffX}
                    cy={puffY}
                    r={puffR}
                    fill="url(#s2SteamSmoke)"
                    className={isWheelsRolling ? 'animate-ping' : ''}
                    style={{ animationDuration: `${1.1 + idx * 0.3}s` }}
                  />
                );
              })}
            </g>

            {/* =========================================================
                A. LOCOMOTIVE ENGINE (Front Cowcatcher at x=0, Cab at x=130-195)
               ========================================================= */}
            <g id="s2-locomotive">
              {/* Ground Shadow under Locomotive */}
              <ellipse cx="100" cy="216" rx="96" ry="7" fill="#000000" opacity="0.65" filter="blur(3px)" />

              {/* Front Wedge Cowcatcher (Pilot) */}
              <polygon points="0,214 24,188 24,214" fill="#0f172a" stroke="url(#s2GoldBevel)" strokeWidth="1.5" />
              <line x1="6" y1="214" x2="24" y2="194" stroke="#475569" strokeWidth="1" />
              <line x1="12" y1="214" x2="24" y2="201" stroke="#475569" strokeWidth="1" />
              <line x1="18" y1="214" x2="24" y2="208" stroke="#475569" strokeWidth="1" />

              {/* Leading Bogie Wheels (Two front wheels) */}
              {[32, 60].map((fwx, i) => (
                <g key={`lead-wheel-${i}`} transform={`rotate(${wheelAngle} ${fwx} 208)`}>
                  <circle cx={fwx} cy="208" r="9" fill="#020617" stroke="url(#s2GoldBevel)" strokeWidth="1.8" />
                  <circle cx={fwx} cy="208" r="4.5" fill="#1e293b" stroke="#64748b" strokeWidth="0.8" />
                  <line x1={fwx - 9} y1="208" x2={fwx + 9} y2="208" stroke="url(#s2GoldBevel)" strokeWidth="1" />
                  <line x1={fwx} y1="199" x2={fwx} y2="217" stroke="url(#s2GoldBevel)" strokeWidth="1" />
                </g>
              ))}

              {/* Large Driving Wheels (Three 40px diameter wheels) */}
              {[95, 135, 175].map((dwx, i) => (
                <g key={`driver-${i}`}>
                  <g transform={`rotate(${wheelAngle} ${dwx} 204)`}>
                    {/* Outer Steel Rim & Gold Flange */}
                    <circle cx={dwx} cy="204" r="18" fill="#020617" stroke="url(#s2GoldBevel)" strokeWidth="2.5" />
                    {/* Inner Rim */}
                    <circle cx={dwx} cy="204" r="14" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                    {/* 8 Radial Wheel Spokes */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
                      const rad = (deg * Math.PI) / 180;
                      return (
                        <line
                          key={`spoke-${dwx}-${deg}`}
                          x1={dwx}
                          y1="204"
                          x2={dwx + Math.cos(rad) * 14}
                          y2={204 + Math.sin(rad) * 14}
                          stroke="url(#s2GoldBevel)"
                          strokeWidth="1.2"
                        />
                      );
                    })}
                    {/* Heavy Counter-Balance Wedge */}
                    <path
                      d={`M ${dwx - 12} 204 A 12 12 0 0 1 ${dwx + 12} 204 Z`}
                      fill="url(#s2GoldBevel)"
                      opacity="0.85"
                    />
                    {/* Center Wheel Hub */}
                    <circle cx={dwx} cy="204" r="5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                  </g>

                  {/* Pin Joint on Drive Wheel for Side Connecting Rod */}
                  <circle
                    cx={dwx + Math.cos(((wheelAngle + 90) * Math.PI) / 180) * 8}
                    cy={204 + Math.sin(((wheelAngle + 90) * Math.PI) / 180) * 8}
                    r="2.5"
                    fill="#ffffff"
                    stroke="#1e293b"
                    strokeWidth="0.8"
                  />
                </g>
              ))}

              {/* Side Connecting Drive Rod linking the 3 drivers */}
              <g transform={`translate(0, ${Math.sin(((wheelAngle + 90) * Math.PI) / 180) * 8})`}>
                <rect x="90" y="202" width="90" height="4.5" rx="2" fill="url(#s2GoldBevel)" stroke="#78350f" strokeWidth="0.8" />
                <rect x="42" y="196" width="58" height="5" rx="2" fill="#cbd5e1" stroke="#334155" strokeWidth="1" transform="rotate(-7 42 196)" />
              </g>

              {/* Cylindrical Steam Boiler Body */}
              <rect x="22" y="142" width="112" height="48" rx="6" fill="url(#s2LocoNavy)" stroke="url(#s2GoldBevel)" strokeWidth="2.2" />
              {/* Gold Boiler Bands */}
              <line x1="50" y1="142" x2="50" y2="190" stroke="url(#s2GoldBevel)" strokeWidth="2" />
              <line x1="82" y1="142" x2="82" y2="190" stroke="url(#s2GoldBevel)" strokeWidth="2" />
              <line x1="114" y1="142" x2="114" y2="190" stroke="url(#s2GoldBevel)" strokeWidth="2" />

              {/* Smokebox Door & Front Curve */}
              <path d="M 22 142 Q 14 166 22 190 Z" fill="#09131a" stroke="url(#s2GoldBevel)" strokeWidth="1.8" />

              {/* Tall Flanged Smokestack */}
              <path d="M 60 142 L 58 116 L 72 116 L 70 142 Z" fill="#09131a" stroke="url(#s2GoldBevel)" strokeWidth="1.5" />
              <ellipse cx="65" cy="116" rx="8" ry="2.5" fill="url(#s2GoldBevel)" stroke="#78350f" strokeWidth="0.8" />

              {/* Polished Brass Steam Dome */}
              <ellipse cx="98" cy="136" rx="9" ry="8" fill="url(#s2GoldBevel)" stroke="#78350f" strokeWidth="1.2" />

              {/* Sand Dome / Whistle */}
              <rect x="120" y="132" width="5" height="10" rx="1.5" fill="url(#s2GoldBevel)" stroke="#78350f" strokeWidth="0.6" />

              {/* Traditional Golden Headlight Lantern */}
              <g id="s2-headlight">
                <rect x="8" y="156" width="16" height="20" rx="3" fill="#020617" stroke="url(#s2GoldBevel)" strokeWidth="1.8" />
                <path d="M 8 156 L 2 153 L 2 179 L 8 176 Z" fill="url(#s2GoldBevel)" stroke="#78350f" strokeWidth="1" />
                <circle cx="16" cy="166" r="6" fill="#fef08a" filter="drop-shadow(0 0 8px #f59e0b)" />
                <circle cx="16" cy="166" r="3" fill="#ffffff" />
              </g>

              {/* Driver Engineer Cab */}
              <path d="M 134 126 L 194 126 L 194 190 L 134 190 Z" fill="url(#s2LocoNavy)" stroke="url(#s2GoldBevel)" strokeWidth="2.2" />
              {/* Cab Curved Roof */}
              <path d="M 130 126 Q 164 120 198 126" fill="none" stroke="url(#s2GoldBevel)" strokeWidth="4" strokeLinecap="round" />
              {/* Arched Cab Window with Warm Interior Lamp Glow */}
              <path d="M 144 140 A 10 10 0 0 1 166 140 L 166 160 L 144 160 Z" fill="#fef08a" stroke="#78350f" strokeWidth="1.5" />
              <path d="M 172 140 A 8 8 0 0 1 188 140 L 188 160 L 172 160 Z" fill="#fef08a" stroke="#78350f" strokeWidth="1.2" />

              {/* Running Board along side */}
              <rect x="20" y="188" width="176" height="4" rx="1" fill="url(#s2GoldBevel)" stroke="#78350f" strokeWidth="0.8" />
            </g>

            {/* =========================================================
                THE 3 IDENTICAL PASSENGER CARRIAGES BEHIND THE LOCOMOTIVE
               ========================================================= */}
            {[206, 394, 582].map((carX, carIdx) => (
              <g key={`passenger-carriage-unit-${carIdx}`}>
                {/* Coupler in front of carriage */}
                <rect x={carX - 12} y="196" width="12" height="5" rx="1.5" fill="url(#s2GoldBevel)" stroke="#78350f" strokeWidth="0.8" />

                {/* Carriage Body */}
                <g id={`s2-carriage-${carIdx + 1}`} transform={`translate(${carX}, 0)`}>
                  {/* Ground Shadow */}
                  <ellipse cx="90" cy="216" rx="86" ry="6" fill="#000" opacity="0.6" filter="blur(2px)" />

                  {/* Carriage Wheels (4 wheels per carriage, rotate with wheels) */}
                  {[22, 48, 132, 158].map((cwx, i) => (
                    <g key={`car-${carIdx}-wheel-${i}`} transform={`rotate(${wheelAngle} ${cwx} 204)`}>
                      <circle cx={cwx} cy="204" r="11" fill="#020617" stroke="url(#s2GoldBevel)" strokeWidth="2" />
                      <circle cx={cwx} cy="204" r="4.5" fill="#1e293b" stroke="#64748b" strokeWidth="0.8" />
                      <line x1={cwx - 11} y1="204" x2={cwx + 11} y2="204" stroke="url(#s2GoldBevel)" strokeWidth="1" />
                      <line x1={cwx} y1="193" x2={cwx} y2="215" stroke="url(#s2GoldBevel)" strokeWidth="1" />
                    </g>
                  ))}

                  {/* Main Carriage Cabin */}
                  <rect x="6" y="128" width="170" height="70" rx="6" fill="url(#s2CarriageBlue)" stroke="url(#s2GoldBevel)" strokeWidth="2.2" />
                  {/* Roof Trim */}
                  <rect x="2" y="124" width="178" height="6" rx="2" fill="url(#s2GoldBevel)" stroke="#78350f" strokeWidth="0.8" />

                  {/* 4 Illuminated Windows */}
                  {[18, 54, 90, 126].map((wwx, i) => (
                    <g key={`car-${carIdx}-win-${i}`}>
                      <rect x={wwx} y="142" width="26" height="24" rx="4" fill="#fef08a" stroke="#78350f" strokeWidth="1.2" />
                      <circle cx={wwx + 13} cy="154" r="4.5" fill="#78350f" />
                    </g>
                  ))}
                </g>
              </g>
            ))}
          </motion.g>
        </svg>
      </div>

      {/* 4. Bottom Answer Choice Buttons (Matching Stage 4 cinematic cards) */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 pb-4 sm:pb-6">
        <div dir="rtl" className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
          {activeChoices.map((choice) => {
            const isSelected = s2SelectedChoice === choice.key;
            const isWrong = s2AnswerState === 'wrong' && isSelected;
            const isCorrect = s2AnswerState === 'correct' && isSelected;

            return (
              <motion.button
                key={choice.key}
                type="button"
                whileHover={s2AnswerState === 'idle' ? { scale: 1.03, y: -2 } : undefined}
                whileTap={s2AnswerState === 'idle' ? { scale: 0.97 } : undefined}
                onClick={() => onChoice(choice.key)}
                disabled={s2AnswerState !== 'idle'}
                className={`relative min-w-[150px] sm:min-w-[190px] px-5 sm:px-6 py-3 rounded-xl border transition-all flex items-center justify-between gap-3 select-none cursor-pointer overflow-hidden ${
                  isWrong
                    ? 'bg-[#2a0c10]/95 border-rose-500 ring-2 ring-rose-500/50 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                    : isCorrect
                    ? 'bg-[#082218]/95 border-emerald-400 ring-2 ring-emerald-400/50 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.7)]'
                    : 'bg-gradient-to-b from-[#162736]/95 via-[#0e1c27]/98 to-[#060e15]/98 border-amber-500/60 text-amber-100 shadow-[0_10px_25px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(254,240,138,0.25)] hover:border-amber-300 hover:brightness-110'
                }`}
              >
                {/* Tactile 6-dot grip handle icon */}
                <div className="flex items-center text-amber-400/60 shrink-0">
                  <GripVertical size={18} className="stroke-[2.5]" />
                </div>
                {/* Word text */}
                <div className="flex-1 text-center">
                  <span className="text-lg sm:text-xl font-black font-serif tracking-wide block drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {choice.label}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
