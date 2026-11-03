/**
 * Validate packaged letter-name recordings and the playback integration.
 * These assertions run before each preview/production build.
 */
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';

const page = readFileSync(new URL('../pages/Letters.tsx', import.meta.url), 'utf8');
const player = readFileSync(new URL('../services/letterAudio.ts', import.meta.url), 'utf8');
const alphabetSection = page.slice(page.indexOf('const ALPHABET = ['), page.indexOf('];', page.indexOf('const ALPHABET = [')));
const alphabet = [...alphabetSection.matchAll(/char: '([^']+)'/g)].map(m => m[1]);

const mapSection = player.slice(player.indexOf('LETTER_NAME_AUDIO_FILES:'), player.indexOf('};', player.indexOf('LETTER_NAME_AUDIO_FILES:')));
const files = [...mapSection.matchAll(/^\s*'([^']+)': '([^']+\.mp3)'/gm)]
  .map(([, letter, file]) => ({ letter, file }));

assert.equal(files.length, 28, 'Each of the 28 Arabic letters must have a local recording');
assert.deepEqual(files.map(f => f.letter).sort(), [...alphabet].sort(), 'Audio keys must match displayed alphabet');
assert.equal(new Set(files.map(f => f.file)).size, 28, 'Every letter needs its own recorded file');

let bytes = 0;
for (const { letter, file } of files) {
  assert.match(file, /^[a-z0-9-]+\.mp3$/, `${letter}: use a safe ASCII filename`);
  const asset = new URL(`../public/audio/letters/${file}`, import.meta.url);
  const size = statSync(asset).size;
  assert.ok(size > 1000 && size < 30_000, `${letter}: expected a small nonempty MP3, got ${size} bytes`);
  const magic = readFileSync(asset).subarray(0, 4);
  assert.ok(magic.subarray(0, 3).toString() === 'ID3' || (magic[0] === 0xff && (magic[1] & 0xe0) === 0xe0),
    `${letter}: invalid MP3 header`);
  bytes += size;
}
assert.ok(bytes < 250_000, 'All 28 optimized recordings should stay under 250 KB total');
assert.ok(page.includes('preloadLetterNames();'), 'Audio must warm up on opening the Letters page');
assert.ok(page.includes('onClick={() => { setSelectedChar(item); handlePlayLetterName(item.char); }}'),
  'Selecting a letter must play its bundled recording');
assert.ok(page.includes('onClick={() => handlePlayLetterName(selectedChar.char)}'),
  'Letter detail replay must use the bundled recording');
assert.ok(!page.includes('handleSpeak(`حرف ${item.char}`'),
  'Letter selections must not generate letter-name speech');
assert.ok(!page.includes('handleSpeak(`حرف ${selectedChar.char}`'),
  'Detail replays must not generate letter-name speech');
assert.ok(player.includes("audio.preload = 'auto'"));
assert.ok(player.includes('return audio.play();'));

console.log(`Local letters audio OK: ${files.length} recordings, ${bytes} bytes, no letter-name TTS requests.`);
