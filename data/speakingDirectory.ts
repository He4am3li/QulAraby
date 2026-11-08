/**
 * Educational, fictional phone directory. No entry is a real telephone number.
 * Every Arabic letter has six discoverable, callable entries.
 */
export const ARABIC_DIRECTORY_LETTERS = ["أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي"] as const;

export type SpeakingPhoneContact = {
  id: string; extension: string; voice: string; ar: string; en: string;
  agentAr: string; agentEn: string; symbol: string;
  aimAr: string; aimEn: string;
  objectivesAr: readonly string[]; objectivesEn: readonly string[];
  complication: string; accent: string;
};

type DirectoryService = 'travel' | 'repair' | 'clinic' | 'bakery' | 'books' | 'media' | 'school';
const CONTACT_GROUPS: Record<DirectoryService, Omit<SpeakingPhoneContact,
  'id' | 'extension' | 'ar' | 'en'>> = {
  travel: {
    voice:'Charon', agentAr:'موظف مكتب السفر', agentEn:'Travel desk agent', symbol:'✧',
    aimAr:'اسأل عن رحلة، وموعدها، وسعر التذكرة.', aimEn:'Ask about a journey, its schedule and ticket price.',
    objectivesAr:['اسأل عن الرحلة','حدد الموعد','استفسر عن السعر'],
    objectivesEn:['Ask about the journey','Specify a date','Ask for the price'],
    complication:'A suggested departure time is unavailable, offer a different one.', accent:'#a7b9c9',
  },
  repair: {
    voice:'Orus', agentAr:'موظف خدمة العملاء', agentEn:'Service agent', symbol:'⌁',
    aimAr:'اشرح مشكلة بسيطة واستفسر عن طريقة حلها.', aimEn:'Explain a simple issue and ask how to solve it.',
    objectivesAr:['اشرح المشكلة','اذكر التفاصيل','اسأل عن الحل'],
    objectivesEn:['Describe an issue','Give a detail','Ask for a solution'],
    complication:'Ask one simple follow-up question. Never ask for sensitive details.', accent:'#c1b39c',
  },
  clinic: {
    voice:'Leda', agentAr:'موظفة الاستقبال', agentEn:'Clinic receptionist', symbol:'✚',
    aimAr:'احجز موعدًا في العيادة وحدد اليوم والساعة.', aimEn:'Arrange a clinic appointment with a day and time.',
    objectivesAr:['اطلب موعدًا','اذكر اليوم','حدد الساعة'],
    objectivesEn:['Request an appointment','Name a day','Choose a time'],
    complication:'The requested time is taken, suggest another. Do not give medical advice.', accent:'#a9ccc4',
  },
  bakery: {
    voice:'Kore', agentAr:'موظفة المخبز', agentEn:'Bakery assistant', symbol:'◒',
    aimAr:'اطلب طعامًا وحدد الكمية واسأل عن السعر.', aimEn:'Order some food, specify quantity and ask the price.',
    objectivesAr:['اطلب صنفًا','حدد الكمية','اسأل عن السعر'],
    objectivesEn:['Order an item','Specify quantity','Ask for the price'],
    complication:'One item is unavailable; invite the learner to choose an alternative.', accent:'#dfbe93',
  },
  books: {
    voice:'Aoede', agentAr:'أمينة المكتبة', agentEn:'Bookshop assistant', symbol:'▤',
    aimAr:'اسأل عن كتاب، وهل هو متاح، وموعد الحصول عليه.', aimEn:'Ask for a book, its availability and when to collect it.',
    objectivesAr:['اسأل عن كتاب','تحقق من توفره','اسأل عن موعد الاستلام'],
    objectivesEn:['Ask for a book','Check availability','Ask when to collect it'],
    complication:'A title is on loan, recommend another simple title.', accent:'#c7b6a2',
  },
  media: {
    voice:'Puck', agentAr:'موظف الاستقبال', agentEn:'Media studio receptionist', symbol:'✳',
    aimAr:'اسأل عن برنامج أو خدمة وموعدها وكيفية المشاركة.', aimEn:'Ask about a program, its time and how to join.',
    objectivesAr:['اسأل عن البرنامج','استفسر عن الموعد','اسأل عن المشاركة'],
    objectivesEn:['Ask about a program','Ask when it starts','Ask how to join'],
    complication:'Suggest a different time or program and invite a decision.', accent:'#a4c8d0',
  },
  school: {
    voice:'Fenrir', agentAr:'موظف شؤون الطلاب', agentEn:'School office assistant', symbol:'◇',
    aimAr:'استفسر عن نشاط تعليمي وموعده ومكانه.', aimEn:'Ask about an educational activity, its time and location.',
    objectivesAr:['اسأل عن النشاط','اسأل عن الموعد','اسأل عن المكان'],
    objectivesEn:['Ask about the activity','Ask when it happens','Ask where it is'],
    complication:'The classroom changed, give a new room number.', accent:'#afb9da',
  },
};

/** Pairs of fictional organisation names and their educational roles, in Arabic alphabetical order. */
export const ARABIC_DIRECTORY_RECORDS: Record<string, readonly [string, string, DirectoryService][]> = {
  "أ": [
    [
      "أفق للسياحة",
      "Horizon Tours",
      "travel"
    ],
    [
      "أمان للصيانة",
      "Aman Repairs",
      "repair"
    ],
    [
      "أريج للمخبوزات",
      "Areej Bakery",
      "bakery"
    ],
    [
      "أطلس للكتب",
      "Atlas Books",
      "books"
    ],
    [
      "أصداء للإذاعة",
      "Echo Radio",
      "media"
    ],
    [
      "أجيال للتعليم",
      "Generations Academy",
      "school"
    ]
  ],
  "ب": [
    [
      "بوابة للسفر",
      "Gateway Travel",
      "travel"
    ],
    [
      "بسمة للأسنان",
      "Basmah Dental",
      "clinic"
    ],
    [
      "بيت الخبز",
      "Bread House",
      "bakery"
    ],
    [
      "بستان الكتب",
      "Book Orchard",
      "books"
    ],
    [
      "برق للاتصالات",
      "Barq Telecom",
      "repair"
    ],
    [
      "بداية للتعليم",
      "Bidaya Academy",
      "school"
    ]
  ],
  "ت": [
    [
      "تذكرة للسفر",
      "Ticket Travel",
      "travel"
    ],
    [
      "توازن للعلاج",
      "Balance Clinic",
      "clinic"
    ],
    [
      "تمر وحلوى",
      "Dates and Sweets",
      "bakery"
    ],
    [
      "تراث للكتب",
      "Heritage Books",
      "books"
    ],
    [
      "تواصل للخدمات",
      "Tawasul Services",
      "repair"
    ],
    [
      "تميز للتعليم",
      "Tamayuz Academy",
      "school"
    ]
  ],
  "ث": [
    [
      "ثريا للسفر",
      "Thuraya Travel",
      "travel"
    ],
    [
      "ثقة للصيانة",
      "Thiqah Repairs",
      "repair"
    ],
    [
      "ثمار للمخبوزات",
      "Thimar Bakery",
      "bakery"
    ],
    [
      "ثقافة للكتب",
      "Thaqafa Books",
      "books"
    ],
    [
      "ثواني للاتصالات",
      "Thawani Telecom",
      "media"
    ],
    [
      "ثروة للعلوم",
      "Tharwa Science Center",
      "school"
    ]
  ],
  "ج": [
    [
      "جناح للسفر",
      "Wings Travel",
      "travel"
    ],
    [
      "جسر للخدمات",
      "Bridge Services",
      "repair"
    ],
    [
      "جنة الحلويات",
      "Jannah Sweets",
      "bakery"
    ],
    [
      "جليس للكتب",
      "Jalees Books",
      "books"
    ],
    [
      "جوهرة للإعلام",
      "Jewel Media",
      "media"
    ],
    [
      "جيل المعرفة",
      "Generation of Knowledge",
      "school"
    ]
  ],
  "ح": [
    [
      "حلم للسياحة",
      "Dream Tours",
      "travel"
    ],
    [
      "حياة الطبية",
      "Hayat Clinic",
      "clinic"
    ],
    [
      "حلا للمخبوزات",
      "Hala Bakery",
      "bakery"
    ],
    [
      "حروف للكتب",
      "Letters Bookshop",
      "books"
    ],
    [
      "حوار للإعلام",
      "Hiwar Media",
      "media"
    ],
    [
      "حكمة للتعليم",
      "Hikmah Academy",
      "school"
    ]
  ],
  "خ": [
    [
      "خطوة للسفر",
      "Step Travel",
      "travel"
    ],
    [
      "خبرة للصيانة",
      "Expert Repairs",
      "repair"
    ],
    [
      "خبز وملح",
      "Bread and Salt Bakery",
      "bakery"
    ],
    [
      "خزانة الكتب",
      "Book Cabinet",
      "books"
    ],
    [
      "خدمة المدينة",
      "City Services",
      "repair"
    ],
    [
      "خيمة العلوم",
      "Science Tent",
      "school"
    ]
  ],
  "د": [
    [
      "دروب للسفر",
      "Paths Travel",
      "travel"
    ],
    [
      "دواء للعيادات",
      "Dawaa Clinics",
      "clinic"
    ],
    [
      "دكان الحلويات",
      "Sweet Shop",
      "bakery"
    ],
    [
      "دار القراءة",
      "Reading House",
      "books"
    ],
    [
      "دليل للاتصالات",
      "Directory Telecom",
      "media"
    ],
    [
      "درب المعرفة",
      "Path to Knowledge",
      "school"
    ]
  ],
  "ذ": [
    [
      "ذهاب للسياحة",
      "Thahab Tours",
      "travel"
    ],
    [
      "ذراع للمساعدة",
      "Helping Arm Services",
      "repair"
    ],
    [
      "ذوق للمخبوزات",
      "Thawq Bakery",
      "bakery"
    ],
    [
      "ذخائر التراث",
      "Heritage Treasures Bookshop",
      "books"
    ],
    [
      "ذكاء للتقنية",
      "Thakaa Technology",
      "media"
    ],
    [
      "ذهبية للتعليم",
      "Thahabiya Academy",
      "school"
    ]
  ],
  "ر": [
    [
      "رحلة للسفر",
      "Rihla Travel",
      "travel"
    ],
    [
      "راحة للعيادات",
      "Raha Clinic",
      "clinic"
    ],
    [
      "رغيف الصباح",
      "Morning Loaf",
      "bakery"
    ],
    [
      "رفوف للكتب",
      "Rufuf Books",
      "books"
    ],
    [
      "رسالة للإعلام",
      "Risala Media",
      "media"
    ],
    [
      "رواد العلوم",
      "Science Pioneers",
      "school"
    ]
  ],
  "ز": [
    [
      "زاد للسياحة",
      "Zad Tours",
      "travel"
    ],
    [
      "زهرة للعلاج",
      "Zahra Clinic",
      "clinic"
    ],
    [
      "زعفران للحلويات",
      "Saffron Sweets",
      "bakery"
    ],
    [
      "زاد القارئ",
      "Reader's Supplies",
      "books"
    ],
    [
      "زرقة للإذاعة",
      "Zorqa Radio",
      "media"
    ],
    [
      "زهور المعرفة",
      "Flowers of Knowledge",
      "school"
    ]
  ],
  "س": [
    [
      "سفينة للسفر",
      "Safina Travel",
      "travel"
    ],
    [
      "سلامة للخدمات",
      "Salama Services",
      "repair"
    ],
    [
      "سكر للمخبوزات",
      "Sukkar Bakery",
      "bakery"
    ],
    [
      "سطور للكتب",
      "Sutour Books",
      "books"
    ],
    [
      "سماعة للإعلام",
      "Samaha Media",
      "media"
    ],
    [
      "سبيل للتعلم",
      "Sabeel Academy",
      "school"
    ]
  ],
  "ش": [
    [
      "شراع للسياحة",
      "Shiraa Travel",
      "travel"
    ],
    [
      "شفاء للعيادات",
      "Shifaa Clinics",
      "clinic"
    ],
    [
      "شمس الحلويات",
      "Shams Sweets",
      "bakery"
    ],
    [
      "شغف للقراءة",
      "Passion Reading",
      "books"
    ],
    [
      "شبكة للاتصالات",
      "Network Telecom",
      "media"
    ],
    [
      "شباب المعرفة",
      "Youth Academy",
      "school"
    ]
  ],
  "ص": [
    [
      "صحراء للسفر",
      "Sahara Travel",
      "travel"
    ],
    [
      "صحة للعيادات",
      "Sihha Clinic",
      "clinic"
    ],
    [
      "صباح المخبوزات",
      "Morning Bakery House",
      "bakery"
    ],
    [
      "صفحات للكتب",
      "Pages Books",
      "books"
    ],
    [
      "صوت المدينة",
      "City Voice Radio",
      "media"
    ],
    [
      "صناع المعرفة",
      "Knowledge Makers",
      "school"
    ]
  ],
  "ض": [
    [
      "ضياء للسياحة",
      "Diyaa Tours",
      "travel"
    ],
    [
      "ضمان للصيانة",
      "Daman Repairs",
      "repair"
    ],
    [
      "ضيافة للمخبوزات",
      "Diyafa Bakery",
      "bakery"
    ],
    [
      "ضفاف للكتب",
      "Difaf Books",
      "books"
    ],
    [
      "ضوء للإعلام",
      "Daw Media",
      "media"
    ],
    [
      "ضمير للتعليم",
      "Dameer Academy",
      "school"
    ]
  ],
  "ط": [
    [
      "طريق للسفر",
      "Tareeq Travel",
      "travel"
    ],
    [
      "طبيبك للعيادات",
      "Your Doctor Clinics",
      "clinic"
    ],
    [
      "طاحونة الخبز",
      "Bread Mill",
      "bakery"
    ],
    [
      "طيف للكتب",
      "Tayf Books",
      "books"
    ],
    [
      "طاقة للتقنية",
      "Taqa Technology",
      "media"
    ],
    [
      "طلاب المستقبل",
      "Future Students Academy",
      "school"
    ]
  ],
  "ظ": [
    [
      "ظبي للسياحة",
      "Dhabi Tours",
      "travel"
    ],
    [
      "ظلال للصيانة",
      "Dhilal Repairs",
      "repair"
    ],
    [
      "ظهيرة للمخبوزات",
      "Noon Bakery",
      "bakery"
    ],
    [
      "ظرف للكتب",
      "Dharf Bookshop",
      "books"
    ],
    [
      "ظواهر للإعلام",
      "Phenomena Media",
      "media"
    ],
    [
      "ظافر للتعليم",
      "Dhafer Academy",
      "school"
    ]
  ],
  "ع": [
    [
      "عبور للسفر",
      "Uboor Travel",
      "travel"
    ],
    [
      "عافية للعيادات",
      "Afiyah Clinics",
      "clinic"
    ],
    [
      "عسل ومخبوزات",
      "Honey Bakery",
      "bakery"
    ],
    [
      "عالم الكتب",
      "World of Books",
      "books"
    ],
    [
      "عنوان للإعلام",
      "Unwan Media",
      "media"
    ],
    [
      "علم المستقبل",
      "Future Science Academy",
      "school"
    ]
  ],
  "غ": [
    [
      "غيمة للسياحة",
      "Ghaymah Tours",
      "travel"
    ],
    [
      "غيث للمساعدة",
      "Ghayth Services",
      "repair"
    ],
    [
      "غذاء للمخبوزات",
      "Ghidhaa Bakery",
      "bakery"
    ],
    [
      "غلاف للكتب",
      "Ghilaf Books",
      "books"
    ],
    [
      "غناء للإذاعة",
      "Ghina Radio",
      "media"
    ],
    [
      "غراس للتعليم",
      "Ghiras Academy",
      "school"
    ]
  ],
  "ف": [
    [
      "فجر للسفر",
      "Fajr Travel",
      "travel"
    ],
    [
      "فحص للعيادات",
      "Fahs Clinic",
      "clinic"
    ],
    [
      "فطائر المدينة",
      "City Pies",
      "bakery"
    ],
    [
      "فصول للكتب",
      "Fusool Books",
      "books"
    ],
    [
      "فضاء للإعلام",
      "Fadaa Media",
      "media"
    ],
    [
      "فكر للتعليم",
      "Fikr Academy",
      "school"
    ]
  ],
  "ق": [
    [
      "قافلة للسفر",
      "Qafila Travel",
      "travel"
    ],
    [
      "قريب للخدمات",
      "Qareeb Services",
      "repair"
    ],
    [
      "قطعة حلوى",
      "Piece of Candy",
      "bakery"
    ],
    [
      "قصة للكتب",
      "Qissa Books",
      "books"
    ],
    [
      "قناة المعرفة",
      "Knowledge Channel",
      "media"
    ],
    [
      "قمم للتعليم",
      "Qimam Academy",
      "school"
    ]
  ],
  "ك": [
    [
      "كوكب للسياحة",
      "Kawkab Tours",
      "travel"
    ],
    [
      "كفاءة للصيانة",
      "Kafaa Repairs",
      "repair"
    ],
    [
      "كعكة ومخبوزات",
      "Cake and Bakes",
      "bakery"
    ],
    [
      "كنز الكتب",
      "Book Treasure",
      "books"
    ],
    [
      "كلمة للإذاعة",
      "Kalima Radio",
      "media"
    ],
    [
      "كبار العلماء",
      "Scientists Academy",
      "school"
    ]
  ],
  "ل": [
    [
      "لؤلؤ للسفر",
      "Pearl Travel",
      "travel"
    ],
    [
      "لمسة للعلاج",
      "Lamsa Clinic",
      "clinic"
    ],
    [
      "لذة الحلويات",
      "Lathah Sweets",
      "bakery"
    ],
    [
      "لغة الكتب",
      "Language Books",
      "books"
    ],
    [
      "لقاء للإعلام",
      "Liqaa Media",
      "media"
    ],
    [
      "لوحة التعليم",
      "Learning Board Academy",
      "school"
    ]
  ],
  "م": [
    [
      "مطار المدينة",
      "City Airport Office",
      "travel"
    ],
    [
      "مركز العافية",
      "Wellness Center",
      "clinic"
    ],
    [
      "معجنات البيت",
      "Home Pastries",
      "bakery"
    ],
    [
      "مكتبة القلم",
      "Pen Library",
      "books"
    ],
    [
      "موجة للإذاعة",
      "Wave Radio",
      "media"
    ],
    [
      "مدرسة الأمل",
      "Hope School",
      "school"
    ]
  ],
  "ن": [
    [
      "نجمة للسياحة",
      "Najma Tours",
      "travel"
    ],
    [
      "نبض للعيادات",
      "Pulse Clinics",
      "clinic"
    ],
    [
      "نكهة المخبوزات",
      "Flavor Bakery",
      "bakery"
    ],
    [
      "نور الكتب",
      "Noor Books",
      "books"
    ],
    [
      "نغم للإذاعة",
      "Nagham Radio",
      "media"
    ],
    [
      "نادي العلوم",
      "Science Club",
      "school"
    ]
  ],
  "ه": [
    [
      "هلال للسفر",
      "Hilal Travel",
      "travel"
    ],
    [
      "هدوء للعلاج",
      "Hudoo Clinic",
      "clinic"
    ],
    [
      "هناء للحلويات",
      "Hanaa Sweets",
      "bakery"
    ],
    [
      "هدية الكتب",
      "Book Gift",
      "books"
    ],
    [
      "هواء للإذاعة",
      "Hawaa Radio",
      "media"
    ],
    [
      "همة للتعليم",
      "Himma Academy",
      "school"
    ]
  ],
  "و": [
    [
      "وجهة للسفر",
      "Wajha Travel",
      "travel"
    ],
    [
      "وقاية للعيادات",
      "Wiqaya Clinics",
      "clinic"
    ],
    [
      "وردة الحلويات",
      "Wardah Sweets",
      "bakery"
    ],
    [
      "ورق للكتب",
      "Waraq Books",
      "books"
    ],
    [
      "وصلة للاتصالات",
      "Wasla Telecom",
      "media"
    ],
    [
      "واحة التعليم",
      "Learning Oasis",
      "school"
    ]
  ],
  "ي": [
    [
      "ياسمين للسياحة",
      "Yasmin Tours",
      "travel"
    ],
    [
      "يسر للخدمات",
      "Yusr Services",
      "repair"
    ],
    [
      "يمامة للحلويات",
      "Yamama Sweets",
      "bakery"
    ],
    [
      "ينبوع الكتب",
      "Yanbou Books",
      "books"
    ],
    [
      "يقظة للإعلام",
      "Yaqdha Media",
      "media"
    ],
    [
      "يافعون للتعلم",
      "Young Learners Academy",
      "school"
    ]
  ]
};

const BASE_RESERVED_NUMBERS = new Set(['101','202','303','404','505','606','707','808','909','110']);
export const ADDITIONAL_SPEAKING_CONTACTS: SpeakingPhoneContact[] = (() => {
  let next = 501;
  const names = ARABIC_DIRECTORY_LETTERS.flatMap(letter => ARABIC_DIRECTORY_RECORDS[letter]);
  return names.map(([ar,en,service], index) => {
    while (BASE_RESERVED_NUMBERS.has(String(next))) next++;
    const extension = String(next++);
    return {
      ...CONTACT_GROUPS[service],
      id: 'directory_' + index,
      extension,
      ar,
      en,
    };
  });
})();

/** 'أ' also groups ا, إ, آ; sorting always ignores Arabic marks. */
export const directoryLetterOf = (label: string): string => {
  const first = label.trim().normalize('NFC').replace(/^[\u064B-\u065F]+/, '')[0] || '';
  if (/[اأإآٱ]/.test(first)) return 'أ';
  if (first === 'ة' || first === 'ه' || first === 'هـ') return 'ه';
  if (first === 'ى') return 'ي';
  return first;
};
