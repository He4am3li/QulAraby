import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageToggle } from '../components/LanguageToggle';
import { FallingLetters } from '../components/Layout';
import { 
  Trophy, CheckCircle2, Award, Star, X, Download, 
  BookOpen, Languages, Library, BookText, ArrowUpRight, 
  Zap, LayoutDashboard, Sparkles, Globe, ChevronRight, ChevronLeft, Type, Mic, Ear, PenTool, Rocket, Gamepad2, HelpCircle,
  LogOut, LogIn, User as UserIcon, Brain, FileText, ClipboardList, ClipboardCheck, GraduationCap, TrendingUp
} from 'lucide-react';
import { Vocabulary, CertificateData } from '../types';
import { useAuth } from '../components/AuthProvider';
import { RoleSwitcher } from '../components/RoleSwitcher';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

const HOME_STRINGS = {
  ar: {
    statsWords: 'كلمات',
    statsSkills: 'مهارات',
    testTitle: 'اختبر نفسك',
    testDesc: 'تحديد مستوى شامل وممتع',
    lettersTitle: 'الحروف الهجائية',
    lettersDesc: 'تعلم الحروف ونطقها الصحيح',
    listeningTitle: 'الاستماع الذكي',
    listeningDesc: 'طور مهارات الفهم والاستيعاب',
    speakTitle: 'التحدث بالعربية',
    speakDesc: 'محادثة صوتية ذكية مباشرة',
    readingTitle: 'القراءة التفاعلية',
    readingDesc: 'قصص ونصوص تفاعلية ذكية',
    writingTitle: 'الكتابة الإبداعية',
    writingDesc: 'تصحيح ذكي وتعبير إنشائي',
    transTitle: 'المترجم الذكي',
    transDesc: 'تحليل كلمات ثنائي اللغة',
    gamesTitle: 'الألعاب التعليمية',
    gamesDesc: 'تعلم العربية بالمرح والتحدي',
    grammarTitle: 'دروس النحو',
    grammarDesc: 'معلم قواعد بالذكاء الاصطناعي',
    memoryTitle: 'ذاكرتي الذكية',
    memoryDesc: 'تتبع أخطاءك وراجعها بذكاء',
    vocabTitle: 'كلماتي',
    vocabDesc: 'مجموعة كلماتك الخاصة',
    masteredTitle: 'قواعد مُتقنة',
    masteredLettersTitle: 'حروف متقنة',
    masteredBadge: 'الإنجازات',
    noSkills: 'أكمل الدروس للحصول على الشهادات!',
    pathTitle: 'مسار التعلّم',
    goalVocab: 'هدف المفردات',
    goalGrammar: 'هدف القواعد',
    goalVocabDesc: 'ابنِ بنك كلماتك العربية',
    goalGrammarDesc: 'أكمل درساً واحداً اليوم',
    knowledgeTitle: 'قطوف المعرفة',
    knowledgeFact: '"اللغة العربية جسر بين الحضارات، يتحدث بها أكثر من 400 مليون شخص."',
    certTitle: 'شهادة إتقان',
    certCertify: 'نشهد بأن',
    certMastered: 'قد أتقن بنجاح قواعد اللغة العربية في موضوع:',
    certScore: 'الدرجة النهائية',
    certDate: 'تاريخ الإصدار',
    enter: 'دخول',
    achievementsTitle: 'إنجازاتي',
    achievementsDesc: 'تتبع تقدمك وأوسمتك',
    prepTitle: 'التحضير الذكي',
    prepDesc: 'تحضير الدروس والخطط التعليمية',
    quizzesTitle: 'الاختبارات'
  },
  en: {
    statsWords: 'Words',
    statsSkills: 'Skills',
    testTitle: 'Test Yourself',
    testDesc: 'Fun level assessment',
    lettersTitle: 'Arabic Alphabet',
    lettersDesc: 'Learn letters and pronunciation',
    listeningTitle: 'AI Listening',
    listeningDesc: 'Boost your comprehension skills',
    speakTitle: 'AI Voice Chat',
    speakDesc: 'Real-time Arabic conversation',
    readingTitle: 'Interactive Reading',
    readingDesc: 'Interactive stories & texts',
    writingTitle: 'Smart Writing',
    writingDesc: 'AI Correction & Composition',
    transTitle: 'Smart Translator',
    transDesc: 'Bilingual word analysis',
    gamesTitle: 'Educational Games',
    gamesDesc: 'Learn Arabic with fun',
    grammarTitle: 'Grammar Hub',
    grammarDesc: 'AI-powered grammar tutor',
    memoryTitle: 'Smart Memory',
    memoryDesc: 'Track and review your mistakes',
    vocabTitle: 'My Words',
    vocabDesc: 'Your collection of words',
    masteredTitle: 'Mastered Grammar',
    masteredLettersTitle: 'Mastered Letters',
    masteredBadge: 'Achievements',
    noSkills: 'Complete lessons to earn certificates!',
    pathTitle: 'Learning Path',
    goalVocab: 'Vocabulary Goal',
    goalGrammar: 'Grammar Goal',
    goalVocabDesc: 'Build your AR word bank',
    goalGrammarDesc: 'Complete a lesson today',
    knowledgeTitle: 'Knowledge Bite',
    knowledgeFact: '"Arabic is a bridge between civilizations, connecting over 400 million speakers."',
    certTitle: 'Mastery Certificate',
    certCertify: 'This certifies that',
    certMastered: 'has successfully mastered the rules of Arabic Grammar for the topic:',
    certScore: 'Final Score',
    certDate: 'Issue Date',
    enter: 'ENTER',
    achievementsTitle: 'My Achievements',
    achievementsDesc: 'Track your progress and badges',
    prepTitle: 'Smart Preparation',
    prepDesc: 'Lesson planning and teaching plans',
    quizzesTitle: 'Quizzes'
  }
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signIn, signOut, isAuthReady } = useAuth();
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );
  const [vocab, setVocab] = React.useState<Vocabulary[]>([]);
  const [skills, setSkills] = React.useState<string[]>([]);
  const [mistakesCount, setMistakesCount] = React.useState(0);
  const [interestsCount, setInterestsCount] = React.useState(0);
  const [recentMistake, setRecentMistake] = React.useState<any>(null);
  const [recentInterest, setRecentInterest] = React.useState<any>(null);
  const [mistakeStats, setMistakeStats] = React.useState({ writing: 0, speaking: 0, grammar: 0 });
  const [masteredLetters, setMasteredLetters] = React.useState<string[]>([]);
  const [certificates, setCertificates] = React.useState<CertificateData[]>([]);
  const [activeTab, setActiveTab] = React.useState<'grammar' | 'letters'>('grammar');
  const [showAchievements, setShowAchievements] = React.useState(false);

  React.useEffect(() => {
    if (location.pathname === '/achievements') {
      setShowAchievements(true);
    } else {
      setShowAchievements(false);
    }
  }, [location.pathname]);

  const handleShowAchievements = () => {
    navigate('/achievements');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const t = HOME_STRINGS[lang];

  // Load stats from Firestore if logged in
  React.useEffect(() => {
    if (!user || !isAuthReady) {
      // Fallback to local storage for guests or initial load
      const savedVocab = localStorage.getItem('hub_vocab');
      if (savedVocab) setVocab(JSON.parse(savedVocab));
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'vocabulary'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const words = snapshot.docs.map(doc => doc.data()) as Vocabulary[];
      setVocab(words);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/vocabulary`);
    });

    const memoryRef = collection(db, 'users', user.uid, 'memory');
    const unsubscribeMemory = onSnapshot(memoryRef, (snapshot) => {
      setMistakesCount(snapshot.size);
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data());
        // Get the most recent one
        const sorted = [...docs].sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        setRecentMistake(sorted[0]);

        // Stats
        const stats = {
          writing: docs.filter((d: any) => d.type === 'writing').length,
          speaking: docs.filter((d: any) => d.type === 'speaking').length,
          grammar: docs.filter((d: any) => d.type === 'grammar' || d.type === 'writing').length, // Writing often includes grammar
        };
        setMistakeStats(stats);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/memory`);
    });

    const interestsRef = collection(db, 'users', user.uid, 'interests');
    const unsubscribeInterests = onSnapshot(interestsRef, (snapshot) => {
      setInterestsCount(snapshot.size);
      if (!snapshot.empty) {
        const sorted = snapshot.docs.map(d => d.data()).sort((a: any, b: any) => b.lastSeen?.seconds - a.lastSeen?.seconds);
        setRecentInterest(sorted[0]);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/interests`);
    });

    return () => {
      unsubscribe();
      unsubscribeMemory();
      unsubscribeInterests();
    };
  }, [user, isAuthReady]);

  React.useEffect(() => {
    const savedSkills = localStorage.getItem('hub_skills');
    if (savedSkills) setSkills(JSON.parse(savedSkills));
    const savedLetters = localStorage.getItem('hub_mastered_letters');
    if (savedLetters) setMasteredLetters(JSON.parse(savedLetters));
    const savedCerts = localStorage.getItem('hub_certificates');
    if (savedCerts) setCertificates(JSON.parse(savedCerts));

    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLang(newLang);
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  const getDailyMission = () => {
    if (recentMistake) {
      return {
        titleAr: 'مهمة التصحيح الذكي',
        titleEn: 'Smart Correction Mission',
        descAr: `لقد لاحظنا خطأً في "${recentMistake.content}". لنقم بمراجعته الآن في معلم القواعد.`,
        descEn: `We noticed a mistake in "${recentMistake.content}". Let's review it now in the Grammar Hub.`,
        action: () => navigate('/assistant', { state: { autoTopic: recentMistake.explanation || recentMistake.content } }),
        icon: <Brain className="text-amber-500" />,
        color: 'bg-amber-50 border-amber-100'
      };
    }
    if (recentInterest) {
      return {
        titleAr: 'مهمة الاستكشاف',
        titleEn: 'Exploration Mission',
        descAr: `بما أنك مهتم بـ "${recentInterest.topic}"، ما رأيك في قراءة نص جديد عنه؟`,
        descEn: `Since you're interested in "${recentInterest.topic}", how about reading a new text about it?`,
        action: () => navigate('/reading'),
        icon: <BookOpen className="text-blue-500" />,
        color: 'bg-blue-50 border-blue-100'
      };
    }
    if (vocab.length < 5) {
      return {
        titleAr: 'مهمة بناء المفردات',
        titleEn: 'Vocabulary Builder',
        descAr: 'ابدأ رحلتك بترجمة أول 5 كلمات تهمك اليوم.',
        descEn: 'Start your journey by translating your first 5 interesting words today.',
        action: () => navigate('/translator'),
        icon: <BookText className="text-emerald-500" />,
        color: 'bg-emerald-50 border-emerald-100'
      };
    }
    return {
      titleAr: 'تحدي اليوم',
      titleEn: 'Daily Challenge',
      descAr: 'اختبر مهاراتك اليوم في لعبة السلم والثعبان بكلماتك الخاصة.',
      descEn: 'Test your skills today in Snakes & Ladders using your own words.',
      action: () => navigate('/games'),
      icon: <Gamepad2 className="text-purple-500" />,
      color: 'bg-purple-50 border-purple-100'
    };
  };

  const mission = getDailyMission();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full h-screen bg-white ${lang === 'ar' ? 'text-right' : 'text-left'} overflow-hidden relative flex flex-col`} 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      
      {!showAchievements && (
        <AnimatePresence>
          <motion.header 
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-l from-[#0f172a]/95 to-[#064e3b]/95 backdrop-blur-lg px-8 py-6 shrink-0 relative shadow-lg border-b border-white/20"
          >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <FallingLetters mode="compact" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 relative z-10">
            {/* START SIDE: System Tools */}
            <div className={`flex items-center ${lang === 'ar' ? 'justify-start' : 'justify-start'}`}>
              <motion.div 
                initial={{ opacity: 0, x: lang === 'ar' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-1.5 md:p-2 rounded-2xl flex items-center gap-3 shadow-xl border-b-2 border-b-white/5"
              >
                <LanguageToggle lang={lang} onToggle={toggleLang} />
                <div className="w-px h-4 bg-white/10" />
                <button 
                  onClick={() => {
                    localStorage.removeItem('hub_onboarding_seen');
                    window.location.reload();
                  }} 
                  className="bg-white/5 hover:bg-white/20 text-white p-2 rounded-xl transition-all active:scale-90 group relative"
                  title={lang === 'ar' ? 'جولة تعليمية' : 'Onboarding Tour'}
                >
                  <HelpCircle size={18} className="text-white/70 group-hover:text-white" />
                </button>
              </motion.div>
            </div>

            {/* DEAD CENTER: Luxury Banner */}
            <div className="flex flex-col items-center justify-center text-center group">
              <div className="relative">
                {/* Cinematic Pulse Glow */}
                <motion.div 
                  className="absolute -inset-8 bg-gradient-to-r from-blue-400/25 to-emerald-400/25 blur-[40px] rounded-full"
                  animate={{ 
                    opacity: [0.3, 0.5, 0.3],
                    scale: [0.85, 1.1, 0.85]
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group cursor-default"
                >
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.015, 1],
                      boxShadow: [
                        "0 15px 45px -12px rgba(0,0,0,0.35)",
                        "0 25px 70px -18px rgba(0,0,0,0.45)",
                        "0 15px 45px -12px rgba(0,0,0,0.35)"
                      ]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="relative bg-white/10 backdrop-blur-3xl border border-white/20 px-6 py-2 md:px-10 md:py-3.5 rounded-[1.8rem] shadow-2xl transition-all border-b-2 border-b-white/5 overflow-hidden flex flex-col items-center gap-1 md:gap-1.5"
                  >
                    {/* Interior Luxury Gloss Shadow */}
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                    {/* Interior Light Sweep */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full"
                      animate={{ translateX: ["200%", "-200%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                    />

                    <span className="relative z-10 text-white/80 text-[8px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.4em] uppercase drop-shadow-md select-none opacity-80 whitespace-nowrap">
                      Learn Arabic until you can say
                    </span>
                    <div className="relative z-10 leading-none">
                      <span className="text-2xl md:text-3xl font-bold text-white handwritten-font drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] select-none">
                        أنا عربي
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* END SIDE: User Identity */}
            <div className={`flex items-center ${lang === 'ar' ? 'justify-end' : 'justify-end'}`}>
              <motion.div
                initial={{ opacity: 0, x: lang === 'ar' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl flex items-center gap-3 shadow-xl border-b-2 border-b-white/5"
              >
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5">
                        <RoleSwitcher />
                      </div>
                      <p className="text-xs font-bold text-white leading-none mt-1">
                        {user.displayName?.split(' ').slice(0, 2).join(' ') || user.email?.split('@')[0]}
                      </p>
                    </div>
                    
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-20" />
                      <div className="relative w-full h-full bg-white/10 rounded-xl border border-white/20 flex items-center justify-center overflow-hidden">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <UserIcon size={18} className="text-white/60" />
                        )}
                      </div>
                    </div>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <button 
                      onClick={() => signOut()}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all active:scale-90"
                      title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => signIn()}
                    className="bg-white text-blue-600 px-5 py-2 rounded-xl font-black text-xs shadow-lg hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-3"
                  >
                    <LogIn size={14} />
                    {lang === 'ar' ? 'تسجيل الدخول' : 'SIGN IN'}
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.header>
      </AnimatePresence>
    )}

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/20 custom-scroll">
        {!showAchievements ? (
          <>
            {/* Trophy Button in Center */}
            <div className="flex justify-center mb-8">
              <button 
                onClick={handleShowAchievements}
                className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all group relative border-4 border-white"
                title={t.achievementsTitle}
              >
                <Trophy size={32} />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-black z-20">
                  {t.achievementsTitle}
                </div>
              </button>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8 animate-in fade-in duration-500">
              {/* 1. TEST YOURSELF */}
              <ModuleCard 
                icon={<TrendingUp size={24}/>} arTitle={t.testTitle} title="Assessment" 
                description={t.testDesc} color="from-slate-900 to-black" 
                onClick={() => navigate('/test')} enterLabel={t.enter} lang={lang} 
              />

              {[
                { id: '/letters', icon: <Type size={24}/>, ar: t.lettersTitle, en: "Alphabet", color: "from-blue-600 to-indigo-700" },
                { id: '/vocabulary', icon: <BookText size={24}/>, ar: t.vocabTitle, en: "Vocab", color: "from-amber-500 to-amber-700" },
                { id: '/translator', icon: <Languages size={24}/>, ar: t.transTitle, en: "Translator", color: "from-emerald-600 to-emerald-800" },
                { id: '/listening', icon: <Ear size={24}/>, ar: t.listeningTitle, en: "Listening", color: "from-blue-500 to-blue-700" },
                { id: '/speak', icon: <Mic size={24}/>, ar: t.speakTitle, en: "Speaking", color: "from-rose-500 to-rose-700" },
                { id: '/reading', icon: <BookOpen size={24}/>, ar: t.readingTitle, en: "Reading", color: "from-blue-600 to-emerald-700" },
                { id: '/writing', icon: <PenTool size={24}/>, ar: t.writingTitle, en: "Writing", color: "from-indigo-600 to-violet-700" },
                { id: '/assistant', icon: <Library size={24}/>, ar: t.grammarTitle, en: "Grammar", color: "from-purple-600 to-purple-800" },
                { id: '/games', icon: <Gamepad2 size={24}/>, ar: t.gamesTitle, en: "Games", color: "from-orange-500 to-red-600" },
                { id: '/quizzes', icon: <GraduationCap size={24}/>, ar: t.quizzesTitle, en: "Quizzes", color: "from-slate-700 to-slate-900" },
                { id: '/dialects', icon: <Globe size={24}/>, ar: lang === 'ar' ? 'اللهجات' : 'Dialects', en: "Dialects", color: "from-cyan-600 to-blue-700" },
                { id: '/worksheets', icon: <FileText size={24} />, ar: lang === 'ar' ? 'أوراق العمل' : 'Worksheets', en: "Worksheets", color: "from-slate-600 to-slate-800" },
                ...(profile?.role === 'teacher' ? [
                  { id: '/preparation', icon: <ClipboardList size={24} />, ar: t.prepTitle, en: "Preparation", color: "from-emerald-500 to-teal-700" }
                ] : []),
              ].map((m) => (
                <ModuleCard key={m.id} icon={m.icon} title={m.en} arTitle={m.ar} description="" color={m.color} onClick={() => navigate(m.id)} enterLabel={t.enter} lang={lang} />
              ))}
            </section>
          </>
        ) : (
          <div className="animate-in slide-in-from-bottom-10 duration-500 mb-10">
            {/* PROFILE HEADER FOR ACHIEVEMENTS - NOW AT THE VERY TOP */}
            <div className="bg-gradient-to-l from-[#0f172a]/95 to-[#064e3b]/95 backdrop-blur-lg -mt-6 -mx-6 px-8 py-6 border-b border-white/20 shadow-lg mb-8 relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <FallingLetters mode="compact" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                {/* Level Badge on the Left */}
                <div className="order-3 md:order-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg">
                    <Star size={16} className="text-amber-300 fill-amber-300 animate-pulse" />
                    <span className="text-xs font-black text-white">{lang === 'ar' ? 'المستوى الأول' : 'Level 1'}</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-5 order-1 md:order-2 flex-1 justify-center">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 shadow-2xl transition-transform group-hover:scale-105 duration-500">
                      <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border-4 border-slate-900">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <UserIcon size={32} className="text-slate-600" />
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-slate-900">
                      <Award size={12} />
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-right">
                  <h2 className="text-2xl font-black text-white arabic-font drop-shadow-lg mb-1">
                    {user?.displayName?.split(' ').slice(0, 2).join(' ') || (lang === 'ar' ? 'متعلم طموح' : 'Ambitious Learner')}
                  </h2>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="flex flex-col items-center md:items-start">
                      <span className="text-[8px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">{t.statsWords}</span>
                      <div className="flex items-center gap-1">
                        <Zap size={12} className="text-blue-300" />
                        <span className="text-base font-black text-white leading-none">{vocab.length}</span>
                      </div>
                    </div>
                    <div className="w-px h-5 bg-white/10 hidden md:block" />
                    <div className="flex flex-col items-center md:items-start">
                      <span className="text-[8px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">{t.statsSkills}</span>
                      <div className="flex items-center gap-1">
                        <Trophy size={12} className="text-orange-300" />
                        <span className="text-base font-black text-white leading-none">{skills.length + masteredLetters.length}</span>
                      </div>
                    </div>
                    <div className="w-px h-5 bg-white/10 hidden md:block" />
                    <div className="flex flex-col items-center md:items-start">
                      <span className="text-[8px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">{lang === 'ar' ? 'أخطاء' : 'Mistakes'}</span>
                      <div className="flex items-center gap-1">
                        <Brain size={12} className="text-rose-300" />
                        <span className="text-base font-black text-white leading-none">{mistakesCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-2 md:order-3">
                  <LanguageToggle lang={lang} onToggle={toggleLang} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Progress Grid */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black text-slate-800 arabic-font mb-6 flex items-center gap-2">
                    <LayoutDashboard size={20} className="text-blue-500" />
                    {lang === 'ar' ? 'مؤشرات الإنجاز لكل قسم' : 'Progress Indicators per Section'}
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { icon: <TrendingUp size={16}/>, label: t.testTitle, progress: 0, color: "bg-slate-900" },
                      { icon: <GraduationCap size={16}/>, label: t.quizzesTitle, progress: 0, color: "bg-slate-700" },
                      { icon: <Type size={16}/>, label: t.lettersTitle, progress: (masteredLetters.length / 28) * 100, color: "bg-blue-600" },
                      { icon: <BookText size={16}/>, label: t.vocabTitle, progress: (vocab.length / 100) * 100, color: "bg-amber-500" },
                      { icon: <Languages size={16}/>, label: t.transTitle, progress: 0, color: "bg-emerald-600" },
                      { icon: <Ear size={16}/>, label: t.listeningTitle, progress: 0, color: "bg-blue-500" },
                      { icon: <Mic size={16}/>, label: t.speakTitle, progress: 0, color: "bg-rose-500" },
                      { icon: <BookOpen size={16}/>, label: t.readingTitle, progress: 0, color: "bg-blue-600" },
                      { icon: <PenTool size={16}/>, label: t.writingTitle, progress: 0, color: "bg-indigo-600" },
                      { icon: <Library size={16}/>, label: t.grammarTitle, progress: (skills.length / 20) * 100, color: "bg-purple-600" },
                      { icon: <Gamepad2 size={16}/>, label: t.gamesTitle, progress: 0, color: "bg-orange-500" },
                      { icon: <Globe size={16}/>, label: lang === 'ar' ? 'اللهجات' : 'Dialects', progress: 0, color: "bg-cyan-600" },
                      { icon: <FileText size={16}/>, label: lang === 'ar' ? 'أوراق العمل' : 'Worksheets', progress: 0, color: "bg-slate-600" },
                      ...(profile?.role === 'teacher' ? [
                        { icon: <ClipboardList size={16}/>, label: t.prepTitle, progress: 0, color: "bg-emerald-500" }
                      ] : []),
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-200 transition-all">
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-6 h-6 ${item.color} text-white rounded-lg flex items-center justify-center shadow-sm`}>
                              {item.icon}
                            </div>
                            <span className="text-[10px] font-black text-slate-700 arabic-font truncate">{item.label}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} transition-all duration-1000`} style={{ width: `${Math.min(100, item.progress)}%` }} />
                          </div>
                          <div className="mt-1 text-right">
                            <span className="text-[8px] font-black text-slate-400">{Math.round(item.progress)}%</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Analysis & Mission */}
              <div className="space-y-4">
                {/* Bento Item 2: Knowledge Analysis */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-blue-100 transition-colors" />
                  <h3 className="text-[9px] font-black mb-3 flex items-center gap-2 uppercase tracking-widest text-slate-400">
                    <Brain size={12} className="text-blue-500" /> {lang === 'ar' ? 'تحليل الذاكرة' : 'Knowledge Analysis'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'أخطاء الكتابة' : 'Writing Mistakes'}</span>
                        <span className="text-[10px] font-black text-slate-800">{mistakeStats.writing}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${Math.min(100, (mistakeStats.writing / (mistakesCount || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'أخطاء التحدث' : 'Speaking Mistakes'}</span>
                        <span className="text-[10px] font-black text-slate-800">{mistakeStats.speaking}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${Math.min(100, (mistakeStats.speaking / (mistakesCount || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bento Item 1: Daily Smart Mission */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-blue-100 transition-colors" />
                  <h3 className="text-[9px] font-black mb-3 flex items-center gap-2 uppercase tracking-widest text-slate-400">
                    {React.cloneElement(mission.icon as React.ReactElement<any>, { size: 12, className: "text-blue-500" })}
                    {lang === 'ar' ? mission.titleAr : mission.titleEn}
                  </h3>
                  
                  <div className="space-y-4">
                    <p className="text-slate-500 text-[10px] font-bold arabic-font leading-relaxed">
                      {lang === 'ar' ? mission.descAr : mission.descEn}
                    </p>
                    <button 
                      onClick={mission.action}
                      className="w-full py-2.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg font-black text-[9px] arabic-font transition-all border border-blue-100 flex items-center justify-center gap-2 group/btn"
                    >
                      {lang === 'ar' ? 'ابدأ المهمة' : 'START MISSION'}
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Bento Item 4: Achievements (Tabs) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-blue-100 transition-colors" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setActiveTab('grammar')}
                          className={`text-[9px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'grammar' ? 'border-blue-500 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                          {t.masteredTitle}
                        </button>
                        <button 
                          onClick={() => setActiveTab('letters')}
                          className={`text-[9px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'letters' ? 'border-blue-500 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                          {t.masteredLettersTitle}
                        </button>
                    </div>
                    <Trophy className="text-amber-500 opacity-20" size={16} />
                  </div>

                  <div className="animate-in fade-in duration-300 overflow-y-auto custom-scroll max-h-[200px]">
                    {activeTab === 'grammar' ? (
                      <div className="grid grid-cols-1 gap-2">
                        {skills.length > 0 ? skills.map(skill => (
                          <div key={skill} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-xl group hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Award size={14} /></div>
                              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                                <p className="text-[7px] font-black text-slate-400 uppercase">Grammar Rule</p>
                                <h4 className="text-[10px] font-bold text-slate-800 arabic-font">{skill}</h4>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-[9px] font-bold">
                            {lang === 'ar' ? 'أكمل دروس النحو للحصول على الأوسمة!' : 'Complete grammar lessons to earn badges!'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {masteredLetters.length > 0 ? masteredLetters.map(char => (
                          <div key={char} className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-lg font-black arabic-font shadow-md hover:scale-110 transition-transform cursor-default border border-white">
                              {char}
                          </div>
                        )) : (
                          <div className="w-full text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-[9px] font-bold">
                              {lang === 'ar' ? 'أكمل تدريبات الكتابة للحصول على أوسمة الحروف!' : 'Complete writing exercises to earn letter badges!'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface HeaderStatProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

const HeaderStat: React.FC<HeaderStatProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm transition-all hover:bg-white/20 min-w-[100px]">
    <div className="text-white/80">{icon}</div>
    <div className="text-left">
      <p className="text-[7px] font-black text-white/50 uppercase leading-none mb-0.5">{label}</p>
      <p className="text-lg font-black text-white leading-none">{value}</p>
    </div>
  </div>
);

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  arTitle: string;
  description: string;
  color: string;
  onClick: () => void;
  enterLabel: string;
  lang: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ icon, title, arTitle, description, color, onClick, enterLabel, lang }) => (
  <motion.button 
    whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
    whileTap={{ scale: 0.98 }}
    layout
    onClick={onClick} 
    className="relative group p-3 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:border-blue-200 transition-colors"
  >
    <div className={`w-8 h-8 bg-gradient-to-br ${color} rounded-full flex items-center justify-center text-white mb-2 shadow-md ${lang === 'ar' ? 'mr-0 ml-auto' : ''}`}>
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 18 }) : icon}
    </div>
    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
      <h4 className="text-[8px] font-black text-slate-400 uppercase mb-0.5">{title}</h4>
      <h3 className="text-base font-black text-slate-800 mb-0.5 arabic-font leading-normal pb-1">{arTitle}</h3>
    </div>
    <div className={`mt-2 flex items-center gap-1 text-[8px] font-black text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
      {enterLabel} {lang === 'ar' ? <ChevronLeft size={8} /> : <ChevronRight size={8} />}
    </div>
  </motion.button>
);

interface ProgressItemProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  progress: number;
  lang: string;
}

const ProgressItem: React.FC<ProgressItemProps> = ({ icon, label, desc, progress, lang }) => (
  <div className="space-y-2">
    <div className="flex items-start gap-3">
      <div className="mt-1">{icon}</div>
      <div className="flex-1">
        <div className="flex justify-between items-end mb-1">
          <p className="text-sm font-black text-slate-800 leading-none">{label}</p>
          <span className="text-[10px] font-black text-slate-400">{Math.round(progress)}%</span>
        </div>
        <p className={`text-[10px] text-slate-400 font-medium mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{desc}</p>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  </div>
);
