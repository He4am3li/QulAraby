import React from 'react';
import { CalligraphyOrnaments as LegacyCalligraphyOrnaments, type OrnamentStyleId as LegacyOrnamentStyleId } from './LegacyCalligraphyOrnaments';

export type OrnamentStyleId = LegacyOrnamentStyleId
  | 'none'
  | 'royal_gilded_frame'
  | 'andalusian_muqarnas_border'
  | 'ottoman_tezhip_frame'
  | 'mamluk_geometric_border'
  | 'sultani_mihrab_arch'
  | 'persian_shamsah_crest'
  | 'khattat_oval_cartouche'
  | 'floral_palmette_corners'
  | 'delicate_spandrel'
  | 'fatimid_cusped_frame'
  | 'samarkand_turquoise_gold';

export interface OrnamentOption {
  id: OrnamentStyleId;
  label: string;
  desc: string;
}

export const ORNAMENT_OPTIONS: OrnamentOption[] = [
  { id: 'none', label: 'بدون زخرفة', desc: 'لوحة نقية بدون حواشي أو إطارات' },
  { id: 'royal_gilded_frame', label: 'إطار تذهيب سلطاني', desc: 'إطار ملكي مزدوج بتوريق عثماني وأركان مذهبة' },
  { id: 'andalusian_muqarnas_border', label: 'إطار أندلسي مضفر', desc: 'تضفير هندسي إسلامي بنجوم ثمانية وتداخلات قصر الحمراء' },
  { id: 'ottoman_tezhip_frame', label: 'تذهيب عثماني فاخر', desc: 'زخرفة تذهيب نباتية عثمانية بأوراق الساز وتوريق الرومي' },
  { id: 'mamluk_geometric_border', label: 'إطار هندسي مملوكي', desc: 'شبكة هندسية مملوكية دقيقة بأركان متقاطعة وأشرطة ذهبية' },
  { id: 'sultani_mihrab_arch', label: 'محراب سلطاني متوج', desc: 'قوس محراب إسلامي علوي متوج يعلو النص بقنديل معلّق' },
  { id: 'persian_shamsah_crest', label: 'شمسة إمبراطورية مشعة', desc: 'شمسة مذهبة متوهجة تعلو اللوحة بزخارف مشعة مذهبة' },
  { id: 'khattat_oval_cartouche', label: 'خرطوشة خطاط مذهبة', desc: 'خرطوشة بيضاوية مقوسة بحواف مذهبة تحيط بالنص' },
  { id: 'floral_palmette_corners', label: 'أركان توريق نباتي', desc: 'أربعة أركان نباتية مورقة بزخارف ذهبية دقيقة' },
  { id: 'delicate_spandrel', label: 'زوايا تذهيب رقيقة', desc: 'أركان مشجرة دقيقة بنقوش لولبية إسلامية ناعمة' },
  { id: 'fatimid_cusped_frame', label: 'إطار كوفي فاطمي مفصص', desc: 'أقواس مفصصة فاطمية مورقة بنقوش جصية عتيقة' },
  { id: 'samarkand_turquoise_gold', label: 'تطريز سمرقند مذهب', desc: 'شبكة أرابيسك مذهبة مستوحاة من عمارة سمرقند وتيمور' },
  { id: 'andalusian_frame', label: 'إطار أندلسي هندسي', desc: 'إطار متداخل مع مربعات زوايا معقدة' },
  { id: 'star_medallion_8', label: 'شمسة مثمنة مذهبة', desc: 'شمسة إسلامية مثمنة في المركز' },
  { id: 'star_rosette_12', label: 'قنديل شمسة مقوسة', desc: 'شمسة زهرية مقوسة بإشعاع اثني عشري' },
  { id: 'floral_corners_frame', label: 'إطار أركان توريق', desc: 'إطار مزدوج بأربعة أركان توريق نباتي' },
  { id: 'ottoman_cornerpiece', label: 'ركنية عثمانية كبرى', desc: 'ركنية تذهيب عثمانية كبرى مورقة' },
  { id: 'scalloped_cartouche', label: 'خرطوشة / طغراء مقوسة', desc: 'خرطوشة أرابيسك مقوسة محيطية' },
  { id: 'dense_arabesque_corner', label: 'ركنية مشجرة كثيفة', desc: 'تذهيب مثلثي كثيف بأوراق وأزهار الأرابيسك' },
  { id: 'palmette_inner_frame', label: 'إطار أزهار وبراعم', desc: 'إطار مقوس للداخل مع براعم لوتس' },
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
  if (!ornamentId || ornamentId === 'none') return null;
  if (!["none","royal_gilded_frame","andalusian_muqarnas_border","ottoman_tezhip_frame","mamluk_geometric_border","sultani_mihrab_arch","persian_shamsah_crest","khattat_oval_cartouche","floral_palmette_corners","delicate_spandrel","fatimid_cusped_frame","samarkand_turquoise_gold"].includes(ornamentId)) {
    return <LegacyCalligraphyOrnaments ornamentId={ornamentId} isDarkBackground={isDarkBackground} />;
  }

  const goldPrimary = isDarkBackground ? '#f5d066' : '#9e7529';
  const goldSecondary = isDarkBackground ? '#d4af37' : '#785516';
  const goldLight = isDarkBackground ? '#fff3b0' : '#c59b27';
  const goldFill = isDarkBackground ? 'rgba(245, 208, 102, 0.14)' : 'rgba(158, 117, 41, 0.09)';

  return (
    <div className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden">
      
      {/* 1. ROYAL GILDED FRAME */}
      {ornamentId === 'royal_gilded_frame' && (
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="royalGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={goldPrimary} />
              <stop offset="30%" stopColor={goldLight} />
              <stop offset="70%" stopColor={goldSecondary} />
              <stop offset="100%" stopColor={goldPrimary} />
            </linearGradient>
          </defs>

          <rect x="20" y="20" width="760" height="560" rx="8" stroke="url(#royalGoldGrad)" strokeWidth="2.8" />
          <rect x="28" y="28" width="744" height="544" rx="6" stroke="url(#royalGoldGrad)" strokeWidth="0.8" strokeDasharray="6 3" />
          <rect x="34" y="34" width="732" height="532" rx="4" stroke="url(#royalGoldGrad)" strokeWidth="1.2" opacity="0.85" />

          {/* 4 Rich Gilded Corners */}
          <g transform="translate(744, 56)">
            <path d="M0,0 C-18,0 -28,-14 -28,-28 C-14,-28 0,-18 0,0 Z" fill="url(#royalGoldGrad)" />
            <circle cx="-14" cy="-14" r="4" fill={goldLight} />
            <path d="M0,-28 L-28,0" stroke="url(#royalGoldGrad)" strokeWidth="1.8" />
          </g>
          <g transform="translate(56, 56)">
            <path d="M0,0 C18,0 28,-14 28,-28 C14,-28 0,-18 0,0 Z" fill="url(#royalGoldGrad)" />
            <circle cx="14" cy="-14" r="4" fill={goldLight} />
            <path d="M0,-28 L28,0" stroke="url(#royalGoldGrad)" strokeWidth="1.8" />
          </g>
          <g transform="translate(744, 544)">
            <path d="M0,0 C-18,0 -28,14 -28,28 C-14,28 0,18 0,0 Z" fill="url(#royalGoldGrad)" />
            <circle cx="-14" cy="14" r="4" fill={goldLight} />
            <path d="M0,28 L-28,0" stroke="url(#royalGoldGrad)" strokeWidth="1.8" />
          </g>
          <g transform="translate(56, 544)">
            <path d="M0,0 C18,0 28,14 28,28 C14,28 0,18 0,0 Z" fill="url(#royalGoldGrad)" />
            <circle cx="14" cy="14" r="4" fill={goldLight} />
            <path d="M0,28 L28,0" stroke="url(#royalGoldGrad)" strokeWidth="1.8" />
          </g>

          {/* Center Rosettes */}
          <g transform="translate(400, 20)">
            <polygon points="0,-8 7,0 0,8 -7,0" fill="url(#royalGoldGrad)" />
            <circle cx="0" cy="0" r="2.5" fill={goldLight} />
          </g>
          <g transform="translate(400, 580)">
            <polygon points="0,-8 7,0 0,8 -7,0" fill="url(#royalGoldGrad)" />
            <circle cx="0" cy="0" r="2.5" fill={goldLight} />
          </g>
          <g transform="translate(20, 300)">
            <polygon points="-8,0 0,7 8,0 0,-7" fill="url(#royalGoldGrad)" />
            <circle cx="0" cy="0" r="2.5" fill={goldLight} />
          </g>
          <g transform="translate(780, 300)">
            <polygon points="-8,0 0,7 8,0 0,-7" fill="url(#royalGoldGrad)" />
            <circle cx="0" cy="0" r="2.5" fill={goldLight} />
          </g>
        </svg>
      )}

      {/* 2. ANDALUSIAN MUQARNAS BORDER */}
      {ornamentId === 'andalusian_muqarnas_border' && (
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="none" fill="none">
          <rect x="18" y="18" width="764" height="564" stroke={goldPrimary} strokeWidth="2.8" />
          <rect x="26" y="26" width="748" height="548" stroke={goldSecondary} strokeWidth="1.4" />

          {[
            { cx: 48, cy: 48 },
            { cx: 752, cy: 48 },
            { cx: 48, cy: 552 },
            { cx: 752, cy: 552 }
          ].map((corner, i) => (
            <g key={i} transform={`translate(${corner.cx}, ${corner.cy})`}>
              <rect x="-18" y="-18" width="36" height="36" fill={goldFill} stroke={goldPrimary} strokeWidth="1.6" />
              <rect x="-18" y="-18" width="36" height="36" fill={goldFill} stroke={goldPrimary} strokeWidth="1.6" transform="rotate(45)" />
              <circle cx="0" cy="0" r="5" fill={goldLight} />
            </g>
          ))}

          <rect x="66" y="66" width="668" height="468" stroke={goldPrimary} strokeWidth="1.2" strokeDasharray="8 4" opacity="0.85" />
        </svg>
      )}

      {/* 3. OTTOMAN TEZHIP FRAME */}
      {ornamentId === 'ottoman_tezhip_frame' && (
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="none" fill="none">
          <rect x="24" y="24" width="752" height="552" rx="8" stroke={goldPrimary} strokeWidth="2.4" />
          <rect x="32" y="32" width="736" height="536" rx="6" stroke={goldSecondary} strokeWidth="0.9" opacity="0.8" />

          {/* Ottoman Tezhip Saz Leaf Corners */}
          <g transform="translate(740, 58)">
            <path d="M0,0 C-32,0 -48,-16 -54,-44 C-38,-48 -16,-32 0,0 Z" fill={goldFill} stroke={goldPrimary} strokeWidth="1.5" />
            <circle cx="-26" cy="-26" r="4.5" fill={goldPrimary} />
            <circle cx="-12" cy="-38" r="3" fill={goldLight} />
            <circle cx="-38" cy="-12" r="3" fill={goldLight} />
          </g>
          <g transform="translate(60, 58)">
            <path d="M0,0 C32,0 48,-16 54,-44 C38,-48 16,-32 0,0 Z" fill={goldFill} stroke={goldPrimary} strokeWidth="1.5" />
            <circle cx="26" cy="-26" r="4.5" fill={goldPrimary} />
            <circle cx="12" cy="-38" r="3" fill={goldLight} />
            <circle cx="38" cy="-12" r="3" fill={goldLight} />
          </g>
          <g transform="translate(740, 542)">
            <path d="M0,0 C-32,0 -48,16 -54,44 C-38,48 -16,32 0,0 Z" fill={goldFill} stroke={goldPrimary} strokeWidth="1.5" />
            <circle cx="-26" cy="26" r="4.5" fill={goldPrimary} />
            <circle cx="-12" cy="38" r="3" fill={goldLight} />
            <circle cx="-38" cy="12" r="3" fill={goldLight} />
          </g>
          <g transform="translate(60, 542)">
            <path d="M0,0 C32,0 48,16 54,44 C38,48 16,32 0,0 Z" fill={goldFill} stroke={goldPrimary} strokeWidth="1.5" />
            <circle cx="26" cy="26" r="4.5" fill={goldPrimary} />
            <circle cx="12" cy="38" r="3" fill={goldLight} />
            <circle cx="38" cy="12" r="3" fill={goldLight} />
          </g>
        </svg>
      )}

      {/* 4. MAMLUK GEOMETRIC BORDER */}
      {ornamentId === 'mamluk_geometric_border' && (
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="none" fill="none">
          <rect x="20" y="20" width="760" height="560" stroke={goldPrimary} strokeWidth="2.6" />
          <rect x="28" y="28" width="744" height="544" stroke={goldSecondary} strokeWidth="1" />
          <rect x="40" y="40" width="720" height="520" stroke={goldPrimary} strokeWidth="1.6" />

          <line x1="20" y1="20" x2="40" y2="40" stroke={goldPrimary} strokeWidth="2.2" />
          <line x1="780" y1="20" x2="760" y2="40" stroke={goldPrimary} strokeWidth="2.2" />
          <line x1="20" y1="580" x2="40" y2="560" stroke={goldPrimary} strokeWidth="2.2" />
          <line x1="780" y1="580" x2="760" y2="560" stroke={goldPrimary} strokeWidth="2.2" />
        </svg>
      )}

      {/* 5. SULTANI MIHRAB ARCH */}
      {ornamentId === 'sultani_mihrab_arch' && (
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="none" fill="none">
          <rect x="22" y="22" width="756" height="556" rx="8" stroke={goldPrimary} strokeWidth="2" />
          <rect x="30" y="30" width="740" height="540" rx="6" stroke={goldSecondary} strokeWidth="0.8" opacity="0.6" />

          {/* Crown Arch at Top */}
          <path
            d="M75,145 L75,90 Q75,48 180,46 Q280,44 360,32 Q400,18 440,32 Q520,44 620,46 Q725,48 725,90 L725,145"
            stroke={goldPrimary}
            strokeWidth="2.6"
            fill="none"
          />
          <path
            d="M90,135 L90,95 Q90,62 190,60 Q290,58 370,48 Q400,36 430,48 Q510,58 610,60 Q710,62 710,95 L710,135"
            stroke={goldSecondary}
            strokeWidth="1"
            strokeDasharray="4 2"
            fill={goldFill}
          />

          <g transform="translate(400, 72)">
            <line x1="0" y1="-35" x2="0" y2="0" stroke={goldPrimary} strokeWidth="1.4" />
            <polygon points="0,0 8,14 0,24 -8,14" fill={goldPrimary} stroke={goldLight} strokeWidth="0.8" />
            <circle cx="0" cy="12" r="3" fill="#fff" />
            <line x1="0" y1="24" x2="0" y2="30" stroke={goldPrimary} strokeWidth="1.2" />
            <circle cx="0" cy="31" r="2" fill={goldLight} />
          </g>
        </svg>
      )}

      {/* 6. PERSIAN SHAMSAH CREST */}
      {ornamentId === 'persian_shamsah_crest' && (
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="none" fill="none">
          <rect x="22" y="22" width="756" height="556" rx="6" stroke={goldPrimary} strokeWidth="1.6" />
          <rect x="28" y="28" width="744" height="544" rx="4" stroke={goldSecondary} strokeWidth="0.7" strokeDasharray="4 2" />

          {/* 24-point radiant Shamsah */}
          <g transform="translate(400, 65)">
            {[...Array(24)].map((_, i) => (
              <polygon
                key={i}
                points="0,-34 3,-18 0,-15 -3,-18"
                fill={goldPrimary}
                transform={`rotate(${i * 15})`}
              />
            ))}
            <circle cx="0" cy="0" r="19" fill={goldFill} stroke={goldPrimary} strokeWidth="1.6" />
            <circle cx="0" cy="0" r="13" stroke={goldLight} strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="0" cy="0" r="5.5" fill={goldPrimary} />
            <circle cx="0" cy="0" r="2" fill="#fff" />
          </g>

          <line x1="140" y1="65" x2="340" y2="65" stroke={goldPrimary} strokeWidth="1.4" />
          <polygon points="140,65 155,62 155,68" fill={goldPrimary} />
          <line x1="460" y1="65" x2="660" y2="65" stroke={goldPrimary} strokeWidth="1.4" />
          <polygon points="660,65 645,62 645,68" fill={goldPrimary} />
        </svg>
      )}

      {/* 7. KHATTAT OVAL CARTOUCHE */}
      {ornamentId === 'khattat_oval_cartouche' && (
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="none" fill="none">
          <rect x="18" y="18" width="764" height="564" stroke={goldSecondary} strokeWidth="1" opacity="0.6" />
          <rect x="24" y="24" width="752" height="552" stroke={goldPrimary} strokeWidth="2" />

          <ellipse cx="400" cy="300" rx="335" ry="175" stroke={goldPrimary} strokeWidth="2.2" fill={goldFill} />
          <ellipse cx="400" cy="300" rx="325" ry="165" stroke={goldSecondary} strokeWidth="0.8" strokeDasharray="5 3" />

          <g transform="translate(65, 300)">
            <polygon points="0,-14 14,0 0,14 -14,0" fill={goldPrimary} />
            <circle cx="0" cy="0" r="3.5" fill={goldLight} />
          </g>
          <g transform="translate(735, 300)">
            <polygon points="0,-14 14,0 0,14 -14,0" fill={goldPrimary} />
            <circle cx="0" cy="0" r="3.5" fill={goldLight} />
          </g>
        </svg>
      )}

      {/* 8. FLORAL PALMETTE CORNERS */}
      {ornamentId === 'floral_palmette_corners' && (
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="none" fill="none">
          <rect x="26" y="26" width="748" height="548" rx="4" stroke={goldPrimary} strokeWidth="1.4" />

          <g transform="translate(725, 46)">
            <path d="M0,0 C-22,0 -38,-16 -44,-44 C-16,-38 0,-22 0,0 Z" fill={goldFill} stroke={goldPrimary} strokeWidth="1.6" />
            <circle cx="-20" cy="-20" r="3.5" fill={goldPrimary} />
            <path d="M-12,-6 Q-28,-28 -6,-12" stroke={goldLight} strokeWidth="1.2" />
          </g>
          <g transform="translate(75, 46)">
            <path d="M0,0 C22,0 38,-16 44,-44 C16,-38 0,-22 0,0 Z" fill={goldFill} stroke={goldPrimary} strokeWidth="1.6" />
            <circle cx="20" cy="-20" r="3.5" fill={goldPrimary} />
            <path d="M12,-6 Q28,-28 6,-12" stroke={goldLight} strokeWidth="1.2" />
          </g>
          <g transform="translate(725, 554)">
            <path d="M0,0 C-22,0 -38,16 -44,44 C-16,38 0,22 0,0 Z" fill={goldFill} stroke={goldPrimary} strokeWidth="1.6" />
            <circle cx="-20" cy="20" r="3.5" fill={goldPrimary} />
            <path d="M-12,6 Q-28,28 -6,12" stroke={goldLight} strokeWidth="1.2" />
          </g>
          <g transform="translate(75, 554)">
            <path d="M0,0 C22,0 38,16 44,44 C16,38 0,22 0,0 Z" fill={goldFill} stroke={goldPrimary} strokeWidth="1.6" />
            <circle cx="20" cy="20" r="3.5" fill={goldPrimary} />
            <path d="M12,6 Q28,28 6,12" stroke={goldLight} strokeWidth="1.2" />
          </g>
        </svg>
      )}

      {/* 9. DELICATE SPANDREL */}
      {ornamentId === 'delicate_spandrel' && (
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="none" fill="none">
          <rect x="24" y="24" width="752" height="552" stroke={goldPrimary} strokeWidth="1.5" />

          <g transform="translate(776, 24)">
            <path d="M0,0 L-48,0 C-48,26 -26,48 0,48 Z" fill={goldFill} stroke={goldPrimary} strokeWidth="1.5" />
            <circle cx="-20" cy="20" r="3.5" fill={goldLight} />
          </g>
          <g transform="translate(24, 24)">
            <path d="M0,0 L48,0 C48,26 26,48 0,48 Z" fill={goldFill} stroke={goldPrimary} strokeWidth="1.5" />
            <circle cx="20" cy="20" r="3.5" fill={goldLight} />
          </g>
          <g transform="translate(776, 576)">
            <path d="M0,0 L-48,0 C-48,-26 -26,-48 0,-48 Z" fill={goldFill} stroke={goldPrimary} strokeWidth="1.5" />
            <circle cx="-20" cy="-20" r="3.5" fill={goldLight} />
          </g>
          <g transform="translate(24, 576)">
            <path d="M0,0 L48,0 C48,-26 26,-48 0,-48 Z" fill={goldFill} stroke={goldPrimary} strokeWidth="1.5" />
            <circle cx="20" cy="-20" r="3.5" fill={goldLight} />
          </g>
        </svg>
      )}

      {/* 10. FATIMID CUSPED FRAME */}
      {ornamentId === 'fatimid_cusped_frame' && (
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="none" fill="none">
          <rect x="22" y="22" width="756" height="556" stroke={goldPrimary} strokeWidth="2.2" />
          <path
            d="M50,50 Q100,25 150,50 Q200,25 250,50 Q300,25 350,50 Q400,25 450,50 Q500,25 550,50 Q600,25 650,50 Q700,25 750,50"
            stroke={goldSecondary}
            strokeWidth="1.2"
          />
          <path
            d="M50,550 Q100,575 150,550 Q200,575 250,550 Q300,575 350,550 Q400,575 450,550 Q500,575 550,550 Q600,575 650,550 Q700,575 750,550"
            stroke={goldSecondary}
            strokeWidth="1.2"
          />
          <rect x="42" y="42" width="716" height="516" stroke={goldPrimary} strokeWidth="1" strokeDasharray="5 3" />
        </svg>
      )}

      {/* 11. SAMARKAND TURQUOISE & GOLD */}
      {ornamentId === 'samarkand_turquoise_gold' && (
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="none" fill="none">
          <rect x="20" y="20" width="760" height="560" stroke={goldPrimary} strokeWidth="2.8" />
          <rect x="30" y="30" width="740" height="540" stroke="#0d5c63" strokeWidth="2" opacity="0.75" />
          <rect x="38" y="38" width="724" height="524" stroke={goldSecondary} strokeWidth="1" strokeDasharray="6 3" />

          {/* 4 Samarkand Star tiles */}
          {[
            { cx: 55, cy: 55 },
            { cx: 745, cy: 55 },
            { cx: 55, cy: 545 },
            { cx: 745, cy: 545 }
          ].map((c, idx) => (
            <g key={idx} transform={`translate(${c.cx}, ${c.cy})`}>
              <rect x="-16" y="-16" width="32" height="32" fill="#0d5c63" stroke={goldPrimary} strokeWidth="1.4" />
              <rect x="-16" y="-16" width="32" height="32" fill="#093f44" stroke={goldLight} strokeWidth="1.4" transform="rotate(45)" />
              <circle cx="0" cy="0" r="4.5" fill={goldLight} />
            </g>
          ))}
        </svg>
      )}

    </div>
  );
};
