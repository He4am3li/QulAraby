import React from 'react';
import { Volume2, Sparkles, BookOpen } from 'lucide-react';

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
        style={{ gridTemplateRows: 'minmax(86px,1.12fr) minmax(125px,1.32fr) minmax(225px,2.32fr) minmax(81px,.91fr)' }}
      >
        {/* Matching rounded photo header and photographic fact footer. */}
        <section className="relative min-h-0 overflow-hidden rounded-t-[17px] rounded-b-[9px] bg-slate-200">
          <div className="absolute inset-0">{heroImage}</div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/15 to-transparent pointer-events-none"/>
          <div className="absolute inset-x-3 bottom-2 flex items-end justify-between gap-3 text-white">
            <div className="min-w-0">
              <h2 className="truncate font-black text-[clamp(14px,1.65vw,22px)] arabic-font leading-tight">{ar ? country.nameAr : country.nameEn}</h2>
              <span className="block text-[10px] text-white/75 tracking-wide" dir="ltr">{ar ? country.nameEn : country.nameAr}</span>
            </div>
            <span className="text-3xl drop-shadow-md" aria-hidden="true">{country.flag}</span>
          </div>
        </section>

        <section aria-label={ar ? 'الثقافة' : 'Culture'} className="min-h-0 flex flex-col gap-1">
          <div className="flex h-6 shrink-0 items-center justify-between gap-2 px-1">
            <h3 className="font-black text-[13px] text-slate-800 arabic-font">{ar ? 'الثقافة' : 'Culture'}</h3>
            <span className="h-px flex-1 bg-gradient-to-l from-amber-400/50 to-transparent" />
          </div>
          <div className="grid grid-cols-3 grid-rows-2 flex-1 min-h-0 gap-[5px]">
            {country.culture.items.slice(0, 6).map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setChosenCulture(previous => previous === i ? null : i)}
                title={ar ? item.descAr : item.descEn}
                aria-label={ar ? item.nameAr + ': ' + item.descAr : item.nameEn + ': ' + item.descEn}
                aria-pressed={chosenCulture === i}
                className={'group min-w-0 min-h-0 flex flex-col items-center justify-center gap-0.5 rounded-[9px] border px-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ' +
                  (chosenCulture === i ? 'border-emerald-400 bg-emerald-50' : 'border-slate-100 bg-[#f5f7f7] hover:border-emerald-200 hover:bg-emerald-50/60')}
              >
                <span className="text-[clamp(15px,2.1vh,21px)] leading-none" aria-hidden="true">{item.icon}</span>
                <span className="w-full truncate text-center text-[clamp(10px,1.15vh,12px)] font-bold text-slate-800 arabic-font">{ar ? item.nameAr : item.nameEn}</span>
              </button>
            ))}
          </div>
          {/* A culture tile can reveal its description without navigating away. */}
          {chosenCulture !== null && country.culture.items[chosenCulture] && (
            <div className="absolute z-30 max-w-[min(380px,85vw)] rounded-xl border border-emerald-200 bg-white/95 p-2 shadow-xl backdrop-blur-sm text-[12px] text-slate-700"
                 style={{ top: '29%', insetInlineStart: '3%' }} role="status">
              <button className="float-left px-1 font-bold text-slate-500" onClick={() => setChosenCulture(null)} aria-label={ar ? 'إغلاق' : 'Close'}>×</button>
              {ar ? country.culture.items[chosenCulture].descAr : country.culture.items[chosenCulture].descEn}
            </div>
          )}
        </section>

        <section aria-label={ar ? 'المفردات الشائعة' : 'Common phrases'} className="min-h-0 flex flex-col gap-1">
          <div className="flex h-6 shrink-0 items-center gap-2 px-1">
            <BookOpen size={14} className="text-emerald-600" aria-hidden="true" />
            <h3 className="font-black text-[13px] text-slate-800 arabic-font">{ar ? 'المفردات الشائعة' : 'Common phrases'}</h3>
            <span className="ms-auto text-[10px] text-slate-400" dir="ltr">08</span>
          </div>
          <div className="grid flex-1 min-h-0 grid-cols-2 grid-rows-4 gap-[5px]" role="table"
               aria-label={ar ? 'ثماني كلمات باللهجة ومعناها' : 'Eight dialect phrases with translations'}>
            {country.vocab.slice(0, 8).map((v, i) => (
              <div role="cell" key={i}
                   className="flex min-w-0 min-h-0 items-center justify-between gap-1 overflow-hidden rounded-[10px] border border-emerald-100/85 bg-gradient-to-l from-emerald-50/75 to-white px-[clamp(5px,.6vw,9px)]">
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-[1px]">
                  <span className="truncate text-[clamp(11px,1.16vw,15px)] font-black text-[#0e695f] arabic-font" title={v.dialect} dir="rtl">{v.dialect}</span>
                  <span className="truncate text-[clamp(10px,.86vw,12px)] font-medium text-slate-600 arabic-font" title={ar ? v.fusha : v.en}>{ar ? v.fusha : v.en}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onPronounce(v.dialect)}
                  aria-label={(ar ? 'نطق ' : 'Pronounce ') + v.dialect}
                  title={v.roman + ' · ' + v.en}
                  className="inline-flex h-[clamp(26px,3.1vh,33px)] w-[clamp(26px,3.1vh,33px)] shrink-0 items-center justify-center rounded-full text-emerald-700 transition-colors hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
                >
                  <Volume2 size={15} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="relative min-h-0 overflow-hidden rounded-b-[17px] rounded-t-[9px] bg-[#0c463d] text-white"
          aria-label={ar ? 'هل تعلم؟' : 'Did you know?'}>
          <div className="absolute inset-0 opacity-[0.19] [&>img]:h-full [&>img]:w-full [&>img]:object-cover" aria-hidden="true">
            <img src={country.image} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-[#07362f]/95 via-[#0d5548]/85 to-[#163e42]/80" />
          <div className="relative z-10 flex h-full min-h-0 flex-col justify-center gap-[3px] px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-300" aria-hidden="true" />
              <h3 className="text-[12px] font-black text-amber-100 arabic-font">{ar ? 'هل تعلم؟' : 'Did you know?'}</h3>
            </div>
            <p className="line-clamp-2 text-[clamp(11px,.9vw,13px)] font-semibold leading-snug text-white/95 arabic-font" title={ar ? country.culture.factAr : country.culture.factEn}>
              {ar ? country.culture.factAr : country.culture.factEn}
            </p>
          </div>
        </section>
      </div>
    </aside>
  );
};
