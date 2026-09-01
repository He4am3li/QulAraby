import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { LiveSession } from '../types';
import { useAuth } from './AuthProvider';
import { Timer as TimerIcon, BarChart3, X, CheckCircle2, AlertCircle, Wand2, Copy, Scissors, Clipboard, Layers, Lock, Unlock, Pencil, Trash2 } from 'lucide-react';

const ContextMenu: React.FC<{
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
  isFrozen: boolean;
  isBackground?: boolean;
  type?: string;
}> = ({ x, y, onClose, onAction, isFrozen, isBackground, type }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed z-[10005] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 min-w-[160px] pointer-events-auto"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-1">
        {isBackground ? (
          <button onClick={() => onAction('paste')} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-colors text-white/70 hover:text-white text-xs w-full text-right">
            <Clipboard size={14} /> <span>لصق</span>
          </button>
        ) : (
          <>
            <button onClick={() => onAction('copy')} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-colors text-white/70 hover:text-white text-xs w-full text-right">
              <Copy size={14} /> <span>نسخ</span>
            </button>
            <button onClick={() => onAction('cut')} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-colors text-white/70 hover:text-white text-xs w-full text-right">
              <Scissors size={14} /> <span>قص</span>
            </button>
            <button onClick={() => onAction('duplicate')} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-colors text-white/70 hover:text-white text-xs w-full text-right">
              <Layers size={14} /> <span>تكرار</span>
            </button>
            {(type === 'text' || type === 'sticky') && (
              <button onClick={() => onAction('edit')} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-colors text-white/70 hover:text-white text-xs w-full text-right">
                <Pencil size={14} /> <span>تعديل</span>
              </button>
            )}
            <button onClick={() => onAction('delete')} className="flex items-center gap-3 px-3 py-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-400 hover:text-red-300 text-xs w-full text-right">
              <Trash2 size={14} /> <span>حذف</span>
            </button>
            <div className="h-px bg-white/5 my-1" />
            <button onClick={() => onAction('freeze')} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-colors text-white/70 hover:text-white text-xs w-full text-right">
              {isFrozen ? <Unlock size={14} className="text-yellow-400" /> : <Lock size={14} />}
              <span>{isFrozen ? 'إلغاء التثبيت' : 'تثبيت'}</span>
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export const LiveInteractionLayer: React.FC = () => {
  const { user, profile, isAuthReady } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [exerciseAnswer, setExerciseAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, elementId: string, type: string } | null>(null);
  const [clipboard, setClipboard] = useState<any>(null);
  const [selectedElements, setSelectedElements] = useState<{ id: string, type: string }[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin';

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const pushToHistory = () => {
    if (!session || !isTeacher) return;
    const currentState = {
      texts: [...(session.texts || [])],
      stickyNotes: [...(session.stickyNotes || [])],
      stickers: [...(session.stickers || [])],
      highlights: [...(session.highlights || [])]
    };
    setHistory(prev => [...prev.slice(-29), currentState]);
    setRedoStack([]);
  };

  const handleUndo = async () => {
    if (history.length === 0 || !isTeacher) return;
    const prevState = history[history.length - 1];
    const currentState = {
      texts: [...(session.texts || [])],
      stickyNotes: [...(session.stickyNotes || [])],
      stickers: [...(session.stickers || [])],
      highlights: [...(session.highlights || [])]
    };
    
    setRedoStack(prev => [...prev, currentState]);
    setHistory(prev => prev.slice(0, -1));

    await updateDoc(doc(db, 'live_sessions', 'global'), {
      ...prevState,
      lastUpdate: new Date()
    });
  };

  const handleRedo = async () => {
    if (redoStack.length === 0 || !isTeacher) return;
    const nextState = redoStack[redoStack.length - 1];
    const currentState = {
      texts: [...(session.texts || [])],
      stickyNotes: [...(session.stickyNotes || [])],
      stickers: [...(session.stickers || [])],
      highlights: [...(session.highlights || [])]
    };

    setHistory(prev => [...prev, currentState]);
    setRedoStack(prev => prev.slice(0, -1));

    await updateDoc(doc(db, 'live_sessions', 'global'), {
      ...nextState,
      lastUpdate: new Date()
    });
  };

  const handleSelectAll = () => {
    if (!isTeacher) return;
    const all: {id: string, type: string}[] = [];
    (session.texts || []).forEach((t: any) => all.push({ id: t.id, type: 'text' }));
    (session.stickyNotes || []).forEach((s: any) => all.push({ id: s.id, type: 'sticky' }));
    (session.stickers || []).forEach((st: any) => all.push({ id: st.id, type: 'sticker' }));
    (session.highlights || []).forEach((h: any) => all.push({ id: h.id, type: 'highlight' }));
    setSelectedElements(all);
  };

  const handleDeleteSelected = async () => {
    if (selectedElements.length === 0 || !isTeacher) return;
    pushToHistory();
    
    const updates: any = {
      texts: [...(session.texts || [])],
      stickyNotes: [...(session.stickyNotes || [])],
      stickers: [...(session.stickers || [])],
      highlights: [...(session.highlights || [])]
    };

    selectedElements.forEach(sel => {
      const key = sel.type === 'text' ? 'texts' : sel.type === 'sticky' ? 'stickyNotes' : sel.type === 'sticker' ? 'stickers' : 'highlights';
      updates[key] = updates[key].filter((el: any) => el.id !== sel.id);
    });

    await updateDoc(doc(db, 'live_sessions', 'global'), updates);
    setSelectedElements([]);
  };

  const handleCopy = () => {
    if (selectedElements.length === 0 || !isTeacher) return;
    // Copy the last selected element
    const last = selectedElements[selectedElements.length - 1];
    const arrayKey = last.type === 'text' ? 'texts' : last.type === 'sticky' ? 'stickyNotes' : last.type === 'sticker' ? 'stickers' : 'highlights';
    const element = (session[arrayKey] || []).find((el: any) => el.id === last.id);
    if (element) {
      setClipboard({ ...element, type: last.type });
    }
  };

  const generateLayerId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const handlePaste = async () => {
    if (!clipboard || !isTeacher) return;
    pushToHistory();
    const pasteX = (mousePos.x / window.innerWidth) * 100;
    const pasteY = (mousePos.y / window.innerHeight) * 100;
    
    let newElement: any;
    if (clipboard.type === 'highlight') {
      // Shift points to new location
      const firstPoint = clipboard.points?.[0] || { x: 0, y: 0 };
      const dx = pasteX - firstPoint.x;
      const dy = pasteY - firstPoint.y;
      newElement = {
        ...clipboard,
        id: generateLayerId('hl'),
        points: (clipboard.points || []).map((p: any) => ({ x: p.x + dx, y: p.y + dy }))
      };
    } else {
      newElement = { ...clipboard, id: generateLayerId(clipboard.type || 'el'), x: pasteX, y: pasteY };
    }

    const targetKey = clipboard.type === 'text' ? 'texts' : clipboard.type === 'sticky' ? 'stickyNotes' : clipboard.type === 'sticker' ? 'stickers' : 'highlights';
    
    await updateDoc(doc(db, 'live_sessions', 'global'), { 
      [targetKey]: [...(session[targetKey] || []), newElement] 
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isTeacher) return;
      const isMod = e.ctrlKey || e.metaKey;
      const isTyping = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

      if (isTyping && e.key !== 'Escape') return;

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      }

      // Undo: Ctrl+Z
      if (isMod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if (isMod && ((e.shiftKey && e.key.toLowerCase() === 'z') || e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        handleRedo();
      }

      // Select All: Ctrl+A
      if (isMod && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleSelectAll();
      }

      // Copy: Ctrl+C
      if (isMod && e.key.toLowerCase() === 'c') {
        handleCopy();
      }

      // Paste: Ctrl+V
      if (isMod && e.key.toLowerCase() === 'v') {
        handlePaste();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, selectedElements, clipboard, history, redoStack, mousePos, isTeacher]);

  const playSound = (type: 'success' | 'timer' | 'pop') => {
    const sounds = {
      success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      timer: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
      pop: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
    };
    const audio = new Audio(sounds[type]);
    audio.play().catch(() => {}); // Ignore if blocked by browser
  };

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const unsubscribe = onSnapshot(doc(db, 'live_sessions', 'global'), (doc) => {
      if (doc.exists()) {
        setSession({ id: doc.id, ...doc.data() });
      }
    }, (error) => {
      // Only log if it's not a permission error for guests, or use handleFirestoreError
      console.error("Session snapshot error:", error);
    });
    return () => unsubscribe();
  }, [isAuthReady, user]);

  const handleVote = async (optionIdx: number) => {
    if (!user || !session?.poll?.isActive) return;
    try {
      playSound('pop');
      await updateDoc(doc(db, 'live_sessions', 'global'), {
        [`poll.votes.${user.uid}`]: {
          option: optionIdx,
          name: profile?.displayName || user.email?.split('@')[0] || 'Student',
          photo: profile?.photoURL || ''
        }
      });
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const checkExercise = async (answer: string) => {
    setExerciseAnswer(answer);
    setShowFeedback(true);
    
    if (user && session?.exercise?.isActive) {
      try {
        await updateDoc(doc(db, 'live_sessions', 'global'), {
          [`exercise.answers.${user.uid}`]: {
            answer,
            isCorrect: answer === session.exercise.correctAnswer,
            name: profile?.displayName || user.email?.split('@')[0] || 'Student'
          }
        });
      } catch (err) {
        console.error("Error saving answer:", err);
      }
    }

    if (answer === session.exercise.correctAnswer) {
      playSound('success');
    }
    setTimeout(() => setShowFeedback(false), 3000);
  };

  // Timer logic
  useEffect(() => {
    if (session?.timer?.isActive && session.timer.endTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((session.timer.endTime! - now) / 1000));
        setTimeLeft(diff);
        if (diff === 0) {
          clearInterval(interval);
          playSound('timer');
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [session?.timer?.isActive, session?.timer?.endTime]);

  const updateElement = async (type: string, id: string, updates: any) => {
    if (!session || !isTeacher) return;
    const arrayKey = type === 'text' ? 'texts' : type === 'sticky' ? 'stickyNotes' : type === 'sticker' ? 'stickers' : 'highlights';
    const updatedArray = (session[arrayKey] || []).map((el: any) => 
      el.id === id ? { ...el, ...updates } : el
    );
    try {
      await updateDoc(doc(db, 'live_sessions', 'global'), { [arrayKey]: updatedArray });
    } catch (err) {
      console.error("Error updating element:", err);
    }
  };

  const [resizing, setResizing] = useState<{ id: string, type: string, startX: number, startY: number, startWidth: number, startHeight: number } | null>(null);
  const [localSize, setLocalSize] = useState<{ width: number, height: number } | null>(null);

  const [editingElement, setEditingElement] = useState<{ id: string, type: string, content: string } | null>(null);

  const handleAction = async (action: string) => {
    if (!contextMenu || !session || !isTeacher) return;
    const { elementId, type, x: menuX, y: menuY } = contextMenu;
    const arrayKey = type === 'text' ? 'texts' : type === 'sticky' ? 'stickyNotes' : type === 'sticker' ? 'stickers' : 'highlights';
    
    try {
      if (action === 'paste' && clipboard) {
        await handlePaste();
        setContextMenu(null);
        return;
      }

      const element = (session[arrayKey] || []).find((el: any) => el.id === elementId);
      if (!element) {
        setContextMenu(null);
        return;
      }

      if (action === 'copy') {
        setClipboard({ ...element, type });
      } else if (action === 'cut') {
        pushToHistory();
        setClipboard({ ...element, type });
        const filtered = (session[arrayKey] || []).filter((el: any) => el.id !== elementId);
        await updateDoc(doc(db, 'live_sessions', 'global'), { [arrayKey]: filtered });
      } else if (action === 'duplicate') {
        pushToHistory();
        let newElement: any;
        if (type === 'highlight') {
          newElement = { 
            ...element, 
            id: generateLayerId('hl'), 
            points: (element.points || []).map((p: any) => ({ x: p.x + 2, y: p.y + 2 })) 
          };
        } else {
          newElement = { ...element, id: generateLayerId(type || 'el'), x: (element.x || 0) + 2, y: (element.y || 0) + 2 };
        }
        await updateDoc(doc(db, 'live_sessions', 'global'), { [arrayKey]: [...(session[arrayKey] || []), newElement] });
      } else if (action === 'freeze') {
        await updateElement(type, elementId, { isFrozen: !element.isFrozen });
      } else if (action === 'edit') {
        setEditingElement({ id: elementId, type, content: element.content });
      } else if (action === 'delete') {
        pushToHistory();
        const filtered = (session[arrayKey] || []).filter((el: any) => el.id !== elementId);
        await updateDoc(doc(db, 'live_sessions', 'global'), { [arrayKey]: filtered });
      }
    } catch (err) {
      console.error(`Error performing action ${action}:`, err);
    }

    setContextMenu(null);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizing) {
        const deltaX = e.clientX - resizing.startX;
        const deltaY = e.clientY - resizing.startY;
        const newWidth = Math.max(50, resizing.startWidth + deltaX);
        const newHeight = Math.max(30, resizing.startHeight + deltaY);
        setLocalSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = async () => {
      if (resizing && localSize) {
        await updateElement(resizing.type, resizing.id, localSize);
      }
      setResizing(null);
      setLocalSize(null);
    };

    if (resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, localSize]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.selectable-element')) {
        setSelectedElements([]);
      }
      setContextMenu(null);
    };

    const handleGlobalContextMenu = (e: MouseEvent) => {
      if (!isTeacher) return;
      // If clicking on an element, the element's own onContextMenu will handle it
      if ((e.target as HTMLElement).closest('.selectable-element')) return;
      
      // Otherwise, it's a background click
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, elementId: 'bg', type: 'bg' });
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('contextmenu', handleGlobalContextMenu);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
    };
  }, [isTeacher]);

  if (!session) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
      {/* 1. Shared File Display (Background of annotations) */}
      <AnimatePresence>
        {session.sharedFile?.isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6 md:p-12 pointer-events-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="relative max-w-5xl w-full bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.8)] flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">
                  {session.sharedFile?.url?.startsWith('data:application/pdf') || session.sharedFile?.url?.includes('.pdf') ? 'عرض ملف PDF المشترك' : 'عرض الصورة المشتركة'}
                </span>
                {profile?.role === 'teacher' && (
                  <button 
                    onClick={() => updateDoc(doc(db, 'live_sessions', 'global'), { 'sharedFile.isActive': false })}
                    className="px-3 py-1 bg-white/10 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    إنهاء العرض
                  </button>
                )}
              </div>

              <div className="relative flex-1 bg-black/40 flex items-center justify-center p-4 min-h-[400px]">
                {session.sharedFile?.url?.startsWith('data:application/pdf') || session.sharedFile?.url?.includes('.pdf') ? (
                  <iframe 
                    src={session.sharedFile.url} 
                    className="w-full h-[70vh] rounded-xl border border-white/10 shadow-2xl bg-white"
                    title="Shared PDF"
                  />
                ) : (
                  <img 
                    src={session.sharedFile.url} 
                    className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-lg"
                    referrerPolicy="no-referrer"
                    alt="Shared resource"
                  />
                )}
              </div>

              <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Interactive Presentation Mode</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Annotations Layer (Highlights, Texts, Sticky Notes, Stickers) */}
      <div className="absolute inset-0 z-[9995] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {session.highlights?.map((h: any, idx: number) => {
            const hId = h.id || `hl_${h.timestamp || idx}_${idx}`;
            return (
              <polyline
                key={hId}
                points={(h.points || []).map((p: any) => `${(p.x * window.innerWidth) / 100},${(p.y * window.innerHeight) / 100}`).join(' ')}
                fill="none"
                stroke={h.color || "rgba(255, 255, 0, 0.4)"}
                strokeWidth={h.width || (h.mode === 'pen' ? 4 : 20)}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={h.mode === 'pen' ? 1 : 0.4}
                className="pointer-events-auto cursor-pointer selectable-element"
                onClick={(e) => {
                  if (!isTeacher) return;
                  e.stopPropagation();
                  setSelectedElements([{ id: hId, type: 'highlight' }]);
                }}
                onContextMenu={(e) => {
                  if (!isTeacher) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedElements([{ id: hId, type: 'highlight' }]);
                  setContextMenu({ x: e.clientX, y: e.clientY, elementId: hId, type: 'highlight' });
                }}
                style={{
                  filter: selectedElements.some(el => el.id === hId) ? 'drop-shadow(0 0 4px white)' : 'none'
                }}
              />
            );
          })}
          {session.currentStroke && (
            <polyline
              points={(session.currentStroke.points || []).map((p: any) => `${(p.x * window.innerWidth) / 100},${(p.y * window.innerHeight) / 100}`).join(' ')}
              fill="none"
              stroke={session.currentStroke.color || "rgba(255, 255, 0, 0.4)"}
              strokeWidth={session.currentStroke.width || (session.currentStroke.mode === 'pen' ? 4 : 20)}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={session.currentStroke.mode === 'pen' ? 1 : 0.4}
            />
          )}
        </svg>

        {session.texts?.map((t: any, idx: number) => {
          const tId = t.id || `txt_${t.timestamp || idx}_${idx}`;
          const textContent = t.content !== undefined ? t.content : (t.text || '');
          return (
            <motion.div
              key={tId}
              drag={!t.isFrozen}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const newX = (t.x || 0) + (info.offset.x / window.innerWidth) * 100;
                const newY = (t.y || 0) + (info.offset.y / window.innerHeight) * 100;
                updateElement('text', tId, { x: newX, y: newY });
              }}
              onClick={(e) => {
                if (!isTeacher) return;
                e.stopPropagation();
                setSelectedElements([{ id: tId, type: 'text' }]);
              }}
              onContextMenu={(e) => {
                if (!isTeacher) return;
                e.preventDefault();
                e.stopPropagation();
                setSelectedElements([{ id: tId, type: 'text' }]);
                setContextMenu({ x: e.clientX, y: e.clientY, elementId: tId, type: 'text' });
              }}
              className={`absolute bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg border font-bold arabic-font pointer-events-auto selectable-element ${t.isFrozen ? 'cursor-default' : 'cursor-move'} ${selectedElements.some(el => el.id === tId) ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-white/20'}`}
              style={{ 
                left: `${t.x || 0}%`, 
                top: `${t.y || 0}%`, 
                color: t.color || '#ffffff',
                fontSize: t.fontSize || t.size ? `${t.fontSize || t.size}px` : '16px',
                width: (resizing?.id === tId ? localSize?.width : t.width) || 'auto',
                height: (resizing?.id === tId ? localSize?.height : t.height) || 'auto'
              }}
            >
              {editingElement?.id === tId ? (
                <input 
                  autoFocus
                  className="bg-transparent border-none outline-none w-full h-full"
                  value={editingElement.content}
                  onChange={(e) => setEditingElement({ ...editingElement, content: e.target.value })}
                  onBlur={async () => {
                    await updateElement('text', tId, { content: editingElement.content, text: editingElement.content });
                    setEditingElement(null);
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      await updateElement('text', tId, { content: editingElement.content, text: editingElement.content });
                      setEditingElement(null);
                    }
                  }}
                />
              ) : textContent}
              {!t.isFrozen && (
                <div 
                  className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize bg-white/20 rounded-tl-sm"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setResizing({
                      id: tId,
                      type: 'text',
                      startX: e.clientX,
                      startY: e.clientY,
                      startWidth: t.width || 150,
                      startHeight: t.height || 40
                    });
                  }}
                />
              )}
            </motion.div>
          );
        })}

        {session.stickyNotes?.map((s: any, idx: number) => {
          const sId = s.id || `sticky_${s.timestamp || idx}_${idx}`;
          const noteContent = s.content !== undefined ? s.content : (s.text || '');
          return (
            <motion.div
              key={sId}
              drag={!s.isFrozen}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const newX = (s.x || 0) + (info.offset.x / window.innerWidth) * 100;
                const newY = (s.y || 0) + (info.offset.y / window.innerHeight) * 100;
                updateElement('sticky', sId, { x: newX, y: newY });
              }}
              onClick={(e) => {
                if (!isTeacher) return;
                e.stopPropagation();
                setSelectedElements([{ id: sId, type: 'sticky' }]);
              }}
              onContextMenu={(e) => {
                if (!isTeacher) return;
                e.preventDefault();
                e.stopPropagation();
                setSelectedElements([{ id: sId, type: 'sticky' }]);
                setContextMenu({ x: e.clientX, y: e.clientY, elementId: sId, type: 'sticky' });
              }}
              initial={{ scale: 0, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: s.isFrozen ? 0 : (parseInt(sId) % 10 || 0) - 5 }}
              className={`absolute p-4 rounded-xl shadow-xl pointer-events-auto selectable-element ${s.isFrozen ? 'cursor-default' : 'cursor-move'} ${selectedElements.some(el => el.id === sId) ? 'ring-4 ring-blue-500/50' : ''}`}
              style={{ 
                left: `${s.x || 0}%`, 
                top: `${s.y || 0}%`, 
                width: (resizing?.id === sId ? localSize?.width : s.width) || 180,
                height: (resizing?.id === sId ? localSize?.height : s.height) || 180,
                backgroundColor: s.color || '#fef08a',
                color: '#1e293b'
              }}
            >
              {editingElement?.id === sId ? (
                <textarea 
                  autoFocus
                  className="bg-transparent border-none outline-none w-full h-full resize-none arabic-font"
                  value={editingElement.content}
                  onChange={(e) => setEditingElement({ ...editingElement, content: e.target.value })}
                  onBlur={async () => {
                    await updateElement('sticky', sId, { content: editingElement.content, text: editingElement.content });
                    setEditingElement(null);
                  }}
                />
              ) : (
                <p className="text-sm arabic-font leading-relaxed mb-2">{noteContent}</p>
              )}
              <div className="flex justify-between items-center opacity-40">
                <span className="text-[8px] font-black uppercase tracking-tighter">{s.authorName || 'المعلم'}</span>
                {s.isFrozen && <Lock size={10} />}
              </div>
              {!s.isFrozen && (
                <div 
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-black/5 rounded-tl-md"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setResizing({
                      id: sId,
                      type: 'sticky',
                      startX: e.clientX,
                      startY: e.clientY,
                      startWidth: s.width || 180,
                      startHeight: s.height || 180
                    });
                  }}
                />
              )}
            </motion.div>
          );
        })}

        {session.stickers?.map((st: any, idx: number) => {
          const stId = st.id || `stk_${st.timestamp || idx}_${idx}`;
          const stickerEmoji = st.content || st.emoji || '⭐';
          return (
            <motion.div
              key={stId}
              drag={!st.isFrozen}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const newX = (st.x || 0) + (info.offset.x / window.innerWidth) * 100;
                const newY = (st.y || 0) + (info.offset.y / window.innerHeight) * 100;
                updateElement('sticker', stId, { x: newX, y: newY });
              }}
              onClick={(e) => {
                if (!isTeacher) return;
                e.stopPropagation();
                setSelectedElements([{ id: stId, type: 'sticker' }]);
              }}
              onContextMenu={(e) => {
                if (!isTeacher) return;
                e.preventDefault();
                e.stopPropagation();
                setSelectedElements([{ id: stId, type: 'sticker' }]);
                setContextMenu({ x: e.clientX, y: e.clientY, elementId: stId, type: 'sticker' });
              }}
              className={`absolute pointer-events-auto selectable-element ${st.isFrozen ? 'cursor-default' : 'cursor-move'} ${selectedElements.some(el => el.id === stId) ? 'ring-4 ring-blue-500/30 rounded-full' : ''}`}
              style={{ 
                left: `${st.x || 0}%`, 
                top: `${st.y || 0}%`, 
                width: (resizing?.id === stId ? localSize?.width : st.width) || 80,
                height: (resizing?.id === stId ? localSize?.height : st.height) || 80,
                fontSize: `${((resizing?.id === stId ? localSize?.width : st.width) || 80) * 0.8}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {stickerEmoji}
              {st.isFrozen && <div className="absolute top-0 right-0 text-black/20"><Lock size={12} /></div>}
              {!st.isFrozen && (
                <div 
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-black/5 rounded-tl-md"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setResizing({
                      id: stId,
                      type: 'sticker',
                      startX: e.clientX,
                      startY: e.clientY,
                      startWidth: st.width || 80,
                      startHeight: st.height || 80
                    });
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {contextMenu && (
          <ContextMenu 
            x={contextMenu.x} 
            y={contextMenu.y} 
            onClose={() => setContextMenu(null)}
            onAction={handleAction}
            isBackground={contextMenu.type === 'bg'}
            type={contextMenu.type}
            isFrozen={
              contextMenu.type === 'bg' ? false :
              (session[contextMenu.type === 'text' ? 'texts' : contextMenu.type === 'sticky' ? 'stickyNotes' : contextMenu.type === 'sticker' ? 'stickers' : 'highlights'] || [])
                .find((el: any) => el.id === contextMenu.elementId)?.isFrozen || false
            }
          />
        )}
      </AnimatePresence>

      {/* 4. Timer Overlay */}
      <AnimatePresence>
        {timeLeft !== null && timeLeft > 0 && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto"
          >
            <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                <TimerIcon className="animate-pulse" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Time Remaining</p>
                <p className="text-3xl font-black text-white font-mono leading-none">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Quick Poll */}
      <AnimatePresence>
        {session.poll?.isActive && (
          <motion.div 
            drag
            dragMomentum={false}
            initial={{ scale: 0.9, opacity: 0, x: '-50%', y: '-50%' }}
            animate={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
            exit={{ scale: 0.9, opacity: 0, x: '-50%', y: '-50%' }}
            className="absolute top-1/2 left-1/2 z-[9995] pointer-events-auto"
          >
            <div className="bg-slate-900 border border-white/10 p-5 rounded-[2rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] max-w-sm w-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-40" />
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
                    <BarChart3 size={16} />
                  </div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Poll</span>
                </div>
                {profile?.role === 'teacher' && (
                  <button 
                    onClick={() => updateDoc(doc(db, 'live_sessions', 'global'), { 'poll.isActive': false })}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-rose-500 text-white/90 hover:text-white transition-all shadow border border-white/10 flex items-center justify-center"
                    title="إغلاق التصويت"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <h3 className="text-sm font-bold text-white/90 arabic-font leading-relaxed mb-4 text-center">{session.poll.question}</h3>

              <div className="space-y-2">
                {session.poll.options?.map((option: string, idx: number) => {
                  const votes = Object.values(session.poll?.votes || {}).filter((v: any) => v.option === idx);
                  const voteCount = votes.length;
                  const totalVotes = Object.keys(session.poll?.votes || {}).length;
                  const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                  const hasVoted = user && session.poll?.votes?.[user.uid] !== undefined;

                  return (
                    <div key={`poll_opt_${idx}_${option}`} className="space-y-1">
                      <button
                        disabled={hasVoted && profile?.role !== 'teacher'}
                        onClick={() => handleVote(idx)}
                        className={`
                          w-full p-3 rounded-xl border transition-all relative overflow-hidden group
                          ${hasVoted && session.poll?.votes?.[user.uid]?.option === idx 
                            ? 'border-indigo-500/40 bg-indigo-500/10' 
                            : 'border-white/5 bg-white/5 hover:border-white/10'}
                        `}
                      >
                        <div className="relative z-10 flex justify-between items-center">
                          <span className="font-medium text-white/70 arabic-font text-xs">{option}</span>
                          <span className="text-[10px] font-black text-indigo-400">{Math.round(percentage)}%</span>
                        </div>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className="absolute inset-y-0 left-0 bg-indigo-500/10"
                        />
                      </button>
                      
                      {/* Voter Avatars (WhatsApp Style) */}
                      {voteCount > 0 && (
                        <div className="flex -space-x-1.5 px-1 overflow-hidden">
                          {votes.slice(0, 5).map((v: any, i: number) => (
                            <div 
                              key={v.uid || v.name || `voter_${idx}_${i}`} 
                              title={v.name}
                              className="w-4 h-4 rounded-full border border-slate-900 bg-indigo-500 flex items-center justify-center text-[6px] text-white font-bold uppercase overflow-hidden"
                            >
                              {v.photo ? <img src={v.photo} className="w-full h-full object-cover" /> : (v.name?.[0] || 'S')}
                            </div>
                          ))}
                          {voteCount > 5 && (
                            <div className="w-4 h-4 rounded-full border border-slate-900 bg-slate-800 flex items-center justify-center text-[6px] text-white/60 font-bold">
                              +{voteCount - 5}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Quick Exercise (Magic Wand) */}
      <AnimatePresence>
        {session.exercise?.isActive && (
          <motion.div 
            drag
            dragMomentum={false}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute right-6 bottom-6 z-[9995] pointer-events-auto max-w-[300px] w-full"
          >
            <div className="bg-slate-900 border border-white/10 p-5 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full -mr-12 -mt-12 blur-3xl" />
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-pink-500/10 text-pink-500 rounded-lg flex items-center justify-center">
                    <Wand2 size={16} />
                  </div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Exercise</span>
                </div>
                {profile?.role === 'teacher' && (
                  <button 
                    onClick={() => updateDoc(doc(db, 'live_sessions', 'global'), { 'exercise.isActive': false })}
                    className="text-white/10 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <p className="text-white/80 text-xs font-medium mb-4 arabic-font leading-relaxed">{session.exercise.question_ar}</p>

              <div className="space-y-2">
                {session.exercise.type === 'fill_blank' ? (
                  <input 
                    type="text" 
                    placeholder="اكتب الإجابة هنا..."
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-1 focus:ring-white/40 transition-all arabic-font text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') checkExercise((e.target as HTMLInputElement).value);
                    }}
                  />
                ) : (
                  session.exercise.options?.map((opt: string, idx: number) => (
                    <button
                      key={`exercise_opt_${idx}_${opt}`}
                      onClick={() => checkExercise(opt)}
                      className="w-full p-3 text-right bg-white/5 hover:bg-pink-500/5 border border-white/5 hover:border-pink-500/20 rounded-xl transition-all arabic-font text-xs font-medium text-white/50 hover:text-white"
                    >
                      {opt}
                    </button>
                  ))
                )}
              </div>

              {/* Correct Answers List (Teacher/Student visibility) */}
              {session.exercise.answers && (
                <div className="mt-4 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={10} className="text-emerald-500" />
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-tighter">Correct Answers</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(session.exercise.answers)
                      .filter(([_, a]: [string, any]) => a?.isCorrect)
                      .map(([uid, a]: [string, any], i: number) => (
                        <span key={uid || `ans_${i}`} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[8px] font-bold arabic-font">
                          {a.name || 'طالب'}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {showFeedback && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`mt-3 p-2 rounded-xl flex items-center gap-2 ${
                      exerciseAnswer === session.exercise.correctAnswer 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {exerciseAnswer === session.exercise.correctAnswer 
                      ? <CheckCircle2 size={12} /> 
                      : <AlertCircle size={12} />
                    }
                    <span className="text-[9px] font-bold arabic-font">
                      {exerciseAnswer === session.exercise.correctAnswer ? 'إجابة صحيحة!' : 'حاول مرة أخرى'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 6. Shared File (Cinematic View) - REMOVED DUPLICATE */}
    </div>
  );
};
