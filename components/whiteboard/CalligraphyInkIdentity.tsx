import React from 'react';

/**
 * Quiet decorative ink traces for the QUL calligraphy studio.
 *
 * The four vector silhouettes are traced from the faint background marks in
 * the reference illustration supplied for this design. They are intentionally
 * NOT font glyphs, not a repeating text pattern and not part of the artwork
 * that a student exports.
 */
interface CalligraphyInkIdentityProps {
  variant?: 'studio' | 'header' | 'panel';
}

const TRACES = {
  upperLeft: "M489,176 462,200 479,200Z M97,172 103,184 119,186 133,171 161,171 180,181 190,200 194,190 188,191 185,182 214,182 216,200 224,181 217,170 204,177 199,171 200,180 180,180 152,145 146,146 158,163 123,159Z M486,113 494,119 499,109 501,115 514,117 521,111 529,122 522,137 545,135 554,142 548,132 528,131 540,129 540,121 553,131 547,125 550,118 554,121 549,114 509,107Z M132,100 127,121 139,139 146,140 136,122 143,108 153,108 149,102Z M486,52 469,55 451,79 439,112 445,108 454,116 443,115 441,121 438,115 436,127 446,142 497,138 499,132 501,138 519,137 518,127 509,128 516,129 513,137 500,132 494,121 486,124 494,124 494,131 485,130 489,133 478,136 477,126 469,138 455,133 458,125 468,123 454,122 462,119 449,106 450,93 463,82 476,84 467,74 477,78Z M204,25 216,64 242,114 256,128 277,127 283,111 274,79 266,110 248,104Z M307,0 320,100 333,125 348,131 334,200 348,200 346,173 365,106 366,69 354,103 332,97 318,63Z",
  upperRight: "M350,168 354,175 349,181 344,177 346,191 361,191 364,175Z M27,130 5,155 9,168 20,171 44,159 29,160 21,152Z M303,108 288,110 280,127 281,137 294,136 283,132 284,125 292,123 289,129 300,133 295,145 300,148 293,156 286,147 279,173 260,191 283,191 321,175 322,169 346,170 319,169 318,175 293,182 279,179 302,155 307,133Z M81,95 37,120 35,129Z M253,50 231,59 229,84 221,89 201,133 166,158 197,141 228,113 249,75Z M112,0 95,8 70,35 65,56 72,67 92,68 129,47 96,56 87,48 89,29 84,37 79,32Z M0,3 0,11 12,2 10,9 35,18 47,16 53,8 51,0Z",
  left: "M164,787 126,798 164,793Z M111,702 104,725 119,735 129,723 116,716 120,712 114,712Z M55,665 60,666 59,675 71,681 133,666 128,682 111,698 130,710 121,690 129,689 161,655 141,654 104,670 80,673 72,664 79,650 60,655Z M164,544 151,551 153,558 156,552 162,555 155,565 164,588Z M125,543 114,534 80,530 104,542 105,550 95,560 64,568 16,570 27,574 104,566 121,559 123,548 117,546Z M159,527 147,535 149,544 164,540 152,539 162,534Z M46,437 26,447 10,465 13,479 32,480 40,466 35,455 51,445Z M0,388 0,417 59,425 63,430 51,435 53,441 86,433 63,421 2,412 0,406 19,390Z M164,300 158,346 163,359Z M32,197 73,318 82,330 107,421 117,414 122,417 118,427 110,425 116,442 125,435 132,442 129,447 135,455 126,459 123,470 132,471 125,478 136,510 142,510 141,521 148,525 143,526 145,531 157,517 123,408 111,410 105,402 108,395 113,404 119,399 66,225 56,208Z M68,76 117,227 127,244 133,242 128,252 153,264 143,235 135,230 137,221 119,225 128,213 129,218 136,215 95,92Z M136,48 164,69 164,60 140,45Z M106,20 133,46 135,42Z",
  right: "M0,806 0,845 11,825Z M45,764 26,751 22,766 16,760 19,755 17,768 9,762 0,770 10,778 18,771 21,775 15,776 20,779 24,772 40,772Z M0,664 1,690 94,740 78,703 39,689Z M49,542 41,603 55,625 55,587 71,563 80,565 88,580 87,590 70,598 75,608 92,613 99,594 82,548 65,547 57,554Z M14,387 6,393 9,399 0,401 0,422 9,430 34,410 33,402Z M63,326 91,375 95,393 106,410 113,408 109,416 134,465 108,468 98,459 64,455 28,460 18,475 20,483 53,502 56,497 68,503 43,486 44,471 98,465 134,472 134,425 87,334Z M2,231 2,250 14,259 19,255 17,262 35,272 21,251 13,250 24,239 22,232 28,238 41,233 49,240 63,240 105,260 119,250 128,261 121,266 116,264 119,260 113,262 128,278 117,293 125,299 123,304 115,305 130,322 134,320 133,230 110,254 32,227Z M132,133 119,117 93,109 76,114 67,152 0,127 0,137 31,149 36,146 39,152 80,154 84,158 68,164 74,166 66,174 83,170 80,163 84,165 90,155 108,154 115,143 118,148 127,144Z M0,70 0,80 13,78Z M0,37 0,47 26,40 84,43Z"
};

export const CalligraphyInkIdentity: React.FC<CalligraphyInkIdentityProps> = ({
  variant = 'studio'
}) => {
  const narrow = variant !== 'studio';
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: variant === 'header' ? 15 : 0, opacity: narrow ? 0.24 : 0.18 }}
    >
      <svg
        className={`absolute inset-0 h-full w-full ${narrow ? "" : "hidden md:block"}`}
        viewBox={narrow ? '0 0 1440 120' : '0 0 1440 900'}
        preserveAspectRatio={narrow ? 'xMidYMid meet' : 'xMidYMid slice'}
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        fill="none"
      >
        <defs>
          <linearGradient id={`inkTrace-${variant}`} x1="0%" y1="10%" x2="100%" y2="95%">
            <stop offset="0%" stopColor="#dbd6c8" />
            <stop offset="48%" stopColor="#bcb19d" />
            <stop offset="100%" stopColor="#958a75" />
          </linearGradient>
          <filter id={`inkBlur-${variant}`} x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="0.65" />
          </filter>
        </defs>
        <g
          fill={`url(#inkTrace-${variant})`}
          strokeLinejoin="round"
          filter={`url(#inkBlur-${variant})`}
        >
          {narrow ? (
            <>
              <path d={TRACES.upperLeft} transform="translate(50 7) scale(.53)" />
              <path d={TRACES.upperRight} transform="translate(1130 3) scale(.55)" />
            </>
          ) : (
            <>
              <path d={TRACES.upperLeft} transform="translate(62 54) scale(.85)" />
              <path d={TRACES.upperRight} transform="translate(1020 44) scale(.82)" />
              <path d={TRACES.left} transform="translate(48 230) scale(.67)" opacity=".72" />
              <path d={TRACES.right} transform="translate(1300 210) scale(.7)" opacity=".75" />
            </>
          )}
        </g>
      </svg>
      {!narrow && (
        <svg
          className="absolute inset-0 w-full h-full md:hidden"
          viewBox="0 0 420 820"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
          aria-hidden="true"
          fill="#c8bbaa"
        >
          {/* Mobile arrangement keeps the traced shapes near the margins instead
              of cropping all decorative content out of a wide desktop SVG. */}
          <path d={TRACES.upperLeft} transform="translate(-128 17) scale(.65)" opacity=".86" />
          <path d={TRACES.upperRight} transform="translate(252 88) scale(.54)" opacity=".8" />
          <path d={TRACES.left} transform="translate(-45 274) scale(.48)" opacity=".65" />
          <path d={TRACES.right} transform="translate(379 292) scale(.43)" opacity=".68" />
        </svg>
      )}
    </div>
  );
};
