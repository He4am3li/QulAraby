import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, DoorOpen, Gamepad2, Pause, Play, RotateCcw, X } from 'lucide-react';
import type { CorridorPhase, QulRoom, createQulCorridor } from './ArcadeCorridorScene';
import './ArcadeCorridor.css';

interface ArcadeCorridorProps {
  lang: 'ar' | 'en';
  onBack: () => void;
  onLaunch: (gameId: string) => void;
}
const GAME_IDS: QulRoom[] = ['knowledge-supermarket', 'arabic-space-journey', 'detective-mystery', 'sentence-train'];
const LABELS = {
  ar: ['دكان المعرفة', 'نحو الفضاء', 'من الجاني؟', 'قطار القواعد'],
  en: ['Knowledge Store', 'Space Journey', 'Who is the Culprit?', 'Grammar Train'],
};
const DESCRIPTIONS = {
  ar: [
    'ادخل دكان المعرفة، وتسوق الكلمات في أقسام الأسماء والأفعال والحروف.',
    'انطلق بين الكواكب وأنقذ عالم اللغة في مغامرة فضائية.',
    'ادخل عالم المحقق، وافحص الأدلة لتكشف الجاني.',
    'اصعد قطار القواعد، وحل الألغاز للوصول إلى المحطة التالية.',
  ],
  en: [
    'Visit the Knowledge Store and shop for words across language sections.',
    'Launch across the planets on a language rescue mission.',
    'Enter the detective mystery and follow the clues to solve a case.',
    'Board the grammar train and solve challenges along the journey.',
  ],
};

export const ArcadeCorridor: React.FC<ArcadeCorridorProps> = ({ lang, onBack, onLaunch }) => {
  const [phase, setPhase] = useState<CorridorPhase>('entrance');
  const [room, setRoom] = useState<QulRoom | undefined>();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const mount = useRef<HTMLDivElement>(null);
  const world = useRef<ReturnType<typeof createQulCorridor> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!mount.current) return;
    let disposed = false;
    let instance: ReturnType<typeof createQulCorridor> | null = null;
    import('./ArcadeCorridorScene')
      .then(module => {
        if (disposed || !mount.current) return;
        instance = module.createQulCorridor(mount.current, {
          lang,
          onPhase(nextPhase, nextRoom) {
            if (disposed) return;
            setPhase(nextPhase);
            setRoom(nextRoom);
          },
          onProgress(value) {
            if (!disposed) setProgress(old => Math.abs(old - value) > .03 ? value : old);
          }
        });
        world.current = instance;
        setReady(true);
        setFailed(false);
      })
      .catch(() => { if (!disposed) { setFailed(true); setReady(false); } });
    return () => {
      disposed = true;
      instance?.dispose();
      if (world.current === instance) world.current = null;
    };
  }, [attempt]);

  useEffect(() => { world.current?.setLanguage(lang); }, [lang, ready]);
  useEffect(() => { world.current?.setMotionEnabled(!(paused || reduceMotion)); }, [paused, reduceMotion, ready]);

  const isAr = lang === 'ar';
  const index = room ? GAME_IDS.indexOf(room) : -1;
  return (
    <div className="qul-reference qul-reference-game" dir={isAr ? 'rtl' : 'ltr'} lang={lang}>
      <div ref={mount} className="qul-reference-canvas" aria-label={isAr ? 'ممر الألعاب ثلاثي الأبعاد' : '3D games corridor'} />
      {!ready && (
        <div className="qul-reference-fallback" role="status">
          <div className="qul-reference-mark">قُل</div>
          <p>{failed ? (isAr ? 'تعذر تشغيل المشهد ثلاثي الأبعاد' : 'Could not start the 3D world') : (isAr ? 'تهيئة ممر المغامرات...' : 'Preparing the adventure corridor...')}</p>
          {failed && <button onClick={() => { setFailed(false); setAttempt(n => n + 1); }}><RotateCcw size={16}/>{isAr ? 'إعادة المحاولة' : 'Try again'}</button>}
        </div>
      )}
      <header className="qul-reference-header">
        <div className="qul-reference-brand" style={{ cursor: 'default' }}>
          <img src="/Logo.png" width="38" height="38" alt="" />
          <span>قُل <small>GAMES</small></span>
        </div>
        <div className="qul-reference-header-right">
          <button className="qul-reference-login" onClick={onBack}>
            <ArrowLeft size={16}/>{isAr ? 'العودة للألعاب' : 'Back to games'}
          </button>
        </div>
      </header>
      {(phase === 'entrance' || phase === 'entering') && (
        <div className="qul-reference-entry">
          <p className="qul-reference-kicker">QUL / ADVENTURE</p>
          <h1>{isAr ? 'بوابات المغامرة' : 'Adventure Portals'}</h1>
          <button className="qul-reference-primary" disabled={!ready || phase === 'entering'} onClick={() => world.current?.start()}>
            <DoorOpen size={19}/>{isAr ? 'ادخل عالم الألعاب' : 'Enter the game world'}
          </button>
          <span>{isAr ? 'اسحب للأمام أو حرّك عجلة الفأرة واستكشف الأبواب' : 'Swipe forward or scroll to discover game doors'}</span>
        </div>
      )}
      {phase === 'room' && index >= 0 && (
        <div className="qul-reference-room-overlay">
          <p>0{index + 1} / 04</p>
          <h2>{LABELS[lang][index]}</h2>
          <div className="qul-reference-rule" />
          <p>{DESCRIPTIONS[lang][index]}</p>
          <div className="qul-reference-actions">
            <button className="qul-reference-primary" onClick={() => onLaunch(GAME_IDS[index])}>
              <Gamepad2 size={19}/>{isAr ? 'العب الآن' : 'Play now'}
            </button>
            <button className="qul-reference-secondary" onClick={() => world.current?.back()}>
              <ArrowLeft size={17}/>{isAr ? 'العودة إلى الممر' : 'Back to corridor'}
            </button>
          </div>
        </div>
      )}
      {phase === 'corridor' && (
        <div className="qul-reference-walk-hint">
          {isAr ? 'اختر باب اللعبة، أو تابع السير داخل الممر' : 'Choose a door or keep walking'}
        </div>
      )}
      <nav className="qul-reference-navigation" aria-label={isAr ? 'غرف الألعاب' : 'Game rooms'}>
        <div className="qul-reference-nav-title">
          <span>{isAr ? 'بوابات الألعاب' : 'GAME PORTALS'}</span>
          <span>0{Math.min(4, Math.max(1, Math.round(progress * 4) + 1))} / 04</span>
        </div>
        <div className="qul-reference-door-buttons">
          {GAME_IDS.map((id, i) => (
            <button key={id} aria-current={room === id ? 'step' : undefined} onClick={() => world.current?.visit(id)}>
              <span>0{i + 1}</span>{LABELS[lang][i]}
            </button>
          ))}
        </div>
      </nav>
      {!reduceMotion && (
        <button className="qul-reference-motion" onClick={() => setPaused(v => !v)} aria-label={paused ? (isAr ? 'تشغيل الحركة' : 'Resume motion') : (isAr ? 'إيقاف الحركة' : 'Pause motion')}>
          {paused ? <Play size={15}/> : <Pause size={15}/>}
          <span>{paused ? (isAr ? 'تشغيل الحركة' : 'Resume') : (isAr ? 'إيقاف الحركة' : 'Pause')}</span>
        </button>
      )}
    </div>
  );
};
