import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summarizeSpeakingEvidence, createNextSpeakingTask, mapPlacementLevel, validateSpeakingMissionEvidence } from '../services/speakingLearning.mjs';
import { validateSimulatedDial } from '../services/speakingDial.mjs';

test('speaking evidence counts learner words only and never invents acoustic scores', () => {
  const result = summarizeSpeakingEvidence([
    { role: 'ai', text: 'مرحبا كيف حالك؟' },
    { role: 'user', text: 'أنا أحب القراءة' },
    { role: 'user', text: 'أنا اقرأ كتب' },
    { role: 'ai', text: 'ممتاز' },
  ]);
  assert.equal(result.learnerTurns, 2);
  assert.equal(result.arabicWords, 6);
  assert.equal(result.uniqueArabicWords, 5);
  assert.equal(result.source, 'transcript');
  assert.equal('pronunciationScore' in result, false);
});
test('empty and model-only sessions are not presented as learner practice', () => {
  assert.equal(summarizeSpeakingEvidence([]).learnerTurns, 0);
  assert.equal(summarizeSpeakingEvidence([{ role: 'ai', text: 'أهلا' }]).arabicWords, 0);
});
test('practice task responds to level, then correction evidence', () => {
  assert.match(createNextSpeakingTask({ level: 'beginner', topicAr: 'السفر' }).promptAr, /جملة عربية قصيرة/);
  assert.match(createNextSpeakingTask({ level: 'intermediate', topicAr: 'السفر' }).promptAr, /ثلاث جمل/);
  assert.match(createNextSpeakingTask({ level: 'advanced', topicAr: 'السفر' }).promptAr, /سببين/);
  const basedOnError = createNextSpeakingTask({
    level: 'advanced', corrections: [{ original: 'انا ذهب', correction: 'أنا ذهبت' }],
  });
  assert.equal(basedOnError.source, 'correction');
  assert.match(basedOnError.promptAr, /أنا ذهبت/);
});

test('placement suggestions map known levels without validating unknown grades', () => {
  assert.equal(mapPlacementLevel('a1'), 'beginner');
  assert.equal(mapPlacementLevel('B1'), 'intermediate');
  assert.equal(mapPlacementLevel('C2'), 'advanced');
  assert.equal(mapPlacementLevel('speaking level pending'), null);
  assert.equal(mapPlacementLevel(undefined), null);
});

test('call objective evidence never credits the tutor or a fabricated learner quotation', () => {
  const history = [
    { role: 'ai', text: 'هل تريد طاولة لشخصين؟' },
    { role: 'user', text: 'أريد طاولة لشخصين، غدًا الساعة السابعة.' },
  ];
  const objectives = ['طلب طاولة', 'وقت الحجز', 'عدد الأشخاص'];
  const claimed = [
    { goal: objectives[0], evidence: 'أريد طاولة لشخصين' },
    { goal: objectives[1], evidence: 'الساعة الثامنة' },
    { goal: objectives[2], evidence: 'هل تريد طاولة لشخصين' },
  ];
  const result = validateSpeakingMissionEvidence(history, objectives, claimed);
  assert.deepEqual(result.map(x => x.achieved), [true, false, false]);
  assert.equal(result[1].evidence, '');
  assert.equal(result[2].evidence, '');
});

test('an AI claim with a mismatched goal or no Arabic evidence never counts', () => {
  const history = [{ role: 'user', text: 'Please book a table' }];
  const goals = ['اطلب طاولة'];
  assert.equal(validateSpeakingMissionEvidence(history, goals, [{ goal: goals[0], evidence: 'Please book a table' }])[0].achieved, false);
  assert.equal(validateSpeakingMissionEvidence([{ role: 'user', text: 'أريد طاولة' }], goals, [{ goal: 'غير مطابق', evidence: 'أريد طاولة' }])[0].achieved, false);
});

test('speaking retains two sections but no longer exposes contact extensions in its sidebar', () => {
  const speak = readFileSync(new URL('../pages/Speak.tsx', import.meta.url), 'utf8');
  const booth = readFileSync(new URL('../components/SpeakingCallBooth.tsx', import.meta.url), 'utf8');
  assert.match(speak, /speakingBranch === 'booth'/);
  assert.match(speak, /SpeakingCallBooth/);
  assert.doesNotMatch(speak, /CALL_CONTACTS\.map/);
  assert.match(speak, /<PageHeader/);
  assert.match(speak, /<aside/);
  assert.match(speak, /missionEvidence=/);
  assert.match(speak, /generateSessionInsights\(finalHistory, activeTopic\.ar/);
  assert.match(booth, /<SpeakingPhoneBook/);
  assert.match(booth, /onSelect=\{selectBookEntry\}/);
  assert.match(booth, /onStart\(\)/);
  assert.match(booth, /onStop\(\)/);
  assert.match(booth, /onToggleMic/);
  assert.match(booth, /missionEvidence/);
  const names = ['restaurant', 'hotel', 'friend', 'support', 'taxi', 'clinic', 'library', 'bakery', 'school', 'museum'];
  for (const place of names) assert.match(booth, new RegExp("id: '" + place + "'"));
  const extensions = [...booth.matchAll(/extension: '(\d{3})'/g)].map(x => x[1]);
  assert.equal(extensions.length, 10);
  assert.equal(new Set(extensions).size, 10);
});

test('speaking branches use the exact vocabulary gallery navigation classes', () => {
  const speak = readFileSync(new URL('../pages/Speak.tsx', import.meta.url), 'utf8');
  assert.match(speak, /import '..\/components\/vocabulary-word-gallery.css'/);
  assert.match(speak, /qul-word-gallery-item-active/);
  assert.match(speak, /qul-word-gallery-tile/);
  assert.match(speak, /aria-pressed=\{speakingBranch === branch.id\}/);
});

test('smartphone replaces rotary dial with modern screen and supports book-first manual calling', () => {
  const booth = readFileSync(new URL('../components/SpeakingCallBooth.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../components/SpeakingModernPhone.css', import.meta.url), 'utf8');
  assert.match(booth, /qul-phone-device/);
  assert.match(booth, /qul-phone-dynamic-island/);
  assert.match(booth, /qul-phone-ios-keypad/);
  assert.match(booth, /qul-call-mobile-switch/);
  assert.match(booth, /SpeakingPhoneBook/);
  assert.match(booth, /setBookSelection\(entry\.id\)/);
  assert.match(booth, /setDialed\(''\)/);
  assert.match(booth, /validateSimulatedDial/);
  assert.match(booth, /onClick=\{startCall\}/);
  assert.match(booth, /onClick=\{onToggleMic\}/);
  assert.doesNotMatch(booth, /qul-phone-rotary-wheel|qul-phone-dial-hole/);
  assert.match(css, /qul-phone-device/);
  assert.match(css, /qul-phone-ios-keypad/);
  assert.match(css, /qul-call-world\.qul-call-modern/);
  assert.match(css, /prefers-reduced-motion/);
});

test('animated address book opens like a book, filters and pages through every contact', () => {
  const book = readFileSync(new URL('../components/SpeakingPhoneBook.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../components/SpeakingPhoneBook.css', import.meta.url), 'utf8');
  assert.match(book, /setOpen\(true\)/);
  assert.match(book, /qul-book-closed/);
  assert.match(book, /qul-book-page-pair/);
  assert.match(book, /onChange=\{e => \{ setQuery\(e\.target\.value\)/);
  assert.match(book, /contacts\.filter/);
  assert.match(book, /setSpread\(0\)/);
  assert.match(book, /perSpread = 4/);
  assert.match(book, /onSelect\(item\)/);
  assert.match(css, /qul-book-page-spine/);
  assert.match(css, /qul-book-binding/);
  assert.match(css, /qul-book-page-stack/);
});

test('manual dial is required, no selection auto-fills the extension', () => {
  const sample = [
    { id: 'restaurant', extension: '101' },
    { id: 'museum', extension: '110' },
  ];
  assert.equal(validateSimulatedDial({ selectedId: null, dialed: '101', contacts: sample }), 'select_contact');
  assert.equal(validateSimulatedDial({ selectedId: 'restaurant', dialed: '', contacts: sample }), 'incomplete');
  assert.equal(validateSimulatedDial({ selectedId: 'restaurant', dialed: '10', contacts: sample }), 'incomplete');
  assert.equal(validateSimulatedDial({ selectedId: 'restaurant', dialed: '110', contacts: sample }), 'wrong_number');
  assert.equal(validateSimulatedDial({ selectedId: 'restaurant', dialed: '101', contacts: sample }), 'ready');
  assert.equal(validateSimulatedDial({ selectedId: 'museum', dialed: '110', contacts: sample }), 'ready');
  assert.equal(validateSimulatedDial({ selectedId: 'museum', dialed: '101', contacts: sample }), 'wrong_number');
  assert.equal(validateSimulatedDial({ selectedId: 'restaurant', dialed: '1019', contacts: sample }), 'incomplete');
  const booth = readFileSync(new URL('../components/SpeakingCallBooth.tsx', import.meta.url), 'utf8');
  assert.match(booth, /setBookSelection\(entry\.id\);\s*setDialed\(''\)/);
  assert.doesNotMatch(booth, /setDialed\(entry\.extension\)/);
});
