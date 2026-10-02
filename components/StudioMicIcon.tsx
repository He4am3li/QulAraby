import React from 'react';

interface StudioMicIconProps {
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

/**
 * High-Clarity Vintage Podcast Studio Microphone Icon
 * Inspired by the classic Shure 55SH "Elvis/Podcast" broadcast microphone.
 * Features:
 * - Bold curved vintage bullet capsule with ribbed grille slats
 * - Distinct central dividing spine
 * - Swivel joint mount with pivot knob
 * - Heavy-duty studio desktop stand & stepped weighted base
 */
export const StudioMicIcon: React.FC<StudioMicIconProps> = ({
  size = 80,
  className = 'text-current',
  strokeWidth = 2.4,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* --- 1. BASE: Stepped Elliptical Cast-Iron Desk Stand --- */}
      {/* Lower Base Ring */}
      <ellipse
        cx="60"
        cy="104"
        rx="36"
        ry="9"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      {/* Upper Base Bevel Plate */}
      <ellipse
        cx="60"
        cy="101"
        rx="26"
        ry="6.5"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.9}
      />
      {/* Base Center Collar */}
      <ellipse
        cx="60"
        cy="96"
        rx="11"
        ry="3.5"
        fill="currentColor"
        fillOpacity="0.35"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.8}
      />

      {/* --- 2. SHAFT: Heavy Chrome Vertical Stand Neck --- */}
      <path
        d="M 55.5 96 L 55.5 68 L 64.5 68 L 64.5 96 Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      {/* Stand Neck Highlight Line */}
      <line
        x1="58.5"
        y1="70"
        x2="58.5"
        y2="94"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeOpacity={0.4}
      />

      {/* --- 3. MOUNT: Swivel Neck Joint & Side Pivot Thumb Screws --- */}
      <path
        d="M 51 54 C 51 63 54 68 60 68 C 66 68 69 63 69 54 Z"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      {/* Center Pivot Axis Screw */}
      <circle
        cx="60"
        cy="61"
        r="3.5"
        fill="white"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.9}
      />

      {/* --- 4. MICROPHONE CAPSULE BODY (Vintage Shure 55 Unidyne Silhouette) --- */}
      {/* Outer Shell Contour */}
      <path
        d="M 40 48 C 38 35 39 16 60 9 C 81 16 82 35 80 48 C 78 54 72 55 60 55 C 48 55 42 54 40 48 Z"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth={strokeWidth * 1.25}
      />

      {/* Rear Housing Solid Shading (gives 3D depth to the mic) */}
      <path
        d="M 40 48 C 38 35 39 16 60 9 L 60 55 C 48 55 42 54 40 48 Z"
        fill="currentColor"
        fillOpacity="0.06"
      />

      {/* Center Vertical Chrome Spine / Ridge */}
      <path
        d="M 60 9.5 L 60 54.5"
        stroke="currentColor"
        strokeWidth={strokeWidth * 1.3}
      />

      {/* --- 5. HORIZONTAL GRILLE SLATS (LEFT WING) --- */}
      {/* Top Dome Arc Slats */}
      <path d="M 49 14.5 C 53 13 56.5 12.5 58.5 12.5" stroke="currentColor" strokeWidth={2.4} />
      <path d="M 44.5 19 C 50 17 55 16.5 58.5 16.5" stroke="currentColor" strokeWidth={2.4} />
      
      {/* Body Grille Louvers */}
      <path d="M 42 23.5 C 48 21.5 54 21 58.5 21" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 40.5 28 C 47 26.5 53.5 26 58.5 26" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 39.5 32.5 C 46 31 53 30.5 58.5 30.5" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 39.5 37 C 46 35.5 53 35 58.5 35" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 40 41.5 C 46 40 53 39.5 58.5 39.5" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 41.5 46 C 47 44.5 53 44 58.5 44" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 44 50.5 C 49 49 54 48.5 58.5 48.5" stroke="currentColor" strokeWidth={2.5} />

      {/* --- 6. HORIZONTAL GRILLE SLATS (RIGHT WING) --- */}
      {/* Top Dome Arc Slats */}
      <path d="M 71 14.5 C 67 13 63.5 12.5 61.5 12.5" stroke="currentColor" strokeWidth={2.4} />
      <path d="M 75.5 19 C 70 17 65 16.5 61.5 16.5" stroke="currentColor" strokeWidth={2.4} />

      {/* Body Grille Louvers */}
      <path d="M 78 23.5 C 72 21.5 66 21 61.5 21" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 79.5 28 C 73 26.5 66.5 26 61.5 26" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 80.5 32.5 C 74 31 67 30.5 61.5 30.5" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 80.5 37 C 74 35.5 67 35 61.5 35" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 80 41.5 C 74 40 67 39.5 61.5 39.5" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 78.5 46 C 73 44.5 67 44 61.5 44" stroke="currentColor" strokeWidth={2.5} />
      <path d="M 76 50.5 C 71 49 66 48.5 61.5 48.5" stroke="currentColor" strokeWidth={2.5} />

      {/* --- 7. BOTTOM CAPSULE RIM REINFORCEMENT --- */}
      <path
        d="M 42 52 C 47 54.5 53.5 55 60 55 C 66.5 55 73 54.5 78 52"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeOpacity={0.7}
      />
    </svg>
  );
};
