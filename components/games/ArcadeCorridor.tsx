import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Check, ChevronLeft,
  Crosshair, DoorOpen, RotateCcw, ShieldCheck, Zap, Target, LockKeyhole, X } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { MISSIONS } from './TacticalMissionScene';
import type { GamePhase, MissionId, createTacticalScene } from './TacticalMissionScene';
import './TacticalMission.css';

type Language = 'ar' | 'en';
type Question = { ar: string; en: string; choices: { ar: string; en: string }[]; correct: number };
const TASKS: Record<MissionId, Question[]> = {
  // Learning difficulty rises by room: A1 vocabulary -> A2 directions ->
  // B1 evidence and syntax -> B2 reasoning and safe decisions.
  warehouse: [
    {ar:'باب المخزن مغلق. ما الأداة التي تحتاج إليها لفتحه؟',
      en:'The depot door is locked. Which tool do you need to open it?',
      choices:[{ar:'المصباح',en:'Flashlight'},{ar:'المفتاح',en:'Key'},{ar:'القلم',en:'Pen'}],correct:1},
    {ar:'قال المسؤول: «ضع الخوذة على رأسك». ماذا يرتدي الجندي؟',
      en:'The officer says “Put the helmet on your head.” What should the soldier wear?',
      choices:[{ar:'الخوذة',en:'Helmet'},{ar:'الحذاء',en:'Shoe'},{ar:'القفاز',en:'Glove'}],correct:0},
    {ar:'بعد دخول المخزن، ما الأمر المناسب لحماية المكان؟',
      en:'After entering the depot, which instruction will secure it?',
      choices:[{ar:'اجلس على الأرض',en:'Sit on the floor'},{ar:'أغلق الباب',en:'Close the door'},{ar:'اكتب اسمك',en:'Write your name'}],correct:1},
  ],
  signals: [
    {ar:'تقول رسالة التحكم: «افتح الباب الأزرق ثم اقترب من الجهاز». ماذا تفعل أولًا؟',
      en:'Control says “Open the blue door, then approach the device.” What comes first?',
      choices:[{ar:'أقترب من الجهاز',en:'Approach the device'},{ar:'أفتح الباب الأزرق',en:'Open the blue door'},{ar:'أغلق النافذة',en:'Close the window'}],correct:1},
    {ar:'تظهر على الشاشة عبارة: «لا تلمس الزر الأحمر». ما التصرف الصحيح؟',
      en:'The screen reads “Do not touch the red button.” What should you do?',
      choices:[{ar:'أبتعد عن الزر الأحمر',en:'Avoid the red button'},{ar:'أضغط الزر الأحمر',en:'Press the red button'},{ar:'أفصل الشاشة',en:'Disconnect the screen'}],correct:0},
    {ar:'إذا كانت الإشارة خضراء فتقدم، وإذا كانت حمراء فتوقف. الإشارة الآن حمراء. ماذا تفعل؟',
      en:'Green means advance and red means stop. The signal is now red. What do you do?',
      choices:[{ar:'أتقدم بسرعة',en:'Advance quickly'},{ar:'أعود إلى المخزن',en:'Return to the depot'},{ar:'أتوقف وأنتظر',en:'Stop and wait'}],correct:2},
  ],
  archive: [
    {ar:'وجد المحقق بطاقة قرب النافذة، لكنه لم يجد المفتاح. ما الشيء الذي عثر عليه؟',
      en:'The detective found a card by the window, but not the key. What did he find?',
      choices:[{ar:'المفتاح',en:'The key'},{ar:'النافذة',en:'The window'},{ar:'البطاقة',en:'The card'}],correct:2},
    {ar:'اختر الفعل الصحيح: «الجنديان .... التقرير».',
      en:'Choose the correct verb: “The two soldiers .... the report.”',
      choices:[{ar:'يقرؤون',en:'They (plural) read'},{ar:'يقرآن',en:'The two read'},{ar:'تقرأ',en:'She reads'}],correct:1},
    {ar:'الباب مغلق، والمفتاح في درج المكتب. ما الخطوة المنطقية قبل فتح الباب؟',
      en:'The door is locked; the key is in the desk drawer. What should you do first?',
      choices:[{ar:'أفتح الدرج وآخذ المفتاح',en:'Get the key from the drawer'},{ar:'أحطم النافذة',en:'Break the window'},{ar:'أنتظر دون محاولة',en:'Wait and do nothing'}],correct:0},
  ],
  command: [
    {ar:'توقفت الكهرباء، فأطفأ القائد الأجهزة غير الضرورية. لماذا اتخذ هذا القرار؟',
      en:'Power failed, so the commander shut down nonessential devices. Why?',
      choices:[{ar:'ليزيد عدد الأجهزة',en:'To use more devices'},{ar:'ليحافظ على طاقة المولد',en:'To save generator power'},{ar:'ليغلق جميع الأبواب',en:'To lock every door'}],correct:1},
    {ar:'سمع الحارس صوتًا خلف الباب، ففحص الكاميرا قبل فتحه. ما السلوك الذي يدل عليه هذا التصرف؟',
      en:'A guard checks the camera before opening a noisy door. What does this show?',
      choices:[{ar:'التسرع',en:'Rushing'},{ar:'الإهمال',en:'Negligence'},{ar:'الحذر والتحقق',en:'Caution and verification'}],correct:2},
    {ar:'وصلت رسالة بلغة لا تفهمها، لكن زميلك يعرفها. ما القرار الأنسب لإنقاذ الفريق؟',
      en:'A message arrives in a language you do not know, but your teammate does. What is best?',
      choices:[{ar:'أطلب مساعدته وأتعاون معه',en:'Ask for help and work together'},{ar:'أتجاهل الرسالة',en:'Ignore the message'},{ar:'أخمن معناها وحدي',en:'Guess alone'}],correct:0},
  ],
};
const LEVELS: Record<MissionId,{ar:string;en:string;goalAr:string;goalEn:string}> = {
  warehouse:{ar:'01 · تأسيس / A1',en:'01 · FOUNDATION / A1',goalAr:'المفردات وفهم الأوامر المباشرة',goalEn:'Vocabulary and simple commands'},
  signals:{ar:'02 · تطبيق / A2',en:'02 · APPLICATION / A2',goalAr:'تتبّع التعليمات وترتيب الخطوات',goalEn:'Following multi-step instructions'},
  archive:{ar:'03 · تحليل / B1',en:'03 · ANALYSIS / B1',goalAr:'فهم الأدلة والتراكيب اللغوية',goalEn:'Evidence, grammar and inference'},
  command:{ar:'04 · استنتاج / B2',en:'04 · REASONING / B2',goalAr:'التفسير واتخاذ القرار والتعاون',goalEn:'Inference, decisions and collaboration'}
};

const REWARDS: Record<MissionId, {ar:string;en:string}> = {
  warehouse: {ar:'موجّه الطاقة MK-II',en:'Energy Focus MK-II'},
  signals: {ar:'ماسح الإشارات MK-III',en:'Signal Scanner MK-III'},
  archive: {ar:'عدسة كشف الأدلة',en:'Evidence Vision Lens'},
  command: {ar:'قاذف النبضات المتقدم',en:'Advanced Pulse Launcher'},
};
const savedMissions = (key:string): MissionId[] => {
  try {
    const parsed=JSON.parse(localStorage.getItem(key)||'[]');
    return Array.isArray(parsed)?MISSIONS.map(m=>m.id).filter(id=>parsed.includes(id)):[];
  }catch{return [];}
};
type Input = {x:number;z:number;sprint:boolean};
type Props = {lang:Language;onBack:()=>void;onLaunch?:(gameId:string)=>void};
export const ArcadeCorridor: React.FC<Props> = ({lang,onBack}) => {
  const {user}=useAuth();
  const ar=lang==='ar';
  const key='qul_tactical_missions_v1_'+(user?.uid||'guest');
  const [completed,setCompleted]=useState<MissionId[]>(()=>savedMissions(key));
  const [phase,setPhase]=useState<GamePhase>('entrance');
  const [room,setRoom]=useState<MissionId|null>(null);
  const [nearby,setNearby]=useState<MissionId|null>(null);
  const [ready,setReady]=useState(false);
  const [error,setError]=useState('');
  const [attempt,setAttempt]=useState(0);
  const [round,setRound]=useState(0);
  const [feedback,setFeedback]=useState<'correct'|'wrong'|null>(null);
  const [armed,setArmed]=useState(false);
  const [shield,setShield]=useState(3);
  const [failed,setFailed]=useState(false);
  const [reward,setReward]=useState(false);
  const [score,setScore]=useState(0);
  const [input,setInput]=useState<Input>({x:0,z:0,sprint:false});
  const [paused,setPaused]=useState(false);
  const host=useRef<HTMLDivElement>(null);
  const engine=useRef<ReturnType<typeof createTacticalScene>|null>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const completedRef=useRef(completed);
  completedRef.current=completed;
  const progressRef=useRef<{room:MissionId|null;round:number;armed:boolean}>({room:null,round:0,armed:false});
  const unlocked=(id:MissionId)=>completedRef.current.includes(id)||MISSIONS.find(m=>!completedRef.current.includes(m.id))?.id===id;
  const nextMission=MISSIONS.find(m=>!completed.includes(m.id))?.id;
  useEffect(()=>setCompleted(savedMissions(key)),[key]);

  useEffect(()=>{
    const el=host.current;
    if(!el)return;
    let cancelled=false;
    let scene:ReturnType<typeof createTacticalScene>|null=null;
    import('./TacticalMissionScene').then(module=>{
      if(cancelled)return;
      try {
        scene=module.createTacticalScene(el,{
          lang,
          onPhase(next,id){
            if(cancelled)return;
            setPhase(next);
            if(next==='room'){
              progressRef.current={room:id??null,round:0,armed:false};
              setRoom(id??null);setRound(0);setReward(false);setFeedback(null);
              setArmed(false);setFailed(false);setShield(3);
            }
            if(next==='corridor'){setRoom(null);progressRef.current.armed=false;setArmed(false);}
          },
          onNearby(id){if(!cancelled)setNearby(id);},
          onTargetHit(){if(!cancelled)handleTargetHit();},
          canEnter(id){return completedRef.current.includes(id)||MISSIONS.find(m=>!completedRef.current.includes(m.id))?.id===id;},
          onError(message){if(!cancelled)setError(message);}
        });
        engine.current=scene;
        scene.setUpgrade(Math.min(5,completed.length+1));
        setReady(true);setError('');
      }catch(e){if(!cancelled)setError(ar?'تعذر إنشاء المشهد الثلاثي الأبعاد.':'Could not initialize the 3D scene.');}
    }).catch(()=>{if(!cancelled)setError(ar?'تعذر تحميل مشهد اللعبة.':'Failed to load game scene.');});
    return ()=>{
      cancelled=true;scene?.dispose();
      if(engine.current===scene)engine.current=null;
    };
  },[attempt]);

  useEffect(()=>{engine.current?.setLanguage(lang);},[lang,ready]);
  useEffect(()=>{engine.current?.setUpgrade(Math.min(5,completed.length+1));},[completed,ready]);
  useEffect(()=>{engine.current?.setInput(input);},[input,ready]);
  useEffect(()=>{engine.current?.setPaused(paused);},[paused,ready]);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);

  const current=room?TASKS[room][round]:null;
  const info=room?MISSIONS.find(m=>m.id===room):null;
  const near=nearby?MISSIONS.find(m=>m.id===nearby):null;
  const handleTargetHit=()=>{
    const progress=progressRef.current;
    if(!progress.armed||!progress.room)return;
    const missionId=progress.room;
    progress.armed=false;
    setArmed(false);
    setFeedback(null);
    setScore(previous=>previous+100);
    if(progress.round===TASKS[missionId].length-1){
      setReward(true);
      const next=completedRef.current.includes(missionId)
        ? completedRef.current : [...completedRef.current,missionId];
      completedRef.current=next;
      setCompleted(next);
      try{localStorage.setItem(key,JSON.stringify(next));}catch{}
    }else{
      progress.round+=1;
      setRound(progress.round);
    }
  };
  const answer=(index:number)=>{
    if(!room||phase!=='room'||!TASKS[room][round]||feedback||reward||armed||failed)return;
    const current=TASKS[room][round];
    if(index!==current.correct){
      const remaining=Math.max(0,shield-1);
      setShield(remaining);
      setFeedback('wrong');
      if(remaining===0){
        setFailed(true);
        return;
      }
      timer.current=setTimeout(()=>setFeedback(null),850);
      return;
    }
    // Answering gives permission to fire at the holographic target.
    // Only a real projectile hit completes the stage and awards points.
    progressRef.current.armed=true;
    setArmed(true);
    setFeedback('correct');
    engine.current?.armTarget(true);
  };
  const retry=()=>{
    if(timer.current)clearTimeout(timer.current);
    progressRef.current={room,round:0,armed:false};
    engine.current?.armTarget(false);
    setRound(0);setShield(3);setFailed(false);setFeedback(null);setReward(false);setArmed(false);
  };
  const direction=(type:'x'|'z',value:number,pressed:boolean)=>{
    setInput(prev=>({...prev,[type]:pressed?value:0}));
  };
  const directional=(icon:React.ReactNode, axis:'x'|'z',value:number,label:string)=>(
    <button aria-label={label} className="qul-ops-direction"
      onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);direction(axis,value,true);}}
      onPointerUp={()=>direction(axis,value,false)}
      onPointerCancel={()=>direction(axis,value,false)}
      onLostPointerCapture={()=>direction(axis,value,false)}
    >{icon}</button>
  );
  return (
    <div className="qul-ops" dir={ar?'rtl':'ltr'}>
      <div ref={host} className="qul-ops-world"/>
      <div className="qul-ops-vignette" aria-hidden="true"/>
      <header className="qul-ops-header">
        <div className="qul-ops-brand"><Crosshair size={23}/><span><strong>QUL <em>OPS</em></strong><small>{ar?'المهام التعليمية':'TACTICAL LEARNING'}</small></span></div>
        <div className="qul-ops-header-actions"><span>MK-{completed.length+1}</span><button onClick={onBack}><X size={17}/>{ar?'خروج':'EXIT'}</button></div>
      </header>
      {!ready&&(
        <div className="qul-ops-loader" role="status">
          <Crosshair size={42}/><strong>{error||(ar?'جارٍ تجهيز اللعبة...':'PREPARING GAME...')}</strong>
          {error&&<button onClick={()=>{setError('');setAttempt(n=>n+1);}}><RotateCcw size={16}/>{ar?'إعادة المحاولة':'RETRY'}</button>}
          <button onClick={onBack}>{ar?'العودة للألعاب':'BACK'}</button>
        </div>
      )}
      {ready&&phase==='entrance'&&(
        <div className="qul-ops-intro">
          <small>QUL / TACTICAL MISSION</small>
          <h1>{ar?'المهمة السرية':'SECRET MISSION'}</h1>
          <p>{ar?'ادخل المنشأة، واجتز الغرف، وحل المهمات اللغوية للحصول على معدات أكثر كفاءة.':'Explore the facility, solve language missions and earn equipment upgrades.'}</p>
          <button className="qul-ops-action" onClick={()=>engine.current?.start()}><DoorOpen size={20}/>{ar?'ابدأ المهمة':'START OPERATION'}</button>
        </div>
      )}
      {ready&&(phase==='starting'||phase==='entering'||phase==='leaving')&&
        <div className="qul-ops-status">{phase==='starting'?(ar?'جاري فتح البوابة...':'OPENING GATE...'):phase==='entering'?(ar?'دخول الغرفة...':'ENTERING ROOM...'):(ar?'مغادرة الغرفة...':'LEAVING ROOM...')}</div>}
      {ready&&phase==='corridor'&&(
        <>
          <div className="qul-ops-objective"><span className="qul-ops-led"/>{near?(ar?'اقتربت من: '+near.ar:'NEAR: '+near.en):(ar?'ابحث عن باب المهمة':'FIND THE NEXT OBJECTIVE')}</div>
          {nearby&&<button className="qul-ops-enter" onClick={()=>engine.current?.enterNearest()}><DoorOpen size={18}/>{ar?'افتح الباب':'OPEN DOOR'}</button>}
          <nav className="qul-ops-map">
            <div className="qul-ops-map-title">MISSION SELECT <b>{completed.length}/4</b></div>
            <div className="qul-ops-map-list">
              {MISSIONS.map((m,i)=><button key={m.id} className={completed.includes(m.id)?'completed':''} onClick={()=>engine.current?.travelTo(m.id)}>
                <span>0{i+1}</span><strong>{ar?m.ar:m.en}</strong>{completed.includes(m.id)&&<Check size={13}/>}
              </button>)}
            </div>
          </nav>
        </>
      )}
      {ready&&phase==='room'&&room&&(
        <aside className="qul-ops-mission">
          <div className="qul-ops-mission-top"><span>OBJECTIVE / 0{MISSIONS.findIndex(m=>m.id===room)+1}</span><button onClick={()=>{if(timer.current)clearTimeout(timer.current);engine.current?.leave();}} aria-label={ar?'عودة':'Back'}><ArrowLeft size={20}/></button></div>
          <h2>{ar?info?.ar:info?.en}</h2>
          {!reward ? (
            <>
              <div className="qul-ops-stage">MISSION {round+1} / 3 <span>{[0,1,2].map(i=><i key={i} className={i<=round?'on':''}/>)}</span></div>
              <p>{ar?current?.ar:current?.en}</p>
              {room==='signals'&&round===0&&<button className="qul-ops-audio" onClick={speak}><Volume2 size={17}/>{ar?'استمع للأمر':'LISTEN'}</button>}
              <div className="qul-ops-answers">
                {current?.choices.map((choice,i)=><button key={i} disabled={feedback==='correct'} onClick={()=>answer(i)} className={feedback==='correct'&&i===current.correct?'correct':feedback==='wrong'?'wrong':''}>
                  <span>{String.fromCharCode(65+i)}</span>{ar?choice.ar:choice.en}
                </button>)}
              </div>
              {feedback&&<div className={'qul-ops-feedback '+feedback}>{feedback==='correct'?(ar?'✓ تم تعطيل القفل':'✓ ACCESS GRANTED'):(ar?'حاول مرة أخرى':'TRY AGAIN')}</div>}
            </>
          ):(
            <div className="qul-ops-reward"><ShieldCheck size={42}/><h3>{ar?'مهمة ناجحة!':'MISSION COMPLETE'}</h3><p>{ar?'حصلت على تجهيز جديد:':'NEW EQUIPMENT UNLOCKED:'}</p>
              <strong>{ar?REWARDS[room].ar:REWARDS[room].en}</strong>
              <button className="qul-ops-action" onClick={()=>engine.current?.leave()}>{ar?'العودة للممر':'CONTINUE'}<ChevronLeft size={18}/></button>
            </div>
          )}
        </aside>
      )}
      <div className="qul-ops-stats">
        <span><Crosshair size={16}/><b>{score}</b> XP</span><span><ShieldCheck size={16}/>{completed.length}/4</span><span><Zap size={16}/>100%</span>
      </div>
      {ready&&phase==='corridor'&&(
        <div className="qul-ops-controls">
          <div className="qul-ops-dpad">
            <div>{directional(<ArrowUp size={23}/>,'z',1,'Forward')}</div>
            <div>{directional(<ArrowLeft size={23}/>,'x',-1,'Left')}
              {directional(<ArrowDown size={23}/>,'z',-1,'Back')}
              {directional(<ArrowRight size={23}/>,'x',1,'Right')}</div>
          </div>
          <button className="qul-ops-run" aria-label="Sprint"
            onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);setInput(v=>({...v,sprint:true}));}}
            onPointerUp={()=>setInput(v=>({...v,sprint:false}))}
            onPointerCancel={()=>setInput(v=>({...v,sprint:false}))}
            onLostPointerCapture={()=>setInput(v=>({...v,sprint:false}))}><Zap size={22}/></button>
          <div className="qul-ops-desktop-instructions">WASD / ↑↓ {ar?'للحركة':'MOVE'} · SHIFT {ar?'للجري':'RUN'} · E {ar?'للدخول':'ENTER'}</div>
        </div>
      )}
      {ready&&phase==='corridor'&&<div className="qul-ops-crosshair" aria-hidden="true">+</div>}
      {ready&&<button className="qul-ops-pause" onClick={()=>setPaused(v=>!v)}>{paused?(ar?'استئناف':'RESUME'):(ar?'إيقاف مؤقت':'PAUSE')}</button>}
    </div>
  );
};
