import React from 'react';
import { AudioLines, Send } from 'lucide-react';

interface Props {
  lang: 'ar' | 'en';
  name?: string;
  countryId?: string;
  messages: { role: string; text: string; translationEn?: string; speakerName?: string }[];
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
/** The student keeps their teaching controls, never a duplicate chat transcript. */
export const DialectChatDock: React.FC<Props> = React.memo(({
  lang, name, value, onChange, onSend, onDictate,
  loading, listening
}) => {
  const ar = lang === 'ar';
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <section
      aria-label={ar ? 'مراسلة الشخصية' : 'Tutor messages'}
      className="relative flex h-full min-h-0 w-full flex-col justify-center gap-[clamp(5px,.6vh,8px)] overflow-hidden rounded-b-[18px] bg-[linear-gradient(180deg,rgba(229,240,233,.96),rgba(247,251,248,.99))] px-[clamp(7px,1vw,13px)] py-[clamp(5px,.7vh,8px)]"
    >
      <form
        className="flex h-[42px] min-h-0 shrink-0 items-center gap-1.5 rounded-full border border-white/85 bg-white/90 p-[3px] shadow-[0_2px_9px_rgba(16,65,55,.09)]"
        onSubmit={event => { event.preventDefault(); if (value.trim() && !loading) onSend(); }}
      >
        <input
          ref={inputRef} type="text" dir="auto" autoComplete="off"
          value={value} onChange={event => onChange(event.target.value)}
          placeholder={ar
            ? 'اسأل ' + (name || 'المعلم') + ' بلغتك...'
            : 'Ask ' + (name || 'your tutor') + ' anything...'}
          aria-label={ar ? 'اكتب رسالتك' : 'Type your message'}
          className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[12px] font-semibold text-slate-800 placeholder:text-slate-400 outline-none arabic-font"
        />
        <button
          type="button" onClick={onDictate}
          aria-label={ar ? 'الإملاء الصوتي' : 'Voice dictation'}
          title={ar ? 'الإملاء الصوتي' : 'Dictate'}
          className={'grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full transition-colors ' +
            (listening ? 'bg-rose-100 text-rose-800' : 'text-emerald-950/65 hover:bg-emerald-50 hover:text-emerald-950')}
        ><AudioLines size={16}/></button>
        <button
          type="submit" disabled={loading || !value.trim()}
          aria-label={ar ? 'إرسال الرسالة' : 'Send message'}
          className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full bg-emerald-900 text-white transition-colors hover:bg-emerald-700 disabled:opacity-35"
        ><Send size={15}/></button>
      </form>
    </section>
  );
});
DialectChatDock.displayName = 'DialectChatDock';
