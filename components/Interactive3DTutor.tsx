import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Mic, Sparkles, MessageCircle, Smile, Zap, Play, VolumeX } from 'lucide-react';
import { CountryTutorAvatar } from './CountryTutorAvatar';

interface TutorCharacter {
  nameAr: string;
  nameEn: string;
  clothingAr?: string;
  clothingEn?: string;
  image: string;
}

interface Interactive3DTutorProps {
  countryId?: string;
  character: TutorCharacter;
  gender: 'male' | 'female';
  isSelected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isLoading: boolean;
  audioLevel?: number;
  countryNameAr: string;
  countryNameEn: string;
  dialectName: string;
  currentSpeechText?: string;
  lang: 'ar' | 'en';
  onSelect: () => void;
  onQuickTalk?: () => void;
  onStartLive?: () => void;
}

export const Interactive3DTutor: React.FC<Interactive3DTutorProps> = ({
  countryId = 'saudi',
  character,
  gender,
  isSelected,
  isSpeaking,
  isListening,
  isLoading,
  audioLevel = 0,
  countryNameAr,
  countryNameEn,
  dialectName,
  currentSpeechText,
  lang,
  onSelect,
  onQuickTalk,
  onStartLive
}) => {
  // Eye blinking state machine
  const [isBlinking, setIsBlinking] = React.useState(false);
  const [reactionState, setReactionState] = React.useState<'idle' | 'happy' | 'nod' | 'greeting'>('idle');

  // Periodic natural blinking
  React.useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
      const nextInterval = 2500 + Math.random() * 3500;
      blinkTimeout = setTimeout(triggerBlink, nextInterval);
    };
    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Listen to audio input level to trigger subtle micro-nods when student speaks
  React.useEffect(() => {
    if (isListening && audioLevel > 0.08) {
      setReactionState('nod');
      const timer = setTimeout(() => setReactionState('idle'), 600);
      return () => clearTimeout(timer);
    }
  }, [isListening, audioLevel]);

  // Handle click on character
  const handleCharacterClick = () => {
    if (!isSelected) {
      onSelect();
    } else if (onQuickTalk) {
      setReactionState('greeting');
      onQuickTalk();
      setTimeout(() => setReactionState('idle'), 1500);
    }
  };

  // Compute 3D procedural head & body animation values based on state
  const getAnimationVariants = (): any => {
    if (isSpeaking) {
      return {
        y: [0, -7, 0, -4, 0],
        rotateZ: [-1, 1.2, -0.8, 1, 0],
        rotateX: [0, 2, 0, 3, 0],
        scale: [1.18, 1.22, 1.19, 1.23, 1.18],
        transition: { duration: 0.65, repeat: Infinity, ease: 'easeInOut' as const }
      };
    }
    if (isListening) {
      return {
        y: [0, 4, 1, 4, 0],
        rotateZ: [-2, -1, -2.5, -1],
        rotateX: [4, 6, 4],
        scale: 1.17,
        transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const }
      };
    }
    if (isLoading) {
      return {
        y: [0, -3, 0],
        rotateZ: [2, 3.5, 2],
        rotateX: [-2, 0, -2],
        scale: 1.16,
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const }
      };
    }
    if (reactionState === 'happy' || reactionState === 'greeting') {
      return {
        y: [0, -10, 0, -5, 0],
        scale: [1.18, 1.24, 1.18],
        rotateZ: [-1.5, 1.5, 0],
        transition: { duration: 0.8, ease: 'easeOut' as const }
      };
    }
    // Natural Idle breathing
    return {
      y: [0, -3, 0],
      rotateZ: [-0.5, 0.5, -0.5],
      rotateX: [0, 1, 0],
      scale: isSelected ? 1.16 : 0.88,
      transition: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' as const }
    };
  };

  return (
    <motion.div
      layout
      onClick={handleCharacterClick}
      className={`relative flex flex-col items-center cursor-pointer select-none transition-all duration-300 ${
        isSelected ? 'z-20' : 'z-10'
      }`}
    >
      {/* Dynamic Status & Floating Speech Reaction Badge */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="absolute -top-6 sm:-top-7 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/95 text-white text-[10px] font-black shadow-2xl backdrop-blur-md border border-white/20 whitespace-nowrap arabic-font pointer-events-none"
          >
            {isSpeaking ? (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span className="text-blue-300 font-bold">
                  {lang === 'ar' ? 'يتحدث بلهجته الآن...' : 'Speaking dialect...'}
                </span>
                <Volume2 size={12} className="text-blue-400 animate-pulse" />
              </>
            ) : isListening ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-300 font-bold">
                  {lang === 'ar' ? 'يستمع إليك باهتمام...' : 'Listening attentively...'}
                </span>
                <Mic size={12} className="text-emerald-400" />
              </>
            ) : isLoading ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-300 font-bold">
                  {lang === 'ar' ? 'يفكر بالرد المناسب...' : 'Thinking of response...'}
                </span>
                <Sparkles size={12} className="text-amber-400 animate-spin" />
              </>
            ) : (
              <div className="flex items-center gap-1 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>{lang === 'ar' ? 'معلمك الافتراضي المتفاعل' : 'Interactive Tutor'}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dialogue Balloon when Speaking with quick voice play */}
      <AnimatePresence>
        {isSelected && isSpeaking && currentSpeechText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: -16 }}
            exit={{ opacity: 0, scale: 0.8, y: -5 }}
            className="absolute -top-16 z-40 max-w-[200px] sm:max-w-[240px] px-3 py-2 bg-white/95 text-slate-900 text-[11px] font-black rounded-2xl rounded-br-none shadow-xl border border-blue-200/80 backdrop-blur-md arabic-font text-center line-clamp-2"
          >
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-0.5">
              <Sparkles size={10} />
              <span className="text-[9px] uppercase tracking-wider">{character.nameAr}</span>
            </div>
            <span>{currentSpeechText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Animated Standee Figure with Cutout, Physics & Rigged Facial Layers */}
      <motion.div
        animate={getAnimationVariants()}
        whileHover={!isSelected ? { scale: 0.95, opacity: 0.92 } : { scale: 1.19 }}
        whileTap={{ scale: 1.14 }}
        className="relative flex items-end justify-center perspective-[1000px]"
        style={{
          opacity: isSelected ? 1 : 0.68,
          filter: isSelected
            ? 'drop-shadow(0 25px 30px rgba(15,23,42,0.42)) drop-shadow(0 0 20px rgba(59,130,246,0.25))'
            : 'drop-shadow(0 10px 14px rgba(15,23,42,0.18))'
        }}
      >
        {/* Character Visual Wrapper */}
        <div className="relative w-36 sm:w-48 h-44 sm:h-56 overflow-visible flex items-end justify-center">
          
          {/* Main 3D Avatar Image & Vector Hybrid matching authentic national character */}
          <CountryTutorAvatar
            countryId={countryId}
            gender={gender}
            isSpeaking={isSelected && isSpeaking}
            isListening={isSelected && isListening}
            imageSrc={character.image}
            nameAr={character.nameAr}
            className="max-h-full w-auto object-contain object-bottom pointer-events-none select-none transition-transform duration-300"
          />

          {/* Procedural Reactive 3D Animated Talking Mouth (Lip-Sync Overlay) */}
          {isSelected && isSpeaking && (
            <motion.div
              animate={{
                scaleY: [1, 2.8, 1.4, 3.2, 1],
                scaleX: [1, 1.25, 0.95, 1.3, 1],
                opacity: [0.85, 1, 0.9, 1, 0.85]
              }}
              transition={{
                duration: 0.16,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute top-[34%] sm:top-[33%] left-1/2 -translate-x-1/2 w-4 sm:w-5 h-2 rounded-full bg-gradient-to-r from-red-600/70 via-rose-700/80 to-red-600/70 blur-[1px] shadow-[0_0_8px_rgba(239,68,68,0.4)] pointer-events-none"
            >
              {/* Inner mouth cavity & teeth gleam */}
              <div className="w-2.5 h-0.5 bg-white/70 rounded-full mx-auto mt-0.5" />
            </motion.div>
          )}

          {/* Procedural Natural Eye Blinking Layer */}
          {isSelected && isBlinking && (
            <div className="absolute top-[26%] sm:top-[25%] left-1/2 -translate-x-1/2 w-10 sm:w-12 h-1 bg-amber-950/40 rounded-full blur-[0.5px] pointer-events-none" />
          )}

          {/* Procedural Audio Equalizer Bar floating above feet when speaking */}
          {isSelected && isSpeaking && (
            <div className="absolute -bottom-1 z-30 flex items-end justify-center gap-1 bg-slate-950/90 px-3 py-1 rounded-full backdrop-blur-md border border-blue-400/30 shadow-lg pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ height: [4, 15, 6, 18, 4] }}
                  transition={{ duration: 0.3 + i * 0.08, repeat: Infinity }}
                  className="w-1 bg-gradient-to-t from-blue-500 to-cyan-300 rounded-full"
                />
              ))}
            </div>
          )}

          {/* Attentive Soundwaves around the avatar when student is speaking */}
          {isSelected && isListening && (
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-emerald-400/50 pointer-events-none"
            />
          )}

          {/* Thinking shimmer halo when processing AI answer */}
          {isSelected && isLoading && (
            <motion.div
              animate={{ rotate: 360, opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute top-2 w-14 h-14 rounded-full border-2 border-dashed border-amber-400/60 pointer-events-none"
            />
          )}
        </div>
      </motion.div>

      {/* 3D Multi-layer Realistic Ground Shadow (Frameless Ambient Occlusion) */}
      <div className="relative -mt-2 flex items-center justify-center pointer-events-none">
        {isSelected ? (
          <div className="relative flex items-center justify-center">
            {/* Soft ambient ground diffusion */}
            <motion.div
              animate={{
                scale: isSpeaking ? [1, 1.18, 1] : [1, 1.06, 1],
                opacity: isSpeaking ? [0.7, 0.95, 0.7] : [0.6, 0.75, 0.6]
              }}
              transition={{ duration: isSpeaking ? 0.65 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-32 sm:w-44 h-5 rounded-full bg-blue-500/25 blur-md"
            />
            {/* Contact body shadow */}
            <div className="absolute w-24 sm:w-32 h-3 rounded-full bg-slate-950/40 blur-xs" />
            {/* Core foot contact occlusion */}
            <div className="absolute w-14 sm:w-18 h-1.5 rounded-full bg-slate-950/70 blur-[1px]" />
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            <div className="w-20 sm:w-26 h-2.5 rounded-full bg-slate-900/25 blur-xs" />
            <div className="absolute w-12 sm:w-16 h-1 rounded-full bg-slate-950/40 blur-[1px]" />
          </div>
        )}
      </div>

      {/* Character Name & Status Plate (Below Figure) */}
      <div className="mt-2.5 text-center flex flex-col items-center">
        {isSelected ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-xs arabic-font shadow-lg shadow-blue-500/30 ring-2 ring-white">
              <span>{gender === 'male' ? '👨' : '👩'}</span>
              <span>{character.nameAr}</span>
              <span className="text-[9.5px] opacity-80 font-sans" dir="ltr">
                ({character.nameEn})
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9.5px] font-black text-blue-600 arabic-font">
                {dialectName} • {lang === 'ar' ? 'معلمك النشط' : 'Active Tutor'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center opacity-75 hover:opacity-100 transition-opacity">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-700 font-bold text-[11px] arabic-font transition-colors shadow-xs">
              <span>{character.nameAr}</span>
              <span className="text-[8.5px] opacity-60" dir="ltr">
                ({character.nameEn})
              </span>
            </div>
            <span className="text-[8.5px] font-bold text-slate-400 mt-0.5 arabic-font">
              {lang === 'ar' ? 'انقر لتعيينه معلماً' : 'Click to select tutor'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
