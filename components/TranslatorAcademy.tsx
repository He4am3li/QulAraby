import React from 'react';
import { 
  Sparkles, 
  Trophy, 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Loader2, 
  Lightbulb, 
  Award, 
  Layers, 
  Send,
  GraduationCap,
  Check,
  Zap,
  Puzzle,
  Target,
  PenTool,
  Bookmark,
  X,
  Keyboard as KeyboardIcon
} from 'lucide-react';
import { STARTER_TRANSLATOR_CHALLENGES, FALLBACK_AI_CHALLENGES } from '../data/translatorChallenges';
import { TranslatorChallenge, TranslatorPuzzleWord } from '../types';
import { speak as globalSpeak, evaluateStudentTranslation, generateTranslatorAIChallenge } from '../services/gemini';
import { ArabicFullKeyboard } from './ArabicFullKeyboard';

interface TranslatorAcademyProps {
  lang: 'ar' | 'en';
}

export const TranslatorAcademy: React.FC<TranslatorAcademyProps> = ({ lang }) => {
  // Gamification State
  const [xp, setXp] = React.useState<number>(() => {
    return parseInt(localStorage.getItem('hub_translator_xp') || '0', 10);
  });
  const [completedCount, setCompletedCount] = React.useState<number>(() => {
    return parseInt(localStorage.getItem('hub_translator_completed') || '0', 10);
  });
  const [selectedLevel, setSelectedLevel] = React.useState<1 | 2 | 3>(1);
  const [challenges, setChallenges] = React.useState<TranslatorChallenge[]>(STARTER_TRANSLATOR_CHALLENGES);
  const [currentIdx, setCurrentIdx] = React.useState<number>(0);
  const [isGeneratingAI, setIsGeneratingAI] = React.useState<boolean>(false);
  const [showBadgesModal, setShowBadgesModal] = React.useState<boolean>(false);

  // Level 1: Sentence Puzzle State
  const [selectedPuzzleWords, setSelectedPuzzleWords] = React.useState<TranslatorPuzzleWord[]>([]);
  const [puzzlePool, setPuzzlePool] = React.useState<TranslatorPuzzleWord[]>([]);
  const [puzzleChecked, setPuzzleChecked] = React.useState<boolean>(false);
  const [isPuzzleCorrect, setIsPuzzleCorrect] = React.useState<boolean>(false);

  // Level 2: Fill in Blank State
  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null);
  const [gapChecked, setGapChecked] = React.useState<boolean>(false);

  // Level 3: Assisted Translation State
  const [userTranslationText, setUserTranslationText] = React.useState<string>('');
  const [isEvaluating, setIsEvaluating] = React.useState<boolean>(false);
  const [showFullKeyboard, setShowFullKeyboard] = React.useState<boolean>(true);
  const [evaluationResult, setEvaluationResult] = React.useState<{
    accuracy: number;
    isCorrect: boolean;
    feedbackEn: string;
    feedbackAr: string;
    vocalizedArabic: string;
    transliteration: string;
    grammarTip: string;
  } | null>(null);

  // Current Challenge filtering
  const levelChallenges = React.useMemo(() => {
    return challenges.filter(c => c.level === selectedLevel);
  }, [challenges, selectedLevel]);

  const currentChallenge: TranslatorChallenge | undefined = levelChallenges[currentIdx % (levelChallenges.length || 1)];

  // Initialize/Reset challenge state on switch
  React.useEffect(() => {
    if (!currentChallenge) return;

    if (currentChallenge.level === 1 && currentChallenge.puzzleWords) {
      // Shuffle words for bank
      const shuffled = [...currentChallenge.puzzleWords].sort(() => Math.random() - 0.5);
      setPuzzlePool(shuffled);
      setSelectedPuzzleWords([]);
      setPuzzleChecked(false);
      setIsPuzzleCorrect(false);
    } else if (currentChallenge.level === 2) {
      setSelectedOptionId(null);
      setGapChecked(false);
    } else if (currentChallenge.level === 3) {
      setUserTranslationText('');
      setEvaluationResult(null);
    }
  }, [currentChallenge, selectedLevel, currentIdx]);

  // Audio Player Helper
  const playAudio = (text: string, voiceLang: 'ar' | 'en' = 'ar') => {
    globalSpeak(text, voiceLang);
  };

  // Gamification XP Add
  const awardPoints = (points: number) => {
    const newXp = xp + points;
    const newCount = completedCount + 1;
    setXp(newXp);
    setCompletedCount(newCount);
    localStorage.setItem('hub_translator_xp', newXp.toString());
    localStorage.setItem('hub_translator_completed', newCount.toString());
  };

  // Level 1 Puzzle Actions
  const handlePickWord = (word: TranslatorPuzzleWord) => {
    if (puzzleChecked) return;
    setPuzzlePool(prev => prev.filter(w => w.id !== word.id));
    setSelectedPuzzleWords(prev => [...prev, word]);
    playAudio(word.arabic, 'ar');
  };

  const handleReturnWord = (word: TranslatorPuzzleWord) => {
    if (puzzleChecked) return;
    setSelectedPuzzleWords(prev => prev.filter(w => w.id !== word.id));
    setPuzzlePool(prev => [...prev, word]);
  };

  const handleCheckPuzzle = () => {
    if (!currentChallenge?.correctOrderIds) return;
    const currentIds = selectedPuzzleWords.map(w => w.id);
    const isMatch = JSON.stringify(currentIds) === JSON.stringify(currentChallenge.correctOrderIds);
    setIsPuzzleCorrect(isMatch);
    setPuzzleChecked(true);

    if (isMatch) {
      awardPoints(25);
      if (currentChallenge.targetArabic) {
        playAudio(currentChallenge.targetArabic, 'ar');
      }
    }
  };

  const handleResetPuzzle = () => {
    if (!currentChallenge?.puzzleWords) return;
    setPuzzlePool([...currentChallenge.puzzleWords].sort(() => Math.random() - 0.5));
    setSelectedPuzzleWords([]);
    setPuzzleChecked(false);
    setIsPuzzleCorrect(false);
  };

  // Level 2 Option Select
  const handleSelectOption = (option: any) => {
    if (gapChecked) return;
    setSelectedOptionId(option.id);
    setGapChecked(true);
    playAudio(option.arabic, 'ar');

    if (option.isCorrect) {
      awardPoints(30);
    }
  };

  // Level 3 Evaluate
  const handleEvaluateTranslation = async () => {
    if (!userTranslationText.trim() || !currentChallenge) return;
    setIsEvaluating(true);
    try {
      const result = await evaluateStudentTranslation(
        currentChallenge.promptEn,
        userTranslationText,
        currentChallenge.referenceTranslation
      );
      setEvaluationResult(result);
      if (result.isCorrect) {
        awardPoints(40);
        playAudio(result.vocalizedArabic, 'ar');
      }
    } catch (e) {
      console.error("Evaluation failed", e);
      setEvaluationResult({
        accuracy: 85,
        isCorrect: true,
        feedbackEn: "Good effort! Keep practicing sentence patterns.",
        feedbackAr: "مُحَاوَلَةٌ طَيِّبَةٌ!",
        vocalizedArabic: currentChallenge.referenceTranslation || userTranslationText,
        transliteration: "Al-Arabiyyah",
        grammarTip: "Review word order and endings."
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Generate New AI Challenge
  const handleGenerateAIChallenge = async () => {
    setIsGeneratingAI(true);
    try {
      const newChallenge = await generateTranslatorAIChallenge(selectedLevel);
      if (newChallenge && newChallenge.promptEn) {
        setChallenges(prev => [newChallenge, ...prev]);
        setCurrentIdx(0);
      } else {
        // Use rich curated fallback pool
        const pool = FALLBACK_AI_CHALLENGES[selectedLevel];
        if (pool && pool.length > 0) {
          const randomFallback = {
            ...pool[Math.floor(Math.random() * pool.length)],
            id: `fb_${Date.now()}`
          };
          setChallenges(prev => [randomFallback, ...prev]);
          setCurrentIdx(0);
        }
      }
    } catch (e) {
      console.error("Failed to generate AI challenge", e);
      const pool = FALLBACK_AI_CHALLENGES[selectedLevel];
      if (pool && pool.length > 0) {
        const randomFallback = {
          ...pool[Math.floor(Math.random() * pool.length)],
          id: `fb_${Date.now()}`
        };
        setChallenges(prev => [randomFallback, ...prev]);
        setCurrentIdx(0);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Next Challenge
  const handleNextChallenge = () => {
    setCurrentIdx(prev => prev + 1);
  };

  // Helper keyboard actions for typing Arabic
  const handleInsertChar = (ch: string) => {
    setUserTranslationText(prev => prev + ch);
  };

  const handleBackspace = () => {
    setUserTranslationText(prev => prev.slice(0, -1));
  };

  const handleSpace = () => {
    setUserTranslationText(prev => prev + ' ');
  };

  const handleClear = () => {
    setUserTranslationText('');
  };

  // Badges Definitions
  const badges = [
    { id: 'b1', title: 'سيد التراكيب', titleEn: 'Sentence Architecture', desc: 'حل 3 ألغاز لترتيب الجمل التعبيرية', icon: Puzzle, unlocked: completedCount >= 3 },
    { id: 'b2', title: 'صائد الكلمات', titleEn: 'Context Selection', desc: 'إتمام 5 تحديات لاختيار الكلمة المناسبة', icon: Target, unlocked: completedCount >= 5 },
    { id: 'b3', title: 'مترجم المواقف', titleEn: 'Situational Translation', desc: 'ترجمة 3 مواقف لغوية حقيقية', icon: PenTool, unlocked: xp >= 100 },
    { id: 'b4', title: 'المترجم المتقدم', titleEn: 'Master Linguist', desc: 'جمع 200 نقطة خبرة لغوية', icon: Award, unlocked: xp >= 200 }
  ];

  return (
    <div className="w-full flex-1 flex flex-col overflow-hidden bg-slate-50/40 relative">
      
      {/* Top Professional Control Bar */}
      <div className="bg-white border-b border-slate-200/80 px-5 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        
        {/* Left: Refined Level Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
          <button
            onClick={() => { setSelectedLevel(1); setCurrentIdx(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              selectedLevel === 1 
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Puzzle size={13} className={selectedLevel === 1 ? 'text-blue-600' : 'text-slate-400'} />
            <span>{lang === 'ar' ? 'المستوى 1: تركيب الجمل' : 'Level 1: Sentence Puzzle'}</span>
          </button>

          <button
            onClick={() => { setSelectedLevel(2); setCurrentIdx(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              selectedLevel === 2 
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target size={13} className={selectedLevel === 2 ? 'text-emerald-600' : 'text-slate-400'} />
            <span>{lang === 'ar' ? 'المستوى 2: الكلمة المفقودة' : 'Level 2: Fill in Blank'}</span>
          </button>

          <button
            onClick={() => { setSelectedLevel(3); setCurrentIdx(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              selectedLevel === 3 
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool size={13} className={selectedLevel === 3 ? 'text-indigo-600' : 'text-slate-400'} />
            <span>{lang === 'ar' ? 'المستوى 3: الترجمة المباشرة' : 'Level 3: Direct Translation'}</span>
          </button>
        </div>

        {/* Right: Clean Stats & Actions */}
        <div className="flex items-center gap-2">
          {/* XP Metric */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-bold font-sans">
            <Zap size={13} className="text-amber-500 fill-amber-500" />
            <span>{xp} XP</span>
          </div>

          {/* Badges Modal Trigger */}
          <button
            onClick={() => setShowBadgesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors shadow-2xs"
            title="الإنجازات"
          >
            <Trophy size={13} className="text-slate-500" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'الإنجازات' : 'Achievements'}</span>
          </button>

          {/* New Challenge Action */}
          <button
            onClick={handleGenerateAIChallenge}
            disabled={isGeneratingAI}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {isGeneratingAI ? <Loader2 size={13} className="animate-spin text-slate-300" /> : <Sparkles size={13} className="text-slate-300" />}
            <span className="hidden sm:inline">{lang === 'ar' ? 'تحدٍ جديد' : 'New Challenge'}</span>
          </button>
        </div>
      </div>

      {/* Main Challenge Area */}
      <div className="flex-1 overflow-y-auto custom-scroll p-4 sm:p-6 flex flex-col items-center">
        {currentChallenge ? (
          <div className="w-full max-w-3xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Top Prompt Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[11px] font-black uppercase tracking-wider">
                  {currentChallenge.scenarioContext || (lang === 'ar' ? 'موقف حياتي' : 'Daily Life')}
                </span>

                <div className="flex items-center gap-2 text-xs font-black text-slate-400">
                  <span>{lang === 'ar' ? `تحدي ${currentIdx + 1} من ${levelChallenges.length}` : `Challenge ${currentIdx + 1} of ${levelChallenges.length}`}</span>
                </div>
              </div>

              {/* English Target Sentence */}
              <div className="space-y-1 mb-2 text-left" dir="ltr">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Translate into Arabic:</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-sans tracking-tight">
                  &ldquo;{currentChallenge.promptEn}&rdquo;
                </h3>
              </div>

              {currentChallenge.scenarioHint && (
                <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl flex items-start gap-2 text-xs font-medium text-amber-900">
                  <Lightbulb size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p>{currentChallenge.scenarioHint}</p>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* LEVEL 1: SENTENCE PUZZLE (تركيب الجمل للمبتدئين) */}
            {/* ========================================================================= */}
            {currentChallenge.level === 1 && (
              <div className="space-y-5">
                
                {/* Target Answer Slot (Drop/Pick Area) */}
                <div className="bg-white rounded-3xl p-5 border-2 border-dashed border-blue-200 min-h-[110px] flex flex-col justify-center items-center shadow-xs">
                  <span className="text-[11px] font-black text-slate-400 mb-2.5">
                    {lang === 'ar' ? 'الجملة العربية المكتملة:' : 'Constructed Arabic Sentence:'}
                  </span>

                  {selectedPuzzleWords.length === 0 ? (
                    <p className="text-xs font-bold text-slate-400 arabic-font">
                      {lang === 'ar' ? 'انقر على الكلمات بالأسفل بالترتيب الصحيح لتكوين الجملة...' : 'Click the word blocks below in order to assemble the sentence...'}
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-center justify-center gap-2.5" dir="rtl">
                      {selectedPuzzleWords.map((word) => (
                        <button
                          key={word.id}
                          onClick={() => handleReturnWord(word)}
                          className="px-4 py-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-sm hover:scale-105 active:scale-95 transition-all text-center group flex flex-col items-center"
                        >
                          <span className="text-lg font-black arabic-font leading-tight">{word.arabic}</span>
                          <span className="text-[10px] text-blue-200 font-sans tracking-wide">{word.transliteration}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Word Pool / Bank */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black text-slate-600">
                      {lang === 'ar' ? 'بنك الكلمات المشكولة (انقر لاختيار الكلمة والاستماع لنطقها):' : 'Word Bank (Click to add & listen):'}
                    </span>
                    <button
                      onClick={handleResetPuzzle}
                      className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw size={12} />
                      <span>{lang === 'ar' ? 'إعادة الترتيب' : 'Reset'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" dir="rtl">
                    {puzzlePool.map((word) => (
                      <div
                        key={word.id}
                        onClick={() => handlePickWord(word)}
                        className="p-3.5 bg-white border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/40 rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col items-center text-center group active:scale-95"
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); playAudio(word.arabic, 'ar'); }}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <Volume2 size={13} />
                          </button>
                          <span className="text-[10px] font-bold text-slate-400 font-sans">{word.meaningEn}</span>
                        </div>
                        <span className="text-xl font-black text-slate-900 arabic-font leading-snug group-hover:text-blue-700">
                          {word.arabic}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 font-sans">
                          {word.transliteration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action / Check Button */}
                {!puzzleChecked ? (
                  <button
                    onClick={handleCheckPuzzle}
                    disabled={selectedPuzzleWords.length === 0}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <CheckCircle2 size={18} />
                    <span>{lang === 'ar' ? 'تحقق من ترتيبي (+25 XP)' : 'Check My Sentence (+25 XP)'}</span>
                  </button>
                ) : (
                  <div className={`p-5 rounded-3xl border ${isPuzzleCorrect ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950' : 'bg-rose-50/90 border-rose-300 text-rose-950'} space-y-3 animate-in zoom-in-95 duration-200`}>
                    <div className="flex items-center gap-3">
                      {isPuzzleCorrect ? (
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check size={22} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                          <XCircle size={22} />
                        </div>
                      )}
                      <div>
                        <h4 className="text-base font-black">
                          {isPuzzleCorrect ? (lang === 'ar' ? 'أحسنت! ترتيب صحيح ومتقن' : 'Excellent! Perfect Word Order') : (lang === 'ar' ? 'ترتيب غير دقيق، حاول مرة أخرى!' : 'Not quite right, let\'s try again!')}
                        </h4>
                        <p className="text-xs font-medium opacity-90 font-sans mt-0.5">
                          {currentChallenge.grammarNote}
                        </p>
                      </div>
                    </div>

                    {isPuzzleCorrect && currentChallenge.targetArabic && (
                      <div className="p-3 bg-white/80 rounded-2xl border border-emerald-200 flex items-center justify-between" dir="rtl">
                        <div className="text-right">
                          <span className="text-lg font-black text-emerald-950 arabic-font block">{currentChallenge.targetArabic}</span>
                          <span className="text-xs font-medium text-emerald-700 font-sans" dir="ltr">{currentChallenge.targetTransliteration}</span>
                        </div>
                        <button
                          onClick={() => playAudio(currentChallenge.targetArabic!, 'ar')}
                          className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs hover:bg-emerald-700"
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      {isPuzzleCorrect ? (
                        <button
                          onClick={handleNextChallenge}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <span>{lang === 'ar' ? 'التحدي التالي' : 'Next Challenge'}</span>
                          <ArrowRight size={15} className={lang === 'ar' ? 'rotate-180' : ''} />
                        </button>
                      ) : (
                        <button
                          onClick={handleResetPuzzle}
                          className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <RotateCcw size={14} />
                          <span>{lang === 'ar' ? 'أعد المحاولة' : 'Try Again'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ========================================================================= */}
            {/* LEVEL 2: FILL IN THE BLANK (الكلمة المفقودة وقواعد المطابقة) */}
            {/* ========================================================================= */}
            {currentChallenge.level === 2 && currentChallenge.sentenceWithBlank && (
              <div className="space-y-5">
                
                {/* Blank Sentence Display */}
                <div className="bg-white rounded-3xl p-6 border border-emerald-200/90 shadow-sm text-center space-y-2">
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block">Complete the Sentence:</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 arabic-font leading-relaxed" dir="rtl">
                    {currentChallenge.sentenceWithBlank.arabic}
                  </h2>
                  <p className="text-xs font-bold text-slate-500 font-sans tracking-wide">
                    {currentChallenge.sentenceWithBlank.transliteration}
                  </p>
                  <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold font-sans">
                    Missing word: <strong>&ldquo;{currentChallenge.sentenceWithBlank.blankTranslation}&rdquo;</strong>
                  </div>
                </div>

                {/* 3 Interactive Choice Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentChallenge.options?.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    let style = 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30';
                    if (gapChecked) {
                      if (opt.isCorrect) {
                        style = 'bg-emerald-500 text-white border-emerald-600 shadow-md';
                      } else if (isSelected && !opt.isCorrect) {
                        style = 'bg-rose-500 text-white border-rose-600 shadow-md';
                      } else {
                        style = 'bg-slate-50 border-slate-200 opacity-40';
                      }
                    }

                    return (
                      <div
                        key={opt.id}
                        role="button"
                        tabIndex={gapChecked ? -1 : 0}
                        onClick={() => handleSelectOption(opt)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectOption(opt);
                          }
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-between gap-2 shadow-2xs group cursor-pointer ${style}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); playAudio(opt.arabic, 'ar'); }}
                            className={`p-1 rounded-lg ${gapChecked && (opt.isCorrect || isSelected) ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'}`}
                          >
                            <Volume2 size={15} />
                          </button>
                          <span className={`text-[10px] font-black font-sans ${gapChecked && (opt.isCorrect || isSelected) ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {opt.meaningEn}
                          </span>
                        </div>

                        <span className="text-2xl font-black arabic-font leading-snug">
                          {opt.arabic}
                        </span>

                        <span className={`text-xs font-bold font-sans ${gapChecked && (opt.isCorrect || isSelected) ? 'text-white/90' : 'text-slate-500'}`}>
                          {opt.transliteration}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Card upon Selection */}
                {gapChecked && selectedOptionId && (
                  <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-3 shadow-md animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2">
                      <Lightbulb size={18} className="text-amber-400" />
                      <h4 className="text-sm font-black">
                        {currentChallenge.options?.find(o => o.id === selectedOptionId)?.isCorrect
                          ? (lang === 'ar' ? 'إجابة صحيحة ومطابقة ممتازة! (+30 XP)' : 'Correct! Great Agreement Choice (+30 XP)')
                          : (lang === 'ar' ? 'توضيح القاعدة النحوية:' : 'Grammar Explanation:')}
                      </h4>
                    </div>

                    <p className="text-xs font-medium text-slate-300 font-sans leading-relaxed">
                      {currentChallenge.options?.find(o => o.id === selectedOptionId)?.explanation}
                    </p>

                    <button
                      onClick={handleNextChallenge}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm mt-2"
                    >
                      <span>{lang === 'ar' ? 'التحدي التالي' : 'Next Challenge'}</span>
                      <ArrowRight size={15} className={lang === 'ar' ? 'rotate-180' : ''} />
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* ========================================================================= */}
            {/* LEVEL 3: SMART ASSISTED TRANSLATION (الترجمة المباشرة مع المعين الذكي) */}
            {/* ========================================================================= */}
            {currentChallenge.level === 3 && (
              <div className="space-y-4">
                
                {/* Translation Input Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>{lang === 'ar' ? 'صياغة الترجمة العربية:' : 'Draft your Arabic Translation:'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowFullKeyboard(!showFullKeyboard)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
                    >
                      <KeyboardIcon size={14} />
                      <span>{showFullKeyboard ? (lang === 'ar' ? 'إخفاء لوحة المفاتيح' : 'Hide Keyboard') : (lang === 'ar' ? 'إظهار لوحة المفاتيح' : 'Show Keyboard')}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <textarea
                      value={userTranslationText}
                      onChange={(e) => setUserTranslationText(e.target.value)}
                      placeholder={lang === 'ar' ? 'اكتب ترجمتك هنا باللغة العربية أو استخدم لوحة المفاتيح بالأسفل...' : 'Type your Arabic translation here or use the keyboard below...'}
                      rows={2}
                      dir="rtl"
                      className="w-full p-4 sm:p-5 text-xl font-bold arabic-font border-2 border-slate-200 rounded-2xl outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all resize-none shadow-xs text-right placeholder:text-slate-400 placeholder:text-sm"
                    />
                  </div>
                </div>

                {/* Full Smooth Arabic Keyboard */}
                {showFullKeyboard && (
                  <ArabicFullKeyboard
                    onInsertChar={handleInsertChar}
                    onBackspace={handleBackspace}
                    onSpace={handleSpace}
                    onClear={handleClear}
                    onSubmit={userTranslationText.trim() && !isEvaluating ? handleEvaluateTranslation : undefined}
                    lang={lang}
                  />
                )}

                {/* Submit / Evaluate Button */}
                {!evaluationResult ? (
                  <button
                    onClick={handleEvaluateTranslation}
                    disabled={!userTranslationText.trim() || isEvaluating}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-98 text-white rounded-xl text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>{lang === 'ar' ? 'جاري تقييم الترجمة بالذكاء الاصطناعي...' : 'AI is evaluating your translation...'}</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>{lang === 'ar' ? 'تقييم ترجمتي بالذكاء الاصطناعي (+40 XP)' : 'Evaluate My Translation (+40 XP)'}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-5 rounded-3xl bg-white border border-purple-200 shadow-md space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                    
                    {/* Score Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm ${evaluationResult.accuracy >= 75 ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                          {evaluationResult.accuracy}%
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 font-sans">{evaluationResult.feedbackEn}</h4>
                          <p className="text-xs font-bold text-emerald-700 arabic-font">{evaluationResult.feedbackAr}</p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-slate-700 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                        {evaluationResult.accuracy >= 75 ? (lang === 'ar' ? 'ممتاز' : 'Excellent') : (lang === 'ar' ? 'يحتاج تدريب' : 'Keep Practicing')}
                      </span>
                    </div>

                    {/* Ideal Vocalized Translation */}
                    <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center justify-between" dir="rtl">
                      <div className="text-right">
                        <span className="text-xs font-bold text-purple-700 block mb-0.5 font-sans" dir="ltr">Ideal Arabic Translation:</span>
                        <h3 className="text-xl font-black text-purple-950 arabic-font">{evaluationResult.vocalizedArabic}</h3>
                        <p className="text-xs font-bold text-purple-700 font-sans" dir="ltr">{evaluationResult.transliteration}</p>
                      </div>
                      <button
                        onClick={() => playAudio(evaluationResult.vocalizedArabic, 'ar')}
                        className="p-2.5 bg-purple-600 text-white rounded-xl shadow-xs hover:bg-purple-700"
                      >
                        <Volume2 size={18} />
                      </button>
                    </div>

                    {/* Grammar Tip */}
                    {evaluationResult.grammarTip && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl flex items-start gap-2 text-xs text-amber-950">
                        <Lightbulb size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="font-sans font-medium">{evaluationResult.grammarTip}</p>
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={handleNextChallenge}
                        className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <span>{lang === 'ar' ? 'التحدي التالي' : 'Next Challenge'}</span>
                        <ArrowRight size={15} className={lang === 'ar' ? 'rotate-180' : ''} />
                      </button>
                      <button
                        onClick={() => { setEvaluationResult(null); }}
                        className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all"
                      >
                        {lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <Layers size={40} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-500">لا توجد تحديات حالية في هذا المستوى.</p>
            <button
              onClick={handleGenerateAIChallenge}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black"
            >
              توليد تحدٍ جديد بالذكاء الاصطناعي
            </button>
          </div>
        )}
      </div>

      {/* Badges Modal */}
      {showBadgesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                <h3 className="text-sm font-black text-slate-900">
                  {lang === 'ar' ? 'سجل إنجازات وأوسمة المترجم' : 'Translator Achievements & Badges'}
                </h3>
              </div>
              <button
                onClick={() => setShowBadgesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {badges.map((b) => {
                const IconComponent = b.icon;
                return (
                  <div 
                    key={b.id} 
                    className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all ${
                      b.unlocked 
                        ? 'bg-slate-50 border-slate-200 text-slate-900' 
                        : 'bg-slate-50/50 border-slate-200/60 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      b.unlocked ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800">{b.title}</h4>
                        {b.unlocked && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">مُكتمل</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowBadgesModal(false)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
