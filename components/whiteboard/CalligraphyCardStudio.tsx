import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import {
  PenTool,
  Move,
  ZoomIn,
  Grid3X3,
  RotateCcw,
  RotateCw,
  Eye,
  Download,
  Save,
  BookOpen,
  Sparkles,
  X,
  Check,
  FolderHeart,
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';
import { CalligraphyToolFigure } from './CalligraphyToolFigure';
import { CalligraphyHeaderBanner } from './CalligraphyHeaderBanner';
import { CalligraphyPenNibId, getCalligraphyPenDynamics } from './calligraphyStudioData';
import { CalligraphyOrnaments, ORNAMENT_OPTIONS, OrnamentStyleId } from './CalligraphyOrnaments';
import { CalligraphyStudioTray } from './CalligraphyStudioTray';

interface CalligraphyCardStudioProps {
  initialText?: string;
  studentName?: string;
  onCloseStudio?: () => void;
  isReadOnly?: boolean;
}

// Arabic Calligraphy Fonts (including requested: Reem Kufi Ink, Alarabiya, Molhim, Sulimany, Aref Ruqaa Ink, HSN Naskh)
export interface FontOption {
  id: string;
  label: string;
  className: string;
}

export const CALLIGRAPHY_FONTS: FontOption[] = [
  { id: 'thuluth', label: 'ثُلُث', className: 'font-thuluth' },
  { id: 'naskh', label: 'نَسْخ', className: 'font-naskh' },
  { id: 'diwani', label: 'دِيوَانِي', className: 'font-diwani' },
  { id: 'kufi', label: 'كُوفِي', className: 'font-kufi' },
  { id: 'ruqah', label: 'رُقْعَة', className: 'font-ruqah' },
  { id: 'reem_kufi_ink', label: 'رِيم كُوفِي إنك', className: 'font-reem-ink' },
  { id: 'alarabiya', label: 'خَطُّ الْعَرَبِيَّةِ', className: 'font-alarabiya' },
  { id: 'molhim', label: 'خَطُّ مُلْهِم', className: 'font-molhim' },
  { id: 'sulimany', label: 'خَطُّ السُّلَيْمَانِي', className: 'font-sulimany' },
  { id: 'aref_ruqaa_ink', label: 'رُقْعَة إنك', className: 'font-aref-ink' },
  { id: 'hsn_naskh', label: 'حَسَن نَسْخ', className: 'font-hsn-naskh' },
  { id: 'nastaliq', label: 'نَسْتَعْلِيق', className: 'font-nastaliq' }
];

// Authentic Calligraphy Instruments with Dynamic Scaling and Weight
export interface PenInstrument {
  id: CalligraphyPenNibId;
  label: string;
  desc: string;
  nibWidth: string;
  scale: number;
  weight: number;
  opacity: number;
  effectShadow?: string;
}

export const CALLIGRAPHY_PENS: PenInstrument[] = [
  {
    id: 'qasab_pen',
    label: 'قلم قصب',
    desc: 'قصبة طبيعية مشطوفة لخطوط الثلث والنسخ بميزان كلاسيكي أصيل',
    nibWidth: '3.5',
    scale: 1.0,
    weight: 700,
    opacity: 1.0,
    effectShadow: '0 2px 4px rgba(0,0,0,0.22)'
  },
  {
    id: 'bamboo_pen',
    label: 'قلم خيزران',
    desc: 'خيزران ذهبي عريض للخطوط الجلية الكبرى بسيلان ثري وضربات غامرة',
    nibWidth: '5.5',
    scale: 1.32,
    weight: 950,
    opacity: 1.0,
    effectShadow: '0 3px 6px rgba(0,0,0,0.35)'
  },
  {
    id: 'metal_pen',
    label: 'قلم معدني',
    desc: 'ريشة فولاذية دقيقة للنستعليق والتواقيع والحلي الرشيقة فائقة النحافة',
    nibWidth: '1.2',
    scale: 0.80,
    weight: 300,
    opacity: 0.98,
    effectShadow: '0 0.5px 1px rgba(0,0,0,0.15)'
  },
  {
    id: 'quill_pen',
    label: 'قلم ريشة',
    desc: 'ريشة إوز بيضاء طبيعية لضربات انسيابية رشيقة وملمس حريري رفيع',
    nibWidth: '1.8',
    scale: 0.88,
    weight: 400,
    opacity: 0.95,
    effectShadow: '0 1px 2px rgba(0,0,0,0.18)'
  },
  {
    id: 'glass_pen',
    label: 'قلم زجاجي',
    desc: 'قلم زجاج مورانو حلزوني لسيلان شعري فائق النقاء وتدفق متزن',
    nibWidth: '2.0',
    scale: 0.92,
    weight: 500,
    opacity: 0.97,
    effectShadow: '0 1.5px 3px rgba(0,0,0,0.22)'
  },
  {
    id: 'modern_pen',
    label: 'قلم حديث',
    desc: 'قلم حبر مذهب بمقبض خشب الجوز لخطوط عصرية متوازنة متناسقة',
    nibWidth: '2.8',
    scale: 1.06,
    weight: 650,
    opacity: 1.0,
    effectShadow: '0 2px 4px rgba(0,0,0,0.25)'
  },
  {
    id: 'marker_pen',
    label: 'قلم ماركر',
    desc: 'ماركر شطف فاحم عريض لكثافة حبرية هندسية عالية وخطوط جليّة',
    nibWidth: '6.0',
    scale: 1.36,
    weight: 950,
    opacity: 1.0,
    effectShadow: '0 4px 8px rgba(0,0,0,0.45)'
  }
];

// Helper to safely get pen instrument with fallbacks for legacy IDs
export const getActivePenInstrument = (id: string): PenInstrument => {
  const match = CALLIGRAPHY_PENS.find(p => p.id === id);
  if (match) return match;
  if (id === 'reed_qalam' || id === 'graphite_pencil') return CALLIGRAPHY_PENS[0];
  if (id === 'wet_wash') return CALLIGRAPHY_PENS[1];
  if (id === 'flex_quill' || id === 'tashkeel_dotting') return CALLIGRAPHY_PENS[2];
  if (id === 'sable_brush') return CALLIGRAPHY_PENS[5];
  if (id === 'broad_tomar') return CALLIGRAPHY_PENS[6];
  return CALLIGRAPHY_PENS[0];
};

// 16 Professional Artist & Calligrapher Color Swatches
export interface InkColor {
  id: string;
  label: string;
  value: string;
  isGold?: boolean;
}

export const INK_COLORS: InkColor[] = [
  { id: 'black', label: 'فاحم كربوني', value: '#121212' },
  { id: 'gold24', label: 'تذهيب ۲٤', value: '#c59b27', isGold: true },
  { id: 'silver', label: 'فضي لؤلؤي', value: '#9ea8b6' },
  { id: 'bronze', label: 'برونزي عتيق', value: '#8c5e2d' },
  { id: 'crimson', label: 'دم الغزال', value: '#8b1e2a' },
  { id: 'burgundy', label: 'عنابي ملكي', value: '#4c151c' },
  { id: 'indigo', label: 'نيلي لازورد', value: '#1a293d' },
  { id: 'royal_blue', label: 'كحلي أندلسي', value: '#0f1d33' },
  { id: 'turquoise', label: 'تركواز شامي', value: '#0d5c63' },
  { id: 'emerald', label: 'زمردي عميق', value: '#153d2b' },
  { id: 'olive', label: 'زيتي عتيق', value: '#2b3819' },
  { id: 'saffron', label: 'زعفراني مذهب', value: '#d97706' },
  { id: 'walnut', label: 'جوزي دافئ', value: '#3a2214' },
  { id: 'parchment_beige', label: 'بيج مقهر', value: '#bfa782' },
  { id: 'pure_white', label: 'أبيض عاجي', value: '#f8f5ee' },
  { id: 'royal_purple', label: 'أرجواني إمبراطوري', value: '#431c4f' }
];

// 12 Standard Geometric & Artistic Size Presets (A3, A4 + 10 standard design ratios)
export interface SizePreset {
  id: string;
  label: string;
  subtitle: string;
  ratio: number;
  widthUnits: number;
  heightUnits: number;
}

export const SIZE_PRESETS: SizePreset[] = [
  { id: 'A3', label: 'A3', subtitle: '42 × 29.7 سم', ratio: 1.414, widthUnits: 17, heightUnits: 24 },
  { id: 'A4', label: 'A4', subtitle: '29.7 × 21 سم', ratio: 1.414, widthUnits: 17, heightUnits: 24 },
  { id: '1:1', label: '1:1', subtitle: 'مربع قياسي', ratio: 1.0, widthUnits: 20, heightUnits: 20 },
  { id: '4:3', label: '4:3', subtitle: 'أفقي كلاسيكي', ratio: 4 / 3, widthUnits: 24, heightUnits: 18 },
  { id: '3:4', label: '3:4', subtitle: 'طولي قياسي', ratio: 3 / 4, widthUnits: 18, heightUnits: 24 },
  { id: '16:9', label: '16:9', subtitle: 'عريض سينمائي', ratio: 16 / 9, widthUnits: 26, heightUnits: 14.6 },
  { id: '9:16', label: '9:16', subtitle: 'ستوري عمودي', ratio: 9 / 16, widthUnits: 14.6, heightUnits: 26 },
  { id: '3:2', label: '3:2', subtitle: 'فوتوغرافي أفقي', ratio: 3 / 2, widthUnits: 24, heightUnits: 16 },
  { id: '2:3', label: '2:3', subtitle: 'فوتوغرافي عمودي', ratio: 2 / 3, widthUnits: 16, heightUnits: 24 },
  { id: '1.75:1', label: '1.75:1', subtitle: 'بانوراما عريضة', ratio: 1.75, widthUnits: 26, heightUnits: 15 },
  { id: '2:1', label: '2:1', subtitle: 'عريض مزدوج', ratio: 2.0, widthUnits: 26, heightUnits: 13 },
  { id: '1:2', label: '1:2', subtitle: 'طولي ممتد', ratio: 0.5, widthUnits: 13, heightUnits: 26 }
];

// 10 Ultra-Luxury Studio Backgrounds
export interface LuxuryBackground {
  id: string;
  name: string;
  desc: string;
  isDark: boolean;
  style: React.CSSProperties;
  previewBg: string;
}

export const LUXURY_BACKGROUNDS: LuxuryBackground[] = [
  {
    id: 'parchment_cream',
    name: 'ورق قديم طبيعي',
    desc: 'مخطوط عتيق بألياف طبيعية وتعتيق بيج مذهب',
    isDark: false,
    previewBg: '#eee5d6',
    style: {
      backgroundColor: '#eee5d6',
      backgroundImage: `
        radial-gradient(ellipse at 50% 50%, #faf3e8 0%, #ede3d2 65%, #dfd2bd 100%),
        repeating-linear-gradient(45deg, rgba(140, 110, 70, 0.02) 0px, rgba(140, 110, 70, 0.02) 2px, transparent 2px, transparent 6px)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85)'
    }
  },
  {
    id: 'charcoal_slate',
    name: 'حجر الفحم والرماد',
    desc: 'لوح بازلتي حجري داكن غير لامع عالي الفخامة',
    isDark: true,
    previewBg: '#1c1e23',
    style: {
      backgroundColor: '#1b1d22',
      backgroundImage: `
        radial-gradient(circle at 50% 50%, #272a31 0%, #181a1f 70%, #0f1013 100%)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.12) inset'
    }
  },
  {
    id: 'imperial_burgundy',
    name: 'مخمل عنابي سلطاني',
    desc: 'مخمل إمبراطوري غني بألوان الياقوت الخمري',
    isDark: true,
    previewBg: '#2a0c12',
    style: {
      backgroundColor: '#260b10',
      backgroundImage: `
        radial-gradient(ellipse at 50% 50%, #44141d 0%, #290b10 65%, #180508 100%),
        repeating-linear-gradient(60deg, rgba(212, 175, 55, 0.05) 0px, rgba(212, 175, 55, 0.05) 2px, transparent 2px, transparent 10px)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(197, 155, 39, 0.4) inset'
    }
  },
  {
    id: 'black_gold_marble',
    name: 'رخام أسود بعروق ذهبية',
    desc: 'رخام أوبسيديان فاحم بصدوع وشرايين الذهب ۲٤',
    isDark: true,
    previewBg: '#0e0e11',
    style: {
      backgroundColor: '#0c0c0e',
      backgroundImage: `
        linear-gradient(135deg, rgba(197, 155, 39, 0.32) 0%, transparent 35%, rgba(245, 208, 102, 0.36) 55%, transparent 75%),
        radial-gradient(circle at 30% 30%, #17171c 0%, #0c0c0e 70%, #050507 100%)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(197, 155, 39, 0.5) inset'
    }
  },
  {
    id: 'antique_leather',
    name: 'جلد عتيق / رق الغزال',
    desc: 'جلد مدبوغ بلون الكراميل الدافئ ومسام أصيلة',
    isDark: false,
    previewBg: '#ba9460',
    style: {
      backgroundColor: '#ba9460',
      backgroundImage: `
        radial-gradient(ellipse at 50% 50%, #cfa874 0%, #ba9460 65%, #947141 100%)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85)'
    }
  },
  {
    id: 'hammered_gold',
    name: 'تذهيب خالص / رقائق ذهب',
    desc: 'صفائح ذهب خالص بملمس مطروق لامع',
    isDark: false,
    previewBg: '#d4af37',
    style: {
      backgroundColor: '#d4af37',
      backgroundImage: `
        linear-gradient(135deg, #ffe082 0%, #e6b800 45%, #b38600 100%)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.3) inset'
    }
  },
  {
    id: 'sapphire_night',
    name: 'أزرق ياقوتي داكن',
    desc: 'زرقة لازوردية عميقة ملوكية مع وهج ليلي دافئ',
    isDark: true,
    previewBg: '#0c1626',
    style: {
      backgroundColor: '#0a1220',
      backgroundImage: `
        radial-gradient(ellipse at 50% 40%, #16243d 0%, #0b1424 60%, #050a14 100%),
        radial-gradient(circle at 80% 80%, rgba(197, 155, 39, 0.18) 0%, transparent 50%)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(197, 155, 39, 0.4) inset'
    }
  },
  {
    id: 'emerald_silk',
    name: 'حرير زمردي ملكي',
    desc: 'حرير أخضر ملكي بطيات ضوئية انسيابية',
    isDark: true,
    previewBg: '#093624',
    style: {
      backgroundColor: '#072418',
      backgroundImage: `
        linear-gradient(135deg, #052417 0%, #0d4f34 50%, #041a11 100%)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(212, 175, 55, 0.35) inset'
    }
  },
  {
    id: 'islamic_black_gold',
    name: 'نقش إسلامي أسود وذهب',
    desc: 'أرابيسك إسلامي هندسي مذهب على خلفية سوداء',
    isDark: true,
    previewBg: '#0a0a0c',
    style: {
      backgroundColor: '#08080a',
      backgroundImage: `
        radial-gradient(circle at 50% 50%, #17171d 0%, #08080a 70%, #020203 100%)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(197, 155, 39, 0.5) inset'
    }
  },
  {
    id: 'gold_damask',
    name: 'تطريز دمشقي مذهب',
    desc: 'تطريز نباتي دمشقي عتيق بالذهب والبرونز',
    isDark: false,
    previewBg: '#c2a67e',
    style: {
      backgroundColor: '#b89c74',
      backgroundImage: `
        radial-gradient(circle at 50% 50%, #cca87c 0%, #b89c74 70%, #9a7e58 100%)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(138, 98, 48, 0.4) inset'
    }
  },
  {
    id: 'royal_aged_parchment',
    name: 'ورق مقهر ملكي',
    desc: 'مخطوط عتيق بألياف طبيعية وتعتيق بيج مذهب',
    isDark: false,
    previewBg: '#eee5d6',
    style: {
      backgroundColor: '#eee5d6',
      backgroundImage: `
        radial-gradient(ellipse at 50% 50%, #faf3e8 0%, #ede3d2 65%, #dfd2bd 100%),
        repeating-linear-gradient(45deg, rgba(140, 110, 70, 0.02) 0px, rgba(140, 110, 70, 0.02) 2px, transparent 2px, transparent 6px)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(184, 147, 69, 0.35) inset'
    }
  },
  {
    id: 'transparent_canvas',
    name: 'خلفية شفافة PNG',
    desc: 'مفرغة تماماً للدمج في التصاميم والطباعة الحرة',
    isDark: false,
    previewBg: '#252932',
    style: {
      backgroundColor: 'transparent',
      backgroundImage: `
        linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(255,255,255,0.06) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.06) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.06) 75%)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.2) inset'
    }
  }
];

// 4 Export Formats (ordered right to left: خلفية شفافة، PDF، JPG، PNG)
export const EXPORT_FORMATS = [
  { id: 'transparent', label: 'خلفية شفافة', ext: 'شفاف' },
  { id: 'pdf', label: 'PDF', ext: 'للطباعة' },
  { id: 'jpg', label: 'JPG', ext: 'جودة عالية' },
  { id: 'png', label: 'PNG', ext: 'جودة عالية' }
];

// Inspirational Quotes Library
const INSPIRATIONAL_QUOTES = [
  'الحَمْدُ لِلَّهِ',
  'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ',
  'وَقُل رَّبِّ زِدْنِي عِلْمًا',
  'فَصَبْرٌ جَمِيلٌ',
  'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
  'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
  'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
  'الخَطُّ هَنْدَسَةٌ رُوحَانِيَّةٌ ظَهَرَتْ بِآلَةٍ جُسْمَانِيَّةٍ'
];

interface CanvasHistorySnapshot {
  text: string;
  font: string;
  pen: CalligraphyPenNibId;
  color: string;
  isGold: boolean;
  ornament: OrnamentStyleId;
  size: string;
  background: string;
  isSpecialIlluminated?: boolean;
}

export const CalligraphyCardStudio: React.FC<CalligraphyCardStudioProps> = ({
  initialText = 'الحمد لله',
  studentName = 'هشام علي',
  onCloseStudio,
  isReadOnly = false
}) => {
  // Main Canvas State
  const [quoteText, setQuoteText] = useState(initialText);
  const [selectedFont, setSelectedFont] = useState('font-thuluth');
  const [selectedPen, setSelectedPen] = useState<CalligraphyPenNibId>('qasab_pen');
  const [selectedInk, setSelectedInk] = useState('#c59b27');
  const [isGoldFoil, setIsGoldFoil] = useState(true);
  const [isSpecialIlluminated, setIsSpecialIlluminated] = useState(false);
  const [selectedOrnament, setSelectedOrnament] = useState<OrnamentStyleId>('none');
  const [selectedSize, setSelectedSize] = useState('A3');
  const [selectedBackground, setSelectedBackground] = useState('royal_aged_parchment');
  const [selectedExportFormat, setSelectedExportFormat] = useState('transparent');
  const [fontSize, setFontSize] = useState(96);
  const [selectedFoilStyle, setSelectedFoilStyle] = useState('leaf');

  // Interactive Overlays
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [activeLeftTool, setActiveLeftTool] = useState<'edit' | 'move' | 'zoom' | 'grid' | 'guide'>('edit');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'text' | 'font' | 'pen' | 'color' | 'ornament' | 'size' | 'background'>('text');

  // Author details
  const [authorName] = useState(studentName || 'هشام علي');
  const [authorYear] = useState('١٤٤٥ هـ');

  // Modals
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showTashkeelModal, setShowTashkeelModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSavedCardsModal, setShowSavedCardsModal] = useState(false);
  const [savedCards, setSavedCards] = useState<Array<{ id: string; title: string; dataUrl: string }>>([]);

  // Undo / Redo Stack
  const [history, setHistory] = useState<CanvasHistorySnapshot[]>([
    {
      text: initialText,
      font: 'font-thuluth',
      pen: 'qasab_pen',
      color: '#c59b27',
      isGold: true,
      ornament: 'andalusian_corners',
      size: 'A3',
      background: 'royal_aged_parchment',
      isSpecialIlluminated: false
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const cardCanvasRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Scroll to section when tab is clicked
  const scrollToSection = (tabId: 'text' | 'font' | 'pen' | 'color' | 'ornament' | 'size' | 'background') => {
    setActiveSidebarTab(tabId);
    const el = document.getElementById(`sidebar-section-${tabId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Push snapshot on critical changes
  const pushHistory = (partial: Partial<CanvasHistorySnapshot>) => {
    const current = history[historyIndex] || {
      text: quoteText,
      font: selectedFont,
      pen: selectedPen,
      color: selectedInk,
      isGold: isGoldFoil,
      ornament: selectedOrnament,
      size: selectedSize,
      background: selectedBackground,
      isSpecialIlluminated: isSpecialIlluminated
    };
    const nextSnapshot: CanvasHistorySnapshot = { ...current, ...partial };
    const nextHistory = history.slice(0, historyIndex + 1).concat(nextSnapshot);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setQuoteText(prev.text);
      setSelectedFont(prev.font);
      setSelectedPen(prev.pen);
      setSelectedInk(prev.color);
      setIsGoldFoil(prev.isGold);
      setSelectedOrnament(prev.ornament);
      setSelectedSize(prev.size);
      if (prev.background) setSelectedBackground(prev.background);
      if (prev.isSpecialIlluminated !== undefined) setIsSpecialIlluminated(prev.isSpecialIlluminated);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setQuoteText(next.text);
      setSelectedFont(next.font);
      setSelectedPen(next.pen);
      setSelectedInk(next.color);
      setIsGoldFoil(next.isGold);
      setSelectedOrnament(next.ornament);
      setSelectedSize(next.size);
      if (next.background) setSelectedBackground(next.background);
      if (next.isSpecialIlluminated !== undefined) setIsSpecialIlluminated(next.isSpecialIlluminated);
    }
  };

  // Load saved cards on mount
  useEffect(() => {
    try {
      const local = localStorage.getItem('qul_calligraphy_saved_cards_atelier');
      if (local) {
        setSavedCards(JSON.parse(local));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save Card to Gallery
  const handleSaveCard = async () => {
    if (!cardCanvasRef.current) return;
    try {
      const canvas = await html2canvas(cardCanvasRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: null
      });
      const dataUrl = canvas.toDataURL('image/png');
      const newCard = {
        id: `card_${Date.now()}`,
        title: quoteText.slice(0, 24) || 'لوحة خط عربي',
        dataUrl
      };
      const updated = [newCard, ...savedCards.slice(0, 19)];
      setSavedCards(updated);
      localStorage.setItem('qul_calligraphy_saved_cards_atelier', JSON.stringify(updated));

      // Golden Celebration Confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#c59b27', '#ffd700', '#dfb15b', '#5a121a']
      });
    } catch (err) {
      console.error('Error saving card:', err);
    }
  };

  // Export Card
  const handleExport = async (formatOverride?: string) => {
    if (!cardCanvasRef.current) return;
    const format = formatOverride || selectedExportFormat;

    try {
      const isTransparent = format === 'transparent';
      const canvas = await html2canvas(cardCanvasRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: isTransparent ? null : undefined
      });

      const fileName = `مِداد_${quoteText.slice(0, 15).replace(/\s+/g, '_')}`;

      if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'JPEG', 10, 10, pageWidth - 20, pageHeight - 20);
        pdf.save(`${fileName}.pdf`);
      } else if (format === 'jpg') {
        const link = document.createElement('a');
        link.download = `${fileName}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
      } else {
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }

      confetti({
        particleCount: 40,
        spread: 45,
        origin: { y: 0.85 },
        colors: ['#c59b27', '#e5c158', '#4a151b']
      });
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Tashkeel Management
  const handleInsertTashkeel = (char: string) => {
    const updated = quoteText + char;
    setQuoteText(updated);
    pushHistory({ text: updated });
    textInputRef.current?.focus();
  };

  const handleRemoveTashkeel = () => {
    const stripped = quoteText.replace(/[\u064B-\u065F\u0670]/g, '');
    setQuoteText(stripped);
    pushHistory({ text: stripped });
  };

  const handleAutoTashkeel = () => {
    const clean = quoteText.replace(/[\u064B-\u065F\u0670]/g, '').trim();
    const dictionary: Record<string, string> = {
      'الحمد لله': 'الحَمْدُ لِلَّهِ',
      'بسم الله الرحمن الرحيم': 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      'سبحان الله وبحمده': 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
      'ما شاء الله لا قوة إلا بالله': 'مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ',
      'وقل رب زدني علما': 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
      'فصبر جميل': 'فَصَبْرٌ جَمِيلٌ',
      'إن مع العسر يسرا': 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
      'حسبنا الله ونعم الوكيل': 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
      'لا حول ولا قوة إلا بالله': 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
      'الله أكبر': 'اللَّهُ أَكْبَرُ',
      'لا إله إلا الله': 'لَا إِلَٰهَ إِلَّا اللَّهُ',
      'محمد رسول الله': 'مُحَمَّدٌ رَّسُولُ اللَّهِ',
      'الصبر مفتاح الفرج': 'الصَّبْرُ مِفْتَاحُ الفَرَجِ'
    };

    if (dictionary[clean]) {
      setQuoteText(dictionary[clean]);
      pushHistory({ text: dictionary[clean] });
    } else {
      // Default: ensure common ligatures have standard marks
      setQuoteText(prev => prev + 'َ');
    }
  };

  // Pen dynamics & Active Pen Tool Configuration
  const penDynamics = getCalligraphyPenDynamics(selectedPen);
  const activePenConfig = CALLIGRAPHY_PENS.find(p => p.id === selectedPen) || CALLIGRAPHY_PENS[0];
  const penScale = activePenConfig.scale;

  const currentSizeObj = SIZE_PRESETS.find(s => s.id === selectedSize) || SIZE_PRESETS[0];
  const currentRatio = currentSizeObj.ratio;

  const currentBg = LUXURY_BACKGROUNDS.find(b => b.id === selectedBackground) || LUXURY_BACKGROUNDS[0];

  // Authentic 24k Gold Foil Styling with texture and depth
  const goldFoilStyle: React.CSSProperties = {
    backgroundImage: 'linear-gradient(135deg, #a47628 0%, #d8ad48 20%, #fff1a8 45%, #dbab42 65%, #9e6d1c 85%, #754b0e 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 2px 4px rgba(40, 25, 5, 0.45)) drop-shadow(0 1px 1px rgba(255, 255, 255, 0.35))'
  };

  // Active stroke color & distinct pen stroke simulation
  const activeStrokeColor = isSpecialIlluminated ? '#ffd700' : isGoldFoil ? '#d4af37' : selectedInk;
  const penStrokeCSS = (() => {
    switch (selectedPen) {
      case 'bamboo_pen':
      case 'wet_wash':
        return `2.8px ${activeStrokeColor}`;
      case 'marker_pen':
      case 'broad_tomar':
        return `3.4px ${activeStrokeColor}`;
      case 'metal_pen':
      case 'flex_quill':
      case 'tashkeel_dotting':
        return '0px transparent';
      case 'quill_pen':
        return `0.25px ${activeStrokeColor}`;
      case 'glass_pen':
        return `0.5px ${activeStrokeColor}`;
      case 'modern_pen':
      case 'sable_brush':
        return `1.4px ${activeStrokeColor}`;
      case 'qasab_pen':
      case 'reed_qalam':
      default:
        return `1.1px ${activeStrokeColor}`;
    }
  })();

  // Check if text is standard "الحمد لله"
  const isDefaultHamd = quoteText.replace(/[\u064B-\u065F\u0670]/g, '').trim() === 'الحمد لله';

  return (
    <div 
      className="relative w-full h-full flex flex-col bg-[#0b0d10] text-[#e6dfd5] overflow-hidden select-none font-tajawal"
      dir="rtl"
    >
      {/* ======================================================================= */}
      {/* BACKGROUND CALLIGRAPHY TAPESTRY: FAINT FLOATING DIWANI ARABIC LETTERS   */}
      {/* Authentic Diwani letters representing identity faintly in background    */}
      {/* ======================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <svg className="w-full h-full opacity-[0.035] text-[#c59b27]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="calligraphyLettersPattern" width="360" height="260" patternUnits="userSpaceOnUse">
              {/* Classical Diwani Calligraphy Letter Glyphs Scattered Gracefully and Faintly */}
              <text x="35" y="55" fontSize="50" fontFamily="diwani, serif" fill="currentColor" transform="rotate(-12 35 55)">عُ</text>
              <text x="115" y="45" fontSize="32" fontFamily="diwani, serif" fill="currentColor" transform="rotate(15 115 45)">قْ</text>
              <text x="185" y="70" fontSize="56" fontFamily="diwani, serif" fill="currentColor" transform="rotate(-6 185 70)">لـ</text>
              <text x="270" y="48" fontSize="38" fontFamily="diwani, serif" fill="currentColor" transform="rotate(20 270 48)">وُ</text>
              <text x="325" y="85" fontSize="30" fontFamily="diwani, serif" fill="currentColor">نْ</text>

              <text x="45" y="140" fontSize="44" fontFamily="diwani, serif" fill="currentColor" transform="rotate(10 45 140)">حَ</text>
              <text x="135" y="155" fontSize="60" fontFamily="diwani, serif" fill="currentColor" transform="rotate(-15 135 155)">ي</text>
              <text x="230" y="135" fontSize="46" fontFamily="diwani, serif" fill="currentColor" transform="rotate(12 230 135)">مُ</text>
              <text x="305" y="165" fontSize="48" fontFamily="diwani, serif" fill="currentColor" transform="rotate(-8 305 165)">ط</text>

              <text x="25" y="225" fontSize="44" fontFamily="diwani, serif" fill="currentColor" transform="rotate(14 25 225)">س</text>
              <text x="95" y="235" fontSize="34" fontFamily="diwani, serif" fill="currentColor">ك</text>
              <text x="170" y="220" fontSize="52" fontFamily="diwani, serif" fill="currentColor" transform="rotate(-10 170 220)">فَ</text>
              <text x="250" y="235" fontSize="38" fontFamily="diwani, serif" fill="currentColor" transform="rotate(16 250 235)">رَ</text>
              <text x="320" y="230" fontSize="42" fontFamily="diwani, serif" fill="currentColor" transform="rotate(-5 320 230)">هـ</text>

              {/* Calligraphic Mizan Diamond Dots (نقاط الميزان) */}
              <rect x="72" y="65" width="5.5" height="5.5" fill="currentColor" transform="rotate(45 75 68)" />
              <rect x="215" y="40" width="5" height="5" fill="currentColor" transform="rotate(45 217 42)" />
              <rect x="180" y="170" width="6" height="6" fill="currentColor" transform="rotate(45 183 173)" />
              <rect x="285" y="105" width="4.5" height="4.5" fill="currentColor" transform="rotate(45 287 107)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#calligraphyLettersPattern)" />
        </svg>
      </div>

      {/* ======================================================================= */}
      {/* 1. TOP HEADER BANNER: Masterpiece Panoramic Calligraphy Studio Banner   */}
      {/* Bamboo Pen & Inkwell on Right, Golden Letter Flock, Centered Title, UI   */}
      {/* ======================================================================= */}
      <CalligraphyHeaderBanner
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenGuide={() => setShowGuideModal(true)}
        onOpenSavedCards={() => setShowSavedCardsModal(true)}
        onCloseStudio={onCloseStudio}
        savedCardsCount={savedCards.length}
      />

      {/* ======================================================================= */}
      {/* 2. MAIN 3-COLUMN WORKSPACE:                                             */}
      {/* [RIGHT: INSPECTOR + FAR-RIGHT TABS] | [CENTER: EASEL] | [LEFT: TOOLBAR] */}
      {/* Pure RTL layout:                                                        */}
      {/* Child 1 = Inspector on the RIGHT                                        */}
      {/* Child 2 = Canvas Easel in the CENTER                                    */}
      {/* Child 3 = Floating Toolbar on the LEFT                                  */}
      {/* ======================================================================= */}
      <div className="flex-1 flex flex-row min-h-0 relative overflow-hidden z-10" dir="rtl">

        {/* ===================================================================== */}
        {/* 2.A RIGHT COLUMN: INSPECTOR CONTROLS + FAR-RIGHT VERTICAL TAB STRIP   */}
        {/* In RTL: Child 1 is inside (Controls), Child 2 is FAR-RIGHT (Tabs)      */}
        {/* Or we use dir="ltr" inside to ensure tabs touch the screen's right edge */}
        {/* ===================================================================== */}
        <aside 
          className="w-[440px] shrink-0 bg-[#101216] border-l border-[#24272f] flex flex-row min-h-0 z-20 shadow-2xl"
          dir="ltr"
        >
          {/* MAIN INSPECTOR CONTROLS PANEL (LEFT SIDE OF THE INSPECTOR) */}
          <div className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto no-scrollbar gap-4" dir="rtl">
            
            {/* ----------------------------------------------------------------- */}
            {/* 1. TEXT SECTION (النص)                                            */}
            {/* ----------------------------------------------------------------- */}
            <div id="sidebar-section-text" className="flex flex-col gap-1.5 scroll-mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#f0e8dc] font-tajawal">النص</span>

                {/* Tashkeel Assistant Button */}
                <button
                  type="button"
                  onClick={() => setShowTashkeelModal(true)}
                  className="text-[11px] text-[#b38a3e] hover:text-[#f3cf7a] font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="تشكيل النص وضبط الحركات تلقائياً ويدوياً"
                >
                  <Sparkles size={13} className="text-[#c59b27]" />
                  <span>تشكيل النص</span>
                </button>
              </div>

              {/* Text Input Box */}
              <div className="relative">
                <input
                  ref={textInputRef}
                  type="text"
                  value={quoteText}
                  onChange={(e) => {
                    setQuoteText(e.target.value);
                    pushHistory({ text: e.target.value });
                  }}
                  placeholder="اكتب عبارتك أو اسمك هنا..."
                  className="w-full h-10 px-3.5 bg-[#0c0e12] border border-[#26241e] focus:border-[#a68038] focus:ring-1 focus:ring-[#a68038] rounded-xl text-sm font-bold text-[#f0e8dc] focus:outline-none transition text-right"
                />
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* 2. FONTS SECTION (الخطوط) - Horizontal Smooth Scrolling           */}
            {/* Displaying every script written in its actual calligraphy style   */}
            {/* ----------------------------------------------------------------- */}
            <div id="sidebar-section-font" className="flex flex-col gap-1.5 scroll-mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#f0e8dc] font-tajawal">الخطوط</span>
                <span className="text-[10px] text-[#a68038] font-tajawal">مرر لليسار ‹</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5 scroll-smooth select-none">
                {CALLIGRAPHY_FONTS.map(font => {
                  const isSelected = selectedFont === font.className;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => {
                        setSelectedFont(font.className);
                        pushHistory({ font: font.className });
                      }}
                      className={`shrink-0 px-4 h-10 rounded-lg border text-sm transition flex items-center justify-center cursor-pointer active:scale-95 whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#3b1419] border-[#a68038] text-[#f3cf7a] shadow-sm ring-1 ring-[#a68038]/40'
                          : 'bg-[#0c0e12] border-[#26241e] text-[#b3a898] hover:border-[#a68038]/60 hover:text-white'
                      }`}
                      title={font.label}
                    >
                      {/* Authentic typography rendered in the exact calligraphy font */}
                      <span className={`${font.className} text-base`}>{font.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* 3. PEN & INK SECTION (القلم والحبر) - Horizontal Smooth Scroll    */}
            {/* Changing stroke style and scale dynamically per pen instrument    */}
            {/* ----------------------------------------------------------------- */}
            <div id="sidebar-section-pen" className="flex flex-col gap-1.5 scroll-mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#f0e8dc] font-tajawal">القلم والحبر</span>
                <span className="text-[10px] text-[#a68038] font-tajawal">مرر لليسار ‹</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5 scroll-smooth select-none">
                {CALLIGRAPHY_PENS.map(pen => {
                  const isSelected = selectedPen === pen.id;
                  return (
                    <button
                      key={pen.id}
                      type="button"
                      onClick={() => {
                        setSelectedPen(pen.id);
                        pushHistory({ pen: pen.id });
                      }}
                      className={`shrink-0 w-[82px] h-[112px] px-1.5 rounded-[10px] border flex flex-col items-center justify-between py-2 transition cursor-pointer active:scale-95 whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#3b1419] border-[#a68038] shadow-sm ring-1 ring-[#a68038]/40'
                          : 'bg-[#0c0e12] border-[#26241e] hover:border-[#a68038]/60'
                      }`}
                      title={pen.desc}
                    >
                      {/* Pen Vector Figure - Enlarged and clearer */}
                      <div className="w-9 h-[70px] flex items-center justify-center pointer-events-none">
                        <CalligraphyToolFigure
                          toolId={pen.id}
                          isSelected={isSelected}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className={`text-[11px] font-bold text-center tracking-tight ${isSelected ? 'text-[#f3cf7a] font-black' : 'text-[#d1d5db]'}`}>
                          {pen.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* 4. COLORS & INKS (الألوان) - Horizontal Scroll + Gold Foil Effect */}
            {/* ----------------------------------------------------------------- */}
            <div id="sidebar-section-color" className="flex flex-col gap-1.5 scroll-mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#f0e8dc] font-tajawal">الألوان</span>
                
                {/* Authentic Royal 24k Gold Gilding Switch */}
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !isSpecialIlluminated;
                    setIsSpecialIlluminated(nextVal);
                    if (nextVal) {
                      setIsGoldFoil(true);
                    }
                    pushHistory({ isSpecialIlluminated: nextVal, isGold: true });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                    isSpecialIlluminated
                      ? 'bg-gradient-to-r from-[#9a6e24] via-[#f3cf7a] to-[#9a6e24] text-[#2c1a06] border-[#ffd700] shadow-[0_0_12px_rgba(243,207,122,0.4)] ring-1 ring-[#ffd700]'
                      : 'bg-[#14161b] text-[#c59b27] border-[#8c6e39]/60 hover:border-[#c59b27] hover:text-[#f3cf7a]'
                  }`}
                  title="تذهيب الحروف بالذهب الخالص المضيء"
                >
                  <Sparkles size={12} className={isSpecialIlluminated ? 'animate-spin' : ''} />
                  <span>تأثير التذهيب الخالص ✨</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 pt-0.5 scroll-smooth px-1 select-none">
                {INK_COLORS.map(color => {
                  const isSelected = isGoldFoil ? color.isGold : selectedInk === color.value;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        if (color.isGold) {
                          setIsGoldFoil(true);
                          setSelectedInk(color.value);
                          pushHistory({ color: color.value, isGold: true });
                        } else {
                          setIsGoldFoil(false);
                          setIsSpecialIlluminated(false);
                          setSelectedInk(color.value);
                          pushHistory({ color: color.value, isGold: false, isSpecialIlluminated: false });
                        }
                      }}
                      className={`shrink-0 w-8 h-8 rounded-full border-2 transition flex items-center justify-center cursor-pointer active:scale-90 ${
                        isSelected
                          ? 'border-[#f3cf7a] shadow-md scale-105 ring-1 ring-[#a68038]/50'
                          : 'border-[#26241e] hover:border-[#a68038]'
                      }`}
                      style={{
                        backgroundColor: color.isGold ? '#c59b27' : color.value,
                        backgroundImage: color.isGold
                          ? 'radial-gradient(circle at 35% 35%, #fff2a8, #c59b27 70%, #855814)'
                          : undefined
                      }}
                      title={color.label}
                    >
                      {isSelected && (
                        <Check size={15} className="text-white drop-shadow-md stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* 5. ORNAMENTS SECTION (الزخارف) - Horizontal Smooth Scroll         */}
            {/* ----------------------------------------------------------------- */}
            <div id="sidebar-section-ornament" className="flex flex-col gap-1.5 scroll-mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#f0e8dc] font-tajawal">الزخارف</span>
                <span className="text-[10px] text-[#a68038] font-tajawal">مرر لليسار ‹</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5 scroll-smooth select-none">
                {ORNAMENT_OPTIONS.map(orn => {
                  const isSelected = selectedOrnament === orn.id;
                  return (
                    <button
                      key={orn.id}
                      type="button"
                      onClick={() => {
                        setSelectedOrnament(orn.id);
                        pushHistory({ ornament: orn.id });
                      }}
                      className={`shrink-0 px-3.5 h-10 rounded-lg border flex items-center gap-2 transition cursor-pointer active:scale-95 whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#3b1419] border-[#a68038] text-[#f3cf7a] shadow-sm ring-1 ring-[#a68038]/40'
                          : 'bg-[#0c0e12] border-[#26241e] text-[#9aa0a6] hover:border-[#a68038]/60 hover:text-white'
                      }`}
                      title={orn.label}
                    >
                      {orn.id === 'none' && (
                        <span className="text-sm font-bold opacity-60">⊘</span>
                      )}
                      {orn.id === 'andalusian_corners' && (
                        <svg className="w-5 h-5 text-[#c59b27]" viewBox="0 0 40 40" fill="currentColor">
                          <path d="M4,4 L36,4 C26,4 20,10 20,20 C20,30 10,30 10,30 C10,30 10,36 4,36 Z" />
                        </svg>
                      )}
                      {orn.id === 'mamluk_geometric' && (
                        <svg className="w-5 h-5 text-[#c59b27]" viewBox="0 0 40 40" fill="currentColor">
                          <polygon points="20,4 25,12 34,10 30,18 36,24 28,26 26,34 20,28 14,34 12,26 4,24 10,18 6,10 15,12" />
                        </svg>
                      )}
                      {orn.id === 'ottoman_tezhip' && (
                        <svg className="w-6 h-3 text-[#c59b27]" viewBox="0 0 60 20" fill="none">
                          <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.5" />
                          <line x1="38" y1="10" x2="58" y2="10" stroke="currentColor" strokeWidth="1.5" />
                          <polygon points="30,4 36,10 30,16 24,10" fill="currentColor" />
                        </svg>
                      )}
                      {orn.id === 'manuscript_filigree' && (
                        <div className="w-5 h-5 border-2 border-[#c59b27] rounded flex items-center justify-center">
                          <div className="w-2.5 h-2.5 border border-[#c59b27]" />
                        </div>
                      )}
                      {orn.id === 'sultani_crest' && (
                        <svg className="w-5 h-5 text-[#c59b27]" viewBox="0 0 40 40" fill="currentColor">
                          <polygon points="20,2 26,14 38,20 26,26 20,38 14,26 2,20 14,14" />
                        </svg>
                      )}
                      {orn.id === 'central_shamseh' && (
                        <svg className="w-5 h-5 text-[#c59b27]" viewBox="0 0 40 40" fill="none">
                          <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="20" cy="20" r="4" fill="currentColor" />
                          <polygon points="20,2 23,8 20,14 17,8" fill="currentColor" />
                          <polygon points="20,26 23,32 20,38 17,32" fill="currentColor" />
                        </svg>
                      )}
                      {orn.id === 'full_arabesque' && (
                        <div className="w-5 h-5 border border-dashed border-[#c59b27] rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#c59b27] rounded-sm" />
                        </div>
                      )}
                      <span className="text-xs font-bold">{orn.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* 6. SIZES SECTION (المقاسات) - Horizontal Smooth Scroll            */}
            {/* ----------------------------------------------------------------- */}
            <div id="sidebar-section-size" className="flex flex-col gap-1.5 scroll-mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#f0e8dc] font-tajawal">المقاسات</span>
                <span className="text-[10px] text-[#a68038] font-tajawal">مرر لليسار ‹</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5 scroll-smooth select-none">
                {SIZE_PRESETS.map(size => {
                  const isSelected = selectedSize === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size.id);
                        pushHistory({ size: size.id });
                      }}
                      className={`shrink-0 min-w-[76px] h-12 px-2.5 rounded-[10px] border flex flex-col items-center justify-center gap-0.5 transition cursor-pointer active:scale-95 whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#3b1419] border-[#a68038] text-white shadow-sm ring-1 ring-[#a68038]/40'
                          : 'bg-[#0c0e12] border-[#26241e] text-[#9aa0a6] hover:border-[#a68038]/60 hover:text-white'
                      }`}
                    >
                      <span className={`text-xs font-bold ${isSelected ? 'text-[#f3cf7a]' : 'text-white'}`}>
                        {size.label}
                      </span>
                      <span className="text-[9px] text-[#8c949e]">{size.subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* 7. LUXURY BACKGROUNDS (الخلفيات) - Ultra-Luxury Parchments & Textures */}
            {/* ----------------------------------------------------------------- */}
            <div id="sidebar-section-background" className="flex flex-col gap-1.5 scroll-mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#f0e8dc] font-tajawal">الخلفيات</span>
                <span className="text-[10px] text-[#a68038] font-tajawal">مرر لليسار ‹</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5 scroll-smooth select-none">
                {LUXURY_BACKGROUNDS.map(bg => {
                  const isSelected = selectedBackground === bg.id;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => {
                        setSelectedBackground(bg.id);
                        pushHistory({ background: bg.id });
                      }}
                      className={`shrink-0 min-w-[102px] h-14 px-2 rounded-[10px] border flex items-center gap-2 transition cursor-pointer active:scale-95 whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#3b1419] border-[#a68038] text-white shadow-sm ring-1 ring-[#a68038]/40'
                          : 'bg-[#0c0e12] border-[#26241e] text-[#9aa0a6] hover:border-[#a68038]/60 hover:text-white'
                      }`}
                      title={bg.desc}
                    >
                      {/* Background Thumbnail Preview */}
                      <div
                        className="w-7 h-7 rounded-full border border-[#8c6e39]/50 shrink-0 shadow-inner flex items-center justify-center overflow-hidden"
                        style={{
                          backgroundColor: bg.previewBg
                        }}
                      >
                        {bg.id === 'transparent_canvas' && (
                          <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                            <div className="bg-white/80" />
                            <div className="bg-black/50" />
                            <div className="bg-black/50" />
                            <div className="bg-white/80" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col text-right">
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-[#f3cf7a]' : 'text-[#e0d6c8]'}`}>
                          {bg.name}
                        </span>
                        <span className="text-[9px] text-[#8c949e]">
                          {bg.isDark ? 'داكنة مذهبة' : 'فاتحة كلاسيكية'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* VERTICAL CATEGORY TABS STRIP (FAR RIGHT EDGE OF THE ENTIRE SCREEN) */}
          <div className="w-20 shrink-0 bg-[#0d0f13] border-l border-[#24272f] flex flex-col items-center py-5 gap-3 select-none">
            
            {/* 1. النص (Pen/Edit) */}
            <button
              type="button"
              onClick={() => scrollToSection('text')}
              className={`w-14 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                activeSidebarTab === 'text'
                  ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm'
                  : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
              }`}
              title="النص"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
              </svg>
              <span className="text-[11px] font-bold">النص</span>
            </button>

            {/* 2. الخطوط (Calligraphic Arabic Baa 'ب') */}
            <button
              type="button"
              onClick={() => scrollToSection('font')}
              className={`w-14 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                activeSidebarTab === 'font'
                  ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm'
                  : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
              }`}
              title="الخطوط"
            >
              <span className="font-thuluth text-3xl leading-none font-bold">ب</span>
              <span className="text-[11px] font-bold">الخطوط</span>
            </button>

            {/* 3. القلم والحبر (Feather / Nib) */}
            <button
              type="button"
              onClick={() => scrollToSection('pen')}
              className={`w-14 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                activeSidebarTab === 'pen'
                  ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm'
                  : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
              }`}
              title="القلم والحبر"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L3 11.5V21h9.5z" />
                <line x1="16" y1="8" x2="2" y2="22" />
              </svg>
              <span className="text-[11px] font-bold leading-tight text-center">القلم<br />والحبر</span>
            </button>

            {/* 4. الألوان (Artist Palette) */}
            <button
              type="button"
              onClick={() => scrollToSection('color')}
              className={`w-14 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                activeSidebarTab === 'color'
                  ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm'
                  : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
              }`}
              title="الألوان"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
              </svg>
              <span className="text-[11px] font-bold">الألوان</span>
            </button>

            {/* 5. الزخارف (Arabesque Flower) */}
            <button
              type="button"
              onClick={() => scrollToSection('ornament')}
              className={`w-14 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                activeSidebarTab === 'ornament'
                  ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm'
                  : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
              }`}
              title="الزخارف"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2a4 4 0 0 0-4 4c0 2.5 4 6 4 6s4-3.5 4-6a4 4 0 0 0-4-4z" />
                <path d="M12 22a4 4 0 0 0 4-4c0-2.5-4-6-4-6s-4 3.5-4 6a4 4 0 0 0 4 4z" />
                <path d="M2 12a4 4 0 0 0 4 4c2.5 0 6-4 6-4s-3.5-4-6-4a4 4 0 0 0-4 4z" />
                <path d="M22 12a4 4 0 0 0-4-4c-2.5-6 4-6 4s3.5 4 6 4a4 4 0 0 0 4-4z" />
              </svg>
              <span className="text-[11px] font-bold">الزخارف</span>
            </button>

            {/* 6. المقاسات (Dimensions Frame) */}
            <button
              type="button"
              onClick={() => scrollToSection('size')}
              className={`w-14 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                activeSidebarTab === 'size'
                  ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm'
                  : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
              }`}
              title="المقاسات"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
              <span className="text-[11px] font-bold">المقاسات</span>
            </button>

            {/* 7. الخلفيات (Luxury Backgrounds) */}
            <button
              type="button"
              onClick={() => scrollToSection('background')}
              className={`w-14 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                activeSidebarTab === 'background'
                  ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm'
                  : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
              }`}
              title="الخلفيات"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-[11px] font-bold">الخلفيات</span>
            </button>

          </div>

        </aside>

        {/* ===================================================================== */}
        {/* 2.B CENTER COLUMN: CALLIGRAPHY PARCHMENT EASEL STAGE (المحراب)         */}
        {/* ===================================================================== */}
        <main 
          className="flex-1 flex flex-col min-h-0 bg-transparent relative overflow-hidden"
          dir="rtl"
        >
          {/* THE CANVAS SCENE */}
          <div 
            className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative"
            onPointerDown={(e) => {
              if (activeLeftTool === 'move') {
                setIsPanning(true);
                startPanRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
              }
            }}
            onPointerMove={(e) => {
              if (isPanning && activeLeftTool === 'move') {
                setPanOffset({
                  x: e.clientX - startPanRef.current.x,
                  y: e.clientY - startPanRef.current.y
                });
              }
            }}
            onPointerUp={() => setIsPanning(false)}
            onPointerLeave={() => setIsPanning(false)}
          >

            {/* THE PARCHMENT CARD SCALER BOX */}
            <div
              className="relative transition-transform duration-200 flex items-center justify-center"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                aspectRatio: `${currentRatio}`,
                width: currentRatio >= 1 ? 'min(96%, 860px)' : 'min(90%, 540px)',
                height: currentRatio >= 1 ? 'auto' : 'min(92%, 660px)',
                maxHeight: 'calc(100vh - 165px)'
              }}
            >
              {/* THE EXPORTABLE PARCHMENT CARD */}
              <div
                ref={cardCanvasRef}
                id="calligraphy-export-card"
                className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-8 sm:p-11 select-none"
                style={{
                  ...currentBg.style
                }}
              >
                {/* 1. Fine Millimeter Grid Overlay (when toggled) */}
                {showGrid && (
                  <div 
                    className="absolute inset-0 pointer-events-none z-10 opacity-30"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, #9e7d3b 1px, transparent 1px),
                        linear-gradient(to bottom, #9e7d3b 1px, transparent 1px)
                      `,
                      backgroundSize: '24px 24px'
                    }}
                  />
                )}

                {/* 2. HIGH-CRAFT ARABESQUE CALLIGRAPHY ORNAMENTS */}
                <CalligraphyOrnaments ornamentId={selectedOrnament} isDarkBackground={currentBg.isDark} />

                {/* 4. PROFESSIONAL CALLIGRAPHY GUIDELINES (ميزان الخط العربي وقواعد الحروف) */}
                {/* Precisely defines the letter baseline, ascender line, midline, and descender line */}
                {showGuidelines && (
                  <div className="absolute inset-0 pointer-events-none z-15 select-none" dir="rtl">
                    
                    {/* Measurement Scale Ruler on Left Side */}
                    <div className="absolute left-6 inset-y-0 flex flex-col justify-center gap-0 text-[#8c6e39] font-tajawal z-20">
                      <div className="relative h-64 flex flex-col justify-between">
                        
                        {/* 1. الثلث الأعلى (Ascender Line) */}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          <span className="w-2.5 h-[2px] bg-[#8c6e39]" />
                          <span className="bg-[#eee5d6]/90 px-1 py-0.5 rounded border border-[#8c6e39]/40 text-[#684f24]">الثلث الأعلى</span>
                        </div>

                        {/* 2. خط الوسط (Midline) */}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          <span className="w-2.5 h-[2px] bg-[#8c6e39]" />
                          <span className="bg-[#eee5d6]/90 px-1 py-0.5 rounded border border-[#8c6e39]/40 text-[#684f24]">خط الوسط</span>
                        </div>

                        {/* 3. سطر الأساس (Baseline - Exact Base of Calligraphy Letters) */}
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-[#5c3e0e]">
                          <span className="w-3.5 h-[3px] bg-[#a68038]" />
                          <span className="bg-[#f5ecdd] px-1.5 py-0.5 rounded border border-[#a68038] shadow-sm">سطر الأساس</span>
                        </div>

                        {/* 4. الثلث الأسفل (Descender Line) */}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          <span className="w-2.5 h-[2px] bg-[#8c6e39]" />
                          <span className="bg-[#eee5d6]/90 px-1 py-0.5 rounded border border-[#8c6e39]/40 text-[#684f24]">الثلث الأسفل</span>
                        </div>

                        {/* Calligraphic Mizan Dots Column (نقاط الميزان الماسية المعينة) */}
                        <div className="absolute right-[-14px] top-6 bottom-16 flex flex-col justify-around items-center opacity-70">
                          {[...Array(7)].map((_, dotIdx) => (
                            <div
                              key={dotIdx}
                              className="w-2 h-2 bg-[#8c6e39] rotate-45"
                              title={`نقطة ميزان ${dotIdx + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Precision Horizontal Guidelines Drawn Across the Card */}
                    <div className="absolute inset-x-8 inset-y-0 flex flex-col justify-center">
                      <div className="relative h-64 flex flex-col justify-between">
                        {/* 1. Ascender Dashed Line (أعلى الألف واللام) */}
                        <div className="w-full border-b border-dashed border-[#8c6e39]/60" />
                        
                        {/* 2. Midline (خط وسط الحروف) */}
                        <div className="w-full border-b border-dotted border-[#8c6e39]/50" />
                        
                        {/* 3. Baseline (سطر الأساس الذهبي الذي ترتكز عليه الحروف) */}
                        <div className="w-full border-b-2 border-[#a68038]/75 shadow-sm" />
                        
                        {/* 4. Descender Dashed Line (سطر قعود ونوازل الحروف) */}
                        <div className="w-full border-b border-dashed border-[#8c6e39]/60" />
                      </div>
                    </div>

                  </div>
                )}

                {/* Top Spacer with Floating Authentic Pen Character Badge */}
                <div className="shrink-0 flex items-center justify-between w-full relative z-20 pb-1">
                  <div className={`text-[11px] font-tajawal font-bold flex items-center gap-2 px-3 py-1 rounded-full border transition-all shadow-xs ${
                    currentBg.isDark
                      ? 'bg-black/50 border-[#c59b27]/40 text-[#f3cf7a]'
                      : 'bg-[#eee5d6]/80 border-[#8c6e39]/35 text-[#5c431b]'
                  }`}>
                    <span 
                      className="inline-block rounded-full shadow-xs transition-all"
                      style={{
                        width: selectedPen === 'bamboo_pen' || selectedPen === 'marker_pen' ? '9px' : selectedPen === 'metal_pen' || selectedPen === 'quill_pen' ? '4px' : '6.5px',
                        height: selectedPen === 'bamboo_pen' || selectedPen === 'marker_pen' ? '9px' : selectedPen === 'metal_pen' || selectedPen === 'quill_pen' ? '4px' : '6.5px',
                        backgroundColor: selectedPen === 'bamboo_pen' ? '#e5b84c' : selectedPen === 'metal_pen' ? '#a0aec0' : selectedPen === 'quill_pen' ? '#f5ede3' : '#c59b27'
                      }} 
                    />
                    <span>{activePenConfig.label}</span>
                    <span className="opacity-80 text-[10px]">({activePenConfig.nibWidth} مم)</span>
                  </div>
                </div>

                {/* 5. MAIN ARABIC CALLIGRAPHY ARTWORK */}
                <div className="relative z-20 my-auto flex flex-col items-center justify-center text-center px-4 w-full">
                  {isDefaultHamd && selectedFont === 'font-thuluth' ? (
                    /* Authentic Classical Thuluth Vector Composition of "الحَمْدُ لِلَّهِ" */
                    <div 
                      className="w-full max-w-lg flex items-center justify-center py-2 transition-transform duration-300"
                      style={{
                        transform: `scale(${penScale * (fontSize / 96)})`
                      }}
                    >
                      <svg
                        viewBox="0 0 540 180"
                        className="w-full h-auto drop-shadow-md overflow-visible select-text"
                      >
                        <defs>
                          <linearGradient id="calligraphyGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#9a6e24" />
                            <stop offset="25%" stopColor="#d8ad48" />
                            <stop offset="50%" stopColor="#fff2a8" />
                            <stop offset="75%" stopColor="#d4a33c" />
                            <stop offset="100%" stopColor="#7a5012" />
                          </linearGradient>
                          <linearGradient id="calligraphyPureGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffd700" />
                            <stop offset="30%" stopColor="#fff5b8" />
                            <stop offset="60%" stopColor="#d4a33c" />
                            <stop offset="100%" stopColor="#875608" />
                          </linearGradient>
                        </defs>
                        {/* Render authentic Thuluth calligraphy glyphs with responsive pen stroke dynamics */}
                        <text
                          x="270"
                          y="125"
                          textAnchor="middle"
                          fill={isSpecialIlluminated ? "url(#calligraphyPureGoldGrad)" : isGoldFoil ? "url(#calligraphyGoldGrad)" : selectedInk}
                          stroke={isSpecialIlluminated ? "url(#calligraphyPureGoldGrad)" : isGoldFoil ? "url(#calligraphyGoldGrad)" : selectedInk}
                          strokeWidth={
                            selectedPen === 'bamboo_pen' || selectedPen === 'wet_wash' ? 7.2 :
                            selectedPen === 'marker_pen' || selectedPen === 'broad_tomar' ? 6.8 :
                            selectedPen === 'metal_pen' || selectedPen === 'flex_quill' || selectedPen === 'tashkeel_dotting' ? 0.0 :
                            selectedPen === 'quill_pen' ? 0.25 :
                            selectedPen === 'glass_pen' ? 0.6 :
                            selectedPen === 'modern_pen' || selectedPen === 'sable_brush' ? 1.6 :
                            2.2 // qasab_pen
                          }
                          paintOrder="stroke fill"
                          className="font-thuluth text-[104px] font-bold"
                          style={{
                            fontWeight: activePenConfig.weight,
                            opacity: activePenConfig.opacity,
                            filter: isSpecialIlluminated
                              ? 'drop-shadow(0 2px 6px rgba(184,134,11,0.6)) drop-shadow(0 0 20px rgba(243,207,122,0.75))'
                              : isGoldFoil 
                              ? 'drop-shadow(0 2px 4px rgba(60,40,10,0.4))' 
                              : penDynamics.filterEffect
                          }}
                        >
                          الحَمْدُ لِلَّهِ
                        </text>
                      </svg>
                    </div>
                  ) : (
                    /* Dynamic Text for custom input with pen dynamics & responsive typography */
                    <div 
                      className="w-full flex items-center justify-center transition-transform duration-300"
                      style={{
                        transform: `scale(${penScale})`
                      }}
                    >
                      <h2
                        className={`w-full ${selectedFont} tracking-normal transition-all duration-300 select-text leading-relaxed`}
                        style={{
                          fontSize: `clamp(${1.8 * (fontSize / 96)}rem, ${4.2 * (fontSize / 96)}vw, ${4.8 * (fontSize / 96)}rem)`,
                          fontWeight: activePenConfig.weight,
                          opacity: activePenConfig.opacity,
                          WebkitTextStroke: penStrokeCSS,
                          paintOrder: 'stroke fill',
                          filter: penDynamics.filterEffect,
                          letterSpacing: (selectedPen === 'metal_pen' || selectedPen === 'quill_pen') ? '0.03em' : (selectedPen === 'bamboo_pen' || selectedPen === 'marker_pen') ? '-0.02em' : '0em',
                          color: (isSpecialIlluminated || isGoldFoil) ? undefined : selectedInk,
                          ...(isSpecialIlluminated
                            ? {
                                backgroundImage: 'linear-gradient(135deg, #fff9e6 0%, #ffd700 25%, #fffdfa 50%, #c59b27 75%, #7a5012 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0 2px 6px rgba(184,134,11,0.5)) drop-shadow(0 0 18px rgba(243,207,122,0.7))'
                              }
                            : isGoldFoil
                            ? goldFoilStyle
                            : {}),
                          textShadow: (isSpecialIlluminated || isGoldFoil)
                            ? undefined
                            : activePenConfig.effectShadow || (currentBg.isDark ? '0 2px 10px rgba(0,0,0,0.7)' : '0 2px 4px rgba(0,0,0,0.18)')
                        }}
                      >
                        {quoteText || 'اكتب عبارتك هنا...'}
                      </h2>
                    </div>
                  )}
                </div>

                {/* 6. CALLIGRAPHER SIGNATURE (Bottom Left of parchment) */}
                <div className="relative z-20 shrink-0 w-full flex items-end justify-between pt-2">
                  <div className={`flex items-center gap-2 text-xs font-amiri font-bold ${currentBg.isDark ? 'text-[#c59b27]/90' : 'text-[#5a4833]'}`}>
                    {/* Feather quill icon */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#c59b27]" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L3 11.5V21h9.5z" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="16" y1="8" x2="2" y2="22" strokeLinecap="round" />
                    </svg>
                    <div className="flex flex-col">
                      <span>{authorName}</span>
                      <span className={`text-[10px] font-mono ${currentBg.isDark ? 'text-[#c59b27]/70' : 'text-[#8c7348]/80'}`}>{authorYear}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* DEDICATED CALLIGRAPHY STUDIO TRAY (مطابقة للأشرطة الأفقية التفاعلية: الخلفيات، الزخارف، الألوان، القلم والحبر) */}
          <CalligraphyStudioTray
            activeTab={activeSidebarTab}
            onSelectTab={(tab) => {
              setActiveSidebarTab(tab);
              scrollToSection(tab);
            }}
            selectedPen={selectedPen}
            onSelectPen={(pen) => {
              setSelectedPen(pen);
              pushHistory({ pen });
            }}
            fontSize={fontSize}
            onFontSizeChange={(newSize) => setFontSize(newSize)}
            selectedInk={selectedInk}
            onSelectInk={(ink) => {
              setSelectedInk(ink);
              pushHistory({ color: ink });
            }}
            isGoldFoil={isGoldFoil}
            onToggleGoldFoil={(val) => {
              setIsGoldFoil(val);
              pushHistory({ isGold: val });
            }}
            selectedFoilStyle={selectedFoilStyle}
            onSelectFoilStyle={(style) => setSelectedFoilStyle(style)}
            selectedOrnament={selectedOrnament}
            onSelectOrnament={(orn) => {
              setSelectedOrnament(orn as OrnamentStyleId);
              pushHistory({ ornament: orn as OrnamentStyleId });
            }}
            selectedBackground={selectedBackground}
            onSelectBackground={(bg) => {
              setSelectedBackground(bg);
              pushHistory({ background: bg });
            }}
            selectedFont={selectedFont}
            onSelectFont={(font) => {
              setSelectedFont(font);
              pushHistory({ font });
            }}
            selectedSize={selectedSize}
            onSelectSize={(size) => {
              setSelectedSize(size);
              pushHistory({ size });
            }}
            quoteText={quoteText}
            onQuoteTextChange={(text) => {
              setQuoteText(text);
              pushHistory({ text });
            }}
          />

          {/* EASEL BOTTOM ACTION STRIP */}
          {/* Order in RTL: RIGHTMOST: [حفظ البطاقة] -> [معاينة] -> [تصدير] */}
          <div className="shrink-0 h-16 bg-[#0f1115]/95 border-t border-[#23262e] px-6 flex items-center justify-between z-20 shadow-lg" dir="rtl">
            
            {/* RIGHT SIDE: Strictly [حفظ البطاقة] then [معاينة] then [تصدير] */}
            <div className="flex items-center gap-3">
              
              {/* 1. حفظ البطاقة (Primary Burgundy Button with Gold Wings) */}
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#a68038]">
                  <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" />
                </svg>
                <span className="w-6 h-px bg-[#a68038]/70" />

                <button
                  type="button"
                  onClick={handleSaveCard}
                  className="px-6 py-2.5 rounded-xl border border-[#a68038] bg-[#3b1419] hover:bg-[#4d161e] text-[#f0e8dc] text-sm font-bold flex items-center gap-2.5 transition active:scale-95 shadow-lg shadow-red-950/40 cursor-pointer"
                  title="حفظ البطاقة في المعرض"
                >
                  <Save size={18} className="text-[#f3cf7a]" />
                  <span>حفظ البطاقة</span>
                </button>

                <span className="w-6 h-px bg-[#a68038]/70" />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#a68038]">
                  <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" />
                </svg>
              </div>

              {/* 2. معاينة (Preview Button) */}
              <button
                type="button"
                onClick={() => setIsPreviewMode(true)}
                className="px-5 py-2.5 rounded-xl border border-[#2b2e37] bg-[#14161b] hover:bg-[#1e2128] text-[#e0d6c8] text-sm font-bold flex items-center gap-2 transition active:scale-95 shadow-sm cursor-pointer"
                title="معاينة اللوحة بكامل الشاشة"
              >
                <Eye size={18} className="text-[#b38a3e]" />
                <span>معاينة</span>
              </button>

              {/* 3. تصدير (Export Button + Format Picker) */}
              <div className="flex items-center rounded-xl border border-[#2b2e37] bg-[#14161b] p-1 shadow-sm gap-1">
                <button
                  type="button"
                  onClick={() => handleExport(selectedExportFormat)}
                  className="px-4 py-2 rounded-lg bg-[#222630] hover:bg-[#2c323f] text-[#e0d6c8] hover:text-white text-sm font-bold flex items-center gap-2 transition active:scale-95 cursor-pointer"
                  title="تصدير البطاقة بالصيغة المحددة"
                >
                  <Download size={17} className="text-[#f3cf7a]" />
                  <span>تصدير</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {(['transparent', 'png', 'jpg', 'pdf'] as const).map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedExportFormat(fmt)}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                        selectedExportFormat === fmt
                          ? 'bg-[#3b1419] text-[#f3cf7a] border border-[#a68038]/60 shadow-xs'
                          : 'text-[#8c949e] hover:text-[#e0d6c8] hover:bg-[#1a1c22]'
                      }`}
                      title={fmt === 'transparent' ? 'صورة مفرغة شفافة بدون خلفية' : fmt.toUpperCase()}
                    >
                      {fmt === 'transparent' ? 'مفرغ (شفاف)' : fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Empty Left Side (advice text removed as requested) */}
            <div className="hidden lg:block" />

          </div>

        </main>

        {/* ===================================================================== */}
        {/* 2.C LEFT COLUMN: VERTICAL FLOATING ACTION TOOLBAR                      */}
        {/* ===================================================================== */}
        <aside 
          className="w-20 shrink-0 p-3 flex flex-col items-center justify-center z-20"
          dir="rtl"
        >
          <div className="w-full bg-[#111317] border border-[#2a261f] rounded-2xl p-2 flex flex-col items-center justify-between shadow-xl py-3.5 gap-3">
            
            {/* 1. تحرير (Edit) - Active */}
            <button
              type="button"
              onClick={() => {
                setActiveLeftTool('edit');
                setActiveSidebarTab('text');
                textInputRef.current?.focus();
              }}
              className={`w-full py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                activeLeftTool === 'edit'
                  ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-md shadow-red-950/40'
                  : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
              }`}
              title="تحرير النص"
            >
              <PenTool size={26} className="rotate-45" />
              <span className="text-xs font-bold">تحرير</span>
            </button>

            {/* 2. تحريك (Move) */}
            <button
              type="button"
              onClick={() => {
                setActiveLeftTool('move');
                setPanOffset({ x: 0, y: 0 });
              }}
              className={`w-full py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                activeLeftTool === 'move'
                  ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-md'
                  : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
              }`}
              title="تحريك اللوحة"
            >
              <Move size={26} />
              <span className="text-xs font-bold">تحريك</span>
            </button>

            {/* 3. تكبير (Zoom) */}
            <button
              type="button"
              onClick={() => {
                setActiveLeftTool('zoom');
                setZoomLevel(prev => (prev >= 1.4 ? 1 : prev + 0.2));
              }}
              className={`w-full py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                activeLeftTool === 'zoom'
                  ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-md'
                  : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
              }`}
              title={`تكبير وتصغير (${Math.round(zoomLevel * 100)}%)`}
            >
              <ZoomIn size={26} />
              <span className="text-xs font-bold">تكبير</span>
            </button>

            {/* 4. شبكة (Grid) */}
            <button
              type="button"
              onClick={() => setShowGrid(prev => !prev)}
              className={`w-full py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                showGrid
                  ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-md'
                  : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
              }`}
              title="إظهار شبكة هندسة الخط"
            >
              <Grid3X3 size={26} />
              <span className="text-xs font-bold">شبكة</span>
            </button>

            {/* 5. إرشادات (Guidelines) */}
            <button
              type="button"
              onClick={() => setShowGuidelines(prev => !prev)}
              className={`w-full py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                showGuidelines
                  ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-md'
                  : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
              }`}
              title="إظهار خطوط ميزان الحروف والثلث الأعلى والأسفل"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3">
                <line x1="2" y1="5" x2="22" y2="5" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="2" y1="19" x2="22" y2="19" />
              </svg>
              <span className="text-xs font-bold">إرشادات</span>
            </button>

            {/* Divider */}
            <div className="w-10 h-px bg-[#24272f] my-1" />

            {/* 6. تراجع (Undo) */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="w-full py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 text-[#9aa0a6] hover:text-[#f3cf7a] hover:bg-[#181b21] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              title="تراجع"
            >
              <RotateCcw size={20} />
              <span className="text-[10px] font-bold">تراجع</span>
            </button>

            {/* 7. إعادة (Redo) */}
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="w-full py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 text-[#9aa0a6] hover:text-[#f3cf7a] hover:bg-[#181b21] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              title="إعادة"
            >
              <RotateCw size={20} />
              <span className="text-[10px] font-bold">إعادة</span>
            </button>

          </div>
        </aside>

      </div>

      {/* ======================================================================= */}
      {/* 3. MODALS: INSPIRATION QUOTES, CALLIGRAPHY GUIDE, GALLERY, FULLSCREEN  */}
      {/* ======================================================================= */}
      
      {/* 1. TASHKEEL & TEXT SHAPING MODAL (تشكيل النص وضبط الحركات) */}
      {showTashkeelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-xl bg-[#14161a] border border-[#272a31] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#272a31]">
              <div className="flex items-center gap-2 text-[#f3cf7a] font-bold font-tajawal text-lg">
                <Sparkles size={18} className="text-[#c59b27]" />
                <span>تشكيل النص وضبط الحركات</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTashkeelModal(false)}
                className="p-1.5 text-[#9aa0a6] hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Text Preview & Quick Action Buttons */}
            <div className="flex flex-col gap-2 p-3 bg-[#0a0c0f] border border-[#26241e] rounded-xl">
              <div className="text-xs text-[#9aa0a6] font-bold">النص الحالي:</div>
              <div className="text-lg font-bold font-thuluth text-[#f3cf7a] text-center py-2 bg-[#121418] rounded-lg border border-[#26241e]/80">
                {quoteText || 'لا يوجد نص'}
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAutoTashkeel}
                  className="py-2 px-3 bg-[#331116] hover:bg-[#4d161e] border border-[#a68038] text-[#f0e8dc] text-xs font-bold rounded-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles size={14} className="text-[#f3cf7a]" />
                  <span>تشكيل آلي ذكي</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemoveTashkeel}
                  className="py-2 px-3 bg-[#17191e] hover:bg-[#20232b] border border-[#26241e] text-[#b38a3e] hover:text-white text-xs font-bold rounded-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>إزالة كل الحركات</span>
                </button>
              </div>
            </div>

            {/* Virtual Harakat Keyboard */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-[#e6dfd5]">لوحة الحركات والضبط:</span>
              <div className="grid grid-cols-6 gap-2">
                {[
                  { mark: 'َ', name: 'فتحة' },
                  { mark: 'ً', name: 'تنوين فتح' },
                  { mark: 'ُ', name: 'ضمة' },
                  { mark: 'ٌ', name: 'تنوين ضم' },
                  { mark: 'ِ', name: 'كسرة' },
                  { mark: 'ٍ', name: 'تنوين كسر' },
                  { mark: 'ّ', name: 'شدة' },
                  { mark: 'ْ', name: 'سكون' },
                  { mark: 'ٰ', name: 'ألف خنجرية' },
                  { mark: 'ٓ', name: 'مدة' },
                  { mark: 'ـ', name: 'كشيدة / مد' },
                  { mark: 'ٱ', name: 'همزة وصل' },
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleInsertTashkeel(item.mark)}
                    className="h-12 bg-[#0e1013] hover:bg-[#331116] border border-[#26241e] hover:border-[#a68038] rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-90 cursor-pointer group"
                    title={item.name}
                  >
                    <span className="text-base font-black text-[#f3cf7a] group-hover:scale-110 transition">{item.mark}</span>
                    <span className="text-[9px] text-[#8c949e] group-hover:text-[#e0d6c8]">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ready Diacritized Exemplars (نماذج مشكلة جاهزة) */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pt-2 border-t border-[#272a31]">
              <span className="text-xs font-bold text-[#e6dfd5]">عبارات مأثورة مضبوطة بالشكل:</span>
              <div className="space-y-1.5 pt-1">
                {INSPIRATIONAL_QUOTES.map((quote, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuoteText(quote);
                      pushHistory({ text: quote });
                      setShowTashkeelModal(false);
                    }}
                    className="w-full p-2.5 rounded-xl border border-[#272a31] bg-[#0e1013] hover:bg-[#1f2229] hover:border-[#a68038] text-right font-thuluth text-base text-[#f0e8dc] transition active:scale-[0.99] flex items-center justify-between group cursor-pointer"
                  >
                    <span>{quote}</span>
                    <span className="text-xs text-[#a08a68] opacity-0 group-hover:opacity-100 transition">اختيار ↵</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. CALLIGRAPHY GUIDE BOOK MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-2xl bg-[#14161a] border border-[#272a31] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#272a31]">
              <div className="flex items-center gap-2 text-[#f3cf7a] font-bold font-thuluth text-xl">
                <BookOpen size={18} />
                <span>دليل أمهات الخطوط العربية وقواعدها</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-[#9aa0a6] hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 py-2 text-sm text-[#e0d6c8] leading-relaxed">
              <div className="p-4 rounded-xl border border-[#272a31] bg-[#0e1013]">
                <h3 className="font-bold text-[#f3cf7a] text-base mb-1 font-thuluth">١. خط الثلث (سيد الخطوط)</h3>
                <p className="text-xs text-[#9aa0a6]">أمير الخطوط وأصعبها كتابة، يتميز بمداته الرشيقة وتداخل حروفه وجمال تشكيله، وهو الأصل في لافتات المساجد وعناوين الكتب المقدسة.</p>
              </div>

              <div className="p-4 rounded-xl border border-[#272a31] bg-[#0e1013]">
                <h3 className="font-bold text-[#f3cf7a] text-base mb-1 font-naskh">٢. خط النسخ (خط التوثيق والمصاحف)</h3>
                <p className="text-xs text-[#9aa0a6]">أوضح الخطوط قراءة وأكثرها اتزاناً، استُخدم في تدوين المصاحف الشريفة والمخطوطات العلمية لوضوح حروفه ونظام ميزان نقطه.</p>
              </div>

              <div className="p-4 rounded-xl border border-[#272a31] bg-[#0e1013]">
                <h3 className="font-bold text-[#f3cf7a] text-base mb-1 font-diwani">٣. خط الديواني (خط البلاغة والفرمانات)</h3>
                <p className="text-xs text-[#9aa0a6]">أبدعه الخطاطون العثمانيون في دواوين الحكم، يتميز بانحناءاته الحلزونية وتداخله الشاعري الفاتن.</p>
              </div>

              <div className="p-4 rounded-xl border border-[#272a31] bg-[#0e1013]">
                <h3 className="font-bold text-[#f3cf7a] text-base mb-1 font-kufi">٤. الخط الكوفي (أقدم الخطوط الهندسية)</h3>
                <p className="text-xs text-[#9aa0a6]">خط العمارة الإسلامية والمآذن والنقوش الصخرية، يعتمد على الزوايا المستقيمة والتناظر الهندسي الصارم.</p>
              </div>

              <div className="p-4 rounded-xl border border-[#272a31] bg-[#0e1013]">
                <h3 className="font-bold text-[#f3cf7a] text-base mb-1 font-ruqah">٥. خط الرقعة (خط السرعة واليوميات)</h3>
                <p className="text-xs text-[#9aa0a6]">أكثر الخطوط عملية وسرعة في التدوين، يمتاز بحروفه المطموسة واستقامة خطوطه دون تشكيل مفرط.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. HELP INSTRUCTIONS MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-md bg-[#14161a] border border-[#272a31] rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#272a31]">
              <div className="flex items-center gap-2 text-[#f3cf7a] font-bold text-lg">
                <HelpCircle size={18} />
                <span>إرشادات استخدام المحراب</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 text-[#9aa0a6] hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#e0d6c8] leading-relaxed">
              <p>• <strong className="text-[#f3cf7a]">تحرير النص:</strong> أدخل عبارتك باللغة العربية مع إمكانية استخدام أزرار التشكيل السريع.</p>
              <p>• <strong className="text-[#f3cf7a]">أدوات القلم والألوان:</strong> اختر من بين 6 أدوات كلاسيكية لتغيير سماكة ومدّات الحروف، وطبّق تذهيب عيار 24 أو الحبر الفاحم.</p>
              <p>• <strong className="text-[#f3cf7a]">الإرشادات والشبكة:</strong> أظهر خطوط الميزان والثلث الأعلى والأسفل لضبط توازن الكلمات.</p>
              <p>• <strong className="text-[#f3cf7a]">الحفظ والتصدير:</strong> يمكنك حفظ البطاقة مباشرة إلى معرض كروتك، أو تصديرها كملف عالي الدقة (PNG، JPG، PDF، أو خلفية شفافة).</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. SAVED CARDS GALLERY MODAL */}
      {showSavedCardsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-2xl bg-[#14161a] border border-[#272a31] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#272a31]">
              <div className="flex items-center gap-2 text-[#f3cf7a] font-bold font-thuluth text-xl">
                <FolderHeart size={18} />
                <span>معرض البطاقات المحفوظة</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSavedCardsModal(false)}
                className="p-1.5 text-[#9aa0a6] hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
              {savedCards.length === 0 ? (
                <div className="text-center py-12 text-[#9aa0a6] flex flex-col items-center gap-3">
                  <ImageIcon size={32} className="opacity-40" />
                  <p className="text-xs">لم تقم بحفظ أي بطاقة بعد. انقر على «حفظ البطاقة» لإضافتها لمعرضك.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {savedCards.map(card => (
                    <div key={card.id} className="rounded-xl border border-[#272a31] bg-[#0e1013] overflow-hidden p-2 flex flex-col gap-2">
                      <img src={card.dataUrl} alt={card.title} className="w-full h-28 object-contain rounded-lg bg-[#eee5d6]" />
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#f0e8dc]">
                        <span className="truncate">{card.title}</span>
                        <a
                          href={card.dataUrl}
                          download={`${card.title}.png`}
                          className="text-[#b38a3e] hover:text-[#f3cf7a]"
                          title="تنزيل"
                        >
                          <Download size={13} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. FULLSCREEN PREVIEW MODAL */}
      {isPreviewMode && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6" dir="rtl">
          <button
            type="button"
            onClick={() => setIsPreviewMode(false)}
            className="absolute top-6 left-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X size={22} />
          </button>

          <div 
            className="max-w-2xl max-h-[85vh] w-full rounded-2xl overflow-hidden shadow-2xl p-10 flex flex-col justify-between"
            style={{
              backgroundColor: '#eee5d6',
              backgroundImage: 'radial-gradient(ellipse at 50% 50%, #faf3e8 0%, #ede3d2 65%, #dfd2bd 100%)',
              aspectRatio: `${currentRatio}`
            }}
          >
            <div />
            
            <h2
              className={`w-full text-center ${selectedFont} tracking-normal text-5xl sm:text-6xl md:text-7xl`}
              style={{
                color: isGoldFoil ? undefined : selectedInk,
                ...(isGoldFoil ? goldFoilStyle : {})
              }}
            >
              {quoteText}
            </h2>

            <div className="flex items-center justify-between text-xs text-[#5a4833] font-amiri font-bold">
              <span>{authorName} ({authorYear})</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
