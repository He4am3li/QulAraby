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
assert.match(contexts.feelings.ar, /\[\[4\|حزينًا\]\]/);
assert.ok(src.includes('renderContextualStory(paragraph, words'));
assert.ok(src.includes('context_surface'));
assert.ok(!src.includes('TOPIC_STORIES'));
assert.ok(src.includes("lang === 'ar' ? 'في النص:' : 'In the text:'"), 'Context label must be bilingual');
assert.ok(src.includes("lang === 'ar' ? 'في البطاقة:' : 'On the card:'"), 'Base form label must be bilingual');
assert.ok(src.includes('The word changes form to fit its role in the sentence.'), 'English context note missing');
assert.ok(src.includes('تتغير صورة الكلمة لتناسب موقعها في الجملة.'), 'Arabic context note missing');
assert.ok(src.includes('selectedWord, lang)'), 'Context word controls must receive language');
assert.ok(src.includes("lang === 'ar' ? 'استمع للكلمة' : 'Listen to the word'"), 'Speech control must be localized');
assert.ok(src.includes("lang === 'ar' ? 'إغلاق' : 'Close'"), 'Close control must be localized');
console.log('Vocabulary contexts OK: 30 topics, 480 linked forms, matching translations and clean speech.');
// Keep one concise bilingual hint per topic and the original small popover.
const hintsText = readFileSync(new URL('../data/vocabularyUsageTips.ts', import.meta.url), 'utf8');
const hintPrefix = 'export const VOCABULARY_TOPIC_HINTS: Record<string, VocabularyTopicHint> = ';
const hintStart = hintsText.indexOf(hintPrefix);
assert.ok(hintStart >= 0, 'Compact topic hints must be exported');
const hints = JSON.parse(hintsText.slice(hintStart + hintPrefix.length, hintsText.lastIndexOf(';')).trim());
assert.deepEqual(Object.keys(hints).sort(), topicIds.slice().sort(), 'Every topic needs its own hint');
for (const topicId of topicIds) {
  const hint = hints[topicId];
  assert.deepEqual(Object.keys(hint).sort(), ['ar','en'], topicId + ': only Arabic and English hint text');
  assert.ok(typeof hint.ar === 'string' && hint.ar.trim().length > 30, topicId + ': Arabic hint is missing');
  assert.ok(typeof hint.en === 'string' && hint.en.trim().length > 35, topicId + ': English translation is missing');
}
assert.ok(src.includes('VOCABULARY_TOPIC_HINTS[topic.id]?.[lang]'), 'Tip language must match the interface');
assert.ok(src.includes('left-full ml-4'), 'Restore original right-side hint placement in Arabic');
assert.ok(src.includes('right-full mr-4'), 'Restore original left-side hint placement in English');
assert.ok(src.includes('w-64 p-4 bg-white border border-amber-100 rounded-2xl'), 'Keep original compact hint shape');
assert.ok(src.includes('{currentHint}'), 'Show one tip, not an exercise');
assert.ok(!src.includes('showUsageForCard'), 'No hints on individual vocabulary cards');
assert.ok(!src.includes('<VocabularyUsageTips'), 'Interactive lesson panel must be removed');
assert.ok(!src.includes('selectedUsageChoice'), 'No quiz controls in tip bubble');
assert.ok(!src.includes('VOCABULARY_USAGE_TIPS'), 'Remove old interactive tips data reference');
console.log('Compact bilingual hints OK: 30 topics, no card icons or quizzes, original bubble restored.');
