import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, AlertCircle, Clock, ArrowRight, ArrowLeft, 
  Trophy, RotateCcw, Brain, Check, X, Move, GripVertical, Sparkles, PenTool,
  Shield, Volume2, Mic, Music, Type, PlayCircle, StopCircle, Save, Keyboard
} from 'lucide-react';
import { 
  collection, query, orderBy, onSnapshot, addDoc, doc, 
  getDoc, updateDoc, serverTimestamp, getDocs, where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, safeStringify } from '../firebase';
import { useAuth } from './AuthProvider';
import { WordChessGame } from './WordChessGame';

interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'fill_blank' | 'ordering' | 'drag_drop' | 'matching' | 'chess_puzzle';
  options: string[];
  correctAnswer: string;
  points: number;
  chessConfig?: {
    boardSize: number;
    initialPos: { x: number; y: number };
    targetPos: { x: number; y: number };
    pieceType: 'rook' | 'bishop' | 'knight';
    gridData: string[][];
  };
}

interface QuizPlayerProps {
  quizId: string;
  lang: 'ar' | 'en';
  onComplete: () => void;
  onExit: () => void;
  playMode?: 'classic' | 'race' | 'crypto';
}

interface Ability {
  id: string;
  type: 'shield' | 'multiplier' | 'freeze';
  nameAr: string;
  nameEn: string;
  icon: React.ReactNode;
}

const WritingKeyboard = ({ onKeyPress, lang }: { onKeyPress: (key: string) => void, lang: 'ar' | 'en' }) => {
  const arKeys = [
    ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
    ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
    ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ']
  ];
  const enKeys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];
  const keys = lang === 'ar' ? arKeys : enKeys;

  return (
    <div className="bg-slate-900/5 p-6 rounded-[2rem] border border-slate-100 mt-6 select-none" dir="ltr">
      <div className="flex flex-col gap-2">
        {keys.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1.5">
            {row.map(key => (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className="min-w-[32px] md:min-w-[40px] px-2 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 hover:bg-blue-600 hover:text-white hover:border-blue-700 active:scale-90 transition-all shadow-sm text-sm"
              >
                {key}
              </button>
            ))}
          </div>
        ))}
        <div className="flex justify-center mt-1 gap-2">
           <button onClick={() => onKeyPress(' ')} className="w-1/2 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-400 hover:bg-slate-50 transition-all shadow-sm text-[10px] uppercase tracking-widest">
             {lang === 'ar' ? 'مسافة' : 'Space'}
           </button>
           <button onClick={() => onKeyPress('Backspace')} className="px-6 py-3 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl font-bold transition-all shadow-sm text-[10px] uppercase tracking-widest">
             {lang === 'ar' ? 'حذف' : 'Back'}
           </button>
        </div>
      </div>
    </div>
  );
};

const VoiceRecorder = ({ onComplete, lang }: { onComplete: (blob: Blob) => void, lang: 'ar' | 'en' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        onComplete(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Recording start failed', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-10 bg-blue-50/50 rounded-[3rem] border border-blue-100 mt-6 relative overflow-hidden">
      {isRecording && (
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute inset-0 bg-blue-500/5 pointer-events-none"
        />
      )}
      
      <div className="text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl relative z-10 ${isRecording ? 'bg-rose-500 scale-110 shadow-rose-500/30' : 'bg-blue-600 shadow-blue-500/30 hover:scale-105'}`}>
          <Mic size={40} className="text-white" />
        </div>
        <div className="mt-4 font-black text-2xl tabular-nums text-slate-800">
          {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
        </div>
      </div>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all shadow-xl ${
          isRecording ? 'bg-rose-600 text-white shadow-rose-600/20' : 'bg-slate-900 text-white shadow-slate-900/20'
        }`}
      >
        {isRecording 
          ? (lang === 'ar' ? 'إيقاف التسجيل' : 'Stop Session') 
          : (lang === 'ar' ? 'البدء بالتحدث' : 'Start Recording')
        }
      </button>
      
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {isRecording ? (lang === 'ar' ? 'جاري التسجيل...' : 'Recording in progress...') : (lang === 'ar' ? 'فقط انقر لتبدأ' : 'Click to begin')}
      </p>
    </div>
  );
};

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quizId, lang, onComplete, onExit, playMode = 'classic' }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizData, setQuizData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [attemptsExceeded, setAttemptsExceeded] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const modeColors: Record<string, string> = {
    classic: 'blue',
    race: 'rose',
    crypto: 'amber'
  };

  const activeColor = modeColors[playMode || 'classic'];

  const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(null);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [isMultiplierActive, setIsMultiplierActive] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  // Question timer for Race mode
  useEffect(() => {
    if (playMode !== 'race' || isAnswered || score !== null) return;
    setQuestionTimeLeft(15); // 15 seconds per question in race mode
  }, [currentIndex, playMode]);

  useEffect(() => {
    if (playMode !== 'race' || questionTimeLeft === null || questionTimeLeft <= 0 || isAnswered || score !== null) {
      if (playMode === 'race' && questionTimeLeft === 0 && !isAnswered) {
        handleAnswerChange(questions[currentIndex]?.id, 'TIMEOUT_AUTO_FAIL', true);
      }
      return;
    }
    const timer = setInterval(() => setQuestionTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearInterval(timer);
  }, [questionTimeLeft, isAnswered, playMode]);

  const useAbility = (type: Ability['type']) => {
    if (type === 'shield') {
      setIsShieldActive(true);
      setTimeout(() => setIsShieldActive(false), 30000);
    } else if (type === 'multiplier') {
      setIsMultiplierActive(true);
    }
    setAbilities(prev => prev.filter(a => a.type !== type));
  };

  const handleAnswerChange = (qId: string, val: any, autoNext: boolean = false, skipFeedback: boolean = false) => {
    const q = questions.find(q => q.id === qId);
    if (!q) return;

    let isCorrect = false;
    if (q.type === 'mcq' || q.type === 'true_false' || q.type === 'short_answer' || q.type === 'fill_blank') {
      isCorrect = val?.toString().trim().toLowerCase() === q.correctAnswer.toString().trim().toLowerCase();
    } else if (q.type === 'ordering' || q.type === 'drag_drop' || q.type === 'matching') {
      isCorrect = safeStringify(val) === safeStringify(q.options);
    }

    if (isCorrect) {
      if (!skipFeedback) {
        setStreak(prev => prev + 1);
        setCorrectCount(prev => prev + 1);
        setCombo(prev => Math.min(prev + 1, 5));
        setMaxCombo(prev => Math.max(prev, streak + 1));
        setFeedbackType('success');
      }

      // Crypto mode logic: get abilities for difficult questions
      if (playMode === 'crypto') {
        const isDifficult = q.type === 'short_answer' || q.type === 'fill_blank' || q.type === 'chess_puzzle';
        if (isDifficult && Math.random() > 0.3) {
          const newAbilities: Ability[] = [
            { id: Math.random().toString(), type: 'shield', nameAr: 'درع الحماية', nameEn: '30s Shield', icon: <Shield size={14} /> },
            { id: Math.random().toString(), type: 'multiplier', nameAr: 'مضاعف النقاط', nameEn: '2x Points', icon: <Sparkles size={14} /> },
          ];
          const randomAbility = newAbilities[Math.floor(Math.random() * newAbilities.length)];
          if (!abilities.find(a => a.type === randomAbility.type)) {
            setAbilities(prev => [...prev.slice(-2), randomAbility]);
          }
        }
      }
    } else {
      if (isShieldActive) {
        setIsShieldActive(false);
        if (!skipFeedback) setFeedbackType('success'); // Shield saves you
        return;
      }
      
      if (!skipFeedback) {
        setStreak(0);
        setErrorCount(prev => prev + 1);
        setCombo(0);
        setFeedbackType('error');
      }
    }

    if (!skipFeedback) setTimeout(() => setFeedbackType(null), 1000);

    setAnswers(prev => ({ ...prev, [qId]: val }));
    setIsAnswered(true);
    
    if (autoNext && currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 600);
    }
  };

  useEffect(() => {
    if (!quizId) return;
    const fetchData = async () => {
      try {
        const qDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (qDoc.exists()) {
          const data = qDoc.data();
          setQuizData(data);
          if (data.duration) {
            setTimeLeft(data.duration * 60);
          }

          // Check attempts logic
          if (user && data.maxAttempts > 0) {
            const resultsRef = collection(db, 'quizzes', quizId, 'results');
            const qAttempts = query(resultsRef, where('userId', '==', user.uid));
            const attemptsSnap = await getDocs(qAttempts);
            setPreviousAttempts(attemptsSnap.size);
            if (attemptsSnap.size >= data.maxAttempts) {
              setAttemptsExceeded(true);
              setLoading(false);
              return;
            }
          }
        }

        const qSnap = await getDocs(query(collection(db, 'quizzes', quizId, 'questions'), orderBy('order', 'asc')));
        const qList = qSnap.docs.map(doc => {
          const data = doc.data() as Question;
          let shuffledOptions = [...data.options];
          if (data.type === 'mcq' || data.type === 'ordering' || data.type === 'drag_drop') {
            shuffledOptions = shuffledOptions.sort(() => Math.random() - 0.5);
          }
          return { id: doc.id, ...data, options: shuffledOptions } as Question;
        });
        setQuestions(qList);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, `quizzes/${quizId}/questions`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || score !== null) return;
    const timer = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, score]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsAnswered(!!answers[questions[currentIndex]?.id]);
  }, [currentIndex, questions, answers]);

  const calculateScore = () => {
    let totalScore = 0;
    questions.forEach(q => {
      const userAnswer = answers[q.id];
      let isCorrect = false;
      if (q.type === 'mcq' || q.type === 'true_false' || q.type === 'short_answer' || q.type === 'fill_blank') {
        isCorrect = userAnswer?.toString().trim().toLowerCase() === q.correctAnswer.toString().trim().toLowerCase();
      } else if (q.type === 'ordering' || q.type === 'drag_drop' || q.type === 'matching') {
        isCorrect = safeStringify(userAnswer) === safeStringify(q.options);
      } else if (q.type === 'chess_puzzle') {
        isCorrect = userAnswer === 'CHESS_MASTERED';
      }

      if (isCorrect) {
        let points = q.points;
        
        if (playMode === 'race') {
          // Time Race: Points based on speed
          const speedFactor = (questionTimeLeft || 0) / 15;
          points = Math.floor(points * (1 + speedFactor));
        } else if (playMode === 'crypto') {
          // Crypto Hack: Points for speed + multiplier
          if (isMultiplierActive) {
            points *= 2;
            setIsMultiplierActive(false);
          }
          const speedBonus = questionTimeLeft ? (questionTimeLeft / 15) * 50 : 0;
          points += Math.floor(speedBonus);
        }

        const multiplier = (playMode === 'race' || playMode === 'crypto') ? (1 + (combo * 0.1)) : 1;
        totalScore += Math.floor(points * multiplier);
      }
    });

    setScore(totalScore);

    if (user) {
      addDoc(collection(db, 'quizzes', quizId, 'results'), {
        userId: user.uid,
        userEmail: user.email,
        score: totalScore,
        totalPoints: questions.reduce((acc, q) => acc + q.points, 0),
        timeTaken: Math.floor((Date.now() - startTime) / 1000),
        completedAt: serverTimestamp()
      });
    }
  };

  if (attemptsExceeded) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col items-center justify-center p-6 overflow-hidden font-['Tajawal']" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center relative z-10 p-10 rounded-[3rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200"
        >
            <div className="relative mb-10">
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-[1.8rem] flex items-center justify-center mx-auto">
                    <AlertCircle size={40} />
                </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 arabic-font mb-4">
                {lang === 'ar' ? 'عذراً، استنفدت محاولاتك' : 'Attempts Limit Reached'}
            </h2>
            <p className="text-slate-500 font-bold mb-8 text-sm">
                {lang === 'ar' 
                  ? `لقد قمت بإجراء هذا الاختبار ${previousAttempts} مرات، وهو الحد الأقصى المسموح به.` 
                  : `You have attempted this quiz ${previousAttempts} times, which is the maximum allowed.`}
            </p>
            <button 
                onClick={onExit}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
                {lang === 'ar' ? 'العودة للمنصة' : 'Return to Hub'}
            </button>
        </motion.div>
      </div>
    );
  }

  if (loading || (questions.length === 0 && score === null)) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col items-center justify-center font-['Tajawal']">
        <div className="relative">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              borderColor: ['#3b82f6', '#10b981', '#3b82f6'] 
            }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-24 h-24 border-2 border-blue-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-500/10 bg-white"
          >
            <Brain size={40} className="text-blue-500" />
          </motion.div>
          <div className="absolute inset-0 bg-blue-500/10 blur-[40px] -z-10 animate-pulse rounded-full" />
        </div>
        <p className="mt-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">
          {lang === 'ar' ? 'جاري تحضير مصفوفة المعرفة...' : 'Initializing Knowledge Matrix...'}
        </p>
      </div>
    );
  }

  if (score !== null) {
    const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
    const percentage = Math.round((score / totalPoints) * 100);

    return (
      <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col items-center justify-center p-6 overflow-hidden font-['Tajawal']" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-blue-500/5 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-emerald-500/5 blur-[150px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center relative z-10 p-10 rounded-[3rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200"
        >
            <div className="relative mb-10">
                <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-[1.8rem] flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30"
                >
                    <Trophy size={40} strokeWidth={2.5} />
                </motion.div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-100 blur-[40px] -z-10 rounded-full" />
            </div>

            <h2 className="text-3xl font-black text-slate-900 arabic-font mb-2">
                {lang === 'ar' ? 'اكتملت المهمة بنجاح' : 'Mission Completed'}
            </h2>
            <p className="text-slate-400 font-bold mb-8 uppercase tracking-[0.3em] text-[8px]">Assessment Evaluation Ready</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex flex-col items-center group hover:bg-blue-50 hover:border-blue-100 transition-all">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-blue-500 transition-colors">{lang === 'ar' ? 'إجمالي النقاط' : 'Score Points'}</span>
                    <span className="text-3xl font-black text-blue-600 tabular-nums">{score}<span className="text-slate-300 text-lg mx-1">/</span>{totalPoints}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex flex-col items-center group hover:bg-emerald-50 hover:border-emerald-100 transition-all">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-emerald-500 transition-colors">{lang === 'ar' ? 'مستوى الدقة' : 'Accuracy Level'}</span>
                    <span className="text-3xl font-black text-slate-900 tabular-nums">{percentage}%</span>
                </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                  onClick={onExit}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                  {lang === 'ar' ? 'العودة للمنصة' : 'Return to Hub'}
              </button>
            </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentIndex];
  if (!q && score === null) return null;
  const totalSteps = questions.length;

  const shakeAnimation = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col items-center justify-center p-8 overflow-hidden font-['Tajawal']`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Dynamic Particles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
            animate={{
              y: [0, -1000],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%',
            }}
          />
        ))}
      </div>

      {/* Top Exit Button */}
      <button 
        onClick={onExit} 
        className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2 group text-[10px] font-black uppercase tracking-widest z-[60] bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100"
      >
        <ArrowLeft size={16} className={`group-hover:-translate-x-1 transition-transform ${lang === 'ar' ? 'rotate-180' : ''}`} />
        {lang === 'ar' ? 'إنهاء الاختبار' : 'Quit Session'}
      </button>

      <div className="w-full max-w-4xl relative z-10 flex flex-col h-full items-center justify-center">
        {/* Cinematic Header/Progress */}
        <div className="w-full max-w-2xl mb-12">
          <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-4">
            <span className="flex items-center gap-3">
               <span className="bg-blue-600 text-white px-4 py-1 rounded-lg shadow-lg shadow-blue-500/20">QUEST {currentIndex + 1} / {totalSteps}</span>
            </span>
            <span className="flex items-center gap-4">
              {playMode === 'crypto' && abilities.length > 0 && (
                <div className="flex gap-2">
                  {abilities.map(a => (
                    <button
                      key={a.id}
                      onClick={() => useAbility(a.type)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg text-white font-black text-[8px] uppercase tracking-widest animate-bounce ${a.type === 'shield' ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-amber-500 shadow-amber-500/20'}`}
                    >
                      {a.icon}
                      {lang === 'ar' ? a.nameAr : a.nameEn}
                    </button>
                  ))}
                </div>
              )}
              {isShieldActive && (
                 <div className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg flex items-center gap-2 animate-pulse border border-indigo-200">
                    <Shield size={12} />
                    <span className="text-[8px] font-black">{lang === 'ar' ? 'درع نشط' : 'Shield On'}</span>
                 </div>
              )}
              {playMode === 'race' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-lg text-rose-500 border border-rose-100">
                  <Clock size={12} className="animate-spin" />
                  <span className="font-black tabular-nums">{questionTimeLeft}s</span>
                </div>
              )}
              {playMode === 'race' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-lg text-rose-500 border border-rose-100">
                  <Sparkles size={12} />
                  <span>X{1 + (combo * 0.1)}</span>
                </div>
              )}
              {timeLeft !== null && (
                 <span className={`flex items-center gap-2 bg-white px-4 py-1 rounded-lg border border-slate-100 shadow-sm ${timeLeft < 30 ? 'text-rose-500 animate-pulse border-rose-100 bg-rose-50' : 'text-slate-600'}`}>
                    <Clock size={12} />
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                 </span>
              )}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative border border-white p-0.5">
            <motion.div 
              className={`h-full rounded-full relative z-10 ${playMode === 'race' ? 'bg-rose-500 shadow-lg shadow-rose-500/20' : 'bg-blue-600 shadow-lg shadow-blue-500/20'}`}
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / totalSteps) * 100}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
          </div>
        </div>

        {/* Question Area */}
        <motion.div 
            variants={shakeAnimation}
            animate={feedbackType === 'error' ? 'shake' : ''}
            className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center"
        >
          <AnimatePresence mode="wait">
             <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full flex flex-col items-center"
             >
                <div className="text-center mb-10">
                   <span className="text-[9px] font-black italic text-blue-500/60 uppercase tracking-widest mb-3 block">
                      {quizData?.quizType === 'اختبار كتابة' ? (lang === 'ar' ? 'بوابة التعبير اللغوي' : 'Linguistic Expression Portal') :
                       quizData?.quizType === 'اختبار تحدث' ? (lang === 'ar' ? 'بوابة التحدث والطلاقة' : 'Speaking & Fluency Portal') :
                       quizData?.quizType === 'اختبار استماع' ? (lang === 'ar' ? 'بوابة الاستماع والتحليل' : 'Listening & Analysis Portal') :
                       (lang === 'ar' ? 'التحدي الفكري المتواصل' : 'Continuous Thinking Challenge')}
                   </span>
                   <h2 className="text-2xl md:text-3xl font-black text-slate-900 arabic-font leading-relaxed tracking-tight px-4 flex flex-wrap justify-center gap-x-3 text-center">
                      {q.text.split(' ').map((word, i) => (
                        <motion.span 
                          key={i} 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          transition={{ delay: i * 0.03 }}
                        >
                          {word}
                        </motion.span>
                      ))}
                   </h2>
                </div>

                {quizData?.studyMaterial && (
                  <div className="mb-10 max-w-lg w-full">
                    <img 
                       src={quizData.studyMaterial} 
                       alt="Material" 
                       className="rounded-[2rem] border-4 border-white shadow-2xl shadow-slate-200/50 w-full object-contain max-h-[250px]"
                       referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Interactions Layout */}
                <div className="w-full max-w-2xl">
                   {quizData?.quizType === 'اختبار استماع' && quizData?.studyMaterial && (
                     <div className="mb-10 w-full max-w-xl mx-auto">
                        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-blue-100 shadow-xl shadow-blue-500/5 flex flex-col items-center gap-4">
                           <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                              <Volume2 size={24} />
                           </div>
                           <audio controls className="w-full">
                              <source src={quizData.studyMaterial} />
                           </audio>
                           <p className="text-[9px] font-bold text-slate-400 text-center">{lang === 'ar' ? 'استمع جيداً ثم أجب بالأسفل' : 'Listen carefully and answer below'}</p>
                        </div>
                     </div>
                   )}

                   {quizData?.quizType === 'اختبار كتابة' && (
                     <div className="w-full max-w-2xl mx-auto space-y-6">
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-[11px] font-bold text-slate-500 italic text-center">
                           {quizData.description || (lang === 'ar' ? 'اكتب مقالاً حول الموضوع أعلاه...' : 'Write an essay about the topic above...')}
                        </div>
                        <div className="relative group">
                          <textarea 
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value, false, true)}
                            className="w-full bg-white border-4 border-slate-100 rounded-[2.5rem] p-10 text-xl font-bold text-slate-800 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-200 min-h-[300px] shadow-xl shadow-slate-200/50"
                            placeholder={lang === 'ar' ? 'ابدأ الكتابة هنا...' : 'Start writing here...'}
                          />
                          <div className="absolute bottom-6 right-8 text-[10px] font-black text-slate-300 uppercase tracking-widest bg-white/80 px-4 py-1 rounded-full backdrop-blur-sm">
                             { (answers[q.id] || '').length } Characters
                          </div>
                        </div>
                        <WritingKeyboard 
                           lang={lang}
                           onKeyPress={(key) => {
                             const current = answers[q.id] || '';
                             if (key === 'Backspace') {
                               handleAnswerChange(q.id, current.slice(0, -1), false, true);
                             } else {
                               handleAnswerChange(q.id, current + key, false, true);
                             }
                           }}
                        />
                     </div>
                   )}

                   {quizData?.quizType === 'اختبار تحدث' && (
                     <div className="w-full max-w-xl mx-auto">
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-[11px] font-bold text-slate-500 italic text-center mb-6">
                           {quizData.description || (lang === 'ar' ? 'تحدث عما يدور بذهنك بطلاقة...' : 'Speak freely about your thoughts...')}
                        </div>
                        <VoiceRecorder 
                           lang={lang}
                           onComplete={(blob) => {
                             handleAnswerChange(q.id, '[Voice Message Recorded]');
                           }}
                        />
                     </div>
                   )}

                   {/* Standard Questions Render Logic */}
                   {(!quizData?.quizType || (quizData.quizType !== 'اختبار كتابة' && quizData.quizType !== 'اختبار تحدث')) ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {q.type === 'mcq' && q.options.map((opt, oIdx) => (
                         <motion.button
                            key={oIdx}
                            initial={{ opacity: 0, x: lang === 'ar' ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + oIdx * 0.08 }}
                            whileHover={{ 
                              y: -4, 
                              backgroundColor: 'rgba(255, 255, 255, 1)',
                              borderColor: 'rgba(59, 130, 246, 0.3)'
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAnswerChange(q.id, opt, true)}
                            className={`group p-6 rounded-3xl border-2 text-right transition-all flex items-center gap-5 relative overflow-hidden backdrop-blur-sm ${
                              answers[q.id] === opt 
                                ? 'border-blue-500 bg-white ring-8 ring-blue-500/5 shadow-xl shadow-blue-500/10' 
                                : 'border-slate-100 bg-white/60 hover:bg-white hover:border-slate-200 shadow-sm'
                            }`}
                         >
                            <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all group-hover:scale-110 ${answers[q.id] === opt ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:text-blue-500'}`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className={`text-base font-black arabic-font tracking-wide leading-tight ${answers[q.id] === opt ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`}>{opt}</span>
                         </motion.button>
                       ))}

                       {q.type === 'true_false' && ['صح', 'خطأ'].map((opt, oIdx) => (
                          <motion.button
                             key={oIdx}
                             initial={{ opacity: 0, scale: 0.9 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: 0.2 + oIdx * 0.1 }}
                             whileHover={{ y: -5, scale: 1.02 }}
                             whileTap={{ scale: 0.95 }}
                             onClick={() => handleAnswerChange(q.id, opt, true)}
                             className={`p-10 rounded-[3rem] border-2 flex flex-col items-center gap-6 transition-all relative overflow-hidden bg-white shadow-lg ${
                               answers[q.id] === opt 
                                ? (opt === 'صح' ? 'border-emerald-500 bg-emerald-50 shadow-emerald-500/20' : 'border-rose-500 bg-rose-50 shadow-rose-500/20')
                                : 'border-slate-100 hover:border-slate-300'
                             }`}
                          >
                             <div className={`w-24 h-24 rounded-[2.2rem] flex items-center justify-center border-4 transition-all duration-500 shadow-inner ${
                               answers[q.id] === opt 
                                 ? (opt === 'صح' ? 'bg-emerald-500 border-white text-white rotate-12 scale-110 shadow-lg' : 'bg-rose-500 border-white text-white -rotate-12 scale-110 shadow-lg')
                                 : 'bg-slate-50 border-slate-100 text-slate-200'
                             }`}>
                               {opt === 'صح' ? <Check size={48} strokeWidth={4} /> : <X size={48} strokeWidth={4} />}
                             </div>
                             <span className={`text-3xl font-black arabic-font tracking-widest ${answers[q.id] === opt ? 'text-slate-900' : 'text-slate-400'}`}>{opt}</span>
                          </motion.button>
                       ))}

                       {(q.type === 'short_answer' || q.type === 'fill_blank') && (
                         <div className="col-span-full">
                           <input 
                              type="text" 
                              autoFocus
                              value={answers[q.id] || ''}
                              placeholder="..."
                              onChange={(e) => handleAnswerChange(q.id, e.target.value, false, true)}
                              className="w-full bg-white border-4 border-slate-100 rounded-[2.5rem] p-10 text-center text-4xl font-black text-blue-600 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-200 arabic-font shadow-xl shadow-slate-200/50"
                           />
                         </div>
                       )}

                       {(q.type === 'ordering' || q.type === 'drag_drop' || q.type === 'matching') && (
                         <div className="col-span-full flex flex-wrap justify-center gap-4">
                           {q.options.map((opt, idx) => {
                              const currentOrder = answers[q.id] || [];
                              const isSelected = currentOrder.includes(opt);
                              const orderPos = currentOrder.indexOf(opt) + 1;
                              return (
                                <motion.button 
                                   key={idx}
                                   initial={{ opacity: 0, scale: 0.8 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   transition={{ delay: 0.1 + idx * 0.05 }}
                                   whileHover={{ y: -4, scale: 1.05 }}
                                   whileTap={{ scale: 0.95 }}
                                   onClick={() => {
                                      if (isSelected) handleAnswerChange(q.id, currentOrder.filter((o: string) => o !== opt));
                                      else handleAnswerChange(q.id, [...currentOrder, opt]);
                                   }}
                                   className={`px-8 py-5 rounded-[1.8rem] border-2 font-black text-sm transition-all flex items-center gap-5 relative overflow-hidden bg-white ${
                                     isSelected 
                                       ? 'border-blue-500 text-blue-600 shadow-xl shadow-blue-500/10' 
                                       : 'border-slate-100 text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-sm'
                                   }`}
                                >
                                   <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] transition-all duration-500 ${
                                     isSelected ? 'bg-blue-600 text-white shadow-lg rotate-6 scale-110' : 'bg-slate-50 text-slate-200'
                                   }`}>
                                     {isSelected ? orderPos : <GripVertical size={16} className="opacity-40" />}
                                   </div>
                                   <span className="arabic-font text-base">{opt}</span>
                                </motion.button>
                              );
                           })}
                         </div>
                       )}
                     </div>
                   ) : null}
                   
                   {q.type === 'chess_puzzle' && q.chessConfig && (
                    <WordChessGame 
                      boardSize={q.chessConfig.boardSize}
                      initialPos={q.chessConfig.initialPos}
                      targetPos={q.chessConfig.targetPos}
                      pieceType={q.chessConfig.pieceType}
                      gridData={q.chessConfig.gridData}
                      lang={lang}
                      onWin={() => handleAnswerChange(q.id, 'CHESS_MASTERED', true)}
                    />
                  )}
                </div>
             </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Dynamic Floating Feedback */}
        <AnimatePresence>
          {feedbackType && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: -40, scale: 1.2 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className={`absolute pointer-events-none z-50 flex items-center gap-3 px-6 py-3 rounded-full border shadow-2xl ${
                feedbackType === 'success' 
                  ? 'bg-emerald-500 text-white border-emerald-400' 
                  : 'bg-rose-500 text-white border-rose-400'
              }`}
            >
              {feedbackType === 'success' ? (
                <>
                  <CheckCircle2 size={24} />
                  <span className="font-black arabic-font">{lang === 'ar' ? 'أحسنت!' : 'Excellent!'}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black">+{q?.points || 0}</span>
                </>
              ) : (
                <>
                  <AlertCircle size={24} />
                  <span className="font-black arabic-font">{lang === 'ar' ? 'حاول مجدداً' : 'Try Again'}</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Feedback Indicators */}
        <div className="mt-20 flex gap-16 text-[10px] font-black uppercase tracking-[0.3em]">
           <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
             {lang === 'ar' ? 'إجابات صحيحة' : 'Mastery'}: {correctCount}
           </div>
           <div className="flex items-center gap-3 text-rose-600 bg-rose-50 px-6 py-3 rounded-2xl border border-rose-100 shadow-sm">
             <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
             {lang === 'ar' ? 'أخطاء علمية' : 'Learning Gaps'}: {errorCount}
           </div>
        </div>

        {/* Navigation Dot Indicators */}
        <div className="mt-12 flex justify-center gap-2.5">
            {questions.map((_, idx) => (
                <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                        idx === currentIndex 
                        ? 'w-12 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                        : (answers[questions[idx].id] ? 'w-6 bg-blue-200' : 'w-2.5 bg-slate-200')
                    }`}
                />
            ))}
        </div>

        {/* Progress Controls */}
        <div className="mt-12 w-full max-w-sm flex gap-4">
           {currentIndex === totalSteps - 1 ? (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={calculateScore}
                className={`w-full py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all ${isAnswered ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-slate-100 text-slate-300 pointer-events-none'}`}
              >
                {lang === 'ar' ? 'إرسال الإجابات' : 'Submit Assessment'}
              </motion.button>
           ) : (
              <button 
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className={`w-full py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl ${isAnswered ? 'bg-slate-900 text-white shadow-slate-900/20 hover:scale-105 active:scale-95' : 'bg-slate-100 text-slate-300 pointer-events-none shadow-none'}`}
              >
                {lang === 'ar' ? 'المهمة التالية' : 'Next Task'}
              </button>
           )}
        </div>
      </div>

      {/* Success/Error Splash Feedback Overlay */}
      <AnimatePresence>
          {feedbackType && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className={`absolute inset-0 z-40 pointer-events-none backdrop-blur-[2px] ${feedbackType === 'success' ? 'bg-emerald-500/[0.03]' : 'bg-rose-500/[0.03]'}`}
            />
          )}
      </AnimatePresence>
    </motion.div>
  );
};

