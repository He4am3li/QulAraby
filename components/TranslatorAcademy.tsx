import React from 'react';
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Eye, Lightbulb, RefreshCw, Volume2, WandSparkles } from 'lucide-react';
import { speak, evaluateStudentTranslation } from '../services/gemini';
import { TRANSLATION_BANK } from '../data/translationBank';

type Level = 1 | 2 | 3;
type Task = { en: string; ar: string; contextAr: string; contextEn: string; tipAr: string; tipEn: string; alternatives?: string[] };
const lessons: Record<Level, Task[]> = {
  1: [
    { en: 'I drink cold water.', ar: 'أشرب ماءً باردًا.', contextAr: 'في المنزل', contextEn: 'At home', tipAr: 'في العربية تأتي الصفة بعد الاسم.', tipEn: 'In Arabic, adjectives follow nouns.' },
    { en: 'Where is the nearest hospital?', ar: 'أين أقرب مستشفى؟', contextAr: 'طلب المساعدة', contextEn: 'Asking for help', tipAr: 'ابدأ بأداة السؤال: أين.', tipEn: 'Start with the question word أين.' },
    { en: 'My sister goes to school every day.', ar: 'تذهب أختي إلى المدرسة كل يوم.', contextAr: 'الحياة اليومية', contextEn: 'Daily routine', tipAr: 'الفعل يتفق مع الفاعل في التذكير والتأنيث.', tipEn: 'The verb agrees with the subject in gender.' }
  ],
  2: [
    { en: 'Although the weather was cold, we decided to visit the museum.', ar: 'على الرغم من برودة الطقس، قررنا زيارة المتحف.', contextAr: 'وصف تجربة', contextEn: 'Describing an experience', tipAr: 'انقل معنى التناقض، ولا تترجم كلمة بكلمة.', tipEn: 'Preserve the contrast rather than translating word by word.' },
    { en: 'Could you please let me know if the meeting has been postponed?', ar: 'هل يمكنك إخباري من فضلك إذا كان الاجتماع قد تأجل؟', contextAr: 'مراسلة رسمية', contextEn: 'Professional email', tipAr: 'حافظ على أسلوب الطلب المهذب.', tipEn: 'Maintain a polite register.' },
    { en: 'The new library has become a popular place for students to study.', ar: 'أصبحت المكتبة الجديدة مكانًا شائعًا للدراسة بين الطلاب.', contextAr: 'تقرير مدرسي', contextEn: 'School report', tipAr: 'يمكن إعادة صياغة الجملة مع الحفاظ على المعنى.', tipEn: 'You may restructure the sentence while preserving meaning.' }
  ],
  3: [
    { en: 'The initiative seeks to bridge the gap between technological innovation and equitable access to education.', ar: 'تسعى المبادرة إلى سد الفجوة بين الابتكار التقني وإتاحة التعليم على نحو منصف.', contextAr: 'تقرير سياسات', contextEn: 'Policy report', tipAr: 'عبارة bridge the gap تعبير اصطلاحي، لا تُترجم حرفيًا.', tipEn: 'Bridge the gap is an idiom, not a literal bridge.' },
    { en: 'While the proposal appears promising, its long-term viability depends on sustained community engagement.', ar: 'رغم أن المقترح يبدو واعدًا، فإن جدواه على المدى الطويل تعتمد على استمرار مشاركة المجتمع.', contextAr: 'تحليل نقدي', contextEn: 'Critical analysis', tipAr: 'وازن بين الدقة والنبرة التحليلية الطبيعية.', tipEn: 'Balance semantic precision with a natural analytical register.' },
    { en: 'The author deliberately leaves the ending ambiguous, inviting readers to question their assumptions.', ar: 'يتعمد الكاتب ترك النهاية ملتبسة، داعيًا القراء إلى مراجعة افتراضاتهم.', contextAr: 'نقد أدبي', contextEn: 'Literary criticism', tipAr: 'انقل مقصد الكاتب والأسلوب، لا المفردات فقط.', tipEn: 'Convey the author’s intent and style, not just vocabulary.' }
  ]
};
([1,2,3] as const).forEach(level => lessons[level].push(...TRANSLATION_BANK[level]));
const createQueue = (level: Level): number[] => {
 const key = `qul_translation_last_${level}`;
 const last = Number(localStorage.getItem(key) ?? -1);
 const indices = lessons[level].map((_,i)=>i);
 for(let i=indices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]];}
 if(indices.length>1 && indices[0]===last){[indices[0],indices[1]]=[indices[1],indices[0]];}
 return indices;
};
const normalize = (s: string) => s.normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[إأآ]/g,'ا').replace(/ى/g,'ي').replace(/[،؛.!?؟]/g,'').replace(/\s+/g,' ').trim();
export const TranslatorAcademy: React.FC<{lang:'ar'|'en'}> = ({lang}) => {
 const ar=lang==='ar';
 const [level,setLevel]=React.useState<Level>(1);
 const [index,setIndex]=React.useState(0);
 const [queues,setQueues]=React.useState<Record<Level,number[]>>(()=>({1:createQueue(1),2:createQueue(2),3:createQueue(3)}));
 const [answer,setAnswer]=React.useState('');
 const [showHint,setShowHint]=React.useState(false);
 const [review,setReview]=React.useState<{correct:boolean;accuracy:number;feedbackAr:string;feedbackEn:string;grammarTip:string}|null>(null);
 const [busy,setBusy]=React.useState(false);
 const [showReference,setShowReference]=React.useState(false);
 const [attempts,setAttempts]=React.useState(0);
 const task=lessons[level][queues[level][index] ?? 0];
 React.useEffect(()=>{localStorage.setItem(`qul_translation_last_${level}`,String(queues[level][index] ?? 0));},[level,index,queues]);
 const changeLevel=(n:Level)=>{setLevel(n);setIndex(0);setAnswer('');setReview(null);setShowHint(false);setShowReference(false);setAttempts(0)};
 const next=()=>{if(index+1>=queues[level].length){setQueues(prev=>({...prev,[level]:createQueue(level)}));setIndex(0)}else{setIndex(i=>i+1)};setAnswer('');setReview(null);setShowHint(false);setShowReference(false);setAttempts(0)};
 const evaluate=async()=>{
  if(!answer.trim()||busy)return;
  setBusy(true);setReview(null);setAttempts(n=>n+1);
  try {
   const result=await evaluateStudentTranslation(task.en,answer,task.ar);
   setReview({correct:result.isCorrect,accuracy:result.accuracy,feedbackAr:result.feedbackAr,feedbackEn:result.feedbackEn,grammarTip:result.grammarTip});
  } catch {
   const exact=normalize(answer)===normalize(task.ar);
   setReview({correct:exact,accuracy:exact?100:0,feedbackAr:exact?'ترجمة مطابقة للمرجع.':'تعذر التقييم الدلالي حاليًا. أعد المحاولة عند توفر الخدمة.',feedbackEn:exact?'Your translation matches the reference.':'Semantic evaluation is unavailable. Please retry.',grammarTip:''});
  } finally {setBusy(false)}
 };
 return <section className="w-full min-w-0 flex-1 min-h-0 overflow-y-auto bg-[radial-gradient(ellipse_at_15%_10%,rgba(115,177,163,.23),transparent_42%),linear-gradient(145deg,#f3f7f5,#edf2f7_60%,#f6f4ef)] text-[#292d31]" dir={ar?'rtl':'ltr'}>
  <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 sm:py-8 space-y-5">
   <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#d8d0c3] pb-5">
    <div><div className="text-[11px] uppercase tracking-[.24em] text-[#847d71] font-bold">QUL / TRANSLATION STUDIO</div><h2 className="text-2xl sm:text-4xl font-bold mt-2">{ar?'استوديو الترجمة':'Translation Studio'}</h2><p className="text-sm text-[#777269] mt-2">{ar?'افهم المعنى، اكتب ترجمتك، راجعها، ثم حسّنها.':'Understand, translate, review, then refine.'}</p></div>
    <div className="text-xs text-[#777269]">{ar?'المهمة':'Task'} {index+1} / {lessons[level].length}</div>
   </header>
   <div className="grid grid-cols-3 gap-2" role="tablist" aria-label={ar?'مستويات الترجمة':'Translation levels'}>
    {([1,2,3] as Level[]).map(n=><button key={n} role="tab" aria-selected={level===n} onClick={()=>changeLevel(n)} className={`rounded-xl border px-2 py-3 text-center transition-colors ${level===n?'bg-[#203b36] text-white border-[#203b36]':'bg-white/70 border-[#ddd5c9] text-[#4e534f]'}`}><span className="block text-xs opacity-70">{n===1?'A1–A2':n===2?'B1–B2':'C1–C2'}</span><span className="block text-xs sm:text-sm font-bold mt-1">{n===1?(ar?'أفهم':'Understand'):n===2?(ar?'أفسر':'Interpret'):(ar?'أحرر':'Refine')}</span></button>)}
   </div>
   <div className="grid lg:grid-cols-2 gap-4 items-stretch">
    <article className="bg-white/65 backdrop-blur-xl border border-white/90 rounded-3xl p-5 sm:p-7 shadow-[0_18px_50px_rgba(30,65,63,.08)] space-y-5">
     <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold tracking-wider text-[#8b7964]">{ar?'النص الأصلي':'SOURCE TEXT'}</span><button className="p-2 rounded-lg hover:bg-[#f1ebe1]" aria-label={ar?'استمع للنص':'Listen to source'} onClick={()=>speak(task.en,'en')}><Volume2 size={19}/></button></div>
     <p dir="ltr" className="text-left text-xl sm:text-2xl leading-relaxed font-medium">{task.en}</p>
     <div className="pt-4 border-t border-[#e7dfd3] flex items-center justify-between gap-2 text-xs text-[#777269]"><span>{ar?'السياق':'Context'}: {ar?task.contextAr:task.contextEn}</span><span>{ar?'إنجليزي ← عربي':'English to Arabic'}</span></div>
     <button onClick={()=>setShowHint(v=>!v)} className="flex items-center gap-2 text-sm font-semibold text-[#376a5e]"><Lightbulb size={17}/>{ar?'مساعدة لغوية':'Translation hint'}</button>
     {showHint&&<p className="rounded-xl bg-[#edf1eb] p-3 text-sm leading-relaxed">{ar?task.tipAr:task.tipEn}</p>}
    </article>
    <article className="bg-white/70 backdrop-blur-xl border border-white/90 rounded-3xl p-5 sm:p-7 shadow-[0_18px_50px_rgba(30,65,63,.08)] flex flex-col gap-4">
     <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold tracking-wider text-[#8b7964]">{ar?'مساحة المترجم':'YOUR TRANSLATION'}</span><span className="text-xs text-[#8b7964]">{ar?'العربية':'Arabic'}</span></div>
     <textarea dir="rtl" lang="ar" value={answer} onChange={e=>{setAnswer(e.target.value);setReview(null)}} placeholder={ar?'اكتب ترجمتك هنا...':'Write your Arabic translation...'} className="w-full min-h-[160px] flex-1 rounded-xl border border-[#ded8cd] bg-[#fdfbf7] p-4 text-lg leading-loose outline-none focus:border-[#376a5e] resize-y" />
     <div className="flex flex-wrap gap-2"><button disabled={busy||!answer.trim()} onClick={evaluate} className="flex-1 min-h-12 rounded-xl bg-[#203b36] text-white font-bold text-sm disabled:opacity-50">{busy?(ar?'جارٍ تحليل الترجمة...':'Evaluating...'):(ar?'راجع ترجمتي':'Review translation')}</button><button onClick={()=>{setAnswer('');setReview(null)}} className="px-4 rounded-xl border border-[#ded8cd] text-sm" aria-label={ar?'إعادة الكتابة':'Reset'}><RefreshCw size={18}/></button></div>
    </article>
   </div>
   {(review||showReference)&&<div className="bg-white rounded-2xl border border-[#ddd5c9] p-5 sm:p-7 space-y-3" aria-live="polite">
    {review&&<><div className="flex items-center gap-2 font-bold text-[#203b36]"><CheckCircle2 size={19}/>{ar?'مراجعة الترجمة':'Translation review'}</div><p className="text-sm leading-relaxed">{ar?review.feedbackAr:review.feedbackEn}</p><p className="text-xs text-[#777269]">{ar?'التقدير الآلي':'Automated score'}: {review.accuracy}%</p>{review.grammarTip&&<p className="text-sm text-[#666057]">{review.grammarTip}</p>}</>}
    {showReference&&<div className="pt-3 border-t border-[#e7dfd3]"><p className="text-xs text-[#777269] mb-2">{ar?'ترجمة مرجعية ممكنة':'One possible reference translation'}</p><p dir="rtl" className="text-lg text-right">{task.ar}</p></div>}
   </div>}
   <footer className="flex flex-wrap justify-between items-center gap-3 pb-5"><button onClick={()=>setShowReference(v=>!v)} className="inline-flex items-center gap-2 text-sm text-[#376a5e] font-bold"><Eye size={17}/>{ar?'عرض ترجمة مرجعية':'Show reference'}</button><button onClick={next} className="inline-flex items-center gap-2 rounded-xl border border-[#cfc5b6] px-5 py-3 font-bold text-sm bg-white">{ar?'المهمة التالية':'Next task'} {ar?<ChevronLeft size={17}/>:<ChevronRight size={17}/>}</button></footer>
  </div>
 </section>;
};
