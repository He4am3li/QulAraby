import React from 'react';
import { Send, Mic, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';

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
}

/** A small, paged text conversation dock that never covers the characters or reference panel. */
export const DialectChatDock: React.FC<Props> = ({
  lang, name, messages, value, onChange, onSend, onDictate, onPronounce, loading, listening
}) => {
  const ar = lang === 'ar';
  const [olderPages, setOlderPages] = React.useState(0);
  React.useEffect(() => setOlderPages(0), [messages.length, name]);
  const totalPages = Math.max(1, Math.ceil(messages.length / 2));
  const offset = Math.min(olderPages, totalPages - 1);
  const end = Math.max(0, messages.length - offset * 2);
  const start = Math.max(0, end - 2);
  const visible = messages.slice(start, end);
  const samples = [
    { ar: 'كيف حالك اليوم؟', en: 'How are you?' },
    { ar: 'علمني كلمة مميزة بلهجتكم', en: 'Teach me a word' },
    { ar: 'ما هي أشهر أكلة عندكم؟', en: 'Popular food?' }
  ];

  return (
    <section aria-label={ar ? 'المحادثة النصية' : 'Text conversation'}
      className="flex h-full min-h-0 w-full flex-col gap-[5px] rounded-[18px] border border-white/80 bg-white/80 px-[clamp(8px,1vw,14px)] py-[clamp(6px,.8vh,10px)] shadow-[0_6px_28px_rgba(20,48,63,.08)] backdrop-blur-xl">
      <div className="flex min-h-0 flex-1 items-stretch gap-1.5">
        <div className="flex min-w-[55px] max-w-[72px] shrink-0 flex-col items-center justify-center gap-1">
          <span className="text-[11px] font-black text-[#15554d] arabic-font truncate max-w-full">{name || (ar ? 'المحادثة' : 'Chat')}</span>
          <div className="flex items-center gap-1">
            <button type="button" disabled={offset >= totalPages - 1} onClick={() => setOlderPages(p => Math.min(totalPages - 1, p + 1))}
              aria-label={ar ? 'رسائل أقدم' : 'Older messages'}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-25"><ChevronRight size={15}/></button>
            <button type="button" disabled={offset === 0} onClick={() => setOlderPages(p => Math.max(0, p - 1))}
              aria-label={ar ? 'رسائل أحدث' : 'Newer messages'}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-25"><ChevronLeft size={15}/></button>
          </div>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-1.5" dir={ar ? 'rtl' : 'ltr'}>
          {visible.map((msg, i) => (
            <div key={start + i}
              className={'flex min-w-0 min-h-0 items-center justify-between gap-1 rounded-lg border px-2 py-1 ' +
                (msg.role === 'user' ? 'border-blue-100 bg-blue-50' : 'border-emerald-100 bg-emerald-50/65')}>
              <div className="min-w-0">
                <span className="block truncate text-[10px] font-black text-slate-600">
                  {msg.role === 'user' ? (ar ? 'أنت' : 'You') : name}
                </span>
                <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-slate-800 arabic-font" dir="auto" title={msg.text}>{msg.text}</p>
              </div>
              {msg.role !== 'user' && (
                <button type="button" onClick={() => onPronounce(msg.text)} title={ar ? 'استمع للرد' : 'Hear reply'}
                  aria-label={ar ? 'تشغيل الرد صوتيًا' : 'Play reply'}
                  className="shrink-0 rounded-full p-1 text-emerald-700 hover:bg-emerald-100"><Volume2 size={15}/></button>
              )}
            </div>
          ))}
          {!visible.length && <div className="col-span-2 flex items-center justify-center text-xs text-slate-400">
            {ar ? 'اختر الشخصية وابدأ الحديث' : 'Choose a tutor to begin'}
          </div>}
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-[5px]">
        {samples.map((sample, i) => (
          <button type="button" key={i} onClick={() => onSend(ar ? sample.ar : sample.en)} disabled={loading}
            className="min-w-0 truncate rounded-lg bg-[#eef4f2] px-2 py-1 text-[10px] font-bold text-[#256257] transition-colors hover:bg-emerald-100 disabled:opacity-40 arabic-font"
            title={ar ? sample.ar : sample.en}>
            {ar ? sample.ar : sample.en}
          </button>
        ))}
      </div>

      <form className="flex h-[38px] shrink-0 items-center gap-2" onSubmit={event => {event.preventDefault(); onSend();}}>
        <input type="text" autoComplete="off" value={value} onChange={event => onChange(event.target.value)}
          placeholder={ar ? 'اكتب رسالتك هنا...' : 'Type your message...'}
          aria-label={ar ? 'رسالتك' : 'Your message'}
          className="h-full min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[12px] font-semibold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 arabic-font"/>
        <button type="button" onClick={onDictate}
          title={ar ? 'إملاء صوتي لتحويل الكلام إلى نص' : 'Voice dictation to text'}
          aria-label={ar ? 'إملاء صوتي' : 'Voice dictation'}
          className={'flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-xl transition-colors ' + (listening ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
          <Mic size={16}/>
        </button>
        <button type="submit" disabled={loading || !value.trim()}
          aria-label={ar ? 'إرسال الرسالة' : 'Send message'}
          className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-xl bg-[#106e5f] text-white hover:bg-emerald-700 disabled:opacity-40">
          <Send size={16}/>
        </button>
      </form>
    </section>
  );
};
