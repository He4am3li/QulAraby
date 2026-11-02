/**
 * Guard 30 topic word lists and their grammatical contexts.
 * Run with: npm run test:vocabulary
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../pages/Vocabulary.tsx', import.meta.url), 'utf8');
const contextsSource = readFileSync(new URL('../data/vocabularyContextStories.ts', import.meta.url), 'utf8');
const start = contextsSource.indexOf('= {');
assert.ok(start > 0, 'Context map must be JSON serializable');
const contexts = JSON.parse(contextsSource.slice(start + 2, contextsSource.lastIndexOf(';')).trim());
const topicList = src.slice(src.indexOf('const ALL_TOPICS = ['), src.indexOf('];', src.indexOf('const ALL_TOPICS = [')));
const topicIds = [...topicList.matchAll(/\bid: '([^']+)'/g)].map(x => x[1]);
const topicToArray = Object.fromEntries(
  [...src.matchAll(/topic\.id === '([^']+)'\)\s*\{\s*setDiscoveryQueue\(([A-Z_]+)\)/g)]
    .map(m => [m[1], m[2]])
);
assert.equal(topicIds.length, 30);
assert.deepEqual(Object.keys(contexts).sort(), topicIds.slice().sort());
for (const id of topicIds) {
  const name = topicToArray[id];
  assert.ok(name, id + ' must have a static vocabulary array');
  const opening = 'const ' + name + ': Partial<Vocabulary>[] = [';
  const begin = src.indexOf(opening);
  assert.ok(begin >= 0, id + ': missing vocabulary array');
  const end = src.indexOf('\n];', begin);
  assert.ok(end > begin, id + ': malformed vocabulary array');
  const cards = [...src.slice(begin, end).matchAll(/original_word:\s*'/g)];
  const story = contexts[id];
  const markers = [...story.ar.matchAll(/\[\[(\d+)\|([^\]]+)\]\]/g)];
  assert.equal(markers.length, cards.length, id + ': every word must have one contextual occurrence');
  assert.deepEqual(markers.map(m => Number(m[1])).sort((a, b) => a-b),
    cards.map((_, index) => index), id + ': context indices must match card indices');
  const spoken = story.ar.replace(/\[\[\d+\|([^\]]+)\]\]/g, '$1');
  assert.ok(!spoken.includes('[['), id + ': audio must not contain markup');
  assert.equal(story.ar.split('\n\n').length, story.en.split('\n\n').length,
    id + ': translation paragraphs should align');
  assert.ok(story.ar.length > 100 && story.en.length > 60, id + ': context must not be empty');
}
assert.match(contexts.family_hobbies.ar, /\[\[12\|الوالدين\]\]/);
assert.match(contexts.family_hobbies.ar, /\[\[0\|أبي\]\]/);
assert.match(contexts.feelings.ar, /\[\[4\|بالحزن\]\]/);
assert.ok(src.includes('renderContextualStory(paragraph, words'));
assert.ok(src.includes('context_surface'));
assert.ok(!src.includes('TOPIC_STORIES'));
console.log('Vocabulary contexts OK: 30 topics, 480 linked forms, matching translations and clean speech.');
