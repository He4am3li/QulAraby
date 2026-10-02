import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, Volume2, VolumeX, RotateCcw, Trophy, 
  CheckCircle2, XCircle, Shield, Award,
  ChevronRight, Play, Flame, Star, Mic, Activity,
  Users, Sliders, ChevronLeft, Target, Disc3, Radio,
  Zap, HeartHandshake, Eye, Check, AlertTriangle,
  Medal, Flag, Gauge, RefreshCw, Film
} from 'lucide-react';

// Hyper-Realistic Assets
import heroStrikeAngle from '/src/assets/images/hero_strike_angle_1790691887361.jpg';
import ronaldoImg from '/src/assets/images/ronaldo_madrid_1790691903231.jpg';
import neymarImg from '/src/assets/images/neymar_brazil_1790691919308.jpg';
import yamalImg from '/src/assets/images/yamal_spain_1790691934119.jpg';
import haalandImg from '/src/assets/images/haaland_norway_1790691948685.jpg';
import messiImg from '/src/assets/images/messi_argentina_1790692012141.jpg';
import mbappeImg from '/src/assets/images/mbappe_france_1790692032679.jpg';
import ochoaImg from '/src/assets/images/ochoa_goalkeeper_1790691964622.jpg';
import celebrationImg from '/src/assets/images/striker_celebration_1790691980217.jpg';
import despairImg from '/src/assets/images/striker_despair_1790691994720.jpg';
import stadiumPanorama from '/src/assets/images/champions_stadium_panorama_1790675976521.jpg';
import trophyCelebrationTeam from '/src/assets/images/trophy_celebration_team_1790692147994.jpg';
import teamHeartbreakDefeat from '/src/assets/images/team_heartbreak_defeat_1790692165626.jpg';
import kickerPenaltyFocus from '/src/assets/images/kicker_penalty_focus_1790692179599.jpg';
import salahImg from '/src/assets/images/salah_egypt_star_1790692192671.jpg';
import viniActionImg from '/src/assets/images/vinicius_rm_star_1790707371873.jpg';
import { PenaltyShootout3DCanvas } from './PenaltyShootout3DCanvas';
import { TeamCrest } from './TeamCrests';
import { CinematicIntro } from './CinematicIntro';

// ========================================================
// 1. هيكل بيانات النجوم الحقيقيين (Player Roster Model)
// ========================================================
export interface PlayerCard {
  id: string;
  name: string;
  number: number;
  role: string;
  rating: number;
  image: string;
  signatureMove: string;
  celebrationStyle: string;
  shotPower: number;
  curvePower: number;
  clutch: number;
}

// ========================================================
// 2. بيانات أندية ومنتخبات العالم مع تشكيلاتها الحقيقية
// ========================================================
export interface TeamInfo {
  id: string;
  name: string;
  country: string;
  flag: string;
  badge: string;
  stadium: string;
  rating: number;
  primaryColor: string;
  secondaryColor: string;
  players: PlayerCard[];
}

export const WORLD_TEAMS: TeamInfo[] = [
  {
    id: 'madrid',
    name: 'ريال مدريد',
    country: 'إسبانيا',
    flag: '🇪🇸',
    badge: '👑',
    stadium: 'سانتياغو برنابيو',
    rating: 96,
    primaryColor: '#ffffff',
    secondaryColor: '#f59e0b',
    players: [
      {
        id: 'mbappe_rm',
        name: 'كيليان مبابي',
        number: 9,
        role: 'الصاروخ المدريدي',
        rating: 96,
        image: mbappeImg,
        signatureMove: 'قذيفة لا تصد في الزاوية 90',
        celebrationStyle: 'ثني الذراعين تحت الإبطين بثقة الملوك',
        shotPower: 97,
        curvePower: 90,
        clutch: 95
      },
      {
        id: 'vini_rm',
        name: 'فينيسيوس جونيور',
        number: 7,
        role: 'الساحر البرازيلي',
        rating: 95,
        image: viniActionImg,
        signatureMove: 'تقويسة لولبية دقيقة في المقص الأيمن',
        celebrationStyle: 'رقصة السامبا والتحية لجماهير البرنابيو',
        shotPower: 93,
        curvePower: 96,
        clutch: 96
      },
      {
        id: 'bellingham_rm',
        name: 'جود بيلينغهام',
        number: 5,
        role: 'الجنرال الإنجليزي',
        rating: 94,
        image: ronaldoImg,
        signatureMove: 'ركن الكرة ببرود أعصاب على يمين الحارس',
        celebrationStyle: 'فتح الذراعين بشموخ أمام المدرجات',
        shotPower: 92,
        curvePower: 91,
        clutch: 98
      },
      {
        id: 'rodrygo_rm',
        name: 'رودريغو غوس',
        number: 11,
        role: 'قناص الليالي الكبرى',
        rating: 92,
        image: yamalImg,
        signatureMove: 'تسديدة خادعة في الزاوية الأرضية الصعبة',
        celebrationStyle: 'الانزلاق على الركبتين بإشارة القلب',
        shotPower: 91,
        curvePower: 94,
        clutch: 94
      },
      {
        id: 'modric_rm',
        name: 'لوكا مودريتش',
        number: 10,
        role: 'المايسترو الكرواتي',
        rating: 93,
        image: messiImg,
        signatureMove: 'تسديدة ساحرة بوجه القدم الخارجي (تريفيلا)',
        celebrationStyle: 'ابتسامة الأساطير ورفع القبضة عالياً',
        shotPower: 90,
        curvePower: 98,
        clutch: 97
      },
      {
        id: 'valverde_rm',
        name: 'فيدي فالفيردي',
        number: 8,
        role: 'المدفع الأوروغوياني',
        rating: 92,
        image: haalandImg,
        signatureMove: 'صاروخ عابر للقارات يمزق الشباك',
        celebrationStyle: 'صرخة قتالية وضرب شعار النادي الملكي',
        shotPower: 99,
        curvePower: 86,
        clutch: 93
      }
    ]
  },
  {
    id: 'barca',
    name: 'برشلونة',
    country: 'إسبانيا',
    flag: '🇪🇸',
    badge: '🔴',
    stadium: 'كامب نو الجديد',
    rating: 94,
    primaryColor: '#1e3a8a',
    secondaryColor: '#dc2626',
    players: [
      {
        id: 'yamal_fcb',
        name: 'لامين يامال',
        number: 19,
        role: 'الفتى الذهبي الخارق',
        rating: 93,
        image: yamalImg,
        signatureMove: 'تقويسة مذهلة بالقدم اليسرى بالملم في الزاوية 90',
        celebrationStyle: 'إشارة الرمز 304 تحية لحيّه وتألقه الساحر',
        shotPower: 91,
        curvePower: 98,
        clutch: 95
      },
      {
        id: 'lewy_fcb',
        name: 'روبرت ليفاندوفسكي',
        number: 9,
        role: 'الماكينة التهديفية',
        rating: 94,
        image: haalandImg,
        signatureMove: 'تسديدة متقنة بعد وقفة تمويه تخادع الحارس',
        celebrationStyle: 'ضم القبضتين إلى الصدر بتركيز البطل',
        shotPower: 96,
        curvePower: 89,
        clutch: 96
      },
      {
        id: 'raphinha_fcb',
        name: 'رافينيا دياز',
        number: 11,
        role: 'القائد المقاتل',
        rating: 93,
        image: neymarImg,
        signatureMove: 'كرة قوية موجهة بدقة متناهية لأقصى الزاوية',
        celebrationStyle: 'القفز في الهواء وتحية الجماهير بحماس ناري',
        shotPower: 94,
        curvePower: 93,
        clutch: 94
      },
      {
        id: 'pedri_fcb',
        name: 'بيدري غونزاليس',
        number: 8,
        role: 'رسام خط الوسط',
        rating: 92,
        image: messiImg,
        signatureMove: 'ركن الكرة بنعومة في الشباك الجانبية',
        celebrationStyle: 'حركة النظارات الشهيرة تحية لوالده',
        shotPower: 88,
        curvePower: 97,
        clutch: 93
      },
      {
        id: 'gavi_fcb',
        name: 'بابلو غافي',
        number: 6,
        role: 'المحارب الأندلسي',
        rating: 90,
        image: ronaldoImg,
        signatureMove: 'تسديدة حاسمة مليئة بالقوة والعزيمة',
        celebrationStyle: 'صرخة الشغف وتقبيل قميص البلوغرانا',
        shotPower: 92,
        curvePower: 88,
        clutch: 94
      },
      {
        id: 'olmo_fcb',
        name: 'داني أولمو',
        number: 20,
        role: 'صانع الفوارق',
        rating: 91,
        image: mbappeImg,
        signatureMove: 'تسديدة ساقطة بذكاء من فوق ارتماءة الحارس',
        celebrationStyle: 'الإشارة إلى ساعة اليد (وقت الحسم)',
        shotPower: 90,
        curvePower: 95,
        clutch: 92
      }
    ]
  },
  {
    id: 'city',
    name: 'مانشستر سيتي',
    country: 'إنجلترا',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    badge: '⚡',
    stadium: 'ملعب الاتحاد',
    rating: 95,
    primaryColor: '#38bdf8',
    secondaryColor: '#ffffff',
    players: [
      {
        id: 'haaland_mcfc',
        name: 'إيرلينغ هالاند',
        number: 9,
        role: 'المدمر النرويجي',
        rating: 97,
        image: haalandImg,
        signatureMove: 'مدفعية خارقة تمزق شباك المرمى دون رحمة',
        celebrationStyle: 'جلسة التأمل واليوغا وسط صخب الملعب',
        shotPower: 99,
        curvePower: 85,
        clutch: 96
      },
      {
        id: 'kdb_mcfc',
        name: 'كيفين دي بروين',
        number: 17,
        role: 'مهندس التمريرات والضربات',
        rating: 95,
        image: messiImg,
        signatureMove: 'صاروخ موجه ليزرياً في زاوية مستحيلة',
        celebrationStyle: 'الابتسامة الهادئة والإشارة إلى زملائه',
        shotPower: 95,
        curvePower: 99,
        clutch: 97
      },
      {
        id: 'foden_mcfc',
        name: 'فيل فودين',
        number: 47,
        role: 'فتى ستوكبورت المعجزة',
        rating: 93,
        image: yamalImg,
        signatureMove: 'تسديدة يسارية بارعة تلتف حول الحارس',
        celebrationStyle: 'حركة القناص الشهيرة بيديه',
        shotPower: 92,
        curvePower: 96,
        clutch: 93
      },
      {
        id: 'bernardo_mcfc',
        name: 'برناردو سيلفا',
        number: 20,
        role: 'العقل المدبر',
        rating: 91,
        image: neymarImg,
        signatureMove: 'ركلة أرضية زاحفة في أقصى القائم البعيد',
        celebrationStyle: 'الركض نحو الجماهير بعناق حار',
        shotPower: 89,
        curvePower: 94,
        clutch: 92
      },
      {
        id: 'rodri_mcfc',
        name: 'رودري هيرنانديز',
        number: 16,
        role: 'حاصد الكرة الذهبية',
        rating: 95,
        image: ronaldoImg,
        signatureMove: 'قذيفة مركزة ومحسوبة في قلب الشباك',
        celebrationStyle: 'رفع يديه بهدوء القادة واحتضان زملائه',
        shotPower: 93,
        curvePower: 91,
        clutch: 99
      }
    ]
  },
  {
    id: 'hilal',
    name: 'الهلال السعودي',
    country: 'السعودية',
    flag: '🇸🇦',
    badge: '🔵',
    stadium: 'المملكة أرينا',
    rating: 93,
    primaryColor: '#002b80',
    secondaryColor: '#ffffff',
    players: [
      {
        id: 'salem_hilal',
        name: 'سالم الدوسري',
        number: 29,
        role: 'التورنيدو الأيقوني',
        rating: 93,
        image: salahImg,
        signatureMove: 'تسديدة تورنيدو مقوسة في أعلى زاوية للمرمى',
        celebrationStyle: 'الشقلبة الهوائية الثلاثية وسط هتاف الأزرق',
        shotPower: 93,
        curvePower: 96,
        clutch: 97
      },
      {
        id: 'mitro_hilal',
        name: 'ألكسندر ميتروفيتش',
        number: 9,
        role: 'السفاح الصربي',
        rating: 92,
        image: haalandImg,
        signatureMove: 'رأسية أو قذيفة صاروخية لا تصد ولا ترد',
        celebrationStyle: 'حركة اليد المجنونة بجانب الأذن',
        shotPower: 98,
        curvePower: 86,
        clutch: 95
      },
      {
        id: 'neymar_hilal',
        name: 'نيمار جونيور',
        number: 10,
        role: 'الساحر العالمي',
        rating: 94,
        image: neymarImg,
        signatureMove: 'خداع الحارس بوقفة تردد ثم إسقاط الكرة بخفة',
        celebrationStyle: 'حركة الشاكا والرقصة الساحرة مع الجماهير',
        shotPower: 90,
        curvePower: 98,
        clutch: 94
      },
      {
        id: 'neves_hilal',
        name: 'روبن نيفيز',
        number: 8,
        role: 'مدفعجي الضربات الثابتة',
        rating: 91,
        image: ronaldoImg,
        signatureMove: 'قوس مدفعي ناري يخترق الزاوية الصعبة',
        celebrationStyle: 'الإشارة إلى الرأس (قوة التفكير والتركيز)',
        shotPower: 97,
        curvePower: 94,
        clutch: 93
      },
      {
        id: 'malcom_hilal',
        name: 'مالكوم أوليفيرا',
        number: 77,
        role: 'الجناح البرازيلي الطائر',
        rating: 90,
        image: mbappeImg,
        signatureMove: 'تسديدة يسارية مباغتة في الزاوية الضيقة',
        celebrationStyle: 'الابتسامة العريضة والرقص مع المدرج الأزرق',
        shotPower: 91,
        curvePower: 93,
        clutch: 91
      },
      {
        id: 'sms_hilal',
        name: 'سيرجي سافيتش',
        number: 22,
        role: 'العملاق الصربي',
        rating: 91,
        image: messiImg,
        signatureMove: 'تسديدة محكمة في الزاوية الأرضية اليمنى',
        celebrationStyle: 'رفع القبضة نحو السماء بكل قوة',
        shotPower: 94,
        curvePower: 89,
        clutch: 92
      }
    ]
  },
  {
    id: 'ahly',
    name: 'الأهلي المصري',
    country: 'مصر',
    flag: '🇪🇬',
    badge: '🦅',
    stadium: 'ستاد القاهرة الدولي',
    rating: 92,
    primaryColor: '#dc2626',
    secondaryColor: '#f59e0b',
    players: [
      {
        id: 'emam_ahly',
        name: 'إمام عاشور',
        number: 22,
        role: 'المايسترو الديناميكي',
        rating: 92,
        image: salahImg,
        signatureMove: 'قذيفة R2 لولبية بالمقاس في المقص المستحيل',
        celebrationStyle: 'رقصة النسر والقفز على الإعلانات مع الجماهير',
        shotPower: 95,
        curvePower: 95,
        clutch: 96
      },
      {
        id: 'wessam_ahly',
        name: 'وسام أبو علي',
        number: 9,
        role: 'الهداف الفلسطيني الفدائي',
        rating: 91,
        image: haalandImg,
        signatureMove: 'تسديدة قوية قاتلة تحت العارضة مباشرة',
        celebrationStyle: 'علامة النصر وتقبيل علم النادي الأحمر',
        shotPower: 96,
        curvePower: 88,
        clutch: 95
      },
      {
        id: 'shahat_ahly',
        name: 'حسين الشحات',
        number: 14,
        role: 'نينجا المراوغات',
        rating: 90,
        image: neymarImg,
        signatureMove: 'كرة مباغتة تركن في أقصى زاوية أرضية',
        celebrationStyle: 'السجود شكراً ثم الانزلاق نحو راية الركنية',
        shotPower: 90,
        curvePower: 93,
        clutch: 92
      },
      {
        id: 'afsha_ahly',
        name: 'محمد مجدي أفشة',
        number: 19,
        role: 'صاحب القاضية ممكن',
        rating: 90,
        image: messiImg,
        signatureMove: 'تسديدة ساقطة دراماتيكية في اللحظات القاتلة',
        celebrationStyle: 'احتفال القاضية المثير والركض بجنون نحو المدرج',
        shotPower: 91,
        curvePower: 94,
        clutch: 99
      },
      {
        id: 'tau_ahly',
        name: 'بيرسي تاو',
        number: 23,
        role: 'أسد البافانا بافانا',
        rating: 89,
        image: yamalImg,
        signatureMove: 'تسديدة سريعة بالقدم اليسرى تلدغ الشباك',
        celebrationStyle: 'رقصة الأسد الجنوب أفريقي الشهيرة',
        shotPower: 89,
        curvePower: 91,
        clutch: 90
      }
    ]
  },
  {
    id: 'argentina',
    name: 'منتخب الأرجنتين',
    country: 'الأرجنتين',
    flag: '🇦🇷',
    badge: '☀️',
    stadium: 'المونومنتال بوينس آيرس',
    rating: 97,
    primaryColor: '#38bdf8',
    secondaryColor: '#ffffff',
    players: [
      {
        id: 'messi_arg',
        name: 'ليونيل ميسي',
        number: 10,
        role: 'أسطورة كرة القدم عبر التاريخ',
        rating: 98,
        image: messiImg,
        signatureMove: 'تقويسة مجهرية بالقدم اليسرى في عين العارضة',
        celebrationStyle: 'رفع السبابتين إلى السماء بنظرة هادئة للأعلى',
        shotPower: 92,
        curvePower: 99,
        clutch: 99
      },
      {
        id: 'alvarez_arg',
        name: 'خوليان ألفاريز',
        number: 9,
        role: 'العنكبوت الأرجنتيني',
        rating: 93,
        image: yamalImg,
        signatureMove: 'تسديدة نارية مباغتة تصدم الحارس قبل حركته',
        celebrationStyle: 'حركة سبايدرمان الشهيرة بكلتا اليدين',
        shotPower: 94,
        curvePower: 90,
        clutch: 94
      },
      {
        id: 'lautaro_arg',
        name: 'لاوتارو مارتينيز',
        number: 22,
        role: 'التورو المدمر',
        rating: 93,
        image: haalandImg,
        signatureMove: 'قذيفة مدوية لا تصد تهز أركان المرمى',
        celebrationStyle: 'عقد الذراعين على الصدر بصلابة الثور',
        shotPower: 96,
        curvePower: 88,
        clutch: 95
      },
      {
        id: 'depaul_arg',
        name: 'رودريغو دي بول',
        number: 7,
        role: 'حارس الأسطورة والمحارب',
        rating: 91,
        image: ronaldoImg,
        signatureMove: 'تسديدة قوية واثقة ترتطم بالشباك بقوة',
        celebrationStyle: 'القفز واحتضان ميسي وبقية الزملاء',
        shotPower: 92,
        curvePower: 89,
        clutch: 93
      },
      {
        id: 'enzo_arg',
        name: 'إنزو فيرنانديز',
        number: 24,
        role: 'صانع الفرحة العالمية',
        rating: 91,
        image: mbappeImg,
        signatureMove: 'تسديدة مقوسة من خارج المنطقة إلى زاوية 90',
        celebrationStyle: 'الإشارة إلى القلب وشعار الأرجنتين',
        shotPower: 93,
        curvePower: 93,
        clutch: 92
      }
    ]
  },
  {
    id: 'brazil',
    name: 'منتخب البرازيل',
    country: 'البرازيل',
    flag: '🇧🇷',
    badge: '⭐',
    stadium: 'ماراكانا الأسطوري',
    rating: 95,
    primaryColor: '#eab308',
    secondaryColor: '#1d4ed8',
    players: [
      {
        id: 'vini_br',
        name: 'فينيسيوس جونيور',
        number: 7,
        role: 'نجم السامبا الأول',
        rating: 96,
        image: viniActionImg,
        signatureMove: 'تسديدة ساحرة في المقص الأيسر للحارس',
        celebrationStyle: 'رقصة السامبا البرازيلية الشهيرة مع الجماهير',
        shotPower: 94,
        curvePower: 97,
        clutch: 96
      },
      {
        id: 'neymar_br',
        name: 'نيمار جونيور',
        number: 10,
        role: 'الساحر التاريخي للسامبا',
        rating: 94,
        image: neymarImg,
        signatureMove: 'خداع الحارس بوقفة تردد ثم ركن الكرة بخفة',
        celebrationStyle: 'حركة الشاكا والرقصة الساحرة مع الجماهير',
        shotPower: 90,
        curvePower: 98,
        clutch: 95
      },
      {
        id: 'rodrygo_br',
        name: 'رودريغو غوس',
        number: 11,
        role: 'جوهرة سانتوس ومدريد',
        rating: 92,
        image: yamalImg,
        signatureMove: 'تسديدة مقوسة بارعة تعانق الشباك',
        celebrationStyle: 'الركض نحو الكاميرا والابتسامة الساحرة',
        shotPower: 91,
        curvePower: 95,
        clutch: 94
      },
      {
        id: 'raphinha_br',
        name: 'رافينيا دياز',
        number: 19,
        role: 'صاروخ الأطراف',
        rating: 92,
        image: ronaldoImg,
        signatureMove: 'تسديدة مقوسة بالقدم اليسرى في أقصى الزاوية',
        celebrationStyle: 'القفز الهوائي وتحية الجمهور بحماس',
        shotPower: 93,
        curvePower: 94,
        clutch: 93
      },
      {
        id: 'martinelli_br',
        name: 'غابرييل مارتينيلي',
        number: 22,
        role: 'السهم السريع',
        rating: 90,
        image: mbappeImg,
        signatureMove: 'تسديدة قوية في سقف الشباك',
        celebrationStyle: 'الانزلاق على ركبتيه وإشارة النصر',
        shotPower: 92,
        curvePower: 90,
        clutch: 91
      }
    ]
  },
  {
    id: 'france',
    name: 'منتخب فرنسا',
    country: 'فرنسا',
    flag: '🇫🇷',
    badge: '🐓',
    stadium: 'ستاد دو فرانس',
    rating: 95,
    primaryColor: '#1e293b',
    secondaryColor: '#3b82f6',
    players: [
      {
        id: 'mbappe_fr',
        name: 'كيليان مبابي',
        number: 10,
        role: 'القائد والهداف التاريخي',
        rating: 97,
        image: mbappeImg,
        signatureMove: 'تسديدة مباغتة فائقة السرعة على يسار الحارس',
        celebrationStyle: 'ثني الذراعين تحت الإبطين بنظرة التحدي',
        shotPower: 98,
        curvePower: 91,
        clutch: 98
      },
      {
        id: 'griezmann_fr',
        name: 'أنطوان غريزمان',
        number: 7,
        role: 'عقل الديوك المفكر',
        rating: 93,
        image: messiImg,
        signatureMove: 'تسديدة متقنة بلمسة فنية تسكن الشباك',
        celebrationStyle: 'رقصة «Take the L» الشهيرة وتحية الجماهير',
        shotPower: 91,
        curvePower: 96,
        clutch: 94
      },
      {
        id: 'dembele_fr',
        name: 'عثمان ديمبيلي',
        number: 11,
        role: 'المراوغ المزدوج بالقدمين',
        rating: 91,
        image: yamalImg,
        signatureMove: 'تسديدة صاروخية بالقدم المفاجئة',
        celebrationStyle: 'الابتسامة العريضة واحتضان الزملاء',
        shotPower: 93,
        curvePower: 92,
        clutch: 91
      },
      {
        id: 'camavinga_fr',
        name: 'إدواردو كامافينغا',
        number: 6,
        role: 'الجوهرة متعددة المراكز',
        rating: 91,
        image: neymarImg,
        signatureMove: 'تسديدة زاحفة دقيقة تمر بين أصابع الحارس',
        celebrationStyle: 'الرقص مع مبابي وتحية المدرج الفرنسي',
        shotPower: 90,
        curvePower: 92,
        clutch: 92
      },
      {
        id: 'tchouameni_fr',
        name: 'أوريليان تشواميني',
        number: 8,
        role: 'حائط الصد والمدفعجي',
        rating: 90,
        image: ronaldoImg,
        signatureMove: 'تسديدة صاروخية تنفجر في الزاوية البعيدة',
        celebrationStyle: 'وضع الإصبع على الرأس (التركيز الحديدي)',
        shotPower: 96,
        curvePower: 87,
        clutch: 92
      }
    ]
  },
  {
    id: 'egypt',
    name: 'منتخب مصر',
    country: 'مصر',
    flag: '🇪🇬',
    badge: '👑',
    stadium: 'ستاد مصر بالعاصمة الإدارية',
    rating: 93,
    primaryColor: '#dc2626',
    secondaryColor: '#ffffff',
    players: [
      {
        id: 'salah_egy',
        name: 'محمد صلاح',
        number: 10,
        role: 'الملك المصري والفخر العربي',
        rating: 97,
        image: salahImg,
        signatureMove: 'تقويسة ملكية ساحرة في الزاوية 90 البعيدة',
        celebrationStyle: 'السجود شكراً لله ثم الوقوف بثبات على قدم واحدة (حركة اليوغا)',
        shotPower: 95,
        curvePower: 99,
        clutch: 99
      },
      {
        id: 'marmoush_egy',
        name: 'عمر مرموش',
        number: 7,
        role: 'صاروخ البوندسليغا',
        rating: 93,
        image: yamalImg,
        signatureMove: 'ضربة حرة مقوسة مستحيلة فوق الحائط البشري',
        celebrationStyle: 'الركض السريع وفتح الذراعين كالصقر المحلق',
        shotPower: 96,
        curvePower: 97,
        clutch: 95
      },
      {
        id: 'mostafa_egy',
        name: 'مصطفى محمد',
        number: 11,
        role: 'الأناكوندا التهديفية',
        rating: 90,
        image: haalandImg,
        signatureMove: 'قذيفة رأسية أو أرضية صلبة تمزق الشباك',
        celebrationStyle: 'حركة السهام بالقوس والنشاب',
        shotPower: 96,
        curvePower: 87,
        clutch: 92
      },
      {
        id: 'trezeguet_egy',
        name: 'محمود تريزيجيه',
        number: 17,
        role: 'المحارب المقاتل',
        rating: 90,
        image: ronaldoImg,
        signatureMove: 'تسديدة يسارية مباغتة تسكن الزاوية الأرضية',
        celebrationStyle: 'الركض نحو المدرج وضرب شعار الفراعنة',
        shotPower: 92,
        curvePower: 91,
        clutch: 94
      },
      {
        id: 'emam_egy',
        name: 'إمام عاشور',
        number: 8,
        role: 'الموهبة الخارقة',
        rating: 91,
        image: salahImg,
        signatureMove: 'قذيفة بعيدة المدى تلف بالمقاس نحو القائم الداخلي',
        celebrationStyle: 'الابتسامة الواثقة والاحتفال بحماس مع الجماهير',
        shotPower: 94,
        curvePower: 94,
        clutch: 93
      }
    ]
  },
  {
    id: 'morocco',
    name: 'منتخب المغرب',
    country: 'المغرب',
    flag: '🇲🇦',
    badge: '🦁',
    stadium: 'مركب محمد الخامس بالدار البيضاء',
    rating: 94,
    primaryColor: '#dc2626',
    secondaryColor: '#16a34a',
    players: [
      {
        id: 'hakimi_mar',
        name: 'أشرف حكيمي',
        number: 2,
        role: 'القطار السريع والبانينكا التاريخية',
        rating: 95,
        image: mbappeImg,
        signatureMove: 'ركلة بانينكا ساقطة ببرود أعصاب لا يوصف',
        celebrationStyle: 'رقصة البطريق الشهيرة والتحية لوالدته',
        shotPower: 94,
        curvePower: 94,
        clutch: 98
      },
      {
        id: 'ziyech_mar',
        name: 'حكيم زياش',
        number: 7,
        role: 'الساحر ذو القدم اليسرى الذهبية',
        rating: 92,
        image: messiImg,
        signatureMove: 'كرة لولبية ملتفة في أعلى الزاوية البعيدة',
        celebrationStyle: 'الغمزة الهادئة والإشارة إلى القميص المغربي',
        shotPower: 93,
        curvePower: 98,
        clutch: 94
      },
      {
        id: 'diaz_mar',
        name: 'إبراهيم دياز',
        number: 10,
        role: 'المايسترو الساحر',
        rating: 93,
        image: yamalImg,
        signatureMove: 'تسديدة مقوسة بعد مراوغة الحارس في مساحة ضيقة',
        celebrationStyle: 'فتح الذراعين وتقبيل العلم المغربي',
        shotPower: 91,
        curvePower: 96,
        clutch: 94
      },
      {
        id: 'en_nesyri_mar',
        name: 'يوسف النصيري',
        number: 19,
        role: 'صقر الأطلس الطائر',
        rating: 91,
        image: haalandImg,
        signatureMove: 'ارتقاء جوي ساحق وتسديدة كالصاروخ',
        celebrationStyle: 'السجود شكراً وصرخة الأسود المدوية',
        shotPower: 95,
        curvePower: 86,
        clutch: 93
      },
      {
        id: 'amrabat_mar',
        name: 'سفيان أمرابط',
        number: 4,
        role: 'صخرة خط الوسط الدفاعية',
        rating: 90,
        image: ronaldoImg,
        signatureMove: 'تسديدة عنيفة مباشرة في قلب الشباك',
        celebrationStyle: 'القبضة الحديدية والعناق الرجولي الحماسي',
        shotPower: 95,
        curvePower: 85,
        clutch: 93
      }
    ]
  },
  {
    id: 'saudi',
    name: 'منتخب السعودية',
    country: 'السعودية',
    flag: '🇸🇦',
    badge: '🦅',
    stadium: 'ملعب الجوهرة المشعة بجدة',
    rating: 92,
    primaryColor: '#16a34a',
    secondaryColor: '#ffffff',
    players: [
      {
        id: 'salem_ksa',
        name: 'سالم الدوسري',
        number: 10,
        role: 'قاهر الأرجنتين والتورنيدو',
        rating: 93,
        image: salahImg,
        signatureMove: 'قذيفة آر تو في شباك مارتينيز مثل مونديال قطر',
        celebrationStyle: 'الشقلبة البهلوانية وتحية الوطن الخضراء',
        shotPower: 94,
        curvePower: 97,
        clutch: 98
      },
      {
        id: 'buraikan_ksa',
        name: 'فراس البريكان',
        number: 9,
        role: 'المهاجم القناص الماكر',
        rating: 90,
        image: yamalImg,
        signatureMove: 'تسديدة أرضية دقيقة تصطدم بالقائم الداخلي وتعانق الشباك',
        celebrationStyle: 'حركة العزف على الغيتار الشهيرة',
        shotPower: 91,
        curvePower: 91,
        clutch: 92
      },
      {
        id: 'shehri_ksa',
        name: 'صالح الشهري',
        number: 11,
        role: 'هداف الصندوق الحاسم',
        rating: 89,
        image: haalandImg,
        signatureMove: 'تسديدة زاحفة قوية تفاجئ الحارس في الزاوية اليسرى',
        celebrationStyle: 'السجود والابتسامة المشرقة مع زملائه',
        shotPower: 92,
        curvePower: 88,
        clutch: 91
      },
      {
        id: 'ghareeb_ksa',
        name: 'عبد الرحمن غريب',
        number: 7,
        role: 'الجناح المهاري المبدع',
        rating: 89,
        image: neymarImg,
        signatureMove: 'تسديدة رشيقة مقوسة ترتفع فوق ارتماءة الحارس',
        celebrationStyle: 'القفز نحو المدرج الأخضر بحماس كبير',
        shotPower: 89,
        curvePower: 94,
        clutch: 90
      },
      {
        id: 'kano_ksa',
        name: 'محمد كنو',
        number: 12,
        role: 'البرج المتألق',
        rating: 89,
        image: mbappeImg,
        signatureMove: 'تسديدة طويلة قوية مركزة في الزاوية 90',
        celebrationStyle: 'رفع الأيدي إلى السماء وتحية الجماهير الحارة',
        shotPower: 93,
        curvePower: 89,
        clutch: 90
      }
    ]
  },
  {
    id: 'portugal',
    name: 'منتخب البرتغال',
    country: 'البرتغال',
    flag: '🇵🇹',
    badge: '🛡️',
    stadium: 'ملعب دا لوز بلشبونة',
    rating: 94,
    primaryColor: '#dc2626',
    secondaryColor: '#15803d',
    players: [
      {
        id: 'ronaldo_por',
        name: 'كريستيانو رونالدو',
        number: 7,
        role: 'الدون والهداف التاريخي',
        rating: 96,
        image: ronaldoImg,
        signatureMove: 'صاروخ توماهوك ينفجر في الشباك مع وقفة التحدي',
        celebrationStyle: 'القفزة الهوائية الأيقونية الشهيرة (SIUUU)',
        shotPower: 98,
        curvePower: 92,
        clutch: 99
      },
      {
        id: 'bruno_por',
        name: 'برونو فيرنانديز',
        number: 8,
        role: 'مايسترو التمريرات القاتلة',
        rating: 93,
        image: messiImg,
        signatureMove: 'ركن الكرة بدقة بعد قفزة تمويه خادعة',
        celebrationStyle: 'وضع اليدين على الأذنين بسكينة واثقة',
        shotPower: 94,
        curvePower: 95,
        clutch: 95
      },
      {
        id: 'bernardo_por',
        name: 'برناردو سيلفا',
        number: 10,
        role: 'الساحر البرتغالي الأنيق',
        rating: 92,
        image: yamalImg,
        signatureMove: 'تسديدة مقوسة بارعة تعانق الزاوية الصعبة',
        celebrationStyle: 'الابتسامة العريضة واحتضان الزملاء',
        shotPower: 89,
        curvePower: 97,
        clutch: 93
      },
      {
        id: 'leao_por',
        name: 'رفائيل لياو',
        number: 17,
        role: 'الفهد الأسمر السريع',
        rating: 91,
        image: mbappeImg,
        signatureMove: 'انطلاقة صاروخية وتسديدة مدوية في سقف المرمى',
        celebrationStyle: 'الابتسامة الدائمة والرقص مع الجماهير',
        shotPower: 95,
        curvePower: 90,
        clutch: 92
      },
      {
        id: 'felix_por',
        name: 'جواو فيليكس',
        number: 11,
        role: 'الموهبة الذهبية',
        rating: 90,
        image: neymarImg,
        signatureMove: 'إسقاط الكرة بذكاء من فوق ارتماءة الحارس',
        celebrationStyle: 'رفع الأيدي إلى السماء وتحية المشجعين',
        shotPower: 90,
        curvePower: 94,
        clutch: 91
      }
    ]
  }
];

// Goalkeeper Opponent Card
export const GOALKEEPER_OPPONENT = {
  name: 'غييرمو أوتشوا',
  number: 13,
  title: 'الأخطبوط المكسيكي الأسطوري',
  rating: 94,
  image: ochoaImg,
  saveStyle: 'ردات فعل خارقة وقفازات حديدية على خط المرمى'
};

// ========================================================
// 3. بنك الأسئلة التعليمية التفاعلية للركلات الترجيحية
// ========================================================
export interface AnswerOption {
  letter: string;
  text: string;
  correct: boolean;
  cornerIndex: number;
  cornerName: string;
  cornerIcon: string;
}

export interface Question {
  id: number;
  prompt: string;
  category: string;
  explanation: string;
  answers: AnswerOption[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    prompt: "ما هو الفاعل في جملة: «يقرأُ الطالبُ الكتابَ بانتظام»؟",
    category: "النحو والإعراب",
    explanation: "الفاعل هو الاسم المرفوع الذي قام بالفعل، وهو هنا «الطالبُ» وعلامة رفعه الضمة الظاهرة على آخره.",
    answers: [
      { letter: "أ", text: "الطالبُ", correct: true, cornerIndex: 0, cornerName: "الزاوية العليا اليسرى (مقص 90)", cornerIcon: "↖" },
      { letter: "ب", text: "الكتابَ", correct: false, cornerIndex: 1, cornerName: "الزاوية العليا اليمنى (مقص 90)", cornerIcon: "↗" },
      { letter: "ج", text: "يقرأُ", correct: false, cornerIndex: 2, cornerName: "الزاوية الأرضية اليسرى", cornerIcon: "↙" },
      { letter: "د", text: "بانتظام", correct: false, cornerIndex: 3, cornerName: "الزاوية الأرضية اليمنى", cornerIcon: "↘" }
    ]
  },
  {
    id: 2,
    prompt: "أي الكلمات التالية كُتبت بهمزة متطرفة صحيحة إملائياً؟",
    category: "الإملاء والرسم القرآني",
    explanation: "تُكتب الهمزة المتطرفة على الياء غير المنقوطة (شاطئ) لأن الحرف السابق لها مكسور (الطاء مكسورة).",
    answers: [
      { letter: "أ", text: "شاطيء", correct: false, cornerIndex: 0, cornerName: "الزاوية العليا اليسرى", cornerIcon: "↖" },
      { letter: "ب", text: "شاطئ", correct: true, cornerIndex: 1, cornerName: "الزاوية العليا اليمنى", cornerIcon: "↗" },
      { letter: "ج", text: "شاطأ", correct: false, cornerIndex: 2, cornerName: "الزاوية الأرضية اليسرى", cornerIcon: "↙" },
      { letter: "د", text: "شاطؤ", correct: false, cornerIndex: 3, cornerName: "الزاوية الأرضية اليمنى", cornerIcon: "↘" }
    ]
  },
  {
    id: 3,
    prompt: "حدد الكلمة التي تبدأ بـ «همزة قطع» صريحة فيما يلي:",
    category: "قواعد الإملاء",
    explanation: "«أحمد» همزتها همزة قطع لأنها اسم علم معرب، في حين أن مصادر الأفعال الخماسية والسداسية كاستغفار تبدأ بهمزة وصل.",
    answers: [
      { letter: "أ", text: "استغفار", correct: false, cornerIndex: 0, cornerName: "الزاوية العليا اليسرى", cornerIcon: "↖" },
      { letter: "ب", text: "ابن", correct: false, cornerIndex: 1, cornerName: "الزاوية العليا اليمنى", cornerIcon: "↗" },
      { letter: "ج", text: "أحمد", correct: true, cornerIndex: 2, cornerName: "الزاوية الأرضية اليسرى", cornerIcon: "↙" },
      { letter: "د", text: "انطلق", correct: false, cornerIndex: 3, cornerName: "الزاوية الأرضية اليمنى", cornerIcon: "↘" }
    ]
  },
  {
    id: 4,
    prompt: "الجملة السليمة نحوياً عند دخول الفعل الناسخ «كان» هي:",
    category: "النواسخ في اللغة العربية",
    explanation: "«كان» ترفع المبتدأ اسماً لها (المعلمون بالواو لأنه جمع مذكر سالم) وتنصب الخبر (حاضرين بالياء).",
    answers: [
      { letter: "أ", text: "كان المعلمون حاضرين", correct: true, cornerIndex: 0, cornerName: "الزاوية العليا اليسرى", cornerIcon: "↖" },
      { letter: "ب", text: "كان المعلمين حاضرون", correct: false, cornerIndex: 1, cornerName: "الزاوية العليا اليمنى", cornerIcon: "↗" },
      { letter: "ج", text: "كان المعلمون حاضرون", correct: false, cornerIndex: 2, cornerName: "الزاوية الأرضية اليسرى", cornerIcon: "↙" },
      { letter: "د", text: "كان المعلمين حاضرين", correct: false, cornerIndex: 3, cornerName: "الزاوية الأرضية اليمنى", cornerIcon: "↘" }
    ]
  },
  {
    id: 5,
    prompt: "الكلمة الصحيحة لملء الفراغ: (.... الطالبان إلى المدرسة مبكرينِ)",
    category: "مطابقة الفعل للفاعل",
    explanation: "الفعل في صدارة الجملة يلزم الإفراد دائماً وإن كان الفاعل مثنى أو جمعاً، فالصواب «جاءَ» دون ضمائر تثنية.",
    answers: [
      { letter: "أ", text: "جاءا", correct: false, cornerIndex: 0, cornerName: "الزاوية العليا اليسرى", cornerIcon: "↖" },
      { letter: "ب", text: "جاءوا", correct: false, cornerIndex: 1, cornerName: "الزاوية العليا اليمنى", cornerIcon: "↗" },
      { letter: "ج", text: "جاؤوا", correct: false, cornerIndex: 2, cornerName: "الزاوية الأرضية اليسرى", cornerIcon: "↙" },
      { letter: "د", text: "جاءَ", correct: true, cornerIndex: 3, cornerName: "الزاوية الأرضية اليمنى", cornerIcon: "↘" }
    ]
  }
];

// ========================================================
// 4. محرك التعليق والأصوات الاستاديومية الواقعية
// ========================================================
class StadiumSoundEngine {
  ctx: AudioContext | null = null;
  ambientNode: AudioBufferSourceNode | null = null;
  ambientGain: GainNode | null = null;
  muted: boolean = false;

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(m ? 0 : 0.12, this.ctx?.currentTime || 0);
    }
  }

  startStadiumAmbience() {
    if (this.muted) return;
    this.init();
    if (!this.ctx || this.ambientNode) return;
    try {
      const bufferSize = this.ctx.sampleRate * 4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + (0.02 * white)) / 1.02;
        last = data[i];
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 320;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
      this.ambientNode = noise;
      this.ambientGain = gain;
    } catch {}
  }

  playHeartbeat() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.12);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  playWhistle() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(2850, now);
      osc2.frequency.setValueAtTime(3120, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch {}
  }

  playPowerfulKick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(155, now);
      osc.frequency.exponentialRampToValueAtTime(26, now + 0.18);
      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  playWoodworkHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1120, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.35);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  playCrowdChant() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Rhythmic stadium crowd claps & cheering
      for (let i = 0; i < 4; i++) {
        const time = now + i * 0.4;
        const bufSize = Math.floor(this.ctx.sampleRate * 0.25);
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let j = 0; j < bufSize; j++) data[j] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800 + i * 50, time);
        filter.Q.setValueAtTime(2.0, time);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, time);
        gain.gain.linearRampToValueAtTime(0.4, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(time);
        noise.stop(time + 0.25);
      }
    } catch {}
  }

  playGoalCheer() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 1. Massive explosive crowd roar
      const bufSize = Math.floor(this.ctx.sampleRate * 4.0);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, now);
      filter.frequency.linearRampToValueAtTime(950, now + 0.6);
      filter.frequency.exponentialRampToValueAtTime(500, now + 4.0);
      filter.Q.setValueAtTime(1.2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(1.0, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 4.0);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 4.0);

      // 2. Stadium air-horn fan celebration burst
      const hornOsc = this.ctx.createOscillator();
      const hornGain = this.ctx.createGain();
      hornOsc.type = 'sawtooth';
      hornOsc.frequency.setValueAtTime(440, now + 0.15);
      hornOsc.frequency.linearRampToValueAtTime(466, now + 0.5);
      hornGain.gain.setValueAtTime(0, now);
      hornGain.gain.linearRampToValueAtTime(0.2, now + 0.2);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      hornOsc.connect(hornGain);
      hornGain.connect(this.ctx.destination);
      hornOsc.start(now + 0.15);
      hornOsc.stop(now + 0.9);
    } catch {}
  }

  playDespairGasp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Collective stadium gasp / groan from 80,000 fans
      const bufSize = Math.floor(this.ctx.sampleRate * 2.2);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.linearRampToValueAtTime(180, now + 1.4);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 2.0);
    } catch {}
  }
}

const audio = new StadiumSoundEngine();

// ========================================================
// 5. المكون الرئيسي الشامل: ركلات الترجيح الاحترافية FIFA 2026
// ========================================================

interface PenaltyShootoutProps {
  onBack?: () => void;
  onWin?: (xp: number) => void;
}

export function PenaltyShootout({ onBack, onWin }: PenaltyShootoutProps) {
  // Navigation Flow: 'intro' -> 'dashboard' -> 'roster' -> 'match' -> 'ceremony'
  const [stage, setStage] = useState<'intro' | 'dashboard' | 'roster' | 'match' | 'ceremony'>('intro');

  // Selected Team & Opponent
  const [selectedTeam, setSelectedTeam] = useState<TeamInfo>(WORLD_TEAMS[0]);
  const [opponentTeam, setOpponentTeam] = useState<TeamInfo>(WORLD_TEAMS[5]);
  
  // Selected 5 Players from Selected Team
  const [squad, setSquad] = useState<PlayerCard[]>(() => {
    return WORLD_TEAMS[0].players.slice(0, 5);
  });

  // Whenever user changes selected team, default squad to its first 5 players
  const handleSelectTeam = (team: TeamInfo, proceedToRoster = false) => {
    setSelectedTeam(team);
    setSquad(team.players.slice(0, 5));
    if (proceedToRoster || selectedTeam.id === team.id) {
      setStage('roster');
    }
  };

  // Match Status
  const [currentRound, setCurrentRound] = useState(0); // 0 to 4 (5 penalty kicks)
  const [score, setScore] = useState({ player: 0, opponent: 0 });
  const [roundsHistory, setRoundsHistory] = useState<('goal' | 'miss')[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  // Cinematic Cuts:
  // 'tension' (كادر التوتر والتركيز) -> 'aiming' (كادر المرمى والزوايا الأربع) -> 'celebration' (فرحة اللاعب وانكسار الحارس) -> 'despair' (انكسار اللاعب وفرحة الحارس)
  const [cinematicView, setCinematicView] = useState<'tension' | 'aiming' | 'celebration' | 'despair'>('tension');
  const [activeCommentary, setActiveCommentary] = useState<string>('أنظار الملايين تتجه نحو نقطة الجزاء!');
  const [lastReview, setLastReview] = useState<{
    isGoal: boolean;
    cornerName: string;
    explanation: string;
  } | null>(null);

  const activeStriker = squad[currentRound] || squad[0];
  const currentQ = QUESTIONS[currentRound] || QUESTIONS[0];

  // Start Aiming Phase
  const startAimingPhase = () => {
    audio.playWhistle();
    audio.playCrowdChant();
    setCinematicView('aiming');
  };

  // Toggle or reorder players in squad
  const togglePlayerInSquad = (player: PlayerCard) => {
    const exists = squad.some(p => p.id === player.id);
    if (exists) {
      if (squad.length > 1) {
        setSquad(squad.filter(p => p.id !== player.id));
      }
    } else {
      if (squad.length < 5) {
        setSquad([...squad, player]);
      }
    }
  };

  // Launch Match from Roster or Dashboard
  const startMatch = () => {
    // Pick random opponent team different from selected
    const opponents = WORLD_TEAMS.filter(t => t.id !== selectedTeam.id);
    const opp = opponents[Math.floor(Math.random() * opponents.length)] || WORLD_TEAMS[1];
    setOpponentTeam(opp);

    audio.init();
    audio.startStadiumAmbience();
    audio.playWhistle();
    audio.playCrowdChant();
    setCurrentRound(0);
    setScore({ player: 0, opponent: 0 });
    setRoundsHistory([]);
    setLastReview(null);
    setStage('match');
    setCinematicView('aiming');
  };

  // Handle Shot Result from 3D Simulation
  const handleShotFinishFrom3D = (isGoal: boolean, option: AnswerOption) => {
    if (isGoal) {
      // GOAL! Explosive stadium crowd roar & cheering
      audio.playGoalCheer();
      confetti({
        particleCount: 220,
        spread: 120,
        origin: { y: 0.6 },
        colors: [selectedTeam.primaryColor, '#fbbf24', '#38bdf8', '#ffffff']
      });

      setScore(s => ({ ...s, player: s.player + 1 }));
      setRoundsHistory(h => [...h, 'goal']);
      setCinematicView('celebration');

      setLastReview({
        isGoal: true,
        cornerName: option.cornerName,
        explanation: ''
      });
    } else {
      // MISS / SAVE! Collective stadium crowd gasp & groan
      audio.playDespairGasp();
      setScore(s => ({ ...s, opponent: s.opponent + 1 }));
      setRoundsHistory(h => [...h, 'miss']);
      setCinematicView('despair');

      setLastReview({
        isGoal: false,
        cornerName: option.cornerName,
        explanation: ''
      });
    }
  };

  // Next Round / Final Trophy Ceremony
  const nextRound = () => {
    setLastReview(null);
    if (currentRound + 1 < squad.length && currentRound + 1 < QUESTIONS.length) {
      setCurrentRound(r => r + 1);
      audio.playWhistle();
      audio.playCrowdChant();
      setCinematicView('aiming');
    } else {
      setStage('ceremony');
      audio.playGoalCheer();
      if (score.player > score.opponent) {
        confetti({
          particleCount: 300,
          spread: 140,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#10b981', '#38bdf8', '#ffffff']
        });
        if (onWin) onWin(score.player * 250);
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#020617] text-white select-none overflow-hidden font-sans" dir="rtl">
      
      {/* ========================================================
          STAGE 0: CINEMATIC INTRO WELCOME (FRAMER-MOTION & GRADIENTS)
      ======================================================== */}
      {stage === 'intro' && (
        <CinematicIntro
          onStart={() => setStage('dashboard')}
          onBack={onBack}
          audio={audio}
        />
      )}

      {/* ========================================================
          STAGE 1: CINEMATIC WORLD CLUBS & NATIONS DASHBOARD (EA FC CINEMATIC 12-TEAM GRID)
      ======================================================== */}
      {stage === 'dashboard' && (() => {
        const DASHBOARD_TEAMS_ORDER = [
          'madrid', 'barca', 'city', 'hilal',
          'ahly', 'argentina', 'brazil', 'france',
          'egypt', 'morocco', 'saudi', 'portugal'
        ];
        const orderedTeams = DASHBOARD_TEAMS_ORDER.map(id => WORLD_TEAMS.find(t => t.id === id)).filter(Boolean) as TeamInfo[];

        const getStarPlayer = (t: TeamInfo) => {
          if (t.id === 'madrid') return t.players.find(p => p.id === 'vini_rm') || t.players[0];
          if (t.id === 'barca') return t.players.find(p => p.id === 'yamal_fcb') || t.players[0];
          if (t.id === 'city') return t.players.find(p => p.id === 'haaland_mcfc') || t.players[0];
          if (t.id === 'argentina') return t.players.find(p => p.id === 'messi_arg') || t.players[0];
          if (t.id === 'brazil') return t.players.find(p => p.id === 'vini_br' || p.id === 'neymar_br') || t.players[0];
          if (t.id === 'france') return t.players.find(p => p.id === 'mbappe_fr') || t.players[0];
          if (t.id === 'egypt') return t.players.find(p => p.id === 'salah_egy') || t.players[0];
          if (t.id === 'ahly') return t.players.find(p => p.id === 'emam_ahly') || t.players[0];
          if (t.id === 'hilal') return t.players.find(p => p.id === 'neymar_hilal') || t.players[0];
          if (t.id === 'morocco') return t.players.find(p => p.id === 'diaz_mar' || p.id === 'hakimi_mar') || t.players[0];
          if (t.id === 'saudi') return t.players.find(p => p.id === 'salem_ksa') || t.players[0];
          if (t.id === 'portugal') return t.players.find(p => p.id === 'ronaldo_por') || t.players[0];
          return t.players[0];
        };

        return (
          <div className="relative min-h-screen w-full flex flex-col justify-between p-2 md:p-3 overflow-y-auto select-none font-sans" dir="rtl">
            
            {/* Panoramic Santiago Bernabéu Stadium Background with Atmospheric Night Lighting */}
            <div className="fixed inset-0 z-0 pointer-events-none">
              <img 
                src={stadiumPanorama} 
                alt="Stadium Panorama" 
                className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.20] scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/75 via-[#030d22]/45 to-[#020617]/90" />
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[140px]" />
              <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[140px]" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[220px] bg-gradient-to-t from-[#020617] to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col justify-between flex-1 max-w-[1500px] mx-auto w-full min-h-0">
              
              {/* 1. TOP HEADER BANNER (Pill shaped, NO trophy, centered pure bold white title, NO subtitle, glass button on top-left) */}
              <div className="flex items-center justify-between w-full gap-2 shrink-0">
                {/* Circular Back Button on extreme left */}
                {onBack ? (
                  <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/20 hover:border-cyan-400 flex items-center justify-center text-white backdrop-blur-md shadow-lg transition-all cursor-pointer shrink-0"
                    title="العودة"
                  >
                    <ArrowLeft size={16} />
                  </button>
                ) : (
                  <div className="w-9 h-9 shrink-0" />
                )}

                {/* Dark metallic pill-shaped header banner with centered title */}
                <div className="relative bg-gradient-to-r from-slate-900/95 via-slate-950/98 to-slate-900/95 backdrop-blur-2xl border-2 border-amber-400/40 rounded-full py-2 px-6 flex items-center shadow-[0_10px_35px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.2)] flex-1 max-w-3xl mx-auto h-12">
                  
                  {/* Left: Glass Button "العودة للمنصة" with back arrow */}
                  {onBack && (
                    <button
                      onClick={onBack}
                      dir="ltr"
                      className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-slate-200 hover:text-white hover:border-cyan-400 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md backdrop-blur-md z-20"
                    >
                      <ArrowLeft size={13} />
                      <span>العودة للمنصة</span>
                    </button>
                  )}

                  {/* CENTER: Bold White Arabic Title right in the exact middle (NO trophy, NO subtitle) */}
                  <div className="w-full flex items-center justify-center pointer-events-none">
                    <h1 className="text-xl md:text-2xl font-black text-white drop-shadow-[0_2px_14px_rgba(255,255,255,0.5)] tracking-wide">
                      دوري أبطال الضاد
                    </h1>
                  </div>
                </div>

                {/* Replay Intro button on extreme right */}
                <button
                  onClick={() => setStage('intro')}
                  className="w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/20 hover:border-amber-400 flex items-center justify-center text-amber-300 backdrop-blur-md shadow-lg transition-all cursor-pointer shrink-0"
                  title="مشاهدة العرض السينمائي الترحيبي"
                >
                  <Film size={16} />
                </button>
              </div>

              {/* 2. SUB-HEADER STATUS BAR (Features prominent top play button directly visible after team choice) */}
              <div className="flex flex-wrap items-center justify-between w-full px-2 md:px-4 my-2 text-xs shrink-0 gap-2">
                {/* Left: Selected Team Pill */}
                <div className="bg-slate-950/85 border border-amber-400/50 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black shadow-md flex items-center gap-2 backdrop-blur-md">
                  <span>الفريق المختار:</span>
                  <span className="text-white font-bold text-sm">{selectedTeam.name}</span>
                  <span className="text-base">{selectedTeam.flag}</span>
                </div>

                {/* Center / Right: Direct Top Action Button to Enter Play Screen immediately */}
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-xs text-slate-300 font-medium">جاهز لخوض التحدي؟</span>
                  <button
                    onClick={startMatch}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 text-slate-950 font-black text-xs md:text-sm shadow-[0_0_25px_rgba(16,185,129,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer ring-2 ring-emerald-300 animate-pulse"
                  >
                    <Play size={15} fill="currentColor" />
                    <span>الانتقال لصفحة اللعب • بدء المباراة فوراً ⚽</span>
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>

              {/* 3. MAIN STAGE: LEFT & RIGHT CURVED PANELS + 12-TEAM GRID IN 4x3 (Fully Visible, zero bottom clipping) */}
              <div className="flex items-center justify-center gap-3 w-full my-auto flex-1 min-h-0">
                
                {/* LEFT SHOWCASE WING PANEL: Manchester City Official Crest, 96 rating, stadium "ملعب الاتحاد" */}
                <div className="hidden xl:flex w-44 h-full max-h-[440px] rounded-3xl p-3.5 flex-col items-center justify-between backdrop-blur-2xl bg-gradient-to-b from-slate-900/60 via-slate-950/75 to-slate-900/50 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden transform perspective-[1000px] -rotate-y-6 shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none" />
                  
                  {/* Official Manchester City Crest with 3D Depth */}
                  <div className="flex flex-col items-center w-full mt-1">
                    <TeamCrest teamId="city" size={105} className="drop-shadow-[0_12px_30px_rgba(56,189,248,0.45)]" />
                    <div className="text-xs font-black text-cyan-200 uppercase tracking-wider mt-2">مانشستر سيتي</div>
                  </div>

                  {/* Rating Number 96 with clean bold typography */}
                  <div className="my-auto flex flex-col items-center">
                    <div className="text-5xl font-mono font-black text-cyan-300 drop-shadow-[0_4px_16px_rgba(56,189,248,0.5)]">
                      96
                    </div>
                  </div>

                  {/* Stadium Name in Arabic: ملعب الاتحاد */}
                  <div className="w-full text-center border-t border-white/10 pt-2 pb-1">
                    <div className="text-xs font-black text-slate-200">
                      ملعب الاتحاد
                    </div>
                  </div>
                </div>

                {/* CENTER 12-TEAM GRID: Exactly 12 cards in 4 columns × 3 rows, fully visible without vertical cutoff */}
                <div className="grid grid-cols-4 gap-2.5 flex-1 max-w-4xl h-full max-h-[440px] items-stretch">
                  {orderedTeams.map(team => {
                    const isSelected = selectedTeam.id === team.id;
                    const starPlayer = getStarPlayer(team);
                    // Use Vinicius Jr. for Real Madrid
                    const playerImg = (team.id === 'madrid') 
                      ? viniActionImg 
                      : starPlayer.image;

                    return (
                      <div
                        key={team.id}
                        onClick={() => {
                          if (isSelected) {
                            startMatch();
                          } else {
                            handleSelectTeam(team, false);
                          }
                        }}
                        className={`relative p-2.5 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between text-right cursor-pointer group overflow-hidden backdrop-blur-xl h-[126px] md:h-[134px] ${
                          isSelected 
                            ? 'bg-gradient-to-b from-blue-950/95 via-slate-900/90 to-slate-950/95 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.85)] ring-2 ring-cyan-400/40 z-10 scale-[1.02]' 
                            : 'bg-slate-950/70 hover:bg-slate-900/85 border-white/15 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.01]'
                        }`}
                      >
                        {/* Selected Card Action Photo (Vinícius Jr for Real Madrid) */}
                        {isSelected && playerImg && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                            <img 
                              src={playerImg} 
                              alt={team.name}
                              className="h-[140%] w-auto object-cover object-top opacity-90 filter brightness-110 contrast-110 drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] -translate-y-1 scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20" />
                          </div>
                        )}

                        {/* Card Header: Country + Star Rating on left, Flag on right, Cyan Checkmark if selected */}
                        <div className="relative z-10 flex justify-between items-start">
                          <div className="flex items-center gap-1.5">
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                                <Check size={12} strokeWidth={3.5} />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-300 font-bold">{team.country}</span>
                              <div className="flex items-center gap-0.5 text-amber-400 font-black text-xs">
                                <span>★</span>
                                <span>{team.rating}</span>
                              </div>
                            </div>
                          </div>

                          <span className="text-xl drop-shadow-md group-hover:scale-110 transition-transform">
                            {team.flag}
                          </span>
                        </div>

                        {/* Card Footer: Team Name, Stadium, Quick Action */}
                        <div className="relative z-10">
                          <h3 className="text-sm md:text-base font-black text-white group-hover:text-amber-300 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate">
                            {team.name}
                          </h3>
                          <p className="text-[9px] text-slate-300 font-medium truncate drop-shadow flex items-center gap-1 mt-0.5">
                            <span>🏟️</span>
                            <span>{team.stadium}</span>
                          </p>

                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/10">
                            <span className="text-[9px] text-slate-300 font-bold">
                              5 نجوم
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isSelected) {
                                  startMatch();
                                } else {
                                  handleSelectTeam(team, false);
                                }
                              }}
                              className={`text-[9px] md:text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all px-2.5 py-1 rounded-lg ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-md font-black hover:bg-emerald-300 ring-2 ring-emerald-300 animate-pulse' 
                                  : 'text-slate-300 hover:text-cyan-300 bg-white/5 hover:bg-white/10'
                              }`}
                            >
                              <Play size={10} fill="currentColor" />
                              <span>{isSelected ? 'الانتقال لصفحة اللعب ⚽' : 'اختيار ومتابعة'}</span>
                              <ChevronLeft size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* RIGHT SHOWCASE WING PANEL: Real Madrid Official Crest, 96 rating, stadium "سانتياغو بيرنابيو" */}
                <div className="hidden xl:flex w-44 h-full max-h-[440px] rounded-3xl p-3.5 flex-col items-center justify-between backdrop-blur-2xl bg-gradient-to-b from-slate-900/60 via-slate-950/75 to-slate-900/50 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden transform perspective-[1000px] rotate-y-6 shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none" />
                  
                  {/* Real Madrid Official Photorealistic Crest with 3D Depth */}
                  <div className="flex flex-col items-center w-full mt-1">
                    <TeamCrest teamId="madrid" size={110} className="drop-shadow-[0_12px_30px_rgba(245,158,11,0.5)]" />
                    <div className="text-xs font-black text-amber-200 uppercase tracking-wider mt-2">ريال مدريد</div>
                  </div>

                  {/* Rating Number "96" with clean bold golden typography */}
                  <div className="my-auto flex flex-col items-center">
                    <div className="text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-yellow-100 to-amber-500 drop-shadow-[0_4px_18px_rgba(245,158,11,0.6)]">
                      96
                    </div>
                  </div>

                  {/* Stadium Name in Arabic: سانتياغو بيرنابيو */}
                  <div className="w-full text-center border-t border-white/10 pt-2 pb-1">
                    <div className="text-xs font-black text-white truncate w-full drop-shadow">
                      سانتياغو بيرنابيو
                    </div>
                  </div>
                </div>

              </div>

              {/* 4. BOTTOM ACTION BAR (Sticky Floating, Crystal-clear Play Now button + optional Customize Roster) */}
              <div className="sticky bottom-2 z-40 max-w-4xl mx-auto w-full flex flex-wrap items-center justify-between border-2 border-emerald-400/50 backdrop-blur-2xl bg-slate-950/95 px-4 py-2.5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.95)] my-2 shrink-0 gap-3">
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <span>الملعب المعتمد:</span>
                  <span className="text-amber-300 font-bold">{selectedTeam.stadium}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-emerald-400 font-bold">{selectedTeam.name} جاهز للانطلاق</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setStage('roster')}
                    className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    title="تعديل قائمة المسددين الـ 5"
                  >
                    <Users size={14} className="text-amber-400" />
                    <span>تعديل التشكيلة (5 لاعبين)</span>
                  </button>

                  <button
                    onClick={startMatch}
                    className="px-7 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black text-xs md:text-sm shadow-[0_0_25px_rgba(16,185,129,0.7)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer ring-2 ring-emerald-300/80"
                  >
                    <Play size={16} fill="currentColor" />
                    <span>الانتقال لصفحة اللعب • بدء المباراة فوراً ⚽</span>
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ========================================================
          STAGE 2: SELECT 5 SQUAD PLAYERS FOR CHOSEN TEAM
      ======================================================== */}
      {stage === 'roster' && (
        <div className="relative min-h-screen w-full flex flex-col justify-between p-4 md:p-8 overflow-y-auto">
          
          {/* Panoramic Stadium Background */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <img 
              src={stadiumPanorama} 
              alt="Stadium Panorama" 
              className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.18] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#030d22]/60 to-[#020617]/90" />
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[140px]" />
          </div>

          <div className="relative z-10 flex flex-col justify-between flex-1 max-w-6xl mx-auto w-full">
            {/* Header with prominent Launch Match button right at the top */}
            <div className="flex items-center justify-between border-b border-white/15 pb-4 w-full backdrop-blur-md bg-slate-950/60 p-4 rounded-2xl shadow-lg gap-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl drop-shadow">{selectedTeam.flag}</span>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white">نجوم {selectedTeam.name} • قائمة الـ 5 مسددين</h2>
                  <p className="text-xs text-amber-300 font-bold">
                    تم تحديد 5 مسددين تلقائياً، يمكنك التعديل أو بدء اللعب فوراً
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setStage('dashboard')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-slate-300 hover:text-white hover:border-amber-400 text-xs font-bold transition-all cursor-pointer shadow-md backdrop-blur-md flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>تغيير الفريق</span>
                </button>

                {/* Top prominent Launch Button in Header */}
                <button
                  onClick={startMatch}
                  disabled={squad.length !== 5}
                  className={`px-6 py-2 rounded-xl font-black text-xs md:text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer ${
                    squad.length === 5 
                      ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 text-slate-950 hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(16,185,129,0.7)] ring-2 ring-emerald-300' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Play size={16} fill="currentColor" />
                  <span>الانتقال لصفحة اللعب • بدء المباراة</span>
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>

            {/* Selected 5 Slots Bar */}
            <div className="my-4 max-w-6xl mx-auto w-full bg-slate-950/85 border-2 border-amber-400/50 rounded-3xl p-4 md:p-5 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                  <Award size={15} />
                  <span>قائمة مسددي ركلات الترجيح الخمسة ({squad.length} / 5)</span>
                </span>
                <span className="text-[11px] text-slate-300 font-semibold bg-slate-900/80 px-2.5 py-1 rounded-full border border-white/10">
                  انقر على اللاعب لإضافته أو استبداله
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 md:gap-4">
                {[0, 1, 2, 3, 4].map(idx => {
                  const player = squad[idx];
                  return (
                    <div
                      key={idx}
                      className={`h-26 md:h-32 rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all ${
                        player 
                          ? 'bg-gradient-to-b from-amber-500/25 to-slate-900/90 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]' 
                          : 'border-dashed border-white/20 bg-slate-900/40 text-slate-400'
                      }`}
                    >
                      {player ? (
                        <>
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-amber-300 shadow mb-1 bg-slate-950">
                            <img src={player.image} alt={player.name} className="w-full h-full object-cover object-top" />
                          </div>
                          <div className="text-[11px] md:text-xs font-black text-white truncate max-w-full">{player.name}</div>
                          <div className="text-[9px] text-amber-300 font-bold">الركلة رقم {idx + 1}</div>
                        </>
                      ) : (
                        <span className="text-xs font-bold">شاغر {idx + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Squad Cards Grid */}
            <div className="max-w-6xl mx-auto w-full my-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {selectedTeam.players.map(player => {
                  const isSelected = squad.some(p => p.id === player.id);
                  return (
                    <div
                      key={player.id}
                      onClick={() => togglePlayerInSquad(player)}
                      className={`relative rounded-3xl border-2 p-3 transition-all flex flex-col justify-between cursor-pointer group overflow-hidden backdrop-blur-xl ${
                        isSelected 
                          ? 'bg-gradient-to-b from-amber-950/85 via-slate-900/90 to-slate-950/95 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] scale-[1.02]' 
                          : 'bg-slate-950/75 border-white/20 hover:border-white/50 hover:bg-slate-900/80'
                      }`}
                    >
                      {/* Card Top Pill */}
                      <div className="flex justify-between items-center text-xs font-black mb-1">
                        <span className="text-amber-400">{player.rating} ★</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px]">#{player.number}</span>
                      </div>

                      {/* Player Image */}
                      <div className="h-44 w-full rounded-2xl overflow-hidden my-1 bg-gradient-to-t from-slate-950 to-transparent flex items-center justify-center">
                        <img src={player.image} alt={player.name} className="h-full object-contain group-hover:scale-105 transition-transform" />
                      </div>

                      {/* Card Bottom */}
                      <div>
                        <div className="font-black text-xs md:text-sm text-white truncate">{player.name}</div>
                        <div className="text-[10px] text-cyan-300 font-bold mt-0.5 truncate">{player.role}</div>
                        <div className="text-[9px] text-slate-300 mt-1 truncate">
                          قوة التسديد: {player.shotPower}% • التقويس: {player.curvePower}%
                        </div>
                      </div>

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                          <Check size={14} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sticky Bottom Floating Launch Dock */}
            <div className="sticky bottom-3 max-w-6xl mx-auto w-full flex items-center justify-between border-2 border-emerald-400/50 backdrop-blur-2xl bg-slate-950/95 p-3 md:p-4 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.95)] z-30 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center font-black text-lg">
                  ⚽
                </div>
                <div>
                  <div className="text-sm font-black text-white">التشكيلة مكتملة جاهزة لركلات الترجيح ({squad.length}/5)</div>
                  <div className="text-xs text-amber-300 font-bold">المسدد الأول: {squad[0]?.name || ''}</div>
                </div>
              </div>

              <button
                onClick={startMatch}
                disabled={squad.length !== 5}
                className={`px-8 md:px-12 py-3 rounded-2xl font-black text-sm md:text-base shadow-2xl transition-all flex items-center gap-2.5 cursor-pointer ${
                  squad.length === 5 
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 text-slate-950 hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(16,185,129,0.8)] ring-2 ring-emerald-300' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Play size={20} fill="currentColor" />
                <span>الانتقال لصفحة اللعب • بدء ركلات الترجيح</span>
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STAGE 3: CINEMATIC PENALTY MATCH (Tension / Aim / Reactions)
      ======================================================== */}
      {stage === 'match' && (
        <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden">
          
          {/* Background: Photorealistic Stadium Panorama or Cutscene Asset */}
          <div className="absolute inset-0 z-0">
            <img 
              src={
                cinematicView === 'celebration' ? celebrationImg : 
                cinematicView === 'despair' ? despairImg : 
                cinematicView === 'tension' ? kickerPenaltyFocus : 
                heroStrikeAngle
              } 
              alt="Stadium Scene" 
              className={`w-full h-full object-cover transition-all duration-700 ${
                cinematicView === 'tension' ? 'scale-105 filter brightness-90' : 'scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/80" />
          </div>

          {/* TOP BROADCAST SCOREBUG */}
          <div className="relative z-20 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-auto">
            
            {/* Teams & Score Capsule */}
            <div className="bg-slate-950/90 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-2.5 flex items-center gap-6 shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
              {/* Player Team */}
              <div className="flex items-center gap-2.5">
                <span className="text-3xl drop-shadow">{selectedTeam.flag}</span>
                <div>
                  <div className="text-xs md:text-sm font-black text-white">{selectedTeam.name}</div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase">فريقك المسدد</div>
                </div>
              </div>

              {/* Score Display */}
              <div className="px-5 py-1 rounded-xl bg-slate-900 border border-amber-400/50 font-mono font-black text-3xl text-amber-400 shadow-inner">
                {score.player} - {score.opponent}
              </div>

              {/* Opponent Team */}
              <div className="flex items-center gap-2.5">
                <div>
                  <div className="text-xs md:text-sm font-black text-slate-300 text-left">{opponentTeam.name}</div>
                  <div className="text-[10px] text-cyan-400 font-bold uppercase text-left">حارس المرمى (أوتشوا)</div>
                </div>
                <span className="text-3xl drop-shadow">{opponentTeam.flag}</span>
              </div>
            </div>

            {/* Rounds Indicators & Sound Toggle */}
            <div className="flex items-center gap-3">
              {/* Round History Dots */}
              <div className="bg-slate-950/85 backdrop-blur-md border border-white/15 px-3 py-2 rounded-xl flex items-center gap-2 shadow-md">
                {[0, 1, 2, 3, 4].map(idx => {
                  const res = roundsHistory[idx];
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full transition-all border ${
                        res === 'goal'
                          ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_10px_#34d399]'
                          : res === 'miss'
                          ? 'bg-rose-500 border-rose-400 shadow-[0_0_10px_#f43f5e]'
                          : idx === currentRound
                          ? 'bg-amber-400/50 border-amber-400 animate-pulse'
                          : 'bg-slate-800 border-white/10'
                      }`}
                    />
                  );
                })}
              </div>

              <button
                onClick={() => {
                  const next = !isMuted;
                  setIsMuted(next);
                  audio.setMuted(next);
                }}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-white/20 text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-md"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              <button
                onClick={() => setStage('roster')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-white/20 text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-md"
              >
                <ArrowLeft size={18} />
              </button>
            </div>
          </div>

          {/* ========================================================
              VIEW A: TENSION & PLAYER FOCUS (كادر التوتر والتركيز)
          ======================================================== */}
          {cinematicView === 'tension' && (
            <div className="relative z-10 flex flex-col items-center justify-center my-auto p-4 animate-fade-in text-center">
              
              {/* Active Striker Spotlight Card */}
              <div className="relative max-w-md w-full bg-slate-950/90 border-2 border-amber-400 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.4)] backdrop-blur-xl flex flex-col items-center">
                <div className="absolute -top-6 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs tracking-wider uppercase shadow">
                  الركلة الترجيحية رقم {currentRound + 1} من 5
                </div>

                <div className="w-36 h-36 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl my-3 bg-gradient-to-t from-slate-900 to-transparent">
                  <img src={activeStriker.image} alt={activeStriker.name} className="w-full h-full object-cover object-top" />
                </div>

                <h2 className="text-2xl font-black text-white">{activeStriker.name}</h2>
                <div className="text-xs text-cyan-300 font-bold">{activeStriker.role} • قميص رقم {activeStriker.number}</div>

                {/* Striker Tactical Stats */}
                <div className="w-full bg-slate-900/90 rounded-2xl p-3 border border-amber-400/30 my-4 text-xs text-slate-200">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-white/10">
                      <div className="text-[10px] text-amber-400 font-bold">قوة التسديد</div>
                      <div className="text-sm font-black text-white">{activeStriker.shotPower}%</div>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-white/10">
                      <div className="text-[10px] text-cyan-400 font-bold">التقويس R2</div>
                      <div className="text-sm font-black text-white">{activeStriker.curvePower}%</div>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-white/10">
                      <div className="text-[10px] text-emerald-400 font-bold">دقة الحسم</div>
                      <div className="text-sm font-black text-white">{activeStriker.clutch}%</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startAimingPhase}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-lg shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Eye size={20} />
                  <span>التقدم لنقطة الجزاء والتسديد ➔</span>
                </button>
              </div>

            </div>
          )}

          {/* ========================================================
              VIEW B: FULL 3D INTERACTIVE STADIUM MATCH ENGINE (محرك ركلات الجزاء ثلاثي الأبعاد)
          ======================================================== */}
          {cinematicView === 'aiming' && (
            <div className="relative z-10 flex flex-col flex-1 p-2 md:p-4 max-w-7xl mx-auto w-full animate-fade-in">
              <PenaltyShootout3DCanvas
                striker={activeStriker}
                team={selectedTeam}
                opponentTeam={opponentTeam}
                onShotFinish={handleShotFinishFrom3D}
                audio={audio}
                currentQuestion={currentQ}
                roundIndex={currentRound}
              />
            </div>
          )}

          {/* ========================================================
              VIEW C: CELEBRATION (فرحة الهدف وصوت انفجار المدرجات)
          ======================================================== */}
          {cinematicView === 'celebration' && lastReview && (
            <div className="relative z-10 flex flex-col items-center justify-center my-auto p-4 animate-fade-in text-center">
              <div className="relative max-w-lg w-full bg-slate-950/95 border-2 border-emerald-400 rounded-3xl p-7 shadow-[0_0_60px_rgba(16,185,129,0.5)] backdrop-blur-2xl">
                
                {/* Player celebration thumbnail */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xl bg-slate-900">
                    <img src={activeStriker.image} alt={activeStriker.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-400 uppercase tracking-widest">هدف رائع في الشباك! ⚽</div>
                    <div className="text-xl font-black text-white">{activeStriker.name}</div>
                    <div className="text-[11px] text-slate-300">{activeStriker.celebrationStyle}</div>
                  </div>
                </div>

                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-100 to-emerald-400 mb-2 drop-shadow">
                  GOOOOOAL!
                </h2>

                {/* Match Broadcast Stats Graphic (Clean, Zero explanation boxes) */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="bg-slate-900/90 border border-emerald-400/40 rounded-2xl p-3 text-center">
                    <div className="text-[10px] text-slate-400 font-bold">سرعة التسديدة</div>
                    <div className="text-lg font-black text-amber-300 font-mono">118.5 KM/H</div>
                  </div>
                  <div className="bg-slate-900/90 border border-emerald-400/40 rounded-2xl p-3 text-center">
                    <div className="text-[10px] text-slate-400 font-bold">زاوية الشباك</div>
                    <div className="text-xs font-black text-emerald-300 truncate">{lastReview.cornerName}</div>
                  </div>
                </div>

                <div className="text-xs text-emerald-300 font-bold mb-5 flex items-center justify-center gap-2">
                  <span>🔊</span>
                  <span>هتاف جنوني يهز مدرجات الملعب احتفالاً بالهدف!</span>
                </div>

                <button
                  onClick={nextRound}
                  className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.6)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>متابعة الركلة التالية</span>
                  <ChevronLeft size={20} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW D: DESPAIR (انكسار اللاعب وتصدي الحارس أوتشوا)
          ======================================================== */}
          {cinematicView === 'despair' && lastReview && (
            <div className="relative z-10 flex flex-col items-center justify-center my-auto p-4 animate-fade-in text-center">
              <div className="relative max-w-lg w-full bg-slate-950/95 border-2 border-rose-500 rounded-3xl p-7 shadow-[0_0_60px_rgba(244,63,94,0.5)] backdrop-blur-2xl">
                
                {/* Despair / Keeper celebration thumbnail */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-rose-500 shadow-xl bg-slate-900">
                    <img src={ochoaImg} alt="Ochoa" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-rose-400 uppercase tracking-widest">تألق الحارس وحسرة المسدد! 🧤</div>
                    <div className="text-xl font-black text-white">الحارس {GOALKEEPER_OPPONENT.name}</div>
                    <div className="text-[11px] text-slate-300">أوتشوا يتصدى ببراعة خارقة على خط المرمى</div>
                  </div>
                </div>

                <h2 className="text-3xl font-black text-rose-300 mb-2">
                  تصدى لها الأخطبوط أوتشوا!
                </h2>

                {/* Match Broadcast Stats Graphic (Clean, Zero explanation boxes) */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="bg-slate-900/90 border border-rose-500/40 rounded-2xl p-3 text-center">
                    <div className="text-[10px] text-slate-400 font-bold">نتيجة المحاولة</div>
                    <div className="text-sm font-black text-rose-400">تصدّي بقفازات الحارس 🧤</div>
                  </div>
                  <div className="bg-slate-900/90 border border-rose-500/40 rounded-2xl p-3 text-center">
                    <div className="text-[10px] text-slate-400 font-bold">الزاوية المستهدفة</div>
                    <div className="text-xs font-black text-slate-300 truncate">{lastReview.cornerName}</div>
                  </div>
                </div>

                <div className="text-xs text-rose-300 font-bold mb-5 flex items-center justify-center gap-2">
                  <span>🔊</span>
                  <span>تأوه جماهيري حاشد وصمت يخيم على المدرجات!</span>
                </div>

                <button
                  onClick={nextRound}
                  className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>متابعة الركلة التالية</span>
                  <ChevronLeft size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Bottom Broadcast Stadium Atmosphere Bar */}
          <div className="relative z-20 p-4 flex justify-center pointer-events-none">
            <div className="bg-slate-950/90 border border-amber-400/40 rounded-2xl px-5 py-2 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center gap-3 max-w-xl w-full">
              <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Volume2 size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-amber-400 font-bold">صوت المدرجات الحية:</div>
                <div className="text-xs font-bold text-white truncate">أهازيج وتشجيع جماهير {selectedTeam.name} تملأ أرجاء الملعب 🔊</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          STAGE 4: TROPHY CEREMONY (Full Team Win vs Heartbreak)
      ======================================================== */}
      {stage === 'ceremony' && (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 text-center overflow-y-auto animate-fade-in">
          
          {/* Background image: Full team celebration or heartbreak */}
          <div className="absolute inset-0 z-0">
            <img 
              src={score.player > score.opponent ? trophyCelebrationTeam : teamHeartbreakDefeat} 
              alt="Podium Ceremony" 
              className="w-full h-full object-cover filter brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/80" />
          </div>

          <div className="relative z-10 max-w-xl w-full bg-slate-950/90 border-2 border-amber-400/80 rounded-3xl p-8 shadow-[0_0_80px_rgba(245,158,11,0.5)] backdrop-blur-2xl flex flex-col items-center">
            
            {/* Animated Trophy or Heartbreak Icon */}
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-slate-950 mb-4 ${
              score.player > score.opponent 
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-[0_0_40px_#f59e0b] animate-bounce' 
                : 'bg-gradient-to-tr from-slate-700 to-slate-500 shadow-[0_0_30px_#475569]'
            }`}>
              <Trophy size={48} />
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-white mb-2">
              {score.player > score.opponent ? `أبطال كأس الضّاد 2026! 🏆` : "نهاية المشوار البطولي!"}
            </h2>

            <p className="text-sm text-slate-300 font-semibold mb-6">
              {score.player > score.opponent 
                ? `قاد نجومك الخمسة فريق ${selectedTeam.name} للتتويج باللقب العالمي ورفع الكأس الغالية وسط الألعاب النارية!`
                : `مباراة تاريخية وندية أمام ${opponentTeam.name}، اكتسب خلالها الفريق رصيداً لغوياً غنياً وفرصة للعودة أقوى!`}
            </p>

            {/* Scorecard */}
            <div className="w-full bg-slate-900/90 rounded-2xl p-4 border border-amber-500/20 flex items-center justify-around mb-6">
              <div>
                <div className="text-xs text-slate-400 font-bold">{selectedTeam.name}</div>
                <div className="text-3xl font-black text-emerald-400">{score.player}</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-xs text-slate-400 font-bold">{opponentTeam.name}</div>
                <div className="text-3xl font-black text-rose-400">{score.opponent}</div>
              </div>
            </div>

            {/* 5 Squad Stars Strip */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {squad.map(p => (
                <div key={p.id} className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300 shadow bg-slate-950">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover object-top" />
                </div>
              ))}
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setStage('roster')}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
              >
                <RotateCcw size={18} />
                <span>إعادة النهائي مع نفس الفريق</span>
              </button>

              <button
                onClick={() => setStage('dashboard')}
                className="px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-white/20 transition-all cursor-pointer text-base"
              >
                اختيار فريق آخر
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
