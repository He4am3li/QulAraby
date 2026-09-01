import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, BookText, Trash2, Volume2, Sparkles, X, Lightbulb, Download,
  BookOpen, Info, Loader2, Trees as TreeIcon, Compass, FileText, Eye,
  CheckCircle2, XCircle, ArrowRight, MousePointer2, 
  Layers, Star, BrainCircuit, Zap, Globe2, ChevronRight, Hash, Users, Home, School, Hotel, Plane, Calendar, CloudSun, Palette, Utensils, Activity, Leaf, Apple, Bird, Fish, Bug, Clock, Briefcase, MapPin, Sparkle, Flag, HelpCircle, Navigation, Car, Gamepad2, Trophy, Scale, Globe, Wrench, Languages, LayoutGrid, GraduationCap, ChevronLeft, ArrowUpRight, Monitor, Laptop, BriefcaseIcon, Heart, Waves, Tent, Palmtree, Fingerprint, RefreshCcw, HelpCircle as HelpIcon, Calculator, ListChecks, MessageSquare, Image as ImageIcon
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { LanguageToggle } from '../components/LanguageToggle';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { Vocabulary, MasteryLevel } from '../types';
import { generateSpeech, decodeAudioData, getWordDeepAnalysis, generateThemedVocabulary, generateWordIllustration, speak } from '../services/gemini';
import { useAuth } from '../components/AuthProvider';
import { db, handleFirestoreError, OperationType, serverTimestamp } from '../firebase';
import { collection, query, where, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';

const ALL_TOPICS = [
  { id: 'about_me', ar: 'التحيات والتعارف', en: 'GREETINGS & INTRODUCTIONS', icon: '👋🏻', color: 'blue' },
  { id: 'family_hobbies', ar: 'العائلة', en: 'FAMILY', icon: '👪', color: 'rose' },
  { id: 'feelings', ar: 'المشاعر', en: 'FEELINGS', icon: '😊', color: 'amber' },
  { id: 'body_parts', ar: 'أجزاء الجسم', en: 'BODY PARTS', icon: '🧍🏻', color: 'pink' },
  { id: 'clothing', ar: 'الملابس', en: 'CLOTHING', icon: '👕', color: 'sky' },
  { id: 'living', ar: 'في البيت', en: 'AT HOME', icon: '🏠', color: 'emerald' },
  { id: 'routine', ar: 'الروتين اليومي', en: 'DAILY ROUTINE', icon: '🔄', color: 'orange' },
  { id: 'food_drink', ar: 'الطعام والشراب', en: 'FOOD & DRINK', icon: '🍝🥤', color: 'orange' },
  { id: 'fruits', ar: 'الفاكهة', en: 'FRUIT', icon: '🍓', color: 'red' },
  { id: 'vegetables', ar: 'الخضروات', en: 'VEGETABLES', icon: '🥗', color: 'green' },
  { id: 'key_phrases', ar: 'في الفصل', en: 'IN CLASS', icon: '🏫', color: 'indigo' },
  { id: 'survival', ar: 'المواد المدرسية', en: 'SCHOOL SUBJECTS', icon: '📚', color: 'red' },
  { id: 'time', ar: 'الوقت', en: 'TIME', icon: '⌚', color: 'yellow' },
  { id: 'weather', ar: 'الطقس', en: 'WEATHER', icon: '🌤️', color: 'sky' },
  { id: 'instructions', ar: 'الشهور', en: 'MONTHS', icon: '📅', color: 'teal' },
  { id: 'colours', ar: 'الألوان', en: 'COLOURS', icon: '🎨', color: 'purple' },
  { id: 'animals', ar: 'الحيوانات', en: 'ANIMALS', icon: '🦒', color: 'orange' },
  { id: 'birds', ar: 'الطيور', en: 'BIRDS', icon: '🦅', color: 'sky' },
  { id: 'fish_creatures', ar: 'الأسماك', en: 'FISH & SEA', icon: '🐠', color: 'blue' },
  { id: 'insects_reptiles', ar: 'الحشرات والزواحف', en: 'INSECTS & REPTILES', icon: '🦋\n🐍', color: 'lime' },
  { id: 'places', ar: 'الأماكن', en: 'PLACES', icon: '🎡', color: 'emerald' },
  { id: 'sports', ar: 'الرياضة', en: 'SPORTS', icon: '⚽', color: 'green' },
  { id: 'transport', ar: 'وسائل النقل', en: 'TRANSPORT', icon: '🚗', color: 'red' },
  { id: 'jobs', ar: 'المهن', en: 'JOBS', icon: '👨🏻‍✈️', color: 'slate' },
  { id: 'shopping', ar: 'التسوق', en: 'SHOPPING', icon: '🛒', color: 'yellow' },
  { id: 'health', ar: 'الصحة', en: 'HEALTH', icon: '🏥', color: 'rose' },
  { id: 'tech', ar: 'التكنولوجيا', en: 'TECHNOLOGY', icon: '💻', color: 'gray' },
  { id: 'nature', ar: 'الطبيعة', en: 'NATURE', icon: '🌲', color: 'green' },
  { id: 'music', ar: 'الموسيقى', en: 'MUSIC', icon: '🎻', color: 'purple' },
  { id: 'travel', ar: 'السفر', en: 'TRAVEL', icon: '✈️', color: 'blue' },
];

const TOPIC_COLORS: Record<string, { bg: string, border: string, text: string, light: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', light: 'bg-blue-50/50' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', light: 'bg-emerald-50/50' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', light: 'bg-rose-50/50' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', light: 'bg-indigo-50/50' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', light: 'bg-red-50/50' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', light: 'bg-amber-50/50' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', light: 'bg-teal-50/50' },
  sky: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-600', light: 'bg-sky-50/50' },
  stone: { bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-600', light: 'bg-stone-50/50' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', light: 'bg-purple-50/50' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', light: 'bg-orange-50/50' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', light: 'bg-cyan-50/50' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', light: 'bg-violet-50/50' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', light: 'bg-yellow-50/50' },
  lime: { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-600', light: 'bg-lime-50/50' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', light: 'bg-pink-50/50' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', light: 'bg-slate-50/50' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', light: 'bg-green-50/50' },
  gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', light: 'bg-gray-50/50' },
};

const highlightWord = (text: string, word: string) => {
  if (!word) return text;
  // Use a regex to find the word, but handle Arabic specifics if needed
  // For now, a simple split and map works well for exact matches
  const parts = text.split(new RegExp(`(${word})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part === word 
          ? <span key={i} className="text-emerald-600 font-black underline decoration-emerald-200 decoration-2 underline-offset-4">{part}</span> 
          : part
      )}
    </>
  );
};

const DiscoveryCard: React.FC<{ 
  word: Partial<Vocabulary>, 
  isLoading: boolean, 
  onDeepDive: (word: Vocabulary) => void,
  onSpeak: (text: string, lang: 'ar' | 'en') => void,
  lang: 'ar' | 'en'
}> = ({ word, isLoading, onDeepDive, onSpeak, lang }) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [showSentenceTranslation, setShowSentenceTranslation] = React.useState(false);

  return (
    <div 
      className="w-full max-w-[320px] mx-auto relative perspective-1000 h-[400px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
       <motion.div 
         className="w-full h-full relative transform-style-3d transition-all duration-500"
         animate={{ rotateY: isFlipped ? 180 : 0 }}
       >
           {/* FRONT Side */}
           <div className={`absolute inset-0 backface-hidden bg-white rounded-3xl border border-slate-100 flex flex-col items-center p-6 shadow-xl overflow-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="w-full aspect-square bg-slate-50 rounded-2xl border border-slate-50 flex items-center justify-center p-4 mb-4 relative overflow-hidden">
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm z-20">
                    <Loader2 className="animate-spin text-emerald-500" size={28} />
                  </div>
                ) : word.image_data ? (
                  <motion.img 
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     src={word.image_data} 
                     alt="Illustration" 
                     className="max-w-full max-h-full object-contain drop-shadow-lg" 
                     referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-10">
                    <ImageIcon size={48} className="text-slate-400" />
                  </div>
                )}

                <button 
                  onClick={(e) => { e.stopPropagation(); onDeepDive(word as Vocabulary); }} 
                  className="absolute bottom-2.5 right-2.5 p-2 bg-white/60 backdrop-blur-sm border border-white/40 text-emerald-600 rounded-lg shadow-lg hover:bg-emerald-600 hover:text-white transition-all active:scale-90"
                >
                  <BrainCircuit size={14} />
                </button>
              </div>

              <div className="mt-auto w-full text-center">
                <h2 className="text-3xl font-black text-slate-800 arabic-font mb-4 leading-relaxed pt-1">{word.original_word}</h2>
                <button 
                  onClick={(e) => { e.stopPropagation(); onSpeak(word.original_word!, 'ar'); }} 
                  className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm hover:bg-emerald-600 hover:text-white transition-all active:scale-90 border border-emerald-100"
                >
                  <Volume2 size={24} />
                </button>
              </div>
           </div>

           {/* BACK Side */}
           <div className={`absolute inset-0 backface-hidden bg-white text-slate-800 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 border border-slate-100 rotate-y-180 relative overflow-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10 pointer-events-none" />
              
              <div className="w-full text-center relative z-10">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Definition</span>
                <h3 className={`font-black tracking-tighter uppercase text-slate-900 leading-none mb-6 whitespace-nowrap overflow-hidden text-ellipsis w-full px-2 text-center ${
                 (word.translation || '').length > 25 ? 'text-sm md:text-base' :
                 (word.translation || '').length > 20 || (word.translation || '').includes(' ') || (word.translation || '').includes('/') ? 'text-lg md:text-xl' :
                 (word.translation || '').length > 15 ? 'text-xl md:text-2xl' :
                 (word.translation || '').length > 11 ? 'text-2xl md:text-3xl' :
                 'text-3xl'
               }`}>{word.translation}</h3>
                
                <div className="w-12 h-1 bg-slate-100 mx-auto mb-6 rounded-full" />
                
                {word.analysis?.details_ar?.example && (
                  <div className="space-y-4">
                    <div 
                      onClick={(e) => { e.stopPropagation(); setShowSentenceTranslation(!showSentenceTranslation); }}
                      className="cursor-help bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 hover:bg-emerald-50 transition-colors"
                    >
                      <p className="text-sm md:text-md arabic-font font-medium leading-relaxed text-slate-600 italic pt-1">
                        {showSentenceTranslation ? `"${word.analysis?.details_en?.example}"` : `"${highlightWord(word.analysis?.details_ar?.example, word.original_word || '')}"`}
                      </p>
                      <p className="mt-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">{showSentenceTranslation ? (lang === 'ar' ? 'الترجمة' : 'Translation') : (lang === 'ar' ? 'انقر للترجمة' : 'Click to translate')}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSpeak(word.analysis?.details_ar?.example!, 'ar'); }} 
                      className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-sm hover:bg-indigo-600 hover:text-white transition-all active:scale-90 border border-indigo-100"
                    >
                      <Volume2 size={24} />
                    </button>
                  </div>
                )}
              </div>
           </div>
       </motion.div>
    </div>
  );
};

const InteractiveActivitiesSidePanel: React.FC<{
  word: Vocabulary,
  lang: 'ar' | 'en',
  onClose: () => void,
  onSpeak: (text: string, lang: 'ar' | 'en') => void
}> = ({ word, lang, onClose, onSpeak }) => {
  const [activeActivity, setActiveActivity] = React.useState<'none' | 'scramble' | 'quiz'>('none');
  const [scrambled, setScrambled] = React.useState<string[]>([]);
  const [userGuess, setUserGuess] = React.useState<string[]>([]);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);

  const startScramble = () => {
    const letters = word.original_word.split('').filter(l => l !== ' ');
    setScrambled([...letters].sort(() => Math.random() - 0.5));
    setUserGuess([]);
    setIsCorrect(null);
    setActiveActivity('scramble');
  };

  const handleLetterClick = (letter: string, index: number) => {
    const newGuess = [...userGuess, letter];
    setUserGuess(newGuess);
    setScrambled(prev => prev.filter((_, i) => i !== index));

    if (newGuess.length === word.original_word.split('').filter(l => l !== ' ').length) {
      const isMatch = newGuess.join('') === word.original_word.split('').filter(l => l !== ' ').join('');
      setIsCorrect(isMatch);
      if (isMatch) onSpeak(word.original_word, 'ar');
    }
  };

  return (
    <div className={`absolute inset-y-0 ${lang === 'ar' ? 'left-0 border-r shadow-r-2xl' : 'right-0 border-l shadow-l-2xl'} w-80 bg-white shadow-2xl border-slate-100 z-[200] flex flex-col animate-in ${lang === 'ar' ? 'slide-in-from-left-full' : 'slide-in-from-right-full'} duration-500 no-print`}>
      <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-[#fafafa]">
         <div className={`flex items-center gap-3 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
           <div className="p-3 bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-xl shadow-lg"><BookOpen size={16} /></div>
           <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
              <h3 className="text-sm font-black arabic-font text-slate-800 leading-none">{lang === 'ar' ? 'إتقان الكلمة' : 'Word Mastery'}</h3>
              <p className="text-[7px] font-black text-slate-400 uppercase mt-1">Interactive Learning</p>
           </div>
         </div>
         <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-300 transition-all"><X size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scroll space-y-8">
        <div className={`text-center transition-all duration-500 ${activeActivity === 'scramble' ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
           <h2 className="text-3xl font-black text-slate-800 arabic-font leading-relaxed pt-1 mb-1">{word.original_word}</h2>
           <p className="text-[10px] font-bold text-sky-600 uppercase tracking-tighter mb-4">{word.translation}</p>
           <button 
              onClick={() => onSpeak(word.original_word, 'ar')}
              className="w-10 h-10 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto shadow-sm hover:bg-sky-600 hover:text-white transition-all border border-sky-100"
            >
              <Volume2 size={20} />
            </button>
        </div>

        {activeActivity === 'none' ? (
          <div className="grid grid-cols-1 gap-4">
             <ActivityCard 
                icon={<RefreshCcw size={20} />} 
                title={lang === 'ar' ? 'بعثرة الحروف' : 'Word Scramble'} 
                desc={lang === 'ar' ? 'رتب الحروف لتكون الكلمة' : 'Reorder letters correctly'} 
                onClick={startScramble}
                lang={lang}
             />
             <ActivityCard 
                icon={<ListChecks size={20} />} 
                title={lang === 'ar' ? 'اختبار سريع' : 'Quick Quiz'} 
                desc={lang === 'ar' ? 'اختر المعنى الصحيح' : 'Choose corrected meaning'} 
                onClick={() => setActiveActivity('quiz')}
                lang={lang}
             />
          </div>
        ) : activeActivity === 'scramble' ? (
          <div className="animate-in fade-in zoom-in duration-300">
             <div className="mb-6 flex justify-between items-center text-right" dir="rtl">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'رتب الحروف' : 'Reorder Letters'}</h4>
                <button onClick={() => setActiveActivity('none')} className="text-xs text-slate-300 hover:text-slate-600 font-bold underline">رجوع</button>
             </div>

             <div className="flex flex-wrap justify-center gap-3 mb-10">
                {userGuess.map((letter, i) => (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    key={i} className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-lg font-black text-emerald-700 shadow-sm"
                  >
                    {letter}
                  </motion.div>
                ))}
             </div>

             {isCorrect === null ? (
               <div className="flex flex-wrap justify-center gap-3">
                 {scrambled.map((letter, i) => (
                   <button 
                      key={i} onClick={() => handleLetterClick(letter, i)}
                      className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-lg font-black text-slate-700 shadow-lg hover:-translate-y-1 transition-all active:scale-90"
                   >
                     {letter}
                   </button>
                 ))}
               </div>
             ) : (
               <div className="text-center animate-in zoom-in duration-500">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {isCorrect ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                  </div>
                  <h5 className="text-sm font-black arabic-font mb-4">{isCorrect ? (lang === 'ar' ? 'أحسنت! إجابة صحيحة' : 'Excellent! Correct') : (lang === 'ar' ? 'حاول مرة أخرى' : 'Try Again')}</h5>
                  <button onClick={startScramble} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                  </button>
               </div>
             )}
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300 text-center py-10 opacity-40">
             <Zap size={48} className="mx-auto mb-4" />
             <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Activity Coming Soon...</p>
             <button onClick={() => setActiveActivity('none')} className="mt-4 text-xs text-slate-300 hover:text-slate-600 font-bold underline">رجوع</button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-50 bg-[#fafafa]">
         <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md">{lang === 'ar' ? 'إغلاق' : 'Close'}</button>
      </div>
    </div>
  );
};

const ActivityCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, onClick: () => void, lang: 'ar' | 'en' }> = ({ icon, title, desc, onClick, lang }) => (
  <button 
    onClick={onClick}
    className={`w-full p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-sky-200 transition-all group flex items-start gap-4 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}
  >
     <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl group-hover:bg-sky-600 group-hover:text-white transition-all shadow-inner">
       {icon}
     </div>
     <div className={`flex-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
        <h4 className="text-sm font-black arabic-font text-slate-800 mb-1">{title}</h4>
        <p className="text-[10px] font-medium text-slate-400">{desc}</p>
     </div>
  </button>
);

export const VocabularyPage: React.FC = () => {
  const { user, isAuthReady } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'lexicon' | 'discovery'>('discovery');
  const [vocab, setVocab] = React.useState<Vocabulary[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filter, setFilter] = React.useState<MasteryLevel | 'all'>('all');
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  
  // States
  const [selectedTopic, setSelectedTopic] = React.useState<any | null>(null);
  const [discoveryQueue, setDiscoveryQueue] = React.useState<Partial<Vocabulary>[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isLoadingDiscovery, setIsLoadingDiscovery] = React.useState(false);
  const [isLoadingIllustration, setIsLoadingIllustration] = React.useState(false);
  const [selectedWord, setSelectedWord] = React.useState<Vocabulary | null>(null);
  const [deepAnalysis, setDeepAnalysis] = React.useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = React.useState(false);
  const [showFeelingsChart, setShowFeelingsChart] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);
  const [activeActivityWord, setActiveActivityWord] = React.useState<Vocabulary | null>(null);

  const TOPIC_HINTS: Record<string, { ar: string, en: string }> = {
    feelings: {
      ar: 'هذه الكلمات بصيغة المذكر، أضف ة / ـة لتصبح بصيغة المؤنث.',
      en: 'These words are in the masculine form. Add ة / ـة to make them feminine.'
    },
    family_hobbies: {
      ar: 'يمكنك إضافة حرف «ي» في نهاية الكلمة للدلالة على الملكية، أي بمعنى «لي / خاصتي».',
      en: 'You can add "ي” in the end of the word if you want to say My ……'
    },
    weather: {
      ar: 'تحدث عن حالة الجو وفصول السنة.',
      en: 'Talk about the weather and seasons.'
    },
    animals: {
      ar: 'لاحظ أن أسماء الحيوانات في العربية لها مذكر ومؤنث مختلف أحياناً.',
      en: 'Note that animal names in Arabic sometimes have different names for male and female.'
    },
    default: {
      ar: 'استخدم هذه الكلمات في جمل يومية لتثبيتها في ذاكرتك.',
      en: 'Use these words in daily sentences to memorize them better.'
    }
  };

  const currentHint = selectedTopic ? (TOPIC_HINTS[selectedTopic.id] || TOPIC_HINTS.default)[lang] : '';

  const audioContextRef = React.useRef<AudioContext | null>(null);

  // Load Vocabulary from Firestore
  React.useEffect(() => {
    if (!user || !isAuthReady) return;

    const q = query(collection(db, 'users', user.uid, 'vocabulary'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const words = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Vocabulary[];
      setVocab(words);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/vocabulary`);
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  React.useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  const t = {
    title: lang === 'ar' ? 'كلماتي الذكية' : 'My Smart Words',
    lexicon: lang === 'ar' ? 'بنك الكلمات' : 'Word Bank',
    discovery: lang === 'ar' ? 'اكتشاف الكلمات' : 'Word Discovery',
    searchPlaceholder: lang === 'ar' ? 'ابحث في كلماتك...' : 'Search your words...',
    all: lang === 'ar' ? 'الكل' : 'All',
    new: lang === 'ar' ? 'جديد' : 'New',
    learning: lang === 'ar' ? 'قيد التعلم' : 'Learning',
    mastered: lang === 'ar' ? 'متقن' : 'Mastered',
    noWords: lang === 'ar' ? 'لا توجد كلمات بعد. ابدأ باكتشاف كلمات جديدة!' : 'No words yet. Start by discovering new words!',
    discoveryTitle: lang === 'ar' ? 'اكتشاف الكلمات الذكي' : 'Smart Word Discovery',
    discoverySubtitle: lang === 'ar' ? 'اختر موضوعاً لتعلم كلمات جديدة مدعومة بالذكاء الاصطناعي.' : 'Choose a topic to learn new words powered by AI.',
    startSession: lang === 'ar' ? 'بدء الجلسة' : 'Start Session',
    loading: lang === 'ar' ? 'جاري تحضير الكلمات...' : 'Preparing words...',
    saveWord: lang === 'ar' ? 'حفظ الكلمة' : 'Save Word',
    nextWord: lang === 'ar' ? 'الكلمة التالية' : 'Next Word',
    finish: lang === 'ar' ? 'إنهاء' : 'Finish',
    deepAnalysis: lang === 'ar' ? 'تحليل لغوي عميق' : 'Deep Linguistic Analysis',
    analysisLoading: lang === 'ar' ? 'جاري التحليل اللغوي...' : 'Analyzing linguistically...',
    words: lang === 'ar' ? 'الكلمات' : 'Words',
    myWords: lang === 'ar' ? 'كلماتي' : 'My Words',
    myBank: lang === 'ar' ? 'بنك الكلمات' : 'Word Bank',
    wordJourney: lang === 'ar' ? 'رحلة الكلمات' : 'Word Journey',
    newWords: lang === 'ar' ? 'كلمات جديدة' : 'New Words',
    progress: lang === 'ar' ? 'التقدم' : 'Progress',
    activeJourney: lang === 'ar' ? 'مغامرة الكلمات الجديدة' : 'New Word Adventure',
    masteredWords: lang === 'ar' ? 'كلماتي التي أتقنتها' : 'Mastered Words',
    personalJourney: lang === 'ar' ? 'رحلتك الشخصية مع الكلمات' : 'Your Personal Word Journey',
    search: lang === 'ar' ? 'ابحث...' : 'Search...',
    allLevels: lang === 'ar' ? 'كل المستويات' : 'All Levels',
    topicAdventure: lang === 'ar' ? 'مغامرة المواضيع' : 'Topic Adventure',
    chooseAdventure: lang === 'ar' ? 'اختر مغامرتك اليوم لنبدأ معاً في تعلم كلمات جديدة وممتعة' : 'Choose your adventure today to start learning new words together',
    fetchingWords: lang === 'ar' ? 'جاري سحب كلمات المغامرة...' : 'Fetching adventure words...',
    drawing: lang === 'ar' ? 'جاري الرسم...' : 'Drawing...',
    smartAnalysis: lang === 'ar' ? 'التحليل الذكي للكلمة' : 'Smart Word Analysis',
    knowIt: lang === 'ar' ? 'أعرفها' : 'I Know It',
    learnIt: lang === 'ar' ? 'أدرسها' : 'I Study It',
    skip: lang === 'ar' ? 'تجاهل' : 'Skip',
    wordMastery: lang === 'ar' ? 'إتقان الكلمة' : 'Word Mastery',
    wordFamily: lang === 'ar' ? 'عائلة الكلمة' : 'Word Family',
    example: lang === 'ar' ? 'مثال للاستخدام' : 'Usage Example',
    close: lang === 'ar' ? 'إغلاق' : 'Close',
  };

  const initAudio = () => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  };

  const speakWord = async (text: string, lang: 'ar' | 'en') => {
    await speak(text, lang);
  };

  const startDiscovery = async (topic: any) => {
    setSelectedTopic(topic);
    setIsLoadingDiscovery(true);
    setCurrentIndex(0);
    setTimeout(() => {
      const container = document.getElementById('vocab-scroll-container');
      if (container) {
        container.scrollTop = 0;
      }
    }, 50);
    try {
      if (topic.id === 'feelings') {
        setDiscoveryQueue(FEELINGS_DATA);
      } else if (topic.id === 'about_me') {
        setDiscoveryQueue(GREETINGS_DATA);
      } else if (topic.id === 'family_hobbies') {
        setDiscoveryQueue(FAMILY_DATA);
      } else if (topic.id === 'living') {
        setDiscoveryQueue(HOME_DATA);
      } else if (topic.id === 'key_phrases') {
        setDiscoveryQueue(CLASS_DATA);
      } else if (topic.id === 'instructions') {
        setDiscoveryQueue(MONTHS_DATA);
      } else if (topic.id === 'survival') {
        setDiscoveryQueue(SCHOOL_SUBJECTS_DATA);
      } else if (topic.id === 'weather') {
        setDiscoveryQueue(WEATHER_DATA);
      } else if (topic.id === 'colours') {
        setDiscoveryQueue(COLOURS_DATA);
      } else if (topic.id === 'food_drink') {
        setDiscoveryQueue(FOOD_DRINK_DATA);
      } else if (topic.id === 'vegetables') {
        setDiscoveryQueue(VEGETABLES_DATA);
      } else if (topic.id === 'fruits') {
        setDiscoveryQueue(FRUITS_DATA);
      } else if (topic.id === 'birds') {
        setDiscoveryQueue(BIRDS_DATA);
      } else if (topic.id === 'fish_creatures') {
        setDiscoveryQueue(FISH_DATA);
      } else if (topic.id === 'animals') {
        setDiscoveryQueue(ANIMALS_DATA);
      } else if (topic.id === 'insects_reptiles') {
        setDiscoveryQueue(INSECTS_REPTILES_DATA);
      } else if (topic.id === 'time') {
        setDiscoveryQueue(TIME_DATA);
      } else if (topic.id === 'body_parts') {
        setDiscoveryQueue(BODY_PARTS_DATA);
      } else if (topic.id === 'jobs') {
        setDiscoveryQueue(JOBS_DATA);
      } else if (topic.id === 'places') {
        setDiscoveryQueue(PLACES_DATA);
      } else if (topic.id === 'transport') {
        setDiscoveryQueue(TRANSPORT_DATA);
      } else if (topic.id === 'sports') {
        setDiscoveryQueue(SPORTS_DATA);
      } else if (topic.id === 'nature') {
        setDiscoveryQueue(NATURE_DATA);
      } else if (topic.id === 'tech') {
        setDiscoveryQueue(TECHNOLOGY_DATA);
      } else if (topic.id === 'health') {
        setDiscoveryQueue(HEALTH_DATA);
      } else if (topic.id === 'shopping') {
        setDiscoveryQueue(SHOPPING_DATA);
      } else if (topic.id === 'travel') {
        setDiscoveryQueue(TRAVEL_DATA);
      } else if (topic.id === 'music') {
        setDiscoveryQueue(MUSIC_DATA);
      } else if (topic.id === 'routine') {
        setDiscoveryQueue(ROUTINE_DATA);
      } else if (topic.id === 'clothing') {
        setDiscoveryQueue(CLOTHING_DATA);
      } else {
        const words = await generateThemedVocabulary(topic.ar);
        // Map AI response to the format expected by TopicInterface
        const mappedWords: Partial<Vocabulary>[] = words.map(w => ({
          original_word: w.original_word || '',
          translation: w.translation || '',
          emoji: '✨',
          analysis: w.analysis
        }));
        setDiscoveryQueue(mappedWords);
      }
    } catch (e) { 
      alert("Error starting session."); 
    } finally { 
      setIsLoadingDiscovery(false); 
    }
  };

  const fetchIllustration = async (index: number, queue: Partial<Vocabulary>[]) => {
    const word = queue[index];
    if (!word || word.image_data) return;
    
    // Increased throttle to 3 seconds to be safer with per-minute quotas
    await new Promise(r => setTimeout(r, 3000));
    
    setIsLoadingIllustration(true);
    try {
      const img = await generateWordIllustration(word.original_word!);
      if (img) {
        setDiscoveryQueue(prev => {
          const newQueue = [...prev];
          if (newQueue[index]) {
            newQueue[index] = { ...newQueue[index], image_data: img };
          }
          return newQueue;
        });
      }
    } catch (e) { 
      console.warn("Failed to fetch illustration for discovery word", e);
    }
    finally { setIsLoadingIllustration(false); }
  };

  const processDiscovery = async (status: 'know' | 'learn' | 'ignore') => {
    const current = discoveryQueue[currentIndex] as Vocabulary;
    if (status !== 'ignore' && user) {
      const level = status === 'know' ? MasteryLevel.FLUENT : MasteryLevel.LEARNING;
      const updatedWord = { 
        ...current, 
        mastery_level: level,
        userId: user.uid,
        createdAt: serverTimestamp(),
        // Add compatibility fields for Firestore rules
        word: current.original_word,
        meaning_ar: current.arabic_definition || current.original_word,
        meaning_en: current.translation
      };
      
      // Save to Firestore
      try {
        const wordId = updatedWord.id || Math.random().toString(36).substring(2, 15);
        await setDoc(doc(db, 'users', user.uid, 'vocabulary', wordId), updatedWord);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/vocabulary`);
      }
    }

    if (currentIndex < discoveryQueue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (!discoveryQueue[nextIndex].image_data) {
        fetchIllustration(nextIndex, discoveryQueue);
      }
    } else {
      setDiscoveryQueue([]);
      setSelectedTopic(null);
      setShowFeelingsChart(false);
    }
  };

  const handleDeepDive = async (word: Vocabulary | Partial<Vocabulary>) => {
    const vWord = word as Vocabulary;
    setSelectedWord(vWord);
    setDeepAnalysis(null);
    setLoadingAnalysis(true);
    try {
      const analysis = await getWordDeepAnalysis(vWord.original_word);
      setDeepAnalysis(analysis);
    } catch (e) { console.error(e); } finally { setLoadingAnalysis(false); }
  };

  const filtered = vocab.filter(v => {
    const matchesSearch = v.original_word.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.translation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || v.mastery_level === Number(filter);
    return matchesSearch && matchesFilter;
  });

  const progress = Math.min(100, (vocab.length / 50) * 100);
  const getRank = (count: number) => {
    if (count < 10) return { title: lang === 'ar' ? 'مبتدئ' : 'Beginner', color: 'slate' };
    if (count < 30) return { title: lang === 'ar' ? 'مستكشف' : 'Explorer', color: 'emerald' };
    if (count < 60) return { title: lang === 'ar' ? 'باحث' : 'teal' };
    return { title: lang === 'ar' ? 'متقن' : 'Master', color: 'indigo' };
  };
  const currentRank = getRank(vocab.length);

  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  const deleteWord = async (wordId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'vocabulary', wordId));
      setVocab(prev => prev.filter(v => v.id !== wordId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/vocabulary/${wordId}`);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const getMasteryColor = (level: MasteryLevel) => {
    switch (level) {
      case MasteryLevel.NEW: return 'bg-slate-200';
      case MasteryLevel.LEARNING: return 'bg-indigo-400';
      case MasteryLevel.FLUENT: return 'bg-emerald-500';
      default: return 'bg-slate-100';
    }
  };

  const getMasteryBadge = (level: MasteryLevel) => {
    switch (level) {
      case MasteryLevel.NEW: return 'bg-slate-100 text-slate-500';
      case MasteryLevel.LEARNING: return 'bg-indigo-50 text-indigo-600';
      case MasteryLevel.FLUENT: return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-slate-50 text-slate-400';
    }
  };

  const getMasteryText = (level: MasteryLevel) => {
    switch (level) {
      case MasteryLevel.NEW: return lang === 'ar' ? 'جديد' : 'New';
      case MasteryLevel.LEARNING: return lang === 'ar' ? 'تعلم' : 'Learning';
      case MasteryLevel.FLUENT: return lang === 'ar' ? 'متقن' : 'Fluent';
      default: return lang === 'ar' ? 'مراجعة' : 'Review';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`w-full flex flex-col h-full bg-white overflow-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      
      {/* Global Brand Header */}
      <PageHeader
        title={t.title}
        icon={BookText}
        lang={lang}
        onToggle={toggleLang}
      />

      <div className="flex-1 flex overflow-hidden relative bg-slate-50/30">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }} />

        {/* Simplified Sidebar Navigation */}
        <aside className={`w-[280px] bg-white flex flex-col p-6 shrink-0 relative z-[50] shadow-sm no-print ${lang === 'ar' ? 'border-l' : 'border-r'} border-slate-100`}>
           <div className="mb-10 px-1 flex items-center justify-between flex-row">
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                 <div className={`flex items-center gap-2 mb-1 ${lang === 'ar' ? 'flex-row' : 'flex-row'}`}>
                    <div className="w-2 h-2 rounded-full bg-[#0f172a] shadow-[0_0_8px_rgba(15,23,42,0.4)]" />
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">{currentRank.title}</span>
                 </div>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'الرتبة الحالية' : 'CURRENT RANK'}</p>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center">
                 <svg className="w-full h-full -rotate-90">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                    <circle 
                      cx="24" cy="24" r="20" fill="none" stroke="#059669" strokeWidth="4" 
                      strokeDasharray={126} strokeDashoffset={126 - (126 * progress) / 100} 
                      strokeLinecap="round" 
                      className="transition-all duration-1000"
                    />
                 </svg>
                 <span className="absolute text-[10px] font-black text-slate-800">{vocab.length}</span>
              </div>
           </div>

           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">
             {lang === 'ar' ? 'اختر وجهتك التعليمية' : 'Choose your learning path'}
           </h3>

           <nav className="flex-1 space-y-4">
              <SidebarNavBtn 
                active={activeTab === 'discovery'} 
                icon={<Compass size={24} />} 
                label={t.wordJourney} 
                sub={lang === 'ar' ? 'كلمات جديدة' : 'NEW WORDS'} 
                lang={lang}
                onClick={() => setActiveTab('discovery')} 
              />
              <SidebarNavBtn 
                active={activeTab === 'lexicon'} 
                icon={<Layers size={24} />} 
                label={t.myWords} 
                sub={lang === 'ar' ? `${vocab.length} كلمة محفوظة` : `${vocab.length} WORDS SAVED`} 
                lang={lang}
                onClick={() => { setActiveTab('lexicon'); setSelectedTopic(null); }} 
              />
           </nav>
        </aside>

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
           {activeTab === 'lexicon' && (
             <div className="px-8 pt-8 pb-4 flex items-center justify-between shrink-0 no-print flex-row">
               <div className="flex items-center gap-6 flex-row">
                  <div className="w-1.5 h-10 bg-gradient-to-b from-[#0f172a] to-[#059669] rounded-full" />
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                     <h1 className="text-3xl font-black text-slate-800 arabic-font leading-none">
                        {t.lexicon}
                     </h1>
                  </div>
               </div>
               
               <div className="flex items-center gap-3 flex-row">
                  <div className="relative">
                     <Search className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-300`} size={16} />
                     <input 
                       type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                       placeholder={t.search} 
                       className={`bg-white border border-slate-100 ${lang === 'ar' ? 'pr-12 pl-6' : 'pl-12 pr-6'} py-2.5 rounded-xl text-xs font-bold arabic-font outline-none focus:ring-2 focus:ring-blue-100 transition-all w-64`}
                     />
                  </div>
                  <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-black text-slate-500 outline-none">
                     <option value="all">{t.allLevels}</option>
                     <option value={MasteryLevel.NEW}>{t.new}</option>
                     <option value={MasteryLevel.FLUENT}>{t.mastered}</option>
                  </select>
               </div>
             </div>
           )}

           <div id="vocab-scroll-container" style={{ overscrollBehaviorY: 'contain', scrollBehavior: 'auto', touchAction: selectedTopic ? 'pan-y' : 'auto' }} className={`flex-1 ${selectedTopic ? 'overflow-y-auto custom-scroll flex items-start justify-center p-3 md:p-6 h-full' : 'overflow-y-auto custom-scroll px-8 pb-8'} relative z-10 ${activeTab === 'discovery' && !selectedTopic ? 'pt-8' : ''}`}>
              
              {activeTab === 'discovery' && !selectedTopic && (
                <div className="animate-in fade-in duration-700">
                   <div className="bg-white rounded-3xl p-6 border border-slate-50 shadow-sm mb-6 text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0f172a] to-[#059669]" />
                      <h2 className="text-xl font-black text-slate-800 arabic-font mb-1 tracking-tight">{t.topicAdventure}</h2>
                      <p className="text-slate-400 text-xs font-bold arabic-font opacity-60">{t.chooseAdventure}</p>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {ALL_TOPICS.map(topic => {
                        const color = TOPIC_COLORS[topic.color] || TOPIC_COLORS.blue;
                        return (
                          <button 
                            key={topic.id} 
                            onClick={() => startDiscovery(topic)}
                            className={`bg-white rounded-3xl p-6 border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col items-center group relative overflow-hidden border-b-4 ${color.border.replace('border-', 'border-b-')}`}
                          >
                            <div className={`w-20 h-20 rounded-3xl ${color.bg} ${color.text} flex items-center justify-center mb-4 shadow-sm border ${color.border} group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                              {topic.id === 'insects_reptiles' ? (
                                <div className="relative w-full h-full">
                                  <span className="absolute top-3 left-3 text-sm -rotate-12">🦋</span>
                                  <span className="absolute bottom-2.5 right-3 text-4xl leading-none">🐍</span>
                                </div>
                              ) : topic.id === 'food_drink' ? (
                                <div className="relative w-full h-full">
                                  <span className="absolute top-3.5 left-3.5 text-2xl -rotate-12">🥤</span>
                                  <span className="absolute bottom-3 right-3 text-[42px] leading-none">🍝</span>
                                </div>
                              ) : (
                                <span className={`${topic.icon.length > 8 ? "text-3xl leading-tight" : "text-5xl"} whitespace-pre`}>{topic.icon}</span>
                              )}
                            </div>
                            <h3 className="text-xs font-black text-slate-800 arabic-font mb-1 whitespace-nowrap">{lang === 'ar' ? topic.ar : topic.en}</h3>
                            <span className={`text-[8px] font-black text-slate-300 uppercase tracking-widest ${lang === 'en' ? 'arabic-font' : ''}`}>{lang === 'ar' ? topic.en : topic.ar}</span>
                            <div className={`mt-3 w-6 h-6 ${color.bg} rounded-full flex items-center justify-center ${color.text} group-hover:bg-[#0f172a] group-hover:text-white transition-all`}>
                              <ArrowUpRight size={12} />
                            </div>
                          </button>
                        );
                      })}
                   </div>
                </div>
              )}

              {(isLoadingDiscovery) && (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="w-16 h-16 border-4 border-slate-100 border-t-[#059669] rounded-full animate-spin" />
                  <p className="font-black text-slate-400 text-xs uppercase tracking-widest arabic-font animate-pulse">{t.fetchingWords}</p>
                </div>
              )}

              {selectedTopic && !isLoadingDiscovery && (
                <TopicInterface 
                  topic={selectedTopic} 
                  lang={lang} 
                  words={discoveryQueue}
                  onBack={() => { 
                    setSelectedTopic(null); 
                    setTimeout(() => {
                      const container = document.getElementById('vocab-scroll-container');
                      if (container) container.scrollTop = 0;
                    }, 50);
                  }} 
                  onSpeak={speak}
                  onAction={async (word: Partial<Vocabulary>, status: 'know' | 'learn' | 'ignore') => {
                    if (status === 'ignore' || !user) return;
                    const level = status === 'know' ? MasteryLevel.FLUENT : MasteryLevel.LEARNING;
                    
                    const vocabWord: Vocabulary = { 
                      id: Math.random().toString(36).substring(2, 15),
                      original_word: word.original_word || '', 
                      translation: word.translation || '',
                      mastery_level: level,
                      userId: user.uid,
                      createdAt: serverTimestamp(),
                      word: word.original_word || '',
                      meaning_ar: word.original_word || '',
                      meaning_en: word.translation || '',
                      is_english_to_arabic: false,
                      english_definition: word.translation || '',
                      arabic_definition: word.original_word || '',
                      analysis: word.analysis || {
                        type: 'noun',
                        details_ar: { category: 'General', sub_category: 'General', rule: '', example: '' },
                        details_en: { category: 'General', sub_category: 'General', rule: '', example: '' }
                      },
                      review_count: 0,
                      last_reviewed: new Date().toISOString(),
                      next_review: new Date().toISOString()
                    } as any;
                    
                    try {
                      await setDoc(doc(db, 'users', user.uid, 'vocabulary', vocabWord.id), vocabWord);
                    } catch (error) {
                      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/vocabulary`);
                    }
                  }}
                  showHint={showHint}
                  setShowHint={setShowHint}
                  currentHint={currentHint}
                />
              )}



               {activeTab === 'lexicon' && (
                <div className="animate-in fade-in duration-500">
                   <div className="grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {filtered.map(item => (
                        <div 
                          key={item.id} 
                          className="bg-white p-6 py-10 rounded-2xl border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer flex flex-col items-center text-center relative overflow-hidden border-b-4 border-slate-100"
                          onClick={() => {
                            if (item.mastery_level === MasteryLevel.LEARNING) {
                              setActiveActivityWord(item);
                            } else {
                              handleDeepDive(item);
                            }
                          }}
                        >
                           <div className={`absolute top-0 right-0 left-0 h-1.5 ${getMasteryColor(item.mastery_level)}`} />
                           <h4 className="text-base font-black text-slate-800 arabic-font mb-1">{item.original_word}</h4>
                           <p className="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-tighter">{item.translation}</p>
                           <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${getMasteryBadge(item.mastery_level)}`}>{getMasteryText(item.mastery_level)}</div>
                          <button 
                             onClick={async (e) => {
                               e.stopPropagation();
                               e.preventDefault();
                               if (confirmDeleteId === item.id) {
                                  if (!user) return;
                                  try {
                                    await deleteDoc(doc(db, 'users', user.uid, 'vocabulary', item.id!));
                                    setVocab(prev => prev.filter(v => v.id !== item.id));
                                  } catch (error) {
                                    handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/vocabulary/${item.id}`);
                                  } finally {
                                    setConfirmDeleteId(null);
                                  }
                               } else {
                                 setConfirmDeleteId(item.id!);
                                 setTimeout(() => setConfirmDeleteId(null), 3000);
                               }
                             }}
                             className={`absolute bottom-3 right-3 p-3 rounded-xl transition-all z-40 shadow-sm ${
                               confirmDeleteId === item.id 
                                 ? 'bg-rose-600 text-white opacity-100 scale-110 shadow-lg ring-4 ring-rose-100' 
                                 : 'text-slate-300 bg-slate-50 hover:bg-rose-500 hover:text-white opacity-70 group-hover:opacity-100'
                             }`}
                           >
                             {confirmDeleteId === item.id ? <CheckCircle2 size={18} /> : <Trash2 size={16} />}
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Laboratory Analysis Side Panel */}
        {selectedWord && (
           <div className={`absolute inset-y-0 ${lang === 'ar' ? 'left-0 border-r shadow-r-2xl' : 'right-0 border-l shadow-l-2xl'} w-72 bg-white shadow-2xl border-slate-100 z-[200] flex flex-col animate-in ${lang === 'ar' ? 'slide-in-from-left-full' : 'slide-in-from-right-full'} duration-500 no-print`}>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-[#fafafa]">
                 <div className={`flex items-center gap-3 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                   <div className="p-3 bg-gradient-to-br from-[#059669] to-[#047857] text-white rounded-xl shadow-lg"><BrainCircuit size={16} /></div>
                   <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                      <h3 className="text-sm font-black arabic-font text-slate-800 leading-none">{t.smartAnalysis}</h3>
                      <p className="text-[7px] font-black text-slate-400 uppercase mt-1">Word Analysis</p>
                   </div>
                 </div>
                 <button onClick={() => setSelectedWord(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-300 transition-all"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scroll space-y-6">
                {loadingAnalysis ? (
                   <div className="h-full flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-4 border-slate-50 border-t-emerald-600 rounded-full animate-spin" />
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{t.analysisLoading}</span>
                   </div>
                ) : deepAnalysis && (
                   <div className="animate-in fade-in duration-500 h-full flex flex-col">
                       <div className={`${lang === 'ar' ? 'text-right' : 'text-left'} mb-4 shrink-0`}>
                          <h2 className={`text-2xl font-black text-slate-800 arabic-font leading-relaxed mb-0.5 pt-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{selectedWord.original_word}</h2>
                          <p className={`text-[8px] font-bold text-[#059669] uppercase tracking-tighter mb-4 ${lang === 'en' ? 'text-left' : 'text-right'}`} dir={lang === 'en' ? 'ltr' : 'rtl'}>{selectedWord.translation}</p>
                          
                          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 mb-2">
                             <h4 className="text-[7px] font-black text-emerald-600 uppercase tracking-widest mb-3 text-center">
                                {lang === 'ar' ? 'الجذر (حروف الكلمة الأصلية)' : 'Word Root (Original Letters)'}
                             </h4>
                             <div className="flex justify-center gap-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                                {deepAnalysis.root_letters.map((l: string, i: number) => (
                                  <div key={i} className="w-9 h-9 bg-white border border-emerald-100 shadow-sm rounded-xl flex items-center justify-center text-sm font-black text-emerald-700 arabic-font">{l}</div>
                                ))}
                             </div>
                          </div>
                       </div>

                      <div className="flex-1 space-y-3 overflow-hidden flex flex-col">
                         {selectedWord.image_data && (
                            <div className="w-full shrink-0 p-3 bg-white border border-slate-50 rounded-2xl shadow-sm flex justify-center">
                               <img src={selectedWord.image_data} alt="Visual Aid" className="max-w-[50%] max-h-32 h-auto object-contain opacity-90 transition-opacity" referrerPolicy="no-referrer" />
                            </div>
                         )}
                         <div className="bg-slate-50 p-4 rounded-3xl text-slate-800 border border-slate-100 shadow-sm relative overflow-hidden group shrink-0">
                            <Fingerprint className="absolute top-4 left-4 opacity-[0.03] text-slate-900" size={60} />
                            <h4 className={`text-[7px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.wordFamily}</h4>
                            <div className="grid grid-cols-1 gap-1.5">
                               {deepAnalysis.word_family.slice(0, 3).map((item: any, i: number) => (
                                 <div key={i} className={`flex items-center justify-between p-2 bg-white rounded-xl border border-slate-50 shadow-sm ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                                       <span className="block text-[11px] font-black arabic-font text-slate-800">{item.word}</span>
                                       <span className={`block text-[6px] text-slate-400 font-medium uppercase ${lang === 'en' ? 'text-left' : 'text-right'}`}>{item.meaning}</span>
                                    </div>
                                    <div className="w-5 h-5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-[7px] font-black">{item.weight}</div>
                                 </div>
                               ))}
                            </div>
                         </div>

                      </div>
                   </div>
                )}
              </div>
              <div className="p-5 border-t border-slate-100 bg-white sticky bottom-0 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                 <button 
                  onClick={() => setSelectedWord(null)} 
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
                 >
                  {t.close}
                 </button>
              </div>
           </div>
        )}
         {/* Interactive Activities Side Panel */}
         {activeActivityWord && (
            <InteractiveActivitiesSidePanel 
               word={activeActivityWord} 
               lang={lang} 
               onClose={() => setActiveActivityWord(null)} 
               onSpeak={speak} 
            />
         )}
      </div>
    </motion.div>
  );
};

const GREETINGS_DATA: Partial<Vocabulary>[] = [
  { original_word: 'مرحبًا', translation: 'Hello', emoji: '✋🏻', analysis: { details_ar: { example: 'مرحبًا بك في منزلنا.' }, details_en: { example: 'Hello, welcome to our home.' } } as any },
  { original_word: 'أهلاً', translation: 'Hi', emoji: '😊', analysis: { details_ar: { example: 'أهلاً يا صديقي، كيف حالك؟' }, details_en: { example: 'Hi my friend, how are you?' } } as any },
  { original_word: 'صباح الخير', translation: 'Good morning', emoji: '🌞', analysis: { details_ar: { example: 'صباح الخير، أتمنى لك يوماً سعيداً.' }, details_en: { example: 'Good morning, I wish you a happy day.' } } as any },
  { original_word: 'مساء الخير', translation: 'Good evening', emoji: '🌙', analysis: { details_ar: { example: 'مساء الخير، هل استمتعت بيومك؟' }, details_en: { example: 'Good evening, did you enjoy your day?' } } as any },
  { original_word: 'أهلاً وسهلاً', translation: 'Welcome', emoji: '🤝', analysis: { details_ar: { example: 'أهلاً وسهلاً بكم في مدرستنا.' }, details_en: { example: 'Welcome to our school.' } } as any },
  { original_word: 'كيف حالك؟', translation: 'How are you?', emoji: '🙂', analysis: { details_ar: { example: 'كيف حالك اليوم يا أحمد؟' }, details_en: { example: 'How are you today, Ahmed?' } } as any },
  { original_word: 'أنا بخير', translation: 'I am fine', emoji: '👍🏻', analysis: { details_ar: { example: 'أنا بخير والحمد لله.' }, details_en: { example: 'I am fine, thank God.' } } as any },
  { original_word: 'سعيد بلقائك', translation: 'Nice to meet you', emoji: '😄', analysis: { details_ar: { example: 'أنا حقاً سعيد بلقائك يا خالد.' }, details_en: { example: 'I am really nice to meet you, Khalid.' } } as any },
  { original_word: 'ما اسمك؟', translation: 'What is your name?', emoji: '❓', analysis: { details_ar: { example: 'أهلاً، ما اسمك؟' }, details_en: { example: 'Hello, what is your name?' } } as any },
  { original_word: 'اسمي…', translation: 'My name is…', emoji: '🪪', analysis: { details_ar: { example: 'اسمي محمد، وأنت؟' }, details_en: { example: 'My name is Mohamed, and you?' } } as any },
  { original_word: 'من أين أنت؟', translation: 'Where are you from?', emoji: '🌍', analysis: { details_ar: { example: 'أنت تتكلم العربية جيداً، من أين أنت؟' }, details_en: { example: 'You speak Arabic well, where are you from?' } } as any },
  { original_word: 'أنا من الإمارات', translation: 'I am from the UAE', emoji: '🇦🇪', analysis: { details_ar: { example: 'أنا من الإمارات، من مدينة دبي.' }, details_en: { example: 'I am from the UAE, from Dubai city.' } } as any },
  { original_word: 'شكرًا', translation: 'Thank you', emoji: '🙏🏻', analysis: { details_ar: { example: 'شكرًا جزيلاً على المساعدة.' }, details_en: { example: 'Thank you very much for the help.' } } as any },
  { original_word: 'على الرحب والسعة', translation: 'You are welcome', emoji: '🌷', analysis: { details_ar: { example: 'شكرًا لك. - على الرحب والسعة.' }, details_en: { example: 'Thank you. - You are welcome.' } } as any },
  { original_word: 'مع السلامة', translation: 'Goodbye', emoji: '👋🏻', analysis: { details_ar: { example: 'مع السلامة، نراك غداً.' }, details_en: { example: 'Goodbye, see you tomorrow.' } } as any },
  { original_word: 'أراك لاحقًا', translation: 'See you later', emoji: '⏰', analysis: { details_ar: { example: 'يجب أن أذهب الآن، أراك لاحقًا.' }, details_en: { example: 'I must go now, see you later.' } } as any },
];

const FAMILY_DATA: Partial<Vocabulary>[] = [
  { original_word: 'أب', translation: 'Father', emoji: '👨🏻‍💼', analysis: { details_ar: { example: 'أبي يعمل مهندساً ناجحاً.' }, details_en: { example: 'My father works as a successful engineer.' } } as any },
  { original_word: 'أم', translation: 'Mother', emoji: '👩🏻‍🏫', analysis: { details_ar: { example: 'أمي تحب قراءة الكتب كثيراً.' }, details_en: { example: 'My mother loves reading books very much.' } } as any },
  { original_word: 'أخ', translation: 'Brother', emoji: '👦🏻', analysis: { details_ar: { example: 'لدي أخ أصغر مني بسنتين.' }, details_en: { example: 'I have a brother two years younger than me.' } } as any },
  { original_word: 'أخت', translation: 'Sister', emoji: '👧🏻', analysis: { details_ar: { example: 'أختي تدرس الطب في الجامعة.' }, details_en: { example: 'My sister is studying medicine at university.' } } as any },
  { original_word: 'جد', translation: 'Grandfather', emoji: '👴🏻', analysis: { details_ar: { example: 'جدي يحب سرد القصص القديمة لنا.' }, details_en: { example: 'My grandfather loves telling us old stories.' } } as any },
  { original_word: 'جدة', translation: 'Grandmother', emoji: '👵🏻', analysis: { details_ar: { example: 'جدتي تطبخ أشهى الطعام في العالم.' }, details_en: { example: 'My grandmother cooks the most delicious food in the world.' } } as any },
  { original_word: 'عم / خال', translation: 'Uncle', emoji: '👨🏻‍🦳', analysis: { details_ar: { example: 'زرت عمي في عطلة نهاية الأسبوع.' }, details_en: { example: 'I visited my uncle over the weekend.' } } as any },
  { original_word: 'عمة / خالة', translation: 'Aunt', emoji: '👩🏻', analysis: { details_ar: { example: 'خالتي تعيش في مدينة أخرى.' }, details_en: { example: 'My aunt lives in another city.' } } as any },
  { original_word: 'ابن', translation: 'Son', emoji: '🧒🏻', analysis: { details_ar: { example: 'هذا الولد هو ابن جاري.' }, details_en: { example: 'This boy is my neighbor\'s son.' } } as any },
  { original_word: 'ابنة', translation: 'Daughter', emoji: '👧🏻', analysis: { details_ar: { example: 'ابنة عمتي ذكية جداً في الرياضيات.' }, details_en: { example: 'My aunt\'s daughter is very smart in math.' } } as any },
  { original_word: 'طفل رضيع', translation: 'Baby', emoji: '🍼', analysis: { details_ar: { example: 'الطفل الرضيع نائم الآن بسلام.' }, details_en: { example: 'The baby is sleeping peacefully now.' } } as any },
  { original_word: 'أسرة', translation: 'Family', emoji: '👨‍👩‍👧‍👦', analysis: { details_ar: { example: 'الأسرة هي أهم شيء في الحياة.' }, details_en: { example: 'Family is the most important thing in life.' } } as any },
  { original_word: 'الوالدان', translation: 'Parents', emoji: '👨‍👩‍👧', analysis: { details_ar: { example: 'يجب علينا طاعة الوالدين واحترامهما.' }, details_en: { example: 'We must obey and respect our parents.' } } as any },
  { original_word: 'ابن العم / ابن الخال', translation: 'Cousin', emoji: '🧑🏻', analysis: { details_ar: { example: 'لعبت كرة القدم مع ابن عمي.' }, details_en: { example: 'I played football with my cousin.' } } as any },
  { original_word: 'زوج', translation: 'Husband', emoji: '🤵🏻‍♂️', analysis: { details_ar: { example: 'زوج أختي رجل طيب جداً.' }, details_en: { example: 'My sister\'s husband is a very kind man.' } } as any },
  { original_word: 'زوجة', translation: 'Wife', emoji: '👰🏻', analysis: { details_ar: { example: 'زوجة خالي معلمة متميزة.' }, details_en: { example: 'My uncle\'s wife is an excellent teacher.' } } as any },
];

const CLASS_DATA: Partial<Vocabulary>[] = [
  { original_word: 'قلم', translation: 'Pen', emoji: '🖊️', analysis: { details_ar: { example: 'أكتب واجبي باستخدام القلم.' }, details_en: { example: 'I write my homework using a pen.' } } as any },
  { original_word: 'قلم رصاص', translation: 'Pencil', emoji: '✏️', analysis: { details_ar: { example: 'أرسم لوحة جميلة بالقلم الرصاص.' }, details_en: { example: 'I draw a beautiful painting with a pencil.' } } as any },
  { original_word: 'قلم ألوان', translation: 'Color Pencil', emoji: '🖍️', analysis: { details_ar: { example: 'أحب التلوين بأقلام الألوان الزاهية.' }, details_en: { example: 'I love coloring with bright colored pencils.' } } as any },
  { original_word: 'كتاب', translation: 'Book', emoji: '📘', analysis: { details_ar: { example: 'الكتاب خير جليس في الزمان.' }, details_en: { example: 'A book is the best companion in time.' } } as any },
  { original_word: 'دفتر', translation: 'Notebook', emoji: '📓', analysis: { details_ar: { example: 'سجلت ملاحظاتي المهمة في الدفتر.' }, details_en: { example: 'I recorded my important notes in the notebook.' } } as any },
  { original_word: 'مِمحاة', translation: 'Eraser', emoji: '/eraser.png', analysis: { details_ar: { example: 'استخدم الممحاة لمسح الخطأ.' }, details_en: { example: 'I use the eraser to erase the mistake.' } } as any },
  { original_word: 'مِبراة', translation: 'Sharpener', emoji: '/sharpener.png', analysis: { details_ar: { example: 'القلم يحتاج إلى المبراة ليصبح حاداً.' }, details_en: { example: 'The pencil needs a sharpener to become sharp.' } } as any },
  { original_word: 'سُبُّورة', translation: 'Whiteboard', emoji: '🧑🏻‍🏫', analysis: { details_ar: { example: 'كتب المعلم الدرس على السبورة.' }, details_en: { example: 'The teacher wrote the lesson on the white board.' } } as any },
  { original_word: 'طاولة', translation: 'Table', emoji: '/table.png', analysis: { details_ar: { example: 'أضع حقيبتي فوق الطاولة.' }, details_en: { example: 'I put my bag on the table.' } } as any },
  { original_word: 'طالب / تِلميذ', translation: 'Student', emoji: '🧑🏻‍🎓', analysis: { details_ar: { example: 'الطالب المجتهد يذاكر دروسه بانتظام.' }, details_en: { example: 'The diligent student studies his lessons regularly.' } } as any },
  { original_word: 'مُعلِّم / مُعلِّمة', translation: 'Teacher (M-F)', emoji: '👨🏻‍🏫👩🏻‍🏫', analysis: { details_ar: { example: 'المعلم يشرح الدرس بوضوح للطلاب.' }, details_en: { example: 'The teacher explains the lesson clearly to the students.' } } as any },
  { original_word: 'الحمَّام', translation: 'The bathroom', emoji: '🚻', analysis: { details_ar: { example: 'هل يمكنني الذهاب إلى الحمام؟' }, details_en: { example: 'Can I go to the bathroom?' } } as any },
  { original_word: 'أحسنت', translation: 'Well done', emoji: '👏🏻', analysis: { details_ar: { example: 'أحسنت يا بطل، إجابتك صحيحة!' }, details_en: { example: 'Well done, champion! Your answer is correct!' } } as any },
  { original_word: 'رائع', translation: 'Wonderful', emoji: '🌟', analysis: { details_ar: { example: 'هذا مجهود رائع جداً.' }, details_en: { example: 'This is a very wonderful effort.' } } as any },
  { original_word: 'قِف', translation: 'Stand up', emoji: '🧍🏻', analysis: { details_ar: { example: 'قف عندما يدخل المعلم إلى الفصل.' }, details_en: { example: 'Stand up when the teacher enters the classroom.' } } as any },
  { original_word: 'اجلس', translation: 'Sit down', emoji: '/sit_down.png', analysis: { details_ar: { example: 'اجلس في مكانك بهدوء من فضلك.' }, details_en: { example: 'Please sit in your place quietly.' } } as any },
];

const HOME_DATA: Partial<Vocabulary>[] = [
  { original_word: 'غرفة النوم', translation: 'Bedroom', emoji: '🛌', analysis: { details_ar: { example: 'غرفة النوم مريحة وهادئة جداً.' }, details_en: { example: 'The bedroom is very comfortable and quiet.' } } as any },
  { original_word: 'غرفة المعيشة', translation: 'Living room', emoji: '🛋️', analysis: { details_ar: { example: 'نجتمع كعائلة في غرفة المعيشة يومياً.' }, details_en: { example: 'We gather as a family in the living room every day.' } } as any },
  { original_word: 'مرآة', translation: 'Mirror', emoji: '🪞', analysis: { details_ar: { example: 'نظرت إلى نفسي في المرآة.' }, details_en: { example: 'I looked at myself in the mirror.' } } as any },
  { original_word: 'مطبخ', translation: 'Kitchen', emoji: '🍳', analysis: { details_ar: { example: 'تطبخ أمي الطعام اللذيذ في المطبخ.' }, details_en: { example: 'My mother cooks delicious food in the kitchen.' } } as any },
  { original_word: 'حمام', translation: 'Bathroom', emoji: '🚿', analysis: { details_ar: { example: 'الحمام نظيف وواسع.' }, details_en: { example: 'The bathroom is clean and spacious.' } } as any },
  { original_word: 'شِبَّاك', translation: 'Window', emoji: '🪟', analysis: { details_ar: { example: 'فتحت الشباك ليدخل الهواء النقي.' }, details_en: { example: 'I opened the window to let in fresh air.' } } as any },
  { original_word: 'شُرفة', translation: 'Balcony', emoji: '/balcony.png', analysis: { details_ar: { example: 'أحب الجلوس في الشرفة وقت الغروب.' }, details_en: { example: 'I love sitting on the balcony at sunset.' } } as any },
  { original_word: 'سُلَّم', translation: 'Ladder', emoji: '🪜', analysis: { details_ar: { example: 'استخدم العامل السلم لإصلاح المصباح.' }, details_en: { example: 'The worker used the ladder to fix the lamp.' } } as any },
  { original_word: 'سرير', translation: 'Bed', emoji: '🛏️', analysis: { details_ar: { example: 'أنام على سرير مريح كل ليلة.' }, details_en: { example: 'I sleep on a comfortable bed every night.' } } as any },
  { original_word: 'دولاب', translation: 'Wardrobe', emoji: '/wardrobe.png', analysis: { details_ar: { example: 'أرتب ملابسي داخل الدولاب.' }, details_en: { example: 'I organize my clothes inside the wardrobe.' } } as any },
  { original_word: 'بوابة', translation: 'Gate', emoji: '🏯', analysis: { details_ar: { example: 'فتحت البوابة الكبيرة لدخول الحديقة.' }, details_en: { example: 'I opened the large gate to enter the garden.' } } as any },
  { original_word: 'أريكة', translation: 'Sofa', emoji: '🛋️', analysis: { details_ar: { example: 'جلست على الأريكة لمشاهدة التلفاز.' }, details_en: { example: 'I sat on the sofa to watch TV.' } } as any },
  { original_word: 'سجادة', translation: 'Carpet', emoji: '🟫', analysis: { details_ar: { example: 'اشترينا سجادة جميلة لغرفة المعيشة.' }, details_en: { example: 'We bought a beautiful carpet for the living room.' } } as any },
  { original_word: 'طاولة', translation: 'Table', emoji: '/table.png', analysis: { details_ar: { example: 'وضعت الكتب على الطاولة.' }, details_en: { example: 'I put the books on the table.' } } as any },
  { original_word: 'تلفاز', translation: 'TV', emoji: '📺', analysis: { details_ar: { example: 'أشاهد التلفاز لفترة قصيرة في المساء.' }, details_en: { example: 'I watch TV for a short time in the evening.' } } as any },
  { original_word: 'ستارة', translation: 'Curtain', emoji: '/curtain.png', analysis: { details_ar: { example: 'أغلقت الستارة قبل النوم.' }, details_en: { example: 'I closed the curtain before sleeping.' } } as any },
];

const FEELINGS_DATA: Partial<Vocabulary>[] = [
  { original_word: 'سعيد', translation: 'Happy', emoji: '😊', analysis: { details_ar: { example: 'أنا سعيد لأنني حصلت على هدية جميلة.' }, details_en: { example: 'I am happy because I got a beautiful gift.' } } as any },
  { original_word: 'غاضب', translation: 'Angry', emoji: '😡', analysis: { details_ar: { example: 'أنا غاضب لأن اللعبة انكسرت.' }, details_en: { example: 'I am angry because the toy broke.' } } as any },
  { original_word: 'متحمس', translation: 'Excited', emoji: '🤩', analysis: { details_ar: { example: 'أنا متحمس للذهاب إلى الحديقة.' }, details_en: { example: 'I am excited to go to the park.' } } as any },
  { original_word: 'مُحرج', translation: 'Embarrassed', emoji: '😳', analysis: { details_ar: { example: 'شعرت أنني مُحرج عندما تعثرت أمام الجميع.' }, details_en: { example: 'I felt embarrassed when I tripped in front of everyone.' } } as any },
  { original_word: 'حزين', translation: 'Sad', emoji: '😢', analysis: { details_ar: { example: 'أنا حزين لأن صديقي سافر بعيداً.' }, details_en: { example: 'I am sad because my friend traveled far away.' } } as any },
  { original_word: 'مريض', translation: 'Sick', emoji: '🤒', analysis: { details_ar: { example: 'أشعر أنني مريض وأحتاج لزيارة الطبيب.' }, details_en: { example: 'I feel sick and need to visit the doctor.' } } as any },
  { original_word: 'متفاجئ', translation: 'Surprised', emoji: '😲', analysis: { details_ar: { example: 'أنا متفاجئ برؤية الكعكة الكبيرة.' }, details_en: { example: 'I am surprised to see the big cake.' } } as any },
  { original_word: 'متعب', translation: 'Tired', emoji: '😫', analysis: { details_ar: { example: 'أنا متعب وأحتاج إلى النوم.' }, details_en: { example: 'I am tired and need to sleep.' } } as any },
  { original_word: 'مذهول', translation: 'Amazed', emoji: '🤯', analysis: { details_ar: { example: 'أنا مذهول من هذا الإنجاز الذكي!' }, details_en: { example: 'I am amazed by this smart achievement!' } } as any },
  { original_word: 'منزعج', translation: 'Annoyed', emoji: '😒', analysis: { details_ar: { example: 'أنا منزعج من الضجيج العالي.' }, details_en: { example: 'I am annoyed by the loud noise.' } } as any },
  { original_word: 'قلق', translation: 'Worried', emoji: '😟', analysis: { details_ar: { example: 'أنا قلق بشأن الامتحان القادم.' }, details_en: { example: 'I am worried about the upcoming exam.' } } as any },
  { original_word: 'متوتر', translation: 'Nervous', emoji: '😬', analysis: { details_ar: { example: 'أنا متوتر قبل التحدث أمام الفصل.' }, details_en: { example: 'I am nervous before speaking to the class.' } } as any },
  { original_word: 'وحيد', translation: 'Lonely', emoji: '😔', analysis: { details_ar: { example: 'أشعر بالوحدة في الغرفة الكبيرة.' }, details_en: { example: 'I feel lonely in the big room.' } } as any },
  { original_word: 'فخور', translation: 'Proud', emoji: '😌', analysis: { details_ar: { example: 'أنا فخور بنجاحي في الكلمات!' }, details_en: { example: 'I am proud of my success in words!' } } as any },
  { original_word: 'حائر', translation: 'Confused', emoji: '🤔', analysis: { details_ar: { example: 'أنا حائر ولا أعرف ماذا أختار.' }, details_en: { example: 'I am confused and don\'t know what to choose.' } } as any },
  { original_word: 'كسول', translation: 'Lazy', emoji: '😴', analysis: { details_ar: { example: 'أشعر أنني كسول ولا أريد تنظيف غرفتي.' }, details_en: { example: 'I feel lazy and don\'t want to clean my room.' } } as any },
];

const SCHOOL_SUBJECTS_DATA: Partial<Vocabulary>[] = [
  { original_word: 'اللغة العربية', translation: 'Arabic', emoji: '📖', analysis: { details_ar: { example: 'أدرس اللغة العربية لأفهم القرآن.' }, details_en: { example: 'I study Arabic to understand the Quran.' } } as any },
  { original_word: 'اللغة الإنجليزية', translation: 'English', emoji: '📘', analysis: { details_ar: { example: 'اللغة الإنجليزية لغة عالمية.' }, details_en: { example: 'English is a global language.' } } as any },
  { original_word: 'اللغة الفرنسية', translation: 'French', emoji: '📗', analysis: { details_ar: { example: 'أحب تعلم اللغة الفرنسية في المدرسة.' }, details_en: { example: 'I like learning French at school.' } } as any },
  { original_word: 'العلوم', translation: 'Science', emoji: '🔬', analysis: { details_ar: { example: 'المعلم يشرح تجارب العلوم في المختبر.' }, details_en: { example: 'The teacher explains science experiments in the lab.' } } as any },
  { original_word: 'الرياضيات', translation: 'Mathematics', emoji: '➗', analysis: { details_ar: { example: 'حصة الرياضيات مفيدة جداً للحساب.' }, details_en: { example: 'The math class is very useful for calculation.' } } as any },
  { original_word: 'التربية الإسلامية', translation: 'Islamic Education', emoji: '🕌', analysis: { details_ar: { example: 'نتعلم الأخلاق الحميدة في التربية الإسلامية.' }, details_en: { example: 'We learn good manners in Islamic Education.' } } as any },
  { original_word: 'التربية الأخلاقية', translation: 'Moral Education', emoji: '🫱🏼🫲🏻', analysis: { details_ar: { example: 'التربية الأخلاقية تعلمني كيف أحترم الآخرين.' }, details_en: { example: 'Moral education teaches me how to respect others.' } } as any },
  { original_word: 'دراسات اجتماعية', translation: 'Social Studies', emoji: '🌍', analysis: { details_ar: { example: 'ندرس عن تاريخ بلادنا في دراسات اجتماعية.' }, details_en: { example: 'We study the history of our country in social studies.' } } as any },
  { original_word: 'الفن', translation: 'Art', emoji: '🎨', analysis: { details_ar: { example: 'أرسم لوحات ملونة في حصة الفن.' }, details_en: { example: 'I draw colorful paintings in art class.' } } as any },
  { original_word: 'الموسيقى', translation: 'Music', emoji: '🎵', analysis: { details_ar: { example: 'نستمتع بالعزف على الآلات في حصة الموسيقى.' }, details_en: { example: 'We enjoy playing instruments in music class.' } } as any },
  { original_word: 'التربية الرياضية', translation: 'Physical Education', emoji: '🏃‍♂️', analysis: { details_ar: { example: 'نلعب كرة القدم في حصة التربية الرياضية.' }, details_en: { example: 'We play football in PE class.' } } as any },
  { original_word: 'الحاسب الآلي', translation: 'Computer Studies', emoji: '💻', analysis: { details_ar: { example: 'نتعلم كيفية استخدام الإنترنت في الحاسب الآلي.' }, details_en: { example: 'We learn how to use the internet in computer studies.' } } as any },
  { original_word: 'طابور الصباح', translation: 'Morning Assembly', emoji: '👥', analysis: { details_ar: { example: 'نقف بانتظام في طابور الصباح المدرسي.' }, details_en: { example: 'We stand regularly in the school morning assembly.' } } as any },
  { original_word: 'النشيد الوطني', translation: 'National Anthem', emoji: '🎶', analysis: { details_ar: { example: 'نردد النشيد الوطني بكل فخر واعتزاز.' }, details_en: { example: 'We recite the national anthem with pride and dignity.' } } as any },
  { original_word: 'الإذاعة المدرسية', translation: 'School Broadcast', emoji: '🎤', analysis: { details_ar: { example: 'استمعت إلى معلومات مفيدة من الإذاعة المدرسية.' }, details_en: { example: 'I listened to useful information from the school broadcast.' } } as any },
  { original_word: 'الاستراحة', translation: 'Break', emoji: '☕', analysis: { details_ar: { example: 'نأكل الطعام ونلعب مع أصدقائنا في الاستراحة.' }, details_en: { example: 'We eat food and play with our friends during the break.' } } as any },
];

const MONTHS_DATA: Partial<Vocabulary>[] = [
  { original_word: 'يناير', translation: 'January', emoji: '❄️', analysis: { details_ar: { example: 'يناير هو أول شهر في السنة الميلادية.' }, details_en: { example: 'January is the first month of the Gregorian year.' } } as any },
  { original_word: 'فبراير', translation: 'February', emoji: '❤️', analysis: { details_ar: { example: 'فبراير هو أقصر شهر في السنة.' }, details_en: { example: 'February is the shortest month of the year.' } } as any },
  { original_word: 'مارس', translation: 'March', emoji: '🌱', analysis: { details_ar: { example: 'يبدأ فصل الربيع في شهر مارس.' }, details_en: { example: 'The spring season begins in March.' } } as any },
  { original_word: 'أبريل', translation: 'April', emoji: '🌦️', analysis: { details_ar: { example: 'تسقط الأمطار الخفيفة في شهر أبريل.' }, details_en: { example: 'Light rain falls in April.' } } as any },
  { original_word: 'مايو', translation: 'May', emoji: '🌼', analysis: { details_ar: { example: 'تتفتح الزهور الجميلة في شهر مايو.' }, details_en: { example: 'Beautiful flowers bloom in May.' } } as any },
  { original_word: 'يونيو', translation: 'June', emoji: '☀️', analysis: { details_ar: { example: 'تبدأ العطلة الصيفية في شهر يونيو.' }, details_en: { example: 'The summer holiday begins in June.' } } as any },
  { original_word: 'يوليو', translation: 'July', emoji: '☀️🔥', analysis: { details_ar: { example: 'يكون الجو حاراً جداً في شهر يوليو.' }, details_en: { example: 'The weather is very hot in July.' } } as any },
  { original_word: 'أغسطس', translation: 'August', emoji: '☀️🏖️', analysis: { details_ar: { example: 'نذهب إلى الشاطئ للاستمتاع في أغسطس.' }, details_en: { example: 'We go to the beach to enjoy ourselves in August.' } } as any },
  { original_word: 'سبتمبر', translation: 'September', emoji: '🍃', analysis: { details_ar: { example: 'يعود الطلاب إلى المدارس في سبتمبر.' }, details_en: { example: 'Students return to schools in September.' } } as any },
  { original_word: 'أكتوبر', translation: 'October', emoji: '🍂', analysis: { details_ar: { example: 'تتساقط أوراق الشجر في شهر أكتوبر.' }, details_en: { example: 'Tree leaves fall in October.' } } as any },
  { original_word: 'نوفمبر', translation: 'November', emoji: '🌬️', analysis: { details_ar: { example: 'يصبح الجو بارداً ومنعشاً في نوفمبر.' }, details_en: { example: 'The weather becomes cool and refreshing in November.' } } as any },
  { original_word: 'ديسمبر', translation: 'December', emoji: '❄️', analysis: { details_ar: { example: 'ديسمبر هو آخر شهر في السنة.' }, details_en: { example: 'December is the last month of the year.' } } as any },
  { original_word: 'شهر', translation: 'Month', emoji: '📅', analysis: { details_ar: { example: 'في أي شهر ولدت؟' }, details_en: { example: 'In which month were you born?' } } as any },
  { original_word: 'شهور', translation: 'Months', emoji: '📆', analysis: { details_ar: { example: 'تتكون السنة من اثني عشر شهراً.' }, details_en: { example: 'The year consists of twelve months.' } } as any },
  { original_word: 'سنة / عام', translation: 'Year', emoji: '⏳', analysis: { details_ar: { example: 'أتمنى لك سنة سعيدة ومليئة بالنجاح.' }, details_en: { example: 'I wish you a happy year full of success.' } } as any },
  { original_word: 'سنين / أعوام', translation: 'Years', emoji: '📆', analysis: { details_ar: { example: 'مرت سنين كثيرة على هذا الحادث.' }, details_en: { example: 'Many years have passed since this incident.' } } as any },
];

const WEATHER_DATA: Partial<Vocabulary>[] = [
  { original_word: 'أنا أُفضِّل', translation: 'I Prefer', emoji: '🤍', analysis: { details_ar: { example: 'أنا أفضل فصل الربيع لأن الجو يكون جميلاً.' }, details_en: { example: 'I prefer the spring season because the weather is beautiful.' } } as any },
  { original_word: 'فصل', translation: 'Season', emoji: '🌤️', analysis: { details_ar: { example: 'أي فصل من فصول السنة تفضل؟' }, details_en: { example: 'Which season of the year do you prefer?' } } as any },
  { original_word: 'فصول', translation: 'Seasons', emoji: '🌦️', analysis: { details_ar: { example: 'تتكون السنة من أربعة فصول.' }, details_en: { example: 'The year consists of four seasons.' } } as any },
  { original_word: 'الربيع', translation: 'Spring', emoji: '🌸', analysis: { details_ar: { example: 'تتفتح الأزهار في فصل الربيع.' }, details_en: { example: 'Flowers bloom in the spring season.' } } as any },
  { original_word: 'الصَّيف', translation: 'Summer', emoji: '☀️', analysis: { details_ar: { example: 'نذهب إلى الشاطئ في فصل الصيف.' }, details_en: { example: 'We go to the beach in the summer season.' } } as any },
  { original_word: 'الخريف', translation: 'Autumn', emoji: '🍂', analysis: { details_ar: { example: 'تتساقط أوراق الأشجار في فصل الخريف.' }, details_en: { example: 'Tree leaves fall in the autumn season.' } } as any },
  { original_word: 'الشِّتاء', translation: 'Winter', emoji: '❄️', analysis: { details_ar: { example: 'ينزل المطر والثلج في فصل الشتاء.' }, details_en: { example: 'Rain and snow fall in the winter season.' } } as any },
  { original_word: 'حار', translation: 'Hot', emoji: '🔥☀️', analysis: { details_ar: { example: 'الجو حار جداً اليوم.' }, details_en: { example: 'The weather is very hot today.' } } as any },
  { original_word: 'بارِد', translation: 'Cold', emoji: '🥶', analysis: { details_ar: { example: 'أشعر بالبرد، الجو بارد في الخارج.' }, details_en: { example: 'I feel cold, the weather is cold outside.' } } as any },
  { original_word: 'مُعتَدِل', translation: 'Mild climate', emoji: '🌤️' + '🙂', analysis: { details_ar: { example: 'الجو معتدل وجميل في فصل الربيع.' }, details_en: { example: 'The weather is mild and beautiful in spring.' } } as any },
  { original_word: 'عاصِف', translation: 'Windy', emoji: '🌬️', analysis: { details_ar: { example: 'الجو عاصف والرياح قوية اليوم.' }, details_en: { example: 'The weather is windy and the winds are strong today.' } } as any },
  { original_word: 'مُمْطِر', translation: 'Rainy', emoji: '🌧️', analysis: { details_ar: { example: 'اليوم يوم ممطر، لا تنسَ المظلة.' }, details_en: { example: 'Today is a rainy day, don\'t forget the umbrella.' } } as any },
  { original_word: 'ثلج', translation: 'Snow', emoji: '❄️', analysis: { details_ar: { example: 'يحب الأطفال اللعب بالثلج في الشتاء.' }, details_en: { example: 'Children love playing with snow in winter.' } } as any },
  { original_word: 'رطب', translation: 'Wet', emoji: '💧', analysis: { details_ar: { example: 'المكان رطب بسبب المطر.' }, details_en: { example: 'The place is wet because of the rain.' } } as any },
  { original_word: 'غائم', translation: 'Cloudy', emoji: '☁️', analysis: { details_ar: { example: 'السماء غائمة اليوم وقد تمطر.' }, details_en: { example: 'The sky is cloudy today and it might rain.' } } as any },
  { original_word: 'ضبابي', translation: 'Foggy', emoji: '🌫️', analysis: { details_ar: { example: 'الرؤية صعبة لأن الجو ضبابي.' }, details_en: { example: 'Vision is difficult because the weather is foggy.' } } as any },
];

const COLOURS_DATA: Partial<Vocabulary>[] = [
  { original_word: 'هذا اللون ...', translation: 'This color is...', emoji: '🎨', analysis: { details_ar: { example: 'هذا اللون أحمر.' }, details_en: { example: 'This color is red.' } } as any },
  { original_word: 'أحمر', translation: 'Red', emoji: '❤️', analysis: { details_ar: { example: 'التفاحة لونها أحمر.' }, details_en: { example: 'The apple is red.' } } as any },
  { original_word: 'برتقالي', translation: 'Orange', emoji: '🧡', analysis: { details_ar: { example: 'البرتقال لونه برتقالي.' }, details_en: { example: 'The orange is orange.' } } as any },
  { original_word: 'أصفر', translation: 'Yellow', emoji: '💛', analysis: { details_ar: { example: 'الشمس لونها أصفر.' }, details_en: { example: 'The sun is yellow.' } } as any },
  { original_word: 'أخضر', translation: 'Green', emoji: '💚', analysis: { details_ar: { example: 'العشب لونه أخضر.' }, details_en: { example: 'The grass is green.' } } as any },
  { original_word: 'أزرق', translation: 'Blue', emoji: '💙', analysis: { details_ar: { example: 'السماء لونها أزرق.' }, details_en: { example: 'The sky is blue.' } } as any },
  { original_word: 'بنفسجي', translation: 'Purple', emoji: '💜', analysis: { details_ar: { example: 'أحب الزهور البنفسجية.' }, details_en: { example: 'I love purple flowers.' } } as any },
  { original_word: 'أسود', translation: 'Black', emoji: '🖤', analysis: { details_ar: { example: 'الليل لونه أسود.' }, details_en: { example: 'The night is black.' } } as any },
  { original_word: 'أبيض', translation: 'White', emoji: '🤍', analysis: { details_ar: { example: 'الثلج لونه أبيض ناصع.' }, details_en: { example: 'The snow is bright white.' } } as any },
  { original_word: 'بني', translation: 'Brown', emoji: '🤎', analysis: { details_ar: { example: 'هذا الكرسي لونه بني.' }, details_en: { example: 'This chair is brown.' } } as any },
  { original_word: 'وردي', translation: 'Pink', emoji: '🩷', analysis: { details_ar: { example: 'الورد لونه وردي جميل.' }, details_en: { example: 'The rose is a beautiful pink color.' } } as any },
  { original_word: 'أزرق فاتح', translation: 'Light Blue', emoji: '🩵', analysis: { details_ar: { example: 'السماء اليوم باللون الأزرق الفاتح.' }, details_en: { example: 'The sky is light blue today.' } } as any },
  { original_word: 'رمادي', translation: 'Grey', emoji: '🩶', analysis: { details_ar: { example: 'السحاب لونه رمادي اليوم.' }, details_en: { example: 'The clouds are gray today.' } } as any },
  { original_word: 'ملون', translation: 'Colorful', emoji: '🌈', analysis: { details_ar: { example: 'أحب الملابس الملونة.' }, details_en: { example: 'I love colorful clothes.' } } as any },
  { original_word: 'فاتح', translation: 'Light', emoji: '🔆', analysis: { details_ar: { example: 'أفضل الألوان الفاتحة في الصيف.' }, details_en: { example: 'I prefer light colors in summer.' } } as any },
  { original_word: 'غامق', translation: 'Dark', emoji: '🕳️', analysis: { details_ar: { example: 'هذا الثوب لونه أخضر غامق.' }, details_en: { example: 'This dress is dark green.' } } as any },
];

const FOOD_DRINK_DATA: Partial<Vocabulary>[] = [
  { original_word: 'أُرز', translation: 'Rice', emoji: '🍚', analysis: { details_ar: { example: 'أحب أكل الرز مع اللحم.' }, details_en: { example: 'I love eating rice with meat.' } } as any },
  { original_word: 'لحم', translation: 'Meat', emoji: '🥩', analysis: { details_ar: { example: 'اللحم المشوي لذيذ جداً.' }, details_en: { example: 'Grilled meat is very delicious.' } } as any },
  { original_word: 'دجاج', translation: 'Chicken', emoji: '🍗', analysis: { details_ar: { example: 'الدجاج المقلي طعمه رائع.' }, details_en: { example: 'Fried chicken tastes great.' } } as any },
  { original_word: 'سمك', translation: 'Fish', emoji: '🐟', analysis: { details_ar: { example: 'السمك يعيش في الماء.' }, details_en: { example: 'Fish lives in water.' } } as any },
  { original_word: 'بيض مسلوق', translation: 'Boiled Egg', emoji: '🥚', analysis: { details_ar: { example: 'أتناول بيضاً مسلوقاً في الصباح.' }, details_en: { example: 'I eat a boiled egg in the morning.' } } as any },
  { original_word: 'بيض مقلي', translation: 'Fried Egg', emoji: '🍳', analysis: { details_ar: { example: 'البيض المقلي وجبة سريعة.' }, details_en: { example: 'Fried egg is a quick meal.' } } as any },
  { original_word: 'نودلز', translation: 'Noodles', emoji: '🍜', analysis: { details_ar: { example: 'النودلز طعام صيني مشهور.' }, details_en: { example: 'Noodles are a famous Chinese food.' } } as any },
  { original_word: 'بيتزا', translation: 'Pizza', emoji: '🍕', analysis: { details_ar: { example: 'البيتزا بالجبنة هي المفضلة لدي.' }, details_en: { example: 'Cheese pizza is my favorite.' } } as any },
  { original_word: 'سلطة', translation: 'Salad', emoji: '🥗', analysis: { details_ar: { example: 'السلطة الخضراء صحية جداً.' }, details_en: { example: 'Green salad is very healthy.' } } as any },
  { original_word: 'بطاطس مقلية', translation: 'Fries', emoji: '🍟', analysis: { details_ar: { example: 'الجميع يحب البطاطس المقلية.' }, details_en: { example: 'Everyone loves fries.' } } as any },
  { original_word: 'خبز', translation: 'Bread', emoji: '🫓', analysis: { details_ar: { example: 'أشتري الخبز من المخبز.' }, details_en: { example: 'I buy bread from the bakery.' } } as any },
  { original_word: 'قهوة', translation: 'Coffee', emoji: '☕', analysis: { details_ar: { example: 'أشرب القهوة في الصباح.' }, details_en: { example: 'I drink coffee in the morning.' } } as any },
  { original_word: 'شاي', translation: 'Tea', emoji: '🍵', analysis: { details_ar: { example: 'الشاي الساخن مريح للأعصاب.' }, details_en: { example: 'Hot tea is relaxing.' } } as any },
  { original_word: 'حليب', translation: 'Milk', emoji: '🥛', analysis: { details_ar: { example: 'الحليب مفيد لبناء العظام.' }, details_en: { example: 'Milk is beneficial for building bones.' } } as any },
  { original_word: 'عصير', translation: 'Juice', emoji: '🍹', analysis: { details_ar: { example: 'عصير البرتقال طازج ومنعش.' }, details_en: { example: 'Orange juice is fresh and refreshing.' } } as any },
  { original_word: 'مشروب غازي', translation: 'Soda', emoji: '🥤', analysis: { details_ar: { example: 'لا تكثر من المشروبات الغازية.' }, details_en: { example: "Don't drink too much soda." } } as any },
];

const VEGETABLES_DATA: Partial<Vocabulary>[] = [
  { original_word: 'طماطم', translation: 'Tomatoes', emoji: '🍅', analysis: { details_ar: { example: 'الطماطم الحمراء مفيدة جدًا للصحة.' }, details_en: { example: 'Red tomatoes are very beneficial for health.' } } as any },
  { original_word: 'خيار', translation: 'Cucumber', emoji: '🥒', analysis: { details_ar: { example: 'أحب أكل الخيار الطازج في السلطة.' }, details_en: { example: 'I love eating fresh cucumber in the salad.' } } as any },
  { original_word: 'جزر', translation: 'Carrots', emoji: '🥕', analysis: { details_ar: { example: 'الجزر يقوي النظر كما يقال.' }, details_en: { example: 'Carrots strengthen vision as it is said.' } } as any },
  { original_word: 'خس', translation: 'Lettuce', emoji: '🥬', analysis: { details_ar: { example: 'نضع الخس في الشطيرة ليكون طعمها لذيذًا.' }, details_en: { example: 'We put lettuce in the sandwich to make it taste delicious.' } } as any },
  { original_word: 'بطاطس', translation: 'Potatoes', emoji: '🥔', analysis: { details_ar: { example: 'البطاطس المقلية هي الطعام المفضل للأطفال.' }, details_en: { example: 'Fried potatoes are the favorite food for children.' } } as any },
  { original_word: 'بصل', translation: 'Onions', emoji: '🧅', analysis: { details_ar: { example: 'البصل يعطي نكهة رائعة للطعام المطبوخ.' }, details_en: { example: 'Onion gives a great flavor to cooked food.' } } as any },
  { original_word: 'ثوم', translation: 'Garlic', emoji: '🧄', analysis: { details_ar: { example: 'الثوم مفيد جدًا لتقوية المناعة.' }, details_en: { example: 'Garlic is very useful for strengthening immunity.' } } as any },
  { original_word: 'ليمون', translation: 'Lemon', emoji: '🍋', analysis: { details_ar: { example: 'أشرب عصير الليمون عندما أشعر بالبرد.' }, details_en: { example: 'I drink lemon juice when I feel cold.' } } as any },
  { original_word: 'فلفل رومي', translation: 'Bell Pepper', emoji: '🫑', analysis: { details_ar: { example: 'الفلفل الرومي يعطي طعمًا رائعًا للسلطة.' }, details_en: { example: 'Bell pepper gives a great taste to the salad.' } } as any },
  { original_word: 'شطة', translation: 'Chili pepper', emoji: '🌶️', analysis: { details_ar: { example: 'أحب الطعام الحار الذي يحتوي على الشطة.' }, details_en: { example: 'I love spicy food that contains chili pepper.' } } as any },
  { original_word: 'زيتون', translation: 'Olives', emoji: '🫒', analysis: { details_ar: { example: 'الزيتون الأخضر والأسود لذيذ مع الفطور.' }, details_en: { example: 'Green and black olives are delicious with breakfast.' } } as any },
  { original_word: 'ذرة', translation: 'Corn', emoji: '🌽', analysis: { details_ar: { example: 'الذرة المشوي طعمه لذيذ جدًا.' }, details_en: { example: 'Grilled corn tastes very delicious.' } } as any },
  { original_word: 'باذنجان', translation: 'Eggplants', emoji: '🍆', analysis: { details_ar: { example: 'أحب أكل الباذنجان المشوي.' }, details_en: { example: 'I love eating grilled eggplant.' } } as any },
  { original_word: 'قرنبيط', translation: 'Cauliflower', emoji: '🥦', analysis: { details_ar: { example: 'القرنبيط المقلي طعمه رائع.' }, details_en: { example: 'Fried cauliflower tastes great.' } } as any },
  { original_word: 'بطاطا حلوة', translation: 'Sweet Potato', emoji: '🍠', analysis: { details_ar: { example: 'نأكل البطاطا الحلوة المشوية في الشتاء.' }, details_en: { example: 'We eat roasted sweet potatoes in winter.' } } as any },
  { original_word: 'عيش الغراب', translation: 'Mushrooms', emoji: '🍄', analysis: { details_ar: { example: 'نضيف عيش الغراب إلى البيتزا أو الحساء.' }, details_en: { example: 'We add mushrooms to pizza or soup.' } } as any },
];

const FRUITS_DATA: Partial<Vocabulary>[] = [
  { original_word: 'تفاح', translation: 'Apple', emoji: '🍎', analysis: { details_ar: { example: 'أحب أكل التفاح الأحمر.' }, details_en: { example: 'I love eating red apples.' } } as any },
  { original_word: 'موز', translation: 'Banana', emoji: '🍌', analysis: { details_ar: { example: 'الموز غني بالبوتاسيوم.' }, details_en: { example: 'Bananas are rich in potassium.' } } as any },
  { original_word: 'برتقال', translation: 'Orange', emoji: '🍊', analysis: { details_ar: { example: 'عصير البرتقال مفيد في الشتاء.' }, details_en: { example: 'Orange juice is useful in winter.' } } as any },
  { original_word: 'بطيخ', translation: 'Watermelon', emoji: '🍉', analysis: { details_ar: { example: 'البطيخ فاكهة منعشة في الصيف.' }, details_en: { example: 'Watermelon is a refreshing fruit in summer.' } } as any },
  { original_word: 'عنب', translation: 'Grapes', emoji: '🍇', analysis: { details_ar: { example: 'يوجد عذب أخضر وأنواع أخرى.' }, details_en: { example: 'There are green grapes and other types.' } } as any },
  { original_word: 'مانجو', translation: 'Mango', emoji: '🥭', analysis: { details_ar: { example: 'المانجو فاكهة استوائية لذيذة.' }, details_en: { example: 'Mango is a delicious tropical fruit.' } } as any },
  { original_word: 'أناناس', translation: 'Pineapple', emoji: '🍍', analysis: { details_ar: { example: 'الأناناس له طعم حلو وحامض.' }, details_en: { example: 'Pineapple has a sweet and sour taste.' } } as any },
  { original_word: 'فراولة', translation: 'Strawberry', emoji: '🍓', analysis: { details_ar: { example: 'أحب كعكة الفراولة.' }, details_en: { example: 'I love strawberry cake.' } } as any },
  { original_word: 'خوخ', translation: 'Peach', emoji: '🍑', analysis: { details_ar: { example: 'الخوخ ناعم وحلو المذاق.' }, details_en: { example: 'The peach is soft and sweet tasting.' } } as any },
  { original_word: 'كيوي', translation: 'Kiwi', emoji: '🥝', analysis: { details_ar: { example: 'الكيوي غني بفيتامين سي.' }, details_en: { example: 'Kiwi is rich in vitamin C.' } } as any },
  { original_word: 'توت', translation: 'Blueberry', emoji: '🫐', analysis: { details_ar: { example: 'التوت الأزرق مفيد جداً.' }, details_en: { example: 'Blueberries are very beneficial.' } } as any },
  { original_word: 'يوسفي', translation: 'Tangerine', emoji: '🍊', analysis: { details_ar: { example: 'اليوسفي يشبه البرتقال ولكنه أصغر.' }, details_en: { example: 'Tangerine is like an orange but smaller.' } } as any },
  { original_word: 'كرز', translation: 'Cherry', emoji: '🍒', analysis: { details_ar: { example: 'الكرز الأحمر جميل المنظر.' }, details_en: { example: 'Red cherries are beautiful to look at.' } } as any },
  { original_word: 'كمثرى', translation: 'Pear', emoji: '🍐', analysis: { details_ar: { example: 'الكمثرى فاكهة لذيذة ومفيدة.' }, details_en: { example: 'The pear is a delicious and beneficial fruit.' } } as any },
  { original_word: 'جوز الهند', translation: 'Coconut', emoji: '🥥', analysis: { details_ar: { example: 'ماء جوز الهند منعش جداً.' }, details_en: { example: 'Coconut water is very refreshing.' } } as any },
  { original_word: 'شمام', translation: 'Melon', emoji: '🍈', analysis: { details_ar: { example: 'الشمام فاكهة صيفية بامتياز.' }, details_en: { example: 'Melon is a summer fruit par excellence.' } } as any },
];

const BIRDS_DATA: Partial<Vocabulary>[] = [
  { original_word: 'نسر', translation: 'Eagle', emoji: '🦅', analysis: { details_ar: { example: 'النسر يحلق عالياً في السماء.' }, details_en: { example: 'The eagle flies high in the sky.' } } as any },
  { original_word: 'خفاش', translation: 'Bat', emoji: '🦇', analysis: { details_ar: { example: 'الخفاش يخرج في الليل للبحث عن الطعام.' }, details_en: { example: 'The bat comes out at night to search for food.' } } as any },
  { original_word: 'بومة', translation: 'Owl', emoji: '🦉', analysis: { details_ar: { example: 'البومة طائر نشيط في الليل.' }, details_en: { example: 'The owl is a bird active at night.' } } as any },
  { original_word: 'طاووس', translation: 'Peacock', emoji: '🦚', analysis: { details_ar: { example: 'الطاووس طائر جميل يتميز بريشه الملون.' }, details_en: { example: 'The peacock is a beautiful bird known for its colorful feathers.' } } as any },
  { original_word: 'فلامينجو', translation: 'Flamingo', emoji: '🦩', analysis: { details_ar: { example: 'الفلامينجو طائر وردي يعيش قرب الماء.' }, details_en: { example: 'The flamingo is a pink bird that lives near water.' } } as any },
  { original_word: 'عصفور', translation: 'Sparrow', emoji: '🐦', analysis: { details_ar: { example: 'العصفور يغرد بشكل جميل في الصباح.' }, details_en: { example: 'The sparrow chirps beautifully in the morning.' } } as any },
  { original_word: 'حمامة', translation: 'Pigeon', emoji: '🕊️', analysis: { details_ar: { example: 'الحمامة رمز للسلام والمودة.' }, details_en: { example: 'The pigeon is a symbol of peace and affection.' } } as any },
  { original_word: 'ديك رومي', translation: 'Turkey', emoji: '🦃', analysis: { details_ar: { example: 'نطبخ الديك الرومي في المناسبات الكبيرة.' }, details_en: { example: 'We cook turkey on large occasions.' } } as any },
  { original_word: 'دجاجة', translation: 'Hen', emoji: '🐔', analysis: { details_ar: { example: 'الدجاجة تعطينا البيض الطازج كل يوم.' }, details_en: { example: 'The hen gives us fresh eggs every day.' } } as any },
  { original_word: 'ديك', translation: 'Rooster', emoji: '🐓', analysis: { details_ar: { example: 'الديك يصيح ليوقظنا في الصباح الباكر.' }, details_en: { example: 'The rooster crows to wake us up early in the morning.' } } as any },
  { original_word: 'صوص', translation: 'Chick', emoji: '🐣', analysis: { details_ar: { example: 'الصوص الصغير لونه أصفر وجميل جداً.' }, details_en: { example: 'The little chick is yellow and very beautiful.' } } as any },
  { original_word: 'بطة', translation: 'Duck', emoji: '🦆', analysis: { details_ar: { example: 'البطة تسبح بسعادة في البحيرة.' }, details_en: { example: 'The duck swims happily in the lake.' } } as any },
  { original_word: 'أوزة', translation: 'Goose', emoji: '🪿', analysis: { details_ar: { example: 'الأوزة طائر كبير يحب السباحة في الحديقة.' }, details_en: { example: 'The goose is a large bird that loves swimming in the garden.' } } as any },
  { original_word: 'ببغاء', translation: 'Parrot', emoji: '🦜', analysis: { details_ar: { example: 'الببغاء يحب تقليد أصوات الناس.' }, details_en: { example: 'The parrot loves to imitate people\'s voices.' } } as any },
  { original_word: 'بجع', translation: 'Swan', emoji: '🦢', analysis: { details_ar: { example: 'البجع يسبح برقة في مياه البحيرة.' }, details_en: { example: 'The swan swims gracefully in the lake waters.' } } as any },
  { original_word: 'بطريق', translation: 'Penguin', emoji: '🐧', analysis: { details_ar: { example: 'البطريق طائر يعيش في الجليد ولا يطير.' }, details_en: { example: 'The penguin is a bird that lives in ice and does not fly.' } } as any },
];

const FISH_DATA: Partial<Vocabulary>[] = [
  { original_word: 'حوت', translation: 'Whale', emoji: '🐋', analysis: { details_ar: { example: 'الحوت هو أكبر كائن حي في المحيط.' }, details_en: { example: 'The whale is the largest living creature in the ocean.' } } as any },
  { original_word: 'قرش', translation: 'Shark', emoji: '🦈', analysis: { details_ar: { example: 'القرش يملك أسنانًا حادة جدًا.' }, details_en: { example: 'The shark has very sharp teeth.' } } as any },
  { original_word: 'دولفين', translation: 'Dolphin', emoji: '🐬', analysis: { details_ar: { example: 'الدولفين صديق الإنسان وهو حيوان ذكي.' }, details_en: { example: 'The dolphin is a friend to humans and is an intelligent animal.' } } as any },
  { original_word: 'فقمة', translation: 'Seal', emoji: '🦭', analysis: { details_ar: { example: 'الفقمة تعيش في المياه الباردة.' }, details_en: { example: 'The seal lives in cold waters.' } } as any },
  { original_word: 'أخطبوط', translation: 'Octopus', emoji: '🐙', analysis: { details_ar: { example: 'الأخطبوط له ثمانية أرجل.' }, details_en: { example: 'The octopus has eight legs.' } } as any },
  { original_word: 'جمبري', translation: 'Shrimp', emoji: '🦐', analysis: { details_ar: { example: 'أحب أكل الجمبري المشوي.' }, details_en: { example: 'I love eating grilled shrimp.' } } as any },
  { original_word: 'استاكوزا', translation: 'Lobster', emoji: '🦞', analysis: { details_ar: { example: 'الاستاكوزا طعام بحري غالي ولذيذ.' }, details_en: { example: 'Lobster is a precious and delicious seafood.' } } as any },
  { original_word: 'كابوريا', translation: 'Crab', emoji: '🦀', analysis: { details_ar: { example: 'الكابوريا تتحرك بشكل جانبي على الشاطئ.' }, details_en: { example: 'The crab moves sideways on the beach.' } } as any },
  { original_word: 'حبار', translation: 'Squid', emoji: '🦑', analysis: { details_ar: { example: 'الحبار يطلق حبرًا ليهرب من الأعداء.' }, details_en: { example: 'The squid releases ink to escape from enemies.' } } as any },
  { original_word: 'قنديل البحر', translation: 'Jellyfish', emoji: '🪼', analysis: { details_ar: { example: 'لسعة قنديل البحر قد تكون مؤلمة.' }, details_en: { example: 'A jellyfish sting can be painful.' } } as any },
  { original_word: 'محار', translation: 'Oyster', emoji: '🦪', analysis: { details_ar: { example: 'المحار ينتج اللؤلؤ الجميل.' }, details_en: { example: 'Oysters produce beautiful pearls.' } } as any },
  { original_word: 'حلزون بحري', translation: 'Spiral Shell', emoji: '🐚', analysis: { details_ar: { example: 'وجدت حلزونًا بحريًا جميلاً على الرمل.' }, details_en: { example: 'I found a beautiful spiral shell on the sand.' } } as any },
  { original_word: 'دودة بحرية', translation: 'Worm', emoji: '🪱', analysis: { details_ar: { example: 'الدودة البحرية تعيش في قاع البحر.' }, details_en: { example: 'The sea worm lives at the bottom of the sea.' } } as any },
  { original_word: 'سوشي', translation: 'Sushi', emoji: '🍣', analysis: { details_ar: { example: 'السوشي طعام ياباني يحتوي على السمك النيء.' }, details_en: { example: 'Sushi is a Japanese food containing raw fish.' } } as any },
  { original_word: 'سنارة', translation: 'Fishing Rod', emoji: '🎣', analysis: { details_ar: { example: 'استخدمت السنارة لصيد السمكة.' }, details_en: { example: 'I used the fishing rod to catch the fish.' } } as any },
  { original_word: 'سمكة زينة', translation: 'Tropical Fish', emoji: '🐠', analysis: { details_ar: { example: 'سمكة الزينة الملونة تجعل الحوض جميلاً.' }, details_en: { example: 'Tropical fish make the aquarium beautiful.' } } as any },
];

const ANIMALS_DATA: Partial<Vocabulary>[] = [
  { original_word: 'أسد', translation: 'Lion', emoji: '🦁', analysis: { details_ar: { example: 'الأسد هو ملك الغابة.' }, details_en: { example: 'The lion is the king of the jungle.' } } as any },
  { original_word: 'نمر', translation: 'Tiger', emoji: '🐅', analysis: { details_ar: { example: 'النمر له خطوط سوداء جميلة.' }, details_en: { example: 'The tiger has beautiful black stripes.' } } as any },
  { original_word: 'فهد', translation: 'Cheetah', emoji: '🐆', analysis: { details_ar: { example: 'الفهد هو أسرع حيوان بري.' }, details_en: { example: 'The cheetah is the fastest land animal.' } } as any },
  { original_word: 'ذئب', translation: 'Wolf', emoji: '🐺', analysis: { details_ar: { example: 'الذئب يعيش في مجموعات تسمى قطيع.' }, details_en: { example: 'The wolf lives in groups called a pack.' } } as any },
  { original_word: 'زرافة', translation: 'Giraffe', emoji: '🦒', analysis: { details_ar: { example: 'الزرافة لها رقبة طويلة جداً.' }, details_en: { example: 'The giraffe has a very long neck.' } } as any },
  { original_word: 'حمار وحشي', translation: 'Zebra', emoji: '🦓', analysis: { details_ar: { example: 'الحمار الوحشي له جلد مخطط بالأبيض والأسود.' }, details_en: { example: 'The zebra has black and white striped skin.' } } as any },
  { original_word: 'ثعلب', translation: 'Fox', emoji: '🦊', analysis: { details_ar: { example: 'الثعلب حيوان معروف بمكره وذكائه.' }, details_en: { example: 'The fox is an animal known for its cunning and intelligence.' } } as any },
  { original_word: 'فيل', translation: 'Elephant', emoji: '🐘', analysis: { details_ar: { example: 'الفيل له خرطوم طويل وأذنان كبيرتان.' }, details_en: { example: 'The elephant has a long trunk and large ears.' } } as any },
  { original_word: 'قطة', translation: 'Cat', emoji: '🐈', analysis: { details_ar: { example: 'القطة حيوان أليف يحب اللعب.' }, details_en: { example: 'The cat is a pet that loves to play.' } } as any },
  { original_word: 'كلب', translation: 'Dog', emoji: '🦮', analysis: { details_ar: { example: 'الكلب هو صديق وفي للإنسان.' }, details_en: { example: 'The dog is a loyal friend to humans.' } } as any },
  { original_word: 'خروف', translation: 'Sheep', emoji: '🐑', analysis: { details_ar: { example: 'نحصل على الصوف من الخروف.' }, details_en: { example: 'We get wool from the sheep.' } } as any },
  { original_word: 'ماعز', translation: 'Goat', emoji: '🐐', analysis: { details_ar: { example: 'الماعز يحب تسلق الجبال والأشجار.' }, details_en: { example: 'The goat loves climbing mountains and trees.' } } as any },
  { original_word: 'جمل', translation: 'Camel', emoji: '🐪', analysis: { details_ar: { example: 'الجمل يسمى سفينة الصحراء.' }, details_en: { example: 'The camel is called the ship of the desert.' } } as any },
  { original_word: 'حصان', translation: 'Horse', emoji: '🐎', analysis: { details_ar: { example: 'الحصان حيوان قوي وسريع.' }, details_en: { example: 'The horse is a strong and fast animal.' } } as any },
  { original_word: 'حمار', translation: 'Donkey', emoji: '🫏', analysis: { details_ar: { example: 'الحمار يساعد المزارع في نقل الأشياء.' }, details_en: { example: 'The donkey helps the farmer in transporting things.' } } as any },
  { original_word: 'بقرة', translation: 'Cow', emoji: '🐄', analysis: { details_ar: { example: 'البقرة تعطينا الحليب والمفيد.' }, details_en: { example: 'The cow gives us useful milk.' } } as any },
];

const INSECTS_REPTILES_DATA: Partial<Vocabulary>[] = [
  { original_word: 'فراشة', translation: 'Butterfly', emoji: '🦋', analysis: { details_ar: { example: 'الفراشة الملونة تطير فوق الزهور.' }, details_en: { example: 'The colorful butterfly flies over the flowers.' } } as any },
  { original_word: 'نحلة', translation: 'Bee', emoji: '🐝', analysis: { details_ar: { example: 'النحلة تمتص الرحيق لتصنع العسل.' }, details_en: { example: 'The bee sucks nectar to make honey.' } } as any },
  { original_word: 'نملة', translation: 'Ant', emoji: '🐜', analysis: { details_ar: { example: 'النملة حشرة نشيطة تعمل بجد.' }, details_en: { example: 'The ant is an active insect that works hard.' } } as any },
  { original_word: 'ذبابة', translation: 'Fly', emoji: '🪰', analysis: { details_ar: { example: 'الذبابة المزعجة تطير في الغرفة.' }, details_en: { example: 'The annoying fly flies in the room.' } } as any },
  { original_word: 'بعوضة', translation: 'Mosquito', emoji: '🦟', analysis: { details_ar: { example: 'لدغة البعوضة تسبب الحكة.' }, details_en: { example: 'The mosquito bite causes itching.' } } as any },
  { original_word: 'جرادة', translation: 'Locust', emoji: '🦗', analysis: { details_ar: { example: 'الجرادة تقفز عالياً في الحقول.' }, details_en: { example: 'The locust jumps high in the fields.' } } as any },
  { original_word: 'صرصور', translation: 'Cockroach', emoji: '🪳', analysis: { details_ar: { example: 'الصرصور يخرج غالباً في الليل.' }, details_en: { example: 'The cockroach often comes out at night.' } } as any },
  { original_word: 'خنفساء', translation: 'Beetle', emoji: '🪲', analysis: { details_ar: { example: 'الخنفساء الصغيرة تسير الهوينى.' }, details_en: { example: 'The little beetle walks slowly.' } } as any },
  { original_word: 'يرقة', translation: 'Caterpillar', emoji: '🐛', analysis: { details_ar: { example: 'اليرقة تتحول يوماً ما إلى فراشة.' }, details_en: { example: 'The caterpillar will one day turn into a butterfly.' } } as any },
  { original_word: 'عنكبوت', translation: 'Spider', emoji: '🕷️', analysis: { details_ar: { example: 'العنكبوت يبني شبكة قوية لصيد الفرائس.' }, details_en: { example: 'The spider builds a strong web to catch prey.' } } as any },
  { original_word: 'ثعبان', translation: 'Snake', emoji: '🐍', analysis: { details_ar: { example: 'الثعبان يزحف على الأرض بصمت.' }, details_en: { example: 'The snake crawls silently on the ground.' } } as any },
  { original_word: 'سلحفاة', translation: 'Turtle', emoji: '🐢', analysis: { details_ar: { example: 'السلحفاة حيوان بطيء ومحمي بدرع.' }, details_en: { example: 'The turtle is a slow animal protected by a shell.' } } as any },
  { original_word: 'تمساح', translation: 'Crocodile', emoji: '🐊', analysis: { details_ar: { example: 'التمساح حيوان مفترس يعيش في الماء والبر.' }, details_en: { example: 'The crocodile is a predator that lives in water and on land.' } } as any },
  { original_word: 'سحلية', translation: 'Lizard', emoji: '🦎', analysis: { details_ar: { example: 'السحلية تختبئ بين الصخور في الشمس.' }, details_en: { example: 'The lizard hides among the rocks in the sun.' } } as any },
  { original_word: 'ضفدع', translation: 'Frog', emoji: '🐸', analysis: { details_ar: { example: 'الضفدع يقفز ويصدر صوتاً في المستنقع.' }, details_en: { example: 'The frog jumps and makes a sound in the swamp.' } } as any },
  { original_word: 'تنين', translation: 'Dragon', emoji: '🐉', analysis: { details_ar: { example: 'التنين كائن أسطوري ينفث النار.' }, details_en: { example: 'The dragon is a legendary creature that breathes fire.' } } as any },
];

const TIME_DATA: Partial<Vocabulary>[] = [
  { original_word: 'الساعة الآن', translation: 'The time now is', emoji: '⌚', analysis: { details_ar: { example: 'الساعة الآن العاشرة صباحاً.' }, details_en: { example: 'The time now is ten AM.' } } as any },
  { original_word: 'الواحدة', translation: 'One o’clock', emoji: '🕐', analysis: { details_ar: { example: 'أتناول الغداء في الواحدة ظهراً.' }, details_en: { example: 'I eat lunch at one o\'clock.' } } as any },
  { original_word: 'الثانية', translation: 'Two o’clock', emoji: '🕑', analysis: { details_ar: { example: 'موعدنا في الساعة الثانية.' }, details_en: { example: 'Our appointment is at two o\'clock.' } } as any },
  { original_word: 'الثالثة', translation: 'Three o’clock', emoji: '🕒', analysis: { details_ar: { example: 'تنتهي الحصة في الثالثة.' }, details_en: { example: 'The lesson ends at three o\'clock.' } } as any },
  { original_word: 'الرابعة', translation: 'Four o’clock', emoji: '🕓', analysis: { details_ar: { example: 'أذهب إلى النادي في الرابعة.' }, details_en: { example: 'I go to the club at four o\'clock.' } } as any },
  { original_word: 'الخامسة', translation: 'Five o’clock', emoji: '🕔', analysis: { details_ar: { example: 'أعود إلى المنزل في الخامسة.' }, details_en: { example: 'I return home at five o\'clock.' } } as any },
  { original_word: 'السادسة', translation: 'Six o’clock', emoji: '🕕', analysis: { details_ar: { example: 'أستيقظ في السادسة صباحاً.' }, details_en: { example: 'I wake up at six o\'clock in the morning.' } } as any },
  { original_word: 'السابعة', translation: 'Seven o’clock', emoji: '🕖', analysis: { details_ar: { example: 'نتناول العشاء في السابعة.' }, details_en: { example: 'We have dinner at seven o\'clock.' } } as any },
  { original_word: 'الثامنة', translation: 'Eight o’clock', emoji: '🕗', analysis: { details_ar: { example: 'يبدأ العمل في الثامنة.' }, details_en: { example: 'Work starts at eight o\'clock.' } } as any },
  { original_word: 'التاسعة', translation: 'Nine o’clock', emoji: '🕘', analysis: { details_ar: { example: 'أنام في التاسعة مساءً.' }, details_en: { example: 'I sleep at nine PM.' } } as any },
  { original_word: 'العاشرة', translation: 'Ten o’clock', emoji: '🕙', analysis: { details_ar: { example: 'الحادية عشرة قبل العاشرة.' }, details_en: { example: 'Ten o\'clock is after nine.' } } as any },
  { original_word: 'الحادية عشرة', translation: 'Eleven o’clock', emoji: '🕚', analysis: { details_ar: { example: 'الساعة الحادية عشرة ليلاً.' }, details_en: { example: 'It is eleven o\'clock at night.' } } as any },
  { original_word: 'الثانية عشرة', translation: 'Twelve o’clock', emoji: '🕛', analysis: { details_ar: { example: 'الظهيرة هي الثانية عشرة.' }, details_en: { example: 'Noon is twelve o\'clock.' } } as any },
  { original_word: 'والنصف', translation: 'Half past', emoji: '🕧', analysis: { details_ar: { example: 'الساعة الآن الواحدة والنصف.' }, details_en: { example: 'The time now is half past one.' } } as any },
  { original_word: 'صباحًا', translation: 'AM', emoji: '🌞', analysis: { details_ar: { example: 'أمارس الرياضة في السادسة صباحاً.' }, details_en: { example: 'I exercise at six AM.' } } as any },
  { original_word: 'مساءً', translation: 'PM', emoji: '🌙', analysis: { details_ar: { example: 'أشاهد فيلماً في الثامنة مساءً.' }, details_en: { example: 'I watch a movie at eight PM.' } } as any },
];

const BODY_PARTS_DATA: Partial<Vocabulary>[] = [
  { original_word: 'وجه', translation: 'Face', emoji: '👧🏻', analysis: { details_ar: { example: 'غسلت وجهي بالماء والصابون.' }, details_en: { example: 'I washed my face with water and soap.' } } as any },
  { original_word: 'رأس', translation: 'Head', emoji: '🧑🏻', analysis: { details_ar: { example: 'أشعر بألم في رأسي اليوم.' }, details_en: { example: 'I feel a pain in my head today.' } } as any },
  { original_word: 'عين', translation: 'Eye', emoji: '👁️', analysis: { details_ar: { example: 'العين هي عضو الرؤية.' }, details_en: { example: 'The eye is the organ of vision.' } } as any },
  { original_word: 'أنف', translation: 'Nose', emoji: '👃🏻', analysis: { details_ar: { example: 'أتنفس الهواء من أنفي.' }, details_en: { example: 'I breathe air through my nose.' } } as any },
  { original_word: 'أُذُن', translation: 'Ear', emoji: '👂🏻', analysis: { details_ar: { example: 'أسمع الأصوات بأذني.' }, details_en: { example: 'I hear sounds with my ear.' } } as any },
  { original_word: 'فَم', translation: 'Mouth', emoji: '👄', analysis: { details_ar: { example: 'نتحدث ونأكل بالفم.' }, details_en: { example: 'We talk and eat with the mouth.' } } as any },
  { original_word: 'لِسان', translation: 'Tongue', emoji: '👅', analysis: { details_ar: { example: 'اللسان يساعدنا على التذوق.' }, details_en: { example: 'The tongue helps us taste.' } } as any },
  { original_word: 'أسنان', translation: 'Teeth', emoji: '🦷', analysis: { details_ar: { example: 'أنظف أسناني كل صباح.' }, details_en: { example: 'I clean my teeth every morning.' } } as any },
  { original_word: 'شِفاه', translation: 'Lips', emoji: '💋', analysis: { details_ar: { example: 'نستخدم الشفاه في الابتسام.' }, details_en: { example: 'We use the lips in smiling.' } } as any },
  { original_word: 'إصبع', translation: 'Finger', emoji: '☝🏻', analysis: { details_ar: { example: 'جرحت إصبعي أثناء الطبخ.' }, details_en: { example: 'I cut my finger during cooking.' } } as any },
  { original_word: 'ظُفر', translation: 'Nail', emoji: '💅🏻', analysis: { details_ar: { example: 'يجب أن نقص أظافرنا بانتظام.' }, details_en: { example: 'We must cut our nails regularly.' } } as any },
  { original_word: 'يَد', translation: 'Hand', emoji: '✋🏻', analysis: { details_ar: { example: 'أكتب بيدي اليمنى.' }, details_en: { example: 'I write with my right hand.' } } as any },
  { original_word: 'ذِراع', translation: 'Arm', emoji: '💪🏻', analysis: { details_ar: { example: 'الذراع جزء مهم من الجسم.' }, details_en: { example: 'The arm is an important part of the body.' } } as any },
  { original_word: 'قَدَم', translation: 'Foot', emoji: '🦶🏻', analysis: { details_ar: { example: 'نلبس الحذاء في القدم.' }, details_en: { example: 'We wear shoes on the foot.' } } as any },
  { original_word: 'ساق', translation: 'Leg', emoji: '🦵🏻', analysis: { details_ar: { example: 'الساق تساعدنا على المشي والجري.' }, details_en: { example: 'The leg helps us walk and run.' } } as any },
  { original_word: 'شعر', translation: 'Hair', emoji: '👱🏻', analysis: { details_ar: { example: 'أحب تسريح شعري الطويل.' }, details_en: { example: 'I love combing my long hair.' } } as any },
];

const JOBS_DATA: Partial<Vocabulary>[] = [
  { original_word: 'طبيب', translation: 'Doctor', emoji: '👨🏻‍⚕️', analysis: { details_ar: { example: 'الطبيب يعالج المرضى في المستشفى.' }, details_en: { example: 'The doctor treats patients in the hospital.' } } as any },
  { original_word: 'ممرض', translation: 'Nurse', emoji: '👨🏽‍🔬', analysis: { details_ar: { example: 'الممرض يساعد الطبيب في رعاية المرضى.' }, details_en: { example: 'The nurse helps the doctor in caring for patients.' } } as any },
  { original_word: 'شرطي', translation: 'Police Officer', emoji: '👮🏻‍♂️', analysis: { details_ar: { example: 'الشرطي يحافظ على الأمن والنظام.' }, details_en: { example: 'The police officer maintains security and order.' } } as any },
  { original_word: 'رجل إطفاء', translation: 'Firefighter', emoji: '👨🏻‍🚒', analysis: { details_ar: { example: 'رجل الإطفاء يخمد الحرائق بشجاعة.' }, details_en: { example: 'The firefighter extinguishes fires bravely.' } } as any },
  { original_word: 'مزارع', translation: 'Farmer', emoji: '🧑🏻‍🌾', analysis: { details_ar: { example: 'المزارع يزرع الخضروات والفواكه.' }, details_en: { example: 'The farmer grows vegetables and fruits.' } } as any },
  { original_word: 'طباخ', translation: 'Chef', emoji: '👨🏻‍🍳', analysis: { details_ar: { example: 'الطباخ يعد طعاماً لذيذاً في المطعم.' }, details_en: { example: 'The chef prepares delicious food in the restaurant.' } } as any },
  { original_word: 'مهندس', translation: 'Engineer', emoji: '👷🏻', analysis: { details_ar: { example: 'المهندس يصمم المباني والجسور.' }, details_en: { example: 'The engineer designs buildings and bridges.' } } as any },
  { original_word: 'عامل', translation: 'Worker', emoji: '👨🏻‍🏭', analysis: { details_ar: { example: 'العامل يعمل بجد في المصنع.' }, details_en: { example: 'The worker works hard in the factory.' } } as any },
  { original_word: 'معلم', translation: 'Teacher', emoji: '👨🏻‍🏫', analysis: { details_ar: { example: 'المعلم يشرح الدروس للتلاميذ.' }, details_en: { example: 'The teacher explains lessons to the students.' } } as any },
  { original_word: 'عالم', translation: 'Scientist', emoji: '🧑🏻‍🔬', analysis: { details_ar: { example: 'العالم يقوم بإجراء التجارب في المختبر.' }, details_en: { example: 'The scientist conducts experiments in the laboratory.' } } as any },
  { original_word: 'مبرمج', translation: 'Programmer', emoji: '🧑🏻‍💻', analysis: { details_ar: { example: 'المبرمج يكتب الأكواد لتطوير التطبيقات.' }, details_en: { example: 'The programmer writes code to develop applications.' } } as any },
  { original_word: 'طيار', translation: 'Pilot', emoji: '👨🏻‍✈️', analysis: { details_ar: { example: 'الطيار يقود الطائرة بمهارة.' }, details_en: { example: 'The pilot flies the aircraft skillfully.' } } as any },
  { original_word: 'رائد فضاء', translation: 'Astronaut', emoji: '🧑🏻‍🚀', analysis: { details_ar: { example: 'رائد الفضاء يسافر إلى القمر والنجوم.' }, details_en: { example: 'The astronaut travels to the moon and stars.' } } as any },
  { original_word: 'قاضي', translation: 'Judge', emoji: '👨🏻‍⚖️', analysis: { details_ar: { example: 'القاضي يحكم بالعدل بين الناس.' }, details_en: { example: 'The judge rules with justice between people.' } } as any },
  { original_word: 'فنان', translation: 'Artist', emoji: '👨🏻‍🎨', analysis: { details_ar: { example: 'الفنان يرسم لوحات جميلة ومعبرة.' }, details_en: { example: 'The artist draws beautiful and expressive paintings.' } } as any },
  { original_word: 'سباك', translation: 'Plumber', emoji: '👨🏻‍🔧', analysis: { details_ar: { example: 'السباك يصلح صنبور المياه المكسور.' }, details_en: { example: 'The plumber fixes the broken water tap.' } } as any },
];

const PLACES_DATA: Partial<Vocabulary>[] = [
  { original_word: 'مدرسة', translation: 'School', emoji: '🏫', analysis: { details_ar: { example: 'أذهب إلى المدرسة كل صباح.' }, details_en: { example: 'I go to school every morning.' } } as any },
  { original_word: 'مستشفى', translation: 'Hospital', emoji: '🏥', analysis: { details_ar: { example: 'المستشفى مكان لعلاج المرضى.' }, details_en: { example: 'A hospital is a place for treating patients.' } } as any },
  { original_word: 'مطعم', translation: 'Restaurant', emoji: '🍽️', analysis: { details_ar: { example: 'تناولنا العشاء في مطعم جميل.' }, details_en: { example: 'We had dinner at a beautiful restaurant.' } } as any },
  { original_word: 'فندق', translation: 'Hotel', emoji: '🏨', analysis: { details_ar: { example: 'حجزنا غرفة في فندق كبير.' }, details_en: { example: 'We booked a room in a large hotel.' } } as any },
  { original_word: 'صيدلية', translation: 'Pharmacy', emoji: '💊\n💉', analysis: { details_ar: { example: 'أحتاج للذهاب إلى الصيدلية لشراء الدواء.' }, details_en: { example: 'I need to go to the pharmacy to buy medicine.' } } as any },
  { original_word: 'مطار', translation: 'Airport', emoji: '🛫', analysis: { details_ar: { example: 'وصلنا إلى المطار قبل موعد الرحلة.' }, details_en: { example: 'We arrived at the airport before the flight time.' } } as any },
  { original_word: 'محل', translation: 'Shop', emoji: '🛍️', analysis: { details_ar: { example: 'هذا المحل يبيع ملابس رائعة.' }, details_en: { example: 'This shop sells great clothes.' } } as any },
  { original_word: 'سوبر ماركت', translation: 'Supermarket', emoji: '🛒', analysis: { details_ar: { example: 'نشتري الحاجيات من السوبر ماركت.' }, details_en: { example: 'We buy groceries from the supermarket.' } } as any },
  { original_word: 'مسرح', translation: 'Theatre', emoji: '🎭', analysis: { details_ar: { example: 'المسرح يقدم عروضاً فنية مذهلة.' }, details_en: { example: 'The theatre offers amazing artistic shows.' } } as any },
  { original_word: 'سينما', translation: 'Cinema', emoji: '🎬', analysis: { details_ar: { example: 'شاهدنا فيلماً ممتعاً في السينما.' }, details_en: { example: 'We watched an interesting film at the cinema.' } } as any },
  { original_word: 'سيرك', translation: 'Circus', emoji: '🎪', analysis: { details_ar: { example: 'رأينا عروضاً مذهلة في السيرك.' }, details_en: { example: 'We saw amazing shows at the circus.' } } as any },
  { original_word: 'شاطئ', translation: 'Beach', emoji: '🏖️', analysis: { details_ar: { example: 'قضينا يوماً ممتعاً على الشاطئ.' }, details_en: { example: 'We spent an enjoyable day at the beach.' } } as any },
  { original_word: 'مدينة ألعاب', translation: 'Amusement Park', emoji: '🎡', analysis: { details_ar: { example: 'مدينة ألعاب هي مكاني المفضل للمرح.' }, details_en: { example: 'The amusement park is my favorite place for fun.' } } as any },
  { original_word: 'استاد', translation: 'Stadium', emoji: '🏟️', analysis: { details_ar: { example: 'ذهبنا إلى الاستاد لمشاهدة المباراة.' }, details_en: { example: 'We went to the stadium to watch the match.' } } as any },
  { original_word: 'حديقة حيوان', translation: 'Zoo', emoji: '🐅', analysis: { details_ar: { example: 'رأينا الزرافة في حديقة الحيوان.' }, details_en: { example: 'We saw the giraffe at the zoo.' } } as any },
  { original_word: 'متحف', translation: 'Museum', emoji: '🏛️', analysis: { details_ar: { example: 'المتحف يحتوي على قطع أثرية قديمة.' }, details_en: { example: 'The museum contains ancient artifacts.' } } as any },
];

const TRANSPORT_DATA: Partial<Vocabulary>[] = [
  { original_word: 'سيارة', translation: 'Car', emoji: '🚗', analysis: { details_ar: { example: 'يقود والدي سيارة حمراء.' }, details_en: { example: 'My father drives a red car.' } } as any },
  { original_word: 'سيارة أجرة', translation: 'Taxi', emoji: '🚕', analysis: { details_ar: { example: 'أخذنا سيارة أجرة للوصول إلى المطار.' }, details_en: { example: 'We took a taxi to get to the airport.' } } as any },
  { original_word: 'حافلة', translation: 'Bus', emoji: '🚌', analysis: { details_ar: { example: 'أذهب إلى المدرسة بالحافلة.' }, details_en: { example: 'I go to school by bus.' } } as any },
  { original_word: 'سيارة شرطة', translation: 'Police Car', emoji: '🚔', analysis: { details_ar: { example: 'سيارة الشرطة تسير بسرعة في الشارع.' }, details_en: { example: 'The police car is driving fast in the street.' } } as any },
  { original_word: 'سيارة إسعاف', translation: 'Ambulance', emoji: '🚑', analysis: { details_ar: { example: 'سيارة الإسعاف تنقل المرضى إلى المستشفى.' }, details_en: { example: 'The ambulance transports patients to the hospital.' } } as any },
  { original_word: 'سيارة إطفاء', translation: 'Fire Engine', emoji: '🚒', analysis: { details_ar: { example: 'سيارة الإطفاء تسرع لإخماد الحريق.' }, details_en: { example: 'The fire engine rushes to put out the fire.' } } as any },
  { original_word: 'شاحنة', translation: 'Truck', emoji: '🚚', analysis: { details_ar: { example: 'الشاحنة تحمل بضائع ثقيلة.' }, details_en: { example: 'The truck carries heavy goods.' } } as any },
  { original_word: 'سكوتر', translation: 'Scooter', emoji: '🛴', analysis: { details_ar: { example: 'يحب الأطفال اللعب بالسكوتر في الحديقة.' }, details_en: { example: 'Children love playing with scooters in the park.' } } as any },
  { original_word: 'دراجة', translation: 'Bicycle', emoji: '🚲', analysis: { details_ar: { example: 'أركب دراجتي في المساء.' }, details_en: { example: 'I ride my bicycle in the evening.' } } as any },
  { original_word: 'دراجة نارية', translation: 'Motorcycle', emoji: '🏍️', analysis: { details_ar: { example: 'الدراجة النارية أسرع من الدراجة الهوائية.' }, details_en: { example: 'The motorcycle is faster than the bicycle.' } } as any },
  { original_word: 'قطار', translation: 'Train', emoji: '🚆', analysis: { details_ar: { example: 'سافرنا إلى المدينة بالقطار.' }, details_en: { example: 'We traveled to the city by train.' } } as any },
  { original_word: 'مترو', translation: 'Metro', emoji: '🚇', analysis: { details_ar: { example: 'المترو وسيلة نقل سريعة تحت الأرض.' }, details_en: { example: 'The metro is a fast underground means of transport.' } } as any },
  { original_word: 'تلفريك', translation: 'Mountain Cableway', emoji: '🚠', analysis: { details_ar: { example: 'ركبنا التلفريك لمشاهدة الجبال.' }, details_en: { example: 'We rode the cableway to see the mountains.' } } as any },
  { original_word: 'سفينة', translation: 'Ship', emoji: '🚢', analysis: { details_ar: { example: 'السفينة تبحر في المحيط.' }, details_en: { example: 'The ship sails in the ocean.' } } as any },
  { original_word: 'طائرة', translation: 'Airplane', emoji: '🛩️', analysis: { details_ar: { example: 'الطائرة تحلق عالياً في السماء.' }, details_en: { example: 'The airplane flies high in the sky.' } } as any },
  { original_word: 'قارب شراعي', translation: 'Sailboat', emoji: '⛵', analysis: { details_ar: { example: 'رأينا قارباً شراعياً جميلاً في البحر.' }, details_en: { example: 'We saw a beautiful sailboat in the sea.' } } as any },
];

const SPORTS_DATA: Partial<Vocabulary>[] = [
  { original_word: 'كرة قدم', translation: 'Football', emoji: '⚽', analysis: { details_ar: { example: 'أحب لعب كرة القدم مع أصدقائي في الملعب.' }, details_en: { example: 'I love playing football with my friends on the field.' } } as any },
  { original_word: 'كرة سلة', translation: 'Basketball', emoji: '🏀', analysis: { details_ar: { example: 'سجل أخي هدفاً رائعاً في مباراة كرة السلة.' }, details_en: { example: 'My brother scored a great goal in the basketball game.' } } as any },
  { original_word: 'بيسبول', translation: 'Baseball', emoji: '⚾', analysis: { details_ar: { example: 'تلعب رياضة البيسبول باستخدام مضرب وكرة صغيرة.' }, details_en: { example: 'Baseball is played using a bat and a small ball.' } } as any },
  { original_word: 'تنس', translation: 'Tennis', emoji: '🎾', analysis: { details_ar: { example: 'تطلب مباراة التنس تركيزاً عالياً وحركة سريعة.' }, details_en: { example: 'A tennis match requires high concentration and fast movement.' } } as any },
  { original_word: 'كرة طائرة', translation: 'Volleyball', emoji: '🏐', analysis: { details_ar: { example: 'نلعب كرة الطائرة على الشاطئ في فصل الصيف.' }, details_en: { example: 'We play volleyball on the beach during the summer.' } } as any },
  { original_word: 'تنس طاولة', translation: 'Table Tennis', emoji: '🏓', analysis: { details_ar: { example: 'فزت بالمركز الأول في بطولة تنس الطاولة بالمدرسة.' }, details_en: { example: 'I won first place in the school table tennis championship.' } } as any },
  { original_word: 'ريشة طائرة', translation: 'Badminton', emoji: '🏸', analysis: { details_ar: { example: 'الريشة الطائرة رياضة ممتعة وخفيفة نلعبها في الحديقة.' }, details_en: { example: 'Badminton is a fun and light sport we play in the park.' } } as any },
  { original_word: 'ملاكمة', translation: 'Boxing', emoji: '🥊', analysis: { details_ar: { example: 'يرتدي الملاكم قفازات قوية في حلبة الملاكمة.' }, details_en: { example: 'The boxer wears strong gloves in the boxing ring.' } } as any },
  { original_word: 'مصارعة', translation: 'Wrestling', emoji: '🤼🏻', analysis: { details_ar: { example: 'تحتاج رياضة المصارعة إلى قوة بدنية وتكتيك ذكي.' }, details_en: { example: 'Wrestling requires physical strength and smart tactics.' } } as any },
  { original_word: 'رفع أثقال', translation: 'Weightlifting', emoji: '🏋🏻‍♂️', analysis: { details_ar: { example: 'يتدرب البطل يومياً على رفع أثقال لزيادة قوته.' }, details_en: { example: 'The champion trains daily in weightlifting to increase his strength.' } } as any },
  { original_word: 'دراجات', translation: 'Cycling', emoji: '🚴🏻‍♂️', analysis: { details_ar: { example: 'ركوب الدراجات يحسن اللياقة البدنية وصحة القلب.' }, details_en: { example: 'Cycling improves physical fitness and heart health.' } } as any },
  { original_word: 'سباحة', translation: 'Swimming', emoji: '🏊🏻‍♂️', analysis: { details_ar: { example: 'أذهب إلى المسبح لتعلم السباحة في عطلة نهاية الأسبوع.' }, details_en: { example: 'I go to the pool to learn swimming on the weekend.' } } as any },
  { original_word: 'تزلج', translation: 'Skiing', emoji: '⛷️', analysis: { details_ar: { example: 'نستمتع بممارسة التزلج على الجليد في جبال الألب.' }, details_en: { example: 'We enjoy skiing on snow in the Alps.' } } as any },
  { original_word: 'سباق الخيل', translation: 'Horse Racing', emoji: '🏇🏻', analysis: { details_ar: { example: 'حضرنا سباق الخيل وتفاعلنا مع الفارس الفائز.' }, details_en: { example: 'We attended the horse racing and cheered for the winning jockey.' } } as any },
  { original_word: 'جمباز', translation: 'Gymnastics', emoji: '🤸🏻‍♂️', analysis: { details_ar: { example: 'رياضة الجمباز تساعد على زيادة مرونة وتوازن الجسم.' }, details_en: { example: 'Gymnastics helps increase the body’s flexibility and balance.' } } as any },
  { original_word: 'تسلق', translation: 'Climbing', emoji: '🧗🏻‍♂️', analysis: { details_ar: { example: 'يتطلب تسلق الجبال حبالاً متينة ومهارة عالية.' }, details_en: { example: 'Mountain climbing requires strong ropes and high skill.' } } as any },
];

const NATURE_DATA: Partial<Vocabulary>[] = [
  { original_word: 'شجرة', translation: 'Tree', emoji: '🌳', analysis: { details_ar: { example: 'تزرع في حديقة بيتنا شجرة تفاح كبيرة.' }, details_en: { example: 'A large apple tree is planted in our home garden.' } } as any },
  { original_word: 'غابة', translation: 'Forest', emoji: '🌲', analysis: { details_ar: { example: 'تعيش الحيوانات والطيور البرية في غابة كثيفة.' }, details_en: { example: 'Wild animals and birds live in a dense forest.' } } as any },
  { original_word: 'نخلة', translation: 'Palm Tree', emoji: '🌴', analysis: { details_ar: { example: 'ترتفع نخلة طويلة في وسط الصحراء.' }, details_en: { example: 'A tall palm tree rises in the middle of the desert.' } } as any },
  { original_word: 'صبار', translation: 'Cactus', emoji: '🌵', analysis: { details_ar: { example: 'ينمو نبات صبار في الصحراء القاحلة.' }, details_en: { example: 'A cactus grows in the arid desert.' } } as any },
  { original_word: 'نبات', translation: 'Herb / Plant', emoji: '🌿', analysis: { details_ar: { example: 'هذا نبات طبي يستعمل لعلاج الأمراض.' }, details_en: { example: 'This is a medicinal plant used to treat diseases.' } } as any },
  { original_word: 'ورقة شجر', translation: 'Leaf', emoji: '🍃', analysis: { details_ar: { example: 'سقطت ورقة شجر خضراء على الأرض.' }, details_en: { example: 'A green leaf fell to the ground.' } } as any },
  { original_word: 'قمح', translation: 'Grain / Wheat', emoji: '🌾', analysis: { details_ar: { example: 'يحصد الفلاح قمحاً ذهبياً في فصل الصيف.' }, details_en: { example: 'The farmer harvests golden wheat in the summer season.' } } as any },
  { original_word: 'زهرة', translation: 'Flower', emoji: '🌸', analysis: { details_ar: { example: 'تتفتح زهرة بيضاء تعطي رائحة عطرة.' }, details_en: { example: 'A white flower blooms giving a fragrant scent.' } } as any },
  { original_word: 'دوّار الشمس', translation: 'Sunflower', emoji: '🌻', analysis: { details_ar: { example: 'تتجه زهرة دوّار الشمس دائماً نحو الضوء والحرارة.' }, details_en: { example: 'The sunflower always faces towards the light and heat.' } } as any },
  { original_word: 'جبل', translation: 'Mountain', emoji: '🏔️', analysis: { details_ar: { example: 'يغطي الثلج جبل إفرست بشكل مذهل.' }, details_en: { example: 'Snow covers Mount Everest spectacularly.' } } as any },
  { original_word: 'تلة', translation: 'Hill', emoji: '⛰️', analysis: { details_ar: { example: 'صعدنا إلى تلة خضراء لنرى غروب الشمس.' }, details_en: { example: 'We climbed up a green hill to see the sunset.' } } as any },
  { original_word: 'جبل بركاني', translation: 'Volcano', emoji: '🗻', analysis: { details_ar: { example: 'يخرج الغاز الساخن من جبل بركاني نشط.' }, details_en: { example: 'Hot gas comes out of an active volcano.' } } as any },
  { original_word: 'وادٍ / طبيعة', translation: 'National Park / Landscape', emoji: '🏞️', analysis: { details_ar: { example: 'استمتعنا بالتنزه في وادٍ رائع مليء بالأشجار.' }, details_en: { example: 'We enjoyed hiking in a wonderful national park full of trees.' } } as any },
  { original_word: 'شاطئ', translation: 'Beach', emoji: '🏖️', analysis: { details_ar: { example: 'أحب الجري ولعب الرمل على شاطئ البحر.' }, details_en: { example: 'I love running and playing with sand on the beach.' } } as any },
  { original_word: 'جزيرة', translation: 'Island', emoji: '🏝️', analysis: { details_ar: { example: 'تقع جزيرة صغيرة ساحرة في وسط المحيط.' }, details_en: { example: 'A charming small island lies in the middle of the ocean.' } } as any },
  { original_word: 'بحر', translation: 'Sea / Ocean', emoji: '🌊', analysis: { details_ar: { example: 'البحر هادئ والمياه زرقاء وصافية جداً.' }, details_en: { example: 'The sea is calm and the water is very blue and clear.' } } as any },
];

const TECHNOLOGY_DATA: Partial<Vocabulary>[] = [
  { original_word: 'هاتف ذكي', translation: 'Smartphone', emoji: '📱', analysis: { details_ar: { example: 'أستخدم هاتفي الذكي لقراءة الكتب الإلكترونية.' }, details_en: { example: 'I use my smartphone to read e-books.' } } as any },
  { original_word: 'حاسوب', translation: 'Computer', emoji: '🖥️', analysis: { details_ar: { example: 'تعلمت كيفية البرمجة باستخدام الحاسوب المكتبي.' }, details_en: { example: 'I learned how to program using a desktop computer.' } } as any },
  { original_word: 'لابتوب', translation: 'Laptop', emoji: '💻', analysis: { details_ar: { example: 'أحمل لابتوب خفيف الوزن للعمل في المقهى.' }, details_en: { example: 'I carry a lightweight laptop to work in the cafe.' } } as any },
  { original_word: 'لوحة مفاتيح', translation: 'Keyboard', emoji: '⌨️', analysis: { details_ar: { example: 'أكتب بسرعة وسلاسة على لوحة مفاتيح ميكانيكية.' }, details_en: { example: 'I type quickly and smoothly on a mechanical keyboard.' } } as any },
  { original_word: 'فأرة', translation: 'Mouse', emoji: '🖱️', analysis: { details_ar: { example: 'حرك الفأرة على الطاولة لتوجيه المؤشر.' }, details_en: { example: 'Move the mouse on the table to direct the cursor.' } } as any },
  { original_word: 'طابعة', translation: 'Printer', emoji: '🖨️', analysis: { details_ar: { example: 'أرسل الأوراق الهامة إلى طابعة المكتب بالألوان.' }, details_en: { example: 'I send important papers to the office color printer.' } } as any },
  { original_word: 'قرص مرن', translation: 'Floppy Disk', emoji: '💾', analysis: { details_ar: { example: 'كان القرص المرن رمزاً قديماً لحفظ الملفات.' }, details_en: { example: 'The floppy disk was an old symbol for saving files.' } } as any },
  { original_word: 'قرص مدمج', translation: 'Compact Disc', emoji: '💿', analysis: { details_ar: { example: 'قمت بنسخ بعض الموسيقى على قرص مدمج قديماً.' }, details_en: { example: 'I burned some music onto a compact disc back in the day.' } } as any },
  { original_word: 'كاميرا', translation: 'Camera', emoji: '📷', analysis: { details_ar: { example: 'التقط المصور صورة رائعة باستخدام كاميرا احترافية.' }, details_en: { example: 'The photographer captured a wonderful picture using a professional camera.' } } as any },
  { original_word: 'كاميرا فيديو', translation: 'Video Camera', emoji: '🎥', analysis: { details_ar: { example: 'استخدم المخرج كاميرا فيديو حديثة لتصوير المشهد.' }, details_en: { example: 'The director used a modern video camera to film the scene.' } } as any },
  { original_word: 'إشارة', translation: 'Signal', emoji: '📡', analysis: { details_ar: { example: 'يلتقط هذا الهوائي اللاسلكي إشارة واضحة من القمر الصناعي.' }, details_en: { example: 'This wireless antenna intercepts a clear signal from the satellite.' } } as any },
  { original_word: 'شاحن', translation: 'Plug', emoji: '🔌', analysis: { details_ar: { example: 'أحتاج إلى شاحن سريع لشحن بطارية هاتفي.' }, details_en: { example: 'I need a fast charger (plug) to charge my phone battery.' } } as any },
  { original_word: 'واي فاي', translation: 'Wi-Fi', emoji: '📶', analysis: { details_ar: { example: 'تتميز شبكة الواي فاي في المنزل بإنترنت سريع.' }, details_en: { example: 'The home Wi-Fi network features fast internet.' } } as any },
  { original_word: 'بطارية', translation: 'Battery', emoji: '🔋', analysis: { details_ar: { example: 'نفدت بطارية الكشاف وعلي استبدالها بأخرى جديدة.' }, details_en: { example: 'The flashlight battery is empty and I must replace it with a new one.' } } as any },
  { original_word: 'إعدادات', translation: 'Settings', emoji: '⚙️', analysis: { details_ar: { example: 'ادخل إلى قائمة الإعدادات لتغيير لغة النظام.' }, details_en: { example: 'Enter the settings menu to change the system language.' } } as any },
  { original_word: 'ذكاء اصطناعي', translation: 'Artificial Intelligence', emoji: '🧠', analysis: { details_ar: { example: 'يقدم الذكاء الاصطناعي حلولاً مبتكرة للمشاكل الصعبة.' }, details_en: { example: 'Artificial intelligence offers innovative solutions to difficult problems.' } } as any },
];

const HEALTH_DATA: Partial<Vocabulary>[] = [
  { original_word: 'دواء', translation: 'Medicine', emoji: '💊', analysis: { details_ar: { example: 'تناول المريض الدواء الذي وصفه له الطبيب.' }, details_en: { example: 'The patient took the medicine prescribed to him by the doctor.' } } as any },
  { original_word: 'إبرة', translation: 'Injection', emoji: '💉', analysis: { details_ar: { example: 'أعطى الممرض المريض إبرة لتخفيف الألم.' }, details_en: { example: 'The nurse gave the patient an injection to relieve the pain.' } } as any },
  { original_word: 'سماعة طبيب', translation: 'Stethoscope', emoji: '🩺', analysis: { details_ar: { example: 'يستخدم الطبيب سماعة الطبيب لفحص نبضات القلب.' }, details_en: { example: 'The doctor uses the stethoscope to check the heartbeat.' } } as any },
  { original_word: 'ميزان حرارة', translation: 'Thermometer', emoji: '🌡️', analysis: { details_ar: { example: 'استخدمت الأم ميزان الحرارة لقياس حرارة طفلها.' }, details_en: { example: 'The mother used the thermometer to measure her child\'s temperature.' } } as any },
  { original_word: 'دم', translation: 'Blood', emoji: '🩸', analysis: { details_ar: { example: 'تبرع فاعل الخير بحقيبة دم لإنقاذ حياة المريض.' }, details_en: { example: 'The benefactor donated a bag of blood to save the patient\'s life.' } } as any },
  { original_word: 'جرثومة', translation: 'Germ', emoji: '🦠', analysis: { details_ar: { example: 'اغسل يديك بالصابون للقضاء على الجراثيم.' }, details_en: { example: 'Wash your hands with soap to eliminate germs.' } } as any },
  { original_word: 'معقم', translation: 'Sanitizer', emoji: '🧴', analysis: { details_ar: { example: 'يجب استخدام معقم اليدين للوقاية من الأمراض.' }, details_en: { example: 'You must use hand sanitizer to prevent diseases.' } } as any },
  { original_word: 'لاصق طبي', translation: 'Bandage', emoji: '🩹', analysis: { details_ar: { example: 'وضعت الأم لاصقاً طبياً على الجرح الصغير.' }, details_en: { example: 'The mother placed a bandage on the small wound.' } } as any },
  { original_word: 'إسعاف', translation: 'Ambulance', emoji: '🚑', analysis: { details_ar: { example: 'وصلت سيارة الإسعاف بسرعة لنقل المريض الطارئ.' }, details_en: { example: 'The ambulance arrived quickly to transport the emergency patient.' } } as any },
  { original_word: 'قلب', translation: 'Heart', emoji: '🫀', analysis: { details_ar: { example: 'ممارسة التمارين الرياضية تقوي عضلة القلب.' }, details_en: { example: 'Exercising strengthens the heart muscle.' } } as any },
  { original_word: 'رئتان', translation: 'Lungs', emoji: '🫁', analysis: { details_ar: { example: 'الهواء النقي والصحي مفيد لصحة الرئتين.' }, details_en: { example: 'Fresh and healthy air is beneficial for the health of lungs.' } } as any },
  { original_word: 'دماغ', translation: 'Brain', emoji: '🧠', analysis: { details_ar: { example: 'الدماغ هو العضو الرئيسي للتحكم ووظائف التفكير.' }, details_en: { example: 'The brain is the main organ for control and thinking functions.' } } as any },
  { original_word: 'سن', translation: 'Tooth', emoji: '🦷', analysis: { details_ar: { example: 'أنظف سني بالفرشاة والمعجون بعد كل وجبة.' }, details_en: { example: 'I clean my tooth with brush and toothpaste after every meal.' } } as any },
  { original_word: 'عظم', translation: 'Bone', emoji: '🦴', analysis: { details_ar: { example: 'نقص الكالسيوم يضعف العظام بشكل عام.' }, details_en: { example: 'Calcium deficiency weakens the bones in general.' } } as any },
  { original_word: 'كرسي متحرك', translation: 'Wheelchair', emoji: '🦽', analysis: { details_ar: { example: 'يستخدم المصاب الكرسي المتحرك للتنقل بسهولة.' }, details_en: { example: 'The injured person uses the wheelchair to move around easily.' } } as any },
  { original_word: 'عكاز', translation: 'Crutch', emoji: '🩼', analysis: { details_ar: { example: 'يستند المريض على العكاز للمشي بعد كسر ساقه.' }, details_en: { example: 'The patient leans on the crutch to walk after breaking his leg.' } } as any },
];

const SHOPPING_DATA: Partial<Vocabulary>[] = [
  { original_word: 'مول', translation: 'Mall', emoji: '🏬', analysis: { details_ar: { example: 'أذهب إلى المول لشراء ملابس جديدة.' }, details_en: { example: 'I go to the mall to buy new clothes.' } } as any },
  { original_word: 'عربة تسوق', translation: 'Shopping cart', emoji: '🛒', analysis: { details_ar: { example: 'أضع البضائع داخل عربة التسوق في السوبرماركت.' }, details_en: { example: 'I place the goods inside the shopping cart in the supermarket.' } } as any },
  { original_word: 'سلة تسوق', translation: 'Shopping basket', emoji: '🧺', analysis: { details_ar: { example: 'احمل سلة تسوق صغيرة إذا كنت تشتري أغراضاً قليلة.' }, details_en: { example: 'Carry a small shopping basket if you are buying a few items.' } } as any },
  { original_word: 'أكياس تسوق', translation: 'Shopping bags', emoji: '🛍️', analysis: { details_ar: { example: 'نقلت المشتريات في أكياس تسوق صديقة للبيئة.' }, details_en: { example: 'I carried the purchases in eco-friendly shopping bags.' } } as any },
  { original_word: 'صندوق', translation: 'Box', emoji: '📦', analysis: { details_ar: { example: 'وضعت البضائع المشحونة في صندوق كرتوني كبير.' }, details_en: { example: 'I placed the shipped goods in a large cardboard box.' } } as any },
  { original_word: 'تغليف الهدايا', translation: 'Gift wrapping', emoji: '🎁', analysis: { details_ar: { example: 'يقدم المتجر خدمة تغليف الهدايا مجاناً للزبائن.' }, details_en: { example: 'The store offers free gift wrapping service for customers.' } } as any },
  { original_word: 'تخفيضات', translation: 'Discount / Sale', emoji: '🏷️', analysis: { details_ar: { example: 'هناك تخفيضات كبرى بمناسبة نهاية الموسم المالي.' }, details_en: { example: 'There are major discounts/sales on the occasion of the fiscal year-end.' } } as any },
  { original_word: 'موظف المبيعات', translation: 'Sales assistant', emoji: '👨‍💼', analysis: { details_ar: { example: 'ساعدني موظف المبيعات في العثور على القياس المناسب.' }, details_en: { example: 'The sales assistant helped me find the right size.' } } as any },
  { original_word: 'تسوق إلكتروني', translation: 'Online shopping', emoji: '📱', analysis: { details_ar: { example: 'أصبح التسوق الإلكتروني أكثر سهولة وسرعة من ذي قبل.' }, details_en: { example: 'Online shopping has become easier and faster than before.' } } as any },
  { original_word: 'إعلان العروض', translation: 'Sale announcement', emoji: '📢', analysis: { details_ar: { example: 'استمعت إلى إعلان العروض عبر مكبر الصوت في المتجر.' }, details_en: { example: 'I listened to the sale announcement over the loudspeaker in the store.' } } as any },
  { original_word: 'نقود', translation: 'Cash / Money', emoji: '💵', analysis: { details_ar: { example: 'أفضل الدفع نقداً باستخدام نقود ورقية.' }, details_en: { example: 'I prefer to pay in cash using paper money.' } } as any },
  { original_word: 'بطاقة دفع', translation: 'Payment card', emoji: '💳', analysis: { details_ar: { example: 'استخدمت بطاقة الدفع الإلكتروني لإتمام عملية الشراء.' }, details_en: { example: 'I used the electronic payment card to complete the purchase.' } } as any },
  { original_word: 'إيصال', translation: 'Receipt', emoji: '🧾', analysis: { details_ar: { example: 'احتفظت به من أجل إثبات الشراء في الإيصال الورقي.' }, details_en: { example: 'I kept the receipt as proof of purchase.' } } as any },
  { original_word: 'مدخل', translation: 'Entrance', emoji: '🚪', analysis: { details_ar: { example: 'التقينا عند مدخل المركز التجاري الرئيسي.' }, details_en: { example: 'We met at the main shopping mall entrance.' } } as any },
  { original_word: 'مصعد', translation: 'Elevator', emoji: '🛗', analysis: { details_ar: { example: 'استخدم المصعد للوصول إلى الطابق الثاني بسرعة.' }, details_en: { example: 'Use the elevator to reach the second floor quickly.' } } as any },
  { original_word: 'موقف سيارات', translation: 'Parking', emoji: '🅿️', analysis: { details_ar: { example: 'ركنت سيارتي في موقف السيارات المخصص للزبائن.' }, details_en: { example: 'I parked my car in the parking lot designated for customers.' } } as any },
];

const TRAVEL_DATA: Partial<Vocabulary>[] = [
  { original_word: 'طائرة', translation: 'Airplane', emoji: '🛩️', analysis: { details_ar: { example: 'سافرت إلى المدينة البعيدة بالطائرة.' }, details_en: { example: 'I traveled to the far city by airplane.' } } as any },
  { original_word: 'إقلاع', translation: 'Departure', emoji: '🛫', analysis: { details_ar: { example: 'حان وقت إقلاع الطائرة الآن.' }, details_en: { example: 'It is time for the airplane departure now.' } } as any },
  { original_word: 'هبوط', translation: 'Arrival', emoji: '🛬', analysis: { details_ar: { example: 'شاهدنا هبوط الطائرة بسلام في المدرج.' }, details_en: { example: 'We watched the airplane arrival safely on the runway.' } } as any },
  { original_word: 'طيار', translation: 'Pilot', emoji: '🧑‍✈️', analysis: { details_ar: { example: 'يقود الطيار الطائرة بمهارة عالية.' }, details_en: { example: 'The pilot flies the plane with high skill.' } } as any },
  { original_word: 'مضيفة طيران', translation: 'Flight attendant', emoji: '👩‍✈️', analysis: { details_ar: { example: 'تقدم مضيفة الطيران وجبات خفيفة للركاب.' }, details_en: { example: 'The flight attendant serves light meals to passengers.' } } as any },
  { original_word: 'مقعد الطائرة', translation: 'Seat', emoji: '💺', analysis: { details_ar: { example: 'حجزت مقعد الطائرة بجانب النافذة لنرى السحاب.' }, details_en: { example: 'I booked the airplane seat next to the window to see the clouds.' } } as any },
  { original_word: 'حقيبة سفر', translation: 'Suitcase', emoji: '🧳', analysis: { details_ar: { example: 'وضعت ملابسي داخل حقيبة سفر كبيرة.' }, details_en: { example: 'I put my clothes inside a large suitcase.' } } as any },
  { original_word: 'حقيبة ظهر', translation: 'Backpack', emoji: '🎒', analysis: { details_ar: { example: 'أحمل زجاجة المياه في حقيبة ظهر مريحة.' }, details_en: { example: 'I carry the water bottle in a comfortable backpack.' } } as any },
  { original_word: 'حقيبة عمل', translation: 'Briefcase', emoji: '💼', analysis: { details_ar: { example: 'يحمل المستندات الهامة في حقيبة عمل جلدية.' }, details_en: { example: 'He carries the important documents in a leather briefcase.' } } as any },
  { original_word: 'حقيبة يد', translation: 'Handbag', emoji: '👜', analysis: { details_ar: { example: 'تحتفظ الأم بمحفظتها ومفاتيحها في حقيبة يد صغيرة.' }, details_en: { example: 'The mother keeps her purse and keys in a small handbag.' } } as any },
  { original_word: 'جواز سفر', translation: 'Passport control', emoji: '🛂', analysis: { details_ar: { example: 'أظهرت جواز سفر المريض عند نقطة العبور.' }, details_en: { example: 'I showed the passport at the passport control point of the crossing.' } } as any },
  { original_word: 'أمتعة', translation: 'Baggage', emoji: '🛄', analysis: { details_ar: { example: 'استلمنا أمتعة السفر من منطقة استلام الحقائب.' }, details_en: { example: 'We received our travel baggage from the baggage claim area.' } } as any },
  { original_word: 'الجمارك', translation: 'Customs', emoji: '🛃', analysis: { details_ar: { example: 'فتش موظف الجمارك الحقيبة قبل الخروج من المطار.' }, details_en: { example: 'The officer checked the bag at customs before exiting the airport.' } } as any },
  { original_word: 'تأخير', translation: 'Delay', emoji: '⏳', analysis: { details_ar: { example: 'سأنتظر لعدة ساعات بسبب تأخير موعد الرحلة.' }, details_en: { example: 'I will wait for several hours due to the flight delay.' } } as any },
  { original_word: 'تذكرة', translation: 'Ticket', emoji: '🎫', analysis: { details_ar: { example: 'حجزت تذكرة ذهاب وإياب عبر الإنترنت.' }, details_en: { example: 'I booked a round-trip ticket online.' } } as any },
  { original_word: 'خريطة', translation: 'Map Cruise', emoji: '🗺️', analysis: { details_ar: { example: 'استخدمنا الخريطة لمعرفة مسار الرحلة.' }, details_en: { example: 'We used the map to find the tour route.' } } as any },
];

const MUSIC_DATA: Partial<Vocabulary>[] = [
  { original_word: 'بيانو', translation: 'Piano', emoji: '🎹', analysis: { details_ar: { example: 'يعزف الفنان لحناً جميلاً على البيانو.' }, details_en: { example: 'The artist plays a beautiful melody on the piano.' } } as any },
  { original_word: 'غيتار', translation: 'Guitar', emoji: '🎸', analysis: { details_ar: { example: 'اشترى أخي غيتاراً جديداً ليتعلم العزف.' }, details_en: { example: 'My brother bought a new guitar to learn how to play.' } } as any },
  { original_word: 'كمان', translation: 'Violin', emoji: '🎻', analysis: { details_ar: { example: 'أصوات الكمان تبعث على الهدوء والراحة.' }, details_en: { example: 'The sounds of the violin bring peace and comfort.' } } as any },
  { original_word: 'طبول', translation: 'Drums', emoji: '🥁', analysis: { details_ar: { example: 'قرع الطبول يحمس الحاضرين في الاحتفال.' }, details_en: { example: 'Beating the drums excites the attendees at the celebration.' } } as any },
  { original_word: 'ساكسفون', translation: 'Saxophone', emoji: '🎷', analysis: { details_ar: { example: 'عزف الموسيقار معزوفة رائعة بالساكسفون.' }, details_en: { example: 'The musician played a wonderful piece on the saxophone.' } } as any },
  { original_word: 'ترومبيت', translation: 'Trumpet', emoji: '🎺', analysis: { details_ar: { example: 'صوت الترومبيت قوي ومرتفع جداً في الفرقة.' }, details_en: { example: 'The sound of the trumpet is strong and very loud in the band.' } } as any },
  { original_word: 'أكورديون', translation: 'Accordion', emoji: '🪗', analysis: { details_ar: { example: 'يتميز الأكورديون بنغماته الشعبية والجميلة.' }, details_en: { example: 'The accordion is characterized by its popular and beautiful tunes.' } } as any },
  { original_word: 'ماراكاس', translation: 'Maracas', emoji: '🪇', analysis: { details_ar: { example: 'هززت الماراكاس لإضافة إيقاع لطيف للفرقة.' }, details_en: { example: 'I shook the maracas to add a nice rhythm to the band.' } } as any },
  { original_word: 'بانجو', translation: 'Banjo', emoji: '🪕', analysis: { details_ar: { example: 'آلة البانجو تستخدم بكثرة في الموسيقى الريفية.' }, details_en: { example: 'The banjo is used extensively in country music.' } } as any },
  { original_word: 'بوق', translation: 'Horn', emoji: '📯', analysis: { details_ar: { example: 'استخدم الحارس البوق لإرسال الإشارات.' }, details_en: { example: 'The guard used the horn to send signals.' } } as any },
  { original_word: 'ناي', translation: 'Flute / Pipe', emoji: '🪈', analysis: { details_ar: { example: 'صوت الناي يعبر عن مشاعر عميقة ودافئة.' }, details_en: { example: 'The sound of the flute expresses deep and warm feelings.' } } as any },
  { original_word: 'أجراس رياح', translation: 'Wind Chimes', emoji: '🎐', analysis: { details_ar: { example: 'علقت الأم أجراس الرياح عند نافذة الشرفة.' }, details_en: { example: 'The mother hung wind chimes near the balcony window.' } } as any },
  { original_word: 'نوتة موسيقية', translation: 'Music notes', emoji: '🎼', analysis: { details_ar: { example: 'يقرأ العازف النوتة الموسيقية أثناء التدريب.' }, details_en: { example: 'The player reads the music notes during practice.' } } as any },
  { original_word: 'ميكروفون', translation: 'Microphone', emoji: '🎙️', analysis: { details_ar: { example: 'تحدث المغني في الميكروفون ليسمعه الجميع.' }, details_en: { example: 'The singer spoke into the microphone for everyone to hear.' } } as any },
  { original_word: 'مكبر صوت', translation: 'Speaker', emoji: '🔊', analysis: { details_ar: { example: 'قمنا بتشغيل مكبر الصوت لملء الغرفة بالنغمات.' }, details_en: { example: 'We turned on the speaker to fill the room with melodies.' } } as any },
  { original_word: 'نظام الصوت', translation: 'Control knobs', emoji: '🎛️', analysis: { details_ar: { example: 'اضبط نظام الصوت لتعديل النغمة.' }, details_en: { example: 'Adjust the control knobs to modify the audio.' } } as any },
];

const ROUTINE_DATA: Partial<Vocabulary>[] = [
  { original_word: 'أستيقظ', translation: 'Wake up', emoji: '⏰', analysis: { details_ar: { example: 'أستيقظ مبكراً كل صباح لبدء يومي بنشاط.' }, details_en: { example: 'I wake up early every morning to start my day actively.' } } as any },
  { original_word: 'أرتب سريري', translation: 'Make bed', emoji: '🛏️', analysis: { details_ar: { example: 'أرتب سريري فور الاستيقاظ لتبقى غرفتي منظمة.' }, details_en: { example: 'I make my bed right after waking up to keep my room organized.' } } as any },
  { original_word: 'أستحم', translation: 'Shower', emoji: '🚿', analysis: { details_ar: { example: 'أستحم بالماء الدافئ لأشعر بالانتعاش والنشاط.' }, details_en: { example: 'I take a shower with warm water to feel refreshed and energized.' } } as any },
  { original_word: 'أنظف أسناني', translation: 'Brush teeth', emoji: '🪥', analysis: { details_ar: { example: 'أنظف أسناني بالفرشاة والمعجون لحمايتها من التسوس.' }, details_en: { example: 'I brush my teeth with a toothbrush and toothpaste to protect them from decay.' } } as any },
  { original_word: 'أرتدي ملابسي', translation: 'Get dressed', emoji: '👕', analysis: { details_ar: { example: 'أرتدي ملابسي بسرعة قبل الذهاب للعمل.' }, details_en: { example: 'I get dressed quickly before going to work.' } } as any },
  { original_word: 'أتناول الإفطار', translation: 'Eat breakfast', emoji: '🍳', analysis: { details_ar: { example: 'أتناول الإفطار مع عائلتي في الصباح الباكر.' }, details_en: { example: 'I eat breakfast with my family in the early morning.' } } as any },
  { original_word: 'أذهب إلى المدرسة', translation: 'Go to school', emoji: '🚌', analysis: { details_ar: { example: 'أركب حافلة المدرسة وأذهب إلى المدرسة بهمة.' }, details_en: { example: 'I ride the school bus and go to school with enthusiasm.' } } as any },
  { original_word: 'أدرس', translation: 'Study', emoji: '📝', analysis: { details_ar: { example: 'أدرس دروسي بانتظام لأنجح بتفوق.' }, details_en: { example: 'I study my lessons regularly to pass with excellence.' } } as any },
  { original_word: 'أعود للمنزل', translation: 'Go home', emoji: '🏠', analysis: { details_ar: { example: 'أعود للمنزل في المساء بعد انتهاء اليوم الدراسي.' }, details_en: { example: 'I go home in the evening after the school day ends.' } } as any },
  { original_word: 'أتناول الغداء', translation: 'Eat lunch', emoji: '🍝', analysis: { details_ar: { example: 'أتناول الغداء مع والدي وأتحدث عن يومي.' }, details_en: { example: 'I eat lunch with my parents and talk about my day.' } } as any },
  { original_word: 'أمارس الرياضة', translation: 'Exercise', emoji: '🏃🏻', analysis: { details_ar: { example: 'أمارس الرياضة يومياً للمحافظة على صحتي وقوتي.' }, details_en: { example: 'I exercise daily to maintain my health and strength.' } } as any },
  { original_word: 'ألعب', translation: 'Play games', emoji: '🎮', analysis: { details_ar: { example: 'ألعب ألعاباً مسلية وممتعة مع أصدقائي في نهاية الأسبوع.' }, details_en: { example: 'I play entertaining and fun games with my friends on the weekend.' } } as any },
  { original_word: 'أسترخي', translation: 'Relax', emoji: '🧘🏻‍♂️', analysis: { details_ar: { example: 'أسترخي قليلاً على الأريكة وأستمع لنغمة هادئة.' }, details_en: { example: 'I relax for a bit on the sofa and listen to a calm tune.' } } as any },
  { original_word: 'أتناول العشاء', translation: 'Eat dinner', emoji: '🥣', analysis: { details_ar: { example: 'أتناول العشاء مع عائلتي وجبة خفيفة ومغذية.' }, details_en: { example: 'I eat a light and nutritious dinner with my family.' } } as any },
  { original_word: 'أصلي', translation: 'Pray', emoji: '🧎🏻', analysis: { details_ar: { example: 'أصلي الصلوات الخمس في أوقاتها المحددة.' }, details_en: { example: 'I pray the five daily prayers at their prescribed times.' } } as any },
  { original_word: 'أنام', translation: 'Sleep', emoji: '🛌', analysis: { details_ar: { example: 'أنام مبكراً لأحصل على قسط كافٍ من الراحة.' }, details_en: { example: 'I go to sleep early to get a sufficient amount of rest.' } } as any },
];

const CLOTHING_DATA: Partial<Vocabulary>[] = [
  { original_word: 'قميص', translation: 'T-shirt', emoji: '👕', analysis: { details_ar: { example: 'أرتدي قميصاً خفيفاً في أيام الصيف الدافئة.' }, details_en: { example: 'I wear a light T-shirt on warm summer days.' } } as any },
  { original_word: 'بلوزة', translation: 'Blouse', emoji: '👚', analysis: { details_ar: { example: 'اشترت أختي بلوزة وردية جميلة.' }, details_en: { example: 'My sister bought a beautiful pink blouse.' } } as any },
  { original_word: 'ربطة عنق', translation: 'Necktie', emoji: '👔', analysis: { details_ar: { example: 'يرتدي الموظف ربطة عنق أنيقة في العمل.' }, details_en: { example: 'The employee wears an elegant necktie at work.' } } as any },
  { original_word: 'بنطال', translation: 'Pants', emoji: '👖', analysis: { details_ar: { example: 'هذا البنطال مريح جداً أثناء الجري والتمارين.' }, details_en: { example: 'These pants are very comfortable during running and exercise.' } } as any },
  { original_word: 'معطف', translation: 'Coat', emoji: '🧥', analysis: { details_ar: { example: 'أرتدي معطفاً ثقيلاً في الأيام الباردة والماطرة.' }, details_en: { example: 'I wear a heavy coat on cold and rainy days.' } } as any },
  { original_word: 'فستان', translation: 'Dress', emoji: '👗', analysis: { details_ar: { example: 'ارتدت الفتاة فستاناً جميلاً لحضور حفل التخرج.' }, details_en: { example: 'The girl wore a beautiful dress to attend the graduation party.' } } as any },
  { original_word: 'شورت', translation: 'Shorts', emoji: '🩳', analysis: { details_ar: { example: 'أرتدي الشورت عندما أذهب للعب على الشاطئ.' }, details_en: { example: 'I wear shorts when I go to play on the beach.' } } as any },
  { original_word: 'وشاح', translation: 'Scarf', emoji: '🧣', analysis: { details_ar: { example: 'أضع الوشاح حول عنقي ليبقى دافئاً في الشتاء.' }, details_en: { example: 'I put the scarf around my neck to keep it warm in winter.' } } as any },
  { original_word: 'قفازات', translation: 'Gloves', emoji: '🧤', analysis: { details_ar: { example: 'أرتدي قفازات صوفية لحماية يدي من البرد الشديد.' }, details_en: { example: 'I wear woolen gloves to protect my hands from the extreme cold.' } } as any },
  { original_word: 'جوارب', translation: 'Socks', emoji: '🧦', analysis: { details_ar: { example: 'أرتدي جوارب قطنية مريحة مع حذائي الرياضي.' }, details_en: { example: 'I wear comfortable cotton socks with my athletic shoes.' } } as any },
  { original_word: 'حذاء', translation: 'Shoe', emoji: '👟', analysis: { details_ar: { example: 'اشتريت حذاءً رياضياً جديداً للمشي اليومي.' }, details_en: { example: 'I bought a new athletic shoe for my daily walk.' } } as any },
  { original_word: 'كعب عالي', translation: 'High heel', emoji: '👠', analysis: { details_ar: { example: 'اختارت الحذاء ذو الكعب العالي ليناسب فستانها.' }, details_en: { example: 'She chose the high heel shoe to match her dress.' } } as any },
  { original_word: 'قبعة', translation: 'Cap', emoji: '🧢', analysis: { details_ar: { example: 'أرتدي قبعة رياضية لحماية رأسي من أشعة الشمس.' }, details_en: { example: 'I wear a sports cap to protect my head from the sun.' } } as any },
  { original_word: 'نظارة شمسية', translation: 'Sunglasses', emoji: '🕶️', analysis: { details_ar: { example: 'أحتاج إلى نظارة شمسية لحماية عيني من وهج الضوء.' }, details_en: { example: 'I need sunglasses to protect my eyes from the glare of light.' } } as any },
  { original_word: 'نظارة طبية', translation: 'Glasses', emoji: '👓', analysis: { details_ar: { example: 'أستخدم النظارة الطبية للقراءة ومتابعة الشاشات.' }, details_en: { example: 'I use reading glasses for reading and watching screens.' } } as any },
  { original_word: 'مظلة', translation: 'Umbrella', emoji: '🌂', analysis: { details_ar: { example: 'أحمل المظلة معي دائماً تحسباً لهطول الأمطار.' }, details_en: { example: 'I always carry an umbrella with me in case it rains.' } } as any },
];

const MONTH_EMOJIS_MAP: Record<string, string> = {
  'يناير': '🌨️',
  'فبراير': '💝',
  'مارس': '🌸',
  'أبريل': '🌷',
  'مايو': '🌿',
  'يونيو': '☀️',
  'يوليو': '🏖️',
  'أغسطس': '🌴',
  'سبتمبر': '🍂',
  'أكتوبر': '🍁',
  'نوفمبر': '🎃',
  'ديسمبر': '🎄',
  'شهر': '📅',
  'شهور': '📆',
  'سنة / عام': '🗓️',
  'سنين / أعوام': '🕰️',
  'سنوات / أعوام': '🕰️'
};

const TOPIC_STORIES: Record<string, { ar: string, en: string }> = {
  about_me: {
    ar: "عِنْدَمَا أَلْتَقِي بِأَحَدٍ أَقُولُ: مرحبًا و أهلاً و صباح الخير أَوْ مساء الخير. أَقُولُ لَهُ أهلاً وسهلاً وَأَسْأَلُهُ: كيف حالك؟ فَيُجِيبُ: أنا بخير. ثُمَّ أَقُولُ: سعيد بلقائك ، ما اسمك؟ فَيَقُولُ: اسمي... وَأَسْأَلُهُ: من أين أنت؟ فَيَرُدُّ: أنا من الإمارات. فِي النِّهَايَةِ أَقُولُ شكرًا، فَيُجِيبُ: على الرحب والسعة ، ثُمَّ أُوَدِّعُهُ: مع السلامة و أراك لاحقًا.",
    en: "When I meet someone I say: Hello, Hi, Good morning or Good evening. I say Welcome and ask: How are you? He answers: I am fine. Then I say: Nice to meet you, What is your name? He says: My name is... and I ask: Where are you from? He replies: I am from the UAE. Finally I say Thank you, he answers: You are welcome, then I bid farewell: Goodbye and See you later."
  },
  family_hobbies: {
    ar: "تَتَكُوَّنُ أسرة السَّعِيدَةِ مِنْ الوالدان ؛ أب و أم ، وَتَضُمُّ ابن و ابنة و أخ و أخت و طفل رضيع. نَزُورُ جد و جدة بِاسْتِمْرَارٍ، وَنَلْتَقِي بِـ عم / خال وَ عمة / خالة وَ ابن العم / ابن الخال. لِكُلِّ زوج و زوجة دَوْرٌ عَظِيمٌ فِي بِنَاءِ العَائِلَةِ.",
    en: "The happy family consists of parents; father and mother, and includes son, daughter, brother, sister, and baby. We visit grandfather and grandmother regularly, and meet uncle, aunt, and cousin. Every husband and wife have a great role in building the family."
  },
  feelings: {
    ar: "أَشْعُرُ بِأَنِّي سعيد و متحمس عِنْدَ النَّجَاحِ، وَأَكُونُ فخور بِنَفْسِي. لَكِنْ قَدْ أَشْعُرُ بِـ حزين أَوْ غاضب أَوْ منزعج عِنْدَ المَشَاكِلِ. عِنْدَمَا أَرَى مُفَاجَأَةً أَكُونُ متفاجئ و مذهول ، وَحِينَ أَكُونُ مريض أَوْ متعب أَحْتَاجُ لِلرَّاحَةِ. قَدْ أَصِيرُ قلق أَوْ متوتر أَوْ حائر أَوْ مُحرج أَوْ وحيد ، لَكِنِّي لاَ أَبْقَى كسول أَبَدًا.",
    en: "I feel happy and excited when succeeding, and I am proud of myself. But I may feel sad, angry, or annoyed during problems. When I see a surprise I am surprised and amazed, and when sick or tired I need rest. I might become worried, nervous, confused, embarrassed, or lonely, but I never stay lazy."
  },
  body_parts: {
    ar: "جِسْمُ الإِنْسَانِ يَتَكُوَّنُ مِنَ الرَّأْسِ وَفِيهِ الشَّعْرُ وَ العَيْنُ وَ الأُذُنُ وَ الأَنْفُ وَ الفَمُ وَ الأَسْنَانُ وَ اللِّسَانُ. يَتَّصِلُ الرَّأْسُ بِـ الرَّقَبَةِ وَ الْكَتِفِ ، وَتَمْتَدُّ الذِّرَاعُ وَ الْيَدُ مَعَ الأَصَابِعِ. كَمَا نَسْتَخْدِمُ الصَّدْرَ وَ البَطْنَ وَ الظَّهْرَ ، وَنَمْشِي عَلَى السَّاقِ وَ القَدَمِ وَ الرُّكْبَةِ.",
    en: "The human body consists of the head containing hair, eye, ear, nose, mouth, teeth, and tongue. The head connects to the neck and shoulder, extending into the arm and hand with fingers. We also use the chest, stomach, and back, and walk on the leg, foot, and knee."
  },
  clothing: {
    ar: "فِي الصَّيْفِ أَرْتَدِي قميص و شورت أَوْ فستان خَفِيفًا، أَمَّا فِي الشِّتَاءِ فَأَلْبَسُ معطف ثَقِيلًا وَ سِتْرَةً وَ وشاح وَ قُفَّازَاتٍ وَ قُبَّعَةً. عِنْدَ الرِّيَاضَةِ أَلْبَسُ بنطال وَ حِذَاءً رِيَاضِيًّا وَ جَوْرَبًا، وَفِي المُنَاسَبَاتِ أَرْتَدِي بلوزة أَوْ ربطة عنق أَوْ تنورة.",
    en: "In summer I wear a t-shirt and shorts or a light dress, while in winter I put on a heavy coat, sweater, scarf, gloves, and hat. When playing sports I wear pants, sneakers, and socks, and for formal events I wear a blouse, necktie, or skirt."
  },
  living: {
    ar: "فِي بَيْتِنَا غرفة النوم بِـ سرير وَ دولاب وَ مرآة ، وَ غرفة المعيشة بِـ أريكة وَ سجادة وَ تلفاز. فِي مطبخ نُعِدُّ الطَّعَامَ عَلَى طاولة ، وَنَسْتَخْدِمُ حمام لِلنَّظَافَةِ. نَفْتَحُ شباك وَ ستارة وَنَخْرُجُ إِلَى شرفة ، وَنَدْخُلُ مِنْ بوابة وَنَصْعَدُ بِـ سلم.",
    en: "In our home, the bedroom has a bed, wardrobe, and mirror, and the living room has a sofa, carpet, and TV. In the kitchen we prepare food on the table, and use the bathroom for hygiene. We open the window and curtain and go out to the balcony, entering through the gate and going up the ladder."
  },
  routine: {
    ar: "يَوْمِي يَبْدَأُ عِنْدَمَا أستيقظ وَ أرتب سريري ، ثُمَّ أستحم وَ أنظف أسناني وَ أرتدي ملابسي. أتناول الإفطار ثُمَّ أذهب إلى المدرسة لِكَيْ أدرس. بَعْدَ ذَلِك أعود للمنزل ، أتناول الغداء ، أمارس الرياضة وَ ألعب ، ثُمَّ أسترخي ، أتناول العشاء ، أصلي وَ أنام.",
    en: "My day starts when I wake up and make my bed, then shower, brush my teeth, and get dressed. I eat breakfast then go to school to study. After that I return home, eat lunch, exercise, play, then relax, eat dinner, pray, and sleep."
  },
  food_drink: {
    ar: "نَتَنَاوَلُ فِي الوَجَبَاتِ أرز مَعَ لحم أَوْ دجاج أَوْ سمك. فِي الصَّبَاحِ نَأْكُلُ بيض مسلوق أَوْ بيض مقلي مَعَ خبز ، وَفِي العَشَاءِ نَسْتَمْتِعُ بِـ نودلز أَوْ بيتزا وَ سلطة وَ بطاطس مقلية. نَشْرَبُ حليب وَ عصير أَوْ شاي وَ قهوة ، وَنَبْتَعِدُ عَنِ مشروب غازي.",
    en: "In meals we eat rice with meat, chicken, or fish. In the morning we eat boiled egg or fried egg with bread, and for dinner we enjoy noodles or pizza with salad and fries. We drink milk, juice, tea, or coffee, and avoid soda."
  },
  fruits: {
    ar: "الْفَوَاكِهُ لَذِيذَةٌ وَصِحِّيَّةٌ! نُحِبُّ أَكْلَ تفاح وَ موز وَ برتقال وَ بطيخ فِي الصَّيْفِ، كَمَا نَسْتَمْتِعُ بِـ عنب وَ فراولة وَ مانجو وَ أناناس. كَمَا نَأْكُلُ خوخ وَ كمثرى وَ كرز وَ كيوى وَ تين وَ رمان وَ تمر.",
    en: "Fruits are delicious and healthy! We love eating apple, banana, orange, and watermelon in summer, and enjoy grapes, strawberry, mango, and pineapple. We also eat peach, pear, cherry, kiwi, fig, pomegranate, and dates."
  },
  vegetables: {
    ar: "الْخَضْرَاوَاتُ تُقَوِّي المَنَاعَةَ! نَضَعُ فِي السَّلَطَةِ طماطم وَ خيار وَ خس وَ جزر وَ فلفل رومي وَ زيتون. فِي الطَّبْخِ نَسْتَخْدِمُ بصل وَ ثوم وَ بطاطس وَ باذنجان وَ قرنبيط وَ عيش الغراب ، وَنُحِبُّ أَيْضًا ذرة وَ بطاطا حلوة وَ شطة وَ ليمون.",
    en: "Vegetables strengthen immunity! In salad we put tomatoes, cucumber, lettuce, carrots, bell pepper, and olives. In cooking we use onions, garlic, potatoes, eggplant, cauliflower, and mushrooms, and we also love corn, sweet potato, chili, and lemon."
  },
  key_phrases: {
    ar: "فِي الفَصْلِ يَسْتَخْدِمُ طالب قلم وَ قلم رصاص وَ قلم ألوان فِي دفتر وَ كتاب. عِنْدَ الخَطَأِ نَسْتَعْمِلُ ممحاة وَ مبراة. يَشْرَحُ معلم عَلَى سبورة وَنَضَعُ الأَغْرَاضَ عَلَى طاولة. يَقُولُ لَنَا المعلم: قف ثُمَّ اجلس ، وَيُشَجِّعُنَا بِكَلِمَاتِ أحسنت وَ رائع. عِنْدَ الحَاجَةِ نَسْأَلُ عَنْ الحمّام.",
    en: "In class the student uses a pen, pencil, and color pencil in notebook and book. When making a mistake we use eraser and sharpener. The teacher explains on the whiteboard and we put items on the table. The teacher tells us: Stand up then Sit down, encouraging us with Well done and Wonderful. When needed we ask for The bathroom."
  },
  survival: {
    ar: "فِي المَدْرَسَةِ نَدْرُسُ اللغة العربية وَ اللغة الإنجليزية وَ اللغة الفرنسية. فِي مَعْمَلِ العلوم نُجْرِي التَّجَارِبَ، وَفِي الرياضيات نَحْسُبُ. نَتَعَلَّمُ القِيَمَ فِي التربية الإسلامية وَ التربية الأخلاقية ، وَنَقْرَأُ فِي دراسات اجتماعية. نَسْتَمْتِعُ بِـ الفن وَ الموسيقى وَ التربية الرياضية وَ الحاسب الآلي ، وَنَقِفُ فِي طابور الصباح لِنُنَشِّدَ النشيد الوطني وَنَسْتَمِعَ لِلـ الإذاعة المدرسية قَبْلَ الاستراحة.",
    en: "At school we study Arabic, English, and French. In Science lab we do experiments, and in Mathematics we calculate. We learn values in Islamic Education and Moral Education, and read in Social Studies. We enjoy Art, Music, PE, and Computer Studies, standing in Morning Assembly to recite the National Anthem and listen to School Broadcast before Break."
  },
  time: {
    ar: "مَعْرِفَةُ الوَقْتِ مُهِمَّةٌ! نَسْتَخْدِمُ الساعة لِنَعْرِفَ الوقت. هَلْ هِيَ الساعة الواحدة أَوْ الثانية أَوْ الثالثة أَوْ الرابعة أَوْ الخامسة أَوْ السادسة أَوْ السابعة أَوْ الثامنة أَوْ التاسعة أَوْ العاشرة أَوْ الحادية عشرة أَوْ الثانية عشرة؟ كَمَا نُمَيِّزُ عِنْدَمَا تَكُونُ تماماً أَوْ والنصف أَوْ والربع أَوْ إلا ربعاً.",
    en: "Knowing time is important! We use the clock to know the time. Is it 1 o'clock, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, or 12 o'clock? We also distinguish when it is sharp/exactly, half past, quarter past, or quarter to."
  },
  weather: {
    ar: "تَتَكُوَّنُ السَّنَةُ مِنْ فصول : الربيع وَ الصيف وَ الخريف وَ الشتاء. يَكُونُ الجَوُّ حار فِي الصَّيْفِ وَ بارد أَوْ ممطر فِي الشِّتَاءِ كَمَا يَنْزِلُ ثلج. فِي الرَّبِيعِ يَكُونُ معتدل ، وَقَدْ يَكُونُ عاصف أَوْ غائم أَوْ ضبابي أَوْ رطب. أنا أفضل الجَوَّ الجَمِيلَ.",
    en: "The year consists of seasons: Spring, Summer, Autumn, and Winter. Weather is hot in summer, cold or rainy in winter with snow falling. In spring it is mild climate, and it can be windy, cloudy, foggy, or wet. I prefer beautiful weather."
  },
  instructions: {
    ar: "تَتَكُوَّنُ سنة / عام مِنْ اثْنَيْ عَشَرَ شهر : يناير ، فبراير ، مارس ، أبريل ، مايو ، يونيو ، يوليو ، أغسطس ، سبتمبر ، أكتوبر ، نوفمبر ، وَ ديسمبر. تَمُرُّ شهور وَ سنين / أعوام وَنَحْنُ نَتَعَلَّمُ وَنَنْمُو.",
    en: "A year consists of twelve months: January, February, March, April, May, June, July, August, September, October, November, and December. Months and years pass as we learn and grow."
  },
  colours: {
    ar: "عَالَمُنَا ملون وَجَمِيلٌ! هذا اللون ... مِثْلُ أحمر ، برتقالي ، أصفر ، أخضر ، أزرق ، بنفسجي ، وردي ، وَ أزرق فاتح. كَمَا نَجِدُ أسود ، أبيض ، بني ، وَ رمادي. بَعْضُ الأَلْوَانِ فاتح وَبَعْضُهَا غامق.",
    en: "Our world is colorful and beautiful! This color is... like red, orange, yellow, green, blue, purple, pink, and light blue. We also find black, white, brown, and grey. Some colors are light and some are dark."
  },
  animals: {
    ar: "نَرَى فِي المَزْرَعَةِ قطة وَ كلب وَ أرنب وَ حصان وَ حمار وَ بقرة وَ خروف وَ ماعز. وَفِي الغَابَةِ وَالصَّحْرَاءِ نَجِدُ أسد وَ نمر وَ فيل وَ زرافة وَ قرد وَ دب وَ جمل وَ غزال.",
    en: "On the farm we see cat, dog, rabbit, horse, donkey, cow, sheep, and goat. In the forest and desert we find lion, tiger, elephant, giraffe, monkey, bear, camel, and deer."
  },
  birds: {
    ar: "تُحَلِّقُ الطُّيُورُ! نَشُودُ عصفور وَ حمامة وَ ببغاء وَ يمامة ، وَنَرَى دجاجة وَ ديك وَ بطة وَ إوَّزة. كَمَا نَجِدُ نسر وَ صقر وَ بومة وَ نعامة وَ بطريق وَ طاووس وَ بجعة.",
    en: "Birds fly! We listen to sparrow, pigeon, parrot, and dove, seeing hen, rooster, duck, and goose. We also find eagle, falcon, owl, ostrich, penguin, peacock, and swan."
  },
  fish_creatures: {
    ar: "تَعِيشُ الكَائِنَاتُ فِي البَحْرِ! نَجِدُ سمك وَ قنديل البحر وَ نجم البحر وَ سلحفاة وَ سرطان. كَمَا نَرَى دلفين وَ حوت وَ قرش وَ أخطبوط وَ سبع البحر وَ حصان البحر وَ تمساح.",
    en: "Sea creatures live in the ocean! We find fish, jellyfish, starfish, turtle, and crab. We also see dolphin, whale, shark, octopus, sea lion, seahorse, and crocodile."
  },
  insects_reptiles: {
    ar: "فِي الطَّبِيعَةِ نَجِدُ حشرات وَ زواحف: فراشة ، نحلة ، نملة ، ذبابة ، بعوضة ، دعسوقة ، صرصور ، وَ عنكبوت. كَمَا نَجِدُ ثعبان ، سلحفاة ، تمساح ، حرباء ، وَ ضفدع.",
    en: "In nature we find insects and reptiles: butterfly, bee, ant, fly, mosquito, ladybug, cockroach, and spider. We also find snake, turtle, crocodile, chameleon, and frog."
  },
  places: {
    ar: "فِي المَدِينَةِ نَزُورُ مدرسة وَ مستشفى وَ مطعم وَ فندق وَ صيدلية وَ مطار. نَتَسَوَّقُ فِي محل وَ سوبر ماركت ، وَنَسْتَمْتِعُ فِي مسرح وَ سينما وَ سيرك وَ شاطئ وَ مدينة ألعاب وَ استاد وَ حديقة حيوان وَ متحف.",
    en: "In the city we visit school, hospital, restaurant, hotel, pharmacy, and airport. We shop in shop and supermarket, enjoying theatre, cinema, circus, beach, amusement park, stadium, zoo, and museum."
  },
  sports: {
    ar: "الرِّيَاضَةُ مُمْتِعَةٌ! نَلْعَبُ كرة قدم وَ كرة سلة وَ بيسبول وَ تنس وَ كرة طائرة وَ تنس طاولة وَ ريشة طائرة. كَمَا نُمَارِسُ ملاكمة وَ مصارعة وَ رفع أثقال وَ دراجات وَ سباحة وَ تزلج وَ سباق الخيل وَ جمباز وَ تسلق.",
    en: "Sports are fun! We play football, basketball, baseball, tennis, volleyball, table tennis, and badminton. We also practice boxing, wrestling, weightlifting, cycling, swimming, skiing, horse racing, gymnastics, and climbing."
  },
  transport: {
    ar: "تَتَنَوَّعُ وَسَائِلُ النَّقْلِ: فِي الشَّارِعِ نَرَى سيارة وَ سيارة أجرة وَ حافلة وَ شاحنة وَ دراجة وَ سكوتر. نَجِدُ سيارة شرطة وَ سيارة إسعاف وَ سيارة إطفاء. وَلِلْمَسَافَاتِ البَعِيدَةِ نَسْتَخْدِمُ قطار وَ مترو وَ تلفريك وَ سفينة وَ طائرة وَ قارب شراعي.",
    en: "Means of transport vary: on the street we see car, taxi, bus, truck, bicycle, and scooter. We find police car, ambulance, and fire engine. For long distances we use train, metro, cableway, ship, airplane, and sailboat."
  },
  jobs: {
    ar: "تَتَنَوَّعُ المِهَنُ: نَجِدُ طبيب وَ ممرضة لِعِلَاجِ المَرْضَى، وَ معلم لِلتَّعْلِيمِ. يَعْمَلُ مهندس وَ نجار وَ رسام / دهان ، وَفِي الأَمْنِ شرطي وَ إطفائي. نَجِدُ مزارع وَ طباخ وَ سائق وَ طيار وَ رجل أعمال وَ عالم وَ قاضي وَ مصور.",
    en: "Jobs vary: we find doctor and nurse for treating patients, and teacher for teaching. Engineer, carpenter, and painter work in construction, and police and firefighter in security. We find farmer, chef, driver, pilot, businessman, scientist, judge, and photographer."
  },
  shopping: {
    ar: "فِي مول نَأْخُذُ عربة تسوق أَوْ سلة تسوق وَنَضَعُ البَضَائِعَ فِي أكياس تسوق أَوْ صندوق. نَسْتَفِيدُ مِنْ تخفيضات وَنَسْأَلُ موظف المبيعات ، أَوْ نَقُومُ بِـ تسوق إلكتروني. نَدْفَعُ بِـ نقود أَوْ بطاقة دفع وَنَأْخُذُ إيصال ، ثُمَّ نَمُرُّ مِنْ مدخل لِنَصْعَدَ بِـ مصعد وَنَصِلَ إِلَى موقف سيارات.",
    en: "In mall we take shopping cart or shopping basket and put goods in shopping bags or box. We benefit from discount and ask sales assistant, or do online shopping. We pay in cash or payment card and take receipt, passing entrance to ride elevator to parking."
  },
  health: {
    ar: "لِلْمُحَافَظَةِ عَلَى الصِّحَّةِ، يَصِفُ الطَّبِيبُ دواء أَوْ إبرة وَيَسْتَخْدِمُ سماعة طبيب وَ ميزان حرارة. نَضَعُ لاصق طبي وَنَسْتَخْدِمُ معقم لِقَتْلِ جرثومة. نَهْتَمُّ بِـ قلب وَ رئتان وَ دماغ وَ عظم وَ سن ، وَعِنْدَ الطَّوَارِئِ نَتَّصِلُ بِـ إسعاف.",
    en: "To maintain health, doctor prescribes medicine or injection, using stethoscope and thermometer. We place bandage and use sanitizer to kill germ. We care for heart, lungs, brain, bone, and tooth, calling ambulance in emergency."
  },
  tech: {
    ar: "التَّكْنُولُوجْيَا هَامَّةٌ! نَسْتَخْدِمُ هاتف ذكي وَ حاسوب وَ لابتوب مَعَ لوحة مفاتيح وَ فأرة وَ طابعة. نَتَّصِلُ بِـ واي فاي لِنَقْلِ إشارة ، وَنَحْتَاجُ شاحن لِشَحْنِ بطارية. نَضْبِطُ إعدادات وَنَسْتَفِيدُ مِنْ ذكاء اصطناعي.",
    en: "Technology is important! We use smartphone, computer, and laptop with keyboard, mouse, and printer. We connect to Wi-Fi for signal, needing charger to charge battery. We adjust settings and benefit from Artificial Intelligence."
  },
  nature: {
    ar: "الطَّبِيعَةُ سَاحِرَةٌ! نَرَى شجرة وَ نخلة وَ صبار وَ نبات وَ ورقة شجر وَ قمح وَ زهرة وَ دوّار الشمس. نَتَسَلَّقُ جبل وَ تلة وَنُشَاهِدُ جبل بركاني وَ وادٍ / طبيعة وَ جزيرة وَ بحر وَ شاطئ.",
    en: "Nature is magical! We see tree, palm tree, cactus, plant, leaf, wheat, flower, and sunflower. We climb mountain and hill, viewing volcano, landscape, island, sea, and beach."
  },
  music: {
    ar: "المُوسِيقَى جَمِيلَةٌ! نَعْزِفُ عَلَى بيانو وَ غيتار وَ كمان وَ طبول وَ ساكسفون وَ ترومبيت وَ أكورديون وَ ناي. نَقْرَأُ نوتة موسيقية وَنَسْتَخْدِمُ ميكروفون وَ مكبر صوت لِنَشْرِ الأَلْحَانِ.",
    en: "Music is beautiful! We play piano, guitar, violin, drums, saxophone, trumpet, accordion, and flute. We read music notes and use microphone and speaker to spread tunes."
  },
  travel: {
    ar: "عِنْدَ السَّفَرِ نَحْجِزُ تذكرة وَنَحْمِلُ جواز سفر وَ حقيبة سفر أَوْ حقيبة ظهر. فِي المَطَارِ نَمُرُّ عَبْرَ الجمارك وَ أمتعة لِنَصْعَدَ إِلَى طائرة وَنَجْلِسَ فِي مقعد الطائرة. يَقُودُ طيار بِمُسَاعَدَةِ مضيفة طيران عِنْدَ إقلاع وَ هبوط.",
    en: "When traveling we book ticket and carry passport and suitcase or backpack. At airport we pass customs and baggage to board airplane and sit in seat. Pilot flies with flight attendant's help during departure and arrival."
  }
};

const renderInteractiveStory = (
  text: string, 
  vocabWords: Partial<Vocabulary>[], 
  onSelectWord: (word: Partial<Vocabulary>) => void,
  selectedWord: Partial<Vocabulary> | null
) => {
  if (!text) return text;

  const vocabMap = new Map<string, Partial<Vocabulary>>();

  vocabWords.forEach(w => {
    if (w.original_word) {
      vocabMap.set(w.original_word.toLowerCase(), w);
      if (w.original_word.includes('/')) {
        w.original_word.split('/').forEach(part => {
          vocabMap.set(part.trim().toLowerCase(), w);
        });
      }
    }
  });

  const sortedKeys = Array.from(vocabMap.keys()).sort((a, b) => b.length - a.length);
  if (sortedKeys.length === 0) return text;

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(${sortedKeys.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) => {
        const lowerPart = part.toLowerCase();
        const matchedVocab = vocabMap.get(lowerPart);
        if (matchedVocab) {
          const isSelected = selectedWord && (
            selectedWord.original_word?.toLowerCase() === matchedVocab.original_word?.toLowerCase() ||
            selectedWord.original_word?.toLowerCase().includes(lowerPart)
          );

          return (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                onSelectWord(matchedVocab);
              }}
              className={`cursor-pointer transition-all duration-150 inline-block px-1 py-0.5 my-0.5 mx-0.5 rounded-md font-bold ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-xs scale-105'
                  : 'text-amber-950 hover:text-amber-700 hover:bg-amber-100/60'
              }`}
              title="اضغط لكشف الترجمة والنطق"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

const TopicStoryBox: React.FC<{
  topicId: string,
  topicAr: string,
  topicEn: string,
  words: Partial<Vocabulary>[],
  lang: 'ar' | 'en',
  onSpeak: (text: string, lang: 'ar' | 'en') => void
}> = ({ topicId, topicAr, topicEn, words, lang, onSpeak }) => {
  const [showEnglish, setShowEnglish] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [selectedWord, setSelectedWord] = React.useState<Partial<Vocabulary> | null>(null);

  const storyObj = TOPIC_STORIES[topicId];
  const storyTextAr = storyObj ? storyObj.ar : `فِي مَوْضُوعِ ${topicAr}، نَتَعَرَّفُ عَلَى المَفْرَدَاتِ التَّالِيَةِ فِي سِيَاقٍ مُتَكَامِلٍ: ${words.map(w => w.original_word).filter(Boolean).join('، ')}.`;
  const storyTextEn = storyObj ? storyObj.en : `In the topic ${topicEn}, we learn the following vocabulary in context: ${words.map(w => w.translation).filter(Boolean).join(', ')}.`;

  const currentText = showEnglish ? storyTextEn : storyTextAr;
  const speakLang = showEnglish ? 'en' : 'ar';

  const handleSpeak = () => {
    setIsPlaying(true);
    onSpeak(currentText, speakLang);
    setTimeout(() => setIsPlaying(false), 6000);
  };

  return (
    <div 
      onClick={() => setSelectedWord(null)}
      className="w-full mb-6 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-2xs relative text-right transition-all"
    >
      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-200/60">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold arabic-font">
          <BookOpen size={15} className="text-amber-600" />
          <span className="text-slate-600">{lang === 'ar' ? 'النص السياقي' : 'Context Paragraph'}</span>
          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline-block">
            {lang === 'ar' ? '(💡 اضغط على أي كلمة مفتاحية لكشف معناها)' : '(💡 Tap any key word to reveal meaning)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEnglish(!showEnglish);
              setSelectedWord(null);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white text-slate-700 hover:bg-slate-100 rounded-lg text-[10px] font-bold border border-slate-200 shadow-2xs transition-all active:scale-95"
            title={showEnglish ? "عرض النص العربي" : "Show English Translation"}
          >
            <Languages size={12} className="text-amber-600" />
            <span>{showEnglish ? 'العربية' : 'English'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSpeak();
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold shadow-2xs transition-all active:scale-95 ${
              isPlaying 
                ? 'bg-amber-600 text-white animate-pulse' 
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            <Volume2 size={13} />
            <span>{lang === 'ar' ? 'استمع' : 'Listen'}</span>
          </button>
        </div>
      </div>

      <div className="relative text-slate-800 text-xs md:text-sm leading-relaxed md:leading-loose font-medium arabic-font">
        {showEnglish ? (
          <p className="font-sans text-xs md:text-sm text-slate-700 leading-relaxed text-left dir-ltr">
            {storyTextEn}
          </p>
        ) : (
          <p className="arabic-font text-xs md:text-sm text-slate-800 leading-loose text-justify dir-rtl">
            {renderInteractiveStory(storyTextAr, words, (w) => setSelectedWord(w), selectedWord)}
          </p>
        )}
      </div>

      {/* Lightbulb-Style Floating Pop-up Card */}
      <AnimatePresence>
        {selectedWord && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-12 left-3 sm:left-6 z-[100] p-3 bg-white border border-amber-100 rounded-2xl shadow-xl text-right pointer-events-auto"
          >
            {/* Arrow Pointer Tab */}
            <div className="absolute -top-2 left-6 w-3.5 h-3.5 bg-white border-t border-l border-amber-100 rotate-45" />

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                  {(selectedWord as any).emoji || MONTH_EMOJIS_MAP[selectedWord.original_word || ''] || '💡'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h5 className="font-black text-slate-900 text-sm md:text-base arabic-font leading-none">
                      {selectedWord.original_word}
                    </h5>
                    {(selectedWord as any).phonetic && (
                      <span className="text-[9px] text-amber-800/80 font-mono bg-amber-50 px-1 py-0.5 rounded border border-amber-100">
                        [{(selectedWord as any).phonetic}]
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-amber-700 font-sans mt-0.5 leading-none">
                    {selectedWord.translation}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onSpeak(selectedWord.original_word || '', 'ar')}
                  className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition-all shadow-2xs active:scale-95"
                  title="استمع للكلمة"
                >
                  <Volume2 size={15} />
                </button>

                <button
                  onClick={() => setSelectedWord(null)}
                  className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-100 flex items-center justify-center transition-all active:scale-95"
                  title="إغلاق"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WorksheetContent: React.FC<{
  topic: any;
  words: Partial<Vocabulary>[];
  worksheetRef?: React.RefObject<HTMLDivElement>;
  isPreview?: boolean;
}> = ({ topic, words, worksheetRef, isPreview = false }) => {
  const validWords = React.useMemo(() => {
    return words.filter(w => w.original_word && w.original_word.trim().length > 0);
  }, [words]);

  // Q1: Matching words to emojis/pictures (5 words)
  const q1Words = React.useMemo(() => {
    const subset = validWords.slice(0, 5);
    const emojis = subset.map((w, idx) => ({
      emoji: w.emoji || '✨',
      translation: w.translation || '',
      id: idx
    }));
    const shuffledEmojis = [...emojis].reverse();
    return { subset, shuffledEmojis };
  }, [validWords]);

  // Q2: Sentences (5 words)
  const q2Words = React.useMemo(() => {
    return validWords.slice(5, 10);
  }, [validWords]);

  // Q3: Paragraph word bank (6 words)
  const q3Bank = React.useMemo(() => {
    return validWords.slice(10, 16);
  }, [validWords]);

  return (
    <div
      ref={worksheetRef}
      className={`w-full ${isPreview ? 'max-w-[540px] p-3 sm:p-4 text-[10px]' : 'w-[800px] min-h-[1130px] p-8 text-slate-900 flex flex-col justify-between'} bg-white arabic-font shadow-none mx-auto text-right`}
      dir="rtl"
    >
      {/* Container for content */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Top Section */}
        <div>
          {/* Header */}
          <div className={`border-b-2 border-slate-900 ${isPreview ? 'pb-1 mb-1.5' : 'pb-3 mb-3'} flex justify-between items-center`}>
            <div className="w-1/3 text-right">
              <h1 className={`${isPreview ? 'text-xs font-bold' : 'text-lg font-black'} leading-tight`}>{topic?.ar || 'الموضوع'}</h1>
              <p className={`text-slate-400 ${isPreview ? 'text-[8px]' : 'text-[10px]'} uppercase font-bold font-sans tracking-wide`}>{topic?.en || 'Vocabulary Lesson'}</p>
            </div>
            <div className="w-1/3 text-center">
              <span className={isPreview ? 'text-lg' : 'text-2xl'}>{topic?.icon || '📝'}</span>
              <h2 className={`${isPreview ? 'text-[11px] font-black' : 'text-base font-black'} leading-tight mt-0.5`}>ورقة عمل المفردات</h2>
            </div>
            <div className="w-1/3 text-left">
              <div className={`${isPreview ? 'text-xs font-black' : 'text-lg font-black'} tracking-tighter text-slate-900 mb-0.5 leading-tight`} dir="ltr">
                QUL / قُل
              </div>
              <div className={`${isPreview ? 'text-[7px]' : 'text-[9px]'} font-bold text-slate-400 uppercase tracking-widest font-sans`}>Interactive Learning</div>
            </div>
          </div>

          {/* Student Info Bar */}
          <div className={`flex gap-3 sm:gap-6 ${isPreview ? 'mb-1.5 pb-1 text-[9px]' : 'mb-3 pb-2 text-xs'} border-b border-slate-200`}>
            <div className="flex-1 flex items-center gap-2">
              <span className="font-bold text-slate-500">اسم الطالب:</span>
              <div className={`flex-1 border-b border-slate-300 ${isPreview ? 'h-3' : 'h-4'}`}></div>
            </div>
            <div className="w-1/4 flex items-center gap-2">
              <span className="font-bold text-slate-500">الصف:</span>
              <div className={`flex-1 border-b border-slate-300 ${isPreview ? 'h-3' : 'h-4'}`}></div>
            </div>
            <div className="w-1/4 flex items-center gap-2">
              <span className="font-bold text-slate-500">التاريخ:</span>
              <div className={`flex-1 border-b border-slate-300 ${isPreview ? 'h-3' : 'h-4'} ${isPreview ? 'text-[9px]' : 'text-xs'} font-sans flex items-end`}>
                {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

          {/* Question 1: Match word to picture */}
          <div className={isPreview ? 'mb-1.5' : 'mb-3.5'}>
            <div className={`bg-slate-100 ${isPreview ? 'p-0.5 px-1 mb-1' : 'p-1.5 px-2.5 mb-2'} rounded-lg border-r-4 border-slate-900 flex justify-between items-center`}>
              <h3 className={`${isPreview ? 'text-[10px]' : 'text-xs sm:text-sm'} font-bold text-slate-800`}>السؤال الأول: صل الكلمة بالصورة المناسبة</h3>
              <span className={`${isPreview ? 'text-[7px]' : 'text-[9px]'} font-bold text-slate-400 uppercase tracking-wider font-sans`} dir="ltr">Level 1: Match Word to Picture</span>
            </div>
            <div className={`border border-slate-200 rounded-xl ${isPreview ? 'p-1.5' : 'p-3'} bg-slate-50/50`}>
              <div className={`grid grid-cols-2 ${isPreview ? 'gap-x-4 gap-y-1' : 'gap-x-8 gap-y-2'}`}>
                {q1Words.subset.map((item, idx) => {
                  const rightEmoji = q1Words.shuffledEmojis[idx];
                  return (
                    <React.Fragment key={idx}>
                      <div className={`flex items-center justify-between bg-white ${isPreview ? 'px-2 py-0.5' : 'px-3 py-1.5'} rounded-lg border border-slate-200 shadow-2xs`}>
                        <span className={`${isPreview ? 'text-[10px]' : 'text-xs'} font-bold text-slate-800`}>
                          {idx + 1}. {item.original_word}
                        </span>
                        <span className={`${isPreview ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full bg-amber-500 inline-block border border-amber-600`}></span>
                      </div>
                      <div className={`flex items-center justify-between bg-white ${isPreview ? 'px-2 py-0.5' : 'px-3 py-1.5'} rounded-lg border border-slate-200 shadow-2xs`}>
                        <span className={`${isPreview ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full bg-amber-500 inline-block border border-amber-600`}></span>
                        <div className="flex items-center gap-1.5">
                          <span className={isPreview ? 'text-xs' : 'text-base'}>{rightEmoji?.emoji}</span>
                          <span className={`${isPreview ? 'text-[8px]' : 'text-xs'} font-sans text-slate-500 font-bold`}>({rightEmoji?.translation})</span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Question 2: Form Sentences */}
          <div className={isPreview ? 'mb-1.5' : 'mb-3.5'}>
            <div className={`bg-slate-100 ${isPreview ? 'p-0.5 px-1 mb-1' : 'p-1.5 px-2.5 mb-2'} rounded-lg border-r-4 border-slate-900 flex justify-between items-center`}>
              <h3 className={`${isPreview ? 'text-[10px]' : 'text-xs sm:text-sm'} font-bold text-slate-800`}>السؤال الثاني: ضع الكلمات في جمل من تعبيرك</h3>
              <span className={`${isPreview ? 'text-[7px]' : 'text-[9px]'} font-bold text-slate-400 uppercase tracking-wider font-sans`} dir="ltr">Level 2: Form Sentences</span>
            </div>
            <div className={isPreview ? 'space-y-1' : 'space-y-2'}>
              {q2Words.map((item, idx) => (
                <div key={idx} className={`border border-slate-200 rounded-lg ${isPreview ? 'p-1' : 'p-2'} bg-white`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`font-black ${isPreview ? 'text-[10px]' : 'text-xs'} text-amber-900 bg-amber-100 px-2 py-0.5 rounded`}>
                      {idx + 1}) {item.original_word} ({item.translation}):
                    </span>
                  </div>
                  <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3' : 'h-5'}`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Question 3: Write Paragraph */}
          <div>
            <div className={`bg-slate-100 ${isPreview ? 'p-0.5 px-1 mb-1' : 'p-1.5 px-2.5 mb-2'} rounded-lg border-r-4 border-slate-900 flex justify-between items-center`}>
              <h3 className={`${isPreview ? 'text-[10px]' : 'text-xs sm:text-sm'} font-bold text-slate-800`}>السؤال الثالث: ضع المفردات الآتية في فقرة من تعبيرك</h3>
              <span className={`${isPreview ? 'text-[7px]' : 'text-[9px]'} font-bold text-slate-400 uppercase tracking-wider font-sans`} dir="ltr">Use vocabulary in paragraph</span>
            </div>
            <div className={`border border-slate-200 rounded-lg ${isPreview ? 'p-1.5' : 'p-2.5'} bg-white`}>
              <div className={`mb-1.5 bg-amber-50/80 border border-amber-200 ${isPreview ? 'p-1' : 'p-2'} rounded-lg ${isPreview ? 'text-[10px]' : 'text-xs'}`}>
                <span className="font-black text-amber-950">بنك المفردات: </span>
                <span className="font-bold text-amber-800">
                  [ {q3Bank.map(w => w.original_word).join('  •  ')} ]
                </span>
                <p className={`${isPreview ? 'text-[8px]' : 'text-[10px]'} text-slate-500 font-bold mt-0.5`}>
                  * اكتب فقرة قصيرة موظفاً المفردات أعلاه:
                </p>
              </div>
              <div className={`space-y-2 ${isPreview ? 'pt-0' : 'pt-1'}`}>
                <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3' : 'h-5'}`}></div>
                <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3' : 'h-5'}`}></div>
                <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3' : 'h-5'}`}></div>
                <div className={`w-full border-b border-slate-300 border-dashed ${isPreview ? 'h-3' : 'h-5'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Worksheet Footer */}
        <div className={`${isPreview ? 'mt-1.5 pt-1 text-[7px]' : 'mt-4 pt-2 text-xs'} border-t border-slate-200 flex justify-between items-center text-slate-400 font-bold`}>
          <span>منصة قُل التعليمية - أوراق عمل المفردات التفاعلية</span>
          <span>صفحة ١ من ١</span>
        </div>
      </div>
    </div>
  );
};

const TopicWorksheet: React.FC<{
  topic: any;
  words: Partial<Vocabulary>[];
  worksheetRef: React.RefObject<HTMLDivElement>;
}> = ({ topic, words, worksheetRef }) => {
  return (
    <div className="fixed top-0 left-0 -z-50 pointer-events-none opacity-0 overflow-hidden w-[800px] bg-white">
      <WorksheetContent topic={topic} words={words} worksheetRef={worksheetRef} isPreview={false} />
    </div>
  );
};

const WorksheetPreviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  topic: any;
  words: Partial<Vocabulary>[];
  onDownload: () => void;
  isGenerating: boolean;
}> = ({ isOpen, onClose, topic, words, onDownload, isGenerating }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 overflow-y-auto cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-100 rounded-2xl max-w-2xl w-full max-h-[96vh] my-auto flex flex-col overflow-hidden shadow-2xl border border-slate-300/80 cursor-default"
        >
          {/* Modal Header */}
          <div className="bg-white px-4 py-2.5 md:px-5 md:py-3 border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-black text-slate-800 arabic-font">معاينة ورقة عمل: {topic?.ar}</h3>
                <p className="text-[10px] text-slate-400 font-bold arabic-font">ورقة عمل تفاعلية للطباعة والتنزيل</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
              title="إغلاق"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body - Whole Sheet Displayed Directly */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-slate-200/90 flex items-center justify-center custom-scroll min-h-0">
            <div className="relative bg-white shadow-xl rounded-xl overflow-hidden w-full max-w-[500px] border border-slate-300 p-0.5">
              <WorksheetContent topic={topic} words={words} isPreview={true} />

              {/* Simple Download Button at Bottom-Left of the Preview Worksheet */}
              <button
                onClick={onDownload}
                disabled={isGenerating}
                className="absolute bottom-2.5 left-2.5 w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 border border-white/50"
                title="تحميل PDF"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const TopicInterface: React.FC<{ 
  topic: any, 
  lang: 'ar' | 'en', 
  words: Partial<Vocabulary>[],
  onBack: () => void, 
  onSpeak: (text: string, lang: 'ar' | 'en') => void,
  onAction: (word: Partial<Vocabulary>, status: 'know' | 'learn' | 'ignore') => void,
  showHint: boolean,
  setShowHint: (val: boolean) => void,
  currentHint: string
}> = ({ topic, lang, words, onBack, onSpeak, onAction, showHint, setShowHint, currentHint }) => {
  const [flippedIndex, setFlippedIndex] = React.useState<number | null>(null);
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = React.useState(false);
  const [showWorksheetPreview, setShowWorksheetPreview] = React.useState(false);
  const worksheetRef = React.useRef<HTMLDivElement>(null);

  const generateWorksheet = async () => {
    if (!worksheetRef.current) return;
    setIsGeneratingWorksheet(true);
    try {
      const canvas = await html2canvas(worksheetRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      let printWidth = pdfPageWidth;
      let printHeight = (imgProps.height * pdfPageWidth) / imgProps.width;

      if (printHeight > pdfPageHeight) {
        printHeight = pdfPageHeight;
        printWidth = (imgProps.width * printHeight) / imgProps.height;
      }

      const xOffset = Math.max(0, (pdfPageWidth - printWidth) / 2);
      const yOffset = Math.max(0, (pdfPageHeight - printHeight) / 2);

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, printWidth, printHeight);
      let topicName = 'Lesson';
      if (topic && typeof topic.en === 'string' && topic.en.trim().length > 0) {
        topicName = topic.en.trim().replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
      } else if (topic && typeof topic.ar === 'string' && topic.ar.trim().length > 0) {
        topicName = topic.ar.trim().replace(/\s+/g, '_');
      }
      pdf.save(`Qul_Vocab_${topicName || 'Lesson'}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGeneratingWorksheet(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 select-none" style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}>
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-lg border border-slate-100 relative max-h-[88vh] w-full flex flex-col shrink-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 z-20 pointer-events-none" />
        
        <div className="p-6 md:p-8 lg:p-10 overflow-y-auto custom-scroll w-full flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6 relative z-50 px-1">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-400 transition-all border border-slate-50 shadow-sm active:scale-95">
             {lang === 'ar' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 arabic-font leading-relaxed pt-1">{lang === 'ar' ? topic.ar : topic.en}</h2>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{lang === 'ar' ? topic.en : topic.ar}</p>
          </div>
          <div className="flex items-center gap-2 relative">
             <button
                onClick={() => setShowWorksheetPreview(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
                title={lang === 'ar' ? 'معاينة ورقة العمل' : 'Preview Worksheet'}
             >
                <FileText size={15} />
                <span className="arabic-font">
                  {lang === 'ar' ? 'معاينة ورقة العمل' : 'Worksheet Preview'}
                </span>
             </button>

             <button 
                onClick={() => setShowHint(!showHint)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all border shadow-sm active:scale-95 ${showHint ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-white border-slate-50 text-slate-400 hover:bg-slate-50'}`}
             >
                <Lightbulb size={16} />
             </button>
             <AnimatePresence>
                {showHint && (
                    <motion.div 
                      initial={{ opacity: 0, x: lang === 'ar' ? 10 : -10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: lang === 'ar' ? 10 : -10, scale: 0.95 }}
                      className={`absolute top-1/2 -translate-y-1/2 -mt-[35px] ${lang === 'ar' ? 'left-full ml-4' : 'right-full mr-4'} w-64 p-4 bg-white border border-amber-100 rounded-2xl shadow-2xl z-[100] ${lang === 'ar' ? 'text-right' : 'text-left'} pointer-events-auto`}
                    >
                      <div className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? '-left-2' : '-right-2'} w-4 h-4 bg-white border-t ${lang === 'ar' ? 'border-l' : 'border-r'} border-amber-100 ${lang === 'ar' ? '-rotate-45' : 'rotate-45'}`} />
                      <p className={`text-[11px] font-medium ${lang === 'ar' ? 'arabic-font' : 'font-sans'} text-slate-700 leading-relaxed`}>
                        {currentHint}
                      </p>
                    </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>

        {/* Topic Story Box combining vocabulary in context */}
        <TopicStoryBox 
          topicId={topic.id || ''}
          topicAr={topic.ar || ''}
          topicEn={topic.en || ''}
          words={words}
          lang={lang}
          onSpeak={onSpeak}
        />

        <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5 md:gap-3.5 relative z-10">
           {words.map((f, i) => (
             <div key={i} className="perspective-1000 h-[130px] md:h-[150px]">
               <motion.div
                 className="relative w-full h-full text-center transition-all duration-500 transform-style-3d cursor-pointer"
                 animate={{ rotateY: flippedIndex === i ? 180 : 0 }}
                 onClick={() => setFlippedIndex(flippedIndex === i ? null : i)}
               >
                 {/* FRONT SIDE */}
                 <div className="absolute inset-0 backface-hidden bg-slate-50 rounded-2xl border border-slate-100 p-2 flex flex-col items-center justify-center shadow-sm hover:border-amber-400 transition-all overflow-hidden">
                   {topic && (topic.id === 'instructions' || topic.en === 'MONTHS' || topic.ar === 'الشهور') && (
                     <div className="absolute top-2 left-2.5 text-[18px] md:text-[21px] select-none pointer-events-none z-30">
                       {MONTH_EMOJIS_MAP[f.original_word || '']}
                     </div>
                   )}
                   {topic && (topic.id === 'instructions' || topic.en === 'MONTHS' || topic.ar === 'الشهور') && (
                     <div className="flex-1 flex items-center justify-center w-full min-h-0">
                       <span className={`${
                         f.original_word === 'سنين / أعوام' ? 'text-[13px] md:text-[15px]' :
                         f.original_word === 'سنة / عام' ? 'text-[16px] md:text-[18px]' :
                         'text-[19px] md:text-[22px]'
                       } font-aref text-teal-600 font-bold select-none text-center px-1 whitespace-nowrap`}>
                         {f.original_word}
                       </span>
                     </div>
                   )}
                   <div className={`${topic && (topic.id === 'instructions' || topic.en === 'MONTHS' || topic.ar === 'الشهور') ? 'hidden' : ''} ${f.original_word === 'صيدلية' ? 'text-2xl md:text-3xl' : 'text-4xl md:text-5xl'} mb-1.5 group-hover:scale-110 transition-transform ${f.original_word === 'والنصف' ? 'bg-amber-100 rounded-full p-2 border-2 border-amber-300 shadow-inner scale-110' : ''}`}>
                     {f.original_word === 'يوليو' || f.original_word === 'أغسطس' ? (
                       <div className="relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center mx-auto overflow-visible select-none">
                         <motion.span 
                           className="absolute -top-1.5 -left-1.5 text-[18px] md:text-[22px] leading-none z-20 pointer-events-none"
                           animate={{ y: [0, -5, 0] }}
                           transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                         >
                           ☀️
                         </motion.span>
                         <span className="text-3xl md:text-4xl leading-none block pt-3 z-10 select-none">
                           {f.original_word === 'يوليو' ? '🔥' : '🏖️'}
                         </span>
                       </div>
                     ) : f.emoji?.startsWith('/') ? (
                       <img src={f.emoji} alt={f.original_word} className="w-12 h-12 md:w-16 md:h-16 object-contain mx-auto" referrerPolicy="no-referrer" />
                     ) : (
                       <span className="whitespace-pre-line leading-none">{f.emoji || '✨'}</span>
                     )}
                   </div>
                   <h3 className={`${topic && (topic.id === 'instructions' || topic.en === 'MONTHS' || topic.ar === 'الشهور') ? 'hidden' : ''} font-black text-slate-800 arabic-font leading-relaxed pt-1 mb-2 truncate w-full px-1 ${
                      f.original_word && f.original_word.length > 20 ? 'text-[4px] md:text-[6px]' :
                      f.original_word && f.original_word.length > 18 ? 'text-[5px] md:text-[7px]' :
                      f.original_word && f.original_word.length > 14 ? 'text-[6px] md:text-[8px]' :
                      f.original_word && f.original_word.length > 12 ? 'text-[7px] md:text-[8px]' : 
                      f.original_word === 'بيض مسلوق' ? 'text-[6px] md:text-[7px]' :
                      f.original_word && f.original_word.length >= 10 ? 'text-[7px] md:text-[8px]' : 
                      'text-[10px] md:text-[12px]'
                   }`}>{f.original_word}</h3>
                   <button 
                      onClick={(e) => { e.stopPropagation(); onSpeak(f.original_word || '', 'ar'); }}
                      className="p-1 text-amber-500 hover:bg-amber-100 rounded-full transition-all"
                   >
                     <Volume2 size={12} />
                   </button>
                 </div>

                 {/* BACK SIDE */}
                 <div className="absolute inset-0 backface-hidden bg-white text-slate-800 rounded-2xl p-2 flex flex-col justify-between shadow-2xl rotate-y-180 border border-slate-100">
                   <div className="flex-1 flex flex-col justify-center items-center overflow-hidden">
                     <span className={`font-black mb-1 text-slate-400 uppercase tracking-tighter text-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-1 ${
                       (f.translation || '').length > 22 ? 'text-[5.5px] md:text-[6.5px]' :
                       (f.translation || '').length > 16 || (f.translation || '').includes(' ') || (f.translation || '').includes('/') ? 'text-[6.5px] md:text-[7.5px]' :
                       (f.translation || '').length > 12 ? 'text-[7.5px] md:text-[8.5px]' :
                       (f.translation || '').length > 8 ? 'text-[8.5px] md:text-[9.5px]' :
                       'text-[10px] md:text-[11px]'
                     }`}>{f.translation}</span>
                     {f.analysis?.details_ar?.example && (
                       <p className="text-[7px] md:text-[8px] arabic-font font-medium leading-relaxed text-slate-600 mb-2 px-1 pt-1">"{highlightWord(f.analysis.details_ar.example, f.original_word || '')}"</p>
                     )}
                     {f.analysis?.details_ar?.example && (
                       <button 
                          onClick={(e) => { e.stopPropagation(); onSpeak(f.analysis.details_ar.example, 'ar'); }}
                          className="p-1 px-2 bg-slate-50 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all mb-1 border border-amber-100"
                       >
                         <Volume2 size={12} />
                       </button>
                     )}
                   </div>

                   <div className="grid grid-cols-2 gap-1 mt-auto">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onAction({ original_word: f.original_word, translation: f.translation, analysis: f.analysis }, 'know'); setFlippedIndex(null); }}
                        className="py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[6px] font-black uppercase transition-all hover:bg-emerald-500 hover:text-white border border-emerald-100"
                      >أعرفها</button>
                      <button 
                         onClick={(e) => { e.stopPropagation(); onAction({ original_word: f.original_word, translation: f.translation, analysis: f.analysis }, 'learn'); setFlippedIndex(null); }}
                         className="py-1 bg-sky-500/10 text-sky-600 rounded-lg text-[6px] font-black uppercase transition-all hover:bg-sky-600 hover:text-white border border-sky-100"
                      >أتعلمها</button>
                   </div>
                 </div>
               </motion.div>
             </div>
           ))}
        </div>

        <style>{`
          .perspective-1000 { perspective: 1000px; }
          .transform-style-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .rotate-y-180 { transform: rotateY(180deg); }
        `}</style>
        </div>
      </div>

      {/* Printable Topic Worksheet (Hidden in UI) */}
      <TopicWorksheet
        topic={topic}
        words={words}
        worksheetRef={worksheetRef}
      />

      {/* Interactive Worksheet Preview Modal */}
      <WorksheetPreviewModal
        isOpen={showWorksheetPreview}
        onClose={() => setShowWorksheetPreview(false)}
        topic={topic}
        words={words}
        onDownload={generateWorksheet}
        isGenerating={isGeneratingWorksheet}
      />
    </div>
  );
};


const SidebarNavBtn: React.FC<{ active: boolean, icon: React.ReactNode, label: string, sub: string, lang: 'ar' | 'en', onClick: () => void }> = ({ active, icon, label, sub, lang, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative overflow-hidden flex-row ${active ? 'bg-[#0f172a] text-white shadow-xl shadow-slate-200 translate-x-1' : 'text-slate-400 hover:bg-slate-50'}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
      {icon}
    </div>
    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
       <h4 className={`text-sm font-black arabic-font leading-none mb-0.5 ${active ? 'text-white' : 'text-slate-700'}`}>{label}</h4>
       <span className={`text-[7px] font-black tracking-widest uppercase ${active ? 'text-white/60' : 'text-slate-300'}`}>{sub}</span>
    </div>
  </button>
);

const SessionActionBtn: React.FC<{ icon: React.ReactNode, label: string, sub: string, color: string, lang: 'ar' | 'en', onClick: () => void }> = ({ icon, label, sub, color, lang, onClick }) => {
  const styles = {
    emerald: 'bg-emerald-50/50 text-emerald-600 border-emerald-100/30 hover:border-emerald-400',
    sky: 'bg-sky-50/50 text-sky-600 border-sky-100/30 hover:border-sky-400',
    slate: 'bg-slate-50/50 text-slate-400 border-slate-200/30 hover:border-slate-400'
  }[color as 'emerald' | 'sky' | 'slate'];

  return (
    <button 
      onClick={onClick} 
      className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border transition-all active:scale-95 group shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white ${styles}`}
    >
       <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${color === 'emerald' ? 'bg-emerald-50' : color === 'sky' ? 'bg-sky-50' : 'bg-slate-50'}`}>
         {icon}
       </div>
       <div className="text-center">
          <span className="block text-[8px] font-black uppercase arabic-font leading-none mb-0.5">{label}</span>
          <span className="block text-[5px] font-bold opacity-30 tracking-[0.15em] uppercase leading-none">{sub}</span>
       </div>
    </button>
  );
};



