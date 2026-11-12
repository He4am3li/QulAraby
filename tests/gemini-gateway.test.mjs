import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const vite = read('vite.config.ts');
const gemini = read('services/gemini.ts');
const proxy = read('api/gemini.ts');
const auth = read('api/_geminiAuth.ts');
const live = read('api/gemini-live-token.ts');
const sources = ['pages/Dialects.tsx','pages/Speak.tsx','pages/Preparation.tsx','pages/Quizzes.tsx'].map(read);

assert.ok(!vite.includes("'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)"),
  'Never bundle a server credential as a client define');
assert.ok(!vite.includes("'process.env.API_KEY': JSON.stringify(apiKey)"),
  'Legacy client key aliases must not be embedded');
assert.ok(vite.includes("import geminiHandler from './api/gemini'"),
  'Local development must use the same secure proxy');
assert.ok(gemini.includes("apiKey: 'server-managed'"), 'Browser client must use a nonsecret placeholder');
assert.ok(gemini.includes("headers.delete('x-goog-api-key')"), 'Strip placeholder key before sending');
assert.ok(gemini.includes("currentUser.getIdToken()"), 'Browser should authenticate proxy calls');
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
assert.ok(auth.includes('profile?.approved !== true') &&
  auth.includes('profile.email !== decoded.email'),
  'Gateway must reject pending, revoked, and mismatched user profiles');
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
console.log('Gemini security guards OK: server-side key, signed Firebase auth, limited endpoints and ephemeral Live tokens.');
