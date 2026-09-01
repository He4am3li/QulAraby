import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MousePointer2, Pencil, Eraser, Highlighter, Type, StickyNote,
  Timer, Wand2, BarChart3, FileUp, Users, Smile,
  RotateCcw, RotateCw, Trash2, Scissors, GitFork, BookOpen,
  Mic, History, Flame, Minus, MoveUpRight,
  Square, Circle, Layers, ChevronDown,
  ChevronLeft, ChevronRight, Plus, Lock, Unlock, Check,
  ChevronUp, Play, Pause, Send, Loader2,
  Palette, Sliders, HelpCircle, Dices, FileText, Sparkles, X, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WhiteboardTool, WhiteboardBackgroundType, WhiteboardTheme, WhiteboardSessionState, WhiteboardElement } from '../../types/whiteboard';
import { downloadPlacementTestPDF } from '../../services/placementTestPdf';
import { generateQuickExercise } from '../../services/gemini';
import { useAuth } from '../AuthProvider';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export interface WhiteboardToolbarProps {
  activeTool: WhiteboardTool;
  onSelectTool: (tool: WhiteboardTool) => void;
  activeColor: string;
  onChangeColor: (color: string) => void;
  activeStrokeWidth: number;
  onChangeStrokeWidth: (width: number) => void;
  activeTheme: WhiteboardTheme;
  onChangeTheme: (theme: WhiteboardTheme) => void;
  activeBackground: WhiteboardBackgroundType;
  onChangeBackground: (bg: WhiteboardBackgroundType) => void;
  onOpenArabicTools: () => void;
  onOpenWordSlicer: () => void;
  onOpenGrammarTree: () => void;
  onOpenMediaStickers: () => void;
  onOpenAudioRecorder: () => void;
  onOpenHistory: () => void;
  onOpenWheel: () => void;
  onOpenStudentWorks?: () => void;
  onClearPage: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  currentPageIndex?: number;
  totalPages?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onAddNewPage?: () => void;
  isLocked?: boolean;
  onToggleLock?: () => void;
  teacherName?: string;
  session?: WhiteboardSessionState;
  onInsertElement?: (element: Partial<WhiteboardElement>) => void;
}

const THEME_INFO: Record<WhiteboardTheme, { label: string; icon: string; defaultColor: string }> = {
  blackboard: { label: 'لوح طباشيري', icon: '🪵', defaultColor: '#ffffff' },
  whiteboard: { label: 'سبورة بيضاء', icon: '🖊️', defaultColor: '#0f172a' },
  notebook: { label: 'دفتر كشكول', icon: '📖', defaultColor: '#1e40af' },
  calligraphy_9lines: { label: 'كراسة 9 أسطر', icon: '✒️', defaultColor: '#334155' }
};

const BACKGROUND_OPTIONS: { id: WhiteboardBackgroundType; label: string; icon: string }[] = [
  { id: 'blank', label: 'لوح نقي / فارغ', icon: '⚪' },
  { id: 'lined', label: 'تسطير دفتر مدرسي', icon: '📝' },
  { id: 'grid', label: 'شبكة مربعات هندسية', icon: '📐' },
  { id: 'calligraphy_naskh', label: 'تسطير خط النسخ (4 أسطر)', icon: '✒️' },
  { id: 'calligraphy_ruqah', label: 'تسطير خط الرقعة', icon: '✍️' },
  { id: 'calligraphy_9lines', label: 'كراسة الخط العربي (9 أسطر)', icon: '📜' }
];

export const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  activeTool,
  onSelectTool,
  activeColor,
  onChangeColor,
  activeStrokeWidth,
  onChangeStrokeWidth,
  activeTheme,
  onChangeTheme,
  activeBackground,
  onChangeBackground,
  onOpenArabicTools,
  onOpenWordSlicer,
  onOpenGrammarTree,
  onOpenMediaStickers,
  onOpenAudioRecorder,
  onOpenHistory,
  onOpenWheel,
  onOpenStudentWorks,
  onClearPage,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  currentPageIndex = 0,
  totalPages = 1,
  onPrevPage,
  onNextPage,
  onAddNewPage,
  isLocked = false,
  onToggleLock,
  teacherName = 'المعلم',
  session,
  onInsertElement
}) => {
  const { user } = useAuth();

  // Popover submenu tracking
  const [showSubMenu, setShowSubMenu] = useState<string | null>(null);
  const [showCanvasMenu, setShowCanvasMenu] = useState(false);
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [showMoreToolsMenu, setShowMoreToolsMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Drawing & Highlighting Submenu States
  const [drawMode, setDrawMode] = useState<'pen' | 'highlight' | 'highlighter' | 'laser' | 'eraser'>('pen');

  // Text Submenu States
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(24);
  const [tempText, setTempText] = useState('');

  // Sticky Note Submenu States
  const [stickyColor, setStickyColor] = useState('#fef08a');
  const [tempNoteText, setTempNoteText] = useState('');

  // Timer States
  const [timerDuration, setTimerDuration] = useState(60);
  const [timerRemaining, setTimerRemaining] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  // Poll States
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['نعم', 'لا']);
  const [pollSent, setPollSent] = useState(false);

  // AI Wand States
  const [wandContext, setWandContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExercise, setGeneratedExercise] = useState<any>(null);

  // File Upload States
  const [fileData, setFileData] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Alarm sound generator for timer
  const playAlarmSound = useCallback(() => {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        const audioCtx = new AudioCtxClass();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      }
    } catch {}
  }, []);

  // Timer Interval
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimerRemaining(prev => {
        if (prev <= 1) {
          playAlarmSound();
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, playAlarmSound]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowSubMenu(null);
        setShowCanvasMenu(false);
        setShowShapesMenu(false);
        setShowMoreToolsMenu(false);
        setShowClearConfirm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSubMenu = (menuId: string) => {
    setShowCanvasMenu(false);
    setShowShapesMenu(false);
    setShowMoreToolsMenu(false);
    setShowClearConfirm(false);
    setShowSubMenu(prev => prev === menuId ? null : menuId);
  };

  const closeAllMenus = () => {
    setShowSubMenu(null);
    setShowCanvasMenu(false);
    setShowShapesMenu(false);
    setShowMoreToolsMenu(false);
    setShowClearConfirm(false);
  };

  // Timer Handlers
  const handleToggleTimer = () => {
    if (timerActive) {
      setTimerActive(false);
    } else {
      if (timerRemaining === 0) {
        setTimerRemaining(timerDuration);
      }
      setTimerActive(true);
    }
  };

  const handleResetTimer = (sec: number) => {
    setTimerActive(false);
    setTimerDuration(sec);
    setTimerRemaining(sec);
  };

  // Quick Random Question Presets
  const handleQuickRandomQuestion = (category: 'grammar' | 'vocab' | 'spelling') => {
    const grammarPool = [
      { q: "ما إعراب كلمة (العلمُ) في جملة: 'العلمُ نورٌ يضيءُ الدروب'؟", a: "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره.", cat: "إعراب ونحو" },
      { q: "استخرج الفاعل والمفعول به: 'شرحَ المعلمُ الدرسَ بوضوح'.", a: "الفاعل: المعلمُ (مرفوع بالضمة) | المفعول به: الدرسَ (منصوب بالفتحة).", cat: "قواعد النحو" },
      { q: "حوّل الجملة الاسمية إلى فعلية: 'الطلابُ يجتهدون في دراستهم'.", a: "يجتهدُ الطلابُ في دراستهم.", cat: "تحويل التراكيب" },
      { q: "ما نوع الخبر في جملة: 'الحديقةُ أزهارُها متفتحةٌ'؟", a: "نوع الخبر: جملة اسمية (أزهارها متفتحة).", cat: "أنواع الخبر" }
    ];
    const vocabPool = [
      { q: "ما مرادف كلمة (الإقدام) وما مضادها في سياق الشجاعة؟", a: "المرادف: الجرأة والشجاعة والبسالة | المضاد: الجبن والتردد والتخاذل.", cat: "معاني ومفردات" },
      { q: "ما هو جذر ووزن كلمة (استغفار)؟", a: "الجذر الثلاثي: (غ-ف-ر) | الوزن الصرفي: (اسْتِفْعَال).", cat: "الصرف والميزان" },
      { q: "هات جمع كلمة (أثر) ومثنى كلمة (طريق) في جملتين مفيدتين.", a: "جمع أثر: آثار | مثنى طريق: طريقان / طريقين.", cat: "المفرد والمثنى والجمع" }
    ];
    const spellingPool = [
      { q: "علل كتابة الهمزة المتوسطة على نبرة في كلمة (فِئَة).", a: "كُتبت على نبرة لأنها مفتوحة وما قبلها مكسور والكسرة أقوى الحركات.", cat: "الإملاء والهمزات" },
      { q: "لماذا كُتبت الهمزة المتطرفة على السطر في كلمة (سَمَاء) و (شَيْء)؟", a: "لأنها سبقت بساكن (ألف مد ساكنة في سماء، وياء ساكنة في شيء).", cat: "قواعد الإملاء" },
      { q: "بيّن الفرق الإملائي بين (تاء التأنيث المفتوحة) و(الهاء المربوطة) مع مثال.", a: "التاء المفتوحة تنطق تاءً عند الوصل والوقف (كتبتْ). الهاء تنطق هاءً في الحالين (وجهُه).", cat: "التاء والهاء" }
    ];

    const pool = category === 'grammar' ? grammarPool : category === 'vocab' ? vocabPool : spellingPool;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    if (onInsertElement) {
      onInsertElement({
        id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: 'arabic_card',
        color: category === 'grammar' ? '#a855f7' : category === 'vocab' ? '#06b6d4' : '#10b981',
        strokeWidth: 2,
        cardData: {
          word: picked.q,
          meaning: picked.a,
          pos: picked.cat,
          grammarCategory: picked.cat
        }
      });
    }
    setShowSubMenu(null);
  };

  // Exercise Generation via AI
  const handleGenerateExercise = async () => {
    if (!wandContext.trim()) return;
    setIsGenerating(true);
    try {
      const exercise = await generateQuickExercise(wandContext);
      setGeneratedExercise(exercise);
    } catch (e) {
      console.error("AI Exercise error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Insert AI Exercise Card onto Whiteboard
  const handleInsertExerciseToBoard = () => {
    if (!generatedExercise || !onInsertElement) return;
    onInsertElement({
      id: `ai_q_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: 'arabic_card',
      cardData: {
        word: generatedExercise.question,
        meaning: generatedExercise.answer || generatedExercise.solution || generatedExercise.explanation,
        pos: 'سؤال وتدريب ذكي',
        grammarCategory: wandContext || 'تدريب فوري'
      },
      color: '#a855f7',
      strokeWidth: 2
    });
    setShowSubMenu(null);
  };

  // Send Poll to board and live session
  const handleSendPollToBoard = () => {
    if (!pollQuestion.trim()) return;
    const validOptions = pollOptions.filter(o => o.trim());
    if (validOptions.length === 0) {
      validOptions.push('نعم', 'لا');
    }

    if (onInsertElement) {
      onInsertElement({
        id: `poll_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: 'poll_card',
        text: pollQuestion,
        color: '#f59e0b',
        cardData: {
          word: pollQuestion,
          examples: validOptions,
          harakat: validOptions.map(() => '0'),
          pos: 'تصويت تفاعلي'
        }
      });
    }

    if (session && user) {
      try {
        setDoc(doc(db, 'live_sessions', session.id || user.uid), {
          activeActivity: {
            type: 'poll',
            title: pollQuestion,
            question: pollQuestion,
            options: validOptions,
            votes: {},
            createdAt: Date.now()
          }
        }, { merge: true });
      } catch (e) {
        console.warn("Poll broadcast warning:", e);
      }
    }

    setPollSent(true);
    setTimeout(() => {
      setPollSent(false);
      setShowSubMenu(null);
    }, 1200);
  };

  // Insert Direct Text onto Whiteboard
  const handleAddTextDirect = () => {
    if (!tempText.trim()) {
      onSelectTool('text');
      setShowSubMenu(null);
      return;
    }
    if (onInsertElement) {
      onInsertElement({
        id: `txt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: 'text',
        text: tempText,
        fontSize: textSize,
        color: textColor
      });
      setTempText('');
    } else {
      onSelectTool('text');
    }
    setShowSubMenu(null);
  };

  // Insert Direct Sticky Note onto Whiteboard
  const handleAddStickyDirect = () => {
    if (!tempNoteText.trim()) {
      onSelectTool('note');
      setShowSubMenu(null);
      return;
    }
    if (onInsertElement) {
      onInsertElement({
        id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: 'note',
        text: tempNoteText,
        color: stickyColor,
        strokeWidth: 2
      });
      setTempNoteText('');
    } else {
      onSelectTool('note');
    }
    setShowSubMenu(null);
  };

  // Insert Emoji Sticker onto Whiteboard
  const handleInsertSticker = (emoji: string) => {
    if (onInsertElement) {
      onInsertElement({
        id: `emoji_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: 'text',
        text: emoji,
        fontSize: 52,
        color: '#ffffff'
      });
    }
    setShowSubMenu(null);
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("حجم الملف كبير جداً. يرجى اختيار ملف أصغر من 2 ميجابايت.");
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

  const handleShareFileToBoard = () => {
    if (!fileData) return;
    if (onInsertElement) {
      onInsertElement({
        id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: 'image',
        src: fileData,
        width: 360,
        height: 270
      });
    }
    setFileData(null);
    setShowSubMenu(null);
  };

  // The comprehensive list of consolidated tools matching TeacherToolbar exactly + Laser
  const primaryTools = [
    { id: 'select', icon: <MousePointer2 size={18} />, label: 'تحديد', isDirect: true },
    { id: 'highlight', icon: <Highlighter size={18} />, label: 'رسم وتحديد' },
    { id: 'laser', icon: <Zap size={18} className="text-red-400" />, label: 'ليزر تفاعلي', isDirect: true },
    { id: 'text', icon: <Type size={18} />, label: 'نص' },
    { id: 'sticky', icon: <StickyNote size={18} />, label: 'ملاحظة لاصقة' },
    { id: 'timer', icon: <Timer size={18} className={timerActive ? 'animate-spin' : ''} />, label: 'مؤقت' },
    { id: 'wand', icon: <Wand2 size={18} />, label: 'سؤال عشوائي' },
    { id: 'poll', icon: <BarChart3 size={18} />, label: 'تصويت' },
    { id: 'file', icon: <FileUp size={18} />, label: 'ملف' },
    { id: 'student-work', icon: <Users size={18} />, label: 'أعمال الطلاب' },
    { id: 'emoji', icon: <Smile size={18} />, label: 'ملصقات' }
  ];

  const isShapeActive = ['line', 'arrow', 'rect', 'circle'].includes(activeTool);
  const submissionCount = session?.activeActivity?.submissions ? Object.keys(session.activeActivity.submissions).length : 0;
  const sidebarGradient = 'linear-gradient(to left, #0f172a 0%, #064e3b 100%)';

  return (
    <div 
      ref={toolbarRef}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 max-w-[99vw] select-none"
      dir="rtl"
    >
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="border border-white/10 p-1.5 rounded-2xl shadow-2xl flex flex-row items-center gap-1 relative overflow-visible backdrop-blur-2xl ring-1 ring-white/10 text-white max-w-[96vw] overflow-x-auto custom-scroll"
            style={{ background: sidebarGradient }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none rounded-2xl" />

            {/* 1. قائمة نوع اللوح والخلفيات */}
            <div className="relative shrink-0 border-l border-white/15 pl-1">
              <button
                onClick={() => {
                  setShowSubMenu(null);
                  setShowCanvasMenu(!showCanvasMenu);
                }}
                className={`p-2 rounded-xl flex items-center gap-1.5 transition-all duration-300 ${
                  showCanvasMenu
                    ? 'bg-white text-slate-900 shadow-lg scale-105 font-bold'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
                title="تغيير سطح اللوح وخلفية التسطير"
              >
                <span className="text-base">{THEME_INFO[activeTheme]?.icon || '🪵'}</span>
                <ChevronDown size={12} className={`transition-transform ${showCanvasMenu ? 'rotate-180' : ''}`} />
              </button>

              {showCanvasMenu && (
                <div className="absolute bottom-full mb-3 right-0 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-2xl z-[10000] w-72 flex flex-col gap-2 ring-1 ring-white/10 animate-in fade-in zoom-in-95 text-right">
                  <div className="text-[11px] font-black text-emerald-400 px-1 border-b border-white/10 pb-1 flex items-center justify-between">
                    <span>نوع وسطح السبورة:</span>
                    <span className="text-[10px] text-white/50">تلقائي مع الألوان</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(THEME_INFO) as WhiteboardTheme[]).map(themeKey => (
                      <button
                        key={themeKey}
                        onClick={() => {
                          onChangeTheme(themeKey);
                          onChangeColor(THEME_INFO[themeKey].defaultColor);
                          setShowCanvasMenu(false);
                        }}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center gap-2 transition border ${
                          activeTheme === themeKey
                            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                            : 'bg-white/5 border-white/5 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-base">{THEME_INFO[themeKey].icon}</span>
                        <span className="truncate">{THEME_INFO[themeKey].label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="text-[11px] font-black text-emerald-400 px-1 border-b border-white/10 pb-1 mt-1 flex items-center justify-between">
                    <span>تسطيرات وخلفيات اللوح:</span>
                    <Layers size={13} className="text-emerald-400" />
                  </div>
                  <div className="flex flex-col gap-1 max-h-44 overflow-y-auto custom-scroll pr-0.5">
                    {BACKGROUND_OPTIONS.map(bg => (
                      <button
                        key={bg.id}
                        onClick={() => {
                          onChangeBackground(bg.id);
                          setShowCanvasMenu(false);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                          activeBackground === bg.id
                            ? 'bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/40'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{bg.icon}</span>
                          <span>{bg.label}</span>
                        </div>
                        {activeBackground === bg.id && <Check size={14} className="text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. الأدوات العشر الأساسية المضبوطة بدقة ومطابقة للشريط الصغير */}
            <div className="flex items-center gap-0.5">
              {primaryTools.map(tool => {
                const isActive = 
                  tool.id === 'select' ? (activeTool === 'select' || activeTool === null) :
                  tool.id === 'highlight' ? (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser' || showSubMenu === 'highlight') :
                  tool.id === 'text' ? (activeTool === 'text' || showSubMenu === 'text') :
                  tool.id === 'sticky' ? (activeTool === 'note' || showSubMenu === 'sticky') :
                  tool.id === 'timer' ? (timerActive || showSubMenu === 'timer') :
                  showSubMenu === tool.id;

                return (
                  <div key={tool.id} className="relative">
                    <button
                      onClick={() => {
                        if (tool.id === 'select') {
                          onSelectTool('select');
                          setShowSubMenu(null);
                          return;
                        }
                        if (tool.id === 'laser') {
                          onSelectTool('laser');
                          setShowSubMenu(null);
                          return;
                        }
                        if (tool.id === 'highlight') {
                          if (activeTool !== 'pen' && activeTool !== 'highlighter' && activeTool !== 'laser' && activeTool !== 'eraser') {
                            onSelectTool('pen');
                          }
                        }
                        if (tool.id === 'text') {
                          onSelectTool('text');
                        }
                        if (tool.id === 'sticky') {
                          onSelectTool('note');
                        }
                        toggleSubMenu(tool.id);
                      }}
                      className={`relative group p-2 rounded-xl transition-all duration-300 flex items-center gap-1 ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-lg scale-105 font-bold'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                      title={tool.label}
                    >
                      {tool.icon}
                      
                      {/* Active indicator dot matching TeacherToolbar */}
                      {isActive && (
                        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                      )}

                      {/* Live Badge for Timer */}
                      {tool.id === 'timer' && timerActive && (
                        <span className="font-mono text-[10px] font-black bg-yellow-400 text-slate-950 px-1 py-0.2 rounded-md">
                          {Math.floor(timerRemaining / 60)}:{(timerRemaining % 60).toString().padStart(2, '0')}
                        </span>
                      )}

                      {/* Live Badge for Student Works */}
                      {tool.id === 'student-work' && submissionCount > 0 && (
                        <span className="bg-emerald-400 text-slate-950 text-[10px] font-black rounded-full px-1.5 py-0.2">
                          {submissionCount}
                        </span>
                      )}
                    </button>

                    {/* Popover Submenus for each tool matching TeacherToolbar exactly */}
                    <AnimatePresence>
                      {showSubMenu === tool.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-3 min-w-[170px] z-[10000] text-right ring-1 ring-white/10"
                        >
                          {/* 1. رسم وتحديد (Drawing & Highlighter Submenu) */}
                          {tool.id === 'highlight' && (
                            <div className="flex flex-col gap-3 items-center w-56">
                              <div className="flex items-center justify-center gap-2 w-full">
                                <button 
                                  onClick={() => {
                                    setDrawMode('pen');
                                    onSelectTool('pen');
                                  }} 
                                  className={`p-1.5 rounded-xl transition-all ${
                                    activeTool === 'pen' ? 'bg-yellow-400 text-slate-900 scale-110 shadow-md font-bold' : 'text-white/60 hover:bg-white/5'
                                  }`}
                                  title="قلم عادي / طباشير"
                                >
                                  <Pencil size={18} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setDrawMode('highlighter');
                                    onSelectTool('highlighter');
                                  }} 
                                  className={`p-1.5 rounded-xl transition-all ${
                                    activeTool === 'highlighter' ? 'bg-yellow-400 text-slate-900 scale-110 shadow-md font-bold' : 'text-white/60 hover:bg-white/5'
                                  }`}
                                  title="قلم تمييز وتظليل"
                                >
                                  <Highlighter size={18} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setDrawMode('laser');
                                    onSelectTool('laser');
                                  }} 
                                  className={`p-1.5 rounded-xl transition-all ${
                                    activeTool === 'laser' ? 'bg-red-500 text-white scale-110 shadow-md font-bold' : 'text-red-400 hover:bg-white/5'
                                  }`}
                                  title="مؤشر ليزر تفاعلي"
                                >
                                  <Zap size={18} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setDrawMode('eraser');
                                    onSelectTool('eraser');
                                  }} 
                                  className={`p-1.5 rounded-xl transition-all ${
                                    activeTool === 'eraser' ? 'bg-yellow-400 text-slate-900 scale-110 shadow-md font-bold' : 'text-white/60 hover:bg-white/5'
                                  }`}
                                  title="ممحاة"
                                >
                                  <Eraser size={18} />
                                </button>
                              </div>

                              <div className="w-full h-px bg-white/10" />

                              {/* 10 Colors Palette matching TeacherToolbar exactly */}
                              <div className="grid grid-cols-5 gap-2">
                                {['#ef4444', '#cbd5e1', '#facc15', '#f97316', '#2dd4bf', '#4ade80', '#a855f7', '#67e8f9', '#ffffff', '#f472b6'].map((c) => (
                                  <button 
                                    key={c} 
                                    onClick={() => onChangeColor(c)} 
                                    className="relative w-6 h-6 flex items-center justify-center group"
                                  >
                                    <div 
                                      className="w-4 h-4 rounded-full transition-transform group-hover:scale-110" 
                                      style={{ backgroundColor: c }} 
                                    />
                                    {activeColor.toLowerCase() === c.toLowerCase() && (
                                      <div className="absolute inset-0 border border-white rounded-full flex items-center justify-center" />
                                    )}
                                  </button>
                                ))}
                              </div>

                              <div className="w-full h-px bg-white/10" />

                              {/* Stroke width range slider */}
                              <div className="flex flex-col gap-1.5 w-full px-1">
                                <div className="flex justify-between text-[8px] font-black text-white/40 uppercase tracking-widest">
                                  <span>الحجم</span>
                                  <span className="font-mono text-amber-300">{activeStrokeWidth}px</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="2" 
                                  max="100" 
                                  step="1" 
                                  value={activeStrokeWidth} 
                                  onChange={(e) => onChangeStrokeWidth(parseInt(e.target.value))} 
                                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400" 
                                />
                              </div>

                              {/* Shapes quick expander */}
                              <div className="w-full border-t border-white/10 pt-2">
                                <div className="text-[9px] font-black text-emerald-400 mb-1.5 text-center">أشكال هندسية:</div>
                                <div className="grid grid-cols-4 gap-1">
                                  <button
                                    onClick={() => { onSelectTool('line'); closeAllMenus(); }}
                                    className={`p-1.5 rounded-lg flex items-center justify-center border transition ${
                                      activeTool === 'line' ? 'bg-emerald-400 text-slate-900 border-emerald-300' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                    }`}
                                    title="خط مستقيم"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <button
                                    onClick={() => { onSelectTool('arrow'); closeAllMenus(); }}
                                    className={`p-1.5 rounded-lg flex items-center justify-center border transition ${
                                      activeTool === 'arrow' ? 'bg-emerald-400 text-slate-900 border-emerald-300' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                    }`}
                                    title="سهم توجيهي"
                                  >
                                    <MoveUpRight size={14} />
                                  </button>
                                  <button
                                    onClick={() => { onSelectTool('rect'); closeAllMenus(); }}
                                    className={`p-1.5 rounded-lg flex items-center justify-center border transition ${
                                      activeTool === 'rect' ? 'bg-emerald-400 text-slate-900 border-emerald-300' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                    }`}
                                    title="مستطيل / مربع"
                                  >
                                    <Square size={14} />
                                  </button>
                                  <button
                                    onClick={() => { onSelectTool('circle'); closeAllMenus(); }}
                                    className={`p-1.5 rounded-lg flex items-center justify-center border transition ${
                                      activeTool === 'circle' ? 'bg-emerald-400 text-slate-900 border-emerald-300' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                    }`}
                                    title="دائرة هندسية"
                                  >
                                    <Circle size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2. نص (Text Submenu) */}
                          {tool.id === 'text' && (
                            <div className="flex flex-col gap-3 items-center w-56">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">إعدادات النص</h3>
                              <div className="flex flex-col gap-1.5 w-full px-1">
                                <div className="flex justify-between text-[8px] font-black text-white/40 uppercase tracking-widest">
                                  <span>الحجم</span>
                                  <span className="font-mono text-sky-300">{textSize}px</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="12" 
                                  max="48" 
                                  step="1" 
                                  value={textSize} 
                                  onChange={(e) => setTextSize(parseInt(e.target.value))} 
                                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400" 
                                />
                              </div>
                              <div className="w-full h-px bg-white/10" />
                              <div className="grid grid-cols-4 gap-2">
                                {['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6', '#000000'].map((c) => (
                                  <button 
                                    key={c} 
                                    onClick={() => {
                                      setTextColor(c);
                                      onChangeColor(c);
                                    }} 
                                    className="relative w-6 h-6 flex items-center justify-center group"
                                  >
                                    <div className="w-4 h-4 rounded-full transition-transform group-hover:scale-110" style={{ backgroundColor: c }} />
                                    {textColor === c && <div className="absolute inset-0 border border-white rounded-full flex items-center justify-center" />}
                                  </button>
                                ))}
                              </div>
                              <div className="w-full h-px bg-white/10" />
                              <div className="flex flex-col gap-1.5 w-full">
                                <input
                                  type="text"
                                  placeholder="اكتب نصاً للإدراج الفوري..."
                                  value={tempText}
                                  onChange={(e) => setTempText(e.target.value)}
                                  className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none arabic-font placeholder:text-white/30"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddTextDirect();
                                  }}
                                />
                                <button
                                  onClick={handleAddTextDirect}
                                  className="w-full bg-yellow-400 text-slate-900 py-1.5 rounded-lg font-black text-xs shadow-lg hover:bg-yellow-300 transition-all flex items-center justify-center gap-1.5"
                                >
                                  <Type size={13} /> إدراج النص على السبورة
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 3. ملاحظة لاصقة (Sticky Note Submenu) */}
                          {tool.id === 'sticky' && (
                            <div className="flex flex-col gap-3 items-center w-56">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">لون الملاحظة</h3>
                              <div className="grid grid-cols-3 gap-2">
                                {['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#ddd6fe', '#fed7aa'].map((c) => (
                                  <button 
                                    key={c} 
                                    onClick={() => setStickyColor(c)} 
                                    className="relative w-6 h-6 flex items-center justify-center group"
                                  >
                                    <div className="w-5 h-5 rounded-lg transition-transform group-hover:scale-110 shadow-xs" style={{ backgroundColor: c }} />
                                    {stickyColor === c && <div className="absolute inset-0 border-2 border-white rounded-lg flex items-center justify-center" />}
                                  </button>
                                ))}
                              </div>
                              <div className="w-full h-px bg-white/10" />
                              <div className="flex flex-col gap-1.5 w-full">
                                <textarea
                                  placeholder="اكتب محتوى الملاحظة..."
                                  value={tempNoteText}
                                  onChange={(e) => setTempNoteText(e.target.value)}
                                  className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none h-16 resize-none arabic-font placeholder:text-white/30"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAddStickyDirect();
                                    }
                                  }}
                                />
                                <button
                                  onClick={handleAddStickyDirect}
                                  className="w-full bg-yellow-400 text-slate-900 py-1.5 rounded-lg font-black text-xs shadow-lg hover:bg-yellow-300 transition-all flex items-center justify-center gap-1.5"
                                >
                                  <StickyNote size={13} /> إدراج الملاحظة اللاصقة
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 4. موقت (Timer Submenu) */}
                          {tool.id === 'timer' && (
                            <div className="flex flex-col gap-3 items-center w-56">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest">المؤقت</h3>
                              <div className="text-2xl font-black text-yellow-300 font-mono">
                                {Math.floor((timerActive ? timerRemaining : timerDuration) / 60)}:
                                {((timerActive ? timerRemaining : timerDuration) % 60).toString().padStart(2, '0')}
                              </div>

                              <div className="grid grid-cols-4 gap-1 w-full">
                                {[30, 60, 120, 300].map(s => (
                                  <button
                                    key={s}
                                    onClick={() => handleResetTimer(s)}
                                    className={`py-1 rounded-lg text-[10px] font-bold border transition ${
                                      timerDuration === s && !timerActive
                                        ? 'bg-yellow-400 text-slate-950 font-black border-yellow-300'
                                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                                    }`}
                                  >
                                    {s >= 60 ? `${s / 60} د` : `${s} ث`}
                                  </button>
                                ))}
                              </div>

                              <input 
                                type="range" 
                                min="10" 
                                max="600" 
                                step="10" 
                                value={timerDuration} 
                                onChange={(e) => handleResetTimer(parseInt(e.target.value))} 
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400" 
                              />
                              
                              <div className="flex gap-1.5 w-full">
                                <button 
                                  onClick={handleToggleTimer} 
                                  className="flex-1 bg-yellow-400 text-slate-900 py-1.5 rounded-lg font-black text-xs shadow-lg hover:bg-yellow-300 transition-all flex items-center justify-center gap-1.5"
                                >
                                  {timerActive ? <Pause size={13} /> : <Play size={13} />}
                                  {timerActive ? 'إيقاف مؤقت' : 'تشغيل'}
                                </button>
                                <button
                                  onClick={() => handleResetTimer(timerDuration)}
                                  className="px-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs transition"
                                  title="إعادة ضبط"
                                >
                                  <RotateCcw size={13} />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 5. سؤال عشوائي (Random Question / AI Wand & Wheel Submenu) */}
                          {tool.id === 'wand' && (
                            <div className="flex flex-col gap-2.5 min-w-[210px] w-64">
                              <div className="flex items-center justify-between">
                                <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-right">سؤال عشوائي</h3>
                                <button
                                  onClick={() => {
                                    onOpenWheel();
                                    setShowSubMenu(null);
                                  }}
                                  className="text-[10px] text-orange-300 font-bold hover:underline flex items-center gap-1"
                                >
                                  <Dices size={12} /> عجلة القرعة
                                </button>
                              </div>

                              {/* 3 Quick Instant Questions */}
                              <div className="grid grid-cols-3 gap-1">
                                <button
                                  onClick={() => handleQuickRandomQuestion('grammar')}
                                  className="py-1 px-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg text-[9px] font-bold transition text-center"
                                  title="سؤال إعراب ونحو فوري"
                                >
                                  نحو وإعراب
                                </button>
                                <button
                                  onClick={() => handleQuickRandomQuestion('vocab')}
                                  className="py-1 px-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg text-[9px] font-bold transition text-center"
                                  title="سؤال مفردات ومعاني فوري"
                                >
                                  معاني ومفردات
                                </button>
                                <button
                                  onClick={() => handleQuickRandomQuestion('spelling')}
                                  className="py-1 px-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 rounded-lg text-[9px] font-bold transition text-center"
                                  title="سؤال إملاء وهمزات فوري"
                                >
                                  إملاء وقواعد
                                </button>
                              </div>

                              <div className="w-full h-px bg-white/10 my-0.5" />

                              <textarea 
                                placeholder="أو اكتب موضوعاً لتوليد سؤال ذكي (مثال: كان وأخواتها)..." 
                                value={wandContext} 
                                onChange={(e) => setWandContext(e.target.value)} 
                                className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none h-14 arabic-font placeholder:text-white/30" 
                              />
                              
                              <button 
                                onClick={handleGenerateExercise} 
                                disabled={isGenerating || !wandContext.trim()} 
                                className="w-full bg-yellow-400 text-slate-900 py-1.5 rounded-lg font-black text-xs shadow-lg hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {isGenerating ? <Loader2 className="animate-spin" size={13} /> : <Wand2 size={13} />} 
                                توليد سؤال بالذكاء الاصطناعي
                              </button>

                              {generatedExercise && (
                                <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-xs flex flex-col gap-1.5 mt-1">
                                  <div className="font-bold text-amber-300">{generatedExercise.question}</div>
                                  <div className="text-[11px] text-white/80">{generatedExercise.answer || generatedExercise.solution}</div>
                                  <button
                                    onClick={handleInsertExerciseToBoard}
                                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-1 rounded-lg text-[10px] font-bold mt-1 transition"
                                  >
                                    إدراج كبطاقة تدريب على السبورة
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 6. تصويت (Poll Submenu) */}
                          {tool.id === 'poll' && (
                            <div className="flex flex-col gap-2.5 min-w-[190px] w-60">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">تصويت تفاعلي</h3>
                              <input 
                                type="text" 
                                placeholder="اكتب سؤال التصويت..." 
                                value={pollQuestion} 
                                onChange={(e) => setPollQuestion(e.target.value)} 
                                className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none arabic-font placeholder:text-white/30" 
                              />
                              <div className="grid grid-cols-2 gap-1.5">
                                {pollOptions.map((opt, idx) => (
                                  <input 
                                    key={idx} 
                                    type="text" 
                                    placeholder={`خيار ${idx + 1}`}
                                    value={opt} 
                                    onChange={(e) => { 
                                      const newOpts = [...pollOptions]; 
                                      newOpts[idx] = e.target.value; 
                                      setPollOptions(newOpts); 
                                    }} 
                                    className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-[10px] outline-none text-center arabic-font" 
                                  />
                                ))}
                              </div>
                              <button 
                                onClick={handleSendPollToBoard} 
                                disabled={!pollQuestion.trim()}
                                className="w-full bg-yellow-400 text-slate-900 py-1.5 rounded-lg font-black text-xs shadow-lg hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <Send size={13} /> {pollSent ? 'تم إدراج وبث التصويت!' : 'إدراج وبث للطلاب'}
                              </button>
                            </div>
                          )}

                          {/* 7. ملف (File Submenu) */}
                          {tool.id === 'file' && (
                            <div className="flex flex-col gap-2.5 min-w-[200px] w-64">
                              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">رفع ملف / تنزيل</h3>
                              <input 
                                type="file" 
                                accept="image/*" 
                                id="whiteboard-file-upload" 
                                className="hidden" 
                                onChange={handleFileUpload} 
                              />
                              <label 
                                htmlFor="whiteboard-file-upload" 
                                className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-all text-white/40 text-xs"
                              >
                                {isUploading ? (
                                  <Loader2 className="animate-spin" size={16} />
                                ) : fileData ? (
                                  <img src={fileData} className="w-full h-full object-cover rounded-lg" alt="معاينة" />
                                ) : (
                                  <div className="flex flex-col items-center gap-1">
                                    <FileUp size={18} />
                                    <span>انقر لرفع صورة أو وسائط</span>
                                  </div>
                                )}
                              </label>
                              
                              <button 
                                onClick={handleShareFileToBoard} 
                                disabled={!fileData} 
                                className="w-full bg-yellow-400 text-slate-900 py-1.5 rounded-lg font-black text-xs shadow-lg hover:bg-yellow-300 transition-all disabled:opacity-50"
                              >
                                إدراج وعرض للطلاب
                              </button>

                              <div className="w-full h-px bg-white/10 my-0.5" />
                              
                              <button 
                                onClick={() => { 
                                  downloadPlacementTestPDF(teacherName); 
                                  setShowSubMenu(null); 
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-1.5 px-2 rounded-lg font-black text-xs shadow transition-all flex items-center justify-center gap-1.5 arabic-font"
                                title="تحميل اختبار تحديد المستوى الشامل 80 سؤالاً بصيغة PDF"
                              >
                                <FileText size={13} className="text-amber-300" />
                                <span>اختبار تحديد المستوى (80 سؤالاً) PDF</span>
                              </button>

                              <button
                                onClick={() => {
                                  onOpenMediaStickers();
                                  setShowSubMenu(null);
                                }}
                                className="w-full bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 py-1.5 px-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5"
                              >
                                <BookOpen size={13} />
                                <span>عرض الكتب والـ PDF المدرسية</span>
                              </button>
                            </div>
                          )}

                          {/* 8. أعمال الطلاب (Student Works Submenu) */}
                          {tool.id === 'student-work' && (
                            <div className="flex flex-col gap-2.5 min-w-[220px] max-h-[300px] w-64 overflow-y-auto custom-scroll">
                              <div className="flex items-center justify-between">
                                <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest">أعمال الطلاب</h3>
                                {onOpenStudentWorks && (
                                  <button
                                    onClick={() => {
                                      onOpenStudentWorks();
                                      setShowSubMenu(null);
                                    }}
                                    className="text-[10px] text-emerald-400 font-bold hover:underline"
                                  >
                                    فتح اللوحة الكاملة
                                  </button>
                                )}
                              </div>

                              <div className="space-y-1.5">
                                {session?.activeActivity?.submissions && Object.entries(session.activeActivity.submissions).map(([uid, ans]: [string, any]) => (
                                  <div key={uid} className="p-2 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-[10px] font-bold text-white/80">{ans.studentName || ans.name}</span>
                                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                                        ans.evaluated ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                      }`}>
                                        {ans.evaluated ? 'تم التقييم' : 'إجابة جديدة'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-white arabic-font">{ans.answer}</p>
                                  </div>
                                ))}

                                {(!session?.activeActivity?.submissions || Object.keys(session.activeActivity.submissions).length === 0) && (
                                  <p className="text-[10px] text-white/40 text-center py-4">لا توجد إجابات بعد</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* 9. ملصقات (Stickers Submenu) */}
                          {tool.id === 'emoji' && (
                            <div className="flex flex-col gap-2.5 min-w-[200px] max-h-[220px] w-60 overflow-y-auto custom-scroll">
                              <div className="flex items-center justify-between">
                                <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">ملصقات</h3>
                                <button
                                  onClick={() => {
                                    onOpenMediaStickers();
                                    setShowSubMenu(null);
                                  }}
                                  className="text-[10px] text-pink-300 font-bold hover:underline"
                                >
                                  المكتبة الثقافية
                                </button>
                              </div>
                              <div className="grid grid-cols-6 gap-2">
                                {['😀', '😂', '😍', '🥳', '😎', '🤔', '👍', '👏', '🔥', '✨', '⭐', '🎈', '🎨', '📚', '💡', '✅', '❌', '❓'].map(emoji => (
                                  <button 
                                    key={emoji} 
                                    onClick={() => handleInsertSticker(emoji)} 
                                    className="text-2xl hover:scale-125 transition-transform"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="mx-1 h-6 w-px bg-white/10 shrink-0" />

            {/* 3. أدوات اللغة العربية الإضافية (المزيد) */}
            <div className="relative shrink-0 border-l border-white/15 pl-1">
              <button
                onClick={() => {
                  setShowSubMenu(null);
                  setShowMoreToolsMenu(!showMoreToolsMenu);
                }}
                className={`p-2 rounded-xl flex items-center gap-1 transition-all duration-300 ${
                  showMoreToolsMenu
                    ? 'bg-purple-400 text-slate-950 shadow-lg scale-105 font-bold'
                    : 'text-purple-300/80 hover:bg-white/5 hover:text-purple-200'
                }`}
                title="أدوات لغوية إضافية (شجرة النحو، مجزئ الكلمات، بطاقات الحروف، مسجل الصوت)"
              >
                <Sparkles size={16} />
                <ChevronDown size={11} className={`transition-transform ${showMoreToolsMenu ? 'rotate-180' : ''}`} />
              </button>

              {showMoreToolsMenu && (
                <div className="absolute bottom-full mb-3 right-0 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-2xl z-[10000] w-72 flex flex-col gap-2 ring-1 ring-white/10 animate-in fade-in zoom-in-95 text-right">
                  <div className="text-[11px] font-black text-purple-400 border-b border-white/10 pb-1">
                    أدوات اللغة والتعليم:
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => { onOpenArabicTools(); setShowMoreToolsMenu(false); }}
                      className="p-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-200 transition"
                    >
                      <BookOpen size={14} className="text-emerald-400 shrink-0" />
                      <span>بطاقات الحروف</span>
                    </button>

                    <button
                      onClick={() => { onOpenWordSlicer(); setShowMoreToolsMenu(false); }}
                      className="p-2 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 rounded-xl flex items-center gap-2 text-xs font-bold text-sky-200 transition"
                    >
                      <Scissors size={14} className="text-sky-400 shrink-0" />
                      <span>مجزّئ الكلمات</span>
                    </button>

                    <button
                      onClick={() => { onOpenGrammarTree(); setShowMoreToolsMenu(false); }}
                      className="p-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-xl flex items-center gap-2 text-xs font-bold text-purple-200 transition"
                    >
                      <GitFork size={14} className="text-purple-400 shrink-0" />
                      <span>شجرة النحو</span>
                    </button>

                    <button
                      onClick={() => { onOpenAudioRecorder(); setShowMoreToolsMenu(false); }}
                      className="p-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-200 transition"
                    >
                      <Mic size={14} className="text-amber-400 shrink-0" />
                      <span>مسجل الصوت</span>
                    </button>
                  </div>

                  <div className="border-t border-white/10 pt-2 flex gap-1.5">
                    <button
                      onClick={() => { onOpenHistory(); setShowMoreToolsMenu(false); }}
                      className="flex-1 p-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 rounded-xl text-xs font-bold text-indigo-300 flex items-center justify-center gap-1 transition"
                    >
                      <History size={13} /> أرشيف وPDF
                    </button>
                    <button
                      onClick={() => downloadPlacementTestPDF(teacherName)}
                      className="flex-1 p-2 bg-blue-600/25 hover:bg-blue-600/40 border border-blue-400/30 rounded-xl text-xs font-bold text-blue-300 flex items-center justify-center gap-1 transition"
                    >
                      <FileText size={13} className="text-amber-300" /> اختبار 80 سؤالاً
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. التنقل بين الصفحات وقفل التفاعل */}
            {(onPrevPage || onNextPage || onAddNewPage || onToggleLock) && (
              <div className="flex items-center gap-1 border-l border-white/15 pl-1 shrink-0">
                {onToggleLock && (
                  <button
                    onClick={onToggleLock}
                    className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-bold ${
                      isLocked
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                        : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/40'
                    }`}
                    title={isLocked ? 'السبورة مقفلة عن الطلاب (انقر للسماح بالتفاعل)' : 'تفاعل الطلاب متاح (انقر للقفل)'}
                  >
                    {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                )}

                {onPrevPage && onNextPage && (
                  <div className="flex items-center gap-0.5 bg-white/10 px-1 py-0.5 rounded-xl text-white text-xs font-bold">
                    <button
                      onClick={onPrevPage}
                      disabled={currentPageIndex <= 0}
                      className="p-1 hover:bg-white/20 rounded-lg disabled:opacity-30 text-white/80"
                      title="الصفحة السابقة"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <span className="px-1 text-[11px] font-mono font-black text-amber-300">
                      {currentPageIndex + 1}/{totalPages}
                    </span>
                    <button
                      onClick={onNextPage}
                      disabled={currentPageIndex >= totalPages - 1}
                      className="p-1 hover:bg-white/20 rounded-lg disabled:opacity-30 text-white/80"
                      title="الصفحة التالية"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {onAddNewPage && (
                      <button
                        onClick={onAddNewPage}
                        className="p-1 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition"
                        title="إضافة صفحة جديدة"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 5. التراجع والإعادة والمسح */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-2 text-white/70 hover:text-white disabled:opacity-25 rounded-xl hover:bg-white/10 transition"
                title="تراجع"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-2 text-white/70 hover:text-white disabled:opacity-25 rounded-xl hover:bg-white/10 transition"
                title="إعادة"
              >
                <RotateCw size={15} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSubMenu(null);
                    setShowClearConfirm(!showClearConfirm);
                  }}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition"
                  title="مسح محتوى الصفحة الحالية"
                >
                  <Trash2 size={15} />
                </button>

                {showClearConfirm && (
                  <div className="absolute bottom-full mb-3 left-0 bg-red-950/95 backdrop-blur-2xl border border-red-500/50 rounded-2xl p-3 shadow-2xl z-[10000] w-48 text-center text-xs font-bold text-white ring-1 ring-white/10 animate-in fade-in zoom-in-95">
                    <p className="mb-2">مسح محتويات الصفحة؟</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onClearPage();
                          setShowClearConfirm(false);
                        }}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-xl font-black text-xs transition shadow-md"
                      >
                        نعم، امسح
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white/80 py-1.5 rounded-xl text-xs transition"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimize / Expand Floating Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="backdrop-blur-xl border border-white/10 p-2.5 rounded-full text-white/80 hover:text-white transition-all shadow-2xl hover:scale-110 active:scale-95 shrink-0"
        style={{ background: sidebarGradient }}
        title={isMinimized ? 'توسيع شريط الأدوات' : 'تصغير شريط الأدوات'}
      >
        {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    </div>
  );
};
