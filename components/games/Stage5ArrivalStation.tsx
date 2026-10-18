import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  RotateCcw, 
  Award, 
  Printer, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Train, 
  Info,
  Download,
  Loader2,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldCheck,
  Lock,
  Star,
  Home,
  Eye
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { GrammarRule } from '../../src/data/grammarRulesData';
import { ArrivalMasterTicket } from './ArrivalMasterTicket';

interface Stage5ArrivalStationProps {
  activeRule: GrammarRule;
  passengerName: string;
  score: number;
  stars: number;
  tripDurationSeconds: number;
  maxUnlockedStage?: number;
  soundEnabled: boolean;
  playSound: (type: 'whistle' | 'correct' | 'error' | 'click' | 'victory' | 'trainMove' | 'brake' | 'barrier_open' | 'barrier_alarm' | 'wrong') => void;
  onStopTimer?: () => void;
  onNavigateStage: (stage: number) => void;
  onRestartTrip: () => void;
  onChooseNewDestination: () => void;
  onBackToCentral: () => void;
  lang?: 'ar' | 'en';
}

export const Stage5ArrivalStation: React.FC<Stage5ArrivalStationProps> = ({
  activeRule,
  passengerName,
  score,
  stars,
  tripDurationSeconds,
  maxUnlockedStage = 5,
  soundEnabled,
  playSound,
  onStopTimer,
  onNavigateStage,
  onRestartTrip,
  onChooseNewDestination,
  onBackToCentral,
  lang = 'ar'
}) => {
  // Reactive Language support
  const [currentLang, setCurrentLang] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem('hub_lang') as 'ar' | 'en') || lang || 'ar';
  });

  useEffect(() => {
    if (lang) setCurrentLang(lang);
  }, [lang]);

  useEffect(() => {
    const handleLangChange = () => {
      const stored = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setCurrentLang(stored);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  // Question Bank Selection (Pick a mission from the bank for this rule)
  const questionBank = useMemo(() => {
    if (activeRule.stage5ArrivalMissions && activeRule.stage5ArrivalMissions.length > 0) {
      return activeRule.stage5ArrivalMissions;
    }
    if (activeRule.stage5ArrivalMission) {
      return [{
        id: 'default_mission',
        sentence: activeRule.stage5ArrivalMission.sentence,
        prompt: activeRule.stage5ArrivalMission.prompt,
        options: activeRule.stage5ArrivalMission.options,
        correctExplanation: activeRule.stage5ArrivalMission.correctExplanation,
        errorHint: activeRule.stage5ArrivalMission.errorHint
      }];
    }
    return [{
      id: 'fallback',
      sentence: 'ذَهَبَ الطَّالِبُ ___ المَدْرَسَةِ',
      prompt: 'اختر حرف الجر المناسب',
      options: [
        { id: 'ala', text: 'عَلَى', isCorrect: false },
        { id: 'min', text: 'مِنْ', isCorrect: false },
        { id: 'ila', text: 'إِلَى', isCorrect: true }
      ],
      correctExplanation: 'حرف الجر «إلى» يفيد انتهاء الغاية المكانية.',
      errorHint: 'تذكّر: نستخدم «إلى» للدلالة على الاتجاه نحو الهدف.'
    }];
  }, [activeRule]);

  // Pick a random question index on mount or rule change
  const [currentMissionIndex, setCurrentMissionIndex] = useState<number>(() => {
    return Math.floor(Math.random() * questionBank.length);
  });

  const currentMission = questionBank[currentMissionIndex] || questionBank[0];

  // Identical Station Signboard Title to Stage 1, translated when currentLang === 'en'
  const stationSignboardText = useMemo(() => {
    if (currentLang === 'en') {
      const titlesEn: Record<string, string> = {
        nominal_verbal: 'Nominal & Verbal Sentences Station',
        plurals: 'Arabic Plurals Station',
        kana_sisters: 'Kana & Its Sisters Station',
        inna_sisters: 'Inna & Its Sisters Station',
        prepositions: 'Prepositions Station',
      };
      if (activeRule.id && titlesEn[activeRule.id]) {
        return titlesEn[activeRule.id];
      }
      if (activeRule.title?.includes('الجموع') || activeRule.id?.includes('plural')) {
        return 'Arabic Plurals Station';
      }
      return `${activeRule.title} Station`;
    }
    const titles: Record<string, string> = {
      nominal_verbal: 'محطة الجملة الاسمية والفعلية',
      plurals: 'محطة الجموع في اللغة العربية',
      kana_sisters: 'محطة كان وأخواتها',
      inna_sisters: 'محطة إن وأخواتها',
      prepositions: 'محطة حروف الجر',
    };
    if (activeRule.id && titles[activeRule.id]) {
      return titles[activeRule.id];
    }
    if (activeRule.title?.includes('الجموع') || activeRule.id?.includes('plural')) {
      return 'محطة الجموع في اللغة العربية';
    }
    if (activeRule.shortTitle && activeRule.shortTitle.startsWith('محطة')) {
      return activeRule.shortTitle;
    }
    return `محطة ${activeRule.title}`;
  }, [activeRule, currentLang]);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [ticketPhase, setTicketPhase] = useState<'waiting' | 'extruding'>('waiting');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const exportCertificateRef = useRef<HTMLDivElement>(null);

  // Pedagogical English translations for grammar prompts so foreign students understand instructions clearly
  const translatePromptToEn = (promptText: string): string => {
    const dictionary: Record<string, string> = {
      'اختر جمع المؤنث السالم المنصوب بالكسرة': 'Choose the sound feminine plural in the accusative case (marked with Kasrah)',
      'اختر جمع المذكر السالم المنصوب بالياء': 'Choose the sound masculine plural in the accusative case (marked with Ya)',
      'اختر جمع المذكر السالم المنصوب بالياء المناسب': 'Choose the appropriate sound masculine plural in the accusative case (with Ya)',
      'اختر جمع المؤنث السالم المرفوع بالضمة': 'Choose the sound feminine plural in the nominative case (marked with Dammah)',
      'اختر جمع التكسير المناسب': 'Choose the appropriate broken plural (Jam\' Takseer)',
      'اختر جمع التكسير المجرور بالكسرة': 'Choose the broken plural in the genitive case (marked with Kasrah)',
      'اختر الخبر المرفوع المناسب لإتمام الجملة الاسمية': 'Choose the appropriate nominative predicate (Khabar) to complete the nominal sentence',
      'اختر الفعل الماضي المناسب لبدء الجملة الفعلية': 'Choose the appropriate past-tense verb to begin the verbal sentence',
      'ما نوع هذه الجملة النحوية؟': 'What is the grammatical type of this sentence?',
      'حدد الركن الأساسي الذي بدأت به هذه الجملة': 'Identify the primary element that begins this sentence',
      'اختر الخبر المرفوع المناسب للمبتدأ (العِلْمُ)': 'Choose the appropriate nominative predicate (Khabar) for the subject (العِلْمُ)',
      'اختر خبر كان المنصوب بالفتحة المناسب': 'Choose the appropriate predicate of Kana (accusative with Fathah)',
      'اختر اسم أصبح المرفوع بالألف لأنه مثنى': 'Choose the subject of Asbaha (nominative with Alif for dual)',
      'اختر خبر صار المنصوب بتنوين الفتح': 'Choose the predicate of Sara (accusative with Tanween Fath)',
      'اختر خبر أمسى المنصوب بالياء لأنه جمع مذكر سالم': 'Choose the predicate of Amsa (accusative with Ya for masculine plural)',
      'اختر خبر ليس المنصوب المناسب': 'Choose the appropriate accusative predicate of Laysa',
      'اختر اسم إنّ المنصوب بالفتحة المناسب': 'Choose the appropriate noun of Inna (accusative with Fathah)',
      'اختر اسم إنّ المنصوب بالفتحة': 'Choose the noun of Inna (accusative with Fathah)',
      'اختر خبر ليت المرفوع بالواو لأنه جمع مذكر سالم': 'Choose the predicate of Layta (nominative with Waw for masculine plural)',
      'اختر خبر أنَّ المرفوع بالضمة': 'Choose the predicate of Anna (nominative with Dammah)',
      'اختر خبر كأنّ المرفوع بالضمة': 'Choose the predicate of Ka\'anna (nominative with Dammah)',
      'اختر حرف الجر المناسب': 'Choose the appropriate preposition (Harf Jarr)',
      'اختر حرف الجر الدال على الاستعلاء والمكان': 'Choose the preposition expressing elevation / on top',
      'اختر حرف الجر الدال على ابتداء الغاية المكانية': 'Choose the preposition indicating starting point',
      'اختر حرف الجر الدال على الظرفية المكانية': 'Choose the preposition indicating spatial container / in',
      'اختر حرف الجر المناسب للمعنى': 'Choose the preposition that best fits the sentence meaning',
      'اختر حرف الجر الدال على الاستعانة بالوسيلة': 'Choose the preposition indicating means or instrument',
    };

    if (dictionary[promptText]) {
      return dictionary[promptText];
    }
    if (promptText.includes('المؤنث السالم')) return 'Choose the sound feminine plural (accusative with Kasrah)';
    if (promptText.includes('المذكر السالم')) return 'Choose the sound masculine plural';
    if (promptText.includes('التكسير')) return 'Choose the appropriate broken plural';
    if (promptText.includes('حرف الجر')) return 'Choose the appropriate preposition';
    if (promptText.includes('كان')) return 'Choose the correct predicate/noun of Kana';
    if (promptText.includes('إنّ') || promptText.includes('إن')) return 'Choose the correct predicate/noun of Inna';
    if (promptText.includes('الاسمية')) return 'Choose the completing element for the nominal sentence';
    if (promptText.includes('الفعلية')) return 'Choose the correct verb for the verbal sentence';

    return promptText;
  };

  const [shuffledOptions, setShuffledOptions] = useState<Array<{ id: string; text: string; isCorrect: boolean }>>([]);

  useEffect(() => {
    if (currentMission && currentMission.options) {
      const shuffled = [...currentMission.options].sort(() => Math.random() - 0.5);
      setShuffledOptions(shuffled);
    }
  }, [currentMission]);

  // Format seconds into HH:MM:SS
  const formatTripTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const handleNextQuizQuestion = () => {
    if (questionBank.length > 1) {
      let nextIdx = Math.floor(Math.random() * questionBank.length);
      if (nextIdx === currentMissionIndex) {
        nextIdx = (nextIdx + 1) % questionBank.length;
      }
      setCurrentMissionIndex(nextIdx);
    }
    setSelectedOptionId(null);
    setFeedbackState('idle');
    setTicketPhase('waiting');
    playSound('click');
  };

  const handleOptionClick = (option: { id: string; text: string; isCorrect: boolean }) => {
    setSelectedOptionId(option.id);

    if (option.isCorrect) {
      setFeedbackState('correct');
      playSound('correct');
      setTimeout(() => playSound('whistle'), 350);

      if (onStopTimer) {
        onStopTimer();
      }

      setTimeout(() => {
        setTicketPhase('extruding');
        playSound('victory');
      }, 700);
    } else {
      setFeedbackState('incorrect');
      playSound('wrong');
    }
  };

  // Dedicated High-Resolution PDF Generator using Master Certificate template
  const handleDownloadPDF = async () => {
    const targetElement = exportCertificateRef.current || certificateRef.current;
    if (!targetElement || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);
      playSound('click');

      // Ensure all web fonts are completely loaded before capturing to prevent disconnected Arabic letters
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Small delay to allow complete styles and layout resolution
      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(targetElement, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#faf6ee',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const wrapper = clonedDoc.getElementById('export-certificate-wrapper');
          if (wrapper) {
            wrapper.style.position = 'fixed';
            wrapper.style.left = '0px';
            wrapper.style.top = '0px';
            wrapper.style.opacity = '1';
            wrapper.style.zIndex = '999999';
            wrapper.style.visibility = 'visible';
            wrapper.style.display = 'block';
          }
          const cert = clonedDoc.getElementById('royal-grammar-master-certificate');
          if (cert) {
            cert.style.opacity = '1';
            cert.style.transform = 'none';
            cert.style.visibility = 'visible';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 297 mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 210 mm

      // 10mm margins on all 4 sides so the entire ornate decorative border and cutouts are 100% visible
      const margin = 10;
      const availW = pageWidth - (margin * 2); // 277 mm
      const availH = pageHeight - (margin * 2); // 190 mm

      let printWidth = availW;
      let printHeight = (canvas.height * printWidth) / canvas.width;

      if (printHeight > availH) {
        printHeight = availH;
        printWidth = (canvas.width * printHeight) / canvas.height;
      }

      const posX = (pageWidth - printWidth) / 2;
      const posY = (pageHeight - printHeight) / 2;

      pdf.addImage(imgData, 'PNG', posX, posY, printWidth, printHeight, undefined, 'FAST');

      const cleanStation = stationSignboardText.replace(/[\\/*?:"<>|]/g, '').trim().replace(/\s+/g, '_');
      const fileName = currentLang === 'en'
        ? `Ticket_${cleanStation}.pdf`
        : `تذكرة_${cleanStation}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF export error, falling back to print dialog:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div 
      id="stage5-arrival-station"
      className="relative w-full h-full min-h-screen flex flex-col justify-between overflow-x-hidden select-none bg-[#020b0e]" 
      dir={currentLang === 'en' ? 'ltr' : 'rtl'}
    >
      {/* =========================================================================
          1. CINEMATIC RAILWAY PLATFORM BACKGROUND (Visible, Atmospheric)
         ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src="/stage5_arrival_station_bg.jpg" 
          alt="Night Railway Arrival Platform" 
          className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/train_golden_station.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020b0e]/85 via-transparent to-[#020b0e]/70" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#01080a]/15 to-[#01080a]/50" />
      </div>

      {/* =========================================================================
          2. TOP STEPPER & CONTROLS (Identical to Stage 1 and other stations)
         ========================================================================= */}
      <div className="relative z-30 w-full px-4 sm:px-6 pt-3 sm:pt-4 flex items-center justify-between shrink-0 pointer-events-auto min-h-[64px]">
        {/* Top Spacer to keep center stepper symmetrically aligned */}
        <div className="w-10 sm:w-11 z-10" />

        {/* Center Section: Interactive 5-Stage Stepper */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none pointer-events-auto z-10" dir={currentLang === 'en' ? 'ltr' : 'rtl'}>
          <div className="flex items-center gap-1 sm:gap-1.5">
            {[
              { id: 1, label: currentLang === 'en' ? 'Ticket Office' : 'شباك التذاكر' },
              { id: 2, label: currentLang === 'en' ? 'Switchyard' : 'محطة التحويلة' },
              { id: 3, label: currentLang === 'en' ? 'Coupling Station' : 'محطة الاصطفاف' },
              { id: 4, label: currentLang === 'en' ? 'Sorting Depot' : 'محطة الفرز' },
              { id: 5, label: currentLang === 'en' ? 'Arrival Station' : 'محطة الوصول' }
            ].map((st, idx, arr) => (
              <div key={st.id} className="flex items-center">
                <button
                  onClick={() => {
                    if (st.id <= maxUnlockedStage && st.id !== 5) {
                      playSound('click');
                      onNavigateStage(st.id);
                    }
                  }}
                  disabled={st.id > maxUnlockedStage || st.id === 5}
                  className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black transition-all whitespace-nowrap ${
                    st.id === 5
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-stone-950 ring-4 ring-amber-400/30 shadow-[0_0_18px_rgba(245,158,11,0.5)] scale-105 cursor-default'
                      : st.id <= maxUnlockedStage
                      ? 'bg-[#061e22]/90 text-teal-400/70 border border-teal-500/20 hover:text-teal-200 cursor-pointer active:scale-95'
                      : 'opacity-40 cursor-not-allowed bg-[#031013]/90 text-slate-500 border border-slate-700/30'
                  }`}
                  title={st.id <= maxUnlockedStage ? (currentLang === 'en' ? `Navigate to: ${st.label}` : `الانتقال إلى: ${st.label}`) : (currentLang === 'en' ? 'Station Locked' : 'المحطة مقفلة')}
                >
                  <span>{st.label}</span>
                </button>
                {idx < arr.length - 1 && (
                  <div className="w-2 sm:w-3.5 h-[2px] mx-0.5 rounded-full bg-teal-900/60" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Left Section: Balanced Spacer */}
        <div className="w-10 sm:w-11 z-10" />
      </div>

      {/* =========================================================================
          3. LOWERED STATION TITLE PLAQUE: Identical to Stage 1's Signboard
         ========================================================================= */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center pointer-events-none mt-2 sm:mt-3 mb-1">
        {/* Plaque Suspension Links */}
        <div className="flex items-center justify-between w-64 sm:w-72 px-8 h-2.5 -mb-1 z-10">
          <div className="w-1.5 h-2.5 bg-gradient-to-r from-[#1c140c] via-[#4d3622] to-[#140d07] rounded-xs shadow-md" />
          <div className="w-24 sm:w-32 h-1.5 bg-radial from-amber-300/40 via-amber-400/10 to-transparent blur-xs pointer-events-none" />
          <div className="w-1.5 h-2.5 bg-gradient-to-r from-[#1c140c] via-[#4d3622] to-[#140d07] rounded-xs shadow-md" />
        </div>

        {/* Plaque Body */}
        <div 
          id="station-title-plaque"
          className="px-6 sm:px-12 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-b from-[#141e24]/98 via-[#091116]/98 to-[#03070a]/98 border-2 border-amber-500/80 shadow-[0_12px_35px_rgba(0,0,0,0.95),0_0_20px_rgba(217,119,6,0.35),inset_0_1px_2px_rgba(254,240,138,0.4),inset_0_0_12px_rgba(0,0,0,0.9)] flex items-center justify-center relative overflow-hidden backdrop-blur-xl pointer-events-auto"
        >
          <div className="absolute inset-1 rounded-xl border border-amber-400/30 pointer-events-none" />
          {/* Rivets */}
          <div className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 to-amber-900 border border-amber-950 shadow-sm" />
          <div className="absolute top-1.5 left-2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 to-amber-900 border border-amber-950 shadow-sm" />
          <div className="absolute bottom-1.5 right-2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 to-amber-900 border border-amber-950 shadow-sm" />
          <div className="absolute bottom-1.5 left-2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 to-amber-900 border border-amber-950 shadow-sm" />

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-50 via-yellow-200 to-amber-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] px-3 whitespace-nowrap">
            {stationSignboardText}
          </h1>
        </div>
      </div>

      {/* =========================================================================
          4. MAIN VICTORIAN ARRIVAL GUICHET & DISPENSING COUNTER (Matching Stage 1)
         ========================================================================= */}
      <main className="relative z-20 flex-1 max-w-[1240px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center my-auto py-2">
        {/* Counter Frame */}
        <div className="relative rounded-[32px] p-4 sm:p-6 lg:p-7 border-2 border-amber-500/40 bg-gradient-to-b from-[#140f09]/65 via-[#0a0704]/50 to-[#040302]/75 backdrop-blur-[4px] shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_3px_rgba(254,240,138,0.25)]">
          {/* Grid of Two Architectural Pillars: Verification Desk & Certificate Dispenser */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch pt-1">
          
            {/* =================================================================
                PILLAR 1 (7 cols): منصة إذن الدخول ورصيف الوصول
               ================================================================= */}
            <div className="lg:col-span-7 rounded-[24px] border-[1.5px] border-amber-400/50 p-4 sm:p-5 flex flex-col justify-between relative shadow-[0_15px_35px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.2)] bg-gradient-to-b from-[#082228]/90 via-[#04151a]/85 to-[#020d10]/95 backdrop-blur-md overflow-hidden">
              <div className="absolute inset-1.5 rounded-[18px] border border-amber-400/20 pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 mb-3 w-full">
                <div className="py-2.5 px-3 sm:px-4 rounded-xl shadow-md border border-amber-400/50 bg-gradient-to-r from-[#0c3942] via-[#145360] to-[#0c3942] flex items-center justify-between text-center">
                  <h3 className="font-black font-serif text-xs sm:text-sm text-amber-100 drop-shadow">
                    {currentLang === 'en' ? 'Answer to validate your arrival pass' : 'أجب لتحصل على ختم الوصول'}
                  </h3>
                  <button
                    type="button"
                    onClick={handleNextQuizQuestion}
                    className="text-xs font-bold font-serif text-amber-200 hover:text-amber-100 bg-[#06181c] hover:bg-[#0a272e] border border-amber-500/50 hover:border-amber-400 px-3.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95 shadow-inner"
                    title={currentLang === 'en' ? 'Try another question' : 'سؤال وصول آخر'}
                  >
                    {currentLang === 'en' ? 'Another Question' : 'سؤال آخر'}
                  </button>
                </div>
              </div>

              {/* Question Sentence Card - Strict fixed height to prevent pushing downward */}
              <div className="rounded-xl bg-gradient-to-b from-[#021014]/95 to-[#041a22]/90 border border-amber-400/30 px-3 py-2 text-center shadow-inner relative z-10 h-[88px] flex flex-col items-center justify-center overflow-hidden my-1">
                <p className={`font-black font-serif text-amber-100 drop-shadow my-0.5 tracking-wide leading-snug line-clamp-2 ${
                  currentMission.sentence.length > 40
                    ? 'text-base sm:text-lg'
                    : currentMission.sentence.length > 25
                    ? 'text-lg sm:text-xl'
                    : 'text-xl sm:text-2xl'
                }`} dir="rtl">
                  {currentMission.sentence}
                </p>
                {currentMission.prompt && (
                  <p className={`text-amber-300 font-bold font-serif truncate max-w-full px-2 mt-0.5 ${
                    (currentLang === 'en' ? translatePromptToEn(currentMission.prompt) : currentMission.prompt).length > 45 ? 'text-[10px]' : 'text-xs'
                  }`} dir={currentLang === 'en' ? 'ltr' : 'rtl'}>
                    {currentLang === 'en' ? translatePromptToEn(currentMission.prompt) : currentMission.prompt}
                  </p>
                )}
              </div>

              {/* Tactile Choice Buttons */}
              <div className="space-y-2.5 mt-3 relative z-10">
                {(shuffledOptions.length > 0 ? shuffledOptions : currentMission.options).map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  const isCorrect = option.isCorrect;

                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleOptionClick(option)}
                      className={`w-full py-3 px-4 rounded-xl font-bold font-serif text-sm sm:text-base flex items-center justify-between border-2 transition-all cursor-pointer shadow-md relative overflow-hidden ${
                        isSelected && isCorrect
                          ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 border-amber-200 text-stone-950 shadow-[0_0_20px_rgba(245,158,11,0.9)]'
                          : isSelected && !isCorrect
                          ? 'bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-red-400 text-red-100'
                          : 'bg-[#082026]/90 hover:bg-[#0d2f38] border-amber-500/35 text-amber-100 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black font-mono border ${
                          isSelected && isCorrect
                            ? 'bg-stone-950 text-amber-300 border-stone-900'
                            : 'bg-[#020b0e] text-amber-300 border-amber-500/40'
                        }`}>
                          •
                        </span>
                        <span className="text-base sm:text-lg font-black" dir="rtl">{option.text}</span>
                      </div>

                      <div>
                        {isSelected && isCorrect ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                            <Check size={13} className="stroke-[3]" />
                          </div>
                        ) : isSelected && !isCorrect ? (
                          <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                            <X size={13} className="stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-amber-400/40 bg-black/30" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Bottom message removed per user instruction */}
              <div className="min-h-[10px]" />
            </div>

            {/* =================================================================
                PILLAR 2 (5 cols): منفذ ختم الوصول واستخراج تذكرة الإتقان
               ================================================================= */}
            <div className="lg:col-span-5 rounded-[24px] border-[1.5px] border-amber-400/50 p-4 sm:p-5 flex flex-col items-center justify-between relative shadow-[0_15px_35px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.2)] bg-gradient-to-b from-[#1c130b]/90 via-[#120b06]/85 to-[#080503]/95 backdrop-blur-md overflow-hidden">
              <div className="absolute inset-1.5 rounded-[18px] border border-amber-400/20 pointer-events-none" />

              {/* Machine Header */}
              <div className="w-full flex flex-col items-center mb-2 relative z-10">
                <div className="w-full py-2.5 px-3 rounded-xl text-center shadow-md border border-amber-400/50 bg-gradient-to-r from-[#3d220c] via-[#5c3311] to-[#3d220c] flex items-center justify-center">
                  <h3 className="font-black font-serif text-sm sm:text-base text-amber-100 drop-shadow">
                    {currentLang === 'en' ? 'Arrival Stamping Gate' : 'منفذ ختم الوصول'}
                  </h3>
                </div>

                {/* Machine Ticket Slot */}
                <div className="w-full mt-2 h-3 rounded-full bg-[#080503] border border-amber-600/80 shadow-inner flex items-center justify-center overflow-hidden">
                  <div className={`w-3/4 h-1 rounded-full transition-colors duration-500 ${
                    ticketPhase !== 'waiting' ? 'bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.95)]' : 'bg-amber-900/40'
                  }`} />
                </div>
              </div>

              {/* Ticket Area - Fixed stable height matching Pillar 1 to prevent downward expansion */}
              <div className="w-full flex-1 flex flex-col items-center justify-center relative h-[310px] sm:h-[325px] overflow-hidden py-0.5 z-10">
                
                {/* State: Waiting */}
                {ticketPhase === 'waiting' && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-3 rounded-xl border border-dashed border-amber-600/40 bg-[#0e0a06]/80">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#2a1708] border border-amber-500/50 text-amber-300 flex items-center justify-center mb-2 shadow-md">
                      <Lock size={20} />
                    </div>
                    <span className="text-xs sm:text-sm font-black text-amber-200 mb-0.5 font-serif">
                      {currentLang === 'en' ? 'Awaiting Arrival Stamp' : 'التذكرة في انتظار ختم الوصول'}
                    </span>
                    <span className="text-[11px] text-amber-300/70 font-serif max-w-[220px]">
                      {currentLang === 'en' 
                        ? 'Answer the platform question to validate and stamp your arrival pass.' 
                        : 'أجب عن سؤال الرصيف لاعتماد وختم تذكرة وصولك فوراً'}
                    </span>
                  </div>
                )}

                {/* State: Extruding - Authentic Compact Railway Ticket */}
                {ticketPhase !== 'waiting' && (
                  <motion.div
                    ref={certificateRef}
                    id="official-railway-ticket"
                    initial={{ y: -200, opacity: 0.2 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="relative w-full rounded-2xl bg-gradient-to-b from-[#fefbf3] via-[#f7f0df] to-[#eedfc2] text-[#2c1d0b] border-2 border-[#b89758] shadow-[0_12px_30px_rgba(0,0,0,0.9),0_0_15px_rgba(245,158,11,0.25)] p-3 sm:p-3.5 overflow-hidden select-none font-serif"
                    dir={currentLang === 'en' ? 'ltr' : 'rtl'}
                  >
                    {/* Ticket Notch cutouts */}
                    <div className="absolute top-1/2 -left-2.5 w-5 h-5 rounded-full bg-[#120b06] border-2 border-[#b89758] -translate-y-1/2 pointer-events-none" />
                    <div className="absolute top-1/2 -right-2.5 w-5 h-5 rounded-full bg-[#120b06] border-2 border-[#b89758] -translate-y-1/2 pointer-events-none" />

                    {/* Vintage Railway Ticket Header */}
                    <div className="border-b border-dashed border-[#8c6b33]/40 pb-1.5 mb-1.5 text-center px-1">
                      <div className="flex items-center justify-between text-[8.5px] font-mono font-bold text-amber-900/80 uppercase tracking-widest">
                        <span>№ ARV-{score.toString().padStart(4, '0')}</span>
                        <span>{currentLang === 'en' ? 'GRAMMAR RAILWAY' : 'سِكَّةُ حَدِيدِ النَّحْوِ'}</span>
                        <span>CLASS A</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black font-serif text-stone-900 mt-0.5">
                        {currentLang === 'en' ? 'OFFICIAL ARRIVAL PASS' : 'تَذْكِرَةُ وُصُولٍ وَإِتْقَانٍ مُعْتَمَدَة'}
                      </h4>
                    </div>

                    {/* Ticket Metadata Compact Grid (No layout jump) */}
                    <div className="grid grid-cols-2 gap-1 text-[11px] font-serif px-2.5 py-1.5 bg-amber-50/80 rounded-lg border border-amber-900/15">
                      <div className="flex items-center gap-1">
                        <span className="text-stone-600 font-bold text-[10px]">{currentLang === 'en' ? 'Passenger:' : 'المُسَافِر:'}</span>
                        <span className="font-black text-stone-950 truncate max-w-[95px] text-xs">{passengerName || (currentLang === 'en' ? 'Hero' : 'بطل النحو')}</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-stone-600 font-bold text-[10px]">{currentLang === 'en' ? 'Station:' : 'المَحَطَّة:'}</span>
                        <span className="font-black text-emerald-950 truncate max-w-[105px]">{stationSignboardText}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-stone-600 font-bold text-[10px]">{currentLang === 'en' ? 'Duration:' : 'مُدَّةُ الرِّحْلَة:'}</span>
                        <span className="font-mono font-bold text-slate-800 dir-ltr text-xs">{formatTripTime(tripDurationSeconds)}</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-stone-600 font-bold text-[10px]">{currentLang === 'en' ? 'Score:' : 'الرَّصِيد:'}</span>
                        <span className="font-black text-amber-950 font-mono text-xs">{score} {currentLang === 'en' ? 'Points' : 'ن'}</span>
                      </div>
                    </div>

                    {/* Authentic Circular Arrival Stamp (خَتْمُ الوُصُولِ) */}
                    <div className="relative my-1 flex items-center justify-center">
                      <div className="transform -rotate-6 border-2 border-dashed border-red-700 rounded-full p-0.5 bg-red-50/40 shadow-xs">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-red-700 flex flex-col items-center justify-center text-center p-0.5 text-red-700 select-none">
                          <span className="text-[7.5px] font-black font-serif tracking-tight">{currentLang === 'en' ? '★ ARRIVAL SEAL ★' : '★ خَتْمُ الوُصُولِ ★'}</span>
                          <div className="w-10 h-[1px] bg-red-700 my-0.5" />
                          <span className="text-[11px] font-black font-serif tracking-wider">{currentLang === 'en' ? 'OFFICIAL PASS' : 'مُعْتَمَدٌ'}</span>
                          <span className="text-[6.5px] font-mono font-bold tracking-tight">ARRIVAL PASS</span>
                        </div>
                      </div>
                    </div>

                    {/* Download & Navigation Actions */}
                    <div className="pt-1.5 border-t border-dashed border-[#8c6b33]/40 space-y-1.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={handleDownloadPDF}
                          disabled={isGeneratingPdf}
                          className="w-full py-1.5 sm:py-2 px-2.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 text-stone-950 font-black text-xs font-serif shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 disabled:opacity-60 transition-all"
                          title={currentLang === 'en' ? 'Download Official Ticket (PDF)' : 'حفظ التذكرة المعتمدة (PDF)'}
                        >
                          {isGeneratingPdf ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span className="truncate">{currentLang === 'en' ? 'Generating...' : 'جاري الحفظ...'}</span>
                            </>
                          ) : (
                            <>
                              <Download size={13} />
                              <span className="truncate">{currentLang === 'en' ? 'Download PDF' : 'حفظ التذكرة (PDF)'}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            playSound('click');
                            setIsPreviewModalOpen(true);
                          }}
                          className="w-full py-1.5 sm:py-2 px-2.5 rounded-lg bg-[#152b46] hover:bg-[#1f3d61] text-amber-100 border border-amber-400/40 font-black text-xs font-serif shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                          title={currentLang === 'en' ? 'Preview Official Certificate' : 'معاينة تذكرة الإنجاز'}
                        >
                          <Eye size={13} className="text-amber-400" />
                          <span className="truncate">{currentLang === 'en' ? 'Preview Ticket' : 'معاينة التذكرة'}</span>
                        </button>
                      </div>

                      {/* Post-Completion Controls */}
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            playSound('click');
                            onRestartTrip();
                          }}
                          className="py-1.5 px-2 rounded-lg bg-[#241708] hover:bg-[#38230b] border border-amber-600/50 text-amber-200 text-[10.5px] font-bold font-serif flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                          title={currentLang === 'en' ? 'Restart Learning Trip' : 'إعادة الرحلة من البداية'}
                        >
                          <RotateCcw size={12} />
                          <span>{currentLang === 'en' ? 'Restart' : 'إعادة الرحلة'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playSound('click');
                            onBackToCentral();
                          }}
                          className="py-1.5 px-2 rounded-lg bg-[#0d2830] hover:bg-[#143e4b] border border-teal-500/50 text-teal-200 text-[10.5px] font-bold font-serif flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                          title={currentLang === 'en' ? 'Return to Central Terminal' : 'المحطة المركزية'}
                        >
                          <Home size={12} />
                          <span>{currentLang === 'en' ? 'Terminal' : 'المحطة المركزية'}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

            </div>

          </div>
        </div>
      </main>

      {/* =========================================================================
          5. DEDICATED HIGH-RESOLUTION MASTER TICKET / CERTIFICATE (Captured for PDF)
             Fixed 1140px × 740px, Matches exact design of provided image with 100% vector borders
         ========================================================================= */}
      <div 
        id="export-certificate-wrapper"
        style={{ 
          position: 'fixed', 
          left: '-9999px', 
          top: 0, 
          zIndex: -100, 
          pointerEvents: 'none', 
          width: '1140px', 
          height: '740px',
          overflow: 'visible',
          opacity: 1
        }}
      >
        <div ref={exportCertificateRef}>
          <ArrivalMasterTicket
            lang={currentLang}
            passengerName={passengerName}
            stationName={stationSignboardText}
            score={score}
            tripDurationSeconds={tripDurationSeconds}
          />
        </div>
      </div>

      {/* =========================================================================
          6. FULL-SCREEN INTERACTIVE CERTIFICATE PREVIEW MODAL
         ========================================================================= */}
      {isPreviewModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div 
            className="relative max-w-5xl w-full bg-[#152b46] border-2 border-amber-400/50 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
            dir={currentLang === 'en' ? 'ltr' : 'rtl'}
          >
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-amber-400/20 mb-3 px-2">
              <div className="flex items-center gap-2">
                <Award className="text-amber-400" size={22} />
                <h3 className="text-base sm:text-lg font-black text-amber-200 font-serif">
                  {currentLang === 'en' ? 'Official Achievement Ticket Preview' : 'معاينة تذكرة الإنجاز الرسمية'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 text-stone-950 font-black text-xs font-serif flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-60"
                >
                  {isGeneratingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  <span>{currentLang === 'en' ? 'Download PDF' : 'تحميل PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 flex items-center justify-center cursor-pointer transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scaled Ticket Container */}
            <div className="w-full overflow-x-auto flex justify-center py-2">
              <div className="transform scale-[0.32] sm:scale-[0.55] md:scale-[0.72] lg:scale-[0.82] origin-top rounded-xl shadow-2xl">
                <ArrivalMasterTicket
                  lang={currentLang}
                  passengerName={passengerName}
                  stationName={stationSignboardText}
                  score={score}
                  tripDurationSeconds={tripDurationSeconds}
                />
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-2 text-center text-xs text-amber-300/80 font-serif">
              {currentLang === 'en'
                ? 'Official arrival credential issued upon completing the station mastery question.'
                : 'تذكرة إنجاز معتمدة صادرة رسمياً عند اجتياز سؤال الإتقان بالمحطة.'}
            </div>
          </div>
        </div>
      )}

      {/* Clean bottom padding */}
      <div className="pb-4" />
    </div>
  );
};
