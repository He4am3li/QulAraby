import React from 'react';
import { PREVIEWS_A } from '../data/dialectImagePreviewsA';
import { PREVIEWS_B } from '../data/dialectImagePreviewsB';
const DIALECT_IMAGE_PREVIEWS = { ...PREVIEWS_A, ...PREVIEWS_B };
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { 
  Globe, MessageSquare, ChevronRight, ChevronLeft, 
  Volume2, Info, ArrowRight, ArrowLeft, Sparkles, Map as MapIcon,
  Gamepad2, Trophy, Star, Mic, MicOff, Play, Square, Loader2,
  MessageCircle, Send, Plane
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { Interactive3DTutor } from '../components/Interactive3DTutor';
import { DialectReferencePanel } from '../components/DialectReferencePanel';

import { DialectChatDock } from '../components/DialectChatDock';
import { DialectVoiceHalo } from '../components/DialectVoiceHalo';
import { DialectPassportCover, DialectPassportLibrary } from '../components/DialectPassports';
import { assessDialectMission, type MissionTurn } from '../services/dialectMissionAssessment';
import { getAI, getLiveAI, generateSpeech, decodeAudioData } from '../services/gemini';
import { SpeechLipSync, analyzeSpeechBuffer, startLipSyncedSource } from '../services/speechLipSync.mjs';
import { getTutorStageDirection, getTutorPartnerDirection } from '../services/tutorAttention.mjs';
import { buildDialectTutorPolicy, inferLearnerLanguage } from '../services/dialectTutorPolicy';
import { publishedVoice, useDialectVoiceProfiles } from '../services/dialectVoiceProfiles';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// --- Country Journey Data (v4 - Verified Strategic Landmarks) ---
export const COUNTRY_DATA = [
  {
    id: 'uae',
    nameAr: 'الإمارات',
    nameEn: 'UAE',
    flag: '🇦🇪',
    image: "/images/dialects/local/uae.jpg",
    dialect: 'Gulf (خليجي)',
    characterMale: { 
      nameAr: 'زايد', 
      nameEn: 'Zayed', 
      clothingAr: 'الكندورة الإماراتية مع الغترة والعقال.', 
      clothingEn: 'Emirati Kandura with Ghutra and Agal.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20UAE%20wearing%20traditional%20white%20Kandura%20and%20Ghutra%20with%20Agal%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'ميثاء', 
      nameEn: 'Maitha', 
      clothingAr: 'العباية الإماراتية التقليدية مع الشيلة المطرزة.', 
      clothingEn: 'Traditional Emirati Abaya with embroidered Sheila.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20UAE%20wearing%20traditional%20black%20Abaya%20with%20gold%20embroidery%20and%20Sheila%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "خطواتك الأولى في دبي: تبادل التحايا الدافئة مع السكان واكتشف طريقك إلى برج خليفة الشاهق.", en: "Your first steps in Dubai: Exchange warm greetings with locals and find your way to the towering Burj Khalifa." },
      resident: { ar: "كرم الضيافة: انضم إلى مجلس إماراتي، واطلب القهوة العربية والتمر بأسلوب لبق.", en: "Hospitality: Join an Emirati Majlis, and order Arabic coffee and dates with etiquette." },
      native: { ar: "مغامرة الصحراء: خطط لرحلة سفاري مثيرة وتفاوض بذكاء على السعر كابن للبلد.", en: "Desert Adventure: Plan an exciting safari trip and negotiate the price smartly like a local." }
    },
    culture: {
      factAr: 'برج خليفة في دبي هو أطول بناء في العالم.',
      factEn: 'Burj Khalifa in Dubai is the tallest building in the world.',
      items: [
        { nameAr: 'القهوة العربية', nameEn: 'Arabic Coffee', icon: '☕', descAr: 'رمز الكرم والضيافة الإماراتية الأصيلة.', descEn: 'A symbol of authentic Emirati generosity and hospitality.' },
        { nameAr: 'الصيد بالصقور', nameEn: 'Falconry', icon: '🦅', descAr: 'رياضة تراثية عريقة تعبر عن القوة والذكاء.', descEn: 'An ancient heritage sport expressing strength and intelligence.' },
        { nameAr: 'اللؤلؤ', nameEn: 'Pearls', icon: '💎', descAr: 'كان الركيزة الأساسية للاقتصاد قبل اكتشاف النفط.', descEn: 'The main economic pillar before the discovery of oil.' },
        { nameAr: 'المجلس', nameEn: 'Majlis', icon: '🛋️', descAr: 'مكان لتجمع الأهل والأصدقاء وتبادل الأحاديث.', descEn: 'A place for family and friends to gather and converse.' },
        { nameAr: 'التمور', nameEn: 'Dates', icon: '🌴', descAr: 'جزء أساسي من المائدة والضيافة في الإمارات.', descEn: 'An essential part of the table and hospitality in the UAE.' },
        { nameAr: 'العود', nameEn: 'Oud', icon: '🪵', descAr: 'بخور عطري فاخر يستخدم في المناسبات الخاصة.', descEn: 'A luxury aromatic incense used on special occasions.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'علومك؟', roman: 'Uloomak?', en: 'How are you?' },
      { fusha: 'كثيراً', dialect: 'وايد', roman: 'Wayed', en: 'A lot' },
      { fusha: 'ماذا تريد؟', dialect: 'شو تبي؟', roman: 'Sho tabi?', en: 'What do you want?' },
      { fusha: 'الآن', dialect: 'الحين', roman: 'Al-heen', en: 'Now' },
      { fusha: 'جميل', dialect: 'حلو / زين', roman: 'Helou / Zein', en: 'Beautiful / Good' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'انظر', dialect: 'طالع', roman: 'Talae', en: 'Look' },
      { fusha: 'تعال', dialect: 'تعال', roman: 'Ta\'al', en: 'Come' },
      { fusha: 'اذهب', dialect: 'روح', roman: 'Rouh', en: 'Go' },
      { fusha: 'بسرعة', dialect: 'بسرعة', roman: 'B-sur\'a', en: 'Fast' }
    ],
    dialogue: {
      title: 'الترحيب بالضيف',
      lines: [
        { role: 'Host', ar: 'أهلاً وسهلاً، تفضل استرح.', dialect: 'يا هلا ومسهلا، تفضل استريح.', en: 'Welcome, please have a seat.' },
        { role: 'Guest', ar: 'شكراً لك، جزاك الله خيراً.', dialect: 'مشكور، ما قصرت.', en: 'Thank you, you are very kind.' }
      ]
    }
  },
  {
    id: 'egypt',
    nameAr: 'مصر',
    nameEn: 'Egypt',
    flag: '🇪🇬',
    image: "/images/dialects/local/egypt.jpg",
    dialect: 'Egyptian (مصري)',
    characterMale: { 
      nameAr: 'أحمد', 
      nameEn: 'Ahmed', 
      clothingAr: 'الزي المصري القديم (فرعوني) كامل.', 
      clothingEn: 'Full Ancient Egyptian (Pharaonic) traditional attire.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Egypt%20wearing%20traditional%20Pharaonic%20attire%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'فاطمة', 
      nameEn: 'Fatima', 
      clothingAr: 'الزي المصري القديم (فرعوني) كامل للملكات.', 
      clothingEn: 'Full Ancient Egyptian (Pharaonic) queen attire.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Egypt%20wearing%20traditional%20Pharaonic%20queen%20attire%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "أهلاً بك في المحروسة: تعلم كيف ترحب بالناس بابتسامة مصرية واكتشف عظمة الأهرامات.", en: "Welcome to Egypt: Learn how to greet people with an Egyptian smile and discover the Pyramids' greatness." },
      resident: { ar: "مذاق القاهرة: توجه إلى مطعم شعبي واطلب طبق كشري أصيل بلهجة واثقة.", en: "Cairo's Taste: Head to a local restaurant and order an authentic Koshary dish with confidence." },
      native: { ar: "فن الفصال: انغمس في زحام خان الخليلي، وفاوض البائع بذكاء للحصول على أفضل سعر للتحف.", en: "The Art of Haggling: Immerse yourself in Khan el-Khalili, and negotiate smartly for the best price on souvenirs." }
    },
    culture: {
      factAr: 'الأهرامات هي العجيبة الوحيدة الباقية من عجائب الدنيا السبع القديمة.',
      factEn: 'The Pyramids are the only remaining wonder of the ancient world.',
      items: [
        { nameAr: 'الكشري', nameEn: 'Koshary', icon: '🥣', descAr: 'الأكلة الشعبية الأكثر شهرة في مصر وتتكون من الأرز والعدس والمعكرونة.', descEn: 'The most famous popular dish in Egypt, consisting of rice, lentils, and pasta.' },
        { nameAr: 'الفانوس', nameEn: 'Fanous', icon: '🏮', descAr: 'رمز تقليدي للاحتفال بشهر رمضان المبارك في مصر.', descEn: 'A traditional symbol for celebrating the holy month of Ramadan in Egypt.' },
        { nameAr: 'النيل', nameEn: 'The Nile', icon: '⛵', descAr: 'شريان الحياة في مصر وأطول نهر في العالم.', descEn: 'The lifeline of Egypt and the longest river in the world.' },
        { nameAr: 'الأهرامات', nameEn: 'Pyramids', icon: '📐', descAr: 'بناها الفراعنة كقبور ملكية وتعتبر إعجازاً هندسياً.', descEn: 'Built by Pharaohs as royal tombs and considered an engineering marvel.' },
        { nameAr: 'البردي', nameEn: 'Papyrus', icon: '📜', descAr: 'أول ورق في التاريخ ابتكره المصريون القدماء.', descEn: 'The first paper in history invented by the Ancient Egyptians.' },
        { nameAr: 'الفلوكة', nameEn: 'Felucca', icon: '🛶', descAr: 'مركب شراعي تقليدي يبحر في مياه النيل.', descEn: 'A traditional sailing boat that sails in the Nile waters.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'إزيك؟', roman: 'Ezayyak?', en: 'How are you?' },
      { fusha: 'الآن', dialect: 'دلوقتي', roman: 'Delwa\'ti', en: 'Now' },
      { fusha: 'جيد جداً', dialect: 'كويس قوي', roman: 'Kwayyes awi', en: 'Very good' },
      { fusha: 'ماذا؟', dialect: 'إيه؟', roman: 'Eih?', en: 'What?' },
      { fusha: 'لماذا؟', dialect: 'ليه؟', roman: 'Leih?', en: 'Why?' },
      { fusha: 'هنا', dialect: 'هنا / هناهو', roman: 'Hena / Henaho', en: 'Here' },
      { fusha: 'هناك', dialect: 'هناك', roman: 'Honak', en: 'There' },
      { fusha: 'بسرعة', dialect: 'قوام / بسرعة', roman: 'Awam / B-sur\'a', en: 'Fast' },
      { fusha: 'ببطء', dialect: 'براحة', roman: 'B-raha', en: 'Slowly' },
      { fusha: 'كثيراً', dialect: 'كتير', roman: 'Kteer', en: 'A lot' }
    ],
    dialogue: {
      title: 'في السوق',
      lines: [
        { role: 'Buyer', ar: 'بكم هذا القميص؟', dialect: 'بكام القميص ده يا باشا؟', en: 'How much is this shirt?' },
        { role: 'Seller', ar: 'ثمنه مائة جنيه.', dialect: 'ده بمية جنيه بس عشان خاطرك.', en: 'It is 100 pounds, just for you.' }
      ]
    }
  },
  {
    id: 'saudi',
    nameAr: 'السعودية',
    nameEn: 'Saudi Arabia',
    flag: '🇸🇦',
    image: '/images/dialects/saudi-kaaba.avif',
    dialect: 'Saudi (سعودي)',
    characterMale: { 
      nameAr: 'سلمان', 
      nameEn: 'Salman', 
      clothingAr: 'الثوب السعودي مع الغترة الحمراء والبشت.', 
      clothingEn: 'Saudi Thobe with red Ghutra and Bisht.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Saudi%20Arabia%20wearing%20traditional%20white%20Thobe%20and%20red%20Ghutra%20with%20Bisht%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'سارة', 
      nameEn: 'Sara', 
      clothingAr: 'العباية النجدية التقليدية المطرزة بالذهب.', 
      clothingEn: 'Traditional Najdi Abaya with gold embroidery.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Saudi%20Arabia%20wearing%20traditional%20elegant%20black%20Abaya%20with%20gold%20patterns%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "ضيافة نجد: ابدأ رحلتك بتبادل التحايا السعودية الأصيلة وتعرف على شموخ قصر المصمك.", en: "Najd Hospitality: Start your journey by exchanging authentic Saudi greetings and discover the majesty of Al Masmak Palace." },
      resident: { ar: "مذاق الكبسة: انضم إلى مائدة سعودية واطلب طبق الكبسة معبراً عن امتنانك بلهجة محلية.", en: "Taste of Kabsa: Join a Saudi table and order Kabsa, expressing your gratitude in the local dialect." },
      native: { ar: "فراسة الصحراء: انطلق في رحلة إلى العلا، وناقش تاريخ مدائن صالح بلهجة نجدية فصيحة وقوية.", en: "Desert Insight: Embark on a trip to AlUla, and discuss the history of Madain Saleh with a fluent and strong dialect." }
    },
    culture: {
      factAr: 'تعتبر الكعبة المشرفة في مكة المكرمة قبلة المسلمين ومركز العالم الإسلامي.',
      factEn: 'The Holy Kaaba in Mecca is the direction of prayer for Muslims and the center of the Islamic world.',
      items: [
        { nameAr: 'الكبسة', nameEn: 'Kabsa', icon: '🍛', descAr: 'الوجبة الوطنية السعودية المكونة من الأرز واللحم والتوابل.', descEn: 'The Saudi national meal consisting of rice, meat, and spices.' },
        { nameAr: 'النخيل', nameEn: 'Palm Trees', icon: '🌴', descAr: 'رمز النماء والبركة وتنتج أجود أنواع التمور.', descEn: 'A symbol of growth and blessing, producing the finest types of dates.' },
        { nameAr: 'البخور', nameEn: 'Bakhoor', icon: '💨', descAr: 'يستخدم لتعطير المناسبات والمساجد كجزء من التقاليد.', descEn: 'Used to scent occasions and mosques as part of traditions.' },
        { nameAr: 'الدلة', nameEn: 'Dallah', icon: '☕', descAr: 'وعاء تقليدي لتقديم القهوة السعودية الأصيلة.', descEn: 'A traditional pot for serving authentic Saudi coffee.' },
        { nameAr: 'الإبل', nameEn: 'Camels', icon: '🐪', descAr: 'سفينة الصحراء ورفيقة العربي منذ القدم.', descEn: 'The ship of the desert and the Arab\'s companion since ancient times.' },
        { nameAr: 'العلا', nameEn: 'AlUla', icon: '🏜️', descAr: 'موقع تاريخي يضم آثار مدائن صالح المذهلة.', descEn: 'A historical site featuring the stunning ruins of Madain Saleh.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'وش أخبارك؟', roman: 'Wish akhbarak?', en: 'How are you?' },
      { fusha: 'نعم', dialect: 'إيه / سمّ', roman: 'Ee / Samm', en: 'Yes' },
      { fusha: 'ماذا تفعل؟', dialect: 'وش تسوي؟', roman: 'Wish tsawwi?', en: 'What are you doing?' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'الآن', dialect: 'الحين', roman: 'Al-heen', en: 'Now' },
      { fusha: 'كثيراً', dialect: 'مرة / حيل', roman: 'Marra / Heil', en: 'A lot' },
      { fusha: 'جميل', dialect: 'زين / كشخة', roman: 'Zein / Kashkha', en: 'Beautiful / Elegant' },
      { fusha: 'تعال', dialect: 'تعال', roman: 'Ta\'al', en: 'Come' },
      { fusha: 'اذهب', dialect: 'روح', roman: 'Rouh', en: 'Go' },
      { fusha: 'بسرعة', dialect: 'بسرعة / عجل', roman: 'B-sur\'a / Ajjil', en: 'Fast' }
    ],
    dialogue: {
      title: 'كرم الضيافة',
      lines: [
        { role: 'Host', ar: 'تفضل القهوة يا أخي.', dialect: 'تفضل القهوة يا بعد حيي.', en: 'Please have some coffee, brother.' },
        { role: 'Guest', ar: 'شكراً، قهوة دائمة إن شاء الله.', dialect: 'تسلم، عساها دايمة.', en: 'Thanks, may it always be generous.' }
      ]
    }
  },
  {
    id: 'morocco',
    nameAr: 'المغرب',
    nameEn: 'Morocco',
    flag: '🇲🇦',
    image: "/images/dialects/local/morocco.jpg",
    dialect: 'Moroccan (مغربي)',
    characterMale: { 
      nameAr: 'ياسين', 
      nameEn: 'Yassine', 
      clothingAr: 'الجلابة المغربية مع الطربوش الفاسي.', 
      clothingEn: 'Moroccan Djellaba with Fez hat.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Morocco%20wearing%20traditional%20Djellaba%20and%20red%20Fez%20hat%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'كنزة', 
      nameEn: 'Kenza', 
      clothingAr: 'القفطان المغربي (التكشيطة) الفاخر.', 
      clothingEn: 'Luxury Moroccan Kaftan (Takchita).',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Morocco%20wearing%20traditional%20colorful%20Kaftan%20Takchita%20with%20belt%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "سحر مراكش: تعلم كيف ترحب بالناس بلهجة مغربية دافئة واكتشف جمال ساحة جامع الفنا.", en: "Marrakech Magic: Learn how to greet people with a warm Moroccan dialect and discover the beauty of Jemaa el-Fnaa." },
      resident: { ar: "مذاق الطاجين: توجه إلى مطعم تقليدي واطلب طاجين مغربي أصيل بلهجة واثقة.", en: "Taste of Tagine: Head to a traditional restaurant and order an authentic Moroccan Tagine with confidence." },
      native: { ar: "فن الفصال: انغمس في زحام أسواق مراكش، وفاوض البائع بذكاء للحصول على خصم 20% على التوابل.", en: "The Art of Haggling: Immerse yourself in the bustle of Marrakech markets, and negotiate smartly for a 20% discount on spices." }
    },
    culture: {
      factAr: 'جامع القرويين في المغرب هو أقدم جامعة في العالم لا تزال تعمل.',
      factEn: 'Al-Qarawiyyin Mosque in Morocco is the oldest continuously operating university in the world.',
      items: [
        { nameAr: 'الطاجين', nameEn: 'Tagine', icon: '🥘', descAr: 'إناء فخاري تقليدي يطهى فيه الطعام ببطء.', descEn: 'A traditional clay pot in which food is cooked slowly.' },
        { nameAr: 'الشاي بالنعناع', nameEn: 'Mint Tea', icon: '🍵', descAr: 'يسمى "أتاي" وهو رمز للترحيب والضيافة المغربية.', descEn: 'Called "Atay," it is a symbol of Moroccan welcome and hospitality.' },
        { nameAr: 'الزليج', nameEn: 'Zellige', icon: '🧱', descAr: 'فن الفسيفساء المغربي التقليدي الملون.', descEn: 'Traditional Moroccan colorful mosaic art.' },
        { nameAr: 'القفطان', nameEn: 'Kaftan', icon: '👗', descAr: 'زي تقليدي مغربي فاخر يلبس في المناسبات.', descEn: 'A luxury traditional Moroccan attire worn on occasions.' },
        { nameAr: 'زيت الأركان', nameEn: 'Argan Oil', icon: '🧴', descAr: 'زيت نادر يستخرج من شجر الأركان الموجود فقط في المغرب.', descEn: 'A rare oil extracted from Argan trees found only in Morocco.' },
        { nameAr: 'الحمام', nameEn: 'Hammam', icon: '🧖', descAr: 'جزء أساسي من الثقافة المغربية للاسترخاء والتنظيف.', descEn: 'An essential part of Moroccan culture for relaxation and cleansing.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'لاباس؟', roman: 'Labas?', en: 'How are you?' },
      { fusha: 'كثيراً', dialect: 'بزّاف', roman: 'Bezzaf', en: 'A lot' },
      { fusha: 'جميل', dialect: 'غزال', roman: 'Ghazal', en: 'Beautiful' },
      { fusha: 'الآن', dialect: 'دابا', roman: 'Daba', en: 'Now' },
      { fusha: 'ماذا؟', dialect: 'شنو؟', roman: 'Shno?', en: 'What?' },
      { fusha: 'أين؟', dialect: 'فين؟', roman: 'Fein?', en: 'Where?' },
      { fusha: 'نعم', dialect: 'آه / إيه', roman: 'Ah / Iyeh', en: 'Yes' },
      { fusha: 'لا', dialect: 'لا / لا والو', roman: 'La / La walou', en: 'No' },
      { fusha: 'بسرعة', dialect: 'دغيا', roman: 'Deghya', en: 'Fast' },
      { fusha: 'جيد', dialect: 'مزيان', roman: 'Mezyan', en: 'Good' }
    ],
    dialogue: {
      title: 'السؤال عن الطريق',
      lines: [
        { role: 'Tourist', ar: 'أين ساحة جامع الفناء؟', dialect: 'فين جات ساحة جامع الفنا عفاك؟', en: 'Where is Jemaa el-Fnaa square please?' },
        { role: 'Local', ar: 'اذهب مباشرة ثم يساراً.', dialect: 'سير نيشان ومن بعد دور على ليسر.', en: 'Go straight then turn left.' }
      ]
    }
  },
  {
    id: 'jordan',
    nameAr: 'الأردن',
    nameEn: 'Jordan',
    flag: '🇯🇴',
    image: '/images/dialects/local/jordan.jpg',
    dialect: 'Jordanian (أردني)',
    characterMale: { 
      nameAr: 'نشمي', 
      nameEn: 'Nashmi', 
      clothingAr: 'الثوب الأردني مع الشماغ الأحمر المهدب.', 
      clothingEn: 'Jordanian Thobe with fringed red Shemagh.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Jordan%20wearing%20traditional%20Thobe%20and%20red%20Shemagh%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'هيا', 
      nameEn: 'Haya', 
      clothingAr: 'الثوب الأردني التقليدي المطرز يدوياً.', 
      clothingEn: 'Hand-embroidered traditional Jordanian dress.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Jordan%20wearing%20traditional%20black%20embroidered%20dress%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "عبق التاريخ: ابدأ رحلتك بتبادل التحايا الأردنية الودودة واكتشف عظمة مدينة البتراء الوردية.", en: "Scent of History: Start your journey by exchanging friendly Jordanian greetings and discover the greatness of the Rose City, Petra." },
      resident: { ar: "وليمة المنسف: انضم إلى مائدة أردنية واطلب طبق المنسف الأصيل معبراً عن تقديرك بلهجة محلية.", en: "Mansaf Feast: Join a Jordanian table and order an authentic Mansaf dish, expressing your appreciation in the local dialect." },
      native: { ar: "حكايات البادية: انطلق في رحلة إلى وادي رم، وناقش تاريخ الأنباط بلهجة بدوية أصيلة.", en: "Tales of the Badia: Embark on a trip to Wadi Rum, and discuss the history of the Nabataeans with an authentic Bedouin dialect." }
    },
    culture: {
      factAr: 'مدينة البتراء الوردية هي إحدى عجائب الدنيا السبع الجديدة.',
      factEn: 'The rose-red city of Petra is one of the new seven wonders.',
      items: [
        { nameAr: 'المنسف', nameEn: 'Mansaf', icon: '🍚', descAr: 'الأكلة الوطنية الأردنية المكونة من اللحم والجميد والأرز.', descEn: 'The Jordanian national dish consisting of meat, Jameed, and rice.' },
        { nameAr: 'البحر الميت', nameEn: 'Dead Sea', icon: '🌊', descAr: 'أخفض نقطة على سطح الأرض وتتميز بمياهها المالحة العلاجية.', descEn: 'The lowest point on Earth, characterized by its therapeutic salty waters.' },
        { nameAr: 'الشماغ', nameEn: 'Shemagh', icon: '🧣', descAr: 'غطاء الرأس التقليدي باللونين الأحمر والأبيض.', descEn: 'The traditional red and white headcover.' },
        { nameAr: 'البتراء', nameEn: 'Petra', icon: '🏛️', descAr: 'المدينة الوردية المنحوتة في الصخر من قبل الأنباط.', descEn: 'The rose city carved in rock by the Nabataeans.' },
        { nameAr: 'المدرج الروماني', nameEn: 'Roman Theater', icon: '🏟️', descAr: 'معلم تاريخي في قلب العاصمة عمان يعود للعصر الروماني.', descEn: 'A historical landmark in the heart of Amman dating back to the Roman era.' },
        { nameAr: 'المقلوبة', nameEn: 'Maqluba', icon: '🥘', descAr: 'أكلة شعبية شهيرة تقلب عند تقديمها.', descEn: 'A famous popular dish that is flipped when served.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'شو أخبارك؟', roman: 'Sho akhbarak?', en: 'How are you?' },
      { fusha: 'شكراً', dialect: 'يسلمو', roman: 'Yislamo', en: 'Thank you' },
      { fusha: 'حسناً', dialect: 'ماشي', roman: 'Mashi', en: 'Okay' },
      { fusha: 'الآن', dialect: 'هسا', roman: 'Hassa', en: 'Now' },
      { fusha: 'ماذا؟', dialect: 'شو؟', roman: 'Sho?', en: 'What?' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'هنا', dialect: 'هون', roman: 'Hon', en: 'Here' },
      { fusha: 'كثيراً', dialect: 'كتير', roman: 'Kteer', en: 'A lot' },
      { fusha: 'بسرعة', dialect: 'بسرعة / قوام', roman: 'B-sur\'a / Awam', en: 'Fast' },
      { fusha: 'جميل', dialect: 'حلو / بجنن', roman: 'Helou / Bijannin', en: 'Beautiful' }
    ],
    dialogue: {
      title: 'لقاء صديق',
      lines: [
        { role: 'Friend A', ar: 'كيف حالك يا صديقي؟', dialect: 'كيفك يا غالي؟ شو الأخبار؟', en: 'How are you my dear friend?' },
        { role: 'Friend B', ar: 'بخير والحمد لله.', dialect: 'تمام التمام، الحمد لله.', en: 'Great, thank God.' }
      ]
    }
  },
  {
    id: 'lebanon',
    nameAr: 'لبنان',
    nameEn: 'Lebanon',
    flag: '🇱🇧',
    image: "/images/dialects/local/lebanon.jpg",
    dialect: 'Levantine (لبناني)',
    characterMale: { 
      nameAr: 'جاد', 
      nameEn: 'Jad', 
      clothingAr: 'الشروال اللبناني مع اللبادة.', 
      clothingEn: 'Lebanese Shirwal with Labadeh hat.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Lebanon%20wearing%20traditional%20Shirwal%20and%20Labadeh%20hat%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'ليلى', 
      nameEn: 'Layla', 
      clothingAr: 'التنورة اللبنانية مع الطنطور التاريخي.', 
      clothingEn: 'Lebanese dress with Tantour headpiece.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Lebanon%20wearing%20traditional%20dress%20and%20Tantour%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "أرز لبنان: تعلم كيف ترحب بالناس بلهجة لبنانية رقيقة واكتشف جمال غابات الأرز الخالدة.", en: "Lebanon's Cedars: Learn how to greet people with a gentle Lebanese dialect and discover the beauty of the eternal Cedar forests." },
      resident: { ar: "مذاق بيروت: توجه إلى مطعم على الروشة واطلب تشكيلة من المازة اللبنانية بلهجة واثقة.", en: "Taste of Beirut: Head to a restaurant in Raouche and order a selection of Lebanese Mezze with confidence." },
      native: { ar: "سحر بعلبك: انطلق في رحلة إلى آثار بعلبك، وناقش عظمة الرومان بلهجة لبنانية فصيحة.", en: "Baalbek's Magic: Embark on a trip to the ruins of Baalbek, and discuss Roman greatness with a fluent Lebanese dialect." }
    },
    culture: {
      factAr: 'تعتبر غابة أرز الرب في لبنان رمزاً وطنياً وتضم أشجاراً عمرها آلاف السنين.',
      factEn: 'The Cedars of God forest in Lebanon is a national symbol and home to trees thousands of years old.',
      items: [
        { nameAr: 'التبولة', nameEn: 'Tabbouleh', icon: '🥗', descAr: 'سلطة لبنانية شهيرة مكونة من البقدونس والبرغل والطماطم.', descEn: 'A famous Lebanese salad consisting of parsley, bulgur, and tomatoes.' },
        { nameAr: 'الأرز', nameEn: 'Cedars', icon: '🌲', descAr: 'شجرة الأرز الخالدة التي تتوسط العلم اللبناني.', descEn: 'The eternal cedar tree that sits in the middle of the Lebanese flag.' },
        { nameAr: 'الفيروزيات', nameEn: 'Fairuz Music', icon: '🎶', descAr: 'أغاني السيدة فيروز التي تعتبر جزءاً من صباح كل لبناني.', descEn: 'Songs of Fairuz, considered part of every Lebanese person\'s morning.' },
        { nameAr: 'بعلبك', nameEn: 'Baalbek', icon: '🏛️', descAr: 'مدينة الشمس التي تضم أضخم المعابد الرومانية في العالم.', descEn: 'The City of the Sun, home to the largest Roman temples in the world.' },
        { nameAr: 'الدبكة', nameEn: 'Dabke', icon: '💃', descAr: 'الرقصة الفلكلورية التقليدية التي تعبر عن الفرح والوحدة.', descEn: 'The traditional folklore dance expressing joy and unity.' },
        { nameAr: 'المناقيش', nameEn: 'Manakish', icon: '🍕', descAr: 'فطائر الزعتر والجبن التي تعتبر الفطور الشعبي الأول.', descEn: 'Thyme and cheese pies, the most popular breakfast.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'كيفك؟', roman: 'Kifak?', en: 'How are you?' },
      { fusha: 'الآن', dialect: 'هلق', roman: 'Halla\'', en: 'Now' },
      { fusha: 'انظر', dialect: 'شِوف', roman: 'Shoof', en: 'Look' },
      { fusha: 'ماذا؟', dialect: 'شو؟', roman: 'Sho?', en: 'What?' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'هنا', dialect: 'هون', roman: 'Hon', en: 'Here' },
      { fusha: 'كثيراً', dialect: 'كتير', roman: 'Kteer', en: 'A lot' },
      { fusha: 'بسرعة', dialect: 'بسرعة / قوام', roman: 'B-sur\'a / Awam', en: 'Fast' },
      { fusha: 'جميل', dialect: 'حلو / مهضوم', roman: 'Helou / Mahdoum', en: 'Beautiful / Cute' },
      { fusha: 'نعم', dialect: 'إيه', roman: 'Iyeh', en: 'Yes' }
    ],
    dialogue: {
      title: 'في المطعم',
      lines: [
        { role: 'Customer', ar: 'أريد طاولة لشخصين.', dialect: 'بدي طاولة لشخصين لو سمحت.', en: 'I want a table for two please.' },
        { role: 'Waiter', ar: 'تفضل، هذا هو المنيو.', dialect: 'تفضل، هيدا المنيو.', en: 'Welcome, here is the menu.' }
      ]
    }
  },
  {
    id: 'palestine',
    nameAr: 'فلسطين',
    nameEn: 'Palestine',
    flag: '🇵🇸',
    image: '/images/dialects/palestine-dome-tourism.avif',
    dialect: 'Palestinian (فلسطيني)',
    characterMale: { 
      nameAr: 'محمود', 
      nameEn: 'Mahmoud', 
      clothingAr: 'القمباز الفلسطيني مع الكوفية.', 
      clothingEn: 'Palestinian Qumbaz with Keffiyeh.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Palestine%20wearing%20traditional%20Qumbaz%20and%20Keffiyeh%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'مريم', 
      nameEn: 'Maryam', 
      clothingAr: 'الثوب الفلسطيني المطرز يدوياً.', 
      clothingEn: 'Hand-embroidered Palestinian Thobe.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Palestine%20wearing%20traditional%20beautifully%20embroidered%20Thobe%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "زهرة المدائن: ابدأ رحلتك بتبادل التحايا الفلسطينية الأصيلة وتعرف على قدسية المسجد الأقصى.", en: "The Flower of Cities: Start your journey by exchanging authentic Palestinian greetings and discover the sanctity of Al-Aqsa Mosque." },
      resident: { ar: "مذاق الأرض: انضم إلى مائدة فلسطينية واطلب طبق المسخن الأصيل بلهجة محلية دافئة.", en: "Taste of the Land: Join a Palestinian table and order an authentic Musakhan dish with a warm local dialect." },
      native: { ar: "حكايات الزيتون: انطلق في رحلة إلى جبال نابلس، وناقش تاريخ شجر الزيتون بلهجة فلسطينية قوية.", en: "Tales of Olives: Embark on a trip to the mountains of Nablus, and discuss the history of olive trees with a strong Palestinian dialect." }
    },
    culture: {
      factAr: 'المسجد الأقصى في القدس هو أولى القبلتين وثالث الحرمين الشريفين.',
      factEn: 'Al-Aqsa Mosque in Jerusalem is the first Qibla and the third holiest site in Islam.',
      items: [
        { nameAr: 'المقلوبة', nameEn: 'Maqluba', icon: '🥘', descAr: 'أكلة فلسطينية تراثية تقلب في الصينية عند تقديمها.', descEn: 'A traditional Palestinian dish flipped in the tray when served.' },
        { nameAr: 'التطريز', nameEn: 'Embroidery', icon: '🧵', descAr: 'فن يدوي عريق يعبر عن الهوية والتاريخ الفلسطيني.', descEn: 'An ancient hand art expressing Palestinian identity and history.' },
        { nameAr: 'الزيتون', nameEn: 'Olives', icon: '🫒', descAr: 'رمز الصمود والارتباط بالأرض في فلسطين.', descEn: 'A symbol of steadfastness and connection to the land in Palestine.' },
        { nameAr: 'قبة الصخرة', nameEn: 'Dome of the Rock', icon: '🕌', descAr: 'معلم إسلامي بارز في القدس بقبته الذهبية الشهيرة.', descEn: 'A prominent Islamic landmark in Jerusalem with its famous golden dome.' },
        { nameAr: 'الكوفية', nameEn: 'Keffiyeh', icon: '🏁', descAr: 'الوشاح الفلسطيني التقليدي الذي أصبح رمزاً عالمياً.', descEn: 'The traditional Palestinian scarf that has become a global symbol.' },
        { nameAr: 'الكنافة النابلسية', nameEn: 'Nabulsi Knafeh', icon: '🍰', descAr: 'حلوى نابلسية شهيرة بالجبن والقطر.', descEn: 'Famous Nabulsi dessert with cheese and syrup.' }
      ]
    },
    vocab: [
      { fusha: 'ماذا تفعل؟', dialect: 'شو بتسوي؟', roman: 'Sho btsawwi?', en: 'What are you doing?' },
      { fusha: 'هنا', dialect: 'هون', roman: 'Hon', en: 'Here' },
      { fusha: 'اذهب', dialect: 'روح', roman: 'Rouh', en: 'Go' },
      { fusha: 'كيف حالك؟', dialect: 'كيفك؟ / شو أخبارك؟', roman: 'Kifak? / Sho akhbarak?', en: 'How are you?' },
      { fusha: 'الآن', dialect: 'هلق', roman: 'Halla\'', en: 'Now' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'كثيراً', dialect: 'كتير', roman: 'Kteer', en: 'A lot' },
      { fusha: 'بسرعة', dialect: 'بسرعة', roman: 'B-sur\'a', en: 'Fast' },
      { fusha: 'جميل', dialect: 'حلو / بجنن', roman: 'Helou / Bijannin', en: 'Beautiful' },
      { fusha: 'نعم', dialect: 'آه / إيه', roman: 'Ah / Iyeh', en: 'Yes' }
    ],
    dialogue: {
      title: 'جلسة عائلية',
      lines: [
        { role: 'Grandma', ar: 'تفضلوا الطعام يا أبنائي.', dialect: 'تفضلوا يما الأكل جاهز.', en: 'Come children, the food is ready.' },
        { role: 'Son', ar: 'سلمت يداكِ يا أمي.', dialect: 'يسلمو ايديكي يما، ريحته بتجنن.', en: 'Bless your hands mom, it smells amazing.' }
      ]
    }
  },
  {
    id: 'iraq',
    nameAr: 'العراق',
    nameEn: 'Iraq',
    flag: '🇮🇶',
    image: '/images/dialects/local/iraq.jpg',
    dialect: 'Iraqi (عراقي)',
    characterMale: { 
      nameAr: 'سنان', 
      nameEn: 'Sinan', 
      clothingAr: 'الدشداشة العراقية مع اليشماغ.', 
      clothingEn: 'Iraqi Dishdasha with Yeshmagh.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Iraq%20wearing%20traditional%20Dishdasha%20and%20Yeshmagh%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'زينة', 
      nameEn: 'Zaina', 
      clothingAr: 'الهاشمي العراقي المطرز بالذهب.', 
      clothingEn: 'Iraqi Hashimi gold-embroidered dress.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Iraq%20wearing%20traditional%20Hashimi%20dress%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "بلاد الرافدين: تعلم كيف ترحب بالناس بلهجة عراقية مهذبة واكتشف عظمة آثار بابل.", en: "Land of the Two Rivers: Learn how to greet people with a polite Iraqi dialect and discover the greatness of Babylon's ruins." },
      resident: { ar: "مذاق دجلة: توجه إلى مطعم على ضفاف دجلة واطلب سمك المسكوف بلهجة واثقة.", en: "Taste of the Tigris: Head to a restaurant on the banks of the Tigris and order Masgouf fish with confidence." },
      native: { ar: "سحر بغداد: انغمس في زحام شارع المتنبي، وناقش الأدب والشعر بلهجة عراقية فصيحة.", en: "Baghdad's Magic: Immerse yourself in the bustle of Al-Mutanabbi Street, and discuss literature and poetry with a fluent Iraqi dialect." }
    },
    culture: {
      factAr: 'نهر دجلة هو أحد أكبر الأنهار في الشرق الأوسط ويرتبط بتاريخ بلاد الرافدين العريق.',
      factEn: 'The Tigris River is one of the largest rivers in the Middle East, deeply linked to the ancient history of Mesopotamia.',
      items: [
        { nameAr: 'المسكوف', nameEn: 'Masgouf', icon: '🐟', descAr: 'السمك المشوي على الطريقة العراقية التقليدية.', descEn: 'Traditional Iraqi style grilled fish.' },
        { nameAr: 'النخيل', nameEn: 'Date Palms', icon: '🌴', descAr: 'العراق بلد المليون نخلة وأجود أنواع التمور.', descEn: 'Iraq is the land of a million palms and the finest dates.' },
        { nameAr: 'الشاي العراقي', nameEn: 'Iraqi Tea', icon: '☕', descAr: 'يقدم في "الاستكان" ويعتبر جزءاً لا يتجزأ من اليوم العراقي.', descEn: 'Served in an "Istikan" and is an integral part of the Iraqi day.' },
        { nameAr: 'بوابة عشتار', nameEn: 'Ishtar Gate', icon: '🏰', descAr: 'البوابة الثامنة لمدينة بابل الداخلية بناها نبوخذ نصر.', descEn: 'The eighth gate to the inner city of Babylon built by Nebuchadnezzar.' },
        { nameAr: 'ملوية سامراء', nameEn: 'Samarra Minaret', icon: '🗼', descAr: 'مئذنة المسجد الجامع في سامراء بشكلها الحلزوني الفريد.', descEn: 'The minaret of the Great Mosque of Samarra with its unique spiral shape.' },
        { nameAr: 'الكليجة', nameEn: 'Kleicha', icon: '🍪', descAr: 'حلوى عراقية تقليدية محشوة بالتمر تقدم في الأعياد.', descEn: 'Traditional Iraqi dessert stuffed with dates served during holidays.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'شلونك؟', roman: 'Shlonak?', en: 'How are you?' },
      { fusha: 'كثيراً', dialect: 'هواية', roman: 'Hwaya', en: 'A lot' },
      { fusha: 'ليس جيداً', dialect: 'مو زين', roman: 'Mo zein', en: 'Not good' },
      { fusha: 'الآن', dialect: 'هسّة', roman: 'Hassa', en: 'Now' },
      { fusha: 'ماذا؟', dialect: 'شنو؟', roman: 'Shno?', en: 'What?' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'هنا', dialect: 'هنا / اهنا', roman: 'Hena / Ihena', en: 'Here' },
      { fusha: 'بسرعة', dialect: 'بسرعة / ركض', roman: 'B-sur\'a / Rakadh', en: 'Fast' },
      { fusha: 'جميل', dialect: 'حلو / يخبل', roman: 'Helou / Yikhabbul', en: 'Beautiful' },
      { fusha: 'نعم', dialect: 'إي / بلي', roman: 'Ee / Bali', en: 'Yes' }
    ],
    dialogue: {
      title: 'شرب الشاي',
      lines: [
        { role: 'Host', ar: 'هل تشرب الشاي؟', dialect: 'تشرب چاي عيني؟', en: 'Would you like some tea, dear?' },
        { role: 'Guest', ar: 'نعم، شكراً لك.', dialect: 'اي والله، ياريت.', en: 'Yes please, I would love to.' }
      ]
    }
  },
  {
    id: 'tunisia',
    nameAr: 'تونس',
    nameEn: 'Tunisia',
    flag: '🇹🇳',
    image: "/images/dialects/local/tunisia.jpg",
    dialect: 'Tunisian (تونسي)',
    characterMale: { 
      nameAr: 'سامي', 
      nameEn: 'Sami', 
      clothingAr: 'الجبة التونسية مع الشاشية.', 
      clothingEn: 'Tunisian Jebba with Chechia hat.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Tunisia%20wearing%20traditional%20Jebba%20and%20red%20Chechia%20hat%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'أنس', 
      nameEn: 'Ons', 
      clothingAr: 'الفوطة والبلوزة التونسية.', 
      clothingEn: 'Traditional Tunisian Fouta and Blouza.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Tunisia%20wearing%20traditional%20Fouta%20and%20Blouza%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "تعلم (عسلامة، لاباس) وتعرف على مدينة قرطاج.", en: "Learn (Aslama, Labas) and identify Carthage." },
      resident: { ar: "اطلب بريكاً تونسياً واشترط أن يكون حاراً جداً.", en: "Order Tunisian Brik and insist it be very spicy." },
      native: { ar: "فاصل في سعر زربية (سجادة) في المدينة العتيقة.", en: "Haggle for a traditional carpet in the Old Medina." }
    },
    culture: {
      factAr: 'تعتبر مدينة قرطاج في تونس من أهم المواقع الأثرية في حوض البحر الأبيض المتوسط.',
      factEn: 'Carthage in Tunisia is one of the most important archaeological sites in the Mediterranean basin.',
      items: [
        { nameAr: 'الكسكسي', nameEn: 'Couscous', icon: '🥣', descAr: 'الوجبة الأساسية في تونس وتتميز بتنوع طرق تحضيرها.', descEn: 'The staple meal in Tunisia, characterized by diverse preparation methods.' },
        { nameAr: 'الياسمين', nameEn: 'Jasmine', icon: '🌼', descAr: 'رمز تونس وجمالها وتنتشر رائحته في كل مكان.', descEn: 'The symbol of Tunisia and its beauty, its scent spreads everywhere.' },
        { nameAr: 'الشاشية', nameEn: 'Chechia', icon: '🎩', descAr: 'غطاء الرأس التقليدي التونسي باللون الأحمر.', descEn: 'The traditional red Tunisian headcover.' },
        { nameAr: 'قرطاج', nameEn: 'Carthage', icon: '🏛️', descAr: 'مدينة تاريخية عريقة كانت مركزاً لإمبراطورية عظيمة.', descEn: 'An ancient historical city that was the center of a great empire.' },
        { nameAr: 'سيدي بوسعيد', nameEn: 'Sidi Bou Said', icon: '🏘️', descAr: 'قرية سياحية شهيرة بألوانها الزرقاء والبيضاء.', descEn: 'A famous tourist village known for its blue and white colors.' },
        { nameAr: 'البريك', nameEn: 'Brik', icon: '🥟', descAr: 'فطائر رقيقة محشوة بالبيض والتونة تقلى في الزيت.', descEn: 'Thin pastries stuffed with eggs and tuna, fried in oil.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'شحوالك؟', roman: 'Ch-hwalek?', en: 'How are you?' },
      { fusha: 'كثيراً', dialect: 'برشة', roman: 'Barcha', en: 'A lot' },
      { fusha: 'أنا', dialect: 'آني', roman: 'Ani', en: 'I am' },
      { fusha: 'الآن', dialect: 'توّة', roman: 'Tawwa', en: 'Now' },
      { fusha: 'ماذا؟', dialect: 'شنوّة؟', roman: 'Chnowwa?', en: 'What?' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'نعم', dialect: 'إيه / وي', roman: 'Iyeh / Oui', en: 'Yes' },
      { fusha: 'لا', dialect: 'لا / لا والو', roman: 'La / La walou', en: 'No' },
      { fusha: 'بسرعة', dialect: 'فيسع', roman: 'Fisaa', en: 'Fast' },
      { fusha: 'جميل', dialect: 'مزيان', roman: 'Mezyan', en: 'Beautiful' }
    ],
    dialogue: {
      title: 'طلب الطعام',
      lines: [
        { role: 'Customer', ar: 'أريد صحن كسكسي بالخضار.', dialect: 'نحب صحن كسكسي بالخضرة عيشك.', en: 'I want a plate of couscous with vegetables please.' },
        { role: 'Waiter', ar: 'حاضر، هل تريد شطة؟', dialect: 'باهي، تحب الهريسة معاه؟', en: 'Sure, do you want Harissa with it?' }
      ]
    }
  },
  {
    id: 'algeria',
    nameAr: 'الجزائر',
    nameEn: 'Algeria',
    flag: '🇩🇿',
    image: "/images/dialects/local/algeria.jpg",
    dialect: 'Algerian (جزائري)',
    characterMale: { 
      nameAr: 'بلقاسم',
      nameEn: 'Belkacem',
      clothingAr: 'البرنوس الجزائري الأبيض.', 
      clothingEn: 'White Algerian Burnous.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Algeria%20wearing%20traditional%20white%20Burnous%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'حليمة',
      nameEn: 'Halima',
      clothingAr: 'الشدة التلمسانية التقليدية.', 
      clothingEn: 'Traditional Tlemcen Chedda.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Algeria%20wearing%20traditional%20Chedda%20Tlemcen%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "تعلم (صحة، واش راك) وتعرف على مقام الشهيد.", en: "Learn (Saha, Wash Rak) and identify Martyrs' Memorial." },
      resident: { ar: "اطلب كسكسياً جزائرياً واسأل عن أنواعه الإقليمية.", en: "Order Algerian Couscous and ask about regional styles." },
      native: { ar: "ناقش تاريخ ثورة المليون ونصف المليون شهيد.", en: "Discuss the history of the 1.5 Million Martyrs Revolution." }
    },
    culture: {
      factAr: 'تغطي الصحراء الكبرى مساحة شاسعة من الجزائر وتتميز بتنوع تضاريسها المذهل.',
      factEn: 'The Sahara Desert covers a vast area of Algeria and is characterized by its stunningly diverse terrain.',
      items: [
        { nameAr: 'الرندة', nameEn: 'Randa', icon: '🧶', descAr: 'فن التطريز اليدوي التقليدي في الجزائر.', descEn: 'Traditional hand embroidery art in Algeria.' },
        { nameAr: 'الصحراء الكبرى', nameEn: 'Sahara', icon: '🏜️', descAr: 'تضم جبال الهقار والطاسيلي ومناظر طبيعية خلابة.', descEn: 'Includes the Hoggar and Tassili mountains and stunning landscapes.' },
        { nameAr: 'موسيقى الراي', nameEn: 'Rai Music', icon: '🎸', descAr: 'نوع موسيقي عالمي نشأ في مدينة وهران الجزائرية.', descEn: 'A global music genre that originated in the Algerian city of Oran.' },
        { nameAr: 'القصبة', nameEn: 'Casbah', icon: '🏘️', descAr: 'الحي التاريخي القديم في العاصمة الجزائر والمدرج ضمن اليونسكو.', descEn: 'The old historical neighborhood in Algiers, listed under UNESCO.' },
        { nameAr: 'الكسكسي الجزائري', nameEn: 'Algerian Couscous', icon: '🥣', descAr: 'طبق تقليدي يتنوع حسب المناطق (قبائلي، شاوي، صحراوي).', descEn: 'A traditional dish that varies by region (Kabyle, Chaoui, Saharan).' },
        { nameAr: 'طاسيلي ناجر', nameEn: 'Tassili n\'Ajjer', icon: '🎨', descAr: 'موقع يضم آلاف النقوش والرسوم الصخرية من عصور ما قبل التاريخ.', descEn: 'A site featuring thousands of prehistoric rock engravings and paintings.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'واش راك؟', roman: 'Wash rak?', en: 'How are you?' },
      { fusha: 'جيد', dialect: 'مليح', roman: 'Mlih', en: 'Good' },
      { fusha: 'تكلم', dialect: 'هدر', roman: 'Hdar', en: 'Speak' },
      { fusha: 'الآن', dialect: 'دوكا', roman: 'Douka', en: 'Now' },
      { fusha: 'ماذا؟', dialect: 'وشنو؟', roman: 'Washno?', en: 'What?' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'نعم', dialect: 'إيه', roman: 'Iyeh', en: 'Yes' },
      { fusha: 'لا', dialect: 'لا / لالا', roman: 'La / Lala', en: 'No' },
      { fusha: 'بسرعة', dialect: 'بسرعة / خف', roman: 'B-sur\'a / Khaf', en: 'Fast' },
      { fusha: 'كثيراً', dialect: 'بزاف', roman: 'Bezzaf', en: 'A lot' }
    ],
    dialogue: {
      title: 'التحية الصباحية',
      lines: [
        { role: 'Neighbor A', ar: 'صباح الخير، كيف حالك؟', dialect: 'صباح الخير، واش راك خويا؟', en: 'Good morning, how are you brother?' },
        { role: 'Neighbor B', ar: 'بخير، شكراً لك.', dialect: 'لاباس، يسلمك.', en: 'I am fine, thank you.' }
      ]
    }
  },
  {
    id: 'libya',
    nameAr: 'ليبيا',
    nameEn: 'Libya',
    flag: '🇱🇾',
    image: "/images/dialects/local/libya.jpg",
    dialect: 'Libyan (ليبي)',
    characterMale: { 
      nameAr: 'عمر', 
      nameEn: 'Omar', 
      clothingAr: 'الزبون الليبي مع الفرملة.', 
      clothingEn: 'Libyan Zabout with Farmala.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Libya%20wearing%20traditional%20Zabout%20and%20Farmala%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'فاطمة', 
      nameEn: 'Fatima', 
      clothingAr: 'الرداء الليبي التقليدي.', 
      clothingEn: 'Traditional Libyan Rida.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Libya%20wearing%20traditional%20colorful%20Rida%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "تعلم (شن جوك، كيف حالك) وتعرف على لبدة الكبرى.", en: "Learn (Shen Jowak, Marhaba) and identify Leptis Magna." },
      resident: { ar: "اطلب عصيدة ليبية وتعرف على أهميتها في المناسبات.", en: "Order Libyan Asida and learn its cultural significance." },
      native: { ar: "ناقش حياة الصحراء وثقافة الواحات الليبية.", en: "Discuss desert life and Libyan oasis culture." }
    },
    culture: {
      factAr: 'تعتبر صحراء ليبيا جزءاً من الصحراء الكبرى وتضم واحات طبيعية وتكوينات صخرية فريدة.',
      factEn: 'The Libyan Desert is part of the Sahara and features natural oases and unique rock formations.',
      items: [
        { nameAr: 'البازين', nameEn: 'Bazin', icon: '🥣', descAr: 'أكلة ليبية تقليدية تصنع من دقيق الشعير وتقدم مع المرق.', descEn: 'A traditional Libyan dish made from barley flour and served with broth.' },
        { nameAr: 'الصحراء', nameEn: 'Sahara', icon: '🏜️', descAr: 'تتميز بالكثبان الرملية الشاسعة والواحات الخضراء.', descEn: 'Characterized by vast sand dunes and green oases.' },
        { nameAr: 'الواحات', nameEn: 'Oasis', icon: '🌴', descAr: 'مثل واحة غدامس "لؤلؤة الصحراء" التاريخية.', descEn: 'Like the historical Ghadames Oasis, the "Pearl of the Desert."' },
        { nameAr: 'لبدة الكبرى', nameEn: 'Leptis Magna', icon: '🏛️', descAr: 'واحدة من أجمل المدن الرومانية المحفوظة في العالم.', descEn: 'One of the most beautiful preserved Roman cities in the world.' },
        { nameAr: 'غدامس', nameEn: 'Ghadames', icon: '🏘️', descAr: 'مدينة قديمة تتميز بعمارتها الفريدة المتأقلمة مع الصحراء.', descEn: 'An ancient city known for its unique desert-adapted architecture.' },
        { nameAr: 'العصيدة', nameEn: 'Asida', icon: '🍯', descAr: 'حلوى تقليدية تقدم في المناسبات الاجتماعية والمولد النبوي.', descEn: 'A traditional dessert served on social occasions and Mawlid.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'شخبارك؟', roman: 'Shakhbarak?', en: 'How are you?' },
      { fusha: 'كثيراً', dialect: 'هلبة', roman: 'Halba', en: 'A lot' },
      { fusha: 'بسرعة', dialect: 'بسرعة', roman: 'B-sur\'a', en: 'Fast' },
      { fusha: 'الآن', dialect: 'توا', roman: 'Tawwa', en: 'Now' },
      { fusha: 'ماذا؟', dialect: 'شنو؟', roman: 'Shno?', en: 'What?' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'نعم', dialect: 'إيه', roman: 'Iyeh', en: 'Yes' },
      { fusha: 'لا', dialect: 'لا / لالا', roman: 'La / Lala', en: 'No' },
      { fusha: 'جميل', dialect: 'سمح / باهي', roman: 'Samah / Bahi', en: 'Beautiful / Good' },
      { fusha: 'جيد', dialect: 'كويس', roman: 'Kwayyes', en: 'Good' }
    ],
    dialogue: {
      title: 'الترحيب',
      lines: [
        { role: 'Local', ar: 'أهلاً بك في ليبيا.', dialect: 'مرحبتين بيك في ليبيا، نورتنا.', en: 'Welcome to Libya, you honored us.' },
        { role: 'Visitor', ar: 'شكراً، البلد جميل جداً.', dialect: 'سلمك، البلاد هلبة سمحة.', en: 'Thanks, the country is very beautiful.' }
      ]
    }
  },
  {
    id: 'syria',
    nameAr: 'سوريا',
    nameEn: 'Syria',
    flag: '🇸🇾',
    image: "/images/dialects/syria-umayyad-cinematic.avif",
    dialect: 'Levantine (شامي)',
    characterMale: { 
      nameAr: 'باسل', 
      nameEn: 'Bassel', 
      clothingAr: 'القمباز السوري مع الطربوش.', 
      clothingEn: 'Syrian Qumbaz with Fez.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Syria%20wearing%20traditional%20Qumbaz%20and%20Fez%20hat%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'شام', 
      nameEn: 'Sham', 
      clothingAr: 'الثوب الدمشقي المطرز.', 
      clothingEn: 'Embroidered Damascene dress.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Syria%20wearing%20traditional%20elegant%20Damascene%20dress%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "تعلم (مرحبا، شلونك) وتعرف على الجامع الأموي.", en: "Learn (Marhaba, Shlonak) and identify the Umayyad Mosque." },
      resident: { ar: "اطلب شاورما شامية من محل مشهور في دمشق.", en: "Order Shawarma from a famous Damascene shop." },
      native: { ar: "فاصل في سعر الحرير والبروكار في سوق الحميدية.", en: "Haggle for silk and brocade in Souq Al-Hamidiyah." }
    },
    culture: {
      factAr: 'يعد الجامع الأموي في دمشق أحد أكبر وأقدم المساجد في العالم وتحفة معمارية إسلامية.',
      factEn: 'The Umayyad Mosque in Damascus is one of the largest and oldest mosques in the world and an Islamic architectural masterpiece.',
      items: [
        { nameAr: 'الياسمين', nameEn: 'Jasmine', icon: '🌼', descAr: 'دمشق هي مدينة الياسمين، حيث تفوح رائحته في أزقتها القديمة.', descEn: 'Damascus is the city of jasmine, its scent wafting through its old alleys.' },
        { nameAr: 'الجامع الأموي', nameEn: 'Umayyad Mosque', icon: '🕌', descAr: 'تحفة معمارية أموية في قلب دمشق القديمة.', descEn: 'An Umayyad architectural masterpiece in the heart of Old Damascus.' },
        { nameAr: 'المشاوي', nameEn: 'Mixed Grill', icon: '🍢', descAr: 'المشاوي الشامية الشهيرة بتتبيلتها الفريدة.', descEn: 'Famous Levantine grills with their unique seasoning.' },
        { nameAr: 'سوق الحميدية', nameEn: 'Souq Al-Hamidiyah', icon: '🛍️', descAr: 'أشهر أسواق دمشق وأقدمها، يتميز بسقفه المعدني المثقوب.', descEn: 'The most famous and oldest market in Damascus, known for its perforated metal roof.' },
        { nameAr: 'البروكار', nameEn: 'Brocade', icon: '🧶', descAr: 'قماش حريري دمشقي فاخر ينسج يدوياً.', descEn: 'Luxury Damascene silk fabric hand-woven.' },
        { nameAr: 'البوظة الشامية', nameEn: 'Syrian Ice Cream', icon: '🍦', descAr: 'بوظة "بكداش" الشهيرة التي تدق يدوياً وتغطى بالفستق.', descEn: 'Famous "Bakdash" ice cream, hand-pounded and covered with pistachios.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'شلونك؟ / كيفك؟', roman: 'Shlonak? / Kifak?', en: 'How are you?' },
      { fusha: 'جيد', dialect: 'منيح', roman: 'Mnih', en: 'Good' },
      { fusha: 'تفضل', dialect: 'تؤبرني / تفضل', roman: 'To\'borni / Tfaddal', en: 'Please / Dear' },
      { fusha: 'الآن', dialect: 'هلأ', roman: 'Halla\'', en: 'Now' },
      { fusha: 'ماذا؟', dialect: 'شو؟', roman: 'Sho?', en: 'What?' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'هنا', dialect: 'هون', roman: 'Hon', en: 'Here' },
      { fusha: 'كثيراً', dialect: 'كتير', roman: 'Kteer', en: 'A lot' },
      { fusha: 'بسرعة', dialect: 'بسرعة / قوام', roman: 'B-sur\'a / Qawam', en: 'Fast' },
      { fusha: 'نعم', dialect: 'إيه', roman: 'Iyeh', en: 'Yes' }
    ],
    dialogue: {
      title: 'الترحيب بالجار',
      lines: [
        { role: 'Neighbor', ar: 'تفضل لتشرب القهوة.', dialect: 'تفضل لعنا نشرب قهوة يا جار.', en: 'Come over for some coffee, neighbor.' },
        { role: 'You', ar: 'شكراً، في وقت آخر إن شاء الله.', dialect: 'يسلمو, غير مرة إن شاء الله.', en: 'Thanks, another time God willing.' }
      ]
    }
  },
  {
    id: 'sudan',
    nameAr: 'السودان',
    nameEn: 'Sudan',
    flag: '🇸🇩',
    image: '/images/dialects/local/sudan.jpg',
    dialect: 'Sudanese (سوداني)',
    characterMale: { 
      nameAr: 'مازن', 
      nameEn: 'Mazin', 
      clothingAr: 'الجلابية السودانية مع العمامة.', 
      clothingEn: 'Sudanese Galabeya with turban.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Sudan%20wearing%20traditional%20white%20Galabeya%20and%20large%20turban%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'آمنة', 
      nameEn: 'Amna', 
      clothingAr: 'الثوب السوداني التقليدي الملون.', 
      clothingEn: 'Traditional colorful Sudanese Toub.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Sudan%20wearing%20traditional%20colorful%20Toub%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "تعلم (حبابك، كيفك) وتعرف على أهرامات مروي.", en: "Learn (Hababak, Keifak) and identify the Pyramids of Meroe." },
      resident: { ar: "اطلب طبق كسرة واسأل عن طريقة تخميرها التقليدية.", en: "Order Kisra and ask about the traditional fermentation process." },
      native: { ar: "ناقش أهمية ملتقى النيلين في الخرطوم بلهجة سودانية.", en: "Discuss the Nile confluence in Khartoum in Sudanese dialect." }
    },
    culture: {
      factAr: 'السودان يضم أهرامات أكثر من مصر (أهرامات مروي).',
      factEn: 'Sudan has more pyramids than Egypt (Meroe Pyramids).',
      items: [
        { nameAr: 'العصيدة', nameEn: 'Asida', icon: '🥣', descAr: 'طبق تقليدي أساسي في المائدة السودانية خاصة في رمضان.', descEn: 'A staple traditional dish on the Sudanese table, especially in Ramadan.' },
        { nameAr: 'الجبنة', nameEn: 'Sudanese Coffee', icon: '☕', descAr: 'طريقة تحضير القهوة السودانية التقليدية ببهاراتها الخاصة.', descEn: 'Traditional Sudanese coffee preparation with its special spices.' },
        { nameAr: 'النيلين', nameEn: 'Two Niles', icon: '🌊', descAr: 'ملتقى النيل الأزرق والنيل الأبيض في الخرطوم.', descEn: 'The confluence of the Blue Nile and the White Nile in Khartoum.' },
        { nameAr: 'أهرامات مروي', nameEn: 'Meroe Pyramids', icon: '📐', descAr: 'أهرامات كوشية قديمة تعتبر إرثاً تاريخياً عالمياً.', descEn: 'Ancient Kushite pyramids considered a global historical heritage.' },
        { nameAr: 'الثوب السوداني', nameEn: 'Sudanese Toub', icon: '👗', descAr: 'الزي التقليدي للمرأة السودانية بألوانه وأشكاله المتنوعة.', descEn: 'The traditional attire for Sudanese women in various colors and styles.' },
        { nameAr: 'الكسرة', nameEn: 'Kisra', icon: '🥞', descAr: 'خبز رقيق يصنع من الذرة المتخمرة وهو ركن أساسي في الوجبات.', descEn: 'Thin bread made from fermented corn, a staple in meals.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'كيفنك؟ / شديد؟', roman: 'Kifannak? / Shadid?', en: 'How are you?' },
      { fusha: 'جيد جداً', dialect: 'تمام التمام', roman: 'Tamam al-tamam', en: 'Very good' },
      { fusha: 'يا رجل', dialect: 'يا زول', roman: 'Ya zol', en: 'Hey man' },
      { fusha: 'الآن', dialect: 'هسّع', roman: 'Hassa\'', en: 'Now' },
      { fusha: 'ماذا؟', dialect: 'شنو؟', roman: 'Shno?', en: 'What?' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'نعم', dialect: 'أيوه', roman: 'Aywa', en: 'Yes' },
      { fusha: 'لا', dialect: 'لا / لالا', roman: 'La / Lala', en: 'No' },
      { fusha: 'بسرعة', dialect: 'بسرعة / جري', roman: 'B-sur\'a / Jari', en: 'Fast' },
      { fusha: 'جميل', dialect: 'سمح / جميل', roman: 'Samah / Jamil', en: 'Beautiful' }
    ],
    dialogue: {
      title: 'لقاء في الشارع',
      lines: [
        { role: 'Person A', ar: 'كيف حالك اليوم؟', dialect: 'يا زول كيفنك؟ شديد؟', en: 'Hey man, how are you? Good?' },
        { role: 'Person B', ar: 'أنا بخير والحمد لله.', dialect: 'والله مية مية، الحمد لله.', en: 'I am 100%, thank God.' }
      ]
    }
  },
  {
    id: 'oman',
    nameAr: 'عمان',
    nameEn: 'Oman',
    flag: '🇴🇲',
    image: "/images/dialects/local/oman.jpg",
    dialect: 'Omani (عماني)',
    characterMale: { 
      nameAr: 'هيثم', 
      nameEn: 'Haitham', 
      clothingAr: 'الدشداشة العمانية مع المصر والخنجر.', 
      clothingEn: 'Omani Dishdasha with Massar and Khanjar.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Oman%20wearing%20traditional%20Dishdasha%20and%20Massar%20turban%20with%20Khanjar%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'عزة', 
      nameEn: 'Azza', 
      clothingAr: 'الثوب العماني المطرز.', 
      clothingEn: 'Embroidered traditional Omani dress.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Oman%20wearing%20traditional%20colorful%20Omani%20dress%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "تعلم (هلا، شخبارك) وتعرف على قلعة نزوى.", en: "Learn (Hala, Shkhabarak) and identify Nizwa Fort." },
      resident: { ar: "اطلب حلوى عمانية واسأل عن مكوناتها الأساسية.", en: "Order Omani Halwa and ask about its main ingredients." },
      native: { ar: "ناقش تاريخ الملاحة العمانية وصناعة السفن التقليدية.", en: "Discuss Omani maritime history and traditional dhow building." }
    },
    culture: {
      factAr: 'تعتبر قلعة نزوى من أقدم القلاع في سلطنة عمان وتتميز ببرجها الدائري الضخم.',
      factEn: 'Nizwa Fort is one of the oldest forts in Oman, famous for its massive circular tower.',
      items: [
        { nameAr: 'الخنجر العماني', nameEn: 'Omani Khanjar', icon: '🗡️', descAr: 'رمز الرجولة والأصالة العمانية ويوضع على العلم الوطني.', descEn: 'A symbol of Omani masculinity and authenticity, featured on the national flag.' },
        { nameAr: 'الحلوى العمانية', nameEn: 'Omani Halwa', icon: '🍮', descAr: 'حلوى تقليدية شهيرة تصنع من السكر والزعفران والمكسرات.', descEn: 'Famous traditional dessert made from sugar, saffron, and nuts.' },
        { nameAr: 'اللبان', nameEn: 'Frankincense', icon: '💨', descAr: 'تشتهر به محافظة ظفار ويستخدم كبخور وعلاج منذ القدم.', descEn: 'Dhofar Governorate is famous for it, used as incense and medicine since ancient times.' },
        { nameAr: 'قلعة نزوى', nameEn: 'Nizwa Fort', icon: '🏛️', descAr: 'معلم تاريخي بارز يعكس العمارة العمانية الدفاعية.', descEn: 'A prominent historical landmark reflecting Omani defensive architecture.' },
        { nameAr: 'الجبل الأخضر', nameEn: 'Jebel Akhdar', icon: '⛰️', descAr: 'يتميز بمناخه المعتدل وزراعة الورد والرمان.', descEn: 'Known for its moderate climate and the cultivation of roses and pomegranates.' },
        { nameAr: 'السفن التقليدية', nameEn: 'Traditional Dhows', icon: '⛵', descAr: 'تشتهر مدينة صور بصناعة السفن الخشبية التقليدية.', descEn: 'Sur city is famous for building traditional wooden dhows.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'هينك؟ / شخبارك؟', roman: 'Heink? / Shakhbarak?', en: 'How are you?' },
      { fusha: 'جميل', dialect: 'غاوِي', roman: 'Ghawi', en: 'Beautiful' },
      { fusha: 'ماذا هناك؟', dialect: 'مو علوم؟', roman: 'Mo uloum?', en: 'What is the news?' },
      { fusha: 'الآن', dialect: 'الحين', roman: 'Al-heen', en: 'Now' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'نعم', dialect: 'إيه / نعم', roman: 'Ee / Naam', en: 'Yes' },
      { fusha: 'لا', dialect: 'لا / لالا', roman: 'La / Lala', en: 'No' },
      { fusha: 'بسرعة', dialect: 'بسرعة', roman: 'B-sur\'a', en: 'Fast' },
      { fusha: 'كثيراً', dialect: 'وايد', roman: 'Wayed', en: 'A lot' },
      { fusha: 'جيد', dialect: 'زين', roman: 'Zein', en: 'Good' }
    ],
    dialogue: {
      title: 'الضيافة العمانية',
      lines: [
        { role: 'Host', ar: 'تفضل جرب الحلوى العمانية.', dialect: 'تفضل ذوق الحلوى العمانية، غاوية وايد.', en: 'Please taste the Omani Halwa, it is very good.' },
        { role: 'Guest', ar: 'شكراً، طعمها رائع.', dialect: 'مشكور، طعمها مية مية.', en: 'Thanks, it tastes amazing.' }
      ]
    }
  },
  {
    id: 'kuwait',
    nameAr: 'الكويت',
    nameEn: 'Kuwait',
    flag: '🇰🇼',
    image: '/images/dialects/local/kuwait.jpg',
    dialect: 'Gulf (كويتي)',
    characterMale: { 
      nameAr: 'فهد', 
      nameEn: 'Fahad', 
      clothingAr: 'الدشداشة الكويتية مع الغترة.', 
      clothingEn: 'Kuwaiti Dishdasha with Ghutra.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Kuwait%20wearing%20traditional%20white%20Dishdasha%20and%20Ghutra%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'لولوة', 
      nameEn: 'Lulwa', 
      clothingAr: 'الدراعة الكويتية المطرزة.', 
      clothingEn: 'Embroidered Kuwaiti Dara\'a.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Kuwait%20wearing%20traditional%20Daraa%20dress%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "تعلم (هلا، شلونك) وتعرف على أبراج الكويت.", en: "Learn (Hala, Shlounak) and identify the Kuwait Towers." },
      resident: { ar: "اطلب مجبوساً واسأل عن طريقة تحضير الدقوس.", en: "Order Machboos and ask about the Daqoos preparation." },
      native: { ar: "ناقش تراث الغوص على اللؤلؤ وحياة الأجداد.", en: "Discuss the pearl diving heritage and ancestors' life." }
    },
    culture: {
      factAr: 'أبراج الكويت هي المعلم الأكثر شهرة في البلاد وتعتبر رمزاً للنهضة الحديثة.',
      factEn: 'Kuwait Towers are the most famous landmark in the country and a symbol of modern renaissance.',
      items: [
        { nameAr: 'مجبوس الدجاج', nameEn: 'Chicken Machboos', icon: '🍛', descAr: 'الطبق الوطني الكويتي المكون من الأرز والدجاج المتبل.', descEn: 'The Kuwaiti national dish consisting of rice and seasoned chicken.' },
        { nameAr: 'الديوانية', nameEn: 'Diwaniya', icon: '🏠', descAr: 'مجلس اجتماعي تقليدي يلتقي فيه الرجال لمناقشة الأمور العامة.', descEn: 'A traditional social gathering place where men meet to discuss public affairs.' },
        { nameAr: 'السدو', nameEn: 'Sadu Weaving', icon: '🧶', descAr: 'فن حياكة الصوف التقليدي الذي يمارسه البدو.', descEn: 'Traditional wool weaving art practiced by Bedouins.' },
        { nameAr: 'أبراج الكويت', nameEn: 'Kuwait Towers', icon: '🗼', descAr: 'ثلاثة أبراج شاهقة تطل على الخليج العربي.', descEn: 'Three towering towers overlooking the Arabian Gulf.' },
        { nameAr: 'سوق المباركية', nameEn: 'Mubarakiya Market', icon: '🛍️', descAr: 'أقدم سوق تراثي في الكويت يفوح بعبق الماضي.', descEn: 'The oldest heritage market in Kuwait, smelling of the past.' },
        { nameAr: 'الدروازة', nameEn: 'Darwaza', icon: '🚪', descAr: 'البوابات القديمة التي كانت تحمي مدينة الكويت قديماً.', descEn: 'The old gates that used to protect Kuwait City in the past.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'شلونك؟', roman: 'Shlonak?', en: 'How are you?' },
      { fusha: 'ماذا تريد؟', dialect: 'شتبِي؟', roman: 'Shatabi?', en: 'What do you want?' },
      { fusha: 'الآن', dialect: 'الحِين', roman: 'Al-heen', en: 'Now' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'نعم', dialect: 'إي / نعم', roman: 'Ee / Naam', en: 'Yes' },
      { fusha: 'لا', dialect: 'لا / لالا', roman: 'La / Lala', en: 'No' },
      { fusha: 'بسرعة', dialect: 'بسرعة', roman: 'B-sur\'a', en: 'Fast' },
      { fusha: 'كثيراً', dialect: 'وايد / حيل', roman: 'Wayed / Heil', en: 'A lot' },
      { fusha: 'جميل', dialect: 'حلو / زين', roman: 'Helou / Zein', en: 'Beautiful' },
      { fusha: 'انظر', dialect: 'طالع', roman: 'Talae', en: 'Look' }
    ],
    dialogue: {
      title: 'في الديوانية',
      lines: [
        { role: 'Friend', ar: 'متى ستأتي إلينا؟', dialect: 'متى بتسير علينا بالديوانية؟', en: 'When will you visit us at the Diwaniya?' },
        { role: 'You', ar: 'سآتي الليلة إن شاء الله.', dialect: 'بجيك الليلة إن شاء الله.', en: 'I will come tonight, God willing.' }
      ]
    }
  },
  {
    id: 'qatar',
    nameAr: 'قطر',
    nameEn: 'Qatar',
    flag: '🇶🇦',
    image: '/images/dialects/local/qatar.jpg',
    dialect: 'Gulf (قطري)',
    characterMale: { 
      nameAr: 'جاسم', 
      nameEn: 'Jassem', 
      clothingAr: 'الثوب القطري مع الغترة.', 
      clothingEn: 'Qatari Thobe with Ghutra.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Qatar%20wearing%20traditional%20white%20Thobe%20and%20Ghutra%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'روضة', 
      nameEn: 'Rawda', 
      clothingAr: 'البخنق القطري التقليدي.', 
      clothingEn: 'Traditional Qatari Bukhnuq.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Qatar%20wearing%20traditional%20Bukhnuq%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "تعلم (هلا، شخبارك) وتعرف على سوق واقف.", en: "Learn (Hala, Shkhabarak) and identify Souq Waqif." },
      resident: { ar: "اطلب صالونة قطرية واسأل عن أنواع السمك المحلي.", en: "Order Qatari Saloona and ask about local fish types." },
      native: { ar: "ناقش العمارة الحديثة وإرث كأس العالم 2022.", en: "Discuss modern architecture and the 2022 World Cup legacy." }
    },
    culture: {
      factAr: 'سوق واقف هو أحد أهم المعالم التراثية في قطر، حيث يجمع بين العمارة التقليدية والنشاط التجاري.',
      factEn: 'Souq Waqif is one of the most important heritage landmarks in Qatar, blending traditional architecture with commercial activity.',
      items: [
        { nameAr: 'سوق واقف', nameEn: 'Souq Waqif', icon: '🕌', descAr: 'سوق تراثي نابض بالحياة في قلب الدوحة.', descEn: 'A vibrant heritage market in the heart of Doha.' },
        { nameAr: 'المها العربي', nameEn: 'Arabian Oryx', icon: '🦌', descAr: 'الحيوان الوطني لقطر ورمز المها للطيران.', descEn: 'The national animal of Qatar and the symbol of Qatar Airways.' },
        { nameAr: 'متحف الفن الإسلامي', nameEn: 'Museum of Islamic Art', icon: '🏛️', descAr: 'تحفة معمارية تضم كنوزاً من الفن الإسلامي عبر العصور.', descEn: 'An architectural masterpiece housing treasures of Islamic art through the ages.' },
        { nameAr: 'اللؤلؤة', nameEn: 'The Pearl', icon: '🏝️', descAr: 'جزيرة اصطناعية فاخرة تعكس التطور العمراني في قطر.', descEn: 'A luxury artificial island reflecting urban development in Qatar.' },
        { nameAr: 'الصيد بالصقور', nameEn: 'Falconry', icon: '🦅', descAr: 'تراث قطري عريق يحظى باهتمام كبير ومسابقات دولية.', descEn: 'Ancient Qatari heritage with great interest and international competitions.' },
        { nameAr: 'القهوة القطرية', nameEn: 'Qatari Coffee', icon: '☕', descAr: 'تقدم بأسلوب خاص تعبيراً عن الترحيب والضيافة.', descEn: 'Served in a special way as an expression of welcome and hospitality.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'شحالك؟', roman: 'Sh-halak?', en: 'How are you?' },
      { fusha: 'جيد', dialect: 'زين', roman: 'Zein', en: 'Good' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'الآن', dialect: 'الحين', roman: 'Al-heen', en: 'Now' },
      { fusha: 'ماذا؟', dialect: 'وشو؟', roman: 'Washo?', en: 'What?' },
      { fusha: 'نعم', dialect: 'إي / نعم', roman: 'Ee / Naam', en: 'Yes' },
      { fusha: 'لا', dialect: 'لا / لالا', roman: 'La / Lala', en: 'No' },
      { fusha: 'بسرعة', dialect: 'بسرعة', roman: 'B-sur\'a', en: 'Fast' },
      { fusha: 'كثيراً', dialect: 'وايد / حيل', roman: 'Wayed / Heil', en: 'A lot' },
      { fusha: 'جميل', dialect: 'حلو / زين', roman: 'Helou / Zein', en: 'Beautiful' }
    ],
    dialogue: {
      title: 'في سوق واقف',
      lines: [
        { role: 'Tourist', ar: 'أين أجد المطاعم الشعبية؟', dialect: 'وين أحصل المطاعم الشعبية هني؟', en: 'Where can I find traditional restaurants here?' },
        { role: 'Local', ar: 'هناك في نهاية الممر.', dialect: 'هناك في آخر السكة، بتشوفهم.', en: 'There at the end of the alley, you will see them.' }
      ]
    }
  },
  {
    id: 'bahrain',
    nameAr: 'البحرين',
    nameEn: 'Bahrain',
    flag: '🇧🇭',
    image: '/images/dialects/local/bahrain.jpg',
    dialect: 'Gulf (بحريني)',
    characterMale: { 
      nameAr: 'حمد', 
      nameEn: 'Hamad', 
      clothingAr: 'الثوب البحريني مع الغترة.', 
      clothingEn: 'Bahraini Thobe with Ghutra.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Bahrain%20wearing%20traditional%20white%20Thobe%20and%20Ghutra%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'شيخة', 
      nameEn: 'Shaikha', 
      clothingAr: 'الثوب النشل البحريني المطرز.', 
      clothingEn: 'Traditional Bahraini Thobe Nashal.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Bahrain%20wearing%20traditional%20Nashal%20dress%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "تعلم (هلا، شلونك) وتعرف على قلعة البحرين.", en: "Learn (Hala, Shlounak) and identify Bahrain Fort." },
      resident: { ar: "اطلب محمر (أرز محلى) واسأل عن سر هذه الأكلة.", en: "Order Muhammar and ask about this unique sweet rice dish." },
      native: { ar: "ناقش تاريخ شجرة الحياة ولغز بقائها في الصحراء.", en: "Discuss the Tree of Life history and its desert mystery." }
    },
    culture: {
      factAr: 'تعد قلعة البحرين موقعاً للتراث العالمي لليونسكو وكانت عاصمة حضارة دلمون.',
      factEn: 'Bahrain Fort is a UNESCO World Heritage site and was the capital of the Dilmun civilization.',
      items: [
        { nameAr: 'اللؤلؤ البحريني', nameEn: 'Bahraini Pearls', icon: '🦪', descAr: 'تشتهر البحرين بأجود أنواع اللؤلؤ الطبيعي في العالم.', descEn: 'Bahrain is famous for the finest natural pearls in the world.' },
        { nameAr: 'حلوى الشويطر', nameEn: 'Showaiter Halwa', icon: '🍮', descAr: 'حلوى بحرينية تقليدية شهيرة يحرص السياح على اقتنائها.', descEn: 'Famous traditional Bahraini dessert that tourists are keen to buy.' },
        { nameAr: 'باب البحرين', nameEn: 'Bab Al Bahrain', icon: '🏛️', descAr: 'مدخل سوق المنامة التاريخي ورمز تجاري قديم.', descEn: 'The entrance to the historical Manama Souq and an old commercial symbol.' },
        { nameAr: 'شجرة الحياة', nameEn: 'Tree of Life', icon: '🌳', descAr: 'شجرة وحيدة في قلب الصحراء بقيت خضراء لمئات السنين.', descEn: 'A lone tree in the heart of the desert that has remained green for hundreds of years.' },
        { nameAr: 'الفخار', nameEn: 'Pottery', icon: '🏺', descAr: 'صناعة يدوية عريقة تشتهر بها قرية عالي في البحرين.', descEn: 'An ancient handicraft famous in A\'ali village in Bahrain.' },
        { nameAr: 'بيت القرآن', nameEn: 'Beit Al Quran', icon: '📖', descAr: 'متحف إسلامي يضم مخطوطات نادرة للقرآن الكريم.', descEn: 'An Islamic museum housing rare manuscripts of the Holy Quran.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'شخبارك؟', roman: 'Shakhbarak?', en: 'How are you?' },
      { fusha: 'نعم', dialect: 'إي نعم', roman: 'Ee naam', en: 'Yes' },
      { fusha: 'انظر', dialect: 'طالع', roman: 'Talae', en: 'Look' },
      { fusha: 'الآن', dialect: 'الحين', roman: 'Al-heen', en: 'Now' },
      { fusha: 'ماذا؟', dialect: 'شنو؟', roman: 'Shno?', en: 'What?' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'لا', dialect: 'لا / لالا', roman: 'La / Lala', en: 'No' },
      { fusha: 'بسرعة', dialect: 'بسرعة', roman: 'B-sur\'a', en: 'Fast' },
      { fusha: 'كثيراً', dialect: 'وايد / حيل', roman: 'Wayed / Heil', en: 'A lot' },
      { fusha: 'جميل', dialect: 'حلو / زين', roman: 'Helou / Zein', en: 'Beautiful' }
    ],
    dialogue: {
      title: 'الترحيب بالزائر',
      lines: [
        { role: 'Local', ar: 'أهلاً بك في البحرين.', dialect: 'يا هلا بيك في البحرين، نورتنا.', en: 'Welcome to Bahrain, you honored us.' },
        { role: 'Visitor', ar: 'شكراً، أهلها طيبون جداً.', dialect: 'مشكور، أهل البحرين وايد طيبين.', en: 'Thanks, Bahraini people are very kind.' }
      ]
    }
  },
  {
    id: 'yemen',
    nameAr: 'اليمن',
    nameEn: 'Yemen',
    flag: '🇾🇪',
    image: "/images/dialects/local/yemen.jpg",
    dialect: 'Yemeni (يمني)',
    characterMale: { 
      nameAr: 'قحطان', 
      nameEn: 'Qahtan', 
      clothingAr: 'الثوب اليمني مع الجنبية والشال.', 
      clothingEn: 'Yemeni Thobe with Janbiya and shawl.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Yemen%20wearing%20traditional%20Thobe%20and%20Janbiya%20belt%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'بلقيس', 
      nameEn: 'Bilqis', 
      clothingAr: 'الثوب الصنعاني التقليدي.', 
      clothingEn: 'Traditional Sana\'ani dress.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Yemen%20wearing%20traditional%20colorful%20Sanaani%20dress%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "تعلم (كيفك، مرحبا) وتعرف على صنعاء القديمة.", en: "Learn (Keifak, Marhaba) and identify Old Sana'a." },
      resident: { ar: "اطلب مندي يمني واسأل عن طريقة الطبخ تحت الأرض.", en: "Order Yemeni Mandi and ask about underground cooking." },
      native: { ar: "ناقش تاريخ القهوة (المخا) وأصلها العالمي من اليمن.", en: "Discuss coffee (Mocha) history and its Yemeni origin." }
    },
    culture: {
      factAr: 'تعتبر مدينة صنعاء القديمة من أقدم المدن المأهولة في العالم وتتميز بعمارتها الفريدة.',
      factEn: 'Old Sana\'a is one of the oldest continuously inhabited cities in the world, known for its unique architecture.',
      items: [
        { nameAr: 'الجنبية', nameEn: 'Janbiya', icon: '🗡️', descAr: 'خنجر يمني تقليدي يلبس كجزء من الزي القومي ورمز للرجولة.', descEn: 'A traditional Yemeni dagger worn as part of the national dress and a symbol of masculinity.' },
        { nameAr: 'البن اليمني', nameEn: 'Yemeni Coffee', icon: '☕', descAr: 'من أجود أنواع القهوة في العالم، وتشتهر به منطقة موكا.', descEn: 'One of the finest types of coffee in the world, famous in the Mocha region.' },
        { nameAr: 'صنعاء القديمة', nameEn: 'Old Sana\'a', icon: '🏘️', descAr: 'مدينة تاريخية تتميز ببيوتها المزخرفة بالآجر والجبس.', descEn: 'A historical city known for its houses decorated with brick and gypsum.' },
        { nameAr: 'السلتة', nameEn: 'Saltah', icon: '🥘', descAr: 'الوجبة الوطنية اليمنية، تقدم ساخنة في وعاء حجري.', descEn: 'The Yemeni national meal, served hot in a stone pot.' },
        { nameAr: 'جزيرة سقطرى', nameEn: 'Socotra Island', icon: '🏝️', descAr: 'جزيرة فريدة تضم أشجار "دم الأخوين" النادرة.', descEn: 'A unique island home to the rare "Dragon\'s Blood" trees.' },
        { nameAr: 'العمارة الطينية', nameEn: 'Mud Architecture', icon: '🧱', descAr: 'مثل مدينة شبام حضرموت "ناطحات سحاب الصحراء".', descEn: 'Like Shibam Hadramout, the "Manhattan of the Desert."' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'كيف حالك؟ / كيف أنت؟', roman: 'Kif halak? / Kif ant?', en: 'How are you?' },
      { fusha: 'جميل', dialect: 'حالي', roman: 'Hali', en: 'Beautiful' },
      { fusha: 'جداً', dialect: 'قوي', roman: 'Qawi', en: 'Very' },
      { fusha: 'الآن', dialect: 'ذلحين', roman: 'Dhal-heen', en: 'Now' },
      { fusha: 'ماذا؟', dialect: 'ماذا؟ / وش؟', roman: 'Madha? / Wash?', en: 'What?' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'نعم', dialect: 'أيوه', roman: 'Aywa', en: 'Yes' },
      { fusha: 'لا', dialect: 'لا / لالا', roman: 'La / Lala', en: 'No' },
      { fusha: 'بسرعة', dialect: 'بسرعة', roman: 'B-sur\'a', en: 'Fast' },
      { fusha: 'كثيراً', dialect: 'قوي / كثير', roman: 'Qawi / Ktheer', en: 'A lot' }
    ],
    dialogue: {
      title: 'شراء البن',
      lines: [
        { role: 'Customer', ar: 'أريد أفضل أنواع البن.', dialect: 'أشتي أحسن نوع بن يمني.', en: 'I want the best type of Yemeni coffee.' },
        { role: 'Seller', ar: 'هذا البن المطري هو الأفضل.', dialect: 'هذا البن المطري حالي قوي، جربه.', en: 'This Matari coffee is very good, try it.' }
      ]
    }
  },
  {
    id: 'mauritania',
    nameAr: 'موريتانيا',
    nameEn: 'Mauritania',
    flag: '🇲🇷',
    image: '/images/dialects/local/mauritania.jpg',
    dialect: 'Hassaniya (حساني)',
    characterMale: { 
      nameAr: 'المختار', 
      nameEn: 'Mokhtar', 
      clothingAr: 'الدراعة الموريتانية الواسعة.', 
      clothingEn: 'Wide Mauritanian Dara\'a.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Mauritania%20wearing%20traditional%20blue%20Daraa%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'مريم', 
      nameEn: 'Mariem', 
      clothingAr: 'الملحفة الموريتانية التقليدية.', 
      clothingEn: 'Traditional Mauritanian Melhafa.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Mauritania%20wearing%20traditional%20colorful%20Melhafa%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "تعلم (أهلاً، كيفك) وتعرف على مسجد شنقيط.", en: "Learn (Ahlan, Keifak) and identify Chinguetti Mosque." },
      resident: { ar: "اطلب طبق مارو والحوت واسأل عن أنواع السمك.", en: "Order Thieboudienne (Maru wal-Hout) and ask about fish." },
      native: { ar: "ناقش حياة البادية التقليدية وثقافة الشعر الموريتاني.", en: "Discuss nomadic life and Mauritanian poetry culture." }
    },
    culture: {
      factAr: 'تمتد الصحراء الموريتانية على مساحات واسعة وتعد جزءاً أصيلاً من الهوية الثقافية للبلاد.',
      factEn: 'The Mauritanian desert extends over vast areas and is an integral part of the country\'s cultural identity.',
      items: [
        { nameAr: 'الشاي الموريتاني', nameEn: 'Mauritanian Tea', icon: '🍵', descAr: 'يسمى "أتاي" ويحضر بطقوس خاصة تشمل ثلاث كؤوس متتالية.', descEn: 'Called "Atay," it is prepared with special rituals involving three consecutive cups.' },
        { nameAr: 'الملحفة', nameEn: 'Melhafa', icon: '👘', descAr: 'الزي التقليدي للمرأة الموريتانية الذي يجمع بين الحشمة والجمال.', descEn: 'The traditional attire for Mauritanian women, combining modesty and beauty.' },
        { nameAr: 'الصحراء', nameEn: 'The Desert', icon: '🏜️', descAr: 'قلب موريتانيا النابض ومصدر إلهام الشعراء والرحالة.', descEn: 'The beating heart of Mauritania and a source of inspiration for poets and travelers.' },
        { nameAr: 'شنقيط', nameEn: 'Chinguetti', icon: '🕌', descAr: 'مدينة تاريخية وعلمية كانت مركزاً للقوافل ومكتبات المخطوطات.', descEn: 'A historical and scientific city that was a center for caravans and manuscript libraries.' },
        { nameAr: 'الدراعة', nameEn: 'Daraa', icon: '👕', descAr: 'الزي التقليدي الرجالي الواسع والمريح المناسب لأجواء الصحراء.', descEn: 'The wide and comfortable traditional men\'s attire suitable for the desert climate.' },
        { nameAr: 'مارو والحوت', nameEn: 'Maru wal-Hout', icon: '🐟', descAr: 'الوجبة الوطنية المكونة من الأرز والسمك والخضروات.', descEn: 'The national meal consisting of rice, fish, and vegetables.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'شحالك؟ / شخبار؟', roman: 'Sh-halak? / Shakhbar?', en: 'How are you?' },
      { fusha: 'بخير', dialect: 'لاباس', roman: 'Labas', en: 'Fine' },
      { fusha: 'جيد', dialect: 'زين', roman: 'Zein', en: 'Good' },
      { fusha: 'الآن', dialect: 'ذرك', roman: 'Dhark', en: 'Now' },
      { fusha: 'ماذا؟', dialect: 'شنو؟', roman: 'Shno?', en: 'What?' },
      { fusha: 'أين؟', dialect: 'فين؟', roman: 'Fein?', en: 'Where?' },
      { fusha: 'نعم', dialect: 'أيه', roman: 'Iyeh', en: 'Yes' },
      { fusha: 'لا', dialect: 'لا / لالا', roman: 'La / Lala', en: 'No' },
      { fusha: 'بسرعة', dialect: 'بالعجلة', roman: 'B-al-ajala', en: 'Fast' },
      { fusha: 'كثيراً', dialect: 'ياسر', roman: 'Yasser', en: 'A lot' }
    ],
    dialogue: {
      title: 'جلسة الشاي',
      lines: [
        { role: 'Host', ar: 'تفضل اشرب الشاي معنا.', dialect: 'تفضل اشرب معانا أتاي.', en: 'Please have some tea with us.' },
        { role: 'Guest', ar: 'شكراً، الشاي الموريتاني رائع.', dialect: 'مشكور، أتاي زين برشة.', en: 'Thanks, the tea is very good.' }
      ]
    }
  },
  {
    id: 'somalia',
    nameAr: 'الصومال',
    nameEn: 'Somalia',
    flag: '🇸🇴',
    image: "/images/dialects/local/somalia.jpg",
    dialect: 'Somali Arabic (صومالي)',
    characterMale: { 
      nameAr: 'عبدي', 
      nameEn: 'Abdi', 
      clothingAr: 'المعوز الصومالي التقليدي.', 
      clothingEn: 'Traditional Somali Macawiis.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Somalia%20wearing%20traditional%20Macawiis%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'حليمة', 
      nameEn: 'Halima', 
      clothingAr: 'الديرع الصومالي الملون.', 
      clothingEn: 'Colorful Somali Dirac.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Somalia%20wearing%20traditional%20colorful%20Dirac%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "تعلم (إسكا وارن، مرحبا) وتعرف على منارة مقديشو.", en: "Learn (Iska warran, Marhaba) and identify Mogadishu Lighthouse." },
      resident: { ar: "اطلب سمبوسة صومالية واسأل عن البهارات المستخدمة.", en: "Order Somali Sambuusa and ask about the spices used." },
      native: { ar: "ناقش التراث الشفهي الغني وثقافة الشعر الصومالي.", en: "Discuss the rich oral tradition and Somali poetry culture." }
    },
    culture: {
      factAr: 'يطل الصومال على المحيط الهندي ويمتلك شواطئ خلابة تمتد لمسافات طويلة.',
      factEn: 'Somalia overlooks the Indian Ocean and possesses stunning beaches that stretch for long distances.',
      items: [
        { nameAr: 'السمبوسة', nameEn: 'Sambusa', icon: '🥟', descAr: 'فطائر صومالية مقلية محشوة باللحم أو الخضار.', descEn: 'Fried Somali pastries stuffed with meat or vegetables.' },
        { nameAr: 'البخور', nameEn: 'Frankincense', icon: '💨', descAr: 'الصومال من أكبر منتجي البخور واللبان في العالم.', descEn: 'Somalia is one of the largest producers of frankincense and myrrh in the world.' },
        { nameAr: 'الإبل', nameEn: 'Camels', icon: '🐫', descAr: 'تعتبر الإبل جزءاً أساسياً من الثقافة والاقتصاد الصومالي.', descEn: 'Camels are an essential part of Somali culture and economy.' },
        { nameAr: 'منارة مقديشو', nameEn: 'Mogadishu Lighthouse', icon: '🗼', descAr: 'معلم تاريخي يطل على المحيط الهندي في العاصمة.', descEn: 'A historical landmark overlooking the Indian Ocean in the capital.' },
        { nameAr: 'المعوز', nameEn: 'Macawiis', icon: '👕', descAr: 'الزي التقليدي الرجالي الصومالي المريح والمشهور.', descEn: 'The comfortable and famous traditional Somali men\'s attire.' },
        { nameAr: 'الشعر الصومالي', nameEn: 'Somali Poetry', icon: '📜', descAr: 'يسمى الصومال "أمة الشعراء" لعراقة تراثهم الشفهي والشعري.', descEn: 'Somalia is called the "Nation of Poets" for its ancient oral and poetic heritage.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'إس كواران؟', roman: 'Is-ka-warran?', en: 'How are you?' },
      { fusha: 'شكراً', dialect: 'ماهادسانيد', roman: 'Mahadsanid', en: 'Thank you' },
      { fusha: 'أهلاً', dialect: 'سوكوداو', roman: 'Soo-dhowow', en: 'Welcome' },
      { fusha: 'نعم', dialect: 'هاه', roman: 'Hah', en: 'Yes' },
      { fusha: 'لا', dialect: 'مايا', roman: 'Maya', en: 'No' },
      { fusha: 'الآن', dialect: 'هاتان', roman: 'Hattan', en: 'Now' },
      { fusha: 'أين؟', dialect: 'هالكي؟', roman: 'Halkee?', en: 'Where?' },
      { fusha: 'ماذا؟', dialect: 'ماي؟', roman: 'Maay?', en: 'What?' },
      { fusha: 'بسرعة', dialect: 'دهكسو', roman: 'Deg-deg', en: 'Fast' },
      { fusha: 'جميل', dialect: 'قركس', roman: 'Qurux', en: 'Beautiful' }
    ],
    dialogue: {
      title: 'الترحيب',
      lines: [
        { role: 'Local', ar: 'أهلاً بك في مقديشو.', dialect: 'سوكوداو مقديشو، نورتنا.', en: 'Welcome to Mogadishu, you honored us.' },
        { role: 'Visitor', ar: 'شكراً، أنا سعيد بزيارتي.', dialect: 'ماهادسانيد، أنا فرحان وايد.', en: 'Thank you, I am very happy.' }
      ]
    }
  },
  {
    id: 'djibouti',
    nameAr: 'جيبوتي',
    nameEn: 'Djibouti',
    flag: '🇩🇯',
    image: "/images/dialects/local/djibouti.jpg",
    dialect: 'Djiboutian (جيبوتي)',
    characterMale: { 
      nameAr: 'برخاد', 
      nameEn: 'Barkhad', 
      clothingAr: 'المعوز الجيبوتي التقليدي.', 
      clothingEn: 'Traditional Djiboutian Macawiis.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Djibouti%20wearing%20traditional%20Macawiis%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'خضراء', 
      nameEn: 'Khadra', 
      clothingAr: 'الديرع الجيبوتي الملون.', 
      clothingEn: 'Colorful Djiboutian Dirac.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Djibouti%20wearing%20traditional%20Dirac%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "تعلم (إسكا وارن، مرحبا) وتعرف على بحيرة عسل.", en: "Learn (Iska warran, Marhaba) and identify Lake Assal." },
      resident: { ar: "اطلب طبق سكوديهكاريس واسأل عن طريقة تحضير اللحم.", en: "Order Skoudehkaris and ask about meat preparation." },
      native: { ar: "ناقش الأهمية الاستراتيجية لمضيق باب المندب.", en: "Discuss the strategic importance of Bab-el-Mandeb strait." }
    },
    culture: {
      factAr: 'جيبوتي تضم بحيرة عسل، وهي أخفض نقطة في أفريقيا وتتميز بملوحتها العالية جداً.',
      factEn: 'Djibouti hosts Lake Assal, the lowest point in Africa, known for its extremely high salinity.',
      items: [
        { nameAr: 'السمك المشوي', nameEn: 'Grilled Fish', icon: '🐟', descAr: 'يشتهر المطبخ الجيبوتي بالسمك الطازج المشوي على الفحم.', descEn: 'Djiboutian cuisine is famous for fresh charcoal-grilled fish.' },
        { nameAr: 'الميناء', nameEn: 'The Port', icon: '🚢', descAr: 'ميناء جيبوتي هو بوابة تجارية هامة تربط أفريقيا بالعالم.', descEn: 'Djibouti Port is an important trade gateway connecting Africa to the world.' },
        { nameAr: 'التنوع الثقافي', nameEn: 'Diversity', icon: '🌍', descAr: 'مزيج فريد من الثقافات العربية والأفريقية والفرنسية.', descEn: 'A unique blend of Arabic, African, and French cultures.' },
        { nameAr: 'بحيرة عسل', nameEn: 'Lake Assal', icon: '🌊', descAr: 'بحيرة بركانية مالحة تحيط بها مناظر طبيعية خلابة.', descEn: 'A salty volcanic lake surrounded by stunning natural landscapes.' },
        { nameAr: 'مضيق باب المندب', nameEn: 'Bab-el-Mandeb', icon: '🗺️', descAr: 'ممر مائي استراتيجي عالمي يقع قبالة سواحل جيبوتي.', descEn: 'A global strategic waterway located off the coast of Djibouti.' },
        { nameAr: 'المعوز الجيبوتي', nameEn: 'Djiboutian Macawiis', icon: '👕', descAr: 'الزي التقليدي المريح الذي يرتديه الرجال في جيبوتي.', descEn: 'The comfortable traditional attire worn by men in Djibouti.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'واش راك؟', roman: 'Wash rak?', en: 'How are you?' },
      { fusha: 'بخير', dialect: 'لاباس', roman: 'Labas', en: 'Fine' },
      { fusha: 'شكراً', dialect: 'يسلمك', roman: 'Yisallimak', en: 'Thank you' },
      { fusha: 'نعم', dialect: 'إيه', roman: 'Iyeh', en: 'Yes' },
      { fusha: 'لا', dialect: 'لا / لالا', roman: 'La / Lala', en: 'No' },
      { fusha: 'الآن', dialect: 'دوكا', roman: 'Douka', en: 'Now' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'ماذا؟', dialect: 'وشنو؟', roman: 'Washno?', en: 'What?' },
      { fusha: 'بسرعة', dialect: 'بسرعة', roman: 'B-sur\'a', en: 'Fast' },
      { fusha: 'كثيراً', dialect: 'بزاف', roman: 'Bezzaf', en: 'A lot' }
    ],
    dialogue: {
      title: 'في الميناء',
      lines: [
        { role: 'Worker', ar: 'هل تحتاج مساعدة؟', dialect: 'تحتاج معاونة خويا؟', en: 'Do you need help brother?' },
        { role: 'Tourist', ar: 'نعم، أين أجد التاكسي؟', dialect: 'إيه، وين نلقى الطاكسي؟', en: 'Yes, where can I find a taxi?' }
      ]
    }
  },
  {
    id: 'comoros',
    nameAr: 'جزر القمر',
    nameEn: 'Comoros',
    flag: '🇰🇲',
    image: "/images/dialects/local/comoros.jpg",
    dialect: 'Comorian (قمري)',
    characterMale: { 
      nameAr: 'سعيد', 
      nameEn: 'Said', 
      clothingAr: 'الكانزو القمري مع الكوفية.', 
      clothingEn: 'Comorian Kanzu with Kofia.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Comoros%20wearing%20traditional%20white%20Kanzu%20and%20Kofia%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'نورة', 
      nameEn: 'Noura', 
      clothingAr: 'الشيروماني القمري التقليدي.', 
      clothingEn: 'Traditional Comorian Chiromani.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Comoros%20wearing%20traditional%20colorful%20Chiromani%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "تعلم (باريزا، مرحبا) وتعرف على جبل كارتالا.", en: "Learn (Bariza, Marhaba) and identify Mount Karthala." },
      resident: { ar: "اطلب طبق جراد البحر بالفانيليا واسأل عن موسم الحصاد.", en: "Order Vanilla Lobster and ask about the vanilla harvest." },
      native: { ar: "ناقش تاريخ جزر العطور وتجارة التوابل العالمية.", en: "Discuss the Perfume Islands history and spice trade." }
    },
    culture: {
      factAr: 'تلقب جزر القمر بـ "جزر العطور" بسبب إنتاجها الوفير للزهور العطرية مثل اليلانغ يلانغ.',
      factEn: 'Comoros is nicknamed the "Perfume Islands" due to its abundant production of aromatic flowers like Ylang-Ylang.',
      items: [
        { nameAr: 'الفانيليا', nameEn: 'Vanilla', icon: '🍦', descAr: 'تعد جزر القمر من أكبر منتجي الفانيليا الطبيعية في العالم.', descEn: 'Comoros is one of the largest producers of natural vanilla in the world.' },
        { nameAr: 'البركان', nameEn: 'Volcano', icon: '🌋', descAr: 'بركان القرطالة النشط هو أعلى قمة في الجزر.', descEn: 'The active Mount Karthala is the highest peak in the islands.' },
        { nameAr: 'السلاحف', nameEn: 'Turtles', icon: '🐢', descAr: 'تعتبر الجزر موطناً هاماً للسلاحف البحرية الخضراء.', descEn: 'The islands are an important home for green sea turtles.' },
        { nameAr: 'اليلانغ يلانغ', nameEn: 'Ylang-Ylang', icon: '🌼', descAr: 'زهرة عطرية تستخدم في صناعة أرقى العطور العالمية.', descEn: 'An aromatic flower used in the production of the finest global perfumes.' },
        { nameAr: 'الكانزو', nameEn: 'Kanzu', icon: '👕', descAr: 'الزي التقليدي الرجالي الأبيض الذي يلبس في المناسبات.', descEn: 'The white traditional men\'s attire worn on occasions.' },
        { nameAr: 'الشواطئ الرملية', nameEn: 'Sandy Beaches', icon: '🏖️', descAr: 'تتميز الجزر بشواطئ بيضاء مذهلة ومياه فيروزية صافية.', descEn: 'The islands feature stunning white beaches and clear turquoise waters.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'هباري؟', roman: 'Habari?', en: 'How are you?' },
      { fusha: 'بخير', dialect: 'ندجيزا', roman: 'Ndjema', en: 'Fine' },
      { fusha: 'شكراً', dialect: 'ماراحابا', roman: 'Marahaba', en: 'Thank you' },
      { fusha: 'نعم', dialect: 'إيوه', roman: 'Ewa', en: 'Yes' },
      { fusha: 'لا', dialect: 'أها', roman: 'Aha', en: 'No' },
      { fusha: 'الآن', dialect: 'هاتان', roman: 'Hattan', en: 'Now' },
      { fusha: 'أين؟', dialect: 'هالكي؟', roman: 'Halkee?', en: 'Where?' },
      { fusha: 'ماذا؟', dialect: 'هباري؟', roman: 'Habari?', en: 'What?' },
      { fusha: 'بسرعة', dialect: 'دهكسو', roman: 'Deg-deg', en: 'Fast' },
      { fusha: 'جميل', dialect: 'قركس', roman: 'Qurux', en: 'Beautiful' }
    ],
    dialogue: {
      title: 'اللقاء الصباحي',
      lines: [
        { role: 'Friend A', ar: 'صباح الخير، كيف حالك؟', dialect: 'هباري زاسوبو؟ ندجيزا؟', en: 'Good morning, how are you? Good?' },
        { role: 'Friend B', ar: 'بخير والحمد لله.', dialect: 'ندجيزا، ماراحابا.', en: 'Fine, thank you.' }
      ]
    }
  }
];


// Keep decoded first-row photographs ready for immediate navigation and return visits.
const dialectWarmups = new Map<string, Promise<void>>();
const dialectFirstRow = new Map<string, HTMLImageElement>();
const warmDialectImage = (url: string, keepDecoded = false): Promise<void> => {
  if (typeof Image === 'undefined') return Promise.resolve();
  const existing = dialectWarmups.get(url);
  if (existing) return existing;
  const image = new Image();
  image.decoding = 'async';
  const promise = new Promise<void>(resolve => {
    image.onload = () => {
      if (keepDecoded) dialectFirstRow.set(url, image);
      if (typeof image.decode === 'function') void image.decode().catch(() => {}).then(() => resolve());
      else resolve();
    };
    image.onerror = () => resolve();
    image.src = url;
  });
  dialectWarmups.set(url, promise);
  return promise;
};

/** Use at idle on Home and immediately on /dialects. Never start all 22 images at once. */
export const warmDialectGallery = (limit = 8): void => {
  if (typeof window === 'undefined') return;
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
  }).connection;
  const count = connection?.saveData || /^(slow-2g|2g)$/.test(connection?.effectiveType || '')
    ? Math.min(limit, 2) : Math.min(limit, 8);
  const urls = COUNTRY_DATA.slice(0, count).map(country => country.image);
  // Only the first four network images compete with the initial page assets.
  void Promise.all(urls.slice(0, 4).map(url => warmDialectImage(url, true)))
    .then(() => Promise.all(urls.slice(4).map(url => warmDialectImage(url, true))));
};

const LAYERED_DIALECT_PORTRAITS: Record<string, readonly string[]> = {
  uae: ['zayed-stance-v1.webp', 'maitha-stance-v1.webp'],
  egypt: ['ahmed-stance-v2.webp', 'fatima-stance-v2.webp'],
  saudi: ['salman-stance-v2.webp', 'sara-stance-v2.webp'],
  morocco: ['yassine-stance-v1.webp', 'kenza-stance-v1.webp'],
  lebanon: ['jad-stance-v1.webp', 'layla-stance-v1.webp'],
  iraq: ['sinan-stance-v1.webp', 'zeina-stance-v1.webp'],
  tunisia: ['sami-stance-v1.webp', 'ons-stance-v1.webp'],
  algeria: ['amin-stance-v1.webp', 'meriem-stance-v1.webp'],
  libya: ['omar-stance-v1.webp', 'fatimaLibya-stance-v1.webp'],
  jordan: ['nashmi-stance-v1.webp', 'haya-stance-v1.webp']
};
const warmCountryPortraits = (countryId: string): void => {
  const portraits = LAYERED_DIALECT_PORTRAITS[countryId];
  const urls = portraits
    ? portraits.map(file => '/avatars/' + file)
    : ['male', 'female'].map(gender => '/avatars/original-rigs/' + countryId + '/' + gender + '/cutout.webp');
  urls.forEach(url => { void warmDialectImage(url); });
};

// Keep landmark subjects visible when the country cards crop images on phones and tablets.
const COUNTRY_PHOTO_FOCUS: Record<string, string> = {
  uae: 'center 47%',
  egypt: 'center 57%',
  saudi: 'center 48%',
  morocco: 'center 52%',
  jordan: 'center 45%',
  lebanon: 'center 47%',
  palestine: 'center 43%',
  iraq: 'center 55%',
  tunisia: 'center 47%',
  algeria: 'center 48%',
  libya: 'center 44%',
  syria: 'center 45%',
  sudan: 'center 55%',
  oman: 'center 50%',
  kuwait: 'center 44%',
  qatar: 'center 45%',
  bahrain: 'center 52%',
  yemen: 'center 52%',
  mauritania: 'center 54%',
  somalia: 'center 45%',
  djibouti: 'center 53%',
  comoros: 'center 52%',
};

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  noBg?: boolean;
}

const SafeImage: React.FC<SafeImageProps> = (props) => {
  const [useFallback, setUseFallback] = React.useState(false);
  const [completelyFailed, setCompletelyFailed] = React.useState(false);
  const { className, src, alt, noBg, ...rest } = props;

  const fallbackSrc = `https://picsum.photos/seed/${encodeURIComponent(alt || 'landmark')}/1200/800`;

  const handleError = () => {
    if (!useFallback) {
      console.warn(`Primary image failed, switching to fallback: ${src}`);
      setUseFallback(true);
    } else {
      console.error(`Both primary and fallback failed: ${src}`);
      setCompletelyFailed(true);
    }
  };

  if (completelyFailed || !src) {
    return (
      <div className={`bg-slate-100 flex flex-col items-center justify-center p-4 text-slate-300 min-h-[150px] ${className || ''}`}>
        <Globe size={32} strokeWidth={1} className="mb-2 opacity-30" />
        <span className="text-[8px] font-black uppercase tracking-widest opacity-30">{alt || 'Landmark'}</span>
      </div>
    );
  }

  return (
    <img
      src={useFallback ? fallbackSrc : src}
      alt={alt}
      {...rest}
      className={`${noBg ? 'bg-transparent' : 'bg-slate-50'} transition-all duration-300 ${className || ''}`}
      onError={handleError}
    />
  );
};

export const Dialects: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const staffVoiceLab = profile?.role === 'teacher' || profile?.role === 'admin';
  const { profiles: tutorVoices } = useDialectVoiceProfiles();
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  React.useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  
  React.useEffect(() => { warmDialectGallery(); }, []);
  const portraitWarmupTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => {
    if (portraitWarmupTimer.current !== null) clearTimeout(portraitWarmupTimer.current);
  }, []);
  const cancelPortraitWarmup = () => {
    if (portraitWarmupTimer.current !== null) clearTimeout(portraitWarmupTimer.current);
    portraitWarmupTimer.current = null;
  };
  const schedulePortraitWarmup = (countryId: string) => {
    cancelPortraitWarmup();
    portraitWarmupTimer.current = setTimeout(() => {
      warmCountryPortraits(countryId);
      portraitWarmupTimer.current = null;
    }, 140);
  };
  const [selectedCountry, setSelectedCountry] = React.useState<any>(null);
  const selectedCountryRef = React.useRef<any>(null);
  selectedCountryRef.current = selectedCountry;
  const [selectedPersona, setSelectedPersona] = React.useState<any>(null);
  const [chatMessages, setChatMessages] = React.useState<{role: string, text: string, translationEn?: string, speakerName?: string, liveTurnKey?: string}[]>([]);
  type LearningJourney = { turns: {role: string; text: string; translationEn?: string; speakerName?: string}[]; lastPracticed: string; visits: number };
  const [learningJourneys, setLearningJourneys] = React.useState<Record<string, LearningJourney>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('qul_dialect_learning_journeys_v1') || '{}');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch { return {}; }
  });
  const learningJourneysRef = React.useRef(learningJourneys);
  learningJourneysRef.current = learningJourneys;
  React.useEffect(() => {
    try { localStorage.setItem('qul_dialect_learning_journeys_v1', JSON.stringify(learningJourneys)); } catch (_) {}
  }, [learningJourneys]);
  const updateJourney = (countryId: string, turn: {role: string; text: string; translationEn?: string; speakerName?: string}) => {
    if (!countryId || !turn.text.trim()) return;
    setLearningJourneys(previous => ({
      ...previous,
      [countryId]: {
        turns: [...(previous[countryId]?.turns || []), turn].slice(-24),
        lastPracticed: new Date().toISOString(),
        visits: previous[countryId]?.visits || 1
      }
    }));
  };
  const [chatInput, setChatInput] = React.useState('');
  const [isChatLoading, setIsChatLoading] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [currentSpeechText, setCurrentSpeechText] = React.useState<string>('');
  const [isListening, setIsListening] = React.useState(false);
  const [isLiveActive, setIsLiveActive] = React.useState(false);
  const [audioLevel, setAudioLevel] = React.useState(0);
  const liveSessionRef = React.useRef<any>(null);
  // V2 passports are awarded by assessed mission mastery. Old message-count
  // rankings remain untouched in legacy storage but do not unlock new passports.
  const [passportLevels, setPassportLevels] = React.useState<Record<string, number>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('qul_dialect_passports_v2') || '{}');
      return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
    } catch { return {}; }
  });
  const passportLevelsRef = React.useRef(passportLevels);
  passportLevelsRef.current = passportLevels;
  const missionEvidenceRef = React.useRef<Record<string, MissionTurn[]>>({});
  const lastAssessmentCountRef = React.useRef<Record<string, number>>({});
  const assessmentPendingRef = React.useRef(false);
  const liveInputBufferRef = React.useRef('');
  const [passportFocusId, setPassportFocusId] = React.useState<string | null>(null);
  const [recentStamp, setRecentStamp] = React.useState<{countryId: string; level: number} | null>(null);
  const [isPassportOpen, setIsPassportOpen] = React.useState(false);
  const [mobileCountryPanel, setMobileCountryPanel] = React.useState<'stage' | 'reference'>('stage');
  const [tutorSuccess, setTutorSuccess] = React.useState<{ countryId: string; personaName: string; count: number } | null>(null);

  const getTutorGreeting = (countryId: string, char: any, isFemale: boolean, language: 'ar' | 'en') => {
    if (language === 'en') {
      return `Hello! I'm ${char.nameEn}, your virtual tutor. Ask me anything in our dialect!`;
    }
    switch (countryId) {
      case 'egypt':
        return isFemale
          ? `أهلاً وسهلاً بيك يا فنان! أنا مريم، إزيك النهاردة؟ جاهز نتكلم مصري؟`
          : `يا هلا بيك يا باشا! أنا أحمد، منور مصر. عايز تتعلم إيه النهاردة؟`;
      case 'saudi':
        return isFemale
          ? `يا هلا والله ومسهلا! أنا سارة، وش علومك اليوم؟ جاهز نتعلم لهجتنا؟`
          : `حياك الله يا هلا! أنا سلمان، نورتنا والله، وش ودك نسولف فيه اليوم؟`;
      case 'uae':
        return isFemale
          ? `يا مرحبا ومسهلا فيك! أنا ميثاء، شحالك وعساك بخير؟`
          : `مرحبا الساع يا مرحبا! أنا زايد، يسعدني أسولف وياك بالرمسة الإماراتية.`;
      case 'kuwait':
        return isFemale
          ? `يا هلا وغلا فيك! أنا دلال، شلونك وشخبارك؟ حياك الله.`
          : `هلا بالحبيب! أنا عبدالله، شلونك اليوم؟ جاهز نسولف كويتي؟`;
      case 'morocco':
        return isFemale
          ? `مرحبا بيك أ خويا! أنا فاطمة، كيداير لاباس عليك؟ كولشي مزيان؟`
          : `أهلاً وسهلاً بيك! أنا يوسف، مرحبا بيك في المغرب، كيداير مع الصحة؟`;
      case 'syria':
        return isFemale
          ? `أهلاً وسهلاً يا مية هلا! أنا شام، يسعد أوقاتك يا رب، شو بتحب نحكي اليوم؟`
          : `يا مية أهلاً وسهلاً! أنا طارق، كيفك وشو أخبارك اليوم يا غالي؟`;
      case 'iraq':
        return isFemale
          ? `كل الهلا بيك عيوني! أنا مريم، شلونك وأحوالك؟ مشتاقين.`
          : `يا هلا بيك وكل الهلا! أنا علي، شلون صحتك وأحوالك؟ نورتنا.`;
      case 'lebanon':
        return isFemale
          ? `هاي كيفك؟ أنا ياسمين، شو أخبارك اليوم؟ كتير مبسوطة إني عم احكي معك.`
          : `أهلاً بالحبيب! أنا رامي، كيفك اليوم؟ شو عبالك نحكي؟`;
      default:
        return isFemale
          ? `أهلاً وسهلاً بك! أنا ${char.nameAr}، يسعدني جداً أن أكون معلمتك الافتراضية للتحدث والتفاعل معك.`
          : `مرحباً بك يا صديقي! أنا ${char.nameAr}، معلمك الافتراضي، جاهز للتحدث والتفاعل معك في أي وقت!`;
    }
  };

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const lipSyncRef = React.useRef<SpeechLipSync | null>(null);
  if (!lipSyncRef.current) lipSyncRef.current = new SpeechLipSync();
  const recognitionRef = React.useRef<any>(null);
  const micCleanupRef = React.useRef<(() => void) | null>(null);
  const liveAudioSourcesRef = React.useRef<Set<AudioBufferSourceNode>>(new Set());
  const oneShotSourceRef = React.useRef<AudioBufferSourceNode | null>(null);
  const oneShotGenerationRef = React.useRef(0);
  const liveGenerationRef = React.useRef(0);
  const livePlaybackVersionRef = React.useRef(0);
  const livePlaybackHeadRef = React.useRef(0);
  const liveDecodeQueueRef = React.useRef<Promise<void>>(Promise.resolve());
  const liveConnectingRef = React.useRef(false);
  const isLiveActiveRef = React.useRef(false);

  const getAudioContext = () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // A single owner for pre-generated speech and a separate serialized live stream.
  // Cancel pending TTS generation as well as already-playing audio.
  const stopOneShotAudio = React.useCallback(() => {
    oneShotGenerationRef.current++;
    lipSyncRef.current?.clear('oneShot');
    const playing = oneShotSourceRef.current;
    oneShotSourceRef.current = null;
    if (playing) {
      playing.onended = null;
      try { playing.stop(); } catch (_) { /* Already stopped */ }
      try { playing.disconnect(); } catch (_) { /* Already disconnected */ }
    }
    setIsSpeaking(false);
    setCurrentSpeechText('');
  }, []);

  const clearLiveAudio = React.useCallback(() => {
    livePlaybackVersionRef.current++;
    lipSyncRef.current?.clear('live');
    livePlaybackHeadRef.current = 0;
    for (const source of liveAudioSourcesRef.current) {
      source.onended = null;
      try { source.stop(); } catch (_) { /* Already finished */ }
      try { source.disconnect(); } catch (_) { /* Already disconnected */ }
    }
    liveAudioSourcesRef.current.clear();
    setIsSpeaking(false);
  }, []);

  const stopLiveConversation = React.useCallback(() => {
    liveGenerationRef.current++;
    isLiveActiveRef.current = false;
    liveConnectingRef.current = false;
    const session = liveSessionRef.current;
    liveSessionRef.current = null;
    if (session) {
      try { session.close(); } catch (_) { /* Session already closed */ }
    }
    if (micCleanupRef.current) {
      micCleanupRef.current();
      micCleanupRef.current = null;
    }
    clearLiveAudio();
    stopOneShotAudio();
    setIsLiveActive(false);
    setIsListening(false);
    setAudioLevel(0);
  }, [clearLiveAudio, stopOneShotAudio]);

  React.useEffect(() => {
    return () => {
      lipSyncRef.current?.clear();
      oneShotGenerationRef.current++; liveGenerationRef.current++; livePlaybackVersionRef.current++;
      isLiveActiveRef.current = false;
      micCleanupRef.current?.();
      for (const source of [...liveAudioSourcesRef.current, oneShotSourceRef.current]) {
        if (!source) continue;
        source.onended = null;
        try { source.stop(); source.disconnect(); } catch (_) {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (liveSessionRef.current) {
        liveSessionRef.current.close();
      }
    };
  }, []);

  React.useEffect(() => {
    localStorage.setItem('qul_dialect_passports_v2', JSON.stringify(passportLevels));
  }, [passportLevels]);

  React.useEffect(() => {
    if (!recentStamp) return;
    const id = window.setTimeout(() => setRecentStamp(null), 3500);
    return () => window.clearTimeout(id);
  }, [recentStamp]);

  React.useEffect(() => {
    // Reset state and auto-select default tutor when country opens
    setChatInput('');
    setMobileCountryPanel('stage');
    if (selectedCountry) {
      const defaultChar = selectedCountry.characterMale;
      setSelectedPersona(defaultChar);
      const greetingText = lang === 'ar'
        ? `مرحباً بك في ${selectedCountry.nameAr}! أنا ${defaultChar.nameAr}، يسعدني التحدث معك بلهجتنا.`
        : `Welcome to ${selectedCountry.nameEn}! I'm ${defaultChar.nameEn}, happy to chat in our dialect.`;
      // Greeting remains available as speech from the selected tutor, not as a duplicate chat tile.
      const previousJourney = learningJourneysRef.current[selectedCountry.id];
      setChatMessages(previousJourney?.turns || []);
      setLearningJourneys(previous => ({
        ...previous,
        [selectedCountry.id]: {
          turns: previous[selectedCountry.id]?.turns || [],
          lastPracticed: previous[selectedCountry.id]?.lastPracticed || '',
          visits: (previous[selectedCountry.id]?.visits || 0) + 1
        }
      }));
    } else {
      setSelectedPersona(null);
      setChatMessages([]);
    }
    // Switching destinations or languages cancels the previous tutor's
    // pending speech and live session, including audio still being generated.
    stopLiveConversation();
  }, [selectedCountry, lang, stopLiveConversation]);

  const startSTT = () => {
    if (recognitionRef.current) return;
    if (isLiveActiveRef.current || liveConnectingRef.current) stopLiveConversation();
    stopOneShotAudio();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    // Browser speech recognizers use the country's locale where available.
    const speechLocales: Record<string, string> = {
      uae: 'ar-AE', egypt: 'ar-EG', saudi: 'ar-SA', morocco: 'ar-MA',
      algeria: 'ar-DZ', tunisia: 'ar-TN', libya: 'ar-LY', jordan: 'ar-JO',
      palestine: 'ar-PS', iraq: 'ar-IQ', lebanon: 'ar-LB', syria: 'ar-SY',
      sudan: 'ar-SD', oman: 'ar-OM', yemen: 'ar-YE', kuwait: 'ar-KW',
      qatar: 'ar-QA', bahrain: 'ar-BH', mauritania: 'ar-MR',
      somalia: 'ar-SO', djibouti: 'ar-DJ', comoros: 'ar-KM'
    };
    recognition.lang = inferLearnerLanguage(chatInput, lang) === 'en'
      ? 'en-US' : (speechLocales[selectedCountry?.id] || 'ar-SA');
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
    };

    recognition.start();
  };

  const missionKey = (countryId: string, level: number) => countryId + ':' + level;

  const awardPassportStamp = (countryId: string, stage: number) => {
    const current = Math.max(0, Math.min(3, passportLevelsRef.current[countryId] || 0));
    if (current !== stage - 1) return;
    const updated = { ...passportLevelsRef.current, [countryId]: stage };
    passportLevelsRef.current = updated;
    setPassportLevels(updated);
    setRecentStamp({ countryId, level: stage });
    // The actual selected tutor receives the achievement animation in every country.
    if (selectedCountryRef.current?.id === countryId && selectedPersona) {
      setTutorSuccess(previous => ({
        countryId,
        personaName: selectedPersona.nameEn,
        count: (previous?.count || 0) + 1
      }));
    }
  };

  const checkMissionCompletion = async (country: any, level: number) => {
    if (!country || level >= 3 || assessmentPendingRef.current) return;
    if ((passportLevelsRef.current[country.id] || 0) !== level) return;
    const stage = Math.min(3, level + 1) as 1 | 2 | 3;
    const key = missionKey(country.id, stage);
    const evidence = missionEvidenceRef.current[key] || [];
    const authored = evidence.filter(turn => turn.role === 'user' && turn.authored === true);
    // Avoid repeated API calls after every short utterance or prompt button.
    if (new Set(authored.map(turn => turn.text.trim().toLowerCase())).size < 2) return;
    if (authored.length - (lastAssessmentCountRef.current[key] || 0) < 2) return;
    lastAssessmentCountRef.current[key] = authored.length;
    assessmentPendingRef.current = true;
    try {
      const mission = stage === 1 ? country.missions.visitor.ar
        : stage === 2 ? country.missions.resident.ar : country.missions.native.ar;
      const assessment = await assessDialectMission({
        country: country.nameAr,
        dialect: country.dialect,
        mission,
        stage,
        turns: evidence.slice()
      });
      if (assessment.completed && (passportLevelsRef.current[country.id] || 0) === level) {
        awardPassportStamp(country.id, stage);
      }
    } finally {
      assessmentPendingRef.current = false;
    }
  };

  const captureMissionTurn = (countryId: string, turn: MissionTurn) => {
    const nextStage = Math.min(3, (passportLevelsRef.current[countryId] || 0) + 1);
    const key = missionKey(countryId, nextStage);
    if (!missionEvidenceRef.current[key]) missionEvidenceRef.current[key] = [];
    missionEvidenceRef.current[key].push(turn);
  };

  const handleAIChat = async (overrideInput?: string, persona?: any) => {
    const input = overrideInput || chatInput;
    if (!input.trim() || isChatLoading) return;
    
    const currentPersona = persona || selectedPersona;
    if (!currentPersona) return;

    if (isLiveActiveRef.current || liveConnectingRef.current) stopLiveConversation();
    stopOneShotAudio();
    const userMsg = input;
    const countryForTurn = selectedCountry;
    if (!overrideInput) setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    updateJourney(countryForTurn.id, { role: 'user', text: userMsg });
    captureMissionTurn(countryForTurn.id, { role: 'user', text: userMsg, authored: !overrideInput });
    setIsChatLoading(true);

    try {
      const ai = getAI();
      
      const rank = passportLevelsRef.current[selectedCountry.id] || 0;
      const missions = (selectedCountry as any).missions;
      const currentMission = missions ? (rank === 0 ? (lang === 'ar' ? missions.visitor.ar : missions.visitor.en) : rank === 1 ? (lang === 'ar' ? missions.resident.ar : missions.resident.en) : (lang === 'ar' ? missions.native.ar : missions.native.en)) : "Learn the dialect";

      const journey = learningJourneysRef.current[countryForTurn.id];
      const priorTurns = journey?.turns || [];
      const returning = (journey?.visits || 0) > 1 && priorTurns.length > 0;
      const countryPolicy = buildDialectTutorPolicy({ countryName: countryForTurn.nameEn, dialect: countryForTurn.dialect, tutorName: currentPersona.nameEn, history: priorTurns, learnerLanguage: inferLearnerLanguage(userMsg), culture: countryForTurn.culture, vocabulary: countryForTurn.vocab });
      const systemPrompt = `LEARNER CONTINUITY: ${returning ? 'RETURNING LEARNER. Do not introduce yourself again. Continue from previous practice, briefly acknowledge their return, and offer the next small step.' : 'New learner: respond to their first question naturally, without assuming proficiency or forcing greetings.'}
      Last practice: ${journey?.lastPracticed || 'not recorded'}.
      Recent learner history: ${JSON.stringify(priorTurns.slice(-12))}.
      LANGUAGE SELECTION IS AUTOMATIC AND MANDATORY: Determine the language of the student's CURRENT utterance, not the website UI or the chosen country. If the learner says Hi, Hello, How are you, or speaks primarily English, immediately respond in clear spoken ENGLISH, even if no explicit request for English was made. Briefly model ONE local Arabic expression with its English meaning. If the learner speaks primarily Arabic, reply in simple local Arabic, not English by default. If they stop, hesitate, say they do not understand, repeatedly give one-word responses, or explicitly switch to English, immediately provide English explanation without waiting for them to insist. Reassess language at EACH turn and allow switching back and forth. The tutor must never assume Arabic fluency after a memorized phrase.
      LEARNER LEVEL: A single correct dialect greeting NEVER proves fluency. Treat prior known phrases as isolated knowledge. If they greet you in Arabic, answer naturally in the local dialect with ONE short phrase and its easy English meaning, then ask a very simple question. If they hesitate, switch immediately to supportive English, model one phrase and ask them to repeat it. Never shame the learner or restart the whole lesson. Match the language of their most recent message; English-language questions get English guidance with small Arabic examples.
      DISTINGUISH PASSPORT STAMPS FROM LANGUAGE PROFICIENCY. The passport stage is not a CEFR grade; keep scaffolding even after earning stamps.
      Teach one item per turn, check comprehension, and remember what was already practiced.
      You are ${currentPersona.nameEn} from ${selectedCountry.nameEn}, acting as a helpful and patient language teacher.
      Your FIRST goal is to let a complete beginner discover and practice the selected country's dialect. Only AFTER the learner understands and tries basic expressions should you naturally introduce the passport mission. Learning the dialect is the purpose; the mission is a motivating application, never the opening topic.
      
      CURRENT MISSION: ${currentMission}
      STUDENT RANK: ${rank === 0 ? 'Visitor (Beginner)' : rank === 1 ? 'Resident (Intermediate)' : 'Native Spirit (Advanced)'}
      
      CRITICAL RULES:
      1. LANGUAGE BRIDGE: If the student writes in English, says they cannot speak Arabic, or requests an explanation in English, respond in clear, friendly ENGLISH first. Then teach ONE short, authentic ${selectedCountry.dialect} Arabic expression, explain exactly what it means in English, and invite them to try it. Never reply with unexplained Arabic to a complete beginner. If the student is comfortable in Arabic, teach conversationally in the local dialect.
      2. ERROR CORRECTION: If the student answers a question incorrectly, makes a grammatical mistake, or uses a word that doesn't fit the dialect, you MUST gently correct them. Provide the correct word/phrase in ${selectedCountry.dialect} and explain it simply.
      3. ADAPTIVE TEACHING AND ENGLISH SUPPORT:
         - Detect when the learner asks in English, says "I don't understand", goes off track, or struggles repeatedly.
         - Understand the student's English fully. Do not punish a learner for using English to seek help.
         - Teach authentic, age-appropriate ${selectedCountry.dialect} phrases; allow a simple English explanation in dialectText when the learner needs English support. Provide an accurate translationEn for each Arabic example.
         - When confused, explain the next step in plain English first, then model the simplest possible local Arabic expression and ask ONE manageable question.
         - After English assistance, invite the learner to try the local Arabic phrase, without pretending the learner has completed the mission.
         - Do not give long lectures, complex expressions, or several questions at once. Do not promote to a travel mission merely because a fixed number of chat messages has been exchanged.
      4. VISITOR GUIDELINES (Rank 0):
         - Goal: visitor passport stamp. Greet someone appropriately and engage with the specific place/landmark in the mission.
         - Use A1 vocabulary: one short instruction or question, no more than 10 simple Arabic words per sentence.
         - Model a helpful answer if the student struggles; ask them to produce their own meaningful reply.
      5. RESIDENT GUIDELINES (Rank 1):
         - Explain the NEW resident mission explicitly in very simple local dialect before asking the student to complete its practical scenario.
         - Do not assume the student is more proficient simply because they earned a visitor stamp. Scaffold in small steps with examples.
      6. ADVANCED GUIDELINES (Rank 2):
         - Explain the current mission and progressively build independent conversation without overwhelming the learner.
      7. PROGRESS:
         - Celebrate progress briefly but never claim a passport stamp has been earned; the assessment system makes that decision.
         - Do not mistake copying a suggested response for independent completion.
      8. ACCURACY:
         - Use the selected country's dialect, not a generic Gulf or Modern Standard Arabic accent.
         - If a phrase varies across regions, prefer a common intelligible variant and avoid invented regional claims.

      For a new learner, respond to their actual question first, without demanding introductions or a greeting exercise. Let them explore local food, customs, history, clothing or daily life whenever they wish. Introduce a mission only if the learner asks or is ready. If the learner switches from the other tutor, continue their last topic without reintroducing yourself.
      OUTPUT: Return valid JSON with keys \"dialectText\" and \"translationEn\". For English-speaking beginners, dialectText can start with ONE short English reassurance/instruction followed by ONE local Arabic phrase; translationEn must explain the meaning of that phrase in plain English. For Arabic-ready students, dialectText contains simple local Arabic and translationEn is its accurate English translation. Do not translate the student message as if it were your reply.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          { role: 'user', parts: [{ text: countryPolicy + '\n' + systemPrompt }] },
          ...priorTurns.slice(-16).map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: { responseMimeType: 'application/json', temperature: 0.5 }
      });

      let modelText = 'أعتذر، حدث خطأ ما.';
      let translationEn = '';
      try {
        const payload = JSON.parse((response.text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
        if (typeof payload.dialectText === 'string' && payload.dialectText.trim()) modelText = payload.dialectText.trim();
        if (typeof payload.translationEn === 'string') translationEn = payload.translationEn.trim();
      } catch (parseError) {
        console.warn('Dialect reply was not valid bilingual JSON.', parseError);
      }
      setChatMessages(prev => [...prev, { role: 'model', text: modelText, translationEn, speakerName: currentPersona.nameAr }]);
      updateJourney(countryForTurn.id, { role: 'model', text: modelText, translationEn, speakerName: currentPersona.nameAr });
      captureMissionTurn(countryForTurn.id, { role: 'model', text: modelText });
      // Only authentic student work can unlock a passport. Never count prompts or replies.
      void checkMissionCompletion(countryForTurn, rank);
      void playAudio(modelText);
    } catch (error) {
      console.error("AI Chat Error:", error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const startLiveConversation = async (personaOverride?: any) => {
    const persona = personaOverride || selectedPersona;
    const country = selectedCountryRef.current;
    if (!persona || !country) return;
    // Rapid double-clicks must toggle even while the connection opens.
    if (isLiveActiveRef.current || liveConnectingRef.current) {
      stopLiveConversation();
      return;
    }
    stopOneShotAudio();
    clearLiveAudio();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    liveConnectingRef.current = true;
    const generation = ++liveGenerationRef.current;
    const stillCurrent = () => generation === liveGenerationRef.current;
    try {
      const { Modality } = await import("@google/genai");
      if (!stillCurrent()) return;
      const ai = getAI();
      const rank = passportLevelsRef.current[country.id] || 0;
      const missions = country.missions;
      const currentMission = missions ? (rank === 0 ? missions.visitor.ar : rank === 1 ? missions.resident.ar : missions.native.ar) : "Learn the dialect";
      const journey = learningJourneysRef.current[country.id];
      const returningLearner = (journey?.visits || 0) > 1 && (journey?.turns?.length || 0) > 0;
      const recentContext = (journey?.turns || []).slice(-10).map(t => t.role + ': ' + t.text.slice(0, 180)).join(' | ');
      const liveProfile = publishedVoice(tutorVoices, country.id, persona.nameEn === country.characterFemale.nameEn ? 'female' : 'male');
      const livePolicy = buildDialectTutorPolicy({ countryName: country.nameEn, dialect: country.dialect, tutorName: persona.nameEn, history: journey?.turns || [], learnerLanguage: inferLearnerLanguage((journey?.turns || []).filter(t => t.role === 'user').slice(-1)[0]?.text || '', 'en'), culture: country.culture, vocabulary: country.vocab });
      liveInputBufferRef.current = '';
      let liveTutorText = '';
      // Throttled progressive translation of live transcription snapshots.
      // A single in-flight request per speaker prevents high-frequency API bursts.
      let tutorTurnId = 0;
      let studentTurnId = 0;
      const liveTurnKey = (speaker: 'tutor' | 'student', id: number) => `${generation}:${speaker}:${id}`;
      const translationStreams: Record<'tutor' | 'student', {
        timer: ReturnType<typeof setTimeout> | null; busy: boolean;
        pending: { text: string; id: number } | null;
        lastRequested: string; lastId: number; lastDeliveredLength: number;
      }> = {
        tutor: { timer: null, busy: false, pending: null, lastRequested: '', lastId: -1, lastDeliveredLength: 0 },
        student: { timer: null, busy: false, pending: null, lastRequested: '', lastId: -1, lastDeliveredLength: 0 }
      };
      const requestTranslation = (speaker: 'tutor' | 'student', text: string, id: number, immediate = false) => {
        if (!text.trim() || !stillCurrent()) return;
        const queue = translationStreams[speaker];
        queue.pending = { text: text.trim().slice(0, 850), id };
        if (queue.timer) clearTimeout(queue.timer);
        const run = async () => {
          queue.timer = null;
          if (queue.busy || !queue.pending || !stillCurrent()) return;
          const snapshot = queue.pending;
          if (queue.lastRequested === snapshot.text && queue.lastId === snapshot.id) return;
          queue.pending = null;
          queue.lastRequested = snapshot.text;
          if (queue.lastId !== snapshot.id) queue.lastDeliveredLength = 0;
          queue.lastId = snapshot.id;
          queue.busy = true;
          try {
            const result = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: [{ role: 'user', parts: [{ text:
                'Translate the following live speech transcript into precise, natural ' +
                (/[\u0600-\u06ff]/.test(snapshot.text) ? 'English' : 'Arabic') +
                '. Preserve the meaning, names and local dialect. The transcript may end mid-sentence: ' +
                'translate only what is spoken, do not guess missing words. Output ONLY the translation.\\n' + snapshot.text
              }] }],
              config: { temperature: 0.1 }
            });
            const translation = (result.text || '').trim().slice(0, 1100);
            if (translation && stillCurrent() && selectedCountryRef.current?.id === country.id) {
              setChatMessages(prev => {
                const index = prev.map(msg => msg.liveTurnKey).lastIndexOf(liveTurnKey(speaker, snapshot.id));
                if (index < 0 || !prev[index].text.startsWith(snapshot.text)) return prev;
                // Keep a useful partial translation on screen while newer words arrive.
                // Never overwrite a newer result with a shorter, older snapshot.
                if (queue.lastDeliveredLength > snapshot.text.length && queue.lastId === snapshot.id) return prev;
                queue.lastDeliveredLength = snapshot.text.length;
                return prev.map((msg, i) => i === index ? { ...msg, translationEn: translation } : msg);
              });
            }
          } catch (error) {
            console.warn('Progressive live translation unavailable', error);
          } finally {
            queue.busy = false;
            if (queue.pending && stillCurrent()) {
              queue.timer = setTimeout(run, 180);
            }
          }
        };
        if (!queue.busy) queue.timer = setTimeout(run, immediate ? 0 : 350);
      };
      const flushLiveInput = () => {
        if (!stillCurrent()) return;
        const speech = liveInputBufferRef.current.replace(/\s+/g, ' ').trim();
        liveInputBufferRef.current = '';
        if (speech.length < 3) return;
        captureMissionTurn(country.id, { role: 'user', text: speech, authored: true });
        updateJourney(country.id, { role: 'user', text: speech });
        if (selectedCountryRef.current?.id === country.id) {
          const key = liveTurnKey('student', studentTurnId);
          setChatMessages(prev => [...prev, { role: 'user', text: speech, liveTurnKey: key }]);
          requestTranslation('student', speech, studentTurnId, true);
          studentTurnId++;
        }
        void checkMissionCompletion(country, passportLevelsRef.current[country.id] || 0);
      };
      const liveAI = await getLiveAI();
      if (!stillCurrent()) return;
      const sessionPromise = liveAI.live.connect({
        model: "gemini-3.8-live",
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: publishedVoice(tutorVoices, country.id, persona.nameEn === country.characterFemale.nameEn ? "female" : "male").voiceName } },
          },
          systemInstruction: livePolicy + '\nSpeaking delivery: ' + liveProfile.delivery + ', conversational, warm, and natural. Never change the local speaker identity when switching languages.\nCurrent optional practice mission (never rush or force it): ' + currentMission + '\n' +
            'A new audio session is NOT a new conversation. Continue the conversation in SHARED CHAT HISTORY even when the other tutor was speaking. ' +
            'Use only the active country dialect in Arabic, or intelligible English with the authentic local speaker accent when the student uses English. ' +
            'Reply to the learner naturally, and never force a greeting exercise or move to the mission before learner readiness.',
        },
        callbacks: {
          onopen: () => {
            if (!stillCurrent()) return;
            liveConnectingRef.current = false;
            isLiveActiveRef.current = true;
            setIsLiveActive(true);
            setIsListening(true);
            void sessionPromise.then(async session => {
              if (!stillCurrent()) return;
              const cleanup = await setupMicrophone(session);
              if (cleanup) {
                if (stillCurrent()) micCleanupRef.current = cleanup;
                else cleanup();
              }
            }).catch(console.error);
          },
          onmessage: (message: any) => {
            if (!stillCurrent()) return;
            const spokenText = message.serverContent?.inputTranscription?.text;
            if (typeof spokenText === 'string' && spokenText.trim()) {
              liveInputBufferRef.current += ' ' + spokenText.trim();
            }
            const tutorFragment = message.serverContent?.outputTranscription?.text;
            if (typeof tutorFragment === 'string' && tutorFragment.trim()) {
              // Native live transcription follows the generated voice in near real time.
              const fragment = tutorFragment.trim();
              // Live providers may send either deltas or cumulative transcript snapshots.
              // Avoid repeating words when the next snapshot already includes previous text.
              const previous = liveTutorText.trim();
              liveTutorText = fragment.startsWith(previous) && previous
                ? fragment
                : previous.endsWith(fragment) ? previous : (previous ? previous + ' ' + fragment : fragment);
              const caption = liveTutorText.trim();
              setCurrentSpeechText(caption);
              requestTranslation('tutor', caption, tutorTurnId);
              if (selectedCountryRef.current?.id === country.id) {
                const key = liveTurnKey('tutor', tutorTurnId);
                setChatMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'live-model' && last.liveTurnKey === key) return [...prev.slice(0, -1), { ...last, text: caption }];
                  return [...prev, { role: 'live-model', text: caption, speakerName: persona.nameAr, liveTurnKey: key }];
                });
              }
            }
            if (message.serverContent?.turnComplete) {
              if (liveInputBufferRef.current.trim()) flushLiveInput();
              const completedTutorReply = liveTutorText.trim();
              if (completedTutorReply) {
                requestTranslation('tutor', completedTutorReply, tutorTurnId, true);
                updateJourney(country.id, { role: 'model', text: completedTutorReply, speakerName: persona.nameAr });
              }
              liveTutorText = '';
              tutorTurnId++;
            }
            // An audio message may contain several independent PCM parts.
            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              const base64Audio = part?.inlineData?.data;
              if (typeof base64Audio === 'string' && base64Audio) {
                const version = livePlaybackVersionRef.current;
                liveDecodeQueueRef.current = liveDecodeQueueRef.current
                  .catch(() => {})
                  .then(() => playLiveAudio(base64Audio, generation, version, part.inlineData?.mimeType));
              }
            }
            if (message.serverContent?.interrupted) {
              clearLiveAudio();
              liveTutorText = '';
              tutorTurnId++;
              setCurrentSpeechText('');
            }
          },
          onclose: () => {
            if (!stillCurrent()) return;
            flushLiveInput();
            stopLiveConversation();
          },
          onerror: (e: any) => {
            if (!stillCurrent()) return;
            console.error("Live conversation audio error:", e);
            stopLiveConversation();
          }
        }
      });
      void sessionPromise.then(session => {
        if (stillCurrent()) liveSessionRef.current = session;
        else { try { session.close(); } catch (_) {} }
      }).catch(e => {
        if (stillCurrent()) {
          console.error('Live connection failed:', e);
          stopLiveConversation();
        }
      });
    } catch (err) {
      if (stillCurrent()) {
        console.error("Live connection error:", err);
        stopLiveConversation();
      }
    }
  };

  const setupMicrophone = async (session: any) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = getAudioContext();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      // Keep ScriptProcessor active, but never echo the microphone through speakers.
      const silentOutput = audioContext.createGain();
      silentOutput.gain.value = 0;
      processor.connect(silentOutput);
      silentOutput.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        // Read the current session state through a ref. A captured React state
        // value here can remain false even after the live connection opens.
        if (!isLiveActiveRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) sum += Math.abs(inputData[i]);
        setAudioLevel(sum / inputData.length);

        // Microphone sample rates vary by device. Always send genuine 16 kHz
        // PCM, not 48 kHz samples labeled as 16 kHz.
        const targetRate = 16000;
        const step = audioContext.sampleRate / targetRate;
        const pcmData = new Int16Array(Math.max(1, Math.floor(inputData.length / step)));
        for (let i = 0; i < pcmData.length; i++) {
          const offset = i * step;
          const index = Math.floor(offset);
          const fraction = offset - index;
          const sample = inputData[index] * (1 - fraction)
            + inputData[Math.min(index + 1, inputData.length - 1)] * fraction;
          pcmData[i] = Math.round(Math.max(-1, Math.min(1, sample)) * 32767);
        }

        const uint8 = new Uint8Array(pcmData.buffer);
        let binary = "";
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const base64Data = btoa(binary);
        session.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      // Store cleanup function
      const cleanup = () => {
        processor.onaudioprocess = null;
        processor.disconnect();
        silentOutput.disconnect();
        source.disconnect();
        stream.getTracks().forEach(track => track.stop());
      };

      return cleanup;
    } catch (err) {
      console.error("Microphone Error:", err);
    }
  };

  // Decode and schedule successive PCM chunks sequentially, without overlap.
  const playLiveAudio = async (base64: string, generation: number, version: number, mimeType = 'audio/pcm;rate=24000') => {
    const current = () => generation === liveGenerationRef.current
      && version === livePlaybackVersionRef.current && isLiveActiveRef.current;
    if (!current()) return;
    try {
      const audioContext = getAudioContext();
      if (audioContext.state === 'suspended') await audioContext.resume();
      if (!current()) return;
      const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
      const sampleRate = Number(/(?:^|;)\s*rate=(\d+)/i.exec(mimeType)?.[1] || 24000);
      const audioData = await decodeAudioData(bytes, audioContext, sampleRate);
      if (!current()) return;
      const lipTrack = analyzeSpeechBuffer(audioData);
      const source = audioContext.createBufferSource();
      source.buffer = audioData;
      source.connect(audioContext.destination);
      const playAt = Math.max(audioContext.currentTime + .018, livePlaybackHeadRef.current);
      livePlaybackHeadRef.current = playAt + audioData.duration;
      liveAudioSourcesRef.current.add(source);
      setIsSpeaking(true);
      source.onended = () => {
        liveAudioSourcesRef.current.delete(source);
        try { source.disconnect(); } catch (_) {}
        if (current() && liveAudioSourcesRef.current.size === 0) {
          setIsSpeaking(false);
          setCurrentSpeechText('');
        }
      };
      startLipSyncedSource(audioContext, source, lipTrack, playAt, lipSyncRef.current!, 'live');
    } catch (err) {
      if (current()) {
        console.error('Live audio playback error:', err);
        clearLiveAudio();
      }
    }
  };

  const playAudio = async (text: string) => {
    if (!text.trim() || isLiveActiveRef.current || liveConnectingRef.current) return;
    // Latest-request-wins for synthesis, decoding and playback.
    stopOneShotAudio();
    const token = oneShotGenerationRef.current;
    const current = () => token === oneShotGenerationRef.current
      && !isLiveActiveRef.current && !liveConnectingRef.current;
    setCurrentSpeechText(text);
    try {
      const speechCountry = selectedCountryRef.current;
      const speechGender = speechCountry?.characterFemale?.nameEn === selectedPersona?.nameEn ? 'female' : 'male';
      const speechVoice = speechCountry ? publishedVoice(tutorVoices, speechCountry.id, speechGender).voiceName : undefined;
      const audioBytes = await generateSpeech(text, inferLearnerLanguage(text, 'ar'), speechVoice);
      if (!current()) return;
      if (!audioBytes) {
        setIsSpeaking(false);
        setCurrentSpeechText('');
        return;
      }
      const audioContext = getAudioContext();
      if (audioContext.state === 'suspended') await audioContext.resume();
      if (!current()) return;
      const audioData = await decodeAudioData(audioBytes, audioContext);
      if (!current()) return;
      const lipTrack = analyzeSpeechBuffer(audioData);
      const source = audioContext.createBufferSource();
      source.buffer = audioData;
      source.connect(audioContext.destination);
      oneShotSourceRef.current = source;
      source.onended = () => {
        if (!current() || oneShotSourceRef.current !== source) return;
        oneShotSourceRef.current = null;
        try { source.disconnect(); } catch (_) {}
        setIsSpeaking(false);
        setCurrentSpeechText('');
      };
      const playAt = audioContext.currentTime + .025;
      setIsSpeaking(true);
      startLipSyncedSource(audioContext, source, lipTrack, playAt, lipSyncRef.current!, 'oneShot');
    } catch (err) {
      if (current()) {
        lipSyncRef.current?.clear('oneShot');
        console.error('Speech error:', err);
        setIsSpeaking(false);
        setCurrentSpeechText('');
      }
    }
  };

  const t = {
    title: lang === 'ar' ? 'اللهجات العربية' : 'Arabic Dialects',
    back: lang === 'ar' ? 'عودة' : 'Back',
    explore: lang === 'ar' ? 'استكشف اللهجات' : 'Explore Dialects',
    culture: lang === 'ar' ? 'الثقافة' : 'Culture',
    vocab: lang === 'ar' ? 'مفردات شائعة' : 'Common Vocab',
    dialogue: lang === 'ar' ? 'حوار يومي' : 'Daily Dialogue',
    chat: lang === 'ar' ? 'تحدث مع الذكاء الاصطناعي' : 'Chat with AI',
    pronunciation: lang === 'ar' ? 'تحدي النطق' : 'Pronunciation Challenge',
    record: lang === 'ar' ? 'سجل صوتك' : 'Record Voice',
    stop: lang === 'ar' ? 'إيقاف' : 'Stop',
    evaluating: lang === 'ar' ? 'جاري التقييم...' : 'Evaluating...',
    score: lang === 'ar' ? 'الدرجة:' : 'Score:',
    send: lang === 'ar' ? 'إرسال' : 'Send',
    placeholder: lang === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message...',
    dialect: lang === 'ar' ? 'اللهجة:' : 'Dialect:',
    fusha: lang === 'ar' ? 'الفصحى:' : 'MSA:',
    startJourney: lang === 'ar' ? 'ابدأ الرحلة' : 'Start Journey',
    didYouKnow: lang === 'ar' ? 'هل تعلم؟' : 'Did you know?',
    mission: lang === 'ar' ? 'المهمة' : 'Mission',
  };

  return (
    <div className={`w-full flex flex-col h-full bg-white shadow-[0_15px_50px_rgba(0,0,0,0.08)] rounded-[1.5rem] overflow-hidden border border-slate-100 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Global Brand Header */}
      <PageHeader 
        compact={!!selectedCountry}
        title={t.title} 
        icon={Globe} 
        lang={lang}
        onToggle={toggleLang}
        rightContent={
          <>
            {staffVoiceLab && <button type="button" onClick={() => { stopLiveConversation(); navigate('/voice-lab'); }}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-white/20"
              aria-label={lang === 'ar' ? 'فتح مختبر أصوات المعلمين' : 'Open tutor voice lab'}>
              {lang === 'ar' ? 'مختبر الأصوات' : 'Voice Lab'}
            </button>}
            <button 
              onClick={() => {
                if (selectedCountry) {
                  setSelectedCountry(null);
                  setSelectedPersona(null);
                  setChatMessages([]);
                }
              }}
              className={`bg-white/10 text-white px-4 py-1.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest hover:bg-white/20 border border-white/20 backdrop-blur-md ${!selectedCountry ? 'hidden' : ''}`}
            >
              {t.back}
            </button>
            <button 
              onClick={() => { setPassportFocusId(null); setIsPassportOpen(true); }}
              className="bg-amber-500/20 text-amber-100 px-3 py-1.5 rounded-xl transition-all text-[11px] font-black hover:bg-amber-500/30 border border-amber-500/30 backdrop-blur-md flex items-center gap-2"
            >
              {lang === 'ar' ? 'جوازات الدول' : 'Country Passports'}
            </button>
          </>
        }
      />

      <div className={`flex-1 ${!selectedCountry ? 'overflow-y-auto custom-scroll p-4 md:p-6' : 'overflow-hidden p-[clamp(5px,.7vh,9px)] flex flex-col'} relative bg-slate-50/30 min-h-0`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }} />
        
        <AnimatePresence mode="sync" initial={false}>
          {!selectedCountry ? (
            <motion.div 
              key="country-grid"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {COUNTRY_DATA.map((country, index) => (
                <motion.button
                  key={country.id}
                  type="button"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.985 }}
                  onPointerEnter={event => { if (event.pointerType !== 'touch') schedulePortraitWarmup(country.id); }}
                  onPointerLeave={cancelPortraitWarmup}
                  onFocus={() => warmCountryPortraits(country.id)}
                  onClick={() => { cancelPortraitWarmup(); warmCountryPortraits(country.id); setSelectedCountry(country); }}
                  aria-label={lang === 'ar' ? `استكشف ${country.nameAr}` : `Explore ${country.nameEn}`}
                  className="group bg-white rounded-[1.8rem] overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 border border-slate-100 flex flex-col h-[320px] sm:h-[340px] relative text-right focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400"
                >
                  {/* The destination photo is the visual focus, about 79% of the card. */}
                  <div className="relative flex-1 min-h-0 overflow-hidden bg-slate-200"
                      style={{ backgroundImage: 'url("' + DIALECT_IMAGE_PREVIEWS[country.id] + '")',
                        backgroundSize: 'cover', backgroundPosition: COUNTRY_PHOTO_FOCUS[country.id] || 'center 50%' }}>
                    <SafeImage
                      noBg
                      src={country.image}
                      alt={country.nameAr}
                      loading={index < 6 ? 'eager' : 'lazy'}
                       fetchPriority={index < 4 ? 'high' : 'auto'}
                      decoding="async"
                      style={{ objectPosition: COUNTRY_PHOTO_FOCUS[country.id] || 'center 50%' }}
                      className={country.id === 'egypt'
                        ? "w-full h-full object-cover brightness-[1.07] saturate-[1.12] contrast-[1.04] group-hover:scale-[1.035] transition-transform duration-700 ease-out"
                        : "w-full h-full object-cover brightness-[1.035] saturate-[1.09] contrast-[1.025] group-hover:scale-[1.045] transition-transform duration-700 ease-out"}
                    />
                    {country.id === 'egypt' && (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none mix-blend-screen"
                        style={{
                          background: "radial-gradient(circle at 32% 24%, rgba(255, 224, 190, 0.16), transparent 42%), linear-gradient(to top, rgba(255, 186, 120, 0.07), transparent 48%)"
                        }}
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-slate-950/30 to-transparent pointer-events-none" />
                    <div className="absolute top-3 right-3 bg-white/85 backdrop-blur-md px-2 py-1 rounded-xl border border-white/70 text-2xl shadow-sm" aria-hidden="true">
                      {country.flag}
                    </div>
                  </div>
                  {/* Restored original mastery-strip appearance, without altering the photo and text settings. */}
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden shrink-0" aria-hidden="true">
                    <div className="bg-blue-600 h-full w-full opacity-20" />
                  </div>
                  {/* Information is secondary; clicking anywhere on the card opens the country. */}
                  <div className="h-[70px] sm:h-[72px] shrink-0 px-4 py-2.5 bg-white flex items-center justify-between gap-2 text-right">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-black text-slate-800 arabic-font leading-tight truncate">{country.nameAr}</h3>
                      <p className="text-[10px] font-bold text-slate-400 leading-snug truncate" dir="ltr">{country.nameEn}</p>
                    </div>
                    <span className="max-w-[49%] text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 rounded-lg px-2.5 py-1.5 text-center leading-snug arabic-font">
                      {country.dialect}
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="country-detail"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ duration: .12 }}
              className="mx-auto flex h-full min-h-0 w-full max-w-[1680px] flex-1 flex-col overflow-hidden rounded-[20px] border border-slate-100 bg-[#f5f8f7] px-[clamp(6px,.85vh,11px)] pt-[clamp(6px,.85vh,11px)] pb-[clamp(18px,3vh,28px)] shadow-[0_16px_50px_rgba(20,44,52,.11)]"
            >
              {/* On narrow devices, keep the page itself fixed and switch between the scene and reference. */}
              <nav className="mb-2 grid h-[38px] shrink-0 grid-cols-2 gap-2 lg:hidden" aria-label={lang === 'ar' ? 'أقسام الدولة' : 'Country sections'}>
                <button type="button" onClick={() => setMobileCountryPanel('stage')}
                  aria-pressed={mobileCountryPanel === 'stage'}
                  className={mobileCountryPanel === 'stage'
                    ? 'rounded-xl bg-[#0d6f5e] text-white text-xs font-bold arabic-font'
                    : 'rounded-xl bg-white text-slate-600 text-xs font-bold arabic-font border border-slate-200'}>
                  {lang === 'ar' ? 'الشخصيات والمحادثة' : 'Characters & chat'}
                </button>
                <button type="button" onClick={() => setMobileCountryPanel('reference')}
                  aria-pressed={mobileCountryPanel === 'reference'}
                  className={mobileCountryPanel === 'reference'
                    ? 'rounded-xl bg-[#0d6f5e] text-white text-xs font-bold arabic-font'
                    : 'rounded-xl bg-white text-slate-600 text-xs font-bold arabic-font border border-slate-200'}>
                  {lang === 'ar' ? 'الثقافة والمفردات' : 'Culture & words'}
                </button>
              </nav>

              <div className="flex min-h-0 flex-1 flex-row gap-[clamp(6px,.8vw,13px)]">
                {/* RTL: first is on the right. All eight words remain visible while speaking on desktop. */}
                <div className={(mobileCountryPanel === 'reference' ? 'flex' : 'hidden') + ' min-h-0 min-w-0 w-full lg:flex lg:w-[42%] lg:shrink-0'}>
                  <DialectReferencePanel
                    key={selectedCountry.id}
                    country={selectedCountry}
                    lang={lang}
                    onPronounce={text => { void playAudio(text); }}
                    heroImage={<div className="h-full w-full" style={{
                    backgroundImage: 'url("' + DIALECT_IMAGE_PREVIEWS[selectedCountry.id] + '")',
                    backgroundSize: 'cover', backgroundPosition: COUNTRY_PHOTO_FOCUS[selectedCountry.id] || 'center'
                  }}><SafeImage noBg src={selectedCountry.image} className="h-full w-full object-cover" alt={selectedCountry.nameAr} loading="eager" decoding="async"/></div>}
                  />
                </div>

                {/* The characters remain in one stage. No duplicate image or voice-screen overlay. */}
                <section className={(mobileCountryPanel === 'stage' ? 'flex' : 'hidden') + ' h-full min-h-0 min-w-0 w-full flex-col lg:flex lg:w-[58%] lg:flex-1'}
                  aria-label={lang === 'ar' ? 'الشخصيات والمحادثة' : 'Characters and conversation'}>
                  {/* Clear bilingual mission brief, paired with a physical-style country passport. */}
                  <div className="mb-[clamp(5px,.75vh,9px)] flex h-[clamp(91px,11.5vh,108px)] shrink-0 gap-[clamp(5px,.8vw,11px)]">
                    <section
                      className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden rounded-[13px] border border-emerald-100/80 bg-white px-[clamp(9px,1.2vw,16px)] py-[clamp(6px,.8vh,11px)] shadow-sm"
                      aria-label={lang === 'ar' ? 'المهمة الحالية وترجمتها' : 'Current mission and translation'}>
                      <div className="mb-1 flex shrink-0 items-center justify-between gap-2">
                        <h3 className="text-[clamp(12px,1.04vw,15px)] font-black text-emerald-900 arabic-font">
                          {(passportLevels[selectedCountry.id] || 0) === 0 && chatMessages.filter(message => message.role === 'user' && /[\u0600-\u06FF]/.test(message.text)).length < 2 ? (lang === 'ar' ? 'اكتشف اللهجة أولًا' : 'Discover the dialect first') : (lang === 'ar' ? 'المهمة الحالية' : 'Current mission')}
                        </h3>
                        <span className="shrink-0 rounded-full border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-800" dir="ltr">
                          {(passportLevels[selectedCountry.id] || 0) >= 3 ? '03 / 03 ✓' : ('0' + Math.min(3, (passportLevels[selectedCountry.id] || 0) + 1) + ' / 03')}
                        </span>
                      </div>
                      {(() => {
                        const level = Math.max(0, Math.min(3, passportLevels[selectedCountry.id] || 0));
                        const mission = level === 0 ? selectedCountry.missions?.visitor : level === 1 ? selectedCountry.missions?.resident : selectedCountry.missions?.native;
                        return level === 0 && chatMessages.filter(message => message.role === 'user' && /[\u0600-\u06FF]/.test(message.text)).length < 2 ? (
                          <div className="flex min-h-0 flex-1 flex-col justify-center gap-1">
                            <p className="text-right text-[clamp(11px,1vw,13px)] font-bold text-slate-800 arabic-font" dir="rtl">ابدأ بالتعارف، واستمع إلى تحية من لهجة البلد. ستتعرف على مهمة الزيارة بعد التدرّب.</p>
                            <p className="text-left text-[clamp(10px,.87vw,12px)] font-medium text-slate-500" dir="ltr">Meet your tutor and learn a local greeting first. Your visit challenge comes later.</p>
                          </div>
                        ) : level >= 3 ? (
                          <div className="flex flex-1 flex-col justify-center gap-1">
                            <p className="text-[13px] font-black text-emerald-800 arabic-font" dir="rtl">أكملت المهام الثلاث بنجاح، وأصبحت روح البلد!</p>
                            <p className="text-[11px] font-medium text-slate-600" dir="ltr">All three missions completed. You earned Native Spirit!</p>
                          </div>
                        ) : (
                          <div className="flex min-h-0 flex-1 flex-col justify-center gap-[clamp(3px,.5vh,6px)]">
                            <p className="line-clamp-2 text-right text-[clamp(11px,1vw,13px)] font-bold leading-[1.4] text-slate-800 arabic-font"
                              dir="rtl" title={mission?.ar}>{mission?.ar}</p>
                            <p className="line-clamp-2 text-left text-[clamp(10px,.87vw,12px)] font-medium leading-[1.4] text-slate-500"
                              dir="ltr" title={mission?.en}>{mission?.en}</p>
                          </div>
                        );
                      })()}
                    </section>
                    <button type="button"
                      onClick={() => { setPassportFocusId(selectedCountry.id); setIsPassportOpen(true); }}
                      className={'group flex h-full w-[clamp(110px,11.8vw,148px)] shrink-0 flex-col items-center justify-center gap-[clamp(3px,.35vh,6px)] rounded-[13px] border px-2 py-1.5 shadow-sm transition-colors hover:border-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ' +
                        ((passportLevels[selectedCountry.id] || 0) >= 1 ? 'border-amber-200 bg-[#fff9ec]' : 'border-slate-200 bg-white/85') +
                        (recentStamp?.countryId === selectedCountry.id ? ' ring-2 ring-amber-400 shadow-[0_0_22px_rgba(245,158,11,.35)]' : '')}
                      title={lang === 'ar' ? 'افتح جواز الدولة وأختام المهام' : 'Open passport and earned stamps'}
                      aria-label={lang === 'ar' ? 'عرض جواز ' + selectedCountry.nameAr : 'View ' + selectedCountry.nameEn + ' passport'}>
                      <div className="mx-auto w-[clamp(46px,4.4vw,59px)] shrink-0">
                        <DialectPassportCover country={selectedCountry} level={passportLevels[selectedCountry.id] || 0} compact/>
                      </div>
                      <span className="block w-full whitespace-nowrap text-center text-[clamp(9px,.8vw,11px)] font-black leading-tight text-emerald-950 arabic-font" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                        {lang === 'ar' ? 'جواز ' + selectedCountry.nameAr : selectedCountry.nameEn + ' Passport'}
                      </span>
                    </button>
                  </div>

                  <div className="relative min-h-0 flex-1 overflow-hidden rounded-t-[18px] bg-[radial-gradient(ellipse_at_50%_45%,rgba(235,248,242,.9),rgba(247,250,248,.96)_55%,rgba(223,237,230,.95)_100%)]">
                    {/* Diffuse ground light and soft contact shadows, without an artificial floor line. */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[29%] bg-gradient-to-t from-[#ddeae4]/50 to-transparent"/>
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-[7%] bottom-[36px] grid h-[25px] grid-cols-2 gap-[clamp(22px,4vw,60px)]">
                      <div className="mx-auto h-[16px] w-[70%] rounded-[50%] bg-[#1c3c34]/15 blur-[10px]" />
                      <div className="mx-auto h-[16px] w-[70%] rounded-[50%] bg-[#1c3c34]/15 blur-[10px]" />
                    </div>
                    {/* Reserve no unnecessary floor gap: the characters stand fully on the scene. */}
                    <div dir={getTutorStageDirection(selectedCountry.id, lang)} className="absolute inset-0 grid grid-cols-2 gap-[clamp(23px,4vw,62px)] px-[clamp(5px,1vw,14px)] pb-[3px] pt-0">
                      {[
                        { char: selectedCountry.characterMale, gender: 'male' as const, isFemale: false },
                        { char: selectedCountry.characterFemale, gender: 'female' as const, isFemale: true }
                      ].map(({ char, gender, isFemale }, index) => {
                        const chosen = selectedPersona?.nameEn === char.nameEn;
                        return (
                          <Interactive3DTutor
                            key={selectedCountry.id + gender}
                            countryId={selectedCountry.id}
                            character={char}
                            gender={gender}
                            successSignal={tutorSuccess?.countryId === selectedCountry.id && tutorSuccess?.personaName === char.nameEn ? tutorSuccess.count : 0}
                            isSelected={chosen}
                            isSpeaking={chosen && isSpeaking}
                            isListening={chosen && isListening}
                            isLoading={chosen && isChatLoading}
                            partnerState={!chosen && isSpeaking ? 'speaking' : !chosen && isListening ? 'listening' : 'idle'}
                            partnerDirection={getTutorPartnerDirection(selectedCountry.id, gender, lang)}
                            audioLevel={chosen ? audioLevel : 0}
                            lipSync={chosen ? lipSyncRef.current : undefined}
                            countryNameAr={selectedCountry.nameAr}
                            countryNameEn={selectedCountry.nameEn}
                            dialectName={selectedCountry.dialect}
                            currentSpeechText={chosen && isSpeaking ? currentSpeechText : undefined}
                            lang={lang}
                            onSelect={() => {
                              if (chosen) return;
                              const continueLive = isLiveActiveRef.current || liveConnectingRef.current;
                              stopLiveConversation();
                              setSelectedPersona(char);
                              setChatMessages(previous => previous.length ? previous : (learningJourneysRef.current[selectedCountry.id]?.turns || []));
                              if (continueLive) void startLiveConversation(char);
                            }}
                          />
                        );
                      })}
                    </div>
                    {/* The voice orb becomes a single bilingual recorder, no scattered captions. */}
                    <DialectVoiceHalo
                      countryId={selectedCountry.id}
                      lang={lang}
                      tutorName={selectedPersona?.nameAr}
                      turns={chatMessages}
                      active={isLiveActive}
                      listening={isListening}
                      speaking={isSpeaking}
                      loading={isChatLoading}
                      disabled={!selectedPersona}
                      currentSpeechText={currentSpeechText}
                      onToggle={() => { void startLiveConversation(); }}
                      onPronounce={text => { void playAudio(text); }}
                    />
                  </div>

                  {/* A compact teaching control rail continues the stage; no transcript box. */}
                  <div className="h-[clamp(89px,12vh,102px)] min-h-0 shrink-0">
                    <DialectChatDock
                      lang={lang}
                      countryId={selectedCountry.id}
                      name={lang === 'ar' ? selectedPersona?.nameAr : selectedPersona?.nameEn}
                      messages={chatMessages}
                      value={chatInput}
                      onChange={setChatInput}
                      onSend={text => { void handleAIChat(text); }}
                      onDictate={startSTT}
                      onPronounce={text => { void playAudio(text); }}
                      loading={isChatLoading}
                      listening={isListening && !isLiveActive}
                      level={passportLevels[selectedCountry.id] || 0}
                      countryName={selectedCountry.nameAr}
                      liveActive={isLiveActive}
                      vocabulary={selectedCountry.vocab}
                    />
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* One educational passport per country, with three independently earned seals. */}
        {isPassportOpen && (
          <DialectPassportLibrary
            countries={COUNTRY_DATA}
            levels={passportLevels}
            initialCountryId={passportFocusId}
            lang={lang}
            onClose={() => setIsPassportOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
