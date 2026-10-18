import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface WhiteboardTimerProps {
  initialSeconds?: number;
  isRunning?: boolean;
  isTeacher?: boolean;
  onUpdateTimer?: (remaining: number, isRunning: boolean) => void;
}

export const WhiteboardTimer: React.FC<WhiteboardTimerProps> = ({
  initialSeconds = 60,
  isRunning = false,
  isTeacher = true,
  onUpdateTimer
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [active, setActive] = useState(isRunning);
  const onUpdateTimerRef = useRef(onUpdateTimer);

  useEffect(() => {
    onUpdateTimerRef.current = onUpdateTimer;
  }, [onUpdateTimer]);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    setActive(isRunning);
  }, [isRunning]);

  const playAlarmSound = useCallback(() => {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        const audioCtx = new AudioCtxClass();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 tone
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      }
    } catch {
      // Audio fallback
    }
  }, []);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          playAlarmSound();
          setActive(false);
          if (onUpdateTimerRef.current) {
            setTimeout(() => {
              onUpdateTimerRef.current?.(0, false);
            }, 0);
          }
          return 0;
        }

        if (onUpdateTimerRef.current) {
          setTimeout(() => {
            onUpdateTimerRef.current?.(next, true);
          }, 0);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, playAlarmSound]);

  const toggleTimer = () => {
    if (!isTeacher) return;
    const nextState = !active;
    setActive(nextState);
    onUpdateTimerRef.current?.(secondsLeft, nextState);
  };

  const setPreset = (sec: number) => {
    if (!isTeacher) return;
    setActive(false);
    setSecondsLeft(sec);
    onUpdateTimerRef.current?.(sec, false);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLow = secondsLeft <= 10 && secondsLeft > 0;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all ${
      isLow 
        ? 'bg-red-500/20 border-red-500/50 text-red-300 animate-pulse'
        : 'bg-slate-900/80 backdrop-blur-md border-white/10 text-white shadow-lg'
    }`}>
      <Clock size={16} className={isLow ? 'text-red-400' : 'text-emerald-400'} />
      <span className="font-mono font-bold text-sm tracking-wider">{formatTime(secondsLeft)}</span>

      {isTeacher && (
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTimer}
            className="p-1 hover:bg-white/10 rounded-lg text-emerald-400 hover:text-white transition"
            title={active ? "إيقاف مؤقت" : "بدء المؤقت"}
          >
            {active ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={() => setPreset(60)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
            title="إعادة ضبط"
          >
            <RotateCcw size={14} />
          </button>

          {/* Quick presets */}
          <div className="hidden lg:flex items-center gap-1 border-r border-white/10 pr-1 mr-1">
            {[30, 60, 120, 300].map(s => (
              <button
                key={s}
                onClick={() => setPreset(s)}
                className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition"
              >
                {s >= 60 ? `${s / 60}د` : `${s}ث`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
