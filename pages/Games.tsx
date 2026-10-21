import React from 'react';
import { 
  Gamepad2, Trophy, Star, RefreshCcw, 
  ArrowRight, ArrowLeft, CheckCircle2, XCircle, 
  Sparkles, Brain, Zap, Target,
  Volume2, MousePointer2, LayoutList, Type as TypeIcon,
  CheckCircle, Timer, Award, Lock, 
  Flame, Ghost, Search, BookOpen, Music, 
  Image as ImageIcon, Puzzle, Rocket, Globe,
  Heart, Zap as ZapIcon, Shield, Coins, ShoppingCart,
  Check, X, HelpCircle, Dice5, Loader2, Train
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { generateSpeech, decodeAudioData } from '../services/gemini';
import { SentenceTrain } from '../components/games/SentenceTrain';
import { SnakesAndLadders } from '../components/games/SnakesAndLadders';
import { VocabRace } from '../components/games/VocabRace';
import { ArabicAngler } from '../components/games/ArabicAngler';
import { WordHunt } from '../components/games/WordHunt';
import { GrammarHero } from '../components/games/GrammarHero';
import { SyntaxSoccer } from '../components/games/SyntaxSoccer';
import { ChessPro } from '../components/games/ChessPro';
import { CandyQuest } from '../components/games/CandyQuest';
import { PenaltyShootout } from '../components/games/PenaltyShootout';
import { MemoryMatch } from '../components/games/MemoryMatch';
import { ArabicSpaceJourney } from '../components/games/ArabicSpaceJourney';
import { KnowledgeSupermarket } from '../components/games/KnowledgeSupermarket';
import { DetectiveMystery } from '../components/games/DetectiveMystery';
import supermarketParkingImg from '../assets/images/supermarket_parking_intro_1791186344934.jpg';
import vibrantSpaceNebula from '../assets/images/vibrant_cinematic_space_nebula_1790179537071.jpg';
import { useAuth } from '../components/AuthProvider';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { Vocabulary } from '../types';

// --- Types ---

const SnakeLadderIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4V20M18 4V20M6 8H18M6 12H18M6 16H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 18C14 18 16 16 16 14C16 12 12 12 12 10C12 8 14 6 14 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

interface GameDef {
  id: string;
  category: string;
  categoryAr: string;
  categoryEn: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  detailsAr: string;
  detailsEn: string;
  samples: { ar: string, en: string }[];
  cover: string;
  hero: string;
  color: string;
  icon: React.ReactNode;
  locked?: boolean;
}

// --- Enhanced Game Data ---
const CONSOLE_GAMES: GameDef[] = [
    { 
    id: 'detective-mystery', 
    category: 'detective',
    categoryAr: 'ألغاز المحقق',
    categoryEn: 'Detective Mystery',
    titleAr: 'من الجاني؟', 
    titleEn: 'Who is the Culprit?',
    descriptionAr: 'لعبة استنتاج بوليسية شيقة؛ استمع للأدلة، افحص ملامح المشتبه بهم وألوانهم، وفرز الأبرياء والمذنبين!',
    descriptionEn: 'An exciting detective mystery deduction game: match clues with suspect facial features and colors to solve cases!',
    detailsAr: 'حل قضايا غامضة سريعة قائمة على المنطق والاستنتاج؛ طابق أدلة الجريمة (ألوان الملابس، أغطية الرأس، العيون، الشارب، النظارات) وافرز المشتبه بهم بين بريء ومذنب!',
    detailsEn: 'Solve logical mystery cases; match crime clues (clothing colors, hats, eyes, mustache, glasses) and sort suspects into innocent and guilty!',
    samples: [],
    cover: '/١.webp',
    hero: '/١.webp',
    color: 'from-amber-700 via-orange-800 to-slate-950',
    icon: <Search size={32} />
  },
{ 
    id: 'knowledge-supermarket', 
    category: 'supermarket',
    categoryAr: 'دكان المعرفة',
    categoryEn: 'Knowledge Store',
    titleAr: 'دكان المعرفة', 
    titleEn: 'Knowledge Supermarket',
    descriptionAr: 'تجربة تسوق سينمائية تفاعلية؛ قُد سيارتك للسوبر ماركت، افرز الكلمات في رفوف الأسماء والأفعال والحروف، واستلم فاتورتك من الكاشير!',
    descriptionEn: 'A cinematic interactive supermarket shopping experience: sort Arabic words onto shelves and get your itemized grocery receipt at checkout!',
    detailsAr: '4 مشاهد سينمائية كاملة: إنترو وصول السيارة ومواقف السوبر ماركت، صالة التجول بين الأقسام، شاشة الرفوف الخشبية الملونة وعربة التسوق، ومرحلة كاونتر الكاشير ومسح الباركود بالليزر وطباعة الفاتورة الذهبية!',
    detailsEn: '4 full cinematic scenes: car parking arrival, supermarket aisle tour, interactive wooden grocery shelves with shopping cart, and cashier checkout with laser barcode scanner and receipt printout!',
