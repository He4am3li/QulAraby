import React from 'react';
import { 
  Globe, MessageSquare, ChevronRight, ChevronLeft, 
  Volume2, Info, ArrowRight, ArrowLeft, Sparkles, Map as MapIcon,
  Gamepad2, Trophy, Star, Mic, MicOff, Play, Square, Loader2,
  MessageCircle, Send, Zap, Plane
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { Interactive3DTutor } from '../components/Interactive3DTutor';
import { generateSpeech, decodeAudioData } from '../services/gemini';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// --- Country Journey Data (v4 - Verified Strategic Landmarks) ---
const COUNTRY_DATA = [
  {
    id: 'uae',
    nameAr: 'الإمارات',
    nameEn: 'UAE',
    flag: '🇦🇪',
    image: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?auto=format&fit=crop&w=1200&q=80',
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
      { fusha: 'كيف حالك؟', dialect: 'شلونك؟', roman: 'Shlonak?', en: 'How are you?' },
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
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1579606032822-4914a1a5e128?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1528642463378-84226a17285c?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1541464522988-31b320f681ba?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1552594411-92523277732a?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1583275484611-274e575ccc33?auto=format&fit=crop&w=1200&q=80',
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
      visitor: { ar: "تعلم (عصبة، لاباس) وتعرف على مدينة قرطاج.", en: "Learn (Aslama, Labas) and identify Carthage." },
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
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=80',
    dialect: 'Algerian (جزائري)',
    characterMale: { 
      nameAr: 'أمين', 
      nameEn: 'Amin', 
      clothingAr: 'البرنوس الجزائري الأبيض.', 
      clothingEn: 'White Algerian Burnous.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Algeria%20wearing%20traditional%20white%20Burnous%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'مريم', 
      nameEn: 'Meriem', 
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
    image: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1542456455-f725a337580b?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1583340050186-09556ae53835?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1541336032412-248a9795c3dd?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1549944850-84e00be4203b?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1548651811-e73715dfbbe2?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1532009255024-ed4d63be9924?auto=format&fit=crop&w=1200&q=80',
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

  
  const [selectedCountry, setSelectedCountry] = React.useState<any>(null);
  const [selectedPersona, setSelectedPersona] = React.useState<any>(null);
  const [chatMessages, setChatMessages] = React.useState<{role: string, text: string}[]>([]);
  const [chatInput, setChatInput] = React.useState('');
  const [isChatLoading, setIsChatLoading] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [currentSpeechText, setCurrentSpeechText] = React.useState<string>('');
  const [isListening, setIsListening] = React.useState(false);
  const [isLiveActive, setIsLiveActive] = React.useState(false);
  const [audioLevel, setAudioLevel] = React.useState(0);
  const liveSessionRef = React.useRef<any>(null);
  const [stampedCountries, setStampedCountries] = React.useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('dialect_ranks');
    return saved ? JSON.parse(saved) : {};
  });
  const [isPassportOpen, setIsPassportOpen] = React.useState(false);

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
  const recognitionRef = React.useRef<any>(null);
  const micCleanupRef = React.useRef<(() => void) | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const stopLiveConversation = React.useCallback(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    if (micCleanupRef.current) {
      micCleanupRef.current();
      micCleanupRef.current = null;
    }
    setIsLiveActive(false);
    setIsListening(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (liveSessionRef.current) {
        liveSessionRef.current.close();
      }
    };
  }, []);

  React.useEffect(() => {
    localStorage.setItem('dialect_ranks', JSON.stringify(stampedCountries));
  }, [stampedCountries]);

  React.useEffect(() => {
    // Reset state and auto-select default tutor when country opens
    setChatInput('');
    if (selectedCountry) {
      const defaultChar = selectedCountry.characterMale;
      setSelectedPersona(defaultChar);
      const greetingText = lang === 'ar'
        ? `مرحباً بك في ${selectedCountry.nameAr}! أنا ${defaultChar.nameAr}، يسعدني التحدث معك بلهجتنا.`
        : `Welcome to ${selectedCountry.nameEn}! I'm ${defaultChar.nameEn}, happy to chat in our dialect.`;
      setChatMessages([{ role: 'model', text: greetingText }]);
    } else {
      setSelectedPersona(null);
      setChatMessages([]);
    }
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    setIsLiveActive(false);
    setIsListening(false);
  }, [selectedCountry, lang]);

  const startSTT = () => {
    if (recognitionRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'ar-SA';
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

  const updateRank = (countryId: string, rank: number) => {
    const currentRank = stampedCountries[countryId] || 0;
    if (rank > currentRank) {
      setStampedCountries(prev => ({ ...prev, [countryId]: rank }));
    }
  };

  const handleAIChat = async (overrideInput?: string, persona?: any) => {
    const input = overrideInput || chatInput;
    if (!input.trim() || isChatLoading) return;
    
    const currentPersona = persona || selectedPersona;
    if (!currentPersona) return;

    const userMsg = input;
    if (!overrideInput) setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const rank = stampedCountries[selectedCountry.id] || 0;
      const missions = (selectedCountry as any).missions;
      const currentMission = missions ? (rank === 0 ? (lang === 'ar' ? missions.visitor.ar : missions.visitor.en) : rank === 1 ? (lang === 'ar' ? missions.resident.ar : missions.resident.en) : (lang === 'ar' ? missions.native.ar : missions.native.en)) : "Learn the dialect";

      const systemPrompt = `You are ${currentPersona.nameEn} from ${selectedCountry.nameEn}, acting as a helpful and patient language teacher.
      Your goal is to help a BEGINNER student complete their current mission.
      
      CURRENT MISSION: ${currentMission}
      STUDENT RANK: ${rank === 0 ? 'Visitor (Beginner)' : rank === 1 ? 'Resident (Intermediate)' : 'Native Spirit (Advanced)'}
      
      CRITICAL RULES:
      1. STRICT DIALECT: You MUST respond ONLY in the ${selectedCountry.dialect} dialect of ${selectedCountry.nameEn}. Even if the student speaks in Modern Standard Arabic (Fusha) or English, you MUST answer in the local dialect to immerse them.
      2. ERROR CORRECTION: If the student answers a question incorrectly, makes a grammatical mistake, or uses a word that doesn't fit the dialect, you MUST gently correct them. Provide the correct word/phrase in ${selectedCountry.dialect} and explain it simply.
      3. VISITOR GUIDELINES (Rank 0):
         - Use VERY simple words.
         - Focus ONLY on basic greetings and the specific landmark mentioned in the mission.
         - If they struggle, give them the answer in the dialect and ask them to repeat it.
         - Keep responses very short (max 2 sentences).
      4. RESIDENT/NATIVE GUIDELINES:
         - Gradually increase complexity but stay within the mission's scope.
         - Act out the scenario naturally but keep the teaching goal in mind.

      If this is the first message, introduce yourself briefly in the dialect and ask a simple question to start the mission.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...chatMessages.map(m => ({ role: m.role as any, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMsg }] }
        ]
      });

      const modelText = response.text || "أعتذر، حدث خطأ ما.";
      setChatMessages(prev => [...prev, { role: 'model', text: modelText }]);
      
      const userMessages = chatMessages.filter(m => m.role === 'user');
      const userMessageCount = userMessages.length + 1;
      const currentRank = stampedCountries[selectedCountry.id] || 0;
      
      if (currentRank === 0 && userMessageCount >= 3) {
        updateRank(selectedCountry.id, 1);
        setChatMessages(prev => [...prev, { 
          role: 'model', 
          text: lang === 'ar' 
            ? "مبروك! لقد أتممت مهمة الزائر بنجاح وحصلت على التأشيرة. أنت الآن 'مقيم' في بلدنا." 
            : "Congratulations! You have successfully completed the Visitor mission and obtained your visa." 
        }]);
      }

      playAudio(modelText);
    } catch (error) {
      console.error("AI Chat Error:", error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const startLiveConversation = async (personaOverride?: any, retryCount = 0) => {
    const persona = personaOverride || selectedPersona;
    if (!persona) return;

    if (isLiveActive) {
      stopLiveConversation();
      return;
    }

    try {
      const { GoogleGenAI, Modality } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const rank = stampedCountries[selectedCountry.id] || 0;
      const missions = (selectedCountry as any).missions;
      const currentMission = missions ? (rank === 0 ? missions.visitor.ar : rank === 1 ? missions.resident.ar : missions.native.ar) : "Learn the dialect";

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `You are ${persona.nameEn} from ${selectedCountry.nameEn}, a patient language teacher. 
          Respond ONLY in ${selectedCountry.dialect}. 
          Current Mission: ${currentMission}. 
          Correct the student's mistakes immediately. 
          Keep responses short and conversational.`,
        },
        callbacks: {
          onopen: () => {
            setIsLiveActive(true);
            setIsListening(true);
            sessionPromise.then(async (session) => {
              const cleanup = await setupMicrophone(session);
              if (cleanup) micCleanupRef.current = cleanup;
            });
          },
          onmessage: async (message: any) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              setIsSpeaking(true);
              playLiveAudio(base64Audio);
            }
            if (message.serverContent?.interrupted) {
              setIsSpeaking(false);
            }
          },
          onclose: () => {
            if (micCleanupRef.current) {
              micCleanupRef.current();
              micCleanupRef.current = null;
            }
            setIsLiveActive(false);
            setIsListening(false);
            setIsSpeaking(false);
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            if (retryCount < 2) {
              console.warn("Live Session failed, retrying...");
              setTimeout(() => startLiveConversation(persona, retryCount + 1), 2000);
            } else {
              setIsLiveActive(false);
              setIsListening(false);
              setIsSpeaking(false);
            }
          }
        }
      });
      
      sessionPromise.then(session => {
        liveSessionRef.current = session;
      });
    } catch (err) {
      console.error("Live API Error:", err);
      if (retryCount < 2) {
        setTimeout(() => startLiveConversation(persona, retryCount + 1), 2000);
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
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (!isLiveActive) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
          sum += Math.abs(inputData[i]);
        }
        setAudioLevel(sum / inputData.length);
        
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
        processor.disconnect();
        source.disconnect();
        stream.getTracks().forEach(track => track.stop());
      };

      return cleanup;
    } catch (err) {
      console.error("Microphone Error:", err);
    }
  };

  const playLiveAudio = async (base64: string) => {
    setIsSpeaking(true);
    try {
      const audioContext = getAudioContext();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      const audioData = await decodeAudioData(bytes, audioContext);
      const source = audioContext.createBufferSource();
      source.buffer = audioData;
      source.connect(audioContext.destination);
      source.start(0);
      source.onended = () => {
        setIsSpeaking(false);
        setCurrentSpeechText('');
      };
    } catch (err) {
      console.error("Live audio playback error:", err);
      setIsSpeaking(false);
      setCurrentSpeechText('');
    }
  };

  const playAudio = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    setCurrentSpeechText(text);
    try {
      const audioBytes = await generateSpeech(text, 'ar');
      if (audioBytes) {
        const audioContext = getAudioContext();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        const audioData = await decodeAudioData(audioBytes, audioContext);
        const source = audioContext.createBufferSource();
        source.buffer = audioData;
        source.connect(audioContext.destination);
        source.start(0);
        source.onended = () => {
          setIsSpeaking(false);
          setCurrentSpeechText('');
        };
      } else {
        setIsSpeaking(false);
        setCurrentSpeechText('');
      }
    } catch (err) {
      console.error('Speech error:', err);
      setIsSpeaking(false);
      setCurrentSpeechText('');
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
    <div className={`w-full flex flex-col h-full bg-white shadow-[0_15px_50px_rgba(0,0,0,0.08)] rounded-[1.5rem] overflow-hidden border border-slate-100 animate-in fade-in duration-700 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Global Brand Header */}
      <PageHeader 
        title={t.title} 
        icon={Globe} 
        lang={lang}
        onToggle={toggleLang}
        rightContent={
          <>
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
              onClick={() => setIsPassportOpen(true)}
              className="bg-amber-500/20 text-amber-400 px-4 py-1.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/30 border border-amber-500/30 backdrop-blur-md flex items-center gap-2"
            >
              <Trophy size={14} />
              {lang === 'ar' ? 'جواز السفر' : 'Passport'}
            </button>
          </>
        }
      />

      <div className={`flex-1 ${!selectedCountry ? 'overflow-y-auto custom-scroll p-4 md:p-6' : 'overflow-hidden p-2 md:p-3 flex flex-col'} relative bg-slate-50/30 min-h-0`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }} />
        
        <AnimatePresence mode="wait">
          {!selectedCountry ? (
            <motion.div 
              key="country-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {COUNTRY_DATA.map(country => (
                <motion.button
                  key={country.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCountry(country)}
                  className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col h-[380px] relative"
                >
                    <div className="h-48 relative overflow-hidden">
                      <SafeImage src={country.image} alt={country.nameEn} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/30 text-2xl">
                      {country.flag}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1 text-right">
                    <h3 className="text-2xl font-black text-slate-800 arabic-font mb-1">{country.nameAr}</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4" dir="ltr">{country.nameEn}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between text-[10px] font-black">
                        <span className="text-slate-400 uppercase tracking-tighter">{t.dialect}</span>
                        <span className="text-blue-600">{country.dialect}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full w-full opacity-20" />
                      </div>
                    </div>
                    <div className="mt-auto w-full py-3 bg-slate-50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {t.startJourney} <ArrowRight size={14} className={lang === 'ar' ? 'rotate-180' : ''} />
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="country-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[99%] mx-auto bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 w-full flex flex-col md:flex-row flex-1 h-full min-h-0"
            >
              {/* Left Column: Info & Culture */}
              <div className="w-full md:w-1/2 flex flex-col overflow-y-auto custom-scroll border-l border-slate-100 h-full min-h-0">
                {/* Hero Section */}
                <div className="h-[140px] shrink-0 relative">
                  <SafeImage src={selectedCountry.image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />
                  <div className="absolute bottom-3 right-5 flex items-end gap-3">
                    <div className="text-4xl drop-shadow-2xl">{selectedCountry.flag}</div>
                      <div className="text-right">
                        <h2 className="text-xl font-black text-slate-800 arabic-font mb-0">{selectedCountry.nameAr}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" dir="ltr">{selectedCountry.nameEn}</p>
                      </div>
                  </div>
                </div>

                <div className="p-5 space-y-6">
                  {/* Culture Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-r-4 border-blue-600 pr-2">
                      <h3 className="text-base font-black text-slate-800 arabic-font">{t.culture}</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedCountry.culture.items.map((item: any, i: number) => (
                        <div key={i} className="relative group">
                          <div className="bg-slate-50 p-2 rounded-xl flex flex-col items-center text-center border border-slate-100 hover:shadow-sm transition-all group-hover:bg-blue-50/50 cursor-help">
                            <span className="text-xl mb-0.5 group-hover:scale-110 transition-transform">{item.icon}</span>
                            <h4 className="text-[10px] font-black text-slate-800 arabic-font truncate w-full">{item.nameAr}</h4>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate w-full" dir="ltr">{item.nameEn}</p>
                          </div>
                          
                          {/* Tooltip Popup */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50">
                            <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-2xl border border-white/10 text-right">
                              <p className="text-[9.5px] font-bold arabic-font leading-relaxed mb-1.5">{item.descAr}</p>
                              <div className="pt-1 border-t border-white/10 text-left" dir="ltr">
                                <p className="text-[8.5px] text-slate-400 font-medium leading-snug italic text-left" dir="ltr">{item.descEn}</p>
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vocab Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-r-4 border-emerald-500 pr-2">
                      <h3 className="text-base font-black text-slate-800 arabic-font">{t.vocab}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedCountry.vocab.slice(0, 8).map((v: any, i: number) => (
                        <div key={i} className="bg-white border border-slate-100 p-3 rounded-xl flex items-center justify-between hover:border-emerald-200 transition-all shadow-sm group">
                          <div className="flex items-center gap-4 flex-1">
                            {/* Fusha */}
                            <div className="text-right min-w-[60px]">
                              <span className="text-[7px] font-black text-slate-300 uppercase block mb-0.5">{t.fusha}</span>
                              <span className="text-[11px] font-black text-slate-400 arabic-font">{v.fusha}</span>
                            </div>

                            {/* Arrow */}
                            <div className="w-5 h-5 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 group-hover:text-emerald-500 transition-colors shrink-0">
                              <ArrowRight size={10} className={lang === 'ar' ? 'rotate-180' : ''} />
                            </div>

                            {/* Dialect + Romanized */}
                            <div className="text-right flex-1">
                              <span className="text-[7px] font-black text-emerald-500 uppercase block mb-0.5">{t.dialect}</span>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-emerald-600 arabic-font leading-tight">{v.dialect}</span>
                                <span className="text-[9px] font-bold text-emerald-400 italic tracking-tight" dir="ltr">{v.roman}</span>
                              </div>
                            </div>

                            {/* English Translation */}
                            <div className="text-left border-r border-slate-100 pr-4 min-w-[80px]" dir="ltr">
                              <span className="text-[7px] font-black text-slate-300 uppercase block mb-0.5">English</span>
                              <span className="text-[10px] font-bold text-slate-500 italic">{v.en}</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => playAudio(v.dialect)}
                            className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm ml-4 shrink-0"
                          >
                            <Volume2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: AI & Interaction */}
              <div className="w-full md:w-1/2 flex flex-col bg-slate-50/50 h-full min-h-0 overflow-hidden">
                {/* Personas & Chat */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-white shrink-0">
                    {/* Did You Know Section (هل تعلم؟) */}
                    <div className="mb-3.5 bg-gradient-to-l from-[#0f172a]/95 to-[#064e3b]/95 border border-white/20 text-white rounded-2xl p-4 shadow-lg shadow-slate-950/20 text-right relative overflow-hidden">
                      {/* Subtle ambient light accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[11px] font-black text-emerald-300 uppercase tracking-wider arabic-font">
                            {t.didYouKnow}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-100/60 uppercase tracking-widest" dir="ltr">
                          Culture Note
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-100 arabic-font leading-relaxed relative z-10">
                        {selectedCountry.culture.factAr}
                      </p>
                      {selectedCountry.culture.factEn && (
                        <div className="mt-2.5 pt-2 border-t border-white/15 text-left relative z-10" dir="ltr">
                          <p className="text-[10.5px] text-emerald-100/80 font-normal italic leading-snug text-left" dir="ltr">
                            {selectedCountry.culture.factEn}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                        <h3 className="text-sm font-black text-slate-800 arabic-font">
                          {lang === 'ar' ? 'اختر معلمك' : 'Choose Your Tutor'}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 arabic-font bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100/80">
                        {lang === 'ar' ? 'انقر على المعلم للتحدث' : 'Tap tutor to talk'}
                      </span>
                    </div>

                    {/* 3D Character Stage - Seamless without frames, borders, or boxes */}
                    <div 
                      className="relative py-2 px-2 overflow-visible flex items-end justify-center gap-6 sm:gap-14 min-h-[220px] sm:min-h-[250px]"
                      style={{ perspective: '1000px' }}
                    >
                      {/* Realistic 3D Stage Floor Light & Depth (Frameless) */}
                      <div className="absolute -bottom-1 inset-x-4 h-8 bg-gradient-to-t from-slate-200/40 via-slate-100/10 to-transparent rounded-full blur-md pointer-events-none" />
                      
                      {[
                        { char: selectedCountry.characterMale, gender: 'male' as const, isFemale: false },
                        { char: selectedCountry.characterFemale, gender: 'female' as const, isFemale: true }
                      ].map(({ char, gender, isFemale }, idx) => {
                        const isSelected = selectedPersona?.nameEn === char.nameEn;
                        return (
                          <Interactive3DTutor
                            key={idx}
                            countryId={selectedCountry.id}
                            character={char}
                            gender={gender}
                            isSelected={isSelected}
                            isSpeaking={isSelected && isSpeaking}
                            isListening={isSelected && isListening}
                            isLoading={isSelected && isChatLoading}
                            audioLevel={audioLevel}
                            countryNameAr={selectedCountry.nameAr}
                            countryNameEn={selectedCountry.nameEn}
                            dialectName={selectedCountry.dialect}
                            currentSpeechText={isSelected && isSpeaking ? currentSpeechText : undefined}
                            lang={lang}
                            onSelect={() => {
                              setSelectedPersona(char);
                              const greetingText = getTutorGreeting(selectedCountry.id, char, isFemale, lang);
                              setChatMessages(prev => [...prev, { role: 'model', text: greetingText }]);
                              playAudio(greetingText);
                            }}
                            onQuickTalk={() => {
                              const greetingText = getTutorGreeting(selectedCountry.id, char, isFemale, lang);
                              playAudio(greetingText);
                            }}
                            onStartLive={() => startLiveConversation(char)}
                          />
                        );
                      })}
                    </div>

                    {/* Quick Live Voice & Dialect Interaction Bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => startLiveConversation()}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl font-black text-xs arabic-font transition-all shadow-sm ${
                          isLiveActive
                            ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
                        }`}
                      >
                        {isLiveActive ? (
                          <>
                            <MicOff size={14} />
                            <span>{lang === 'ar' ? 'إنهاء المحادثة المباشرة' : 'End Live Chat'}</span>
                          </>
                        ) : (
                          <>
                            <Mic size={14} />
                            <span>{lang === 'ar' ? 'تحدث صوتياً مع المعلم' : 'Live Voice Talk'}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-1" />
                          </>
                        )}
                      </button>

                      {/* Quick Conversation Starters */}
                      <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll py-0.5">
                        {[
                          { ar: 'كيف حالك اليوم؟', en: 'How are you?' },
                          { ar: 'علمني كلمة مميزة بلهجتكم', en: 'Teach me a unique word' },
                          { ar: 'ما هي أشهر أكلة عندكم؟', en: 'What is your famous dish?' }
                        ].map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleAIChat(lang === 'ar' ? prompt.ar : prompt.en)}
                            disabled={isChatLoading}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 arabic-font transition-colors shrink-0 whitespace-nowrap border border-slate-200/60"
                          >
                            💬 {lang === 'ar' ? prompt.ar : prompt.en}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden flex flex-col relative">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
                      {chatMessages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                        >
                          {/* User Side (right in RTL / left in LTR) */}
                          {msg.role === 'user' ? (
                            <div className="max-w-[85%] p-3 rounded-2xl text-xs font-bold arabic-font shadow-sm bg-blue-600 text-white rounded-tr-none" dir="auto">
                              {msg.text}
                            </div>
                          ) : (
                            /* Model Tutor Side with Avatar & Voice button */
                            <div className="flex items-end gap-2 max-w-[90%]">
                              <button
                                onClick={() => playAudio(msg.text)}
                                title={lang === 'ar' ? 'استمع إلى النطق' : 'Listen to pronunciation'}
                                className="w-7 h-7 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all shrink-0 shadow-2xs"
                              >
                                <Volume2 size={13} />
                              </button>
                              <div className="p-3 rounded-2xl text-xs font-bold arabic-font shadow-sm bg-white text-slate-800 border border-slate-100 rounded-tl-none relative group" dir="auto">
                                <div className="text-[9px] font-black text-blue-600 mb-1 flex items-center gap-1.5 border-b border-slate-50 pb-1">
                                  <span>{selectedPersona?.nameAr || 'المعلم'}</span>
                                  {isSpeaking && (
                                    <span className="flex items-center gap-0.5">
                                      <span className="w-1 h-2 bg-blue-500 rounded-full animate-bounce" />
                                      <span className="w-1 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                                      <span className="w-1 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    </span>
                                  )}
                                </div>
                                {msg.text}
                              </div>
                              <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs mb-0.5">
                                <SafeImage src={selectedPersona?.image} className="w-full h-full object-cover object-top" />
                                {isSpeaking && (
                                  <div className="absolute inset-0 bg-blue-500/30 animate-pulse" />
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {isChatLoading && (
                        <div className="flex items-center justify-end gap-2">
                          <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 arabic-font">
                              {lang === 'ar' ? `${selectedPersona?.nameAr || 'المعلم'} يجهز الإجابة...` : 'Tutor is typing...'}
                            </span>
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
                            <SafeImage src={selectedPersona?.image} className="w-full h-full object-cover object-top opacity-80" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAIChat()}
                          placeholder={t.placeholder}
                          className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold arabic-font focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        <button
                          onClick={() => handleAIChat()}
                          disabled={isChatLoading || !chatInput.trim()}
                          className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
                        >
                          <Send size={18} />
                        </button>
                        <button
                          onClick={startSTT}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          <Mic size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Live Conversation Overlay (Upgraded to Immersive Stage) */}
                    <AnimatePresence>
                      {isLiveActive && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-slate-900 z-40 flex flex-col overflow-hidden"
                        >
                          {/* 3D Stage Background */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#020617_100%)]" />
                          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
                          
                          {/* Animated Grid Floor */}
                          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[linear-gradient(to_bottom,transparent,#3b82f620)] perspective-[1000px]">
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,#3b82f610_1px,transparent_1px),linear-gradient(0deg,#3b82f610_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)_translateY(-50%)]" />
                          </div>

                          {/* Character Interaction Stage */}
                          <div className="flex-1 relative flex flex-col items-center justify-center p-8">
                            <motion.div 
                              animate={{ 
                                y: isSpeaking ? [0, -8, 0] : [0, -4, 0],
                                rotate: isSpeaking ? [-1, 1, -1] : [-0.5, 0.5, -0.5],
                                scale: isSpeaking ? [1, 1.01, 1] : 1
                              }}
                              transition={{ 
                                duration: isSpeaking ? 0.4 : 4, 
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="relative w-full max-w-[320px] aspect-[2/3] z-10"
                            >
                              {/* Robot Glow Aura */}
                              <div className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-500 ${isSpeaking ? 'bg-blue-500/30 scale-125' : 'bg-emerald-500/10 scale-100'}`} />
                              
                              <SafeImage 
                                src={selectedPersona.image} 
                                className={`w-full h-full object-contain transition-all duration-300 ${isSpeaking ? 'brightness-110 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'brightness-90 opacity-80'}`} 
                              />

                              {/* Lip-Sync Visualizer (Mouth Area) */}
                              {isSpeaking && (
                                <motion.div 
                                  animate={{ 
                                    scaleY: [1, 2.5, 1.2, 3, 1],
                                    opacity: [0.6, 1, 0.8, 1, 0.6]
                                  }}
                                  transition={{ duration: 0.12, repeat: Infinity }}
                                  className="absolute top-[38%] left-1/2 -translate-x-1/2 w-6 h-1.5 bg-blue-400 rounded-full blur-[2px] shadow-[0_0_10px_#60a5fa]"
                                />
                              )}

                              {/* Robotic Data Stream Overlay */}
                              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                                <motion.div 
                                  animate={{ y: [-100, 400] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                  className="w-full h-1 bg-gradient-to-b from-transparent via-blue-400 to-transparent"
                                />
                              </div>
                            </motion.div>

                            {/* HUD Info */}
                            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                              <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                                <h4 className="text-lg font-black text-white arabic-font leading-none mb-1">{selectedPersona.nameAr}</h4>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Active Link</span>
                                </div>
                              </div>

                              <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-right max-w-[180px]">
                                <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest block mb-1">{t.mission}</span>
                                <p className="text-[10px] text-white/80 font-bold arabic-font leading-tight">
                                  {(() => {
                                    const rank = stampedCountries[selectedCountry.id] || 0;
                                    const missions = (selectedCountry as any).missions;
                                    return rank === 0 ? missions.visitor.ar : rank === 1 ? missions.resident.ar : missions.native.ar;
                                  })()}
                                </p>
                              </div>
                            </div>

                            {/* Status Text */}
                            <div className="mt-8 text-center z-20">
                              <h3 className="text-xl font-black text-white arabic-font mb-2">
                                {isSpeaking ? (lang === 'ar' ? 'المعلم يتحدث...' : 'Tutor is speaking...') : (lang === 'ar' ? 'أنا أسمعك...' : 'I am listening...')}
                              </h3>
                              <div className="flex items-center justify-center gap-1 h-8">
                                {[...Array(12)].map((_, i) => (
                                  <motion.div 
                                    key={i}
                                    animate={{ 
                                      height: isLiveActive ? [4, 4 + (audioLevel * 80 * (0.4 + Math.random())), 4] : 2 
                                    }}
                                    transition={{ duration: 0.1, repeat: Infinity }}
                                    className={`w-1 rounded-full ${isSpeaking ? 'bg-blue-400' : 'bg-emerald-400'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Control Bar */}
                          <div className="p-8 bg-gradient-to-t from-black to-transparent flex flex-col items-center gap-4 z-20">
                            <button 
                              onClick={stopLiveConversation}
                              className="w-full max-w-xs py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-2xl shadow-rose-600/20 flex items-center justify-center gap-3"
                            >
                              <MicOff size={18} />
                              {lang === 'ar' ? 'إنهاء المحادثة' : 'End Conversation'}
                            </button>
                            
                            <button 
                              onClick={stopLiveConversation}
                              className="text-white/30 hover:text-white/60 text-[10px] font-black uppercase tracking-widest transition-colors"
                            >
                              Switch to Text Mode
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => startLiveConversation()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                    >
                      <Zap size={14} className="text-amber-300" />
                      {lang === 'ar' ? 'بدء محادثة صوتية حية' : 'Start Live Voice Chat'}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">
                        {lang === 'ar' ? 'مستواك الحالي' : 'Current Rank'}
                      </div>
                      <div className="text-[10px] font-black text-amber-600 arabic-font">
                        {stampedCountries[selectedCountry.id] === 2 ? (lang === 'ar' ? 'روح البلد' : 'Native Spirit') : stampedCountries[selectedCountry.id] === 1 ? (lang === 'ar' ? 'مقيم' : 'Resident') : (lang === 'ar' ? 'زائر' : 'Visitor')}
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                      <Trophy size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dialect Passport Modal */}
        <AnimatePresence>
          {isPassportOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPassportOpen(false)}
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                className="relative w-full max-w-6xl bg-[#fdfcf8] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-amber-200/50 h-[90vh]"
              >
                {/* Passport Left Side (Cover/Info) */}
                <div className="w-full md:w-1/3 bg-[#6b1212] p-10 flex flex-col items-center justify-center text-center space-y-8 border-r border-amber-900/20 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')]" />
                  <div className="relative z-10 w-32 h-32 border-4 border-amber-400/30 rounded-full flex items-center justify-center text-amber-400 shadow-2xl shadow-black/20">
                    <Globe size={64} strokeWidth={1} />
                  </div>
                  <div className="relative z-10 space-y-2">
                    <h2 className="text-3xl font-black text-amber-400 arabic-font">
                      {lang === 'ar' ? 'جواز سفر ثقافي' : 'Cultural Passport'}
                    </h2>
                    <p className="text-amber-400/60 font-bold uppercase tracking-[0.2em] text-[10px]">
                      {lang === 'ar' ? 'جامعة الدول العربية' : 'League of Arab Nations'}
                    </p>
                  </div>
                  <div className="relative z-10 bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-full">
                    <p className="text-amber-100/80 text-xs font-bold leading-relaxed arabic-font">
                      {lang === 'ar' 
                        ? 'هذا الجواز يمنح لحامله تقديراً لجهوده في استكشاف اللهجات العربية وتعلم ثقافات الشعوب.' 
                        : 'This passport is granted to its holder in recognition of their efforts in exploring Arabic dialects and learning about diverse cultures.'}
                    </p>
                  </div>
                  <div className="relative z-10 pt-10">
                    <div className="text-5xl font-black text-amber-400/10 arabic-font">قُـل</div>
                  </div>
                </div>

                {/* Passport Right Side (Stamps Grid) */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scroll bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
                  <div className="flex items-center justify-between mb-12">
                    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                      <h3 className="text-3xl font-black text-slate-800 arabic-font">
                        {lang === 'ar' ? 'أختام الدول' : 'Country Stamps'}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {lang === 'ar' ? 'رحلتك عبر الوطن العربي' : 'Your Journey Across the Arab World'}
                      </p>
                    </div>
                    <div className="bg-amber-100 px-6 py-3 rounded-2xl border border-amber-200 shadow-sm flex flex-col items-center">
                      <span className="text-amber-700 font-black text-xl leading-none">
                        {Object.values(stampedCountries).filter(r => r >= 1).length} / 22
                      </span>
                      <span className="text-[8px] font-black text-amber-600/60 uppercase mt-1 tracking-tighter">Explored</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                    {COUNTRY_DATA.map(country => {
                      const rank = stampedCountries[country.id] || 0;
                      const isStamped = rank >= 1;
                      
                      // Define passport colors based on real country passport colors
                      const passportColors: Record<string, string> = {
                        uae: 'bg-[#002043]', egypt: 'bg-[#006241]', saudi: 'bg-[#006241]', 
                        morocco: 'bg-[#006241]', jordan: 'bg-[#002043]', lebanon: 'bg-[#002043]',
                        palestine: 'bg-[#1a1a1a]', iraq: 'bg-[#002043]', tunisia: 'bg-[#c8102e]',
                        algeria: 'bg-[#006241]', libya: 'bg-[#002043]', syria: 'bg-[#002043]',
                        sudan: 'bg-[#006241]', oman: 'bg-[#8b1a1a]', kuwait: 'bg-[#002043]',
                        qatar: 'bg-[#8b1a1a]', bahrain: 'bg-[#c8102e]', yemen: 'bg-[#002043]',
                        mauritania: 'bg-[#006241]', somalia: 'bg-[#4189dd]', djibouti: 'bg-[#006241]',
                        comoros: 'bg-[#006241]'
                      };

                      const countryCrests: Record<string, string> = {
                        uae: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Emblem_of_the_United_Arab_Emirates.svg',
                        egypt: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Coat_of_arms_of_Egypt_%28Official%29.svg',
                        saudi: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Emblem_of_Saudi_Arabia.svg',
                        morocco: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Coat_of_arms_of_Morocco.svg',
                        jordan: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Coat_of_arms_of_Jordan.svg',
                        lebanon: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Coat_of_arms_of_Lebanon.svg',
                        palestine: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Coat_of_arms_of_Palestine_%28alternative%29.svg',
                        iraq: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Coat_of_arms_of_Iraq.svg',
                        tunisia: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Coat_of_arms_of_Tunisia.svg',
                        algeria: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Emblem_of_Algeria.svg',
                        libya: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Emblem_of_Libya.svg',
                        syria: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Coat_of_arms_of_Syria.svg',
                        sudan: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Emblem_of_Sudan.svg',
                        oman: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/National_emblem_of_Oman.svg',
                        kuwait: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Emblem_of_Kuwait.svg',
                        qatar: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Emblem_of_Qatar.svg',
                        bahrain: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Emblem_of_Bahrain.svg',
                        yemen: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Emblem_of_Yemen.svg',
                        mauritania: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Seal_of_Mauritania.svg',
                        somalia: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Coat_of_arms_of_Somalia.svg',
                        djibouti: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Emblem_of_Djibouti.svg',
                        comoros: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Seal_of_the_Comoros.svg'
                      };

                      const countryOfficialNames: Record<string, { ar: string, en: string }> = {
                        uae: { ar: 'الإمارات العربية المتحدة', en: 'UNITED ARAB EMIRATES' },
                        egypt: { ar: 'جمهورية مصر العربية', en: 'ARAB REPUBLIC OF EGYPT' },
                        saudi: { ar: 'المملكة العربية السعودية', en: 'KINGDOM OF SAUDI ARABIA' },
                        morocco: { ar: 'المملكة المغربية', en: 'KINGDOM OF MOROCCO' },
                        jordan: { ar: 'المملكة الأردنية الهاشمية', en: 'HASHEMITE KINGDOM OF JORDAN' },
                        lebanon: { ar: 'الجمهورية اللبنانية', en: 'LEBANESE REPUBLIC' },
                        palestine: { ar: 'دولة فلسطين', en: 'STATE OF PALESTINE' },
                        iraq: { ar: 'جمهورية العراق', en: 'REPUBLIC OF IRAQ' },
                        tunisia: { ar: 'الجمهورية التونسية', en: 'REPUBLIC OF TUNISIA' },
                        algeria: { ar: 'الجمهورية الجزائرية الديمقراطية الشعبية', en: 'PEOPLE\'S DEMOCRATIC REPUBLIC OF ALGERIA' },
                        libya: { ar: 'دولة ليبيا', en: 'STATE OF LIBYA' },
                        syria: { ar: 'الجمهورية العربية السورية', en: 'SYRIAN ARAB REPUBLIC' },
                        sudan: { ar: 'جمهورية السودان', en: 'REPUBLIC OF THE SUDAN' },
                        oman: { ar: 'سلطنة عمان', en: 'SULTANATE OF OMAN' },
                        kuwait: { ar: 'دولة الكويت', en: 'STATE OF KUWAIT' },
                        qatar: { ar: 'دولة قطر', en: 'STATE OF QATAR' },
                        bahrain: { ar: 'مملكة البحرين', en: 'KINGDOM OF BAHRAIN' },
                        yemen: { ar: 'الجمهورية اليمنية', en: 'REPUBLIC OF YEMEN' },
                        mauritania: { ar: 'الجمهورية الإسلامية الموريتانية', en: 'ISLAMIC REPUBLIC OF MAURITANIA' },
                        somalia: { ar: 'جمهورية الصومال الفيدرالية', en: 'FEDERAL REPUBLIC OF SOMALIA' },
                        djibouti: { ar: 'جمهورية جيبوتي', en: 'REPUBLIC OF DJIBOUTI' },
                        comoros: { ar: 'جمهورية القمر المتحدة', en: 'UNION OF THE COMOROS' }
                      };

                      return (
                        <div 
                          key={country.id}
                          className={`relative group transition-all duration-500 ${isStamped ? 'scale-100' : 'scale-95 opacity-40 grayscale'}`}
                        >
                          {/* Passport Shape */}
                          <div className={`aspect-[3/4.2] rounded-xl shadow-2xl overflow-hidden flex flex-col p-6 relative border border-white/10 ${passportColors[country.id] || 'bg-slate-800'}`}>
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                            
                            {/* Passport Header (Official Name) */}
                            <div className="text-center space-y-1 relative z-10">
                              <h4 className="text-[10px] font-black text-amber-400/95 arabic-font leading-tight tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
                                {countryOfficialNames[country.id]?.ar || country.nameAr}
                              </h4>
                              <p className="text-[7px] font-black text-amber-400/80 uppercase tracking-[0.15em] leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" dir="ltr">
                                {countryOfficialNames[country.id]?.en || country.nameEn}
                              </p>
                            </div>

                            {/* Passport Emblem (Official Crest) */}
                            <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-4">
                              <div className="w-24 h-24 flex items-center justify-center relative">
                                {/* Gold Foil Effect Glow */}
                                <div className="absolute inset-0 bg-amber-400/10 blur-2xl rounded-full" />
                                <SafeImage 
                                  src={countryCrests[country.id]} 
                                  className="w-full h-full object-contain brightness-0 invert sepia(1) saturate(10) hue-rotate(15deg) contrast(1.2) opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" 
                                  alt="Crest"
                                />
                              </div>
                            </div>

                            {/* Passport Footer */}
                            <div className="text-center relative z-10 space-y-4">
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-4 w-full justify-center">
                                  <div className="h-[1px] flex-1 bg-amber-400/30" />
                                  <p className="text-[11px] text-amber-400 font-black tracking-[0.5em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" dir="ltr">
                                    PASSPORT
                                  </p>
                                  <div className="h-[1px] flex-1 bg-amber-400/30" />
                                </div>
                                
                                {/* Biometric Symbol */}
                                <div className="w-8 h-5 border-2 border-amber-400/60 rounded-md flex items-center justify-center relative overflow-hidden bg-transparent shadow-[inset_0_0_4px_rgba(0,0,0,0.2)]">
                                  <div className="w-4 h-2.5 border border-amber-400/60 rounded-sm flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-amber-400/60 rounded-full" />
                                  </div>
                                  <div className="absolute left-0 right-0 h-[1px] bg-amber-400/60 top-1/2 -translate-y-1/2" />
                                </div>
                              </div>

                              <div className="flex justify-between items-center px-2">
                                <p className="text-[6px] text-amber-400/50 font-mono font-black tracking-widest">
                                  {['A','B','C','L','P'][Math.floor(Math.random() * 5)]}{Math.floor(Math.random() * 90000000 + 10000000)}
                                </p>
                                <p className="text-[6px] text-amber-400/50 font-mono font-bold tracking-widest">
                                  {stampedCountries[country.id] ? 'VALID' : 'ISSUED'}
                                </p>
                              </div>
                            </div>

                            {/* Stamp Overlay */}
                            {rank >= 1 && (
                              <motion.div 
                                initial={{ scale: 3, opacity: 0, rotate: -30 }}
                                animate={{ scale: 1, opacity: 1, rotate: -15 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                              >
                                <div className={`w-32 h-32 border-[6px] rounded-[2.5rem] flex items-center justify-center rotate-[-15deg] bg-white/10 backdrop-blur-[2px] shadow-xl ${rank === 3 ? 'border-amber-500/50' : rank === 2 ? 'border-blue-500/40' : 'border-red-600/30'}`}>
                                  <div className={`w-28 h-28 border-2 rounded-[2rem] flex flex-col items-center justify-center p-2 text-center ${rank === 3 ? 'border-amber-500/30 text-amber-600' : rank === 2 ? 'border-blue-500/30 text-blue-600' : 'border-red-600/20 text-red-700'}`}>
                                    <div className="flex items-center gap-1 mb-1 opacity-60">
                                      <Globe size={8} />
                                      <span className="text-[6px] font-black tracking-widest uppercase">Wesal Immigration</span>
                                    </div>
                                    <div className="h-[1px] w-full bg-current opacity-20 mb-2" />
                                    <span className="text-[12px] font-black uppercase tracking-tighter leading-none mb-1">
                                      {rank === 3 ? 'NATIVE' : rank === 2 ? 'RESIDENT' : 'ENTRY'}
                                    </span>
                                    <span className="text-[8px] font-black tracking-widest mb-2">APPROVED</span>
                                    <div className="h-[1px] w-full bg-current opacity-20 mt-1 mb-2" />
                                    <div className="flex flex-col items-center opacity-70">
                                      <span className="text-[7px] font-mono font-black">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
                                      <Plane size={10} className="mt-1 rotate-45" />
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* Country Label Below (Flag + Name) */}
                          <div className="mt-4 text-center space-y-1.5">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-xl drop-shadow-sm">{country.flag}</span>
                              <span className="text-sm font-black text-slate-800 arabic-font">
                                {lang === 'ar' ? country.nameAr : country.nameEn}
                              </span>
                            </div>
                            {rank > 0 && (
                              <div className="flex justify-center gap-0.5">
                                {[1, 2, 3].map(star => (
                                  <Star key={star} size={10} fill={star <= rank ? "#f59e0b" : "transparent"} className={star <= rank ? "text-amber-500" : "text-slate-200"} />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Rank Badge */}
                          {rank === 3 && (
                            <div className="absolute -top-2 -right-2 z-30">
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                              >
                                <Trophy size={14} fill="white" />
                              </motion.div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={() => setIsPassportOpen(false)}
                  className="absolute top-6 right-6 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-xl border border-slate-200 z-[110]"
                >
                  <Square size={24} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
