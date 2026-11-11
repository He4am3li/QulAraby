import React from 'react';

/**
 * Original vector condenser microphone for the QUL speaking studio.
 * Gradients and fine mesh give hardware depth without large bitmap downloads.
 * No network request, no canvas loop, and no microphone input is intercepted.
 */
export const SpeakingStudioMicrophone: React.FC<{ active?: boolean }> = ({ active=false }) => (
  <svg className={'qul-voice-hardware'+(active?' is-live':'')} viewBox="0 0 360 470" fill="none"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="qMicBody" x1="42" y1="0" x2="330" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#020d1b"/><stop offset=".12" stopColor="#34516e"/><stop offset=".28" stopColor="#1b324e"/>
        <stop offset=".52" stopColor="#0b152a"/><stop offset=".77" stopColor="#324e6c"/><stop offset=".92" stopColor="#0b1628"/>
        <stop offset="1" stopColor="#030812"/>
      </linearGradient>
      <linearGradient id="qMicChrome" x1="0" y1="0" x2="1" y2=".1">
        <stop stopColor="#07152d"/><stop offset=".1" stopColor="#acc6d9"/><stop offset=".28" stopColor="#26384a"/>
        <stop offset=".53" stopColor="#8ca8c1"/><stop offset=".75" stopColor="#162a3e"/><stop offset=".92" stopColor="#5b748c"/><stop offset="1" stopColor="#07101f"/>
      </linearGradient>
      <linearGradient id="qMicMesh" x1="0" y1="0" x2="1" y2=".2">
        <stop stopColor="#0b1320"/><stop offset=".18" stopColor="#526b83"/><stop offset=".42" stopColor="#101827"/>
        <stop offset=".73" stopColor="#7a91a3"/><stop offset=".94" stopColor="#101b2a"/>
      </linearGradient>
      <linearGradient id="qMicTrim" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#092d4b"/><stop offset=".15" stopColor="#25dacc"/>
        <stop offset=".43" stopColor="#a4f6f4"/><stop offset=".65" stopColor="#526cc9"/>
        <stop offset=".88" stopColor="#b05ce8"/><stop offset="1" stopColor="#182345"/>
      </linearGradient>
      <linearGradient id="qMicStand" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#050c15"/><stop offset=".24" stopColor="#29374d"/><stop offset=".48" stopColor="#0e1b2f"/><stop offset=".7" stopColor="#50637c"/><stop offset="1" stopColor="#07101e"/>
      </linearGradient>
      <pattern id="qMicGrill" width="5.2" height="5.5" patternUnits="userSpaceOnUse">
        <path d="M0 .5H5.2M0 3.2H5.2M.65 0V5.5M3.1 0V5.5" stroke="#a0bed1" strokeWidth=".42" opacity=".6"/>
        <path d="M0 5.5L5.2 0M-1 1L4 -4M2 8L7 3" stroke="#050a13" strokeWidth=".75" opacity=".8"/>
      </pattern>
      <clipPath id="qMicHeadClip">
        <path d="M117 155V83C117 43 144 22 180 22C216 22 243 43 243 83V155H117Z"/>
      </clipPath>
      <filter id="qMicShadow" x="-50%" y="-30%" width="200%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="qMicHighlight" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/></filter>
    </defs>
    <ellipse cx="180" cy="447" rx="88" ry="10" fill="#010b18" opacity=".56" filter="url(#qMicShadow)"/>
    <rect x="166" y="359" width="28" height="84" rx="5" fill="url(#qMicStand)" stroke="#62809a" strokeOpacity=".4"/>
    <path d="M164 441H196L202 450H158L164 441Z" fill="url(#qMicChrome)"/>
    <path d="M134 206V302C134 336 152 351 180 351C208 351 226 336 226 302V206" fill="#070f20" stroke="#768da3" strokeWidth="2" opacity=".7"/>
    <path d="M130 206V301C130 338 153 357 180 357C207 357 230 338 230 301V206" stroke="#010a16" strokeWidth="7" opacity=".7"/>
    <path d="M149 166H211L222 292C222 313 211 329 180 329C149 329 138 313 138 292L149 166Z"
      fill="url(#qMicBody)" stroke="#3b546b" strokeWidth="2"/>
    <path d="M152 165H208L213 180H147L152 165Z" fill="url(#qMicChrome)"/>
    <rect x="139" y="174" width="82" height="12" rx="3" fill="url(#qMicChrome)" stroke="#091122" strokeWidth="1.5"/>
    <rect x="145" y="188" width="70" height="4" rx="2" fill="url(#qMicTrim)"/>
    <path d="M151 204L147 290C147 307 152 318 180 319" stroke="#97c5e0" strokeOpacity=".25" strokeWidth="3"/>
    <path d="M198 210L205 291C205 307 197 313 190 317" stroke="#8fa7bb" strokeOpacity=".26" strokeWidth="4"/>
    <path d="M117 155V83C117 43 144 22 180 22C216 22 243 43 243 83V155H117Z"
      fill="url(#qMicMesh)" stroke="#8099b5" strokeWidth="3"/>
    <g clipPath="url(#qMicHeadClip)">
      <rect x="116" y="20" width="129" height="140" fill="url(#qMicGrill)"/>
      <path d="M124 50C142 30 218 30 237 52" stroke="#c9e1f0" strokeOpacity=".32" strokeWidth="2"/>
      <path d="M131 26V160" stroke="#c6e3f7" strokeWidth="6" strokeOpacity=".2" filter="url(#qMicHighlight)"/>
      <path d="M226 28V160" stroke="#e1e5f9" strokeWidth="8" strokeOpacity=".16" filter="url(#qMicHighlight)"/>
    </g>
    <rect x="110" y="151" width="140" height="14" rx="4" fill="url(#qMicChrome)" stroke="#091728" strokeWidth="2"/>
    <path d="M114 152H246" stroke="#c6d6e2" strokeWidth="1.1" opacity=".7"/>
    <rect x="110" y="163" width="140" height="6" rx="3" fill="#0a1123"/>
    <path d="M110 176H250" stroke="#23d8d3" strokeOpacity=".27" strokeWidth="3" filter="url(#qMicHighlight)"/>
    <rect x="119" y="179" width="122" height="3" rx="1.5" fill="url(#qMicTrim)" opacity=".8"/>
    <g stroke="url(#qMicChrome)" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M95 221L126 292M265 221L234 292M111 320L127 247M249 320L233 247"/>
      <path d="M95 221L154 258M265 221L206 258M111 320L153 283M249 320L207 283"/>
      <path d="M108 211L126 241M252 211L234 241"/>
      <path d="M95 219L102 216M265 219L258 216"/>
    </g>
    <g fill="#0c1725" stroke="#9bb4c6" strokeWidth="1.3">
      <circle cx="95" cy="221" r="7"/><circle cx="265" cy="221" r="7"/>
      <circle cx="111" cy="320" r="6"/><circle cx="249" cy="320" r="6"/>
      <circle cx="180" cy="305" r="7"/>
    </g>
    <rect x="80" y="302" width="200" height="16" rx="8" fill="url(#qMicChrome)" stroke="#0e1c31" strokeWidth="2"/>
    <path d="M94 306H265" stroke="#c1d5eb" strokeOpacity=".4" strokeWidth="1"/>
    <path d="M173 328H187L194 350H166L173 328Z" fill="url(#qMicChrome)"/>
    <path d="M161 355H199" stroke="#2c566c" strokeWidth="2"/>
    <rect x="167" y="374" width="26" height="6" rx="3" fill="#0e273a"/>
    <path d="M164 410H196" stroke="#4d7886" strokeOpacity=".7" strokeWidth="2"/>
    <path d="M164 438H196" stroke="#37475e" strokeOpacity=".75" strokeWidth="2"/>
    <path d="M155 251Q169 243 180 251Q191 243 205 251L205 267Q192 259 180 268Q168 259 155 267Z"
      fill="#30dfd2" opacity=".92"/>
    <path d="M180 251V269" stroke="#014d5d" strokeWidth="1.5"/>
  </svg>
);
