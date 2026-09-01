import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Plus, Trash2, Trophy, Sparkles, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpinningWheelProps {
  initialItems?: string[];
  onInsertToBoard?: (items: string[], winner?: string) => void;
  onClose?: () => void;
  isCompact?: boolean;
}

const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'
];

const PRESETS = {
  students: ['أحمد', 'سارة', 'محمد', 'فاطمة', 'يوسف', 'مريم', 'خالد', 'نور'],
  challenges: [
    'إعراب كلمة', 'هات مرادفاً', 'حوّل لجملة فعلية', 
    'استخرج الفاعل', 'هات جمع الكلمة', 'علل الهمزة', 
    'استخرج مفعولاً', 'هات وزناً صرفياً'
  ]
};

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  initialItems = PRESETS.students,
  onInsertToBoard,
  onClose,
  isCompact = false
}) => {
  const [items, setItems] = useState<string[]>(initialItems);
  const [newItemText, setNewItemText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Play audio tick during spinning using Web Audio API
  const playTickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch {}
  };

  // Play victory chime
  const playVictorySound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
        });
      }
    } catch {}
  };

  // Draw the Wheel onto Canvas
  const drawWheel = (rotationAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 14;

    ctx.clearRect(0, 0, size, size);

    if (items.length === 0) {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Tajawal, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('أضف عناصر للعجلة', center, center);
      return;
    }

    const arcSize = (Math.PI * 2) / items.length;

    // Outer rim glow & border
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();

    // Draw slices
    items.forEach((item, index) => {
      const angle = rotationAngle + index * arcSize;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arcSize);
      ctx.closePath();

      const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff33';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${isCompact ? 10 : 12}px Tajawal, sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      ctx.fillText(item.length > 12 ? item.slice(0, 12) + '..' : item, radius - 18, 4);
      ctx.restore();

      ctx.restore();
    });

    // Center hub cap
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px Tajawal, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('قُل', center, center + 4);
    ctx.restore();
  };

  useEffect(() => {
    drawWheel(currentRotation);
  }, [items, currentRotation]);

  const spin = () => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    const spins = 5 + Math.random() * 4; // 5 to 9 full revolutions
    const extraAngle = Math.random() * (Math.PI * 2);
    const targetRotation = currentRotation + spins * Math.PI * 2 + extraAngle;
    const duration = 3800; // 3.8 seconds
    const startTime = performance.now();
    const startRot = currentRotation;

    let lastTickAngle = 0;
    const arcSize = (Math.PI * 2) / items.length;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startRot + (targetRotation - startRot) * easeOut;
      setCurrentRotation(current);

      // Play tick sounds at boundaries
      if (Math.abs(current - lastTickAngle) > arcSize) {
        playTickSound();
        lastTickAngle = current;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Calculate winning index (pointer is at top = 3*PI/2)
        const normalizedAngle = (current % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const pointerAngle = (Math.PI * 3 / 2); // top
        let diff = pointerAngle - normalizedAngle;
        if (diff < 0) diff += Math.PI * 2;
        const winIndex = Math.floor(diff / arcSize) % items.length;
        const chosen = items[winIndex] || items[0];
        setWinner(chosen);
        playVictorySound();
      }
    };

    requestAnimationFrame(animate);
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    setItems([...items, newItemText.trim()]);
    setNewItemText('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const loadPreset = (presetKey: 'students' | 'challenges') => {
    setItems(PRESETS[presetKey]);
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center gap-2.5 w-full max-w-[280px] text-right" dir="rtl">
      {/* Top Presets Switch */}
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex gap-1">
          <button
            onClick={() => loadPreset('students')}
            className="px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-[10px] font-bold transition"
          >
            أسماء الطلاب
          </button>
          <button
            onClick={() => loadPreset('challenges')}
            className="px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-[10px] font-bold transition"
          >
            السؤال
          </button>
        </div>
        <span className="text-[9px] text-white/50 font-mono">{items.length} عنصر</span>
      </div>

      {/* Wheel Canvas Container with Top Pointer Arrow */}
      <div className="relative flex items-center justify-center">
        {/* Top Pointer Needle */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-md">
          <div className="w-0 h-0 border-x-[8px] border-x-transparent border-t-[14px] border-t-amber-400" />
        </div>

        <canvas
          ref={canvasRef}
          width={220}
          height={220}
          className="rounded-full shadow-2xl bg-slate-950/80"
        />
      </div>

      {/* Winner Announcement Banner - Clean and without trophy or extra text */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 5 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/60 p-2 rounded-xl text-center shadow-lg"
          >
            <div className="text-base font-black text-amber-300 arabic-font py-0.5">{winner}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spin Button - Yellow, comfortable size */}
      <button
        onClick={spin}
        disabled={isSpinning || items.length === 0}
        className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
      >
        <Play size={13} className={isSpinning ? 'animate-spin' : ''} />
        <span>{isSpinning ? 'جاري التدوير...' : 'تدوير العجلة'}</span>
      </button>

      {/* Add New Item Input with Yellow Add button */}
      <div className="flex items-center gap-1.5 w-full">
        <input
          type="text"
          placeholder="إضافة اسم أو سؤال..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          className="flex-1 p-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-[10px] outline-none placeholder:text-white/30 arabic-font"
        />
        <button
          onClick={addItem}
          className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-black transition shadow"
          title="إضافة"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Quick Items List / Tags */}
      <div className="flex flex-wrap gap-1 w-full max-h-20 overflow-y-auto custom-scrollbar p-1 bg-black/20 rounded-lg border border-white/5">
        {items.map((item, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/10 text-white/80 text-[8px] font-bold"
          >
            <span>{item}</span>
            <button
              onClick={() => removeItem(idx)}
              className="text-white/40 hover:text-red-400 transition"
            >
              <X size={9} />
            </button>
          </span>
        ))}
      </div>

      {/* Insert on Board Button - Yellow, comfortable size */}
      {onInsertToBoard && (
        <button
          onClick={() => onInsertToBoard(items, winner || undefined)}
          className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 mt-0.5"
        >
          <span>إدراج العجلة في السبورة</span>
        </button>
      )}
    </div>
  );
};
