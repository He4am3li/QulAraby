import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { History, Volume2, X } from 'lucide-react';

interface SpeechTurn {
  role: string;
  text: string;
  translationEn?: string;
  speakerName?: string;
  liveTurnKey?: string;
}

interface Props {
  countryId: string;
  lang: 'ar' | 'en';
  tutorName?: string;
  maleTutorName?: string;
  femaleTutorName?: string;
  turns: SpeechTurn[];
  liveActive: boolean;
  speaking: boolean;
  currentSpeechText?: string;
  onPronounce: (text: string) => void;
}

/** The character stage owns the conversation. No transcript box or card is mounted. */
export const DialectSpeechOverlay: React.FC<Props> = React.memo(({
  countryId, lang, tutorName, maleTutorName, femaleTutorName,
  turns, liveActive, speaking, currentSpeechText, onPronounce
}) => {
  const ar = lang === 'ar';
  const reduceMotion = useReducedMotion();
  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);
  const [reveal, setReveal] = React.useState(false);

  const records = React.useMemo(() =>
    turns.filter(turn => Boolean(turn.text && turn.text.trim())), [turns]);
  const latestRecord = records[records.length - 1];
  const isLiveSpeech = speaking && Boolean(currentSpeechText?.trim());
  const record = focusedIndex === null
    ? latestRecord
    : records[Math.min(focusedIndex, records.length - 1)];
  const currentText = focusedIndex === null && isLiveSpeech
    ? currentSpeechText!.trim() : (record?.text || '');
  const isTutor = focusedIndex === null && isLiveSpeech ? true :
    record?.role !== 'user';
  const speaker = isTutor
    ? (focusedIndex === null && isLiveSpeech ? tutorName : record?.speakerName || tutorName) || (ar ? 'المعلم' : 'Tutor')
    : (ar ? 'الطالب' : 'Student');
  const translation = focusedIndex === null && isLiveSpeech && record?.text !== currentText
    ? '' : record?.translationEn?.trim() || '';
  const translated = translation && translation !== currentText.trim() ? translation : '';
  const containsArabic = (value: string) => /[\u0600-\u06ff]/.test(value);
  // Two language rays, always Arabic on the right and English on the left.
  // A single-language utterance remains attached to its speaking character.
  const arabicLine = containsArabic(currentText) ? currentText : containsArabic(translated) ? translated : '';
  const englishLine = !containsArabic(currentText) ? currentText
    : translated && !containsArabic(translated) ? translated : '';
  const bilingual = Boolean(arabicLine && englishLine);
  // The original grid reverses under LTR; anchor the glow to the correct portrait.
  const male = speaker === maleTutorName || (isTutor && speaker !== femaleTutorName);
  const onRight = ar ? male : !male;
  const placement = !isTutor ? 'student' : onRight ? 'right' : 'left';
  const hasTranscript = Boolean(currentText.trim());

  React.useEffect(() => {
    setArchiveOpen(false);
    setFocusedIndex(null);
    setReveal(false);
  }, [countryId]);

  // A fresh turn is a light pulse in the scene, not a permanently occupying panel.
  // It is held during live speech, then fades after eight seconds of silence.
  React.useEffect(() => {
    if (!hasTranscript) return;
    setReveal(true);
    if (liveActive || speaking || archiveOpen || focusedIndex !== null) return;
    const fade = window.setTimeout(() => setReveal(false), 8500);
    return () => window.clearTimeout(fade);
  }, [hasTranscript, currentText, liveActive, speaking, archiveOpen, focusedIndex]);

  React.useEffect(() => {
    if (!liveActive && !speaking && focusedIndex === null && !archiveOpen) {
      const fade = window.setTimeout(() => setReveal(false), 8500);
      return () => window.clearTimeout(fade);
    }
  }, [liveActive, speaking, focusedIndex, archiveOpen]);

  const selectTurn = (index: number) => {
    setFocusedIndex(index === records.length - 1 ? null : index);
    setReveal(true);
    setArchiveOpen(false);
  };
  const returnToLive = () => {
    setFocusedIndex(null);
    setArchiveOpen(false);
    setReveal(true);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-[25] overflow-hidden"
      aria-label={ar ? 'مشهد الحوار التفاعلي' : 'Interactive speaking scene'}>
      {/* Conversation memory is just an orbit of tiny markers, not a message list. */}
      {records.length > 0 && (
        <div className="pointer-events-auto absolute left-1/2 top-[clamp(6px,.8vh,11px)] z-40 flex -translate-x-1/2 items-center gap-1.5">
          <button type="button"
            onClick={() => setArchiveOpen(v => !v)}
            aria-expanded={archiveOpen}
            aria-label={ar ? 'استعراض مسار الحوار' : 'Explore conversation trail'}
            title={ar ? 'مسار الحوار' : 'Conversation trail'}
            className="relative grid h-8 w-8 place-items-center rounded-full border border-white/65 bg-white/55 text-emerald-950 shadow-[0_3px_13px_rgba(11,63,51,.09)] backdrop-blur-xl transition-colors hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500">
            {archiveOpen ? <X size={14}/> : <History size={15}/>}
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 min-w-3.5 rounded-full bg-emerald-800 px-0.5 text-center text-[9px] font-bold leading-[14px] text-white tabular-nums">
              {Math.min(records.length, 99)}
            </span>
          </button>
          <AnimatePresence>
            {archiveOpen && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, scale: .87, x: -8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={reduceMotion ? {} : { opacity: 0, scale: .94 }}
                transition={{ duration: .2 }}
                className="flex max-w-[min(63vw,240px)] items-center gap-1 overflow-hidden rounded-full border border-white/70 bg-white/75 px-2 py-1.5 shadow-[0_5px_18px_rgba(11,63,51,.13)] backdrop-blur-xl"
                aria-label={ar ? 'العبارات السابقة' : 'Previous speech turns'}>
                {records.slice(-8).map((turn, i) => {
                  const index = Math.max(0, records.length - 8) + i;
                  return (
                    <button type="button" key={turn.liveTurnKey || index}
                      onClick={() => selectTurn(index)}
                      title={turn.text}
                      aria-label={(ar ? 'عرض العبارة ' : 'Show turn ') + (index + 1)}
                      aria-pressed={index === (focusedIndex ?? records.length - 1)}
                      className={'h-[10px] shrink-0 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 ' +
                        (index === (focusedIndex ?? records.length - 1)
                          ? 'w-6 bg-emerald-800' :
                          turn.role === 'user' ? 'w-[9px] bg-sky-500/70 hover:bg-sky-600' : 'w-[9px] bg-amber-500/70 hover:bg-amber-600')}/>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence mode="wait">
        {reveal && hasTranscript && (
          <motion.div
            key={(focusedIndex ?? record?.liveTurnKey ?? records.length) + ':' + placement}
            initial={reduceMotion ? false : { opacity: 0, y: 8, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? {} : { opacity: 0, y: -7, scale: .98 }}
            transition={{ duration: .29, ease: 'easeOut' }}
            className={'pointer-events-none absolute bottom-[clamp(68px,10vh,95px)] flex max-h-[142px] flex-col justify-end ' +
              (bilingual ? 'inset-x-[clamp(9px,2vw,23px)]' :
                placement === 'right' ? 'right-[clamp(8px,1.3vw,18px)] w-[min(49%,330px)]' :
                placement === 'left' ? 'left-[clamp(8px,1.3vw,18px)] w-[min(49%,330px)]' :
                'inset-x-[10%]')}
            role="status" aria-live="polite" aria-atomic="false"
          >
            {bilingual ? (
              <div dir="ltr" className="relative grid w-full grid-cols-2 items-end gap-[clamp(16px,3vw,42px)]">
                <div className="relative flex min-w-0 flex-col items-start justify-end text-left">
                  <div aria-hidden="true" className="pointer-events-none absolute -inset-3 -z-10 rounded-[65%] bg-[radial-gradient(ellipse,rgba(20,53,74,.88),rgba(20,53,74,.30)_55%,transparent_80%)] blur-[13px]"/>
                  <span className="mb-1 flex items-center gap-1.5 text-[9px] font-extrabold tracking-[.12em] text-[#c1f0ff] drop-shadow-[0_1px_3px_rgba(0,0,0,.8)]" dir="ltr">
                    <span className="h-[5px] w-[5px] rounded-full bg-sky-300 shadow-[0_0_8px_#7dd3fc]"/>
                    ENGLISH
                  </span>
                  <p dir="ltr" lang="en" title={englishLine}
                    className="line-clamp-3 max-w-full text-[clamp(11px,.93vw,13px)] font-semibold leading-[1.42] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,.85)]">
                    {englishLine}
                  </p>
                  <div aria-hidden="true" className="mt-2 h-[2px] w-[72%] max-w-[150px] rounded-full bg-gradient-to-r from-sky-200/75 via-cyan-200/35 to-transparent"/>
                </div>
                <div className="relative flex min-w-0 flex-col items-end justify-end text-right">
                  <div aria-hidden="true" className="pointer-events-none absolute -inset-3 -z-10 rounded-[65%] bg-[radial-gradient(ellipse,rgba(8,69,51,.9),rgba(8,69,51,.34)_55%,transparent_80%)] blur-[13px]"/>
                  <span className="mb-1 flex items-center gap-1.5 text-[9px] font-extrabold text-[#ffe5ac] drop-shadow-[0_1px_3px_rgba(0,0,0,.8)]">
                    {speaker}
                    <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-amber-300 shadow-[0_0_8px_#fde68a]"/>
                  </span>
                  <p dir="rtl" lang="ar" title={arabicLine}
                    className="line-clamp-3 max-w-full text-[clamp(12px,1.04vw,15px)] font-black leading-[1.4] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,.85)] arabic-font">
                    {arabicLine}
                  </p>
                  <div aria-hidden="true" className="mt-2 h-[2px] w-[72%] max-w-[150px] rounded-full bg-gradient-to-l from-amber-200/85 via-emerald-200/35 to-transparent"/>
                </div>
                {/* The moving light is the translation connection, not a divider between cells. */}
                <svg aria-hidden="true" className="pointer-events-none absolute bottom-[-5px] left-1/2 h-10 w-[clamp(40px,6vw,70px)] -translate-x-1/2 overflow-visible"
                  viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="qulMeaningLight" x1="0" y1="0" x2="100" y2="0">
                      <stop stopColor="#93c5fd" stopOpacity=".48"/>
                      <stop offset=".5" stopColor="#f5f9d3" stopOpacity=".9"/>
                      <stop offset="1" stopColor="#fcd34d" stopOpacity=".54"/>
                    </linearGradient>
                  </defs>
                  <path d="M2 24 Q50 -4 98 24" stroke="url(#qulMeaningLight)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 5"/>
                  <circle cx="50" cy="11" r="3" fill="#f7f6cf" opacity=".85" className={liveActive ? 'motion-safe:animate-pulse' : ''}/>
                </svg>
              </div>
            ) : (
              <div className={'relative flex flex-col justify-center ' +
                (placement === 'right' ? 'items-end text-right' :
                placement === 'left' ? 'items-start text-left' : 'items-center text-center')}>
                <div aria-hidden="true" className={'pointer-events-none absolute -inset-4 -z-10 rounded-[65%] blur-[13px] ' +
                  (isTutor
                    ? 'bg-[radial-gradient(ellipse,rgba(7,67,51,.86),rgba(7,67,51,.32)_50%,transparent_80%)]'
                    : 'bg-[radial-gradient(ellipse,rgba(16,55,79,.84),rgba(16,55,79,.3)_50%,transparent_78%)]')}/>
                <span className="mb-1 flex items-center gap-1.5 text-[10px] font-black text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,.8)]">
                  <span className={'h-[5px] w-[5px] rounded-full motion-safe:animate-pulse ' +
                    (isTutor ? 'bg-amber-300 shadow-[0_0_9px_#fde68a]' : 'bg-sky-300 shadow-[0_0_9px_#7dd3fc]')}/>
                  {speaker}
                </span>
                <p dir="auto" title={currentText}
                  className="line-clamp-3 w-full text-[clamp(12px,1.05vw,15px)] font-black leading-[1.4] text-white drop-shadow-[0_2px_5px_rgba(0,0,0,.85)] arabic-font">
                  {currentText}
                </p>
                <div aria-hidden="true" className={'mt-2 h-[2px] w-2/3 rounded-full ' +
                  (isTutor ? 'bg-gradient-to-r from-amber-300/20 via-amber-200/80 to-amber-300/20' :
                    'bg-gradient-to-r from-sky-300/20 via-sky-200/80 to-sky-300/20')}/>
              </div>
            )}
            {isTutor && !liveActive && (
              <button type="button" onClick={() => onPronounce(currentText)}
                aria-label={ar ? 'الاستماع مجددًا' : 'Replay utterance'}
                className={'pointer-events-auto mt-1 inline-flex h-6 w-6 items-center justify-center self-end rounded-full border border-white/25 bg-emerald-950/35 text-white backdrop-blur-md hover:bg-emerald-800/70 ' +
                  (!bilingual && placement === 'left' ? 'self-start' : '')}>
                <Volume2 size={13}/>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {focusedIndex !== null && (
        <button type="button" onClick={returnToLive}
          className="pointer-events-auto absolute bottom-[65px] left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/75 bg-white/75 px-3 py-1 text-[10px] font-bold text-emerald-950 backdrop-blur-md hover:bg-white"
          aria-label={ar ? 'العودة إلى أحدث عبارة' : 'Return to latest speech'}>
          {ar ? 'العودة للحوار الحي' : 'Back to live'}
        </button>
      )}
    </div>
  );
});
DialectSpeechOverlay.displayName = 'DialectSpeechOverlay';
