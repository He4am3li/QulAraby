import React, {useEffect,useState} from 'react';
import {Shield} from 'lucide-react';
import type {EliteClub} from './PenaltyEliteData';

interface Props {
  club:EliteClub;
  className?:string;
  imageClassName?:string;
}
/** Club crest presented as an image, without distorting its official proportions. */
export const PenaltyClubCrest:React.FC<Props>=({club,className='',imageClassName=''})=>{
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[club.crestUrl]);
  return <span
    className={'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,.22),rgba(255,255,255,.08)_50%,rgba(10,17,30,.42))] shadow-[inset_0_1px_0_rgba(255,255,255,.22),0_8px_25px_rgba(0,0,0,.32)] backdrop-blur-md '+className}
    title={club.english}>
    {!failed?
      <img src={club.crestUrl} loading="lazy" decoding="async"
        alt={'شعار نادي '+club.name}
        onError={()=>setFailed(true)}
        className={'block w-full h-full object-contain p-[14%] drop-shadow-[0_3px_5px_rgba(0,0,0,.22)] '+imageClassName}/>
      :<Shield aria-label={'تعذر تحميل شعار '+club.name} className="text-slate-300 w-1/2 h-1/2"/>}
  </span>;
};
