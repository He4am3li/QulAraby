import React from 'react';
import { AudioLines, ChevronLeft, ChevronRight, Send, Volume2, Waves } from 'lucide-react';

export interface DialectChatMessage {
  role: string;
  text: string;
  translationEn?: string;
  speakerName?: string;
  liveTurnKey?: string;
}

interface Props {
  lang: 'ar' | 'en';
  name?: string;
  countryId?: string;
  messages: DialectChatMessage[];
  value: string;
  onChange: (value: string) => void;
  onSend: (text?: string) => void;
  onDictate: () => void;
  onPronounce: (text: string) => void;
  loading: boolean;
  listening: boolean;
  level?: number;
  countryName?: string;
  liveActive?: boolean;
  vocabulary?: { dialect: string; en: string; roman?: string }[];
}

const STARTERS = [
  { dialect: 'ماذا تعني هذه الكلمة بلهجتكم؟', en: 'What does this word mean in your dialect?' },
  { dialect: 'حدثني عن شيء مشهور عندكم', en: 'Tell me something famous about your country' },
  { dialect: 'كيف أقول هذه العبارة بطريقة طبيعية؟', en: 'How would a local say this naturally?' }
];

const hasArabic = (text: string) => /[\u0621-\u064A]/.test(text);

/**
 * One continuous glass training surface. Speech appears as a subtle subtitle
 * strip instead of opening a second dark table or covering the characters.
 * Practice phrases never disappear while the student is talking.
 */
export const DialectChatDock: React.FC<Props> = React.memo(({
  lang, name, countryId, messages, value, onChange, onSend, onDictate,
  onPronounce, loading, listening, liveActive = false, vocabulary = []
}) => {
  const ar = lang === 'ar';
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [historyOffset, setHistoryOffset] = React.useState(0);
  const previousLive = React.useRef(false);

  React.useEffect(() => {
    setHistoryOffset(0);
  }, [countryId]);

  React.useEffect(() => {
    if (liveActive && !previousLive.current) setHistoryOffset(0);
    previousLive.current = liveActive;
  }, [liveActive]);

  const turns = React.useMemo(() => messages.filter(msg => Boolean(msg.text?.trim())), [messages]);
  const maxOffset = Math.max(0, turns.length - 1);
  const offset = Math.min(historyOffset, maxOffset);
  const activeTurn = turns[turns.length - 1 - offset];
  const tutor = activeTurn?.role !== 'user';
  const translation = activeTurn?.translationEn?.trim() &&
    activeTurn.translationEn.trim() !== activeTurn.text.trim()
    ? activeTurn.translationEn.trim() : '';
  const suggestions = vocabulary.length ? vocabulary.slice(0, 3) : STARTERS;

  const selectSuggestion = (phrase: { dialect: string; en: string }) => {
    const prepared = vocabulary.length
      ? ar ? 'كيف أستخدم «' + phrase.dialect + '» في جملة؟'
        : 'How do I use "' + phrase.dialect + '" in a sentence?'
      : ar ? phrase.dialect : phrase.en;
    onChange(prepared);
    inputRef.current?.focus();
  };

  return (
    <section
      aria-label={ar ? 'تدرب مع الشخصية وسجل المحادثة' : 'Practice with the tutor and conversation'}
      className="relative flex h-full min-h-0 w-full flex-col gap-[clamp(3px,.45vh,6px)] overflow-hidden rounded-[19px] border border-white/75 bg-[linear-gradient(118deg,rgba(255,255,255,.91),rgba(236,247,243,.87)_58%,rgba(249,253,250,.94))] px-[clamp(9px,1.25vw,15px)] py-[clamp(7px,.8vh,11px)] text-slate-900 shadow-[0_7px_25px_rgba(16,65,55,.08),inset_0_1px_0_rgba(255,255,255,.9)] backdrop-blur-xl"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -top-12 left-1/4 h-20 w-52 rounded-full bg-emerald-200/30 blur-3xl" />

      <header className="relative flex h-[23px] shrink-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-950/90 text-emerald-50">
            <Waves size={13} className={liveActive ? 'animate-pulse' : ''}/>
          </span>
          <h3 className="min-w-0 truncate text-[clamp(11px,.94vw,13px)] font-black text-emerald-950 arabic-font">
            {ar ? 'تدرّب مع ' : 'Practice with '}{name || (ar ? 'المعلم' : 'the tutor')}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[10px] font-semibold text-slate-500">
          {liveActive && <span className="inline-flex items-center gap-1 text-emerald-700" role="status">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"/>
            {ar ? 'محادثة مباشرة' : 'Live conversation'}
          </span>}
          {!liveActive && turns.length > 0 && <span>{ar ? 'آخر الحوار' : 'Recent dialogue'}</span>}
        </div>
      </header>

      {/* Text is integrated into the surface as quiet cinematic subtitles.
          No nested table, heavy block, separate dialogue card or scrollbar. */}
      <div
        className="relative flex min-h-0 flex-1 items-center gap-[clamp(5px,.8vw,10px)] overflow-hidden border-y border-emerald-950/[.075] py-[3px]"
        aria-label={ar ? 'الكلام والترجمة' : 'Speech and translation'}
      >
        <span aria-hidden="true"
          className={'h-[65%] w-[3px] shrink-0 rounded-full ' +
            (activeTurn ? tutor ? 'bg-amber-500/70' : 'bg-emerald-600/75' : 'bg-emerald-500/20')}
        />
        <div className="min-w-0 flex-1 overflow-hidden">
          {activeTurn ? (
            <>
              <p className="mb-[1px] truncate text-[9px] font-bold text-emerald-800/80">
                {tutor ? activeTurn.speakerName || name || (ar ? 'المعلم' : 'Tutor') : (ar ? 'الطالب' : 'Student')}
              </p>
              <p dir="auto" lang={hasArabic(activeTurn.text) ? 'ar' : 'en'}
                className="line-clamp-2 text-[clamp(11px,1vw,13px)] font-bold leading-[1.3] text-slate-800 arabic-font"
                title={activeTurn.text}>{activeTurn.text}</p>
              {translation && <p dir="auto" lang={hasArabic(translation) ? 'ar' : 'en'}
                className="mt-[1px] line-clamp-1 text-[clamp(10px,.82vw,11px)] font-medium leading-tight text-slate-500"
                title={translation}>{translation}</p>}
            </>
          ) : (
            <p className="line-clamp-2 text-[clamp(11px,1vw,13px)] font-medium leading-5 text-slate-500 arabic-font">
              {loading ? ar ? 'يحضّر المعلم رده...' : 'Preparing a reply...' :
                ar ? 'ابدأ بالحديث، وستظهر الكلمات هنا مع الترجمة.' :
                  'Start talking. Speech and translations will appear here.'}
            </p>
          )}
        </div>
        {activeTurn && tutor && <button type="button" onClick={() => onPronounce(activeTurn.text)}
          aria-label={ar ? 'الاستماع لعبارة المعلم' : 'Replay tutor phrase'}
          title={ar ? 'استمع' : 'Listen'}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-emerald-900/80 transition hover:bg-white/80 hover:text-emerald-900">
          <Volume2 size={15}/>
        </button>}
        {turns.length > 1 && <div className="flex shrink-0 flex-col items-center justify-center gap-[2px] border-s border-emerald-950/10 ps-1">
          <button type="button" disabled={offset === maxOffset}
            onClick={() => setHistoryOffset(v => Math.min(maxOffset, v + 1))}
            aria-label={ar ? 'العبارة السابقة' : 'Previous speech'}
            className="rounded-full p-[1px] text-emerald-900/70 hover:bg-emerald-100 disabled:opacity-20">
            <ChevronRight size={14}/>
          </button>
          <span dir="ltr" className="text-[9px] font-semibold tabular-nums text-slate-400">
            {turns.length - offset}/{turns.length}
          </span>
          <button type="button" disabled={offset === 0}
            onClick={() => setHistoryOffset(v => Math.max(0, v - 1))}
            aria-label={ar ? 'العبارة التالية' : 'Next speech'}
            className="rounded-full p-[1px] text-emerald-900/70 hover:bg-emerald-100 disabled:opacity-20">
            <ChevronLeft size={14}/>
          </button>
        </div>}
      </div>

      {/* Suggestions remain visible while speaking, rather than being replaced by chat. */}
      <div className="relative flex h-[27px] shrink-0 items-center gap-[5px]"
        aria-label={ar ? 'عبارات تدريب' : 'Practice expressions'}>
        {suggestions.map((suggestion, index) => (
          <button type="button" key={index} onClick={() => selectSuggestion(suggestion)}
            title={ar ? suggestion.en : suggestion.dialect}
            className="min-w-0 flex-1 truncate rounded-full border border-emerald-900/10 bg-white/65 px-2.5 py-[5px] text-[clamp(10px,.77vw,12px)] font-bold leading-tight text-emerald-950 transition-colors hover:border-emerald-400 hover:bg-white arabic-font">
            {ar ? suggestion.dialect : suggestion.en}
          </button>
        ))}
      </div>

      <form
        className="relative flex h-[35px] shrink-0 items-center gap-[4px] rounded-full border border-emerald-950/10 bg-white/80 py-[2px] pe-[3px] ps-2 shadow-[0_2px_6px_rgba(15,70,55,.045)]"
        onSubmit={event => { event.preventDefault(); if (value.trim() && !loading) { setHistoryOffset(0); onSend(); } }}
      >
        <input ref={inputRef} type="text" autoComplete="off" dir="auto" value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={ar ? 'اسأل بلغتك...' : 'Ask in your own language...'}
          aria-label={ar ? 'رسالتك' : 'Your message'}
          className="h-full min-w-0 flex-1 bg-transparent px-2 text-[12px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none arabic-font"/>
        <button type="button" onClick={onDictate} title={ar ? 'إملاء صوتي' : 'Voice dictation'}
          aria-label={ar ? 'إملاء صوتي' : 'Dictate'}
          className={'grid h-[29px] w-[30px] shrink-0 place-items-center rounded-full transition-colors ' +
            (listening ? 'bg-rose-100 text-rose-800' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-900')}>
          <AudioLines size={16}/>
        </button>
        <button type="submit" disabled={loading || !value.trim()}
          aria-label={ar ? 'إرسال الرسالة' : 'Send message'}
          className="grid h-[29px] w-[30px] shrink-0 place-items-center rounded-full bg-emerald-900 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-35">
          <Send size={14}/>
        </button>
      </form>
    </section>
  );
});
DialectChatDock.displayName = 'DialectChatDock';
