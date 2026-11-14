import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, Shirt, Volume2, VolumeX, RotateCcw,
  ArrowLeft, X
} from 'lucide-react';

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

import {PenaltyEliteSetup} from './PenaltyEliteSetup';
import {PenaltyClubCrest} from './PenaltyClubCrest';
import {EliteClub, ElitePlayer, chooseNextShooter} from './PenaltyEliteData';
import {shootoutResult} from './penalty-elite-rules.mjs';

interface PenaltyShootoutProps {
  onBack?: () => void;
  onWin?: (xp: number) => void;
}
type ShotPhase = 'idle'|'focus'|'runup'|'kick'|'goal'|'miss';
type TeamSide = 'home'|'away';
type MatchState = {home:EliteClub;away:EliteClub;kickers:ElitePlayer[]};
type TurnStatus = 'question'|'running'|'goal'|'miss'|'opponent';
const outStyle='rounded-2xl border border-white/20 bg-[#071722]/90 backdrop-blur-xl shadow-2xl';

export const PenaltyShootout:React.FC<PenaltyShootoutProps>=({onBack,onWin})=>{
  const [screen,setScreen]=useState<'setup'|'match'|'victory'>('setup');
  const [match,setMatch]=useState<MatchState|null>(null);
  const [round,setRound]=useState(0);
  const [homeShots,setHomeShots]=useState<boolean[]>([]);
  const [awayShots,setAwayShots]=useState<boolean[]>([]);
  const [side,setSide]=useState<TeamSide>('home');
  const [phase,setPhase]=useState<ShotPhase>('idle');
  const [status,setStatus]=useState<TurnStatus>('question');
  const [winner,setWinner]=useState<'home'|'away'|null>(null);
  const [rivalScored,setRivalScored]=useState<boolean|null>(null);
  const [diveSide,setDiveSide]=useState<'left'|'right'>('left');
  const [isMuted,setIsMuted]=useState(false);
  const [screenShake,setScreenShake]=useState(false);
  const [aimX,setAimX]=useState(0);
  const [aimY,setAimY]=useState(0.65);
  const [shotPower,setShotPower]=useState(0.75);
  const [shotScored,setShotScored]=useState(true);
  useEffect(()=>{
    // Begin downloading the athlete before the player enters the stadium.
    const href='/penalty-models/player.glb';
    if(!document.querySelector('link[data-penalty-athlete]')){
      const link=document.createElement('link');link.rel='preload';link.as='fetch';link.crossOrigin='anonymous';link.href=href;
      link.dataset.penaltyAthlete='true';document.head.appendChild(link);
    }
    void import(/* @vite-ignore */ '/penalty-3d-engine.js').catch(()=>{});
  },[]);
  const [stadiumReady,setStadiumReady]=useState(false);
  const soundRef=useRef<PenaltySoundEngine>(new PenaltySoundEngine());
  const timersRef=useRef<ReturnType<typeof setTimeout>[]>([]);
  const later=(fn:()=>void,delay:number)=>{
    const timer=setTimeout(fn,delay);timersRef.current.push(timer);return timer;
  };
  const cancelTimeline=()=>{
    for(const timer of timersRef.current)clearTimeout(timer);
    timersRef.current=[];
  };
  useEffect(()=>{
    if(screen==='match'&&stadiumReady)soundRef.current.startAmbience();
    else soundRef.current.stopAmbience();
    return ()=>{soundRef.current.stopAmbience();};
  },[screen,stadiumReady]);
  useEffect(()=>()=>{cancelTimeline();soundRef.current.stopAmbience();},[]);
  const toggleSound=()=>{
    setIsMuted(prev=>{soundRef.current.setMuted(!prev);return !prev;});
  };
  const start=(home:EliteClub,away:EliteClub,kickers:ElitePlayer[])=>{
    cancelTimeline();soundRef.current.init();
    setMatch({home,away,kickers});setHomeShots([]);setAwayShots([]);
    setWinner(null);setRound(0);setSide('home');setRivalScored(null);
    setAimX(0);setAimY(0.65);setShotPower(0.75);setShotScored(true);
    setStadiumReady(false);
    setPhase('focus');setStatus('question');setScreen('match');
  };
  const finish=(outcome:'home'|'away',home:boolean[])=>{
    cancelTimeline();setWinner(outcome);setScreen('victory');
    soundRef.current.stopAmbience();
    if(outcome==='home'){
      soundRef.current.playVictoryFanfare();
      confetti({particleCount:200,spread:110,origin:{y:0.5},colors:['#e6be6b','#eaf0f2','#40d2a7']});
      onWin?.(home.filter(Boolean).length*200);
    } else soundRef.current.playDespairGasp();
  };
  const rivalShot=(home:boolean[],away:boolean[])=>{
    setSide('away');setStatus('opponent');setPhase('idle');setRivalScored(null);
    const scored=Math.random()<0.66;
    setShotScored(scored);
    setDiveSide(Math.random()<0.5?'left':'right');
    setAimX((Math.random()-.5)*1.65);setAimY(0.35+Math.random()*.5);setShotPower(0.55+Math.random()*.4);
    later(()=>setPhase('focus'),80);
    later(()=>setPhase('runup'),850);
    later(()=>{setPhase('kick');soundRef.current.playPowerfulKick();},1950);
    later(()=>{
      setPhase(scored?'goal':'miss');setRivalScored(scored);
      setAwayShots([...away,scored]);
      if(scored)soundRef.current.playGoalCheer();
      else soundRef.current.playCue('save');
    },2900);
    later(()=>{
      const nextAway=[...away,scored];
      const outcome=shootoutResult(home,nextAway);
      if(outcome){finish(outcome,home);return;}
      setRound(home.length);setSide('home');setStatus('question');
      setPhase('idle');
      later(()=>setPhase('focus'),85);
      soundRef.current.playWhistle();
    },4900);
  };
  const answer=(choice:{letter:string;text:string;correct:boolean})=>{
    if(screen!=='match'||side!=='home'||status!=='question'||phase!=='focus')return;
    soundRef.current.playCue('select');
    setShotScored(choice.correct);
    setStatus('running');setPhase('runup');
    setDiveSide(aimX>=0?'left':'right');
    later(()=>{setPhase('kick');soundRef.current.playPowerfulKick();},1100);
    later(()=>{
      setPhase(choice.correct?'goal':'miss');setStatus(choice.correct?'goal':'miss');
      setHomeShots([...homeShots,choice.correct]);
      if(choice.correct){
        soundRef.current.playGoalCheer();setScreenShake(true);
        later(()=>setScreenShake(false),400);
      }else{soundRef.current.playWoodworkHit();soundRef.current.playCue('save');}
    },2100);
    later(()=>{
      const nextHome=[...homeShots,choice.correct];
      const outcome=shootoutResult(nextHome,awayShots);
      if(outcome){finish(outcome,nextHome);return;}
      rivalShot(nextHome,awayShots);
    },4100);
  };
  if(screen==='setup')return <PenaltyEliteSetup onBack={onBack} onStart={start}/>;
  if(!match)return null;
  const shooter=side==='home'
    ?chooseNextShooter(match.home,match.kickers,round)
    :[...match.away.players.filter(p=>p.role!=='GK'),...match.away.players.filter(p=>p.role==='GK')][awayShots.length%11];
  const attackingClub=side==='home'?match.home:match.away;
  const defendingClub=side==='home'?match.away:match.home;
  const goalkeeper=defendingClub.players.find(p=>p.role==='GK');
  const goalieColors=defendingClub.id==='madrid'||defendingClub.id==='juventus'
    ?{primary:'#86b34f',secondary:'#172b22'}
    :defendingClub.id==='city'||defendingClub.id==='chelsea'
      ?{primary:'#e9a448',secondary:'#253146'}
      :{primary:'#a7d959',secondary:'#13232c'};
  // The shirt's secondary colour is not necessarily the shorts colour.
  // Classic football strip combinations are modelled separately from the logo palette.
  const shortsByClub:Record<string,string>={
    madrid:'#f1f1ee',barcelona:'#1b3164',city:'#f4f4f0',liverpool:'#bd1f34',
    psg:'#182b58',chelsea:'#1851bd',arsenal:'#f1f1ed',juventus:'#f7f6f4',
    bayern:'#ce2231',united:'#f4f4f0'
  };
  const stadiumKit={
    shooterClubId:attackingClub.id,
    keeperClubId:defendingClub.id,
    shooterPrimary:attackingClub.primary,
    shooterSecondary:shortsByClub[attackingClub.id]||attackingClub.secondary,
    shooterAccent:attackingClub.accent,
    shooterNumber:shooter?.number||9,
    shooterName:shooter?.name||'',
    keeperPrimary:goalieColors.primary,
    keeperSecondary:goalieColors.secondary,
    keeperAccent:'#f5f4ec',
    keeperNumber:goalkeeper?.number||1,
    keeperName:goalkeeper?.name||''
  };
  const currentQuestion=QUESTIONS[round%QUESTIONS.length];
  const homeScore=homeShots.filter(Boolean).length;
  const awayScore=awayShots.filter(Boolean).length;
  const suddenDeath=round>=5;
  const progress=(shots:boolean[],club:EliteClub)=>(
    <div className="flex flex-col items-center gap-1 min-w-0">
      <div className="flex items-center justify-center gap-1.5 min-w-0"><PenaltyClubCrest club={club} className="w-7 h-7 md:w-9 md:h-9 rounded-xl"/><span className="text-[9px] md:text-xs text-slate-200 font-black truncate max-w-[76px] md:max-w-[126px]">{club.name}</span></div>
      <div className="flex gap-1" dir="ltr">
        {Array.from({length:5},(_,i)=><span key={i}
          className={'w-4 h-4 md:w-5 md:h-5 rounded-full border flex items-center justify-center text-[9px] font-black '
          +(shots[i]===true?'bg-emerald-500 border-emerald-300 text-emerald-950':shots[i]===false?'bg-rose-600 border-rose-400 text-white':'border-white/25 bg-white/10 text-slate-500')}>
          {shots[i]===true?'✓':shots[i]===false?'×':i+1}
        </span>)}
      </div>
    </div>
  );
  if(screen==='victory'){
    const isWinner=winner==='home';
    return <div dir="rtl" className="relative w-full h-full min-h-0 rounded-xl sm:rounded-3xl bg-slate-950 overflow-y-auto flex flex-col justify-center items-center p-5">
      <PenaltyLive3D phase="idle" kitColor={match.home.primary}/>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#031220]/95 via-[#031220]/80 to-[#031220]/30"/>
      <div className={'relative z-10 w-full max-w-lg text-center rounded-3xl border p-6 md:p-10 '+(isWinner?'border-amber-300/50 bg-[#122c31]/90':'border-slate-500/40 bg-[#0a1d2c]/90')}>
        <Trophy size={54} className={'mx-auto '+(isWinner?'text-amber-300':'text-slate-300')}/>
        <p className="mt-3 text-xs font-black tracking-widest text-amber-300" dir="ltr">QUL PENALTY ELITE</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-black text-white">{isWinner?'أبطال ركلات الترجيح!':'مباراة قوية، فرصة أخرى تنتظرك'}</h2>
        <div className="mt-7 flex items-center justify-between gap-3">
          <span className="flex flex-col items-center gap-2 text-white font-black text-xs md:text-sm"><PenaltyClubCrest club={match.home} className="w-12 h-12 md:w-16 md:h-16"/>{match.home.name}</span>
          <strong dir="ltr" className="text-3xl md:text-5xl text-amber-200 font-black tabular-nums">{homeScore} : {awayScore}</strong>
          <span className="flex flex-col items-center gap-2 text-white font-black text-xs md:text-sm"><PenaltyClubCrest club={match.away} className="w-12 h-12 md:w-16 md:h-16"/>{match.away.name}</span>
        </div>
        <p className="mt-5 text-slate-300 text-sm">أجبت عن {homeScore} أسئلة إجابة صحيحة من {homeShots.length} ركلات.</p>
        <p className="mt-1 text-slate-400 text-xs">{suddenDeath?'حُسم اللقاء بعد ركلات إضافية':'حُسم اللقاء وفق نظام ركلات الترجيح'}</p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <button type="button" onClick={()=>start(match.home,match.away,match.kickers)} className="rounded-xl bg-amber-300 text-slate-950 font-black p-3 flex items-center justify-center gap-2"><RotateCcw size={17}/> إعادة المباراة</button>
          <button type="button" onClick={()=>{cancelTimeline();setScreen('setup');}} className="rounded-xl bg-white/10 border border-white/20 text-white font-black p-3 flex items-center justify-center gap-2"><ArrowLeft size={17}/> تغيير الفريق</button>
        </div>
      </div>
    </div>;
  }
  return <main dir="rtl" className={'relative w-full h-full min-h-0 rounded-xl sm:rounded-3xl overflow-x-hidden overflow-y-auto overscroll-contain flex flex-col justify-between bg-[#07131f] text-white '+(screenShake?'scale-[1.008]':'')}>
    <PenaltyLive3D phase={phase} diveSide={diveSide} kitColor={attackingClub.primary} kit={stadiumKit} aimX={aimX} aimY={aimY} shotPower={shotPower} scored={shotScored} onStageReady={()=>setStadiumReady(true)}/>
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020b18]/35 via-transparent to-[#051720]/60"/>
    <header className="relative z-20 p-2 sm:p-3 md:p-4 w-full flex flex-col gap-2 items-center shrink-0 pointer-events-none [&_button]:pointer-events-auto">
      <div className="flex items-center justify-between gap-2 w-full max-w-5xl">
        <button type="button" onClick={toggleSound} title={isMuted?'تشغيل الصوت':'كتم الصوت'} className={'p-2.5 text-amber-300 '+outStyle}>
          {isMuted?<VolumeX size={19}/>:<Volume2 size={19}/>}
        </button>
        <div className={'flex items-center gap-2 md:gap-5 px-3 py-2.5 '+outStyle} aria-label={'النتيجة '+homeScore+' مقابل '+awayScore}>
          {progress(homeShots,match.home)}
          <div className="flex flex-col items-center">
            <strong className="text-2xl md:text-4xl font-black text-white tabular-nums" dir="ltr">{homeScore} : {awayScore}</strong>
            <span className="text-[10px] text-amber-300 font-black">{suddenDeath?'الركلات الحاسمة':'ركلات الترجيح'}</span>
          </div>
          {progress(awayShots,match.away)}
        </div>
        <button type="button" onClick={()=>{cancelTimeline();setScreen('setup');}} title="إنهاء المباراة" className={'p-2.5 text-slate-300 '+outStyle}><X size={19}/></button>
      </div>
      <div className="flex items-center justify-between max-w-2xl w-full gap-3 rounded-xl border border-amber-300/30 bg-[#061b27]/90 px-3 py-2 shadow-lg">
        <span className="text-xs text-amber-200 font-black">ركلة {round+1}</span>
        <div className="flex items-center gap-2 min-w-0">
          <PenaltyClubCrest club={side==='home'?match.home:match.away} className="w-8 h-8 rounded-xl" />
          <strong dir="ltr" className="text-white text-sm truncate">{shooter?.name || 'Penalty kicker'}</strong>
          <span className="bg-white/10 rounded-lg px-2 py-0.5 text-xs font-black">#{shooter?.number || 9}</span>
        </div>
        <span className="text-xs text-slate-300">{side==='home'?'فريقك':'الكمبيوتر'}</span>
      </div>
      {status==='question'&&<div className="max-w-2xl w-full rounded-2xl border border-amber-300/45 bg-[#092332]/95 px-4 py-3 md:py-4 text-center shadow-xl backdrop-blur-md">
        <p className="text-[10px] font-black text-amber-300">{currentQuestion.category}</p>
        <h2 className="mt-1 font-black text-base md:text-xl text-white leading-relaxed">{currentQuestion.prompt}</h2>
      </div>}
    </header>
    <div className="relative z-20 w-full md:w-[min(405px,34vw)] md:mr-5 lg:mr-9 md:ml-auto px-2 sm:px-3 md:px-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-5 flex flex-col items-center gap-2 shrink-0">
      {status==='question'&&side==='home'&&<div className="w-full rounded-2xl border border-amber-300/35 bg-[#061824]/88 px-3 py-2.5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 mb-2"><strong className="text-xs sm:text-sm text-amber-200">وجّه الكرة وحدد قوة التصويب</strong><span className="text-[10px] text-slate-300">المكان والقوة من اختيارك</span></div>
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 items-center">
          <div role="group" aria-label="مكان التصويب" className="relative w-full sm:w-48 md:w-full h-[76px] sm:h-[92px] md:h-[72px] shrink-0 rounded-t-[45%] border-[3px] border-white/75 bg-gradient-to-b from-[#194837] to-[#0a2a22] shadow-[inset_0_0_25px_rgba(0,0,0,.7)] touch-none"
            onPointerDown={event=>{const rect=event.currentTarget.getBoundingClientRect();setAimX(Math.max(-1,Math.min(1,((event.clientX-rect.left)/rect.width)*2-1)));setAimY(Math.max(0,Math.min(1,1-(event.clientY-rect.top)/rect.height)));}}
            onPointerMove={event=>{if(event.buttons!==1)return;const rect=event.currentTarget.getBoundingClientRect();setAimX(Math.max(-1,Math.min(1,((event.clientX-rect.left)/rect.width)*2-1)));setAimY(Math.max(0,Math.min(1,1-(event.clientY-rect.top)/rect.height)));}}>
            <div className="absolute inset-x-0 top-1/3 border-t border-white/20"/>
            <div className="absolute inset-y-0 left-1/3 border-l border-white/20"/>
            <div className="absolute inset-y-0 right-1/3 border-r border-white/20"/>
            <span className="absolute h-5 w-5 rounded-full border-2 border-white bg-amber-400 shadow-[0_0_18px_#fbbf24] -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{left:(aimX+1)*50+'%',top:(1-aimY)*100+'%'}}/>
          </div>
          <div className="flex-1 w-full min-w-0">
            <div className="flex justify-between text-xs text-slate-200 mb-2"><label htmlFor="qul-penalty-power">قوة الركلة</label><strong dir="ltr" className="text-amber-300">{Math.round(shotPower*100)}%</strong></div>
            <input id="qul-penalty-power" type="range" min="25" max="100" step="5" value={Math.round(shotPower*100)} onChange={event=>setShotPower(Number(event.target.value)/100)} className="w-full accent-amber-400 cursor-pointer min-h-10" aria-label="قوة التصويب"/>
            <p className="text-[10px] text-slate-400">المس أو اسحب المؤشر داخل المرمى، ثم اختر الإجابة لتسدد</p>
          </div>
        </div>
      </div>}
      {status==='question'&&<div className="w-full grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2">
        {currentQuestion.answers.map((option,index)=><button type="button" key={index} onClick={()=>answer(option)}
          className="flex justify-between items-center gap-2 py-2.5 md:py-2 px-4 rounded-xl bg-[#071f2c]/95 border border-white/30 text-white hover:border-amber-300 hover:bg-[#193947] shadow-xl text-sm font-black transition-colors">
          <span className="text-right">{option.text}</span><span className="w-7 h-7 rounded-lg bg-amber-300/15 text-amber-300 border border-amber-300/30 grid place-items-center">{option.letter}</span>
        </button>)}
      </div>}
      {status==='running'&&<div className={'p-4 md:px-8 text-center '+outStyle}>
        <span className="text-amber-200 font-black text-base">لحظة الحسم... {shooter?.name} يتقدم نحو الكرة</span>
      </div>}
      {status==='opponent'&&<div className={'px-6 py-4 text-center '+outStyle}>
        <p className="text-amber-200 font-black">دور {match.away.name}</p>
        <p className="text-slate-300 text-xs mt-1">{rivalScored===null?'الحارس يستعد للركلة...':rivalScored?'سجل الخصم هدفًا':'أضاع الخصم الركلة!'}</p>
      </div>}
      {(status==='goal'||status==='miss')&&<div role="status" className={'w-full max-w-xl p-4 text-center border-2 '+outStyle} style={{borderColor:status==='goal'?'#3bc594':'#da6d79'}}>
        <h3 className={'text-xl md:text-3xl font-black '+(status==='goal'?'text-emerald-300':'text-rose-300')}>{status==='goal'?'هدف رائع!':'الكرة لم تدخل المرمى'}</h3>
        {status==='miss'&&<p className="text-sm text-slate-300 mt-2">{currentQuestion.explanation}</p>}
        <p className="text-xs text-slate-400 mt-1">تستمر ركلات الترجيح تلقائيًا</p>
      </div>}
    </div>
  </main>;
};
