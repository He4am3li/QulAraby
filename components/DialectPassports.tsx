import React from 'react';
import { ChevronLeft, ChevronRight, LockKeyhole, X } from 'lucide-react';

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

const OFFICIAL_NAMES: Record<string, [string, string]> = {
  "saudi": [
    "المملكة العربية السعودية",
    "KINGDOM OF SAUDI ARABIA"
  ],
  "uae": [
    "الإمارات العربية المتحدة",
    "UNITED ARAB EMIRATES"
  ],
  "egypt": [
    "جمهورية مصر العربية",
    "ARAB REPUBLIC OF EGYPT"
  ],
  "morocco": [
    "المملكة المغربية",
    "KINGDOM OF MOROCCO"
  ],
  "jordan": [
    "المملكة الأردنية الهاشمية",
    "HASHEMITE KINGDOM OF JORDAN"
  ],
  "lebanon": [
    "الجمهورية اللبنانية",
    "LEBANESE REPUBLIC"
  ],
  "palestine": [
    "دولة فلسطين",
    "STATE OF PALESTINE"
  ],
  "iraq": [
    "جمهورية العراق",
    "REPUBLIC OF IRAQ"
  ],
  "tunisia": [
    "الجمهورية التونسية",
    "REPUBLIC OF TUNISIA"
  ],
  "algeria": [
    "الجمهورية الجزائرية",
    "REPUBLIC OF ALGERIA"
  ],
  "libya": [
    "دولة ليبيا",
    "STATE OF LIBYA"
  ],
  "syria": [
    "الجمهورية العربية السورية",
    "SYRIAN ARAB REPUBLIC"
  ],
  "sudan": [
    "جمهورية السودان",
    "REPUBLIC OF THE SUDAN"
  ],
  "oman": [
    "سلطنة عُمان",
    "SULTANATE OF OMAN"
  ],
  "kuwait": [
    "دولة الكويت",
    "STATE OF KUWAIT"
  ],
  "qatar": [
    "دولة قطر",
    "STATE OF QATAR"
  ],
  "bahrain": [
    "مملكة البحرين",
    "KINGDOM OF BAHRAIN"
  ],
  "yemen": [
    "الجمهورية اليمنية",
    "REPUBLIC OF YEMEN"
  ],
  "mauritania": [
    "الجمهورية الإسلامية الموريتانية",
    "ISLAMIC REPUBLIC OF MAURITANIA"
  ],
  "somalia": [
    "جمهورية الصومال الفيدرالية",
    "FEDERAL REPUBLIC OF SOMALIA"
  ],
  "djibouti": [
    "جمهورية جيبوتي",
    "REPUBLIC OF DJIBOUTI"
  ],
  "comoros": [
    "جمهورية القمر المتحدة",
    "UNION OF THE COMOROS"
  ]
};

export function DialectPassportCover({
  country, level, compact = false
}: { country: PassportCountry; level: number; compact?: boolean }) {
  const unlocked = level >= 1;
  const [base, foil] = COLORS[country.id] || ['#174e43', '#e5ca91'];
  const [officialAr, officialEn] = OFFICIAL_NAMES[country.id] || [country.nameAr, country.nameEn.toUpperCase()];
  return (
    <div
      className={'relative isolate flex aspect-[88/125] w-full flex-col items-center justify-between overflow-hidden rounded-[6px] border text-center shadow-[inset_3px_0_7px_rgba(255,255,255,.12),inset_-4px_0_7px_rgba(0,0,0,.24),0_9px_20px_rgba(15,23,42,.2)] transition-all duration-700 ' +
        (compact ? 'px-[2px] py-[3px]' : 'px-[clamp(8px,1.1vw,16px)] py-[clamp(12px,1.3vw,20px)]') +
        (unlocked ? ' border-amber-200/30 opacity-100' : ' border-slate-300/40 grayscale-[.85] saturate-[.4] opacity-50')}
      style={{
        backgroundColor: base,
        backgroundImage: 'radial-gradient(ellipse at 65% 20%,rgba(255,255,255,.065),transparent 64%), repeating-linear-gradient(98deg,rgba(255,255,255,.012) 0,rgba(255,255,255,.012) 1px,transparent 1px,transparent 4px),linear-gradient(120deg,rgba(0,0,0,.18),transparent 12%,transparent 85%,rgba(0,0,0,.22))',
        color: foil
      }}
      aria-label={country.nameAr + (unlocked ? '، جواز مفعّل' : '، جواز غير مفعّل')}
    >
      {/* Thin bound spine and embossed cover edging, like a conventional passport booklet. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[4%] bg-gradient-to-r from-black/30 via-white/10 to-transparent"/>
      <div aria-hidden="true" className={'pointer-events-none absolute border border-current/35 ' + (compact ? 'inset-[3px] rounded-[3px]' : 'inset-[9px] rounded-[3px]')}/>
      <div className={'relative z-10 flex w-full flex-col items-center gap-0.5 font-bold arabic-font ' + (compact ? 'text-[3.5px] leading-[1.2]' : 'text-[clamp(8px,1vw,12px)] leading-[1.35]')}>
        <span className="max-w-full text-center">{officialAr}</span>
        <span className={'max-w-full font-serif uppercase ' + (compact ? 'text-[3px] tracking-[0]' : 'text-[clamp(6px,.66vw,9px)] tracking-[.03em]')} dir="ltr">{officialEn}</span>
      </div>
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        {/* Gold embossed educational crest, differentiated from an official state emblem. */}
        <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true" className={compact ? 'h-[17px] w-[18px]' : 'h-[min(26vw,100px)] w-[min(24vw,92px)] max-h-[42%]'}
          fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 80 C4 69 4 33 26 21 M78 80 C96 69 96 33 74 21" strokeWidth="2.2"/>
          <path d="M19 70 l-9 -4 M15 59 l-10 -7 M15 47 l-7 -10 M19 36 l-4 -10 M25 27 l-1 -10 M81 70 l9 -4 M85 59 l10 -7 M85 47 l7 -10 M81 36 l4 -10 M75 27 l1 -10" strokeWidth="2"/>
          <ellipse cx="50" cy="51" rx="28" ry="31" strokeWidth="2.5"/>
          <ellipse cx="50" cy="51" rx="22" ry="25" strokeWidth="1"/>
          <path d="M37 51 h26 M50 27 v48 M33 35 q17 16 34 0 M33 67 q17 -16 34 0" strokeWidth=".9" opacity=".6"/>
          <path d="M34 87 h32 M41 92 h18 M46 98 h8" strokeWidth="1.4"/>
        </svg>
        <span className={'absolute drop-shadow-sm ' + (compact ? 'text-[9px]' : 'text-[clamp(18px,2.6vw,31px)]')} aria-hidden="true">{country.flag}</span>
      </div>
      <div className={'relative z-10 flex w-full flex-col items-center font-bold ' + (compact ? 'gap-[1px]' : 'gap-[3px]')}>
        <span className={'arabic-font ' + (compact ? 'text-[5px]' : 'text-[clamp(12px,1.5vw,19px)]')}>جواز سفر</span>
        <span className={'font-serif ' + (compact ? 'text-[4px] tracking-[0]' : 'text-[clamp(10px,1.2vw,16px)] tracking-[.16em]')} dir="ltr">PASSPORT</span>
        {!compact && <span className="mt-1 font-semibold text-[clamp(5px,.58vw,8px)] tracking-[.14em] opacity-65" dir="ltr">EDUCATIONAL EDITION</span>}
      </div>
      {!unlocked && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-800/10" aria-hidden="true">
          <LockKeyhole size={compact ? 10 : 24} className="drop-shadow-md" color="#eee7d6"/>
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
            <h2 className="truncate text-[17px] font-black arabic-font">{active ? (ar ? active.nameAr : active.nameEn) : (ar ? 'مكتبة جوازات الدول' : 'Country Passport Library')}</h2>
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
                {ar ? 'جواز تعليمي مستوحى من غلاف وثيقة السفر، وليس جوازًا حكوميًا صالحًا للاستخدام.' :
                  'An educational passport cover, not an official travel document.'}
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
