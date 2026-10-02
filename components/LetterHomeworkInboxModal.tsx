import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, X, Search, Filter, CheckCircle2, Clock, Star, 
  Award, Eye, MessageSquare, Trash2, Check, RefreshCw, 
  User, Sparkles, ChevronRight, ChevronLeft, ZoomIn, 
  FileText, Send, AlertCircle, PlusCircle, CheckCheck
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, query, onSnapshot, doc, 
  updateDoc, deleteDoc, addDoc, serverTimestamp, getDocs, orderBy 
} from 'firebase/firestore';

export interface LetterSubmission {
  id: string;
  char: string;
  charName: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentPhoto?: string;
  imageUrl: string;
  submittedAt: any;
  status: 'pending' | 'reviewed';
  aiFeedback?: {
    passed: boolean;
    score?: number;
    feedback_ar?: string;
    feedback_en?: string;
    observations?: string[];
  };
  teacherGrade?: number; // 1 to 5 stars
  teacherNotes?: string;
  badge?: string;
  reviewedAt?: any;
}

interface LetterHomeworkInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChar: { char: string; name: string } | null;
  lang: 'ar' | 'en';
}

const SAMPLE_SUBMISSIONS: Omit<LetterSubmission, 'id'>[] = [
  {
    char: 'أ',
    charName: 'ألف',
    studentId: 'sample-student-1',
    studentName: 'عمر خالد',
    studentEmail: 'omar.khalid@example.com',
    studentPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending',
    aiFeedback: {
      passed: true,
      score: 92,
      feedback_ar: 'كتابة ممتازة لحرف الألف مع همزة متقنة ورسم مستقيم على السطر.',
      feedback_en: 'Excellent writing of letter Alif with accurate Hamza and upright line alignment.',
      observations: ['استقامة خط الألف ممتازة', 'موقع الهمزة مناسب جداً فوق الحرف', 'تناسق في الحجم']
    },
    teacherGrade: 5,
    teacherNotes: '',
    badge: '✍️ خطاط متميز'
  },
  {
    char: 'ب',
    charName: 'باء',
    studentId: 'sample-student-2',
    studentName: 'سارة أحمد',
    studentEmail: 'sara.ahmed@example.com',
    studentPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
    submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'reviewed',
    aiFeedback: {
      passed: true,
      score: 88,
      feedback_ar: 'رسم جيد جداً لصحن الباء مع موضع سليم للنقطة أسفل الحرف.',
      feedback_en: 'Very good base drawing for Baa with proper dot placement underneath.',
      observations: ['استقرار الحرف على السطر', 'النقطة واضحة في المنتصف']
    },
    teacherGrade: 4,
    teacherNotes: 'أحسنتِ يا سارة! ركزي على جعل تقوس الباء أكثر انسيابية عند الطرف الأخير.',
    badge: '🌟 نجم الحروف',
    reviewedAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    char: 'ج',
    charName: 'جيم',
    studentId: 'sample-student-3',
    studentName: 'يوسف العلي',
    studentEmail: 'youssef.ali@example.com',
    studentPhoto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80',
    submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'pending',
    aiFeedback: {
      passed: false,
      score: 74,
      feedback_ar: 'محاولة جيدة، لكن رأس الجيم يحتاج أن يكون فوق السطر وبطنها ينزل أسفل السطر.',
      feedback_en: 'Good attempt, but the head of Jim needs to rest above line and belly dip below.',
      observations: ['النقطة داخل البطن صحيحة', 'يحتاج تدريب على رسم نصف الدائرة السفلية']
    },
    teacherGrade: 3,
    teacherNotes: '',
    badge: '💡 محاولة ممتازة'
  }
];

const TEACHER_BADGES = [
  { id: 'star', label: '🌟 نجم الحروف', labelEn: 'Letter Star' },
  { id: 'calligrapher', label: '✍️ خطاط متميز', labelEn: 'Master Calligrapher' },
  { id: 'perfection', label: '🏆 إتقان كامل', labelEn: 'Full Mastery' },
  { id: 'precision', label: '🎯 دقة في الرسم', labelEn: 'High Precision' },
  { id: 'effort', label: '💡 محاولة ممتازة', labelEn: 'Great Effort' },
];

export const LetterHomeworkInboxModal: React.FC<LetterHomeworkInboxModalProps> = ({
  isOpen,
  onClose,
  selectedChar,
  lang
}) => {
  const [submissions, setSubmissions] = useState<LetterSubmission[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [filterChar, setFilterChar] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // Teacher feedback form state
  const [grade, setGrade] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [selectedBadge, setSelectedBadge] = useState<string>('✍️ خطاط متميز');

  const isAr = lang === 'ar';

  // Sync selected filterChar when selectedChar changes
  useEffect(() => {
    if (selectedChar?.char) {
      setFilterChar(selectedChar.char);
    } else {
      setFilterChar('all');
    }
  }, [selectedChar]);

  // Realtime Firestore Subscription & Local Fallback
  useEffect(() => {
    if (!isOpen) return;

    let unsubscribe = () => {};
    try {
      const colRef = collection(db, 'letter_submissions');
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const items: LetterSubmission[] = [];
          snapshot.forEach((docSnap) => {
            items.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          // Sort newest first
          items.sort((a, b) => {
            const timeA = new Date(a.submittedAt || 0).getTime();
            const timeB = new Date(b.submittedAt || 0).getTime();
            return timeB - timeA;
          });
          setSubmissions(items);
          // Set active selection if none selected
          if (items.length > 0 && !selectedSubId) {
            setSelectedSubId(items[0].id);
          }
        } else {
          // Check local storage or load samples
          const localSaved = localStorage.getItem('hub_letter_submissions');
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            setSubmissions(parsed);
            if (parsed.length > 0 && !selectedSubId) setSelectedSubId(parsed[0].id);
          } else {
            const initialSamples = SAMPLE_SUBMISSIONS.map((s, idx) => ({
              ...s,
              id: `sample-${idx + 1}`
            }));
            setSubmissions(initialSamples);
            localStorage.setItem('hub_letter_submissions', JSON.stringify(initialSamples));
            if (!selectedSubId) setSelectedSubId(initialSamples[0].id);
          }
        }
      }, (error) => {
        console.warn("Letter submissions offline/fallback:", error);
        const localSaved = localStorage.getItem('hub_letter_submissions');
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          setSubmissions(parsed);
          if (parsed.length > 0 && !selectedSubId) setSelectedSubId(parsed[0].id);
        } else {
          const initialSamples = SAMPLE_SUBMISSIONS.map((s, idx) => ({
            ...s,
            id: `sample-${idx + 1}`
          }));
          setSubmissions(initialSamples);
          localStorage.setItem('hub_letter_submissions', JSON.stringify(initialSamples));
          if (!selectedSubId) setSelectedSubId(initialSamples[0].id);
        }
      });
    } catch (e) {
      console.error(e);
    }

    return () => unsubscribe();
  }, [isOpen]);

  // When selected submission changes, fill the teacher form
  const currentSub = submissions.find((s) => s.id === selectedSubId);
  useEffect(() => {
    if (currentSub) {
      setGrade(currentSub.teacherGrade || (currentSub.aiFeedback?.passed ? 5 : 4));
      setNotes(currentSub.teacherNotes || '');
      setSelectedBadge(currentSub.badge || '✍️ خطاط متميز');
    }
  }, [selectedSubId, currentSub]);

  // Add sample submission for teacher testing
  const handleAddSample = async () => {
    const targetChar = selectedChar?.char || 'أ';
    const targetName = selectedChar?.name || 'ألف';
    const names = ['محمد حسن', 'فاطمة الزهراء', 'عبدالله كريم', 'مريم عثمان', 'خالد منصور'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    const newSample: Omit<LetterSubmission, 'id'> = {
      char: targetChar,
      charName: targetName,
      studentId: `student-${Date.now()}`,
      studentName: randomName,
      studentEmail: `${randomName.replace(/\s+/g, '.')}@example.com`,
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      submittedAt: new Date().toISOString(),
      status: 'pending',
      aiFeedback: {
        passed: true,
        score: Math.floor(Math.random() * 20) + 80,
        feedback_ar: `ورقة عمل حرف (${targetChar}) مكتملة بشكل ممتاز وتناسق واضح.`,
        feedback_en: `Worksheet for letter (${targetChar}) completed with great accuracy.`,
        observations: ['وضوح الخط على السطر', 'رسم الحرف سليم', 'جهد تشكر عليه']
      },
      teacherGrade: 5,
      teacherNotes: '',
      badge: '✍️ خطاط متميز'
    };

    try {
      const docRef = await addDoc(collection(db, 'letter_submissions'), {
        ...newSample,
        submittedAt: serverTimestamp()
      });
      setSelectedSubId(docRef.id);
    } catch (e) {
      const localId = `local-${Date.now()}`;
      const updated = [{ ...newSample, id: localId }, ...submissions];
      setSubmissions(updated);
      localStorage.setItem('hub_letter_submissions', JSON.stringify(updated));
      setSelectedSubId(localId);
    }
  };

  // Save Teacher Evaluation
  const handleSaveEvaluation = async () => {
    if (!currentSub) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const updatedData = {
      status: 'reviewed' as const,
      teacherGrade: grade,
      teacherNotes: notes,
      badge: selectedBadge,
      reviewedAt: new Date().toISOString()
    };

    try {
      const docRef = doc(db, 'letter_submissions', currentSub.id);
      await updateDoc(docRef, {
        ...updatedData,
        reviewedAt: serverTimestamp()
      });
    } catch (e) {
      // Local fallback
      const updatedList = submissions.map((s) => 
        s.id === currentSub.id ? { ...s, ...updatedData } : s
      );
      setSubmissions(updatedList);
      localStorage.setItem('hub_letter_submissions', JSON.stringify(updatedList));
    } finally {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Delete submission
  const handleDeleteSubmission = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا الواجب؟' : 'Are you sure you want to delete this submission?')) return;

    try {
      await deleteDoc(doc(db, 'letter_submissions', id));
    } catch (e) {
      const updated = submissions.filter((s) => s.id !== id);
      setSubmissions(updated);
      localStorage.setItem('hub_letter_submissions', JSON.stringify(updated));
    }

    if (selectedSubId === id) {
      const remaining = submissions.filter((s) => s.id !== id);
      setSelectedSubId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Filtering
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesChar = filterChar === 'all' || sub.char === filterChar;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesSearch = searchQuery.trim() === '' || 
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.char.includes(searchQuery) ||
      (sub.charName && sub.charName.includes(searchQuery));
    return matchesChar && matchesStatus && matchesSearch;
  });

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const totalCount = submissions.length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[150] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-6xl h-[92vh] max-h-[850px] rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
        >
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between shrink-0 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Inbox size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black arabic-font tracking-wide">
                    {isAr ? 'مركز تصحيح واستقبال واجبات الحروف' : 'Letter Homework Submissions Hub'}
                  </h2>
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                    <Clock size={11} /> {pendingCount} {isAr ? 'قيد المراجعة' : 'Pending'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  {isAr 
                    ? 'استعراض أوراق العمل والخط المرفوعة من الطلاب وتزويدهم بالتقييم والتغذية الراجعة' 
                    : 'Review uploaded letter handwriting worksheets and provide personalized feedback'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddSample}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10"
                title={isAr ? 'إضافة تسليم تجريبي للاختبار' : 'Add sample submission'}
              >
                <PlusCircle size={14} className="text-blue-300" />
                <span className="hidden sm:inline">{isAr ? 'إضافة نموذج طالب تجريبي' : 'Add Sample'}</span>
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Char & Status Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setFilterChar(selectedChar ? selectedChar.char : 'all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterChar === (selectedChar?.char || 'all')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {selectedChar 
                    ? `${isAr ? 'الحرف المحدد:' : 'Active:'} (${selectedChar.char})` 
                    : (isAr ? 'الحرف النشط' : 'Active Letter')}
                </button>
                <button
                  onClick={() => setFilterChar('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterChar === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isAr ? 'جميع الحروف' : 'All Letters'}
                </button>
              </div>

              {/* Status tabs */}
              <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isAr ? 'الكل' : 'All'} ({totalCount})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock size={12} />
                  <span>{isAr ? 'قيد المراجعة' : 'Pending'}</span> ({pendingCount})
                </button>
                <button
                  onClick={() => setStatusFilter('reviewed')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    statusFilter === 'reviewed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 size={12} />
                  <span>{isAr ? 'تم التصحيح' : 'Reviewed'}</span> ({totalCount - pendingCount})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search size={14} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isAr ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث باسم الطالب أو الحرف...' : 'Search student or letter...'}
                className={`w-full text-xs py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isAr ? 'pr-8 pl-3 text-right' : 'pl-8 pr-3 text-left'
                }`}
              />
            </div>
          </div>

          {/* Body Content - Master Detail */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Left: Submissions List */}
            <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-l md:border-r border-slate-200 bg-slate-50/50 flex flex-col shrink-0 overflow-hidden">
              <div className="p-3 bg-white border-b border-slate-200/80 flex items-center justify-between text-xs font-black text-slate-500">
                <span>{isAr ? 'قائمة تسليمات الطلاب' : 'Student Submissions'}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] text-slate-600">
                  {filteredSubmissions.length} {isAr ? 'واجب' : 'item(s)'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scroll">
                {filteredSubmissions.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Inbox size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{isAr ? 'لا توجد واجبات مطابقة' : 'No matching submissions'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{isAr ? 'يمكنك تجربة فلتر آخر أو إضافة نموذج تجريبي' : 'Try another filter or add a sample'}</p>
                    </div>
                    <button
                      onClick={handleAddSample}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-1"
                    >
                      <PlusCircle size={13} />
                      <span>{isAr ? 'إضافة تسليم تجريبي' : 'Add Sample Submission'}</span>
                    </button>
                  </div>
                ) : (
                  filteredSubmissions.map((sub) => {
                    const isSelected = sub.id === selectedSubId;
                    const isPending = sub.status === 'pending';

                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubId(sub.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer relative group ${
                          isSelected
                            ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10'
                            : 'bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Student Avatar */}
                          <div className="relative">
                            {sub.studentPhoto ? (
                              <img
                                src={sub.studentPhoto}
                                alt={sub.studentName}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center">
                                {sub.studentName.slice(0, 1)}
                              </div>
                            )}
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center border border-white">
                              {sub.char}
                            </span>
                          </div>

                          {/* Student Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-slate-800 truncate">
                                {sub.studentName}
                              </h4>
                              {isPending ? (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Clock size={9} /> {isAr ? 'جديد' : 'New'}
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Check size={9} /> {isAr ? 'تم' : 'Done'}
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <span>حرف {sub.charName || sub.char}</span>
                              <span>•</span>
                              <span>{new Date(sub.submittedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </p>

                            {/* Evaluation/AI snippet */}
                            <div className="mt-1.5 flex items-center justify-between pt-1.5 border-t border-slate-100">
                              {sub.aiFeedback && (
                                <span className={`text-[10px] font-bold flex items-center gap-1 ${
                                  sub.aiFeedback.passed ? 'text-blue-600' : 'text-amber-600'
                                }`}>
                                  <Sparkles size={11} />
                                  <span>{isAr ? 'تدقيق AI:' : 'AI:'} {sub.aiFeedback.score || 90}%</span>
                                </span>
                              )}

                              {sub.teacherGrade ? (
                                <div className="flex items-center gap-0.5 text-amber-500">
                                  {Array.from({ length: sub.teacherGrade }).map((_, i) => (
                                    <Star key={i} size={10} fill="currentColor" />
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[9px] text-slate-400 italic">
                                  {isAr ? 'بانتظار تصحيحك' : 'Awaiting grading'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Delete */}
                          <button
                            onClick={(e) => handleDeleteSubmission(sub.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1 rounded"
                            title={isAr ? 'حذف هذا الواجب' : 'Delete'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Active Submission Detailed View & Grading Workspace */}
            <div className="flex-1 bg-white overflow-y-auto custom-scroll flex flex-col">
              {currentSub ? (
                <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
                  {/* Top Bar for Selected Student */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {currentSub.studentPhoto ? (
                        <img
                          src={currentSub.studentPhoto}
                          alt={currentSub.studentName}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-md">
                          {currentSub.studentName.slice(0, 1)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900 arabic-font">
                            {currentSub.studentName}
                          </h3>
                          <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-[11px] font-black">
                            {isAr ? `واجب حرف ${currentSub.charName || currentSub.char}` : `Letter ${currentSub.charName || currentSub.char}`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {currentSub.studentEmail || 'student@example.com'} • {new Date(currentSub.submittedAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                        currentSub.status === 'reviewed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {currentSub.status === 'reviewed' ? (
                          <>
                            <CheckCheck size={14} />
                            <span>{isAr ? 'تم التصحيح والاعتماد' : 'Reviewed & Approved'}</span>
                          </>
                        ) : (
                          <>
                            <Clock size={14} />
                            <span>{isAr ? 'قيد التصحيح والمراجعة' : 'Pending Review'}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Two Column Layout: Student Work on Left, Review on Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Student Upload Image Preview (5 cols) */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText size={14} className="text-blue-600" />
                          <span>{isAr ? 'الورقة / الخط المرفوع من الطالب' : 'Uploaded Worksheet / Handwriting'}</span>
                        </h4>
                        <button
                          onClick={() => setIsImageZoomed(!isImageZoomed)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <ZoomIn size={13} />
                          <span>{isAr ? 'تكبير' : 'Zoom'}</span>
                        </button>
                      </div>

                      <div className="relative rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-100 group shadow-sm flex items-center justify-center min-h-[260px]">
                        <img
                          src={currentSub.imageUrl}
                          alt="Student Handwriting"
                          className="w-full h-auto max-h-[360px] object-contain cursor-pointer transition-transform group-hover:scale-105"
                          onClick={() => setIsImageZoomed(true)}
                        />
                        <div 
                          onClick={() => setIsImageZoomed(true)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-bold gap-1.5"
                        >
                          <ZoomIn size={18} />
                          <span>{isAr ? 'انقر للمعاينة بحجم كامل' : 'Click for full size'}</span>
                        </div>
                      </div>

                      {/* AI Diagnostic Summary Box */}
                      {currentSub.aiFeedback && (
                        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                              <Sparkles size={13} className="text-blue-600" />
                              <span>{isAr ? 'التقرير الفوري للذكاء الاصطناعي' : 'AI Handwriting Analysis'}</span>
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-200 text-blue-900">
                              {currentSub.aiFeedback.passed ? (isAr ? 'متقن' : 'Passed') : (isAr ? 'يحتاج تدريب' : 'Needs Practice')}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-blue-900 leading-relaxed">
                            {isAr ? currentSub.aiFeedback.feedback_ar : currentSub.aiFeedback.feedback_en}
                          </p>
                          {currentSub.aiFeedback.observations && currentSub.aiFeedback.observations.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-blue-200/50">
                              {currentSub.aiFeedback.observations.map((obs, idx) => (
                                <div key={idx} className="text-[11px] text-blue-800 flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                  <span>{obs}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Teacher Grading & Feedback Workspace (7 cols) */}
                    <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-5 flex flex-col justify-between">
                      <div className="space-y-5">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <Award size={18} className="text-amber-500" />
                            <span>{isAr ? 'تقييم وتوجيهات المعلم' : 'Teacher Feedback & Grading'}</span>
                          </h4>
                          {saveSuccess && (
                            <motion.span 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-xs font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200"
                            >
                              <CheckCircle2 size={14} />
                              <span>{isAr ? 'تم حفظ التقييم بنجاح!' : 'Feedback Saved!'}</span>
                            </motion.span>
                          )}
                        </div>

                        {/* 1. Star Rating */}
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-700 block">
                            {isAr ? 'الدرجة والتقييم بالنجوم:' : 'Star Rating:'}
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((starNum) => (
                              <button
                                key={starNum}
                                type="button"
                                onClick={() => setGrade(starNum)}
                                className={`p-2 rounded-xl border transition-all ${
                                  grade >= starNum
                                    ? 'bg-amber-50 border-amber-300 text-amber-500 scale-105'
                                    : 'bg-slate-50 border-slate-200 text-slate-300 hover:text-amber-300'
                                }`}
                              >
                                <Star size={24} fill={grade >= starNum ? 'currentColor' : 'none'} />
                              </button>
                            ))}
                            <span className="text-xs font-black text-amber-700 mr-2 ml-2">
                              {grade === 5 ? (isAr ? 'ممتاز (5/5)' : 'Excellent (5/5)') :
                               grade === 4 ? (isAr ? 'جيد جداً (4/5)' : 'Very Good (4/5)') :
                               grade === 3 ? (isAr ? 'جيد (3/5)' : 'Good (3/5)') :
                               grade === 2 ? (isAr ? 'مقبول (2/5)' : 'Fair (2/5)') : (isAr ? 'يحتاج إعادة (1/5)' : 'Needs Retry (1/5)')}
                            </span>
                          </div>
                        </div>

                        {/* 2. Motivational Badge / Sticker */}
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-700 block">
                            {isAr ? 'وسام تشجيعي للطالب:' : 'Award a Badge:'}
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {TEACHER_BADGES.map((b) => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => setSelectedBadge(b.label)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                                  selectedBadge === b.label
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {isAr ? b.label : b.labelEn}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 3. Teacher Constructive Comments */}
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-700 block flex items-center justify-between">
                            <span>{isAr ? 'ملاحظات وتوجيهات المعلم المباشرة للطالب:' : 'Teacher Feedback Notes:'}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{isAr ? '(اختياري)' : '(Optional)'}</span>
                          </label>
                          <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={isAr 
                              ? 'اكتب ملاحظة تشجيعية أو توجيه دقيق للطالب لتحسين رسم الحرف ومكانه على السطر...'
                              : 'Write encouraging remarks or tips to help the student perfect their handwriting...'}
                            className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 leading-relaxed resize-none"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                        <button
                          onClick={handleSaveEvaluation}
                          disabled={isSaving}
                          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Send size={15} />
                          <span>
                            {isSaving 
                              ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') 
                              : (isAr ? 'حفظ التقييم وإرسال الملاحظات للطالب' : 'Save & Send Evaluation to Student')}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                  <Inbox size={40} className="text-slate-300" />
                  <p className="text-sm font-bold">{isAr ? 'اختر واجباً من القائمة الجانبية لمعاينته وتصحيحه' : 'Select a submission from the list to review'}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Full Image Zoom Modal */}
        {isImageZoomed && currentSub && (
          <div 
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsImageZoomed(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-2 overflow-hidden shadow-2xl">
              <button
                onClick={() => setIsImageZoomed(false)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
              >
                <X size={18} />
              </button>
              <img
                src={currentSub.imageUrl}
                alt="Full student handwriting"
                className="max-h-[85vh] w-auto object-contain rounded-2xl mx-auto"
              />
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
