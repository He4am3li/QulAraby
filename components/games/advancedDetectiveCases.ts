import type { DetectiveCase, SuspectPerson } from './DetectiveMystery';

interface AdvancedSeed {
 id:number; caseNumber:number; codeName:string; crimeDescription:string; culpritId:string;
 suspects:SuspectPerson[]; evidenceTerms:{ar:string;en:string}[];
 clues:{speech:string;innocentIds:string[];key:string;hint:string;options:string[]}[];
}
// All ten posters are supplied by the user. Each portrait comes from the same case.
// Deliberate labeling corrections: case 6 second جنى -> جنان;
// case 7 second كمال -> سليم; case 8 unlabeled portrait -> كارمن.
export const ADVANCED_CASE_SEEDS: AdvancedSeed[] = [
  {
    "id": 201,
    "caseNumber": 1,
    "codeName": "شفرة الأرشيف الممنوع",
    "crimeDescription": "عند الساعة 11:47 فُتح الأرشيف دون كسر واختفى دفتر الشفرات. وصلت رسائل غامضة وظهرت آثار قرب الخزنة.",
    "culpritId": "adv_1_2",
    "suspects": [
      {
        "id": "adv_1_0",
        "name": "رامي",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-01-suspect-0.webp"
      },
      {
        "id": "adv_1_1",
        "name": "سعاد",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-01-suspect-1.webp"
      },
      {
        "id": "adv_1_2",
        "name": "نديم",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-01-suspect-2.webp"
      },
      {
        "id": "adv_1_3",
        "name": "جنى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-01-suspect-3.webp"
      },
      {
        "id": "adv_1_4",
        "name": "لورا",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-01-suspect-4.webp"
      },
      {
        "id": "adv_1_5",
        "name": "عادل",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-01-suspect-5.webp"
      },
      {
        "id": "adv_1_6",
        "name": "نوال",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-01-suspect-6.webp"
      },
      {
        "id": "adv_1_7",
        "name": "يزن",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-01-suspect-7.webp"
      },
      {
        "id": "adv_1_8",
        "name": "مريم",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-01-suspect-8.webp"
      },
      {
        "id": "adv_1_9",
        "name": "كمال",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-01-suspect-9.webp"
      }
    ],
    "evidenceTerms": [
      {
        "ar": "دفتر الشفرات",
        "en": "Codebook"
      },
      {
        "ar": "كاميرا المدخل",
        "en": "Entrance camera"
      },
      {
        "ar": "سجل الاجتماعات",
        "en": "Meeting register"
      },
      {
        "ar": "تقرير الحارس",
        "en": "Guard report"
      },
      {
        "ar": "سجل المصعد",
        "en": "Elevator log"
      }
    ],
    "clues": [
      {
        "speech": "أثبت كاميرا المدخل أن سعاد، جنى كانوا في ساحة المبنى وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_1_1",
          "adv_1_3"
        ],
        "key": "كاميرا المدخل",
        "hint": "شفرة المصدر: لخدملا اريماك . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "سجل الاجتماعات",
          "كاميرا المدخل",
          "تقرير الحارس"
        ]
      },
      {
        "speech": "أثبت سجل الاجتماعات أن لورا، عادل، نوال كانوا في قاعة المحاضرات وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_1_4",
          "adv_1_5",
          "adv_1_6"
        ],
        "key": "سجل الاجتماعات",
        "hint": "شفرة المصدر: تاعامتجالا لجس . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا المدخل",
          "تقرير الحارس",
          "سجل الاجتماعات"
        ]
      },
      {
        "speech": "أثبت تقرير الحارس أن يزن، مريم كانوا في البوابة الجنوبية وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_1_7",
          "adv_1_8"
        ],
        "key": "تقرير الحارس",
        "hint": "شفرة المصدر: سراحلا ريرقت . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "تقرير الحارس",
          "كاميرا المدخل",
          "سجل الاجتماعات"
        ]
      },
      {
        "speech": "أثبت سجل المصعد أن كمال، رامي كانوا في الطابق الأرضي وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_1_9",
          "adv_1_0"
        ],
        "key": "سجل المصعد",
        "hint": "شفرة المصدر: دعصملا لجس . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا المدخل",
          "سجل المصعد",
          "سجل الاجتماعات"
        ]
      }
    ]
  },
  {
    "id": 202,
    "caseNumber": 2,
    "codeName": "لغز الشاهدين المتناقضين",
    "crimeDescription": "اختفت لوحة أصلية واستُبدلت بنسخة مطابقة خلال ثماني دقائق. اختلفت إفادتان لأن ساعة إحدى الكاميرات كانت متأخرة.",
    "culpritId": "adv_2_7",
    "suspects": [
      {
        "id": "adv_2_0",
        "name": "تامر",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-02-suspect-0.webp"
      },
      {
        "id": "adv_2_1",
        "name": "رنا",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-02-suspect-1.webp"
      },
      {
        "id": "adv_2_2",
        "name": "كمال",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-02-suspect-2.webp"
      },
      {
        "id": "adv_2_3",
        "name": "إبراهيم",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-02-suspect-3.webp"
      },
      {
        "id": "adv_2_4",
        "name": "سلمى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-02-suspect-4.webp"
      },
      {
        "id": "adv_2_5",
        "name": "جابر",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-02-suspect-5.webp"
      },
      {
        "id": "adv_2_6",
        "name": "لينا",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-02-suspect-6.webp"
      },
      {
        "id": "adv_2_7",
        "name": "راهول",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-02-suspect-7.webp"
      },
      {
        "id": "adv_2_8",
        "name": "منى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-02-suspect-8.webp"
      },
      {
        "id": "adv_2_9",
        "name": "يوسف",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-02-suspect-9.webp"
      }
    ],
    "evidenceTerms": [
      {
        "ar": "لوحة أصلية",
        "en": "Original painting"
      },
      {
        "ar": "كاميرا القاعة",
        "en": "Hall camera"
      },
      {
        "ar": "سجل الإضاءة",
        "en": "Lighting log"
      },
      {
        "ar": "تذاكر الدخول",
        "en": "Entry tickets"
      },
      {
        "ar": "سجل الخروج",
        "en": "Exit register"
      }
    ],
    "clues": [
      {
        "speech": "أثبت كاميرا القاعة أن كمال، إبراهيم كانوا في الممر الشرقي وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_2_2",
          "adv_2_3"
        ],
        "key": "كاميرا القاعة",
        "hint": "شفرة المصدر: ةعاقلا اريماك . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "سجل الإضاءة",
          "تذاكر الدخول",
          "كاميرا القاعة"
        ]
      },
      {
        "speech": "أثبت سجل الإضاءة أن سلمى، جابر، لينا كانوا في غرفة المعدات وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_2_4",
          "adv_2_5",
          "adv_2_6"
        ],
        "key": "سجل الإضاءة",
        "hint": "شفرة المصدر: ةءاضإلا لجس . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "سجل الإضاءة",
          "كاميرا القاعة",
          "تذاكر الدخول"
        ]
      },
      {
        "speech": "أثبت تذاكر الدخول أن منى، يوسف كانوا في المسرح وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_2_8",
          "adv_2_9"
        ],
        "key": "تذاكر الدخول",
        "hint": "شفرة المصدر: لوخدلا ركاذت . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا القاعة",
          "تذاكر الدخول",
          "سجل الإضاءة"
        ]
      },
      {
        "speech": "أثبت سجل الخروج أن تامر، رنا كانوا في البوابة وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_2_0",
          "adv_2_1"
        ],
        "key": "سجل الخروج",
        "hint": "شفرة المصدر: جورخلا لجس . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا القاعة",
          "سجل الإضاءة",
          "سجل الخروج"
        ]
      }
    ]
  },
  {
    "id": 203,
    "caseNumber": 3,
    "codeName": "مفارقة الساعات العشر",
    "crimeDescription": "توقفت عشر ساعات بفارق دقائق في الورشة، ثم اختفت ساعة نادرة. تناقض ترتيب عقارب الساعات مع سجل الصيانة.",
    "culpritId": "adv_3_5",
    "suspects": [
      {
        "id": "adv_3_0",
        "name": "ليلى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-03-suspect-0.webp"
      },
      {
        "id": "adv_3_1",
        "name": "فهد",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-03-suspect-1.webp"
      },
      {
        "id": "adv_3_2",
        "name": "عبير",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-03-suspect-2.webp"
      },
      {
        "id": "adv_3_3",
        "name": "طارق",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-03-suspect-3.webp"
      },
      {
        "id": "adv_3_4",
        "name": "كارمن",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-03-suspect-4.webp"
      },
      {
        "id": "adv_3_5",
        "name": "كين",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-03-suspect-5.webp"
      },
      {
        "id": "adv_3_6",
        "name": "هاني",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-03-suspect-6.webp"
      },
      {
        "id": "adv_3_7",
        "name": "شذى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-03-suspect-7.webp"
      },
      {
        "id": "adv_3_8",
        "name": "رفيف",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-03-suspect-8.webp"
      },
      {
        "id": "adv_3_9",
        "name": "رؤوف",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-03-suspect-9.webp"
      },
      {
        "id": "adv_3_10",
        "name": "منصور",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-03-suspect-10.webp"
      },
      {
        "id": "adv_3_11",
        "name": "خديجة",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-03-suspect-11.webp"
      }
    ],
    "evidenceTerms": [
      {
        "ar": "عقارب الساعات",
        "en": "Clock hands"
      },
      {
        "ar": "دفتر العملاء",
        "en": "Customer register"
      },
      {
        "ar": "كاميرا الورشة",
        "en": "Workshop camera"
      },
      {
        "ar": "سجل الطرود",
        "en": "Delivery log"
      },
      {
        "ar": "شهادة الفني",
        "en": "Technician statement"
      }
    ],
    "clues": [
      {
        "speech": "أثبت دفتر العملاء أن طارق، كارمن، هاني كانوا في المعرض وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_3_3",
          "adv_3_4",
          "adv_3_6"
        ],
        "key": "دفتر العملاء",
        "hint": "شفرة المصدر: ءالمعلا رتفد . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "دفتر العملاء",
          "كاميرا الورشة",
          "سجل الطرود"
        ]
      },
      {
        "speech": "أثبت كاميرا الورشة أن شذى، رفيف، رؤوف كانوا في مخزن القطع وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_3_7",
          "adv_3_8",
          "adv_3_9"
        ],
        "key": "كاميرا الورشة",
        "hint": "شفرة المصدر: ةشرولا اريماك . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "دفتر العملاء",
          "كاميرا الورشة",
          "سجل الطرود"
        ]
      },
      {
        "speech": "أثبت سجل الطرود أن منصور، خديجة، ليلى كانوا في مدخل التسليم وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_3_10",
          "adv_3_11",
          "adv_3_0"
        ],
        "key": "سجل الطرود",
        "hint": "شفرة المصدر: دورطلا لجس . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "دفتر العملاء",
          "كاميرا الورشة",
          "سجل الطرود"
        ]
      },
      {
        "speech": "أثبت شهادة الفني أن فهد، عبير كانوا في غرفة المحركات وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_3_1",
          "adv_3_2"
        ],
        "key": "شهادة الفني",
        "hint": "شفرة المصدر: ينفلا ةداهش . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "شهادة الفني",
          "دفتر العملاء",
          "كاميرا الورشة"
        ]
      }
    ]
  },
  {
    "id": 204,
    "caseNumber": 4,
    "codeName": "الخزنة التي فتحت بلا مفتاح",
    "crimeDescription": "انفتحت الخزنة دون تسجيل أي مفتاح، واختفى تاج صغير. تقاطعت آثار الغبار مع سجل الدخول الإلكتروني.",
    "culpritId": "adv_4_3",
    "suspects": [
      {
        "id": "adv_4_0",
        "name": "إبراهيم",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-04-suspect-0.webp"
      },
      {
        "id": "adv_4_1",
        "name": "هدى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-04-suspect-1.webp"
      },
      {
        "id": "adv_4_2",
        "name": "جابر",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-04-suspect-2.webp"
      },
      {
        "id": "adv_4_3",
        "name": "مريم",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-04-suspect-3.webp"
      },
      {
        "id": "adv_4_4",
        "name": "راهول",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-04-suspect-4.webp"
      },
      {
        "id": "adv_4_5",
        "name": "منى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-04-suspect-5.webp"
      },
      {
        "id": "adv_4_6",
        "name": "مازن",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-04-suspect-6.webp"
      },
      {
        "id": "adv_4_7",
        "name": "رقية",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-04-suspect-7.webp"
      },
      {
        "id": "adv_4_8",
        "name": "أنس",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-04-suspect-8.webp"
      },
      {
        "id": "adv_4_9",
        "name": "خديجة",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-04-suspect-9.webp"
      }
    ],
    "evidenceTerms": [
      {
        "ar": "تاج صغير",
        "en": "Small crown"
      },
      {
        "ar": "كاميرا الاستقبال",
        "en": "Reception camera"
      },
      {
        "ar": "سجل المختبر",
        "en": "Laboratory log"
      },
      {
        "ar": "دفتر الحارس",
        "en": "Guard log"
      },
      {
        "ar": "سجل المعرض",
        "en": "Exhibition log"
      }
    ],
    "clues": [
      {
        "speech": "أثبت كاميرا الاستقبال أن منى، مازن كانوا في الردهة وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_4_5",
          "adv_4_6"
        ],
        "key": "كاميرا الاستقبال",
        "hint": "شفرة المصدر: لابقتسالا اريماك . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "سجل المختبر",
          "كاميرا الاستقبال",
          "دفتر الحارس"
        ]
      },
      {
        "speech": "أثبت سجل المختبر أن رقية، أنس، خديجة كانوا في غرفة التحليل وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_4_7",
          "adv_4_8",
          "adv_4_9"
        ],
        "key": "سجل المختبر",
        "hint": "شفرة المصدر: ربتخملا لجس . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا الاستقبال",
          "دفتر الحارس",
          "سجل المختبر"
        ]
      },
      {
        "speech": "أثبت دفتر الحارس أن إبراهيم، هدى كانوا في الساحة وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_4_0",
          "adv_4_1"
        ],
        "key": "دفتر الحارس",
        "hint": "شفرة المصدر: سراحلا رتفد . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "دفتر الحارس",
          "كاميرا الاستقبال",
          "سجل المختبر"
        ]
      },
      {
        "speech": "أثبت سجل المعرض أن جابر، راهول كانوا في القاعة وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_4_2",
          "adv_4_4"
        ],
        "key": "سجل المعرض",
        "hint": "شفرة المصدر: ضرعملا لجس . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا الاستقبال",
          "سجل المعرض",
          "سجل المختبر"
        ]
      }
    ]
  },
  {
    "id": 205,
    "caseNumber": 5,
    "codeName": "إشارة المنارة الأخيرة",
    "crimeDescription": "أرسلت المنارة إشارة مشفرة قبل انقطاعها سبع دقائق. اختفى رقم التردد من دفتر الراديو وظهرت آثار قرب الدرج.",
    "culpritId": "adv_5_7",
    "suspects": [
      {
        "id": "adv_5_0",
        "name": "مازن",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-05-suspect-0.webp"
      },
      {
        "id": "adv_5_1",
        "name": "رقية",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-05-suspect-1.webp"
      },
      {
        "id": "adv_5_2",
        "name": "أنس",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-05-suspect-2.webp"
      },
      {
        "id": "adv_5_3",
        "name": "خديجة",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-05-suspect-3.webp"
      },
      {
        "id": "adv_5_4",
        "name": "رفيف",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-05-suspect-4.webp"
      },
      {
        "id": "adv_5_5",
        "name": "منصور",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-05-suspect-5.webp"
      },
      {
        "id": "adv_5_6",
        "name": "ليلى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-05-suspect-6.webp"
      },
      {
        "id": "adv_5_7",
        "name": "طارق",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-05-suspect-7.webp"
      },
      {
        "id": "adv_5_8",
        "name": "كارمن",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-05-suspect-8.webp"
      },
      {
        "id": "adv_5_9",
        "name": "هاني",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-05-suspect-9.webp"
      }
    ],
    "evidenceTerms": [
      {
        "ar": "إشارة مشفرة",
        "en": "Coded signal"
      },
      {
        "ar": "سجل القارب",
        "en": "Boat manifest"
      },
      {
        "ar": "كاميرا الميناء",
        "en": "Harbour camera"
      },
      {
        "ar": "تقرير الطقس",
        "en": "Weather report"
      },
      {
        "ar": "دفتر الحراسة",
        "en": "Guard register"
      }
    ],
    "clues": [
      {
        "speech": "أثبت سجل القارب أن منصور، ليلى كانوا في الرصيف وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_5_5",
          "adv_5_6"
        ],
        "key": "سجل القارب",
        "hint": "شفرة المصدر: براقلا لجس . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا الميناء",
          "تقرير الطقس",
          "سجل القارب"
        ]
      },
      {
        "speech": "أثبت كاميرا الميناء أن كارمن، هاني، مازن كانوا في مكتب الميناء وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_5_8",
          "adv_5_9",
          "adv_5_0"
        ],
        "key": "كاميرا الميناء",
        "hint": "شفرة المصدر: ءانيملا اريماك . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا الميناء",
          "سجل القارب",
          "تقرير الطقس"
        ]
      },
      {
        "speech": "أثبت تقرير الطقس أن رقية، أنس كانوا في غرفة الأرصاد وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_5_1",
          "adv_5_2"
        ],
        "key": "تقرير الطقس",
        "hint": "شفرة المصدر: سقطلا ريرقت . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "سجل القارب",
          "تقرير الطقس",
          "كاميرا الميناء"
        ]
      },
      {
        "speech": "أثبت دفتر الحراسة أن خديجة، رفيف كانوا في البوابة البحرية وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_5_3",
          "adv_5_4"
        ],
        "key": "دفتر الحراسة",
        "hint": "شفرة المصدر: ةسارحلا رتفد . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "سجل القارب",
          "كاميرا الميناء",
          "دفتر الحراسة"
        ]
      }
    ]
  },
  {
    "id": 206,
    "caseNumber": 6,
    "codeName": "لغز المرصد الصامت",
    "crimeDescription": "انقطع بث المرصد تسع دقائق، واختفت خريطة نجوم من غرفة مغلقة. ظهرت آثار أحذية قرب القبة رغم انقطاع الكهرباء.",
    "culpritId": "adv_6_9",
    "suspects": [
      {
        "id": "adv_6_0",
        "name": "رامي",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-06-suspect-0.webp"
      },
      {
        "id": "adv_6_1",
        "name": "سعاد",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-06-suspect-1.webp"
      },
      {
        "id": "adv_6_2",
        "name": "نديم",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-06-suspect-2.webp"
      },
      {
        "id": "adv_6_3",
        "name": "جنى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-06-suspect-3.webp"
      },
      {
        "id": "adv_6_4",
        "name": "جنان",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-06-suspect-4.webp"
      },
      {
        "id": "adv_6_5",
        "name": "لورا",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-06-suspect-5.webp"
      },
      {
        "id": "adv_6_6",
        "name": "عادل",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-06-suspect-6.webp"
      },
      {
        "id": "adv_6_7",
        "name": "ليلى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-06-suspect-7.webp"
      },
      {
        "id": "adv_6_8",
        "name": "هاني",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-06-suspect-8.webp"
      },
      {
        "id": "adv_6_9",
        "name": "هارون",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-06-suspect-9.webp"
      },
      {
        "id": "adv_6_10",
        "name": "كارمن",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-06-suspect-10.webp"
      },
      {
        "id": "adv_6_11",
        "name": "يوسف",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-06-suspect-11.webp"
      }
    ],
    "evidenceTerms": [
      {
        "ar": "خريطة نجوم",
        "en": "Star map"
      },
      {
        "ar": "سجل التلسكوب",
        "en": "Telescope log"
      },
      {
        "ar": "كاميرا الساحة",
        "en": "Yard camera"
      },
      {
        "ar": "دفتر الباحثين",
        "en": "Researchers' register"
      },
      {
        "ar": "سجل الطوارئ",
        "en": "Emergency log"
      }
    ],
    "clues": [
      {
        "speech": "أثبت سجل التلسكوب أن عادل، ليلى، هاني كانوا في قاعة الرصد وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_6_6",
          "adv_6_7",
          "adv_6_8"
        ],
        "key": "سجل التلسكوب",
        "hint": "شفرة المصدر: بوكسلتلا لجس . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "سجل التلسكوب",
          "كاميرا الساحة",
          "دفتر الباحثين"
        ]
      },
      {
        "speech": "أثبت كاميرا الساحة أن كارمن، يوسف، رامي كانوا في الساحة الخارجية وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_6_10",
          "adv_6_11",
          "adv_6_0"
        ],
        "key": "كاميرا الساحة",
        "hint": "شفرة المصدر: ةحاسلا اريماك . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "سجل التلسكوب",
          "كاميرا الساحة",
          "دفتر الباحثين"
        ]
      },
      {
        "speech": "أثبت دفتر الباحثين أن سعاد، نديم، جنى كانوا في مختبر الضوء وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_6_1",
          "adv_6_2",
          "adv_6_3"
        ],
        "key": "دفتر الباحثين",
        "hint": "شفرة المصدر: نيثحابلا رتفد . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "سجل التلسكوب",
          "كاميرا الساحة",
          "دفتر الباحثين"
        ]
      },
      {
        "speech": "أثبت سجل الطوارئ أن جنان، لورا كانوا في مركز الإسعاف وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_6_4",
          "adv_6_5"
        ],
        "key": "سجل الطوارئ",
        "hint": "شفرة المصدر: ئراوطلا لجس . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "سجل الطوارئ",
          "سجل التلسكوب",
          "كاميرا الساحة"
        ]
      }
    ]
  },
  {
    "id": 207,
    "caseNumber": 7,
    "codeName": "سر الكأس المسموم",
    "crimeDescription": "بعد المأدبة سقط ضيف فاقدًا الوعي، واختفى الكأس الذي شرب منه. وُجدت آثار مسحوق على المفارش وتضاربت أقوال الخدم.",
    "culpritId": "adv_7_4",
    "suspects": [
      {
        "id": "adv_7_0",
        "name": "نوال",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-07-suspect-0.webp"
      },
      {
        "id": "adv_7_1",
        "name": "يزن",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-07-suspect-1.webp"
      },
      {
        "id": "adv_7_2",
        "name": "مريم",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-07-suspect-2.webp"
      },
      {
        "id": "adv_7_3",
        "name": "كمال",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-07-suspect-3.webp"
      },
      {
        "id": "adv_7_4",
        "name": "سليم",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-07-suspect-4.webp"
      },
      {
        "id": "adv_7_5",
        "name": "إبراهيم",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-07-suspect-5.webp"
      },
      {
        "id": "adv_7_6",
        "name": "سلمى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-07-suspect-6.webp"
      },
      {
        "id": "adv_7_7",
        "name": "جابر",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-07-suspect-7.webp"
      },
      {
        "id": "adv_7_8",
        "name": "رنا",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-07-suspect-8.webp"
      },
      {
        "id": "adv_7_9",
        "name": "طارق",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-07-suspect-9.webp"
      },
      {
        "id": "adv_7_10",
        "name": "منى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-07-suspect-10.webp"
      }
    ],
    "evidenceTerms": [
      {
        "ar": "الكأس",
        "en": "Cup"
      },
      {
        "ar": "كاميرا الصالة",
        "en": "Hall camera"
      },
      {
        "ar": "قائمة الضيوف",
        "en": "Guest register"
      },
      {
        "ar": "سجل العاملين",
        "en": "Staff register"
      },
      {
        "ar": "تسجيل الخدمة",
        "en": "Service footage"
      }
    ],
    "clues": [
      {
        "speech": "أثبت كاميرا الصالة أن رنا، طارق، منى كانوا في غرفة الضيوف وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_7_8",
          "adv_7_9",
          "adv_7_10"
        ],
        "key": "كاميرا الصالة",
        "hint": "شفرة المصدر: ةلاصلا اريماك . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "قائمة الضيوف",
          "كاميرا الصالة",
          "سجل العاملين"
        ]
      },
      {
        "speech": "أثبت قائمة الضيوف أن نوال، يزن، مريم كانوا في الحديقة وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_7_0",
          "adv_7_1",
          "adv_7_2"
        ],
        "key": "قائمة الضيوف",
        "hint": "شفرة المصدر: فويضلا ةمئاق . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا الصالة",
          "سجل العاملين",
          "قائمة الضيوف"
        ]
      },
      {
        "speech": "أثبت سجل العاملين أن كمال، إبراهيم كانوا في المطبخ الخارجي وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_7_3",
          "adv_7_5"
        ],
        "key": "سجل العاملين",
        "hint": "شفرة المصدر: نيلماعلا لجس . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "سجل العاملين",
          "كاميرا الصالة",
          "قائمة الضيوف"
        ]
      },
      {
        "speech": "أثبت تسجيل الخدمة أن سلمى، جابر كانوا في غرفة الأطباق وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_7_6",
          "adv_7_7"
        ],
        "key": "تسجيل الخدمة",
        "hint": "شفرة المصدر: ةمدخلا ليجست . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا الصالة",
          "تسجيل الخدمة",
          "قائمة الضيوف"
        ]
      }
    ]
  },
  {
    "id": 208,
    "caseNumber": 8,
    "codeName": "الرسالة التي لم تبتل",
    "crimeDescription": "وُجدت الرسالة السرية في غرفة غمرتها المياه لكنها بقيت جافة. اختفى الختم الأحمر وظهرت بصمة على الظرف.",
    "culpritId": "adv_8_5",
    "suspects": [
      {
        "id": "adv_8_0",
        "name": "فهد",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-08-suspect-0.webp"
      },
      {
        "id": "adv_8_1",
        "name": "عبير",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-08-suspect-1.webp"
      },
      {
        "id": "adv_8_2",
        "name": "هدى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-08-suspect-2.webp"
      },
      {
        "id": "adv_8_3",
        "name": "راهول",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-08-suspect-3.webp"
      },
      {
        "id": "adv_8_4",
        "name": "منى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-08-suspect-4.webp"
      },
      {
        "id": "adv_8_5",
        "name": "كارمن",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-08-suspect-5.webp"
      },
      {
        "id": "adv_8_6",
        "name": "منصور",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-08-suspect-6.webp"
      },
      {
        "id": "adv_8_7",
        "name": "رقية",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-08-suspect-7.webp"
      },
      {
        "id": "adv_8_8",
        "name": "أنس",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-08-suspect-8.webp"
      },
      {
        "id": "adv_8_9",
        "name": "خديجة",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-08-suspect-9.webp"
      },
      {
        "id": "adv_8_10",
        "name": "رفيف",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-08-suspect-10.webp"
      }
    ],
    "evidenceTerms": [
      {
        "ar": "الرسالة السرية",
        "en": "Secret letter"
      },
      {
        "ar": "كاميرا الشارع",
        "en": "Street camera"
      },
      {
        "ar": "دفتر البريد",
        "en": "Mail register"
      },
      {
        "ar": "سجل الصيانة",
        "en": "Maintenance log"
      },
      {
        "ar": "شهادة الموظف",
        "en": "Staff statement"
      }
    ],
    "clues": [
      {
        "speech": "أثبت كاميرا الشارع أن خديجة، رفيف، فهد كانوا في البوابة وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_8_9",
          "adv_8_10",
          "adv_8_0"
        ],
        "key": "كاميرا الشارع",
        "hint": "شفرة المصدر: عراشلا اريماك . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "دفتر البريد",
          "سجل الصيانة",
          "كاميرا الشارع"
        ]
      },
      {
        "speech": "أثبت دفتر البريد أن عبير، هدى، راهول كانوا في ردهة البريد وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_8_1",
          "adv_8_2",
          "adv_8_3"
        ],
        "key": "دفتر البريد",
        "hint": "شفرة المصدر: ديربلا رتفد . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "دفتر البريد",
          "كاميرا الشارع",
          "سجل الصيانة"
        ]
      },
      {
        "speech": "أثبت سجل الصيانة أن منى، منصور كانوا في غرفة المضخات وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_8_4",
          "adv_8_6"
        ],
        "key": "سجل الصيانة",
        "hint": "شفرة المصدر: ةنايصلا لجس . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا الشارع",
          "سجل الصيانة",
          "دفتر البريد"
        ]
      },
      {
        "speech": "أثبت شهادة الموظف أن رقية، أنس كانوا في الطابق العلوي وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_8_7",
          "adv_8_8"
        ],
        "key": "شهادة الموظف",
        "hint": "شفرة المصدر: فظوملا ةداهش . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا الشارع",
          "دفتر البريد",
          "شهادة الموظف"
        ]
      }
    ]
  },
  {
    "id": 209,
    "caseNumber": 9,
    "codeName": "لص القناع المزدوج",
    "crimeDescription": "اختفى القناع الأثري أثناء تبديل المشهد دون فتح باب الغرفة. ظهر شخص في المرآة مرتين بملابس مختلفة، ووُجد خيط أسود.",
    "culpritId": "adv_9_8",
    "suspects": [
      {
        "id": "adv_9_0",
        "name": "كارمن",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-09-suspect-0.webp"
      },
      {
        "id": "adv_9_1",
        "name": "لينا",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-09-suspect-1.webp"
      },
      {
        "id": "adv_9_2",
        "name": "تامر",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-09-suspect-2.webp"
      },
      {
        "id": "adv_9_3",
        "name": "كمال",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-09-suspect-3.webp"
      },
      {
        "id": "adv_9_4",
        "name": "شذى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-09-suspect-4.webp"
      },
      {
        "id": "adv_9_5",
        "name": "رفيف",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-09-suspect-5.webp"
      },
      {
        "id": "adv_9_6",
        "name": "ليلى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-09-suspect-6.webp"
      },
      {
        "id": "adv_9_7",
        "name": "طارق",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-09-suspect-7.webp"
      },
      {
        "id": "adv_9_8",
        "name": "هاني",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-09-suspect-8.webp"
      },
      {
        "id": "adv_9_9",
        "name": "نوال",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-09-suspect-9.webp"
      }
    ],
    "evidenceTerms": [
      {
        "ar": "القناع الأثري",
        "en": "Antique mask"
      },
      {
        "ar": "كاميرا المدخل",
        "en": "Entrance camera"
      },
      {
        "ar": "سجل الملابس",
        "en": "Costume register"
      },
      {
        "ar": "قائمة العرض",
        "en": "Show roster"
      },
      {
        "ar": "دفتر الحراسة",
        "en": "Guard register"
      }
    ],
    "clues": [
      {
        "speech": "أثبت كاميرا المدخل أن كارمن، لينا كانوا في الردهة وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_9_0",
          "adv_9_1"
        ],
        "key": "كاميرا المدخل",
        "hint": "شفرة المصدر: لخدملا اريماك . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا المدخل",
          "سجل الملابس",
          "قائمة العرض"
        ]
      },
      {
        "speech": "أثبت سجل الملابس أن تامر، كمال، شذى كانوا في مخزن الأزياء وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_9_2",
          "adv_9_3",
          "adv_9_4"
        ],
        "key": "سجل الملابس",
        "hint": "شفرة المصدر: سبالملا لجس . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا المدخل",
          "سجل الملابس",
          "قائمة العرض"
        ]
      },
      {
        "speech": "أثبت قائمة العرض أن رفيف، ليلى كانوا في منصة الجمهور وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_9_5",
          "adv_9_6"
        ],
        "key": "قائمة العرض",
        "hint": "شفرة المصدر: ضرعلا ةمئاق . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا المدخل",
          "سجل الملابس",
          "قائمة العرض"
        ]
      },
      {
        "speech": "أثبت دفتر الحراسة أن طارق، نوال كانوا في الممر الغربي وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_9_7",
          "adv_9_9"
        ],
        "key": "دفتر الحراسة",
        "hint": "شفرة المصدر: ةسارحلا رتفد . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "دفتر الحراسة",
          "كاميرا المدخل",
          "سجل الملابس"
        ]
      }
    ]
  },
  {
    "id": 210,
    "caseNumber": 10,
    "codeName": "البوصلة التي لم تنحرف",
    "crimeDescription": "اختفت البوصلة القديمة من غرفة أبحاث متجمدة. ظهرت آثار أقدام مختلفة في الثلج وانقطع الراديو دقائق.",
    "culpritId": "adv_10_4",
    "suspects": [
      {
        "id": "adv_10_0",
        "name": "مازن",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-10-suspect-0.webp"
      },
      {
        "id": "adv_10_1",
        "name": "رقية",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-10-suspect-1.webp"
      },
      {
        "id": "adv_10_2",
        "name": "أنس",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-10-suspect-2.webp"
      },
      {
        "id": "adv_10_3",
        "name": "خديجة",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-10-suspect-3.webp"
      },
      {
        "id": "adv_10_4",
        "name": "منصور",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-10-suspect-4.webp"
      },
      {
        "id": "adv_10_5",
        "name": "إبراهيم",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-10-suspect-5.webp"
      },
      {
        "id": "adv_10_6",
        "name": "سلمى",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-10-suspect-6.webp"
      },
      {
        "id": "adv_10_7",
        "name": "جابر",
        "gender": "ذكر",
        "image": "/detective/advanced/portraits/case-10-suspect-7.webp"
      },
      {
        "id": "adv_10_8",
        "name": "مريم",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-10-suspect-8.webp"
      },
      {
        "id": "adv_10_9",
        "name": "لورا",
        "gender": "أنثى",
        "image": "/detective/advanced/portraits/case-10-suspect-9.webp"
      }
    ],
    "evidenceTerms": [
      {
        "ar": "البوصلة القديمة",
        "en": "Antique compass"
      },
      {
        "ar": "سجل المركبة",
        "en": "Vehicle register"
      },
      {
        "ar": "كاميرا المخزن",
        "en": "Storage camera"
      },
      {
        "ar": "تقرير الطقس",
        "en": "Weather report"
      },
      {
        "ar": "شهادة الباحث",
        "en": "Researcher statement"
      }
    ],
    "clues": [
      {
        "speech": "أثبت سجل المركبة أن رقية، أنس كانوا في موقف الثلج وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_10_1",
          "adv_10_2"
        ],
        "key": "سجل المركبة",
        "hint": "شفرة المصدر: ةبكرملا لجس . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "كاميرا المخزن",
          "سجل المركبة",
          "تقرير الطقس"
        ]
      },
      {
        "speech": "أثبت كاميرا المخزن أن خديجة، إبراهيم، سلمى كانوا في مخزن المؤن وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_10_3",
          "adv_10_5",
          "adv_10_6"
        ],
        "key": "كاميرا المخزن",
        "hint": "شفرة المصدر: نزخملا اريماك . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "سجل المركبة",
          "تقرير الطقس",
          "كاميرا المخزن"
        ]
      },
      {
        "speech": "أثبت تقرير الطقس أن جابر، مريم كانوا في المنصة الجنوبية وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_10_7",
          "adv_10_8"
        ],
        "key": "تقرير الطقس",
        "hint": "شفرة المصدر: سقطلا ريرقت . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "تقرير الطقس",
          "سجل المركبة",
          "كاميرا المخزن"
        ]
      },
      {
        "speech": "أثبت شهادة الباحث أن لورا، مازن كانوا في قاعة الخرائط وقت الواقعة، ولا يمكن أن يكونوا في مسرح الجريمة.",
        "innocentIds": [
          "adv_10_9",
          "adv_10_0"
        ],
        "key": "شهادة الباحث",
        "hint": "شفرة المصدر: ثحابلا ةداهش . اقرأ الكلمات من النهاية إلى البداية، ثم اختر المصدر الصحيح.",
        "options": [
          "سجل المركبة",
          "شهادة الباحث",
          "كاميرا المخزن"
        ]
      }
    ]
  }
];

export const createAdvancedDetectiveCases = (_legacyRoster?: SuspectPerson[]): DetectiveCase[] =>
 ADVANCED_CASE_SEEDS.map(s => ({
  id:s.id, level:'advanced' as const, caseNumber:s.caseNumber, caseIndex:s.caseNumber-1,
  codeName:s.codeName, crimeDescription:s.crimeDescription,
  bgImage:`url("/detective/advanced/scene-${String(s.caseNumber).padStart(2,'0')}.webp")`,
  culpritId:s.culpritId, suspects:s.suspects, suspectIds:s.suspects.map(p=>p.id),
  evidenceTerms:s.evidenceTerms,
  clues:s.clues.map(c => ({speech:c.speech,matcher:(p:SuspectPerson)=>c.innocentIds.includes(p.id),
   cipherKey:c.key,cipherHint:c.hint,cipherOptions:c.options})),
 }));
