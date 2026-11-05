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
const STARTERS = [
  { dialect: 'كيف حالك؟', en: 'How are you?' },
  { dialect: 'ممكن تساعدني؟', en: 'Can you help me?' },
  { dialect: 'أنا أتعلم اللهجة', en: 'I am learning the dialect' }
];

/** The student keeps their teaching controls, never a duplicate chat transcript. */
export const DialectChatDock: React.FC<Props> = React.memo(({
  lang, name, value, onChange, onSend, onDictate,
  loading, listening, vocabulary = []
}) => {
  const ar = lang === 'ar';
  const inputRef = React.useRef<HTMLInputElement>(null);
  const phrases = vocabulary.length ? vocabulary.slice(0, 3) : STARTERS;
  const pick = (phrase: { dialect: string; en: string }) => {
    const prepared = vocabulary.length
      ? ar ? 'كيف أستخدم «' + phrase.dialect + '» في جملة؟'
        : 'How do I use "' + phrase.dialect + '" in a sentence?'
      : ar ? phrase.dialect : phrase.en;
    onChange(prepared);
    inputRef.current?.focus();
  };

  return (
    <section
      aria-label={ar ? 'التدريب على الكلمات ومراسلة الشخصية' : 'Dialect practice and messages'}
      className="relative flex h-full min-h-0 w-full flex-col justify-center gap-[clamp(5px,.6vh,8px)] overflow-hidden rounded-b-[18px] bg-[linear-gradient(180deg,rgba(229,240,233,.96),rgba(247,251,248,.99))] px-[clamp(7px,1vw,13px)] py-[clamp(5px,.7vh,8px)]"
    >
      {/* No chat table. Practice phrases are always visible, including in a live call. */}
      <div className="flex h-[30px] min-h-0 shrink-0 items-center gap-[clamp(4px,.6vw,8px)]">
        <span className="hidden shrink-0 whitespace-nowrap text-[10px] font-black text-emerald-950/75 arabic-font xl:block">
          {ar ? 'تدرّب على العبارات' : 'Try these phrases'}
        </span>
        {phrases.map((phrase, i) => (
          <button
            key={i} type="button"
            onClick={() => pick(phrase)} title={ar ? phrase.en : phrase.dialect}
            className="min-w-0 flex-1 truncate rounded-full border border-white/90 bg-white/65 px-2 py-1.5 text-[clamp(10px,.79vw,12px)] font-bold text-emerald-950 shadow-[0_1px_4px_rgba(16,65,55,.07)] transition-colors hover:border-emerald-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 arabic-font"
          >
            {ar ? phrase.dialect : phrase.en}
          </button>
        ))}
      </div>
      <form
        className="flex h-[38px] min-h-0 shrink-0 items-center gap-1.5 rounded-full border border-white/85 bg-white/90 p-[3px] shadow-[0_2px_9px_rgba(16,65,55,.09)]"
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
