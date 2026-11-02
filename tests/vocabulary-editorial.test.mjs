/**
 * Editorial safety checks for the 480 built-in vocabulary cards.
 * These prevent common misleading glosses and category leaks from returning.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../pages/Vocabulary.tsx', import.meta.url), 'utf8');
const stories = readFileSync(new URL('../data/vocabularyContextStories.ts', import.meta.url), 'utf8');
const groups = [...source.matchAll(/const ([A-Z_]+): Partial<Vocabulary>\[\] = \[([\s\S]*?)\n\];/g)];
assert.equal(groups.length, 30, 'All 30 topics must remain present');

const byGroup = new Map();
for (const [, name, body] of groups) {
  const cards = [...body.matchAll(/original_word: '([^']+)', translation: '([^']+)', emoji: '([^']+)'/g)]
    .map(([, ar, en, emoji]) => ({ ar, en, emoji }));
  assert.equal(cards.length, 16, name + ': exactly 16 learning cards required');
  assert.equal(new Set(cards.map(card => card.ar.normalize('NFC').trim())).size, 16,
    name + ': repeated Arabic card');
  for (const card of cards) {
    assert.ok(card.ar.trim().length > 0 && card.en.trim().length > 0,
      name + ': untranslated word');
    assert.ok(!card.en.includes(' / '), name + ': ambiguous multiple translations: ' + card.en);
    assert.ok(card.emoji.trim(), name + ': empty illustration fallback');
  }
  byGroup.set(name, cards);
}
assert.equal([...byGroup.values()].flat().length, 480, 'Editorial coverage must include all 480 cards');

const expects = [
  ['BIRDS_DATA', 'صقر', 'Falcon'],
  ['BIRDS_DATA', 'بجعة', 'Swan'],
  ['WEATHER_DATA', 'رطب', 'Humid'],
  ['VEGETABLES_DATA', 'بازلاء', 'Peas'],
  ['FRUITS_DATA', 'توت أزرق', 'Blueberry'],
  ['NATURE_DATA', 'وادٍ', 'Valley'],
  ['TECHNOLOGY_DATA', 'شاحن', 'Charger'],
  ['HEALTH_DATA', 'سيارة إسعاف', 'Ambulance'],
  ['FISH_DATA', 'حلزون بحري', 'Sea snail'],
  ['FISH_DATA', 'دودة بحرية', 'Marine worm'],
  ['CLOTHING_DATA', 'حذاء بكعب عالٍ', 'High-heeled shoe'],
  ['CLASS_DATA', 'قلم تلوين', 'Colored pencil']
];
for (const [group, ar, en] of expects) {
  assert.ok(byGroup.get(group)?.some(card => card.ar === ar && card.en === en),
    'Corrected editorial pairing missing: ' + group + ' ' + ar + ' / ' + en);
}
assert.ok(!byGroup.get('BIRDS_DATA').some(card => card.ar === 'خفاش' || card.en === 'Bat'),
  'Mammals must not be taught as birds');
assert.ok(!byGroup.get('VEGETABLES_DATA').some(card => card.ar === 'ليمون'),
  'Lemon must not be classified as a vegetable');
assert.match(stories, /\[\[1\|صقرًا\]\]/);
assert.match(stories, /\[\[14\|بجعةً\]\]/);
assert.match(stories, /\[\[7\|البازلاء\]\]/);
assert.match(stories, /\[\[10\|التوت الأزرق\]\]/);
assert.ok(source.includes('await runTransaction(db, async transaction =>'),
  'Reviews must be computed against the current Firestore document');
assert.ok(source.includes('const snapshot = await transaction.get(wordRef);'),
  'Transactional review must reread the latest stored mastery');
assert.ok(source.includes('const result = updateSRS(current, correct'),
  'Do not score against a stale UI snapshot');

console.log('Vocabulary editorial OK: 30 topics, 480 cards, accurate glossary guards and transactional reviews.');
