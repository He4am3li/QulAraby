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

test('speaking retains both modules and hides directory contacts from sidebar', () => {
  const speak=readFileSync(new URL('../pages/Speak.tsx',import.meta.url),'utf8');
  const booth=readFileSync(new URL('../components/SpeakingCallBooth.tsx',import.meta.url),'utf8');
  assert.match(speak,/speakingBranch === 'booth'/);
  assert.match(speak,/speakingBranch === 'studio'/);
  assert.doesNotMatch(speak,/CALL_CONTACTS\.map/);
  assert.match(speak,/qul-word-gallery-item-active/);
  assert.match(booth,/<SpeakingPhoneBook/);
  assert.match(booth,/<SpeakingDeskPhone/);
  assert.match(booth,/onSelect=\{selectBookEntry\}/);
  assert.match(booth,/onToggleMic/);
  assert.match(booth,/missionEvidence/);
  assert.match(booth,/generate/i);
  assert.match(booth,/ADDITIONAL_SPEAKING_CONTACTS/);
});

test('all 28 Arabic letters receive six fictional entries each, without mixing initial letters', () => {
  const dir=readFileSync(new URL('../data/speakingDirectory.ts',import.meta.url),'utf8');
  const alphabet=JSON.parse(dir.match(/export const ARABIC_DIRECTORY_LETTERS = (\[[^\n]+\]) as const;/)[1]);
  const records=JSON.parse(dir.match(/export const ARABIC_DIRECTORY_RECORDS:[\s\S]+? = (\{[\s\S]+?\});\s*\n\nconst BASE_RESERVED/)[1]);
  assert.equal(alphabet.length,28);
  assert.equal(Object.keys(records).length,28);
  const distinct=new Set();
  for(const letter of alphabet){
    assert.equal(records[letter].length,6, 'six entries under '+letter);
    for(const record of records[letter]){
      assert.equal(record[0][0],letter,'correct Arabic first letter: '+record[0]);
      assert.equal(record.length,3);
      assert.ok(record[1].trim());
      assert.ok(!distinct.has(record[0]),'unique name '+record[0]);
      distinct.add(record[0]);
    }
  }
  assert.equal(distinct.size,168);
});

test('the original ten speaking scenarios remain callable and have unique extensions', () => {
  const booth=readFileSync(new URL('../components/SpeakingCallBooth.tsx',import.meta.url),'utf8');
  const names=['restaurant','hotel','friend','support','taxi','clinic','library','bakery','school','museum'];
  for(const id of names) assert.match(booth,new RegExp("id: '"+id+"'"));
  const ext=[...booth.matchAll(/extension: '(\d{3})'/g)].map(x=>x[1]);
  assert.equal(ext.length,10);
  assert.equal(new Set(ext).size,10);
});

test('physical Arabic book is closed on load and opens from bottom-left with a 3D cover hinge', () => {
  const book=readFileSync(new URL('../components/SpeakingPhoneBook.tsx',import.meta.url),'utf8');
  const css=readFileSync(new URL('../components/SpeakingAlphabetBook.css',import.meta.url),'utf8');
  assert.match(book,/React\.useState\(false\)/);
  assert.match(book,/qul-alphabet-cover-opener/);
  assert.match(book,/onClick=\{\(\) => setOpen\(true\)\}/);
  assert.match(book,/rotateY: 175/);
  assert.match(book,/transformOrigin: 'right center'/);
  assert.match(book,/ARABIC_DIRECTORY_LETTERS\.map/);
  assert.match(book,/goToLetter\(letter\)/);
  assert.match(book,/directoryLetterOf\(entry\.ar\) === activeLetter/);
  assert.match(book,/ITEMS_PER_SPREAD = 6/);
  assert.match(book,/AnimatePresence mode="wait"/);
  assert.match(book,/rotateY: turnDirection > 0 \? 78 : -78/);
  assert.match(css,/\.qul-alphabet-cover-opener\{[^}]*bottom:20px;left:15px/);
  assert.match(css,/\.qul-alphabet-tabs/);
  assert.match(css,/\.qul-alphabet-center-fold/);
});

test('vintage telephone includes a fully lifted moving handset and mechanical rotary dial', () => {
  const phone=readFileSync(new URL('../components/SpeakingDeskPhone.tsx',import.meta.url),'utf8');
  const css=readFileSync(new URL('../components/SpeakingDeskPhone.css',import.meta.url),'utf8');
  assert.match(phone,/qul-vintage-handset/);
  assert.match(phone,/y:-122/);
  assert.match(phone,/y:-52/);
  assert.match(phone,/onClick=\{busy\?onEnd:onCall\}/);
  assert.match(phone,/qul-vintage-rotary-wheel/);
  assert.match(phone,/onDial\(digit\)/);
  assert.match(phone,/qul-vintage-cable/);
  assert.match(css,/\.qul-vintage-ear/);
  assert.match(css,/\.qul-vintage-body/);
  assert.match(css,/\.qul-vintage-call-console/);
  assert.match(css,/prefers-reduced-motion/);
});

test('entry selection never fills the number, the student must dial the exact extension', () => {
  const sample=[{id:'restaurant',extension:'101'},{id:'museum',extension:'110'}];
  assert.equal(validateSimulatedDial({selectedId:null,dialed:'101',contacts:sample}),'select_contact');
  assert.equal(validateSimulatedDial({selectedId:'restaurant',dialed:'10',contacts:sample}),'incomplete');
  assert.equal(validateSimulatedDial({selectedId:'restaurant',dialed:'110',contacts:sample}),'wrong_number');
  assert.equal(validateSimulatedDial({selectedId:'restaurant',dialed:'101',contacts:sample}),'ready');
  assert.equal(validateSimulatedDial({selectedId:'museum',dialed:'110',contacts:sample}),'ready');
  const booth=readFileSync(new URL('../components/SpeakingCallBooth.tsx',import.meta.url),'utf8');
  assert.match(booth,/setBookSelection\(entry\.id\);\s*setDialed\(''\)/);
  assert.match(booth,/validateSimulatedDial/);
  assert.doesNotMatch(booth,/setDialed\(entry\.extension\)/);
});

test('reference-matched light studio adapts to mobile without old iPhone interface', () => {
  const css=readFileSync(new URL('../components/SpeakingScene.css',import.meta.url),'utf8');
  const booth=readFileSync(new URL('../components/SpeakingCallBooth.tsx',import.meta.url),'utf8');
  assert.match(css,/\.qul-call-world\.qul-call-scene/);
  assert.match(css,/\.qul-scene-layout/);
  assert.match(css,/max-width:900px/);
  assert.match(css,/qul-scene-show-phone/);
  assert.match(booth,/qul-call-mobile-switch/);
  assert.doesNotMatch(booth,/qul-phone-ios-keypad|qul-phone-dynamic-island/);
});
