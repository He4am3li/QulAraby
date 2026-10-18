import React, { useEffect, useState } from 'react';

interface VintageStationClockProps {
  className?: string;
  size?: number; // clock face diameter
}

export const VintageStationClock: React.FC<VintageStationClockProps> = ({ 
  className = '',
  size = 170
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = (hours * 30) + (minutes * 0.5);
  const minuteDeg = (minutes * 6) + (seconds * 0.1);
  const secondDeg = seconds * 6;

  // Roman / Arabic numerals for vintage train station clocks
  const numerals = [
    { num: '12', deg: 0, x: 100, y: 38 },
    { num: '1', deg: 30, x: 134, y: 46 },
    { num: '2', deg: 60, x: 156, y: 70 },
    { num: '3', deg: 90, x: 164, y: 104 },
    { num: '4', deg: 120, x: 154, y: 136 },
    { num: '5', deg: 150, x: 133, y: 161 },
    { num: '6', deg: 180, x: 100, y: 169 },
    { num: '7', deg: 210, x: 67, y: 161 },
    { num: '8', deg: 240, x: 46, y: 136 },
    { num: '9', deg: 270, x: 36, y: 104 },
    { num: '10', deg: 300, x: 44, y: 70 },
    { num: '11', deg: 330, x: 66, y: 46 },
  ];

  return (
    <div className={`flex flex-col items-center select-none pointer-events-none ${className}`}>
      {/* Top Ornate Victorian Wrought-Iron Finial & Scrolls */}
      <div className="w-48 sm:w-56 h-12 relative flex items-end justify-center -mb-2 z-10">
        <svg viewBox="0 0 200 45" className="w-full h-full text-amber-500/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          <defs>
            <linearGradient id="ironGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="30%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#fef3c7" />
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="bronzeDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#291807" />
              <stop offset="50%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#1c0f04" />
            </linearGradient>
          </defs>

          {/* Central Fleur-de-lis finial spire */}
          <path
            d="M 100 2 C 103 10 106 14 100 24 C 94 14 97 10 100 2 Z"
            fill="url(#ironGrad)"
            stroke="#451a03"
            strokeWidth="0.8"
          />
          <circle cx="100" cy="2" r="2.5" fill="#fde68a" stroke="#78350f" strokeWidth="0.5" />
          
          {/* Side leaf petals */}
          <path d="M 100 18 C 108 12 114 16 110 22 C 105 24 102 20 100 18 Z" fill="url(#ironGrad)" />
          <path d="M 100 18 C 92 12 86 16 90 22 C 95 24 98 20 100 18 Z" fill="url(#ironGrad)" />

          {/* Left ornate spiral bracket */}
          <path
            d="M 100 24 C 70 24 50 10 30 18 C 18 23 15 35 24 42 C 30 46 38 42 37 36 C 36 30 28 30 26 34"
            fill="none"
            stroke="url(#ironGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="26" cy="34" r="2.5" fill="#fde68a" />
          <path d="M 60 22 C 50 32 40 38 32 40" fill="none" stroke="url(#ironGrad)" strokeWidth="2" />

          {/* Right ornate spiral bracket */}
          <path
            d="M 100 24 C 130 24 150 10 170 18 C 182 23 185 35 176 42 C 170 46 162 42 163 36 C 164 30 172 30 174 34"
            fill="none"
            stroke="url(#ironGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="174" cy="34" r="2.5" fill="#fde68a" />
          <path d="M 140 22 C 150 32 160 38 168 40" fill="none" stroke="url(#ironGrad)" strokeWidth="2" />
        </svg>
      </div>

      {/* Main Clock Face & Bronze Housing */}
      <div 
        className="relative rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.25)] flex items-center justify-center p-2.5 sm:p-3 transition-transform"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: 'radial-gradient(circle at 35% 30%, #78350f 0%, #451a03 50%, #1c0f04 90%, #0c0502 100%)',
          border: '4px solid #d97706',
          boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8), 0 12px 35px rgba(0,0,0,0.9), 0 0 25px rgba(217,119,6,0.35)'
        }}
      >
        {/* Outer Beaded Rivets Ring */}
        <div className="absolute inset-1.5 rounded-full border border-amber-500/40 pointer-events-none flex items-center justify-center">
          {/* Subtle screw studs around rim */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <div
              key={deg}
              className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-200 shadow-xs"
              style={{
                transform: `rotate(${deg}deg) translate(${size / 2 - 10}px)`
              }}
            />
          ))}
        </div>

        {/* Vintage Parchment Dial Face */}
        <div 
          className="w-full h-full rounded-full relative overflow-hidden flex items-center justify-center shadow-inner"
          style={{
            background: 'radial-gradient(circle at 45% 45%, #fffdf7 0%, #fef8eb 45%, #fbeec8 80%, #ebd39b 100%)',
            border: '2px solid #78350f'
          }}
        >
          {/* Subtle Vintage Station Dial Texture Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(120,53,15,0.18)_100%)] pointer-events-none" />

          {/* SVG Dial for Numbers and Tracks */}
          <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0">
            {/* Outer Minute Track Ring */}
            <circle cx="100" cy="100" r="88" fill="none" stroke="#78350f" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="82" fill="none" stroke="#78350f" strokeWidth="0.8" />

            {/* 60 Minute Tick Marks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const isHour = i % 5 === 0;
              const angle = i * 6 * (Math.PI / 180);
              const r1 = isHour ? 78 : 83;
              const r2 = 88;
              const x1 = 100 + r1 * Math.sin(angle);
              const y1 = 100 - r1 * Math.cos(angle);
              const x2 = 100 + r2 * Math.sin(angle);
              const y2 = 100 - r2 * Math.cos(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#291807"
                  strokeWidth={isHour ? 2.2 : 0.8}
                />
              );
            })}

            {/* Station Brand Watermark */}
            <text
              x="100"
              y="74"
              textAnchor="middle"
              className="text-[9px] font-black tracking-widest fill-amber-950/70 font-serif uppercase"
            >
              محطة النحو العربي
            </text>
            <text
              x="100"
              y="132"
              textAnchor="middle"
              className="text-[7.5px] font-bold tracking-wider fill-amber-900/60 font-serif"
            >
              المحطة المركزية • ١٨٩٠
            </text>

            {/* Serif Clock Numerals */}
            {numerals.map((item) => (
              <text
                key={item.num}
                x={item.x}
                y={item.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[17px] font-black fill-stone-900 font-serif drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
              >
                {item.num}
              </text>
            ))}

            {/* Dial Glass Sheen Reflection Arc */}
            <path
              d="M 25 100 A 75 75 0 0 1 175 100 Q 100 65 25 100 Z"
              fill="rgba(255, 255, 255, 0.18)"
            />

            {/* Slender Vintage Station Clock Hands (Pure SVG - Perfectly Contained Inside Dial) */}
            {/* 1. Hour Hand: Elegant tapered spade style, radius ~46 (well inside numbers at 66) */}
            <g transform={`rotate(${hourDeg}, 100, 100)`}>
              {/* Tail counterbalance */}
              <rect x="99" y="100" width="2" height="12" rx="1" fill="#1c0f04" />
              <circle cx="100" cy="110" r="2.5" fill="#291807" />
              {/* Main slender shaft */}
              <line x1="100" y1="100" x2="100" y2="58" stroke="#1c0f04" strokeWidth="2.2" strokeLinecap="round" />
              {/* Breguet / Spade ornamental diamond tip */}
              <polygon points="100,52 97,60 100,64 103,60" fill="#291807" />
              <circle cx="100" cy="60" r="1.2" fill="#fde68a" />
            </g>

            {/* 2. Minute Hand: Ultra-slender needle pointer, radius ~62 (stops just before minute ring at 82) */}
            <g transform={`rotate(${minuteDeg}, 100, 100)`}>
              {/* Tail */}
              <rect x="99.2" y="100" width="1.6" height="15" rx="0.8" fill="#1c0f04" />
              {/* Main slender tapered shaft */}
              <line x1="100" y1="100" x2="100" y2="42" stroke="#1c0f04" strokeWidth="1.6" strokeLinecap="round" />
              {/* Fine spearhead tip */}
              <polygon points="100,38 98.2,45 100,47 101.8,45" fill="#291807" />
            </g>

            {/* 3. Second Hand: Vintage railway crimson/amber needle with counterbalance */}
            <g transform={`rotate(${secondDeg}, 100, 100)`}>
              {/* Counterbalance tail */}
              <line x1="100" y1="100" x2="100" y2="122" stroke="#b45309" strokeWidth="1" />
              <circle cx="100" cy="116" r="3" fill="#b45309" />
              {/* Long fine needle to ticks */}
              <line x1="100" y1="100" x2="100" y2="28" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
              <circle cx="100" cy="35" r="1.5" fill="#d97706" />
            </g>

            {/* Central Cast Brass Pin & Washer */}
            <circle cx="100" cy="100" r="4.5" fill="url(#ironGrad)" stroke="#451a03" strokeWidth="0.8" />
            <circle cx="100" cy="100" r="2" fill="#fde68a" />
          </svg>
        </div>
      </div>

      {/* Antique Suspended Terminal Drop Finial (Pendant acorn) */}
      <div className="relative flex flex-col items-center -mt-1.5 pointer-events-none z-10">
        <svg viewBox="0 0 40 22" className="w-8 h-4 text-amber-500/90 drop-shadow-md">
          <path
            d="M 12 0 C 14 5 17 11 20 16 C 23 11 26 5 28 0 Z"
            fill="url(#ironGrad)"
            stroke="#451a03"
            strokeWidth="0.8"
          />
          <circle cx="20" cy="16" r="2.5" fill="#fde68a" stroke="#78350f" strokeWidth="0.5" />
          <circle cx="20" cy="20" r="1.2" fill="#f59e0b" />
        </svg>
      </div>
    </div>
  );
};
