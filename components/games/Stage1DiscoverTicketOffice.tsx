import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  Clock,
  Sparkles,
  Ticket,
  Printer,
  ChevronLeft,
  Volume2,
  VolumeX,
  Train,
  BookOpen,
  Layers,
  Sparkle,
  RotateCcw
} from 'lucide-react';
import { GrammarRule } from '../../src/data/grammarRulesData';
import { VintageStationClock } from './VintageStationClock';

interface Stage1DiscoverTicketOfficeProps {
  activeRule: GrammarRule;
  passengerName: string;
  onProceedToStage2: () => void;
  playSound: (type: 'whistle' | 'trainMove' | 'correct' | 'wrong' | 'brake' | 'click' | 'barrier_open' | 'barrier_alarm' | 'victory') => void;
  onNavigateStage?: (stage: number) => void;
  onBackToStation?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  lang?: 'ar' | 'en';
}

interface CabinetConfig {
  id: string;
  title: string;
  badge: string;
  description: string;
  colorScheme: 'sky' | 'emerald' | 'amber' | 'purple';
  pillars: {
    label: string;
    sub: string;
  }[];
  examples: {
    highlight: string;
    text: string;
    note: string;
  }[];
}

interface QuizQuestion {
  id: string;
  sentence: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
}

interface LessonDestinationConfig {
  destinationTitle: string;
  cabinets: CabinetConfig[];
  quizBank: QuizQuestion[];
  quiz?: QuizQuestion;
}

const DESTINATION_CONFIGS: Record<string, LessonDestinationConfig> = {
  nominal_verbal: {
    destinationTitle: 'محطة الجملة الاسمية والفعلية',
    cabinets: [
      {
        id: 'nominal',
        title: 'الجملة الاسمية',
        badge: 'تبدأ باسم صريح',
        description: 'جملة تبدأ باسم يقبل علامات الأسماء (الـ التعريف أو التنوين) وتتألف من ركنين أساسيين مرفوعين دائماً:',
        colorScheme: 'sky',
        pillars: [
          { label: 'المُبْتَدَأ (مرفوع بالضمة)', sub: 'الاسم الذي تبدأ به الجملة وتخبر عنه' },
          { label: 'الخَبَر (مرفوع بالضمة)', sub: 'الجزء المتمم لمعنى الجملة وفائدتها' }
        ],
        examples: [
          { highlight: 'الشَّمْسُ', text: 'مُشْرِقَةٌ', note: 'الشمسُ: مبتدأ مرفوع • مشرقةٌ: خبر مرفوع' },
          { highlight: 'القِطَارُ', text: 'سَرِيعٌ', note: 'القطارُ: مبتدأ مرفوع • سريعٌ: خبر مرفوع' }
        ]
      },
      {
        id: 'verbal',
        title: 'الجملة الفعلية',
        badge: 'تبدأ بفعل مقترن بزمن',
        description: 'جملة تبدأ بفعل يدل على حدث يقع في زمن معين (ماضٍ، مضارع، أمر) وتتألف من ركنين أساسيين:',
        colorScheme: 'emerald',
        pillars: [
          { label: 'الفِعْل (حدث وزمن)', sub: 'يدل على العمل والحركة في الزمن الماضي أو الحاضر' },
          { label: 'الفَاعِل (مرفوع بالضمة)', sub: 'من قام بالفعل أو اتصف به ويكون مرفوعاً' }
        ],
        examples: [
          { highlight: 'يَرْكَبُ', text: 'المُسَافِرُ القِطَارَ', note: 'يركبُ: فعل مضارع • المسافرُ: فاعل مرفوع' },
          { highlight: 'انْطَلَقَ', text: 'القِطَارُ بِسُرْعَةٍ', note: 'انطلقَ: فعل ماضٍ • القطارُ: فاعل مرفوع' }
        ]
      }
    ],
    quizBank: [
      {
        id: 'nv_q1',
        sentence: 'اَلْحَدِيقَةُ جَمِيلَةٌ',
        question: 'ما نوع هذه الجملة؟',
        options: [
          { id: 'nom', text: 'الجملة الاسمية', isCorrect: true },
          { id: 'ver', text: 'الجملة الفعلية', isCorrect: false }
        ],
        explanation: 'بدأت الجملة باسم (الحَدِيقَةُ)، فهي جملة اسمية.'
      },
      {
        id: 'nv_q2',
        sentence: 'يَرْكَبُ المُسَافِرُ القِطَارَ',
        question: 'ما نوع هذه الجملة؟',
        options: [
          { id: 'ver', text: 'الجملة الفعلية', isCorrect: true },
          { id: 'nom', text: 'الجملة الاسمية', isCorrect: false }
        ],
        explanation: 'بدأت الجملة بفعل (يَرْكَبُ) فهي جملة فعلية.'
      },
      {
        id: 'nv_q3',
        sentence: 'القِطَارُ سَرِيعٌ',
        question: 'بدأت الجملة باسم (القطار)، إذن هي:',
        options: [
          { id: 'opt1', text: 'جملة اسمية', isCorrect: true },
          { id: 'opt2', text: 'جملة فعلية', isCorrect: false }
        ],
        explanation: 'كل جملة تبدأ باسم تسمى جملة اسمية.'
      },
      {
        id: 'nv_q4',
        sentence: 'يَلْعَبُ الوَلَدُ بِالكُرَةِ',
        question: 'بدأت الجملة بفعل (يلعبُ)، إذن هي:',
        options: [
          { id: 'opt1', text: 'جملة فعلية', isCorrect: true },
          { id: 'opt2', text: 'جملة اسمية', isCorrect: false }
        ],
        explanation: 'كل جملة تبدأ بفعل تسمى جملة فعلية.'
      },
      {
        id: 'nv_q5',
        sentence: 'العِلْمُ نُورٌ',
        question: 'الجملة الاسمية تبدأ دائماً بـ:',
        options: [
          { id: 'opt1', text: 'اسم', isCorrect: true },
          { id: 'opt2', text: 'حرف جر', isCorrect: false }
        ],
        explanation: 'تبدأ الجملة الاسمية دائماً باسم يسمى المبتدأ.'
      },
      {
        id: 'nv_q6',
        sentence: 'سَافَرَ المُسَافِرُ بِالقِطَارِ',
        question: 'كلمة (سَافَرَ) في بداية الجملة هي:',
        options: [
          { id: 'opt1', text: 'فعل', isCorrect: true },
          { id: 'opt2', text: 'حرف', isCorrect: false }
        ],
        explanation: 'سافر فعل يدل على عمل في الزمن الماضي.'
      },
      {
        id: 'nv_q7',
        sentence: 'الوَرْدَةُ جَمِيلَةٌ',
        question: 'الجملة الاسمية تبدأ بـ:',
        options: [
          { id: 'opt1', text: 'اسم', isCorrect: true },
          { id: 'opt2', text: 'فعل', isCorrect: false }
        ],
        explanation: 'الجملة الاسمية تبدأ باسم، والجملة الفعلية تبدأ بفعل.'
      },
      {
        id: 'nv_q8',
        sentence: 'قَرَأَ التِّلْمِيذُ الكِتَابَ',
        question: 'الجملة الفعلية تبدأ بـ:',
        options: [
          { id: 'opt1', text: 'فعل', isCorrect: true },
          { id: 'opt2', text: 'اسم', isCorrect: false }
        ],
        explanation: 'الجملة الفعلية تبدأ بفعل.'
      }
    ]
  },

  plurals: {
    destinationTitle: 'محطة أنواع الجموع',
    cabinets: [
      {
        id: 'salim',
        title: 'جمع المذكر والمؤنث السالم',
        badge: 'يسلم بناء مفرده عند الجمع',
        description: 'سمي سالماً لأن بناء مفرده يسلم من أي تغيير وتضاف إليه حروف خاصة:',
        colorScheme: 'sky',
        pillars: [
          { label: 'جمع المذكر السالم', sub: 'ما دلّ على أكثر من اثنين بزيادة (ون) رفعاً أو (ين) نصباً وجراً' },
          { label: 'جمع المؤنث السالم', sub: 'ما دلّ على أكثر من اثنتين بزيادة (ات) سالمة على المفرد' }
        ],
        examples: [
          { highlight: 'مُعَلِّمٌ', text: 'مُعَلِّمُونَ / مُعَلِّمِينَ', note: 'زيادة ون / ين على المفرد السالم' },
          { highlight: 'طَالِبَةٌ', text: 'طَالِبَاتٌ', note: 'حذف التاء المربوطة وزيادة (ات)' }
        ]
      },
      {
        id: 'takseer',
        title: 'جمع التكسير',
        badge: 'يتغير ويتكسر بناء مفرده',
        description: 'ما دلّ على ثلاثة فأكثر مع تغير وتكسير صورة مفرده الأصلية بحذف أو زيادة أو تبديل الحركات:',
        colorScheme: 'amber',
        pillars: [
          { label: 'تغيير صورة المفرد', sub: 'تتكسر الحروف الأصلية كِتَاب ➔ كُتُب' },
          { label: 'علامات إعراب أصلية', sub: 'يرفع بالضمة، وينصب بالفتحة، ويجر بالكسرة' }
        ],
        examples: [
          { highlight: 'قَلَمٌ', text: 'أَقْلامٌ (زيادة حروف)', note: 'قلم ➔ أقلام' },
          { highlight: 'كِتَابٌ', text: 'كُتُبٌ (حذف وتغير حركات)', note: 'كتاب ➔ كُتُب' }
        ]
      }
    ],
    quizBank: [
      {
        id: 'pl_q1',
        sentence: 'مُعَلِّمُونَ',
        question: 'ما نوع هذا الجمع؟',
        options: [
          { id: 'muth', text: 'جمع مذكر سالم', isCorrect: true },
          { id: 'taks', text: 'جمع تكسير', isCorrect: false }
        ],
        explanation: 'ينتهي بواو ونون زائدتين على مفرده السالم فهو جمع مذكر سالم.'
      },
      {
        id: 'pl_q2',
        sentence: 'مُمَرِّضَاتٌ',
        question: 'ما نوع هذا الجمع؟',
        options: [
          { id: 'opt1', text: 'جمع مؤنث سالم', isCorrect: true },
          { id: 'opt2', text: 'جمع مذكر سالم', isCorrect: false }
        ],
        explanation: 'ينتهي بألف وتاء زائدتين (ات) فهو جمع مؤنث سالم.'
      },
      {
        id: 'pl_q3',
        sentence: 'أَقْلَامٌ',
        question: 'كلمة (أَقْلَام) هي جمع نوعه:',
        options: [
          { id: 'opt1', text: 'جمع تكسير', isCorrect: true },
          { id: 'opt2', text: 'جمع مؤنث سالم', isCorrect: false }
        ],
        explanation: 'تكسرت حروف مفرده (قلم) فهو جمع تكسير.'
      },
      {
        id: 'pl_q4',
        sentence: 'مُهَنْدِسُونَ',
        question: 'الجمع الذي ينتهي بـ (ون) هو:',
        options: [
          { id: 'opt1', text: 'جمع مذكر سالم', isCorrect: true },
          { id: 'opt2', text: 'جمع مؤنث سالم', isCorrect: false }
        ],
        explanation: 'الواو والنون من علامات جمع المذكر السالم.'
      },
      {
        id: 'pl_q5',
        sentence: 'طَالِبَاتٌ',
        question: 'الجمع الذي ينتهي بـ (ات) هو:',
        options: [
          { id: 'opt1', text: 'جمع مؤنث سالم', isCorrect: true },
          { id: 'opt2', text: 'جمع مذكر سالم', isCorrect: false }
        ],
        explanation: 'الألف والتاء المفتوحة علامة جمع المؤنث السالم.'
      },
      {
        id: 'pl_q6',
        sentence: 'كُتُبٌ',
        question: 'كلمة (كُتُب) جمع تكسير لأن مفردها:',
        options: [
          { id: 'opt1', text: 'كِتَابٌ', isCorrect: true },
          { id: 'opt2', text: 'مُعَلِّمٌ', isCorrect: false }
        ],
        explanation: 'مفرد كتب هو كتاب.'
      },
      {
        id: 'pl_q7',
        sentence: 'صَائِمُونَ',
        question: 'مفرد كلمة (صَائِمُونَ) هو:',
        options: [
          { id: 'opt1', text: 'صَائِمٌ', isCorrect: true },
          { id: 'opt2', text: 'صِيَامٌ', isCorrect: false }
        ],
        explanation: 'مفرد صائمون هو صائم، وسلمت حروفه في الجمع.'
      },
      {
        id: 'pl_q8',
        sentence: 'مَحَطَّاتٌ',
        question: 'كلمة (مَحَطَّات) تنتهي بـ (ات)، فهي:',
        options: [
          { id: 'opt1', text: 'جمع مؤنث سالم', isCorrect: true },
          { id: 'opt2', text: 'جمع مذكر سالم', isCorrect: false }
        ],
        explanation: 'كل جمع ينتهي بألف وتاء زائدتين هو جمع مؤنث سالم.'
      }
    ]
  },

  kana_sisters: {
    destinationTitle: 'محطة كان وأخواتها',
    cabinets: [
      {
        id: 'kana_family',
        title: 'أخوات كان وعملها الإعرابي',
        badge: 'أفعال ماضية ناقصة ناسخة',
        description: 'أفعال تدخل على الجملة الاسمية فترفع المبتدأ ويسمى اسمها، وتنصب الخبر ويسمى خبرها:',
        colorScheme: 'emerald',
        pillars: [
          { label: 'ترفع المبتدأ (اسمها)', sub: 'يبقى المبتدأ مرفوعاً ويسمى اسم كان' },
          { label: 'تنصب الخبر (خبرها)', sub: 'يتغير الخبر من الرفع إلى النصب بالفتحة' }
        ],
        examples: [
          { highlight: 'أشهر أخوات كان', text: 'كَانَ، أَصْبَحَ، أَضْحَى، أَمْسَى، ظَلَّ، بَاتَ، صَارَ، لَيْسَ', note: 'تدل على الأوقات والتحول والنفي' }
        ]
      },
      {
        id: 'kana_comparison',
        title: 'الأثر الإعرابي مع الأمثلة',
        badge: 'مقارنة قبل وبعد دخول كان',
        description: 'لاحظ كيف تغير ضبط الخبر من الضمة إلى الفتحة بعد دخول الفعل الناسخ:',
        colorScheme: 'sky',
        pillars: [
          { label: 'قبل كان (مبتدأ وخبر)', sub: 'الجَوُّ [مرفوع] مُمْطِرٌ [مرفوع]' },
          { label: 'بعد كان (اسم وخبر كان)', sub: 'كَانَ الجَوُّ [مرفوع] مُمْطِراً [منصوب بالفتحة]' }
        ],
        examples: [
          { highlight: 'كَانَ الجَوُّ', text: 'مُمْطِراً', note: 'الجو: اسم كان مرفوع • ممطراً: خبر كان منصوب' },
          { highlight: 'صَارَ المَاءُ', text: 'ثَلْجاً', note: 'الماء: اسم صار مرفوع • ثلجاً: خبر صار منصوب' }
        ]
      }
    ],
    quizBank: [
      {
        id: 'kn_q1',
        sentence: 'كَانَ الجَوُّ مُمْطِراً',
        question: 'كلمة (كَانَ) هي من:',
        options: [
          { id: 'correct_k', text: 'الأفعال الناسخة', isCorrect: true },
          { id: 'wrong_k', text: 'حروف الجر', isCorrect: false }
        ],
        explanation: 'كان وأخواتها أفعال ناسخة تدخل على الجملة الاسمية.'
      },
      {
        id: 'kn_q2',
        sentence: 'أَصْبَحَ القِطَارُ سَرِيعاً',
        question: 'كلمة (أَصْبَحَ) هي من أخوات:',
        options: [
          { id: 'opt1', text: 'كَانَ', isCorrect: true },
          { id: 'opt2', text: 'إِنَّ', isCorrect: false }
        ],
        explanation: 'أصبح من أخوات كان المشهورة.'
      },
      {
        id: 'kn_q3',
        sentence: 'صَارَ المَاءُ ثَلْجاً',
        question: '(صَارَ) تفيد تحول الحال وهي من أخوات:',
        options: [
          { id: 'opt1', text: 'كَانَ', isCorrect: true },
          { id: 'opt2', text: 'حروف الجر', isCorrect: false }
        ],
        explanation: 'صار من أخوات كان وتفيد التحول.'
      },
      {
        id: 'kn_q4',
        sentence: 'لَيْسَ النَّجَاحُ صَعْباً',
        question: '(لَيْسَ) تفيد النفي وهي من أخوات:',
        options: [
          { id: 'opt1', text: 'كَانَ', isCorrect: true },
          { id: 'opt2', text: 'حروف العطف', isCorrect: false }
        ],
        explanation: 'ليس فعل ناسخ يفيد النفي من أخوات كان.'
      },
      {
        id: 'kn_q5',
        sentence: 'كَانَ القِطَارُ سَرِيعاً',
        question: 'تدخل (كَانَ) على الجملة:',
        options: [
          { id: 'opt1', text: 'الاسمية', isCorrect: true },
          { id: 'opt2', text: 'الفعلية فقط', isCorrect: false }
        ],
        explanation: 'كان وأخواتها تدخل على الجملة الاسمية.'
      },
      {
        id: 'kn_q6',
        sentence: 'ظَلَّ الجُنْدِيُّ وَاقِفاً',
        question: 'كلمة (ظَلَّ) هي من أخوات:',
        options: [
          { id: 'opt1', text: 'كَانَ', isCorrect: true },
          { id: 'opt2', text: 'إِنَّ', isCorrect: false }
        ],
        explanation: 'ظل تفيد الاستمرار وهي من أخوات كان.'
      },
      {
        id: 'kn_q7',
        sentence: 'كَانَ الطَّالِبُ نَشِيطاً',
        question: 'الاسم الأول بعد كان (الطَّالِبُ) يسمى:',
        options: [
          { id: 'opt1', text: 'اسم كَانَ', isCorrect: true },
          { id: 'opt2', text: 'فاعل', isCorrect: false }
        ],
        explanation: 'المبتدأ بعد كان يسمى اسم كان.'
      },
      {
        id: 'kn_q8',
        sentence: 'أَمْسَى الجَوُّ بَارِداً',
        question: 'كلمة (أَمْسَى) هي من أخوات:',
        options: [
          { id: 'opt1', text: 'كَانَ', isCorrect: true },
          { id: 'opt2', text: 'حروف الجر', isCorrect: false }
        ],
        explanation: 'أمسی من أخوات كان وتدل على وقت المساء.'
      }
    ]
  },

  inna_sisters: {
    destinationTitle: 'محطة إنّ وأخواتها',
    cabinets: [
      {
        id: 'inna_family',
        title: 'أخوات إنّ وعملها الإعرابي',
        badge: 'حروف ناسخة تدخل على الجملة الاسمية',
        description: 'حروف تدخل على الجملة الاسمية فتنصب المبتدأ ويسمى اسمها، وترفع الخبر ويسمى خبرها (عكس عمل كان):',
        colorScheme: 'purple',
        pillars: [
          { label: 'تنصب المبتدأ (اسمها)', sub: 'يتغير المبتدأ إلى النصب بالفتحة الظاهرة' },
          { label: 'ترفع الخبر (خبرها)', sub: 'يبقى الخبر مرفوعاً بالضمة الظاهرة' }
        ],
        examples: [
          { highlight: 'أشهر أخوات إنّ', text: 'إِنَّ، أَنَّ (توكيد) • كَأَنَّ (تشبيه) • لَكِنَّ (استدراك) • لَيْتَ (تمنٍ) • لَعَلَّ (ترجٍ)', note: 'حروف ناسخة تنصب ثم ترفع' }
        ]
      },
      {
        id: 'inna_comparison',
        title: 'الأثر الإعرابي مع الأمثلة',
        badge: 'مقارنة قبل وبعد دخول إنّ',
        description: 'لاحظ كيف تغير ضبط المبتدأ من الضمة إلى الفتحة بعد دخول الحرف الناسخ:',
        colorScheme: 'amber',
        pillars: [
          { label: 'قبل إنّ (مبتدأ وخبر)', sub: 'العِلْمُ [مرفوع] نُورٌ [مرفوع]' },
          { label: 'بعد إنّ (اسم وخبر إنّ)', sub: 'إِنَّ العِلْمَ [منصوب بالفتحة] نُورٌ [مرفوع بالضمة]' }
        ],
        examples: [
          { highlight: 'إِنَّ العِلْمَ', text: 'نُورٌ', note: 'العلمَ: اسم إنّ منصوب • نورٌ: خبر إنّ مرفوع' },
          { highlight: 'لَعَلَّ النَّصْرَ', text: 'قَرِيبٌ', note: 'النصرَ: اسم لعل منصوب • قريبٌ: خبر لعل مرفوع' }
        ]
      }
    ],
    quizBank: [
      {
        id: 'in_q1',
        sentence: 'إِنَّ العِلْمَ نُورٌ',
        question: 'كلمة (إِنَّ) هي من:',
        options: [
          { id: 'correct_in', text: 'الحروف الناسخة', isCorrect: true },
          { id: 'wrong_in', text: 'الأفعال الماضية', isCorrect: false }
        ],
        explanation: 'إن وأخواتها حروف ناسخة تدخل على الجملة الاسمية.'
      },
      {
        id: 'in_q2',
        sentence: 'إِنَّ القِطَارَ سَرِيعٌ',
        question: 'تدخل (إِنَّ) وأخواتها على الجملة:',
        options: [
          { id: 'opt1', text: 'الاسمية', isCorrect: true },
          { id: 'opt2', text: 'الفعلية', isCorrect: false }
        ],
        explanation: 'إن وأخواتها تدخل على الجملة الاسمية فقط.'
      },
      {
        id: 'in_q3',
        sentence: 'لَعَلَّ النَّجَاحَ قَرِيبٌ',
        question: 'كلمة (لَعَلَّ) هي من أخوات:',
        options: [
          { id: 'opt1', text: 'إِنَّ', isCorrect: true },
          { id: 'opt2', text: 'كَانَ', isCorrect: false }
        ],
        explanation: 'لعل من أخوات إن وتفيد الترجي.'
      },
      {
        id: 'in_q4',
        sentence: 'لَيْتَ الاِمْتِحَانَ سَهْلٌ',
        question: '(لَيْتَ) تفيد التمني وهي من أخوات:',
        options: [
          { id: 'opt1', text: 'إِنَّ', isCorrect: true },
          { id: 'opt2', text: 'حروف الجر', isCorrect: false }
        ],
        explanation: 'ليت حرف ناسخ يفيد التمني من أخوات إن.'
      },
      {
        id: 'in_q5',
        sentence: 'كَأَنَّ المُعَلِّمَ أَبٌ',
        question: '(كَأَنَّ) تفيد التشبيه وهي من أخوات:',
        options: [
          { id: 'opt1', text: 'إِنَّ', isCorrect: true },
          { id: 'opt2', text: 'أخوات كان', isCorrect: false }
        ],
        explanation: 'كأن حرف ناسخ للتشبيه من أخوات إن.'
      },
      {
        id: 'in_q6',
        sentence: 'إِنَّ الصِّدْقَ نَجَاةٌ',
        question: 'الحرف الناسخ (إِنَّ) يفيد:',
        options: [
          { id: 'opt1', text: 'التوكيد', isCorrect: true },
          { id: 'opt2', text: 'النفي', isCorrect: false }
        ],
        explanation: 'إن تفيد توكيد الكلام وتثبيته.'
      },
      {
        id: 'in_q7',
        sentence: 'إِنَّ الوَلَدَ مُهَذَّبٌ',
        question: 'الكلمة بعد إنَّ (الوَلَدَ) تسمى:',
        options: [
          { id: 'opt1', text: 'اسم إِنَّ', isCorrect: true },
          { id: 'opt2', text: 'فاعل', isCorrect: false }
        ],
        explanation: 'الاسم الواقع بعد إن يسمى اسم إن.'
      },
      {
        id: 'in_q8',
        sentence: 'عَلِمْتُ أَنَّ الحَقَّ مُنْتَصِرٌ',
        question: 'كلمة (أَنَّ) هي أخت:',
        options: [
          { id: 'opt1', text: 'إِنَّ', isCorrect: true },
          { id: 'opt2', text: 'كَانَ', isCorrect: false }
        ],
        explanation: 'أن المشددة تفيد التوكيد وهي من أخوات إن.'
      }
    ]
  },

  prepositions: {
    destinationTitle: 'محطة حروف الجر',
    cabinets: [
      {
        id: 'prep_letters',
        title: 'أشهر حروف الجر',
        badge: 'حروف خاصة بالأسماء فقط',
        description: 'حروف تدخل على الأسماء فقط لتربط أجزاء الكلام، والاسم الواقع بعدها يكون مجروراً دائماً:',
        colorScheme: 'sky',
        pillars: [
          { label: 'حروف جر منفصلة', sub: 'مِنْ، إِلَى، عَنْ، عَلَى، فِي' },
          { label: 'حروف جر متصلة', sub: 'البَاء (بِالقَلَمِ)، الكَاف (كَالقَمَرِ)، اللاَّم (لِلَّهِ)' }
        ],
        examples: [
          { highlight: 'سَافَرَ إِلَى', text: 'المَحَطَّةِ', note: 'إلى: حرف جر • المحطةِ: اسم مجرور بالكسرة' },
          { highlight: 'كَتَبَ بِـ', text: 'القَلَمِ', note: 'الباء: حرف جر متصل • القلمِ: اسم مجرور' }
        ]
      },
      {
        id: 'prep_noun',
        title: 'الاسم المجرور وعلامته',
        badge: 'مجرور بالكسرة الظاهرة',
        description: 'الاسم الذي يقع بعد حرف الجر يسمى اسماً مجروراً، وعلامة جره الأصلية هي الكسرة الظاهرة تحت آخره:',
        colorScheme: 'emerald',
        pillars: [
          { label: 'الموقع الإعرابي', sub: 'يأتي مباشرة بعد أي حرف من حروف الجر' },
          { label: 'علامة الجر الأصلية', sub: 'الكسرة الظاهرة (فِي المَحَطَّةِ)' }
        ],
        examples: [
          { highlight: 'يَعِيشُ فِي', text: 'المَاءِ', note: 'الماءِ: اسم مجرور بفي وعلامة جره الكسرة' },
          { highlight: 'وَضَعَ عَلَى', text: 'الطَّاوِلَةِ', note: 'الطاولةِ: اسم مجرور بعلى وعلامة جره الكسرة' }
        ]
      }
    ],
    quizBank: [
      {
        id: 'pr_q1',
        sentence: 'سَافَرَ إِلَى المَحَطَّةِ',
        question: 'كلمة (إِلَى) هي:',
        options: [
          { id: 'correct_p', text: 'حرف جر', isCorrect: true },
          { id: 'wrong_p', text: 'فعل ماضٍ', isCorrect: false }
        ],
        explanation: 'إلى من أشهر حروف الجر المنفصلة.'
      },
      {
        id: 'pr_q2',
        sentence: 'يَعِيشُ السَّمَكُ فِي المَاءِ',
        question: 'كلمة (فِي) هي حرف:',
        options: [
          { id: 'opt1', text: 'جر', isCorrect: true },
          { id: 'opt2', text: 'عطف', isCorrect: false }
        ],
        explanation: 'في حرف جر يدخل على الأسماء.'
      },
      {
        id: 'pr_q3',
        sentence: 'وَضَعْتُ الكِتَابَ عَلَى الطَّاوِلَةِ',
        question: 'حرف الجر في هذه الجملة هو:',
        options: [
          { id: 'opt1', text: 'عَلَى', isCorrect: true },
          { id: 'opt2', text: 'الكِتَابَ', isCorrect: false }
        ],
        explanation: 'على حرف جر يفيد الاستعلاء.'
      },
      {
        id: 'pr_q4',
        sentence: 'كَتَبَ التِّلْمِيذُ بِالقَلَمِ',
        question: 'حرف الباء المتصل في (بِالقَلَمِ) هو:',
        options: [
          { id: 'opt1', text: 'حرف جر متصل', isCorrect: true },
          { id: 'opt2', text: 'اسم إشارة', isCorrect: false }
        ],
        explanation: 'الباء حرف جر متصل يدخل على الاسم.'
      },
      {
        id: 'pr_q5',
        sentence: 'خَرَجَ المُسَافِرُ مِنَ المَحَطَّةِ',
        question: 'كلمة (مِنْ) هي من أشهر حروف:',
        options: [
          { id: 'opt1', text: 'الجر', isCorrect: true },
          { id: 'opt2', text: 'النصب', isCorrect: false }
        ],
        explanation: 'من حرف جر يفيد ابتداء الغاية.'
      },
      {
        id: 'pr_q6',
        sentence: 'سَافَرَ إِلَى المَدِينَةِ',
        question: 'الكلمة بعد حرف الجر (المَدِينَةِ) تسمى:',
        options: [
          { id: 'opt1', text: 'اسماً مجروراً', isCorrect: true },
          { id: 'opt2', text: 'فعلاً', isCorrect: false }
        ],
        explanation: 'الاسم الذي يأتي بعد حرف الجر يسمى اسماً مجروراً.'
      },
      {
        id: 'pr_q7',
        sentence: 'انْطَلَقَ كَالرِّيحِ',
        question: 'الكاف في (كَالرِّيحِ) هي حرف جر يفيد:',
        options: [
          { id: 'opt1', text: 'التشبيه', isCorrect: true },
          { id: 'opt2', text: 'النفي', isCorrect: false }
        ],
        explanation: 'الكاف حرف جر متصل يفيد التشبيه.'
      },
      {
        id: 'pr_q8',
        sentence: 'قَدَّمَ الشُّكْرَ لِلْمُعَلِّمِ',
        question: 'اللام في (لِلْمُعَلِّمِ) هي حرف:',
        options: [
          { id: 'opt1', text: 'جر', isCorrect: true },
          { id: 'opt2', text: 'استفهام', isCorrect: false }
        ],
        explanation: 'اللام حرف جر متصل يدخل على الأسماء.'
      }
    ]
  }
};

const DESTINATION_CONFIGS_EN: Record<string, LessonDestinationConfig> = {
  nominal_verbal: {
    destinationTitle: 'Nominal & Verbal Sentences Station',
    cabinets: [
      {
        id: 'nominal',
        title: 'الجملة الاسمية',
        badge: 'Begins with a Noun (اسم)',
        description: 'A sentence starting with an Arabic noun (اسم) that accepts noun markers (like الـ or tanween). It consists of two essential nominative parts:',
        colorScheme: 'sky',
        pillars: [
          { label: 'المُبْتَدَأ (Subject - Nominative with Damma)', sub: 'The starting noun of the sentence that is being introduced or spoken about.' },
          { label: 'الخَبَر (Predicate - Nominative with Damma)', sub: 'The informative predicate that completes the benefit and meaning of the sentence.' }
        ],
        examples: [
          { highlight: 'الشَّمْسُ', text: 'مُشْرِقَةٌ', note: 'الشمسُ: مبتدأ مرفوع (Subject) • مشرقةٌ: خبر مرفوع (Predicate)' },
          { highlight: 'القِطَارُ', text: 'سَرِيعٌ', note: 'القطارُ: مبتدأ مرفوع (Subject) • سريعٌ: خبر مرفوع (Predicate)' }
        ]
      },
      {
        id: 'verbal',
        title: 'الجملة الفعلية',
        badge: 'Begins with a Verb (فعل)',
        description: 'A sentence that begins with a verb (فعل) tied to a specific tense (past ماضٍ, present مضارع, or imperative أمر). It has two core pillars:',
        colorScheme: 'emerald',
        pillars: [
          { label: 'الفِعْل (Verb - Action & Tense)', sub: 'Denotes the action or event happening in past, present, or imperative.' },
          { label: 'الفَاعِل (Doer / Subject - Nominative with Damma)', sub: 'The one who performs or is described by the action, always مرفوع بالضمة.' }
        ],
        examples: [
          { highlight: 'يَرْكَبُ', text: 'المُسَافِرُ القِطَارَ', note: 'يركبُ: فعل مضارع (Verb) • المسافرُ: فاعل مرفوع (Doer)' },
          { highlight: 'انْطَلَقَ', text: 'القِطَارُ بِسُرْعَةٍ', note: 'انطلقَ: فعل ماضٍ (Verb) • القطارُ: فاعل مرفوع (Doer)' }
        ]
      }
    ],
    quizBank: [
      {
        id: 'nv_q1',
        sentence: 'اَلْحَدِيقَةُ جَمِيلَةٌ',
        question: 'What is the type of this Arabic sentence?',
        options: [
          { id: 'nom', text: 'الجملة الاسمية', isCorrect: true },
          { id: 'ver', text: 'الجملة الفعلية', isCorrect: false }
        ],
        explanation: 'It starts with a noun (اسم), so it is a Nominal Sentence.'
      },
      {
        id: 'nv_q2',
        sentence: 'يَرْكَبُ المُسَافِرُ القِطَارَ',
        question: 'What is the type of this Arabic sentence?',
        options: [
          { id: 'ver', text: 'الجملة الفعلية', isCorrect: true },
          { id: 'nom', text: 'الجملة الاسمية', isCorrect: false }
        ],
        explanation: 'It starts with a verb (فعل), so it is a Verbal Sentence.'
      },
      {
        id: 'nv_q3',
        sentence: 'القِطَارُ سَرِيعٌ',
        question: 'Because it starts with a noun (القطار), it is:',
        options: [
          { id: 'opt1', text: 'جملة اسمية', isCorrect: true },
          { id: 'opt2', text: 'جملة فعلية', isCorrect: false }
        ],
        explanation: 'Sentences starting with a noun are Nominal Sentences.'
      },
      {
        id: 'nv_q4',
        sentence: 'يَلْعَبُ الوَلَدُ بِالكُرَةِ',
        question: 'Because it starts with a verb (يلعبُ), it is:',
        options: [
          { id: 'opt1', text: 'جملة فعلية', isCorrect: true },
          { id: 'opt2', text: 'جملة اسمية', isCorrect: false }
        ],
        explanation: 'Sentences starting with a verb are Verbal Sentences.'
      },
      {
        id: 'nv_q5',
        sentence: 'العِلْمُ نُورٌ',
        question: 'A Nominal Sentence (الجملة الاسمية) starts with a:',
        options: [
          { id: 'opt1', text: 'Noun (اسم)', isCorrect: true },
          { id: 'opt2', text: 'Preposition (حرف جر)', isCorrect: false }
        ],
        explanation: 'Nominal sentences always begin with a noun.'
      },
      {
        id: 'nv_q6',
        sentence: 'سَافَرَ المُسَافِرُ بِالقِطَارِ',
        question: 'The word (سَافَرَ) at the start is a:',
        options: [
          { id: 'opt1', text: 'Verb (فعل)', isCorrect: true },
          { id: 'opt2', text: 'Particle (حرف)', isCorrect: false }
        ],
        explanation: 'سافر is a verb denoting past action.'
      },
      {
        id: 'nv_q7',
        sentence: 'الوَرْدَةُ جَمِيلَةٌ',
        question: 'A Nominal Sentence (الجملة الاسمية) begins with a:',
        options: [
          { id: 'opt1', text: 'Noun (اسم)', isCorrect: true },
          { id: 'opt2', text: 'Verb (فعل)', isCorrect: false }
        ],
        explanation: 'Nominal sentences start with a noun.'
      },
      {
        id: 'nv_q8',
        sentence: 'قَرَأَ التِّلْمِيذُ الكِتَابَ',
        question: 'A Verbal Sentence (الجملة الفعلية) begins with a:',
        options: [
          { id: 'opt1', text: 'Verb (فعل)', isCorrect: true },
          { id: 'opt2', text: 'Noun (اسم)', isCorrect: false }
        ],
        explanation: 'Verbal sentences start with a verb.'
      }
    ]
  },

  plurals: {
    destinationTitle: 'Arabic Plurals Station',
    cabinets: [
      {
        id: 'salim',
        title: 'جمع المذكر والمؤنث السالم',
        badge: 'Root remains intact (سالم)',
        description: 'Called "Sound" (سالم) because the original singular form remains undamaged, with regular plural suffixes added:',
        colorScheme: 'sky',
        pillars: [
          { label: 'جمع المذكر السالم', sub: 'Denotes more than two males by adding (ون) in nominative or (ين) in accusative/genitive.' },
          { label: 'جمع المؤنث السالم', sub: 'Denotes more than two females by appending the sound suffix (ات) to the singular stem.' }
        ],
        examples: [
          { highlight: 'مُعَلِّمٌ', text: 'مُعَلِّمُونَ / مُعَلِّمِينَ', note: 'Adding ون / ين to the intact singular root' },
          { highlight: 'طَالِبَةٌ', text: 'طَالِبَاتٌ', note: 'Replacing ة with regular sound suffix (ات)' }
        ]
      },
      {
        id: 'takseer',
        title: 'جمع التكسير',
        badge: 'Singular stem breaks / changes',
        description: 'Refers to three or more where the singular root structure changes by adding, deleting, or altering vowels:',
        colorScheme: 'amber',
        pillars: [
          { label: 'Internal Stem Change (تغيير صورة المفرد)', sub: 'Original letters pattern alters internally: كِتَاب ➔ كُتُب' },
          { label: 'Standard Vowel Marks (علامات إعراب أصلية)', sub: 'Takes standard vowels: Damma for nominative, Fatha for accusative, Kasra for genitive.' }
        ],
        examples: [
          { highlight: 'قَلَمٌ', text: 'أَقْلامٌ (letter addition)', note: 'قلم ➔ أقلام' },
          { highlight: 'كِتَابٌ', text: 'كُتُبٌ (vowel change)', note: 'كتاب ➔ كُتُب' }
        ]
      }
    ],
    quizBank: [
      {
        id: 'pl_q1',
        sentence: 'مُعَلِّمُونَ',
        question: 'What type of plural is this word?',
        options: [
          { id: 'muth', text: 'جمع مذكر سالم', isCorrect: true },
          { id: 'taks', text: 'جمع تكسير', isCorrect: false }
        ],
        explanation: 'Ends with regular suffix (ون), so it is جمع مذكر سالم.'
      },
      {
        id: 'pl_q2',
        sentence: 'مُمَرِّضَاتٌ',
        question: 'What type of plural is this word?',
        options: [
          { id: 'opt1', text: 'جمع مؤنث سالم', isCorrect: true },
          { id: 'opt2', text: 'جمع مذكر سالم', isCorrect: false }
        ],
        explanation: 'Ends with the regular sound suffix (ات), so it is جمع مؤنث سالم.'
      },
      {
        id: 'pl_q3',
        sentence: 'أَقْلَامٌ',
        question: 'The word (أَقْلَام) is which type of plural?',
        options: [
          { id: 'opt1', text: 'جمع تكسير', isCorrect: true },
          { id: 'opt2', text: 'جمع مؤنث سالم', isCorrect: false }
        ],
        explanation: 'The singular pattern broke/changed (قلم ➔ أقلام), so it is جمع تكسير.'
      },
      {
        id: 'pl_q4',
        sentence: 'مُهَنْدِسُونَ',
        question: 'The plural ending in (ون) is:',
        options: [
          { id: 'opt1', text: 'جمع مذكر سالم', isCorrect: true },
          { id: 'opt2', text: 'جمع مؤنث سالم', isCorrect: false }
        ],
        explanation: 'The suffix (ون) is the distinctive mark of جمع مذكر سالم.'
      },
      {
        id: 'pl_q5',
        sentence: 'طَالِبَاتٌ',
        question: 'The plural ending in (ات) is:',
        options: [
          { id: 'opt1', text: 'جمع مؤنث سالم', isCorrect: true },
          { id: 'opt2', text: 'جمع مذكر سالم', isCorrect: false }
        ],
        explanation: 'The suffix (ات) is the distinctive mark of جمع مؤنث سالم.'
      },
      {
        id: 'pl_q6',
        sentence: 'كُتُبٌ',
        question: 'The singular of (كُتُب) is:',
        options: [
          { id: 'opt1', text: 'كِتَابٌ', isCorrect: true },
          { id: 'opt2', text: 'مُعَلِّمٌ', isCorrect: false }
        ],
        explanation: 'The singular of كتب is كتاب.'
      },
      {
        id: 'pl_q7',
        sentence: 'صَائِمُونَ',
        question: 'What is the singular of (صَائِمُونَ)?',
        options: [
          { id: 'opt1', text: 'صَائِمٌ', isCorrect: true },
          { id: 'opt2', text: 'صِيَامٌ', isCorrect: false }
        ],
        explanation: 'The singular root is صائم.'
      },
      {
        id: 'pl_q8',
        sentence: 'مَحَطَّاتٌ',
        question: 'Because (مَحَطَّات) ends in (ات), it is:',
        options: [
          { id: 'opt1', text: 'جمع مؤنث سالم', isCorrect: true },
          { id: 'opt2', text: 'جمع مذكر سالم', isCorrect: false }
        ],
        explanation: 'Words ending with the regular suffix (ات) are Sound Feminine Plurals.'
      }
    ]
  },

  kana_sisters: {
    destinationTitle: 'Kana & Its Sisters Station',
    cabinets: [
      {
        id: 'kana_family',
        title: 'كان وأخواتها',
        badge: 'Copular Verbs (أفعال ناسخة)',
        description: 'Verbs that enter upon a nominal sentence: they keep the subject nominative (اسم كان مرفوع) and change the predicate to accusative (خبر كان منصوب):',
        colorScheme: 'emerald',
        pillars: [
          { label: 'Keeps Subject Nominative (اسم كان مرفوع)', sub: 'The subject remains مرفوع (with Damma) and is called اسم كان.' },
          { label: 'Sets Predicate to Accusative (خبر كان منصوب)', sub: 'The predicate becomes منصوب (with Fatha) and is called خبر كان.' }
        ],
        examples: [
          { highlight: 'Common Sisters of Kana', text: 'كَانَ، أَصْبَحَ، أَضْحَى، أَمْسَى، ظَلَّ، بَاتَ، صَارَ، لَيْسَ', note: 'Indicate times of day, transformation (صار), or negation (ليس).' }
        ]
      },
      {
        id: 'kana_comparison',
        title: 'Grammatical Impact & Comparison',
        badge: 'Before vs. After entering Kana',
        description: 'Notice how the predicate changes from Damma (رفع) to Fatha (نصب) after Kana enters the sentence:',
        colorScheme: 'sky',
        pillars: [
          { label: 'Before Kana (Subject & Predicate)', sub: 'الجَوُّ [مرفوع / Damma] مُمْطِرٌ [مرفوع / Damma]' },
          { label: 'After Kana (Kana noun & predicate)', sub: 'كَانَ الجَوُّ [مرفوع / Damma] مُمْطِراً [منصوب / Fatha]' }
        ],
        examples: [
          { highlight: 'كَانَ الجَوُّ', text: 'مُمْطِراً', note: 'الجو: اسم كان مرفوع • ممطراً: خبر كان منصوب' },
          { highlight: 'صَارَ المَاءُ', text: 'ثَلْجاً', note: 'الماء: اسم صار مرفوع • ثلجاً: خبر صار منصوب' }
        ]
      }
    ],
    quizBank: [
      {
        id: 'kn_q1',
        sentence: 'كَانَ الجَوُّ مُمْطِراً',
        question: 'The word (كَانَ) is classified as:',
        options: [
          { id: 'correct_k', text: 'Verb (فعل ناسخ)', isCorrect: true },
          { id: 'wrong_k', text: 'Preposition (حرف جر)', isCorrect: false }
        ],
        explanation: 'Kana and its sisters are defective/cancelling verbs (أفعال ناسخة).'
      },
      {
        id: 'kn_q2',
        sentence: 'أَصْبَحَ القِطَارُ سَرِيعاً',
        question: 'The word (أَصْبَحَ) belongs to the group of:',
        options: [
          { id: 'opt1', text: 'كَانَ', isCorrect: true },
          { id: 'opt2', text: 'إِنَّ', isCorrect: false }
        ],
        explanation: 'أصبح is one of the sisters of كان.'
      },
      {
        id: 'kn_q3',
        sentence: 'صَارَ المَاءُ ثَلْجاً',
        question: '(صَارَ) expresses change of state and belongs to:',
        options: [
          { id: 'opt1', text: 'كَانَ', isCorrect: true },
          { id: 'opt2', text: 'حروف الجر', isCorrect: false }
        ],
        explanation: 'صار is a sister of كان denoting transformation.'
      },
      {
        id: 'kn_q4',
        sentence: 'لَيْسَ النَّجَاحُ صَعْباً',
        question: '(لَيْسَ) expresses negation and is a sister of:',
        options: [
          { id: 'opt1', text: 'كَانَ', isCorrect: true },
          { id: 'opt2', text: 'حروف العطف', isCorrect: false }
        ],
        explanation: 'ليس is a sister of كان used for negation.'
      },
      {
        id: 'kn_q5',
        sentence: 'كَانَ القِطَارُ سَرِيعاً',
        question: '(كَانَ) enters upon a sentence that is:',
        options: [
          { id: 'opt1', text: 'Nominal (اسمية)', isCorrect: true },
          { id: 'opt2', text: 'Verbal only', isCorrect: false }
        ],
        explanation: 'Kana and its sisters enter upon nominal sentences.'
      },
      {
        id: 'kn_q6',
        sentence: 'ظَلَّ الجُنْدِيُّ وَاقِفاً',
        question: 'The word (ظَلَّ) is a sister of:',
        options: [
          { id: 'opt1', text: 'كَانَ', isCorrect: true },
          { id: 'opt2', text: 'إِنَّ', isCorrect: false }
        ],
        explanation: 'ظل is one of the sisters of كان.'
      },
      {
        id: 'kn_q7',
        sentence: 'كَانَ الطَّالِبُ نَشِيطاً',
        question: 'The noun after Kana (الطَّالِبُ) is named:',
        options: [
          { id: 'opt1', text: 'اسم كَانَ', isCorrect: true },
          { id: 'opt2', text: 'فاعل', isCorrect: false }
        ],
        explanation: 'The subject after Kana becomes known as اسم كان.'
      },
      {
        id: 'kn_q8',
        sentence: 'أَمْسَى الجَوُّ بَارِداً',
        question: 'The word (أَمْسَى) is a sister of:',
        options: [
          { id: 'opt1', text: 'كَانَ', isCorrect: true },
          { id: 'opt2', text: 'حروف الجر', isCorrect: false }
        ],
        explanation: 'أمسى is one of the sisters of كان.'
      }
    ]
  },

  inna_sisters: {
    destinationTitle: 'Inna & Its Sisters Station',
    cabinets: [
      {
        id: 'inna_family',
        title: 'إنّ وأخواتها',
        badge: 'Annulment Particles (حروف ناسخة)',
        description: 'Particles that enter upon a nominal sentence: they make the subject accusative (اسم إنّ منصوب) and keep the predicate nominative (خبر إنّ مرفوع) — opposite of Kana:',
        colorScheme: 'purple',
        pillars: [
          { label: 'Sets Subject to Accusative (اسم إنّ منصوب)', sub: 'The subject changes from Damma to Fatha (منصوب بالفتحة).' },
          { label: 'Keeps Predicate Nominative (خبر إنّ مرفوع)', sub: 'The predicate remains with Damma (مرفوع بالضمة).' }
        ],
        examples: [
          { highlight: 'Common Sisters of Inna', text: 'إِنَّ، أَنَّ (Emphasis) • كَأَنَّ (Simile) • لَكِنَّ (Contrast) • لَيْتَ (Wish) • لَعَلَّ (Hope)', note: 'Particles placing Fatha on the noun and Damma on the predicate.' }
        ]
      },
      {
        id: 'inna_comparison',
        title: 'Grammatical Impact & Comparison',
        badge: 'Before vs. After entering Inna',
        description: 'Notice how the subject changes from Damma to Fatha after Inna enters the sentence:',
        colorScheme: 'amber',
        pillars: [
          { label: 'Before Inna (Subject & Predicate)', sub: 'العِلْمُ [مرفوع / Damma] نُورٌ [مرفوع / Damma]' },
          { label: 'After Inna (Inna noun & predicate)', sub: 'إِنَّ العِلْمَ [منصوب / Fatha] نُورٌ [مرفوع / Damma]' }
        ],
        examples: [
          { highlight: 'إِنَّ العِلْمَ', text: 'نُورٌ', note: 'العلمَ: اسم إنّ منصوب • نورٌ: خبر إنّ مرفوع' },
          { highlight: 'لَعَلَّ النَّصْرَ', text: 'قَرِيبٌ', note: 'النصرَ: اسم لعل منصوب • قريبٌ: خبر لعل مرفوع' }
        ]
      }
    ],
    quizBank: [
      {
        id: 'in_q1',
        sentence: 'إِنَّ العِلْمَ نُورٌ',
        question: 'The word (إِنَّ) is classified as a:',
        options: [
          { id: 'correct_in', text: 'Particle (حرف ناسخ)', isCorrect: true },
          { id: 'wrong_in', text: 'Verb (فعل ماض)', isCorrect: false }
        ],
        explanation: 'Inna and its sisters are cancelling particles (حروف ناسخة).'
      },
      {
        id: 'in_q2',
        sentence: 'إِنَّ القِطَارَ سَرِيعٌ',
        question: 'Inna and its sisters enter upon which sentence type?',
        options: [
          { id: 'opt1', text: 'Nominal (اسمية)', isCorrect: true },
          { id: 'opt2', text: 'Verbal (فعلية)', isCorrect: false }
        ],
        explanation: 'Inna and its sisters enter only upon nominal sentences.'
      },
      {
        id: 'in_q3',
        sentence: 'لَعَلَّ النَّجَاحَ قَرِيبٌ',
        question: 'The word (لَعَلَّ) is a sister of:',
        options: [
          { id: 'opt1', text: 'إِنَّ', isCorrect: true },
          { id: 'opt2', text: 'كَانَ', isCorrect: false }
        ],
        explanation: 'لعل is one of the sisters of إن.'
      },
      {
        id: 'in_q4',
        sentence: 'لَيْتَ الاِمْتِحَانَ سَهْلٌ',
        question: '(لَيْتَ) expresses wishing and is a sister of:',
        options: [
          { id: 'opt1', text: 'إِنَّ', isCorrect: true },
          { id: 'opt2', text: 'حروف الجر', isCorrect: false }
        ],
        explanation: 'ليت is a sister particle of إن used for wishing.'
      },
      {
        id: 'in_q5',
        sentence: 'كَأَنَّ المُعَلِّمَ أَبٌ',
        question: '(كَأَنَّ) expresses likeness and is a sister of:',
        options: [
          { id: 'opt1', text: 'إِنَّ', isCorrect: true },
          { id: 'opt2', text: 'أخوات كان', isCorrect: false }
        ],
        explanation: 'كأن is a sister particle of إن used for simile.'
      },
      {
        id: 'in_q6',
        sentence: 'إِنَّ الصِّدْقَ نَجَاةٌ',
        question: 'The particle (إِنَّ) denotes:',
        options: [
          { id: 'opt1', text: 'Emphasis (التوكيد)', isCorrect: true },
          { id: 'opt2', text: 'Negation (النفي)', isCorrect: false }
        ],
        explanation: 'إن conveys certainty and emphasis.'
      },
      {
        id: 'in_q7',
        sentence: 'إِنَّ الوَلَدَ مُهَذَّبٌ',
        question: 'The noun after Inna (الوَلَدَ) is called:',
        options: [
          { id: 'opt1', text: 'اسم إِنَّ', isCorrect: true },
          { id: 'opt2', text: 'فاعل', isCorrect: false }
        ],
        explanation: 'The noun directly following Inna is called اسم إن.'
      },
      {
        id: 'in_q8',
        sentence: 'عَلِمْتُ أَنَّ الحَقَّ مُنْتَصِرٌ',
        question: 'The word (أَنَّ) is a sister of:',
        options: [
          { id: 'opt1', text: 'إِنَّ', isCorrect: true },
          { id: 'opt2', text: 'كَانَ', isCorrect: false }
        ],
        explanation: 'أن is the sister of إن denoting emphasis.'
      }
    ]
  },

  prepositions: {
    destinationTitle: 'Prepositions Station',
    cabinets: [
      {
        id: 'prep_letters',
        title: 'حروف الجر',
        badge: 'Precede Nouns Only (خاصة بالأسماء)',
        description: 'Particles that enter only upon nouns to connect parts of speech. The noun following them is always in the genitive case (مجرور):',
        colorScheme: 'sky',
        pillars: [
          { label: 'Detached Prepositions (حروف جر منفصلة)', sub: 'مِنْ (from), إِلَى (to), عَنْ (about), عَلَى (on), فِي (in)' },
          { label: 'Attached Prepositions (حروف جر متصلة)', sub: 'البَاء (بِـ by/with), الكَاف (كَـ like), اللاَّم (لِـ for)' }
        ],
        examples: [
          { highlight: 'سَافَرَ إِلَى', text: 'المَحَطَّةِ', note: 'إلى: حرف جر • المحطةِ: اسم مجرور بالكسرة' },
          { highlight: 'كَتَبَ بِـ', text: 'القَلَمِ', note: 'الباء: حرف جر متصل • القلمِ: اسم مجرور بالكسرة' }
        ]
      },
      {
        id: 'prep_noun',
        title: 'الاسم المجرور',
        badge: 'Marked with Kasra (مجرور بالكسرة)',
        description: 'The noun following any preposition is called an اسم مجرور. Its primary grammatical marker is a visible Kasra below its final letter:',
        colorScheme: 'emerald',
        pillars: [
          { label: 'Sentence Position (الموقع الإعرابي)', sub: 'Comes immediately after any Arabic preposition.' },
          { label: 'Primary Genitive Marker (علامة الجر الأصلية)', sub: 'Visible Kasra under the final letter (فِي المَحَطَّةِ).' }
        ],
        examples: [
          { highlight: 'يَعِيشُ فِي', text: 'المَاءِ', note: 'الماءِ: اسم مجرور بفي وعلامة جره الكسرة' },
          { highlight: 'وَضَعَ عَلَى', text: 'الطَّاوِلَةِ', note: 'الطاولةِ: اسم مجرور بعلى وعلامة جره الكسرة' }
        ]
      }
    ],
    quizBank: [
      {
        id: 'pr_q1',
        sentence: 'سَافَرَ إِلَى المَحَطَّةِ',
        question: 'The word (إِلَى) is a:',
        options: [
          { id: 'opt1', text: 'Preposition (حرف جر)', isCorrect: true },
          { id: 'opt2', text: 'Past Verb (فعل ماض)', isCorrect: false }
        ],
        explanation: 'إلى is a common Arabic preposition.'
      },
      {
        id: 'pr_q2',
        sentence: 'يَعِيشُ السَّمَكُ فِي المَاءِ',
        question: 'The word (فِي) is a:',
        options: [
          { id: 'opt1', text: 'Preposition (حرف جر)', isCorrect: true },
          { id: 'opt2', text: 'Conjunction (حرف عطف)', isCorrect: false }
        ],
        explanation: 'في is a preposition meaning in/inside.'
      },
      {
        id: 'pr_q3',
        sentence: 'وَضَعْتُ الكِتَابَ عَلَى الطَّاوِلَةِ',
        question: 'The preposition in this sentence is:',
        options: [
          { id: 'opt1', text: 'عَلَى', isCorrect: true },
          { id: 'opt2', text: 'الكِتَابَ', isCorrect: false }
        ],
        explanation: 'على is the preposition in the sentence.'
      },
      {
        id: 'pr_q4',
        sentence: 'كَتَبَ التِّلْمِيذُ بِالقَلَمِ',
        question: 'The attached Baa in (بِالقَلَمِ) is a:',
        options: [
          { id: 'opt1', text: 'Preposition (حرف جر متصل)', isCorrect: true },
          { id: 'opt2', text: 'Demonstrative pronoun', isCorrect: false }
        ],
        explanation: 'The letter Baa (بِـ) is an attached preposition.'
      },
      {
        id: 'pr_q5',
        sentence: 'خَرَجَ المُسَافِرُ مِنَ المَحَطَّةِ',
        question: 'The word (مِنْ) is a:',
        options: [
          { id: 'opt1', text: 'Preposition (حرف جر)', isCorrect: true },
          { id: 'opt2', text: 'Verb', isCorrect: false }
        ],
        explanation: 'من is one of the most common prepositions.'
      },
      {
        id: 'pr_q6',
        sentence: 'سَافَرَ إِلَى المَدِينَةِ',
        question: 'The noun following a preposition (المَدِينَةِ) is called:',
        options: [
          { id: 'opt1', text: 'Genitive Noun (اسم مجرور)', isCorrect: true },
          { id: 'opt2', text: 'Verb (فعل)', isCorrect: false }
        ],
        explanation: 'Nouns after prepositions are called اسم مجرور.'
      },
      {
        id: 'pr_q7',
        sentence: 'انْطَلَقَ كَالرِّيحِ',
        question: 'The Kaf in (كَالرِّيحِ) expresses:',
        options: [
          { id: 'opt1', text: 'Simile / Likeness (التشبيه)', isCorrect: true },
          { id: 'opt2', text: 'Negation', isCorrect: false }
        ],
        explanation: 'The preposition Kaf is used for simile.'
      },
      {
        id: 'pr_q8',
        sentence: 'قَدَّمَ الشُّكْرَ لِلْمُعَلِّمِ',
        question: 'The Lam in (لِلْمُعَلِّمِ) is a:',
        options: [
          { id: 'opt1', text: 'Preposition (حرف جر)', isCorrect: true },
          { id: 'opt2', text: 'Interrogative tool', isCorrect: false }
        ],
        explanation: 'The attached Lam is a preposition.'
      }
    ]
  }
};

export const Stage1DiscoverTicketOffice: React.FC<Stage1DiscoverTicketOfficeProps> = ({
  activeRule,
  passengerName,
  onProceedToStage2,
  playSound,
  onNavigateStage,
  onBackToStation,
  soundEnabled = true,
  onToggleSound,
  lang = 'ar'
}) => {
  const destinationData = (lang === 'en' && DESTINATION_CONFIGS_EN[activeRule.id])
    ? DESTINATION_CONFIGS_EN[activeRule.id]
    : (DESTINATION_CONFIGS[activeRule.id] || DESTINATION_CONFIGS.nominal_verbal);
  const currentBank = destinationData.quizBank && destinationData.quizBank.length > 0
    ? destinationData.quizBank
    : (destinationData.quiz ? [destinationData.quiz] : []);

  // Randomized active quiz from question bank, changing on open or rule change
  const [activeQuizIdx, setActiveQuizIdx] = useState<number>(0);

  useEffect(() => {
    if (currentBank.length > 0) {
      const randomIdx = Math.floor(Math.random() * currentBank.length);
      setActiveQuizIdx(randomIdx);
    }
    setSelectedOptionId(null);
    setFeedbackState('idle');
    setTicketPhase('waiting');
    setIsBarrierOpen(false);
  }, [activeRule.id]);

  const currentQuiz = currentBank[activeQuizIdx] || currentBank[0];

  const [shuffledOptions, setShuffledOptions] = useState<Array<{ id: string; text: string; isCorrect: boolean }>>([]);

  useEffect(() => {
    if (currentQuiz && currentQuiz.options) {
      const shuffled = [...currentQuiz.options].sort(() => Math.random() - 0.5);
      setShuffledOptions(shuffled);
    }
  }, [currentQuiz]);

  const handleNextQuizQuestion = () => {
    playSound('click');
    setSelectedOptionId(null);
    setFeedbackState('idle');
    setTicketPhase('waiting');
    setIsBarrierOpen(false);
    setActiveQuizIdx(prev => (prev + 1) % currentBank.length);
  };

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  
  // Ticket issuance & barrier animation phases:
  // 'waiting' -> 'extruding' -> 'stamped'
  const [ticketPhase, setTicketPhase] = useState<'waiting' | 'extruding' | 'stamped'>('waiting');
  const [isBarrierOpen, setIsBarrierOpen] = useState<boolean>(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleOptionClick = (option: { id: string; text: string; isCorrect: boolean }) => {
    setSelectedOptionId(option.id);

    if (option.isCorrect) {
      playSound('correct');
      setFeedbackState('correct');
      
      // Step 1: Start extrusion of ticket from slot
      setTicketPhase('extruding');

      // Step 2: Stamp ticket after extrusion finishes (1.8s)
      const t1 = setTimeout(() => {
        setTicketPhase('stamped');
        playSound('victory');
      }, 1800);

      // Step 3: Open the boom barrier slower upwards (approx 3.2s)
      // to give student plenty of time to view the stamped ticket
      const t2 = setTimeout(() => {
        setIsBarrierOpen(true);
        playSound('barrier_alarm');
      }, 3200);

      // Step 4: After barrier is smoothly up (approx 7.5s), auto-advance,
      // or the student can click the button immediately!
      const t3 = setTimeout(() => {
        handleProceed();
      }, 7500);

      timeoutsRef.current.push(t1, t2, t3);
    } else {
      playSound('wrong');
      setFeedbackState('incorrect');
      setTimeout(() => {
        setFeedbackState('idle');
        setSelectedOptionId(null);
      }, 1500);
    }
  };

  const handleProceed = () => {
    timeoutsRef.current.forEach(clearTimeout);
    playSound('whistle');
    onProceedToStage2();
  };

  return (
    <div 
      id="stage1-ticket-office-screen"
      dir={lang === 'en' ? 'ltr' : 'rtl'}
      className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden text-amber-50 select-none bg-[#03090d]"
    >
      {/* 1. CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img 
          src="/vintage_ticket_office_bg.jpg" 
          alt="Vintage Railway Ticket Office Counter" 
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center filter brightness-[0.80] contrast-[1.08] saturate-[1.1]"
        />
        {/* Soft atmospheric gaslight overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020a0d]/85 via-[#031015]/40 to-[#020b0e]/55" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#01080b]/25 to-[#010608]/70" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#020c10]/75 to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-radial from-amber-500/10 via-amber-700/5 to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* 2. TOP STEPPER & CONTROLS (Identical to other stations, perfectly centered) */}
      <div className="relative z-30 w-full px-4 sm:px-6 pt-3 sm:pt-4 flex items-center justify-between shrink-0 pointer-events-auto min-h-[64px]">
        {/* Symmetrical Top Spacer to keep center stepper balanced */}
        <div className="w-10 sm:w-11 z-10" />

        {/* Center Section: Interactive 5-Stage Stepper */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none pointer-events-auto z-10" dir={lang === 'en' ? 'ltr' : 'rtl'}>
          {/* Stepper Nodes */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {[
              { id: 1, label: lang === 'en' ? 'Ticket Office' : 'شباك التذاكر' },
              { id: 2, label: lang === 'en' ? 'Switchyard' : 'محطة التحويلة' },
              { id: 3, label: lang === 'en' ? 'Coupling Station' : 'محطة الاصطفاف' },
              { id: 4, label: lang === 'en' ? 'Sorting Depot' : 'محطة الفرز' },
              { id: 5, label: lang === 'en' ? 'Arrival Station' : 'محطة الوصول' }
            ].map((st, idx, arr) => (
              <div key={st.id} className="flex items-center">
                <button
                  onClick={() => onNavigateStage && onNavigateStage(st.id)}
                  className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
                    st.id === 1
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-stone-950 ring-4 ring-amber-400/30 shadow-[0_0_18px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-[#061e22]/90 text-teal-400/70 border border-teal-500/20 hover:text-teal-200'
                  }`}
                  title={lang === 'en' ? `Go to: ${st.label}` : `الانتقال إلى: ${st.label}`}
                >
                  <span>{st.label}</span>
                </button>
                {idx < arr.length - 1 && (
                  <div className="w-2 sm:w-3.5 h-[2px] mx-0.5 rounded-full bg-teal-900/60" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Left Section: Balanced Spacer */}
        <div className="w-20 sm:w-24 pointer-events-none z-10" />
      </div>

      {/* 3. LOWERED STATION TITLE PLAQUE */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center pointer-events-none mt-2 sm:mt-3 mb-1">
        {/* Plaque Suspension Links */}
        <div className="flex items-center justify-between w-64 sm:w-72 px-8 h-2.5 -mb-1 z-10">
          <div className="w-1.5 h-2.5 bg-gradient-to-r from-[#1c140c] via-[#4d3622] to-[#140d07] rounded-xs shadow-md" />
          <div className="w-24 sm:w-32 h-1.5 bg-radial from-amber-300/40 via-amber-400/10 to-transparent blur-xs pointer-events-none" />
          <div className="w-1.5 h-2.5 bg-gradient-to-r from-[#1c140c] via-[#4d3622] to-[#140d07] rounded-xs shadow-md" />
        </div>

        {/* Plaque Body */}
        <div 
          id="station-title-plaque"
          className="px-6 sm:px-12 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-b from-[#141e24]/98 via-[#091116]/98 to-[#03070a]/98 border-2 border-amber-500/80 shadow-[0_12px_35px_rgba(0,0,0,0.95),0_0_20px_rgba(217,119,6,0.35),inset_0_1px_2px_rgba(254,240,138,0.4),inset_0_0_12px_rgba(0,0,0,0.9)] flex items-center justify-center relative overflow-hidden backdrop-blur-xl pointer-events-auto"
        >
          <div className="absolute inset-1 rounded-xl border border-amber-400/30 pointer-events-none" />
          {/* Rivets */}
          <div className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 to-amber-900 border border-amber-950 shadow-sm" />
          <div className="absolute top-1.5 left-2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 to-amber-900 border border-amber-950 shadow-sm" />
          <div className="absolute bottom-1.5 right-2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 to-amber-900 border border-amber-950 shadow-sm" />
          <div className="absolute bottom-1.5 left-2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 to-amber-900 border border-amber-950 shadow-sm" />

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-50 via-yellow-200 to-amber-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] px-3 whitespace-nowrap">
            {lang === 'en' ? 'Arabic Grammar Ticket Office' : 'شباك تذاكر النحو العربي'}
          </h1>
        </div>
      </div>

      {/* 4. MAIN VICTORIAN TICKET GUICHET & 4 LUXURY CINEMATIC PILLARS */}
      <main className="relative z-20 flex-1 max-w-[1380px] mx-auto w-full px-3 sm:px-5 lg:px-6 flex flex-col justify-center my-auto py-1 sm:py-2">
        {/* Counter Frame */}
        <div className="relative rounded-[24px] sm:rounded-[28px] p-3 sm:p-4 lg:p-4 border-2 border-amber-500/40 bg-gradient-to-b from-[#140f09]/65 via-[#0a0704]/50 to-[#040302]/75 backdrop-blur-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(254,240,138,0.25)]">
          
          {/* Top Header Plaque: Dynamic Lesson Name */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 sm:px-7 py-0.5 rounded-full bg-gradient-to-r from-[#1f150b] via-[#3a2511] to-[#1f150b] border-2 border-amber-400/80 shadow-[0_4px_15px_rgba(0,0,0,0.9),0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center">
            <span className="text-xs sm:text-sm font-black font-serif text-amber-200 tracking-wide drop-shadow">
              {lang === 'en' ? `Destination: ${destinationData.destinationTitle}` : `وجهتك: ${destinationData.destinationTitle}`}
            </span>
          </div>

          {/* Grid of 4 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-4 items-stretch pt-2 sm:pt-3">
          
            {/* =================================================================
                PILLAR 1: خزانة القاعدة الأولى
               ================================================================= */}
            {destinationData.cabinets[0] && (
              <div
                key={destinationData.cabinets[0].id}
                className="rounded-[20px] border-[1.5px] border-amber-400/50 p-3 sm:p-3.5 flex flex-col justify-between relative shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.2)] bg-gradient-to-b from-[#081f33]/90 via-[#04121e]/85 to-[#020a12]/95 backdrop-blur-md overflow-hidden"
              >
                <div className="absolute inset-1 rounded-[15px] border border-amber-400/20 pointer-events-none" />

                {/* Cabinet Header */}
                <div className="relative z-10 mb-2">
                  <div className="py-1.5 px-2.5 rounded-lg text-center shadow-md border border-amber-400/50 bg-gradient-to-r from-[#0d3b66] via-[#145388] to-[#0d3b66]">
                    <h3 className="font-black font-serif text-sm sm:text-base text-amber-100 drop-shadow">
                      {destinationData.cabinets[0].title}
                    </h3>
                  </div>
                  <div className="mt-1 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold text-amber-200 bg-[#061826]/90 border border-amber-400/30">
                      {destinationData.cabinets[0].badge}
                    </span>
                  </div>
                </div>

                {/* Rule Explanation Body - Legible, compact, no overflow */}
                <div className="relative z-10 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2" dir={lang === 'en' ? 'ltr' : 'rtl'}>
                  <p className={`text-[11.5px] sm:text-xs text-stone-200 font-serif leading-snug ${lang === 'en' ? 'text-left' : 'text-right'}`}>
                    {destinationData.cabinets[0].description}
                  </p>

                  {/* Core Pillars List */}
                  <div className="space-y-1">
                    {destinationData.cabinets[0].pillars.map((pil, pIdx) => (
                      <div key={pIdx} className={`rounded-lg bg-[#030d17]/90 border border-sky-400/30 p-1.5 sm:p-2 ${lang === 'en' ? 'text-left' : 'text-right'}`}>
                        <div className="text-xs sm:text-[13px] font-black text-amber-300 font-serif">
                          {pil.label}
                        </div>
                        <div className="text-[10.5px] text-sky-200/90 font-serif mt-0.5">
                          {pil.sub}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Examples Section */}
                  <div className={`rounded-lg bg-[#020b12]/95 border border-amber-400/30 p-2 space-y-1 ${lang === 'en' ? 'text-left' : 'text-right'}`}>
                    {destinationData.cabinets[0].examples.map((ex, eIdx) => (
                      <div key={eIdx} className="text-xs sm:text-[13px] font-serif">
                        <span className="text-amber-300 font-black ml-1" dir="rtl">{ex.highlight}</span>
                        <span className="text-stone-200" dir="rtl">{ex.text}</span>
                        <div className="text-[10px] text-stone-400 mt-0.5" dir={lang === 'en' ? 'ltr' : 'rtl'}>{ex.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================
                PILLAR 2: خزانة القاعدة الثانية
               ================================================================= */}
            {destinationData.cabinets[1] && (
              <div
                key={destinationData.cabinets[1].id}
                className="rounded-[20px] border-[1.5px] border-amber-400/50 p-3 sm:p-3.5 flex flex-col justify-between relative shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.2)] bg-gradient-to-b from-[#09261c]/90 via-[#04160f]/85 to-[#020d09]/95 backdrop-blur-md overflow-hidden"
              >
                <div className="absolute inset-1 rounded-[15px] border border-amber-400/20 pointer-events-none" />

                {/* Cabinet Header */}
                <div className="relative z-10 mb-2">
                  <div className="py-1.5 px-2.5 rounded-lg text-center shadow-md border border-amber-400/50 bg-gradient-to-r from-[#0c4a34] via-[#126849] to-[#0c4a34]">
                    <h3 className="font-black font-serif text-sm sm:text-base text-amber-100 drop-shadow">
                      {destinationData.cabinets[1].title}
                    </h3>
                  </div>
                  <div className="mt-1 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold text-amber-200 bg-[#051a12]/90 border border-amber-400/30">
                      {destinationData.cabinets[1].badge}
                    </span>
                  </div>
                </div>

                {/* Rule Explanation Body */}
                <div className="relative z-10 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2" dir={lang === 'en' ? 'ltr' : 'rtl'}>
                  <p className={`text-[11.5px] sm:text-xs text-stone-200 font-serif leading-snug ${lang === 'en' ? 'text-left' : 'text-right'}`}>
                    {destinationData.cabinets[1].description}
                  </p>

                  {/* Core Pillars List */}
                  <div className="space-y-1">
                    {destinationData.cabinets[1].pillars.map((pil, pIdx) => (
                      <div key={pIdx} className={`rounded-lg bg-[#03120b]/90 border border-emerald-400/30 p-1.5 sm:p-2 ${lang === 'en' ? 'text-left' : 'text-right'}`}>
                        <div className="text-xs sm:text-[13px] font-black text-amber-300 font-serif">
                          {pil.label}
                        </div>
                        <div className="text-[10.5px] text-emerald-200/90 font-serif mt-0.5">
                          {pil.sub}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Examples Section */}
                  <div className={`rounded-lg bg-[#020b08]/95 border border-amber-400/30 p-2 space-y-1 ${lang === 'en' ? 'text-left' : 'text-right'}`}>
                    {destinationData.cabinets[1].examples.map((ex, eIdx) => (
                      <div key={eIdx} className="text-xs sm:text-[13px] font-serif">
                        <span className="text-amber-300 font-black ml-1" dir="rtl">{ex.highlight}</span>
                        <span className="text-stone-200" dir="rtl">{ex.text}</span>
                        <div className="text-[10px] text-stone-400 mt-0.5" dir={lang === 'en' ? 'ltr' : 'rtl'}>{ex.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================
                PILLAR 3: افحص معلوماتك لتحصل على التذكرة
               ================================================================= */}
            <div className="rounded-[20px] border-[1.5px] border-amber-400/50 p-3 sm:p-3.5 flex flex-col justify-between relative shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.2)] bg-gradient-to-b from-[#082228]/90 via-[#04151a]/85 to-[#020d10]/95 backdrop-blur-md overflow-hidden">
              <div className="absolute inset-1 rounded-[15px] border border-amber-400/20 pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 mb-1.5 w-full">
                <div className="py-1.5 px-2.5 rounded-lg shadow-md border border-amber-400/50 bg-gradient-to-r from-[#0c3942] via-[#145360] to-[#0c3942] flex items-center justify-between gap-2 text-center">
                  <h3 className="font-black font-serif text-xs sm:text-[13px] text-amber-100 drop-shadow truncate">
                    {lang === 'en' ? 'Pass Quiz to Board' : 'اختبر معلوماتك للعبور'}
                  </h3>
                  <button
                    type="button"
                    onClick={handleNextQuizQuestion}
                    className="text-[11px] font-bold font-serif text-amber-200 hover:text-amber-100 bg-[#06181c] hover:bg-[#0a272e] border border-amber-500/50 hover:border-amber-400 px-2.5 py-0.5 rounded transition-all cursor-pointer active:scale-95 shadow-inner shrink-0"
                    title={lang === 'en' ? 'Another question from bank' : 'سؤال آخر من بنك الأسئلة'}
                  >
                    {lang === 'en' ? 'Next' : 'سؤال آخر'}
                  </button>
                </div>
              </div>

              {/* Question Card - Constrained height, adaptive font size to prevent downward shifts */}
              <div className="rounded-lg bg-gradient-to-b from-[#021014]/95 to-[#041a22]/90 border border-amber-400/30 p-2 sm:p-2.5 text-center shadow-inner relative my-auto z-10">
                <p 
                  className={`font-black font-serif text-amber-100 drop-shadow my-0.5 tracking-wide ${
                    currentQuiz.sentence.length > 30 ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                  }`} 
                  dir="rtl"
                >
                  {currentQuiz.sentence}
                </p>
                <p 
                  className={`text-amber-300 font-bold font-serif mt-0.5 ${
                    currentQuiz.question.length > 45 ? 'text-[11px] leading-tight' : 'text-xs'
                  }`}
                >
                  {currentQuiz.question}
                </p>
              </div>

              {/* Tactile Buttons */}
              <div className="space-y-1.5 mt-1.5 relative z-10">
                {(shuffledOptions.length > 0 ? shuffledOptions : currentQuiz.options).map((option, idx) => {
                  const isSelected = selectedOptionId === option.id;
                  const isCorrect = option.isCorrect;

                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleOptionClick(option)}
                      className={`w-full py-1.5 sm:py-2 px-2.5 rounded-lg font-bold font-serif text-xs flex items-center justify-between border-2 transition-all cursor-pointer shadow-md relative overflow-hidden ${
                        isSelected && isCorrect
                          ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 border-amber-200 text-stone-950 shadow-[0_0_20px_rgba(245,158,11,0.9)]'
                          : isSelected && !isCorrect
                          ? 'bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-red-400 text-red-100'
                          : 'bg-[#082026]/90 hover:bg-[#0d2f38] border-amber-500/35 text-amber-100 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] font-black font-mono border shrink-0 ${
                          isSelected && isCorrect
                            ? 'bg-stone-950 text-amber-300 border-stone-900'
                            : 'bg-black/40 text-amber-300/80 border-amber-400/30'
                        }`}>
                          {lang === 'en' ? (idx === 0 ? 'A' : 'B') : (idx === 0 ? 'أ' : 'ب')}
                        </span>
                        <span className="font-black text-start line-clamp-1" dir="rtl">{option.text}</span>
                      </div>

                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                        {isSelected && isCorrect ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                            <Check size={11} className="stroke-[3]" />
                          </div>
                        ) : isSelected && !isCorrect ? (
                          <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                            <X size={11} className="stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-amber-400/40 bg-black/30" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* =================================================================
                PILLAR 4: آلة استخراج وتأكيد تذكرة الركوب
               ================================================================= */}
            <div className="rounded-[20px] border-[1.5px] border-amber-400/50 p-3 sm:p-3.5 flex flex-col items-center justify-between relative shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.2)] bg-gradient-to-b from-[#1c130b]/90 via-[#120b06]/85 to-[#080503]/95 backdrop-blur-md overflow-hidden">
              <div className="absolute inset-1 rounded-[15px] border border-amber-400/20 pointer-events-none" />

              {/* Machine Header */}
              <div className="w-full flex flex-col items-center mb-1.5 relative z-10">
                <div className="w-full py-1.5 px-2.5 rounded-lg text-center shadow-md border border-amber-400/50 bg-gradient-to-r from-[#3d220c] via-[#5c3311] to-[#3d220c] flex items-center justify-center gap-1.5">
                  <Printer size={13} className="text-amber-300" />
                  <h3 className="font-black font-serif text-xs sm:text-sm text-amber-100 drop-shadow">
                    {lang === 'en' ? 'Ticket Dispenser' : 'منفذ إصدار التذاكر'}
                  </h3>
                </div>

                {/* Machine Slot */}
                <div className="w-full mt-1.5 h-2.5 rounded-full bg-[#080503] border border-amber-600/80 shadow-inner flex items-center justify-center overflow-hidden">
                  <div className={`w-3/4 h-1 rounded-full transition-colors duration-500 ${
                    ticketPhase !== 'waiting' ? 'bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.95)]' : 'bg-amber-900/40'
                  }`} />
                </div>
              </div>

              {/* Ticket Area - Compact height to guarantee barrier visibility */}
              <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[160px] sm:min-h-[175px] overflow-hidden py-1 z-10">
                
                {/* State: Waiting */}
                {ticketPhase === 'waiting' && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-2.5 rounded-xl border border-dashed border-amber-600/40 bg-[#0e0a06]/80">
                    <div className="w-9 h-9 rounded-full bg-[#2a1708] border border-amber-500/50 text-amber-300 flex items-center justify-center mb-1.5 shadow-md">
                      <Lock size={16} />
                    </div>
                    <span className="text-xs font-black text-amber-200 mb-0.5 font-serif">
                      {lang === 'en' ? 'Awaiting Answer' : 'في انتظار الإجابة'}
                    </span>
                    <span className="text-[10px] text-amber-300/70 font-serif max-w-[180px] leading-tight">
                      {lang === 'en' ? 'Answer to print ticket' : 'أجب لتحصل على تذكرتك'}
                    </span>
                  </div>
                )}

                {/* State: Extruding & Stamped */}
                {ticketPhase !== 'waiting' && (
                  <motion.div
                    initial={{ y: -200, opacity: 0.2 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1.4, ease: 'easeOut' }}
                    id="vintage-train-ticket"
                    className="relative w-full rounded-xl bg-gradient-to-b from-[#faf6ec] via-[#f2e9d2] to-[#e6d8b8] text-[#1c1408] border-2 border-amber-700/70 shadow-[0_12px_28px_rgba(0,0,0,0.95),0_0_20px_rgba(245,158,11,0.35)] p-2.5 overflow-hidden select-none"
                  >
                    {/* Ticket Header */}
                    <div className="border-b border-dashed border-amber-900/40 pb-1.5 mb-1.5 text-center">
                      <div className="text-[9px] font-mono tracking-widest text-amber-900 font-bold">
                        {lang === 'en' ? 'RAILWAY BOARDING PASS' : 'تذكرة ركوب السكك الحديدية'}
                      </div>
                      <div className="text-xs sm:text-[13px] font-black font-serif text-stone-900 mt-0.5">
                        {destinationData.destinationTitle}
                      </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="space-y-1 text-[10.5px] font-serif text-stone-800">
                      <div className="flex justify-between items-center border-b border-amber-800/20 pb-0.5">
                        <span className="text-stone-600">{lang === 'en' ? 'Passenger:' : 'المسافر:'}</span>
                        <span className="font-black text-stone-950">{passengerName || (lang === 'en' ? 'Grammar Hero' : 'بطل اللغة')}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-amber-800/20 pb-0.5">
                        <span className="text-stone-600">{lang === 'en' ? 'Class:' : 'الدرجة:'}</span>
                        <span className="font-bold text-amber-900">{lang === 'en' ? 'First Class' : 'الدرجة الأولى'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600">{lang === 'en' ? 'Status:' : 'الحالة:'}</span>
                        <span className="font-black text-emerald-800">{lang === 'en' ? 'Validated' : 'معتمدة'}</span>
                      </div>
                    </div>

                    {/* Gold Seal Stamp Animation */}
                    {ticketPhase === 'stamped' && (
                      <motion.div
                        initial={{ scale: 2.2, rotate: -20, opacity: 0 }}
                        animate={{ scale: 1, rotate: -6, opacity: 1 }}
                        transition={{ type: 'spring', damping: 14, stiffness: 200 }}
                        className="mt-1.5 mx-auto w-24 py-0.5 rounded bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border border-amber-800 text-stone-950 font-black font-serif text-[10px] text-center shadow-md uppercase tracking-wider"
                      >
                        {lang === 'en' ? 'VALIDATED' : 'معتمدة للسفر'}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* 5. RAILWAY BOOM BARRIER (Opens upwards slowly after receiving ticket) */}
      <div className="relative z-30 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-1 pb-1 overflow-visible shrink-0">
        <div className="relative flex items-center overflow-visible">
          
          {/* Signal Lantern Post */}
          <div className="flex flex-col items-center -mr-2 sm:-mr-3 z-30">
            <div 
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-amber-300 flex items-center justify-center transition-all duration-700 ${
                isBarrierOpen
                  ? 'bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.95)] ring-4 ring-emerald-400/40'
                  : 'bg-red-600 shadow-[0_0_25px_rgba(239,68,68,0.95)] ring-4 ring-red-500/40 animate-pulse'
              }`}
            >
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white/85 blur-xs" />
            </div>
            <div className="w-6 h-6 bg-gradient-to-r from-amber-800 via-amber-400 to-amber-900 border border-amber-950 -mt-1 rounded-b-md shadow-lg" />
          </div>

          {/* Barrier Arm Rotating Upwards Slower with smooth ease */}
          <div className="flex-1 h-8 sm:h-10 relative overflow-visible flex items-center">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: isBarrierOpen ? (lang === 'en' ? -84 : 84) : 0 }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: lang === 'en' ? 'left center' : 'right center' }}
              className="w-full h-7 sm:h-8 rounded-full border-2 border-amber-950 shadow-[0_8px_25px_rgba(0,0,0,0.9)] relative overflow-hidden flex items-center justify-center bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_22px,#ffffff_22px,#ffffff_44px)] cursor-pointer"
              onClick={() => {
                if (isBarrierOpen) handleProceed();
              }}
            >
              <div className="px-4 py-0.5 rounded-full bg-gradient-to-r from-red-950 via-[#6e0b0b] to-red-950 border border-amber-400 text-amber-200 text-xs sm:text-[13px] font-black font-serif shadow-md z-10 whitespace-nowrap">
                {isBarrierOpen 
                  ? (lang === 'en' ? 'Track Clear • Click to depart on your journey' : 'المسار مفتوح • انقر للانطلاق نحو الرحلة')
                  : (lang === 'en' ? 'Barrier Closed • Answer to receive ticket' : 'الحاجز مغلق • أجب لتحصل على التذكرة')}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 6. BOTTOM SPACE - clean without rectangle below the barrier */}
      <footer className="relative z-30 w-full max-w-xl mx-auto px-4 pb-1 pt-0 flex items-center justify-center min-h-[8px] pointer-events-auto shrink-0" />
    </div>
  );
};
