import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, LogIn, Globe, Users, GraduationCap, 
  Gamepad2, Mic, BookOpen, PenTool, Brain, 
  ArrowRight, CheckCircle2, Trophy, Zap, 
  Search, Languages, FileText, LayoutDashboard,
  Play, Star, ShieldCheck, Clock, Award, Ear, Library
} from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { translateAndExpand } from '../services/gemini';

const ARABIC_CHARS = ['ق', 'ل', 'ع', 'ر', 'ب', 'ي', 'أ', 'ن', 'ا', 'ح', 'ب', 'س', 'د', 'و', 'ك'];

const FallingLetters = () => {
  const letters = "أب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي".split(" ");
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(80)].map((_, i) => (
        <div
          key={i}
          className="falling-char"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * -20}s`,
            animationDuration: `${10 + Math.random() * 15}s`,
            fontSize: `${12 + Math.random() * 24}px`,
          }}
        >
          {letters[Math.floor(Math.random() * letters.length)]}
        </div>
      ))}
    </div>
  );
};

const LogoArt = () => (
  <div className="relative w-16 h-16 md:w-20 md:h-20 group shrink-0">
    {/* Arcade Cabinet Frame */}
    <div className="absolute inset-0 bg-slate-900 rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden">
      {/* Screen Area */}
      <div className="absolute inset-1.5 bg-black rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
        {/* Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        
        {/* Neon Glows */}
        <div className="absolute -inset-4 bg-blue-500/20 blur-xl group-hover:bg-blue-400/30 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
        
        {/* Logo Text */}
        <div className="relative flex flex-col items-center justify-center leading-none">
          <span className="text-[12px] md:text-[16px] font-black text-blue-400 tracking-tighter drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">QUL</span>
          <span className="text-[14px] md:text-[18px] font-black text-emerald-400 arabic-font drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">قُل</span>
        </div>

        {/* Glass Reflection */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent skew-y-[-10deg] -translate-y-full group-hover:translate-y-full transition-transform duration-1000" />
      </div>
    </div>
    
    {/* Outer Glow */}
    <div className="absolute -inset-2 bg-blue-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  </div>
);

const SideRail = ({ side, text, subtext }: { side: 'left' | 'right', text: string, subtext: string }) => (
  <div className={`fixed top-0 bottom-0 ${side === 'left' ? 'left-0' : 'right-0'} w-12 md:w-16 hidden xl:flex flex-col items-center justify-center z-40 pointer-events-none`}>
    <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent absolute" />
    
    <div className={`flex flex-col items-center gap-8 ${side === 'left' ? 'rotate-180' : ''}`} style={{ writingMode: 'vertical-rl' }}>
      <span className="text-[10px] font-black uppercase text-white/20 whitespace-nowrap">
        {text}
      </span>
      <div className="w-1 h-1 rounded-full bg-blue-500/40" />
      <span className="text-[8px] font-bold uppercase text-blue-500/40 whitespace-nowrap">
        {subtext}
      </span>
    </div>

    {/* Decorative Dots */}
    <div className="absolute top-12 flex flex-col gap-1">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-1 h-1 rounded-full bg-white/10" />
      ))}
    </div>
    <div className="absolute bottom-12 flex flex-col gap-1">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-1 h-1 rounded-full bg-white/10" />
      ))}
    </div>
  </div>
);

const FloatingParticle = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 0.5, 0],
      scale: [0, 1, 0],
      y: [-20, -100],
      x: Math.random() * 40 - 20
    }}
    transition={{ 
      duration: 3 + Math.random() * 2,
      repeat: Infinity,
      delay: delay,
      ease: "easeOut"
    }}
    className="absolute w-1 h-1 bg-blue-400 rounded-full blur-[1px]"
  />
);

const CertificateMini = ({ topic, lang }: { topic: string, lang: string }) => (
  <motion.div 
    whileHover={{ y: -10, scale: 1.02 }}
    className="relative w-72 h-96 bg-white rounded-[2rem] border-4 border-slate-50 shadow-2xl flex flex-col items-center text-center p-8 space-y-4 overflow-hidden group"
  >
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-[#2563eb] rotate-12"><Award size={120} /></div>
    <Award size={40} className="text-amber-500 drop-shadow-md" />
    <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
      {lang === 'ar' ? 'شهادة إتقان' : 'Mastery Certificate'}
    </h1>
    <div className="w-12 h-0.5 bg-blue-500/20" />
    <p className="text-xs text-[#2563eb] font-bold underline underline-offset-4">Arabic Learner</p>
    <div className="flex-1 flex items-center justify-center w-full">
      <h2 className="text-xl font-black text-emerald-900 arabic-font bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 shadow-inner w-full">
        {topic}
      </h2>
    </div>
    <div className="flex justify-between w-full pt-4 border-t border-slate-50">
      <div className="text-[8px] font-black text-slate-300 uppercase">QUL ARCADE</div>
      <div className="text-[8px] font-black text-slate-300 uppercase">2024.04.15</div>
    </div>
    
    {/* Holographic Shine */}
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
  </motion.div>
);

const InstantDemo = ({ lang }: { lang: string }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleDemo = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const analysis = await translateAndExpand(input, false);
      setResult(analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-8 md:p-12 rounded-[3rem] bg-black/40 backdrop-blur-3xl border border-white/10 shadow-2xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-6 py-4 rounded-full bg-white/5 border border-white/10">
          <Search size={20} className="text-blue-400" />
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={lang === 'ar' ? 'اكتب كلمة بالإنجليزية لتجربة الذكاء الاصطناعي...' : 'Type an English word to test AI...'}
            className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-white/20"
            onKeyDown={(e) => e.key === 'Enter' && handleDemo()}
          />
          <button 
            onClick={handleDemo}
            disabled={loading}
            className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {loading ? (lang === 'ar' ? 'جاري التحليل...' : 'Analyzing...') : (lang === 'ar' ? 'حلل الآن' : 'Analyze')}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="text-right">
                  <h4 className="text-3xl md:text-4xl font-black text-emerald-400 arabic-font">{result.translation}</h4>
                  <p className="text-xs text-white/40 uppercase tracking-widest">{result.analysis?.type}</p>
                </div>
                <div className="text-left">
                  <h4 className="text-xl md:text-2xl font-bold text-white/80">{result.original_word}</h4>
                </div>
              </div>
              <div className="h-[1px] bg-white/10" />
              <p className="text-sm md:text-base text-slate-300 leading-relaxed italic">
                {lang === 'ar' ? result.arabic_definition : result.english_definition}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color, delay, image }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5 }}
    className="group relative p-6 rounded-[2rem] bg-slate-900 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all overflow-hidden h-64 flex flex-col justify-end"
  >
    {/* Cinematic Background Image */}
    <div className="absolute inset-0 z-0">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-opacity duration-500"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
    </div>

    <div className={`absolute -inset-4 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity z-0`} />
    
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="text-white/80" size={24} />
      </div>
      <h3 className="text-lg font-black mb-2 arabic-font text-white/90">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed font-bold opacity-80">{desc}</p>
    </div>
    
    {/* Arcade Corner Decoration */}
    <div className="absolute top-2 right-2 w-1 h-1 bg-white/20 rounded-full z-10" />
    <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/20 rounded-full z-10" />
  </motion.div>
);

const StatItem = ({ value, label, icon: Icon }: any) => (
  <div className="flex flex-col items-center gap-2">
    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
      <Icon size={18} />
    </div>
    <div className="text-2xl font-black text-white">{value}</div>
    <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">{label}</div>
  </div>
);

export const Landing = ({ onSignInStart }: { onSignInStart?: () => void }) => {
  const { signIn, signOut, user, profile } = useAuth();
  const [lang, setLang] = useState(localStorage.getItem('hub_lang') || 'ar');

  useEffect(() => {
    localStorage.setItem('hub_lang', lang);
    window.dispatchEvent(new Event('langChanged'));
  }, [lang]);

  useEffect(() => {
    const handleLangChange = () => {
      const currentLang = localStorage.getItem('hub_lang') || 'ar';
      if (currentLang !== lang) {
        setLang(currentLang);
      }
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, [lang]);

  const t = {
    ar: {
      tagline: 'بوابتك الذكية لإتقان اللغة العربية',
      sloganPrefix: 'Learn Arabic until you can say',
      sloganMain: 'أنا عربي',
      subTagline: 'منصة تفاعلية تجمع بين متعة الألعاب وقوة الذكاء الاصطناعي لتمكين الطلاب والمعلمين.',
      login: 'دخول المنصة',
      teacherTitle: 'للمعلمين',
      teacherDesc: 'أنشئ أوراق عمل تفاعلية وتحديات حية في ثوانٍ باستخدام الذكاء الاصطناعي.',
      studentTitle: 'للطلاب',
      studentDesc: 'تعلم من خلال ألعاب الأركيد، وتحدث مع رفيقك الذكي، وحطم الأرقام القياسية.',
      featuresTitle: 'مختبرات الإتقان الذكية',
      demoTitle: 'جرب ذكاء "قُل" الآن',
      statsTitle: 'نبض المنصة المباشر',
      hallOfFame: 'جدار الإنجازات',
      feature1: 'التحدث الذكي',
      feature1Desc: 'محادثات صوتية مباشرة مع رفيق ذكي يصحح نطقك ببراعة.',
      feature2: 'تحديات الأركيد',
      feature2Desc: 'حول دروسك إلى ألعاب تنافسية مع أصدقائك في صالة الألعاب.',
      feature3: 'المختبر اللغوي',
      feature3Desc: 'تحليل عميق للجذور والأوزان والمعاني بلمسة واحدة.',
      feature4: 'شهادات الإتقان',
      feature4Desc: 'وثق تقدمك بشهادات رقمية فاخرة تعكس مهاراتك الحقيقية.',
      teacherSectionTitle: 'مختبر المعلم الذكي',
      teacherSectionDesc: 'وداعاً لساعات التحضير الطويلة. "قُل" هو مساعدك الذي لا ينام.',
      wordsLearned: 'كلمة متعلمة',
      liveChallenges: 'تحدي مباشر',
      activeUsers: 'مستخدم نشط',
      aiResponse: 'استجابة ذكية',
      cta: 'ابدأ رحلتك الآن'
    },
    en: {
      tagline: 'Your smart gateway to mastering the Arabic',
      sloganPrefix: 'Learn Arabic until you can say',
      sloganMain: 'ANA ARABI',
      subTagline: 'An interactive platform combining game fun with AI power to empower students and teachers.',
      login: 'Enter Arcade',
      teacherTitle: 'For Teachers',
      teacherDesc: 'Create interactive worksheets and live challenges in seconds using AI.',
      studentTitle: 'For Students',
      studentDesc: 'Learn through arcade games, chat with your smart companion, and break records.',
      featuresTitle: 'Smart Mastery Labs',
      demoTitle: 'Test Qul AI Now',
      statsTitle: 'Live Platform Pulse',
      hallOfFame: 'Hall of Fame',
      feature1: 'Smart Speech',
      feature1Desc: 'Real-time voice chats with a smart companion who corrects your pronunciation.',
      feature2: 'Arcade Challenges',
      feature2Desc: 'Turn your lessons into competitive games with friends in the arcade.',
      feature3: 'Linguistic Lab',
      feature3Desc: 'Deep analysis of roots, weights, and meanings with one touch.',
      feature4: 'Mastery Certificates',
      feature4Desc: 'Document your progress with luxury digital certificates reflecting your skills.',
      teacherSectionTitle: "The Teacher's Smart Lab",
      teacherSectionDesc: 'Goodbye to long preparation hours. "Qul" is your assistant that never sleeps.',
      wordsLearned: 'Words Learned',
      liveChallenges: 'Live Challenges',
      activeUsers: 'Active Users',
      aiResponse: 'AI Responses',
      cta: 'Start Your Journey'
    }
  }[lang as 'ar' | 'en'];

  return (
    <div 
      className={`min-h-screen text-white overflow-x-hidden selection:bg-blue-500/30 relative ${lang === 'ar' ? 'arabic-font' : 'font-sans'}`} 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(to left, #0f172a 0%, #064e3b 100%)' }}
    >
      {/* Side Rails - Fills the empty side space */}
      <SideRail 
        side="left" 
        text={lang === 'ar' ? 'تعلم اللغة العربية' : 'LEARN ARABIC'} 
        subtext="POWERED BY GEMINI 3.1" 
      />
      <SideRail 
        side="right" 
        text={lang === 'ar' ? 'نظام قُل للأركيد' : 'QUL ARCADE SYSTEM'} 
        subtext="STATUS: ONLINE // AI ACTIVE" 
      />

      {/* Atmospheric Particles in the sides */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32">
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}>
              <FloatingParticle delay={i * 0.5} />
            </div>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-32">
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{ top: `${Math.random() * 100}%`, right: `${Math.random() * 100}%` }}>
              <FloatingParticle delay={i * 0.5 + 2} />
            </div>
          ))}
        </div>
      </div>

      {/* Background Decorative Glows - Cinematic Luxury */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-900/5 rounded-full blur-[150px]" />
      </div>
      
      <FallingLetters />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-16 md:py-8 w-full backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-6">
          <LogoArt />
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-black tracking-tighter text-white/90">قُل / Qul</span>
            <span className="text-[10px] md:text-[12px] font-black text-blue-400 uppercase tracking-[0.3em] opacity-60">Arcade Experience</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-widest text-white/70"
          >
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
          <button 
            onClick={() => {
              onSignInStart?.();
              signIn();
            }}
            className="flex items-center gap-3 bg-white text-black px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg"
          >
            <LogIn size={14} />
            {t.login}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-12 pb-20 px-6">
        <div className="w-full max-w-[1600px] mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-[10px] md:text-[14px] font-black uppercase tracking-wide">
              {t.tagline}
            </div>

            {/* Slogan Design - Luxury Cinematic Card flanked by Account & Language Cards */}
            <div className="flex items-center justify-center gap-4 py-4 w-full">
              {/* Account Holder Rectangle - Right in Arabic (RTL), Left in English (LTR) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => {
                  if (user) {
                    signOut();
                  } else {
                    onSignInStart?.();
                    signIn();
                  }
                }}
                className="hidden lg:flex flex-col items-center justify-center px-6 py-8 rounded-[2rem] bg-black/40 border border-white/10 hover:border-blue-500/50 backdrop-blur-3xl w-56 text-center gap-3 shrink-0 shadow-2xl cursor-pointer group transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <Users size={22} />
                  )}
                </div>
                <span className="text-xs font-black text-white/90 truncate max-w-[180px]">
                  {profile?.displayName || user?.displayName || (user ? user.email?.split('@')[0] : (lang === 'ar' ? 'صاحب الحساب' : 'Account Holder'))}
                </span>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  {user ? (lang === 'ar' ? 'مسجل الدخول' : 'Logged In') : (lang === 'ar' ? 'دخول المنصة' : 'Sign In')}
                </span>
              </motion.div>

              {/* Main "أنا عربي" Rectangle */}
              <motion.div 
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="relative group w-full max-w-3xl"
              >
                {/* Animated Glow Backing */}
                <div className="absolute -inset-8 bg-gradient-to-r from-blue-600/20 via-emerald-500/20 to-blue-600/20 rounded-[3rem] blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-1000 animate-pulse" />
                
                <div className="relative bg-black/40 backdrop-blur-3xl border border-white/10 px-8 md:px-16 py-8 md:py-12 rounded-[3rem] shadow-[0_30px_70px_rgba(0,0,0,0.6)] flex flex-col items-center gap-4 overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.05)_0%,_transparent_50%)] pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.05)_0%,_transparent_50%)] pointer-events-none" />
                  
                  <div className="flex items-center gap-6 w-full">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <p className="text-white font-black text-[10px] md:text-[16px] uppercase text-center whitespace-nowrap tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
                      {t.sloganPrefix}
                    </p>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>
                  
                  <h1 className="text-4xl md:text-7xl lg:text-8xl font-black font-aref relative whitespace-nowrap">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60 drop-shadow-[0_10px_30px_rgba(255,255,255,0.4)]">
                      {t.sloganMain}
                    </span>
                    {/* Subtle underline */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 1, duration: 1.5 }}
                      className="absolute -bottom-4 left-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
                    />
                  </h1>
                </div>
              </motion.div>

              {/* Language Switcher Rectangle - Left in Arabic (RTL), Right in English (LTR) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="hidden lg:flex flex-col items-center justify-center px-6 py-8 rounded-[2rem] bg-black/40 border border-white/10 hover:border-emerald-500/50 backdrop-blur-3xl w-56 text-center gap-3 shrink-0 shadow-2xl cursor-pointer group transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Globe size={22} />
                </div>
                <span className="text-xs font-black text-white/90">
                  {lang === 'ar' ? 'تغيير اللغة' : 'Change Language'}
                </span>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  {lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}
                </span>
              </motion.div>
            </div>

            <p className="text-[10px] md:text-[18px] text-slate-400 w-full mx-auto font-bold leading-relaxed opacity-70 lg:whitespace-nowrap overflow-hidden text-ellipsis">
              {t.subTagline}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-8"
          >
            <button 
              onClick={signIn}
              className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-blue-600 to-emerald-600 px-10 py-5 rounded-2xl font-black text-sm md:text-base uppercase tracking-widest shadow-2xl shadow-blue-900/40 hover:scale-105 transition-all"
            >
              {t.cta}
              <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-2 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
            </button>
          </motion.div>

          {/* Instant AI Demo Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pt-24 space-y-10"
          >
            <div className="flex flex-col items-center gap-3">
              <h2 className="text-2xl md:text-4xl font-black arabic-font text-white/90">{t.demoTitle}</h2>
              <div className="w-20 h-1.5 bg-blue-500 rounded-full" />
            </div>
            <div className="w-full max-w-[1600px] mx-auto">
              <InstantDemo lang={lang} />
            </div>
          </motion.div>

          {/* Smart Mastery Labs Section */}
          <div className="pt-24 space-y-10">
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-black arabic-font text-white/90">{t.featuresTitle}</h2>
              <div className="w-16 h-1 bg-blue-500 rounded-full" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={Search} 
                title={lang === 'ar' ? 'اختبار المستوى' : 'Placement Test'} 
                desc={lang === 'ar' ? 'تحديد مستوى ذكي وشامل' : 'Smart comprehensive assessment'} 
                color="from-slate-500 to-slate-800"
                image="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80"
                delay={0.1}
              />
              <FeatureCard 
                icon={GraduationCap} 
                title={lang === 'ar' ? 'الحروف الهجائية' : 'Alphabet'} 
                desc={lang === 'ar' ? 'تعلم النطق والكتابة' : 'Learn pronunciation & writing'} 
                color="from-blue-500 to-indigo-600"
                image="https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&w=800&q=80"
                delay={0.2}
              />
              <FeatureCard 
                icon={Ear} 
                title={lang === 'ar' ? 'الاستماع الذكي' : 'AI Listening'} 
                desc={lang === 'ar' ? 'تطوير مهارات الاستيعاب' : 'Boost comprehension skills'} 
                color="from-cyan-500 to-blue-600"
                image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                delay={0.3}
              />
              <FeatureCard 
                icon={Mic} 
                title={lang === 'ar' ? 'التحدث الصوتي' : 'AI Voice Chat'} 
                desc={lang === 'ar' ? 'محادثة مباشرة مع الذكاء الاصطناعي' : 'Real-time AI conversation'} 
                color="from-rose-500 to-red-600"
                image="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80"
                delay={0.4}
              />
              <FeatureCard 
                icon={BookOpen} 
                title={lang === 'ar' ? 'القراءة التفاعلية' : 'Interactive Reading'} 
                desc={lang === 'ar' ? 'قصص ونصوص ذكية' : 'Smart stories & texts'} 
                color="from-emerald-500 to-teal-600"
                image="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
                delay={0.5}
              />
              <FeatureCard 
                icon={PenTool} 
                title={lang === 'ar' ? 'الكتابة الإبداعية' : 'Smart Writing'} 
                desc={lang === 'ar' ? 'تصحيح ذكي وتعبير' : 'AI correction & composition'} 
                color="from-violet-500 to-purple-600"
                image="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80"
                delay={0.6}
              />
              <FeatureCard 
                icon={Languages} 
                title={lang === 'ar' ? 'المترجم الذكي' : 'Smart Translator'} 
                desc={lang === 'ar' ? 'تحليل لغوي عميق' : 'Deep linguistic analysis'} 
                color="from-amber-500 to-orange-600"
                image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                delay={0.7}
              />
              <FeatureCard 
                icon={Library} 
                title={lang === 'ar' ? 'محرر القواعد' : 'Grammar Hub'} 
                desc={lang === 'ar' ? 'معلم قواعد ذكي' : 'AI grammar tutor'} 
                color="from-indigo-500 to-blue-700"
                image="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
                delay={0.8}
              />
              <FeatureCard 
                icon={Gamepad2} 
                title={lang === 'ar' ? 'الألعاب التعليمية' : 'Educational Games'} 
                desc={lang === 'ar' ? 'تعلم بالمرح والتحدي' : 'Learn with fun & challenge'} 
                color="from-orange-500 to-red-600"
                image="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
                delay={0.9}
              />
              <FeatureCard 
                icon={Globe} 
                title={lang === 'ar' ? 'اللهجات العربية' : 'Arabic Dialects'} 
                desc={lang === 'ar' ? 'استكشف تنوع اللغة' : 'Explore language diversity'} 
                color="from-cyan-600 to-blue-800"
                image="https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=800&q=80"
                delay={1.0}
              />
              <FeatureCard 
                icon={FileText} 
                title={lang === 'ar' ? 'أوراق العمل' : 'Worksheets'} 
                desc={lang === 'ar' ? 'توليد تلقائي للتمارين' : 'Auto-generated exercises'} 
                color="from-slate-600 to-slate-900"
                image="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80"
                delay={1.1}
              />
              <FeatureCard 
                icon={Brain} 
                title={lang === 'ar' ? 'الذاكرة الذكية' : 'Smart Memory'} 
                desc={lang === 'ar' ? 'تتبع ومراجعة الأخطاء' : 'Track & review mistakes'} 
                color="from-pink-500 to-rose-600"
                image="https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&w=800&q=80"
                delay={1.2}
              />
            </div>
          </div>

          {/* Teacher's Lab Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="pt-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-right"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                <Users size={12} />
                {t.teacherTitle}
              </div>
              <h2 className="text-3xl md:text-4xl font-black arabic-font leading-tight">
                {t.teacherSectionTitle}
              </h2>
              <p className="text-sm text-slate-400 font-bold leading-relaxed">
                {t.teacherSectionDesc}
              </p>
              <ul className="space-y-3">
                {[
                  lang === 'ar' ? 'إنشاء أوراق عمل ذكية بضغطة زر' : 'Create smart worksheets with one click',
                  lang === 'ar' ? 'تتبع تقدم الطلاب بلوحة تحكم سينمائية' : 'Track student progress with cinematic dashboard',
                  lang === 'ar' ? 'إدارة التحديات المباشرة في الفصل' : 'Manage live challenges in the classroom'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80 text-xs font-bold">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group overflow-hidden rounded-3xl">
              <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative aspect-video rounded-3xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                >
                  <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-futuristic-interface-31831-large.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-emerald-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform cursor-pointer shadow-2xl">
                    <Play size={24} fill="currentColor" />
                  </div>
                </div>
                {/* Mock UI Elements Overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <div className="h-2 w-24 bg-white/20 rounded-full animate-pulse" />
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 bg-red-500/50 rounded-full" />
                    <div className="h-1.5 w-1.5 bg-amber-500/50 rounded-full" />
                    <div className="h-1.5 w-1.5 bg-emerald-500/50 rounded-full" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="h-1.5 w-32 bg-white/10 rounded-full" />
                    <div className="h-1.5 w-20 bg-white/10 rounded-full" />
                  </div>
                  <div className="h-8 w-8 bg-blue-500/20 rounded-lg border border-blue-500/30 flex items-center justify-center">
                    <Sparkles size={14} className="text-blue-400 animate-spin-slow" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Live Pulse Section */}
          <div className="pt-32 pb-12">
            <div className="p-8 md:p-12 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.05)_0%,_transparent_70%)]" />
              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
                <StatItem icon={Languages} value="10K+" label={t.wordsLearned} />
                <StatItem icon={Zap} value="500+" label={t.liveChallenges} />
                <StatItem icon={Users} value="2K+" label={t.activeUsers} />
                <StatItem icon={Sparkles} value="50K+" label={t.aiResponse} />
              </div>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="pt-24 pb-20 text-center space-y-10">
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-black arabic-font">{t.hallOfFame}</h2>
              <div className="w-16 h-1 bg-amber-500 rounded-full" />
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 px-4">
              <CertificateMini 
                topic={lang === 'ar' ? 'الجملة الاسمية' : 'Nominal Sentence'} 
                lang={lang} 
              />
              <CertificateMini 
                topic={lang === 'ar' ? 'كان وأخواتها' : 'Kana & Sisters'} 
                lang={lang} 
              />
              <CertificateMini 
                topic={lang === 'ar' ? 'الفعل المضارع' : 'Present Tense'} 
                lang={lang} 
              />
            </div>

            <div className="pt-8">
              <button 
                onClick={signIn}
                className="group relative px-10 py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t.login}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 py-8 border-t border-white/5 text-center">
        <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em]">
          &copy; {new Date().getFullYear()} QUL ARCADE EXPERIENCE • ALL RIGHTS RESERVED
        </p>
      </footer>
    </div>
  );
};

export default Landing;
