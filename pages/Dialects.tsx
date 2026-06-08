import React, { useState } from 'react';
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
import { generateSpeech, decodeAudioData, evaluatePronunciation } from '../services/gemini';

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
        { role: 'Buyer', ar: 'بكم هذا القميص？', dialect: 'بكام القميص ده يا باشا؟', en: 'How much is this shirt?' },
        { role: 'Seller', ar: 'ثمنه مائة جنيه.', dialect: 'ده بمية جنيه بس عشان خاطرك.', en: 'It is 100 pounds, just for you.' }
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
      clothingAr: 'الدشداشة العراقية مع اليشماغ والعباءة.', 
      clothingEn: 'Iraqi Dishdasha with Yeshmagh and Bisht.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20male%20character%20from%20Iraq%20wearing%20traditional%20Dishdasha%20and%20Yeshmagh%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    characterFemale: { 
      nameAr: 'ريم', 
      nameEn: 'Reem', 
      clothingAr: 'الهاشمي العراقي التقليدي الفاخر المطرز بالذهب.', 
      clothingEn: 'Traditional luxury Iraqi Hashemi dress with gold embroidery.',
      image: 'https://image.pollinations.ai/prompt/3d%20cartoon%20style%20full%20body%20female%20character%20from%20Iraq%20wearing%20traditional%20Hashemi%20dress%20smiling%20friendly%20white%20background?width=800&height=1200&nologo=true' 
    },
    missions: {
      visitor: { ar: "بلاد الرافدين: ابدأ رحلتك بالترحيب البغدادي الأصيل وتعرف على شارع الرشيد التاريخي.", en: "Mesopotamia: Start your journey with authentic Baghdadi greetings and explore historic Al-Rashid Street." },
      resident: { ar: "المسكوف العراقي: انضم إلى مائدة عراقية واطلب السمك المسكوف الشهير بلهجة محلية.", en: "Iraqi Masgouf: Join an Iraqi feast and order the famous Masgouf fish using local terms." },
      native: { ar: "شعر وفن: شارك في أمسية ثقافية في المتنبي وناقش روائع الشعر العربي الأصيل.", en: "Poetry & Art: Participate in a cultural evening at Al-Mutanabbi street and discuss classic Arabic poetry masterpieces." }
    },
    culture: {
      factAr: 'بغداد كانت عاصمة الدولة العباسية ومركزاً عالمياً للعلم والثقافة.',
      factEn: 'Baghdad was the capital of the Abbasid Caliphate and a global center for science and culture.',
      items: [
        { nameAr: 'السمك المسكوف', nameEn: 'Masgouf Fish', icon: '🐟', descAr: 'الأكلة العراقية الأكثر شهرة وتطبخ على حطب أشجار المشمش.', descEn: 'The most famous Iraqi dish, grilled uniquely over apricot woodfires.' },
        { nameAr: 'شاي أبو الهيل', nameEn: 'Cardamom Tea', icon: '🫖', descAr: 'الشاي العراقي الثقيل المعطر بالهيل ويقدم في "الاستكان".', descEn: 'Strong Iraqi tea flavored with cardamom and served in a traditional Istikan glass.' },
        { nameAr: 'النخيل', nameEn: 'Palm Trees', icon: '🌴', descAr: 'يضم العراق ملايين أشجار النخيل التي تنتج التمور الفاخرة مثل البرحي.', descEn: 'Iraq is home to millions of date palms producing luxury varieties like Barhi.' },
        { nameAr: 'الملوية', nameEn: 'Malwiya Minaret', icon: '🕌', descAr: 'مئذنة مسجد سامراء الفريدة بشكلها الحلزوني المذهل.', descEn: 'The unique spiral minaret of Samarra, an architectural icon of Islamic heritage.' },
        { nameAr: 'بوابة عشتار', nameEn: 'Ishtar Gate', icon: '🏛️', descAr: 'البوابة الثامنة لمدينة بابل التاريخية القديمة.', descEn: 'The grand eighth gate to the inner city of ancient Babylon.' }
      ]
    },
    vocab: [
      { fusha: 'كيف حالك؟', dialect: 'شلونك؟ / شكو ماكو؟', roman: 'Shlonak? / Shako Mako?', en: 'How are you? / What\'s up?' },
      { fusha: 'أنا بخير', dialect: 'زين / تمام', roman: 'Zein / Tamam', en: 'I am good' },
      { fusha: 'كثيراً', dialect: 'كلش', roman: 'Kullish', en: 'A lot' },
      { fusha: 'الآن', dialect: 'هسه', roman: 'Hassa', en: 'Now' },
      { fusha: 'جميل', dialect: 'حلو / فد شيء', roman: 'Helou / Fad Shi', en: 'Beautiful / Something special' },
      { fusha: 'أين؟', dialect: 'وين؟', roman: 'Wein?', en: 'Where?' },
      { fusha: 'ماذا؟', dialect: 'شنو؟', roman: 'Shno?', en: 'What?' },
      { fusha: 'بسرعة', dialect: 'على السريع / استعجل', roman: 'Ala Saree / Istajil', en: 'Fast' }
    ],
    dialogue: {
      title: 'في المقهى التراثي',
      lines: [
        { role: 'Server', ar: 'ماذا تشرب يا أخي؟', dialect: 'تفضل عيوني، شنو تشرب؟ چاي لو حامض؟', en: 'What would you like to drink, my dear?' },
        { role: 'Customer', ar: 'أريد شاياً بالهيل من فضلك.', dialect: 'فدوة لعينك، صبلي چاي حار وسنگين.', en: 'Please, pour me a hot and strong cardamom tea.' }
      ]
    }
  }
];

export default function CountryJourney() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_DATA[0]);
  const [activeTab, setActiveTab] = useState<'missions' | 'culture' | 'vocab' | 'dialogue'>('missions');
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dir-rtl p-3 sm:p-4 md:p-6 lg:p-8">
      {/* الهيدر المتجاوب */}
      <div className="max-w-7xl mx-auto mb-6">
        <PageHeader title="رحلة اللهجات العربية" description="اكتشف الثقافات وتحدث مثل أهل البلد" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        
        {/* شريط اختيار الدول المتجاوب (أفقي في الموبايل، عمودي في الشاشات الكبيرة) */}
        <div className="lg:col-span-3 flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-3 lg:pb-0 scrollbar-none snap-x">
          {COUNTRY_DATA.map((country) => (
            <button
              key={country.id}
              onClick={() => setSelectedCountry(country)}
              className={`flex-shrink-0 snap-start flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 border text-right w-auto lg:w-full ${
                selectedCountry.id === country.id
                  ? 'bg-gradient-to-l from-amber-500 to-amber-600 text-white shadow-md border-amber-600'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span className="text-2xl" role="img" aria-label={country.nameEn}>{country.flag}</span>
              <div className="flex flex-col">
                <span className="font-bold text-sm sm:text-base">{country.nameAr}</span>
                <span className={`text-xs ${selectedCountry.id === country.id ? 'text-amber-100' : 'text-slate-400'}`}>
                  {country.dialect}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* منطقة المحتوى الرئيسية */}
        <div className="lg:col-span-9 space-y-4 md:space-y-6">
          
          {/* بانر الدولة مع المؤثرات البصرية */}
          <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={selectedCountry.image} 
              alt={selectedCountry.nameAr} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
            <div className="absolute bottom-4 right-4 text-white p-2">
              <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                <span>{selectedCountry.flag}</span> {selectedCountry.nameAr}
              </h2>
              <p className="text-amber-300 text-xs sm:text-sm mt-1">لهجة {selectedCountry.dialect}</p>
            </div>
          </div>

          {/* استعراض الشخصيات الكرتونية بشكل متجاوب */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { type: 'male', data: selectedCountry.characterMale },
              { type: 'female', data: selectedCountry.characterFemale }
            ].map((char) => (
              <div key={char.type} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 shadow-sm">
                <div className="w-20 h-24 sm:w-24 sm:h-32 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={char.data.image} alt={char.data.nameAr} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-slate-800 text-base sm:text-lg">{char.data.nameAr}</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{char.data.clothingAr}</p>
                </div>
              </div>
            ))}
          </div>

          {/* التبويبات الداخلية المتجاوبة تفاعلياً */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none bg-slate-50/50">
              {[
                { id: 'missions', label: 'المهمات', icon: Trophy },
                { id: 'culture', label: 'الثقافة', icon: MapIcon },
                { id: 'vocab', label: 'المفردات', icon: MessageSquare },
                { id: 'dialogue', label: 'المحادثة', icon: MessageCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[90px] py-3.5 px-2 text-center flex flex-col sm:flex-row items-center justify-center gap-1.5 font-bold text-xs sm:text-sm border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-amber-500 text-amber-600 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* عرض محتوى التبويبات مع معالجة أحجام الشاشات */}
            <div className="p-4 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab + selectedCountry.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* تـبـويب الـمـهـمـات */}
                  {activeTab === 'missions' && (
                    <div className="space-y-3">
                      {Object.entries(selectedCountry.missions).map(([level, mission]) => (
                        <div key={level} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            level === 'visitor' ? 'bg-blue-100 text-blue-700' :
                            level === 'resident' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {level === 'visitor' ? 'زائر' : level === 'resident' ? 'مقيم' : 'ابن البلد'}
                          </span>
                          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{mission.ar}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* تـبـويب الـثـقـافـة */}
                  {activeTab === 'culture' && (
                    <div className="space-y-4">
                      <div className="p-3 bg-amber-50 rounded-lg text-amber-900 border border-amber-100 flex items-center gap-2 text-xs sm:text-sm">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        <p className="font-medium"><strong>حقيقة ثقافية:</strong> {selectedCountry.culture.factAr}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedCountry.culture.items.map((item, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm space-y-1">
                            <div className="flex items-center gap-2 text-lg">
                              <span>{item.icon}</span>
                              <h5 className="font-bold text-slate-800 text-sm sm:text-base">{item.nameAr}</h5>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{item.descAr}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* تـبـويب الـمـفـردات */}
                  {activeTab === 'vocab' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedCountry.vocab.map((v, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs sm:text-sm">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm sm:text-base">{v.dialect}</span>
                              <span className="text-slate-400 text-xs">({v.fusha})</span>
                            </div>
                            <p className="text-slate-400 text-xs">{v.roman} • {v.en}</p>
                          </div>
                          <button className="p-2 rounded-full bg-white shadow-sm border border-slate-100 hover:bg-amber-50 text-amber-600 transition-colors">
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* تـبـويب الـمـحـادثـة المطور */}
                  {activeTab === 'dialogue' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-700 text-sm border-r-4 border-amber-500 pr-2">
                        {selectedCountry.dialogue.title}
                      </h4>
                      <div className="space-y-3 bg-slate-50 p-3 sm:p-4 rounded-xl max-h-[300px] overflow-y-auto">
                        {selectedCountry.dialogue.lines.map((line, idx) => (
                          <div key={idx} className={`flex flex-col space-y-1 ${idx % 2 === 0 ? 'items-start' : 'items-end'}`}>
                            <span className="text-[10px] font-bold text-slate-400 px-1">{line.role}</span>
                            <div className={`p-3 rounded-2xl max-w-[85%] text-xs sm:text-sm ${
                              idx % 2 === 0 
                                ? 'bg-amber-500 text-white rounded-tr-none' 
                                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                            }`}>
                              <p className="font-bold">{line.dialect}</p>
                              <p className={`text-[11px] mt-0.5 ${idx % 2 === 0 ? 'text-amber-100' : 'text-slate-400'}`}>
                                الفصحى: {line.ar}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* واجهة النطق والتفاعل مع الهاتف المحمول */}
                      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between p-3 border border-dashed border-slate-200 rounded-xl">
                        <span className="text-xs text-slate-500 text-center sm:text-right">اضغط وتدرب على نطق العبارة السابقة بنفس اللهجة:</span>
                        <button 
                          onClick={() => setIsRecording(!isRecording)}
                          className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                            isRecording 
                              ? 'bg-red-500 text-white animate-pulse' 
                              : 'bg-slate-800 text-white hover:bg-slate-700'
                          }`}
                        >
                          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          {isRecording ? 'إيقاف التسجيل والدراسة...' : 'ابدأ النطق الآن'}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
