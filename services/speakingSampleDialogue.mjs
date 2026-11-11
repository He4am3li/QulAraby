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
    const subjectAr = String(topicAr || 'الخدمة').trim().slice(0,75);
    const subjectEn = String(topicEn || 'this service').trim().slice(0,75);
    lines = [
      a('مرحبًا، كيف أساعدك اليوم؟','Hello. How can I help you today?'),
      u('مرحبًا، أريد السؤال عن ' + subjectAr + '.','Hello. I would like to ask about ' + subjectEn + '.'),
      a('بالتأكيد. ماذا تريد أن تعرف؟','Certainly. What would you like to know?'),
      u('هل هذه الخدمة متوفرة اليوم؟','Is this service available today?'),
      a('ربما، حسب الموعد. متى تريدها؟','Possibly, depending on the time. When would you like it?'),
      u('أريدها غدًا إن أمكن.','I would like it tomorrow, if possible.'),
      a('تأكد من التفاصيل مع الجهة المختصة.','Please confirm the details with the provider.'),
      u('شكرًا لك على المساعدة.','Thank you for your help.'),
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
