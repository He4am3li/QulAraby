
import React from 'react';
import { getBankQuestion } from '../data/placementQuestionBank';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Star, Zap, ChevronRight, Loader2, Volume2, 
  Mic, CheckCircle2, XCircle, BrainCircuit, Rocket, 
  Target, Sparkles, Languages, Type, Ear, BookOpen, 
  PenTool, ArrowRight, ShieldCheck, Flame, RefreshCw, ArrowUpRight,
  Award, ChevronLeft, Globe, Lightbulb, BarChart3,
  Calendar, Map, Flag, Compass, Check, Home, ClipboardList,
  UserCheck, LineChart, Stethoscope, Gem, TrendingUp, AlertCircle,
  HelpCircle, Users, GraduationCap, ClipboardCheck, Printer, Search, FileText, Download
} from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, onSnapshot, serverTimestamp, query, where } from 'firebase/firestore';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSpeech, decodeAudioData, getAI, safeJSONParse, generateContentWithRetry, speak as globalSpeak } from '../services/gemini';
import { Type as GenType } from "@google/genai";
import { downloadPlacementTestPDF } from '../services/placementTestPdf';
import { PlacementTestPreviewModal } from '../components/PlacementTestPreviewModal';

const PLACEMENT_STRINGS = {
  ar: {
    welcomeTitle: 'تحديد المستوى',
    welcomeSubTitle: 'اعرف مستواك الحقيقي في العربية',
    welcomeDesc: 'أدق اختبار لقياس مهاراتك اللغوية وفق المعايير العالمية (CEFR)',
    startBtn: 'ابدأ الاختبار',
    loadingQuestions: 'جاري تحميل واختيار الأسئلة...',
    loadingPlan: 'جاري إعداد التقرير التشخيصي التكيفي...',
    reportTitle: 'تقرير الكفاءة اللغوية التكيفي',
    reportSub: 'تحليل شامل للمهارات التواصلية والمعرفية لغير الناطقين بالعربية',
    masteryLabel: 'المستوى العام لمهاراتك التواصلية (CEFR)',
    finalScore: 'النتيجة الإجمالية:',
    outOf: 'من 80',
    viewPlan: 'تحميل التقرير التفصيلي',
    goHome: 'العودة للرئيسية',
    planTitle: 'التقرير التشخيصي وخطة التطوير اللغوي',
    enrichTitle: 'خطة إثرائية (نقاط القوة)',
    remedialTitle: 'خطة علاجية (الفجوات المحددة)',
    stratGoal: 'الهدف الاستراتيجي لتطوير مستواك',
    dashboardBtn: 'دخول المنصة',
    progress: 'المسار',
    proficiency: 'الكفاءة اللغوية',
    levelAdv: 'متقدم',
    levelInt: 'متوسط',
    levelBeg: 'مبتدئ',
    printPlan: 'طباعة التقرير',
    strategyLabel: 'الاستراتيجية المقترحة:',
    activitiesLabel: 'الأنشطة الإثرائية:',
    gapLabel: 'الفجوة التعليمية المكتشفة:',
    masteryBadge: 'المستوى',
    enrichBadge: 'إثراء',
    remedialBadge: 'علاج',
    idk: 'غير متأكد',
    coreSkills: 'المهارات التواصلية الأساسية',
    diagnosticSkills: 'المؤشرات التشخيصية الداعمة',
    speakingEvaluation: 'تقييم الطلاقة والنطق والدقة',
    skillProgress: 'السؤال {n} من {total} في مهارة {skill}'
  },
  en: {
    welcomeTitle: 'Placement Test',
    welcomeSubTitle: 'Discover Your True Arabic Level',
    welcomeDesc: 'The most accurate proficiency test aligned with Global Standards (CEFR)',
    startBtn: 'Start Assessment',
    loadingQuestions: 'Adapting questions to your level...',
    loadingPlan: 'Generating adaptive diagnostic report...',
    reportTitle: 'Linguistic Proficiency Report',
    reportSub: 'Comprehensive analysis of communicative & cognitive skills',
    masteryLabel: 'Overall Communicative Level (CEFR)',
    finalScore: 'Total Analysis:',
    outOf: 'of 80 points',
    viewPlan: 'Download Detailed Report',
    goHome: 'Back Primary Hub',
    planTitle: 'Diagnostic Report & Development Plan',
    enrichTitle: 'Enrichment Plan (Strengths)',
    remedialTitle: 'Remedial Plan (Detected Gaps)',
    stratGoal: 'Strategic Development Goal',
    dashboardBtn: 'Enter Arcade',
    progress: 'Track',
    proficiency: 'PROFICIENCY',
    levelAdv: 'Advanced',
    levelInt: 'Intermediate',
    levelBeg: 'Beginner',
    printPlan: 'Print Report',
    strategyLabel: 'Suggested Strategy:',
    activitiesLabel: 'Enrichment Activities:',
    gapLabel: 'Learning Gap Identified:',
    masteryBadge: 'Level',
    enrichBadge: 'Enrichment',
    remedialBadge: 'Remedial',
    idk: "Not Sure",
    coreSkills: 'Core Communicative Skills',
    diagnosticSkills: 'Diagnostic Support Pillars',
    speakingEvaluation: 'Fluency, Pronunciation & Accuracy',
    skillProgress: 'Question {n} of {total} in {skill}'
  }
};

const SKILLS_ORDER = [
  { id: 'letters', label: { ar: 'الحروف', en: 'Letters' }, icon: Type, color: 'from-blue-600 to-indigo-700', barColor: 'bg-blue-600', isCore: false },
  { id: 'vocab', label: { ar: 'المفردات', en: 'Vocabulary' }, icon: Target, color: 'from-amber-500 to-orange-600', barColor: 'bg-orange-500', isCore: false },
  { id: 'grammar', label: { ar: 'القواعد', en: 'Grammar' }, icon: BrainCircuit, color: 'from-purple-700 to-indigo-900', barColor: 'bg-indigo-900', isCore: false },
  { id: 'translator', label: { ar: 'الترجمة', en: 'Translation' }, icon: Languages, color: 'from-cyan-500 to-blue-600', barColor: 'bg-cyan-500', isCore: false },
  { id: 'listening', label: { ar: 'الاستماع', en: 'Listening' }, icon: Ear, color: 'from-emerald-500 to-teal-600', barColor: 'bg-emerald-500', isCore: true },
  { id: 'speaking', label: { ar: 'التحدث', en: 'Speaking' }, icon: Mic, color: 'from-rose-500 to-pink-600', barColor: 'bg-rose-500', isCore: true },
  { id: 'reading', label: { ar: 'القراءة', en: 'Reading' }, icon: BookOpen, color: 'from-indigo-500 to-purple-600', barColor: 'bg-indigo-600', isCore: true },
  { id: 'writing', label: { ar: 'الكتابة', en: 'Writing' }, icon: PenTool, color: 'from-violet-500 to-purple-700', barColor: 'bg-purple-600', isCore: true },
];

export const PlacementTest: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isTeacherOrAdmin = profile?.role === 'teacher' || profile?.role === 'admin';

  const [step, setStep] = React.useState<'welcome' | 'testing' | 'results' | 'plan'>('welcome');
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [questions, setQuestions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [retries, setRetries] = React.useState(0);
  const [currentDifficulty, setCurrentDifficulty] = React.useState(3);
  const [consecutiveCorrect, setConsecutiveCorrect] = React.useState(0);
  const [consecutiveIncorrect, setConsecutiveIncorrect] = React.useState(0);
  const [skillStats, setSkillStats] = React.useState<Record<string, { correct: number, incorrect: number, skipped: number, errors?: string[] }>>({});
  const [isAnswered, setIsAnswered] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [lang, setLang] = React.useState<'ar' | 'en'>(localStorage.getItem('hub_lang') as 'ar' | 'en' || 'ar');
  const [studyPlan, setStudyPlan] = React.useState<any>(null);
  const [isResultsPreview, setIsResultsPreview] = React.useState(false);
  const openResultsPreview = () => {
    setIsResultsPreview(true);
    setSkillStats(Object.fromEntries(SKILLS_ORDER.map((skill, i) => [skill.id, { correct: [7, 5, 6, 8, 4, 7, 6, 5][i], incorrect: 10 - [7, 5, 6, 8, 4, 7, 6, 5][i], skipped: 0 }])));
    setStep('results');
  };
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);

  // Teacher State for viewing all student reports
  const [allStudentResults, setAllStudentResults] = React.useState<any[]>([]);
  const [selectedStudentResult, setSelectedStudentResult] = React.useState<any>(null);
  const [fetchingReports, setFetchingReports] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  // Fetch student placement results if teacher/admin
  React.useEffect(() => {
    if (isTeacherOrAdmin) {
      setFetchingReports(true);
      const resultsRef = collection(db, 'placement_results');
      const q = profile?.role === 'admin'
        ? resultsRef
        : profile?.schoolId
          ? query(resultsRef, where('schoolId', '==', profile.schoolId))
          : query(resultsRef, where('userId', '==', user?.uid || ''));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const results: any[] = [];
        snapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
        results.sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0));
        setAllStudentResults(results);
        setFetchingReports(false);
      }, (err) => {
        console.error("Error fetching placement results:", err);
        setFetchingReports(false);
      });
      return () => unsubscribe();
    }
  }, [isTeacherOrAdmin]);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  const t = PLACEMENT_STRINGS[lang];

  const initAudio = () => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  };

  const sanitizeQuestion = (q: any, expectedSkill: string, subSkillName: string, idx: number) => {
    if (!q || typeof q !== 'object') {
      return getFallbackQuestion(expectedSkill, subSkillName, idx);
    }
    const skillKey = (q.skill || expectedSkill).toLowerCase();
    q.skill = skillKey;
    q.subSkill = q.subSkill || subSkillName;

    // Strict constraint: translation_instruction only allowed for 'letters' skill
    if (skillKey !== 'letters') {
      q.translation_instruction = '';
    } else if (q.translation_instruction && q.translation_instruction.length > 150) {
      q.translation_instruction = q.translation_instruction.slice(0, 150);
    }

    if (q.question && q.question.length > 250) {
      q.question = q.question.slice(0, 250);
    }

    if (!Array.isArray(q.options) || q.options.length === 0) {
      return getFallbackQuestion(expectedSkill, subSkillName, idx);
    }

    // Ensure 4 options
    while (q.options.length < 4) {
      q.options.push(`Option ${q.options.length + 1}`);
    }

    if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
      q.correctAnswer = q.options[0];
    }

    return q;
  };

  const getFallbackQuestion = (skill: string, subSkill: string, idx: number) => {
    const item = getBankQuestion(skill, idx);
    return {
      ...item,
      skill,
      subSkill,
      difficulty: Math.max(1, Math.min(10, currentDifficulty)),
      translation_instruction: ''
    };
  };

  // Each question's correct answer rotates through the four positions, with a
  // per-session offset. Never change the answer key when rearranging options.
  const answerOffsetRef = React.useRef(Math.floor(Math.random() * 4));
  const arrangeQuestion = (question: any, idx: number) => {
    const options = [...question.options];
    const correct = question.correctAnswer;
    const answerIndex = options.indexOf(correct);
    if (answerIndex < 0 || options.length !== 4) return question;
    options.splice(answerIndex, 1);
    const slot = (idx + answerOffsetRef.current) % 4;
    options.splice(slot, 0, correct);
    return { ...question, options };
  };

  // Open immediately; never wait for an external AI response before the first question.
  const startTest = () => {
    setIsResultsPreview(false);
    setRetries(0);
    setLoading(false);
    setCurrentIdx(0);
    answerOffsetRef.current = Math.floor(Math.random() * 4);
    setQuestions([arrangeQuestion(getFallbackQuestion('letters', 'Sound Recognition', 0), 0)]);
    setStep('testing');
  };

  const generateNextQuestion = async (prevCorrect: boolean, errorNature?: string, retryCount = 0) => {
    // Adaptive Logic: Adjust based on nature of error
    let nextDifficulty = currentDifficulty;
    let nextConsecutiveCorrect = prevCorrect ? consecutiveCorrect + 1 : 0;
    let nextConsecutiveIncorrect = prevCorrect ? 0 : consecutiveIncorrect + 1;

    if (nextConsecutiveCorrect >= 2) {
      nextDifficulty = Math.min(10, nextDifficulty + 1);
      nextConsecutiveCorrect = 0;
    } else if (nextConsecutiveIncorrect >= 1) {
      // Harder drop if error is fundamental (like phonetic confusion)
      const penalty = errorNature?.toLowerCase().includes('fundamental') || errorNature?.toLowerCase().includes('phonetic') ? 2 : 1;
      nextDifficulty = Math.max(1, nextDifficulty - penalty);
      nextConsecutiveIncorrect = 0;
    }

    setCurrentDifficulty(nextDifficulty);
    setConsecutiveCorrect(nextConsecutiveCorrect);
    setConsecutiveIncorrect(nextConsecutiveIncorrect);

    const nextIdx = questions.length;
    if (nextIdx >= 80) {
      setStep('results');
      return;
    }

    // Determine skill (10 questions per skill)
    const skillIdx = Math.floor(nextIdx / 10);
    const skillObj = SKILLS_ORDER[skillIdx] || SKILLS_ORDER[0];
    const skill = skillObj.id;
    const qInSkill = (nextIdx % 10) + 1;

    // Sub-skill determination logic
    let subSkill = "";
    if (skill === 'letters') {
      if (qInSkill <= 2) subSkill = "Sound Recognition";
      else if (qInSkill <= 4) subSkill = "Letter Shape Recognition";
      else if (qInSkill <= 6) subSkill = "Letter Position in Word";
      else if (qInSkill <= 8) subSkill = "Fill Missing Letter";
      else subSkill = "Simple Word Formation";
    } else if (skill === 'vocab') {
      if (qInSkill <= 2) subSkill = "Word Meaning";
      else if (qInSkill <= 4) subSkill = "Word in Context";
      else if (qInSkill <= 6) subSkill = "Synonyms / Antonyms";
      else if (qInSkill <= 8) subSkill = "Appropriate Word Choice";
      else subSkill = "Semantic Domain / Odd One Out";
    } else if (skill === 'grammar') {
      if (qInSkill <= 2) subSkill = "Verb Conjugation";
      else if (qInSkill <= 3) subSkill = "Pronouns";
      else if (qInSkill <= 4) subSkill = "Tenses";
      else if (qInSkill <= 6) subSkill = "Sentence Structure";
      else if (qInSkill === 7) subSkill = "I'rab: Selecting Correct Form";
      else if (qInSkill === 8) subSkill = "I'rab: Identifying Parsing Type";
      else if (qInSkill === 9) subSkill = "I'rab: Application in Sentence";
      else subSkill = "Complex Tarakib (Numbers/Counting)";
    } else if (skill === 'translator') {
      if (qInSkill <= 2) subSkill = "Word Translation";
      else if (qInSkill <= 4) subSkill = "Simple Sentence Translation";
      else if (qInSkill <= 6) subSkill = "Translation Choice Analysis";
      else if (qInSkill <= 8) subSkill = "Contextual Translation";
      else subSkill = "Paraphrasing / Meaning Transfer";
    } else {
      subSkill = "Communicative Skill Competency";
    }

    // Use a complete local bank so network latency and API quota never repeat
    // two fallback questions or stall the learner between questions.
    const nextQuestion = arrangeQuestion(getFallbackQuestion(skill, subSkill, nextIdx), nextIdx);
    setQuestions(prev => [...prev, nextQuestion]);
    setCurrentIdx(nextIdx);
    setIsAnswered(false);
    setSelectedOption(null);
    return;

    try {
      const schema = {
        type: GenType.OBJECT,
        properties: {
          skill: { type: GenType.STRING },
          subSkill: { type: GenType.STRING },
          difficulty: { type: GenType.INTEGER, description: "1 to 10" },
          question: { type: GenType.STRING },
          translation_instruction: { type: GenType.STRING, description: "ONLY for Letters skill. MUST BE EMPTY STRING for all other skills (translator, vocab, grammar)." },
          options: { type: GenType.ARRAY, items: { type: GenType.STRING } },
          correctAnswer: { type: GenType.STRING },
          audioPrompt: { type: GenType.STRING },
          natureOfWrongOptions: { 
            type: GenType.ARRAY, 
            items: { 
              type: GenType.OBJECT,
              properties: {
                option: { type: GenType.STRING },
                diagnosticIndication: { type: GenType.STRING }
              }
            } 
          }
        },
        required: ["skill", "difficulty", "question", "options", "correctAnswer", "subSkill"]
      };
      
      const response = await Promise.race([generateContentWithRetry({
        model: "gemini-3.8-flash",
        contents: `Generate diagnostic question #${nextIdx + 1} for an Arabic Placement Test (Non-Native).
        
        CONTEXT:
        - SKILL: ${skill}. 
        - SUB-SKILL: ${subSkill}.
        - DIFFICULTY: ${nextDifficulty}/10 (CEFR Mapping: 1-2=A1, 3-4=A2, 5-6=B1, 7-8=B2).
        
        MANDATORY TEMPLATES & RULES:
        - You act as a dynamic question generator.
        - LETTERS (10 qs): Sound Rec, Shape, Position, Fill-blank, Word Formation.
        - VOCAB (10 qs): Meaning, Context, Syn/Ant, Choice, Semantic Domain.
        - GRAMMAR (10 qs): Verb Conjugation, Pronouns, Tenses, Syntax, I'rab (Analysis), Counting/Tarakib.
        - TRANSLATION (10 qs): Word, Sentence, Choice, Contextual, Paraphrase. (STRICTLY WRITTEN, NO AUDIO).
        - COMMUNICATIVE (Listening, Reading, Writing, Speaking): Follow CEFR Can-do statements for A1-B2 levels.
        
        CRITICAL FIELD RULES:
        1. 'translation_instruction': MUST BE EMPTY string ("") for 'translator', 'vocab', 'grammar', and communicative skills! DO NOT fill 'translation_instruction' for 'translator' skill.
        2. Keep 'question' text clear and concise under 150 characters.
        3. OPTIONS: Exactly 4 distinct options. One valid answer in 'correctAnswer'.
        4. Return JSON matching schema.`,
        config: { responseMimeType: "application/json", responseSchema: schema }
      }), new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Question generation timed out")), 6000))]);
      
      const rawQ = safeJSONParse(response.text, {});
      const nextQ = sanitizeQuestion(rawQ, skill, subSkill, nextIdx);
      
      setQuestions(prev => [...prev, arrangeQuestion(nextQ, nextIdx)]);
      setCurrentIdx(nextIdx);
      setIsAnswered(false);
      setSelectedOption(null);
    } catch (e) {
      console.error("Error generating next question:", e);
      // Keep the assessment usable when the model is slow or unavailable.
        // Fallback question gracefully
        const fallbackQ = getFallbackQuestion(skill, subSkill, nextIdx);
        setQuestions(prev => [...prev, arrangeQuestion(fallbackQ, nextIdx)]);
        setCurrentIdx(nextIdx);
        setIsAnswered(false);
        setSelectedOption(null);
    }
  };

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    const currentQ = questions[currentIdx];
    setSelectedOption(option);
    setIsAnswered(true);
    
    const isCorrect = option === currentQ.correctAnswer;
    const isSkipped = option === 'IDK_SKIP';

    // Find diagnostic nature if incorrect
    const errorMeta = !isCorrect && !isSkipped ? currentQ.natureOfWrongOptions?.find((n: any) => n.option === option) : null;
    
    setSkillStats(prev => {
      const current = prev[currentQ.skill.toLowerCase()] || { correct: 0, incorrect: 0, skipped: 0, errors: [] };
      return {
        ...prev,
        [currentQ.skill.toLowerCase()]: {
          correct: current.correct + (isCorrect ? 1 : 0),
          incorrect: current.incorrect + (!isCorrect && !isSkipped ? 1 : 0),
          skipped: current.skipped + (isSkipped ? 1 : 0),
          errors: errorMeta ? [...(current.errors || []), errorMeta.diagnosticIndication] : (current.errors || [])
        }
      };
    });

    // Smooth transition
    setTimeout(() => {
      generateNextQuestion(isCorrect, errorMeta?.diagnosticIndication);
    }, 600);
  };

  const playSound = (type: 'success' | 'click') => {
    // Basic beep or visual pop could go here
  };

  const generatePlan = async () => {
    setLoading(true);
    try {
      const ai = getAI();
      const schema = {
        type: GenType.OBJECT,
        properties: {
          cefrLevels: {
            type: GenType.OBJECT,
            properties: {
              listening: { type: GenType.STRING },
              speaking: { type: GenType.STRING },
              reading: { type: GenType.STRING },
              writing: { type: GenType.STRING }
            }
          },
          speakingEvaluation: {
            type: GenType.OBJECT,
            properties: {
              fluency: { type: GenType.STRING },
              pronunciation: { type: GenType.STRING },
              accuracy: { type: GenType.STRING }
            }
          },
          diagnosticAnalysis: { type: GenType.ARRAY, items: { type: GenType.STRING } },
          learningGaps: { type: GenType.ARRAY, items: { type: GenType.STRING } },
          enrichmentPlan: {
            type: GenType.ARRAY,
            items: {
              type: GenType.OBJECT,
              properties: {
                skillName: { type: GenType.STRING },
                strategy: { type: GenType.STRING },
                activities: { type: GenType.ARRAY, items: { type: GenType.STRING } }
              }
            }
          },
          remedialPlan: {
            type: GenType.ARRAY,
            items: {
              type: GenType.OBJECT,
              properties: {
                skillName: { type: GenType.STRING },
                gapAnalysis: { type: GenType.STRING },
                strategy: { type: GenType.STRING },
                activities: { type: GenType.ARRAY, items: { type: GenType.STRING } }
              }
            }
          },
          strategicGoal: { type: GenType.STRING }
        },
        required: ["cefrLevels", "diagnosticAnalysis", "learningGaps", "enrichmentPlan", "remedialPlan", "strategicGoal"]
      };

      const systemPrompt = lang === 'ar' 
        ? `أنت خبير تقييم لغوي عالمي متخصص في إطار CEFR. بناءً على هذه النتائج التشخيصية للأسئلة الثمانين: ${JSON.stringify(skillStats)}،
           قم بإعداد تقرير تشخيصي تكيفي كامل باللغة العربية.
           المتطلبات الإجبارية:
           1. حدد مستوى CEFR (A1, A2, B1, B2) للمهارات التواصلية (الاستماع، التحدث، القراءة، الكتابة) فقط بناءً على "بيانات Can-do".
           2. حلل المحاور الداعمة (الحروف، المفردات، القواعد، الترجمة) كمؤشرات تشخيصية فقط، موضحاً نقاط القوة والضعف في كل مهارة فرعية تم اختبارها.
           3. قدم تقييم لمهارة التحدث (الطلاقة، النطق، الدقة).
           4. حدد الفجوات التعليمية بدقة لكل مهارة فرعية.
           5. ضع خطة علاجية للفجوات وخطة إثرائية لنقاط القوة باستخدام أنشطة عملية.`
        : `Global Language Assessment Specialist (CEFR Expert). Analyze these 80 diagnostic results: ${JSON.stringify(skillStats)}.
           Prepare a full adaptive diagnostic report in English.
           MANDATORY REQUIREMENTS:
           1. Determine CEFR level (A1, A2, B1, B2) for CORE COMMUNICATIVE SKILLS (Listening, Speaking, Reading, Writing) using Can-do statements.
           2. Analyze Supportive Pillars (Letters, Vocab, Grammar, Translation) as DIAGNOSTIC INDICATORS only.
           3. Detail strengths/weaknesses across specific sub-skills (e.g., Verb Conjugation, Contextual Translation).
           4. Provide Speaking Evaluation (Fluency, Pronunciation, Accuracy).
           5. Create precise Enrichment & Remedial tracks with actionable activities.`;

      const response = await generateContentWithRetry({
        model: "gemini-3.8-flash",
        contents: systemPrompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
      });

      const planData = safeJSONParse(response.text);
      setStudyPlan(planData);

      // Save to Firestore
      if (user && planData) {
        try {
          const totalScoreVal = Object.keys(skillStats).reduce((acc: number, key: string) => acc + (skillStats[key]?.correct || 0), 0);
          await setDoc(doc(db, 'placement_results', `${user.uid}_${Date.now()}`), {
            userId: user.uid,
            studentName: user.displayName || profile?.displayName || user.email?.split('@')[0] || 'طالب',
            studentEmail: user.email || '',
            totalScore: totalScoreVal,
            skillStats,
            studyPlan: planData,
            ...(profile?.schoolId ? { schoolId: profile.schoolId } : {}),
            completedAt: serverTimestamp()
          });
        } catch (err) {
          console.error("Error saving placement result:", err);
        }
      }

      if (isTeacherOrAdmin) {
        setStep('plan');
      } else {
        setStep('results');
      }
    } catch (e) {
      console.error("Report generation failed:", e);
      alert("Error generating report.");
    } finally {
      setLoading(false);
    }
  };

  const speak = async (text: string) => {
    await globalSpeak(text, 'ar');
  };

  const totalScore: number = Object.keys(skillStats).reduce((acc: number, key: string) => acc + (skillStats[key]?.correct || 0), 0);

  const getLevelBadge = (score: number) => {
    if (score >= 8) return { label: t.levelAdv, class: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    if (score >= 4) return { label: t.levelInt, class: 'bg-blue-50 text-blue-600 border-blue-100' };
    return { label: t.levelBeg, class: 'bg-slate-50 text-slate-400 border-slate-100' };
  };

  return (
    <div className={`w-full flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Brand Header */}
      <PageHeader
        title={
          isTeacherOrAdmin
            ? (lang === 'ar' ? 'مستويات الطلاب' : 'Student Levels')
            : (step === 'plan' ? t.planTitle : (lang === 'ar' ? 'تحديد المستوى' : 'Placement Test'))
        }
        icon={TrendingUp}
        lang={lang}
        onToggle={() => {
          const next = lang === 'ar' ? 'en' : 'ar';
          setLang(next);
          localStorage.setItem('hub_lang', next);
          window.dispatchEvent(new Event('langChanged'));
          if (step === 'plan' && studyPlan) {
            setStudyPlan(null);
            setStep('results');
          }
        }}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.05);
            border-radius: 10px;
          }
          .balance-text {
            text-wrap: balance;
          }
        `}</style>
        <div className="noor-noise" />
        {/* Magical Ethereal Background - "Noor" Atmosphere */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           {/* Soft Moving Blobs */}
           <motion.div 
             animate={{ 
               x: [0, 50, 0], 
               y: [0, 30, 0],
               scale: [1, 1.1, 1],
               rotate: [0, 5, 0]
             }} 
             transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-100/30 rounded-full blur-[120px] -z-10" 
           />
           <motion.div 
             animate={{ 
               x: [0, -40, 0], 
               y: [0, 60, 0],
               scale: [1, 1.2, 1],
               rotate: [0, -3, 0]
             }} 
             transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
             className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] bg-indigo-50/40 rounded-full blur-[100px] -z-10" 
           />
           <motion.div 
             animate={{ 
               opacity: [0.2, 0.4, 0.2],
               scale: [0.8, 1, 0.8]
             }} 
             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-emerald-50/20 rounded-full blur-[80px] -z-10" 
           />
           
           {/* Subtle Grid Pattern Overlay */}
           <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />

           {/* Magical Floating Specks */}
           {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 100 }}
                animate={{ 
                   opacity: [0, 0.3, 0],
                   y: [100, -100],
                   x: Math.sin(i) * 50
                }}
                transition={{ 
                   duration: 10 + i * 2, 
                   repeat: Infinity, 
                   delay: i * 1.5,
                   ease: "linear"
                }}
                className="absolute w-1 h-1 bg-blue-400 rounded-full blur-[1px]"
                style={{
                   left: `${15 + i * 15}%`,
                   top: '60%'
                }}
              />
           ))}
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-start relative z-10 overflow-y-auto custom-scroll w-full">
          
          {/* Teacher Student Reports & Levels View */}
          {isTeacherOrAdmin ? (
            <div className="w-full max-w-6xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-center">
                <div className="text-center flex flex-col items-center justify-center">
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 arabic-font">
                    {lang === 'ar' ? 'مستويات الطلاب والتقارير العلاجية والإثرائية' : 'Student Levels & Remedial Reports'}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold arabic-font mt-1.5 max-w-2xl mx-auto">
                    {lang === 'ar' ? 'متابعة تفصيلية لنتائج اختبار تحديد المستوى والخطط العلاجية والإثرائية المخصصة لكل طالب' : 'Detailed individual student diagnostic results and personalized plans'}
                  </p>
                </div>

                {/* Exclusive Teacher Action: Preview Full Placement Test */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setShowPreviewModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white rounded-2xl text-xs font-black arabic-font flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer border border-blue-500/20"
                    title={lang === 'ar' ? 'معاينة ورقة اختبار تحديد المستوى الشامل' : 'Preview full placement test paper'}
                  >
                    <FileText size={18} className="text-amber-300" />
                    <span>{lang === 'ar' ? 'معاينة اختبار تحديد المستوى' : 'Preview Placement Test'}</span>
                  </button>
                </div>

                {selectedStudentResult && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button 
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-black arabic-font flex items-center gap-2 transition-all border border-blue-200"
                    >
                      <Printer size={16} />
                      {lang === 'ar' ? 'طباعة التقرير' : 'Print Report'}
                    </button>
                    <button 
                      onClick={() => setSelectedStudentResult(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black arabic-font flex items-center gap-2 transition-all"
                    >
                      <ChevronLeft size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
                      {lang === 'ar' ? 'العودة لكافة نتائج الطلاب' : 'Back to All Students'}
                    </button>
                  </div>
                )}
              </div>

              {!selectedStudentResult && (
                <>
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black border border-blue-100 shrink-0">
                        <Users size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{lang === 'ar' ? 'إجمالي الطلاب' : 'Total Students'}</span>
                        <span className="text-2xl font-black text-slate-900">{allStudentResults.length}</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black border border-emerald-100 shrink-0">
                        <BarChart3 size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{lang === 'ar' ? 'متوسط التحصيل' : 'Average Score'}</span>
                        <span className="text-2xl font-black text-slate-900">
                          {allStudentResults.length > 0 
                            ? Math.round(allStudentResults.reduce((acc, r) => acc + (r.totalScore || 0), 0) / allStudentResults.length) 
                            : 0} / 80
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-black border border-rose-100 shrink-0">
                        <Stethoscope size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{lang === 'ar' ? 'خطط علاجية' : 'Remedial Plans'}</span>
                        <span className="text-2xl font-black text-rose-600">
                          {allStudentResults.filter(r => (r.totalScore || 0) < 50).length}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-black border border-amber-100 shrink-0">
                        <Gem size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{lang === 'ar' ? 'خطط إثرائية' : 'Enrichment Plans'}</span>
                        <span className="text-2xl font-black text-amber-600">
                          {allStudentResults.filter(r => (r.totalScore || 0) >= 50).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Search Bar for Searching Student by Name */}
                  <div className="flex justify-center w-full">
                    <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 w-full max-w-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                      <Search size={18} className="text-slate-400 shrink-0" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={lang === 'ar' ? 'البحث عن طالب باسمه أو بريده الإلكتروني...' : 'Search student by name or email...'}
                        className="w-full bg-transparent border-none text-xs font-black text-slate-800 placeholder-slate-400 focus:outline-none arabic-font"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')} 
                          className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-500 font-bold transition-colors"
                          title={lang === 'ar' ? 'مسح البحث' : 'Clear search'}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {selectedStudentResult ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg space-y-8 animate-in fade-in">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 border-slate-100 gap-4">
                    <div>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase border border-blue-100">
                        {lang === 'ar' ? 'تقرير طالب تفصيلي' : 'Student Report'}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 arabic-font mt-2">
                        {selectedStudentResult.studentName}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold">{selectedStudentResult.studentEmail || 'طالب'}</p>
                    </div>
                    <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t.finalScore}</span>
                      <div className="text-3xl font-black text-blue-600">{selectedStudentResult.totalScore} / 80</div>
                    </div>
                  </div>

                  {/* CEFR Levels */}
                  {selectedStudentResult.studyPlan?.cefrLevels && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'مستويات Mapped CEFR' : 'CEFR Levels'}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(selectedStudentResult.studyPlan.cefrLevels).map(([skill, lvl]: any) => (
                          <div key={skill} className="bg-blue-50/50 p-4 rounded-2xl text-center border border-blue-100">
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">{skill}</span>
                            <span className="text-2xl font-black text-blue-700">{lvl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Remedial & Enrichment Plans */}
                  {selectedStudentResult.studyPlan && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                      {/* Remedial Plan */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                            <Stethoscope size={18} />
                          </div>
                          <h4 className="text-lg font-black text-rose-700 arabic-font">{t.remedialTitle}</h4>
                        </div>
                        {selectedStudentResult.studyPlan.remedialPlan?.map((item: any, i: number) => (
                          <div key={i} className="p-5 bg-white rounded-2xl border-r-[6px] border-rose-500 border border-slate-100 shadow-sm space-y-3">
                            <h5 className="font-black text-slate-800 text-sm arabic-font">{item.skillName}</h5>
                            <p className="text-xs text-slate-600 font-bold arabic-font bg-slate-50 p-3 rounded-xl">{item.strategy}</p>
                            <div className="space-y-1">
                              {item.activities?.map((act: string, idx: number) => (
                                <div key={idx} className="text-xs text-rose-900 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/50 flex items-center gap-2 font-bold arabic-font">
                                  <CheckCircle2 size={14} className="text-rose-500 shrink-0" />
                                  <span>{act}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Enrichment Plan */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                            <Gem size={18} />
                          </div>
                          <h4 className="text-lg font-black text-emerald-700 arabic-font">{t.enrichTitle}</h4>
                        </div>
                        {selectedStudentResult.studyPlan.enrichmentPlan?.map((item: any, i: number) => (
                          <div key={i} className="p-5 bg-white rounded-2xl border-r-[6px] border-emerald-500 border border-slate-100 shadow-sm space-y-3">
                            <h5 className="font-black text-slate-800 text-sm arabic-font">{item.skillName}</h5>
                            <p className="text-xs text-slate-600 font-bold arabic-font bg-slate-50 p-3 rounded-xl">{item.strategy}</p>
                            <div className="space-y-1">
                              {item.activities?.map((act: string, idx: number) => (
                                <div key={idx} className="text-xs text-emerald-900 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50 flex items-center gap-2 font-bold arabic-font">
                                  <TrendingUp size={14} className="text-emerald-500 shrink-0" />
                                  <span>{act}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {fetchingReports ? (
                    <div className="py-20 flex justify-center">
                      <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                  ) : allStudentResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allStudentResults
                        .filter(res => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return (res.studentName || '').toLowerCase().includes(q) || (res.studentEmail || '').toLowerCase().includes(q);
                        })
                        .map((res) => (
                          <div 
                            key={res.id} 
                            onClick={() => setSelectedStudentResult(res)}
                            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-black text-slate-900 arabic-font text-base group-hover:text-blue-600 transition-colors">
                                  {res.studentName}
                                </h3>
                                <p className="text-xs text-slate-400 font-bold mt-1">{res.studentEmail || 'طالب'}</p>
                              </div>
                              <div className="w-12 h-12 bg-blue-50 text-blue-600 font-black rounded-2xl flex items-center justify-center text-sm shadow-inner border border-blue-100 shrink-0">
                                {res.totalScore}/80
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100 font-bold">
                              <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 size={14} />
                                {lang === 'ar' ? 'الخطة العلاجية جاهزة' : 'Plan Ready'}
                              </span>
                              <span>
                                {res.completedAt?.seconds 
                                  ? new Date(res.completedAt.seconds * 1000).toLocaleDateString('ar-EG')
                                  : 'مؤخراً'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="bg-white p-16 rounded-3xl text-center border border-slate-200 space-y-3">
                      <Users size={40} className="mx-auto text-slate-300" />
                      <h3 className="text-lg font-black text-slate-700 arabic-font">
                        {lang === 'ar' ? 'لا توجد تقارير طلاب حتى الآن' : 'No Student Reports Yet'}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold arabic-font">
                        {lang === 'ar' ? 'عندما ينهي أي طالب اختبار تحديد المستوى، ستظهر نتائجه وخطته العلاجية والإثرائية هنا تلقائياً.' : 'Results will appear automatically here once students complete the test.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
          
          {step === 'welcome' && (
            <div className="w-full max-w-2xl space-y-6 animate-in zoom-in-95 fade-in duration-700 text-center relative z-10">
               <div className="p-10 bg-white/70 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(37,99,235,0.05)] border border-white/50 relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500/20 via-blue-600/30 to-blue-500/20" />
                 
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <Target size={32} />
                 </div>

                 <h2 className="text-3xl font-black text-slate-800 mb-3 arabic-font">{t.welcomeSubTitle}</h2>
                 <p className="text-slate-400 text-sm font-bold arabic-font leading-relaxed mb-8 px-8">{t.welcomeDesc}</p>
                 
                 <div className="mb-10 text-center">
                    <div className="flex flex-wrap justify-center gap-4">
                      {SKILLS_ORDER.map((skill) => (
                        <div key={skill.id} className="group/icon flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 group-hover/icon:text-blue-500 group-hover/icon:bg-white transition-all cursor-default shadow-sm">
                            <skill.icon size={22} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 arabic-font">{lang === 'ar' ? skill.label.ar : skill.label.en}</span>
                        </div>
                      ))}
                    </div>
                 </div>

                 <button type="button" onClick={openResultsPreview} className="mb-4 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs arabic-font hover:bg-slate-50">{lang === 'ar' ? 'معاينة تصميم النتائج دون أداء الاختبار' : 'Preview results layout without taking the test'}</button>
                 <div className="flex flex-wrap items-center justify-center gap-4">
                   <button 
                    onClick={startTest} 
                    className="group relative px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm transition-all overflow-hidden border border-white/5 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 flex items-center justify-center px-4">
                      <span className="arabic-font">{t.startBtn}</span>
                    </span>
                  </button>

                  {isTeacherOrAdmin && (
                    <button
                      onClick={() => setShowPreviewModal(true)}
                      className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-black text-sm border border-slate-200/80 shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2.5"
                    >
                      <FileText size={18} className="text-blue-600" />
                      <span className="arabic-font">{lang === 'ar' ? 'معاينة اختبار تحديد المستوى' : 'Preview Placement Test'}</span>
                    </button>
                  )}
                 </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-6 animate-in fade-in">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-[#2563eb] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-[#2563eb]">
                   <GraduationCap size={24} />
                </div>
              </div>
              <p className="font-black text-slate-400 text-[10px] uppercase tracking-widest arabic-font animate-pulse">{step === 'results' ? t.loadingPlan : t.loadingQuestions}</p>
            </div>
          )}

          {step === 'testing' && questions[currentIdx] && (
            <div className="w-full max-w-2xl space-y-6 animate-in slide-in-from-bottom-4 flex flex-col items-center relative">
              
              {/* Celestial Constellation Progress - Repositioned ABOVE the card */}
              <div className="w-full flex flex-col items-center gap-4 pointer-events-none no-print mb-2">
                 <div className="flex items-center gap-1.5 md:gap-3">
                    {SKILLS_ORDER.map((skill, idx) => {
                       const pillarIndex = Math.floor(currentIdx / 10);
                       const isPast = pillarIndex > idx;
                       const isCurrent = pillarIndex === idx;

                       return (
                          <React.Fragment key={skill.id}>
                             {idx > 0 && (
                                <div className="w-3 md:w-5 h-[1px] bg-slate-200/50 overflow-hidden relative">
                                   {isPast && (
                                      <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: '100%' }} 
                                        className="absolute inset-x-0 inset-y-0 bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" 
                                      />
                                   )}
                                   {isCurrent && (
                                      <motion.div 
                                        animate={{ x: ['-100%', '100%'] }} 
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-blue-400 to-transparent" 
                                      />
                                   )}
                                </div>
                             )}
                             <motion.div 
                                animate={isCurrent ? { 
                                  scale: [1, 1.15, 1], 
                                  boxShadow: [
                                    '0 0 10px rgba(37,99,235,0.1)', 
                                    '0 0 30px rgba(37,99,235,0.6), 0 0 15px rgba(255,255,255,0.8)', 
                                    '0 0 10px rgba(37,99,235,0.1)'
                                  ]
                                } : { scale: 1 }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border transition-all duration-1000 relative
                                   ${isPast ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 
                                     isCurrent ? 'bg-white border-blue-600 text-blue-600 ring-8 ring-blue-50/50' : 
                                     'bg-white border-slate-100 text-slate-200'}
                                `}
                             >
                                {isCurrent && (
                                   <motion.div 
                                      animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.4, 1] }}
                                      transition={{ repeat: Infinity, duration: 2 }}
                                      className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl -z-10"
                                   />
                                )}
                                {React.createElement(skill.icon, { size: isCurrent ? 16 : 14, className: "relative z-10" })}
                                
                                {isCurrent && (
                                   <svg className="absolute inset-0 w-full h-full -rotate-90 z-20">
                                      <motion.circle 
                                         cx="50%" cy="50%" r="46%"
                                         fill="transparent"
                                         stroke="currentColor"
                                         strokeWidth="2.5"
                                         strokeDasharray="100"
                                         initial={{ strokeDashoffset: 100 }}
                                         animate={{ strokeDashoffset: 100 - (((currentIdx % 10) + 1) * 10) }}
                                         transition={{ type: 'spring', stiffness: 40 }}
                                         className="opacity-40"
                                      />
                                   </svg>
                                )}
                             </motion.div>
                          </React.Fragment>
                       );
                    })}
                 </div>

                 {/* Cinematic Flow Line - Radiant and Expanding */}
                 <div className="relative group">
                    {/* The Background Track */}
                    <div className="w-48 md:w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                       {/* Subtle Background Glow */}
                       <div className="absolute inset-0 bg-blue-50/30" />
                       
                       {/* The Progress Line */}
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${((currentIdx % 10) + 1) * 10}%` }}
                          transition={{ type: 'spring', stiffness: 45, damping: 20 }}
                          className="h-full bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-500 rounded-full relative"
                          style={{
                             boxShadow: '0 0 15px rgba(37,99,235,0.5), 0 0 5px rgba(255,255,255,0.4)',
                          }}
                       >
                          {/* Inner Shimmer Movement */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                          
                          {/* The "Noor" Tip - A cinematic glowing head */}
                          <motion.div 
                             animate={{ 
                                opacity: [0.7, 1, 0.7],
                                scale: [1, 1.3, 1],
                                boxShadow: [
                                   '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(37,99,235,0.6)',
                                   '0 0 20px rgba(255,255,255,1), 0 0 40px rgba(37,99,235,0.8)',
                                   '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(37,99,235,0.6)'
                                ]
                             }}
                             transition={{ repeat: Infinity, duration: 2 }}
                             className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full z-10"
                          />
                          
                          {/* Cinematic Trail/Halo */}
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-blue-400/20 rounded-full blur-xl -z-10" />
                       </motion.div>
                    </div>

                    {/* Question Count Floating Indicator (Very Sub-Progress) */}
                    <div className="absolute -bottom-6 left-0 right-0 flex justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                       <span className="text-[8px] font-black tracking-[0.3em] text-slate-400 uppercase">
                          {((currentIdx % 10) + 1)} / 10
                       </span>
                    </div>
                 </div>
              </div>
              
              {/* Question Card */}
              <div className={`bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_32px_64px_rgba(37,99,235,0.08)] border border-white/50 p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden transition-all h-[460px] w-full max-w-2xl justify-center no-print ${isAnswered ? 'scale-[0.98] opacity-60' : 'scale-100'}`}>
                
                <div className="flex-grow-0 w-full flex flex-col items-center justify-center py-2">
                  <h3
                    dir="ltr"
                    className="text-base md:text-lg font-bold text-slate-800 mb-4 leading-relaxed max-w-xl w-full text-center"
                  >
                    {questions[currentIdx].questionEn || questions[currentIdx].question}
                  </h3>

                  {questions[currentIdx].audioPrompt && questions[currentIdx].skill !== 'translator' && (
                    <div className="mb-6">
                      <button 
                        onClick={() => speak(questions[currentIdx].audioPrompt)} 
                        className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-100 hover:scale-110 transition-all active:scale-95 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <Volume2 size={24} className="relative z-10" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="relative w-full max-w-xl pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {questions[currentIdx].options.map((opt: string, i: number) => (
                      <button 
                        key={i} 
                        onClick={() => handleAnswer(opt)} 
                        disabled={isAnswered} 
                        className={`p-6 rounded-[1.5rem] border font-bold text-base transition-all shadow-sm flex items-center justify-center min-h-[80px] arabic-font
                          ${selectedOption === opt 
                            ? 'bg-slate-900 border-slate-900 text-white transform scale-[1.02] shadow-xl' 
                            : 'bg-white/50 backdrop-blur-sm border-white/60 hover:border-blue-400 hover:bg-white/80 text-slate-700 active:scale-95'
                          }
                        `}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {/* "Not Sure" Centered magically */}
                  <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
                    <button
                      onClick={() => handleAnswer('IDK_SKIP')}
                      disabled={isAnswered}
                      className={`pointer-events-auto w-16 h-16 rounded-full border-4 border-white/80 shadow-2xl flex flex-col items-center justify-center transition-all duration-300 active:scale-90 group
                        ${isAnswered 
                          ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-50' 
                          : 'bg-gradient-to-br from-blue-500 via-indigo-600 to-emerald-500 text-white hover:scale-110 magical-glow'
                        }
                      `}
                    >
                      <HelpCircle size={18} />
                      <span className="text-[8px] font-black arabic-font leading-none mt-1">{t.idk}</span>
                    </button>
                  </div>

                  <div className="mt-8 md:hidden flex justify-center">
                    <button onClick={() => handleAnswer('IDK_SKIP')} className="px-6 py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-black arabic-font border border-slate-100">{t.idk}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'results' && (
            <div className="w-full h-full min-h-0 max-w-6xl mx-auto p-3 md:p-5 flex flex-col gap-3 overflow-hidden no-print" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="flex items-center justify-between gap-3 shrink-0">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 arabic-font">{lang === 'ar' ? 'نتيجة تحديد المستوى' : 'Placement Results'}</h2>
                  <p className="text-[11px] text-slate-500 font-semibold arabic-font">{lang === 'ar' ? 'ملخص المهارات والنتيجة' : 'Skills and score overview'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isResultsPreview && <span className="rounded-lg bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 text-[10px] font-bold">{lang === 'ar' ? 'معاينة فقط' : 'Preview only'}</span>}
                  <button type="button" onClick={() => navigate('/')} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 arabic-font">{t.goHome}</button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 shrink-0">
                {SKILLS_ORDER.filter(s => s.isCore).map(skill => {
                  const score = skillStats[skill.id]?.correct || 0;
                  return <div key={skill.id} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 md:py-4 min-w-0">
                    <div className="flex justify-between items-center gap-2 mb-3"><span className="text-xs md:text-sm font-extrabold text-slate-800 arabic-font">{lang === 'ar' ? skill.label.ar : skill.label.en}</span><skill.icon size={17} className="text-slate-500" /></div>
                    <div className="flex items-baseline justify-between gap-2 mb-2"><span className="font-black text-xl text-slate-900" dir="ltr">{score}<span className="text-xs text-slate-400">/10</span></span><span className="text-[10px] text-slate-500 arabic-font">{Math.round(score * 10)}%</span></div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${skill.barColor}`} style={{width:`${score * 10}%`}} /></div>
                  </div>;
                })}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3 md:p-4 shrink-0">
                <h3 className="text-xs font-extrabold text-slate-700 mb-3 arabic-font">{t.diagnosticSkills}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SKILLS_ORDER.filter(s => !s.isCore).map(skill => {
                    const score = skillStats[skill.id]?.correct || 0;
                    return <div key={skill.id} className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 min-w-0">
                      <div className="flex justify-between items-center gap-1 mb-2"><span className="text-xs font-bold text-slate-700 arabic-font">{lang === 'ar' ? skill.label.ar : skill.label.en}</span><span className="text-xs font-black text-slate-700" dir="ltr">{score}/10</span></div>
                      <div className="h-1 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full ${skill.barColor}`} style={{width:`${score * 10}%`}} /></div>
                    </div>;
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900 text-white px-4 md:px-6 py-3 md:py-4 shrink-0">
                <div><div className="text-xs font-bold text-slate-300 arabic-font">{lang === 'ar' ? 'النتيجة الإجمالية' : 'Total score'}</div><div className="text-xl md:text-2xl font-black" dir="ltr">{totalScore}<span className="text-sm text-slate-400"> / 80</span></div></div>
                <div className="text-2xl md:text-3xl font-black tabular-nums" dir="ltr">{Math.round(totalScore / 80 * 100)}%</div>
              </div>
              <p className="text-[10px] text-slate-500 arabic-font leading-snug">{lang === 'ar' ? 'هذه نتيجة الأسئلة الحالية، وليست تصنيفًا معتمدًا وفق CEFR. يتطلب تحديد مستوى التحدث والكتابة تقييمًا مباشرًا للأداء.' : 'This score is not a validated CEFR classification. Speaking and writing require direct performance assessment.'}</p>
            </div>
          )}

          {step === 'plan' && studyPlan && (
            <div className="w-full animate-in slide-in-from-bottom-10 fade-in duration-1000 overflow-y-auto custom-scroll p-4 space-y-8 pb-20 max-w-6xl mx-auto">
               
               {/* Document Header with Platform Logo */}
               <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white/60 shadow-sm print:shadow-none print:border-slate-200">
                 <div className="flex items-center gap-5">
                   <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 p-1.5 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                     <img src="/Logo.png" alt="شعار منصة قُل" className="w-full h-full object-contain filter drop-shadow-sm" />
                   </div>
                   <div>
                     <h1 className="text-2xl md:text-3xl font-black text-slate-900 arabic-font">منصة قُل | الخطة العلاجية والتشخيصية</h1>
                     <p className="text-xs md:text-sm font-bold text-blue-600 arabic-font">تقرير المستوى والمهارات المكتسبة وخطط التطوير المخصصة</p>
                   </div>
                 </div>
                 <div className="text-left hidden sm:block" dir="ltr">
                   <span className="text-xs font-black text-slate-500 tracking-widest block uppercase">QUL Arabic Learning Platform</span>
                   <span className="text-[10px] font-bold text-slate-400 block font-mono">Comprehensive Diagnostic Assessment</span>
                 </div>
               </div>

               {/* Strategic CEFR Header */}
               <div className="bg-white/70 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/50 shadow-[0_32px_64px_rgba(37,99,235,0.08)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-blue-500/20" />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 arabic-font uppercase mb-8 flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50/50 rounded-2xl flex items-center justify-center shadow-inner border border-blue-100/50">
                           <Award size={32} className="text-blue-600 drop-shadow-[0_0_5px_rgba(37,99,235,0.3)]" />
                        </div>
                        {t.masteryLabel}
                      </h2>
                      <div className="grid grid-cols-2 gap-6">
                        {Object.entries(studyPlan.cefrLevels).map(([key, lvl]: any) => (
                          <div key={key} className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm flex flex-col items-center group hover:bg-white transition-all">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{key}</span>
                            <span className="text-3xl font-black text-blue-600 drop-shadow-sm group-hover:scale-110 transition-transform">{lvl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-8 bg-slate-50/30 p-8 rounded-[2rem] border border-slate-100/50 shadow-inner">
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                          {t.speakingEvaluation}
                       </h3>
                       <div className="space-y-5">
                          {Object.entries(studyPlan.speakingEvaluation).map(([key, val]: any) => (
                            <div key={key} className="flex items-center justify-between group">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{key}</span>
                               <span className="text-sm font-bold text-slate-700 arabic-font bg-white/50 px-4 py-1.5 rounded-full border border-white shadow-sm group-hover:bg-white transition-colors">{val}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
               </div>

               {/* Diagnostic Pills */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-800 arabic-font flex items-center gap-3 px-2">
                       <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm"><Stethoscope size={22} /></div>
                       {t.diagnosticSkills}
                    </h3>
                    <div className="space-y-4">
                       {studyPlan.diagnosticAnalysis.map((item: string, i: number) => (
                         <div key={i} className="p-6 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/80 text-sm font-bold text-slate-600 arabic-font leading-relaxed shadow-sm hover:shadow-md transition-all">
                            {item}
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-800 arabic-font flex items-center gap-3 px-2">
                       <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100 shadow-sm"><AlertCircle size={22} /></div>
                       {t.gapLabel}
                    </h3>
                    <div className="space-y-4">
                       {studyPlan.learningGaps.map((item: string, i: number) => (
                         <div key={i} className="p-6 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/80 text-sm font-bold text-slate-600 arabic-font leading-relaxed flex gap-4 shadow-sm hover:shadow-md transition-all">
                            <div className="h-3 w-3 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full mt-1 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                            {item}
                         </div>
                       ))}
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  
                  {/* ENRICHMENT COLUMN */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 px-4">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm"><Gem size={20} /></div>
                      <h3 className="text-xl font-black text-emerald-700 arabic-font uppercase tracking-tight">{t.enrichTitle}</h3>
                    </div>
                    <div className="space-y-6">
                      {studyPlan.enrichmentPlan.map((item: any, i: number) => {
                        const skillInfo = SKILLS_ORDER.find(s => s.id === item.skillId);
                        return (
                          <div key={i} className="bg-white p-6 rounded-2xl border-r-[8px] border-emerald-500 shadow-sm hover:shadow-md transition-all group border border-slate-100">
                             <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-black text-slate-800 arabic-font flex items-center gap-3">
                                  {skillInfo && React.createElement(skillInfo.icon, { size: 20, className: "text-emerald-500" })}
                                  {item.skillName}
                                </h4>
                                <div className="px-3 py-1 rounded-full bg-emerald-50 text-[9px] font-black text-emerald-600 uppercase border border-emerald-100">{t.enrichBadge}</div>
                             </div>
                             <div className="mb-4 space-y-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block">{t.strategyLabel}</span>
                                <p className="text-sm font-bold text-slate-600 arabic-font bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">{item.strategy}</p>
                             </div>
                             <div className="space-y-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block">{t.activitiesLabel}</span>
                                {item.activities.map((act: string, idx: number) => (
                                  <div key={idx} className="flex items-center gap-3 p-2 bg-emerald-50/20 rounded-xl border border-emerald-50/50">
                                     <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0"><TrendingUp size={12} /></div>
                                     <span className="text-xs font-bold text-emerald-900 arabic-font leading-none">{act}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* REMEDIAL COLUMN */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 px-4">
                      <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shadow-sm"><Stethoscope size={20} /></div>
                      <h3 className="text-xl font-black text-rose-700 arabic-font uppercase tracking-tight">{t.remedialTitle}</h3>
                    </div>
                    <div className="space-y-6">
                      {studyPlan.remedialPlan.map((item: any, i: number) => {
                        const skillInfo = SKILLS_ORDER.find(s => s.id === item.skillId);
                        return (
                          <div key={i} className="bg-white p-6 rounded-2xl border-r-[8px] border-rose-500 shadow-sm hover:shadow-md transition-all group border border-slate-100">
                             <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-black text-slate-800 arabic-font flex items-center gap-3">
                                  {skillInfo && React.createElement(skillInfo.icon, { size: 20, className: "text-rose-500" })}
                                  {item.skillName}
                                </h4>
                                <div className="px-3 py-1 rounded-full bg-rose-50 text-[9px] font-black text-rose-600 uppercase border border-rose-100">{t.remedialBadge}</div>
                             </div>
                             <div className="mb-4 space-y-3">
                                <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100/30">
                                  <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle size={14} className="text-rose-400" />
                                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-tighter">{t.gapLabel}</span>
                                  </div>
                                  <p className="text-xs font-bold text-slate-500 arabic-font italic leading-tight">{item.gapAnalysis}</p>
                                </div>
                                <div className="space-y-2">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block">{t.strategyLabel}</span>
                                  <p className="text-sm font-bold text-slate-600 arabic-font bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 leading-snug">{item.strategy}</p>
                                </div>
                             </div>
                             <div className="space-y-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block">{t.activitiesLabel}</span>
                                {item.activities.map((act: string, idx: number) => (
                                  <div key={idx} className="flex items-center gap-3 p-2 bg-rose-50/20 rounded-xl border border-rose-50/50">
                                     <div className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center shrink-0"><CheckCircle2 size={12} /></div>
                                     <span className="text-xs font-bold text-rose-900 arabic-font leading-none">{act}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-6 no-print py-12">
                 <button onClick={() => window.print()} className="flex-1 py-6 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-4 shadow-lg active:scale-95 transition-all"><ClipboardList size={24} /> <span className="arabic-font uppercase">{t.printPlan}</span></button>
                 <button onClick={() => navigate('/')} className="flex-1 py-6 bg-white border border-slate-200 text-slate-800 rounded-2xl font-black text-sm flex items-center justify-center gap-4 shadow-sm hover:border-blue-500 active:scale-95 transition-all"><Home size={24} /> <span className="arabic-font uppercase">{t.dashboardBtn}</span></button>
               </div>
            </div>
          )}
          </>
          )}

        </div>
      </div>

      <PlacementTestPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        teacherName={profile?.displayName || 'المعلم'}
        lang={lang}
      />
    </div>
  );
};
