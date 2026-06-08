
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Globe, Volume2, Loader2, Type as TypeIcon, ChevronLeft, ArrowRight, AlertCircle, Music, Wind, Download, Upload, FileText, CheckCircle2, XCircle, Award, Share2, PenTool, RefreshCcw, Paintbrush, Palette, Play, Star, CheckCircle, Edit3, BrainCircuit, Mic, Activity } from 'lucide-react';
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { generateSpeech, decodeAudioData, verifyLetterWorksheet, fileToGenerativePart, generateContentWithRetry, speak } from '../services/gemini';
import { GoogleGenAI, Type } from "@google/genai";

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ALPHABET = [
  { char: 'أ', name: 'ألف', translit: "ALIF" },
  { char: 'ب', name: 'باء', translit: "BA'" },
  { char: 'ت', name: 'تاء', translit: "TA'" },
  { char: 'ث', name: 'ثاء', translit: "THA'" },
  { char: 'ج', name: 'جيم', translit: "JIM" },
  { char: 'ح', name: 'حاء', translit: "ḤA'" }, 
  { char: 'خ', name: 'خاء', translit: "KHA'" },
  { char: 'د', name: 'دال', translit: "DAL" },
  { char: 'ذ', name: 'ذال', translit: "THAL" },
  { char: 'ر', name: 'راء', translit: "RA'" },
  { char: 'ز', name: 'زاي', translit: "ZAY" },
  { char: 'س', name: 'سين', translit: "SIN" },
  { char: 'ش', name: 'شين', translit: "SHIN" },
  { char: 'ص', name: 'صاد', translit: "ṢAD" }, 
  { char: 'ض', name: 'ضاد', translit: "ḌAD" }, 
  { char: 'ط', name: 'طاء', translit: "ṬA'" },  
  { char: 'ظ', name: 'ظاء', translit: "DHA'" },  
  { char: 'ع', name: 'عين', translit: "ẠIN" },  
  { char: 'غ', name: 'غين', translit: "GHAYN" },
  { char: 'ف', name: 'فاء', translit: "FA'" },
  { char: 'ق', name: 'قاف', translit: "QAF" },
  { char: 'ك', name: 'كاف', translit: "KAF" },
  { char: 'ل', name: 'لام', translit: "LAM" },
  { char: 'م', name: 'ميم', translit: "MIM" },
  { char: 'ن', name: 'نون', translit: "NUN" },
  { char: 'هـ', name: 'هاء', translit: "HA'" },
  { char: 'و', name: 'واو', translit: "WAW" },
  { char: 'ي', name: 'ياء', translit: "YA'" },
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
    downloadBtn: 'تحميل ورقة العمل',
    uploadBtn: 'رفع وتدقيق الحرف',
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
    worksheetTitle: 'ورقة عمل'
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
    downloadBtn: 'Download Worksheet',
    uploadBtn: 'Upload & Verify',
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
    worksheetTitle: 'Worksheet'
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


const TranslitDisplay: React.FC<{ text: string, className?: string }> = ({ text, className }) => {
  return (
    <span className={`${className} inline-block`} dir="ltr">
      {'\u200E'}{text}
    </span>
  );
};

export const Letters: React.FC = () => {
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
  const [activeTab, setActiveTab] = React.useState<'practice' | 'soundlab' | 'game'>('practice');
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = React.useState(false);
  
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const worksheetRef = React.useRef<HTMLDivElement>(null);

  const t = STRINGS[lang];

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
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const filePart = await fileToGenerativePart(e.target.files[0]);
      const result = await verifyLetterWorksheet(filePart, selectedChar.char, selectedChar.name);
      setVerificationResult(result);
      if (result.passed) saveMastery(selectedChar.char);
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
      
      {/* Printable Worksheet (Hidden in UI) */}
      <div className="fixed left-[-9999px] top-0">
        <div 
          ref={worksheetRef}
          className="w-[800px] bg-white p-12 text-slate-900 arabic-font"
          dir="rtl"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-center">
            <div className="w-1/3">
              <h1 className="text-xl font-bold max-w-[200px] leading-[2] pb-4">{t.letterHeading} {lang === 'ar' ? selectedChar?.name : selectedChar?.translit}</h1>
              <p className="text-slate-400 text-[10px] uppercase font-bold">{selectedChar ? `${selectedChar.translit} Letter` : 'Alphabet'}</p>
            </div>
            <div className="w-1/3 text-center">
              <h2 className="text-xl font-black leading-relaxed pb-4">{t.worksheetTitle}</h2>
            </div>
            <div className="w-1/3 text-left">
              <div className="text-xl font-black tracking-tighter text-slate-900 mb-0.5 leading-relaxed pb-4" dir="ltr">
                QUL / قُل
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Interactive Learning</div>
            </div>
          </div>

          {/* Learner Info */}
          <div className="flex gap-8 mb-4 border-b border-slate-100 pb-2">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase whitespace-nowrap">{t.learnerName}</span>
              <div className="flex-1 border-b border-slate-300 h-5"></div>
            </div>
            <div className="w-1/3 flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase whitespace-nowrap">{t.date}</span>
              <div className="flex-1 border-b border-slate-300 h-5 text-xs flex items-end font-sans">
                {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

          {/* Section 1: Letter Shapes */}
          <div className="mb-4">
            <div className="bg-slate-100 p-1.5 rounded-lg mb-2 border-r-4 border-slate-900 flex justify-between items-center">
              <h2 className="text-sm font-bold">{t.wsSection1}</h2>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider" dir="ltr">{t.wsSection1En}</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {['isolated', 'initial', 'medial', 'final'].map((s:any) => (
                <div key={s} className="flex flex-col items-center border border-slate-100 rounded-xl p-2">
                  <span className="text-2xl arabic-font text-slate-200 mb-1">{(shapes as any)?.[s]}</span>
                  <div className="w-full border-b border-slate-200 border-dashed h-6"></div>
                  <div className="w-full border-b border-slate-200 border-dashed h-6 mt-1"></div>
                  <span className="text-[7px] text-slate-400 mt-1 uppercase font-bold">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Short Vowels */}
          <div className="mb-4">
            <div className="bg-slate-100 p-1.5 rounded-lg mb-2 border-r-4 border-slate-900 flex justify-between items-center">
              <h2 className="text-sm font-bold">{t.wsSection2}</h2>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider" dir="ltr">{t.wsSection2En}</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {HARAKAT.map((h, i) => (
                <div key={i} className="flex flex-col items-center border border-slate-100 rounded-xl p-2">
                  <span className="text-2xl arabic-font text-slate-200 mb-1">{getCombinedChar(selectedChar?.char || '', h.symbol)}</span>
                  <div className="w-full border-b border-slate-200 border-dashed h-6"></div>
                  <div className="w-full border-b border-slate-200 border-dashed h-6 mt-1"></div>
                  <span className="text-[7px] text-slate-400 mt-1 font-bold">{h.nameAr} / {h.nameEn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Shadda */}
          <div className="mb-4">
            <div className="bg-slate-100 p-1.5 rounded-lg mb-2 border-r-4 border-slate-900 flex justify-between items-center">
              <h2 className="text-sm font-bold">{t.wsSection3}</h2>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider" dir="ltr">{t.wsSection3En}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {SHADDA_VARIATIONS.map((sv, i) => (
                <div key={i} className="flex flex-col items-center border border-slate-100 rounded-xl p-2">
                  <span className="text-2xl arabic-font text-slate-200 mb-1">{getCombinedChar(selectedChar?.char || '', sv.symbol)}</span>
                  <div className="w-full border-b border-slate-200 border-dashed h-6"></div>
                  <div className="w-full border-b border-slate-200 border-dashed h-6 mt-1"></div>
                  <span className="text-[7px] text-slate-400 mt-1 font-bold">{sv.nameAr} / {sv.nameEn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Long Vowels */}
          <div className="mb-4">
            <div className="bg-slate-100 p-1.5 rounded-lg mb-2 border-r-4 border-slate-900 flex justify-between items-center">
              <h2 className="text-sm font-bold">{t.wsSection4}</h2>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider" dir="ltr">{t.wsSection4En}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {MAD_VOWELS.map((m, i) => (
                <div key={i} className="flex flex-col items-center border border-slate-100 rounded-xl p-2">
                  <span className="text-2xl arabic-font text-slate-200 mb-1">{getCombinedChar(selectedChar?.char || '', m.symbol)}</span>
                  <div className="w-full border-b border-slate-200 border-dashed h-6"></div>
                  <div className="w-full border-b border-slate-200 border-dashed h-6 mt-1"></div>
                  <span className="text-[7px] text-slate-400 mt-1 font-bold">{m.nameAr} / {m.nameEn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Tanween */}
          <div>
            <div className="bg-slate-100 p-1.5 rounded-lg mb-2 border-r-4 border-slate-900 flex justify-between items-center">
              <h2 className="text-sm font-bold">{t.wsSection5}</h2>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider" dir="ltr">{t.wsSection5En}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {TANWEEN.map((tn, i) => (
                <div key={i} className="flex flex-col items-center border border-slate-100 rounded-xl p-2">
                  <span className="text-2xl arabic-font text-slate-200 mb-1">{getCombinedChar(selectedChar?.char || '', tn.symbol)}</span>
                  <div className="w-full border-b border-slate-200 border-dashed h-6"></div>
                  <div className="w-full border-b border-slate-200 border-dashed h-6 mt-1"></div>
                  <span className="text-[7px] text-slate-400 mt-1 font-bold">{tn.nameAr} / {tn.nameEn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
              
              <div className="space-y-1.5 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center border-2 border-blue-100 shadow-lg relative cursor-pointer" onClick={() => handleSpeak(`حرف ${selectedChar.char}`, selectedChar.char)}>
                     <span className="text-4xl font-black text-blue-600 arabic-font">{selectedChar.char}</span>
                     {loadingChar && (
                       <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-2xl">
                         <Loader2 className="animate-spin text-blue-600" size={20} />
                       </div>
                     )}
                  </div>
                  <div className="flex-1 px-3 text-center">
                    <h3 className="text-lg font-black text-slate-800 arabic-font">{lang === 'ar' ? selectedChar.name : selectedChar.translit}</h3>
                    <TranslitDisplay text={selectedChar.translit} className={`text-[10px] font-black text-slate-400 uppercase tracking-widest ${lang === 'en' ? 'hidden' : ''}`} />
                  </div>
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
                     onClick={generateWorksheet} 
                     disabled={isGeneratingWorksheet}
                     className="w-full py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                   >
                      {isGeneratingWorksheet ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />} 
                      <span>{t.downloadBtn}</span>
                   </button>
                   <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 bg-[#2563eb] text-white rounded-xl font-black text-[10px] flex items-center justify-center gap-1.5 shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95">
                      {isVerifying ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />} <span>{t.uploadBtn}</span>
                   </button>
                   <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleUpload(e)} className="hidden" accept="image/*" />
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
