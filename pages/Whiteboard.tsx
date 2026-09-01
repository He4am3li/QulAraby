import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, Users, Clock, Sparkles, Plus, ChevronLeft, ChevronRight, 
  Lock, Unlock, Share2, Award, BookOpen, Volume2, Hand, Send, CheckCircle2,
  Copy, RotateCcw, Layout, FileText, Check, ShieldAlert, LogOut,
  Scissors, GitFork, Image as ImageIcon, Mic, History
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../components/AuthProvider';
import { WhiteboardCanvas } from '../components/whiteboard/WhiteboardCanvas';
import { WhiteboardToolbar } from '../components/whiteboard/WhiteboardToolbar';
import { FortuneWheelModal } from '../components/whiteboard/FortuneWheelModal';
import { ArabicToolsModal } from '../components/whiteboard/ArabicToolsModal';
import { WordSlicerModal } from '../components/whiteboard/WordSlicerModal';
import { GrammarTreeModal } from '../components/whiteboard/GrammarTreeModal';
import { MediaStickersModal } from '../components/whiteboard/MediaStickersModal';
import { AudioWaveRecorderModal } from '../components/whiteboard/AudioWaveRecorderModal';
import { SessionHistoryModal } from '../components/whiteboard/SessionHistoryModal';
import { StudentsSidePanel } from '../components/whiteboard/StudentsSidePanel';
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
  const [isStudentsPanelOpen, setIsStudentsPanelOpen] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Student specific response state
  const [studentAnswerText, setStudentAnswerText] = useState('');
  const [studentAnswerSent, setStudentAnswerSent] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Session State
  const [session, setSession] = useState<WhiteboardSessionState>(() => {
    const saved = localStorage.getItem('qul_active_whiteboard_session');
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
      students: {
        'st_1': { id: 'st_1', name: 'أحمد علي', score: 12, isOnline: true, handRaised: false, lastActive: Date.now() },
        'st_2': { id: 'st_2', name: 'سارة محمد', score: 15, isOnline: true, handRaised: true, lastActive: Date.now() },
        'st_3': { id: 'st_3', name: 'عمر خالد', score: 9, isOnline: true, handRaised: false, lastActive: Date.now() },
        'st_4': { id: 'st_4', name: 'نورة المنصور', score: 14, isOnline: true, handRaised: false, lastActive: Date.now() },
      },
      wordBox: ['السفر', 'الوظيفة', 'المستقبل', 'النجاح', 'الطموح', 'اللغة', 'المعرفة'],
      activeActivity: {
        id: 'act_1',
        title: 'نشاط تكوين الجمل السريعة',
        type: 'qa',
        question: 'استخدم كلمة (المُسْتَقْبَل) في جملة مفيدة تدل على طموحك المهني:',
        isActive: true,
        submissions: {
          'st_2': {
            studentId: 'st_2',
            studentName: 'سارة محمد',
            answer: 'أُرِيدُ أَنْ أُصْبِحَ طَبِيبَةً نَاجِحَةً فِي المُسْتَقْبَلِ.',
            score: 5,
            feedback: 'ممتازة جداً يا سارة! إجابة صحيحة نحوياً وتركيبياً.',
            timestamp: Date.now(),
            evaluated: true
          }
        }
      }
    };
  });

  // Save session state locally
  useEffect(() => {
    localStorage.setItem('qul_active_whiteboard_session', JSON.stringify(session));
  }, [session]);

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

    const handleRemoteInsertElement = (e: any) => {
      const el = e.detail?.element;
      if (el) {
        setSession(prev => {
          const updatedPages = [...prev.pages];
          const cur = updatedPages[prev.currentPageIndex] || updatedPages[0];
          updatedPages[prev.currentPageIndex] = {
            ...cur,
            elements: [...(cur.elements || []), el]
          };
          return { ...prev, pages: updatedPages };
        });
      }
    };
    window.addEventListener('qul_insert_whiteboard_element', handleRemoteInsertElement);

    return () => {
      window.removeEventListener('qul_change_whiteboard_theme', handleRemoteThemeChange);
      window.removeEventListener('qul_insert_whiteboard_element', handleRemoteInsertElement);
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
          id: incoming.id || ('el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)),
          type: incoming.type || 'text',
          x: incoming.x !== undefined ? incoming.x : 300,
          y: incoming.y !== undefined ? incoming.y : 180,
          width: incoming.width,
          height: incoming.height,
          color: incoming.color || activeColor,
          strokeWidth: incoming.strokeWidth || activeStrokeWidth,
          text: incoming.text,
          fontSize: incoming.fontSize,
          fontFamily: incoming.fontFamily,
          cardData: incoming.cardData,
          shapeData: incoming.shapeData,
          videoData: incoming.videoData,
          wheelData: incoming.wheelData,
          pdfData: incoming.pdfData,
          emoji: incoming.emoji,
          src: incoming.src,
          scale: incoming.scale || 1,
          createdBy: user?.uid,
          createdByName: profile?.displayName || user?.displayName || 'المعلم'
        };

        setHistory(prev => [...prev, currentPage.elements]);
        setRedoStack([]);
        setSession(prev => {
          const updatedPages = [...prev.pages];
          const curPage = updatedPages[prev.currentPageIndex] || updatedPages[0];
          const existingElements = curPage.elements || [];
          
          // If an element with the exact ID already exists, give it a unique suffix
          if (existingElements.some(el => el.id === completeElement.id)) {
            completeElement.id = `${completeElement.id}_${Math.random().toString(36).slice(2, 7)}`;
          }

          updatedPages[prev.currentPageIndex] = {
            ...curPage,
            elements: [...existingElements, completeElement]
          };
          return { ...prev, pages: updatedPages };
        });
      }
    };

    window.addEventListener('qul_whiteboard_undo', handleRemoteUndo);
    window.addEventListener('qul_whiteboard_redo', handleRemoteRedo);
    window.addEventListener('qul_set_whiteboard_tool', handleRemoteTool);
    window.addEventListener('qul_insert_whiteboard_element', handleRemoteInsertElement);

    return () => {
      window.removeEventListener('qul_whiteboard_undo', handleRemoteUndo);
      window.removeEventListener('qul_whiteboard_redo', handleRemoteRedo);
      window.removeEventListener('qul_set_whiteboard_tool', handleRemoteTool);
      window.removeEventListener('qul_insert_whiteboard_element', handleRemoteInsertElement);
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
    navigator.clipboard.writeText(session.code);
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
      id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type: el.type || 'text',
      x: el.x || (Math.floor(Math.random() * 200) + 150),
      y: el.y || (Math.floor(Math.random() * 150) + 120),
      width: el.width,
      height: el.height,
      color: el.color || activeColor,
      strokeWidth: el.strokeWidth || activeStrokeWidth,
      text: el.text,
      fontSize: el.fontSize,
      cardData: el.cardData,
      src: el.src,
      createdBy: user?.uid,
      createdByName: profile?.displayName || user?.displayName || 'المعلم'
    };
    handleElementsChange([...currentPage.elements, newElem]);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-white font-arabic select-none" dir="rtl">
      {/* Top Header with Falling Letters, Session Code, Timer & Actions */}
      <PageHeader
        title={lang === 'ar' ? 'السبورة التفاعلية' : 'Interactive Whiteboard'}
        icon={PenTool}
        lang={lang}
        rightContent={
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Session Code Badge */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-emerald-500/30 px-3 py-1.5 rounded-2xl">
              <span className="text-xs text-slate-400 font-bold hidden sm:inline">رمز الحصة:</span>
              <span className="font-mono font-black text-emerald-400 tracking-wider text-sm">{session.code}</span>
              <button
                onClick={handleCopyCode}
                className="p-1 text-slate-400 hover:text-emerald-400 rounded-lg transition"
                title="نسخ رمز الحصة"
              >
                {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        }
      />

      {/* Main Classroom Whiteboard Layout */}
      <div className="flex-1 relative overflow-hidden bg-slate-950">
        {/* Interactive Students Side Panel */}
        <StudentsSidePanel
          isOpen={isStudentsPanelOpen}
          onToggle={() => setIsStudentsPanelOpen(!isStudentsPanelOpen)}
          students={session.students}
          isTeacher={isTeacher}
          onScoreChange={handleScoreChange}
          onSelectStudent={(id) => setSelectedStudentId(id)}
          selectedStudentId={selectedStudentId}
          onClearHands={() => {
            setSession(prev => {
              const updated = { ...prev.students };
              Object.keys(updated).forEach(k => { updated[k].handRaised = false; });
              return { ...prev, students: updated };
            });
          }}
        />

        {/* Live Whiteboard Canvas */}
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
        />

        {/* Teacher Floating Toolbar */}
        {isTeacher && (
          <WhiteboardToolbar
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            activeColor={activeColor}
            onChangeColor={setActiveColor}
            activeStrokeWidth={activeStrokeWidth}
            onChangeStrokeWidth={setActiveStrokeWidth}
            activeTheme={currentPage.theme || activeTheme}
            onChangeTheme={handleChangeTheme}
            activeBackground={currentPage.background || 'blank'}
            onChangeBackground={handleChangeBackground}
            onOpenArabicTools={() => setIsArabicToolsOpen(true)}
            onOpenWordSlicer={() => setIsWordSlicerOpen(true)}
            onOpenGrammarTree={() => setIsGrammarTreeOpen(true)}
            onOpenMediaStickers={() => setIsMediaStickersOpen(true)}
            onOpenAudioRecorder={() => setIsAudioRecorderOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenWheel={() => setIsWheelOpen(true)}
            onOpenStudentWorks={() => setIsStudentWorksOpen(true)}
            session={session}
            onClearPage={handleClearPage}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={history.length > 0}
            canRedo={redoStack.length > 0}
            currentPageIndex={session.currentPageIndex}
            totalPages={session.pages.length}
            onPrevPage={() => setSession(prev => ({ ...prev, currentPageIndex: Math.max(0, prev.currentPageIndex - 1) }))}
            onNextPage={() => setSession(prev => ({ ...prev, currentPageIndex: Math.min(prev.pages.length - 1, prev.currentPageIndex + 1) }))}
            onAddNewPage={handleAddNewPage}
            isLocked={session.isLocked}
            onToggleLock={toggleTeacherLock}
            teacherName={profile?.displayName || user?.displayName || 'المعلم'}
            onInsertElement={insertGenericElement}
          />
        )}

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
              const link = document.createElement('a');
              link.download = `سبورة_قل_${session.code}_${new Date().toISOString().slice(0, 10)}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
            }
          }}
        />
      </div>
    </div>
  );
};
