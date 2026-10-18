
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AvatarState = 'idle' | 'happy' | 'thinking' | 'sad' | 'encouraging';

interface AvatarProps {
  state: AvatarState;
  message?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ state, message, className = '' }) => {
  const getEmoji = () => {
    switch (state) {
      case 'happy': return '🦉'; // Wise Owl
      case 'thinking': return '🧐';
      case 'sad': return '😟';
      case 'encouraging': return '💪';
      default: return '🦉';
    }
  };

  const getAnimation = () => {
    switch (state) {
      case 'happy': return { y: [0, -20, 0], rotate: [0, 10, -10, 0] };
      case 'thinking': return { rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] };
      case 'encouraging': return { scale: [1, 1.2, 1], x: [0, 5, -5, 0] };
      default: return { y: [0, -5, 0] };
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <motion.div
        animate={getAnimation()}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-7xl drop-shadow-2xl filter grayscale-0"
      >
        {getEmoji()}
      </motion.div>
      
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className="relative bg-white px-6 py-3 rounded-2xl shadow-xl border-2 border-blue-100 max-w-[200px] text-center"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-2 border-l-2 border-blue-100 rotate-45" />
            <p className="text-sm font-black text-slate-800 arabic-font leading-relaxed">
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
