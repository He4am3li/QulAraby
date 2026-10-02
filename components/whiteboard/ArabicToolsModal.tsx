import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Volume2, Plus, BookOpen, Type, Layers, CheckCircle2, FileText, BookmarkCheck, PenLine } from 'lucide-react';
import { WhiteboardElement } from '../../types/whiteboard';
import { SPELLING_RULES_DATABASE, SpellingRuleItem } from '../../data/spellingRules';

interface ArabicToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertElement: (element: Partial<WhiteboardElement>) => void;
}

const ARABIC_LETTERS_DATA = [
  { letter: 'أ', harakat: ['أَ', 'إِ', 'أُ', 'أْ', 'أَّ'], examples: ['أَسَد', 'أُمّ', 'إِبْرِيق'] },
  { letter: 'ب', harakat: ['بَ', 'بِ', 'بُ', 'بْ', 'بَّ'], examples: ['بَاب', 'بَيْت', 'بَحْر'] },
  { letter: 'ت', harakat: ['تَ', 'تِ', 'تُ', 'تْ', 'تَّ'], examples: ['تَمْر', 'تُفَّاح', 'تَاج'] },
  { letter: 'ث', harakat: ['ثَ', 'ثِ', 'ثُ', 'ثْ', 'ثَّ'], examples: ['ثَوْب', 'ثَعْلَب', 'ثِمَار'] },
  { letter: 'ج', harakat: ['جَ', 'جِ', 'جُ', 'جْ', 'جَّ'], examples: ['جَمَل', 'جِسْر', 'جَبَل'] },
  { letter: 'ح', harakat: ['حَ', 'حِ', 'حُ', 'حْ', 'حَّ'], examples: ['حَلِيب', 'حَقِيبَة', 'حُوت'] },
  { letter: 'خ', harakat: ['خَ', 'خِ', 'خُ', 'خْ', 'خَّ'], examples: ['خُبْز', 'خَيْمَة', 'خَرِيف'] },
  { letter: 'د', harakat: ['دَ', 'دِ', 'دُ', 'دْ', 'دَّ'], examples: ['دَفْتَر', 'دَار', 'دُرُوس'] },
  { letter: 'ذ', harakat: ['ذَ', 'ذِ', 'ذُ', 'ذْ', 'ذَّ'], examples: ['ذَهَب', 'ذُبَاب', 'ذُرَة'] },
  { letter: 'ر', harakat: ['رَ', 'رِ', 'رُ', 'رْ', 'رَّ'], examples: ['رَجُل', 'رَسْم', 'رَبِيع'] },
  { letter: 'ز', harakat: ['زَ', 'زِ', 'زُ', 'زْ', 'زَّ'], examples: ['زَهْرَة', 'زَيْتُون', 'زَرَافَة'] },
  { letter: 'س', harakat: ['سَ', 'سِ', 'سُ', 'سْ', 'سَّ'], examples: ['سَيَّارَة', 'سَمَاء', 'سُوق'] },
  { letter: 'ش', harakat: ['شَ', 'شِ', 'شُ', 'شْ', 'شَّ'], examples: ['شَمْس', 'شَجَرَة', 'شَاطِئ'] },
  { letter: 'ص', harakat: ['صَ', 'صِ', 'صُ', 'صْ', 'صَّ'], examples: ['صَبَاح', 'صُورَة', 'صَحْرَاء'] },
  { letter: 'ض', harakat: ['ضَ', 'ضِ', 'ضُ', 'ضْ', 'ضَّ'], examples: ['ضَوْء', 'ضَيْف', 'ضَفْدَع'] },
  { letter: 'ط', harakat: ['طَ', 'طِ', 'طُ', 'طْ', 'طَّ'], examples: ['طَالِب', 'طَرِيق', 'طَيْر'] },
  { letter: 'ظ', harakat: ['ظَ', 'ظِ', 'ظُ', 'ظْ', 'ظَّ'], examples: ['ظِلّ', 'ظَرْف', 'ظَلَام'] },
  { letter: 'ع', harakat: ['عَ', 'عِ', 'عُ', 'عْ', 'عَّ'], examples: ['عَيْن', 'عَالِم', 'عَصِير'] },
  { letter: 'غ', harakat: ['غَ', 'غِ', 'غُ', 'غْ', 'غَّ'], examples: ['غَابَة', 'غَيْمَة', 'غُرْفَة'] },
  { letter: 'ف', harakat: ['فَ', 'فِ', 'فُ', 'فْ', 'فَّ'], examples: ['فَاكِهَة', 'فَرَاشَة', 'فُنْدُق'] },
  { letter: 'ق', harakat: ['قَ', 'قِ', 'قُ', 'قْ', 'قَّ'], examples: ['قَلَم', 'قَمَر', 'قِطَار'] },
  { letter: 'ك', harakat: ['كَ', 'كِ', 'كُ', 'كْ', 'كَّ'], examples: ['كِتَاب', 'كُرَة', 'كُرْسِيّ'] },
  { letter: 'ل', harakat: ['لَ', 'لِ', 'لُ', 'لْ', 'لَّ'], examples: ['لَيْل', 'لَوْحَة', 'لِسَان'] },
  { letter: 'م', harakat: ['مَ', 'مِ', 'مُ', 'مْ', 'مَّ'], examples: ['مَدْرَسَة', 'مَطَر', 'مَسْجِد'] },
  { letter: 'ن', harakat: ['نَ', 'نِ', 'نُ', 'نْ', 'نَّ'], examples: ['نَهْر', 'نَجْم', 'نَافِذَة'] },
  { letter: 'هـ', harakat: ['هَـ', 'هِـ', 'هُـ', 'هْـ', 'هَّـ'], examples: ['هِلَال', 'هَدِيَّة', 'هَوَاء'] },
  { letter: 'و', harakat: ['وَ', 'وِ', 'وُ', 'وْ', 'وَّ'], examples: ['وَرْدَة', 'وَطَن', 'وَلَد'] },
  { letter: 'ي', harakat: ['يَ', 'يِ', 'يُ', 'يْ', 'يَّ'], examples: ['يَد', 'يَاسَمِين', 'يَوْم'] },
];

const HARAKAT_LIST = [
  { symbol: 'ـَ', name: 'الفتحة', sound: 'a', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { symbol: 'ـُ', name: 'الضمة', sound: 'u', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { symbol: 'ـِ', name: 'الكسرة', sound: 'i', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { symbol: 'ـْ', name: 'السكون', sound: 'sukoon', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { symbol: 'ـّ', name: 'الشدة', sound: 'shaddah', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { symbol: 'ـً', name: 'تنوين الفتح', sound: 'an', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { symbol: 'ـٌ', name: 'تنوين الضم', sound: 'un', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { symbol: 'ـٍ', name: 'تنوين الكسر', sound: 'in', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
];

export const ArabicToolsModal: React.FC<ArabicToolsModalProps> = ({
  isOpen,
  onClose,
  onInsertElement
}) => {
  const [activeTab, setActiveTab] = useState<'spelling' | 'letters' | 'harakat' | 'word' | 'sentence'>('letters');
  const [selectedLetter, setSelectedLetter] = useState(ARABIC_LETTERS_DATA[1]); // Default 'ب'
  
  // Spelling rules state
  const [selectedSpellingCategory, setSelectedSpellingCategory] = useState<string>('all');
  const [selectedSpellingRule, setSelectedSpellingRule] = useState<SpellingRuleItem>(SPELLING_RULES_DATABASE[0]);

  // Word state
  const [wordInput, setWordInput] = useState('');
  const [wordTranslation, setWordTranslation] = useState('');
  const [wordType, setWordType] = useState<'اسم' | 'فعل' | 'حرف'>('اسم');

  // Sentence state
  const [sentenceInput, setSentenceInput] = useState('');
  const [sentenceTranslation, setSentenceTranslation] = useState('');

  if (!isOpen) return null;

  const handleInsertSpellingRuleCard = (rule: SpellingRuleItem) => {
    // Inserts on the Right Page of the Notebook precisely (الصفحة اليمنى)
    onInsertElement({
      type: 'spelling_rule_card',
      x: 565, // Perfectly aligned on the notebook lines of the Right Page (الصفحة اليمنى)
      y: 56,
      width: 480,
      height: 600,
      color: '#1e40af',
      strokeWidth: 2,
      spellingRuleData: {
        ruleId: rule.id,
        topicNumber: rule.topicNumber,
        title: rule.title,
        categoryLabel: rule.categoryLabel,
        subtitle: rule.subtitle,
        seriesTag: rule.seriesTag,
        partName: rule.partName,
        questionBubble: rule.questionBubble,
        conceptBox: rule.conceptBox,
        comparisonTable: rule.comparisonTable,
        dualComparison: rule.dualComparison,
        miniCards: rule.miniCards,
        decisionFlow: rule.decisionFlow,
        quickSummary: rule.quickSummary,
        footerConclusion: rule.footerConclusion,
        goldenRule: rule.goldenRule,
        handwrittenLines: rule.handwrittenLines,
        examples: rule.examples,
        dictationParagraph: rule.dictationParagraph
      }
    });
    onClose();
  };

  const handleInsertLetterCard = () => {
    onInsertElement({
      type: 'arabic_card',
      x: 180,
      y: 120,
      width: 280,
      height: 230,
      color: '#059669',
      cardData: {
        letter: selectedLetter.letter,
        harakat: selectedLetter.harakat,
        examples: selectedLetter.examples
      }
    });
    onClose();
  };

  const handleInsertSingleHarakah = (h: typeof HARAKAT_LIST[0]) => {
    onInsertElement({
      type: 'text',
      x: 240,
      y: 160,
      text: selectedLetter.letter + h.symbol.replace('ـ', ''),
      fontSize: 48,
      color: '#047857'
    });
    onClose();
  };

  const handleInsertWordCard = () => {
    if (!wordInput.trim()) return;
    onInsertElement({
      type: 'arabic_card',
      x: 200,
      y: 140,
      width: 260,
      color: wordType === 'اسم' ? '#0284c7' : wordType === 'فعل' ? '#059669' : '#d97706',
      cardData: {
        word: wordInput,
        pos: wordType,
        meaning: wordTranslation || 'مفردة لغوية',
        translation: wordTranslation
      }
    });
    setWordInput('');
    setWordTranslation('');
    onClose();
  };

  const handleInsertSentence = () => {
    if (!sentenceInput.trim()) return;
    onInsertElement({
      type: 'text',
      x: 150,
      y: 140,
      text: sentenceInput,
      color: '#1e293b',
      fontSize: 32,
      strokeWidth: 2
    });
    setSentenceInput('');
    setSentenceTranslation('');
    onClose();
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ar-SA';
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 w-full max-w-3xl shadow-2xl text-slate-800 relative overflow-hidden flex flex-col max-h-[88vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-sm">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black arabic-font text-slate-900 flex items-center gap-2">
                أدوات العربية والبطاقات الذكية 📖
              </h2>
              <p className="text-xs text-slate-500 font-medium">إدراج الحروف، الحركات، الكلمات، والجمل للسبورة فوراً</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-5 gap-1.5 mb-4 shrink-0 bg-slate-100/80 p-1.5 rounded-2xl">
          {[
            { id: 'letters', label: 'الحروف والأمثلة 🔤' },
            { id: 'word', label: 'تحليل الكلمات 🏷️' },
            { id: 'spelling', label: 'قواعد الإملاء 📝' },
            { id: 'harakat', label: 'الحركات والتنوين ✍️' },
            { id: 'sentence', label: 'جملة وتحليل 📜' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all arabic-font relative flex items-center justify-center gap-1 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-700 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scroll pr-1 space-y-4">
          {/* TAB 0: Spelling Rules & Dictation Notebook (دفتر الإملاء والقواعد بخط اليد الأزرق) */}
          {activeTab === 'spelling' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scroll">
                {[
                  { id: 'all', label: 'جميع القواعد (٨)' },
                  { id: 'hamza', label: 'الهمزات (٤)' },
                  { id: 'tanween', label: 'التنوين والنون' },
                  { id: 'taa', label: 'التاء والهاء' },
                  { id: 'alif_layyinah', label: 'الألف اللينة' },
                  { id: 'deletion_addition', label: 'الحذف والزيادة' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSpellingCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all arabic-font ${
                      selectedSpellingCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-sm font-black'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Two-Column Explorer: Rules List on Right, Live Notebook Preview on Left */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[360px]">
                {/* Rules List (5 columns) */}
                <div className="md:col-span-5 space-y-2 overflow-y-auto max-h-[380px] custom-scroll pr-1">
                  {SPELLING_RULES_DATABASE
                    .filter(rule => selectedSpellingCategory === 'all' || rule.category === selectedSpellingCategory)
                    .map(rule => {
                      const isSelected = selectedSpellingRule.id === rule.id;
                      return (
                        <div
                          key={rule.id}
                          onClick={() => setSelectedSpellingRule(rule)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer text-right flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-400 shadow-md ring-1 ring-blue-400'
                              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-black text-blue-900 leading-tight">
                              {rule.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {rule.subtitle}
                          </p>
                          <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-[10px] text-amber-800 font-bold flex items-center gap-1">
                              <span>★ {rule.examples.length} أمثلة</span>
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInsertSpellingRuleCard(rule);
                              }}
                              className="text-[11px] font-black text-white bg-blue-600 hover:bg-blue-700 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs transition active:scale-95"
                            >
                              <PenLine size={11} />
                              <span>إدراج</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Live Notebook Preview (7 columns) */}
                <div className="md:col-span-7 bg-[#fbfcfd] border-2 border-blue-200/80 rounded-2xl p-4 shadow-inner flex flex-col justify-between relative overflow-hidden">
                  {/* Subtle Notebook Blue Guidelines */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-between py-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="w-full h-px bg-blue-400" />
                    ))}
                  </div>

                  <div className="relative z-10 space-y-3">
                    {/* Header Preview */}
                    <div className="border-b-2 border-blue-600/40 pb-2 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-blue-600">معاينة الكتابة اليدوية بالقلم الحبري:</div>
                        <h4 className="text-base font-black text-blue-950 arabic-font">
                          {selectedSpellingRule.title}
                        </h4>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-900 font-bold px-2.5 py-1 rounded-xl">
                        الصفحة اليمنى 📖
                      </span>
                    </div>

                    {/* Handwritten Lines Preview */}
                    <div className="space-y-2 bg-blue-50/40 p-3 rounded-xl border border-blue-200/50">
                      {selectedSpellingRule.handwrittenLines.map((line, lIdx) => (
                        <div key={lIdx} className="text-xs font-bold text-blue-900 leading-relaxed">
                          {line.text}
                        </div>
                      ))}
                    </div>

                    {/* Golden Rule */}
                    <div className="p-2.5 rounded-xl bg-blue-900 text-white text-xs font-bold flex items-center gap-2">
                      <span className="text-amber-400 font-black">★ التذكير الذهبي:</span>
                      <span className="text-blue-100">{selectedSpellingRule.goldenRule}</span>
                    </div>

                    {/* Dictation Paragraph Preview */}
                    {selectedSpellingRule.dictationParagraph && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs">
                        <div className="font-black text-emerald-800 mb-1 flex items-center gap-1">
                          <FileText size={13} />
                          <span>فقرة الإملاء المقترحة للتملية ({selectedSpellingRule.dictationParagraph.title}):</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-emerald-900 line-clamp-2">
                          {selectedSpellingRule.dictationParagraph.text}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Primary Insert Button */}
                  <div className="relative z-10 pt-3 border-t border-slate-200 mt-2 flex items-center justify-end">
                    <button
                      onClick={() => handleInsertSpellingRuleCard(selectedSpellingRule)}
                      className="py-1.5 px-5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl font-black text-xs arabic-font flex items-center gap-1.5 shadow-md hover:shadow-lg transition transform active:scale-95"
                    >
                      <Plus size={14} />
                      <span>إدراج</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* TAB 1: Letters (جدول الحروف الأبجدية الشامل والمنظم) */}
          {activeTab === 'letters' && (
            <div className="space-y-3">
              {/* Compact Quick Select Header */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-slate-700 font-bold arabic-font">
                  جدول الحروف الأبجدية مع الحركات والأمثلة:
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full">
                  ٢٨ حرفاً مرتبة هجائياً
                </span>
              </div>

              {/* Organized Alphabet Table Layout */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white max-h-[320px] custom-scroll">
                <table className="w-full text-right border-collapse text-xs">
                  <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-center w-16">الحرف</th>
                      <th className="p-2.5">الحركات القصيرة</th>
                      <th className="p-2.5">أمثلة وكلمات</th>
                      <th className="p-2.5 text-center w-36">إدراج للسبورة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ARABIC_LETTERS_DATA.map((item, lIdx) => {
                      const isSelected = selectedLetter.letter === item.letter;
                      return (
                        <tr
                          key={`arabic_letter_${item.letter}_${lIdx}`}
                          onClick={() => setSelectedLetter(item)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-emerald-50/80 font-bold text-emerald-950'
                              : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          {/* Letter Badge */}
                          <td className="p-2 text-center">
                            <span className="inline-flex w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-lg items-center justify-center shadow-xs">
                              {item.letter}
                            </span>
                          </td>

                          {/* Harakat List */}
                          <td className="p-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.harakat.map((h, i) => (
                                <span
                                  key={`modal_harakah_${item.letter}_${h}_${i}`}
                                  className="px-1.5 py-0.5 rounded-md bg-emerald-100/70 border border-emerald-200 text-emerald-800 font-black text-sm font-arabic"
                                >
                                  {h}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Examples */}
                          <td className="p-2 font-medium text-slate-600 arabic-font">
                            <span className="text-emerald-900 font-bold">{item.examples.join(' • ')}</span>
                          </td>

                          {/* Quick Actions */}
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => speakText(item.letter + ' ' + item.examples.join(' '))}
                                className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                                title="استماع للنطق"
                              >
                                <Volume2 size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedLetter(item);
                                  const cardData = {
                                    letter: item.letter,
                                    harakat: item.harakat,
                                    examples: item.examples,
                                  };
                                  onInsertElement({
                                    id: `arabic_letter_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                                    type: 'arabic_card',
                                    x: 320,
                                    y: 180,
                                    width: 320,
                                    color: '#059669',
                                    strokeWidth: 3,
                                    text: `حرف ${item.letter}`,
                                    cardData: {
                                      word: item.letter,
                                      meaning: item.examples.join(', '),
                                      ...cardData
                                    }
                                  });
                                  onClose();
                                }}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] shadow-xs transition flex items-center gap-1"
                              >
                                <Plus size={13} />
                                <span>إدراج</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Selected Letter Compact Banner */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-2xl font-black text-white shadow-sm border border-emerald-400/40">
                    {selectedLetter.letter}
                  </div>
                  <div>
                    <div className="text-xs text-emerald-800 font-black">
                      الحرف المحدد: <span className="text-emerald-950 font-black text-sm">({selectedLetter.letter})</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-bold arabic-font mt-0.5">
                      أمثلة: <span className="text-emerald-900 font-bold">{selectedLetter.examples.join(' • ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakText(selectedLetter.letter + ' ' + selectedLetter.examples.join(' '))}
                    className="p-2 bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 rounded-xl transition shadow-xs"
                    title="استماع"
                  >
                    <Volume2 size={16} />
                  </button>
                  <button
                    onClick={handleInsertLetterCard}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs arabic-font flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Plus size={15} />
                    إدراج بطاقة الحرف الكاملة للسبورة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Harakat & Tashkeel */}
          {activeTab === 'harakat' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {HARAKAT_LIST.map((h, idx) => (
                  <div
                    key={`harakat_item_${h.name}_${idx}`}
                    className={`p-4 rounded-2xl border ${h.color} flex flex-col items-center justify-between text-center gap-2 shadow-sm transition hover:shadow-md`}
                  >
                    <span className="text-3xl font-black arabic-font">{h.symbol}</span>
                    <span className="text-sm font-bold">{h.name}</span>
                    <button
                      onClick={() => handleInsertSingleHarakah(h)}
                      className="w-full mt-2 py-1.5 bg-white border border-current rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-sm hover:scale-105 transition"
                    >
                      <Plus size={14} />
                      إدراج
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Custom Word Card */}
          {activeTab === 'word' && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الكلمة بالتشكيل:</label>
                  <input
                    type="text"
                    value={wordInput}
                    onChange={(e) => setWordInput(e.target.value)}
                    placeholder="مثال: القِرَاءَةُ"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-base font-bold arabic-font focus:outline-none focus:border-emerald-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المعنى أو الترجمة:</label>
                  <input
                    type="text"
                    value={wordTranslation}
                    onChange={(e) => setWordTranslation(e.target.value)}
                    placeholder="مثال: Reading / المطالعة"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع الكلمة:</label>
                <div className="flex gap-2">
                  {(['اسم', 'فعل', 'حرف'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setWordType(type)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                        wordType === type
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleInsertWordCard}
                disabled={!wordInput.trim()}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold arabic-font flex items-center justify-center gap-2 shadow-md transition"
              >
                <Plus size={18} />
                إدراج بطاقة الكلمة على السبورة
              </button>
            </div>
          )}

          {/* TAB 4: Sentence */}
          {activeTab === 'sentence' && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الجملة التعليمية:</label>
                <textarea
                  value={sentenceInput}
                  onChange={(e) => setSentenceInput(e.target.value)}
                  placeholder="مثال: العِلْمُ نُورٌ يَهْدِي العُقُولَ إِلَى الحَقِيقَةِ."
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-base font-bold arabic-font focus:outline-none focus:border-emerald-500 shadow-sm"
                />
              </div>

              <button
                onClick={handleInsertSentence}
                disabled={!sentenceInput.trim()}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold arabic-font flex items-center justify-center gap-2 shadow-md transition"
              >
                <Plus size={18} />
                إدراج الجملة بخط عربي واضح
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
