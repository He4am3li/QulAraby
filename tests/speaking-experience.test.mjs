import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summarizeSpeakingEvidence, createNextSpeakingTask, mapPlacementLevel, validateSpeakingMissionEvidence } from '../services/speakingLearning.mjs';
import { validateSimulatedDial } from '../services/speakingDial.mjs';
import { getUaePriceGuidance, UAE_PRACTICE_PRICES } from '../services/speakingUaePrices.mjs';

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

test('telephone renders a single intact reference photograph per state, without clipped overlay fragments',()=>{
  const phone=source('components/SpeakingDeskPhone.tsx');
  const css=source('components/SpeakingMinimalPolish.css');
  assert.match(phone,/qul-phone-cradled-photo/);
  assert.match(phone,/qul-phone-lifted-photo/);
  assert.match(phone,/phone-closed\.avif/);
  assert.match(phone,/phone-lifted\.avif/);
  assert.doesNotMatch(phone,/phone-body-fixed\.avif|phone-handset-layer\.avif|qul-phone-independent-handset|qul-phone-raised-photo/);
  assert.match(phone,/qul-phone-native-dial/);
  assert.match(phone,/qul-phone-native-key/);
  assert.match(phone,/onDial\(digit\)/);
  assert.match(phone,/animate=\{\{opacity:offHook\?0:1\}\}/);
  assert.match(phone,/animate=\{\{opacity:offHook\?1:0\}\}/);
  assert.match(css,/qul-phone-native-key:hover/);
  assert.match(css,/background:transparent!important/);
  for(const name of ['phone-closed','phone-lifted','phone-wheel-native']){
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
  assert.ok(book.includes('phonebook-open-clean-v2.avif'));
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

test('iPhone photos have an in-flow canvas spacer so the telephone cannot disappear',()=>{
  const css=source('components/SpeakingMinimalPolish.css');
  const phone=source('components/SpeakingDeskPhone.tsx');
  const book=source('components/SpeakingPhoneBook.tsx');
  assert.match(phone,/qul-phone-intrinsic-size/);
  assert.match(css,/\.qul-call-scene \.qul-photo-phone \.qul-phone-intrinsic-size/);
  assert.match(css,/aspect-ratio: 558 \/ 780 !important/);
  assert.match(css,/\.qul-call-scene \.qul-scene-show-phone \.qul-scene-phone-pane\[data-pane="phone"\]/);
  assert.match(css,/\.qul-call-scene \.qul-scene-show-book \.qul-scene-phone-pane\[data-pane="phone"\]/);
  assert.match(css,/aspect-ratio: 789 \/ 560 !important/);
  assert.match(book,/phonebook-cover\.avif/);
  assert.match(book,/phonebook-open-clean-v2\.avif/);
});

test('both untouched phone photographs share registered base coordinates without extra receiver or cord',()=>{
  const phone=source('components/SpeakingDeskPhone.tsx');
  const css=source('components/SpeakingMinimalPolish.css');
  assert.match(phone,/className="qul-phone-cradled-photo"/);
  assert.match(phone,/className="qul-phone-lifted-photo"/);
  assert.match(phone,/animate=\{\{opacity:offHook\?0:1\}\}/);
  assert.match(phone,/animate=\{\{opacity:offHook\?1:0\}\}/);
  assert.match(css,/\.qul-call-scene \.qul-photo-phone \.qul-phone-cradled-photo/);
  assert.match(css,/top: 17\.44% !important/);
  assert.match(css,/left: 8\.24% !important/);
  assert.match(css,/\.qul-call-scene \.qul-photo-phone \.qul-phone-lifted-photo/);
  assert.match(css,/top: 8\.72% !important/);
  assert.match(css,/pointer-events: none/);
  assert.equal((phone.match(/className="qul-phone-lifted-photo"/g)||[]).length,1);
  assert.equal((phone.match(/className="qul-phone-cradled-photo"/g)||[]).length,1);
});

test('closed telephone directory is a full portrait notebook on mobile and opens landscape',()=>{
  const book=source('components/SpeakingPhoneBook.tsx');
  const css=source('components/SpeakingMinimalPolish.css');
  assert.match(book,/qul-clean-book-stage '\+\(open\?'is-open':'is-closed'\)/);
  assert.match(css,/\.qul-call-scene \.qul-clean-book-stage\.is-closed/);
  assert.match(css,/aspect-ratio: 468 \/ 585 !important/);
  assert.match(css,/\.qul-call-scene \.qul-clean-book-stage\.is-open/);
  assert.match(css,/aspect-ratio: 789 \/ 560 !important/);
  assert.match(css,/\.qul-call-scene \.qul-scene-show-book \.qul-scene-book-pane\[data-pane="book"\]/);
  assert.match(css,/visibility: visible !important/);
  assert.match(css,/\.qul-call-scene \.qul-clean-book-stage\.is-closed \.qul-clean-book-cover/);
});


test('rotary disc starts immediately per click, without remounting or losing digits', () => {
  const phone=source('components/SpeakingDeskPhone.tsx');
  const sound=source('services/rotaryDialAudio.ts');
  assert.match(phone,/const wheelRef = React\.useRef/);
  assert.match(phone,/currentMotionRef\.current\?\.cancel\(\)/);
  assert.match(phone,/onDial\(digit\)/);
  assert.match(phone,/wheel\.animate\(/);
  assert.match(phone,/rotaryPulseCount\(digit\)/);
  assert.doesNotMatch(phone,/key=\{rotation\.tick\}/);
  assert.doesNotMatch(phone,/setRotation\(/);
  assert.match(sound,/const pulses = rotaryPulseCount\(digit\)/);
  assert.match(sound,/ctx\.createBufferSource/);
  assert.match(sound,/context\.state === 'suspended'/);
  assert.match(sound,/digit === '0' \? 10/);
});

test('book has permanent pages, a two-sided hinged leaf, no ghost original printed names',()=>{
  const book=source('components/SpeakingPhoneBook.tsx');
  const css=source('components/SpeakingBookRefinement.css');
  assert.match(book,/className="qul-clean-book-sheet"/);
  assert.match(book,/className="qul-clean-book-leaf-face front"/);
  assert.match(book,/className="qul-clean-book-leaf-face back"/);
  assert.match(book,/qul-clean-book-spine-photo/);
  assert.match(book,/rotateY:leaf\.direction>0\?170:-170/);
  assert.doesNotMatch(book,/AnimatePresence mode="wait"/);
  assert.match(css,/\.qul-clean-book-spread::before/);
  assert.match(css,/\.qul-clean-book-spine-photo/);
  assert.match(css,/\.qul-clean-book-turnleaf/);
  assert.match(css,/full-bleed paper/i);
});

test('simulated calls use plausible UAE dirham estimates and avoid false live quotes',()=>{
  const prompt=source('pages/Speak.tsx');
  assert.match(prompt,/getUaePriceGuidance\(selectedCallContact\)/);
  assert.equal(UAE_PRACTICE_PRICES.shortTaxi.min,12);
  assert.ok(UAE_PRACTICE_PRICES.casualMeal.max >= 30);
  assert.ok(UAE_PRACTICE_PRICES.karak.max <= 8);
  const restaurant=getUaePriceGuidance({ar:'مطعم',en:'Restaurant'});
  const taxi=getUaePriceGuidance({ar:'تاكسي',en:'Taxi'});
  const pharmacy=getUaePriceGuidance({ar:'صيدلية',en:'Pharmacy'});
  for(const result of [restaurant,taxi,pharmacy]){
    assert.match(result,/درهم/);
    assert.match(result,/AED/);
    assert.match(result,/simulated|fictional/i);
    assert.match(result,/not real-time|do not invent an exact price/i);
  }
  assert.match(taxi,/AED 12 to 40/);
  assert.match(pharmacy,/Do not recommend, prescribe/);
});

test('speaking report uses worksheet-style paper both for preview and generated PDF',()=>{
  const speak=source('pages/Speak.tsx');
  const sheet=source('components/SpeakingReportSheet.tsx');
  const css=source('components/SpeakingReportSheet.css');
  assert.match(speak,/SpeakingReportSheet/);
  assert.match(speak,/mode="preview"/);
  assert.match(speak,/mode="print"/);
  assert.match(speak,/ref=\{summaryPrintRef\}/);
  assert.match(speak,/handlePrint/);
  assert.match(speak,/Speaking Report Preview/);
  assert.match(sheet,/qul-report-paper-header/);
  assert.match(sheet,/qul-report-section-title/);
  assert.match(sheet,/assessmentStatus!==/);
  assert.match(sheet,/missionEvidence/);
  assert.match(css,/qul-speaking-report-sheet/);
  assert.match(css,/border-bottom: 2px solid/);
});

test('subtle bilingual hints do not change the base telephone or notebook artwork',()=>{
  const phone=source('components/SpeakingDeskPhone.tsx');
  const book=source('components/SpeakingPhoneBook.tsx');
  const css=source('components/SpeakingBookRefinement.css');
  assert.match(phone,/Tap the receiver to lift it/);
  assert.match(phone,/اضغط على السماعة لرفعها/);
  assert.match(book,/Tap the leather cover to open the directory/);
  assert.match(book,/اختر الحرف ثم اضغط على اسم الجهة/);
  assert.match(css,/\.qul-object-hint-host:hover/);
  assert.match(css,/\.qul-object-hint-host:focus-within/);
  assert.match(css,/pointer-events: none/);
});


test('live contacts sit on cleaned original paper with no pasted rectangles or old printed names',()=>{
  const book=source('components/SpeakingPhoneBook.tsx');
  const css=source('components/SpeakingBookRefinement.css');
  assert.match(book,/phonebook-open-clean-v2\.avif/);
  assert.match(css,/\.qul-clean-book-spread::before\s*\{\s*display: none !important;/);
  assert.match(css,/\.qul-clean-book-page:last-child\s*\{\s*background: transparent !important;/);
  const original=readFileSync(new URL('../public/assets/speaking/phonebook-open.avif',import.meta.url));
  const cleaned=readFileSync(new URL('../public/assets/speaking/phonebook-open-clean-v2.avif',import.meta.url));
  assert.ok(original.length>4000);
  assert.ok(cleaned.length>4000);
  assert.equal(cleaned.toString('ascii',4,12),'ftypavif');
});


test('touch devices never keep directory guidance pinned over contact names',()=>{
  const css=source('components/SpeakingBookRefinement.css');
  assert.match(css,/@media \(hover:none\)/);
  assert.match(css,/\.qul-object-hint-host:focus-within:not\(:hover\):not\(:has\(:focus-visible\)\)/);
  assert.match(css,/display: none !important/);
  const book=source('components/SpeakingPhoneBook.tsx');
  assert.match(book,/phonebook-open-clean-v2\.avif/);
});
