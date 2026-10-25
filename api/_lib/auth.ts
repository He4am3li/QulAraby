// Verify Firebase ID tokens before allowing access to AI routes.
// The Firebase Web API key is public client configuration, not a privileged service-account key.
const FIREBASE_WEB_API_KEY = "AIzaSyBP8driYUWFsGN6_VVR3U9cW_EhMDnkLBU";

const WINDOW_MS = 60_000;
const MAX_AI_REQUESTS_PER_MINUTE = 45;
const recentRequests = new Map<string, number[]>();

type ApiRequest = { headers: Record<string, string | string[] | undefined> };

export async function verifyFirebaseUser(request: ApiRequest): Promise<{ uid: string } | null> {
  const header = request.headers.authorization;
  const authorization = Array.isArray(header) ? header[0] : header || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`,
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

  // Per-instance safeguard only. Use shared durable storage for strict cross-instance quotas.
  if (recentRequests.size > 2_000) {
    for (const [key, timestamps] of recentRequests) {
      if (!timestamps.some((timestamp) => now - timestamp < WINDOW_MS)) recentRequests.delete(key);
      if (recentRequests.size <= 1_500) break;
    }
  }
  return true;
}
