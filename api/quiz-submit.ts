import { verifyFirebaseUser } from "./_lib/auth.js";
import { getAdminFirestore } from "./_lib/firebaseAdmin.js";
import { FieldValue } from "firebase-admin/firestore";

type Request = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown };
type Response = { status(code: number): Response; setHeader(name: string, value: string): Response; json(body: unknown): void };

function normalize(value: unknown): string { return String(value ?? "").trim().toLocaleLowerCase(); }
function safeStringify(value: unknown): string { try { return JSON.stringify(value); } catch { return ""; } }

export default async function handler(request: Request, response: Response): Promise<void> {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST").status(405).json({ error: "Method not allowed" });
    return;
  }
  const user = await verifyFirebaseUser(request);
  if (!user) {
    response.status(401).json({ error: "Sign-in required" });
    return;
  }
  const body = (request.body && typeof request.body === "object" ? request.body : {}) as {
    quizId?: unknown; answers?: unknown; timeTaken?: unknown; userEmail?: unknown;
  };
  if (typeof body.quizId !== "string" || body.quizId.length > 160 ||
      !body.answers || typeof body.answers !== "object" || Array.isArray(body.answers) ||
      Object.keys(body.answers as Record<string, unknown>).length > 300 ||
      typeof body.timeTaken !== "number" || !Number.isFinite(body.timeTaken) || body.timeTaken < 0) {
    response.status(400).json({ error: "Invalid quiz submission." });
    return;
  }
  const db = getAdminFirestore();
  if (!db) {
    response.status(503).json({ error: "Quiz security is not configured on the server." });
    return;
  }
  try {
    const quizRef = db.collection("quizzes").doc(body.quizId);
    const quizSnap = await quizRef.get();
    if (!quizSnap.exists) {
      response.status(404).json({ error: "Quiz not found." });
      return;
    }
    const quiz = quizSnap.data() || {};
    const userSnap = await db.collection("users").doc(user.uid).get();
    const userProfile = userSnap.data() || {};
    const ownsQuiz = quiz.authorId === user.uid;
    const isAdmin = userProfile.role === "admin";
    const isTeacher = userProfile.role === "teacher" || isAdmin;
    if (quiz.status !== "active" && !(isTeacher && ownsQuiz) && !isAdmin) {
      response.status(403).json({ error: "This quiz is not available to this account." });
      return;
    }
    const attempts = await quizRef.collection("results").where("userId", "==", user.uid).get();
    const maxAttempts = typeof quiz.maxAttempts === "number" ? quiz.maxAttempts : 0;
    if (maxAttempts > 0 && attempts.size >= maxAttempts) {
      response.status(403).json({ error: "Maximum quiz attempts reached." });
      return;
    }
    const submitted = body.answers as Record<string, unknown>;
    const questionsSnap = await quizRef.collection("questions").orderBy("order", "asc").get();
    let totalPoints = 0;
    let score = 0;
    for (const doc of questionsSnap.docs) {
      const question = doc.data();
      const points = typeof question.points === "number" && Number.isFinite(question.points) && question.points > 0 ? question.points : 0;
      totalPoints += points;
      const answer = submitted[doc.id];
      if (answer === undefined) continue;
      let correct = false;
      if (question.type === "ordering" || question.type === "drag_drop" || question.type === "matching") {
        correct = safeStringify(answer) === safeStringify(question.options);
      } else if (question.type === "chess_puzzle") {
        correct = answer === "CHESS_MASTERED";
      } else {
        const accepted = Array.isArray(question.acceptedAnswers) ? question.acceptedAnswers : [question.correctAnswer];
        correct = accepted.some((candidate: unknown) => normalize(candidate) === normalize(answer));
      }
      if (correct) score += points;
    }
    const result = {
      userId: user.uid,
      userEmail: typeof body.userEmail === "string" ? body.userEmail.slice(0, 254) : "",
      score,
      totalPoints,
      timeTaken: Math.min(Math.floor(body.timeTaken), 24 * 60 * 60),
      completedAt: FieldValue.serverTimestamp(),
    };
    const resultRef = await quizRef.collection("results").add(result);
    response.status(200).json({ score, totalPoints, resultId: resultRef.id });
  } catch (error) {
    console.error("Server-side quiz grading failed", error instanceof Error ? error.message : "unknown error");
    response.status(500).json({ error: "Could not submit quiz securely." });
  }
}
