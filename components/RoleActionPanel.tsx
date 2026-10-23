import React from 'react';
import { X, ArrowUpRight } from 'lucide-react';

export type RoleActionItem = {
  id: string;
  title: string;
  value?: string | number;
  icon: React.ReactNode;
  tone: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'slate';
  onClick: () => void;
};

const toneClasses: Record<RoleActionItem['tone'], string> = {
  emerald: 'border-emerald-100 bg-emerald-50/80 text-emerald-800 hover:border-emerald-300',
  blue: 'border-blue-100 bg-blue-50/80 text-blue-800 hover:border-blue-300',
  violet: 'border-violet-100 bg-violet-50/80 text-violet-800 hover:border-violet-300',
  amber: 'border-amber-100 bg-amber-50/80 text-amber-800 hover:border-amber-300',
  rose: 'border-rose-100 bg-rose-50/80 text-rose-800 hover:border-rose-300',
  slate: 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300',
};

export const RoleActionPanel: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: RoleActionItem[];
  lang: 'ar' | 'en';
  onClose: () => void;
}> = ({ title, icon, items, lang, onClose }) => {
  const en = lang === 'en';
  return (
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="relative flex shrink-0 items-center justify-between gap-3 overflow-hidden bg-gradient-to-r from-[#0d4737] via-[#123a34] to-[#1e293b] px-5 py-4 text-white sm:px-6">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 18% 30%, white 0 1px, transparent 2px), radial-gradient(circle at 78% 65%, white 0 1px, transparent 2px)', backgroundSize: '34px 34px' }} />
        <div className="relative z-10 flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-inner">{icon}</div>
          <h1 className="truncate text-lg font-black sm:text-xl">{title}</h1>
        </div>
        <button type="button" onClick={onClose} aria-label={en ? 'Back to home' : 'العودة للرئيسية'} title={en ? 'Back to home' : 'العودة للرئيسية'} className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20"><X size={18}/></button>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-4">
        {items.map(item => (
          <button key={item.id} type="button" onClick={item.onClick} className={`group relative flex min-h-0 flex-col justify-between overflow-hidden rounded-2xl border p-4 text-start transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 ${toneClasses[item.tone]}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/80 bg-white/80 shadow-sm">{item.icon}</div>
              <ArrowUpRight size={17} className="opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
            </div>
            <div className="mt-6 min-w-0">
              {item.value !== undefined && <div className="text-3xl font-black leading-none tracking-tight tabular-nums sm:text-4xl">{item.value}</div>}
              <div className={`font-bold ${item.value !== undefined ? 'mt-2 text-sm sm:text-base' : 'mt-4 text-base sm:text-lg'}`}>{item.title}</div>
              <div className="mt-3 h-1 w-10 rounded-full bg-current opacity-25 transition-all group-hover:w-16"/>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
