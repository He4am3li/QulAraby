
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Volume2, Globe, Sparkles, Loader2, Activity, AlertCircle, RefreshCw, 
  ChevronRight, UserCircle2, MessageCircle, FileText, Download, X, Lightbulb, 
  BookmarkPlus, CheckCircle2, History, Brain, PenTool
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FallingLetters } from '../components/Layout';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { generateSessionInsights, translateAndExpand, generateSpeech, decodeAudioData, speak as globalSpeak } from '../services/gemini';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '../components/AuthProvider';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';

const LEVELS = [
  { 
    id: 'beginner', 
    ar: 'مبتدئ', 
    en: 'Beginner', 
    prompt: 'Speak primarily in English to guide the learner. Introduce very basic Arabic words slowly. The goal is for the learner to recognize common words and sentences in the chosen topic. Build their confidence using English as the bridge of communication.' 
  },
  { 
    id: 'intermediate', 
    ar: 'متوسط', 
    en: 'Intermediate', 
    prompt: 'Speak exclusively in natural Arabic. Do NOT speak any English words or translations out loud. Your voice output must be 100% Arabic. However, in your text transcript output, you MUST provide the English translation in parentheses after each Arabic sentence. The goal is for the learner to use topic words in simple situations and short dialogues related to the topic. Correct the user when they make mistakes.' 
  },
  { 
    id: 'advanced', 
    ar: 'متقدم', 
    en: 'Advanced', 
    prompt: 'Speak exclusively in Arabic. Use academic or professional vocabulary. Do not use English at all. The goal is for the learner to deepen into the topic and express it with longer sentences and more complex situations. Engage in complex and deep discussions.' 
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
  { id: 'free', ar: 'حر', en: 'Free', icon: '✨', color: 'cyan' },
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
  const [showSummary, setShowSummary] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [generatingInsights, setGeneratingInsights] = React.useState(false);
  const [selectedLevel, setSelectedLevel] = React.useState<typeof LEVELS[0] | null>(null);
  const [selectedTopic, setSelectedTopic] = React.useState<typeof TOPICS[0] | null>(null);
  
  const [userTranscription, setUserTranscription] = React.useState('');
  const [aiTranscription, setAiTranscription] = React.useState('');
  const [conversationHistory, setConversationHistory] = React.useState<ChatEntry[]>([]);
  const [insights, setInsights] = React.useState<any>(null);
  const [savedWords, setSavedWords] = React.useState<string[]>([]);
  
  const [isAiSpeaking, setIsAiSpeaking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const inputAudioContextRef = React.useRef<AudioContext | null>(null);
  const sessionRef = React.useRef<any>(null);
  const nextStartTimeRef = React.useRef<number>(0);
  const sourcesRef = React.useRef<Set<AudioBufferSourceNode>>(new Set());
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
      vocabTitle: 'كلمات جديدة مكتسبة',
      correctionsTitle: 'تصحيحات لغوية',
      tipTitle: 'نصيحة المعلم الذكي',
      saveVocab: 'حفظ للبنك',
      saved: 'تم الحفظ',
      selectTopic: 'اختر موضوعاً للمحادثة',
      selectLevel: 'اختر مستواك اللغوي',
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
      vocabTitle: 'New Vocabulary',
      correctionsTitle: 'Corrections',
      tipTitle: 'AI Tutor Tip',
      saveVocab: 'Save to Bank',
      saved: 'Saved',
      selectTopic: 'Select a topic',
      selectLevel: 'Select your level',
      pleaseSelect: 'Please select topic and level to start',
      historyTitle: 'Full Transcript'
    }
  };

  const t = STRINGS[lang];

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

  const createBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
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

  const startSession = async (retryCount = 0) => {
    if (!selectedLevel || !selectedTopic) return;
    setLoading(true);
    setError(null);
    setConversationHistory([]);
    setInsights(null);
    setSavedWords([]);
    
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
      const output = contexts.output;
      const input = contexts.input;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e: any) {
        setError(t.permError);
        setLoading(false);
        return;
      }
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
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
          Topic: ${selectedTopic?.en} (${selectedTopic?.ar}). 
          
          ${proactiveContext}

          GOAL: You MUST start the conversation immediately. Do not wait for the user to speak first. 
          Greet the user by name if known, and then use the personalized context (if any) or the chosen topic to ask an engaging opening question.
          
          Always be encouraging, speak clearly, and guide the conversation to help the user practice.
          
          CRITICAL AUDIO RULE: 
          If you are in the Intermediate level, you MUST provide English translations in parentheses in your text output, BUT you MUST NOT speak them. 
          Your audio stream MUST ONLY contain the Arabic words. 
          Example: You write "أهلاً بك (Welcome)", but you ONLY say "أهلاً بك" in the audio.`,
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setSetupMode(false);
            setLoading(false);
            const source = input.createMediaStreamSource(stream);
            const scriptProcessor = input.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                try {
                  session.sendRealtimeInput({ audio: pcmBlob });
                } catch(err) {
                  console.debug("Error sending input", err);
                }
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(input.destination);
            sessionRef.current = { stream, scriptProcessor, source };
          },
          onmessage: async (message) => {
            if (message.serverContent?.inputTranscription) {
              setUserTranscription(prev => prev + message.serverContent.inputTranscription.text);
            }
            if (message.serverContent?.outputTranscription) {
              setAiTranscription(prev => prev + message.serverContent.outputTranscription.text);
            }
            
            if (message.serverContent?.turnComplete) {
              setUserTranscription(currUser => {
                setAiTranscription(currAi => {
                  if (currUser || currAi) {
                    setConversationHistory(prev => [
                      ...prev,
                      { role: 'user', text: currUser },
                      { role: 'ai', text: currAi }
                    ]);
                  }
                  return '';
                });
                return '';
              });
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setIsAiSpeaking(true);
              const ctx = output;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsAiSpeaking(false);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsAiSpeaking(false);
            }
          },
          onclose: () => {
            console.debug("Live Session Closed");
            setIsActive(false);
          },
          onerror: (e) => {
            console.error("Live Error", e);
            if (retryCount < 2) {
              console.warn("Live Session failed, retrying...");
              setTimeout(() => startSession(retryCount + 1), 2000);
            } else {
              setError(t.genError);
              setLoading(false);
              stopSession();
            }
          },
        },
      });
    } catch (err: any) {
      console.error("Start Error", err);
      if (retryCount < 2) {
        setTimeout(() => startSession(retryCount + 1), 2000);
      } else {
        setError(t.genError);
        setLoading(false);
      }
    }
  };

  const stopSession = async () => {
    if (sessionRef.current) {
      if (sessionRef.current.stream) sessionRef.current.stream.getTracks().forEach((t: any) => t.stop());
      if (sessionRef.current.scriptProcessor) sessionRef.current.scriptProcessor.disconnect();
      if (sessionRef.current.source) sessionRef.current.source.disconnect();
    }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    setIsActive(false);
    setIsAiSpeaking(false);
    setLoading(false);

    const finalHistory = [...conversationHistory];
    if (userTranscription || aiTranscription) {
       finalHistory.push({ role: 'user', text: userTranscription });
       finalHistory.push({ role: 'ai', text: aiTranscription });
       setConversationHistory(finalHistory);
    }
    
    setUserTranscription('');
    setAiTranscription('');
    
    if (finalHistory.length > 2) {
      setShowSummary(true);
      setGeneratingInsights(true);
      try {
        const data = await generateSessionInsights(finalHistory, selectedTopic.ar);
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
            topic: selectedTopic.ar,
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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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

      // Page 2+: Transcript
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

      pdf.save(`Qul_Conversation_Report_${selectedTopic?.en}_${new Date().toLocaleDateString()}.pdf`);
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
            <p className="text-xs text-slate-500 font-bold mt-1">الموضوع: {selectedTopic?.ar} | المستوى: {selectedLevel?.ar}</p>
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
        icon={Mic}
        lang={lang}
        onToggle={toggleLang}
      />

      <div className="flex-1 flex overflow-hidden bg-slate-50/30">
        
        {/* Sidebar - Topics & Levels */}
        <aside className="w-[280px] bg-white border-r rtl:border-r-0 rtl:border-l border-slate-100 flex flex-col shrink-0 no-print relative overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 overflow-y-auto custom-scroll flex-1">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t.topicLabel}</h3>
                <div className="space-y-3">
                    {TOPICS.map(topic => {
                        const color = TOPIC_COLORS[topic.color] || TOPIC_COLORS.blue;
                        return (
                          <button 
                              key={topic.id} 
                              onClick={() => {
                                  if (isActive) return;
                                  setSelectedTopic(topic);
                                  setSetupMode(true);
                                  setShowSummary(false);
                              }}
                              disabled={isActive}
                              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-right group ${selectedTopic?.id === topic.id ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 text-slate-500'} ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            </div>

            {/* Level Selection */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">{t.levelLabel}</p>
                <div className="flex flex-col gap-2">
                    {LEVELS.map(level => (
                        <button
                            key={level.id}
                            disabled={isActive}
                            onClick={() => setSelectedLevel(level)}
                            className={`w-full px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-between ${selectedLevel?.id === level.id ? 'bg-[#2563eb] text-white shadow-md' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'} ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="arabic-font leading-none">{level.ar}</span>
                            <span className="opacity-70 leading-none text-[10px]">{level.en}</span>
                        </button>
                    ))}
                </div>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedTopic?.ar} • {selectedLevel?.ar}</p>
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

          {setupMode ? (
            <div className="h-full flex flex-col items-center justify-center p-10 space-y-8 animate-in slide-in-from-bottom-5 duration-500">
              
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-[#2563eb] shadow-sm mx-auto">
                  <span className="text-5xl">{selectedTopic ? selectedTopic.icon : '✨'}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 arabic-font leading-none">
                    {selectedTopic ? selectedTopic.ar : t.selectTopic}
                  </h2>
                  <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">
                    {selectedTopic ? selectedTopic.en : 'Choose a topic'} • {selectedLevel ? selectedLevel.ar : t.selectLevel}
                  </p>
                </div>
              </div>

              <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">{t.setupTitle}</p>
                  <p className="text-sm text-slate-500 text-center arabic-font">
                    {selectedLevel ? selectedLevel.prompt : t.pleaseSelect}
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3 text-red-600 animate-in fade-in">
                    <AlertCircle size={16} />
                    <p className="text-xs font-bold">{error}</p>
                    <button onClick={() => startSession()} className="mr-auto bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase"><RefreshCw size={10} className="inline mr-1" /> Retry</button>
                  </div>
                )}

                <button
                  onClick={() => startSession()}
                  disabled={loading || !selectedTopic || !selectedLevel}
                  className="w-full py-5 bg-gradient-to-r from-[#2563eb] to-[#059669] text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={28} className="animate-spin" /> : <Mic size={28} />}
                  <span className="arabic-font">{t.start}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 relative">
              <div className="absolute top-6 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <div className="text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">
                    {isActive ? (isAiSpeaking ? t.speaking : t.listening) : 'Offline'}
                  </span>
                  <span className="text-[11px] text-[#2563eb] font-bold arabic-font">{selectedTopic?.ar} • {selectedLevel?.ar}</span>
                </div>
              </div>

              <div className="flex-1 w-full flex flex-col items-center justify-center overflow-hidden">
                <div className={`w-56 h-56 rounded-full flex items-center justify-center transition-all duration-500 relative shrink-0 ${isActive ? 'bg-blue-50 shadow-2xl shadow-blue-500/10' : 'bg-slate-100'}`}>
                  {isActive && (
                    <div className={`absolute inset-0 rounded-full border-2 border-blue-200 opacity-20 ${isAiSpeaking ? 'animate-ping' : ''}`} />
                  )}
                  <div className={`w-44 h-44 rounded-full flex items-center justify-center border-2 border-white shadow-inner transition-transform ${isAiSpeaking ? 'scale-110 shadow-blue-200' : 'scale-100'}`}>
                    <Activity size={80} className={`${isAiSpeaking ? 'text-[#2563eb]' : 'text-slate-400'} transition-colors duration-300`} />
                  </div>
                </div>

                <div className="mt-8 space-y-3 w-full max-w-2xl overflow-y-auto custom-scroll px-2 max-h-[40%]">
                  {userTranscription && (
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-1">
                      <p className="text-[9px] font-black text-slate-300 uppercase mb-1">You</p>
                      <p className="text-sm font-bold arabic-font text-slate-700">{userTranscription}</p>
                    </div>
                  )}
                  {aiTranscription && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-1 relative group">
                      <p className="text-[9px] font-black text-emerald-300 uppercase mb-1">AI Assistant</p>
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
                          <h4 className="text-sm font-black text-slate-800 arabic-font">تحدي الإملاء</h4>
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {spellingChallenge.currentIdx + 1} / {spellingChallenge.words.length}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="text-center py-4">
                          <p className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-tighter">Type what you heard:</p>
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
                            تحقق
                          </button>
                          <button 
                            onClick={() => setSpellingChallenge(null)}
                            className="px-6 py-3 bg-slate-100 text-slate-400 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={stopSession}
                className="mt-6 px-12 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95 flex items-center gap-3 shrink-0"
              >
                <MicOff size={24} />
                <span className="arabic-font">{t.stop}</span>
              </button>
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
              <h1 className="text-base font-bold max-w-[200px] leading-[2] pb-2">{selectedTopic?.ar || 'محادثة عامة'}</h1>
              <p className="text-slate-400 text-[10px] uppercase font-bold">{selectedLevel?.ar || 'مستوى عام'}</p>
            </div>
            <div className="w-1/3 text-center">
              <h2 className="text-2xl font-black leading-relaxed pb-2">تقرير المحادثة الذكي</h2>
            </div>
            <div className="w-1/3 text-left" dir="ltr">
              <div className="text-2xl font-black tracking-tighter text-slate-900 mb-1 leading-relaxed pb-2">
                QUL / قُل
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interactive Learning</div>
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
            <div className="text-xl font-black tracking-tighter text-slate-900" dir="ltr">QUL / قُل</div>
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