import React, { useRef, useState } from 'react';
import { CalligraphyPenNibId } from './calligraphyStudioData';
import { CalligraphyToolFigure } from './CalligraphyToolFigure';

export interface CalligraphyStudioTrayProps {
  activeTab: 'text' | 'font' | 'pen' | 'color' | 'ornament' | 'size' | 'background';
  onSelectTab: (tab: 'text' | 'font' | 'pen' | 'color' | 'ornament' | 'size' | 'background') => void;
  // Pen state
  selectedPen: CalligraphyPenNibId;
  onSelectPen: (pen: CalligraphyPenNibId) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  // Color & Foil state
  selectedInk: string;
  onSelectInk: (color: string) => void;
  isGoldFoil: boolean;
  onToggleGoldFoil: (val: boolean) => void;
  selectedFoilStyle?: string;
  onSelectFoilStyle?: (style: string) => void;
  // Ornament state
  selectedOrnament: string;
  onSelectOrnament: (ornament: string) => void;
  // Background state
  selectedBackground: string;
  onSelectBackground: (bgId: string) => void;
  // Font & text
  selectedFont: string;
  onSelectFont: (font: string) => void;
  // Card size
  selectedSize: string;
  onSelectSize: (size: string) => void;
  // Text input & presets
  quoteText?: string;
  onQuoteTextChange?: (text: string) => void;
}

// ---------------------------------------------------------------------------
// 1. BACKGROUND DEFINITIONS (مطابقة بدقة للصورة ١: الخلفيات الـ ١٠)
// ---------------------------------------------------------------------------
export interface BackgroundOption {
  id: string;
  name: string;
  desc: string;
  isDark: boolean;
  previewBg: string;
  renderThumbnail: React.ReactNode;
}

export const STUDIO_BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: 'parchment_cream',
    name: 'ورق قديم طبيعي',
    desc: 'مخطوط عتيق بألياف طبيعية وأطراف معتقة',
    isDark: false,
    previewBg: '#eee5d6',
    renderThumbnail: (
      <div className="w-full h-full bg-[#eee5d6] relative overflow-hidden" style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 50%, #faf3e8 0%, #ede3d2 65%, #dfd2bd 100%)'
      }}>
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(140, 110, 70, 0.05) 0px, rgba(140, 110, 70, 0.05) 2px, transparent 2px, transparent 6px)'
        }} />
      </div>
    )
  },
  {
    id: 'charcoal_slate',
    name: 'حجر الفحم والرماد',
    desc: 'لوح بازلتي داكن بتدرجات رمادية عميقة',
    isDark: true,
    previewBg: '#1b1d22',
    renderThumbnail: (
      <div className="w-full h-full bg-[#1b1d22] relative overflow-hidden" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #2b2e37 0%, #191b20 70%, #0d0e11 100%)'
      }} />
    )
  },
  {
    id: 'imperial_burgundy',
    name: 'مخمل عنابي سلطاني',
    desc: 'مخمل إمبراطوري غني بألوان الياقوت الخمري',
    isDark: true,
    previewBg: '#2a0c12',
    renderThumbnail: (
      <div className="w-full h-full bg-[#290b10] relative overflow-hidden" style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 50%, #44141d 0%, #290b10 65%, #180508 100%)'
      }} />
    )
  },
  {
    id: 'black_gold_marble',
    name: 'رخام أسود بعروق ذهبية',
    desc: 'رخام أوبسيديان فاحم بشرايين الذهب ۲٤',
    isDark: true,
    previewBg: '#0e0e11',
    renderThumbnail: (
      <div className="w-full h-full bg-[#0c0c0e] relative overflow-hidden">
        {/* Golden Lightning Veins */}
        <svg viewBox="0 0 80 100" className="w-full h-full" fill="none" preserveAspectRatio="none">
          <path d="M15 0 Q25 35 45 45 T70 100" stroke="#f5d066" strokeWidth="1.2" opacity="0.85" />
          <path d="M25 15 L35 30" stroke="#ffd700" strokeWidth="0.8" opacity="0.7" />
          <path d="M45 45 L60 55" stroke="#f5d066" strokeWidth="0.75" opacity="0.8" />
          <path d="M0 70 Q30 80 50 100" stroke="#e5b84c" strokeWidth="0.9" opacity="0.6" />
        </svg>
      </div>
    )
  },
  {
    id: 'antique_leather',
    name: 'جلد عتيق / رق غزال',
    desc: 'جلد مدبوغ بلون الكراميل الدافئ ومسام أصيلة',
    isDark: false,
    previewBg: '#ba9460',
    renderThumbnail: (
      <div className="w-full h-full bg-[#ba9460] relative overflow-hidden" style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 50%, #cfa874 0%, #ba9460 65%, #947141 100%)'
      }} />
    )
  },
  {
    id: 'hammered_gold',
    name: 'تذهيب خالص / رقائق ذهب',
    desc: 'صفائح ذهب خالص بملمس مطروق لامع',
    isDark: false,
    previewBg: '#d4af37',
    renderThumbnail: (
      <div className="w-full h-full bg-gradient-to-br from-[#ffe082] via-[#e6b800] to-[#b38600] relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 20%), radial-gradient(circle, #b8860b 10%, transparent 20%)',
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 4px 4px'
        }} />
      </div>
    )
  },
  {
    id: 'sapphire_night',
    name: 'أزرق ياقوتي داكن',
    desc: 'زرقة لازوردية عميقة ملوكية مع وهج ليلي دافئ',
    isDark: true,
    previewBg: '#0b1626',
    renderThumbnail: (
      <div className="w-full h-full bg-[#081220] relative overflow-hidden" style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 50%, #15243d 0%, #0a1322 70%, #040810 100%)'
      }} />
    )
  },
  {
    id: 'emerald_silk',
    name: 'حرير زمردي ملكي',
    desc: 'حرير أخضر ملكي بطيات ضوئية انسيابية',
    isDark: true,
    previewBg: '#093624',
    renderThumbnail: (
      <div className="w-full h-full bg-gradient-to-tr from-[#052417] via-[#0d4f34] to-[#041a11] relative overflow-hidden">
        {/* Soft wave silk folds */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.2) 45%, transparent 60%)'
        }} />
      </div>
    )
  },
  {
    id: 'islamic_black_gold',
    name: 'نقش إسلامي أسود وذهب',
    desc: 'أرابيسك إسلامي هندسي مذهب على خلفية سوداء',
    isDark: true,
    previewBg: '#0a0a0c',
    renderThumbnail: (
      <div className="w-full h-full bg-[#08080a] relative overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 60 60" className="w-full h-full text-[#c59b27] opacity-60" fill="none" stroke="currentColor" strokeWidth="0.8">
          <rect x="5" y="5" width="50" height="50" />
          <rect x="15" y="15" width="30" height="30" transform="rotate(45 30 30)" />
          <circle cx="30" cy="30" r="12" />
          <line x1="0" y1="0" x2="60" y2="60" />
          <line x1="60" y1="0" x2="0" y2="60" />
        </svg>
      </div>
    )
  },
  {
    id: 'gold_damask',
    name: 'تطريز دمشقي مذهب',
    desc: 'تطريز نباتي دمشقي عتيق بالذهب والبرونز',
    isDark: false,
    previewBg: '#c2a67e',
    renderThumbnail: (
      <div className="w-full h-full bg-[#b89c74] relative overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 60 60" className="w-full h-full text-[#4a3418] opacity-35" fill="currentColor">
          <circle cx="30" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M30 14 C35 22 45 25 45 30 C45 35 35 38 30 46 C25 38 15 35 15 30 C15 25 25 22 30 14 Z" />
        </svg>
      </div>
    )
  },
  {
    id: 'royal_aged_parchment',
    name: 'ورق مقهر ملكي',
    desc: 'مخطوط عتيق بألياف طبيعية وتعتيق بيج مذهب',
    isDark: false,
    previewBg: '#eee5d6',
    renderThumbnail: (
      <div className="w-full h-full bg-[#eee5d6] relative overflow-hidden" style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 50%, #faf3e8 0%, #ede3d2 65%, #dfd2bd 100%)',
        boxShadow: '0 0 0 1px rgba(184, 147, 69, 0.4) inset'
      }}>
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(140, 110, 70, 0.05) 0px, rgba(140, 110, 70, 0.05) 2px, transparent 2px, transparent 6px)'
        }} />
      </div>
    )
  },
  {
    id: 'transparent_canvas',
    name: 'خلفية شفافة PNG',
    desc: 'مفرغة تماماً للدمج في التصاميم والطباعة',
    isDark: false,
    previewBg: '#252932',
    renderThumbnail: (
      <div className="w-full h-full relative overflow-hidden bg-[#252932] flex items-center justify-center">
        <div className="w-6 h-6 border border-white/40 border-dashed rounded flex items-center justify-center text-[10px] text-white/80 font-bold">
          PNG
        </div>
      </div>
    )
  }
];

// ---------------------------------------------------------------------------
// 2. ORNAMENTS DEFINITIONS (مطابقة بدقة للصورة ٢: الزخارف الـ ١٠)
// ---------------------------------------------------------------------------
export interface OrnamentItem {
  id: string;
  name: string;
  renderIcon: React.ReactNode;
}

export const STUDIO_ORNAMENT_ITEMS: OrnamentItem[] = [
  {
    id: 'none',
    name: 'بدون زخرفة',
    renderIcon: (
      <div className="w-full h-full flex flex-col items-center justify-center text-[#a68038] gap-1">
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
          <line x1="6" y1="18" x2="18" y2="6" strokeWidth="1.75" stroke="#a63040" />
        </svg>
      </div>
    )
  },
  {
    id: 'andalusian_frame',
    name: 'إطار أندلسي هندسي',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="6" y="6" width="48" height="48" rx="2" />
        <rect x="11" y="11" width="38" height="38" strokeWidth="0.75" opacity="0.6" />
        {/* Four corner squares with knots */}
        <rect x="6" y="6" width="10" height="10" fill="#e5b84c" fillOpacity="0.25" />
        <rect x="44" y="6" width="10" height="10" fill="#e5b84c" fillOpacity="0.25" />
        <rect x="6" y="44" width="10" height="10" fill="#e5b84c" fillOpacity="0.25" />
        <rect x="44" y="44" width="10" height="10" fill="#e5b84c" fillOpacity="0.25" />
      </svg>
    )
  },
  {
    id: 'star_medallion_8',
    name: 'شمسة مثمنة مذهبة',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.4">
        {/* Pointed octagonal star lozenge */}
        <polygon points="30,6 36,20 50,16 42,28 54,34 42,40 48,52 34,46 30,56 26,46 12,52 18,40 6,34 18,28 10,16 24,20" fill="#e5b84c" fillOpacity="0.15" />
        <circle cx="30" cy="30" r="10" strokeWidth="1" />
      </svg>
    )
  },
  {
    id: 'star_rosette_12',
    name: 'قنديل شمسة مقوسة',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="30" cy="30" r="20" strokeDasharray="3 3" />
        <circle cx="30" cy="30" r="15" />
        <polygon points="30,7 35,22 50,22 38,31 43,46 30,37 17,46 22,31 10,22 25,22" fill="#e5b84c" fillOpacity="0.2" />
      </svg>
    )
  },
  {
    id: 'floral_corners_frame',
    name: 'إطار أركان توريق',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="7" y="7" width="46" height="46" rx="2" />
        {/* 4 corner palmette motifs */}
        <path d="M7 20 Q16 16 20 7" />
        <circle cx="15" cy="15" r="2.5" fill="#e5b84c" />
        <path d="M53 20 Q44 16 40 7" />
        <circle cx="45" cy="15" r="2.5" fill="#e5b84c" />
        <path d="M7 40 Q16 44 20 53" />
        <circle cx="15" cy="45" r="2.5" fill="#e5b84c" />
        <path d="M53 40 Q44 44 40 53" />
        <circle cx="45" cy="45" r="2.5" fill="#e5b84c" />
      </svg>
    )
  },
  {
    id: 'ottoman_cornerpiece',
    name: 'ركنية عثمانية كبرى',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.3">
        {/* Large triangular cornerpiece on top right */}
        <path d="M6 6 L54 6 L54 54 C45 42 42 30 30 30 C18 30 18 18 6 6 Z" fill="#e5b84c" fillOpacity="0.25" />
        <circle cx="40" cy="20" r="3" fill="#e5b84c" />
        <circle cx="48" cy="12" r="2" fill="#e5b84c" />
        <circle cx="32" cy="16" r="2" fill="#e5b84c" />
        <circle cx="44" cy="32" r="2" fill="#e5b84c" />
      </svg>
    )
  },
  {
    id: 'scalloped_cartouche',
    name: 'خرطوشة / طغراء مقوسة',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.3">
        {/* Scalloped circle cartouche */}
        <circle cx="30" cy="30" r="22" strokeDasharray="5 3" />
        <circle cx="30" cy="30" r="18" />
        <path d="M30 10 L30 14" strokeWidth="2" />
        <path d="M30 46 L30 50" strokeWidth="2" />
        <path d="M10 30 L14 30" strokeWidth="2" />
        <path d="M46 30 L50 30" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: 'dense_arabesque_corner',
    name: 'ركنية مشجرة كثيفة',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.2">
        {/* Half tile filled diagonally with arabesque tracery */}
        <polygon points="6,6 54,6 6,54" fill="#e5b84c" fillOpacity="0.3" />
        <line x1="6" y1="54" x2="54" y2="6" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="4" fill="#e5b84c" />
        <circle cx="35" cy="15" r="2.5" fill="#e5b84c" />
        <circle cx="15" cy="35" r="2.5" fill="#e5b84c" />
      </svg>
    )
  },
  {
    id: 'mamluk_geometric_border',
    name: 'إطار تذهيب مملوكي',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="6" y="6" width="48" height="48" />
        <rect x="10" y="10" width="40" height="40" strokeWidth="0.8" />
        <rect x="14" y="14" width="32" height="32" strokeWidth="1.2" />
        <line x1="6" y1="6" x2="14" y2="14" />
        <line x1="54" y1="6" x2="46" y2="14" />
        <line x1="6" y1="54" x2="14" y2="46" />
        <line x1="54" y1="54" x2="46" y2="46" />
      </svg>
    )
  },
  {
    id: 'palmette_inner_frame',
    name: 'إطار أزهار وبراعم',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="8" y="8" width="44" height="44" rx="6" />
        <path d="M8 20 C18 20 20 8 20 8" />
        <path d="M52 20 C42 20 40 8 40 8" />
        <path d="M8 40 C18 40 20 52 20 52" />
        <path d="M52 40 C42 40 40 52 40 52" />
      </svg>
    )
  },
  {
    id: 'delicate_spandrel',
    name: 'زاوية تذهيب رقيقة',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M54 6 L20 6 C20 18 18 20 6 20 L6 54" strokeWidth="1.4" />
        <circle cx="32" cy="14" r="2.5" fill="#e5b84c" />
        <circle cx="14" cy="32" r="2.5" fill="#e5b84c" />
        <path d="M44 6 Q30 18 36 28" />
      </svg>
    )
  }
];

// ---------------------------------------------------------------------------
// 3. COLOR SWATCHES (مطابقة بدقة للصورة ٣: المجموعات الثلاث + منتقي الألوان)
// ---------------------------------------------------------------------------
export interface ColorSwatchItem {
  id: string;
  type: 'neutral' | 'foil' | 'pigment';
  name: string;
  value: string;
  isFoil?: boolean;
  foilStyleId?: string;
  renderVisual: React.ReactNode;
}

export const STUDIO_COLOR_SWATCHES: ColorSwatchItem[] = [
  // GROUP 1: NEUTRALS & PARCHMENT (5 swatches)
  {
    id: 'cream_white',
    type: 'neutral',
    name: 'أبيض عاجي',
    value: '#fbf8f0',
    renderVisual: <div className="w-full h-full bg-[#fbf8f0] rounded-[6px] shadow-inner" />
  },
  {
    id: 'warm_taupe',
    type: 'neutral',
    name: 'رمادي دافئ',
    value: '#948a7e',
    renderVisual: <div className="w-full h-full bg-[#948a7e] rounded-[6px]" />
  },
  {
    id: 'golden_sand',
    type: 'neutral',
    name: 'بيج ذهبي مقهر',
    value: '#c49a62',
    renderVisual: <div className="w-full h-full bg-[#c49a62] rounded-[6px]" />
  },
  {
    id: 'deep_walnut',
    type: 'neutral',
    name: 'جوزي دافئ',
    value: '#4a3728',
    renderVisual: <div className="w-full h-full bg-[#4a3728] rounded-[6px]" />
  },
  {
    id: 'carbon_black',
    type: 'neutral',
    name: 'أسود فاحم',
    value: '#0a0a0a',
    renderVisual: <div className="w-full h-full bg-[#0a0a0a] rounded-[6px]" />
  },

  // GROUP 2: METALLIC FOIL FINISHES (4 swatches)
  {
    id: 'marble_gold_foil',
    type: 'foil',
    name: 'ذهب رخامي معرّق',
    value: '#e5c158',
    isFoil: true,
    foilStyleId: 'marble',
    renderVisual: (
      <div className="w-full h-full rounded-[6px] bg-gradient-to-br from-[#ffe58f] via-[#d4af37] to-[#8a6b14] relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(circle_at_30%_30%,#fff,transparent_70%)]" />
      </div>
    )
  },
  {
    id: 'gold_dust_glitter',
    type: 'foil',
    name: 'برادة ذهب متلألئة',
    value: '#ffd700',
    isFoil: true,
    foilStyleId: 'glitter',
    renderVisual: (
      <div className="w-full h-full rounded-[6px] bg-gradient-to-tr from-[#e5a823] via-[#fff1a8] to-[#b37d14] relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]" />
      </div>
    )
  },
  {
    id: 'antique_gold_leaf',
    type: 'foil',
    name: 'رقائق ذهب عتيق',
    value: '#c59b27',
    isFoil: true,
    foilStyleId: 'leaf',
    renderVisual: (
      <div className="w-full h-full rounded-[6px] bg-gradient-to-b from-[#f3cf7a] via-[#c59b27] to-[#785311] relative overflow-hidden shadow-inner" />
    )
  },
  {
    id: 'liquid_silver_foil',
    type: 'foil',
    name: 'فضة صقيلة براقة',
    value: '#e2e8f0',
    isFoil: true,
    foilStyleId: 'silver',
    renderVisual: (
      <div className="w-full h-full rounded-[6px] bg-gradient-to-br from-[#ffffff] via-[#cbd5e1] to-[#64748b] relative overflow-hidden shadow-inner" />
    )
  },

  // GROUP 3: ROYAL TRADITIONAL CALLIGRAPHY INKS (9 swatches)
  {
    id: 'crimson_ink',
    type: 'pigment',
    name: 'أحمر قرمزي',
    value: '#8a121d',
    renderVisual: <div className="w-full h-full bg-[#8a121d] rounded-[6px]" />
  },
  {
    id: 'ruby_carmine',
    type: 'pigment',
    name: 'أحمر ياقوتي',
    value: '#6b0f1a',
    renderVisual: <div className="w-full h-full bg-[#6b0f1a] rounded-[6px]" />
  },
  {
    id: 'wine_burgundy',
    type: 'pigment',
    name: 'عنابي ملكي',
    value: '#4a0e2e',
    renderVisual: <div className="w-full h-full bg-[#4a0e2e] rounded-[6px]" />
  },
  {
    id: 'lapis_blue',
    type: 'pigment',
    name: 'أزرق لاجوردي',
    value: '#0f4c81',
    renderVisual: <div className="w-full h-full bg-[#0f4c81] rounded-[6px]" />
  },
  {
    id: 'olive_sage',
    type: 'pigment',
    name: 'أخضر زيتي عتيق',
    value: '#4a6741',
    renderVisual: <div className="w-full h-full bg-[#4a6741] rounded-[6px]" />
  },
  {
    id: 'emerald_green',
    type: 'pigment',
    name: 'أخضر زمردي',
    value: '#0c533c',
    renderVisual: <div className="w-full h-full bg-[#0c533c] rounded-[6px]" />
  },
  {
    id: 'midnight_navy',
    type: 'pigment',
    name: 'أزرق نيلي ليل',
    value: '#13294b',
    renderVisual: <div className="w-full h-full bg-[#13294b] rounded-[6px]" />
  },
  {
    id: 'royal_amethyst',
    type: 'pigment',
    name: 'بنفسجي ملوكي',
    value: '#4b244a',
    renderVisual: <div className="w-full h-full bg-[#4b244a] rounded-[6px]" />
  },
  {
    id: 'imperial_magenta',
    type: 'pigment',
    name: 'أرجواني إمبراطوري',
    value: '#701a68',
    renderVisual: <div className="w-full h-full bg-[#701a68] rounded-[6px]" />
  }
];

// ---------------------------------------------------------------------------
// 4. PEN INSTRUMENT DEFINITIONS (مطابقة بدقة للأقلام الـ ٧ في الصورة المرفقة)
// 1. قلم قصب (Qasab Pen)
// 2. قلم خيزران (Bamboo Pen)
// 3. قلم معدني (Metal Pen)
// 4. قلم ريشة (Quill Pen)
// 5. قلم زجاجي (Glass Pen)
// 6. قلم حديث (Modern Pen)
// 7. قلم ماركر (Marker Pen)
// ---------------------------------------------------------------------------
export interface PenStudioItem {
  id: CalligraphyPenNibId;
  nameAr: string;
  nameEn: string;
  desc: string;
  hasWidthIndicator?: boolean;
}

export const STUDIO_PEN_ITEMS: PenStudioItem[] = [
  {
    id: 'qasab_pen',
    nameAr: 'قلم قصب',
    nameEn: 'Qasab Pen',
    desc: 'قصبة طبيعية مشطوفة لخطوط الثلث والنسخ والرقعة'
  },
  {
    id: 'bamboo_pen',
    nameAr: 'قلم خيزران',
    nameEn: 'Bamboo Pen',
    desc: 'خيزران ذهبي عريض للخطوط الجلية واللوحات الكبرى'
  },
  {
    id: 'metal_pen',
    nameAr: 'قلم معدني',
    nameEn: 'Metal Pen',
    desc: 'ريشة معدنية فولاذية دقيقة للنستعليق والتواقيع والحلي',
    hasWidthIndicator: true
  },
  {
    id: 'quill_pen',
    nameAr: 'قلم ريشة',
    nameEn: 'Quill Pen',
    desc: 'ريشة إوز بيضاء طبيعية لضربات انسيابية رشيقة'
  },
  {
    id: 'glass_pen',
    nameAr: 'قلم زجاجي',
    nameEn: 'Glass Pen',
    desc: 'قلم زجاج مورانو حلزوني لسيلان شعري فائق النقاء'
  },
  {
    id: 'modern_pen',
    nameAr: 'قلم حديث',
    nameEn: 'Modern Pen',
    desc: 'قلم حبر مذهب بمقبض خشب الجوز لخطوط عصرية متوازنة'
  },
  {
    id: 'marker_pen',
    nameAr: 'قلم ماركر',
    nameEn: 'Marker Pen',
    desc: 'ماركر شطف فاحم عريض لكثافة حبرية هندسية عالية'
  }
];

export const CalligraphyStudioTray: React.FC<CalligraphyStudioTrayProps> = ({
  activeTab,
  onSelectTab,
  selectedPen,
  onSelectPen,
  fontSize,
  onFontSizeChange,
  selectedInk,
  onSelectInk,
  isGoldFoil,
  onToggleGoldFoil,
  selectedFoilStyle,
  onSelectFoilStyle,
  selectedOrnament,
  onSelectOrnament,
  selectedBackground,
  onSelectBackground,
  selectedFont,
  onSelectFont,
  selectedSize,
  onSelectSize,
  quoteText,
  onQuoteTextChange
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Update scrollbar track indicator
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      return;
    }
    // In RTL, scrollLeft can be negative or positive depending on browser
    const progress = Math.min(1, Math.max(0, Math.abs(scrollLeft) / maxScroll));
    setScrollProgress(progress);
  };

  const scrollLeftSmooth = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const scrollRightSmooth = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#0d0f13] border-t border-[#262016] px-4 py-3 select-none flex flex-col gap-2 relative z-30 shadow-2xl">
      
      {/* ===================================================================== */}
      {/* 1. TRAY HEADER: Category Title in Elegant Gold Typography             */}
      {/* ===================================================================== */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <span className="text-[#e5b84c] text-base font-bold font-tajawal drop-shadow-sm">
            {activeTab === 'background' && 'الخلفيات'}
            {activeTab === 'ornament' && 'الزخارف'}
            {activeTab === 'color' && 'الألوان والأحبار'}
            {activeTab === 'pen' && 'القلم والحبر'}
            {activeTab === 'font' && 'الخطوط الأصيلة'}
            {activeTab === 'size' && 'المقاسات'}
            {activeTab === 'text' && 'النص والمحرر'}
          </span>
        </div>

        {/* Quick Category Switcher Badges */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-[#a68038]">
          <button
            type="button"
            onClick={() => onSelectTab('pen')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${activeTab === 'pen' ? 'bg-[#3b1419] text-[#f3cf7a] border border-[#a68038]/60 font-bold' : 'hover:text-white'}`}
          >
            القلم والحبر
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('color')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${activeTab === 'color' ? 'bg-[#3b1419] text-[#f3cf7a] border border-[#a68038]/60 font-bold' : 'hover:text-white'}`}
          >
            الألوان
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('ornament')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${activeTab === 'ornament' ? 'bg-[#3b1419] text-[#f3cf7a] border border-[#a68038]/60 font-bold' : 'hover:text-white'}`}
          >
            الزخارف
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('background')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${activeTab === 'background' ? 'bg-[#3b1419] text-[#f3cf7a] border border-[#a68038]/60 font-bold' : 'hover:text-white'}`}
          >
            الخلفيات
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. ACTIVE TRAY CONTENT (DYNAMIC PER SELECTED CATEGORY)                */}
      {/* ===================================================================== */}

      {/* --------------------------------------------------------------------- */}
      {/* 2.A BACKGROUNDS TRAY (مطابقة بدقة تامة للصورة رقم ١)                   */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'background' && (
        <div className="relative w-full flex items-center gap-2">
          {/* Right Arrow Navigation Button */}
          <button
            type="button"
            onClick={scrollRightSmooth}
            className="w-8 h-12 shrink-0 flex items-center justify-center text-[#e5b84c] hover:text-[#ffd700] hover:bg-[#1a1c22] rounded-lg transition active:scale-90 cursor-pointer"
            title="التمرير لليمين"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Backgrounds Horizontal Carousel Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth"
          >
            {STUDIO_BACKGROUND_OPTIONS.map(bg => {
              const isSelected = selectedBackground === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => onSelectBackground(bg.id)}
                  className={`shrink-0 w-[84px] h-[106px] rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer active:scale-95 relative group ${
                    isSelected
                      ? 'border-[#e5b84c] ring-2 ring-[#e5b84c]/50 shadow-lg shadow-amber-950/30 scale-102'
                      : 'border-[#3a2c16] hover:border-[#a68038]/70 hover:scale-101'
                  }`}
                  title={bg.name}
                >
                  {bg.renderThumbnail}
                  
                  {/* Subtle hover overlay with title */}
                  <div className={`absolute inset-x-0 bottom-0 py-1 px-0.5 text-[9px] font-bold text-center truncate ${isSelected ? 'bg-black/80 text-[#f3cf7a]' : 'bg-black/60 text-[#d8d0c5]'}`}>
                    {bg.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Left Arrow Navigation Button */}
          <button
            type="button"
            onClick={scrollLeftSmooth}
            className="w-8 h-12 shrink-0 flex items-center justify-center text-[#e5b84c] hover:text-[#ffd700] hover:bg-[#1a1c22] rounded-lg transition active:scale-90 cursor-pointer"
            title="التمرير لليسار"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2.B ORNAMENTS TRAY (مطابقة بدقة تامة للصورة رقم ٢)                    */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'ornament' && (
        <div className="relative w-full flex items-center gap-2">
          {/* Right Arrow Navigation Button */}
          <button
            type="button"
            onClick={scrollRightSmooth}
            className="w-8 h-12 shrink-0 flex items-center justify-center text-[#e5b84c] hover:text-[#ffd700] hover:bg-[#1a1c22] rounded-lg transition active:scale-90 cursor-pointer"
            title="التمرير لليمين"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Ornaments Horizontal Carousel Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth"
          >
            {STUDIO_ORNAMENT_ITEMS.map(orn => {
              const isSelected = selectedOrnament === orn.id;
              return (
                <button
                  key={orn.id}
                  type="button"
                  onClick={() => onSelectOrnament(orn.id)}
                  className={`shrink-0 w-[96px] h-[96px] rounded-xl border-2 bg-[#090b0e] p-2 flex flex-col items-center justify-between transition-all duration-200 cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'border-[#e5b84c] ring-2 ring-[#e5b84c]/50 shadow-lg shadow-amber-950/30 scale-102 bg-[#12141a]'
                      : 'border-[#3a2c16] hover:border-[#a68038]/70 hover:scale-101'
                  }`}
                  title={orn.name}
                >
                  <div className="w-14 h-14 flex items-center justify-center pointer-events-none">
                    {orn.renderIcon}
                  </div>
                  <span className={`text-[10px] font-bold truncate w-full text-center ${isSelected ? 'text-[#f3cf7a]' : 'text-[#8c949e]'}`}>
                    {orn.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Left Arrow Navigation Button */}
          <button
            type="button"
            onClick={scrollLeftSmooth}
            className="w-8 h-12 shrink-0 flex items-center justify-center text-[#e5b84c] hover:text-[#ffd700] hover:bg-[#1a1c22] rounded-lg transition active:scale-90 cursor-pointer"
            title="التمرير لليسار"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2.C COLORS & FOILS TRAY (مطابقة بدقة تامة للصورة رقم ٣)                */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'color' && (
        <div className="relative w-full rounded-2xl border border-[#3a2c16] bg-[#090b0e] p-2 flex items-center gap-2">
          {/* Right Arrow Navigation Button */}
          <button
            type="button"
            onClick={scrollRightSmooth}
            className="w-7 h-11 shrink-0 flex items-center justify-center text-[#e5b84c] hover:text-[#ffd700] rounded-lg transition active:scale-90 cursor-pointer"
            title="التمرير لليمين"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Swatches Horizontal Carousel Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 scroll-smooth"
          >
            {/* GROUP 1: Neutrals */}
            <div className="flex items-center gap-2 pr-1 border-l border-[#24211a] pl-3">
              {STUDIO_COLOR_SWATCHES.filter(s => s.type === 'neutral').map(swatch => {
                const isSelected = !isGoldFoil && selectedInk.toLowerCase() === swatch.value.toLowerCase();
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    onClick={() => {
                      onToggleGoldFoil(false);
                      onSelectInk(swatch.value);
                    }}
                    className={`relative shrink-0 w-11 h-11 rounded-[9px] p-0.5 border-2 transition active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'border-[#e5b84c] shadow-md ring-1 ring-[#e5b84c]/60 -translate-y-0.5'
                        : 'border-[#3a2c16] hover:border-[#a68038]/60'
                    }`}
                    title={swatch.name}
                  >
                    {/* Active Top Tab Indicator exactly matching Screenshot 3 */}
                    {isSelected && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-[#e5b84c] rounded-t-sm" />
                    )}
                    {swatch.renderVisual}
                  </button>
                );
              })}
            </div>

            {/* GROUP 2: Metallic Foil Finishes */}
            <div className="flex items-center gap-2 pr-1 border-l border-[#24211a] pl-3">
              {STUDIO_COLOR_SWATCHES.filter(s => s.type === 'foil').map(swatch => {
                const isSelected = isGoldFoil && (selectedFoilStyle === swatch.foilStyleId || (!selectedFoilStyle && swatch.id === 'antique_gold_leaf'));
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    onClick={() => {
                      onToggleGoldFoil(true);
                      if (onSelectFoilStyle && swatch.foilStyleId) {
                        onSelectFoilStyle(swatch.foilStyleId);
                      }
                      onSelectInk(swatch.value);
                    }}
                    className={`relative shrink-0 w-11 h-11 rounded-[9px] p-0.5 border-2 transition active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'border-[#e5b84c] shadow-md ring-1 ring-[#e5b84c]/60 -translate-y-0.5'
                        : 'border-[#3a2c16] hover:border-[#a68038]/60'
                    }`}
                    title={`${swatch.name} (تأثير تذهيب)`}
                  >
                    {isSelected && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-[#e5b84c] rounded-t-sm" />
                    )}
                    {swatch.renderVisual}
                  </button>
                );
              })}
            </div>

            {/* GROUP 3: Royal Traditional Inks */}
            <div className="flex items-center gap-2 pr-1">
              {STUDIO_COLOR_SWATCHES.filter(s => s.type === 'pigment').map(swatch => {
                const isSelected = !isGoldFoil && selectedInk.toLowerCase() === swatch.value.toLowerCase();
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    onClick={() => {
                      onToggleGoldFoil(false);
                      onSelectInk(swatch.value);
                    }}
                    className={`relative shrink-0 w-11 h-11 rounded-[9px] p-0.5 border-2 transition active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'border-[#e5b84c] shadow-md ring-1 ring-[#e5b84c]/60 -translate-y-0.5'
                        : 'border-[#3a2c16] hover:border-[#a68038]/60'
                    }`}
                    title={swatch.name}
                  >
                    {isSelected && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-[#e5b84c] rounded-t-sm" />
                    )}
                    {swatch.renderVisual}
                  </button>
                );
              })}
            </div>

            {/* GROUP 4: Rainbow Custom Color Picker (End Item in Screenshot 3) */}
            <div className="shrink-0 pl-1">
              <button
                type="button"
                onClick={() => colorInputRef.current?.click()}
                className="relative shrink-0 w-11 h-11 rounded-[9px] p-0.5 border-2 border-[#3a2c16] hover:border-[#e5b84c] transition active:scale-95 cursor-pointer overflow-hidden shadow-inner"
                title="اختيار لون مخصص (طيف الألوان)"
              >
                <div className="w-full h-full rounded-[6px] bg-[conic-gradient(from_0deg,#ff0000,#ff8800,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)]" />
                <input
                  ref={colorInputRef}
                  type="color"
                  value={selectedInk}
                  onChange={(e) => {
                    onToggleGoldFoil(false);
                    onSelectInk(e.target.value);
                  }}
                  className="sr-only"
                />
              </button>
            </div>

          </div>

          {/* Left Arrow Navigation Button */}
          <button
            type="button"
            onClick={scrollLeftSmooth}
            className="w-7 h-11 shrink-0 flex items-center justify-center text-[#e5b84c] hover:text-[#ffd700] rounded-lg transition active:scale-90 cursor-pointer"
            title="التمرير لليسار"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2.D PEN & INK TRAY (مطابقة بدقة تامة للصورة رقم ٤ وللأقلام الـ ٧ الفاخرة)  */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'pen' && (
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-1">
          
          {/* SECTION 1: THE 7 PENS (الأقلام السبعة في الصندوق الخشبي مع اللوحات النحاسية) */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto py-1">
            {STUDIO_PEN_ITEMS.map(pen => {
              const isSelected = selectedPen === pen.id || 
                (selectedPen === 'reed_qalam' && pen.id === 'qasab_pen') ||
                (selectedPen === 'wet_wash' && pen.id === 'bamboo_pen') ||
                (selectedPen === 'flex_quill' && pen.id === 'metal_pen') ||
                (selectedPen === 'tashkeel_dotting' && pen.id === 'metal_pen') ||
                (selectedPen === 'sable_brush' && pen.id === 'modern_pen') ||
                (selectedPen === 'broad_tomar' && pen.id === 'marker_pen') ||
                (selectedPen === 'graphite_pencil' && pen.id === 'qasab_pen');

              return (
                <div key={pen.id} className="flex flex-col items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectPen(pen.id)}
                    className={`w-[80px] sm:w-[86px] h-[130px] rounded-xl flex flex-col items-center justify-between p-1.5 transition-all duration-200 active:scale-95 cursor-pointer relative group overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#2a100b] via-[#1c0b07] to-[#120604] border-2 border-[#f3db9e] ring-2 ring-[#e5b84c]/60 shadow-[0_0_18px_rgba(229,184,76,0.4)]'
                        : 'bg-gradient-to-b from-[#1a120e] via-[#120c09] to-[#0a0705] border border-[#3a2719] hover:border-[#a68038]/70 hover:bg-[#1e1510]'
                    }`}
                    title={`${pen.nameAr} (${pen.nameEn}) - ${pen.desc}`}
                  >
                    {/* Recessed Velvet Pen Bed Background (فجوة مخملية بنية داكنة لحفظ القلم) */}
                    <div className="absolute inset-x-2 top-2 bottom-10 bg-black/50 rounded-lg shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] pointer-events-none" />

                    {/* Pen Vector Figure */}
                    <div className="w-10 h-[82px] relative z-10 flex items-center justify-center pointer-events-none mt-1">
                      <CalligraphyToolFigure
                        toolId={pen.id}
                        isSelected={isSelected}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Polished Golden Brass Nameplate (اللوحة النحاسية المذهبة تحت كل قلم كالصورة تماماً) */}
                    <div 
                      className={`w-full h-[34px] rounded-md px-1 flex flex-col items-center justify-center relative shadow-sm border transition-all z-10 ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#fff2cc] via-[#e5b84c] to-[#a67923] border-[#ffe699] text-[#2b1704] shadow-[0_2px_5px_rgba(0,0,0,0.6)]'
                          : 'bg-gradient-to-b from-[#e3bf73] via-[#c99e46] to-[#87601d] border-[#664612] text-[#1f1003] group-hover:from-[#edd593] group-hover:via-[#dfb558]'
                      }`}
                      style={{
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.45)'
                      }}
                    >
                      {/* Micro Screws on Plate Corners */}
                      <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-[#4a2e06]/75" />
                      <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-[#4a2e06]/75" />
                      <div className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full bg-[#4a2e06]/75" />
                      <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-[#4a2e06]/75" />

                      {/* Arabic Name (e.g. قلم قصب، قلم خيزران، قلم معدني، إلخ) */}
                      <span className="text-[11px] font-black font-tajawal leading-tight drop-shadow-[0_0.5px_0_rgba(255,255,255,0.5)] whitespace-nowrap">
                        {pen.nameAr}
                      </span>
                      {/* English Subtitle (e.g. Qasab Pen, Bamboo Pen, Metal Pen, إلخ) */}
                      <span className="text-[8.5px] font-bold tracking-tight opacity-95 leading-none whitespace-nowrap">
                        {pen.nameEn}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* SECTION 2: FONT / PEN SIZE STEPPER (حجم الخط: 96 [-] [+]) */}
          <div className="shrink-0 flex flex-col items-center gap-1.5 px-4 border-x border-[#282115]">
            <span className="text-xs font-bold text-[#e5b84c] font-tajawal">حجم الخط</span>
            
            {/* Number Box with Golden Border */}
            <div className="w-16 h-12 rounded-xl border border-[#a68038] bg-[#0c0e12] flex items-center justify-center shadow-inner">
              <span className="text-lg font-bold text-white font-mono">{fontSize}</span>
            </div>

            {/* Stepper Buttons [-] and [+] */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onFontSizeChange(Math.max(32, fontSize - 6))}
                className="w-7 h-7 rounded-lg border border-[#a68038]/70 bg-[#14161b] hover:bg-[#1e222a] text-[#f0e8dc] text-sm font-bold flex items-center justify-center transition active:scale-90 cursor-pointer"
                title="تصغير حجم الخط"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => onFontSizeChange(Math.min(180, fontSize + 6))}
                className="w-7 h-7 rounded-lg border border-[#a68038]/70 bg-[#14161b] hover:bg-[#1e222a] text-[#f0e8dc] text-sm font-bold flex items-center justify-center transition active:scale-90 cursor-pointer"
                title="تكبير حجم الخط"
              >
                +
              </button>
            </div>
          </div>

          {/* SECTION 3: LIVE PARCHMENT INK STROKE TESTER (ورقة اختبار ضربات القلم والحبر) */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <div
              className="w-48 h-28 rounded-xl border border-[#a68038]/80 bg-[#eee4d4] p-3 flex flex-col justify-between shadow-lg relative overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(ellipse at 50% 50%, #faf3e6 0%, #eee4d4 70%, #dfd2bd 100%)'
              }}
              title="ورقة اختبار واقعية لحساسية وسيلان حبر القلم المختار"
            >
              {/* Stroke 1: Fine Hairline Guideline (2px grey) */}
              <div className="w-full h-0.5 bg-[#a89f91] rounded-full opacity-70" />

              {/* Stroke 2: Medium Smooth Ink Stroke (4px black) */}
              <div className="w-[90%] h-1 bg-[#18181b] rounded-full" />

              {/* Stroke 3: Bold Calligraphic Stroke with Tapered Ends (8px) */}
              <div className="w-[95%] h-2.5 bg-[#121214] rounded-full shadow-xs" style={{
                clipPath: 'polygon(0 40%, 10% 0, 90% 0, 100% 60%, 90% 100%, 10% 100%)'
              }} />

              {/* Stroke 4: Flowing Wave Stroke in Current Active Ink or Gold Foil */}
              <div className="w-full h-3 flex items-center">
                <svg viewBox="0 0 160 20" className="w-full h-full" fill="none">
                  <path
                    d="M5 12 Q30 2 60 10 T120 12 T155 8"
                    stroke={isGoldFoil ? '#d4af37' : selectedInk}
                    strokeWidth={
                      selectedPen === 'bamboo_pen' || selectedPen === 'marker_pen'
                        ? '4.5'
                        : selectedPen === 'metal_pen'
                        ? '2.2'
                        : '3.5'
                    }
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <span className="text-[10px] text-[#a68038] font-tajawal">ورقة اختبار الحبر والضربات</span>
          </div>

        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2.E FONTS TRAY (الخطوط الأصيلة)                                       */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'font' && (
        <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'thuluth', label: 'خَطُّ الثُّلُثِ', className: 'font-thuluth' },
            { id: 'naskh', label: 'خَطُّ النَّسْخِ', className: 'font-naskh' },
            { id: 'diwani', label: 'الخَطُّ الدِّيوَانِيُّ', className: 'font-diwani' },
            { id: 'kufi', label: 'الْخَطُّ الْكُوفِيُّ', className: 'font-kufi' },
            { id: 'ruqah', label: 'خَطُّ الرُّقْعَةِ', className: 'font-ruqah' },
            { id: 'reem_kufi_ink', label: 'رِيم كُوفِي إنك', className: 'font-reem-ink' },
            { id: 'alarabiya', label: 'خَطُّ الْعَرَبِيَّةِ', className: 'font-alarabiya' },
            { id: 'molhim', label: 'خَطُّ مُلْهِم', className: 'font-molhim' },
            { id: 'sulimany', label: 'خَطُّ السُّلَيْمَانِي', className: 'font-sulimany' },
            { id: 'aref_ruqaa_ink', label: 'رُقْعَة إنك', className: 'font-aref-ink' },
            { id: 'hsn_naskh', label: 'حَسَن نَسْخ', className: 'font-hsn-naskh' }
          ].map(f => {
            const isSelected = selectedFont === f.className;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelectFont(f.className)}
                className={`shrink-0 px-4 h-12 rounded-xl border-2 flex items-center justify-center transition active:scale-95 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#3b1419] border-[#e5b84c] text-[#f3cf7a] shadow-lg shadow-red-950/30 font-bold'
                    : 'bg-[#090b0e] border-[#292218] text-[#d8d0c5] hover:border-[#a68038]/60 hover:text-white'
                }`}
              >
                <span className={`${f.className} text-lg`}>{f.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2.F SIZES TRAY (المقاسات والأبعاد القياسية)                           */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'size' && (
        <div className="w-full flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'A3', label: 'A3', subtitle: '42 × 29.7 سم' },
            { id: 'A4', label: 'A4', subtitle: '29.7 × 21 سم' },
            { id: '1:1', label: '1:1', subtitle: 'مربع قياسي' },
            { id: '4:3', label: '4:3', subtitle: 'أفقي كلاسيكي' },
            { id: '3:4', label: '3:4', subtitle: 'طولي قياسي' },
            { id: '16:9', label: '16:9', subtitle: 'عريض سينمائي' },
            { id: '9:16', label: '9:16', subtitle: 'ستوري عمودي' },
            { id: '3:2', label: '3:2', subtitle: 'فوتوغرافي أفقي' },
            { id: '2:3', label: '2:3', subtitle: 'فوتوغرافي عمودي' },
            { id: '1.75:1', label: '1.75:1', subtitle: 'بانوراما عريضة' },
            { id: '2:1', label: '2:1', subtitle: 'عريض مزدوج' },
            { id: '1:2', label: '1:2', subtitle: 'طولي ممتد' }
          ].map(sz => {
            const isSelected = selectedSize === sz.id;
            return (
              <button
                key={sz.id}
                type="button"
                onClick={() => onSelectSize(sz.id)}
                className={`shrink-0 px-4 h-12 rounded-xl border-2 flex flex-col items-center justify-center transition active:scale-95 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#3b1419] border-[#e5b84c] text-[#f3cf7a] shadow-lg shadow-red-950/30 font-bold'
                    : 'bg-[#090b0e] border-[#292218] text-[#d8d0c5] hover:border-[#a68038]/60 hover:text-white'
                }`}
              >
                <span className="text-sm font-bold font-mono">{sz.label}</span>
                <span className="text-[10px] text-[#a68038]">{sz.subtitle}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2.G TEXT & INSPIRATIONAL PRESETS TRAY (النص والعبارات الإلهامية)       */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'text' && (
        <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {onQuoteTextChange && (
            <div className="shrink-0 flex items-center gap-2 bg-[#090b0e] border border-[#3d3222] rounded-xl px-3 h-12">
              <span className="text-[#a68038] text-xs font-bold whitespace-nowrap">النص:</span>
              <input
                type="text"
                value={quoteText || ''}
                onChange={(e) => onQuoteTextChange(e.target.value)}
                placeholder="اكتب النص هنا..."
                className="bg-transparent text-white text-sm focus:outline-none w-36 sm:w-56 font-tajawal"
              />
            </div>
          )}
          {[
            'الحَمْدُ لِلَّهِ',
            'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ',
            'وَقُل رَّبِّ زِدْنِي عِلْمًا',
            'فَصَبْرٌ جَمِيلٌ',
            'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
            'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
            'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
            'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ'
          ].map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onQuoteTextChange?.(q)}
              className="shrink-0 px-3.5 h-12 rounded-xl border border-[#292218] bg-[#090b0e] text-[#d8d0c5] hover:border-[#e5b84c] hover:text-[#f3cf7a] transition active:scale-95 cursor-pointer whitespace-nowrap flex items-center justify-center font-amiri text-sm"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      {/* ===================================================================== */}
      <div className="w-full h-1 bg-[#181a20] rounded-full overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-l from-[#e5b84c] to-[#a68038] rounded-full transition-all duration-150"
          style={{
            width: '35%',
            transform: `translateX(${scrollProgress * 180}%)`
          }}
        />
      </div>

    </div>
  );
};
