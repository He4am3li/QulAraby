import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX,
  RotateCcw, Check, Disc, X,
  Download, Loader2, CheckCircle2,
  ChevronDown, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORY_CASSETTES, StoryCassette } from '../src/data/storyCassettes';
import { SHELF_TAPES, ShelfTape, getStoryForShelfTape, getShelfTapesForLevel } from '../src/data/shelfCassettes';
import { getStoryQuestions, StoryQuestion } from '../src/data/storyQuestions';
import { ARABIC_ENGLISH_DICT } from '../src/data/arabicEnglishDict';

interface CassettePlayerProps {
  audioSrc?: string;
  trackTitle?: string;
  story?: StoryCassette;
  allStories?: StoryCassette[];
  selectedLevel?: string;
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
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
        <div className="bg-stone-950/95 rounded py-0.5 px-1.5 border border-black/80 flex items-center justify-center gap-3 my-auto shadow-inner">
          <div
            className="w-3.5 h-3.5 rounded-full bg-stone-200 border border-stone-400 flex items-center justify-center relative shadow-xs"
            style={{
              transform: isActive && isPlaying ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.5s linear'
            }}
          >
            <div className="w-1 h-1 rounded-full bg-stone-950" />
          </div>

          <div className="w-5 h-0.5 bg-amber-950/90 rounded" />

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
      style={{ minHeight: '190px', perspective: '900px', overflow: 'visible' }}
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
        <div className="flex items-center justify-center gap-8 sm:gap-10 my-auto">
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
          rotateX: isOpen ? -72 : 0,
          y: isOpen ? 22 : 0,
          scaleY: isOpen ? 0.94 : 1,
        }}
        transition={{ type: "spring", stiffness: 145, damping: 23, mass: 0.9 }}
        style={{ transformOrigin: "bottom center" }}
        className="w-full h-[155px] rounded-xl border-2 border-stone-600/90 bg-stone-900/50 backdrop-blur-xs shadow-2xl relative flex flex-col justify-between p-2 z-20 pointer-events-none"
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

      {/* Tape settles onto the capstan hubs while the door remains open. */}
      <AnimatePresence>
        {isInserting && flyingTape && (
          <motion.div
            initial={{ opacity: 0, scale: 1.06, y: -18, rotateX: -9 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            className={`absolute inset-x-5 top-9 h-[112px] rounded-lg border-2 border-stone-700 shadow-[0_12px_25px_rgba(0,0,0,0.65)] bg-gradient-to-r ${flyingTape.tapeColor} p-2 z-10 flex flex-col justify-between`}
          >
            <div className="flex justify-between text-[8px] font-bold text-white"><span>{flyingTape.brand}</span><span>{flyingTape.cassetteNumber}</span></div>
            <div className="rounded bg-black/80 h-7 flex justify-center gap-8 items-center">
              <div className="w-5 h-5 rounded-full bg-stone-200 border-[3px] border-stone-500" />
              <div className="w-5 h-5 rounded-full bg-stone-200 border-[3px] border-stone-500" />
            </div>
            <div className="text-center text-white text-[10px] font-black arabic-font">{flyingTape.titleAr}</div>
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
  selectedLevel,
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
  const [isSeated, setIsSeated] = useState(false);
  const [reelsPrimed, setReelsPrimed] = useState(false);
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
  const [listeningStage, setListeningStage] = useState<'first' | 'questions' | 'second' | 'final'>('first');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [firstAttempt, setFirstAttempt] = useState<Record<number, number>>({});
  const [printerDismissed, setPrinterDismissed] = useState<boolean>(false);
  const visibleTapes = useMemo(() => getShelfTapesForLevel(selectedLevel), [selectedLevel]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const singleLineTickerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // The selected tape is authoritative: never let a parent-provided audioSrc
  // play a different recording under the selected story's title/transcript.
  const effectiveAudioSrc = currentStory?.audioSrc || (!currentStory ? audioSrc : '') || '';

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
      setListeningStage('first');
      setQuestionIndex(0);
      setFirstAttempt({});
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

  // Prefer measured word boundaries from the audio when alignment data is available.
  // A duration-weighted estimate is retained only as a fallback for unaligned stories.
  const alignedWords = useMemo(() => {
    const alignment = currentStory?.wordTimings;
    if (!alignment || alignment.length !== timedWords.length) return timedWords;
    if (!alignment.every((w, i) => Number.isFinite(w.startTime) && Number.isFinite(w.endTime) && w.endTime > w.startTime && (i === 0 || w.startTime >= alignment[i - 1].startTime))) return timedWords;
    return timedWords.map((word, i) => ({ ...word, startTime: alignment[i].startTime, endTime: alignment[i].endTime }));
  }, [currentStory, timedWords]);

  const hasVerifiedWordTimings = Boolean(currentStory?.wordTimings &&
    currentStory.wordTimings.length === timedWords.length && timedWords.length > 0 &&
    currentStory.wordTimings.every((w, i, timings) => Number.isFinite(w.startTime) &&
      Number.isFinite(w.endTime) && w.endTime > w.startTime &&
      (i === 0 || w.startTime >= timings[i - 1].startTime)));
  const isJuhaStory = Boolean(currentStory?.id.startsWith('juha-'));

  const activeWordIndex = useMemo(() => {
    if (isJuhaStory && !hasVerifiedWordTimings) return -1;
    if (!alignedWords.length) return -1;
    let low = 0;
    let high = alignedWords.length - 1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      const word = alignedWords[mid];
      if (currentTime < word.startTime) high = mid - 1;
      else if (currentTime >= word.endTime) low = mid + 1;
      else return mid;
    }
    return -1; // Do not highlight words during actual pauses or silence.
  }, [currentTime, alignedWords, isJuhaStory, hasVerifiedWordTimings]);

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
  const chamberTargetRef = useRef<HTMLDivElement>(null);
  const insertionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insertionBusyRef = useRef(false);
  const [flight, setFlight] = useState<{ tape: ShelfTape; x: number; y: number; width: number; height: number; dx: number; dy: number; scale: number } | null>(null);

  useEffect(() => () => {
    if (insertionTimerRef.current) clearTimeout(insertionTimerRef.current);
  }, []);

  const handleSelectShelfTape = (shelfTape: ShelfTape, event: React.MouseEvent<HTMLButtonElement>) => {
    if (insertionBusyRef.current) return;
    const selected = getStoryForShelfTape(shelfTape);
    if (!selected) return;

    if (currentStory && currentStory.id === selected.id && activeTapeId === shelfTape.id && !isDoorOpen) {
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
    setIsSeated(false);
    setReelsPrimed(false);

    const origin = event.currentTarget.getBoundingClientRect();
    const destination = chamberTargetRef.current?.getBoundingClientRect();
    const destinationWidth = destination ? Math.min(destination.width - 28, origin.width * 2.1) : origin.width;
    const scale = destinationWidth / origin.width;
    const dx = destination ? destination.left + (destination.width - destinationWidth) / 2 - origin.left : 0;
    const dy = destination ? destination.top + (destination.height - origin.height * scale) / 2 - origin.top : 0;
    insertionBusyRef.current = true;
    setFlight({ tape: shelfTape, x: origin.left, y: origin.top, width: origin.width, height: origin.height, dx, dy, scale });
    // Open door if not already open
    setIsDoorOpen(true);
    setFlyingTape(shelfTape);
    setIsInserting(true);

    // Allow the tape to lift from the shelf before its curved flight.
    // Phase 1: cassette flies into the open, outward-hinged deck.
    insertionTimerRef.current = setTimeout(() => {
      setFlight(null);
      setIsSeated(true);
      setActiveTapeId(shelfTape.id);
      setCurrentStory(selected);
      setCurrentTime(0);
      setQuizSubmitted(false);
      setQuizAnswers({});
      setListeningStage('first');
      setQuestionIndex(0);
      setFirstAttempt({});
      setPrinterDismissed(false);
      if (onStoryChange) onStoryChange(selected);

      // Phase 2: leave the tape visible in the bay before the door closes over it.
      insertionTimerRef.current = setTimeout(() => {
        setIsDoorOpen(false);
        setIsInserting(false);
        setFlyingTape(null);

        // Phase 3: engage the spindles, then start playback only after the latch closes.
        insertionTimerRef.current = setTimeout(() => {
          setReelsPrimed(true);
          insertionTimerRef.current = setTimeout(() => {
            insertionBusyRef.current = false;
            if (audioRef.current) {
              audioRef.current.load();
              audioRef.current.currentTime = 0;
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          }, 450);
        }, 520);
      }, 440);
    }, 1590);
  };

  const handleEjectDoor = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setReelsPrimed(false);
    setIsDoorOpen(true);
  };

  const handleWordClick = (word: TimedWord) => {
    if (audioRef.current && (!isJuhaStory || hasVerifiedWordTimings)) {
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
    const score = questions.slice(0, 5).filter((q, i) => quizAnswers[i] === q.correctIndex).length;
    setQuizScore(score);
    setQuizSubmitted(true);
    setListeningStage('final');
  };

  const progressRatio = duration > 0 ? currentTime / duration : 0;

  return (
    <div className={`w-full max-w-[1500px] mx-auto flex flex-col select-none relative ${className}`} dir="rtl">
      {/* Hidden audio element */}
      <audio
        key={effectiveAudioSrc}
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
            setReelsPrimed(false);
            if (listeningStage === 'first') setListeningStage('questions');
            else if (listeningStage === 'second') setListeningStage('final');
          }
        }}
      />

      {/* Cinematic 3D cassette pickup, bezier-like arc, mechanical alignment and seating. */}
      <AnimatePresence>
        {flight && (
          <motion.div
            key={flight.tape.id}
            initial={{ x: 0, y: 0, scale: 1, rotateZ: 0, rotateY: 0, rotateX: 0, opacity: 1 }}
            animate={{
              x: [0, 0, flight.dx * 0.16, flight.dx * 0.52, flight.dx * 0.83, flight.dx, flight.dx],
              y: [0, -16, -58, Math.min(-85, flight.dy * 0.45 - 65), flight.dy - 35, flight.dy - 8, flight.dy],
              scale: [1, 1.07, 1.15, 1.23, flight.scale * 1.07, flight.scale, flight.scale * 0.96],
              rotateZ: [0, -3, -11, -8, 5, 0, 0],
              rotateY: [0, -12, -24, -15, 8, 0, 0],
              rotateX: [0, 9, 17, 12, -8, 0, 0],
              opacity: [1, 1, 1, 1, 1, 1, 0.98]
            }}
            transition={{ duration: 1.57, times: [0, 0.12, 0.28, 0.53, 0.77, 0.91, 1], ease: 'easeInOut' }}
            style={{ position: 'fixed', left: flight.x, top: flight.y, width: flight.width, height: flight.height, transformOrigin: 'top left', transformStyle: 'preserve-3d', perspective: 1100, zIndex: 9999, pointerEvents: 'none', willChange: 'transform' }}
            className={`rounded-md border-2 border-stone-700 shadow-[0_25px_55px_rgba(0,0,0,0.55)] bg-gradient-to-r ${flight.tape.tapeColor} p-1.5 flex flex-col justify-between overflow-hidden`}
          >
            <div className="absolute inset-0 rounded-md border border-white/25 pointer-events-none" />
            <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-stone-300" />
            <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-stone-300" />
            <div className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full bg-stone-300" />
            <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-stone-300" />
            <div className="flex justify-between text-[7px] font-mono font-bold text-white/90 px-1 border-b border-white/15"><span>{flight.tape.brand}</span><span>{flight.tape.year}</span></div>
            <div className="rounded bg-stone-950/95 border border-black/80 flex items-center justify-center gap-8 px-2 py-1 shadow-inner">
              <div className="w-3 h-3 rounded-full border-2 border-stone-400 bg-stone-200"><div className="w-1 h-1 rounded-full bg-stone-900 m-0.5" /></div>
              <div className="h-0.5 bg-amber-950/90 flex-1 mx-2" />
              <div className="w-3 h-3 rounded-full border-2 border-stone-400 bg-stone-200"><div className="w-1 h-1 rounded-full bg-stone-900 m-0.5" /></div>
            </div>
            <div className="text-center text-white font-black arabic-font text-[9px] leading-tight truncate">{flight.tape.titleAr}</div>
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none"
              animate={{ x: ['-130%', '170%'] }}
              transition={{ duration: 0.95, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className={`grid ${selectedLevel === 'beginner' ? 'grid-cols-3 gap-x-3 gap-y-4' : 'grid-cols-4 gap-x-2 gap-y-3'}`}>
              {visibleTapes.map((tape) => (
                <ShelfCassetteItem
                  key={tape.id}
                  tape={tape}
                  isActive={activeTapeId === tape.id}
                  isPlaying={isPlaying && activeTapeId === tape.id}
                  onClick={(event) => handleSelectShelfTape(tape, event)}
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
                    <Disc className={`w-3.5 h-3.5 ${reelsPrimed ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
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
              <div ref={chamberTargetRef}>
              {isDoorOpen || !currentStory ? (
                /* Pure Mechanical Open Walkman Bay (Zero Text!) */
                <OpenWalkmanChamber
                  isOpen={isDoorOpen}
                  isInserting={isSeated && isDoorOpen}
                  flyingTape={isSeated ? flyingTape : null}
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
                    <div className="w-full bg-[#12141a] rounded-lg py-1.5 px-4 sm:px-6 border border-stone-800 shadow-inner flex items-center justify-center gap-2 relative overflow-hidden my-0.5">
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

                      <div className="flex flex-col items-center justify-center px-1 w-[44px] max-w-[16%]">
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
                      {isJuhaStory && (listeningStage === 'first' || listeningStage === 'questions') ? (
                        <p className="text-emerald-400/80 text-[11px] text-center">استمع أولًا، ثم أجب عن الأسئلة.</p>
                      ) : (
                      <div
                        ref={singleLineTickerRef}
                        className={`flex items-center justify-start gap-1 ${isJuhaStory && !hasVerifiedWordTimings ? 'overflow-x-auto' : 'overflow-x-hidden'} whitespace-nowrap scrollbar-hide select-none w-full`}
                        dir="rtl"
                      >
                        {alignedWords.map((item) => {
                          const isSpoken = item.id === activeWordIndex;
                          return (
                            <button
                              key={item.id}
                              data-spoken={isSpoken}
                              onClick={() => handleWordClick(item)}
                              title={isJuhaStory && !hasVerifiedWordTimings ? 'انقر للترجمة' : 'انقر للترجمة الفورية بالإنجليزية والاستماع'}
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
                      )}
                    </div>

                  </div>
                </motion.div>
              )}


              </div>
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
                <div className="w-full bg-[#fcfbf7] border-x-2 border-stone-300 rounded-t-sm shadow-md p-2.5 font-mono text-stone-900 min-h-[160px] max-h-[160px] overflow-hidden">
                  {/* Single Line Header */}
                  <div className="text-center border-b border-dashed border-stone-400 pb-1 mb-1.5">
                    <span className="font-mono text-[9px] font-black text-stone-800">
                      *** فحص استيعاب: {currentStory?.titleAr || 'الراعي والأسد الوفي'} ***
                    </span>
                  </div>

                  {listeningStage === 'first' ? (
                    <div className="text-center text-[11px] arabic-font py-4">استمع إلى القصة أولًا. ستظهر الأسئلة هنا بعد انتهاء التسجيل.</div>
                  ) : listeningStage === 'second' ? (
                    <div className="text-center text-[11px] arabic-font py-3">
                      الاستماع الثاني مع النص. بعد انتهاء التسجيل يمكنك مراجعة إجاباتك.
                      <button className="block mx-auto mt-2 px-3 py-1 rounded bg-stone-900 text-white" onClick={() => setListeningStage('final')}>مراجعة الأسئلة</button>
                    </div>
                  ) : questions.length ? (
                    <div className="space-y-1.5 text-right" dir="rtl">
                      <div className="flex justify-between items-center text-[9px] font-bold text-stone-600">
                        <span>{listeningStage === 'final' ? 'المراجعة النهائية' : 'اختبار الفهم الأول'}</span>
                        <span>{questionIndex + 1} / {Math.min(5, questions.length)}</span>
                        {listeningStage === 'questions' && isJuhaStory && (
                          <button type="button" onClick={() => {
                            if (!audioRef.current) return;
                            audioRef.current.currentTime = 0;
                            audioRef.current.play().then(() => { setIsPlaying(true); setReelsPrimed(true); }).catch(() => {});
                          }}>إعادة الاستماع</button>
                        )}
                      </div>
                      <p className="text-[11px] font-black text-stone-950 arabic-font leading-tight">{questions[questionIndex].question}</p>
                      <div className="space-y-1">
                        {questions[questionIndex].options.map((opt, optIdx) => (
                          <button key={optIdx} onClick={() => handleQuizAnswer(questionIndex, optIdx)}
                            disabled={quizSubmitted}
                            className={`w-full text-right py-1 px-2 rounded text-[10px] arabic-font border transition-colors ${quizSubmitted && optIdx === questions[questionIndex].correctIndex ? 'bg-emerald-100 text-emerald-950 border-emerald-600' : quizSubmitted && quizAnswers[questionIndex] === optIdx ? 'bg-red-100 text-red-950 border-red-600' : quizAnswers[questionIndex] === optIdx ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-100 text-stone-900 border-stone-300'}`}>
                            {opt}{quizSubmitted && optIdx === questions[questionIndex].correctIndex ? ' ✓' : quizSubmitted && quizAnswers[questionIndex] === optIdx ? ' ✗' : ''}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button disabled={questionIndex === 0} onClick={() => setQuestionIndex(i => i - 1)} className="text-[10px] disabled:opacity-30">السابق</button>
                        {questionIndex < Math.min(5, questions.length) - 1 ? (
                          <button disabled={quizAnswers[questionIndex] === undefined} onClick={() => setQuestionIndex(i => i + 1)} className="px-3 py-1 rounded bg-stone-900 text-white text-[10px] disabled:opacity-30">التالي</button>
                        ) : listeningStage === 'questions' ? (
                          <button disabled={questions.slice(0, 5).some((_, i) => quizAnswers[i] === undefined)} onClick={() => { setFirstAttempt({ ...quizAnswers }); setListeningStage('second'); setQuestionIndex(0); if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().then(() => { setIsPlaying(true); setReelsPrimed(true); }).catch(() => {}); } }} className="px-2 py-1 rounded bg-stone-900 text-white text-[10px]">الاستماع الثاني</button>
                        ) : !quizSubmitted ? (
                          <button disabled={questions.slice(0, 5).some((_, i) => quizAnswers[i] === undefined)} onClick={handleQuizSubmit} className="px-2 py-1 rounded bg-stone-900 text-white text-[10px] disabled:opacity-30">إنهاء وتقييم</button>
                        ) : (
                          <span className="text-[10px] font-bold">النتيجة: {quizScore} / {Math.min(5, questions.length)} · أول استماع: {questions.slice(0,5).filter((q,i) => firstAttempt[i] === q.correctIndex).length}</span>
                        )}
                      </div>
                    </div>
                  ) : <div className="text-center text-[11px] py-3">لا توجد أسئلة مرتبطة بهذا التسجيل.</div>}

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
