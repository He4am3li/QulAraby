import { TranslatorChallenge } from '../types';

export const STARTER_TRANSLATOR_CHALLENGES: TranslatorChallenge[] = [
  // ==================== LEVEL 1: SENTENCE PUZZLE (تركيب الجمل) ====================
  {
    id: 'lvl1_1',
    level: 1,
    type: 'puzzle',
    promptEn: 'I drink cold water',
    scenarioContext: 'Daily Habits | عادات يومية',
    targetArabic: 'أَنَا أَشْرَبُ المَاءَ البَارِدَ',
    targetTransliteration: 'Ana ashrabu al-maa\'a al-baarid',
    correctOrderIds: ['p1_1', 'p1_2', 'p1_3', 'p1_4'],
    puzzleWords: [
      { id: 'p1_3', arabic: 'المَاءَ', transliteration: 'Al-maa\'a', meaningEn: 'the water' },
      { id: 'p1_1', arabic: 'أَنَا', transliteration: 'Ana', meaningEn: 'I' },
      { id: 'p1_4', arabic: 'البَارِدَ', transliteration: 'Al-baarid', meaningEn: 'cold' },
      { id: 'p1_2', arabic: 'أَشْرَبُ', transliteration: 'Ashrabu', meaningEn: 'drink' }
    ],
    grammarNote: 'In Arabic, the adjective (البارد / cold) comes AFTER the noun (الماء / water).'
  },
  {
    id: 'lvl1_2',
    level: 1,
    type: 'puzzle',
    promptEn: 'The book is on the table',
    scenarioContext: 'In the Room | في الغرفة',
    targetArabic: 'الكِتَابُ عَلَى الطَّاوِلَةِ',
    targetTransliteration: 'Al-kitaabu \'ala at-taawilah',
    correctOrderIds: ['p2_1', 'p2_2', 'p2_3'],
    puzzleWords: [
      { id: 'p2_2', arabic: 'عَلَى', transliteration: '\'Ala', meaningEn: 'on' },
      { id: 'p2_1', arabic: 'الكِتَابُ', transliteration: 'Al-kitaabu', meaningEn: 'the book' },
      { id: 'p2_3', arabic: 'الطَّاوِلَةِ', transliteration: 'At-taawilah', meaningEn: 'the table' }
    ],
    grammarNote: '\'Ala (عَلَى) is a preposition meaning "on". The noun after it takes Kasrah.'
  },
  {
    id: 'lvl1_3',
    level: 1,
    type: 'puzzle',
    promptEn: 'I want hot coffee, please',
    scenarioContext: 'At the Café | في المقهى',
    targetArabic: 'أُرِيدُ قَهْوَةً سَاخِنَةً مِنْ فَضْلِكَ',
    targetTransliteration: 'Ureedu qahwatan saakhinatan min fadlik',
    correctOrderIds: ['p3_1', 'p3_2', 'p3_3', 'p3_4'],
    puzzleWords: [
      { id: 'p3_3', arabic: 'سَاخِنَةً', transliteration: 'Saakhinah', meaningEn: 'hot' },
      { id: 'p3_1', arabic: 'أُرِيدُ', transliteration: 'Ureedu', meaningEn: 'I want' },
      { id: 'p3_4', arabic: 'مِنْ فَضْلِكَ', transliteration: 'Min fadlik', meaningEn: 'please' },
      { id: 'p3_2', arabic: 'قَهْوَةً', transliteration: 'Qahwah', meaningEn: 'coffee' }
    ],
    grammarNote: '\'Min fadlik\' (مِنْ فَضْلِكَ) is the polite way to say "please" when speaking to a male, and \'Min fadlik-i\' to a female.'
  },
  {
    id: 'lvl1_4',
    level: 1,
    type: 'puzzle',
    promptEn: 'The new teacher entered the classroom',
    scenarioContext: 'At School | في المدرسة',
    targetArabic: 'دَخَلَ المُعَلِّمُ الجَدِيدُ الفَصْلَ',
    targetTransliteration: 'Dakhala al-mu\'allimu al-jadeedu al-fasl',
    correctOrderIds: ['p4_1', 'p4_2', 'p4_3', 'p4_4'],
    puzzleWords: [
      { id: 'p4_3', arabic: 'الجَدِيدُ', transliteration: 'Al-jadeed', meaningEn: 'the new' },
      { id: 'p4_1', arabic: 'دَخَلَ', transliteration: 'Dakhala', meaningEn: 'entered' },
      { id: 'p4_4', arabic: 'الفَصْلَ', transliteration: 'Al-fasl', meaningEn: 'the classroom' },
      { id: 'p4_2', arabic: 'المُعَلِّمُ', transliteration: 'Al-mu\'allim', meaningEn: 'the teacher' }
    ],
    grammarNote: 'Arabic sentences often start with the Verb (دَخَلَ), followed by the Subject (المُعَلِّمُ).'
  },
  {
    id: 'lvl1_5',
    level: 1,
    type: 'puzzle',
    promptEn: 'Where is the train station?',
    scenarioContext: 'In the City | في المدينة',
    targetArabic: 'أَيْنَ مَحَطَّةُ القِطَارِ؟',
    targetTransliteration: 'Ayna mahattatu al-qitaar?',
    correctOrderIds: ['p5_1', 'p5_2', 'p5_3'],
    puzzleWords: [
      { id: 'p5_3', arabic: 'القِطَارِ؟', transliteration: 'Al-qitaar?', meaningEn: 'the train?' },
      { id: 'p5_1', arabic: 'أَيْنَ', transliteration: 'Ayna', meaningEn: 'Where is' },
      { id: 'p5_2', arabic: 'مَحَطَّةُ', transliteration: 'Mahattatu', meaningEn: 'the station of' }
    ],
    grammarNote: '\'Mahattat al-qitaar\' is a possessive phrase (Idafah = Station of the train).'
  },

  // ==================== LEVEL 2: FILL IN THE BLANK (الكلمة المفقودة) ====================
  {
    id: 'lvl2_1',
    level: 2,
    type: 'gap',
    promptEn: 'She is a skilled doctor',
    scenarioContext: 'At the Clinic | في العيادة',
    sentenceWithBlank: {
      arabic: 'هِيَ ... مَاهِرَةٌ',
      transliteration: 'Hiya ... maahirah',
      blankTranslation: 'doctor (female)'
    },
    options: [
      {
        id: 'opt1_1',
        arabic: 'طَبِيبٌ',
        transliteration: 'Tabeeb',
        meaningEn: 'doctor (male)',
        isCorrect: false,
        explanation: 'This is masculine. Because the pronoun is "Hiya" (She), you need the feminine noun ending in Taa\' Marbutah.'
      },
      {
        id: 'opt1_2',
        arabic: 'طَبِيبَةٌ',
        transliteration: 'Tabeebah',
        meaningEn: 'doctor (female)',
        isCorrect: true,
        explanation: 'Excellent! "Tabeebah" (طَبِيبَةٌ) matches the feminine subject "Hiya" (هِيَ) and adjective "Maahirah" (مَاهِرَةٌ).'
      },
      {
        id: 'opt1_3',
        arabic: 'مُهَنْدِسَةٌ',
        transliteration: 'Muhandisah',
        meaningEn: 'engineer (female)',
        isCorrect: false,
        explanation: 'This means engineer, not doctor.'
      }
    ],
    grammarNote: 'In Arabic, gender agreement is essential: Pronoun (Feminine) + Noun (Feminine) + Adjective (Feminine).'
  },
  {
    id: 'lvl2_2',
    level: 2,
    type: 'gap',
    promptEn: 'I traveled to the capital by airplane',
    scenarioContext: 'Travel & Trips | السفر والرحلات',
    sentenceWithBlank: {
      arabic: 'سَافَرْتُ ... العَاصِمَةِ بِالطَّائِرَةِ',
      transliteration: 'Saafartu ... al-\'aasimah bit-taa\'irah',
      blankTranslation: 'to'
    },
    options: [
      {
        id: 'opt2_1',
        arabic: 'إِلَى',
        transliteration: 'Ilaa',
        meaningEn: 'to / toward',
        isCorrect: true,
        explanation: 'Spot on! In Arabic, the verb "Saafara" (travel) is paired with the preposition "Ilaa" (إِلَى) to indicate direction.'
      },
      {
        id: 'opt2_2',
        arabic: 'فِي',
        transliteration: 'Fee',
        meaningEn: 'in / inside',
        isCorrect: false,
        explanation: '"Fee" means inside, but we travel "TO" a destination.'
      },
      {
        id: 'opt2_3',
        arabic: 'مِنْ',
        transliteration: 'Min',
        meaningEn: 'from',
        isCorrect: false,
        explanation: '"Min" means from, which would mean traveling away from the capital.'
      }
    ],
    grammarNote: 'Prepositions: "Ilaa" (إِلَى) expresses motion towards a destination.'
  },
  {
    id: 'lvl2_3',
    level: 2,
    type: 'gap',
    promptEn: 'The weather today is very beautiful',
    scenarioContext: 'Weather | الطقس والجو',
    sentenceWithBlank: {
      arabic: 'الطَّقْسُ اليَوْمَ ... جِدّاً',
      transliteration: 'At-taqsu al-yawma ... jiddan',
      blankTranslation: 'beautiful (masculine)'
    },
    options: [
      {
        id: 'opt3_1',
        arabic: 'جَمِيلَةٌ',
        transliteration: 'Jameelah',
        meaningEn: 'beautiful (feminine)',
        isCorrect: false,
        explanation: '"At-Taqs" (الطقس / weather) is a masculine word, so its adjective must also be masculine without Taa\' Marbutah.'
      },
      {
        id: 'opt3_2',
        arabic: 'جَمِيلٌ',
        transliteration: 'Jameel',
        meaningEn: 'beautiful (masculine)',
        isCorrect: true,
        explanation: 'Perfect! "Jameel" (جَمِيلٌ) agrees in masculine gender with "At-Taqs" (الطَّقْسُ).'
      },
      {
        id: 'opt3_3',
        arabic: 'كَبِيرٌ',
        transliteration: 'Kabeer',
        meaningEn: 'big / large',
        isCorrect: false,
        explanation: 'Means big/large, not beautiful.'
      }
    ],
    grammarNote: 'Since "At-Taqs" is masculine, the adjective must be "Jameel" (not Jameelah).'
  },
  {
    id: 'lvl2_4',
    level: 2,
    type: 'gap',
    promptEn: 'We live in a big house',
    scenarioContext: 'Family & Home | البيت والأسرة',
    sentenceWithBlank: {
      arabic: 'نَحْنُ نَسْكُنُ فِي ... كَبِيرٍ',
      transliteration: 'Nahnu naskunu fee ... kabeer',
      blankTranslation: 'a house'
    },
    options: [
      {
        id: 'opt4_1',
        arabic: 'بَيْتٍ',
        transliteration: 'Baytin',
        meaningEn: 'a house',
        isCorrect: true,
        explanation: 'Correct! "Bayt" is a house. After "fee" (فِي), the noun takes Tanween Kasr.'
      },
      {
        id: 'opt4_2',
        arabic: 'سَيَّارَةٍ',
        transliteration: 'Sayyaaratin',
        meaningEn: 'a car',
        isCorrect: false,
        explanation: 'Means a car, not a house.'
      },
      {
        id: 'opt4_3',
        arabic: 'شَارِعٍ',
        transliteration: 'Shaari\'in',
        meaningEn: 'a street',
        isCorrect: false,
        explanation: 'Means a street, not a house.'
      }
    ],
    grammarNote: '"Nahnu naskunu" (نَحْنُ نَسْكُنُ) = We live / reside.'
  },

  // ==================== LEVEL 3: SMART ASSISTED TRANSLATION (الترجمة المباشرة) ====================
  {
    id: 'lvl3_1',
    level: 3,
    type: 'scenario',
    promptEn: 'How much is this shirt, please?',
    scenarioContext: 'At the Market / Shopping | في السوق والتسوق',
    scenarioHint: 'Use \'Bikam\' for asking the price, and \'Hadha al-qamees\' for this shirt.',
    vocabularyClues: [
      { arabic: 'بِكَمْ', transliteration: 'Bikam', meaningEn: 'How much' },
      { arabic: 'هَذَا القَمِيصُ', transliteration: 'Hadha al-qamees', meaningEn: 'this shirt' },
      { arabic: 'مِنْ فَضْلِكَ', transliteration: 'Min fadlik', meaningEn: 'please' }
    ],
    referenceTranslation: 'بِكَمْ هَذَا القَمِيصُ مِنْ فَضْلِكَ؟',
    grammarNote: 'To ask the price of an item in Arabic, say "Bikam" (بِكَمْ) + the item name.'
  },
  {
    id: 'lvl3_2',
    level: 3,
    type: 'scenario',
    promptEn: 'I have a reservation at this hotel',
    scenarioContext: 'Hotel Check-in | في الفندق',
    scenarioHint: 'Use \'Ladaiyya\' or \'Indi\' for "I have", and \'Hajz\' for reservation.',
    vocabularyClues: [
      { arabic: 'لَدَيَّ / عِنْدِي', transliteration: 'Ladaiyya / \'Indi', meaningEn: 'I have' },
      { arabic: 'حَجْزٌ', transliteration: 'Hajz', meaningEn: 'a reservation' },
      { arabic: 'فِي هَذَا الفُنْدُقِ', transliteration: 'Fee hadha al-funduq', meaningEn: 'in this hotel' }
    ],
    referenceTranslation: 'لَدَيَّ حَجْزٌ فِي هَذَا الفُنْدُقِ',
    grammarNote: '\'Ladaiyya\' (لَدَيَّ) is a refined, formal way to express possession ("I have").'
  },
  {
    id: 'lvl3_3',
    level: 3,
    type: 'scenario',
    promptEn: 'Can you bring the menu, please?',
    scenarioContext: 'At the Restaurant | في المطعم',
    scenarioHint: 'Start with \'Hal yumkinuka\' (Can you) and use \'Qaa\'imat at-ta\'aam\' for menu.',
    vocabularyClues: [
      { arabic: 'هَلْ يُمْكِنُكَ', transliteration: 'Hal yumkinuka', meaningEn: 'Can you / Is it possible for you' },
      { arabic: 'إِحْضَارُ', transliteration: 'Ihdaaru', meaningEn: 'bringing' },
      { arabic: 'قَائِمَةِ الطَّعَامِ', transliteration: 'Qaa\'imat at-ta\'aam', meaningEn: 'the food menu' },
      { arabic: 'مِنْ فَضْلِكَ', transliteration: 'Min fadlik', meaningEn: 'please' }
    ],
    referenceTranslation: 'هَلْ يُمْكِنُكَ إِحْضَارُ قَائِمَةِ الطَّعَامِ مِنْ فَضْلِكَ؟',
    grammarNote: '\'Hal yumkinuka\' is the standard polite request formula in Arabic.'
  },
  {
    id: 'lvl3_4',
    level: 3,
    type: 'scenario',
    promptEn: 'Nice to meet you, my name is Omar',
    scenarioContext: 'Greetings & Introductions | التعارف والتحية',
    scenarioHint: 'Use \'Tasharrafna\' or \'Fursah sa\'eedah\' for nice to meet you, and \'Ismee\' for my name is.',
    vocabularyClues: [
      { arabic: 'تَشَرَّفْنَا', transliteration: 'Tasharrafna', meaningEn: 'Honored to meet you' },
      { arabic: 'فُرْصَةٌ سَعِيدَةٌ', transliteration: 'Fursah sa\'eedah', meaningEn: 'Pleasure meeting you' },
      { arabic: 'اسْمِي', transliteration: 'Ismee', meaningEn: 'my name is' }
    ],
    referenceTranslation: 'تَشَرَّفْنَا، اسْمِي عُمَر',
    grammarNote: '\'Tasharrafna\' (تَشَرَّفْنَا) literally means "We are honored", widely used as "Pleased to meet you".'
  }
];

export const FALLBACK_AI_CHALLENGES: Record<1 | 2 | 3, TranslatorChallenge[]> = {
  1: [
    {
      id: 'fb_lvl1_1',
      level: 1,
      type: 'puzzle',
      promptEn: 'I want a cup of hot tea',
      scenarioContext: 'At the Café | في المقهى',
      targetArabic: 'أُرِيدُ كُوباً مِنَ الشَّايِ السَّاخِنِ',
      targetTransliteration: 'Ureedu kooban mina ash-shaayi as-saakhin',
      correctOrderIds: ['fb1_1', 'fb1_2', 'fb1_3', 'fb1_4'],
      puzzleWords: [
        { id: 'fb1_3', arabic: 'مِنَ الشَّايِ', transliteration: 'Mina ash-shaay', meaningEn: 'of tea' },
        { id: 'fb1_1', arabic: 'أُرِيدُ', transliteration: 'Ureedu', meaningEn: 'I want' },
        { id: 'fb1_4', arabic: 'السَّاخِنِ', transliteration: 'As-saakhin', meaningEn: 'hot' },
        { id: 'fb1_2', arabic: 'كُوباً', transliteration: 'Kooban', meaningEn: 'a cup' }
      ],
      grammarNote: 'In Arabic, the adjective (السَّاخِن / hot) comes AFTER the noun (الشَّاي / tea).'
    },
    {
      id: 'fb_lvl1_2',
      level: 1,
      type: 'puzzle',
      promptEn: 'The student reads a useful book',
      scenarioContext: 'Library & Study | في المكتبة والدراسة',
      targetArabic: 'يَقْرَأُ الطَّالِبُ كِتَاباً مُفِيداً',
      targetTransliteration: 'Yaqra\'u at-taalibu kitaaban mufeeda',
      correctOrderIds: ['fb2_1', 'fb2_2', 'fb2_3', 'fb2_4'],
      puzzleWords: [
        { id: 'fb2_2', arabic: 'الطَّالِبُ', transliteration: 'At-taalib', meaningEn: 'the student' },
        { id: 'fb2_4', arabic: 'مُفِيداً', transliteration: 'Mufeeda', meaningEn: 'useful' },
        { id: 'fb2_1', arabic: 'يَقْرَأُ', transliteration: 'Yaqra\'u', meaningEn: 'reads' },
        { id: 'fb2_3', arabic: 'كِتَاباً', transliteration: 'Kitaaban', meaningEn: 'a book' }
      ],
      grammarNote: 'Arabic verbal sentences typically place the verb first (يَقْرَأُ).'
    }
  ],
  2: [
    {
      id: 'fb_lvl2_1',
      level: 2,
      type: 'gap',
      promptEn: 'He is an active engineer',
      scenarioContext: 'Work & Professions | العمل والمهن',
      sentenceWithBlank: {
        arabic: 'هُوَ ... نَشِيطٌ',
        transliteration: 'Huwa ... nasheet',
        blankTranslation: 'engineer (male)'
      },
      options: [
        {
          id: 'fb_opt1_1',
          arabic: 'مُهَنْدِسٌ',
          transliteration: 'Muhandis',
          meaningEn: 'engineer (male)',
          isCorrect: true,
          explanation: 'Correct! "Muhandis" is masculine, matching the pronoun "Huwa" (He) and adjective "Nasheet".'
        },
        {
          id: 'fb_opt1_2',
          arabic: 'مُهَنْدِسَةٌ',
          transliteration: 'Muhandisah',
          meaningEn: 'engineer (female)',
          isCorrect: false,
          explanation: 'This is feminine, but the subject pronoun "Huwa" is masculine.'
        },
        {
          id: 'fb_opt1_3',
          arabic: 'طَالِبَةٌ',
          transliteration: 'Taalibah',
          meaningEn: 'student (female)',
          isCorrect: false,
          explanation: 'Means female student, not male engineer.'
        }
      ],
      grammarNote: 'The subject pronoun "Huwa" (هُوَ) matches with a masculine singular noun without Taa\' Marbutah.'
    },
    {
      id: 'fb_lvl2_2',
      level: 2,
      type: 'gap',
      promptEn: 'The pen is inside the bag',
      scenarioContext: 'School Supplies | الأدوات المدرسية',
      sentenceWithBlank: {
        arabic: 'القَلَمُ ... الحَقِيبَةِ',
        transliteration: 'Al-qalamu ... al-haqeebah',
        blankTranslation: 'in / inside'
      },
      options: [
        {
          id: 'fb_opt2_1',
          arabic: 'فِي',
          transliteration: 'Fee',
          meaningEn: 'in / inside',
          isCorrect: true,
          explanation: 'Perfect! "Fee" (فِي) means in or inside.'
        },
        {
          id: 'fb_opt2_2',
          arabic: 'عَلَى',
          transliteration: '\'Ala',
          meaningEn: 'on / on top of',
          isCorrect: false,
          explanation: '"\'Ala" means on top of, not inside.'
        },
        {
          id: 'fb_opt2_3',
          arabic: 'مَعَ',
          transliteration: 'Ma\'a',
          meaningEn: 'with',
          isCorrect: false,
          explanation: '"Ma\'a" means with/accompanied by.'
        }
      ],
      grammarNote: 'Preposition "Fee" (فِي) indicates location inside an object.'
    }
  ],
  3: [
    {
      id: 'fb_lvl3_1',
      level: 3,
      type: 'scenario',
      promptEn: 'Where is the nearest pharmacy, please?',
      scenarioContext: 'In the City | في المدينة',
      scenarioHint: 'Use \'Ayna\' for where, \'Aqrab\' for nearest, and \'Saydaliyyah\' for pharmacy.',
      vocabularyClues: [
        { arabic: 'أَيْنَ', transliteration: 'Ayna', meaningEn: 'Where is' },
        { arabic: 'أَقْرَبُ', transliteration: 'Aqrab', meaningEn: 'nearest' },
        { arabic: 'صَيْدَلِيَّةٍ', transliteration: 'Saydaliyyah', meaningEn: 'pharmacy' },
        { arabic: 'مِنْ فَضْلِكَ', transliteration: 'Min fadlik', meaningEn: 'please' }
      ],
      referenceTranslation: 'أَيْنَ أَقْرَبُ صَيْدَلِيَّةٍ مِنْ فَضْلِكَ؟',
      grammarNote: 'Start with "Ayna" to form a question about location.'
    },
    {
      id: 'fb_lvl3_2',
      level: 3,
      type: 'scenario',
      promptEn: 'The check please, and thank you',
      scenarioContext: 'At the Restaurant | في المطعم',
      scenarioHint: 'Use \'Al-hisaab\' for bill/check, and \'Shukran lak\' for thank you.',
      vocabularyClues: [
        { arabic: 'الحِسَابُ', transliteration: 'Al-hisaab', meaningEn: 'the bill / check' },
        { arabic: 'مِنْ فَضْلِكَ', transliteration: 'Min fadlik', meaningEn: 'please' },
        { arabic: 'شُكْراً لَكَ', transliteration: 'Shukran lak', meaningEn: 'thank you' }
      ],
      referenceTranslation: 'الحِسَابُ مِنْ فَضْلِكَ، وَشُكْراً لَكَ',
      grammarNote: 'Polite restaurant closing phrase in modern standard Arabic.'
    }
  ]
};
