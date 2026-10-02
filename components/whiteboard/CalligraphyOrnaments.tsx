import React from 'react';

export type OrnamentStyleId =
  | 'none'
  | 'andalusian_corners'
  | 'mamluk_geometric'
  | 'ottoman_tezhip'
  | 'manuscript_filigree'
  | 'sultani_crest'
  | 'central_shamseh'
  | 'full_arabesque'
  | 'andalusian_frame'
  | 'star_medallion_8'
  | 'star_rosette_12'
  | 'floral_corners_frame'
  | 'ottoman_cornerpiece'
  | 'scalloped_cartouche'
  | 'dense_arabesque_corner'
  | 'mamluk_geometric_border'
  | 'palmette_inner_frame'
  | 'delicate_spandrel';

export interface OrnamentOption {
  id: OrnamentStyleId;
  label: string;
  desc: string;
}

export const ORNAMENT_OPTIONS: OrnamentOption[] = [
  { id: 'none', label: 'بدون زخرفة', desc: 'صفحة نقية بدون حواشي' },
  { id: 'andalusian_frame', label: 'إطار أندلسي هندسي', desc: 'إطار متداخل مع مربعات زوايا معقدة' },
  { id: 'star_medallion_8', label: 'شمسة مثمنة مذهبة', desc: 'شمسة إسلامية مثمنة في المركز' },
  { id: 'star_rosette_12', label: 'قنديل شمسة مقوسة', desc: 'شمسة زهرية مقوسة بإشعاع اثني عشري' },
  { id: 'floral_corners_frame', label: 'إطار أركان توريق', desc: 'إطار مزدوج بأربعة أركان توريق نباتي' },
  { id: 'ottoman_cornerpiece', label: 'ركنية عثمانية كبرى', desc: 'ركنية تذهيب عثمانية كبرى مورقة' },
  { id: 'scalloped_cartouche', label: 'خرطوشة / طغراء مقوسة', desc: 'خرطوشة أرابيسك مقوسة محيطية' },
  { id: 'dense_arabesque_corner', label: 'ركنية مشجرة كثيفة', desc: 'تذهيب مثلثي كثيف بأوراق وأزهار الأرابيسك' },
  { id: 'mamluk_geometric_border', label: 'إطار تذهيب مملوكي', desc: 'إطار هندسي مضفر بزوايا متراكبة' },
  { id: 'palmette_inner_frame', label: 'إطار أزهار وبراعم', desc: 'إطار مقوس للداخل مع براعم لوتس' },
  { id: 'delicate_spandrel', label: 'زاوية تذهيب رقيقة', desc: 'أركان رقيقة رشيقة بانحناءات نباتية' },
  { id: 'andalusian_corners', label: 'أندلسي مذهب', desc: 'أركان توريق غرناطية مذهبة' },
  { id: 'mamluk_geometric', label: 'مملوكي هندسي', desc: 'نجميات ثمانية وتضفير هندسي' },
  { id: 'ottoman_tezhip', label: 'تذهيب عثماني', desc: 'أغصان مورقة وأزهار لوتس بالذهب' },
  { id: 'manuscript_filigree', label: 'مخطوط ملكي', desc: 'برواز خيطين مذهب مع ترصيع' },
  { id: 'sultani_crest', label: 'تاج سلطاني', desc: 'محراب وقبة علوية مزخرفة' },
  { id: 'central_shamseh', label: 'شمسة مذهبة', desc: 'شمسة مركزية إسلامية مضيئة' },
  { id: 'full_arabesque', label: 'أرابيسك كامل', desc: 'إطار مورق يحيط بكامل البطاقة' }
];

interface CalligraphyOrnamentsProps {
  ornamentId: OrnamentStyleId | string;
  isDarkBackground?: boolean;
}

export const CalligraphyOrnaments: React.FC<CalligraphyOrnamentsProps> = ({
  ornamentId,
  isDarkBackground = false
}) => {
  if (ornamentId === 'none') return null;

  const goldPrimary = isDarkBackground ? '#f3cf7a' : '#9e7529';
  const goldSecondary = isDarkBackground ? '#c59b27' : '#785516';
  const goldFaint = isDarkBackground ? 'rgba(243, 207, 122, 0.25)' : 'rgba(158, 117, 41, 0.25)';

  return (
    <div className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden">
      
      {/* =================================================================== */}
      {/* 1. ANDALUSIAN CORNERS (أركان توريق أندلسية مذهبة بدون إطار خارجي)    */}
      {/* =================================================================== */}
      {ornamentId === 'andalusian_corners' && (
        <>
          {/* Top Right Corner Filigree */}
          <svg className="absolute top-4 right-4 w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 100 100" fill="none">
            <path
              d="M6,6 L94,6 C75,6 60,21 60,40 C60,59 41,60 41,60 C41,60 40,79 21,79 C6,79 6,94 6,94 Z"
              fill={goldSecondary}
              opacity="0.2"
            />
            <path
              d="M10,10 L90,10 C70,10 55,25 55,45 C55,65 35,65 35,65 C35,65 35,85 15,85 L10,85 Z"
              stroke={goldPrimary}
              strokeWidth="1.5"
            />
            <circle cx="28" cy="28" r="4.5" fill={goldPrimary} />
            <circle cx="28" cy="28" r="2" fill="#fff9e6" />
            <path d="M12,12 Q38,12 38,38 Q12,38 12,12" fill={goldPrimary} opacity="0.6" />
            <circle cx="50" cy="18" r="2.5" fill={goldSecondary} />
            <circle cx="18" cy="50" r="2.5" fill={goldSecondary} />
          </svg>

          {/* Top Left Corner Filigree (Mirrored) */}
          <svg className="absolute top-4 left-4 w-16 h-16 sm:w-20 sm:h-20 transform -scale-x-100" viewBox="0 0 100 100" fill="none">
            <path
              d="M6,6 L94,6 C75,6 60,21 60,40 C60,59 41,60 41,60 C41,60 40,79 21,79 C6,79 6,94 6,94 Z"
              fill={goldSecondary}
              opacity="0.2"
            />
            <path
              d="M10,10 L90,10 C70,10 55,25 55,45 C55,65 35,65 35,65 C35,65 35,85 15,85 L10,85 Z"
              stroke={goldPrimary}
              strokeWidth="1.5"
            />
            <circle cx="28" cy="28" r="4.5" fill={goldPrimary} />
            <circle cx="28" cy="28" r="2" fill="#fff9e6" />
            <path d="M12,12 Q38,12 38,38 Q12,38 12,12" fill={goldPrimary} opacity="0.6" />
            <circle cx="50" cy="18" r="2.5" fill={goldSecondary} />
            <circle cx="18" cy="50" r="2.5" fill={goldSecondary} />
          </svg>

          {/* Bottom Right Corner Filigree (Mirrored vertically) */}
          <svg className="absolute bottom-4 right-4 w-16 h-16 sm:w-20 sm:h-20 transform -scale-y-100" viewBox="0 0 100 100" fill="none">
            <path
              d="M6,6 L94,6 C75,6 60,21 60,40 C60,59 41,60 41,60 C41,60 40,79 21,79 C6,79 6,94 6,94 Z"
              fill={goldSecondary}
              opacity="0.2"
            />
            <path
              d="M10,10 L90,10 C70,10 55,25 55,45 C55,65 35,65 35,65 C35,65 35,85 15,85 L10,85 Z"
              stroke={goldPrimary}
              strokeWidth="1.5"
            />
            <circle cx="28" cy="28" r="4.5" fill={goldPrimary} />
            <circle cx="28" cy="28" r="2" fill="#fff9e6" />
            <path d="M12,12 Q38,12 38,38 Q12,38 12,12" fill={goldPrimary} opacity="0.6" />
          </svg>

          {/* Bottom Left Corner Filigree (Mirrored both) */}
          <svg className="absolute bottom-4 left-4 w-16 h-16 sm:w-20 sm:h-20 transform -scale-x-100 -scale-y-100" viewBox="0 0 100 100" fill="none">
            <path
              d="M6,6 L94,6 C75,6 60,21 60,40 C60,59 41,60 41,60 C41,60 40,79 21,79 C6,79 6,94 6,94 Z"
              fill={goldSecondary}
              opacity="0.2"
            />
            <path
              d="M10,10 L90,10 C70,10 55,25 55,45 C55,65 35,65 35,65 C35,65 35,85 15,85 L10,85 Z"
              stroke={goldPrimary}
              strokeWidth="1.5"
            />
            <circle cx="28" cy="28" r="4.5" fill={goldPrimary} />
            <circle cx="28" cy="28" r="2" fill="#fff9e6" />
            <path d="M12,12 Q38,12 38,38 Q12,38 12,12" fill={goldPrimary} opacity="0.6" />
          </svg>
        </>
      )}

      {/* =================================================================== */}
      {/* 2. MAMLUK GEOMETRIC (تضفير مملوكي بنجوم ثمانية مذهبة)                 */}
      {/* =================================================================== */}
      {ornamentId === 'mamluk_geometric' && (
        <>
          <div className="absolute inset-4 sm:inset-5 border-2 border-[#c59b27]/80 rounded-lg pointer-events-none">
            <div className="absolute inset-1.5 border border-dashed border-[#c59b27]/50 rounded pointer-events-none" />
          </div>

          {/* Four 8-Pointed Star Rosettes at Corners */}
          {['top-3 right-3', 'top-3 left-3', 'bottom-3 right-3', 'bottom-3 left-3'].map((pos, idx) => (
            <div key={idx} className={`absolute ${pos} w-8 h-8 flex items-center justify-center`}>
              <svg viewBox="0 0 40 40" className="w-full h-full text-[#c59b27]" fill="currentColor">
                <polygon points="20,2 24.5,13 36,10 29.5,20 36,30 24.5,27 20,38 15.5,27 4,30 10.5,20 4,10 15.5,13" />
                <circle cx="20" cy="20" r="4.5" fill={isDarkBackground ? '#0c0c0e' : '#eee5d6'} />
                <circle cx="20" cy="20" r="2" fill="#c59b27" />
              </svg>
            </div>
          ))}

          {/* Center Side Braided Knot Accents */}
          <div className="absolute top-1/2 right-3 -translate-y-1/2 w-4 h-12 flex flex-col justify-between items-center text-[#c59b27]">
            <span className="w-2.5 h-2.5 rotate-45 border border-[#c59b27] bg-[#c59b27]/20" />
            <span className="w-3.5 h-3.5 rotate-45 border-2 border-[#c59b27] bg-[#c59b27]/40" />
            <span className="w-2.5 h-2.5 rotate-45 border border-[#c59b27] bg-[#c59b27]/20" />
          </div>
          <div className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-12 flex flex-col justify-between items-center text-[#c59b27]">
            <span className="w-2.5 h-2.5 rotate-45 border border-[#c59b27] bg-[#c59b27]/20" />
            <span className="w-3.5 h-3.5 rotate-45 border-2 border-[#c59b27] bg-[#c59b27]/40" />
            <span className="w-2.5 h-2.5 rotate-45 border border-[#c59b27] bg-[#c59b27]/20" />
          </div>
        </>
      )}

      {/* =================================================================== */}
      {/* 3. OTTOMAN TEZHIP (تذهيب عثماني نباتي مورق)                          */}
      {/* =================================================================== */}
      {ornamentId === 'ottoman_tezhip' && (
        <>
          <div className="absolute inset-3 sm:inset-4 border border-[#c59b27]/50 rounded-2xl pointer-events-none" />

          {/* Top Centered Floral Palmette Crest */}
          <div className="absolute top-2 inset-x-0 flex justify-center">
            <svg viewBox="0 0 180 36" className="w-44 h-9 text-[#c59b27]" fill="currentColor">
              <path d="M90,3 C98,12 112,14 125,10 C110,22 96,28 90,34 C84,28 70,22 55,10 C68,14 82,12 90,3 Z" opacity="0.85" />
              <circle cx="90" cy="18" r="3.5" fill={isDarkBackground ? '#0c0c0e' : '#eee5d6'} />
              <circle cx="90" cy="18" r="1.8" fill="#c59b27" />
              {/* Flanking tendrils */}
              <path d="M125,10 Q145,8 165,14 Q148,18 132,16" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M55,10 Q35,8 15,14 Q32,18 48,16" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>

          {/* Bottom Centered Floral Palmette Crest */}
          <div className="absolute bottom-2 inset-x-0 flex justify-center transform rotate-180">
            <svg viewBox="0 0 180 36" className="w-44 h-9 text-[#c59b27]" fill="currentColor">
              <path d="M90,3 C98,12 112,14 125,10 C110,22 96,28 90,34 C84,28 70,22 55,10 C68,14 82,12 90,3 Z" opacity="0.85" />
              <circle cx="90" cy="18" r="3.5" fill={isDarkBackground ? '#0c0c0e' : '#eee5d6'} />
              <circle cx="90" cy="18" r="1.8" fill="#c59b27" />
              <path d="M125,10 Q145,8 165,14 Q148,18 132,16" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M55,10 Q35,8 15,14 Q32,18 48,16" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
        </>
      )}

      {/* =================================================================== */}
      {/* 4. MANUSCRIPT FILIGREE (حواشي المخطوطات الملكية المزدوجة)           */}
      {/* =================================================================== */}
      {ornamentId === 'manuscript_filigree' && (
        <>
          <div className="absolute inset-3 sm:inset-4 border-2 border-[#c59b27]/80 rounded-xl pointer-events-none">
            <div className="absolute inset-2 border border-[#c59b27]/40 rounded-lg pointer-events-none">
              <div className="absolute inset-1.5 border border-dotted border-[#c59b27]/60 pointer-events-none" />
            </div>
          </div>

          {/* 4 Corner Diamonds */}
          {['top-4 right-4', 'top-4 left-4', 'bottom-4 right-4', 'bottom-4 left-4'].map((pos, idx) => (
            <div key={idx} className={`absolute ${pos} w-5 h-5 flex items-center justify-center`}>
              <div className="w-3.5 h-3.5 rotate-45 border-2 border-[#c59b27] bg-[#c59b27]/70" />
            </div>
          ))}
        </>
      )}

      {/* =================================================================== */}
      {/* 5. SULTANI CREST (تاج سلطاني ومحراب علوي وسفلي مذهب)                 */}
      {/* =================================================================== */}
      {ornamentId === 'sultani_crest' && (
        <>
          <div className="absolute inset-x-5 inset-y-4 border-y border-[#c59b27]/60 pointer-events-none" />
          
          {/* Top Mihrab Arch Header */}
          <div className="absolute top-2 inset-x-8 h-10 flex items-center justify-center">
            <svg viewBox="0 0 320 40" className="w-72 h-10 text-[#c59b27]" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M10,36 L80,36 Q110,36 130,22 Q160,2 190,22 Q210,36 240,36 L310,36" />
              <polygon points="160,3 164,12 173,12 166,18 169,27 160,21 151,27 154,18 147,12 156,12" fill="currentColor" stroke="none" />
              <circle cx="100" cy="32" r="2.5" fill="currentColor" stroke="none" />
              <circle cx="220" cy="32" r="2.5" fill="currentColor" stroke="none" />
            </svg>
          </div>

          {/* Bottom Plinth Footer */}
          <div className="absolute bottom-2 inset-x-8 h-8 flex items-center justify-center transform rotate-180">
            <svg viewBox="0 0 320 40" className="w-72 h-8 text-[#c59b27]" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M10,36 L80,36 Q110,36 130,22 Q160,2 190,22 Q210,36 240,36 L310,36" />
              <polygon points="160,3 164,12 173,12 166,18 169,27 160,21 151,27 154,18 147,12 156,12" fill="currentColor" stroke="none" />
            </svg>
          </div>
        </>
      )}

      {/* =================================================================== */}
      {/* 6. CENTRAL SHAMSEH (شمسة إسلامية مذهبة كعلامة مائية خلف النص)       */}
      {/* =================================================================== */}
      {ornamentId === 'central_shamseh' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <svg viewBox="0 0 200 200" className="w-64 h-64 sm:w-80 sm:h-80 text-[#c59b27]" fill="currentColor">
            {/* 16-lobed central medallion */}
            <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="76" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="0.8" />
            {/* Outer Lobes */}
            {[...Array(16)].map((_, i) => (
              <g key={i} transform={`rotate(${i * 22.5} 100 100)`}>
                <path d="M100,12 C104,20 108,24 100,32 C92,24 96,20 100,12 Z" />
                <circle cx="100" cy="8" r="2" />
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. FULL ARABESQUE (إطار أرابيسك مورق متكامل)                          */}
      {/* =================================================================== */}
      {ornamentId === 'full_arabesque' && (
        <>
          <div
            className="absolute inset-3 sm:inset-4 border-2 border-[#c59b27]/85 rounded-xl pointer-events-none"
            style={{
              boxShadow: '0 0 0 2px rgba(197, 155, 39, 0.25) inset'
            }}
          >
            <div className="absolute inset-2 border border-[#c59b27]/40 rounded-lg pointer-events-none" />
          </div>

          {/* Running Floral Crests Along Sides */}
          {['top-2 right-2', 'top-2 left-2', 'bottom-2 right-2', 'bottom-2 left-2'].map((pos, idx) => (
            <div key={idx} className={`absolute ${pos} w-10 h-10 flex items-center justify-center text-[#c59b27]`}>
              <svg viewBox="0 0 32 32" className="w-full h-full" fill="currentColor">
                <path d="M4,4 L28,4 C20,4 16,10 16,16 C16,22 10,28 4,28 Z" opacity="0.75" />
                <circle cx="10" cy="10" r="2.5" fill="#fff6cc" />
              </svg>
            </div>
          ))}
        </>
      )}

      {/* =================================================================== */}
      {/* 8. ANDALUSIAN FRAME (إطار أندلسي هندسي)                              */}
      {/* =================================================================== */}
      {ornamentId === 'andalusian_frame' && (
        <>
          <div className="absolute inset-4 sm:inset-5 border-2 border-[#e5b84c]/90 rounded-lg pointer-events-none">
            <div className="absolute inset-1.5 border border-[#e5b84c]/40 rounded pointer-events-none" />
          </div>
          {['top-3 right-3', 'top-3 left-3', 'bottom-3 right-3', 'bottom-3 left-3'].map((pos, idx) => (
            <div key={idx} className={`absolute ${pos} w-7 h-7 flex items-center justify-center`}>
              <div className="w-6 h-6 border border-[#e5b84c] bg-[#e5b84c]/20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rotate-45 bg-[#e5b84c]" />
              </div>
            </div>
          ))}
        </>
      )}

      {/* =================================================================== */}
      {/* 9. STAR MEDALLION 8 (شمسة مثمنة مذهبة)                              */}
      {/* =================================================================== */}
      {ornamentId === 'star_medallion_8' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
          <svg viewBox="0 0 120 120" className="w-64 h-64 sm:w-72 sm:h-72 text-[#e5b84c]" fill="currentColor">
            <polygon points="60,10 72,40 102,32 84,56 108,68 84,80 96,104 68,92 60,112 52,92 24,104 36,80 12,68 36,56 18,32 48,40" />
            <circle cx="60" cy="60" r="22" fill={isDarkBackground ? '#0c0c0e' : '#eee5d6'} stroke="currentColor" strokeWidth="2" />
            <circle cx="60" cy="60" r="12" fill="currentColor" />
          </svg>
        </div>
      )}

      {/* =================================================================== */}
      {/* 10. STAR ROSETTE 12 (قنديل شمسة مقوسة)                               */}
      {/* =================================================================== */}
      {ornamentId === 'star_rosette_12' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
          <svg viewBox="0 0 140 140" className="w-72 h-72 sm:w-80 sm:h-80 text-[#e5b84c]" fill="none" stroke="currentColor">
            <circle cx="70" cy="70" r="60" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="70" cy="70" r="48" strokeWidth="2" />
            <circle cx="70" cy="70" r="32" strokeWidth="1" />
            <polygon points="70,16 82,50 118,50 90,70 102,104 70,84 38,104 50,70 22,50 58,50" fill="currentColor" fillOpacity="0.25" strokeWidth="1.5" />
          </svg>
        </div>
      )}

      {/* =================================================================== */}
      {/* 11. FLORAL CORNERS FRAME (إطار أركان توريق)                         */}
      {/* =================================================================== */}
      {ornamentId === 'floral_corners_frame' && (
        <>
          <div className="absolute inset-4 sm:inset-5 border border-[#e5b84c]/80 rounded-xl pointer-events-none" />
          {/* 4 floral corner medallions */}
          <div className="absolute top-4 right-4 w-12 h-12 text-[#e5b84c]">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M4 20 Q16 16 20 4" />
              <circle cx="16" cy="16" r="3" fill="currentColor" />
              <path d="M4 4 Q20 4 20 20" />
            </svg>
          </div>
          <div className="absolute top-4 left-4 w-12 h-12 text-[#e5b84c] -scale-x-100">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M4 20 Q16 16 20 4" />
              <circle cx="16" cy="16" r="3" fill="currentColor" />
              <path d="M4 4 Q20 4 20 20" />
            </svg>
          </div>
          <div className="absolute bottom-4 right-4 w-12 h-12 text-[#e5b84c] -scale-y-100">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M4 20 Q16 16 20 4" />
              <circle cx="16" cy="16" r="3" fill="currentColor" />
              <path d="M4 4 Q20 4 20 20" />
            </svg>
          </div>
          <div className="absolute bottom-4 left-4 w-12 h-12 text-[#e5b84c] -scale-x-100 -scale-y-100">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M4 20 Q16 16 20 4" />
              <circle cx="16" cy="16" r="3" fill="currentColor" />
              <path d="M4 4 Q20 4 20 20" />
            </svg>
          </div>
        </>
      )}

      {/* =================================================================== */}
      {/* 12. OTTOMAN CORNERPIECE (ركنية عثمانية كبرى)                         */}
      {/* =================================================================== */}
      {ornamentId === 'ottoman_cornerpiece' && (
        <>
          <div className="absolute top-3 right-3 w-28 h-28 text-[#e5b84c] pointer-events-none">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4 L96 4 L96 96 C80 75 75 55 55 55 C35 55 35 35 4 4 Z" fill="currentColor" fillOpacity="0.18" />
              <circle cx="70" cy="30" r="4" fill="currentColor" />
              <circle cx="85" cy="18" r="2.5" fill="currentColor" />
              <circle cx="55" cy="25" r="2.5" fill="currentColor" />
              <circle cx="75" cy="55" r="2.5" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute bottom-3 left-3 w-28 h-28 text-[#e5b84c] pointer-events-none -scale-x-100 -scale-y-100">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4 L96 4 L96 96 C80 75 75 55 55 55 C35 55 35 35 4 4 Z" fill="currentColor" fillOpacity="0.18" />
              <circle cx="70" cy="30" r="4" fill="currentColor" />
              <circle cx="85" cy="18" r="2.5" fill="currentColor" />
              <circle cx="55" cy="25" r="2.5" fill="currentColor" />
              <circle cx="75" cy="55" r="2.5" fill="currentColor" />
            </svg>
          </div>
        </>
      )}

      {/* =================================================================== */}
      {/* 13. SCALLOPED CARTOUCHE (خرطوشة / طغراء مقوسة)                       */}
      {/* =================================================================== */}
      {ornamentId === 'scalloped_cartouche' && (
        <div className="absolute inset-4 sm:inset-6 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 320 220" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="10" y="10" width="300" height="200" rx="40" strokeDasharray="6 4" strokeWidth="1.2" />
            <rect x="18" y="18" width="284" height="184" rx="34" strokeWidth="1.6" />
            <circle cx="160" cy="18" r="5" fill="currentColor" />
            <circle cx="160" cy="202" r="5" fill="currentColor" />
          </svg>
        </div>
      )}

      {/* =================================================================== */}
      {/* 14. DENSE ARABESQUE CORNER (ركنية مشجرة كثيفة)                       */}
      {/* =================================================================== */}
      {ornamentId === 'dense_arabesque_corner' && (
        <>
          <div className="absolute top-2 right-2 w-24 h-24 text-[#e5b84c] pointer-events-none">
            <svg viewBox="0 0 80 80" fill="currentColor">
              <polygon points="4,4 76,4 4,76" opacity="0.25" />
              <path d="M4,76 L76,4" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="28" cy="28" r="5" />
              <circle cx="48" cy="20" r="3.5" />
              <circle cx="20" cy="48" r="3.5" />
            </svg>
          </div>
          <div className="absolute bottom-2 left-2 w-24 h-24 text-[#e5b84c] pointer-events-none -scale-x-100 -scale-y-100">
            <svg viewBox="0 0 80 80" fill="currentColor">
              <polygon points="4,4 76,4 4,76" opacity="0.25" />
              <path d="M4,76 L76,4" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="28" cy="28" r="5" />
              <circle cx="48" cy="20" r="3.5" />
              <circle cx="20" cy="48" r="3.5" />
            </svg>
          </div>
        </>
      )}

      {/* =================================================================== */}
      {/* 15. MAMLUK GEOMETRIC BORDER (إطار تذهيب مملوكي)                      */}
      {/* =================================================================== */}
      {ornamentId === 'mamluk_geometric_border' && (
        <div className="absolute inset-4 sm:inset-5 border-2 border-[#e5b84c]/90 rounded-lg pointer-events-none">
          <div className="absolute inset-1.5 border border-[#e5b84c]/50 rounded pointer-events-none" />
          <div className="absolute inset-3 border-2 border-[#e5b84c]/70 rounded pointer-events-none" />
        </div>
      )}

      {/* =================================================================== */}
      {/* 16. PALMETTE INNER FRAME (إطار أزهار وبراعم)                          */}
      {/* =================================================================== */}
      {ornamentId === 'palmette_inner_frame' && (
        <div className="absolute inset-4 sm:inset-6 border-2 border-[#e5b84c]/80 rounded-3xl pointer-events-none">
          <div className="absolute top-2 right-2 w-6 h-6 border-b-2 border-l-2 border-[#e5b84c] rounded-bl-xl" />
          <div className="absolute top-2 left-2 w-6 h-6 border-b-2 border-r-2 border-[#e5b84c] rounded-br-xl" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-t-2 border-l-2 border-[#e5b84c] rounded-tl-xl" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-t-2 border-r-2 border-[#e5b84c] rounded-tr-xl" />
        </div>
      )}

      {/* =================================================================== */}
      {/* 17. DELICATE SPANDREL (زاوية تذهيب رقيقة)                            */}
      {/* =================================================================== */}
      {ornamentId === 'delicate_spandrel' && (
        <>
          <div className="absolute inset-4 sm:inset-5 border border-[#e5b84c]/40 rounded-xl pointer-events-none" />
          {['top-3 right-3', 'top-3 left-3', 'bottom-3 right-3', 'bottom-3 left-3'].map((pos, idx) => (
            <div key={idx} className={`absolute ${pos} w-8 h-8 flex items-center justify-center text-[#e5b84c]`}>
              <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M4 26 L4 8 C4 8 8 4 16 4 L26 4" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              </svg>
            </div>
          ))}
        </>
      )}

    </div>
  );
};
