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
assert.ok(!chooser.includes('qul-vocab-topic-glass-arrow') && !chooser.includes('<ArrowUpRight'), 'Remove the bottom arrow from every topic card');
assert.ok(!topicGlassCSS.includes('qul-vocab-topic-glass-arrow'), 'Do not retain dead arrow styling');
assert.ok(chooser.includes('min-h-[176px] md:min-h-[186px]'), 'Topic card height must be compact and responsive');
assert.ok(chooser.includes('py-3 sm:px-4 sm:py-3'), 'Reduce only topic-card internal vertical padding');
assert.ok(chooser.includes('min-h-[1.65rem]') && chooser.includes('min-h-[1rem]'), 'Keep title and bilingual subtitle within compact layout');
assert.ok(topicGlassCSS.includes('width: clamp(82px, 7.2vw, 100px)'), 'Scale the lens proportionately for shorter cards');
assert.ok(topicGlassCSS.includes('width: clamp(78px, 22vw, 96px)'), 'Keep lens readable on mobile');
assert.ok(topicGlassCSS.includes('height: 8px') && topicGlassCSS.includes('margin: -3px auto 3px'), 'Tighten only decorative orb-shadow spacing');
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
console.log('Convex sphere OK: 30 compact external topic cards, no bottom arrows, refractive rim preserved.');


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


// The two Vocabulary navigation tiles must use precisely the same gallery
// item classes and selected-glass state as individual saved-word rows.
const vocabNav = src.slice(src.indexOf('<nav className="flex-1 space-y-2"'), src.indexOf('</nav>', src.indexOf('<nav className="flex-1 space-y-2"')));
const navDef = src.slice(src.indexOf('const SidebarNavBtn: React.FC<'), src.indexOf('const SessionActionBtn:', src.indexOf('const SidebarNavBtn: React.FC<')));
const galleryForNav = readFileSync(new URL('../components/VocabularyWordGallery.tsx', import.meta.url), 'utf8');
const galleryStyleForNav = readFileSync(new URL('../components/vocabulary-word-gallery.css', import.meta.url), 'utf8');
const galleryTileClass = 'qul-word-gallery-item w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-start transition-all';
const galleryIconClass = 'qul-word-gallery-tile h-10 w-10 rounded-xl shrink-0 flex items-center justify-center text-lg text-slate-600';
assert.ok(galleryForNav.includes(galleryTileClass) && navDef.includes(galleryTileClass), 'The sidebar and word entries must use identical tile layouts');
assert.ok(galleryForNav.includes(galleryIconClass) && navDef.includes(galleryIconClass), 'The sidebar and word entries must use identical icon tiles');
assert.ok(navDef.includes('qul-word-gallery-item-active'), 'Sidebar selected tile must use gallery active styling');
assert.ok(galleryStyleForNav.includes('.qul-word-gallery-item-active'), 'Gallery selected-state CSS must be available');
assert.ok(navDef.includes('text-[13px] font-black arabic-font text-slate-800 truncate'), 'Match saved-word primary label style');
assert.ok(navDef.includes('text-[10px] text-slate-500 truncate'), 'Match saved-word secondary label style');
assert.ok(navDef.includes("active ? 'bg-emerald-500' : 'bg-slate-300'"), 'Use gallery-style selection indicator');
assert.ok(navDef.includes('aria-pressed={active}'), 'Tab selection must remain accessible');
assert.ok(vocabNav.includes('space-y-2'), 'Sidebar vertical spacing must match word list');
assert.ok(vocabNav.includes('icon={<Compass size={20} />}'), 'Keep Word Journey icon');
assert.ok(vocabNav.includes('icon={<Layers size={20} />}'), 'Keep My Words icon');
assert.ok(vocabNav.includes("setActiveTab('discovery')"), 'Word Journey action remains working');
assert.ok(vocabNav.includes("setActiveTab('lexicon')"), 'My Words action remains working');
assert.ok(vocabNav.includes("setSelectedTopic(null)"), 'My Words topic reset remains working');
assert.ok(!navDef.includes('border-blue-500') && !navDef.includes('border-emerald-500'), 'Remove mismatched translator-style sidebar surfaces');
console.log('Sidebar gallery parity OK: Word Journey and My Words match saved-word tiles exactly.');


// My Words is now a self-contained, uncluttered, responsive gallery.
// The right sidebar buttons and Word Journey are deliberately untouched.
const myWordsSrc = readFileSync(new URL('../components/VocabularyWordGallery.tsx', import.meta.url), 'utf8');
const myWordsCSS = readFileSync(new URL('../components/vocabulary-word-gallery.css', import.meta.url), 'utf8');
const pageNav = src.slice(src.indexOf('           <nav className="flex-1 space-y-2"'), src.indexOf('           </nav>'));
assert.ok(pageNav.includes('<SidebarNavBtn') && !pageNav.includes('color="blue"'), 'Keep both navigation controls in the matching gallery style');
assert.ok(pageNav.includes("setActiveTab('discovery')"), 'Word Journey remains available');
assert.ok(pageNav.includes("setActiveTab('lexicon')"), 'My Words remains available');
assert.ok(src.includes('<VocabularyWordGallery'), 'Render saved-word gallery in the main area');
assert.ok(src.includes('onDelete={deleteWord}'), 'Preserve Firestore word deletion');
assert.ok(!src.includes('onAnalyze={handleDeepDive}'), 'My Words analysis must not use the legacy side drawer');
assert.ok(!src.includes('onPractice={setActiveActivityWord}'), 'My Words training must not use the legacy side drawer');
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
assert.ok(myWordsSrc.includes('onClick={beginPractice}'), 'Inline training button must work');
assert.ok(myWordsSrc.includes('onClick={openAnalysis}'), 'Inline analysis button must work');
assert.ok(myWordsSrc.includes('await onDelete(selected.id)'), 'Confirm deletion must be wired');
assert.ok(myWordsSrc.includes('aria-pressed={filter === tab.key}'), 'Filter state must be accessible');
assert.ok(myWordsCSS.includes('.qul-word-gallery-orb'), 'Showcase needs a restrained crystal element');
assert.ok(myWordsCSS.includes('prefers-reduced-motion'), 'Respect reduced-motion preferences');
console.log('My Words gallery OK: existing navigation preserved, minimal crystal word showcase, no extra page scroll.');


// My Words revision: no AI presentation, no drawers, and analysis is instant.
const galleryAnalysisStart = myWordsSrc.indexOf("const openAnalysis = () => {");
const galleryExtendedStart = myWordsSrc.indexOf("const requestExtraAnalysis = async () => {", galleryAnalysisStart);
assert.ok(galleryAnalysisStart > 0 && galleryExtendedStart > galleryAnalysisStart, 'Analysis actions must exist');
const instantAnalysis = myWordsSrc.slice(galleryAnalysisStart, galleryExtendedStart);
assert.ok(instantAnalysis.includes("setMode('analysis')"), 'Analysis should switch the existing stage instantly');
assert.ok(!instantAnalysis.includes('await') && !instantAnalysis.includes('getWordDeepAnalysis('), 'No network call upon clicking Analyze');
assert.ok(myWordsSrc.includes('selected?.analysis?.details_ar'), 'Read Arabic analysis from stored word');
assert.ok(myWordsSrc.includes('selected?.analysis?.details_en'), 'Read English analysis from stored word');
assert.ok(myWordsSrc.includes('extraAnalysis[selected.original_word]'), 'Cache optional extended analysis by word');
assert.ok(myWordsSrc.includes('getWordDeepAnalysis(term)'), 'Optional extended analysis is available on explicit request');
assert.ok(myWordsSrc.includes('data-testid="word-inline-practice"'), 'Training must render within word stage');
assert.ok(myWordsSrc.includes('data-testid="word-inline-analysis"'), 'Analysis must render within word stage');
assert.ok(myWordsSrc.includes("type StageMode = 'word' | 'practice' | 'analysis'"), 'Inline modes must share stage');
assert.ok(myWordsSrc.includes("game === 'scramble'"), 'Functional letter-order activity required');
assert.ok(myWordsSrc.includes("game === 'meaning'"), 'Functional meaning-selection activity required');
assert.ok(myWordsSrc.includes('setScrambleCorrect('), 'Validate word letter order');
assert.ok(myWordsSrc.includes('setQuizAnswer(option)'), 'Meaning quiz options must respond');
assert.ok(!myWordsSrc.includes('Sparkles'), 'Remove generic AI sparkle icon from My Words');
assert.ok(!myWordsSrc.includes('onAnalyze(') && !myWordsSrc.includes('onPractice('), 'No drawer callbacks may remain');
assert.ok(!src.includes('Laboratory Analysis Side Panel'), 'Remove old side analysis');
assert.ok(!src.includes('Interactive Activities Side Panel'), 'Remove old side training');
assert.ok(!src.includes('InteractiveActivitiesSidePanel'), 'Do not mount legacy training drawer');
assert.ok(!src.includes('getWordDeepAnalysis'), 'Parent page must not make remote analysis request');
assert.ok(src.includes("title: lang === 'ar' ? 'المفردات' : 'Vocabulary'"), 'Remove AI-branded page title');
assert.ok(!src.includes('مدعومة بالذكاء الاصطناعي') && !src.includes('powered by AI'), 'Remove AI promotional labels');
assert.ok(!src.includes('التحليل الذكي') && !src.includes('Smart Word Analysis'), 'No AI analysis branding');
assert.ok(myWordsCSS.includes('.qul-word-gallery-detail'), 'Compact inline language details must be styled');
assert.ok(myWordsCSS.includes('.qul-word-gallery-letter'), 'In-stage learning game must be styled');
console.log('My Words inline OK: no artificial-intelligence badges or side panels, instant local analysis and real practice.');


// The mastery labels sit next to the section name as understated inline text,
// not as a detached green capsule anywhere in the showcase.
assert.ok(myWordsSrc.includes('qul-word-gallery-status arabic-font'), 'Use subdued inline mastery status');
assert.ok(myWordsSrc.includes('qul-word-gallery-status-dot'), 'Subtle color indicator must remain');
assert.ok(myWordsSrc.includes('getStatus(selected, lang)'), 'Display the same learner status labels');
assert.ok(myWordsCSS.includes('.qul-word-gallery-status {'), 'Status typography and separator must exist');
assert.ok(myWordsCSS.includes('border-inline-start: 1px solid'), 'Inline status separator must respect RTL/LTR');
assert.ok(!myWordsSrc.includes('text-emerald-700 bg-emerald-50/90 border border-emerald-100 px-3 py-1 rounded-full arabic-font'), 'Remove detached, oversized mastery badge');
assert.ok(myWordsSrc.includes("lang === 'ar' ? 'قيد التعلم' : 'Learning'"), 'Learning label preserved');
assert.ok(myWordsSrc.includes("lang === 'ar' ? 'متمكن' : 'Fluent'"), 'Fluent label preserved');
console.log('Mastery label OK: quiet adjacent word statuses in Arabic and English.');
