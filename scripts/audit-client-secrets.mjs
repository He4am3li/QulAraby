import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = /\.(?:js|jsx|ts|tsx|mjs|cjs|json|html|yml|yaml|env)$/i;
const CLIENT = /^(?:pages|components|services|src|data|utils|helpers)\//;
const CLIENT_ROOT = new Set(['App.tsx', 'firebase.ts', 'index.tsx', 'index.html']);
const SECRET_KEY_PATTERNS = [
  ['OpenAI-style credential', /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}/g],
  ['Google API credential', /\bAIza[0-9A-Za-z_-]{30,}/g],
  ['GitHub access token', /\bgh[pousr]_[A-Za-z0-9_]{30,}/g],
  ['AWS access key ID', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ['Slack access token', /\bxox[baprs]-[A-Za-z0-9-]{20,}/g],
  ['Stripe secret key', /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{20,}/g],
  ['PEM private key', /-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/g],
];
const SECRET_CLIENT_NAME = /\b(?:VITE_|NEXT_PUBLIC_)[A-Z0-9_]*(?:GEMINI|OPENAI|ANTHROPIC|PRIVATE|SECRET|PASSWORD|SERVICE_ACCOUNT|CREDENTIAL)[A-Z0-9_]*\b/g;
const CLIENT_ENV_REFERENCE = /\b(?:process\.env|import\.meta\.env)\.(?:GEMINI_API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY|FIREBASE_SERVICE_ACCOUNT_JSON|GOOGLE_APPLICATION_CREDENTIALS)\b/g;

export function scanSecretSource(file, source) {
  const errors = [];
  const lines = source.split(/\r?\n/);
  const client = CLIENT.test(file) || CLIENT_ROOT.has(file);
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n];
    for (const [name, pattern] of SECRET_KEY_PATTERNS) {
      pattern.lastIndex = 0;
      if (name === 'Google API credential' && file === 'firebase-applet-config.json') continue;
      if (pattern.test(line)) errors.push({ file, line: n + 1, issue: name });
    }
    SECRET_CLIENT_NAME.lastIndex = 0;
    CLIENT_ENV_REFERENCE.lastIndex = 0;
    if (SECRET_CLIENT_NAME.test(line)) errors.push({ file, line: n + 1, issue: 'Browser-exposed secret variable name' });
    if (client && CLIENT_ENV_REFERENCE.test(line)) errors.push({ file, line: n + 1, issue: 'Secret environment variable used in browser source' });
    if (file === 'vite.config.ts' &&
        /['"]process\.env\.(?:API_KEY|GEMINI_API_KEY|FIREBASE_SERVICE_ACCOUNT_JSON)['"]\s*:/.test(line)) {
      errors.push({ file, line: n + 1, issue: 'Server credential injected into Vite define' });
    }
  }
  return errors;
}

export function auditTrackedSources() {
  const paths = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, maxBuffer: 20 * 1024 * 1024 })
    .toString('utf8').split('\0').filter(Boolean);
  const problems = [];
  let inspected = 0;
  for (const file of paths) {
    if (/(^|\/)\.env(?:\.(?!example$|sample$)[^/]*)?$/.test(file)) {
      problems.push({ file, line: 0, issue: 'Tracked private environment file' });
    }
    if (file.startsWith('tests/') || file === 'scripts/audit-client-secrets.mjs' ||
        file === 'package-lock.json' || !SOURCE.test(file)) continue;
    let content;
    try {
      content = readFileSync(path.join(ROOT, file), 'utf8');
    } catch {
      problems.push({ file, line: 0, issue: 'Unable to read tracked source' });
      continue;
    }
    if (content.includes('\0')) continue;
    inspected++;
    problems.push(...scanSecretSource(file, content));
  }
  return { inspected, problems };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { inspected, problems } = auditTrackedSources();
  if (problems.length) {
    for (const { file, line, issue } of problems) {
      // Never print suspected credential content into CI logs.
      console.error(file + ':' + line + ': ' + issue);
    }
    console.error('Secret exposure audit failed: ' + problems.length + ' finding(s).');
    process.exitCode = 1;
  } else {
    console.log('Secret exposure audit passed: ' + inspected + ' tracked text source files checked.');
  }
}
