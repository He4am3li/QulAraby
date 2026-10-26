import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, LogIn, Globe, Users, GraduationCap, 
  Gamepad2, Mic, BookOpen, PenTool, Brain, 
  ArrowRight, CheckCircle2, Trophy, Zap, 
  Search, Languages, FileText, LayoutDashboard,
  Play, Star, ShieldCheck, Clock, Award, Ear, Library,
  AlertCircle, Loader2, X
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
  <div className="relative w-14 h-14 md:w-16 md:h-16 group shrink-0 flex items-center justify-center">
    {/* Outer Glow */}
    <div className="absolute -inset-3 bg-gradient-to-tr from-blue-500/25 via-emerald-500/25 to-amber-500/25 blur-xl rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
    
    {/* Container Frame */}
    <div className="relative w-full h-full rounded-2xl md:rounded-3xl border border-slate-700/60 flex items-center justify-center shadow-2xl overflow-hidden group-hover:border-blue-500/60 transition-colors">
      <img 
        src="/Logo.png" 
        alt="شعار منصة قُل" 
        className="w-full h-full object-cover scale-125 group-hover:scale-130 transition-transform duration-300"
      />
    </div>
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

export const Landing = () => {
  const { signIn, signOut, user, profile, isSigningIn, authError, clearAuthError } = useAuth();
  const [lang, setLang] = useState(localStorage.getItem('hub_lang') || 'ar');
  const [loginOpen, setLoginOpen] = useState(new URLSearchParams(window.location.search).get('login') === '1');

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
      statsTitle: 'إمكانات منصة قُل',
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
      vocabularyTools: 'ترجمة وتحليل المفردات',
      learningActivities: 'ألعاب وأنشطة تعليمية',
      learnerTools: 'أدوات للطلاب والمعلمين',
      aiTools: 'مساعدات لغوية بالذكاء الاصطناعي',
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
      statsTitle: 'What QUL Offers',
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
      vocabularyTools: 'Vocabulary translation and analysis',
      learningActivities: 'Educational games and activities',
      learnerTools: 'Tools for students and teachers',
      aiTools: 'AI-assisted language tools',
      cta: 'Start Your Journey'
    }
  }[lang as 'ar' | 'en'];

  return (
    <div className="relative flex h-dvh min-h-[420px] w-full items-center justify-center overflow-hidden bg-[#061522] p-4 text-white sm:p-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_20%,rgba(16,185,129,.23),transparent_42%),radial-gradient(ellipse_at_80%_80%,rgba(37,99,235,.25),transparent_46%)]" />
      <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full border border-emerald-400/25 shadow-[0_0_95px_rgba(16,185,129,.26)]" />
      <div className="relative flex w-full max-w-[440px] flex-col items-center rounded-[32px] border border-emerald-300/25 bg-[#0a1c2b]/90 px-6 py-9 text-center shadow-[0_28px_110px_rgba(0,0,0,.65),0_0_65px_rgba(16,185,129,.12)] backdrop-blur-2xl sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute inset-x-14 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
        <img src="/Logo.png" alt="شعار قُل" className="mb-6 h-20 w-20 rounded-[22px] object-cover shadow-[0_0_38px_rgba(16,185,129,.38)]" />
        <h1 className="text-3xl font-black tracking-tight arabic-font">{lang === 'ar' ? 'مرحبًا بك في قُل' : 'Welcome to QUL'}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300 arabic-font">{lang === 'ar' ? 'بوابتك لتعلّم اللغة العربية' : 'Your gateway to learning Arabic'}</p>
        <div className="my-7 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <button type="button" onClick={signIn} disabled={isSigningIn} className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-300/40 bg-gradient-to-r from-emerald-500 to-blue-600 px-5 py-4 text-sm font-extrabold text-white shadow-[0_0_30px_rgba(16,185,129,.27)] transition-all hover:brightness-110 hover:shadow-[0_0_40px_rgba(16,185,129,.44)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 disabled:cursor-wait disabled:opacity-60"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold text-blue-600">G</span>{isSigningIn ? (lang === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Signing in...') : (lang === 'ar' ? 'تسجيل الدخول باستخدام Google' : 'Sign in with Google')}</button>
        {authError && <p role="alert" className="mt-5 text-xs leading-6 text-rose-300">{authError}</p>}
        <p className="mt-6 text-xs leading-6 text-slate-400 arabic-font">{lang === 'ar' ? 'ستختار حسابك في صفحة Google الآمنة.' : 'You will choose your account on Google’s secure page.'}</p>
        <button type="button" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="mt-6 rounded-full border border-white/15 px-4 py-2 text-xs text-slate-300 hover:border-emerald-400/50 hover:text-white">{lang === 'ar' ? 'English' : 'العربية'}</button>
      </div>
    </div>
  );
};

export default Landing;
