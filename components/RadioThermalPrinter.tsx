import React, {useEffect, useMemo, useRef, useState} from 'react';
import {CheckCircle2, FileText, Minus, Phone, Printer} from 'lucide-react';
import {useAuth} from './AuthProvider';
import {db} from '../firebase';
import {doc, serverTimestamp, setDoc} from 'firebase/firestore';
import './RadioThermalPrinter.css';

export type RadioLearningStage = 'first'|'questions'|'second'|'final'|'receipt';
type QuizItem = {question: string; options: string[]; correctAnswer: string; explanation?: string};
export type RadioExercise = {
  transcript?: string; translation?: string; quiz?: QuizItem[];
  wordMap?: {word: string; meaningEn: string; meaningAr?: string}[];
} | null;

type Props = {
  lang: 'ar'|'en'; stationTitle: string; stationId: number;
  content: RadioExercise; loading: boolean; audioReady: boolean;
  audioPlaying: boolean; playEndCount: number;
  onReplay: () => void; onNextStation: () => void;
  onStageChange: (stage: RadioLearningStage) => void;
  onStudioCall: () => void;
};
type Vocabulary = {word:string; meaning:string};

const normalize=(word:string)=>word.replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g,'')
  .replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')
  .replace(/[^\u0621-\u064A]/g,'').trim();
const hardWords=(content:RadioExercise):Vocabulary[]=>{
  const found=new Set<string>();
  return (content?.wordMap||[]).filter(item=>{
    const k=normalize(item.word||'');
    if(!k||found.has(k)||!item.meaningEn)return false;
    found.add(k);return true;
  }).slice(0,4).map(item=>({word:item.word,meaning:item.meaningEn}));
};
const printSound=()=>{
  if(!window.AudioContext)return;
  try{
    const ctx=new AudioContext();
    if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
    for(let i=0;i<16;i++){
      const at=ctx.currentTime+i*.16,osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.type='sawtooth';osc.frequency.setValueAtTime(i%2?370:320,at);
      gain.gain.setValueAtTime(.009,at);gain.gain.exponentialRampToValueAtTime(.001,at+.045);
      osc.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(at+.05);
    }
    setTimeout(()=>{void ctx.close().catch(()=>{});},3000);
  }catch{/* Audio feedback is optional. */}
};

export const RadioThermalPrinter:React.FC<Props>=({
  lang,stationTitle,stationId,content,loading,audioReady,audioPlaying,
  playEndCount,onReplay,onNextStation,onStageChange,onStudioCall
})=>{
  const ar=lang==='ar', {user}=useAuth();
  const [stage,setStage]=useState<RadioLearningStage>('first');
  const [questionIndex,setQuestionIndex]=useState(0);
  const [answers,setAnswers]=useState<Record<number,number>>({});
  const [firstAttempt,setFirstAttempt]=useState<Record<number,number>>({});
  const [score,setScore]=useState(0);
  const [view,setView]=useState<'receipt'|'words'>('receipt');
  const [collapsed,setCollapsed]=useState(false);
  const [saved,setSaved]=useState<string[]>([]);
  const [saving,setSaving]=useState<string|null>(null);
  const [saveError,setSaveError]=useState('');
  const [printing,setPrinting]=useState(false);
  const paperRef=useRef<HTMLDivElement>(null);
  const printedKey=useRef('');
  const lastEnd=useRef(playEndCount);
  const questions=useMemo(()=>(content?.quiz||[])
    .filter(q=>Boolean(q&&q.question&&Array.isArray(q.options)&&q.options.length>=2&&
      q.options.some(opt=>normalize(opt)===normalize(q.correctAnswer))))
    .slice(0,5),[content]);
  const vocab=useMemo(()=>hardWords(content),[content]);
  const count=questions.length;
  const firstScore=questions.filter((q,i)=>normalize(q.options[firstAttempt[i]]||'')===normalize(q.correctAnswer)).length;
  const answered=questions.every((_,i)=>answers[i]!==undefined);
  const question=questions[questionIndex];

  useEffect(()=>{onStageChange(stage);},[stage,onStageChange]);
  useEffect(()=>{
    if(playEndCount<=lastEnd.current){lastEnd.current=playEndCount;return;}
    lastEnd.current=playEndCount;
    if(stage==='first'&&count){setQuestionIndex(0);setStage('questions');}
    else if(stage==='second'){setQuestionIndex(0);setStage('final');}
  },[playEndCount,stage,count]);
  useEffect(()=>{
    if(stage!=='receipt'||view!=='receipt'||!paperRef.current)return;
    const key=stationId+':'+firstScore+':'+score;
    if(printedKey.current===key)return;
    printedKey.current=key;
    const paper=paperRef.current, height=paper.offsetHeight||160;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const frames:Keyframe[]=[{transform:'translateY(-'+height+'px)',offset:0}];
    const steps=16;
    for(let i=1;i<=steps;i++){
      const start=(i-1)/steps,end=i/steps,y=-height*(1-i/steps);
      frames.push({transform:'translateY('+y+'px)',offset:start+(end-start)*.72});
      if(i<steps)frames.push({transform:'translateY('+y+'px)',offset:end});
    }
    const anim=paper.animate(frames,{duration:2600,fill:'forwards',easing:'linear'});
    setPrinting(true);printSound();
    anim.onfinish=()=>{paper.style.transform='translateY(0)';anim.cancel();setPrinting(false);};
    return ()=>anim.cancel();
  },[stage,view,stationId,firstScore,score]);

  const secondListen=()=>{
    if(!answered||!count)return;
    setFirstAttempt({...answers});setQuestionIndex(0);setStage('second');onReplay();
  };
  const submit=()=>{
    if(!answered)return;
    setScore(questions.filter((q,i)=>normalize(q.options[answers[i]]||'')===normalize(q.correctAnswer)).length);
    printedKey.current='';setView('receipt');setStage('receipt');
  };
  const restart=()=>{
    setQuestionIndex(0);setAnswers({});setFirstAttempt({});setView('receipt');setScore(0);
    printedKey.current='';setSaveError('');setSaved([]);setStage('first');onReplay();
  };
  const saveWord=async(word:string,meaning:string)=>{
    if(!user){setSaveError(ar?'يرجى تسجيل الدخول لحفظ الكلمات.':'Sign in to save vocabulary.');return;}
    setSaving(word);setSaveError('');
    try{
      const id='listening_'+Array.from(word).map(ch=>ch.codePointAt(0)!.toString(16)).join('_');
      await setDoc(doc(db,'users',user.uid,'vocabulary',id),{
        id,userId:user.uid,original_word:word,word,translation:meaning,meaning_en:meaning,meaning_ar:word,
        is_english_to_arabic:false,english_definition:meaning,arabic_definition:word,
        analysis:{type:'noun',details_ar:{category:'',sub_category:'',rule:'',example:''},
          details_en:{category:'',sub_category:'',rule:'',example:''}},
        review_count:0,last_reviewed:'',next_review:'',mastery_level:2,createdAt:serverTimestamp()
      },{merge:true});
      setSaved(prev=>prev.includes(word)?prev:[...prev,word]);
    }catch{setSaveError(ar?'تعذّر حفظ الكلمة، حاول مرة أخرى.':'Could not save this word.');}
    finally{setSaving(null);}
  };
  const message=(text:string,action?:React.ReactNode)=><div className="qul-radio-printer-message">
    <Printer size={18}/><span>{text}</span>{action}
  </div>;

  return <section className={'qul-radio-thermal-printer'+(collapsed?' minimized':'')}
    aria-label={ar?'طابعة استيعاب الراديو':'Radio quiz printer'}>
    <div className="qul-radio-printer-surface">
      <header className="qul-radio-printer-header">
        <span className="qul-radio-printer-status"><CheckCircle2 size={14}/>
          {loading?(ar?'تحميل المحطة':'TUNING'):stage==='receipt'?(ar?'اكتملت الجلسة':'COMPLETE'):
            audioPlaying?(ar?'جارٍ الاستماع':'LISTENING'):(ar?'جاهز للإجابة':'READY')}
        </span>
        <span className="qul-radio-printer-name">{ar ? 'راديو قُل · حصيلة الاستماع' : 'QUL RADIO · LISTENING LOG'}</span>
        {stage === 'receipt' && <button type="button" className="qul-radio-printer-fold qul-radio-studio-call"
          onClick={onStudioCall} title={ar ? 'تدريب شفهي: سجّل إجابتك واستمع إليها' : 'Speaking practice: record and replay'}
          aria-label={ar ? 'تدريب شفهي: سجّل إجابتك واستمع إليها' : 'Speaking practice: record and replay'}>
          <Phone size={13}/>
        </button>}
        <button type="button" className="qul-radio-printer-fold" onClick={()=>setCollapsed(v=>!v)}
          aria-label={collapsed?(ar?'فتح الطابعة':'Open printer'):(ar?'تصغير الطابعة':'Minimize printer')}>
          {collapsed?<FileText size={15}/>:<Minus size={15}/>}
        </button>
      </header>
      {!collapsed&&<>
        <div className="qul-radio-printer-paper-slot"><div className="qul-radio-printer-paper" dir={ar?'rtl':'ltr'}>
          {stage==='receipt'?(view==='receipt'?(
            <div ref={paperRef} className="qul-radio-printed-receipt">
              <span className="qul-radio-paper-overline" dir="ltr">QUL · LISTENING STATION</span>
              <strong className="qul-radio-ticket-heading">{ar?'تذكرة الإنجاز':'ACHIEVEMENT TICKET'}</strong>
              <span className="qul-radio-ticket-station">{stationTitle}</span>
              <div className="qul-radio-ticket-line"/>
              <div className="qul-radio-ticket-scores">
                <div><small>{ar?'الفهم الأول':'FIRST LISTEN'}</small><strong>{firstScore}/{count}</strong></div>
                <div><small>{ar?'بعد المراجعة':'AFTER REVIEW'}</small><strong>{score}/{count}</strong></div>
              </div>
              <span className="qul-radio-ticket-improvement">{score>firstScore?
                (ar?'↑ تحسّن بمقدار '+(score-firstScore)+' '+(score-firstScore===1?'سؤال':'أسئلة'):'↑ Improved by '+(score-firstScore)):
                score===firstScore?(ar?'حافظت على مستواك':'You maintained your score'):
                (ar?'واصل التدريب لتحسين نتيجتك':'Keep practicing to improve')}</span>
              <span className="qul-radio-ticket-footnote">{ar?'أحسنت! أكملت الاستماع والمراجعة.':'Listening and review complete.'}</span>
              <div className="qul-radio-ticket-actions" dir={ar?'rtl':'ltr'}>
                <button disabled={printing} onClick={()=>setView('words')}>{ar?'المفردات الجديدة':'VOCABULARY'}</button>
                <button disabled={printing} onClick={restart}>{ar?'أحاول مرة أخرى':'TRY AGAIN'}</button>
                <button disabled={printing} onClick={onNextStation}>{ar?'المحطة التالية':'NEXT STATION'}</button>
              </div>
            </div>
          ):(
            <div className="qul-radio-words-view">
              <strong>{ar?'أصعب ٤ مفردات من النص':'FOUR CHALLENGING WORDS'}</strong>
              {vocab.length?<div className="qul-radio-words-grid">
                {vocab.map(({word,meaning})=><div className="qul-radio-word-row" dir="rtl" key={word}>
                  <strong>{word}</strong><span dir="ltr">{meaning}</span>
                  <button type="button" disabled={saving===word||saved.includes(word)}
                    onClick={()=>{void saveWord(word,meaning);}} title={ar?'حفظ في المفردات':'Save word'}>
                    {saved.includes(word)?'✓':saving===word?'…':'+'}
                  </button>
                </div>)}
              </div>:<span>{ar?'لا توجد ترجمات موثوقة كافية لهذا النص.':'Verified word translations are unavailable.'}</span>}
              {saveError&&<span className="qul-radio-vocab-error">{saveError}</span>}
              <button className="qul-radio-return-ticket" onClick={()=>setView('receipt')}>{ar?'العودة إلى التذكرة':'BACK TO TICKET'}</button>
            </div>
          )):loading?message(ar?'جارٍ إعداد الأسئلة والتسجيل...':'Preparing the audio and questions...'):
          stage==='first'?message(!audioReady?(ar?'اختر محطة وانتظر تجهيز التسجيل.':'Select a station to load the audio.'):
            (ar?'استمع إلى التسجيل كاملًا أولًا؛ ستخرج الأسئلة عند انتهائه.':'Listen to the full recording. Questions appear after it ends.')):
          stage==='second'?message(ar?'الاستماع الثاني مع النص. ستبدأ المراجعة بعد انتهاء التسجيل.':'Second listening with transcript. Review begins afterward.',
            <button className="qul-radio-replay" onClick={onReplay}>{ar?'إعادة الاستماع':'REPLAY'}</button>):
          question?(
            <div className={'qul-radio-printer-question' +
              (question.question.length > 135 ? ' very-long-question' :
                question.question.length > 92 ? ' long-question' : '')}>
              <div className="qul-radio-printer-step"><span>{stage==='final'?(ar?'المراجعة النهائية':'FINAL REVIEW'):(ar?'اختبار الفهم الأول':'FIRST LISTEN QUIZ')}</span><span>{questionIndex+1}/{count}</span></div>
              <p>{question.question}</p>
              <div className="qul-radio-printer-options">
                {question.options.slice(0,4).map((option,i)=><button key={questionIndex+':'+i}
                  className={answers[questionIndex]===i?'selected':''}
                  aria-pressed={answers[questionIndex]===i}
                  onClick={()=>setAnswers(prev=>({...prev,[questionIndex]:i}))}>
                  {option.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g,'')}
                </button>)}
              </div>
              <div className="qul-radio-printer-nav">
                <button disabled={questionIndex===0} onClick={()=>setQuestionIndex(i=>i-1)}>{ar?'السابق':'BACK'}</button>
                {questionIndex<count-1?<button disabled={answers[questionIndex]===undefined} onClick={()=>setQuestionIndex(i=>i+1)}>{ar?'التالي':'NEXT'}</button>:
                  stage==='questions'?<button disabled={!answered} onClick={secondListen}>{ar?'الاستماع الثاني':'SECOND LISTEN'}</button>:
                  <button disabled={!answered} onClick={submit}>{ar?'إنهاء وتقييم':'FINISH & GRADE'}</button>}
              </div>
            </div>
          ):message(ar?'لا تتوفر أسئلة مرتبطة بالتسجيل.':'No questions available.')}
        </div></div>
        <div className="qul-radio-printer-hardware" aria-hidden="true">
          <span className="qul-radio-printer-feed-pin"/><span className="qul-radio-printer-feed-line"/><span className="qul-radio-printer-feed-pin"/>
        </div>
      </>}
    </div>
  </section>;
};
