
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PenTool, Globe, Sparkles, Loader2, CheckCircle2, XCircle, 
  RefreshCcw, ChevronRight, BookOpen, AlertCircle, 
  Trophy, Lightbulb, FileEdit, Award, MessageCircle, ArrowRightLeft, Keyboard,
  Upload, Download, Trash2, Image as ImageIcon, FileText, Languages, Brain, Users,
  Plus, Settings, Share2, Edit3, ExternalLink, Layout, Palette, Copy, Send, ShieldCheck, X
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { checkWriting, generateWritingPrompt, fileToGenerativePart, generateContentWithRetry } from '../services/gemini';
import { useAuth } from '../components/AuthProvider';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CollaborativeBoard } from '../components/CollaborativeBoard';
import { BoardManagement } from '../components/BoardManagement';
import { StudentToolbar } from '../components/StudentToolbar';

const LEVELS = [
  { id: 'beginner', ar: 'مبتدئ', en: 'Beginner' },
  { id: 'intermediate', ar: 'متوسط', en: 'Intermediate' },
  { id: 'advanced', ar: 'متقدم', en: 'Advanced' },
];

const AR_KEYBOARD = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
  ['أ', 'إ', 'آ', 'لأ', 'لإ', 'لآ', 'ذ', 'ة', 'ى', 'ئ']
];

export const Writing: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  const [text, setText] = React.useState('');
  const [level, setLevel] = React.useState('beginner');
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<any>(null);
  const [prompt, setPrompt] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showKeyboard, setShowKeyboard] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [activeTab, setActiveTab] = React.useState<'notebook' | 'board'>('notebook');
  const [selectedBoardId, setSelectedBoardId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (boardId) {
      setSelectedBoardId(boardId);
      setActiveTab('board');
    }
  }, [boardId]);

  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin';

  // AI Writing Assistant States
  const [isImproving, setIsImproving] = React.useState(false);
  const [improvements, setImprovements] = React.useState<{ original: string, improved: string, reason: string }[] | null>(null);

  React.useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const STRINGS = {
    ar: {
      title: 'أكاديمية الكتابة',
      subtitle: 'دفترك الذكي للتعبير والتحليل',
      placeholder: 'ابدأ الكتابة هنا، أو ارفع صورة لواجبك المنزلي...',
      checkBtn: 'تحليل وتصحيح النص',
      improveBtn: 'تحسين الصياغة (AI)',
      promptBtn: 'مهمة جديدة',
      scoreLabel: 'معدل الإتقان',
      feedbackLabel: 'التقييم والتحليل',
      correctionsLabel: 'الأخطاء المصححة',
      improvementsLabel: 'مقترحات تحسين الأسلوب',
      keywordsLabel: 'بنك الكلمات المساعد',
      uploadBtn: 'رفع صورة الواجب',
      downloadBtn: 'تحميل التقرير',
      lang: 'English',
      reset: 'مسح الدفتر',
      taskLabel: 'المهمة المطلوبة',
      quotaError: 'تجاوزت الحصة المجانية، يرجى الانتظار قليلاً.',
      genError: 'حدث خطأ في معالجة النص.'
    },
    en: {
      title: 'Writing Academy',
      subtitle: 'Your Smart Writing Notebook',
      placeholder: 'Start writing here, or upload your homework photo...',
      checkBtn: 'Analyze & Correct',
      improveBtn: 'Improve Style (AI)',
      promptBtn: 'New Prompt',
      scoreLabel: 'Mastery Rate',
      feedbackLabel: 'Evaluation & Analysis',
      correctionsLabel: 'Corrected Issues',
      improvementsLabel: 'Style Improvements',
      keywordsLabel: 'Helper Keywords',
      uploadBtn: 'Upload Homework',
      downloadBtn: 'Download Report',
      lang: 'العربية',
      reset: 'Clear Notebook',
      taskLabel: 'Writing Task',
      quotaError: 'Quota exceeded. Please wait.',
      genError: 'Error processing text.'
    }
  };

  const t = STRINGS[lang];

  const handleCheck = async () => {
    if (!text.trim() && !selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      let filePart = null;
      if (selectedFile) {
        filePart = await fileToGenerativePart(selectedFile);
      }
      const data = await checkWriting(text, level, filePart);
      if (data.extracted_text) setText(data.extracted_text);
      setResults(data);

      // Save to Student Memory & Mistakes
      if (user && data.corrections && data.corrections.length > 0) {
        const memoryRef = collection(db, 'users', user.uid, 'memory');
        for (const correction of data.corrections) {
          addDoc(memoryRef, {
            type: 'writing',
            content: correction.original,
            correction: correction.correction,
            explanation: correction.explanation,
            userId: user.uid,
            timestamp: serverTimestamp()
          }).catch(error => handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/memory`));
        }

        // Track Interest
        if (prompt?.topic) {
          const interestsRef = collection(db, 'users', user.uid, 'interests');
          addDoc(interestsRef, {
            topic: prompt.topic,
            userId: user.uid,
            frequency: 1,
            lastSeen: serverTimestamp()
          }).catch(error => handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/interests`));
        }
      }
    } catch (e: any) {
      setError(e.message === 'QUOTA_EXCEEDED' ? t.quotaError : t.genError);
    } finally {
      setLoading(false);
    }
  };

  const handleGetPrompt = async () => {
    setLoading(true);
    setError(null);
    try {
      const topic = ['My Family', 'Travel', 'Future Dreams', 'Arabic Food', 'Technology'][Math.floor(Math.random() * 5)];
      const data = await generateWritingPrompt(level, topic);
      setPrompt(data);
      setText('');
      setResults(null);
      setSelectedFile(null);
    } catch (e) {
      setError(t.genError);
    } finally {
      setLoading(false);
    }
  };

  const handleImproveWriting = async () => {
    if (!text.trim()) return;
    setIsImproving(true);
    setImprovements(null);
    try {
      const { Type } = await import("@google/genai");
      const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            improved: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["original", "improved", "reason"]
        }
      };
      
      const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this Arabic text and suggest 3-5 improvements to make it more literary, professional, or use stronger vocabulary. Return as a JSON array of objects with 'original', 'improved', and 'reason' (in Arabic). Text: "${text}"`,
        config: { responseMimeType: 'application/json', responseSchema: schema }
      });
      
      setImprovements(JSON.parse(response.text));
    } catch (err) {
      console.error('Improvement error:', err);
    } finally {
      setIsImproving(false);
    }
  };

  const insertChar = (char: string) => {
    setText(prev => prev + char);
  };

  return (
    <div className={`w-full flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-700 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header Bar */}
      <PageHeader 
        title={t.title} 
        icon={PenTool} 
        lang={lang}
        onToggle={toggleLang}
        rightContent={
          activeTab === 'notebook' && (
            <div className="flex bg-white/10 p-1 rounded-xl border border-white/20">
              {LEVELS.map(l => (
                <button key={l.id} onClick={() => setLevel(l.id)} className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${level === l.id ? 'bg-white text-blue-600' : 'text-white/60 hover:text-white'}`}>
                  {lang === 'ar' ? l.ar : l.en}
                </button>
              ))}
            </div>
          )
        }
      >
        {/* Tab Switcher */}
        <div className="flex bg-black/10 p-1 rounded-xl border border-white/10 ml-4">
          <button 
            onClick={() => setActiveTab('notebook')}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all flex items-center gap-2 ${activeTab === 'notebook' ? 'bg-white text-blue-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
          >
            <FileEdit size={14} />
            <span>{lang === 'ar' ? 'الدفتر الشخصي' : 'Personal Notebook'}</span>
          </button>
          <button 
            onClick={() => setActiveTab('board')}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all flex items-center gap-2 ${activeTab === 'board' ? 'bg-white text-emerald-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
          >
            <Users size={14} />
            <span>{lang === 'ar' ? 'مساحات التفاعل' : 'Interaction Spaces'}</span>
          </button>
        </div>
      </PageHeader>

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
        
        {activeTab === 'board' ? (
          selectedBoardId ? (
            <CollaborativeBoard 
              lang={lang} 
              boardId={selectedBoardId} 
              onBack={() => setSelectedBoardId(null)} 
            />
          ) : (
            <BoardManagement lang={lang} onSelectBoard={setSelectedBoardId} />
          )
        ) : (
          <>
            {/* Printable View (Hidden in UI) */}
            <div className="hidden print:block p-10 bg-white" dir="rtl">
              <div className="border-b-4 border-blue-600 pb-4 mb-8">
                <h1 className="text-3xl font-black arabic-font">تقرير إتقان الكتابة العربية</h1>
                <p className="text-slate-500 font-bold mt-2">المستوى: {level} | التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
              </div>
              <div className="mb-8">
                <h2 className="text-xl font-black mb-2 arabic-font">النص المكتوب:</h2>
                <p className="text-xl arabic-font leading-relaxed bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-inner">{text}</p>
              </div>
              {results && (
                <div className="space-y-6">
                  <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100">
                    <h3 className="text-lg font-black arabic-font text-blue-700 mb-2">التقييم العام:</h3>
                    <p className="text-lg arabic-font leading-relaxed">{results.overall_feedback_ar}</p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-black arabic-font">جدول التصحيحات:</h3>
                    {results.corrections.map((c: any, i: number) => (
                      <div key={i} className="flex items-center gap-6 p-4 border-b border-slate-100">
                        <span className="line-through text-slate-400 arabic-font text-lg">{c.original}</span>
                        <ArrowRightLeft size={16} className="text-blue-400" />
                        <span className="font-black text-emerald-600 arabic-font text-xl">{c.correction}</span>
                        <span className="mr-auto text-sm text-slate-500 arabic-font">{c.explanation_ar}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-6 gap-6 no-print">
              
              {/* Main Editor Section */}
              <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                
                {/* Prompt & Keywords Card - Bilingual Identity */}
                {prompt && (
                  <div className="bg-white border-x-4 border-blue-500 rounded-3xl p-8 shadow-sm animate-in slide-in-from-top-4 flex flex-col md:flex-row gap-10">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb size={20} className="text-blue-500" />
                        <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{t.taskLabel}</span>
                      </div>
                      <h3 className="text-3xl font-black text-slate-800 arabic-font leading-tight">{prompt.promptAr}</h3>
                      <p className="text-sm italic text-slate-400 font-bold">{prompt.promptEn}</p>
                    </div>
                    
                    <div className="shrink-0 md:w-56 border-t md:border-t-0 md:border-r border-slate-100 pt-6 md:pt-0 md:pr-8">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t.keywordsLabel}</p>
                      <div className="flex flex-wrap gap-3 justify-end">
                        {prompt.keywords.map((k: any, i: number) => (
                          <div key={i} className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex flex-col items-center group transition-all hover:bg-emerald-600 hover:text-white cursor-default">
                            <span className="text-sm font-black arabic-font">{k.ar}</span>
                            <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 uppercase transition-opacity">{k.en}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Virtual Notebook */}
                <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden relative">
                  
                  {selectedFile && (
                    <div className="absolute top-6 left-6 z-20 flex items-center gap-3 bg-blue-600 text-white px-5 py-2.5 rounded-full text-xs font-black shadow-lg animate-in zoom-in">
                      <ImageIcon size={16} />
                      <span>{selectedFile.name}</span>
                      <button onClick={() => setSelectedFile(null)} className="hover:text-red-300"><Trash2 size={16} /></button>
                    </div>
                  )}

                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t.placeholder}
                    className="flex-1 w-full p-6 text-base md:text-lg arabic-font font-medium border-none outline-none resize-none bg-slate-50/10 focus:bg-white transition-all shadow-inner placeholder:text-slate-300 placeholder:font-normal"
                    dir="rtl"
                  />

                  {/* Action Toolbar */}
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3 justify-between items-center">
                    <div className="flex gap-2">
                      <button onClick={() => setShowKeyboard(!showKeyboard)} className={`p-4 rounded-2xl transition-all shadow-sm flex items-center gap-3 border ${showKeyboard ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 hover:text-blue-600 border-slate-100'}`}>
                        <Keyboard size={20} /> <span className="text-xs font-black uppercase tracking-widest">Keyboard</span>
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-white border border-slate-100 text-slate-500 hover:text-blue-600 rounded-2xl font-black text-xs transition-all shadow-sm flex items-center gap-3">
                        <Upload size={20} /> <span>{t.uploadBtn}</span>
                      </button>
                      <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} className="hidden" accept="image/*" />
                    </div>
                    
                    <div className="flex gap-3">
                      <button onClick={handleGetPrompt} disabled={loading} className="px-6 py-4 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-2xl font-black text-xs transition-all flex items-center gap-2">
                        <RefreshCcw size={18} /> <span>{t.promptBtn}</span>
                      </button>
                      <button onClick={handleImproveWriting} disabled={loading || isImproving || !text.trim()} className="px-6 py-4 bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl font-black text-xs transition-all flex items-center gap-2 shadow-sm">
                        {isImproving ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        <span>{t.improveBtn}</span>
                      </button>
                      <button onClick={handleCheck} disabled={loading || (!text.trim() && !selectedFile)} className="px-10 py-4 bg-gradient-to-r from-[#2563eb] to-[#059669] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Languages size={20} />}
                        <span>{t.checkBtn}</span>
                      </button>
                    </div>
                  </div>

                  {/* Arabic Keyboard Overlay */}
                  {showKeyboard && (
                    <div className="p-6 bg-slate-100 border-t border-slate-200 animate-in slide-in-from-bottom-5">
                       <div className="flex flex-col gap-2 max-w-2xl mx-auto">
                          {AR_KEYBOARD.map((row, rIdx) => (
                            <div key={rIdx} className="flex justify-center gap-1.5">
                               {row.map(char => (
                                 <button key={char} onClick={() => insertChar(char)} className="w-12 h-12 bg-white border border-slate-200 rounded-xl text-xl font-black arabic-font hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-90 flex items-center justify-center">
                                   {char}
                                 </button>
                               ))}
                            </div>
                          ))}
                          <div className="flex justify-center gap-3 mt-4">
                            <button onClick={() => insertChar(' ')} className="w-64 h-12 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase text-slate-400 hover:bg-blue-50 transition-all shadow-sm">Space</button>
                            <button onClick={() => setText(prev => prev.slice(0, -1))} className="w-32 h-12 bg-red-50 border border-red-100 rounded-xl text-xs font-black uppercase text-red-500 hover:bg-red-100 transition-all shadow-sm">Delete</button>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Analysis Sidebar - Matching Translator Result Style */}
              <div className={`w-full lg:w-[480px] flex flex-col gap-6 overflow-y-auto custom-scroll pr-2 ${(results || improvements) ? 'animate-in slide-in-from-right-10' : ''}`}>
                 {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-10 bg-white rounded-3xl border border-slate-100">
                       <div className="relative">
                          <div className="w-32 h-32 border-8 border-slate-50 border-t-blue-600 rounded-full animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                            <Sparkles size={40} className="animate-bounce" />
                          </div>
                       </div>
                       <div className="text-center">
                          <h4 className="text-xl font-black arabic-font text-slate-800">جاري تصحيح النص...</h4>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Analyzing Bilingual Context</p>
                       </div>
                    </div>
                 ) : (results || improvements) ? (
                    <div className="space-y-6 pb-10">
                       {/* Style Improvements Card */}
                       {improvements && (
                         <div className="space-y-4 mb-8">
                           <div className="flex items-center justify-between px-6">
                             <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest">{t.improvementsLabel}</h4>
                             <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black">{improvements.length} Suggestions</span>
                           </div>
                           {improvements.map((imp: any, i: number) => (
                             <div key={i} className="bg-white border border-emerald-100 p-8 rounded-[2.5rem] shadow-sm space-y-4 group hover:border-emerald-300 transition-all animate-in slide-in-from-right-4" style={{ animationDelay: `${i * 100}ms` }}>
                               <div className="flex flex-col gap-3">
                                 <div className="flex items-center gap-3 justify-end text-slate-400 text-sm italic arabic-font line-through opacity-60">
                                   <span>{imp.original}</span>
                                 </div>
                                 <div className="flex items-center gap-4 justify-end">
                                   <button 
                                     onClick={() => setText(prev => prev.replace(imp.original, imp.improved))}
                                     className="mr-auto p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase"
                                   >
                                     <CheckCircle2 size={14} /> Apply
                                   </button>
                                   <span className="text-xl font-black text-emerald-700 arabic-font bg-emerald-50 px-5 py-2 rounded-xl border border-emerald-100">{imp.improved}</span>
                                 </div>
                               </div>
                               <p className="text-xs font-bold text-slate-500 arabic-font text-right bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">{imp.reason}</p>
                             </div>
                           ))}
                         </div>
                       )}

                       {/* Mastery Score Card */}
                       {results && (
                         <>
                           <div className="bg-gradient-to-br from-[#2563eb] to-[#059669] p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-110" />
                              <div className="relative z-10 flex items-center justify-between">
                                 <div>
                                    <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-3">{t.scoreLabel}</p>
                                    <div className="flex items-end gap-1">
                                       <span className="text-7xl font-black">{results.score}</span>
                                       <span className="text-3xl font-bold opacity-50 mb-2">%</span>
                                    </div>
                                 </div>
                                 <Trophy size={80} className="opacity-40" />
                              </div>
                              <button onClick={() => window.print()} className="mt-10 w-full py-5 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all backdrop-blur-sm">
                                <Download size={22} /> {t.downloadBtn}
                              </button>
                           </div>

                           {/* Bilingual Analysis Card */}
                           <WritingBilingualCard 
                              titleAr="التحليل اللغوي" titleEn="Linguistic Review"
                              contentAr={<p className="text-lg font-black text-slate-800 arabic-font text-right leading-relaxed">{results.overall_feedback_ar}</p>}
                              contentEn={<p className="text-[11px] italic text-slate-400 leading-relaxed border-t border-slate-50 pt-4 mt-2">{results.overall_feedback_en}</p>}
                              theme="blue"
                              icon={<MessageCircle size={16} />}
                           />

                           {/* Corrections List */}
                           <div className="space-y-4">
                              <div className="flex items-center justify-between px-6">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.correctionsLabel}</h4>
                                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black">{results.corrections.length} Issues Found</span>
                              </div>
                              {results.corrections.map((c: any, i: number) => (
                                 <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-6 group hover:border-blue-200 transition-all animate-in slide-in-from-right-4" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="flex items-center gap-6 justify-end border-b border-slate-50 pb-6">
                                       <span className="text-base font-bold text-slate-300 line-through arabic-font decoration-red-400/50">{c.original}</span>
                                       <div className="p-2 bg-blue-50 text-blue-400 rounded-full"><ArrowRightLeft size={16} /></div>
                                       <span className="text-2xl font-black text-emerald-600 arabic-font bg-emerald-50 px-6 py-3 rounded-2xl shadow-sm">{c.correction}</span>
                                    </div>
                                    <div className="space-y-2">
                                       <p className="text-sm font-bold text-slate-600 arabic-font text-right bg-slate-50/50 p-4 rounded-2xl">{c.explanation_ar}</p>
                                       <p className="text-xs italic text-slate-400 px-4">{c.explanation_en}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                         </>
                       )}

                       <button onClick={() => { setResults(null); setImprovements(null); setText(''); setPrompt(null); setSelectedFile(null); }} className="w-full py-5 border-4 border-dashed border-slate-100 text-slate-300 hover:text-blue-600 hover:border-blue-100 rounded-[2.5rem] text-xs font-black uppercase transition-all flex items-center justify-center gap-3">
                          <Trash2 size={16} /> {t.reset}
                       </button>
                    </div>
                 ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 select-none bg-white rounded-[3rem] border-4 border-dashed border-slate-100 p-12">
                       <FileText size={100} className="mb-8 text-slate-200" />
                       <h3 className="text-2xl font-black arabic-font text-slate-400 mb-2">أهلاً بك في دفترك</h3>
                       <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">Wesal Analysis Hub</p>
                    </div>
                 )}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Student Toolbar - Visible in Interaction Spaces or Notebook for students */}
      {profile?.role === 'student' && (
        <StudentToolbar 
          onAction={(action) => {
            if (action === 'text') setShowKeyboard(true);
            if (action === 'image') fileInputRef.current?.click();
            // Handle other actions
          }} 
        />
      )}
    </div>
  );
};

const WritingBilingualCard: React.FC<{ titleAr: string, titleEn: string, contentAr: React.ReactNode, contentEn: React.ReactNode, theme: string, icon?: React.ReactNode }> = ({ titleAr, titleEn, contentAr, contentEn, theme, icon }) => {
  return (
    <div className={`p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-md flex flex-col gap-4 relative overflow-hidden group`}>
      <div className="flex justify-between items-center opacity-40">
        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">{icon} {titleEn}</span>
        <span className="text-xs font-black arabic-font">{titleAr}</span>
      </div>
      <div className="flex flex-col gap-2 relative z-10">
        {contentAr}
        {contentEn}
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full translate-x-12 translate-y-12 -z-0 opacity-0 group-hover:opacity-100 transition-all duration-500" />
    </div>
  );
};
