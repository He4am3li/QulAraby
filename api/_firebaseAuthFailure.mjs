/**
 * Classify Firebase Admin verification errors without leaking credentials,
 * backend errors or private identity data to the browser.
 *
 * Unknown verification failures must fail closed (503), not impersonate an
 * expired user session (401). Never bypass checkRevoked or profile approval.
 */
export function classifyFirebaseAuthFailure(error) {
  const code = typeof error?.code === 'string' ? error.code : '';
  const invalidSessionCodes = new Set([
    'auth/id-token-expired', 'auth/id-token-revoked', 'auth/invalid-id-token',
    'auth/user-disabled', 'auth/user-not-found', 'auth/argument-error',
    'auth/invalid-argument'
  ]);
  if (invalidSessionCodes.has(code)) {
    return { statusCode: 401, code: 'AUTH_SESSION_INVALID', error: 'Invalid or expired session' };
  }
  if (code === 'auth/insufficient-permission') {
    return { statusCode: 503, code: 'AUTH_SERVICE_PERMISSION', error: 'Account verification unavailable' };
  }
  return { statusCode: 503, code: 'AUTH_SERVICE_UNAVAILABLE', error: 'Account verification unavailable' };
}
