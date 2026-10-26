import React, { useRef, useState } from 'react';
import { CalligraphyPenNibId } from './calligraphyStudioData';
import { CalligraphyToolFigure } from './CalligraphyToolFigure';

export interface CalligraphyStudioTrayProps {
  activeTab: 'text' | 'font' | 'pen' | 'color' | 'ornament' | 'size' | 'background';
  onSelectTab: (tab: 'text' | 'font' | 'pen' | 'color' | 'ornament' | 'size' | 'background') => void;
  selectedPen: CalligraphyPenNibId;
  onSelectPen: (pen: CalligraphyPenNibId) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  selectedInk: string;
  onSelectInk: (color: string) => void;
  isGoldFoil: boolean;
  onToggleGoldFoil: (val: boolean) => void;
  selectedFoilStyle?: string;
  onSelectFoilStyle?: (style: string) => void;
  selectedOrnament: string;
  onSelectOrnament: (ornament: string) => void;
  selectedBackground: string;
  onSelectBackground: (bgId: string) => void;
  selectedFont: string;
  onSelectFont: (font: string) => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  quoteText?: string;
  onQuoteTextChange?: (text: string) => void;
  onOpenTashkeel?: () => void;
  authorName?: string;
  onAuthorNameChange?: (name: string) => void;
  authorYear?: string;
  onAuthorYearChange?: (year: string) => void;
  onUploadCustomBg?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customBgUrl?: string | null;
}

// ---------------------------------------------------------------------------
// 1. LUXURY BACKGROUND DEFINITIONS (12 خلفية فاخرة ملكية)
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
    desc: 'مخطوط عتيق بألياف قطنية طبيعية وتعتيق بيج عاجي نقي',
    isDark: false,
    previewBg: '#faf4ea',
    renderThumbnail: (
      <div className="w-full h-full bg-[#faf4ea] relative overflow-hidden" style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 50%, #fffbf4 0%, #f6ece0 65%, #eddcc8 100%)'
      }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(140, 110, 70, 0.04) 0px, rgba(140, 110, 70, 0.04) 2px, transparent 2px, transparent 6px)'
        }} />
      </div>
    )
  },
  {
    id: 'ottoman_gold_fleck',
    name: 'أبرو عثماني مذهب',
    desc: 'ورق إبرو سلطاني معرق بأمواج الشاي المعتّق ورقائق الذهب ۲٤',
    isDark: false,
    previewBg: '#f3e8d2',
    renderThumbnail: (
      <div className="w-full h-full bg-[#f3e8d2] relative overflow-hidden" style={{
        backgroundImage: 'radial-gradient(circle at 30% 30%, #fff6e5 0%, #ecd9b8 60%, #deb881 100%)'
      }}>
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'radial-gradient(circle, #c59b27 1px, transparent 1.5px), radial-gradient(circle, #8c601c 0.8px, transparent 1.2px)',
          backgroundSize: '12px 12px, 18px 18px',
          backgroundPosition: '0 0, 6px 6px'
        }} />
      </div>
    )
  },
  {
    id: 'charcoal_slate',
    name: 'حجر الفحم والرماد',
    desc: 'لوح بازلتي حجري داكن غير لامع عالي الفخامة',
    isDark: true,
    previewBg: '#1b1d22',
    renderThumbnail: (
      <div className="w-full h-full bg-[#1b1d22] relative overflow-hidden" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #272a31 0%, #181a1f 70%, #0f1013 100%)'
      }} />
    )
  },
  {
    id: 'imperial_burgundy',
    name: 'مخمل عنابي سلطاني',
    desc: 'مخمل إمبراطوري فاخر بألوان الياقوت القاني',
    isDark: true,
    previewBg: '#2c0c12',
    renderThumbnail: (
      <div className="w-full h-full bg-[#2c0c12] relative overflow-hidden" style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 45%, #4a1520 0%, #280a0f 65%, #150508 100%)'
      }} />
    )
  },
  {
    id: 'damascus_mother_of_pearl',
    name: 'صدف دمشقي لؤلؤي',
    desc: 'ورق عاجي مطعم بنعومة بريق الصدف السوري التراثي',
    isDark: false,
    previewBg: '#f6f2ea',
    renderThumbnail: (
      <div className="w-full h-full bg-gradient-to-tr from-[#ede4d3] via-[#faf7f0] to-[#e4d8c3] relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, transparent 50%, rgba(212,175,55,0.2) 100%)'
        }} />
      </div>
    )
  },
  {
    id: 'antique_vellum',
    name: 'جلد عتيق / رق الغزال',
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
      <div className="w-full h-full bg-gradient-to-tr from-[#052417] via-[#0d4f34] to-[#041a11] relative overflow-hidden" />
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
  }
];

// ---------------------------------------------------------------------------
// 2. ORNAMENTS DEFINITIONS (12 زخرفة وإطار إسلامي عالي الفخامة)
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
    id: 'royal_gilded_frame',
    name: 'إطار تذهيب سلطاني',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="5" width="50" height="50" rx="3" />
        <rect x="9" y="9" width="42" height="42" strokeWidth="0.8" strokeDasharray="4 2" />
        <polygon points="5,5 12,5 5,12" fill="#e5b84c" />
        <polygon points="55,5 48,5 55,12" fill="#e5b84c" />
        <polygon points="5,55 12,55 5,48" fill="#e5b84c" />
        <polygon points="55,55 48,55 55,48" fill="#e5b84c" />
      </svg>
    )
  },
  {
    id: 'andalusian_muqarnas_border',
    name: 'إطار أندلسي مضفر',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="5" y="5" width="50" height="50" />
        <rect x="10" y="10" width="40" height="40" strokeWidth="0.8" />
        <rect x="7" y="7" width="8" height="8" fill="#e5b84c" fillOpacity="0.4" />
        <rect x="45" y="7" width="8" height="8" fill="#e5b84c" fillOpacity="0.4" />
        <rect x="7" y="45" width="8" height="8" fill="#e5b84c" fillOpacity="0.4" />
        <rect x="45" y="45" width="8" height="8" fill="#e5b84c" fillOpacity="0.4" />
      </svg>
    )
  },
  {
    id: 'ottoman_tezhip_frame',
    name: 'تذهيب عثماني فاخر',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="6" y="6" width="48" height="48" rx="4" />
        <path d="M6 18 C14 18 18 6 18 6" />
        <path d="M54 18 C46 18 42 6 42 6" />
        <path d="M6 42 C14 42 18 54 18 54" />
        <path d="M54 42 C46 42 42 54 42 54" />
        <circle cx="12" cy="12" r="2.5" fill="#e5b84c" />
        <circle cx="48" cy="12" r="2.5" fill="#e5b84c" />
      </svg>
    )
  },
  {
    id: 'mamluk_geometric_border',
    name: 'إطار هندسي مملوكي',
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
    id: 'sultani_mihrab_arch',
    name: 'محراب سلطاني متوج',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 52 L12 28 Q12 10 30 8 Q48 10 48 28 L48 52" />
        <path d="M30 8 L30 18" strokeWidth="1.8" />
        <polygon points="30,18 33,23 30,27 27,23" fill="#e5b84c" />
        <circle cx="30" cy="23" r="1.5" fill="#fff" />
      </svg>
    )
  },
  {
    id: 'persian_shamsah_crest',
    name: 'شمسة إمبراطورية مشعة',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="30" cy="22" r="10" strokeWidth="1.2" />
        <polygon points="30,8 33,18 44,18 35,24 38,34 30,28 22,34 25,24 16,18 27,18" fill="#e5b84c" fillOpacity="0.3" />
        <line x1="12" y1="44" x2="48" y2="44" strokeWidth="1.2" />
      </svg>
    )
  },
  {
    id: 'khattat_oval_cartouche',
    name: 'خرطوشة خطاط مذهبة',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.3">
        <ellipse cx="30" cy="30" rx="24" ry="14" strokeWidth="1.6" />
        <ellipse cx="30" cy="30" rx="21" ry="11" strokeWidth="0.8" strokeDasharray="3 2" />
        <circle cx="5" cy="30" r="2.5" fill="#e5b84c" />
        <circle cx="55" cy="30" r="2.5" fill="#e5b84c" />
      </svg>
    )
  },
  {
    id: 'floral_palmette_corners',
    name: 'أركان توريق نباتي',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="7" y="7" width="46" height="46" rx="3" strokeWidth="0.8" opacity="0.6" />
        <path d="M7 16 C12 16 16 7 16 7" strokeWidth="1.6" />
        <path d="M53 16 C48 16 44 7 44 7" strokeWidth="1.6" />
        <path d="M7 44 C12 44 16 53 16 53" strokeWidth="1.6" />
        <path d="M53 44 C48 44 44 53 44 53" strokeWidth="1.6" />
      </svg>
    )
  },
  {
    id: 'delicate_spandrel',
    name: 'زوايا تذهيب رقيقة',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M54 6 L20 6 C20 18 18 20 6 20 L6 54" strokeWidth="1.4" />
        <circle cx="32" cy="14" r="2.5" fill="#e5b84c" />
        <circle cx="14" cy="32" r="2.5" fill="#e5b84c" />
      </svg>
    )
  },
  {
    id: 'fatimid_cusped_frame',
    name: 'إطار كوفي فاطمي',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="6" y="6" width="48" height="48" rx="2" />
        <path d="M10 14 Q20 8 30 14 Q40 8 50 14" strokeWidth="1.2" />
        <path d="M10 46 Q20 52 30 46 Q40 52 50 46" strokeWidth="1.2" />
      </svg>
    )
  },
  {
    id: 'samarkand_turquoise_gold',
    name: 'تطريز سمرقند مذهب',
    renderIcon: (
      <svg viewBox="0 0 60 60" className="w-full h-full text-[#e5b84c]" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="6" y="6" width="48" height="48" />
        <rect x="10" y="10" width="40" height="40" stroke="#0d5c63" strokeWidth="1.5" />
        <rect x="15" y="15" width="10" height="10" fill="#0d5c63" />
        <rect x="35" y="15" width="10" height="10" fill="#0d5c63" />
        <rect x="15" y="35" width="10" height="10" fill="#0d5c63" />
        <rect x="35" y="35" width="10" height="10" fill="#0d5c63" />
      </svg>
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
  }
];

// ---------------------------------------------------------------------------
// 3. COLOR SWATCHES
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
  // GROUP 1: NEUTRALS
  {
    id: 'carbon_black',
    type: 'neutral',
    name: 'فاحم كربوني كلاسيكي',
    value: '#121212',
    renderVisual: <div className="w-full h-full bg-[#121212] rounded-[6px]" />
  },
  {
    id: 'deep_espresso',
    type: 'neutral',
    name: 'بني جوزي دافئ',
    value: '#2c1810',
    renderVisual: <div className="w-full h-full bg-[#2c1810] rounded-[6px]" />
  },
  {
    id: 'cream_white',
    type: 'neutral',
    name: 'أبيض عاجي نقي',
    value: '#fbf8f0',
    renderVisual: <div className="w-full h-full bg-[#fbf8f0] rounded-[6px] shadow-inner" />
  },
  {
    id: 'warm_taupe',
    type: 'neutral',
    name: 'رمادي دافئ عتيق',
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

  // GROUP 2: FOILS
  {
    id: 'pure_gold_24k',
    type: 'foil',
    name: 'ذهب خالص ۲٤ قيراط',
    value: '#e5b84c',
    isFoil: true,
    foilStyleId: 'leaf',
    renderVisual: (
      <div className="w-full h-full rounded-[6px] bg-gradient-to-tr from-[#c49028] via-[#ffd700] to-[#fff3b0] shadow-sm flex items-center justify-center">
        <span className="text-[9px] font-black text-[#5c3e0e]">۲٤k</span>
      </div>
    )
  },
  {
    id: 'antique_gold_leaf',
    type: 'foil',
    name: 'ذهب عتيق مطروق',
    value: '#d4af37',
    isFoil: true,
    foilStyleId: 'antique',
    renderVisual: (
      <div className="w-full h-full rounded-[6px] bg-gradient-to-br from-[#8a6018] via-[#d4af37] to-[#f5df93] shadow-sm flex items-center justify-center">
        <span className="text-[9px] font-bold text-[#382305]">ذهب</span>
      </div>
    )
  },
  {
    id: 'rose_gold',
    type: 'foil',
    name: 'ذهب وردي أندلسي',
    value: '#b76e79',
    isFoil: true,
    foilStyleId: 'rose',
    renderVisual: (
      <div className="w-full h-full rounded-[6px] bg-gradient-to-tr from-[#8f4a56] via-[#d9949f] to-[#fbe2e5] shadow-sm flex items-center justify-center">
        <span className="text-[9px] font-bold text-[#45161e]">وردي</span>
      </div>
    )
  },
  {
    id: 'bright_silver',
    type: 'foil',
    name: 'فضة نقية مصقولة',
    value: '#c0c0c0',
    isFoil: true,
    foilStyleId: 'silver',
    renderVisual: (
      <div className="w-full h-full rounded-[6px] bg-gradient-to-tr from-[#7a8288] via-[#e2e6ea] to-[#ffffff] shadow-sm flex items-center justify-center">
        <span className="text-[9px] font-bold text-[#1f2429]">فضة</span>
      </div>
    )
  },
  {
    id: 'bronze_copper',
    type: 'foil',
    name: 'نحاس برونزي عتيق',
    value: '#cd7f32',
    isFoil: true,
    foilStyleId: 'bronze',
    renderVisual: (
      <div className="w-full h-full rounded-[6px] bg-gradient-to-tr from-[#7a4214] via-[#cd7f32] to-[#f4b680] shadow-sm flex items-center justify-center">
        <span className="text-[9px] font-bold text-[#2d1404]">نحاس</span>
      </div>
    )
  },

  // GROUP 3: PIGMENTS
  {
    id: 'crimson_ink',
    type: 'pigment',
    name: 'أحمر قرمزي (دم الغزال)',
    value: '#8a121d',
    renderVisual: <div className="w-full h-full bg-[#8a121d] rounded-[6px]" />
  },
  {
    id: 'wine_burgundy',
    type: 'pigment',
    name: 'عنابي ملكي سلطاني',
    value: '#4c151c',
    renderVisual: <div className="w-full h-full bg-[#4c151c] rounded-[6px]" />
  },
  {
    id: 'lapis_blue',
    type: 'pigment',
    name: 'أزرق لاجوردي شامي',
    value: '#0f4c81',
    renderVisual: <div className="w-full h-full bg-[#0f4c81] rounded-[6px]" />
  },
  {
    id: 'midnight_navy',
    type: 'pigment',
    name: 'كحلي أندلسي فاحم',
    value: '#0f1d33',
    renderVisual: <div className="w-full h-full bg-[#0f1d33] rounded-[6px]" />
  },
  {
    id: 'emerald_green',
    type: 'pigment',
    name: 'أخضر زمردي عميق',
    value: '#153d2b',
    renderVisual: <div className="w-full h-full bg-[#153d2b] rounded-[6px]" />
  },
  {
    id: 'olive_sage',
    type: 'pigment',
    name: 'أخضر زيتي عتيق',
    value: '#2b3819',
    renderVisual: <div className="w-full h-full bg-[#2b3819] rounded-[6px]" />
  },
  {
    id: 'saffron_orange',
    type: 'pigment',
    name: 'زعفراني مذهب',
    value: '#d97706',
    renderVisual: <div className="w-full h-full bg-[#d97706] rounded-[6px]" />
  },
  {
    id: 'royal_amethyst',
    type: 'pigment',
    name: 'أرجواني إمبراطوري',
    value: '#431c4f',
    renderVisual: <div className="w-full h-full bg-[#431c4f] rounded-[6px]" />
  },
  {
    id: 'deep_walnut',
    type: 'neutral',
    name: 'جوزي دافئ',
    value: '#4a3728',
    renderVisual: <div className="w-full h-full bg-[#4a3728] rounded-[6px]" />
  },
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
  {
    id: 'ruby_carmine',
    type: 'pigment',
    name: 'أحمر ياقوتي',
    value: '#6b0f1a',
    renderVisual: <div className="w-full h-full bg-[#6b0f1a] rounded-[6px]" />
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
// 4. PEN INSTRUMENT DEFINITIONS (مرتبة من الأقل سماكة إلى الأكثر سماكة)
// ---------------------------------------------------------------------------
export interface PenStudioItem {
  id: CalligraphyPenNibId;
  nameAr: string;
  nameEn: string;
  nibThickness: string;
  desc: string;
}

export const STUDIO_PEN_ITEMS: PenStudioItem[] = [
  {
    id: 'metal_pen',
    nameAr: 'قلم معدني',
    nameEn: 'Metal Pen',
    nibThickness: '1.0 مم',
    desc: 'ريشة فولاذية دقيقة للنستعليق والتواقيع والضربات الرفيعة فائقة النحافة'
  },
  {
    id: 'modern_pen',
    nameAr: 'قلم حديث',
    nameEn: 'Modern Pen',
    nibThickness: '1.8 مم',
    desc: 'قلم حبر مذهب بمقبض خشب الجوز لخطوط عصرية رشيقة ومتوازنة'
  },
  {
    id: 'quill_pen',
    nameAr: 'قلم ريشة',
    nameEn: 'Quill Pen',
    nibThickness: '2.4 مم',
    desc: 'ريشة إوز بيضاء طبيعية لضربات انسيابية رشيقة وملمس حريري'
  },
  {
    id: 'glass_pen',
    nameAr: 'قلم زجاجي',
    nameEn: 'Glass Pen',
    nibThickness: '3.0 مم',
    desc: 'قلم زجاج مورانو حلزوني لسيلان شعري فائق النقاء وتدفق متزن'
  },
  {
    id: 'qasab_pen',
    nameAr: 'قلم قصب',
    nameEn: 'Qasab Pen',
    nibThickness: '4.2 مم',
    desc: 'قصبة طبيعية مشطوفة لخطوط الثلث والنسخ والرقعة بميزان كلاسيكي أصيل'
  },
  {
    id: 'bamboo_pen',
    nameAr: 'قلم خيزران',
    nameEn: 'Bamboo Pen',
    nibThickness: '6.0 مم',
    desc: 'خيزران ذهبي عريض للخطوط الجلية واللوحات الكبرى بسيلان ثري'
  },
  {
    id: 'marker_pen',
    nameAr: 'قلم ماركر جلي',
    nameEn: 'Marker Pen',
    nibThickness: '8.5 مم',
    desc: 'ماركر شطف فاحم عريض لكثافة حبرية هندسية عالية وخطوط طومار ضخمة'
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
  onQuoteTextChange,
  onOpenTashkeel,
  authorName,
  onAuthorNameChange,
  onUploadCustomBg,
  customBgUrl
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      return;
    }
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
    <div className="w-full h-[154px] min-h-[154px] max-h-[154px] bg-[#0d0f13] border-t border-[#262016] px-4 py-2 select-none flex flex-col justify-between relative z-30 shadow-2xl">
      
      {/* 1. DYNAMIC CAROUSEL CONTENT (All tabs strictly unified to identical container height) */}
      <div className="w-full h-[132px] flex items-center">

        {/* 1.A BACKGROUNDS TRAY */}
        {activeTab === 'background' && (
          <div className="relative w-full h-full flex items-center gap-2">
            <input
              type="file"
              ref={bgFileInputRef}
              accept="image/*"
              onChange={onUploadCustomBg}
              className="hidden"
            />

            <button
              type="button"
              onClick={scrollRightSmooth}
              className="w-7 h-11 shrink-0 flex items-center justify-center text-[#e5b84c] hover:text-[#ffd700] hover:bg-[#1a1c22] rounded-lg transition active:scale-90 cursor-pointer"
              title="التمرير لليمين"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 h-full flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 scroll-smooth"
            >
              {/* Custom Image Upload Card */}
              <div
                onClick={() => bgFileInputRef.current?.click()}
                className={`shrink-0 w-[92px] h-[116px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 p-2 transition-all duration-200 cursor-pointer active:scale-95 relative group ${
                  selectedBackground === 'custom_uploaded' && customBgUrl
                    ? 'border-[#e5b84c] bg-[#1a1710] shadow-md shadow-amber-950/40 ring-1 ring-[#e5b84c]'
                    : 'border-[#4a3a24] bg-[#0c0e12] hover:border-[#e5b84c] hover:bg-[#15171d]'
                }`}
                title="رفع خلفية خاصة من جهازك"
              >
                {customBgUrl ? (
                  <div className="w-full h-16 rounded-lg overflow-hidden relative shadow-inner border border-[#a68038]/50">
                    <img src={customBgUrl} alt="خلفية مخصصة" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#1e1913] border border-[#a68038]/50 flex items-center justify-center text-[#e5b84c] group-hover:scale-110 transition">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                )}
                <span className="text-[10px] font-bold text-[#f3cf7a] text-center leading-tight">
                  {customBgUrl ? 'خلفيتك' : 'رفع خلفية'}
                </span>
              </div>

              {/* Standard 12 Backgrounds */}
              {STUDIO_BACKGROUND_OPTIONS.map(bg => {
                const isSelected = selectedBackground === bg.id;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => onSelectBackground(bg.id)}
                    className={`shrink-0 w-[86px] h-[116px] rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer active:scale-95 relative group ${
                      isSelected
                        ? 'border-[#e5b84c] ring-2 ring-[#e5b84c]/50 shadow-lg shadow-amber-950/30 scale-102'
                        : 'border-[#3a2c16] hover:border-[#a68038]/70 hover:scale-101'
                    }`}
                    title={bg.name}
                  >
                    {bg.renderThumbnail}
                    <div className={`absolute inset-x-0 bottom-0 py-1 px-0.5 text-[9px] font-bold text-center truncate ${isSelected ? 'bg-black/85 text-[#f3cf7a]' : 'bg-black/65 text-[#d8d0c5]'}`}>
                      {bg.name}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={scrollLeftSmooth}
              className="w-7 h-11 shrink-0 flex items-center justify-center text-[#e5b84c] hover:text-[#ffd700] hover:bg-[#1a1c22] rounded-lg transition active:scale-90 cursor-pointer"
              title="التمرير لليسار"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
        )}

        {/* 1.B ORNAMENTS TRAY */}
        {activeTab === 'ornament' && (
          <div className="relative w-full h-full flex items-center gap-2">
            <button
              type="button"
              onClick={scrollRightSmooth}
              className="w-7 h-11 shrink-0 flex items-center justify-center text-[#e5b84c] hover:text-[#ffd700] hover:bg-[#1a1c22] rounded-lg transition active:scale-90 cursor-pointer"
              title="التمرير لليمين"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 h-full flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 scroll-smooth"
            >
              {STUDIO_ORNAMENT_ITEMS.map(orn => {
                const isSelected = selectedOrnament === orn.id;
                return (
                  <button
                    key={orn.id}
                    type="button"
                    onClick={() => onSelectOrnament(orn.id)}
                    className={`shrink-0 w-[96px] h-[116px] rounded-xl border-2 bg-[#090b0e] p-2 flex flex-col items-center justify-between transition-all duration-200 cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'border-[#e5b84c] ring-2 ring-[#e5b84c]/50 shadow-lg shadow-amber-950/30 scale-102 bg-[#14120e]'
                        : 'border-[#3a2c16] hover:border-[#a68038]/70 hover:scale-101'
                    }`}
                    title={orn.name}
                  >
                    <div className="w-14 h-14 flex items-center justify-center pointer-events-none mt-1">
                      {orn.renderIcon}
                    </div>
                    <span className={`text-[10px] font-bold truncate w-full text-center pb-0.5 ${isSelected ? 'text-[#f3cf7a]' : 'text-[#8c949e]'}`}>
                      {orn.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={scrollLeftSmooth}
              className="w-7 h-11 shrink-0 flex items-center justify-center text-[#e5b84c] hover:text-[#ffd700] hover:bg-[#1a1c22] rounded-lg transition active:scale-90 cursor-pointer"
              title="التمرير لليسار"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
        )}

        {/* 1.C COLORS & FOILS TRAY */}
        {activeTab === 'color' && (
          <div className="relative w-full h-full rounded-2xl border border-[#3a2c16] bg-[#090b0e] p-2 flex items-center gap-2">
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

            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 h-full flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 scroll-smooth"
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
                      className={`relative shrink-0 w-12 h-12 rounded-[10px] p-0.5 border-2 transition active:scale-95 cursor-pointer ${
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

              {/* GROUP 2: Foils */}
              <div className="flex items-center gap-2 pr-1 border-l border-[#24211a] pl-3">
                {STUDIO_COLOR_SWATCHES.filter(s => s.type === 'foil').map(swatch => {
                  const isSelected = isGoldFoil && (selectedFoilStyle === swatch.foilStyleId || (!selectedFoilStyle && swatch.id === 'pure_gold_24k'));
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
                      className={`relative shrink-0 w-12 h-12 rounded-[10px] p-0.5 border-2 transition active:scale-95 cursor-pointer ${
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

              {/* GROUP 3: Pigments */}
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
                      className={`relative shrink-0 w-12 h-12 rounded-[10px] p-0.5 border-2 transition active:scale-95 cursor-pointer ${
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

              {/* Custom Color Picker */}
              <div className="shrink-0 pl-1">
                <button
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  className="w-12 h-12 rounded-[10px] p-0.5 border-2 border-[#523d1d] hover:border-[#e5b84c] transition active:scale-95 cursor-pointer flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFA500 45deg, #FFFF00 90deg, #008000 135deg, #00FFFF 180deg, #0000FF 225deg, #800080 270deg, #FF0000 360deg)'
                  }}
                  title="اختيار لون مخصص من الطيف اللوني"
                >
                  <div className="w-5 h-5 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-[11px] font-bold">
                    +
                  </div>
                </button>
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
              </div>
            </div>

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

        {/* 1.D PENS TRAY */}
        {activeTab === 'pen' && (
          <div className="w-full h-full rounded-2xl border border-[#3a2719] bg-[#0c0906] p-2 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex-1 h-full flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {STUDIO_PEN_ITEMS.map((pen, idx) => {
                const isSelected = selectedPen === pen.id;
                return (
                  <div key={pen.id} className="flex flex-col items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectPen(pen.id)}
                      className={`w-[80px] sm:w-[86px] h-[120px] rounded-xl flex flex-col items-center justify-between p-1 transition-all duration-200 active:scale-95 cursor-pointer relative group overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#2a100b] via-[#1c0b07] to-[#120604] border-2 border-[#f3db9e] ring-2 ring-[#e5b84c]/60 shadow-[0_0_18px_rgba(229,184,76,0.4)]'
                          : 'bg-gradient-to-b from-[#1a120e] via-[#120c09] to-[#0a0705] border border-[#3a2719] hover:border-[#a68038]/70 hover:bg-[#1e1510]'
                      }`}
                      title={`${pen.nameAr} (${pen.nameEn}) - سماكة: ${pen.nibThickness}`}
                    >
                      <div className="absolute inset-x-2 top-2 bottom-9 bg-black/50 rounded-lg shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] pointer-events-none" />
                      <div className="absolute top-1 right-1 z-15 bg-[#2a180e] border border-[#a68038]/60 text-[#f3cf7a] text-[8px] font-mono px-1 rounded">
                        {idx + 1}
                      </div>
                      <div className="w-9 h-[70px] relative z-10 flex items-center justify-center pointer-events-none mt-0.5">
                        <CalligraphyToolFigure
                          toolId={pen.id}
                          isSelected={isSelected}
                          className="w-full h-full"
                        />
                      </div>
                      <div
                        className={`w-full h-[32px] rounded-md px-1 flex flex-col items-center justify-center relative shadow-sm border transition-all z-10 ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#fff2cc] via-[#e5b84c] to-[#a67923] border-[#ffe699] text-[#2b1704]'
                            : 'bg-gradient-to-b from-[#e3bf73] via-[#c99e46] to-[#87601d] border-[#664612] text-[#1f1003]'
                        }`}
                      >
                        <span className="text-[10px] font-black font-tajawal leading-tight whitespace-nowrap">
                          {pen.nameAr}
                        </span>
                        <span className="text-[8px] font-mono font-bold text-[#452702] leading-none whitespace-nowrap">
                          {pen.nibThickness}
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Stepper */}
            <div className="shrink-0 flex flex-col items-center gap-1 px-3 border-x border-[#282115]">
              <span className="text-[11px] font-bold text-[#e5b84c] font-tajawal">حجم الخط</span>
              <div className="w-14 h-9 rounded-xl border border-[#a68038] bg-[#0c0e12] flex items-center justify-center shadow-inner">
                <span className="text-base font-bold text-white font-mono">{fontSize}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onFontSizeChange(Math.max(48, fontSize - 6))}
                  className="w-6 h-6 rounded-md border border-[#a68038]/70 bg-[#1c140d] hover:bg-[#331c10] text-[#f3cf7a] flex items-center justify-center text-xs font-bold transition active:scale-90 cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => onFontSizeChange(Math.min(180, fontSize + 6))}
                  className="w-6 h-6 rounded-md border border-[#a68038]/70 bg-[#1c140d] hover:bg-[#331c10] text-[#f3cf7a] flex items-center justify-center text-xs font-bold transition active:scale-90 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Live Stroke preview */}
            <div className="shrink-0 hidden lg:flex flex-col items-center gap-1">
              <div
                className="w-40 h-22 rounded-xl border border-[#a68038]/80 bg-[#faf4ea] p-2 flex flex-col justify-between shadow-lg relative overflow-hidden"
                style={{
                  backgroundImage: 'radial-gradient(ellipse at 50% 50%, #fffbf4 0%, #f6ece0 70%, #eddcc8 100%)'
                }}
              >
                <div className="w-full h-0.5 bg-[#a89f91] rounded-full opacity-70" />
                <div className="w-[90%] h-1 bg-[#18181b] rounded-full" />
                <div className="w-full h-3 flex items-center">
                  <svg viewBox="0 0 160 20" className="w-full h-full" fill="none">
                    <path
                      d="M5 12 Q30 2 60 10 T120 12 T155 8"
                      stroke={isGoldFoil ? '#d4af37' : selectedInk}
                      strokeWidth={
                        selectedPen === 'marker_pen' ? '6.5' :
                        selectedPen === 'bamboo_pen' ? '5.0' :
                        selectedPen === 'qasab_pen' ? '3.8' :
                        selectedPen === 'glass_pen' ? '2.8' :
                        selectedPen === 'quill_pen' ? '2.2' :
                        selectedPen === 'modern_pen' ? '1.8' : '1.0'
                      }
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <span className="text-[9px] text-[#a68038] font-tajawal">سيلان القلم المختار</span>
            </div>
          </div>
        )}

        {/* 1.E FONTS TRAY (يشمل رقعة إنك وكافة الخطوط الأصيلة) */}
        {activeTab === 'font' && (
          <div className="w-full h-full flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'thuluth', label: 'خَطُّ الثُّلُثِ الجَلِيّ', className: 'font-thuluth' },
              { id: 'diwani', label: 'الخَطُّ الدِّيوَانِيُّ', className: 'font-diwani' },
              { id: 'aref_ruqaa_ink', label: 'خَطُّ الرُّقْعَةِ إنك', className: 'font-aref-ink' },
              { id: 'ruqah', label: 'خَطُّ الرُّقْعَةِ الأَصِيل', className: 'font-ruqah' },
              { id: 'reem_kufi_ink', label: 'خَطُّ رِيد كُوفِي إنْك', className: 'font-reem-kufi-ink' },
              { id: 'naskh', label: 'خَطُّ النَّسْخِ القُرْآنِيّ', className: 'font-naskh' },
              { id: 'kufi', label: 'الْخَطُّ الْكُوفِيُّ المَصَاحِفِيّ', className: 'font-kufi' },
              { id: 'nastaliq', label: 'خَطُّ التَّعْلِيقِ (نَسْتَعْلِيق)', className: 'font-nastaliq' },
              { id: 'gulzar', label: 'خَطُّ الْغُلْزَارِ السُّلْطَانِيّ', className: 'font-gulzar' },
              { id: 'rakkas', label: 'خَطُّ الرَّقَّاصِ الإِبْدَاعِيّ', className: 'font-rakkas' },
              { id: 'marhey', label: 'خَطُّ مَرْحَى الرِّيشِيّ', className: 'font-marhey' },
              { id: 'amiri', label: 'خَطُّ الأَمِيرِيِّ المَلَكِيّ', className: 'font-amiri' },
              { id: 'katibeh', label: 'خَطُّ الكَاتِبَةِ التُّرَاثِيّ', className: 'font-katibeh' },
              { id: 'elmessiri', label: 'خَطُّ المَسِيرِي الأَنْدَلُسِيّ', className: 'font-elmessiri' },
              { id: 'zain', label: 'خَطُّ الزَّيْنِ الانْسِيَابِيّ', className: 'font-zain' },
{ id: 'alarabiya', label: 'خَطُّ الْعَرَبِيَّةِ', className: 'font-alarabiya' },
{ id: 'molhim', label: 'خَطُّ مُلْهِم', className: 'font-molhim' },
{ id: 'sulimany', label: 'خَطُّ السُّلَيْمَانِي', className: 'font-sulimany' },
{ id: 'hsn_naskh', label: 'حَسَن نَسْخ', className: 'font-hsn-naskh' }
            ].map(f => {
              const isSelected = selectedFont === f.className;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onSelectFont(f.className)}
                  className={`shrink-0 px-4 h-14 rounded-xl border-2 flex items-center justify-center transition active:scale-95 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#3b1419] border-[#e5b84c] text-[#f3cf7a] shadow-lg shadow-red-950/30 font-bold scale-102'
                      : 'bg-[#090b0e] border-[#292218] text-[#d8d0c5] hover:border-[#a68038]/60 hover:text-white'
                  }`}
                >
                  <span className={`${f.className} text-xl`}>{f.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 1.F SIZES TRAY */}
        {activeTab === 'size' && (
          <div className="w-full h-full flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
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
                  className={`shrink-0 px-4 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition active:scale-95 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#3b1419] border-[#e5b84c] text-[#f3cf7a] shadow-lg shadow-red-950/30 font-bold scale-102'
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

        {/* 1.G TEXT TRAY */}
        {activeTab === 'text' && (
          <div className="w-full h-full flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            {onQuoteTextChange && (
              <div className="shrink-0 flex items-center gap-2 bg-[#090b0e] border border-[#3d3222] rounded-xl px-3 h-14 shadow-sm">
                <span className="text-[#a68038] text-xs font-bold whitespace-nowrap">النص:</span>
                <input
                  type="text"
                  value={quoteText || ''}
                  onChange={(e) => onQuoteTextChange(e.target.value)}
                  placeholder="اكتب النص هنا..."
                  className="bg-transparent text-white text-base focus:outline-none w-44 sm:w-64 font-tajawal"
                />
              </div>
            )}

            {onOpenTashkeel && (
              <button
                type="button"
                onClick={onOpenTashkeel}
                className="shrink-0 px-4 h-14 rounded-xl border border-[#a68038] bg-[#1a130e] hover:bg-[#3b1419] text-[#f3cf7a] transition flex items-center gap-2 text-xs font-bold whitespace-nowrap cursor-pointer active:scale-95 shadow-sm"
                title="تشكيل النص وضبط الحركات"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#e5b84c]">
                  <polyline points="4 7 4 4 20 4 20 7" />
                  <line x1="9" y1="20" x2="15" y2="20" />
                  <line x1="12" y1="4" x2="12" y2="20" />
                </svg>
                <span>تشكيل النص</span>
              </button>
            )}

            {onAuthorNameChange && (
              <div className="shrink-0 flex items-center gap-2 bg-[#090b0e] border border-[#3d3222] rounded-xl px-3 h-14 shadow-sm">
                <span className="text-[#a68038] text-xs font-bold whitespace-nowrap">توقيع الخطاط:</span>
                <input
                  type="text"
                  value={authorName || ''}
                  onChange={(e) => onAuthorNameChange(e.target.value)}
                  placeholder="اسم الخطاط..."
                  className="bg-transparent text-white text-xs focus:outline-none w-28 sm:w-36 font-tajawal"
                />
              </div>
            )}

            {/* Presets */}
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
                className="shrink-0 px-4 h-14 rounded-xl border border-[#292218] bg-[#090b0e] text-[#d8d0c5] hover:border-[#e5b84c] hover:text-[#f3cf7a] transition active:scale-95 cursor-pointer whitespace-nowrap flex items-center justify-center font-amiri text-base"
              >
                {q}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* 2. SLIM SCROLL PROGRESS TRACK */}
      <div className="w-full h-1 bg-[#181a20] rounded-full overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-l from-[#e5b84c] to-[#a68038] rounded-full transition-all duration-150"
          style={{
            width: '30%',
            transform: `translateX(${scrollProgress * 200}%)`
          }}
        />
      </div>

    </div>
  );
};
