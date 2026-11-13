/**
 * Request an ephemeral Gemini Live session credential over the authenticated
 * same-origin gateway. Retry exactly once with a freshly minted Firebase ID
 * token if the server rejects a cached token with HTTP 401.
 *
 * Never retry authorization failures (403), service failures (503), or quota
 * limits, and never expose the long-lived provider key to the browser.
 */
export async function requestLiveToken(currentUser, fetchImpl = fetch) {
  const send = async (forceRefresh) => {
    const idToken = await currentUser.getIdToken(forceRefresh);
    return fetchImpl('/api/gemini-live-token', {
      method: 'POST',
      headers: { authorization: 'Bearer ' + idToken },
      cache: 'no-store',
    });
  };

  let response = await send(false);
  if (response.status === 401) response = await send(true);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const internalCode = typeof body?.code === 'string' ? body.code : '';
    const code = response.status === 401 ? 'LIVE_AUTH_REQUIRED'
      : response.status === 403 ? 'LIVE_ACCESS_DENIED'
      : response.status === 429 ? 'LIVE_QUOTA_REACHED'
      : internalCode === 'AUTH_SERVICE_PERMISSION' ? 'LIVE_AUTH_SERVICE_PERMISSION'
      : internalCode === 'AUTH_SERVICE_UNAVAILABLE' ? 'LIVE_AUTH_SERVICE_UNAVAILABLE'
      : response.status >= 500 ? 'LIVE_SERVICE_UNAVAILABLE' : 'LIVE_TOKEN_ERROR';
    throw Object.assign(new Error('Could not authorize a live conversation'), { code });
  }

  const result = await response.json();
  if (typeof result?.token !== 'string' || !result.token.startsWith('auth_tokens/')) {
    throw Object.assign(new Error('Invalid live session authorization'), { code: 'LIVE_TOKEN_ERROR' });
  }
  return result.token;
}
