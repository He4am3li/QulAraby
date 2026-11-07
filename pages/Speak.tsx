
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, Mic, MicOff, Volume2, Globe, Sparkles, Loader2, Activity, AlertCircle, RefreshCw, 
  ChevronRight, UserCircle2, MessageCircle, FileText, Download, X, Lightbulb, 
  BookmarkPlus, CheckCircle2, History, Brain, PenTool, Podcast
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../components/PageHeader';
import { StudioMicIcon } from '../components/StudioMicIcon';
import { SpeakingCallBooth, CALL_CONTACTS } from '../components/SpeakingCallBooth';
import { FallingLetters } from '../components/Layout';
import { Modality, Type } from '@google/genai';
import { getAI, getLiveAI, generateSessionInsights, translateAndExpand, generateSpeech, decodeAudioData, speak as globalSpeak } from '../services/gemini';
import { useAuth } from '../components/AuthProvider';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { summarizeSpeakingEvidence, createNextSpeakingTask, mapPlacementLevel } from '../services/speakingLearning.mjs';

const LEVELS = [
  {
    id: 'beginner',
    ar: 'مبتدئ',
    en: 'Beginner',
    descriptionAr: 'عبارات عربية قصيرة مع مساعدة إنجليزية عند الحاجة.',
    descriptionEn: 'Short Arabic phrases, with English support when needed.',
    prompt: 'Teach A0-A1 Modern Standard Arabic through tiny spoken turns. Start in Arabic with an easy greeting, then give a short English explanation when needed. If the learner answers in English, briefly understand them in English, model one simple Arabic sentence, and invite them to repeat it. Ask exactly one question at a time. Give them time to think and never overload them.'
  },
  {
    id: 'intermediate',
    ar: 'متوسط',
    en: 'Intermediate',
    descriptionAr: 'محادثات عربية واضحة مع دعم تدريجي وتصحيح لطيف.',
    descriptionEn: 'Clear Arabic conversations with gradual support and gentle corrections.',
    prompt: 'Teach A2-B1 Modern Standard Arabic in mostly Arabic. Keep each reply to one or two short sentences. If the learner struggles or explicitly asks, provide a brief English explanation then return to Arabic. Correct one important recurring error at a time by modeling a natural alternative and inviting the learner to try again. Do not demand English text in an audio-only response.'
  },
  {
    id: 'advanced',
    ar: 'متقدم',
    en: 'Advanced',
    descriptionAr: 'حوار عربي أعمق للتعبير عن الأفكار وتبرير الآراء.',
    descriptionEn: 'Deeper Arabic discussions to express and justify opinions.',
    prompt: 'Use fluent Modern Standard Arabic at B2-C1, adjusting complexity to the learner. Ask follow-up questions that develop reasoning, comparisons and opinions. Use natural everyday language for everyday subjects and professional terms only when relevant. Correct selectively without interrupting the learner. Give brief English clarification only when explicitly requested.'
  },
];

const TOPICS = [
  { id: 'numbers', ar: 'الأرقام', en: 'Numbers', icon: '🔢', color: 'violet' },
  { id: 'colors', ar: 'الألوان', en: 'Colors', icon: '🎨', color: 'purple' },
  { id: 'days', ar: 'أيام الأسبوع', en: 'Days', icon: '📅', color: 'lime' },
  { id: 'months', ar: 'شهور السنة', en: 'Months', icon: '🗓️', color: 'emerald' },
  { id: 'seasons', ar: 'فصول السنة', en: 'Seasons', icon: '🍂', color: 'orange' },
  { id: 'intro', ar: 'التعارف', en: 'Intro', icon: '👋', color: 'blue' },
  { id: 'feelings', ar: 'المشاعر', en: 'Feelings', icon: '😊', color: 'amber' },
  { id: 'animals', ar: 'الحيوانات', en: 'Animals', icon: '🦁', color: 'orange' },
  { id: 'clothing', ar: 'الملابس', en: 'Clothing', icon: '👕', color: 'sky' },
  { id: 'restaurant', ar: 'المطعم', en: 'Food', icon: '🍽️', color: 'rose' },
  { id: 'family', ar: 'العائلة', en: 'Family', icon: '👨‍👩‍👧‍👦', color: 'indigo' },
  { id: 'daily', ar: 'الروتين', en: 'Routine', icon: '🔄', color: 'teal' },
  { id: 'weather', ar: 'الطقس', en: 'Weather', icon: '☀️', color: 'sky' },
  { id: 'living', ar: 'السكن', en: 'Living', icon: '🏠', color: 'emerald' },
  { id: 'hobbies', ar: 'الهوايات', en: 'Hobbies', icon: '🎨', color: 'pink' },
  { id: 'shopping', ar: 'التسوق', en: 'Shop', icon: '🛍️', color: 'yellow' },
  { id: 'travel', ar: 'السفر', en: 'Travel', icon: '✈️', color: 'blue' },
  { id: 'health', ar: 'الصحة', en: 'Health', icon: '🏥', color: 'rose' },
  { id: 'env', ar: 'البيئة', en: 'Nature', icon: '🌿', color: 'green' },
  { id: 'music', ar: 'الموسيقى', en: 'Music', icon: '🎻', color: 'purple' },
  { id: 'work', ar: 'العمل', en: 'Work', icon: '💼', color: 'gray' },
  { id: 'tech', ar: 'التقنية', en: 'Tech', icon: '💻', color: 'slate' },
  { id: 'culture', ar: 'الثقافة', en: 'Culture', icon: '🕌', color: 'amber' },
  { id: 'dreams', ar: 'الأحلام', en: 'Dreams', icon: '🚀', color: 'indigo' },
  { id: 'free', ar: 'حر', en: 'Free', icon: '🎙️', color: 'cyan' },
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

interface ChatEntry {
  role: 'user' | 'ai';
  text: string;
}

export const Speak: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  const [isActive, setIsActive] = React.useState(false);
  const [setupMode, setSetupMode] = React.useState(true);
  const [showMobileOptions, setShowMobileOptions] = React.useState(true);
  const [showSummary, setShowSummary] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [generatingInsights, setGeneratingInsights] = React.useState(false);
  const [selectedLevel, setSelectedLevel] = React.useState<typeof LEVELS[0] | null>(LEVELS[0]);
  const [selectedTopic, setSelectedTopic] = React.useState<typeof TOPICS[0] | null>(null);
  const [speakingBranch, setSpeakingBranch] = React.useState<'booth' | 'studio'>('booth');
  const [selectedCallContact, setSelectedCallContact] = React.useState<(typeof CALL_CONTACTS)[number]>(CALL_CONTACTS[0]);
  const activeTopic = speakingBranch === 'booth' ? selectedCallContact : selectedTopic;
  const [placementHint, setPlacementHint] = React.useState<{ cefr: string; levelId: string } | null>(null);
  const manualLevelRef = React.useRef(false);
  
  const [userTranscription, setUserTranscription] = React.useState('');
  const [aiTranscription, setAiTranscription] = React.useState('');
  const [conversationHistory, setConversationHistory] = React.useState<ChatEntry[]>([]);
  const [insights, setInsights] = React.useState<any>(null);
  const [savedWords, setSavedWords] = React.useState<string[]>([]);
  
  const [isAiSpeaking, setIsAiSpeaking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [recoveryNotice, setRecoveryNotice] = React.useState<string | null>(null);
  const [practiceGoal, setPracticeGoal] = React.useState('');
  const [micMuted, setMicMuted] = React.useState(false);

  // Spelling Challenge States
  const [spellingChallenge, setSpellingChallenge] = React.useState<{ words: string[], currentIdx: number, input: string, result: 'correct' | 'incorrect' | null } | null>(null);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = React.useState(false);

  React.useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  React.useEffect(() => {
    let active = true;
    if (!user?.uid) { setPlacementHint(null); return; }
    getDocs(query(collection(db, 'placement_results'), where('userId', '==', user.uid)))
      .then(snapshot => {
        if (!active) return;
        const attempts = snapshot.docs.map(item => item.data() as any)
          .sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0));
        const latestPlan = attempts.find(item => item.studyPlan?.cefrLevels?.speaking);
        const cefr = String(latestPlan?.studyPlan?.cefrLevels?.speaking || '').trim().toUpperCase();
        const levelId = mapPlacementLevel(cefr);
        if (!levelId) return;
        setPlacementHint({ cefr, levelId });
        // The diagnostic result is only a suggestion, and never overrides a student's choice.
        if (!manualLevelRef.current) {
          setSelectedLevel(LEVELS.find(level => level.id === levelId) || null);
        }
      }).catch(error => console.warn('Speaking placement suggestion unavailable', error));
    return () => { active = false; };
  }, [user?.uid]);

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const inputAudioContextRef = React.useRef<AudioContext | null>(null);
  const sessionRef = React.useRef<any>(null);
  const nextStartTimeRef = React.useRef<number>(0);
  const sourcesRef = React.useRef<Set<AudioBufferSourceNode>>(new Set());
  const audioEpochRef = React.useRef(0);
  const mountedRef = React.useRef(false);
  const startAttemptRef = React.useRef(0);
  const micMeterRef = React.useRef<HTMLDivElement>(null);
  const phoneMeterRef = React.useRef<HTMLDivElement>(null);
  const micMeterUpdatedRef = React.useRef(0);
  const historyRef = React.useRef<ChatEntry[]>([]);
  const learnerTextRef = React.useRef('');
  const tutorTextRef = React.useRef('');

  const flushPendingTranscript = React.useCallback((): ChatEntry[] => {
    const completed = [...historyRef.current];
    if (learnerTextRef.current.trim()) completed.push({ role: 'user', text: learnerTextRef.current.trim() });
    if (tutorTextRef.current.trim()) completed.push({ role: 'ai', text: tutorTextRef.current.trim() });
    historyRef.current = completed;
    learnerTextRef.current = '';
    tutorTextRef.current = '';
    setConversationHistory(completed);
    setUserTranscription('');
    setAiTranscription('');
    return completed;
  }, []);

  const closeTransport = React.useCallback(() => {
    startAttemptRef.current += 1;
    const active = sessionRef.current;
    sessionRef.current = null;

    active?.stream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    try { active?.scriptProcessor?.disconnect(); } catch {}
    try { active?.source?.disconnect(); } catch {}
    try { active?.session?.close(); } catch {}
    // A connection may resolve after the user has already left the page.
    if (active?.sessionPromise) {
      void active.sessionPromise.then((session: any) => {
        if (session !== active.session) {
          try { session.close(); } catch {}
        }
      }).catch(() => {});
    }

    audioEpochRef.current += 1;
    sourcesRef.current.forEach(source => { try { source.stop(); } catch {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    micMeterRef.current?.style.setProperty('--mic-scale', '0.12');
    phoneMeterRef.current?.style.setProperty('--phone-mic', '0.12');
    setIsActive(false);
    setIsAiSpeaking(false);
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      closeTransport();
      void audioContextRef.current?.close().catch(() => {});
      void inputAudioContextRef.current?.close().catch(() => {});
    };
  }, [closeTransport]);
  const reportRef = React.useRef<HTMLDivElement>(null);
  const summaryPrintRef = React.useRef<HTMLDivElement>(null);
  const transcriptPrintRef = React.useRef<HTMLDivElement>(null);

  const STRINGS = {
    ar: {
      title: 'التحدث بالعربية',
      subtitle: 'محادثة صوتية ذكية مباشرة',
      start: 'ابدأ المحادثة الآن',
      stop: 'إنهاء الجلسة',
      listening: 'أنا أسمعك الآن...',
      speaking: 'المعلم يتحدث...',
      lang: 'English',
      permError: 'يرجى السماح بالوصول للميكروفون.',
      genError: 'الخدمة غير متوفرة حالياً، يرجى إعادة المحاولة.',
      setupTitle: 'تخصيص المحادثة',
      levelLabel: 'المستوى:',
      topicLabel: 'الموضوع:',
      summaryTitle: 'تقرير الجلسة الذكي',
      downloadBtn: 'تحميل التقرير (PDF)',
      closeBtn: 'جلسة جديدة',
      noHistory: 'لا يوجد سجل للمحادثة حالياً.',
      tutorName: 'المعلم الذكي',
      userName: 'المتعلم',
      vocabTitle: 'مفردات من الحوار',
      correctionsTitle: 'تصحيحات لغوية',
      tipTitle: 'نصيحة المعلم الذكي',
      saveVocab: 'حفظ للبنك',
      saved: 'تم الحفظ',
      selectTopic: 'اختر موضوعاً للمحادثة',
      selectLevel: 'اختر مستواك اللغوي',
      selectLevelFirst: 'اختر المستوى أولاً',
      chooseTopic: 'اختر موضوعاً للبدء',
      pleaseSelect: 'يرجى اختيار الموضوع والمستوى للبدء',
      historyTitle: 'سجل الحوار الكامل'
    },
    en: {
      title: 'Speaking Arabic',
      subtitle: 'Real-time AI voice conversation',
      start: 'Start Talking Now',
      stop: 'End Session',
      listening: 'Listening to you...',
      speaking: 'AI Tutor is speaking...',
      lang: 'العربية',
      permError: 'Microphone access is required.',
      genError: 'Service temporarily unavailable. Please retry.',
      setupTitle: 'Session Setup',
      levelLabel: 'Level:',
      topicLabel: 'Topic:',
      summaryTitle: 'Smart Session Report',
      downloadBtn: 'Download Transcript (PDF)',
      closeBtn: 'New Session',
      noHistory: 'No conversation history available.',
      tutorName: 'AI Tutor',
      userName: 'Learner',
      vocabTitle: 'Vocabulary from the dialogue',
      correctionsTitle: 'Corrections',
      tipTitle: 'AI Tutor Tip',
      saveVocab: 'Save to Bank',
      saved: 'Saved',
      selectTopic: 'Select a topic',
      selectLevel: 'Select your level',
      selectLevelFirst: 'Select Level First',
      chooseTopic: 'Choose a topic to start',
      pleaseSelect: 'Please select topic and level to start',
      historyTitle: 'Full Transcript'
    }
  };

  const t = STRINGS[lang];
  const speakingEvidence = summarizeSpeakingEvidence(conversationHistory);
  const taskFallback = createNextSpeakingTask({
    level: selectedLevel?.id || 'beginner',
    topicAr: activeTopic?.ar || 'الموضوع',
    corrections: insights?.assessmentStatus === 'analyzed' ? insights.corrections : [],
  });
  const nextPractice = insights?.assessmentStatus === 'analyzed' && insights?.next_practice?.ar
    ? { promptAr: insights.next_practice.ar, promptEn: insights.next_practice.en }
    : taskFallback;
  const toggleMicrophone = () => {
    const nextMuted = !micMuted;
    sessionRef.current?.stream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = !nextMuted;
    });
    setMicMuted(nextMuted);
    micMeterRef.current?.style.setProperty('--mic-scale', '0.12');
    phoneMeterRef.current?.style.setProperty('--phone-mic', '0.12');
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const createBlob = (data: Float32Array, inputRate: number) => {
    // Browsers may ignore the requested AudioContext sampleRate (notably on iOS).
    // Always send genuine 16 kHz mono PCM, not mislabeled 44.1/48 kHz data.
    const ratio = inputRate / 16000;
    const sampleCount = Math.max(1, Math.floor(data.length / ratio));
    const int16 = new Int16Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      const start = Math.min(data.length - 1, Math.floor(i * ratio));
      const end = Math.min(data.length, Math.max(start + 1, Math.floor((i + 1) * ratio)));
      let sum = 0;
      for (let j = start; j < end; j++) sum += data[j];
      const sample = Math.max(-1, Math.min(1, sum / (end - start)));
      int16[i] = sample < 0 ? Math.round(sample * 32768) : Math.round(sample * 32767);
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const initAudioContexts = async () => {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    if (!inputAudioContextRef.current) {
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
    }
    
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    if (inputAudioContextRef.current.state === 'suspended') await inputAudioContextRef.current.resume();
    
    return { output: audioContextRef.current, input: inputAudioContextRef.current };
  };

  const startSession = async (preserveHistory = false) => {
    if (!selectedLevel || !activeTopic) return;
    closeTransport();
    const attempt = startAttemptRef.current;
    const previousTurns = preserveHistory ? [...historyRef.current].slice(-8) : [];
    setLoading(true);
    setError(null);
    setRecoveryNotice(null);
    setMicMuted(false);
    if (!preserveHistory) {
      setConversationHistory([]);
      historyRef.current = [];
      learnerTextRef.current = '';
      tutorTextRef.current = '';
      setUserTranscription('');
      setAiTranscription('');
      setInsights(null);
      setSavedWords([]);
    }
    
    try {
      // Fetch Proactive Context
      let proactiveContext = "";
      if (user) {
        try {
          const vocabRef = collection(db, 'users', user.uid, 'vocabulary');
          const vocabSnap = await getDocs(query(vocabRef, orderBy('createdAt', 'desc'), limit(3)));
          const recentVocab = vocabSnap.docs.map(d => d.data().word).join(", ");
          
          const memoryRef = collection(db, 'users', user.uid, 'memory');
          const mistakesSnap = await getDocs(query(memoryRef, orderBy('timestamp', 'desc'), limit(3)));
          const recentMistakes = mistakesSnap.docs.map(d => d.data().content).join(", ");

          if (recentVocab) proactiveContext += `\nRecent words learned: ${recentVocab}.`;
          if (recentMistakes) proactiveContext += `\nRecent mistakes made: ${recentMistakes}.`;
          
          if (proactiveContext) {
            proactiveContext = `\nPERSONALIZED CONTEXT FOR THIS USER:${proactiveContext}\nUse this context to start the conversation in a friendly way, perhaps asking them to use one of these words or correcting a past mistake.`;
          }
        } catch (e) {
          console.error("Failed to fetch proactive context", e);
        }
      }

      const contexts = await initAudioContexts();
      if (!mountedRef.current || attempt !== startAttemptRef.current) return;
      const output = contexts.output;
      const input = contexts.input;

      const ai = await getLiveAI();
      if (!mountedRef.current || attempt !== startAttemptRef.current) return;

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mountedRef.current || attempt !== startAttemptRef.current) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
      } catch (e: any) {
        setError(t.permError);
        setLoading(false);
        return;
      }
      
      const transport: {
        stream: MediaStream;
        source?: MediaStreamAudioSourceNode;
        scriptProcessor?: ScriptProcessorNode;
        sessionPromise?: Promise<any>;
        session?: any;
      } = { stream };
      sessionRef.current = transport;

      const sessionPromise = ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are a professional Arabic tutor named "QUL AI". 
          User Name: ${user?.displayName || 'Learner'}
          User Level: ${selectedLevel?.en} (${selectedLevel?.ar}). ${selectedLevel?.prompt}
          Topic: ${activeTopic?.en} (${activeTopic?.ar}).
          ${practiceGoal ? 'Current practice target: ' + practiceGoal.slice(0, 240) : ''} 
          
          ${proactiveContext}

          ${speakingBranch === 'booth' ? `TELEPHONE ROLEPLAY. You are the fictional agent ${selectedCallContact.agentEn} at ${selectedCallContact.en}. This is a simulated educational call, not a real transaction. Student's mission: ${selectedCallContact.aimEn}. Objectives: ${selectedCallContact.objectivesEn.join('; ')}. Situation twist only after learner begins the request: ${selectedCallContact.complication}. Answer as a natural person on a telephone, with one short greeting and one simple question. Remain in character. Allow English hints for A1 and when a learner struggles, then model a tiny Arabic phrase. Ask no real identifiers, phone numbers, addresses, or payment details. Never claim a real booking was created. Don't assess pronunciation from transcripts.` : ''}

          SPEAKING COACH RULES:
          Start with one short greeting and one easy question about the topic.
          Your main purpose is to get the LEARNER to speak, not to deliver a lecture.
          Listen patiently. Ask only one question per turn and gradually adapt difficulty to the learner's actual speech, not just the selected level.
          Give one useful correction at a time after a learner turn, then model the improved phrase and invite a retry when appropriate.
          Offer English scaffolding naturally when the learner needs it, especially beginners, but return to Arabic practice promptly.
          Keep feedback encouraging but specific. Avoid falsely claiming a pronunciation score or fluency score.
          Spoken audio transcripts should match what was actually spoken; do not insert silent translations into audio transcription.
          If the learner becomes stuck, simplify the question and provide a tiny model answer rather than repeating it unchanged.`,
        },
        callbacks: {
          onopen: () => {
            if (sessionRef.current !== transport || attempt !== startAttemptRef.current) return;
            setIsActive(true);
            setSetupMode(false);
            setLoading(false);
            const source = input.createMediaStreamSource(stream);
            const scriptProcessor = input.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (sessionRef.current !== transport || !transport.session) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const now = performance.now();
              if (now - micMeterUpdatedRef.current > 75) {
                let energy = 0;
                for (let i = 0; i < inputData.length; i += 32) energy += inputData[i] * inputData[i];
                const level = Math.sqrt(energy / Math.ceil(inputData.length / 32));
                const scaled = Math.max(0.12, Math.min(1, 0.12 + level * 7));
                micMeterRef.current?.style.setProperty('--mic-scale', String(scaled));
                phoneMeterRef.current?.style.setProperty('--phone-mic', String(scaled));
                micMeterUpdatedRef.current = now;
              }
              const pcmBlob = createBlob(inputData, input.sampleRate);
              try { transport.session.sendRealtimeInput({ audio: pcmBlob }); }
              catch (err) { console.debug('Voice input unavailable', err); }
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(input.destination);
            transport.source = source;
            transport.scriptProcessor = scriptProcessor;
          },
          onmessage: async (message) => {
            if (sessionRef.current !== transport) return;
            const learnerChunk = message.serverContent?.inputTranscription?.text || '';
            const tutorChunk = message.serverContent?.outputTranscription?.text || '';
            if (learnerChunk) {
              learnerTextRef.current += learnerChunk;
              setUserTranscription(learnerTextRef.current);
            }
            if (tutorChunk) {
              tutorTextRef.current += tutorChunk;
              setAiTranscription(tutorTextRef.current);
            }

            if (message.serverContent?.turnComplete) {
              const completed: ChatEntry[] = [];
              if (learnerTextRef.current.trim()) {
                completed.push({ role: 'user', text: learnerTextRef.current.trim() });
              }
              if (tutorTextRef.current.trim()) {
                completed.push({ role: 'ai', text: tutorTextRef.current.trim() });
              }
              if (completed.length) {
                historyRef.current = [...historyRef.current, ...completed];
                setConversationHistory(historyRef.current);
              }
              learnerTextRef.current = '';
              tutorTextRef.current = '';
              setUserTranscription('');
              setAiTranscription('');
            }

            if (message.serverContent?.interrupted) {
              audioEpochRef.current += 1;
              sourcesRef.current.forEach(source => { try { source.stop(); } catch {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsAiSpeaking(false);
            }

            // A Live response may contain more than one audio part.
            for (const part of message.serverContent?.modelTurn?.parts || []) {
              const audioData = part.inlineData?.data;
              if (!audioData || !part.inlineData?.mimeType?.startsWith('audio/') ||
                  message.serverContent?.interrupted) continue;
              const audioEpoch = audioEpochRef.current;
              const ctx = output;
              const audioBuffer = await decodeAudioData(decode(audioData), ctx);
              if (sessionRef.current !== transport || audioEpoch !== audioEpochRef.current) return;
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsAiSpeaking(false);
              };
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              setIsAiSpeaking(true);
            }
          },
          onclose: () => {
            if (sessionRef.current !== transport) return;
            flushPendingTranscript();
            closeTransport();
            setSetupMode(false);
            setRecoveryNotice(lang === 'ar' ? 'انقطع الاتصال، لكن الحوار محفوظ داخل هذه الصفحة.' : 'Connection lost. Your dialogue is still available on this page.');
            setLoading(false);
          },
          onerror: (e) => {
            console.error("Live Error", e);
            if (sessionRef.current !== transport) return;
            flushPendingTranscript();
            closeTransport();
            setSetupMode(false);
            setRecoveryNotice(lang === 'ar' ? 'تعذر استمرار الاتصال الصوتي. يمكنك استئناف الحوار أو إنهاء الجلسة.' : 'Voice connection interrupted. Reconnect or finish the session.');
            setLoading(false);
          },
        },
      });
      transport.sessionPromise = sessionPromise;
      void sessionPromise.then(session => {
        transport.session = session;
        if (sessionRef.current !== transport) {
          try { session.close(); } catch {}
          return;
        }
        // A new Live connection resumes the *learning context*, not the old audio stream.
        // Only the most recent eight turns are included, and no old microphone remains active.
        const context = previousTurns.length
          ? '\nPrevious dialogue (context only):\n' + previousTurns
              .map(turn => (turn.role === 'user' ? 'Learner: ' : 'Tutor: ') + turn.text.slice(0, 250))
              .join('\n') + '\nContinue naturally without repeating the opening.'
          : '';
        session.sendClientContent({
          turns: [{ role: 'user', parts: [{
            text: (speakingBranch === 'booth' ? 'Answer the simulated telephone NOW in your role as the selected agent. Give one short natural greeting and one easy question. Do not introduce yourself as AI.' : 'Begin the tutoring session with one short greeting and an easy question about the selected topic. This is an internal startup instruction, not a learner utterance.') + context
          }] }],
          turnComplete: true,
        });
      }).catch(err => {
        console.error('Live connection failed', err);
        if (sessionRef.current !== transport) return;
        closeTransport();
        setSetupMode(true);
        setError(t.genError);
        setLoading(false);
      });
    } catch (err: any) {
      console.error("Start Error", err);
      if (attempt !== startAttemptRef.current) return;
      closeTransport();
      if (preserveHistory) {
        setSetupMode(false);
        setRecoveryNotice(lang === 'ar' ? 'تعذرت إعادة الاتصال، وما زال الحوار محفوظًا.' : 'Reconnection failed. Your dialogue is still available.');
      } else {
        setSetupMode(true);
        setError(t.genError);
      }
      setLoading(false);
    }
  };

  const stopSession = async () => {
    closeTransport();
    setLoading(false);

    const finalHistory = flushPendingTranscript();
    setRecoveryNotice(null);

    if (finalHistory.some(entry => entry.role === 'user' && entry.text.trim()) &&
        finalHistory.some(entry => entry.role === 'ai' && entry.text.trim())) {
      setShowSummary(true);
      setGeneratingInsights(true);
      try {
        const data = await generateSessionInsights(finalHistory, activeTopic.ar);
        setInsights(data);

        // Sync to Knowledge Graph (Mistakes & Interests)
        if (user) {
          // 1. Sync Mistakes
          if (data.corrections && data.corrections.length > 0) {
            const memoryRef = collection(db, 'users', user.uid, 'memory');
            for (const correction of data.corrections) {
              addDoc(memoryRef, {
                type: 'speaking',
                content: correction.original,
                correction: correction.correction,
                explanation: correction.explanation,
                userId: user.uid,
                source: 'Speaking',
                timestamp: serverTimestamp()
              }).catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/memory`));
            }
          }

          // 2. Sync Interest
          const interestsRef = collection(db, 'users', user.uid, 'interests');
          addDoc(interestsRef, {
            topic: activeTopic.ar,
            userId: user.uid,
            frequency: 1,
            lastSeen: serverTimestamp(),
            source: 'Speaking'
          }).catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/interests`));
        }
      } catch (e) {
        console.error("Failed to generate insights", e);
      } finally {
        setGeneratingInsights(false);
      }
    } else {
      setSetupMode(true);
    }
  };

  const handleSaveToVocab = async (word: string) => {
    if (savedWords.includes(word)) return;
    try {
      const data = await translateAndExpand(word, false);
      const existing = JSON.parse(localStorage.getItem('hub_vocab') || '[]');
      localStorage.setItem('hub_vocab', JSON.stringify([...existing, data]));
      setSavedWords(prev => [...prev, word]);
    } catch (e) {
      console.error("Failed to save word", e);
    }
  };

  const speakWord = async (text: string) => {
    await globalSpeak(text, 'ar');
  };

  const startSpellingChallenge = async (text: string) => {
    if (!text || isGeneratingChallenge) return;
    setIsGeneratingChallenge(true);
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Extract 3 meaningful Arabic words from this text for a spelling challenge. Return them as a JSON array of strings. Text: "${text}"`,
        config: { responseMimeType: 'application/json' }
      });
      
      const words = JSON.parse(response.text);
      if (Array.isArray(words) && words.length > 0) {
        setSpellingChallenge({
          words,
          currentIdx: 0,
          input: '',
          result: null
        });
      }
    } catch (err) {
      console.error('Spelling challenge error:', err);
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  const checkSpelling = async () => {
    if (!spellingChallenge) return;
    const currentWord = spellingChallenge.words[spellingChallenge.currentIdx];
    const isCorrect = spellingChallenge.input.trim() === currentWord.trim();
    
    setSpellingChallenge({
      ...spellingChallenge,
      result: isCorrect ? 'correct' : 'incorrect'
    });

    if (!isCorrect && user) {
      // Save to Student Memory
      try {
        const memoryRef = collection(db, 'users', user.uid, 'memory');
        await addDoc(memoryRef, {
          type: 'speaking',
          content: spellingChallenge.input,
          correction: currentWord,
          explanation: 'Spelling error during conversation challenge',
          timestamp: serverTimestamp()
        });
      } catch (e) {
        console.error('Failed to save spelling error to memory:', e);
      }
    }

    if (isCorrect) {
      setTimeout(() => {
        setSpellingChallenge(prev => {
          if (!prev) return null;
          if (prev.currentIdx < prev.words.length - 1) {
            return {
              ...prev,
              currentIdx: prev.currentIdx + 1,
              input: '',
              result: null
            };
          }
          return null;
        });
      }, 1500);
    }
  };

  const handlePrint = async () => {
    if (!summaryPrintRef.current || !transcriptPrintRef.current) return;
    setLoading(true);
    try {
      // Heavy PDF modules are loaded only when a learner requests a report.
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const allImgs = [
        ...Array.from(summaryPrintRef.current.querySelectorAll('img')),
        ...Array.from(transcriptPrintRef.current.querySelectorAll('img'))
      ];
      await Promise.all(allImgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(res => {
          img.onload = res;
          img.onerror = res;
        });
      }));

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Helper to capture a ref and return canvas
      const capture = async (ref: HTMLDivElement) => {
        return await html2canvas(ref, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
      };

      // Page 1: Summary
      const summaryCanvas = await capture(summaryPrintRef.current);
      const summaryImgData = summaryCanvas.toDataURL('image/png');
      const summaryPdfHeight = (summaryCanvas.height * pdfWidth) / summaryCanvas.width;
      pdf.addImage(summaryImgData, 'PNG', 0, 0, pdfWidth, summaryPdfHeight);
      // A long summary must continue onto another page, not get clipped at A4.
      let summaryOffset = 0;
      while (summaryPdfHeight + summaryOffset > pdfHeight + 0.5) {
        summaryOffset -= pdfHeight;
        pdf.addPage();
        pdf.addImage(summaryImgData, 'PNG', 0, summaryOffset, pdfWidth, summaryPdfHeight);
      }

      // Following pages: Transcript
      pdf.addPage();
      const transcriptEl = transcriptPrintRef.current;
      const messages = transcriptEl.querySelectorAll('.transcript-message');
      
      let currentY = 20; 
      const margin = 15;
      const contentWidth = pdfWidth - (2 * margin);
      
      // Capture and add header
      const headerEl = transcriptEl.querySelector('.transcript-header') as HTMLElement;
      if (headerEl) {
        const headerCanvas = await html2canvas(headerEl, { scale: 2, useCORS: true });
        const hImg = headerCanvas.toDataURL('image/png');
        const hHeight = (headerCanvas.height * contentWidth) / headerCanvas.width;
        pdf.addImage(hImg, 'PNG', margin, currentY, contentWidth, hHeight);
        currentY += hHeight + 15;
      }

      for (let i = 0; i < messages.length; i++) {
        const msgEl = messages[i] as HTMLElement;
        const msgCanvas = await html2canvas(msgEl, { 
          scale: 2, 
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const msgImg = msgCanvas.toDataURL('image/png');
        const msgHeight = (msgCanvas.height * contentWidth) / msgCanvas.width;

        if (currentY + msgHeight > pdfHeight - 20) {
          pdf.addPage();
          currentY = 20;
          // Small header on new pages
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          const pageNum = (pdf as any).internal.getNumberOfPages();
          pdf.text(`Qul Conversation Transcript - Page ${pageNum}`, margin, 12);
        }

        pdf.addImage(msgImg, 'PNG', margin, currentY, contentWidth, msgHeight);
        currentY += msgHeight + 8;
      }

      pdf.save(`Qul_Conversation_Report_${activeTopic?.en}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
      window.print();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-700 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Printable Report View */}
      <div ref={reportRef} className="print-only print-container">
        <div className="border-b-4 border-[#2563eb] pb-4 mb-6 flex justify-between items-end">
          <div className="text-right">
            <h1 className="text-2xl font-black text-slate-900 arabic-font">{t.summaryTitle}</h1>
            <p className="text-xs text-slate-500 font-bold mt-1">الموضوع: {activeTopic?.ar} | المستوى: {selectedLevel?.ar}</p>
          </div>
          <div className="text-left font-black text-[#2563eb] text-lg">قُل - Qul</div>
        </div>
        
        {insights && (
          <div className="space-y-6">
            <div className="tip-box">
              <h2 className="text-lg font-black text-[#059669] arabic-font mb-3 flex items-center gap-2">
                <Lightbulb size={20} /> {t.tipTitle}
              </h2>
              {/* Bilingual Tip in Print */}
              <div className="space-y-3">
                <p className="text-slate-800 font-black arabic-font text-lg leading-relaxed">
                  {insights.tutor_tip_ar}
                </p>
                <div className="h-px bg-emerald-100 w-full" />
                <p className="text-slate-600 italic leading-relaxed text-sm">
                  {insights.tutor_tip_en}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
               <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h3 className="font-black text-xs uppercase text-slate-400 mb-2 border-b border-slate-200 pb-1">{t.vocabTitle}</h3>
                  <ul className="space-y-1">
                    {insights.key_vocabulary.map((v: any, i: number) => (
                      <li key={i} className="text-sm font-bold text-slate-800 arabic-font">
                        • {v.word} <span className="text-slate-400 font-normal">({v.translation})</span>
                      </li>
                    ))}
                  </ul>
               </div>
               <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h3 className="font-black text-xs uppercase text-slate-400 mb-2 border-b border-slate-200 pb-1">ملخص الأداء</h3>
                  <p className="text-xs text-slate-700 italic leading-relaxed">{insights.summary}</p>
               </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h3 className="text-sm font-black text-slate-400 uppercase mb-4 text-center border-y border-slate-100 py-1">{t.historyTitle}</h3>
          <div className="space-y-4">
            {conversationHistory.filter(h => h.text.trim()).map((entry, i) => (
              <div key={i} className="chat-item">
                <p className={`text-[10px] font-black uppercase mb-1 ${entry.role === 'ai' ? 'text-[#059669]' : 'text-slate-400'}`}>
                  {entry.role === 'ai' ? t.tutorName : t.userName}
                </p>
                <p className={`text-md arabic-font leading-relaxed ${entry.role === 'ai' ? 'font-black text-slate-800' : 'text-slate-600'}`}>
                  {entry.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header Bar */}
      <PageHeader
        title={t.title}
        icon={StudioMicIcon}
        lang={lang}
        onToggle={toggleLang}
      />

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden bg-slate-50/30">
        
        {/* Sidebar - Topics & Levels */}
        <aside className={`${showMobileOptions && (speakingBranch === 'booth' || setupMode) ? 'flex' : 'hidden'} lg:flex w-full lg:w-[280px] flex-1 lg:flex-none min-h-0 bg-white border-b lg:border-b-0 lg:border-r rtl:lg:border-r-0 rtl:lg:border-l border-slate-100 flex-col shrink-0 no-print relative overflow-hidden shadow-sm`}>
            <div className="p-4 sm:p-6 border-b border-slate-50 overflow-y-auto custom-scroll flex-1 min-h-0">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{lang === 'ar' ? 'أقسام التحدث' : 'Speaking sections'}</h3>
                <div className="space-y-2 mb-5">
                  <button type="button" disabled={isActive || loading}
                    onClick={() => { setSpeakingBranch('booth'); setShowSummary(false); setShowMobileOptions(false); }}
                    className={`w-full flex gap-3 items-center rounded-2xl border-2 p-3 transition-all disabled:opacity-40 ${speakingBranch === 'booth' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white border-slate-100 text-slate-500 hover:border-amber-200'}`}>
                    <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-slate-900 text-amber-200"><Phone size={23} /></span>
                    <span className="flex-1 text-right">
                      <strong className="block text-sm arabic-font">{lang === 'ar' ? 'كابينة الاتصال' : 'The Call Booth'}</strong>
                      <small className="block text-[10px] opacity-60">THE CALL BOOTH</small>
                    </span>
                    <ChevronRight size={16} className="opacity-40"/>
                  </button>
                  <button type="button" disabled={isActive || loading}
                    onClick={() => { setSpeakingBranch('studio'); setSetupMode(true); setShowSummary(false); setShowMobileOptions(!selectedTopic); }}
                    className={`w-full flex gap-3 items-center rounded-2xl border-2 p-3 transition-all disabled:opacity-40 ${speakingBranch === 'studio' ? 'bg-blue-50 border-blue-300 text-blue-900' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'}`}>
                    <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-slate-100 text-blue-700"><StudioMicIcon size={24} /></span>
                    <span className="flex-1 text-right">
                      <strong className="block text-sm arabic-font">{lang === 'ar' ? 'المحادثة الحرة' : 'Free Conversation'}</strong>
                      <small className="block text-[10px] opacity-60">FREE SPEAKING STUDIO</small>
                    </span>
                    <ChevronRight size={16} className="opacity-40"/>
                  </button>
                </div>

                {speakingBranch === 'booth' && (
                  <div className="space-y-2.5">
                    <h4 className="text-[11px] font-black text-slate-400 mb-3">{lang === 'ar' ? 'دليل الاتصالات' : 'Call directory'}</h4>
                    {CALL_CONTACTS.map(contact => (
                      <button type="button" key={contact.id} disabled={isActive || loading}
                        onClick={() => { setSelectedCallContact(contact); setShowMobileOptions(false); setRecoveryNotice(null); setShowSummary(false); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all disabled:opacity-40 ${contact.id === selectedCallContact.id ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}>
                        <span className={`flex items-center justify-center h-11 w-11 text-xl rounded-xl ${contact.id === selectedCallContact.id ? 'bg-[#1a2733] text-amber-200' : 'bg-white text-slate-600'}`}>{contact.symbol}</span>
                        <span className="flex-1 min-w-0 text-right">
                          <strong className="block text-sm font-black arabic-font text-slate-800 truncate">{lang === 'ar' ? contact.ar : contact.en}</strong>
                          <small className="text-[10px] text-slate-400 font-mono" dir="ltr">EXT. {contact.extension}</small>
                        </span>
                        <ChevronRight size={15} className="text-slate-400"/>
                      </button>
                    ))}
                    <p className="text-[10px] text-slate-400 leading-relaxed">{lang === 'ar' ? 'هذه مكالمات افتراضية للتعلم وليست اتصالات فعلية.' : 'These are educational simulations, not real calls.'}</p>
                  </div>
                )}

                {speakingBranch === 'studio' && (
                <div className="space-y-3">
                    {TOPICS.map(topic => {
                        const color = TOPIC_COLORS[topic.color] || TOPIC_COLORS.blue;
                        return (
                          <button 
                              key={topic.id} 
                              disabled={isActive || !selectedLevel}
                              onClick={() => {
                                  if (isActive) return;
                                  setSelectedTopic(topic);
                                  setSetupMode(true);
                                  setShowSummary(false);
                                  setShowMobileOptions(false);
                              }}
                              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-right group ${selectedTopic?.id === topic.id ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 text-slate-500'} ${isActive || !selectedLevel ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                          >
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-all group-hover:scale-110 group-hover:rotate-6 ${selectedTopic?.id === topic.id ? 'bg-blue-500 text-white' : `${color.bg} ${color.border} ${color.text}`}`}>
                                  <span className="text-2xl">{topic.icon}</span>
                              </div>
                              <div className="flex-1">
                                  <p className="text-sm font-black arabic-font leading-none mb-1">{topic.ar}</p>
                                  <p className="text-[10px] opacity-60 font-bold uppercase tracking-tighter">{topic.en}</p>
                              </div>
                              <ChevronRight size={16} className={`opacity-20 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                          </button>
                        );
                    })}
                </div>
                )}
            </div>

            {/* Level Selection */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">{t.levelLabel}</p>
                <div className="flex flex-col gap-2">
                    {LEVELS.map(level => (
                        <button
                            key={level.id}
                            disabled={isActive}
                            onClick={() => { manualLevelRef.current = true; setSelectedLevel(level); }}
                            className={`w-full px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-between ${selectedLevel?.id === level.id ? 'bg-[#2563eb] text-white shadow-md' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'} ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="arabic-font leading-none">{level.ar}</span>
                            <span className="opacity-70 leading-none text-[10px]">{level.en}</span>
                        </button>
                    ))}
                  {placementHint && (
                    <p className="mt-3 text-[10px] leading-relaxed text-slate-500 arabic-font">
                      {lang === 'ar'
                        ? `مستوى مقترح من تقرير اختبار سابق: ${placementHint.cefr}، ويمكنك تغييره. هذا ليس حكمًا نهائيًا على مهارة التحدث.`
                        : `Suggested by a previous placement report: ${placementHint.cefr}. You may change it. This is not a validated speaking grade.`}
                    </p>
                  )}
                </div>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className={`${showMobileOptions && (speakingBranch === 'booth' || setupMode) ? 'hidden' : 'flex'} lg:flex flex-1 min-w-0 min-h-0 flex-col overflow-hidden relative`}>
          {showSummary && (
            <div className="absolute inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90%] overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-[#2563eb] to-[#059669] text-white rounded-2xl shadow-lg">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 arabic-font">{t.summaryTitle}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeTopic?.ar} • {selectedLevel?.ar}</p>
                    </div>
                  </div>
                  <button onClick={() => { setShowSummary(false); setSetupMode(true); }} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 custom-scroll">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <div className="lg:col-span-2 space-y-6">
                      {generatingInsights ? (
                        <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                          <Loader2 size={48} className="animate-spin text-[#2563eb]" />
                          <p className="font-black text-slate-400 uppercase text-xs tracking-widest">تحليل الجلسة بذكاء...</p>
                        </div>
                      ) : insights && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
                          <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5 space-y-3">
                            <p className="font-black text-sm text-slate-800">{lang === 'ar' ? 'دليل التحدث من النص' : 'Speaking evidence from transcript'}</p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {[
                                [speakingEvidence.learnerTurns, lang === 'ar' ? 'مداخلات الطالب' : 'Learner turns'],
                                [speakingEvidence.arabicWords, lang === 'ar' ? 'كلمات عربية' : 'Arabic words'],
                                [speakingEvidence.uniqueArabicWords, lang === 'ar' ? 'كلمات مختلفة' : 'Distinct words'],
                              ].map(([value, label]) => (
                                <div key={String(label)} className="rounded-2xl bg-white/90 p-3">
                                  <div className="text-xl font-black text-blue-800" dir="ltr">{value}</div>
                                  <div className="text-[10px] font-bold text-slate-500">{label}</div>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {lang === 'ar' ? 'مؤشرات من النص المكتوب، وليست قياسًا للنطق أو الطلاقة الصوتية. قد يخطئ تحويل الصوت إلى نص.'
                                : 'These figures come from the transcript, not an audio pronunciation or fluency assessment. Speech recognition may make errors.'}
                            </p>
                            {insights.assessmentStatus === 'limited' && (
                              <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-900">
                                {lang === 'ar' ? 'تعذر إجراء تحليل تربوي موثوق، لذا لا نعرض درجة غير مستندة إلى دليل.'
                                  : 'A reliable assessment was unavailable. No unsupported score is shown.'}
                              </p>
                            )}
                          </div>
                          {/* Bilingual Tutor Tip UI */}
                          <div className="bg-gradient-to-br from-[#2563eb] to-[#059669] p-6 rounded-[2rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                             <Lightbulb className="absolute top-4 left-4 opacity-20 group-hover:scale-110 transition-transform" size={80} />
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">{t.tipTitle}</p>
                             <p className="text-lg font-black arabic-font leading-relaxed mb-2">{insights.tutor_tip_ar}</p>
                             <p className="text-sm italic opacity-90 border-t border-white/20 pt-2">{insights.tutor_tip_en}</p>
                          </div>

                          <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
                             <h4 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                               <BookmarkPlus size={16} className="text-emerald-500" /> {t.vocabTitle}
                             </h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {insights.key_vocabulary.map((v: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                                    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                                      <p className="text-sm font-black text-slate-800 arabic-font leading-none">{v.word}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{v.translation}</p>
                                    </div>
                                    <button 
                                      onClick={() => handleSaveToVocab(v.word)}
                                      disabled={savedWords.includes(v.word)}
                                      className={`p-2 rounded-lg transition-all ${savedWords.includes(v.word) ? 'bg-emerald-50 text-emerald-500' : 'bg-white text-slate-400 hover:text-[#2563eb] shadow-sm'}`}
                                    >
                                      {savedWords.includes(v.word) ? <CheckCircle2 size={18} /> : <BookmarkPlus size={18} />}
                                    </button>
                                  </div>
                                ))}
                             </div>
                          </div>

                          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5 space-y-3">
                            <p className="font-black text-sm text-emerald-900">{lang === 'ar' ? 'مهمتك التالية' : 'Your next speaking task'}</p>
                            <p className="text-base font-bold arabic-font text-slate-800" dir="rtl">{nextPractice.promptAr}</p>
                            <p className="text-xs text-slate-600" dir="ltr">{nextPractice.promptEn}</p>
                            <button type="button" onClick={() => {
                              setPracticeGoal(nextPractice.promptAr);
                              setShowSummary(false);
                              setSetupMode(true);
                              setShowMobileOptions(false);
                            }} className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white">
                              {lang === 'ar' ? 'تدرب على هذه المهمة' : 'Practice this task'}
                            </button>
                          </div>
                          {insights.corrections && insights.corrections.length > 0 && (
                            <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
                              <h4 className="text-xs font-black text-slate-400 uppercase mb-4">{t.correctionsTitle}</h4>
                              <div className="space-y-3">
                                {insights.corrections.map((c: any, i: number) => (
                                  <div key={i} className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-black text-slate-400 line-through arabic-font">{c.original}</span>
                                      <ChevronRight size={14} className="text-slate-300" />
                                      <span className="text-sm font-black text-emerald-600 arabic-font">{c.correction}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 italic">{c.explanation}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
                      <h4 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                        <History size={16} /> {t.historyTitle}
                      </h4>
                      <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scroll pr-2">
                        {conversationHistory.filter(h => h.text.trim()).map((entry, i) => (
                          <div key={i} className={`flex flex-col ${entry.role === 'ai' ? 'items-start' : 'items-end'}`}>
                            <div className={`max-w-[90%] p-3 rounded-2xl text-xs font-bold arabic-font ${entry.role === 'ai' ? 'bg-emerald-50 text-emerald-900 rounded-tl-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tr-none shadow-sm'}`}>
                              {entry.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                  <button 
                    onClick={handlePrint}
                    className="flex-1 bg-[#2563eb] hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-200 transition-all active:scale-95"
                  >
                    <Download size={20} /> {t.downloadBtn}
                  </button>
                  <button 
                    onClick={() => { setShowSummary(false); setSetupMode(true); }}
                    className="px-10 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl"
                  >
                    {t.closeBtn}
                  </button>
                </div>
              </div>
            </div>
          )}

          {speakingBranch === 'booth' ? (
            <SpeakingCallBooth
              lang={lang}
              contact={selectedCallContact}
              level={selectedLevel?.en || 'Beginner'}
              isActive={isActive}
              loading={loading}
              isAiSpeaking={isAiSpeaking}
              micMuted={micMuted}
              recoveryNotice={recoveryNotice || error}
              history={conversationHistory}
              learnerText={userTranscription}
              tutorText={aiTranscription}
              onSelectContact={(id) => {
                if (isActive || loading) return;
                const contact = CALL_CONTACTS.find(item => item.id === id);
                if (contact) { setSelectedCallContact(contact); setRecoveryNotice(null); setError(null); }
              }}
              onShowDirectory={() => setShowMobileOptions(true)}
              onStart={() => startSession()}
              onStop={() => stopSession()}
              onResume={() => startSession(true)}
              onToggleMic={toggleMicrophone}
              meterRef={phoneMeterRef}
            />
          ) : setupMode ? (
            <AnimatePresence mode="wait">
              {!selectedLevel ? (
                <motion.div 
                  key="no-level"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-6 p-6"
                >
                  <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <StudioMicIcon size={64} strokeWidth={2.4} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 arabic-font mb-2">{t.selectLevelFirst}</h2>
                    <p className="text-slate-400 font-bold max-w-sm mx-auto">{t.subtitle}</p>
                  </div>
                </motion.div>
              ) : !selectedTopic ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-6 p-6"
                >
                  <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center text-[#2563eb] animate-pulse">
                    <StudioMicIcon size={64} strokeWidth={2.4} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 arabic-font mb-2">{t.chooseTopic}</h2>
                    <p className="text-slate-400 font-bold max-w-sm mx-auto">{t.subtitle}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="setup"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full min-h-0 overflow-y-auto flex flex-col items-center justify-center px-4 py-6 sm:p-6 gap-4 sm:gap-8"
                >
                  <button type="button" onClick={() => setShowMobileOptions(true)}
                    className="lg:hidden text-sm font-bold text-blue-700 border border-blue-200 rounded-xl px-4 py-2 bg-blue-50">
                    {lang === 'ar' ? 'تغيير المستوى أو الموضوع' : 'Change level or topic'}
                  </button>
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center text-[#2563eb] shadow-sm mx-auto">
                      <span className="text-5xl">{selectedTopic.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 arabic-font leading-none">
                        {lang === 'ar' ? selectedTopic.ar : selectedTopic.en}
                      </h2>
                      <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">
                        {selectedTopic.en} • {selectedLevel.ar}
                      </p>
                    </div>
                  </div>

                  <div className="max-w-md w-full bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-xl space-y-5 sm:space-y-6">
                    <div className="space-y-2">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">{t.setupTitle}</p>
                      <p className="text-sm text-slate-500 text-center arabic-font leading-relaxed">
                        {lang === 'ar' ? selectedLevel.descriptionAr : selectedLevel.descriptionEn}
                      </p>
                    </div>

                    {practiceGoal && (
                      <p className="rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 p-3 text-sm arabic-font" dir="rtl">
                        {lang === 'ar' ? 'هدف المحادثة: ' : 'Practice goal: '}{practiceGoal}
                      </p>
                    )}
                    {error && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3 text-red-600 animate-in fade-in">
                        <AlertCircle size={16} />
                        <p className="text-xs font-bold">{error}</p>
                        <button onClick={() => startSession()} className="mr-auto bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase"><RefreshCw size={10} className="inline mr-1" /> {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}</button>
                      </div>
                    )}

                    <button
                      onClick={() => startSession()}
                      disabled={loading}
                      className="w-full py-5 bg-gradient-to-r from-[#2563eb] to-[#059669] text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 size={28} className="animate-spin" /> : <StudioMicIcon size={28} strokeWidth={2.5} />}
                      <span className="arabic-font">{t.start}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="h-full min-h-0 flex flex-col items-center justify-center p-4 sm:p-6 relative">
              {!isActive && recoveryNotice && (
                <div className="relative z-20 w-full max-w-xl rounded-2xl border border-amber-200 bg-amber-50/95 p-4 text-center shadow-lg" role="alert">
                  <p className="text-sm font-bold text-amber-900 arabic-font mb-3">{recoveryNotice}</p>
                  <button onClick={() => startSession(true)} disabled={loading}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
                    {loading ? (lang === 'ar' ? 'جارٍ الاتصال...' : 'Connecting...') : (lang === 'ar' ? 'استئناف الحوار' : 'Resume conversation')}
                  </button>
                  <p className="text-xs text-amber-700 mt-2">{lang === 'ar' ? 'أو أنهِ الجلسة للحصول على التقرير.' : 'Or end the session to see your report.'}</p>
                </div>
              )}
              <div className="absolute top-2 sm:top-6 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <div className="text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">
                    {isActive ? (isAiSpeaking ? t.speaking : t.listening) : 'Offline'}
                  </span>
                  <span className="text-[11px] text-[#2563eb] font-bold arabic-font">{activeTopic?.ar} • {selectedLevel?.ar}</span>
                </div>
              </div>

              <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center overflow-hidden">
                <div className="relative w-52 h-52 sm:w-64 sm:h-64 shrink-0 flex items-center justify-center rounded-[3rem] border border-white/80 bg-gradient-to-br from-white via-blue-50/80 to-cyan-100/70 shadow-[0_18px_80px_rgba(37,99,235,0.17)]" aria-label={lang === 'ar' ? 'استوديو المحادثة' : 'Conversation studio'}>
                  <div className={`absolute inset-4 rounded-[2.3rem] border border-blue-200/50 bg-white/25 backdrop-blur-xl ${isAiSpeaking ? 'animate-pulse' : ''}`}></div>
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <StudioMicIcon size={48} strokeWidth={1.6} className={isAiSpeaking ? 'text-blue-600' : 'text-slate-700'} />
                    <div ref={micMeterRef} className={`flex h-12 items-center justify-center gap-1 ${isAiSpeaking ? 'opacity-40' : ''}`} style={{ '--mic-scale': 0.12 } as React.CSSProperties} aria-hidden="true">
                      {Array.from({ length: 19 }, (_, i) => (
                        <span key={i} className="w-[3px] rounded-full bg-gradient-to-t from-blue-600 to-cyan-400 transition-transform duration-75"
                          style={{ height: 12 + Math.round(30 * Math.abs(Math.sin((i + 1) * 0.43))) + 'px',
                            transform: 'scaleY(var(--mic-scale, 0.12))' }} />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold tracking-widest text-blue-700 uppercase">
                      {micMuted ? (lang === 'ar' ? 'الميكروفون مغلق' : 'Mic muted') : isAiSpeaking
                        ? (lang === 'ar' ? 'المعلم يتحدث' : 'Tutor speaking')
                        : (lang === 'ar' ? 'أسمعك' : 'Listening')}
                    </span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-8 space-y-3 w-full max-w-2xl overflow-y-auto custom-scroll px-2 max-h-[40%]" aria-live="polite">
                  {conversationHistory.slice(-6).map((entry, idx) => (
                    <div key={conversationHistory.length - 6 + idx}
                      className={`p-3 border rounded-2xl ${entry.role === 'ai' ? 'bg-emerald-50/70 border-emerald-100' : 'bg-white border-slate-100'}`}>
                      <p className="text-[10px] font-bold text-slate-500 mb-1">{entry.role === 'ai' ? t.tutorName : t.userName}</p>
                      <p className="text-sm arabic-font text-slate-700 leading-relaxed" dir="auto">{entry.text}</p>
                    </div>
                  ))}
                  {userTranscription && (
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-1">
                      <p className="text-[9px] font-black text-slate-300 uppercase mb-1">{t.userName}</p>
                      <p className="text-sm font-bold arabic-font text-slate-700">{userTranscription}</p>
                    </div>
                  )}
                  {aiTranscription && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-1 relative group">
                      <p className="text-[9px] font-black text-emerald-300 uppercase mb-1">{t.tutorName}</p>
                      <p className="text-base font-black arabic-font text-emerald-700 leading-relaxed">{aiTranscription}</p>
                      
                      {!spellingChallenge && !isAiSpeaking && (
                        <button 
                          onClick={() => startSpellingChallenge(aiTranscription)}
                          disabled={isGeneratingChallenge}
                          className="absolute top-4 left-4 p-2 bg-white text-emerald-600 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110 disabled:opacity-50"
                          title="Spelling Challenge"
                        >
                          {isGeneratingChallenge ? <Loader2 size={16} className="animate-spin" /> : <PenTool size={16} />}
                        </button>
                      )}
                    </div>
                  )}

                  {spellingChallenge && (
                    <div className="p-6 bg-white border-2 border-blue-100 rounded-[2rem] shadow-xl animate-in zoom-in-95 duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <PenTool size={18} />
                          </div>
                          <h4 className="text-sm font-black text-slate-800 arabic-font">{lang === 'ar' ? 'تحدي الإملاء' : 'Spelling challenge'}</h4>
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {spellingChallenge.currentIdx + 1} / {spellingChallenge.words.length}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="text-center py-4">
                          <p className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-tighter">{lang === 'ar' ? 'اكتب ما سمعت:' : 'Type what you heard:'}</p>
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => speakWord(spellingChallenge.words[spellingChallenge.currentIdx])}
                              className="p-3 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-all"
                            >
                              <Volume2 size={20} />
                            </button>
                          </div>
                        </div>

                        <div className="relative">
                          <input 
                            type="text"
                            value={spellingChallenge.input}
                            onChange={(e) => setSpellingChallenge({...spellingChallenge, input: e.target.value, result: null})}
                            onKeyDown={(e) => e.key === 'Enter' && checkSpelling()}
                            placeholder="..."
                            className={`w-full p-4 bg-slate-50 border-2 rounded-2xl text-center text-xl font-black arabic-font transition-all outline-none ${
                              spellingChallenge.result === 'correct' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                              spellingChallenge.result === 'incorrect' ? 'border-red-500 bg-red-50 text-red-700' :
                              'border-slate-100 focus:border-blue-500 focus:bg-white'
                            }`}
                            autoFocus
                          />
                          {spellingChallenge.result === 'correct' && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in">
                              <CheckCircle2 size={24} />
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button 
                            onClick={checkSpelling}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-200 active:scale-95 transition-all"
                          >
                            {lang === 'ar' ? 'تحقق' : 'Check'}
                          </button>
                          <button 
                            onClick={() => setSpellingChallenge(null)}
                            className="px-6 py-3 bg-slate-100 text-slate-400 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
                          >
                            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-4 shrink-0">
                <button onClick={toggleMicrophone} disabled={!isActive}
                  className={`rounded-2xl border px-4 py-4 font-bold text-sm flex items-center gap-2 disabled:opacity-40 ${micMuted ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-700'}`}>
                  {micMuted ? <MicOff size={22} /> : <Mic size={22} />}
                  <span>{micMuted ? (lang === 'ar' ? 'تشغيل الميكروفون' : 'Unmute') : (lang === 'ar' ? 'كتم' : 'Mute')}</span>
                </button>
                <button onClick={stopSession}
                  className="rounded-2xl bg-slate-900 hover:bg-black text-white px-4 sm:px-8 py-4 font-black text-sm sm:text-base shadow-xl transition-all active:scale-95 flex items-center gap-2">
                  <CheckCircle2 size={22} />
                  <span className="arabic-font">{t.stop}</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Hidden Worksheet Template for PDF Generation */}
      <div className="fixed left-[-9999px] top-0 no-print" dir="rtl">
        {/* Page 1: Summary */}
        <div 
          ref={summaryPrintRef}
          className="w-[800px] bg-white p-12 text-slate-900 arabic-font"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-center">
            <div className="w-1/3">
              <h1 className="text-base font-bold max-w-[200px] leading-[2] pb-2">{activeTopic?.ar || 'محادثة عامة'}</h1>
              <p className="text-slate-400 text-[10px] uppercase font-bold">{selectedLevel?.ar || 'مستوى عام'}</p>
            </div>
            <div className="w-1/3 text-center">
              <h2 className="text-2xl font-black leading-relaxed pb-2">تقرير المحادثة الذكي</h2>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-3" dir="ltr">
              <img 
                src="/Logo.png" 
                alt="شعار منصة قُل" 
                className="w-12 h-12 object-contain shrink-0" 
              />
              <div className="text-left">
                <div className="text-xl font-black tracking-tighter text-slate-900 leading-tight">
                  قُل / QUL
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Interactive Learning</div>
              </div>
            </div>
          </div>

          {/* Learner Info */}
          <div className="flex gap-10 mb-8 border-b border-slate-100 pb-4">
            <div className="flex-1 flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">اسم المتعلم:</span>
              <div className="flex-1 border-b border-slate-300 h-6"></div>
            </div>
            <div className="w-1/3 flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">التاريخ:</span>
              <div className="flex-1 border-b border-slate-300 h-6 text-sm flex items-end font-sans">
                {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

          {/* Transcript-based evidence is not a test of acoustic pronunciation. */}
          <div className="mb-7 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm leading-relaxed">
            <p className="font-bold text-slate-800">مؤشرات النشاط من النص المكتوب</p>
            <p className="mt-2 text-slate-600">مداخلات الطالب: {speakingEvidence.learnerTurns} | الكلمات العربية: {speakingEvidence.arabicWords} | الكلمات المختلفة: {speakingEvidence.uniqueArabicWords}</p>
            <p className="mt-2 text-xs text-slate-500">هذه مؤشرات تفريغ نصي ولا تقيس جودة النطق أو الطلاقة الصوتية.</p>
            {insights?.assessmentStatus === 'limited' && <p className="text-amber-800 text-xs mt-2">تعذر تحليل لغوي موثوق لهذه الجلسة.</p>}
          </div>

          {insights && (
            <div className="mb-7 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-sm leading-relaxed">
              <p className="font-bold text-slate-800">المهمة المقترحة التالية</p>
              <p className="mt-2 arabic-font">{nextPractice.promptAr}</p>
              <p className="mt-1 text-xs text-slate-600" dir="ltr">{nextPractice.promptEn}</p>
            </div>
          )}

          {/* Section 1: Tutor Advice */}
          {insights && (
            <div className="mb-10">
              <h2 className="text-lg font-bold bg-slate-100 p-3 rounded-lg mb-4 border-r-4 border-blue-600">نصيحة المعلم الذكي</h2>
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <p className="text-md font-bold mb-3 leading-relaxed text-slate-800">{insights.tutor_tip_ar}</p>
                <div className="border-t border-blue-100 pt-3" dir="ltr">
                  <p className="text-xs italic text-slate-500">{insights.tutor_tip_en}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Key Vocabulary */}
          {insights && (
            <div className="mb-10">
              <h2 className="text-lg font-bold bg-slate-100 p-3 rounded-lg mb-4 border-r-4 border-emerald-600">الكلمات والمصطلحات الجديدة المكتسبة</h2>
              <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                {insights.key_vocabulary.map((v: any, i: number) => (
                  <div key={i} className="flex justify-between items-center border-b border-slate-100 py-2.5">
                    <span className="text-sm font-bold text-slate-800">{v.word}</span>
                    <span className="text-xs text-slate-400 font-sans" dir="ltr">{v.translation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Performance Summary */}
          {insights && (
            <div className="mb-10">
              <h2 className="text-lg font-bold bg-slate-100 p-3 rounded-lg mb-4 border-r-4 border-slate-900">ملخص الأداء والتقييم</h2>
              <div className="p-6 border border-slate-200 rounded-2xl leading-relaxed text-sm text-slate-700 bg-slate-50/30">
                {insights.summary}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em]">Generated by Qul Interactive Platform - {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Page 2+: Dialogue Log */}
        <div 
          ref={transcriptPrintRef}
          className="w-[800px] bg-white p-12 text-slate-900 arabic-font"
        >
          {/* Header for Transcript Page */}
          <div className="transcript-header border-b-2 border-slate-900 pb-4 mb-10 flex justify-between items-center">
            <h2 className="text-xl font-black">سجل الحوار الكامل (The Full Transcript)</h2>
            <div className="flex items-center gap-2" dir="ltr">
              <img src="/Logo.png" alt="شعار منصة قُل" className="w-8 h-8 object-contain shrink-0" />
              <div className="text-lg font-black tracking-tighter text-slate-900">قُل / QUL</div>
            </div>
          </div>

          <div className="space-y-8">
            {conversationHistory.filter(h => h.text.trim()).map((entry, i) => {
              const isArabicText = /[\u0600-\u06FF]/.test(entry.text);
              return (
                <div key={i} className="transcript-message flex flex-col" dir={isArabicText ? 'rtl' : 'ltr'}>
                   <div className={`flex items-center gap-2 mb-2 ${isArabicText ? 'justify-start' : 'justify-start'}`}>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${entry.role === 'ai' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'} ${!isArabicText ? 'uppercase tracking-widest' : ''}`}>
                        {entry.role === 'ai' ? (isArabicText ? 'المعلم الذكي' : 'AI Teacher') : (isArabicText ? 'المتعلم' : 'Learner')}
                      </span>
                   </div>
                   <div className={`p-5 rounded-2xl text-base leading-relaxed ${entry.role === 'ai' ? 'bg-slate-50/80 border border-slate-100' : 'bg-white border border-slate-200 shadow-sm'}`}>
                      {entry.text}
                   </div>
                </div>
              );
            })}
          </div>

          {/* Transcript Footer */}
          <div className="mt-12 pt-6 border-t border-slate-50 text-center">
             <p className="text-[10px] text-slate-300 uppercase tracking-widest font-sans">End of Professional Conversation Transcript</p>
          </div>
        </div>
      </div>
    </div>
  );
};