import { verifyFirebaseUser } from "./_lib/auth.js";
import { getAdminFirestore } from "./_lib/firebaseAdmin.js";

type Request = { method?: string; headers: Record<string, string | string[] | undefined>; query?: Record<string, string | string[] | undefined> };
type Response = { status(code: number): Response; setHeader(name: string, value: string): Response; json(body: unknown): void };

export default async function handler(request: Request, response: Response): Promise<void> {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET").status(405).json({ error: "Method not allowed" });
    return;
  }
  const user = await verifyFirebaseUser(request);
  if (!user) {
    response.status(401).json({ error: "Sign-in required" });
    return;
  }
  const quizIdValue = request.query?.quizId;
  const quizId = Array.isArray(quizIdValue) ? quizIdValue[0] : quizIdValue;
  if (!quizId || quizId.length > 160) {
    response.status(400).json({ error: "A valid quizId is required." });
    return;
  }
  const db = getAdminFirestore();
  if (!db) {
    response.status(503).json({ error: "Quiz security is not configured on the server." });
    return;
  }
  try {
    const quizRef = db.collection("quizzes").doc(quizId);
    const quiz = await quizRef.get();
    if (!quiz.exists) {
      response.status(404).json({ error: "Quiz not found." });
      return;
    }
    const data = quiz.data() || {};
    const userSnap = await db.collection("users").doc(user.uid).get();
    const userProfile = userSnap.data() || {};
    const ownsQuiz = data.authorId === user.uid;
    const isAdmin = userProfile.role === "admin";
    const isTeacher = userProfile.role === "teacher" || isAdmin;
    if (data.status !== "active" && !(isTeacher && ownsQuiz) && !isAdmin) {
      response.status(403).json({ error: "This quiz is not available to this account." });
      return;
    }
    const questionsSnapshot = await quizRef.collection("questions").orderBy("order", "asc").get();
    const questions = questionsSnapshot.docs.map((doc) => {
      const question = doc.data();
      const {
        correctAnswer: _correctAnswer,
        answerKey: _answerKey,
        acceptedAnswers: _acceptedAnswers,
        explanation: _explanation,
        feedback: _feedback,
        ...safe
      } = question;
      return { id: doc.id, ...safe };
    });
    response.status(200).json({
      quiz: { title: data.title || "", duration: data.duration || 20, maxAttempts: data.maxAttempts || 0 },
      questions,
    });
  } catch (error) {
    console.error("Secure quiz question delivery failed", error instanceof Error ? error.message : "unknown error");
    response.status(500).json({ error: "Could not load quiz questions securely." });
  }
}
