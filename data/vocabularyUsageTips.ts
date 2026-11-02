/** Applied bilingual micro-lessons for the 30 fixed vocabulary topics.
 * Each example refers to a real 0-based card index in Vocabulary.tsx.
 * A card is highlighted only when it has an authored usage example.
 * Practice prompts are curated, never generated at runtime.
 */
export interface UsageText { ar: string; en: string }
export interface UsageExample { wordIndex: number; usage: string }
export interface VocabularyUsageTip {
  title: UsageText;
  instruction: UsageText;
  examples: UsageExample[];
  practice: { question: UsageText; options: string[]; correctIndex: number };
}
export const VOCABULARY_USAGE_TIPS: Record<string, VocabularyUsageTip[]> = {
  "about_me": [
    {
      "title": {
        "ar": "التحية والرد",
        "en": "Greetings and replies"
      },
      "instruction": {
        "ar": "اختر تحية مناسبة ثم تعلم الرد الطبيعي عليها.",
        "en": "Choose a suitable greeting and its natural response."
      },
      "examples": [
        {
          "wordIndex": 2,
          "usage": "صباح الخير!"
        },
        {
          "wordIndex": 3,
          "usage": "مساء الخير!"
        },
        {
          "wordIndex": 4,
          "usage": "أهلًا وسهلًا بك!"
        }
      ],
      "practice": {
        "question": {
          "ar": "كيف تحيي صديقك صباحًا؟",
          "en": "How do you greet a friend in the morning?"
        },
        "options": [
          "صباح الخير",
          "مع السلامة",
          "شكرًا"
        ],
        "correctIndex": 0
      }
    },
    {
      "title": {
        "ar": "السؤال والجواب",
        "en": "Ask and answer"
      },
      "instruction": {
        "ar": "عند التعارف، اطرح سؤالًا ثم أجب بجملة قصيرة.",
        "en": "When meeting someone, ask a question and give a short answer."
      },
      "examples": [
        {
          "wordIndex": 5,
          "usage": "كيف حالك؟ أنا بخير."
        },
        {
          "wordIndex": 8,
          "usage": "ما اسمك؟ اسمي عمر."
        },
        {
          "wordIndex": 10,
          "usage": "من أين أنت؟ أنا من الإمارات."
        }
      ],
      "practice": {
        "question": {
          "ar": "ما الرد المناسب على «كيف حالك؟»؟",
          "en": "What is a suitable answer to «كيف حالك؟»?"
        },
        "options": [
          "أراك لاحقًا",
          "أنا بخير",
          "صباح الخير"
        ],
        "correctIndex": 1
      }
    }
  ],
  "family_hobbies": [
    {
      "title": {
        "ar": "ياء المتكلم",
        "en": "My family"
      },
      "instruction": {
        "ar": "أضف ياء المتكلم إلى أسماء القرابة التي تقبلها، مع مراعاة تغير بعض الكلمات عند الإضافة.",
        "en": "Use the possessive suffix ي with family words, noting that some forms change."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "أب ← أبي"
        },
        {
          "wordIndex": 1,
          "usage": "أم ← أمي"
        },
        {
          "wordIndex": 2,
          "usage": "أخ ← أخي"
        },
        {
          "wordIndex": 3,
          "usage": "أخت ← أختي"
        },
        {
          "wordIndex": 4,
          "usage": "جد ← جدي"
        },
        {
          "wordIndex": 5,
          "usage": "جدة ← جدتي"
        }
      ],
      "practice": {
        "question": {
          "ar": "كيف تقول «أخ» عندما تتحدث عن أخيك؟",
          "en": "How do you say «brother» when referring to your own brother?"
        },
        "options": [
          "أخي",
          "أخون",
          "أخه"
        ],
        "correctIndex": 0
      }
    },
    {
      "title": {
        "ar": "تراكيب القرابة",
        "en": "Family relationships"
      },
      "instruction": {
        "ar": "استخدم أسماء القرابة مع الضمائر أو الأسماء لتحديد صلة الشخص بك.",
        "en": "Use family terms with a name or possessive ending to identify relationships."
      },
      "examples": [
        {
          "wordIndex": 6,
          "usage": "عمي يزورنا اليوم."
        },
        {
          "wordIndex": 7,
          "usage": "خالتي تسكن قريبًا."
        },
        {
          "wordIndex": 13,
          "usage": "ابن عمي صديقي."
        },
        {
          "wordIndex": 12,
          "usage": "والداي في المنزل."
        }
      ],
      "practice": {
        "question": {
          "ar": "أي جملة تعني «my parents are at home»؟",
          "en": "Which sentence means 'my parents are at home'?"
        },
        "options": [
          "الوالدان بيت",
          "والداي في المنزل",
          "والدين أنا"
        ],
        "correctIndex": 1
      }
    }
  ],
  "feelings": [
    {
      "title": {
        "ar": "المذكر والمؤنث",
        "en": "Masculine and feminine"
      },
      "instruction": {
        "ar": "تتغير نهاية كثير من صفات المشاعر عند وصف فتاة، لكن ليست كل الكلمات تتغير بالطريقة نفسها.",
        "en": "Many feeling adjectives take ة for feminine forms, but not every adjective follows this pattern."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "سعيد ← سعيدة"
        },
        {
          "wordIndex": 1,
          "usage": "غاضب ← غاضبة"
        },
        {
          "wordIndex": 2,
          "usage": "متحمس ← متحمسة"
        },
        {
          "wordIndex": 4,
          "usage": "حزين ← حزينة"
        },
        {
          "wordIndex": 7,
          "usage": "متعب ← متعبة"
        }
      ],
      "practice": {
        "question": {
          "ar": "كيف تصف فتاة تشعر بالسعادة؟",
          "en": "How do you describe a happy girl?"
        },
        "options": [
          "سعيد",
          "سعيدة",
          "سعداء"
        ],
        "correctIndex": 1
      }
    },
    {
      "title": {
        "ar": "عبّر عن شعورك",
        "en": "Express your feelings"
      },
      "instruction": {
        "ar": "استخدم «أنا» مع الصفة، أو «أشعر بـ» مع اسم الشعور. لا تقل «أشعر بحزين».",
        "en": "Use أنا with an adjective, or أشعر بـ with a noun. Do not say «أشعر بحزين»."
      },
      "examples": [
        {
          "wordIndex": 10,
          "usage": "أنا قلق اليوم."
        },
        {
          "wordIndex": 13,
          "usage": "أنا فخور بعملي."
        },
        {
          "wordIndex": 11,
          "usage": "أشعر بالتوتر قبل الاختبار."
        },
        {
          "wordIndex": 6,
          "usage": "أنا متفاجئ بالخبر."
        }
      ],
      "practice": {
        "question": {
          "ar": "أي عبارة صحيحة؟",
          "en": "Which phrase is correct?"
        },
        "options": [
          "أشعر بحزين",
          "أنا حزين",
          "أنا بالحزن"
        ],
        "correctIndex": 1
      }
    }
  ],
  "body_parts": [
    {
      "title": {
        "ar": "أجزاء جسمي",
        "en": "Parts of my body"
      },
      "instruction": {
        "ar": "أضف ياء المتكلم إلى أسماء أجزاء الجسم عندما تتحدث عن جسمك.",
        "en": "Add the possessive suffix ي when talking about parts of your own body."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "وجه ← وجهي"
        },
        {
          "wordIndex": 1,
          "usage": "رأس ← رأسي"
        },
        {
          "wordIndex": 2,
          "usage": "عين ← عيني"
        },
        {
          "wordIndex": 11,
          "usage": "يد ← يدي"
        },
        {
          "wordIndex": 14,
          "usage": "ساق ← ساقي"
        }
      ],
      "practice": {
        "question": {
          "ar": "كيف تقول «my hand» بالعربية؟",
          "en": "How do you say 'my hand' in Arabic?"
        },
        "options": [
          "يدي",
          "يده",
          "يدك"
        ],
        "correctIndex": 0
      }
    }
  ],
  "clothing": [
    {
      "title": {
        "ar": "أرتدي أم أضع؟",
        "en": "Wear or put on?"
      },
      "instruction": {
        "ar": "استخدم «أرتدي» للملابس، و«أضع» مع القبعة والنظارات مثلًا.",
        "en": "Use أرتدي for clothes and أضع for items such as hats and glasses."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "أرتدي قميصًا."
        },
        {
          "wordIndex": 3,
          "usage": "أرتدي بنطالًا."
        },
        {
          "wordIndex": 4,
          "usage": "أرتدي معطفًا."
        },
        {
          "wordIndex": 12,
          "usage": "أضع قبعة على رأسي."
        },
        {
          "wordIndex": 13,
          "usage": "أضع نظارة شمسية."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «___ معطفًا في الشتاء».",
          "en": "Complete: «___ معطفًا في الشتاء»."
        },
        "options": [
          "أشرب",
          "أرتدي",
          "أقرأ"
        ],
        "correctIndex": 1
      }
    },
    {
      "title": {
        "ar": "ملابسي في الطقس",
        "en": "Clothes and weather"
      },
      "instruction": {
        "ar": "اربط اختيار الملابس بحالة الطقس باستخدام «عندما» أو «في».",
        "en": "Connect clothing choices to the weather using عندما or في."
      },
      "examples": [
        {
          "wordIndex": 7,
          "usage": "ألبس وشاحًا عندما يكون الجو باردًا."
        },
        {
          "wordIndex": 8,
          "usage": "ألبس قفازات في الشتاء."
        },
        {
          "wordIndex": 15,
          "usage": "أحمل مظلة عندما تمطر السماء."
        }
      ],
      "practice": {
        "question": {
          "ar": "ماذا تحمل عندما تمطر السماء؟",
          "en": "What do you carry when it rains?"
        },
        "options": [
          "مظلة",
          "بنطالًا",
          "ربطة عنق"
        ],
        "correctIndex": 0
      }
    }
  ],
  "living": [
    {
      "title": {
        "ar": "في أم على؟",
        "en": "In or on?"
      },
      "instruction": {
        "ar": "استخدم «في» للمكان الذي يحتوي الشيء، و«على» للسطح الذي يوضع فوقه.",
        "en": "Use في for being inside a place, and على for being on a surface."
      },
      "examples": [
        {
          "wordIndex": 8,
          "usage": "السرير في غرفة النوم."
        },
        {
          "wordIndex": 13,
          "usage": "الكتاب على الطاولة."
        },
        {
          "wordIndex": 14,
          "usage": "التلفاز في غرفة المعيشة."
        },
        {
          "wordIndex": 2,
          "usage": "المرآة على الحائط."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «الكتاب ___ الطاولة».",
          "en": "Complete: «الكتاب ___ الطاولة»."
        },
        "options": [
          "إلى",
          "على",
          "من"
        ],
        "correctIndex": 1
      }
    }
  ],
  "routine": [
    {
      "title": {
        "ar": "رتّب يومك",
        "en": "Sequence your day"
      },
      "instruction": {
        "ar": "استخدم «ثم»، و«بعد ذلك»، و«أخيرًا» لتصف أعمالك بترتيبها.",
        "en": "Use ثم, بعد ذلك and أخيرًا to describe actions in order."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "أستيقظ مبكرًا."
        },
        {
          "wordIndex": 5,
          "usage": "ثم أتناول الإفطار."
        },
        {
          "wordIndex": 6,
          "usage": "بعد ذلك أذهب إلى المدرسة."
        },
        {
          "wordIndex": 15,
          "usage": "أخيرًا أنام."
        }
      ],
      "practice": {
        "question": {
          "ar": "اختر الرابط المناسب: «أستيقظ، ___ أتناول الإفطار».",
          "en": "Choose the connector: «أستيقظ، ___ أتناول الإفطار»."
        },
        "options": [
          "لكن",
          "ثم",
          "أو"
        ],
        "correctIndex": 1
      }
    }
  ],
  "food_drink": [
    {
      "title": {
        "ar": "آكل أم أشرب؟",
        "en": "Eat or drink?"
      },
      "instruction": {
        "ar": "استخدم «آكل» للطعام و«أشرب» للمشروبات.",
        "en": "Use آكل for food and أشرب for drinks."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "آكل الأرز."
        },
        {
          "wordIndex": 3,
          "usage": "آكل السمك."
        },
        {
          "wordIndex": 14,
          "usage": "أشرب العصير."
        },
        {
          "wordIndex": 13,
          "usage": "أشرب الحليب."
        },
        {
          "wordIndex": 12,
          "usage": "أشرب الشاي."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «أنا ___ العصير».",
          "en": "Complete: «أنا ___ العصير»."
        },
        "options": [
          "أشرب",
          "آكل",
          "أرتدي"
        ],
        "correctIndex": 0
      }
    }
  ],
  "fruits": [
    {
      "title": {
        "ar": "أحب ولا أحب",
        "en": "Likes and dislikes"
      },
      "instruction": {
        "ar": "استخدم «أحب» أو «لا أحب» لتقول رأيك في الفاكهة.",
        "en": "Use أحب or لا أحب to express fruit preferences."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "أحب التفاح."
        },
        {
          "wordIndex": 1,
          "usage": "أحب الموز."
        },
        {
          "wordIndex": 5,
          "usage": "لا أحب المانجو كثيرًا."
        },
        {
          "wordIndex": 9,
          "usage": "أحب الكيوي."
        }
      ],
      "practice": {
        "question": {
          "ar": "كيف تقول إنك لا تحب الموز؟",
          "en": "How do you say you do not like bananas?"
        },
        "options": [
          "أنا موز",
          "لا أحب الموز",
          "أشرب الموز"
        ],
        "correctIndex": 1
      }
    }
  ],
  "vegetables": [
    {
      "title": {
        "ar": "أفعال إعداد الطعام",
        "en": "Preparing food"
      },
      "instruction": {
        "ar": "اربط الخضروات بأفعال مثل «أغسل»، «أقطع»، «أطبخ».",
        "en": "Use verbs like أغسل, أقطع and أطبخ when preparing vegetables."
      },
      "examples": [
        {
          "wordIndex": 1,
          "usage": "أغسل الخيار."
        },
        {
          "wordIndex": 0,
          "usage": "أقطع الطماطم."
        },
        {
          "wordIndex": 4,
          "usage": "أطبخ البطاطس."
        },
        {
          "wordIndex": 2,
          "usage": "أقطع الجزر."
        }
      ],
      "practice": {
        "question": {
          "ar": "ما الفعل المناسب قبل أكل الخيار؟",
          "en": "Which verb suits cleaning a cucumber before eating?"
        },
        "options": [
          "أغسل",
          "أركب",
          "ألبس"
        ],
        "correctIndex": 0
      }
    }
  ],
  "key_phrases": [
    {
      "title": {
        "ar": "أستخدم الأدوات",
        "en": "Using classroom tools"
      },
      "instruction": {
        "ar": "استخدم «أستخدم» مع اسم الأداة لتشرح كيف تتعلم.",
        "en": "Use أستخدم with a classroom tool to say how you learn."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "أستخدم قلمًا للكتابة."
        },
        {
          "wordIndex": 3,
          "usage": "أقرأ كتابًا."
        },
        {
          "wordIndex": 5,
          "usage": "أستخدم الممحاة لمسح الخطأ."
        },
        {
          "wordIndex": 6,
          "usage": "أستخدم المبراة لبري القلم."
        }
      ],
      "practice": {
        "question": {
          "ar": "بماذا تمسح الخطأ؟",
          "en": "What do you use to erase a mistake?"
        },
        "options": [
          "بالمبراة",
          "بالممحاة",
          "بالكرسي"
        ],
        "correctIndex": 1
      }
    },
    {
      "title": {
        "ar": "أوامر الفصل",
        "en": "Classroom instructions"
      },
      "instruction": {
        "ar": "الأوامر القصيرة تخبر شخصًا بما يجب فعله. لاحظ الفارق بين «قِف» و«اجلس».",
        "en": "Short commands tell someone what to do. Compare قِف and اجلس."
      },
      "examples": [
        {
          "wordIndex": 14,
          "usage": "قِف من فضلك."
        },
        {
          "wordIndex": 15,
          "usage": "اجلس في مكانك."
        },
        {
          "wordIndex": 12,
          "usage": "أحسنت! إجابتك صحيحة."
        }
      ],
      "practice": {
        "question": {
          "ar": "ما الأمر الذي يعني «Sit down»؟",
          "en": "Which command means 'Sit down'?"
        },
        "options": [
          "قِف",
          "اجلس",
          "أحسنت"
        ],
        "correctIndex": 1
      }
    }
  ],
  "survival": [
    {
      "title": {
        "ar": "أدرس المواد",
        "en": "Study subjects"
      },
      "instruction": {
        "ar": "استخدم «أدرس» مع اسم المادة و«في حصة» للحديث عن وقتها.",
        "en": "Use أدرس before a subject and في حصة to talk about its lesson."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "أدرس اللغة العربية."
        },
        {
          "wordIndex": 3,
          "usage": "أدرس العلوم."
        },
        {
          "wordIndex": 4,
          "usage": "أدرس الرياضيات."
        },
        {
          "wordIndex": 8,
          "usage": "أرسم في حصة الفن."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «أنا ___ الرياضيات».",
          "en": "Complete: «أنا ___ الرياضيات»."
        },
        "options": [
          "أشرب",
          "أدرس",
          "ألبس"
        ],
        "correctIndex": 1
      }
    }
  ],
  "time": [
    {
      "title": {
        "ar": "كيف أقول الوقت؟",
        "en": "Telling the time"
      },
      "instruction": {
        "ar": "قل «الساعة» ثم العدد المناسب، ويمكن أن تضيف «والنصف» أو «صباحًا».",
        "en": "Say الساعة followed by the time, and optionally add والنصف or صباحًا."
      },
      "examples": [
        {
          "wordIndex": 7,
          "usage": "الساعة السابعة صباحًا."
        },
        {
          "wordIndex": 8,
          "usage": "الساعة الثامنة."
        },
        {
          "wordIndex": 12,
          "usage": "الساعة الثانية عشرة."
        },
        {
          "wordIndex": 13,
          "usage": "الساعة السابعة والنصف."
        }
      ],
      "practice": {
        "question": {
          "ar": "كيف تقول 7:30؟",
          "en": "How do you say 7:30?"
        },
        "options": [
          "الساعة السابعة والنصف",
          "الساعة السابعة مساءً",
          "الساعة الثانية والنصف"
        ],
        "correctIndex": 0
      }
    }
  ],
  "weather": [
    {
      "title": {
        "ar": "وصف الطقس",
        "en": "Describe the weather"
      },
      "instruction": {
        "ar": "استخدم «الجو» أو «الطقس» مع صفة مناسبة.",
        "en": "Use الجو or الطقس followed by an appropriate adjective."
      },
      "examples": [
        {
          "wordIndex": 7,
          "usage": "الجو حار في الصيف."
        },
        {
          "wordIndex": 8,
          "usage": "الجو بارد في الشتاء."
        },
        {
          "wordIndex": 9,
          "usage": "الجو معتدل في الربيع."
        },
        {
          "wordIndex": 10,
          "usage": "الطقس عاصف اليوم."
        },
        {
          "wordIndex": 11,
          "usage": "الطقس ممطر."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «الجو ___ في الصيف».",
          "en": "Complete: «الجو ___ في الصيف»."
        },
        "options": [
          "حار",
          "ثلج",
          "شتاء"
        ],
        "correctIndex": 0
      }
    },
    {
      "title": {
        "ar": "فصول السنة",
        "en": "The four seasons"
      },
      "instruction": {
        "ar": "استخدم «في» مع اسم الفصل لتوضح متى يحدث الشيء.",
        "en": "Use في with a season name to describe when something happens."
      },
      "examples": [
        {
          "wordIndex": 3,
          "usage": "تتفتح الأزهار في الربيع."
        },
        {
          "wordIndex": 4,
          "usage": "ترتفع الحرارة في الصيف."
        },
        {
          "wordIndex": 5,
          "usage": "تتساقط الأوراق في الخريف."
        },
        {
          "wordIndex": 6,
          "usage": "يشتد البرد في الشتاء."
        }
      ],
      "practice": {
        "question": {
          "ar": "متى يكون الجو شديد البرودة غالبًا؟",
          "en": "When is it often very cold?"
        },
        "options": [
          "في الصيف",
          "في الشتاء",
          "في الربيع"
        ],
        "correctIndex": 1
      }
    }
  ],
  "instructions": [
    {
      "title": {
        "ar": "في شهر",
        "en": "In a month"
      },
      "instruction": {
        "ar": "ضع «في شهر» قبل اسم الشهر للحديث عن موعد حدث.",
        "en": "Use في شهر before a month name to say when something happens."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "نبدأ السنة في شهر يناير."
        },
        {
          "wordIndex": 5,
          "usage": "تبدأ العطلة في شهر يونيو."
        },
        {
          "wordIndex": 6,
          "usage": "أسافر في شهر يوليو."
        },
        {
          "wordIndex": 8,
          "usage": "تبدأ الدراسة في شهر سبتمبر."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «أسافر ___ يوليو».",
          "en": "Complete: «أسافر ___ يوليو»."
        },
        "options": [
          "على شهر",
          "في شهر",
          "إلى شهر"
        ],
        "correctIndex": 1
      }
    }
  ],
  "colours": [
    {
      "title": {
        "ar": "مذكر ومؤنث الألوان",
        "en": "Color agreement"
      },
      "instruction": {
        "ar": "تتغير ألوان كثيرة مع الاسم الموصوف. «أحمر» مع المذكر، و«حمراء» مع المؤنث.",
        "en": "Many color adjectives agree with the noun. For example, أحمر for masculine and حمراء for feminine."
      },
      "examples": [
        {
          "wordIndex": 1,
          "usage": "قلم أحمر، وردة حمراء."
        },
        {
          "wordIndex": 3,
          "usage": "قميص أصفر، زهرة صفراء."
        },
        {
          "wordIndex": 4,
          "usage": "كتاب أخضر، حقيبة خضراء."
        },
        {
          "wordIndex": 5,
          "usage": "باب أزرق، سيارة زرقاء."
        }
      ],
      "practice": {
        "question": {
          "ar": "ما اللون الصحيح في «وردة ___»؟",
          "en": "Complete the phrase 'a red flower': «وردة ___»."
        },
        "options": [
          "أحمر",
          "حمراء",
          "أحمرون"
        ],
        "correctIndex": 1
      }
    },
    {
      "title": {
        "ar": "فاتح وغامق",
        "en": "Light and dark shades"
      },
      "instruction": {
        "ar": "أضف «فاتح» أو «غامق» بعد اسم اللون لوصف درجته مع مراعاة المطابقة.",
        "en": "Add فاتح or غامق after a color to describe a shade, with agreement where needed."
      },
      "examples": [
        {
          "wordIndex": 11,
          "usage": "القميص أزرق فاتح."
        },
        {
          "wordIndex": 14,
          "usage": "اللون الأزرق فاتح."
        },
        {
          "wordIndex": 15,
          "usage": "اللون الأزرق غامق."
        },
        {
          "wordIndex": 12,
          "usage": "اللون رمادي فاتح."
        }
      ],
      "practice": {
        "question": {
          "ar": "أي عبارة تدل على اللون الداكن؟",
          "en": "Which phrase means a dark blue color?"
        },
        "options": [
          "أزرق فاتح",
          "أزرق غامق",
          "وردي فاتح"
        ],
        "correctIndex": 1
      }
    }
  ],
  "animals": [
    {
      "title": {
        "ar": "هذا أم هذه؟",
        "en": "This, masculine or feminine?"
      },
      "instruction": {
        "ar": "استخدم «هذا» غالبًا مع الاسم المذكر و«هذه» مع الاسم المؤنث.",
        "en": "Use هذا with masculine nouns and هذه with feminine nouns."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "هذا أسد."
        },
        {
          "wordIndex": 4,
          "usage": "هذه زرافة."
        },
        {
          "wordIndex": 8,
          "usage": "هذه قطة."
        },
        {
          "wordIndex": 13,
          "usage": "هذا حصان."
        },
        {
          "wordIndex": 15,
          "usage": "هذه بقرة."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «___ زرافة».",
          "en": "Complete: «___ زرافة»."
        },
        "options": [
          "هذا",
          "هذان",
          "هذه"
        ],
        "correctIndex": 2
      }
    }
  ],
  "birds": [
    {
      "title": {
        "ar": "يطير أم لا يطير؟",
        "en": "Can it fly?"
      },
      "instruction": {
        "ar": "استخدم «يطير» لوصف القدرة على الطيران، و«لا يطير» للنفي.",
        "en": "Use يطير to describe flying and لا يطير to say an animal cannot fly."
      },
      "examples": [
        {
          "wordIndex": 5,
          "usage": "العصفور يطير."
        },
        {
          "wordIndex": 6,
          "usage": "الحمامة تطير."
        },
        {
          "wordIndex": 15,
          "usage": "البطريق لا يطير."
        },
        {
          "wordIndex": 1,
          "usage": "الخفاش يطير، لكنه ليس طائرًا."
        }
      ],
      "practice": {
        "question": {
          "ar": "أي جملة صحيحة؟",
          "en": "Which sentence is correct?"
        },
        "options": [
          "البطريق يطير",
          "العصفور لا يطير",
          "البطريق لا يطير"
        ],
        "correctIndex": 2
      }
    }
  ],
  "fish_creatures": [
    {
      "title": {
        "ar": "يعيش في البحر",
        "en": "Sea life"
      },
      "instruction": {
        "ar": "صف الكائن البحري باستخدام «يعيش في البحر»، وميّزه عن أدوات الصيد والطعام.",
        "en": "Describe sea creatures with يعيش في البحر, and distinguish them from fishing tools and food."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "الحوت يعيش في البحر."
        },
        {
          "wordIndex": 1,
          "usage": "القرش يعيش في البحر."
        },
        {
          "wordIndex": 4,
          "usage": "الأخطبوط يعيش في البحر."
        },
        {
          "wordIndex": 14,
          "usage": "السنارة أداة للصيد."
        },
        {
          "wordIndex": 13,
          "usage": "السوشي طعام."
        }
      ],
      "practice": {
        "question": {
          "ar": "أي كلمة تعني أداة للصيد؟",
          "en": "Which word names a fishing tool?"
        },
        "options": [
          "قرش",
          "سنارة",
          "حوت"
        ],
        "correctIndex": 1
      }
    }
  ],
  "insects_reptiles": [
    {
      "title": {
        "ar": "أفعال الحركة",
        "en": "Movement verbs"
      },
      "instruction": {
        "ar": "استخدم «يطير»، «يزحف»، أو «يمشي» بحسب حركة الكائن.",
        "en": "Choose يطير, يزحف, or يمشي to describe an animal's movement."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "الفراشة تطير."
        },
        {
          "wordIndex": 1,
          "usage": "النحلة تطير."
        },
        {
          "wordIndex": 10,
          "usage": "الثعبان يزحف."
        },
        {
          "wordIndex": 11,
          "usage": "السلحفاة تمشي."
        },
        {
          "wordIndex": 14,
          "usage": "الضفدع يقفز."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «الثعبان ___».",
          "en": "Complete: «الثعبان ___»."
        },
        "options": [
          "يزحف",
          "يطير",
          "يسبح في الهواء"
        ],
        "correctIndex": 0
      }
    }
  ],
  "places": [
    {
      "title": {
        "ar": "أذهب إلى",
        "en": "Going places"
      },
      "instruction": {
        "ar": "استخدم «أذهب إلى» قبل اسم المكان، وتذكر تغير الاسم بعد حرف الجر إذا لزم.",
        "en": "Use أذهب إلى before a place, using the appropriate form after the preposition."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "أذهب إلى المدرسة."
        },
        {
          "wordIndex": 1,
          "usage": "أذهب إلى المستشفى."
        },
        {
          "wordIndex": 14,
          "usage": "أذهب إلى حديقة الحيوان."
        },
        {
          "wordIndex": 15,
          "usage": "أذهب إلى المتحف."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «أذهب ___ المدرسة».",
          "en": "Complete: «أذهب ___ المدرسة»."
        },
        "options": [
          "على",
          "من",
          "إلى"
        ],
        "correctIndex": 2
      }
    }
  ],
  "sports": [
    {
      "title": {
        "ar": "ألعب أم أمارس؟",
        "en": "Play or practice?"
      },
      "instruction": {
        "ar": "استخدم «ألعب» مع كثير من ألعاب الكرة، و«أمارس» مع بعض الأنشطة الأخرى.",
        "en": "Use ألعب with many ball games and أمارس with other sports."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "ألعب كرة القدم."
        },
        {
          "wordIndex": 1,
          "usage": "ألعب كرة السلة."
        },
        {
          "wordIndex": 11,
          "usage": "أمارس السباحة."
        },
        {
          "wordIndex": 7,
          "usage": "أمارس الملاكمة."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «أنا ___ السباحة».",
          "en": "Complete: «أنا ___ السباحة»."
        },
        "options": [
          "أشرب",
          "أمارس",
          "أرتدي"
        ],
        "correctIndex": 1
      }
    }
  ],
  "transport": [
    {
      "title": {
        "ar": "أسافر بـ",
        "en": "Travel by"
      },
      "instruction": {
        "ar": "أضف الباء إلى وسيلة النقل للتعبير عن الطريقة، مع اختيار الصيغة الصحيحة.",
        "en": "Attach بـ to a vehicle name to describe how you travel."
      },
      "examples": [
        {
          "wordIndex": 14,
          "usage": "أسافر بالطائرة."
        },
        {
          "wordIndex": 2,
          "usage": "أذهب بالحافلة."
        },
        {
          "wordIndex": 0,
          "usage": "أذهب بالسيارة."
        },
        {
          "wordIndex": 10,
          "usage": "أسافر بالقطار."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «أسافر ___».",
          "en": "Complete: «أسافر ___»."
        },
        "options": [
          "الطائرة",
          "بالطائرة",
          "إلى طائرة"
        ],
        "correctIndex": 1
      }
    }
  ],
  "jobs": [
    {
      "title": {
        "ar": "المهنة والعمل",
        "en": "Jobs and actions"
      },
      "instruction": {
        "ar": "اربط اسم المهنة بالفعل الذي يقوم به صاحبها.",
        "en": "Match a job title with an action that person does."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "الطبيب يعالج المرضى."
        },
        {
          "wordIndex": 8,
          "usage": "المعلم يشرح الدرس."
        },
        {
          "wordIndex": 11,
          "usage": "الطيار يقود الطائرة."
        },
        {
          "wordIndex": 15,
          "usage": "السباك يصلح الأنابيب."
        }
      ],
      "practice": {
        "question": {
          "ar": "من يقود الطائرة؟",
          "en": "Who flies a plane?"
        },
        "options": [
          "الطبيب",
          "الطيار",
          "المزارع"
        ],
        "correctIndex": 1
      }
    }
  ],
  "shopping": [
    {
      "title": {
        "ar": "أدفع وآخذ",
        "en": "Pay and receive"
      },
      "instruction": {
        "ar": "استخدم «أدفع بـ» مع وسيلة الدفع، و«آخذ» مع الإيصال.",
        "en": "Use أدفع بـ with a payment method and آخذ when receiving a receipt."
      },
      "examples": [
        {
          "wordIndex": 10,
          "usage": "أدفع بالنقود."
        },
        {
          "wordIndex": 11,
          "usage": "أدفع ببطاقة الدفع."
        },
        {
          "wordIndex": 12,
          "usage": "آخذ الإيصال."
        },
        {
          "wordIndex": 7,
          "usage": "يساعدني موظف المبيعات."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «أدفع ___».",
          "en": "Complete: «أدفع ___»."
        },
        "options": [
          "ببطاقة الدفع",
          "الإيصال",
          "أكياس التسوق"
        ],
        "correctIndex": 0
      }
    },
    {
      "title": {
        "ar": "في المتجر",
        "en": "At the store"
      },
      "instruction": {
        "ar": "استخدم «في» للمكان و«إلى» لاتجاه الحركة.",
        "en": "Use في for a location and إلى when moving towards a place."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "أتسوق في المول."
        },
        {
          "wordIndex": 13,
          "usage": "أدخل من المدخل."
        },
        {
          "wordIndex": 14,
          "usage": "أصعد بالمصعد."
        },
        {
          "wordIndex": 15,
          "usage": "أترك السيارة في موقف السيارات."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «أتسوق ___ المول».",
          "en": "Complete: «أتسوق ___ المول»."
        },
        "options": [
          "عن",
          "في",
          "على"
        ],
        "correctIndex": 1
      }
    }
  ],
  "health": [
    {
      "title": {
        "ar": "الأداة واستخدامها",
        "en": "Medical tools"
      },
      "instruction": {
        "ar": "استخدم «بـ» للدلالة على الأداة التي نستعين بها.",
        "en": "Use بـ to introduce the tool used to do something."
      },
      "examples": [
        {
          "wordIndex": 3,
          "usage": "أقيس الحرارة بميزان الحرارة."
        },
        {
          "wordIndex": 2,
          "usage": "يستمع الطبيب إلى القلب بسماعة الطبيب."
        },
        {
          "wordIndex": 6,
          "usage": "أنظف يدي بالمعقم."
        },
        {
          "wordIndex": 7,
          "usage": "أغطي الجرح بلاصق طبي."
        }
      ],
      "practice": {
        "question": {
          "ar": "بماذا نقيس الحرارة؟",
          "en": "What do we use to measure temperature?"
        },
        "options": [
          "بميزان الحرارة",
          "بالمظلة",
          "بالقلم"
        ],
        "correctIndex": 0
      }
    }
  ],
  "tech": [
    {
      "title": {
        "ar": "أستخدم... لكي",
        "en": "Technology for a purpose"
      },
      "instruction": {
        "ar": "اربط الجهاز بوظيفته باستخدام «أستخدم» و«لكي».",
        "en": "Link a device to its purpose using أستخدم and لكي."
      },
      "examples": [
        {
          "wordIndex": 5,
          "usage": "أستخدم الطابعة لكي أطبع ورقة."
        },
        {
          "wordIndex": 0,
          "usage": "أستخدم الهاتف الذكي لكي أتصل."
        },
        {
          "wordIndex": 8,
          "usage": "أستخدم الكاميرا لكي ألتقط صورة."
        },
        {
          "wordIndex": 3,
          "usage": "أستخدم لوحة المفاتيح لكي أكتب."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «أستخدم الطابعة لكي ___».",
          "en": "Complete: «أستخدم الطابعة لكي ___»."
        },
        "options": [
          "أطبخ",
          "أطبع",
          "أسبح"
        ],
        "correctIndex": 1
      }
    }
  ],
  "nature": [
    {
      "title": {
        "ar": "أرى في الطبيعة",
        "en": "I see in nature"
      },
      "instruction": {
        "ar": "استخدم «أرى» مع أسماء الأشياء من حولك، وراعِ صيغة الاسم داخل الجملة.",
        "en": "Use أرى with things you see around you, paying attention to the noun's form."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "أرى شجرة."
        },
        {
          "wordIndex": 9,
          "usage": "أرى جبلًا."
        },
        {
          "wordIndex": 7,
          "usage": "أرى زهرة."
        },
        {
          "wordIndex": 15,
          "usage": "أرى البحر."
        }
      ],
      "practice": {
        "question": {
          "ar": "أي جملة صحيحة؟",
          "en": "Which sentence is correct?"
        },
        "options": [
          "أرى جبلًا",
          "أرى جبلٍ",
          "أرى إلى جبل"
        ],
        "correctIndex": 0
      }
    }
  ],
  "music": [
    {
      "title": {
        "ar": "أعزف على",
        "en": "Playing instruments"
      },
      "instruction": {
        "ar": "استخدم «أعزف على» مع الآلات الموسيقية، و«أتحدث في» مع الميكروفون.",
        "en": "Use أعزف على with musical instruments and أتحدث في with a microphone."
      },
      "examples": [
        {
          "wordIndex": 0,
          "usage": "أعزف على البيانو."
        },
        {
          "wordIndex": 1,
          "usage": "أعزف على الغيتار."
        },
        {
          "wordIndex": 2,
          "usage": "أعزف على الكمان."
        },
        {
          "wordIndex": 13,
          "usage": "أتحدث في الميكروفون."
        }
      ],
      "practice": {
        "question": {
          "ar": "أكمل: «أعزف ___ الكمان».",
          "en": "Complete: «أعزف ___ الكمان»."
        },
        "options": [
          "من",
          "إلى",
          "على"
        ],
        "correctIndex": 2
      }
    }
  ],
  "travel": [
    {
      "title": {
        "ar": "في المطار",
        "en": "At the airport"
      },
      "instruction": {
        "ar": "استخدم أفعال السفر مع الكلمات المناسبة، مثل «أحمل» و«أُبرز» و«أجلس».",
        "en": "Use suitable travel verbs such as أحمل, أُبرز and أجلس."
      },
      "examples": [
        {
          "wordIndex": 6,
          "usage": "أحمل حقيبة السفر."
        },
        {
          "wordIndex": 10,
          "usage": "أُبرز جواز السفر."
        },
        {
          "wordIndex": 14,
          "usage": "أُبرز التذكرة."
        },
        {
          "wordIndex": 5,
          "usage": "أجلس في مقعد الطائرة."
        }
      ],
      "practice": {
        "question": {
          "ar": "ماذا تُبرز عند فحص الوثائق؟",
          "en": "What do you show at a document check?"
        },
        "options": [
          "جواز السفر",
          "الطاولة",
          "سماعة الطبيب"
        ],
        "correctIndex": 0
      }
    },
    {
      "title": {
        "ar": "الإقلاع والهبوط",
        "en": "Takeoff and landing"
      },
      "instruction": {
        "ar": "ميّز بين «الإقلاع» عندما تغادر الطائرة الأرض و«الهبوط» عندما تعود إليها.",
        "en": "الإقلاع means takeoff, when the plane leaves the ground; الهبوط means landing."
      },
      "examples": [
        {
          "wordIndex": 1,
          "usage": "تستعد الطائرة للإقلاع."
        },
        {
          "wordIndex": 2,
          "usage": "يبدأ الهبوط قرب المطار."
        },
        {
          "wordIndex": 13,
          "usage": "حدث تأخير قبل الإقلاع."
        },
        {
          "wordIndex": 0,
          "usage": "الطائرة تطير في السماء."
        }
      ],
      "practice": {
        "question": {
          "ar": "ما الكلمة المناسبة عند وصول الطائرة إلى الأرض؟",
          "en": "What is the word for a plane arriving on the ground?"
        },
        "options": [
          "إقلاع",
          "هبوط",
          "تأخير"
        ],
        "correctIndex": 1
      }
    }
  ]
};
