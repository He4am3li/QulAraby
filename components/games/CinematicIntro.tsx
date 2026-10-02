import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Play, Shield, Flame, 
  ChevronLeft, Star, Volume2, ArrowLeft, Zap, Award
} from 'lucide-react';
import stadiumPanorama from '/src/assets/images/champions_stadium_panorama_1790675976521.jpg';
import eaFcSplash from '/src/assets/images/ea_fc_cinematic_splash_1790707279895.jpg';
import championsBallTexture from '/src/assets/images/champions_ball_texture_1790676004465.jpg';
import messiImg from '/src/assets/images/messi_argentina_1790692012141.jpg';
import mbappeImg from '/src/assets/images/mbappe_france_1790692032679.jpg';
import ronaldoImg from '/src/assets/images/ronaldo_madrid_1790691903231.jpg';

interface CinematicIntroProps {
  onStart: () => void;
  onBack?: () => void;
  audio?: any;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onStart, onBack, audio }) => {
  const [currentStarIdx, setCurrentStarIdx] = useState(0);

  const starPlayers = [
    { name: 'ليونيل ميسي', team: 'الأرجنتين', number: 10, img: messiImg, color: '#38bdf8' },
    { name: 'كيليان مبابي', team: 'ريال مدريد / فرنسا', number: 9, img: mbappeImg, color: '#f59e0b' },
    { name: 'كريستيانو رونالدو', team: 'الأساطير', number: 7, img: ronaldoImg, color: '#ef4444' }
  ];

  // Rotate star showcase every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStarIdx(prev => (prev + 1) % starPlayers.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [starPlayers.length]);

  const handleLaunch = () => {
    if (audio) {
      audio.init();
      audio.playWhistle();
      audio.startStadiumAmbience();
    }
    onStart();
  };

  return (
    <div className="relative w-full min-h-screen bg-[#020617] text-white overflow-hidden flex flex-col justify-between select-none font-sans" dir="rtl">
      
      {/* 1. Cinematic Background with Animated Gradients & Floodlights */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          src={eaFcSplash} 
          alt="EA Sports FC 2026 Cinematic Title" 
          initial={{ scale: 1.12, filter: 'brightness(0.65) blur(3px)' }}
          animate={{ scale: 1.02, filter: 'brightness(0.85) blur(0px)' }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
          className="w-full h-full object-cover object-center"
        />

        {/* Dynamic Animated Gradient & Spotlight Layers */}
        <motion.div 
          animate={{
            opacity: [0.45, 0.65, 0.45],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-b from-[#020617]/70 via-[#030d22]/30 to-[#020617]/90" 
        />

        {/* Volumetric Stadium Floodlights */}
        <motion.div 
          animate={{
            x: [-20, 20, -20],
            opacity: [0.25, 0.45, 0.25]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[140px] pointer-events-none" 
        />
        
        <motion.div 
          animate={{
            x: [20, -20, 20],
            opacity: [0.25, 0.5, 0.25]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[140px] pointer-events-none" 
        />
        
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent pointer-events-none" />
      </div>

      {/* 2. Top Header Navigation */}
      <motion.div 
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-20 p-4 md:p-6 flex items-center justify-between max-w-7xl mx-auto w-full"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-[0_0_20px_rgba(245,158,11,0.6)]">
            <Trophy size={22} />
          </div>
          <div>
            <div className="text-xs font-black text-amber-300 uppercase tracking-widest">الموسم الذهبي 2026</div>
            <div className="text-sm font-black text-white">كأس السوبر اللغوي للجامعات والمدارس</div>
          </div>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/20 text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg backdrop-blur-md"
          >
            <ArrowLeft size={14} />
            <span>العودة للمنصة</span>
          </button>
        )}
      </motion.div>

      {/* 3. Hero Centerpiece: Animated Trophy, Title & Dynamic Roster Showcase */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 max-w-5xl mx-auto w-full text-center my-auto">
        
        {/* Floating Tournament Badge */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, type: 'spring', bounce: 0.4 }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-slate-950/80 border-2 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.5)] backdrop-blur-xl mb-4"
        >
          <Trophy size={16} className="text-amber-400" />
          <span className="text-xs md:text-sm font-black text-amber-300 tracking-wider">
            البطولة الكروية الأضخم • EA FC 2026
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </motion.div>

        {/* Main Grand Title: Massive 3D metallic gold and glowing neon-cyan Arabic title */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-2 mb-4"
        >
          <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 drop-shadow-[0_10px_35px_rgba(245,158,11,0.6)] tracking-tight">
            دوري أبطال الضاد 2026
          </h1>
          <p className="text-base md:text-2xl font-bold text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] tracking-wide">
            محاكاة تفاعلية لركلات الترجيح
          </p>
        </motion.div>

        {/* Star Player Holographic Spotlight Card */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative max-w-md w-full bg-slate-950/85 backdrop-blur-2xl border-2 border-cyan-400/60 rounded-3xl p-5 shadow-[0_0_50px_rgba(6,182,212,0.35)] my-4"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStarIdx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-4 text-right"
            >
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-slate-900 shrink-0">
                <img 
                  src={starPlayers[currentStarIdx].img} 
                  alt={starPlayers[currentStarIdx].name} 
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute top-1 left-1 bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded">
                  #{starPlayers[currentStarIdx].number}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                  <Star size={13} fill="currentColor" />
                  <span>نجم الجولة المعتمد</span>
                </div>
                <h3 className="text-lg font-black text-white truncate">{starPlayers[currentStarIdx].name}</h3>
                <p className="text-xs text-cyan-300 font-bold truncate">{starPlayers[currentStarIdx].team}</p>
                <div className="text-[10px] text-slate-400 mt-0.5">جاهز للتسديد في المقص الـ 90 عند إجابتك الصحيحة</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* 3 Interactive Feature Pillars */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl w-full my-4"
        >
          <div className="bg-slate-950/70 border border-white/15 backdrop-blur-xl rounded-2xl p-3 text-right flex items-center gap-3 shadow-md hover:border-cyan-400/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/30">
              ⚽
            </div>
            <div>
              <div className="text-xs font-black text-white">ركلات ترجيح 3D حقيقية</div>
              <div className="text-[10px] text-slate-400">ملعب كامل بحركة اللاعب والكرة والجمهور</div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-white/15 backdrop-blur-xl rounded-2xl p-3 text-right flex items-center gap-3 shadow-md hover:border-amber-400/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
              👑
            </div>
            <div>
              <div className="text-xs font-black text-white">11 نادياً ومنتخباً عالمياً</div>
              <div className="text-[10px] text-slate-400">ريال مدريد، برشلونة، الأرجنتين، الأهلي، الهلال</div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-white/15 backdrop-blur-xl rounded-2xl p-3 text-right flex items-center gap-3 shadow-md hover:border-emerald-400/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
              💡
            </div>
            <div>
              <div className="text-xs font-black text-white">تحدي لغوي تنافسي مشوق</div>
              <div className="text-[10px] text-slate-400">سدد في زاوية الإعراب الصحيحة لهزيمة أوتشوا</div>
            </div>
          </div>
        </motion.div>

        {/* Grand CTA Launch Button */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleLaunch}
            className="px-12 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-base md:text-xl shadow-[0_0_45px_rgba(245,158,11,0.7)] flex items-center justify-center gap-3 cursor-pointer transition-all border-2 border-amber-200"
          >
            <div className="w-8 h-8 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shadow-inner">
              <Play size={18} fill="#f59e0b" className="text-amber-400 ml-0.5" />
            </div>
            <span className="tracking-wide">دخول الميدان • PRESS TO START</span>
            <ChevronLeft size={22} className="text-slate-900" />
          </motion.button>
        </motion.div>

      </div>

      {/* 4. Bottom Footer Info */}
      <div className="relative z-20 p-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-3 border-t border-white/10 backdrop-blur-md bg-slate-950/40">
        <span>🏆 منصة «قُل» التعليمية التفاعلية</span>
        <span>•</span>
        <span>محرك ثلاثي الأبعاد WebGL / Three.js</span>
        <span>•</span>
        <span>تعليق صوتي عربي حماسي</span>
      </div>

    </div>
  );
};
