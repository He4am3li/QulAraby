import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const vite = read('vite.config.ts');
const gemini = read('services/gemini.ts');
const proxy = read('api/gemini.ts');
const auth = read('api/_geminiAuth.ts');
const live = read('api/gemini-live-token.ts');
const sources = ['pages/Dialects.tsx','pages/Speak.tsx','pages/Preparation.tsx','pages/Quizzes.tsx'].map(read);
const missionAssessment = read('services/dialectMissionAssessment.ts');

assert.ok(!vite.includes("'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)"),
  'Never bundle a server credential as a client define');
assert.ok(!vite.includes("'process.env.API_KEY': JSON.stringify(apiKey)"),
  'Legacy client key aliases must not be embedded');
assert.ok(vite.includes("import geminiHandler from './api/gemini'"),
  'Local development must use the same secure proxy');
assert.ok(gemini.includes("apiKey: 'server-managed'"), 'Browser client must use a nonsecret placeholder');
assert.ok(gemini.includes("headers.delete('x-goog-api-key')"), 'Strip placeholder key before sending');
assert.ok(gemini.includes("currentUser.getIdToken()"), 'Browser should authenticate proxy calls');
assert.ok(missionAssessment.includes("import { getAI } from './gemini'") &&
  missionAssessment.includes('const ai = getAI();') &&
  !missionAssessment.includes('process.env.GEMINI_API_KEY'),
  'Dialect passport mission assessment must use the secured Gemini gateway');
assert.ok(gemini.includes("privateGeminiFetch") && gemini.includes('getLiveAI'),
  'HTTP and live calls must have separate secure transports');
assert.ok(proxy.includes('requireFirebaseUser(req, res)') && proxy.includes('checkGatewayQuota(uid, res)'),
  'Proxy must authenticate and throttle');
assert.ok(proxy.includes('allowedModelRequest.test(target.pathname)') &&
  proxy.includes("target.origin !== 'https://generativelanguage.googleapis.com'"),
  'Proxy must reject arbitrary target hosts and unsupported paths');
assert.ok(proxy.includes('process.env.GEMINI_API_KEY'), 'Only backend may use production credential');
assert.ok(!proxy.includes('req.headers[\'x-goog-api-key\']'), 'Never trust client-supplied upstream credentials');
assert.ok(auth.includes('firebase-admin/auth') &&
  auth.includes('verifyIdToken(match[1], true)'),
  'Firebase Admin must validate ID tokens and check revocation');
assert.ok(auth.includes('FIREBASE_SERVICE_ACCOUNT_JSON') &&
  auth.includes('getFirestore(existing, FIRESTORE_DATABASE_ID)') &&
  auth.includes('getFirestore(app, FIRESTORE_DATABASE_ID)'),
  'Authorization must use the configured private credential and correct Firestore database');
assert.ok(auth.includes('isApprovedGatewayProfile(profile, decoded.email)') &&
  auth.includes("import { isApprovedGatewayProfile } from './_gatewayApproval.mjs'"),
  'Gateway must call the tested approval policy on every non-owner request');
assert.ok(auth.includes("error: 'Account approval required'") &&
  auth.includes("error: 'Account authorization unavailable'"),
  'Gateway must fail closed when approval is missing or database access fails');
assert.ok(live.includes('uses: 1') && live.includes('newSessionExpireTime:'),
  'Live access must use single-use, short-lived tokens');
assert.ok(live.includes('requireFirebaseUser(req, res)'),
  'Live token creation must require authentication');
for (const source of sources) {
  assert.ok(!source.includes('new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY'),
    'No page may include a long-lived Gemini key');
}
assert.ok(sources[0].includes('liveAI.live.connect({') &&
  sources[1].includes('await getLiveAI()'), 'Live conversations must use temporary authorization');

const { isApprovedGatewayProfile } = await import('../api/_gatewayApproval.mjs');
const good = { approved: true, email: 'learner@example.com' };
assert.equal(isApprovedGatewayProfile(good, 'learner@example.com'), true,
  'Approved account with matching token email may use Gemini');
assert.equal(isApprovedGatewayProfile({ ...good, approved: false }, good.email), false,
  'Pending or revoked account must be rejected');
assert.equal(isApprovedGatewayProfile({ email: good.email }, good.email), false,
  'Legacy account without an approval flag must be rejected');
assert.equal(isApprovedGatewayProfile({ ...good, email: 'someone-else@example.com' }, good.email), false,
  'Identity spoofing by a mismatched profile email must be rejected');
assert.equal(isApprovedGatewayProfile(null, good.email), false,
  'Missing account profile must be rejected');
assert.equal(isApprovedGatewayProfile(undefined, good.email), false,
  'Unresolved account profile must be rejected');
assert.equal(isApprovedGatewayProfile({ ...good, approved: 'true' }, good.email), false,
  'Truthy nonboolean approval flag must be rejected');
assert.equal(isApprovedGatewayProfile(good, undefined), false,
  'Unverified or missing token email must be rejected');

console.log('Gemini security guards OK: server-side key, signed Firebase auth, limited endpoints and ephemeral Live tokens.');

const { classifyFirebaseAuthFailure } = await import('../api/_firebaseAuthFailure.mjs');
const { requestLiveToken } = await import('../services/liveTokenRequest.mjs');
const { getDialectLiveError } = await import('../services/dialectLiveErrors.mjs');

// Regressions: IAM errors must not masquerade as expired user sessions.
assert.deepEqual(classifyFirebaseAuthFailure({ code: 'auth/id-token-expired' }), {
  statusCode: 401, code: 'AUTH_SESSION_INVALID', error: 'Invalid or expired session'
});
assert.equal(classifyFirebaseAuthFailure({ code: 'auth/id-token-revoked' }).statusCode, 401);
assert.equal(classifyFirebaseAuthFailure({ code: 'auth/user-disabled' }).statusCode, 401);
assert.equal(classifyFirebaseAuthFailure({ code: 'auth/insufficient-permission' }).statusCode, 503);
assert.equal(classifyFirebaseAuthFailure({ code: 'auth/insufficient-permission' }).code, 'AUTH_SERVICE_PERMISSION');
assert.equal(classifyFirebaseAuthFailure(new Error('secret key')).statusCode, 503);
assert.match(getDialectLiveError({ code: 'LIVE_AUTH_SERVICE_PERMISSION' }), /صلاحية Firebase Authentication/);
assert.doesNotMatch(getDialectLiveError({ code: 'LIVE_AUTH_SERVICE_UNAVAILABLE' }, 'en'), /expired/);

// Cached ID tokens get precisely one forced refresh after a 401, never an
// unauthenticated retry, and service/approval failures are not retried.
const issued = [];
const fakeUser = { getIdToken: async refresh => {
  issued.push(refresh);
  return refresh ? 'new-jwt' : 'cached-jwt';
}};
const statuses = [];
const liveToken = await requestLiveToken(fakeUser, async (_url, opts) => {
  statuses.push(opts.headers.authorization);
  return statuses.length === 1
    ? { status: 401, ok: false }
    : { status: 200, ok: true, json: async () => ({ token: 'auth_tokens/ephemeral' }) };
});
assert.equal(liveToken, 'auth_tokens/ephemeral');
assert.deepEqual(issued, [false, true]);
assert.deepEqual(statuses, ['Bearer cached-jwt', 'Bearer new-jwt']);
let deniedAttempts = 0;
await assert.rejects(
  requestLiveToken(fakeUser, async () => {
    deniedAttempts++;
    return { status: 503, ok: false, json: async () => ({ code: 'AUTH_SERVICE_PERMISSION' }) };
  }),
  error => error.code === 'LIVE_AUTH_SERVICE_PERMISSION'
);
assert.equal(deniedAttempts, 1);
assert.ok(auth.includes('verifyIdToken(match[1], true)'), 'Never bypass revocation checks');
console.log('Live gateway auth recovery and backend permission classification OK.');

const { verifyFirebaseRevocationViaLookup, assertFirebaseRestAccount } =
  await import('../api/_firebaseAuthRevocationFallback.mjs');
const signed = { uid: 'uid1', email: 'approved@example.com', auth_time: 1800000000, email_verified: true };
const active = { localId: 'uid1', email: 'approved@example.com', emailVerified: true, validSince: '1799999999', disabled: false };
const verifierCalls = [];
const fakeAdminAuth = { verifyIdToken: async (_token, checkRevoked) => {
  verifierCalls.push(checkRevoked);
  if (checkRevoked !== false) throw new Error('Should not skip signature verification');
  return signed;
}};
const lookupCalls = [];
const fakeLookup = async (_url, init) => {
  lookupCalls.push({ method: init.method, token: JSON.parse(init.body).idToken });
  return { ok: true, json: async () => ({ users: [active] }) };
};
assert.deepEqual(await verifyFirebaseRevocationViaLookup('valid-user-token', fakeAdminAuth, 'public-api-key', fakeLookup), signed);
assert.deepEqual(verifierCalls, [false], 'Fallback must verify token signature in Firebase Admin');
assert.deepEqual(lookupCalls, [{ method: 'POST', token: 'valid-user-token' }]);
for (const record of [
  { ...active, disabled: true },
  { ...active, validSince: '1800000001' },
  { ...active, localId: 'different-user' },
  { ...active, email: 'someone-else@example.com' },
  { ...active, emailVerified: false },
]) {
  assert.throws(() => assertFirebaseRestAccount(signed, record));
}
for (const badTime of [undefined, '', '-1', 'nan', '1800000000.5']) {
  assert.throws(() => assertFirebaseRestAccount(signed, { ...active, validSince: badTime }));
}
await assert.rejects(
  verifyFirebaseRevocationViaLookup('valid', fakeAdminAuth, 'public-key', async () => ({ok:false,status:403})),
  e => e.code === 'AUTH_REVOCATION_UNAVAILABLE',
);
await assert.rejects(
  verifyFirebaseRevocationViaLookup('valid', fakeAdminAuth, 'public-key', async () => ({ok:true,json:async()=>({users:[]})})),
  e => e.code === 'auth/user-not-found',
);
assert.match(auth, /verifyFirebaseRevocationViaLookup/);
assert.match(auth, /verifyIdToken\(match\[1\], true\)/);
assert.ok(auth.includes('isApprovedGatewayProfile(profile, decoded.email)'));
console.log('Secure fallback verified: signed JWT, current Firebase account, revocation, disabled user, fail-closed.');

const { execFileSync } = await import('node:child_process');
assert.ok(auth.includes("import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };"),
  'Vercel Node 24 ESM requires an explicit import type attribute for JSON modules');
execFileSync(process.execPath, ['--input-type=module', '-e',
  "import config from './firebase-applet-config.json' with { type: 'json' }; if (!config.projectId || !config.apiKey) process.exit(1);"
], { cwd: new URL('..', import.meta.url), stdio: 'pipe' });
console.log('Firebase JSON import attribute is valid in Node ESM runtime.');
