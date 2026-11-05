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
            initial={reduceMotion ? false : { opacity: 0, x: placement === 'right' ? 14 : placement === 'left' ? -14 : 0, y: 9, scale: .97 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={reduceMotion ? {} : { opacity: 0, y: -7, scale: .96 }}
            transition={{ duration: .25, ease: 'easeOut' }}
            className={
              'pointer-events-none absolute bottom-[clamp(68px,10vh,96px)] flex max-h-[132px] flex-col justify-center ' +
              (placement === 'right'
                ? 'right-[clamp(7px,1vw,14px)] w-[min(45%,295px)] items-end text-right'
                : placement === 'left'
                  ? 'left-[clamp(7px,1vw,14px)] w-[min(45%,295px)] items-start text-left'
                  : 'left-1/2 w-[min(80%,360px)] -translate-x-1/2 items-center text-center')
            }
            role="status" aria-live="polite" aria-atomic="false"
          >
            {/* An atmospheric light washes behind the captions. It has no edges,
                header bar, rectangular window, scroll area, or chat bubbles. */}
            <div aria-hidden="true" className={
              'absolute -inset-x-3 -inset-y-4 -z-10 rounded-[60%] blur-[14px] ' +
              (isTutor
                ? 'bg-[radial-gradient(ellipse,rgba(13,67,57,.86),rgba(13,67,57,.40)_49%,transparent_77%)]'
                : 'bg-[radial-gradient(ellipse,rgba(23,53,89,.84),rgba(23,53,89,.36)_49%,transparent_78%)]')
            }/>
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-extrabold text-white/85 drop-shadow-[0_1px_3px_rgba(0,0,0,.75)]">
              <span aria-hidden="true" className={'h-[5px] w-[5px] rounded-full motion-safe:animate-pulse ' +
                (isTutor ? 'bg-amber-200 shadow-[0_0_9px_rgba(253,230,138,.8)]'
                  : 'bg-sky-200 shadow-[0_0_9px_rgba(186,230,253,.8)]')}/>
              {speaker}
            </div>
            <p dir="auto" className="line-clamp-3 w-full text-[clamp(12px,1.05vw,15px)] font-black leading-[1.37] text-white drop-shadow-[0_2px_5px_rgba(0,0,0,.85)] arabic-font"
              title={currentText}>
              {currentText}
            </p>
            {translated && (
              <p dir="auto" className="mt-1 line-clamp-2 w-full text-[clamp(10px,.86vw,12px)] font-semibold leading-[1.3] text-[#d7fce7] drop-shadow-[0_1px_4px_rgba(0,0,0,.8)]"
                title={translated}>
                {translated}
              </p>
            )}
            <div aria-hidden="true" className={'mt-2 flex h-[10px] items-center gap-[3px] opacity-80 ' +
                (placement === 'right' ? 'justify-end' : placement === 'left' ? 'justify-start' : 'justify-center')}>
              {[1,2,3,4,5,6,7].map((v) => (
                <span key={v} className={'w-[3px] rounded-full bg-gradient-to-t ' +
                  (isTutor ? 'from-amber-300/10 to-amber-200' : 'from-sky-300/10 to-sky-200') +
                  (liveActive || speaking ? ' motion-safe:animate-pulse' : '')}
                  style={{ height: [4,8,5,10,6,9,4][v - 1] + 'px',
                    animationDelay: v * 110 + 'ms' }}/>
              ))}
            </div>
            {/* The glow's terminating trace visually points back to the speaker. */}
            {isTutor && <div aria-hidden="true" className={'absolute -bottom-[2px] h-px w-[34%] bg-gradient-to-r ' +
              (placement === 'right'
                ? 'right-0 from-transparent to-amber-300/80'
                : 'left-0 from-amber-300/80 to-transparent')}/>}
            {isTutor && !liveActive && (
              <button type="button" onClick={() => onPronounce(currentText)}
                aria-label={ar ? 'استمع مجددًا' : 'Replay utterance'}
                className="pointer-events-auto mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/25 bg-emerald-950/35 text-white backdrop-blur-md hover:bg-emerald-800/70">
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
