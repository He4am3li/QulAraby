import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Plus, Search, Calendar, BookOpen, Clock, Users, 
  ArrowRight, Sparkles, Wand2, Download, Trash2, ChevronLeft, 
  ChevronRight, Save, Layout, FileText, CheckCircle2, Gamepad2, Trophy,
  Zap, X, Settings, Monitor, Home, Edit3, Target, Flag, Headphones,
  Mic2, PenTool, Feather, Library, Share2, Edit, BrainCircuit, Rocket, Globe,
  Loader2, Send, RefreshCw, Copy
} from 'lucide-react';
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { GoogleGenAI } from '@google/genai';

interface ImplementationStep {
  id: string;
  phase: string;
  teacherAction: string;
  studentAction: string;
  time: string;
}

interface PlanForm {
  id?: string;
  title: string;
  subject: string;
  grade: string;
  section: string;
  date: string;
  duration: string;
  teacher: string;
  studentsCount: string;
  // Student Stats Table
  stats: {
    total: string;
    above: string;
    within: string;
    below: string;
    determination: string;
    gifted: string;
  };
  topic: string;
  theme: string;
  subtopic: string;
  // Triple Row 1-2-3
  objectives: string[]; // 1
  outcomes: {           // 2 
    advanced: string;
    intermediate: string;
    beginner: string;
  };
  vocabulary: string[]; // List of words
  vocabularyMethod: string; // How to apply
  // Triple Row 4-5-6
  nationalIdentity: string;
  dailyLife: string;
  otherSubject: string;
  // Table
  steps: ImplementationStep[];
  // Footer
  homework: string;
  observations: string;
}

const Preparation: React.FC = () => {
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  const [view, setView] = React.useState<'dashboard' | 'editor'>('dashboard');
  
  const initialSteps: ImplementationStep[] = [
    { id: '1', phase: 'warmup', teacherAction: '', studentAction: '', time: lang === 'ar' ? '5 دقائق' : '5 min' },
    { id: '2', phase: 'teacherTime', teacherAction: '', studentAction: '', time: lang === 'ar' ? '10 دقائق' : '10 min' },
    { id: '3', phase: 'understanding', teacherAction: '', studentAction: '', time: lang === 'ar' ? '5 دقائق' : '5 min' },
    { id: '4', phase: 'mainActivity', teacherAction: '', studentAction: '', time: lang === 'ar' ? '15 دقيقة' : '15 min' },
    { id: '5', phase: 'evaluation', teacherAction: '', studentAction: '', time: lang === 'ar' ? '10 دقائق' : '10 min' },
    { id: '6', phase: 'closing', teacherAction: '', studentAction: '', time: lang === 'ar' ? '5 دقائق' : '5 min' },
  ];

  const [form, setForm] = React.useState<PlanForm>({
    title: '',
    subject: lang === 'ar' ? 'اللغة العربية للناطقين بغيرها' : 'Arabic for Non-Native',
    grade: '',
    section: '',
    date: '',
    duration: '50',
    teacher: '',
    studentsCount: '20',
    stats: {
      total: '',
      above: '',
      within: '',
      below: '',
      determination: '',
      gifted: ''
    },
    topic: '',
    theme: '',
    subtopic: '',
    objectives: [],
    outcomes: {
      advanced: '',
      intermediate: '',
      beginner: ''
    },
    vocabulary: [],
    vocabularyMethod: '',
    nationalIdentity: '',
    dailyLife: '',
    otherSubject: '',
    steps: initialSteps,
    homework: '',
    observations: ''
  });

  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [preparingId, setPreparingId] = React.useState<string | null>(null);
  const [preparedFiles, setPreparedFiles] = React.useState<Record<string, File>>({});
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  const t = {
    ar: {
      title: 'التحضير الذكي',
      subtitle: 'خطط دروسك بلمسة إبداعية مدعومة بالذكاء الاصطناعي',
      newPlan: 'إنشاء تحضير جديد',
      search: 'البحث عن خطة...',
      upcoming: 'الدروس القادمة',
      aiGenerate: 'توليد خطة بالذكاء الاصطناعي',
      myPlans: 'خططي المحفوظة',
      drafts: 'المسودات',
      editorTitle: 'محرر الخطط التفاعلي',
      lessonTitle: 'عنوان الدرس',
      subject: 'المادة',
      grade: 'الصف',
      date: 'التاريخ',
      duration: 'المدة (دقة)',
      addObjective: 'إضافة هدف',
      addActivity: 'إضافة نشاط',
      addAssessment: 'إضافة تقويم',
      preview: 'معاينة القالب',
      downloadPdf: 'تحميل PDF',
      save: 'حفظ الخطة',
      back: 'رجوع للوحة',
      stepPlaceholder: 'اكتب هنا...',
      objectives: 'الأهداف التعليمية',
      activities: 'الأنشطة والوسائل',
      assessment: 'التقويم الختامي',
      prepHeader: 'تحضير درس',
      teacher: 'المعلم/ة',
      dayDate: 'اليوم والتاريخ',
      gradeSection: 'الصف / الشعبة',
      periodTime: 'زمن الحصة',
      minutes: 'دقيقة',
      objectivesTitle: 'الأهداف',
      learningOutcomes: 'نواتج التعلم',
      expectedFrom: 'في نهاية الحصة يتوقع من:',
      advStudents: 'طلاب المستوى المتقدم',
      intStudents: 'طلاب المستوى المتوسط',
      begStudents: 'طلاب المستوى المبتدئ',
      vocabulary: 'المفردات الجديدة',
      words: 'المفردات',
      method: 'طريقة التطبيق',
      nationalIdentity: 'الربط بالهوية الوطنية',
      dailyLife: 'الربط بالحياة اليومية',
      otherSubject: 'الربط بمادة أخرى',
      stepHeader: 'خطوات تنفيذ الدرس',
      stepCol: 'الخطوة',
      teacherActionCol: 'إجراءات المعلم',
      studentActionCol: 'دور الطالب',
      timeCol: 'الزمن',
      homework: 'الواجب المنزلي',
      notesSignatures: 'الملاحظات والتوقيعات',
      teacherNotes: 'ملاحظات المعلم',
      teacherSign: 'توقيع المعلم',
      supervisorSign: 'توقيع المشرف التربوي',
      statsTotal: 'عدد الطلاب',
      statsAbove: 'فوق المستوى',
      statsWithin: 'ضمن المستوى',
      statsBelow: 'دون المستوى',
      statsDetermination: 'ذوو الهمم',
      statsGifted: 'الموهوبون',
      subjectArabicNonNative: 'اللغة العربية للناطقين بغيرها',
      subjectArabic: 'اللغة العربية',
      themes: ['استماع', 'تحدث', 'قراءة', 'كتابة', 'قواعد', 'شعر', 'بلاغة', 'أدب', 'أخرى'],
      minutesLabel: 'دقيقة',
      smartScan: 'مسح ذكي (صورة)',
      analyzing: 'جاري تحليل الصورة...',
      scanSuccess: 'تم استخراج البيانات بنجاح!',
      scanError: 'فشل تحليل الصورة، حاول مرة أخرى',
      phases: {
        warmup: 'التهيئة الحافزة',
        teacherTime: 'وقت المعلم',
        understanding: 'التأكد من الفهم',
        mainActivity: 'النشاط الرئيس',
        evaluation: 'تقييم النشاط الرئيس',
        closing: 'النشاط الختامي'
      }
    },
    en: {
      title: 'Smart Preparation',
      subtitle: 'Plan your lessons with AI-powered creativity',
      newPlan: 'New Lesson Plan',
      search: 'Search plans...',
      upcoming: 'Upcoming Lessons',
      aiGenerate: 'AI Plan Generator',
      myPlans: 'My Saved Plans',
      drafts: 'Drafts',
      editorTitle: 'Interactive Plan Editor',
      lessonTitle: 'Lesson Title',
      subject: 'Subject',
      grade: 'Grade',
      date: 'Date',
      duration: 'Duration (min)',
      addObjective: 'Add Objective',
      addActivity: 'Add Activity',
      addAssessment: 'Add Assessment',
      preview: 'Live Preview',
      downloadPdf: 'Download PDF',
      save: 'Save Plan',
      back: 'Back to Dash',
      stepPlaceholder: 'Type here...',
      objectives: 'Educational Objectives',
      activities: 'Activities & Media',
      assessment: 'Final Assessment',
      prepHeader: 'Lesson Plan',
      teacher: 'Teacher',
      dayDate: 'Day & Date',
      gradeSection: 'Grade / Section',
      periodTime: 'Period Time',
      minutes: 'minutes',
      objectivesTitle: 'Objectives',
      learningOutcomes: 'Learning Outcomes',
      expectedFrom: 'By the end of the lesson, it is expected that:',
      advStudents: 'Advanced Level Students',
      intStudents: 'Intermediate Level Students',
      begStudents: 'Beginner Level Students',
      vocabulary: 'New Vocabulary',
      words: 'Vocabulary',
      method: 'Application Method',
      nationalIdentity: 'Link to National Identity',
      dailyLife: 'Link to Daily Life',
      otherSubject: 'Link to other Subject',
      stepHeader: 'Implementation Steps',
      stepCol: 'Phase',
      teacherActionCol: "Teacher's Procedures",
      studentActionCol: "Student's Role",
      timeCol: 'Time',
      homework: 'Homework',
      notesSignatures: 'Notes & Signatures',
      teacherNotes: "Teacher's Notes",
      teacherSign: "Teacher's Signature",
      supervisorSign: "Supervisor's Signature",
      statsTotal: 'Student Count',
      statsAbove: 'Above Level',
      statsWithin: 'Within Level',
      statsBelow: 'Below Level',
      statsDetermination: 'Special Needs',
      statsGifted: 'Gifted',
      subjectArabicNonNative: 'Arabic for Non-Native',
      subjectArabic: 'Arabic Language',
      themes: ['Listening', 'Speaking', 'Reading', 'Writing', 'Grammar', 'Poetry', 'Rhetoric', 'Literature', 'Other'],
      minutesLabel: 'min',
      smartScan: 'Smart Scan (Image)',
      analyzing: 'Analyzing Image...',
      scanSuccess: 'Data extracted successfully!',
      scanError: 'Failed to analyze image, try again',
      phases: {
        warmup: 'Warm-up',
        teacherTime: 'Teacher Presentation',
        understanding: 'Check Understanding',
        mainActivity: 'Main Activity',
        evaluation: 'Activity Evaluation',
        closing: 'Closing Activity'
      }
    }
  }[lang];

  // Helper for Arabic pluralization of minutes
  const formatMinutes = (value: string | number) => {
    if (lang === 'en') return `${value} ${t.minutes}`;
    const n = typeof value === 'string' ? parseInt(value) : value;
    if (isNaN(n)) return value;
    if (n === 1) return '١ دقيقة';
    if (n === 2) return '٢ دقيقة';
    if (n >= 3 && n <= 10) return `${n} دقائق`;
    return `${n} دقيقة`;
  };

  // Helper to split duration automatically
  const distributeTime = (durationStr: string) => {
    const minutes = parseInt(durationStr);
    if (isNaN(minutes)) return '';
    const perStep = Math.floor(minutes / 6);
    return formatMinutes(perStep);
  };

  React.useEffect(() => {
    if (form.duration && (form.steps[0].time === '' || form.steps[0].time === distributeTime(form.duration))) {
      const timePerStep = distributeTime(form.duration);
      setForm((f: PlanForm) => ({
        ...f,
        steps: f.steps.map(s => ({ ...s, time: timePerStep } as ImplementationStep))
      }));
    }
  }, [form.duration]);

  const handleDownloadPdf = async (specificPlan?: PlanForm, options: { returnBlob?: boolean } = {}) => {
    // Determine which plan data to use
    const activePlan = specificPlan || form;
    
    // If we're printing a specific plan from the dashboard, temporarily update the form 
    // state so the hidden preview document reflects relevant data
    if (specificPlan) {
      setForm(specificPlan);
      // Give it a tiny moment to sync
      await new Promise(r => setTimeout(r, 80));
    }

    if (!previewRef.current) return;
    
    // Temporarily hide parts not needed for PDF if any
    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    const fileName = activePlan.topic ? `lesson-plan (${activePlan.topic})` : 'lesson-plan';
    
    if (options.returnBlob) {
      return pdf.output('blob');
    }
    
    pdf.save(`${fileName}.pdf`);
  };

  const [savedPlans, setSavedPlans] = React.useState<PlanForm[]>(() => {
    const saved = localStorage.getItem('hub_plans');
    return saved ? JSON.parse(saved) : [];
  });

  const filteredPlans = savedPlans.filter(plan => {
    const query = searchQuery.toLowerCase();
    return (
      (plan.topic || '').toLowerCase().includes(query) ||
      (plan.theme || '').toLowerCase().includes(query) ||
      (plan.grade || '').toLowerCase().includes(query)
    );
  });

  const handleSave = () => {
    if (!form.topic && !form.title) {
       alert(lang === 'ar' ? 'يرجى إدخال عنوان للدرس أولاً' : 'Please enter a lesson title first');
       return;
    }
    
    const newPlans = [...savedPlans];
    const planToSave = { 
      ...form, 
      id: form.id || Date.now().toString() 
    };
    
    const existingIndex = savedPlans.findIndex(p => p.id === planToSave.id);
    
    if (existingIndex !== -1) {
      newPlans[existingIndex] = planToSave;
    } else {
      newPlans.unshift(planToSave);
    }
    
    setSavedPlans(newPlans);
    localStorage.setItem('hub_plans', JSON.stringify(newPlans));
    alert(lang === 'ar' ? 'تم حفظ الخطة بنجاح ✨' : 'Plan saved successfully ✨');
    setView('dashboard');
  };

  const handleEditPlan = (plan: PlanForm) => {
    setForm(plan);
    setView('editor');
  };

  const handleDuplicatePlan = (e: React.MouseEvent, plan: PlanForm) => {
    e.stopPropagation();
    setForm({
      ...plan,
      id: undefined,
      date: new Date().toISOString().split('T')[0]
    });
    setView('editor');
  };

  const handleDeletePlan = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    if (confirmDeleteId !== planId) {
      setConfirmDeleteId(planId);
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }
    
    const newPlans = savedPlans.filter(p => {
      const id = p.id || p.topic;
      return id !== planId;
    });
    
    setSavedPlans(newPlans);
    localStorage.setItem('hub_plans', JSON.stringify(newPlans));
    setConfirmDeleteId(null);
  };

  const handleShareWhatsApp = async (e: React.MouseEvent, plan: PlanForm) => {
    e.stopPropagation();
    const planId = plan.id || plan.topic;

    // If file is already prepared, trigger share
    if (preparedFiles[planId]) {
      const file = preparedFiles[planId];
      const text = lang === 'ar' 
        ? `تحضير درس: ${plan.topic}\nالمجال: ${plan.theme}\nالتاريخ: ${plan.date}`
        : `Lesson Plan: ${plan.topic}\nField: ${plan.theme}\nDate: ${plan.date}`;

      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: plan.topic || 'Lesson Plan',
            text: text
          });
          return;
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Share failed:', err);
      }
      
      // Fallback to text share if native share fails or files not supported
      const textWithLink = `${text}\nDownload PDF: ${window.location.origin}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(textWithLink)}`, '_blank');
      return;
    }

    // Start preparation
    setPreparingId(planId);
    try {
      const blob = await handleDownloadPdf(plan, { returnBlob: true }) as Blob;
      const file = new File([blob], `${plan.topic || 'lesson-plan'}.pdf`, { type: 'application/pdf' });
      
      setPreparedFiles(prev => ({ ...prev, [planId]: file }));
      setPreparingId(null);
      
      // We cannot call navigator.share here directly because we've lost the user gesture context 
      // due to the await. Instead, the button UI will now change to "Ready" (Send icon).
    } catch (err) {
      console.error('Preparation failed:', err);
      setPreparingId(null);
      const text = lang === 'ar' 
        ? `تحضير درس: ${plan.topic}\nالمجال: ${plan.theme}\nالتاريخ: ${plan.date}`
        : `Lesson Plan: ${plan.topic}\nField: ${plan.theme}\nDate: ${plan.date}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const getThemeData = (theme: string) => {
    const t = theme?.trim() || '';
    if (t === 'استماع' || t === 'Listening') return { icon: <Headphones size={14} />, color: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-600' };
    if (t === 'تحدث' || t === 'Speaking') return { icon: <Mic2 size={14} />, color: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' };
    if (t === 'قراءة' || t === 'Reading') return { icon: <BookOpen size={14} />, color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' };
    if (t === 'كتابة' || t === 'Writing') return { icon: <PenTool size={14} />, color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' };
    if (t === 'قواعد' || t === 'Grammar') return { icon: <BrainCircuit size={14} />, color: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600' };
    if (t === 'بلاغة' || t === 'Rhetoric') return { icon: <Sparkles size={14} />, color: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600' };
    if (t === 'شعر' || t === 'Poetry') return { icon: <Feather size={14} />, color: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600' };
    if (t === 'أدب' || t === 'Literature') return { icon: <Library size={14} />, color: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-600' };
    return { icon: <FileText size={14} />, color: 'bg-slate-500', light: 'bg-slate-50', text: 'text-slate-600' };
  };

  const formatDateWithDay = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = lang === 'ar' ? daysAr[date.getDay()] : daysEn[date.getDay()];
      return `${day} ${dateStr}`;
    } catch {
      return dateStr;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_KEY as string) || '' });
      
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      const promptString = `
        You are an expert Arabic teacher's assistant. Analyze the provided image (a page from an Arabic textbook or teacher's manual).
        Extract and summarize information to fill a lesson plan form. 
        
        CRITICAL INSTRUCTIONS:
        1. DO NOT copy long paragraphs or transcribe the whole text. 
        2. Summarize the content into concise bullets or short sentences suitable for a formal lesson plan.
        
        STUDENT-DIRECTED QUESTIONS (ARABIC):
        The following fields must be written as a SIMPLE, NATURAL, and FRIENDLY Arabic question directed to students (not to the teacher).
        They should facilitate linking the lesson to their reality.
        - "nationalIdentity": A question connecting the lesson to Emirati identity/values/culture (e.g., "كيف نفخر ببلدنا الإمارات من خلال هذا نص؟").
        - "dailyLife": A question connecting the lesson to the student's daily life (e.g., "هل مر عليك موقف مشابه في بيتك؟").
        - "otherSubject": A question connecting the lesson to another subject like Math or Science (e.g., "أين درسنا هذه الفكرة في مادة العلوم؟").
        
        LESSON STEPS:
        Include a "steps" array with exactly 6 steps matching these phases:
        'warmup', 'teacherTime', 'understanding', 'mainActivity', 'evaluation', 'closing'.
        For each, generate 'teacherAction', 'studentAction' (what the student does), and 'time' (e.g. "10 دقائق").
        
        Output the result ONLY as a valid JSON object.
        JSON Structure: { topic, subtopic, grade, objectives: [], vocabulary: [], outcomes: {advanced, intermediate, beginner}, nationalIdentity, dailyLife, otherSubject, duration, steps: [{phase, teacherAction, studentAction, time}] }
      `;

      const imagePart = {
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      };

      const textPart = { text: promptString };

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: { parts: [imagePart, textPart] }
      });

      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedData = JSON.parse(jsonMatch[0]);
        
        const processedSteps = Array.isArray(extractedData.steps) && extractedData.steps.length > 0
          ? extractedData.steps.map((s: any, i: number) => ({
              id: (i + 1).toString(),
              phase: s.phase || initialSteps[i]?.phase || 'mainActivity',
              teacherAction: s.teacherAction || '',
              studentAction: s.studentAction || '',
              time: s.time || initialSteps[i]?.time || '10 min'
            }))
          : initialSteps;

        setForm(prev => {
          const merged = { ...prev };
          if (extractedData.topic) merged.topic = extractedData.topic;
          if (extractedData.subtopic) merged.subtopic = extractedData.subtopic;
          if (extractedData.grade) merged.grade = extractedData.grade;
          if (extractedData.objectives?.length) merged.objectives = extractedData.objectives;
          if (extractedData.vocabulary?.length) merged.vocabulary = extractedData.vocabulary;
          if (extractedData.outcomes) merged.outcomes = { ...merged.outcomes, ...extractedData.outcomes };
          if (extractedData.nationalIdentity) merged.nationalIdentity = extractedData.nationalIdentity;
          if (extractedData.dailyLife) merged.dailyLife = extractedData.dailyLife;
          if (extractedData.otherSubject) merged.otherSubject = extractedData.otherSubject;
          if (extractedData.duration) merged.duration = extractedData.duration;
          
          return {
            ...merged,
            id: undefined,
            steps: processedSteps
          };
        });
        setView('editor');
        alert(t.scanSuccess);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert(t.scanError);
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const renderDashboard = () => (
    <div className="flex-1 flex flex-col h-full animate-in slide-in-from-bottom-4 duration-700 bg-[#F8FAFC]">
      {/* Top Professional Header - Synchronized with Quizzes */}
      <div className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between no-print sticky top-0 z-40">
          <div className="flex items-center gap-3 w-full max-w-sm">
                <div className="relative flex-1 group">
                    <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors`} size={14} />
                    <input
                      type="text"
                      placeholder={t.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-[10px] arabic-font`}
                    />
                </div>
          </div>
          
          <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className={`flex items-center justify-center gap-2.5 px-6 py-3 border-2 border-blue-600 ${isAnalyzing ? 'bg-blue-50 text-blue-400 border-blue-200' : 'text-blue-600 bg-white hover:bg-blue-50'} rounded-xl font-black transition-all text-[10px] uppercase tracking-widest`}
              >
                {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Monitor size={16} />}
                <span className="arabic-font">{isAnalyzing ? t.analyzing : t.smartScan}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setForm({
                    title: '',
                    subject: lang === 'ar' ? 'اللغة العربية للناطقين بغيرها' : 'Arabic for Non-Native',
                    grade: '',
                    section: '',
                    date: '',
                    duration: '50',
                    teacher: '',
                    studentsCount: '20',
                    stats: { total: '', above: '', within: '', below: '', determination: '', gifted: '' },
                    topic: '',
                    theme: '',
                    subtopic: '',
                    objectives: [],
                    outcomes: { advanced: '', intermediate: '', beginner: '' },
                    vocabulary: [],
                    vocabularyMethod: '',
                    nationalIdentity: '',
                    dailyLife: '',
                    otherSubject: '',
                    steps: initialSteps,
                    homework: '',
                    observations: ''
                  });
                  setView('editor');
                }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-500/10 transition-all hover:bg-blue-700 text-[10px] uppercase tracking-widest"
              >
                <Plus size={16} />
                <span className="arabic-font">{lang === 'ar' ? 'إنشاء تحضير جديد' : 'Create New Preparation'}</span>
              </motion.button>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 arabic-font mb-4 flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                {t.upcoming}
              </h3>
              <div className="space-y-3">
                {savedPlans.length > 0 ? savedPlans.slice(0, 3).map((plan, i) => (
                  <div key={i} onClick={() => handleEditPlan(plan)} className="p-3 bg-slate-50 border border-slate-50 rounded-2xl hover:border-blue-200 transition-all cursor-pointer group">
                    <h4 className="text-xs font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors truncate arabic-font">{plan.topic || plan.title}</h4>
                    <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1 font-sans"><Calendar size={10} /> {plan.date}</span>
                      <span className="flex items-center gap-1 font-sans"><Users size={10} /> {plan.stats.total || '0'}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <FileText size={24} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-[10px] font-bold text-slate-400">{lang === 'ar' ? 'لا يوجد خطط قريباً' : 'No upcoming plans'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.myPlans}</h3>
            </div>
            
            {filteredPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPlans.map((plan, i) => {
                  const themeConfig = getThemeData(plan.theme);
                  const planId = plan.id || plan.topic;
                  const isConfirming = confirmDeleteId === planId;
                  const displayDate = formatDateWithDay(plan.date);
                  
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                      key={planId || i} 
                      onClick={() => handleEditPlan(plan)} 
                      className="group relative rounded-[2.25rem] border-2 p-6 transition-all hover:shadow-2xl hover:shadow-blue-500/10 bg-white border-slate-100 overflow-hidden h-[230px] flex flex-col hover:-translate-y-1.5 cursor-pointer"
                    >
                      {/* Decorative Background Pattern */}
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Creative Accent Strip */}
                      <div className={`absolute top-0 left-0 w-full h-2 ${themeConfig.color} shadow-[0_2px_10px_rgba(0,0,0,0.1)]`} />
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1.5 pt-1">
                          <div className={`px-2.5 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-[0.1em] border flex items-center gap-1.5 ${themeConfig.light} ${themeConfig.text} border-current`}>
                            {themeConfig.icon}
                            <span className="arabic-font">{plan.theme || (lang === 'ar' ? 'عام' : 'General')}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 pt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'نموذجي' : 'STANDARD'}</span>
                        </div>
                      </div>

                      <div className="mb-4 flex-1">
                        <h3 className="text-sm font-black text-slate-900 mb-2 arabic-font group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                          {plan.topic}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                           <span className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md whitespace-nowrap">
                              <Calendar size={8} /> {formatDateWithDay(plan.date)}
                           </span>
                           {plan.grade && (
                             <span className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                                <Target size={8} /> {plan.grade}
                             </span>
                           )}
                           <span className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                                <Clock size={8} /> {plan.duration}m
                           </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-50 pt-4 no-print mt-auto">
                         <div className="flex items-center gap-1.5">
                            <button 
                               onClick={() => handleEditPlan(plan)}
                               className="p-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-slate-200/50"
                               title={lang === 'ar' ? 'تعديل' : 'Edit'}
                            >
                               <PenTool size={14} />
                            </button>
                            <button 
                               onClick={(pE) => handleDuplicatePlan(pE, plan)}
                               className="p-2 border border-blue-100 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                               title={lang === 'ar' ? 'نسخ سريع' : 'Quick Duplicate'}
                            >
                               <Copy size={14} />
                            </button>
                            <button 
                               onClick={(pE) => { pE.stopPropagation(); handleDownloadPdf(plan); }}
                               className="p-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-slate-200/50"
                               title={lang === 'ar' ? 'تحميل PDF' : 'Download PDF'}
                            >
                               <Download size={14} />
                            </button>
                         </div>

                         <div className="flex items-center gap-1">
                            <button 
                                onClick={(sE) => handleShareWhatsApp(sE, plan)}
                                className={`p-2 rounded-lg transition-all ${
                                  preparingId === planId
                                    ? 'bg-blue-50 text-blue-600'
                                    : preparedFiles[planId]
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                                    : 'bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={
                                  preparingId === planId 
                                    ? (lang === 'ar' ? 'جاري تجهيز الملف...' : 'Preparing file...') 
                                    : preparedFiles[planId]
                                    ? (lang === 'ar' ? 'الملف جاهز! اضغط للإرسال' : 'File ready! Click to send')
                                    : (lang === 'ar' ? 'مشاركة عبر واتساب' : 'Share on WhatsApp')
                                }
                            >
                                {preparingId === planId ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : preparedFiles[planId] ? (
                                  <Send size={14} className="animate-pulse" />
                                ) : (
                                  <Share2 size={14} />
                                )}
                            </button>
                            <button 
                                onClick={(dE) => handleDeletePlan(dE, planId)}
                                className={`p-2 rounded-lg transition-all ${
                                  isConfirming
                                    ? 'bg-rose-600 text-white' 
                                    : 'bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white'
                                }`}
                                title={isConfirming ? (lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete') : (lang === 'ar' ? 'حذف' : 'Delete')}
                            >
                                {isConfirming ? <CheckCircle2 size={14} /> : <Trash2 size={14} />}
                            </button>
                         </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 p-8 text-center">
                   <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6">
                      <ClipboardList size={40} className="text-slate-200" />
                   </div>
                   <h4 className="text-lg font-black text-slate-900 mb-2 arabic-font">{lang === 'ar' ? 'ابدأ بتحضير درسك الأول' : 'Start your first lesson plan'}</h4>
                   <button onClick={() => setView('editor')} className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">{t.newPlan}</button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const getThemeTranslation = (theme: string) => {
    const arThemes = ['استماع', 'تحدث', 'قراءة', 'كتابة', 'قواعد', 'شعر', 'بلاغة', 'أدب', 'أخرى'];
    const enThemes = ['Listening', 'Speaking', 'Reading', 'Writing', 'Grammar', 'Poetry', 'Rhetoric', 'Literature', 'Other'];
    
    // Find in Arabic
    const arIdx = arThemes.indexOf(theme);
    if (arIdx !== -1) return enThemes[arIdx];
    
    // Find in English
    const enIdx = enThemes.indexOf(theme);
    if (enIdx !== -1) return arThemes[enIdx];
    
    return theme;
  };

  const renderPreviewDocument = () => {
    const themeConfig = getThemeData(form.theme);
    return (
      <div 
        className="bg-white w-full max-w-[900px] shadow-xl rounded-sm p-10 min-h-[11in] flex flex-col gap-5 text-slate-800 relative overflow-hidden"
        style={{ fontSize: '11px' }}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
          {/* Subtle Background Mark like Worksheets */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          {/* Main Header - Redesigned to match Worksheets EXACTLY */}
          <div className="pb-4 mb-2 flex justify-between items-center relative z-10">
            <div className="w-1/3 flex flex-col items-start text-left">
              <h4 className="text-sm font-black text-slate-900 arabic-font leading-none mb-1">
                {form.theme || (lang === 'ar' ? 'عام' : 'General')}
              </h4>
              <p className="text-[7px] font-black text-slate-400 underline decoration-slate-200 underline-offset-2 uppercase tracking-[0.2em]" dir="ltr">
                {getThemeTranslation(form.theme).toUpperCase()}
              </p>
            </div>

            <div className="w-1/3 text-center flex flex-col items-center">
              {/* Empty center column */}
            </div>

            <div className="w-1/3 flex flex-col items-end text-right">
              <div className="text-xl font-black tracking-tighter text-slate-900 mb-0.5 leading-none" dir="ltr">
                QUL / قُل
              </div>
              <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Interactive Learning</div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center -mt-4">
             <h2 className="text-[10px] font-black text-slate-400 arabic-font uppercase tracking-widest mb-1">{t.prepHeader}</h2>
             <div className="text-xl font-black text-slate-900 arabic-font leading-tight">
               {form.topic || <span className="opacity-10 text-slate-300">................................................................</span>}
             </div>
          </div>


          {/* Info Boxes */}
          <div className="grid grid-cols-5 gap-2 w-full mt-1">
            {[
              { label: t.teacher, value: form.teacher },
              { label: t.dayDate, value: formatDateWithDay(form.date) },
              { label: t.subject, value: form.subject },
              { label: t.gradeSection, value: `${form.grade || '---'} / ${form.section || '---'}` },
              { label: t.periodTime, value: form.duration ? formatMinutes(form.duration) : '---' },
            ].map((box, i) => (
              <div key={i} className="border-2 border-slate-50 rounded-xl p-2 flex flex-col items-center text-center gap-1 bg-white shadow-sm flex-1 min-w-0">
                <span className="text-[7.5px] font-black text-slate-500 uppercase w-full">{box.label}</span>
                <div className="flex items-center gap-1.5 w-full justify-center">
                   <span className="font-bold text-slate-900 leading-tight text-[7.2px]">
                     {box.value || <span className="opacity-10 text-slate-300">.......</span>}
                   </span>
                </div>
              </div>
            ))}
          </div>

          {/* Student Stats Table */}
          <div className="w-full bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm mt-3">
             <table className="w-full text-[9px] border-collapse">
                <thead>
                   <tr className="bg-slate-50 text-slate-500 font-black border-b border-slate-100">
                      <th className="p-1.5 border-l border-slate-100 text-center">{t.statsTotal}</th>
                      <th className="p-1.5 border-l border-slate-100 text-center">{t.statsAbove}</th>
                      <th className="p-1.5 border-l border-slate-100 text-center">{t.statsWithin}</th>
                      <th className="p-1.5 border-l border-slate-100 text-center">{t.statsBelow}</th>
                      <th className="p-1.5 border-l border-slate-100 text-center">{t.statsDetermination}</th>
                      <th className="p-1.5 text-center">{t.statsGifted}</th>
                   </tr>
                </thead>
                <tbody>
                   <tr className="text-slate-800 font-bold">
                      <td className="p-1.5 border-l border-slate-100 text-center">{form.stats.total || <span className="opacity-10 text-slate-300">....</span>}</td>
                      <td className="p-1.5 border-l border-slate-100 text-center">{form.stats.above || <span className="opacity-10 text-slate-300">....</span>}</td>
                      <td className="p-1.5 border-l border-slate-100 text-center">{form.stats.within || <span className="opacity-10 text-slate-300">....</span>}</td>
                      <td className="p-1.5 border-l border-slate-100 text-center">{form.stats.below || <span className="opacity-10 text-slate-300">....</span>}</td>
                      <td className="p-1.5 border-l border-slate-100 text-center">{form.stats.determination || <span className="opacity-10 text-slate-300">....</span>}</td>
                      <td className="p-1.5 text-center">{form.stats.gifted || <span className="opacity-10 text-slate-300">....</span>}</td>
                   </tr>
                </tbody>
             </table>
          </div>

          {/* Triple Column Grid 1-2-3 (Right to Left in RTL mode) */}
        <div className="grid grid-cols-3 gap-3">
           {/* Section 1: Objectives */}
           <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm flex flex-col">
              <div className="bg-slate-50 p-2 flex items-center justify-center border-b border-slate-200 px-4">
                 <span className="text-slate-800 font-black">{t.objectivesTitle}</span>
              </div>
              <div className="p-3 space-y-1.5 text-[9.5px] font-bold text-slate-600 flex-1 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                 {form.objectives.length > 0 ? form.objectives.map((item, i) => (
                   <div key={i} className="flex items-start gap-1">
                      <span className="shrink-0 mt-0.5">•</span>
                      <span>{item}</span>
                   </div>
                 )) : <div className="opacity-10 text-slate-300 text-center">................................................................</div>}
              </div>
           </div>

           {/* Section 2: Outcomes */}
           <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm flex flex-col">
              <div className="bg-slate-50 p-2 flex items-center justify-center border-b border-slate-200 px-4">
                 <span className="text-slate-800 font-black">{t.learningOutcomes}</span>
              </div>
              <div className="p-3 space-y-2 text-[9px] font-bold text-slate-600 flex-1">
                 <p className="text-emerald-800 font-black mb-1 text-center">{t.expectedFrom}</p>
                 <div className="space-y-1.5 px-2 text-right w-full" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="w-full">
                      <span className="text-emerald-600 text-[8.5px] font-black">{t.advStudents}: </span> 
                      <span className="text-[8.5px]">
                        {form.outcomes.advanced || <span className="opacity-10 text-slate-300">................................</span>}
                      </span>
                    </div>
                    <div className="w-full">
                      <span className="text-emerald-600 text-[8.5px] font-black">{t.intStudents}: </span> 
                      <span className="text-[8.5px]">
                        {form.outcomes.intermediate || <span className="opacity-10 text-slate-300">................................</span>}
                      </span>
                    </div>
                    <div className="w-full">
                      <span className="text-emerald-600 text-[8.5px] font-black">{t.begStudents}: </span> 
                      <span className="text-[8.5px]">
                        {form.outcomes.beginner || <span className="opacity-10 text-slate-300">................................</span>}
                      </span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Section 3: Vocabulary */}
           <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm flex flex-col">
              <div className="bg-slate-50 p-2 flex items-center justify-center border-b border-slate-200 px-4">
                 <span className="text-slate-800 font-black">{t.vocabulary}</span>
              </div>
              <div className="flex-1 flex flex-col overflow-hidden text-center">
                 <div className="p-3 border-b border-purple-50 min-h-[50px]">
                    <p className="text-[7.5px] font-black text-purple-400 mb-1 uppercase">{t.words}</p>
                    <div className="text-[9px] font-bold text-slate-600 leading-relaxed">
                       {form.vocabulary.length > 0 ? form.vocabulary.join(' - ') : <span className="opacity-10 text-slate-300">................................................................</span>}
                    </div>
                 </div>
                 <div className="p-3 flex-1 bg-slate-50/30 overflow-hidden">
                    <p className="text-[7.5px] font-black text-purple-400 mb-0.5 uppercase">{t.method}</p>
                    <p className="text-[8.5px] font-bold text-slate-600 leading-tight text-center">
                       {form.vocabularyMethod || <span className="opacity-10 text-slate-300">................................................................</span>}
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Triple Column Grid 4-5-6 */}
        <div className="grid grid-cols-3 gap-3">
           {/* Section 6: Other Subject */}
           <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm text-center">
              <div className="bg-slate-50 p-1.5 text-slate-800 font-black text-[10px] border-b border-slate-200 flex items-center justify-center px-4">
                 <span>{t.otherSubject}</span>
              </div>
              <div className="p-3 text-[9.5px] font-bold text-slate-600 min-h-[50px] leading-relaxed text-center">
                 {form.otherSubject || <span className="opacity-10 text-slate-300">................................................................</span>}
              </div>
           </div>

           <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm text-center">
              <div className="bg-slate-50 p-1.5 text-slate-800 font-black text-[10px] border-b border-slate-200 flex items-center justify-center px-4">
                 <span>{t.dailyLife}</span>
              </div>
              <div className="p-3 text-[9.5px] font-bold text-slate-600 min-h-[50px] leading-relaxed text-center">
                 {form.dailyLife || <span className="opacity-10 text-slate-300">................................................................</span>}
              </div>
           </div>

           <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
              <div className="bg-slate-50 p-1.5 text-slate-800 font-black text-[10px] border-b border-slate-200 flex items-center justify-center px-4">
                 <span>{t.nationalIdentity}</span>
              </div>
              <div className="p-3 text-[9.5px] font-bold text-slate-600 min-h-[50px] leading-relaxed text-center">
                 {form.nationalIdentity || <span className="opacity-10 text-slate-300">................................................................</span>}
              </div>
           </div>
        </div>

        {/* Implementation Table */}
        <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-md">
           <div className="hidden">
              <Layout size={18} />
              <span>{t.stepHeader}</span>
           </div>
           <table className="w-full text-[10px] text-right border-collapse">
              <thead>
                 <tr className="bg-[#1e3a8a] text-white font-black">
                    <th className="p-3 border-l border-white/20 w-32 text-center">{t.stepHeader}</th>
                    <th className="p-3 border-l border-white/20 text-center">{t.teacherActionCol}</th>
                    <th className="p-3 border-l border-white/20 text-center">{t.studentActionCol}</th>
                    <th className="p-3 w-52 text-center">{t.timeCol}</th>
                 </tr>
              </thead>
              <tbody className="font-bold">
                 {form.steps.map((step, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                       <td className="p-3 border-l border-slate-100 text-blue-900 font-black bg-blue-50/30 whitespace-nowrap text-center text-xs">{(t.phases as any)[step.phase] || step.phase}</td>
                       <td className="p-3 border-l border-slate-100 text-slate-600 leading-relaxed min-h-[50px] text-center">
                          {step.teacherAction || <span className="opacity-10 text-slate-300">................................................................................................................</span>}
                       </td>
                       <td className="p-3 border-l border-slate-100 text-slate-600 leading-relaxed min-h-[50px] text-center">
                          {step.studentAction || <span className="opacity-10 text-slate-300">................................................................................................................</span>}
                       </td>
                       <td className="p-3 text-slate-900 whitespace-nowrap text-center font-bold font-tajawal text-[10px]" style={{ letterSpacing: '0' }}>
                          {step.time ? formatMinutes(step.time) : <span className="opacity-10 text-slate-300">.......</span>}
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Footer Grid - 2 boxes perfectly equal size */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
           <div className="border border-emerald-100 rounded-2xl overflow-hidden shadow-sm flex flex-col h-40 text-center">
              <div className="bg-emerald-50 p-1.5 text-emerald-700 font-black text-center text-[9px] flex items-center justify-center border-b border-emerald-100">
                {t.homework}
              </div>
              <div className="p-3 text-[9px] font-bold text-slate-600 flex-1 flex items-center justify-center text-center overflow-hidden leading-relaxed">
                 {form.homework || <span className="opacity-10 text-slate-300 w-2/3 mx-auto">..........................</span>}
              </div>
           </div>
           
           <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-40 text-center">
              <div className="bg-slate-100 p-1.5 text-slate-600 font-black text-center text-[9px] flex items-center justify-center border-b border-slate-200">
                {t.notesSignatures}
              </div>
              <div className="p-3 flex-1 flex flex-col gap-3">
                 <div className="flex-1 flex flex-col items-center justify-center py-0.5 h-full">
                    
                    <div className="text-[9px] font-bold text-slate-700 flex-1 flex items-center justify-center leading-relaxed">
                      {form.observations || <span className="opacity-10 text-slate-300 w-3/4 mx-auto block leading-loose">.........................................................................</span>}
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2 mt-auto text-center pb-2">
                    <div className="flex flex-col items-center space-y-4">
                       <p className="text-[9px] font-black text-slate-800">{t.teacherSign}</p>
                       <div className="border-b-2 border-slate-300 w-3/4"></div>
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                       <p className="text-[9px] font-black text-slate-800">{t.supervisorSign}</p>
                       <div className="border-b-2 border-slate-300 w-3/4"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderEditorSidePanel = () => (
    <div 
      className={`w-full md:w-[400px] bg-white shadow-2xl flex flex-col relative z-20 overflow-y-auto custom-scroll ${lang === 'ar' ? 'border-l border-slate-200' : 'border-r border-slate-200'}`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="p-4 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-30 flex items-center justify-between">
        <button 
          onClick={() => setView('dashboard')}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-all flex items-center gap-2 font-bold text-[10px]"
        >
          {lang === 'ar' ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
          {t.back}
        </button>
        <div className="flex gap-1.5">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className={`p-2 rounded-lg transition-all ${isAnalyzing ? 'bg-blue-100 text-blue-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}
            title={t.smartScan}
          >
            {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Monitor size={16}/>}
          </button>
          <button onClick={() => handleDownloadPdf()} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Download size={16}/></button>
          <button onClick={handleSave} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Save size={16}/></button>
        </div>
      </div>

      <div className="p-6 space-y-8">
         {/* Basic Info */}
         <section className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">
               {lang === 'ar' ? 'بيانات الحصة' : 'Lesson Data'}
            </h3>
            <div className="grid grid-cols-1 gap-3">
               <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase">{t.lessonTitle}</label>
                  <input 
                    value={form.topic}
                    onChange={e => setForm({...form, topic: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                  />
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase">{t.subject}</label>
                    <select 
                      value={form.subject}
                      onChange={e => setForm({...form, subject: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold truncate whitespace-nowrap"
                    >
                      <option value={t.subjectArabicNonNative}>{t.subjectArabicNonNative}</option>
                      <option value={t.subjectArabic}>{t.subjectArabic}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase">{t.teacher}</label>
                    <input value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase">{t.dayDate}</label>
                    <input 
                      type="date"
                      value={form.date} 
                      onChange={e => setForm({...form, date: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase">{t.duration}</label>
                    <input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase">{t.grade}</label>
                    <select 
                        value={form.grade}
                        onChange={e => setForm({...form, grade: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold"
                    >
                        <option value="">--</option>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase">{lang === 'ar' ? 'الشعبة' : 'Section'}</label>
                    <input value={form.section} onChange={e => setForm({...form, section: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold" />
                  </div>
               </div>
            </div>
         </section>

         {/* Student Statistics */}
         <section className="space-y-4">
            <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest border-b border-orange-100 pb-2">
               {lang === 'ar' ? 'إحصائيات الطلاب' : 'Student Statistics'}
            </h3>
            <div className="grid grid-cols-3 gap-2">
               {[
                 { key: 'total', label: t.statsTotal },
                 { key: 'above', label: t.statsAbove },
                 { key: 'within', label: t.statsWithin },
                 { key: 'below', label: t.statsBelow },
                 { key: 'determination', label: t.statsDetermination },
                 { key: 'gifted', label: t.statsGifted },
               ].map((stat) => (
                 <div key={stat.key} className="space-y-1">
                   <label className="text-[7px] font-black text-slate-400 uppercase">{stat.label}</label>
                   <input 
                     type="text"
                     value={(form.stats as any)[stat.key]}
                     onChange={e => setForm({
                       ...form, 
                       stats: { ...form.stats, [stat.key]: e.target.value }
                     })}
                     className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1 py-1 text-[10px] font-bold text-center"
                   />
                 </div>
               ))}
            </div>
         </section>

         <section className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">
               {lang === 'ar' ? 'بيانات القالب' : 'Template Data'}
            </h3>
            <div className="space-y-1">
               <label className="text-[8px] font-black text-slate-400 uppercase">{lang === 'ar' ? 'المجال / الموضوع' : 'Theme / Topic'}</label>
               <select 
                 value={form.theme}
                 onChange={e => setForm({...form, theme: e.target.value})}
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold"
               >
                 <option value="">{lang === 'ar' ? '-- اختر المجال --' : '-- Select Theme --'}</option>
                 {t.themes.map(th => (
                   <option key={th} value={th}>{th}</option>
                 ))}
               </select>
            </div>
         </section>

         {/* Section 1: Objectives */}
         <section className="space-y-3">
            <div className="flex items-center justify-between">
               <h3 className="text-xs font-black text-teal-600 uppercase tracking-widest">1 - الأهداف</h3>
               <button onClick={() => setForm({...form, objectives: [...form.objectives, '']})} className="p-1 bg-teal-50 text-teal-600 rounded-md"><Plus size={14}/></button>
            </div>
            <div className="space-y-2">
               {form.objectives.map((obj, i) => (
                  <div key={i} className="flex gap-2">
                     <input 
                        value={obj} 
                        onChange={e => {
                           const newList = [...form.objectives];
                           newList[i] = e.target.value;
                           setForm({...form, objectives: newList});
                        }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-bold" 
                     />
                     <button onClick={() => setForm({...form, objectives: form.objectives.filter((_, idx) => idx !== i)})} className="text-slate-300 hover:text-red-500"><X size={14}/></button>
                  </div>
               ))}
            </div>
         </section>

         {/* Section 2: Outcomes */}
         <section className="space-y-3">
            <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest">2 - نواتج التعلم</h3>
            <div className="space-y-2">
               <div className="space-y-1">
                  <label className="text-[8px] font-black text-emerald-500">مستوى متقدم</label>
                  <textarea value={form.outcomes.advanced} onChange={e => setForm({...form, outcomes: {...form.outcomes, advanced: e.target.value}})} className="w-full bg-slate-50 border border-emerald-100 rounded-lg px-2 py-1.5 text-[10px] font-bold" />
               </div>
               <div className="space-y-1">
                  <label className="text-[8px] font-black text-emerald-500">مستوى متوسط</label>
                  <textarea value={form.outcomes.intermediate} onChange={e => setForm({...form, outcomes: {...form.outcomes, intermediate: e.target.value}})} className="w-full bg-slate-50 border border-emerald-100 rounded-lg px-2 py-1.5 text-[10px] font-bold" />
               </div>
               <div className="space-y-1">
                  <label className="text-[8px] font-black text-emerald-500">مستوى مبتدئ</label>
                  <textarea value={form.outcomes.beginner} onChange={e => setForm({...form, outcomes: {...form.outcomes, beginner: e.target.value}})} className="w-full bg-slate-50 border border-emerald-100 rounded-lg px-2 py-1.5 text-[10px] font-bold" />
               </div>
            </div>
         </section>

         {/* Section 3: Vocabulary */}
         <section className="space-y-3">
            <div className="flex items-center justify-between">
               <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest">المفردات الجديدة</h3>
               <div className="flex gap-1">
                  <button onClick={() => setForm({...form, vocabulary: [...form.vocabulary, '']})} className="p-1 bg-purple-50 text-purple-600 rounded-md"><Plus size={14}/></button>
               </div>
            </div>
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[8px] font-black text-purple-400 uppercase">قائمة المفردات</label>
                  <div className="space-y-2">
                    {form.vocabulary.map((voc, i) => (
                       <div key={i} className="flex gap-2">
                          <input 
                             value={voc} 
                             onChange={e => {
                                const newList = [...form.vocabulary];
                                newList[i] = e.target.value;
                                setForm({...form, vocabulary: newList});
                             }}
                             className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-bold" 
                          />
                          <button onClick={() => setForm({...form, vocabulary: form.vocabulary.filter((_, idx) => idx !== i)})} className="text-slate-300 hover:text-red-500"><X size={14}/></button>
                       </div>
                    ))}
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[8px] font-black text-purple-400 uppercase">{t.method}</label>
                  <textarea 
                    value={form.vocabularyMethod} 
                    onChange={e => setForm({...form, vocabularyMethod: e.target.value})} 
                    className="w-full bg-slate-50 border border-purple-100 rounded-lg px-3 py-2 text-[10px] font-bold min-h-[60px]" 
                  />
               </div>
            </div>
         </section>

         {/* Sections 4-5-6 */}
         <section className="space-y-4">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-blue-600 uppercase">4 - {t.nationalIdentity}</label>
               <textarea value={form.nationalIdentity} onChange={e => setForm({...form, nationalIdentity: e.target.value})} className="w-full bg-slate-50 border border-blue-100 rounded-lg px-3 py-2 text-[10px] font-bold" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-emerald-600 uppercase">5 - {t.dailyLife}</label>
               <textarea value={form.dailyLife} onChange={e => setForm({...form, dailyLife: e.target.value})} className="w-full bg-slate-50 border border-emerald-100 rounded-lg px-3 py-2 text-[10px] font-bold" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-orange-600 uppercase">6 - {t.otherSubject}</label>
               <textarea value={form.otherSubject} onChange={e => setForm({...form, otherSubject: e.target.value})} className="w-full bg-slate-50 border border-orange-100 rounded-lg px-3 py-2 text-[10px] font-bold" />
            </div>
         </section>

         {/* Steps Editor - Restricted to Phases */}
         <section className="space-y-4">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">{t.stepHeader}</h3>
            <div className="space-y-6">
               {form.steps.map((step, i) => (
                  <div key={step.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-3 shadow-sm">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full">{(t.phases as any)[step.phase] || step.phase}</span>
                        <div className="flex items-center gap-1">
                           <Clock size={10} className="text-slate-400" />
                           <input 
                              value={step.time} 
                              onChange={e => {
                                 const newSteps = [...form.steps];
                                 newSteps[i].time = e.target.value;
                                 setForm({...form, steps: newSteps});
                              }}
                              placeholder={t.timeCol}
                              className="w-16 bg-slate-50 border-none p-1 text-[10px] font-bold rounded"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <textarea 
                           placeholder={t.teacherActionCol}
                           value={step.teacherAction}
                           onChange={e => {
                              const newSteps = [...form.steps];
                              newSteps[i].teacherAction = e.target.value;
                              setForm({...form, steps: newSteps});
                           }}
                           className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-[10px] font-bold min-h-[60px]"
                        />
                        <textarea 
                           placeholder={t.studentActionCol}
                           value={step.studentAction}
                           onChange={e => {
                              const newSteps = [...form.steps];
                              newSteps[i].studentAction = e.target.value;
                              setForm({...form, steps: newSteps});
                           }}
                           className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-[10px] font-bold min-h-[60px]"
                        />
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* Footer fields */}
         <section className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-2">
                  <Home size={14} /> {t.homework}
               </label>
               <textarea 
                  value={form.homework} 
                  onChange={e => setForm({...form, homework: e.target.value})} 
                  className="w-full bg-slate-50 border border-emerald-100 rounded-xl p-3 text-[10px] font-bold min-h-[100px]"
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                  <Edit3 size={14} /> {t.teacherNotes}
               </label>
               <textarea 
                  value={form.observations} 
                  onChange={e => setForm({...form, observations: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] font-bold min-h-[80px]"
               />
            </div>
         </section>
      </div>
    </div>
  );

  const renderEditorPreview = () => (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scroll flex justify-center items-start bg-slate-100">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        ref={view === 'editor' ? previewRef : null}
      >
        {renderPreviewDocument()}
      </motion.div>
    </div>
  );


  return (
    <div className="w-full h-full bg-[#f8fafc] flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hidden File Input for Smart Scan - Global to both views */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
        accept="image/*"
      />
      {/* Global Brand Header */}
      <PageHeader 
        title={t.title} 
        icon={ClipboardList} 
        lang={lang} 
        onToggle={toggleLang}
      />

      <AnimatePresence mode="wait">
        {view === 'dashboard' ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            {renderDashboard()}
          </motion.div>
        ) : (
          <motion.div 
            key="editor"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1"
          >
            <div className="flex flex-col md:flex-row bg-[#f1f5f9]">
              {renderEditorSidePanel()}
              {renderEditorPreview()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Preview for Export - Ensures previewRef is always available for PDF generation */}
      <div className="fixed -left-[4000px] top-0 pointer-events-none z-[-1] opacity-0">
        <div ref={view === 'dashboard' ? previewRef : null}>
           {renderPreviewDocument()}
        </div>
      </div>
    </div>
  );
};

export default Preparation;
