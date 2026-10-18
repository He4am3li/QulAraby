import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Save, ArrowLeft, GripVertical, CheckCircle2, 
  Circle, HelpCircle, LayoutGrid, Type, AlertCircle, Loader2,
  ListOrdered, Move, MousePointer2, Link2, PenTool, Sparkles, X
} from 'lucide-react';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, query, orderBy, writeBatch, getDoc, getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import confetti from 'canvas-confetti';

interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'fill_blank' | 'ordering' | 'drag_drop' | 'matching';
  options: string[];
  correctAnswer: string;
  points: number;
  order: number;
}

const EditableTextarea = ({ value, onSave, placeholder, className, rows = 2 }: { value: string, onSave: (val: string) => void, placeholder: string, className: string, rows?: number }) => {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => { setLocalValue(value); }, [value]);

  return (
    <textarea 
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => { if (localValue !== value) onSave(localValue); }}
      placeholder={placeholder}
      className={className}
      rows={rows}
    />
  );
};

const EditableInput = ({ value, onSave, placeholder, className, type = 'text', pr = '' }: { value: string, onSave: (val: string) => void, placeholder: string, className: string, type?: string, pr?: string }) => {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => { setLocalValue(value); }, [value]);

  return (
    <input 
      type={type}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => { if (localValue !== value) onSave(localValue); }}
      placeholder={placeholder}
      className={`${className} ${pr}`}
    />
  );
};

interface QuizData {
  title: string;
  quizType: string;
  studyMaterial?: string;
  status: string;
  maxAttempts?: number;
}

interface QuizEditorProps {
  quizId: string;
  lang: 'ar' | 'en';
  onBack: () => void;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({ quizId, lang, onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const QUIZ_TYPES = [
    { ar: 'اختبار قصير', en: 'Quiz' },
    { ar: 'امتحان نهائي', en: 'Final Exam' },
    { ar: 'اختبار كتابة', en: 'Writing' },
    { ar: 'اختبار استماع', en: 'Listening' },
    { ar: 'اختبار تحدث', en: 'Speaking' },
    { ar: 'تدريب', en: 'Practice' },
  ];

  useEffect(() => {
    if (!quizId) return;
    
    const fetchQuiz = async () => {
      const docSnap = await getDoc(doc(db, 'quizzes', quizId));
      if (docSnap.exists()) {
        setQuizData(docSnap.data() as QuizData);
      }
    };
    fetchQuiz();

    const q = query(collection(db, 'quizzes', quizId, 'questions'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
      setQuestions(qs);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `quizzes/${quizId}/questions`);
      setError(lang === 'ar' ? 'فشل تحميل الأسئلة' : 'Failed to load questions');
      setLoading(false);
    });
    return unsubscribe;
  }, [quizId, lang]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        updateQuizField('studyMaterial', compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const addQuestion = async (type: Question['type']) => {
    const newQuestion = {
      text: '',
      type,
      options: (type === 'mcq' || type === 'ordering' || type === 'drag_drop') ? ['', '', '', ''] 
             : (type === 'matching' ? ['', '', '', ''] : (type === 'true_false' ? ['صح', 'خطأ'] : [])),
      correctAnswer: type === 'true_false' ? 'صح' : '',
      points: 1,
      order: questions.length
    };
    try {
      await addDoc(collection(db, 'quizzes', quizId, 'questions'), newQuestion);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `quizzes/${quizId}/questions`);
    }
  };

  const updateQuestionField = async (id: string, field: string, value: any) => {
    try {
      await updateDoc(doc(db, 'quizzes', quizId, 'questions', id), { [field]: value });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `quizzes/${quizId}/questions/${id}`);
    }
  };

  const updateQuizField = async (field: string, value: any) => {
    try {
      setQuizData(prev => prev ? { ...prev, [field]: value } : null);
      
      let updateData: any = { [field]: value };
      if (field === 'quizType') {
        const typeObj = QUIZ_TYPES.find(t => t.ar === value);
        if (typeObj) {
          updateData.quizTypeEn = typeObj.en;
        }
      }
      
      await updateDoc(doc(db, 'quizzes', quizId), updateData);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `quizzes/${quizId}`);
    }
  };

  const publishQuiz = async () => {
    if (questions.length === 0) {
      alert(lang === 'ar' ? 'يجب إضافة سؤال واحد على الأقل قبل النشر' : 'You must add at least one question before publishing');
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'quizzes', quizId), {
        status: 'active',
        questionsCount: questions.length
      });
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b']
      });
      setTimeout(() => onBack(), 2000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `quizzes/${quizId}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا السؤال؟' : 'Are you sure you want to delete this question?')) return;
    try {
      await deleteDoc(doc(db, 'quizzes', quizId, 'questions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `quizzes/${quizId}/questions/${id}`);
    }
  };

  const colorMap: Record<string, { bg: string, text: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-500' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-500' },
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="font-bold text-slate-400">{lang === 'ar' ? 'جاري تحميل المحرر...' : 'Loading editor...'}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F9FAFB] overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Editor Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all text-slate-500 active:scale-95"
          >
            <ArrowLeft size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-xl font-black text-slate-900 arabic-font">
                    {lang === 'ar' ? 'تصميم الاختبار' : 'Quiz Designer'}
                </h2>
                <div className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-blue-100">
                    Draft
                </div>
            </div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[1.5px]">
              {questions.length} {lang === 'ar' ? 'سؤال مضاف حتى الآن' : 'Total Questions Added'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'تم الحفظ' : 'Saved'}</span>
            </div>
            <button 
                onClick={publishQuiz}
                disabled={saving}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50 active:scale-95"
            >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {lang === 'ar' ? 'نشر الآن' : 'Publish'}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Quick Tools Panel */}
            <div className="bg-white rounded-[1.8rem] border border-slate-200 p-6 shadow-sm flex flex-wrap gap-3 items-center justify-between">
                <div>
                    <h3 className="text-xs font-black text-slate-900 mb-0.5 arabic-font">{lang === 'ar' ? 'أدوات البناء' : 'Constructor Tools'}</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{lang === 'ar' ? 'اضغط لإضافة نوع سؤال جديد' : 'Tap to add a question'}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {[
                        { id: 'mcq' as const, icon: LayoutGrid, label: lang === 'ar' ? 'اختيار' : 'MCQ', color: 'blue' },
                        { id: 'true_false' as const, icon: HelpCircle, label: lang === 'ar' ? 'صح/خطأ' : 'T/F', color: 'emerald' },
                        { id: 'short_answer' as const, icon: Type, label: lang === 'ar' ? 'قصير' : 'Short', color: 'amber' },
                        { id: 'fill_blank' as const, icon: PenTool, label: lang === 'ar' ? 'فراغ' : 'Fill', color: 'orange' },
                        { id: 'ordering' as const, icon: ListOrdered, label: lang === 'ar' ? 'ترتيب' : 'Order', color: 'indigo' },
                        { id: 'matching' as const, icon: Link2, label: lang === 'ar' ? 'مطابقة' : 'Match', color: 'purple' },
                        { id: 'drag_drop' as const, icon: Move, label: lang === 'ar' ? 'سحب' : 'Drag', color: 'rose' },
                    ].map((tool) => (
                        <button 
                            key={tool.id}
                            onClick={() => addQuestion(tool.id)}
                            className="group flex flex-col items-center gap-1.5 p-3 min-w-[70px] bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 hover:shadow-lg transition-all"
                        >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${colorMap[tool.color].bg} ${colorMap[tool.color].text} group-hover:scale-110`}>
                                <tool.icon size={16} />
                            </div>
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900">
                                {tool.label}
                            </span>
                        </button>
                    ))}
                    <div className="w-px h-10 bg-slate-100 mx-1.5 hidden lg:block" />
                    <button 
                        onClick={() => {/* AI Review logic would go here */}}
                        className="group flex flex-col items-center gap-1.5 p-3 min-w-[70px] bg-slate-900 border border-slate-800 rounded-2xl hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                    >
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-white/10 text-blue-400 group-hover:scale-110">
                            <Sparkles size={16} />
                        </div>
                        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest group-hover:text-white">
                            {lang === 'ar' ? 'مراجعة AI' : 'AI Review'}
                        </span>
                    </button>
                </div>
            </div>

            {/* General Settings */}
            <div className="bg-white rounded-[1.8rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                   <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Save className="text-blue-500" size={14} />
                     {lang === 'ar' ? 'إعدادات الاختبار' : 'Project Settings'}
                   </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                            {lang === 'ar' ? 'نوع الاختبار' : 'Category'}
                        </label>
                        <select 
                            value={quizData?.quizType}
                            onChange={(e) => updateQuizField('quizType', e.target.value)}
                            className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs cursor-pointer focus:border-blue-500 transition-all appearance-none"
                        >
                            {QUIZ_TYPES.map(s => (
                                <option key={s.en} value={s.ar}>{lang === 'ar' ? s.ar : s.en}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                            {lang === 'ar' ? 'المادة التعليمية (صورة)' : 'Reference Image'}
                        </label>
                        <div className="flex gap-3">
                            <label className="flex-1 cursor-pointer flex items-center justify-center h-11 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/10 transition-all group">
                                <Plus size={16} className="text-slate-300 group-hover:text-blue-400 mr-2" />
                                <span className="text-[10px] font-black text-slate-500 group-hover:text-blue-600">{quizData?.studyMaterial ? (lang === 'ar' ? 'تبديل' : 'Swap') : (lang === 'ar' ? 'إرفاق' : 'Attach')}</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>
                            {quizData?.studyMaterial && (
                                <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-blue-100 group relative shadow-lg">
                                    <img src={quizData.studyMaterial} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    <button 
                                        onClick={() => updateQuizField('studyMaterial', '')} 
                                        className="absolute inset-0 bg-rose-500 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                            {lang === 'ar' ? 'عدد المحاولات المتاحة للطلاب (0 = غير محدود)' : 'Allowed Attempts (0 = Unlimited)'}
                        </label>
                        <div className="relative">
                            <input 
                                type="number" 
                                min="0"
                                value={quizData?.maxAttempts || 0}
                                onChange={(e) => updateQuizField('maxAttempts', parseInt(e.target.value) || 0)}
                                className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs focus:border-blue-500 transition-all"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                {lang === 'ar' ? 'محاولة' : 'Attempts'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {questions.map((q, idx) => (
                    <motion.div 
                        layout
                        key={q.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                        className="bg-white rounded-[1.8rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500 overflow-hidden group"
                    >
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-[10px]">
                                    {idx + 1}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                        {q.type.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                    <GripVertical size={16} />
                                </button>
                                <button 
                                    onClick={() => deleteQuestion(q.id)}
                                    className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all active:scale-90 shadow-sm"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-6">
                            <div>
                                <label className="text-[9px] font-black text-slate-400 mb-2 block uppercase tracking-widest ml-0.5">
                                    {lang === 'ar' ? 'نص السؤال' : 'Question Statement'}
                                </label>
                                <EditableTextarea 
                                    value={q.text}
                                    onSave={(val) => updateQuestionField(q.id, 'text', val)}
                                    placeholder={lang === 'ar' ? 'اكتب سؤالك هنا...' : 'Define the challenge here...'}
                                    className="w-full bg-slate-50/80 border border-slate-100 rounded-[1.2rem] px-5 py-4 outline-none focus:bg-white focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.05)] transition-all font-black text-lg lg:text-xl arabic-font resize-none scrollbar-hide"
                                    rows={2}
                                />
                            </div>

                            <div className="bg-slate-50/50 rounded-[1.5rem] p-6 md:p-8 border border-slate-100">
                                {q.type === 'mcq' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className="relative group/opt">
                                                    <EditableInput 
                                                        value={opt}
                                                        onSave={(val) => {
                                                            const newOpts = [...q.options];
                                                            newOpts[oIdx] = val;
                                                            updateQuestionField(q.id, 'options', newOpts);
                                                        }}
                                                        placeholder={`${lang === 'ar' ? 'خيار' : 'Option'} ${oIdx + 1}`}
                                                        className={`w-full h-12 ${q.correctAnswer === opt && opt !== '' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/10' : 'bg-white border-slate-200'} border-2 rounded-xl px-4 py-2 outline-none transition-all font-bold text-xs`}
                                                        pr="pr-12"
                                                    />
                                                    <button 
                                                        onClick={() => updateQuestionField(q.id, 'correctAnswer', opt)}
                                                        className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${q.correctAnswer === opt && opt !== '' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}
                                                    >
                                                        <CheckCircle2 size={16} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={() => updateQuestionField(q.id, 'options', [...q.options, ''])}
                                            className="h-11 px-6 border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500 rounded-xl flex items-center gap-2 transition-all font-black text-[9px] uppercase tracking-widest mx-auto"
                                        >
                                            <Plus size={16} /> {lang === 'ar' ? 'إضافة خيار' : 'Add Option'}
                                        </button>
                                    </div>
                                )}

                                {q.type === 'true_false' && (
                                    <div className="flex gap-4">
                                        {['صح', 'خطأ'].map((val) => (
                                            <button 
                                                key={val}
                                                onClick={() => updateQuestionField(q.id, 'correctAnswer', val)}
                                                className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-[1.8rem] border-2 transition-all group ${
                                                    q.correctAnswer === val 
                                                        ? (val === 'صح' ? 'bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-500/10' : 'bg-rose-50 border-rose-500 shadow-xl shadow-rose-500/10') 
                                                        : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                                                }`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                                                    q.correctAnswer === val 
                                                    ? (val === 'صح' ? 'bg-emerald-500 border-white text-white' : 'bg-rose-500 border-white text-white')
                                                    : 'bg-slate-50 border-slate-100 text-slate-300'
                                                }`}>
                                                    {val === 'صح' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                                </div>
                                                <span className={`text-xl font-black arabic-font ${q.correctAnswer === val ? 'text-slate-900' : 'text-slate-400'}`}>
                                                    {val === 'صح' ? (lang === 'ar' ? 'صح' : 'True') : (lang === 'ar' ? 'خطأ' : 'False')}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'short_answer' && (
                                    <div className="relative">
                                        <label className="text-[9px] font-black text-slate-400 mb-2 block uppercase tracking-widest ml-0.5">
                                            {lang === 'ar' ? 'الإجابة النموذجية' : 'Model Answer'}
                                        </label>
                                        <div className="relative">
                                            <EditableInput 
                                                value={q.correctAnswer}
                                                onSave={(val) => updateQuestionField(q.id, 'correctAnswer', val)}
                                                placeholder={lang === 'ar' ? 'أدخل المصطلح الصحيح...' : 'Input correct answer...'}
                                                className="w-full h-12 px-6 bg-white border-2 border-blue-100 rounded-xl outline-none focus:border-blue-500 transition-all font-black text-base text-blue-600 arabic-font"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                                                <PenTool size={16} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {q.type === 'fill_blank' && (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-[1.2rem] flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shrink-0">
                                                <HelpCircle size={16} />
                                            </div>
                                            <div>
                                                <p className="font-black text-amber-900 text-[10px] mb-0.5 arabic-font">
                                                    {lang === 'ar' ? 'تنبيه' : 'Note'}
                                                </p>
                                                <p className="text-[9px] font-bold text-amber-900/60 leading-relaxed">
                                                    {lang === 'ar' 
                                                        ? 'ضع [___] في نص السؤال بالأعلى.' 
                                                        : 'Use [___] in the statement above.'}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 mb-2 block uppercase tracking-widest ml-0.5">
                                                {lang === 'ar' ? 'الكلمة المطلوبة' : 'Anchor Word'}
                                            </label>
                                            <EditableInput 
                                                value={q.correctAnswer}
                                                onSave={(val) => updateQuestionField(q.id, 'correctAnswer', val)}
                                                className="w-full h-12 px-6 bg-amber-500/5 border-2 border-amber-500/20 rounded-xl outline-none focus:border-amber-500 transition-all font-black text-lg text-center text-amber-600"
                                                placeholder="..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {q.type === 'ordering' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className="flex items-center gap-3 group/item">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                                                        {oIdx + 1}
                                                    </div>
                                                    <EditableInput 
                                                        value={opt}
                                                        onSave={(val) => {
                                                            const newOpts = [...q.options];
                                                            newOpts[oIdx] = val;
                                                            updateQuestionField(q.id, 'options', newOpts);
                                                        }}
                                                        className="flex-1 h-11 bg-white border border-slate-200 rounded-xl px-4 outline-none font-bold text-xs focus:border-blue-500 transition-all"
                                                        placeholder={lang === 'ar' ? `الخطوة ${oIdx + 1}` : `Step ${oIdx + 1}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={() => updateQuestionField(q.id, 'options', [...q.options, ''])}
                                            className="h-11 px-6 bg-slate-100/50 hover:bg-slate-100 text-slate-500 rounded-xl flex items-center gap-2 transition-all font-black text-[9px] uppercase tracking-widest mx-auto border border-slate-200 border-dashed"
                                        >
                                            <Plus size={16} /> {lang === 'ar' ? 'إضافة مرحلة' : 'Add Step'}
                                        </button>
                                    </div>
                                )}

                                {q.type === 'matching' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-3">
                                            {q.options.map((opt, oIdx) => {
                                                const [left, right] = opt.split('|');
                                                return (
                                                    <div key={oIdx} className="flex items-center gap-3 bg-white p-4 rounded-[1.2rem] border border-slate-100 shadow-sm relative group/pair">
                                                        <EditableInput 
                                                            placeholder={lang === 'ar' ? 'المصطلح' : 'Term'}
                                                            value={left || ''}
                                                            onSave={(val) => {
                                                                const newOpts = [...q.options];
                                                                newOpts[oIdx] = `${val}|${right || ''}`;
                                                                updateQuestionField(q.id, 'options', newOpts);
                                                            }}
                                                            className="flex-1 h-11 px-4 bg-slate-50 rounded-lg font-bold text-xs outline-none focus:border-blue-400 transition-all border border-transparent"
                                                        />
                                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 shrink-0 border border-slate-100">
                                                            <Link2 size={14} />
                                                        </div>
                                                        <EditableInput 
                                                            placeholder={lang === 'ar' ? 'التعريف' : 'Definition'}
                                                            value={right || ''}
                                                            onSave={(val) => {
                                                                const newOpts = [...q.options];
                                                                newOpts[oIdx] = `${left || ''}|${val}`;
                                                                updateQuestionField(q.id, 'options', newOpts);
                                                            }}
                                                            className="flex-1 h-11 px-4 bg-slate-50 rounded-lg font-bold text-xs outline-none focus:border-blue-400 transition-all border border-transparent"
                                                        />
                                                        <button 
                                                            onClick={() => {
                                                                const newOpts = q.options.filter((_, i) => i !== oIdx);
                                                                updateQuestionField(q.id, 'options', newOpts);
                                                            }}
                                                            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover/pair:opacity-100 transition-opacity"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button 
                                            onClick={() => updateQuestionField(q.id, 'options', [...q.options, '|'])}
                                            className="h-11 px-6 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl flex items-center gap-2 transition-all font-black text-[9px] uppercase tracking-widest mx-auto border border-blue-100 border-dashed"
                                        >
                                            <Plus size={16} /> {lang === 'ar' ? 'إضافة رابط' : 'Add Relation'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            {lang === 'ar' ? 'النقاط' : 'Pts'}
                                        </span>
                                        <input 
                                            type="number"
                                            value={q.points}
                                            onChange={(e) => updateQuestionField(q.id, 'points', parseInt(e.target.value))}
                                            className="w-10 bg-white rounded-md py-0.5 text-center font-black text-sm text-blue-600 outline-none border border-slate-200"
                                        />
                                    </div>
                                </div>
                                <div className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">
                                    ID: {q.id.slice(0, 8)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {questions.length > 0 && (
                <div className="pt-8 pb-12 flex flex-col items-center border-t border-slate-100">
                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            { id: 'mcq' as const, label: lang === 'ar' ? 'اختيار' : 'MCQ' },
                            { id: 'true_false' as const, label: lang === 'ar' ? 'صح/خطأ' : 'T/F' },
                            { id: 'short_answer' as const, label: lang === 'ar' ? 'سؤال قصير' : 'Short' },
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => addQuestion(type.id)}
                                className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                <Plus size={14} />
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {questions.length === 0 && (
                <button 
                    onClick={() => addQuestion('mcq')}
                    className="w-full h-[400px] flex flex-col items-center justify-center text-slate-300 bg-white border-2 border-dashed border-slate-200 rounded-[4rem] group hover:border-blue-500 hover:bg-blue-50/5 transition-all outline-none"
                >
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 group-hover:scale-110 transition-transform">
                        <Plus size={48} className="text-slate-200 group-hover:text-blue-500" />
                    </div>
                    <p className="font-black text-xl lg:text-2xl arabic-font group-hover:text-slate-900 transition-colors">
                        {lang === 'ar' ? 'لا يوجد أسئلة بعد، اضغط للإضافة!' : 'Empty Canvas. Tap to Add!'}
                    </p>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.3em] mt-4">Create your first challenge now</p>
                </button>
            )}
        </div>
      </div>
      
      {/* Floating Action Menu for Mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => addQuestion('mcq')}
          className="w-16 h-16 bg-blue-600 text-white rounded-3xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
            <Plus size={32} />
        </button>
      </div>
    </div>

  );
};
