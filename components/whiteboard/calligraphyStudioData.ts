export type CalligraphyFontId =
  | 'font-reem-ink'    // Reem Kufi Ink
  | 'font-alarabiya'   // Alarabiya Font
  | 'font-molhim'      // Molhim
  | 'font-sulimany'    // Sulimany
  | 'font-aref-ink'    // Aref Ruqaa Ink
  | 'font-hsn-naskh'   // HSN Naskh
  | 'font-thuluth'     // خط الثلث
  | 'font-amiri'       // خط النسخ
  | 'font-aref'        // خط الرقعة
  | 'font-rakkas'      // الخط الديواني
  | 'font-nastaliq'    // نستعليق فارسي
  | 'font-reem'        // الخط الكوفي
  | 'font-wissam'      // خط الوسام
  | 'font-lalezar'     // خط العناوين واللافتات
  | 'font-marhey'      // خط عفوي حر
  | 'font-noto-kufi';  // خط كوفي عمودي

export interface FontPreset {
  id: CalligraphyFontId;
  title: string;
  category?: string;
}

export const FONT_PRESETS: FontPreset[] = [
  { id: 'font-reem-ink', title: 'رِيم كُوفِي إنك' },
  { id: 'font-alarabiya', title: 'خَطُّ الْعَرَبِيَّةِ' },
  { id: 'font-molhim', title: 'خَطُّ مُلْهِم' },
  { id: 'font-sulimany', title: 'خَطُّ السُّلَيْمَانِي' },
  { id: 'font-aref-ink', title: 'رُقْعَة إنك' },
  { id: 'font-hsn-naskh', title: 'حَسَن نَسْخ' },
  { id: 'font-thuluth', title: 'خَطُّ الثُّلُثِ' },
  { id: 'font-amiri', title: 'خَطُّ النَّسْخِ' },
  { id: 'font-aref', title: 'خَطُّ الرُّقْعَةِ' },
  { id: 'font-rakkas', title: 'الخَطُّ الدِّيوَانِيُّ' },
  { id: 'font-nastaliq', title: 'نَسْتَعْلِيق فَارِسِي' },
  { id: 'font-reem', title: 'الْخَطُّ الْكُوفِيُّ' },
  { id: 'font-wissam', title: 'خَطُّ الْوِسَامِ' },
  { id: 'font-lalezar', title: 'خَطُّ الْعَنَاوِينِ' },
  { id: 'font-marhey', title: 'خَطٌّ عَفْوِيٌّ' },
  { id: 'font-noto-kufi', title: 'كُوفِي عَمُودِي' }
];

// =========================================================================
// 🖼️ 12 BACKGROUND CARD DESIGNS (مطابقة تماماً للبطاقات الـ ١٢ في الصورة ٢)
// =========================================================================
export type CalligraphyBackgroundId = 
  | 'card_1_watercolor_paper'     // لك في القلب مقام
  | 'card_2_cream_canvas'         // شكر وتقدير
  | 'card_3_white_linen'          // وقل رب زدني علما
  | 'card_4_cotton_deckle'        // بسم الله نبدأ
  | 'card_5_pastel_floral_wreath' // دع الأيام تفعل ما تشاء
  | 'card_6_vertical_spring_vines'// بالخير واللطف تزهر القلوب
  | 'card_7_delft_ceramic_plate'  // فن يلامس الروح
  | 'card_8_embossed_heavy_paper' // عز وفخر
  | 'card_9_midnight_velvet_gold' // الحمد لله
  | 'card_10_retro_sunburst'      // سبعينيات
  | 'card_11_bottom_wildflowers'  // ستبدي لك الأيام ما كنت جاهلا
  | 'card_12_architectural_grid'; // مكتبة المجد

export interface BackgroundPreset {
  id: CalligraphyBackgroundId;
  previewSentence: string;
  defaultFont: CalligraphyFontId;
  defaultInk: string;
  defaultFrame: CalligraphyFrameId;
  hasDarkBg?: boolean;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'card_1_watercolor_paper',
    previewSentence: 'لَكَ فِي القَلْبِ مَقَامٌ',
    defaultFont: 'font-wissam',
    defaultInk: '#1e3a8a',
    defaultFrame: 'none'
  },
  {
    id: 'card_2_cream_canvas',
    previewSentence: 'شُكْرٌ وَتَقْدِيرٌ',
    defaultFont: 'font-rakkas',
    defaultInk: '#4a044e',
    defaultFrame: 'none'
  },
  {
    id: 'card_3_white_linen',
    previewSentence: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    defaultFont: 'font-reem-ink',
    defaultInk: '#0e7490',
    defaultFrame: 'none'
  },
  {
    id: 'card_4_cotton_deckle',
    previewSentence: 'بِسْمِ اللَّهِ نَبْدَأُ',
    defaultFont: 'font-sulimany',
    defaultInk: '#171717',
    defaultFrame: 'none'
  },
  {
    id: 'card_5_pastel_floral_wreath',
    previewSentence: 'دَعِ الأَيَّامَ تَفْعَلُ مَا تَشَاءُ',
    defaultFont: 'font-molhim',
    defaultInk: '#0f766e',
    defaultFrame: 'none'
  },
  {
    id: 'card_6_vertical_spring_vines',
    previewSentence: 'بِالخَيْرِ وَاللُّطْفِ تَزْهَرُ القُلُوبُ',
    defaultFont: 'font-alarabiya',
    defaultInk: '#831843',
    defaultFrame: 'none'
  },
  {
    id: 'card_7_delft_ceramic_plate',
    previewSentence: 'فَنٌّ يَلَامِسُ الرُّوحَ',
    defaultFont: 'font-thuluth',
    defaultInk: '#1d4ed8',
    defaultFrame: 'none'
  },
  {
    id: 'card_8_embossed_heavy_paper',
    previewSentence: 'عِزٌّ وَفَخْرٌ',
    defaultFont: 'font-lalezar',
    defaultInk: '#3b2210',
    defaultFrame: 'none'
  },
  {
    id: 'card_9_midnight_velvet_gold',
    previewSentence: 'الْحَمْدُ لِلَّهِ',
    defaultFont: 'font-thuluth',
    defaultInk: 'gold_metallic',
    defaultFrame: 'none',
    hasDarkBg: true
  },
  {
    id: 'card_10_retro_sunburst',
    previewSentence: 'سَبْعِينِيَّاتٌ',
    defaultFont: 'font-lalezar',
    defaultInk: '#ffffff',
    defaultFrame: 'none'
  },
  {
    id: 'card_11_bottom_wildflowers',
    previewSentence: 'سَتُبْدِي لَكَ الأَيَّامُ',
    defaultFont: 'font-marhey',
    defaultInk: '#1e3a8a',
    defaultFrame: 'none'
  },
  {
    id: 'card_12_architectural_grid',
    previewSentence: 'مَكْتَبَةُ المَجْدِ',
    defaultFont: 'font-aref-ink',
    defaultInk: '#334155',
    defaultFrame: 'none'
  }
];

// =========================================================================
// 🌟 10 RICH & DIVERSE ORNAMENTAL FRAMES (إطارات فخمة ومتنوعة)
// =========================================================================
export type CalligraphyFrameId =
  | 'none'
  | 'royal_gold_filigree'
  | 'geometric_kufic_brass'
  | 'delft_ceramic_blue'
  | 'islamic_pointed_mihrab'
  | 'vintage_marbled_gilt'
  | 'andalusian_emerald'
  | 'imperial_crimson'
  | 'botanical_pastel_wreath'
  | 'moroccan_zellij'
  | 'antique_sepia_inlay';

export interface FramePreset {
  id: CalligraphyFrameId;
  name: string;
  category: string;
  colorPreview: string;
}

export const FRAME_PRESETS: FramePreset[] = [
  { id: 'none', name: 'بدون إطار', category: 'بسيط', colorPreview: '#cbd5e1' },
  { id: 'royal_gold_filigree', name: 'تذهيب أندلسي ملكي فاخر', category: 'ملكي', colorPreview: '#d4af37' },
  { id: 'geometric_kufic_brass', name: 'مشربية كوفية مذهبة', category: 'هندسي', colorPreview: '#b45309' },
  { id: 'delft_ceramic_blue', name: 'خزف دمشقي أزرق ملكي', category: 'تراثي', colorPreview: '#1d4ed8' },
  { id: 'islamic_pointed_mihrab', name: 'محراب وقوس عثماني مذهب', category: 'إسلامي', colorPreview: '#c2410c' },
  { id: 'vintage_marbled_gilt', name: 'تعتيق مخطوطات وزوايا مقوسة', category: 'عتيق', colorPreview: '#854d0e' },
  { id: 'andalusian_emerald', name: 'أرابيسك زمردي مطعم بالذهب', category: 'أندلسي', colorPreview: '#047857' },
  { id: 'imperial_crimson', name: 'قرمزي إمبراطوري مخملي', category: 'فخم', colorPreview: '#881337' },
  { id: 'botanical_pastel_wreath', name: 'إكليل أزهار ربيعية رقيقة', category: 'طبيعي', colorPreview: '#f43f5e' },
  { id: 'moroccan_zellij', name: 'زليج مغربي هندسي ملون', category: 'مغربي', colorPreview: '#0284c7' },
  { id: 'antique_sepia_inlay', name: 'تطعيم خشب الجوز ودبابيس برونز', category: 'تراثي', colorPreview: '#573318' }
];

// =========================================================================
// 🪶 14 PLACABLE FREE ORNAMENTS (زخارف حرة يمكن إدراجها والتحكم بمكانها في أي مكان في الكارت)
// =========================================================================
export type OrnamentTypeId =
  | 'bismillah'           // بسملة خطية رشيقة
  | 'shamseh'             // شمسية تذهيبية إسلامية دائرية
  | 'crescent_star'       // هلال ونجمة إسلامية مشغولة
  | 'floral_sprig'        // غصن زهور وتوريقات ربيعية
  | 'royal_corner'        // زاوية توريقية ملكية
  | 'calligraphy_divider' // فاصل خطي مزخرف
  | 'tughra'              // طغراء سلطانية عثمانية
  | 'mihrab_arch'         // محراب وقوس إسلامي علوي
  | 'feather_quill'       // ريشة حبر ودواة خطاط
  | 'allah_monogram'      // لفظ الجلالة الشريف "الله"
  | 'prophet_durood'      // الصلاة على النبي "ﷺ"
  | 'arabesque_lotus'     // زهرة لوتس أرابيسك
  | 'islamic_star_8'      // نجمة إسلامية ثمانية هندسية
  | 'wildflower_bouquet'; // باقة أزهار برية ملونة

export interface OrnamentPreset {
  id: OrnamentTypeId;
  title: string;
  category: 'islamic' | 'botanical' | 'calligraphy' | 'geometric';
  defaultSize: number;
}

export const ORNAMENT_PRESETS: OrnamentPreset[] = [
  { id: 'bismillah', title: 'بسملة خطية', category: 'calligraphy', defaultSize: 85 },
  { id: 'allah_monogram', title: 'لفظ الجلالة "الله"', category: 'islamic', defaultSize: 60 },
  { id: 'prophet_durood', title: 'الصلاة على النبي ﷺ', category: 'islamic', defaultSize: 60 },
  { id: 'shamseh', title: 'شمسية تذهيبية', category: 'islamic', defaultSize: 70 },
  { id: 'crescent_star', title: 'هلال ونجمة إسلامية', category: 'islamic', defaultSize: 65 },
  { id: 'calligraphy_divider', title: 'فاصل خطي مشرق', category: 'calligraphy', defaultSize: 95 },
  { id: 'tughra', title: 'طغراء سلطانية', category: 'calligraphy', defaultSize: 75 },
  { id: 'mihrab_arch', title: 'قوس ومحراب علوي', category: 'islamic', defaultSize: 80 },
  { id: 'royal_corner', title: 'زاوية توريقية ملكية', category: 'islamic', defaultSize: 55 },
  { id: 'floral_sprig', title: 'غصن زهور ربيعي', category: 'botanical', defaultSize: 65 },
  { id: 'wildflower_bouquet', title: 'باقة ورد ملونة', category: 'botanical', defaultSize: 75 },
  { id: 'arabesque_lotus', title: 'زهرة لوتس أرابيسك', category: 'botanical', defaultSize: 60 },
  { id: 'islamic_star_8', title: 'نجمة ثمانية هندسية', category: 'geometric', defaultSize: 65 },
  { id: 'feather_quill', title: 'ريشة حبر ومحبرة', category: 'calligraphy', defaultSize: 65 }
];

export interface CardOrnamentItem {
  instanceId: string;
  type: OrnamentTypeId;
  x: number;       // percentage 0 - 100
  y: number;       // percentage 0 - 100
  size: number;    // px width
  rotation: number;// degrees
  color: string;   // hex or 'gold' or 'original'
  flipX?: boolean;
}

// 10 Graphic Design Aspect Sizes
export type CardAspectSize = 
  | '1:1'      // مربع
  | '4:3'      // كلاسيكي
  | '3:4'      // بوستر A4
  | '16:9'     // شاشة عريضة
  | '9:16'     // ستوري هاتف
  | '3:2'      // بطاقة بريدية
  | '2:3'      // غلاف كتاب
  | '1.75:1'   // بطاقة عمل
  | '2:1'      // بانر إعلاني
  | '1:2';     // شريط جداري

export const ASPECT_RATIO_PRESETS: { 
  id: CardAspectSize; 
  ratio: number; 
  boxWidth: number; 
  boxHeight: number;
}[] = [
  { id: '1:1', ratio: 1.0, boxWidth: 20, boxHeight: 20 },
  { id: '4:3', ratio: 4 / 3, boxWidth: 24, boxHeight: 18 },
  { id: '3:4', ratio: 3 / 4, boxWidth: 18, boxHeight: 24 },
  { id: '16:9', ratio: 16 / 9, boxWidth: 28, boxHeight: 16 },
  { id: '9:16', ratio: 9 / 16, boxWidth: 14, boxHeight: 25 },
  { id: '3:2', ratio: 3 / 2, boxWidth: 26, boxHeight: 17 },
  { id: '2:3', ratio: 2 / 3, boxWidth: 17, boxHeight: 25 },
  { id: '1.75:1', ratio: 1.75, boxWidth: 28, boxHeight: 16 },
  { id: '2:1', ratio: 2.0, boxWidth: 30, boxHeight: 15 },
  { id: '1:2', ratio: 0.5, boxWidth: 13, boxHeight: 26 }
];

// =========================================================================
// ✒️ CALLIGRAPHY PEN NIB PROFILES (أشكال أسنان وأقلام الخط العربي من الصورة المرفقة)
// 1. قلم قصب (Qasab Pen)
// 2. قلم خيزران (Bamboo Pen)
// 3. قلم معدني (Metal Pen)
// 4. قلم ريشة (Quill Pen)
// 5. قلم زجاجي (Glass Pen)
// 6. قلم حديث (Modern Pen)
// 7. قلم ماركر (Marker Pen)
// =========================================================================

export type CalligraphyPenNibId = 
  | 'qasab_pen'         // قلم قصب (Qasab Pen)
  | 'bamboo_pen'        // قلم خيزران (Bamboo Pen)
  | 'metal_pen'         // قلم معدني (Metal Pen)
  | 'quill_pen'         // قلم ريشة (Quill Pen)
  | 'glass_pen'         // قلم زجاجي (Glass Pen)
  | 'modern_pen'        // قلم حديث (Modern Pen)
  | 'marker_pen'        // قلم ماركر (Marker Pen)
  // توافق رجعي (Legacy aliases)
  | 'reed_qalam'
  | 'flex_quill'
  | 'sable_brush'
  | 'broad_tomar'
  | 'graphite_pencil'
  | 'tashkeel_dotting'
  | 'wet_wash';

export interface CalligraphyPenNib {
  id: CalligraphyPenNibId;
  name: string;
  nameAr: string;
  nameEn: string;
  subtitle: string;
  angle: string;
  defaultFinish: InkFinishId;
  description: string;
  strokeWidthModifier: number; // for preview or scaling
}

export interface CalligraphyPenDynamics {
  id: CalligraphyPenNibId;
  nameAr: string;
  nameEn: string;
  fontWeight: number | string;
  textStroke: string;
  letterSpacingBonus: number;
  filterEffect: string;
  additionalShadow: string;
  opacityModifier: number;
  strokeWidthScale: number;
}

export const CALLIGRAPHY_PEN_DYNAMICS: Record<CalligraphyPenNibId, CalligraphyPenDynamics> = {
  // 1. قلم قصب / Qasab Pen: قط تقليدي ۳٥°، توازن كلاسيكي بين العريض والدقيق، حواف حادة وواضحة لخطوط الثلث والنسخ
  qasab_pen: {
    id: 'qasab_pen',
    nameAr: 'قلم قصب',
    nameEn: 'Qasab Pen',
    fontWeight: 700,
    textStroke: '1.8px currentColor',
    letterSpacingBonus: 0,
    filterEffect: 'contrast(1.15)',
    additionalShadow: '0 0.5px 1px rgba(0,0,0,0.3)',
    opacityModifier: 1.0,
    strokeWidthScale: 1.05
  },
  reed_qalam: {
    id: 'qasab_pen',
    nameAr: 'قلم قصب',
    nameEn: 'Qasab Pen',
    fontWeight: 700,
    textStroke: '1.8px currentColor',
    letterSpacingBonus: 0,
    filterEffect: 'contrast(1.15)',
    additionalShadow: '0 0.5px 1px rgba(0,0,0,0.3)',
    opacityModifier: 1.0,
    strokeWidthScale: 1.05
  },

  // 2. قلم خيزران / Bamboo Pen: ساق خيزران ذهبي عريض، سن جلي عريض جداً وضربات سميكة غامرة بالحبر
  bamboo_pen: {
    id: 'bamboo_pen',
    nameAr: 'قلم خيزران',
    nameEn: 'Bamboo Pen',
    fontWeight: 950,
    textStroke: '3.6px currentColor',
    letterSpacingBonus: -0.25,
    filterEffect: 'contrast(1.3) saturate(1.2)',
    additionalShadow: '0 1.5px 3.5px rgba(0,0,0,0.45)',
    opacityModifier: 1.0,
    strokeWidthScale: 1.35
  },

  // 3. قلم معدني / Metal Pen: سن فولاذي رقيق ودقيق للغاية، خطوط شعرية ونحيفة ورشيقة
  metal_pen: {
    id: 'metal_pen',
    nameAr: 'قلم معدني',
    nameEn: 'Metal Pen',
    fontWeight: 350,
    textStroke: '0px transparent',
    letterSpacingBonus: 0.5,
    filterEffect: 'contrast(1.4) brightness(1.04)',
    additionalShadow: '0 0.5px 0.5px rgba(0,0,0,0.15)',
    opacityModifier: 0.98,
    strokeWidthScale: 0.85
  },
  flex_quill: {
    id: 'metal_pen',
    nameAr: 'قلم معدني',
    nameEn: 'Metal Pen',
    fontWeight: 350,
    textStroke: '0px transparent',
    letterSpacingBonus: 0.5,
    filterEffect: 'contrast(1.4) brightness(1.04)',
    additionalShadow: '0 0.5px 0.5px rgba(0,0,0,0.15)',
    opacityModifier: 0.98,
    strokeWidthScale: 0.85
  },

  // 4. قلم ريشة / Quill Pen: ريشة إوز طبيعية ناعمة، ضربات انسيابية رشيقة وملمس حريري دقيق
  quill_pen: {
    id: 'quill_pen',
    nameAr: 'قلم ريشة',
    nameEn: 'Quill Pen',
    fontWeight: 450,
    textStroke: '0.4px currentColor',
    letterSpacingBonus: 0.3,
    filterEffect: 'contrast(1.1)',
    additionalShadow: '0 0.8px 1.5px rgba(0,0,0,0.22)',
    opacityModifier: 0.96,
    strokeWidthScale: 0.94
  },

  // 5. قلم زجاجي / Glass Pen: زجاج حلزوني بقنوات شعرية لتدفق متزن متصل نقي
  glass_pen: {
    id: 'glass_pen',
    nameAr: 'قلم زجاجي',
    nameEn: 'Glass Pen',
    fontWeight: 500,
    textStroke: '0.7px currentColor',
    letterSpacingBonus: 0.25,
    filterEffect: 'contrast(1.18) brightness(1.03)',
    additionalShadow: '0 0.5px 1px rgba(0,0,0,0.2)',
    opacityModifier: 0.97,
    strokeWidthScale: 0.92
  },

  // 6. قلم حديث / Modern Pen: قلم حبر مذهب بمقبض خشب الجوز لخطوط عصرية متناسقة
  modern_pen: {
    id: 'modern_pen',
    nameAr: 'قلم حديث',
    nameEn: 'Modern Pen',
    fontWeight: 650,
    textStroke: '1.3px currentColor',
    letterSpacingBonus: 0.05,
    filterEffect: 'contrast(1.18)',
    additionalShadow: '0 1px 2px rgba(0,0,0,0.28)',
    opacityModifier: 1.0,
    strokeWidthScale: 1.05
  },

  // 7. قلم ماركر / Marker Pen: سن لبادي مشطوف فاحم، ضربات كتلية سميكة عريضة وتشبع كربوني صريح
  marker_pen: {
    id: 'marker_pen',
    nameAr: 'قلم ماركر',
    nameEn: 'Marker Pen',
    fontWeight: 950,
    textStroke: '4.2px currentColor',
    letterSpacingBonus: -0.35,
    filterEffect: 'contrast(1.35) saturate(1.25)',
    additionalShadow: '0 2px 4px rgba(0,0,0,0.45)',
    opacityModifier: 1.0,
    strokeWidthScale: 1.38
  },
  broad_tomar: {
    id: 'marker_pen',
    nameAr: 'قلم ماركر',
    nameEn: 'Marker Pen',
    fontWeight: 950,
    textStroke: '4.2px currentColor',
    letterSpacingBonus: -0.35,
    filterEffect: 'contrast(1.35) saturate(1.25)',
    additionalShadow: '0 2px 4px rgba(0,0,0,0.45)',
    opacityModifier: 1.0,
    strokeWidthScale: 1.38
  },

  // Legacy mappings for stability
  sable_brush: {
    id: 'modern_pen',
    nameAr: 'قلم حديث',
    nameEn: 'Modern Pen',
    fontWeight: 650,
    textStroke: '1.3px currentColor',
    letterSpacingBonus: 0.05,
    filterEffect: 'contrast(1.18)',
    additionalShadow: '0 1px 2px rgba(0,0,0,0.28)',
    opacityModifier: 1.0,
    strokeWidthScale: 1.05
  },
  graphite_pencil: {
    id: 'qasab_pen',
    nameAr: 'قلم قصب',
    nameEn: 'Qasab Pen',
    fontWeight: 700,
    textStroke: '1.8px currentColor',
    letterSpacingBonus: 0,
    filterEffect: 'contrast(1.15)',
    additionalShadow: '0 0.5px 1px rgba(0,0,0,0.3)',
    opacityModifier: 1.0,
    strokeWidthScale: 1.05
  },
  tashkeel_dotting: {
    id: 'metal_pen',
    nameAr: 'قلم معدني',
    nameEn: 'Metal Pen',
    fontWeight: 350,
    textStroke: '0px transparent',
    letterSpacingBonus: 0.5,
    filterEffect: 'contrast(1.4) brightness(1.04)',
    additionalShadow: '0 0.5px 0.5px rgba(0,0,0,0.15)',
    opacityModifier: 0.98,
    strokeWidthScale: 0.85
  },
  wet_wash: {
    id: 'bamboo_pen',
    nameAr: 'قلم خيزران',
    nameEn: 'Bamboo Pen',
    fontWeight: 950,
    textStroke: '3.6px currentColor',
    letterSpacingBonus: -0.25,
    filterEffect: 'contrast(1.3) saturate(1.2)',
    additionalShadow: '0 1.5px 3.5px rgba(0,0,0,0.45)',
    opacityModifier: 1.0,
    strokeWidthScale: 1.35
  }
};

export const getCalligraphyPenDynamics = (nibId: CalligraphyPenNibId = 'qasab_pen'): CalligraphyPenDynamics => {
  return CALLIGRAPHY_PEN_DYNAMICS[nibId] || CALLIGRAPHY_PEN_DYNAMICS.qasab_pen || CALLIGRAPHY_PEN_DYNAMICS.reed_qalam;
};

export const CALLIGRAPHY_PEN_NIBS: CalligraphyPenNib[] = [
  {
    id: 'qasab_pen',
    name: 'قلم قصب',
    nameAr: 'قلم قصب',
    nameEn: 'Qasab Pen',
    subtitle: 'قط ۳٥° وتجويف حبري',
    angle: '35°',
    defaultFinish: 'pure_matte',
    description: 'قصبة الأنهار الطبيعية المشطوفة بزاوية ۳٥°، ميزان خطوط الثلث والنسخ والرقعة والديواني.',
    strokeWidthModifier: 1.0
  },
  {
    id: 'bamboo_pen',
    name: 'قلم خيزران',
    nameAr: 'قلم خيزران',
    nameEn: 'Bamboo Pen',
    subtitle: 'ساق ذهبي وقط جلي عريض',
    angle: '45°',
    defaultFinish: 'royal_gold',
    description: 'خيزران طبيعي أصفر عريض للخطوط الجلية واللوحات الجدارية والعناوين الكبرى.',
    strokeWidthModifier: 1.2
  },
  {
    id: 'metal_pen',
    name: 'قلم معدني',
    nameAr: 'قلم معدني',
    nameEn: 'Metal Pen',
    subtitle: 'سن فولاذي بمقبض فضي مدبب',
    angle: 'مرن',
    defaultFinish: 'metallic_chrome',
    description: 'ريشة معدنية فولاذية مرنة بمقبض مخروطي فضي مصقول، مخصصة للنستعليق والتواقيع والحلي الدقيقة.',
    strokeWidthModifier: 0.88
  },
  {
    id: 'quill_pen',
    name: 'قلم ريشة',
    nameAr: 'قلم ريشة',
    nameEn: 'Quill Pen',
    subtitle: 'ريشة إوز بيضاء بساق عاجي',
    angle: 'حرة',
    defaultFinish: 'pure_matte',
    description: 'ريشة بيضاء طبيعية ناعمة بساق عاجي مبري، لضربات انسيابية رشيقة وسيلان حبري شاعري.',
    strokeWidthModifier: 0.95
  },
  {
    id: 'glass_pen',
    name: 'قلم زجاجي',
    nameAr: 'قلم زجاجي',
    nameEn: 'Glass Pen',
    subtitle: 'زجاج مورانو حلزوني بقنوات شعرية',
    angle: '360°',
    defaultFinish: 'metallic_chrome',
    description: 'قلم زجاجي حلزوني شفاف يسحب الحبر بالقنوات الشعرية الدقيقة، لخطوط متصلة فائقة النقاء.',
    strokeWidthModifier: 0.92
  },
  {
    id: 'modern_pen',
    name: 'قلم حديث',
    nameAr: 'قلم حديث',
    nameEn: 'Modern Pen',
    subtitle: 'خشب جوز طبيعي وسن مذهب',
    angle: 'متوازن',
    defaultFinish: 'royal_gold',
    description: 'قلم حبر فاخر بمقبض خشب الجوز المخرط وسن كلاسيكي مذهب ومطعم بالفضة لكتابة راقية محكمة.',
    strokeWidthModifier: 1.06
  },
  {
    id: 'marker_pen',
    name: 'قلم ماركر',
    nameAr: 'قلم ماركر',
    nameEn: 'Marker Pen',
    subtitle: 'سن لبادي مشطوف فاحم',
    angle: '90°',
    defaultFinish: 'pure_matte',
    description: 'ماركر خطاط أسود شطف عريض لكثافة حبرية فاحمة وعالية الدقة والوضوح.',
    strokeWidthModifier: 1.28
  }
];

// =========================================================================
// 🎨 INK FINISHES & EFFECTS (خامات ومؤثرات الحبر الموحدة)
// =========================================================================

export type InkFinishId = 
  | 'pure_matte'       // حبر عربي نقي
  | 'royal_gold'       // ورق ذهب ملكي
  | 'metallic_chrome'  // ميتاليك مصقول
  | 'gloss_enamel'     // ورنيش زيتي لامع
  | 'carbon_grain'     // ملمس كربوني خشبي
  | 'watercolor_wash'; // حبر مائي مسيل

export interface InkFinishPreset {
  id: InkFinishId;
  name: string;
  subtitle: string;
  effectType: InkEffectType;
  description: string;
}

export const INK_FINISH_PRESETS: InkFinishPreset[] = [
  {
    id: 'pure_matte',
    name: 'حبر عربي نقي',
    subtitle: 'مات صبغي داكن',
    effectType: 'matte_ink',
    description: 'حبر مداد خطاطين تقليدي فاحم عالي التغطية والتشبع بدون انعكاسات مشتتة.'
  },
  {
    id: 'royal_gold',
    name: 'ورق ذهب ملكي',
    subtitle: 'تذهيب ۲٤ قيراط',
    effectType: 'ornate_foil',
    description: 'رقائق الذهب الملكي عيار ۲٤ بتدرجات براقة ونبضات ضوئية تخطف الأبصار.'
  },
  {
    id: 'metallic_chrome',
    name: 'ميتاليك مصقول',
    subtitle: 'انعكاس معدني حريري',
    effectType: 'ornate_foil',
    description: 'بريق معدني مصقول يكتسب صبغة اللون المختار مع وميض كروم فضي أنيق.'
  },
  {
    id: 'gloss_enamel',
    name: 'ورنيش زيتي لامع',
    subtitle: 'لمعان زجاجي بارز',
    effectType: 'crystal_glow',
    description: 'طبقة ورنيش شفافة لامعة تعكس أضواء الاستوديو على منحنيات الحرف.'
  },
  {
    id: 'carbon_grain',
    name: 'تظليل خشبي كربوني',
    subtitle: 'حبيبات وألياف ورقية',
    effectType: 'colored_pencil',
    description: 'ملمس سن القلم الخشبي مع حبيبات الرصاص الدقيقة ومسامية الورق اليدوي.'
  },
  {
    id: 'watercolor_wash',
    name: 'حبر مائي مسيل',
    subtitle: 'تدفق رطب وانسيابي',
    effectType: 'liquid_watercolor',
    description: 'حبر مائي شفاف مع تدرج تركيز الحبر عند الحواف وتداخل انسيابي شاعري.'
  }
];

// =========================================================================
// 🎨 INK COLOR EFFECTS & SPECIALTY PALETTES
// =========================================================================

export type InkEffectType = 
  | 'liquid_watercolor'  // حبر مائي سائل رطب ناعم
  | 'matte_ink'          // حبر خطاطين صبغي مات نقي عالي الكثافة
  | 'ornate_foil'        // زركشة وتذهيب ومعادن وحرير متدرج
  | 'crystal_glow'       // زجاج معشق وبلوري وورنيش لامع
  | 'colored_pencil';    // حبيبات قلم خشب وألياف ورقية واقعية

export interface InkStyleConfig {
  color: string;
  effect: InkEffectType;
  gradient?: string;
  textShadow?: string;
  name?: string;
  penNibId?: CalligraphyPenNibId;
  finishId?: InkFinishId;
  flowOpacity?: number; // 0.2 to 1.0
  sheenIntensity?: number; // 0.0 to 1.0
  is3dEmboss?: boolean;
}

// 16 Ornate Metallic / Gilded / Silk Gradient Colors (لوحات الألوان)
export interface OrnateFoilPreset {
  id: string;
  name: string;
  baseColor: string;
  gradient: string;
  textShadow?: string;
}

export const ORNATE_FOIL_PRESETS: OrnateFoilPreset[] = [
  {
    id: 'foil_gold_royal',
    name: 'ذهب ملكي أصيل',
    baseColor: '#b38728',
    gradient: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)',
    textShadow: '0 1px 2px rgba(180, 130, 40, 0.5), 0 0 12px rgba(251, 245, 183, 0.4)'
  },
  {
    id: 'foil_ochre_heritage',
    name: 'خردلي تراثي مذهب',
    baseColor: '#b45309',
    gradient: 'linear-gradient(135deg, #b45309 0%, #fde047 25%, #d97706 50%, #fef08a 75%, #78350f 100%)',
    textShadow: '0 1px 2px rgba(120, 53, 15, 0.45), 0 0 10px rgba(253, 224, 71, 0.35)'
  },
  {
    id: 'foil_crimson_imperial',
    name: 'قرمزي ملكي مخملي',
    baseColor: '#be123c',
    gradient: 'linear-gradient(135deg, #881337 0%, #fecdd3 25%, #be123c 50%, #fda4af 75%, #4c0519 100%)',
    textShadow: '0 1px 2px rgba(76, 5, 25, 0.5), 0 0 10px rgba(254, 205, 211, 0.35)'
  },
  {
    id: 'foil_chrome_silver',
    name: 'فضة ميتاليك براقة',
    baseColor: '#64748b',
    gradient: 'linear-gradient(135deg, #64748b 0%, #ffffff 25%, #94a3b8 50%, #f8fafc 75%, #475569 100%)',
    textShadow: '0 1px 2px rgba(71, 85, 105, 0.4), 0 0 10px rgba(255, 255, 255, 0.6)'
  },
  {
    id: 'foil_rose_gold',
    name: 'ذهب وردي ساطع',
    baseColor: '#fb7185',
    gradient: 'linear-gradient(135deg, #be185d 0%, #ffe4e6 25%, #fb7185 50%, #fff1f2 75%, #9d174d 100%)',
    textShadow: '0 1px 2px rgba(157, 23, 77, 0.45), 0 0 10px rgba(255, 228, 230, 0.4)'
  },
  {
    id: 'foil_bronze_antique',
    name: 'برونز عتيق مؤكسد',
    baseColor: '#92400e',
    gradient: 'linear-gradient(135deg, #78350f 0%, #fed7aa 25%, #92400e 50%, #ffedd5 75%, #451a03 100%)',
    textShadow: '0 1px 2px rgba(69, 26, 3, 0.5), 0 0 8px rgba(254, 215, 170, 0.35)'
  },
  {
    id: 'foil_copper_damascus',
    name: 'نحاس دمشقي أحمر',
    baseColor: '#ea580c',
    gradient: 'linear-gradient(135deg, #9a3412 0%, #ffedd5 25%, #ea580c 50%, #fed7aa 75%, #7c2d12 100%)',
    textShadow: '0 1px 2px rgba(124, 45, 18, 0.45), 0 0 9px rgba(255, 237, 213, 0.35)'
  },
  {
    id: 'foil_emerald_damascus',
    name: 'زمردي شامي مذهب',
    baseColor: '#047857',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #fef08a 25%, #047857 50%, #a7f3d0 75%, #022c22 100%)',
    textShadow: '0 1px 2px rgba(2, 44, 34, 0.5), 0 0 10px rgba(167, 243, 208, 0.35)'
  },
  {
    id: 'foil_turquoise_persian',
    name: 'فيروزي نيشابوري موشى',
    baseColor: '#0891b2',
    gradient: 'linear-gradient(135deg, #164e63 0%, #cffafe 25%, #0891b2 50%, #a5f3fc 75%, #155e75 100%)',
    textShadow: '0 1px 2px rgba(21, 94, 117, 0.45), 0 0 10px rgba(207, 250, 254, 0.4)'
  },
  {
    id: 'foil_indigo_andalus',
    name: 'كحلي أندلسي موشى',
    baseColor: '#1d4ed8',
    gradient: 'linear-gradient(135deg, #172554 0%, #fef08a 22%, #1d4ed8 50%, #bfdbfe 78%, #0f172a 100%)',
    textShadow: '0 1px 2px rgba(15, 23, 42, 0.5), 0 0 10px rgba(254, 240, 138, 0.35)'
  },
  {
    id: 'foil_ruby_deep',
    name: 'ياقوتي عميق برّاق',
    baseColor: '#dc2626',
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #fee2e2 25%, #dc2626 50%, #fca5a5 75%, #450a0a 100%)',
    textShadow: '0 1px 2px rgba(69, 10, 10, 0.5), 0 0 10px rgba(254, 226, 226, 0.35)'
  },
  {
    id: 'foil_pearl_opal',
    name: 'لؤلؤي عاجي قزحي',
    baseColor: '#94a3b8',
    gradient: 'linear-gradient(135deg, #cbd5e1 0%, #ffffff 25%, #f1f5f9 50%, #fef3c7 75%, #94a3b8 100%)',
    textShadow: '0 1px 2px rgba(148, 163, 184, 0.4), 0 0 12px rgba(255, 255, 255, 0.65)'
  },
  {
    id: 'foil_amethyst_imperial',
    name: 'بنفسجي إمبراطوري موشى',
    baseColor: '#7e22ce',
    gradient: 'linear-gradient(135deg, #3b0764 0%, #fde047 22%, #7e22ce 50%, #e9d5ff 78%, #2e1065 100%)',
    textShadow: '0 1px 2px rgba(46, 16, 101, 0.5), 0 0 10px rgba(233, 213, 255, 0.35)'
  },
  {
    id: 'foil_carbon_silver',
    name: 'فاحم دمشقي مكحل بالفضة',
    baseColor: '#1e293b',
    gradient: 'linear-gradient(135deg, #020617 0%, #e2e8f0 25%, #1e293b 50%, #f8fafc 75%, #0f172a 100%)',
    textShadow: '0 1px 2px rgba(2, 6, 23, 0.6), 0 0 8px rgba(226, 232, 240, 0.4)'
  },
  {
    id: 'foil_coral_gilded',
    name: 'مرجاني مذهب',
    baseColor: '#f43f5e',
    gradient: 'linear-gradient(135deg, #9f1239 0%, #fef08a 25%, #f43f5e 50%, #ffe4e6 75%, #881337 100%)',
    textShadow: '0 1px 2px rgba(136, 19, 55, 0.45), 0 0 10px rgba(254, 240, 138, 0.35)'
  },
  {
    id: 'foil_lapis_gold',
    name: 'لازوردي ملكي مرصع',
    baseColor: '#2563eb',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #fef08a 22%, #2563eb 50%, #93c5fd 78%, #172554 100%)',
    textShadow: '0 1px 2px rgba(23, 37, 84, 0.5), 0 0 10px rgba(254, 240, 138, 0.35)'
  }
];

// 14 Colored Calligraphy Pencils Presets (أقلام خشبية للخط العربي كما في الصورة)
export interface ColoredPencilPreset {
  id: string;
  name: string;
  color: string;
}

export const COLORED_PENCIL_PRESETS: ColoredPencilPreset[] = [
  { id: 'p_black', name: 'أسود فحمي', color: '#18181b' },
  { id: 'p_white', name: 'أبيض ناصع', color: '#f8fafc' },
  { id: 'p_gray', name: 'رمادي حيادي', color: '#71717a' },
  { id: 'p_red', name: 'أحمر قرمزي', color: '#dc2626' },
  { id: 'p_burgundy', name: 'عنابي خمري', color: '#881337' },
  { id: 'p_orange', name: 'برتقالي زاهي', color: '#ea580c' },
  { id: 'p_yellow', name: 'أصفر مشرق', color: '#eab308' },
  { id: 'p_lime', name: 'أخضر ليموني', color: '#84cc16' },
  { id: 'p_forest_green', name: 'أخضر غابي', color: '#15803d' },
  { id: 'p_sky_blue', name: 'أزرق سماوي', color: '#0284c7' },
  { id: 'p_royal_blue', name: 'أزرق ملكي', color: '#1d4ed8' },
  { id: 'p_purple', name: 'بنفسجي ملكي', color: '#7c3aed' },
  { id: 'p_magenta', name: 'وردي فوشيا', color: '#db2777' },
  { id: 'p_brown', name: 'بني خشبي', color: '#6b3d26' }
];

export function adjustColorBrightness(hex: string, percent: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(x => x + x).join('');
  }
  let num = parseInt(clean, 16);
  if (isNaN(num)) return hex;

  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
}

export function generateFinishGradient(finishId: InkFinishId, baseColor: string): string | undefined {
  if (finishId === 'pure_matte') {
    return undefined;
  }
  if (finishId === 'royal_gold') {
    return 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)';
  }
  if (finishId === 'metallic_chrome') {
    const lighter = adjustColorBrightness(baseColor, 40);
    const darker = adjustColorBrightness(baseColor, -30);
    return `linear-gradient(135deg, ${darker} 0%, #ffffff 25%, ${baseColor} 50%, #f8fafc 75%, ${darker} 100%)`;
  }
  if (finishId === 'gloss_enamel') {
    const lightSheen = adjustColorBrightness(baseColor, 35);
    const deepBase = adjustColorBrightness(baseColor, -15);
    return `linear-gradient(180deg, ${lightSheen} 0%, ${baseColor} 45%, ${deepBase} 100%)`;
  }
  if (finishId === 'carbon_grain') {
    const lighter = adjustColorBrightness(baseColor, 20);
    const darker = adjustColorBrightness(baseColor, -20);
    return `linear-gradient(135deg, ${darker} 0%, ${baseColor} 30%, ${lighter} 50%, ${darker} 80%, ${baseColor} 100%)`;
  }
  if (finishId === 'watercolor_wash') {
    const light = adjustColorBrightness(baseColor, 30);
    const dark = adjustColorBrightness(baseColor, -25);
    return `linear-gradient(120deg, ${dark} 0%, ${baseColor} 40%, ${light} 80%, ${baseColor} 100%)`;
  }
  return undefined;
}

export function generateFinishShadow(finishId: InkFinishId, baseColor: string, is3dEmboss: boolean = false): string | undefined {
  const embossShadow = is3dEmboss ? '0 3px 6px rgba(0,0,0,0.35), 0 -1px 2px rgba(255,255,255,0.45)' : '';

  if (finishId === 'royal_gold') {
    const baseGlow = '0 1px 3px rgba(180, 130, 40, 0.5), 0 0 14px rgba(251, 245, 183, 0.45)';
    return embossShadow ? `${embossShadow}, ${baseGlow}` : baseGlow;
  }
  if (finishId === 'metallic_chrome') {
    const baseGlow = '0 1px 2px rgba(0,0,0,0.3), 0 0 10px rgba(255, 255, 255, 0.5)';
    return embossShadow ? `${embossShadow}, ${baseGlow}` : baseGlow;
  }
  if (finishId === 'gloss_enamel') {
    const baseGlow = '0 2px 4px rgba(0,0,0,0.25), 0 0 8px rgba(255,255,255,0.4)';
    return embossShadow ? `${embossShadow}, ${baseGlow}` : baseGlow;
  }
  if (finishId === 'carbon_grain') {
    return is3dEmboss ? '0 2px 4px rgba(0,0,0,0.25)' : '0 0.5px 1px rgba(0,0,0,0.2)';
  }
  if (finishId === 'pure_matte') {
    return is3dEmboss ? '0 2px 5px rgba(0,0,0,0.3)' : '0 0.5px 1px rgba(0,0,0,0.15)';
  }
  if (finishId === 'watercolor_wash') {
    return '0 2px 8px rgba(0,0,0,0.12)';
  }
  return is3dEmboss ? '0 2px 5px rgba(0,0,0,0.3)' : undefined;
}

