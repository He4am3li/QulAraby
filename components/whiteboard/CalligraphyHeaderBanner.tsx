import React from 'react';
import { BookOpen, FolderHeart, X } from 'lucide-react';

interface CalligraphyHeaderBannerProps {
  onOpenHelp: () => void;
  onOpenGuide: () => void;
  onOpenSavedCards: () => void;
  onCloseStudio?: () => void;
  savedCardsCount?: number;
}

export const CalligraphyHeaderBanner: React.FC<CalligraphyHeaderBannerProps> = ({
  onOpenHelp,
  onOpenGuide,
  onOpenSavedCards,
  onCloseStudio,
  savedCardsCount = 0
}) => {
  return (
    <header
      className="relative shrink-0 w-full h-24 sm:h-28 md:h-[110px] bg-[#0c0a08] border-b border-[#2d2417] overflow-hidden z-30 select-none shadow-2xl"
      dir="rtl"
    >
      {/* ----------------------------------------------------------------- */}
      {/* 1. ATMOSPHERIC BACKGROUND TEXTURE & VIGNETTE                      */}
      {/* ----------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Deep Charcoal Dark Radial Glow */}
        <div
          className="w-full h-full"
          style={{
            background:
              'radial-gradient(ellipse 80% 120% at 50% 50%, #15120c 0%, #0c0a08 75%, #070605 100%)'
          }}
        />
        {/* Subtle Dark Studio Border Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. RIGHT SIDE: AUTHENTIC CALLIGRAPHER DESK WORKSPACE               */}
      {/* Bamboo Reed Pen (Qalam), Deckled Parchment with Calligraphy, Ink   */}
      {/* Zoomed out so the full parchment and inkwell features are visible */}
      {/* ----------------------------------------------------------------- */}
      <div className="absolute right-0 top-0 bottom-0 w-[450px] sm:w-[580px] md:w-[700px] lg:w-[840px] pointer-events-none z-10 overflow-hidden flex items-center justify-end">
        <img
          src="/calligrapher_tools_header.jpg"
          alt="أدوات الخط العربي، القصبة والمحبرة والورق المقهر"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain object-right transform scale-90 sm:scale-95 origin-right transition-transform"
          style={{
            maskImage:
              'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0.8) 72%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage:
              'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0.8) 72%, rgba(0,0,0,0) 100%)'
          }}
        />
        {/* Seamless Warm Lighting Integration */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0c0a08]/20 to-[#0c0a08]" />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. BACKGROUND FLOCK: FAINT DIWANI CALLIGRAPHY LETTERS             */}
      {/* Rendered in Diwani font in the background with soft, faint opacity */}
      {/* ----------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none z-5 overflow-hidden opacity-10">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full select-none"
        >
          <defs>
            {/* Ethereal Muted Pale Metallic Gradient for Faint Diwani Letters */}
            <linearGradient id="headerDiwaniGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d1c7b7" />
              <stop offset="35%" stopColor="#9e917d" />
              <stop offset="70%" stopColor="#6e6353" />
              <stop offset="100%" stopColor="#3d352a" />
            </linearGradient>

            {/* Specular Highlight Gradient */}
            <radialGradient id="goldDotHighlight" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#e8e2d5" />
              <stop offset="50%" stopColor="#9e917d" />
              <stop offset="100%" stopColor="#4d4436" />
            </radialGradient>

            {/* Soft Shadow Filter */}
            <filter id="diwaniLetterFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* ============================================================= */}
          {/* DIWANI FLOCK: Floating in Background Behind the Main Scene     */}
          {/* ============================================================= */}
          <g filter="url(#diwaniLetterFilter)">
            {/* 1. ن (Nun Diwani) */}
            <text
              x="160"
              y="94"
              fontSize="46"
              fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif"
              fill="url(#headerDiwaniGold)"
              transform="rotate(-6 160 94)"
            >
              نُ
            </text>
            <rect x="176" y="60" width="5.5" height="5.5" fill="url(#goldDotHighlight)" transform="rotate(45 178 62)" />

            {/* 2. ق (Qaf Diwani) */}
            <text
              x="220"
              y="74"
              fontSize="50"
              fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif"
              fill="url(#headerDiwaniGold)"
              transform="rotate(-12 220 74)"
            >
              قْ
            </text>
            <rect x="232" y="36" width="5" height="5" fill="url(#goldDotHighlight)" transform="rotate(45 234 38)" />
            <rect x="242" y="37" width="5" height="5" fill="url(#goldDotHighlight)" transform="rotate(45 244 39)" />

            {/* 3. ف (Fa Diwani) */}
            <text
              x="280"
              y="88"
              fontSize="45"
              fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif"
              fill="url(#headerDiwaniGold)"
              transform="rotate(6 280 88)"
            >
              فَ
            </text>

            {/* 4. س / سل (Seen Diwani) */}
            <text
              x="330"
              y="96"
              fontSize="42"
              fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif"
              fill="url(#headerDiwaniGold)"
              transform="rotate(-5 330 96)"
            >
              سِّ
            </text>

            {/* 5. ض (Dad Diwani) */}
            <text
              x="385"
              y="85"
              fontSize="50"
              fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif"
              fill="url(#headerDiwaniGold)"
              transform="rotate(8 385 85)"
            >
              ضَ
            </text>
            <rect x="412" y="52" width="5.5" height="5.5" fill="url(#goldDotHighlight)" transform="rotate(45 414 54)" />

            {/* 6. ح (Ha Diwani Crescent) */}
            <text
              x="440"
              y="76"
              fontSize="54"
              fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif"
              fill="url(#headerDiwaniGold)"
              transform="rotate(-14 440 76)"
            >
              حْ
            </text>

            {/* 7. ط (Ta Diwani) */}
            <text
              x="495"
              y="70"
              fontSize="46"
              fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif"
              fill="url(#headerDiwaniGold)"
              transform="rotate(-6 495 70)"
            >
              طُ
            </text>

            {/* 8. ع (Ain Diwani) */}
            <text
              x="540"
              y="88"
              fontSize="44"
              fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif"
              fill="url(#headerDiwaniGold)"
              transform="rotate(10 540 88)"
            >
              عَر
            </text>

            {/* 9. م (Meem Diwani) */}
            <text
              x="595"
              y="80"
              fontSize="40"
              fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif"
              fill="url(#headerDiwaniGold)"
              transform="rotate(12 595 80)"
            >
              مَقْ
            </text>

            {/* Mid-Arch Diwani Characters */}
            <text x="415" y="40" fontSize="36" fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif" fill="url(#headerDiwaniGold)" transform="rotate(-8 415 40)">طُ</text>
            <text x="470" y="30" fontSize="34" fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif" fill="url(#headerDiwaniGold)" transform="rotate(12 470 30)">ثَ</text>
            <text x="530" y="48" fontSize="38" fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif" fill="url(#headerDiwaniGold)" transform="rotate(-5 530 48)">حِ</text>
            <text x="580" y="40" fontSize="36" fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif" fill="url(#headerDiwaniGold)" transform="rotate(8 580 40)">طُ</text>
            <text x="630" y="54" fontSize="33" fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif" fill="url(#headerDiwaniGold)" transform="rotate(-12 630 54)">شّ</text>
            <text x="670" y="64" fontSize="30" fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif" fill="url(#headerDiwaniGold)" transform="rotate(14 670 64)">فَ</text>
            <text x="710" y="52" fontSize="28" fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif" fill="url(#headerDiwaniGold)" transform="rotate(-6 710 52)">ضْ</text>

            {/* Dispersing Tail */}
            <text x="748" y="46" fontSize="24" fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif" fill="url(#headerDiwaniGold)">لـ</text>
            <text x="778" y="55" fontSize="21" fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif" fill="url(#headerDiwaniGold)">نْ</text>
            <text x="804" y="50" fontSize="19" fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif" fill="url(#headerDiwaniGold)">تَ</text>
            <text x="828" y="60" fontSize="17" fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif" fill="url(#headerDiwaniGold)">ش</text>
            <text x="852" y="52" fontSize="15" fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif" fill="url(#headerDiwaniGold)">رَ</text>
            <text x="874" y="62" fontSize="13" fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif" fill="url(#headerDiwaniGold)">وُ</text>
            <text x="894" y="56" fontSize="11" fontFamily="diwani, 'Al-Wissam', 'AlWissam', 'Gulzar', 'Amiri', serif" fill="url(#headerDiwaniGold)">هـ</text>

            {/* Floating Diwani dots */}
            <rect x="265" y="46" width="4" height="4" fill="url(#goldDotHighlight)" transform="rotate(45 267 48)" opacity="0.8" />
            <rect x="355" y="60" width="4.5" height="4.5" fill="url(#goldDotHighlight)" transform="rotate(45 357 62)" opacity="0.8" />
            <rect x="520" y="26" width="4" height="4" fill="url(#goldDotHighlight)" transform="rotate(45 522 28)" opacity="0.75" />
            <rect x="614" y="30" width="3.5" height="3.5" fill="url(#goldDotHighlight)" transform="rotate(45 615 31)" opacity="0.7" />
          </g>
        </svg>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 4. FOREGROUND INTERACTIVE CONTROLS & CENTERED TITLE                */}
      {/* "ديوان الخط العربي" elevated slightly with crisp, bold typography  */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative z-25 w-full h-full px-4 sm:px-6 flex items-center justify-between pointer-events-none">
        
        {/* RIGHT SPACER: Balances the visual presence of the desk */}
        <div className="hidden md:block w-36 lg:w-48 shrink-0 pointer-events-none" />

        {/* CENTER: ───❖ ديوان الخط العربي ❖─── (Raised higher professionally) */}
        <div className="flex-1 flex items-center justify-center pointer-events-auto self-center pb-2 sm:pb-3">
          <div className="flex items-center gap-2.5 sm:gap-4 text-[#e6dfd5]">
            
            {/* Right Ornamental Line with Golden Star Rosette */}
            <div className="flex items-center gap-2 text-[#c59b27]">
              <span className="w-10 sm:w-16 md:w-24 lg:w-32 h-[1.5px] bg-gradient-to-r from-transparent via-[#c59b27] to-[#c59b27]" />
              {/* Islamic 8-Pointed Star Rosette ❖ */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#c59b27] drop-shadow-[0_0_8px_rgba(197,155,39,0.55)]">
                <polygon points="12,2 14.5,8.5 21,9.5 16,14.5 17.5,21 12,17.5 6.5,21 8,14.5 3,9.5 9.5,8.5" />
                <circle cx="12" cy="12" r="2.5" fill="#15120c" />
              </svg>
              <span className="w-3 sm:w-5 h-[1.5px] bg-[#c59b27]" />
            </div>

            {/* Central Clear Bright White Title: "الخط العربي" */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-tajawal text-white tracking-wide px-3 whitespace-nowrap drop-shadow-[0_2px_14px_rgba(0,0,0,1)]">
              الخط العربي
            </h1>

            {/* Left Ornamental Line with Golden Star Rosette */}
            <div className="flex items-center gap-2 text-[#c59b27]">
              <span className="w-3 sm:w-5 h-[1.5px] bg-[#c59b27]" />
              {/* Islamic 8-Pointed Star Rosette ❖ */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#c59b27] drop-shadow-[0_0_8px_rgba(197,155,39,0.55)]">
                <polygon points="12,2 14.5,8.5 21,9.5 16,14.5 17.5,21 12,17.5 6.5,21 8,14.5 3,9.5 9.5,8.5" />
                <circle cx="12" cy="12" r="2.5" fill="#15120c" />
              </svg>
              <span className="w-10 sm:w-16 md:w-24 lg:w-32 h-[1.5px] bg-gradient-to-l from-transparent via-[#c59b27] to-[#c59b27]" />
            </div>

          </div>
        </div>

        {/* LEFT CONTROLS: [?] and [📖 دليل الخط] exactly as styled in the screenshot */}
        <div className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto self-center -mr-1 sm:mr-0">
          
          {/* Question Mark Button */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#4d3d24]/90 bg-[#14110d]/80 hover:bg-[#221c13] hover:border-[#c59b27] text-[#d4af37] flex items-center justify-center font-bold text-sm transition active:scale-95 shadow-lg backdrop-blur-md cursor-pointer"
            title="تعليمات استخدام الخط العربي"
          >
            ?
          </button>

          {/* Calligraphy Guide Button */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl border border-[#4d3d24]/90 bg-[#14110d]/80 hover:bg-[#221c13] hover:border-[#c59b27] text-[#f2e9dc] text-xs font-bold flex items-center gap-2 transition active:scale-95 shadow-lg backdrop-blur-md cursor-pointer"
            title="دليل أسرار الخط العربي وميزان الحروف"
          >
            <BookOpen size={16} className="text-[#c59b27]" />
            <span className="hidden sm:inline">دليل الخط</span>
          </button>

          {/* Saved Cards Gallery Button */}
          <button
            type="button"
            onClick={onOpenSavedCards}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#4d3d24]/90 bg-[#14110d]/80 hover:bg-[#221c13] hover:border-[#c59b27] text-[#c59b27] flex items-center justify-center transition active:scale-95 shadow-lg backdrop-blur-md cursor-pointer relative"
            title="معرض بطاقاتي المحفوظة"
          >
            <FolderHeart size={16} />
            {savedCardsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#7a1c28] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow">
                {savedCardsCount}
              </span>
            )}
          </button>

          {/* Close Studio Button (if embedded) */}
          {onCloseStudio && (
            <button
              type="button"
              onClick={onCloseStudio}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#4d3d24]/90 bg-[#14110d]/80 hover:bg-[#381419] hover:border-[#a63040] text-[#c59b27] hover:text-white flex items-center justify-center transition active:scale-95 shadow-lg backdrop-blur-md cursor-pointer"
              title="العودة إلى اللوحة"
            >
              <X size={17} />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
