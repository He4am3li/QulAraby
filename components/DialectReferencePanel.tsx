import React from 'react';
import { DialectCulturePictogram } from './DialectCulturePictogram';

interface CultureItem { icon: string; nameAr: string; nameEn: string; descAr: string; descEn: string }
interface VocabItem { dialect: string; fusha: string; en: string; roman: string }
interface CountryReference {
  nameAr: string; nameEn: string; flag: string; image: string;
  culture: { factAr: string; factEn: string; items: CultureItem[] };
  vocab: VocabItem[];
}

interface Props {
  country: CountryReference;
  lang: 'ar' | 'en';
  onPronounce: (text: string) => void;
  heroImage: React.ReactNode;
}

/** Keeps the destination, culture, eight reference words and fact visible at once. */
export const DialectReferencePanel: React.FC<Props> = ({ country, lang, onPronounce, heroImage }) => {
  const ar = lang === 'ar';
  const [chosenCulture, setChosenCulture] = React.useState<number | null>(null);
  React.useEffect(() => setChosenCulture(null), [country.nameEn]);

  return (
    <aside
      aria-label={ar ? 'دليل الدولة والمفردات' : 'Country reference and vocabulary'}
      className="h-full min-h-0 w-full overflow-hidden rounded-[22px] border border-slate-200/75 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.045)]"
    >
      <div className="grid h-full min-h-0 gap-[clamp(5px,0.75vh,9px)] p-[clamp(7px,1vh,10px)]"
        style={{ gridTemplateRows: 'minmax(66px,.86fr) minmax(123px,1.69fr) minmax(181px,2.26fr) minmax(90px,1.18fr)' }}
      >
        {/* Matching rounded photo header and photographic fact footer. */}
        <section className="relative min-h-0 overflow-hidden rounded-t-[17px] rounded-b-[9px] bg-slate-200">
          <div className="absolute inset-0">{heroImage}</div>

          {(country.nameEn === 'Sudan' || country.nameEn === 'Egypt' || country.nameEn === 'UAE' || country.nameEn === 'Lebanon' || country.nameEn === 'Iraq' || country.nameEn === 'Libya' || country.nameEn === 'Tunisia' || country.nameEn === 'Morocco' || country.nameEn === 'Kuwait' || country.nameEn === 'Qatar' || country.nameEn === 'Oman' || country.nameEn === 'Somalia') && (
            <span className="absolute top-2 left-2 z-10 rounded-md bg-slate-900/55 px-1.5 py-0.5 text-[10px] font-medium text-white" title={ar ? 'رسم مولد بالذكاء الاصطناعي وليس صورة فوتوغرافية' : 'AI-generated artistic rendering, not a photograph'}>
              {ar ? 'صورة مولّدة' : 'AI illustration'}
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/10 to-slate-950/30 pointer-events-none"/>
          <div className="absolute inset-x-3 bottom-2 flex items-end justify-between gap-3 text-slate-900">
            <div className="min-w-0">
              <h2 className="truncate font-black text-[clamp(14px,1.65vw,22px)] arabic-font leading-tight">{ar ? country.nameAr : country.nameEn}</h2>
              <span className="block text-[10px] text-slate-600 tracking-wide" dir="ltr">{ar ? country.nameEn : country.nameAr}</span>
            </div>
            <span className="text-3xl drop-shadow-md" aria-hidden="true">{country.flag}</span>
          </div>
        </section>

        <section aria-label={ar ? 'الثقافة' : 'Culture'} className="relative min-h-0 flex flex-col gap-1">
          <div className="flex h-6 shrink-0 items-center justify-between gap-2 px-1">
            <h3 className="font-black text-[13px] text-slate-800 arabic-font">{ar ? 'الثقافة' : 'Culture'}</h3>
            <span className="h-px flex-1 bg-gradient-to-l from-amber-400/50 to-transparent" />
          </div>
          <div className="grid grid-cols-3 grid-rows-2 flex-1 min-h-0 gap-[clamp(4px,.6vh,7px)]">
            {country.culture.items.slice(0, 6).map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setChosenCulture(previous => previous === i ? null : i)}
                title={ar ? item.descAr : item.descEn}
                aria-label={ar ? item.nameAr + ': ' + item.descAr : item.nameEn + ': ' + item.descEn}
                aria-pressed={chosenCulture === i}
                className={'group min-w-0 min-h-0 flex flex-col items-center justify-center gap-[1px] rounded-[13px] border px-1 py-[2px] overflow-hidden transition-[background-color,border-color,transform] hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ' +
                  (chosenCulture === i ? 'border-[#7ba99b] bg-[#e9f1eb]' : (i % 3 === 0 ? 'border-transparent bg-[#edf4ef]' : 'border-transparent bg-[#f5f1e8]') + ' hover:border-[#a7c5b7]')}
              >
                <DialectCulturePictogram nameAr={item.nameAr} nameEn={item.nameEn} />
                <span className="w-full truncate text-center text-[clamp(10px,1.15vh,12px)] font-extrabold leading-tight text-[#24332e] arabic-font">{ar ? item.nameAr : item.nameEn}</span>
              </button>
            ))}
          </div>
          {/* A culture tile can reveal its description without navigating away. */}
          {chosenCulture !== null && country.culture.items[chosenCulture] && (
            <div className="absolute z-30 max-w-[min(380px,85vw)] rounded-xl border border-emerald-200 bg-white/95 p-2 shadow-xl backdrop-blur-sm text-[12px] text-slate-700"
                 style={{ top: 'calc(100% + 4px)', insetInlineStart: '3%' }} role="status">
              <button className="float-left px-1 font-bold text-slate-500" onClick={() => setChosenCulture(null)} aria-label={ar ? 'إغلاق' : 'Close'}>×</button>
              {ar ? country.culture.items[chosenCulture].descAr : country.culture.items[chosenCulture].descEn}
            </div>
          )}
        </section>

        <section aria-label={ar ? 'المفردات الشائعة' : 'Common phrases'} className="min-h-0 flex flex-col gap-1">
          <div className="flex h-6 shrink-0 items-center gap-2 px-1">
            <h3 className="font-black text-[13px] text-slate-800 arabic-font">{ar ? 'المفردات الشائعة' : 'Common phrases'}</h3>
            <span className="h-px flex-1 bg-gradient-to-l from-amber-400/50 to-transparent" />
          </div>
          <div className="grid flex-1 min-h-0 grid-cols-2 grid-rows-4 gap-[5px]"
            aria-label={ar ? 'ثماني مفردات عربية، مع النطق والإنجليزية' : 'Eight bilingual dialect phrases'}>
            {country.vocab.slice(0, 8).map((v, i) => (
              <button
                type="button"
                key={i}
                title={(ar ? 'استمع: ' : 'Pronounce: ') + v.dialect}
                aria-label={v.dialect + ', ' + v.roman + ', ' + v.fusha + ', ' + v.en}
                onClick={() => onPronounce(v.dialect)}
                className="group grid min-h-0 min-w-0 grid-cols-2 grid-rows-2 items-center gap-x-2 gap-y-0 overflow-hidden rounded-[9px] border border-emerald-100/90 bg-gradient-to-l from-emerald-50/70 to-white px-[clamp(7px,.7vw,11px)] py-1 text-right transition-colors hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
                dir="rtl"
              >
                <span className="min-w-0 truncate text-[clamp(11px,1.04vw,14px)] font-black leading-[1.3] text-[#096653] arabic-font" dir="rtl" title={v.dialect}>{v.dialect}</span>
                <span className="min-w-0 truncate text-left text-[clamp(10px,.95vw,13px)] font-bold leading-[1.3] tracking-[.01em] text-[#407e76]" dir="ltr" title={v.roman}>{v.roman}</span>
                <span className="min-w-0 truncate text-[clamp(10px,.88vw,12px)] font-medium leading-[1.3] text-slate-600 arabic-font" dir="rtl" title={v.fusha}>{v.fusha}</span>
                <span className="min-w-0 truncate text-left text-[clamp(10px,.85vw,12px)] font-medium leading-[1.3] text-slate-500" dir="ltr" title={v.en}>{v.en}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="relative min-h-0 overflow-hidden rounded-b-[17px] rounded-t-[9px] bg-[#e9efe8]"
          aria-label={ar ? 'هل تعلم؟' : 'Did you know?'}>
          {/* Same image and soft white photographic fade as the hero, descending from the TOP. */}
          <img src={country.image} alt="" loading="lazy" aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-50" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/92 via-[#f5f9f4]/85 to-[#f3f8f3]/92" />
          <div className="relative z-10 flex h-full min-h-0 flex-col justify-center gap-[clamp(3px,.6vh,6px)] px-3 py-1.5">
            <h3 className={'text-[clamp(13px,1.12vw,16px)] font-black text-[#09493f] arabic-font ' + (ar ? 'text-right' : 'text-left')}>
              {ar ? 'هل تعلم؟' : 'Did you know?'}
            </h3>
            <p className="line-clamp-2 text-right text-[clamp(11px,.95vw,13px)] font-extrabold leading-[1.4] text-[#112f2b] arabic-font"
              dir="rtl" title={country.culture.factAr}>{country.culture.factAr}</p>
            {country.culture.factEn && (
              <p className="line-clamp-2 text-left text-[clamp(11px,.86vw,12px)] font-semibold leading-[1.4] text-[#304c47]"
                dir="ltr" title={country.culture.factEn}>{country.culture.factEn}</p>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
};
