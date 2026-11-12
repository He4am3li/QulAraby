import assert from 'node:assert/strict';
import { scanSecretSource } from '../scripts/audit-client-secrets.mjs';

const scan = (file, source) => scanSecretSource(file, source).map(hit => hit.issue);
assert.deepEqual(scan('firebase-applet-config.json', '{"apiKey":"AIza' + 'A'.repeat(35) + '"}'), [],
  'Public Firebase client configuration is not a backend API secret');
assert.ok(scan('pages/Dialects.tsx', "const key = 'sk-" + 'x'.repeat(35) + "'").includes('OpenAI-style credential'),
  'Long-lived model credentials must not be embedded in the UI');
assert.ok(scan('pages/Reading.tsx', "const key = 'AIza" + 'A'.repeat(35) + "'").includes('Google API credential'),
  'Google keys outside intentional public Firebase config must be reviewed');
assert.ok(scan('components/AuthProvider.tsx', 'const key = import.meta.env.VITE_GEMINI_API_KEY')
  .includes('Browser-exposed secret variable name'),
  'Build-time browser exposure of Gemini keys must fail');
assert.ok(scan('pages/Speak.tsx', 'const key = process.env.GEMINI_API_KEY')
  .includes('Secret environment variable used in browser source'),
  'Browser code cannot read server credentials');
assert.ok(scan('vite.config.ts', "'process.env.GEMINI_API_KEY': JSON.stringify(key)")
  .includes('Server credential injected into Vite define'),
  'Vite define cannot inject a server secret');
assert.ok(scan('api/gemini.ts', 'const key = process.env.GEMINI_API_KEY').length === 0,
  'Server-only secret environment references are expected');
assert.ok(scan('services/gemini.ts', "apiKey: 'server-managed'").length === 0,
  'Nonsecret placeholders must remain valid');
assert.ok(scan('pages/Reading.tsx', 'const publicKey = import.meta.env.VITE_FIREBASE_API_KEY').length === 0,
  'Firebase client keys are deliberately public configuration');
assert.ok(scan('services/dialectMissionAssessment.ts',
  "const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })")
  .includes('Direct browser AI SDK client bypasses the protected gateway'),
  'Module-specific client initialization must be routed through the authenticated gateway');
assert.deepEqual(scan('services/gemini.ts', "const ai = new GoogleGenAI({ apiKey: 'server-managed' })"), [],
  'The reviewed API transport module may initialize the proxy SDK');
console.log('Secret exposure policy unit checks passed (11 cases).');
