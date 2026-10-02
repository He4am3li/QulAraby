import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, Settings, FileText, Milestone, 
  Search, Tag, Puzzle, Flag, Trophy, 
  ArrowLeft, Volume2, VolumeX, Menu, Train, Star, User, Sparkles
} from 'lucide-react';
import { VintageStationClock } from './VintageStationClock';
import { StationSignboard } from './StationSignboard';
import { GRAMMAR_RULES, GrammarRule } from '../../src/data/grammarRulesData';

interface CentralGrammarStationProps {
  passengerName: string;
  onUpdatePassengerName: (name: string) => void;
  selectedRuleId: string;
  onSelectAndStartRule: (ruleId: string, targetStage?: number) => void;
  onBack: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenMenu: () => void;
  playSound: (type: 'whistle' | 'correct' | 'error' | 'click' | 'victory' | 'trainMove' | 'brake') => void;
  currentStationIndex?: number; // 1 to 5
  totalStations?: number;
  lang?: 'ar' | 'en';
}

export const CentralGrammarStation: React.FC<CentralGrammarStationProps> = ({
  passengerName,
  onUpdatePassengerName,
  selectedRuleId,
  onSelectAndStartRule,
  onBack,
  soundEnabled,
  onToggleSound,
  onOpenMenu,
  playSound,
  currentStationIndex = 1,
  totalStations = 4,
  lang = 'ar',
}) => {
  const [hoveredArch, setHoveredArch] = useState<string | null>(null);
  const [activeSelectedRule, setActiveSelectedRule] = useState<string | null>(null);
  const [isNameEditing, setIsNameEditing] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(passengerName);

  // The 5 grammar rules in the exact order specified:
  // Right to left (in RTL: index 0 is far right, index 4 is far left):
  // 1. «الجملة الاسمية والفعلية»
  // 2. «أنواع الجموع»
  // 3. «الأفعال الناسخة»
  // 4. «الحروف الناسخة»
  // 5. «حروف الجر»
  const orderedRules: GrammarRule[] = [
    GRAMMAR_RULES.nominal_verbal, // Far Right
    GRAMMAR_RULES.plurals,        // Next Left
    GRAMMAR_RULES.kana_sisters,   // Center
    GRAMMAR_RULES.inna_sisters,   // Next Left
    GRAMMAR_RULES.prepositions,   // Far Left
  ];

  // Distinctive educational grammar subtitles for each destination
  const RULE_SUBTITLES: Record<string, string> = {
    nominal_verbal: 'المبتدأ والخبر • الفعل والفاعل',
    plurals: 'مذكر سالم • مؤنث سالم • تكسير',
    kana_sisters: 'كان وأخواتها • ترفع وتنصب',
    inna_sisters: 'إنّ وأخواتها • تنصب وترفع',
    prepositions: 'حروف الجر • الاسم المجرور',
  };

  const RULE_TITLES_EN: Record<string, string> = {
    nominal_verbal: 'Nominal & Verbal',
    plurals: 'Arabic Plurals',
    kana_sisters: 'Kana & Sisters',
    inna_sisters: 'Inna & Sisters',
    prepositions: 'Prepositions',
  };

  const RULE_SUBTITLES_EN: Record<string, string> = {
    nominal_verbal: 'Subject & Predicate • Verb & Subject',
    plurals: 'Sound Masc • Sound Fem • Broken',
    kana_sisters: 'Kana & Sisters • Nom. & Acc.',
    inna_sisters: 'Inna & Sisters • Acc. & Nom.',
    prepositions: 'Prepositions • Genitive Noun',
  };

  const getRuleIcon = (iconType: string, isChosen: boolean) => {
    const iconClass = `w-5 h-5 sm:w-6 sm:h-6 drop-shadow transition-transform ${
      isChosen ? 'text-amber-100 scale-110' : 'text-cyan-300'
    }`;
    switch (iconType) {
      case 'book':
        return <BookOpen className={iconClass} />;
      case 'users':
        return <Users className={iconClass} />;
      case 'gear':
        return <Settings className={iconClass} />;
      case 'document':
        return <FileText className={iconClass} />;
      case 'signpost':
        return <Milestone className={iconClass} />;
      default:
        return <BookOpen className={iconClass} />;
    }
  };

  const handleArchClick = (ruleId: string) => {
    playSound('whistle');
    playSound('trainMove');
    setActiveSelectedRule(ruleId);
    onSelectAndStartRule(ruleId, 1); // Start Stage 1 (اكتشف)
  };

  return (
    <div 
      id="central-grammar-station"
      dir={lang === 'en' ? 'ltr' : 'rtl'}
      className="relative w-full h-full min-h-[680px] flex flex-col justify-between overflow-hidden select-none bg-[#01090d]"
    >
      {/* =========================================================================
          1. CINEMATIC BACKGROUND: Five Arched Tunnels, 5 Straight Parallel Tracks
             - Symmetrical 1-point linear perspective
             - Completely open tracks (No parked train)
             - 5 tracks receding from screen foreground into the 5 tunnels
             - Far-right tunnel illuminated by warm golden light, other four by cyan light
         ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img
          src="/cinematic_station_master_clean.jpg"
          alt="Central Grammar Railway Terminal"
          className="w-full h-full object-cover object-center transform scale-100 filter brightness-[1.02] contrast-[1.08]"
          onError={(e) => {
            // High-fidelity fallbacks
            const target = e.target as HTMLImageElement;
            if (target.src.indexOf('cinematic_five_tunnels_master.jpg') === -1) {
              target.src = '/cinematic_five_tunnels_master.jpg';
            } else if (target.src.indexOf('cinematic_five_tracks_clear.jpg') === -1) {
              target.src = '/cinematic_five_tracks_clear.jpg';
            } else if (target.src.indexOf('five_tracks_station.jpg') === -1) {
              target.src = '/five_tracks_station.jpg';
            } else {
              target.src = '/central_grammar_station.jpg';
            }
          }}
          referrerPolicy="no-referrer"
        />

        {/* Ambient Dark Teal and Prussian Blue Subtle Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#01080b]/90 via-transparent to-[#020a0d]/40 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(1,8,11,0.45)_100%)] pointer-events-none" />
      </div>

      {/* =========================================================================
          2. TOP HEADER ROW:
             - Far-Left: Round Back Button (←) and Sound Toggle Button (🔊)
             - Center: Master Cartouche Plaque «قطار النحو العربي» with Glowing Golden Neon Border & Rivets
             - Far-Right: Hanging Vintage Station Clock with Ornate Iron Finials & Warm Halo
         ========================================================================= */}
      <header 
        id="station-header"
        className="relative z-30 w-full px-4 sm:px-6 pt-3 sm:pt-4 flex items-center justify-between shrink-0 pointer-events-auto"
      >
        {/* Right Corner (In RTL): Hanging Vintage Station Clock */}
        <div className="relative flex items-center justify-end w-44 sm:w-56 h-16 pointer-events-none">
          <div className="absolute right-0 top-0 pointer-events-auto drop-shadow-[0_12px_30px_rgba(0,0,0,0.9)] transform hover:scale-105 transition-transform duration-300">
            <VintageStationClock size={135} />
          </div>
        </div>

        {/* Center: Master Vintage Cinematic Station Plaque «محطة النحو العربي» */}
        <div className="relative flex-1 flex flex-col justify-center items-center pointer-events-none">
          {/* Top Forged Iron Suspension Brackets with Brass Rivets & Subtle Lantern Glow */}
          <div className="flex items-center justify-between w-64 sm:w-80 px-10 h-3 -mb-1 z-10">
            {/* Right Hanging Link (in RTL) */}
            <div className="flex flex-col items-center">
              <div className="w-1.5 h-2.5 bg-gradient-to-r from-[#1c140c] via-[#4d3622] to-[#140d07] rounded-xs shadow-md" />
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-amber-200 via-amber-500 to-amber-900 border border-amber-950 shadow-xs -mt-0.5" />
            </div>
            {/* Top Atmospheric Halogen / Lantern Warm Diffuse Glow */}
            <div className="w-28 sm:w-36 h-2 bg-radial from-amber-300/40 via-amber-400/10 to-transparent blur-xs pointer-events-none" />
            {/* Left Hanging Link */}
            <div className="flex flex-col items-center">
              <div className="w-1.5 h-2.5 bg-gradient-to-r from-[#1c140c] via-[#4d3622] to-[#140d07] rounded-xs shadow-md" />
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-amber-200 via-amber-500 to-amber-900 border border-amber-950 shadow-xs -mt-0.5" />
            </div>
          </div>

          {/* Master Plaque Body */}
          <div 
            id="station-title-plaque"
            className="px-6 sm:px-12 md:px-14 py-2 sm:py-2.5 rounded-2xl sm:rounded-[20px] bg-gradient-to-b from-[#141e24]/98 via-[#091116]/98 to-[#03070a]/98 border-2 border-amber-500/80 shadow-[0_12px_35px_rgba(0,0,0,0.95),0_0_20px_rgba(217,119,6,0.35),inset_0_1px_2px_rgba(254,240,138,0.4),inset_0_0_12px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl pointer-events-auto group hover:border-amber-400 transition-colors duration-300"
          >
            {/* Antique Brass Molded Inner Bezel Frame */}
            <div className="absolute inset-1 sm:inset-1.5 rounded-xl sm:rounded-[16px] border border-amber-400/35 pointer-events-none shadow-[inset_0_0_6px_rgba(245,158,11,0.15)]" />

            {/* Corner Brass Rivets with Highlight */}
            <div className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-900 border border-amber-950 shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
            <div className="absolute top-1.5 left-2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-900 border border-amber-950 shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
            <div className="absolute bottom-1.5 right-2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-900 border border-amber-950 shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
            <div className="absolute bottom-1.5 left-2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-900 border border-amber-950 shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />

            {/* Title in Majestic Antique Golden Calligraphy */}
            <div className="relative flex items-center justify-center px-4 py-0.5">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-50 via-yellow-200 to-amber-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] [text-shadow:0_0_15px_rgba(245,158,11,0.6)] px-2 whitespace-nowrap">
                {lang === 'en' ? 'Arabic Grammar Terminal' : 'محطة النحو العربي'}
              </h1>
            </div>
          </div>
        </div>

        {/* Left Corner: Symmetrical balance to the clock on right */}
        <div className="w-44 sm:w-56 pointer-events-none" />
      </header>

      {/* =========================================================================
          3. MAIN CENTER STAGE: THE FIVE ARCHED DESTINATION CORRIDORS
         ========================================================================= */}
      <main 
        id="station-portals-container"
        className="relative z-20 flex-1 w-full h-full select-none pointer-events-auto overflow-hidden"
      >
        {/* Five Straight Perspective Railway Corridors: Aligned to the exact architectural centers of the 5 background arches */}
        <div className="relative w-full h-full">
          {orderedRules.map((rule, idx) => {
            const isChosen = activeSelectedRule === rule.id;
            const isHovered = hoveredArch === rule.id;

            // Centers and vanishing perspective angles matching the 5 stone arches in the station architecture:
            // Symmetrical about center arch (50.00%):
            const archConfigs = [
              { leftPct: 82.85, clipPath: 'polygon(28% 0%, 72% 0%, 98% 100%, 14% 100%)' }, // المسار 1: أقصى اليمين (الجملة الاسمية والفعلية)
              { leftPct: 66.57, clipPath: 'polygon(24% 0%, 76% 0%, 94% 100%, 8% 100%)' },  // المسار 2: يمين الوسط (أنواع الجموع)
              { leftPct: 50.00, clipPath: 'polygon(20% 0%, 80% 0%, 95% 100%, 5% 100%)' },  // المسار 3: الوسط المرجعي (الأفعال الناسخة)
              { leftPct: 33.43, clipPath: 'polygon(24% 0%, 76% 0%, 92% 100%, 6% 100%)' },  // المسار 4: يسار الوسط (الحروف الناسخة)
              { leftPct: 17.15, clipPath: 'polygon(28% 0%, 72% 0%, 86% 100%, 2% 100%)' },  // المسار 5: أقصى اليسار (حروف الجر)
            ];
            const arch = archConfigs[idx];

            return (
              <div
                key={rule.id}
                id={`station-track-lane-${rule.id}`}
                onMouseEnter={() => {
                  setHoveredArch(rule.id);
                  if (soundEnabled) {
                    playSound('click');
                  }
                }}
                onMouseLeave={() => setHoveredArch(null)}
                onClick={() => handleArchClick(rule.id)}
                style={{
                  left: `${arch.leftPct}%`,
                  transform: 'translateX(-50%)',
                }}
                className="absolute top-0 bottom-0 w-[17%] sm:w-[16%] md:w-[15%] max-w-[215px] flex flex-col items-center justify-between cursor-pointer group select-none"
              >
                {/* 1. TOP: Gothic Arched Lunette Signboard */}
                <div className="w-full flex flex-col items-center z-20 pt-[14vh] sm:pt-[16vh] md:pt-[18vh] lg:pt-[20vh]">
                  <StationSignboard
                    title={lang === 'en' ? (RULE_TITLES_EN[rule.id] || rule.title) : rule.title}
                    iconType={rule.iconType}
                    platformNumber={rule.platformNumber}
                    trackIndex={idx}
                    isChosen={isChosen}
                    isHovered={isHovered}
                  />
                </div>

                {/* 2. MIDDLE: Perspective-Matched Railway Track Light Projection:
                    - Glowing in TURQUOISE when hovered
                    - Turning to radiant GOLD ONLY when clicked / chosen
                */}
                <div className="relative w-full flex-1 flex flex-col justify-end items-center my-1 pointer-events-none overflow-hidden">
                  {/* Perspective Light Cone matching exact track angle & vanishing point */}
                  <div 
                    style={{ clipPath: arch.clipPath }}
                    className={`w-full h-full absolute inset-0 transition-all duration-500 ${
                      isChosen 
                        ? 'bg-gradient-to-b from-amber-400/45 via-amber-400/20 to-transparent opacity-100' 
                        : isHovered 
                        ? 'bg-gradient-to-b from-cyan-400/40 via-cyan-400/18 to-transparent opacity-100'
                        : 'bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-25'
                    }`} 
                  >
                    {/* Glowing Source Halo at the Tunnel Arch mouth */}
                    <div 
                      className={`w-full h-1/2 absolute top-0 inset-x-0 transition-opacity duration-500 ${
                        isChosen 
                          ? 'bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.65)_0%,rgba(245,158,11,0.2)_40%,transparent_75%)] opacity-100' 
                          : isHovered 
                          ? 'bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.6)_0%,rgba(6,182,212,0.18)_40%,transparent_75%)] opacity-100' 
                          : 'opacity-0'
                      }`} 
                    />
                  </div>
                </div>

                {/* 3. Open Bottom foreground */}
                <div className="w-full h-2 z-20 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </main>


      {/* Passenger Name Quick Modal if clicked */}
      {isNameEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-3xl bg-[#061e22] border border-amber-400/60 p-6 shadow-2xl text-right"
          >
            <h3 className="text-lg font-black text-amber-100 mb-2 font-serif">
              {lang === 'en' ? 'Passenger Name' : 'اسم المسافر'}
            </h3>
            <p className="text-xs text-teal-200/80 mb-4">
              {lang === 'en' ? 'Enter your name to appear on the railway ticket and arrival certificate:' : 'اكتب اسمك ليظهر على تذكرة قطار النحو وشهادة التخرج:'}
            </p>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#031417] border border-teal-400/40 text-amber-200 font-bold outline-none mb-4 text-right"
              placeholder={lang === 'en' ? 'Passenger Name...' : 'اسم المسافر...'}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNameEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                {lang === 'en' ? 'Cancel' : 'إلغاء'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tempName.trim()) {
                    onUpdatePassengerName(tempName.trim());
                  }
                  setIsNameEditing(false);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black cursor-pointer"
              >
                {lang === 'en' ? 'Save Name' : 'حفظ الاسم'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
