import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, Languages, BookText, Library, BookOpen, Globe, Type, Mic, Ear, PenTool, Rocket, Gamepad2, Trophy, FileText, ClipboardList, ClipboardCheck, GraduationCap, TrendingUp, Presentation, Feather, ShieldCheck, Building2, Activity, Layers, Users } from 'lucide-react';
import { OnboardingTour } from './OnboardingTour';
import { RoleSwitcher } from './RoleSwitcher';
import { useAuth } from './AuthProvider';
import { useSchoolAccess } from './SchoolAccessProvider';
import { ROUTE_MODULES } from '../config/schoolPlans';

const navTranslations: Record<string, { en: string, ar: string }> = {
  '/': { en: 'Home', ar: 'الرئيسية' },
  '/whiteboard': { en: 'Whiteboard', ar: 'السبورة' },
  '/calligraphy': { en: 'Arabic Calligraphy', ar: 'الخط العربي' },
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
  '/admin': { en: 'Platform Admin', ar: 'إدارة المنصة' },
  '/school': { en: 'School Portal', ar: 'إدارة المدرسة' },
  '/admin?tab=overview': { en: 'Overview', ar: 'نظرة عامة' },
  '/admin?tab=schools': { en: 'Schools', ar: 'المدارس' },
  '/admin?tab=plans': { en: 'Plans & Modules', ar: 'الباقات والأقسام' },
  '/admin?tab=users': { en: 'Accounts & Roles', ar: 'الحسابات والصلاحيات' },
  '/school?tab=overview': { en: 'Overview', ar: 'نظرة عامة' },
  '/school?tab=team': { en: 'School Team', ar: 'المعلمون والطلاب' },
  '/school?tab=subscription': { en: 'Subscription & Modules', ar: 'الاشتراك والأقسام' },
};

const navIcons: Record<string, any> = {
  '/': HomeIcon,
  '/whiteboard': Presentation,
  '/calligraphy': Feather,
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
  '/admin': ShieldCheck,
  '/school': Building2,
  '/admin?tab=overview': Activity,
  '/admin?tab=schools': Building2,
  '/admin?tab=plans': Layers,
  '/admin?tab=users': Users,
  '/school?tab=overview': Activity,
  '/school?tab=team': Users,
  '/school?tab=subscription': Layers,
};

const learnerNavPaths = ['/', '/whiteboard', '/calligraphy', '/test', '/letters', '/vocabulary', '/quizzes', '/translator', '/listening', '/speak', '/reading', '/writing', '/assistant', '/games', '/dialects', '/worksheets', '/preparation', '/achievements'];

const getNavPathsForRole = (role?: string) => {
  if (role === 'admin') return ['/', '/admin?tab=schools', '/admin?tab=plans', '/admin?tab=users'];
  if (role === 'schoolAdmin') return ['/', '/school?tab=team', '/school?tab=subscription'];
  if (role === 'teacher') return learnerNavPaths;
  return learnerNavPaths.filter(path => !['/whiteboard', '/calligraphy', '/preparation'].includes(path));
};

const ARABIC_CHARS = ['ق', 'ل', 'ع', 'ر', 'ب', 'ي', 'أ', 'ن', 'ا', 'ح', 'ب', 'س', 'د', 'و', 'ك'];

type FallingLetterParticle = {
  id: number;
  char: string;
  left: number;
  duration: number;
  delay: number;
  fontSize: number;
};

export const FallingLetters = ({ mode = 'tall' }: { mode?: 'tall' | 'compact' }) => {
  // Keep each particle stable across re-renders so the animation doesn't jump or restart.
  const particles = React.useMemo<FallingLetterParticle[]>(() => {
    const count = mode === 'tall' ? 20 : 12;
    return Array.from({ length: count }, (_, id) => {
      const duration = mode === 'tall'
        ? 15 + Math.random() * 12
        : 6 + Math.random() * 5;
      return {
        id,
        char: ARABIC_CHARS[Math.floor(Math.random() * ARABIC_CHARS.length)],
        left: 3 + Math.random() * 94,
        duration,
        // Start particles at different points in the cycle without tying them to rerenders.
        delay: -Math.random() * duration,
        fontSize: mode === 'tall' ? 12 + Math.random() * 10 : 14 + Math.random() * 6,
      };
    });
  }, [mode]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={mode + '-' + particle.id}
          initial={{ top: '-12%', opacity: 0 }}
          animate={{
            // Animate top against the container height, not translateY against the glyph height.
            top: ['-12%', '112%'],
            opacity: [0, 0.36, 0.36, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: 'loop',
            delay: particle.delay,
            ease: 'linear',
          }}
          className="absolute select-none font-bold text-white/30 blur-[0.2px] arabic-font"
          style={{
            left: particle.left + '%',
            fontSize: particle.fontSize + 'px',
            lineHeight: 1,
            textShadow: mode === 'compact' ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
            willChange: 'top, opacity',
          }}
        >
          {particle.char}
        </motion.div>
      ))}
    </div>
  );
};

const LogoArt: React.FC<{ isExpanded?: boolean }> = ({ isExpanded = false }) => (
  <div className="relative group shrink-0 flex items-center justify-center">
    <div className={`absolute inset-0 bg-blue-500/25 rounded-2xl blur-md transition-all duration-300 ${isExpanded ? 'scale-125 bg-blue-500/35' : ''}`} />
    <motion.div 
      animate={{ 
        scale: isExpanded ? 1.45 : 1,
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="relative w-12 h-12 rounded-2xl border border-slate-700/60 flex items-center justify-center shadow-lg overflow-hidden group-hover:border-blue-500/60 transition-colors origin-center"
    >
      <img 
        src="/Logo.png" 
        alt="شعار منصة قُل" 
        className="w-full h-full object-cover scale-125 group-hover:scale-130 transition-transform duration-300" 
      />
    </motion.div>
  </div>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { profile } = useAuth();
  const schoolAccess = useSchoolAccess();
  const navPaths = getNavPathsForRole(profile?.role);
  const [collapsed, setCollapsed] = React.useState(true);
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  React.useEffect(() => {
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
      <RoleSwitcher />
      
      {/* Dynamic Desktop Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: collapsed ? 80 : 240 }}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="hidden md:flex flex-col text-white sticky top-0 h-screen shadow-[20px_0_40px_rgba(0,0,0,0.3)] relative overflow-hidden z-40" 
        style={{ background: 'linear-gradient(to left, #0f172a 0%, #064e3b 100%)' }}
      >
        {/* Falling Letters Layer */}
        <FallingLetters />

        {/* Header Section */}
        <div 
          onClick={() => setCollapsed(!collapsed)}
          className="relative z-10 flex flex-col items-center justify-center cursor-pointer group h-[120px] shrink-0 select-none"
        >
          <div className="flex items-center justify-center">
             <LogoArt isExpanded={!collapsed} />
          </div>

          {/* Minimal "MENU" / "CATEGORIES" Indicator - strictly constant height */}
          <div className="h-5 flex items-center justify-center mt-3">
            <AnimatePresence mode="wait">
              {collapsed ? (
                <motion.div 
                  key="menu-collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
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
                  transition={{ duration: 0.15 }}
                  className="w-full px-4"
                >
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
            if (path.split('?')[0] === '/admin' && profile?.role !== 'admin') return false;
            if (path.split('?')[0] === '/school' && profile?.role !== 'schoolAdmin') return false;
            if (path === '/preparation' && profile?.role !== 'teacher' && profile?.role !== 'admin') return false;
            const moduleId = ROUTE_MODULES[path.split('?')[0]];
            if (moduleId && !schoolAccess.canAccess(moduleId)) return false;
            return true;
          }).map((path, i) => {
            const routePath = path.split('?')[0];
            const Icon = navIcons[path] || navIcons[routePath];
            const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin';
            let label = (navTranslations[path] || navTranslations[routePath])[lang];
            if (routePath === '/' && profile?.role === 'admin') label = lang === 'ar' ? 'لوحة الإدارة' : 'Admin dashboard';
            if (routePath === '/' && profile?.role === 'schoolAdmin') label = lang === 'ar' ? 'لوحة المدرسة' : 'School dashboard';
            if (path === '/test') {
              label = isTeacher 
                ? (lang === 'ar' ? 'مستويات الطلاب' : 'Student Levels')
                : (lang === 'ar' ? 'تحديد المستوى' : 'Placement Test');
            }
            const expectedSearch = path.includes('?') ? `?${path.split('?')[1]}` : '';
            const isDefaultOverview = path.endsWith('tab=overview') && (location.search === '' || location.search === '?tab=overview');
            const isActive = location.pathname === routePath && (location.search === expectedSearch || isDefaultOverview);

            return (
              <div key={path} className="overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ 
                    y: collapsed ? 0 : 0, 
                    opacity: 1 
                  }}
                  transition={{ 
                    duration: 0.4
                  }}
                >
                  <Link
                    to={path}
                    id={`nav-${(path.split('?')[0] === '/' ? 'home' : path.split('?')[0].substring(1))}-${path.includes('?') ? path.split('=')[1] : 'main'}`}
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

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 px-2 z-50 shadow-2xl">
        {navPaths.filter(path => {
          if (path.split('?')[0] === '/admin' && profile?.role !== 'admin') return false;
          if (path.split('?')[0] === '/school' && profile?.role !== 'schoolAdmin') return false;
          if (path === '/preparation' && profile?.role !== 'teacher' && profile?.role !== 'admin') return false;
          const moduleId = ROUTE_MODULES[path.split('?')[0]];
          if (moduleId && !schoolAccess.canAccess(moduleId)) return false;
          // Hide some items on mobile to save space
          const mobileHiddenPaths = ['/translator', '/worksheets', '/dialects'];
          if (mobileHiddenPaths.includes(path) && path !== '/preparation') return false;
          return true;
        }).map((path) => {
          const routePath = path.split('?')[0];
            const Icon = navIcons[path] || navIcons[routePath];
          const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin';
          let label = (navTranslations[path] || navTranslations[routePath])[lang];
          if (routePath === '/' && profile?.role === 'admin') label = lang === 'ar' ? 'لوحة الإدارة' : 'Admin dashboard';
          if (routePath === '/' && profile?.role === 'schoolAdmin') label = lang === 'ar' ? 'لوحة المدرسة' : 'School dashboard';
          if (path === '/test') {
            label = isTeacher 
              ? (lang === 'ar' ? 'مستويات الطلاب' : 'Student Levels')
              : (lang === 'ar' ? 'تحديد المستوى' : 'Placement Test');
          }
          const expectedSearch = path.includes('?') ? `?${path.split('?')[1]}` : '';
          const isDefaultOverview = path.endsWith('tab=overview') && (location.search === '' || location.search === '?tab=overview');
          const isActive = location.pathname === routePath && (location.search === expectedSearch || isDefaultOverview);
          return (
            <Link
              key={path}
              to={path}
              id={`mobile-nav-${(path.split('?')[0] === '/' ? 'home' : path.split('?')[0].substring(1))}-${path.includes('?') ? path.split('=')[1] : 'main'}`}
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

      <main className={`flex-1 bg-[#f8fafc] overflow-hidden h-screen ${(location.pathname === '/whiteboard' || location.pathname === '/calligraphy') ? 'p-1 md:p-2' : 'p-2 md:p-4 lg:p-6'}`}>
        <div className={`w-full h-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative ${(location.pathname === '/whiteboard' || location.pathname === '/calligraphy') ? 'overflow-hidden' : 'overflow-y-auto custom-scroll'}`}>
          {children}
        </div>
      </main>
    </div>
  );
};
