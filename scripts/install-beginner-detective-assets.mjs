import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const archive = fileURLToPath(new URL('../assets/detective/beginner-images.tar.gz', import.meta.url));

if (!existsSync(archive)) {
  throw new Error('The ten beginner-case scenes and portraits archive is missing.');
}

// Extract to public/ so both Vite development and Vercel production include
// all ten case scenes and the sixty matching character portraits.
const result = spawnSync('tar', ['-xzf', archive, '-C', root], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});

if (result.error || result.status !== 0) {
  throw new Error('Could not install beginner detective artwork: ' + (result.stderr || result.error?.message || 'tar failed'));
}
console.log('Installed beginner detective artwork for 10 cases.');
