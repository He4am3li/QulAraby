import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Highlighter, Type, Wand2, 
  Timer, BarChart3, Paperclip, X, Play, RotateCcw, RotateCw,
  ChevronRight, ChevronLeft, Send, Loader2, Pencil, Eraser,
  Smile, Image as ImageIcon, FileUp, MoreHorizontal,
  StickyNote, Users, MousePointer2, FileText, Layers, ChevronDown, Check,
  Disc, Shapes, Youtube, Camera, Video, Square, Pause, Download, Sparkles,
  Zap, BookOpen, Flame, Volume2, Scissors, GitFork, Trophy, Award, Hand,
  Dices, Undo2, Redo2, Plus, Lock, Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { generateQuickExercise } from '../services/gemini';
import { downloadPlacementTestPDF } from '../services/placementTestPdf';
import { GEOMETRIC_SHAPES } from './whiteboard/GeometricShapesHelper';
import { SpinningWheel } from './whiteboard/SpinningWheelModal';
import { 
  ARABIC_ALPHABET_FORMS, 
  HARAKAT_OPTIONS, 
  WORD_SLICER_PRESETS, 
  GRAMMAR_SAMPLES, 
  speakArabic,
  analyzeArabicWord
} from './whiteboard/ArabicLinguisticData';
import { 
  startVideoRecording, 
  stopVideoRecording, 
  pauseVideoRecording, 
  resumeVideoRecording, 
  captureWhiteboardScreenshot,
  ScreenRecorderState
} from '../services/mediaRecordingService';

// Board surfaces definitions
export type BoardSurfaceType = 'blackboard' | 'whiteboard' | 'notebook' | 'calligraphy_9lines';

interface BoardSurfaceOption {
  id: BoardSurfaceType;
  label: string;
  subLabel: string;
  icon: string;
  bgGradient: string;
  defaultColor: string;
}

const BOARD_SURFACES: BoardSurfaceOption[] = [
  { 
    id: 'blackboard', 
    label: 'السبورة السوداء', 
    subLabel: '', 
    icon: '⬛', 
    bgGradient: 'from-amber-950/90 to-emerald-950/90', 
    defaultColor: '#ffffff' 
  },
  { 
    id: 'whiteboard', 
    label: 'السبورة البيضاء', 
    subLabel: '', 
    icon: '⬜', 
    bgGradient: 'from-slate-100 to-slate-200', 
    defaultColor: '#0f172a' 
  },
  { 
    id: 'notebook', 
    label: 'دفتر مسطر', 
    subLabel: '', 
    icon: '📖', 
    bgGradient: 'from-amber-50 to-blue-50', 
    defaultColor: '#1e40af' 
  },
  { 
    id: 'calligraphy_9lines', 
    label: 'دفتر الخط العربي', 
    subLabel: '', 
    icon: '📜', 
    bgGradient: 'from-amber-100/80 to-orange-50', 
    defaultColor: '#334155' 
  }
];

export const TeacherToolbar: React.FC = () => {
  const { profile, user, isAuthReady } = useAuth();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const [currentBoardSurface, setCurrentBoardSurface] = useState<BoardSurfaceType>('blackboard');
  const [showSurfaceMenu, setShowSurfaceMenu] = useState(false);
  
  const [lang, setLang] = useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  useEffect(() => {
    // Listen to theme changes from the whiteboard if triggered elsewhere
    const handleThemeEvent = (e: any) => {
      if (e.detail?.theme) {
        setCurrentBoardSurface(e.detail.theme);
      }
    };
    window.addEventListener('qul_whiteboard_theme_changed', handleThemeEvent);
    return () => window.removeEventListener('qul_whiteboard_theme_changed', handleThemeEvent);
  }, []);

  const handleSelectBoardSurface = (surfaceId: BoardSurfaceType) => {
    setCurrentBoardSurface(surfaceId);
    setShowSurfaceMenu(false);
    
    // Dispatch custom event for immediate responsive update in Whiteboard.tsx
    window.dispatchEvent(new CustomEvent('qul_change_whiteboard_theme', {
      detail: { 
        theme: surfaceId,
        background: surfaceId === 'notebook' ? 'lined' : (surfaceId === 'calligraphy_9lines' ? 'calligraphy_9lines' : 'blank')
      }
    }));
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const updateLang = () => {
      setLang((localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar');
    };
    window.addEventListener('langChanged', updateLang);
    return () => window.removeEventListener('langChanged', updateLang);
  }, []);

  // Modal / Tool States
  const [drawMode, setDrawMode] = useState<'pen' | 'highlight' | 'eraser'>('highlight');
  const [showSubMenu, setShowSubMenu] = useState<string | null>(null);

  // New tools state
  const [shapesMode, setShapesMode] = useState<'outline' | 'filled'>('outline');
  const [selectedShapeColor, setSelectedShapeColor] = useState<string>('#3b82f6');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [recordingState, setRecordingState] = useState<ScreenRecorderState>({
    isRecording: false,
    isPaused: false,
    durationSec: 0
  });
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [screenshotSuccess, setScreenshotSuccess] = useState(false);

  // Interactive Laser state
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);
  const [laserRipple, setLaserRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  // Arabic Language Suite state
  const [arabicTab, setArabicTab] = useState<'letters' | 'harakat' | 'slicer' | 'grammar'>('letters');
  const [selectedLetter, setSelectedLetter] = useState(ARABIC_ALPHABET_FORMS[1]); // Default: ب
  const [customSlicerWord, setCustomSlicerWord] = useState('');
  const [slicerResult, setSlicerResult] = useState(WORD_SLICER_PRESETS[0]);
  const [selectedGrammarMode, setSelectedGrammarMode] = useState<'parts' | 'gender' | 'number'>('parts');

  // Student Interaction state
  const [interactionTab, setInteractionTab] = useState<'hands' | 'points' | 'reactions' | 'wheel'>('hands');
  const [pickedStudent, setPickedStudent] = useState<string | null>(null);
  const [isPickingStudent, setIsPickingStudent] = useState(false);

  // Tool States
  const [timerDuration, setTimerDuration] = useState(60);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['نعم', 'لا']);
  const [wandContext, setWandContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [highlightColor, setHighlightColor] = useState('rgba(255, 255, 0, 0.4)');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(16);
  const [stickyColor, setStickyColor] = useState('#fef08a');
  const [highlightWidth, setHighlightWidth] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{x: number, y: number}[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [textInput, setTextInput] = useState<{x: number, y: number, clientX?: number, clientY?: number} | null>(null);
  const [stickyInput, setStickyInput] = useState<{x: number, y: number, clientX?: number, clientY?: number} | null>(null);
  const [tempText, setTempText] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync isLocked from sessionData
  useEffect(() => {
    if (sessionData?.isLocked !== undefined) {
      setIsLocked(!!sessionData.isLocked);
    }
  }, [sessionData?.isLocked]);

  const handleToggleLock = async () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    try {
      await updateDoc(doc(db, 'live_sessions', 'global'), {
        isLocked: nextLocked,
        lastUpdate: serverTimestamp()
      });
      window.dispatchEvent(new CustomEvent('qul_whiteboard_toggle_lock', { detail: { isLocked: nextLocked } }));
    } catch (err) {
      console.error("Error updating lock state:", err);
    }
  };

  // Refs for stable event listeners
  const activeToolRef = useRef(activeTool);
  const highlightColorRef = useRef(highlightColor);
  const highlightWidthRef = useRef(highlightWidth);
  const sessionDataRef = useRef(sessionData);
  const isDrawingRef = useRef(isDrawing);
  const currentStrokeRef = useRef(currentStroke);

  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { highlightColorRef.current = highlightColor; }, [highlightColor]);
  useEffect(() => { highlightWidthRef.current = highlightWidth; }, [highlightWidth]);
  useEffect(() => { sessionDataRef.current = sessionData; }, [sessionData]);
  useEffect(() => { isDrawingRef.current = isDrawing; }, [isDrawing]);
  useEffect(() => { currentStrokeRef.current = currentStroke; }, [currentStroke]);

  useEffect(() => {
    if (activeTool === 'highlight') {
      document.body.style.cursor = 'crosshair';
    } else if (activeTool === 'laser') {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [activeTool]);

  useEffect(() => {
    if (!isAuthReady || !user) return;
    
    const unsubscribe = onSnapshot(doc(db, 'live_sessions', 'global'), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setSessionData(data);
        if (data.activeTool !== undefined && data.activeTool !== activeToolRef.current) {
          setActiveTool(data.activeTool);
        }
      }
    }, (error) => {
      console.error("Teacher toolbar session error:", error);
    });
    return () => unsubscribe();
  }, [isAuthReady, user]);

  // Interactive Laser Pointer Handler
  useEffect(() => {
    if (activeTool !== 'laser') {
      setLaserPos(null);
      return;
    }

    let lastBroadcastTime = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;
      setLaserPos({ x, y });

      const now = Date.now();
      if (now - lastBroadcastTime > 80) {
        lastBroadcastTime = now;
        setDoc(doc(db, 'live_sessions', 'global'), {
          laserPosition: { x, y, timestamp: now },
          teacherId: user?.uid,
          lastUpdate: serverTimestamp()
        }, { merge: true }).catch(() => {});
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;
      setLaserRipple({ x, y, id: Date.now() });
      setTimeout(() => setLaserRipple(null), 800);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
    };
  }, [activeTool, user]);

  const handleResetAll = async () => {
    try {
      await updateDoc(doc(db, 'live_sessions', 'global'), {
        activeTool: null,
        currentStroke: null,
        highlights: [],
        texts: [],
        stickyNotes: [],
        stickers: [],
        timer: { isActive: false, duration: 60, endTime: null },
        poll: { isActive: false, question: '', options: ['نعم', 'لا'], votes: {} },
        exercise: { isActive: false },
        sharedFile: { isActive: false, url: '' },
        laserPosition: null,
        reaction: null,
        lastUpdate: serverTimestamp()
      });
      setActiveTool(null);
      setShowSubMenu(null);
      setShowResetConfirm(false);
    } catch (err) {
      console.error("Error resetting session:", err);
    }
  };

  // Undo & Redo Handlers
  const handleUndoAction = async () => {
    // 1. Dispatch custom event to Whiteboard.tsx
    window.dispatchEvent(new CustomEvent('qul_whiteboard_undo'));

    // 2. Also undo stroke in live session if any exists
    if (sessionDataRef.current?.highlights && sessionDataRef.current.highlights.length > 0) {
      const remaining = sessionDataRef.current.highlights.slice(0, -1);
      try {
        await updateDoc(doc(db, 'live_sessions', 'global'), {
          highlights: remaining,
          lastUpdate: serverTimestamp()
        });
      } catch (err) {
        console.error("Undo error:", err);
      }
    }
  };

  const handleRedoAction = () => {
    window.dispatchEvent(new CustomEvent('qul_whiteboard_redo'));
  };

  const extractYouTubeVideoId = (url: string): string => {
    if (!url) return '';
    const clean = url.trim();
    if (clean.length === 11 && !clean.includes('/') && !clean.includes('?')) return clean;
    const match = clean.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return (match && match[2].length === 11) ? match[2] : clean;
  };

  const generateUniqueId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const handleInsertShape = (shapeId: string) => {
    const shapeDef = GEOMETRIC_SHAPES.find(s => s.id === shapeId) || GEOMETRIC_SHAPES[0];
    const color = selectedShapeColor || shapeDef.defaultColor;
    const newEl = {
      id: generateUniqueId('shape'),
      type: 'shape_card',
      x: 350,
      y: 200,
      width: 140,
      height: 140,
      color: color,
      strokeWidth: 4,
      shapeData: {
        shapeType: shapeId,
        isFilled: shapesMode === 'filled',
        fillColor: color,
        strokeColor: color
      }
    };
    window.dispatchEvent(new CustomEvent('qul_insert_whiteboard_element', { detail: { element: newEl } }));
    setShowSubMenu(null);
  };

  const handleInsertYoutube = (url: string, title?: string) => {
    if (!url.trim()) return;
    const videoId = extractYouTubeVideoId(url);
    const newEl = {
      id: generateUniqueId('youtube'),
      type: 'youtube_card',
      x: 300,
      y: 160,
      width: 440,
      height: 280,
      color: '#ef4444',
      strokeWidth: 2,
      videoData: {
        url: url.trim(),
        videoId: videoId,
        title: title || 'فيديو يوتيوب للشرح'
      }
    };
    window.dispatchEvent(new CustomEvent('qul_insert_whiteboard_element', { detail: { element: newEl } }));
    setShowSubMenu(null);
    setYoutubeUrl('');
  };

  const handleInsertWheel = (items: string[]) => {
    const newEl = {
      id: generateUniqueId('wheel'),
      type: 'wheel_card',
      x: 320,
      y: 150,
      width: 290,
      height: 380,
      color: '#f59e0b',
      strokeWidth: 2,
      wheelData: { items }
    };
    window.dispatchEvent(new CustomEvent('qul_insert_whiteboard_element', { detail: { element: newEl } }));
    setShowSubMenu(null);
  };

  // Arabic Tools Inserters
  const handleInsertArabicLetterCard = (letterData: typeof ARABIC_ALPHABET_FORMS[0]) => {
    const newEl = {
      id: generateUniqueId('letter_card'),
      type: 'arabic_card',
      x: 340,
      y: 160,
      width: 320,
      height: 260,
      color: '#10b981',
      strokeWidth: 2,
      cardData: {
        letter: letterData.letter,
        word: `حرف ${letterData.name} (${letterData.letter})`,
        forms: {
          isolated: letterData.isolated,
          initial: letterData.initial,
          medial: letterData.medial,
          final: letterData.final
        },
        harakat: letterData.harakat,
        tanween: letterData.tanween,
        madd: letterData.madd,
        examples: letterData.examples,
        grammarCategory: 'الحروف الهجائية'
      }
    };
    window.dispatchEvent(new CustomEvent('qul_insert_whiteboard_element', { detail: { element: newEl } }));
    setShowSubMenu(null);
  };

  const handleInsertLetterFormText = (text: string) => {
    const newEl = {
      id: generateUniqueId('text'),
      type: 'text',
      x: 380,
      y: 220,
      width: 140,
      height: 90,
      color: '#ffffff',
      strokeWidth: 2,
      text: text,
      fontSize: 48,
      fontFamily: 'Amiri, serif'
    };
    window.dispatchEvent(new CustomEvent('qul_insert_whiteboard_element', { detail: { element: newEl } }));
    setShowSubMenu(null);
  };

  const handleInsertWordSlicerCard = (preset: typeof WORD_SLICER_PRESETS[0]) => {
    const newEl = {
      id: generateUniqueId('slicer'),
      type: 'word_slicer_card',
      x: 330,
      y: 160,
      width: 340,
      height: 250,
      color: '#06b6d4',
      strokeWidth: 2,
      cardData: {
        word: preset.word,
        syllables: preset.syllables,
        root: preset.root,
        wazn: preset.wazn,
        meaning: preset.meaning
      }
    };
    window.dispatchEvent(new CustomEvent('qul_insert_whiteboard_element', { detail: { element: newEl } }));
    setShowSubMenu(null);
  };

  const handleInsertGrammarCard = (item: typeof GRAMMAR_SAMPLES[0]) => {
    const newEl = {
      id: generateUniqueId('grammar'),
      type: 'grammar_card',
      x: 350,
      y: 180,
      width: 300,
      height: 180,
      color: '#a855f7',
      strokeWidth: 2,
      cardData: {
        word: item.word,
        grammarCategory: item.categoryName,
        translation: item.translation
      }
    };
    window.dispatchEvent(new CustomEvent('qul_insert_whiteboard_element', { detail: { element: newEl } }));
    setShowSubMenu(null);
  };

  // Student Interaction Actions
  const handleTriggerLiveReaction = async (emoji: string) => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.8 }
    });
    try {
      await setDoc(doc(db, 'live_sessions', 'global'), {
        reaction: { emoji, timestamp: Date.now(), teacher: profile?.displayName || 'المعلم' },
        lastUpdate: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error triggering reaction:", err);
    }
  };

  const handleAwardStudent = async (studentId: string, studentName: string, delta: number) => {
    try {
      const currentStudents = sessionData?.students || {};
      const curScore = currentStudents[studentId]?.score || 0;
      const newScore = Math.max(0, curScore + delta);

      await updateDoc(doc(db, 'live_sessions', 'global'), {
        [`students.${studentId}.score`]: newScore,
        lastUpdate: serverTimestamp()
      });

      if (delta > 0) {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.7 }
        });
      }
    } catch (err) {
      console.error("Error awarding student:", err);
    }
  };

  const handlePickRandomStudent = () => {
    const studentsMap = sessionData?.students || {};
    const studentNames = Object.values(studentsMap).map((s: any) => s.name || s.displayName).filter(Boolean);
    const defaultPool = ['أحمد بن محمد', 'سارة العلي', 'عمر الخالد', 'فاطمة الزهراء', 'يوسف محمود', 'مريم القحطاني'];
    const candidates = studentNames.length > 0 ? studentNames : defaultPool;

    setIsPickingStudent(true);
    let count = 0;
    const interval = setInterval(() => {
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      setPickedStudent(randomCandidate);
      count++;
      if (count > 12) {
        clearInterval(interval);
        setIsPickingStudent(false);
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }, 100);
  };

  const handleTakeScreenshot = async () => {
    const result = await captureWhiteboardScreenshot();
    if (result) {
      setScreenshotSuccess(true);
      setTimeout(() => setScreenshotSuccess(false), 3000);
    }
  };

  const handleStartRecording = async () => {
    setRecordingError(null);
    await startVideoRecording(
      (state) => {
        setRecordingState(state);
      },
      (err) => {
        console.error("Recording error:", err);
        setRecordingError(err?.message || "تعذر بدء تسجيل الفيديو");
      }
    );
  };

  const handleStopRecording = () => {
    stopVideoRecording((state) => {
      setRecordingState(state);
    });
  };

  const handlePauseRecording = () => {
    pauseVideoRecording((state) => {
      setRecordingState(state);
    });
  };

  const handleResumeRecording = () => {
    resumeVideoRecording((state) => {
      setRecordingState(state);
    });
  };

  const tools = [
    { id: 'select', icon: <MousePointer2 size={18} />, label: 'تحديد', color: 'bg-slate-700' },
    { id: 'laser', icon: <Zap size={18} className="text-red-400" />, label: 'ليزر تفاعلي', color: 'bg-slate-700' },
    { id: 'arabic-suite', icon: <BookOpen size={18} className="text-emerald-400" />, label: 'أدوات لغوية', color: 'bg-slate-700' },
    { id: 'student-interaction', icon: <Flame size={18} className="text-amber-400" />, label: 'تفاعل الطلاب', color: 'bg-slate-700' },
    { id: 'highlight', icon: <Highlighter size={18} />, label: 'رسم وتحديد', color: 'bg-slate-700' },
    { id: 'wheel', icon: <Disc size={18} />, label: 'العجلة الدوارة', color: 'bg-slate-700' },
    { id: 'shapes', icon: <Shapes size={18} />, label: 'أشكال هندسية', color: 'bg-slate-700' },
    { id: 'youtube', icon: <Youtube size={18} />, label: 'فيديو يوتيوب', color: 'bg-slate-700' },
    { id: 'recording', icon: <Camera size={18} />, label: 'لقطة شاشة وتسجيل', color: 'bg-slate-700' },
    { id: 'text', icon: <Type size={18} />, label: 'نص', color: 'bg-slate-700' },
    { id: 'sticky', icon: <StickyNote size={18} />, label: 'ملاحظة لاصقة', color: 'bg-slate-700' },
    { id: 'timer', icon: <Timer size={18} />, label: 'مؤقت', color: 'bg-slate-700' },
    { id: 'poll', icon: <BarChart3 size={18} />, label: 'تصويت', color: 'bg-slate-700' },
    { id: 'file', icon: <FileUp size={18} />, label: 'ملف', color: 'bg-slate-700' },
    { id: 'student-work', icon: <Users size={18} />, label: 'أعمال الطلاب', color: 'bg-slate-700' },
    { id: 'emoji', icon: <Smile size={18} />, label: 'ملصقات', color: 'bg-slate-700' },
  ];

  const toggleTool = async (toolId: string) => {
    if (toolId === 'select') {
      setActiveTool(null);
      setShowSubMenu(null);
      await setDoc(doc(db, 'live_sessions', 'global'), {
        activeTool: null,
        teacherId: user?.uid,
        lastUpdate: serverTimestamp()
      }, { merge: true });
      window.dispatchEvent(new CustomEvent('qul_set_whiteboard_tool', { detail: { tool: 'select' } }));
      return;
    }

    if (toolId === 'laser') {
      const newTool = activeTool === 'laser' ? null : 'laser';
      setActiveTool(newTool);
      setShowSubMenu(null);
      window.dispatchEvent(new CustomEvent('qul_set_whiteboard_tool', { detail: { tool: newTool ? 'laser' : 'select' } }));
      try {
        await setDoc(doc(db, 'live_sessions', 'global'), {
          activeTool: newTool,
          teacherId: user?.uid,
          lastUpdate: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error("Error syncing tool:", err);
      }
      return;
    }

    if (activeTool === toolId) {
      setShowSubMenu(showSubMenu === toolId ? null : toolId);
      return;
    }

    const newTool = activeTool === toolId ? null : toolId;
    setActiveTool(newTool);
    setShowSubMenu(newTool ? toolId : null);
    
    // Sync with whiteboard canvas tool
    if (toolId === 'highlight') {
      window.dispatchEvent(new CustomEvent('qul_set_whiteboard_tool', { detail: { tool: drawMode === 'pen' ? 'pen' : (drawMode === 'eraser' ? 'eraser' : 'highlighter') } }));
    } else if (toolId === 'text') {
      window.dispatchEvent(new CustomEvent('qul_set_whiteboard_tool', { detail: { tool: 'text' } }));
    } else if (toolId === 'sticky') {
      window.dispatchEvent(new CustomEvent('qul_set_whiteboard_tool', { detail: { tool: 'sticky' } }));
    }

    try {
      await setDoc(doc(db, 'live_sessions', 'global'), {
        activeTool: newTool,
        teacherId: user?.uid,
        lastUpdate: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error syncing tool:", err);
    }
  };

  const startTimer = async () => {
    try {
      await setDoc(doc(db, 'live_sessions', 'global'), {
        timer: {
          endTime: Date.now() + (timerDuration * 1000),
          duration: timerDuration,
          isActive: true
        },
        lastUpdate: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error starting timer:", err);
    }
  };

  const startPoll = async () => {
    try {
      await setDoc(doc(db, 'live_sessions', 'global'), {
        poll: {
          question: pollQuestion,
          options: pollOptions,
          votes: {},
          isActive: true
        },
        lastUpdate: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error starting poll:", err);
    }
  };

  const generateExercise = async () => {
    setIsGenerating(true);
    try {
      const exercise = await generateQuickExercise(wandContext);
      await setDoc(doc(db, 'live_sessions', 'global'), {
        exercise: { ...exercise, isActive: true, timestamp: Date.now() },
        lastUpdate: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error generating exercise:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const simplifyPath = (points: {x: number, y: number}[], tolerance = 0.5) => {
    if (points.length <= 2) return points;
    const simplified = [points[0]];
    let lastPoint = points[0];
    for (let i = 1; i < points.length - 1; i++) {
      const dist = Math.sqrt(Math.pow(points[i].x - lastPoint.x, 2) + Math.pow(points[i].y - lastPoint.y, 2));
      if (dist > tolerance) {
        simplified.push(points[i]);
        lastPoint = points[i];
      }
    }
    simplified.push(points[points.length - 1]);
    return simplified;
  };

  const addHighlight = async (points: {x: number, y: number}[]) => {
    try {
      const currentHighlights = sessionDataRef.current?.highlights || [];
      const smoothedPoints = simplifyPath(points);
      const newHighlights = [...currentHighlights, {
        id: generateUniqueId('hl'),
        points: smoothedPoints,
        color: highlightColorRef.current,
        width: drawMode === 'pen' ? 4 : highlightWidthRef.current,
        mode: drawMode,
        timestamp: Date.now()
      }];
      await updateDoc(doc(db, 'live_sessions', 'global'), {
        highlights: newHighlights,
        currentStroke: null
      });
    } catch (err) {
      console.error("Error saving highlight:", err);
    }
  };

  const addTextAnnotation = async (text: string, x: number, y: number) => {
    try {
      const currentTexts = sessionDataRef.current?.texts || [];
      await updateDoc(doc(db, 'live_sessions', 'global'), {
        texts: [...currentTexts, { 
          id: generateUniqueId('txt'),
          content: text, 
          text, 
          x, 
          y, 
          color: textColor, 
          size: textSize, 
          fontSize: textSize,
          timestamp: Date.now() 
        }]
      });
    } catch (err) {
      console.error("Error saving text:", err);
    }
  };

  const addStickyNote = async (text: string, x: number, y: number) => {
    try {
      const currentNotes = sessionDataRef.current?.stickyNotes || [];
      await updateDoc(doc(db, 'live_sessions', 'global'), {
        stickyNotes: [...currentNotes, { 
          id: generateUniqueId('sticky'),
          content: text, 
          text, 
          x, 
          y, 
          color: stickyColor, 
          authorName: profile?.displayName || 'المعلم',
          timestamp: Date.now() 
        }]
      });
    } catch (err) {
      console.error("Error saving sticky note:", err);
    }
  };

  const addSticker = async (emoji: string) => {
    // Dispatch single sticker element to Whiteboard canvas
    const newEl = {
      id: generateUniqueId('sticker'),
      type: 'sticker',
      x: 360,
      y: 200,
      width: 100,
      height: 100,
      color: '#ffffff',
      text: emoji,
      emoji: emoji
    };
    window.dispatchEvent(new CustomEvent('qul_insert_whiteboard_element', { detail: { element: newEl } }));
    setShowSubMenu(null);
  };

  // Drawing event listeners for highlight tool
  useEffect(() => {
    const handleMouseDown = async (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.teacher-toolbar-container')) return;
      if ((e.target as HTMLElement).closest('.sub-menu-container')) return;
      
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      if (activeToolRef.current === 'highlight') {
        if (drawMode === 'eraser') {
          const remainingHighlights = (sessionDataRef.current?.highlights || []).filter((h: any) => {
            return !h.points.some((p: any) => Math.abs(p.x - x) < 3 && Math.abs(p.y - y) * (window.innerHeight/window.innerWidth) < 3);
          });
          if (remainingHighlights.length !== (sessionDataRef.current?.highlights || []).length) {
            await updateDoc(doc(db, 'live_sessions', 'global'), { highlights: remainingHighlights });
          }
          return;
        }
        setIsDrawing(true);
        setCurrentStroke([{x, y}]);
      } else if (activeToolRef.current === 'text') {
        if (textInput) return;
        setTextInput({ x, y, clientX: e.clientX, clientY: e.clientY });
        setTempText('');
      } else if (activeToolRef.current === 'sticky') {
        if (stickyInput) return;
        setStickyInput({ x, y, clientX: e.clientX, clientY: e.clientY });
        setTempText('');
      }
    };

    const handleMouseMove = async (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.teacher-toolbar-container')) return;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      if (isDrawingRef.current && activeToolRef.current === 'highlight') {
        if (drawMode === 'eraser') {
          const remainingHighlights = (sessionDataRef.current?.highlights || []).filter((h: any) => {
            return !h.points.some((p: any) => Math.abs(p.x - x) < 3 && Math.abs(p.y - y) * (window.innerHeight/window.innerWidth) < 3);
          });
          if (remainingHighlights.length !== (sessionDataRef.current?.highlights || []).length) {
            await updateDoc(doc(db, 'live_sessions', 'global'), { highlights: remainingHighlights });
          }
        } else {
          const newStroke = [...currentStrokeRef.current, {x, y}];
          setCurrentStroke(newStroke);
          if (newStroke.length % 5 === 0) {
            await updateDoc(doc(db, 'live_sessions', 'global'), { 
              currentStroke: { points: newStroke, color: highlightColorRef.current, width: drawMode === 'pen' ? 4 : highlightWidthRef.current, mode: drawMode }
            });
          }
        }
      }
    };

    const handleMouseUp = async () => {
      if (isDrawingRef.current) {
        setIsDrawing(false);
        if (activeToolRef.current === 'highlight' && currentStrokeRef.current.length > 1) {
          await addHighlight(currentStrokeRef.current);
        }
        setCurrentStroke([]);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeTool, drawMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      alert("حجم الملف كبير جداً. يرجى اختيار صورة أصغر من 800 كيلوبايت.");
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFileData(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const shareFile = async () => {
    if (!fileData) return;
    try {
      await setDoc(doc(db, 'live_sessions', 'global'), {
        sharedFile: { url: fileData, isActive: true },
        lastUpdate: serverTimestamp()
      }, { merge: true });
      setShowSubMenu(null);
      setFileData(null);
    } catch (err) {
      console.error("Error sharing file:", err);
    }
  };

  if (!isAuthReady) return null;
  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin';
  if (!isTeacher) return null;

  const isSidebarRight = lang === 'ar';
  const sidebarGradient = 'linear-gradient(to left, #0f172a 0%, #064e3b 100%)';

  return (
    <>
      {/* Laser Pointer Global Interactive Overlay */}
      {activeTool === 'laser' && laserPos && (
        <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
          {/* Laser central pulsating dot */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-75"
            style={{ left: `${laserPos.x}%`, top: `${laserPos.y}%` }}
          >
            {/* Outermost pulsing aura */}
            <div className="w-10 h-10 rounded-full bg-red-500/20 animate-ping absolute" />
            <div className="w-6 h-6 rounded-full bg-red-500/40 shadow-[0_0_25px_#ef4444] absolute" />
            {/* High-intensity red core */}
            <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_12px_#ff0000] border-2 border-white flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>

          {/* Click Ping Ripple Effect */}
          {laserRipple && (
            <motion.div
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-red-400 bg-red-500/20 pointer-events-none"
              style={{ left: `${laserRipple.x}%`, top: `${laserRipple.y}%` }}
            />
          )}
        </div>
      )}

      {/* Main Floating Teacher Toolbar */}
      <div 
        className="fixed bottom-8 z-[9999] flex items-center gap-3 teacher-toolbar-container -translate-x-1/2 transition-all duration-500" 
        style={{ 
          left: isMobile ? '50%' : (isSidebarRight ? 'calc(50% - 128px)' : 'calc(50% + 128px)'),
          direction: isSidebarRight ? 'rtl' : 'ltr'
        }}
      >
        <AnimatePresence>
          {!isMinimized && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="border border-white/10 p-1 rounded-2xl shadow-2xl flex flex-row items-center gap-1 relative overflow-visible"
              style={{ background: sidebarGradient }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none rounded-2xl" />
              <div className="flex items-center gap-0.5">
                {/* Board Surfaces Selector */}
                <div className="relative shrink-0 border-l border-white/15 pl-1 ml-0.5">
                  <button
                    onClick={() => {
                      setShowSubMenu(null);
                      setShowSurfaceMenu(!showSurfaceMenu);
                    }}
                    className={`p-2 rounded-xl flex items-center gap-1.5 transition-all duration-300 ${
                      showSurfaceMenu
                        ? 'bg-white text-slate-900 shadow-lg scale-105 font-bold'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                    title="أشكال وخلفيات السبورة"
                  >
                    <span className="text-base">
                      {BOARD_SURFACES.find(s => s.id === currentBoardSurface)?.icon || '⬛'}
                    </span>
                    <ChevronDown size={12} className={`transition-transform duration-300 ${showSurfaceMenu ? 'rotate-180 text-white/80' : 'text-white/50'}`} />
                  </button>

                  <AnimatePresence>
                    {showSurfaceMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute bottom-full mb-3 right-0 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-2xl z-[10000] w-52 min-w-[190px] flex flex-col gap-2 ring-1 ring-white/10 text-right sub-menu-container"
                      >
                        <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">
                          أشكال وخلفيات السبورة
                        </h3>

                        <div className="flex flex-col gap-1">
                          {BOARD_SURFACES.map((surface) => {
                            const isSelected = currentBoardSurface === surface.id;
                            return (
                              <button
                                key={surface.id}
                                onClick={() => handleSelectBoardSurface(surface.id)}
                                className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all border text-right group ${
                                  isSelected
                                    ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-md shadow-amber-950/30'
                                    : 'bg-white/5 border-white/5 text-white/80 hover:bg-white/10 hover:border-white/15'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{surface.icon}</span>
                                  <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors arabic-font">
                                    {surface.label}
                                  </span>
                                </div>
                                {isSelected && (
                                  <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center">
                                    <Check size={10} className="stroke-[3]" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Primary Tools List */}
                {tools.map((tool) => (
                  <div key={tool.id} className="relative">
                    <button
                      onClick={() => toggleTool(tool.id)}
                      className={`relative group p-2 rounded-xl transition-all duration-300 ${(activeTool === tool.id || (tool.id === 'select' && activeTool === null)) ? `bg-white text-slate-900 shadow-lg scale-105` : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                      title={tool.label}
                    >
                      {tool.icon}
                      {(activeTool === tool.id || (tool.id === 'select' && activeTool === null)) && (
                        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                      )}
                    </button>

                    <AnimatePresence>
                      {showSubMenu === tool.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-3 min-w-[140px] sub-menu-container z-[10000]"
                        >
                          {/* 2. Arabic Language Suite Submenu */}
                          {tool.id === 'arabic-suite' && (
                            <div className="flex flex-col gap-1.5 min-w-[340px] max-w-[360px] text-right" dir="rtl">
                              <div className="border-b border-white/10 pb-1 flex items-center justify-between">
                                <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                                  الأدوات اللغوية
                                </h3>
                                <div className="flex gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
                                  <button
                                    onClick={() => setArabicTab('letters')}
                                    className={`px-2.5 py-0.5 rounded-md text-[9px] font-black transition-all ${arabicTab === 'letters' ? 'bg-yellow-400 text-slate-950 shadow' : 'text-white/60 hover:text-white'}`}
                                  >
                                    الحروف
                                  </button>
                                  <button
                                    onClick={() => setArabicTab('slicer')}
                                    className={`px-2.5 py-0.5 rounded-md text-[9px] font-black transition-all ${arabicTab === 'slicer' ? 'bg-yellow-400 text-slate-950 shadow' : 'text-white/60 hover:text-white'}`}
                                  >
                                    تحليل الكلمات
                                  </button>
                                </div>
                              </div>

                              {/* Tab 1: Alphabet Letters with Positional Forms, Harakat, Tanween, and Madd */}
                              {arabicTab === 'letters' && (
                                <div className="flex flex-col gap-1.5 p-0.5">
                                  {/* Letter Selector Grid (14x2 compact) */}
                                  <div className="grid grid-cols-14 gap-0.5 bg-black/30 p-1 rounded-lg border border-white/5">
                                    {ARABIC_ALPHABET_FORMS.map((item) => (
                                      <button
                                        key={item.letter}
                                        onClick={() => {
                                          setSelectedLetter(item);
                                          speakArabic(item.letter);
                                        }}
                                        className={`h-6 rounded text-xs font-black transition-all arabic-font flex items-center justify-center ${
                                          selectedLetter.letter === item.letter 
                                            ? 'bg-yellow-400 text-slate-950 font-bold scale-110 shadow' 
                                            : 'bg-white/5 text-white hover:bg-white/15'
                                        }`}
                                      >
                                        {item.letter}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Selected Letter Forms & Details */}
                                  <div className="p-1.5 rounded-xl bg-slate-950/80 border border-yellow-500/20 flex flex-col gap-1">
                                    <div className="flex items-center justify-between text-[10px] text-yellow-400 font-black">
                                      <div className="flex items-center gap-1.5">
                                        <span>حرف {selectedLetter.name} ({selectedLetter.letter})</span>
                                        <button
                                          onClick={() => speakArabic(selectedLetter.letter + ' ' + selectedLetter.examples.join(' '))}
                                          className="p-0.5 hover:bg-white/10 rounded text-yellow-400"
                                          title="استماع"
                                        >
                                          <Volume2 size={11} />
                                        </button>
                                      </div>
                                      <button
                                        onClick={() => handleInsertArabicLetterCard(selectedLetter)}
                                        className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 px-3 py-0.5 rounded-md font-black text-[10px] shadow transition"
                                      >
                                        إدراج
                                      </button>
                                    </div>

                                    {/* 4 Positions */}
                                    <div className="grid grid-cols-4 gap-1 text-center">
                                      <div 
                                        onClick={() => handleInsertLetterFormText(selectedLetter.isolated)}
                                        className="py-0.5 px-1 bg-white/5 hover:bg-yellow-400/20 rounded cursor-pointer transition border border-white/5 group"
                                      >
                                        <div className="text-[7px] text-slate-400 font-bold">منفرد</div>
                                        <div className="text-sm font-black text-white group-hover:text-yellow-300 arabic-font">{selectedLetter.isolated}</div>
                                      </div>
                                      <div 
                                        onClick={() => handleInsertLetterFormText(selectedLetter.initial)}
                                        className="py-0.5 px-1 bg-white/5 hover:bg-yellow-400/20 rounded cursor-pointer transition border border-white/5 group"
                                      >
                                        <div className="text-[7px] text-slate-400 font-bold">أول الكلمة</div>
                                        <div className="text-sm font-black text-white group-hover:text-yellow-300 arabic-font">{selectedLetter.initial}</div>
                                      </div>
                                      <div 
                                        onClick={() => handleInsertLetterFormText(selectedLetter.medial)}
                                        className="py-0.5 px-1 bg-white/5 hover:bg-yellow-400/20 rounded cursor-pointer transition border border-white/5 group"
                                      >
                                        <div className="text-[7px] text-slate-400 font-bold">وسط الكلمة</div>
                                        <div className="text-sm font-black text-white group-hover:text-yellow-300 arabic-font">{selectedLetter.medial}</div>
                                      </div>
                                      <div 
                                        onClick={() => handleInsertLetterFormText(selectedLetter.final)}
                                        className="py-0.5 px-1 bg-white/5 hover:bg-yellow-400/20 rounded cursor-pointer transition border border-white/5 group"
                                      >
                                        <div className="text-[7px] text-slate-400 font-bold">آخر الكلمة</div>
                                        <div className="text-sm font-black text-white group-hover:text-yellow-300 arabic-font">{selectedLetter.final}</div>
                                      </div>
                                    </div>

                                    {/* Harakat (Short Vowels) */}
                                    <div className="flex items-center gap-1 border-t border-white/5 pt-1">
                                      <span className="text-[8px] text-yellow-400/80 font-bold whitespace-nowrap">الحركات:</span>
                                      <div className="grid grid-cols-5 gap-1 flex-1">
                                        {selectedLetter.harakat.map((h, idx) => (
                                          <button
                                            key={idx}
                                            onClick={() => {
                                              speakArabic(h);
                                              handleInsertLetterFormText(h);
                                            }}
                                            className="py-0.5 bg-white/5 hover:bg-yellow-400/20 border border-white/5 rounded text-center transition"
                                            title="نطق وإدراج"
                                          >
                                            <span className="text-xs font-black text-white arabic-font">{h}</span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Tanween (التنوين بأشكاله) */}
                                    {selectedLetter.tanween && (
                                      <div className="flex items-center gap-1 border-t border-white/5 pt-1">
                                        <span className="text-[8px] text-sky-400/80 font-bold whitespace-nowrap">التنوين:</span>
                                        <div className="grid grid-cols-3 gap-1 flex-1">
                                          {selectedLetter.tanween.map((t, idx) => (
                                            <button
                                              key={idx}
                                              onClick={() => {
                                                speakArabic(t);
                                                handleInsertLetterFormText(t);
                                              }}
                                              className="py-0.5 bg-white/5 hover:bg-sky-500/20 border border-white/5 rounded text-center transition flex items-center justify-center gap-1"
                                              title="نطق وإدراج"
                                            >
                                              <span className="text-xs font-black text-sky-300 arabic-font">{t}</span>
                                              <span className="text-[7px] text-white/50">{idx === 0 ? 'فتح' : idx === 1 ? 'ضم' : 'كسر'}</span>
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Madd (المدود بأشكالها) */}
                                    {selectedLetter.madd && (
                                      <div className="flex items-center gap-1 border-t border-white/5 pt-1">
                                        <span className="text-[8px] text-amber-400/80 font-bold whitespace-nowrap">المدود:</span>
                                        <div className="grid grid-cols-3 gap-1 flex-1">
                                          {selectedLetter.madd.map((m, idx) => (
                                            <button
                                              key={idx}
                                              onClick={() => {
                                                speakArabic(m);
                                                handleInsertLetterFormText(m);
                                              }}
                                              className="py-0.5 bg-white/5 hover:bg-amber-500/20 border border-white/5 rounded text-center transition flex items-center justify-center gap-1"
                                              title="نطق وإدراج"
                                            >
                                              <span className="text-xs font-black text-amber-300 arabic-font">{m}</span>
                                              <span className="text-[7px] text-white/50">{idx === 0 ? 'بالألف' : idx === 1 ? 'بالواو' : 'بالياء'}</span>
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Tab 2: Word Slicer / تحليل الكلمات */}
                              {arabicTab === 'slicer' && (
                                <div className="flex flex-col gap-1.5 p-0.5">
                                  {/* Custom Word Input */}
                                  <div className="flex gap-1">
                                    <input
                                      type="text"
                                      placeholder="اكتب كلمة لتحليلها..."
                                      value={customSlicerWord}
                                      onChange={(e) => setCustomSlicerWord(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && customSlicerWord.trim()) {
                                          const res = analyzeArabicWord(customSlicerWord);
                                          setSlicerResult(res);
                                          speakArabic(res.word);
                                        }
                                      }}
                                      className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-[10px] outline-none placeholder:text-white/30 arabic-font text-right"
                                      dir="rtl"
                                    />
                                    <button
                                      onClick={() => {
                                        if (customSlicerWord.trim()) {
                                          const res = analyzeArabicWord(customSlicerWord);
                                          setSlicerResult(res);
                                          speakArabic(res.word);
                                        }
                                      }}
                                      disabled={!customSlicerWord.trim()}
                                      className="px-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 disabled:opacity-40 rounded-lg text-[9px] font-black shadow transition"
                                    >
                                      تحليل
                                    </button>
                                  </div>

                                  {/* Presets */}
                                  <div className="grid grid-cols-3 gap-1">
                                    {WORD_SLICER_PRESETS.map((preset) => (
                                      <button
                                        key={preset.word}
                                        onClick={() => {
                                          setSlicerResult(preset);
                                          setCustomSlicerWord(preset.word);
                                          speakArabic(preset.word);
                                        }}
                                        className={`p-1 rounded-lg text-[9px] font-bold border transition arabic-font text-center ${
                                          slicerResult.word === preset.word 
                                            ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300' 
                                            : 'bg-white/5 border-white/5 text-white/80 hover:bg-white/10'
                                        }`}
                                      >
                                        {preset.word}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Sliced Output */}
                                  <div className="p-1.5 rounded-xl bg-slate-950/80 border border-yellow-500/20 flex flex-col gap-1 mt-0.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-black text-yellow-300 arabic-font">{slicerResult.word}</span>
                                      <div className="flex items-center gap-1.5">
                                        <button onClick={() => speakArabic(slicerResult.word)} className="p-0.5 text-yellow-400 hover:bg-white/10 rounded">
                                          <Volume2 size={11} />
                                        </button>
                                        <button
                                          onClick={() => handleInsertWordSlicerCard(slicerResult)}
                                          className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 px-3 py-0.5 rounded-md font-black text-[10px] shadow transition"
                                        >
                                          إدراج
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-1 my-0.5">
                                      {slicerResult.syllables.map((syl, i) => (
                                        <span 
                                          key={i} 
                                          onClick={() => speakArabic(syl)}
                                          className="px-2 py-0.5 bg-yellow-950/80 border border-yellow-500/40 rounded-lg text-yellow-300 font-black text-xs cursor-pointer hover:scale-105 transition"
                                        >
                                          {syl}
                                        </span>
                                      ))}
                                    </div>
                                    <div className="flex justify-between text-[8px] text-slate-400 bg-white/5 p-1 rounded-lg">
                                      <span>الجذر: <strong className="text-emerald-400">{slicerResult.root}</strong></span>
                                      <span>الوزن: <strong className="text-amber-400">{slicerResult.wazn}</strong></span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 3. Student Interaction Submenu */}
                          {tool.id === 'student-interaction' && (
                            <div className="flex flex-col gap-2.5 min-w-[280px] max-w-[300px] text-right" dir="rtl">
                              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-black">
                                  <Flame size={14} />
                                  <span>تفاعل الطلاب والتحفيز</span>
                                </div>
                                <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                                  {Object.keys(sessionData?.students || {}).length || 4} طلاب
                                </span>
                              </div>

                              {/* Instant Praise & Reaction Triggers */}
                              <div className="flex flex-col gap-1">
                                <span className="text-[8px] text-white/50 font-bold">إرسال تفاعل حماسي فوري للجميع:</span>
                                <div className="grid grid-cols-6 gap-1">
                                  {[
                                    { emoji: '👏', label: 'تصفيق' },
                                    { emoji: '⭐', label: 'نجمة' },
                                    { emoji: '🔥', label: 'حماس' },
                                    { emoji: '✅', label: 'ممتاز' },
                                    { emoji: '❤️', label: 'حب' },
                                    { emoji: '🎉', label: 'احتفال' }
                                  ].map(r => (
                                    <button
                                      key={r.emoji}
                                      onClick={() => handleTriggerLiveReaction(r.emoji)}
                                      className="p-1.5 bg-white/5 hover:bg-amber-500/20 border border-white/10 rounded-xl text-lg flex items-center justify-center transition hover:scale-125"
                                      title={r.label}
                                    >
                                      {r.emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Random Student Selection Wheel */}
                              <div className="p-2 rounded-xl bg-slate-950/80 border border-amber-500/30 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black text-amber-300">اختيار طالب عشوائي للمشاركة:</span>
                                  <button
                                    onClick={handlePickRandomStudent}
                                    disabled={isPickingStudent}
                                    className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-[8px] px-2 py-1 rounded-lg flex items-center gap-1 transition shadow"
                                  >
                                    <Dices size={11} />
                                    <span>قرعة</span>
                                  </button>
                                </div>
                                {pickedStudent && (
                                  <div className="p-2 bg-amber-500/10 border border-amber-500/40 rounded-xl text-center">
                                    <div className="text-[8px] text-slate-400 font-bold">الطالب المختار:</div>
                                    <div className="text-xs font-black text-amber-300 arabic-font">{pickedStudent} 🌟</div>
                                  </div>
                                )}
                              </div>

                              {/* Student List & Scores */}
                              <div className="flex flex-col gap-1">
                                <span className="text-[8px] text-white/50 font-bold">تحفيز ومنح النقاط:</span>
                                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto custom-scrollbar">
                                  {Object.entries(sessionData?.students || {
                                    s1: { name: 'أحمد بن محمد', score: 15, handRaised: true },
                                    s2: { name: 'سارة العلي', score: 20, handRaised: false },
                                    s3: { name: 'عمر الخالد', score: 10, handRaised: true },
                                    s4: { name: 'مريم القحطاني', score: 25, handRaised: false }
                                  }).map(([sid, s]: [string, any]) => (
                                    <div key={sid} className="p-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold text-white arabic-font">{s.name}</span>
                                        {s.handRaised && (
                                          <span className="text-xs animate-bounce" title="رافع يده">✋</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-[8px] font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                                          {s.score || 0} ⭐
                                        </span>
                                        <button
                                          onClick={() => handleAwardStudent(sid, s.name, 1)}
                                          className="p-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded text-[8px] font-bold"
                                          title="+1 نقطة"
                                        >
                                          +1
                                        </button>
                                        <button
                                          onClick={() => handleAwardStudent(sid, s.name, 5)}
                                          className="p-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 rounded text-[8px] font-bold"
                                          title="+5 نقاط"
                                        >
                                          +5
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Highlight & Drawing Submenu */}
                          {tool.id === 'highlight' && (
                            <div className="flex flex-col gap-3 items-center">
                              <div className="flex flex-col items-center gap-2 w-full">
                                <button onClick={() => setDrawMode('pen')} className={`p-1.5 rounded-full transition-all ${drawMode === 'pen' ? 'bg-yellow-400 text-slate-900 scale-110' : 'text-white/60 hover:bg-white/5'}`}><Pencil size={18} /></button>
                                <div className="flex gap-2">
                                  <button onClick={() => setDrawMode('eraser')} className={`p-1.5 rounded-full transition-all ${drawMode === 'eraser' ? 'bg-yellow-400 text-slate-900 scale-110' : 'text-white/60 hover:bg-white/5'}`}><Eraser size={18} /></button>
                                  <button onClick={() => setDrawMode('highlight')} className={`p-1.5 rounded-full transition-all ${drawMode === 'highlight' ? 'bg-yellow-400 text-slate-900 scale-110' : 'text-white/60 hover:bg-white/5'}`}><Highlighter size={18} /></button>
                                </div>
                              </div>
                              <div className="w-full h-px bg-white/10" />
                              <div className="grid grid-cols-4 gap-2">
                                {['#ef4444', '#cbd5e1', '#facc15', '#f97316', '#2dd4bf', '#4ade80', '#a855f7', '#67e8f9', '#ffffff', '#f472b6'].map((c) => (
                                  <button key={c} onClick={() => setHighlightColor(c + (drawMode === 'highlight' ? '66' : ''))} className="relative w-6 h-6 flex items-center justify-center group">
                                    <div className="w-4 h-4 rounded-full transition-transform group-hover:scale-110" style={{ backgroundColor: c }} />
                                    {highlightColor.startsWith(c) && <div className="absolute inset-0 border border-white rounded-full flex items-center justify-center" />}
                                  </button>
                                ))}
                              </div>
                              <div className="w-full h-px bg-white/10" />
                              <div className="flex flex-col gap-1.5 w-full px-1">
                                <div className="flex justify-between text-[7px] font-black text-white/40 uppercase tracking-widest"><span>الحجم</span><span>{highlightWidth}px</span></div>
                                <input type="range" min="2" max="100" step="1" value={highlightWidth} onChange={(e) => setHighlightWidth(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400" />
                              </div>
                            </div>
                          )}

                          {/* Wheel Tool Submenu */}
                          {tool.id === 'wheel' && (
                            <div className="flex flex-col gap-2 min-w-[270px] text-right" dir="rtl">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">
                                العجلة الدوارة
                              </h3>
                              <SpinningWheel
                                onInsertToBoard={(items) => handleInsertWheel(items)}
                                isCompact={false}
                              />
                            </div>
                          )}

                          {/* Shapes Tool Submenu */}
                          {tool.id === 'shapes' && (
                            <div className="flex flex-col gap-2.5 min-w-[260px] text-right" dir="rtl">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">
                                أشكال هندسية
                              </h3>

                              <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/30 rounded-xl border border-white/5 max-h-56 overflow-y-auto custom-scrollbar">
                                {GEOMETRIC_SHAPES.map((shape) => {
                                  return (
                                    <button
                                      key={shape.id}
                                      onClick={() => handleInsertShape(shape.id)}
                                      className="flex flex-col items-center justify-center p-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-amber-400/50 transition-all group"
                                      title={shape.name}
                                    >
                                      <div className="w-9 h-9 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                                        {shape.renderSVG(shapesMode === 'filled', selectedShapeColor || shape.defaultColor, 34)}
                                      </div>
                                      <span className="text-[8px] font-bold text-white/70 group-hover:text-white mt-0.5 truncate max-w-full">
                                        {shape.name}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="flex items-center justify-between px-1">
                                <span className="text-[8px] text-white/40 font-bold">اللون:</span>
                                <div className="flex gap-1">
                                  {['#10b981', '#ec4899', '#3b82f6', '#06b6d4', '#f59e0b', '#ef4444', '#a855f7', '#ffffff'].map((c) => (
                                    <button
                                      key={c}
                                      onClick={() => setSelectedShapeColor(c)}
                                      className="relative w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition"
                                      style={{ backgroundColor: c }}
                                    >
                                      {selectedShapeColor === c && (
                                        <div className="absolute inset-0 border-2 border-white rounded-full" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                                <button
                                  onClick={() => setShapesMode('outline')}
                                  className={`py-1 rounded-lg text-[10px] font-black transition-all ${
                                    shapesMode === 'outline'
                                      ? 'bg-yellow-400 text-slate-950 shadow-md'
                                      : 'text-white/60 hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  مفرغ
                                </button>
                                <button
                                  onClick={() => setShapesMode('filled')}
                                  className={`py-1 rounded-lg text-[10px] font-black transition-all ${
                                    shapesMode === 'filled'
                                      ? 'bg-yellow-400 text-slate-950 shadow-md'
                                      : 'text-white/60 hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  مصمت
                                </button>
                              </div>
                            </div>
                          )}

                          {/* YouTube Video Tool Submenu */}
                          {tool.id === 'youtube' && (
                            <div className="flex flex-col gap-2.5 min-w-[240px] text-right" dir="rtl">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">
                                فيديو يوتيوب
                              </h3>

                              <div className="flex flex-col gap-1">
                                <label className="text-[8px] text-white/50 font-bold">رابط الفيديو أو المعرّف (URL):</label>
                                <input
                                  type="text"
                                  placeholder="https://youtube.com/watch?v=..."
                                  value={youtubeUrl}
                                  onChange={(e) => setYoutubeUrl(e.target.value)}
                                  className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white text-[9px] outline-none placeholder:text-white/30 font-mono text-left"
                                  dir="ltr"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <span className="text-[8px] text-white/40 font-bold">نماذج شروحات تعليمية:</span>
                                <div className="flex flex-col gap-1">
                                  {[
                                    { title: 'نموذج تعليمي ١ (فيديو تفاعلي)', url: 'https://youtu.be/gh1dK0MmRNs?si=xnonPsP5_xiH78TM' },
                                    { title: 'نموذج تعليمي ٢ (شرح وتطبيق)', url: 'https://youtu.be/NljUM1xXDUw?si=-ESdsNLhvAdyDzLR' },
                                    { title: 'نموذج تعليمي ٣ (درس نموذجي)', url: 'https://youtu.be/YEeB2bbJbYM?si=foFLHPCOkpI0TLLj' }
                                  ].map((item, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleInsertYoutube(item.url, item.title)}
                                      className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-bold text-white transition text-right group"
                                    >
                                      <span className="group-hover:text-red-400 transition-colors arabic-font">{item.title}</span>
                                      <Play size={10} className="text-red-400 shrink-0" />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <button
                                onClick={() => handleInsertYoutube(youtubeUrl)}
                                disabled={!youtubeUrl.trim()}
                                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white py-1.5 rounded-xl font-black text-[9px] shadow-lg transition-all flex items-center justify-center gap-1.5"
                              >
                                <Youtube size={13} />
                                <span>إدراج الفيديو في السبورة</span>
                              </button>
                            </div>
                          )}

                          {/* Screenshot and Video Recording Tool Submenu */}
                          {tool.id === 'recording' && (
                            <div className="flex flex-col gap-2.5 min-w-[220px] text-right" dir="rtl">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">
                                لقطة شاشة وتسجيل فيديو
                              </h3>

                              <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-white">
                                  <Camera size={13} className="text-emerald-400" />
                                  <span>لقطة شاشة للسبورة (PNG)</span>
                                </div>
                                <button
                                  onClick={handleTakeScreenshot}
                                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded-lg font-black text-[9px] shadow transition flex items-center justify-center gap-1.5"
                                >
                                  <Download size={11} />
                                  <span>التقاط وحفظ الصورة الآن</span>
                                </button>
                                {screenshotSuccess && (
                                  <div className="text-[8px] text-emerald-400 font-bold text-center flex items-center justify-center gap-1">
                                    <Check size={10} />
                                    <span>تم تنزيل لقطة السبورة بنجاح!</span>
                                  </div>
                                )}
                              </div>

                              <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-[9px] font-black text-white">
                                    <Video size={13} className="text-rose-400" />
                                    <span>تسجيل فيديو للحصة</span>
                                  </div>
                                  {recordingState.isRecording && (
                                    <span className="flex items-center gap-1 text-[8px] font-mono font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded-md animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                      {Math.floor(recordingState.durationSec / 60).toString().padStart(2, '0')}:{(recordingState.durationSec % 60).toString().padStart(2, '0')}
                                    </span>
                                  )}
                                </div>

                                {recordingState.isRecording && (
                                  <div className="text-[8px] text-white/50 flex items-center justify-between px-0.5 font-bold">
                                    <span>نمط التسجيل:</span>
                                    <span className="text-amber-300">
                                      {recordingState.mode === 'canvas' ? 'لوحة السبورة التفاعلية' : 'الشاشة الكاملة'}
                                    </span>
                                  </div>
                                )}

                                {recordingError && (
                                  <div className="text-[8px] text-red-400 font-bold bg-red-500/10 border border-red-500/20 p-1.5 rounded-lg text-center">
                                    {recordingError}
                                  </div>
                                )}

                                {!recordingState.isRecording ? (
                                  <button
                                    onClick={handleStartRecording}
                                    className="w-full bg-rose-600 hover:bg-rose-500 text-white py-1.5 rounded-lg font-black text-[9px] shadow transition flex items-center justify-center gap-1.5"
                                  >
                                    <Play size={11} />
                                    <span>بدء تسجيل الحصة فيديو</span>
                                  </button>
                                ) : (
                                  <div className="flex gap-1">
                                    {recordingState.isPaused ? (
                                      <button
                                        onClick={handleResumeRecording}
                                        className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-1.5 rounded-lg font-black text-[8px] transition flex items-center justify-center gap-1"
                                      >
                                        <Play size={10} />
                                        <span>استئناف</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={handlePauseRecording}
                                        className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-1.5 rounded-lg font-black text-[8px] transition flex items-center justify-center gap-1"
                                      >
                                        <Pause size={10} />
                                        <span>إيقاف مؤقت</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={handleStopRecording}
                                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/40 py-1.5 rounded-lg font-black text-[8px] transition flex items-center justify-center gap-1"
                                    >
                                      <Square size={10} />
                                      <span>حفظ وتنزيل</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Text Settings Submenu */}
                          {tool.id === 'text' && (
                            <div className="flex flex-col gap-3 items-center">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">إعدادات النص</h3>
                              <div className="flex flex-col gap-1.5 w-full px-1">
                                <div className="flex justify-between text-[7px] font-black text-white/40 uppercase tracking-widest"><span>الحجم</span><span>{textSize}px</span></div>
                                <input type="range" min="12" max="48" step="1" value={textSize} onChange={(e) => setTextSize(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400" />
                              </div>
                              <div className="w-full h-px bg-white/10" />
                              <div className="grid grid-cols-4 gap-2">
                                {['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6', '#000000'].map((c) => (
                                  <button key={c} onClick={() => setTextColor(c)} className="relative w-6 h-6 flex items-center justify-center group">
                                    <div className="w-4 h-4 rounded-full transition-transform group-hover:scale-110" style={{ backgroundColor: c }} />
                                    {textColor === c && <div className="absolute inset-0 border border-white rounded-full flex items-center justify-center" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sticky Note Color Submenu */}
                          {tool.id === 'sticky' && (
                            <div className="flex flex-col gap-3 items-center">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">لون الملاحظة</h3>
                              <div className="grid grid-cols-3 gap-2">
                                {['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#ddd6fe', '#fed7aa'].map((c) => (
                                  <button key={c} onClick={() => setStickyColor(c)} className="relative w-6 h-6 flex items-center justify-center group">
                                    <div className="w-4 h-4 rounded-full transition-transform group-hover:scale-110" style={{ backgroundColor: c }} />
                                    {stickyColor === c && <div className="absolute inset-0 border border-white rounded-full flex items-center justify-center" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Student Works Submenu */}
                          {tool.id === 'student-work' && (
                            <div className="flex flex-col gap-3 min-w-[200px] max-h-[300px] overflow-y-auto custom-scrollbar">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">أعمال الطلاب</h3>
                              <div className="space-y-1.5">
                                {sessionData?.exercise?.answers && Object.entries(sessionData.exercise.answers).map(([uid, ans]: [string, any]) => (
                                  <div key={uid} className="p-2 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-[9px] font-bold text-white/60">{ans.name}</span>
                                      <span className={`text-[7px] px-1.5 py-0.5 rounded-full ${ans.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{ans.isCorrect ? 'صحيح' : 'خطأ'}</span>
                                    </div>
                                    <p className="text-[10px] text-white arabic-font">{ans.answer}</p>
                                  </div>
                                ))}
                                {!sessionData?.exercise?.answers && <p className="text-[9px] text-white/20 text-center py-4">لا توجد إجابات بعد</p>}
                              </div>
                            </div>
                          )}

                          {/* Timer Submenu */}
                          {tool.id === 'timer' && (
                            <div className="flex flex-col gap-3 items-center">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest">المؤقت</h3>
                              <div className="text-xl font-black text-white font-mono">{Math.floor(timerDuration / 60)}:{(timerDuration % 60).toString().padStart(2, '0')}</div>
                              <input type="range" min="10" max="600" step="10" value={timerDuration} onChange={(e) => setTimerDuration(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400" />
                              <button onClick={startTimer} className="w-full bg-yellow-400 text-slate-900 py-1.5 rounded-lg font-black text-[9px] shadow-lg hover:bg-yellow-300 transition-all flex items-center justify-center gap-2"><Play size={12} /> تشغيل</button>
                            </div>
                          )}

                          {/* Poll Submenu */}
                          {tool.id === 'poll' && (
                            <div className="flex flex-col gap-2.5 min-w-[160px]">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">تصويت</h3>
                              <input type="text" placeholder="السؤال..." value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white text-[9px] outline-none arabic-font" />
                              <div className="grid grid-cols-2 gap-1.5">
                                {pollOptions.map((opt, idx) => (
                                  <input key={idx} type="text" value={opt} onChange={(e) => { const newOpts = [...pollOptions]; newOpts[idx] = e.target.value; setPollOptions(newOpts); }} className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-[8px] outline-none text-center arabic-font" />
                                ))}
                              </div>
                              <button onClick={startPoll} className="w-full bg-yellow-400 text-slate-900 py-1.5 rounded-lg font-black text-[9px] shadow-lg hover:bg-yellow-300 transition-all flex items-center justify-center gap-2"><Send size={12} /> ارسل</button>
                            </div>
                          )}

                          {/* File Upload Submenu */}
                          {tool.id === 'file' && (
                            <div className="flex flex-col gap-2.5 min-w-[180px]">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">رفع ملف / مشاركة</h3>
                              <input type="file" accept=".pdf,image/*" id="tool-file-upload" className="hidden" onChange={handleFileUpload} />
                              <label htmlFor="tool-file-upload" className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-all text-white/40 text-[9px] font-bold p-2 text-center">
                                {isUploading ? <Loader2 className="animate-spin" size={14} /> : fileData ? (fileData.startsWith('data:application/pdf') ? <span className="text-amber-400 font-bold">ملف PDF تم اختياره</span> : <img src={fileData} className="w-full h-full object-cover rounded-lg" />) : (
                                  <div className="flex flex-col items-center gap-1">
                                    <FileUp size={18} />
                                    <span>انقر لرفع صورة أو PDF</span>
                                  </div>
                                )}
                              </label>
                              <button onClick={shareFile} disabled={!fileData} className="w-full bg-yellow-400 text-slate-900 py-1.5 rounded-lg font-black text-[9px] shadow-lg hover:bg-yellow-300 transition-all disabled:opacity-50">عرض للطلاب</button>
                            </div>
                          )}

                          {/* Emoji Submenu */}
                          {tool.id === 'emoji' && (
                            <div className="flex flex-col gap-2.5 min-w-[200px] max-h-[200px] overflow-y-auto custom-scrollbar">
                              <div className="grid grid-cols-6 gap-2">
                                {['😀', '😂', '😍', '🥳', '😎', '🤔', '👍', '👏', '🔥', '✨', '⭐', '🎈', '🎨', '📚', '💡', '✅', '❌', '❓'].map(emoji => (
                                  <button key={emoji} onClick={() => { addSticker(emoji); setShowSubMenu(null); }} className="text-xl hover:scale-125 transition-transform">{emoji}</button>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Lock Toggle Button (تفاعل الطلاب متاح / السبورة مقفلة) */}
              <div className="mx-0.5 h-6 w-px bg-white/10" />
              <button
                onClick={handleToggleLock}
                className={`p-2 rounded-xl transition-all active:scale-95 flex items-center justify-center ${
                  isLocked
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow'
                    : 'text-emerald-400 hover:bg-white/10'
                }`}
                title={isLocked ? 'السبورة مقفلة (انقر للسماح بالتفاعل)' : 'تفاعل الطلاب متاح (انقر للقفل)'}
              >
                {isLocked ? <Lock size={18} className="text-rose-400" /> : <Unlock size={18} className="text-emerald-400" />}
              </button>

              {/* Action Buttons: Undo / Redo / Reset */}
              <div className="mx-0.5 h-6 w-px bg-white/10" />

              {/* Undo Button */}
              <button
                onClick={handleUndoAction}
                className="p-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                title="تراجع (Undo)"
              >
                <Undo2 size={18} />
              </button>

              {/* Redo Button */}
              <button
                onClick={handleRedoAction}
                className="p-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                title="إعادة (Redo)"
              >
                <Redo2 size={18} />
              </button>

              <div className="mx-0.5 h-6 w-px bg-white/10" />

              {/* Reset All Button */}
              <div className="relative">
                <AnimatePresence>
                  {showResetConfirm && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-xl whitespace-nowrap z-[10002] flex items-center gap-3">
                      <span>هل أنت متأكد من مسح الكل؟</span>
                      <div className="flex gap-2">
                        <button onClick={handleResetAll} className="bg-white text-red-500 px-2 py-1 rounded-lg hover:bg-white/90 transition-colors">نعم</button>
                        <button onClick={() => setShowResetConfirm(false)} className="bg-black/20 text-white px-2 py-1 rounded-lg hover:bg-black/30 transition-colors">لا</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button onClick={() => setShowResetConfirm(!showResetConfirm)} className={`p-2 rounded-xl transition-all ${showResetConfirm ? 'bg-red-500 text-white' : 'text-red-400 hover:bg-red-500/10 hover:text-red-300'}`} title="إعادة ضبط ومسح الكل"><RotateCcw size={18} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Minimize/Maximize Button */}
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="backdrop-blur-xl border border-white/10 p-2 rounded-full text-white/60 hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95"
          style={{ background: sidebarGradient }}
          title={isMinimized ? 'إظهار شريط أدوات المعلم' : 'تصغير الشريط'}
        >
          <div className="flex items-center gap-2">
            {isMinimized ? <ChevronRight size={18} className="-rotate-90" /> : <ChevronLeft size={18} className="-rotate-90" />}
          </div>
        </button>

        {/* Floating Text and Sticky Inputs */}
        <AnimatePresence>
          {textInput && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              className="fixed z-[10001] bg-slate-900/95 backdrop-blur-2xl border border-white/20 p-4 rounded-2xl shadow-2xl flex gap-2" 
              style={{ 
                left: textInput.clientX !== undefined ? `${Math.min(Math.max(textInput.clientX, 140), window.innerWidth - 180)}px` : `${textInput.x}%`, 
                top: textInput.clientY !== undefined ? `${Math.min(Math.max(textInput.clientY, 80), window.innerHeight - 80)}px` : `${textInput.y}%`, 
                transform: 'translate(-50%, -50%)' 
              }}
            >
              <input autoFocus type="text" value={tempText} onChange={(e) => setTempText(e.target.value)} placeholder="اكتب هنا..." style={{ color: textColor }} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 arabic-font" onKeyDown={async (e) => { if (e.key === 'Enter' && tempText) { await addTextAnnotation(tempText, textInput.x, textInput.y); setTextInput(null); } if (e.key === 'Escape') setTextInput(null); }} />
              <button onClick={() => setTextInput(null)} className="p-2 text-white/40 hover:text-white transition-colors"><X size={16} /></button>
            </motion.div>
          )}
          {stickyInput && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="fixed z-[10001] p-4 rounded-xl shadow-2xl flex flex-col gap-2 min-w-[200px]" 
              style={{ 
                left: stickyInput.clientX !== undefined ? `${Math.min(Math.max(stickyInput.clientX, 140), window.innerWidth - 180)}px` : `${stickyInput.x}%`, 
                top: stickyInput.clientY !== undefined ? `${Math.min(Math.max(stickyInput.clientY, 80), window.innerHeight - 80)}px` : `${stickyInput.y}%`, 
                backgroundColor: stickyColor, 
                color: '#1e293b', 
                transform: 'translate(-50%, -50%)' 
              }}
            >
              <textarea autoFocus value={tempText} onChange={(e) => setTempText(e.target.value)} placeholder="اكتب ملاحظة..." className="bg-black/5 border-none rounded-lg p-2 outline-none resize-none h-24 arabic-font text-sm placeholder:text-black/20" onKeyDown={async (e) => { if (e.key === 'Enter' && !e.shiftKey && tempText) { await addStickyNote(tempText, stickyInput.x, stickyInput.y); setStickyInput(null); } if (e.key === 'Escape') setStickyInput(null); }} />
              <div className="flex justify-between items-center"><span className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Sticky Note</span><button onClick={() => setStickyInput(null)} className="p-1 hover:bg-black/5 rounded-full transition-colors"><X size={14} /></button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
