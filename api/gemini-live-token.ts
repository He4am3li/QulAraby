import { GoogleGenAI } from "@google/genai";
import { consumeAiRateLimit, verifyFirebaseUser } from "./_lib/auth";

type ApiRequest = { method?: string; headers: Record<string, string | string[] | undefined> };
type ApiResponse = {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): ApiResponse;
  json(body: unknown): void;
};

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
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
    const ai = new GoogleGenAI({ apiKey });
    const now = Date.now();
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
        liveConnectConstraints: { model: "models/gemini-3.8-live" },
      },
    });
    if (!token.name) throw new Error("Gemini did not return an ephemeral token");
    response.status(200).json({ token: token.name, expiresInSeconds: 60 });
  } catch (error) {
    console.error("Gemini live token provisioning failed", error instanceof Error ? error.message : "unknown error");
    response.status(502).json({ error: "Could not start the live tutor session." });
  }
}
