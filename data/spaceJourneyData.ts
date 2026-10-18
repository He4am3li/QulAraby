// مسار الملف: data/spaceJourneyData.ts

export type Stage = "start" | "map" | "flight" | "success" | "gameover";

export interface Planet {
  id: string;
  name: string;
  x: number;
  y: number;
  baseSize: number;
  glowColor: string;
  orbitIndex: number;
  orbitPeriod: number;
  rotationDuration: number;
}

export interface MissionChallenge {
  title: string;
  prompt: string;
  subPrompt: string;
  correctWords: string[];
  wrongWords: string[];
  explanationMap?: Record<string, string>;
}

// تعريف الكواكب العشرة والمدارات
export const PLANETS: Planet[] = [
  { id: "letters", name: "كوكب الحروف", x: 12, y: 56, baseSize: 52, glowColor: "#818cf8", orbitIndex: 4, orbitPeriod: 155, rotationDuration: 38 },
  { id: "hamza", name: "كوكب الهمزات", x: 42, y: 46, baseSize: 52, glowColor: "#fb7185", orbitIndex: 0, orbitPeriod: 60, rotationDuration: 28 },
  { id: "sentence", name: "كوكب الجملة", x: 34, y: 42, baseSize: 54, glowColor: "#22d3ee", orbitIndex: 1, orbitPeriod: 80, rotationDuration: 30 },
  { id: "meanings", name: "كوكب المعاني", x: 88, y: 52, baseSize: 56, glowColor: "#fb923c", orbitIndex: 4, orbitPeriod: 168, rotationDuration: 44 },
  { id: "syntax", name: "كوكب الإعراب", x: 67, y: 62, baseSize: 62, glowColor: "#fbbf24", orbitIndex: 1, orbitPeriod: 92, rotationDuration: 36 },
  { id: "styles", name: "كوكب الأساليب", x: 26, y: 48, baseSize: 52, glowColor: "#f59e0b", orbitIndex: 2, orbitPeriod: 105, rotationDuration: 34 },
  { id: "word", name: "كوكب الكلمة", x: 58, y: 58, baseSize: 50, glowColor: "#38bdf8", orbitIndex: 0, orbitPeriod: 68, rotationDuration: 32 },
  { id: "morphology", name: "كوكب التصريف", x: 19, y: 52, baseSize: 50, glowColor: "#c084fc", orbitIndex: 3, orbitPeriod: 130, rotationDuration: 35 },
  { id: "structures", name: "كوكب التراكيب", x: 74, y: 56, baseSize: 53, glowColor: "#34d399", orbitIndex: 2, orbitPeriod: 118, rotationDuration: 40 },
  { id: "spelling", name: "كوكب الكتابة", x: 81, y: 54, baseSize: 54, glowColor: "#e2e8f0", orbitIndex: 3, orbitPeriod: 142, rotationDuration: 42 }
];

// بنك البيانات اللغوية المخصص للناطقين بغير العربية
export const CONTENT: Record<string, MissionChallenge[]> = {
  
  "letters": [
    {
      title: "تحدي حروف الجر",
      prompt: "التقط (حروف الجر) فقط، وتجنب الحروف الأخرى!",
      subPrompt: "ركز على الحروف التي تجر الاسم بعدها.",
      correctWords: ["مِنْ", "إِلَى", "عَنْ", "عَلَى", "فِي", "البَاءُ", "اللَّامُ", "الكَافُ"],
      wrongWords: ["ثُمَّ", "وَ", "أَوْ", "فَـ", "أَنْ", "لَنْ", "لَمْ", "إِنَّ"]
    }
  ],

  "hamza": [
    {
      title: "تحدي الهمزة المتطرفة",
      prompt: "التقط الكلمات التي كُتبت فيها (الهمزة المتطرفة) بشكل صحيح!",
      subPrompt: "تذكر: تُكتب الهمزة المتطرفة بحسب حركة الحرف الذي قبلها.",
      correctWords: ["بَدَأَ", "شَاطِئ", "يَجْرُؤ", "سَمَاء", "شَيْء", "تَهَيَّأَ", "بُطْء", "لُؤْلُؤ"],
      wrongWords: ["بنأ", "شاطيء", "يجرأ", "سماأ", "شيئ", "تهيء", "بدءا", "لؤلؤء"]
    }
  ],

  "sentence": [
    {
      title: "تحدي الجملة الفعلية",
      prompt: "التقط (الجمل الفعلية) وتجنب الجمل الاسمية!",
      subPrompt: "الجملة الفعلية هي التي تبدأ بفعل (ماضٍ، مضارع، أو أمر).",
      correctWords: ["تَقَعُ الْمَدِينَةُ فِي الْجَبَلِ", "شَرِبَ الطِّفْلُ الْحَلِيبَ", "يَلْعَبُ الْوَلَدُ", "تُشْرِقُ الشَّمْسُ"],
      wrongWords: ["الْمَدِينَةُ جَمِيلَةٌ", "الطَّالِبُ مُجْتَهِدٌ", "الْكِتَابُ مُفِيدٌ", "الشَّجَرَةُ مُثْمِرَةٌ"]
    }
  ],

  "meanings": [
    {
      title: "تحدي المترادفات (السعادة)",
      prompt: "التقط الكلمات التي تعني (الفرح والسرور)!",
      subPrompt: "ابحث عن الكلمات التي تدل على السعادة الإيجابية.",
      correctWords: ["الْفَرَحُ", "السُّرُورُ", "الْبَهْجَةُ", "الْحُبُورُ", "الْمَسَرَّةُ", "السَّعَادَةُ"],
      wrongWords: ["الْحُزْنُ", "الْغَضَبُ", "الْخَوْفُ", "التَّعَبُ", "الْبُكَاءُ", "الضِّيقُ"]
    }
  ],

  "syntax": [
    {
      title: "تحدي الفاعل المرفوع وعلامات الرفع",
      prompt: "التقط الكلمات (المرفوعة) بعلامات الرفع المختلفة (الضمة، الألف، الواو)!",
      subPrompt: "تذكر علامات الرفع: الضمة (المفرد وجمع المؤنث السالم)، الألف (للمثنى)، والواو (لجمع المذكر والأسماء الخمسة).",
      correctWords: ["الطَّالِبُ", "الْمُعَلِّمُونَ", "الطَّالِبَانِ", "الْمُهَنْدِسَاتُ", "أَبُوكَ"],
      wrongWords: ["الطَّالِبَ", "الْمُعَلِّمِينَ", "الطَّالِبَيْنِ", "الْمُهَنْدِسَاتِ", "أَبَاكَ"]
    }
  ],

  "styles": [
    {
      title: "تحدي أسلوب الاستفهام",
      prompt: "التقط (أدوات الاستفهام) فقط!",
      subPrompt: "الأدوات التي نستخدمها لنسأل عن شيء مجهول.",
      correctWords: ["هَلْ", "مَتَى", "أَيْنَ", "مَاذَا", "كَيْفَ", "مَنْ", "كَمْ", "لِمَاذَا"],
      wrongWords: ["لَمْ", "إِنَّ", "لَيْتَ", "لَنْ", "فِي", "أَوْ", "لَعَلَّ", "بَلْ"]
    }
  ],

  "word": [
    {
      title: "تحدي أقسام الكلمة (الاسم)",
      prompt: "التقط (الأسماء) فقط وتجنب الأفعال والحروف!",
      subPrompt: "الاسم يقبل (الـ) التعريف والتنوين وحروف الجر.",
      correctWords: ["شَجَرَةٌ", "مُعَلِّم", "الْكِتَاب", "تُفَّاحَة", "مَدِينَة", "قَلَمٌ", "الإِمَارَات"],
      wrongWords: ["يَلْعَبُ", "فِي", "اُكْتُبْ", "عَلَى", "سَافَرَ", "لَمْ", "يَقْرَأُ"]
    }
  ],

  "morphology": [
    {
      title: "تحدي الفعل المضارع",
      prompt: "التقط الأفعال في صيغة (المضارع) فقط!",
      subPrompt: "الفعل المضارع يبدأ بأحد حروف (أنيت) ويدل على الحاضر أو المستقبل.",
      correctWords: ["يَكْتُبُ", "نَسْمَعُ", "تَقْرَأُ", "أُسَافِرُ", "يَلْعَبُونَ", "تَجْلِسِينَ"],
      wrongWords: ["كَتَبَ", "اِسْمَعْ", "قَرَأَتْ", "سَافَرَ", "لَعِبُوا", "اِجْلِسِي"]
    }
  ],

  "structures": [
    {
      title: "تحدي المضاف والمضاف إليه",
      prompt: "التقط التراكيب الإضافية الصحيحة (مضاف + مضاف إليه)!",
      subPrompt: "المضاف نكرة غير منون، والمضاف إليه يحدد معناه (ويكون مجروراً).",
      correctWords: ["كِتَابُ الطَّالِبِ", "حَقِيبَةُ الْمُعَلِّمِ", "بَابُ الْمَدْرَسَةِ", "قَلَمُ حِبْرٍ"],
      wrongWords: ["كِتَابٌ مُفِيدٌ", "الْوَلَدُ الذَّكِيُّ", "فِي الْمَدْرَسَةِ", "يَقْرَأُ الدَّرْسَ"]
    }
  ],

  "spelling": [
    {
      title: "تحدي التاء المربوطة",
      prompt: "التقط الكلمات المنتهية بـ (تاء مربوطة) وتجنب التاء المفتوحة والهاء!",
      subPrompt: "تذكر: التاء المربوطة تنطق هاءً عند الوقف وتاءً عند الوصل.",
      correctWords: ["حَدِيقَة", "مَدْرَسَة", "شَجَرَة", "قِطَّة", "طَالِبَة", "مَدِينَة", "جَمِيلَة", "غُرْفَة"],
      wrongWords: ["بَيْت", "بِنْت", "مَاتَ", "كَتَبَتْ", "مِيَاه", "وَجْه", "فَوَاكِه", "شَبِيه"]
    }
  ]
};

// Backward-compatible structures for seamless game engine integration
export interface Q {
  q: string;
  a: string;
  opts?: string[];
  why: string;
  tag: string;
}

export interface LegacyGameStage {
  id: string;
  planetId: string;
  title: string;
  desc: string;
  kind: string;
  items: any[];
  questions: Q[];
}

export const STAGES_LIST: LegacyGameStage[] = PLANETS.map(p => {
  const challenge = CONTENT[p.id]?.[0];
  return {
    id: `${p.id}-stage`,
    planetId: p.id,
    title: challenge?.title || p.name,
    desc: challenge?.prompt || "",
    kind: p.id,
    items: [],
    questions: challenge?.correctWords.map(w => ({
      q: `اختر الإجابة الصحيحة (${challenge.title})`,
      a: w,
      opts: challenge.wrongWords.slice(0, 3),
      why: challenge.subPrompt,
      tag: p.id
    })) || []
  };
});
