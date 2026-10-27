import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Globe2, LogIn, Pause, Play, X } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import type { CorridorPhase, QulRoom, createQulCorridor } from '../components/landing/ReferenceCorridor';
import './ReferenceCorridor.css';

type Language = 'ar' | 'en';
const readLanguage = (): Language => {
  try { return localStorage.getItem('hub_lang') === 'en' ? 'en' : 'ar'; }
  catch { return 'ar'; }
};
const rooms: QulRoom[] = ['reading', 'listening', 'games', 'schools'];
const COPY = {
  ar: {
    title: 'قُل', subtitle: 'عالم العربية يبدأ من هنا',
    entrance: 'ادخل إلى عالم قُل', hint: 'تقدّم بالتمرير أو السحب للأعلى',
    login: 'تسجيل الدخول', google: 'المتابعة باستخدام Google',
    close: 'إغلاق', back: 'العودة إلى الممر', pause: 'إيقاف الحركة',
    resume: 'استئناف الحركة', loading: 'جارٍ الدخول...', school: 'احجز عرضًا لمدرستك',
    navigate: 'استكشف الغرف', touch: 'مرّر للأمام، والمس الباب لزيارته',
    labels: ['القراءة', 'الاستماع', 'الألعاب', 'المدارس'],
    heading: [
      'عالم القراءة', 'عالم الاستماع', 'عالم الألعاب', 'عالم المدرسة',
    ],
    detail: [
      'اكتشف الكلمة داخل الحكاية؛ نصوص عربية ومفردات وفهم متدرّج.',
      'استمع إلى القصص، ثم اختبر فهمك وعُد إلى النص لمراجعته.',
      'تحديات ومغامرات تجعل تعلّم العربية رحلة ممتعة.',
      'رحلة واحدة تجمع الطالب والمعلم والمدرسة.',
    ],
    enter: 'اكتشف', return: 'العودة', awaiting: 'افتح أحد الأبواب',
    loginRequired: 'للحجز أو التواصل مع المدرسة، سجّل الدخول.',
  },
  en: {
    title: 'QUL', subtitle: 'A whole world of Arabic learning',
    entrance: 'Enter the world of QUL', hint: 'Scroll or swipe forward',
    login: 'Sign in', google: 'Continue with Google',
    close: 'Close', back: 'Back to the corridor', pause: 'Pause motion',
    resume: 'Resume motion', loading: 'Signing in...', school: 'Book a school demo',
    navigate: 'Explore the rooms', touch: 'Swipe forward and tap a door to enter',
    labels: ['Reading', 'Listening', 'Games', 'Schools'],
    heading: ['The Reading Room', 'The Listening Room', 'The Games Room', 'For Schools'],
    detail: [
      'Discover new words inside stories, guided reading and comprehension.',
      'Hear real stories, answer questions and review the transcript.',
      'Explore challenges and adventures designed for Arabic learning.',
      'One experience for students, teachers and the entire school.',
    ],
    enter: 'Explore', return: 'Return', awaiting: 'Choose a door',
    loginRequired: 'Please sign in to inquire about a school demonstration.',
  }
} as const;

export const Landing: React.FC = () => {
  const { signIn, isSigningIn, authError, clearAuthError } = useAuth();
  const [lang, setLang] = useState<Language>(readLanguage);
  const [phase, setPhase] = useState<CorridorPhase>('entrance');
  const [room, setRoom] = useState<QulRoom | undefined>();
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [loginOpen, setLoginOpen] = useState(() => new URLSearchParams(window.location.search).get('login') === '1');
  const [progress, setProgress] = useState(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const corridorRef = useRef<ReturnType<typeof createQulCorridor> | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reset, setReset] = useState(0);
  const t = COPY[lang];

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(mq.matches);
    mq.addEventListener('change', change);
    return () => mq.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let instance: ReturnType<typeof createQulCorridor> | null = null;
    import('../components/landing/ReferenceCorridor')
      .then(module => {
        if (disposed) return;
        instance = module.createQulCorridor(host, {
          lang,
          onPhase(nextPhase, nextRoom) {
            if (disposed) return;
            setPhase(nextPhase);
            setRoom(nextRoom);
          },
          onProgress(value) {
            if (!disposed) setProgress(old => Math.abs(old - value) > .025 ? value : old);
          }
        });
        corridorRef.current = instance;
        setReady(true);
        setFallback(false);
      })
      .catch(() => {
        if (!disposed) { setFallback(true); setReady(false); }
      });
    return () => {
      disposed = true;
      instance?.dispose();
      if (corridorRef.current === instance) corridorRef.current = null;
    };
  }, [reset]);

  useEffect(() => { corridorRef.current?.setLanguage(lang); }, [lang]);
  useEffect(() => { corridorRef.current?.setMotionEnabled(!paused && !reduced); }, [paused, reduced, ready]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (loginOpen && !dialog.open) dialog.showModal();
    if (!loginOpen && dialog.open) dialog.close();
  }, [loginOpen]);
  const changeLanguage = () => {
    const next = lang === 'ar' ? 'en' : 'ar';
    setLang(next);
    try { localStorage.setItem('hub_lang', next); window.dispatchEvent(new Event('langChanged')); } catch {}
  };
  const go = (id: QulRoom) => corridorRef.current?.visit(id);
  const openLogin = () => { clearAuthError(); setLoginOpen(true); };
  const isInside = phase === 'room';
  const roomIndex = room ? rooms.indexOf(room) : -1;

  return (
    <div className="qul-reference" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div ref={hostRef} className="qul-reference-canvas" aria-hidden="true"/>
      {(!ready || fallback) && (
        <div className="qul-reference-fallback">
          <div className="qul-reference-mark">قُل</div>
          <p>{t.subtitle}</p>
          {fallback && <button onClick={() => { setFallback(false); setReset(n => n + 1); }}>{lang === 'ar' ? 'إعادة تشغيل التجربة' : 'Retry experience'}</button>}
        </div>
      )}
      <header className="qul-reference-header">
        <button className="qul-reference-brand" onClick={() => window.location.reload()} aria-label={lang === 'ar' ? 'قُل، البداية' : 'QUL, start'}>
          <img src="/Logo.png" alt="" width="38" height="38"/>
          <span>قُل <small>QUL</small></span>
        </button>
        <div className="qul-reference-header-right">
          <button onClick={changeLanguage}><Globe2 size={16}/>{lang === 'ar' ? 'EN' : 'العربية'}</button>
          <button className="qul-reference-login" onClick={openLogin}><LogIn size={16}/>{t.login}</button>
        </div>
      </header>
      {phase === 'entrance' || phase === 'entering' ? (
        <div className="qul-reference-entry">
          <p className="qul-reference-kicker">QUL / قُل</p>
          <h1>{t.subtitle}</h1>
          <button className="qul-reference-primary" onClick={() => corridorRef.current?.start()} disabled={!ready || phase === 'entering'}>
            {t.entrance}<ArrowDown size={18}/>
          </button>
          <span>{t.hint}</span>
        </div>
      ) : isInside && roomIndex >= 0 ? (
        <div className="qul-reference-room-overlay">
          <p>0{roomIndex+1} / 04</p>
          <h2>{t.heading[roomIndex]}</h2>
          <div className="qul-reference-rule"/>
          <p>{t.detail[roomIndex]}</p>
          <div className="qul-reference-actions">
            <button className="qul-reference-primary" onClick={() => room === 'schools' ? openLogin() : openLogin()}>
              {room === 'schools' ? t.school : t.enter}
            </button>
            <button className="qul-reference-secondary" onClick={() => corridorRef.current?.back()}>
              {t.back}<ArrowLeft size={17}/>
            </button>
          </div>
        </div>
      ) : (
        <div className="qul-reference-walk-hint" aria-hidden="true">
          <span>{phase === 'approaching' || phase === 'leaving' ? '' : t.touch}</span>
        </div>
      )}
      <div className="qul-reference-navigation">
        <div className="qul-reference-nav-title"><span>{t.navigate}</span><span>0{Math.max(1,Math.min(4,Math.round(progress*4)+1))} / 04</span></div>
        <div className="qul-reference-door-buttons">
          {rooms.map((id,index)=>(
            <button
              key={id}
              onClick={() => go(id)}
              aria-current={room === id ? 'step' : undefined}
              title={t.labels[index]}
            >
              <span>0{index+1}</span>{t.labels[index]}
            </button>
          ))}
        </div>
      </div>
      {!reduced && <button className="qul-reference-motion" onClick={() => setPaused(v=>!v)}>
        {paused ? <Play size={15}/> : <Pause size={15}/>}
        <span>{paused ? t.resume : t.pause}</span>
      </button>}
      {authError && !loginOpen && <div className="qul-reference-auth-error" role="alert">{authError}<button onClick={clearAuthError}>×</button></div>}
      <dialog ref={dialogRef} className="qul-reference-dialog" onCancel={()=>setLoginOpen(false)} onClose={()=>setLoginOpen(false)}>
        <button aria-label={t.close} onClick={()=>setLoginOpen(false)} className="qul-reference-close"><X size={21}/></button>
        <img src="/Logo.png" width="64" height="64" alt="قُل"/>
        <h2>{lang==='ar' ? 'أهلًا بك في قُل' : 'Welcome to QUL'}</h2>
        <button className="qul-reference-primary" onClick={()=>void signIn()} disabled={isSigningIn}>{isSigningIn ? t.loading : t.google}<LogIn size={17}/></button>
        {authError && <p role="alert">{authError}</p>}
      </dialog>
    </div>
  );
};
export default Landing;
