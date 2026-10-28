import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { 
  Eye, Play, Pause, Loader2, CheckCircle2, XCircle, RefreshCcw, 
  ChevronRight, Headphones, Headset, Music, 
  ArrowLeft, Zap, Layers, Star, 
  Volume2, MessageSquareText, Award, Radio as RadioIcon, Smile, 
  Phone, Mic, PhoneOff, MicOff, Compass, ArrowUpRight, Check, X, RefreshCw, Heart,
  PenTool, UserCircle, Speech, Disc
} from 'lucide-react';
import { generateSpeech, decodeAudioData, generateWordIllustration } from '../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { CassettePlayer } from '../components/CassettePlayer';
import { RadioThermalPrinter, RadioLearningStage } from '../components/RadioThermalPrinter';
import '../components/ListeningRadioRetouch.css';
import { STORY_CASSETTES } from '../src/data/storyCassettes';
import { drawRadioCorpusText } from '../src/data/radioShuffleBag';
import { RADIO_AUTHORED_EXERCISES } from '../src/data/radioAuthoredExercises';
import { getRadioDifficultWords } from '../src/data/radioVocabulary';
import type { RadioCorpusType } from '../src/data/radioTextCorpus';
import { useAuth } from '../components/AuthProvider';

const LEVELS = [
  { id: 'beginner', ar: 'مبتدئ', en: 'Beginner', icon: Zap, color: 'blue', prompt: 'Use very simple Arabic words and short sentences for children.' },
  { id: 'intermediate', ar: 'متوسط', en: 'Intermediate', icon: Layers, color: 'emerald', prompt: 'Use common Arabic vocabulary and natural sentence structures.' },
  { id: 'advanced', ar: 'متقدم', en: 'Advanced', icon: Headphones, color: 'navy', prompt: 'Use rich Arabic vocabulary, idioms, and complex sentence structures.' },
];

const TOPICS = [
  { id: 'dictation', ar: 'تحدي الإملاء', en: 'Spelling Challenge', icon: PenTool, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-600', activeBg: 'bg-blue-500', description: 'استمع للكلمة واكتبها بشكل صحيح.' },
  { id: 'emotions', ar: 'المشاعر', en: 'Emotions', icon: Heart, color: 'rose', bg: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-600', activeBg: 'bg-rose-500', description: 'افهم نبرة الصوت وحدد شعور المتحدث.' },
  { id: 'radio', ar: 'الراديو', en: 'Radio', icon: RadioIcon, color: 'amber', bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-600', activeBg: 'bg-amber-500', description: 'استمع لمحطات مختلفة واكتشف القصص والأخبار.' },
  {
    id: 'cassette_stories',
    ar: 'أشرطة الكاسيت',
    en: 'Cassettes',
    icon: Disc,
    color: 'amber',
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    text: 'text-amber-600',
    activeBg: 'bg-amber-500',
    description: 'استمع لنصوص وقصص التراث والقيم عبر أشرطة الكاسيت مع النص المتزامن.'
  },
];

const RADIO_STATIONS = [
  { id: 1, ar: 'موقف', en: 'Scenario', type: 'social scenario or situation' },
  { id: 2, ar: 'حوار', en: 'Dialogue', type: 'daily conversation or dialogue' },
  { id: 3, ar: 'قصة', en: 'Story', type: 'short story' },
  { id: 4, ar: 'لغز', en: 'Puzzle', type: 'audio puzzle or riddle' },
  { id: 5, ar: 'خبر', en: 'News', type: 'short news report' },
];

export const Listening: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('hub_lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  const [selectedLevel, setSelectedLevel] = React.useState<typeof LEVELS[0] | null>(null);
  const [selectedTopic, setSelectedTopic] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Radio State
  const [radioFrequency, setRadioFrequency] = React.useState(0);
  const [radioTextTitle, setRadioTextTitle] = React.useState('');
  const [radioTextSerial, setRadioTextSerial] = React.useState(0);
  const [radioContent, setRadioContent] = React.useState<any>(null);
  const [radioAudio, setRadioAudio] = React.useState<AudioBuffer | null>(null);
  const [radioRecordingUrl, setRadioRecordingUrl] = React.useState<string | null>(null);
  const radioRecordingRef = React.useRef<HTMLAudioElement | null>(null);
  const [isRadioPlaying, setIsRadioPlaying] = React.useState(false);
  const [radioListenStage, setRadioListenStage] = React.useState<RadioLearningStage>('first');
  const [radioPlaybackEndCount, setRadioPlaybackEndCount] = React.useState(0);
  const radioStationRequestRef = React.useRef(0);
  const radioNarrationRef = React.useRef<SpeechSynthesisUtterance | null>(null);
  const radioNarrationTokenRef = React.useRef(0);
  const [volume, setVolume] = React.useState(0.5);
  const [selectedWord, setSelectedWord] = React.useState<{ word: string, meaningEn: string, meaningAr: string } | null>(null);
  const [isWordSpeaking, setIsWordSpeaking] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);

  const startTimeRef = React.useRef<number>(0);
  const pausedAtRef = React.useRef<number>(0);

  // Call-in State
  const [isCalling, setIsCalling] = React.useState(false);
  const [isIncomingCall, setIsIncomingCall] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [callAudioUrl, setCallAudioUrl] = React.useState<string | null>(null);
  const callAudioUrlRef = React.useRef<string | null>(null);
  const [callError, setCallError] = React.useState('');
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const callTimerRef = React.useRef<any>(null);
  const [callSeconds, setCallSeconds] = React.useState(0);

  // Lip Reader State
  const [lipWord, setLipWord] = React.useState<any>(null);
  const [lipOptions, setLipOptions] = React.useState<any[]>([]);
  const [lipImage, setLipImage] = React.useState<string | null>(null);
  const [lipFeedback, setLipFeedback] = React.useState<any>(null);
  const [lipLoading, setLipLoading] = React.useState(false);

  // Emotions State
  const [emotionExercise, setEmotionExercise] = React.useState<any>(null);
  const [emotionFeedback, setEmotionFeedback] = React.useState<any>(null);
  const [emotionAudio, setEmotionAudio] = React.useState<AudioBuffer | null>(null);

  // Dictation State
  const [dictationWord, setDictationWord] = React.useState<string>('');
  const [dictationInput, setDictationInput] = React.useState<string>('');
  const [dictationFeedback, setDictationFeedback] = React.useState<any>(null);
  const [dictationLoading, setDictationLoading] = React.useState(false);
  const [dictationAudio, setDictationAudio] = React.useState<AudioBuffer | null>(null);
  const [showDictationKeyboard, setShowDictationKeyboard] = React.useState(false);

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const sourceNodeRef = React.useRef<AudioBufferSourceNode | null>(null);
  const staticNodeRef = React.useRef<AudioBufferSourceNode | null>(null);
  const crackleNodeRef = React.useRef<AudioBufferSourceNode | null>(null);
  const tuningOscRef = React.useRef<OscillatorNode | null>(null);
  const tuningOsc2Ref = React.useRef<OscillatorNode | null>(null);
  const extraOscillatorsRef = React.useRef<OscillatorNode[]>([]);
  const gainNodeRef = React.useRef<GainNode | null>(null);
  const staticGainNodeRef = React.useRef<GainNode | null>(null);

  React.useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
    if (staticGainNodeRef.current) {
      staticGainNodeRef.current.gain.value = volume * 0.3;
    }
    if (radioRecordingRef.current) radioRecordingRef.current.volume = volume;
  }, [volume]);

  React.useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  const STRINGS = {
    ar: {
      title: 'أكاديمية الاستماع',
      subtitle: 'طور مهاراتك السمعية بذكاء',
      lang: 'English',
      back: 'رجوع',
      radio: 'الراديو',
      lipReader: 'قارئ الشفاه',
      emotions: 'المشاعر',
      chooseTopic: 'اختر موضوعاً للبدء',
      frequency: 'تردد',
      listen: 'استمع',
      check: 'تحقق',
      wellDone: 'أحسنت!',
      tryAgain: 'حاول مرة أخرى',
      loading: 'جاري التحميل...',
      matchLips: 'ما هو الصوت الذي يتطابق مع حركة الشفاه؟',
      identifyEmotion: 'ما هو شعور المتحدث في هذه الجملة؟',
      happy: 'سعيد',
      sad: 'حزين',
      angry: 'غاضب',
      surprised: 'متفاجئ',
      neutral: 'هادئ',
      next: 'التالي',
      finish: 'إنهاء',
      studentLevel: 'المستوى:',
      selectLevelFirst: 'اختر المستوى أولاً',
      nextWord: 'كلمة أخرى',
      typeWord: 'اكتب الكلمة...',
      del: 'حذف',
      clear: 'مسح',
      done: 'تم',
      spellingChallenge: 'تحدي الإملاء',
      emotionsChallenge: 'تحدي المشاعر',
      visualAuditoryFocus: 'تدريب التركيز البصري السمعي',
    },
    en: {
      title: 'Listening Academy',
      subtitle: 'Develop your auditory skills smartly',
      lang: 'العربية',
      back: 'Back',
      radio: 'Radio',
      lipReader: 'Lip Reader',
      emotions: 'Emotions',
      chooseTopic: 'Choose a topic to start',
      frequency: 'Freq',
      listen: 'Listen',
      check: 'Check',
      wellDone: 'Well Done!',
      tryAgain: 'Try Again',
      loading: 'Loading...',
      matchLips: 'Which audio matches the lip movement?',
      identifyEmotion: 'What is the speaker\'s emotion?',
      happy: 'Happy',
      sad: 'Sad',
      angry: 'Angry',
      surprised: 'Surprised',
      neutral: 'Neutral',
      next: 'Next',
      finish: 'Finish',
      studentLevel: 'Level:',
      selectLevelFirst: 'Select Level First',
      nextWord: 'Next Word',
      typeWord: 'Type word...',
      del: 'Del',
      clear: 'Clear',
      done: 'Done',
      spellingChallenge: 'Spelling Challenge',
      emotionsChallenge: 'Emotions Challenge',
      visualAuditoryFocus: 'Visual-Auditory Focus Training',
    }
  };

  const t = STRINGS[lang];

  const initAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume;
      gainNodeRef.current.connect(audioContextRef.current.destination);

      staticGainNodeRef.current = audioContextRef.current.createGain();
      staticGainNodeRef.current.gain.value = volume * 0.3;
      staticGainNodeRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    return audioContextRef.current;
  };

  const stopStatic = () => {
    if (staticNodeRef.current) {
      try { staticNodeRef.current.stop(); } catch(e) {}
      staticNodeRef.current = null;
    }
    if (crackleNodeRef.current) {
      try { crackleNodeRef.current.stop(); } catch(e) {}
      crackleNodeRef.current = null;
    }
    if (tuningOscRef.current) {
      try { tuningOscRef.current.stop(); } catch(e) {}
      tuningOscRef.current = null;
    }
    if (tuningOsc2Ref.current) {
      try { tuningOsc2Ref.current.stop(); } catch(e) {}
      tuningOsc2Ref.current = null;
    }
    extraOscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    extraOscillatorsRef.current = [];
  };

  const stopRadioNarration = () => {
    radioNarrationTokenRef.current += 1;
    if (radioRecordingRef.current) {
      radioRecordingRef.current.pause();
      radioRecordingRef.current.currentTime = 0;
      radioRecordingRef.current.onended = null;
    }
    if (radioNarrationRef.current && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    radioNarrationRef.current = null;
  };

  // Prefer a pre-recorded human/natural MP3 when /public/assets/radio/<id>.mp3
  // exists. Static playback consumes ZERO AI tokens. When it does not exist,
  // fall back to the device's Arabic Web Speech voice (quality is OS-dependent).
  const playRadioNarration = (restart = false) => {
    if (radioRecordingUrl) {
      const recording = radioRecordingRef.current || new Audio();
      radioRecordingRef.current = recording;
      if (recording.src !== new URL(radioRecordingUrl, window.location.href).href) {
        recording.pause();
        recording.src = radioRecordingUrl;
      }
      recording.volume = volume;
      if (restart) recording.currentTime = 0;
      else if (!recording.paused) {
        recording.pause();
        setIsRadioPlaying(false);
        setIsPaused(true);
        return;
      }
      const token = radioNarrationTokenRef.current;
      recording.onended = () => {
        if (token !== radioNarrationTokenRef.current) return;
        setIsRadioPlaying(false); setIsPaused(false);
        setRadioPlaybackEndCount(n => n + 1);
      };
      void recording.play().then(() => {
        if (token === radioNarrationTokenRef.current) {
          setIsRadioPlaying(true); setIsPaused(false); setError(null);
        }
      }).catch(() => {
        setRadioRecordingUrl(null);
        if (token === radioNarrationTokenRef.current) setError(
          lang === 'ar' ? 'تعذّر تشغيل التسجيل؛ استخدم الصوت المتاح على جهازك.' :
          'Recording unavailable; use your device voice.'
        );
      });
      return;
    }
    if (!radioContent?.transcript || !('speechSynthesis' in window) ||
        typeof SpeechSynthesisUtterance === 'undefined') {
      setError(lang === 'ar'
        ? 'المتصفح لا يدعم قراءة النص صوتيًا. جرّب متصفحًا أحدث.'
        : 'This browser does not support speech playback.');
      return;
    }
    const synth = window.speechSynthesis;
    if (!restart && radioNarrationRef.current) {
      if (synth.paused) {
        synth.resume();
        setIsRadioPlaying(true); setIsPaused(false);
        return;
      }
      if (synth.speaking) {
        synth.pause();
        setIsRadioPlaying(false); setIsPaused(true);
        return;
      }
    }
    stopRadioNarration();
    const token = radioNarrationTokenRef.current;
    const requestId = radioStationRequestRef.current;
    // Imported Word text has occasional isolated final alifs and legacy vowel
    // glyphs. Clean only for pronunciation, never alter its stored questions.
    const speechText = String(radioContent.transcript)
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/([\u0621-\u064A])\s+ا(?=[\s،.!؟؛]|$)/g, '$1ا')
      .replace(/\s+([،.؛:؟!])/g, '$1')
      .replace(/([،.؛:؟!])(?=\S)/g, '$1 ')
      .replace(/\s+/g, ' ')
      .trim();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'ar-SA';
    utterance.rate = selectedLevel?.id === 'beginner' ? 0.83 : selectedLevel?.id === 'intermediate' ? 0.91 : 0.97;
    utterance.pitch = 1;
    utterance.volume = Math.max(0, Math.min(1, volume));
    const voices = synth.getVoices().filter(v => /^ar([_-]|$)/i.test(v.lang));
    const voice = voices.find(v => /natural|premium|enhanced|neural/i.test(v.name)) ||
      voices.find(v => /google/i.test(v.name)) ||
      voices.find(v => v.localService) || voices[0];
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      if (token !== radioNarrationTokenRef.current ||
          requestId !== radioStationRequestRef.current) return;
      radioNarrationRef.current = null;
      setIsRadioPlaying(false); setIsPaused(false);
      setRadioPlaybackEndCount(n => n + 1);
    };
    utterance.onerror = event => {
      if (token !== radioNarrationTokenRef.current ||
          requestId !== radioStationRequestRef.current) return;
      radioNarrationRef.current = null;
      setIsRadioPlaying(false); setIsPaused(false);
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        setError(lang === 'ar' ? 'تعذّر تشغيل الصوت من جهازك.' : 'Speech playback failed on this device.');
      }
    };
    radioNarrationRef.current = utterance;
    setIsRadioPlaying(true); setIsPaused(false); setError(null);
    synth.speak(utterance);
  };

  React.useEffect(() => {
    return () => {
      radioStationRequestRef.current += 1;
      radioNarrationTokenRef.current += 1;
      if (radioNarrationRef.current && 'speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch {}
        radioNarrationRef.current = null;
      }
      radioRecordingRef.current?.pause();
      radioRecordingRef.current = null;
      if (callAudioUrlRef.current) URL.revokeObjectURL(callAudioUrlRef.current);
    };
  }, []);

  const stopAudio = () => {
    stopRadioNarration();
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
      sourceNodeRef.current = null;
    }
    setIsRadioPlaying(false);
    setIsPaused(false);
    pausedAtRef.current = 0;
    stopStatic();
  };

  const playBuffer = async (buffer: AudioBuffer, fromBeginning = false) => {
    const ctx = await initAudio();

    if (fromBeginning) {
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch {}
        sourceNodeRef.current = null;
      }
      pausedAtRef.current = 0;
    } else if (isRadioPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      pausedAtRef.current = ctx.currentTime - startTimeRef.current;
      setIsRadioPlaying(false);
      setIsPaused(true);
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNodeRef.current!);
    
    const offset = isPaused ? pausedAtRef.current : 0;
    const startOffset = offset >= buffer.duration ? 0 : offset;
    
    startTimeRef.current = ctx.currentTime - startOffset;
    source.start(0, startOffset);

    source.onended = () => {
      if (sourceNodeRef.current === source) {
        setIsRadioPlaying(false);
        setIsPaused(false);
        pausedAtRef.current = 0;
        sourceNodeRef.current = null;
        // Completion means the whole audio has finished naturally, never a pause
        // or a station change. This advances the cassette-style printer steps.
        if (selectedTopic?.id === 'radio' && radioAudio === buffer) {
          setRadioPlaybackEndCount(previous => previous + 1);
        }
      }
    };

    sourceNodeRef.current = source;
    setIsRadioPlaying(true);
    setIsPaused(false);
  };

  // --- Logic Helpers ---

  const loadDictation = async () => {
    if (!selectedLevel) return;
    setDictationLoading(true);
    setDictationFeedback(null);
    setDictationInput('');
    setDictationAudio(null);
    stopAudio();

    try {
      let words = ['تفاحة', 'كتاب', 'مدرسة', 'قلم', 'بيت', 'شمس', 'قمر', 'بحر'];
      if (selectedLevel.id === 'intermediate') {
        words = ['مستشفى', 'طائرة', 'مهندس', 'حديقة', 'سيارة', 'جامعة', 'عائلة', 'صديق'];
      } else if (selectedLevel.id === 'advanced') {
        words = ['حضارة', 'اكتشاف', 'تكنولوجيا', 'مستقبل', 'اجتماعي', 'اقتصادي', 'ثقافي', 'سياسي'];
      }
      
      const targetWord = words[Math.floor(Math.random() * words.length)];
      setDictationWord(targetWord);
      
      const audioBytes = await generateSpeech(targetWord, 'ar');
      if (audioBytes) {
        const ctx = await initAudio();
        const buffer = await decodeAudioData(audioBytes, ctx);
        setDictationAudio(buffer);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load dictation word");
    } finally {
      setDictationLoading(false);
    }
  };

  const checkDictation = () => {
    const isCorrect = dictationInput.trim() === dictationWord.trim();
    setDictationFeedback({
      isCorrect,
      messageAr: isCorrect ? 'إجابة صحيحة! أحسنت صنعاً.' : `للأسف، الكلمة الصحيحة هي: ${dictationWord}`,
      messageEn: isCorrect ? 'Correct! Well done.' : `Correction: ${dictationWord}`
    });
  };

  const loadLipReader = async () => {
    if (!selectedLevel) return;
    setLipLoading(true);
    setLipFeedback(null);
    setLipImage(null);
    stopAudio();
    try {
      let words = ['نور', 'نجم', 'جبل', 'بحر', 'قلم', 'فخر', 'عطاء', 'صبر'];
      if (selectedLevel.id === 'intermediate') words = ['عدالة', 'شجاعة', 'إخلاص', 'تفوق', 'وطن', 'أمل', 'إرادة', 'سلام'];
      else if (selectedLevel.id === 'advanced') words = ['فصاحة', 'بلاغة', 'ابتكار', 'حضارة', 'فلسفة', 'إرث', 'شموخ', 'جوهر'];
      const correctWord = words[Math.floor(Math.random() * words.length)];
      const otherWords = words.filter(w => w !== correctWord).sort(() => 0.5 - Math.random()).slice(0, 2);
      const options = [correctWord, ...otherWords].sort(() => 0.5 - Math.random());
      setLipWord(correctWord);
      setLipOptions(options);
      const qulPrompt = `Cinematic Arabic luxury representation of ${correctWord}, Absolute Black background, gold lighting.`;
      const imgData = await generateWordIllustration(correctWord, qulPrompt);
      setLipImage(imgData);
    } catch (e) {
      console.error(e);
      setError("Failed to load lip reader");
    } finally {
      setLipLoading(false);
    }
  };

  const loadEmotions = async () => {
    if (!selectedLevel) return;
    setLoading(true);
    setEmotionFeedback(null);
    setEmotionAudio(null);
    stopAudio();
    const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral'];
    const targetEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    let sentences = ["سأذهب إلى هناك غداً في الصباح الباكر.", "هل رأيت ما حدث في الخارج قبل قليل؟"];
    if (selectedLevel.id === 'intermediate') sentences = ["الجو اليوم مختلف تماماً عما كان عليه بالأمس.", "لا أصدق أننا وصلنا إلى هذه النتيجة أخيراً."];
    else if (selectedLevel.id === 'advanced') sentences = ["إن تداعيات هذا القرار ستظهر جلياً في المستقبل القريب.", "لم أكن أتخيل أن الأمور ستسير بهذا التعقيد."];
    try {
      const sentence = sentences[Math.floor(Math.random() * sentences.length)];
      setEmotionExercise({ sentence, emotion: targetEmotion });
      const audioBytes = await generateSpeech(sentence, 'ar');
      if (audioBytes) {
        const ctx = await initAudio();
        const buffer = await decodeAudioData(audioBytes, ctx);
        setEmotionAudio(buffer);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load emotion exercise");
    } finally {
      setLoading(false);
    }
  };

  const startStatic = async () => {
    const ctx = await initAudio();
    if (staticNodeRef.current) return;
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        output[i] = pink * 0.15;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.value = 8;
    noiseSource.connect(filter);
    filter.connect(staticGainNodeRef.current!);
    noiseSource.start();
    staticNodeRef.current = noiseSource;
  };

  const loadRadioStation = async (stationId: number) => {
    if (!selectedLevel) return;
    const station = RADIO_STATIONS.find(s => s.id === stationId);
    if (!station) return;

    const requestId = ++radioStationRequestRef.current;
    const category: Record<number, RadioCorpusType> = {
      1: 'scenario', 2: 'dialogue', 3: 'story', 4: 'riddle', 5: 'news'
    };

    setRadioFrequency(stationId);
    setRadioTextTitle('');
    setRadioTextSerial(n => n + 1);
    setError(null);
    setLoading(true);
    setRadioContent(null);
    setRadioAudio(null);
    setRadioRecordingUrl(null);
    setRadioListenStage('first');
    setRadioPlaybackEndCount(0);
    stopAudio();

    // Exactly one five-second scanning interval; no API calls while tuning.
    // Invalidated requests never consume another story in the shuffle-bag.
    try {
      startStatic();
      await new Promise<void>(resolve => window.setTimeout(resolve, 5000));
      if (requestId !== radioStationRequestRef.current) return;
      const source = drawRadioCorpusText(
        selectedLevel.id as 'beginner' | 'intermediate' | 'advanced',
        category[stationId],
        user?.uid || 'guest'
      );
      const authored = RADIO_AUTHORED_EXERCISES[source.id];
      if (!authored || authored.quiz.length !== 5 ||
          authored.quiz.some(q => q.options.length !== 3 ||
            !q.options.includes(q.correctAnswer))) {
        throw new Error('The source text is missing its five approved questions: ' + source.id);
      }
      // No AI-generated text or quiz. The document's Arabic wording and
      // five authored questions are paired by one stable corpus ID.
      setRadioTextTitle(source.titleAr);
      // A recording is optional. The HEAD request never delays the five-second
      // station search, and it never reaches Gemini or any paid TTS API.
      const recordingPath = '/assets/radio/' + source.id + '.mp3';
      void fetch(recordingPath, { method: 'HEAD' }).then(response => {
        if (requestId !== radioStationRequestRef.current) return;
        const mime = response.headers.get('content-type') || '';
        if (response.ok && /audio\/|mpeg|octet-stream/i.test(mime)) {
          setRadioRecordingUrl(recordingPath);
        }
      }).catch(() => {});
      setRadioContent({
        transcript: authored.transcript,
        translation: source.translationEn,
        quiz: authored.quiz,
        wordMap: getRadioDifficultWords(source, authored.transcript)
      });
    } catch (error) {
      console.error('Could not load the local radio corpus:', error);
      if (requestId === radioStationRequestRef.current) {
        setError(lang === 'ar' ? 'تعذّر تحميل هذا النص من المكتبة المحلية.' : 'Unable to load this text from the local library.');
      }
    } finally {
      if (requestId === radioStationRequestRef.current) {
        setLoading(false);
        stopStatic();
      }
    }
  };

  // Simulated studio call: speaking exercise with on-device recording and
  // playback. Nothing is uploaded, and no paid speech evaluation is invoked.
  const callPrompt = selectedLevel?.id === 'beginner'
    ? (lang === 'ar' ? 'اذكر شخصية واحدة وحدثًا واحدًا من النص.' : 'Name one person and one event in the text.')
    : selectedLevel?.id === 'intermediate'
    ? (lang === 'ar' ? 'لخّص الفكرة الرئيسة، واشرح سبب حدث مهم.' : 'Summarize the main idea and explain one event.')
    : (lang === 'ar' ? 'حلّل فكرة النص، ثم قدّم رأيك مع دليل منه.' : 'Analyze the text and support your opinion with evidence.');

  const startCall = () => {
    stopRadioNarration();
    setIsRadioPlaying(false); setIsPaused(false);
    setIsCalling(true);setCallSeconds(0);setCallError('');
    if(callTimerRef.current)clearInterval(callTimerRef.current);
    callTimerRef.current=setInterval(()=>setCallSeconds(n=>n+1),1000);
  };
  const endCall = () => {
    if(mediaRecorderRef.current?.state==='recording'){
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track=>track.stop());
    }
    setIsCalling(false);setIsRecording(false);
    if(callTimerRef.current)clearInterval(callTimerRef.current);
    callTimerRef.current=null;
  };
  const startRecording = async () => {
    if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){
      setCallError(lang==='ar'?'المتصفح لا يدعم التسجيل المحلي.':'Local recording is not supported.');
      return;
    }
    try {
      setCallError('');
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const recorder=new MediaRecorder(stream);
      mediaRecorderRef.current=recorder;
      audioChunksRef.current=[];
      recorder.ondataavailable=e=>{if(e.data.size)audioChunksRef.current.push(e.data);};
      recorder.onstop=()=>{
        stream.getTracks().forEach(track=>track.stop());
        if(!audioChunksRef.current.length)return;
        const blob=new Blob(audioChunksRef.current,{type:recorder.mimeType||'audio/webm'});
        if(callAudioUrlRef.current)URL.revokeObjectURL(callAudioUrlRef.current);
        const url=URL.createObjectURL(blob);
        callAudioUrlRef.current=url;setCallAudioUrl(url);
      };
      recorder.start();setIsRecording(true);
    }catch(e){
      console.error('Radio speaking exercise microphone error:',e);
      setCallError(lang==='ar'?'اسمح باستخدام الميكروفون. التسجيل محلي ولا يُرفع للخادم.':'Allow microphone access. Your recording stays on the device.');
    }
  };
  const stopRecording=()=>{
    if(mediaRecorderRef.current?.state==='recording'){
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track=>track.stop());
    }
    setIsRecording(false);
  };

  const handleWordClick = (word: string) => {
    // A local, approved gloss; never send a word to paid TTS/translation.
    const key = (value: string) => value.normalize('NFKC')
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')
      .replace(/[^\u0621-\u064A]/g,'');
    const match = radioContent?.wordMap?.find((item: any) => key(item.word) === key(word));
    if (match) setSelectedWord(match);
  };

  // --- Renderers ---

  const renderModuleCard = (title: string, icon: any, colorCode: string, content: React.ReactNode) => {
    const colorConfigs: Record<string, { bg: string, border: string, accent: string, shadow: string }> = {
      blue: { bg: 'bg-blue-500', border: 'border-blue-500', accent: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-200' },
      purple: { bg: 'bg-purple-500', border: 'border-purple-500', accent: 'from-purple-400 to-purple-600', shadow: 'shadow-purple-200' },
      rose: { bg: 'bg-rose-500', border: 'border-rose-500', accent: 'from-rose-400 to-rose-600', shadow: 'shadow-rose-200' },
    };
    const config = colorConfigs[colorCode] || colorConfigs.blue;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto w-full max-w-6xl h-full flex items-center justify-center p-4 md:p-6"
      >
        <div className="bg-white w-full h-[460px] md:h-[520px] rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center px-8 md:px-16 py-6 md:py-8 text-center relative overflow-hidden transition-all">
          <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${config.accent} rounded-t-[3rem]`} />
          
          <div className="flex flex-col items-center gap-2 mb-2 shrink-0">
            <div className={`w-11 h-11 ${config.bg} rounded-2xl flex items-center justify-center text-white shadow-xl ${config.shadow} transform -rotate-3`}>
              {React.createElement(icon, { 
                size: 22, 
                strokeWidth: 2.5,
                className: icon === Speech && lang === 'ar' ? '-scale-x-100' : ''
              })}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 arabic-font">{title}</h2>
          </div>

          <div className="w-full flex-1 flex flex-col items-center justify-center overflow-hidden">
            {content}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderDictation = () => {
    return renderModuleCard(
      t.spellingChallenge,
      PenTool,
      "blue",
      dictationLoading ? (
        <div className="flex flex-col items-center gap-3 text-blue-500">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-slate-400 font-bold arabic-font text-[10px] uppercase tracking-widest">{t.loading}</p>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-between py-1">
          <div className="flex flex-col items-center gap-3 w-full">
            <button 
              onClick={() => dictationAudio && playBuffer(dictationAudio)}
              disabled={!dictationAudio}
              className="w-12 h-12 md:w-14 md:h-14 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
            >
              <Volume2 size={24} />
            </button>

            <div className="w-full max-w-sm relative px-4">
              <input 
                type="text"
                readOnly
                onFocus={() => setShowDictationKeyboard(true)}
                onClick={() => setShowDictationKeyboard(true)}
                value={dictationInput}
                placeholder={t.typeWord}
                className={`w-full p-3 bg-slate-50 border-2 rounded-2xl text-center text-xl font-black text-slate-800 outline-none transition-all placeholder:text-slate-300 arabic-font ${showDictationKeyboard ? 'border-blue-400 bg-white ring-4 ring-blue-50' : 'border-slate-100'}`}
                disabled={!!dictationFeedback}
              />
              {dictationFeedback && (
                <div className={`absolute -right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg z-10 ${dictationFeedback.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                  {dictationFeedback.isCorrect ? <Check size={18} /> : <X size={18} />}
                </div>
              )}
            </div>
          </div>

          <div className="w-full max-w-md relative min-h-[180px] flex flex-col justify-center px-2">
            <AnimatePresence mode="wait">
              {dictationFeedback ? (
                <motion.div 
                  key="feedback"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 w-full"
                >
                  <div className={`p-4 rounded-3xl border-2 ${dictationFeedback.isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                    <p className="text-lg font-black arabic-font leading-relaxed">{dictationFeedback.messageAr}</p>
                  </div>
                  <button 
                    onClick={() => {
                      loadDictation();
                      setShowDictationKeyboard(false);
                    }}
                    className="w-full max-w-[180px] mx-auto py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 arabic-font"
                  >
                    <RefreshCw size={16} />
                    {t.nextWord}
                  </button>
                </motion.div>
              ) : showDictationKeyboard ? (
                <motion.div 
                  key="keyboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-50 p-2 rounded-2xl grid gap-1 select-none w-full border border-slate-100 shadow-inner"
                >
                  {[
                    ['أ', 'إ', 'آ', 'ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
                    ['ش', 'س', 'ي', 'ب', 'ل', 'ت', 'ن', 'م', 'ك', 'ط', 'ذ'],
                    ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ']
                  ].map((row, i) => (
                    <div key={i} className="flex justify-center flex-wrap gap-0.5 md:gap-1">
                      {row.map(char => (
                        <button
                          key={char}
                          onClick={() => setDictationInput(prev => prev + char)}
                          className="w-6 h-8 md:w-8 md:h-10 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg flex items-center justify-center text-[10px] md:text-sm font-black text-slate-700 shadow-sm active:scale-95 transition-all"
                        >
                          {char}
                        </button>
                      ))}
                    </div>
                  ))}
                  <div className="flex justify-center gap-2 mt-2">
                    <button onClick={() => setDictationInput(prev => prev.slice(0, -1))} className="flex-1 h-8 bg-rose-50 text-rose-500 rounded-lg text-[10px] font-black">{t.del}</button>
                    <button onClick={() => setDictationInput('')} className="flex-1 h-8 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black">{t.clear}</button>
                    <button onClick={() => setShowDictationKeyboard(false)} className="flex-1 h-8 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black">{t.done}</button>
                  </div>
                </motion.div>
              ) : (
                <motion.button 
                  key="check"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => {
                    checkDictation();
                    setShowDictationKeyboard(false);
                  }}
                  disabled={!dictationInput.trim()}
                  className="w-full max-w-[200px] mx-auto py-3 bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 arabic-font"
                >
                  {t.check}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      )
    );
  };

  const renderLipReader = () => {
    return renderModuleCard(
      t.lipReader,
      Speech,
      "purple",
      <div className="w-full h-full flex flex-col items-center justify-between py-2">
        <div className="w-full aspect-video max-w-md mx-auto bg-slate-900 rounded-[2.5rem] border-4 border-slate-100 relative overflow-hidden flex items-center justify-center shadow-xl group shrink-0">
          {lipLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-purple-400" />
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{t.loading}</span>
            </div>
          ) : lipImage ? (
            <>
                <img src={lipImage} alt="Symbolic clue" className="w-full h-full object-cover animate-in fade-in duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </>
          ) : (
            <Speech size={40} className={lang === 'ar' ? '-scale-x-100' : ''} />
          )}
        </div>

        <div className="w-full max-w-lg space-y-3">
          <div className="grid grid-cols-3 gap-2 w-full">
            {lipOptions.map((opt, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <button 
                  onClick={() => {
                    generateSpeech(opt, 'ar').then(audioBytes => {
                      if (audioBytes) {
                        initAudio().then(ctx => {
                          decodeAudioData(audioBytes, ctx).then(buffer => playBuffer(buffer));
                        });
                      }
                    });
                  }}
                  className="w-full py-1.5 bg-slate-50 hover:bg-purple-50 text-purple-600 rounded-xl border-2 border-slate-100 hover:border-purple-200 transition-all flex items-center justify-center shadow-sm active:scale-95"
                >
                  <Volume2 size={18} />
                </button>
                <button 
                  onClick={() => setLipFeedback({ isCorrect: opt === lipWord, selected: opt })}
                  className={`w-full py-2.5 rounded-2xl font-black text-sm transition-all border-2 ${lipFeedback ? (opt === lipWord ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-100' : lipFeedback.selected === opt ? 'bg-red-500 text-white border-red-600' : 'bg-slate-50 text-slate-300 border-slate-100 opacity-40') : 'bg-white text-slate-700 border-slate-100 hover:border-purple-500 shadow-sm active:scale-95'}`}
                >
                  {opt}
                </button>
              </div>
            ))}
          </div>

          <div className="h-20 flex items-center justify-center">
            <AnimatePresence>
              {lipFeedback && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-3xl flex items-center justify-between w-full border-2 ${lipFeedback.isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${lipFeedback.isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                      {lipFeedback.isCorrect ? <Check size={20} /> : <X size={20} />}
                    </div>
                    <span className="font-black arabic-font text-base">{lipFeedback.isCorrect ? t.wellDone : t.tryAgain}</span>
                  </div>
                  <button onClick={loadLipReader} className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase text-white shadow-lg ${lipFeedback.isCorrect ? 'bg-emerald-600 shadow-emerald-100' : 'bg-red-600 shadow-red-100'}`}>
                    {t.next}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  const renderEmotions = () => {
    return renderModuleCard(
      t.emotionsChallenge,
      Heart,
      "rose",
      <div className="w-full h-full flex flex-col items-center justify-between py-2">
          <div className="flex flex-col items-center gap-4 w-full shrink-0">
          <div className="relative group">
            <div className="absolute inset-0 bg-rose-200 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <button 
              onClick={() => emotionAudio && playBuffer(emotionAudio)}
              disabled={loading || !emotionAudio}
              className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 relative ${emotionAudio ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : isRadioPlaying ? <Volume2 size={24} className="animate-pulse" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
          </div>
          
          <div className="bg-rose-50/50 px-6 py-4 rounded-[2rem] border-2 border-rose-100/50 italic text-rose-900 font-bold arabic-font text-base md:text-xl w-full max-w-2xl mx-auto shadow-sm backdrop-blur-sm">
            " {emotionExercise?.sentence || "..."} "
          </div>
        </div>

        <div className="w-full max-w-2xl space-y-4">
          <div className="grid grid-cols-5 gap-3 px-2">
            {[
              { id: 'happy', ar: t.happy, icon: '😊' },
              { id: 'sad', ar: t.sad, icon: '😢' },
              { id: 'angry', ar: t.angry, icon: '😠' },
              { id: 'surprised', ar: t.surprised, icon: '😲' },
              { id: 'neutral', ar: t.neutral, icon: '😐' },
            ].map(emo => (
              <button 
                key={emo.id} 
                onClick={() => setEmotionFeedback({ isCorrect: emo.id === emotionExercise.emotion, selected: emo.id })}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 aspect-square justify-center ${emotionFeedback ? (emo.id === emotionExercise.emotion ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-50' : emotionFeedback.selected === emo.id ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-50 opacity-40') : 'border-slate-50 bg-slate-50 hover:border-rose-400 hover:bg-white text-slate-700 shadow-sm transition-transform active:scale-95'}`}
              >
                <span className="text-3xl md:text-4xl">{emo.icon}</span>
                <span className="text-[9px] md:text-[10px] font-black arabic-font uppercase tracking-tighter">{emo.ar}</span>
              </button>
            ))}
          </div>

          <div className="h-20 flex items-center justify-center">
            <AnimatePresence>
              {emotionFeedback && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-3xl flex items-center justify-between w-full border-2 ${emotionFeedback.isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${emotionFeedback.isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                      {emotionFeedback.isCorrect ? <Check size={20} /> : <X size={20} />}
                    </div>
                    <span className="font-black arabic-font text-base md:text-lg">{emotionFeedback.isCorrect ? t.wellDone : t.tryAgain}</span>
                  </div>
                  <button onClick={loadEmotions} className={`px-8 py-3 rounded-2xl text-xs font-black uppercase text-white shadow-lg ${emotionFeedback.isCorrect ? 'bg-emerald-600 shadow-emerald-100' : 'bg-red-600 shadow-red-100'}`}>
                    {t.next}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className={`w-full flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <PageHeader 
        title={t.title} 
        icon={Headphones} 
        lang={lang} 
        onToggle={toggleLang}
      />

      <div className="flex-1 flex overflow-hidden bg-slate-50/30">
        <aside className="w-[280px] bg-white border-r rtl:border-r-0 rtl:border-l border-slate-100 flex flex-col shrink-0 no-print relative shadow-sm">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t.chooseTopic}</h3>
                <div className="space-y-3">
                    {TOPICS.map(topic => (
                        <button 
                            key={topic.id} 
                            disabled={!selectedLevel}
                            onClick={() => {
                                setSelectedTopic(topic);
                                if (topic.id === 'radio') {
                                    radioStationRequestRef.current++;
                                    setRadioFrequency(0);
                                    setRadioTextTitle('');
                                    setRadioContent(null);
                                    setRadioListenStage('first');
                                    setRadioPlaybackEndCount(0);
                                    stopAudio();
                                }
                                if (topic.id !== 'radio') {
                                    // Leaving radio invalidates a pending five-second tune.
                                    radioStationRequestRef.current++;
                                    stopAudio();
                                    setLoading(false);
                                }
                                if (topic.id === 'emotions') loadEmotions();
                                if (topic.id === 'dictation') loadDictation();
                            }}
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-right group ${selectedTopic?.id === topic.id ? `${topic.border} ${topic.bg} ${topic.text} shadow-md` : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 text-slate-500'} ${!selectedLevel ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${selectedTopic?.id === topic.id ? `${topic.activeBg} text-white` : 'bg-white text-slate-400'}`}>
                                <topic.icon size={24}  />
                            </div>
                            <div className="flex-1 min-w-0 pr-1 overflow-visible">
                                <p
                                    className="text-sm font-black leading-snug whitespace-nowrap text-right py-1 overflow-visible"
                                    style={{ fontFamily: "'Tajawal', 'Cairo', sans-serif" }}
                                >
                                    {lang === 'ar' ? topic.ar : topic.en}
                                </p>
                                <p className="text-[10px] opacity-60 font-bold uppercase tracking-tighter truncate">{lang === 'ar' ? topic.en : topic.ar}</p>
                            </div>
                            <ChevronRight size={16} className={`opacity-20 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-100 mt-auto shrink-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">{t.studentLevel}</p>
                <div className="flex flex-col gap-2">
                    {LEVELS.map(level => (
                        <button
                            key={level.id}
                            onClick={() => {
                              if (selectedLevel?.id !== level.id && selectedTopic?.id === 'radio') {
                                radioStationRequestRef.current++;
                                stopAudio();
                                setLoading(false);
                                setRadioFrequency(0);
                                setRadioTextTitle('');
                                setRadioContent(null);
                                setRadioListenStage('first');
                                setRadioPlaybackEndCount(0);
                              }
                              setSelectedLevel(level);
                            }}
                            className={`w-full px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-between ${selectedLevel?.id === level.id ? 'bg-[#2563eb] text-white shadow-md' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
                        >
                            <span className="arabic-font leading-none">{level.ar}</span>
                            <span className="opacity-70 leading-none text-[10px]">{level.en}</span>
                        </button>
                    ))}
                </div>
            </div>
        </aside>

        <main className={`flex-1 flex flex-col relative scrollbar-hide ${selectedTopic?.id === 'cassette_stories' ? 'p-2 sm:p-4 lg:p-6 overflow-y-auto' : selectedTopic?.id === 'radio' ? 'p-1.5 sm:p-2 overflow-hidden' : 'p-8 overflow-y-auto'}`}>
            <AnimatePresence mode="wait">
                {!selectedLevel ? (
                    <motion.div 
                        key="no-level"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="h-full flex flex-col items-center justify-center text-center space-y-6"
                    >
                        <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <Headphones size={64} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 arabic-font mb-2">{t.selectLevelFirst}</h2>
                            <p className="text-slate-400 font-bold max-w-sm mx-auto">{t.subtitle}</p>
                        </div>
                    </motion.div>
                ) : selectedLevel?.id && !selectedTopic ? (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="h-full flex flex-col items-center justify-center text-center space-y-6"
                    >
                        <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center text-[#2563eb] animate-pulse">
                            <Speech size={64} className={lang === 'ar' ? '-scale-x-100' : ''} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 arabic-font mb-2">{t.chooseTopic}</h2>
                            <p className="text-slate-400 font-bold max-w-sm mx-auto">{t.subtitle}</p>
                        </div>
                    </motion.div>
                ) : selectedTopic.id === 'radio' ? (
                    <motion.div 
                        key="radio"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-full flex flex-col items-center justify-start qul-radio-printer-layout"
                    >
                        {/* Original radio, raised slightly to fit its matching printer below. */}
                        <div className="relative w-full max-w-3xl pt-12 qul-original-radio-retouch">
                            {/* Radio Handle */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 border-[10px] border-[#1a110a] rounded-t-3xl z-0 qul-original-radio-handle" />
                            
                            {/* Antenna */}
                            <motion.div 
                                initial={{ height: 40 }}
                                animate={{ height: isRadioPlaying ? 120 : 60 }}
                                className="absolute top-0 right-20 w-2 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-full origin-bottom z-0 shadow-[2px_0_5px_rgba(0,0,0,0.3)] qul-original-radio-antenna"
                            >
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-slate-300 to-slate-500 rounded-full shadow-md border border-slate-400" />
                            </motion.div>

                            <div className="relative w-full aspect-[16/10] bg-[#3d2b1f] rounded-3xl border-[12px] border-[#2a1d15] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] p-8 flex flex-col overflow-hidden z-10 qul-original-radio-cabinet">
                                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30 pointer-events-none" />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/20 pointer-events-none" />
                                
                                <div dir="ltr" className="flex-[1_1_0%] min-h-0 flex gap-6">
                                    <div className="w-1/4 h-full bg-[#120a05] rounded-2xl border-4 border-[#2a1d15] shadow-inner relative overflow-hidden flex flex-col qul-original-radio-speaker">
                                        <div className="p-4 h-full overflow-y-auto custom-scrollbar relative z-10">
                                            {radioContent && radioListenStage !== 'first' && radioListenStage !== 'questions' ? (
                                                <div dir="rtl" lang="ar" className="text-xs leading-relaxed font-black text-amber-400/90 text-right arabic-font py-4 flex flex-wrap gap-x-1">
                                                    {radioContent.transcript.split(' ').map((word: string, i: number) => (
                                                        <span key={i} onClick={() => handleWordClick(word)} className="hover:text-white cursor-pointer inline-block">{word}</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 grid grid-cols-6 gap-px p-2 opacity-10">
                                                    {Array.from({ length: 120 }).map((_, i) => (
                                                        <div key={i} className="w-1 h-1 bg-black rounded-full" />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 h-full bg-[#d4c19c] rounded-2xl border-4 border-[#2a1d15] shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)] p-6 flex flex-col items-center justify-center relative overflow-hidden qul-original-radio-dial">
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-black/10 pointer-events-none z-20" />
                                        
                                        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                                            <AnimatePresence mode="wait">
                                                {isIncomingCall ? (
                                                    <motion.div key="incoming" className="flex flex-col items-center gap-4">
                                                        <div className="w-16 h-16 rounded-full bg-[#2a1d15] flex items-center justify-center text-[#d4c19c] animate-bounce">
                                                            <Phone size={24} />
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <button onClick={() => setIsIncomingCall(false)} className="w-10 h-10 rounded-full bg-red-500/20 text-red-600 flex items-center justify-center"><PhoneOff size={18} /></button>
                                                            <button onClick={() => { setIsIncomingCall(false); startCall(); }} className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Phone size={18} /></button>
                                                        </div>
                                                    </motion.div>
                                                ) : isCalling ? (
                                                    <motion.div key="calling" className="w-full h-full flex flex-col items-center justify-between py-2">
                                                        <div className="text-center">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-[#2a1d15]/40">{lang === 'ar' ? 'تدريب شفهي محلي' : 'LOCAL SPEAKING PRACTICE'}</p>
                                                            <p className="text-[10px] font-black text-[#2a1d15] leading-tight" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{callPrompt}</p>
                                                            <p className="text-[10px] font-mono text-emerald-600 font-bold">
                                                                {Math.floor(callSeconds / 60).toString().padStart(2, '0')}:{(callSeconds % 60).toString().padStart(2, '0')}
                                                            </p>
                                                            {callAudioUrl && !isRecording && <audio controls src={callAudioUrl}
                                                              className="w-full max-w-[190px] h-7 mt-1"
                                                              aria-label={lang === 'ar' ? 'الاستماع إلى إجابتي' : 'Listen to my recording'} />}
                                                            {callError && <p className="text-[9px] font-bold text-red-800">{callError}</p>}
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <button
                                                                title={lang === 'ar' ? 'سجّل إجابتك ثم استمع إليها' : 'Record and replay your voice'}
                                                                aria-label={isRecording ? (lang === 'ar' ? 'إيقاف التسجيل' : 'Stop recording') : (lang === 'ar' ? 'بدء التسجيل' : 'Start recording')}
                                                                onClick={isRecording ? stopRecording : startRecording}
                                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500 text-white' : 'bg-[#2a1d15] text-[#d4c19c]'}`}
                                                            >
                                                                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                                                            </button>
                                                            <button onClick={endCall} className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><PhoneOff size={16} /></button>
                                                        </div>
                                                    </motion.div>
                                                ) : loading ? (
                                                    <motion.div key="loading" className="flex flex-col items-center gap-3">
                                                        <Loader2 size={34} className="animate-spin text-[#2a1d15]/60" />
                                                        <span className="text-[10px] font-black text-[#2a1d15]/80" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                                                          {lang === 'ar' ? 'جارٍ البحث عن محطة...' : 'Searching radio frequencies...'}
                                                        </span>
                                                    </motion.div>
                                                ) : radioContent ? (
                                                    <motion.div key="content" className="text-center">
                                                        <div className="w-16 h-16 bg-[#2a1d15] rounded-full flex items-center justify-center text-[#d4c19c] mb-4 mx-auto shadow-lg">
                                                            <RadioIcon size={32} />
                                                        </div>
                                                        <h4 className="text-lg font-black text-[#2a1d15] arabic-font">
                                                            {RADIO_STATIONS.find(s => s.id === radioFrequency)?.[lang]}
                                                        </h4>
                                                        {radioTextTitle && (
                                                          <p className="text-[10px] font-black text-[#4a3423] arabic-font mt-1" dir="rtl">
                                                            {radioTextTitle}
                                                          </p>
                                                        )}
                                                    </motion.div>
                                                ) : (
                                                    <motion.div key="empty" className="text-[#2a1d15]/40 flex flex-col items-center text-center">
                                                        <RadioIcon size={40} className="opacity-20 mb-4" />
                                                        <h4 className="text-sm font-black arabic-font">{t.chooseTopic}</h4>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4 h-8 bg-[#2a1d15]/10 rounded-lg border border-[#2a1d15]/20 flex items-center px-4 shadow-inner">
                                            <div className="flex-1 h-0.5 bg-[#2a1d15]/30 relative">
                                                <motion.div 
                                                    initial={false}
                                                    animate={{
                                                      left: loading
                                                        ? ['7%', '83%', '23%', '92%', radioFrequency === 0 ? '50%' : `${(radioFrequency - 1) * 25}%`]
                                                        : radioFrequency === 0 ? '50%' : `${(radioFrequency - 1) * 25}%`
                                                    }}
                                                    transition={{ duration: loading ? 4.9 : 0.35, ease: loading ? 'linear' : 'easeOut' }}
                                                    className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)] z-30" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-1/4 h-full bg-[#120a05] rounded-2xl border-4 border-[#2a1d15] shadow-inner relative overflow-hidden flex flex-col qul-original-radio-speaker">
                                        <div className="p-4 h-full overflow-y-auto custom-scrollbar relative z-10">
                                            {radioContent && radioListenStage !== 'first' && radioListenStage !== 'questions' && (
                                                <p dir="ltr" lang="en" className="text-[10px] leading-relaxed font-bold text-emerald-400/80 text-left py-4">
                                                    {radioContent.translation || "..."}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="h-28 mt-8 flex-shrink-0 flex items-center justify-between px-4 bg-black/10 rounded-3xl border border-white/5 p-4 qul-original-radio-controls">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className={`w-3 h-3 rounded-full ${isRadioPlaying || isPaused ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-red-900/40'}`} />
                                            <span className="text-[8px] font-black text-white/30 uppercase">Power</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-16 h-16 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 rounded-full border-4 border-[#2a1d15] shadow-[0_5px_15px_rgba(0,0,0,0.4)] flex items-center justify-center relative qul-original-radio-volume">
                                                <motion.div animate={{ rotate: volume * 360 }} className="w-full h-full flex items-center justify-center">
                                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-red-600 rounded-full" />
                                                </motion.div>
                                            </div>
                                            <span className="text-[8px] font-black text-white/30 uppercase">Volume</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {RADIO_STATIONS.map(station => (
                                            <button 
                                                key={station.id} 
                                                onClick={() => loadRadioStation(station.id)}
                                                className={`px-4 h-14 rounded-xl font-black text-xs transition-all border border-white/20 qul-original-radio-preset ${radioFrequency === station.id ? 'bg-slate-600 text-white shadow-inner' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                                            >
                                                {lang === 'ar' ? station.ar : station.en}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-col items-center gap-1">
                                        <div 
                                            className={`w-16 h-16 rounded-full border-4 border-[#2a1d15] flex items-center justify-center relative cursor-pointer active:scale-95 transition-all qul-original-radio-play ${!radioContent?.transcript ? 'opacity-50' : 'bg-slate-100'}`}
                                            onClick={() => playRadioNarration()}
                                        >
                                            {isRadioPlaying ? <Pause size={24} className="text-slate-700" /> : <Play size={24} className="text-slate-700" />}
                                        </div>
                                        <span className="text-[8px] font-black text-white/30 uppercase">{isRadioPlaying ? 'Playing' : 'Start'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <RadioThermalPrinter
                            key={selectedLevel.id + ':' + radioFrequency + ':' + radioTextSerial}
                            lang={lang}
                            stationId={radioFrequency}
                            stationTitle={radioTextTitle || RADIO_STATIONS.find(station => station.id === radioFrequency)?.[lang] || (lang === 'ar' ? 'الراديو' : 'Radio')}
                            content={radioContent}
                            loading={loading}
                            audioReady={Boolean(radioContent?.transcript)}
                            audioPlaying={isRadioPlaying}
                            playEndCount={radioPlaybackEndCount}
                            onStageChange={setRadioListenStage}
                            onStudioCall={() => { setIsIncomingCall(true); setCallError(''); }}
                            onReplay={() => playRadioNarration(true)}
                            onNextStation={() => { void loadRadioStation(radioFrequency === RADIO_STATIONS.length ? 1 : radioFrequency + 1); }}
                        />
                    </motion.div>
                ) : selectedTopic.id === 'cassette_stories' ? (
                    <motion.div
                        key="cassette_stories"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex flex-col items-center justify-start py-2 sm:py-3 overflow-visible"
                    >
                        <CassettePlayer key={selectedLevel.id} allStories={STORY_CASSETTES} selectedLevel={selectedLevel.id} />
                    </motion.div>
                ) : selectedTopic.id === 'emotions' ? (
                    renderEmotions()
                ) : selectedTopic.id === 'dictation' ? (
                    renderDictation()
                ) : null}
            </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
