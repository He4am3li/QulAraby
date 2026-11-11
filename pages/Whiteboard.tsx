import React, { useState, useEffect, useRef } from 'react';
import { collection, doc, getDoc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { createWhiteboardCode, isWhiteboardCode, normalizeWhiteboardCode, whiteboardCloudPayload, mergeWhiteboardCloud, isWhiteboardPayloadSizeSafe } from '../services/whiteboardCloud';
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
import { captureWhiteboardScreenshot } from '../services/mediaRecordingService';
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

  // Session State
  const [session, setSession] = useState<WhiteboardSessionState>(() => {
    const saved = isTeacher && user?.uid
      ? (localStorage.getItem('qul_active_whiteboard_session_' + user.uid) || localStorage.getItem('qul_active_whiteboard_session'))
      : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.pages) {
          parsed.pages.forEach((p: WhiteboardPageData) => {
            p.elements = (p.elements || []).filter(el => el.id !== 'el_welcome' && el.id !== 'el_word_future' && el.id !== 'el_letter_b');
          });
        }
        // Strip old demo records from sessions created before the fix.
        // These IDs were reserved by the demo initializer, never by Firebase Auth.
        if (parsed.students) {
          ['st_1', 'st_2', 'st_3', 'st_4'].forEach(id => delete parsed.students[id]);
        }
        if (parsed.activeActivity?.submissions) {
          delete parsed.activeActivity.submissions['st_2'];
        }
        if (parsed.activeActivity?.id === 'act_1' && parsed.activeActivity?.title === 'نشاط تكوين الجمل السريعة') {
          parsed.activeActivity.isActive = false;
          parsed.activeActivity.title = 'نشاط الفصل';
          parsed.activeActivity.question = 'سيظهر هنا سؤال المعلم عند بدء النشاط.';
        }
        if (parsed.teacherId === user?.uid && Array.isArray(parsed.pages) && parsed.pages.length) {
          if (!isWhiteboardCode(parsed.code)) parsed.code = createWhiteboardCode();
          parsed.id = parsed.code;
          return parsed;
        }
      } catch (e) {}
    }
    return {
      id: 'new_session',
      code: createWhiteboardCode(),
      title: 'درس اللغة العربية التفاعلي',
      teacherId: user?.uid || '',
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

      },
      wordBox: ['السفر', 'الوظيفة', 'المستقبل', 'النجاح', 'الطموح', 'اللغة', 'المعرفة'],
      activeActivity: {
        id: 'act_1',
        title: 'نشاط الفصل',
        type: 'qa',
        question: 'سيظهر هنا سؤال المعلم عند بدء النشاط.',
        isActive: false,
        submissions: {}
      }
    };
  });

  // Keep browser recovery strictly scoped to the signed-in teacher.
  useEffect(() => {
    if (!isTeacher || !user?.uid) return;
    try {
      localStorage.setItem('qul_active_whiteboard_session_' + user.uid, JSON.stringify(session));
    } catch (error) {
      console.warn('Local whiteboard recovery unavailable:', error);
    }
  }, [session, isTeacher, user?.uid]);

  const sessionRef = useRef(session);
  sessionRef.current = session;
  const publishedFingerprint = useRef('');
  const [cloudCode, setCloudCode] = useState<string>(isTeacher ? session.code : '');
  const [joinedCode, setJoinedCode] = useState<string>(() => {
    if (isTeacher) return '';
    const hashQuery = window.location.hash.split('?')[1] || '';
    return normalizeWhiteboardCode(new URLSearchParams(hashQuery).get('session') || '');
  });
  const [joinInput, setJoinInput] = useState(joinedCode);
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('جارٍ الاتصال بالحصة...');
  const [isSendingAnswer, setIsSendingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState('');
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false);
  const [joinAttempt, setJoinAttempt] = useState(0);
  const [questionDraft, setQuestionDraft] = useState('');
  const classroomSchoolId = profile?.schoolId || 'independent';

  // Teachers own the authoritative board document. Every student observes the same code.
  useEffect(() => {
    if (!isTeacher || !user?.uid) return;
    let cancelled = false;
    let unsubscribe = () => {};
    const code = sessionRef.current.code;
    const boardRef = doc(db, 'whiteboard_sessions', code);
    setCloudCode(code);
    setCloudReady(false);
    setCloudStatus('جارٍ فتح حصة المعلم...');
    const initialize = async () => {
      const existing = await getDoc(boardRef);
      if (!existing.exists()) {
        const base = { ...sessionRef.current, teacherId: user.uid, id: code, code };
        await setDoc(boardRef, {
          ...whiteboardCloudPayload(base, classroomSchoolId),
          updatedAt: serverTimestamp(),
        });
      } else if (existing.data().teacherId !== user.uid) {
        throw new Error('رمز الحصة مملوك لمعلم آخر.');
      }
      if (cancelled) return;
      unsubscribe = onSnapshot(boardRef, (snapshot) => {
        const remote = snapshot.data();
        if (!remote) {
          setCloudStatus('انتهت الحصة أو حُذفت.'); setCloudReady(false);
          return;
        }
        const normalized = whiteboardCloudPayload(remote as WhiteboardSessionState, remote.schoolId);
        publishedFingerprint.current = JSON.stringify(normalized);
        setSession(previous => mergeWhiteboardCloud(previous, normalized));
        setCloudReady(true);
        setCloudStatus('الحصة متصلة');
      }, (error) => {
        console.error('Whiteboard classroom subscription failed:', error);
        setCloudReady(false);
        setCloudStatus('تعذر استقبال تحديثات الحصة.');
      });
    };
    void initialize().catch(error => {
      console.error('Whiteboard classroom initialization failed:', error);
      if (!cancelled) setCloudStatus('تعذر إنشاء الحصة السحابية، تحقق من صلاحيات المدرسة.');
    });
    return () => { cancelled = true; unsubscribe(); };
  }, [isTeacher, user?.uid, classroomSchoolId]);

  // Firestore is authoritative for published teacher changes. Debounce strokes and
  // never rewrite attendance or student answers into the teacher document.
  useEffect(() => {
    if (!isTeacher || !cloudReady || !cloudCode || !user?.uid) return;
    const payload = whiteboardCloudPayload(session, classroomSchoolId);
    const fingerprint = JSON.stringify(payload);
    if (fingerprint === publishedFingerprint.current) return;
    if (!isWhiteboardPayloadSizeSafe(payload)) {
      setCloudStatus('الحصة كبيرة جدًا للحفظ، قلل الصور أو صفحات الرسم.');
      return;
    }
    const timer = window.setTimeout(() => {
      setCloudStatus('جارٍ حفظ التعديلات...');
      void setDoc(doc(db, 'whiteboard_sessions', cloudCode), {
        ...payload,
        updatedAt: serverTimestamp(),
      }, { merge: true }).then(() => {
        publishedFingerprint.current = fingerprint;
        setCloudStatus('حُفظت التعديلات');
      }).catch(error => {
        console.error('Whiteboard sync write failed:', error);
        setCloudStatus('تعذر حفظ التعديلات سحابيًا.');
      });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [session, cloudReady, cloudCode, classroomSchoolId, isTeacher, user?.uid]);

  // Students cannot enumerate class sessions. They enter the exact code, and
  // Firestore checks approval and school membership before granting access.
  useEffect(() => {
    if (isTeacher || !user?.uid || !joinedCode) return;
    if (!profile?.schoolId || !isWhiteboardCode(joinedCode)) {
      setCloudStatus('أدخل رمز حصة صحيحًا من معلم مدرستك.');
      setCloudReady(false);
      return;
    }
    let cancelled = false;
    let unsubscribe = () => {};
    setCloudReady(false);
    setCloudStatus('جارٍ التحقق من رمز الحصة...');
    const boardRef = doc(db, 'whiteboard_sessions', joinedCode);
    const personRef = doc(db, 'whiteboard_sessions', joinedCode, 'participants', user.uid);
    const initialize = async () => {
      const result = await getDoc(boardRef);
      if (!result.exists() || result.data().schoolId !== profile.schoolId) {
        throw new Error('لم تُعثر على حصة متاحة لهذه المدرسة.');
      }
      const myPresence = await getDoc(personRef);
      if (!myPresence.exists()) {
        await setDoc(personRef, {
          id: user.uid, name: profile.displayName || user.displayName || 'طالب',
          score: 0, handRaised: false, isOnline: true, lastActive: Date.now(),
        });
      } else {
        setHandRaised(!!myPresence.data().handRaised);
        await updateDoc(personRef, { isOnline: true, lastActive: Date.now() });
      }
      if (cancelled) return;
      setCloudCode(joinedCode);
      unsubscribe = onSnapshot(boardRef, snapshot => {
        const remote = snapshot.data();
        if (!remote) {
          setCloudStatus('أُغلقت الحصة.');
          setCloudReady(false); return;
        }
        const normalized = whiteboardCloudPayload(remote as WhiteboardSessionState, remote.schoolId);
        setSession(previous => mergeWhiteboardCloud(previous, normalized));
        setCloudReady(true);
        setCloudStatus('متصل بحصة المعلم');
      }, error => {
        console.error('Student whiteboard subscription failed:', error);
        setCloudReady(false);
        setCloudStatus('انقطع الاتصال بالحصة.');
      });
    };
    void initialize().catch(error => {
      console.error('Whiteboard student join rejected:', error);
      if (!cancelled) { setCloudReady(false); setCloudStatus('تعذر الانضمام، تأكد من الرمز واعتماد حسابك ومدرستك.'); }
    });
    return () => { cancelled = true; unsubscribe(); };
  }, [isTeacher, joinedCode, joinAttempt, user?.uid, profile?.schoolId]);

  // Each learner occupies their own Firestore subdocument, preventing collisions
  // when a class of 30 students raises hands or submits answers together.
  useEffect(() => {
    if (!isTeacher || !cloudReady || !cloudCode) return;
    const participants = collection(db, 'whiteboard_sessions', cloudCode, 'participants');
    const answers = collection(db, 'whiteboard_sessions', cloudCode, 'answers');
    const unsubscribeParticipants = onSnapshot(participants, snapshot => {
      const people: WhiteboardSessionState['students'] = {};
      snapshot.docs.forEach(item => {
        const entry = item.data();
        people[item.id] = {
          id: item.id, name: String(entry.name || 'طالب'),
          score: Number(entry.score || 0), handRaised: !!entry.handRaised,
          isOnline: !!entry.isOnline && Date.now() - Number(entry.lastActive || 0) < 90000,
          lastActive: Number(entry.lastActive || 0),
        };
      });
      setSession(previous => ({ ...previous, students: people }));
      window.dispatchEvent(new CustomEvent('qul_whiteboard_students_updated', { detail: { students: people } }));
    }, error => console.error('Student attendance sync failed:', error));
    const unsubscribeAnswers = onSnapshot(answers, snapshot => {
      setSession(previous => {
        if (!previous.activeActivity) return previous;
        const submissions: NonNullable<WhiteboardSessionState['activeActivity']>['submissions'] = {};
        snapshot.docs.forEach(item => {
          const answer = item.data();
          if (answer.activityId !== previous.activeActivity?.id) return;
          submissions[item.id] = {
            studentId: item.id, studentName: String(answer.studentName || 'طالب'),
            answer: String(answer.answer || ''), timestamp: Number(answer.timestamp || 0),
            evaluated: !!answer.evaluated,
            score: typeof answer.score === 'number' ? answer.score : undefined,
            feedback: typeof answer.feedback === 'string' ? answer.feedback : undefined,
          };
        });
        return { ...previous, activeActivity: { ...previous.activeActivity, submissions } };
      });
    }, error => console.error('Student answer sync failed:', error));
    return () => { unsubscribeParticipants(); unsubscribeAnswers(); };
  }, [isTeacher, cloudReady, cloudCode]);

  // Presence is updated on focus and periodically. No false online indicator
  // should remain forever when the browser disconnects unexpectedly.
  useEffect(() => {
    if (isTeacher || !cloudReady || !cloudCode || !user?.uid) return;
    const participantRef = doc(db, 'whiteboard_sessions', cloudCode, 'participants', user.uid);
    const announce = () => {
      void updateDoc(participantRef, {
        isOnline: document.visibilityState === 'visible',
        lastActive: Date.now(),
      }).catch(error => console.warn('Unable to update board presence:', error));
    };
    announce();
    const timer = window.setInterval(announce, 30000);
    document.addEventListener('visibilitychange', announce);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', announce);
      void updateDoc(participantRef, { isOnline: false, lastActive: Date.now() }).catch(() => {});
    };
  }, [isTeacher, cloudReady, cloudCode, user?.uid]);

  const beginClassQuestion = () => {
    if (!isTeacher || !questionDraft.trim() || !cloudReady) return;
    const question = questionDraft.trim();
    setSession(previous => ({
      ...previous,
      activeActivity: {
        id: 'act_' + Date.now(), title: 'سؤال الحصة',
        type: 'qa', question, isActive: true, submissions: {},
      },
    }));
    setIsQuestionEditorOpen(false);
    setQuestionDraft('');
  };


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

  // Route toolbar commands to live page controls.
  useEffect(() => {
    const openMedia = () => setIsMediaStickersOpen(true);
    const openWorks = () => setIsStudentWorksOpen(true);
    const submitAnswer = () => document.getElementById('qul-student-answer-submit')?.click();
    const focusAnswer = () => document.getElementById('qul-student-answer-input')?.focus();
    const raiseHand = () => document.getElementById('qul-student-raise-hand')?.click();
    const applyLock = (event: Event) => {
      const locked = (event as CustomEvent<{ isLocked?: boolean }>).detail?.isLocked;
      if (typeof locked === 'boolean') setSession(prev => ({ ...prev, isLocked: locked }));
    };
    window.addEventListener('qul_open_whiteboard_media', openMedia);
    window.addEventListener('qul_open_whiteboard_student_works', openWorks);
    window.addEventListener('qul_student_submit_answer', submitAnswer);
    window.addEventListener('qul_student_focus_answer', focusAnswer);
    window.addEventListener('qul_student_raise_hand', raiseHand);
    window.addEventListener('qul_whiteboard_toggle_lock', applyLock);
    return () => {
      window.removeEventListener('qul_open_whiteboard_media', openMedia);
      window.removeEventListener('qul_open_whiteboard_student_works', openWorks);
      window.removeEventListener('qul_student_submit_answer', submitAnswer);
      window.removeEventListener('qul_student_focus_answer', focusAnswer);
      window.removeEventListener('qul_student_raise_hand', raiseHand);
      window.removeEventListener('qul_whiteboard_toggle_lock', applyLock);
    };
  }, []);

  const currentPage = session.pages[session.currentPageIndex] || session.pages[0];

  useEffect(() => {
    setStudentAnswerSent(false);
    setStudentAnswerText('');
    setAnswerError('');
  }, [session.activeActivity?.id]);

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
    if (!isTeacher || !cloudReady) return;
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
    if (!isTeacher || !cloudReady || !cloudCode) return;
    const student = sessionRef.current.students[studentId];
    if (!student) return;
    const score = Math.max(0, student.score + delta);
    void updateDoc(doc(db, 'whiteboard_sessions', cloudCode, 'participants', studentId), {
      score,
    }).catch(error => {
      console.error('Score update failed:', error);
      setCloudStatus('تعذر تسجيل النقاط، أعد المحاولة.');
    });
  };

  // Cross-component classroom events use real Firestore-backed actions.
  useEffect(() => {
    if (!isTeacher) return;
    const onAward = (event: Event) => {
      const { studentId, delta } = (event as CustomEvent<{ studentId?: string; delta?: number }>).detail || {};
      if (studentId && Number.isInteger(delta)) handleScoreChange(studentId, delta!);
    };
    const onActivity = (event: Event) => {
      const details = (event as CustomEvent<{ question?: string; options?: string[] }>).detail;
      const question = details?.question?.trim();
      if (!question || !cloudReady) return;
      const options = Array.isArray(details?.options)
        ? details.options.map(option => String(option).trim()).filter(Boolean).slice(0, 6)
        : [];
      setSession(previous => ({
        ...previous,
        activeActivity: {
          id: 'act_' + Date.now(),
          title: options.length > 1 ? 'تصويت الحصة' : 'سؤال الحصة',
          type: options.length > 1 ? 'mcq' : 'qa',
          question, ...(options.length > 1 ? { options } : {}),
          isActive: true, submissions: {},
        },
      }));
    };
    window.addEventListener('qul_whiteboard_award_student', onAward);
    window.addEventListener('qul_whiteboard_start_activity', onActivity);
    return () => {
      window.removeEventListener('qul_whiteboard_award_student', onAward);
      window.removeEventListener('qul_whiteboard_start_activity', onActivity);
    };
  }, [isTeacher, cloudReady, cloudCode, session.students]);

  const toggleTeacherLock = () => {
    setSession(prev => ({
      ...prev,
      isLocked: !prev.isLocked
    }));
  };

  const handleCopyCode = () => {
    if (!cloudReady) return;
    void navigator.clipboard.writeText(session.code).then(() => {
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    }).catch(() => setCloudStatus('تعذر نسخ رمز الحصة.'));
  };

  const handleSendStudentAnswer = async () => {
    if (isTeacher || !cloudReady || !cloudCode || !studentAnswerText.trim() ||
        !user?.uid || !session.activeActivity?.isActive || isSendingAnswer) return;
    if (!navigator.onLine) {
      setAnswerError('الاتصال بالإنترنت غير متاح، لم تُرسل الإجابة.');
      return;
    }
    setIsSendingAnswer(true);
    setStudentAnswerSent(false);
    setAnswerError('');
    try {
      await setDoc(doc(db, 'whiteboard_sessions', cloudCode, 'answers', user.uid), {
        studentId: user.uid,
        studentName: profile?.displayName || user.displayName || 'طالب',
        answer: studentAnswerText.trim(),
        activityId: session.activeActivity.id,
        timestamp: Date.now(),
      }, { merge: true });
      setStudentAnswerSent(true);
    } catch (error) {
      console.error('Whiteboard submission failed:', error);
      setAnswerError('تعذر تسليم الإجابة، تأكد من الاتصال وصلاحية الحصة.');
    } finally {
      setIsSendingAnswer(false);
    }
  };

  const toggleHandRaise = () => {
    if (isTeacher || !cloudReady || !cloudCode || !user?.uid) return;
    const nextState = !handRaised;
    setHandRaised(nextState);
    void updateDoc(doc(db, 'whiteboard_sessions', cloudCode, 'participants', user.uid), {
      handRaised: nextState, lastActive: Date.now(),
    }).catch(error => {
      console.error('Hand raise failed:', error);
      setHandRaised(!nextState);
      setAnswerError('تعذر تحديث حالة رفع اليد.');
    });
  };

  const insertGenericElement = (el: Partial<WhiteboardElement>) => {
    if (!isTeacher || !cloudReady) return;
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
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`hidden md:inline text-[10px] font-bold ${cloudReady ? 'text-emerald-400' : 'text-amber-300'}`} role="status">
              {cloudStatus}
            </span>
            {isTeacher && (
              <>
                <button
                  onClick={() => setIsQuestionEditorOpen(previous => !previous)}
                  disabled={!cloudReady}
                  className="rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-bold text-emerald-200 disabled:opacity-40"
                >سؤال</button>
                <button
                  onClick={() => setIsStudentWorksOpen(true)}
                  className="rounded-xl border border-white/15 bg-white/5 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-bold text-white"
                >أعمال</button>
              </>
            )}
            {/* Session Code Badge */}
            {(isTeacher || cloudReady) && <div className="flex items-center gap-1.5 bg-slate-900/80 border border-emerald-500/30 px-3 py-1.5 rounded-2xl">
              <span className="text-xs text-slate-400 font-bold hidden sm:inline">رمز الحصة:</span>
              <span className="font-mono font-black text-emerald-400 tracking-tight text-[10px] sm:text-sm">{session.code}</span>
              <button
                onClick={handleCopyCode}
                className="p-1 text-slate-400 hover:text-emerald-400 rounded-lg transition"
                title="نسخ رمز الحصة"
              >
                {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>}
          </div>
        }
      />

      {/* Main Classroom Whiteboard Layout */}
      <div id="qul-whiteboard-canvas-area" className="flex-1 relative overflow-hidden bg-slate-950">
        {isTeacher && isQuestionEditorOpen && (
          <form onSubmit={(e) => { e.preventDefault(); beginClassQuestion(); }} className="absolute top-3 left-3 z-50 w-[min(92vw,420px)] rounded-2xl border border-emerald-500/40 bg-slate-900/95 p-3 shadow-xl backdrop-blur-xl">
            <label htmlFor="qul-class-question" className="text-xs text-emerald-100 font-bold">سؤال الحصة للطلاب</label>
            <input
              id="qul-class-question"
              value={questionDraft}
              onChange={event => setQuestionDraft(event.target.value)}
              placeholder="اكتب السؤال الذي تريد طرحه..."
              maxLength={1000}
              className="mt-2 w-full rounded-lg border border-white/20 bg-slate-950 p-2 text-sm text-white"
            />
            <div className="mt-2 flex gap-2">
              <button type="submit" disabled={!questionDraft.trim() || !cloudReady} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 disabled:opacity-40">بدء النشاط</button>
              <button type="button" onClick={() => setIsQuestionEditorOpen(false)} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white">إلغاء</button>
              {session.activeActivity?.isActive && (
                <button type="button" onClick={() => {
                  setSession(previous => previous.activeActivity ? {
                    ...previous,
                    activeActivity: { ...previous.activeActivity, isActive: false },
                  } : previous);
                  setIsQuestionEditorOpen(false);
                }} className="rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-200">إنهاء السؤال</button>
              )}
            </div>
          </form>
        )}
        {!isTeacher && !cloudReady && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950 p-5">
            <div className="w-full max-w-md rounded-3xl border border-emerald-500/25 bg-slate-900/90 p-6 text-center shadow-2xl">
              <h2 className="text-xl font-black text-white">الانضمام إلى سبورة المعلم</h2>
              <p className="my-3 text-sm text-slate-300">أدخل رمز الحصة الذي حصلت عليه من معلمك في المدرسة.</p>
              <form onSubmit={event => {
                event.preventDefault();
                const entered = normalizeWhiteboardCode(joinInput);
                if (!isWhiteboardCode(entered)) {
                  setCloudStatus('رمز الحصة غير صحيح. مثال: QUL-XXXXXXXX');
                  return;
                }
                setJoinedCode(entered);
                setJoinAttempt(value => value + 1);
              }}>
                <input
                  aria-label="رمز الحصة"
                  value={joinInput}
                  onChange={event => setJoinInput(event.target.value.toUpperCase())}
                  placeholder="QUL-XXXXXXXX"
                  maxLength={12}
                  dir="ltr"
                  className="w-full rounded-xl border border-white/20 bg-slate-950 p-3 text-center font-mono text-lg text-emerald-300"
                />
                <button type="submit" className="mt-3 w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950">الانضمام للحصة</button>
              </form>
              <p className="mt-3 text-xs text-amber-200" role="status">{cloudStatus}</p>
            </div>
          </div>
        )}
        {/* Live Whiteboard Canvas with Integrated Compact Student Counter & Real-Time Interaction Under Hijri Date */}
        {(isTeacher || cloudReady) && <WhiteboardCanvas
          elements={currentPage.elements}
          onElementsChange={handleElementsChange}
          activeTool={activeTool}
          activeColor={activeColor}
          activeStrokeWidth={activeStrokeWidth}
          isReadOnly={!isTeacher || !cloudReady}
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
            if (!isTeacher || !cloudReady || !cloudCode) return;
            const raisedIds = Object.values(sessionRef.current.students).filter(s => s.handRaised).map(s => s.id);
            void Promise.all(raisedIds.map(studentId =>
              updateDoc(doc(db, 'whiteboard_sessions', cloudCode, 'participants', studentId), {
                handRaised: false,
              })
            )).catch(error => {
              console.error('Clear student hands failed:', error);
              setCloudStatus('تعذر خفض جميع الأيدي.');
            });
          }}
        />}

        {/* Student Response & Interaction Drawer (Visible to Student Only) */}
        {!isTeacher && cloudReady && (
          <div className="fixed bottom-20 sm:bottom-20 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-3 sm:p-4 shadow-2xl w-[calc(100%-1rem)] max-w-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white arabic-font">
                  {session.activeActivity?.question || 'مساحة الإجابة والتفاعل الخاصة بك'}
                </h4>
              </div>
              <button
                id="qul-student-raise-hand"
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

            {session.activeActivity?.isActive && session.activeActivity.type === 'mcq' && session.activeActivity.options && (
              <div className="mb-2 grid grid-cols-2 gap-1.5">
                {session.activeActivity.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => { setStudentAnswerText(option); setStudentAnswerSent(false); }}
                    className={`rounded-lg border p-2 text-xs font-bold transition ${
                      studentAnswerText === option
                        ? 'border-emerald-400 bg-emerald-500/20 text-white'
                        : 'border-white/15 bg-white/5 text-slate-200'
                    }`}
                  >{option}</button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                id="qul-student-answer-input"
                type="text"
                value={studentAnswerText}
                onChange={(e) => { setStudentAnswerText(e.target.value); setStudentAnswerSent(false); setAnswerError(''); }}
                placeholder={session.activeActivity?.isActive ? 'اكتب إجابتك هنا...' : 'في انتظار أن يبدأ المعلم النشاط...'}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white arabic-font text-sm focus:outline-none focus:border-emerald-500"
                dir="rtl"
              />
              <button
                id="qul-student-answer-submit"
                onClick={handleSendStudentAnswer}
                disabled={!studentAnswerText.trim() || !session.activeActivity?.isActive || isSendingAnswer || !cloudReady}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold arabic-font flex items-center gap-1.5 shadow-lg transition"
              >
                <Send size={14} />
                {isSendingAnswer ? 'جارٍ تسليم الإجابة...' : 'إرسال الإجابة'}
              </button>
            </div>

            {studentAnswerSent && (
              <div className="text-[11px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                <CheckCircle2 size={12} />
                تم تسجيل الإجابة في الحصة بنجاح.
              </div>
            )}
            {answerError && <p className="mt-1 text-xs font-semibold text-rose-300" role="alert">{answerError}</p>}
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
            void captureWhiteboardScreenshot().catch(error => {
              console.error('Whiteboard image export failed:', error);
            });
          }}
        />
      </div>
    </div>
  );
};
