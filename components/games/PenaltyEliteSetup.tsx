import React, {useState} from 'react';
import {ArrowLeft, ChevronLeft, RotateCcw, Shirt, Trophy, X} from 'lucide-react';
import {chooseOpponent,ELITE_CLUBS,EliteClub,ElitePlayer} from './PenaltyEliteData';
import {PenaltyClubCrest} from './PenaltyClubCrest';

interface Props {
  onBack?:()=>void;
  onStart:(club:EliteClub,rival:EliteClub,kickers:ElitePlayer[])=>void;
}
const positionText:Record<ElitePlayer['role'],string>={GK:'حارس',DF:'دفاع',MF:'وسط',FW:'هجوم'};
const panelStyle:React.CSSProperties={
  background:'linear-gradient(135deg,rgba(7,23,39,.97),rgba(10,34,45,.96))',
  boxShadow:'0 20px 70px rgba(0,0,0,.35)',
};
export const PenaltyEliteSetup:React.FC<Props>=({onBack,onStart})=>{
  const [step,setStep]=useState<'clubs'|'lineup'>('clubs');
  const [club,setClub]=useState<EliteClub>(ELITE_CLUBS[0]);
  const [rival,setRival]=useState<EliteClub>(ELITE_CLUBS[1]);
  const [previousRival,setPreviousRival]=useState<string|undefined>();
  const [selectedKickers,setSelectedKickers]=useState<ElitePlayer[]>([]);
  const [rosterPage,setRosterPage]=useState(0);
  const [clubPage,setClubPage]=useState(0);
  const selectClub=(choice:EliteClub)=>{
    const next=chooseOpponent(choice.id,previousRival);
    setPreviousRival(next.id);setClub(choice);setRival(next);
    setSelectedKickers([]);setRosterPage(0);setStep('lineup');
  };
  const toggle=(player:ElitePlayer)=>{
    setSelectedKickers(current=>current.some(x=>x.number===player.number)
      ?current.filter(x=>x.number!==player.number)
      :current.length>=5?current:[...current,player]);
  };
  const switchRival=()=>{
    const next=chooseOpponent(club.id,rival.id);
    setPreviousRival(next.id);setRival(next);
  };
  return <main dir="rtl" className="relative w-full h-full min-h-[580px] rounded-3xl overflow-hidden bg-[#06131e] text-white select-none">
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
      background:'radial-gradient(ellipse at 53% -12%,rgba(37,116,123,.38),transparent 55%),radial-gradient(ellipse at 97% 93%,rgba(220,179,95,.14),transparent 48%)'
    }}/>
    <div className="relative z-10 w-full max-w-6xl mx-auto px-3 md:px-8 py-3 md:py-8 flex flex-col gap-3 md:gap-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 md:w-14 md:h-14 rounded-2xl grid place-items-center border border-amber-300/40 bg-amber-300/10"><Trophy className="text-amber-300" size={26}/></div>
          <div>
            <div className="text-[10px] md:text-xs tracking-[.28em] text-amber-300 font-black" dir="ltr">QUL PENALTY ELITE</div>
            <h1 className="text-xl md:text-3xl font-black mt-0.5">تحدي الأهداف</h1>
            <p className="text-xs text-slate-400 mt-1">اختر ناديك، ثم قُد فريقك في ركلات الترجيح</p>
          </div>
        </div>
        <button type="button" onClick={step==='lineup'?()=>setStep('clubs'):onBack}
          className="flex items-center gap-1.5 border border-white/20 bg-white/5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">
          {step==='lineup'?<><ArrowLeft size={15}/> الأندية</>:<><X size={16}/> خروج</>}
        </button>
      </header>
      <div className="flex items-center gap-3 text-xs font-bold">
        <span className={step==='clubs'?'text-amber-300':'text-emerald-300'}>01 <span className="mr-2">اختيار النادي</span></span>
        <div className="h-px flex-1 max-w-14 bg-white/15"/>
        <span className={step==='lineup'?'text-amber-300':'text-slate-500'}>02 <span className="mr-2">قائمة المسددين</span></span>
        <div className="h-px flex-1 max-w-14 bg-white/15"/>
        <span className="text-slate-500">03 <span className="mr-2">الملعب</span></span>
      </div>
      {step==='clubs'?<>
        <div>
          <p className="text-amber-300 text-xs font-black tracking-wider mb-1">الاختيار الأول</p>
          <h2 className="text-2xl md:text-4xl font-black">من هو ناديك المفضل؟</h2>
          <p className="text-slate-400 text-sm mt-2">يختار الكمبيوتر منافسًا مختلفًا تلقائيًا. اختر أحد الأندية العشرة، وسيختار الكمبيوتر خصمك تلقائيًا.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 md:gap-4">
          {ELITE_CLUBS.map((team,index)=><button key={team.id} onClick={()=>selectClub(team)} type="button"
            className={'group relative min-h-[145px] sm:min-h-[180px] lg:min-h-[225px] rounded-3xl border border-white/15 hover:border-amber-300/70 overflow-hidden text-right transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-amber-300 '+(index>=clubPage*4&&index<(clubPage+1)*4?'flex':'hidden lg:flex')}
            style={{...panelStyle}}>
            <div className="absolute top-0 right-0 bottom-0 w-2" style={{background:team.primary}}/>
            <div className="absolute -bottom-14 -left-10 w-44 h-44 rounded-full blur-3xl opacity-25" style={{background:team.primary}}/>
            <div className="relative p-3 sm:p-4 lg:p-5 w-full h-full flex flex-col justify-between items-start">
              <PenaltyClubCrest club={team} className="w-[66px] h-[66px] sm:w-[78px] sm:h-[78px] lg:w-[90px] lg:h-[90px] group-hover:scale-[1.06] transition-transform duration-300" />
              <div className="w-full mt-5">
                <div className="flex gap-1 mb-3"><span className="h-1 flex-1 rounded-full" style={{background:team.primary}}/><span className="h-1 flex-1 rounded-full" style={{background:team.secondary}}/></div>
                <h3 className="text-sm sm:text-lg lg:text-xl font-black">{team.name}</h3>
                <p dir="ltr" className="text-slate-400 text-[10px] lg:text-xs text-left mt-1 truncate">{team.english}</p>
                <span className="flex items-center gap-1 text-amber-300 text-[11px] font-bold mt-2 lg:mt-4">اختيار النادي <ChevronLeft size={15}/></span>
              </div>
            </div>
          </button>)}
        </div>
        <div className="lg:hidden flex items-center justify-center gap-2" aria-label="صفحات الأندية">
          {Array.from({length:Math.ceil(ELITE_CLUBS.length/4)},(_,page)=><button
            key={page} type="button" onClick={()=>setClubPage(page)}
            aria-current={page===clubPage?'page':undefined}
            className={'w-9 h-9 rounded-xl border text-sm font-black transition-colors '+(page===clubPage?'bg-amber-300 text-slate-950 border-amber-300':'bg-white/5 border-white/20 text-slate-200')}>
            {page+1}
          </button>)}
        </div>
        <p className="text-slate-500 text-[11px] leading-relaxed">الشعارات الأصلية مستخدمة للتعريف بالفرق فقط، وهي علامات تجارية لأصحابها، ولا تمثل هذه اللعبة اعتمادًا أو رعاية رسمية من الأندية.</p>
      </>:<>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4 p-3 md:p-5 rounded-3xl border border-white/15" style={panelStyle}>
          <div className="flex flex-col items-center gap-1 min-w-0">
            <span className="text-[10px] text-amber-300 font-bold">فريقك</span>
            <PenaltyClubCrest club={club} className="w-12 h-12 md:w-16 md:h-16" />
            <b className="text-xs md:text-lg text-center">{club.name}</b>
          </div>
          <div className="text-center flex flex-col items-center gap-2">
            <strong className="text-2xl md:text-4xl font-black tracking-wider text-white/75">VS</strong>
            <button type="button" onClick={switchRival} className="flex gap-1 items-center rounded-lg bg-white/10 px-2 py-1.5 text-[10px] md:text-xs text-amber-200 border border-white/15 hover:bg-white/15"><RotateCcw size={12}/> خصم آخر</button>
          </div>
          <div className="flex flex-col items-center gap-1 min-w-0">
            <span className="text-[10px] text-slate-300 font-bold">الكمبيوتر</span>
            <PenaltyClubCrest club={rival} className="w-12 h-12 md:w-16 md:h-16" />
            <b className="text-xs md:text-lg text-center">{rival.name}</b>
          </div>
        </div>
        <div className="flex justify-between items-end flex-wrap gap-2">
          <div>
            <p className="text-amber-300 font-black text-xs">اختر خمسة لاعبين، بالترتيب</p>
            <h2 className="text-xl md:text-3xl font-black mt-1">قائمة مسددي ركلات الترجيح</h2>
          </div>
          <span className="rounded-xl border border-amber-300/35 bg-amber-300/10 text-amber-200 px-3 py-2 font-black tabular-nums">{selectedKickers.length} / 5</span>
        </div>
        <div className="flex lg:hidden items-center justify-between text-xs font-bold text-amber-200">
          <span>لاعبو الفريق، المجموعة {rosterPage+1} من 2</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={()=>setRosterPage(0)} className={'rounded-lg border px-3 py-1.5 '+(rosterPage===0?'bg-amber-300 text-slate-900 border-amber-300':'bg-white/5 border-white/20 text-white')}>1 إلى 6</button>
            <button type="button" onClick={()=>setRosterPage(1)} className={'rounded-lg border px-3 py-1.5 '+(rosterPage===1?'bg-amber-300 text-slate-900 border-amber-300':'bg-white/5 border-white/20 text-white')}>7 إلى 11</button>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
          {club.players.map((player,index)=>{
            const order=selectedKickers.findIndex(x=>x.number===player.number);
            const chosen=order>=0;
            return <button type="button" key={player.number} onClick={()=>toggle(player)}
              disabled={!chosen&&selectedKickers.length>=5}
              aria-pressed={chosen}
              className={'relative min-w-0 overflow-hidden rounded-2xl text-center p-2 md:p-3 border transition-colors disabled:opacity-45 '+(index>=rosterPage*6 && index<(rosterPage+1)*6?'':'hidden lg:block')}
              style={{...panelStyle,borderColor:chosen?'#e4b75b':'rgba(255,255,255,.15)'}}>
              {chosen&&<span className="absolute top-2 right-2 flex items-center justify-center h-6 w-6 text-[11px] font-black rounded-full bg-amber-300 text-slate-950">{order+1}</span>}
              <div className="h-12 md:h-20 flex flex-col items-center justify-center">
                <Shirt size={29} style={{color:club.primary,filter:'drop-shadow(0 0 10px #ffffff24)'}} strokeWidth={1.8}/>
                <span className="font-black text-white text-lg mt-[-4px]">{player.number}</span>
              </div>
              <div className="text-[11px] md:text-sm font-black truncate mt-1" dir="ltr">{player.name}</div>
              <div className="text-[10px] text-slate-400 mt-1">{positionText[player.role]}</div>
              <div className={chosen?'text-amber-300 text-[10px] font-bold mt-2':'text-slate-500 text-[10px] mt-2'}>{chosen?'تم اختياره':'اضغط للاختيار'}</div>
            </button>;
          })}
        </div>
        <div className="sticky bottom-1 flex gap-3 items-center p-3 md:p-4 rounded-2xl border border-amber-300/20 bg-[#091e2a]/95 backdrop-blur-xl">
          <div className="flex-1 min-w-0">
            <p className="font-black text-xs md:text-sm text-amber-200">ترتيب الركلات</p>
            <div className="flex gap-1.5 mt-1 overflow-hidden">
              {Array.from({length:5},(_,i)=><span key={i} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] md:text-xs truncate">
                {selectedKickers[i]?String(i+1)+' '+selectedKickers[i].name:'ركلة '+String(i+1)}
              </span>)}
            </div>
          </div>
          <button type="button" disabled={selectedKickers.length!==5} onClick={()=>onStart(club,rival,selectedKickers)}
            className="shrink-0 rounded-xl px-4 md:px-7 py-3 md:py-4 font-black text-xs md:text-base text-[#142332] bg-amber-300 hover:bg-amber-200 disabled:opacity-35 disabled:cursor-not-allowed flex items-center gap-2">
            <span>ابدأ المباراة</span><ChevronLeft size={18}/>
          </button>
        </div>
      </>}
    </div>
  </main>;
};
