
import React from 'react';
import { 
  BookOpen, Loader2, Sparkles, Volume2, HelpCircle, 
  Eraser, Globe, Bookmark as BookmarkIcon, Plus, Check, XCircle, BookText,
  Library, Trash2, ChevronRight, Trophy, Timer, Zap, Award, Brain,
  FileText, Upload, Link, Newspaper, BrainCircuit, History, PenTool, FileUp, Image as ImageIcon, FileType, Type,
  ChevronLeft, Search, MoreVertical, Layout, Settings, Info, ArrowLeft, Download, Printer,
  Mic, Star, MessageSquare
} from 'lucide-react';
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Set worker for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

import { 
  generateSpeech, decodeAudioData, askAIAboutText, diacritizeText, translateAndExpand,
  generateReadingText, generateStory, fetchDailyNews, extractTextFromImage, evaluatePronunciation, speak
} from '../services/gemini';
import { Vocabulary } from '../types';

const TEXT_TYPES = [
  { id: 'story', ar: 'قصة', en: 'Story' },
  { id: 'letter', ar: 'رسالة', en: 'Letter' },
  { id: 'article', ar: 'مقال', en: 'Article' },
  { id: 'dialogue', ar: 'حوار', en: 'Dialogue' },
  { id: 'ad', ar: 'إعلان', en: 'Advertisement' },
  { id: 'memoirs', ar: 'مذكرات', en: 'Memoirs' },
  { id: 'diary', ar: 'يوميات', en: 'Diary' },
  { id: 'poetry', ar: 'شعر', en: 'Poetry' },
  { id: 'quran', ar: 'قرآن كريم', en: 'Quran' },
  { id: 'hadith', ar: 'حديث شريف', en: 'Hadith' },
];

const QUESTIONS_MAP: Record<string, string[]> = {
  story: ["ما عنوان القصة؟", "ما هي شخصيات القصة؟", "ما المكان المذكور في القصة؟", "المشكلة", "الحل"],
  letter: ["من أرسل هذه الرسالة؟", "إلى من أرسلها؟", "ما هو مضمون الرسالة؟"],
  article: ["ما عنوان المقال؟", "ما الفكرة الرئيسة؟", "ما رأيك في رأي الكاتب؟"],
  dialogue: ["من الشخصيات؟", "أين دار الحوار؟", "ما الهدف من الحوار؟"],
};

const UI_STRINGS = {
  ar: {
    title: 'القراءة التفاعلية',
    selectType: 'اختر نوع النص',
    placeholder: 'يرجى اختيار نوع النص أولاً للبدء...',
    placeholderActive: 'اكتب أو ألصق النص هنا للبدء في القراءة التفاعلية...',
    btnAsk: 'اسألني',
    btnRead: 'اقرأ لي',
    btnDisplay: 'عرض الكتاب',
    btnEdit: 'تعديل النص',
    resume: 'استئناف',
    pause: 'إيقاف',
    processing: 'جاري تشكيل النص...',
    page: 'ص',
    thinking: 'جاري التفكير لتقديم أفضل إجابة...',
    addVocab: 'أضف إلى كلماتي',
    added: 'تمت الإضافة!',
    meaning: 'المعنى',
    pronunciation: 'النطق',
    saveLibrary: 'حفظ في مكتبتي',
    myLibrary: 'مكتبتي الخاصة',
    noSavedTexts: 'لا توجد نصوص محفوظة بعد.',
    delete: 'حذف',
    load: 'تحميل',
    btnChallenge: 'تحدي الفهم',
    btnWorksheet: 'تحميل ورقة العمل',
    worksheetTitle: 'ورقة عمل تحليلية - منصة قُل',
    learnerName: 'الاسم:',
    date: 'التاريخ:',
    vocabSection: 'أولاً: المفردات',
    comprehensionSection: 'ثانياً: أسئلة الفهم والاستيعاب',
    grammarSection: 'ثالثاً: مهارات لغوية',
    notesSection: 'رابعاً: ملاحظات',
    reportTitle: 'تقرير الإنجاز',
    readingSpeed: 'سرعة القراءة',
    wpm: 'كلمة/دقيقة',
    newWords: 'كلمات جديدة',
    quizScore: 'نتيجة التحدي',
    excellent: 'ممتاز جداً!',
    goodJob: 'عمل رائع!',
    keepGoing: 'استمر في التقدم!',
    externalText: 'نص خارجي',
    aiForge: 'توليد نص',
    generateStory: 'توليد قصة',
    dailyNews: 'أخبار اليوم',
    smartImport: 'رفع ملف',
    importPDF: 'رفع PDF',
    importImage: 'رفع صورة',
    importWord: 'رفع Word',
    webLink: 'رابط ويب',
    chooseSource: 'اختر مصدر النص',
    studentLevel: 'المستوى:',
    lang: 'English',
    evaluateBtn: 'تقييم قراءتي',
    stopEvaluateBtn: 'إيقاف التسجيل',
    evaluating: 'جاري التقييم...',
    score: 'الدرجة:',
    feedback: 'التعليق:',
    details: 'التفاصيل:',
    close: 'إغلاق'
  },
  en: {
    title: 'Interactive Reading',
    selectType: 'Select Text Type',
    placeholder: 'Select text type first...',
    placeholderActive: 'Paste text here...',
    btnAsk: 'Ask Me',
    btnRead: 'Read Me',
    btnDisplay: 'Show Book',
    btnEdit: 'Edit Text',
    resume: 'Resume',
    pause: 'Pause',
    processing: 'Processing text...',
    page: 'P.',
    thinking: 'Thinking of the best answer...',
    addVocab: 'Add to My Words',
    added: 'Added!',
    meaning: 'Meaning',
    pronunciation: 'Pronunciation',
    saveLibrary: 'Save to Library',
    myLibrary: 'My Library',
    noSavedTexts: 'No saved texts yet.',
    delete: 'Delete',
    load: 'Load',
    btnChallenge: 'Comprehension Challenge',
    btnWorksheet: 'Download Worksheet',
    worksheetTitle: 'Analytical Worksheet - Qul Platform',
    learnerName: 'Name:',
    date: 'Date:',
    vocabSection: 'I. Vocabulary',
    comprehensionSection: 'II. Comprehension Questions',
    grammarSection: 'III. Language Skills',
    notesSection: 'IV. Notes',
    reportTitle: 'Achievement Report',
    readingSpeed: 'Reading Speed',
    wpm: 'WPM',
    newWords: 'New Words',
    quizScore: 'Quiz Score',
    excellent: 'Excellent!',
    goodJob: 'Good Job!',
    keepGoing: 'Keep Going!',
    externalText: 'External Text',
    aiForge: 'Generate Text',
    generateStory: 'Generate Story',
    dailyNews: 'Daily News',
    smartImport: 'Upload File',
    importPDF: 'Upload PDF',
    importImage: 'Upload Image',
    importWord: 'Upload Word',
    webLink: 'Web Link',
    chooseSource: 'Choose Text Source',
    studentLevel: 'Level:',
    lang: 'العربية',
    evaluateBtn: 'Evaluate My Reading',
    stopEvaluateBtn: 'Stop Recording',
    evaluating: 'Evaluating...',
    score: 'Score:',
    feedback: 'Feedback:',
    details: 'Details:',
    close: 'Close'
  }
};

const LEVELS = [
  { id: 'beginner', ar: 'مبتدئ', en: 'Beginner' },
  { id: 'intermediate', ar: 'متوسط', en: 'Intermediate' },
  { id: 'advanced', ar: 'متقدم', en: 'Advanced' },
];

const READING_GAMES = [
  { id: 1, type: 'letter-catch', title: 'سلة صيد الحروف', difficulty: 'مبتدئ', goal: 'صيد حروف المد (ا، و، ي)', content: ['ا', 'و', 'ي'] },
  { id: 2, type: 'duck-hunt', title: 'صيد البط', difficulty: 'مبتدئ', goal: 'صيد البط الذي يحمل حرف (ب)', content: 'ب' },
  { id: 3, type: 'snakes-ladders', title: 'السلم والثعبان', difficulty: 'متوسط', goal: 'اقرأ الكلمات للتقدم', content: ['أنا', 'أنت', 'هو', 'هي', 'نحن'] },
  { id: 4, type: 'balloon-pop', title: 'فرقعة البالونات', difficulty: 'مبتدئ', goal: 'فرقع بالونات التنوين بالفتح', content: 'ً' },
  { id: 5, type: 'word-match', title: 'توصيل الكلمات', difficulty: 'متوسط', goal: 'صل الكلمة بالصورة المناسبة', content: [{w: 'أسد', i: '🦁'}, {w: 'فيل', i: '🐘'}, {w: 'قطة', i: '🐱'}] },
  { id: 6, type: 'memory-game', title: 'لعبة الذاكرة', difficulty: 'متوسط', goal: 'طابق الحروف المتشابهة', content: ['أ', 'ب', 'ت', 'ث'] },
  { id: 7, type: 'word-search', title: 'البحث عن الكلمات', difficulty: 'متقدم', goal: 'ابحث عن أسماء الفواكه', content: ['تفاح', 'موز', 'عنب'] },
  { id: 8, type: 'scrambled-letters', title: 'ترتيب الحروف', difficulty: 'متوسط', goal: 'رتب الحروف لتكوين كلمة', content: {word: 'كتاب', letters: ['ك', 'ت', 'ا', 'ب']} },
  { id: 9, type: 'odd-one-out', title: 'الكلمة المختلفة', difficulty: 'متوسط', goal: 'اختر الكلمة المختلفة', content: {options: ['تفاح', 'موز', 'خيار', 'برتقال'], correct: 'خيار'} },
  { id: 10, type: 'rhyme-match', title: 'توصيل القوافي', difficulty: 'متقدم', goal: 'صل الكلمات التي لها نفس القافية', content: [{a: 'جميل', b: 'طويل'}, {a: 'كبير', b: 'صغير'}] },
  { id: 11, type: 'letter-catch', title: 'صيد الحركات', difficulty: 'متوسط', goal: 'صيد الحروف المفتوحة', content: ['أَ', 'بَ', 'تَ'] },
  { id: 12, type: 'duck-hunt', title: 'صيد اللام الشمسية', difficulty: 'متقدم', goal: 'صيد الكلمات التي تبدأ بلام شمسية', content: ['الشمس', 'التفاح'] },
  { id: 13, type: 'balloon-pop', title: 'بالونات الشدة', difficulty: 'متقدم', goal: 'فرقع الكلمات التي تحتوي على شدة', content: 'ّ' },
  { id: 14, type: 'word-match', title: 'المهن والكلمات', difficulty: 'متوسط', goal: 'صل المهنة بأداتها', content: [{w: 'طبيب', i: '🩺'}, {w: 'نجار', i: '🪚'}] },
  { id: 15, type: 'memory-game', title: 'ذاكرة الأرقام', difficulty: 'مبتدئ', goal: 'طابق الرقم مع الكلمة', content: [{a: '١', b: 'واحد'}, {a: '٢', b: 'اثنان'}] },
  { id: 16, type: 'word-search', title: 'عالم الحيوان', difficulty: 'متقدم', goal: 'ابحث عن حيوانات الغابة', content: ['نمر', 'أسد', 'قرد'] },
  { id: 17, type: 'scrambled-letters', title: 'تكوين جملة', difficulty: 'متقدم', goal: 'رتب الكلمات لتكوين جملة', content: {sentence: 'أنا أحب مدرستي', words: ['أنا', 'أحب', 'مدرستي']} },
  { id: 18, type: 'odd-one-out', title: 'الألوان المختلفة', difficulty: 'مبتدئ', goal: 'اختر اللون المختلف', content: {options: ['أحمر', 'أزرق', 'تفاحة', 'أخضر'], correct: 'تفاحة'} },
  { id: 19, type: 'rhyme-match', title: 'نغمات الحروف', difficulty: 'متقدم', goal: 'طابق الكلمات المتناغمة', content: [{a: 'دار', b: 'نار'}, {a: 'باب', b: 'كتاب'}] },
  { id: 20, type: 'letter-catch', title: 'صيد التنوين', difficulty: 'متقدم', goal: 'صيد تنوين الضم', content: 'ٌ' },
  { id: 21, type: 'duck-hunt', title: 'صيد اللام القمرية', difficulty: 'متقدم', goal: 'صيد الكلمات التي تبدأ بلام قمرية', content: ['القمر', 'البيت'] },
  { id: 22, type: 'balloon-pop', title: 'بالونات المد الطويل', difficulty: 'متوسط', goal: 'فرقع كلمات المد بالألف', content: 'ا' },
  { id: 23, type: 'word-match', title: 'الأضداد', difficulty: 'متقدم', goal: 'صل الكلمة بضدها', content: [{w: 'كبير', i: 'صغير'}, {w: 'طويل', i: 'قصير'}] },
  { id: 24, type: 'memory-game', title: 'ذاكرة الألوان', difficulty: 'مبتدئ', goal: 'طابق اللون باسمه', content: [{a: '🔴', b: 'أحمر'}, {a: '🔵', b: 'أزرق'}] },
  { id: 25, type: 'snakes-ladders', title: 'تحدي القراءة النهائي', difficulty: 'متقدم', goal: 'اقرأ الجمل للوصول للنهاية', content: ['ذهب الولد إلى المدرسة', 'أكلت البنت التفاحة'] },
];

const ReadingGame: React.FC<{ game: typeof READING_GAMES[0], onWin: () => void }> = ({ game, onWin }) => {
  const [score, setScore] = React.useState(0);
  const [items, setItems] = React.useState<any[]>([]);
  const [isWon, setIsWon] = React.useState(false);

  React.useEffect(() => {
    if (game.type === 'letter-catch' || game.type === 'duck-hunt' || game.type === 'balloon-pop') {
      const interval = setInterval(() => {
        if (isWon) return;
        setItems(prev => [
          ...prev.slice(-10),
          { 
            id: Math.random(), 
            x: Math.random() * 80 + 10, 
            y: -10, 
            val: Math.random() > 0.5 ? (Array.isArray(game.content) ? game.content[Math.floor(Math.random() * game.content.length)] : game.content) : 'خ' 
          }
        ]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [game, isWon]);

  const handleItemClick = (item: any) => {
    if (isWon) return;
    const isCorrect = Array.isArray(game.content) ? game.content.includes(item.val) : item.val === game.content;
    if (isCorrect) {
      setScore(prev => {
        const newScore = prev + 1;
        if (newScore >= 5) {
          setIsWon(true);
          onWin();
        }
        return newScore;
      });
      setItems(prev => prev.filter(i => i.id !== item.id));
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-black text-emerald-800 arabic-font">{game.title}</h3>
          <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">{game.goal}</p>
        </div>
        <div className="bg-white px-4 py-1 rounded-full shadow-sm border border-emerald-100">
          <span className="text-sm font-black text-emerald-600">{score} / 5</span>
        </div>
      </div>

      <div className="flex-1 relative bg-white/50 rounded-2xl border border-dashed border-emerald-200 overflow-hidden">
        {isWon ? (
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/10 backdrop-blur-sm z-50"
          >
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Trophy size={40} />
            </div>
            <h4 className="text-2xl font-black text-emerald-800 arabic-font">أحسنت!</h4>
            <p className="text-sm font-bold text-emerald-600">لقد أكملت اللعبة بنجاح</p>
          </motion.div>
        ) : (
          <>
            {items.map(item => (
              <motion.div
                key={item.id}
                initial={{ y: -20, x: `${item.x}%`, opacity: 0 }}
                animate={{ y: 300, opacity: 1 }}
                transition={{ duration: 4, ease: "linear" }}
                onClick={() => handleItemClick(item)}
                className="absolute w-12 h-12 bg-white rounded-2xl shadow-md border border-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
              >
                {item.val}
              </motion.div>
            ))}
          </>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <div className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
          المستوى: {game.difficulty}
        </div>
      </div>
    </div>
  );
};

const WORDS_PER_PAGE = 60; 

const playFlipSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    // Light Organic Page Flip: Low-mid resonance and subtle crackle
    const duration = 0.25;
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      // High-passed noise with intermittent "crackle" pulses
      const env = Math.pow(1 - i / data.length, 3);
      data[i] = (Math.random() * 2 - 1) * env * (Math.random() > 0.9 ? 1 : 0.4);
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + duration);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  } catch (e) {
    console.debug("Audio sound suppressed.");
  }
};

const BicolorText: React.FC<{ text: string }> = ({ text }) => {
  // Regex for Arabic diacritics
  const diacritics = /[\u064B-\u0652\u0670]/;
  const parts = [];
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (diacritics.test(char)) {
      // Style diacritics with a distinctive color but ensure they stay attached
      parts.push(<span key={i} className="text-red-500/80">{char}</span>);
    } else {
      parts.push(char);
    }
  }
  
  return <span className="arabic-font inline-block border-none outline-none">{parts}</span>;
};

const SmartTooltip: React.FC<{ children: React.ReactNode, text: string, visible?: boolean }> = ({ children, text, visible = true }) => {
  const [hovered, setHovered] = React.useState(false);
  
  if (!visible || !text) return <>{children}</>;
  
  return (
    <div 
      className="relative inline-block" 
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900/90 text-white text-[10px] font-bold rounded-lg whitespace-nowrap z-[100] shadow-xl backdrop-blur-sm pointer-events-none"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/90" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Reading: React.FC = () => {
  const { user, isAuthReady } = useAuth();
  const [text, setText] = React.useState('');
  const [processedText, setProcessedText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [textType, setTextType] = React.useState('');
  const [lang, setLang] = React.useState<'ar' | 'en'>(() => (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar');

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  const [isReading, setIsReading] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [highlightIdx, setHighlightIdx] = React.useState(-1);
  const [showBook, setShowBook] = React.useState(false);
  const [isBookOpen, setIsBookOpen] = React.useState(false);
  const [isOpening, setIsOpening] = React.useState(false);
  const [flippingDirection, setFlippingDirection] = React.useState<'next' | 'prev' | null>(null);
  const [currentSpreadIndex, setCurrentSpreadIndex] = React.useState(0);
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = React.useState(false);
  const worksheetRef = React.useRef<HTMLDivElement>(null);
  const [qaState, setQaState] = React.useState({ index: -1, showAnswer: false, currentQ: '', currentA: '' });
  const [selectedWord, setSelectedWord] = React.useState<{ word: string, analysis?: Partial<Vocabulary>, loading: boolean } | null>(null);
  const [isAdded, setIsAdded] = React.useState(false);
  const [library, setLibrary] = React.useState<{ id: string, title: string, text: string, processedText?: string, type: string, date: string }[]>([]);
  const [showLibrary, setShowLibrary] = React.useState(false);
  const [sessionStats, setSessionStats] = React.useState({ 
    startTime: 0, 
    wordsAdded: 0, 
    correctAnswers: 0, 
    totalQuestions: 0,
    showReport: false 
  });

  const [selectedLevel, setSelectedLevel] = React.useState<{ id: string, ar: string, en: string } | null>(null);
  const [isGenerated, setIsGenerated] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'library' | 'external' | null>(null);
  const [inputMode, setInputMode] = React.useState<'ai' | 'manual'>('ai');
  const [manualSubMode, setManualSubMode] = React.useState<'paste' | 'image' | 'pdf' | 'word'>('paste');
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    const savedLibrary = localStorage.getItem('hub_reading_library');
    if (savedLibrary) setLibrary(JSON.parse(savedLibrary));

    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const sourceNodeRef = React.useRef<AudioBufferSourceNode | null>(null);
  const highlightIntervalRef = React.useRef<number | null>(null);

  const [isRecording, setIsRecording] = React.useState(false);
  const [readingEvaluation, setReadingEvaluation] = React.useState<any>(null);
  const [evaluating, setEvaluating] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const startReadingEvaluation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setEvaluating(true);
          try {
            const result = await evaluatePronunciation(base64Audio, text, 'Modern Standard Arabic');
            setReadingEvaluation(result);

            // Save to Student Memory
            if (user && result.word_accuracy) {
              const memoryRef = collection(db, 'users', user.uid, 'memory');
              for (const wordInfo of result.word_accuracy) {
                if (wordInfo.accuracy < 70) { // Only save words with low accuracy
                  await addDoc(memoryRef, {
                    type: 'reading',
                    content: wordInfo.word,
                    explanation: `Accuracy: ${wordInfo.accuracy}%`,
                    userId: user.uid,
                    timestamp: serverTimestamp()
                  });
                }
              }
            }
          } catch (e) {
            console.error("Evaluation failed", e);
          } finally {
            setEvaluating(false);
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      alert("Microphone access denied.");
    }
  };

  const stopReadingEvaluation = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const t = UI_STRINGS[lang];
  const words = (showBook ? processedText : text).trim().split(/\s+/).filter(w => w.length > 0);
  const totalSpreads = Math.ceil(words.length / (WORDS_PER_PAGE * 2));
  const activeSpread = Math.max(0, currentSpreadIndex);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
      sourceNodeRef.current = null;
    }
    if (highlightIntervalRef.current) {
      clearInterval(highlightIntervalRef.current);
      highlightIntervalRef.current = null;
    }
    setIsReading(false);
    setIsPaused(false);
    setHighlightIdx(-1);
  };

  const flipPage = (direction: 'next' | 'prev') => {
    if (flippingDirection) return;
    playFlipSound();
    setFlippingDirection(direction);
    setTimeout(() => {
      if (direction === 'next' && activeSpread < totalSpreads - 1) {
        setCurrentSpreadIndex(prev => prev + 1);
      } else if (direction === 'prev' && activeSpread > 0) {
        setCurrentSpreadIndex(prev => prev - 1);
      }
    }, 450); 
    setTimeout(() => {
      setFlippingDirection(null);
    }, 900); 
  };

  const handleToggleBook = async () => {
    if (!text.trim()) return;
    if (!showBook) {
      // Check if this text already exists in library with a processed version
      const existingInLibrary = library.find(item => item.text === text && item.processedText);
      if (existingInLibrary?.processedText) {
        setProcessedText(existingInLibrary.processedText);
        setShowBook(true);
        setIsBookOpen(false);
        setIsOpening(false);
        setCurrentSpreadIndex(0);
        setHighlightIdx(-1);
        return;
      }

      setIsProcessing(true);
      try {
        const diacritized = await diacritizeText(text);
        setProcessedText(diacritized);
        setShowBook(true);
        setIsBookOpen(false);
        setIsOpening(false);
        setCurrentSpreadIndex(0);
        setHighlightIdx(-1);
        setSessionStats({
          startTime: Date.now(),
          wordsAdded: 0,
          correctAnswers: 0,
          totalQuestions: 0,
          showReport: false
        });
      } catch (e) {
        setProcessedText(text);
        setShowBook(true);
        setIsBookOpen(false);
        setIsOpening(false);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setShowBook(false);
    }
  };

  const handleReadMe = async () => {
    if (words.length === 0 || !textType) return;
    if (isReading) {
      if (!isPaused) {
        audioContextRef.current?.suspend();
        setIsPaused(true);
        if (highlightIntervalRef.current) clearInterval(highlightIntervalRef.current);
      } else {
        audioContextRef.current?.resume();
        setIsPaused(false);
        startHighlightTimer();
      }
      return;
    }

    setLoading(true);
    try {
      if (processedText || text) {
        await speak(processedText || text, 'ar');
        setIsReading(true);
        setHighlightIdx(0);
        if (!showBook) await handleToggleBook();
        // Since speak() handles both AI and fallback, we just set reading state
        // Note: end callback might need more integration but this works for basic playback
      }
    } catch (e) {
      console.error(e);
    }
    finally { setLoading(false); }
  };

  const playMagicSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;
      
      // Heavy Leather/Old Book Opening Sound
      // Layer 1: Spine Creak (Crackling pulses)
      for (let i = 0; i < 12; i++) {
        const osc = audioContext.createOscillator();
        const g = audioContext.createGain();
        osc.frequency.setValueAtTime(40 + Math.random() * 60, now + i * 0.04);
        g.gain.setValueAtTime(0, now + i * 0.04);
        g.gain.linearRampToValueAtTime(0.02, now + i * 0.04 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.1);
        osc.connect(g);
        g.connect(audioContext.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.1);
      }

      // Layer 2: Heavy Body Swoosh
      const duration = 1.0;
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
      for (let i = 0; i < buffer.length; i++) {
        buffer.getChannelData(0)[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / buffer.length, 3);
      }
      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;
      const lp = audioContext.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(300, now);
      lp.frequency.exponentialRampToValueAtTime(80, now + duration);
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      noise.connect(lp);
      lp.connect(gain);
      gain.connect(audioContext.destination);
      noise.start();
      
      // Layer 3: Initial page friction
      setTimeout(() => playFlipSound(), 100);
    } catch (e) {
      console.error('Audio error:', e);
    }
  };

  const handleOpenBook = () => {
    playFlipSound();
    playMagicSound();
    setIsOpening(true);
    setTimeout(() => {
      setIsBookOpen(true);
      setIsOpening(false);
    }, 1000);
  };

  const startHighlightTimer = (duration?: number) => {
    if (words.length === 0) return;
    const timePerWord = duration ? (duration * 1000) / words.length : 400; 
    highlightIntervalRef.current = window.setInterval(() => {
      setHighlightIdx(prev => {
        const next = prev + 1;
        if (next > 0 && next % (WORDS_PER_PAGE * 2) === 0 && next < words.length) {
          flipPage('next');
        }
        if (next >= words.length) {
          if (highlightIntervalRef.current) clearInterval(highlightIntervalRef.current);
          return prev;
        }
        return next;
      });
    }, timePerWord);
  };

  const handleChallenge = async () => {
    if (!text.trim()) return;
    
    // If book is not open, open it first
    if (!showBook) {
      await handleToggleBook();
    }

    if (!textType) {
      // Default to general if not selected
      setTextType('general');
    }
    
    // Wait for words to be populated if we just opened the book
    // processedText might take a moment to update state, but words is a useMemo
    // Actually processedText is set in handleToggleBook which we awaited.
    
    const currentWords = text.split(/\s+/).filter(Boolean);
    if (currentWords.length === 0) return;
    
    // Navigate to last page if not there
    if (activeSpread < totalSpreads - 1) {
      setCurrentSpreadIndex(totalSpreads - 1);
    }

    const typeQuestions = QUESTIONS_MAP[textType] || ["ما الفكرة العامة؟"];
    setLoading(true);
    try {
      let ni = qaState.index;
      let sa = qaState.showAnswer;
      let nq = qaState.currentQ;
      let na = qaState.currentA;

      if (ni === -1) {
        ni = 0; sa = false; nq = typeQuestions[0]; na = '';
        setSessionStats(prev => ({ ...prev, totalQuestions: typeQuestions.length }));
      } else if (!sa) {
        sa = true; na = await askAIAboutText(text, nq);
        setSessionStats(prev => ({ ...prev, correctAnswers: prev.correctAnswers + 1 }));
      } else {
        ni = ni + 1;
        if (ni >= typeQuestions.length) {
          // End of challenge
          setSessionStats(prev => ({ ...prev, showReport: true }));
          setQaState({ index: -1, showAnswer: false, currentQ: '', currentA: '' });
          setLoading(false);
          return;
        }
        sa = false; nq = typeQuestions[ni]; na = '';
      }
      setQaState({ index: ni, showAnswer: sa, currentQ: nq, currentA: na });
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleWordClick = async (word: string) => {
    // Clean word from punctuation
    const cleanWord = word.replace(/[.,!?;:()]/g, "").trim();
    if (!cleanWord) return;

    setSelectedWord({ word: cleanWord, loading: true });
    setIsAdded(false);
    
    try {
      const analysis = await translateAndExpand(cleanWord, true, lang === 'ar' ? 'English' : 'Arabic');
      setSelectedWord({ word: cleanWord, analysis, loading: false });
    } catch (e) {
      console.error("Word analysis failed", e);
      setSelectedWord(null);
    }
  };

  const addToVocab = () => {
    if (!selectedWord?.analysis) return;
    
    // Track word added for the session
    setSessionStats(prev => ({ ...prev, wordsAdded: prev.wordsAdded + 1 }));

    const savedVocab = localStorage.getItem('hub_vocab');
    const vocabList: Vocabulary[] = savedVocab ? JSON.parse(savedVocab) : [];
    
    // Check if already exists
    if (vocabList.some(v => v.original_word === selectedWord.analysis?.original_word)) {
      setIsAdded(true);
      return;
    }

    const newEntry = {
      ...selectedWord.analysis,
      id: crypto.randomUUID(),
      last_reviewed: new Date().toISOString(),
      next_review: new Date().toISOString(),
      review_count: 0
    } as Vocabulary;

    vocabList.push(newEntry);
    localStorage.setItem('hub_vocab', JSON.stringify(vocabList));
    setIsAdded(true);

    // Save to Firestore for the "Connected Journey"
    if (user) {
      const vocabRef = collection(db, 'users', user.uid, 'vocabulary');
      addDoc(vocabRef, {
        word: selectedWord.analysis.original_word || selectedWord.word,
        meaning_ar: selectedWord.analysis.arabic_definition || '',
        meaning_en: selectedWord.analysis.english_definition || '',
        userId: user.uid,
        source: 'Reading',
        createdAt: serverTimestamp()
      }).catch(err => console.error("Failed to sync vocab to Firestore", err));
    }
    
    // Dispatch event to update other components if needed
    window.dispatchEvent(new Event('vocabUpdated'));
  };

  const saveToLibrary = () => {
    if (!text.trim()) return;
    
    // Check if already saved
    if (library.some(item => item.text === text)) return;
    
    const newEntry = {
      id: crypto.randomUUID(),
      title: text.split('\n')[0].substring(0, 30) + (text.length > 30 ? '...' : ''),
      text: text,
      processedText: processedText, // Save the diacritized text to avoid re-processing
      type: textType,
      date: new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')
    };

    const updatedLibrary = [newEntry, ...library];
    setLibrary(updatedLibrary);
    localStorage.setItem('hub_reading_library', JSON.stringify(updatedLibrary));
  };

  const isTextSaved = library.some(item => item.text === text);

  const deleteFromLibrary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedLibrary = library.filter(item => item.id !== id);
    setLibrary(updatedLibrary);
    localStorage.setItem('hub_reading_library', JSON.stringify(updatedLibrary));
  };

  const generateWorksheet = async () => {
    if (!worksheetRef.current) return;
    setIsGeneratingWorksheet(true);
    try {
      const canvas = await html2canvas(worksheetRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Qul_Worksheet_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGeneratingWorksheet(false);
    }
  };

  const loadFromLibrary = async (item: { text: string, type: string, processedText?: string }) => {
    setText(item.text);
    setTextType(item.type);
    
    // If we have saved diacritized text, use it directly to save time
    if (item.processedText) {
      setProcessedText(item.processedText);
      setShowBook(true);
      setIsBookOpen(false);
      setIsOpening(false);
      setCurrentSpreadIndex(0);
      setHighlightIdx(-1);
      return;
    }

    // Otherwise, open book with fresh processing
    setIsProcessing(true);
    try {
      const diacritized = await diacritizeText(item.text);
      setProcessedText(diacritized);
      setShowBook(true);
      setIsBookOpen(false);
      setIsOpening(false);
      setCurrentSpreadIndex(0);
      setHighlightIdx(-1);
    } catch (e) {
      setProcessedText(item.text);
      setShowBook(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateAIText = async () => {
    if (!textType) return;
    setLoading(true);
    try {
      const generated = await generateReadingText(textType, selectedLevel?.id || 'intermediate');
      setText(generated);
      setIsGenerated(true);
      setActiveTab('external');
      setShowBook(false);

      // Save Interest
      if (user) {
        const interestsRef = collection(db, 'users', user.uid, 'interests');
        addDoc(interestsRef, {
          topic: textType,
          userId: user.uid,
          frequency: 1,
          lastSeen: serverTimestamp(),
          source: 'Reading'
        }).catch(err => console.error("Failed to sync interest to Firestore", err));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStory = async () => {
    setLoading(true);
    try {
      const story = await generateStory();
      setText(story);
      setTextType('story');
      setActiveTab('external');
      setShowBook(false);

      // Save Interest
      if (user) {
        const interestsRef = collection(db, 'users', user.uid, 'interests');
        addDoc(interestsRef, {
          topic: 'story',
          userId: user.uid,
          frequency: 1,
          lastSeen: serverTimestamp(),
          source: 'Reading'
        }).catch(err => console.error("Failed to sync interest to Firestore", err));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchNews = async () => {
    setLoading(true);
    try {
      const news = await fetchDailyNews();
      setText(news);
      setTextType('article');
      setActiveTab('external');
      setShowBook(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const extracted = await extractTextFromImage(file);
      setText(extracted);
      setTextType('article');
      setActiveTab('external');
      setShowBook(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => (item as any).str).join(' ');
        fullText += pageText + '\n';
      }
      setText(fullText);
      setTextType('article');
      setActiveTab('external');
      setShowBook(false);
    } catch (e) {
      console.error("PDF Extraction Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleWordUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      setText(result.value);
      setTextType('article');
      setActiveTab('external');
      setShowBook(false);
    } catch (e) {
      console.error("Word Extraction Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const rightPageWords = words.slice(activeSpread * WORDS_PER_PAGE * 2, activeSpread * WORDS_PER_PAGE * 2 + WORDS_PER_PAGE);
  const leftPageWords = words.slice(activeSpread * WORDS_PER_PAGE * 2 + WORDS_PER_PAGE, (activeSpread + 1) * WORDS_PER_PAGE * 2);

  const ruledPageStyle: React.CSSProperties = {
    backgroundImage: `repeating-linear-gradient(transparent, transparent 39px, #cbd5e1 39px, #cbd5e1 40px)`,
    backgroundSize: '100% 40px',
    lineHeight: '40px',
    padding: '15px 30px', 
    paddingTop: '20px', 
    textAlign: 'right',
    minHeight: '100%',
    display: 'block',
    width: '100%',
    fontFamily: "'Tajawal', sans-serif",
    fontSize: '23px', 
    fontWeight: '500', 
    color: '#1e40af', 
    textRendering: 'optimizeLegibility',
    fontVariantLigatures: 'common-ligatures contextual',
    fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
  };

  return (
    <div className={`w-full flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-700 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header Bar */}
      <PageHeader 
        title={t.title} 
        icon={BookOpen} 
        lang={lang} 
        onToggle={toggleLang}
      />

      <div className="flex-1 flex overflow-hidden bg-slate-50/30 relative">
        
        {/* Sidebar - Right Side in RTL */}
        <aside className="w-[300px] bg-slate-50/50 border-l rtl:border-l-0 rtl:border-r border-slate-100 flex flex-col shrink-0 no-print relative overflow-y-auto custom-scroll z-40">
          <div className="p-8 border-b border-slate-100/50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{t.chooseSource}</h3>
            
            <div className="space-y-3">
              {/* 1. My Library */}
              <button 
                onClick={() => {
                  setActiveTab('library');
                  setShowBook(false);
                }}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${activeTab === 'library' ? 'border-amber-400 bg-white text-amber-600 shadow-lg shadow-amber-100/50 -translate-y-1' : 'border-transparent bg-white/50 hover:bg-white hover:border-slate-200 text-slate-400'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'library' ? 'bg-amber-500 text-white shadow-lg rotate-3' : 'bg-slate-100 text-slate-400'}`}>
                  <Library size={22} />
                </div>
                <div className="text-right flex-1">
                  <p className="text-sm font-black arabic-font tracking-tight">{t.myLibrary}</p>
                </div>
              </button>

              {/* 2. New Reading (Merged AI & External) */}
              <button 
                onClick={() => {
                  setActiveTab('external');
                  setShowBook(false);
                }}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${activeTab === 'external' ? 'border-indigo-400 bg-white text-indigo-600 shadow-lg shadow-indigo-100/50 -translate-y-1' : 'border-transparent bg-white/50 hover:bg-white hover:border-slate-200 text-slate-400'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'external' ? 'bg-indigo-500 text-white shadow-lg rotate-3' : 'bg-slate-100 text-slate-400'}`}>
                  <Plus size={22} />
                </div>
                <div className="text-right flex-1">
                  <p className="text-sm font-black arabic-font tracking-tight">{lang === 'ar' ? 'نص جديد' : 'New Reading'}</p>
                </div>
              </button>
            </div>
          </div>

          <div className="p-6 mt-auto bg-white/30 backdrop-blur-md border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">{t.studentLevel}</p>
            <div className="grid grid-cols-1 gap-2">
              {LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level)}
                  className={`w-full px-5 py-3 rounded-2xl text-[11px] font-black transition-all flex items-center justify-between border-2 ${selectedLevel?.id === level.id ? 'bg-[#2563eb] text-white border-blue-400 shadow-md translate-x-1' : 'bg-white text-slate-400 hover:text-slate-600 border-transparent hover:border-slate-100'}`}
                >
                  <span className="arabic-font leading-none">{level.ar}</span>
                  <span className="opacity-70 leading-none text-[9px] uppercase tracking-tighter">{level.en}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto custom-scroll relative bg-[#fcfcfd] p-8">
          {/* Subtle Background Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
          
          {/* Faded Person Reading Illustration - Empty State */}
          {!activeTab && !text && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.05] animate-in fade-in duration-1000">
              <div className="relative">
                <svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <path d="M10 13h4" />
                </svg>
              </div>
              <p className="text-2xl font-black arabic-font mt-4 text-slate-900 uppercase tracking-widest">{t.title}</p>
            </div>
          )}

          {/* Selection UI based on activeTab */}
          {activeTab && !showBook && (
            <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* 1. Library Selection - Refined Fluid Design */}
              {activeTab === 'library' && (
                <div className="w-full max-w-lg animate-in zoom-in-95 duration-500 shadow-[0_25px_70px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden bg-white border border-slate-50">
                  {/* Softer Orange Header */}
                  <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-8 text-white relative overflow-hidden">
                    {/* Flowing background element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                    
                    <button 
                      onClick={() => setActiveTab(null)}
                      className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all group z-20"
                    >
                      <XCircle size={18} className="group-hover:rotate-90 transition-transform" />
                    </button>

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex-1 text-right">
                        <h3 className="text-3xl font-black arabic-font mb-1 leading-tight">{t.myLibrary}</h3>
                        <p className="text-orange-50 text-[9px] font-black uppercase tracking-wider opacity-90">
                          {lang === 'ar' ? `العناصر المحفوظة ${library.length}` : `SAVED ITEMS ${library.length}`}
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center shadow-inner ml-5">
                        <Library size={32} className="text-white/90" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Search Bar - Fluid Style */}
                    <div className="relative mb-5">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input 
                        type="text" 
                        placeholder={lang === 'ar' ? 'ابحث في مجموعتك...' : 'Search collection...'} 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-11 pl-5 py-3 bg-slate-50/50 border border-slate-100/50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-100/50 focus:bg-white transition-all font-medium text-slate-600"
                      />
                    </div>

                    <div className="max-h-[360px] overflow-y-auto custom-scroll pr-1 space-y-2.5">
                      {library.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-slate-300 text-xs font-bold arabic-font">{t.noSavedTexts}</p>
                        </div>
                      ) : (
                        library
                          .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(item => (
                            <div 
                              key={item.id}
                              onClick={() => loadFromLibrary(item)}
                              className="group bg-white p-4 rounded-[1.5rem] border border-slate-50 hover:border-orange-100 hover:shadow-lg transition-all cursor-pointer flex items-center gap-4 relative overflow-hidden"
                            >
                              {/* Hover glow effect */}
                              <div className="absolute inset-0 bg-gradient-to-l from-orange-50/0 to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                              
                              <div className="flex flex-col gap-2 no-print shrink-0 text-slate-200 group-hover:text-orange-400 transition-colors z-10">
                                <ChevronLeft size={20} className="rtl:rotate-0 rotate-180" />
                              </div>
                              
                              <button 
                                onClick={(e) => deleteFromLibrary(item.id, e)}
                                className="p-2 text-slate-200 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all no-print z-10"
                              >
                                <Trash2 size={16} />
                              </button>

                              <div className="flex-1 text-right overflow-hidden z-10">
                                <h4 className="text-base font-black text-slate-700 arabic-font truncate group-hover:text-orange-600 transition-colors leading-none mb-1.5">
                                  {item.title}
                                </h4>
                                <div className="flex items-center justify-end gap-2.5">
                                  <span className="text-[9px] text-slate-400 font-bold">{item.date}</span>
                                  <div className="h-0.5 w-0.5 rounded-full bg-slate-200" />
                                  <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[8px] font-black uppercase tracking-wider">{item.type}</span>
                                </div>
                              </div>
                              
                              <div className="w-11 h-11 bg-orange-50/50 text-orange-400 rounded-xl flex items-center justify-center shrink-0 border border-orange-100/30 group-hover:bg-orange-500 group-hover:text-white group-hover:scale-105 transition-all duration-300 z-10">
                                <BookText size={20} />
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. New Reading Selection (Merged AI & External) */}
              {activeTab === 'external' && (
                <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="text-center mb-8">
                    <h3 className="text-4xl font-black text-slate-900 arabic-font mb-2">
                      {lang === 'ar' ? 'إضافة نص جديد' : 'Add New Text'}
                    </h3>
                  </div>

                  <div className="space-y-10">
                    {/* Source Selection - AI vs Manual */}
                    <div className="flex flex-col items-center gap-6">
                      {/* Mode Selection - AI vs Manual */}
                      <div className="flex items-center p-1.5 bg-slate-100/80 rounded-full shadow-inner mb-6">
                        <button 
                          onClick={() => {
                            setInputMode('ai');
                            setTextType(null); // Reset type when switching to AI to follow the "activate" flow
                          }}
                          className={`px-8 py-3 rounded-full text-sm font-black arabic-font transition-all flex items-center gap-2 ${inputMode === 'ai' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <BrainCircuit size={18} />
                          {t.aiForge}
                        </button>
                        <button 
                          onClick={() => {
                            setInputMode('manual');
                            setTextType(null); // Reset type
                          }}
                          className={`px-8 py-3 rounded-full text-sm font-black arabic-font transition-all flex items-center gap-2 ${inputMode === 'manual' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <PenTool size={18} />
                          {lang === 'ar' ? 'إدخال نص' : 'Input Text'}
                        </button>
                      </div>

                      {/* Step 2: Text Types - Small icons on one row - Only show if mode is selected */}
                      <AnimatePresence>
                        {inputMode && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="w-full overflow-x-auto no-scrollbar pb-2"
                          >
                            <div className="flex items-center justify-center gap-2 min-w-max px-4">
                              {TEXT_TYPES.map(type => (
                                <button 
                                  key={type.id}
                                  onClick={() => {
                                    setTextType(type.id);
                                    setSelectedLevel(null); // Reset level when type changes
                                    setIsGenerated(false); // Reset generated state
                                  }}
                                  className={`relative p-2 rounded-xl border transition-all duration-300 flex flex-col items-center gap-1 group ${textType === type.id ? 'border-indigo-500 bg-white shadow-sm' : 'border-slate-100 bg-white hover:border-indigo-200 text-slate-500'}`}
                                >
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${textType === type.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                    <FileText size={12} />
                                  </div>
                                  <span className="text-[8px] font-black arabic-font tracking-tight whitespace-nowrap">{lang === 'ar' ? type.ar : type.en}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {inputMode === 'ai' ? (
                        <div className="w-full max-w-2xl text-center">
                          <AnimatePresence>
                            {textType && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm"
                              >
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                  <BookOpen size={24} />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 arabic-font mb-6">{lang === 'ar' ? 'اختر مستوى النص' : 'Select Text Level'}</h4>
                                
                                {/* Step 3: Level Selection inside AI flow */}
                                <div className="flex flex-wrap justify-center gap-2 mb-8">
                                  {LEVELS.map(level => (
                                    <button
                                      key={level.id}
                                      onClick={() => {
                                        setSelectedLevel(level);
                                        setIsGenerated(false); // Reset generated state
                                      }}
                                      className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${selectedLevel?.id === level.id ? 'bg-[#2563eb] text-white shadow-md' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
                                    >
                                      <span className="arabic-font">{lang === 'ar' ? level.ar : level.en}</span>
                                    </button>
                                  ))}
                                </div>

                                {/* Step 4: Final Action Button - Only show when level is selected */}
                                <AnimatePresence>
                                  {selectedLevel && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="flex justify-center"
                                    >
                                      <button 
                                        onClick={handleGenerateAIText}
                                        disabled={isGenerated}
                                        className={`px-8 py-2.5 rounded-full font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${isGenerated ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl'}`}
                                      >
                                        <Zap size={16} />
                                        {lang === 'ar' ? 'ابدأ التوليد الذكي الآن' : 'Start AI Generation Now'}
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          
                          {!textType && (
                            <div className="py-12 text-slate-300 arabic-font font-bold animate-pulse">
                              {lang === 'ar' ? '↑ اختر نوع النص أولاً ليتم تفعيل المستوى' : '↑ Select text type first to enable level'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full space-y-6 animate-in fade-in zoom-in duration-500">
                          {/* Step 2: Manual Options - Only show if type is selected */}
                          <AnimatePresence>
                            {textType && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-wrap items-center justify-center gap-3"
                              >
                                <button 
                                  onClick={() => setManualSubMode('paste')}
                                  className={`flex items-center gap-3 px-5 py-2.5 border rounded-xl transition-all group ${manualSubMode === 'paste' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-300'}`}
                                >
                                  <Type size={16} />
                                  <span className="text-xs font-bold arabic-font">{lang === 'ar' ? 'لصق النص' : 'Paste Text'}</span>
                                </button>

                                <label className={`flex items-center gap-3 px-5 py-2.5 border rounded-xl transition-all cursor-pointer group ${manualSubMode === 'image' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-300'}`}>
                                  <input type="file" accept="image/*" onChange={(e) => { setManualSubMode('image'); handleImageUpload(e); }} className="hidden" />
                                  <ImageIcon size={16} />
                                  <span className="text-xs font-bold arabic-font text-inherit">{t.importImage}</span>
                                </label>

                                <label className={`flex items-center gap-3 px-5 py-2.5 border rounded-xl transition-all cursor-pointer group ${manualSubMode === 'pdf' ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:border-red-300'}`}>
                                  <input type="file" accept=".pdf" onChange={(e) => { setManualSubMode('pdf'); handlePDFUpload(e); }} className="hidden" />
                                  <FileType size={16} />
                                  <span className="text-xs font-bold arabic-font text-inherit">{t.importPDF}</span>
                                </label>

                                <label className={`flex items-center gap-3 px-5 py-2.5 border rounded-xl transition-all cursor-pointer group ${manualSubMode === 'word' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-300'}`}>
                                  <input type="file" accept=".doc,.docx" onChange={(e) => { setManualSubMode('word'); handleWordUpload(e); }} className="hidden" />
                                  <FileUp size={16} />
                                  <span className="text-xs font-bold arabic-font text-inherit">{t.importWord}</span>
                                </label>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {!textType && (
                            <div className="py-12 text-center text-slate-300 arabic-font font-bold animate-pulse">
                              {lang === 'ar' ? '↑ اختر نوع النص أولاً لتفعيل خيارات الإدخال' : '↑ Select text type first to enable input options'}
                            </div>
                          )}

                          {textType && manualSubMode === 'paste' && (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="relative max-w-3xl mx-auto"
                            >
                              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full shadow-lg z-10 uppercase tracking-widest">
                                {t.placeholderActive}
                              </div>
                              <div className="bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.05)] p-2 border border-slate-100">
                                <textarea
                                  value={text}
                                  onChange={(e) => setText(e.target.value)}
                                  placeholder={t.placeholderActive}
                                  dir="rtl"
                                  className="w-full p-10 text-xl border-none outline-none resize-none bg-transparent rounded-2xl font-medium arabic-font h-64 custom-scroll placeholder:text-slate-200"
                                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                                />
                                <div className="p-4 flex justify-end">
                                  <button 
                                    onClick={() => setShowBook(true)}
                                    disabled={!text}
                                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:bg-indigo-700 hover:shadow-[0_15px_30px_rgba(79,70,229,0.4)] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                                  >
                                    <BookOpen size={20} />
                                    {t.btnDisplay}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Faded Book Watermark - Removed as requested to only show the Person Reading illustration */}
          
          {(isProcessing || loading) && (
            <div className="absolute inset-0 z-[100] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 animate-in fade-in">
               <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
               <p className="font-bold text-slate-600 text-sm arabic-font">{t.processing}</p>
            </div>
          )}

          {/* Floating Toggle Book Icon */}
          <button 
            onClick={handleToggleBook}
            disabled={isProcessing || !text || !textType}
            className={`fixed bottom-8 left-8 w-14 h-14 bg-white text-slate-900 border border-slate-100 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)] hover:scale-110 transition-all active:scale-95 disabled:opacity-50 z-[100] no-print group ${isGenerated && !showBook ? 'ring-4 ring-blue-400 ring-opacity-50 animate-pulse' : ''}`}
            title={showBook ? t.btnEdit : t.btnDisplay}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin text-blue-600" size={24} />
            ) : (
              <div className="relative">
                <BookOpen size={28} className={`${isGenerated && !showBook ? 'text-blue-600' : 'group-hover:text-blue-600'} transition-colors`} />
                {text && !showBook && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>
            )}
          </button>

          <AnimatePresence mode="wait">
            {showBook && (
              <motion.div 
                key="book"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-6xl mx-auto flex-1 flex flex-col items-center justify-center gap-12 overflow-visible py-4 perspective-[3000px]"
              >
              
              {!isBookOpen ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  dir="rtl"
                  className={`relative w-[380px] h-[520px] rounded-l-3xl rounded-r-lg shadow-[0_40px_80px_rgba(0,0,0,0.25)] border-r-[15px] border-[#2c1810] flex flex-col items-center justify-between p-10 text-center cursor-pointer group preserve-3d origin-right transition-all duration-1000 ease-in-out overflow-hidden ${isOpening ? 'rotate-y-[-110deg] opacity-0 scale-95 -translate-x-[360px]' : ''}`}
                  style={{ 
                    background: 'radial-gradient(circle at center, #fdfbf7 0%, #f8f5f0 60%, #e2dcd0 100%)'
                  }}
                  onClick={handleOpenBook}
                >
                  {/* Paper Texture Overlay */}
                  <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                  
                  {/* Falling Arabic Letters Background - Scattered "Rain" Pattern */}
                  <div className="absolute inset-0 opacity-[0.12] pointer-events-none overflow-hidden z-0">
                    {[...Array(35)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-4xl font-black text-[#8b5e3c] arabic-font select-none blur-[0.5px]"
                        style={{ left: `${Math.random() * 100}%` }}
                        initial={{ 
                          y: -50, 
                          opacity: 0, 
                          rotate: Math.random() * 360,
                          scale: 0.4 + Math.random() * 0.4 
                        }}
                        animate={{ 
                          y: 750, 
                          opacity: [0, 0.7, 0.7, 0],
                          rotate: Math.random() * 1080,
                          x: [0, (Math.random() - 0.5) * 60] // Random drift
                        }}
                        transition={{
                          duration: 10 + Math.random() * 15,
                          repeat: Infinity,
                          delay: Math.random() * -40,
                          ease: "linear"
                        }}
                      >
                        {['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'][i % 28]}
                      </motion.span>
                    ))}
                  </div>

                  {/* Header Area - Shrink and lift higher for better title centering */}
                  <div className="relative z-20 w-full pt-2 flex flex-col items-center">
                    {/* Compact Balanced Circular Logo */}
                    <div className="w-16 h-16 rounded-full border-2 border-[#8b5e3c]/20 bg-[#fdfbf7] shadow-xl flex flex-col items-center justify-center relative mb-1">
                       <span className="text-sm font-black text-[#8b5e3c] font-mono leading-none tracking-tighter">QUL</span>
                       <h1 className="text-base font-black text-[#8b5e3c] arabic-font leading-none mt-0.5">قُل</h1>
                       <div className="absolute inset-1 border border-[#8b5e3c]/5 rounded-full" />
                    </div>

                    {/* Tapered Solid Ornament with Star */}
                    <div className="flex items-center justify-center gap-3 w-full px-20 mb-2">
                       <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#8b5e3c]/40 to-[#8b5e3c]/60 [clip-path:polygon(0%_50%,100%_0%,100%_100%,0%_50%)]" />
                       <Star className="text-[#8b5e3c]/40" size={10} fill="currentColor" />
                       <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#8b5e3c]/40 to-[#8b5e3c]/60 [clip-path:polygon(0%_50%,100%_0%,100%_100%,0%_50%)]" />
                    </div>
                    
                    <h3 className="text-[9px] font-bold text-[#1a365d]/40 arabic-font uppercase tracking-[0.3em] mb-1">فَخْرًا باللُّغةِ العَرَبِيَّةِ</h3>
                  </div>

                    {/* Lesson Title (Main Focus) */}
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-6">
                      <div className="absolute -z-10 w-32 h-32 bg-[#8b5e3c]/5 rounded-full blur-2xl animate-pulse" />
                      <SmartTooltip text={lang === 'en' ? 'Lesson Title' : ''} visible={lang === 'en'}>
                        <h2 className="text-3xl font-black text-[#1e293b] arabic-font leading-relaxed mb-4 text-center px-4 drop-shadow-sm" dir="rtl">
                          {text.split('\n')[0].substring(0, 45) || t.title}
                        </h2>
                      </SmartTooltip>
                      
                      <div className="relative inline-block px-10 py-3 group">
                        {/* Upper Tapered Line */}
                        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8b5e3c]/50 to-transparent [clip-path:polygon(0%_0%,50%_100%,100%_0%)]" />
                        
                        <SmartTooltip text={lang === 'en' ? TEXT_TYPES.find(t => t.id === textType)?.en : ''} visible={lang === 'en'}>
                          <span className="text-[#8b5e3c] font-black arabic-font text-xs tracking-[0.2em] uppercase">
                            {TEXT_TYPES.find(t => t.id === textType)?.ar}
                          </span>
                        </SmartTooltip>
                        
                        {/* Lower Tapered Line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8b5e3c]/50 to-transparent [clip-path:polygon(0%_100%,50%_0%,100%_100%)]" />
                        
                        {/* Side Accents - Tapered triangles like the logo ornament */}
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-gradient-to-r from-transparent to-[#8b5e3c]/40 [clip-path:polygon(0%_50%,100%_0%,100%_100%)]" />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-gradient-to-l from-transparent to-[#8b5e3c]/40 [clip-path:polygon(0%_50%,100%_0%,100%_100%)]" />
                      </div>
                    </div>

                    {/* Traditional Dad and Poetry */}
                    <div className="relative z-10 w-full flex flex-col items-end">
                      <div className="relative mr-4 mb-2">
                         <SmartTooltip text={lang === 'en' ? 'Language of the letter Dhad' : ''} visible={lang === 'en'}>
                           <h1 className="text-5xl font-bold text-[#1a365d] handwritten-font opacity-90 leading-tight" dir="rtl">لُغَةُ الضَّاد</h1>
                         </SmartTooltip>
                      </div>
                      
                      <div className="text-right pr-6 space-y-1 border-r-2 border-[#8b5e3c]/20" dir="rtl">
                        <p className="text-[10px] font-bold text-slate-500 arabic-font">إِنَّ الَّذِي مَلأَ اللُّغَاتِ مَحَاسِنًا</p>
                        <p className="text-[10px] font-black text-[#1a365d] arabic-font">جَعَلَ الْجَمَالَ وَسِرَّهُ فِي الضَّادِ</p>
                      </div>
                    </div>

                  {/* Interactive 3D Peeling Corner (Bottom Left) */}
                  <div className="absolute bottom-0 left-0 w-32 h-32 overflow-hidden rounded-bl-3xl pointer-events-auto group/corner z-50">
                    <motion.div 
                      className="absolute bottom-0 left-0 w-full h-full"
                      whileHover="hover"
                      initial="initial"
                    >
                      {/* Page Back Surface (Peeling effect) */}
                      <motion.div 
                        variants={{
                          initial: { rotateY: 0, rotateX: 0, x: 0, y: 0, scale: 1 },
                          hover: { 
                            rotateY: -40, 
                            rotateX: 10,
                            x: 10,
                            y: -10,
                            scale: 1.05,
                            transition: { type: "spring", stiffness: 150, damping: 15 }
                          }
                        }}
                        className="absolute bottom-0 left-0 w-16 h-16 bg-[#e8e2d8] border-r border-t border-black/10 origin-bottom-left shadow-2xl z-10"
                        style={{ borderBottomLeftRadius: '24px', clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)' }}
                      />
                      
                      {/* Corner Gradient (The flip shadow) */}
                      <motion.div 
                        variants={{
                          initial: { opacity: 0 },
                          hover: { opacity: 1 }
                        }}
                        className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <>
                  <div className="relative w-full h-[380px] flex flex-col animate-in fade-in zoom-in duration-700 overflow-visible shrink-0 -translate-y-16">
                  <div className="relative flex-1 w-full flex perspective-[3000px] preserve-3d py-1">
                    <div className="w-full h-full relative flex shadow-[0_20px_40px_rgba(0,0,0,0.2)] rounded-2xl bg-gradient-to-b from-[#3d1e09] via-[#2d160a] to-[#1a0d06] p-1.5 ring-[6px] ring-[#3d1e09] preserve-3d">
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-r from-black/20 via-black/40 to-black/20 z-30 pointer-events-none" />
                      
                      {flippingDirection && (
                        <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-1.5px)] z-40 preserve-3d transition-all duration-900 ${flippingDirection === 'next' ? 'left-1.5 origin-right animate-flip-rtl-next' : 'right-1.5 origin-left animate-flip-rtl-prev'}`}>
                          <div className="absolute inset-0 backface-hidden bg-[#fffdfa] border-slate-100 shadow-sm flex flex-col justify-center px-10 overflow-hidden" />
                          <div className="absolute inset-0 backface-hidden bg-[#fffdfa] border-slate-100 shadow-sm flex flex-col justify-center px-10 overflow-hidden" style={{ transform: 'rotateY(180deg)' }} />
                        </div>
                      )}
                      
                      {/* الصفحة اليمنى */}
                      <div className="flex-1 bg-[#fffdfa] rounded-r-lg border-l border-black/5 relative overflow-hidden shadow-[inset_15px_0_30px_rgba(0,0,0,0.02)] preserve-3d">
                       <div className="absolute top-0 bottom-0 right-6 w-px bg-red-400 opacity-20 z-10" />
                       
                       {/* Audio Toggle Icon */}
                       <div className="absolute top-2 right-1 z-50 flex flex-col gap-2">
                         <button 
                           onClick={handleReadMe} 
                           disabled={loading || isProcessing || !text} 
                           className="w-8 h-8 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-[#059669] hover:scale-110 hover:bg-emerald-50 transition-all active:scale-95 group"
                           title={isReading ? (isPaused ? t.resume : t.pause) : t.btnRead}
                         >
                           {loading && !isReading ? (
                             <Loader2 className="animate-spin" size={14} />
                           ) : (
                             <Volume2 size={16} className={isReading && !isPaused ? "animate-pulse" : ""} />
                           )}
                         </button>
                         <button 
                           onClick={isRecording ? stopReadingEvaluation : startReadingEvaluation}
                           disabled={loading || evaluating || !text.trim()}
                           className={`w-8 h-8 rounded-full shadow-lg border border-slate-100 flex items-center justify-center transition-all active:scale-95 group ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                           title={evaluating ? t.evaluating : (isRecording ? t.stopEvaluateBtn : t.evaluateBtn)}
                         >
                           {evaluating ? <Loader2 className="animate-spin" size={14} /> : <Mic size={16} />}
                         </button>
                       </div>

                       <div style={ruledPageStyle} dir="rtl">
                         <div className="whitespace-pre-wrap leading-relaxed">
                           {rightPageWords.length > 0 ? rightPageWords.map((word, i) => {
                            const idx = activeSpread * WORDS_PER_PAGE * 2 + i;
                            const wordEval = readingEvaluation?.word_accuracy?.find((wa: any) => wa.word.replace(/[^\u0621-\u064A]/g, '') === word.replace(/[^\u0621-\u064A]/g, ''));
                            const colorClass = wordEval ? (wordEval.isCorrect ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold') : '';
                            return (
                              <span 
                                key={idx} 
                                onClick={() => handleWordClick(word)}
                                className={`inline-block cursor-pointer hover:bg-blue-100/50 rounded px-0.5 ${idx === highlightIdx ? 'bg-blue-600/20 rounded shadow-[0_2px_0_#2563eb]' : ''} ${colorClass}`}
                              >
                                 <BicolorText text={word} />
                               </span>
                             );
                           }).reduce((prev, curr) => [prev, ' ', curr] as any) : null}
                         </div>
                       </div>
                       <button onClick={() => flipPage('prev')} disabled={activeSpread === 0} className="absolute bottom-0 right-0 w-20 h-20 group z-50 cursor-pointer disabled:opacity-0 transition-opacity overflow-hidden rounded-br-lg">
                          <div className="absolute bottom-0 right-0 w-0 h-0 border-t-[0px] border-t-transparent border-r-[0px] border-r-[#e2e8f0] group-hover:border-t-[30px] group-hover:border-r-[30px] transition-all duration-500 ease-out shadow-[-5px_-5px_15px_rgba(0,0,0,0.1)] rounded-tl-3xl" />
                       </button>
                    </div>

                    {/* الصفحة اليسرى */}
                    <div className="flex-1 bg-[#fffdfa] rounded-l-lg border-r border-black/5 relative overflow-hidden shadow-[inset_-15px_0_30px_rgba(0,0,0,0.02)] preserve-3d">
                       <div className="absolute top-0 bottom-0 left-6 w-px bg-red-400 opacity-20 z-10" />
                       
                       {/* Challenge Toggle Icon - Only show on last page */}
                       {activeSpread === totalSpreads - 1 && (
                         <button 
                           onClick={handleChallenge} 
                           disabled={loading || isProcessing || !text} 
                           className="absolute top-2 left-1 z-50 w-8 h-8 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-emerald-600 hover:scale-110 hover:bg-emerald-50 transition-all active:scale-95 group"
                           title={t.btnChallenge}
                         >
                           {loading && qaState.index !== -1 && !qaState.showAnswer ? (
                             <Loader2 className="animate-spin" size={14} />
                           ) : (
                             <Brain size={16} />
                           )}
                         </button>
                       )}

                       <div style={ruledPageStyle} dir="rtl">
                          {qaState.index !== -1 ? (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in">
                               <h4 className="text-xl font-bold arabic-font text-red-600 mb-4 leading-relaxed">
                                 {qaState.currentQ}
                               </h4>
                               {qaState.showAnswer && (
                                 <div className="animate-in slide-in-from-bottom-2 duration-500">
                                   <div className="w-12 h-1 bg-blue-200 mx-auto mb-4 rounded-full" />
                                   <p className="text-sm font-medium text-emerald-600 arabic-font leading-relaxed">
                                     {qaState.currentA || t.thinking}
                                   </p>
                                 </div>
                               )}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {leftPageWords.length > 0 ? leftPageWords.map((word, i) => {
                                const idx = activeSpread * WORDS_PER_PAGE * 2 + WORDS_PER_PAGE + i;
                                const wordEval = readingEvaluation?.word_accuracy?.find((wa: any) => wa.word.replace(/[^\u0621-\u064A]/g, '') === word.replace(/[^\u0621-\u064A]/g, ''));
                                const colorClass = wordEval ? (wordEval.isCorrect ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold') : '';
                                return (
                                  <span 
                                    key={idx} 
                                    onClick={() => handleWordClick(word)}
                                    className={`inline-block cursor-pointer hover:bg-blue-100/50 rounded px-0.5 ${idx === highlightIdx ? 'bg-blue-600/20 rounded shadow-[0_2px_0_#2563eb]' : ''} ${colorClass}`}
                                  >
                                    <BicolorText text={word} />
                                  </span>
                                );
                              }).reduce((prev, curr) => [prev, ' ', curr] as any) : null}
                            </div>
                          )}
                       </div>
                       <button onClick={() => flipPage('next')} disabled={activeSpread >= totalSpreads - 1} className="absolute bottom-0 left-0 w-20 h-20 group z-50 cursor-pointer disabled:opacity-0 transition-opacity overflow-hidden rounded-bl-lg">
                          <div className="absolute bottom-0 left-0 w-0 h-0 border-t-[0px] border-t-transparent border-l-[0px] border-l-[#e2e8f0] group-hover:border-t-[30px] group-hover:border-l-[30px] transition-all duration-500 ease-out shadow-[5px_-5px_15px_rgba(0,0,0,0.1)] rounded-tr-3xl" />
                       </button>
                    </div>

                    {/* الإشارة المرجعية - تم تحويلها لزر حفظ */}
                    <button 
                      onClick={saveToLibrary}
                      disabled={isTextSaved}
                      className={`absolute bottom-[2px] left-1/4 z-[100] drop-shadow-xl opacity-90 transition-all duration-500 hover:translate-y-2 cursor-pointer disabled:cursor-default no-print`}
                    >
                      <div className={`w-5 h-10 bg-gradient-to-b rounded-b-sm shadow-xl relative transition-colors duration-500 ${isTextSaved ? 'from-[#3d1e09] via-[#2d160a] to-[#1a0d06]' : 'from-red-600 via-red-700 to-red-900'}`}>
                         <div className={`absolute bottom-0 left-0 right-0 h-2.5 transition-colors duration-500 ${isTextSaved ? 'bg-black/40' : 'bg-red-950'}`} style={{ clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)' }} />
                      </div>
                    </button>
                  </div>
                </div>
                <div className="mt-1 flex justify-center no-print">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">{t.page} {activeSpread * 2 + 1} - {activeSpread * 2 + 2}</span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </main>
  </div>

      {/* Word Analysis Tooltip/Modal */}
      {selectedWord && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-gradient-to-br from-[#2563eb] to-[#059669] p-8 text-white relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl pointer-events-none" />
              
              <button onClick={() => setSelectedWord(null)} className="absolute top-4 right-4 text-white/40 hover:text-white hover:rotate-90 transition-all duration-300 z-10">
                <XCircle size={24} />
              </button>
              
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/20 shadow-inner">
                  <BookText size={28} className="text-white/90" />
                </div>
                <h3 className="text-4xl font-bold arabic-font mb-2 drop-shadow-md">{selectedWord.word}</h3>
                {selectedWord.analysis?.translation && (
                  <div className="px-4 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
                    <p className="text-white/90 font-bold text-sm tracking-wide">{selectedWord.analysis.translation}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 space-y-6">
              {selectedWord.loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full animate-pulse" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{t.thinking}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-[1px] flex-1 bg-slate-100" />
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">{t.meaning}</p>
                        <div className="h-[1px] flex-1 bg-slate-100" />
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-lg font-bold text-slate-800 leading-relaxed arabic-font text-center" dir="rtl">
                          {selectedWord.analysis?.arabic_definition}
                        </p>
                        <div className="flex justify-center">
                          <div className="w-8 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent rounded-full" />
                        </div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed text-center italic">
                          {selectedWord.analysis?.english_definition}
                        </p>
                      </div>
                    </div>
                    
                    {selectedWord.analysis?.analysis?.details_ar?.root && (
                      <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Root</span>
                          <span className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">الأصل</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600 arabic-font group-hover:scale-110 transition-transform">{selectedWord.analysis.analysis.details_ar.root}</span>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={addToVocab}
                    disabled={isAdded}
                    className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 ${
                      isAdded 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default' 
                        : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200 hover:shadow-slate-300'
                    }`}
                  >
                    {isAdded ? <Check size={18} className="animate-in zoom-in" /> : <Plus size={18} />}
                    {isAdded ? t.added : t.addVocab}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Achievement Report Modal */}
      {sessionStats.showReport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden animate-in zoom-in duration-500">
            <div className="bg-gradient-to-br from-[#2563eb] via-[#1e40af] to-[#312e81] p-10 text-white relative text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl" />
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-xl border border-white/30 shadow-2xl animate-bounce">
                  <Trophy size={48} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                </div>
                <h3 className="text-3xl font-bold arabic-font mb-2">{t.reportTitle}</h3>
                <p className="text-blue-100 font-bold arabic-font opacity-90">
                  {sessionStats.correctAnswers === sessionStats.totalQuestions ? t.excellent : 
                   sessionStats.correctAnswers > sessionStats.totalQuestions / 2 ? t.goodJob : t.keepGoing}
                </p>
              </div>
            </div>

            <div className="p-10 space-y-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <Timer size={20} className="text-blue-600 mb-2" />
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.readingSpeed}</span>
                  <span className="text-xl font-bold text-slate-800">
                    {Math.round(words.length / ((Date.now() - sessionStats.startTime) / 60000))}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400">{t.wpm}</span>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <BookText size={20} className="text-emerald-600 mb-2" />
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.newWords}</span>
                  <span className="text-xl font-bold text-slate-800">{sessionStats.wordsAdded}</span>
                  <span className="text-[8px] font-bold text-slate-400">Words</span>
                </div>

                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <Award size={20} className="text-amber-500 mb-2" />
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.quizScore}</span>
                  <span className="text-xl font-bold text-slate-800">{sessionStats.correctAnswers}/{sessionStats.totalQuestions}</span>
                  <span className="text-[8px] font-bold text-slate-400">Score</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={generateWorksheet}
                  disabled={isGeneratingWorksheet}
                  className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-bold text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isGeneratingWorksheet ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Download size={18} />
                  )}
                  {t.btnWorksheet}
                </button>

                <button 
                  onClick={() => setSessionStats(prev => ({ ...prev, showReport: false }))}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-black active:scale-95 transition-all"
                >
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Worksheet Template for PDF Generation */}
      <div className="fixed left-[-9999px] top-0">
        <div 
          ref={worksheetRef}
          className="w-[800px] bg-white p-12 text-slate-900 arabic-font"
          dir="rtl"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-center">
            <div className="w-1/3">
              <h1 className="text-base font-bold max-w-[200px] leading-[2] pb-4">{text.split('\n')[0] || 'نص عام'}</h1>
              <p className="text-slate-400 text-[10px] uppercase font-bold">{textType || 'عام'}</p>
            </div>
            <div className="w-1/3 text-center">
              <h2 className="text-2xl font-black leading-relaxed pb-4">ورقة عمل</h2>
            </div>
            <div className="w-1/3 text-left">
              <div className="text-2xl font-black tracking-tighter text-slate-900 mb-0.5 leading-relaxed pb-4" dir="ltr">
                QUL / قُل
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interactive Learning</div>
            </div>
          </div>

          {/* Learner Info */}
          <div className="flex gap-10 mb-6 border-b border-slate-100 pb-3">
            <div className="flex-1 flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">{t.learnerName}</span>
              <div className="flex-1 border-b border-slate-300 h-6"></div>
            </div>
            <div className="w-1/3 flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">{t.date}</span>
              <div className="flex-1 border-b border-slate-300 h-6 text-sm flex items-end font-sans">
                {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

          {/* Section 1: Vocabulary */}
          <div className="mb-6">
            <h2 className="text-lg font-bold bg-slate-100 p-2.5 rounded-lg mb-3 border-r-4 border-slate-900">{t.vocabSection}</h2>
            <p className="text-xs text-slate-500 mb-3 italic">دون الكلمات الجديدة التي تعلمتها اليوم وضعها في جمل من إنشائك:</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="border-b border-slate-200 h-8 flex items-end pb-1">
                  <span className="text-slate-300 text-[10px] ml-2">{i}.</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Comprehension */}
          <div className="mb-6">
            <h2 className="text-lg font-bold bg-slate-100 p-2.5 rounded-lg mb-3 border-r-4 border-slate-900">{t.comprehensionSection}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold mb-1">1. ما هو الموضوع الرئيسي الذي يتحدث عنه النص؟</p>
                <div className="border-b border-slate-200 h-7"></div>
              </div>
              <div>
                <p className="text-sm font-bold mb-1">2. لماذا تعتقد أن الكاتب اختار هذا العنوان؟</p>
                <div className="border-b border-slate-200 h-7"></div>
              </div>
              <div>
                <p className="text-sm font-bold mb-1">3. لخص أهم ثلاث نقاط وردت في النص بأسلوبك الخاص.</p>
                <div className="border-b border-slate-200 h-7 mb-1"></div>
                <div className="border-b border-slate-200 h-7"></div>
              </div>
            </div>
          </div>

          {/* Section 3: Grammar */}
          <div className="mb-6">
            <h2 className="text-lg font-bold bg-slate-100 p-2.5 rounded-lg mb-3 border-r-4 border-slate-900">{t.grammarSection}</h2>
            <p className="text-sm mb-2">استخرج جملة أعجبتك من النص وحاول إعادة صياغتها بأسلوب مختلف:</p>
            <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-300 min-h-[50px] mb-3">
              <p className="text-slate-300 text-[10px] italic">الجملة الأصلية...</p>
            </div>
            <div className="border-b border-slate-200 h-7"></div>
            <p className="text-slate-400 text-[9px] mt-0.5 italic">إعادة الصياغة...</p>
          </div>

          {/* Section 4: Notes */}
          <div>
            <h2 className="text-lg font-bold bg-slate-100 p-2.5 rounded-lg mb-3 border-r-4 border-slate-900">{t.notesSection}</h2>
            <div className="border border-slate-200 rounded-2xl p-4 min-h-[100px]">
              <p className="text-slate-300 text-[10px] italic">دون أي ملاحظات أو أسئلة تود البحث عنها لاحقاً...</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em]">Generated by Qul Interactive Platform - {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>


      
      {/* Reading Evaluation Modal */}
      {readingEvaluation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
              <Trophy size={48} className="mx-auto mb-4 text-amber-300" />
              <h3 className="text-2xl font-black arabic-font">{lang === 'ar' ? 'نتائج التقييم الصوتي' : 'Voice Evaluation Results'}</h3>
            </div>
            <div className="p-10 space-y-8">
              <div className="flex items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.score}</p>
                  <span className="text-4xl font-black text-blue-600">{readingEvaluation.score}%</span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Star size={32} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                  <h4 className="text-xs font-black text-emerald-600 uppercase mb-2 flex items-center gap-2"><MessageSquare size={14} /> {t.feedback}</h4>
                  <p className="text-lg font-bold text-slate-800 arabic-font leading-relaxed">{readingEvaluation.feedback_ar}</p>
                  <p className="text-sm italic text-slate-400 mt-2">{readingEvaluation.feedback_en}</p>
                </div>

                {readingEvaluation.accuracy_details && (
                  <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                    <h4 className="text-xs font-black text-blue-600 uppercase mb-2 flex items-center gap-2"><Info size={14} /> {t.details}</h4>
                    <p className="text-sm font-medium text-slate-600 arabic-font leading-relaxed">{readingEvaluation.accuracy_details}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setReadingEvaluation(null)}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes flip-rtl-next { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(180deg); } }
        @keyframes flip-rtl-prev { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(-180deg); } }
        .animate-flip-rtl-next { animation: flip-rtl-next 1s cubic-bezier(0.2, 0, 0.2, 1) forwards; }
        .animate-flip-rtl-prev { animation: flip-rtl-prev 1s cubic-bezier(0.2, 0, 0.2, 1) forwards; }
        .backface-hidden { backface-visibility: hidden; }
        .preserve-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
};
