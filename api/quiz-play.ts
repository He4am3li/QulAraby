import { randomBytes } from 'node:crypto';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { checkGatewayQuota, readGatewayBody, requireFirebaseUser, type GatewayRequest, type GatewayResponse } from './_geminiAuth.js';
import { gradeQuestions, publicQuestion } from './_quizGrading.mjs';

const DATABASE_ID = 'ai-studio-d8ed89a2-6662-4aa5-9cc7-1e8d0693722e';
const QUIZ_ID = /^[A-Za-z0-9_-]{8,128}$/;
const ATTEMPT_TOKEN = /^[a-f0-9]{48}$/;
const SAFE_CODE = /^[A-Za-z0-9_-]{4,20}$/;

function respond(res: GatewayResponse, status: number, body: Record<string, unknown>) {
  res.statusCode = status;
  res.end(JSON.stringify(body));
}
function errorMessage(status: number) {
  return status === 409 ? 'Quiz attempt is no longer available' :
    status === 404 ? 'Quiz not found or inactive' : 'Invalid quiz request';
}
function getDb() {
  // requireFirebaseUser has already initialized this exact named app.
  const app = getApps().find(a => a.name === 'qul-gemini-gateway');
  if (!app) throw Error('ADMIN_SERVICE_UNAVAILABLE');
  return { db: getFirestore(app, DATABASE_ID), auth: getAuth(app) };
}
const publicQuiz = (data: Record<string, unknown>) => ({
  title: data.title, quizType: data.quizType,
  description: data.description, studyMaterial: data.studyMaterial,
  duration: data.duration, playMode: data.playMode
});

/**
 * Authenticated, server-scored quiz API. No question keys/feedback or
 * client-calculated scores are accepted or sent back before final submission.
 * A per-user, per-quiz attempt lock prevents duplicate result submissions.
 */
export default async function handler(req: GatewayRequest, res: GatewayResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    respond(res, 405, { error: 'Method not allowed' });
    return;
  }
  try {
    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
    const host = typeof req.headers.host === 'string' ? req.headers.host : '';
    if (origin && (!host || new URL(origin).origin !== 'https://' + host)) {
      respond(res, 403, { error: 'Forbidden origin' });
      return;
    }
  } catch {
    respond(res, 403, { error: 'Forbidden origin' });
    return;
  }
  const uid = await requireFirebaseUser(req, res);
  if (!uid || !checkGatewayQuota(uid, res, 30)) return;

  let request: Record<string, unknown>;
  try {
    if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
      respond(res, 415, { error: 'JSON required' });
      return;
    }
    request = JSON.parse((await readGatewayBody(req, 220000)).toString('utf8'));
    if (!request || typeof request !== 'object' || Array.isArray(request)) throw Error('MALFORMED_BODY');
  } catch {
    respond(res, 400, { error: 'Invalid quiz request' });
    return;
  }

  const action = request.action;
  if (!['lookup', 'start', 'submit'].includes(String(action))) {
    respond(res, 400, { error: 'Unsupported quiz action' });
    return;
  }

  try {
    const { db, auth } = getDb();
    if (action === 'lookup') {
      const code = request.code;
      if (typeof code !== 'string' || !SAFE_CODE.test(code)) {
        respond(res, 400, { error: 'Invalid quiz code' });
        return;
      }
      // Two historic quiz code formats; return only the identifier.
      let found = await db.collection('quizzes').where('joinCode', '==', code.toUpperCase()).limit(1).get();
      if (found.empty) found = await db.collection('quizzes').where('code', '==', code).limit(1).get();
      const quiz = found.docs[0];
      if (!quiz || quiz.data().status !== 'active') {
        respond(res, 404, { error: errorMessage(404) });
        return;
      }
      respond(res, 200, { quizId: quiz.id });
      return;
    }

    const quizId = request.quizId;
    if (typeof quizId !== 'string' || !QUIZ_ID.test(quizId)) {
      respond(res, 400, { error: 'Invalid quiz id' });
      return;
    }
    const quizRef = db.collection('quizzes').doc(quizId);
    const quizSnapshot = await quizRef.get();
    if (!quizSnapshot.exists || quizSnapshot.data()?.status !== 'active') {
      respond(res, 404, { error: errorMessage(404) });
      return;
    }
    const quiz = quizSnapshot.data()!;
    const attemptRef = quizRef.collection('attempts').doc(uid);
    const resultCollection = quizRef.collection('results');
    const maxAttempts = Number.isInteger(quiz.maxAttempts) && quiz.maxAttempts > 0
      ? Math.min(quiz.maxAttempts, 100) : 0;

    if (action === 'start') {
      const previous = maxAttempts
        ? (await resultCollection.where('userId', '==', uid).count().get()).data().count
        : 0;
      if (maxAttempts && previous >= maxAttempts) {
        respond(res, 409, { error: 'Attempts exhausted', attemptsExceeded: true, previousAttempts: previous });
        return;
      }
      const questionDocs = await quizRef.collection('questions').orderBy('order').get();
      if (questionDocs.empty || questionDocs.size > 100) {
        respond(res, 409, { error: 'Quiz has no valid questions' });
        return;
      }
      const now = Timestamp.now();
      const lengthMs = Math.max(5, Math.min(Number(quiz.duration) || 20, 180)) * 60000 + 60000;
      const freshToken = randomBytes(24).toString('hex');
      const attempt = await db.runTransaction(async tx => {
        const prior = await tx.get(attemptRef);
        const d = prior.data();
        if (d?.state === 'active' && d.expiresAt?.toMillis?.() > Date.now()) {
          return { token: d.token, expiresAt: d.expiresAt.toMillis() };
        }
        tx.set(attemptRef, {
          uid, quizId, state: 'active', token: freshToken,
          startedAt: now, expiresAt: Timestamp.fromMillis(now.toMillis() + lengthMs)
        });
        return { token: freshToken, expiresAt: now.toMillis() + lengthMs };
      });
      respond(res, 200, {
        attemptToken: attempt.token, expiresAt: attempt.expiresAt,
        previousAttempts: previous,
        quiz: publicQuiz(quiz),
        questions: questionDocs.docs.map(d => publicQuestion(d.id, d.data()))
      });
      return;
    }

    if (action === 'submit') {
      const attemptToken = request.attemptToken;
      if (typeof attemptToken !== 'string' || !ATTEMPT_TOKEN.test(attemptToken)) {
        respond(res, 400, { error: 'Invalid quiz attempt' });
        return;
      }
      const questionDocs = await quizRef.collection('questions').orderBy('order').get();
      const answers = request.answers;
      const grade = gradeQuestions(
        questionDocs.docs.map(d => ({ id: d.id, data: d.data() })), answers);
      const token = typeof req.headers.authorization === 'string'
        ? req.headers.authorization.replace(/^Bearer /, '') : '';
      const verified = await auth.verifyIdToken(token, true);
      if (verified.uid !== uid || !verified.email || verified.email_verified !== true) {
        respond(res, 403, { error: 'Verified account required' });
        return;
      }
      const resultRef = resultCollection.doc();
      const result = await db.runTransaction(async tx => {
        const [existing, updatedQuiz] = await Promise.all([
          tx.get(attemptRef), tx.get(quizRef)
        ]);
        const data = existing.data();
        if (!updatedQuiz.exists || updatedQuiz.data()?.status !== 'active' ||
            !data || data.uid !== uid || data.state !== 'active' ||
            data.token !== attemptToken || !data.expiresAt ||
            data.expiresAt.toMillis() < Date.now()) {
          throw Error('ATTEMPT_INVALID');
        }
        if (maxAttempts) {
          const past = await tx.get(resultCollection.where('userId', '==', uid));
          if (past.size >= maxAttempts) throw Error('ATTEMPTS_EXHAUSTED');
        }
        const completed = Timestamp.now();
        tx.create(resultRef, {
          userId: uid, userEmail: verified.email,
          score: grade.score, totalPoints: grade.totalPoints,
          totalQuestions: grade.questionCount, correctCount: grade.correctCount,
          timeTaken: Math.max(0, Math.floor((completed.toMillis() - data.startedAt.toMillis()) / 1000)),
          completedAt: completed, timestamp: completed, gradingVersion: 'server-v1'
        });
        tx.update(attemptRef, { state: 'submitted', submittedAt: completed, resultId: resultRef.id });
        return { score: grade.score, totalPoints: grade.totalPoints, correctCount: grade.correctCount };
      });
      respond(res, 200, { ...result, submitted: true });
    }
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'ATTEMPT_INVALID' || code === 'ATTEMPTS_EXHAUSTED') {
      respond(res, 409, { error: errorMessage(409), attemptsExceeded: code === 'ATTEMPTS_EXHAUSTED' });
    } else if (code === 'INVALID_ANSWERS' || code === 'INVALID_QUESTIONS') {
      respond(res, 400, { error: 'Invalid answers or quiz questions' });
    } else {
      console.error('Server quiz assessment failed:', error);
      respond(res, 503, { error: 'Quiz assessment unavailable' });
    }
  }
}
