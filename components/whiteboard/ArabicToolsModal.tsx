import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Volume2, Plus, BookOpen, Type, Layers, CheckCircle2 } from 'lucide-react';
import { WhiteboardElement } from '../../types/whiteboard';

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
  const [activeTab, setActiveTab] = useState<'letters' | 'harakat' | 'word' | 'sentence'>('letters');
  const [selectedLetter, setSelectedLetter] = useState(ARABIC_LETTERS_DATA[1]); // Default 'ب'
  
  // Word state
  const [wordInput, setWordInput] = useState('');
  const [wordTranslation, setWordTranslation] = useState('');
  const [wordType, setWordType] = useState<'اسم' | 'فعل' | 'حرف'>('اسم');

  // Sentence state
  const [sentenceInput, setSentenceInput] = useState('');
  const [sentenceTranslation, setSentenceTranslation] = useState('');

  if (!isOpen) return null;

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
        <div className="grid grid-cols-4 gap-2 mb-4 shrink-0 bg-slate-100/80 p-1.5 rounded-2xl">
          {[
            { id: 'letters', label: 'الحروف والأمثلة 🔤' },
            { id: 'harakat', label: 'الحركات والتنوين ✍️' },
            { id: 'word', label: 'بطاقة كلمة ومفردة 🏷️' },
            { id: 'sentence', label: 'جملة وتحليل لغوي 📜' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-2 text-xs sm:text-sm font-bold rounded-xl transition-all arabic-font ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-700 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scroll pr-1 space-y-4">
          {/* TAB 1: Letters */}
          {activeTab === 'letters' && (
            <div className="space-y-4">
              {/* Letters Grid */}
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                {ARABIC_LETTERS_DATA.map((item) => (
                  <button
                    key={item.letter}
                    onClick={() => setSelectedLetter(item)}
                    className={`h-11 rounded-xl text-lg font-black arabic-font transition flex items-center justify-center ${
                      selectedLetter.letter === item.letter
                        ? 'bg-emerald-600 text-white shadow-md scale-105'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                  >
                    {item.letter}
                  </button>
                ))}
              </div>

              {/* Letter Preview & Details Card */}
              <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-4xl font-black text-white shadow-lg border border-emerald-400/40">
                    {selectedLetter.letter}
                  </div>
                  <div>
                    <div className="text-xs text-emerald-800 font-bold mb-1">الحركات القصيرة:</div>
                    <div className="flex gap-2 mb-2">
                      {selectedLetter.harakat.map((h, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white text-emerald-700 rounded-lg text-lg font-black arabic-font border border-emerald-200 shadow-sm">
                          {h}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="font-bold">أمثلة:</span>
                      <span className="text-emerald-900 font-bold arabic-font">{selectedLetter.examples.join(' • ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => speakText(selectedLetter.letter + ' ' + selectedLetter.examples.join(' '))}
                    className="p-3 bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 rounded-xl transition shadow-sm"
                    title="استماع"
                  >
                    <Volume2 size={20} />
                  </button>
                  <button
                    onClick={handleInsertLetterCard}
                    className="flex-1 sm:flex-initial px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold arabic-font flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <Plus size={18} />
                    إدراج بطاقة الحرف للسبورة
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
                    key={idx}
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
