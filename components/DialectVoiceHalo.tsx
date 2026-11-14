import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, History, Volume2 } from 'lucide-react';
import { DialectVoiceOrb } from './DialectVoiceOrb';

type Turn = { role: string; text: string; translationEn?: string; speakerName?: string; liveTurnKey?: string };
interface Props {
  countryId: string;
  lang: 'ar' | 'en';
  tutorName?: string;
  turns: Turn[];
  active: boolean;
  connecting: boolean;
  error?: string | null;
  listening: boolean;
  speaking: boolean;
  loading: boolean;
  disabled: boolean;
  currentSpeechText?: string;
  onToggle: () => void;
  onPronounce: (text: string, speakerName?: string) => void;
}

const arabicText = (s: string) => /[\u0600-\u06ff]/.test(s);
const enText = (s: string) => /[A-Za-z]/.test(s);

/**
 * A voice recorder embedded in the character stage.
 *
 * The voice orb is the only visual machine. Speech blooms outward from it,
 * Arabic on its right, English on its left. Nothing resembles a table, chat
 * window, message bubble, or separate subtitle overlay.
 *
 * All history is still accessible through a tiny indexed memory control.
 * Word practice and text composition remain in their own permanent rail.
 */
export const DialectVoiceHalo: React.FC<Props> = React.memo(({
  countryId, lang, tutorName, turns, active, connecting, error, listening, speaking, loading,
  disabled, currentSpeechText, onToggle, onPronounce
}) => {
  const ar = lang === 'ar';
  const reduceMotion = useReducedMotion();
  const [historyIndex, setHistoryIndex] = React.useState<number | null>(null);
  const [held, setHeld] = React.useState(false);
  const [lastSeen, setLastSeen] = React.useState(0);

  const records = React.useMemo(() => turns.filter(turn => Boolean(turn.text?.trim())), [turns]);
  const newestIndex = records.length - 1;
  const index = historyIndex === null ? newestIndex : Math.min(historyIndex, newestIndex);
  const record = records[index];
  const freshSpeech = historyIndex === null && speaking && Boolean(currentSpeechText?.trim());
  const source = freshSpeech ? currentSpeechText!.trim() : record?.text || '';
  const displayedRecord = freshSpeech
    ? records.slice().reverse().find(turn => turn.role !== 'user' && turn.text.trim() === source
        && (!turn.speakerName || turn.speakerName === tutorName))
    : record;
  const translation = displayedRecord?.translationEn?.trim() || '';
  const translated = translation === source ? '' : translation;

  // An unrecognized language remains on the spoken line, rather than
  // fabricating a translation. Mixed-language tutor replies keep their wording.
  const rightText = arabicText(source) ? source
    : arabicText(translated) ? translated : '';
  const leftText = enText(source) && !arabicText(source) ? source
    : enText(translated) && !arabicText(translated) ? translated : '';
  const otherText = !rightText && !leftText ? source : '';
  const hasWords = Boolean(source.trim());
  const hasConversation = records.length > 0 || freshSpeech;

  React.useEffect(() => {
    setHistoryIndex(null);
    setHeld(false);
    setLastSeen(0);
  }, [countryId]);

  React.useEffect(() => {
    if (active || speaking || records.length > lastSeen) setHeld(true);
    setLastSeen(records.length);
  }, [active, speaking, records.length, lastSeen]);

  React.useEffect(() => {
    if (active || speaking || loading || historyIndex !== null) return;
    const id = window.setTimeout(() => setHeld(false), 6500);
    return () => window.clearTimeout(id);
  }, [active, speaking, loading, historyIndex, source]);

  const visible = hasWords && (held || active || speaking || historyIndex !== null);
  const isTutor = freshSpeech || record?.role !== 'user';
  const speaker = isTutor ? displayedRecord?.speakerName || tutorName || (ar ? 'المعلم' : 'Tutor')
    : (ar ? 'الطالب' : 'Student');

  const navigate = (direction: -1 | 1) => {
    if (newestIndex < 0) return;
    const next = Math.max(0, Math.min(newestIndex, index + direction));
    setHistoryIndex(next === newestIndex ? null : next);
    setHeld(true);
  };

  const motionProps = reduceMotion ? { initial: false } : {
    initial: { opacity: 0, y: 9, scaleX: .92 },
    exit: { opacity: 0, y: 5, scaleX: .96 },
    transition: { duration: .27, ease: 'easeOut' as const }
  };
  const textStyle = 'line-clamp-3 w-full text-[clamp(10px,.93vw,14px)] font-semibold leading-[1.38] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,.9)]';
  return (
    <section aria-label={ar ? 'مسجّل الحوار الحي' : 'Live voice recorder'}
      className="pointer-events-none absolute inset-x-0 bottom-[3px] z-30 h-[clamp(128px,19vh,174px)]">
      {/* A barely visible ground arc connects both language tracks to one orb. */}
      <div aria-hidden="true" className={'absolute inset-x-[9%] bottom-[39px] h-[1px] bg-gradient-to-r from-sky-400/0 via-sky-300/40 to-amber-300/0 transition-opacity duration-500 ' +
        (visible ? 'opacity-100' : 'opacity-0')} />
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={(historyIndex ?? displayedRecord?.liveTurnKey ?? newestIndex) + ':' + (freshSpeech ? 'spoken' : 'turn')}
            {...motionProps}
            animate={{ opacity: 1, y: 0, scaleX: 1 }}
            className="absolute inset-x-[2%] bottom-[89px] flex min-h-[48px] items-end justify-between gap-[82px]"
            role="status" aria-live="polite" aria-atomic="false" dir="ltr"
          >
            {/* English emerges from the left channel of the central recorder. */}
            <div className="relative flex min-w-0 flex-1 flex-col items-start text-left">
              {leftText && <>
                <div aria-hidden="true" className="pointer-events-none absolute -inset-4 -z-10 rounded-[50%] bg-[radial-gradient(ellipse,rgba(12,49,74,.78),rgba(12,49,74,.25)_50%,transparent_78%)] blur-[12px]"/>
                <span className="mb-1 flex items-center gap-1.5 text-[9px] font-extrabold tracking-[.08em] text-sky-100">
                  <span className={'h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,.9)] ' + (active ? 'motion-safe:animate-pulse' : '')}/>
                  {arabicText(source) ? 'TRANSLATION' : speaker}
                </span>
                <p lang="en" dir="ltr" title={leftText} className={textStyle}>{leftText}</p>
                <div aria-hidden="true" className="mt-2 h-[2px] w-[85%] rounded-full bg-gradient-to-r from-transparent via-sky-300/75 to-sky-200"/>
              </>}
              {otherText && !rightText && <p dir="auto" className={textStyle}>{otherText}</p>}
            </div>
            {/* Arabic emerges from the right channel, with RTL typography. */}
            <div className="relative flex min-w-0 flex-1 flex-col items-end text-right">
              {rightText && <>
                <div aria-hidden="true" className="pointer-events-none absolute -inset-4 -z-10 rounded-[50%] bg-[radial-gradient(ellipse,rgba(8,66,48,.83),rgba(8,66,48,.26)_50%,transparent_78%)] blur-[12px]"/>
                <span className="mb-1 flex items-center gap-1.5 text-[9px] font-extrabold text-amber-100">
                  {arabicText(source) ? speaker : (ar ? 'الترجمة' : 'Translation')}
                  <span className={'h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,.9)] ' + (active ? 'motion-safe:animate-pulse' : '')}/>
                </span>
                <p lang="ar" dir="rtl" title={rightText} className={textStyle + ' arabic-font'}>{rightText}</p>
                <div aria-hidden="true" className="mt-2 h-[2px] w-[85%] rounded-full bg-gradient-to-l from-transparent via-amber-300/75 to-amber-200"/>
              </>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keep feedback beside the original recorder, without adding an extra panel or button. */}
      {error && !active && !connecting && (
        <p role="alert" dir={ar ? 'rtl' : 'ltr'}
          className="pointer-events-auto absolute inset-x-[9%] bottom-[88px] z-40 mx-auto max-w-[420px] rounded-xl border border-amber-300/60 bg-slate-950/90 px-3 py-2 text-center text-[11px] font-semibold leading-relaxed text-white shadow-lg backdrop-blur-lg">
          {error}
        </p>
      )}
      {/* The audio control never moves. It remains the anchor of the entire experience. */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 flex items-center justify-center">
        <DialectVoiceOrb
          countryId={countryId}
          active={active} connecting={connecting} listening={listening} speaking={speaking} loading={loading}
          disabled={disabled} lang={lang} onToggle={onToggle}
        />
      </div>

      {/* A digital memory wheel, not another dialogue screen. */}
      {hasConversation && records.length > 0 && (
        <div className="pointer-events-auto absolute left-1/2 bottom-[85px] z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-emerald-950/10 bg-white/70 px-1 py-[2px] shadow-[0_4px_14px_rgba(12,68,55,.1)] backdrop-blur-xl">
          <button type="button" onClick={() => navigate(-1)} disabled={index <= 0}
            aria-label={ar ? 'العبارة السابقة' : 'Previous dialogue turn'}
            className="rounded-full p-0.5 text-emerald-900 hover:bg-emerald-50 disabled:opacity-25">
            <ChevronRight size={13}/>
          </button>
          <History size={11} className="text-emerald-950/75" aria-hidden="true"/>
          <span dir="ltr" className="min-w-[29px] text-center text-[9px] font-bold tabular-nums text-emerald-900">
            {index + 1}/{records.length}
          </span>
          <button type="button" onClick={() => navigate(1)} disabled={index >= newestIndex}
            aria-label={ar ? 'العبارة التالية' : 'Next dialogue turn'}
            className="rounded-full p-0.5 text-emerald-900 hover:bg-emerald-50 disabled:opacity-25">
            <ChevronLeft size={13}/>
          </button>
          {isTutor && !active && hasWords &&
            <button type="button" onClick={() => onPronounce(source, displayedRecord?.speakerName)}
              aria-label={ar ? 'إعادة تشغيل العبارة' : 'Replay this phrase'}
              className="rounded-full p-1 text-emerald-900 hover:bg-emerald-50">
              <Volume2 size={12}/>
            </button>}
        </div>
      )}
    </section>
  );
});
DialectVoiceHalo.displayName = 'DialectVoiceHalo';
