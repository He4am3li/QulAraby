import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Plus, Trash2, X, Users, HelpCircle, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpinningWheelProps {
  initialItems?: string[];
  initialMode?: 'students' | 'questions';
  onInsertToBoard?: (items: string[], mode?: string) => void;
  onClose?: () => void;
  isCompact?: boolean;
}

const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'
];

const PRESETS = {
  students: ['أحمد', 'سارة', 'محمد', 'فاطمة', 'يوسف', 'مريم', 'خالد', 'نور', 'عمر', 'زينب'],
  questions: [
    'إعراب كلمة', 'هات مرادفاً', 'حوّل لجملة فعلية', 
    'استخرج الفاعل', 'هات جمع الكلمة', 'علل الهمزة', 
    'استخرج مفعولاً', 'هات وزناً صرفياً', 'ما نوع المشتق؟', 'اضبط الكلمة'
  ]
};

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  initialItems,
  initialMode = 'students',
  onInsertToBoard,
  onClose,
  isCompact = false
}) => {
  const [activeMode, setActiveMode] = useState<'students' | 'questions' | 'edit'>(initialMode);
  const [items, setItems] = useState<string[]>(initialItems || PRESETS.students);
  const [newItemText, setNewItemText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Play subtle tick sound during spinning
  const playTickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch {}
  };

  // Play victory chime
  const playVictorySound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.09);
          osc.stop(ctx.currentTime + idx * 0.09 + 0.35);
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
    const radius = center - 12;

    ctx.clearRect(0, 0, size, size);

    if (items.length === 0) {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 12px Tajawal, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('أضف عناصر للعجلة', center, center);
      return;
    }

    const arcSize = (Math.PI * 2) / items.length;

    // Outer rim glow & border
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;
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
      ctx.strokeStyle = '#ffffff25';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Slice Text label
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${isCompact ? 10 : 12}px 'Tajawal', sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      const displayTxt = item.length > 14 ? item.slice(0, 13) + '..' : item;
      ctx.fillText(displayTxt, radius - 16, 4);
      ctx.restore();

      ctx.restore();
    });

    // Center hub cap
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.5;
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

    const spins = 5 + Math.random() * 4;
    const extraAngle = Math.random() * (Math.PI * 2);
    const targetRotation = currentRotation + spins * Math.PI * 2 + extraAngle;
    const duration = 3600;
    const startTime = performance.now();
    const startRot = currentRotation;

    let lastTickAngle = 0;
    const arcSize = (Math.PI * 2) / items.length;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startRot + (targetRotation - startRot) * easeOut;
      setCurrentRotation(current);

      if (Math.abs(current - lastTickAngle) > arcSize) {
        playTickSound();
        lastTickAngle = current;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const normalizedAngle = (current % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const pointerAngle = (Math.PI * 3 / 2);
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

  const handleSelectPreset = (mode: 'students' | 'questions') => {
    setActiveMode(mode);
    setItems(PRESETS[mode]);
    setWinner(null);
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    setItems([...items, newItemText.trim()]);
    setNewItemText('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  return (
    <div className="flex flex-col items-center gap-2.5 w-full text-right" dir="rtl">
      {/* Top Segmented Switch: 1. أسماء الطلاب | 2. الأسئلة | 3. تعديل */}
      <div className="flex items-center justify-between w-full px-0.5">
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 w-full justify-between">
          <button
            onClick={() => handleSelectPreset('students')}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
              activeMode === 'students'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={11} />
            <span>أسماء الطلاب</span>
          </button>

          <button
            onClick={() => handleSelectPreset('questions')}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
              activeMode === 'questions'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle size={11} />
            <span>الأسئلة</span>
          </button>

          <button
            onClick={() => setActiveMode(activeMode === 'edit' ? 'students' : 'edit')}
            className={`py-1 px-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
              activeMode === 'edit'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="تعديل العناصر"
          >
            <Edit3 size={11} />
            <span>تعديل</span>
          </button>
        </div>
      </div>

      {/* Wheel Canvas Container with Top Pointer Arrow */}
      <div className="relative flex items-center justify-center my-0.5">
        {/* Top Pointer Needle */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-md">
          <div className="w-0 h-0 border-x-[8px] border-x-transparent border-t-[14px] border-t-amber-400" />
        </div>

        <canvas
          ref={canvasRef}
          width={isCompact ? 220 : 250}
          height={isCompact ? 220 : 250}
          className="rounded-full shadow-2xl bg-slate-950/80 cursor-pointer"
          onClick={!isSpinning ? spin : undefined}
        />
      </div>

      {/* Winning Selection Banner */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 5 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="w-full bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/70 p-2 rounded-xl text-center shadow-lg"
          >
            <div className="text-base font-black text-amber-300 arabic-font py-0.5">
              {winner}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={isSpinning || items.length === 0}
        className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Play size={14} className={isSpinning ? 'animate-spin' : 'fill-current'} />
        <span>{isSpinning ? 'جاري التدوير السريع...' : 'تدوير العجلة'}</span>
      </button>

      {/* Edit Panel (Shown when edit mode is toggled) */}
      {activeMode === 'edit' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-col gap-1.5 w-full bg-black/30 p-2 rounded-xl border border-white/10"
        >
          <div className="flex items-center gap-1.5 w-full">
            <input
              type="text"
              placeholder="إضافة اسم أو سؤال جديد..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              className="flex-1 p-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-[10px] outline-none placeholder:text-white/30 arabic-font"
            />
            <button
              onClick={addItem}
              className="p-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg font-black transition shadow"
              title="إضافة"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar p-1">
            {items.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/10 text-white/90 text-[8px] font-bold"
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
        </motion.div>
      )}

      {/* Direct Board Inserter (in Toolbar modal) */}
      {onInsertToBoard && (
        <button
          onClick={() => onInsertToBoard(items, activeMode)}
          className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-xl transition shadow-md flex items-center justify-center gap-1.5 mt-0.5"
        >
          <span>إدراج العجلة في السبورة</span>
        </button>
      )}
    </div>
  );
};
