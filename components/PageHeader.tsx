import React from 'react';
import { LucideIcon } from 'lucide-react';
import { FallingLetters } from './Layout';
import { LanguageToggle } from './LanguageToggle';

interface PageHeaderProps {
  title: string;
  icon: LucideIcon;
  lang: 'ar' | 'en';
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
  onToggle?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, icon: Icon, lang, children, rightContent, onToggle }) => {
  const toggleLang = () => {
    if (onToggle) {
      onToggle();
      return;
    }
    const newLang = lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  return (
    <div className="bg-gradient-to-l from-[#0f172a]/95 to-[#064e3b]/95 backdrop-blur-lg px-8 py-6 flex items-center justify-between shrink-0 shadow-lg relative z-[60] overflow-hidden no-print border-b border-white/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FallingLetters mode="compact" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
      </div>
      <div className="flex items-center gap-6 relative z-10">
        <div className="flex items-center gap-3 text-white font-bold text-shadow-sm">
          <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
            <Icon size={20} />
          </div>
          <span className="arabic-font text-lg tracking-wide">{title}</span>
        </div>
        {children}
      </div>
      <div className="flex items-center gap-4 relative z-10">
        {rightContent}
        <LanguageToggle 
          lang={lang} 
          onToggle={toggleLang} 
        />
      </div>
    </div>
  );
};
