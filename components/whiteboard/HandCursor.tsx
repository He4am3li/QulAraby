import React from 'react';
import { WhiteboardTheme, WhiteboardTool } from '../../types/whiteboard';

interface HandCursorProps {
  x: number;
  y: number;
  isDrawing: boolean;
  theme: WhiteboardTheme;
  tool: WhiteboardTool;
  color: string;
  strokeWidth: number;
  visible: boolean;
}

export const HandCursor: React.FC<HandCursorProps> = ({
  x,
  y,
  isDrawing,
  theme,
  tool,
  color,
  strokeWidth,
  visible
}) => {
  if (!visible || tool === 'select') return null;

  // Rotation and tilt adjustments when drawing
  const tiltDeg = isDrawing ? -12 : -18;
  const scale = isDrawing ? 0.96 : 1;
  const pressOffsetY = isDrawing ? 2 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + pressOffsetY,
        transform: `translate(-14px, -12px) rotate(${tiltDeg}deg) scale(${scale})`,
        transformOrigin: '14px 12px',
        pointerEvents: 'none',
        zIndex: 50,
        transition: 'transform 0.06s ease-out',
        willChange: 'transform, left, top',
        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.35))'
      }}
    >
      {/* 1. ERASER MODE */}
      {tool === 'eraser' ? (
        <svg width="68" height="76" viewBox="0 0 68 76" fill="none">
          {/* Hand fingers holding eraser */}
          <path
            d="M26 30 C30 20, 48 20, 56 30 C60 36, 62 48, 54 58 C46 66, 30 66, 24 56 Z"
            fill="#d4a373"
            stroke="#9c6644"
            strokeWidth="1.5"
          />
          {/* Eraser body */}
          {theme === 'blackboard' ? (
            // Wooden Blackboard Duster / Sponge
            <g transform="translate(4, 2)">
              <rect x="0" y="0" width="34" height="20" rx="3" fill="#8B4513" stroke="#5c2e0b" strokeWidth="1.5" />
              <rect x="0" y="16" width="34" height="10" rx="2" fill="#e5d3b3" />
              <line x1="4" y1="20" x2="30" y2="20" stroke="#c4a482" strokeWidth="1" strokeDasharray="2 2" />
            </g>
          ) : (
            // Whiteboard / Pencil Rubber Eraser
            <g transform="translate(4, 2)">
              <rect x="0" y="0" width="32" height="22" rx="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
              <rect x="0" y="14" width="32" height="12" rx="3" fill="#ef4444" />
              <line x1="2" y1="14" x2="30" y2="14" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          )}
          {/* Realistic Thumb */}
          <path
            d="M18 42 C14 36, 16 26, 26 26 C30 26, 32 30, 30 36 C28 42, 22 46, 18 42 Z"
            fill="#e6b88a"
            stroke="#9c6644"
            strokeWidth="1.5"
          />
        </svg>
      ) : tool === 'laser' ? (
        /* 2. LASER POINTER */
        <svg width="72" height="84" viewBox="0 0 72 84" fill="none">
          {/* Hand */}
          <path
            d="M30 40 C36 28, 54 28, 62 38 C66 45, 66 58, 56 68 C46 76, 30 74, 26 62 Z"
            fill="#d4a373"
            stroke="#9c6644"
            strokeWidth="1.5"
          />
          {/* Futuristic Pen pointer body */}
          <rect x="10" y="6" width="10" height="42" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="15" cy="18" r="2.5" fill="#ef4444" className="animate-ping" />
          <path d="M15 6 L15 0" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          <circle cx="15" cy="0" r="3" fill="#ffffff" />
          {/* Thumb */}
          <path
            d="M20 48 C16 42, 18 32, 28 32 C32 32, 34 36, 32 42 Z"
            fill="#e6b88a"
            stroke="#9c6644"
            strokeWidth="1.5"
          />
        </svg>
      ) : theme === 'blackboard' ? (
        /* 3. BLACKBOARD CHALK + HAND */
        <svg width="72" height="88" viewBox="0 0 72 88" fill="none">
          {/* Realistic Chalk Stick */}
          <g transform="translate(6, 2)">
            {/* Chalk Shadow & Body */}
            <rect
              x="3"
              y="4"
              width="11"
              height="36"
              rx="2.5"
              fill={color}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="1"
            />
            {/* Chalk texture line */}
            <line x1="6" y1="6" x2="6" y2="38" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="11" y1="6" x2="11" y2="38" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Chalk tip bevel pointing exactly at (12, 10) */}
            <polygon points="3,6 14,6 12,0 5,0" fill={color} />
            <circle cx="8.5" cy="1" r="2" fill="rgba(255,255,255,0.7)" />
          </g>

          {/* Realistic Hand Silhouette Holding Chalk */}
          <path
            d="M28 34 C34 22, 54 22, 64 34 C68 42, 68 58, 58 70 C48 78, 30 76, 24 64 Z"
            fill="#d4a373"
            stroke="#8b5e3c"
            strokeWidth="1.5"
          />
          {/* Index Finger pressing chalk */}
          <path
            d="M16 28 C16 20, 24 18, 30 24 C34 28, 34 38, 28 42 C24 44, 18 38, 16 28 Z"
            fill="#e6b88a"
            stroke="#8b5e3c"
            strokeWidth="1.5"
          />
          {/* Thumb wrap */}
          <path
            d="M14 44 C10 38, 12 30, 22 30 C26 30, 28 34, 26 40 C24 46, 18 48, 14 44 Z"
            fill="#e6b88a"
            stroke="#8b5e3c"
            strokeWidth="1.5"
          />
          {/* Chalk dust highlight */}
          <circle cx="14" cy="12" r="3" fill={color} opacity="0.35" className="animate-pulse" />
        </svg>
      ) : theme === 'whiteboard' ? (
        /* 4. WHITEBOARD MARKER + HAND */
        <svg width="76" height="92" viewBox="0 0 76 92" fill="none">
          {/* Marker Pen Body */}
          <g transform="translate(6, 0)">
            {/* Main white/gray barrel */}
            <rect x="2" y="10" width="14" height="42" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Color Accent Ring on marker */}
            <rect x="2" y="14" width="14" height="6" fill={color} />
            <rect x="2" y="44" width="14" height="8" rx="2" fill={color} />
            {/* Chisel Nib Cap & Tip */}
            <polygon points="5,10 13,10 11,2 7,2" fill="#334155" />
            {/* Chisel Tip with chosen color */}
            <polygon points="7,2 11,2 10,0 8,0" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
          </g>

          {/* Hand holding marker */}
          <path
            d="M30 36 C36 24, 56 24, 66 36 C70 44, 70 60, 60 72 C50 80, 32 78, 26 66 Z"
            fill="#d4a373"
            stroke="#8b5e3c"
            strokeWidth="1.5"
          />
          {/* Index Finger */}
          <path
            d="M18 30 C18 22, 26 20, 32 26 C36 30, 36 40, 30 44 C26 46, 20 40, 18 30 Z"
            fill="#e6b88a"
            stroke="#8b5e3c"
            strokeWidth="1.5"
          />
          {/* Thumb */}
          <path
            d="M16 46 C12 40, 14 32, 24 32 C28 32, 30 36, 28 42 C26 48, 20 50, 16 46 Z"
            fill="#e6b88a"
            stroke="#8b5e3c"
            strokeWidth="1.5"
          />
        </svg>
      ) : theme === 'notebook' ? (
        /* 5. NOTEBOOK FOUNTAIN / INK PEN + HAND */
        <svg width="76" height="92" viewBox="0 0 76 92" fill="none">
          {/* Fountain Pen Body */}
          <g transform="translate(6, 0)">
            {/* Dark Glossy Barrel */}
            <rect x="4" y="12" width="10" height="42" rx="2" fill="#0f172a" stroke="#d97706" strokeWidth="1" />
            {/* Gold Trim Ring */}
            <rect x="4" y="14" width="10" height="3" fill="#f59e0b" />
            {/* Ink Window showing selected color */}
            <rect x="6" y="20" width="6" height="8" rx="1" fill={color} />
            {/* Metallic Gold Nib */}
            <polygon points="5,12 13,12 10,2 8,2" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />
            {/* Nib split and breather hole */}
            <circle cx="9" cy="6" r="0.8" fill="#1e293b" />
            <line x1="9" y1="6" x2="9" y2="1" stroke="#1e293b" strokeWidth="0.8" />
            {/* Ink tip */}
            <circle cx="9" cy="0" r="1.2" fill={color} />
          </g>

          {/* Hand holding fountain pen */}
          <path
            d="M30 36 C36 24, 56 24, 66 36 C70 44, 70 60, 60 72 C50 80, 32 78, 26 66 Z"
            fill="#d4a373"
            stroke="#8b5e3c"
            strokeWidth="1.5"
          />
          {/* Index Finger */}
          <path
            d="M18 30 C18 22, 26 20, 32 26 C36 30, 36 40, 30 44 C26 46, 20 40, 18 30 Z"
            fill="#e6b88a"
            stroke="#8b5e3c"
            strokeWidth="1.5"
          />
          {/* Thumb */}
          <path
            d="M16 46 C12 40, 14 32, 24 32 C28 32, 30 36, 28 42 C26 48, 20 50, 16 46 Z"
            fill="#e6b88a"
            stroke="#8b5e3c"
            strokeWidth="1.5"
          />
        </svg>
      ) : (
        /* 6. 9-LINES CALLIGRAPHY PENCIL + HAND */
        <svg width="76" height="92" viewBox="0 0 76 92" fill="none">
          {/* Hexagonal Pencil Body */}
          <g transform="translate(6, 0)">
            {/* Yellow/Orange wooden body */}
            <rect x="4" y="12" width="10" height="42" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
            <line x1="7.5" y1="12" x2="7.5" y2="54" stroke="#fef08a" strokeWidth="1.5" />
            <line x1="10.5" y1="12" x2="10.5" y2="54" stroke="#a16207" strokeWidth="1" />
            {/* Top Eraser ferrule on pencil */}
            <rect x="4" y="50" width="10" height="6" fill="#94a3b8" />
            <rect x="4" y="56" width="10" height="4" rx="1" fill="#f43f5e" />
            {/* Sharpened Wood Cone */}
            <polygon points="4,12 14,12 9,3" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
            {/* Sharp Graphite Lead Tip */}
            <polygon points="7.5,5.5 10.5,5.5 9,0" fill={color === '#ffffff' ? '#334155' : color} />
          </g>

          {/* Hand holding pencil */}
          <path
            d="M30 36 C36 24, 56 24, 66 36 C70 44, 70 60, 60 72 C50 80, 32 78, 26 66 Z"
            fill="#d4a373"
            stroke="#8b5e3c"
            strokeWidth="1.5"
          />
          {/* Index Finger */}
          <path
            d="M18 30 C18 22, 26 20, 32 26 C36 30, 36 40, 30 44 C26 46, 20 40, 18 30 Z"
            fill="#e6b88a"
            stroke="#8b5e3c"
            strokeWidth="1.5"
          />
          {/* Thumb */}
          <path
            d="M16 46 C12 40, 14 32, 24 32 C28 32, 30 36, 28 42 C26 48, 20 50, 16 46 Z"
            fill="#e6b88a"
            stroke="#8b5e3c"
            strokeWidth="1.5"
          />
        </svg>
      )}
    </div>
  );
};
