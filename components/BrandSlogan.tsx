import React from 'react';
import { motion } from 'framer-motion';

/**
 * The single source of truth for QUL's brand slogan.
 * Shared by the student/teacher home and the admin/school top bar.
 */
export const BrandSlogan: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center group">
    <div className="relative">
      <motion.div
        aria-hidden="true"
        className="absolute -inset-8 rounded-full bg-gradient-to-r from-blue-400/25 to-emerald-400/25 blur-[40px]"
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.85, 1.1, 0.85] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group cursor-default"
      >
        <motion.div
          animate={{
            scale: [1, 1.015, 1],
            boxShadow: [
              '0 15px 45px -12px rgba(0,0,0,0.35)',
              '0 25px 70px -18px rgba(0,0,0,0.45)',
              '0 15px 45px -12px rgba(0,0,0,0.35)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex flex-col items-center gap-1 overflow-hidden rounded-[1.8rem] border border-white/20 border-b-2 border-b-white/5 bg-white/10 px-6 py-2 shadow-2xl backdrop-blur-3xl transition-all md:gap-1.5 md:px-10 md:py-3.5"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent"
            animate={{ translateX: ['200%', '-200%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
          />
          <span className="relative z-10 select-none whitespace-nowrap text-[8px] font-black uppercase tracking-[0.3em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] md:text-[10px] md:tracking-[0.4em]">
            Learn Arabic until you can say
          </span>
          <div className="relative z-10 leading-none">
            <span className="handwritten-font select-none text-2xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] md:text-3xl">
              أنا عربي
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </div>
);
