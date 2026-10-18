import React from 'react';
import { CalligraphyFrameId, OrnamentTypeId } from './calligraphyStudioData';

// =========================================================================
// 🖼️ 10 HIGH-FIDELITY VECTOR FRAMES
// =========================================================================

interface FrameOverlayProps {
  frameId: CalligraphyFrameId;
  inset?: number;
  color?: string;
  isGold?: boolean;
}

export const CalligraphyFrameOverlay: React.FC<FrameOverlayProps> = ({
  frameId,
  inset = 16,
  color,
  isGold = false
}) => {
  if (frameId === 'none') return null;

  const goldGradientId = 'frame-gold-grad';
  const effectiveStroke = isGold ? `url(#${goldGradientId})` : (color || '#1e293b');

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
      style={{ padding: `${inset}px` }}
    >
      <defs>
        <linearGradient id={goldGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bf953f" />
          <stop offset="25%" stopColor="#fcf6ba" />
          <stop offset="50%" stopColor="#b38728" />
          <stop offset="75%" stopColor="#fbf5b7" />
          <stop offset="100%" stopColor="#aa771c" />
        </linearGradient>
      </defs>

      {/* 1. ROYAL GOLD FILIGREE (تذهيب ملكي أندلسي فاخر) */}
      {frameId === 'royal_gold_filigree' && (
        <g>
          {/* Outer Border */}
          <rect x="0" y="0" width="100%" height="100%" fill="none" stroke={effectiveStroke} strokeWidth="3" rx="8" />
          {/* Inner Border */}
          <rect x="6" y="6" width="calc(100% - 12px)" height="calc(100% - 12px)" fill="none" stroke={effectiveStroke} strokeWidth="1" strokeDasharray="3 3" rx="4" />
          
          {/* Top Left Corner Arabesque */}
          <g transform="translate(10, 10)">
            <path d="M0,0 C15,0 25,10 25,25 C25,12 12,25 0,25 Z" fill={effectiveStroke} opacity="0.85" />
            <circle cx="12" cy="12" r="3" fill={effectiveStroke} />
            <path d="M0,0 L35,0 M0,0 L0,35" stroke={effectiveStroke} strokeWidth="1.5" />
          </g>
          {/* Top Right Corner */}
          <g transform="translate(-10, 10)" style={{ transformOrigin: 'top right' }}>
            <path d="M0,0 C-15,0 -25,10 -25,25 C-25,12 -12,25 0,25 Z" fill={effectiveStroke} opacity="0.85" />
            <circle cx="-12" cy="12" r="3" fill={effectiveStroke} />
            <path d="M0,0 L-35,0 M0,0 L0,35" stroke={effectiveStroke} strokeWidth="1.5" />
          </g>
          {/* Bottom Left Corner */}
          <g transform="translate(10, -10)" style={{ transformOrigin: 'bottom left' }}>
            <path d="M0,0 C15,0 25,-10 25,-25 C25,-12 12,-25 0,-25 Z" fill={effectiveStroke} opacity="0.85" />
            <circle cx="12" cy="-12" r="3" fill={effectiveStroke} />
            <path d="M0,0 L35,0 M0,0 L0,-35" stroke={effectiveStroke} strokeWidth="1.5" />
          </g>
          {/* Bottom Right Corner */}
          <g transform="translate(-10, -10)" style={{ transformOrigin: 'bottom right' }}>
            <path d="M0,0 C-15,0 -25,-10 -25,-25 C-25,-12 -12,-25 0,-25 Z" fill={effectiveStroke} opacity="0.85" />
            <circle cx="-12" cy="-12" r="3" fill={effectiveStroke} />
            <path d="M0,0 L-35,0 M0,0 L0,-35" stroke={effectiveStroke} strokeWidth="1.5" />
          </g>
        </g>
      )}

      {/* 2. GEOMETRIC KUFIC BRASS (مشربية كوفية مذهبة) */}
      {frameId === 'geometric_kufic_brass' && (
        <g stroke={effectiveStroke}>
          <rect x="0" y="0" width="100%" height="100%" fill="none" strokeWidth="2.5" />
          <rect x="8" y="8" width="calc(100% - 16px)" height="calc(100% - 16px)" fill="none" strokeWidth="1.5" />
          
          {/* Corner 8-Pointed Star Interlace */}
          {/* TL */}
          <g transform="translate(14, 14)">
            <polygon points="0,-8 2.5,-2.5 8,0 2.5,2.5 0,8 -2.5,2.5 -8,0 -2.5,-2.5" fill={effectiveStroke} />
            <rect x="-6" y="-6" width="12" height="12" fill="none" strokeWidth="1" />
          </g>
          {/* TR */}
          <g transform="translate(calc(100% - 14px), 14)">
            <polygon points="0,-8 2.5,-2.5 8,0 2.5,2.5 0,8 -2.5,2.5 -8,0 -2.5,-2.5" fill={effectiveStroke} />
            <rect x="-6" y="-6" width="12" height="12" fill="none" strokeWidth="1" />
          </g>
          {/* BL */}
          <g transform="translate(14, calc(100% - 14px))">
            <polygon points="0,-8 2.5,-2.5 8,0 2.5,2.5 0,8 -2.5,2.5 -8,0 -2.5,-2.5" fill={effectiveStroke} />
            <rect x="-6" y="-6" width="12" height="12" fill="none" strokeWidth="1" />
          </g>
          {/* BR */}
          <g transform="translate(calc(100% - 14px), calc(100% - 14px))">
            <polygon points="0,-8 2.5,-2.5 8,0 2.5,2.5 0,8 -2.5,2.5 -8,0 -2.5,-2.5" fill={effectiveStroke} />
            <rect x="-6" y="-6" width="12" height="12" fill="none" strokeWidth="1" />
          </g>
        </g>
      )}

      {/* 3. DELFT CERAMIC BLUE (خزف دمشقي أزرق ملكي) */}
      {frameId === 'delft_ceramic_blue' && (
        <g stroke="#1d4ed8" fill="none">
          <rect x="0" y="0" width="100%" height="100%" strokeWidth="2" rx="4" />
          <rect x="5" y="5" width="calc(100% - 10px)" height="calc(100% - 10px)" strokeWidth="1" strokeDasharray="4 2" rx="3" />
          
          {/* Scrolled Damascene Leaf Vines in Corners */}
          <g transform="translate(12, 12)">
            <path d="M0,0 C12,0 24,6 24,20 C14,14 6,22 0,22 Z" fill="#1d4ed8" opacity="0.75" />
            <circle cx="16" cy="16" r="3.5" fill="#3b82f6" />
          </g>
          <g transform="translate(calc(100% - 36px), 12)">
            <path d="M24,0 C12,0 0,6 0,20 C10,14 18,22 24,22 Z" fill="#1d4ed8" opacity="0.75" />
            <circle cx="8" cy="16" r="3.5" fill="#3b82f6" />
          </g>
          <g transform="translate(12, calc(100% - 34px))">
            <path d="M0,22 C12,22 24,16 24,2 C14,8 6,0 0,0 Z" fill="#1d4ed8" opacity="0.75" />
            <circle cx="16" cy="6" r="3.5" fill="#3b82f6" />
          </g>
          <g transform="translate(calc(100% - 36px), calc(100% - 34px))">
            <path d="M24,22 C12,22 0,16 0,2 C10,8 18,0 24,0 Z" fill="#1d4ed8" opacity="0.75" />
            <circle cx="8" cy="6" r="3.5" fill="#3b82f6" />
          </g>
        </g>
      )}

      {/* 4. ISLAMIC POINTED MIHRAB (محراب وقوس عثماني مذهب) */}
      {frameId === 'islamic_pointed_mihrab' && (
        <g stroke={effectiveStroke} fill="none">
          {/* Base outer line */}
          <rect x="0" y="0" width="100%" height="100%" strokeWidth="2" rx="4" />
          {/* Inner Mihrab Arch Path on top */}
          <path 
            d="M 12,60 L 12,calc(100% - 12px) L calc(100% - 12px),calc(100% - 12px) L calc(100% - 12px),60 Q calc(100% - 12px),24 calc(50%),10 Q 12,24 12,60 Z" 
            strokeWidth="1.5" 
          />
          {/* Apex Crescent illumination */}
          <g transform="translate(calc(50%), 12)">
            <circle cx="0" cy="0" r="4" fill={effectiveStroke} />
            <path d="M0,-8 L0,8 M-8,0 L8,0" strokeWidth="1" />
          </g>
        </g>
      )}

      {/* 5. VINTAGE MARBLED GILT (تعتيق مخطوطات وزوايا مقوسة) */}
      {frameId === 'vintage_marbled_gilt' && (
        <g stroke={effectiveStroke} fill="none">
          <rect x="0" y="0" width="100%" height="100%" strokeWidth="3" />
          <rect x="7" y="7" width="calc(100% - 14px)" height="calc(100% - 14px)" strokeWidth="1" />
          
          {/* Inset Inverted Curved Corners */}
          <path d="M 0,24 Q 24,24 24,0" strokeWidth="1.5" />
          <path d="M calc(100%),24 Q calc(100% - 24px),24 calc(100% - 24px),0" strokeWidth="1.5" />
          <path d="M 0,calc(100% - 24px) Q 24,calc(100% - 24px) 24,calc(100%)" strokeWidth="1.5" />
          <path d="M calc(100%),calc(100% - 24px) Q calc(100% - 24px),calc(100% - 24px) calc(100% - 24px),calc(100%)" strokeWidth="1.5" />
          
          {/* Small corner diamond ornaments */}
          <polygon points="12,12 15,15 12,18 9,15" fill={effectiveStroke} />
          <polygon points="calc(100% - 12px),12 calc(100% - 9px),15 calc(100% - 12px),18 calc(100% - 15px),15" fill={effectiveStroke} />
          <polygon points="12,calc(100% - 18px) 15,calc(100% - 15px) 12,calc(100% - 12px) 9,calc(100% - 15px)" fill={effectiveStroke} />
          <polygon points="calc(100% - 12px),calc(100% - 18px) calc(100% - 9px),calc(100% - 15px) calc(100% - 12px),calc(100% - 12px) calc(100% - 15px),calc(100% - 15px)" fill={effectiveStroke} />
        </g>
      )}

      {/* 6. ANDALUSIAN EMERALD (أرابيسك زمردي مطعم بالذهب) */}
      {frameId === 'andalusian_emerald' && (
        <g>
          <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#047857" strokeWidth="4" rx="6" />
          <rect x="6" y="6" width="calc(100% - 12px)" height="calc(100% - 12px)" fill="none" stroke="#fbbf24" strokeWidth="1.5" rx="4" />
          {/* Gold Studs in corners */}
          <circle cx="12" cy="12" r="3.5" fill="#f59e0b" stroke="#047857" strokeWidth="1" />
          <circle cx="calc(100% - 12px)" cy="12" r="3.5" fill="#f59e0b" stroke="#047857" strokeWidth="1" />
          <circle cx="12" cy="calc(100% - 12px)" r="3.5" fill="#f59e0b" stroke="#047857" strokeWidth="1" />
          <circle cx="calc(100% - 12px)" cy="calc(100% - 12px)" r="3.5" fill="#f59e0b" stroke="#047857" strokeWidth="1" />
        </g>
      )}

      {/* 7. IMPERIAL CRIMSON (قرمزي إمبراطوري مخملي) */}
      {frameId === 'imperial_crimson' && (
        <g>
          <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#881337" strokeWidth="5" rx="8" />
          <rect x="8" y="8" width="calc(100% - 16px)" height="calc(100% - 16px)" fill="none" stroke="#fde047" strokeWidth="1" strokeDasharray="3 3" rx="4" />
          {/* Crown crest in center top */}
          <g transform="translate(calc(50% - 15px), 2)">
            <polygon points="15,0 20,8 27,2 25,12 5,12 3,2 10,8" fill="#eab308" />
          </g>
        </g>
      )}

      {/* 8. BOTANICAL PASTEL WREATH (إكليل أزهار ربيعية رقيقة) */}
      {frameId === 'botanical_pastel_wreath' && (
        <g>
          <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#f472b6" strokeWidth="1" strokeDasharray="6 4" rx="16" />
          {/* Flowers at top left */}
          <g transform="translate(14, 14)">
            <circle cx="0" cy="0" r="6" fill="#fb7185" opacity="0.9" />
            <circle cx="5" cy="5" r="4" fill="#f43f5e" opacity="0.8" />
            <path d="M0,0 C6,-6 14,-2 10,6 C4,4 2,1 0,0 Z" fill="#86efac" />
          </g>
          {/* Flowers at bottom right */}
          <g transform="translate(calc(100% - 14px), calc(100% - 14px))">
            <circle cx="0" cy="0" r="6" fill="#fb7185" opacity="0.9" />
            <circle cx="-5" cy="-5" r="4" fill="#f43f5e" opacity="0.8" />
            <path d="M0,0 C-6,6 -14,2 -10,-6 C-4,-4 -2,-1 0,0 Z" fill="#86efac" />
          </g>
        </g>
      )}

      {/* 9. MOROCCAN ZELLIJ (زليج مغربي هندسي ملون) */}
      {frameId === 'moroccan_zellij' && (
        <g stroke="#0369a1" fill="none">
          <rect x="0" y="0" width="100%" height="100%" strokeWidth="3" />
          <rect x="6" y="6" width="calc(100% - 12px)" height="calc(100% - 12px)" stroke="#ea580c" strokeWidth="1.5" />
          <rect x="11" y="11" width="calc(100% - 22px)" height="calc(100% - 22px)" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 2" />
        </g>
      )}

      {/* 10. ANTIQUE SEPIA INLAY (تطعيم خشب الجوز ودبابيس برونز) */}
      {frameId === 'antique_sepia_inlay' && (
        <g stroke="#573318" fill="none">
          <rect x="0" y="0" width="100%" height="100%" strokeWidth="4" rx="2" />
          <rect x="6" y="6" width="calc(100% - 12px)" height="calc(100% - 12px)" stroke="#b45309" strokeWidth="1" rx="1" />
          {/* Rivets */}
          <circle cx="10" cy="10" r="2.5" fill="#d97706" stroke="#451a03" strokeWidth="1" />
          <circle cx="calc(100% - 10px)" cy="10" r="2.5" fill="#d97706" stroke="#451a03" strokeWidth="1" />
          <circle cx="10" cy="calc(100% - 10px)" r="2.5" fill="#d97706" stroke="#451a03" strokeWidth="1" />
          <circle cx="calc(100% - 10px)" cy="calc(100% - 10px)" r="2.5" fill="#d97706" stroke="#451a03" strokeWidth="1" />
        </g>
      )}

    </svg>
  );
};

// =========================================================================
// 🪶 14 PLACABLE FREE ORNAMENTS (RENDERED ON CANVAS)
// =========================================================================

interface FreeOrnamentRendererProps {
  type: OrnamentTypeId;
  size: number;
  color: string;
}

export const FreeOrnamentRenderer: React.FC<FreeOrnamentRendererProps> = ({
  type,
  size,
  color
}) => {
  const isGold = color === 'gold' || color === 'gold_metallic';
  const fill = isGold ? '#d4af37' : color;

  switch (type) {
    case 'bismillah':
      return (
        <svg width={size * 1.8} height={size * 0.7} viewBox="0 0 200 70" fill="none" className="overflow-visible">
          <path
            d="M20,35 C40,15 70,10 90,30 C105,45 130,20 155,25 C170,28 185,45 170,55 C150,65 120,50 100,52 C80,54 50,60 30,50 Z"
            fill={fill}
            opacity="0.25"
          />
          <text 
            x="100" 
            y="44" 
            textAnchor="middle" 
            fill={fill} 
            fontSize="30" 
            fontFamily="'Amiri', 'Katibeh', serif"
            fontWeight="bold"
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </text>
        </svg>
      );

    case 'allah_monogram':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="44" stroke={fill} strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="38" stroke={fill} strokeWidth="1" />
          <text 
            x="50" 
            y="62" 
            textAnchor="middle" 
            fill={fill} 
            fontSize="36" 
            fontFamily="'Amiri', serif"
            fontWeight="bold"
          >
            اللّٰه
          </text>
        </svg>
      );

    case 'prophet_durood':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <polygon points="50,5 62,35 95,38 70,60 78,92 50,75 22,92 30,60 5,38 38,35" stroke={fill} strokeWidth="1.5" fill="none" />
          <text 
            x="50" 
            y="57" 
            textAnchor="middle" 
            fill={fill} 
            fontSize="24" 
            fontFamily="'Amiri', serif"
            fontWeight="bold"
          >
            ﷺ
          </text>
        </svg>
      );

    case 'shamseh':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="42" stroke={fill} strokeWidth="2" />
          <circle cx="50" cy="50" r="32" stroke={fill} strokeWidth="1" strokeDasharray="4 2" />
          <circle cx="50" cy="50" r="10" fill={fill} />
          {/* 8 rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <g key={i} transform={`rotate(${angle} 50 50)`}>
              <line x1="50" y1="8" x2="50" y2="18" stroke={fill} strokeWidth="2" />
              <circle cx="50" cy="6" r="2" fill={fill} />
            </g>
          ))}
        </svg>
      );

    case 'crescent_star':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <path
            d="M60,15 C38,15 20,33 20,55 C20,77 38,95 60,95 C45,85 36,68 36,55 C36,42 45,25 60,15 Z"
            fill={fill}
          />
          {/* Star */}
          <polygon
            points="68,40 71,48 80,48 73,53 76,61 68,56 61,61 64,53 57,48 65,48"
            fill={fill}
          />
        </svg>
      );

    case 'calligraphy_divider':
      return (
        <svg width={size * 2} height={size * 0.4} viewBox="0 0 200 40" fill="none">
          <line x1="10" y1="20" x2="80" y2="20" stroke={fill} strokeWidth="1.5" />
          <line x1="120" y1="20" x2="190" y2="20" stroke={fill} strokeWidth="1.5" />
          {/* Center Rosette */}
          <polygon points="100,10 108,20 100,30 92,20" fill={fill} />
          <circle cx="100" cy="20" r="2.5" fill="#fff" />
          <circle cx="85" cy="20" r="2" fill={fill} />
          <circle cx="115" cy="20" r="2" fill={fill} />
        </svg>
      );

    case 'tughra':
      return (
        <svg width={size * 1.3} height={size} viewBox="0 0 120 100" fill="none">
          <path
            d="M30,85 C20,85 10,75 10,60 C10,40 30,30 45,25 C35,20 30,12 30,5 C30,10 40,20 60,25 C75,15 85,5 90,5 C88,15 78,25 65,30 C90,32 110,45 110,65 C110,80 95,85 75,85 C55,85 45,80 30,85 Z"
            stroke={fill}
            strokeWidth="2"
            fill="none"
          />
          <path d="M40,55 L85,55 M45,65 L80,65" stroke={fill} strokeWidth="1.5" />
        </svg>
      );

    case 'mihrab_arch':
      return (
        <svg width={size} height={size * 1.1} viewBox="0 0 100 110" fill="none">
          <path
            d="M15,100 L15,50 Q15,15 50,5 Q85,15 85,50 L85,100 Z"
            stroke={fill}
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M25,100 L25,52 Q25,25 50,15 Q75,25 75,52 L75,100 Z"
            stroke={fill}
            strokeWidth="1"
            strokeDasharray="3 2"
            fill="none"
          />
          <circle cx="50" cy="8" r="3" fill={fill} />
        </svg>
      );

    case 'royal_corner':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <path
            d="M5,5 L70,5 C55,5 45,15 45,30 C45,45 30,45 30,45 C30,45 30,55 15,70 L5,70 Z"
            fill={fill}
            opacity="0.8"
          />
          <circle cx="20" cy="20" r="5" fill="#fff" />
          <circle cx="20" cy="20" r="2.5" fill={fill} />
        </svg>
      );

    case 'floral_sprig':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <path d="M20,80 Q50,50 80,20" stroke={fill} strokeWidth="2" strokeLinecap="round" />
          <path d="M35,65 Q30,50 42,52 Q48,60 35,65 Z" fill="#10b981" />
          <path d="M60,40 Q55,25 68,28 Q72,36 60,40 Z" fill="#10b981" />
          {/* Blossom */}
          <circle cx="80" cy="20" r="9" fill="#f43f5e" />
          <circle cx="80" cy="20" r="4" fill="#fecdd3" />
        </svg>
      );

    case 'wildflower_bouquet':
      return (
        <svg width={size * 1.2} height={size} viewBox="0 0 120 100" fill="none">
          <path d="M50,90 Q58,60 60,35" stroke="#15803d" strokeWidth="2" />
          <path d="M65,90 Q62,65 75,40" stroke="#15803d" strokeWidth="2" />
          <path d="M45,90 Q40,65 30,45" stroke="#15803d" strokeWidth="2" />
          {/* Left Flower */}
          <circle cx="30" cy="45" r="9" fill="#3b82f6" />
          <circle cx="30" cy="45" r="4" fill="#fbbf24" />
          {/* Center Flower */}
          <circle cx="60" cy="35" r="12" fill="#ef4444" />
          <circle cx="60" cy="35" r="5" fill="#fef08a" />
          {/* Right Flower */}
          <circle cx="75" cy="40" r="10" fill="#ec4899" />
          <circle cx="75" cy="40" r="4" fill="#fde047" />
        </svg>
      );

    case 'arabesque_lotus':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <path
            d="M50,15 C60,30 75,45 85,55 C70,60 55,55 50,75 C45,55 30,60 15,55 C25,45 40,30 50,15 Z"
            fill={fill}
          />
          <circle cx="50" cy="50" r="4" fill="#fff" />
        </svg>
      );

    case 'islamic_star_8':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <polygon points="50,10 62,25 80,20 75,38 90,50 75,62 80,80 62,75 50,90 38,75 20,80 25,62 10,50 25,38 20,20 38,25" fill={fill} />
          <circle cx="50" cy="50" r="14" fill="#fff" />
          <circle cx="50" cy="50" r="6" fill={fill} />
        </svg>
      );

    case 'feather_quill':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          {/* Feather Quill */}
          <path
            d="M30,80 C35,60 45,30 75,15 C72,25 70,35 60,45 C55,50 52,60 40,75 L30,80 Z"
            fill={fill}
          />
          <line x1="30" y1="80" x2="75" y2="15" stroke="#fff" strokeWidth="1" />
          {/* Inkwell */}
          <rect x="18" y="75" width="22" height="15" rx="3" fill="#1e293b" />
          <rect x="22" y="70" width="14" height="5" rx="1" fill="#475569" />
        </svg>
      );

    default:
      return null;
  }
};
