import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, Users, Clock, Sparkles, Plus, ChevronLeft, ChevronRight, 
  Lock, Unlock, Share2, Award, BookOpen, Volume2, Hand, Send, CheckCircle2,
  Copy, RotateCcw, Layout, FileText, Check, ShieldAlert, LogOut,
  Scissors, GitFork, Image as ImageIcon, Mic, History
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../components/AuthProvider';
import { useLiveClassroom } from '../components/LiveClassroomContext';
import { useLiveWhiteboardCanvas } from '../components/useLiveWhiteboardCanvas';
import { useClassroomStudentWork } from '../components/useClassroomStudentWork';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { WhiteboardCanvas } from '../components/whiteboard/WhiteboardCanvas';
import { FortuneWheelModal } from '../components/whiteboard/FortuneWheelModal';
import { ArabicToolsModal } from '../components/whiteboard/ArabicToolsModal';
import { WordSlicerModal } from '../components/whiteboard/WordSlicerModal';
import { GrammarTreeModal } from '../components/whiteboard/GrammarTreeModal';
import { MediaStickersModal } from '../components/whiteboard/MediaStickersModal';
import { AudioWaveRecorderModal } from '../components/whiteboard/AudioWaveRecorderModal';
import { SessionHistoryModal } from '../components/whiteboard/SessionHistoryModal';
import { StudentWorksModal } from '../components/whiteboard/StudentWorksModal';
import { WhiteboardTimer } from '../components/whiteboard/WhiteboardTimer';
import { 
  WhiteboardSessionState, 
  WhiteboardTool, 
  WhiteboardTheme,
  WhiteboardElement, 
  WhiteboardPageData,
  WhiteboardStudent,
  WhiteboardBackgroundType
} from '../types/whiteboard';

export const WhiteboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { sessionId, joinCode, busy: classroomBusy, error: classroomError, start, join, leave, end } = useLiveClassroom();
  const [enteredClassroomCode, setEnteredClassroomCode] = useState('');
  const [lang, setLang] = useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  // Role resolution
  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin';

  // Active Tool & Style
  const [activeTool, setActiveTool] = useState<WhiteboardTool>('pen');
  const [activeTheme, setActiveTheme] = useState<WhiteboardTheme>('blackboard');
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [activeStrokeWidth, setActiveStrokeWidth] = useState(4);

  // Undo/Redo Stacks
  const [history, setHistory] = useState<WhiteboardElement[][]>([]);
  const [redoStack, setRedoStack] = useState<WhiteboardElement[][]>([]);

  // Modals & Panels
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isArabicToolsOpen, setIsArabicToolsOpen] = useState(false);
  const [isWordSlicerOpen, setIsWordSlicerOpen] = useState(false);
  const [isGrammarTreeOpen, setIsGrammarTreeOpen] = useState(false);
  const [isMediaStickersOpen, setIsMediaStickersOpen] = useState(false);
  const [isAudioRecorderOpen, setIsAudioRecorderOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStudentWorksOpen, setIsStudentWorksOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Student specific response state
  const [studentAnswerText, setStudentAnswerText] = useState('');
  const [studentAnswerSent, setStudentAnswerSent] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [draftMode, setDraftMode] = useState(true);
  const [draftPack, setDraftPack] = useState<{key: string; pages: Record<string, WhiteboardElement[]>}>({
    key: '', pages: {}
  });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Session State
  const [session, setSession] = useState<WhiteboardSessionState>(() => {
    const saved = localStorage.getItem('qul_active_whiteboard_session_' + (user?.uid || 'guest'));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.pages) {
          parsed.pages.forEach((p: WhiteboardPageData) => {
            p.elements = (p.elements || []).filter(el => el.id !== 'el_welcome' && el.id !== 'el_word_future' && el.id !== 'el_letter_b');
          });
        }
        return parsed;
      } catch (e) {}
    }
    return {
      id: 'session_' + Date.now(),
      code: 'QUL-' + Math.floor(1000 + Math.random() * 9000),
      title: 'درس اللغة العربية التفاعلي',
      teacherId: user?.uid || 'teacher_1',
      teacherName: profile?.displayName || user?.displayName || 'المعلم',
      createdAt: Date.now(),
      currentPageIndex: 0,
      isLocked: false,
      collaborationMode: true,
      pages: [
        {
          id: 'page_1',
          title: 'الصفحة 1 - التمهيد والحروف',
          background: 'calligraphy_naskh',
          elements: []
        }
      ],
      timer: {
        duration: 60,
        remaining: 60,
        isRunning: false,
        lastUpdated: Date.now()
      },
      students: {},
      wordBox: [],
      activeActivity: null
    };
  });

  const { canvasReady, canvasError } = useLiveWhiteboardCanvas(
    sessionId, user?.uid, isTeacher, session, setSession
  );
  const { submissions, myWork, sending, error: workError, submit, grade } =
    useClassroomStudentWork(sessionId, user?.uid, isTeacher);
  const draftKey = `qul_student_whiteboard_drafts_${user?.uid || 'guest'}_${sessionId || 'offline'}`;

  useEffect(() => {
    let pages: Record<string, WhiteboardElement[]> = {};
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) pages = parsed;
      }
    } catch { /* Ignore corrupted local drafts. */ }
    setDraftPack({ key: draftKey, pages });
    setDraftMode(!sessionId);
    setStudentAnswerSent(false);
    setStudentAnswerText('');
    setSendError(null);
  }, [draftKey, sessionId]);

  useEffect(() => {
    if (draftPack.key !== draftKey) return;
    try { localStorage.setItem(draftKey, JSON.stringify(draftPack.pages)); }
    catch (error) { console.warn('Cannot save private learner draft locally', error); }
  }, [draftPack, draftKey]);

  // Session membership and the active activity come from the server, not the
  // locally seeded demonstration roster. Submissions are a separate feed.
  useEffect(() => {
    if (!sessionId || !user) return;
    return onSnapshot(doc(db, 'live_sessions', sessionId), snapshot => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      const members = data.participants && typeof data.participants === 'object'
        ? Object.keys(data.participants).filter(id => data.participants[id] === true) : [];
      setSession(prev => {
        const students: Record<string, WhiteboardStudent> = {};
        members.forEach((id, index) => {
          students[id] = prev.students[id] || {
            id, name: `طالب ${index + 1}`, score: 0,
            isOnline: false, handRaised: false, lastActive: Date.now()
          };
        });
        const live = data.activeActivity;
        const activeActivity = live && typeof live.question === 'string' ? {
          id: String(live.id || 'live_activity'),
          title: String(live.title || 'نشاط الحصة'),
          type: 'qa' as const,
          question: live.question,
          isActive: live.isActive !== false,
          submissions: {}
        } : null;
        return { ...prev, students, activeActivity };
      });
    }, error => console.error('Could not read classroom membership', error));
  }, [sessionId, user?.uid]);

  useEffect(() => {
    if (!isTeacher || !submissions.length) return;
    setSession(prev => {
      const students = { ...prev.students };
      for (const work of submissions) {
        const existing = students[work.studentId];
        students[work.studentId] = {
          id: work.studentId, name: work.studentName || existing?.name || 'طالب',
          score: work.score ?? existing?.score ?? 0,
          isOnline: existing?.isOnline ?? false,
          handRaised: existing?.handRaised ?? false,
          lastActive: work.timestamp
        };
      }
      return { ...prev, students };
    });
  }, [submissions, isTeacher]);

  // Save session state locally
  useEffect(() => {
    if (user?.uid) localStorage.setItem('qul_active_whiteboard_session_' + user.uid + '_' + (sessionId || 'offline'), JSON.stringify(session));
  }, [session, sessionId, user?.uid]);

  // Real-time tab visibility & focus tracking: turns student presence green when focused on whiteboard page, dark when switching tab/app
  useEffect(() => {
    if (!user) return;
    const updateMyPresence = (isFocused: boolean) => {
      setSession(prev => {
        const myStudent = prev.students[user.uid];
        if (!myStudent) return prev;
        return {
          ...prev,
          students: {
            ...prev.students,
            [user.uid]: {
              ...myStudent,
              isOnline: isFocused,
              lastActive: Date.now()
            }
          }
        };
      });
    };

    const handleVisibilityChange = () => {
      updateMyPresence(document.visibilityState === 'visible');
    };
    const handleFocus = () => updateMyPresence(true);
    const handleBlur = () => updateMyPresence(false);

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [user]);

  // Listen to board surface / theme changes from the floating TeacherToolbar
  useEffect(() => {
    const handleRemoteThemeChange = (e: any) => {
      const newTheme = e.detail?.theme;
      const newBg = e.detail?.background;
      if (newTheme) {
        setActiveTheme(newTheme);
        setSession(prev => {
          const updatedPages = [...prev.pages];
          updatedPages[prev.currentPageIndex] = {
            ...updatedPages[prev.currentPageIndex],
            theme: newTheme,
            ...(newBg ? { background: newBg } : {})
          };
          return { ...prev, pages: updatedPages };
        });

        // Set suitable default drawing color based on theme
        if (newTheme === 'whiteboard' || newTheme === 'notebook') {
          setActiveColor('#1e293b');
        } else {
          setActiveColor('#ffffff');
        }
      }
    };

    window.addEventListener('qul_change_whiteboard_theme', handleRemoteThemeChange);

    return () => {
      window.removeEventListener('qul_change_whiteboard_theme', handleRemoteThemeChange);
    };
  }, []);

  const currentPage = session.pages[session.currentPageIndex] || session.pages[0];

  // Listen to remote undo / redo / tool changes from TeacherToolbar
  useEffect(() => {
    const handleRemoteUndo = () => {
      if (history.length > 0) {
        const previousElements = history[history.length - 1];
        setRedoStack(prev => [...prev, currentPage.elements]);
        setHistory(prev => prev.slice(0, -1));
        setSession(prev => {
          const updatedPages = [...prev.pages];
          updatedPages[prev.currentPageIndex] = {
            ...updatedPages[prev.currentPageIndex],
            elements: previousElements
          };
          return { ...prev, pages: updatedPages };
        });
      }
    };

    const handleRemoteRedo = () => {
      if (redoStack.length > 0) {
        const nextElements = redoStack[redoStack.length - 1];
        setHistory(prev => [...prev, currentPage.elements]);
        setRedoStack(prev => prev.slice(0, -1));
        setSession(prev => {
          const updatedPages = [...prev.pages];
          updatedPages[prev.currentPageIndex] = {
            ...updatedPages[prev.currentPageIndex],
            elements: nextElements
          };
          return { ...prev, pages: updatedPages };
        });
      }
    };

    const handleRemoteTool = (e: any) => {
      if (e.detail?.tool !== undefined) {
        setActiveTool(e.detail.tool);
      }
    };

    const handleRemoteInsertElement = (e: any) => {
      if (e.detail?.element) {
        const incoming = e.detail.element;
        const completeElement: WhiteboardElement = {
          ...incoming,
          id: incoming.id || ('el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)),
          type: incoming.type || 'text',
          x: incoming.x !== undefined ? incoming.x : 300,
          y: incoming.y !== undefined ? incoming.y : 180,
          color: incoming.color || activeColor,
          strokeWidth: incoming.strokeWidth || activeStrokeWidth,
          createdBy: incoming.createdBy || user?.uid,
          createdByName: incoming.createdByName || profile?.displayName || user?.displayName || 'المعلم'
        };

        setHistory(prev => [...prev, currentPage.elements]);
        setRedoStack([]);
        setSession(prev => {
          const updatedPages = [...prev.pages];
          const curPage = updatedPages[prev.currentPageIndex] || updatedPages[0];
          const existingElements = curPage.elements || [];
          
          // Prevent rapid duplicate insertions of the same element ID
          if (existingElements.some(el => el.id === completeElement.id)) {
            return prev;
          }

          updatedPages[prev.currentPageIndex] = {
            ...curPage,
            elements: [...existingElements, completeElement]
          };
          return { ...prev, pages: updatedPages };
        });
      }
    };

    const handleRemoteClear = () => {
      setHistory([]);
      setRedoStack([]);
      setSession(prev => {
        const updatedPages = prev.pages.map(page => ({
          ...page,
          elements: []
        }));
        return {
          ...prev,
          pages: updatedPages,
          activeActivity: prev.activeActivity ? { ...prev.activeActivity, submissions: {} } : undefined
        };
      });
    };

    window.addEventListener('qul_whiteboard_undo', handleRemoteUndo);
    window.addEventListener('qul_whiteboard_redo', handleRemoteRedo);
    window.addEventListener('qul_set_whiteboard_tool', handleRemoteTool);
    window.addEventListener('qul_insert_whiteboard_element', handleRemoteInsertElement);
    window.addEventListener('qul_whiteboard_clear', handleRemoteClear);
    window.addEventListener('qul_whiteboard_clear_all', handleRemoteClear);
    window.addEventListener('qul_whiteboard_reset', handleRemoteClear);

    return () => {
      window.removeEventListener('qul_whiteboard_undo', handleRemoteUndo);
      window.removeEventListener('qul_whiteboard_redo', handleRemoteRedo);
      window.removeEventListener('qul_set_whiteboard_tool', handleRemoteTool);
      window.removeEventListener('qul_insert_whiteboard_element', handleRemoteInsertElement);
      window.removeEventListener('qul_whiteboard_clear', handleRemoteClear);
      window.removeEventListener('qul_whiteboard_clear_all', handleRemoteClear);
      window.removeEventListener('qul_whiteboard_reset', handleRemoteClear);
    };
  }, [history, redoStack, currentPage, activeColor, activeStrokeWidth, user, profile]);

  // Canvas elements update
  const handleElementsChange = (newElements: WhiteboardElement[]) => {
    setHistory(prev => [...prev, currentPage.elements]);
    setRedoStack([]);

    setSession(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[prev.currentPageIndex] = {
        ...updatedPages[prev.currentPageIndex],
        elements: newElements
      };
      return { ...prev, pages: updatedPages };
    });
  };

  const handleChangeTheme = (theme: WhiteboardTheme) => {
    setActiveTheme(theme);
    window.dispatchEvent(new CustomEvent('qul_whiteboard_theme_changed', { detail: { theme } }));
    setSession(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[prev.currentPageIndex] = {
        ...updatedPages[prev.currentPageIndex],
        theme
      };
      return { ...prev, pages: updatedPages };
    });
  };

  const handleChangeBackground = (bg: WhiteboardBackgroundType) => {
    setSession(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[prev.currentPageIndex] = {
        ...updatedPages[prev.currentPageIndex],
        background: bg
      };
      return { ...prev, pages: updatedPages };
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousElements = history[history.length - 1];
    setRedoStack(prev => [...prev, currentPage.elements]);
    setHistory(prev => prev.slice(0, -1));

    setSession(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[prev.currentPageIndex] = {
        ...updatedPages[prev.currentPageIndex],
        elements: previousElements
      };
      return { ...prev, pages: updatedPages };
    });
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextElements = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, currentPage.elements]);
    setRedoStack(prev => prev.slice(0, -1));

    setSession(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[prev.currentPageIndex] = {
        ...updatedPages[prev.currentPageIndex],
        elements: nextElements
      };
      return { ...prev, pages: updatedPages };
    });
  };

  const handleClearPage = () => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من مسح محتويات هذه الصفحة بالكامل؟' : 'Clear all elements on this page?')) {
      handleElementsChange([]);
    }
  };

  const handleAddNewPage = () => {
    setSession(prev => {
      const newPage: WhiteboardPageData = {
        id: 'page_' + (prev.pages.length + 1),
        title: `الصفحة ${prev.pages.length + 1}`,
        background: 'calligraphy_naskh',
        elements: []
      };
      return {
        ...prev,
        pages: [...prev.pages, newPage],
        currentPageIndex: prev.pages.length
      };
    });
  };

  const handleScoreChange = (studentId: string, delta: number) => {
    setSession(prev => {
      const student = prev.students[studentId];
      if (!student) return prev;
      return {
        ...prev,
        students: {
          ...prev.students,
          [studentId]: {
            ...student,
            score: Math.max(0, student.score + delta)
          }
        }
      };
    });
  };

  const toggleTeacherLock = () => {
    setSession(prev => ({
      ...prev,
      isLocked: !prev.isLocked
    }));
  };

  const handleCopyCode = () => {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendStudentAnswer = () => {
    if (!studentAnswerText.trim() || !user) return;
    const stId = user.uid || 'current_student';
    const stName = profile?.displayName || user.displayName || 'أنا';

    setSession(prev => {
      if (!prev.activeActivity) return prev;
      return {
        ...prev,
        activeActivity: {
          ...prev.activeActivity,
          submissions: {
            ...prev.activeActivity.submissions,
            [stId]: {
              studentId: stId,
              studentName: stName,
              answer: studentAnswerText,
              timestamp: Date.now(),
              evaluated: false
            }
          }
        }
      };
    });
    setStudentAnswerSent(true);
  };

  const toggleHandRaise = () => {
    const nextState = !handRaised;
    setHandRaised(nextState);
    if (user) {
      setSession(prev => {
        const current = prev.students[user.uid] || {
          id: user.uid,
          name: profile?.displayName || user.displayName || 'أنا',
          score: 10,
          isOnline: true,
          handRaised: false,
          lastActive: Date.now()
        };
        return {
          ...prev,
          students: {
            ...prev.students,
            [user.uid]: {
              ...current,
              handRaised: nextState
            }
          }
        };
      });
    }
  };

  const insertGenericElement = (el: Partial<WhiteboardElement>) => {
    const newElem: WhiteboardElement = {
      ...el,
      id: el.id || ('el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
      type: el.type || 'text',
      x: el.x !== undefined ? el.x : (Math.floor(Math.random() * 200) + 150),
      y: el.y !== undefined ? el.y : (Math.floor(Math.random() * 150) + 120),
      color: el.color || activeColor,
      strokeWidth: el.strokeWidth || activeStrokeWidth,
      createdBy: el.createdBy || user?.uid,
      createdByName: el.createdByName || profile?.displayName || user?.displayName || 'المعلم'
    };
    handleElementsChange([...currentPage.elements, newElem]);
  };

  return (
    <div id="qul-whiteboard-container" className="flex flex-col h-screen overflow-hidden bg-slate-950 text-white font-arabic select-none" dir="rtl">
      {/* Top Header with Falling Letters, Session Code, Timer & Actions */}
      <PageHeader
        title={lang === 'ar' ? 'السبورة التفاعلية' : 'Interactive Whiteboard'}
        icon={PenTool}
        lang={lang}
        rightContent={
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Server-verified live classroom access, without a global shared session. */}
            {sessionId ? (
              <div className="flex items-center gap-2 bg-slate-900/80 border border-emerald-500/30 px-3 py-1.5 rounded-2xl">
                <span className="text-[10px] text-emerald-400 font-bold">
                  {isTeacher ? 'رمز الحصة:' : 'متصل بالحصة'}
                </span>
                {isTeacher && joinCode && (
                  <>
                    <span className="font-mono font-black text-emerald-400 tracking-wider text-sm" dir="ltr">{joinCode}</span>
                    <button onClick={handleCopyCode} title="نسخ رمز الحصة" className="p-1 text-white/70 hover:text-white">
                      {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </>
                )}
                <button disabled={classroomBusy} onClick={() => void (isTeacher ? end() : leave())}
                  className="text-[9px] font-bold text-rose-300 hover:text-rose-100 border-s border-white/10 ps-2">
                  {isTeacher ? 'إنهاء الحصة' : 'مغادرة'}
                </button>
              </div>
            ) : isTeacher ? (
              <button disabled={classroomBusy} onClick={() => void start()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black px-4 py-2 rounded-xl">
                {classroomBusy ? 'جارٍ الاتصال...' : 'بدء حصة مباشرة'}
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-slate-900/80 border border-emerald-500/30 px-2 py-1 rounded-xl">
                <input value={enteredClassroomCode} onChange={e => setEnteredClassroomCode(e.target.value.toUpperCase().slice(0, 8))}
                  maxLength={8} placeholder="رمز الحصة" aria-label="رمز انضمام الحصة"
                  className="w-28 bg-transparent outline-none font-mono text-emerald-200 text-xs px-1" dir="ltr"/>
                <button disabled={classroomBusy || !/^[A-F0-9]{8}$/.test(enteredClassroomCode)}
                  onClick={() => void join(enteredClassroomCode)}
                  className="bg-emerald-600 px-3 py-1.5 rounded-lg disabled:opacity-40 text-[10px] font-bold">
                  انضمام
                </button>
              </div>
            )}
          </div>
        }
      />

      {classroomError && (
        <p role="alert" className="bg-rose-950/80 text-rose-200 text-xs font-bold text-center py-1">
          {classroomError}
        </p>
      )}
      {/* Main Classroom Whiteboard Layout */}
      <div id="qul-whiteboard-canvas-area" className="flex-1 relative overflow-hidden bg-slate-950">
        {/* Live Whiteboard Canvas with Integrated Compact Student Counter & Real-Time Interaction Under Hijri Date */}
        <WhiteboardCanvas
          elements={currentPage.elements}
          onElementsChange={handleElementsChange}
          activeTool={activeTool}
          activeColor={activeColor}
          activeStrokeWidth={activeStrokeWidth}
          isReadOnly={!isTeacher && session.isLocked}
          theme={currentPage.theme || activeTheme}
          background={currentPage.background}
          currentUserId={user?.uid}
          currentUserName={profile?.displayName || user?.displayName || 'طالب'}
          students={session.students}
          isTeacher={isTeacher}
          onScoreChange={handleScoreChange}
          onSelectStudent={(id) => setSelectedStudentId(id)}
          selectedStudentId={selectedStudentId}
          onThemeChange={(th) => setActiveTheme(th)}
          onClearHands={() => {
            setSession(prev => {
              const updated = { ...prev.students };
              Object.keys(updated).forEach(k => { updated[k].handRaised = false; });
              return { ...prev, students: updated };
            });
          }}
        />

        {/* Student Response & Interaction Drawer (Visible to Student Only) */}
        {!isTeacher && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-4 shadow-2xl w-full max-w-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white arabic-font">
                  {session.activeActivity?.question || 'مساحة الإجابة والتفاعل الخاصة بك'}
                </h4>
              </div>
              <button
                onClick={toggleHandRaise}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  handRaised 
                    ? 'bg-yellow-400 text-slate-950 shadow-lg animate-bounce' 
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                <Hand size={14} />
                {handRaised ? 'يدك مرفوعة ✋' : 'ارفع يدك ✋'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={studentAnswerText}
                onChange={(e) => setStudentAnswerText(e.target.value)}
                placeholder="اكتب إجابتك هنا ليراها المعلم ويقيمها فوراً..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white arabic-font text-sm focus:outline-none focus:border-emerald-500"
                dir="rtl"
              />
              <button
                onClick={handleSendStudentAnswer}
                disabled={!studentAnswerText.trim()}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold arabic-font flex items-center gap-1.5 shadow-lg transition"
              >
                <Send size={14} />
                إرسال الإجابة
              </button>
            </div>

            {studentAnswerSent && (
              <div className="text-[11px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                <CheckCircle2 size={12} />
                تم إرسال إجابتك بنجاح إلى المعلم!
              </div>
            )}
          </div>
        )}

        {/* 1. Fortune Wheel Modal */}
        <FortuneWheelModal
          isOpen={isWheelOpen}
          onClose={() => setIsWheelOpen(false)}
          students={Object.values(session.students)}
          words={session.wordBox}
          onSelectStudent={(stId) => setSelectedStudentId(stId)}
        />

        {/* 1.5 Student Works & Submissions Modal */}
        <StudentWorksModal
          isOpen={isStudentWorksOpen}
          onClose={() => setIsStudentWorksOpen(false)}
          session={session}
          onScoreChange={handleScoreChange}
        />

        {/* 2. Arabic Letters & Vocabulary Modal */}
        <ArabicToolsModal
          isOpen={isArabicToolsOpen}
          onClose={() => setIsArabicToolsOpen(false)}
          onInsertElement={insertGenericElement}
        />

        {/* 3. Word Slicer & Root Extractor Modal */}
        <WordSlicerModal
          isOpen={isWordSlicerOpen}
          onClose={() => setIsWordSlicerOpen(false)}
          onInsertCard={insertGenericElement}
        />

        {/* 4. Interactive Grammar Tree Modal */}
        <GrammarTreeModal
          isOpen={isGrammarTreeOpen}
          onClose={() => setIsGrammarTreeOpen(false)}
          onInsertCard={insertGenericElement}
        />

        {/* 5. Cultural Stickers & PDF/Media Hub Modal */}
        <MediaStickersModal
          isOpen={isMediaStickersOpen}
          onClose={() => setIsMediaStickersOpen(false)}
          onInsertImage={insertGenericElement}
          onSetPdfBackground={(url, pageNum) => {
            // Set pdf background
            insertGenericElement({
              type: 'image',
              src: url,
              x: 100,
              y: 80,
              width: 500,
              height: 400
            });
          }}
        />

        {/* 6. Audio Wave Recorder & Pronunciation Modal */}
        <AudioWaveRecorderModal
          isOpen={isAudioRecorderOpen}
          onClose={() => setIsAudioRecorderOpen(false)}
          onInsertAudioCard={insertGenericElement}
        />

        {/* 7. Session Archive, Export PDF & History Modal */}
        <SessionHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          currentSession={session}
          onRestoreSession={(restored) => setSession(restored)}
          onExportPdf={() => {
            window.print();
          }}
          onExportImage={() => {
            const canvas = document.querySelector('#whiteboard-canvas-container canvas') as HTMLCanvasElement;
            if (canvas) {
              const exportCanvas = document.createElement('canvas');
              exportCanvas.width = canvas.width;
              exportCanvas.height = canvas.height;
              const ctx = exportCanvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(canvas, 0, 0);
                const logoImg = new Image();
                logoImg.crossOrigin = 'anonymous';
                logoImg.onload = () => {
                  const logoSize = Math.max(48, Math.min(80, exportCanvas.width * 0.06));
                  const padding = 24;
                  const x = exportCanvas.width - logoSize - padding;
                  const y = exportCanvas.height - logoSize - padding;
                  ctx.shadowColor = 'rgba(0,0,0,0.2)';
                  ctx.shadowBlur = 8;
                  ctx.drawImage(logoImg, x, y, logoSize, logoSize);
                  const link = document.createElement('a');
                  link.download = `سبورة_قل_${session.code}_${new Date().toISOString().slice(0, 10)}.png`;
                  link.href = exportCanvas.toDataURL('image/png');
                  link.click();
                };
                logoImg.onerror = () => {
                  const link = document.createElement('a');
                  link.download = `سبورة_قل_${session.code}_${new Date().toISOString().slice(0, 10)}.png`;
                  link.href = canvas.toDataURL('image/png');
                  link.click();
                };
                logoImg.src = '/Logo.png';
              } else {
                const link = document.createElement('a');
                link.download = `سبورة_قل_${session.code}_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
              }
            }
          }}
        />
      </div>
    </div>
  );
};
