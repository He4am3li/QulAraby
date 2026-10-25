import { auth } from "../firebase";

type GenerateContentParams = {
  model: string;
  [key: string]: unknown;
};

export class GoogleGenAI {
  models = {
    generateContent: async (params: GenerateContentParams): Promise<any> => {
      const user = auth.currentUser;
      if (!user) throw new Error("Please sign in to use AI features.");
      const idToken = await user.getIdToken();
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ params }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof payload?.error === "string" ? payload.error : "AI request failed.");
      }
      return payload;
    },
  };

  constructor(_options?: Record<string, unknown>) {
    // Deliberately no API key in the browser. Requests go through authenticated Vercel Functions.
  }
}

export async function getLiveAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Please sign in to use the live tutor.");
  const idToken = await user.getIdToken();
  const response = await fetch("/api/gemini-live-token", {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || typeof payload?.token !== "string") {
    throw new Error(typeof payload?.error === "string" ? payload.error : "Could not start the live tutor.");
  }
  return payload.token;
}
