/**
 * One concise, bilingual learning hint per vocabulary topic.
 * Tips are information only: no quizzes, card buttons, or additional UI.
 */
export interface VocabularyTopicHint { ar: string; en: string; }
export const VOCABULARY_TOPIC_HINTS: Record<string, VocabularyTopicHint> = {
  "about_me": {
    "ar": "للتحية والرد عبارات متناسبة، مثل: «صباح الخير» و«صباح النور». ولشكر شخص قل «شكرًا»، فيجيب «على الرحب والسعة».",
    "en": "Greetings have natural responses. For example, «صباح الخير» can be answered with «صباح النور». Reply to «شكرًا» with «على الرحب والسعة»."
  },
  "family_hobbies": {
    "ar": "للتحدث عن أسرتك، أضف ياء المتكلم: «أب ← أبي»، «أخت ← أختي». وبعض الكلمات تتغير صورتها، مثل «الوالدان ← والداي».",
    "en": "To talk about your family, use the possessive suffix ي: «أب ← أبي» (my father), «أخت ← أختي» (my sister). Some forms change, such as «الوالدان ← والداي» (my parents)."
  },
  "feelings": {
    "ar": "عند وصف فتاة، تتغير نهاية كثير من صفات المشاعر: «سعيد ← سعيدة»، «غاضب ← غاضبة». قل: «أنا سعيدة» إذا كانت المتحدثة فتاة.",
    "en": "Many feeling adjectives take a feminine ending: «سعيد ← سعيدة» (happy), «غاضب ← غاضبة» (angry). A girl can say «أنا سعيدة» (I am happy)."
  },
  "body_parts": {
    "ar": "للتحدث عن أجزاء جسمك، استخدم ياء المتكلم: «رأس ← رأسي»، «يد ← يدي»، «عين ← عيني».",
    "en": "To talk about your own body, add the possessive suffix ي: «رأس ← رأسي» (my head), «يد ← يدي» (my hand), «عين ← عيني» (my eye)."
  },
  "clothing": {
    "ar": "غالبًا نقول «أرتدي» مع الملابس، و«أضع» مع بعض الإكسسوارات: «أرتدي قميصًا، وأضع نظارة شمسية».",
    "en": "Use «أرتدي» (I wear) for clothes and «أضع» (I put on) for accessories: «أرتدي قميصًا، وأضع نظارة شمسية». (I wear a shirt and put on sunglasses.)"
  },
  "living": {
    "ar": "استخدم «في» لما يوجد داخل مكان، و«على» لما يوجد فوق سطح: «السرير في غرفة النوم»، «الكتاب على الطاولة».",
    "en": "Use «في» (in) for something inside a place, and «على» (on) for something on a surface: «السرير في غرفة النوم» (the bed is in the bedroom)."
  },
  "routine": {
    "ar": "لترتيب أعمال يومك استخدم «ثم»، «بعد ذلك»، «أخيرًا»: «أستيقظ، ثم أتناول الإفطار، وأخيرًا أنام».",
    "en": "Use «ثم» (then), «بعد ذلك» (after that), and «أخيرًا» (finally) to describe your routine: «أستيقظ، ثم أتناول الإفطار» (I wake up, then eat breakfast)."
  },
  "food_drink": {
    "ar": "استخدم «آكل» مع الطعام و«أشرب» مع المشروبات: «آكل الأرز وأشرب العصير».",
    "en": "Use «آكل» (I eat) for food and «أشرب» (I drink) for beverages: «آكل الأرز وأشرب العصير» (I eat rice and drink juice)."
  },
  "fruits": {
    "ar": "عبّر عن تفضيلاتك باستخدام «أحب» و«لا أحب»: «أحب الموز، ولا أحب الكيوي».",
    "en": "Express your preferences using «أحب» (I like) and «لا أحب» (I do not like): «أحب الموز، ولا أحب الكيوي» (I like bananas but not kiwi)."
  },
  "vegetables": {
    "ar": "استخدم أفعالًا مناسبة لإعداد الطعام: «أغسل الخيار»، «أقطع الجزر»، «أطبخ البطاطس».",
    "en": "Use specific preparation verbs: «أغسل الخيار» (I wash the cucumber), «أقطع الجزر» (I cut carrots), «أطبخ البطاطس» (I cook potatoes)."
  },
  "key_phrases": {
    "ar": "تُستعمل بعض الكلمات أوامر في الصف، مثل «قِف» و«اجلس». ومع الأدوات قل: «أستخدم القلم للكتابة».",
    "en": "Some classroom words are commands, such as «قِف» (stand up) and «اجلس» (sit down). For tools, say «أستخدم القلم للكتابة» (I use a pen to write)."
  },
  "survival": {
    "ar": "للتحدث عن المواد الدراسية استخدم «أدرس»: «أدرس العلوم والرياضيات». ويمكنك أن تقول: «أرسم في حصة الفن».",
    "en": "Use «أدرس» (I study) with school subjects: «أدرس العلوم والرياضيات» (I study science and mathematics). You can also say «أرسم في حصة الفن» (I draw in art class)."
  },
  "time": {
    "ar": "ابدأ تحديد الوقت بكلمة «الساعة»: «الساعة السابعة صباحًا»، «الساعة السابعة والنصف».",
    "en": "Begin telling the time with «الساعة» (it is ... o'clock): «الساعة السابعة صباحًا» (7:00 a.m.), «الساعة السابعة والنصف» (7:30)."
  },
  "weather": {
    "ar": "لوصف حالة الجو، استخدم «الجو» ثم صفة مناسبة: «الجو حار في الصيف»، «الجو بارد في الشتاء».",
    "en": "Describe the weather with «الجو» (the weather) and an adjective: «الجو حار في الصيف» (it is hot in summer), «الجو بارد في الشتاء» (it is cold in winter)."
  },
  "instructions": {
    "ar": "للتحدث عن موعد حدث، قل «في شهر» ثم اسم الشهر: «أسافر في شهر يوليو»، «تبدأ الدراسة في شهر سبتمبر».",
    "en": "Use «في شهر» (in the month of) before a month: «أسافر في شهر يوليو» (I travel in July), «تبدأ الدراسة في شهر سبتمبر» (school begins in September)."
  },
  "colours": {
    "ar": "بعض أسماء الألوان تتغير مع المذكر والمؤنث: «قلم أحمر»، «وردة حمراء»، «كتاب أزرق»، «حقيبة زرقاء».",
    "en": "Some colors change to agree with the noun: «قلم أحمر» (red pen), «وردة حمراء» (red flower), «كتاب أزرق» (blue book), «حقيبة زرقاء» (blue bag)."
  },
  "animals": {
    "ar": "استخدم «هذا» مع الأسماء المذكرة و«هذه» مع الأسماء المؤنثة: «هذا أسد»، «هذه زرافة»، «هذه قطة».",
    "en": "Use «هذا» (this, masculine) with masculine nouns and «هذه» (this, feminine) with feminine nouns: «هذا أسد» (this is a lion), «هذه زرافة» (this is a giraffe)."
  },
  "birds": {
    "ar": "استخدم «يطير» أو «لا يطير» لوصف القدرة على الطيران: «العصفور يطير، والبطريق لا يطير». والخفاش يطير لكنه ليس طائرًا.",
    "en": "Use «يطير» (flies) or «لا يطير» (does not fly): «العصفور يطير، والبطريق لا يطير» (a sparrow flies, a penguin does not). A bat can fly but is not a bird."
  },
  "fish_creatures": {
    "ar": "ميّز بين الكائن البحري والأداة والطعام: «القرش يعيش في البحر»، «السنارة أداة للصيد»، «السوشي طعام».",
    "en": "Distinguish sea animals, tools and food: «القرش» (shark) is a sea animal, «السنارة» (fishing rod) is a tool, and «السوشي» (sushi) is food."
  },
  "insects_reptiles": {
    "ar": "صف حركة الكائنات بأفعال مناسبة: «الفراشة تطير»، «الثعبان يزحف»، «السلحفاة تمشي»، «الضفدع يقفز».",
    "en": "Choose the right movement verb: «الفراشة تطير» (the butterfly flies), «الثعبان يزحف» (the snake slithers), «السلحفاة تمشي» (the turtle walks)."
  },
  "places": {
    "ar": "للتعبير عن الاتجاه إلى مكان، استخدم «أذهب إلى»: «أذهب إلى المدرسة»، «أذهب إلى المتحف».",
    "en": "Use «أذهب إلى» (I go to) when going somewhere: «أذهب إلى المدرسة» (I go to school), «أذهب إلى المتحف» (I go to the museum)."
  },
  "sports": {
    "ar": "نقول غالبًا «ألعب» مع ألعاب الكرة و«أمارس» مع أنشطة أخرى: «ألعب كرة القدم»، «أمارس السباحة».",
    "en": "Use «ألعب» (I play) with many ball games and «أمارس» (I practice/do) with other sports: «ألعب كرة القدم» (I play football), «أمارس السباحة» (I swim)."
  },
  "transport": {
    "ar": "يمكنك إضافة الباء إلى وسيلة النقل لتبيّن كيف تسافر: «أسافر بالطائرة»، «أذهب بالحافلة»، «أركب القطار».",
    "en": "Add the prefix بـ (by) to express transportation: «أسافر بالطائرة» (I travel by plane), «أذهب بالحافلة» (I go by bus)."
  },
  "jobs": {
    "ar": "اربط اسم المهنة بالفعل المناسب: «الطبيب يعالج»، «المعلم يشرح»، «الطيار يقود الطائرة».",
    "en": "Match each job with its action: «الطبيب يعالج» (a doctor treats patients), «المعلم يشرح» (a teacher explains), «الطيار يقود الطائرة» (a pilot flies the plane)."
  },
  "shopping": {
    "ar": "عند الشراء قل: «أدفع بالنقود» أو «أدفع ببطاقة الدفع»، ثم «آخذ الإيصال».",
    "en": "When shopping, say «أدفع بالنقود» (I pay cash) or «أدفع ببطاقة الدفع» (I pay by card), then «آخذ الإيصال» (I take the receipt)."
  },
  "health": {
    "ar": "للتعبير عن الأداة المستخدمة، أضف الباء: «أقيس الحرارة بميزان الحرارة»، «أنظف يدي بالمعقم».",
    "en": "Use the prefix بـ to express the tool you use: «أقيس الحرارة بميزان الحرارة» (I measure temperature with a thermometer), «أنظف يدي بالمعقم» (I clean my hands with sanitizer)."
  },
  "tech": {
    "ar": "اربط الجهاز بوظيفته باستخدام «أستخدم ... لكي»: «أستخدم الطابعة لكي أطبع ورقة».",
    "en": "Use «أستخدم ... لكي» (I use ... to) to explain a device's purpose: «أستخدم الطابعة لكي أطبع ورقة» (I use the printer to print a page)."
  },
  "nature": {
    "ar": "استخدم «أرى» لوصف ما تشاهده في الطبيعة: «أرى شجرة»، «أرى جبلًا»، «أرى البحر».",
    "en": "Use «أرى» (I see) to describe nature: «أرى شجرة» (I see a tree), «أرى جبلًا» (I see a mountain), «أرى البحر» (I see the sea)."
  },
  "music": {
    "ar": "استخدم «أعزف على» مع الآلات الموسيقية: «أعزف على الكمان». ونقول: «أتحدث في الميكروفون».",
    "en": "Use «أعزف على» (I play) with musical instruments: «أعزف على الكمان» (I play the violin). Say «أتحدث في الميكروفون» (I speak into the microphone)."
  },
  "travel": {
    "ar": "تعلّم أفعال المطار المهمة: «أحمل حقيبة السفر»، «أُبرز جواز السفر»، «أجلس في مقعد الطائرة».",
    "en": "Learn useful airport phrases: «أحمل حقيبة السفر» (I carry a suitcase), «أُبرز جواز السفر» (I show my passport), «أجلس في مقعد الطائرة» (I sit in my airplane seat)."
  }
};
