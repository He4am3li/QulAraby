import React from 'react';
import { AudioLines, BookOpen, ChevronLeft, ChevronRight, MessageCircle, Send, Volume2, Waves } from 'lucide-react';

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
  { ar: 'ماذا تعني هذه الكلمة بلهجتكم؟', en: 'What does this word mean in your dialect?' },
  { ar: 'حدثني عن شيء مشهور عندكم', en: 'Tell me something famous about your country' },
  { ar: 'كيف أقول هذه العبارة بطريقة طبيعية؟', en: 'How would a local say this naturally?' },
];

const hasArabic = (value: string) => /[\u0621-\u064A]/.test(value);

/**
 * A quiet practice strip until conversation starts.
 * During a live session it becomes a lightweight, bilingual conversation timeline,
 * not a two-column table or a second chat window.
 */
export const DialectChatDock: React.FC<Props> = React.memo(({
  lang, name, countryId, messages, value, onChange, onSend, onDictate,
  onPronounce, loading, listening, liveActive = false, vocabulary = []
}) => {
  const ar = lang === 'ar';
  const [view, setView] = React.useState<'practice' | 'conversation'>('practice');
  const [back, setBack] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const previousLive = React.useRef(false);
  const lastCount = React.useRef(messages.length);

  // An active voice call reveals the transcript automatically. Ending the call
  // does not erase it, and changing the selected tutor must never hide it.
  React.useEffect(() => {
    if (liveActive && !previousLive.current) {
      setView('conversation');
      setBack(0);
    }
    previousLive.current = liveActive;
  }, [liveActive]);

  React.useEffect(() => {
    setView('practice');
    setBack(0);
    previousLive.current = false;
  }, [countryId]);

  // Follow incoming turns, but don't yank the user away from older pages
  // when a partial transcript is updated word by word.
  React.useEffect(() => {
    if (messages.length !== lastCount.current) {
      if (back === 0) setBack(0);
      lastCount.current = messages.length;
    }
  }, [messages.length, back]);

  const activeMessages = React.useMemo(
    () => messages.filter(message => !!message.text?.trim()),
    [messages]
  );
  const maxBack = Math.max(0, Math.ceil(activeMessages.length / 2) - 1);
  const offset = Math.min(back, maxBack);
  const lastIndex = Math.max(0, activeMessages.length - offset * 2);
  const visible = activeMessages.slice(Math.max(0, lastIndex - 2), lastIndex);
  const pageCount = Math.max(1, Math.ceil(activeMessages.length / 2));
  const lastTutor = [...activeMessages].reverse().find(m => m.role !== 'user');
  const suggestions = vocabulary.length ? vocabulary.slice(0, 3) : STARTERS.map(x => ({
    dialect: x.ar, en: x.en
  }));

  const selectSuggestion = (phrase: { dialect: string; en: string }) => {
    // Insert a useful question, don't silently send a bare vocabulary item.
    const prepared = vocabulary.length
      ? ar ? 'كيف أستخدم «' + phrase.dialect + '» في جملة؟'
        : 'How do I use "' + phrase.dialect + '" in a sentence?'
      : ar ? phrase.dialect : phrase.en;
    onChange(prepared);
    inputRef.current?.focus();
  };

  return (
    <section aria-label={ar ? 'مساحة تدريب اللهجة وسجل الحوار' : 'Dialect practice and conversation'}
      className="relative flex h-full min-h-0 w-full flex-col gap-[5px] overflow-hidden rounded-[20px] border border-white/80 bg-[linear-gradient(125deg,rgba(255,255,255,.97)_0%,rgba(235,246,241,.96)_56%,rgba(243,249,247,.96)_100%)] p-[clamp(7px,.75vh,10px)] text-slate-900 shadow-[0_5px_23px_rgba(14,70,59,.1),inset_0_1px_0_rgba(255,255,255,.95)]">
      <div aria-hidden="true" className="pointer-events-none absolute -left-9 -top-11 h-28 w-40 rounded-full bg-emerald-300/15 blur-3xl"/>
      <header className="relative flex h-[27px] shrink-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[10px] border border-emerald-200/90 bg-emerald-900 text-white shadow-[0_2px_8px_rgba(5,60,49,.16)]">
            {view === 'conversation' ? <Waves size={15}/> : <BookOpen size={15}/>}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[clamp(11px,.9vw,13px)] font-black leading-tight text-emerald-950 arabic-font">
              {view === 'conversation'
                ? (ar ? 'سجل الحوار' : 'Conversation')
                : (ar ? 'استكشف وتدرّب' : 'Discover & practice')}
            </h3>
            <span className="block truncate text-[9px] font-semibold text-slate-500">
              {view === 'conversation'
                ? liveActive ? (ar ? 'محادثة مباشرة' : 'Live dialogue') : (ar ? 'آخر ما قيل' : 'Recent exchanges')
                : (ar ? 'اختر عبارة لتبدأ بها' : 'Choose a phrase to try')}
            </span>
          </div>
          {liveActive && <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"/>
            {ar ? 'متصل' : 'LIVE'}
          </span>}
        </div>
        <nav className="flex shrink-0 items-center rounded-[11px] border border-emerald-950/10 bg-white/80 p-[3px]" aria-label={ar ? 'عرض اللوحة' : 'Panel view'}>
          <button type="button" onClick={() => setView('practice')} aria-pressed={view === 'practice'}
            className={'rounded-[8px] px-2.5 py-1 text-[10px] font-black transition-colors arabic-font ' +
              (view === 'practice' ? 'bg-emerald-900 text-white shadow-sm' : 'text-slate-500 hover:text-emerald-900')}>
            {ar ? 'الكلمات' : 'Words'}
          </button>
          <button type="button" onClick={() => { setView('conversation'); setBack(0); }}
            aria-pressed={view === 'conversation'}
            className={'flex items-center gap-1 rounded-[8px] px-2.5 py-1 text-[10px] font-black transition-colors arabic-font ' +
              (view === 'conversation' ? 'bg-emerald-900 text-white shadow-sm' : 'text-slate-500 hover:text-emerald-900')}>
            {ar ? 'الحوار' : 'Dialogue'}
            {messages.length > 0 && <span className="rounded-md bg-current/10 px-1 tabular-nums">{Math.min(messages.length, 99)}</span>}
          </button>
        </nav>
      </header>

      {view === 'conversation' ? (
        <div className="relative flex min-h-0 flex-1 items-stretch gap-1.5 overflow-hidden" aria-label={ar ? 'الرسائل الأخيرة' : 'Recent messages'}>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-[4px] overflow-hidden rounded-[11px] border border-emerald-900/10 bg-[#102c30] p-[5px] shadow-[inset_0_1px_6px_rgba(0,0,0,.13)]">
            {visible.length ? visible.map((msg, i) => {
              const tutor = msg.role !== 'user';
              const translated = msg.translationEn?.trim() && msg.translationEn.trim() !== msg.text.trim()
                ? msg.translationEn.trim() : '';
              return (
                <div key={msg.liveTurnKey || String(lastIndex - visible.length + i)}
                  className={'flex min-h-0 flex-1 items-center gap-2 overflow-hidden rounded-[8px] px-[7px] py-[3px] ' +
                    (tutor ? 'bg-white/[.09] text-white' : 'bg-emerald-300/[.13] text-emerald-50')}>
                  <span className={'h-5 w-[3px] shrink-0 rounded-full ' + (tutor ? 'bg-amber-300' : 'bg-emerald-300')}/>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex items-baseline gap-1.5">
                      <span className={'max-w-[28%] shrink-0 truncate text-[9px] font-black ' +
                        (tutor ? 'text-amber-200' : 'text-emerald-200')}>
                        {tutor ? msg.speakerName || name || (ar ? 'المعلم' : 'Tutor') : (ar ? 'الطالب' : 'Student')}
                      </span>
                      <p dir="auto" lang={hasArabic(msg.text) ? 'ar' : 'en'}
                        className="min-w-0 flex-1 truncate text-[11px] font-semibold leading-[1.3] arabic-font" title={msg.text}>
                        {msg.text}
                      </p>
                    </div>
                    {translated && <p dir="auto" className="truncate text-[9px] leading-[1.3] text-sky-200/85" title={translated}>{translated}</p>}
                  </div>
                  {tutor && <button type="button" onClick={() => onPronounce(msg.text)}
                    title={ar ? 'سماع هذه العبارة' : 'Play phrase'}
                    aria-label={ar ? 'سماع عبارة المعلم' : 'Play tutor phrase'}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-100 transition hover:bg-white/15">
                    <Volume2 size={13}/>
                  </button>}
                </div>
              );
            }) : <div className="flex h-full items-center justify-center gap-2 text-[11px] text-white/65 arabic-font">
              <MessageCircle size={16}/>
              {ar ? 'ابدأ التحدث لتظهر كلماتكما هنا' : 'Start talking to see your conversation'}
            </div>}
          </div>
          {pageCount > 1 && (
            <div className="flex w-7 shrink-0 flex-col items-center justify-center gap-1">
              <button type="button" disabled={offset >= maxBack} onClick={() => setBack(v => Math.min(maxBack, v + 1))}
                aria-label={ar ? 'الرسائل السابقة' : 'Older messages'}
                className="grid h-6 w-6 place-items-center rounded-[8px] border border-emerald-900/10 bg-white text-emerald-900 disabled:opacity-30"><ChevronRight size={13}/></button>
              <span dir="ltr" className="text-[9px] font-bold tabular-nums text-slate-500">{pageCount - offset}/{pageCount}</span>
              <button type="button" disabled={offset === 0} onClick={() => setBack(v => Math.max(0, v - 1))}
                aria-label={ar ? 'الرسائل الأحدث' : 'Newer messages'}
                className="grid h-6 w-6 place-items-center rounded-[8px] border border-emerald-900/10 bg-white text-emerald-900 disabled:opacity-30"><ChevronLeft size={13}/></button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col justify-center gap-[5px] overflow-hidden">
          <div className="flex min-h-0 flex-1 items-center gap-2 rounded-[11px] border border-emerald-800/10 bg-white/75 px-2.5 py-1">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] font-bold text-emerald-800 arabic-font">
                {lastTutor ? (ar ? 'آخر رد من المعلم' : 'Tutor’s latest reply') : (ar ? 'مساحة حوار حقيقية' : 'A real conversation')}
              </p>
              <p dir="auto" className="truncate text-[11px] font-semibold text-slate-700 arabic-font" title={lastTutor?.text}>
                {loading ? (ar ? 'يستمع إلى سؤالك...' : 'Preparing a reply...') :
                  lastTutor?.text || (ar ? 'اسأل عن اللهجة أو الطعام أو الحياة اليومية' : 'Ask about dialect, food or everyday life')}
              </p>
            </div>
            {lastTutor && <button type="button" onClick={() => onPronounce(lastTutor.text)}
              aria-label={ar ? 'الاستماع إلى آخر رد' : 'Replay latest reply'}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] border border-emerald-100 bg-emerald-50 text-emerald-900 hover:bg-emerald-100">
              <Volume2 size={15}/>
            </button>}
          </div>
          <div className="flex h-[29px] shrink-0 items-center gap-[5px]" aria-label={ar ? 'عبارات للتدريب' : 'Practice phrases'}>
            {suggestions.map((suggestion, index) => (
              <button type="button" key={index} onClick={() => selectSuggestion(suggestion)}
                title={ar ? suggestion.en : suggestion.dialect}
                className="min-w-0 flex-1 truncate rounded-[10px] border border-emerald-900/10 bg-white/80 px-2 py-1 text-[clamp(10px,.77vw,12px)] font-bold text-emerald-900 shadow-[0_1px_2px_rgba(10,60,45,.04)] transition-colors hover:border-emerald-500 hover:bg-emerald-50 arabic-font">
                {ar ? suggestion.dialect : suggestion.en}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="relative flex h-[36px] shrink-0 items-center gap-[5px] rounded-[12px] border border-emerald-950/10 bg-white/80 p-[3px] shadow-sm"
        onSubmit={event => { event.preventDefault(); if (value.trim() && !loading) { setView('conversation'); setBack(0); onSend(); } }}>
        <input ref={inputRef} type="text" autoComplete="off" value={value} onChange={event => onChange(event.target.value)}
          dir="auto" placeholder={ar ? 'اسأل بلغتك...' : 'Ask in your language...'}
          aria-label={ar ? 'رسالتك' : 'Your message'}
          className="h-full min-w-0 flex-1 bg-transparent px-2 text-[12px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none arabic-font"/>
        <button type="button" onClick={onDictate} title={ar ? 'إملاء صوتي' : 'Voice dictation'}
          aria-label={ar ? 'إملاء صوتي' : 'Dictate voice message'}
          className={'grid h-[29px] w-[32px] shrink-0 place-items-center rounded-[9px] transition-colors ' +
            (listening ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600 hover:bg-emerald-100')}>
          <AudioLines size={16}/>
        </button>
        <button type="submit" disabled={loading || !value.trim()}
          aria-label={ar ? 'إرسال الرسالة' : 'Send message'}
          className="grid h-[29px] w-[32px] shrink-0 place-items-center rounded-[9px] bg-emerald-900 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-35">
          <Send size={15}/>
        </button>
      </form>
    </section>
  );
});
DialectChatDock.displayName = 'DialectChatDock';
