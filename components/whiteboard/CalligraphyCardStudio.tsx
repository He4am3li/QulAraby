import React, { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  RotateCcw,
  RotateCw,
  Eye,
  Download,
  Save,
  BookOpen,
  Type,
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

// Arabic Calligraphy Fonts
export interface FontOption {
  id: string;
  label: string;
  className: string;
}

export const CALLIGRAPHY_FONTS: FontOption[] = [
  { id: 'thuluth', label: 'خَطُّ الثُّلُثِ الجَلِيّ', className: 'font-thuluth' },
  { id: 'diwani', label: 'الخَطُّ الدِّيوَانِيُّ', className: 'font-diwani' },
  { id: 'naskh', label: 'خَطُّ النَّسْخِ القُرْآنِيّ', className: 'font-naskh' },
  { id: 'ruqah', label: 'خَطُّ الرُّقْعَةِ الأَصِيل', className: 'font-ruqah' },
  { id: 'aref_ruqaa_ink', label: 'خَطُّ الرُّقْعَةِ إنك', className: 'font-aref-ink' },
  { id: 'reem_kufi_ink', label: 'خَطُّ رِيد كُوفِي إنْك', className: 'font-reem-kufi-ink' },
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
];

export interface CalligraphyGuideItem {
  id: string;
  nameAr: string;
  descAr: string;
  sampleAr: string;
  nameEn: string;
  descEn: string;
  className: string;
}

export const CALLIGRAPHY_GUIDE_FONTS: CalligraphyGuideItem[] = [
  {
    id: 'thuluth',
    nameAr: 'خَطُّ الثُّلُثِ الجَلِيّ',
    descAr: 'أُمُّ الخطوط العربية وأصعبها وأبهى مظهر في الآيات القرآنية والعناوين الكبرى والمحاريب، يتميز بمرونته وتداخله المهيب وتناغم حركاته وسيلان حروفه العمودية الممتدة.',
    sampleAr: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    nameEn: 'Thuluth Script (The King of Scripts)',
    descEn: 'The master and most majestic Arabic script, historically used for monumental mosque inscriptions and royal decrees with sweeping vertical proportions.',
    className: 'font-thuluth'
  },
  {
    id: 'diwani',
    nameAr: 'الخَطُّ الدِّيوَانِيُّ العُثْمَانِيّ',
    descAr: 'ابتكره الخطاطون لديوان السلاطين، ويتميز بحركاته الدائرية ورشاقة استدارته وتناغم تشابكاته البديعة وانسياب حروفه الصاعدة والهابطة كأمواج البحر.',
    sampleAr: 'فَصَبْرٌ جَمِيلٌ وَاللَّهُ الْمُسْتَعَانُ',
    nameEn: 'Diwani Script (The Royal Chancellery)',
    descEn: 'Developed during the Ottoman golden age for official state decrees, celebrated for rhythmic circular arcs and dense decorative grace.',
    className: 'font-diwani'
  },
  {
    id: 'naskh',
    nameAr: 'خَطُّ النَّسْخِ القُرْآنِيّ',
    descAr: 'خط تدوين المصاحف الشريفة والكتب العلمية، وضوحه فائق ورصانته متناهية، وتناسب حروفه يريح العين وييسر القراءة المتمعنة في كل العصور.',
    sampleAr: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    nameEn: 'Naskh Script (The Quranic Standard)',
    descEn: 'The definitive script for manuscript copying and the Holy Quran, renowned for measured legibility and geometric balance.',
    className: 'font-naskh'
  },
  {
    id: 'ruqah',
    nameAr: 'خَطُّ الرُّقْعَةِ الأَصِيل',
    descAr: 'خط سريع وقوي ومباشر، زواياه حادة وميله متسق، يستند إلى خطوط أفقية مستقيمة بدون حليات، وهو الخط الأكثر سلاسة وتداولاً في التحرير اليومي.',
    sampleAr: 'الحَمْدُ لِلَّهِ رَبِّ العَالَمِينَ',
    nameEn: 'Ruqah Script (Everyday Elegance)',
    descEn: 'A fast, geometric, and functional script created for administrative efficiency, characterized by sharp angles and compact ligatures.',
    className: 'font-ruqah'
  },
  {
    id: 'aref_ruqaa_ink',
    nameAr: 'خَطُّ الرُّقْعَةِ إنك (بمداد الخطاط)',
    descAr: 'تطوير حبري كلاسيكي لخط الرقعة بمحاكاة تدفق المداد الطبيعي وسيلان الحبر من سن القصب المشطوف مع نهايات ناعمة ودقيقة وغنية بالعراقة.',
    sampleAr: 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ',
    nameEn: 'Aref Ruqaa Ink (Master Calligrapher Ink Flow)',
    descEn: 'An ink-wash rendition of Ruqah capturing authentic ink saturation, sharp nib dynamics, and the delicate feel of traditional parchment.',
    className: 'font-aref-ink'
  },
  {
    id: 'reem_kufi_ink',
    nameAr: 'خَطُّ رِيد كُوفِي إنْك (المداد الكوفي)',
    descAr: 'طراز كوفي حديث مستوحى من خطوط المصاحف التاريخية بلمسات حبرية معاصرة، يجمع بين أصالة الحرف الكوفي وتدفق الحبر السيال في توازن هندسي أخاذ.',
    sampleAr: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ',
    nameEn: 'Reem Kufi Ink (Contemporary Inked Kufic)',
    descEn: 'A contemporary Kufic display script rooted in early monumental manuscripts with expressive ink dynamics and robust architectural geometry.',
    className: 'font-reem-kufi-ink'
  },
  {
    id: 'kufi',
    nameAr: 'الْخَطُّ الْكُوفِيُّ المَصَاحِفِيّ',
    descAr: 'أعرق الخطوط العربية وأقدمها، يتميز بهندسته الصارمة واستقامة زواياه وهيبته التاريخية الخالدة التي نقشت بها بواكير المصاحف الحجازية والأندلسية.',
    sampleAr: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    nameEn: 'Kufic Script (Ancient Monumental Script)',
    descEn: 'The earliest formulated Arabic script, born in Kufa and revered for stately architectural angularity and bold baselines.',
    className: 'font-kufi'
  },
  {
    id: 'nastaliq',
    nameAr: 'خَطُّ التَّعْلِيقِ (نَسْتَعْلِيق)',
    descAr: 'عروس الخطوط الإسلامية، يجمع بين النسخ والتعليق، ويشتهر بانحداره الموسيقي المائل من اليمين إلى اليسار وتناغم ضربات القلم الرفيعة والعريضة.',
    sampleAr: 'الخَطُّ هَنْدَسَةٌ رُوحَانِيَّةٌ',
    nameEn: 'Nastaliq Script (The Persian Masterpiece)',
    descEn: 'Regarded as the pinnacle of poetic calligraphic expression, celebrated for cascading descending lines and lyrical delicacy.',
    className: 'font-nastaliq'
  },
  {
    id: 'gulzar',
    nameAr: 'خَطُّ الْغُلْزَارِ السُّلْطَانِيّ',
    descAr: 'طراز خطي سلطاني فاخر تُملأ فيه أجواف الحروف العريضة بالزخارف والتوريقات الدقيقة، استُخدم في مجامر البلاط واللوحات الإمبراطورية الفريدة.',
    sampleAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    nameEn: 'Gulzar Script (The Sultanic Illuminated Script)',
    descEn: 'A sumptuous decorative imperial script where broad letter bodies are adorned with miniature Arabesque florals and gilded patterns.',
    className: 'font-gulzar'
  },
  {
    id: 'rakkas',
    nameAr: 'خَطُّ الرَّقَّاصِ الإِبْدَاعِيّ',
    descAr: 'خط تعبيري حديث متحرر مستوحى من حركة راقصة تتلاقى فيها أوزان الحروف المتباينة ليعطي إيقاعاً بصرياً نابضاً بالحياة في ملصقات الفن واللوحات المعاصرة.',
    sampleAr: 'نَبْضُ الحَرْفِ وَسِحْرُ البَيَانِ',
    nameEn: 'Rakkas Script (Dynamic Contemporary Art)',
    descEn: 'A lively creative script with theatrical movement and rhythmic tempo, ideal for expressive modern Arabic art prints.',
    className: 'font-rakkas'
  },
  {
    id: 'marhey',
    nameAr: 'خَطُّ مَرْحَى الرِّيشِيّ',
    descAr: 'خط مرح حر يتميز بلمساته العفوية وضربات الريشة المستديرة الودودة، يضفي إشراقة وتفاؤلاً وأناقة عصرية في البطاقات التعبيرية والتهاني.',
    sampleAr: 'طَابَتْ أَيَّامُكُمْ بِالخَيْرِ',
    nameEn: 'Marhey Script (Joyful Brush Strokes)',
    descEn: 'A joyful display script inspired by relaxed brush strokes and friendly Arabic typographic warmth.',
    className: 'font-marhey'
  },
  {
    id: 'amiri',
    nameAr: 'خَطُّ الأَمِيرِيِّ المَلَكِيّ',
    descAr: 'إحياء ملوكي فاخر لطبعة مطبعة بولاق المصرية العريقة، تتأصل فيه أدق تقاليد الخط العربي وتفاصيل الحروف الرصينة مع حضور ملكي بارز.',
    sampleAr: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    nameEn: 'Amiri Script (Royal Bulaq Revival)',
    descEn: 'A classical Arabic typeface revival inspired by the prestigious royal fonts of Cairo’s Bulaq Press.',
    className: 'font-amiri'
  },
  {
    id: 'katibeh',
    nameAr: 'خَطُّ الكَاتِبَةِ التُّرَاثِيّ',
    descAr: 'طراز خطي بديع مستمد من خطوط النقوش الجدارية الفارسية والعثمانية الكبرى، بتوازن هندسي وعلاقات ارتفاعات متفردة تعطي طابعاً تاريخياً جليلاً.',
    sampleAr: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    nameEn: 'Katibeh Script (Classical Inscription)',
    descEn: 'Rooted in monumental wall inscriptions and ceremonial stone engravings, conveying profound historic gravitas.',
    className: 'font-katibeh'
  },
  {
    id: 'elmessiri',
    nameAr: 'خَطُّ المَسِيرِي الأَنْدَلُسِيّ',
    descAr: 'مستوحى من الخطوط المغربية والأندلسية الموزونة، يجمع بين دقة الحواف واستدارة الكؤوس السفلية بنعومة تضفي طابعاً قرطبياً ساحراً.',
    sampleAr: 'الصَّبْرُ مِفْتَاحُ الفَرَجِ',
    nameEn: 'El Messiri Script (Andalusian Romance)',
    descEn: 'Influenced by the graceful curves of Cordoban and Maghrebi manuscripts, characterized by soft circular bowls.',
    className: 'font-elmessiri'
  },
  {
    id: 'zain',
    nameAr: 'خَطُّ الزَّيْنِ الانْسِيَابِيّ',
    descAr: 'خط عصري انسيابي رشيق يوازن بين روح الخط الكوفي اللين والطباعة الرقمية الحديثة، بوضوح فائق وجاذبية بصرية تلفت الأنظار.',
    sampleAr: 'العِلْمُ نُورٌ وَالحِكْمَةُ ضِيَاءٌ',
    nameEn: 'Zain Script (Modern Fluid Geometry)',
    descEn: 'A streamlined contemporary typeface fusing soft Kufic DNA with modern digital poise and crisp readability.',
    className: 'font-zain'
  }
];

export const CURATED_SHOWCASE_CARDS = [
  {
    id: 'curated_1',
    title: 'الحَمْدُ لِلَّهِ (ثلث جلي مذهب)',
    text: 'الحَمْدُ لِلَّهِ',
    font: 'font-thuluth',
    pen: 'qasab_pen' as CalligraphyPenNibId,
    color: '#d4af37',
    isGold: true,
    ornament: 'royal_gilded_frame' as OrnamentStyleId,
    size: 'A3',
    background: 'parchment_cream'
  },
  {
    id: 'curated_2',
    title: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    font: 'font-diwani',
    pen: 'bamboo_pen' as CalligraphyPenNibId,
    color: '#1c140e',
    isGold: false,
    ornament: 'ottoman_tezhip_frame' as OrnamentStyleId,
    size: '16:9',
    background: 'damascus_mother_of_pearl'
  },
  {
    id: 'curated_3',
    title: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    font: 'font-aref-ink',
    pen: 'qasab_pen' as CalligraphyPenNibId,
    color: '#d4af37',
    isGold: true,
    ornament: 'andalusian_muqarnas_border' as OrnamentStyleId,
    size: '4:3',
    background: 'ottoman_gold_fleck'
  },
  {
    id: 'curated_4',
    title: 'فَصَبْرٌ جَمِيلٌ',
    text: 'فَصَبْرٌ جَمِيلٌ',
    font: 'font-kufi',
    pen: 'marker_pen' as CalligraphyPenNibId,
    color: '#f0e8dc',
    isGold: false,
    ornament: 'mamluk_geometric_border' as OrnamentStyleId,
    size: '1:1',
    background: 'imperial_burgundy'
  }
];

// Authentic Calligraphy Instruments (مرتبة من الأقل سماكة إلى الأكثر سماكة)
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
    id: 'metal_pen',
    label: 'قلم معدني',
    desc: 'ريشة فولاذية دقيقة للنستعليق والتواقيع والضربات الرفيعة فائقة النحافة (1.0 مم)',
    nibWidth: '1.0',
    scale: 0.85,
    weight: 300,
    opacity: 0.98,
    effectShadow: '0 0.5px 1px rgba(0,0,0,0.15)'
  },
  {
    id: 'modern_pen',
    label: 'قلم حديث',
    desc: 'قلم حبر مذهب بمقبض خشب الجوز لخطوط عصرية رشيقة ومتوازنة (1.8 مم)',
    nibWidth: '1.8',
    scale: 0.95,
    weight: 450,
    opacity: 1.0,
    effectShadow: '0 1px 2px rgba(0,0,0,0.2)'
  },
  {
    id: 'quill_pen',
    label: 'قلم ريشة',
    desc: 'ريشة إوز بيضاء طبيعية لضربات انسيابية رشيقة وملمس حريري (2.4 مم)',
    nibWidth: '2.4',
    scale: 1.0,
    weight: 550,
    opacity: 0.95,
    effectShadow: '0 1.5px 3px rgba(0,0,0,0.22)'
  },
  {
    id: 'glass_pen',
    label: 'قلم زجاجي',
    desc: 'قلم زجاج مورانو حلزوني لسيلان شعري فائق النقاء وتدفق متزن (3.0 مم)',
    nibWidth: '3.0',
    scale: 1.05,
    weight: 650,
    opacity: 0.97,
    effectShadow: '0 2px 4px rgba(0,0,0,0.25)'
  },
  {
    id: 'qasab_pen',
    label: 'قلم قصب',
    desc: 'قصبة طبيعية مشطوفة لخطوط الثلث والنسخ والرقعة بميزان كلاسيكي أصيل (4.2 مم)',
    nibWidth: '4.2',
    scale: 1.15,
    weight: 750,
    opacity: 1.0,
    effectShadow: '0 2px 4px rgba(0,0,0,0.25)'
  },
  {
    id: 'bamboo_pen',
    label: 'قلم خيزران',
    desc: 'خيزران ذهبي عريض للخطوط الجلية واللوحات الكبرى بسيلان ثري (6.0 مم)',
    nibWidth: '6.0',
    scale: 1.28,
    weight: 850,
    opacity: 1.0,
    effectShadow: '0 3px 6px rgba(0,0,0,0.35)'
  },
  {
    id: 'marker_pen',
    label: 'قلم ماركر جلي',
    desc: 'ماركر شطف فاحم عريض لكثافة حبرية هندسية عالية وخطوط طومار ضخمة (8.5 مم)',
    nibWidth: '8.5',
    scale: 1.38,
    weight: 950,
    opacity: 1.0,
    effectShadow: '0 4px 8px rgba(0,0,0,0.45)'
  }
];

export const getActivePenInstrument = (id: string): PenInstrument => {
  const match = CALLIGRAPHY_PENS.find(p => p.id === id);
  if (match) return match;
  return CALLIGRAPHY_PENS[4]; // qasab_pen
};

// Size Presets
export interface SizePreset {
  id: string;
  label: string;
  subtitle: string;
  ratio: number;
}

export const SIZE_PRESETS: SizePreset[] = [
  { id: 'A3', label: 'A3', subtitle: '42 × 29.7 سم', ratio: 1.414 },
  { id: 'A4', label: 'A4', subtitle: '29.7 × 21 سم', ratio: 1.414 },
  { id: '1:1', label: '1:1', subtitle: 'مربع قياسي', ratio: 1.0 },
  { id: '4:3', label: '4:3', subtitle: 'أفقي كلاسيكي', ratio: 4 / 3 },
  { id: '3:4', label: '3:4', subtitle: 'طولي قياسي', ratio: 3 / 4 },
  { id: '16:9', label: '16:9', subtitle: 'عريض سينمائي', ratio: 16 / 9 },
  { id: '9:16', label: '9:16', subtitle: 'ستوري عمودي', ratio: 9 / 16 },
  { id: '3:2', label: '3:2', subtitle: 'فوتوغرافي أفقي', ratio: 3 / 2 },
  { id: '2:3', label: '2:3', subtitle: 'فوتوغرافي عمودي', ratio: 2 / 3 },
  { id: '1.75:1', label: '1.75:1', subtitle: 'بانوراما عريضة', ratio: 1.75 },
  { id: '2:1', label: '2:1', subtitle: 'عريض مزدوج', ratio: 2.0 },
  { id: '1:2', label: '1:2', subtitle: 'طولي ممتد', ratio: 0.5 }
];

// Luxury Backgrounds
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
    name: 'ورق مقهر عاجي',
    desc: 'مخطوط عتيق بألياف قطنية طبيعية وتعتيق بيج عاجي نقي ومريح جداً',
    isDark: false,
    previewBg: '#faf4ea',
    style: {
      backgroundColor: '#faf4ea',
      backgroundImage: `
        radial-gradient(ellipse at 50% 50%, #fffbf4 0%, #f6ece0 65%, #eddcc8 100%),
        repeating-linear-gradient(45deg, rgba(140, 110, 70, 0.02) 0px, rgba(140, 110, 70, 0.02) 2px, transparent 2px, transparent 6px)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85)'
    }
  },
  {
    id: 'ottoman_gold_fleck',
    name: 'أبرو عثماني منثور بالذهب',
    desc: 'ورق إيبرو يدوي بتعريق رخامي تقليدي مع ذرات ذهبية متلألئة',
    isDark: false,
    previewBg: '#f5edd6',
    style: {
      backgroundColor: '#f5edd6',
      backgroundImage: `
        radial-gradient(ellipse at 40% 40%, #fff9ec 0%, #efe1c0 60%, #e0ce9f 100%),
        repeating-radial-gradient(circle at 70% 30%, rgba(212, 175, 55, 0.08) 0, rgba(212, 175, 55, 0.08) 3px, transparent 3px, transparent 15px),
        repeating-linear-gradient(135deg, rgba(160, 115, 65, 0.03) 0px, rgba(160, 115, 65, 0.03) 1px, transparent 1px, transparent 7px)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(212, 175, 55, 0.3) inset'
    }
  },
  {
    id: 'damascus_mother_of_pearl',
    name: 'صدف دمشقي لؤلؤي',
    desc: 'ورق عاجي مطعم بنعومة بريق الصدف السوري التراثي ولمعان عرق اللؤلؤ',
    isDark: false,
    previewBg: '#f6f2ea',
    style: {
      backgroundColor: '#f8f5ee',
      backgroundImage: `
        radial-gradient(circle at 30% 20%, #ffffff 0%, #f4eee2 55%, #eae0ce 100%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, transparent 45%, rgba(212, 175, 55, 0.12) 100%)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.6) inset'
    }
  },
  {
    id: 'charcoal_slate',
    name: 'حجر الفحم والرماد',
    desc: 'لوح بازلتي حجري داكن غير لامع عالي الفخامة',
    isDark: true,
    previewBg: '#1b1d22',
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
    desc: 'مخمل إمبراطوري فاخر بألوان الياقوت القاني والذهب',
    isDark: true,
    previewBg: '#2c0c12',
    style: {
      backgroundColor: '#260a10',
      backgroundImage: `
        radial-gradient(ellipse at 50% 45%, #4a1520 0%, #280a0f 65%, #150508 100%),
        radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 40%)
      `,
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(212, 175, 55, 0.3) inset'
    }
  },
  {
    id: 'antique_vellum',
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
  }
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
  initialText = 'الحَمْدُ لِلَّهِ',
  studentName = 'هشام علي',
  onCloseStudio,
  isReadOnly = false
}) => {
  // Main Canvas State (Default: Reem Kufi Ink font, clean card without frame, signature disabled)
  const [quoteText, setQuoteText] = useState(initialText);
  const [selectedFont, setSelectedFont] = useState('font-reem-kufi-ink');
  const [selectedPen, setSelectedPen] = useState<CalligraphyPenNibId>('qasab_pen');
  const [selectedInk, setSelectedInk] = useState('#1c140e');
  const [isGoldFoil, setIsGoldFoil] = useState(false);
  const [isSpecialIlluminated, setIsSpecialIlluminated] = useState(false);
  const [selectedOrnament, setSelectedOrnament] = useState<OrnamentStyleId>('none');
  const [selectedSize, setSelectedSize] = useState('A3');
  const [selectedBackground, setSelectedBackground] = useState('ottoman_gold_fleck');
  const [selectedExportFormat, setSelectedExportFormat] = useState('transparent');
  const [fontSize, setFontSize] = useState(96);
  const [selectedFoilStyle, setSelectedFoilStyle] = useState('leaf');

  // Guidelines set to FALSE by default as requested
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'text' | 'font' | 'pen' | 'color' | 'ornament' | 'size' | 'background'>('text');

  // Live Stroke Animation State (محاكاة كتابة الخطاط حرفاً حرفاً)
  const [revealedChars, setRevealedChars] = useState<number>(initialText.length);
  const [isReplayingStroke, setIsReplayingStroke] = useState<boolean>(false);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Author details & Signature customization (Default: OFF, student decides whether to enable)
  const [authorName, setAuthorName] = useState(studentName || 'هشام علي');
  const [showSignature, setShowSignature] = useState(false);
  const [signatureName, setSignatureName] = useState(studentName ? `بقلم: ${studentName}` : 'بقلم: الخطاط');
  const [signaturePosition, setSignaturePosition] = useState<'bottom-right' | 'bottom-center' | 'bottom-left'>('bottom-left');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [guideLang, setGuideLang] = useState<'ar' | 'en'>('ar');

  // Modals & Flyouts
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showTashkeelModal, setShowTashkeelModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSavedCardsModal, setShowSavedCardsModal] = useState(false);
  const [showExportFlyout, setShowExportFlyout] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);
  const [savedCards, setSavedCards] = useState<Array<{
    id: string;
    title: string;
    dataUrl: string;
    text?: string;
    font?: string;
    pen?: CalligraphyPenNibId;
    color?: string;
    isGold?: boolean;
    isSpecialIlluminated?: boolean;
    ornament?: OrnamentStyleId;
    size?: string;
    background?: string;
    customBgUrl?: string | null;
    showSignature?: boolean;
    signatureName?: string;
    signaturePosition?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  }>>([]);

  // Undo / Redo Stack
  const [history, setHistory] = useState<CanvasHistorySnapshot[]>([
    {
      text: initialText,
      font: 'font-reem-kufi-ink',
      pen: 'qasab_pen',
      color: '#1c140e',
      isGold: false,
      ornament: 'none',
      size: 'A3',
      background: 'ottoman_gold_fleck',
      isSpecialIlluminated: false
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const cardCanvasRef = useRef<HTMLDivElement>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 900, height: 600 });

  // Responsive stage observer ensuring the card NEVER overflows or clips across any aspect ratio
  useEffect(() => {
    if (!stageContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setStageDimensions({ width, height });
        }
      }
    });
    observer.observe(stageContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Trigger Live Calligraphy Stroke Writing Animation (رسم الحروف حرفاً حرفاً)
  const triggerStrokeAnimation = useCallback((targetText: string) => {
    if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    setIsReplayingStroke(true);
    setRevealedChars(0);
    const total = targetText.length;
    if (total === 0) {
      setIsReplayingStroke(false);
      return;
    }
    const intervalMs = Math.max(35, Math.min(85, Math.floor(1800 / total)));
    let current = 0;
    animationTimerRef.current = setInterval(() => {
      current++;
      setRevealedChars(current);
      if (current >= total) {
        if (animationTimerRef.current) clearInterval(animationTimerRef.current);
        setIsReplayingStroke(false);
      }
    }, intervalMs);
  }, []);

  // Custom Background Upload Handler
  const handleUploadBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomBgUrl(reader.result);
          setSelectedBackground('custom_uploaded');
          pushHistory({ background: 'custom_uploaded' });
        }
      };
      reader.readAsDataURL(file);
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

  // Save Card to Gallery (No scattered confetti)
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
        dataUrl,
        text: quoteText,
        font: selectedFont,
        pen: selectedPen,
        color: selectedInk,
        isGold: isGoldFoil,
        isSpecialIlluminated,
        ornament: selectedOrnament,
        size: selectedSize,
        background: selectedBackground,
        customBgUrl,
        showSignature,
        signatureName,
        signaturePosition
      };
      const updated = [newCard, ...savedCards.slice(0, 19)];
      setSavedCards(updated);
      localStorage.setItem('qul_calligraphy_saved_cards_atelier', JSON.stringify(updated));
      setSaveSuccessToast(true);
      setTimeout(() => setSaveSuccessToast(false), 2600);
    } catch (err) {
      console.error('Error saving card:', err);
    }
  };

  // Load Card from Gallery
  const handleLoadCard = (card: typeof savedCards[0]) => {
    if (card.text) setQuoteText(card.text);
    if (card.font) setSelectedFont(card.font);
    if (card.pen) setSelectedPen(card.pen);
    if (card.color) setSelectedInk(card.color);
    if (card.isGold !== undefined) setIsGoldFoil(card.isGold);
    if (card.isSpecialIlluminated !== undefined) setIsSpecialIlluminated(card.isSpecialIlluminated);
    if (card.ornament) setSelectedOrnament(card.ornament);
    if (card.size) setSelectedSize(card.size);
    if (card.background) setSelectedBackground(card.background);
    if (card.customBgUrl) setCustomBgUrl(card.customBgUrl);
    if (card.showSignature !== undefined) setShowSignature(card.showSignature);
    if (card.signatureName) setSignatureName(card.signatureName);
    if (card.signaturePosition) setSignaturePosition(card.signaturePosition);
    setShowSavedCardsModal(false);
  };

  // Export Card (Clean export, no scattered decorations)
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
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Tashkeel Helpers
  const handleInsertTashkeel = (char: string) => {
    const updated = quoteText + char;
    setQuoteText(updated);
    pushHistory({ text: updated });
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
      setQuoteText(prev => prev + 'َ');
    }
  };

  // Active Pen & Dynamics
  const penDynamics = getCalligraphyPenDynamics(selectedPen);
  const activePenConfig = CALLIGRAPHY_PENS.find(p => p.id === selectedPen) || CALLIGRAPHY_PENS[4];
  const penScale = activePenConfig.scale;

  // Sizing and Aspect Ratio Auto-fitting Calculation
  const currentSizeObj = SIZE_PRESETS.find(s => s.id === selectedSize) || SIZE_PRESETS[0];
  const currentRatio = currentSizeObj.ratio;

  // Calculate strict dimensions that NEVER overflow or clip inside the stage
  const paddingX = 48;
  const paddingY = 48;
  const availW = Math.max(160, stageDimensions.width - paddingX);
  const availH = Math.max(160, stageDimensions.height - paddingY);

  let cardW = availW;
  let cardH = cardW / currentRatio;

  if (cardH > availH) {
    cardH = availH;
    cardW = cardH * currentRatio;
  }

  // Active Background
  const currentBg = (selectedBackground === 'custom_uploaded' && customBgUrl)
    ? {
        id: 'custom_uploaded',
        name: 'خلفية خاصة مرفوعة',
        desc: 'صورة مخصصة مرفوعة من جهازك',
        isDark: true,
        previewBg: '#1f242d',
        style: {
          backgroundImage: `url(${customBgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95)'
        }
      }
    : (LUXURY_BACKGROUNDS.find(b => b.id === selectedBackground) || LUXURY_BACKGROUNDS[0]);

  // Gold foil text style
  const goldFoilStyle: React.CSSProperties = {
    backgroundImage: 'linear-gradient(135deg, #a47628 0%, #d8ad48 20%, #fff1a8 45%, #dbab42 65%, #9e6d1c 85%, #754b0e 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 2px 4px rgba(40, 25, 5, 0.45)) drop-shadow(0 1px 1px rgba(255, 255, 255, 0.35))'
  };

  // Distinct visible stroke thickness based strictly on pen nib width
  const activeStrokeColor = isSpecialIlluminated ? '#ffd700' : isGoldFoil ? '#d4af37' : selectedInk;
  const penStrokeCSS = (() => {
    switch (selectedPen) {
      case 'metal_pen':
        return '0px transparent';
      case 'modern_pen':
        return `0.8px ${activeStrokeColor}`;
      case 'quill_pen':
        return `1.6px ${activeStrokeColor}`;
      case 'glass_pen':
        return `2.4px ${activeStrokeColor}`;
      case 'qasab_pen':
        return `3.6px ${activeStrokeColor}`;
      case 'bamboo_pen':
        return `5.2px ${activeStrokeColor}`;
      case 'marker_pen':
      default:
        return `7.6px ${activeStrokeColor}`;
    }
  })();

  return (
    <div 
      className="relative w-full h-full flex flex-col bg-[#0b0d10] text-[#e6dfd5] overflow-hidden select-none font-tajawal"
      dir="rtl"
    >
      {/* Background Calligraphy Watermark (هوية بصرية فنية غنية ومتنوعة للحروف) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <svg className="w-full h-full opacity-[0.13] text-[#d4af37]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="calligraphyLettersPattern" width="620" height="460" patternUnits="userSpaceOnUse">
              {/* Row 1 - Diwani Script Letters (Unified with Header Identity) */}
              <text x="35" y="55" fontSize="62" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(-18 35 55)">ن</text>
              <text x="120" y="70" fontSize="38" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(22 120 70)">و</text>
              <text x="210" y="45" fontSize="48" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(-8 210 45)">ق</text>
              <text x="310" y="80" fontSize="72" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(14 310 80)">ل</text>
              <text x="420" y="50" fontSize="34" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(-25 420 50)">ح</text>
              <text x="520" y="75" fontSize="56" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(10 520 75)">م</text>

              {/* Row 2 */}
              <text x="75" y="170" fontSize="44" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(28 75 170)">ع</text>
              <text x="165" y="160" fontSize="68" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(-15 165 160)">ك</text>
              <text x="270" y="185" fontSize="32" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(8 270 185)">ر</text>
              <text x="370" y="150" fontSize="58" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(-22 370 150)">س</text>
              <text x="480" y="180" fontSize="46" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(18 480 180)">ط</text>
              <text x="575" y="160" fontSize="36" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(-12 575 160)">د</text>

              {/* Row 3 */}
              <text x="40" y="290" fontSize="54" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(-16 40 290)">ف</text>
              <text x="135" y="310" fontSize="30" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(24 135 310)">ز</text>
              <text x="225" y="275" fontSize="76" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(12 225 275)">ص</text>
              <text x="345" y="300" fontSize="42" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(-28 345 300)">ي</text>
              <text x="445" y="270" fontSize="60" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(6 445 270)">هـ</text>
              <text x="545" y="305" fontSize="38" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(-14 545 305)">ج</text>

              {/* Row 4 */}
              <text x="80" y="415" fontSize="64" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(16 80 415)">ض</text>
              <text x="190" y="390" fontSize="40" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(-20 190 390)">ظ</text>
              <text x="295" y="425" fontSize="52" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(10 295 425)">غ</text>
              <text x="405" y="395" fontSize="70" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(-12 405 395)">أ</text>
              <text x="515" y="420" fontSize="36" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor" transform="rotate(26 515 420)">ش</text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#calligraphyLettersPattern)" />
        </svg>
      </div>

      {/* TOP BANNER */}
      <CalligraphyHeaderBanner
        onCloseStudio={onCloseStudio}
        onOpenGuide={() => setShowGuideModal(true)}
        onOpenHelp={() => setShowGuideModal(true)}
        onOpenSavedCards={() => setShowSavedCardsModal(true)}
        savedCardsCount={savedCards.length}
      />

      {/* MAIN STUDIO WORKSPACE */}
      <div className="flex-1 flex flex-row min-h-0 relative z-10 overflow-hidden">

        {/* ===================================================================== */}
        {/* RIGHT COLUMN: 7 AUTHENTIC CATEGORY TABS                               */}
        {/* ===================================================================== */}
        <aside 
          className="w-20 shrink-0 bg-[#0d0f13] border-l border-[#24272f] flex flex-col items-center py-4 gap-2.5 select-none z-20 shadow-2xl overflow-y-auto no-scrollbar"
        >
          {/* 1. النص (رمز النص الواضح Type) */}
          <button
            type="button"
            onClick={() => setActiveSidebarTab('text')}
            className={`w-14 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer ${
              activeSidebarTab === 'text'
                ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm ring-1 ring-[#a37e38]/40'
                : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
            }`}
            title="محرر النص والعبارات"
          >
            <Type size={22} className="text-current" />
            <span className="text-[10px] font-bold">النص</span>
          </button>

          {/* 2. الخطوط (حرف ح بخط الرقعة) */}
          <button
            type="button"
            onClick={() => {
              setActiveSidebarTab('font');
              triggerStrokeAnimation(quoteText);
            }}
            className={`w-14 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer ${
              activeSidebarTab === 'font'
                ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm ring-1 ring-[#a37e38]/40'
                : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
            }`}
            title="الخطوط الأصيلة"
          >
            <span className="font-aref text-2xl leading-none font-bold text-current">ح</span>
            <span className="text-[10px] font-bold">الخطوط</span>
          </button>

          {/* 3. الأقلام (رمز القلم والريشة واسم الأقلام) */}
          <button
            type="button"
            onClick={() => {
              setActiveSidebarTab('pen');
              triggerStrokeAnimation(quoteText);
            }}
            className={`w-14 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer ${
              activeSidebarTab === 'pen'
                ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm ring-1 ring-[#a37e38]/40'
                : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
            }`}
            title="الأقلام وسماكة الخط"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
            <span className="text-[10px] font-bold">الأقلام</span>
          </button>

          {/* 4. الألوان */}
          <button
            type="button"
            onClick={() => setActiveSidebarTab('color')}
            className={`w-14 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer ${
              activeSidebarTab === 'color'
                ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm ring-1 ring-[#a37e38]/40'
                : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
            }`}
            title="الألوان والأحبار والتذهيب"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
            </svg>
            <span className="text-[10px] font-bold">الألوان</span>
          </button>

          {/* 5. الزخارف */}
          <button
            type="button"
            onClick={() => setActiveSidebarTab('ornament')}
            className={`w-14 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer ${
              activeSidebarTab === 'ornament'
                ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm ring-1 ring-[#a37e38]/40'
                : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
            }`}
            title="الزخارف والإطارات الإسلامية"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2a4 4 0 0 0-4 4c0 2.5 4 6 4 6s4-3.5 4-6a4 4 0 0 0-4-4z" />
              <path d="M12 22a4 4 0 0 0 4-4c0-2.5-4-6-4-6s-4 3.5-4 6a4 4 0 0 0 4 4z" />
              <path d="M2 12a4 4 0 0 0 4 4c2.5 0 6-4 6-4s-3.5-4-6-4a4 4 0 0 0-4 4z" />
              <path d="M22 12a4 4 0 0 0-4-4c-2.5-6 4-6 4s3.5 4 6 4a4 4 0 0 0 4-4z" />
            </svg>
            <span className="text-[10px] font-bold">الزخارف</span>
          </button>

          {/* 6. المقاسات */}
          <button
            type="button"
            onClick={() => setActiveSidebarTab('size')}
            className={`w-14 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer ${
              activeSidebarTab === 'size'
                ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm ring-1 ring-[#a37e38]/40'
                : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
            }`}
            title="مقاسات وأبعاد اللوحة"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
            <span className="text-[10px] font-bold">المقاسات</span>
          </button>

          {/* 7. الخلفيات */}
          <button
            type="button"
            onClick={() => setActiveSidebarTab('background')}
            className={`w-14 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer ${
              activeSidebarTab === 'background'
                ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm ring-1 ring-[#a37e38]/40'
                : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent'
            }`}
            title="الخلفيات والورق المقهر"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-[10px] font-bold">الخلفيات</span>
          </button>
        </aside>

        {/* ===================================================================== */}
        {/* CENTER COLUMN: CALLIGRAPHY PARCHMENT EASEL STAGE (المحراب)            */}
        {/* ===================================================================== */}
        <main 
          className="flex-1 flex flex-col min-h-0 bg-transparent relative overflow-hidden"
          dir="rtl"
        >
          {/* THE CANVAS SCENE STAGE (Auto-sized via stageDimensions to fit 100% without scroll) */}
          <div 
            ref={stageContainerRef}
            className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 overflow-hidden relative w-full h-full"
          >
            {/* Toast notification when card is saved */}
            {saveSuccessToast && (
              <div className="absolute top-4 z-40 bg-[#161a22]/95 border border-[#c59b27] text-[#f3cf7a] px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in backdrop-blur-md">
                <Save size={16} className="text-[#ffd700]" />
                <span className="text-xs font-bold font-tajawal">تم حفظ اللوحة في المعرض بنجاح! ✨</span>
              </div>
            )}

            {/* THE PARCHMENT CARD SCALER BOX (Exact bounded containment) */}
            <div
              className="relative transition-all duration-300 flex items-center justify-center shadow-2xl rounded-2xl"
              style={{
                width: `${cardW}px`,
                height: `${cardH}px`,
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `scale(${zoomLevel})`
              }}
            >
              {/* THE EXPORTABLE PARCHMENT CARD */}
              <div
                ref={cardCanvasRef}
                id="calligraphy-export-card"
                className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-7 sm:p-10 select-none"
                style={{
                  ...currentBg.style
                }}
              >
                {/* Grid Overlay (if toggled) */}
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

                {/* 1. PROFESSIONAL ISLAMIC ORNAMENTS (All 10 styles strictly connected) */}
                <CalligraphyOrnaments ornamentId={selectedOrnament} isDarkBackground={currentBg.isDark} />

                {/* 2. CALLIGRAPHY GUIDELINES (Optional, default OFF) */}
                {showGuidelines && (
                  <div className="absolute inset-0 pointer-events-none z-15 select-none" dir="rtl">
                    <div className="absolute inset-x-8 inset-y-0 flex flex-col justify-center">
                      <div className="relative h-64 flex flex-col justify-between">
                        <div className="w-full border-b border-dashed border-[#8c6e39]/60" />
                        <div className="w-full border-b border-dotted border-[#8c6e39]/50" />
                        <div className="w-full border-b-2 border-[#a68038]/75 shadow-sm" />
                        <div className="w-full border-b border-dashed border-[#8c6e39]/60" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. MAIN ARABIC CALLIGRAPHY ARTWORK (With Live Stroke Character-by-Character Writing) */}
                <div className="relative z-20 my-auto flex flex-col items-center justify-center text-center px-4 w-full">
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
                        filter: isSpecialIlluminated
                          ? 'drop-shadow(0 2px 6px rgba(184,134,11,0.5)) drop-shadow(0 0 18px rgba(243,207,122,0.7))'
                          : isGoldFoil
                          ? 'drop-shadow(0 2px 4px rgba(40, 25, 5, 0.45))'
                          : penDynamics.filterEffect,
                        letterSpacing: (selectedPen === 'metal_pen') ? '0.03em' : (selectedPen === 'bamboo_pen' || selectedPen === 'marker_pen') ? '-0.02em' : '0em',
                        ...(isSpecialIlluminated
                          ? {
                              backgroundImage: 'linear-gradient(135deg, #fff9e6 0%, #ffd700 25%, #fffdfa 50%, #c59b27 75%, #7a5012 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }
                          : isGoldFoil
                          ? goldFoilStyle
                          : {
                              color: selectedInk,
                              WebkitTextFillColor: selectedInk,
                              fill: selectedInk
                            }),
                        textShadow: (isSpecialIlluminated || isGoldFoil)
                          ? undefined
                          : activePenConfig.effectShadow || (currentBg.isDark ? '0 2px 10px rgba(0,0,0,0.7)' : '0 2px 4px rgba(0,0,0,0.18)')
                      }}
                    >
                      {isReplayingStroke ? (
                        <>
                          {quoteText.slice(0, revealedChars)}
                          {revealedChars < quoteText.length && (
                            <span className="inline-block w-1.5 h-7 bg-[#d4af37] animate-pulse rounded-full mr-1 align-middle shadow-[0_0_10px_#ffd700]" />
                          )}
                        </>
                      ) : (
                        quoteText || 'اكتب عبارتك هنا...'
                      )}
                    </h2>
                  </div>
                </div>

                {/* 4. CALLIGRAPHER SIGNATURE */}
                {showSignature && (
                  <div className={`relative z-20 shrink-0 w-full flex items-end pt-2 ${
                    signaturePosition === 'bottom-right' ? 'justify-start text-right' :
                    signaturePosition === 'bottom-center' ? 'justify-center text-center' :
                    'justify-end text-left'
                  }`}>
                    <div 
                      onClick={() => setShowSignatureModal(true)}
                      className="cursor-pointer group flex flex-col items-center gap-0.5 opacity-90 hover:opacity-100 transition"
                      title="انقر لتعديل التوقيع أو مكانه"
                    >
                      <span
                        className={`text-xs font-diwani px-2.5 py-0.5 rounded transition ${
                          currentBg.isDark
                            ? 'text-[#e5b84c] group-hover:bg-white/10'
                            : 'text-[#684c1f] group-hover:bg-[#8c601c]/10'
                        }`}
                      >
                        {authorName ? `بقلم: ${authorName}` : signatureName}
                      </span>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* THE CALLIGRAPHER'S DESK TRAY */}
          <CalligraphyStudioTray
            activeTab={activeSidebarTab}
            onSelectTab={(tab) => {
              setActiveSidebarTab(tab);
              if (tab === 'pen' || tab === 'font') {
                triggerStrokeAnimation(quoteText);
              }
            }}
            selectedPen={selectedPen}
            onSelectPen={(pen) => {
              setSelectedPen(pen);
              pushHistory({ pen });
              triggerStrokeAnimation(quoteText);
            }}
            fontSize={fontSize}
            onFontSizeChange={(size) => {
              setFontSize(size);
            }}
            selectedInk={selectedInk}
            onSelectInk={(ink) => {
              setSelectedInk(ink);
              setIsGoldFoil(false);
              setIsSpecialIlluminated(false);
              pushHistory({ color: ink, isGold: false, isSpecialIlluminated: false });
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
              triggerStrokeAnimation(quoteText);
            }}
            selectedSize={selectedSize}
            onSelectSize={(size) => {
              setSelectedSize(size);
              pushHistory({ size });
            }}
            quoteText={quoteText}
            onQuoteTextChange={(t) => {
              setQuoteText(t);
              pushHistory({ text: t });
            }}
            onOpenTashkeel={() => setShowTashkeelModal(true)}
            authorName={authorName}
            onAuthorNameChange={(name) => setAuthorName(name)}
            onUploadCustomBg={handleUploadBackground}
            customBgUrl={customBgUrl}
          />

        </main>

        {/* ===================================================================== */}
        {/* LEFT COLUMN: 7 STUDIO WORKFLOW ACTIONS                                */}
        {/* (حفظ البطاقة - معاينة - تصدير - المعرض - دليل الخط - تراجع - إعادة)   */}
        {/* ===================================================================== */}
        <aside 
          className="w-20 shrink-0 bg-[#0d0f13] border-r border-[#24272f] flex flex-col items-center py-4 gap-2.5 select-none z-20 shadow-2xl overflow-y-auto no-scrollbar"
        >
          {/* 1. حفظ البطاقة */}
          <button
            type="button"
            onClick={handleSaveCard}
            className="w-14 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent hover:border-[#a37e38]/50 shadow-sm relative group"
            title="حفظ البطاقة في المعرض"
          >
            <Save size={22} className="text-current group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold text-center leading-tight">حفظ</span>
          </button>

          {/* 2. معاينة */}
          <button
            type="button"
            onClick={() => setIsPreviewMode(true)}
            className="w-14 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent hover:border-[#a37e38]/50 group"
            title="معاينة اللوحة بكامل الشاشة"
          >
            <Eye size={22} className="text-current group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold">معاينة</span>
          </button>

          {/* 3. تصدير */}
          <button
            type="button"
            onClick={() => setShowExportFlyout(true)}
            className={`w-14 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer ${
              showExportFlyout
                ? 'bg-[#3b1419] border border-[#a37e38] text-[#f3cf7a] shadow-sm ring-1 ring-[#a37e38]/40'
                : 'text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent hover:border-[#a37e38]/50'
            } group`}
            title="تصدير وتحميل البطاقة"
          >
            <Download size={22} className="text-current group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold">تصدير</span>
          </button>

          {/* 4. المعرض */}
          <button
            type="button"
            onClick={() => setShowSavedCardsModal(true)}
            className="w-14 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent hover:border-[#a37e38]/50 relative group"
            title="معرض اللوحات المحفوظة"
          >
            <FolderHeart size={22} className="text-current group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold">المعرض</span>
            {savedCards.length > 0 && (
              <span className="absolute top-1 -right-0.5 bg-[#8a121d] text-[#fff] text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-[#f3cf7a]/70">
                {savedCards.length}
              </span>
            )}
          </button>

          {/* 5. دليل الخط */}
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="w-14 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent hover:border-[#a37e38]/50 group"
            title="دليل وقواعد الخط العربي الأصيل"
          >
            <BookOpen size={22} className="text-current group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold">دليل الخط</span>
          </button>

          {/* 6. تراجع */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="w-14 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent hover:border-[#a37e38]/50 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#9aa0a6] disabled:hover:border-transparent group"
            title="تراجع خطوة (Ctrl+Z)"
          >
            <RotateCcw size={22} className="text-current group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold">تراجع</span>
          </button>

          {/* 7. إعادة */}
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="w-14 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer text-[#9aa0a6] hover:bg-[#181b21] hover:text-[#f0e8dc] border border-transparent hover:border-[#a37e38]/50 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#9aa0a6] disabled:hover:border-transparent group"
            title="إعادة خطوة (Ctrl+Y)"
          >
            <RotateCw size={22} className="text-current group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold">إعادة</span>
          </button>
        </aside>

      </div>

      {/* ======================================================================= */}
      {/* MODALS                                                                  */}
      {/* ======================================================================= */}
      
      {/* 1. TASHKEEL MODAL */}
      {showTashkeelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-xl bg-[#14161a] border border-[#272a31] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#272a31]">
              <div className="flex items-center gap-2 text-[#f3cf7a] font-bold font-tajawal text-lg">
                <Type size={18} className="text-[#c59b27]" />
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
                  <Type size={14} className="text-[#f3cf7a]" />
                  <span>تشكيل آلي فوري</span>
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
                      triggerStrokeAnimation(quote);
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

      {/* 2. SIGNATURE CUSTOMIZATION MODAL */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-md bg-[#14161a] border border-[#272a31] rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#272a31]">
              <div className="flex items-center gap-2 text-[#f3cf7a] font-bold text-base">
                <span>تخصيص توقيع الخطاط</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                className="p-1.5 text-[#9aa0a6] hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0c0f] border border-[#26241e]">
              <span className="text-sm font-bold text-[#e6dfd5]">إظهار التوقيع على البطاقة</span>
              <button
                type="button"
                onClick={() => setShowSignature(!showSignature)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${showSignature ? 'bg-[#3b1419] border border-[#a68038]' : 'bg-[#272a31]'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${showSignature ? 'translate-x-0' : '-translate-x-6'}`} />
              </button>
            </div>

            {showSignature && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9aa0a6]">نص التوقيع:</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => {
                      setAuthorName(e.target.value);
                      setSignatureName(`بقلم: ${e.target.value}`);
                    }}
                    placeholder="اسم الخطاط..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#272a31] bg-[#0a0c0f] text-white text-sm focus:outline-none focus:border-[#a68038]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9aa0a6]">مكان التوقيع:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'bottom-right', label: 'يمين' },
                      { id: 'bottom-center', label: 'وسط' },
                      { id: 'bottom-left', label: 'يسار' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setSignaturePosition(pos.id as any)}
                        className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          signaturePosition === pos.id
                            ? 'bg-[#3b1419] border-[#a68038] text-[#f3cf7a]'
                            : 'bg-[#0a0c0f] border-[#272a31] text-[#9aa0a6] hover:text-white'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setShowSignatureModal(false)}
              className="mt-2 w-full py-2.5 bg-[#3b1419] hover:bg-[#4d161e] border border-[#a68038] text-[#f3cf7a] rounded-xl text-sm font-bold transition cursor-pointer"
            >
              حفظ الإعدادات
            </button>
          </div>
        </div>
      )}

      {/* 3. EXPORT MODAL DIALOG (Smooth Centered Animation with Calligraphy Department Branding) */}
      {showExportFlyout && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          dir="rtl"
          onClick={() => setShowExportFlyout(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#12141a]/98 backdrop-blur-xl border border-[#a37e38]/70 rounded-2xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col gap-4 select-none animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Department Identity Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#292c35]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3b1419] to-[#1c0a0c] border border-[#a37e38]/70 flex items-center justify-center text-[#ffd700] shadow-sm">
                  <Download size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#f3cf7a] font-tajawal flex items-center gap-2">
                    <span>تصدير اللوحة الفنية</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e222b] text-[#c59b27] border border-[#a37e38]/30">300 DPI</span>
                  </h3>
                  <p className="text-[11px] text-[#9aa0a6]">قسم الخط العربي الأصيل • استخراج فوري عالي الدقة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportFlyout(false)}
                className="p-1.5 rounded-lg bg-[#181a20] hover:bg-[#331116] text-[#9aa0a6] hover:text-white transition cursor-pointer border border-[#272a31]"
                title="إغلاق"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#b8b0a2] leading-relaxed">
              اختر الصيغة المناسبة لحفظ أو مشاركة لوحتك الفنية بأعلى نقاء حبري:
            </p>

            {/* 4 Instant Export Options */}
            <div className="flex flex-col gap-2.5">
              {[
                {
                  id: 'transparent',
                  label: 'مفرغ شفاف (PNG)',
                  badge: 'للتصميم والمونتاج',
                  desc: 'العبارة والزخرفة مفرغة دون أي خلفية، مثالية للدمج الحر'
                },
                {
                  id: 'png',
                  label: 'صورة فائقة الدقة (PNG)',
                  badge: '300 DPI كاملة',
                  desc: 'كاملة بالورق المقهر والتذهيب والزخارف الإسلامية المختارة'
                },
                {
                  id: 'jpg',
                  label: 'صورة خفيفة (JPG)',
                  badge: 'للمشاركة الفورية',
                  desc: 'حجم معتدل وسريع للإرسال عبر المنصات والتطبيقات'
                },
                {
                  id: 'pdf',
                  label: 'مستند طباعة فاخر (PDF)',
                  badge: 'طباعة أوفست',
                  desc: 'بأبعاد هندسية دقيقة جاهزة فوراً للمطابع والمعارض'
                },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    handleExport(opt.id);
                    setShowExportFlyout(false);
                  }}
                  className="group/item w-full p-3 rounded-xl border border-[#272a33] bg-[#0c0e12]/90 hover:bg-[#2a1215] hover:border-[#d4af37] text-right transition cursor-pointer flex items-center justify-between gap-3 shadow-xs active:scale-[0.99]"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#f0e8dc] group-hover/item:text-[#f3cf7a] transition font-tajawal">
                        {opt.label}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e222b] text-[#c59b27] font-mono group-hover/item:bg-[#3b171c] border border-[#3a3528]/50">
                        {opt.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8c949e] truncate leading-tight">
                      {opt.desc}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-[#181a22] group-hover/item:bg-[#d4af37] text-white group-hover/item:text-[#120604] flex items-center justify-center shrink-0 transition shadow-inner">
                    <Download size={16} />
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-[#252832] flex items-center justify-between text-[11px] text-[#717885]">
              <span className="flex items-center gap-1.5 text-[#a68038]">
                <span>❖ قسم الخط العربي الأصيل</span>
              </span>
              <span>دقة تصدير فائقة</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. CALLIGRAPHY GUIDE MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-4xl bg-[#14161a] border border-[#a68038]/60 rounded-2xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col gap-4 max-h-[88vh] overflow-hidden">

            {/* Calligraphy Department Identity Top Banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#17110a] via-[#2a170d] to-[#17110a] border border-[#a68038]/70 p-3.5 sm:p-4 shadow-lg shrink-0">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg className="w-full h-full text-[#c59b27]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="guideIdentityPattern" width="280" height="50" patternUnits="userSpaceOnUse">
                      <text x="25" y="32" fontSize="22" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor">قلم</text>
                      <text x="100" y="32" fontSize="24" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor">ميزان</text>
                      <text x="190" y="32" fontSize="24" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor">خط</text>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#guideIdentityPattern)" />
                </svg>
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center text-center py-1">
                <div className="flex items-center gap-2.5 sm:gap-3 text-[#c59b27]">
                  <span className="w-8 sm:w-16 h-[1.5px] bg-gradient-to-r from-transparent via-[#c59b27] to-[#c59b27]" />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#c59b27] drop-shadow-[0_0_8px_rgba(197,155,39,0.7)]">
                    <polygon points="12,2 14.5,8.5 21,9.5 16,14.5 17.5,21 12,17.5 6.5,21 8,14.5 3,9.5 9.5,8.5" />
                    <circle cx="12" cy="12" r="2.5" fill="#15120c" />
                  </svg>
                  <span className="text-sm sm:text-base md:text-lg font-black text-white font-tajawal tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                    دليل قواعد الخطوط
                  </span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#c59b27] drop-shadow-[0_0_8px_rgba(197,155,39,0.7)]">
                    <polygon points="12,2 14.5,8.5 21,9.5 16,14.5 17.5,21 12,17.5 6.5,21 8,14.5 3,9.5 9.5,8.5" />
                    <circle cx="12" cy="12" r="2.5" fill="#15120c" />
                  </svg>
                  <span className="w-8 sm:w-16 h-[1.5px] bg-gradient-to-l from-transparent via-[#c59b27] to-[#c59b27]" />
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-[#272a31] shrink-0">
              <div className="flex items-center gap-2 text-[#f3cf7a] font-bold text-sm font-tajawal">
                <BookOpen size={18} className="text-[#c59b27]" />
                <span>الخطوط المعتمدة ونماذجها ({CALLIGRAPHY_GUIDE_FONTS.length} خطاً)</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Language Switcher */}
                <div className="flex items-center bg-[#0e1013] border border-[#272a31] rounded-xl p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setGuideLang('ar')}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      guideLang === 'ar' ? 'bg-[#3b1419] text-[#f3cf7a] font-bold border border-[#a37e38]/50' : 'text-[#8c949e] hover:text-white'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuideLang('en')}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      guideLang === 'en' ? 'bg-[#3b1419] text-[#f3cf7a] font-bold border border-[#a37e38]/50' : 'text-[#8c949e] hover:text-white'
                    }`}
                  >
                    English (LTR)
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="p-1.5 rounded-lg bg-[#1f2229] hover:bg-[#331116] text-[#9aa0a6] hover:text-white transition cursor-pointer border border-[#272a31]"
                  title="إغلاق"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 text-sm leading-relaxed text-[#d8d0c5]">
              {guideLang === 'ar' ? (
                <>
                  {/* Arabic Intro Canon */}
                  <div className="p-4 bg-[#0a0c0f] border border-[#a68038]/40 rounded-xl space-y-1.5">
                    <h4 className="font-bold text-[#f3cf7a] font-thuluth text-xl">مِيزَانُ النُّقْطَةِ وَقَوَاعِدُ ابْنِ مُقْلَةَ:</h4>
                    <p className="text-xs text-[#a0a6b1] leading-relaxed">
                      الخط هندسة روحانية ظهرت بآلة جسمانية. تُقاس أبعاد الحروف بنقطة قلم القصب المربعة المائلة، وتُشتق أقطار الدوائر ونسب الألف واللام من ذات الميزان لتحقيق التناغم الأسمى والجمال الخالد.
                    </p>
                  </div>

                  {/* Grid of All 14 Fonts (Both Title and Description rendered in the font itself!) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {CALLIGRAPHY_GUIDE_FONTS.map(font => (
                      <div
                        key={font.id}
                        className="p-4 bg-[#0c0e12] border border-[#272a31] hover:border-[#a68038] rounded-xl flex flex-col justify-between gap-3 transition-all hover:bg-[#11141a] group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border-b border-[#20232a] pb-2">
                            <h3 className={`${font.className} text-xl font-bold text-[#f3cf7a]`}>
                              {font.nameAr}
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFont(font.className);
                                pushHistory({ font: font.className });
                                triggerStrokeAnimation(quoteText);
                                setShowGuideModal(false);
                              }}
                              className="text-xs px-2.5 py-1 rounded-lg bg-[#3b1419] hover:bg-[#4d161e] border border-[#a37e38]/70 text-[#f3cf7a] transition active:scale-95 cursor-pointer font-tajawal font-bold"
                            >
                              اختيار الخط
                            </button>
                          </div>

                          {/* Font Description (Rendered in the exact font!) */}
                          <p className={`${font.className} text-base text-[#cfc7ba] leading-relaxed`}>
                            {font.descAr}
                          </p>
                        </div>

                        {/* Sample Quote in Font */}
                        <div className="pt-2 border-t border-[#1e222a] flex items-baseline justify-between bg-[#08090b] p-2.5 rounded-lg">
                          <span className="text-[11px] text-[#8c949e] font-tajawal">نموذج:</span>
                          <span className={`${font.className} text-xl text-[#ffffff] font-normal drop-shadow-sm`}>
                            {font.sampleAr}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* English Guide (Strictly LTR and text-left) */
                <div dir="ltr" className="text-left space-y-4">
                  <div className="p-4 bg-[#0a0c0f] border border-[#a68038]/40 rounded-xl space-y-1.5 text-left">
                    <h4 className="font-bold text-[#f3cf7a] text-base">The Canon of Proportions & The Rhombic Dot</h4>
                    <p className="text-xs text-[#a0a6b1] leading-relaxed">
                      Arabic calligraphy is a sacred spiritual geometry materialized through bodily instruments. The proportions of every letter are calibrated according to the rhombic dot created by the angled reed pen (Qalam), establishing cosmic equilibrium across letterforms.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left" dir="ltr">
                    {CALLIGRAPHY_GUIDE_FONTS.map(font => (
                      <div
                        key={font.id}
                        className="p-4 bg-[#0c0e12] border border-[#272a31] hover:border-[#a68038] rounded-xl flex flex-col justify-between gap-3 text-left transition-all hover:bg-[#11141a]"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border-b border-[#20232a] pb-2">
                            <h3 className="text-sm font-bold text-[#f3cf7a]">
                              {font.nameEn}
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFont(font.className);
                                pushHistory({ font: font.className });
                                triggerStrokeAnimation(quoteText);
                                setShowGuideModal(false);
                              }}
                              className="text-xs px-2.5 py-1 rounded-lg bg-[#3b1419] hover:bg-[#4d161e] border border-[#a37e38]/70 text-[#f3cf7a] transition active:scale-95 cursor-pointer font-bold"
                            >
                              Apply Font
                            </button>
                          </div>
                          <p className="text-xs text-[#a0a6b1] leading-relaxed">
                            {font.descEn}
                          </p>
                        </div>

                        {/* Arabic Sample rendered in its authentic script */}
                        <div className="pt-2 border-t border-[#1e222a] bg-[#08090b] p-2.5 rounded-lg flex items-center justify-between">
                          <span className="text-[10px] text-[#717885] uppercase tracking-wider">Sample:</span>
                          <span className={`${font.className} text-xl text-[#ffffff]`} dir="rtl">
                            {font.sampleAr}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SAVED CARDS GALLERY MODAL (معرض اللوحات الفنية الشامل) */}
      {showSavedCardsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-4xl bg-[#14161a] border border-[#a68038]/60 rounded-2xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col gap-4 max-h-[88vh] overflow-hidden">
            {/* Calligraphy Department Identity Top Banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#17110a] via-[#2a170d] to-[#17110a] border border-[#a68038]/70 p-3.5 sm:p-4 shadow-lg shrink-0">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg className="w-full h-full text-[#c59b27]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="galleryIdentityPattern" width="280" height="50" patternUnits="userSpaceOnUse">
                      <text x="25" y="32" fontSize="22" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor">معرض</text>
                      <text x="110" y="32" fontSize="24" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor">لوحة</text>
                      <text x="195" y="32" fontSize="22" fontFamily="diwani, 'Al-Wissam', 'Amiri', serif" fill="currentColor">تذهيب</text>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#galleryIdentityPattern)" />
                </svg>
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center text-center py-1">
                <div className="flex items-center gap-2.5 sm:gap-3 text-[#c59b27]">
                  <span className="w-8 sm:w-16 h-[1.5px] bg-gradient-to-r from-transparent via-[#c59b27] to-[#c59b27]" />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#c59b27] drop-shadow-[0_0_8px_rgba(197,155,39,0.7)]">
                    <polygon points="12,2 14.5,8.5 21,9.5 16,14.5 17.5,21 12,17.5 6.5,21 8,14.5 3,9.5 9.5,8.5" />
                    <circle cx="12" cy="12" r="2.5" fill="#15120c" />
                  </svg>
                  <span className="text-sm sm:text-base md:text-lg font-black text-white font-tajawal tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                    معرض اللوحات
                  </span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#c59b27] drop-shadow-[0_0_8px_rgba(197,155,39,0.7)]">
                    <polygon points="12,2 14.5,8.5 21,9.5 16,14.5 17.5,21 12,17.5 6.5,21 8,14.5 3,9.5 9.5,8.5" />
                    <circle cx="12" cy="12" r="2.5" fill="#15120c" />
                  </svg>
                  <span className="w-8 sm:w-16 h-[1.5px] bg-gradient-to-l from-transparent via-[#c59b27] to-[#c59b27]" />
                </div>
              </div>
            </div>

            {/* Gallery Header Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-[#272a31] shrink-0">
              <div className="flex items-center gap-2 text-[#f3cf7a] font-bold text-sm font-tajawal">
                <FolderHeart size={18} className="text-[#c59b27]" />
                <span>مقتنيات المعرض ({savedCards.length} لوحة خاصة محفوظة)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSavedCardsModal(false)}
                className="p-1.5 rounded-lg bg-[#1f2229] hover:bg-[#331116] text-[#9aa0a6] hover:text-white transition cursor-pointer border border-[#272a31]"
                title="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            {/* Gallery Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-6">

              {/* Section 1: User's Saved Cards */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-[#e6dfd5] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                    <span>لوحاتك الخاصة المحفوظة ({savedCards.length})</span>
                  </h3>
                  {savedCards.length > 0 && (
                    <span className="text-[11px] text-[#9aa0a6]">انقر على أي لوحة لفتحها مباشرة في المحراب للتعديل</span>
                  )}
                </div>

                {savedCards.length === 0 ? (
                  <div className="text-center py-8 px-4 border border-dashed border-[#2b251b] rounded-2xl bg-[#0d0f13]/60 flex flex-col items-center gap-2.5 text-[#9aa0a6]">
                    <ImageIcon size={32} className="text-[#a68038]/40" />
                    <p className="text-xs text-[#b8b0a2]">لم تقم بحفظ لوحات خاصة بك حتى الآن. يمكنك النقر على «حفظ» في العمود الأيسر في أي وقت.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {savedCards.map(card => (
                      <div
                        key={card.id}
                        onClick={() => handleLoadCard(card)}
                        className="group relative rounded-xl border border-[#2b271f] hover:border-[#d4af37] bg-[#0c0e12] overflow-hidden p-2 flex flex-col gap-2 transition-all duration-200 cursor-pointer hover:shadow-xl hover:shadow-amber-950/20 hover:-translate-y-1"
                      >
                        <div className="relative w-full aspect-4/3 overflow-hidden rounded-lg bg-[#181a20] flex items-center justify-center border border-[#222]">
                          <img
                            src={card.dataUrl}
                            alt={card.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2">
                            <span className="bg-[#3b1419] border border-[#f3cf7a] text-[#f3cf7a] text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                              فتح في المحراب للتعديل
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-[#f0e8dc] px-1">
                          <span className="truncate">{card.title}</span>
                          <div className="flex items-center gap-1">
                            <a
                              href={card.dataUrl}
                              download={`${card.title}.png`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#b38a3e] hover:text-[#f3cf7a] p-1 rounded hover:bg-[#1a1d24]"
                              title="تنزيل اللوحة كصورة"
                            >
                              <Download size={13} />
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = savedCards.filter(c => c.id !== card.id);
                                setSavedCards(updated);
                                localStorage.setItem('qul_calligraphy_saved_cards_atelier', JSON.stringify(updated));
                              }}
                              className="text-[#8c949e] hover:text-[#e05252] p-1 rounded hover:bg-[#1a1d24]"
                              title="حذف من المعرض"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Curated Heritage Masterpieces (روائع مقتنيات المحراب الجاهزة) */}
              <div className="pt-4 border-t border-[#252830]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-[#e6dfd5] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#a68038]" />
                    <span>مقتنيات المحراب الكلاسيكية (نماذج جاهزة للتعديل والإبداع)</span>
                  </h3>
                  <span className="text-[11px] text-[#9aa0a6]">اختر أي لوحة لتحميل إعداداتها فوراً</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {CURATED_SHOWCASE_CARDS.map(masterpiece => (
                    <div
                      key={masterpiece.id}
                      onClick={() => {
                        setQuoteText(masterpiece.text);
                        setSelectedFont(masterpiece.font);
                        setSelectedPen(masterpiece.pen);
                        setSelectedInk(masterpiece.color);
                        setIsGoldFoil(masterpiece.isGold);
                        setSelectedOrnament(masterpiece.ornament);
                        setSelectedSize(masterpiece.size);
                        setSelectedBackground(masterpiece.background);
                        pushHistory({
                          text: masterpiece.text,
                          font: masterpiece.font,
                          pen: masterpiece.pen,
                          color: masterpiece.color,
                          isGold: masterpiece.isGold,
                          ornament: masterpiece.ornament,
                          size: masterpiece.size,
                          background: masterpiece.background
                        });
                        triggerStrokeAnimation(masterpiece.text);
                        setShowSavedCardsModal(false);
                      }}
                      className="group relative rounded-xl border border-[#2b271f] hover:border-[#d4af37] bg-[#0c0e12] overflow-hidden p-3 flex flex-col gap-2 transition-all duration-200 cursor-pointer hover:shadow-xl hover:shadow-amber-950/20 hover:-translate-y-1"
                    >
                      <div className="w-full aspect-4/3 rounded-lg overflow-hidden flex flex-col items-center justify-center p-3 text-center border border-[#312b20] bg-gradient-to-br from-[#1b1712] to-[#0c0a08] relative group-hover:scale-102 transition">
                        <span className={`${masterpiece.font} text-base sm:text-lg text-[#f3cf7a] line-clamp-2`}>
                          {masterpiece.text}
                        </span>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2">
                          <span className="bg-[#3b1419] border border-[#f3cf7a] text-[#f3cf7a] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                            فتح وتعديل
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#e0d6c8] text-center truncate">
                        {masterpiece.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}


      {/* 5. FULLSCREEN PREVIEW MODAL */}
      {isPreviewMode && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8" dir="rtl">
          <div className="w-full max-w-4xl flex items-center justify-between pb-3">
            <span className="text-[#f3cf7a] font-bold text-sm">معاينة اللوحة الفاخرة بالإعدادات الحالية</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExport('png')}
                className="px-3.5 py-1.5 bg-[#3b1419] hover:bg-[#521720] border border-[#a68038] text-[#f3cf7a] text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download size={14} />
                <span>تحميل كصورة PNG</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewMode(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div
            className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-8 sm:p-12 select-none"
            style={{
              aspectRatio: `${currentRatio}`,
              maxHeight: 'calc(88vh - 40px)',
              ...currentBg.style
            }}
          >
            <CalligraphyOrnaments ornamentId={selectedOrnament} isDarkBackground={currentBg.isDark} />

            <div />

            <div className="relative z-20 my-auto flex flex-col items-center justify-center text-center px-4 w-full">
              <h2
                className={`w-full ${selectedFont} tracking-normal text-5xl leading-relaxed`}
                style={{
                  color: isGoldFoil ? undefined : selectedInk,
                  ...(isGoldFoil ? goldFoilStyle : { WebkitTextFillColor: selectedInk }),
                  fontWeight: activePenConfig.weight,
                  WebkitTextStroke: penStrokeCSS
                }}
              >
                {quoteText}
              </h2>
            </div>

            {showSignature && (
              <div className="relative z-20 shrink-0 w-full flex items-end justify-end text-xs font-diwani text-[#684c1f]">
                <span>{authorName ? `بقلم: ${authorName}` : signatureName}</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
