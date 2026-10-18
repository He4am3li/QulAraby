import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Pipette, 
  Check
} from 'lucide-react';
import { CalligraphyToolFigure } from './CalligraphyToolFigure';
import { 
  InkEffectType, 
  InkStyleConfig, 
  CalligraphyPenNibId,
  CALLIGRAPHY_PEN_NIBS,
  InkFinishId,
  INK_FINISH_PRESETS,
  generateFinishGradient,
  generateFinishShadow,
  getCalligraphyPenDynamics
} from './calligraphyStudioData';

interface MacDesignColorPickerProps {
  currentColor: string;
  isGoldFoil?: boolean;
  currentEffect?: InkEffectType;
  currentPenNib?: CalligraphyPenNibId;
  currentFinish?: InkFinishId;
  onSelectColor: (color: string, effectConfig?: InkStyleConfig) => void;
  onToggleGold?: (isGold: boolean) => void;
  onClose?: () => void;
}

// 10 Classic Calligraphy Heritage Inks
const HERITAGE_INKS = [
  { id: 'c_charcoal', name: 'سواد الليل الفحمي', color: '#141416' },
  { id: 'c_walnut', name: 'مداد الجوز التراثي', color: '#4a2c11' },
  { id: 'c_ruby', name: 'ياقوت قرمزي دمشقي', color: '#991b1b' },
  { id: 'c_lapis', name: 'لازوردي سلطاني', color: '#1e3a8a' },
  { id: 'c_emerald', name: 'زمرد قرطبي أندلسي', color: '#065f46' },
  { id: 'c_burgundy', name: 'عنابي فاطمي خمري', color: '#701a35' },
  { id: 'c_ochre_gold', name: 'خردلي ذهبي عتيق', color: '#d97706' },
  { id: 'c_silk_white', name: 'أبيض حريري ناصع', color: '#f8fafc' },
  { id: 'c_graphite', name: 'رصاصي غرافيتي', color: '#64748b' },
  { id: 'c_imperial_purple', name: 'بنفسجي إمبراطوري', color: '#6b21a8' }
];

// Helper: HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Helper: Hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  if (!hex || hex === 'gold_metallic' || !hex.startsWith('#')) {
    return { h: 43, s: 65, l: 52 };
  }
  let c = hex.slice(1);
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Helper: Hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 30, g: 58, b: 138 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export const MacDesignColorPicker: React.FC<MacDesignColorPickerProps> = ({
  currentColor,
  isGoldFoil = false,
  currentEffect = 'matte_ink',
  currentPenNib = 'reed_qalam',
  currentFinish,
  onSelectColor
}) => {
  // 1. Pen Nib Selection
  const [selectedNibId, setSelectedNibId] = useState<CalligraphyPenNibId>(currentPenNib);

  useEffect(() => {
    if (currentPenNib && currentPenNib !== selectedNibId) {
      setSelectedNibId(currentPenNib);
    }
  }, [currentPenNib]);

  // 2. Color HSL State
  const initialHsl = hexToHsl(currentColor);
  const [hue, setHue] = useState(initialHsl.h);
  const [sat, setSat] = useState(initialHsl.s);
  const [lightness, setLightness] = useState(initialHsl.l);

  // 3. Material Finish Selection
  const [selectedFinishId, setSelectedFinishId] = useState<InkFinishId>(() => {
    if (currentFinish) return currentFinish;
    if (isGoldFoil) return 'royal_gold';
    if (currentEffect === 'ornate_foil') return 'royal_gold';
    if (currentEffect === 'colored_pencil') return 'carbon_grain';
    if (currentEffect === 'crystal_glow') return 'gloss_enamel';
    if (currentEffect === 'liquid_watercolor') return 'watercolor_wash';
    return 'pure_matte';
  });

  // 4. Artisan Fine Tuning
  const [flowOpacity, setFlowOpacity] = useState<number>(100);
  const [sheenIntensity, setSheenIntensity] = useState<number>(85);
  const [is3dEmboss, setIs3dEmboss] = useState<boolean>(false);

  // 5. Computed active hex & RGB
  const activeHex = hslToHex(hue, sat, lightness);
  const activeRgb = hexToRgb(activeHex);

  // Canvas ref for 2D Saturation / Value matrix
  const matrixCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingMatrix = useRef<boolean>(false);

  // Update parent when color or parameters change
  const notifyChanges = useCallback((
    newColor: string, 
    newNib: CalligraphyPenNibId, 
    newFinish: InkFinishId,
    newFlow: number,
    newSheen: number,
    newEmboss: boolean
  ) => {
    const finishObj = INK_FINISH_PRESETS.find(f => f.id === newFinish) || INK_FINISH_PRESETS[0];
    const gradient = generateFinishGradient(newFinish, newColor);
    const textShadow = generateFinishShadow(newFinish, newColor, newEmboss);

    const config: InkStyleConfig = {
      color: newColor,
      effect: finishObj.effectType,
      gradient,
      textShadow,
      name: finishObj.name,
      penNibId: newNib,
      finishId: newFinish,
      flowOpacity: newFlow / 100,
      sheenIntensity: newSheen / 100,
      is3dEmboss: newEmboss
    };

    onSelectColor(newColor, config);
  }, [onSelectColor]);

  // Handle Pen Nib Click
  const handleSelectNib = (nibId: CalligraphyPenNibId) => {
    setSelectedNibId(nibId);
    const nibObj = CALLIGRAPHY_PEN_NIBS.find(n => n.id === nibId);
    // If nib has a natural default finish and user is currently on pure matte, upgrade smoothly
    let targetFinish = selectedFinishId;
    if (selectedFinishId === 'pure_matte' && nibObj && nibObj.defaultFinish !== 'pure_matte') {
      targetFinish = nibObj.defaultFinish;
      setSelectedFinishId(targetFinish);
    }
    notifyChanges(activeHex, nibId, targetFinish, flowOpacity, sheenIntensity, is3dEmboss);
  };

  // Handle Material Finish Click
  const handleSelectFinish = (finishId: InkFinishId) => {
    setSelectedFinishId(finishId);
    notifyChanges(activeHex, selectedNibId, finishId, flowOpacity, sheenIntensity, is3dEmboss);
  };

  // Handle Quick Heritage Swatch Click
  const handleSelectSwatch = (hex: string) => {
    const h = hexToHsl(hex);
    setHue(h.h);
    setSat(h.s);
    setLightness(h.l);
    notifyChanges(hex, selectedNibId, selectedFinishId, flowOpacity, sheenIntensity, is3dEmboss);
  };

  // Draw 2D Saturation / Value Matrix
  const drawMatrix = useCallback(() => {
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Base color gradient (White to Pure Hue horizontally)
    const pureHueHex = hslToHex(hue, 100, 50);
    const horizGrad = ctx.createLinearGradient(0, 0, width, 0);
    horizGrad.addColorStop(0, '#ffffff');
    horizGrad.addColorStop(1, pureHueHex);
    ctx.fillStyle = horizGrad;
    ctx.fillRect(0, 0, width, height);

    // Black vertical gradient overlay (Transparent top to Black bottom)
    const vertGrad = ctx.createLinearGradient(0, 0, 0, height);
    vertGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vertGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = vertGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw Crosshair Indicator
    // Calculate approximate position from sat (0-100) and lightness (0-100)
    // Approximate HSV to HSL mapping for rendering
    const v = lightness + (sat * Math.min(lightness, 100 - lightness)) / 100;
    const sVal = v === 0 ? 0 : 2 * (1 - lightness / v);
    const x = Math.max(4, Math.min(width - 4, (sVal) * width));
    const y = Math.max(4, Math.min(height - 4, (1 - v / 100) * height));

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.strokeStyle = lightness > 50 ? '#000000' : '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.strokeStyle = activeHex;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }, [hue, sat, lightness, activeHex]);

  useEffect(() => {
    drawMatrix();
  }, [drawMatrix]);

  // Handle Drag on 2D Matrix
  const handleMatrixMove = (clientX: number, clientY: number) => {
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    // Convert (x, y) to Saturation and Lightness
    const sNorm = x / rect.width;
    const vNorm = 1 - (y / rect.height);

    // Convert HSV to HSL
    const lNorm = vNorm * (1 - sNorm / 2);
    const sHsl = lNorm === 0 || lNorm === 1 ? 0 : (vNorm - lNorm) / Math.min(lNorm, 1 - lNorm);

    const newSat = Math.round(Math.max(0, Math.min(100, sHsl * 100)));
    const newLit = Math.round(Math.max(0, Math.min(100, lNorm * 100)));

    setSat(newSat);
    setLightness(newLit);

    const newHex = hslToHex(hue, newSat, newLit);
    notifyChanges(newHex, selectedNibId, selectedFinishId, flowOpacity, sheenIntensity, is3dEmboss);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingMatrix.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleMatrixMove(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingMatrix.current) {
      handleMatrixMove(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingMatrix.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // Eyedropper API
  const handleEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          handleSelectSwatch(result.sRGBHex);
        }
      } catch {
        // User cancelled or unsupported
      }
    }
  };

  // Direct Hex Input Change
  const handleHexInputChange = (val: string) => {
    let clean = val.trim();
    if (!clean.startsWith('#')) clean = '#' + clean;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      const h = hexToHsl(clean);
      setHue(h.h);
      setSat(h.s);
      setLightness(h.l);
      notifyChanges(clean, selectedNibId, selectedFinishId, flowOpacity, sheenIntensity, is3dEmboss);
    }
  };

  // Active Nib Object & Finish Object
  const currentNibObj = CALLIGRAPHY_PEN_NIBS.find(n => n.id === selectedNibId) || CALLIGRAPHY_PEN_NIBS[0];
  const currentFinishObj = INK_FINISH_PRESETS.find(f => f.id === selectedFinishId) || INK_FINISH_PRESETS[0];
  const activeGradient = generateFinishGradient(selectedFinishId, activeHex);
  const activeShadow = generateFinishShadow(selectedFinishId, activeHex, is3dEmboss);

  return (
    <div className="w-full flex flex-col gap-3 p-1 font-tajawal select-none" dir="rtl">

      {/* ========================================================================= */}
      {/* 1. SELECTION STEP 1: CALLIGRAPHY PEN NIB (أدوات وأقلام الخط العربي المستوحاة من الصورة) */}
      {/* ========================================================================= */}
      <div className="w-full bg-white rounded-2xl p-2.5 border border-amber-900/10 shadow-xs flex flex-col gap-2">
        {/* Studio Tool Rack (منصة أقلام الخطاط الاحترافية - السحب والوقوف يظهر الاسم فقط) */}
        <div className="relative w-full bg-gradient-to-b from-stone-50 via-amber-50/20 to-stone-100/80 rounded-xl p-2 border border-stone-200/80 shadow-inner">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 items-end">
            {CALLIGRAPHY_PEN_NIBS.map((nib) => {
              const isSelected = selectedNibId === nib.id;
              return (
                <button
                  key={nib.id}
                  type="button"
                  onClick={() => handleSelectNib(nib.id)}
                  className={`group relative flex flex-col items-center justify-center pt-2 pb-2 px-0.5 sm:px-1 rounded-xl transition-all duration-200 cursor-pointer text-center select-none ${
                    isSelected
                      ? 'bg-gradient-to-b from-white to-amber-50/90 border-2 border-amber-600 shadow-md -translate-y-1 z-10'
                      : 'bg-white/70 hover:bg-white border border-stone-200/70 hover:border-amber-300/80 hover:-translate-y-0.5 hover:shadow-sm'
                  }`}
                  title={nib.name}
                >
                  {/* Tool Silhouette Visual (مطابق تماماً للقلم في الصورة) */}
                  <div className="w-full h-20 sm:h-24 flex items-center justify-center relative px-0.5">
                    <CalligraphyToolFigure
                      toolId={nib.id}
                      isSelected={isSelected}
                      className="w-full h-full"
                    />

                    {/* Selection Glow and Check Badge */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-700 text-white flex items-center justify-center shadow-xs ring-2 ring-white">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SELECTION STEP 2: COLOR CORE (المصفوفة الحرة والألوان) */}
      {/* ========================================================================= */}
      <div className="w-full bg-white rounded-2xl p-2.5 border border-amber-900/10 shadow-xs flex flex-col gap-2.5">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            {/* Color Chip Preview */}
            <div 
              className="w-5 h-5 rounded-md border border-black/20 shadow-2xs"
              style={{ backgroundColor: activeHex }}
            />
            {/* Hex Input */}
            <input
              type="text"
              value={activeHex}
              onChange={(e) => handleHexInputChange(e.target.value)}
              className="w-19 px-1.5 py-0.5 bg-slate-50 border border-slate-300 rounded-md text-[11px] font-mono font-bold text-center text-slate-800 focus:bg-white focus:outline-none focus:border-amber-700"
            />
            {/* Eyedropper Button */}
            <button
              type="button"
              onClick={handleEyeDropper}
              className="p-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 rounded-md transition cursor-pointer"
              title="شفط لون من الشاشة"
            >
              <Pipette size={13} />
            </button>
          </div>
        </div>

        {/* 10 Heritage Classic Arabic Ink Chips */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-0.5">
          {HERITAGE_INKS.map(swatch => {
            const isCurrent = activeHex.toLowerCase() === swatch.color.toLowerCase();
            return (
              <button
                key={swatch.id}
                type="button"
                onClick={() => handleSelectSwatch(swatch.color)}
                className={`w-7 h-7 rounded-lg shrink-0 transition-all cursor-pointer relative shadow-2xs flex items-center justify-center ${
                  isCurrent ? 'ring-2 ring-amber-600 scale-110 z-10' : 'hover:scale-105 border border-black/10'
                }`}
                style={{ backgroundColor: swatch.color }}
                title={swatch.name}
              >
                {isCurrent && (
                  <Check size={12} className={swatch.id === 'c_silk_white' ? 'text-black' : 'text-white'} />
                )}
              </button>
            );
          })}
        </div>

        {/* 2D Saturation/Value Matrix Canvas */}
        <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-inner border border-slate-200 cursor-crosshair">
          <canvas
            ref={matrixCanvasRef}
            width={340}
            height={128}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full h-full block"
          />
        </div>

        {/* Hue Rainbow Spectrum Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 shrink-0">الطيف:</span>
          <div className="relative flex-1 h-3 rounded-full overflow-hidden border border-slate-300/80 shadow-inner">
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={(e) => {
                const newHue = Number(e.target.value);
                setHue(newHue);
                const newHex = hslToHex(newHue, sat, lightness);
                notifyChanges(newHex, selectedNibId, selectedFinishId, flowOpacity, sheenIntensity, is3dEmboss);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="w-full h-full"
              style={{
                background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
              }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-600 shrink-0 w-7 text-left">
            {hue}°
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SELECTION STEP 3: INK FINISH CARDS */}
      {/* ========================================================================= */}
      <div className="w-full bg-white rounded-2xl p-2.5 border border-amber-900/10 shadow-xs">
        {/* 6 High-End Finish Cards (3x2 Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {INK_FINISH_PRESETS.map((finish) => {
            const isSelected = selectedFinishId === finish.id;
            const finishGrad = generateFinishGradient(finish.id, activeHex);

            return (
              <button
                key={finish.id}
                type="button"
                onClick={() => handleSelectFinish(finish.id)}
                className={`relative p-2 rounded-xl border text-right transition-all cursor-pointer active:scale-95 flex flex-col justify-between min-h-[58px] ${
                  isSelected 
                    ? 'bg-amber-50/90 border-amber-700 ring-2 ring-amber-700/20 shadow-xs' 
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-full bg-amber-800 text-white flex items-center justify-center shadow-xs">
                    <Check size={9} />
                  </div>
                )}

                {/* Swatch Sample with Finish applied */}
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-5 h-5 rounded-md border border-black/15 shadow-2xs relative overflow-hidden shrink-0"
                    style={{
                      backgroundColor: activeHex,
                      backgroundImage: finishGrad
                    }}
                  >
                    {finish.id === 'royal_gold' && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/30 to-yellow-100/60 pointer-events-none" />
                    )}
                    {finish.id === 'gloss_enamel' && (
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/40 rounded-t-md pointer-events-none" />
                    )}
                    {finish.id === 'carbon_grain' && (
                      <div className="absolute inset-0 bg-black/15 mix-blend-overlay pointer-events-none" />
                    )}
                  </div>

                  <span className={`text-[11px] font-black leading-tight ${isSelected ? 'text-amber-950' : 'text-slate-800'}`}>
                    {finish.name}
                  </span>
                </div>

                <span className="text-[9px] text-slate-500 font-semibold line-clamp-1">
                  {finish.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SELECTION STEP 4: FLOW & SHEEN SLIDERS */}
      {/* ========================================================================= */}
      <div className="w-full bg-slate-50/90 rounded-2xl p-2.5 border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-2 gap-3">
          {/* Ink Flow / Opacity */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
              <span>كثافة وتدفق الحبر:</span>
              <span className="font-mono text-amber-900">{flowOpacity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={flowOpacity}
              onChange={(e) => {
                const nextFlow = Number(e.target.value);
                setFlowOpacity(nextFlow);
                notifyChanges(activeHex, selectedNibId, selectedFinishId, nextFlow, sheenIntensity, is3dEmboss);
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-amber-800"
            />
          </div>

          {/* Sheen / Glow Intensity */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
              <span>قوة اللمعان والتأثير:</span>
              <span className="font-mono text-amber-900">{sheenIntensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sheenIntensity}
              onChange={(e) => {
                const nextSheen = Number(e.target.value);
                setSheenIntensity(nextSheen);
                notifyChanges(activeHex, selectedNibId, selectedFinishId, flowOpacity, nextSheen, is3dEmboss);
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-amber-800"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
