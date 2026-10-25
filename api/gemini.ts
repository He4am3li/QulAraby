import { GoogleGenAI } from "@google/genai";
import { consumeAiRateLimit, verifyFirebaseUser } from "./_lib/auth";

const ALLOWED_MODELS = new Set([
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite-image",
  "gemini-3.8-flash-lite-tts",
]);

const MAX_BODY_BYTES = 4 * 1024 * 1024;

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "POST" } });
  }

  const user = await verifyFirebaseUser(request);
  if (!user) return Response.json({ error: "Sign-in required" }, { status: 401 });
  if (!consumeAiRateLimit(user.uid)) {
    return Response.json({ error: "Too many AI requests. Please try again shortly." }, { status: 429 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "AI service is not configured on the server." }, { status: 503 });
  }

  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Request body is too large" }, { status: 413 });
  }

  try {
    const body = JSON.parse(rawBody) as { params?: { model?: unknown } };
    const params = body?.params;
    if (!params || typeof params !== "object" || typeof params.model !== "string" || !ALLOWED_MODELS.has(params.model)) {
      return Response.json({ error: "Unsupported AI model or invalid request" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent(params as any);
    return Response.json({
      text: response.text ?? "",
      candidates: response.candidates ?? [],
      promptFeedback: response.promptFeedback ?? null,
      usageMetadata: response.usageMetadata ?? null,
      modelVersion: response.modelVersion ?? null,
    });
  } catch (error) {
    // Avoid returning upstream error details to the browser.
    console.error("Gemini proxy request failed", error instanceof Error ? error.message : "unknown error");
    return Response.json({ error: "AI request failed. Please try again." }, { status: 502 });
  }
}
