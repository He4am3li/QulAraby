import React from 'react';
import { HelpCircle, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { WesalLauncher } from './Wesal';
import './topBarGlass.css';
import { BrandSlogan } from './BrandSlogan';
import { FallingLetters } from './Layout';
import { useAuth } from './AuthProvider';

export const PlatformTopBar: React.FC = () => {
  const { user, profile, signIn, signOut } = useAuth();
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  React.useEffect(() => {
    const syncLanguage = () => setLang((localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar');
    window.addEventListener('storage', syncLanguage);
    window.addEventListener('langChanged', syncLanguage);
    return () => {
      window.removeEventListener('storage', syncLanguage);
      window.removeEventListener('langChanged', syncLanguage);
    };
  }, []);

  const toggleLanguage = () => {
    const next = lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('hub_lang', next);
    setLang(next);
    window.dispatchEvent(new Event('langChanged'));
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  const restartTour = () => {
    localStorage.removeItem('hub_onboarding_seen');
    window.location.reload();
  };

  return (
    <header dir={lang === 'ar' ? 'rtl' : 'ltr'} className="relative isolate shrink-0 overflow-hidden border-b border-white/15 bg-gradient-to-l from-[#0f172a]/95 to-[#064e3b]/95 px-4 py-4 text-white shadow-lg sm:px-6 md:px-8 md:py-5">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <FallingLetters mode="compact" />
        <div className="absolute -right-14 -top-28 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>
      <div className="relative z-10 grid grid-cols-1 items-center gap-4 md:grid-cols-3">
        <div className="flex items-center justify-center md:justify-start">
          <div className="qul-header-glass qul-header-tools flex w-full max-w-[258px] items-center">
            <LanguageToggle lang={lang} onToggle={toggleLanguage} />
            <span className="qul-header-divider" aria-hidden="true" />
            <WesalLauncher lang={lang} />
            <span className="qul-header-divider" aria-hidden="true" />
            <button onClick={restartTour} title={lang === 'ar' ? 'جولة تعريفية' : 'Guided tour'} className="qul-header-guide">
              <HelpCircle size={18}/>
            </button>
          </div>
        </div>
        <BrandSlogan />
        <div className="flex items-center justify-center md:justify-end">
          <div className="qul-header-glass qul-header-account flex w-full max-w-[258px] items-center">
            {user ? (
              <>
                <div className="qul-header-avatar">
                  {user.photoURL
                    ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover"/>
                    : <UserIcon size={18} className="text-white/75"/>}
                </div>
                <div className="qul-header-identity">
                  <strong>{user.displayName?.split(' ').slice(0, 2).join(' ') || user.email?.split('@')[0] || (lang === 'ar' ? 'مستخدم قُل' : 'QUL user')}</strong>
                  <small>{profile?.role === 'admin' ? (lang === 'ar' ? 'الأدمن العام' : 'Platform admin') : profile?.role === 'schoolAdmin' ? (lang === 'ar' ? 'مدير المدرسة' : 'School admin') : profile?.role === 'teacher' ? (lang === 'ar' ? 'المعلم' : 'Teacher') : (lang === 'ar' ? 'الطالب' : 'Student')}</small>
                </div>
                <span className="qul-header-divider" aria-hidden="true"/>
                <button onClick={() => void signOut()} title={lang === 'ar' ? 'تسجيل الخروج' : 'Sign out'} className="qul-header-signout"><LogOut size={17}/></button>
              </>
            ) : (
              <button onClick={() => void signIn()} className="qul-header-signin"><LogIn size={15}/>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}</button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
