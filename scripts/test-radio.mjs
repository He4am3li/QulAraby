import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const directory = await mkdtemp(join(tmpdir(), 'qul-radio-tests-'));
try {
  const outfile = join(directory, 'radio-data.test.mjs');
  await build({ entryPoints: ['tests/radio-data.test.ts'], outfile, bundle: true, platform: 'node', format: 'esm' });
  process.exitCode = spawnSync(process.execPath, ['--test', outfile], { stdio: 'inherit' }).status ?? 1;
} finally { await rm(directory, { recursive: true, force: true }); }
