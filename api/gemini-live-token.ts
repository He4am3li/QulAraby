import { GoogleGenAI } from "@google/genai";
import { consumeAiRateLimit, verifyFirebaseUser } from "./_lib/auth";

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
  if (!apiKey) return Response.json({ error: "AI service is not configured on the server." }, { status: 503 });

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
    return Response.json({ token: token.name, expiresInSeconds: 60 }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Gemini live token provisioning failed", error instanceof Error ? error.message : "unknown error");
    return Response.json({ error: "Could not start the live tutor session." }, { status: 502 });
  }
}
