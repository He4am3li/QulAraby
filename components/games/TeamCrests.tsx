import React from 'react';

interface TeamCrestProps {
  teamId: string;
  className?: string;
  size?: number;
}

export const TeamCrest: React.FC<TeamCrestProps> = ({ teamId, className = '', size = 120 }) => {
  switch (teamId) {
    case 'madrid':
      // Real Madrid Official Photorealistic Crest with 3D Metallic Gold & Velvet Crown
      return (
        <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="rmGoldGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="25%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>
            <linearGradient id="rmCrownGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#eab308" />
              <stop offset="85%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="rmSashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7e22ce" />
              <stop offset="50%" stopColor="#581c87" />
              <stop offset="100%" stopColor="#3b0764" />
            </linearGradient>
            <radialGradient id="rmVelvet" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="70%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </radialGradient>
            <filter id="rm3DShadow" x="-10%" y="-10%" width="120%" height="125%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          <g filter="url(#rm3DShadow)">
            {/* ROYAL CROWN */}
            {/* Red Velvet Crown Cap */}
            <path d="M38 32 C38 18, 82 18, 82 32 Z" fill="url(#rmVelvet)" />
            
            {/* Crown Arches & Jewels */}
            <path d="M36 34 C36 19 46 12 60 12 C74 12 84 19 84 34 Z" fill="none" stroke="url(#rmCrownGold)" strokeWidth="3" />
            <path d="M60 12 L60 34" stroke="url(#rmCrownGold)" strokeWidth="2.5" />
            <path d="M46 16 C50 24 53 30 54 34" stroke="url(#rmCrownGold)" strokeWidth="2" fill="none" />
            <path d="M74 16 C70 24 67 30 66 34" stroke="url(#rmCrownGold)" strokeWidth="2" fill="none" />

            {/* Top Orb & Royal Cross */}
            <circle cx="60" cy="10" r="3" fill="#ef4444" stroke="url(#rmCrownGold)" strokeWidth="1" />
            <path d="M60 4 L60 10 M57 7 L63 7" stroke="url(#rmCrownGold)" strokeWidth="2" strokeLinecap="round" />

            {/* Crown Pearl Finials */}
            <circle cx="36" cy="20" r="2.2" fill="#ffffff" stroke="#d97706" strokeWidth="0.8" />
            <circle cx="48" cy="14" r="2.2" fill="#ffffff" stroke="#d97706" strokeWidth="0.8" />
            <circle cx="72" cy="14" r="2.2" fill="#ffffff" stroke="#d97706" strokeWidth="0.8" />
            <circle cx="84" cy="20" r="2.2" fill="#ffffff" stroke="#d97706" strokeWidth="0.8" />

            {/* Crown Base Coronet Ring */}
            <rect x="34" y="30" width="52" height="7" rx="3.5" fill="url(#rmCrownGold)" stroke="#78350f" strokeWidth="1" />
            {/* Coronet Jewels: Ruby, Sapphire, Emerald */}
            <circle cx="40" cy="33.5" r="1.8" fill="#3b82f6" />
            <circle cx="47" cy="33.5" r="1.8" fill="#ef4444" />
            <circle cx="54" cy="33.5" r="1.8" fill="#10b981" />
            <circle cx="60" cy="33.5" r="2" fill="#ef4444" />
            <circle cx="66" cy="33.5" r="1.8" fill="#10b981" />
            <circle cx="73" cy="33.5" r="1.8" fill="#ef4444" />
            <circle cx="80" cy="33.5" r="1.8" fill="#3b82f6" />

            {/* MAIN SHIELD DISC */}
            {/* Outer Thick 3D Gold Ring */}
            <circle cx="60" cy="74" r="38" fill="url(#rmGoldGrad)" stroke="#78350f" strokeWidth="1.5" />
            <circle cx="60" cy="74" r="33" fill="#ffffff" stroke="#b45309" strokeWidth="1.2" />

            {/* Clip path for disc contents */}
            <clipPath id="rmInnerClip">
              <circle cx="60" cy="74" r="32.5" />
            </clipPath>

            <g clipPath="url(#rmInnerClip)">
              {/* Subtle inner disk highlight */}
              <circle cx="60" cy="74" r="32.5" fill="#f8fafc" />
              {/* Official Diagonal Purple Mulberry Sash */}
              <polygon points="26,52 82,108 94,96 38,40" fill="url(#rmSashGrad)" />
              {/* Gold borders on purple sash */}
              <line x1="26" y1="52" x2="82" y2="108" stroke="url(#rmCrownGold)" strokeWidth="1" />
              <line x1="38" y1="40" x2="94" y2="96" stroke="url(#rmCrownGold)" strokeWidth="1" />
            </g>

            {/* Intertwined Gold Monogram MFC (Madrid Club de Fútbol) */}
            {/* Letter 'C' Outer Ring in Center */}
            <circle cx="60" cy="74" r="17" fill="none" stroke="url(#rmGoldGrad)" strokeWidth="3.2" />
            {/* Letter 'M' Calligraphy */}
            <path 
              d="M48 60 L48 88 L53 88 L58 72 L60 76 L62 72 L67 88 L72 88 L72 60 L67 60 L67 76 L63 64 L57 64 L53 76 L53 60 Z" 
              fill="url(#rmGoldGrad)" 
              stroke="#78350f" 
              strokeWidth="0.8" 
            />
            {/* Letter 'F' Crossbar in Center */}
            <rect x="54" y="69" width="12" height="3" rx="1.5" fill="url(#rmGoldGrad)" stroke="#78350f" strokeWidth="0.6" />
          </g>
        </svg>
      );

    case 'city':
      // Manchester City Official Crest: Concentric Sky/Navy Rings, Golden Ship & Red Rose
      return (
        <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="mcfcSky" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="40%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>
            <radialGradient id="mcfcNavy" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="70%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <linearGradient id="mcfcGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <filter id="mcfcShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          <g filter="url(#mcfcShadow)">
            {/* Outer Sky Blue Ring */}
            <circle cx="60" cy="60" r="56" fill="url(#mcfcSky)" stroke="#ffffff" strokeWidth="2" />
            {/* Navy Blue Main Ring */}
            <circle cx="60" cy="60" r="50" fill="url(#mcfcNavy)" stroke="url(#mcfcGold)" strokeWidth="1.5" />
            {/* Inner Sky Blue Ring */}
            <circle cx="60" cy="60" r="39" fill="url(#mcfcSky)" stroke="#ffffff" strokeWidth="1.5" />

            {/* Top Text: MANCHESTER */}
            <path id="mcfcTopArc" d="M22 60 A38 38 0 0 1 98 60" fill="none" />
            <text fill="#ffffff" fontSize="7.5" fontWeight="900" letterSpacing="2.8" fontFamily="sans-serif">
              <textPath href="#mcfcTopArc" startOffset="50%" textAnchor="middle">
                MANCHESTER
              </textPath>
            </text>

            {/* Bottom Text: CITY */}
            <path id="mcfcBottomArc" d="M98 60 A38 38 0 0 1 22 60" fill="none" />
            <text fill="#ffffff" fontSize="8" fontWeight="900" letterSpacing="4.5" fontFamily="sans-serif">
              <textPath href="#mcfcBottomArc" startOffset="50%" textAnchor="middle">
                CITY
              </textPath>
            </text>

            {/* Year 18 94 on Sides */}
            <text x="14" y="63" fill="url(#mcfcGold)" fontSize="6" fontWeight="bold" textAnchor="middle">18</text>
            <text x="106" y="63" fill="url(#mcfcGold)" fontSize="6" fontWeight="bold" textAnchor="middle">94</text>

            {/* Central Traditional Heater Shield */}
            <path 
              d="M40 37 L80 37 L80 64 C80 80 60 90 60 90 C60 90 40 80 40 64 Z" 
              fill="#ffffff" 
              stroke="#0284c7" 
              strokeWidth="1.8" 
            />

            {/* Upper Division: Sky Blue Sky & Golden Sailing Ship */}
            <clipPath id="mcfcShieldClip">
              <path d="M40 37 L80 37 L80 64 C80 80 60 90 60 90 C60 90 40 80 40 64 Z" />
            </clipPath>

            <g clipPath="url(#mcfcShieldClip)">
              {/* Sky Blue Backdrop in Upper Half */}
              <rect x="40" y="37" width="40" height="23" fill="#bae6fd" />
              {/* Waves */}
              <path d="M40 58 Q50 56 60 58 T80 58 L80 62 L40 62 Z" fill="#0284c7" />

              {/* Golden Sailing Ship of Manchester */}
              {/* Hull */}
              <path d="M47 52 L73 52 L69 58 L51 58 Z" fill="url(#mcfcGold)" stroke="#78350f" strokeWidth="0.8" />
              {/* Masts & Sails */}
              <line x1="60" y1="40" x2="60" y2="52" stroke="#78350f" strokeWidth="1.2" />
              <path d="M54 42 L66 42 L64 50 L56 50 Z" fill="#fef08a" stroke="#b45309" strokeWidth="0.6" />
              <path d="M48 45 L53 45 L52 50 L48 50 Z" fill="#fef08a" />
              <path d="M67 45 L72 45 L72 50 L68 50 Z" fill="#fef08a" />

              {/* Gold Divider Line between Ship and Rose */}
              <line x1="40" y1="60" x2="80" y2="60" stroke="url(#mcfcGold)" strokeWidth="1.5" />

              {/* Lower Division: Lancashire Red Rose */}
              {/* Green Sepals */}
              <circle cx="60" cy="74" r="11" fill="none" stroke="#16a34a" strokeWidth="1.5" />
              {/* Red Petals */}
              <circle cx="60" cy="70" r="5" fill="#dc2626" />
              <circle cx="56" cy="73" r="5" fill="#dc2626" />
              <circle cx="64" cy="73" r="5" fill="#dc2626" />
              <circle cx="57" cy="77" r="5" fill="#dc2626" />
              <circle cx="63" cy="77" r="5" fill="#dc2626" />
              {/* Golden Seeded Center */}
              <circle cx="60" cy="74" r="3.5" fill="url(#mcfcGold)" stroke="#78350f" strokeWidth="0.5" />
            </g>
          </g>
        </svg>
      );

    case 'barca':
      // FC Barcelona Crest: St George cross, Senyera stripes, Blaugrana stripes, ball
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M20 20 C35 20 40 14 50 14 C60 14 65 20 80 20 C85 45 80 75 50 88 C20 75 15 45 20 20 Z" fill="#ffffff" stroke="#f59e0b" strokeWidth="4" />
          {/* Top Left: St George's Red Cross */}
          <path d="M22 22 L48 22 L48 44 L22 44 Z" fill="#ffffff" />
          <rect x="33" y="22" width="6" height="22" fill="#dc2626" />
          <rect x="22" y="30" width="26" height="6" fill="#dc2626" />
          {/* Top Right: Catalan Senyera yellow & red stripes */}
          <path d="M50 22 L78 22 L78 44 L50 44 Z" fill="#facc15" />
          <rect x="55" y="22" width="4" height="22" fill="#dc2626" />
          <rect x="63" y="22" width="4" height="22" fill="#dc2626" />
          <rect x="71" y="22" width="4" height="22" fill="#dc2626" />
          {/* Middle Ribbon */}
          <rect x="20" y="44" width="60" height="7" fill="#fbbf24" />
          {/* Bottom: Blaugrana Blue & Maroon Stripes */}
          <path d="M20 51 C24 72 38 80 50 86 C62 80 76 72 80 51 Z" fill="#1e3a8a" />
          <path d="M30 51 C32 65 39 74 50 86 C42 74 38 65 36 51 Z" fill="#991b1b" />
          <path d="M64 51 C62 65 55 74 50 86 C58 74 62 65 64 51 Z" fill="#991b1b" />
          {/* Vintage Golden Football */}
          <circle cx="50" cy="66" r="7" fill="#fbbf24" stroke="#ca8a04" strokeWidth="1" />
        </svg>
      );

    case 'hilal':
      // Al Hilal SFC Crest: Royal Blue Double Crescent & White Calligraphy
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M22 20 L78 20 C78 20 84 55 50 86 C16 55 22 20 22 20 Z" fill="#1d4ed8" stroke="#ffffff" strokeWidth="3.5" />
          <path d="M26 24 L74 24 C74 24 79 53 50 80 C21 53 26 24 26 24 Z" fill="#1e40af" stroke="#60a5fa" strokeWidth="1.5" />
          {/* 3 Championship Stars */}
          <text x="35" y="34" fill="#fbbf24" fontSize="9" textAnchor="middle">★</text>
          <text x="50" y="32" fill="#fbbf24" fontSize="11" textAnchor="middle">★</text>
          <text x="65" y="34" fill="#fbbf24" fontSize="9" textAnchor="middle">★</text>
          {/* Crescent Moon */}
          <path d="M58 44 C46 44 38 52 38 64 C38 72 44 78 52 79 C42 77 36 71 36 62 C36 50 44 42 58 44 Z" fill="#ffffff" />
          <circle cx="52" cy="56" r="10" fill="#ffffff" />
          <text x="50" y="60" fill="#1d4ed8" fontSize="8" fontWeight="bold" textAnchor="middle">AL HILAL</text>
        </svg>
      );

    case 'ahly':
      // Al Ahly SC Crest: Red Shield with Golden Eagle of Club of the Century
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M22 18 L78 18 C78 18 84 58 50 88 C16 58 22 18 22 18 Z" fill="#dc2626" stroke="#fbbf24" strokeWidth="3.5" />
          <path d="M26 22 L74 22 C74 22 79 55 50 82 C21 55 26 22 26 22 Z" fill="#991b1b" />
          {/* 4 Golden Stars on Top */}
          <text x="32" y="32" fill="#fbbf24" fontSize="8">★</text>
          <text x="44" y="30" fill="#fbbf24" fontSize="9">★</text>
          <text x="56" y="30" fill="#fbbf24" fontSize="9">★</text>
          <text x="68" y="32" fill="#fbbf24" fontSize="8">★</text>
          {/* Golden Eagle */}
          <path d="M50 40 L60 52 L54 54 L62 66 L50 62 L38 66 L46 54 L40 52 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <text x="50" y="74" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">AL AHLY</text>
        </svg>
      );

    case 'argentina':
      // Argentina AFA: Sky blue stripes, golden AFA letters, 3 World Cup stars
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M24 22 L76 22 C76 22 82 56 50 86 C18 56 24 22 24 22 Z" fill="#ffffff" stroke="#f59e0b" strokeWidth="3.5" />
          {/* Sky blue stripes */}
          <rect x="36" y="24" width="8" height="52" fill="#38bdf8" />
          <rect x="56" y="24" width="8" height="52" fill="#38bdf8" />
          {/* 3 World Cup Stars on Top */}
          <text x="36" y="18" fill="#fbbf24" fontSize="10" textAnchor="middle">★</text>
          <text x="50" y="14" fill="#fbbf24" fontSize="12" textAnchor="middle">★</text>
          <text x="64" y="18" fill="#fbbf24" fontSize="10" textAnchor="middle">★</text>
          {/* Golden AFA monogram */}
          <text x="50" y="58" fill="#f59e0b" fontSize="16" fontWeight="900" textAnchor="middle" stroke="#b45309" strokeWidth="0.5">AFA</text>
        </svg>
      );

    case 'brazil':
      // Brazil CBF: Yellow/green shield, blue cross, 5 World Cup stars
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M22 22 L78 22 C78 22 84 58 50 86 C16 58 22 22 22 22 Z" fill="#facc15" stroke="#15803d" strokeWidth="3.5" />
          {/* 5 Green World Cup Stars on Top */}
          <text x="28" y="18" fill="#15803d" fontSize="8">★</text>
          <text x="38" y="15" fill="#15803d" fontSize="9">★</text>
          <text x="50" y="14" fill="#15803d" fontSize="10">★</text>
          <text x="62" y="15" fill="#15803d" fontSize="9">★</text>
          <text x="72" y="18" fill="#15803d" fontSize="8">★</text>
          {/* Blue Center Cross */}
          <rect x="44" y="32" width="12" height="42" fill="#1d4ed8" rx="2" />
          <rect x="30" y="44" width="40" height="12" fill="#1d4ed8" rx="2" />
          <text x="50" y="53" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">CBF</text>
        </svg>
      );

    case 'france':
      // France FFF: Navy blue hexagon shield with golden rooster and 2 stars
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M24 24 L76 24 C76 24 82 56 50 84 C18 56 24 24 24 24 Z" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="3.5" />
          {/* 2 World Cup Stars */}
          <text x="42" y="18" fill="#fbbf24" fontSize="11" textAnchor="middle">★</text>
          <text x="58" y="18" fill="#fbbf24" fontSize="11" textAnchor="middle">★</text>
          {/* Gallic Rooster */}
          <path d="M50 36 C55 36 60 42 58 50 C62 52 64 58 60 64 L56 64 L50 72 L46 64 C42 62 40 56 44 48 C42 42 46 36 50 36 Z" fill="#fbbf24" />
          <text x="50" y="78" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">FFF</text>
        </svg>
      );

    case 'egypt':
      // Egypt EFA: Golden Pharaoh Eagle, 7 African Stars
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M22 20 L78 20 C78 20 84 56 50 86 C16 56 22 20 22 20 Z" fill="#dc2626" stroke="#fbbf24" strokeWidth="3.5" />
          <circle cx="50" cy="50" r="22" fill="#ffffff" stroke="#000000" strokeWidth="1" />
          {/* Golden Eagle of Saladin */}
          <path d="M50 34 L56 44 L62 44 L58 54 L62 64 L50 60 L38 64 L42 54 L38 44 L44 44 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
          <text x="50" y="78" fill="#fbbf24" fontSize="8" fontWeight="bold" textAnchor="middle">EGYPT</text>
        </svg>
      );

    case 'morocco':
      // Morocco FRMF: Royal Crown, Green Star of Morocco, Red Shield
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M22 22 L78 22 C78 22 84 56 50 86 C16 56 22 22 22 22 Z" fill="#dc2626" stroke="#fbbf24" strokeWidth="3.5" />
          {/* Royal Crown on Top */}
          <path d="M38 18 L50 12 L62 18 L58 22 L42 22 Z" fill="#fbbf24" />
          <circle cx="50" cy="52" r="22" fill="#15803d" stroke="#fbbf24" strokeWidth="2" />
          {/* Pentagram Green Star */}
          <polygon points="50,38 53,47 62,47 55,52 58,61 50,56 42,61 45,52 38,47 47,47" fill="#facc15" stroke="#166534" strokeWidth="0.8" />
          <text x="50" y="80" fill="#fbbf24" fontSize="7" fontWeight="bold" textAnchor="middle">MAROC</text>
        </svg>
      );

    case 'saudi':
      // Saudi Arabia SAFF: Green Shield, Golden Falcon & Palm Tree
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M22 20 L78 20 C78 20 84 56 50 86 C16 56 22 20 22 20 Z" fill="#15803d" stroke="#fbbf24" strokeWidth="3.5" />
          <circle cx="50" cy="50" r="20" fill="#ffffff" />
          {/* Palm tree and crossed swords */}
          <path d="M50 36 L52 46 L48 46 Z" fill="#15803d" />
          <circle cx="50" cy="38" r="4" fill="#15803d" />
          <line x1="42" y1="56" x2="58" y2="44" stroke="#15803d" strokeWidth="2" />
          <line x1="58" y1="56" x2="42" y2="44" stroke="#15803d" strokeWidth="2" />
          <text x="50" y="78" fill="#fbbf24" fontSize="7" fontWeight="bold" textAnchor="middle">SAUDI</text>
        </svg>
      );

    case 'portugal':
      // Portugal FPF Shield with Order of Christ cross & golden accents
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="porGold" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>
          </defs>
          <path d="M22 20 L78 20 C78 20 84 56 50 86 C16 56 22 20 22 20 Z" fill="#dc2626" stroke="#fbbf24" strokeWidth="3.5" />
          {/* Green border accent */}
          <path d="M25 23 L75 23 C75 23 80 54 50 82 C20 54 25 23 25 23 Z" fill="#15803d" />
          <path d="M28 26 L72 26 C72 26 76 52 50 78 C24 52 28 26 28 26 Z" fill="#dc2626" />
          {/* Order of Christ Cross */}
          <rect x="44" y="32" width="12" height="42" fill="#ffffff" />
          <rect x="30" y="44" width="40" height="12" fill="#ffffff" />
          {/* Quinas Blue Shields */}
          <circle cx="50" cy="50" r="10" fill="#1d4ed8" stroke="#ffffff" strokeWidth="1.5" />
          <text x="50" y="78" fill="#fbbf24" fontSize="7" fontWeight="bold" textAnchor="middle">PORTUGAL</text>
        </svg>
      );

    default:
      return (
        <div className={`flex items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-2xl shadow-xl ${className}`} style={{ width: size, height: size }}>
          🏆
        </div>
      );
  }
};
