import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Sparkles, Volume2, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpinningWheelProps {
  initialItems?: string[];
  isCompact?: boolean;
  onItemSelected?: (item: string) => void;
  onInsertToBoard?: (items: string[]) => void;
}

const WHEEL_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  initialItems = ['أحمد', 'سارة', 'محمد', 'فاطمة', 'يوسف', 'مريم'],
  isCompact = false,
  onItemSelected,
  onInsertToBoard
}) => {
  const [items, setItems] = useState<string[]>(initialItems);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [newItem, setNewItem] = useState('');

  const spinWheel = () => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const sliceAngle = 360 / items.length;
    const winningIndex = Math.floor(Math.random() * items.length);
    const targetAngle = extraSpins * 360 + (360 - (winningIndex * sliceAngle + sliceAngle / 2));
    
    setRotation(prev => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const selected = items[winningIndex];
      setWinner(selected);
      if (onItemSelected) onItemSelected(selected);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }, 3500);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setItems([...items, newItem.trim()]);
    setNewItem('');
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 2) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const sliceAngle = 360 / Math.max(1, items.length);
  const size = isCompact ? 220 : 300;
  const radius = size / 2;

  return (
    <div className="flex flex-col items-center gap-3 p-2 select-none" dir="rtl">
      {/* Pointer */}
      <div className="relative flex flex-col items-center">
        <div className="z-30 w-0 h-0 border-x-8 border-x-transparent border-t-[16px] border-t-amber-400 -mb-2 filter drop-shadow-md" />

        {/* The Wheel */}
        <div 
          className="relative rounded-full shadow-2xl border-4 border-amber-400 overflow-hidden bg-slate-900"
          style={{ width: size, height: size }}
        >
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 3.5, ease: [0.15, 0.9, 0.2, 1] }}
            className="w-full h-full relative"
          >
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
              {items.map((item, idx) => {
                const startAngle = idx * sliceAngle;
                const endAngle = (idx + 1) * sliceAngle;
                const radStart = (startAngle - 90) * (Math.PI / 180);
                const radEnd = (endAngle - 90) * (Math.PI / 180);
                const x1 = radius + radius * Math.cos(radStart);
                const y1 = radius + radius * Math.sin(radStart);
                const x2 = radius + radius * Math.cos(radEnd);
                const y2 = radius + radius * Math.sin(radEnd);
                const pathData = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
                const textAngle = startAngle + sliceAngle / 2;
                const radMid = (textAngle - 90) * (Math.PI / 180);
                const textDist = radius * 0.65;
                const tx = radius + textDist * Math.cos(radMid);
                const ty = radius + textDist * Math.sin(radMid);

                return (
                  <g key={idx}>
                    <path
                      d={pathData}
                      fill={WHEEL_COLORS[idx % WHEEL_COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill="#ffffff"
                      fontSize={isCompact ? 10 : 12}
                      fontWeight="bold"
                      fontFamily="Tajawal, sans-serif"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                    >
                      {item.length > 8 ? item.slice(0, 8) + '..' : item}
                    </text>
                  </g>
                );
              })}
            </svg>
          </motion.div>

          {/* Center Hub */}
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-950 border-2 border-amber-400 text-amber-300 font-black text-xs shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition disabled:opacity-60 z-20"
          >
            {isSpinning ? <RotateCw className="animate-spin" size={16} /> : 'دَوِّر'}
          </button>
        </div>
      </div>

      {/* Winner Display */}
      {winner && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-amber-400 text-slate-950 font-black px-4 py-1.5 rounded-xl shadow-lg text-sm flex items-center gap-2 arabic-font"
        >
          <Sparkles size={16} />
          <span>الفائز: {winner} 🎉</span>
        </motion.div>
      )}

      {/* Item Manager for expanded mode */}
      {!isCompact && (
        <div className="w-full max-w-xs mt-2 flex flex-col gap-1.5">
          <form onSubmit={handleAddItem} className="flex gap-1">
            <input
              type="text"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              placeholder="أضف اسماً أو كلمة..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white arabic-font focus:outline-none"
            />
            <button
              type="submit"
              className="bg-amber-400 text-slate-950 px-2 py-1 rounded-lg text-xs font-bold hover:bg-amber-300 transition"
            >
              <Plus size={14} />
            </button>
          </form>

          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scroll p-1">
            {items.map((it, i) => (
              <span key={i} className="bg-white/10 px-2 py-0.5 rounded-md text-[10px] text-white flex items-center gap-1">
                {it}
                {items.length > 2 && (
                  <button onClick={() => handleRemoveItem(i)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={10} />
                  </button>
                )}
              </span>
            ))}
          </div>

          {onInsertToBoard && (
            <button
              onClick={() => onInsertToBoard(items)}
              className="mt-1 w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-1.5 px-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1"
            >
              <Plus size={14} />
              <span>إدراج العجلة في السبورة</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
