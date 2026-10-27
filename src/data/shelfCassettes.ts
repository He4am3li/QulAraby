import { STORY_CASSETTES, JUHA_STORIES, StoryCassette } from './storyCassettes';

export interface ShelfTape {
  id: string;
  year: number;
  brand: string;
  model: string;
  tapeColor: string;
  cassetteNumber: string;
  titleAr: string;
  storyId: string;
}

// 40 Shelf Tapes arranged in 4 columns x 10 rows matching the reference image from 1975 to 2014
export const SHELF_TAPES: ShelfTape[] = [
  // ROW 1
  {
    id: 'tape-1975',
    year: 1975,
    brand: 'PHILIPS',
    model: 'UC-B',
    tapeColor: 'from-amber-700 via-stone-800 to-amber-900',
    cassetteNumber: 'C-01',
    titleAr: 'الراعي والأسد الوفي',
    storyId: 'shepherd-lion'
  },
  {
    id: 'tape-1976',
    year: 1976,
    brand: 'BASF',
    model: 'FERRO 90',
    tapeColor: 'from-red-800 via-stone-900 to-rose-900',
    cassetteNumber: 'C-02',
    titleAr: 'أبطال الدفاع المدني (حريق في المطبخ)',
    storyId: 'civil-defense-heroes'
  },
  {
    id: 'tape-1977',
    year: 1977,
    brand: 'TDK',
    model: 'SUPER D 90',
    tapeColor: 'from-emerald-800 via-stone-900 to-teal-900',
    cassetteNumber: 'C-03',
    titleAr: 'أسرار وفوائد التفاح',
    storyId: 'apple-secrets'
  },
  {
    id: 'tape-1978',
    year: 1978,
    brand: 'TDK',
    model: 'Super CDing 90',
    tapeColor: 'from-amber-600 via-yellow-700 to-stone-900',
    cassetteNumber: 'C-04',
    titleAr: 'حكمة حبة القمح والعصفورين',
    storyId: 'wheat-grain-wisdom'
  },

  // ROW 2
  {
    id: 'tape-1979',
    year: 1979,
    brand: 'SONY',
    model: 'HF-ES 90',
    tapeColor: 'from-blue-900 via-stone-900 to-indigo-900',
    cassetteNumber: 'C-05',
    titleAr: 'أصدقاء الحي وحق الجار',
    storyId: 'neighbor-rights'
  },
  {
    id: 'tape-1980',
    year: 1980,
    brand: 'TDK',
    model: 'NX SA90',
    tapeColor: 'from-purple-900 via-stone-900 to-fuchsia-900',
    cassetteNumber: 'C-06',
    titleAr: 'المزارعة الذكية ومدير الشركة',
    storyId: 'farmer-company-manager'
  },
  {
    id: 'tape-1981',
    year: 1981,
    brand: 'PHILIPS',
    model: 'SUPER FERRO',
    tapeColor: 'from-emerald-700 via-green-900 to-stone-900',
    cassetteNumber: 'C-07',
    titleAr: 'سيدة الشجر: نخلة الإمارات',
    storyId: 'palm-tree-emirates'
  },
  {
    id: 'tape-1982',
    year: 1982,
    brand: 'MAXELL',
    model: 'CHROME Class',
    tapeColor: 'from-stone-700 via-stone-900 to-zinc-900',
    cassetteNumber: 'C-08',
    titleAr: 'عرق الجبين وقيمة العمل',
    storyId: 'forehead-sweat-value'
  },

  // ROW 3
  {
    id: 'tape-1983-1',
    year: 1983,
    brand: 'TDK',
    model: 'SA90',
    tapeColor: 'from-blue-800 via-indigo-900 to-stone-900',
    cassetteNumber: 'C-09',
    titleAr: 'كروان الإذاعة المدرسية',
    storyId: 'school-radio-curlew'
  },
  {
    id: 'tape-1984',
    year: 1984,
    brand: 'AGFA',
    model: 'SUPER COLOR 60',
    tapeColor: 'from-rose-700 via-pink-900 to-stone-900',
    cassetteNumber: 'C-10',
    titleAr: 'أختي الصغيرة وسر المحبة',
    storyId: 'little-sister-love'
  },
  {
    id: 'tape-1985',
    year: 1985,
    brand: 'TDK',
    model: 'SA90 HIGH',
    tapeColor: 'from-teal-800 via-stone-900 to-emerald-950',
    cassetteNumber: 'C-11',
    titleAr: 'رحلة استكشاف في ربوع الوطن',
    storyId: 'homeland-journey'
  },
  {
    id: 'tape-1986',
    year: 1986,
    brand: 'TDK',
    model: 'SA-X 60',
    tapeColor: 'from-amber-800 via-stone-900 to-yellow-950',
    cassetteNumber: 'C-12',
    titleAr: 'أمانة المقعد والمرافق المدرسية',
    storyId: 'school-furniture-trust'
  },

  // ROW 4
  {
    id: 'tape-1987',
    year: 1987,
    brand: 'Mark II',
    model: 'PRO 60',
    tapeColor: 'from-stone-800 via-zinc-900 to-black',
    cassetteNumber: 'C-13',
    titleAr: 'رسالة كوكب الأرض وثقب الأوزون',
    storyId: 'earth-ozone-letter'
  },
  {
    id: 'tape-1988',
    year: 1988,
    brand: 'SONY',
    model: 'UX-S 60',
    tapeColor: 'from-red-900 via-stone-900 to-rose-950',
    cassetteNumber: 'C-14',
    titleAr: 'سفينة العلم والاجتهاد',
    storyId: 'diligence-and-work'
  },
  {
    id: 'tape-1989',
    year: 1989,
    brand: 'SONY',
    model: 'HF 90',
    tapeColor: 'from-sky-900 via-blue-950 to-stone-900',
    cassetteNumber: 'C-01',
    titleAr: 'الراعي والأسد الوفي',
    storyId: 'shepherd-lion'
  },
  {
    id: 'tape-1990',
    year: 1990,
    brand: 'TDK',
    model: 'DJ2 90',
    tapeColor: 'from-violet-900 via-stone-900 to-purple-950',
    cassetteNumber: 'C-02',
    titleAr: 'أبطال الدفاع المدني (حريق في المطبخ)',
    storyId: 'civil-defense-heroes'
  },

  // ROW 5
  {
    id: 'tape-1991',
    year: 1991,
    brand: 'PHILIPS',
    model: 'LC-100',
    tapeColor: 'from-stone-700 via-stone-900 to-zinc-950',
    cassetteNumber: 'C-03',
    titleAr: 'أسرار وفوائد التفاح',
    storyId: 'apple-secrets'
  },
  {
    id: 'tape-1992',
    year: 1992,
    brand: 'BASF',
    model: 'chromdioxid super II',
    tapeColor: 'from-amber-900 via-stone-900 to-yellow-900',
    cassetteNumber: 'C-04',
    titleAr: 'حكمة حبة القمح والعصفورين',
    storyId: 'wheat-grain-wisdom'
  },
  {
    id: 'tape-1993',
    year: 1993,
    brand: 'BASF',
    model: 'EXTRA 60',
    tapeColor: 'from-stone-800 via-zinc-900 to-black',
    cassetteNumber: 'C-05',
    titleAr: 'أصدقاء الحي وحق الجار',
    storyId: 'neighbor-rights'
  },
  {
    id: 'tape-1994',
    year: 1994,
    brand: 'TDK',
    model: 'Super CDing 90',
    tapeColor: 'from-teal-900 via-emerald-950 to-stone-900',
    cassetteNumber: 'C-06',
    titleAr: 'المزارعة الذكية ومدير الشركة',
    storyId: 'farmer-company-manager'
  },

  // ROW 6
  {
    id: 'tape-1995',
    year: 1995,
    brand: 'PHILIPS',
    model: 'CHROMIUM C90',
    tapeColor: 'from-indigo-900 via-blue-950 to-stone-900',
    cassetteNumber: 'C-07',
    titleAr: 'سيدة الشجر: نخلة الإمارات',
    storyId: 'palm-tree-emirates'
  },
  {
    id: 'tape-1996',
    year: 1996,
    brand: 'RUI',
    model: 'DRI 90',
    tapeColor: 'from-emerald-900 via-stone-900 to-teal-950',
    cassetteNumber: 'C-08',
    titleAr: 'عرق الجبين وقيمة العمل',
    storyId: 'forehead-sweat-value'
  },
  {
    id: 'tape-1997',
    year: 1997,
    brand: 'ZIPPP',
    model: '508/SAPPE 60',
    tapeColor: 'from-amber-800 via-orange-950 to-stone-900',
    cassetteNumber: 'C-09',
    titleAr: 'كروان الإذاعة المدرسية',
    storyId: 'school-radio-curlew'
  },
  {
    id: 'tape-1998',
    year: 1998,
    brand: 'TOTEM',
    model: 'HOF EX 90',
    tapeColor: 'from-purple-900 via-stone-900 to-indigo-950',
    cassetteNumber: 'C-10',
    titleAr: 'أختي الصغيرة وسر المحبة',
    storyId: 'little-sister-love'
  },

  // ROW 7
  {
    id: 'tape-1999',
    year: 1999,
    brand: 'PHILIPS',
    model: 'UC-II 90',
    tapeColor: 'from-stone-800 via-zinc-900 to-black',
    cassetteNumber: 'C-11',
    titleAr: 'رحلة استكشاف في ربوع الوطن',
    storyId: 'homeland-journey'
  },
  {
    id: 'tape-2000',
    year: 2000,
    brand: 'PHILIPS',
    model: 'UC-II 90',
    tapeColor: 'from-cyan-900 via-blue-950 to-stone-900',
    cassetteNumber: 'C-12',
    titleAr: 'أمانة المقعد والمرافق المدرسية',
    storyId: 'school-furniture-trust'
  },
  {
    id: 'tape-2001',
    year: 2001,
    brand: 'SONY',
    model: 'HF 90',
    tapeColor: 'from-rose-900 via-stone-900 to-red-950',
    cassetteNumber: 'C-13',
    titleAr: 'رسالة كوكب الأرض وثقب الأوزون',
    storyId: 'earth-ozone-letter'
  },
  {
    id: 'tape-2002',
    year: 2002,
    brand: 'SONY',
    model: 'Hi8 Pro 90',
    tapeColor: 'from-emerald-900 via-stone-900 to-teal-950',
    cassetteNumber: 'C-14',
    titleAr: 'سفينة العلم والاجتهاد',
    storyId: 'diligence-and-work'
  },

  // ROW 8
  {
    id: 'tape-2003',
    year: 2003,
    brand: 'SCOTCH',
    model: 'BX 90',
    tapeColor: 'from-amber-900 via-stone-900 to-yellow-950',
    cassetteNumber: 'C-01',
    titleAr: 'الراعي والأسد الوفي',
    storyId: 'shepherd-lion'
  },
  {
    id: 'tape-2004',
    year: 2004,
    brand: 'SONY',
    model: 'FX-I 90',
    tapeColor: 'from-slate-800 via-zinc-900 to-black',
    cassetteNumber: 'C-02',
    titleAr: 'أبطال الدفاع المدني (حريق في المطبخ)',
    storyId: 'civil-defense-heroes'
  },
  {
    id: 'tape-2005',
    year: 2005,
    brand: 'TDK',
    model: 'SA90',
    tapeColor: 'from-blue-900 via-indigo-950 to-stone-900',
    cassetteNumber: 'C-03',
    titleAr: 'أسرار وفوائد التفاح',
    storyId: 'apple-secrets'
  },
  {
    id: 'tape-2006',
    year: 2006,
    brand: 'LTF',
    model: 'musicae 90',
    tapeColor: 'from-stone-700 via-zinc-900 to-black',
    cassetteNumber: 'C-04',
    titleAr: 'حكمة حبة القمح والعصفورين',
    storyId: 'wheat-grain-wisdom'
  },

  // ROW 9
  {
    id: 'tape-2007',
    year: 2007,
    brand: 'METAL',
    model: 'METAL CD 90',
    tapeColor: 'from-amber-800 via-stone-900 to-yellow-900',
    cassetteNumber: 'C-05',
    titleAr: 'أصدقاء الحي وحق الجار',
    storyId: 'neighbor-rights'
  },
  {
    id: 'tape-2008',
    year: 2008,
    brand: 'BASF',
    model: 'EXTRA II 90',
    tapeColor: 'from-stone-800 via-zinc-900 to-black',
    cassetteNumber: 'C-06',
    titleAr: 'المزارعة الذكية ومدير الشركة',
    storyId: 'farmer-company-manager'
  },
  {
    id: 'tape-2009',
    year: 2009,
    brand: 'BASF',
    model: 'extra 90',
    tapeColor: 'from-teal-900 via-stone-900 to-emerald-950',
    cassetteNumber: 'C-07',
    titleAr: 'سيدة الشجر: نخلة الإمارات',
    storyId: 'palm-tree-emirates'
  },
  {
    id: 'tape-2010',
    year: 2010,
    brand: 'BASF',
    model: 'Ferrocolor 09-6',
    tapeColor: 'from-red-800 via-rose-900 to-stone-900',
    cassetteNumber: 'C-08',
    titleAr: 'عرق الجبين وقيمة العمل',
    storyId: 'forehead-sweat-value'
  },

  // ROW 10
  {
    id: 'tape-2011',
    year: 2011,
    brand: 'PD',
    model: 'PA195 90',
    tapeColor: 'from-slate-800 via-stone-900 to-black',
    cassetteNumber: 'C-09',
    titleAr: 'كروان الإذاعة المدرسية',
    storyId: 'school-radio-curlew'
  },
  {
    id: 'tape-2012',
    year: 2012,
    brand: 'ADX',
    model: 'ADX 90',
    tapeColor: 'from-stone-900 via-zinc-900 to-black',
    cassetteNumber: 'C-10',
    titleAr: 'أختي الصغيرة وسر المحبة',
    storyId: 'little-sister-love'
  },
  {
    id: 'tape-2013',
    year: 2013,
    brand: 'SETRO',
    model: 'Setro CD 90',
    tapeColor: 'from-indigo-900 via-stone-900 to-blue-950',
    cassetteNumber: 'C-11',
    titleAr: 'رحلة استكشاف في ربوع الوطن',
    storyId: 'homeland-journey'
  },
  {
    id: 'tape-2014',
    year: 2014,
    brand: 'TDK',
    model: 'PRO 90',
    tapeColor: 'from-stone-800 via-zinc-900 to-black',
    cassetteNumber: 'C-12',
    titleAr: 'أمانة المقعد والمرافق المدرسية',
    storyId: 'school-furniture-trust'
  }
];

export const getStoryForShelfTape = (tape: ShelfTape): StoryCassette | undefined => {
  // Never substitute another recording or override the actual story title.
  return [...STORY_CASSETTES, ...JUHA_STORIES].find(story => story.id === tape.storyId);
};


export const JUHA_SHELF_TAPES: ShelfTape[] = [
  {
    id: 'tape-juha-1',
    year: 1979,
    brand: 'TDK',
    model: 'SUPER D 90',
    tapeColor: 'from-amber-700 via-stone-800 to-amber-900',
    cassetteNumber: 'J-01',
    titleAr: 'جحا والحمار',
    storyId: 'juha-donkey'
  },
  {
    id: 'tape-juha-2',
    year: 1981,
    brand: 'BASF',
    model: 'FERRO 90',
    tapeColor: 'from-orange-800 via-stone-900 to-amber-950',
    cassetteNumber: 'J-02',
    titleAr: 'جحا والقدر',
    storyId: 'juha-pot'
  },
  {
    id: 'tape-juha-3',
    year: 1983,
    brand: 'SONY',
    model: 'HF 90',
    tapeColor: 'from-cyan-800 via-blue-900 to-stone-950',
    cassetteNumber: 'J-03',
    titleAr: 'جحا والسمك',
    storyId: 'juha-fish'
  },
  {
    id: 'tape-juha-4',
    year: 1985,
    brand: 'PHILIPS',
    model: 'UC-II 90',
    tapeColor: 'from-emerald-800 via-stone-900 to-teal-950',
    cassetteNumber: 'J-04',
    titleAr: 'جحا والحذاء',
    storyId: 'juha-shoes'
  },
  {
    id: 'tape-juha-5',
    year: 1987,
    brand: 'MAXELL',
    model: 'UD-XL II 90',
    tapeColor: 'from-yellow-700 via-amber-800 to-stone-950',
    cassetteNumber: 'J-05',
    titleAr: 'جحا والعسل',
    storyId: 'juha-honey'
  },
  {
    id: 'tape-juha-6',
    year: 1989,
    brand: 'AGFA',
    model: 'SUPER COLOR',
    tapeColor: 'from-purple-800 via-stone-900 to-indigo-950',
    cassetteNumber: 'J-06',
    titleAr: 'جحا والنظارة',
    storyId: 'juha-glasses'
  },
  {
    id: 'tape-juha-7',
    year: 1991,
    brand: 'PHILIPS',
    model: 'LC-100',
    tapeColor: 'from-amber-600 via-yellow-700 to-stone-900',
    cassetteNumber: 'J-07',
    titleAr: 'جحا والمفتاح',
    storyId: 'juha-key'
  },
  {
    id: 'tape-juha-8',
    year: 1993,
    brand: 'SONY',
    model: 'UX-S 60',
    tapeColor: 'from-red-800 via-rose-900 to-stone-900',
    cassetteNumber: 'J-08',
    titleAr: 'جحا والطبيب',
    storyId: 'juha-doctor'
  },
  {
    id: 'tape-juha-9',
    year: 1995,
    brand: 'TDK',
    model: 'DJ2 90',
    tapeColor: 'from-teal-800 via-slate-800 to-stone-900',
    cassetteNumber: 'J-09',
    titleAr: 'جحا والحمار العجيب',
    storyId: 'juha-clever-donkey'
  },
  {
    id: 'tape-juha-10',
    year: 1997,
    brand: 'SCOTCH',
    model: 'BX 90',
    tapeColor: 'from-stone-700 via-zinc-800 to-black',
    cassetteNumber: 'J-10',
    titleAr: 'جحا والباب',
    storyId: 'juha-door'
  }
];

export const getShelfTapesForLevel = (level?: string): ShelfTape[] =>
  level === 'beginner' ? JUHA_SHELF_TAPES : SHELF_TAPES;
