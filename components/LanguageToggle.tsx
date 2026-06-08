
import React from 'react';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  lang: 'ar' | 'en';
  onToggle: () => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ lang, onToggle }) => {
  return (
    <button 
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 backdrop-blur-md transition-all active:scale-95 group"
      title={lang === 'ar' ? 'Change Language' : 'تغيير اللغة'}
    >
      <span className="text-xs font-bold uppercase tracking-wide">
        {lang === 'ar' ? 'English' : 'العربية'}
      </span>
      <Globe size={16} className="group-hover:rotate-12 transition-transform" />
    </button>
  );
};
