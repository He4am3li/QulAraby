import React from 'react';

export interface GeometricShapeItem {
  id: string;
  name: string;
  defaultColor: string;
  renderSVG: (filled: boolean, color?: string, size?: number) => React.ReactNode;
}

export const GEOMETRIC_SHAPES: GeometricShapeItem[] = [
  // Row 1
  {
    id: 'triangle',
    name: 'مثلث',
    defaultColor: '#10b981', // emerald
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#10b981';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <polygon
            points="50,15 88,85 12,85"
            fill={filled ? c : `${c}15`}
            stroke={c}
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  },
  {
    id: 'circle',
    name: 'دائرة',
    defaultColor: '#ec4899', // pink
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#ec4899';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <circle
            cx="50"
            cy="50"
            r="38"
            fill={filled ? c : `${c}15`}
            stroke={c}
            strokeWidth="6"
          />
        </svg>
      );
    }
  },
  {
    id: 'square',
    name: 'مربع',
    defaultColor: '#3b82f6', // blue
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#3b82f6';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <rect
            x="16"
            y="16"
            width="68"
            height="68"
            rx="12"
            fill={filled ? c : `${c}15`}
            stroke={c}
            strokeWidth="6"
          />
        </svg>
      );
    }
  },
  {
    id: 'rect',
    name: 'مستطيل',
    defaultColor: '#2563eb', // deep blue
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#2563eb';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <rect
            x="10"
            y="26"
            width="80"
            height="48"
            rx="8"
            fill={filled ? c : `${c}15`}
            stroke={c}
            strokeWidth="6"
          />
        </svg>
      );
    }
  },

  // Row 2
  {
    id: 'diamond',
    name: 'معين',
    defaultColor: '#c084fc', // purple / violet
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#c084fc';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <polygon
            points="50,12 88,50 50,88 12,50"
            fill={filled ? c : `${c}15`}
            stroke={c}
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  },
  {
    id: 'hexagon',
    name: 'سداسي',
    defaultColor: '#f59e0b', // amber / yellow
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#f59e0b';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <polygon
            points="50,14 85,32 85,68 50,86 15,68 15,32"
            fill={filled ? c : `${c}15`}
            stroke={c}
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  },
  {
    id: 'pentagon',
    name: 'خماسي',
    defaultColor: '#f97316', // orange
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#f97316';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <polygon
            points="50,12 88,40 74,86 26,86 12,40"
            fill={filled ? c : `${c}15`}
            stroke={c}
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  },
  {
    id: 'right_triangle',
    name: 'مثلث قائم',
    defaultColor: '#a855f7', // purple
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#a855f7';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <polygon
            points="18,15 18,85 88,85"
            fill={filled ? c : `${c}15`}
            stroke={c}
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  },

  // Row 3
  {
    id: 'cylinder',
    name: 'أسطوانة',
    defaultColor: '#06b6d4', // cyan
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#06b6d4';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <g>
            <path
              d="M26,30 L26,70 C26,80 74,80 74,70 L74,30"
              fill={filled ? c : `${c}15`}
              stroke={c}
              strokeWidth="5.5"
              strokeLinejoin="round"
            />
            <ellipse
              cx="50"
              cy="30"
              rx="24"
              ry="10"
              fill={filled ? c : `${c}20`}
              stroke={c}
              strokeWidth="5.5"
            />
          </g>
        </svg>
      );
    }
  },
  {
    id: 'cube',
    name: 'مكعب',
    defaultColor: '#f43f5e', // red/rose
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#f43f5e';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <g stroke={c} strokeWidth="5" strokeLinejoin="round" fill={filled ? c : `${c}15`}>
            {/* Top face */}
            <polygon points="50,15 82,32 50,50 18,32" fill={filled ? `${c}` : `${c}25`} />
            {/* Left face */}
            <polygon points="18,32 50,50 50,85 18,68" fill={filled ? `${c}` : `${c}15`} opacity={filled ? 0.85 : 1} />
            {/* Right face */}
            <polygon points="50,50 82,32 82,68 50,85" fill={filled ? `${c}` : `${c}10`} opacity={filled ? 0.7 : 1} />
          </g>
        </svg>
      );
    }
  },
  {
    id: 'trapezoid',
    name: 'شبه منحرف',
    defaultColor: '#f87171', // coral/salmon
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#f87171';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <polygon
            points="32,22 68,22 86,78 14,78"
            fill={filled ? c : `${c}15`}
            stroke={c}
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  },
  {
    id: 'parallelogram',
    name: 'متوازي أضلاع',
    defaultColor: '#14b8a6', // teal
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#14b8a6';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <polygon
            points="34,22 88,22 66,78 12,78"
            fill={filled ? c : `${c}15`}
            stroke={c}
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  },

  // Row 4
  {
    id: 'speech_bubble',
    name: 'فقاعة كلام',
    defaultColor: '#38bdf8', // sky
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#38bdf8';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <path
            d="M20,22 C14.5,22 10,26.5 10,32 L10,64 C10,69.5 14.5,74 20,74 L30,74 L25,88 L46,74 L80,74 C85.5,74 90,69.5 90,64 L90,32 C90,26.5 85.5,22 80,22 Z"
            fill={filled ? c : `${c}15`}
            stroke={c}
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  },
  {
    id: 'heart',
    name: 'قلب',
    defaultColor: '#ef4444', // red
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#ef4444';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <path
            d="M50,85 C50,85 14,60 14,35 C14,20 26,12 37,18 C44,22 50,30 50,30 C50,30 56,22 63,18 C74,12 86,20 86,35 C86,60 50,85 50,85 Z"
            fill={filled ? c : `${c}15`}
            stroke={c}
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  },
  {
    id: 'star',
    name: 'نجمة',
    defaultColor: '#eab308', // gold/yellow
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#eab308';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <polygon
            points="50,10 62,37 91,37 68,55 76,84 50,66 24,84 32,55 9,37 38,37"
            fill={filled ? c : `${c}15`}
            stroke={c}
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  },
  {
    id: 'cone',
    name: 'مخروط',
    defaultColor: '#d97706', // amber/gold
    renderSVG: (filled, color, size = 44) => {
      const c = color || '#d97706';
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
          <g>
            <polygon
              points="50,15 82,72 18,72"
              fill={filled ? c : `${c}15`}
              stroke={c}
              strokeWidth="5.5"
              strokeLinejoin="round"
            />
            <ellipse
              cx="50"
              cy="72"
              rx="32"
              ry="12"
              fill={filled ? c : `${c}20`}
              stroke={c}
              strokeWidth="5.5"
            />
          </g>
        </svg>
      );
    }
  }
];
