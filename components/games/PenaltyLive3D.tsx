import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

type ShotPhase='idle'|'focus'|'runup'|'kick'|'goal'|'miss';
export interface Penalty3DKit {
  shooterClubId?:string;
  keeperClubId?:string;
  shooterAccent?:string;
  keeperAccent?:string;
  shooterPrimary:string;
  shooterSecondary?:string;
  keeperPrimary:string;
  keeperSecondary?:string;
  shooterNumber:number;
  keeperNumber:number;
  shooterName?:string;
  keeperName?:string;
}
interface Props {
  phase?:ShotPhase;diveSide?:'left'|'right';className?:string;
  aimX?:number;aimY?:number;shotPower?:number;scored?:boolean;
  kitColor?:string;
  kit?:Penalty3DKit;
  onStageReady?:()=>void;
}
interface Arena {
  setPhase:(p:ShotPhase,s:'left'|'right')=>void;
  setAim:(x:number,y:number,power:number)=>void;
  setOutcome:(scored:boolean)=>void;
  setKitColor:(color:string)=>void;
  setKit:(kit:Partial<Penalty3DKit>)=>void;
  dispose:()=>void;
}
/**
 * Live WebGL with a render-ready curtain. Procedural mannequin geometry is never
 * visible while GLTFLoader prepares the rigged footballers.
 */
export const PenaltyLive3D:React.FC<Props>=({
 phase='idle',diveSide='left',className='',kitColor='#1366b2',kit,aimX=0,aimY=0.5,shotPower=0.75,scored=true,onStageReady
})=>{
 const hostRef=useRef<HTMLDivElement>(null);
 const arenaRef=useRef<Arena|null>(null);
 const [ready,setReady]=useState(false);
 const [failed,setFailed]=useState(false);
 const readyCallback=useRef(onStageReady);
 readyCallback.current=onStageReady;
 const latest=useRef({phase,diveSide,kitColor,kit,aimX,aimY,shotPower,scored});
 latest.current={phase,diveSide,kitColor,kit,aimX,aimY,shotPower,scored};
 useEffect(()=>{
   let cancelled=false;
   let stageAudioTimer:ReturnType<typeof setTimeout>|null=null;
   const path='/penalty-3d-engine.js';
   void import(/* @vite-ignore */ path).then(mod=>{
     if(cancelled||!hostRef.current)return;
     const arena:Arena=mod.createPenalty3D({
       host:hostRef.current,THREE,GLTFLoader,SkeletonUtils,
       onReady:(status:{rigged:boolean})=>{
         if(cancelled)return;
         if(status.rigged){
           setReady(true);setFailed(false);
           // Let the visual curtain clear before starting crowd sound.
           stageAudioTimer=setTimeout(()=>{if(!cancelled)readyCallback.current?.();},370);
         }
         else{setFailed(true);setReady(false);}
       },
       onError:(reason:unknown)=>{
         if(cancelled)return;
         console.error('[PenaltyLive3D] 3D athlete model unavailable',reason);
         setFailed(true);
       }
     });
     arenaRef.current=arena;
     if(latest.current.kit)arena.setKit(latest.current.kit);
     else arena.setKitColor(latest.current.kitColor);
     arena.setAim(latest.current.aimX,latest.current.aimY,latest.current.shotPower);
     arena.setOutcome(latest.current.scored);
     arena.setPhase(latest.current.phase,latest.current.diveSide);
   }).catch(reason=>{if(!cancelled){console.error('[PenaltyLive3D] Scene failed',reason);setFailed(true);}});
   return ()=>{cancelled=true;if(stageAudioTimer)clearTimeout(stageAudioTimer);arenaRef.current?.dispose();arenaRef.current=null;};
 },[]);
 useEffect(()=>arenaRef.current?.setOutcome(scored),[scored]);
 useEffect(()=>arenaRef.current?.setPhase(phase,diveSide),[phase,diveSide]);
 useEffect(()=>arenaRef.current?.setAim(aimX,aimY,shotPower),[aimX,aimY,shotPower]);
 useEffect(()=>{
   if(kit)arenaRef.current?.setKit(kit);
   else arenaRef.current?.setKitColor(kitColor);
 },[kit,kitColor]);
 return <div className={'absolute inset-0 overflow-hidden bg-[#071a20] '+className}>
   <div ref={hostRef} className="absolute inset-0" role="img" aria-label="ملعب ركلات ترجيح ثلاثي الأبعاد مع لاعب وحارس بملابس وأرقام الفريق المختار"/>
   <div aria-live="polite" className={'pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,#1b3441_0%,#071520_65%,#020910_100%)] transition-opacity duration-300 '+(ready?'opacity-0':'opacity-100')}>
     <div className="flex flex-col items-center gap-4 text-center px-5">
       <div className={'h-14 w-14 rounded-full border border-[#eac982]/25 border-t-[#eac982] '+(!failed?'animate-spin':'')}/>
       <span className="text-xs tracking-[.24em] font-black text-[#eac982]" dir="ltr">QUL PENALTY ELITE</span>
       <span className="text-sm md:text-lg font-bold text-slate-100">{failed?'تعذّر تجهيز الشخصيات ثلاثية الأبعاد':'استعد، اللاعبون يدخلون الملعب...'}</span>
       {failed&&<span className="text-[11px] text-slate-400">تحقق من الاتصال ثم أعد فتح اللعبة</span>}
     </div>
   </div>
 </div>;
};
