import React from 'react';

/**
 * Calligraphy section identity: hand-drawn ink traces and Arabic diacritics.
 * Decorative only, outside the printable artwork. No repeating font-pattern tiles.
 */
interface CalligraphyInkIdentityProps {
  variant?: 'studio' | 'header' | 'panel';
}

const flourishes = [
  'M -62 208 C 122 70, 226 140, 326 -16',
  'M 1000 -55 C 1127 112, 1271 33, 1510 205',
  'M -95 712 C 176 563, 312 660, 455 524',
  'M 1034 914 C 1185 674, 1328 770, 1524 540',
  'M 388 -80 C 396 114, 533 100, 598 -62',
  'M 747 944 C 838 729, 1015 782, 1103 681',
];

const letters = [
  { character: 'ع', x: 125, y: 275, size: 164, rotate: -19, alpha: .46 },
  { character: 'س', x: 446, y: 117, size: 108, rotate: 17, alpha: .28 },
  { character: 'م', x: 1125, y: 200, size: 174, rotate: 19, alpha: .45 },
  { character: 'ح', x: 1314, y: 496, size: 116, rotate: -12, alpha: .31 },
  { character: 'ن', x: 320, y: 800, size: 162, rotate: -14, alpha: .38 },
  { character: 'و', x: 870, y: 865, size: 106, rotate: 24, alpha: .32 },
  { character: 'ل', x: 716, y: 244, size: 142, rotate: 13, alpha: .22 },
  { character: 'ف', x: 87, y: 546, size: 92, rotate: 22, alpha: .29 },
  { character: 'ر', x: 1135, y: 655, size: 118, rotate: -23, alpha: .32 },
  { character: 'ي', x: 636, y: 655, size: 102, rotate: -10, alpha: .21 },
];

const marks = [
  { x: 290, y: 112, rotation: -18, kind: 'fatha', alpha: .6 },
  { x: 597, y: 300, rotation: 16, kind: 'damma', alpha: .5 },
  { x: 1045, y: 85, rotation: -12, kind: 'shadda', alpha: .58 },
  { x: 1370, y: 312, rotation: 20, kind: 'kasra', alpha: .45 },
  { x: 888, y: 444, rotation: -15, kind: 'sukun', alpha: .3 },
  { x: 228, y: 482, rotation: 25, kind: 'shadda', alpha: .38 },
  { x: 472, y: 730, rotation: -18, kind: 'damma', alpha: .52 },
  { x: 1010, y: 730, rotation: 18, kind: 'fatha', alpha: .45 },
  { x: 1264, y: 840, rotation: -12, kind: 'sukun', alpha: .37 },
  { x: 756, y: 89, rotation: 11, kind: 'kasra', alpha: .48 },
] as const;

const markPaths = {
  fatha: 'M -19 5 Q 0 -5 20 -10',
  kasra: 'M -20 10 Q 2 4 23 -5',
  damma: 'M -12 10 C -24 -4 -7 -21 5 -10 C 13 0 3 6 -5 4 C 7 15 24 1 27 -10',
  shadda: 'M -20 7 Q -10 -5 -3 3 Q 4 10 10 -7 Q 15 3 24 -5',
  sukun: 'M -10 2 A 10 8 0 1 1 10 2 A 10 8 0 1 1 -10 2',
};

export const CalligraphyInkIdentity: React.FC<CalligraphyInkIdentityProps> = ({
  variant = 'studio'
}) => {
  const isHeader = variant === 'header';
  const isPanel = variant === 'panel';
  const id = `qulInk-${variant}`;
  const opacity = isHeader ? .64 : isPanel ? .48 : .78;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ opacity, zIndex: 0 }}
    >
      {!isHeader && !isPanel && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 52% 52%, transparent 22%, rgba(106,78,41,.085) 100%)'
          }}
        />
      )}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <defs>
          <linearGradient id={`${id}Stroke`} x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#b0a28a" />
            <stop offset="48%" stopColor="#dbccae" />
            <stop offset="100%" stopColor="#8b7959" />
          </linearGradient>
          <linearGradient id={`${id}Fade`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c5ac7a" stopOpacity=".86" />
            <stop offset=".5" stopColor="#c5ac7a" stopOpacity=".28" />
            <stop offset="1" stopColor="#c5ac7a" stopOpacity=".68" />
          </linearGradient>
        </defs>
        <g fill="none" stroke={`url(#${id}Fade)`} strokeWidth="3.5" strokeLinecap="round" opacity=".39">
          {flourishes.map((path, index) => (
            <path key={index} d={path} strokeWidth={index % 2 ? 2 : 3.5} />
          ))}
        </g>
        <g fill={`url(#${id}Stroke)`} fontFamily="diwani, 'Al-Wissam', 'Amiri', serif">
          {letters.map((item, index) => (
            <text
              key={index}
              x={item.x}
              y={item.y}
              fontSize={item.size}
              opacity={item.alpha}
              transform={`rotate(${item.rotate} ${item.x} ${item.y})`}
            >
              {item.character}
            </text>
          ))}
        </g>
        <g fill="none" stroke="#d7c4a0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          {marks.map((mark, index) => (
            <path
              key={index}
              d={markPaths[mark.kind]}
              transform={`translate(${mark.x} ${mark.y}) rotate(${mark.rotation})`}
              opacity={mark.alpha}
            />
          ))}
        </g>
        <g fill="#cbb48b" opacity=".34">
          <circle cx="300" cy="378" r="5" />
          <circle cx="315" cy="387" r="5" />
          <circle cx="1235" cy="548" r="5" />
          <circle cx="1250" cy="541" r="5" />
          <circle cx="804" cy="282" r="4" />
          <circle cx="818" cy="284" r="4" />
          <circle cx="832" cy="281" r="4" />
        </g>
      </svg>
      {isHeader && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a08]/20 via-[#0c0a08]/65 to-[#0c0a08]/20" />
      )}
    </div>
  );
};
