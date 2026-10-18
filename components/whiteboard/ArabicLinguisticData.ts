export interface ArabicLetterForm {
  letter: string;
  name: string;
  isolated: string;
  initial: string;
  medial: string;
  final: string;
  harakat: string[];
  tanween: string[];
  madd: string[];
  examples: string[];
}

export const ARABIC_ALPHABET_FORMS: ArabicLetterForm[] = [
  { letter: 'أ', name: 'ألف', isolated: 'أ', initial: 'أ', medial: 'ـأ', final: 'ـأ', harakat: ['أَ', 'إِ', 'أُ', 'أْ', 'أَّ'], tanween: ['أً', 'أٌ', 'أٍ'], madd: ['آ', 'أُو', 'إِي'], examples: ['أَسَد', 'أُمّ', 'إِبْرِيق'] },
  { letter: 'ب', name: 'باء', isolated: 'ب', initial: 'بـ', medial: 'ـبـ', final: 'ـب', harakat: ['بَ', 'بِ', 'بُ', 'بْ', 'بَّ'], tanween: ['بً', 'بٌ', 'بٍ'], madd: ['بَا', 'بُو', 'بِي'], examples: ['بَاب', 'بَيْت', 'بَحْر'] },
  { letter: 'ت', name: 'تاء', isolated: 'ت', initial: 'تـ', medial: 'ـتـ', final: 'ـت', harakat: ['تَ', 'تِ', 'تُ', 'تْ', 'تَّ'], tanween: ['تً', 'تٌ', 'تٍ'], madd: ['تَا', 'تُو', 'تِي'], examples: ['تَمْر', 'تُفَّاح', 'تَاج'] },
  { letter: 'ث', name: 'ثاء', isolated: 'ث', initial: 'ثـ', medial: 'ـثـ', final: 'ـث', harakat: ['ثَ', 'ثِ', 'ثُ', 'ثْ', 'ثَّ'], tanween: ['ثً', 'ثٌ', 'ثٍ'], madd: ['ثَا', 'ثُو', 'ثِي'], examples: ['ثَوْب', 'ثَعْلَب', 'ثِمَار'] },
  { letter: 'ج', name: 'جيم', isolated: 'ج', initial: 'جـ', medial: 'ـجـ', final: 'ـج', harakat: ['جَ', 'جِ', 'جُ', 'جْ', 'جَّ'], tanween: ['جً', 'جٌ', 'جٍ'], madd: ['جَا', 'جُو', 'جِي'], examples: ['جَمَل', 'جِسْر', 'جَبَل'] },
  { letter: 'ح', name: 'حاء', isolated: 'ح', initial: 'حـ', medial: 'ـحـ', final: 'ـح', harakat: ['حَ', 'حِ', 'حُ', 'حْ', 'حَّ'], tanween: ['حً', 'حٌ', 'حٍ'], madd: ['حَا', 'حُو', 'حِي'], examples: ['حَلِيب', 'حَقِيبَة', 'حُوت'] },
  { letter: 'خ', name: 'خاء', isolated: 'خ', initial: 'خـ', medial: 'ـخـ', final: 'ـخ', harakat: ['خَ', 'خِ', 'خُ', 'خْ', 'خَّ'], tanween: ['خً', 'خٌ', 'خٍ'], madd: ['خَا', 'خُو', 'خِي'], examples: ['خُبْز', 'خَيْمَة', 'خَرِيف'] },
  { letter: 'د', name: 'دال', isolated: 'د', initial: 'د', medial: 'ـد', final: 'ـد', harakat: ['دَ', 'دِ', 'دُ', 'دْ', 'دَّ'], tanween: ['دً', 'دٌ', 'دٍ'], madd: ['دَا', 'دُو', 'دِي'], examples: ['دَفْتَر', 'دَار', 'دُرُوس'] },
  { letter: 'ذ', name: 'ذال', isolated: 'ذ', initial: 'ذ', medial: 'ـذ', final: 'ـذ', harakat: ['ذَ', 'ذِ', 'ذُ', 'ذْ', 'ذَّ'], tanween: ['ذً', 'ذٌ', 'ذٍ'], madd: ['ذَا', 'ذُو', 'ذِي'], examples: ['ذَهَب', 'ذُبَاب', 'ذُرَة'] },
  { letter: 'ر', name: 'راء', isolated: 'ر', initial: 'ر', medial: 'ـر', final: 'ـر', harakat: ['رَ', 'رِ', 'رُ', 'رْ', 'رَّ'], tanween: ['رً', 'رٌ', 'رٍ'], madd: ['رَا', 'رُو', 'رِي'], examples: ['رَجُل', 'رَسْم', 'رَبِيع'] },
  { letter: 'ز', name: 'زاي', isolated: 'ز', initial: 'ز', medial: 'ـز', final: 'ـز', harakat: ['زَ', 'زِ', 'زُ', 'زْ', 'زَّ'], tanween: ['زً', 'زٌ', 'زٍ'], madd: ['زَا', 'زُو', 'زِي'], examples: ['زَهْرَة', 'زَيْتُون', 'زَرَافَة'] },
  { letter: 'س', name: 'سين', isolated: 'س', initial: 'سـ', medial: 'ـسـ', final: 'ـس', harakat: ['سَ', 'سِ', 'سُ', 'سْ', 'سَّ'], tanween: ['سً', 'سٌ', 'سٍ'], madd: ['سَا', 'سُو', 'سِي'], examples: ['سَيَّارَة', 'سَمَاء', 'سُوق'] },
  { letter: 'ش', name: 'شين', isolated: 'ش', initial: 'شـ', medial: 'ـشـ', final: 'ـش', harakat: ['شَ', 'شِ', 'شُ', 'شْ', 'شَّ'], tanween: ['شً', 'شٌ', 'شٍ'], madd: ['شَا', 'شُو', 'شِي'], examples: ['شَمْس', 'شَجَرَة', 'شَاطِئ'] },
  { letter: 'ص', name: 'صاد', isolated: 'ص', initial: 'صـ', medial: 'ـصـ', final: 'ـص', harakat: ['صَ', 'صِ', 'صُ', 'صْ', 'صَّ'], tanween: ['صً', 'صٌ', 'صٍ'], madd: ['صَا', 'صُو', 'صِي'], examples: ['صَبَاح', 'صُورَة', 'صَحْرَاء'] },
  { letter: 'ض', name: 'ضاد', isolated: 'ض', initial: 'ضـ', medial: 'ـضـ', final: 'ـض', harakat: ['ضَ', 'ضِ', 'ضُ', 'ضْ', 'ضَّ'], tanween: ['ضً', 'ضٌ', 'ضٍ'], madd: ['ضَا', 'ضُو', 'ضِي'], examples: ['ضَوْء', 'ضَيْف', 'ضَفْدَع'] },
  { letter: 'ط', name: 'طاء', isolated: 'ط', initial: 'طـ', medial: 'ـطـ', final: 'ـط', harakat: ['طَ', 'طِ', 'طُ', 'طْ', 'طَّ'], tanween: ['طً', 'طٌ', 'طٍ'], madd: ['طَا', 'طُو', 'طِي'], examples: ['طَالِب', 'طَرِيق', 'طَيْر'] },
  { letter: 'ظ', name: 'ظاء', isolated: 'ظ', initial: 'ظـ', medial: 'ـظـ', final: 'ـظ', harakat: ['ظَ', 'ظِ', 'ظُ', 'ظْ', 'ظَّ'], tanween: ['ظً', 'ظٌ', 'ظٍ'], madd: ['ظَا', 'ظُو', 'ظِي'], examples: ['ظِلّ', 'ظَرْف', 'ظَلَام'] },
  { letter: 'ع', name: 'عين', isolated: 'ع', initial: 'عـ', medial: 'ـعـ', final: 'ـع', harakat: ['عَ', 'عِ', 'عُ', 'عْ', 'عَّ'], tanween: ['عً', 'عٌ', 'عٍ'], madd: ['عَا', 'عُو', 'عِي'], examples: ['عَيْن', 'عَالِم', 'عَصِير'] },
  { letter: 'غ', name: 'غين', isolated: 'غ', initial: 'غـ', medial: 'ـغـ', final: 'ـغ', harakat: ['غَ', 'غِ', 'غُ', 'غْ', 'غَّ'], tanween: ['غً', 'غٌ', 'غٍ'], madd: ['غَا', 'غُو', 'غِي'], examples: ['غَابَة', 'غَيْمَة', 'غُرْفَة'] },
  { letter: 'ف', name: 'فاء', isolated: 'ف', initial: 'فـ', medial: 'ـفـ', final: 'ـف', harakat: ['فَ', 'فِ', 'فُ', 'فْ', 'فَّ'], tanween: ['فً', 'فٌ', 'فٍ'], madd: ['فَا', 'فُو', 'فِي'], examples: ['فَاكِهَة', 'فَرَاشَة', 'فُنْدُق'] },
  { letter: 'ق', name: 'قاف', isolated: 'ق', initial: 'قـ', medial: 'ـقـ', final: 'ـق', harakat: ['قَ', 'قِ', 'قُ', 'قْ', 'قَّ'], tanween: ['قً', 'قٌ', 'قٍ'], madd: ['قَا', 'قُو', 'قِي'], examples: ['قَلَم', 'قَمَر', 'قِطَار'] },
  { letter: 'ك', name: 'كاف', isolated: 'ك', initial: 'كـ', medial: 'ـكـ', final: 'ـك', harakat: ['كَ', 'كِ', 'كُ', 'كْ', 'كَّ'], tanween: ['كً', 'كٌ', 'كٍ'], madd: ['كَا', 'كُو', 'كِي'], examples: ['كِتَاب', 'كُرَة', 'كُرْسِيّ'] },
  { letter: 'ل', name: 'لام', isolated: 'ل', initial: 'لـ', medial: 'ـلـ', final: 'ـل', harakat: ['لَ', 'لِ', 'لُ', 'لْ', 'لَّ'], tanween: ['لً', 'لٌ', 'لٍ'], madd: ['لَا', 'لُو', 'لِي'], examples: ['لَيْل', 'لَوْحَة', 'لِسَان'] },
  { letter: 'م', name: 'ميم', isolated: 'م', initial: 'مـ', medial: 'ـمـ', final: 'ـم', harakat: ['مَ', 'مِ', 'مُ', 'مْ', 'مَّ'], tanween: ['مً', 'مٌ', 'مٍ'], madd: ['مَا', 'مُو', 'مِي'], examples: ['مَدْرَسَة', 'مَطَر', 'مَسْجِد'] },
  { letter: 'ن', name: 'نون', isolated: 'ن', initial: 'نـ', medial: 'ـنـ', final: 'ـن', harakat: ['نَ', 'نِ', 'نُ', 'نْ', 'نَّ'], tanween: ['نً', 'نٌ', 'نٍ'], madd: ['نَا', 'نُو', 'نِي'], examples: ['نَهْر', 'نَجْم', 'نَافِذَة'] },
  { letter: 'هـ', name: 'هاء', isolated: 'هـ', initial: 'هـ', medial: 'ـهـ', final: 'ـه', harakat: ['هَـ', 'هِـ', 'هُـ', 'هْـ', 'هَّـ'], tanween: ['هًـ', 'هٌـ', 'هٍـ'], madd: ['هَا', 'هُو', 'هِي'], examples: ['هِلَال', 'هَدِيَّة', 'هَوَاء'] },
  { letter: 'و', name: 'واو', isolated: 'و', initial: 'و', medial: 'ـو', final: 'ـو', harakat: ['وَ', 'وِ', 'وُ', 'وْ', 'وَّ'], tanween: ['وً', 'وٌ', 'وٍ'], madd: ['وَا', 'وُو', 'وِي'], examples: ['وَرْدَة', 'وَطَن', 'وَلَد'] },
  { letter: 'ي', name: 'ياء', isolated: 'ي', initial: 'يـ', medial: 'ـيـ', final: 'ـي', harakat: ['يَ', 'يِ', 'يُ', 'يْ', 'يَّ'], tanween: ['يً', 'يٌ', 'يٍ'], madd: ['يَا', 'يُو', 'يِي'], examples: ['يَد', 'يَاسَمِين', 'يَوْم'] },
];

export interface HarakatOption {
  symbol: string;
  name: string;
  badge: string;
  color: string;
}

export const HARAKAT_OPTIONS: HarakatOption[] = [
  { symbol: 'ـَ', name: 'الفتحة', badge: 'فَتْحَة', color: 'text-emerald-400 border-emerald-400/40 bg-emerald-950/40' },
  { symbol: 'ـُ', name: 'الضمة', badge: 'ضَمَّة', color: 'text-sky-400 border-sky-400/40 bg-sky-950/40' },
  { symbol: 'ـِ', name: 'الكسرة', badge: 'كَسْرَة', color: 'text-indigo-400 border-indigo-400/40 bg-indigo-950/40' },
  { symbol: 'ـْ', name: 'السكون', badge: 'سُكُون', color: 'text-amber-400 border-amber-400/40 bg-amber-950/40' },
  { symbol: 'ـّ', name: 'الشدة', badge: 'شَدَّة', color: 'text-rose-400 border-rose-400/40 bg-rose-950/40' },
  { symbol: 'ـً', name: 'تنوين الفتح', badge: 'تَنْوِين فَتْح', color: 'text-emerald-300 border-emerald-300/40 bg-emerald-950/40' },
  { symbol: 'ـٌ', name: 'تنوين الضم', badge: 'تَنْوِين ضَمّ', color: 'text-sky-300 border-sky-300/40 bg-sky-950/40' },
  { symbol: 'ـٍ', name: 'تنوين الكسر', badge: 'تَنْوِين كَسْر', color: 'text-indigo-300 border-indigo-300/40 bg-indigo-950/40' },
];

export interface SlicedWordPreset {
  word: string;
  syllables: string[];
  root: string;
  wazn: string;
  meaning: string;
}

/**
 * Automatically analyze any Arabic word into syllables, extract core letters and morph structure
 */
export const analyzeArabicWord = (rawWord: string): SlicedWordPreset => {
  const word = rawWord.trim();
  if (!word) {
    return WORD_SLICER_PRESETS[0];
  }

  // Check if matches an existing preset
  const matched = WORD_SLICER_PRESETS.find(p => p.word === word || p.word.replace(/[ًٌٍَُِّْ]/g, '') === word.replace(/[ًٌٍَُِّْ]/g, ''));
  if (matched) return matched;

  // Syllabic segmentation algorithm for Arabic phonetic chunks
  const clean = word;
  const chars = Array.from(clean);
  const syllables: string[] = [];
  let currentChunk = '';

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    currentChunk += char;
    
    // Check if next char is a connector or separate syllable
    const isVowelSign = /[ًٌٍَُِّْ]/.test(char);
    const nextChar = chars[i + 1];
    const isNextSukoon = nextChar === 'ْ';
    const isNextMadd = ['ا', 'و', 'ي', 'ى'].includes(nextChar);

    if (i === chars.length - 1) {
      if (currentChunk) syllables.push(currentChunk);
    } else if (isVowelSign && !isNextSukoon && !isNextMadd && currentChunk.length >= 2) {
      syllables.push(currentChunk);
      currentChunk = '';
    } else if (currentChunk.length >= 3 && !/[ًٌٍَُِّْ]/.test(nextChar || '')) {
      syllables.push(currentChunk);
      currentChunk = '';
    }
  }

  if (syllables.length === 0) {
    syllables.push(word);
  }

  // Remove diacritics for approximate root
  const strip = word.replace(/[ًٌٍَُِّْ]/g, '').replace(/^(ال|است|ت|م)/, '').replace(/(ون|ين|ات|ة|ية)$/, '');
  const rootChars = Array.from(strip).filter(c => !['ا', 'و', 'ي', 'ء', 'ئ', 'ؤ'].includes(c)).slice(0, 3);
  const root = rootChars.length >= 2 ? rootChars.join(' - ') : 'ف - ع - ل';

  return {
    word: word,
    syllables: syllables,
    root: root,
    wazn: 'مُشْتَقّ صَرْفِي',
    meaning: `تحليل لغوي وصوتي لكلمة (${word})`
  };
};

export const WORD_SLICER_PRESETS: SlicedWordPreset[] = [
  {
    word: 'مَسْجِدٌ',
    syllables: ['مَسْـ', 'ـجِـ', 'ـدٌ'],
    root: 'س - ج - د',
    wazn: 'مَفْعِل',
    meaning: 'اسم مكان مشتق من الفعل (سَجَدَ)'
  },
  {
    word: 'مَدْرَسَةٌ',
    syllables: ['مَدْ', 'رَ', 'سَ', 'ةٌ'],
    root: 'د - ر - س',
    wazn: 'مَفْعَلَة',
    meaning: 'اسم مكان مشتق من الفعل (دَرَسَ)'
  },
  {
    word: 'مُعَلِّمُونَ',
    syllables: ['مُـ', 'ـعَلْـ', 'ـلِـ', 'ـمُو', 'نَ'],
    root: 'ع - ل - م',
    wazn: 'مُفَعِّلُونَ',
    meaning: 'جمع مذكر سالم مشتق من اسم الفاعل'
  },
  {
    word: 'مُسْتَشْفَى',
    syllables: ['مُسْـ', 'ـتَشْـ', 'ـفَى'],
    root: 'ش - ف - ي',
    wazn: 'مُسْتَفْعَل',
    meaning: 'اسم مكان مشتق من الفعل السداسي'
  },
  {
    word: 'اسْتِقْبَالٌ',
    syllables: ['اِسْـ', 'ـتِقْـ', 'ـبَا', 'لٌ'],
    root: 'ق - ب - ل',
    wazn: 'اِسْتِفْعَال',
    meaning: 'مصدر صريح للفعل السداسي (استقبل)'
  },
  {
    word: 'قِرَاءَةٌ',
    syllables: ['قِـ', 'ـرَا', 'ءَ', 'ةٌ'],
    root: 'ق - ر - أ',
    wazn: 'فِعَالَة',
    meaning: 'مصدر ثلاثي من (قَرَأَ)'
  }
];

export interface GrammarSampleItem {
  id: string;
  word: string;
  category: string;
  categoryName: string;
  translation: string;
}

export const GRAMMAR_SAMPLES: GrammarSampleItem[] = [
  { id: 'g1', word: 'كِتَابٌ', category: 'اسم', categoryName: 'اسم', translation: 'Book (Noun)' },
  { id: 'g2', word: 'يَكْتُبُ', category: 'فعل', categoryName: 'فعل مضارع', translation: 'Writes (Verb)' },
  { id: 'g3', word: 'فِي', category: 'حرف', categoryName: 'حرف جر', translation: 'In (Particle)' },
  { id: 'g4', word: 'سَافَرَ', category: 'فعل', categoryName: 'فعل ماضٍ', translation: 'Traveled (Verb)' },
  { id: 'g5', word: 'شَمْسٌ', category: 'اسم', categoryName: 'اسم مؤنث مجازي', translation: 'Sun (Noun)' },
  { id: 'g6', word: 'عَلَى', category: 'حرف', categoryName: 'حرف جر', translation: 'On (Particle)' },
  { id: 'g7', word: 'مُعَلِّمَانِ', category: 'مثنى', categoryName: 'اسم مثنى مذكر', translation: 'Two Teachers' },
  { id: 'g8', word: 'طَالِبَاتٌ', category: 'جمع', categoryName: 'جمع مؤنث سالم', translation: 'Female Students' },
];

export const speakArabic = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('TTS error:', err);
  }
};
