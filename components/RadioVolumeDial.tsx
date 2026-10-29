import React, { useRef } from 'react';

type Props = { value: number; onChange: (value: number) => void; lang: 'ar' | 'en' };
const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function RadioVolumeDial({ value, onChange, lang }: Props) {
  const drag = useRef<{ id: number; angle: number; value: number; cx: number; cy: number } | null>(null);
  const stop = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return <div className="flex flex-col items-center gap-1">
    <div className="w-16 h-16 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 rounded-full border-4 border-[#2a1d15] shadow-[0_5px_15px_rgba(0,0,0,0.4)] flex items-center justify-center relative qul-original-radio-volume qul-radio-rotary-dial"
      role="slider" tabIndex={0} aria-label={lang === 'ar' ? 'مقبض صوت الراديو' : 'Radio volume dial'}
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} aria-valuetext={`${Math.round(value * 100)}%`}
      title={lang === 'ar' ? 'اسحب البكرة دائريًا لضبط الصوت' : 'Drag around the dial to adjust volume'}
      onPointerDown={event => {
        if (event.button !== 0 || drag.current) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        drag.current = { id: event.pointerId, angle: Math.atan2(event.clientY - cy, event.clientX - cx), value, cx, cy };
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.focus({ preventScroll: true });
        event.preventDefault();
      }}
      onPointerMove={event => {
        const state = drag.current;
        if (!state || state.id !== event.pointerId) return;
        const dx = event.clientX - state.cx, dy = event.clientY - state.cy;
        if (Math.hypot(dx, dy) < 5) return;
        const angle = Math.atan2(dy, dx);
        let delta = angle - state.angle;
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;
        state.angle = angle;
        state.value = clamp(state.value + delta / (Math.PI * 1.5));
        onChange(Math.round(state.value * 100) / 100);
      }}
      onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={() => { drag.current = null; }}
      onKeyDown={event => {
        if (!['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        onChange(event.key === 'Home' ? 0 : event.key === 'End' ? 1 : clamp(value + (['ArrowUp', 'ArrowRight'].includes(event.key) ? 0.05 : -0.05)));
      }}>
      <div className="w-full h-full flex items-center justify-center pointer-events-none" style={{ transform: `rotate(${-135 + value * 270}deg)` }}>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-red-600 rounded-full"/>
      </div>
    </div>
    <span className="text-[8px] font-black text-white/70 uppercase">{lang === 'ar' ? 'الصوت' : 'Volume'} {Math.round(value * 100)}%</span>
  </div>;
}
