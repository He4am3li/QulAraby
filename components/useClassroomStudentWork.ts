import { useCallback, useEffect, useState } from 'react';
import {
  collection, doc, onSnapshot, setDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import type { WhiteboardElement, WhiteboardSubmission } from '../types/whiteboard';
import { pickStudentDrawing } from '../services/liveWhiteboardState.mjs';

function asSubmission(id: string, data: any): WhiteboardSubmission {
  return {
    studentId: id,
    studentName: typeof data.studentName === 'string' ? data.studentName : 'طالب',
    answer: typeof data.answer === 'string' ? data.answer : '',
    pageId: typeof data.pageId === 'string' ? data.pageId : '',
    elements: Array.isArray(data.elements) ? data.elements : [],
    timestamp: typeof data.submittedAt?.toMillis === 'function'
      ? data.submittedAt.toMillis() : Date.now(),
    score: typeof data.score === 'number' ? data.score : undefined,
    feedback: typeof data.feedback === 'string' ? data.feedback : undefined,
    reviewed: typeof data.reviewedAt?.toMillis === 'function' &&
      typeof data.submittedAt?.toMillis === 'function' &&
      data.reviewedAt.toMillis() >= data.submittedAt.toMillis()
  };
}

export function useClassroomStudentWork(
  sessionId: string | null,
  uid: string | undefined,
  isTeacher: boolean
) {
  const [submissions, setSubmissions] = useState<WhiteboardSubmission[]>([]);
  const [myWork, setMyWork] = useState<WhiteboardSubmission | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSubmissions([]);
    setMyWork(null);
    setError(null);
    if (!sessionId || !uid) return;
    if (isTeacher) {
      return onSnapshot(collection(db, 'live_sessions', sessionId, 'student_work'), snapshot => {
        setSubmissions(snapshot.docs.map(d => asSubmission(d.id, d.data()))
          .sort((a, b) => b.timestamp - a.timestamp));
      }, err => {
        setError('تعذّر تحميل أعمال الطلاب.');
        console.error('Classroom work list failed', err);
      });
    }
    return onSnapshot(doc(db, 'live_sessions', sessionId, 'student_work', uid), snapshot => {
      setMyWork(snapshot.exists() ? asSubmission(snapshot.id, snapshot.data()) : null);
    }, err => {
      setError('تعذّر تحميل عملك المرسل.');
      console.error('Student classroom work read failed', err);
    });
  }, [sessionId, uid, isTeacher]);

  const submit = useCallback(async (
    answer: string,
    elements: WhiteboardElement[],
    pageId: string,
    name: string
  ) => {
    if (!sessionId || !uid || isTeacher) throw Error('JOIN_REQUIRED');
    const cleanAnswer = answer.trim();
    if (cleanAnswer.length > 2000) throw Error('ANSWER_TOO_LONG');
    const drawing = pickStudentDrawing(elements);
    if (!cleanAnswer && !drawing.length) throw Error('EMPTY_SUBMISSION');
    if (!pageId || pageId.length > 80) throw Error('INVALID_PAGE');
    setSending(true);
    setError(null);
    try {
      await setDoc(doc(db, 'live_sessions', sessionId, 'student_work', uid), {
        authorId: uid,
        studentName: name.trim().slice(0, 80) || 'طالب',
        answer: cleanAnswer,
        elements: drawing,
        pageId,
        submittedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      setError('لم يُرسَل العمل، تحقّق من اتصالك أو صلاحية الحصة.');
      console.error('Classroom work send failed', err);
      throw err;
    } finally {
      setSending(false);
    }
  }, [sessionId, uid, isTeacher]);

  const grade = useCallback(async (studentId: string, score: number, feedback: string) => {
    if (!sessionId || !uid || !isTeacher) throw Error('TEACHER_REQUIRED');
    if (!Number.isInteger(score) || score < 0 || score > 100) throw Error('INVALID_SCORE');
    if (feedback.length > 800) throw Error('FEEDBACK_TOO_LONG');
    setError(null);
    try {
      await updateDoc(doc(db, 'live_sessions', sessionId, 'student_work', studentId), {
        score, feedback: feedback.trim(), reviewedAt: serverTimestamp()
      });
    } catch (err) {
      setError('تعذّر تسجيل التقييم. حاول مجددًا.');
      console.error('Classroom work grading failed', err);
      throw err;
    }
  }, [sessionId, uid, isTeacher]);

  return { submissions, myWork, sending, error, submit, grade };
}
