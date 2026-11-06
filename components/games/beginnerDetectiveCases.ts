import type { DetectiveCase, SuspectPerson, EvidenceTerm } from './DetectiveMystery';

// Beginner dossiers use the complete case scenes supplied for QUL.
// The six portraits are cropped from each matching scene, preserving identity.
interface BeginnerSeed {
  number: number;
  title: string;
  description: string;
  people: Array<[string, 'ذكر' | 'أنثى']>;
  culpritIndex: number;
  evidence: EvidenceTerm[];
  clues: Array<{ innocentIndices: number[]; speech: string }>;
}

export const BEGINNER_CASE_SEEDS: BeginnerSeed[] = [
  {
    "number": 1,
    "title": "سر المفتاح",
    "description": "اختفى المفتاح من المكتب. كان الصندوق قرب الباب، وكان ستة أشخاص في الغرفة.",
    "people": [
      [
        "رامي",
        "ذكر"
      ],
      [
        "سعاد",
        "أنثى"
      ],
      [
        "جنى",
        "أنثى"
      ],
      [
        "فهد",
        "ذكر"
      ],
      [
        "هدى",
        "أنثى"
      ],
      [
        "سامي",
        "ذكر"
      ]
    ],
    "culpritIndex": 3,
    "evidence": [
      {
        "ar": "مفتاح",
        "en": "Key"
      },
      {
        "ar": "مكتب",
        "en": "Office"
      },
      {
        "ar": "صندوق",
        "en": "Box"
      },
      {
        "ar": "باب",
        "en": "Door"
      },
      {
        "ar": "صورة",
        "en": "Photo"
      }
    ],
    "clues": [
      {
        "innocentIndices": [
          0,
          1,
          2
        ],
        "speech": "تظهر صورة أن رامي وسعاد وجنى كانوا عند الباب مع الحارس. هم أبرياء."
      },
      {
        "innocentIndices": [
          4
        ],
        "speech": "هدى كانت في غرفة أخرى مع المديرة، فهي بريئة."
      },
      {
        "innocentIndices": [
          5
        ],
        "speech": "سامي كان مع الشرطي عند المكتب، فهو بريء."
      }
    ]
  },
  {
    "number": 2,
    "title": "القبعة المفقودة",
    "description": "اختفت القبعة الحمراء من القاعة. كان ستة أشخاص بالقرب من الباب.",
    "people": [
      [
        "نوال",
        "أنثى"
      ],
      [
        "يزن",
        "ذكر"
      ],
      [
        "مريم",
        "أنثى"
      ],
      [
        "تامر",
        "ذكر"
      ],
      [
        "رنا",
        "أنثى"
      ],
      [
        "كمال",
        "ذكر"
      ]
    ],
    "culpritIndex": 3,
    "evidence": [
      {
        "ar": "قبعة",
        "en": "Hat"
      },
      {
        "ar": "قاعة",
        "en": "Hall"
      },
      {
        "ar": "باب",
        "en": "Door"
      },
      {
        "ar": "نافذة",
        "en": "Window"
      },
      {
        "ar": "حقيبة",
        "en": "Bag"
      }
    ],
    "clues": [
      {
        "innocentIndices": [
          4
        ],
        "speech": "رنا كانت تحمل حقيبة في الخارج مع الحارس، فهي بريئة."
      },
      {
        "innocentIndices": [
          0,
          1,
          2
        ],
        "speech": "نوال ويزن ومريم كانوا عند النافذة مع المعلمة. هم أبرياء."
      },
      {
        "innocentIndices": [
          5
        ],
        "speech": "كمال كان بجانب الباب مع الشرطي، فهو بريء."
      }
    ]
  },
  {
    "number": 3,
    "title": "الكتاب المفقود",
    "description": "اختفى الكتاب الأحمر من المكتبة. كان على الرف قرب الطاولة، وكان ستة أشخاص هنا.",
    "people": [
      [
        "إبراهيم",
        "ذكر"
      ],
      [
        "سلمى",
        "أنثى"
      ],
      [
        "جابر",
        "ذكر"
      ],
      [
        "لينا",
        "أنثى"
      ],
      [
        "يوسف",
        "ذكر"
      ],
      [
        "نور",
        "أنثى"
      ]
    ],
    "culpritIndex": 5,
    "evidence": [
      {
        "ar": "كتاب",
        "en": "Book"
      },
      {
        "ar": "مكتبة",
        "en": "Library"
      },
      {
        "ar": "رف",
        "en": "Shelf"
      },
      {
        "ar": "طاولة",
        "en": "Table"
      },
      {
        "ar": "درس القراءة",
        "en": "Reading lesson"
      }
    ],
    "clues": [
      {
        "innocentIndices": [
          4
        ],
        "speech": "يوسف كان يجلس عند الطاولة مع الحارس، فهو بريء."
      },
      {
        "innocentIndices": [
          3
        ],
        "speech": "لينا كانت عند الباب مع المعلمة، فهي بريئة."
      },
      {
        "innocentIndices": [
          0,
          1,
          2
        ],
        "speech": "إبراهيم وسلمى وجابر كانوا في درس القراءة مع المعلم. هم أبرياء."
      }
    ]
  },
  {
    "number": 4,
    "title": "النظارة المفقودة",
    "description": "اختفت النظارة الذهبية من المتجر. كانت على الطاولة قرب الساعة.",
    "people": [
      [
        "ليلى",
        "أنثى"
      ],
      [
        "عبير",
        "أنثى"
      ],
      [
        "طارق",
        "ذكر"
      ],
      [
        "كارمن",
        "أنثى"
      ],
      [
        "هاني",
        "ذكر"
      ],
      [
        "شذى",
        "أنثى"
      ]
    ],
    "culpritIndex": 4,
    "evidence": [
      {
        "ar": "نظارة",
        "en": "Glasses"
      },
      {
        "ar": "متجر",
        "en": "Shop"
      },
      {
        "ar": "طاولة",
        "en": "Table"
      },
      {
        "ar": "ساعة",
        "en": "Clock"
      },
      {
        "ar": "مكتب المتجر",
        "en": "Shop office"
      }
    ],
    "clues": [
      {
        "innocentIndices": [
          0,
          1,
          3
        ],
        "speech": "ليلى وعبير وكارمن خرجن من الباب قبل اختفاء النظارة. هن بريئات."
      },
      {
        "innocentIndices": [
          2
        ],
        "speech": "طارق كان في مكتب المتجر مع الموظف، فهو بريء."
      },
      {
        "innocentIndices": [
          5
        ],
        "speech": "شذى كانت عند الساعة مع المديرة، فهي بريئة."
      }
    ]
  },
  {
    "number": 5,
    "title": "الكرة المفقودة",
    "description": "اختفت الكرة الصفراء من النادي. كانت قرب الملعب وبجانب حقيبة.",
    "people": [
      [
        "مازن",
        "ذكر"
      ],
      [
        "رقية",
        "أنثى"
      ],
      [
        "أنس",
        "ذكر"
      ],
      [
        "خديجة",
        "أنثى"
      ],
      [
        "رفيف",
        "أنثى"
      ],
      [
        "منصور",
        "ذكر"
      ]
    ],
    "culpritIndex": 2,
    "evidence": [
      {
        "ar": "كرة",
        "en": "Ball"
      },
      {
        "ar": "نادي",
        "en": "Club"
      },
      {
        "ar": "ملعب",
        "en": "Court"
      },
      {
        "ar": "حقيبة",
        "en": "Bag"
      },
      {
        "ar": "المدرب",
        "en": "Coach"
      }
    ],
    "clues": [
      {
        "innocentIndices": [
          4
        ],
        "speech": "رفيف كانت في الملعب مع الفريق، فهي بريئة."
      },
      {
        "innocentIndices": [
          0,
          1,
          3
        ],
        "speech": "مازن ورقية وخديجة كانوا عند الباب مع المدرب. هم أبرياء."
      },
      {
        "innocentIndices": [
          5
        ],
        "speech": "منصور كان يحمل حقيبة أخرى مع الحارس، فهو بريء."
      }
    ]
  },
  {
    "number": 6,
    "title": "القلم المفقود",
    "description": "اختفى القلم الفضي من الغرفة. كان على المكتب قرب الكتاب.",
    "people": [
      [
        "رامي",
        "ذكر"
      ],
      [
        "نوال",
        "أنثى"
      ],
      [
        "فهد",
        "ذكر"
      ],
      [
        "لينا",
        "أنثى"
      ],
      [
        "مازن",
        "ذكر"
      ],
      [
        "عبير",
        "أنثى"
      ]
    ],
    "culpritIndex": 3,
    "evidence": [
      {
        "ar": "قلم",
        "en": "Pen"
      },
      {
        "ar": "غرفة",
        "en": "Room"
      },
      {
        "ar": "مكتب",
        "en": "Desk"
      },
      {
        "ar": "كتاب",
        "en": "Book"
      },
      {
        "ar": "حقيبة",
        "en": "Bag"
      }
    ],
    "clues": [
      {
        "innocentIndices": [
          5
        ],
        "speech": "عبير كانت تقرأ كتابا مع المعلمة، فهي بريئة."
      },
      {
        "innocentIndices": [
          4
        ],
        "speech": "مازن كان يحمل حقيبة مع المعلم، فهو بريء."
      },
      {
        "innocentIndices": [
          0,
          1,
          2
        ],
        "speech": "رامي ونوال وفهد كانوا في الممر مع الحارس. هم أبرياء."
      }
    ]
  },
  {
    "number": 7,
    "title": "المفتاح الذهبي",
    "description": "اختفى المفتاح الذهبي من الفندق. كان قرب باب الغرفة.",
    "people": [
      [
        "سعاد",
        "أنثى"
      ],
      [
        "يزن",
        "ذكر"
      ],
      [
        "مريم",
        "أنثى"
      ],
      [
        "كمال",
        "ذكر"
      ],
      [
        "رقية",
        "أنثى"
      ],
      [
        "منصور",
        "ذكر"
      ]
    ],
    "culpritIndex": 4,
    "evidence": [
      {
        "ar": "المفتاح الذهبي",
        "en": "Golden Key"
      },
      {
        "ar": "فندق",
        "en": "Hotel"
      },
      {
        "ar": "باب",
        "en": "Door"
      },
      {
        "ar": "غرفة",
        "en": "Room"
      },
      {
        "ar": "الحارس",
        "en": "Guard"
      }
    ],
    "clues": [
      {
        "innocentIndices": [
          0,
          1,
          3
        ],
        "speech": "سعاد ويزن وكمال كانوا أمام مكتب الاستقبال مع المدير. هم أبرياء."
      },
      {
        "innocentIndices": [
          2
        ],
        "speech": "مريم كانت في الغرفة مع العاملة، فهي بريئة."
      },
      {
        "innocentIndices": [
          5
        ],
        "speech": "منصور كان مع الحارس عند الباب، فهو بريء."
      }
    ]
  },
  {
    "number": 8,
    "title": "الساعة المفقودة",
    "description": "اختفت الساعة الفضية من المحطة. كانت قرب مقعد أمام القطار.",
    "people": [
      [
        "جنى",
        "أنثى"
      ],
      [
        "تامر",
        "ذكر"
      ],
      [
        "إبراهيم",
        "ذكر"
      ],
      [
        "سلمى",
        "أنثى"
      ],
      [
        "يوسف",
        "ذكر"
      ],
      [
        "خديجة",
        "أنثى"
      ]
    ],
    "culpritIndex": 2,
    "evidence": [
      {
        "ar": "الساعة الفضية",
        "en": "Silver Watch"
      },
      {
        "ar": "محطة",
        "en": "Station"
      },
      {
        "ar": "مقعد",
        "en": "Seat"
      },
      {
        "ar": "قطار",
        "en": "Train"
      },
      {
        "ar": "السائق",
        "en": "Driver"
      }
    ],
    "clues": [
      {
        "innocentIndices": [
          4
        ],
        "speech": "يوسف كان في القطار مع السائق، فهو بريء."
      },
      {
        "innocentIndices": [
          0,
          1,
          3
        ],
        "speech": "جنى وتامر وسلمى كانوا عند باب المحطة مع الشرطي. هم أبرياء."
      },
      {
        "innocentIndices": [
          5
        ],
        "speech": "خديجة كانت تجلس على مقعد مع المعلمة، فهي بريئة."
      }
    ]
  },
  {
    "number": 9,
    "title": "الزهرة المفقودة",
    "description": "اختفت الزهرة الحمراء من الحديقة. كانت قرب النافورة والمقعد.",
    "people": [
      [
        "ليلى",
        "أنثى"
      ],
      [
        "طارق",
        "ذكر"
      ],
      [
        "كارمن",
        "أنثى"
      ],
      [
        "هاني",
        "ذكر"
      ],
      [
        "شذى",
        "أنثى"
      ],
      [
        "رفيف",
        "أنثى"
      ]
    ],
    "culpritIndex": 1,
    "evidence": [
      {
        "ar": "الزهرة الحمراء",
        "en": "Red Flower"
      },
      {
        "ar": "حديقة",
        "en": "Garden"
      },
      {
        "ar": "نافورة",
        "en": "Fountain"
      },
      {
        "ar": "مقعد",
        "en": "Bench"
      },
      {
        "ar": "البستاني",
        "en": "Gardener"
      }
    ],
    "clues": [
      {
        "innocentIndices": [
          5
        ],
        "speech": "رفيف كانت تجلس على المقعد مع البستاني، فهي بريئة."
      },
      {
        "innocentIndices": [
          3
        ],
        "speech": "هاني كان يصور النافورة مع المصور، فهو بريء."
      },
      {
        "innocentIndices": [
          0,
          2,
          4
        ],
        "speech": "ليلى وكارمن وشذى كانوا عند باب الحديقة مع الحارس. هم أبرياء."
      }
    ]
  },
  {
    "number": 10,
    "title": "الحقيبة الصغيرة",
    "description": "اختفت الحقيبة الزرقاء من المركز. كانت على كرسي قرب الطاولة.",
    "people": [
      [
        "سامي",
        "ذكر"
      ],
      [
        "نور",
        "أنثى"
      ],
      [
        "أنس",
        "ذكر"
      ],
      [
        "خديجة",
        "أنثى"
      ],
      [
        "مازن",
        "ذكر"
      ],
      [
        "رفيف",
        "أنثى"
      ]
    ],
    "culpritIndex": 5,
    "evidence": [
      {
        "ar": "الحقيبة الزرقاء",
        "en": "Blue Bag"
      },
      {
        "ar": "مركز",
        "en": "Center"
      },
      {
        "ar": "كرسي",
        "en": "Chair"
      },
      {
        "ar": "طاولة",
        "en": "Table"
      },
      {
        "ar": "الشرطي",
        "en": "Police officer"
      }
    ],
    "clues": [
      {
        "innocentIndices": [
          0,
          1,
          2
        ],
        "speech": "سامي ونور وأنس كانوا عند الباب مع الحارس. هم أبرياء."
      },
      {
        "innocentIndices": [
          3
        ],
        "speech": "خديجة كانت تجلس على كرسي مع المعلمة، فهي بريئة."
      },
      {
        "innocentIndices": [
          4
        ],
        "speech": "مازن كان قرب الطاولة مع الشرطي، فهو بريء."
      }
    ]
  }
];

export const BEGINNER_DETECTIVE_CASES: DetectiveCase[] = BEGINNER_CASE_SEEDS.map(seed => {
  const prefix = `beginner_${seed.number}`;
  const fileNumber = String(seed.number).padStart(2, '0');
  const suspects: SuspectPerson[] = seed.people.map(([name, gender], slot) => ({
    id: `${prefix}_${slot}`,
    name,
    gender,
    image: `/detective/beginner/portraits/case-${fileNumber}-suspect-${slot}.webp`,
  }));

  // Three successive clues exclude 3 + 1 + 1 innocent suspects.
  const clues = seed.clues.map(clue => ({
    speech: clue.speech,
    matcher: (suspect: SuspectPerson) =>
      clue.innocentIndices.some(position => suspect.id === `${prefix}_${position}`),
  }));
  return {
    id: 100 + seed.number,
    level: 'beginner' as const,
    caseNumber: seed.number,
    caseIndex: seed.number - 1,
    codeName: seed.title,
    crimeDescription: seed.description,
    bgImage: `url("/detective/beginner/scene-${fileNumber}.webp")`,
    suspects,
    suspectIds: suspects.map(suspect => suspect.id),
    culpritId: suspects[seed.culpritIndex].id,
    evidenceTerms: seed.evidence,
    clues,
  };
});
