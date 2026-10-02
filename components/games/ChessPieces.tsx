import React from 'react';

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

interface ChessPieceIconProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
  size?: number;
}

export const ChessPieceIcon: React.FC<ChessPieceIconProps> = ({
  type,
  color,
  className = '',
  size = 48
}) => {
  const isWhite = color === 'w';
  const fill = isWhite ? '#f8fafc' : '#1e293b';
  const stroke = isWhite ? '#475569' : '#0f172a';
  const accent = isWhite ? '#e2e8f0' : '#334155';

  const renderPiece = () => {
    switch (type) {
      case 'k': // King
        return (
          <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
            {/* Cross */}
            <line x1="24" y1="6" x2="24" y2="14" strokeWidth="2.5" stroke={stroke} />
            <line x1="20" y1="9" x2="28" y2="9" strokeWidth="2.5" stroke={stroke} />
            {/* Crown */}
            <path d="M14 18 C14 14, 34 14, 34 18 L36 30 C36 34, 12 34, 12 30 Z" fill={fill} />
            <path d="M12 28 C12 36, 36 36, 36 28 L38 38 C38 41, 10 41, 10 38 Z" fill={accent} />
            {/* Base */}
            <path d="M8 38 L40 38 L42 43 L6 43 Z" fill={fill} />
            <circle cx="24" cy="22" r="3" fill={stroke} />
          </g>
        );

      case 'q': // Queen
        return (
          <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
            {/* Crown spikes */}
            <circle cx="12" cy="14" r="2" fill={stroke} />
            <circle cx="18" cy="11" r="2" fill={stroke} />
            <circle cx="24" cy="9" r="2.5" fill={stroke} />
            <circle cx="30" cy="11" r="2" fill={stroke} />
            <circle cx="36" cy="14" r="2" fill={stroke} />
            <path d="M12 16 L15 28 L33 28 L36 16 L29 23 L24 13 L19 23 Z" fill={fill} />
            {/* Body */}
            <path d="M14 28 C14 34, 34 34, 34 28 L36 38 L12 38 Z" fill={accent} />
            {/* Base */}
            <path d="M8 38 L40 38 L42 43 L6 43 Z" fill={fill} />
          </g>
        );

      case 'r': // Rook
        return (
          <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
            {/* Battlements */}
            <path d="M13 14 L13 20 L17 20 L17 14 L21 14 L21 20 L27 20 L27 14 L31 14 L31 20 L35 20 L35 14 L37 20 L37 24 L11 24 L11 20 Z" fill={fill} />
            {/* Tower Body */}
            <path d="M14 24 L16 36 L32 36 L34 24 Z" fill={accent} />
            {/* Base */}
            <path d="M10 36 L38 36 L40 43 L8 43 Z" fill={fill} />
            <line x1="16" y1="28" x2="32" y2="28" stroke={stroke} strokeWidth="1.5" />
          </g>
        );

      case 'b': // Bishop
        return (
          <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
            <circle cx="24" cy="8" r="2" fill={stroke} />
            {/* Mitre head */}
            <path d="M16 28 C14 20, 20 12, 24 10 C28 12, 34 20, 32 28 Z" fill={fill} />
            {/* Slit */}
            <path d="M22 15 L26 23" stroke={stroke} strokeWidth="2" />
            {/* Neck & Body */}
            <path d="M16 28 L14 36 L34 36 L32 28 Z" fill={accent} />
            {/* Base */}
            <path d="M10 36 L38 36 L40 43 L8 43 Z" fill={fill} />
          </g>
        );

      case 'n': // Knight
        return (
          <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
            {/* Horse Head */}
            <path d="M14 42 L36 42 L36 38 C36 34, 34 26, 30 20 C28 14, 25 10, 21 8 C20 8, 19 10, 19 12 C18 10, 16 9, 15 11 C14 13, 14 17, 16 19 C14 19, 11 21, 10 24 C9 27, 11 31, 15 31 C17 31, 18 29, 18 29 C16 33, 15 37, 14 42 Z" fill={fill} />
            {/* Eye */}
            <circle cx="18" cy="16" r="1.5" fill={stroke} />
            {/* Mane */}
            <path d="M26 12 C28 16, 29 22, 28 28" stroke={stroke} strokeWidth="1.5" fill="none" />
            {/* Base */}
            <path d="M8 38 L40 38 L42 43 L6 43 Z" fill={fill} />
          </g>
        );

      case 'p': // Pawn
      default:
        return (
          <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
            {/* Head */}
            <circle cx="24" cy="14" r="6" fill={fill} />
            {/* Neck collar */}
            <path d="M18 22 L30 22 L28 26 L20 26 Z" fill={stroke} />
            {/* Body */}
            <path d="M20 26 L16 36 L32 36 L28 26 Z" fill={accent} />
            {/* Base */}
            <path d="M10 36 L38 36 L40 43 L8 43 Z" fill={fill} />
          </g>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={`inline-block select-none filter drop-shadow-md ${className}`}
    >
      {renderPiece()}
    </svg>
  );
};

export default ChessPieceIcon;
