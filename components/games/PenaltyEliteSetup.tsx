import React,{useEffect,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
import {ArrowLeft,ChevronLeft,ChevronRight,RotateCcw,Trophy} from 'lucide-react';
import {chooseOpponent,ELITE_CLUBS,EliteClub,ElitePlayer} from './PenaltyEliteData';
import {PenaltyClubCrest} from './PenaltyClubCrest';
import {PenaltyJersey} from './PenaltyJersey';

interface Props{onBack?:()=>void;onStart:(club:EliteClub,rival:EliteClub,kickers:ElitePlayer[])=>void}
const roles:Record<ElitePlayer['role'],string>={GK:'حارس',DF:'دفاع',MF:'وسط',FW:'هجوم'};
const css=[
'@keyframes eliteSpotA{0%,100%{transform:translateX(-35%) rotate(-22deg)}50%{transform:translateX(20%) rotate(-10deg)}}',
'@keyframes eliteSpotB{0%,100%{transform:translateX(20%) rotate(17deg)}50%{transform:translateX(-25%) rotate(11deg)}}',
'.elite-stadium{background:radial-gradient(ellipse at 50% 84%,rgba(20,93,98,.49),transparent 53%),linear-gradient(180deg,#030914 0%,#09202b 58%,#020911 100%)}',
'.elite-stadium:before{content:"";position:absolute;inset:24% 0 4%;pointer-events:none;background:radial-gradient(ellipse at 50% 86%,transparent 25%,rgba(4,13,21,.82) 74%),repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0 3px,transparent 3px 11px);mask-image:linear-gradient(to bottom,transparent,#000 55%,#000 84%,transparent)}',
'.elite-spot{position:absolute;width:39%;height:120%;top:-26%;pointer-events:none;background:linear-gradient(to bottom,rgba(213,242,255,.32),rgba(178,240,255,.025) 75%,transparent);filter:blur(21px);clip-path:polygon(46% 0,56% 0,100% 100%,0 100%)}',
'.elite-spot-a{left:15%;animation:eliteSpotA 8s ease-in-out infinite}.elite-spot-b{right:15%;animation:eliteSpotB 9s ease-in-out infinite}',
'.elite-stand{position:absolute;left:0;right:0;bottom:0;height:23%;background:linear-gradient(#132e37,#05121a);clip-path:polygon(0 20%,50% 0,100% 20%,100% 100%,0 100%)}',
'.elite-stand:before{content:"";position:absolute;inset:25% 0 0;background:repeating-linear-gradient(90deg,#73818a 0 2px,#253544 2px 7px,#b8a28e 7px 9px,#132232 9px 16px);opacity:.36}',
'.elite-raised{box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 20px 60px rgba(0,0,0,.35)}',
'@media(prefers-reduced-motion:reduce){.elite-spot{animation:none!important}}'
].join('\n');

export const PenaltyEliteSetup:React.FC<Props>=({onBack,onStart})=>{
 const [step,setStep]=useState<'clubs'|'lineup'>('clubs');
 const [index,setIndex]=useState(0);
 const [club,setClub]=useState<EliteClub>(ELITE_CLUBS[0]);
 const [rival,setRival]=useState<EliteClub>(ELITE_CLUBS[1]);
 const [selectedKickers,setSelectedKickers]=useState<ElitePlayer[]>([]);
 const [rosterPage,setRosterPage]=useState(0);
 const reduced=useReducedMotion();
 const displayed=ELITE_CLUBS[index];
 useEffect(()=>{
   const link=document.createElement('link');
   link.rel='prefetch';link.as='fetch';link.href='/penalty-models/player.glb';document.head.appendChild(link);
   return ()=>link.remove();
 },[]);
 const browse=(delta:number)=>setIndex(i=>(i+delta+ELITE_CLUBS.length)%ELITE_CLUBS.length);
 const choose=()=>{setClub(displayed);setRival(chooseOpponent(displayed.id));setSelectedKickers([]);setRosterPage(0);setStep('lineup')};
 const toggle=(p:ElitePlayer)=>setSelectedKickers(old=>old.some(x=>x.number===p.number)?old.filter(x=>x.number!==p.number):old.length>=5?old:[...old,p]);
 const badge=(team:EliteClub,large=false)=><PenaltyClubCrest club={team} className={large?'h-24 w-24 md:h-[150px] md:w-[150px] rounded-[28px]':'h-12 w-12 md:h-16 md:w-16'}/>;
 return <main dir="rtl" className="relative isolate flex h-full min-h-0 w-full flex-col overflow-x-hidden overflow-y-auto overscroll-contain rounded-xl sm:rounded-[26px] bg-[#020914] text-white select-none">
  <style>{css}</style>
  <div className="elite-stadium pointer-events-none absolute inset-0"><div className="elite-spot elite-spot-a"/><div className="elite-spot elite-spot-b"/><div className="elite-stand"/><div className="absolute bottom-[14%] w-full h-[5px] bg-gradient-to-r from-[#9b8a70] via-[#e4cc91] to-[#5cabb1] opacity-65"/></div>
  <header className="relative z-20 flex shrink-0 items-center justify-between gap-2 px-4 py-3 md:px-8 md:py-5">
   <button type="button" aria-label="عودة" className="grid h-10 w-10 md:h-12 md:w-12 place-items-center rounded-full border border-white/20 bg-black/35 hover:bg-white/10" onClick={step==='clubs'?onBack:()=>setStep('clubs')}><ArrowLeft size={21}/></button>
   <div className="text-center"><div dir="ltr" className="text-[10px] md:text-xs font-bold tracking-[.3em] text-[#ead6a3]">QUL PENALTY ELITE</div><h1 className="text-lg md:text-3xl font-black">{step==='clubs'?'اختر ناديك':'تشكيلة ركلات الترجيح'}</h1></div>
   <span className="grid h-10 w-10 md:h-12 md:w-12 place-items-center rounded-full border border-[#e3c077]/35 bg-[#e3c077]/10"><Trophy size={21} className="text-[#e5c481]"/></span>
  </header>
  <AnimatePresence mode="wait" initial={false}>
  {step==='clubs'?<motion.section key="clubs" initial={reduced?false:{opacity:0,x:70}} animate={{opacity:1,x:0}} exit={reduced?{}:{opacity:0,x:-70}} transition={{duration:.42}} className="relative z-10 flex flex-1 min-h-0 flex-col justify-between gap-2 px-3 sm:px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-8 md:pb-6">
   <p className="text-center text-[11px] md:text-sm text-slate-400">اختر النادي الذي ستمثله في تحدي ركلات الترجيح</p>
   <div className="relative flex flex-1 min-h-[180px] sm:min-h-[240px] lg:min-h-[305px] items-center justify-center">
    <button type="button" aria-label="النادي السابق" onClick={()=>browse(-1)} className="absolute z-20 right-0 md:right-[6%] grid h-12 w-12 md:h-16 md:w-16 place-items-center rounded-full border border-white/25 bg-black/45 hover:border-[#e7c681]"><ChevronRight size={29}/></button>
    <button type="button" aria-label="النادي التالي" onClick={()=>browse(1)} className="absolute z-20 left-0 md:left-[6%] grid h-12 w-12 md:h-16 md:w-16 place-items-center rounded-full border border-white/25 bg-black/45 hover:border-[#e7c681]"><ChevronLeft size={29}/></button>
    <AnimatePresence mode="wait" initial={false}>
     <motion.div key={displayed.id} initial={reduced?false:{opacity:0,scale:.83,rotateY:24,x:40}} animate={{opacity:1,scale:1,rotateY:0,x:0}} exit={reduced?{}:{opacity:0,scale:.91,rotateY:-24,x:-40}} transition={{type:'spring',stiffness:140,damping:21}} className="relative mx-auto flex w-full max-w-[900px] flex-col md:flex-row-reverse items-center justify-around gap-1 md:gap-5">
      <div className="absolute inset-8 opacity-25 blur-[80px]" style={{background:displayed.primary}}/>
      <div className="relative z-10 flex flex-col items-center gap-2 md:gap-3 text-center">
       {badge(displayed,true)}
       <span dir="ltr" className="text-xs tracking-[.35em] font-black text-[#e4c782]">THE CLUB</span>
       <h2 className="text-3xl md:text-5xl leading-tight font-black drop-shadow-xl">{displayed.name}</h2>
       <span dir="ltr" className="text-xs md:text-lg tracking-[.2em] text-slate-300 font-semibold">{displayed.english.toUpperCase()}</span>
       <div className="flex gap-2 pt-1"><span className="h-1.5 w-14 rounded-full" style={{background:displayed.primary}}/><span className="h-1.5 w-14 rounded-full" style={{background:displayed.secondary}}/></div>
      </div>
      <motion.div animate={reduced?{}:{y:[0,-6,0]}} transition={{duration:4,repeat:Infinity,ease:'easeInOut'}} className="relative z-10 flex h-[clamp(110px,23dvh,200px)] md:h-[min(34dvh,360px)] w-[min(55vw,220px)] md:w-[330px] items-center justify-center">
       <PenaltyJersey club={displayed} showNumber={false} className="h-full w-full drop-shadow-[0_20px_28px_rgba(0,0,0,.8)]"/>
      </motion.div>
     </motion.div>
    </AnimatePresence>
   </div>
   <div className="sticky bottom-0 z-30 flex flex-col items-center gap-2 sm:gap-3 rounded-xl bg-[#020914]/90 py-2 backdrop-blur-xl">
    <motion.button type="button" whileHover={reduced?{}:{scale:1.045}} whileTap={{scale:.975}} onClick={choose} className="elite-raised flex min-w-[220px] md:min-w-[310px] items-center justify-center gap-3 rounded-full bg-[#e7c681] px-8 py-3 md:py-4 text-sm md:text-lg font-black text-[#0d1b29] hover:bg-[#fff0c4]">اعتمد هذا النادي <ChevronLeft size={22}/></motion.button>
    <div className="elite-raised flex w-full max-w-[1030px] items-center justify-center gap-0.5 md:gap-2 rounded-2xl border border-white/15 bg-black/45 p-1 md:p-2 backdrop-blur-xl">
     {ELITE_CLUBS.map((team,i)=><button type="button" key={team.id} onClick={()=>setIndex(i)} aria-label={'عرض '+team.name} aria-pressed={index===i} title={team.name}
      className={'relative flex min-w-0 flex-1 items-center justify-center rounded-xl py-1.5 md:py-2 transition-all duration-300 '+(index===i?'bg-white/15 ring-1 ring-[#e6bd73]/55':'hover:bg-white/10 opacity-55 hover:opacity-100')}>
      <img src={team.crestUrl} alt="" loading="lazy" className="h-7 w-7 md:h-12 md:w-11 object-contain"/>
      {index===i&&<span className="absolute bottom-0 h-0.5 w-3/5 rounded-full bg-[#e6bd73]"/>}
     </button>)}
    </div>
    <p className="text-center text-[9px] md:text-[10px] text-slate-400">تنقل بين الأندية بواسطة الأسهم أو الشعارات. الشعارات للتعريف وليست رعاية رسمية.</p>
   </div>
  </motion.section>
  :<motion.section key="lineup" initial={reduced?false:{opacity:0,x:-35}} animate={{opacity:1,x:0}} exit={{opacity:0}} transition={{duration:.34}} className="relative z-10 flex flex-1 min-h-0 flex-col gap-2 md:gap-3 px-3 md:px-7 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-5">
   <div className="elite-raised flex shrink-0 items-center justify-between gap-2 rounded-2xl border border-white/15 bg-black/45 py-2 px-3 md:px-6">
    <div className="flex items-center gap-2 md:gap-4">{badge(club)}<div><span className="text-[9px] text-[#e4c782]">فريقك</span><h2 className="font-black text-xs md:text-lg">{club.name}</h2></div></div>
    <div className="text-center"><span dir="ltr" className="text-2xl font-black text-white/80">VS</span><button onClick={()=>setRival(chooseOpponent(club.id,rival.id))} type="button" className="flex items-center gap-1 text-[10px] text-[#e7c681] hover:underline"><RotateCcw size={11}/> خصم آخر</button></div>
    <div className="flex items-center gap-2 md:gap-4"><div className="text-left"><span className="text-[9px] text-slate-400">الكمبيوتر</span><h2 className="font-black text-xs md:text-lg">{rival.name}</h2></div>{badge(rival)}</div>
   </div>
   <div className="flex shrink-0 items-center justify-between gap-2"><div><span className="text-[10px] font-black text-[#e7c681]">اختر خمسة لاعبين بالترتيب</span><h3 className="text-lg md:text-2xl font-black">المسددون</h3></div><span dir="ltr" className="rounded-xl border border-[#e6bf78]/45 bg-[#e6bf78]/10 px-3 py-2 text-base md:text-xl font-black text-[#f7dfae]">{selectedKickers.length} / 5</span></div>
   <div className="flex lg:hidden shrink-0 items-center justify-between text-[10px] text-slate-300"><span>المجموعة {rosterPage+1} من 2</span><div className="flex gap-1">{[0,1].map(page=><button type="button" key={page} onClick={()=>setRosterPage(page)} className={'rounded-lg border px-3 py-1.5 '+(rosterPage===page?'border-[#e6bf78] text-[#e6bf78]':'border-white/20')}>{page===0?'1 إلى 6':'7 إلى 11'}</button>)}</div></div>
   <div className="grid flex-1 min-h-[160px] grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 md:gap-2.5">
    {club.players.map((player,i)=>{const place=selectedKickers.findIndex(p=>p.number===player.number),active=place>=0;return <button key={player.number} type="button" onClick={()=>toggle(player)} disabled={!active&&selectedKickers.length>=5} aria-pressed={active}
      className={'group relative flex min-h-[90px] sm:min-h-[115px] lg:min-h-[178px] flex-col items-center justify-end overflow-hidden rounded-xl md:rounded-2xl border bg-gradient-to-b from-[#1d3039]/95 to-[#071421]/95 pb-2 pt-1 transition-all hover:-translate-y-1 disabled:opacity-40 '+(active?'border-[#f0c77a] shadow-[inset_0_0_0_1px_rgba(240,199,122,.6),0_0_25px_rgba(229,172,83,.18)]':'border-white/15 hover:border-white/60')+(i>=rosterPage*6&&i<(rosterPage+1)*6?'':' hidden lg:flex')}>
      <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-15" style={{background:'linear-gradient(to top,'+club.primary+',transparent)'}}/>
      {active&&<span className="absolute z-10 top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#e6c47f] text-[#101922] text-xs font-black">{place+1}</span>}
      <PenaltyJersey club={club} number={player.number} className="relative h-[55px] sm:h-[80px] lg:h-[124px] w-full drop-shadow-[0_8px_8px_rgba(0,0,0,.5)] group-hover:scale-[1.055] transition-transform duration-300"/>
      <div className="relative w-full px-1 text-center mt-1"><strong dir="ltr" className="block text-[10px] md:text-sm font-black truncate">{player.name}</strong><span className="text-[9px] md:text-[10px] text-slate-400">{roles[player.role]}</span></div>
    </button>})}
   </div>
   <div className="elite-raised sticky bottom-0 z-30 flex shrink-0 flex-wrap sm:flex-nowrap items-center gap-2 rounded-xl border border-[#e5c17b]/20 bg-[#061724]/95 px-2.5 md:px-5 py-2 backdrop-blur-xl">
    <div className="flex flex-1 min-w-0 justify-end gap-1 md:gap-2 overflow-hidden">{Array.from({length:5},(_,i)=><div key={i} className="flex min-w-0 w-1/5 max-w-[130px] flex-col items-center rounded-lg border border-white/15 bg-black/25 px-1 py-1.5"><span className="text-[9px] text-[#e5c17b]">{i+1}</span><span dir="ltr" className="truncate max-w-full text-[9px] md:text-xs font-black">{selectedKickers[i]?.name||'...'}</span></div>)}</div>
    <button type="button" disabled={selectedKickers.length!==5} onClick={()=>onStart(club,rival,selectedKickers)} className="flex w-full sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#e5c17b] px-3 md:px-7 py-3 md:py-4 text-xs md:text-lg font-black text-[#101c29] hover:bg-[#ffdf9c] disabled:opacity-35">ابدأ الركلات <ChevronLeft size={19}/></button>
   </div>
  </motion.section>}
  </AnimatePresence>
 </main>;
};
