// Authentic Calligraphy Studio Data Models, Nibs, Inks, and Helpers

export type CalligraphyPenNibId = 
  | 'qasab_pen' 
  | 'bamboo_pen' 
  | 'metal_pen' 
  | 'reed_qalam' 
  | 'graphite_pencil' 
  | 'wet_wash' 
  | 'round_brush'
  | 'flex_quill'
  | 'tashkeel_dotting'
  | 'quill_pen'
  | 'glass_pen'
  | 'modern_pen'
  | 'sable_brush'
  | 'marker_pen'
  | 'broad_tomar';

export interface CalligraphyNibInfo {
  id: CalligraphyPenNibId;
  name: string;
  defaultFinish: InkFinishId;
  description?: string;
}

export const CALLIGRAPHY_PEN_NIBS: CalligraphyNibInfo[] = [
  { id: 'qasab_pen', name: 'قلم قصب تراثي (جاوِي)', defaultFinish: 'pure_matte', description: 'قلم القصب التقليدي المشطوف لكتابة خطوط الثلث والنسخ والرقعة' },
  { id: 'bamboo_pen', name: 'قلم خيزران هندي عريض', defaultFinish: 'pure_matte', description: 'قلم خيزران صلب للخطوط الجلية واللوحات الضخمة' },
  { id: 'metal_pen', name: 'ريشة معدنية مشطوفة', defaultFinish: 'gloss_enamel', description: 'ريشة معدنية دقيقة لانسيابية فائقة وسرعة في خط الديواني' },
  { id: 'reed_qalam', name: 'قلم طومار مصري', defaultFinish: 'pure_matte', description: 'قلم قصب عريض لكتابة العناوين الكبرى' },
  { id: 'graphite_pencil', name: 'قلم رصاص تخطيطي', defaultFinish: 'carbon_grain', description: 'قلم رصاص ناعم لرسم الميزان والنقاط التمهيدية' },
  { id: 'wet_wash', name: 'فرشاة مائية ناعمة', defaultFinish: 'watercolor_wash', description: 'فرشاة تلوين مائي للأرضيات والظلال' },
  { id: 'round_brush', name: 'فرشاة تذهيب وزخرفة', defaultFinish: 'royal_gold', description: 'فرشاة شعر دقيقة لتذهيب الحروف والزخارف النبيلة' }
];

export type InkFinishId = 
  | 'pure_matte' 
  | 'glossy_varnish' 
  | 'gold_leaf' 
  | 'metallic_luster' 
  | 'velvet_matte' 
  | 'iridescent_sheen'
  | 'royal_gold'
  | 'carbon_grain'
  | 'gloss_enamel'
  | 'watercolor_wash';

export type InkEffectType = 
  | string 
  | 'matte' 
  | 'glossy' 
  | 'gold' 
  | 'metallic' 
  | 'velvet' 
  | 'iridescent' 
  | 'ornate_foil' 
  | 'colored_pencil' 
  | 'crystal_glow' 
  | 'liquid_watercolor';

export interface InkStyleConfig {
  color: string;
  effect: string;
  gradient?: string;
  textShadow?: string;
  name?: string;
  penNibId?: CalligraphyPenNibId;
  finishId?: InkFinishId;
  flowOpacity?: number;
  sheenIntensity?: number;
  is3dEmboss?: boolean;
}

export interface InkFinishInfo {
  id: InkFinishId;
  name: string;
  subtitle: string;
  effectType: string;
  description?: string;
}

export const INK_FINISH_PRESETS: InkFinishInfo[] = [
  { id: 'pure_matte', name: 'مداد مطفي', subtitle: 'كربوني تراثي أصيل', effectType: 'matte' },
  { id: 'royal_gold', name: 'ذهب ملكي', subtitle: 'تذهيب محروق عيار 24', effectType: 'ornate_foil' },
  { id: 'gloss_enamel', name: 'مينا مصقول', subtitle: 'ورنيش لامع عاكس للضوء', effectType: 'crystal_glow' },
  { id: 'carbon_grain', name: 'حبيبات الفحم', subtitle: 'ملمس رصاصي يدوي', effectType: 'colored_pencil' },
  { id: 'watercolor_wash', name: 'صبغة مائية', subtitle: 'تدرج مائي ناعم وشفاف', effectType: 'liquid_watercolor' },
  { id: 'metallic_luster', name: 'بريق معدني', subtitle: 'انعكاس نحاسي وفضي', effectType: 'metallic' },
];

export function generateFinishGradient(finishId: InkFinishId, baseColor: string): string {
  switch (finishId) {
    case 'royal_gold':
    case 'gold_leaf':
      return 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)';
    case 'metallic_luster':
      return `linear-gradient(135deg, ${baseColor} 0%, #ffffff 40%, ${baseColor} 70%, #000000 100%)`;
    case 'gloss_enamel':
    case 'glossy_varnish':
      return `linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 100%)`;
    case 'iridescent_sheen':
      return `linear-gradient(45deg, ${baseColor} 0%, #ec4899 30%, #3b82f6 60%, #10b981 100%)`;
    case 'watercolor_wash':
      return `linear-gradient(135deg, ${baseColor} 20%, rgba(255,255,255,0.6) 50%, ${baseColor} 80%)`;
    case 'velvet_matte':
      return `radial-gradient(circle at 50% 50%, ${baseColor} 0%, #000000 100%)`;
    case 'carbon_grain':
      return `repeating-linear-gradient(45deg, ${baseColor}, ${baseColor} 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)`;
    case 'pure_matte':
    default:
      return 'none';
  }
}

export function generateFinishShadow(finishId: InkFinishId, baseColor: string, is3dEmboss: boolean = false): string {
  const embossShadow = is3dEmboss ? ', 0 4px 6px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.4)' : '';
  switch (finishId) {
    case 'royal_gold':
    case 'gold_leaf':
      return `0 2px 8px rgba(212, 175, 55, 0.4), 0 0 2px rgba(255, 215, 0, 0.6)${embossShadow}`;
    case 'gloss_enamel':
    case 'glossy_varnish':
      return `0 2px 6px rgba(0, 0, 0, 0.35)${embossShadow}`;
    case 'metallic_luster':
      return `0 1px 4px rgba(255, 255, 255, 0.5), 0 3px 8px rgba(0, 0, 0, 0.4)${embossShadow}`;
    case 'iridescent_sheen':
      return `0 0 10px rgba(168, 85, 247, 0.35)${embossShadow}`;
    case 'velvet_matte':
      return `0 4px 10px rgba(0, 0, 0, 0.4)${embossShadow}`;
    case 'pure_matte':
    default:
      return is3dEmboss ? '0 3px 6px rgba(0,0,0,0.4)' : 'none';
  }
}

export function getCalligraphyPenDynamics(nibId: CalligraphyPenNibId): {
  nibWidth: number;
  nibAngle: number;
  opacity: number;
  smoothing: number;
  pressureFactor: number;
  filterEffect?: string;
} {
  switch (nibId) {
    case 'qasab_pen':
      return { nibWidth: 14, nibAngle: 45, opacity: 1, smoothing: 0.8, pressureFactor: 1.2, filterEffect: 'none' };
    case 'bamboo_pen':
      return { nibWidth: 22, nibAngle: 40, opacity: 1, smoothing: 0.85, pressureFactor: 1.4, filterEffect: 'none' };
    case 'metal_pen':
      return { nibWidth: 10, nibAngle: 50, opacity: 0.95, smoothing: 0.9, pressureFactor: 1.1, filterEffect: 'none' };
    case 'reed_qalam':
      return { nibWidth: 28, nibAngle: 35, opacity: 1, smoothing: 0.82, pressureFactor: 1.5, filterEffect: 'none' };
    case 'graphite_pencil':
      return { nibWidth: 4, nibAngle: 0, opacity: 0.65, smoothing: 0.5, pressureFactor: 0.8, filterEffect: 'contrast(1.2)' };
    case 'wet_wash':
      return { nibWidth: 32, nibAngle: 0, opacity: 0.4, smoothing: 0.95, pressureFactor: 1.0, filterEffect: 'blur(0.5px)' };
    case 'round_brush':
      return { nibWidth: 6, nibAngle: 0, opacity: 1, smoothing: 0.9, pressureFactor: 1.1, filterEffect: 'none' };
    default:
      return { nibWidth: 12, nibAngle: 45, opacity: 1, smoothing: 0.8, pressureFactor: 1.0, filterEffect: 'none' };
  }
}

export type CalligraphyBackgroundId = 
  | 'card_1_watercolor_paper' 
  | 'card_2_cream_canvas'
  | 'card_3_white_linen'
  | 'card_4_cotton_deckle'
  | 'card_5_pastel_floral_wreath'
  | 'card_6_vertical_spring_vines'
  | 'card_7_delft_ceramic_plate'
  | 'card_8_embossed_heavy_paper'
  | 'card_9_midnight_velvet_gold'
  | 'card_10_retro_sunburst'
  | 'card_11_bottom_wildflowers'
  | 'card_12_architectural_grid'
  | string;

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
  | 'antique_sepia_inlay'
  | 'simple' 
  | 'ornate' 
  | 'islamic_arch' 
  | 'geometric' 
  | 'floral' 
  | 'gold_border'
  | 'heritage_border'
  | string;

export type OrnamentTypeId = 
  | 'allah_monogram'
  | 'prophet_durood'
  | 'shamseh'
  | 'crescent_star'
  | 'calligraphy_divider'
  | 'tughra'
  | 'mihrab_arch'
  | 'royal_corner'
  | 'floral_sprig'
  | 'wildflower_bouquet'
  | 'arabesque_lotus'
  | 'islamic_star_8'
  | 'feather_quill'
  | 'bismillah' 
  | 'mashallah' 
  | 'floral_center' 
  | 'corner_arabesque' 
  | 'crescent' 
  | 'star_octagram' 
  | 'calligraphy_drop'
  | string;
