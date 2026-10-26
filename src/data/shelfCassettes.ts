import { STORY_CASSETTES, StoryCassette } from './storyCassettes';

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
    titleAr: 'أبطال الدفاع المدني',
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
    titleAr: 'حكمة حبة القمح',
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
    titleAr: 'حقوق الجار والأصحاب',
    storyId: 'neighbor-rights'
  },
  {
    id: 'tape-1980',
    year: 1980,
    brand: 'TDK',
    model: 'NX SA90',
    tapeColor: 'from-purple-900 via-stone-900 to-fuchsia-900',
    cassetteNumber: 'C-06',
    titleAr: 'المزارعة والكهرباء',
    storyId: 'farmer-company-manager'
  },
  {
    id: 'tape-1981',
    year: 1981,
    brand: 'PHILIPS',
    model: 'SUPER FERRO',
    tapeColor: 'from-emerald-700 via-green-900 to-stone-900',
    cassetteNumber: 'C-07',
    titleAr: 'نخلة الإمارات المعطاءة',
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
    titleAr: 'رحلة استكشاف الوطن',
    storyId: 'homeland-journey'
  },
  {
    id: 'tape-1986',
    year: 1986,
    brand: 'TDK',
    model: 'SA-X 60',
    tapeColor: 'from-amber-800 via-stone-900 to-yellow-950',
    cassetteNumber: 'C-12',
    titleAr: 'أمانة المرافق العامة',
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
    titleAr: 'رسالة كوكب الأرض',
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
    titleAr: 'حكاية الصقر والغزال',
    storyId: 'shepherd-lion'
  },
  {
    id: 'tape-1990',
    year: 1990,
    brand: 'TDK',
    model: 'DJ2 90',
    tapeColor: 'from-violet-900 via-stone-900 to-purple-950',
    cassetteNumber: 'C-02',
    titleAr: 'لؤلؤة الخليج والغواص',
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
    titleAr: 'وفاء الخيل العربي',
    storyId: 'apple-secrets'
  },
  {
    id: 'tape-1992',
    year: 1992,
    brand: 'BASF',
    model: 'chromdioxid super II',
    tapeColor: 'from-amber-900 via-stone-900 to-yellow-900',
    cassetteNumber: 'C-04',
    titleAr: 'صانع الفخار العجيب',
    storyId: 'wheat-grain-wisdom'
  },
  {
    id: 'tape-1993',
    year: 1993,
    brand: 'BASF',
    model: 'EXTRA 60',
    tapeColor: 'from-stone-800 via-zinc-900 to-black',
    cassetteNumber: 'C-05',
    titleAr: 'أسرار النجوم والملاحة',
    storyId: 'neighbor-rights'
  },
  {
    id: 'tape-1994',
    year: 1994,
    brand: 'TDK',
    model: 'Super CDing 90',
    tapeColor: 'from-teal-900 via-emerald-950 to-stone-900',
    cassetteNumber: 'C-06',
    titleAr: 'قافلة التوابل والحرير',
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
    titleAr: 'الماء سر الحياة',
    storyId: 'palm-tree-emirates'
  },
  {
    id: 'tape-1996',
    year: 1996,
    brand: 'RUI',
    model: 'DRI 90',
    tapeColor: 'from-emerald-900 via-stone-900 to-teal-950',
    cassetteNumber: 'C-08',
    titleAr: 'سحر الصحراء والواحات',
    storyId: 'forehead-sweat-value'
  },
  {
    id: 'tape-1997',
    year: 1997,
    brand: 'ZIPPP',
    model: '508/SAPPE 60',
    tapeColor: 'from-amber-800 via-orange-950 to-stone-900',
    cassetteNumber: 'C-09',
    titleAr: 'همة الشباب وبناء الغد',
    storyId: 'school-radio-curlew'
  },
  {
    id: 'tape-1998',
    year: 1998,
    brand: 'TOTEM',
    model: 'HOF EX 90',
    tapeColor: 'from-purple-900 via-stone-900 to-indigo-950',
    cassetteNumber: 'C-10',
    titleAr: 'شجرة الغاف الصامدة',
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
    titleAr: 'مخترع المصباح الصغير',
    storyId: 'homeland-journey'
  },
  {
    id: 'tape-2000',
    year: 2000,
    brand: 'PHILIPS',
    model: 'UC-II 90',
    tapeColor: 'from-cyan-900 via-blue-950 to-stone-900',
    cassetteNumber: 'C-12',
    titleAr: 'رحلة قطرة المطر',
    storyId: 'school-furniture-trust'
  },
  {
    id: 'tape-2001',
    year: 2001,
    brand: 'SONY',
    model: 'HF 90',
    tapeColor: 'from-rose-900 via-stone-900 to-red-950',
    cassetteNumber: 'C-13',
    titleAr: 'طبيب القرية المخلص',
    storyId: 'earth-ozone-letter'
  },
  {
    id: 'tape-2002',
    year: 2002,
    brand: 'SONY',
    model: 'Hi8 Pro 90',
    tapeColor: 'from-emerald-900 via-stone-900 to-teal-950',
    cassetteNumber: 'C-14',
    titleAr: 'كنوز التراث البحري',
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
    titleAr: 'حارس القلعة القديمة',
    storyId: 'shepherd-lion'
  },
  {
    id: 'tape-2004',
    year: 2004,
    brand: 'SONY',
    model: 'FX-I 90',
    tapeColor: 'from-slate-800 via-zinc-900 to-black',
    cassetteNumber: 'C-02',
    titleAr: 'بستان الحكمة والأمثال',
    storyId: 'civil-defense-heroes'
  },
  {
    id: 'tape-2005',
    year: 2005,
    brand: 'TDK',
    model: 'SA90',
    tapeColor: 'from-blue-900 via-indigo-950 to-stone-900',
    cassetteNumber: 'C-03',
    titleAr: 'حكاية الجمل الصبور',
    storyId: 'apple-secrets'
  },
  {
    id: 'tape-2006',
    year: 2006,
    brand: 'LTF',
    model: 'musicae 90',
    tapeColor: 'from-stone-700 via-zinc-900 to-black',
    cassetteNumber: 'C-04',
    titleAr: 'أصدقاء البيئة الخضراء',
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
    titleAr: 'عجائب الفضاء السحيق',
    storyId: 'neighbor-rights'
  },
  {
    id: 'tape-2008',
    year: 2008,
    brand: 'BASF',
    model: 'EXTRA II 90',
    tapeColor: 'from-stone-800 via-zinc-900 to-black',
    cassetteNumber: 'C-06',
    titleAr: 'صوت الناي وذكريات الجبل',
    storyId: 'farmer-company-manager'
  },
  {
    id: 'tape-2009',
    year: 2009,
    brand: 'BASF',
    model: 'extra 90',
    tapeColor: 'from-teal-900 via-stone-900 to-emerald-950',
    cassetteNumber: 'C-07',
    titleAr: 'أمانة الراعي الأمين',
    storyId: 'palm-tree-emirates'
  },
  {
    id: 'tape-2010',
    year: 2010,
    brand: 'BASF',
    model: 'Ferrocolor 09-6',
    tapeColor: 'from-red-800 via-rose-900 to-stone-900',
    cassetteNumber: 'C-08',
    titleAr: 'رياح الأمل والعزيمة',
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
    titleAr: 'فرسان القراءة والمعرفة',
    storyId: 'school-radio-curlew'
  },
  {
    id: 'tape-2012',
    year: 2012,
    brand: 'ADX',
    model: 'ADX 90',
    tapeColor: 'from-stone-900 via-zinc-900 to-black',
    cassetteNumber: 'C-10',
    titleAr: 'نداء الواجب والشجاعة',
    storyId: 'little-sister-love'
  },
  {
    id: 'tape-2013',
    year: 2013,
    brand: 'SETRO',
    model: 'Setro CD 90',
    tapeColor: 'from-indigo-900 via-stone-900 to-blue-950',
    cassetteNumber: 'C-11',
    titleAr: 'أهازيج الصيد والبحارة',
    storyId: 'homeland-journey'
  },
  {
    id: 'tape-2014',
    year: 2014,
    brand: 'TDK',
    model: 'PRO 90',
    tapeColor: 'from-stone-800 via-zinc-900 to-black',
    cassetteNumber: 'C-12',
    titleAr: 'شعلة الطموح والإنجاز',
    storyId: 'school-furniture-trust'
  }
];

export const getStoryForShelfTape = (tape: ShelfTape): StoryCassette | undefined => {
  const match = STORY_CASSETTES.find(s => s.id === tape.storyId);
  if (match) {
    // If the tape has a custom titleAr, return a story copy with that titleAr
    if (tape.titleAr && tape.titleAr !== match.titleAr) {
      return {
        ...match,
        titleAr: tape.titleAr,
        vintageBrand: tape.brand,
        year: tape.year.toString()
      };
    }
    return match;
  }
  return STORY_CASSETTES[0];
};
