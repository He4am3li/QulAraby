import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, Star, Volume2, VolumeX, RotateCcw,
  ArrowLeft, X, Play, ArrowRight
} from 'lucide-react';

// The supplied PowerPoint's original footage (verified SHA-256) is rendered directly.
// The striker, goalkeeper, ball, net and stadium are already inside each shot.
import { PenaltyLive3D } from './PenaltyLive3D';

// ========================================================
// 1. أسئلة لغوية دقيقة بثلاثة خيارات فقط (إجابة واحدة صحيحة واثنتان خاطئتان)
// ========================================================
interface Question {
  id: number;
  prompt: string;
  category: string;
  explanation: string;
  answers: {
    letter: string;
    text: string;
    correct: boolean;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    prompt: "ما هو الفاعل في جملة: «يقرأُ الطالبُ الكتابَ بانتظام»؟",
    category: "النحو والإعراب",
    explanation: "الفاعل هو الاسم المرفوع الذي قام بالفعل، وهو هنا «الطالبُ» وعلامة رفعه الضمة الظاهرة.",
    answers: [
      { letter: "أ", text: "الطالبُ", correct: true },
      { letter: "ب", text: "الكتابَ", correct: false },
      { letter: "ج", text: "يقرأُ", correct: false }
    ]
  },
  {
    id: 2,
    prompt: "أي الكلمات الآتية كُتبت فيها الهمزة المتطرفة بصورة صحيحة؟",
    category: "قواعد الإملاء",
    explanation: "تُكتب الهمزة المتطرفة على الياء غير المنقوطة (شاطئ) لأن الحرف الذي قبلها مكسور.",
    answers: [
      { letter: "أ", text: "شاطيء", correct: false },
      { letter: "ب", text: "شاطئ", correct: true },
      { letter: "ج", text: "شاطأ", correct: false }
    ]
  },
  {
    id: 3,
    prompt: "حدد الكلمة التي تبدأ بـ «همزة قطع» صريحة فيما يلي:",
    category: "همزتا الوصل والقطع",
    explanation: "«أحمد» همزته همزة قطع لأنه اسم علم، بينما استغفار وابن همزتهما همزة وصل.",
    answers: [
      { letter: "أ", text: "استغفار", correct: false },
      { letter: "ب", text: "أحمد", correct: true },
      { letter: "ج", text: "ابن", correct: false }
    ]
  },
  {
    id: 4,
    prompt: "الجملة السليمة نحوياً عند دخول الفعل الناسخ «كان» هي:",
    category: "الأفعال الناسخة",
    explanation: "«كان» ترفع المبتدأ اسماً لها (المعلمون بالواو) وتنصب الخبر (حاضرين بالياء).",
    answers: [
      { letter: "أ", text: "كان المعلمون حاضرين", correct: true },
      { letter: "ب", text: "كان المعلمين حاضرون", correct: false },
      { letter: "ج", text: "كان المعلمون حاضرون", correct: false }
    ]
  },
  {
    id: 5,
    prompt: "الكلمة الصحيحة لملء الفراغ: (.... الطالبان إلى المدرسة مبكرينِ):",
    category: "مطابقة الفعل للفاعل",
    explanation: "الفعل في صدارة الجملة يلزم الإفراد دائماً وإن كان الفاعل مثنى، فالصواب «جاءَ».",
    answers: [
      { letter: "أ", text: "جاءا", correct: false },
      { letter: "ب", text: "جاءوا", correct: false },
      { letter: "ج", text: "جاءَ", correct: true }
    ]
  },
  {
    id: 6,
    prompt: "علامة نصب المفعول به في جملة: «كرّمت المعلمةُ المتفوقاتِ» هي:",
    category: "علامات الإعراب الأصلية والفرعية",
    explanation: "جمع المؤنث السالم ينصب بالكسرة نيابة عن الفتحة.",
    answers: [
      { letter: "أ", text: "الكسرة نيابة عن الفتحة", correct: true },
      { letter: "ب", text: "الفتحة الظاهرة", correct: false },
      { letter: "ج", text: "الضمة", correct: false }
    ]
  },
  {
    id: 7,
    prompt: "نوع الأسلوب في جملة: «يا حارس المرمى، كن يقظاً!» هو:",
    category: "الأساليب اللغوية",
    explanation: "الأسلوب يبدأ بأداة نداء (يا) وموجه للمنادى (حارس المرمى)، فهو أسلوب نداء.",
    answers: [
      { letter: "أ", text: "أسلوب استفهام", correct: false },
      { letter: "ب", text: "أسلوب نداء", correct: true },
      { letter: "ج", text: "أسلوب تعجب", correct: false }
    ]
  },
  {
    id: 8,
    prompt: "جمع التكسير الصحيح لكلمة «قاضٍ» هو:",
    category: "الجموع في اللغة العربية",
    explanation: "«قاضٍ» تجمع جمع تكسير على «قُضاة».",
    answers: [
      { letter: "أ", text: "قاضيون", correct: false },
      { letter: "ب", text: "قُضاة", correct: true },
      { letter: "ج", text: "أقضية", correct: false }
    ]
  }
];

// ========================================================
// 2. محرك الصوت الواقعي للملعب
// ========================================================
class PenaltySoundEngine {
  ctx: AudioContext | null = null;
  muted: boolean = false;
  crowdBgmAudio: HTMLAudioElement | null = null;
  goalCheerAudio: HTMLAudioElement | null = null;

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.initAudios();
  }

  initAudios() {
    if (typeof window !== 'undefined') {
      if (!this.crowdBgmAudio) {
        this.crowdBgmAudio = new Audio('/assets/aistudio/Gregor_Quendel_Free_Crowd_Cheering_Sounds_11_Full_recording_103_97b7ddd4.mp3');
        this.crowdBgmAudio.loop = true;
        this.crowdBgmAudio.volume = this.muted ? 0 : 0.28;
      }
      if (!this.goalCheerAudio) {
        this.goalCheerAudio = new Audio('/assets/aistudio/mixkit-crowd-cheer-bonus-3038_730acc93.wav');
        this.goalCheerAudio.volume = this.muted ? 0 : 0.9;
      }
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.crowdBgmAudio) {
      this.crowdBgmAudio.volume = m ? 0 : 0.28;
      if (m) this.crowdBgmAudio.pause();
      else this.crowdBgmAudio.play().catch(() => {});
    }
    if (this.goalCheerAudio) {
      this.goalCheerAudio.volume = m ? 0 : 0.9;
    }
  }

  startAmbience() {
    this.init();
    if (!this.muted && this.crowdBgmAudio) {
      this.crowdBgmAudio.play().catch(() => {});
    }
  }

  stopAmbience() {
    if (this.crowdBgmAudio) {
      this.crowdBgmAudio.pause();
    }
  }

  playPowerfulKick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.18);
      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  // Original, lightweight stadium cues (no externally licensed media required).
  playCue(kind: 'select' | 'save' | 'countdown') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const frequencies = kind === 'select' ? [540, 810] : kind === 'save' ? [320, 240, 170] : [660, 880];
    frequencies.forEach((frequency, i) => {
      const oscillator = ctx.createOscillator();
      const volume = ctx.createGain();
      const start = now + i * (kind === 'save' ? 0.13 : 0.085);
      oscillator.type = kind === 'save' ? 'sawtooth' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      volume.gain.setValueAtTime(0.0001, start);
      volume.gain.exponentialRampToValueAtTime(kind === 'save' ? 0.065 : 0.09, start + 0.015);
      volume.gain.exponentialRampToValueAtTime(0.0001, start + 0.17);
      oscillator.connect(volume);
      volume.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.18);
    });
  }

  playWoodworkHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1150, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.35);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  playWhistle() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(2850, now);
      osc2.frequency.setValueAtTime(3120, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.38);
      osc2.stop(now + 0.38);
    } catch {}
  }

  playGoalCheer() {
    if (this.muted) return;
    this.init();
    if (this.goalCheerAudio) {
      try {
        this.goalCheerAudio.currentTime = 0;
        this.goalCheerAudio.volume = this.muted ? 0 : 0.95;
        this.goalCheerAudio.play().catch(() => {});
      } catch {}
    }
  }

  playDespairGasp() {
    if (this.muted) return;
    this.playWhistle();
  }

  playVictoryFanfare() {
    if (this.muted) return;
    this.init();
    if (this.goalCheerAudio) {
      try {
        this.goalCheerAudio.currentTime = 0;
        this.goalCheerAudio.volume = this.muted ? 0 : 0.95;
        this.goalCheerAudio.play().catch(() => {});
      } catch {}
    }
  }
}

// ========================================================
// 3. المكون الرئيسي: تحدي الأهداف (ركلات الترجيح)
// ========================================================
interface PenaltyShootoutProps {
  onBack?: () => void;
  onWin?: (xp: number) => void;
}

export const PenaltyShootout: React.FC<PenaltyShootoutProps> = ({ onBack, onWin }) => {
  const [screen, setScreen] = useState<'start' | 'match' | 'victory'>('start');
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [roundsResult, setRoundsResult] = useState<('goal' | 'miss')[]>([]);

  // Realistic match animation state
  const [shotPhase, setShotPhase] = useState<'idle' | 'runup' | 'kick' | 'goal' | 'miss'>('idle');
  const [diveSide, setDiveSide] = useState<'left' | 'right'>('left');
  const [lastShotResult, setLastShotResult] = useState<'goal' | 'miss' | null>(null);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Sound Engine
  const soundRef = useRef<PenaltySoundEngine>(new PenaltySoundEngine());
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const totalRounds = 5;
  const currentQuestion = QUESTIONS[currentRound % QUESTIONS.length];

  // Initialize and handle ambience on screen change
  useEffect(() => {
    soundRef.current.init();
    if (screen === 'match') {
      soundRef.current.startAmbience();
    } else {
      soundRef.current.stopAmbience();
    }
    return () => {
      soundRef.current.stopAmbience();
    };
  }, [screen]);

  // Handle Mute Toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundRef.current.setMuted(nextMuted);
  };

  // Start the match
  const handleStartGame = () => {
    soundRef.current.init();
    setCurrentRound(0);
    setScore(0);
    setRoundsResult([]);
    setShotPhase('idle');
    setLastShotResult(null);
    setScreen('match');
    soundRef.current.playWhistle();
    soundRef.current.playCue('countdown');
  };

  // User clicked an answer option - Instant reaction without delay!
  const handleAnswerChoice = (option: { letter: string; text: string; correct: boolean }) => {
    if (shotPhase !== 'idle' || lastShotResult !== null) return;

    soundRef.current.playCue('select');
    // Begin the run-up on selection; reserve the kick sound for ball contact.
    // The whistle is played at match start / between rounds, not on every click.

    // 2. انطلاق اللاعب نحو الكرة
    setShotPhase('runup');
    setDiveSide(Math.random() > 0.5 ? 'left' : 'right');

    // 3. A visible run-up gives the player time to anticipate the shot
    setTimeout(() => {
      setShotPhase('kick');
      soundRef.current.playPowerfulKick();

      // 4. Allow the ball to travel before revealing the outcome
      setTimeout(() => {
        if (option.correct) {
          // هدف في الشباك
          setShotPhase('goal');
          soundRef.current.playGoalCheer();
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 800);

          setScore(s => s + 1);
          setRoundsResult(prev => [...prev, 'goal']);
          setLastShotResult('goal');

          // الانتقال التلقائي للركلة التالية بعد ثانيتين
          setTimeout(() => {
            handleProceedNext(true);
          }, 2500);
        } else {
          // تصدي الحارس أو العارضة
          setShotPhase('miss');
          soundRef.current.playWoodworkHit();
          soundRef.current.playCue('save');

          setRoundsResult(prev => [...prev, 'miss']);
          setLastShotResult('miss');
        }
      }, 900);
    }, 850);
  };

  // Retry same question on miss
  const handleRetrySameQuestion = () => {
    setShotPhase('idle');
    setLastShotResult(null);
    setRoundsResult(prev => prev.slice(0, prev.length - 1));
  };

  // Proceed to next question or victory
  const handleProceedNext = (wasGoal?: boolean) => {
    setShotPhase('idle');
    setLastShotResult(null);

    const nextRoundIndex = currentRound + 1;
    if (nextRoundIndex < totalRounds) {
      setCurrentRound(nextRoundIndex);
      soundRef.current.playWhistle();
    } else {
      // Finished all 5 rounds
      setScreen('victory');
      soundRef.current.playVictoryFanfare();
      confetti({
        particleCount: 250,
        spread: 130,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#10b981', '#38bdf8', '#ffffff']
      });
      if (onWin) {
        onWin(score * 200);
      }
    }
  };

  // ========================================================
  // VIEW 1: شاشة البداية (Start Screen)
  // ========================================================
  if (screen === 'start') {
    return (
      <div className="relative w-full h-full min-h-[580px] rounded-3xl overflow-hidden flex flex-col justify-between items-center text-center p-6 md:p-12 select-none" dir="rtl">
        {/* The start screen is also live WebGL 3D, with no image backdrop. */}
        <PenaltyLive3D phase="idle" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-slate-950/30 pointer-events-none" />

        {/* Top Controls: Sound & Exit */}
        <div className="relative z-10 w-full flex items-center justify-between">
          <button
            onClick={toggleMute}
            className="p-3 rounded-2xl bg-black/40 border border-white/20 text-amber-400 hover:text-white transition-all shadow-lg cursor-pointer flex items-center gap-2 text-xs font-bold backdrop-blur-md"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span>{isMuted ? "الصوت مكتوم" : "صوت الملعب"}</span>
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="p-3 rounded-2xl bg-black/40 border border-white/20 text-slate-300 hover:text-white transition-all shadow-lg cursor-pointer backdrop-blur-md"
              title="خروج"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Center Title & Description */}
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-5 my-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-[0_0_50px_rgba(245,158,11,0.6)]">
            <Trophy size={42} />
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">
            تحدي الأهداف
          </h1>

          <p className="text-base md:text-xl text-slate-200 font-medium leading-relaxed max-w-xl">
            مسابقة ركلات الترجيح التفاعلية؛ أجب على الأسئلة اللغوية بدقة، وسدد الكرة في شباك الحارس لتحقيق الفوز بكأس البطولة!
          </p>

          {/* Start Button */}
          <button
            onClick={handleStartGame}
            className="mt-4 px-12 py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xl shadow-[0_0_40px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-3"
          >
            <Play size={24} className="fill-slate-950" />
            <span>اضغط هنا للبدء</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400 font-semibold">
          5 ركلات ترجيحية حاسمة • أجب بشكل صحيح لتسديد الكرة وهز الشباك ⚽
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 2: شاشة السؤال والتسديد الواقعية (Realistic Match Screen)
  // ========================================================
  if (screen === 'match') {
    return (
      <div className={`relative w-full h-full min-h-[640px] rounded-3xl overflow-hidden flex flex-col justify-between bg-slate-950 select-none transition-transform duration-150 ${screenShake ? 'scale-[1.018] translate-y-[-4px]' : ''}`} dir="rtl">

        {/* =====================================================
            A. THE REALISTIC FOOTBALL FIELD (خلفية الملعب والمرمى الواقعي)
        ===================================================== */}
        <PenaltyLive3D phase={shotPhase} diveSide={diveSide} />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#030a16]/40 via-transparent to-[#020e13]/65" aria-hidden="true" />

        {/* =====================================================
            B. TOP HUD & THE ORANGE QUESTION CARD ABOVE THE GOAL
            (الأسئلة فوق الشباك مباشرة أسفل عداد الأهداف دون أن تغطي على اللاعب)
        ===================================================== */}
        <div className="relative z-30 p-3 md:p-5 flex flex-col items-center gap-2 pointer-events-auto">

          {/* 1. Scoreboard Counter Bar */}
          <div className="w-full max-w-3xl flex items-center justify-between gap-3">
            {/* Sound Toggle */}
            <button
              onClick={toggleMute}
              className="p-2.5 rounded-2xl bg-slate-950/85 border border-white/20 text-amber-400 hover:text-white transition-all shadow-xl cursor-pointer backdrop-blur-md"
              title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Stadium scoreboard: interactive live match result, inspired by the supplied score-counter concept. */}
            <div className="relative flex min-w-0 items-center gap-2 sm:gap-4 rounded-xl border border-amber-300/60 bg-[#071620]/95 px-3 sm:px-5 py-2 shadow-[0_10px_30px_rgba(0,0,0,.65),inset_0_1px_0_rgba(255,255,255,.15)] backdrop-blur-xl" aria-live="polite" aria-label={`لوحة النتيجة: ${score} أهداف، الركلة ${currentRound + 1} من ${totalRounds}`}>
              <div className="flex flex-col items-center border-l border-white/15 pl-3 sm:pl-5">
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-amber-300">النتيجة</span>
                <div className="flex items-baseline gap-1.5 text-2xl sm:text-3xl font-black tabular-nums text-white drop-shadow-[0_0_12px_rgba(251,191,36,.45)]">
                  <span className="text-amber-300">{score}</span><span className="text-sm text-white/40">:</span><span>{totalRounds - score}</span>
                </div>
                <span className="text-[9px] text-slate-300">أهداف : غير مسجلة</span>
              </div>
              <div className="flex min-w-0 flex-col items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-black text-white">الركلة {currentRound + 1} / {totalRounds}</span>
                <div className="flex gap-1 sm:gap-1.5" dir="ltr">
                  {Array.from({ length: totalRounds }, (_, idx) => {
                    const result = roundsResult[idx];
                    return <span key={idx} className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border text-[10px] font-black ${result === 'goal' ? 'border-emerald-300 bg-emerald-600 text-white' : result === 'miss' ? 'border-rose-300 bg-rose-700 text-white' : idx === currentRound ? 'border-amber-300 bg-amber-300/20 text-amber-200 animate-pulse' : 'border-white/20 bg-slate-800 text-slate-400'}`}>{result === 'goal' ? '✓' : result === 'miss' ? '×' : idx + 1}</span>;
                  })}
                </div>
              </div>
            </div>

            {/* Exit Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="p-2.5 rounded-2xl bg-slate-950/85 border border-white/20 text-slate-300 hover:text-white transition-all shadow-xl cursor-pointer backdrop-blur-md"
                title="خروج"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* 2. The Orange Question Card: Right below the counter, above the goal net! */}
          <div className="w-full max-w-2xl bg-gradient-to-r from-[#152a32]/95 via-[#1d3640]/95 to-[#152a32]/95 border border-amber-300/60 rounded-2xl px-5 py-3 text-center shadow-[0_12px_35px_rgba(0,0,0,0.55)] backdrop-blur-md">
            <div className="text-[10px] md:text-xs font-black text-amber-100 uppercase tracking-widest mb-0.5 opacity-90">
              {currentQuestion.category}
            </div>
            <h2 className="text-base md:text-xl font-black text-white leading-snug drop-shadow">
              {currentQuestion.prompt}
            </h2>
          </div>

        </div>

        {/* =====================================================
            C. BOTTOM: GOAL/MISS NOTIFICATION OR 3 ANSWER BUTTONS
        ===================================================== */}
        <div className="relative z-30 p-4 md:p-6 flex flex-col items-center gap-3 max-w-3xl mx-auto w-full pointer-events-auto">

          {/* Cinematic goal callout appears after the ball reaches the net. */}
          {/* Goal Notification */}
          {lastShotResult === 'goal' && (
            <div className="w-full bg-emerald-600/95 border-2 border-emerald-300 rounded-2xl py-3 px-5 text-center shadow-[0_0_50px_rgba(16,185,129,0.7)] backdrop-blur-xl animate-bounce">
              <div className="text-2xl md:text-3xl font-black text-white drop-shadow">
                ⚽ هــــــــــــدف رائع!
              </div>
              <p className="text-xs text-emerald-100 font-bold">
                تسديدة قوية لا تصد ولا ترد في شباك الحارس!
              </p>
            </div>
          )}

          {/* Miss Notification */}
          {lastShotResult === 'miss' && (
            <div className="w-full bg-slate-950/95 border-2 border-rose-500 rounded-2xl p-4 text-center shadow-[0_0_50px_rgba(244,63,94,0.6)] backdrop-blur-xl">
              <div className="text-xl md:text-2xl font-black text-rose-400 mb-1">
                🧤 تصدى لها الحارس! تسديدة ضائعة
              </div>
              <p className="text-xs text-slate-300 font-medium mb-3">
                {currentQuestion.explanation}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRetrySameQuestion}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs md:text-sm shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw size={15} />
                  <span>المحاولة مجدداً</span>
                </button>
                <button
                  onClick={() => handleProceedNext(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs md:text-sm border border-white/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>الركلة التالية</span>
                  <ArrowLeft size={15} />
                </button>
              </div>
            </div>
          )}

          {/* 3 Interactive Answer Choice Buttons (Only when not showing miss dialog) */}
          {lastShotResult === null && (
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentQuestion.answers.map((opt, idx) => (
                <button
                  key={idx}
                  disabled={shotPhase !== 'idle'}
                  onClick={() => handleAnswerChoice(opt)}
                  className={`group relative py-3.5 px-4 rounded-2xl border-2 transition-all duration-150 text-right cursor-pointer flex items-center justify-between shadow-xl ${
                    shotPhase !== 'idle'
                      ? 'opacity-40 cursor-not-allowed border-white/10 bg-slate-900/80 text-slate-400'
                      : 'bg-slate-950/90 border-white/20 hover:border-amber-400 hover:bg-slate-900 hover:scale-[1.02] active:scale-95 text-white hover:text-amber-200'
                  }`}
                >
                  <span className="text-sm md:text-base font-black truncate">
                    {opt.text}
                  </span>
                  <span className="w-7 h-7 rounded-xl bg-white/10 border border-white/20 text-xs font-black text-amber-400 flex items-center justify-center shrink-0 mr-2 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                    {opt.letter}
                  </span>
                </button>
              ))}
            </div>
          )}

        </div>

      </div>
    );
  }

  // ========================================================
  // VIEW 3: شاشة الفوز والتكريم (Victory Screen)
  // ========================================================
  return (
    <div className="relative w-full h-full min-h-[580px] rounded-3xl overflow-hidden flex flex-col justify-center items-center text-center p-6 md:p-12 select-none animate-fade-in" dir="rtl">
      {/* Full 3D scene remains active on the result screen. */}
      <PenaltyLive3D phase="idle" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/95 via-slate-950/65 to-slate-950/55" />

      <div className="relative z-10 max-w-lg w-full bg-slate-950/90 border-2 border-amber-400/80 rounded-3xl p-8 shadow-[0_0_80px_rgba(245,158,11,0.5)] backdrop-blur-2xl flex flex-col items-center">

        {/* Giant Golden Trophy */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-500 flex items-center justify-center text-slate-950 shadow-[0_0_50px_#f59e0b] mb-3 animate-bounce">
          <Trophy size={52} />
        </div>

        {/* 5 Golden Stars */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={28}
              className="text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse"
              style={{ animationDelay: `${s * 150}ms` }}
            />
          ))}
        </div>

        {/* The Exact Celebration Ribbon Requested by User */}
        <div className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-slate-950 font-black text-2xl md:text-3xl shadow-[0_0_40px_rgba(245,158,11,0.8)] border-2 border-white mb-4">
          أحسنت يا بطل! 🏆
        </div>

        {/* Score Summary */}
        <p className="text-base text-slate-200 font-semibold mb-6">
          نجحت في تسجيل <span className="text-emerald-400 font-black text-xl">{score}</span> أهداف من أصل <span className="text-white font-bold">{totalRounds}</span> ركلات ترجيحية!
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={handleStartGame}
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            <span>العب مجدداً</span>
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-base border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>العودة للمنصة</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
