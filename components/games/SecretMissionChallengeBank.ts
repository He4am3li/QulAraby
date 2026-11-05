import type { SecretRoomId } from './SecretMissionEngine';

type Bilingual = { ar: string; en: string };
export type SecretChallengeMode = 'select' | 'order' | 'verify' | 'write';
type Question = {
  mode: SecretChallengeMode;
  prompt: Bilingual;
  hint: Bilingual;
  explanation: Bilingual;
  options?: Bilingual[];
  answer?: number;
  tokens?: Bilingual[];
  accepted?: string[];
};
export type MissionChallenge = Question & {
  pin: string;
  loot: Bilingual;
  /** The index in the original correctly ordered tokens, for each visible token. */
  tokenOrder?: number[];
};
export type MissionDeck = Record<SecretRoomId, MissionChallenge[]>;

const b = (ar: string, en: string): Bilingual => ({ ar, en });
const select = (ar: string, en: string, opts: Bilingual[], answer: number, hint: Bilingual, explanation: Bilingual): Question =>
  ({ mode: 'select', prompt: b(ar, en), options: opts, answer, hint, explanation });
const order = (ar: string, en: string, tokens: Bilingual[], hint: Bilingual, explanation: Bilingual): Question =>
  ({ mode: 'order', prompt: b(ar, en), tokens, hint, explanation });
const verify = (ar: string, en: string, truth: boolean, hint: Bilingual, explanation: Bilingual): Question =>
  ({ mode: 'verify', prompt: b(ar, en), answer: truth ? 0 : 1, hint, explanation });
const write = (ar: string, en: string, accepted: string[], hint: Bilingual, explanation: Bilingual): Question =>
  ({ mode: 'write', prompt: b(ar, en), accepted, hint, explanation });

/** Two authored, level-appropriate variations per lock. Every room mixes four different activities. */
const BANK: Record<SecretRoomId, Question[][]> = {
  depot: [
    [
      select('على طاولة المخزن شيء يفتح الباب. ما هو؟', 'The depot table has an item that opens a door. What is it?',
        [b('مفتاح', 'Key'), b('كتاب', 'Book'), b('كرسي', 'Chair')], 0,
        b('فكّر في الشيء الذي تديره في القفل.', 'Think of what you turn in a lock.'),
        b('المفتاح يُستخدم لفتح الباب.', 'A key opens a door.')),
      select('تحتاج إلى رؤية الطريق في غرفة مظلمة. ماذا تأخذ؟', 'You need to see in a dark room. What do you take?',
        [b('حقيبة', 'Bag'), b('مصباح', 'Flashlight'), b('قلم', 'Pen')], 1,
        b('شيء يُضيء المكان.', 'Find the object that gives light.'),
        b('المصباح يساعدك على الرؤية.', 'A flashlight helps you see.'))
    ],
    [
      order('رتّب كلمات رسالة الباب لتفتح المخزن.', 'Put the Arabic access instruction in order.',
        [b('افتح', 'Open'), b('الباب', 'the door'), b('الآن', 'now')],
        b('ابدأ بفعل الأمر.', 'Start with the command verb.'),
        b('افتح الباب الآن.', 'Open the door now.')),
      order('رتّب الرسالة التي وجدتها على الصندوق.', 'Reassemble the message from the crate.',
        [b('هذا', 'This'), b('مفتاح', 'key'), b('المخزن', 'of the depot')],
        b('تبدأ الجملة باسم الإشارة.', 'The sentence begins with “this”.'),
        b('هذا مفتاح المخزن.', 'This is the depot key.'))
    ],
    [
      verify('على اللافتة: «ممنوع الدخول». هل يُسمح لك بالدخول؟', 'The sign says “No entry.” Are you allowed to enter?', false,
        b('كلمة «ممنوع» تعني أن الفعل غير مسموح.', '“ممنوع” means not permitted.'),
        b('لا، ممنوع الدخول يعني لا تدخل.', 'No, “No entry” means do not enter.')),
      verify('وجدت عبارة «الباب مفتوح». هل الباب مغلق؟', 'The report says “The door is open.” Is it closed?', false,
        b('مفتوح ضد مغلق.', '“Open” is the opposite of “closed”.'),
        b('لا، الباب مفتوح وليس مغلقًا.', 'No, the door is open.'))
    ],
    [
      write('أكمل بطاقة الدخول بكلمة عربية واحدة: «افتح ____».', 'Complete in Arabic: “افتح ____” (Open the door).', ['الباب', 'باب'],
        b('يبدأ الجواب بحرف الباء.', 'The word starts with ب.'),
        b('افتح الباب، أمر بسيط لفتح المدخل.', '“افتح الباب” means “Open the door.”')),
      write('اكتب بالعربية اسم الشيء الذي يفتح القفل.', 'Type the Arabic word for the object that opens a lock.', ['مفتاح', 'المفتاح'],
        b('الكلمة مكونة من خمسة أحرف وتبدأ بالميم.', 'Five Arabic letters, starting with م.'),
        b('مفتاح هو الشيء المستخدم في القفل.', 'مفتاح means key.'))
    ]
  ],
  comms: [
    [
      select('رسالة الراديو: «اذهب يسارًا». إلى أين تتحرك؟', 'Radio instruction: “Go left.” Which direction?',
        [b('يمينًا', 'Right'), b('يسارًا', 'Left'), b('إلى الخلف', 'Back')], 1,
        b('يسارًا عكس يمينًا.', 'Left is the opposite of right.'),
        b('يسارًا يعني الاتجاه الأيسر.', 'يسارًا means left.')),
      select('قال المرسل: «انتظر إشارة البدء». ماذا تفعل الآن؟', 'The operator says “Wait for the signal.” What do you do?',
        [b('أنتظر', 'Wait'), b('أركض', 'Run'), b('أغادر', 'Leave')], 0,
        b('لا تتحرك قبل الإشارة.', 'Do not move before the signal.'),
        b('أنتظر حتى تصل الإشارة.', 'Wait until the signal arrives.'))
    ],
    [
      order('أعد ترتيب رسالة اللاسلكي قبل إرسالها.', 'Rebuild the Arabic radio message in the correct order.',
        [b('اذهب', 'Go'), b('إلى', 'to'), b('اليمين', 'the right')],
        b('الجملة تبدأ بفعل الأمر.', 'Begin with the command verb.'),
        b('اذهب إلى اليمين.', 'Go to the right.')),
      order('رتّب خطوات إرسال الإشارة.', 'Put the Arabic transmission instruction in order.',
        [b('أرسل', 'Send'), b('الرسالة', 'the message'), b('الآن', 'now')],
        b('الفعل «أرسل» يأتي أولًا.', 'The command “أرسل” comes first.'),
        b('أرسل الرسالة الآن.', 'Send the message now.'))
    ],
    [
      verify('«افحص الشاشة ثم أرسل الرسالة». هل تُرسل الرسالة أولًا؟', '“Check the screen, then send the message.” Do you send it first?', false,
        b('«ثم» تدل على الترتيب.', 'ثم means “then”.'),
        b('يجب فحص الشاشة أولًا ثم إرسال الرسالة.', 'Check the screen first, then send.')),
      verify('«توقف عندما ترى الضوء الأحمر». هل تتوقف عند ظهور الأحمر؟', '“Stop when you see the red light.” Should you stop at red?', true,
        b('الجملة تبدأ بأمر واضح: توقف.', 'The message explicitly says stop.'),
        b('نعم، تتوقف عند الضوء الأحمر.', 'Yes, stop at the red light.'))
    ],
    [
      write('ورد الأمر «تحرك إلى اليمين». اكتب جهة الحركة بالعربية.', 'The command is “Move right.” Type the direction in Arabic.', ['يمين', 'اليمين', 'يمينا', 'يمينًا'],
        b('الجهة المقابلة لليسار.', 'The direction opposite left.'),
        b('اليمين هي جهة الحركة المطلوبة.', 'Right is the required direction.')),
      write('الرسالة تقول «أرسل ____». أكمل بكلمة الرسالة.', 'Complete in Arabic: “أرسل ____” (Send the message).', ['الرسالة', 'رسالة'],
        b('الكلمة تبدأ بـ «ر».', 'The word starts with ر.'),
        b('أرسل الرسالة.', 'Send the message.'))
    ]
  ],
  archive: [
    [
      select('التقرير: «وُجدت بطاقة على الطاولة ولم يُعثر على المفتاح». ما الدليل الموجود؟', 'Report: a card was found on the table, but no key. What evidence was found?',
        [b('بطاقة', 'Card'), b('مفتاح', 'Key'), b('ساعة', 'Watch')], 0,
        b('ابحث عمّا وُجد، لا عمّا فُقد.', 'Identify what was found, not what was missing.'),
        b('الدليل الموجود هو البطاقة.', 'The card was the evidence.')),
      select('«خرج الحارس قبل وصول المدير». من خرج أولًا؟', '“The guard left before the director arrived.” Who left first?',
        [b('المدير', 'Director'), b('الحارس', 'Guard'), b('المحقق', 'Detective')], 1,
        b('«قبل» تدل على الحدث الأسبق.', 'قبل indicates the earlier event.'),
        b('الحارس خرج قبل وصول المدير.', 'The guard left first.'))
    ],
    [
      order('رتّب الكلمات لتكوين تقرير مفهوم.', 'Arrange the Arabic words into an intelligible report.',
        [b('وجد', 'Found'), b('المحقق', 'the investigator'), b('دليلًا', 'evidence'), b('جديدًا', 'new')],
        b('ابدأ بالفعل ثم الفاعل.', 'Start with verb, then subject.'),
        b('وجد المحقق دليلًا جديدًا.', 'The investigator found new evidence.')),
      order('رتّب الجملة الموجودة في سجل الأدلة.', 'Reconstruct the sentence from the evidence log.',
        [b('قرأ', 'Read'), b('الحارس', 'the guard'), b('التقرير', 'the report'), b('سرًّا', 'secretly')],
        b('الجملة تبدأ بالفعل «قرأ».', 'The sentence begins with “قرأ”.'),
        b('قرأ الحارس التقرير سرًّا.', 'The guard read the report secretly.'))
    ],
    [
      verify('«لم يدخل أحد الغرفة بعد العاشرة». هل دخل شخص في الحادية عشرة؟', '“Nobody entered after ten.” Did someone enter at eleven?', false,
        b('الحادية عشرة بعد العاشرة.', 'Eleven is after ten.'),
        b('لا يوجد دخول بعد العاشرة وفق التقرير.', 'The report rules out entry after ten.')),
      verify('«كانت النافذة مفتوحة والباب مغلقًا». هل كان الباب مفتوحًا؟', '“The window was open and the door closed.” Was the door open?', false,
        b('انتبه للاختلاف بين الباب والنافذة.', 'Pay attention to the door versus the window.'),
        b('الباب مغلق، والنافذة مفتوحة.', 'The door was closed, the window open.'))
    ],
    [
      write('«بحث المحقق عن ____». اكتب كلمة تعني Evidence بالعربية.', 'Complete in Arabic with a word meaning evidence.', ['دليل', 'دليلا', 'دليلًا', 'الدليل'],
        b('الكلمة تبدأ بالدال.', 'The word begins with د.'),
        b('الدليل يساعد على معرفة الحقيقة.', 'Evidence helps establish the truth.')),
      write('اكتب الفعل المناسب: «____ الحارسُ التقريرَ». المعنى: Read.', 'Type the past-tense Arabic verb meaning “read” in the sentence.', ['قرأ'],
        b('الفعل يبدأ بالقاف وينتهي بالهمزة.', 'Starts with ق and ends with ء.'),
        b('قرأ الحارسُ التقريرَ.', 'The guard read the report.'))
    ]
  ],
  vault: [
    [
      select('الكاميرا معطلة، وممرّان أمامك. أي قرار يقلّل المخاطرة؟', 'The camera is down and two corridors lie ahead. What reduces risk?',
        [b('أفحص الخريطة', 'Check the map'), b('أركض عشوائيًا', 'Run blindly'), b('أتجاهل الأدلة', 'Ignore clues')], 0,
        b('القرار الآمن يعتمد على المعلومات.', 'An informed decision is safer.'),
        b('فحص الخريطة يقلّل التخمين والمخاطرة.', 'Checking the map reduces guesswork.')),
      select('تبقّى وقت قصير وفُقد جزء من الشفرة. ماذا يفيد الفريق؟', 'Time is short and part of the code is missing. What helps the team?',
        [b('إخفاء المشكلة', 'Hide the problem'), b('مشاركة المعلومات', 'Share information'), b('إغلاق اللاسلكي', 'Switch off radio')], 1,
        b('فكّر في فائدة التعاون.', 'Consider the value of teamwork.'),
        b('تبادل المعلومات يساعد على حل المشكلة.', 'Sharing information helps solve the problem.'))
    ],
    [
      order('رتّب خطة استعادة الأوراق.', 'Arrange the Arabic recovery plan in the correct order.',
        [b('افحص', 'Check'), b('الأدلة', 'the evidence'), b('ثم', 'then'), b('اتخذ القرار', 'make a decision')],
        b('تبدأ الخطة بفحص الأدلة.', 'The plan starts by checking evidence.'),
        b('افحص الأدلة ثم اتخذ القرار.', 'Check evidence, then decide.')),
      order('أعد تكوين أمر القيادة قبل فتح الحجرة.', 'Rebuild the command before opening the chamber.',
        [b('تأكد', 'Make sure'), b('من سلامة', 'of the safety of'), b('الفريق', 'the team'), b('أولًا', 'first')],
        b('الأمر يبدأ بـ «تأكد».', 'The command begins with “تأكد”.'),
        b('تأكد من سلامة الفريق أولًا.', 'Ensure the team is safe first.'))
    ],
    [
      verify('«لم يراجع الفريق الخريطة فتاه في الممر». هل كان غياب التخطيط سبب المشكلة؟', '“The team skipped the map and got lost.” Was poor planning a cause?', true,
        b('ابحث عن العلاقة بين الفعل والنتيجة.', 'Look for cause and effect.'),
        b('نعم، لم يُراجع الفريق الخريطة، فضاع الطريق.', 'Yes, skipping the map caused the problem.')),
      verify('«تعاون الفريق وفكّ الشفرة». هل النجاح نتج عن العمل الفردي؟', '“The team cooperated and cracked the code.” Was this an individual success?', false,
        b('لاحظ كلمة «تعاون».', 'Notice the word تعاون, cooperation.'),
        b('النجاح كان نتيجة التعاون بين الأفراد.', 'Success came from cooperation.'))
    ],
    [
      write('جملة التقرير: «نجح الفريق بفضل ____». اكتب كلمة تعني Cooperation.', 'Complete in Arabic with the word for cooperation.', ['التعاون', 'تعاون'],
        b('الكلمة تبدأ بالتاء.', 'The word starts with ت.'),
        b('التعاون ساعد على استرداد الوثائق.', 'Cooperation helped recover the documents.')),
      write('«علينا اتخاذ ____ آمن». اكتب كلمة Decision بالعربية.', 'Complete in Arabic with the word for “decision”.', ['قرار', 'القرار', 'قرارا', 'قرارًا'],
        b('تبدأ بالقاف وتنتهي بالراء.', 'Starts with ق and ends with ر.'),
        b('القرار الآمن يعتمد على الأدلة.', 'A safe decision is based on evidence.'))
    ]
  ]
};

function shuffledIndices(count: number): number[] {
  const indices = Array.from({ length: count }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  if (count > 1 && indices.every((original, i) => original === i)) {
    indices.push(indices.shift()!);
  }
  return indices;
}

export function normalizeArabic(value: string): string {
  return value.trim().normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي').replace(/\s+/g, ' ').replace(/[.،؟!]/g, '');
}

export function buildMissionDeck(source: Record<SecretRoomId, { safes: { pin: string; loot: Bilingual }[] }>): MissionDeck {
  const result = {} as MissionDeck;
  (Object.keys(BANK) as SecretRoomId[]).forEach(room => {
    result[room] = BANK[room].map((variants, index) => {
      const selected = variants[Math.floor(Math.random() * variants.length)];
      const challenge: MissionChallenge = { ...selected, pin: source[room].safes[index].pin, loot: source[room].safes[index].loot };
      if (selected.mode === 'select' && selected.options) {
        const permutation = shuffledIndices(selected.options.length);
        challenge.options = permutation.map(i => selected.options![i]);
        challenge.answer = permutation.indexOf(selected.answer!);
      } else if (selected.mode === 'order' && selected.tokens) {
        const permutation = shuffledIndices(selected.tokens.length);
        challenge.tokens = permutation.map(i => selected.tokens![i]);
        challenge.tokenOrder = permutation;
      }
      return challenge;
    });
  });
  return result;
}
