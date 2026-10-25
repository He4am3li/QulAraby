import { GoogleGenAI } from "@google/genai";
import { consumeAiRateLimit, verifyFirebaseUser } from "./_lib/auth.js";

type ApiRequest = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown };
type ApiResponse = {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): ApiResponse;
  json(body: unknown): void;
};

const ALLOWED_MODELS = new Set([
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite-image",
  "gemini-3.8-flash-lite-tts",
]);
const MAX_BODY_BYTES = 4 * 1024 * 1024;

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST").status(405).json({ error: "Method not allowed" });
    return;
  }

  const declaredLength = Number(request.headers["content-length"] || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    response.status(413).json({ error: "Request body is too large" });
    return;
  }

  const user = await verifyFirebaseUser(request);
  if (!user) {
    response.status(401).json({ error: "Sign-in required" });
    return;
  }
  if (!consumeAiRateLimit(user.uid)) {
    response.status(429).json({ error: "Too many AI requests. Please try again shortly." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    response.status(503).json({ error: "AI service is not configured on the server." });
    return;
  }

  try {
    let body = request.body as { params?: { model?: unknown } } | string | undefined;
    if (typeof body === "string") body = JSON.parse(body);
    if (!body || typeof body !== "object") {
      response.status(400).json({ error: "Invalid request body" });
      return;
    }
    const size = new TextEncoder().encode(JSON.stringify(body)).byteLength;
    if (size > MAX_BODY_BYTES) {
      response.status(413).json({ error: "Request body is too large" });
      return;
    }

    const params = body.params;
    if (!params || typeof params !== "object" || typeof params.model !== "string" || !ALLOWED_MODELS.has(params.model)) {
      response.status(400).json({ error: "Unsupported AI model or invalid request" });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent(params as any);
    response.status(200).json({
      text: result.text ?? "",
      candidates: result.candidates ?? [],
      promptFeedback: result.promptFeedback ?? null,
      usageMetadata: result.usageMetadata ?? null,
      modelVersion: result.modelVersion ?? null,
    });
  } catch (error) {
    console.error("Gemini proxy request failed", error instanceof Error ? error.message : "unknown error");
    response.status(502).json({ error: "AI request failed. Please try again." });
  }
}
