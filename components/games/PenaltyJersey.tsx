import React, {useId} from 'react';
import type {EliteClub} from './PenaltyEliteData';

interface Props {club:EliteClub;number?:number;className?:string;showNumber?:boolean;}
/** Club-colour 2D kit illustration, not a licensed photograph or official garment texture. */
export const PenaltyJersey:React.FC<Props>=({club,number=9,className='',showNumber=true})=>{
  const rawId=useId().replace(/:/g,'');
  const clip='penalty-shirt-'+rawId,light='penalty-light-'+rawId,shadow='penalty-shadow-'+rawId;
  const primary=club.primary;
  const secondary=club.secondary;
  const darkText=['madrid','arsenal','juventus','city','bayern'].includes(club.id);
  const numberColor=darkText?'#14213c':'#ffffff';
  const trimColor=club.id==='madrid'?'#d1b56f':club.id==='arsenal'?'#f6f0ed':club.id==='juventus'?'#171b25':club.accent;
  return <svg viewBox="0 0 200 210" role="img" aria-label={'قميص '+club.name+'، رقم '+number} className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={light} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff" stopOpacity=".32"/><stop offset="35%" stopColor="#fff" stopOpacity=".02"/><stop offset="75%" stopColor="#020614" stopOpacity=".18"/><stop offset="100%" stopColor="#020614" stopOpacity=".36"/>
      </linearGradient>
      <linearGradient id={shadow} x1="0%" y1="0%" x2="90%" y2="100%">
        <stop stopColor="#010915" stopOpacity=".4"/><stop offset="30%" stopColor="#000" stopOpacity="0"/><stop offset="85%" stopColor="#000" stopOpacity=".28"/>
      </linearGradient>
      <clipPath id={clip}>
        <path d="M70 21 84 14Q100 21 116 14L130 21Q150 22 165 39L189 78 166 94 151 74 153 191Q100 202 47 191L49 74 34 94 11 78 35 39Q48 22 70 21Z"/>
      </clipPath>
    </defs>
    <ellipse cx="100" cy="201" rx="58" ry="6" fill="#000" opacity=".22"/>
    <path d="M70 21 84 14Q100 21 116 14L130 21Q150 22 165 39L189 78 166 94 151 74 153 191Q100 202 47 191L49 74 34 94 11 78 35 39Q48 22 70 21Z"
      fill={primary} stroke="#0f1827" strokeWidth="3" strokeLinejoin="round"/>
    <g clipPath={'url(#'+clip+')'}>
      {club.id==='barcelona'&&<><rect x="44" y="8" width="24" height="202" fill="#183b80"/><rect x="68" y="8" width="24" height="202" fill="#9d1939"/><rect x="92" y="8" width="24" height="202" fill="#183b80"/><rect x="116" y="8" width="24" height="202" fill="#9d1939"/><rect x="140" y="8" width="26" height="202" fill="#183b80"/></>}
      {club.id==='juventus'&&<>{[0,1,2,3,4,5].map(i=><rect key={i} x={25+i*28} y="8" width="14" height="203" fill="#141920"/>)}</>}
      {club.id==='psg'&&<><rect x="83" y="14" width="34" height="195" fill="#e7e8e9"/><rect x="88" y="14" width="24" height="195" fill="#cb1e40"/></>}
      {club.id==='arsenal'&&<><path d="M3 8H58L58 112 1 112Z" fill="#f8f6ef"/><path d="M142 8H199V112H142Z" fill="#f8f6ef"/></>}
      {club.id==='liverpool'&&<>{[0,1,2,3,4].map(i=><path key={i} d={'M'+(52+i*27)+' 33l-8 153'} stroke="#f6eceb" strokeWidth="2.5" opacity=".2"/>)}</>}
      {club.id==='city'&&<><path d="M20 75Q98 20 178 80" stroke="#ffffff" strokeWidth="3" opacity=".4" fill="none"/><path d="M20 114Q97 69 180 110" stroke="#ffffff" strokeWidth="2" opacity=".24" fill="none"/></>}
      {club.id==='madrid'&&<><path d="M56 30 43 191M144 30 158 191" stroke="#bfa365" strokeWidth="2.2" opacity=".75"/><path d="M67 22 53 189M132 22 148 189" stroke="#1b3256" strokeWidth="1" opacity=".5"/></>}
      {club.id==='chelsea'&&<>{[0,1,2].map(i=><path key={i} d={'M'+(45+i*48)+' 34Q'+(60+i*45)+' 98 '+(45+i*48)+' 190'} stroke="#b5d0fc" strokeWidth="2" fill="none" opacity=".21"/>)}</>}
      {club.id==='bayern'&&<>{[0,1,2,3].map(i=><path key={i} d={'M'+(44+i*34)+' 30l-8 152'} stroke="#efeded" strokeWidth="2" opacity=".46"/>)}</>}
      {club.id==='united'&&<><path d="M39 36Q100 60 159 36" stroke="#080d12" strokeWidth="6" fill="none"/><path d="M46 164Q100 184 154 164" stroke="#080d12" strokeWidth="3" fill="none" opacity=".3"/></>}
      <path d="M10 78 35 39 52 25M190 78 165 39 147 25" stroke={trimColor} strokeWidth="4.5" fill="none"/>
      <path d="M66 21Q100 45 134 21" stroke={trimColor} strokeWidth="3" fill="none"/>
      <path d="M47 188Q100 198 153 188" stroke="#ffffff" strokeWidth="2.3" opacity=".55" fill="none"/>
      <path d="M37 20 165 20 153 195 47 195Z" fill={'url(#'+light+')'}/>
      <path d="M9 5H193V203H9Z" fill={'url(#'+shadow+')'}/>
      <path d="M60 78Q64 113 57 149M143 65Q137 120 145 173" stroke="#fff" opacity=".13" strokeWidth="2" fill="none"/>
    </g>
    <path d="M84 15Q100 23 116 15L111 27Q100 34 89 27Z" fill="#101827" stroke={trimColor} strokeWidth="2"/>
    <image href={club.crestUrl} x="119" y="44" width="27" height="28" preserveAspectRatio="xMidYMid meet"/>
    <path d="M65 51h20M68 56h14" stroke={trimColor} strokeWidth="2" strokeLinecap="round"/>
    {showNumber&&<text x="99" y="140" fill={numberColor} textAnchor="middle" fontWeight="900" fontFamily="Arial, sans-serif" fontSize="57" stroke={darkText?'#fff':'#111725'} strokeWidth=".6" paintOrder="stroke" opacity=".95">{number}</text>}
  </svg>;
};
