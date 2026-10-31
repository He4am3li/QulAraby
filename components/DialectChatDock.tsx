import React from 'react';
import { Send, ChevronLeft, ChevronRight, Volume2, AudioLines } from 'lucide-react';

export interface DialectChatMessage { role: string; text: string }
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
  lang, name, messages, value, onChange, onSend, onDictate, onPronounce, loading, listening, level = 0
}) => {
  const ar = lang === 'ar';
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [olderPages, setOlderPages] = React.useState(0);
  React.useEffect(() => { setOlderPages(0); }, [messages.length]);
  React.useEffect(() => { setHistoryOpen(false); }, [name]);
  const lastTutorReply = [...messages].reverse().find(msg => msg.role !== 'user')?.text || '';
  const totalPages = Math.max(1, Math.ceil(messages.length / 2));
  const offset = Math.min(olderPages, totalPages - 1);
  const end = Math.max(0, messages.length - offset * 2);
  const visible = messages.slice(Math.max(0, end - 2), end);
  const prompts = GUIDE[Math.min(2, Math.max(0, level))];

  return (
    <section aria-label={ar ? 'لوحة التدريب على المحادثة' : 'Guided conversation practice'}
      className="flex h-full min-h-0 w-full flex-col gap-[5px] overflow-hidden rounded-[17px] border border-emerald-100/80 bg-white/90 p-[clamp(7px,.8vh,11px)] shadow-[0_5px_24px_rgba(14,59,50,.07)] backdrop-blur-lg">

      <div className="flex h-[19px] shrink-0 items-center justify-between gap-2">
        <div className="min-w-0 flex items-center gap-2">
          <span className="shrink-0 text-[clamp(11px,.94vw,13px)] font-black text-[#155a4c] arabic-font">
            {historyOpen ? (ar ? 'سجل الحوار' : 'Conversation history') : (ar ? 'تدرّب على المهمة مع ' + (name || 'المعلم') : 'Practice the mission with ' + (name || 'your tutor'))}
          </span>

        </div>
        <button type="button" onClick={() => setHistoryOpen(v => !v)}
          className="shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 arabic-font"
          aria-pressed={historyOpen}>
          {historyOpen ? (ar ? 'العودة للتدريب' : 'Practice view') : (ar ? 'سجل الحوار' : 'Conversation history')}
        </button>
      </div>

      {historyOpen ? (
        <div className="flex min-h-0 flex-1 items-center gap-1.5">
          <button type="button" disabled={offset === totalPages - 1} onClick={() => setOlderPages(p => Math.min(totalPages - 1, p + 1))}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-20"
            aria-label={ar ? 'السابق' : 'Older'}><ChevronRight size={15}/></button>
          <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5">
            {visible.map((msg, i) => (
              <div key={end - visible.length + i}
                className={'flex min-w-0 flex-col justify-center overflow-hidden rounded-lg border px-2 py-1 ' +
                  (msg.role === 'user' ? 'border-blue-100 bg-blue-50' : 'border-emerald-100 bg-emerald-50')}>
                <span className="text-[9px] font-black text-emerald-700 arabic-font">{msg.role === 'user' ? (ar ? 'أنت' : 'You') : name}</span>
                <span className="line-clamp-2 text-[11px] font-medium leading-[1.35] text-slate-800 arabic-font" dir="auto">{msg.text}</span>
              </div>
            ))}
            {messages.length === 0 && <span className="col-span-2 self-center text-center text-xs text-slate-400 arabic-font">{ar ? 'لا توجد رسائل بعد' : 'No messages yet'}</span>}
          </div>
          <button type="button" disabled={offset === 0} onClick={() => setOlderPages(p => Math.max(0, p - 1))}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-20"
            aria-label={ar ? 'التالي' : 'Newer'}><ChevronLeft size={15}/></button>
        </div>
      ) : (
        <>
          <div className="flex min-h-0 flex-1 items-center gap-2 rounded-xl border border-slate-100 bg-[#f5f9f7] px-2.5 py-1" aria-live="polite">
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-black text-emerald-800 arabic-font">
                {ar ? 'آخر رد' : 'Latest reply'} {name ? (ar ? 'من ' + name : 'from ' + name) : ''}
              </span>
              <p className="line-clamp-2 text-[clamp(10px,.91vw,12px)] font-semibold leading-[1.3] text-slate-700 arabic-font" dir="auto" title={lastTutorReply}>
                {loading ? (ar ? 'يحضّر الرد...' : 'Preparing a response...') :
                  lastTutorReply || (ar ? 'تحدث مع الشخصية أو اكتب سؤالك لبدء التدريب.' : 'Talk to the character or type to begin practicing.')}
              </p>
            </div>
            {!!lastTutorReply && (
              <button type="button" onClick={() => onPronounce(lastTutorReply)}
                title={ar ? 'استمع للرد' : 'Play the reply'}
                aria-label={ar ? 'تشغيل آخر رد صوتيًا' : 'Hear latest reply'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 hover:bg-emerald-100">
                <Volume2 size={16}/>
              </button>
            )}
          </div>
          <div className="grid h-[26px] shrink-0 grid-cols-3 gap-[5px]" aria-label={ar ? 'عبارات تساعدك في المهمة' : 'Mission prompts'}>
            {prompts.map((prompt, i) => (
              <button type="button" key={i} onClick={() => onSend(ar ? prompt.ar : prompt.en)} disabled={loading}
                title={ar ? prompt.en : prompt.ar}
                className="min-w-0 truncate rounded-lg border border-emerald-100 bg-emerald-50/70 px-1.5 py-1 text-[clamp(9px,.77vw,11px)] font-bold leading-tight text-[#286c5f] transition-colors hover:border-emerald-300 hover:bg-emerald-100 disabled:opacity-40 arabic-font">
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
          className="h-full min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[12px] font-semibold text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 arabic-font"
        />
        <button type="button" onClick={onDictate}
          aria-label={ar ? 'إملاء صوتي لتحويل الكلام إلى نص' : 'Voice dictation'}
          title={ar ? 'إملاء صوتي' : 'Voice dictation'}
          className={'flex h-[36px] shrink-0 items-center justify-center gap-1 rounded-xl border px-2 transition-colors ' +
            (listening ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100')}>
          <AudioLines size={15}/>
          <span className="hidden text-[11px] font-bold sm:inline arabic-font">{ar ? 'إملاء' : 'Dictate'}</span>
        </button>
        <button type="submit" disabled={loading || !value.trim()}
          aria-label={ar ? 'إرسال الرسالة' : 'Send message'}
          className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-xl bg-[#116b58] text-white transition-colors hover:bg-emerald-700 disabled:opacity-40">
          <Send size={16}/>
        </button>
      </form>
    </section>
  );
};
