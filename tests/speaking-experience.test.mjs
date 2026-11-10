import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summarizeSpeakingEvidence, createNextSpeakingTask, mapPlacementLevel, validateSpeakingMissionEvidence, createLimitedSpeakingReport, hasTranscribedLearnerSpeech } from '../services/speakingLearning.mjs';
import { validateSimulatedDial } from '../services/speakingDial.mjs';
import { getUaePriceGuidance, UAE_PRACTICE_PRICES } from '../services/speakingUaePrices.mjs';
import { makeSpeakingSampleDialogue } from '../services/speakingSampleDialogue.mjs';

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
  assert.ok(book.includes('phonebook-open-clean-v3.avif'));
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
  assert.match(book,/phonebook-open-clean-v3\.avif/);
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
  assert.match(sound,/const pulses\s*=\s*rotaryPulseCount\(digit\)/);
  assert.match(sound,/ctx\.createBufferSource/);
  assert.match(sound,/context\.state\s*===\s*'suspended'/);
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
  assert.match(book,/phonebook-open-clean-v3\.avif/);
  assert.match(css,/\.qul-clean-book-spread::before\s*\{\s*display: none !important;/);
  assert.match(css,/\.qul-clean-book-page:last-child\s*\{\s*background: transparent !important;/);
  const original=readFileSync(new URL('../public/assets/speaking/phonebook-open.avif',import.meta.url));
  const cleaned=readFileSync(new URL('../public/assets/speaking/phonebook-open-clean-v3.avif',import.meta.url));
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
  assert.match(book,/phonebook-open-clean-v3\.avif/);
});


test('paper leaf is removed immediately after finishing, without a reversed ghost page',()=>{
  const book=source('components/SpeakingPhoneBook.tsx');
  assert.match(book,/exit=\{\{opacity:0,transition:\{duration:0\}\}\}/);
  assert.match(book,/onAnimationComplete=\{\(\)=>setLeaf/);
  assert.match(book,/phonebook-open-clean-v3\.avif/);
  assert.doesNotMatch(book,/phonebook-open-clean-v2\.avif/);
});


test('dial audio is prewarmed when lifting receiver and the rotary art is decoded once',()=>{
  const phone=source('components/SpeakingDeskPhone.tsx');
  const sound=source('services/rotaryDialAudio.ts');
  assert.match(phone,/wheel\.decode\(\)/);
  assert.match(phone,/soundRef\.current\.prepare\(\)/);
  assert.match(phone,/onClick=\{offHook\?onHangup:liftReceiver\}/);
  assert.match(phone,/wheel\.animate\(/);
  assert.match(phone,/currentMotionRef\.current\?\.cancel\(\)/);
  assert.match(sound,/prepare\(\)/);
  assert.match(sound,/const pulses\s*=\s*rotaryPulseCount\(digit\)/);
});

test('page turning uses the next sheet on the reverse, not blank paper that reveals old printed names',()=>{
  const book=source('components/SpeakingPhoneBook.tsx');
  const css=source('components/SpeakingBookRefinement.css');
  assert.match(book,/next: CallContact\[\]/);
  assert.match(book,/next: newEntries\.slice/);
  assert.match(book,/leaf\.next\.map/);
  assert.match(css,/\.qul-clean-book-leaf-face\.back \.qul-clean-book-entry \{\s*visibility: visible/);
  assert.match(css,/backface-visibility: visible/);
  assert.match(book,/phonebook-open-clean-v3\.avif/);
});

test('worksheet-style report uses QUL logo in preview and print, plus verified regional price guidance',()=>{
  const sheet=source('components/SpeakingReportSheet.tsx');
  const css=source('components/SpeakingReportSheet.css');
  const price=source('services/speakingUaePrices.mjs');
  assert.match(sheet,/Speaking Practice Worksheet/);
  assert.match(sheet,/ورقة متابعة التحدث/);
  assert.match(sheet,/src="\/Logo\.png"/);
  assert.match(css,/Printed worksheet styling shared/);
  assert.match(price,/Abu Dhabi silver taxis have an AED 12 minimum trip fare/);
  assert.match(price,/Al Ain or Abu Dhabi/);
  assert.match(price,/not real-time quotes/i);
});


test('rotary sounds use exactly one cached AudioBufferSource per digit, not many live nodes',()=>{
  const sound=source('services/rotaryDialAudio.ts');
  assert.match(sound,/const samples=new Map<string,AudioBuffer>/);
  assert.match(sound,/for\(const digit of '1234567890'\) samples\.set/);
  assert.match(sound,/const src=ctx\.createBufferSource\(\)/);
  assert.doesNotMatch(sound,/for\s*\(let i\s*=\s*0;\s*i\s*<\s*pulses;\s*i\+\+\)\s*\{[\s\S]*ctx\.createBufferSource/);
  const phone=source('components/SpeakingDeskPhone.tsx');
  assert.match(phone,/soundRef\.current\.prepare\(\)/);
  assert.match(phone,/currentMotionRef\.current\?\.cancel\(\)/);
});

test('every report PDF exports exactly two explicit paper pages without transcript overflow',()=>{
  const speak=source('pages/Speak.tsx');
  const sample=source('components/SpeakingSuggestedDialogueSheet.tsx');
  const reportCss=source('components/SpeakingReportSheet.css');
  assert.match(speak,/const sheets = \[summaryPrintRef\.current, sampleDialoguePrintRef\.current\]/);
  assert.match(speak,/if\(i>0\)pdf\.addPage\(\)/);
  assert.match(speak,/fit=Math\.min/);
  assert.doesNotMatch(speak,/summaryOffset -= pdfHeight/);
  assert.doesNotMatch(speak,/transcriptPrintRef/);
  assert.match(speak,/reportPage==='sample'/);
  assert.match(sample,/makeSpeakingSampleDialogue/);
  assert.match(sample,/src="\/Logo\.png"/);
  assert.match(reportCss,/Compact one-page worksheet/);
});

test('sample conversation is bilingual and directly related to a realistic phone scenario',()=>{
  for(const [ar,en,matches] of [
    ['مطعم','Restaurant',/وجبة|meal/],
    ['صيدلية','Pharmacy',/ضمادات|bandages/],
    ['تاكسي','Taxi',/المدرسة|school/],
    ['عيادة','Clinic',/موعد|appointment/],
    ['مدرسة','School',/الأنشطة|activities/],
    ['مغسلة','Laundry',/جهازي|device/]
  ]){
    const sample=makeSpeakingSampleDialogue({topicAr:ar,topicEn:en,level:'beginner'});
    assert.equal(sample.lines.length,8);
    assert.ok(sample.lines.every(x=>x.ar&&x.en&&['learner','agent'].includes(x.role)));
    assert.match(sample.lines.map(x=>x.ar+' '+x.en).join(' '),matches);
    assert.match(sample.noteEn,/not a recording or a real transaction/);
  }
});

test('alphabet tabs cover old printed letters and conversation log uses a paper tape without AI badges',()=>{
  const css=source('components/SpeakingFinishing.css');
  const book=source('components/SpeakingPhoneBook.tsx');
  const booth=source('components/SpeakingCallBooth.tsx');
  assert.match(css,/\.qul-clean-book-inside::before/);
  assert.match(css,/width:11\.9%/);
  assert.match(css,/\.qul-clean-book-tabs::before/);
  assert.match(css,/\.qul-clean-book-tabs button/);
  assert.match(booth,/className=\{'qul-call-receipt '/);
  assert.match(booth,/qul-call-receipt-paper/);
  assert.match(booth,/qul-call-receipt-turn/);
  assert.doesNotMatch(booth,/qul-scene-transcript-toggle/);
  assert.match(book,/ARABIC_DIRECTORY_LETTERS\.map/);
});


test('typed speaking turns stay in dialogue but never inflate oral evidence or mission proof',()=>{
  const turns=[
    {role:'user',text:'أريد الذهاب إلى المكتبة',modality:'text'},
    {role:'ai',text:'فكرة جميلة'},
    {role:'user',text:'أنا أقرأ كتابًا',modality:'speech'}
  ];
  const evidence=summarizeSpeakingEvidence(turns);
  assert.equal(evidence.learnerTurns,1);
  assert.equal(evidence.arabicWords,3);
  assert.equal(validateSpeakingMissionEvidence(turns,['موضوع'],[
    {goal:'موضوع',evidence:'أريد الذهاب إلى المكتبة'}
  ])[0].achieved,false);
});

test('free conversation has its own glass dock without changing physical call booth',()=>{
  const speak=source('pages/Speak.tsx');
  const studio=source('components/SpeakingFreeStudio.tsx');
  const css=source('components/SpeakingFreeStudio.css');
  const booth=source('components/SpeakingCallBooth.tsx');
  assert.match(speak,/speakingBranch === 'booth' \? \(/);
  assert.match(speak,/<SpeakingFreeStudio/);
  assert.match(studio,/data-testid="free-speaking-studio"/);
  assert.match(studio,/data-testid="free-speaking-tool-dock"/);
  assert.match(studio,/onSendText\(value\)/);
  assert.match(speak,/sendClientContent\(\{/);
  assert.match(speak,/modality: 'text'/);
  assert.match(speak,/finalHistory\.filter\(entry => entry\.role === 'ai' \|\| entry\.modality !== 'text'\)/);
  assert.match(studio,/onTranslate\(source\)/);
  assert.match(studio,/onToggleMic/);
  assert.match(studio,/onStop/);
  assert.match(studio,/onResume/);
  assert.match(studio,/onStartSpelling/);
  assert.match(css,/@media\(max-width:640px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.ok(!booth.includes('SpeakingFreeStudio'), 'The photographic telephone booth must remain independent');
});


test('finishing Pivot conversation always opens an honest report, including an incomplete transcript',()=>{
  const speak=source('pages/Speak.tsx');
  const studio=source('components/SpeakingFreeStudio.tsx');
  assert.match(speak,/const stopSession = async \(\) => \{/);
  assert.match(speak,/if \(finishingRef\.current\) return/);
  assert.match(speak,/setGeneratingInsights\(true\)/);
  assert.match(speak,/setShowSummary\(true\)/);
  assert.match(speak,/transport\.stream\?\.getAudioTracks\(\)/);
  assert.match(speak,/window\.setTimeout\(resolve, 850\)/);
  assert.ok(speak.indexOf('const finalHistory = flushPendingTranscript()',speak.indexOf('const stopSession'))<
    speak.indexOf('closeTransport();',speak.indexOf('const stopSession')));
  assert.match(speak,/if \(!hasTranscribedLearnerSpeech\(finalHistory\)\)/);
  assert.doesNotMatch(speak,/finalHistory\.some\(entry => entry\.role === 'user'.*&&/);
  assert.match(speak,/Promise\.race\(\[/);
  assert.match(speak,/12000/);
  assert.match(speak,/setInsights\(createLimitedSpeakingReport/);
  assert.match(speak,/setReportAvailable\(true\)/);
  assert.match(speak,/reportAvailable && speakingBranch === 'studio'/);
  assert.match(studio,/data-testid="free-speaking-finish"/);
  assert.match(studio,/isFinishing \?/);
  assert.match(studio,/disabled=\{isFinishing\}/);
  assert.match(studio,/إنهاء المحادثة وعرض التقرير/);
  assert.match(studio,/Finish & view report/);
});

test('missing speech evidence produces a limited bilingual report, not an assertion of silence',()=>{
  const examples=[
    [],
    [{role:'ai',text:'أهلاً وسهلاً'}],
    [{role:'user',text:'Please help',modality:'text'},{role:'ai',text:'بالطبع'}],
  ];
  for(const history of examples){
    assert.equal(hasTranscribedLearnerSpeech(history),false);
    const report=createLimitedSpeakingReport({topicAr:'المدرسة',history});
    assert.equal(report.assessmentStatus,'limited');
    assert.equal(report.corrections.length,0);
    assert.equal(report.key_vocabulary.length,0);
    assert.match(report.summary,/لا يمكن|غير موثوق/);
    assert.match(report.summaryEn,/not possible|cannot/);
    assert.match(report.next_practice.ar,/المدرسة/);
  }
  assert.equal(hasTranscribedLearnerSpeech([{role:'user',text:'أنا أريد الكتاب'}]),true);
  assert.equal(hasTranscribedLearnerSpeech([{role:'user',text:'أنا أريد الكتاب',modality:'text'}]),false);
});

test('report preview explains partial evidence in the selected UI language',()=>{
  const sheet=source('components/SpeakingReportSheet.tsx');
  const speak=source('pages/Speak.tsx');
  assert.match(sheet,/summaryEn\?: string/);
  assert.match(sheet,/ar \? insights\?\.summary : insights\?\.summaryEn/);
  assert.match(speak,/عرض آخر تقرير للمحادثة/);
  assert.match(speak,/View last conversation report/);
  assert.match(speak,/setShowMobileOptions\(false\); setShowSummary\(true\)/);
});
