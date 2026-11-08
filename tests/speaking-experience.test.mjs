import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summarizeSpeakingEvidence, createNextSpeakingTask, mapPlacementLevel, validateSpeakingMissionEvidence } from '../services/speakingLearning.mjs';
import { validateSimulatedDial } from '../services/speakingDial.mjs';

const source = (path) => readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('speaking evidence counts learner words only and does not invent acoustic scores', () => {
  const result = summarizeSpeakingEvidence([
    {role:'ai',text:'مرحبا كيف حالك؟'}, {role:'user',text:'أنا أحب القراءة'},
    {role:'user',text:'أنا اقرأ كتب'}, {role:'ai',text:'ممتاز'},
  ]);
  assert.equal(result.learnerTurns,2);
  assert.equal(result.arabicWords,6);
  assert.equal(result.uniqueArabicWords,5);
  assert.equal(result.source,'transcript');
  assert.equal('pronunciationScore' in result,false);
});

test('empty and teacher-only sessions do not count as learner practice', () => {
  assert.equal(summarizeSpeakingEvidence([]).learnerTurns,0);
  assert.equal(summarizeSpeakingEvidence([{role:'ai',text:'أهلا'}]).arabicWords,0);
});

test('next speaking task responds to level and corrections', () => {
  assert.match(createNextSpeakingTask({level:'beginner',topicAr:'السفر'}).promptAr,/جملة عربية قصيرة/);
  assert.match(createNextSpeakingTask({level:'intermediate',topicAr:'السفر'}).promptAr,/ثلاث جمل/);
  assert.match(createNextSpeakingTask({level:'advanced',topicAr:'السفر'}).promptAr,/سببين/);
  const result=createNextSpeakingTask({level:'advanced',corrections:[{original:'انا ذهب',correction:'أنا ذهبت'}]});
  assert.equal(result.source,'correction');
  assert.match(result.promptAr,/أنا ذهبت/);
});

test('placement levels map to supported levels only',()=>{
  assert.equal(mapPlacementLevel('a1'),'beginner');
  assert.equal(mapPlacementLevel('B1'),'intermediate');
  assert.equal(mapPlacementLevel('C2'),'advanced');
  assert.equal(mapPlacementLevel('unknown level'),null);
});

test('AI tutor words and invented learner quotation never complete speaking goals',()=>{
  const history=[{role:'ai',text:'هل تريد طاولة لشخصين؟'},
    {role:'user',text:'أريد طاولة لشخصين، غدًا الساعة السابعة.'}];
  const objectives=['طلب طاولة','وقت الحجز','عدد الأشخاص'];
  const claimed=[
    {goal:objectives[0],evidence:'أريد طاولة لشخصين'},
    {goal:objectives[1],evidence:'الساعة الثامنة'},
    {goal:objectives[2],evidence:'هل تريد طاولة لشخصين'},
  ];
  const result=validateSpeakingMissionEvidence(history,objectives,claimed);
  assert.deepEqual(result.map(x=>x.achieved),[true,false,false]);
  assert.equal(result[1].evidence,'');
  assert.equal(result[2].evidence,'');
});

test('mismatched goal and English-only evidence are not credited',()=>{
  assert.equal(validateSpeakingMissionEvidence([{role:'user',text:'Please book a table'}],['اطلب طاولة'],[
    {goal:'اطلب طاولة',evidence:'Please book a table'}])[0].achieved,false);
  assert.equal(validateSpeakingMissionEvidence([{role:'user',text:'أريد طاولة'}],['اطلب طاولة'],[
    {goal:'غير مطابق',evidence:'أريد طاولة'}])[0].achieved,false);
});

test('speaking keeps just two sections without the old directory in the sidebar',()=>{
  const speak=source('pages/Speak.tsx');
  const booth=source('components/SpeakingCallBooth.tsx');
  assert.match(speak,/speakingBranch === 'booth'/);
  assert.match(speak,/speakingBranch === 'studio'/);
  assert.doesNotMatch(speak,/CALL_CONTACTS\.map/);
  assert.match(speak,/qul-word-gallery-item-active/);
  assert.match(booth,/<SpeakingPhoneBook/);
  assert.match(booth,/<SpeakingDeskPhone/);
  assert.match(booth,/EVERYDAY_CALL_CONTACTS/);
});

test('28 Arabic alphabetical tabs remain, without invented difficult names in the data source',()=>{
  const dir=source('data/speakingDirectory.ts');
  const letters=(dir.match(/export const ARABIC_DIRECTORY_LETTERS = \[([\s\S]*?)\] as const;/)||[])[1];
  assert.ok(letters,'Arabic alphabet exists');
  const matches=letters.match(/'[^']+'/g)||[];
  assert.equal(matches.length,28);
  assert.equal(new Set(matches).size,28);
  assert.doesNotMatch(dir,/ADDITIONAL_SPEAKING_CONTACTS|ARABIC_DIRECTORY_RECORDS/);
});

test('realistic everyday directory has short Arabic names and muted English translations',()=>{
  const daily=source('data/speakingEverydayContacts.ts');
  for(const word of ['مطعم','صيدلية','بقالة','مخبز','تاكسي','مغسلة','سوبر ماركت','عيادة','توصيل','مدرسة','مكتبة','مقهى','حلاق','خياط','كهربائي','صالون'])
    assert.ok(daily.includes("'"+word+"'"),'daily contact '+word);
  const entries=[...daily.matchAll(/\['([^']+)','([^']+)','([^']+)','([^']+)','([^']+)'\]/g)];
  assert.ok(entries.length>=35);
  for(const match of entries){
    assert.ok(match[1].length<=15,match[1]);
    assert.ok(match[2].length<30,match[2]);
  }
  assert.match(daily,/extension: String\(101 \+ index\)/);
  const css=source('components/SpeakingSourceAssets.css');
  assert.match(css,/qul-index-entry-name span/);
  assert.match(css,/color: #a4a5a7/);
  assert.match(css,/font-family: 'Tajawal','Cairo',sans-serif/);
  assert.doesNotMatch(css,/Ruqaa|Ruqaa|رقعة/);
});

test('original user-uploaded source photos are used without cropping',()=>{
  const phone=source('components/SpeakingDeskPhone.tsx');
  const css=source('components/SpeakingSourceAssets.css');
  for(const name of ['phone-closed','phone-lifted','phone-dial','phonebook-cover','phonebook-open']){
    const asset=readFileSync(new URL('../public/assets/speaking/'+name+'.avif',import.meta.url));
    assert.ok(asset.length>6000,name);
    assert.equal(asset.toString('ascii',4,12),'ftypavif');
  }
  assert.match(phone,/phone-closed\.avif/);
  assert.match(phone,/phone-lifted\.avif/);
  assert.match(phone,/phone-dial\.avif/);
  assert.match(css,/object-fit: contain/);
  assert.match(css,/phonebook-cover.avif/);
  assert.match(css,/phonebook-open.avif/);
  assert.match(css,/qul-alphabet-cover-monogram/);
});

test('receiver rests on hook initially, lifts on click and returns on hangup',()=>{
  const phone=source('components/SpeakingDeskPhone.tsx');
  const booth=source('components/SpeakingCallBooth.tsx');
  assert.match(phone,/offHook \? 'is-lifted' : 'is-cradled'/);
  assert.match(phone,/onClick=\{offHook \? onHangup : onLift\}/);
  assert.match(booth,/const \[offHook,setOffHook\] = React.useState\(false\)/);
  assert.match(booth,/setOffHook\(true\)/);
  assert.match(booth,/setOffHook\(false\)/);
  assert.match(booth,/onLift=\{liftReceiver\}/);
  assert.match(booth,/onHangup=\{endCall\}/);
});

test('rotary dial physically rotates with each real selected digit',()=>{
  const phone=source('components/SpeakingDeskPhone.tsx');
  assert.match(phone,/DIAL_HOLES\.map/);
  assert.match(phone,/rotate: \[0, \(rotation\.digit/);
  assert.match(phone,/setRotation\(prev =>/);
  assert.match(phone,/onDial\(digit\)/);
  assert.match(phone,/const canDial = offHook && !loading && !active/);
});

test('student enters selected extension manually and it auto-connects only when right',()=>{
  const sample=[{id:'restaurant',extension:'101'},{id:'pharmacy',extension:'102'}];
  assert.equal(validateSimulatedDial({selectedId:null,dialed:'101',contacts:sample}),'select_contact');
  assert.equal(validateSimulatedDial({selectedId:'restaurant',dialed:'10',contacts:sample}),'incomplete');
  assert.equal(validateSimulatedDial({selectedId:'restaurant',dialed:'102',contacts:sample}),'wrong_number');
  assert.equal(validateSimulatedDial({selectedId:'restaurant',dialed:'101',contacts:sample}),'ready');
  const booth=source('components/SpeakingCallBooth.tsx');
  assert.match(booth,/setBookSelection\(entry\.id\);\s*setDialed\(''\)/);
  assert.match(booth,/dialed\.length !== 3/);
  assert.match(booth,/callAttemptRef\.current = dialed/);
  assert.doesNotMatch(booth,/setDialed\(entry\.extension\)/);
});

test('book starts closed, opens from bottom-left and preserves photo until browsing',()=>{
  const book=source('components/SpeakingPhoneBook.tsx');
  const css=source('components/SpeakingSourceAssets.css');
  assert.match(book,/React\.useState\(false\)/);
  assert.match(book,/React\.useState\(true\)/);
  assert.match(book,/qul-book-pristine/);
  assert.match(book,/ARABIC_DIRECTORY_LETTERS\.map/);
  assert.match(book,/setPristine\(false\)/);
  assert.match(book,/rotateY: 175/);
  assert.match(book,/qul-alphabet-flipping-leaf/);
  assert.match(css,/qul-alphabet-cover-opener/);
  assert.match(css,/bottom: 3%/);
  assert.match(css,/qul-alphabet-book\.qul-book-pristine/);
});