
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Library, BookOpen, RefreshCcw, Volume2, CheckCircle2, Award, ArrowRight, Loader2, XCircle, Trophy, Star, ChevronRight, Sparkles, Globe, MessageSquare, Lightbulb, ListChecks, Info, Download, AlertCircle, Brain } from 'lucide-react';
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { generateGrammarLesson, generateAssistantQuiz, generateSpeech, decodeAudioData, speak } from '../services/gemini';
import { ChatMessage, CertificateData, Vocabulary } from '../types';
import { IrabAssistant } from '../components/IrabAssistant';
import { useAuth } from '../components/AuthProvider';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export const AIStudyMate: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [topic, setTopic] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [quizMode, setQuizMode] = React.useState(false);
  const [quizQuestions, setQuizQuestions] = React.useState<any[]>([]);
  const [quizIndex, setQuizIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [feedback, setFeedback] = React.useState<{isCorrect: boolean, textAr: string, textEn: string} | null>(null);
  const [certificate, setCertificate] = React.useState<CertificateData | null>(null);
  const [masteredSkills, setMasteredSkills] = React.useState<string[]>([]);
  const [userVocab, setUserVocab] = React.useState<Vocabulary[]>([]);
  const [recentMistake, setRecentMistake] = React.useState<any>(null);
  const [recentInterest, setRecentInterest] = React.useState<any>(null);
  
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);

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
    header: lang === 'ar' ? 'معلم القواعد' : 'Grammar Tutor',
    title: lang === 'ar' ? 'محرر القواعد الذكي' : 'Smart Grammar Editor',
    subtitle: lang === 'ar' ? 'اكتب اسم أي قاعدة لغوية لتبسيطها وتحليلها فوراً.' : 'Write the name of any grammar rule to simplify and analyze it instantly.',
    placeholder: lang === 'ar' ? 'ما هي القاعدة التي تود إتقانها اليوم؟' : 'What rule would you like to master today?',
    loading: lang === 'ar' ? 'جاري صياغة المحتوى التعليمي...' : 'Formulating educational content...',
    arabicExplanation: lang === 'ar' ? 'الشرح العربي' : 'Arabic Explanation',
    englishContext: lang === 'ar' ? 'English Context' : 'English Context',
    parsingGuide: lang === 'ar' ? 'دليل الإعراب' : 'Parsing Guide',
    role: lang === 'ar' ? 'الركن' : 'Role',
    state: lang === 'ar' ? 'الحالة' : 'State',
    sign: lang === 'ar' ? 'العلامة' : 'Sign',
    quizStart: lang === 'ar' ? "Let's Quiz! | ابدأ التحدي" : "Let's Quiz!",
    question: lang === 'ar' ? 'السؤال' : 'Question',
    nextQuestion: lang === 'ar' ? 'السؤال التالي' : 'Next Question',
    showResult: lang === 'ar' ? 'عرض النتيجة' : 'Show Result',
    certificateTitle: lang === 'ar' ? 'شهادة إتقان' : 'Mastery Certificate',
    downloadPdf: lang === 'ar' ? 'تحميل PDF' : 'DOWNLOAD PDF',
    continueLearning: lang === 'ar' ? 'متابعة التعلم' : 'CONTINUE LEARNING',
    correct: lang === 'ar' ? 'أحسنت الاختيار!' : 'Correct Choice!',
    niceTry: lang === 'ar' ? 'محاولة جيدة' : 'Nice Try',
    correctAnswer: lang === 'ar' ? 'إجابة صحيحة! أحسنت.' : 'Correct answer! Well done.',
    wrongAnswer: (ans: string) => lang === 'ar' ? `غير دقيق. الإجابة الصحيحة هي: ${ans}` : `Not quite. The correct answer is: ${ans}`,
    suggestedTopics: [
      { ar: 'الجملة الاسمية', en: 'Nominal Sentence' },
      { ar: 'كان وأخواتها', en: 'Kana & Sisters' },
      { ar: 'إن وأخواتها', en: 'Inna & Sisters' },
      { ar: 'الفعل المضارع', en: 'Present Tense' }
    ]
  };

  React.useEffect(() => {
    const checkRecentMistakes = async () => {
      if (!user) return;
      try {
        const memoryRef = collection(db, 'users', user.uid, 'memory');
        const q = query(memoryRef, orderBy('timestamp', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const mistake = querySnapshot.docs[0].data();
          setRecentMistake({
            ...mistake,
            createdAt: mistake.timestamp // Mapping for component compatibility
          });
        }
      } catch (err) {
        console.error("Error checking recent mistakes:", err);
      }
    };
    const checkRecentInterests = async () => {
      if (!user) return;
      try {
        const interestsRef = collection(db, 'users', user.uid, 'interests');
        const q = query(interestsRef, orderBy('lastSeen', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const interest = querySnapshot.docs[0].data();
          setRecentInterest(interest);
        }
      } catch (err) {
        console.error("Error checking recent interests:", err);
      }
    };
    checkRecentMistakes();
    checkRecentInterests();
  }, [user]);

  const handleReviewMistake = () => {
    if (!recentMistake) return;
    setTopic(recentMistake.explanation || recentMistake.content);
    startLesson(recentMistake.explanation || recentMistake.content);
    setRecentMistake(null);
  };

  React.useEffect(() => {
    const savedSkills = localStorage.getItem('hub_skills');
    if (savedSkills) setMasteredSkills(JSON.parse(savedSkills));

    const savedVocab = localStorage.getItem('hub_vocab');
    if (savedVocab) setUserVocab(JSON.parse(savedVocab));

    if (location.state?.autoTopic) {
      setTopic(location.state.autoTopic);
    }
  }, [location.state]);

  React.useEffect(() => {
    if (topic && location.state?.autoTopic === topic && messages.length === 0) {
      startLesson();
    }
  }, [topic]);

  const saveSkill = (skill: string, cert: CertificateData) => {
    const updatedSkills = Array.from(new Set([...masteredSkills, skill]));
    setMasteredSkills(updatedSkills);
    localStorage.setItem('hub_skills', JSON.stringify(updatedSkills));

    const savedCerts = JSON.parse(localStorage.getItem('hub_certificates') || '[]');
    const updatedCerts = [...savedCerts.filter((c: CertificateData) => c.topic !== cert.topic), cert];
    localStorage.setItem('hub_certificates', JSON.stringify(updatedCerts));
  };

  const initAudio = () => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  };

  // Using global speak helper from services

  const startLesson = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setMessages([]);
    setCertificate(null);
    setQuizMode(false);
    setFeedback(null);
    
    const vocabWords = userVocab.map(v => v.original_word);

    try {
      const lesson = await generateGrammarLesson(topic, vocabWords, masteredSkills);
      setMessages([lesson]);
      speak(lesson.content_ar, 'ar');
    } catch (e) { alert("Failed to start lesson."); }
    finally { setLoading(false); }
  };

  const handleOptionSelect = async (option: string) => {
    if (option.includes('Ready') || option.includes('Challenge') || option.includes('Quiz')) {
      startQuiz();
    } else {
      setTopic(option);
      startLesson();
    }
  };

  const startQuiz = async () => {
    setLoading(true);
    const vocabWords = userVocab.map(v => v.original_word);
    try {
      const qs = await generateAssistantQuiz(topic, vocabWords);
      setQuizQuestions(qs);
      setQuizMode(true);
      setQuizIndex(0);
      setScore(0);
      setFeedback(null);
    } catch (e) { alert("Failed to load quiz."); }
    finally { setLoading(false); }
  };

  const handleQuizAnswer = (answer: string) => {
    if (feedback) return;
    const currentQ = quizQuestions[quizIndex];
    const isCorrect = answer === currentQ.correctAnswer;
    
    if (isCorrect) setScore(s => s + 1);

    setFeedback({
      isCorrect,
      textAr: isCorrect ? 'إجابة صحيحة! أحسنت.' : `غير دقيق. الإجابة الصحيحة هي: ${currentQ.correctAnswer}`,
      textEn: isCorrect ? 'Correct! Well done.' : `Correction: ${currentQ.correctAnswer}`
    });

    if (isCorrect) speak('أحسنت', 'ar');
  };

  const nextStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFeedback(null);
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const finalScorePercent = Math.round((score / quizQuestions.length) * 100);
    const passed = score >= 8;

    const resultMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content_ar: passed 
        ? `رائع! حصلت على ${score} من 10. إليك شهادة التميز.` 
        : `حصلت على ${score} من 10. تحتاج 8 للنجاح. راجع دروسك جيداً!`,
      content_en: passed 
        ? `Brilliant! You scored ${score}/10. Here is your Certificate.` 
        : `You scored ${score}/10. You need 8 to pass. Keep practicing!`,
      type: passed ? 'congrats' : 'feedback'
    };

    setMessages(prev => [...prev, resultMsg]);

    if (passed) {
      const newCert: CertificateData = {
        studentName: 'Arabic Learner',
        topic,
        date: new Date().toLocaleDateString(),
        score: finalScorePercent,
        certificateId: `HUB-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
      setCertificate(newCert);
      saveSkill(topic, newCert);
    }
    setQuizMode(false);
  };

  const visibleMessages = messages.slice(-1);

  return (
    <div className={`w-full flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header Bar - Hub Brand Colors */}
      <PageHeader
        title={t.header}
        icon={Library}
        lang={lang}
        onToggle={toggleLang}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }} />

        <div className="flex-1 p-6 overflow-y-auto custom-scroll flex flex-col relative z-10">
          
          {/* Recent Mistake Alert */}
          {recentMistake && messages.length === 0 && !loading && !quizMode && (
            <div className="w-full max-w-4xl mx-auto mb-8 animate-in slide-in-from-top-6 duration-500 no-print">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-xl shadow-amber-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-amber-300/30 transition-all duration-700" />
                <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg relative z-10">
                  <Brain size={32} />
                </div>
                <div className="flex-1 relative z-10">
                  <h3 className="text-xl font-black text-amber-900 arabic-font mb-1">
                    {lang === 'ar' ? 'أهلاً بك! رأيتك بالأمس تواجه صعوبة في:' : 'Welcome back! I noticed you had some trouble with:'}
                  </h3>
                  <p className="text-amber-700 font-bold arabic-font">
                    {recentMistake.content} → {recentMistake.correction}
                  </p>
                  <p className="text-sm text-amber-600 mt-2">
                    {lang === 'ar' ? 'هل تود أن نراجع سوياً هذه القاعدة لنجعل كتابتك القادمة أكثر دقة؟' : 'Would you like to review this rule together to make your next writing more accurate?'}
                  </p>
                </div>
                <button 
                  onClick={handleReviewMistake}
                  className="bg-amber-600 text-white px-8 py-4 rounded-2xl font-black arabic-font hover:bg-amber-700 transition-all shadow-lg active:scale-95 relative z-10"
                >
                  {lang === 'ar' ? 'لنراجع الآن' : 'Review Now'}
                </button>
              </div>
            </div>
          )}

          {/* Recent Interest Suggestion */}
          {recentInterest && !recentMistake && messages.length === 0 && !loading && !quizMode && (
            <div className="w-full max-w-4xl mx-auto mb-8 animate-in slide-in-from-top-6 duration-500 no-print">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-xl shadow-blue-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-300/30 transition-all duration-700" />
                <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg relative z-10">
                  <Sparkles size={32} />
                </div>
                <div className="flex-1 relative z-10">
                  <h3 className="text-xl font-black text-blue-900 arabic-font mb-1">
                    {lang === 'ar' ? 'يبدو أنك مهتم بـ:' : 'It seems you are interested in:'}
                  </h3>
                  <p className="text-blue-700 font-bold arabic-font text-2xl uppercase">
                    {recentInterest.topic}
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    {lang === 'ar' ? 'لقد قرأت عن هذا الموضوع مؤخراً. هل تود أن نتعلم القواعد المتعلقة به؟' : 'You read about this recently. Would you like to learn the grammar related to it?'}
                  </p>
                </div>
                <button 
                  onClick={() => { setTopic(recentInterest.topic); startLesson(); setRecentInterest(null); }}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black arabic-font hover:bg-blue-700 transition-all shadow-lg active:scale-95 relative z-10"
                >
                  {lang === 'ar' ? 'ابدأ الدرس' : 'Start Lesson'}
                </button>
              </div>
            </div>
          )}

          {messages.length === 0 && !loading && !quizMode && (
            <div className="flex-1 flex flex-col items-center justify-center w-full space-y-12 animate-in zoom-in-95 no-print">
              <div className="p-12 bg-white rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-50 max-w-4xl w-full relative text-center">
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 p-7 bg-gradient-to-br from-[#2563eb] to-[#059669] rounded-2xl text-white shadow-2xl">
                   <BookOpen size={48} />
                 </div>
                 <h3 className="text-3xl font-black text-slate-800 mb-3 mt-8 arabic-font">{t.title}</h3>
                 <p className="text-slate-400 text-sm font-medium arabic-font leading-relaxed">{t.subtitle}</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3 max-w-7xl">
                {t.suggestedTopics.map(topicItem => (
                  <button 
                    key={topicItem.ar} 
                    onClick={() => { setTopic(topicItem.ar); }} 
                    className="px-8 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-black transition-all hover:bg-blue-50 hover:border-blue-300 text-slate-600 arabic-font shadow-sm active:scale-95 hover:shadow-md"
                  >
                    {lang === 'ar' ? topicItem.ar : topicItem.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
             <div className="h-full flex flex-col items-center justify-center space-y-4 no-print">
                <div className="w-14 h-14 border-4 border-slate-100 border-t-[#2563eb] rounded-full animate-spin" />
                <p className="font-black text-slate-400 text-[10px] uppercase tracking-widest arabic-font animate-pulse">{t.loading}</p>
             </div>
          )}

          {!quizMode && !certificate && visibleMessages.map((m) => (
            <div key={m.id} className="w-full max-w-7xl mx-auto animate-in slide-in-from-bottom-6 duration-700 flex flex-col gap-8 pb-10">
              
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10 relative overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-emerald-50/40 p-6 rounded-[2rem] border-r-8 border-[#059669] shadow-sm">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-2 tracking-widest flex items-center gap-2">{t.arabicExplanation}</h4>
                    <p className="text-xl font-bold text-slate-800 arabic-font leading-relaxed">{m.content_ar}</p>
                  </div>
                  <div className="bg-blue-50/40 p-6 rounded-[2rem] border-l-8 border-[#2563eb] shadow-sm">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">{t.englishContext}</h4>
                    <p className="text-sm font-medium text-slate-500 italic leading-relaxed">{m.content_en}</p>
                  </div>
                </div>

                {m.infographic && (
                  <div className="space-y-12">
                    <div className="flex flex-wrap justify-center gap-4">
                      {m.infographic.concept_items?.map((v: any, i: number) => (
                        <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-50 shadow-lg flex flex-col items-center text-center w-full sm:w-44 transition-all hover:scale-105 hover:shadow-xl group">
                           <div className="text-4xl mb-3 select-none">{v.icon}</div>
                           <span className="text-xl font-black arabic-font mb-1" style={{ color: v.color }}>{v.word_ar}</span>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">{v.word_en}</p>
                           <div className="h-px w-8 bg-slate-100 mb-2" />
                           <p className="text-[11px] font-bold text-slate-500 arabic-font italic">"{v.example_ar}"</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      <div className="lg:col-span-8 bg-white rounded-[2rem] shadow-xl border border-slate-50 overflow-hidden">
                        <div className="bg-[#0f172a] px-6 py-4 text-white flex justify-between items-center">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">{m.infographic.title_en} | {t.parsingGuide}</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'} arabic-font`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                            <thead>
                              <tr className="bg-slate-50/70 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">{t.role}</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">{t.state}</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">{t.sign}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {m.infographic.parsing_guide?.map((row: any, i: number) => (
                                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                  <td className="px-6 py-5">
                                    <div className="text-lg font-black text-slate-800">{row.role_ar}</div>
                                    <div className="text-[9px] text-slate-400 font-bold uppercase">({row.role_en})</div>
                                  </td>
                                  <td className="px-6 py-5">
                                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-black border border-emerald-100">{row.state_ar}</span>
                                  </td>
                                  <td className="px-6 py-5 text-[12px] font-bold text-slate-600">{row.sign_ar}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="lg:col-span-4 space-y-4">
                        {m.infographic.notes?.map((note: any, i: number) => (
                          <div key={i} className="bg-[#fffcf0] border border-amber-100 p-5 rounded-[1.5rem] shadow-sm flex items-start gap-3">
                            <div className="w-8 h-8 bg-amber-400 text-white rounded-full shrink-0 flex items-center justify-center font-black text-lg">!</div>
                            <div className="flex-1 text-right">
                               <p className="text-[13px] font-black text-amber-900 arabic-font leading-relaxed mb-0.5">{note.ar}</p>
                               <p className="text-[9px] italic text-amber-700/60 leading-snug text-left" dir="ltr">{note.en}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {m.options && (
                <div className="flex flex-wrap justify-center gap-3 py-6 no-print">
                  <button onClick={startQuiz} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs flex items-center gap-3 shadow-lg hover:scale-105 transition-all">
                     <Trophy size={16} className="text-amber-500" /> {t.quizStart}
                  </button>
                  {m.options.map(opt => (
                    <button key={opt} onClick={() => handleOptionSelect(opt)} className="px-8 py-4 bg-white border border-slate-200 text-[#2563eb] rounded-2xl font-black text-xs hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm">
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {quizMode && quizQuestions[quizIndex] && (
            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-50 shadow-xl animate-in zoom-in duration-300 relative max-w-4xl mx-auto w-full flex flex-col my-8 text-center min-h-[400px]">
              <div className="flex items-center justify-between mb-8 shrink-0">
                <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">{t.question} {quizIndex + 1} / 10</span>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                   <Trophy size={14} /> <span className="text-sm font-black">{score} / 10</span>
                </div>
              </div>
              
              <div className="mb-8 flex-1 flex flex-col justify-center">
                <p className="text-xs font-bold text-slate-400 italic mb-2">{quizQuestions[quizIndex].content_en}</p>
                <h4 className="text-2xl md:text-3xl font-black text-slate-900 arabic-font leading-relaxed">{quizQuestions[quizIndex].content_ar}</h4>
              </div>

              {!feedback ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
                  {quizQuestions[quizIndex].options?.map((opt: string) => (
                    <button key={opt} onClick={() => handleQuizAnswer(opt)} className="p-4 bg-slate-50 border border-slate-100 hover:border-blue-600 hover:bg-white rounded-xl font-bold text-lg text-slate-700 transition-all arabic-font active:scale-95">{opt}</button>
                  ))}
                </div>
              ) : (
                <div className={`p-8 rounded-[2rem] border-4 animate-in zoom-in flex flex-col items-center shrink-0 relative z-[60] ${feedback.isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-50'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    {feedback.isCorrect ? <CheckCircle2 className="text-emerald-500" size={32} /> : <XCircle className="text-red-500" size={32} />}
                    <h3 className="text-xl font-black arabic-font text-slate-800">{feedback.isCorrect ? t.correct : t.niceTry}</h3>
                  </div>
                  <p className="text-md font-bold text-slate-600 arabic-font mb-6 text-center">{feedback.textAr}</p>
                  <button onClick={nextStep} className="w-full py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-sm shadow-lg hover:border-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95 relative z-[70]">
                    {quizIndex < quizQuestions.length - 1 ? t.nextQuestion : t.showResult} <ChevronRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
                  </button>
                </div>
              )}
            </div>
          )}

          {certificate && (
            <div className="p-16 bg-white rounded-[4rem] border-8 border-slate-50 shadow-2xl animate-in zoom-in duration-500 flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto my-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.05] text-[#2563eb] rotate-12"><Award size={200} /></div>
                <Award size={80} className="text-amber-500 drop-shadow-lg" />
                <h1 className="text-4xl font-black text-slate-900 uppercase">{t.certificateTitle}</h1>
                <p className="text-xl text-[#2563eb] font-bold underline underline-offset-[10px]">Arabic Learner</p>
                <h2 className="text-4xl font-black text-emerald-900 arabic-font bg-emerald-50 px-12 py-6 rounded-[2.5rem] border border-emerald-100 shadow-inner">{certificate.topic}</h2>
                <div className="flex gap-4 mt-8 w-full no-print">
                  <button onClick={() => window.print()} className="flex-1 bg-[#2563eb] text-white py-5 rounded-2xl font-black text-xs flex items-center justify-center gap-3 shadow-lg active:scale-95"><Download size={22} /> {t.downloadPdf}</button>
                  <button onClick={() => { setMessages([]); setCertificate(null); setTopic(''); setQuizMode(false); }} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-xs flex items-center justify-center gap-3 active:scale-95 shadow-lg">{t.continueLearning} <ArrowRight size={22} className={lang === 'ar' ? 'rotate-180' : ''} /></button>
                </div>
            </div>
          )}
          
          <div ref={chatEndRef} className="h-16" />
        </div>

        {!quizMode && !certificate && (
          <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 shrink-0 shadow-sm relative z-50 no-print">
            <form onSubmit={startLesson} className="max-w-7xl mx-auto flex gap-4 w-full">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t.placeholder}
                  className={`w-full bg-[#f8fafc] border border-slate-200 rounded-2xl px-8 py-4 text-md font-black arabic-font outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563eb] transition-all shadow-inner ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                />
                <div className={`absolute ${lang === 'ar' ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 text-slate-300`}><MessageSquare size={20} /></div>
              </div>
              <button 
                disabled={loading || !topic.trim()} 
                type="submit" 
                className="w-16 h-16 bg-gradient-to-r from-[#2563eb] to-[#059669] text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center shrink-0"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} className={lang === 'ar' ? 'rotate-180' : ''} />}
              </button>
            </form>
          </div>
        )}
      </div>
      <IrabAssistant />
    </div>
  );
};
