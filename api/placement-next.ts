import { verifyFirebaseUser } from "./_lib/auth.js";
import { getAdminFirestore } from "./_lib/firebaseAdmin.js";
import { PLACEMENT_QUESTION_BANK } from "./_lib/placementBank.js";
import { FieldValue } from "firebase-admin/firestore";

type Request = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown };
type Response = { status(code: number): Response; setHeader(name: string, value: string): Response; json(body: unknown): void };

type SkillStat = { correct: number; incorrect: number; skipped: number; errors: string[] };
type Session = { userId: string; status: string; index: number; skillStats: Record<string, SkillStat> };

function normalize(value: unknown): string {
  return String(value ?? "").trim().normalize("NFC").toLocaleLowerCase();
}

function publicQuestion(question: (typeof PLACEMENT_QUESTION_BANK)[number]) {
  const { correctAnswer: _correctAnswer, natureOfWrongOptions: _wrongOptions, ...safe } = question;
  return safe;
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
  const body = (request.body && typeof request.body === "object" ? request.body : {}) as { questionId?: unknown; answer?: unknown };
  if (typeof body.questionId !== "string" || body.questionId.length > 32 ||
      (typeof body.answer !== "string" && body.answer !== null)) {
    response.status(400).json({ error: "Invalid answer submission." });
    return;
  }
  const db = getAdminFirestore();
  if (!db) {
    response.status(503).json({ error: "Placement test service is not configured on the server." });
    return;
  }

  try {
    const sessionRef = db.collection("placement_sessions").doc(user.uid);
    const output = await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(sessionRef);
      if (!snap.exists) return { status: 409, body: { error: "No active placement session. Restart the test." } };
      const session = snap.data() as Session;
      if (session.userId !== user.uid || session.status !== "active") {
        return { status: 409, body: { error: "Placement session is not active. Restart the test." } };
      }
      const index = session.index;
      const question = PLACEMENT_QUESTION_BANK[index];
      if (!question || question.id !== body.questionId) {
        return { status: 409, body: { error: "This answer does not match the current question. Restart the test." } };
      }
      const stats = { ...(session.skillStats || {}) };
      const current = stats[question.skill] || { correct: 0, incorrect: 0, skipped: 0, errors: [] };
      const skipped = body.answer === "IDK_SKIP" || body.answer === null;
      const correct = !skipped && normalize(body.answer) === normalize(question.correctAnswer);
      stats[question.skill] = {
        correct: current.correct + (correct ? 1 : 0),
        incorrect: current.incorrect + (!correct && !skipped ? 1 : 0),
        skipped: current.skipped + (skipped ? 1 : 0),
        errors: current.errors || [],
      };
      const nextIndex = index + 1;
      const complete = nextIndex >= PLACEMENT_QUESTION_BANK.length;
      transaction.update(sessionRef, {
        index: nextIndex,
        skillStats: stats,
        status: complete ? "completed" : "active",
        updatedAt: FieldValue.serverTimestamp(),
      });
      return {
        status: 200,
        body: complete
          ? { complete: true, index: nextIndex, total: PLACEMENT_QUESTION_BANK.length, skillStats: stats }
          : { complete: false, index: nextIndex, total: PLACEMENT_QUESTION_BANK.length, skillStats: stats, question: publicQuestion(PLACEMENT_QUESTION_BANK[nextIndex]) },
      };
    });
    response.status(output.status).json(output.body);
  } catch (error) {
    console.error("Placement answer submission failed", error instanceof Error ? error.message : "unknown error");
    response.status(500).json({ error: "Could not submit placement answer." });
  }
}
