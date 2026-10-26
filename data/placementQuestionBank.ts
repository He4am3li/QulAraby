// Reviewed offline fallback bank: 10 distinct items per each of eight assessment sections.
// For speaking/writing, these are objective diagnostics, not direct production assessments.
export type PlacementBankItem = {question:string;options:string[];correctAnswer:string;audioPrompt?:string;questionEn?:string};
const BANK: Record<string, PlacementBankItem[]> = {
  "letters": [
    {
      "question": "اختر الحرف الذي يبدأ به اسم «أسد».",
      "correctAnswer": "أ",
      "options": [
        "أ",
        "ب",
        "ت",
        "ث"
      ]
    },
    {
      "question": "ما الحرف الذي يبدأ به اسم «بيت»؟",
      "correctAnswer": "ب",
      "options": [
        "ب",
        "ن",
        "ي",
        "ت"
      ]
    },
    {
      "question": "اختر شكل حرف التاء في أول الكلمة.",
      "correctAnswer": "تـ",
      "options": [
        "تـ",
        "ـت",
        "ـتـ",
        "ثـ"
      ]
    },
    {
      "question": "ما الحرف الأخير في كلمة «قلم»؟",
      "correctAnswer": "م",
      "options": [
        "م",
        "ق",
        "ل",
        "ن"
      ]
    },
    {
      "question": "أكمل: كتا...",
      "correctAnswer": "ب",
      "options": [
        "ب",
        "ت",
        "ث",
        "ن"
      ]
    },
    {
      "question": "أي كلمة تبدأ بحرف السين؟",
      "correctAnswer": "سمك",
      "options": [
        "سمك",
        "قمر",
        "بيت",
        "ورد"
      ]
    },
    {
      "question": "ما الحرف الذي يأتي بعد الدال؟",
      "correctAnswer": "ذ",
      "options": [
        "ذ",
        "ر",
        "ز",
        "ج"
      ]
    },
    {
      "question": "اختر الحرف الذي له ثلاث نقاط فوقه.",
      "correctAnswer": "ث",
      "options": [
        "ث",
        "ت",
        "ب",
        "ن"
      ]
    },
    {
      "question": "أي كلمة تحتوي على حرف الشين؟",
      "correctAnswer": "شمس",
      "options": [
        "شمس",
        "سهل",
        "قلم",
        "بيت"
      ]
    },
    {
      "question": "رتّب الحروف لتكوّن كلمة: م - ل - ق.",
      "correctAnswer": "قلم",
      "options": [
        "قلم",
        "قمل",
        "ملق",
        "لقم"
      ]
    }
  ],
  "vocab": [
    {
      "question": "ما معنى كلمة «كتاب» بالإنجليزية؟",
      "correctAnswer": "Book",
      "options": [
        "Book",
        "Pen",
        "School",
        "Chair"
      ]
    },
    {
      "question": "ما معنى كلمة «مدرسة» بالإنجليزية؟",
      "correctAnswer": "School",
      "options": [
        "School",
        "House",
        "Street",
        "Market"
      ]
    },
    {
      "question": "أكمل: أشربُ ...",
      "correctAnswer": "الماء",
      "options": [
        "الماء",
        "القلم",
        "الباب",
        "الكرسي"
      ]
    },
    {
      "question": "ما ضد كلمة «كبير»؟",
      "correctAnswer": "صغير",
      "options": [
        "صغير",
        "طويل",
        "جميل",
        "سريع"
      ]
    },
    {
      "question": "ما مرادف كلمة «سعيد»؟",
      "correctAnswer": "فرح",
      "options": [
        "فرح",
        "حزين",
        "مريض",
        "جائع"
      ]
    },
    {
      "question": "اختر الكلمة المناسبة: الطبيب يعمل في ...",
      "correctAnswer": "المستشفى",
      "options": [
        "المستشفى",
        "المطار",
        "الحديقة",
        "المخبز"
      ]
    },
    {
      "question": "أي الكلمات تدل على لون؟",
      "correctAnswer": "أزرق",
      "options": [
        "أزرق",
        "مكتب",
        "سيارة",
        "طعام"
      ]
    },
    {
      "question": "ما ضد كلمة «بارد»؟",
      "correctAnswer": "ساخن",
      "options": [
        "ساخن",
        "جديد",
        "قصير",
        "بعيد"
      ]
    },
    {
      "question": "اختر الكلمة المختلفة.",
      "correctAnswer": "تفاح",
      "options": [
        "تفاح",
        "موز",
        "برتقال",
        "طاولة"
      ]
    },
    {
      "question": "ما معنى «يستيقظ»؟",
      "correctAnswer": "ينهض من النوم",
      "options": [
        "ينهض من النوم",
        "يذهب إلى السوق",
        "يأكل الطعام",
        "يكتب رسالة"
      ]
    }
  ],
  "grammar": [
    {
      "question": "اختر الضمير المناسب: ... طالبٌ.",
      "correctAnswer": "هو",
      "options": [
        "هو",
        "هي",
        "هم",
        "هن"
      ]
    },
    {
      "question": "أكمل: البنتُ ... الدرسَ.",
      "correctAnswer": "تقرأُ",
      "options": [
        "تقرأُ",
        "يقرأُ",
        "يقرؤون",
        "نقرأُ"
      ]
    },
    {
      "question": "ما الفعل الماضي من «يكتب»؟",
      "correctAnswer": "كتب",
      "options": [
        "كتب",
        "اكتب",
        "سيكتب",
        "كاتب"
      ]
    },
    {
      "question": "اختر الجملة الاسمية.",
      "correctAnswer": "السماءُ صافيةٌ",
      "options": [
        "السماءُ صافيةٌ",
        "ذهب الطالبُ",
        "اكتب الدرس",
        "لن أتأخر"
      ]
    },
    {
      "question": "اختر حرف الجر.",
      "correctAnswer": "في",
      "options": [
        "في",
        "لكن",
        "ثم",
        "هل"
      ]
    },
    {
      "question": "أكمل: الطالبان ...",
      "correctAnswer": "مجتهدان",
      "options": [
        "مجتهدان",
        "مجتهدون",
        "مجتهدة",
        "مجتهدات"
      ]
    },
    {
      "question": "ما نوع كلمة «سريع» في «قطار سريع»؟",
      "correctAnswer": "صفة",
      "options": [
        "صفة",
        "فعل",
        "حرف جر",
        "ضمير"
      ]
    },
    {
      "question": "أكمل: لم ... أحمدُ.",
      "correctAnswer": "يذهبْ",
      "options": [
        "يذهبْ",
        "يذهبُ",
        "ذهبَ",
        "يذهبَ"
      ]
    },
    {
      "question": "اختر المثنى الصحيح لكلمة «معلم».",
      "correctAnswer": "معلمان",
      "options": [
        "معلمان",
        "معلمون",
        "معلمات",
        "معلم"
      ]
    },
    {
      "question": "أكمل: في الفصل ... طلابٍ.",
      "correctAnswer": "خمسةُ",
      "options": [
        "خمسةُ",
        "خمسُ",
        "خامسٌ",
        "خمسونَ"
      ]
    }
  ],
  "translator": [
    {
      "question": "ترجم كلمة House إلى العربية.",
      "correctAnswer": "بيت",
      "options": [
        "بيت",
        "شارع",
        "مدرسة",
        "مدينة"
      ]
    },
    {
      "question": "ترجم كلمة Water إلى العربية.",
      "correctAnswer": "ماء",
      "options": [
        "ماء",
        "هواء",
        "طعام",
        "نار"
      ]
    },
    {
      "question": "ترجم: I read a book.",
      "correctAnswer": "أقرأ كتابًا",
      "options": [
        "أقرأ كتابًا",
        "أكتب كتابًا",
        "أشتري كتابًا",
        "أحمل كتابًا"
      ]
    },
    {
      "question": "ترجم: Good morning.",
      "correctAnswer": "صباح الخير",
      "options": [
        "صباح الخير",
        "مساء الخير",
        "إلى اللقاء",
        "تصبح على خير"
      ]
    },
    {
      "question": "ترجم: The girl is happy.",
      "correctAnswer": "البنت سعيدة",
      "options": [
        "البنت سعيدة",
        "الولد سعيد",
        "البنت حزينة",
        "الولد حزين"
      ]
    },
    {
      "question": "ترجم: Where is the school?",
      "correctAnswer": "أين المدرسة؟",
      "options": [
        "أين المدرسة؟",
        "متى المدرسة؟",
        "كيف المدرسة؟",
        "من في المدرسة؟"
      ]
    },
    {
      "question": "ترجم: I do not understand.",
      "correctAnswer": "أنا لا أفهم",
      "options": [
        "أنا لا أفهم",
        "أنا لا أذهب",
        "أنا لا أسمع",
        "أنا لا أكتب"
      ]
    },
    {
      "question": "ترجم: The weather is hot today.",
      "correctAnswer": "الطقس حار اليوم",
      "options": [
        "الطقس حار اليوم",
        "الطقس بارد اليوم",
        "الجو ممطر غدًا",
        "الجو جميل أمس"
      ]
    },
    {
      "question": "ترجم: She went to the market yesterday.",
      "correctAnswer": "ذهبت إلى السوق أمس",
      "options": [
        "ذهبت إلى السوق أمس",
        "ذهبت إلى المدرسة اليوم",
        "ذهب إلى السوق أمس",
        "ستذهب إلى السوق غدًا"
      ]
    },
    {
      "question": "ترجم: Reading helps us learn.",
      "correctAnswer": "القراءة تساعدنا على التعلم",
      "options": [
        "القراءة تساعدنا على التعلم",
        "الكتابة تمنعنا من التعلم",
        "القراءة صعبة دائمًا",
        "الرياضة تساعدنا على النوم"
      ]
    }
  ],
  "listening": [
    {
      "question": "استمع إلى «صباح الخير». ما التحية التي سمعتها؟",
      "correctAnswer": "صباح الخير",
      "options": [
        "صباح الخير",
        "مساء الخير",
        "شكرًا",
        "إلى اللقاء"
      ],
      "audioPrompt": "صباح الخير"
    },
    {
      "question": "استمع إلى «اسمي أحمد». ما الاسم المذكور؟",
      "correctAnswer": "أحمد",
      "options": [
        "أحمد",
        "خالد",
        "علي",
        "عمر"
      ],
      "audioPrompt": "اسمي أحمد"
    },
    {
      "question": "استمع إلى «أنا في المدرسة». أين المتحدث؟",
      "correctAnswer": "المدرسة",
      "options": [
        "المدرسة",
        "البيت",
        "السوق",
        "المستشفى"
      ],
      "audioPrompt": "أنا في المدرسة"
    },
    {
      "question": "استمع إلى «الجو اليوم بارد». كيف الجو؟",
      "correctAnswer": "بارد",
      "options": [
        "بارد",
        "حار",
        "مشمس",
        "عاصف"
      ],
      "audioPrompt": "الجو اليوم بارد"
    },
    {
      "question": "استمع إلى «اشتريت ثلاثة كتب». كم كتابًا اشترى؟",
      "correctAnswer": "ثلاثة",
      "options": [
        "ثلاثة",
        "اثنين",
        "أربعة",
        "خمسة"
      ],
      "audioPrompt": "اشتريت ثلاثة كتب"
    },
    {
      "question": "استمع إلى «سأزور صديقي غدًا». متى الزيارة؟",
      "correctAnswer": "غدًا",
      "options": [
        "غدًا",
        "أمس",
        "اليوم",
        "الأسبوع الماضي"
      ],
      "audioPrompt": "سأزور صديقي غدًا"
    },
    {
      "question": "استمع إلى «القطار أسرع من الحافلة». ما الأسرع؟",
      "correctAnswer": "القطار",
      "options": [
        "القطار",
        "الحافلة",
        "الدراجة",
        "القارب"
      ],
      "audioPrompt": "القطار أسرع من الحافلة"
    },
    {
      "question": "استمع إلى «أريد ماءً من فضلك». ماذا يريد؟",
      "correctAnswer": "ماءً",
      "options": [
        "ماءً",
        "حليبًا",
        "عصيرًا",
        "خبزًا"
      ],
      "audioPrompt": "أريد ماءً من فضلك"
    },
    {
      "question": "استمع إلى «وصلت الطائرة الساعة الثامنة». متى وصلت؟",
      "correctAnswer": "الثامنة",
      "options": [
        "الثامنة",
        "السابعة",
        "التاسعة",
        "العاشرة"
      ],
      "audioPrompt": "وصلت الطائرة الساعة الثامنة"
    },
    {
      "question": "استمع إلى «لم يذهب سامي إلى المدرسة لأنه مريض». لماذا غاب سامي؟",
      "correctAnswer": "لأنه مريض",
      "options": [
        "لأنه مريض",
        "لأنه مسافر",
        "لأنه نائم",
        "لأنه مشغول"
      ],
      "audioPrompt": "لم يذهب سامي إلى المدرسة لأنه مريض"
    }
  ],
  "speaking": [
    {
      "question": "اختر الرد المناسب شفهيًا على «كيف حالك؟»",
      "correctAnswer": "أنا بخير، شكرًا",
      "options": [
        "أنا بخير، شكرًا",
        "اسمي كتاب",
        "في المدرسة أمس",
        "لوني أزرق"
      ]
    },
    {
      "question": "ماذا تقول عندما تقابل شخصًا صباحًا؟",
      "correctAnswer": "صباح الخير",
      "options": [
        "صباح الخير",
        "تصبح على خير",
        "إلى اللقاء",
        "أعتذر"
      ]
    },
    {
      "question": "اختر عبارة تقدم بها نفسك.",
      "correctAnswer": "اسمي ليلى",
      "options": [
        "اسمي ليلى",
        "هذا كتابي",
        "الباب مفتوح",
        "الجو بارد"
      ]
    },
    {
      "question": "كيف تطلب الماء بأدب؟",
      "correctAnswer": "أريد ماءً من فضلك",
      "options": [
        "أريد ماءً من فضلك",
        "أغلق الباب",
        "أين القطار؟",
        "أنا متعب"
      ]
    },
    {
      "question": "ما الرد المناسب على «شكرًا»؟",
      "correctAnswer": "عفوًا",
      "options": [
        "عفوًا",
        "صباحًا",
        "غدًا",
        "أبدًا"
      ]
    },
    {
      "question": "كيف تسأل عن مكان المكتبة؟",
      "correctAnswer": "أين المكتبة؟",
      "options": [
        "أين المكتبة؟",
        "متى نقرأ؟",
        "لماذا الكتاب؟",
        "من يكتب؟"
      ]
    },
    {
      "question": "ما العبارة المناسبة لوصف هوايتك؟",
      "correctAnswer": "أحب الرسم",
      "options": [
        "أحب الرسم",
        "النافذة كبيرة",
        "السيارة جديدة",
        "الطريق طويل"
      ]
    },
    {
      "question": "كيف تعتذر عن التأخر؟",
      "correctAnswer": "أعتذر عن التأخر",
      "options": [
        "أعتذر عن التأخر",
        "أهلًا وسهلًا",
        "أحسنت",
        "بالتوفيق"
      ]
    },
    {
      "question": "ما العبارة المناسبة لإبداء رأيك؟",
      "correctAnswer": "أرى أن القراءة مفيدة",
      "options": [
        "أرى أن القراءة مفيدة",
        "كم الساعة؟",
        "افتح الباب",
        "أين المنزل؟"
      ]
    },
    {
      "question": "كيف تطلب من زميلك إعادة الكلام؟",
      "correctAnswer": "هل يمكنك إعادة ما قلت؟",
      "options": [
        "هل يمكنك إعادة ما قلت؟",
        "أريد الذهاب الآن",
        "الطعام لذيذ",
        "الكتاب على الطاولة"
      ]
    }
  ],
  "reading": [
    {
      "question": "اقرأ: «ذهب علي إلى السوق». إلى أين ذهب علي؟",
      "correctAnswer": "السوق",
      "options": [
        "السوق",
        "المدرسة",
        "البيت",
        "الحديقة"
      ]
    },
    {
      "question": "اقرأ: «الوردة حمراء». ما لون الوردة؟",
      "correctAnswer": "أحمر",
      "options": [
        "أحمر",
        "أصفر",
        "أبيض",
        "أزرق"
      ]
    },
    {
      "question": "اقرأ: «تدرس مريم في الصباح». متى تدرس مريم؟",
      "correctAnswer": "الصباح",
      "options": [
        "الصباح",
        "المساء",
        "الليل",
        "الظهر"
      ]
    },
    {
      "question": "اقرأ: «أكل عمر التفاحة ثم شرب الماء». ماذا فعل بعد الأكل؟",
      "correctAnswer": "شرب الماء",
      "options": [
        "شرب الماء",
        "نام",
        "قرأ",
        "لعب"
      ]
    },
    {
      "question": "اقرأ: «في الحديقة خمس شجرات». كم شجرة؟",
      "correctAnswer": "خمس",
      "options": [
        "خمس",
        "ثلاث",
        "أربع",
        "ست"
      ]
    },
    {
      "question": "اقرأ: «لم يخرج خالد بسبب المطر». لماذا لم يخرج؟",
      "correctAnswer": "بسبب المطر",
      "options": [
        "بسبب المطر",
        "بسبب الحر",
        "بسبب الدراسة",
        "بسبب السفر"
      ]
    },
    {
      "question": "اقرأ: «المكتبة تفتح الساعة التاسعة». متى تفتح؟",
      "correctAnswer": "التاسعة",
      "options": [
        "التاسعة",
        "الثامنة",
        "العاشرة",
        "السابعة"
      ]
    },
    {
      "question": "اقرأ: «ركبنا الحافلة إلى المتحف». كيف ذهبوا؟",
      "correctAnswer": "بالحافلة",
      "options": [
        "بالحافلة",
        "بالقطار",
        "بالطائرة",
        "بالسيارة"
      ]
    },
    {
      "question": "اقرأ: «الرياضة تقوي الجسم وتحسن الصحة». ما الفكرة الرئيسية؟",
      "correctAnswer": "فوائد الرياضة",
      "options": [
        "فوائد الرياضة",
        "أنواع الطعام",
        "وسائل النقل",
        "الطقس"
      ]
    },
    {
      "question": "اقرأ: «رغم التعب أكمل الفريق العمل». ماذا نفهم؟",
      "correctAnswer": "أن الفريق ثابر",
      "options": [
        "أن الفريق ثابر",
        "أن الفريق استسلم",
        "أن الفريق نام",
        "أن الفريق سافر"
      ]
    }
  ],
  "writing": [
    {
      "question": "اختر الكتابة الصحيحة.",
      "correctAnswer": "مدرسة",
      "options": [
        "مدرسة",
        "مدرصة",
        "مدرسه",
        "مدرست"
      ]
    },
    {
      "question": "أي كلمة مكتوبة كتابة صحيحة؟",
      "correctAnswer": "مسؤول",
      "options": [
        "مسؤول",
        "مسئولل",
        "مسؤل",
        "مسوؤل"
      ]
    },
    {
      "question": "اختر الجملة الصحيحة.",
      "correctAnswer": "ذهبتُ إلى المدرسة.",
      "options": [
        "ذهبتُ إلى المدرسة.",
        "ذهبتُ إلا المدرسة.",
        "ذهبتُ الى المدرسه.",
        "ذهبتُ إلى المدرسه"
      ]
    },
    {
      "question": "أكمل كتابة الجملة: «أنا ... العربية».",
      "correctAnswer": "أتعلم",
      "options": [
        "أتعلم",
        "يتعلم",
        "تتعلمون",
        "نتعلمون"
      ]
    },
    {
      "question": "اختر علامة الترقيم المناسبة لنهاية السؤال: «أين تسكن»",
      "correctAnswer": "؟",
      "options": [
        "؟",
        ".",
        "!",
        "،"
      ]
    },
    {
      "question": "اختر الكلمة الصحيحة: «قرأتُ ... مفيدةً».",
      "correctAnswer": "قصةً",
      "options": [
        "قصةً",
        "قصتًا",
        "قسهً",
        "قصةٌ"
      ]
    },
    {
      "question": "أي جملة مرتبة ترتيبًا صحيحًا؟",
      "correctAnswer": "الطالب يكتب الدرس",
      "options": [
        "الطالب يكتب الدرس",
        "يكتب الطالبَ الدرسُ",
        "الدرس الطالب يكتب",
        "الطالب الدرس يكتبُهُ"
      ]
    },
    {
      "question": "اختر الصياغة الصحيحة للجمع.",
      "correctAnswer": "هؤلاء معلمون",
      "options": [
        "هؤلاء معلمون",
        "هذا معلمون",
        "هذه معلمون",
        "هذان معلمون"
      ]
    },
    {
      "question": "اختر الربط الأنسب: «درست جيدًا، ... نجحت».",
      "correctAnswer": "لذلك",
      "options": [
        "لذلك",
        "لكن",
        "رغم",
        "بينما"
      ]
    },
    {
      "question": "اختر الجملة الأكثر وضوحًا.",
      "correctAnswer": "أحب القراءة لأنها توسع معرفتي.",
      "options": [
        "أحب القراءة لأنها توسع معرفتي.",
        "أحب القراءة لأن.",
        "القراءة أحب لأنها.",
        "توسع القراءة معرفتي أحب"
      ]
    }
  ]
};

// English task prompts keep the Arabic target visible without disclosing the answer.
const ENGLISH_PROMPTS: Record<string,string[]> = {
  "letters": [
    "Which letter begins the word «أسد»?",
    "Which letter begins the word «بيت»?",
    "Which is the initial form of the letter ت?",
    "Which letter is at the end of «قلم»?",
    "Complete the word: كتا...",
    "Which word begins with the letter س?",
    "Which letter comes after د?",
    "Which letter has three dots above it?",
    "Which word contains the letter ش?",
    "Arrange the letters م - ل - ق to form a word."
  ],
  "vocab": [
    "What is the meaning of «كتاب»?",
    "What is the meaning of «مدرسة»?",
    "Complete the sentence: أشربُ ...",
    "What is the opposite of «كبير»?",
    "What is a synonym of «سعيد»?",
    "Complete the sentence: الطبيب يعمل في ...",
    "Which word names a color?",
    "What is the opposite of «بارد»?",
    "Which word does not belong to the group?",
    "What is the meaning of «يستيقظ»?"
  ],
  "grammar": [
    "Choose the correct pronoun: ... طالبٌ.",
    "Complete the sentence: البنتُ ... الدرسَ.",
    "What is the past tense of «يكتب»?",
    "Which sentence begins with a noun?",
    "Which option is a preposition?",
    "Complete the sentence: الطالبان ...",
    "What is the grammatical role of «سريع» in «قطار سريع»?",
    "Complete the sentence: لم ... أحمدُ.",
    "Which is the dual form of «معلم»?",
    "Complete the sentence: في الفصل ... طلابٍ."
  ],
  "translator": [
    "What is the Arabic translation of 'House'?",
    "What is the Arabic translation of 'Water'?",
    "Which Arabic sentence means 'I read a book'?",
    "Which Arabic phrase means 'Good morning'?",
    "Which Arabic sentence means 'The girl is happy'?",
    "Which Arabic sentence means 'Where is the school'?",
    "Which Arabic sentence means 'I do not understand'?",
    "Which Arabic sentence means 'The weather is hot today'?",
    "Which Arabic sentence means 'She went to the market yesterday'?",
    "Which Arabic sentence means 'Reading helps us learn'?"
  ],
  "listening": [
    "Which greeting did you hear?",
    "Which name did the speaker say?",
    "Where is the speaker?",
    "How is the weather?",
    "How many books did the speaker buy?",
    "When will the visit take place?",
    "Which means of transport is faster?",
    "What does the speaker want?",
    "At what time did the plane arrive?",
    "Why was Sami absent from school?"
  ],
  "speaking": [
    "Which response is appropriate for 'How are you'?",
    "What would you say when greeting someone in the morning?",
    "Which sentence can you use to introduce yourself?",
    "How would you politely ask for water?",
    "How would you respond to 'Thank you'?",
    "How would you ask where the library is?",
    "Which sentence describes your hobby?",
    "How would you apologize for being late?",
    "Which sentence expresses your opinion?",
    "How would you ask someone to repeat what they said?"
  ],
  "reading": [
    "Where did Ali go? Read: «ذهب علي إلى السوق».",
    "What color is the flower? Read: «الوردة حمراء».",
    "When does Maryam study? Read: «تدرس مريم في الصباح».",
    "What did Omar do after eating? Read: «أكل عمر التفاحة ثم شرب الماء».",
    "How many trees are in the garden? Read: «في الحديقة خمس شجرات».",
    "Why did Khalid stay inside? Read: «لم يخرج خالد بسبب المطر».",
    "When does the library open? Read: «المكتبة تفتح الساعة التاسعة».",
    "How did they travel to the museum? Read: «ركبنا الحافلة إلى المتحف».",
    "What is the main idea? Read: «الرياضة تقوي الجسم وتحسن الصحة».",
    "What can you infer? Read: «رغم التعب أكمل الفريق العمل»."
  ],
  "writing": [
    "Which word is spelled correctly?",
    "Which word is written correctly?",
    "Which sentence is written correctly?",
    "Complete the sentence: «أنا ... العربية».",
    "Which punctuation mark completes «أين تسكن»?",
    "Choose the correctly written word: «قرأتُ ... مفيدةً».",
    "Which sentence has the correct word order?",
    "Which plural sentence is correct?",
    "Choose the correct connector: «درست جيدًا، ... نجحت».",
    "Which sentence is the clearest and most complete?"
  ]
};

export const getBankQuestion = (skill:string,index:number):PlacementBankItem => {
  const items=BANK[skill]||BANK.vocab;
  const position=((index%10)+10)%10;
  return {...items[position],questionEn:ENGLISH_PROMPTS[skill]?.[position] || items[position].question,options:[...items[position].options]};
};
export const placementBankCounts = Object.fromEntries(Object.entries(BANK).map(([k,v])=>[k,v.length]));
