import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Highlighter, Type, Wand2, 
  Timer, BarChart3, Paperclip, X, Play, RotateCcw,
  ChevronRight, ChevronLeft, Send, Loader2, Pencil, Eraser,
  Smile, Image as ImageIcon, FileUp, MoreHorizontal,
  StickyNote, Users, MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { generateQuickExercise } from '../services/gemini';

export const TeacherToolbar: React.FC = () => {
  const { profile, user, isAuthReady } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const [lang, setLang] = useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

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

  // Modal States
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showWandModal, setShowWandModal] = useState(false);
  
  const [drawMode, setDrawMode] = useState<'pen' | 'highlight' | 'eraser'>('highlight');
  const [showSubMenu, setShowSubMenu] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  
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
  const [textInput, setTextInput] = useState<{x: number, y: number} | null>(null);
  const [stickyInput, setStickyInput] = useState<{x: number, y: number} | null>(null);
  const [tempText, setTempText] = useState('');
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileData, setFileData] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showStudentWork, setShowStudentWork] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
        magnifyPosition: null,
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

  const tools = [
    { id: 'select', icon: <MousePointer2 size={18} />, label: 'تحديد', color: 'bg-slate-700' },
    { id: 'highlight', icon: <Highlighter size={18} />, label: 'رسم وتحديد', color: 'bg-slate-700' },
    { id: 'text', icon: <Type size={18} />, label: 'نص', color: 'bg-slate-700' },
    { id: 'sticky', icon: <StickyNote size={18} />, label: 'ملاحظة لاصقة', color: 'bg-slate-700' },
    { id: 'timer', icon: <Timer size={18} />, label: 'مؤقت', color: 'bg-slate-700' },
    { id: 'wand', icon: <Wand2 size={18} />, label: 'سؤال عشوائي', color: 'bg-slate-700' },
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
      return;
    }

    if (activeTool === toolId) {
      setShowSubMenu(showSubMenu === toolId ? null : toolId);
      return;
    }

    const newTool = activeTool === toolId ? null : toolId;
    setActiveTool(newTool);
    setShowSubMenu(newTool ? toolId : null);
    
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
      const simplifiedPoints = simplifyPath(points);
      await setDoc(doc(db, 'live_sessions', 'global'), {
        highlights: [...(sessionDataRef.current?.highlights || []), { 
          id: Date.now().toString(), 
          points: simplifiedPoints, 
          color: highlightColorRef.current,
          width: drawMode === 'pen' ? 4 : highlightWidthRef.current,
          mode: drawMode
        }],
        currentStroke: null,
        lastUpdate: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error adding highlight:", err);
    }
  };

  const addTextAnnotation = async (content: string, x: number, y: number) => {
    try {
      await setDoc(doc(db, 'live_sessions', 'global'), {
        texts: [...(sessionData?.texts || []), { 
          id: Date.now().toString(), 
          content, x, y, 
          color: textColor,
          fontSize: textSize,
          type: 'text',
          width: 150,
          height: 40,
          isFrozen: false
        }],
        lastUpdate: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error adding text:", err);
    }
  };

  const addStickyNote = async (content: string, x: number, y: number) => {
    try {
      await setDoc(doc(db, 'live_sessions', 'global'), {
        stickyNotes: [...(sessionData?.stickyNotes || []), { 
          id: Date.now().toString(), 
          content, x, y, 
          color: stickyColor,
          authorName: profile?.displayName || 'Teacher',
          type: 'sticky',
          width: 180,
          height: 180,
          isFrozen: false
        }],
        lastUpdate: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error adding sticky note:", err);
    }
  };

  const addSticker = async (emoji: string) => {
    try {
      await setDoc(doc(db, 'live_sessions', 'global'), {
        stickers: [...(sessionData?.stickers || []), { 
          id: Date.now().toString(), 
          content: emoji, 
          x: 45, y: 45, 
          type: 'sticker',
          width: 80,
          height: 80,
          isFrozen: false
        }],
        lastUpdate: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error adding sticker:", err);
    }
  };

  useEffect(() => {
    if (!activeTool) return;
    const handleMouseDown = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.teacher-toolbar-container') || target.closest('.sub-menu-container') || target.closest('button') || target.closest('input')) return;
      
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      if (activeToolRef.current === 'highlight') {
        if (drawMode === 'eraser') {
          setIsDrawing(true);
          const remainingHighlights = (sessionDataRef.current?.highlights || []).filter((h: any) => {
            return !h.points.some((p: any) => Math.abs(p.x - x) < 2 && Math.abs(p.y - y) < 2);
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
        setTextInput({ x, y });
        setTempText('');
      } else if (activeToolRef.current === 'sticky') {
        if (stickyInput) return;
        setStickyInput({ x, y });
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
  }, [activeTool]);

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
                        {tool.id === 'timer' && (
                          <div className="flex flex-col gap-3 items-center">
                            <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest">المؤقت</h3>
                            <div className="text-xl font-black text-white font-mono">{Math.floor(timerDuration / 60)}:{(timerDuration % 60).toString().padStart(2, '0')}</div>
                            <input type="range" min="10" max="600" step="10" value={timerDuration} onChange={(e) => setTimerDuration(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400" />
                            <button onClick={startTimer} className="w-full bg-yellow-400 text-slate-900 py-1.5 rounded-lg font-black text-[9px] shadow-lg hover:bg-yellow-300 transition-all flex items-center justify-center gap-2"><Play size={12} /> تشغيل</button>
                          </div>
                        )}
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
                        {tool.id === 'wand' && (
                          <div className="flex flex-col gap-2.5 min-w-[160px]">
                            <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">سؤال عشوائي</h3>
                            <textarea placeholder="مثال: الجملة الاسمية..." value={wandContext} onChange={(e) => setWandContext(e.target.value)} className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white text-[9px] outline-none h-16 arabic-font" />
                            <button onClick={generateExercise} disabled={isGenerating || !wandContext} className="w-full bg-yellow-400 text-slate-900 py-1.5 rounded-lg font-black text-[9px] shadow-lg hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50">{isGenerating ? <Loader2 className="animate-spin" size={12} /> : <Wand2 size={12} />} توليد</button>
                          </div>
                        )}
                        {tool.id === 'file' && (
                          <div className="flex flex-col gap-2.5 min-w-[160px]">
                            <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">رفع ملف</h3>
                            <input type="file" accept="image/*" id="tool-file-upload" className="hidden" onChange={handleFileUpload} />
                            <label htmlFor="tool-file-upload" className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-all text-white/20">{isUploading ? <Loader2 className="animate-spin" size={14} /> : fileData ? <img src={fileData} className="w-full h-full object-cover rounded-lg" /> : <FileUp size={18} />}</label>
                            <button onClick={shareFile} disabled={!fileData} className="w-full bg-yellow-400 text-slate-900 py-1.5 rounded-lg font-black text-[9px] shadow-lg hover:bg-yellow-300 transition-all disabled:opacity-50">عرض للطلاب</button>
                          </div>
                        )}
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

            <div className={`mx-1.5 h-6 w-px bg-white/10`} />

            <div className="relative">
              <AnimatePresence>
                {showResetConfirm && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={`absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-xl whitespace-nowrap z-[10002] flex items-center gap-3`}>
                    <span>هل أنت متأكد؟</span>
                    <div className="flex gap-2">
                      <button onClick={handleResetAll} className="bg-white text-red-500 px-2 py-1 rounded-lg hover:bg-white/90 transition-colors">نعم</button>
                      <button onClick={() => setShowResetConfirm(false)} className="bg-black/20 text-white px-2 py-1 rounded-lg hover:bg-black/30 transition-colors">لا</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <button onClick={() => setShowResetConfirm(!showResetConfirm)} className={`p-2 rounded-xl transition-all ${showResetConfirm ? 'bg-red-500 text-white' : 'text-red-400 hover:bg-red-500/10 hover:text-red-300'}`} title="إعادة ضبط الكل"><RotateCcw size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsMinimized(!isMinimized)}
        className="backdrop-blur-xl border border-white/10 p-2 rounded-full text-white/60 hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95"
        style={{ background: sidebarGradient }}
      >
        <div className="flex items-center gap-2">
          {isMinimized ? <ChevronRight size={18} className="-rotate-90" /> : <ChevronLeft size={18} className="-rotate-90" />}
        </div>
      </button>

      <AnimatePresence>
        {textInput && (
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="fixed z-[10001] bg-slate-900/95 backdrop-blur-22xl border border-white/20 p-4 rounded-2xl shadow-2xl flex gap-2" style={{ left: `${textInput.x}%`, top: `${textInput.y}%`, transform: 'translate(-50%, -100%)' }}>
            <input autoFocus type="text" value={tempText} onChange={(e) => setTempText(e.target.value)} placeholder="اكتب هنا..." style={{ color: textColor }} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 arabic-font" onKeyDown={async (e) => { if (e.key === 'Enter' && tempText) { await addTextAnnotation(tempText, textInput.x, textInput.y); setTextInput(null); } if (e.key === 'Escape') setTextInput(null); }} />
            <button onClick={() => setTextInput(null)} className="p-2 text-white/40 hover:text-white transition-colors"><X size={16} /></button>
          </motion.div>
        )}
        {stickyInput && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="fixed z-[10001] p-4 rounded-xl shadow-2xl flex flex-col gap-2 min-w-[200px]" style={{ left: `${stickyInput.x}%`, top: `${stickyInput.y}%`, backgroundColor: stickyColor, color: '#1e293b' }}>
            <textarea autoFocus value={tempText} onChange={(e) => setTempText(e.target.value)} placeholder="اكتب ملاحظة..." className="bg-black/5 border-none rounded-lg p-2 outline-none resize-none h-24 arabic-font text-sm placeholder:text-black/20" onKeyDown={async (e) => { if (e.key === 'Enter' && !e.shiftKey && tempText) { await addStickyNote(tempText, stickyInput.x, stickyInput.y); setStickyInput(null); } if (e.key === 'Escape') setStickyInput(null); }} />
            <div className="flex justify-between items-center"><span className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Sticky Note</span><button onClick={() => setStickyInput(null)} className="p-1 hover:bg-black/5 rounded-full transition-colors"><X size={14} /></button></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
