import React from 'react';
import { X } from 'lucide-react';

interface CalligraphyHeaderBannerProps {
  onOpenHelp?: () => void;
  onOpenGuide?: () => void;
  onOpenSavedCards?: () => void;
  onCloseStudio?: () => void;
  savedCardsCount?: number;
}

export const CalligraphyHeaderBanner: React.FC<CalligraphyHeaderBannerProps> = ({
  onCloseStudio
}) => {
  return (
    <header
      className="relative shrink-0 w-full h-24 sm:h-28 md:h-[110px] bg-[#0c0a08] border-b border-[#2d2417] overflow-hidden z-30 select-none shadow-2xl"
      dir="rtl"
    >
      {/* 1. ATMOSPHERIC BACKGROUND TEXTURE & VIGNETTE */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="w-full h-full"
          style={{
            background:
              'radial-gradient(ellipse 80% 120% at 50% 50%, #15120c 0%, #0c0a08 75%, #070605 100%)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />
      </div>

      {/* 2. RIGHT SIDE: AUTHENTIC CALLIGRAPHER DESK WORKSPACE */}
      <div className="absolute right-0 top-0 bottom-0 w-[420px] sm:w-[540px] md:w-[650px] lg:w-[780px] pointer-events-none z-10 overflow-hidden flex items-center justify-end">
        <img
          src="/calligrapher_tools_header.jpg"
          alt="أدوات الخط العربي، القصبة والمحبرة والورق المقهر"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain object-right transform scale-90 sm:scale-95 origin-right transition-transform"
          style={{
            maskImage:
              'linear-gradient(to left, rgba(0,0,0,1) 45%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage:
              'linear-gradient(to left, rgba(0,0,0,1) 45%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0c0a08]/20 to-[#0c0a08]" />
      </div>

      {/* 3. LEFT SIDE: SYMMETRICAL CALLIGRAPHER DESK WORKSPACE (MIRROR) */}
      <div className="absolute left-0 top-0 bottom-0 w-[420px] sm:w-[540px] md:w-[650px] lg:w-[780px] pointer-events-none z-10 overflow-hidden flex items-center justify-start">
        <img
          src="/calligrapher_tools_header.jpg"
          alt="أدوات الخط العربي"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain object-left transform -scale-x-100 scale-90 sm:scale-95 origin-left transition-transform"
          style={{
            maskImage:
              'linear-gradient(to right, rgba(0,0,0,1) 45%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, rgba(0,0,0,1) 45%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0c0a08]/20 to-[#0c0a08]" />
      </div>

      {/* 4. BACKGROUND DIWANI LETTERS (Clearly visible artistic calligraphy identity) */}
      <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden opacity-75">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full select-none"
        >
          <defs>
            <linearGradient id="headerDiwaniGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#ffebb5" />
              <stop offset="65%" stopColor="#e5be53" />
              <stop offset="100%" stopColor="#b8861e" />
            </linearGradient>
          </defs>
          <g>
            <text x="180" y="74" fontSize="48" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="url(#headerDiwaniGold)" opacity="0.6">ك</text>
            <text x="260" y="68" fontSize="42" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="url(#headerDiwaniGold)" opacity="0.75">ط</text>
            <text x="340" y="72" fontSize="50" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="url(#headerDiwaniGold)" opacity="0.9">قُ</text>
            <text x="430" y="62" fontSize="56" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="url(#headerDiwaniGold)" opacity="0.95">لْ</text>
            <text x="520" y="78" fontSize="48" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="url(#headerDiwaniGold)" opacity="0.9">مِ</text>
            <text x="610" y="66" fontSize="52" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="url(#headerDiwaniGold)" opacity="0.95">دَ</text>
            <text x="700" y="72" fontSize="46" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="url(#headerDiwaniGold)" opacity="0.95">ادْ</text>
            <text x="800" y="66" fontSize="50" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="url(#headerDiwaniGold)" opacity="0.95">ن</text>
            <text x="890" y="75" fontSize="46" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="url(#headerDiwaniGold)" opacity="0.9">و</text>
            <text x="980" y="65" fontSize="52" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="url(#headerDiwaniGold)" opacity="0.85">ص</text>
            <text x="1070" y="74" fontSize="48" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="url(#headerDiwaniGold)" opacity="0.75">ع</text>
            <text x="1160" y="66" fontSize="44" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="url(#headerDiwaniGold)" opacity="0.6">ف</text>
          </g>
        </svg>
      </div>

      {/* 5. CENTER TITLE: ───❖ ديوان الخط العربي ❖─── (Brilliant Solid Pure White) */}
      <div className="relative z-25 w-full h-full px-4 sm:px-6 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-2.5 sm:gap-4 text-[#e6dfd5] pointer-events-auto">

          <div className="flex items-center gap-2 text-[#c59b27]">
            <span className="w-8 sm:w-16 md:w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#c59b27] to-[#c59b27]" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#c59b27] drop-shadow-[0_0_8px_rgba(197,155,39,0.7)]">
              <polygon points="12,2 14.5,8.5 21,9.5 16,14.5 17.5,21 12,17.5 6.5,21 8,14.5 3,9.5 9.5,8.5" />
              <circle cx="12" cy="12" r="2.5" fill="#15120c" />
            </svg>
            <span className="w-3 sm:w-5 h-[1.5px] bg-[#c59b27]" />
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-tajawal text-[#ffffff] tracking-wide px-3 whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,1)] drop-shadow-[0_0_16px_rgba(255,255,255,0.75)]">
            ديوان الخط العربي
          </h1>

          <div className="flex items-center gap-2 text-[#c59b27]">
            <span className="w-3 sm:w-5 h-[1.5px] bg-[#c59b27]" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#c59b27] drop-shadow-[0_0_8px_rgba(197,155,39,0.7)]">
              <polygon points="12,2 14.5,8.5 21,9.5 16,14.5 17.5,21 12,17.5 6.5,21 8,14.5 3,9.5 9.5,8.5" />
              <circle cx="12" cy="12" r="2.5" fill="#15120c" />
            </svg>
            <span className="w-8 sm:w-16 md:w-24 h-[1.5px] bg-gradient-to-l from-transparent via-[#c59b27] to-[#c59b27]" />
          </div>

        </div>

        {/* Close Button in corner if onCloseStudio provided */}
        {onCloseStudio && (
          <button
            type="button"
            onClick={onCloseStudio}
            className="absolute left-4 top-4 z-30 w-8 h-8 rounded-xl border border-[#4d3d24]/90 bg-[#14110d]/80 hover:bg-[#381419] hover:border-[#a63040] text-[#c59b27] hover:text-white flex items-center justify-center transition active:scale-95 shadow-lg backdrop-blur-md cursor-pointer pointer-events-auto"
            title="العودة"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </header>
  );
};
