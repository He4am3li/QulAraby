import React from 'react';
import { Send, ChevronLeft, ChevronRight, Volume2, AudioLines, Sparkles, Radio, BookOpen, MessageCircle } from 'lucide-react';

export interface DialectChatMessage { role: string; text: string; translationEn?: string }
interface Props {
  lang: 'ar' | 'en';
  name?: string;
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
  vocabulary?: { dialect: string; en: string }[];
}

const GUIDE = [
  [
    { ar: 'السلام عليكم', en: 'Hello' },
    { ar: 'ما أشهر مكان سياحي هنا؟', en: 'What place should I visit?' },
    { ar: 'ممكن تساعدني؟', en: 'Can you help me?' }
  ],
  [
    { ar: 'ما الذي تنصحني بتجربته؟', en: 'What do you recommend?' },
    { ar: 'كيف أطلب هذا؟', en: 'How can I order this?' },
    { ar: 'بكم السعر؟', en: 'How much is it?' }
  ],
  [
    { ar: 'ما رأيك في هذه الفكرة؟', en: 'What is your opinion?' },
    { ar: 'ما أفضل خطة؟', en: 'What is the best plan?' },
    { ar: 'لماذا اخترت هذا الحل؟', en: 'Why that solution?' }
  ]
];

/** Training console: focused last reply, mission prompts and one input. History opens inside the same surface. */
export const DialectChatDock: React.FC<Props> = ({
  lang, name, messages, value, onChange, onSend, onDictate, onPronounce, loading, listening, level = 0, liveActive = false, vocabulary = []
}) => {
  const ar = lang === 'ar';
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [olderPages, setOlderPages] = React.useState(0);
  React.useEffect(() => { setOlderPages(0); }, [messages.length]);
  React.useEffect(() => { setHistoryOpen(false); }, [name]);
  React.useEffect(() => { if (liveActive) { setHistoryOpen(true); setOlderPages(0); } }, [liveActive]);
  const lastTutorMessage = [...messages].reverse().find(msg => msg.role !== 'user');
  const lastTutorReply = lastTutorMessage?.text || '';
  const lastTranslation = lastTutorMessage?.translationEn || '';
  const totalPages = Math.max(1, Math.ceil(messages.length / 2));
  const offset = Math.min(olderPages, totalPages - 1);
  const end = Math.max(0, messages.length - offset * 2);
  const visible = messages.slice(Math.max(0, end - 2), end);
  const prompts = vocabulary.length ? vocabulary.slice(0, 3).map(word => ({ ar: word.dialect, en: word.en })) : GUIDE[Math.min(2, Math.max(0, level))];

  return (
    <section aria-label={ar ? 'لوحة التدريب على المحادثة' : 'Guided conversation practice'}
      className="relative flex h-full min-h-0 w-full flex-col gap-[6px] overflow-hidden rounded-[20px] border border-white/20 bg-[linear-gradient(135deg,#071c28_0%,#103b46_52%,#102a3c_100%)] p-[clamp(7px,.8vh,11px)] text-white shadow-[0_8px_28px_rgba(7,28,40,.22)]">

      <div className="flex h-[23px] shrink-0 items-center justify-between gap-2 border-b border-white/10 pb-1">
        <div className="min-w-0 flex items-center gap-2">
          <span className="flex shrink-0 items-center gap-1.5 text-[clamp(11px,.94vw,13px)] font-black text-white arabic-font">
            {historyOpen ? <Radio size={14} className={liveActive ? 'animate-pulse text-cyan-300' : 'text-cyan-300'}/> : <BookOpen size={14} className="text-amber-300"/>}{historyOpen ? (ar ? 'محادثة تفاعلية' : 'Interactive conversation') : (ar ? 'استكشف كلمات اللهجة' : 'Explore dialect words')}
          </span>

        </div>
        <button type="button" onClick={() => setHistoryOpen(v => !v)}
          className="flex shrink-0 items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-cyan-100 transition hover:bg-white/20 arabic-font"
          aria-pressed={historyOpen}>
          {historyOpen ? <BookOpen size={12}/> : <MessageCircle size={12}/>}{historyOpen ? (ar ? 'الكلمات' : 'Words') : (ar ? 'الحوار' : 'Chat')}
        </button>
      </div>

      {historyOpen ? (
        <div className="flex min-h-0 flex-1 items-center gap-1.5">
          <button type="button" disabled={offset === totalPages - 1} onClick={() => setOlderPages(p => Math.min(totalPages - 1, p + 1))}
            className="rounded-lg border border-white/15 bg-white/10 p-1 text-cyan-100 hover:bg-white/20 disabled:opacity-20"
            aria-label={ar ? 'السابق' : 'Older'}><ChevronRight size={15}/></button>
          <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden rounded-xl border border-cyan-300/15 bg-black/25 p-1.5" aria-live="polite">
            <div className="grid grid-cols-2 gap-1 border-b border-white/15 pb-1 text-[10px] font-bold">
              <span className="text-right text-emerald-200" dir="rtl">العربية</span>
              <span className="text-left text-sky-200" dir="ltr">English</span>
            </div>
            {visible.map((msg, i) => (
              <div key={end - visible.length + i} className={"grid min-h-0 flex-1 grid-cols-2 gap-1 rounded-xl border p-1.5 transition-colors " + (msg.role === "user" ? "border-sky-300/25 bg-sky-300/10" : "border-emerald-300/25 bg-emerald-300/10")}>
                <div dir="rtl" className="min-w-0 text-right">
                  <span className="block text-[9px] font-bold text-emerald-300">{msg.role === 'user' ? 'الطالب' : (name || 'المعلم')}</span>
                  <p className="line-clamp-2 text-[11px] leading-snug text-white arabic-font" lang="ar">{/[\u0600-\u06ff]/.test(msg.text) ? msg.text : '…'}</p>
                </div>
                <div dir="ltr" className="min-w-0 border-l border-white/15 pl-1.5 text-left">
                  <span className="block text-[9px] font-bold text-sky-300">{msg.role === 'user' ? 'Student' : 'Tutor'}</span>
                  <p className="line-clamp-2 text-[11px] leading-snug text-white" lang="en">{msg.translationEn || (/^[^\u0600-\u06ff]+$/.test(msg.text) ? msg.text : 'Translation pending…')}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && <p className="self-center text-center text-[11px] text-slate-300">{ar ? 'ابدأ التحدث لعرض الحوار هنا' : 'Start speaking to see the conversation here'}</p>}
          </div>
          <button type="button" disabled={offset === 0} onClick={() => setOlderPages(p => Math.max(0, p - 1))}
            className="rounded-lg border border-white/15 bg-white/10 p-1 text-cyan-100 hover:bg-white/20 disabled:opacity-20"
            aria-label={ar ? 'التالي' : 'Newer'}><ChevronLeft size={15}/></button>
        </div>
      ) : (
        <>
          <div className="flex min-h-0 flex-1 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1" aria-live="polite">
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-black text-cyan-200 arabic-font">
                {ar ? 'آخر رد' : 'Latest reply'} {name ? (ar ? 'من ' + name : 'from ' + name) : ''}
              </span>
              <p className="line-clamp-2 text-[clamp(10px,.91vw,12px)] font-semibold leading-[1.3] text-white arabic-font" dir="auto" title={lastTutorReply}>
                {loading ? (ar ? 'يحضّر الرد...' : 'Preparing a response...') :
                  lastTutorReply || (ar ? 'تحدث مع الشخصية أو اكتب سؤالك لبدء التدريب.' : 'Talk to the character or type to begin practicing.')}
              </p>
              {!!lastTranslation && <p lang="en" dir="ltr" className="line-clamp-1 text-[clamp(9px,.82vw,11px)] font-medium text-cyan-200" title={lastTranslation}>{lastTranslation}</p>}
            </div>
            {!!lastTutorReply && (
              <button type="button" onClick={() => onPronounce(lastTutorReply)}
                title={ar ? 'استمع للرد' : 'Play the reply'}
                aria-label={ar ? 'تشغيل آخر رد صوتيًا' : 'Hear latest reply'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-200/20 text-cyan-100 hover:bg-cyan-200/30">
                <Volume2 size={16}/>
              </button>
            )}
          </div>
          <div className="grid h-[26px] shrink-0 grid-cols-3 gap-[5px]" aria-label={ar ? 'تدرب على كلمات اللهجة' : 'Dialect vocabulary practice'}>
            {prompts.map((prompt, i) => (
              <button type="button" key={i} onClick={() => onSend(ar ? prompt.ar : prompt.en)} disabled={loading}
                title={ar ? prompt.en : prompt.ar}
                className="min-w-0 truncate rounded-lg border border-cyan-200/20 bg-white/10 px-1.5 py-1 text-[clamp(9px,.77vw,11px)] font-bold leading-tight text-white transition-colors hover:border-cyan-200/50 hover:bg-white/20 disabled:opacity-40 arabic-font">
                {ar ? prompt.ar : prompt.en}
              </button>
            ))}
          </div>
        </>
      )}

      <form className="flex h-[38px] shrink-0 items-center gap-[6px]"
        onSubmit={event => { event.preventDefault(); onSend(); }}>
        <input
          type="text" autoComplete="off" value={value} onChange={event => onChange(event.target.value)}
          placeholder={ar ? 'اكتب ما تريد قوله...' : 'Type what you want to say...'}
          aria-label={ar ? 'رسالتك' : 'Your message'}
          className="h-full min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3 text-[12px] font-semibold text-white placeholder:text-white/55 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20 arabic-font"
        />
        <button type="button" onClick={onDictate}
          aria-label={ar ? 'إملاء صوتي لتحويل الكلام إلى نص' : 'Voice dictation'}
          title={ar ? 'إملاء صوتي' : 'Voice dictation'}
          className={'flex h-[36px] shrink-0 items-center justify-center gap-1 rounded-xl border px-2 transition-colors ' +
            (listening ? 'border-rose-300/50 bg-rose-400/20 text-rose-100' : 'border-white/20 bg-white/10 text-white hover:bg-white/20')}>
          <AudioLines size={15}/>
          <span className="hidden text-[11px] font-bold sm:inline arabic-font">{ar ? 'إملاء' : 'Dictate'}</span>
        </button>
        <button type="submit" disabled={loading || !value.trim()}
          aria-label={ar ? 'إرسال الرسالة' : 'Send message'}
          className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 transition-colors hover:bg-cyan-300 disabled:opacity-40">
          <Send size={16}/>
        </button>
      </form>
    </section>
  );
};
