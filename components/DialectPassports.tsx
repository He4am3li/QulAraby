import React from 'react';
import { BookOpen, ChevronLeft, ChevronRight, LockKeyhole, X } from 'lucide-react';

export interface PassportCountry { id: string; nameAr: string; nameEn: string; flag: string }
export type PassportLevels = Record<string, number>;

const COLORS: Record<string, [string, string]> = {
  uae: ['#123756', '#d7bd84'], egypt: ['#17443b', '#e7c887'],
  saudi: ['#065744', '#eccd88'], morocco: ['#214e3c', '#d5b47a'],
  jordan: ['#153a55', '#e4c087'], lebanon: ['#183d51', '#dfc48b'],
  palestine: ['#1c3034', '#d8c08b'], iraq: ['#193d56', '#e3c58d'],
  tunisia: ['#902c3c', '#efca98'], algeria: ['#185647', '#edcb8d'],
  libya: ['#264557', '#e4c693'], syria: ['#1f4551', '#e6c18e'],
  sudan: ['#1b5546', '#e7cb97'], oman: ['#7d3439', '#e9d095'],
  kuwait: ['#183958', '#d7c190'], qatar: ['#732c42', '#f0d49c'],
  bahrain: ['#983746', '#efd29a'], yemen: ['#1c4054', '#e3c48d'],
  mauritania: ['#165d48', '#eed591'], somalia: ['#3976b5', '#eee0ac'],
  djibouti: ['#175d59', '#ebd69c'], comoros: ['#265e4e', '#f0d39d']
};
const STAGES = [
  { ar: 'زائر', en: 'VISITOR', noteAr: 'المهمة الأولى', noteEn: 'Mission 1' },
  { ar: 'مقيم', en: 'RESIDENT', noteAr: 'المهمة الثانية', noteEn: 'Mission 2' },
  { ar: 'روح البلد', en: 'NATIVE SPIRIT', noteAr: 'المهمة الثالثة', noteEn: 'Mission 3' }
];

export function DialectPassportCover({
  country, level, compact = false
}: { country: PassportCountry; level: number; compact?: boolean }) {
  const unlocked = level >= 1;
  const [base, foil] = COLORS[country.id] || ['#174e43', '#e5ca91'];
  return (
    <div
      className={'relative isolate flex aspect-[3/4.2] w-full flex-col items-center justify-between overflow-hidden rounded-[13px] border border-white/20 text-center shadow-[0_11px_22px_rgba(15,23,42,.18)] transition-all duration-700 ' +
        (compact ? 'px-[4px] py-[6px]' : 'px-3 py-3.5') +
        (!unlocked ? ' grayscale-[.8] saturate-[.45] opacity-[.52]' : ' opacity-100')}
      style={{ background: 'linear-gradient(145deg, ' + base + ', #092b2e 92%)', color: foil }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[13px] border-[3px] border-white/5" aria-hidden="true"/>
      <div className="pointer-events-none absolute -left-[36%] -top-[30%] h-[92%] w-[150%] rotate-[-30deg] bg-gradient-to-b from-white/15 via-transparent to-transparent" aria-hidden="true"/>
      <div className={'relative z-10 w-full font-bold arabic-font ' + (compact ? 'text-[5px]' : 'text-[clamp(8px,1vw,12px)]')}>
        {country.nameAr}
      </div>
      <div className="relative z-10 flex flex-col items-center gap-1">
        <span aria-hidden="true" className={compact ? 'text-[17px]' : 'text-[42px]'}>{country.flag}</span>
        <div className={'rounded-[50%] border border-current/40 ' + (compact ? 'p-[2px]' : 'p-2')}>
          <BookOpen size={compact ? 9 : 25} strokeWidth={1.25} aria-hidden="true"/>
        </div>
        <span className={'font-black tracking-[.16em] ' + (compact ? 'text-[5px]' : 'text-[11px]')} dir="ltr">QUL</span>
      </div>
      <div className={'relative z-10 w-full font-semibold uppercase tracking-[.12em] ' + (compact ? 'text-[5px]' : 'text-[9px]')} dir="ltr">
        CULTURAL PASSPORT
      </div>
      {!unlocked && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/15">
          <LockKeyhole size={compact ? 10 : 24} color="#f8f2e4" aria-hidden="true"/>
        </div>
      )}
    </div>
  );
}

export function DialectPassportLibrary({
  countries, levels, initialCountryId, lang, onClose
}: {
  countries: PassportCountry[]; levels: PassportLevels; initialCountryId?: string | null;
  lang: 'ar' | 'en'; onClose: () => void
}) {
  const ar = lang === 'ar';
  const initial = initialCountryId && countries.some(c => c.id === initialCountryId) ? initialCountryId : null;
  const [focusedId, setFocusedId] = React.useState<string | null>(initial);
  const [page, setPage] = React.useState(0);
  const perPage = 8;
  const pages = Math.max(1, Math.ceil(countries.length / perPage));
  const active = countries.find(c => c.id === focusedId);
  const earned = countries.filter(c => (levels[c.id] || 0) >= 1).length;
  const totalStamps = countries.reduce((n, c) => n + Math.min(3, Math.max(0, levels[c.id] || 0)), 0);
  const level = active ? Math.max(0, Math.min(3, levels[active.id] || 0)) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-2 backdrop-blur-md sm:p-5" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true"
        aria-label={ar ? 'مكتبة جوازات الدول' : 'Country passport collection'}
        className="relative flex h-[min(92dvh,850px)] w-full max-w-6xl flex-col overflow-hidden rounded-[23px] border border-amber-200/30 bg-[#f9f8f3] shadow-2xl">
        <header className="flex h-[66px] shrink-0 items-center justify-between gap-3 border-b border-amber-900/10 bg-[#0b473d] px-4 text-white sm:px-7">
          <div className="min-w-0">
            <h2 className="truncate text-[17px] font-black arabic-font">{active ? (ar ? active.nameAr : active.nameEn) : (ar ? 'مكتبة جوازات قُل' : 'QUL Passport Library')}</h2>
            <p className="text-[10px] font-semibold text-emerald-100/75">
              {active ? (ar ? 'رحلتك التعليمية في هذه الدولة' : 'Your learning journey') :
                (ar ? earned + ' جوازات مفعّلة، ' + totalStamps + ' ختمًا مكتسبًا' : earned + ' unlocked passports, ' + totalStamps + ' stamps')}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {active && (
              <button type="button" onClick={() => setFocusedId(null)}
                className="rounded-xl border border-white/20 px-3 py-2 text-[12px] font-bold hover:bg-white/10 arabic-font">
                {ar ? 'جميع الجوازات' : 'All passports'}
              </button>
            )}
            <button type="button" onClick={onClose}
              aria-label={ar ? 'إغلاق الجوازات' : 'Close passports'}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 hover:bg-white/10">
              <X size={18}/>
            </button>
          </div>
        </header>

        {active ? (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-7 sm:p-7">
            <div className="flex min-h-0 items-center justify-center">
              <div className="w-[min(40%,155px)] sm:w-[min(70%,240px)]">
                <DialectPassportCover country={active} level={level}/>
              </div>
            </div>
            <div className="flex min-h-0 flex-col justify-center gap-[clamp(7px,1vh,18px)]">
              <div className="text-center sm:text-start">
                <p className="text-[13px] font-black text-emerald-900 arabic-font">
                  {level === 0 ? (ar ? 'لم يُفعّل الجواز بعد' : 'Passport not yet unlocked') :
                    level === 3 ? (ar ? 'اكتملت رحلة هذه الدولة' : 'Country journey completed') :
                    (ar ? 'جواز مفعّل' : 'Passport unlocked')}
                </p>
                <p className="text-[11px] text-slate-500 arabic-font">
                  {level === 0 ? (ar ? 'اجتز المهمة الأولى للحصول على أول ختم' : 'Complete mission one to earn the first stamp') :
                    (ar ? 'الأختام تعكس المهام التي اجتزتها' : 'Stamps represent completed missions')}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-[clamp(4px,1vw,13px)]">
                {STAGES.map((stage, i) => {
                  const acquired = level > i;
                  return (
                    <div key={stage.en} className={'flex min-w-0 flex-col items-center gap-2 rounded-[14px] border px-1 py-[clamp(8px,1.5vh,20px)] text-center ' +
                      (acquired ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-100/60')}>
                      <div className={'flex aspect-square w-[min(100%,86px)] items-center justify-center rounded-full border-[3px] text-center shadow-sm ' +
                        (acquired ? 'rotate-[-9deg] border-[#bb8a45] bg-amber-100 text-[#97672c]' : 'border-dashed border-slate-300 text-slate-300')}>
                        {acquired
                          ? <span className="text-[clamp(9px,1.3vw,14px)] font-black arabic-font">{ar ? stage.ar : stage.en}</span>
                          : <LockKeyhole size={19}/>}
                      </div>
                      <span className={'truncate text-[11px] font-black arabic-font ' + (acquired ? 'text-amber-800' : 'text-slate-400')}>
                        {ar ? stage.ar : stage.en}
                      </span>
                      <span className="text-[10px] text-slate-500 arabic-font">{ar ? stage.noteAr : stage.noteEn}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-[11px] leading-relaxed text-slate-500 arabic-font">
                {ar ? 'جواز تعليمي من قُل، مستوحى من هوية الدولة وليس وثيقة سفر حكومية.' :
                  'A QUL educational passport, inspired by the country, not a government-issued document.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col justify-between gap-3 p-3 sm:p-6">
            <div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-2 gap-[clamp(5px,1.3vw,18px)]">
              {countries.slice(page * perPage, page * perPage + perPage).map(country => (
                <button type="button" key={country.id} onClick={() => setFocusedId(country.id)}
                  className="flex min-h-0 min-w-0 flex-col items-center justify-center gap-1 rounded-[14px] bg-white/65 p-[clamp(3px,.65vw,12px)] shadow-sm outline-none transition-transform hover:scale-[1.025] focus-visible:ring-2 focus-visible:ring-emerald-500">
                  <div className="max-h-[min(23vh,218px)] w-[min(90%,142px)]">
                    <DialectPassportCover country={country} level={levels[country.id] || 0}/>
                  </div>
                  <span className="w-full truncate text-center text-[11px] font-bold text-slate-700 arabic-font">{ar ? country.nameAr : country.nameEn}</span>
                </button>
              ))}
            </div>
            <nav className="flex h-10 shrink-0 items-center justify-center gap-5" aria-label={ar ? 'صفحات الجوازات' : 'Passport pages'}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} aria-label={ar ? 'السابق' : 'Previous'}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 disabled:opacity-25">
                <ChevronRight size={17}/>
              </button>
              <span className="text-[12px] font-bold tabular-nums text-slate-500" dir="ltr">{page + 1} / {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page === pages - 1} aria-label={ar ? 'التالي' : 'Next'}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 disabled:opacity-25">
                <ChevronLeft size={17}/>
              </button>
            </nav>
          </div>
        )}
      </section>
    </div>
  );
}
