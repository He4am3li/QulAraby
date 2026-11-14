import React from 'react';

/**
 * The national flag is a pigment field following the INNER curvature of a
 * glass voice sphere. It deliberately has no rectangular flag outline,
 * flagpole, emoji glyph, or picture asset. The orb's spherical lens and
 * reflected caustics are supplied by DialectVoiceOrb.
 *
 * Keep the emblems anchored near the centre so they are legible at 74px on
 * mobile, and preserve the national flag geometry for all 22 dialect stages.
 */
export const DIALECT_FLAG_COUNTRIES = [
  'uae', 'egypt', 'saudi', 'palestine', 'syria', 'jordan', 'lebanon',
  'iraq', 'libya', 'tunisia', 'morocco', 'algeria', 'oman', 'bahrain',
  'qatar', 'kuwait', 'yemen', 'sudan', 'mauritania', 'somalia',
  'comoros', 'djibouti'
] as const;

function starPath(cx: number, cy: number, outer: number, inner: number, count = 5): string {
  const steps = Array.from({ length: count * 2 }, (_, index) => {
    const angle = -Math.PI / 2 + index * Math.PI / count;
    const radius = index % 2 ? inner : outer;
    return (index ? 'L' : 'M') +
      (cx + radius * Math.cos(angle)).toFixed(2) + ' ' +
      (cy + radius * Math.sin(angle)).toFixed(2);
  });
  return steps.join(' ') + 'Z';
}

function fivePointOutline(cx: number, cy: number, radius: number): string {
  const points = Array.from({ length: 5 }, (_, i) => {
    const angle = -Math.PI / 2 + i * Math.PI * 2 / 5;
    return [(cx + Math.cos(angle) * radius).toFixed(2),
            (cy + Math.sin(angle) * radius).toFixed(2)].join(',');
  });
  return [0, 2, 4, 1, 3, 0].map(i => points[i]).join(' ');
}

const Star = ({ x, y, size, fill, points = 5 }: {
  x: number; y: number; size: number; fill: string; points?: number
}) => <path d={starPath(x, y, size, size * .42, points)} fill={fill} />;

const Crescent = ({ x, y, scale = 1, fill }: {
  x: number; y: number; scale?: number; fill: string
}) => (
  <path
    d="M9 -22 A22 22 0 1 0 9 22 C-5 18 -13 9 -13 0 C-13 -9 -5 -18 9 -22Z"
    transform={'translate(' + x + ' ' + y + ') scale(' + scale + ')'}
    fill={fill}
  />
);

const Tricolor = ({ top, middle, bottom }: {
  top: string; middle: string; bottom: string
}) => <>
  <rect width="100" height="33.34" fill={top}/>
  <rect y="33.33" width="100" height="33.34" fill={middle}/>
  <rect y="66.66" width="100" height="33.34" fill={bottom}/>
</>;

const Eagle = () => (
  <g fill="#BB9336" stroke="#6D501B" strokeWidth=".6" strokeLinejoin="round">
    <path d="M49 37 L51 35 L54 39 L62 36 L59 44 L67 41 L62 51 L59 56 L55 61 L53 68 L47 68 L45 61 L41 56 L38 51 L33 41 L41 44 L38 36 L46 39Z"/>
    <path d="M47 43 L53 43 L52 64 L48 64Z" fill="#F3D17B"/>
    <path d="M44 66 H56 V69 H44Z" fill="#C21D2D"/>
  </g>
);

const Cedar = () => <g fill="#087345">
  <path d="M50 31 L44 39 H47 L39 48 H44 L34 57 H43 L35 64 H65 L57 57 H66 L56 48 H61 L53 39 H56Z"/>
  <rect x="48" y="63" width="4" height="9" fill="#8A5A35"/>
</g>;

const OmaniEmblem = () => <g fill="none" stroke="#F7F7F4" strokeWidth="2.3" strokeLinecap="round">
  <path d="M10 11 L25 27 M25 11 L10 27"/>
  <path d="M11 11 Q7 8 6 14 M24 11 Q28 8 29 14"/>
  <path d="M13 24 Q17 30 21 24"/>
</g>;

/** Deterministic SVG vectors, not emoji flags that vary by operating system. */
export const DialectFlagGlassArt: React.FC<{countryId: string}> = ({ countryId }) => {
  switch (countryId) {
    case 'uae': return <>
      <Tricolor top="#00843D" middle="#FFFFFF" bottom="#111111"/>
      <rect width="25" height="100" fill="#D51D30"/>
    </>;
    case 'egypt': return <>
      <Tricolor top="#CE1126" middle="#FFFFFF" bottom="#111111"/>
      <Eagle/>
    </>;
    case 'saudi': return <>
      <rect width="100" height="100" fill="#006C35"/>
      <g fill="#FFFFFF" textAnchor="middle" fontFamily="'Noto Naskh Arabic', 'Amiri', serif" fontWeight="bold">
        <text x="50" y="44" fontSize="11" direction="rtl">لا إله إلا الله</text>
        <text x="50" y="56" fontSize="11" direction="rtl">محمد رسول الله</text>
      </g>
      <path d="M25 66 Q49 69 75 65 L71 68 Q50 74 26 69Z" fill="#FFFFFF"/>
      <path d="M28 66 L24 63 L27 71Z" fill="#FFFFFF"/>
    </>;
    case 'palestine': return <>
      <Tricolor top="#080808" middle="#FFFFFF" bottom="#007A3D"/>
      <path d="M0 0 L48 50 L0 100Z" fill="#CE1126"/>
    </>;
    case 'syria': return <>
      <Tricolor top="#007A3D" middle="#FFFFFF" bottom="#111111"/>
      <Star x={32} y={50} size={6.4} fill="#CE1126"/>
      <Star x={50} y={50} size={6.4} fill="#CE1126"/>
      <Star x={68} y={50} size={6.4} fill="#CE1126"/>
    </>;
    case 'jordan': return <>
      <Tricolor top="#111111" middle="#FFFFFF" bottom="#007A3D"/>
      <path d="M0 0 L50 50 L0 100Z" fill="#CE1126"/>
      <Star x={17} y={50} size={7} fill="#FFFFFF" points={7}/>
    </>;
    case 'lebanon': return <>
      <rect width="100" height="100" fill="#ED1C24"/>
      <rect y="25" width="100" height="50" fill="#FFFFFF"/>
      <Cedar/>
    </>;
    case 'iraq': return <>
      <Tricolor top="#CE1126" middle="#FFFFFF" bottom="#111111"/>
      <text x="50" y="58" fill="#007A3D" fontSize="18" fontWeight="bold"
        textAnchor="middle" direction="rtl" fontFamily="'Noto Naskh Arabic', 'Amiri', serif">الله أكبر</text>
    </>;
    case 'libya': return <>
      <rect width="100" height="100" fill="#E70013"/>
      <rect y="25" width="100" height="50" fill="#080808"/>
      <rect y="75" width="100" height="25" fill="#239E46"/>
      <Crescent x={48} y={50} scale={.54} fill="#FFFFFF"/>
      <Star x={66} y={50} size={8} fill="#FFFFFF"/>
    </>;
    case 'tunisia': return <>
      <rect width="100" height="100" fill="#E70013"/>
      <circle cx="50" cy="50" r="23" fill="#FFFFFF"/>
      <Crescent x={49} y={50} scale={.68} fill="#E70013"/>
      <Star x={61} y={50} size={10} fill="#E70013"/>
    </>;
    case 'morocco': return <>
      <rect width="100" height="100" fill="#C1272D"/>
      <polyline points={fivePointOutline(50, 51, 22)} fill="none"
        stroke="#006233" strokeWidth="3.2" strokeLinejoin="round"/>
    </>;
    case 'algeria': return <>
      <rect width="100" height="100" fill="#FFFFFF"/>
      <rect width="50" height="100" fill="#006233"/>
      <Crescent x={49} y={50} scale={.91} fill="#D21034"/>
      <Star x={62} y={50} size={13} fill="#D21034"/>
    </>;
    case 'oman': return <>
      <Tricolor top="#FFFFFF" middle="#ED1C24" bottom="#00843D"/>
      <rect width="27" height="100" fill="#ED1C24"/>
      <OmaniEmblem/>
    </>;
    case 'bahrain': return <>
      <rect width="100" height="100" fill="#CE1126"/>
      <path d="M0 0 H36 L48 10 L36 20 L48 30 L36 40 L48 50 L36 60 L48 70 L36 80 L48 90 L36 100 H0Z" fill="#FFFFFF"/>
    </>;
    case 'qatar': return <>
      <rect width="100" height="100" fill="#8A1538"/>
      <path d={'M0 0 H34 ' + Array.from({length:18}, (_, i) =>
        'L' + (i % 2 ? 34 : 46) + ' ' + ((i + 1) * 100 / 18).toFixed(2)).join(' ') + ' H0Z'} fill="#FFFFFF"/>
    </>;
    case 'kuwait': return <>
      <Tricolor top="#007A3D" middle="#FFFFFF" bottom="#CE1126"/>
      <path d="M0 0 L31 33.33 L31 66.66 L0 100Z" fill="#111111"/>
    </>;
    case 'yemen': return <Tricolor top="#CE1126" middle="#FFFFFF" bottom="#111111"/>;
    case 'sudan': return <>
      <Tricolor top="#D21034" middle="#FFFFFF" bottom="#111111"/>
      <path d="M0 0 L48 50 L0 100Z" fill="#007229"/>
    </>;
    case 'mauritania': return <>
      <rect width="100" height="100" fill="#006233"/>
      <rect width="100" height="15" fill="#D5A921"/>
      <rect y="85" width="100" height="15" fill="#D5A921"/>
      <path d="M24 45 Q50 76 76 45 Q67 74 50 74 Q33 74 24 45Z" fill="#FFD700"/>
      <Star x={50} y={41} size={11} fill="#FFD700"/>
    </>;
    case 'somalia': return <>
      <rect width="100" height="100" fill="#4189DD"/>
      <Star x={50} y={50} size={24} fill="#FFFFFF"/>
    </>;
    case 'comoros': return <>
      <rect width="100" height="25" fill="#FCD116"/>
      <rect y="25" width="100" height="25" fill="#FFFFFF"/>
      <rect y="50" width="100" height="25" fill="#CE1126"/>
      <rect y="75" width="100" height="25" fill="#3A75C4"/>
      <path d="M0 0 L55 50 L0 100Z" fill="#3A963B"/>
      <Crescent x={17} y={49} scale={.51} fill="#FFFFFF"/>
      {[36, 45, 54, 63].map(y => <Star key={y} x={34} y={y} size={3.6} fill="#FFFFFF"/>)}
    </>;
    case 'djibouti': return <>
      <rect width="100" height="50" fill="#6AB2E7"/>
      <rect y="50" width="100" height="50" fill="#12AD2B"/>
      <path d="M0 0 L57 50 L0 100Z" fill="#FFFFFF"/>
      <Star x={25} y={50} size={14} fill="#D7141A"/>
    </>;
    default: return <rect width="100" height="100" fill="#8EA6BB"/>;
  }
};
