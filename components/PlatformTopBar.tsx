import React from 'react';
import { HelpCircle, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
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
    <header dir={lang === 'ar' ? 'rtl' : 'ltr'} className="relative isolate shrink-0 overflow-hidden border-b border-white/20 bg-gradient-to-l from-[#0f172a]/95 via-[#103b48]/95 to-[#064e3b]/95 px-4 py-4 text-white shadow-[0_12px_36px_rgba(16,38,56,0.14)] sm:px-6 md:px-8 md:py-5">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <FallingLetters mode="compact" />
        <div className="absolute -right-14 -top-28 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>
      <div className="relative z-10 grid grid-cols-1 items-center gap-4 md:grid-cols-3">
        <div className="flex items-center justify-center md:justify-start">
          <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] p-1.5 shadow-sm backdrop-blur-md">
            <LanguageToggle lang={lang} onToggle={toggleLanguage} />
            <span className="h-5 w-px bg-white/15" />
            <button onClick={restartTour} title={lang === 'ar' ? 'جولة تعريفية' : 'Guided tour'} className="rounded-lg p-2 text-white/75 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40">
              <HelpCircle size={18}/>
            </button>
          </div>
        </div>
        <BrandSlogan />
        <div className="flex items-center justify-center md:justify-end">
          <div className="flex max-w-full items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] p-2 shadow-sm backdrop-blur-md sm:gap-3">
            {user ? (
              <>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-white/10">
                  {user.photoURL
                    ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover"/>
                    : <UserIcon size={18} className="text-white/75"/>}
                </div>
                <div className="min-w-0">
                  <p className="max-w-[160px] truncate text-xs font-bold text-white sm:text-sm">{user.displayName?.split(' ').slice(0, 2).join(' ') || user.email?.split('@')[0] || (lang === 'ar' ? 'مستخدم قُل' : 'QUL user')}</p>
                  <p className="mt-1 text-[10px] text-white/60">{profile?.role === 'admin' ? (lang === 'ar' ? 'الأدمن العام' : 'Platform admin') : profile?.role === 'schoolAdmin' ? (lang === 'ar' ? 'مدير المدرسة' : 'School admin') : profile?.role === 'teacher' ? (lang === 'ar' ? 'المعلم' : 'Teacher') : (lang === 'ar' ? 'الطالب' : 'Student')}</p>
                </div>
                <span className="mx-1 h-6 w-px bg-white/15"/>
                <button onClick={() => void signOut()} title={lang === 'ar' ? 'تسجيل الخروج' : 'Sign out'} className="rounded-lg p-2 text-rose-200 transition hover:bg-rose-400/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"><LogOut size={17}/></button>
              </>
            ) : (
              <button onClick={() => void signIn()} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-black text-emerald-900 transition hover:bg-emerald-50"><LogIn size={15}/>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}</button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
