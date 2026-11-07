import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
for (const name of ['advanced-images-batch-1.tar.gz', 'advanced-images-batch-2.tar.gz']) {
  const archive = fileURLToPath(new URL('../assets/detective/' + name, import.meta.url));
  if (!existsSync(archive)) throw new Error('Missing advanced detective archive: ' + name);
  const result = spawnSync('tar', ['-xzf', archive, '-C', root], { encoding: 'utf8' });
  if (result.status !== 0 || result.error) throw new Error('Advanced detective asset extraction failed for ' + name + ': ' + (result.stderr || result.error?.message));
}
console.log('Installed 10 advanced cinematic cases and their 106 portrait assets.');
