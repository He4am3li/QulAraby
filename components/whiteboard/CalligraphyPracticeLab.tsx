import React, { useEffect, useRef, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';

interface CalligraphyPracticeLabProps {
  onClose: () => void;
}

const LETTERS = [
  { letter: 'ا', tip: 'ابدأ من أعلى، وانزل بخط مستقيم ومتزن.' },
  { letter: 'ب', tip: 'ارسم جسم الباء أولًا، ثم ضع النقطة أسفله.' },
  { letter: 'ن', tip: 'وازن بين انحناءة النون وموضع النقطة أعلاها.' },
  { letter: 'س', tip: 'لاحظ الأسنان الثلاثة واتساع نهاية الحرف.' },
  { letter: 'م', tip: 'ابدأ برأس الميم، ثم حافظ على انسياب السطر.' },
  { letter: 'ع', tip: 'لاحظ فتحة رأس العين وانحناء نهايتها.' },
  { letter: 'و', tip: 'كوّن الرأس الدائري، ثم أضف الذيل المنحني.' },
  { letter: 'ي', tip: 'اتبع الانحناءة أولًا، ثم أضف النقطتين أسفل الحرف.' },
] as const;

const W = 440;
const H = 300;
const STORAGE_KEY = 'qul_calligraphy_letter_practice_v1';

const drawGlyph = (context: CanvasRenderingContext2D, letter: string, fill: string) => {
  context.save();
  context.font = 'bold 238px "Amiri", "Noto Naskh Arabic", serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = fill;
  context.fillText(letter, W / 2, H / 2 + 6);
  context.restore();
};

const getPoint = (event: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
  const bounds = event.currentTarget.getBoundingClientRect();
  return {
    x: ((event.clientX - bounds.left) / bounds.width) * W,
    y: ((event.clientY - bounds.top) / bounds.height) * H
  };
};

/**
 * An actual pointer/stylus tracing activity, not a font-change or reveal animation.
 * The similarity estimate checks geometric overlap only. It is not expert assessment
 * of stroke order, pen angle, or classical calligraphic proportions.
 */
const CalligraphyPracticeLab: React.FC<CalligraphyPracticeLabProps> = ({ onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [strokes, setStrokes] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [best, setBest] = useState<Record<string, number>>(() => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch {
      return {};
    }
  });
  const guideRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const activePointer = useRef<number | null>(null);
  const movedRef = useRef(false);
  const item = LETTERS[activeIndex];

  useEffect(() => {
    let active = true;
    const render = () => {
      if (!active) return;
      const canvas = guideRef.current;
      const context = canvas?.getContext('2d');
      if (!context) return;
      context.clearRect(0, 0, W, H);
      context.strokeStyle = 'rgba(135,107,66,.2)';
      context.setLineDash([5, 9]);
      context.beginPath();
      context.moveTo(18, H * .72);
      context.lineTo(W - 18, H * .72);
      context.stroke();
      context.setLineDash([]);
      drawGlyph(context, item.letter, 'rgba(107,84,54,.23)');
    };
    render();
    document.fonts?.ready.then(render).catch(() => {});
    return () => { active = false; };
  }, [item.letter]);

  const clearInk = () => {
    inkRef.current?.getContext('2d')?.clearRect(0, 0, W, H);
    activePointer.current = null;
    movedRef.current = false;
    setStrokes(0);
    setScore(null);
  };

  const selectLetter = (index: number) => {
    setActiveIndex(index);
    clearInk();
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== null) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointer.current = event.pointerId;
    const ctx = event.currentTarget.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPoint(event);
    ctx.strokeStyle = '#633b19';
    ctx.fillStyle = '#633b19';
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.arc(x, y, 5.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
    movedRef.current = false;
    setScore(null);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== event.pointerId) return;
    event.preventDefault();
    const ctx = event.currentTarget.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    movedRef.current = true;
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== event.pointerId) return;
    activePointer.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setStrokes(value => value + 1);
  };

  const evaluate = () => {
    const inkCtx = inkRef.current?.getContext('2d');
    if (!inkCtx || strokes === 0) return;
    const mask = document.createElement('canvas');
    mask.width = W;
    mask.height = H;
    const ctx = mask.getContext('2d');
    if (!ctx) return;
    drawGlyph(ctx, item.letter, '#000000');
    const template = ctx.getImageData(0, 0, W, H).data;
    const ink = inkCtx.getImageData(0, 0, W, H).data;
    const STEP = 5;
    const TOLERANCE = 16;
    const near = (pixels: Uint8ClampedArray, x: number, y: number) => {
      for (let dy = -TOLERANCE; dy <= TOLERANCE; dy += 4) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -TOLERANCE; dx <= TOLERANCE; dx += 4) {
          if (dx * dx + dy * dy > TOLERANCE * TOLERANCE) continue;
          const xx = x + dx;
          if (xx < 0 || xx >= W) continue;
          if (pixels[(yy * W + xx) * 4 + 3] > 90) return true;
        }
      }
      return false;
    };
    let guideTotal = 0;
    let guideCovered = 0;
    let inkTotal = 0;
    let inkPrecise = 0;
    for (let y = STEP; y < H - STEP; y += STEP) {
      for (let x = STEP; x < W - STEP; x += STEP) {
        const alpha = (y * W + x) * 4 + 3;
        if (template[alpha] > 90) {
          guideTotal++;
          if (near(ink, x, y)) guideCovered++;
        }
        if (ink[alpha] > 90) {
          inkTotal++;
          if (near(template, x, y)) inkPrecise++;
        }
      }
    }
    const coverage = guideTotal > 0 ? guideCovered / guideTotal : 0;
    const precision = inkTotal > 0 ? inkPrecise / inkTotal : 0;
    const estimate = Math.max(0, Math.min(100, Math.round((coverage * .7 + precision * .3) * 100)));
    setScore(estimate);
    if (estimate > (best[item.letter] || 0)) {
      const updated = { ...best, [item.letter]: estimate };
      setBest(updated);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* practice can continue */ }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-5 bg-[#060809]/90 backdrop-blur-xl" dir="rtl">
      <section
        aria-label="التدريب على الخط العربي"
        className="w-full max-w-3xl max-h-[98dvh] overflow-hidden rounded-2xl sm:rounded-3xl border border-[#c8a566]/45 bg-gradient-to-br from-[#17232a] via-[#101719] to-[#18271e] text-[#f9f1e4] p-3 sm:p-6 shadow-[0_25px_90px_rgba(0,0,0,.7)] flex flex-col items-center gap-2 sm:gap-3"
      >
        <div className="w-full flex justify-between items-start gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-black font-tajawal text-white">تدرّب على الخط بيدك</h2>
            <p className="text-[11px] sm:text-sm text-[#d1c4ad]">اتبع مسار الحرف بإصبعك أو بالقلم الرقمي، ثم قيّم محاولتك.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق التدريب"
            className="shrink-0 p-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white">
            <X size={19} />
          </button>
        </div>

        <div className="w-full flex items-center justify-center flex-wrap gap-1.5">
          {LETTERS.map((letter, index) => (
            <button key={letter.letter} type="button" onClick={() => selectLetter(index)}
              aria-pressed={activeIndex === index}
              className={`w-8 sm:w-11 h-8 sm:h-10 rounded-lg sm:rounded-xl border font-amiri text-lg sm:text-2xl transition ${activeIndex === index
                ? 'bg-[#e1c187] border-[#ffdf9a] text-[#201810] shadow-md'
                : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'}`}>
              {letter.letter}
            </button>
          ))}
        </div>

        <div className="w-full max-w-[440px] flex flex-col gap-1.5">
          <p className="text-xs sm:text-sm text-center text-[#e9d4a6]">{item.tip}</p>
          <div className="relative aspect-[22/15] rounded-2xl overflow-hidden border-2 border-[#c8ab7b]/60 bg-[#fcf6e8] shadow-inner select-none">
            <canvas ref={guideRef} width={W} height={H} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" />
            <canvas ref={inkRef} width={W} height={H}
              role="img" aria-label={`مساحة لتتبّع حرف ${item.letter} بالإصبع أو القلم`}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove}
              onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
              className="absolute inset-0 w-full h-full cursor-crosshair" style={{ touchAction: 'none' }} />
          </div>
        </div>

        <div className="w-full max-w-[440px] flex items-center justify-between gap-3 text-xs sm:text-sm">
          <span className="text-[#d1c4ad]">أفضل محاولة: <strong className="text-[#f1d18c]">{best[item.letter] ?? '—'}{typeof best[item.letter] === 'number' ? '%' : ''}</strong></span>
          <span className="text-[#d1c4ad]">{strokes} ضربات مرسومة</span>
        </div>

        {score !== null && (
          <div role="status" className="w-full max-w-[440px] flex items-center gap-3 rounded-xl border border-[#bfa77d]/35 bg-white/5 p-2">
            <Check size={17} className="text-[#e5c685] shrink-0" />
            <p className="text-xs sm:text-sm flex-1">
              تطابق تقريبي <strong className="text-[#f1d18c]">{score}%</strong>،
              {score >= 75 ? ' اقتربت من الشكل النموذجي.' : ' حاول تتبّع جسم الحرف بشكل أهدأ.'}
            </p>
          </div>
        )}

        <div className="w-full max-w-[440px] flex gap-2">
          <button type="button" onClick={clearInk}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 sm:py-3 border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold">
            <RotateCcw size={16} /> مسح
          </button>
          <button type="button" onClick={evaluate} disabled={strokes === 0}
            className="flex-1 rounded-xl px-3 py-2 sm:py-3 border border-[#f6d78c] bg-gradient-to-l from-[#d5b069] to-[#f3d897] text-[#38240a] hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-black">
            تقييم المحاولة
          </button>
          <button type="button" onClick={() => selectLetter((activeIndex + 1) % LETTERS.length)}
            className="flex-1 rounded-xl px-3 py-2 sm:py-3 border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold">
            الحرف التالي
          </button>
        </div>
        <p className="text-[10px] text-center text-white/50">التقييم يقارن مواضع الحبر بالشكل النموذجي فقط، ولا يحكم على ترتيب الضربات أو زاوية القلم.</p>
      </section>
    </div>
  );
};

export default CalligraphyPracticeLab;
