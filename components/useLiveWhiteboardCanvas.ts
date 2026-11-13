import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { WhiteboardSessionState, WhiteboardPageData } from '../types/whiteboard';
import { pickCanvasState } from '../services/liveWhiteboardState.mjs';

const EMPTY_PAGE: WhiteboardPageData = {
  id: 'page_1', title: 'الصفحة الأولى', background: 'calligraphy_naskh', elements: []
};
const emptySharedState = () => ({
  pages: [{ ...EMPTY_PAGE, elements: [] }],
  currentPageIndex: 0,
  isLocked: false,
  wordBox: [] as string[],
  title: 'درس اللغة العربية التفاعلي'
});

/**
 * Room teacher is the single writer for the classroom canvas. Learners only
 * subscribe. Submissions and learner drafts live on separate paths.
 */
export function useLiveWhiteboardCanvas(
  sessionId: string | null,
  uid: string | undefined,
  isTeacher: boolean,
  session: WhiteboardSessionState,
  setSession: Dispatch<SetStateAction<WhiteboardSessionState>>
) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRemote = useRef('');
  const pending = useRef('');
  const initialized = useRef(false);

  useEffect(() => {
    lastRemote.current = '';
    pending.current = '';
    initialized.current = false;
    setReady(false);
    setError(null);
    if (!sessionId || !uid) return;

    setSession(previous => ({
      ...previous, ...emptySharedState(), students: {}, activeActivity: null
    }));
    const ref = doc(db, 'live_sessions', sessionId, 'canvas', 'main');
    let alive = true;
    const stop = onSnapshot(ref, async snapshot => {
      if (!alive) return;
      if (!snapshot.exists()) {
        if (isTeacher && !initialized.current) {
          initialized.current = true;
          try {
            await setDoc(ref, {
              teacherId: uid, ...emptySharedState(), updatedAt: serverTimestamp()
            });
          } catch (err) {
            if (alive) {
              initialized.current = false;
              setError('تعذّر إنشاء اللوحة المشتركة، أعد محاولة فتح الحصة.');
              console.error('Classroom canvas initialization failed', err);
            }
          }
        }
        return;
      }
      try {
        const shared = pickCanvasState(snapshot.data());
        const signature = JSON.stringify(shared);
        // Avoid overwriting unsent teacher edits with an earlier snapshot.
        if (isTeacher && pending.current && pending.current !== signature) return;
        lastRemote.current = signature;
        setSession(previous => {
          try {
            if (JSON.stringify(pickCanvasState(previous)) === signature) return previous;
          } catch { /* A local unsaved layout may not be valid. */ }
          return { ...previous, ...shared };
        });
        setReady(true);
        setError(null);
      } catch (err) {
        setError('تعذّر قراءة بيانات السبورة المشتركة.');
        console.error('Invalid classroom canvas', err);
      }
    }, err => {
      setReady(false);
      setError('تعذّر الاتصال بسبورة الحصة. تأكد من صلاحية الانضمام.');
      console.error('Classroom canvas subscription failed', err);
    });
    return () => { alive = false; stop(); };
  }, [sessionId, uid, isTeacher, setSession]);

  // Only teacher changes to the actual board content are broadcast.
  // Presence, submitted work and local study data are never written here.
  useEffect(() => {
    if (!sessionId || !uid || !isTeacher || !ready) return;
    let shared: ReturnType<typeof pickCanvasState>;
    try {
      shared = pickCanvasState(session);
    } catch (err) {
      setError('السبورة تجاوزت حجم المزامنة المسموح. احفظ الملفات الكبيرة خارج السبورة.');
      console.error('Canvas write validation failed', err);
      return;
    }
    const signature = JSON.stringify(shared);
    if (signature === lastRemote.current) return;
    pending.current = signature;
    const t = setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'live_sessions', sessionId, 'canvas', 'main'), {
          ...shared, updatedAt: serverTimestamp()
        });
        lastRemote.current = signature;
        setError(null);
      } catch (err) {
        setError('تعذّر حفظ التعديلات المباشرة، تحقق من الاتصال.');
        console.error('Classroom canvas write failed', err);
      } finally {
        if (pending.current === signature) pending.current = '';
      }
    }, 420);
    return () => clearTimeout(t);
  }, [
    sessionId, uid, isTeacher, ready, session.pages, session.currentPageIndex,
    session.isLocked, session.wordBox, session.title
  ]);

  return { canvasReady: ready, canvasError: error };
}
