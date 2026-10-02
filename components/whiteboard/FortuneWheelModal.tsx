import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Trophy, RotateCcw, Volume2, UserCheck, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FortuneWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: { id: string; name: string; score: number }[];
  words: string[];
  onSelectStudent?: (studentId: string) => void;
}

export const FortuneWheelModal: React.FC<FortuneWheelModalProps> = ({
  isOpen,
  onClose,
  students,
  words,
  onSelectStudent
}) => {
  const [wheelType, setWheelType] = useState<'students' | 'words' | 'letters' | 'activities'>('students');
  const [items, setItems] = useState<string[]>([]);
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);

  const ARABIC_LETTERS = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'];
  const ACTIVITIES = ['تحدث عن وظيفة أحلامك', 'كوّن جملة بالماضي', 'اقرأ الكلمة بالتشكيل', 'استخرج اسماً وفعلاً', 'ترجم إلى الإنجليزية', 'صوت جميل بالحروف', 'سؤال التحدي السريع'];

  useEffect(() => {
    if (wheelType === 'students') {
      const studentNames = students.map(s => s.name);
      setItems(studentNames.length > 0 ? studentNames : ['أحمد', 'سارة', 'علي', 'فاطمة', 'عمر', 'نورة', 'يوسف']);
    } else if (wheelType === 'words') {
      setItems(words.length > 0 ? words : ['السفر', 'الوظيفة', 'المستقبل', 'النجاح', 'الطموح', 'الكتاب', 'الوطن']);
    } else if (wheelType === 'letters') {
      setItems(ARABIC_LETTERS.slice(0, 12));
    } else if (wheelType === 'activities') {
      setItems(ACTIVITIES);
    }
    setRemovedItems([]);
    setSelectedWinner(null);
  }, [wheelType, students, words]);

  const activeItems = items.filter(it => !removedItems.includes(it));

  const colors = [
    '#059669', '#0284c7', '#d97706', '#dc2626', '#7c3aed', 
    '#0891b2', '#db2777', '#475569', '#10b981', '#6366f1'
  ];

  const spinWheel = () => {
    if (isSpinning || activeItems.length === 0) return;
    setIsSpinning(true);
    setSelectedWinner(null);

    const fullSpins = 5 + Math.floor(Math.random() * 4);
    const randomIndex = Math.floor(Math.random() * activeItems.length);
    const segmentAngle = 360 / activeItems.length;
    const targetAngle = fullSpins * 360 + (360 - (randomIndex * segmentAngle + segmentAngle / 2));

    setRotationAngle(prev => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const winner = activeItems[randomIndex];
      setSelectedWinner(winner);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 4000);
  };

  const handleRemoveWinner = () => {
    if (selectedWinner) {
      setRemovedItems(prev => [...prev, selectedWinner]);
      setSelectedWinner(null);
    }
  };

  const handleReset = () => {
    setRemovedItems([]);
    setSelectedWinner(null);
    setRotationAngle(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 w-full max-w-2xl shadow-2xl text-slate-800 relative overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-sm">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black arabic-font text-slate-900 flex items-center gap-2">
                عجلة قُل التفاعلية 🎡
              </h2>
              <p className="text-xs text-slate-500 font-medium">اختيار عشوائي عادل وممتع للطلاب والكلمات والأنشطة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Wheel Type Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-5 bg-slate-100/80 p-1.5 rounded-2xl">
          {[
            { id: 'students', label: 'أسماء الطلاب 👨‍🎓' },
            { id: 'words', label: 'صندوق الكلمات 📚' },
            { id: 'letters', label: 'الحروف العربية 🔤' },
            { id: 'activities', label: 'أنشطة وتحديات ⚡' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setWheelType(tab.id as any)}
              className={`py-2 px-2 text-xs sm:text-sm font-bold rounded-xl transition-all arabic-font ${
                wheelType === tab.id
                  ? 'bg-white text-amber-700 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Wheel Visual & Controls Area */}
        <div className="flex flex-col md:flex-row items-center gap-6 justify-center my-2">
          {/* Wheel Graphic */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 shrink-0 flex items-center justify-center">
            {/* Top Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-500 drop-shadow-md" />

            {/* Rotating Wheel Canvas / SVG */}
            <motion.div
              animate={{ rotate: rotationAngle }}
              transition={{ duration: 4, ease: [0.2, 0.8, 0.2, 1] }}
              className="w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden relative"
            >
              <svg viewBox="0 0 300 300" className="w-full h-full">
                {activeItems.map((item, idx) => {
                  const angle = 360 / activeItems.length;
                  const startAngle = idx * angle;
                  const endAngle = (idx + 1) * angle;
                  const radStart = (startAngle * Math.PI) / 180;
                  const radEnd = (endAngle * Math.PI) / 180;

                  const x1 = 150 + 148 * Math.sin(radStart);
                  const y1 = 150 - 148 * Math.cos(radStart);
                  const x2 = 150 + 148 * Math.sin(radEnd);
                  const y2 = 150 - 148 * Math.cos(radEnd);

                  const pathD = `M 150,150 L ${x1},${y1} A 148,148 0 0,1 ${x2},${y2} Z`;
                  const textAngle = startAngle + angle / 2;

                  return (
                    <g key={idx}>
                      <path
                        d={pathD}
                        fill={colors[idx % colors.length]}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <g transform={`rotate(${textAngle}, 150, 150)`}>
                        <text
                          x="150"
                          y="45"
                          fill="#ffffff"
                          fontSize={activeItems.length > 8 ? "11" : "13"}
                          fontWeight="bold"
                          textAnchor="middle"
                          className="arabic-font drop-shadow-sm"
                          transform="rotate(90, 150, 45)"
                        >
                          {item.length > 12 ? item.substring(0, 10) + '..' : item}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* Center Hub */}
              <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white border-4 border-amber-400 shadow-md flex items-center justify-center">
                <span className="text-xs font-black text-amber-700 arabic-font">قُل</span>
              </div>
            </motion.div>
          </div>

          {/* Action & Result Box */}
          <div className="flex-1 w-full flex flex-col justify-between space-y-4">
            {/* Winner Display Card */}
            <div className="bg-gradient-to-br from-amber-50 via-orange-50/40 to-slate-50 border border-amber-200/80 rounded-2xl p-4 text-center min-h-[120px] flex flex-col items-center justify-center">
              {selectedWinner ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-1.5"
                >
                  <div className="text-xs text-amber-700 font-bold flex items-center justify-center gap-1">
                    <Trophy size={16} className="text-amber-500" />
                    <span>الاختيار الفائز:</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 arabic-font">
                    {selectedWinner}
                  </div>
                  <button
                    onClick={handleRemoveWinner}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline mt-1 block"
                  >
                    استبعاد من الجولات القادمة
                  </button>
                </motion.div>
              ) : (
                <div className="text-slate-400 text-xs font-medium">
                  {isSpinning ? 'العجلة تدور الآن...' : 'اضغط على زر التدوير للبدء 🎯'}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-2">
              <button
                onClick={spinWheel}
                disabled={isSpinning || activeItems.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white rounded-2xl font-black text-base arabic-font flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
              >
                <Sparkles size={18} />
                <span>{isSpinning ? 'جارٍ التدوير...' : 'تدوير العجلة الآن 🎲'}</span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1">
                <span>العناصر المتبقية: {activeItems.length}</span>
                <button
                  onClick={handleReset}
                  className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 transition"
                >
                  <RotateCcw size={12} />
                  إعادة ضبط الكل
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
