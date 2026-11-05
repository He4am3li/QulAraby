import React from 'react';
import { ChevronLeft, ChevronRight, History, Volume2 } from 'lucide-react';

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
  turns: SpeechTurn[];
  liveActive: boolean;
  speaking: boolean;
  currentSpeechText?: string;
  onPronounce: (text: string) => void;
}

const arabic = (text: string) => /[\u0600-\u06ff]/.test(text);

/**
 * The transcript lives on the stage, like film subtitles, not in a dock.
 * History navigation is a small control attached to the stage, no table or scrollbar.
 */
export const DialectSpeechOverlay: React.FC<Props> = React.memo(({
  countryId, lang, tutorName, turns, liveActive, speaking, currentSpeechText, onPronounce
}) => {
  const ar = lang === 'ar';
  const [cursor, setCursor] = React.useState<number | null>(null);
  const [engaged, setEngaged] = React.useState(false);
  const previousLength = React.useRef(turns.length);
  const previousLive = React.useRef(liveActive);

  React.useEffect(() => {
    setCursor(null);
    setEngaged(false);
    previousLength.current = turns.length;
    previousLive.current = false;
  }, [countryId]);

  React.useEffect(() => {
    if (liveActive && !previousLive.current) {
      setEngaged(true);
      setCursor(null);
    }
    previousLive.current = liveActive;
  }, [liveActive]);

  React.useEffect(() => {
    if (turns.length > previousLength.current) setEngaged(true);
    previousLength.current = turns.length;
  }, [turns.length]);

  React.useEffect(() => {
    if (speaking && currentSpeechText?.trim()) setEngaged(true);
  }, [speaking, currentSpeechText]);

  const records = React.useMemo(
    () => turns.filter(turn => typeof turn.text === 'string' && turn.text.trim()),
    [turns]
  );
  const selectedIndex = cursor === null ? records.length - 1 :
    Math.min(Math.max(0, cursor), records.length - 1);
  const record = records[selectedIndex];
  const latest = cursor === null;
  const actualSpeech = latest && speaking && currentSpeechText?.trim()
    ? currentSpeechText.trim() : record?.text || '';
  const isTutor = latest && speaking && currentSpeechText?.trim() ? true : record?.role !== 'user';
  const translated = record?.translationEn?.trim() &&
    record.translationEn.trim() !== actualSpeech.trim() ? record.translationEn.trim() : '';
  const visible = Boolean((engaged || cursor !== null || liveActive) && actualSpeech.trim());

  const browse = (direction: -1 | 1) => {
    if (!records.length) return;
    const i = cursor === null ? records.length - 1 : cursor;
    const next = Math.max(0, Math.min(records.length - 1, i + direction));
    setCursor(next === records.length - 1 ? null : next);
    setEngaged(true);
  };

  if (!visible && !records.length) return null;

  return (
    <div className="pointer-events-none absolute inset-x-[clamp(7px,1.4vw,18px)] bottom-[clamp(70px,8.5vh,86px)] z-[25] flex flex-col items-center gap-1"
      aria-label={ar ? 'كلمات المحادثة وترجمتها داخل المشهد' : 'Speech and translation on stage'}>
      {/* Keep the tutor artwork visible. Text is lit by a thin ambient gradient,
          not by a card, modal, speech balloon, or table. */}
      {visible && (
        <div className="relative flex w-full max-w-[520px] items-end justify-center gap-2 pb-1 text-center"
          role="status" aria-live="polite" aria-atomic="false">
          <div aria-hidden="true"
            className="pointer-events-none absolute -inset-x-4 -inset-y-3 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(12,43,38,.81)_0%,rgba(12,43,38,.38)_49%,transparent_76%)] blur-[9px]"/>
          <div className="relative min-w-0 flex-1">
            <div className="mb-0.5 flex items-center justify-center gap-1.5 text-[10px] font-black tracking-wide text-amber-200 drop-shadow-md">
              <span aria-hidden="true" className={'h-[5px] w-[5px] rounded-full ' +
                (isTutor ? 'bg-amber-300' : 'bg-sky-200')}/>
              {isTutor ? record?.speakerName || tutorName || (ar ? 'المعلم' : 'Tutor') :
                (ar ? 'الطالب' : 'Student')}
            </div>
            <p dir="auto" lang={arabic(actualSpeech) ? 'ar' : 'en'}
              className="line-clamp-2 text-[clamp(12px,1.06vw,15px)] font-black leading-[1.4] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,.9)] arabic-font"
              title={actualSpeech}>{actualSpeech}</p>
            {translated && (
              <p dir="auto" lang={arabic(translated) ? 'ar' : 'en'}
                className="mt-[2px] line-clamp-1 text-[clamp(10px,.82vw,12px)] font-semibold leading-[1.3] text-[#c4f3e5] drop-shadow-[0_1px_3px_rgba(0,0,0,.9)]"
                title={translated}>{translated}</p>
            )}
          </div>
          {isTutor && !liveActive && (
            <button type="button" className="pointer-events-auto relative mb-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/25 bg-emerald-950/40 text-white backdrop-blur-md hover:bg-emerald-900/70"
              aria-label={ar ? 'استمع إلى العبارة' : 'Replay this phrase'}
              onClick={() => onPronounce(actualSpeech)}>
              <Volume2 size={15}/>
            </button>
          )}
        </div>
      )}
      {records.length > 1 && (
        <div className="pointer-events-auto flex h-6 items-center justify-center gap-2 rounded-full border border-white/15 bg-emerald-950/25 px-2 text-white/85 shadow-sm backdrop-blur-md">
          <button type="button" onClick={() => browse(-1)}
            disabled={selectedIndex <= 0}
            aria-label={ar ? 'العبارة السابقة' : 'Previous dialogue turn'}
            className="rounded-full p-0.5 hover:bg-white/20 disabled:opacity-25">
            <ChevronRight size={13}/>
          </button>
          <History size={11} aria-hidden="true"/>
          <span className="min-w-[30px] text-center text-[9px] font-semibold tabular-nums" dir="ltr">
            {selectedIndex + 1}/{records.length}
          </span>
          <button type="button" onClick={() => browse(1)}
            disabled={selectedIndex >= records.length - 1}
            aria-label={ar ? 'العبارة التالية' : 'Next dialogue turn'}
            className="rounded-full p-0.5 hover:bg-white/20 disabled:opacity-25">
            <ChevronLeft size={13}/>
          </button>
        </div>
      )}
    </div>
  );
});
DialectSpeechOverlay.displayName = 'DialectSpeechOverlay';
