/**
 * Contextual model dialogues for page two of a QUL speaking report.
 * These are illustrative learning scripts, never transcripts of the student
 * or confirmations of real orders, medical advice, or reservations.
 */
export const makeSpeakingSampleDialogue = ({ topicAr = 'محادثة يومية', topicEn = 'Everyday conversation', level = 'beginner' } = {}) => {
  const text = (String(topicAr) + ' ' + String(topicEn)).toLowerCase();
  const turn = (role, ar, en) => ({ role, ar, en });
  const u = (ar, en) => turn('learner', ar, en);
  const a = (ar, en) => turn('agent', ar, en);
  let lines;
  if (/العائلة|الأسرة|أفراد الأسرة|family|relatives/.test(text)) {
    lines = [
      a('مرحبًا! هل لديك عائلة كبيرة؟','Hello! Do you have a big family?'),
      u('نعم، عائلتي كبيرة.','Yes, my family is big.'),
      a('كم شخصًا في عائلتك؟','How many people are in your family?'),
      u('في عائلتي خمسة أشخاص.','There are five people in my family.'),
      a('هل لديك إخوة أو أخوات؟','Do you have brothers or sisters?'),
      u('نعم، لدي أخ واحد وأختان.','Yes, I have one brother and two sisters.'),
      a('ماذا تحب أن تفعل مع عائلتك؟','What do you like doing with your family?'),
      u('أحب أن أتناول الطعام مع عائلتي.','I like eating with my family.'),
    ];
  } else if (/الطقس|الجو|weather/.test(text)) {
    lines = [
      a('كيف الطقس اليوم؟','How is the weather today?'),
      u('الطقس مشمس وحار.','It is sunny and hot.'),
      a('هل تحب الطقس الحار؟','Do you like hot weather?'),
      u('لا، أحب الطقس المعتدل.','No, I like mild weather.'),
      a('ماذا ترتدي عندما يكون الجو باردًا؟','What do you wear when it is cold?'),
      u('أرتدي معطفًا وأحمل مظلة إذا أمطرت.','I wear a coat and carry an umbrella if it rains.'),
    ];
  } else if (/الروتين|اليوم|routine|daily/.test(text)) {
    lines = [
      a('متى تستيقظ كل يوم؟','When do you wake up every day?'),
      u('أستيقظ الساعة السادسة صباحًا.','I wake up at six in the morning.'),
      a('ماذا تفعل بعد الاستيقاظ؟','What do you do after waking up?'),
      u('أغسل وجهي وأتناول الفطور.','I wash my face and eat breakfast.'),
      a('متى تذهب إلى المدرسة؟','When do you go to school?'),
      u('أذهب إلى المدرسة الساعة السابعة.','I go to school at seven.'),
    ];
  } else if (/شهور|أشهر|الشهر|السنة|months|month|calendar/.test(text)) {
    lines = [
      a('كم شهرًا في السنة؟','How many months are in a year?'),
      u('في السنة اثنا عشر شهرًا.','There are twelve months in a year.'),
      a('ما أول شهر وما آخر شهر في السنة؟','What are the first and last months of the year?'),
      u('أول شهر يناير، وآخر شهر ديسمبر.','The first month is January and the last is December.'),
      a('ما الأشهر التي تأتي بعد يناير؟','Which months come after January?'),
      u('فبراير ومارس وأبريل ومايو ويونيو.','February, March, April, May and June.'),
      a('وما الأشهر التي تأتي بعد يونيو؟','And which months come after June?'),
      u('يوليو وأغسطس وسبتمبر وأكتوبر ونوفمبر وديسمبر.','July, August, September, October, November and December.'),
      a('في أي شهر يبدأ العام الدراسي عادةً؟','In which month does the school year usually begin?'),
      u('يبدأ عادةً في أغسطس أو سبتمبر.','It usually begins in August or September.'),
      a('ما الشهر الذي يسبق ديسمبر؟','Which month comes before December?'),
      u('نوفمبر يسبق ديسمبر.','November comes before December.'),
    ];
  } else if (/حيوانات|الحيوان|animals|animal/.test(text)) {
    lines = [
      a('ما حيوانك المفضل؟','What is your favourite animal?'),
      u('حيواني المفضل هو الحصان.','My favourite animal is the horse.'),
      a('هل الحصان حيوان أليف أم بري؟','Is the horse a domestic or wild animal?'),
      u('الحصان حيوان أليف، أما الأسد فهو حيوان بري.','The horse is a domestic animal, but the lion is wild.'),
      a('اذكر حيوانات تعيش في المزرعة.','Name animals that live on a farm.'),
      u('البقرة والخروف والدجاجة والماعز.','A cow, a sheep, a chicken and a goat.'),
      a('وما الحيوانات التي تعيش في البرية؟','And which animals live in the wild?'),
      u('الأسد والفيل والزرافة والقرد.','The lion, elephant, giraffe and monkey.'),
      a('أين يعيش السمك والطائر؟','Where do fish and birds live?'),
      u('يعيش السمك في الماء، ويطير الطائر في السماء.','Fish live in water, and birds fly in the sky.'),
    ];
  } else if (/ملابس|الملابس|الثياب|clothes|clothing/.test(text)) {
    lines = [
      a('ماذا ترتدي اليوم؟','What are you wearing today?'),
      u('أرتدي قميصًا وبنطالًا وحذاءً.','I am wearing a shirt, trousers and shoes.'),
      a('ما لون قميصك؟','What colour is your shirt?'),
      u('قميصي أزرق وحذائي أسود.','My shirt is blue and my shoes are black.'),
      a('ماذا ترتدي في الشتاء؟','What do you wear in winter?'),
      u('أرتدي معطفًا وسترة ووشاحًا.','I wear a coat, a sweater and a scarf.'),
      a('وماذا ترتدي في الصيف؟','And what do you wear in summer?'),
      u('أرتدي ملابس خفيفة وقبعة.','I wear light clothes and a hat.'),
      a('ماذا تقول عندما تريد شراء حذاء؟','What do you say when you want to buy shoes?'),
      u('أريد حذاءً بمقاسي، من فضلك.','I would like shoes in my size, please.'),
    ];
  } else if (/مشاعر|الشعور|العواطف|feelings|emotions/.test(text)) {
    lines = [
      a('كيف تشعر اليوم؟','How do you feel today?'),
      u('أشعر بالسعادة لأنني مع أصدقائي.','I feel happy because I am with my friends.'),
      a('متى تشعر بالحزن؟','When do you feel sad?'),
      u('أشعر بالحزن عندما يمرض صديقي.','I feel sad when my friend is ill.'),
      a('متى تشعر بالخوف أو القلق؟','When do you feel afraid or worried?'),
      u('أشعر بالقلق قبل الامتحان.','I feel worried before an exam.'),
      a('وماذا تفعل عندما تغضب؟','And what do you do when you are angry?'),
      u('أتنفس بهدوء وأتحدث مع شخص أثق به.','I breathe calmly and talk to someone I trust.'),
      a('كيف تشعر بعد النجاح؟','How do you feel after succeeding?'),
      u('أشعر بالفخر والحماس.','I feel proud and excited.'),
    ];
  } else if (/فصول السنة|الفصول|seasons/.test(text)) {
    lines = [
      a('كم فصلًا في السنة؟','How many seasons are there in a year?'),
      u('في السنة أربعة فصول.','There are four seasons in a year.'),
      a('ما أسماء الفصول الأربعة؟','What are the four seasons called?'),
      u('الربيع والصيف والخريف والشتاء.','Spring, summer, autumn and winter.'),
      a('كيف يكون الجو في الصيف؟','What is the weather like in summer?'),
      u('يكون الجو حارًا ومشمسًا.','It is hot and sunny.'),
      a('ماذا يحدث للأوراق في الخريف؟','What happens to leaves in autumn?'),
      u('يتغير لونها وتتساقط من الأشجار.','They change colour and fall from trees.'),
      a('ما فصلك المفضل؟ ولماذا؟','What is your favourite season and why?'),
      u('أحب الشتاء لأن الجو بارد أحيانًا.','I like winter because the weather is sometimes cold.'),
    ];
  } else if (/التعارف|التعريف بالنفس|intro|introduc|greeting/.test(text)) {
    lines = [
      a('مرحبًا! ما اسمك؟','Hello! What is your name?'),
      u('اسمي أحمد. ما اسمك؟','My name is Ahmed. What is your name?'),
      a('اسمي سالم. من أين أنت؟','My name is Salem. Where are you from?'),
      u('أنا من الإمارات. وأنت؟','I am from the UAE. And you?'),
      a('أنا من الإمارات أيضًا. كم عمرك؟','I am from the UAE too. How old are you?'),
      u('عمري خمس عشرة سنة.','I am fifteen years old.'),
      a('في أي صف تدرس؟','Which grade are you in?'),
      u('أدرس في الصف العاشر.','I am in grade ten.'),
      a('ما هوايتك المفضلة؟','What is your favourite hobby?'),
      u('أحب القراءة وكرة القدم.','I like reading and football.'),
    ];
  } else if (/صيدلية|دواء|أدوية|ضمادات|pharmac|medicine|bandage/.test(text)) {
    lines = [
      a('مرحبًا، صيدلية المدينة، كيف أساعدك؟','Hello, City Pharmacy. How can I help?'),
      u('مرحبًا، هل عندكم ضمادات؟','Hello, do you have bandages?'),
      a('نعم، لدينا ضمادات. كم علبة تريد؟','Yes, we have bandages. How many packs do you need?'),
      u('أريد علبة واحدة من فضلك.','I would like one pack, please.'),
      a('حسنًا، هل تحتاج إلى شيء آخر؟','Certainly. Do you need anything else?'),
      u('لا، شكرًا. كم سعرها؟','No, thank you. How much is it?'),
      a('يختلف السعر حسب النوع، ويمكنك التأكد في الصيدلية.','The price depends on the type. Please check with the pharmacy.'),
      u('شكرًا لك. إلى اللقاء.','Thank you. Goodbye.'),
    ];
  } else if (/مطعم|بيتزا|شاورما|وجبة|غداء|عشاء|فطور|مخبز|خبز|سندويتش|طعام|كعك|food|restaurant|pizza|meal|bakery|sandwich|breakfast|lunch|dinner/.test(text)) {
    lines = [
      a('مرحبًا، مطعم المدينة، تفضل.','Hello, City Restaurant. How can I help?'),
      u('مرحبًا، أريد طلب وجبة من فضلك.','Hello, I would like to order a meal, please.'),
      a('بالتأكيد. ماذا تريد أن تأكل؟','Of course. What would you like to eat?'),
      u('أريد وجبة دجاج وعصيرًا.','I would like a chicken meal and a juice.'),
      a('هل تريد وجبة واحدة أم وجبتين؟','Would you like one meal or two?'),
      u('وجبة واحدة. كم السعر بالدرهم؟','One meal. How much does it cost in dirhams?'),
      a('في هذا المثال، السعر التقريبي خمسة وعشرون درهمًا.','In this example, the approximate price is AED 25.'),
      u('شكرًا لك. هذا كل شيء.','Thank you. That is all.'),
    ];
  } else if (/تاكسي|سيارة أجرة|سائق|مطار|نقل|taxi|driver|airport|transport/.test(text)) {
    lines = [
      a('مرحبًا، خدمة سيارات الأجرة.','Hello, taxi service.'),
      u('مرحبًا، أحتاج إلى سيارة أجرة.','Hello, I need a taxi.'),
      a('إلى أين تريد الذهاب؟','Where would you like to go?'),
      u('أريد الذهاب إلى المدرسة.','I would like to go to school.'),
      a('متى تريد السيارة؟','When do you need the car?'),
      u('الساعة الثامنة صباحًا من فضلك.','At eight in the morning, please.'),
      a('حسنًا، يمكنك معرفة الأجرة حسب المسافة.','All right. The fare depends on the distance.'),
      u('شكرًا لك، إلى اللقاء.','Thank you. Goodbye.'),
    ];
  } else if (/عيادة|طبيب|أسنان|حلاق|صالون|حجز|clinic|doctor|dental|dentist|salon|barber|appointment/.test(text)) {
    lines = [
      a('مرحبًا، مكتب الاستقبال، كيف أساعدك؟','Hello, reception. How can I help?'),
      u('مرحبًا، أريد حجز موعد.','Hello, I would like to book an appointment.'),
      a('في أي يوم تريد الموعد؟','Which day would you like?'),
      u('يوم الثلاثاء من فضلك.','Tuesday, please.'),
      a('هل تناسبك الساعة الرابعة؟','Does four o’clock suit you?'),
      u('نعم، الساعة الرابعة مناسبة.','Yes, four o’clock works for me.'),
      a('هذا مثال للتدريب، يرجى تأكيد الموعد مع الجهة الحقيقية.','This is a practice example. Please confirm with the real provider.'),
      u('شكرًا جزيلًا، إلى اللقاء.','Thank you very much. Goodbye.'),
    ];
  } else if (/مدرسة|دروس|كتب|مكتبة|قرطاسية|تعليم|school|library|book|lesson|stationery/.test(text)) {
    lines = [
      a('مرحبًا، مكتب المدرسة، تفضل.','Hello, school office. How may I help?'),
      u('مرحبًا، عندي سؤال من فضلك.','Hello, I have a question, please.'),
      a('تفضل، ما سؤالك؟','Go ahead. What is your question?'),
      u('متى تبدأ الأنشطة المدرسية؟','When do the school activities start?'),
      a('تبدأ بعد الحصة الثالثة.','They start after the third lesson.'),
      u('أين مكان النشاط؟','Where is the activity held?'),
      a('في المكتبة بجوار الفصل.','In the library next to the classroom.'),
      u('شكرًا على المساعدة.','Thank you for your help.'),
    ];
  } else if (/مغسلة|صيانة|كهربائي|سباك|ورشة|تصليح|إصلاح|خدمة|تنظيف|laundry|repair|clean|service|garage/.test(text)) {
    lines = [
      a('مرحبًا، قسم الخدمة، كيف أساعدك؟','Hello, service desk. How can I help?'),
      u('مرحبًا، أحتاج إلى مساعدة.','Hello, I need some help.'),
      a('ما المشكلة؟','What seems to be the problem?'),
      u('جهازي لا يعمل جيدًا.','My device is not working well.'),
      a('هل تريد زيارة من الفني؟','Would you like a technician to visit?'),
      u('نعم، متى يمكنه المجيء؟','Yes. When can they come?'),
      a('يعتمد الموعد والتكلفة على نوع الخدمة.','The time and cost depend on the service.'),
      u('شكرًا، سأتحقق من الموعد.','Thank you. I will check the time.'),
    ];
  } else if (/فندق|سفر|رحلة|تذاكر|سينما|hotel|travel|ticket|cinema|trip/.test(text)) {
    lines = [
      a('مرحبًا، مكتب الحجز، تفضل.','Hello, booking desk. How may I help?'),
      u('مرحبًا، أريد الاستفسار عن الحجز.','Hello, I would like to ask about a booking.'),
      a('متى تريد الحجز؟','When would you like to book?'),
      u('يوم الجمعة من فضلك.','Friday, please.'),
      a('كم شخصًا سيحضر؟','How many people will be coming?'),
      u('شخصان، من فضلك.','Two people, please.'),
      a('يمكنك التأكد من التوافر والسعر مع الجهة.','You can confirm availability and price with the provider.'),
      u('شكرًا لك.','Thank you.'),
    ];
  } else if (/قهوة|مقهى|شاي|عصير|coffee|cafe|café|tea|juice/.test(text)) {
    lines = [
      a('مرحبًا، المقهى، ماذا تريد؟','Hello, café. What would you like?'),
      u('مرحبًا، أريد مشروبًا من فضلك.','Hello, I would like a drink, please.'),
      a('هل تريد شايًا أم عصيرًا؟','Would you like tea or juice?'),
      u('أريد شاي كرك.','I would like karak tea.'),
      a('هل تريد كوبًا واحدًا؟','Would you like one cup?'),
      u('نعم، كوبًا واحدًا. كم السعر؟','Yes, one cup. How much is it?'),
      a('في هذا المثال، السعر ثلاثة دراهم.','In this example, the price is AED 3.'),
      u('شكرًا، إلى اللقاء.','Thank you. Goodbye.'),
    ];
  } else {
    // Never fabricate a service desk scenario for an unrelated learning topic.
    // A generic template cannot guarantee the target vocabulary is taught.
    lines = [
      a('ما موضوع حديثنا اليوم؟','What is our topic today?'),
      u('موضوعنا اليوم هو ' + String(topicAr || 'موضوع جديد') + '.','Today our topic is ' + String(topicEn || 'a new topic') + '.'),
      a('ما الكلمات المهمة التي تعرفها عن هذا الموضوع؟','What important words do you know about this topic?'),
      u('أعرف بعض الكلمات، وأريد أن أتعلم كلمات جديدة.','I know some words and want to learn new ones.'),
      a('هل تستطيع أن تستخدم كلمة من الموضوع في جملة؟','Can you use a word from the topic in a sentence?'),
      u('سأختار كلمة وأكوّن بها جملة مفيدة.','I will choose a word and make a useful sentence.'),
    ];
  }
  const levelId=String(level).toLowerCase();
  return {
    titleAr: String(topicAr), titleEn: String(topicEn),
    level:levelId,
    lines,
    promptAr:levelId.includes('advanced')?'أعد الحوار بأسلوب أكثر تفصيلًا، وأضف سؤالًا جديدًا.':'بدّل اسم الشيء أو الموعد، ثم تدرّب على الحوار مع زميلك.',
    promptEn:levelId.includes('advanced')?'Retell the dialogue in greater detail and add another question.':'Change the item or time, then practise the dialogue with a partner.',
    noteAr:'نموذج للتدريب، وليس تسجيلًا لمكالمة حقيقية.',
    noteEn:'Practice model, not a recording or a real transaction.',
  };
};
