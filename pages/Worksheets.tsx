import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Download, Sparkles, Loader2, Printer, BookOpen, PenTool, 
  Type, Library, Upload, Users, GraduationCap, CheckCircle2, 
  XCircle, Copy, Share2, Play, Eye, Edit3, Trash2, ArrowLeft,
  Check, AlertCircle, Info
} from 'lucide-react';
import { generateWorksheet, analyzeWorksheetImage } from '../services/gemini';
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';
import { db, handleFirestoreError, OperationType, serverTimestamp } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';

// --- Types ---

interface Exercise {
  question_ar: string;
  question_en: string;
  type: 'mcq' | 'fill_blank' | 'true_false' | 'open';
  options?: string[];
  answer?: string;
}

interface WorksheetData {
  title_ar: string;
  title_en?: string;
  content_ar?: string;
  content_en?: string;
  vocabulary?: { word: string; meaning_ar: string; meaning_en: string }[];
  sections?: {
    skill_ar: string;
    skill_en: string;
    questions: {
      text: string;
      type: string;
      options?: string[];
      answer?: string;
    }[];
  }[];
}

interface InteractiveQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'fill_blank' | 'matching';
  question_text: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  user_answer?: string;
  is_correct?: boolean;
}

interface InteractiveSection {
  section_title: string;
  instructions: string;
  questions: InteractiveQuestion[];
}

interface InteractiveWorksheet {
  id: string;
  title: string;
  description: string;
  sections: InteractiveSection[];
  image_url?: string;
  created_at: number;
}

// --- Main Component ---

export const Worksheets: React.FC = () => {
  const [lang, setLang] = useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);
  
  const { user, profile, isAuthReady } = useAuth();
  
  // Navigation State
  const [mode, setMode] = useState<'hub' | 'interactive'>(profile?.role === 'student' ? 'interactive' : 'hub');
  const [portal, setPortal] = useState<'choice' | 'teacher' | 'student' | 'player'>(profile?.role === 'student' ? 'student' : 'choice');
  
  // Update mode/portal when profile loads
  useEffect(() => {
    if (isAuthReady && profile?.role === 'student') {
      setMode('interactive');
      if (portal === 'choice') setPortal('student');
    }
  }, [isAuthReady, profile]);
  
  // Hub State (AI Generator)
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [type, setType] = useState<'grammar' | 'reading' | 'vocabulary' | 'writing'>('reading');
  const [loading, setLoading] = useState(false);
  const [worksheet, setWorksheet] = useState<WorksheetData | null>(null);
  const worksheetRef = useRef<HTMLDivElement>(null);

  // Interactive State
  const [teacherWorksheets, setTeacherWorksheets] = useState<InteractiveWorksheet[]>([]);
  const [currentInteractive, setCurrentInteractive] = useState<InteractiveWorksheet | null>(null);
  const [studentCode, setStudentCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Quick Editor State
  const [editingItem, setEditingItem] = useState<{ sectionIdx: number, questionIdx: number, text: string } | null>(null);

  // Load Teacher Worksheets from Firestore
  useEffect(() => {
    if (!user || !isAuthReady) return;

    const q = query(collection(db, 'interactive_worksheets'), where('authorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const worksheets = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as InteractiveWorksheet[];
      setTeacherWorksheets(worksheets);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'interactive_worksheets');
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  const t = {
    title: lang === 'ar' ? 'أوراق العمل' : 'Worksheets',
    hubTitle: lang === 'ar' ? 'المولد الذكي' : 'AI Generator',
    interactiveTitle: lang === 'ar' ? 'الأوراق التفاعلية' : 'Interactive Sheets',
    subtitle: lang === 'ar' ? 'أنشئ أوراق عمل مخصصة للطباعة بضغطة زر' : 'Create custom printable worksheets with one click',
    topicPlaceholder: lang === 'ar' ? 'أدخل موضوعاً (مثلاً: السفر، العائلة، القواعد...)' : 'Enter a topic (e.g., Travel, Family, Grammar...)',
    generate: lang === 'ar' ? 'توليد ورقة العمل' : 'Generate Worksheet',
    download: lang === 'ar' ? 'تحميل PDF' : 'Download PDF',
    print: lang === 'ar' ? 'طباعة' : 'Print',
    level: lang === 'ar' ? 'المستوى' : 'Level',
    type: lang === 'ar' ? 'النوع' : 'Type',
    levels: {
      beginner: lang === 'ar' ? 'مبتدئ' : 'Beginner',
      intermediate: lang === 'ar' ? 'متوسط' : 'Intermediate',
      advanced: lang === 'ar' ? 'متقدم' : 'Advanced',
    },
    types: {
      reading: lang === 'ar' ? 'قراءة' : 'Reading',
      grammar: lang === 'ar' ? 'قواعد' : 'Grammar',
      vocabulary: lang === 'ar' ? 'مفردات' : 'Vocabulary',
      writing: lang === 'ar' ? 'كتابة' : 'Writing',
    },
    vocabulary: lang === 'ar' ? 'المفردات الهامة' : 'Key Vocabulary',
    exercises: lang === 'ar' ? 'التمارين' : 'Exercises',
    name: lang === 'ar' ? 'الاسم:' : 'Name:',
    date: lang === 'ar' ? 'التاريخ:' : 'Date:',
    teacherPortal: lang === 'ar' ? 'بوابة المعلم' : 'Teacher Portal',
    studentPortal: lang === 'ar' ? 'بوابة الطالب' : 'Student Portal',
    iamTeacher: lang === 'ar' ? 'أنا معلم' : 'I am a Teacher',
    iamStudent: lang === 'ar' ? 'أنا طالب' : 'I am a Student',
    uploadPrompt: lang === 'ar' ? 'ارفع صورة لورقة عمل لتحويلها' : 'Upload a worksheet image to convert',
    analyzing: lang === 'ar' ? 'جاري تحليل الورقة ذكياً...' : 'Analyzing worksheet with AI...',
    enterCode: lang === 'ar' ? 'أدخل رمز ورقة العمل' : 'Enter Worksheet Code',
    startSolving: lang === 'ar' ? 'ابدأ الحل' : 'Start Solving',
    finish: lang === 'ar' ? 'إنهاء وإظهار النتيجة' : 'Finish & Show Results',
    score: lang === 'ar' ? 'درجتك' : 'Your Score',
    back: lang === 'ar' ? 'رجوع' : 'Back',
    shareCode: lang === 'ar' ? 'رمز المشاركة' : 'Share Code',
  };

  // --- Hub Handlers ---

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const data = await generateWorksheet(topic, level, type);
      setWorksheet(data);
      
      // Save to Firestore if logged in
      if (user) {
        try {
          await addDoc(collection(db, 'worksheets'), {
            ...data,
            authorId: user.uid,
            type,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'worksheets');
        }
      }
    } catch (error) {
      console.error('Failed to generate worksheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = () => {
    if (!editingItem || !worksheet) return;
    const newWorksheet = { ...worksheet };
    if (newWorksheet.sections && newWorksheet.sections[editingItem.sectionIdx]) {
      newWorksheet.sections[editingItem.sectionIdx].questions[editingItem.questionIdx].text = editingItem.text;
      setWorksheet(newWorksheet);
    }
    setEditingItem(null);
  };

  const handleDownloadPDF = async () => {
    if (!worksheetRef.current) return;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pages = Array.from(worksheetRef.current.children);
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;
      const canvas = await html2canvas(page, { 
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }
    
    pdf.save(`Worksheet_${topic.replace(/\s+/g, '_') || 'Qul_Worksheet'}.pdf`);
  };

  // --- Interactive Handlers ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeWorksheetImage(file);
      const wsId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newWs: InteractiveWorksheet = {
        id: wsId,
        title: result.title || "ورقة عمل جديدة",
        description: result.description || "",
        sections: result.sections.map((section: any) => ({
          ...section,
          questions: section.questions.map((q: any) => ({ ...q, user_answer: '' }))
        })),
        created_at: Date.now()
      };

      // Save to Firestore
      try {
        await setDoc(doc(db, 'interactive_worksheets', wsId), {
          ...newWs,
          authorId: user.uid,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `interactive_worksheets/${wsId}`);
      }

      setCurrentInteractive(newWs);
      setPortal('player');
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStudentJoin = async () => {
    if (!studentCode) return;
    
    try {
      const wsDoc = await getDoc(doc(db, 'interactive_worksheets', studentCode.toUpperCase()));
      if (wsDoc.exists()) {
        setCurrentInteractive(wsDoc.data() as InteractiveWorksheet);
        setPortal('player');
        setShowResults(false);
      } else {
        alert(lang === 'ar' ? 'الرمز غير صحيح' : 'Invalid Code');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `interactive_worksheets/${studentCode}`);
    }
  };

  const handleAnswerChange = (qId: string, answer: string) => {
    if (!currentInteractive || showResults) return;
    const updated = { ...currentInteractive };
    const sections = updated.sections || [];
    for (const section of sections) {
      const q = section.questions.find(q => q.id === qId);
      if (q) {
        q.user_answer = answer;
        break;
      }
    }
    setCurrentInteractive({ ...updated, sections });
  };

  const calculateResults = () => {
    if (!currentInteractive) return;
    const updated = { ...currentInteractive };
    const sections = updated.sections || [];
    sections.forEach(section => {
      section.questions.forEach(q => {
        q.is_correct = q.user_answer?.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
      });
    });
    setCurrentInteractive({ ...updated, sections });
    setShowResults(true);
  };

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new CustomEvent('langChanged'));
  };

  // --- Render Helpers ---

  const renderHub = () => (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Topic Input Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm no-print">
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t.topicPlaceholder}</label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.topicPlaceholder}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 focus:ring-0 transition-all arabic-font font-bold text-xl"
              />
              <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 opacity-50" size={24} />
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {t.generate}
          </button>
        </div>
      </div>

      {/* Worksheet Preview */}
      <div className="flex-1 flex flex-col items-center">
        {worksheet ? (
          <div className="w-full flex flex-col items-center gap-6 pb-12">
            <div className="flex gap-4 no-print">
              <button onClick={handleDownloadPDF} className="bg-white text-slate-700 px-6 py-3 rounded-xl border border-slate-200 shadow-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
                <Download size={18} /> {t.download}
              </button>
              <button onClick={() => window.print()} className="bg-white text-slate-700 px-6 py-3 rounded-xl border border-slate-200 shadow-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
                <Printer size={18} /> {t.print}
              </button>
            </div>

            <div ref={worksheetRef} className="flex flex-col gap-8 print:gap-0">
              {/* PAGE 1: Content & Vocabulary */}
              <div className="w-[800px] min-h-[297mm] bg-white shadow-2xl p-12 flex flex-col gap-6 text-slate-900 print:shadow-none print:p-0 arabic-font mb-8 print:mb-0" dir="rtl">
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-center">
                  <div className="w-1/3">
                    <h1 className={`font-bold leading-[1.5] pb-1 ${worksheet.title_ar.length > 40 ? 'text-xs' : worksheet.title_ar.length > 25 ? 'text-sm' : 'text-base'}`}>
                      {worksheet.title_ar}
                    </h1>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{t.types[type as keyof typeof t.types] || 'General'}</p>
                  </div>
                  <div className="w-1/3 text-center">
                    <h2 className="text-2xl font-black leading-relaxed pb-4">{lang === 'ar' ? 'النص' : 'The Text'}</h2>
                  </div>
                  <div className="w-1/3 text-left">
                    <div className="text-2xl font-black tracking-tighter text-slate-900 mb-0.5 leading-relaxed pb-4" dir="ltr">
                      QUL / قُل
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interactive Learning</div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col gap-8 flex-1">
                  <div className="space-y-6">
                    <p className="text-xl leading-[2] text-justify font-medium text-slate-800">
                      {worksheet.content_ar}
                    </p>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-sm text-slate-500 leading-relaxed italic text-justify" dir="ltr">
                        {worksheet.content_en}
                      </p>
                    </div>
                  </div>

                  {/* Vocabulary Section */}
                  {worksheet.vocabulary && worksheet.vocabulary.length > 0 && (
                    <div className="mt-8">
                      <div className="bg-slate-900 text-white p-2 px-4 rounded-t-xl text-sm font-bold inline-block">
                        {lang === 'ar' ? 'المفردات والتراكيب' : 'Vocabulary & Phrases'}
                      </div>
                      <div className="border-2 border-slate-900 rounded-xl rounded-tr-none p-6 grid grid-cols-2 gap-x-12 gap-y-6">
                        {worksheet.vocabulary.map((v: any, i: number) => (
                          <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-lg font-bold text-slate-900">{v.word}</span>
                            <div className="text-left flex flex-col items-end">
                              <span className="text-base font-bold text-slate-700">{v.meaning_ar}</span>
                              <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider" dir="ltr">{v.meaning_en}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">1</div>
              </div>

              {/* PAGE 2: Exercises */}
              <div className="w-[800px] min-h-[297mm] bg-white shadow-2xl p-12 flex flex-col gap-4 text-slate-900 print:shadow-none print:p-0 arabic-font" dir="rtl">
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-center">
                  <div className="w-1/3">
                    <h1 className={`font-bold leading-[1.5] pb-1 ${worksheet.title_ar.length > 40 ? 'text-xs' : worksheet.title_ar.length > 25 ? 'text-sm' : 'text-base'}`}>
                      {worksheet.title_ar}
                    </h1>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{t.types[type as keyof typeof t.types] || 'General'}</p>
                  </div>
                  <div className="w-1/3 text-center">
                    <h2 className="text-2xl font-black leading-relaxed pb-4">{lang === 'ar' ? 'ورقة عمل' : 'Worksheet'}</h2>
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
                    <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">{t.name}</span>
                    <div className="flex-1 border-b border-slate-300 h-6"></div>
                  </div>
                  <div className="w-1/3 flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">{t.date}</span>
                    <div className="flex-1 border-b border-slate-300 h-6 text-sm flex items-end font-sans">
                      {new Date().toLocaleDateString('en-GB')}
                    </div>
                  </div>
                </div>

                {/* Skill-Based Sections */}
                <div className="flex flex-col gap-3">
                  {worksheet.sections?.map((section: any, idx: number) => {
                    const ordinals = ['أولاً', 'ثانياً', 'ثالثاً', 'رابعاً', 'خامساً'];
                    const ordinal = ordinals[idx] || `${idx + 1}-`;
                    
                    return (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="bg-slate-100 p-1.5 rounded-lg mb-0.5 border-r-4 border-slate-900 flex justify-between items-center">
                          <h2 className="text-sm font-bold">
                            {ordinal}: {section.skill_ar}
                          </h2>
                          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider" dir="ltr">
                            {section.skill_en}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 pr-6">
                          {section.questions.map((q: any, qIdx: number) => (
                            <div key={qIdx} className="flex flex-col gap-1">
                              <div className="flex gap-2">
                                <span className="w-4 h-4 bg-slate-900 text-white rounded-full flex items-center justify-center shrink-0 text-[8px] font-bold">
                                  {qIdx + 1}
                                </span>
                                <div 
                                  className="flex-1 group/edit relative cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors"
                                  onClick={() => setEditingItem({ sectionIdx: idx, questionIdx: qIdx, text: q.text })}
                                >
                                  <p className="text-xs font-bold leading-relaxed">{q.text}</p>
                                  <Edit3 size={10} className="absolute -left-4 top-1 text-blue-500 opacity-0 group-hover/edit:opacity-100 transition-opacity no-print" />
                                </div>
                              </div>
                              
                              {q.type === 'mcq' && q.options && (
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1 mr-6">
                                  {q.options.map((opt: string, oi: number) => (
                                    <div key={oi} className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 border border-slate-300 rounded-full" />
                                      <span className="text-[10px] font-bold">{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {(q.type === 'fill_blank' || q.type === 'open' || q.type === 'true_false') && (
                                <div className="mr-6">
                                  <div className="w-full border-b border-slate-200 border-dashed h-5" />
                                  {q.type === 'open' && <div className="w-full border-b border-slate-200 border-dashed h-5" />}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-2 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">2</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-20">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6"><FileText size={48} className="opacity-20" /></div>
            <p className="font-bold text-lg">{lang === 'ar' ? 'بانتظار إبداعك...' : 'Waiting for your creativity...'}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderInteractive = () => {
    if (portal === 'choice') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-12 animate-in zoom-in duration-500">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-3xl font-black text-slate-800 arabic-font">{t.interactiveTitle}</h2>
            <p className="text-slate-500 font-bold">{lang === 'ar' ? 'حول أوراقك التقليدية إلى تجربة تفاعلية ذكية' : 'Turn your traditional sheets into a smart interactive experience'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
            <button 
              onClick={() => setPortal('teacher')}
              className="group bg-white p-10 rounded-[2rem] border-2 border-slate-100 shadow-xl hover:border-blue-500 hover:shadow-blue-500/10 transition-all flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={40} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-slate-800 mb-2 arabic-font">{t.iamTeacher}</h3>
                <p className="text-sm text-slate-500 font-bold">{lang === 'ar' ? 'ارفع الأوراق، حللها، وشاركها مع طلابك' : 'Upload, analyze, and share with your students'}</p>
              </div>
            </button>

            <button 
              onClick={() => setPortal('student')}
              className="group bg-white p-10 rounded-[2rem] border-2 border-slate-100 shadow-xl hover:border-emerald-500 hover:shadow-emerald-500/10 transition-all flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap size={40} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-slate-800 mb-2 arabic-font">{t.iamStudent}</h3>
                <p className="text-sm text-slate-500 font-bold">{lang === 'ar' ? 'أدخل الرمز وابدأ الحل التفاعلي فوراً' : 'Enter code and start solving interactively'}</p>
              </div>
            </button>
          </div>
        </div>
      );
    }

    if (portal === 'teacher') {
      return (
        <div className="flex-1 flex flex-col gap-8 animate-in slide-in-from-right-8 duration-500">
          <div className="flex items-center justify-between">
            <button onClick={() => setPortal('choice')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">
              <ArrowLeft size={20} /> {t.back}
            </button>
            <h2 className="text-2xl font-black text-slate-800 arabic-font">{t.teacherPortal}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Area */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center gap-4 hover:border-blue-400 transition-colors relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isAnalyzing}
                />
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                  {isAnalyzing ? <Loader2 className="animate-spin text-blue-500" size={32} /> : <Upload size={32} />}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 arabic-font">{t.uploadPrompt}</h4>
                  <p className="text-xs text-slate-400 mt-1 font-bold">{lang === 'ar' ? 'يدعم الصور (JPG, PNG)' : 'Supports images (JPG, PNG)'}</p>
                </div>
                {isAnalyzing && (
                  <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-sm">
                    <Sparkles size={16} className="animate-pulse" />
                    {t.analyzing}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                <Info className="text-blue-500 shrink-0" size={20} />
                <p className="text-xs text-blue-700 leading-relaxed font-bold">
                  {lang === 'ar' 
                    ? 'سيقوم الذكاء الاصطناعي بقراءة الورقة وتحويل الأسئلة إلى صيغة تفاعلية (اختياري، صح/خطأ، أكمل الفراغ) تلقائياً.' 
                    : 'AI will read the sheet and convert questions into interactive formats (MCQ, T/F, Fill-in) automatically.'}
                </p>
              </div>
            </div>

            {/* My Worksheets List */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-lg font-black text-slate-800 arabic-font">{lang === 'ar' ? 'أوراقي التفاعلية' : 'My Interactive Sheets'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacherWorksheets.length > 0 ? teacherWorksheets.map((ws) => (
                  <div key={ws.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-slate-800 arabic-font">{ws.title}</h4>
                        <p className="text-xs text-slate-400 font-bold">{new Date(ws.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase">
                        CODE: {ws.id}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => { setCurrentInteractive(ws); setPortal('player'); setShowResults(false); }}
                        className="flex-1 bg-slate-50 text-slate-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100"
                      >
                        <Eye size={14} /> {lang === 'ar' ? 'معاينة' : 'Preview'}
                      </button>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(ws.id); alert(lang === 'ar' ? 'تم نسخ الرمز' : 'Code Copied'); }}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700"
                      >
                        <Share2 size={14} /> {lang === 'ar' ? 'مشاركة' : 'Share'}
                      </button>
                      <button 
                        onClick={async () => { 
                          if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
                            try {
                              await deleteDoc(doc(db, 'interactive_worksheets', ws.id));
                            } catch (error) {
                              handleFirestoreError(error, OperationType.DELETE, `interactive_worksheets/${ws.id}`);
                            }
                          }
                        }}
                        className="w-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 py-20 text-center text-slate-300 font-bold border-2 border-dashed border-slate-100 rounded-3xl">
                    {lang === 'ar' ? 'لا توجد أوراق عمل بعد' : 'No worksheets yet'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (portal === 'student') {
      const isStudentOnly = profile?.role === 'student';
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F8FAFC]">
          {!isStudentOnly && (
            <button onClick={() => setPortal('choice')} className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">
              <ArrowLeft size={20} /> {t.back}
            </button>
          )}

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white border border-slate-100 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl shadow-slate-200/40 text-center"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-[40px]" />
             
             <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6 border-4 border-white">
                  <GraduationCap size={28} />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-2 arabic-font">{t.studentPortal}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                  {t.enterCode}
                </p>

                <div className="flex flex-col gap-4 w-full">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={studentCode}
                      maxLength={6}
                      autoFocus
                      onChange={(e) => setStudentCode(e.target.value.replace(/[^0-9A-Z]/gi, '').toUpperCase())}
                      onPaste={(e) => {
                        const pasteData = e.clipboardData.getData('text');
                        if (pasteData.length === 6) {
                           setStudentCode(pasteData.toUpperCase());
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && studentCode.length >= 6) handleStudentJoin();
                      }}
                      className="bg-slate-50 border-2 border-slate-100 rounded-[1.8rem] px-6 py-4 text-3xl font-black tracking-[0.4em] w-full text-center outline-none focus:bg-white focus:border-emerald-500/30 transition-all text-slate-900 shadow-inner" 
                      placeholder="------"
                    />
                  </div>
                  <button 
                    onClick={handleStudentJoin}
                    disabled={!studentCode || isAnalyzing || studentCode.length < 6}
                    className="w-full max-w-[280px] mx-auto py-4 bg-emerald-600 text-white rounded-[1.5rem] hover:bg-emerald-700 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-30 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <Play size={16} fill="currentColor" />}
                    {t.startSolving}
                  </button>
                </div>
             </div>
          </motion.div>
        </div>
      );
    }

    if (portal === 'player' && currentInteractive) {
      // Handle legacy data or newly generated data
      const sections = currentInteractive.sections || [];
      const allQuestions = sections.flatMap(s => s.questions || []);
      const score = allQuestions.filter(q => q.is_correct).length;
      const total = allQuestions.length;
      const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

      return (
        <div className="flex-1 flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto w-full pb-20">
          <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md py-4 z-10 border-b border-slate-100 px-4 rounded-2xl">
            <button onClick={() => setPortal(teacherWorksheets.some(w => w.id === currentInteractive.id) ? 'teacher' : 'student')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">
              <ArrowLeft size={20} /> {t.back}
            </button>
            <div className="text-center">
              <h2 className="text-xl font-black text-slate-800 arabic-font">{currentInteractive.title}</h2>
              <p className="text-[10px] text-slate-400 font-black tracking-widest">CODE: {currentInteractive.id}</p>
            </div>
            <div className="w-10" />
          </div>

          {showResults && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-r from-blue-600 to-emerald-600 p-8 rounded-[2.5rem] text-white text-center flex flex-col gap-4 shadow-xl shadow-blue-500/20"
            >
              <h3 className="text-2xl font-black arabic-font">{lang === 'ar' ? 'أحسنت! لقد أكملت المهمة' : 'Well done! Task completed'}</h3>
              <div className="flex items-center justify-center gap-12">
                <div className="flex flex-col">
                  <span className="text-5xl font-black">{score}/{total}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-1">{t.score}</span>
                </div>
                <div className="w-px h-16 bg-white/20" />
                <div className="flex flex-col">
                  <span className="text-5xl font-black">{percentage}%</span>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-1">{lang === 'ar' ? 'النسبة' : 'Percentage'}</span>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col gap-12">
            {currentInteractive.sections?.map((section, sIdx) => (
              <div key={sIdx} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 border-r-4 border-blue-500 pr-4">
                  <h3 className="text-2xl font-black text-slate-800 arabic-font">{section.section_title}</h3>
                  <p className="text-sm text-slate-500 font-bold italic">{section.instructions}</p>
                </div>

                <div className="flex flex-col gap-6">
                  {section.questions.map((q, qIdx) => (
                    <div key={q.id} className={`bg-white p-8 rounded-[2rem] border-2 transition-all ${showResults ? (q.is_correct ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30') : 'border-slate-100 shadow-sm hover:shadow-md'}`}>
                      <div className="flex gap-4 mb-6">
                        <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shrink-0 font-black text-sm">{qIdx + 1}</span>
                        <div className="flex flex-col gap-1">
                          <p className="text-xl font-bold text-slate-800 arabic-font leading-relaxed">{q.question_text}</p>
                          {showResults && (
                            <div className={`flex items-center gap-2 mt-2 font-bold text-sm ${q.is_correct ? 'text-emerald-600' : 'text-red-600'}`}>
                              {q.is_correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                              {q.is_correct ? (lang === 'ar' ? 'إجابة صحيحة' : 'Correct Answer') : (lang === 'ar' ? `الإجابة الصحيحة: ${q.correct_answer}` : `Correct Answer: ${q.correct_answer}`)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* MCQ / True-False */}
                      {(q.type === 'mcq' || q.type === 'true_false') && q.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
                          {q.options.map((opt, oi) => {
                            const isSelected = q.user_answer === opt;
                            return (
                              <button
                                key={oi}
                                disabled={showResults}
                                onClick={() => handleAnswerChange(q.id, opt)}
                                className={`p-4 rounded-2xl border-2 text-right font-bold transition-all flex items-center justify-between ${
                                  isSelected 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                } ${showResults && isSelected && !q.is_correct ? 'border-red-500 bg-red-50' : ''}`}
                              >
                                <span className="arabic-font">{opt}</span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-200'}`}>
                                  {isSelected && <Check size={12} className="text-white" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Fill in the blank / Matching */}
                      {(q.type === 'fill_blank' || q.type === 'matching') && (
                        <div className="ml-12">
                          <input 
                            type="text"
                            disabled={showResults}
                            value={q.user_answer}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder={lang === 'ar' ? 'اكتب إجابتك هنا...' : 'Type your answer here...'}
                            className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 font-bold arabic-font focus:ring-0 transition-all ${
                              showResults 
                                ? (q.is_correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50') 
                                : 'border-slate-100 focus:border-blue-500'
                            }`}
                          />
                        </div>
                      )}

                      {showResults && q.explanation && (
                        <div className="mt-6 ml-12 p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                          <Info className="text-blue-500 shrink-0" size={18} />
                          <p className="text-xs text-slate-500 leading-relaxed font-bold italic">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {!showResults && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-20">
              <button 
                onClick={calculateResults}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
              >
                <CheckCircle2 size={24} />
                {t.finish}
              </button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`w-full flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-700 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header Bar */}
      <PageHeader
        title={t.title}
        icon={FileText}
        lang={lang}
        onToggle={toggleLang}
      />

      <div className="flex-1 flex overflow-hidden bg-slate-50/30">
        {/* Sidebar */}
        {(profile?.role !== 'student') && (
          <aside className="w-[280px] bg-white border-r rtl:border-r-0 rtl:border-l border-slate-100 flex flex-col shrink-0 no-print relative overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{lang === 'ar' ? 'اختر الوضع' : 'Choose Mode'}</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setMode('hub')}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-right group ${mode === 'hub' ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 text-slate-500'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${mode === 'hub' ? 'bg-blue-500 text-white' : 'bg-white text-slate-400'}`}>
                  <Sparkles size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black arabic-font leading-none mb-1">{t.hubTitle}</p>
                  <p className="text-[10px] opacity-60 font-bold uppercase tracking-tighter">AI Generator</p>
                </div>
              </button>

              <button 
                onClick={() => { setMode('interactive'); setPortal('choice'); }}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-right group ${mode === 'interactive' ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-md' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 text-slate-500'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${mode === 'interactive' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>
                  <PenTool size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black arabic-font leading-none mb-1">{t.interactiveTitle}</p>
                  <p className="text-[10px] opacity-60 font-bold uppercase tracking-tighter">Interactive Sheets</p>
                </div>
              </button>
            </div>
          </div>

          {/* Level Selection */}
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.level}</h3>
            <div className="grid grid-cols-1 gap-2">
              {['beginner', 'intermediate', 'advanced'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-between ${level === l ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-100'}`}
                >
                  <span className="arabic-font">{t.levels[l as keyof typeof t.levels]}</span>
                  <span className="opacity-70 text-[10px] uppercase tracking-tighter">{l}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type Selection (Only for Hub) */}
          {mode === 'hub' && (
            <div className="p-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.type}</h3>
              <div className="grid grid-cols-1 gap-2">
                {['reading', 'grammar', 'vocabulary', 'writing'].map((ty) => (
                  <button
                    key={ty}
                    onClick={() => setType(ty as any)}
                    className={`px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-between ${type === ty ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-100'}`}
                  >
                    <span className="arabic-font">{t.types[ty as keyof typeof t.types]}</span>
                    <span className="opacity-70 text-[10px] uppercase tracking-tighter">{ty}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
          <div className="p-8 flex flex-col gap-8 h-full overflow-y-auto custom-scroll">
            {mode === 'hub' ? renderHub() : renderInteractive()}
          </div>
        </main>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .no-print { display: none !important; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; }
          @page { size: A4; margin: 0; }
        }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
      {/* Quick Editor Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <Edit3 size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 arabic-font">المحرر السريع</h3>
                </div>
                <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all">
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">نص السؤال</label>
                  <textarea 
                    value={editingItem.text}
                    onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-bold arabic-font focus:border-blue-500 focus:bg-white transition-all outline-none min-h-[120px]"
                    dir="rtl"
                  />
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={handleUpdateQuestion}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 active:scale-95 transition-all"
                  >
                    حفظ التعديل
                  </button>
                  <button 
                    onClick={() => setEditingItem(null)}
                    className="px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
