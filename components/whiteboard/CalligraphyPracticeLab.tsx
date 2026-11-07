import React, { useEffect, useRef, useState } from 'react';
import { Check, RotateCcw, X, MoveDownRight, Eye, EyeOff } from 'lucide-react';
import { auth } from '../../firebase';

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

// Guided first movements for this beginner's exercise, intentionally separate
// from classical calligraphy instruction which needs a qualified teacher.
const START_GUIDES: Record<string, { start: [number, number]; end: [number, number]; text: string }> = {
  'ا': { start: [235, 75], end: [230, 213], text: 'ابدأ من أعلى وتحرك إلى الأسفل.' },
  'ب': { start: [337, 183], end: [109, 198], text: 'ابدأ من يمين جسم الباء نحو اليسار، ثم أضف النقطة.' },
  'ن': { start: [324, 165], end: [138, 186], text: 'ابدأ من اليمين متجهًا لليسار، ثم أضف النقطة.' },
  'س': { start: [341, 171], end: [130, 199], text: 'ابدأ من جهة اليمين واتجه لليسار عبر الأسنان.' },
  'م': { start: [285, 120], end: [189, 212], text: 'راقب رأس الميم واتجاه الانحناء.' },
  'ع': { start: [297, 119], end: [158, 215], text: 'اتبع فتحة العين وانحناءها.' },
  'و': { start: [275, 117], end: [162, 209], text: 'ارسم الرأس ثم الذيل نحو الأسفل.' },
  'ي': { start: [337, 164], end: [126, 196], text: 'ابدأ من جهة اليمين لليسار، ثم أضف النقطتين.' }
};

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
  const [directionScore, setDirectionScore] = useState<number | null>(null);
  const [orderFeedback, setOrderFeedback] = useState('');
  const [stylusTilt, setStylusTilt] = useState<number | null>(null);
  const [showMovementGuide, setShowMovementGuide] = useState(true);
  const [best, setBest] = useState<Record<string, number>>(() => {
    try {
      const data = JSON.parse(localStorage.getItem(`${STORAGE_KEY}:${auth.currentUser?.uid || 'guest'}`) || '{}');
      return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch {
      return {};
    }
  });
  const guideRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const activePointer = useRef<number | null>(null);
  const movedRef = useRef(false);
  const recordedStrokes = useRef<Array<Array<{ x: number; y: number }>>>([]);
  const tiltMeasurements = useRef<number[]>([]);
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
    recordedStrokes.current = [];
    tiltMeasurements.current = [];
    setOrderFeedback('');
    setStylusTilt(null);
    setStrokes(0);
    setScore(null);
    setDirectionScore(null);
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
    recordedStrokes.current.push([{ x, y }]);
    if (event.pointerType === 'pen' && (Math.abs(event.tiltX) > 1 || Math.abs(event.tiltY) > 1)) {
      tiltMeasurements.current.push(Math.hypot(event.tiltX, event.tiltY));
    }
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
    setDirectionScore(null);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== event.pointerId) return;
    event.preventDefault();
    const ctx = event.currentTarget.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPoint(event);
    if (event.pointerType === 'pen' && (Math.abs(event.tiltX) > 1 || Math.abs(event.tiltY) > 1)) {
      tiltMeasurements.current.push(Math.hypot(event.tiltX, event.tiltY));
    }
    const currentStroke = recordedStrokes.current[recordedStrokes.current.length - 1];
    if (currentStroke) {
      const previous = currentStroke[currentStroke.length - 1];
      if (!previous || Math.hypot(x - previous.x, y - previous.y) > 2) {
        currentStroke.push({ x, y });
      }
    }
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
    const firstStroke = recordedStrokes.current.find(points => points.length > 1);
    const guide = START_GUIDES[item.letter];
    if (firstStroke && guide) {
      const first = firstStroke[0];
      const last = firstStroke[firstStroke.length - 1];
      const dx = last.x - first.x;
      const dy = last.y - first.y;
      const vx = guide.end[0] - guide.start[0];
      const vy = guide.end[1] - guide.start[1];
      const magnitude = Math.hypot(dx, dy);
      const guideMagnitude = Math.hypot(vx, vy);
      const cosine = magnitude > 10 && guideMagnitude > 0
        ? (dx * vx + dy * vy) / (magnitude * guideMagnitude)
        : -1;
      const angleAlignment = Math.max(0, (cosine + 1) / 2);
      // Starting region is forgiving so this remains basic directional guidance,
      // not a false claim of verifying a master calligrapher's pen position.
      const startDistance = Math.hypot(first.x - guide.start[0], first.y - guide.start[1]);
      const startAlignment = Math.max(0, 1 - startDistance / 150);
      setDirectionScore(Math.round(100 * (.76 * angleAlignment + .24 * startAlignment)));
    } else {
      setDirectionScore(null);
    }
    // A beginner's ordered-stroke hint for dotted letters: first trace the
    // large body, then add the one/two separate short dot strokes.
    const expectedDots: Record<string, number> = { 'ب': 1, 'ن': 1, 'ي': 2 };
    const pathLength = (points: Array<{ x: number; y: number }>) =>
      points.reduce((sum, point, index) => index === 0
        ? sum
        : sum + Math.hypot(point.x - points[index - 1].x, point.y - points[index - 1].y), 0);
    if (expectedDots[item.letter]) {
      const lengths = recordedStrokes.current.map(pathLength);
      const firstBody = lengths.findIndex(length => length > 50);
      const dotsAfter = firstBody >= 0
        ? lengths.slice(firstBody + 1).filter(length => length <= 38).length
        : 0;
      if (firstBody > 0) setOrderFeedback('ترتيب أولي: ابدأ بجسم الحرف قبل رسم النقاط.');
      else if (firstBody < 0) setOrderFeedback('ارسم جسم الحرف كاملًا أولًا، ثم أضف النقاط.');
      else if (dotsAfter < expectedDots[item.letter]) setOrderFeedback('بعد رسم جسم الحرف، جرّب إضافة النقاط بضربات قصيرة منفصلة.');
      else setOrderFeedback('ترتيب أولي جيد: جسم الحرف ثم النقاط.');
    } else {
      setOrderFeedback('استمر في تتبّع حركة الحرف دون رفع القلم أكثر مما يلزم.');
    }
    if (tiltMeasurements.current.length > 2) {
      const values = [...tiltMeasurements.current].sort((a, b) => a - b);
      setStylusTilt(Math.round(values[Math.floor(values.length / 2)]));
    } else {
      setStylusTilt(null);
    }
    if (estimate > (best[item.letter] || 0)) {
      const updated = { ...best, [item.letter]: estimate };
      setBest(updated);
      try { localStorage.setItem(`${STORAGE_KEY}:${auth.currentUser?.uid || 'guest'}`, JSON.stringify(updated)); } catch { /* practice can continue */ }
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
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-[#e9d4a6]">{item.tip}</p>
            <button type="button" onClick={() => setShowMovementGuide(value => !value)}
              aria-pressed={showMovementGuide}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg px-2 py-1 border border-[#d8b873]/45 text-[11px] text-[#f1d18c] hover:bg-white/10">
              {showMovementGuide ? <EyeOff size={13} /> : <Eye size={13} />}
              {showMovementGuide ? 'إخفاء الاتجاه' : 'أظهر الاتجاه'}
            </button>
          </div>
          <div className="relative aspect-[22/15] rounded-2xl overflow-hidden border-2 border-[#c8ab7b]/60 bg-[#fcf6e8] shadow-inner select-none">
            <canvas ref={guideRef} width={W} height={H} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" />
            {showMovementGuide && (
              <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 440 300">
                <defs>
                  <marker id="qul-stroke-arrow" viewBox="0 0 10 10" refX="8" refY="5"
                    markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#087e83" />
                  </marker>
                </defs>
                <circle cx={START_GUIDES[item.letter].start[0]} cy={START_GUIDES[item.letter].start[1]}
                  r="10" fill="#087e83" fillOpacity=".16" stroke="#087e83" strokeWidth="2" />
                <path
                  d={`M ${START_GUIDES[item.letter].start.join(' ')} L ${START_GUIDES[item.letter].end.join(' ')}`}
                  fill="none" stroke="#087e83" strokeWidth="3" strokeDasharray="7 8"
                  strokeLinecap="round" markerEnd="url(#qul-stroke-arrow)" opacity=".75" />
              </svg>
            )}
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
              {orderFeedback && <span className="block text-[#d9c39b] mt-1">{orderFeedback}</span>}
              {stylusTilt !== null && (
                <span className="block text-[#d9c39b] mt-1">
                  ميل القلم الرقمي الملتقط: {stylusTilt}°، وهو لا يساوي زاوية سنّ قلم القصب.
                </span>
              )}
              {directionScore !== null && (
                <span className="block text-[#d9c39b] mt-1">
                  اتجاه الحركة الأولى: {directionScore}% تقريبًا.
                  {directionScore < 60 ? ' جرّب البدء من العلامة الزرقاء واتّبع السهم.' : ' اتجاه البداية جيد، واصل تحسينه.'}
                </span>
              )}
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
        <p className="text-[10px] text-center text-white/50">التقييم يقارن شكل الحبر واتجاه الحركة الأولى، ويقدّم إرشادًا أوليًا لترتيب الجسم والنقاط. لا يقيس جميع قواعد الخط أو زاوية سنّ القصب، ولا يحل محل تصحيح المعلم.</p>
      </section>
    </div>
  );
};

export default CalligraphyPracticeLab;
