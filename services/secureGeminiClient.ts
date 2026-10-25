import { GoogleGenAI as SdkGoogleGenAI } from "@google/genai";
import { auth } from "../firebase";

type GenerateContentParams = {
  model: string;
  [key: string]: unknown;
};

async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Please sign in to use AI features.");
  return user.getIdToken();
}

export class GoogleGenAI {
  models = {
    generateContent: async (params: GenerateContentParams): Promise<any> => {
      const idToken = await getIdToken();
      let response: Response;
      try {
        response = await fetch("/api/gemini", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ params }),
          cache: "no-store",
          signal: AbortSignal.timeout(25_000),
        });
      } catch (error) {
        if (error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError")) {
          throw new Error("AI request timed out after 25 seconds. Please try again.");
        }
        throw error;
      }
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof payload?.error === "string" ? payload.error : "AI request failed.");
      }
      return payload;
    },
  };

  live = {
    connect: async (config: Record<string, unknown>): Promise<any> => {
      const idToken = await getIdToken();
      const tokenResponse = await fetch("/api/gemini-live-token", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        cache: "no-store",
      });
      const payload = await tokenResponse.json().catch(() => ({}));
      if (!tokenResponse.ok || typeof payload?.token !== "string") {
        throw new Error(typeof payload?.error === "string" ? payload.error : "Could not start the live tutor.");
      }
      // The long-lived secret stays on the server. The browser receives a short-lived,
      // single-use token constrained to the Live model.
      return new SdkGoogleGenAI({ apiKey: payload.token }).live.connect(config as any);
    },
  };

  constructor(_options?: Record<string, unknown>) {
    // Intentionally does not accept or embed a long-lived Gemini API key in browser code.
  }
}
