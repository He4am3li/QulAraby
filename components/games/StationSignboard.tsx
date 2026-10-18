import React from 'react';

interface StationSignboardProps {
  title: string;
  iconType?: string;
  platformNumber: number;
  trackIndex: number;
  isChosen: boolean;
  isHovered: boolean;
}

/**
 * Gothic Arch Tympanum Lunette Signboard (اللافتة المثلثية المقوسة في تجويف ممر القطار)
 * Positioned inside the stone architectural cavity directly above the train tunnel portal.
 * Features:
 * - Curved-sided triangle with concave arched bottom hugging the round tunnel entrance.
 * - Circular badge with thematic icon in the upper portion.
 * - Bold, crisp Arabic title in the lower portion.
 * - Glowing in TURQUOISE upon hover.
 * - Glowing in GOLD ONLY when clicked / chosen.
 */
export const StationSignboard: React.FC<StationSignboardProps> = ({
  title,
  platformNumber,
  trackIndex,
  isChosen,
  isHovered,
}) => {
  // Glow mode logic:
  // - Clicked (isChosen): GOLD (#fbbf24 / #f59e0b)
  // - Hovered: TURQUOISE (#22d3ee / #06b6d4)
  // - Default (Idle): Subtle dark glass with faint cyan outline
  const isGold = isChosen;
  const isCyan = !isChosen && isHovered;

  return (
    <div
      className="relative w-full flex flex-col items-center select-none"
    >
      {/* 1. ATMOSPHERIC BACKLIGHT HALO INSIDE THE CAVITY */}
      <div 
        className={`absolute -inset-2 rounded-full pointer-events-none transition-all duration-500 blur-xl ${
          isGold
            ? 'bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.6)_0%,rgba(217,119,6,0.22)_50%,transparent_75%)] opacity-100'
            : isCyan
            ? 'bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.55)_0%,rgba(6,182,212,0.2)_50%,transparent_75%)] opacity-100'
            : 'bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12)_0%,transparent_70%)] opacity-40'
        }`}
      />

      {/* 2. THE CURVED-SIDED TRIANGULAR ARCH (المثلث ذو الانحناء في أضلاعه داخل التجويف) */}
      <div className="relative w-full max-w-[160px] sm:max-w-[185px] md:max-w-[205px] lg:max-w-[220px] filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)]">
        
        {/* SVG Curved-Sided Pointed Arch with Arched Concave Base */}
        <svg 
          viewBox="0 0 170 115" 
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Golden Gradient */}
            <linearGradient id={`goldBorder-${trackIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Turquoise/Cyan Gradient */}
            <linearGradient id={`cyanBorder-${trackIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cffafe" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>

            {/* Dark Stone & Glass Plate Gradient */}
            <radialGradient id={`plaqueBack-${trackIndex}`} cx="50%" cy="38%" r="65%">
              <stop offset="0%" stopColor={isGold ? 'rgba(42, 20, 5, 0.94)' : isCyan ? 'rgba(4, 38, 48, 0.94)' : 'rgba(2, 18, 24, 0.88)'} />
              <stop offset="65%" stopColor={isGold ? 'rgba(18, 8, 1, 0.96)' : isCyan ? 'rgba(2, 20, 26, 0.96)' : 'rgba(1, 11, 15, 0.94)'} />
              <stop offset="100%" stopColor="rgba(1, 6, 8, 0.98)" />
            </radialGradient>
          </defs>

          {/* BACKGROUND: Dark Glass / Stone fill fitting the curved-sided triangle */}
          {/*
              Coordinates:
              - Apex: (85, 7)
              - Left side curves down: C 62 28, 26 64, 14 98
              - Bottom side curves UP (concave to hug the round tunnel entrance): Q 85 88, 156 98
              - Right side curves up: C 144 64, 108 28, 85 7
          */}
          <path
            d="
              M 85 7
              C 62 28, 26 64, 14 98
              Q 85 88, 156 98
              C 144 64, 108 28, 85 7
              Z
            "
            fill={`url(#plaqueBack-${trackIndex})`}
          />

          {/* LAYER 1: Outer Luminous Neon Stroke */}
          <path
            d="
              M 85 7
              C 62 28, 26 64, 14 98
              Q 85 88, 156 98
              C 144 64, 108 28, 85 7
              Z
            "
            fill="none"
            stroke={
              isGold
                ? `url(#goldBorder-${trackIndex})`
                : isCyan
                ? `url(#cyanBorder-${trackIndex})`
                : 'rgba(34, 211, 238, 0.45)'
            }
            strokeWidth={isGold ? '2.2' : isCyan ? '2' : '1.2'}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={
              isGold
                ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.95))'
                : isCyan
                ? 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.9))'
                : 'drop-shadow(0 0 3px rgba(34, 211, 238, 0.35))'
            }
          />

          {/* LAYER 2: Inner Fine Concentric Line */}
          <path
            d="
              M 85 15
              C 65 33, 34 66, 24 92
              Q 85 83, 146 92
              C 136 66, 105 33, 85 15
              Z
            "
            fill="none"
            stroke={
              isGold
                ? 'rgba(254, 240, 138, 0.8)'
                : isCyan
                ? 'rgba(165, 243, 252, 0.8)'
                : 'rgba(34, 211, 238, 0.25)'
            }
            strokeWidth="0.8"
            strokeDasharray={isGold || isCyan ? undefined : '3,2'}
          />

          {/* Corner / Apex Accent Dots */}
          <circle 
            cx="85" cy="15" r="1.5" 
            fill={isGold ? '#fef08a' : isCyan ? '#a5f3fc' : 'rgba(34,211,238,0.5)'} 
          />
          <circle 
            cx="24" cy="91" r="1.2" 
            fill={isGold ? '#fef08a' : isCyan ? '#a5f3fc' : 'rgba(34,211,238,0.5)'} 
          />
          <circle 
            cx="146" cy="91" r="1.2" 
            fill={isGold ? '#fef08a' : isCyan ? '#a5f3fc' : 'rgba(34,211,238,0.5)'} 
          />
        </svg>

        {/* LAYER 4: OVERLAY CONTENT (ARABIC TITLE) */}
        <div className="absolute inset-0 flex flex-col items-center pointer-events-none">
          {/* Top spacer maintaining exact vertical coordinate of the title */}
          <div className="w-full flex items-center justify-center pt-[32px] sm:pt-[35px] md:pt-[38px]">
            <div className="h-7 sm:h-8" />
          </div>

          {/* Arabic Title Text: UNTOUCHED AND IN ITS EXACT POSITION */}
          <div className="w-full px-2 pt-1 sm:pt-1.5 flex items-center justify-center text-center">
            <h2
              className={`font-black font-serif tracking-wide leading-tight text-center text-[11px] sm:text-xs md:text-sm transition-colors duration-300 ${
                isGold
                  ? 'text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] [text-shadow:0_0_12px_rgba(245,158,11,0.95),0_0_20px_rgba(245,158,11,0.5)]'
                  : isCyan
                  ? 'text-cyan-50 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] [text-shadow:0_0_12px_rgba(34,211,238,0.95),0_0_20px_rgba(34,211,238,0.5)]'
                  : 'text-cyan-100/85 drop-shadow-[0_1px_3px_rgba(0,0,0,1)] [text-shadow:0_0_6px_rgba(34,211,238,0.4)]'
              }`}
            >
              {title}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};
