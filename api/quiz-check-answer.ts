import { verifyFirebaseUser } from "./_lib/auth.js";
import { getAdminFirestore } from "./_lib/firebaseAdmin.js";

type Request = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown };
type Response = { status(code: number): Response; setHeader(name: string, value: string): Response; json(body: unknown): void };

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLocaleLowerCase();
}

function safeStringify(value: unknown): string {
  try { return JSON.stringify(value); } catch { return ""; }
}

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
    quizId?: unknown; questionId?: unknown; answer?: unknown;
  };
  if (typeof body.quizId !== "string" || body.quizId.length > 160 ||
      typeof body.questionId !== "string" || body.questionId.length > 160 ||
      body.answer === undefined) {
    response.status(400).json({ error: "Invalid answer request." });
    return;
  }
  const db = getAdminFirestore();
  if (!db) {
    response.status(503).json({ error: "Quiz security is not configured on the server." });
    return;
  }
  try {
    const quizSnap = await db.collection("quizzes").doc(body.quizId).get();
    if (!quizSnap.exists) {
      response.status(404).json({ error: "Quiz not found." });
      return;
    }
    const questionSnap = await db.collection("quizzes").doc(body.quizId).collection("questions").doc(body.questionId).get();
    if (!questionSnap.exists) {
      response.status(404).json({ error: "Question not found." });
      return;
    }
    const question = questionSnap.data() || {};
    let correct = false;
    if (question.type === "ordering" || question.type === "drag_drop" || question.type === "matching") {
      correct = safeStringify(body.answer) === safeStringify(question.options);
    } else if (question.type === "chess_puzzle") {
      correct = body.answer === "CHESS_MASTERED";
    } else {
      const accepted = Array.isArray(question.acceptedAnswers) ? question.acceptedAnswers : [question.correctAnswer];
      correct = accepted.some((candidate: unknown) => normalize(candidate) === normalize(body.answer));
    }
    response.status(200).json({ correct });
  } catch (error) {
    console.error("Server-side answer validation failed", error instanceof Error ? error.message : "unknown error");
    response.status(500).json({ error: "Could not check this answer." });
  }
}
