
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Globe, Volume2, Loader2, Type as TypeIcon, ChevronLeft, ArrowRight, AlertCircle, Music, Wind, Download, Upload, FileText, CheckCircle2, XCircle, Award, Share2, PenTool, RefreshCcw, Paintbrush, Palette, Play, Star, CheckCircle, Edit3, BrainCircuit, Mic, Activity, BookOpen, Layers, Search, X, Inbox } from 'lucide-react';
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { generateSpeech, decodeAudioData, verifyLetterWorksheet, fileToGenerativePart, generateContentWithRetry, speak } from '../services/gemini';
import { GoogleGenAI, Type } from "@google/genai";
import { useAuth } from '../components/AuthProvider';
import { LetterHomeworkInboxModal } from '../components/LetterHomeworkInboxModal';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ALPHABET = [
  { char: 'أ', name: 'ألف', translit: "ALIF", example: 'أَرْنَبٌ', emoji: '🐇' },
  { char: 'ب', name: 'باء', translit: "BA'", example: 'بَطَّةٌ', emoji: '🦆' },
  { char: 'ت', name: 'تاء', translit: "TA'", example: 'تُفَّاحَةٌ', emoji: '🍎' },
  { char: 'ث', name: 'ثاء', translit: "THA'", example: 'ثُعْبَانٌ', emoji: '🐍' },
  { char: 'ج', name: 'جيم', translit: "JIM", example: 'جَمَلٌ', emoji: '🐪' },
  { char: 'ح', name: 'حاء', translit: "ḤA'", example: 'حِصَانٌ', emoji: '🐎' }, 
  { char: 'خ', name: 'خاء', translit: "KHA'", example: 'خَرُوفٌ', emoji: '🐑' },
  { char: 'د', name: 'دال', translit: "DAL", example: 'دِيكٌ', emoji: '🐓' },
  { char: 'ذ', name: 'ذال', translit: "THAL", example: 'ذُرَةٌ', emoji: '🌽' },
  { char: 'ر', name: 'راء', translit: "RA'", example: 'رِيشَةٌ', emoji: '🪶' },
  { char: 'ز', name: 'زاي', translit: "ZAY", example: 'زَيْتُونٌ', emoji: '🫒' },
  { char: 'س', name: 'سين', translit: "SIN", example: 'سَمَكَةٌ', emoji: '🐟' },
  { char: 'ش', name: 'شين', translit: "SHIN", example: 'شَمْسٌ', emoji: '☀️' },
  { char: 'ص', name: 'صاد', translit: "ṢAD", example: 'صَقْرٌ', emoji: '🦅' }, 
  { char: 'ض', name: 'ضاد', translit: "ḌAD", example: 'ضِفْدَعٌ', emoji: '🐸' }, 
  { char: 'ط', name: 'طاء', translit: "ṬA'", example: 'طَائِرَةٌ', emoji: '✈️' },  
  { char: 'ظ', name: 'ظاء', translit: "DHA'", example: 'ظَرْفٌ', emoji: '✉️' },  
  { char: 'ع', name: 'عين', translit: "ẠIN", example: 'عِنَبٌ', emoji: '🍇' },  
  { char: 'غ', name: 'غين', translit: "GHAYN", example: 'غَزَالٌ', emoji: '🦌' },
  { char: 'ف', name: 'فاء', translit: "FA'", example: 'فَرَاشَةٌ', emoji: '🦋' },
  { char: 'ق', name: 'قاف', translit: "QAF", example: 'قَمَرٌ', emoji: '🌕' },
  { char: 'ك', name: 'كاف', translit: "KAF", example: 'كِتَابٌ', emoji: '📖' },
  { char: 'ل', name: 'لام', translit: "LAM", example: 'لَيْمُونٌ', emoji: '🍋' },
  { char: 'م', name: 'ميم', translit: "MIM", example: 'مَوْزٌ', emoji: '🍌' },
  { char: 'ن', name: 'نون', translit: "NUN", example: 'نَحْلَةٌ', emoji: '🐝' },
  { char: 'هـ', name: 'هاء', translit: "HA'", example: 'هِلَالٌ', emoji: '🌙' },
  { char: 'و', name: 'واو', translit: "WAW", example: 'وَرْدَةٌ', emoji: '🌹' },
  { char: 'ي', name: 'ياء', translit: "YA'", example: 'يَدٌ', emoji: '✋' },
];

const HARAKAT = [
  { symbol: '\u064E', nameAr: 'فتحة', nameEn: 'Fatha', color: 'bg-blue-50 text-blue-600' },
  { symbol: '\u064F', nameAr: 'ضمة', nameEn: 'Damma', color: 'bg-emerald-50 text-emerald-600' },
  { symbol: '\u0650', nameAr: 'كسرة', nameEn: 'Kasra', color: 'bg-amber-50 text-amber-600' },
  { symbol: '\u0652', nameAr: 'سكون', nameEn: 'Sukun', color: 'bg-slate-50 text-slate-600' },
];

const SHADDA_VARIATIONS = [
  { symbol: '\u0651\u064E', nameAr: 'شدة فتح', nameEn: 'Shadda Fatha', color: 'bg-violet-50 text-violet-600' },
  { symbol: '\u0651\u064F', nameAr: 'شدة ضم', nameEn: 'Shadda Damma', color: 'bg-violet-50 text-violet-600' },
  { symbol: '\u0651\u0650', nameAr: 'شدة كسر', nameEn: 'Shadda Kasra', color: 'bg-violet-50 text-violet-600' },
];

const stripTashkeel = (text: string) => {
  if (!text) return '';
  return text.replace(/[\u064B-\u0652\u0670]/g, '');
};

const MAD_VOWELS = [
  { symbol: '\u064E\u0627', nameAr: 'مد بالألف', nameEn: 'Mad Alif', color: 'bg-indigo-50 text-indigo-600' },
  { symbol: '\u064F\u0648', nameAr: 'مد بالواو', nameEn: 'Mad Waw', color: 'bg-purple-50 text-purple-600' },
  { symbol: '\u0650\u064A', nameAr: 'مد بالياء', nameEn: 'Mad Ya', color: 'bg-pink-50 text-pink-600' },
];

const TANWEEN = [
  { symbol: '\u064B', nameAr: 'تنوين فتح', nameEn: 'Tanween Fath', color: 'bg-orange-50 text-orange-600' },
  { symbol: '\u064C', nameAr: 'تنوين ضم', nameEn: 'Tanween Damm', color: 'bg-rose-50 text-rose-600' },
  { symbol: '\u064D', nameAr: 'تنوين كسر', nameEn: 'Tanween Kasr', color: 'bg-teal-50 text-teal-600' },
];

const STRINGS = {
  ar: {
    title: 'الحروف الهجائية',
    subtitle: 'تعلم الحروف العربية',
    instr: 'اختر حرفاً ثم مرر فوق الحركات لسماع الصوت',
    lang: 'English',
    harakatTitle: 'الحركات القصيرة',
    shaddaTitle: 'الشدة',
    madTitle: 'المدود الطويلة',
    tanweenTitle: 'التنوين',
    shapesTitle: 'أشكال الحرف',
    quotaError: 'تجاوزت حصة النطق حالياً.',
    downloadBtn: 'معاينة ورقة العمل',
    uploadBtn: 'رفع الواجب',
    verifyTitle: 'تدقيق كتابة الحرف',
    passed: 'تهانينا! لقد أتقنت الحرف بنجاح.',
    failed: 'محاولة جيدة، حاول تحسين كتابتك واتباع الملاحظات.',
    masteredTitle: 'حروف متقنة',
    practiceBtn: 'تدرب على الرسم',
    soundLabBtn: 'مختبر الأصوات',
    auditGameBtn: 'التمييز السمعي',
    clear: 'مسح',
    close: 'إغلاق',
    record: 'تسجيل',
    stop: 'إيقاف',
    play: 'تشغيل',
    compare: 'قارن نطقك',
    retry: 'حاول مرة أخرى',
    checkMe: 'صحح لي',
    followShape: 'تتبع شكل الحرف بدقة',
    isolated: 'منفصل',
    initial: 'أول الكلمة',
    medial: 'وسط الكلمة',
    final: 'آخر الكلمة',
    gameTitle: 'تحدي التمييز السمعي',
    gameInstr: 'استمع جيداً واختر الحرف مع الحركة الصحيحة',
    correct: 'إجابة صحيحة!',
    wrong: 'حاول مرة أخرى',
    score: 'النقاط',
    welcome: 'مرحباً بك في مختبر الحروف',
    welcomeSub: 'اختر حرفاً وابدأ التدريب',
    auditoryComplete: 'إنجاز رائع!',
    auditoryCompleteSub: 'لقد أتممت جميع مستويات التمييز لـ ',
    auditoryCompleteBtn: 'إعادة التحدي',
    similarSounds: 'الأصوات المتشابهة',
    wsSection1: 'أولاً: أشكال الحروف',
    wsSection1En: 'I. Letter Shapes',
    wsSection2: 'ثانياً: الحرف مع الحركات القصيرة',
    wsSection2En: 'II. Short Vowels',
    wsSection3: 'ثالثاً: الحرف مع الشدة',
    wsSection3En: 'III. Shadda',
    wsSection4: 'رابعاً: الحرف مع المدود الطويلة',
    wsSection4En: 'IV. Long Vowels',
    wsSection5: 'خامساً: الحرف مع التنوين',
    wsSection5En: 'V. Tanween',
    learnerName: 'الاسم:',
    date: 'التاريخ:',
    letterHeading: 'حرف',
    worksheetTitle: 'ورقة عمل',
    wordDiscrimBtn: 'تمييز الحرف في الكلمات',
    wordDiscrimTitle: 'تحدي تمييز الحرف من الكلمات',
    wordDiscrimInstr: 'اختر الكلمات التي تحتوي على الحرف أو حدد موقعه داخل الكلمة',
    findWordMode: 'تمييز الكلمات',
    posMode: 'موقع الحرف',
    doesContain: 'اختر الكلمات التي تحتوي على حرف',
    wherePos: 'أين يقع الحرف المستهدف في هذه الكلمة؟',
    containsTarget: 'ممتاز! الكلمة تحتوي على الحرف',
    doesNotContain: 'هذه الكلمة لا تحتوي على الحرف',
    correctPos: 'إجابة صحيحة!',
    wrongPos: 'حاول مجدداً',
    posInitial: 'بداية الكلمة (أولها)',
    posMedial: 'وسط الكلمة',
    posFinal: 'آخر الكلمة (نهايتها)',
    nextQuestion: 'تحدي جديد',
    letterTashkeelBtn: 'تشكيل الحرف في الكلمة',
    letterTashkeelTitle: 'تحدي تشكيل الحرف داخل الكلمة',
    tashkeelFatha: 'حركة الفتحة ( َ )',
    tashkeelDamma: 'حركة الضمة ( ُ )',
    tashkeelKasra: 'حركة الكسرة ( ِ )',
    tashkeelSukoon: 'حركة السكون ( ْ )',
    tashkeelChallenge: 'التحدي الشامل للتشكيل',
    tashkeelComplete: 'ممتاز! أتقنت تشكيل الحرف في الكلمات',
    tashkeelCompleteSub: 'أكملت جميع مستويات التشكيل لـ '
  },
  en: {
    title: 'Arabic Alphabet',
    subtitle: "Arabic Letters Mastery",
    instr: 'Select a letter, then hover over diacritics to hear',
    lang: 'العربية',
    harakatTitle: 'Short Vowels',
    shaddaTitle: 'Shadda',
    madTitle: 'Long Vowels (Mad)',
    tanweenTitle: 'Nunation (Tanween)',
    shapesTitle: 'Letter Shapes',
    quotaError: 'Speech quota exceeded.',
    downloadBtn: 'Preview Worksheet',
    uploadBtn: 'Upload Homework',
    verifyTitle: 'Verify Handwriting',
    passed: 'Congratulations! You have mastered the letter.',
    failed: 'Good try! Keep practicing and follow the feedback.',
    masteredTitle: 'Mastered Letters',
    practiceBtn: 'Practice Drawing',
    soundLabBtn: 'Sound Lab',
    auditGameBtn: 'Auditory lab',
    clear: 'Clear',
    close: 'Close',
    record: 'Record',
    stop: 'Stop',
    play: 'Play',
    compare: 'Compare',
    retry: 'Retry',
    checkMe: 'Check Me',
    followShape: 'Follow the shape precisely',
    isolated: 'Isolated',
    initial: 'Initial',
    medial: 'Medial',
    final: 'Final',
    gameTitle: 'Auditory Challenge',
    gameInstr: 'Listen carefully and select the correct diacritic',
    correct: 'Correct Answer!',
    wrong: 'Try Again',
    score: 'Points',
    welcome: 'Welcome to the Letters Lab',
    welcomeSub: 'Select a letter and start training',
    auditoryComplete: 'Great Job!',
    auditoryCompleteSub: 'Completed all levels for ',
    auditoryCompleteBtn: 'Re-Challenge',
    similarSounds: 'Similar Sounds',
    wsSection1: 'I. Letter Shapes',
    wsSection1En: 'I. Letter Shapes',
    wsSection2: 'II. Short Vowels',
    wsSection2En: 'II. Short Vowels',
    wsSection3: 'III. Shadda',
    wsSection3En: 'III. Shadda',
    wsSection4: 'IV. Long Vowels',
    wsSection4En: 'IV. Long Vowels',
    wsSection5: 'V. Tanween',
    wsSection5En: 'V. Tanween',
    learnerName: 'Name:',
    date: 'Date:',
    letterHeading: 'Letter',
    worksheetTitle: 'Worksheet',
    wordDiscrimBtn: 'Letter in Words',
    wordDiscrimTitle: 'Letter Position & Word Discrimination',
    wordDiscrimInstr: 'Identify words containing the target letter or determine its position',
    findWordMode: 'Find Words',
    posMode: 'Letter Position',
    doesContain: 'Select words containing the letter',
    wherePos: 'Where is the target letter in this word?',
    containsTarget: 'Great! Word contains the letter',
    doesNotContain: 'Word does not contain the letter',
    correctPos: 'Correct Position!',
    wrongPos: 'Try again',
    posInitial: 'Initial (Beginning)',
    posMedial: 'Medial (Middle)',
    posFinal: 'Final (End)',
    nextQuestion: 'Next Challenge',
    letterTashkeelBtn: 'Diacritics in Words',
    letterTashkeelTitle: 'Letter Diacritics in Words',
    tashkeelFatha: 'Fatha Diacritic ( َ )',
    tashkeelDamma: 'Damma Diacritic ( ُ )',
    tashkeelKasra: 'Kasra Diacritic ( ِ )',
    tashkeelSukoon: 'Sukoon Diacritic ( ْ )',
    tashkeelChallenge: 'Comprehensive Diacritics Challenge',
    tashkeelComplete: 'Great Job! Mastered Letter Diacritics in Words',
    tashkeelCompleteSub: 'Completed all diacritics levels for '
  }
};

const TracingBoard: React.FC<{ char: string, shapes: any, t: any, lang: string, onMastered?: (stars: number) => void }> = ({ char, shapes, t, lang, onMastered }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [activeShape, setActiveShape] = React.useState<'isolated' | 'initial' | 'medial' | 'final'>('isolated');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [aiFeedback, setAiFeedback] = React.useState<{ stars: number, message: string, isCorrect: boolean } | null>(null);
  
  // Audio refs
  const drawSound = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    drawSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    drawSound.current.loop = true;
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Classic brush style by default
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#2563eb';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAiFeedback(null);
  }, [activeShape]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    if (drawSound.current) drawSound.current.play().catch(() => {});
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (drawSound.current) {
      drawSound.current.pause();
      drawSound.current.currentTime = 0;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setAiFeedback(null);
  };

  const handleCheckWork = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsAnalyzing(true);
    setAiFeedback(null);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const base64Data = dataUrl.split(',')[1];

      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: `Analyze this handwritten Arabic letter. The target letter is "${char}" in its ${activeShape} form. 
              1. Rate the accuracy from 1 to 3 stars.
              2. Determine if it is correctly written (true/false).
              3. Provide a very short encouraging feedback message in ${lang === 'ar' ? 'Arabic' : 'English'}.
              Return ONLY a JSON object with keys: stars (number), isCorrect (boolean), message (string).` },
              { inlineData: { mimeType: "image/png", data: base64Data } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              stars: { type: Type.NUMBER },
              isCorrect: { type: Type.BOOLEAN },
              message: { type: Type.STRING }
            },
            required: ["stars", "isCorrect", "message"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setAiFeedback(result);
      
      if (result.isCorrect) {
        if (onMastered) onMastered(result.stars);
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        audio.play().catch(() => {});
      } else {
        // feedback handled by overlay
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const shapeOptions = [
    { id: 'isolated', label: t.isolated || 'منفصل' },
    { id: 'initial', label: t.initial || 'أول الكلمة' },
    { id: 'medial', label: t.medial || 'وسط الكلمة' },
    { id: 'final', label: t.final || 'آخر الكلمة' }
  ];

  return (
    <div className="flex flex-col w-full h-full no-print">
      <div className="flex flex-1 min-h-0 relative">
        {/* Left Controls */}
        <div className="w-28 border-l border-slate-50 p-3 flex flex-col items-center justify-center gap-4 bg-slate-50/30">
          <div className="w-full flex flex-col gap-3">
            {shapeOptions.slice(0, 2).map(opt => (
              <button
                key={opt.id}
                onClick={() => setActiveShape(opt.id as any)}
                className={`p-2 rounded-2xl text-center transition-all border-2 ${activeShape === opt.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'}`}
              >
                <span className="text-2xl block mb-1 arabic-font">{(shapes as any)[opt.id]}</span>
                <span className="text-[8px] font-black uppercase block">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center Canvas - Wide Rectangle */}
        <div className="flex-1 relative bg-white flex items-center justify-center p-2 cursor-crosshair touch-none overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
            <div className="text-center opacity-10 relative">
              <span className="text-[120px] font-black arabic-font text-slate-900">
                {(shapes as any)[activeShape]}
              </span>
            </div>
            <p className="text-[8px] font-bold text-blue-600/30 uppercase tracking-[0.4em] mt-[-8px]">
              {lang === 'ar' ? `شكل ${t[activeShape]}` : `${t[activeShape]} form`}
            </p>
          </div>
          
          <canvas
            ref={canvasRef}
            width={850}
            height={220}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
            className="relative z-10 w-full h-full max-w-[850px] max-h-[220px]"
          />

          {/* AI Feedback Overlay */}
          {aiFeedback && (
            <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
              <div className="flex gap-2 mb-4">
                {[1, 2, 3].map(s => (
                  <Star key={s} size={32} fill={s <= aiFeedback.stars ? "#f59e0b" : "none"} className={s <= aiFeedback.stars ? "text-amber-500 animate-bounce" : "text-slate-200"} style={{ animationDelay: `${s * 100}ms` }} />
                ))}
              </div>
              <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-xl mb-4 ${aiFeedback.isCorrect ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                {aiFeedback.isCorrect ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                <span className="text-lg font-black arabic-font">{aiFeedback.message}</span>
              </div>
              <button onClick={() => { clear(); setAiFeedback(null); }} className="px-8 py-2 bg-slate-900 text-white rounded-xl font-black text-xs hover:scale-105 transition-all">
                {t.retry}
              </button>
            </div>
          )}

          {isAnalyzing && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="relative">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" size={20} />
              </div>
              <p className="mt-4 text-xs font-black text-blue-600 uppercase tracking-widest animate-pulse">AI Analyzing...</p>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="w-28 border-r border-slate-50 p-3 flex flex-col justify-center gap-3 bg-slate-50/30">
          {shapeOptions.slice(2, 4).map(opt => (
            <button
              key={opt.id}
              onClick={() => setActiveShape(opt.id as any)}
              className={`p-2 rounded-2xl text-center transition-all border-2 ${activeShape === opt.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'}`}
            >
              <span className="text-2xl block mb-1 arabic-font">{(shapes as any)[opt.id]}</span>
              <span className="text-[8px] font-black uppercase block">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-2 bg-blue-50 flex items-center justify-between px-6 shrink-0 border-t border-blue-100">
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-bold text-blue-600 arabic-font">
            {t.followShape}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={clear} className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-black text-[10px] hover:bg-slate-100 transition-all flex items-center gap-2">
            <RefreshCcw size={12} /> {t.clear}
          </button>
          <button 
            onClick={handleCheckWork}
            disabled={isAnalyzing}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] flex items-center gap-2 shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <BrainCircuit size={14} />
            {t.checkMe}
          </button>
        </div>
      </div>
    </div>
  );
};

const SoundLab: React.FC<{ char: string, t: any, lang: string, onSpeak: (text: string, display: string) => void }> = ({ char, t, lang, onSpeak }) => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);

  const startRecording = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser does not support audio recording.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try to find a supported mime type
      const mimeTypes = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/aac'];
      const supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
      
      const recorder = new MediaRecorder(stream, supportedType ? { mimeType: supportedType } : {});
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
      };
      
      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Recording failed:", err);
      setError(err.message || "Failed to start recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 animate-in slide-in-from-bottom-6 duration-500">
      {error && (
        <div className="w-full p-2 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-[10px] font-bold">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {HARAKAT.slice(0, 3).map((h) => {
          const combined = char + h.symbol;
          return (
            <button
              key={h.symbol}
              onClick={() => onSpeak(combined, combined)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-transparent hover:border-indigo-500 transition-all shadow-sm hover:shadow-md ${h.color}`}
            >
              <span className="text-3xl font-black arabic-font mb-1">{combined}</span>
              <span className="text-[8px] font-black uppercase opacity-60">{(t as any || lang === 'ar') ? h.nameAr : h.nameEn}</span>
              <Volume2 size={14} className="mt-2" />
            </button>
          );
        })}
      </div>

      <div className="w-full h-px bg-slate-100" />

      <div className="flex flex-col items-center space-y-2 w-full">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.compare}</p>
        <div className="flex gap-3">
          {!isRecording ? (
            <button 
              onClick={startRecording}
              className="px-6 py-2 bg-rose-500 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-xl shadow-rose-100 hover:scale-105 transition-all"
            >
              <Mic size={16} /> {t.record}
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-xl animate-pulse"
            >
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" /> {t.stop}
            </button>
          )}

          {audioUrl && (
            <button 
              onClick={() => new Audio(audioUrl).play()}
              className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-xl shadow-emerald-100 hover:scale-105 transition-all"
            >
              <Play size={16} fill="currentColor" /> {t.play}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const getCombinedChar = (base: string, symbol: string) => {
  const cleanBase = base.replace(/[\u0640\s]/g, '').trim();
  if (cleanBase === 'أ') {
    if (symbol === '\u064E\u0627') return '\u0622\u064E';
    if (symbol === '\u0650\u064A') return '\u0625\u0650\u064A';
    if (symbol === '\u064D') return '\u0625\u064D';
    if (symbol === '\u0650') return '\u0625\u0650';
  }
  if (cleanBase === 'ل') {
    if (symbol === '\u064E\u0627') return '\u0644\u0627\u064E'; 
    if (symbol === '\u064B') return '\u0644\u0627\u064B'; 
  }
  if (symbol === '\u064B' && cleanBase !== 'أ') return cleanBase + '\u064B\u0627';
  return cleanBase + symbol;
};

const SIMILAR_SOUNDS: Record<string, string[]> = {
  'أ': ['ع', 'هـ', 'ق'],
  'ب': ['ف', 'م', 'و'],
  'ت': ['ط', 'د', 'ت'],
  'ث': ['س', 'ص', 'ذ'],
  'ج': ['ش', 'ز', 'ك'],
  'ح': ['هـ', 'خ', 'ع'],
  'خ': ['ح', 'غ', 'ق'],
  'د': ['ض', 'ت', 'ذ'],
  'ذ': ['ظ', 'ز', 'ث'],
  'ر': ['ل', 'ز', 'ن'],
  'ز': ['ذ', 'ر', 'س'],
  'س': ['ص', 'ث', 'ز'],
  'ش': ['ج', 'س', 'ص'],
  'ص': ['س', 'ض', 'ث'],
  'ض': ['د', 'ص', 'ط'],
  'ط': ['ت', 'ض', 'ق'],
  'ظ': ['ذ', 'ض', 'ز'],
  'ع': ['أ', 'ح', 'غ'],
  'غ': ['خ', 'ع', 'ق'],
  'ف': ['ب', 'و', 'ك'],
  'ق': ['ك', 'ط', 'غ'],
  'ك': ['ق', 'ج', 'خ'],
  'ل': ['ر', 'ن', 'ي'],
  'م': ['ن', 'ب', 'و'],
  'ن': ['م', 'ل', 'ي'],
  'هـ': ['ح', 'أ', 'ع'],
  'و': ['ف', 'ب', 'م'],
  'ي': ['أ', 'ل', 'ن']
};

const AuditoryGame: React.FC<{ char: string, t: any, onSpeak: (text: string, display: string) => void }> = ({ char, t, onSpeak }) => {
  const [level, setLevel] = React.useState(1);
  const [currentQuestion, setCurrentQuestion] = React.useState<any>(null);
  const [options, setOptions] = React.useState<any[]>([]);
  const [feedback, setFeedback] = React.useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);

  const generateQuestion = (currentLevel: number) => {
    let target = '';
    let opts: any[] = [];
    const cleanChar = char.replace('ـ', '').trim();

    switch(currentLevel) {
      case 1: // Short Vowels
        const h = HARAKAT[Math.floor(Math.random() * 3)]; // First 3 are most common
        target = getCombinedChar(cleanChar, h.symbol);
        opts = HARAKAT.slice(0, 3).map(v => ({ label: getCombinedChar(cleanChar, v.symbol), isCorrect: v.symbol === h.symbol }));
        break;
      case 2: // Shadda
        const s = SHADDA_VARIATIONS[Math.floor(Math.random() * SHADDA_VARIATIONS.length)];
        target = getCombinedChar(cleanChar, s.symbol);
        opts = SHADDA_VARIATIONS.map(v => ({ label: getCombinedChar(cleanChar, v.symbol), isCorrect: v.symbol === s.symbol }));
        break;
      case 3: // Long Vowels
        const m = MAD_VOWELS[Math.floor(Math.random() * MAD_VOWELS.length)];
        target = getCombinedChar(cleanChar, m.symbol);
        opts = MAD_VOWELS.map(v => ({ label: getCombinedChar(cleanChar, v.symbol), isCorrect: v.symbol === m.symbol }));
        break;
      case 4: // Tanween
        const tn = TANWEEN[Math.floor(Math.random() * TANWEEN.length)];
        target = getCombinedChar(cleanChar, tn.symbol);
        opts = TANWEEN.map(v => ({ label: getCombinedChar(cleanChar, v.symbol), isCorrect: v.symbol === tn.symbol }));
        break;
      case 5: // Similar Sounds
        target = cleanChar;
        const similar = SIMILAR_SOUNDS[cleanChar] || [];
        const decoys = [...similar];
        while(decoys.length < 3) {
          const r = ALPHABET[Math.floor(Math.random() * ALPHABET.length)].char;
          if (r !== cleanChar && !decoys.includes(r)) decoys.push(r);
        }
        opts = [cleanChar, ...decoys.slice(0, 3)].map(c => ({ label: c, isCorrect: c === cleanChar }));
        break;
    }

    setCurrentQuestion(target);
    setOptions(opts.sort(() => Math.random() - 0.5));
    setFeedback(null);
    
    setTimeout(() => {
      onSpeak(target, 'game');
    }, 600);
  };

  React.useEffect(() => {
    setLevel(1);
    setIsComplete(false);
    generateQuestion(1);
  }, [char]);

  const handleAnswer = (opt: any) => {
    if (feedback) return;
    if (opt.isCorrect) {
      setFeedback('correct');
      setScore(s => s + 20);
      
      setTimeout(() => {
        if (level < 5) {
          const nextLevel = level + 1;
          setLevel(nextLevel);
          generateQuestion(nextLevel);
        } else {
          setIsComplete(true);
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const getLevelName = (lvl: number) => {
    switch(lvl) {
      case 1: return t.harakatTitle;
      case 2: return t.shaddaTitle;
      case 3: return t.madTitle;
      case 4: return t.tanweenTitle;
      case 5: return t.similarSounds;
      default: return "";
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-2 animate-in zoom-in duration-500">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
          <Award size={24} className="animate-bounce" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-black text-slate-800 arabic-font leading-tight">{t.auditoryComplete}</h3>
          <p className="text-slate-400 font-bold uppercase text-[6px] tracking-widest mt-0.5">{t.auditoryCompleteSub} {char}</p>
        </div>
        <button 
          onClick={() => { setLevel(1); setIsComplete(false); generateQuestion(1); }}
          className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-black text-[8px] uppercase tracking-widest hover:scale-105 transition-all shadow-md active:scale-95"
        >
          {t.auditoryCompleteBtn}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2 animate-in zoom-in duration-500 w-full max-w-sm mx-auto py-1">
      <div className="flex gap-1 mb-0.5">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div 
            key={lvl} 
            className={`w-1 h-1 rounded-full transition-all duration-500 ${lvl < level ? 'bg-emerald-500' : lvl === level ? 'bg-blue-600 scale-125 shadow-[0_0_8px_rgba(37,99,235,1)] ring-1 ring-blue-400' : 'bg-slate-200'}`}
          />
        ))}
      </div>

      <div className="text-center mb-0.5">
        <h2 className="text-base font-black text-slate-800 arabic-font">{getLevelName(level)}</h2>
      </div>

      <div className="relative group mb-1">
        <div className="absolute inset-0 bg-blue-100 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
        <button 
          onClick={() => onSpeak(currentQuestion, 'game')}
          className="w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-50 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all active:scale-95 z-10 relative group"
        >
          <Volume2 size={20} className="text-blue-600 group-hover:animate-pulse" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 w-full px-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className={`py-2 md:py-2.5 rounded-xl border-2 text-lg md:text-xl font-black arabic-font transition-all shadow-sm
              ${feedback === 'correct' && opt.isCorrect ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200 scale-105' : 
                feedback === 'wrong' && opt.label === currentQuestion ? 'border-emerald-500 text-emerald-600 bg-emerald-50' :
                feedback === 'wrong' && !opt.isCorrect ? 'bg-red-50 border-red-200 text-red-600 opacity-50' :
                'bg-white border-slate-100 hover:border-blue-300 text-slate-700 hover:bg-blue-50 active:scale-95'}
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="h-8 flex items-center justify-center">
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-3 py-1 rounded-lg font-black text-[10px] arabic-font shadow-md flex items-center gap-2 ${feedback === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
          >
            {feedback === 'correct' ? (
              <><CheckCircle size={14} /> {t.correct}</>
            ) : (
              <><XCircle size={14} /> {t.wrong}</>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const LETTER_WORDS: Record<string, {
  targetWords: { word: string, position: 'initial' | 'medial' | 'final', meaningAr: string, meaningEn: string }[],
  distractors: { word: string, meaningAr: string, meaningEn: string }[]
}> = {
  'أ': {
    targetWords: [
      { word: 'أَسَد', position: 'initial', meaningAr: 'حيوان قوي', meaningEn: 'Lion' },
      { word: 'أَرْنَب', position: 'initial', meaningAr: 'حيوان سريع', meaningEn: 'Rabbit' },
      { word: 'سَأَلَ', position: 'medial', meaningAr: 'استفسر', meaningEn: 'Asked' },
      { word: 'قَرَأَ', position: 'final', meaningAr: 'تلا الكتاب', meaningEn: 'Read' },
    ],
    distractors: [
      { word: 'كِتَاب', meaningAr: 'مؤلَّف', meaningEn: 'Book' },
      { word: 'شَمْس', meaningAr: 'نجم ساطع', meaningEn: 'Sun' },
      { word: 'قَمَر', meaningAr: 'جرم سماوي', meaningEn: 'Moon' }
    ]
  },
  'ب': {
    targetWords: [
      { word: 'بَيْت', position: 'initial', meaningAr: 'منزل', meaningEn: 'House' },
      { word: 'جَبَل', position: 'medial', meaningAr: 'مرتفع صخري', meaningEn: 'Mountain' },
      { word: 'كِتَاب', position: 'final', meaningAr: 'دفتر وقراءة', meaningEn: 'Book' },
      { word: 'بَاب', position: 'initial', meaningAr: 'مدخل', meaningEn: 'Door' }
    ],
    distractors: [
      { word: 'قَلَم', meaningAr: 'أداة كتابة', meaningEn: 'Pen' },
      { word: 'سَمَاء', meaningAr: 'الفضاء الأعلى', meaningEn: 'Sky' },
      { word: 'زَهْرَة', meaningAr: 'وردة جميلة', meaningEn: 'Flower' }
    ]
  },
  'ت': {
    targetWords: [
      { word: 'تُفَّاح', position: 'initial', meaningAr: 'فاكهة لديدة', meaningEn: 'Apple' },
      { word: 'تِمْسَاح', position: 'initial', meaningAr: 'حيوان مائي', meaningEn: 'Crocodile' },
      { word: 'مَكْتَب', position: 'medial', meaningAr: 'طاولة عمل', meaningEn: 'Desk' },
      { word: 'بَيْت', position: 'final', meaningAr: 'مسكن', meaningEn: 'House' }
    ],
    distractors: [
      { word: 'جَمَل', meaningAr: 'سفينة الصحراء', meaningEn: 'Camel' },
      { word: 'قَمَر', meaningAr: 'نور الليل', meaningEn: 'Moon' },
      { word: 'مَاء', meaningAr: 'سائل الحياة', meaningEn: 'Water' }
    ]
  },
  'ث': {
    targetWords: [
      { word: 'ثَعْلَب', position: 'initial', meaningAr: 'حيوان ميكار', meaningEn: 'Fox' },
      { word: 'ثَوْم', position: 'initial', meaningAr: 'نبات عشبي', meaningEn: 'Garlic' },
      { word: 'مَثَل', position: 'medial', meaningAr: 'حكمة', meaningEn: 'Example' },
      { word: 'بَحْث', position: 'final', meaningAr: 'دراسة', meaningEn: 'Research' }
    ],
    distractors: [
      { word: 'شَجَرَة', meaningAr: 'نبات كبير', meaningEn: 'Tree' },
      { word: 'طَائِر', meaningAr: 'حيوان يطير', meaningEn: 'Bird' },
      { word: 'بَحْر', meaningAr: 'ماء مالح', meaningEn: 'Sea' }
    ]
  },
  'ج': {
    targetWords: [
      { word: 'جَمَل', position: 'initial', meaningAr: 'سفينة الصحراء', meaningEn: 'Camel' },
      { word: 'جَزَر', position: 'initial', meaningAr: 'خضار مفيد', meaningEn: 'Carrot' },
      { word: 'شَجَرَة', position: 'medial', meaningAr: 'نبات كبير', meaningEn: 'Tree' },
      { word: 'ثَلْج', position: 'final', meaningAr: 'ماء متجمد', meaningEn: 'Snow' }
    ],
    distractors: [
      { word: 'شَمْس', meaningAr: 'ضياء', meaningEn: 'Sun' },
      { word: 'وَرْدَة', meaningAr: 'زهرة', meaningEn: 'Rose' },
      { word: 'قَلَم', meaningAr: 'كتابة', meaningEn: 'Pen' }
    ]
  },
  'ح': {
    targetWords: [
      { word: 'حِصَان', position: 'initial', meaningAr: 'حيوان أصيل', meaningEn: 'Horse' },
      { word: 'حَقِيبَة', position: 'initial', meaningAr: 'حقيبة مدرسية', meaningEn: 'Bag' },
      { word: 'بَحْر', position: 'medial', meaningAr: 'ماء مالح', meaningEn: 'Sea' },
      { word: 'تُفَّاح', position: 'final', meaningAr: 'فاكهة', meaningEn: 'Apple' }
    ],
    distractors: [
      { word: 'شَمْس', meaningAr: 'كوكب', meaningEn: 'Sun' },
      { word: 'بَيْت', meaningAr: 'منزل', meaningEn: 'House' },
      { word: 'نَجْم', meaningAr: 'في السماء', meaningEn: 'Star' }
    ]
  },
  'خ': {
    targetWords: [
      { word: 'خُرُوف', position: 'initial', meaningAr: 'حيوان أليف', meaningEn: 'Sheep' },
      { word: 'خُبْز', position: 'initial', meaningAr: 'طعام يومي', meaningEn: 'Bread' },
      { word: 'نَخْلَة', position: 'medial', meaningAr: 'شجرة التمر', meaningEn: 'Palm Tree' },
      { word: 'مَطْبَخ', position: 'final', meaningAr: 'مكان الطبخ', meaningEn: 'Kitchen' }
    ],
    distractors: [
      { word: 'قَلَم', meaningAr: 'أداة', meaningEn: 'Pen' },
      { word: 'سَيَّارَة', meaningAr: 'مركبة', meaningEn: 'Car' },
      { word: 'مَدْرَسَة', meaningAr: 'مكان التعلم', meaningEn: 'School' }
    ]
  },
  'د': {
    targetWords: [
      { word: 'دُبّ', position: 'initial', meaningAr: 'حيوان ضخم', meaningEn: 'Bear' },
      { word: 'دَرَّاجَة', position: 'initial', meaningAr: 'مركبة خفيفة', meaningEn: 'Bicycle' },
      { word: 'مَدْرَسَة', position: 'medial', meaningAr: 'صرح تعليمي', meaningEn: 'School' },
      { word: 'وَرْدَة', position: 'final', meaningAr: 'زهرة معطرة', meaningEn: 'Rose' }
    ],
    distractors: [
      { word: 'بَحْر', meaningAr: 'ماء', meaningEn: 'Sea' },
      { word: 'قَمَر', meaningAr: 'في السماء', meaningEn: 'Moon' },
      { word: 'كِتَاب', meaningAr: 'قراءة', meaningEn: 'Book' }
    ]
  },
  'ذ': {
    targetWords: [
      { word: 'ذِئْب', position: 'initial', meaningAr: 'حيوان بري', meaningEn: 'Wolf' },
      { word: 'ذُرَة', position: 'initial', meaningAr: 'نبات أصفر', meaningEn: 'Corn' },
      { word: 'جَذْر', position: 'medial', meaningAr: 'أسفل الشجرة', meaningEn: 'Root' },
      { word: 'أُذُن', position: 'final', meaningAr: 'عضو السمع', meaningEn: 'Ear' }
    ],
    distractors: [
      { word: 'شَمْس', meaningAr: 'نجم', meaningEn: 'Sun' },
      { word: 'بَاب', meaningAr: 'مدخل', meaningEn: 'Door' },
      { word: 'قَلَم', meaningAr: 'كتابة', meaningEn: 'Pen' }
    ]
  },
  'ر': {
    targetWords: [
      { word: 'رَجُل', position: 'initial', meaningAr: 'إنسان بالغ', meaningEn: 'Man' },
      { word: 'رُمَّان', position: 'initial', meaningAr: 'فاكهة حمراء', meaningEn: 'Pomegranate' },
      { word: 'قَمَر', position: 'final', meaningAr: 'جرم منير', meaningEn: 'Moon' },
      { word: 'شَجَرَة', position: 'medial', meaningAr: 'نبات', meaningEn: 'Tree' }
    ],
    distractors: [
      { word: 'بَيْت', meaningAr: 'منزل', meaningEn: 'House' },
      { word: 'سَمَاء', meaningAr: 'فضاء', meaningEn: 'Sky' },
      { word: 'سَمَك', meaningAr: 'حيوان مائي', meaningEn: 'Fish' }
    ]
  },
  'ز': {
    targetWords: [
      { word: 'زَرَافَة', position: 'initial', meaningAr: 'حيوان طويل', meaningEn: 'Giraffe' },
      { word: 'زَهْرَة', position: 'initial', meaningAr: 'وريد جميل', meaningEn: 'Flower' },
      { word: 'مَزْرَعَة', position: 'medial', meaningAr: 'أرض زراعية', meaningEn: 'Farm' },
      { word: 'كَنْز', position: 'final', meaningAr: 'ثروة ثَمينة', meaningEn: 'Treasure' }
    ],
    distractors: [
      { word: 'قَلَم', meaningAr: 'أداة', meaningEn: 'Pen' },
      { word: 'بَحْر', meaningAr: 'ماء', meaningEn: 'Sea' },
      { word: 'كِتَاب', meaningAr: 'قراءة', meaningEn: 'Book' }
    ]
  },
  'س': {
    targetWords: [
      { word: 'سَمَكَة', position: 'initial', meaningAr: 'كائن مائي', meaningEn: 'Fish' },
      { word: 'سَيَّارَة', position: 'initial', meaningAr: 'وسيلة نقل', meaningEn: 'Car' },
      { word: 'مَشْمَس', position: 'medial', meaningAr: 'مكان مشمس', meaningEn: 'Sunny Place' },
      { word: 'شَمْس', position: 'final', meaningAr: 'نجم النهار', meaningEn: 'Sun' }
    ],
    distractors: [
      { word: 'قَمَر', meaningAr: 'نجم', meaningEn: 'Moon' },
      { word: 'جَمَل', meaningAr: 'حيوان', meaningEn: 'Camel' },
      { word: 'بَاب', meaningAr: 'مدخل', meaningEn: 'Door' }
    ]
  },
  'ش': {
    targetWords: [
      { word: 'شَمْس', position: 'initial', meaningAr: 'نجم النهار', meaningEn: 'Sun' },
      { word: 'شَجَرَة', position: 'initial', meaningAr: 'كائن حركي', meaningEn: 'Tree' },
      { word: 'عُشَّاب', position: 'medial', meaningAr: 'نباتات', meaningEn: 'Herbs' },
      { word: 'عُشّ', position: 'final', meaningAr: 'بيت الطائر', meaningEn: 'Nest' }
    ],
    distractors: [
      { word: 'بَيْت', meaningAr: 'منزل', meaningEn: 'House' },
      { word: 'قَلَم', meaningAr: 'كتابة', meaningEn: 'Pen' },
      { word: 'نَهْر', meaningAr: 'ماء جاري', meaningEn: 'River' }
    ]
  },
  'ص': {
    targetWords: [
      { word: 'صَقْر', position: 'initial', meaningAr: 'طائر جارح', meaningEn: 'Falcon' },
      { word: 'صُنْدُوق', position: 'initial', meaningAr: 'وعاء حفظ', meaningEn: 'Box' },
      { word: 'عَصُور', position: 'medial', meaningAr: 'زمن', meaningEn: 'Ages' },
      { word: 'قَفَص', position: 'final', meaningAr: 'بيت الطيور', meaningEn: 'Cage' }
    ],
    distractors: [
      { word: 'سَمَاء', meaningAr: 'فضاء', meaningEn: 'Sky' },
      { word: 'بَحْر', meaningAr: 'ماء', meaningEn: 'Sea' },
      { word: 'وَرْدَة', meaningAr: 'زهرة', meaningEn: 'Rose' }
    ]
  },
  'ض': {
    targetWords: [
      { word: 'ضَفْدَع', position: 'initial', meaningAr: 'حيوان برمائي', meaningEn: 'Frog' },
      { word: 'ضَوْء', position: 'initial', meaningAr: 'نور', meaningEn: 'Light' },
      { word: 'خَضْرَاء', position: 'medial', meaningAr: 'لون النبات', meaningEn: 'Green' },
      { word: 'أَرْض', position: 'final', meaningAr: 'كوكبنا', meaningEn: 'Earth' }
    ],
    distractors: [
      { word: 'شَمْس', meaningAr: 'نجم', meaningEn: 'Sun' },
      { word: 'قَلَم', meaningAr: 'أداة', meaningEn: 'Pen' },
      { word: 'كِتَاب', meaningAr: 'مؤلف', meaningEn: 'Book' }
    ]
  },
  'ط': {
    targetWords: [
      { word: 'طَائِر', position: 'initial', meaningAr: 'حيوان ذو أجنحة', meaningEn: 'Bird' },
      { word: 'طَمَاطِم', position: 'initial', meaningAr: 'خضار أحمر', meaningEn: 'Tomato' },
      { word: 'قِطَّة', position: 'medial', meaningAr: 'حيوان أليف', meaningEn: 'Cat' },
      { word: 'بَطّ', position: 'final', meaningAr: 'طائر مائي', meaningEn: 'Duck' }
    ],
    distractors: [
      { word: 'بَيْت', meaningAr: 'منزل', meaningEn: 'House' },
      { word: 'شَجَرَة', meaningAr: 'نبات', meaningEn: 'Tree' },
      { word: 'سَمَاء', meaningAr: 'فضاء', meaningEn: 'Sky' }
    ]
  },
  'ظ': {
    targetWords: [
      { word: 'ظَبْي', position: 'initial', meaningAr: 'غزال جميل', meaningEn: 'Antelope' },
      { word: 'ظَرْف', position: 'initial', meaningAr: 'وعاء الرسالة', meaningEn: 'Envelope' },
      { word: 'نَظَّارَة', position: 'medial', meaningAr: 'أداة رؤية', meaningEn: 'Glasses' },
      { word: 'حَفِظَ', position: 'final', meaningAr: 'صان الشيء', meaningEn: 'Memorized' }
    ],
    distractors: [
      { word: 'قَلَم', meaningAr: 'كتابة', meaningEn: 'Pen' },
      { word: 'بَحْر', meaningAr: 'ماء', meaningEn: 'Sea' },
      { word: 'جَمَل', meaningAr: 'حيوان', meaningEn: 'Camel' }
    ]
  },
  'ع': {
    targetWords: [
      { word: 'عِنَب', position: 'initial', meaningAr: 'فاكهة حلوة', meaningEn: 'Grapes' },
      { word: 'عَصْفُور', position: 'initial', meaningAr: 'طائر صغير', meaningEn: 'Sparrow' },
      { word: 'مَلْعَب', position: 'medial', meaningAr: 'مكان اللعب', meaningEn: 'Playground' },
      { word: 'شَارِع', position: 'final', meaningAr: 'طريق', meaningEn: 'Street' }
    ],
    distractors: [
      { word: 'شَمْس', meaningAr: 'نجم', meaningEn: 'Sun' },
      { word: 'بَيْت', meaningAr: 'منزل', meaningEn: 'House' },
      { word: 'كِتَاب', meaningAr: 'مؤلف', meaningEn: 'Book' }
    ]
  },
  'غ': {
    targetWords: [
      { word: 'غَزَال', position: 'initial', meaningAr: 'حيوان رشيق', meaningEn: 'Deer' },
      { word: 'غَيْمَة', position: 'initial', meaningAr: 'سحابة في السماء', meaningEn: 'Cloud' },
      { word: 'صَغِير', position: 'medial', meaningAr: 'ليس كبيراً', meaningEn: 'Small' },
      { word: 'دِمَاغ', position: 'final', meaningAr: 'عضو التفكير', meaningEn: 'Brain' }
    ],
    distractors: [
      { word: 'قَلَم', meaningAr: 'أداة', meaningEn: 'Pen' },
      { word: 'شَجَرَة', meaningAr: 'نبات', meaningEn: 'Tree' },
      { word: 'بَحْر', meaningAr: 'ماء', meaningEn: 'Sea' }
    ]
  },
  'ف': {
    targetWords: [
      { word: 'فِيل', position: 'initial', meaningAr: 'حيوان ضخم', meaningEn: 'Elephant' },
      { word: 'فَرَاشَة', position: 'initial', meaningAr: 'حشرة ملونة', meaningEn: 'Butterfly' },
      { word: 'تُفَّاح', position: 'medial', meaningAr: 'فاكهة', meaningEn: 'Apple' },
      { word: 'سَقْف', position: 'final', meaningAr: 'أعلى الغرفة', meaningEn: 'Ceiling' }
    ],
    distractors: [
      { word: 'جَمَل', meaningAr: 'حيوان', meaningEn: 'Camel' },
      { word: 'شَمْس', meaningAr: 'نجم', meaningEn: 'Sun' },
      { word: 'كِتَاب', meaningAr: 'قراءة', meaningEn: 'Book' }
    ]
  },
  'ق': {
    targetWords: [
      { word: 'قَلَم', position: 'initial', meaningAr: 'أداة للكتابة', meaningEn: 'Pen' },
      { word: 'قَمَر', position: 'initial', meaningAr: 'جرم سماوي منير', meaningEn: 'Moon' },
      { word: 'صَقْر', position: 'medial', meaningAr: 'طائر جارح', meaningEn: 'Falcon' },
      { word: 'سُوق', position: 'final', meaningAr: 'مكان التسوق', meaningEn: 'Market' }
    ],
    distractors: [
      { word: 'بَيْت', meaningAr: 'منزل', meaningEn: 'House' },
      { word: 'شَجَرَة', meaningAr: 'نبات', meaningEn: 'Tree' },
      { word: 'مَاء', meaningAr: 'سائل', meaningEn: 'Water' }
    ]
  },
  'ك': {
    targetWords: [
      { word: 'كِتَاب', position: 'initial', meaningAr: 'مؤلَّف من صفحات', meaningEn: 'Book' },
      { word: 'كَلْب', position: 'initial', meaningAr: 'حيوان أليف', meaningEn: 'Dog' },
      { word: 'سَمَكَة', position: 'medial', meaningAr: 'حيوان مائي', meaningEn: 'Fish' },
      { word: 'مَلِك', position: 'final', meaningAr: 'حاكم المملكة', meaningEn: 'King' }
    ],
    distractors: [
      { word: 'شَمْس', meaningAr: 'نجم', meaningEn: 'Sun' },
      { word: 'بَاب', meaningAr: 'مدخل', meaningEn: 'Door' },
      { word: 'جَبَل', meaningAr: 'مرتفع', meaningEn: 'Mountain' }
    ]
  },
  'ل': {
    targetWords: [
      { word: 'لَيْمُون', position: 'initial', meaningAr: 'فاكهة حامضة', meaningEn: 'Lemon' },
      { word: 'لَعِبَ', position: 'initial', meaningAr: 'مارس النشاط', meaningEn: 'Played' },
      { word: 'قَلَم', position: 'medial', meaningAr: 'أداة خط', meaningEn: 'Pen' },
      { word: 'جَمَل', position: 'final', meaningAr: 'حيوان الصحراء', meaningEn: 'Camel' }
    ],
    distractors: [
      { word: 'بَيْت', meaningAr: 'منزل', meaningEn: 'House' },
      { word: 'شَمْس', meaningAr: 'نجم', meaningEn: 'Sun' },
      { word: 'وَرْدَة', meaningAr: 'زهرة', meaningEn: 'Rose' }
    ]
  },
  'م': {
    targetWords: [
      { word: 'مَادَّة', position: 'initial', meaningAr: 'علم وتدريس', meaningEn: 'Subject' },
      { word: 'مَوْز', position: 'initial', meaningAr: 'فاكهة صفراء', meaningEn: 'Banana' },
      { word: 'شَمْس', position: 'medial', meaningAr: 'نجم النهار', meaningEn: 'Sun' },
      { word: 'قَلَم', position: 'final', meaningAr: 'أداة كتابة', meaningEn: 'Pen' }
    ],
    distractors: [
      { word: 'بَيْت', meaningAr: 'منزل', meaningEn: 'House' },
      { word: 'شَجَرَة', meaningAr: 'نبات', meaningEn: 'Tree' },
      { word: 'نَهْر', meaningAr: 'ماء جاري', meaningEn: 'River' }
    ]
  },
  'ن': {
    targetWords: [
      { word: 'نَجْم', position: 'initial', meaningAr: 'جرم ساطع', meaningEn: 'Star' },
      { word: 'نَحْلَة', position: 'initial', meaningAr: 'حشرة تصنع العسل', meaningEn: 'Bee' },
      { word: 'عِنَب', position: 'medial', meaningAr: 'فاكهة', meaningEn: 'Grapes' },
      { word: 'عَيْن', position: 'final', meaningAr: 'عضو البصر', meaningEn: 'Eye' }
    ],
    distractors: [
      { word: 'قَلَم', meaningAr: 'أداة', meaningEn: 'Pen' },
      { word: 'جَمَل', meaningAr: 'حيوان', meaningEn: 'Camel' },
      { word: 'بَاب', meaningAr: 'مدخل', meaningEn: 'Door' }
    ]
  },
  'هـ': {
    targetWords: [
      { word: 'هَدِيَّة', position: 'initial', meaningAr: 'عطاء وإكرام', meaningEn: 'Gift' },
      { word: 'هَرَم', position: 'initial', meaningAr: 'بناء تاريخي', meaningEn: 'Pyramid' },
      { word: 'نَهْر', position: 'medial', meaningAr: 'مجرى مائي', meaningEn: 'River' },
      { word: 'وَجْه', position: 'final', meaningAr: 'مقدمة الرأس', meaningEn: 'Face' }
    ],
    distractors: [
      { word: 'شَمْس', meaningAr: 'نجم', meaningEn: 'Sun' },
      { word: 'بَيْت', meaningAr: 'منزل', meaningEn: 'House' },
      { word: 'قَلَم', meaningAr: 'كتابة', meaningEn: 'Pen' }
    ]
  },
  'و': {
    targetWords: [
      { word: 'وَرْدَة', position: 'initial', meaningAr: 'زهرة ذات أريج', meaningEn: 'Rose' },
      { word: 'وَلَد', position: 'initial', meaningAr: 'طفل صغير', meaningEn: 'Boy' },
      { word: 'دَلْو', position: 'final', meaningAr: 'وعاء للماء', meaningEn: 'Bucket' },
      { word: 'مَوْز', position: 'medial', meaningAr: 'فاكهة', meaningEn: 'Banana' }
    ],
    distractors: [
      { word: 'بَيْت', meaningAr: 'منزل', meaningEn: 'House' },
      { word: 'قَلَم', meaningAr: 'أداة', meaningEn: 'Pen' },
      { word: 'شَجَرَة', meaningAr: 'نبات', meaningEn: 'Tree' }
    ]
  },
  'ي': {
    targetWords: [
      { word: 'يَد', position: 'initial', meaningAr: 'عضو اللمس والعمل', meaningEn: 'Hand' },
      { word: 'يَاسَمِين', position: 'initial', meaningAr: 'زهرة بيضاء زكية', meaningEn: 'Jasmine' },
      { word: 'بَيْت', position: 'medial', meaningAr: 'منزل', meaningEn: 'House' },
      { word: 'كُرْسِيّ', position: 'final', meaningAr: 'مقعد للجلوس', meaningEn: 'Chair' }
    ],
    distractors: [
      { word: 'قَلَم', meaningAr: 'أداة', meaningEn: 'Pen' },
      { word: 'شَمْس', meaningAr: 'نجم', meaningEn: 'Sun' },
      { word: 'جَمَل', meaningAr: 'حيوان', meaningEn: 'Camel' }
    ]
  }
};

const WordDiscriminationGame: React.FC<{
  char: string;
  t: any;
  lang: string;
  onSpeak: (text: string, display: string) => void;
}> = ({ char, t, lang, onSpeak }) => {
  const [level, setLevel] = React.useState(1);
  const [currentQuestion, setCurrentQuestion] = React.useState<any>(null);
  const [options, setOptions] = React.useState<any[]>([]);
  const [feedback, setFeedback] = React.useState<'correct' | 'wrong' | null>(null);
  const [selectedLabel, setSelectedLabel] = React.useState<string | null>(null);
  const [score, setScore] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);

  const cleanChar = char.replace('ـ', '').trim();
  const wordData = LETTER_WORDS[cleanChar] || LETTER_WORDS['ب'];

  const generateQuestion = (currentLevel: number) => {
    setFeedback(null);
    setSelectedLabel(null);

    const targets = wordData.targetWords || [];
    const distractors = wordData.distractors || [];

    let levelTitle = '';
    let targetObj: any = null;
    let opts: any[] = [];
    let speakText = '';

    if (currentLevel === 1) {
      levelTitle = lang === 'ar' ? `بداية الكلمة (${cleanChar})` : `Initial Position (${cleanChar})`;
      targetObj = targets.find(w => w.position === 'initial') || targets[0];
      speakText = targetObj.word;
      
      const decoys = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 3);
      opts = [
        { label: stripTashkeel(targetObj.word), meaning: lang === 'ar' ? targetObj.meaningAr : targetObj.meaningEn, isCorrect: true },
        ...decoys.map(d => ({ label: stripTashkeel(d.word), meaning: lang === 'ar' ? d.meaningAr : d.meaningEn, isCorrect: false }))
      ];
    } else if (currentLevel === 2) {
      levelTitle = lang === 'ar' ? `وسط الكلمة (${cleanChar})` : `Medial Position (${cleanChar})`;
      targetObj = targets.find(w => w.position === 'medial') || targets[1] || targets[0];
      speakText = targetObj.word;

      const decoys = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 3);
      opts = [
        { label: stripTashkeel(targetObj.word), meaning: lang === 'ar' ? targetObj.meaningAr : targetObj.meaningEn, isCorrect: true },
        ...decoys.map(d => ({ label: stripTashkeel(d.word), meaning: lang === 'ar' ? d.meaningAr : d.meaningEn, isCorrect: false }))
      ];
    } else if (currentLevel === 3) {
      levelTitle = lang === 'ar' ? `آخر الكلمة (${cleanChar})` : `Final Position (${cleanChar})`;
      targetObj = targets.find(w => w.position === 'final') || targets[2] || targets[0];
      speakText = targetObj.word;

      const decoys = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 3);
      opts = [
        { label: stripTashkeel(targetObj.word), meaning: lang === 'ar' ? targetObj.meaningAr : targetObj.meaningEn, isCorrect: true },
        ...decoys.map(d => ({ label: stripTashkeel(d.word), meaning: lang === 'ar' ? d.meaningAr : d.meaningEn, isCorrect: false }))
      ];
    } else if (currentLevel === 4) {
      levelTitle = lang === 'ar' ? `موقع الحرف في الكلمة` : `Letter Position`;
      targetObj = targets[Math.floor(Math.random() * targets.length)] || targets[0];
      speakText = targetObj.word;

      opts = [
        { label: t.posInitial || 'بداية الكلمة', isCorrect: targetObj.position === 'initial' },
        { label: t.posMedial || 'وسط الكلمة', isCorrect: targetObj.position === 'medial' },
        { label: t.posFinal || 'آخر الكلمة', isCorrect: targetObj.position === 'final' }
      ];
    } else {
      levelTitle = lang === 'ar' ? `التحدي الشامل للكلمات` : `Word Challenge`;
      targetObj = targets[targets.length - 1] || targets[0];
      speakText = targetObj.word;

      const decoys = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 3);
      opts = [
        { label: stripTashkeel(targetObj.word), meaning: lang === 'ar' ? targetObj.meaningAr : targetObj.meaningEn, isCorrect: true },
        ...decoys.map(d => ({ label: stripTashkeel(d.word), meaning: lang === 'ar' ? d.meaningAr : d.meaningEn, isCorrect: false }))
      ];
    }

    setCurrentQuestion({
      title: levelTitle,
      targetWord: stripTashkeel(targetObj?.word || ''),
      meaning: lang === 'ar' ? targetObj?.meaningAr : targetObj?.meaningEn,
      position: targetObj?.position,
      speakText
    });
    setOptions(opts.sort(() => 0.5 - Math.random()));

    setTimeout(() => {
      onSpeak(speakText, 'game');
    }, 600);
  };

  React.useEffect(() => {
    setLevel(1);
    setIsComplete(false);
    generateQuestion(1);
  }, [char]);

  const handleAnswer = (opt: any) => {
    if (feedback) return;
    setSelectedLabel(opt.label);

    if (opt.isCorrect) {
      setFeedback('correct');
      setScore(s => s + 20);

      setTimeout(() => {
        if (level < 5) {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          generateQuestion(nextLvl);
        } else {
          setIsComplete(true);
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-2 animate-in zoom-in duration-500">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
          <Award size={24} className="animate-bounce" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-black text-slate-800 arabic-font leading-tight">
            {t.wordComplete || (lang === 'ar' ? 'ممتاز! أنجزت تحدي الكلمات' : 'Great Job! Word Challenge Completed')}
          </h3>
          <p className="text-slate-400 font-bold uppercase text-[6px] tracking-widest mt-0.5">
            {t.wordCompleteSub || (lang === 'ar' ? 'أتقنت تمييز كلمات حرف' : 'Mastered words for letter')} {char}
          </p>
        </div>
        <button
          onClick={() => { setLevel(1); setIsComplete(false); generateQuestion(1); }}
          className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-black text-[8px] uppercase tracking-widest hover:scale-105 transition-all shadow-md active:scale-95"
        >
          {t.auditoryCompleteBtn || (lang === 'ar' ? 'إعادة التحدي' : 'Re-Challenge')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2 animate-in zoom-in duration-500 w-full max-w-sm mx-auto py-1">
      {/* 5 Dots Progress Indicator */}
      <div className="flex gap-1 mb-0.5">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div
            key={lvl}
            className={`w-1 h-1 rounded-full transition-all duration-500 ${
              lvl < level
                ? 'bg-emerald-500'
                : lvl === level
                ? 'bg-blue-600 scale-125 shadow-[0_0_8px_rgba(37,99,235,1)] ring-1 ring-blue-400'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Level Title Header */}
      <div className="text-center mb-0.5">
        <h2 className="text-base font-black text-slate-800 arabic-font">
          {currentQuestion?.title}
        </h2>
      </div>

      {/* Speaker Button & Target Display */}
      <div className="flex flex-col items-center mb-1">
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
          <button
            onClick={() => onSpeak(currentQuestion?.speakText, 'game')}
            className="w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-50 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all active:scale-95 z-10 relative group"
          >
            <Volume2 size={20} className="text-blue-600 group-hover:animate-pulse" />
          </button>
        </div>
        {level === 4 && currentQuestion?.targetWord && (
          <span className="mt-1.5 text-lg font-black text-blue-700 arabic-font bg-blue-50 px-3 py-0.5 rounded-full border border-blue-100 shadow-sm">
            {currentQuestion.targetWord}
          </span>
        )}
      </div>

      {/* Options Grid */}
      <div className={`grid ${options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 w-full px-2`}>
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className={`py-2 md:py-2.5 rounded-xl border-2 text-base md:text-lg font-black arabic-font transition-all shadow-sm flex flex-col items-center justify-center px-1
              ${
                feedback === 'correct' && opt.isCorrect
                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200 scale-105'
                  : feedback === 'wrong' && opt.label === selectedLabel
                  ? 'bg-red-50 border-red-200 text-red-600 opacity-50'
                  : feedback === 'wrong' && opt.isCorrect
                  ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                  : 'bg-white border-slate-100 hover:border-blue-300 text-slate-700 hover:bg-blue-50 active:scale-95'
              }
            `}
          >
            <span>{opt.label}</span>
            {opt.meaning && (
              <span className={`text-[9px] font-bold ${feedback === 'correct' && opt.isCorrect ? 'text-emerald-100' : 'text-slate-400'}`}>
                {opt.meaning}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback Banner */}
      <div className="h-8 flex items-center justify-center">
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-3 py-1 rounded-lg font-black text-[10px] arabic-font shadow-md flex items-center gap-2 ${
              feedback === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}
          >
            {feedback === 'correct' ? (
              <><CheckCircle size={14} /> {t.correct}</>
            ) : (
              <><XCircle size={14} /> {t.wrong}</>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const TASHKEEL_WORDS: Record<string, {
  fatha: { word: string, charWithDiacritic: string, meaningAr: string, meaningEn: string },
  damma: { word: string, charWithDiacritic: string, meaningAr: string, meaningEn: string },
  kasra: { word: string, charWithDiacritic: string, meaningAr: string, meaningEn: string },
  sukoon: { word: string, charWithDiacritic: string, meaningAr: string, meaningEn: string }
}> = {
  'أ': {
    fatha: { word: 'أَسَد', charWithDiacritic: 'أَ', meaningAr: 'أسد', meaningEn: 'Lion' },
    damma: { word: 'أُذُن', charWithDiacritic: 'أُ', meaningAr: 'أذن', meaningEn: 'Ear' },
    kasra: { word: 'إِبْرِيق', charWithDiacritic: 'إِ', meaningAr: 'إبريق', meaningEn: 'Jug' },
    sukoon: { word: 'رَأْس', charWithDiacritic: 'أْ', meaningAr: 'رأس', meaningEn: 'Head' }
  },
  'ب': {
    fatha: { word: 'بَيْت', charWithDiacritic: 'بَ', meaningAr: 'منزل', meaningEn: 'House' },
    damma: { word: 'بُرْتُقَال', charWithDiacritic: 'بُ', meaningAr: 'فاكهة', meaningEn: 'Orange' },
    kasra: { word: 'بِنْت', charWithDiacritic: 'بِ', meaningAr: 'فتاة', meaningEn: 'Girl' },
    sukoon: { word: 'حَبْل', charWithDiacritic: 'بْ', meaningAr: 'حبل', meaningEn: 'Rope' }
  },
  'ت': {
    fatha: { word: 'تَمْر', charWithDiacritic: 'تَ', meaningAr: 'تمر', meaningEn: 'Dates' },
    damma: { word: 'تُفَّاح', charWithDiacritic: 'تُ', meaningAr: 'فاكهة', meaningEn: 'Apple' },
    kasra: { word: 'تِمْسَاح', charWithDiacritic: 'تِ', meaningAr: 'حيوان', meaningEn: 'Crocodile' },
    sukoon: { word: 'مَكْتَب', charWithDiacritic: 'تْ', meaningAr: 'مكتب', meaningEn: 'Desk' }
  },
  'ث': {
    fatha: { word: 'ثَعْلَب', charWithDiacritic: 'ثَ', meaningAr: 'حيوان', meaningEn: 'Fox' },
    damma: { word: 'ثُعْبَان', charWithDiacritic: 'ثُ', meaningAr: 'زاحف', meaningEn: 'Snake' },
    kasra: { word: 'ثِيَاب', charWithDiacritic: 'ثِ', meaningAr: 'ملابس', meaningEn: 'Clothes' },
    sukoon: { word: 'مَثْلَجَة', charWithDiacritic: 'ثْ', meaningAr: 'مبرد', meaningEn: 'Freezer' }
  },
  'ج': {
    fatha: { word: 'جَمَل', charWithDiacritic: 'جَ', meaningAr: 'حيوان', meaningEn: 'Camel' },
    damma: { word: 'جُمُعَة', charWithDiacritic: 'جُ', meaningAr: 'يوم', meaningEn: 'Friday' },
    kasra: { word: 'جِدَار', charWithDiacritic: 'جِ', meaningAr: 'حائط', meaningEn: 'Wall' },
    sukoon: { word: 'فَجْر', charWithDiacritic: 'جْ', meaningAr: 'وقت', meaningEn: 'Dawn' }
  },
  'ح': {
    fatha: { word: 'حَبْل', charWithDiacritic: 'حَ', meaningAr: 'حبل', meaningEn: 'Rope' },
    damma: { word: 'حُوت', charWithDiacritic: 'حُ', meaningAr: 'حيوان مائي', meaningEn: 'Whale' },
    kasra: { word: 'حِصَان', charWithDiacritic: 'حِ', meaningAr: 'حيوان', meaningEn: 'Horse' },
    sukoon: { word: 'بَحْر', charWithDiacritic: 'حْ', meaningAr: 'ماء', meaningEn: 'Sea' }
  },
  'خ': {
    fatha: { word: 'خَرُوف', charWithDiacritic: 'خَ', meaningAr: 'حيوان', meaningEn: 'Sheep' },
    damma: { word: 'خُبْز', charWithDiacritic: 'خُ', meaningAr: 'طعام', meaningEn: 'Bread' },
    kasra: { word: 'خِيَار', charWithDiacritic: 'خِ', meaningAr: 'خضار', meaningEn: 'Cucumber' },
    sukoon: { word: 'نَخْلَة', charWithDiacritic: 'خْ', meaningAr: 'نبات', meaningEn: 'Palm' }
  },
  'د': {
    fatha: { word: 'دَرَّاجَة', charWithDiacritic: 'دَ', meaningAr: 'مركبة', meaningEn: 'Bicycle' },
    damma: { word: 'دُبّ', charWithDiacritic: 'دُ', meaningAr: 'حيوان', meaningEn: 'Bear' },
    kasra: { word: 'دِيك', charWithDiacritic: 'دِ', meaningAr: 'طائر', meaningEn: 'Rooster' },
    sukoon: { word: 'بَدْر', charWithDiacritic: 'دْ', meaningAr: 'قمر', meaningEn: 'Full Moon' }
  },
  'ذ': {
    fatha: { word: 'ذَهَب', charWithDiacritic: 'ذَ', meaningAr: 'معدن', meaningEn: 'Gold' },
    damma: { word: 'ذُرَة', charWithDiacritic: 'ذُ', meaningAr: 'نبات', meaningEn: 'Corn' },
    kasra: { word: 'ذِئْب', charWithDiacritic: 'ذِ', meaningAr: 'حيوان', meaningEn: 'Wolf' },
    sukoon: { word: 'جَذْر', charWithDiacritic: 'ذْ', meaningAr: 'نبات', meaningEn: 'Root' }
  },
  'ر': {
    fatha: { word: 'رَجُل', charWithDiacritic: 'رَ', meaningAr: 'إنسان', meaningEn: 'Man' },
    damma: { word: 'رُمَّان', charWithDiacritic: 'رُ', meaningAr: 'فاكهة', meaningEn: 'Pomegranate' },
    kasra: { word: 'رِسَالَة', charWithDiacritic: 'رِ', meaningAr: 'خطاب', meaningEn: 'Letter' },
    sukoon: { word: 'بَرْد', charWithDiacritic: 'رْ', meaningAr: 'طقس', meaningEn: 'Cold' }
  },
  'ز': {
    fatha: { word: 'زَهْرَة', charWithDiacritic: 'زَ', meaningAr: 'نبات', meaningEn: 'Flower' },
    damma: { word: 'زُجَاج', charWithDiacritic: 'زُ', meaningAr: 'مادة', meaningEn: 'Glass' },
    kasra: { word: 'زِينَة', charWithDiacritic: 'زِ', meaningAr: 'ديكور', meaningEn: 'Decoration' },
    sukoon: { word: 'مَزْرَعَة', charWithDiacritic: 'زْ', meaningAr: 'مكان', meaningEn: 'Farm' }
  },
  'س': {
    fatha: { word: 'سَمَكَة', charWithDiacritic: 'سَ', meaningAr: 'حيوان مائي', meaningEn: 'Fish' },
    damma: { word: 'سُلَحْفَاة', charWithDiacritic: 'سُ', meaningAr: 'زاحف', meaningEn: 'Turtle' },
    kasra: { word: 'سِكِّين', charWithDiacritic: 'سِ', meaningAr: 'أداة', meaningEn: 'Knife' },
    sukoon: { word: 'مَسْجِد', charWithDiacritic: 'سْ', meaningAr: 'مكان عبادة', meaningEn: 'Mosque' }
  },
  'ش': {
    fatha: { word: 'شَمْس', charWithDiacritic: 'شَ', meaningAr: 'نجم', meaningEn: 'Sun' },
    damma: { word: 'شُعْلَة', charWithDiacritic: 'شُ', meaningAr: 'نار', meaningEn: 'Flame' },
    kasra: { word: 'شِتَاء', charWithDiacritic: 'شِ', meaningAr: 'فصل', meaningEn: 'Winter' },
    sukoon: { word: 'عُشْب', charWithDiacritic: 'شْ', meaningAr: 'نبات', meaningEn: 'Grass' }
  },
  'ص': {
    fatha: { word: 'صَقْر', charWithDiacritic: 'صَ', meaningAr: 'طائر', meaningEn: 'Falcon' },
    damma: { word: 'صُنْدُوق', charWithDiacritic: 'صُ', meaningAr: 'وعاء', meaningEn: 'Box' },
    kasra: { word: 'صِينِيَّة', charWithDiacritic: 'صِ', meaningAr: 'أواني', meaningEn: 'Tray' },
    sukoon: { word: 'قَصْر', charWithDiacritic: 'صْ', meaningAr: 'بناء', meaningEn: 'Palace' }
  },
  'ض': {
    fatha: { word: 'ضَفْدَع', charWithDiacritic: 'ضَ', meaningAr: 'حيوان', meaningEn: 'Frog' },
    damma: { word: 'ضُيُوف', charWithDiacritic: 'ضُ', meaningAr: 'أشخاص', meaningEn: 'Guests' },
    kasra: { word: 'ضِرْس', charWithDiacritic: 'ضِ', meaningAr: 'سن', meaningEn: 'Tooth' },
    sukoon: { word: 'خَضْرَاء', charWithDiacritic: 'ضْ', meaningAr: 'لون', meaningEn: 'Green' }
  },
  'ط': {
    fatha: { word: 'طَائِر', charWithDiacritic: 'طَ', meaningAr: 'طائر', meaningEn: 'Bird' },
    damma: { word: 'طُيُور', charWithDiacritic: 'طُ', meaningAr: 'طيور', meaningEn: 'Birds' },
    kasra: { word: 'طِفْل', charWithDiacritic: 'طِ', meaningAr: 'صغير', meaningEn: 'Child' },
    sukoon: { word: 'مَطَر', charWithDiacritic: 'طْ', meaningAr: 'ماء', meaningEn: 'Rain' }
  },
  'ظ': {
    fatha: { word: 'ظَرْف', charWithDiacritic: 'ظَ', meaningAr: 'ورق', meaningEn: 'Envelope' },
    damma: { word: 'ظُلْمَة', charWithDiacritic: 'ظُ', meaningAr: 'ظلام', meaningEn: 'Darkness' },
    kasra: { word: 'ظِلّ', charWithDiacritic: 'ظِ', meaningAr: 'ظل', meaningEn: 'Shadow' },
    sukoon: { word: 'عَظْم', charWithDiacritic: 'ظْ', meaningAr: 'جسم', meaningEn: 'Bone' }
  },
  'ع': {
    fatha: { word: 'عَلَم', charWithDiacritic: 'عَ', meaningAr: 'راية', meaningEn: 'Flag' },
    damma: { word: 'عُشّ', charWithDiacritic: 'عُ', meaningAr: 'بيت الطائر', meaningEn: 'Nest' },
    kasra: { word: 'عِنَب', charWithDiacritic: 'عِ', meaningAr: 'فاكهة', meaningEn: 'Grapes' },
    sukoon: { word: 'مَلْعَب', charWithDiacritic: 'عْ', meaningAr: 'مكان', meaningEn: 'Playground' }
  },
  'غ': {
    fatha: { word: 'غَزَال', charWithDiacritic: 'غَ', meaningAr: 'حيوان', meaningEn: 'Deer' },
    damma: { word: 'غُرَاب', charWithDiacritic: 'غُ', meaningAr: 'طائر', meaningEn: 'Crow' },
    kasra: { word: 'غِلَاف', charWithDiacritic: 'غِ', meaningAr: 'غطاء', meaningEn: 'Cover' },
    sukoon: { word: 'مَغْرِب', charWithDiacritic: 'غْ', meaningAr: 'وقت', meaningEn: 'Sunset' }
  },
  'ف': {
    fatha: { word: 'فَرَاشَة', charWithDiacritic: 'فَ', meaningAr: 'حشرة', meaningEn: 'Butterfly' },
    damma: { word: 'فُلْفُل', charWithDiacritic: 'فُ', meaningAr: 'خضار', meaningEn: 'Pepper' },
    kasra: { word: 'فِيل', charWithDiacritic: 'فِ', meaningAr: 'حيوان', meaningEn: 'Elephant' },
    sukoon: { word: 'سَقْف', charWithDiacritic: 'فْ', meaningAr: 'بناء', meaningEn: 'Roof' }
  },
  'ق': {
    fatha: { word: 'قَلَم', charWithDiacritic: 'قَ', meaningAr: 'أداة', meaningEn: 'Pen' },
    damma: { word: 'قُبَّعَة', charWithDiacritic: 'قُ', meaningAr: 'لباس', meaningEn: 'Hat' },
    kasra: { word: 'قِطَّة', charWithDiacritic: 'قِ', meaningAr: 'حيوان', meaningEn: 'Cat' },
    sukoon: { word: 'صَقْر', charWithDiacritic: 'قْ', meaningAr: 'طائر', meaningEn: 'Falcon' }
  },
  'ك': {
    fatha: { word: 'كَلْب', charWithDiacritic: 'كَ', meaningAr: 'حيوان', meaningEn: 'Dog' },
    damma: { word: 'كُرَة', charWithDiacritic: 'كُ', meaningAr: 'لعبة', meaningEn: 'Ball' },
    kasra: { word: 'كِتَاب', charWithDiacritic: 'كِ', meaningAr: 'قراءة', meaningEn: 'Book' },
    sukoon: { word: 'مَكْتَب', charWithDiacritic: 'كْ', meaningAr: 'أثاث', meaningEn: 'Desk' }
  },
  'ل': {
    fatha: { word: 'لَيْمُون', charWithDiacritic: 'لَ', meaningAr: 'فاكهة', meaningEn: 'Lemon' },
    damma: { word: 'لُعْبَة', charWithDiacritic: 'لُ', meaningAr: 'شيء', meaningEn: 'Toy' },
    kasra: { word: 'لِسَان', charWithDiacritic: 'لِ', meaningAr: 'عضو', meaningEn: 'Tongue' },
    sukoon: { word: 'ثَلْج', charWithDiacritic: 'لْ', meaningAr: 'ماء متجمد', meaningEn: 'Snow' }
  },
  'م': {
    fatha: { word: 'مَوْز', charWithDiacritic: 'مَ', meaningAr: 'فاكهة', meaningEn: 'Banana' },
    damma: { word: 'مُعَلِّم', charWithDiacritic: 'مُ', meaningAr: 'مهنة', meaningEn: 'Teacher' },
    kasra: { word: 'مِقَصّ', charWithDiacritic: 'مِ', meaningAr: 'أداة', meaningEn: 'Scissors' },
    sukoon: { word: 'شَمْس', charWithDiacritic: 'مْ', meaningAr: 'نجم', meaningEn: 'Sun' }
  },
  'ن': {
    fatha: { word: 'نَجْم', charWithDiacritic: 'نَ', meaningAr: 'جرم', meaningEn: 'Star' },
    damma: { word: 'نُجُوم', charWithDiacritic: 'نُ', meaningAr: 'أجرام', meaningEn: 'Stars' },
    kasra: { word: 'نِمْر', charWithDiacritic: 'نِ', meaningAr: 'حيوان', meaningEn: 'Tiger' },
    sukoon: { word: 'بِنْت', charWithDiacritic: 'نْ', meaningAr: 'فتاة', meaningEn: 'Girl' }
  },
  'هـ': {
    fatha: { word: 'هَدِيَّة', charWithDiacritic: 'هَ', meaningAr: 'عطاء', meaningEn: 'Gift' },
    damma: { word: 'هُدْهُد', charWithDiacritic: 'هُ', meaningAr: 'طائر', meaningEn: 'Hoopoe' },
    kasra: { word: 'هِلَال', charWithDiacritic: 'هِ', meaningAr: 'قمر', meaningEn: 'Crescent' },
    sukoon: { word: 'نَهْر', charWithDiacritic: 'هْ', meaningAr: 'ماء', meaningEn: 'River' }
  },
  'و': {
    fatha: { word: 'وَرْدَة', charWithDiacritic: 'وَ', meaningAr: 'زهرة', meaningEn: 'Rose' },
    damma: { word: 'وُضُوء', charWithDiacritic: 'وُ', meaningAr: 'طهارة', meaningEn: 'Ablution' },
    kasra: { word: 'وِسَادَة', charWithDiacritic: 'وِ', meaningAr: 'أثاث', meaningEn: 'Pillow' },
    sukoon: { word: 'مَوْز', charWithDiacritic: 'وْ', meaningAr: 'فاكهة', meaningEn: 'Banana' }
  },
  'ي': {
    fatha: { word: 'يَد', charWithDiacritic: 'يَ', meaningAr: 'عضو', meaningEn: 'Hand' },
    damma: { word: 'يُوسُفِي', charWithDiacritic: 'يُ', meaningAr: 'فاكهة', meaningEn: 'Tangerine' },
    kasra: { word: 'يَنَابِيع', charWithDiacritic: 'يِ', meaningAr: 'ماء', meaningEn: 'Springs' },
    sukoon: { word: 'بَيْت', charWithDiacritic: 'يْ', meaningAr: 'منزل', meaningEn: 'House' }
  }
};

const WordTashkeelGame: React.FC<{
  char: string;
  t: any;
  lang: string;
  onSpeak: (text: string, display: string) => void;
}> = ({ char, t, lang, onSpeak }) => {
  const [level, setLevel] = React.useState(1);
  const [currentQuestion, setCurrentQuestion] = React.useState<any>(null);
  const [options, setOptions] = React.useState<any[]>([]);
  const [feedback, setFeedback] = React.useState<'correct' | 'wrong' | null>(null);
  const [selectedLabel, setSelectedLabel] = React.useState<string | null>(null);
  const [score, setScore] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);

  const cleanChar = char.replace('ـ', '').trim();
  const sampleData = TASHKEEL_WORDS[cleanChar] || TASHKEEL_WORDS['ب'];

  const generateQuestion = (currentLevel: number) => {
    setFeedback(null);
    setSelectedLabel(null);

    let levelTitle = '';
    let item: any = null;
    let correctChar = '';
    let decoys: string[] = [];

    const f = sampleData.fatha;
    const d = sampleData.damma;
    const k = sampleData.kasra;
    const s = sampleData.sukoon;

    if (currentLevel === 1) {
      levelTitle = t.tashkeelFatha || (lang === 'ar' ? `حركة الفتحة ( َ )` : `Fatha Diacritic ( َ )`);
      item = f;
      correctChar = f.charWithDiacritic;
      decoys = [d.charWithDiacritic, k.charWithDiacritic];
    } else if (currentLevel === 2) {
      levelTitle = t.tashkeelDamma || (lang === 'ar' ? `حركة الضمة ( ُ )` : `Damma Diacritic ( ُ )`);
      item = d;
      correctChar = d.charWithDiacritic;
      decoys = [f.charWithDiacritic, k.charWithDiacritic];
    } else if (currentLevel === 3) {
      levelTitle = t.tashkeelKasra || (lang === 'ar' ? `حركة الكسرة ( ِ )` : `Kasra Diacritic ( ِ )`);
      item = k;
      correctChar = k.charWithDiacritic;
      decoys = [f.charWithDiacritic, d.charWithDiacritic];
    } else if (currentLevel === 4) {
      levelTitle = t.tashkeelSukoon || (lang === 'ar' ? `حركة السكون ( ْ )` : `Sukoon Diacritic ( ْ )`);
      item = s;
      correctChar = s.charWithDiacritic;
      decoys = [f.charWithDiacritic, d.charWithDiacritic];
    } else {
      levelTitle = t.tashkeelChallenge || (lang === 'ar' ? `التحدي الشامل للتشكيل` : `Comprehensive Tashkeel Challenge`);
      const items = [f, d, k, s];
      item = items[Math.floor(Math.random() * items.length)];
      correctChar = item.charWithDiacritic;
      const allChars = [f.charWithDiacritic, d.charWithDiacritic, k.charWithDiacritic, s.charWithDiacritic];
      decoys = allChars.filter(c => c !== correctChar);
    }

    const opts = [
      { label: correctChar, isCorrect: true },
      ...decoys.map(decoy => ({ label: decoy, isCorrect: false }))
    ].sort(() => 0.5 - Math.random());

    setCurrentQuestion({
      title: levelTitle,
      word: stripTashkeel(item.word),
      meaning: lang === 'ar' ? item.meaningAr : item.meaningEn,
      speakText: item.word
    });
    setOptions(opts);

    setTimeout(() => {
      onSpeak(item.word, 'game');
    }, 600);
  };

  React.useEffect(() => {
    setLevel(1);
    setIsComplete(false);
    generateQuestion(1);
  }, [char]);

  const handleAnswer = (opt: any) => {
    if (feedback) return;
    setSelectedLabel(opt.label);

    if (opt.isCorrect) {
      setFeedback('correct');
      setScore(sc => sc + 20);

      setTimeout(() => {
        if (level < 5) {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          generateQuestion(nextLvl);
        } else {
          setIsComplete(true);
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-2 animate-in zoom-in duration-500">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
          <Award size={24} className="animate-bounce" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-black text-slate-800 arabic-font leading-tight">
            {t.tashkeelComplete || (lang === 'ar' ? 'ممتاز! أتقنت تشكيل الحرف في الكلمات' : 'Great Job! Mastered Letter Diacritics')}
          </h3>
          <p className="text-slate-400 font-bold uppercase text-[6px] tracking-widest mt-0.5">
            {t.tashkeelCompleteSub || (lang === 'ar' ? 'أكملت جميع مستويات التشكيل لـ ' : 'Completed all diacritics levels for ')} {char}
          </p>
        </div>
        <button
          onClick={() => { setLevel(1); setIsComplete(false); generateQuestion(1); }}
          className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-black text-[8px] uppercase tracking-widest hover:scale-105 transition-all shadow-md active:scale-95"
        >
          {t.auditoryCompleteBtn || (lang === 'ar' ? 'إعادة التحدي' : 'Re-Challenge')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2 animate-in zoom-in duration-500 w-full max-w-sm mx-auto py-1">
      {/* 5 Dots Progress Indicator */}
      <div className="flex gap-1 mb-0.5">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div
            key={lvl}
            className={`w-1 h-1 rounded-full transition-all duration-500 ${
              lvl < level
                ? 'bg-emerald-500'
                : lvl === level
                ? 'bg-purple-600 scale-125 shadow-[0_0_8px_rgba(147,51,234,1)] ring-1 ring-purple-400'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Level Title Header */}
      <div className="text-center mb-0.5">
        <h2 className="text-base font-black text-slate-800 arabic-font">
          {currentQuestion?.title}
        </h2>
      </div>

      {/* Speaker Button & Target Word Display */}
      <div className="flex flex-col items-center mb-1">
        <div className="relative group">
          <div className="absolute inset-0 bg-purple-100 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
          <button
            onClick={() => onSpeak(currentQuestion?.speakText, 'game')}
            className="w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-50 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all active:scale-95 z-10 relative group"
          >
            <Volume2 size={20} className="text-purple-600 group-hover:animate-pulse" />
          </button>
        </div>
        {currentQuestion?.word && (
          <div className="flex flex-col items-center mt-1.5">
            <span className="text-lg font-black text-purple-700 arabic-font bg-purple-50 px-3 py-0.5 rounded-full border border-purple-100 shadow-sm">
              {currentQuestion.word}
            </span>
            {currentQuestion.meaning && (
              <span className="text-[9px] font-bold text-slate-400 mt-0.5">
                {currentQuestion.meaning}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Options Grid */}
      <div className={`grid ${options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 w-full px-2`}>
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className={`py-2 md:py-2.5 rounded-xl border-2 text-base md:text-lg font-black arabic-font transition-all shadow-sm flex flex-col items-center justify-center px-1
              ${
                feedback === 'correct' && opt.isCorrect
                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200 scale-105'
                  : feedback === 'wrong' && opt.label === selectedLabel
                  ? 'bg-red-50 border-red-200 text-red-600 opacity-50'
                  : feedback === 'wrong' && opt.isCorrect
                  ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                  : 'bg-white border-slate-100 hover:border-purple-300 text-slate-700 hover:bg-purple-50 active:scale-95'
              }
            `}
          >
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Feedback Banner */}
      <div className="h-8 flex items-center justify-center">
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-3 py-1 rounded-lg font-black text-[10px] arabic-font shadow-md flex items-center gap-2 ${
              feedback === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}
          >
            {feedback === 'correct' ? (
              <><CheckCircle size={14} /> {t.correct}</>
            ) : (
              <><XCircle size={14} /> {t.wrong}</>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};


const TranslitDisplay: React.FC<{ text: string, className?: string }> = ({ text, className }) => {
  return (
    <span className={`${className} inline-block`} dir="ltr">
      {'\u200E'}{text}
    </span>
  );
};

const LetterWorksheetContent: React.FC<{
  selectedChar: any;
  t: any;
  lang: 'ar' | 'en';
  shapes: any;
  isPreview?: boolean;
  worksheetRef?: React.RefObject<HTMLDivElement>;
}> = ({ selectedChar, t, lang, shapes, isPreview = false, worksheetRef }) => {
  return (
    <div
      ref={worksheetRef}
      className={`w-full ${isPreview ? 'max-w-[540px] p-3 sm:p-4 text-[10px]' : 'w-[800px] min-h-[1130px] p-8 text-slate-900 flex flex-col justify-between'} bg-white arabic-font shadow-none mx-auto text-right`}
      dir="rtl"
    >
      {/* Container for content */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Top Section */}
        <div>
          {/* Header */}
          <div className={`border-b-2 border-slate-900 ${isPreview ? 'pb-1 mb-1.5' : 'pb-3 mb-3'} flex justify-between items-center`}>
            <div className="w-1/3 text-right">
              <h1 className={`${isPreview ? 'text-xs font-bold' : 'text-lg font-black'} leading-tight`}>
                {t.letterHeading} {lang === 'ar' ? selectedChar?.name : selectedChar?.translit}
              </h1>
              <p className={`text-slate-400 ${isPreview ? 'text-[8px]' : 'text-[10px]'} uppercase font-bold font-sans tracking-wide`}>
                {selectedChar ? `${selectedChar.translit} Letter` : 'Alphabet'}
              </p>
            </div>
            <div className="w-1/3 text-center">
              <h2 className={`${isPreview ? 'text-[11px] font-black' : 'text-base font-black'} leading-tight mt-0.5`}>
                {t.worksheetTitle}
              </h2>
            </div>
            <div className="w-1/3 text-left">
              <div className={`${isPreview ? 'text-xs font-black' : 'text-lg font-black'} tracking-tighter text-slate-900 mb-0.5 leading-tight`} dir="ltr">
                QUL / قُل
              </div>
              <div className={`${isPreview ? 'text-[7px]' : 'text-[9px]'} font-bold text-slate-400 uppercase tracking-widest font-sans`}>
                Interactive Learning
              </div>
            </div>
          </div>

          {/* Student Info Bar */}
          <div className={`flex gap-3 sm:gap-6 ${isPreview ? 'mb-1.5 pb-1 text-[9px]' : 'mb-3 pb-2 text-xs'} border-b border-slate-200`}>
            <div className="flex-1 flex items-center gap-2">
              <span className="font-bold text-slate-500">{t.learnerName}</span>
              <div className={`flex-1 border-b border-slate-300 ${isPreview ? 'h-3' : 'h-4'}`}></div>
            </div>
            <div className="w-1/3 flex items-center gap-2">
              <span className="font-bold text-slate-500">{t.date}</span>
              <div className={`flex-1 border-b border-slate-300 ${isPreview ? 'h-3' : 'h-4'} ${isPreview ? 'text-[9px]' : 'text-xs'} font-sans flex items-end`}>
                {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

          {/* Section 1: Letter Shapes */}
          <div className={isPreview ? 'mb-1.5' : 'mb-3.5'}>
            <div className={`bg-slate-100 ${isPreview ? 'p-0.5 px-1 mb-1' : 'p-1.5 px-2.5 mb-2'} rounded-lg border-r-4 border-slate-900 flex justify-between items-center`}>
              <h3 className={`${isPreview ? 'text-[10px]' : 'text-xs sm:text-sm'} font-bold text-slate-800`}>{t.wsSection1}</h3>
              <span className={`${isPreview ? 'text-[7px]' : 'text-[9px]'} font-bold text-slate-400 uppercase tracking-wider font-sans`} dir="ltr">{t.wsSection1En}</span>
            </div>
            <div className={`grid grid-cols-4 ${isPreview ? 'gap-1.5' : 'gap-3'}`}>
              {['isolated', 'initial', 'medial', 'final'].map((s: any) => (
                <div key={s} className={`flex flex-col items-center border border-slate-200 rounded-xl ${isPreview ? 'p-1' : 'p-2.5 bg-slate-50/30'}`}>
                  <span className={`${isPreview ? 'text-lg' : 'text-2xl'} arabic-font text-slate-300 font-bold mb-0.5`}>{(shapes as any)?.[s]}</span>
                  <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3' : 'h-5'}`}></div>
                  <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3 mt-1' : 'h-5 mt-1'}`}></div>
                  <span className={`${isPreview ? 'text-[6px]' : 'text-[8px]'} text-slate-400 mt-1 uppercase font-bold`}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Short Vowels */}
          <div className={isPreview ? 'mb-1.5' : 'mb-3.5'}>
            <div className={`bg-slate-100 ${isPreview ? 'p-0.5 px-1 mb-1' : 'p-1.5 px-2.5 mb-2'} rounded-lg border-r-4 border-slate-900 flex justify-between items-center`}>
              <h3 className={`${isPreview ? 'text-[10px]' : 'text-xs sm:text-sm'} font-bold text-slate-800`}>{t.wsSection2}</h3>
              <span className={`${isPreview ? 'text-[7px]' : 'text-[9px]'} font-bold text-slate-400 uppercase tracking-wider font-sans`} dir="ltr">{t.wsSection2En}</span>
            </div>
            <div className={`grid grid-cols-4 ${isPreview ? 'gap-1.5' : 'gap-3'}`}>
              {HARAKAT.map((h, i) => (
                <div key={i} className={`flex flex-col items-center border border-slate-200 rounded-xl ${isPreview ? 'p-1' : 'p-2.5 bg-slate-50/30'}`}>
                  <span className={`${isPreview ? 'text-lg' : 'text-2xl'} arabic-font text-slate-300 font-bold mb-0.5`}>{getCombinedChar(selectedChar?.char || '', h.symbol)}</span>
                  <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3' : 'h-5'}`}></div>
                  <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3 mt-1' : 'h-5 mt-1'}`}></div>
                  <span className={`${isPreview ? 'text-[6px]' : 'text-[8px]'} text-slate-400 mt-1 font-bold`}>{h.nameAr} / {h.nameEn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Shadda */}
          <div className={isPreview ? 'mb-1.5' : 'mb-3.5'}>
            <div className={`bg-slate-100 ${isPreview ? 'p-0.5 px-1 mb-1' : 'p-1.5 px-2.5 mb-2'} rounded-lg border-r-4 border-slate-900 flex justify-between items-center`}>
              <h3 className={`${isPreview ? 'text-[10px]' : 'text-xs sm:text-sm'} font-bold text-slate-800`}>{t.wsSection3}</h3>
              <span className={`${isPreview ? 'text-[7px]' : 'text-[9px]'} font-bold text-slate-400 uppercase tracking-wider font-sans`} dir="ltr">{t.wsSection3En}</span>
            </div>
            <div className={`grid grid-cols-3 ${isPreview ? 'gap-1.5' : 'gap-3'}`}>
              {SHADDA_VARIATIONS.map((sv, i) => (
                <div key={i} className={`flex flex-col items-center border border-slate-200 rounded-xl ${isPreview ? 'p-1' : 'p-2.5 bg-slate-50/30'}`}>
                  <span className={`${isPreview ? 'text-lg' : 'text-2xl'} arabic-font text-slate-300 font-bold mb-0.5`}>{getCombinedChar(selectedChar?.char || '', sv.symbol)}</span>
                  <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3' : 'h-5'}`}></div>
                  <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3 mt-1' : 'h-5 mt-1'}`}></div>
                  <span className={`${isPreview ? 'text-[6px]' : 'text-[8px]'} text-slate-400 mt-1 font-bold`}>{sv.nameAr} / {sv.nameEn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Long Vowels */}
          <div className={isPreview ? 'mb-1.5' : 'mb-3.5'}>
            <div className={`bg-slate-100 ${isPreview ? 'p-0.5 px-1 mb-1' : 'p-1.5 px-2.5 mb-2'} rounded-lg border-r-4 border-slate-900 flex justify-between items-center`}>
              <h3 className={`${isPreview ? 'text-[10px]' : 'text-xs sm:text-sm'} font-bold text-slate-800`}>{t.wsSection4}</h3>
              <span className={`${isPreview ? 'text-[7px]' : 'text-[9px]'} font-bold text-slate-400 uppercase tracking-wider font-sans`} dir="ltr">{t.wsSection4En}</span>
            </div>
            <div className={`grid grid-cols-3 ${isPreview ? 'gap-1.5' : 'gap-3'}`}>
              {MAD_VOWELS.map((m, i) => (
                <div key={i} className={`flex flex-col items-center border border-slate-200 rounded-xl ${isPreview ? 'p-1' : 'p-2.5 bg-slate-50/30'}`}>
                  <span className={`${isPreview ? 'text-lg' : 'text-2xl'} arabic-font text-slate-300 font-bold mb-0.5`}>{getCombinedChar(selectedChar?.char || '', m.symbol)}</span>
                  <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3' : 'h-5'}`}></div>
                  <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3 mt-1' : 'h-5 mt-1'}`}></div>
                  <span className={`${isPreview ? 'text-[6px]' : 'text-[8px]'} text-slate-400 mt-1 font-bold`}>{m.nameAr} / {m.nameEn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Tanween */}
          <div>
            <div className={`bg-slate-100 ${isPreview ? 'p-0.5 px-1 mb-1' : 'p-1.5 px-2.5 mb-2'} rounded-lg border-r-4 border-slate-900 flex justify-between items-center`}>
              <h3 className={`${isPreview ? 'text-[10px]' : 'text-xs sm:text-sm'} font-bold text-slate-800`}>{t.wsSection5}</h3>
              <span className={`${isPreview ? 'text-[7px]' : 'text-[9px]'} font-bold text-slate-400 uppercase tracking-wider font-sans`} dir="ltr">{t.wsSection5En}</span>
            </div>
            <div className={`grid grid-cols-3 ${isPreview ? 'gap-1.5' : 'gap-3'}`}>
              {TANWEEN.map((tn, i) => (
                <div key={i} className={`flex flex-col items-center border border-slate-200 rounded-xl ${isPreview ? 'p-1' : 'p-2.5 bg-slate-50/30'}`}>
                  <span className={`${isPreview ? 'text-lg' : 'text-2xl'} arabic-font text-slate-300 font-bold mb-0.5`}>{getCombinedChar(selectedChar?.char || '', tn.symbol)}</span>
                  <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3' : 'h-5'}`}></div>
                  <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3 mt-1' : 'h-5 mt-1'}`}></div>
                  <span className={`${isPreview ? 'text-[6px]' : 'text-[8px]'} text-slate-400 mt-1 font-bold`}>{tn.nameAr} / {tn.nameEn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`${isPreview ? 'mt-1.5 pt-1 text-[7px]' : 'mt-4 pt-2 text-xs'} border-t border-slate-200 flex justify-between items-center text-slate-400 font-bold`}>
          <span>منصة قُل التعليمية - أوراق عمل الحروف التفاعلية</span>
          <span>صفحة ١ من ١</span>
        </div>
      </div>
    </div>
  );
};

const PrintableLetterWorksheet: React.FC<{
  selectedChar: any;
  t: any;
  lang: 'ar' | 'en';
  shapes: any;
  worksheetRef: React.RefObject<HTMLDivElement>;
}> = ({ selectedChar, t, lang, shapes, worksheetRef }) => {
  return (
    <div className="fixed top-0 left-0 -z-50 pointer-events-none opacity-0 overflow-hidden w-[800px] bg-white">
      <LetterWorksheetContent selectedChar={selectedChar} t={t} lang={lang} shapes={shapes} worksheetRef={worksheetRef} isPreview={false} />
    </div>
  );
};

const LetterWorksheetPreviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedChar: any;
  t: any;
  lang: 'ar' | 'en';
  shapes: any;
  onDownload: () => void;
  isGenerating: boolean;
}> = ({ isOpen, onClose, selectedChar, t, lang, shapes, onDownload, isGenerating }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 overflow-y-auto cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-100 rounded-2xl max-w-2xl w-full max-h-[96vh] my-auto flex flex-col overflow-hidden shadow-2xl border border-slate-300/80 cursor-default"
        >
          {/* Modal Header */}
          <div className="bg-white px-4 py-2.5 md:px-5 md:py-3 border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-black text-slate-800 arabic-font">
                  معاينة ورقة عمل: {t.letterHeading} {lang === 'ar' ? selectedChar?.name : selectedChar?.translit}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold arabic-font">ورقة عمل تفاعلية للطباعة والتنزيل</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
              title="إغلاق"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body - Whole Sheet Displayed Directly */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-slate-200/90 flex items-center justify-center custom-scroll min-h-0">
            <div className="relative bg-white shadow-xl rounded-xl overflow-hidden w-full max-w-[500px] border border-slate-300 p-0.5">
              <LetterWorksheetContent selectedChar={selectedChar} t={t} lang={lang} shapes={shapes} isPreview={true} />

              {/* Simple Download Button at Bottom-Left of the Preview Worksheet */}
              <button
                onClick={onDownload}
                disabled={isGenerating}
                className="absolute bottom-2.5 left-2.5 w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 border border-white/50"
                title="تحميل PDF"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const Letters: React.FC = () => {
  const { user, profile } = useAuth();
  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin' || user?.email === 'he4amali22@gmail.com';
  const [showTeacherInbox, setShowTeacherInbox] = React.useState(false);
  const [pendingSubmissionsCount, setPendingSubmissionsCount] = React.useState(0);

  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  const [loadingChar, setLoadingChar] = React.useState<string | null>(null);
  const [selectedChar, setSelectedChar] = React.useState<typeof ALPHABET[0] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verificationResult, setVerificationResult] = React.useState<any>(null);
  const [masteredLetters, setMasteredLetters] = React.useState<string[]>([]);
  const [masteredDetailed, setMasteredDetailed] = React.useState<any[]>([]);
  const [activeTab, setActiveTab] = React.useState<'practice' | 'soundlab' | 'game' | 'words' | 'tashkeel'>('practice');
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = React.useState(false);
  const [showWorksheetPreview, setShowWorksheetPreview] = React.useState(false);
  
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const worksheetRef = React.useRef<HTMLDivElement>(null);

  const t = STRINGS[lang];

  // Real-time pending submissions count listener
  React.useEffect(() => {
    try {
      const colRef = collection(db, 'letter_submissions');
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        let count = 0;
        snapshot.forEach((docSnap) => {
          if (docSnap.data().status === 'pending') count++;
        });
        setPendingSubmissionsCount(count);
      }, () => {
        try {
          const localSaved = localStorage.getItem('hub_letter_submissions');
          if (localSaved) {
            const list = JSON.parse(localSaved);
            setPendingSubmissionsCount(list.filter((s: any) => s.status === 'pending').length);
          }
        } catch (_) {}
      });
      return () => unsubscribe();
    } catch (_) {}
  }, []);

  const generateWorksheet = async () => {
    if (!worksheetRef.current) return;
    setIsGeneratingWorksheet(true);
    try {
      const canvas = await html2canvas(worksheetRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      let printWidth = pdfPageWidth;
      let printHeight = (imgProps.height * pdfPageWidth) / imgProps.width;

      if (printHeight > pdfPageHeight) {
        printHeight = pdfPageHeight;
        printWidth = (imgProps.width * printHeight) / imgProps.height;
      }

      const xOffset = Math.max(0, (pdfPageWidth - printWidth) / 2);
      const yOffset = Math.max(0, (pdfPageHeight - printHeight) / 2);

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, printWidth, printHeight);
      pdf.save(`Qul_Letter_Worksheet_${selectedChar?.name}_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGeneratingWorksheet(false);
    }
  };

  React.useEffect(() => {
    const saved = localStorage.getItem('hub_mastered_letters');
    if (saved) setMasteredLetters(JSON.parse(saved));

    const savedDetailed = localStorage.getItem('hub_mastered_letters_detailed');
    if (savedDetailed) setMasteredDetailed(JSON.parse(savedDetailed));

    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  const saveMastery = (char: string, stars: number = 3) => {
    const updated = Array.from(new Set([...masteredLetters, char]));
    setMasteredLetters(updated);
    localStorage.setItem('hub_mastered_letters', JSON.stringify(updated));

    const newDetail = { char, stars, date: new Date().toISOString() };
    const updatedDetailed = [...masteredDetailed.filter(m => m.char !== char), newDetail];
    setMasteredDetailed(updatedDetailed);
    localStorage.setItem('hub_mastered_letters_detailed', JSON.stringify(updatedDetailed));
  };

  const initAudio = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      } catch (e) {
        console.warn("AudioContext with 24000Hz not supported, falling back to default.");
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    }
  };

  const handleSpeak = async (textToSpeak: string, displayChar: string) => {
    setLoadingChar(displayChar);
    try {
      await speak(textToSpeak, 'ar');
    } catch (e: any) {
      if (e?.message?.includes('429')) setError(t.quotaError);
    } finally {
      setLoadingChar(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedChar) return;
    const file = e.target.files[0];
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const filePart = await fileToGenerativePart(file);
      const result = await verifyLetterWorksheet(filePart, selectedChar.char, selectedChar.name);
      setVerificationResult(result);
      if (result.passed) saveMastery(selectedChar.char);

      // Save submission to database for teacher inbox review
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Img = reader.result as string;
          const newSubmission = {
            char: selectedChar.char,
            charName: selectedChar.name,
            studentId: user?.uid || `guest-${Date.now()}`,
            studentName: user?.displayName || profile?.displayName || (lang === 'ar' ? 'طالب متميز' : 'Student'),
            studentEmail: user?.email || '',
            studentPhoto: user?.photoURL || '',
            imageUrl: base64Img || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
            status: 'pending',
            aiFeedback: {
              passed: result.passed || false,
              score: result.passed ? 95 : 75,
              feedback_ar: result.feedback_ar || '',
              feedback_en: result.feedback_en || '',
              observations: result.observations || []
            },
            teacherGrade: result.passed ? 5 : 4,
            teacherNotes: '',
            badge: result.passed ? '✍️ خطاط متميز' : '💡 محاولة ممتازة'
          };

          try {
            await addDoc(collection(db, 'letter_submissions'), {
              ...newSubmission,
              submittedAt: serverTimestamp()
            });
          } catch (dbErr) {
            const localSaved = localStorage.getItem('hub_letter_submissions');
            const currentList = localSaved ? JSON.parse(localSaved) : [];
            const updatedList = [{ ...newSubmission, id: `sub-${Date.now()}`, submittedAt: new Date().toISOString() }, ...currentList];
            localStorage.setItem('hub_letter_submissions', JSON.stringify(updatedList));
          }
        };
        reader.readAsDataURL(file);
      } catch (saveErr) {
        console.warn("Could not save letter submission for teacher:", saveErr);
      }
    } catch (err) {
      setError("Failed to verify handwriting.");
    } finally {
      setIsVerifying(false);
    }
  };

  const shapes = React.useMemo(() => {
    if (!selectedChar) return null;
    const base = selectedChar.char.replace('ـ', '');
    const noLeft = ['أ', 'د', 'ذ', 'ر', 'ز', 'و'].includes(base);
    if (selectedChar.char === 'هـ') return { isolated: 'ه', initial: 'هــ', medial: 'ــهــ', final: 'ــه' };
    if (selectedChar.char === 'ت') return { isolated: 'ت', initial: 'تــ', medial: 'ــتــ', final: 'ــت', special: 'ة' };
    return {
      isolated: base,
      initial: noLeft ? base : base + 'ـ',
      medial: noLeft ? 'ـ' + base : 'ـ' + base + 'ـ',
      final: 'ـ' + base
    };
  }, [selectedChar]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full flex flex-col h-full bg-white overflow-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      
      {/* Printable Letter Worksheet (Hidden for canvas render) */}
      <PrintableLetterWorksheet selectedChar={selectedChar} t={t} lang={lang} shapes={shapes} worksheetRef={worksheetRef} />

      {/* Letter Worksheet Preview Modal */}
      <LetterWorksheetPreviewModal
        isOpen={showWorksheetPreview}
        onClose={() => setShowWorksheetPreview(false)}
        selectedChar={selectedChar}
        t={t}
        lang={lang}
        shapes={shapes}
        onDownload={generateWorksheet}
        isGenerating={isGeneratingWorksheet}
      />

      {/* Teacher Letter Homework Inbox Modal */}
      <LetterHomeworkInboxModal
        isOpen={showTeacherInbox}
        onClose={() => setShowTeacherInbox(false)}
        selectedChar={selectedChar}
        lang={lang}
      />

      {/* Verification Modal */}
      {verificationResult && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col p-8 items-center text-center">
              {verificationResult.passed ? <Award size={80} className="text-amber-500 mb-4 animate-bounce" /> : <XCircle size={80} className="text-red-500 mb-4" />}
              <h2 className="text-2xl font-black arabic-font mb-2">{verificationResult.passed ? t.passed : t.failed}</h2>
              <div className="w-full h-px bg-slate-100 my-4" />
              <div className="text-right w-full space-y-4">
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-md font-black text-slate-800 arabic-font leading-relaxed">{verificationResult.feedback_ar}</p>
                    <p className="text-xs italic text-slate-400 mt-2">{verificationResult.feedback_en}</p>
                 </div>
                 {verificationResult.observations && (
                   <ul className="space-y-1">
                      {verificationResult.observations.map((obs: string, i: number) => (
                        <li key={i} className="text-sm font-bold text-slate-600 flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {obs}
                        </li>
                      ))}
                   </ul>
                 )}
              </div>
              <div className="mt-8 flex gap-3 w-full">
                 <button onClick={() => setVerificationResult(null)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase">Close</button>
                 {verificationResult.passed && <button onClick={() => window.print()} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2"><Share2 size={18} /> Share Mastery</button>}
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title={selectedChar ? `${t.letterHeading} ${lang === 'ar' ? selectedChar.name : selectedChar.translit}` : t.title}
        icon={TypeIcon}
        lang={lang}
        onToggle={toggleLang}
      />

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative no-print">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 p-2 md:p-3 overflow-hidden bg-slate-50/20 flex flex-col space-y-2">
          
          {/* Alphabet Grid (Top Half) */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-none max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-black text-slate-800 arabic-font">{t.subtitle}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.instr}</p>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {ALPHABET.map((item) => {
                const isMastered = masteredLetters.includes(item.char);
                return (
                  <button
                    key={item.char}
                    onClick={() => { setSelectedChar(item); handleSpeak(`حرف ${item.char}`, item.char); }}
                    className={`group relative w-10 h-10 bg-white border-2 rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm ${
                      selectedChar?.char === item.char ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-300'
                    }`}
                  >
                    {isMastered && <div className="absolute top-0.5 right-0.5 text-amber-500"><Award size={8} fill="currentColor" /></div>}
                    {loadingChar === item.char ? (
                      <Loader2 className="animate-spin text-blue-500" size={14} />
                    ) : (
                      <span className="text-xl font-black text-slate-800 arabic-font">{item.char}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tool Container Area (Bottom Half) */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedChar ? (
              <div className="flex flex-col h-full space-y-2">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col w-full max-w-5xl mx-auto animate-in slide-in-from-top-6 duration-500 no-print h-full">
                  {/* Shared Tool Header */}
                  <div className="bg-slate-50 px-4 py-2 flex items-center justify-between border-b border-slate-100 shrink-0">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setActiveTab('practice')}
                        className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'practice' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                      >
                        <PenTool size={14} />
                        <span>{t.practiceBtn}</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('soundlab')}
                        className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'soundlab' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                      >
                        <Activity size={14} />
                        <span>{t.soundLabBtn}</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('game')}
                        className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'game' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                      >
                        <Music size={14} />
                        <span>{t.auditGameBtn}</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('words')}
                        className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'words' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                      >
                        <BookOpen size={14} />
                        <span>{t.wordDiscrimBtn}</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('tashkeel')}
                        className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'tashkeel' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                      >
                        <Sparkles size={14} />
                        <span>{t.letterTashkeelBtn}</span>
                      </button>
                    </div>
                    <button onClick={() => setSelectedChar(null)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                      <XCircle size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-hidden p-3 flex flex-col">
                    {activeTab === 'practice' && (
                      <TracingBoard 
                        char={selectedChar.char} 
                        shapes={shapes} 
                        t={t}
                        lang={lang}
                        onMastered={(stars) => saveMastery(selectedChar.char, stars)}
                      />
                    )}
                    {activeTab === 'soundlab' && (
                      <SoundLab 
                        char={selectedChar.char} 
                        t={t} 
                        lang={lang}
                        onSpeak={handleSpeak}
                      />
                    )}
                    {activeTab === 'game' && (
                      <AuditoryGame 
                        char={selectedChar.char}
                        t={t} 
                        onSpeak={handleSpeak}
                      />
                    )}
                    {activeTab === 'words' && (
                      <WordDiscriminationGame 
                        char={selectedChar.char}
                        t={t}
                        lang={lang}
                        onSpeak={handleSpeak}
                      />
                    )}
                    {activeTab === 'tashkeel' && (
                      <WordTashkeelGame 
                        char={selectedChar.char}
                        t={t}
                        lang={lang}
                        onSpeak={handleSpeak}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-2 animate-in fade-in zoom-in duration-700">
                 <div>
                    <h3 className="text-xl font-black text-slate-800 arabic-font mb-1">{t.welcome}</h3>
                    {lang === 'en' && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{t.welcomeSub}</p>}
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Detail */}
        <div className={`w-full md:w-72 shrink-0 border-slate-100 ${lang === 'ar' ? 'md:border-r' : 'md:border-l'} bg-white p-3 flex flex-col items-center justify-between animate-in slide-in-from-right-5 overflow-hidden z-10`}>
          {selectedChar ? (
            <div className="flex flex-col h-full w-full max-w-[260px] justify-between">
              
              <div className="space-y-1 shrink-0 pb-1">
                {/* Clean Letter Name Header */}
                <div className="text-center pt-0.5">
                  <h3 className="text-base font-black text-slate-800 arabic-font">
                    {lang === 'ar' ? selectedChar.name : selectedChar.translit}
                  </h3>
                  <TranslitDisplay text={selectedChar.translit} className={`text-[9px] font-black text-slate-400 uppercase tracking-widest block ${lang === 'en' ? 'hidden' : ''}`} />
                </div>

                {/* Interactive Seamless Letter & Example Word Row */}
                <div className="flex items-center justify-around py-1 px-2">
                  {/* Clickable Letter */}
                  <button
                    onClick={() => handleSpeak(`حرف ${selectedChar.char}`, selectedChar.char)}
                    className="relative group flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
                    title={lang === 'ar' ? 'انقر لنطق الحرف' : 'Click to pronounce letter'}
                  >
                    <span className="text-5xl font-black text-blue-600 group-hover:text-blue-700 arabic-font transition-colors">
                      {selectedChar.char}
                    </span>
                    {loadingChar && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-full">
                        <Loader2 className="animate-spin text-blue-600" size={20} />
                      </div>
                    )}
                  </button>

                  {/* Clickable Example Word & Emoji */}
                  {selectedChar.example && (
                    <button
                      onClick={() => handleSpeak(selectedChar.example, selectedChar.example)}
                      className="group flex items-center gap-2 transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
                      title={lang === 'ar' ? `انقر لنطق ${selectedChar.example}` : `Click to pronounce ${selectedChar.example}`}
                    >
                      <span className="text-3xl select-none transition-transform duration-200 group-hover:scale-125">
                        {selectedChar.emoji}
                      </span>
                      <span className="text-xl font-black text-slate-800 group-hover:text-amber-600 arabic-font leading-none transition-colors">
                        {selectedChar.example}
                      </span>
                    </button>
                  )}
                </div>

                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 text-center border-b border-slate-200 pb-0.5">{t.shapesTitle}</p>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    {['initial', 'medial', 'final', 'isolated'].map((s:any) => (
                      <div key={s} className="flex flex-col">
                        <span className="text-lg arabic-font text-slate-700">{(shapes as any)[s]}</span>
                        <span className="text-[6px] font-bold text-slate-400 uppercase">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-1.5 py-1.5 overflow-y-auto custom-scroll px-1">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.harakatTitle}</p>
                  <div className="grid grid-cols-4 gap-1">
                    {HARAKAT.map((h) => (
                      <button key={h.symbol} onClick={() => handleSpeak(getCombinedChar(selectedChar.char, h.symbol), `h-${h.symbol}`)} className={`group flex flex-col items-center justify-center p-1.5 rounded-xl border border-transparent transition-all hover:shadow-md ${h.color}`}>
                        <span className="text-lg font-black arabic-font">{getCombinedChar(selectedChar.char, h.symbol)}</span>
                        <span className="text-[6px] font-black uppercase opacity-60">{lang === 'ar' ? h.nameAr : h.nameEn}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.shaddaTitle}</p>
                  <div className="grid grid-cols-3 gap-1">
                    {SHADDA_VARIATIONS.map((sv) => (
                      <button key={sv.symbol} onClick={() => handleSpeak(getCombinedChar(selectedChar.char, sv.symbol), `sv-${sv.symbol}`)} className={`group flex flex-col items-center justify-center p-1.5 rounded-xl border border-transparent transition-all hover:shadow-md ${sv.color}`}>
                        <span className="text-lg font-black arabic-font">{getCombinedChar(selectedChar.char, sv.symbol)}</span>
                        <span className="text-[6px] font-black uppercase opacity-60">{lang === 'ar' ? sv.nameAr : sv.nameEn}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.madTitle}</p>
                  <div className="grid grid-cols-3 gap-1">
                    {MAD_VOWELS.map((m) => (
                      <button key={m.symbol} onClick={() => handleSpeak(getCombinedChar(selectedChar.char, m.symbol), `m-${m.symbol}`)} className={`group flex flex-col items-center justify-center p-1.5 rounded-xl border border-transparent transition-all hover:shadow-md ${m.color}`}>
                        <span className="text-lg font-black arabic-font">{getCombinedChar(selectedChar.char, m.symbol)}</span>
                        <span className="text-[6px] font-black uppercase opacity-60">{lang === 'ar' ? m.nameAr : m.nameEn}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.tanweenTitle}</p>
                  <div className="grid grid-cols-3 gap-1">
                    {TANWEEN.map((tn) => (
                      <button key={tn.symbol} onClick={() => handleSpeak(getCombinedChar(selectedChar.char, tn.symbol), `tn-${tn.symbol}`)} className={`group flex flex-col items-center justify-center p-1.5 rounded-xl border border-transparent transition-all hover:shadow-md ${tn.color}`}>
                        <span className="text-lg font-black arabic-font">{getCombinedChar(selectedChar.char, tn.symbol)}</span>
                        <span className="text-[6px] font-black uppercase opacity-60">{lang === 'ar' ? tn.nameAr : tn.nameEn}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="shrink-0 pt-1 border-t border-slate-50 space-y-1.5">
                <div className="grid grid-cols-1 gap-1.5">
                   <button 
                     onClick={() => setShowWorksheetPreview(true)} 
                     disabled={isGeneratingWorksheet}
                     className="w-full py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                   >
                      {isGeneratingWorksheet ? <Loader2 className="animate-spin" size={14} /> : <FileText size={14} />} 
                      <span>{t.downloadBtn}</span>
                   </button>
                   {isTeacher ? (
                     <button 
                       onClick={() => setShowTeacherInbox(true)} 
                       className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-[10px] flex items-center justify-center gap-1.5 shadow-lg shadow-blue-100 transition-all hover:from-blue-700 hover:to-indigo-700 active:scale-95 group relative"
                     >
                       <Inbox size={14} className="text-amber-300 animate-pulse" /> 
                       <span>{lang === 'ar' ? 'صندوق واجبات الطلاب' : 'Student Homework Inbox'}</span>
                       {pendingSubmissionsCount > 0 && (
                         <span className="bg-amber-400 text-slate-900 text-[9px] font-black px-1.5 py-0.2 rounded-full leading-tight mr-1 ml-1 animate-bounce">
                           {pendingSubmissionsCount}
                         </span>
                       )}
                     </button>
                   ) : (
                     <>
                       <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 bg-[#2563eb] text-white rounded-xl font-black text-[10px] flex items-center justify-center gap-1.5 shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95">
                          {isVerifying ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />} <span>{t.uploadBtn}</span>
                       </button>
                       <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleUpload(e)} className="hidden" accept="image/*" />
                     </>
                   )}
                </div>
                {error && <div className="flex items-center gap-1.5 p-1.5 bg-red-50 text-red-600 text-[7px] font-bold rounded-lg"><AlertCircle size={10} /> <p>{error}</p></div>}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none px-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><TypeIcon size={32} className="text-slate-300" /></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">Select a letter to explore</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
