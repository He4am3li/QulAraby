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


test('speaking retains booth and free speaking with no sidebar directory',()=>{
  const speak=source('pages/Speak.tsx');
  const booth=source('components/SpeakingCallBooth.tsx');
  assert.ok(speak.includes("speakingBranch === 'booth'"));
  assert.ok(speak.includes("speakingBranch === 'studio'"));
  assert.equal(speak.includes('CALL_CONTACTS.map'),false);
  assert.ok(booth.includes('ADDITIONAL_EVERYDAY_CONTACTS'));
  assert.ok(booth.includes('callAttemptRef.current = dialed'));
});

test('remove all requested instructional UI and call-control strip',()=>{
  const booth=source('components/SpeakingCallBooth.tsx');
  const book=source('components/SpeakingPhoneBook.tsx');
  for(const banned of ['استخدم دليل الهاتف لإجراء مكالمة هاتفية','qul-reference-instruction','qul-reference-controls']){
    assert.equal(booth.includes(banned),false,banned);
  }
  for(const banned of ['TELEPHONE ADDRESS BOOK','qul-alphabet-heading','qul-alphabet-close','اختر حرفًا، ثم اسم الجهة','qul-alphabet-instruction']){
    assert.equal(book.includes(banned),false,banned);
  }
});

test('phone body remains still and its original receiver and disc move independently',()=>{
  const phone=source('components/SpeakingDeskPhone.tsx');
  const css=source('components/SpeakingMinimalPolish.css');
  assert.ok(phone.includes('qul-phone-static-body'));
  assert.ok(phone.includes('qul-phone-independent-handset'));
  assert.ok(phone.includes('animate={offHook?'));
  assert.ok(phone.includes('qul-phone-native-dial'));
  assert.ok(phone.includes('qul-phone-native-key'));
  assert.ok(phone.includes('onDial(digit)'));
  assert.equal(phone.includes('phone-dial.avif'),false);
  assert.equal(phone.includes('phone-lifted.avif'),false);
  assert.ok(css.includes('qul-phone-native-key:hover'));
  assert.ok(css.includes('background:transparent!important'));
  for(const name of ['phone-body-fixed','phone-handset-layer','phone-wheel-native']){
    const asset=readFileSync(new URL('../public/assets/speaking/'+name+'.avif',import.meta.url));
    assert.ok(asset.length>4000,name);
    assert.equal(asset.toString('ascii',4,12),'ftypavif');
  }
});

test('real leather cover is shown alone before opening and every contact is clickable',()=>{
  const book=source('components/SpeakingPhoneBook.tsx');
  const css=source('components/SpeakingMinimalPolish.css');
  assert.ok(book.includes('useState(false)'));
  assert.ok(book.includes('phonebook-cover.avif'));
  assert.ok(book.includes('phonebook-open.avif'));
  assert.ok(book.includes('onClick={()=>setOpen(true)}'));
  assert.ok(book.includes('ARABIC_DIRECTORY_LETTERS.map'));
  assert.ok(book.includes('directoryLetterOf(c.ar)===letter'));
  assert.ok(book.includes('qul-clean-book-entry'));
  assert.ok(book.includes('qul-clean-book-corner'));
  assert.ok(css.includes('qul-clean-book-cover'));
  assert.ok(css.includes('qul-clean-book-page'));
  assert.ok(css.includes('qul-clean-book-en'));
});

test('all 28 alphabet letters have practical callable examples',()=>{
  const extra=source('data/speakingExtraEverydayContacts.ts');
  const dir=source('data/speakingDirectory.ts');
  const match=dir.match(/ARABIC_DIRECTORY_LETTERS = \[([\s\S]*?)\] as const;/);
  assert.ok(match,'alphabet definition exists');
  const letters=(match[1].match(/'[^']+'/g)||[]).map(value=>value.slice(1,-1));
  assert.equal(letters.length,28);
  const rowsMatch=extra.match(/const ROWS: readonly \[string,string,Scene\]\[\] = (\[[\s\S]+?\]);/);
  assert.ok(rowsMatch,'extra everyday directory exists');
  const rows=JSON.parse(rowsMatch[1]);
  assert.equal(rows.length,84);
  const initials=new Set(rows.map(row=>row[0].slice(0,1)));
  for(const letter of letters)assert.ok(initials.has(letter),'missing: '+letter);
  assert.equal(new Set(rows.map(row=>row[0])).size,rows.length);
  assert.ok(201+rows.length<1000);
});

test('student must dial exact three-digit extension of chosen entry',()=>{
  const sample=[{id:'restaurant',extension:'101'},{id:'pharmacy',extension:'102'}];
  assert.equal(validateSimulatedDial({selectedId:null,dialed:'101',contacts:sample}),'select_contact');
  assert.equal(validateSimulatedDial({selectedId:'restaurant',dialed:'10',contacts:sample}),'incomplete');
  assert.equal(validateSimulatedDial({selectedId:'restaurant',dialed:'102',contacts:sample}),'wrong_number');
  assert.equal(validateSimulatedDial({selectedId:'restaurant',dialed:'101',contacts:sample}),'ready');
  const booth=source('components/SpeakingCallBooth.tsx');
  assert.match(booth,/setBookSelection\(entry\.id\);\s*setDialed\(''\)/);
  assert.ok(booth.includes("dialed.length !== 3"));
  assert.equal(booth.includes('setDialed(entry.extension)'),false);
});


test('mobile opens speaking call booth immediately instead of hiding it behind sidebar', () => {
  const speak = source('pages/Speak.tsx');
  const booth = source('components/SpeakingCallBooth.tsx');
  const css = source('components/SpeakingMinimalPolish.css');
  assert.match(speak, /const \[showMobileOptions, setShowMobileOptions\] = React\.useState\(false\)/);
  assert.match(speak, /onOpenOptions=\{\(\) => setShowMobileOptions\(true\)\}/);
  assert.match(speak, /aria-label=\{lang === 'ar' \? 'إغلاق قائمة التحدث' : 'Close speaking menu'\}/);
  assert.match(booth, /const \[mobilePane, setMobilePane\] = React\.useState<'book' \| 'phone'>\('phone'\)/);
  assert.match(booth, /className="qul-call-options-button"/);
  assert.match(booth, /onClick=\{onOpenOptions\}/);
  assert.match(booth, /aria-label=\{ar\?'عرض الهاتف':'Show telephone'\}/);
  assert.match(css, /max-width:900px/);
  assert.match(css, /qul-call-options-button/);
});

test('iPhone photograph has in-flow height and book has intrinsic dimensions, preventing blank mobile canvas', () => {
  const css = source('components/SpeakingMinimalPolish.css');
  const phone = source('components/SpeakingDeskPhone.tsx');
  const book = source('components/SpeakingPhoneBook.tsx');
  assert.match(css, /iOS Safari\/WebKit render fix/);
  assert.match(css, /\.qul-call-scene \.qul-photo-phone \.qul-phone-static-body\s*\{/);
  assert.match(css, /position: relative !important;[\s\S]*?margin-top: 12\.19% !important/);
  assert.match(css, /\.qul-call-scene \.qul-scene-show-phone \.qul-scene-phone-pane\[data-pane="phone"\]/);
  assert.match(css, /\.qul-call-scene \.qul-scene-show-book \.qul-scene-phone-pane\[data-pane="phone"\]/);
  assert.match(css, /\.qul-call-scene \.qul-clean-book-stage\s*\{/);
  assert.match(css, /aspect-ratio: 789 \/ 560 !important/);
  assert.match(phone, /phone-body-fixed\.avif/);
  assert.match(book, /phonebook-cover\.avif/);
  assert.match(book, /phonebook-open\.avif/);
});
