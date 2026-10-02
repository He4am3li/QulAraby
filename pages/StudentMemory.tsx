
import React from 'react';
import { 
  Brain, History, Target, TrendingUp, BookOpen, 
  CheckCircle2, AlertCircle, ArrowRight, Sparkles,
  Calendar, Clock, Award, Star, Zap, Trash2,
  ChevronRight, MessageSquare, PenTool, BookMarked, XCircle
} from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc, getDocs, where } from 'firebase/firestore';
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";
import { generateContentWithRetry } from '../services/gemini';

interface MemoryItem {
  id: string;
  type: 'writing' | 'reading' | 'speaking' | 'vocabulary';
  content: string;
  correction?: string;
  explanation?: string;
  timestamp: any;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const StudentMemory: React.FC = () => {
  const { user, isAuthReady } = useAuth();
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  const [memoryItems, setMemoryItems] = React.useState<MemoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalMistakes: 0,
    reviewedToday: 0,
    masteryRate: 0,
    streak: 0
  });
  const [reviewSession, setReviewSession] = React.useState<any>(null);
  const [isGeneratingReview, setIsGeneratingReview] = React.useState(false);

  React.useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  React.useEffect(() => {
    if (!user || !isAuthReady) return;

    // We'll aggregate from a 'memory' collection where we'll store mistakes from all sections
    const q = query(
      collection(db, 'users', user.uid, 'memory'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MemoryItem[];
      setMemoryItems(items);
      setStats(prev => ({
        ...prev,
        totalMistakes: items.length,
        masteryRate: Math.round(Math.random() * 20 + 70) // Mock for now
      }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/memory`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  const t = {
    ar: {
      title: 'ذاكرتي الذكية',
      subtitle: 'تتبع تقدمك وراجع أخطاءك بذكاء',
      statsTitle: 'ملخص الأداء',
      totalMistakes: 'أخطاء قيد المراجعة',
      masteryRate: 'معدل الإتقان',
      streak: 'أيام متتالية',
      recentActivity: 'النشاط الأخير',
      generateReview: 'بدء جلسة مراجعة ذكية',
      noData: 'لا توجد بيانات كافية بعد. استمر في التعلم وسأقوم بتسجيل نقاط ضعفك هنا.',
      writing: 'كتابة',
      reading: 'قراءة',
      speaking: 'تحدث',
      vocabulary: 'مفردات',
      delete: 'حذف من الذاكرة',
      reviewModalTitle: 'جلسة مراجعة مخصصة',
      reviewLoading: 'جاري تحليل أخطائك وتحضير الجلسة...',
      apply: 'تطبيق',
      close: 'إغلاق'
    },
    en: {
      title: 'Student Memory',
      subtitle: 'Track your progress and review mistakes smartly',
      statsTitle: 'Performance Summary',
      totalMistakes: 'Mistakes to Review',
      masteryRate: 'Mastery Rate',
      streak: 'Daily Streak',
      recentActivity: 'Recent Activity',
      generateReview: 'Start Smart Review Session',
      noData: 'Not enough data yet. Keep learning and I will track your weak points here.',
      writing: 'Writing',
      reading: 'Reading',
      speaking: 'Speaking',
      vocabulary: 'Vocabulary',
      delete: 'Remove from Memory',
      reviewModalTitle: 'Personalized Review Session',
      reviewLoading: 'Analyzing your mistakes and preparing session...',
      apply: 'Apply',
      close: 'Close'
    }
  }[lang];

  const handleGenerateReview = async () => {
    if (memoryItems.length === 0) return;
    setIsGeneratingReview(true);
    try {
      const schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          explanation: { type: Type.STRING },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        },
        required: ["title", "explanation", "exercises"]
      };

      const mistakesContext = memoryItems.map(m => `${m.type}: ${m.content} -> ${m.correction || ''}`).join('\n');
      
      const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: `Create a personalized review session for a student based on these recent mistakes in Arabic learning. Focus on the patterns of errors. 
        Mistakes:
        ${mistakesContext}
        
        Return a JSON object with a title, a brief explanation of the patterns found, and 3-5 multiple choice exercises to practice the corrected forms.`,
        config: { responseMimeType: 'application/json', responseSchema: schema }
      });

      setReviewSession(JSON.parse(response.text));
    } catch (err) {
      console.error('Review generation error:', err);
    } finally {
      setIsGeneratingReview(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'memory', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/memory/${id}`);
    }
  };

  return (
    <div className={`w-full flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-700 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <PageHeader
        title={t.title}
        icon={Brain}
        lang={lang}
        onToggle={toggleLang}
      />

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 custom-scroll">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<AlertCircle className="text-rose-500" />} label={t.totalMistakes} value={stats.totalMistakes} color="rose" />
          <StatCard icon={<TrendingUp className="text-emerald-500" />} label={t.masteryRate} value={`${stats.masteryRate}%`} color="emerald" />
          <StatCard icon={<Zap className="text-amber-500" />} label={t.streak} value={stats.streak} color="amber" />
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center gap-4 group hover:border-indigo-200 transition-all cursor-pointer" onClick={handleGenerateReview}>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest text-center">{t.generateReview}</span>
          </div>
        </div>

        {/* Recent Activity / Mistakes List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-black text-slate-800 arabic-font">{t.recentActivity}</h2>
            <div className="flex gap-2">
              {['writing', 'reading', 'speaking', 'vocabulary'].map(type => (
                <span key={type} className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  {t[type as keyof typeof t]}
                </span>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            </div>
          ) : memoryItems.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-20 border-4 border-dashed border-slate-100 text-center">
              <History size={80} className="mx-auto mb-6 text-slate-200" />
              <p className="text-slate-400 font-bold arabic-font max-w-md mx-auto">{t.noData}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {memoryItems.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={item.id} 
                  className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-6 group"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    item.type === 'writing' ? 'bg-blue-50 text-blue-600' :
                    item.type === 'reading' ? 'bg-emerald-50 text-emerald-600' :
                    item.type === 'speaking' ? 'bg-rose-50 text-rose-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {item.type === 'writing' ? <PenTool size={24} /> :
                     item.type === 'reading' ? <BookOpen size={24} /> :
                     item.type === 'speaking' ? <MessageSquare size={24} /> :
                     <BookMarked size={24} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{t[item.type]}</span>
                      <span className="text-[9px] font-bold text-slate-300">{new Date(item.timestamp?.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-black text-slate-800 arabic-font truncate">{item.content}</p>
                      {item.correction && (
                        <>
                          <ArrowRight size={16} className="text-slate-300" />
                          <p className="text-xl font-black text-emerald-600 arabic-font truncate">{item.correction}</p>
                        </>
                      )}
                    </div>
                    {item.explanation && (
                      <p className="text-xs text-slate-400 arabic-font mt-1 opacity-80">{item.explanation}</p>
                    )}
                  </div>

                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-3 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    title={t.delete}
                  >
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Session Modal */}
      <AnimatePresence>
        {reviewSession && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black arabic-font">{reviewSession.title}</h2>
                  <p className="text-white/70 text-xs font-bold mt-1">{t.reviewModalTitle}</p>
                </div>
                <button onClick={() => setReviewSession(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scroll">
                <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                  <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2">Analysis</h3>
                  <p className="text-lg font-bold text-slate-700 arabic-font leading-relaxed">{reviewSession.explanation}</p>
                </div>

                <div className="space-y-6">
                  {reviewSession.exercises.map((ex: any, i: number) => (
                    <div key={i} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-6">
                      <div className="flex gap-4">
                        <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shrink-0 font-black text-xs">{i + 1}</span>
                        <p className="text-xl font-black text-slate-800 arabic-font leading-relaxed">{ex.question}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ex.options.map((opt: string, j: number) => (
                          <button key={j} className="p-4 border border-slate-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-right font-bold arabic-font text-slate-600">
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setReviewSession(null)}
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-slate-800 transition-all"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay for Review Generation */}
      {isGeneratingReview && (
        <div className="fixed inset-0 z-[110] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center space-y-8">
          <div className="relative">
            <div className="w-24 h-24 border-8 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
            <Sparkles className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={32} />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black arabic-font text-slate-800">{t.reviewLoading}</h3>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-2">AI Memory Processing</p>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-slate-200 transition-all">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform ${
      color === 'rose' ? 'bg-rose-50' : color === 'emerald' ? 'bg-emerald-50' : 'bg-amber-50'
    }`}>
      {icon}
    </div>
    <div>
      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
      <span className={`block text-2xl font-black leading-none ${
        color === 'rose' ? 'text-rose-600' : color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'
      }`}>{value}</span>
    </div>
  </div>
);
