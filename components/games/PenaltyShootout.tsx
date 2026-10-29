import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, Star, Volume2, VolumeX, RotateCcw,
  ArrowLeft, X, Play, ArrowRight
} from 'lucide-react';

// Realistic High-Fidelity Assets
import stadiumPanorama from '/src/assets/images/champions_stadium_panorama_1790675976521.jpg';
import trophyCelebrationTeam from '/src/assets/images/trophy_celebration_team_1790692147994.jpg';
import strikerBackImg from '/src/assets/images/striker_back_kick_1792467094797.jpg';
import goalkeeperReadyImg from '/src/assets/images/goalkeeper_ready_1792467075804.jpg';
import goalkeeperDivingImg from '/src/assets/images/goalkeeper_diving_1792467117800.jpg';
import championsBallTexture from '/src/assets/images/champions_ball_texture_1790676004465.jpg';

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
  const [diveSide, setDiveSide] = useState<'left' | 'right'>('right');
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
  };

  // User clicked an answer option - Instant reaction without delay!
  const handleAnswerChoice = (option: { letter: string; text: string; correct: boolean }) => {
    if (shotPhase !== 'idle' || lastShotResult !== null) return;

    // Begin the run-up on selection; reserve the kick sound for ball contact.
    // The whistle is played at match start / between rounds, not on every click.

    // 2. انطلاق اللاعب نحو الكرة
    setShotPhase('runup');
    const randomDive = Math.random() > 0.5 ? 'left' : 'right';
    setDiveSide(randomDive);

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
          soundRef.current.playDespairGasp();

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
        {/* Background Stadium Panorama */}
        <div className="absolute inset-0 z-0">
          <img
            src={stadiumPanorama}
            alt="Stadium Atmosphere"
            className="w-full h-full object-cover filter brightness-[0.45]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/80" />
        </div>

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
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Panoramic Stadium Background */}
          <img
            src={stadiumPanorama}
            alt="Stadium Field"
            className="w-full h-full object-cover object-center filter brightness-[0.68] saturate-[1.15]"
          />

          {/* Stadium Floodlights & Green Pitch Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-transparent to-slate-950/75" />

          {/* The Goal Structure (إطار المرمى والشباك الواقعية في المنتصف) */}
          <div className="absolute top-[28%] md:top-[26%] left-1/2 -translate-x-1/2 w-[82%] max-w-2xl h-44 md:h-52 border-x-[7px] border-t-[7px] border-white rounded-t-lg bg-white/[0.025] shadow-[0_15px_45px_rgba(0,0,0,0.75),0_0_16px_rgba(255,255,255,0.22)] flex items-end justify-center">

            {/* Real Goal Net Mesh Grid */}
            <div className={`absolute inset-0 border-b-2 border-white/40 bg-[linear-gradient(90deg,transparent_95%,rgba(255,255,255,.18)_96%),linear-gradient(0deg,transparent_94%,rgba(255,255,255,.18)_95%)] [background-size:21px_18px] transition-all duration-300 ${
              shotPhase === 'goal' ? 'scale-105 bg-white/[0.12] shadow-[inset_0_0_40px_rgba(16,185,129,0.5)]' : ''
            }`} />

            {/* REALISTIC ATHLETIC GOALKEEPER (حارس المرمى الواقعي) */}
            <div className={`relative z-10 w-28 h-36 md:w-36 md:h-44 transition-all duration-300 ${
              shotPhase === 'runup' || shotPhase === 'idle'
                ? 'translate-x-0 translate-y-0 animate-pulse'
                : shotPhase === 'goal'
                  ? diveSide === 'left' ? 'translate-x-[110px] translate-y-6 rotate-45 opacity-90' : '-translate-x-[110px] translate-y-6 -rotate-45 opacity-90'
                  : diveSide === 'left' ? '-translate-x-[80px] translate-y-2 -rotate-25 scale-105' : 'translate-x-[80px] translate-y-2 rotate-25 scale-105'
            }`}>
              <img
                src={shotPhase === 'goal' || shotPhase === 'miss' ? goalkeeperDivingImg : goalkeeperReadyImg}
                alt="Goalkeeper"
                className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]"
              />
            </div>
          </div>

          {/* Pitch White Lines (نقطة الجزاء وقوس منطقة الجزاء) */}
          <div className="absolute bottom-[24%] left-1/2 -translate-x-1/2 w-48 h-24 border-t-2 border-white/40 rounded-t-full pointer-events-none" />
          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_15px_#ffffff] pointer-events-none" />

          {/* THE OFFICIAL CHAMPIONS BALL (كرة القدم الواقعية) */}
          <div className={`absolute z-10 w-11 h-11 md:w-14 md:h-14 rounded-full overflow-hidden shadow-2xl transition-all duration-500 ease-out ${
            shotPhase === 'idle'
              ? 'bottom-[20%] left-1/2 -translate-x-1/2 scale-100 rotate-0'
              : shotPhase === 'runup'
                ? 'bottom-[20%] left-1/2 -translate-x-1/2 scale-100'
                : shotPhase === 'kick'
                  ? 'bottom-[34%] left-1/2 -translate-x-1/2 scale-75 rotate-180'
                  : shotPhase === 'goal'
                    ? diveSide === 'left'
                      ? 'top-[31%] left-[26%] scale-[0.38] rotate-[720deg]'
                      : 'top-[31%] left-[72%] scale-[0.38] rotate-[720deg]'
                    : 'top-[33%] left-1/2 -translate-x-1/2 scale-[0.4] rotate-[540deg] translate-y-2'
          }`}>
            <img src={championsBallTexture} alt="Ball" className="w-full h-full object-cover animate-spin-slow" />
          </div>

          {/* REALISTIC STRIKER FROM BEHIND (المسدد الرياضي - ظهره للمشاهد) */}
          <div className={`absolute z-20 bottom-0 left-1/2 -translate-x-1/2 w-48 h-56 md:w-60 md:h-72 transition-all duration-700 ease-out ${
            shotPhase === 'idle'
              ? 'translate-y-0 scale-100'
              : shotPhase === 'runup'
                ? 'translate-y-[-24px] scale-105'
                : shotPhase === 'kick' || shotPhase === 'goal'
                  ? 'translate-y-[-38px] scale-110'
                  : 'translate-y-[-10px] scale-95 opacity-80'
          }`}>
            <img 
              src={strikerBackImg}
              alt="Striker"
              className="w-full h-full object-contain object-bottom filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]"
            />
          </div>

        </div>

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
      {/* Background Celebration Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={trophyCelebrationTeam}
          alt="Podium Ceremony"
          className="w-full h-full object-cover filter brightness-[0.4]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/80" />
      </div>

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
