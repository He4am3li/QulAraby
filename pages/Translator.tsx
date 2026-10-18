
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRightLeft, Loader2, Volume2, GraduationCap, ChevronRight, PlayCircle, CheckCircle, XCircle, Lightbulb, Languages, BookOpen, ChevronDown, Sparkles } from 'lucide-react';
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { TranslatorAcademy } from '../components/TranslatorAcademy';
import { translateAndExpand, generateSpeech, decodeAudioData, generatePracticeQuestions, speak as globalSpeak } from '../services/gemini';
import { Vocabulary, QuizQuestion } from '../types';
import { updateSRS } from '../utils/srs';
import { useAuth } from '../components/AuthProvider';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const Translator: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'translator' | 'academy'>('translator');
  const [word, setWord] = React.useState('');
  const [isEngToAr, setIsEngToAr] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any | null>(null);
  const [practiceMode, setPracticeMode] = React.useState(false);
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [feedback, setFeedback] = React.useState<{ isCorrect: boolean; text: string } | null>(null);
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );


  React.useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new CustomEvent('langChanged'));
  };

  const t = {
    title: lang === 'ar' ? 'المترجم الذكي' : 'Smart Translator',
    placeholder: isEngToAr 
      ? (lang === 'ar' ? "اكتب كلمة إنجليزية..." : "Enter English word...")
      : (lang === 'ar' ? "اكتب كلمة عربية..." : "Enter Arabic word..."),
    analyzeBtn: lang === 'ar' ? 'ترجم وتعلم' : 'Translate & Learn',
    enterLabel: isEngToAr
      ? (lang === 'ar' ? 'أدخل كلمة أو جملة إنجليزية' : 'Enter English word or phrase')
      : (lang === 'ar' ? 'أدخل كلمة أو جملة عربية' : 'Enter Arabic word or phrase'),
    keyboardBtn: lang === 'ar' ? 'إظهار لوحة المفاتيح' : 'Show Arabic Keyboard',
    langLabel: lang === 'ar' ? 'English' : 'العربية',
    testBtn: lang === 'ar' ? 'اختبر معلوماتك' : 'Test Your Knowledge',
    pronunciation: lang === 'ar' ? 'النطق' : 'Pronunciation',
    definition: lang === 'ar' ? 'التعريف' : 'Definition',
    analysis: lang === 'ar' ? 'التحليل اللغوي' : 'Linguistic Analysis',
    example: lang === 'ar' ? 'مثال' : 'Example',
    studyRule: lang === 'ar' ? '← ادرس القاعدة' : '← Study Rule',
    next: lang === 'ar' ? 'التالي' : 'Next',
    finish: lang === 'ar' ? 'إنهاء' : 'Finish',
  };
  const audioContextRef = React.useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  };

  const speak = async (text: string, lang: 'ar' | 'en') => {
    await globalSpeak(text, lang);
  };

  const handleTranslate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!word.trim()) return;
    setLoading(true);
    setResult(null);
    setPracticeMode(false);
    try {
      const data = await translateAndExpand(word, isEngToAr);
      setResult(data);
    } catch (error) { alert('Failed to translate.'); }
    finally { setLoading(false); }
  };

  const startPractice = async () => {
    if (!result) return;
    setLoading(true);
    try {
      const qs = await generatePracticeQuestions(result as Vocabulary);
      setQuestions(qs);
      setPracticeMode(true);
      setCurrentStep(0);
      setFeedback(null);
    } catch (e) { alert("Failed to start practice."); }
    finally { setLoading(false); }
  };

  const handleAnswer = (answer: string) => {
    if (feedback) return;
    const correct = questions[currentStep].correctAnswer === answer;
    setFeedback({
      isCorrect: correct,
      text: correct ? "Excellent! أحسنت" : `Note: ${questions[currentStep].explanation}`
    });
  };

  const nextQuestion = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setFeedback(null);
    } else {
      finishPractice();
    }
  };

  const finishPractice = () => {
    if (result) {
      const updated = updateSRS(result as Vocabulary, feedback?.isCorrect ? 'easy' : 'medium');
      const existing = JSON.parse(localStorage.getItem('hub_vocab') || '[]');
      localStorage.setItem('hub_vocab', JSON.stringify([...existing.filter((v:any)=>v.id !== result.id), updated]));

      // Save to Firestore for the "Connected Journey"
      if (user) {
        const vocabRef = collection(db, 'users', user.uid, 'vocabulary');
        addDoc(vocabRef, {
          original_word: updated.original_word,
          arabic_definition: updated.arabic_definition || '',
          english_definition: updated.english_definition || '',
          userId: user.uid,
          source: 'Translator',
          createdAt: serverTimestamp()
        }).catch(err => console.error("Failed to sync vocab to Firestore", err));
      }
    }
    setPracticeMode(false);
  };

  const handleGrammarNavigate = (topic: string) => {
    if (!topic) return;
    // تنظيف النص من أي كلمات إضافية غير ضرورية للبحث
    const cleanTopic = topic.replace('مبني للمجهول', 'المبني للمجهول').trim();
    navigate('/assistant', { state: { autoTopic: cleanTopic } });
  };

  return (
    <div className={`w-full flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-700 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header Bar */}
      <PageHeader
        title={t.title}
        icon={Languages}
        lang={lang}
        onToggle={toggleLang}
      />

      {/* Split Layout: Right sidebar (smaller) + Left main view */}
      <div className="flex-1 flex overflow-hidden bg-slate-50/30">
        
        {/* Right Sidebar (aside) */}
        <aside className="w-[280px] bg-white border-r rtl:border-r-0 rtl:border-l border-slate-100 flex flex-col shrink-0 no-print relative shadow-sm">
          <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              {lang === 'ar' ? 'أقسام المترجم' : 'Translator Sections'}
            </h3>
            <div className="space-y-2.5">
              {/* Item 1: Instant Translator */}
              <button 
                onClick={() => setActiveTab('translator')}
                className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-right group ${
                  activeTab === 'translator' 
                    ? 'border-blue-500 bg-blue-50/70 text-blue-700 shadow-xs' 
                    : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 text-slate-600'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105 shrink-0 ${
                  activeTab === 'translator' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-100'
                }`}>
                  <Languages size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black arabic-font truncate leading-tight mb-0.5">
                    {lang === 'ar' ? 'المترجم الفوري' : 'Instant Translator'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium truncate font-sans">
                    {lang === 'ar' ? 'Instant Translator' : 'المترجم الفوري'}
                  </p>
                </div>
                <ChevronRight size={14} className={`opacity-30 shrink-0 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>

              {/* Item 2: Translator Academy (placed directly beneath) */}
              <button 
                onClick={() => setActiveTab('academy')}
                className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-right group ${
                  activeTab === 'academy' 
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-700 shadow-xs' 
                    : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 text-slate-600'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105 shrink-0 ${
                  activeTab === 'academy' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 border border-slate-100'
                }`}>
                  <GraduationCap size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black arabic-font truncate leading-tight mb-0.5">
                    {lang === 'ar' ? 'أكاديمية الترجمة' : 'Translator Academy'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium truncate font-sans">
                    {lang === 'ar' ? 'Translator Academy' : 'أكاديمية الترجمة'}
                  </p>
                </div>
                <ChevronRight size={14} className={`opacity-30 shrink-0 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </aside>

        {/* Left Main View */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Tab 1: Translator Academy */}
          {activeTab === 'academy' && (
            <TranslatorAcademy lang={lang} />
          )}

          {/* Tab 2: Instant Translator */}
          {activeTab === 'translator' && (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              
              {/* Practice Mode Overlays */}
              {practiceMode && (
                <div className="absolute inset-0 z-[60] bg-white p-6 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                  <div className="max-w-lg w-full space-y-6 text-center">
                    <div className="flex gap-2 justify-center mb-4">
                      {questions.map((_, i) => (
                        <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${i <= currentStep ? 'bg-[#059669]' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{questions[currentStep].question}</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {questions[currentStep].options.map((opt, i) => (
                        <button key={i} onClick={() => handleAnswer(opt)} disabled={!!feedback} className={`p-3 rounded-xl font-bold text-sm border-2 transition-all ${feedback ? (opt === questions[currentStep].correctAnswer ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white opacity-40') : 'bg-white hover:border-blue-500 hover:bg-blue-50'}`}>{opt}</button>
                      ))}
                    </div>
                    {feedback && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 animate-in slide-in-from-top-2">
                        <p className="font-bold text-xs text-slate-800 mb-3">{feedback.text}</p>
                        <button onClick={nextQuestion} className="w-full bg-[#2563eb] text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                          {currentStep < questions.length - 1 ? t.next : t.finish} <ChevronRight size={14} className={lang === 'ar' ? 'rotate-180' : ''} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden">
                
                {/* Input Section */}
                <div className="shrink-0 space-y-4">
                  <div className="relative group">
                    <textarea
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                      placeholder={t.placeholder}
                      className={`w-full h-32 p-6 text-xl border border-slate-200 rounded-[1.5rem] outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all resize-none shadow-sm font-medium arabic-font placeholder:text-slate-300 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    />
                    <button 
                      onClick={() => setIsEngToAr(!isEngToAr)}
                      className="absolute bottom-4 left-4 p-2 bg-white border border-slate-100 rounded-lg shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"
                    >
                      <ArrowRightLeft size={12} className="text-blue-500" />
                      {isEngToAr ? 'EN → AR' : 'AR → EN'}
                    </button>
                  </div>

                  <button
                    onClick={handleTranslate}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Languages size={20} className="text-amber-300" />
                        <span className="tracking-tight uppercase">{t.analyzeBtn}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Results Grid */}
                {result && (
                  <div className="flex-1 overflow-hidden grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-4 flex flex-col">
                    
                    <div className="flex justify-between items-center mb-1 shrink-0 px-2">
                      <button onClick={startPractice} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                        <GraduationCap size={16} className="text-emerald-400" /> {t.testBtn}
                      </button>
                      <div className="bg-emerald-50 px-4 py-1.5 rounded-full text-xs font-black text-emerald-700 arabic-font border border-emerald-100">
                        {isEngToAr ? result.translation : result.original_word}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1 overflow-y-auto custom-scroll pr-2">
                      
                      {/* 1. Pronunciation Card */}
                      <CompactBilingualCard 
                        titleAr={t.pronunciation} titleEn="Pronunciation"
                        contentAr={<div className="flex items-center gap-2 justify-end"><span className="text-2xl font-black arabic-font text-slate-800">{isEngToAr ? result.translation : result.original_word}</span><button onClick={() => speak(isEngToAr ? result.translation : result.original_word, 'ar')} className="p-2 bg-emerald-100 text-[#059669] rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><Volume2 size={20} /></button></div>}
                        contentEn={<div className="flex items-center gap-2"><span className="font-black text-slate-600">{isEngToAr ? result.original_word : result.translation}</span><button onClick={() => speak(isEngToAr ? result.original_word : result.translation, 'en')} className="p-2 bg-blue-100 text-[#2563eb] rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Volume2 size={20} /></button></div>}
                        theme="blue"
                      />

                      {/* 2. Definition Card */}
                      <CompactBilingualCard 
                        titleAr={t.definition} titleEn="Definition"
                        contentAr={<p className="text-sm font-bold arabic-font text-right text-slate-700 leading-relaxed">{result.arabic_definition}</p>}
                        contentEn={<p className="text-[11px] italic text-slate-400 leading-relaxed">{result.english_definition}</p>}
                        theme="green"
                      />

                      {/* 3. Linguistic Analysis Card (Interactive Grammar Rules) */}
                      <CompactBilingualCard 
                        titleAr={t.analysis} titleEn="Linguistic Analysis"
                        contentAr={
                          <div className="text-right space-y-2">
                            <button 
                              onClick={() => handleGrammarNavigate(result.analysis.details_ar.category)}
                              className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 inline-block hover:bg-[#059669] hover:text-white transition-all shadow-sm active:scale-95 group"
                            >
                              <span className="flex items-center gap-1.5">
                                <BookOpen size={10} className="group-hover:text-white" /> {result.analysis.details_ar.category}
                              </span>
                            </button>
                            <button 
                              onClick={() => handleGrammarNavigate(result.analysis.details_ar.sub_category)}
                              className="block w-full text-right text-[9px] font-black text-slate-400 arabic-font hover:text-[#2563eb] transition-colors group px-1"
                            >
                              {result.analysis.details_ar.sub_category} 
                              <span className="opacity-0 group-hover:opacity-100 mr-1 text-[8px]">{t.studyRule}</span>
                            </button>
                          </div>
                        }
                        contentEn={
                          <div className="text-left space-y-1">
                            <span className="text-[9px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 inline-block uppercase tracking-tighter">
                              {result.analysis.type}
                            </span>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">
                              {result.analysis.details_en.category}
                            </p>
                          </div>
                        }
                        theme="purple"
                      />

                      {/* 4. Example Card */}
                      <CompactBilingualCard 
                        titleAr={t.example} titleEn="Contextual Example"
                        contentAr={<p className="text-sm font-black arabic-font text-right text-emerald-900 leading-relaxed bg-emerald-50/30 p-2 rounded-lg border border-emerald-100/50">{result.analysis.details_ar.example}</p>}
                        contentEn={<p className="text-[10px] text-blue-900/60 leading-tight italic px-1">{result.analysis.details_en.example}</p>}
                        theme="amber"
                      />

                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const CompactBilingualCard: React.FC<{ titleAr: string, titleEn: string, contentAr: React.ReactNode, contentEn: React.ReactNode, theme: string }> = ({ titleAr, titleEn, contentAr, contentEn, theme }) => {
  const colorSet = {
    green: 'border-emerald-500 bg-emerald-50/30',
    purple: 'border-purple-500 bg-purple-50/30',
    amber: 'border-amber-500 bg-amber-50/30',
    blue: 'border-blue-500 bg-blue-50/30'
  }[theme as 'green' | 'purple' | 'amber' | 'blue'] || 'border-slate-200 bg-white';

  return (
    <div className={`p-4 rounded-[1.5rem] border-x-4 ${colorSet} shadow-sm flex flex-col justify-center min-h-[100px] transition-all hover:shadow-md group`}>
      <div className="flex justify-between items-center mb-2 opacity-40">
        <span className="text-[10px] font-black arabic-font">{titleAr}</span>
        <span className="text-[8px] font-black uppercase tracking-[0.2em]">{titleEn}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="text-right animate-in slide-in-from-right-2">{contentAr}</div>
        <div className="text-left animate-in slide-in-from-left-2">{contentEn}</div>
      </div>
    </div>
  );
};
