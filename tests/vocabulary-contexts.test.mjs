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
// Validate the hands-on usage tips against the actual 30-topic card arrays.
const tipsText = readFileSync(new URL('../data/vocabularyUsageTips.ts', import.meta.url), 'utf8');
const tipPrefix = 'export const VOCABULARY_USAGE_TIPS: Record<string, VocabularyUsageTip[]> = ';
const tipStart = tipsText.indexOf(tipPrefix);
assert.ok(tipStart >= 0, 'Vocabulary usage tips must exist');
const usageTips = JSON.parse(tipsText.slice(tipStart + tipPrefix.length, tipsText.lastIndexOf(';')).trim());
assert.deepEqual(Object.keys(usageTips).sort(), topicIds.slice().sort());
let totalTips = 0;
let linkedExamples = 0;
for (const topicId of topicIds) {
  const name = topicToArray[topicId];
  const start = src.indexOf('const ' + name + ': Partial<Vocabulary>[] = [');
  const end = src.indexOf('\n];', start);
  const cards = [...src.slice(start, end).matchAll(/original_word:\s*'([^']+)'/g)].map(m => m[1]);
  const tips = usageTips[topicId];
  assert.ok(Array.isArray(tips) && tips.length > 0, topicId + ': missing usage tips');
  totalTips += tips.length;
  for (const [tipIndex, tip] of tips.entries()) {
    const tag = topicId + '[' + tipIndex + ']';
    for (const field of ['title', 'instruction']) {
      assert.ok(tip[field]?.ar?.trim() && tip[field]?.en?.trim(), tag + ': ' + field + ' must be bilingual');
    }
    assert.ok(tip.practice?.question?.ar?.trim() && tip.practice?.question?.en?.trim(), tag + ': missing bilingual question');
    assert.equal(tip.practice?.options.length, 3, tag + ': practice needs 3 options');
    assert.ok(Number.isInteger(tip.practice.correctIndex) && tip.practice.correctIndex >= 0 && tip.practice.correctIndex < 3, tag + ': invalid answer');
    assert.equal(new Set(tip.practice.options).size, 3, tag + ': duplicate answers');
    assert.ok(tip.examples.length >= 2, tag + ': at least 2 examples');
    assert.equal(new Set(tip.examples.map(e => e.wordIndex)).size, tip.examples.length, tag + ': repeated card example');
    for (const example of tip.examples) {
      assert.ok(Number.isInteger(example.wordIndex) && example.wordIndex >= 0 && example.wordIndex < cards.length, tag + ': invalid card link');
      assert.ok(example.usage?.trim(), tag + ': missing example sentence');
      linkedExamples++;
    }
  }
}
assert.ok(totalTips >= 39, 'Expected a diverse set of practical usage tips');
assert.ok(linkedExamples >= 150, 'Expected many word-level applications');
assert.ok(src.includes('showUsageForCard(i)'), 'Every relevant card needs a usage tip affordance');
assert.ok(src.includes('<VocabularyUsageTips'), 'Usage tip component must be present');
const tipsUI = readFileSync(new URL('../components/VocabularyUsageTips.tsx', import.meta.url), 'utf8');
assert.ok(tipsUI.includes("tip.practice.question[lang]"), 'Exercises must be bilingual');
assert.ok(tipsUI.includes('choiceIndex === tip.practice.correctIndex'), 'Answer feedback must be grounded');
assert.ok(tipsUI.includes('tip.examples[exampleIndex]?.usage'), 'Word-specific usage examples must display');
console.log('Applied usage tips OK: ' + totalTips + ' micro-lessons across 30 topics, ' + linkedExamples + ' word-card examples.');

