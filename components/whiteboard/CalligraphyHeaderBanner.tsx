import React from 'react';
import { FallingLetters } from '../Layout';

interface CalligraphyHeaderBannerProps {
  onOpenHelp?: () => void;
  onOpenGuide?: () => void;
  onOpenSavedCards?: () => void;
  onCloseStudio?: () => void;
  savedCardsCount?: number;
}

/**
 * Match the shared QUL PageHeader's slate-to-emerald glass treatment while
 * preserving the two historic calligrapher-tool illustrations in their positions.
 * The photographs have dark backgrounds, so screen blending lets the common QUL
 * header gradient and its FallingLetters show through without black blocks.
 */
export const CalligraphyHeaderBanner: React.FC<CalligraphyHeaderBannerProps> = () => {
  return (
    <header
      className="relative isolate shrink-0 w-full h-[84px] overflow-hidden z-30 select-none border-b border-white/20 shadow-lg bg-gradient-to-l from-[#0f172a]/95 to-[#064e3b]/95 backdrop-blur-lg"
      dir="rtl"
    >
      {/* Same translucent, illuminated header language used across QUL. */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 55% 110% at 50% -25%, rgba(255,255,255,.17), transparent 78%), radial-gradient(ellipse 35% 100% at 13% 90%, rgba(240,201,117,.10), transparent 75%), radial-gradient(ellipse 35% 100% at 87% 20%, rgba(110,231,183,.10), transparent 75%)'
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c7a968]/35 to-transparent" />
      </div>

      {/* Right photo, retained from the previous header. Blend its dark pixels
          into the new glass surface instead of recreating a black banner. */}
      <div className="absolute right-0 inset-y-0 w-[47%] sm:w-[43%] lg:w-[39%] max-w-[660px] z-10 overflow-hidden pointer-events-none flex items-center justify-end">
        <img
          src="/calligrapher_tools_header.jpg"
          alt="أدوات الخط العربي، القصبة والمحبرة والورق المقهر"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain object-right mix-blend-screen opacity-90"
          style={{
            maskImage: 'linear-gradient(to left, #000 35%, rgba(0,0,0,.86) 52%, transparent 97%)',
            WebkitMaskImage: 'linear-gradient(to left, #000 35%, rgba(0,0,0,.86) 52%, transparent 97%)'
          }}
        />
      </div>

      {/* Left original is mirrored and visually anchored to the very left edge, with its fade toward the title. */}
      <div className="absolute left-0 inset-y-0 w-[50%] sm:w-[43%] lg:w-[39%] max-w-[660px] z-10 overflow-hidden pointer-events-none flex items-center justify-start">
        <img
          src="/calligrapher_tools_header.jpg"
          alt="أدوات الخط العربي"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain object-right -scale-x-100 mix-blend-screen opacity-95"
          style={{
            maskImage: 'linear-gradient(to left, #000 35%, rgba(0,0,0,.86) 52%, transparent 97%)',
            WebkitMaskImage: 'linear-gradient(to left, #000 35%, rgba(0,0,0,.86) 52%, transparent 97%)'
          }}
        />
      </div>

      {/* Exactly the same animated letter layer used by the shared QUL PageHeader.
          It sits ABOVE the tool images, so the letters remain visible as they fall. */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        <FallingLetters mode="compact" />
      </div>

      {/* Quiet transparent centre for reliable contrast, no solid black stripe. */}
      <div
        className="absolute inset-0 z-[15] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(9,53,62,.24) 33%, rgba(9,53,62,.38) 50%, rgba(9,53,62,.24) 67%, transparent 100%)'
        }}
      />

      {/* The full title is always on the topmost layer, pure opaque white. */}
      <div className="relative z-30 flex items-center justify-center w-full h-full px-12 sm:px-16 md:px-20 pointer-events-none">
        <div className="flex items-center justify-center gap-3 sm:gap-4 min-w-0 max-w-full">
          <span className="hidden md:block h-px w-12 lg:w-20 bg-gradient-to-r from-transparent via-[#d8be80] to-[#d8be80]/70 shrink-0" />
          <h1
            className="relative z-10 m-0 min-w-0 text-center font-tajawal font-black whitespace-nowrap leading-normal"
            style={{
              color: '#ffffff',
              WebkitTextFillColor: '#ffffff',
              opacity: 1,
              fontSize: 'clamp(16px, 3.6vw, 30px)',
              textShadow: '0 2px 8px rgba(7,35,43,.65), 0 0 12px rgba(7,35,43,.35)'
            }}
          >
            ديوان الخط العربي
          </h1>
          <span className="hidden md:block h-px w-12 lg:w-20 bg-gradient-to-l from-transparent via-[#d8be80] to-[#d8be80]/70 shrink-0" />
        </div>
      </div>


    </header>
  );
};
