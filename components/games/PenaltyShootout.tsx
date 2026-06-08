import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Play, 
  RotateCcw, 
  Shield, 
  User, 
  ChevronRight,
  Flag,
  Volume2,
  VolumeX,
  Settings,
  LayoutList
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Constants & Types ---

type GameState = 'start' | 'team-select' | 'playing' | 'game-over';
type Turn = 'shooting' | 'goalkeeping';
type ShotResult = 'goal' | 'save' | 'miss' | 'post';

interface Team {
  id: string;
  name: string;
  flag: string;
  color: string;
  jersey: string;
}

const TEAMS: Team[] = [
  { id: 'bra', name: 'البرازيل', flag: '🇧🇷', color: 'bg-yellow-400', jersey: 'from-yellow-400 to-green-600' },
  { id: 'arg', name: 'الأرجنتين', flag: '🇦🇷', color: 'bg-blue-300', jersey: 'from-blue-300 to-white' },
  { id: 'fra', name: 'فرنسا', flag: '🇫🇷', color: 'bg-blue-800', jersey: 'from-blue-800 to-red-600' },
  { id: 'ger', name: 'ألمانيا', flag: '🇩🇪', color: 'bg-white', jersey: 'from-white to-black' },
  { id: 'spa', name: 'إسبانيا', flag: '🇪🇸', color: 'bg-red-600', jersey: 'from-red-600 to-yellow-500' },
  { id: 'ita', name: 'إيطاليا', flag: '🇮🇹', color: 'bg-blue-700', jersey: 'from-blue-700 to-white' },
  { id: 'eng', name: 'إنجلترا', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: 'bg-white', jersey: 'from-white to-red-600' },
  { id: 'por', name: 'البرتغال', flag: '🇵🇹', color: 'bg-red-700', jersey: 'from-red-700 to-green-700' },
];

const GRID_SIZE = { width: 600, height: 400 };
const GOAL_SIZE = { width: 300, height: 150 };

// --- Sound System ---

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3;
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.3;
    }
  }

  playKick() {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playWhistle() {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playGoal() {
    if (!this.ctx || this.muted) return;
    // Simple crowd cheer noise
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    noise.start();
  }

  playSave() {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }
}

const sounds = new SoundManager();

// --- Main Component ---

export function PenaltyShootout({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState] = useState<GameState>('start');
  const [turn, setTurn] = useState<Turn>('shooting');
  const [playerTeam, setPlayerTeam] = useState<Team | null>(null);
  const [opponentTeam, setOpponentTeam] = useState<Team | null>(null);
  const [score, setScore] = useState({ player: 0, opponent: 0 });
  const [rounds, setRounds] = useState<{ player: ShotResult | null, opponent: ShotResult | null }[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Shooting state
  const [isAiming, setIsAiming] = useState(false);
  const [aimPos, setAimPos] = useState({ x: 0, y: 0 });
  const [power, setPower] = useState(0);
  const [isShooting, setIsShooting] = useState(false);
  const [ballPos, setBallPos] = useState({ x: 0, y: 0, z: 0, scale: 1 });
  const [shotResult, setShotResult] = useState<ShotResult | null>(null);
  
  // Goalkeeping state
  const [keeperDive, setKeeperDive] = useState<{ x: number, y: number } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showResultText, setShowResultText] = useState<string | null>(null);

  const powerInterval = useRef<number | null>(null);

  // --- Initialization ---

  useEffect(() => {
    if (gameState === 'playing' && rounds.length === 0) {
      const initialRounds = Array.from({ length: 5 }, () => ({ player: null, opponent: null }));
      setRounds(initialRounds);
      sounds.playWhistle();
    }
  }, [gameState]);

  // --- Game Logic ---

  const handleTeamSelect = (team: Team) => {
    setPlayerTeam(team);
    const others = TEAMS.filter(t => t.id !== team.id);
    setOpponentTeam(others[Math.floor(Math.random() * others.length)]);
    setGameState('playing');
  };

  const startAiming = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing' || turn !== 'shooting' || isShooting) return;
    setIsAiming(true);
    setPower(0);
    
    powerInterval.current = window.setInterval(() => {
      setPower(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 20);
  };

  const updateAim = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isAiming) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const y = ((clientY - rect.top) / rect.height) * 2 - 1; // -1 to 1
    
    // Clamp values to stay within reasonable bounds
    setAimPos({ 
      x: Math.max(-1, Math.min(1, x)), 
      y: Math.max(-1, Math.min(1, y)) 
    });
  };

  const performShot = useCallback(async (targetX: number, targetY: number, shotPower: number) => {
    setIsShooting(true);
    setIsAiming(false);
    if (powerInterval.current) clearInterval(powerInterval.current);
    
    sounds.playKick();

    // AI Keeper Logic
    const keeperX = (Math.random() * 2 - 1) * 0.8;
    const keeperY = (Math.random() * 2 - 1) * 0.8;
    
    setKeeperDive({ x: keeperX, y: keeperY });

    const dist = Math.sqrt(Math.pow(targetX - keeperX, 2) + Math.pow(targetY - keeperY, 2));
    const isSaved = dist < 0.35; 
    const isOffTarget = Math.abs(targetX) > 0.9 || targetY < -0.9 || targetY > 0.5; 
    
    let result: ShotResult = 'goal';
    if (isOffTarget) result = 'miss';
    else if (isSaved) result = 'save';

    setShotResult(result);

    setBallPos({ 
      x: targetX * 200, 
      y: targetY * 150 - 200, 
      z: -500, 
      scale: 0.3 
    });

    await new Promise(r => setTimeout(r, 600));

    if (result === 'goal') {
      sounds.playGoal();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setScore(prev => ({ ...prev, player: prev.player + 1 }));
      setShowResultText('هدف رائع!');
    } else if (result === 'save') {
      sounds.playSave();
      setShowResultText('تصدي مذهل!');
      setBallPos(prev => ({ ...prev, x: prev.x + (Math.random() - 0.5) * 200, y: prev.y - 100, z: -200 }));
    } else {
      setShowResultText('خارج المرمى!');
    }

    setRounds(prev => {
      const next = [...prev];
      next[currentRound] = { ...next[currentRound], player: result };
      return next;
    });

    await new Promise(r => setTimeout(r, 2000));
    resetTurn('goalkeeping');
  }, [currentRound]);

  const performSave = useCallback(async (diveX: number, diveY: number) => {
    if (isShooting) return;
    setIsShooting(true);
    setKeeperDive({ x: diveX, y: diveY });

    const targetX = (Math.random() * 2 - 1) * 0.8;
    const targetY = (Math.random() * 2 - 1) * 0.8;
    
    sounds.playKick();

    const dist = Math.sqrt(Math.pow(targetX - diveX, 2) + Math.pow(targetY - diveY, 2));
    const isSaved = dist < 0.35;
    const isOffTarget = Math.abs(targetX) > 0.9 || targetY < -0.9 || targetY > 0.5;

    let result: ShotResult = 'goal';
    if (isOffTarget) result = 'miss';
    else if (isSaved) result = 'save';

    setShotResult(result);
    setBallPos({ x: targetX * 200, y: targetY * 150 - 200, z: -500, scale: 0.3 });

    await new Promise(r => setTimeout(r, 600));

    if (result === 'goal') {
      sounds.playGoal();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
      setScore(prev => ({ ...prev, opponent: prev.opponent + 1 }));
      setShowResultText('هدف للخصم!');
    } else if (result === 'save') {
      sounds.playSave();
      setShowResultText('تصدي بطل!');
      setBallPos(prev => ({ ...prev, x: prev.x + (Math.random() - 0.5) * 200, y: prev.y - 100, z: -200 }));
    } else {
      setShowResultText('الخصم أضاعها!');
    }

    setRounds(prev => {
      const next = [...prev];
      next[currentRound] = { ...next[currentRound], opponent: result };
      return next;
    });

    await new Promise(r => setTimeout(r, 2000));
    
    if (currentRound === 4) {
      setGameState('game-over');
    } else {
      setCurrentRound(prev => prev + 1);
      resetTurn('shooting');
    }
  }, [currentRound]);

  const resetTurn = (nextTurn: Turn) => {
    setTurn(nextTurn);
    setIsShooting(false);
    setShotResult(null);
    setKeeperDive(null);
    setBallPos({ x: 0, y: 0, z: 0, scale: 1 });
    setShowResultText(null);
    setPower(0);
    setAimPos({ x: 0, y: 0 });
  };

  const restartGame = () => {
    setScore({ player: 0, opponent: 0 });
    setRounds([]);
    setCurrentRound(0);
    setGameState('start');
    resetTurn('shooting');
  };

  const renderScoreboard = () => (
    <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-2">
      <div className="bg-black/80 backdrop-blur-md border-2 border-orange-600 rounded-2xl p-4 min-w-[240px] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex gap-1 mb-2">
          {rounds.map((r, i) => (
            <div key={`p-ind-${i}`} className={`flex-1 h-3 rounded-sm ${r.player === 'goal' ? 'bg-green-500' : r.player ? 'bg-orange-600' : 'bg-gray-700'}`} />
          ))}
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-black text-xl italic tracking-tighter">SWTZ</span>
          <span className="bg-yellow-400 text-black font-black px-3 py-1 rounded-lg text-xl">{score.player}</span>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-black text-xl italic tracking-tighter">CLMB</span>
          <span className="bg-yellow-400 text-black font-black px-3 py-1 rounded-lg text-xl">{score.opponent}</span>
        </div>
        <div className="flex gap-1">
          {rounds.map((r, i) => (
            <div key={`o-ind-${i}`} className={`flex-1 h-3 rounded-sm ${r.opponent === 'goal' ? 'bg-green-500' : r.opponent ? 'bg-orange-600' : 'bg-gray-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`h-full bg-black text-white font-sans relative overflow-hidden flex flex-col transition-all duration-500 ${isShaking ? 'animate-shake' : ''}`}>
      
      {/* Stadium Background */}
      <div className="absolute inset-0 z-0">
        {/* Crowd */}
        <div className="absolute top-0 left-0 w-full h-[40%] bg-[#1e293b] overflow-hidden">
          <div className="absolute inset-0 opacity-40 flex flex-wrap justify-center gap-1 p-2">
            {Array.from({ length: 200 }).map((_, i) => (
              <div key={i} className="w-4 h-6 rounded-t-full" style={{ backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)` }} />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Banner */}
        <div className="absolute top-[35%] left-0 w-full h-10 bg-orange-600 flex items-center justify-around px-12 border-y-2 border-black z-10">
          <span className="text-white font-black text-sm tracking-[0.3em] italic">LIFE IS A GAME</span>
          <span className="text-white font-black text-sm tracking-[0.3em] italic">FOOTBALL IS SERIOUS</span>
        </div>

        {/* Grass */}
        <div className="absolute top-[40%] left-0 w-full h-[60%] bg-[#15803d]">
          <div className="absolute inset-0 opacity-30" style={{ 
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.2) 40px, rgba(0,0,0,0.2) 80px)' 
          }} />
          <div className="absolute top-0 left-0 w-full h-full border-t-4 border-white/40" />
          {/* Penalty Spot */}
          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-8 h-8 bg-white/40 rounded-full blur-sm" />
        </div>
      </div>

      {/* Start Screen */}
      <AnimatePresence>
        {gameState === 'start' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-12"
            >
              <div className="w-24 h-24 bg-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(234,88,12,0.5)]">
                <Trophy size={48} className="text-white" />
              </div>
              <h1 className="text-6xl font-black mb-4 tracking-tighter italic">PENALTY PRO</h1>
              <p className="text-white/60 max-w-md mx-auto leading-relaxed font-bold">
                تحدي ركلات الجزاء الاحترافي - سدد كالمحترفين وتصدى كالأبطال
              </p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGameState('team-select')}
              className="bg-orange-600 hover:bg-orange-500 text-white px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all flex items-center gap-3 italic"
            >
              <Play size={28} fill="currentColor" />
              ابدأ التحدي
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="mt-6 text-white/40 hover:text-white font-bold transition-all uppercase tracking-widest text-sm"
            >
              العودة للمنصة
            </motion.button>
          </motion.div>
        )}

        {/* Team Selection */}
        {gameState === 'team-select' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-[#0f172a] flex flex-col p-8 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto w-full">
              <h2 className="text-4xl font-black mb-12 text-center italic tracking-tighter">اختر فريقك المفضل</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {TEAMS.map(team => (
                  <motion.button
                    key={team.id}
                    whileHover={{ scale: 1.05, y: -10 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTeamSelect(team)}
                    className="bg-white/5 border-2 border-white/10 p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:bg-white/10 hover:border-orange-500 transition-all group shadow-2xl"
                  >
                    <div className="text-6xl mb-2 group-hover:scale-125 transition-transform duration-300 drop-shadow-lg">{team.flag}</div>
                    <div className="font-black text-xl">{team.name}</div>
                    <div className={`w-full h-2 rounded-full bg-gradient-to-r ${team.jersey}`} />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game View */}
      {gameState === 'playing' && (
        <div className="relative flex-1 flex flex-col items-center justify-center perspective-[1200px]">
          
          {/* Top Controls */}
          <div className="absolute top-6 left-6 z-[110] flex gap-4">
            <button onClick={onBack} className="p-3 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all">
              <LayoutList size={24} />
            </button>
          </div>
          <div className="absolute top-6 right-6 z-[110] flex gap-4">
            <button 
              onClick={() => {
                setIsMuted(!isMuted);
                sounds.setMuted(!isMuted);
              }}
              className="p-3 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            <button className="p-3 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all">
              <Settings size={24} />
            </button>
          </div>

          {/* Points Display (Bottom Left) */}
          <div className="absolute bottom-6 left-6 z-50">
            <div className="bg-black/80 backdrop-blur-md border-2 border-orange-600 rounded-2xl p-4 min-w-[180px] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="text-white/60 font-black text-xs uppercase tracking-[0.2em] mb-1">Total Points</div>
              <div className="text-yellow-400 font-black text-4xl italic tracking-tighter">
                {score.player * 100}
              </div>
            </div>
          </div>

          {renderScoreboard()}

          {/* Stadium Scene */}
          <div className="relative w-full max-w-5xl aspect-[16/9] flex items-center justify-center">
            
            {/* The Goal */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[250px] z-10">
              {/* Goal Posts */}
              <div className="absolute inset-0 border-[8px] border-white rounded-t-lg shadow-[0_0_30px_rgba(255,255,255,0.4)]" />
              
              {/* Net */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] rounded-t-lg overflow-hidden" style={{
                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                backgroundSize: '12px 12px'
              }}>
                {shotResult === 'goal' && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.3, opacity: 1 }}
                    className="absolute inset-0 bg-white/30 blur-2xl"
                  />
                )}
              </div>

              {/* Interaction Areas */}
              {turn === 'goalkeeping' && !isShooting && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 z-30 opacity-0 hover:opacity-100 transition-opacity">
                  {[
                    { x: -0.8, y: -0.6 }, { x: 0, y: -0.6 }, { x: 0.8, y: -0.6 },
                    { x: -0.8, y: 0.4 }, { x: 0, y: 0.4 }, { x: 0.8, y: 0.4 }
                  ].map((pos, i) => (
                    <button 
                      key={`save-btn-${i}`}
                      onClick={() => performSave(pos.x, pos.y)}
                      className="w-full h-full border border-white/5 hover:bg-orange-500/20 transition-colors"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Target Indicator (Red Circle) */}
            {isAiming && (
              <motion.div 
                className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[250px] z-20 pointer-events-none"
              >
                <motion.div 
                  className="absolute w-14 h-14 border-[6px] border-red-600 rounded-full flex items-center justify-center bg-red-500/20"
                  style={{ boxShadow: '0 0 20px rgba(220, 38, 38, 0.5), inset 0 0 10px rgba(220, 38, 38, 0.5)' }}
                  animate={{ 
                    x: (aimPos.x * 250) + 250 - 28, 
                    y: (aimPos.y * 125) + 125 - 28 
                  }}
                >
                  <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-yellow-400 animate-pulse" />
                </motion.div>
              </motion.div>
            )}

            {/* Goalkeeper */}
            <motion.div 
              className="absolute top-[32%] left-1/2 -translate-x-1/2 z-20"
              animate={keeperDive ? { 
                x: keeperDive.x * 200, 
                y: keeperDive.y * 80,
                rotate: keeperDive.x * 60,
                scale: 0.85
              } : { x: 0, y: 0, rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 250, damping: 15 }}
            >
              <div className="w-16 h-32 flex flex-col items-center justify-center relative">
                {/* Head */}
                <div className="w-10 h-10 bg-[#fecaca] rounded-full absolute -top-4 shadow-inner border border-black/10" />
                {/* Body */}
                <div className="w-14 h-24 bg-cyan-500 rounded-t-2xl rounded-b-lg shadow-2xl flex items-center justify-center border-x-4 border-black/20">
                  <Shield size={24} className="text-white/40" />
                </div>
                {/* Legs */}
                <div className="flex gap-1 mt-[-4px]">
                  <div className="w-5 h-8 bg-black rounded-b-lg" />
                  <div className="w-5 h-8 bg-black rounded-b-lg" />
                </div>
              </div>
            </motion.div>

            {/* The Ball */}
            <motion.div 
              className="absolute bottom-[18%] left-1/2 -translate-x-1/2 z-40 cursor-pointer"
              onMouseDown={startAiming}
              onTouchStart={startAiming}
              onMouseMove={updateAim}
              onTouchMove={updateAim}
              onMouseUp={() => isAiming && performShot(aimPos.x, aimPos.y, power)}
              onTouchEnd={() => isAiming && performShot(aimPos.x, aimPos.y, power)}
              animate={{ 
                x: ballPos.x, 
                y: ballPos.y, 
                z: ballPos.z,
                scale: ballPos.scale,
                rotate: isShooting ? 1080 : 0
              }}
              transition={{ 
                duration: isShooting ? 0.6 : 0,
                ease: "easeOut"
              }}
            >
              <div className="w-14 h-14 bg-white rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden border-2 border-black/5">
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: 'conic-gradient(from 0deg, #000 0deg 60deg, #fff 60deg 120deg, #000 120deg 180deg, #fff 180deg 240deg, #000 240deg 300deg, #fff 300deg 360deg)',
                  backgroundSize: '30px 30px'
                }} />
                <div className="absolute top-1 left-1 w-4 h-4 bg-black/10 rounded-full blur-[1px]" />
              </div>
              
              {/* Aiming Arrow */}
              {isAiming && (
                <motion.div 
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 pointer-events-none origin-bottom"
                  animate={{ rotate: aimPos.x * 45, height: 100 + (power * 0.5) }}
                >
                  <div className="w-2 h-full bg-gradient-to-t from-yellow-400 to-transparent rounded-full opacity-80 relative">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-yellow-400 rotate-180" />
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Shooter (Player/AI) */}
            <motion.div 
              className="absolute bottom-[12%] left-[42%] z-30"
              animate={isShooting ? { x: 80, y: -40, scale: 1.15, rotate: -10 } : { x: 0, y: 0, scale: 1, rotate: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-20 h-40 flex flex-col items-center justify-center relative">
                {/* Head */}
                <div className="w-12 h-12 bg-[#fecaca] rounded-full absolute -top-6 shadow-inner border border-black/10" />
                {/* Body */}
                <div className="w-18 h-28 bg-red-600 rounded-t-3xl rounded-b-lg shadow-2xl flex items-center justify-center border-x-4 border-black/20">
                  <User size={32} className="text-white/30" />
                </div>
                {/* Shorts */}
                <div className="w-18 h-12 bg-white rounded-b-xl shadow-md border-x-4 border-black/10" />
                {/* Legs */}
                <div className="flex gap-2 mt-[-2px]">
                  <div className="w-6 h-12 bg-[#fecaca] rounded-b-lg border-x-2 border-black/5" />
                  <div className="w-6 h-12 bg-[#fecaca] rounded-b-lg border-x-2 border-black/5" />
                </div>
              </div>
            </motion.div>

            {/* Result Text Overlay */}
            <AnimatePresence>
              {showResultText && (
                <motion.div 
                  initial={{ scale: 0.2, opacity: 0, y: 50 }}
                  animate={{ scale: 1.5, opacity: 1, y: 0 }}
                  exit={{ scale: 3, opacity: 0 }}
                  className="absolute z-[60] text-8xl font-black text-white italic drop-shadow-[0_0_50px_rgba(0,0,0,1)] pointer-events-none uppercase tracking-tighter"
                >
                  {showResultText}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls HUD */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-md px-6 flex flex-col items-center gap-4">
            {turn === 'shooting' && !isShooting && (
              <div className="w-full space-y-3">
                <div className="flex justify-between text-[12px] font-black uppercase tracking-[0.3em] text-white/60">
                  <span>SHOT POWER</span>
                  <span className={power > 80 ? 'text-orange-500' : 'text-white'}>{Math.round(power)}%</span>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden border-2 border-white/10 p-0.5 shadow-inner">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 rounded-full"
                    animate={{ width: `${power}%` }}
                  />
                </div>
                <p className="text-center text-[10px] text-white/40 font-bold uppercase tracking-widest">Hold to charge • Release to kick</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState === 'game-over' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-12"
            >
              <div className="w-40 h-40 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_80px_rgba(234,179,8,0.6)]">
                <Trophy size={80} className="text-white" />
              </div>
              <h2 className="text-7xl font-black mb-4 tracking-tighter italic uppercase">
                {score.player > score.opponent ? 'CHAMPION!' : 'GAME OVER'}
              </h2>
              <div className="text-3xl font-bold text-white/40 mb-12 uppercase tracking-[0.5em]">
                FINAL SCORE: {score.player} - {score.opponent}
              </div>
            </motion.div>

            <div className="flex gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={restartGame}
                className="bg-white text-black px-12 py-5 rounded-[2rem] font-black text-xl shadow-2xl transition-all flex items-center gap-3 italic"
              >
                <RotateCcw size={24} />
                REPLAY MATCH
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="bg-white/10 hover:bg-white/20 text-white px-12 py-5 rounded-[2rem] font-black text-xl transition-all border border-white/10 italic"
              >
                EXIT GAME
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.1s ease-in-out infinite;
        }
        .perspective-1200 {
          perspective: 1200px;
        }
      `}</style>
    </div>
  );
}
