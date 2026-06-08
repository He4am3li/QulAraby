import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Search, Filter, Clock, Users, Brain, 
  Sparkles, Wand2, CheckCircle2, AlertCircle, PenTool,
  BrainCircuit, LayoutGrid, GraduationCap, ArrowLeft,
  ChevronRight, Share2, Eye, Trash2, Play, Info, Loader2,
  Copy, Check, Hash, HelpCircle, Star, Trophy, Presentation,
  Volume2, Mic, Music, Type, ClipboardCheck
} from 'lucide-react';
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { useAuth } from '../components/AuthProvider';
import { db, handleFirestoreError, OperationType, serverTimestamp } from '../firebase';
import { GoogleGenAI } from "@google/genai";
import { 
  collection, query, where, orderBy, onSnapshot, addDoc, 
  doc, deleteDoc, getDoc, setDoc, getDocs, writeBatch
} from 'firebase/firestore';

interface Quiz {
  id: string;
  title: string;
  titleEn: string;
  quizType: string;
  quizTypeEn: string;
  playMode?: 'classic' | 'race' | 'crypto';
  studyMaterial?: string; // Base64 image
  questionsCount: number;
  duration: number; // in minutes
  assignedCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'draft' | 'archived';
  authorId?: string;
  grade: string;
  code?: string;
  joinCode?: string;
  created_at?: number;
  maxAttempts?: number;
}

const QUIZ_MODES = [
  { 
    id: 'classic', 
    ar: 'النمط الكلاسيكي', 
    en: 'Classic Mode', 
    icon: <BookOpen size={16} />, 
    descAr: 'عرض الأسئلة الواحد تلو الآخر، مثالي للتقييم الهادئ أو المراجعة العميقة.', 
    descEn: 'Standard question-by-question layout, ideal for focused review or assessment.' 
  },
  { 
    id: 'race', 
    ar: 'سباق الزمن', 
    en: 'Time Race', 
    icon: <Clock size={16} />, 
    descAr: 'أجب قبل انتهاء الوقت! مثالي لزيادة الحماس والتنافس الحاد.', 
    descEn: 'Answer before time runs out! High energy and competitive pressure.' 
  },
  { 
    id: 'crypto', 
    ar: 'نمط الاختراق', 
    en: 'Crypto Hack', 
    icon: <Hash size={16} />, 
    descAr: 'استخدم الاستراتيجيات والاختراقات في جو تنافسي ممتع.', 
    descEn: 'Strategic hacking and special powers in a competitive environment.' 
  },
];

import { QuizEditor } from '../components/QuizEditor';
import { QuizPlayer } from '../components/QuizPlayer';

export default function Quizzes() {
  const { user, profile, isAuthReady } = useAuth();
  const [lang, setLang] = useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  
  const [portal, setPortal] = useState<'teacher' | 'student' | 'player' | 'results' | 'create'>('student');
  
  // Update portal based on role
  useEffect(() => {
    if (isAuthReady && profile?.role) {
      if (profile.role === 'admin' || profile.role === 'teacher') {
        // Only switch if we are at student portal (initial default)
        if (portal === 'student') setPortal('teacher');
      } else {
        if (portal === 'teacher' || portal === 'create') setPortal('student');
      }
    }
  }, [isAuthReady, profile?.role]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [viewResultsId, setViewResultsId] = useState<string | null>(null);
  const [creationMode, setCreationMode] = useState<'ai' | 'manual'>('ai');
  const [newQuizData, setNewQuizData] = useState({
    title: '',
    grade: '',
    quizType: 'اختبار قصير',
    playMode: 'classic' as 'classic' | 'race' | 'crypto',
    studyMaterial: '',
    maxAttempts: 0
  });
  const [smartConfig, setSmartConfig] = useState({
    prompt: '',
    count: 5,
    type: 'mixed', // mcq, true_false, mixed
    points: 1,
    attachment: '' as string | null,
    playMode: 'classic' as 'classic' | 'race' | 'crypto'
  });
  const [isSaving, setIsSaving] = useState(false);

  const GRADES = lang === 'ar' 
    ? ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس', 'الصف السابع', 'الصف الثامن', 'الصف التاسع', 'الصف العاشر', 'الصف الحادي عشر', 'الصف الثاني عشر']
    : ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  const QUIZ_TYPES = [
    { ar: 'اختبار قصير', en: 'Quick Quiz', icon: <PenTool size={16} /> },
    { ar: 'امتحان نهائي', en: 'Final Exam', icon: <GraduationCap size={16} /> },
    { ar: 'اختبار كتابة', en: 'Writing Exam', icon: <Type size={16} /> },
    { ar: 'اختبار استماع', en: 'Listening Exam', icon: <Volume2 size={16} /> },
    { ar: 'اختبار تحدث', en: 'Speaking Exam', icon: <Mic size={16} /> },
  ];

  const generateJoinCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars 0, O, 1, I
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;
        
        if (img.width > MAX_WIDTH) {
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = base64;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setter(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateShortCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleStartDesigning = async () => {
    if (!user || !newQuizData.title || !newQuizData.grade) return;
    
    setIsSaving(true);
    try {
      const typeObj = QUIZ_TYPES.find(s => s.ar === newQuizData.quizType) || QUIZ_TYPES[0];
      const jCode = generateJoinCode(); // Generate specialized alphanumeric code
      const quizRef = await addDoc(collection(db, 'quizzes'), {
        title: newQuizData.title,
        titleEn: newQuizData.title,
        quizType: newQuizData.quizType,
        quizTypeEn: typeObj.en,
        playMode: newQuizData.playMode,
        studyMaterial: newQuizData.studyMaterial || '',
        joinCode: jCode,
        questionsCount: 0,
        duration: 20,
        assignedCount: 0,
        difficulty: 'medium',
        status: 'draft',
        authorId: user.uid,
        grade: newQuizData.grade,
        created_at: Date.now(),
        code: jCode, // Mirroring for backward compatibility
        maxAttempts: newQuizData.maxAttempts || 0
      });
      setPortal('teacher');
      setSelectedQuizId(quizRef.id);
      // Reset form
      setNewQuizData({ title: '', grade: '', quizType: 'اختبار قصير', playMode: 'classic', studyMaterial: '', maxAttempts: 0 });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'quizzes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSmartGenerate = async () => {
    if (!user || (!smartConfig.prompt && !smartConfig.attachment)) return;
    setIsSaving(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const contents: any[] = [];
      if (smartConfig.attachment) {
        contents.push({
          inlineData: {
            mimeType: smartConfig.attachment.split(';')[0].split(':')[1],
            data: smartConfig.attachment.split(',')[1]
          }
        });
      }
      contents.push({ text: `Generate a comprehensive quiz based on the following context/topic: ${smartConfig.prompt}. 
        IMPORTANT: If an image or study material is provided, strictly use the information within it to generate questions.
        
        Configuration:
        - Number of questions: ${smartConfig.count}
        - Question types: ${smartConfig.type === 'mixed' ? 'Mixed (MCQ, True/False, Short Answer/Essay, Fill in the blanks, and Ordering)' : smartConfig.type}
        - Points per question: ${smartConfig.points}
        
        Respond ONLY with a JSON array of questions. Each question MUST have:
        - text (string)
        - type (string: 'mcq', 'true_false', 'short_answer', 'fill_blank', 'ordering')
        - options (array of strings: required for 'mcq' and 'ordering', empty for others. For 'ordering', options should be in the SCRAMBLED order)
        - correctAnswer (string: 
            - for 'mcq' must be one of the options
            - for 'true_false' must be 'صح' or 'خطأ' in Arabic
            - for 'short_answer' must be a sample model answer
            - for 'fill_blank' must be the word(s) missing
            - for 'ordering' must be the options joined by '|' in the CORRECT order
          )
        - points (number: ${smartConfig.points})
        - feedback (string explaining why the answer is correct)
      `});

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: contents },
        config: { responseMimeType: "application/json" }
      });

      const generatedQuestionsRaw = JSON.parse(result.text || '[]');
      const generatedQuestions = generatedQuestionsRaw.map((q: any) => ({
        ...q,
        correctAnswer: q.correctAnswer || q.answer || ''
      }));
      
      const quizRef = await addDoc(collection(db, 'quizzes'), {
        title: smartConfig.prompt.substring(0, 50) || (lang === 'ar' ? 'اختبار ذكي' : 'Smart Quiz'),
        titleEn: 'Smart AI Quiz',
        quizType: 'اختبار ذكي',
        quizTypeEn: 'Smart AI Quiz',
        playMode: smartConfig.playMode,
        studyMaterial: smartConfig.attachment || '',
        questionsCount: generatedQuestions.length,
        duration: 15,
        assignedCount: 0,
        difficulty: 'medium',
        status: 'draft',
        authorId: user.uid,
        grade: 'Smart',
        created_at: Date.now(),
        code: generateShortCode(),
        joinCode: generateShortCode(),
        maxAttempts: 0
      });

      const batch = writeBatch(db);
      generatedQuestions.forEach((q: any, idx: number) => {
        const qRef = doc(collection(db, 'quizzes', quizRef.id, 'questions'));
        batch.set(qRef, { ...q, order: idx });
      });
      await batch.commit();

      setPortal('teacher');
      setSelectedQuizId(quizRef.id);
      setSmartConfig({ 
        prompt: '', 
        count: 5, 
        type: 'mixed', 
        points: 1, 
        attachment: null, 
        playMode: 'classic' 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'quizzes');
    } finally {
      setIsSaving(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteQuiz = async (quizId: string) => {
    if (confirmDeleteId !== quizId) {
      setConfirmDeleteId(quizId);
      setTimeout(() => setConfirmDeleteId(null), 3000); // Reset after 3 seconds
      return;
    }

    setDeletingId(quizId);
    try {
      console.log("Starting deletion for:", quizId);
      
      // 1. Attempt to delete questions
      try {
        const questionsSnap = await getDocs(collection(db, 'quizzes', quizId, 'questions'));
        if (!questionsSnap.empty) {
          const qBatch = writeBatch(db);
          questionsSnap.forEach(d => qBatch.delete(d.ref));
          await qBatch.commit();
        }
      } catch (e) {
        console.warn("Question deletion warning (continuing anyway):", e);
      }
      
      // 2. Attempt to delete results
      try {
        const resultsSnap = await getDocs(collection(db, 'quizzes', quizId, 'results'));
        if (!resultsSnap.empty) {
          const rBatch = writeBatch(db);
          resultsSnap.forEach(d => rBatch.delete(d.ref));
          await rBatch.commit();
        }
      } catch (e) {
        console.warn("Results deletion warning (continuing anyway):", e);
      }

      // 3. Delete the quiz itself
      await deleteDoc(doc(db, 'quizzes', quizId));
      console.log("Quiz deleted successfully");
      
      if (selectedQuizId === quizId) setSelectedQuizId(null);
      if (viewResultsId === quizId) setViewResultsId(null);
      setConfirmDeleteId(null);

    } catch (error: any) {
      console.error("Critical Deletion failed:", error);
      alert(lang === 'ar' ? 'فشل الحذف. يرجى التأكد من الصلاحيات.' : 'Deletion failed. Check permissions.');
      handleFirestoreError(error, OperationType.DELETE, `quizzes/${quizId}`);
    } finally {
      setDeletingId(null);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAssignCode = async (quizId: string) => {
    const newCode = generateShortCode();
    try {
      await setDoc(doc(db, 'quizzes', quizId), { code: newCode }, { merge: true });
    } catch (error) {
      console.error("Failed to assign code:", error);
      handleFirestoreError(error, OperationType.WRITE, `quizzes/${quizId}`);
    }
  };

  const handleCopyCode = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartSolving = async () => {
    if (!studentCode) return;
    setIsSaving(true);
    try {
      // Find quiz where joinCode matches studentCode (case insensitive normalized)
      const q = query(collection(db, 'quizzes'), where('joinCode', '==', studentCode.toUpperCase()));
      const snapshot = await getDocs(q);
      
      let foundQuizId = '';
      let targetQuiz: any = null;

      if (!snapshot.empty) {
        foundQuizId = snapshot.docs[0].id;
        targetQuiz = snapshot.docs[0].data();
      } else {
        // Fallback or try by legacy 'code' or ID
        const qLegacy = query(collection(db, 'quizzes'), where('code', '==', studentCode));
        const legacySnap = await getDocs(qLegacy);
        if (!legacySnap.empty) {
          foundQuizId = legacySnap.docs[0].id;
          targetQuiz = legacySnap.docs[0].data();
        }
      }

      if (foundQuizId && targetQuiz) {
        if (targetQuiz.status !== 'active') {
          alert(lang === 'ar' ? 'هذا الاختبار غير نشط حالياً (قد يكون في حالة مسودة)' : 'This quiz is not active currently (might be in draft)');
          return;
        }
        setSelectedQuizId(foundQuizId);
        setPortal('player');
      } else {
        alert(lang === 'ar' ? 'رمز الاختبار غير صحيح أو غير موجود' : 'Invalid Quiz Code or not found');
      }
    } catch (error) {
      console.error("Error finding quiz:", error);
      handleFirestoreError(error, OperationType.GET, `quizzes/${studentCode}`);
    } finally {
      setIsSaving(false);
    }
  };
  const [filter, setFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [globalResults, setGlobalResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    if (!viewResultsId) {
      setQuizResults([]);
      return;
    }
    
    setResultsLoading(true);
    const q = query(collection(db, 'quizzes', viewResultsId, 'results'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuizResults(results);
      setResultsLoading(false);
    }, (err) => {
      console.error("Results load error:", err);
      setResultsLoading(false);
    });

    return unsubscribe;
  }, [viewResultsId]);

  const [studentCode, setStudentCode] = useState('');
  const [teacherQuizzes, setTeacherQuizzes] = useState<Quiz[]>([]);
  const [completedQuizIds, setCompletedQuizIds] = useState<Set<string>>(new Set());
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  // Load Teacher Quizzes from Firestore
  useEffect(() => {
    if (!user || !isAuthReady) return;

    const q = query(collection(db, 'quizzes'), where('authorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const quizzes = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Quiz[];
      setTeacherQuizzes(quizzes);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'quizzes');
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  // Fetch completed status for student
  useEffect(() => {
    if (!user || portal !== 'student') return;
    
    const checkCompletions = async () => {
      const completed = new Set<string>();
      // We'll check the last 20 active quizzes for the student
      const activeQuizzes = teacherQuizzes.filter(q => q.status === 'active');
      
      for (const q of activeQuizzes) {
        const resultsRef = collection(db, 'quizzes', q.id, 'results');
        const qResults = query(resultsRef, where('userId', '==', user.uid));
        const snap = await getDocs(qResults);
        if (!snap.empty) {
          completed.add(q.id);
        }
      }
      setCompletedQuizIds(completed);
    };
    
    checkCompletions();
  }, [user, portal, teacherQuizzes]);

  const t = {
    title: lang === 'ar' ? 'منصة الاختبارات' : 'Quiz Platform',
    manageTitle: lang === 'ar' ? 'إدارة الاختبارات' : 'Quiz Management',
    subtitle: lang === 'ar' ? 'أنشئ، وتابع أداء طلابك في الاختبارات التفاعلية' : 'Create and track student performance in interactive quizzes.',
    teacherPortal: lang === 'ar' ? 'بوابة المعلم' : 'Teacher Portal',
    studentPortal: lang === 'ar' ? 'بوابة الطالب' : 'Student Portal',
    iamTeacher: lang === 'ar' ? 'بوابة المعلم' : 'Teacher Portal',
    iamStudent: lang === 'ar' ? 'بوابة الطالب' : 'Student Portal',
    newQuiz: lang === 'ar' ? 'إنشاء اختبار جديد' : 'New Quiz',
    searchPlaceholder: lang === 'ar' ? 'بحث عن اختبار...' : 'Search quizzes...',
    active: lang === 'ar' ? 'نشط' : 'Active',
    draft: lang === 'ar' ? 'مسودة' : 'Draft',
    all: lang === 'ar' ? 'الكل' : 'All',
    results: lang === 'ar' ? 'النتائج' : 'Results',
    edit: lang === 'ar' ? 'تعديل' : 'Edit',
    back: lang === 'ar' ? 'رجوع' : 'Back',
    enterCode: lang === 'ar' ? 'أدخل رمز الاختبار' : 'Enter Quiz Code',
    startSolving: lang === 'ar' ? 'ابدأ الاختبار' : 'Start Quiz',
    noQuizzes: lang === 'ar' ? 'لا توجد اختبارات حتى الآن' : 'No quizzes yet',
    codeCopied: lang === 'ar' ? 'تم نسخ الرمز' : 'Code Copied',
    deleteConfirm: lang === 'ar' ? 'هل أنت متأكد من حذف هذا الاختبار؟' : 'Are you sure you want to delete this quiz?',
    code: lang === 'ar' ? 'رمز:' : 'CODE:',
    aiGenerator: lang === 'ar' ? 'المولد الذكي' : 'AI Generator',
    manualCreation: lang === 'ar' ? 'إنشاء يدوي' : 'Manual Creation',
    aiDescription: lang === 'ar' ? 'دع الذكاء الاصطناعي يصمم الأسئلة لك' : 'Let AI design the questions for you',
    manualDescription: lang === 'ar' ? 'صمم أسئلتك بنفسك وبالإعدادات التي تفضلها' : 'Design questions yourself with custom settings',
  };

  const filteredQuizzes = teacherQuizzes.filter(quiz => {
    const matchesSearch = (quiz.title + (quiz.titleEn || '')).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || quiz.status === filter;
    return matchesSearch && matchesFilter;
  });

  const renderChoice = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F8FAFC]">

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
        <button 
          onClick={() => setPortal('teacher')}
          className="group relative bg-[#0f172a] p-8 rounded-3xl border border-white/5 shadow-xl hover:scale-[1.02] transition-all duration-500 overflow-hidden flex flex-col items-center text-center"
        >
          <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 relative z-10 border border-blue-500/20 group-hover:scale-110 transition-all duration-500">
            <Presentation size={24} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-black text-white mb-1 arabic-font">{t.iamTeacher}</h3>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.1em] max-w-[160px] leading-relaxed">
                {lang === 'ar' ? 'تصميم الاختبارات وإدارة الفصول' : 'Design exams & manage classes'}
            </p>
          </div>
        </button>

        <button 
          onClick={() => setPortal('student')}
          className="group relative bg-[#3b82f6] p-8 rounded-3xl border border-blue-400/20 shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all duration-500 overflow-hidden flex flex-col items-center text-center"
        >
           <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 relative z-10 border border-white/20 group-hover:scale-110 transition-all duration-500">
            <GraduationCap size={24} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-black text-white mb-1 arabic-font">{t.iamStudent}</h3>
            <p className="text-blue-100 text-[9px] font-bold uppercase tracking-[0.1em] max-w-[160px] leading-relaxed">
                {lang === 'ar' ? 'حل الاختبارات وتحدي الزملاء' : 'Solve & Challenge Peers'}
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderTeacher = () => (
    <div className="flex-1 flex flex-col h-full animate-in slide-in-from-bottom-4 duration-700 overflow-hidden bg-[#F8FAFC]">
      {/* Top Professional Header as in Image */}
      <div className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between no-print sticky top-0 z-40">
          <div className="flex items-center gap-3 w-full max-w-sm">
                <div className="relative flex-1 group">
                    <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors`} size={14} />
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-[10px]`}
                    />
                </div>
          </div>
          
          <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPortal('create')}
                className="flex items-center justify-center gap-2.5 px-6 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-500/10 transition-all hover:bg-blue-700 text-[10px] uppercase tracking-widest"
              >
                <Plus size={16} />
                {t.newQuiz}
              </motion.button>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 h-fit">
            <AnimatePresence mode='popLayout'>
              {(filteredQuizzes.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredQuizzes.map((quiz, i) => {
                    const typeColors: any = {
                      'اختبار قصير': 'bg-blue-50 border-blue-100 text-blue-600',
                      'اختبار ذكي': 'bg-emerald-50 border-emerald-100 text-emerald-600',
                      'امتحان نهائي': 'bg-rose-50 border-rose-100 text-rose-600',
                      'تدريب': 'bg-violet-50 border-violet-100 text-violet-600',
                      'مسابقة': 'bg-amber-50 border-amber-100 text-amber-600'
                    };
                    const colorClass = typeColors[quiz.quizType] || 'bg-slate-50 border-slate-100 text-slate-600';
                    
                    return (
                      <motion.div
                        layout
                        key={quiz.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05 }}
                        className={`group relative rounded-[2.25rem] border-2 p-6 transition-all hover:shadow-2xl hover:shadow-blue-500/10 bg-white border-slate-100 overflow-hidden h-[230px] flex flex-col hover:-translate-y-1.5`}
                      >
                        {/* Decorative Background Pattern */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Creative Accent Strip */}
                        <div className={`absolute top-0 left-0 w-full h-2 ${
                            quiz.quizType === 'اختبار ذكي' ? 'bg-emerald-500' :
                            quiz.quizType === 'اختبار قصير' ? 'bg-blue-500' :
                            quiz.quizType === 'امتحان نهائي' ? 'bg-rose-500' :
                            quiz.quizType === 'تدريب' ? 'bg-violet-500' :
                            'bg-amber-500'
                        } shadow-[0_2px_10px_rgba(0,0,0,0.1)]`} />

                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col gap-1.5 pt-1">
                            <div className={`px-2.5 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-[0.1em] border ${colorClass}`}>
                                {lang === 'ar' ? quiz.quizType : quiz.quizTypeEn}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 pt-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${quiz.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{quiz.status === 'active' ? t.active : t.draft}</span>
                          </div>
                        </div>

                        <div className="mb-4 flex-1">
                            <h3 className="text-sm font-black text-slate-900 mb-2 arabic-font group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                {lang === 'ar' ? quiz.title : quiz.titleEn}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                                    <Users size={8} /> {quiz.assignedCount}
                                </span>
                                <span className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                                    <Clock size={8} /> {quiz.duration}m
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-50 pt-4 no-print mt-auto">
                           <div className="flex items-center gap-1.5">
                                <button 
                                    onClick={() => setSelectedQuizId(quiz.id)}
                                    className="p-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-slate-200/50"
                                    title={t.edit}
                                >
                                    <PenTool size={14} />
                                </button>
                                <button 
                                    onClick={() => setViewResultsId(quiz.id)}
                                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-black text-[7px] uppercase tracking-widest hover:bg-blue-600 transition-all font-mono"
                                >
                                    {t.results}
                                </button>
                           </div>

                           <div className="flex items-center gap-1">
                              <button 
                                  onClick={async () => {
                                    const code = quiz.joinCode || quiz.code || quiz.id.slice(0, 6).toUpperCase();
                                    try {
                                      await navigator.clipboard.writeText(code);
                                      // Feedback
                                    } catch (err) {
                                      console.error('Failed to copy: ', err);
                                    }
                                  }}
                                  className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title={lang === 'ar' ? 'نسخ الرمز' : 'Copy Code'}
                              >
                                  <Copy size={14} />
                              </button>
                              <button 
                                  onClick={() => {
                                    const url = `${window.location.origin}/quiz/${quiz.id}`;
                                    const text = `${quiz.title}\n${url}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                  }}
                                  className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-all"
                                  title={lang === 'ar' ? 'مشاركة عبر واتساب' : 'Share on WhatsApp'}
                              >
                                  <Share2 size={14} />
                              </button>
                              <button 
                                  disabled={!!deletingId}
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                  className={`p-2 rounded-lg transition-all ${
                                    confirmDeleteId === quiz.id
                                      ? 'bg-rose-600 text-white' 
                                      : 'bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white'
                                  }`}
                              >
                                  {confirmDeleteId === quiz.id ? <Check size={14} /> : <Trash2 size={14} />}
                              </button>
                           </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[3.5rem] bg-white">
                   <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6">
                      <LayoutGrid size={48} className="opacity-10" />
                   </div>
                   <h4 className="text-xl font-black text-slate-900 mb-2 arabic-font">{t.noQuizzes}</h4>
                   <button 
                      onClick={() => setPortal('create')}
                      className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20"
                   >
                      {t.newQuiz}
                   </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

    </div>
  );

  const renderStudent = () => {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F8FAFC]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white border border-slate-100 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl shadow-slate-200/40 text-center"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-[40px]" />
             
             <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 border-4 border-white">
                  <GraduationCap size={28} />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-2 arabic-font">{lang === 'ar' ? 'بوابة الطالب' : 'Student Hub'}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                  {lang === 'ar' ? 'أدخل رمز الاختبار للمتابعة' : 'Enter access code to continue'}
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
                        if (e.key === 'Enter' && studentCode.length === 6) handleStartSolving();
                      }}
                      className="bg-slate-50 border-2 border-slate-100 rounded-[1.8rem] px-6 py-4 text-3xl font-black tracking-[0.4em] w-full text-center outline-none focus:bg-white focus:border-blue-500/30 transition-all text-slate-900 shadow-inner" 
                      placeholder="------"
                    />
                  </div>
                  <button 
                    onClick={handleStartSolving}
                    disabled={!studentCode || isSaving || studentCode.length < 6}
                    className="w-full max-w-[280px] mx-auto py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-30 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest"
                  >
                    {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Play size={16} fill="currentColor" />}
                    {t.startSolving}
                  </button>
                </div>
             </div>
          </motion.div>
      </div>
    );
  };

  const renderResults = () => (
    <div className="flex-1 flex flex-col bg-white overflow-hidden animate-in slide-in-from-right duration-500">
      <div className="bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setViewResultsId(null)} 
            className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-slate-100"
          >
            <ArrowLeft size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 arabic-font">
               {lang === 'ar' ? 'لوحة تحكم نتائج الاختبار' : 'Quiz Results Dashboard'}
            </h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
               {teacherQuizzes.find(q => q.id === viewResultsId)?.title}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden bg-slate-50/50">
        <div className="h-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 p-8 lg:p-12 overflow-hidden">
          {/* Main Area - Can be used for detailed view or stats */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{lang === 'ar' ? 'متوسط الدرجات' : 'Average Score'}</div>
                      <div className="text-3xl font-black text-blue-600">
                        {quizResults.length > 0 
                          ? Math.round(quizResults.reduce((acc, r) => acc + (r.score || 0), 0) / quizResults.length * 10) / 10
                          : 0
                        }
                      </div>
                   </div>
                   <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{lang === 'ar' ? 'أعلى درجة' : 'Highest Score'}</div>
                      <div className="text-3xl font-black text-emerald-500">
                        {quizResults.length > 0 ? Math.max(...quizResults.map(r => r.score || 0)) : 0}
                      </div>
                   </div>
                   <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{lang === 'ar' ? 'عدد التقديمات' : 'Total Submissions'}</div>
                      <div className="text-3xl font-black text-slate-800">{quizResults.length}</div>
                   </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-6">
                      <Trophy size={40} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 arabic-font mb-2">
                     {lang === 'ar' ? 'نظرة سريعة على الأداء' : 'Quick Performance overview'}
                   </h3>
                   <p className="text-xs text-slate-400 max-w-sm font-bold leading-relaxed">
                     {lang === 'ar' 
                       ? 'القائمة على اليمين تُظهر تفاصيل كل طالب بشكل منفرد مع الدرجة النهائية وتوقيت التسليم.'
                       : 'The sidebar shows individual student details including final grades and submission timestamps.'}
                   </p>
                </div>
             </div>
          </div>

          {/* Moved Sidebar - Always visible as requested */}
          <div className="lg:w-80 h-full flex flex-col">
             <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/40 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <h4 className="font-black text-slate-900 flex items-center gap-2 italic uppercase tracking-wider text-[10px]">
                      {lang === 'ar' ? 'نتائج الطلاب' : 'Student Results'}
                      <Users size={14} className="text-blue-500" />
                    </h4>
                    <span className="text-[9px] font-black text-slate-300 bg-slate-50 px-2.5 py-1 rounded-full uppercase tracking-tighter">
                      Live
                    </span>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 py-1">
                   {resultsLoading ? (
                     <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-blue-400" size={24} />
                     </div>
                   ) : quizResults.length > 0 ? (
                     quizResults.map((res: any, i: number) => (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={res.id} 
                          className="flex items-center justify-between group p-4 bg-white border border-slate-50 rounded-2xl transition-all hover:shadow-lg hover:shadow-slate-100 hover:-translate-y-0.5"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-[0.9rem] flex items-center justify-center text-[10px] font-black transition-all ${
                              i < 3 ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'
                            }`}>
                              #{i + 1}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[11px] font-black text-slate-800 arabic-font line-clamp-1">
                                  {res.studentName}
                               </span>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50/50 px-1.5 py-0.5 rounded">
                                     {lang === 'ar' ? 'مكتمل' : 'Done'}
                                  </span>
                                  <span className="text-[7px] font-bold text-slate-300 font-mono">
                                     {res.timestamp?.seconds ? new Date(res.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                  </span>
                               </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                             <div className={`text-sm font-black tabular-nums border-b-2 pb-0.5 ${i < 3 ? 'text-emerald-500 border-emerald-50' : 'text-slate-600 border-slate-50'}`}>
                               {res.score}/{res.totalQuestions || 0}
                             </div>
                             <div className="text-[7px] font-black text-slate-300 uppercase tracking-widest mt-1">
                               {Math.round(((res.score || 0) / (res.totalQuestions || 1)) * 100)}%
                             </div>
                          </div>
                        </motion.div>
                     ))
                   ) : (
                     <div className="py-20 flex flex-col items-center justify-center text-center">
                        <Users size={32} className="text-slate-100 mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{lang === 'ar' ? 'بانتظار النتائج...' : 'Waiting for results...'}</p>
                     </div>
                   )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 shrink-0">
                   <button 
                     onClick={() => setViewResultsId(null)}
                     className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                   >
                     {t.back}
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreateQuiz = () => (
    <div className="flex-1 flex flex-col bg-white overflow-hidden animate-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white border-b border-slate-100 px-6 py-2.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setPortal('teacher')} 
            className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-900 border border-slate-100"
          >
            <ArrowLeft size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
          </button>
          <div>
            <h2 className="text-base font-black text-slate-900 arabic-font">
               {lang === 'ar' ? 'إنشاء اختبار جديد' : 'Architect New Quiz'}
            </h2>
            <p className="text-[7px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
               {lang === 'ar' ? 'صمم تجربة تعليمية فريدة' : 'Design a unique learning journey'}
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button 
             onClick={() => setCreationMode('ai')}
             className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${creationMode === 'ai' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
           >
             {t.aiGenerator}
           </button>
           <button 
             onClick={() => setCreationMode('manual')}
             className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${creationMode === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
           >
             {t.manualCreation}
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar p-6 lg:p-7">
        <div className="max-w-4xl mx-auto">
           {creationMode === 'manual' ? (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 scale-in duration-500">
               <div className="lg:col-span-12 mb-1">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Info size={11} className="text-indigo-500" />
                       {lang === 'ar' ? 'عنوان الاختبار' : 'Quiz Identity'}
                    </label>
                    <input 
                      type="text" 
                      value={newQuizData.title}
                      onChange={(e) => setNewQuizData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-black text-lg arabic-font shadow-sm placeholder:text-slate-300" 
                      placeholder={lang === 'ar' ? 'مثال: قواعد اللغة العربية' : 'e.g. Arabic Grammar'}
                    />
                  </div>
               </div>

               <div className="lg:col-span-7 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'الفئة المستهدفة' : 'Academic Grade'}</label>
                      <select 
                        value={newQuizData.grade}
                        onChange={(e) => setNewQuizData(prev => ({ ...prev, grade: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-bold text-[11px] h-[46px] appearance-none cursor-pointer"
                      >
                        <option value="">{lang === 'ar' ? 'اختر الصف...' : 'Select Grade...'}</option>
                        {GRADES.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'نمط اللعب' : 'Gameplay Mode'}</label>
                      <div className="flex gap-2 h-[46px]">
                         {QUIZ_MODES.map(m => (
                           <button
                             key={m.id}
                             type="button"
                             onClick={() => setNewQuizData(prev => ({ ...prev, playMode: m.id as any }))}
                             className={`flex-1 rounded-xl border-2 transition-all flex items-center justify-center ${
                               newQuizData.playMode === m.id 
                                 ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                                 : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-200'
                             }`}
                             title={lang === 'ar' ? m.ar : m.en}
                           >
                             {React.cloneElement(m.icon as any, { size: 16 })}
                           </button>
                         ))}
                      </div>
                      <div className="mt-2 h-6">
                        <p className="text-[10px] text-slate-400 font-bold arabic-font leading-tight italic">
                           {QUIZ_MODES.find(m => m.id === newQuizData.playMode)?.[lang === 'ar' ? 'descAr' : 'descEn']}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'نوع المهمة' : 'Mission Category'}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                        {QUIZ_TYPES.map(s => (
                          <button
                            key={s.en}
                            type="button"
                            onClick={() => setNewQuizData(prev => ({ ...prev, quizType: s.ar }))}
                            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${
                              newQuizData.quizType === s.ar 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-100 hover:bg-slate-50 hover:text-indigo-600'
                            }`}
                          >
                            <div className={`transition-transform group-hover:scale-110 ${newQuizData.quizType === s.ar ? 'text-white' : 'text-indigo-400'}`}>
                                {React.cloneElement(s.icon as any, { size: 16 })}
                            </div>
                            <span className="text-[7px] font-black uppercase tracking-widest text-center">
                               {lang === 'ar' ? s.ar : s.en}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
               </div>

               <div className="lg:col-span-5">
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm flex flex-col h-full ring-2 ring-slate-100/50">
                      <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center gap-2 italic">
                         <Sparkles size={12} className="text-amber-500" />
                         {lang === 'ar' ? 'المحتوى البصري' : 'Visual Reference'}
                      </h4>
                      
                      <div className="flex-1 space-y-3">
                        <label className="relative group cursor-pointer block h-40">
                           {newQuizData.studyMaterial ? (
                              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg">
                                <img src={newQuizData.studyMaterial} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                                <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                   <span className="px-4 py-1.5 bg-white text-indigo-900 rounded-lg font-black text-[8px] uppercase tracking-widest transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                      {lang === 'ar' ? 'تغيير' : 'Change'}
                                   </span>
                                </div>
                              </div>
                           ) : (
                              <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-300 group-hover:border-indigo-200 group-hover:bg-indigo-50/30 transition-all duration-500">
                                 <Plus size={20} className="group-hover:text-indigo-400 group-hover:scale-110 transition-transform" />
                                 <span className="text-[7px] font-black uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">{lang === 'ar' ? 'أضف صورة' : 'Add image'}</span>
                              </div>
                           )}
                           <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, (val) => setNewQuizData(p => ({...p, studyMaterial: val})))} />
                        </label>

                        <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                           <p className="text-[8px] text-slate-400 font-bold leading-relaxed italic">
                             {lang === 'ar' 
                               ? 'سيتم استخدام هذه الصورة كخلفية أو مادة دراسية لمشاركة الطلاب.' 
                               : 'This image will serve as a backdrop or reference for students.'}
                           </p>
                        </div>
                      </div>

                      <button 
                        onClick={handleStartDesigning}
                        disabled={isSaving || !newQuizData.title || !newQuizData.grade}
                        className="mt-5 w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.3em] shadow-lg shadow-indigo-500/20 hover:bg-shadow-indigo-700 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                        {lang === 'ar' ? 'ابدأ التصميم' : 'Start Architecting'}
                      </button>
                  </div>
               </div>
             </div>
           ) : (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start scale-in duration-500">
               <div className="lg:col-span-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-0.5">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Brain size={12} className="text-teal-500" />
                          {lang === 'ar' ? 'وصف موضوع الاختبار' : 'AI Inspiration Anchor'}
                       </label>
                    </div>
                    <textarea 
                      value={smartConfig.prompt}
                      onChange={(e) => setSmartConfig(prev => ({ ...prev, prompt: e.target.value }))}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all font-black text-sm arabic-font shadow-sm h-40 resize-none placeholder:text-slate-200" 
                      placeholder={lang === 'ar' ? 'اكتب موضوعك هنا...' : 'Describe your topic here...'}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-white p-4 rounded-xl border border-slate-200">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2 italic">{lang === 'ar' ? 'عدد الأسئلة' : 'Questions'}</label>
                          <div className="flex items-center gap-3">
                             <input 
                               type="range" min="1" max="20"
                               value={smartConfig.count}
                               onChange={(e) => setSmartConfig(p => ({...p, count: parseInt(e.target.value)}))}
                               className="flex-1 accent-teal-600 h-1"
                             />
                             <span className="w-8 h-8 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center font-black text-[10px] border border-teal-100">{smartConfig.count}</span>
                          </div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-slate-200">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2 italic">{lang === 'ar' ? 'تنوع الأسئلة' : 'Variations'}</label>
                          <div className="flex gap-1.5">
                             {['mixed', 'mcq', 'true_false'].map(t => (
                               <button 
                                 key={t}
                                 type="button"
                                 onClick={() => setSmartConfig(p => ({...p, type: t}))}
                                 className={`flex-1 py-1.5 rounded-md font-black text-[7px] uppercase tracking-widest transition-all ${smartConfig.type === t ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-teal-50 hover:text-teal-600'}`}
                               >
                                 {t.replace('_', ' ')}
                               </button>
                             ))}
                          </div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-slate-200 col-span-2">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2 italic">{lang === 'ar' ? 'نمط اللعب المفضل' : 'Preferred Gameplay'}</label>
                          <div className="flex gap-2">
                             {QUIZ_MODES.map(m => (
                               <button
                                 key={m.id}
                                 type="button"
                                 onClick={() => setSmartConfig(p => ({ ...p, playMode: m.id as any }))}
                                 className={`flex-1 py-2 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                                   smartConfig.playMode === m.id 
                                     ? 'bg-teal-600 border-teal-600 text-white shadow-md' 
                                     : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-teal-100'
                                 }`}
                               >
                                 {React.cloneElement(m.icon as any, { size: 14 })}
                                 <span className="text-[8px] font-black uppercase tracking-widest">{lang === 'ar' ? m.ar : m.en}</span>
                               </button>
                             ))}
                          </div>
                          <p className="mt-2 text-[9px] text-teal-600/60 font-bold arabic-font italic text-center">
                             {QUIZ_MODES.find(m => m.id === smartConfig.playMode)?.[lang === 'ar' ? 'descAr' : 'descEn']}
                          </p>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="lg:col-span-4 space-y-4">
                  <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-[1.5rem] p-5 text-white shadow-lg shadow-teal-700/20 ring-2 ring-teal-50 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                      
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2 italic">
                         <Sparkles size={12} />
                         Deep Context
                      </h4>
                      
                      <div className="space-y-4">
                         <label className="block h-32 relative cursor-pointer">
                            {smartConfig.attachment ? (
                               <div className="w-full h-full rounded-lg overflow-hidden shadow-md border border-white/20">
                                  <img src={smartConfig.attachment} className="w-full h-full object-cover" />
                               </div>
                            ) : (
                               <div className="w-full h-full bg-white/10 border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-white/20 transition-all duration-300">
                                  <Plus size={16} />
                                  <span className="text-[7px] font-black uppercase tracking-widest">{lang === 'ar' ? 'صورة مصدرية' : 'Image Source'}</span>
                               </div>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, (val) => setSmartConfig(p => ({...p, attachment: val})))} />
                         </label>

                         <div className="space-y-2 text-center">
                            <p className="text-[8px] text-teal-100 font-bold leading-relaxed opacity-80">
                               {lang === 'ar' 
                                 ? 'أرفق صورة لتحليلها بالذكاء الاصطناعي.' 
                                 : 'Attach an image for AI analysis.'}
                            </p>
                            
                            <button 
                              onClick={handleSmartGenerate}
                              disabled={isSaving || !smartConfig.prompt}
                              className="w-full py-3 bg-white text-teal-600 rounded-lg font-black text-[8px] uppercase tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                            >
                              {isSaving ? <Loader2 className="animate-spin" size={12} /> : <BrainCircuit size={12} />}
                              {lang === 'ar' ? 'توليد ذكي' : 'Cast AI Spell'}
                            </button>
                         </div>
                      </div>
                  </div>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (portal === 'player' && selectedQuizId) {
      const activeQuiz = teacherQuizzes.find(q => q.id === selectedQuizId);
      return (
        <QuizPlayer 
          quizId={selectedQuizId} 
          lang={lang} 
          playMode={activeQuiz?.playMode || 'classic'}
          onExit={() => {
            setPortal('student');
            setSelectedQuizId(null);
          }}
          onComplete={() => {
            setPortal('student');
            setSelectedQuizId(null);
          }}
        />
      );
    }

    if (portal === 'teacher' && selectedQuizId) {
      return (
        <QuizEditor 
          quizId={selectedQuizId} 
          lang={lang} 
          onBack={() => setSelectedQuizId(null)} 
        />
      );
    }

    if (viewResultsId) {
      return renderResults();
    }

    switch(portal) {
      case 'teacher': return renderTeacher();
      case 'create': return renderCreateQuiz();
      case 'student': return renderStudent();
      case 'player': return renderStudent(); // Fallback if no ID is selected
      default: return renderStudent();
    }
  };

  return (
    <div className={`h-screen bg-white flex flex-col ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Global Brand Header */}
      <PageHeader
        title={t.title}
        icon={GraduationCap}
        lang={lang}
        onToggle={toggleLang}
      />

      <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.8px, transparent 0.8px)', backgroundSize: '32px 32px' }} />
        
        {renderMainContent()}

        {/* Legacy placeholders removed */}
      </div>
    </div>
  );
}
