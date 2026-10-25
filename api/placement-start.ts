import { verifyFirebaseUser } from "./_lib/auth.js";
import { getAdminFirestore } from "./_lib/firebaseAdmin.js";
import { PLACEMENT_QUESTION_BANK } from "./_lib/placementBank.js";
import { FieldValue } from "firebase-admin/firestore";

type Request = { method?: string; headers: Record<string, string | string[] | undefined> };
type Response = { status(code: number): Response; setHeader(name: string, value: string): Response; json(body: unknown): void };

function publicQuestion(question: (typeof PLACEMENT_QUESTION_BANK)[number]) {
  const { correctAnswer: _correctAnswer, answerKey: _answerKey, acceptedAnswers: _acceptedAnswers, natureOfWrongOptions: _wrongOptions, ...safe } = question;
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
  const db = getAdminFirestore();
  if (!db) {
    response.status(503).json({ error: "Placement test service is not configured on the server." });
    return;
  }
  try {
    const sessionRef = db.collection("placement_sessions").doc(user.uid);
    await sessionRef.set({
      userId: user.uid,
      status: "active",
      index: 0,
      skillStats: {},
      startedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    response.status(200).json({
      index: 0,
      total: PLACEMENT_QUESTION_BANK.length,
      question: publicQuestion(PLACEMENT_QUESTION_BANK[0]),
    });
  } catch (error) {
    console.error("Placement session start failed", error instanceof Error ? error.message : "unknown error");
    response.status(500).json({ error: "Could not start placement test." });
  }
}
