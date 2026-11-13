/**
 * Security-preserving backup for the Admin SDK's revoked-token check when the
 * service account lacks firebaseauth.users.get.
 *
 * Firebase Admin always verifies JWT signature, issuer, audience and expiry.
 * Firebase's official end-user accounts:lookup endpoint then provides the
 * current disabled/deleted state and validSince revocation boundary. A 200
 * response with incomplete, mismatched or invalid data is NOT authorized.
 *
 * See https://firebase.google.com/docs/reference/rest/auth#get_user_data
 */
const sessionError = (code) => Object.assign(new Error('Firebase session invalid'), { code });
const unavailable = () => sessionError('AUTH_REVOCATION_UNAVAILABLE');

export function assertFirebaseRestAccount(decoded, account) {
  if (!decoded || typeof decoded.uid !== 'string' ||
      typeof decoded.email !== 'string' || typeof decoded.auth_time !== 'number') {
    throw sessionError('auth/invalid-id-token');
  }
  if (!account || account.localId !== decoded.uid ||
      account.email !== decoded.email) {
    throw sessionError('auth/invalid-id-token');
  }
  if (account.disabled === true) throw sessionError('auth/user-disabled');
  if (account.emailVerified !== true) throw sessionError('auth/invalid-id-token');
  // Both timestamps are integer Unix seconds. Refuse missing/malformed
  // validSince instead of accidentally accepting a previously revoked token.
  if (typeof account.validSince !== 'string' ||
      !/^(0|[1-9][0-9]*)$/.test(account.validSince)) throw unavailable();
  const validSince = Number(account.validSince);
  if (!Number.isSafeInteger(validSince) || !Number.isSafeInteger(decoded.auth_time) ||
      decoded.auth_time < 0) throw unavailable();
  if (decoded.auth_time < validSince) throw sessionError('auth/id-token-revoked');
  return decoded;
}

export async function verifyFirebaseRevocationViaLookup(
  idToken, adminAuth, apiKey, fetchImpl = fetch,
) {
  if (!apiKey || typeof apiKey !== 'string') throw unavailable();

  // This verifier checks the Google-signed token locally, not user-provided
  // claims. Only auth/insufficient-permission can enter the fallback.
  const decoded = await adminAuth.verifyIdToken(idToken, false);

  let response;
  try {
    response = await fetchImpl(
      'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' +
        encodeURIComponent(apiKey),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ idToken }),
        cache: 'no-store',
        signal: AbortSignal.timeout(9000),
      },
    );
  } catch {
    throw unavailable();
  }
  if (!response?.ok) {
    // Invalid, deleted and disabled tokens must not be accepted. A network,
    // key-restriction or provider error also fails closed.
    throw unavailable();
  }
  let result;
  try {
    result = await response.json();
  } catch {
    throw unavailable();
  }
  if (!Array.isArray(result?.users) || result.users.length !== 1) {
    throw sessionError('auth/user-not-found');
  }
  return assertFirebaseRestAccount(decoded, result.users[0]);
}
