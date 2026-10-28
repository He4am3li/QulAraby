import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Check, ChevronLeft,
  Crosshair, DoorOpen, RotateCcw, ShieldCheck, Zap, Volume2, X } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { MISSIONS } from './TacticalMissionScene';
import type { GamePhase, MissionId, createTacticalScene } from './TacticalMissionScene';
import './TacticalMission.css';

type Language = 'ar' | 'en';
type Question = { ar: string; en: string; choices: { ar: string; en: string }[]; correct: number };
const TASKS: Record<MissionId, Question[]> = {
  warehouse: [
    { ar: 'حدّد الكلمة التي تعني KEY لفتح صندوق الإمدادات.', en: 'Select the Arabic word for KEY to unlock the supply crate.',
      choices: [{ar:'النافذة',en:'Window'},{ar:'المفتاح',en:'Key'},{ar:'الكرسي',en:'Chair'}], correct: 1 },
    { ar: 'أي كلمة تدل على شيء نرتديه في الرأس؟', en: 'Which word names something worn on the head?',
      choices: [{ar:'القبعة',en:'Hat'},{ar:'الحقيبة',en:'Bag'},{ar:'الحذاء',en:'Shoe'}], correct: 0 },
    { ar: 'أكمل الأمر: «_____ البابَ»', en: 'Complete the command: “_____ the door.”',
      choices: [{ar:'يسافر',en:'Travels'},{ar:'أغلقْ',en:'Close!'},{ar:'جميل',en:'Beautiful'}], correct: 1 },
  ],
  signals: [
    { ar: 'استمع إلى الأمر، ثم اختر معناه: «افتح الباب الأزرق».', en: 'Listen and identify: “Open the blue door.”',
      choices: [{ar:'افتح الباب الأحمر',en:'Open the red door'},{ar:'أغلق الباب الأزرق',en:'Close the blue door'},{ar:'افتح الباب الأزرق',en:'Open the blue door'}], correct: 2 },
    { ar: 'ما معنى «اتّجه إلى اليمين»؟', en: 'What does “اتّجه إلى اليمين” mean?',
      choices: [{ar:'اتجه إلى اليمين',en:'Turn right'},{ar:'عد إلى الخلف',en:'Go back'},{ar:'توقّف',en:'Stop'}], correct: 0 },
    { ar: 'اختر الجملة التي تعبّر عن طلب المساعدة.', en: 'Choose the sentence requesting help.',
      choices: [{ar:'السماء صافية',en:'The sky is clear'},{ar:'هل يمكنك مساعدتي؟',en:'Can you help me?'},{ar:'أنا في المدرسة',en:'I am at school'}], correct: 1 },
  ],
  archive: [
    { ar: 'اختر معنى «وجد المحقق الدليل».', en: 'Choose the meaning of “وجد المحقق الدليل”.',
      choices: [{ar:'أضاع المحقق المفتاح',en:'The detective lost the key'},{ar:'غادر المحقق',en:'The detective left'},{ar:'وجد المحقق الدليل',en:'The detective found the clue'}], correct: 2 },
    { ar: 'ما جمع كلمة «رسالة»؟', en: 'What is the plural of “رسالة” (letter)?',
      choices: [{ar:'رسائل',en:'Letters'},{ar:'رُسُل',en:'Messengers'},{ar:'مدارس',en:'Schools'}], correct: 0 },
    { ar: 'اختر الجملة الصحيحة التي تفتح الأرشيف.', en: 'Choose the grammatically correct sentence.',
      choices: [{ar:'الطالبُ يقرأُ الكتابَ',en:'The student reads the book'},{ar:'الطالبُ تقرأُ الكتابَ',en:'Incorrect agreement'},{ar:'الطالبةُ يقرأُ الكتابَ',en:'Incorrect agreement'}], correct: 0 },
  ],
  command: [
    { ar: 'أي جملة تعبّر عن السبب والنتيجة؟', en: 'Which sentence expresses cause and effect?',
      choices: [{ar:'المدينة جميلة',en:'The city is beautiful'},{ar:'نجح لأنه درس جيدًا',en:'He succeeded because he studied'},{ar:'كان الجو باردًا',en:'The weather was cold'}], correct: 1 },
    { ar: 'إذا انطفأت الأضواء، فما أول تصرف آمن؟', en: 'If the lights go out, what is a safe first response?',
      choices: [{ar:'أركض بلا انتباه',en:'Run without looking'},{ar:'أكسر الباب',en:'Break the door'},{ar:'أبحث عن ضوء الطوارئ',en:'Find emergency lighting'}], correct: 2 },
    { ar: 'أي عبارة تدل على التعاون؟', en: 'Which expression shows cooperation?',
      choices: [{ar:'سنتعاون لنحل المشكلة',en:'We will work together to solve it'},{ar:'لن أساعد أحدًا',en:'I will not help anyone'},{ar:'سأترك الفريق',en:'I will leave the team'}], correct: 0 },
  ],
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
  const [reward,setReward]=useState(false);
  const [score,setScore]=useState(0);
  const [input,setInput]=useState<Input>({x:0,z:0,sprint:false});
  const [paused,setPaused]=useState(false);
  const host=useRef<HTMLDivElement>(null);
  const engine=useRef<ReturnType<typeof createTacticalScene>|null>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
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
              setRoom(id??null);setRound(0);setReward(false);setFeedback(null);
            }
            if(next==='corridor')setRoom(null);
          },
          onNearby(id){if(!cancelled)setNearby(id);},
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
  const answer=(index:number)=>{
    if(!room||phase!=='room'||!current||feedback||reward)return;
    if(index!==current.correct){
      setFeedback('wrong');
      timer.current=setTimeout(()=>setFeedback(null),800);
      return;
    }
    engine.current?.pulse();
    setScore(p=>p+100);setFeedback('correct');
    const completedRound=round===TASKS[room].length-1;
    timer.current=setTimeout(()=>{
      if(completedRound){
        setReward(true);
        setCompleted(prev=>{
          if(prev.includes(room))return prev;
          const next=[...prev,room];
          try{localStorage.setItem(key,JSON.stringify(next));}catch{}
          return next;
        });
      }else setRound(n=>n+1);
      setFeedback(null);
    },650);
  };
  const speak=()=>{
    if(!window.speechSynthesis)return;
    window.speechSynthesis.cancel();
    const speech=new SpeechSynthesisUtterance('افتح الباب الأزرق');
    speech.lang='ar';speech.rate=.8;
    window.speechSynthesis.speak(speech);
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
