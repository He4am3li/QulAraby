import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ChevronLeft, Crosshair,
  DoorOpen, FileLock2, FileText, Footprints, LockKeyhole, RotateCcw,
  ShieldAlert, ShieldCheck, Skull, Target, Trophy, X, Zap
} from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { SECRET_ROOMS } from './SecretMissionEngine';
import type { SecretPhase, SecretRoomId, createSecretMission } from './SecretMissionEngine';
import { buildMissionDeck, normalizeArabic } from './SecretMissionChallengeBank';
import './SecretMission.css';

type Bilingual = { ar:string; en:string };
type Choice = Bilingual;
type SafeChallenge = {
  prompt:Bilingual;
  choices:[Choice,Choice,Choice];
  answer:number;
  pin:string;
  loot:Bilingual;
};
const choices=(ar:string[],en:string[]):[Choice,Choice,Choice] => [
  {ar:ar[0],en:en[0]}, {ar:ar[1],en:en[1]}, {ar:ar[2],en:en[2]}
];
const MISSIONS:Record<SecretRoomId,{subtitle:Bilingual; briefing:Bilingual;skills:Bilingual;safes:SafeChallenge[];reward:Bilingual}> = {
  depot: {
    subtitle:{ar:'العملية الأولى · A1',en:'OPERATION 01 · A1'},
    briefing:{ar:'المخزن محروس. تعطّل أجهزة الحراسة، ثم افتح أربع خزائن بكلمات السر العربية للحصول على جهاز الإرسال الأول.',
      en:'The depot is guarded. Neutralize the security drones, then open four safes with Arabic language codes.'},
    skills:{ar:'المفردات الأساسية والأوامر القصيرة',en:'Core vocabulary and simple instructions'},
    safes:[
      {prompt:{ar:'الخزنة 01: ما الكلمة التي تعني «KEY»؟',en:'SAFE 01: Which Arabic word means KEY?'},
        choices:choices(['المفتاح','النافذة','المطر'],['Key','Window','Rain']),answer:0,pin:'2418',loot:{ar:'مفتاح إلكتروني',en:'Electronic key'}},
      {prompt:{ar:'الخزنة 02: أين تُوضع الكتب؟',en:'SAFE 02: Where do you keep books?'},
        choices:choices(['في الحذاء','على الرف','تحت الماء'],['In a shoe','On a shelf','Under water']),answer:1,pin:'7053',loot:{ar:'خريطة المخزن',en:'Depot floor plan'}},
      {prompt:{ar:'الخزنة 03: اختر الأمر الصحيح لفتح الباب.',en:'SAFE 03: Choose the correct command to open a door.'},
        choices:choices(['ذهب الولد','الباب جميل','افتح الباب'],['The boy went','The door is nice','Open the door']),answer:2,pin:'9164',loot:{ar:'بطاقة العبور',en:'Access badge'}},
      {prompt:{ar:'الخزنة 04: ما ضد كلمة «مغلق»؟',en:'SAFE 04: What is the opposite of CLOSED?'},
        choices:choices(['مفتوح','بعيد','صغير'],['Open','Far','Small']),answer:0,pin:'3825',loot:{ar:'سلاح طاقة أساسي مطوَّر',en:'Upgraded energy blaster'}}
    ],
    reward:{ar:'قاذف الطاقة MK-II',en:'Energy Blaster MK-II'}
  },
  comms: {
    subtitle:{ar:'العملية الثانية · A2',en:'OPERATION 02 · A2'},
    briefing:{ar:'حارسان يراقبان الاتصالات. تعامل معهما بحذر، ثم اتبع التعليمات واستخرج شفرات أربع خزائن.',
      en:'Two guards patrol communications. Stay alert, then follow instructions to unlock all four safes.'},
    skills:{ar:'فهم التعليمات وتسلسل الأحداث',en:'Following instructions and sequence'},
    safes:[
      {prompt:{ar:'الخزنة 01: «اذهب إلى اليمين ثم توقّف». ماذا تفعل أولًا؟',en:'SAFE 01: “Go right, then stop.” What comes first?'},
        choices:choices(['أتوقّف','أذهب إلى اليمين','أجلس'],['Stop','Go right','Sit']),answer:1,pin:'6549',loot:{ar:'شفرة الاتصالات',en:'Radio cipher'}},
      {prompt:{ar:'الخزنة 02: «لا تلمس الزر الأحمر». ما التصرف الصحيح؟',en:'SAFE 02: “Do not touch the red button.” What should you do?'},
        choices:choices(['أتجنب الزر الأحمر','أضغطه فورًا','أكسره'],['Avoid the red button','Press it','Break it']),answer:0,pin:'1802',loot:{ar:'مفتاح القناة الآمنة',en:'Secure channel key'}},
      {prompt:{ar:'الخزنة 03: «بعد فحص الشاشة أرسل الرسالة». ما الذي يحدث ثانيًا؟',en:'SAFE 03: “After checking the screen, send the message.” What happens second?'},
        choices:choices(['فحص الشاشة','الذهاب للنوم','إرسال الرسالة'],['Check the screen','Go to sleep','Send the message']),answer:2,pin:'4371',loot:{ar:'جهاز تشويش',en:'Signal jammer'}},
      {prompt:{ar:'الخزنة 04: الإشارة حمراء الآن. ماذا يجب أن تفعل؟',en:'SAFE 04: The light is red. What should you do?'},
        choices:choices(['أركض بسرعة','أتوقف وأنتظر','أتجاهلها'],['Run quickly','Stop and wait','Ignore it']),answer:1,pin:'5296',loot:{ar:'عدسة الاستهداف',en:'Targeting lens'}}
    ],
    reward:{ar:'ماسح الاستهداف MK-III',en:'Targeting Scanner MK-III'}
  },
  archive: {
    subtitle:{ar:'العملية الثالثة · B1',en:'OPERATION 03 · B1'},
    briefing:{ar:'ثلاثة حراس يحرسون أرشيف المعلومات. اجمع الأدلة، وحل المسائل النحوية والاستنتاجية لفتح الخزائن.',
      en:'Three guards defend the classified archive. Collect clues and solve grammar and inference challenges.'},
    skills:{ar:'القراءة التحليلية والنحو والاستنتاج',en:'Grammar, evidence and inference'},
    safes:[
      {prompt:{ar:'الخزنة 01: «وجد الحارس بطاقة قرب النافذة، ولم يجد المفتاح». ماذا وجد؟',en:'SAFE 01: “The guard found a card near the window, not a key.” What did he find?'},
        choices:choices(['مفتاحًا','بطاقةً','كتابًا'],['A key','A card','A book']),answer:1,pin:'6423',loot:{ar:'بطاقة الحارس',en:'Guard ID badge'}},
      {prompt:{ar:'الخزنة 02: اختر الفعل الصحيح: «الجنديان ____ التقرير».',en:'SAFE 02: Complete correctly: “The two soldiers ____ the report.”'},
        choices:choices(['يقرآن','يقرأون','تقرأ'],['Both read','They (plural) read','She reads']),answer:0,pin:'2719',loot:{ar:'خريطة الأرشيف',en:'Archive map'}},
      {prompt:{ar:'الخزنة 03: عثر المحقق على أثرٍ جديد بعد فتح الباب. ما سبب دخوله؟',en:'SAFE 03: The detective found a new clue after opening the door. Why did he enter?'},
        choices:choices(['لشراء الطعام','لينام','للبحث عن دليل'],['To buy food','To sleep','To search for clues']),answer:2,pin:'8650',loot:{ar:'ملف الأدلة',en:'Evidence dossier'}},
      {prompt:{ar:'الخزنة 04: أي عبارة تبيّن علاقة السبب بالنتيجة؟',en:'SAFE 04: Which sentence connects cause and consequence?'},
        choices:choices(['المكان واسع','أضاء المصباح لأنه كان الظلام شديدًا','أمامنا باب'],['The place is big','He lit the lamp because it was dark','There is a door']),answer:1,pin:'3147',loot:{ar:'مقوّي نبضات الطاقة',en:'Energy pulse amplifier'}}
    ],
    reward:{ar:'مقوّي طاقة MK-IV',en:'Pulse Amplifier MK-IV'}
  },
  vault: {
    subtitle:{ar:'العملية الأخيرة · B2',en:'FINAL OPERATION · B2'},
    briefing:{ar:'نظام دفاع آلي شديد الحماية يمنع الوصول إلى الوثائق. ستحتاج التجهيزات التي جمعتها، ثم أربعة قرارات لغوية لاستعادة الأوراق السرية.',
      en:'An armored defense turret protects the stolen documents. Use all previous upgrades and solve four reasoning challenges.'},
    skills:{ar:'التفكير الناقد والتحليل واتخاذ القرار',en:'Critical reasoning, analysis and decisions'},
    safes:[
      {prompt:{ar:'الخزنة 01: لماذا يراجع القائد الكاميرات قبل فتح الغرفة المغلقة؟',en:'SAFE 01: Why does the commander check cameras before opening the sealed room?'},
        choices:choices(['للتحقق من سلامة المكان','لتغيير لون الباب','لتضييع الوقت'],['To verify safety','To change its color','To waste time']),answer:0,pin:'9528',loot:{ar:'خريطة الدفاع',en:'Defense map'}},
      {prompt:{ar:'الخزنة 02: نَفِدَت طاقة المولد. ما القرار الأكثر منطقية؟',en:'SAFE 02: The generator has low energy. What is the logical decision?'},
        choices:choices(['أشغّل الأجهزة كلها','أُطفئ الأجهزة غير الضرورية','أُهمل التحذير'],['Run every device','Switch off nonessential devices','Ignore warning']),answer:1,pin:'6104',loot:{ar:'مفتاح الحماية',en:'Defense key'}},
      {prompt:{ar:'الخزنة 03: يحمل زميلك الشفرة الصحيحة وأنت لا تعرفها؛ كيف تتصرف؟',en:'SAFE 03: Your teammate knows the code and you do not. What is best?'},
        choices:choices(['أتجاهله','أخمّن وحدي','أتعاون معه لفك الشفرة'],['Ignore him','Guess alone','Cooperate to decode']),answer:2,pin:'4782',loot:{ar:'جهاز فك التشفير',en:'Decryption device'}},
      {prompt:{ar:'الخزنة 04: اختَر الاستنتاج الصحيح: استُعيدت الوثائق ولم يُصب أي زميل؛ ما سبب نجاح الفريق؟',en:'SAFE 04: The documents were recovered and no teammate was hurt. What explains the team’s success?'},
        choices:choices(['التعاون والحذر وحسن التخطيط','التسرع بلا معلومات','ترك المهمة مبكرًا'],['Teamwork, caution and planning','Rushing blindly','Abandoning the mission']),answer:0,pin:'2036',loot:{ar:'ملف الأوراق السرية المسروقة',en:'Stolen classified documents'}}
    ],
    reward:{ar:'الوثائق السرية',en:'Secret Documents'}
  }
};
const sequence=SECRET_ROOMS.map(x=>x.id);
const REWARDS:Record<SecretRoomId,Bilingual>={
  depot:{ar:'قاذف الطاقة MK-II',en:'Energy Blaster MK-II'},
  comms:{ar:'ماسح الاستهداف MK-III',en:'Targeting Scanner MK-III'},
  archive:{ar:'مقوّي النبضات MK-IV',en:'Pulse Amplifier MK-IV'},
  vault:{ar:'الوثائق السرية المستردّة',en:'Recovered Classified Documents'}
};
const storageKey=(uid:string)=>'qul_secret_documents_v2_'+uid;
function readProgress(key:string):SecretRoomId[]{
  try{
    const value=JSON.parse(localStorage.getItem(key)||'[]');
    if(!Array.isArray(value))return [];
    return sequence.filter(x=>value.includes(x));
  }catch{return [];}
}
type Input={forward:number;strafe:number;run:boolean};
export const ArcadeCorridor:React.FC<{lang:'ar'|'en';onBack:()=>void;onLaunch?:(id:string)=>void}>=({lang,onBack})=>{
  const {user}=useAuth();
  const ar=lang==='ar';
  const key=storageKey(user?.uid||'guest');
  const [completed,setCompleted]=useState<SecretRoomId[]>(()=>readProgress(key));
  const [phase,setPhase]=useState<SecretPhase>('intro');
  const [room,setRoom]=useState<SecretRoomId|null>(null);
  const [nearby,setNearby]=useState<SecretRoomId|null>(null);
  const [health,setHealth]=useState(100);
  const [selectedWeapon,setSelectedWeapon]=useState(0);
  const [ammo,setAmmo]=useState({loaded:24,reserve:96});
  const [lootReady,setLootReady]=useState(false);
  const [threats,setThreats]=useState(0);
  const [opened,setOpened]=useState([false,false,false,false]);
  const [activeSafe,setActiveSafe]=useState(0);
  const [safeStage,setSafeStage]=useState<'approach'|'challenge'|'unlock'>('approach');
  const [selectedPin,setSelectedPin]=useState<string|null>(null);
  const [frequency,setFrequency]=useState(0);
  const [archiveChoice,setArchiveChoice]=useState<number|null>(null);
  const [defenseSequence,setDefenseSequence]=useState<number[]>([]);
  const [hitFlash,setHitFlash]=useState(false);
  const [documents,setDocuments]=useState(false);
  const [rewardToast,setRewardToast]=useState<SecretRoomId|null>(null);
  const [score,setScore]=useState(0);
  const [ready,setReady]=useState(false);
  const [operatorStatus,setOperatorStatus]=useState<'loading'|'ready'|'error'>('loading');
  const [error,setError]=useState('');
  const [attempt,setAttempt]=useState(0);
  const [input,setInput]=useState<Input>({forward:0,strafe:0,run:false});
  const [crouch,setCrouch]=useState(false);
  const [paused,setPaused]=useState(false);
  const [questionRun,setQuestionRun]=useState(0);
  const missionDeck=useMemo(()=>buildMissionDeck(MISSIONS),[questionRun]);
  const [selectedTokens,setSelectedTokens]=useState<number[]>([]);
  const [textAnswer,setTextAnswer]=useState('');
  const [hintVisible,setHintVisible]=useState(false);
  const [hintsUsed,setHintsUsed]=useState(0);
  const [mistakes,setMistakes]=useState(0);
  const [solvedCount,setSolvedCount]=useState(0);
  const host=useRef<HTMLDivElement>(null);
  const engine=useRef<ReturnType<typeof createSecretMission>|null>(null);
  const completedRef=useRef(completed);
  completedRef.current=completed;
  const phaseRef=useRef<SecretPhase>('intro');
  const lastThreats=useRef(0);
  const safeRef=useRef(0);
  const heldDirections=useRef(new Set<'forward'|'backward'|'left'|'right'>());
  const directionPointers=useRef(new Map<number,'forward'|'backward'|'left'|'right'>());
  const firePointers=useRef(new Set<number>());
  // Prevent the automatic reward timer and a manual tap from advancing the
  // same objective twice before React commits the next stage.
  const advancingRef=useRef(false);
  const flashTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const rewardTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const currentRoom=room?MISSIONS[room]:null;
  const next=sequence.find(x=>!completed.includes(x))??'vault';
  const allowed=[...completed,next];
  const allSafesOpen=opened.every(Boolean);
  const activeChallenge=room?missionDeck[room][activeSafe]:null;
  const clearAnswer=()=>{
    setSelectedTokens([]);setTextAnswer('');setHintVisible(false);
  };
  const toggleToken=(index:number)=>setSelectedTokens(prev=>
    prev.includes(index)?prev.filter(item=>item!==index):[...prev,index]);
  const replayMission=()=>{
    try{localStorage.removeItem(key);}catch{}
    setCompleted([]);setDocuments(false);setScore(0);
    setHintsUsed(0);setMistakes(0);setSolvedCount(0);
    setOpened([false,false,false,false]);setActiveSafe(0);
    setSelectedPin(null);setRoom(null);setPhase('intro');setReady(false);
    clearAnswer();setQuestionRun(v=>v+1);setAttempt(v=>v+1);
  };

  useEffect(()=>{setCompleted(readProgress(key));},[key]);

  useEffect(()=>{
    const container=host.current;if(!container)return;
    let stopped=false;
    setOperatorStatus('loading');
    let scene:ReturnType<typeof createSecretMission>|null=null;
    import('./SecretMissionEngine').then(module=>{
      if(stopped)return;
      try{
        scene=module.createSecretMission(container,{
          onPhase(state,id){
            if(stopped)return;
            phaseRef.current=state;
            setPhase(state);
            if(state==='room-enter'){
              heldDirections.current.clear();directionPointers.current.clear();
              lastThreats.current=0;
              setInput({forward:0,strafe:0,run:false});
              setCrouch(false);
            }
            if(state==='combat'){
              setRoom(id||null);setOpened([false,false,false,false]);setActiveSafe(0);safeRef.current=0;
              setSelectedPin(null);setSafeStage('approach');setLootReady(false);setHealth(100);
              advancingRef.current=false;
              // Retried rooms must not inflate the number of recovered codes.
              setSolvedCount(completedRef.current.length*4);
              setFrequency(0);setArchiveChoice(null);setDefenseSequence([]);
              setSelectedTokens([]);setTextAnswer('');setHintVisible(false);
            }
            if(state==='hall'){
              heldDirections.current.clear();directionPointers.current.clear();
              setRoom(null);
              setInput({forward:0,strafe:0,run:false});
              setCrouch(false);
            }
            if(state==='victory'){
              setDocuments(true);
              setScore(v=>v+900);
              // 4/4 is awarded only after the final physical vault and document pickup.
              setCompleted(prev=>{
                if(prev.includes('vault'))return prev;
                const updated: SecretRoomId[] = [...prev, 'vault'];
                try{localStorage.setItem(key,JSON.stringify(updated));}catch{}
                return updated;
              });
            }
          },
          onHealth(value){if(!stopped)setHealth(value);},
          onOperatorStatus(status){if(!stopped)setOperatorStatus(status);},
          onWeaponChange(tier){if(!stopped)setSelectedWeapon(tier);},
          onSafeReady(){if(!stopped)setSafeStage('challenge');},
          onInstrumentTap(id){
            if(stopped)return;
            if(id==='comms')setFrequency(v=>(v+1)%8);
            else if(id==='archive')setArchiveChoice(v=>v===null?0:(v+1)%3);
            else if(id==='vault')setDefenseSequence(v=>[...v,(v.length?v[v.length-1]+1:0)%3].slice(-2));
          },
          onAmmoChange(loaded,reserve){if(!stopped)setAmmo({loaded,reserve});},
          onLoot(){if(!stopped)setLootReady(true);},
          onThreats(n){
            if(stopped)return;
            if(n<lastThreats.current)setScore(x=>x+(lastThreats.current-n)*150);
            lastThreats.current=n;setThreats(n);
          },
          onNearby(id){if(!stopped)setNearby(id);},
          onShot(hit){
            if(stopped)return;
            if(hit){setHitFlash(true);if(flashTimer.current)clearTimeout(flashTimer.current);flashTimer.current=setTimeout(()=>setHitFlash(false),110);}
          },
          onError(message){if(!stopped){setError(message);setReady(false);}}
        },lang);
        engine.current=scene;
        scene.setAllowed([...completedRef.current,sequence.find(x=>!completedRef.current.includes(x))??'vault']);
        scene.setWeaponTier(completedRef.current.length);
        setReady(true);setError('');
      }catch(e){
        if(!stopped)setError(ar?'تعذّر تشغيل المشهد ثلاثي الأبعاد.':'Unable to initialize 3D scene.');
      }
    }).catch(()=>{if(!stopped)setError(ar?'فشل تحميل اللعبة.':'Game failed to load.');});
    return ()=>{
      stopped=true;scene?.dispose();
      if(engine.current===scene)engine.current=null;
    };
  },[attempt]);

  useEffect(()=>{
    const current=sequence.find(x=>!completed.includes(x))??'vault';
    engine.current?.setAllowed([...completed,current]);
    engine.current?.setWeaponTier(completed.length);
  },[completed,ready]);
  useEffect(()=>engine.current?.setLanguage(lang),[lang,ready]);
  useEffect(()=>engine.current?.setMovement(input.forward,input.strafe,input.run),[input,ready]);
  useEffect(()=>engine.current?.setCrouch(crouch),[crouch,ready]);
  useEffect(()=>{
    engine.current?.setPaused(paused);
    if(paused){
      heldDirections.current.clear();directionPointers.current.clear();firePointers.current.clear();
      engine.current?.setTriggerHeld(false);
      setInput(prev=>({...prev,forward:0,strafe:0,run:false}));
    }
  },[paused,ready]);
  useEffect(()=>{
    const release=()=>{
      heldDirections.current.clear();firePointers.current.clear();
      engine.current?.setTriggerHeld(false);
      setInput(prev=>({...prev,forward:0,strafe:0,run:false}));
    };
    window.addEventListener('blur',release);
    const visibility=()=>{if(document.hidden)release();};
    document.addEventListener('visibilitychange',visibility);
    return ()=>{window.removeEventListener('blur',release);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  useEffect(()=>()=>{if(flashTimer.current)clearTimeout(flashTimer.current);if(rewardTimer.current)clearTimeout(rewardTimer.current);},[]);
  const announceReward=(id:SecretRoomId)=>{
    setRewardToast(id);
    if(rewardTimer.current)clearTimeout(rewardTimer.current);
    rewardTimer.current=setTimeout(()=>setRewardToast(null),4100);
  };

  useEffect(()=>{
    if(phase==='safes'&&room&&safeStage==='approach')engine.current?.approachSafe(activeSafe);
  },[phase,room,activeSafe,safeStage]);
  useEffect(()=>{
    if(phase!=='safes'||safeStage!=='challenge'||!room)return;
    const value=room==='comms'?frequency:room==='archive'?(archiveChoice??-1):room==='vault'?(defenseSequence.at(-1)??-1):0;
    const correct=room==='comms'?frequency===(activeSafe*2+3)%8:
      room==='archive'?archiveChoice===activeSafe%3:
      room==='vault'?defenseSequence.join(',')===[activeSafe%3,(activeSafe+1)%3].join(','):true;
    engine.current?.setInstrumentValue(activeSafe,value,correct);
  },[phase,safeStage,room,activeSafe,frequency,archiveChoice,defenseSequence]);
  const answer=(idx:number=0)=>{
    if(paused||!room||phase!=='safes'||safeStage!=='challenge'||opened[activeSafe]||selectedPin!==null)return;
    const q=missionDeck[room][activeSafe];
    const correct=q.mode==='order'
      ?selectedTokens.length===q.tokenOrder?.length&&selectedTokens.every((token,i)=>q.tokenOrder?.[token]===i)
      :q.mode==='write'
        ?Boolean(q.accepted?.some(value=>normalizeArabic(value)===normalizeArabic(textAnswer)))
        :idx===q.answer;
    if(!correct){
      setMistakes(v=>v+1);
      setSelectedPin('wrong');
      if(flashTimer.current)clearTimeout(flashTimer.current);
      flashTimer.current=setTimeout(()=>setSelectedPin(null),1100);
      return;
    }
    const deviceReady=room==='depot'||
      (room==='comms'&&frequency===(activeSafe*2+3)%8)||
      (room==='archive'&&archiveChoice===activeSafe%3)||
      (room==='vault'&&defenseSequence.join(',')===[activeSafe%3,(activeSafe+1)%3].join(','));
    if(!deviceReady){
      setSelectedPin('device');
      if(flashTimer.current)clearTimeout(flashTimer.current);
      flashTimer.current=setTimeout(()=>setSelectedPin(null),1100);
      return;
    }
    if(!engine.current?.openSafe(activeSafe))return;
    setSelectedPin(q.pin);
    setLootReady(false);
    setSafeStage('unlock');
    setOpened(prev=>prev.map((done,i)=>i===activeSafe?true:done));
    setSolvedCount(n=>n+1);
    setScore(n=>n+(hintVisible?85:125));
  };
  const advanceSafe=()=>{
    if(advancingRef.current||paused||!room||phase!=='safes'||safeStage!=='unlock'||!lootReady||!opened[activeSafe]||selectedPin==='wrong'||selectedPin==='device')return;
    if(activeSafe<3){
      advancingRef.current=true;
      const index=activeSafe+1;safeRef.current=index;setActiveSafe(index);setSelectedPin(null);setLootReady(false);setSafeStage('approach');setFrequency(0);setArchiveChoice(null);setDefenseSequence([]);clearAnswer();return;
    }
    // Claim the visible 3D item from the final safe before recording success.
    if(!opened.every(Boolean)||!engine.current?.collectReward())return;
    advancingRef.current=true;
    if(room==='vault'){
      const success=engine.current?.finish();
      if(success){setDocuments(true);announceReward('vault');}
      return;
    }
    announceReward(room);
    setCompleted(prev=>{
      if(prev.includes(room))return prev;
      const value=[...prev,room];
      try{localStorage.setItem(key,JSON.stringify(value));}catch{}
      return value;
    });
    setScore(v=>v+400);
    engine.current?.exitRoom();
  };
  useEffect(()=>{
    if(phase==='safes'&&safeStage==='approach')advancingRef.current=false;
  },[phase,safeStage,activeSafe]);
  useEffect(()=>{
    if(phase!=='safes'||safeStage!=='unlock'||!opened[activeSafe]||!lootReady||paused)return;
    const timer=setTimeout(()=>advanceSafe(),2000);
    return ()=>clearTimeout(timer);
  },[phase,safeStage,activeSafe,opened,paused,lootReady]);
  const move=(kind:'forward'|'backward'|'left'|'right',down:boolean,pointerId:number)=>{
    if(down)directionPointers.current.set(pointerId,kind);
    else directionPointers.current.delete(pointerId);
    const held=heldDirections.current;
    held.clear();
    directionPointers.current.forEach(direction=>held.add(direction));
    setInput(prev=>({...prev,
      forward:Number(held.has('forward'))-Number(held.has('backward')),
      strafe:Number(held.has('right'))-Number(held.has('left'))
    }));
  };
  const hold=(kind:'forward'|'backward'|'left'|'right',icon:React.ReactNode)=>
    <button className="qul-secret-move" aria-label={kind}
      onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);move(kind,true,e.pointerId);}}
      onPointerUp={e=>move(kind,false,e.pointerId)}
      onPointerCancel={e=>move(kind,false,e.pointerId)}
      onLostPointerCapture={e=>move(kind,false,e.pointerId)}>{icon}</button>;
  const location=room?SECRET_ROOMS.find(x=>x.id===room):null;
  const taskLabels:Record<SecretRoomId,{ar:string;en:string;unitAr:string;unitEn:string}>={
    depot:{ar:'استعادة الإمدادات',en:'RECOVER SUPPLIES',unitAr:'صندوق',unitEn:'CRATE'},
    comms:{ar:'إعادة تشغيل الاتصالات',en:'RESTORE COMMUNICATIONS',unitAr:'محطة',unitEn:'TERMINAL'},
    archive:{ar:'استرجاع الملفات السرية',en:'RECOVER CLASSIFIED FILES',unitAr:'ملف',unitEn:'FILE'},
    vault:{ar:'تعطيل نظام الحماية',en:'DISABLE DEFENSE GRID',unitAr:'دائرة',unitEn:'CIRCUIT'}
  };
  const task=room?taskLabels[room]:null;
  const accessible=SECRET_ROOMS.filter(r=>allowed.includes(r.id));
  const gear=completed.length;
  return (
    <section className={"qul-secret"+(phase==='safes'?" qul-secret-solving":"")+(phase==='intro'?" qul-secret-cinematic":"")} dir={ar?'rtl':'ltr'}>
      <div ref={host} className="qul-secret-scene" aria-label={ar?'منشأة العمليات ثلاثية الأبعاد':'3D tactical facility'} />
      <div className="qul-secret-shade" aria-hidden="true" />
      {ready&&phase==='intro'&&<div className="qul-secret-cinema-atmosphere" aria-hidden="true"><span className="qul-secret-cinema-x">X</span><span className="qul-secret-cinema-grid"/></div>}
      <div className="qul-secret-top">
        <div className="qul-secret-logo"><Crosshair size={22}/><div><strong>OPERATION <em>X</em></strong><small>{ar?'عملية استرداد الملفات السرية':'CLASSIFIED DOSSIER RECOVERY'}</small></div></div>
        <div className="qul-secret-gear"><Zap size={15}/> MK-{gear+1}</div>
        <button className="qul-secret-exit" onClick={onBack}><X size={17}/>{ar?'خروج':'EXIT'}</button>
      </div>
      {ready&&['hall','combat','safes'].includes(phase)&&<div className="qul-secret-tactical-hud">
        <div className="qul-secret-hud-vitals"><small>OPERATOR / STATUS</small><div className="qul-secret-hud-health"><ShieldCheck size={17}/><strong>{health}%</strong><div className="qul-secret-hud-meter"><i style={{width:health+'%'}}/></div></div><div className="qul-secret-hud-metrics"><span><Target size={13}/>{threats}</span><span><FileLock2 size={13}/>{completed.length}/4</span><span><Zap size={13}/>{score} XP</span></div></div>
        <div className="qul-secret-hud-arsenal"><small>{ar?'منظومة التسليح':'TACTICAL LOADOUT'} / OPERATION X</small><div className="qul-secret-hud-weapon"><div className="qul-secret-hud-silhouette" aria-hidden="true"><span/></div><div><small>{ar?'السلاح النشط':'ACTIVE WEAPON'}</small><strong>{[ar?'قاذف الطاقة الأساسي':'STANDARD BLASTER',REWARDS.depot[lang],REWARDS.comms[lang],REWARDS.archive[lang],ar?'قاذف الطاقة المتقدم':'ADVANCED BLASTER'][selectedWeapon]}</strong><b>MK-{selectedWeapon+1} · {ammo.loaded}/{ammo.reserve}</b></div></div><div className="qul-secret-hud-slots" role="group" aria-label={ar?'اختيار السلاح':'Select weapon'}>{[0,1,2,3,4].map(tier=><button key={tier} disabled={tier>gear} className={selectedWeapon===tier?'selected':''} aria-pressed={selectedWeapon===tier} aria-label={(ar?'السلاح ':'Weapon ')+(tier+1)} onClick={()=>engine.current?.setWeaponTier(tier)}><span>{tier+1}</span>{tier>gear?<LockKeyhole size={13}/>:<Zap size={16}/>}</button>)}</div><div className="qul-secret-hud-hint">{ar?'المسطرة إطلاق · J قفز · R تلقيم':'SPACE FIRE · J JUMP · R RELOAD'}</div></div>
      </div>}
      {!ready&&<div className="qul-secret-loader" role="status"><Crosshair size={40}/>
        <h2>{error||(ar?'جارٍ تجهيز المهمة...':'Preparing your mission...')}</h2>
        {error&&<button onClick={()=>{setError('');setAttempt(x=>x+1);}}><RotateCcw size={17}/>{ar?'إعادة المحاولة':'Retry'}</button>}
        <button onClick={onBack}>{ar?'العودة للألعاب':'Back to games'}</button>
      </div>}

      {ready&&phase==='intro'&&<>
        <div className="qul-secret-operator-caption" aria-hidden="true">
          <b>QUL SPECIAL OPERATIONS</b><span>{ar?'العميل جاهز للتسلل':'OPERATOR DEPLOYMENT'}</span>
          <i/>
        </div>
        <div className="qul-secret-brief">
          <div className="qul-secret-case"><span className="qul-secret-alert-dot"/> {ar?'سري للغاية · المهمة 001':'TOP SECRET · MISSION 001'}</div>
          <div className="qul-secret-intro-title"><span>{ar?'العملية':'OPERATION'}</span><b>X</b></div>
          <h1>{ar?'تسلّل. فكّ الشفرة. استردّ الملفات.':'INFILTRATE. DECODE. RECOVER.'}</h1>
          <p>{ar?'منشأة معادية، حراس يراقبون الممرات، وملفات سرية داخل الخزائن. كل شفرة عربية تقرّبك من الهدف.':'A guarded facility. Missing dossiers. Arabic codes that unlock the route to extraction.'}</p>
          <div className="qul-secret-brief-facts">
            <span>{ar?'٤ قطاعات':'4 SECTORS'}</span><span>{ar?'١٦ ملفًا':'16 DOSSIERS'}</span><span>A1 · B2</span>
          </div>
          <button className="qul-secret-primary qul-secret-start" disabled={operatorStatus!=='ready'} onClick={()=>engine.current?.start()}>
            <DoorOpen size={20}/>{operatorStatus==='ready'?(ar?'ابدأ العملية':'START OPERATION'):(ar?'جارٍ تجهيز الجندي الحقيقي...':'LOADING REAL OPERATOR...')}
          </button>
          <small className="qul-secret-intro-footnote">{ar?'WASD للتحرك · المسطرة لإطلاق النار · J للقفز':'WASD MOVE · SPACE FIRE · J JUMP'}</small>
        </div>
      </>}

      {ready&&phase==='entering'&&<div className="qul-secret-status">{ar?'فتح بوابة المنشأة...':'OPENING FACILITY GATE...'}</div>}
      {ready&&phase==='room-enter'&&<div className="qul-secret-status">{ar?'دخول الغرفة بترقّب...':'ENTERING ROOM...'}</div>}
      {ready&&phase==='room-exit'&&<div className="qul-secret-status">{ar?'العودة إلى الممر...':'RETURNING TO CORRIDOR...'}</div>}

      {ready&&phase==='hall'&&<div className="qul-secret-objective">
        <span className="qul-secret-light"/>{ar?'الهدف التالي: '+MISSIONS[next].subtitle.ar:'NEXT OBJECTIVE: '+MISSIONS[next].subtitle.en}
        <strong>{ar?SECRET_ROOMS.find(x=>x.id===next)?.ar:SECRET_ROOMS.find(x=>x.id===next)?.en}</strong>
      </div>}
      {ready&&phase==='hall'&&nearby&&allowed.includes(nearby)&&
        <button className="qul-secret-enter" onClick={()=>engine.current?.enterRoom(nearby)}>
          <DoorOpen size={18}/>{ar?'اقتحام تكتيكي':'TACTICAL BREACH'}
        </button>}
      {ready&&phase==='hall'&&
        <div className="qul-secret-minimap">
          <div>SECURE FACILITY <span>{completed.length}/4</span></div>
          {SECRET_ROOMS.map((r,i)=><button key={r.id} disabled={!allowed.includes(r.id)}
            onClick={()=>engine.current?.travelTo(r.id)}
            className={completed.includes(r.id)?'cleared':r.id===next?'next':'locked'}>
            <span>0{i+1}</span><strong>{ar?r.ar:r.en}</strong>
            {completed.includes(r.id)?<Check size={13}/>:r.id===next?<Target size={13}/>:<LockKeyhole size={13}/>}
          </button>)}
        </div>}

      {ready&&rewardToast&&phase!=='victory'&&<div className="qul-secret-reward-toast" role="status">
         <Zap size={25}/>
         <div><small>{ar?'تطوير جديد للمعدات':'EQUIPMENT UNLOCKED'}</small>
           <strong>{REWARDS[rewardToast][lang]}</strong></div>
         <span>MK-{Math.min(5,completed.length+1)}</span>
       </div>}
       {ready&&phase==='combat'&&room&&<div className="qul-secret-combat">
        <strong><ShieldAlert size={20}/>{ar?'تحذير: حراس مسلحون':'HOSTILES DETECTED'}</strong>
        <p>{MISSIONS[room].briefing[lang]}</p>
        <span>{ar?'الحراس المتبقون':'HOSTILES REMAINING'}: {threats}</span>
        <small>{ar?'تقدّم بحذر، أطلق النار بالمسطرة، واستخدم الانحناء والغطاء لتفادي إطلاق الحارس.':'Move carefully, use Space to fire, and take cover before the guard shoots.'}</small>
      </div>}

      {ready&&phase==='safes'&&room&&safeStage!=='approach'&&
        <div className="qul-secret-vault-panel">
          <div className="qul-secret-vault-header">
            <div><span className="qul-secret-sector-clear"><ShieldCheck size={13}/>{ar?'تم تأمين الغرفة · انتهت مواجهة الحراس':'SECTOR SECURED · GUARDS CLEARED'}</span><span>{task?.en} / {MISSIONS[room].subtitle.en}</span>
              <h2>{ar?task?.ar:task?.en}</h2>
              <p>{ar?MISSIONS[room].skills.ar:MISSIONS[room].skills.en}</p>
            </div>
            <div className="qul-secret-vault-progress">{opened.filter(Boolean).length}/4</div>
          </div>
          <div className="qul-secret-vault-tabs">
            {[0,1,2,3].map(i=><div key={i} className={opened[i]?'open':i===activeSafe?'active':'locked'}>
              {opened[i]?<Check size={14}/>:<LockKeyhole size={13}/>}
              {ar?task?.unitAr:task?.unitEn} {i+1}
            </div>)}
          </div>
          {(selectedPin==='wrong'||selectedPin==='device')&&<div className="qul-secret-error" role="status">{selectedPin==='device'?(ar?'أكمل ضبط الجهاز أولًا ثم اختر الإجابة.':'Complete the device controls before answering.'):(ar?'شفرة خاطئة، أعد التفكير.':'Incorrect code. Try again.')}</div>}
          {opened[activeSafe]&&selectedPin&&selectedPin!=='wrong'&&selectedPin!=='device'?(
            <div className="qul-secret-safe-result">
              <ShieldCheck size={32}/>
              <strong>{!lootReady?(ar?'القفل يفتح الآن…':'UNLOCKING SAFE…'):(ar?'تم جمع الغنيمة':'LOOT COLLECTED')}</strong>
              <span>PIN: {selectedPin}</span>
              <p className="qul-secret-learned">{activeChallenge?.explanation[lang]}</p>
              <p>{ar?'الغنيمة:':'LOOT:'} <b>{activeSafe===0?(ar?'طلقات إضافية':'EXTRA AMMO'):activeSafe===1?(ar?'درع واقٍ':'ARMOR PLATE'):activeSafe===2?(ar?'وحدة تحسين التصويب':'AIM MODULE'):REWARDS[room][lang]}</b></p>
              {activeSafe===3&&<div className="qul-secret-equipment-reveal">
                <Zap size={22}/><span>{ar?'المكافأة التي ستجمعها:':'REWARD TO COLLECT:'}</span>
                <strong>{REWARDS[room][lang]}</strong>
              </div>}
              <button className="qul-secret-primary" disabled={!lootReady} onClick={advanceSafe}>
                {room==='vault'&&activeSafe===3?(ar?'اجمع الوثائق السرية':'COLLECT CLASSIFIED DOCUMENTS'):
                  activeSafe===3?(ar?'اجمع التجهيز الجديد واخرج':'COLLECT UPGRADE & EXIT'):
                    (ar?'الخزنة التالية':'NEXT SAFE')}
                <ChevronLeft size={17}/>
              </button>
            </div>
          ):(
            <div className="qul-secret-safe-challenge">
              <span>{ar?'رمز الخزنة '+(activeSafe+1):'SAFE '+(activeSafe+1)+' CODE'}</span>
              <div className="qul-secret-challenge-kind">
                {({select:ar?'اختر الدليل الصحيح':'CHOOSE THE CLUE',order:ar?'رتّب الرسالة':'REASSEMBLE MESSAGE',verify:ar?'صح أم خطأ؟':'VERIFY THE STATEMENT',write:ar?'اكتب الشفرة':'TYPE THE CODE'} as const)[missionDeck[room][activeSafe].mode]}
              </div>
              <p>{missionDeck[room][activeSafe].prompt[lang]}</p>
              {room==='comms'&&<div className="qul-secret-choices" aria-label={ar?'ضبط التردد':'Tune frequency'}>
                <button onClick={()=>setFrequency(v=>(v+7)%8)}>−</button>
                <strong>{ar?'التردد':'FREQUENCY'} {frequency+1} / 8</strong>
                <button onClick={()=>setFrequency(v=>(v+1)%8)}>+</button>
                <small>{ar?'اضبط على القناة':'TUNE TO CHANNEL'} {(activeSafe*2+3)%8+1}</small>
              </div>}
              {room==='archive'&&<div className="qul-secret-choices" aria-label={ar?'اختيار الملف':'Select document'}>
                {[0,1,2].map(n=><button key={n} className={archiveChoice===n?'active':''} onClick={()=>setArchiveChoice(n)}>{ar?'ملف':'FILE'} {n+1} {archiveChoice===n?'✓':''}</button>)}
                <small>{ar?'طابق رقم الملف المطلوب':'MATCH REQUIRED FILE'} {activeSafe%3+1}</small>
              </div>}
              {room==='vault'&&<div className="qul-secret-choices" aria-label={ar?'تسلسل التعطيل':'Override sequence'}>
                {[0,1,2].map(n=><button key={n} onClick={()=>setDefenseSequence(v=>[...v,n].slice(-2))}>{ar?'دائرة':'CIRCUIT'} {n+1}</button>)}
                <small>{ar?'تسلسل التعطيل':'OVERRIDE ORDER'} {activeSafe%3+1} → {(activeSafe+1)%3+1} · {defenseSequence.map(n=>n+1).join(' → ')}</small>
              </div>}
              {activeChallenge?.mode==='select'&&<div className="qul-secret-choices qul-secret-answer-grid">
                {activeChallenge.options?.map((choice,i)=>
                  <button key={i} onClick={()=>answer(i)}>
                    <b>{String.fromCharCode(65+i)}</b>{choice.ar}
                    {lang==='en'&&<small>{choice.en}</small>}
                  </button>)}
              </div>}
              {activeChallenge?.mode==='verify'&&<div className="qul-secret-choices qul-secret-answer-grid">
                <button onClick={()=>answer(0)}><b>✓</b>{ar?'صحيح':'TRUE'}</button>
                <button onClick={()=>answer(1)}><b>✕</b>{ar?'خطأ':'FALSE'}</button>
              </div>}
              {activeChallenge?.mode==='order'&&<div className="qul-secret-arrange">
                <div className="qul-secret-arranged" aria-live="polite">
                  {selectedTokens.length?selectedTokens.map(i=><button key={i} onClick={()=>toggleToken(i)}>{activeChallenge.tokens?.[i].ar}</button>):
                    <span>{ar?'اضغط على الكلمات لتكوين الجملة':'Tap the words to assemble the Arabic sentence'}</span>}
                </div>
                <div className="qul-secret-word-bank">
                  {activeChallenge.tokens?.map((token,i)=><button key={i} disabled={selectedTokens.includes(i)} onClick={()=>toggleToken(i)}>
                    <strong>{token.ar}</strong>{lang==='en'&&<small>{token.en}</small>}
                  </button>)}
                </div>
                <button className="qul-secret-primary" disabled={selectedTokens.length!==activeChallenge.tokens?.length} onClick={()=>answer()}>
                  <Check size={17}/>{ar?'تحقق من الترتيب':'CHECK ORDER'}
                </button>
              </div>}
              {activeChallenge?.mode==='write'&&<div className="qul-secret-write">
                <input dir="rtl" lang="ar" autoComplete="off" autoCorrect="off" spellCheck={false}
                  value={textAnswer} onChange={e=>setTextAnswer(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter')answer();}}
                  placeholder={ar?'اكتب الإجابة بالعربية':'Type the Arabic answer'}
                  aria-label={ar?'إجابة عربية':'Answer in Arabic'}/>
                <button className="qul-secret-primary" disabled={!textAnswer.trim()} onClick={()=>answer()}>
                  <Check size={17}/>{ar?'تحقق من الكلمة':'CHECK ANSWER'}
                </button>
              </div>}
              <div className="qul-secret-help">
                <button onClick={()=>{if(!hintVisible){setHintVisible(true);setHintsUsed(n=>n+1);}}} disabled={hintVisible}>
                  {ar?'مساعدة من غرفة العمليات':'HINT FROM HQ'} {hintVisible?'✓':'?'}
                </button>
                {hintVisible&&<p role="status">{activeChallenge?.hint[lang]}</p>}
              </div>
            </div>
          )}
        </div>}

      {ready&&phase==='dead'&&<div className="qul-secret-end defeat">
        <Skull size={42}/><small>MISSION FAILED</small>
        <h2>{ar?'أُصيبت الشخصية وفشلت المحاولة':'OPERATOR DOWN'}</h2>
        <p>{ar?'نفدت طاقتك تحت نيران الحراس. يمكنك إعادة الغرفة دون فقد إنجازات الغرف السابقة.':'Your health ran out. Retry this room without losing cleared earlier rooms.'}</p>
        <button className="qul-secret-primary" onClick={()=>engine.current?.restartRoom()}><RotateCcw size={18}/>{ar?'أعد المحاولة':'RETRY ROOM'}</button>
        <button className="qul-secret-secondary" onClick={onBack}>{ar?'الخروج':'EXIT'}</button>
      </div>}

      {ready&&phase==='victory'&&documents&&<div className="qul-secret-end victory">
        <Trophy size={43}/><small>MISSION ACCOMPLISHED</small>
        <h2>{ar?'استعدت الأوراق السرية!':'CLASSIFIED DOCUMENTS RECOVERED!'}</h2>
        <p>{ar?'نجحت في تجاوز حراس المنشأة، وفتح الخزائن الست عشرة، وتعطيل السلاح المتطور، واستعادة الوثائق.':'You cleared the guards, unlocked sixteen safes, disabled the advanced defense system and recovered the secret documents.'}</p>
        <div className="qul-secret-win-stats"><span>{solvedCount} / 16 {ar?'شفرة':'CODES'}</span><span>{score} XP</span></div>
        <p>{ar?`محاولات غير صحيحة: ${mistakes} · مساعدات مستخدمة: ${hintsUsed}`:`Incorrect tries: ${mistakes} · Hints used: ${hintsUsed}`}</p>
        <button className="qul-secret-secondary" onClick={replayMission}><RotateCcw size={16}/>{ar?'مهمة جديدة بأسئلة مختلفة':'REPLAY WITH NEW QUESTIONS'}</button>
        <button className="qul-secret-primary" onClick={onBack}><FileText size={18}/>{ar?'العودة للألعاب':'BACK TO GAMES'}</button>
      </div>}

      <div className="qul-secret-crosshair" aria-hidden="true" style={{opacity:['combat','safes'].includes(phase)?.8:0}}>
        <span className={hitFlash?'hit':''}>+</span>
      </div>
      {ready&&['hall','combat','safes'].includes(phase)&&
        <div className="qul-secret-controls">
          <div className="qul-secret-pad">
            <div>{hold('forward',<ArrowUp size={23}/>)}</div>
            <div>{hold('left',<ArrowLeft size={23}/>)}
              {hold('backward',<ArrowDown size={23}/>)}
              {hold('right',<ArrowRight size={23}/>)}</div>
          </div>
          <div className="qul-secret-move-actions">
            <button className="qul-secret-action jump" onClick={()=>engine.current?.jump()}>
              <ArrowUp size={19}/><small>{ar?'قفز':'JUMP'}</small>
            </button>
            <button className={'qul-secret-action crouch '+(crouch?'active':'')}
              onClick={()=>setCrouch(x=>!x)}><Footprints size={18}/><small>{ar?'انحناء':'CROUCH'}</small></button>
            <button className="qul-secret-action run"
              onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);setInput(p=>({...p,run:true}));}}
              onPointerUp={()=>setInput(p=>({...p,run:false}))}
              onPointerCancel={()=>setInput(p=>({...p,run:false}))}
              onLostPointerCapture={()=>setInput(p=>({...p,run:false}))}>
              <Zap size={18}/><small>{ar?'ركض':'RUN'}</small>
            </button>
            <button className="qul-secret-action fire" disabled={phase==='hall'}
              onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);firePointers.current.add(e.pointerId);engine.current?.setTriggerHeld(true);engine.current?.fire();}}
              onPointerUp={e=>{firePointers.current.delete(e.pointerId);engine.current?.setTriggerHeld(firePointers.current.size>0);}}
              onPointerCancel={e=>{firePointers.current.delete(e.pointerId);engine.current?.setTriggerHeld(firePointers.current.size>0);}}
              onLostPointerCapture={e=>{firePointers.current.delete(e.pointerId);engine.current?.setTriggerHeld(firePointers.current.size>0);}}
              aria-label={ar?'اضغط مطولًا لإطلاق النار':'Hold to fire'}><Crosshair size={26}/><small>{ar?'إطلاق مستمر':'HOLD FIRE'}</small></button>
          </div>
        </div>}
      {ready&&<div className="qul-secret-bottom-help">{ar?
        'WASD حركة · الفأرة للتصويب · المسطرة إطلاق · J قفز · C انحناء · Shift ركض · R تلقيم':
        'WASD MOVE · MOUSE AIM · SPACE FIRE · J JUMP · C CROUCH · SHIFT RUN · R RELOAD'}</div>}
      {ready&&<button className="qul-secret-pause" onClick={()=>setPaused(p=>!p)}>
        {paused?(ar?'استئناف':'RESUME'):(ar?'إيقاف مؤقت':'PAUSE')}
      </button>}
    </section>
  );
};
