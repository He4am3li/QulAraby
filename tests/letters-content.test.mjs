/**
 * End-to-end editorial guard for the full 28-letter QUL curriculum.
 * Covers the 28 × 4 contextual words, 28 × 3 distractors,
 * 28 × 4 diacritic examples, and positional/vowel consistency.
 * No network, API, credentials or TTS are required for this test.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../pages/Letters.tsx', import.meta.url), 'utf8');

const sourceSlice = (begin, end) => {
  const a = source.indexOf(begin);
  const b = source.indexOf(end, a + begin.length);
  assert.ok(a >= 0 && b > a, 'Unable to extract teaching data: ' + begin);
  return source.slice(a, b);
};
const readGroups = (text) => {
  const starts = [...text.matchAll(/^  '([^']+)': \{/gm)];
  return new Map(starts.map((item, index) => [
    item[1], text.slice(item.index, starts[index + 1]?.index ?? text.length)
  ]));
};
const stripMarks = (word) => word
  .normalize('NFC')
  .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
  .replace(/[إآٱ]/g, 'أ')
  .replace(/ى/g, 'ي');
const letterRoot = letter => letter === 'هـ' ? 'ه' : stripMarks(letter);

const alphabetText = sourceSlice('const ALPHABET = [', 'const HARAKAT = [');
const alphabet = [...alphabetText.matchAll(/\{ char: '([^']+)', name: '([^']+)', translit: "([^"]+)", example: '([^']+)'/g)];
const letters = alphabet.map(x => x[1]);
assert.equal(letters.length, 28, 'Alphabet should have exactly 28 letters');
assert.equal(new Set(letters).size, 28, 'No repeated alphabet letters');
for (const [, char, name, translit, example] of alphabet) {
  assert.ok(name.trim() && translit.trim(), 'Missing letter name or transliteration: ' + char);
  assert.ok(stripMarks(example).includes(letterRoot(char)), 'Letter name example misses character: ' + char);
}

const wordGroups = readGroups(sourceSlice('const LETTER_WORDS:', 'const WordDiscriminationGame:'));
const tashGroups = readGroups(sourceSlice('const TASHKEEL_WORDS:', 'const WordTashkeelGame:'));
const soundText = sourceSlice('const SIMILAR_SOUNDS:', 'const AuditoryGame:');
assert.deepEqual([...wordGroups.keys()], letters, 'Every letter should have a word recognition collection');
assert.deepEqual([...tashGroups.keys()], letters, 'Every letter should have a tashkeel collection');

let targetCount = 0;
let decoyCount = 0;
let tashkeelCount = 0;
for (const char of letters) {
  const root = letterRoot(char);

  const wordBlock = wordGroups.get(char);
  const [targetBlock, distractorBlock = ''] = wordBlock.split('distractors:');
  const targets = [...targetBlock.matchAll(
    /\{ word: '([^']+)', position: '(initial|medial|final)', meaningAr: '([^']+)', meaningEn: '([^']+)' \}/g
  )];
  const decoys = [...distractorBlock.matchAll(
    /\{ word: '([^']+)', meaningAr: '([^']+)', meaningEn: '([^']+)' \}/g
  )];
  assert.equal(targets.length, 4, 'A complete letter should have four target words: ' + char);
  assert.equal(decoys.length, 3, 'A complete letter should have three distractors: ' + char);
  assert.deepEqual(
    targets.map(x => x[2]).sort(),
    ['initial', 'initial', 'medial', 'final'].sort(),
    'Each letter needs two starting, one medial and one final word: ' + char
  );
  const seenTargets = new Set();
  for (const [, word, pos, ar, en] of targets) {
    assert.ok(ar.trim() && en.trim(), 'Every target word needs both Arabic and English meanings: ' + word);
    const normalized = [...stripMarks(word)];
    const indices = normalized.flatMap((item, index) => item === root ? [index] : []);
    assert.ok(indices.length, 'Target letter missing from teaching word: ' + char + ' / ' + word);
    const positionMatches = indices.some(i =>
      pos === 'initial' ? i === 0 :
      pos === 'final' ? i === normalized.length - 1 :
      i > 0 && i < normalized.length - 1
    );
    assert.ok(positionMatches, 'Wrong ' + pos + ' position: ' + char + ' / ' + word);
    assert.ok(!seenTargets.has(normalized.join('')), 'Repeated target word: ' + char + ' / ' + word);
    seenTargets.add(normalized.join(''));
    targetCount++;
  }
  for (const [, word, ar, en] of decoys) {
    assert.ok(ar.trim() && en.trim(), 'Every distractor needs Arabic and English meaning: ' + word);
    assert.ok(!stripMarks(word).includes(root), 'Distractor includes target letter: ' + char + ' / ' + word);
    assert.ok(!seenTargets.has(stripMarks(word)), 'Distractor duplicates a target: ' + char + ' / ' + word);
    decoyCount++;
  }

  const tashBlock = tashGroups.get(char);
  const entries = [...tashBlock.matchAll(
    /(fatha|damma|kasra|sukoon):\s*\{ word: '([^']+)', charWithDiacritic: '([^']+)', meaningAr: '([^']+)', meaningEn: '([^']+)' \}/g
  )];
  assert.deepEqual(entries.map(x => x[1]).sort(), ['fatha','damma','kasra','sukoon'].sort(), 'Missing tashkeel case for ' + char);
  const diacritics = { fatha:'\u064E', damma:'\u064F', kasra:'\u0650', sukoon:'\u0652' };
  for (const [, kind, word, representation, meaningAr, meaningEn] of entries) {
    assert.ok(meaningAr.trim() && meaningEn.trim(), 'Tashkeel examples need bilingual meanings: ' + char);
    assert.ok(word.normalize('NFC').includes(representation.normalize('NFC')),
      'Displayed diacritic does not occur in word: ' + char + ' / ' + kind + ' / ' + word);
    assert.ok(representation.includes(diacritics[kind]),
      'Incorrect mark for ' + char + ' / ' + kind);
    // Hamza under alif is the normal kasra form of the alif lesson.
    const charBase = stripMarks(representation);
    assert.ok(charBase === root || (root === 'أ' && charBase === 'أ'),
      'Another letter is incorrectly used to demonstrate ' + char + ': ' + representation);
    tashkeelCount++;
  }
}
assert.equal(targetCount, 112);
assert.equal(decoyCount, 84);
assert.equal(tashkeelCount, 112);

// Contrasting sounds should never contain the exact target itself.
const sounds = [...soundText.matchAll(/^  '([^']+)': \[([^\]]+)\]/gm)];
assert.equal(sounds.length, 28, 'Contrasting sounds must cover all 28 letters');
for (const [, char, raw] of sounds) {
  const choices = [...raw.matchAll(/'([^']+)'/g)].map(x => x[1]);
  assert.equal(choices.length, 3, 'Three contrasting consonants per letter: ' + char);
  assert.equal(new Set(choices).size, 3, 'Contrasting sounds should be unique: ' + char);
  assert.ok(!choices.includes(char), 'The target cannot also be a contrasting sound: ' + char);
  for (const choice of choices) assert.ok(letters.includes(choice), 'Unknown contrasting letter: ' + choice);
}

// Evaluate only the standalone, pure Unicode-composition helper,
// so the actual rendered spelling is tested rather than a comment in source.
const functionMatch = source.match(/const getCombinedChar = \(base: string, symbol: string\) => \{([\s\S]*?)\n\};/);
assert.ok(functionMatch, 'Missing letter-vowel compositor');
const getCombinedChar = new Function('base', 'symbol', functionMatch[1]);
assert.equal(getCombinedChar('ل', '\u064E\u0627'), 'لَا', 'Long alif should follow a fatha on lam');
assert.equal(getCombinedChar('ل', '\u064B'), 'لًا', 'Fatha tanween should come before the alif');
assert.equal(getCombinedChar('أ', '\u064E\u0627'), 'آ', 'Madda needs no additional fatha');
assert.equal(getCombinedChar('أ', '\u0650'), 'إِ', 'Kasra alif needs a hamza below');
assert.equal(getCombinedChar('ب', '\u064B'), 'بًا', 'Fatha tanween on standard consonants');
assert.equal(getCombinedChar('هـ', '\u064E'), 'هَ', 'No tatweel should remain inside vowel examples');

console.log('Letters editorial audit OK: 28 letters, 112 positional words, 84 distractors, 112 diacritic samples, 84 contrasting sounds, and Unicode vowel spellings.');
