import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // التعديل هنا ليتوافق مع Vite
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home as HomeIcon, Languages, BookText, Library, BookOpen, Globe, 
  Type, Mic, Ear, PenTool, Gamepad2, Trophy, FileText, 
  ClipboardList, GraduationCap, TrendingUp 
} from 'lucide-react';
import { OnboardingTour } from './OnboardingTour';
import { useAuth } from './AuthProvider';

const navTranslations: Record<string, { en: string, ar: string }> = {
  '/': { en: 'Home', ar: 'الرئيسية' },
  '/test': { en: 'Test Yourself', ar: 'اختبر نفسك' },
  '/letters': { en: 'Letters', ar: 'الحروف' },
  '/vocabulary': { en: 'Vocab', ar: 'المفردات' },
  '/listening': { en: 'Listening', ar: 'الاستماع' },
  '/speak': { en: 'Speaking', ar: 'التحدث' },
  '/reading': { en: 'Reading', ar: 'القراءة' },
  '/writing': { en: 'Writing', ar: 'الكتابة' },
  '/games': { en: 'Games', ar: 'الألعاب' },
  '/dialects': { en: 'Dialects', ar: 'اللهجات' },
  '/translator': { en: 'Translator', ar: 'المترجم' },
  '/assistant': { en: 'Grammar', ar: 'القواعد' },
  '/worksheets': { en: 'Worksheets', ar: 'أوراق العمل' },
  '/quizzes': { en: 'Quizzes', ar: 'الاختبارات' },
  '/preparation': { en: 'Preparation', ar: 'التحضير' },
  '/achievements': { en: 'Achievements', ar: 'إنجازاتي' },
};

const navIcons: Record<string, any> = {
  '/': HomeIcon,
  '/test': TrendingUp,
  '/letters': Type,
  '/vocabulary': BookText,
  '/listening': Ear,
  '/speak': Mic,
  '/reading': BookOpen,
  '/writing': PenTool,
  '/games': Gamepad2,
  '/dialects': Globe,
  '/translator': Languages,
  '/assistant': Library,
  '/worksheets': FileText,
  '/quizzes': GraduationCap,
  '/preparation': ClipboardList,
  '/achievements': Trophy,
};

const navPaths = ['/', '/test', '/letters', '/vocabulary', '/quizzes', '/translator', '/listening', '/speak', '/reading', '/writing', '/assistant', '/games', '/dialects', '/worksheets', '/preparation', '/achievements'];

const ARABIC_CHARS = ['ق', 'ل', 'ع', 'ر', 'ب', 'ي', 'أ', 'ن', 'ا', 'ح', 'ب', 'س', 'د', 'و', 'ك'];

export const FallingLetters = ({ mode = 'tall' }: { mode?: 'tall' | 'compact' }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(mode === 'tall' ? 20 : 12)].map((_, i) => {
        const char = ARABIC_CHARS[Math.floor(Math.random() * ARABIC_CHARS.length)];
        const left = Math.random() * 100;
        const duration = mode === 'tall' ? (10 + Math.random() * 15) : (0.8 + Math.random() * 1.2);
        const delay = Math.random() * -20;
        const fontSize = mode === 'tall' ? (12 + Math.random() * 10) : (14 + Math.random() * 6);
        
        return (
          <motion.div
            key={i}
            initial={{ y: -50, opacity: 0 }}
            animate={{ 
              y: mode === 'tall' ? ['0vh', '110vh'] : ['0%', '150%'],
              opacity: [0, 0.4, 0.4, 0]
            }}
            transition={{ 
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: "linear"
            }}
            className="absolute text-white/30 font-bold arabic-font select-none blur-[0.2px]"
            style={{ 
              left: `${left}%`, 
              fontSize: `${fontSize}px`,
              textShadow: mode === 'compact' ? '0 0 10px rgba(255,255,255,0.4)' : 'none'
            }}
          >
            {char}
          </motion.div>
        );
      })}
    </div>
  );
};

const LogoArt = () => (
  <div className="relative w-10 h-10 group">
    <div className="absolute inset-0 bg-slate-900 rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden">
      <div className="absolute inset-1 bg-black rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        <div className="absolute -inset-4 bg-blue-500/20 blur-xl group-hover:bg-blue-400/30 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
        <div className="relative flex flex-col items-center justify-center leading-none">
          <span className="text-[8px] font-black text-blue-400 tracking-tighter drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">QUL</span>
          <span className="text-[10px] font-black text-emerald-400 arabic-font drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">قُل</span>
        </div>
      </div>
    </div>
  </div>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation(); // جلب مسار الصفحة الحالي في Vite
  const pathname = location.pathname;
  const { profile } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    const savedLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
    setLang(savedLang);

    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('storage', handleLangChange);
    window.addEventListener('langChanged', handleLangChange);
    return () => {
      window.removeEventListener('storage', handleLangChange);
      window.removeEventListener('langChanged', handleLangChange);
    };
  }, []);

  return (
    <div className={`h-full flex flex-col md:flex-row bg-slate-950 ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <OnboardingTour lang={lang} />
      
      <motion.aside 
        initial={false}
        animate={{ width: collapsed ? 80 : 240 }}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="hidden md:flex flex-col text-white sticky top-0 h-screen shadow-[20px_0_40px_rgba(0,0,0,0.3)] overflow-hidden z-40" 
        style={{ background: 'linear-gradient(to left, #0f172a 0%, #064e3b 100%)' }}
      >
        <FallingLetters />

        <div 
          onClick={() => setCollapsed(!collapsed)}
          className="relative z-10 flex flex-col items-center pt-8 pb-4 cursor-pointer group min-h-[140px] justify-start"
        >
          <div className="flex items-center gap-3 mb-6">
             <LogoArt />
             <AnimatePresence mode="wait">
               {!collapsed && (
                 <motion.div 
                   key="brand-text"
                   initial={{ opacity: 0, x: -10, filter: 'blur(5px)' }}
                   animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                   exit={{ opacity: 0, x: -10, filter: 'blur(5px)' }}
                   className="flex flex-col -space-y-1"
                 >
                   <div className="flex items-center gap-1.5">
                     <span className="text-xl font-black tracking-tighter text-white">قُل</span>
                     <span className="text-xl font-black tracking-tighter text-white/40">/</span>
                     <span className="text-xl font-black tracking-tighter text-white">Qul</span>
                   </div>
                   <span className="text-[7px] font-black uppercase tracking-[0.5em] text-emerald-400">Experience</span>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {collapsed ? (
                <motion.div 
                  key="menu-collapsed"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col items-center"
                >
                  <p className="text-[10px] font-black tracking-[0.2em] text-emerald-500/60 group-hover:text-white transition-colors uppercase">
                    {lang === 'ar' ? 'القائمة' : 'Menu'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="menu-expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full px-4"
                >
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-2" />
                  <p className="text-[9px] font-black tracking-[0.3em] text-white/30 uppercase text-center">
                    {lang === 'ar' ? 'الأقسام' : 'Categories'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <nav className="relative z-10 flex-1 space-y-1 overflow-y-auto custom-scroll px-3 py-2">
          {navPaths.filter(path => {
            if (path === '/preparation' && profile?.role !== 'teacher') return false;
            return true;
          }).map((path, i) => {
            const Icon = navIcons[path];
            const label = navTranslations[path][lang];
            const isActive = pathname === path;

            return (
              <div key={path} className="overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Link
                    to={path} // تعديل الخاصية هنا من href إلى to لتلائم ريأكت راوتر
                    id={`nav-${path === '/' ? 'home' : path.substring(1)}`}
                    className={`flex items-center rounded-2xl transition-all duration-300 border relative group/item nav-line-hover ${
                      collapsed ? 'justify-center p-3' : 'px-4 py-3 gap-4 mx-1'
                    } ${
                      isActive 
                        ? 'bg-white/10 text-white border-white/20 shadow-lg' 
                        : 'text-white/50 hover:bg-white/5 hover:text-white border-transparent'
                    }`}
                    title={collapsed ? label : ''}
                  >
                    <Icon size={20} className={`shrink-0 transition-transform ${isActive ? 'text-emerald-400' : 'text-white/40 group-hover/item:text-emerald-400 group-hover/item:scale-110'}`} />
                    
                    {!collapsed && (
                      <div className="overflow-hidden">
                        <motion.span 
                          initial={{ y: "100%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "100%" }}
                          transition={{ 
                            delay: i * 0.08,
                            duration: 0.6,
                            ease: [0.785, 0.135, 0.15, 0.86]
                          }}
                          className={`font-bold arabic-font whitespace-nowrap block transition-colors ${isActive ? 'text-white' : ''}`}
                        >
                          {label}
                        </motion.span>
                      </div>
                    )}

                    {collapsed && isActive && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute inset-0 bg-emerald-500/20 rounded-2xl -z-10"
                      />
                    )}
                  </Link>
                </motion.div>
              </div>
            );
          })}
        </nav>
      </motion.aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 px-2 z-50 shadow-2xl">
        {navPaths.filter(path => {
          if (path === '/preparation' && profile?.role !== 'teacher') return false;
          const mobileHiddenPaths = ['/translator', '/worksheets', '/dialects'];
          if (mobileHiddenPaths.includes(path) && !['/preparation'].includes(path)) return false;
          return true;
        }).map((path) => {
          const Icon = navIcons[path];
          const label = navTranslations[path][lang];
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              to={path} // تعديل الخاصية هنا أيضاً من href إلى to
              id={`mobile-nav-${path === '/' ? 'home' : path.substring(1)}`}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] mt-1 font-medium arabic-font">{label}</span>
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 bg-[#f8fafc] p-2 md:p-4 lg:p-6 overflow-hidden h-screen">
        <div className="w-full h-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-y-auto relative custom-scroll">
          {children}
        </div>
      </main>
    </div>
  );
};
