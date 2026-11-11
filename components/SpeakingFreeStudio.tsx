import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AudioLines, BookOpen, Check, Headphones, History, Languages, Loader2,
  MessageCircle, Mic, MicOff, PenLine, Send, Sparkles, X
} from 'lucide-react';
import { SpeakingStudioMicrophone } from './SpeakingStudioMicrophone';
import './SpeakingFreeStudio.css';

export type FreeStudioTurn = { role:'user'|'ai'; text:string; modality?:'speech'|'text' };

interface FreeStudioProps {
  lang:'ar'|'en';
  topic:string;
  level:string;
  isActive:boolean;
  loading:boolean;
  isFinishing:boolean;
  isAiSpeaking:boolean;
  micMuted:boolean;
  recoveryNotice:string|null;
  history:FreeStudioTurn[];
  learnerText:string;
  tutorText:string;
  meterRef:React.RefObject<HTMLDivElement|null>;
  onResume:()=>void;
  onStop:()=>void;
  onToggleMic:()=>void;
  onSendText:(text:string)=>boolean;
  onTranslate:(text:string)=>Promise<string>;
  onStartSpelling:(text:string)=>void;
  isGeneratingChallenge:boolean;
  children?:React.ReactNode;
}
type ToolPanel='type'|'help'|'translation'|'history'|null;

const HELP_LINES=[
  {ar:'هل يمكنك إعادة السؤال؟',en:'Could you repeat the question?'},
  {ar:'أحتاج إلى مثال، من فضلك.',en:'Could I have an example, please?'},
  {ar:'كيف أقول هذا بالعربية؟',en:'How do I say this in Arabic?'},
];
const WAVE_BARS=Array.from({length:81},(_,index)=>{
  const x=index/80;
  const shape=(Math.sin(index*.43)*.21+Math.sin(index*.97)*.17+Math.sin(index*.19)*.27);
  const envelope=.34+.66*Math.sin(Math.PI*x)**1.4;
  return Math.round(12+90*envelope*(.44+Math.abs(shape)));
});

export const SpeakingFreeStudio:React.FC<FreeStudioProps>=({
  lang,topic,level,isActive,loading,isFinishing,isAiSpeaking,micMuted,recoveryNotice,
  history,learnerText,tutorText,meterRef,onResume,onStop,onToggleMic,
  onSendText,onTranslate,onStartSpelling,isGeneratingChallenge,children,
})=>{
  const ar=lang==='ar';
  const reducedMotion=useReducedMotion();
  const [panel,setPanel]=React.useState<ToolPanel>(null);
  const [draft,setDraft]=React.useState('');
  const [translation,setTranslation]=React.useState<{source:string;text:string}|null>(null);
  const [translating,setTranslating]=React.useState(false);
  const [sendError,setSendError]=React.useState('');
  const translationRequest=React.useRef(0);
  const transcriptRef=React.useRef<HTMLDivElement>(null);

  const turns:FreeStudioTurn[]=[
    ...history.filter((turn): turn is FreeStudioTurn => Boolean(turn && typeof turn.text === 'string')),
    ...(learnerText.trim()?[{role:'user' as const,text:learnerText}]:[]),
    ...(tutorText.trim()?[{role:'ai' as const,text:tutorText}]:[]),
  ];
  const latest=[...turns].reverse().find(turn=>turn?.text?.trim());
  const latestTutor=[...turns].reverse().find(turn=>turn?.role==='ai'&&turn?.text?.trim());
  const visible=turns.slice(-24);

  React.useEffect(()=>()=>{translationRequest.current+=1},[]);
  React.useEffect(()=>{
    if(panel==='history'&&transcriptRef.current){
      transcriptRef.current.scrollTop=transcriptRef.current.scrollHeight;
    }
  },[turns.length,learnerText,tutorText,panel]);

  const status=isFinishing
    ? (ar?'جارٍ تجهيز التقرير':'Preparing your report')
    : loading
      ? (ar?'جارٍ الاتصال':'Connecting')
      : isAiSpeaking
        ? (ar?'المعلّم يتحدث':'Tutor speaking')
        : micMuted
          ? (ar?'الميكروفون مكتوم':'Microphone muted')
          : isActive
            ? (ar?'أنا أستمع إليك':'Listening to you')
            : (ar?'المحادثة متوقفة':'Conversation paused');

  const selectPanel=(next:ToolPanel)=>{
    setPanel(current=>current===next?null:next);
    setSendError('');
  };

  const choosePhrase=(line:{ar:string;en:string})=>{
    setDraft(line.ar);
    setPanel('type');
    setSendError('');
  };

  const sendMessage=(event:React.FormEvent)=>{
    event.preventDefault();
    const value=draft.trim();
    if(!value||!isActive||loading||isAiSpeaking||isFinishing)return;
    if(onSendText(value)){
      setDraft('');
      setSendError('');
      setPanel(null);
    }else{
      setSendError(ar?'تعذر إرسال الرسالة. حاول مرة أخرى.':'Message not sent. Please try again.');
    }
  };

  const showTranslation=async()=>{
    setPanel('translation');
    if(!latest?.text.trim())return;
    const source=latest.text.trim();
    if(translation?.source===source)return;
    const request=++translationRequest.current;
    setTranslating(true);
    setTranslation(null);
    try{
      const text=await onTranslate(source);
      if(translationRequest.current===request)
        setTranslation({source,text:text.trim()||(ar?'الترجمة غير متاحة الآن.':'Translation unavailable.')});
    }catch{
      if(translationRequest.current===request)
        setTranslation({source,text:ar?'تعذر الترجمة. أعد المحاولة.':'Translation failed. Please retry.'});
    }finally{
      if(translationRequest.current===request)setTranslating(false);
    }
  };

  return(
    <section className={'qul-free-studio qul-voice-studio'+(isAiSpeaking?' is-tutor-speaking':isActive&&!micMuted?' is-learner-speaking':' is-idle')}
      dir={ar?'rtl':'ltr'} aria-label={ar?'استوديو المحادثة الحرة':'Free Conversation Studio'}
      data-testid="free-speaking-studio">
      <div className="qul-voice-atmosphere" aria-hidden="true">
        <span>ع</span><span>ق</span><span>ف</span><span>ض</span>
      </div>
      <header className="qul-voice-header">
        <div className="qul-voice-heading">
          <span className="qul-voice-header-mark" aria-hidden="true"><AudioLines size={22}/></span>
          <div>
            <span className="qul-voice-eyebrow">QUL / VOICE STUDIO</span>
            <h2>{ar?'استوديو المحادثة':'Conversation Studio'}</h2>
            <p>{topic} <span aria-hidden="true">·</span> {level}</p>
          </div>
        </div>
        <div className={'qul-voice-onair'+(isActive?' is-live':'')} aria-live="polite">
          <i aria-hidden="true"/>
          <span>{isFinishing?(ar?'جاري الإنهاء':'Finishing'):isActive?(ar?'اتصال مباشر':'Live conversation'):(ar?'غير متصل':'Offline')}</span>
        </div>
      </header>

      {recoveryNotice&&!isActive&&(
        <div className="qul-voice-recovery" role="alert">
          <span>{recoveryNotice}</span>
          <button type="button" onClick={onResume} disabled={loading||isFinishing}>
            {loading?<Loader2 size={15} className="qul-free-spin"/>:<Headphones size={16}/>}
            {ar?'إعادة الاتصال':'Reconnect'}
          </button>
        </div>
      )}

      <div className="qul-voice-workspace">
        <aside className="qul-voice-assists" aria-label={ar?'عبارات مفيدة':'Helpful phrases'}>
          <div className="qul-voice-assist-card">
            <div className="qul-voice-side-title">
              <BookOpen size={17} aria-hidden="true"/>
              <strong>{ar?'عبارات مفيدة':'Useful phrases'}</strong>
            </div>
            <div className="qul-voice-phrase-list">
              {HELP_LINES.map(line=>(
                <button key={line.ar} type="button" onClick={()=>choosePhrase(line)}
                  title={ar?'استخدم هذه العبارة في الكتابة':'Use this phrase in a typed reply'}>
                  <strong lang="ar" dir="rtl">{line.ar}</strong>
                  <small lang="en" dir="ltr">{line.en}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="qul-voice-assist-card qul-voice-translate-card">
            <div className="qul-voice-side-title">
              <Languages size={17} aria-hidden="true"/>
              <strong>{ar?'الترجمة والمساعدة':'Translation & help'}</strong>
            </div>
            <p>{latest?.text|| (ar?'ترجم عبارة من المحادثة عند الحاجة.':'Translate a conversation line when you need help.')}</p>
            {translation && latest && translation.source === latest.text.trim() && <small dir="auto">{translation.text}</small>}
            <button type="button" onClick={()=>void showTranslation()} disabled={translating||!latest}
              aria-label={ar?'ترجم آخر عبارة':'Translate last line'}>
              {translating?<Loader2 size={14} className="qul-free-spin"/>:<Languages size={14}/>}
              {ar?'ترجمة العبارة':'Translate line'}
            </button>
          </div>
        </aside>

        <div className="qul-voice-stage" aria-label={ar?'مساحة المحادثة الصوتية':'Voice stage'}>
          <div className="qul-voice-stage-top">
            <span className="qul-voice-stage-id" dir="ltr">QUL · LIVE</span>
            <div className="qul-voice-status" role="status" aria-live="polite">
              <i aria-hidden="true"/><strong>{status}</strong>
            </div>
            <div className="qul-voice-indicator" aria-hidden="true"/>
          </div>
          <div className="qul-voice-stage-performance">
            <div ref={meterRef} className="qul-voice-waveform"
              style={{'--mic-scale':.12} as React.CSSProperties} aria-hidden="true">
              {WAVE_BARS.map((height,index)=>(
                <i key={index} style={{height:height+'%','--index':index} as React.CSSProperties}/>
              ))}
            </div>
            <div className="qul-voice-glow" aria-hidden="true"/>
            <SpeakingStudioMicrophone active={isActive}/>
            <div className="qul-voice-eq" aria-hidden="true">
              {Array.from({length:32},(_,index)=>
                <span key={index} style={{'--index':index,'--bar':(.2+Math.abs(Math.sin(index*.71))*.78)} as React.CSSProperties}/>)}
            </div>
          </div>
          <div className="qul-voice-stage-caption">
            {isAiSpeaking?(ar?'استمع إلى المعلّم ثم أجب بالعربية':'Listen to the tutor, then respond in Arabic')
              :isActive&&!micMuted?(ar?'تحدّث بحرية، وسأساعدك عند الحاجة':'Speak freely, and ask for help when needed')
              :micMuted?(ar?'الميكروفون مكتوم':'Microphone is muted')
              :(ar?'استأنف الاتصال لبدء الحوار':'Reconnect to continue speaking')}
          </div>
        </div>

        <aside className="qul-voice-latest" aria-label={ar?'آخر عبارة في المحادثة':'Latest utterance'}>
          <div className="qul-voice-side-title">
            <MessageCircle size={17} aria-hidden="true"/>
            <strong>{ar?'آخر ما قيل':'Latest utterance'}</strong>
          </div>
          <div className="qul-voice-last-quote" role="status">
            <span>{latest?.role==='ai'?(ar?'المعلّم':'Tutor'):(ar?'الطالب':'Learner')}</span>
            <p dir="auto">{latest?.text ||(ar?'ستظهر هنا آخر عبارة منطوقة.':'The latest spoken sentence appears here.')}</p>
            {latest?.modality==='text'&&<small>{ar?'رسالة مكتوبة':'Typed message'}</small>}
            <div className="qul-voice-quote-bars" aria-hidden="true">
              {Array.from({length:20},(_,i)=><i key={i} style={{height:(5+Math.abs(Math.sin(i*.83))*15)+'px'}}/>)}
            </div>
          </div>
          <button type="button" className="qul-voice-history-link" onClick={()=>selectPanel('history')}
            aria-label={ar?'فتح سجل المحادثة الكامل':'Open full conversation transcript'}>
            <History size={16}/>
            <span>{ar?'سجل الحوار':'Conversation log'}</span>
            <span className="qul-voice-turn-count">{history.length}</span>
          </button>
        </aside>
      </div>

      {children&&<div className="qul-voice-challenge">{children}</div>}

      <footer className="qul-voice-dock" data-testid="free-speaking-tool-dock">
        <button type="button" className="qul-voice-finish" data-testid="free-speaking-finish"
          onClick={onStop} disabled={isFinishing}
          aria-label={ar?'إنهاء المحادثة وعرض التقرير':'Finish conversation and show report'}>
          {isFinishing?<Loader2 size={17} className="qul-free-spin"/>:<Check size={17}/>}
          <span>{isFinishing ? (ar?'جارٍ إعداد التقرير...':'Preparing report...')
            :(ar?'إنهاء المحادثة وعرض التقرير':'Finish & view report')}</span>
        </button>
        <span className="qul-voice-dock-divider" aria-hidden="true"/>
        <div className="qul-voice-tools" role="group" aria-label={ar?'أدوات التحدث':'Speaking tools'}>
          <button type="button" className={panel==='help'?'selected':''}
            onClick={()=>selectPanel('help')} aria-pressed={panel==='help'}
            title={ar?'مساعدة':'Help'} aria-label={ar?'عبارات مساعدة':'Helpful phrases'}>
            <BookOpen size={18}/><span>{ar?'مساعدة':'Help'}</span>
          </button>
          <button type="button" className={panel==='translation'?'selected':''}
            onClick={()=>void showTranslation()} aria-pressed={panel==='translation'}
            title={ar?'ترجمة':'Translate'} aria-label={ar?'ترجمة آخر عبارة':'Translate the last line'}>
            <Languages size={19}/><span>{ar?'ترجمة':'Translate'}</span>
          </button>
          <button type="button" className={panel==='type'?'selected':''}
            onClick={()=>selectPanel('type')} aria-pressed={panel==='type'}
            title={ar?'الكتابة':'Text'} aria-label={ar?'كتابة رسالة':'Type a message'}>
            <PenLine size={18}/><span>{ar?'الكتابة':'Text'}</span>
          </button>
          <button type="button" className={panel==='history'?'selected':''}
            onClick={()=>selectPanel('history')} aria-pressed={panel==='history'}
            title={ar?'السجل':'Transcript'} aria-label={ar?'عرض سجل المحادثة':'View conversation log'}>
            <History size={18}/><span>{ar?'السجل':'History'}</span>
          </button>
        </div>
        <button type="button" className={'qul-voice-talk-control'+(micMuted?' is-muted':'')}
          onClick={onToggleMic} disabled={!isActive||loading||isFinishing}
          aria-pressed={isActive&&!micMuted} aria-label={micMuted?(ar?'تشغيل الميكروفون':'Unmute microphone'):(ar?'كتم الميكروفون':'Mute microphone')}
          title={micMuted?(ar?'تشغيل الميكروفون':'Unmute'):(ar?'كتم الميكروفون':'Mute')}>
          {micMuted?<MicOff size={28}/>:<Mic size={30}/>}
          <span>{micMuted?(ar?'تشغيل الصوت':'Unmute'):(ar?'تحدث الآن':'Speak now')}</span>
        </button>
      </footer>

      <AnimatePresence initial={false} mode="wait">
        {panel&&(
          <motion.div key={panel} className="qul-voice-panel"
            initial={reducedMotion?false:{opacity:0,y:14,scale:.98}}
            animate={{opacity:1,y:0,scale:1}}
            exit={reducedMotion?{opacity:0}:{opacity:0,y:9,scale:.99}}
            transition={{duration:reducedMotion?0:.18}}>
            <div className="qul-voice-panel-header">
              <strong>{panel==='type'?(ar?'اكتب ردك':'Write your reply')
                :panel==='translation'?(ar?'ترجمة العبارة':'Line translation')
                :panel==='help'?(ar?'عبارات مساعدة':'Helpful phrases')
                :(ar?'سجل المحادثة':'Conversation transcript')}</strong>
              <button type="button" onClick={()=>setPanel(null)} aria-label={ar?'إغلاق اللوحة':'Close panel'}><X size={18}/></button>
            </div>
            {panel==='type'&&(
              <form className="qul-voice-compose" onSubmit={sendMessage}>
                <input type="text" value={draft} onChange={e=>setDraft(e.target.value)}
                  maxLength={500} autoComplete="off" dir="auto"
                  placeholder={ar?'اكتب ردك بالعربية...':'Type your reply in Arabic...'}
                  aria-label={ar?'رسالة الطالب المكتوبة':'Typed learner message'}/>
                <button type="submit" disabled={!isActive||loading||isFinishing||isAiSpeaking||!draft.trim()}
                  aria-label={ar?'إرسال الرد':'Send reply'}><Send size={18}/></button>
                <small>{ar?'الرسائل المكتوبة لا تُحتسب ممارسة شفوية.':'Typed replies do not count toward oral practice.'}</small>
                {sendError&&<p role="alert">{sendError}</p>}
              </form>
            )}
            {panel==='help'&&(
              <div className="qul-voice-help-list">
                {HELP_LINES.map(line=>(
                  <button type="button" key={line.ar} onClick={()=>choosePhrase(line)}>
                    <strong dir="rtl" lang="ar">{line.ar}</strong><small dir="ltr" lang="en">{line.en}</small>
                  </button>
                ))}
              </div>
            )}
            {panel==='translation'&&(
              <div className="qul-voice-translation-result" aria-live="polite">
                {!latest?.text?(ar?'لا توجد عبارة لترجمتها بعد.':'No line to translate yet.')
                :translating?<><Loader2 size={16} className="qul-free-spin"/>{ar?'جارٍ الترجمة...':'Translating...'}</>
                :translation?.source===latest.text.trim()?<p dir="auto">{translation.text}</p>
                :<button type="button" onClick={()=>void showTranslation()}>{ar?'إعادة المحاولة':'Retry translation'}</button>}
              </div>
            )}
            {panel==='history'&&(
              <div className="qul-voice-history-panel">
                <div ref={transcriptRef} className="qul-voice-history-lines" role="log">
                  {visible.length?visible.map((turn,index)=>(
                    <div key={index} className={turn.role==='ai'?'tutor':'learner'}>
                      <strong>{turn.role==='ai'?(ar?'المعلّم':'Tutor'):(ar?'أنت':'You')}</strong>
                      <p dir="auto">{turn.text}</p>
                      {turn.modality==='text'&&<small>{ar?'كتابة':'Typed'}</small>}
                    </div>
                  )):<p>{ar?'لم تصل عبارات بعد.':'No transcript lines received yet.'}</p>}
                </div>
                {latestTutor&&<button type="button" className="qul-voice-spelling" disabled={isGeneratingChallenge||isAiSpeaking}
                  onClick={()=>onStartSpelling(latestTutor.text)}>
                  {isGeneratingChallenge?<Loader2 size={15} className="qul-free-spin"/>:<PenLine size={15}/>}
                  {ar?'تدريب إملائي من آخر عبارة':'Spelling practice from the latest reply'}
                </button>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="qul-voice-footer-note">
        <Sparkles size={13} aria-hidden="true"/>
        <span>{ar?'أجب بالعربية قدر استطاعتك، واطلب المساعدة عند الحاجة.':
          'Speak as much Arabic as you can, and ask for help when needed.'}</span>
      </div>
    </section>
  );
};
