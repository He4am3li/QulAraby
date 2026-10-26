import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX,
  RotateCcw, Check, Disc, X,
  Download, Loader2, Sparkles, CheckCircle2,
  ChevronDown, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORY_CASSETTES, StoryCassette } from '../src/data/storyCassettes';
import { SHELF_TAPES, ShelfTape, getStoryForShelfTape } from '../src/data/shelfCassettes';
import { getStoryQuestions, StoryQuestion } from '../src/data/storyQuestions';
import { ARABIC_ENGLISH_DICT } from '../src/data/arabicEnglishDict';

interface CassettePlayerProps {
  audioSrc?: string;
  trackTitle?: string;
  story?: StoryCassette;
  allStories?: StoryCassette[];
  onStoryChange?: (story: StoryCassette) => void;
  className?: string;
}

const getEnglishTranslation = (word: string): string => {
  const clean = word.replace(/[^\u0621-\u064A]/g, '').trim();
  if (ARABIC_ENGLISH_DICT[clean]) return ARABIC_ENGLISH_DICT[clean];
  if (ARABIC_ENGLISH_DICT[word]) return ARABIC_ENGLISH_DICT[word];
  for (const [key, val] of Object.entries(ARABIC_ENGLISH_DICT)) {
    if (clean.includes(key) || key.includes(clean)) return val;
  }
  return 'Vocabulary item';
};

interface TimedWord {
  id: number;
  text: string;
  startTime: number;
  endTime: number;
}

/**
 * VISIBLE, MESMERIZING SMOKY WAVY ATMOSPHERE
 */
const SmokyAtmosphere: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-0">
      <div className="absolute inset-0 bg-[#0d1017]" />
      <div
        className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full bg-slate-500/20 blur-3xl animate-pulse"
        style={{ animationDuration: '7s' }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-[420px] h-[420px] rounded-full bg-slate-400/15 blur-3xl animate-pulse"
        style={{ animationDuration: '9s', animationDelay: '1.5s' }}
      />
      <div
        className="absolute top-1/3 left-1/3 w-[360px] h-[360px] rounded-full bg-amber-950/20 blur-3xl animate-pulse"
        style={{ animationDuration: '11s', animationDelay: '3s' }}
      />
      <svg
        className="absolute inset-0 w-full h-full opacity-35 mix-blend-screen"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 700"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="smokeGradA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#475569" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="smokeGradB" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#334155" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,200 C180,120 320,290 500,210 C680,130 820,300 1000,220 L1000,700 L0,700 Z" fill="url(#smokeGradA)" />
        <path d="M0,360 C220,440 360,260 550,350 C740,440 880,280 1000,370 L1000,700 L0,700 Z" fill="url(#smokeGradB)" />
        <path d="M0,80 C150,140 350,20 520,100 C690,180 850,60 1000,110 L1000,0 L0,0 Z" fill="url(#smokeGradA)" opacity="0.65" />
      </svg>
    </div>
  );
};

/**
 * Authentic Vintage Cassette for the 4-Column Wooden Shelf Rack
 * Displays full Arabic title underneath without truncation
 */
const ShelfCassetteItem: React.FC<{
  tape: ShelfTape;
  isActive: boolean;
  isPlaying: boolean;
  onClick: () => void;
}> = ({ tape, isActive, isPlaying, onClick }) => {
  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <button
        onClick={onClick}
        title={`${tape.titleAr} (${tape.brand} ${tape.year}) - انقر للتشغيل`}
        className={`group w-full rounded-md p-1.5 relative transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer shadow-md select-none ${
          isActive
            ? 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.65)] scale-[1.03] border-amber-300'
            : 'border-stone-800 hover:border-amber-300/80 hover:scale-[1.02] hover:shadow-lg'
        } bg-gradient-to-r ${tape.tapeColor} border`}
        style={{ aspectRatio: '1.68 / 1' }}
      >
        {/* Corner Screws */}
        <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-stone-400/90" />
        <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-stone-400/90" />
        <div className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full bg-stone-400/90" />
        <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-stone-400/90" />

        {/* Top Brand & Model Strip */}
        <div className="flex items-center justify-between text-[7px] font-mono font-bold text-white/90 px-0.5 pt-0.5 border-b border-white/15 pb-0.5">
          <span className="truncate max-w-[55px] font-black tracking-tight">{tape.brand}</span>
          <span className="text-[6.5px] opacity-75 font-mono">{tape.year}</span>
        </div>

        {/* Center Acrylic Window with Dual Spool Teeth */}
        <div className="bg-stone-950/95 rounded py-0.5 px-1.5 border border-black/80 flex items-center justify-between my-auto shadow-inner">
          <div
            className="w-3.5 h-3.5 rounded-full bg-stone-200 border border-stone-400 flex items-center justify-center relative shadow-xs"
            style={{
              transform: isActive && isPlaying ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.5s linear'
            }}
          >
            <div className="w-1 h-1 rounded-full bg-stone-950" />
          </div>

          <div className="flex-1 h-0.5 bg-amber-950/90 mx-1.5 rounded" />

          <div
            className="w-3.5 h-3.5 rounded-full bg-stone-200 border border-stone-400 flex items-center justify-center relative shadow-xs"
            style={{
              transform: isActive && isPlaying ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.5s linear'
            }}
          >
            <div className="w-1 h-1 rounded-full bg-stone-950" />
          </div>
        </div>

        {/* Bottom Format Marker */}
        <div className="flex items-center justify-between text-[6px] font-mono text-stone-300 px-0.5">
          <span>HIGH BIAS</span>
          <span>90 MIN</span>
        </div>
      </button>

      {/* FULL ARABIC TITLE PILL BADGE (No numbers, scaled so full name appears) */}
      <div
        className={`w-full min-h-[30px] flex items-center justify-center text-center px-1 py-0.5 rounded-md text-[8.5px] sm:text-[9px] font-black leading-tight border transition-all arabic-font ${
          isActive
            ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-xs scale-102 font-black'
            : 'bg-[#f7eedc] text-stone-900 border-stone-400/70 shadow-2xs hover:bg-white'
        }`}
        title={tape.titleAr}
      >
        <span className="line-clamp-2">
          {tape.titleAr}
        </span>
      </div>
    </div>
  );
};

/**
 * PURE MECHANICAL OPEN WALKMAN BAY
 * Shows authentic mechanical details (magnetic head, drive hubs, capstans, pinch rollers, springs)
 * with an open tilted door cradle. ZERO TEXT INSIDE as requested!
 */
const OpenWalkmanChamber: React.FC<{
  isOpen: boolean;
  isInserting: boolean;
  flyingTape: ShelfTape | null;
}> = ({ isOpen, isInserting, flyingTape }) => {
  return (
    <div
      className="w-full rounded-2xl relative shadow-2xl border-2 border-stone-800 bg-[#0c0f16] overflow-hidden flex flex-col justify-end p-2 select-none"
      style={{ minHeight: '190px', perspective: '700px' }}
    >
      {/* Recessed Mechanical Interior (Zero Text!) */}
      <div className="absolute inset-2 rounded-xl bg-gradient-to-b from-[#090b10] via-[#0d1017] to-[#121620] border border-stone-800/80 shadow-[inset_0_4px_16px_rgba(0,0,0,0.9)] flex flex-col justify-between p-3 overflow-hidden">

        {/* Top Metallic Guide Bar & Tension Springs */}
        <div className="flex items-center justify-between px-3 pt-1">
          <div className="w-4 h-1.5 rounded-xs bg-stone-500 border border-stone-700 shadow-xs" />
          <div className="h-0.5 flex-1 mx-3 bg-stone-700/60" />
          <div className="w-4 h-1.5 rounded-xs bg-stone-500 border border-stone-700 shadow-xs" />
        </div>

        {/* Center Mechanical Drive Spindles & Heads */}
        <div className="flex items-center justify-between px-6 my-auto">
          {/* Left Geared Hub Spindle */}
          <div className="w-9 h-9 rounded-full bg-stone-800 border-2 border-stone-600 flex items-center justify-center relative shadow-md">
            <div className="w-3.5 h-3.5 rounded-full bg-stone-950 border border-stone-700" />
            {[0, 120, 240].map((deg) => (
              <div
                key={deg}
                className="absolute w-1 h-3.5 bg-stone-400 rounded-xs"
                style={{ transform: `rotate(${deg}deg) translateY(-6px)` }}
              />
            ))}
          </div>

          {/* Center Playback / Record Magnetic Head Assembly */}
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="w-12 h-6 rounded-md bg-gradient-to-b from-stone-400 via-stone-300 to-stone-500 border border-stone-600 shadow-md flex items-center justify-center relative">
              <div className="w-2.5 h-4 bg-stone-900 rounded-xs" />
              <div className="absolute -left-1.5 w-1 h-3 bg-amber-600/80 rounded-xs" />
              <div className="absolute -right-1.5 w-1 h-3 bg-amber-600/80 rounded-xs" />
            </div>
            {/* Dual Brass Capstan Shafts & Rubber Rollers */}
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-amber-400 border border-amber-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-700" />
              <div className="w-2 h-2 rounded-full bg-amber-400 border border-amber-600" />
            </div>
          </div>

          {/* Right Geared Hub Spindle */}
          <div className="w-9 h-9 rounded-full bg-stone-800 border-2 border-stone-600 flex items-center justify-center relative shadow-md">
            <div className="w-3.5 h-3.5 rounded-full bg-stone-950 border border-stone-700" />
            {[0, 120, 240].map((deg) => (
              <div
                key={deg}
                className="absolute w-1 h-3.5 bg-stone-400 rounded-xs"
                style={{ transform: `rotate(${deg}deg) translateY(-6px)` }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Eject Spring Rod & Latch Clamps */}
        <div className="flex items-center justify-between px-3 pb-1">
          <div className="w-3 h-3 rounded bg-stone-700 border border-stone-600 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-amber-500/90 rounded-full" />
          </div>
          <div className="h-1 flex-1 mx-4 bg-gradient-to-r from-stone-600 via-stone-400 to-stone-600 rounded-full" />
          <div className="w-3 h-3 rounded bg-stone-700 border border-stone-600 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-amber-500/90 rounded-full" />
          </div>
        </div>

      </div>

      {/* Tilted Open Walkman Door Cradle (Snaps shut when tape is inserted) */}
      <motion.div
        animate={{
          rotateX: isOpen ? 24 : 0,
          y: isOpen ? 6 : 0,
        }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        style={{ transformOrigin: "bottom center" }}
        className="w-full h-[155px] rounded-xl border-2 border-stone-600/90 bg-stone-900/40 backdrop-blur-xs shadow-2xl relative flex flex-col justify-between p-2 z-20 pointer-events-none"
      >
        {/* Brushed Metal Top Edge of Door */}
        <div className="w-full h-3 rounded-t-lg bg-gradient-to-r from-stone-400 via-stone-200 to-stone-400 border-b border-stone-500 flex items-center justify-between px-2">
          <div className="w-2 h-1 rounded bg-stone-700" />
          <div className="w-8 h-1 rounded bg-stone-600" />
          <div className="w-2 h-1 rounded bg-stone-700" />
        </div>

        {/* Tinted Acrylic Windows */}
        <div className="flex items-center justify-between px-5 my-auto">
          <div className="w-12 h-12 rounded-lg border border-white/20 bg-black/40 shadow-inner" />
          <div className="w-12 h-12 rounded-lg border border-white/20 bg-black/40 shadow-inner" />
        </div>

        {/* Bottom Hinge Brackets */}
        <div className="flex items-center justify-between px-1">
          <div className="w-4 h-2 rounded-b bg-stone-500 border border-stone-600" />
          <div className="w-4 h-2 rounded-b bg-stone-500 border border-stone-600" />
        </div>
      </motion.div>

      {/* FLYING TAPE ANIMATION (Flies in smoothly when clicked and snaps inside!) */}
      <AnimatePresence>
        {isInserting && flyingTape && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -90, rotateX: 20 }}
            animate={{ opacity: 1, scale: 0.96, y: 10, rotateX: 24 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
            className="absolute inset-x-4 bottom-4 z-40 pointer-events-none"
          >
            <div className={`w-full h-[140px] rounded-xl border-2 border-amber-300 shadow-2xl p-2 bg-gradient-to-r ${flyingTape.tapeColor} flex flex-col justify-between`}>
              <div className="flex justify-between text-[9px] font-mono text-white font-black">
                <span>{flyingTape.brand}</span>
                <span>{flyingTape.cassetteNumber}</span>
              </div>
              <div className="text-center font-black text-white text-xs arabic-font">
                {flyingTape.titleAr}
              </div>
              <div className="bg-black/80 rounded h-6 w-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CassettePlayer: React.FC<CassettePlayerProps> = ({
  audioSrc,
  trackTitle,
  story,
  allStories = STORY_CASSETTES,
  onStoryChange,
  className = ''
}) => {
  // STRICT REQUIREMENT: Tape is NOT selected automatically on start; student chooses first!
  const [currentStory, setCurrentStory] = useState<StoryCassette | null>(() => {
    return story || null;
  });

  const [activeTapeId, setActiveTapeId] = useState<string | null>(() => {
    if (story) {
      const match = SHELF_TAPES.find(t => t.storyId === story.id);
      return match ? match.id : null;
    }
    return null;
  });

  // Mechanical Door State
  const [isDoorOpen, setIsDoorOpen] = useState<boolean>(!story);
  const [isInserting, setIsInserting] = useState<boolean>(false);
  const [flyingTape, setFlyingTape] = useState<ShelfTape | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Vocabulary Translation Popup
  const [wordTranslation, setWordTranslation] = useState<{ arabic: string; english: string } | null>(null);

  // Compact Thermal Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [printerDismissed, setPrinterDismissed] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const singleLineTickerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const effectiveAudioSrc = audioSrc || currentStory?.audioSrc || '';

  // Get real comprehension questions strictly from the text
  const questions: StoryQuestion[] = useMemo(() => {
    if (!currentStory) return [];
    return getStoryQuestions(currentStory.id);
  }, [currentStory]);

  /**
   * ROBUST BINARY AUDIO DOWNLOAD
   */
  const handleDownload = async () => {
    if (!effectiveAudioSrc || !currentStory || isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(effectiveAudioSrc);
      if (!response.ok) throw new Error("Audio download failed");
      const blob = await response.blob();
      const mp3Blob = new Blob([blob], { type: 'audio/mpeg' });
      const blobUrl = URL.createObjectURL(mp3Blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      const sanitizedTitle = currentStory.titleAr.replace(/[/\\?%*:|"<>]/g, '_');
      link.download = `${sanitizedTitle}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (err) {
      console.warn("Direct blob download fallback", err);
      const link = document.createElement('a');
      link.href = effectiveAudioSrc;
      link.download = `${currentStory.titleAr}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

  // Sync if parent passes controlled story
  useEffect(() => {
    if (story && (!currentStory || story.id !== currentStory.id)) {
      setCurrentStory(story);
      setCurrentTime(0);
      setIsDoorOpen(false);
      setQuizSubmitted(false);
      setQuizAnswers({});
      const match = SHELF_TAPES.find(t => t.storyId === story.id);
      if (match) setActiveTapeId(match.id);
    }
  }, [story]);

  /**
   * HIGH-PRECISION AUDIO WORD TIMING ENGINE
   */
  const timedWords: TimedWord[] = useMemo(() => {
    if (!currentStory || !currentStory.paragraphs) return [];

    interface RawToken {
      text: string;
      weight: number;
    }

    const tokens: RawToken[] = [];
    currentStory.paragraphs.forEach((para, paraIdx) => {
      const words = para.trim().split(/\s+/).filter(Boolean);
      words.forEach((w, wIdx) => {
        const isLastInPara = wIdx === words.length - 1;
        const lettersCount = w.replace(/[^\u0621-\u064A]/g, '').length;
        let weight = Math.max(3.0, lettersCount * 1.0);

        if (/[.!?؟]/.test(w) || isLastInPara) {
          weight += 12.0;
        } else if (/[,:;،]/.test(w)) {
          weight += 5.5;
        } else {
          weight += 1.2;
        }

        tokens.push({ text: w, weight });
      });
    });

    if (tokens.length === 0) return [];

    const totalWeight = tokens.reduce((sum, t) => sum + t.weight, 0);
    const safeDuration = duration > 0 ? duration : 160;
    const introDelay = 4.8;
    const outroDelay = 6.0;
    const effectiveSpeechTime = Math.max(5, safeDuration - introDelay - outroDelay);

    let cumulativeWeight = 0;
    return tokens.map((token, idx) => {
      const startSec = introDelay + (cumulativeWeight / totalWeight) * effectiveSpeechTime;
      cumulativeWeight += token.weight;
      const endSec = introDelay + (cumulativeWeight / totalWeight) * effectiveSpeechTime;
      return {
        id: idx,
        text: token.text,
        startTime: startSec,
        endTime: endSec
      };
    });
  }, [currentStory, duration]);

  // Synchronized active word index
  const activeWordIndex = useMemo(() => {
    if (timedWords.length === 0) return 0;
    if (currentTime < timedWords[0].startTime) return 0;
    if (currentTime >= timedWords[timedWords.length - 1].endTime) return timedWords.length - 1;

    const foundIdx = timedWords.findIndex(w => currentTime >= w.startTime && currentTime <= w.endTime);
    if (foundIdx !== -1) return foundIdx;

    for (let i = timedWords.length - 1; i >= 0; i--) {
      if (currentTime >= timedWords[i].startTime) {
        return i;
      }
    }
    return 0;
  }, [currentTime, timedWords]);

  // 60FPS RAF AUDIO TRACKER
  const updateAudioProgress = useCallback(() => {
    if (audioRef.current && isPlaying) {
      setCurrentTime(audioRef.current.currentTime);
      animationFrameRef.current = requestAnimationFrame(updateAudioProgress);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateAudioProgress);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, updateAudioProgress]);

  // Smooth auto-scroll for single-line ticker
  useEffect(() => {
    const container = singleLineTickerRef.current;
    if (!container) return;
    const activeEl = container.querySelector('[data-spoken="true"]') as HTMLElement;
    if (activeEl) {
      const targetLeft = activeEl.offsetLeft - (container.clientWidth / 2) + (activeEl.clientWidth / 2);
      container.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
  }, [activeWordIndex]);

  const togglePlay = () => {
    if (!currentStory || !audioRef.current || isDoorOpen) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Playback error:", err);
      });
    }
  };

  const seekRelative = (seconds: number) => {
    if (!currentStory || !audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentStory || !audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  /**
   * SPECTACULAR TAPE INSERTION SEQUENCE
   * 1. Tape glides in with fluid motion
   * 2. Walkman door snaps automatically closed
   * 3. Loaded tape appears in bay and plays!
   */
  const handleSelectShelfTape = (shelfTape: ShelfTape) => {
    const selected = getStoryForShelfTape(shelfTape);
    if (!selected) return;

    if (currentStory && currentStory.id === selected.id && activeTapeId === shelfTape.id && !isDoorOpen) {
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);

    // Open door if not already open
    setIsDoorOpen(true);
    setFlyingTape(shelfTape);
    setIsInserting(true);

    // Stage 1: Fly tape in
    setTimeout(() => {
      // Stage 2: Snap door shut
      setIsDoorOpen(false);
      setIsInserting(false);
      setFlyingTape(null);

      setActiveTapeId(shelfTape.id);
      setCurrentStory(selected);
      setCurrentTime(0);
      setQuizSubmitted(false);
      setQuizAnswers({});
      setPrinterDismissed(false);

      if (onStoryChange) onStoryChange(selected);

      // Stage 3: Smooth auto-play
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {});
        }
      }, 250);
    }, 450);
  };

  const handleEjectDoor = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsDoorOpen(true);
  };

  const handleWordClick = (word: TimedWord) => {
    if (audioRef.current) {
      audioRef.current.currentTime = word.startTime;
      setCurrentTime(word.startTime);
    }
    const english = getEnglishTranslation(word.text);
    setWordTranslation({ arabic: word.text, english });
  };

  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds)) return '00:00';
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleQuizAnswer = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleQuizSubmit = () => {
    let score = 0;
    if (questions.length > 0 && quizAnswers[0] === questions[0].correctIndex) {
      score = 1;
    }
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const progressRatio = duration > 0 ? currentTime / duration : 0;

  return (
    <div className={`w-full max-w-[1500px] mx-auto flex flex-col select-none relative ${className}`} dir="rtl">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={effectiveAudioSrc || undefined}
        preload="metadata"
        loop={isLooping}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            audioRef.current.playbackRate = playbackRate;
            audioRef.current.volume = volume;
          }
        }}
        onEnded={() => {
          if (!isLooping) {
            setIsPlaying(false);
          }
        }}
      />

      {/* 2-SECTION BALANCED WORKBENCH */}
      {/* IN RTL:
          First child = RIGHT side (The 4-Column Wooden Cassette Rack Shelf)
          Second child = LEFT side (Cassette Player Deck + Compact Thermal Quiz Printer)
          This fulfills: "انقل المكتبة إلى اليمين"!
      */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-stretch w-full">

        {/* ======================================================== */}
        {/* SECTION 1 (RIGHT SIDE): 4-COLUMN WOODEN CASSETTE RACK    */}
        {/* Frame bottom is ALWAYS fully visible; scrolling is INSIDE */}
        {/* ======================================================== */}
        <div className="w-full lg:w-[54%] rounded-2xl border-[10px] border-[#c4a47c] bg-[#e6d5bc] shadow-2xl relative flex flex-col overflow-hidden h-[590px] lg:h-[605px]">

          {/* Light Pine/Oak Wood Grain Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, #d8be9b 0px, #d8be9b 80px, #caa880 82px, #caa880 84px)`,
            }}
          />

          {/* Internal Scrollable Cassette Grid (Bottom wooden frame is permanently fixed and visible!) */}
          <div className="relative z-10 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-800/40 scrollbar-track-transparent p-2.5 sm:p-3 pr-1.5">
            <div className="grid grid-cols-4 gap-x-2 gap-y-3">
              {SHELF_TAPES.map((tape) => (
                <ShelfCassetteItem
                  key={tape.id}
                  tape={tape}
                  isActive={activeTapeId === tape.id}
                  isPlaying={isPlaying && activeTapeId === tape.id}
                  onClick={() => handleSelectShelfTape(tape)}
                />
              ))}
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* SECTION 2 (LEFT SIDE): PLAYER DECK + COMPACT PRINTER     */}
        {/* Fits strictly within ~605px total height; zero overflow   */}
        {/* ======================================================== */}
        <div className="w-full lg:w-[46%] flex flex-col justify-between h-[590px] lg:h-[605px] gap-3 shrink-0">

          {/* 1. TOP CARD: VINTAGE CASSETTE PLAYER DECK */}
          <div className="w-full rounded-[1.75rem] bg-[#161a22] border border-stone-800/90 shadow-2xl p-3.5 sm:p-4 relative flex flex-col overflow-hidden backdrop-blur-md">
            <SmokyAtmosphere />

            <div className="relative z-10 flex flex-col gap-2.5">

              {/* Top Bar: Digital LED Counter & Stereo Deck Branding + Eject Button */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                {/* Left (in RTL): Gold Deck Title + Reel + Eject Button */}
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-xs">
                    <Disc className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[7.5px] font-mono tracking-widest text-amber-400/80 uppercase font-bold">
                      AUTO REVERSE STEREO CASSETTE DECK
                    </span>
                    <span className="text-[11px] font-black text-white arabic-font truncate max-w-[150px]">
                      {currentStory?.titleAr || 'مشغل الكاسيت'}
                    </span>
                  </div>
                </div>

                {/* Right (in RTL): Tape Time LED & Door Eject Button */}
                <div className="flex items-center gap-1.5" dir="ltr">
                  <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md border border-white/10 shadow-inner font-mono text-[10px] text-amber-300 font-bold">
                    <span className="text-[8px] text-stone-400">TIME</span>
                    <span className="text-emerald-400">IIII</span>
                    <span>{formatTime(currentTime)} / {formatTime(duration || 164)}</span>
                  </div>
                  <button
                    onClick={handleEjectDoor}
                    title="فتح باب الووكمان واستبدال الشريط ⏏"
                    className="p-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-[10px] font-mono font-bold transition-all cursor-pointer"
                  >
                    ⏏
                  </button>
                </div>
              </div>

              {/* The Cassette Chamber: Open Walkman Door OR Loaded Tape */}
              {isDoorOpen || !currentStory ? (
                /* Pure Mechanical Open Walkman Bay (Zero Text!) */
                <OpenWalkmanChamber
                  isOpen={isDoorOpen}
                  isInserting={isInserting}
                  flyingTape={flyingTape}
                />
              ) : (
                /* Loaded Cassette in Closed Bay */
                <motion.div
                  key={currentStory.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="w-full rounded-xl p-2.5 sm:p-3 relative shadow-2xl border border-stone-700/80 bg-[#f7f3e8] flex flex-col justify-between"
                  style={{ minHeight: '190px' }}
                >
                  <div className="flex flex-col justify-between h-full text-stone-900 select-none">

                    {/* Header Strip: NR Dolby & Model Code */}
                    <div className="flex items-center justify-between text-[9px] font-mono font-bold border-b border-stone-300 pb-0.5 text-stone-600">
                      <div className="flex items-center gap-1">
                        <span className="px-1 py-0.2 rounded bg-stone-900 text-white text-[8px] font-black">
                          NR [ DOLBY B ]
                        </span>
                        <span className="bg-amber-100 text-amber-900 px-1 rounded text-[8px] font-black border border-amber-300">
                          {currentStory.cassetteNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[8px] text-stone-700 font-mono">
                        <span>HIGH FIDELITY • TYPE I</span>
                        <span className="w-3 h-3 rounded-full bg-stone-900 text-white flex items-center justify-center text-[7px] font-black">
                          A
                        </span>
                      </div>
                    </div>

                    {/* Story Title & Subtitle */}
                    <div className="text-center py-0.5">
                      <h3 className="text-sm sm:text-base font-black text-stone-950 arabic-font leading-snug">
                        {currentStory.titleAr}
                      </h3>
                      <p className="text-[9px] text-stone-500 font-mono truncate">
                        {currentStory.categoryAr} • {currentStory.titleEn}
                      </p>
                    </div>

                    {/* Acrylic Window with Rotating Spools */}
                    <div className="w-full bg-[#12141a] rounded-lg py-1.5 px-4 sm:px-6 border border-stone-800 shadow-inner flex items-center justify-between relative overflow-hidden my-0.5">
                      <div
                        className="w-7 h-7 rounded-full bg-stone-200 border-2 border-stone-400 flex items-center justify-center relative shadow-xs shrink-0"
                        style={{
                          transform: isPlaying ? `rotate(${(currentTime * 120) % 360}deg)` : 'none'
                        }}
                      >
                        <div className="w-2 h-2 rounded-full bg-stone-950" />
                        {[0, 60, 120, 180, 240, 300].map((deg) => (
                          <div
                            key={deg}
                            className="absolute w-0.5 h-1.5 bg-stone-400 rounded-2xs"
                            style={{ transform: `rotate(${deg}deg) translateY(-3px)` }}
                          />
                        ))}
                      </div>

                      <div className="flex flex-col items-center justify-center px-2 flex-1">
                        <div className="h-0.5 w-full max-w-[100px] bg-amber-900/80 rounded mb-0.5" />
                        <div className="flex items-center gap-1.5 text-[7.5px] font-mono text-stone-300 font-bold">
                          <span>MIN: {currentStory.durationApprox}</span>
                          <span className="text-amber-400">{isPlaying ? '▶ قيد التشغيل' : 'II متوقف'}</span>
                          <span>INDEX: {Math.round(progressRatio * 100)}%</span>
                        </div>
                      </div>

                      <div
                        className="w-7 h-7 rounded-full bg-stone-200 border-2 border-stone-400 flex items-center justify-center relative shadow-xs shrink-0"
                        style={{
                          transform: isPlaying ? `rotate(${(currentTime * 120) % 360}deg)` : 'none'
                        }}
                      >
                        <div className="w-2 h-2 rounded-full bg-stone-950" />
                        {[0, 60, 120, 180, 240, 300].map((deg) => (
                          <div
                            key={deg}
                            className="absolute w-0.5 h-1.5 bg-stone-400 rounded-2xs"
                            style={{ transform: `rotate(${deg}deg) translateY(-3px)` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* STRICT SYNCHRONIZED TEXT TICKER */}
                    <div className="w-full bg-[#0a100d] rounded px-2 py-0.5 border border-emerald-950 shadow-inner overflow-hidden">
                      <div
                        ref={singleLineTickerRef}
                        className="flex items-center justify-start gap-1 overflow-x-hidden whitespace-nowrap scrollbar-hide select-none w-full"
                        dir="rtl"
                      >
                        {timedWords.map((item) => {
                          const isSpoken = item.id === activeWordIndex;
                          return (
                            <button
                              key={item.id}
                              data-spoken={isSpoken}
                              onClick={() => handleWordClick(item)}
                              title="انقر للترجمة الفورية بالإنجليزية والاستماع"
                              className={`px-1 py-0.2 rounded transition-all duration-100 whitespace-nowrap arabic-font text-[11px] font-bold cursor-pointer shrink-0 ${
                                isSpoken
                                  ? 'bg-amber-400 text-stone-950 shadow-[0_0_10px_rgba(251,191,36,0.95)] scale-105 font-black'
                                  : 'text-emerald-400/80 hover:text-white'
                              }`}
                            >
                              {item.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* Scrubber & Single-Line Controls Bar */}
              <div className="w-full flex flex-col gap-1.5 pt-0.5 select-none">
                {/* Time Scrubber Line */}
                <div className="flex items-center gap-2 w-full font-mono text-[11px] text-white/90" dir="ltr">
                  <span className="w-9 text-left font-bold text-stone-300">
                    {formatTime(currentTime)}
                  </span>
                  <div className="relative flex-1 flex items-center h-2.5">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      disabled={!currentStory || isDoorOpen}
                      className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white hover:accent-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                  </div>
                  <span className="w-9 text-right font-bold text-stone-300">
                    {formatTime(duration || 164)}
                  </span>
                </div>

                {/* SINGLE LINE CONTROLS: (Download + Volume + -10 + Play + +10 + 1x + Loop) */}
                <div className="flex items-center justify-between gap-1 px-1 py-1 bg-black/40 rounded-xl border border-white/5" dir="ltr">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleDownload}
                      disabled={!currentStory || isDownloading || isDoorOpen}
                      title="تحميل الملف الصوتي بصيغة MP3"
                      className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-0.5 px-0.5 py-0.5 rounded-full hover:bg-white/5 transition-colors">
                      <button
                        onClick={toggleMute}
                        disabled={!currentStory || isDoorOpen}
                        className="text-white/80 hover:text-white p-0.5 rounded-full transition-colors cursor-pointer disabled:opacity-30"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-white" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        disabled={!currentStory || isDoorOpen}
                        className="w-10 sm:w-12 h-1 bg-white/25 rounded-full appearance-none cursor-pointer accent-white disabled:opacity-30"
                      />
                    </div>
                  </div>

                  {/* Audio Trio: -10 | Circle Play/Pause | +10 */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => seekRelative(-10)}
                      disabled={!currentStory || isDoorOpen}
                      title="ترجيع 10 ثوانٍ"
                      className="w-7 h-7 rounded-full border border-white/40 hover:border-white bg-white/5 hover:bg-white/15 active:scale-90 flex items-center justify-center text-white font-mono text-[10px] font-bold transition-all shadow-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      -10
                    </button>

                    <button
                      onClick={togglePlay}
                      disabled={!currentStory || isDoorOpen}
                      title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                      className="w-9 h-9 rounded-full border-2 border-white hover:border-amber-400 bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center transition-all shadow-[0_0_12px_rgba(255,255,255,0.2)] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-white text-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => seekRelative(10)}
                      disabled={!currentStory || isDoorOpen}
                      title="تقديم 10 ثوانٍ"
                      className="w-7 h-7 rounded-full border border-white/40 hover:border-white bg-white/5 hover:bg-white/15 active:scale-90 flex items-center justify-center text-white font-mono text-[10px] font-bold transition-all shadow-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +10
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={cycleSpeed}
                      disabled={!currentStory || isDoorOpen}
                      title={`سرعة الصوت: ${playbackRate}x`}
                      className="px-1.5 py-0.5 rounded-full border border-white/40 hover:border-white bg-white/5 hover:bg-white/15 text-white font-mono text-[10px] font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {playbackRate}x
                    </button>

                    <button
                      onClick={() => setIsLooping(!isLooping)}
                      disabled={!currentStory || isDoorOpen}
                      title={isLooping ? "تكرار الشريط: مفعل" : "تكرار الشريط: معطل"}
                      className={`p-1 rounded-full transition-all cursor-pointer disabled:opacity-30 ${
                        isLooping ? 'text-amber-400 bg-white/20 border border-amber-400/50' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* 2. BOTTOM CARD: COMPACT QUIZ PRINTER • THERMAL TAPE */}
          {/* Scaled down so the thermal receipt paper NEVER exceeds the bottom boundary! */}
          {!printerDismissed && (
            <div className="w-full rounded-[1.5rem] bg-[#161a22] border border-stone-800/90 shadow-2xl p-3 sm:p-3.5 relative flex flex-col overflow-hidden backdrop-blur-md">
              <SmokyAtmosphere />

              <div className="relative z-10 flex flex-col gap-2">
                {/* Header: Close 'X' and 'QUIZ PRINTER • THERMAL TAPE' label */}
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10.5px] font-black arabic-font">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-400" />
                    <span>جاهز للإجابة</span>
                  </div>

                  <span className="font-mono text-[10px] tracking-widest text-stone-300 uppercase font-black">
                    QUIZ PRINTER • THERMAL TAPE
                  </span>

                  <button
                    onClick={() => setPrinterDismissed(true)}
                    className="text-stone-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors"
                    title="تصغير الطابعة"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Compact Thermal Receipt Paper (Fits strictly within page, no scrolling needed!) */}
                <div className="w-full bg-[#fcfbf7] border-x-2 border-stone-300 rounded-t-sm shadow-md p-2.5 font-mono text-stone-900 max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-400/50 scrollbar-track-transparent">
                  {/* Single Line Header */}
                  <div className="text-center border-b border-dashed border-stone-400 pb-1 mb-1.5">
                    <span className="font-mono text-[9px] font-black text-stone-800">
                      *** فحص استيعاب: {currentStory?.titleAr || 'الراعي والأسد الوفي'} ***
                    </span>
                  </div>

                  {/* 1 Focused Question Derived Strictly from Text */}
                  {questions.length > 0 && (
                    <div className="space-y-1.5 text-right" dir="rtl">
                      <p className="text-[11px] font-black text-stone-950 arabic-font leading-tight">
                        1. {questions[0].question}
                      </p>

                      <div className="space-y-1">
                        {questions[0].options.map((opt, optIdx) => {
                          const isSelected = quizAnswers[0] === optIdx;
                          const isCorrect = questions[0].correctIndex === optIdx;

                          let optStyle = 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300';
                          if (quizSubmitted) {
                            if (isCorrect) {
                              optStyle = 'bg-emerald-100 text-emerald-950 font-black border border-emerald-500';
                            } else if (isSelected && !isCorrect) {
                              optStyle = 'bg-rose-100 text-rose-950 line-through border border-rose-400';
                            }
                          } else if (isSelected) {
                            optStyle = 'bg-stone-900 text-white font-black border border-stone-900';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={quizSubmitted}
                              onClick={() => handleQuizAnswer(0, optIdx)}
                              className={`w-full text-right py-1 px-2 rounded text-[10px] arabic-font transition-all flex items-center justify-between cursor-pointer leading-tight ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && <Check className="w-3 h-3 text-emerald-700 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Submission / Score Row */}
                  <div className="pt-1.5 text-center mt-1 border-t border-dashed border-stone-300">
                    {!quizSubmitted ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={quizAnswers[0] === undefined}
                        className="w-full py-1 bg-stone-900 hover:bg-black disabled:bg-stone-300 disabled:text-stone-500 text-white rounded font-mono text-[10px] font-black transition-all uppercase cursor-pointer"
                      >
                        [ اعتماد الإجابة ]
                      </button>
                    ) : (
                      <div className="flex items-center justify-between px-1">
                        <span className="font-mono text-[10px] font-black text-stone-900">
                          النتيجة: {quizScore} / 1
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setQuizSubmitted(false);
                              setQuizAnswers({});
                            }}
                            className="px-2 py-0.5 bg-stone-200 text-stone-800 hover:bg-stone-300 rounded text-[9px] font-mono font-bold cursor-pointer"
                          >
                            [ إعادة ]
                          </button>
                          <button
                            onClick={() => setPrinterDismissed(true)}
                            className="px-2 py-0.5 bg-stone-900 text-white hover:bg-black rounded text-[9px] font-mono font-bold cursor-pointer"
                          >
                            [ تم ]
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* MINIMAL ENGLISH TRANSLATION POPUP */}
      <AnimatePresence>
        {wordTranslation && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#faf6ee] w-full max-w-xs rounded-2xl p-5 border-2 border-stone-300 text-stone-900 shadow-2xl text-center relative"
            >
              <button
                onClick={() => setWordTranslation(null)}
                className="absolute top-3 left-3 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-2xl font-black text-stone-950 arabic-font mb-1">
                {wordTranslation.arabic}
              </div>

              <div className="text-base font-bold text-amber-900 font-sans tracking-wide my-2">
                {wordTranslation.english}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-200">
                <button
                  onClick={() => {
                    setWordTranslation(null);
                    if (audioRef.current && !isDoorOpen) {
                      audioRef.current.play().catch(() => {});
                      setIsPlaying(true);
                    }
                  }}
                  className="flex-1 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all arabic-font cursor-pointer"
                >
                  متابعة الاستماع ▶
                </button>
                <button
                  onClick={() => setWordTranslation(null)}
                  className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold arabic-font cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
