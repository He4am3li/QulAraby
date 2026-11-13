import React from 'react';
import { AudioLines } from 'lucide-react';

interface Props {
  active: boolean;
  connecting?: boolean;
  listening: boolean;
  speaking: boolean;
  loading?: boolean;
  disabled?: boolean;
  lang: 'ar' | 'en';
  onToggle: () => void;
}

/** A compact, accessible Siri-inspired audio orb. No separate voice-stage screen. */
export const DialectVoiceOrb: React.FC<Props> = ({ active, connecting, listening, speaking, loading, disabled, lang, onToggle }) => {
  const ar = lang === 'ar';
  const status = connecting ? (ar ? 'جار الاتصال، اضغط للإلغاء' : 'Connecting, tap to cancel')
    : !active ? (ar ? 'بدء التحدث' : 'Start speaking')
    : speaking ? (ar ? 'الشخصية تتحدث' : 'Tutor speaking')
      : loading ? (ar ? 'جار تجهيز الرد' : 'Preparing a reply')
        : listening ? (ar ? 'جار الاستماع' : 'Listening')
          : (ar ? 'الاتصال نشط' : 'Call active');
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={active}
      aria-busy={connecting}
      aria-label={connecting ? (ar ? 'إلغاء بدء المحادثة' : 'Cancel connecting') : active ? (ar ? 'إنهاء المحادثة الصوتية' : 'End voice conversation') : (ar ? 'تشغيل المحادثة الصوتية مع الشخصية المختارة' : 'Start live voice with selected tutor')}
      title={status}
      className="group relative inline-flex h-[66px] w-[76px] shrink-0 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span aria-hidden="true" className={'absolute inset-[4px] rounded-full blur-xl transition-opacity duration-500 ' +
        (active ? 'bg-cyan-400/60 opacity-90' : 'bg-sky-400/20 opacity-30')} />
      <span aria-hidden="true" className={'absolute inset-[9px] rounded-full border transition-colors duration-300 ' +
        (active ? 'border-cyan-300/75' : 'border-slate-300/70')} />
      <span aria-hidden="true" className="absolute inset-[13px] rounded-full shadow-[inset_0_2px_10px_rgba(255,255,255,.65),0_7px_18px_rgba(15,23,42,.18)]"
        style={{
          background: active
            ? 'conic-gradient(from 35deg, #19c7e6, #7f79ff, #e373c6, #20d8b1, #19c7e6)'
            : 'conic-gradient(from 35deg, #d5dde8, #a7b9cc, #e6ebef, #b3b9d5, #d5dde8)'
        }} />
      <span aria-hidden="true" className="absolute inset-[20px] rounded-full bg-white/35 blur-[5px]" />
      <AudioLines size={21} strokeWidth={2.2} aria-hidden="true" className={'relative z-10 transition-colors ' + (connecting ? 'animate-pulse text-sky-700' : active ? 'text-white drop-shadow-md' : 'text-slate-600')} />
      {active && (
        <span aria-hidden="true" className="absolute bottom-0 h-[2px] w-8 rounded-full bg-cyan-300 shadow-[0_0_12px_#22d3ee] motion-safe:animate-pulse"/>
      )}
      <span className="sr-only" role="status">{status}</span>
    </button>
  );
};
