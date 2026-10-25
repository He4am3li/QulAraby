import firebaseConfig from "../../firebase-applet-config.json";

const WINDOW_MS = 60_000;
const MAX_AI_REQUESTS_PER_MINUTE = 45;
const recentRequests = new Map<string, number[]>();

export async function verifyFirebaseUser(request: Request): Promise<{ uid: string } | null> {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseConfig.apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: match[1] }),
      },
    );
    if (!response.ok) return null;
    const payload = await response.json() as { users?: Array<{ localId?: string; disabled?: boolean }> };
    const user = payload.users?.[0];
    if (!user?.localId || user.disabled) return null;
    return { uid: user.localId };
  } catch {
    return null;
  }
}

export function consumeAiRateLimit(uid: string): boolean {
  const now = Date.now();
  const recent = (recentRequests.get(uid) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_AI_REQUESTS_PER_MINUTE) {
    recentRequests.set(uid, recent);
    return false;
  }
  recent.push(now);
  recentRequests.set(uid, recent);

  // Keep the in-memory guard bounded in long-lived instances.
  if (recentRequests.size > 2_000) {
    for (const [key, timestamps] of recentRequests) {
      if (!timestamps.some((timestamp) => now - timestamp < WINDOW_MS)) recentRequests.delete(key);
      if (recentRequests.size <= 1_500) break;
    }
  }
  return true;
}
