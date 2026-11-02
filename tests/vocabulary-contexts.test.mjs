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


// Worksheet preview belongs at the bottom of the topic frame, physically left in
// Arabic and right in English, never inside the word cards or the header.
assert.equal((src.match(/setShowWorksheetPreview\(true\)/g) || []).length, 1,
  'Only one worksheet preview button should remain');
const footerIndex = src.indexOf('data-testid="worksheet-preview-bottom-footer"');
const cardsIndex = src.indexOf('words.map((f, i) =>');
const modalIndex = src.indexOf('isOpen={showWorksheetPreview}');
assert.ok(footerIndex > cardsIndex && footerIndex < modalIndex,
  'The preview action must be below vocabulary cards and above the worksheet modal');
const footer = src.slice(footerIndex, src.indexOf('{/* Printable Topic Worksheet', footerIndex));
assert.ok(footer.includes('dir="ltr"'),
  'Force physical left/right direction independent of RTL document flow');
assert.ok(footer.includes("lang === 'ar' ? 'justify-start' : 'justify-end'"),
  'Arabic places preview at the left and English at the right');
assert.ok(footer.includes('shrink-0 w-full flex'),
  'Bottom action must remain visible outside the scrolling vocabulary list');
assert.ok(footer.includes("lang === 'ar' ? 'معاينة ورقة العمل' : 'Worksheet Preview'"),
  'Keep the bilingual preview label');
assert.ok(src.indexOf('setShowHint(!showHint)') < cardsIndex,
  'The existing lightbulb must stay in the topic header');
console.log('Worksheet preview layout OK: bottom-left Arabic, bottom-right English, no duplicate control.');

// The reference is a convex water-glass sphere with the artwork inside it,
// not a decorative ellipse drawn on top of a rectangular card.
const topicGlassCSS = readFileSync(new URL('../components/vocabulary-topic-glass.css', import.meta.url), 'utf8');
const topicCardsStart = src.indexOf('{ALL_TOPICS.map(topic => {');
const topicCardsEnd = src.indexOf('})}', topicCardsStart);
assert.ok(topicCardsStart >= 0 && topicCardsEnd > topicCardsStart, 'Topic chooser section not found');
const chooser = src.slice(topicCardsStart, topicCardsEnd);
assert.ok(src.includes("import '../components/vocabulary-topic-glass.css';"), 'Topic glass stylesheet must load');
assert.ok(chooser.includes('qul-vocab-topic-glass rounded-3xl'), 'Topic cards should stay glazed');
assert.ok(chooser.includes('className="qul-vocab-topic-orb"'), 'Artwork must live inside a real circular lens');
assert.ok(chooser.includes('className="qul-vocab-topic-orb-content"'), 'Word artwork must be within the sphere');
assert.ok(chooser.includes('className="qul-vocab-topic-orb-refraction"'), 'Sphere needs a refractive edge');
assert.ok(chooser.includes('className="qul-vocab-topic-orb-reflection"'), 'Sphere needs optical reflections');
assert.ok(chooser.includes('className="qul-vocab-topic-orb-shadow"'), 'Sphere needs a grounding shadow');
assert.ok(chooser.includes('qul-vocab-topic-glass-arrow'), 'Original arrow control must remain');
assert.ok(chooser.includes('startDiscovery(topic)'), 'Topic navigation must work');
assert.ok(chooser.includes('aria-hidden="true"'), 'Glass orb is decorative, card name is announced');
assert.ok(topicGlassCSS.includes('.qul-vocab-topic-orb {'), 'Spherical lens CSS missing');
assert.ok(topicGlassCSS.includes('aspect-ratio: 1;'), 'Glass lens must be spherical');
assert.ok(topicGlassCSS.includes('border-radius: 50%'), 'Spherical edge missing');
assert.ok(topicGlassCSS.includes('mask-image: radial-gradient'), 'Soft optical edge missing');
assert.ok(topicGlassCSS.includes('backdrop-filter: blur('), 'Actual background optical diffusion missing');
assert.ok(topicGlassCSS.includes('qul-vocab-topic-orb-refraction'), 'Refractive rim missing');
assert.ok(topicGlassCSS.includes('qul-vocab-topic-orb-reflection'), 'Highlights missing');
assert.ok(topicGlassCSS.includes('pointer-events: none'), 'Optical overlays must not intercept taps');
assert.ok(topicGlassCSS.includes('prefers-reduced-motion: reduce'), 'Reduced motion support missing');
assert.ok(topicGlassCSS.includes('@supports not'), 'Optical fallback required');
assert.ok(!src.includes('TOPIC_GLASS_RGB'), 'No unwanted new color tints');
assert.ok(!topicGlassCSS.includes('topic-glass-rgb'), 'Sphere must remain color neutral');
assert.ok(!chooser.includes('qul-vocab-topic-water-shine'), 'Remove the old fake water spot');
assert.ok(!chooser.includes('qul-vocab-topic-glass-icon'), 'Remove rectangular icon tile inside sphere');
assert.ok(!src.slice(topicCardsEnd).includes('qul-vocab-topic-orb'), 'Do not affect in-topic flashcards');
assert.ok(src.includes('data-testid="worksheet-preview-bottom-footer"'), 'Keep worksheet preview footer unchanged');
console.log('Convex sphere OK: 30 external topic cards, refractive rim, protected lesson contents.');


// Outer vocabulary cards now use the SAME Framer Motion hover driver as the
// rectangular ModuleCard in Home, without changing their 2px displacement,
// optical appearance, typography, shadow, or navigation.
const homeSrc = readFileSync(new URL('../pages/Home.tsx', import.meta.url), 'utf8');
const homeCard = homeSrc.slice(homeSrc.indexOf('export const ModuleCard:'), homeSrc.indexOf('interface ProgressItemProps'));
assert.ok(homeCard.includes('<motion.button'), 'Home cards must use Motion');
assert.ok(homeCard.includes('whileHover={{ y: -8'), 'Home hover animation reference missing');
const topicCardStart = chooser.indexOf('<motion.button');
const topicCardEnd = chooser.indexOf('</motion.button>', topicCardStart);
assert.ok(topicCardStart >= 0 && topicCardEnd > topicCardStart, 'Vocabulary topic card must use Motion, like Home');
const topicCard = chooser.slice(topicCardStart, topicCardEnd);
assert.ok(topicCard.includes('whileHover={{ y: -2 }}'), 'Use same Motion hover timing, preserve original -2px movement');
assert.ok(topicCard.includes('whileFocus={{ y: -2 }}'), 'Keyboard users must retain the same focus movement');
assert.ok(!topicCard.includes('transition={{'), 'Do not override the Home card Motion default transition');
assert.ok(topicCard.includes('startDiscovery(topic)'), 'Navigation must remain unchanged');
const baseTransition = topicGlassCSS.match(/\.qul-vocab-topic-glass\s*\{([\s\S]*?)\n\}/)?.[1] || '';
const hoverTransition = topicGlassCSS.match(/\.qul-vocab-topic-glass:hover,\s*\.qul-vocab-topic-glass:focus-visible\s*\{([\s\S]*?)\n\}/)?.[1] || '';
assert.ok(!baseTransition.includes('transition: transform'), 'CSS may not compete with Motion transform timing');
assert.ok(!hoverTransition.includes('transform: translateY'), 'CSS may not compete with Motion hover movement');
assert.ok(baseTransition.includes('box-shadow .09s'), 'Keep existing fast border and shadow return');
assert.ok(hoverTransition.includes('transition-duration: .155s'), 'Keep unchanged hover border/shadow timing');
assert.ok(topicGlassCSS.includes('transform .085s'), 'Keep existing orb settling');
assert.ok(topicGlassCSS.includes('@media (hover: none)'), 'Preserve touch behavior');
assert.ok(topicGlassCSS.includes('@media (prefers-reduced-motion: reduce)'), 'Preserve reduced motion behavior');
console.log('Home motion parity OK: external topic cards use the same Motion hover engine without styling changes.');


// Match only the two Vocabulary sidebar tiles to the exact Translator tab style.
// All navigation and the remainder of the Vocabulary page must stay untouched.
const translatorSrc = readFileSync(new URL('../pages/Translator.tsx', import.meta.url), 'utf8');
const vocabNav = src.slice(src.indexOf('<nav className="flex-1 space-y-2.5 -mx-1">'), src.indexOf('</nav>', src.indexOf('<nav className="flex-1 space-y-2.5 -mx-1">')));
const navDef = src.slice(src.indexOf('const SidebarNavBtn: React.FC<'), src.indexOf('const SessionActionBtn:', src.indexOf('const SidebarNavBtn: React.FC<')));
const commonTranslatorStyles = [
  'w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-right group',
  'border-blue-500 bg-blue-50/70 text-blue-700 shadow-xs',
  'border-emerald-500 bg-emerald-50/70 text-emerald-700 shadow-xs',
  'border-slate-100 bg-slate-50/50 hover:border-slate-200 text-slate-600',
  'w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105 shrink-0',
  'bg-white text-slate-500 border border-slate-100',
  'text-xs font-black arabic-font truncate leading-tight mb-0.5',
  'text-[10px] text-slate-400 font-medium truncate font-sans',
  'opacity-30 shrink-0'
];
for (const style of commonTranslatorStyles) {
  assert.ok(translatorSrc.includes(style), 'Translator style changed: ' + style);
  assert.ok(navDef.includes(style), 'Vocabulary must copy Translator style: ' + style);
}
assert.ok(vocabNav.includes('space-y-2.5'), 'Vertical spacing must match Translator tabs');
assert.ok(vocabNav.includes('color="blue"'), 'Word Journey active state must match Instant Translator');
assert.ok(vocabNav.includes('color="emerald"'), 'My Words active state must match Translator Academy');
assert.ok(vocabNav.includes('icon={<Compass size={20} />}'), 'Keep Journey icon with same size as Translator');
assert.ok(vocabNav.includes('icon={<Layers size={20} />}'), 'Keep My Words icon with same size as Translator');
assert.ok(vocabNav.includes("setActiveTab('discovery')"), 'Word Journey navigation must work');
assert.ok(vocabNav.includes("setActiveTab('lexicon')"), 'My Words navigation must work');
assert.ok(vocabNav.includes("setSelectedTopic(null)"), 'Keep My Words topic reset');
assert.ok(navDef.includes("lang === 'ar' ? 'rotate-180' : ''"), 'Keep direction-aware arrow');
assert.ok(!navDef.includes('shadow-xl shadow-slate-200 translate-x-1'), 'Remove old navy selected card style');
console.log('Sidebar parity OK: Word Journey and My Words match Translator and Academy tiles.');


// My Words is now a self-contained, uncluttered, responsive gallery.
// The right sidebar buttons and Word Journey are deliberately untouched.
const myWordsSrc = readFileSync(new URL('../components/VocabularyWordGallery.tsx', import.meta.url), 'utf8');
const myWordsCSS = readFileSync(new URL('../components/vocabulary-word-gallery.css', import.meta.url), 'utf8');
const pageNav = src.slice(src.indexOf('           <nav className="flex-1 space-y-2.5 -mx-1">'), src.indexOf('           </nav>'));
assert.ok(pageNav.includes('color="blue"') && pageNav.includes('color="emerald"'), 'Keep the Word Journey / My Words navigation design');
assert.ok(pageNav.includes("setActiveTab('discovery')"), 'Word Journey remains available');
assert.ok(pageNav.includes("setActiveTab('lexicon')"), 'My Words remains available');
assert.ok(src.includes('<VocabularyWordGallery'), 'Render saved-word gallery in the main area');
assert.ok(src.includes('onDelete={deleteWord}'), 'Preserve Firestore word deletion');
assert.ok(src.includes('onAnalyze={handleDeepDive}'), 'Preserve word analysis action');
assert.ok(src.includes('onPractice={setActiveActivityWord}'), 'Preserve training action');
assert.ok(src.includes('ALL_TOPICS.map(topic =>'), 'Do not change Word Journey');
assert.ok(!src.includes('filtered.map(item =>'), 'Remove old crowded saved-word grid');
assert.ok(myWordsSrc.includes('data-testid="vocabulary-word-gallery"'), 'Gallery root must exist');
assert.ok(myWordsSrc.includes('data-testid="word-gallery-list"'), 'Gallery must have an internal list');
assert.ok(myWordsSrc.includes('overflow-y-auto custom-scroll'), 'Only the gallery list should scroll');
assert.ok(myWordsSrc.includes('showMobileDetail'), 'Mobile must switch from list to selected word');
assert.ok(myWordsSrc.includes('words.length === 0'), 'Empty collection must be handled');
assert.ok(myWordsSrc.includes("filter === 'due' && isDue(word)"), 'Review filter should use saved due dates');
assert.ok(myWordsSrc.includes('MasteryLevel.MASTERED'), 'Mastered and fluent states must be supported');
assert.ok(myWordsSrc.includes('selected?.analysis?.details_ar?.example'), 'Show saved, grounded Arabic examples');
assert.ok(myWordsSrc.includes('onSpeak(selected.original_word'), 'Pronunciation control must be wired');
assert.ok(myWordsSrc.includes('onPractice(selected)'), 'Training must be wired');
assert.ok(myWordsSrc.includes('onAnalyze(selected)'), 'Analysis must be wired');
assert.ok(myWordsSrc.includes('await onDelete(selected.id)'), 'Confirm deletion must be wired');
assert.ok(myWordsSrc.includes('aria-pressed={filter === tab.key}'), 'Filter state must be accessible');
assert.ok(myWordsCSS.includes('.qul-word-gallery-orb'), 'Showcase needs a restrained crystal element');
assert.ok(myWordsCSS.includes('prefers-reduced-motion'), 'Respect reduced-motion preferences');
console.log('My Words gallery OK: existing navigation preserved, minimal crystal word showcase, no extra page scroll.');
