// Source: user-supplied "Arabic_150_Bilingual_Texts(1).docx" (41 pages).
// Exactly 3 levels × 5 types × 10 distinct texts, with their provided Arabic
// wording and English translations. Extracted from the bilingual Word tables.
// NOTE: Page-text extraction can invert punctuation/clause order in RTL prose;
// prepareRadioExerciseFromSource uses the source's English translation to
// restore correct Arabic reading order, WITHOUT adding new story content.
export type RadioCorpusLevel = 'beginner' | 'intermediate' | 'advanced';
export type RadioCorpusType = 'scenario' | 'dialogue' | 'story' | 'riddle' | 'news';
export type RadioCorpusText = {
  id:string; level:RadioCorpusLevel; type:RadioCorpusType;
  number:number; titleAr:string; sourceArabic:string; translationEn:string; page:number; riddleAnswerAr?:string;
};
export const RADIO_TEXT_CORPUS:RadioCorpusText[] = [
 {
  "id": "beginner-scenario-01",
  "level": "beginner",
  "type": "scenario",
  "number": 1,
  "titleAr": "في الصف",
  "sourceArabic": "صباح: رأيت المعلم وقلت.دخلت الصف صباًح ا أنا. جلست على الكرسي وفتحت كتابي.الخير .مستعد للدرس",
  "translationEn": "I entered the classroom in the morning. I saw the teacher and said, “Good morning.” I sat on the chair and opened my book. I am ready for the lesson.",
  "page": 2
 },
 {
  "id": "beginner-scenario-02",
  "level": "beginner",
  "type": "scenario",
  "number": 2,
  "titleAr": "قلم جديد",
  "sourceArabic": ". طلبت قلًما من صديقي.نسيت قلمي في البيت كتبت اسمي. شكًر ا لك: فقلت له،أعطاني قلًم ا أزرق .في الدفتر",
  "translationEn": "I left my pen at home. I asked my friend for a pen. He gave me a blue one, so I said, “Thank you.” I wrote my name in the notebook.",
  "page": 2
 },
 {
  "id": "beginner-scenario-03",
  "level": "beginner",
  "type": "scenario",
  "number": 3,
  "titleAr": "في المتجر",
  "sourceArabic": ". اخترت خبًز ا وحليًبا.ذهبت إلى المتجر مع أمي عدنا إلى البيت.وضعت أمي الطعام في الحقيبة .وأعددنا الفطور",
  "translationEn": "I went to the shop with my mother. I chose bread and milk. My mother put the food in the bag. We returned home and made breakfast.",
  "page": 2
 },
 {
  "id": "beginner-scenario-04",
  "level": "beginner",
  "type": "scenario",
  "number": 4,
  "titleAr": "طالب جديد",
  "sourceArabic": "ما، اسمي عمر: قلت له.جاء طالب جديد إلى صفنا وقرأنا، جلس بجواري. اسمي سام:اسمك؟ قال .الدرس مًعا",
  "translationEn": "A new student came to our class. I said, “My name is Omar. What is your name?” He said, “My name is Sam.” He sat beside me, and we read the lesson together.",
  "page": 2
 },
 {
  "id": "beginner-scenario-05",
  "level": "beginner",
  "type": "scenario",
  "number": 5,
  "titleAr": "في الحافلة",
  "sourceArabic": "رأيت مقعًدا فارًغا.ركبت الحافلة إلى المدرسة وصلت. وضعت حقيبتي قرب قدمي.وجلست عليه .إلى المدرسة في الوقت المحدد",
  "translationEn": "I took the bus to school. I saw an empty seat and sat on it. I put my bag near my feet. I arrived at school on time.",
  "page": 2
 },
 {
  "id": "beginner-scenario-06",
  "level": "beginner",
  "type": "scenario",
  "number": 6,
  "titleAr": "كوب الماء",
  "sourceArabic": ". دخلت المطبخ وأخذت كوًبا.كنت عطشان بعد اللعب عدت إلى غرفتي. ثم غسلت الكوب،شربت ماًء .ألستريح",
  "translationEn": "I was thirsty after playing. I went into the kitchen and took a cup. I drank some water, then washed the cup. I returned to my room to rest.",
  "page": 3
 },
 {
  "id": "beginner-scenario-07",
  "level": "beginner",
  "type": "scenario",
  "number": 7,
  "titleAr": "في المكتبة",
  "sourceArabic": ". طلبت كتاًبا عن الحيوانات.دخلت مكتبة المدرسة جلست وقرأت.أعطتني أمينة المكتبة كتاًبا صغيًر ا .صفحة عن القطط",
  "translationEn": "I entered the school library. I asked for a book about animals. The librarian gave me a small book. I sat down and read a page about cats.",
  "page": 3
 },
 {
  "id": "beginner-scenario-08",
  "level": "beginner",
  "type": "scenario",
  "number": 8,
  "titleAr": "كرة في الحديقة",
  "sourceArabic": "ذهبت الكرة إلى.كنت ألعب بالكرة في الحديقة شكرته. أخذها الطفل وأعطاني إياها.طفل صغير .ودعوته إلى اللعب",
  "translationEn": "I was playing with a ball in the park. The ball rolled over to a little boy. He picked it up and gave it to me. I thanked him and invited him to play.",
  "page": 3
 },
 {
  "id": "beginner-scenario-09",
  "level": "beginner",
  "type": "scenario",
  "number": 9,
  "titleAr": "باب مفتوح",
  "sourceArabic": "فسألت، كان الهواء بارًدا.رأيت باب الصف مفتوًح ا . من فضلك، نعم: هل أغلق الباب؟ قال:المعلم .أغلقت الباب وجلست",
  "translationEn": "I saw that the classroom door was open. The air was cold, so I asked the teacher, “Shall I close the door?” He said, “Yes, please.” I closed it and sat down.",
  "page": 3
 },
 {
  "id": "beginner-scenario-10",
  "level": "beginner",
  "type": "scenario",
  "number": 10,
  "titleAr": "وقت النوم",
  "sourceArabic": "غسلت أسناني ولبست.وضعت كتبي في الحقيبة أغلقت. تصبح على خير: قلت ألبي.مالبس النوم .عيني ونمت",
  "translationEn": "I put my books in my bag. I brushed my teeth and put on my pajamas. I said goodnight to my father. I closed my eyes and fell asleep.",
  "page": 3
 },
 {
  "id": "beginner-dialogue-01",
  "level": "beginner",
  "type": "dialogue",
  "number": 1,
  "titleAr": "التعارف",
  "sourceArabic": "علي :مرحًبا ،ما اسمك؟ آدم :اسمي آدم .وأنت؟ علي :أنا علي .هل أنت طالب جديد؟ آدم :نعم ،أنا في هذا الصف.",
  "translationEn": "?Ali: Hello. What is your name ?Adam: My name is Adam. And you ?Ali: I’m Ali. Are you a new student Adam: Yes, I’m in this class.",
  "page": 4
 },
 {
  "id": "beginner-dialogue-02",
  "level": "beginner",
  "type": "dialogue",
  "number": 2,
  "titleAr": "في المقصف",
  "sourceArabic": "الطالب :أريد شطيرة جبن ،من فضلك. البائع :هل تريد ماًء أيًضا؟ الطالب :نعم .كم السعر؟ البائع :ستة دراهم للشطيرة والماء.",
  "translationEn": "Student: I’d like a cheese sandwich, please. ?Seller: Would you like water too ?Student: Yes. How much is it Seller: Six dirhams for the sandwich and water.",
  "page": 4
 },
 {
  "id": "beginner-dialogue-03",
  "level": "beginner",
  "type": "dialogue",
  "number": 3,
  "titleAr": "لون الحقيبة",
  "sourceArabic": "مريم :أين حقيبتك يا سارة؟ سارة :حقيبتي تحت الطاولة. مريم :هل هي الحقيبة الحمراء؟ سارة :ال ،حقيبتي زرقاء وصغيرة.",
  "translationEn": "?Mariam: Where is your bag, Sara Sara: My bag is under the table. ?Mariam: Is it the red bag Sara: No, my bag is blue and small.",
  "page": 4
 },
 {
  "id": "beginner-dialogue-04",
  "level": "beginner",
  "type": "dialogue",
  "number": 4,
  "titleAr": "يوم العطلة",
  "sourceArabic": "األب :ماذا تريد أن تفعل اليوم؟ االبن :أريد أن أذهب إلى الحديقة. األب :هل نأخذ الكرة معنا؟ االبن :نعم ،أحب لعب الكرة.",
  "translationEn": "?Father: What would you like to do today Son: I’d like to go to the park. ?Father: Shall we take the ball Son: Yes, I like playing ball.",
  "page": 4
 },
 {
  "id": "beginner-dialogue-05",
  "level": "beginner",
  "type": "dialogue",
  "number": 5,
  "titleAr": "الوقت",
  "sourceArabic": "هند :كم الساعة اآلن؟ نور :الساعة الثامنة. هند :متى يبدأ الدرس؟ نور :يبدأ في الثامنة والنصف .لدينا وقت.",
  "translationEn": "?Hind: What time is it now Noor: It’s eight o’clock. ?Hind: When does the lesson begin Noor: It begins at half past eight. We have time.",
  "page": 4
 },
 {
  "id": "beginner-dialogue-06",
  "level": "beginner",
  "type": "dialogue",
  "number": 6,
  "titleAr": "حيوان مفضل",
  "sourceArabic": "ما حيوانك المفضل؟:سالم وأنت؟. أحب القطط:يوسف . عندي طائر صغير. أحب الطيور:سالم ما لونه؟:يوسف . لونه أصفر:سالم",
  "translationEn": "Salem: What is your favorite animal? Yousef: I like cats. And you? Salem: I like birds. I have a small bird. Yousef: What color is it? Salem: It’s yellow.",
  "page": 5
 },
 {
  "id": "beginner-dialogue-07",
  "level": "beginner",
  "type": "dialogue",
  "number": 7,
  "titleAr": "طلب المساعدة",
  "sourceArabic": ". ال أفهم هذه الكلمة:الطالب أي كلمة؟:المعلم . كلمة نافذة:الطالب . نرى الحديقة منها. هذه نافذة، انظر:المعلم . شكًر ا. اآلن فهمت:الطالب",
  "translationEn": "Student: I don’t understand this word. Teacher: Which word? Student: The word “window.” Teacher: Look, this is a window. We can see the garden through it. Student: Now I understand. Thank you.",
  "page": 5
 },
 {
  "id": "beginner-dialogue-08",
  "level": "beginner",
  "type": "dialogue",
  "number": 8,
  "titleAr": "زيارة صديق",
  "sourceArabic": "هل تزورني اليوم؟:أحمد . بعد العصر، نعم:حسن ماذا تحب أن تشرب؟:أحمد . أحب عصير البرتقال:حسن . نقرأ قصة ونشرب العصير، حسًنا:أحمد",
  "translationEn": "Ahmed: Will you visit me today? Hassan: Yes, in the late afternoon. Ahmed: What would you like to drink? Hassan: I like orange juice. Ahmed: Good. We’ll read a story and drink juice.",
  "page": 5
 },
 {
  "id": "beginner-dialogue-09",
  "level": "beginner",
  "type": "dialogue",
  "number": 9,
  "titleAr": "الطقس",
  "sourceArabic": "هل الجو حار اليوم؟:ليلى . الجو بارد قلياًل، ال:األم هل ألبس معطفي؟:ليلى . وخذي قبعتك أيًضا، نعم:األم",
  "translationEn": "Layla: Is it hot today? Mother: No, it’s a little cold. Layla: Shall I wear my coat? Mother: Yes, and take your hat too.",
  "page": 5
 },
 {
  "id": "beginner-dialogue-10",
  "level": "beginner",
  "type": "dialogue",
  "number": 10,
  "titleAr": "الطعام",
  "sourceArabic": "هل تريد أرًز ا يا عمر؟:األم . أريد قلياًل من األرز، نعم:عمر وهل تريد سلطة؟:األم . أحب الخيار والطماطم، نعم:عمر",
  "translationEn": "Mother: Would you like rice, Omar? Omar: Yes, I’d like a little rice. Mother: Would you like salad too? Omar: Yes, I like cucumbers and tomatoes.",
  "page": 5
 },
 {
  "id": "beginner-story-01",
  "level": "beginner",
  "type": "story",
  "number": 1,
  "titleAr": "القطة الصغيرة",
  "sourceArabic": "فتحت الباب.سمعت ندى صوت قطة قرب الباب جاءت صاحبة. وضعت لها ماًء.ورأت قطة صغيرة . وشكرت ندى،القطة وأخذتها",
  "translationEn": "Nada heard a cat near the door. She opened the door and saw a small cat. She put out water for it. The cat’s owner came and took it home, thanking Nada.",
  "page": 6
 },
 {
  "id": "beginner-story-02",
  "level": "beginner",
  "type": "story",
  "number": 2,
  "titleAr": "البذرة",
  "sourceArabic": "وضع الوعاء قرب النافذة.زرع مازن بذرة في وعاء فرح. ظهرت أوراق خضراء، بعد أيام.وسقى البذرة .مازن بنبتته الصغيرة",
  "translationEn": "Mazen planted a seed in a pot. He put the pot near the window and watered the seed. After a few days, green leaves appeared. Mazen was happy with his little plant.",
  "page": 6
 },
 {
  "id": "beginner-story-03",
  "level": "beginner",
  "type": "story",
  "number": 3,
  "titleAr": "الكتاب المفقود",
  "sourceArabic": "نظرت في الحقيبة وعلى.بحثت ريم عن كتابها . رفعت الوسادة فوجدته تحتها. فلم تجده،المكتب .ضحكت وبدأت تقرأ",
  "translationEn": "Reem looked for her book. She checked her bag and desk but did not find it. She lifted the pillow and found it underneath. She laughed and began to read.",
  "page": 6
 },
 {
  "id": "beginner-story-04",
  "level": "beginner",
  "type": "story",
  "number": 4,
  "titleAr": "هدية ألمي",
  "sourceArabic": "أحبك: كتب تحتها.رسم عمر وردة حمراء على ورقة ابتسمت األم. أعطاها ألمه عندما عادت.يا أمي .وعلقت الرسم على الحائط",
  "translationEn": "Omar drew a red flower on a sheet of paper. Under it, he wrote, “I love you, Mom.” He gave it to her when she returned. She smiled and hung it on the wall.",
  "page": 6
 },
 {
  "id": "beginner-story-05",
  "level": "beginner",
  "type": "story",
  "number": 5,
  "titleAr": "السباق",
  "sourceArabic": "كان أخوه أسرع.ركض سامي مع أخيه في الحديقة أحسنت! ثم: صافحه سامي وقال.منه وفاز بالسباق .استراحا تحت شجرة",
  "translationEn": "Sami raced his brother in the park. His brother was faster and won the race. Sami shook his hand and said, “Well done!” Then they rested under a tree.",
  "page": 6
 },
 {
  "id": "beginner-story-06",
  "level": "beginner",
  "type": "story",
  "number": 6,
  "titleAr": "المظلة",
  "sourceArabic": "ففتحت، بدأ المطر.خرجت هناء إلى المدرسة مشتا مًعا تحت. رأت صديقتها بال مظلة.مظلتها .المظلة حتى وصلتا إلى المدرسة",
  "translationEn": "Hanaa left for school. It started to rain, so she opened her umbrella. She saw her friend without an umbrella. They walked together under it until they reached school.",
  "page": 7
 },
 {
  "id": "beginner-story-07",
  "level": "beginner",
  "type": "story",
  "number": 7,
  "titleAr": "الكعكة",
  "sourceArabic": "ساعدته ابنته في وضع.صنع األب كعكة صغيرة أكل. جلست األسرة حول الطاولة.الفاكهة عليها .الجميع الكعكة وشكروا األب وابنته",
  "translationEn": "The father made a small cake. His daughter helped him put fruit on it. The family sat around the table. Everyone ate the cake and thanked the father and his daughter.",
  "page": 7
 },
 {
  "id": "beginner-story-08",
  "level": "beginner",
  "type": "story",
  "number": 8,
  "titleAr": "الدراجة",
  "sourceArabic": "ساعده أبوه في.حاول عادل ركوب دراجته الجديدة ركب، بعد أسبوع. تدرب عادل كل يوم.البداية .الدراجة وحده وشعر بالسعادة",
  "translationEn": "Adel tried to ride his new bicycle. His father helped him at first. Adel practiced every day. After a week, he rode it on his own and felt happy.",
  "page": 7
 },
 {
  "id": "beginner-story-09",
  "level": "beginner",
  "type": "story",
  "number": 9,
  "titleAr": "الرسمة",
  "sourceArabic": "، لم تجد اللون األخضر.رسمت لينا بيًتا وشجرة أكملت لينا. أعطتها أختها القلم.فطلبته من أختها .الرسم وكتبت اسمها عليه",
  "translationEn": "Lina drew a house and a tree. She could not find the green pencil, so she asked her sister for it. Her sister gave it to her. Lina finished the picture and wrote her name on it.",
  "page": 7
 },
 {
  "id": "beginner-story-10",
  "level": "beginner",
  "type": "story",
  "number": 10,
  "titleAr": "صندوق األلعاب",
  "sourceArabic": "أحضر صندوًقا ووضع.كانت ألعاب فهد على األرض أصبحت. وضع الكرة على الرف.السيارات فيه . ووجد فهد مكاًنا للقراءة،الغرفة مرتبة",
  "translationEn": "Fahad’s toys were on the floor. He brought a box and put the toy cars in it. He put the ball on the shelf. The room became tidy, and Fahad found a place to read.",
  "page": 7
 },
 {
  "id": "beginner-riddle-01",
  "level": "beginner",
  "type": "riddle",
  "number": 1,
  "titleAr": "أوراق كثيرة",
  "sourceArabic": "تقرأ كلماتي. لكنني لست شجرة،لي أوراق كثيرة تجدني في المكتبة أو في حقيبة.وتنظر إلى صوري ما أنا؟.الطالب",
  "translationEn": "I have many pages, but I am not a tree. You read my words and look at my pictures. You find me in the library or a student’s bag. What am I?",
  "page": 8,
  "riddleAnswerAr": "الكتاب"
 },
 {
  "id": "beginner-riddle-02",
  "level": "beginner",
  "type": "riddle",
  "number": 2,
  "titleAr": "على الحائط",
  "sourceArabic": ". أنظر إليك من الحائط. لكنني ال ألسع،لي عقربان ما أنا؟.تعرف الوقت عندما تنظر إلي",
  "translationEn": "I have two hands, but I cannot hold anything. I look at you from the wall. You know the time when you look at me. What am I?",
  "page": 8,
  "riddleAnswerAr": "الساعة ذات العقارب"
 },
 {
  "id": "beginner-riddle-03",
  "level": "beginner",
  "type": "riddle",
  "number": 3,
  "titleAr": "في حقيبتك",
  "sourceArabic": "تمسكني بيدك.أعيش في حقيبتك أو على مكتبك ما أنا؟. لي حبر أزرق أحياًنا.وتكتب بي اسمك",
  "translationEn": "I live in your bag or on your desk. You hold me in your hand and write your name with me. Sometimes I have blue ink. What am I?",
  "page": 8,
  "riddleAnswerAr": "القلم"
 },
 {
  "id": "beginner-riddle-04",
  "level": "beginner",
  "type": "riddle",
  "number": 4,
  "titleAr": "وقت المطر",
  "sourceArabic": "تحملني.تفتحني فوق رأسك عندما ينزل المطر . تغلقني بعد المطر. وأساعدك على البقاء جاًفا،بيدك ما أنا؟",
  "translationEn": "You open me above your head when it rains. You carry me in your hand, and I help you stay dry. You close me after the rain. What am I?",
  "page": 8,
  "riddleAnswerAr": "المظلة"
 },
 {
  "id": "beginner-riddle-05",
  "level": "beginner",
  "type": "riddle",
  "number": 5,
  "titleAr": "صديق القدم",
  "sourceArabic": "أمشي معك إلى.تلبسني في قدمك قبل الخروج ما. تخلعني عندما تعود إلى البيت.المدرسة والحديقة أنا؟",
  "translationEn": "You put me on your foot before going out. I go with you to school and the park. You take me off when you return home. What am I?",
  "page": 8,
  "riddleAnswerAr": "الحذاء"
 },
 {
  "id": "beginner-riddle-06",
  "level": "beginner",
  "type": "riddle",
  "number": 6,
  "titleAr": "بارد ولذيذ",
  "sourceArabic": "إذا تركتني في. تأكلني بالملعقة أحياًنا.أنا حلو وبارد ما أنا؟. أذوب بسرعة،الشمس",
  "translationEn": "I am sweet and cold. Sometimes you eat me with a spoon. If you leave me in the sun, I melt quickly. What am I?",
  "page": 9,
  "riddleAnswerAr": "المثلجات أو الآيس كريم"
 },
 {
  "id": "beginner-riddle-07",
  "level": "beginner",
  "type": "riddle",
  "number": 7,
  "titleAr": "أحمل أغراضك",
  "sourceArabic": "تحملني على ظهرك.تضع في داخلي كتبك ودفاترك ما أنا؟. لي جيوب وحزامان.إلى المدرسة",
  "translationEn": "You put your books and notebooks inside me. You carry me on your back to school. I have pockets and two straps. What am I?",
  "page": 9,
  "riddleAnswerAr": "الحقيبة المدرسية"
 },
 {
  "id": "beginner-riddle-08",
  "level": "beginner",
  "type": "riddle",
  "number": 8,
  "titleAr": "أمام المرآة",
  "sourceArabic": "تمسكني بيدك وترتب. لكنني ال آكل،لي أسنان كثيرة ما أنا؟.بي شعرك أمام المرآة",
  "translationEn": "I have many teeth, but I do not eat. You hold me in your hand and use me to tidy your hair in front of the mirror. What am I?",
  "page": 9,
  "riddleAnswerAr": "المشط"
 },
 {
  "id": "beginner-riddle-09",
  "level": "beginner",
  "type": "riddle",
  "number": 9,
  "titleAr": "في السماء",
  "sourceArabic": "ال. أعطي األرض نوًر ا ودفًئا.أظهر في السماء نهاًر ا ما أنا؟. فنوري قوي،تنظر إلي مباشرة",
  "translationEn": "I appear in the sky during the day. I give Earth light and warmth. Do not look directly at me because my light is strong. What am I?",
  "page": 9,
  "riddleAnswerAr": "الشمس"
 },
 {
  "id": "beginner-riddle-10",
  "level": "beginner",
  "type": "riddle",
  "number": 10,
  "titleAr": "أفتح الباب",
  "sourceArabic": "تضعني في القفل.أنا صغير ومصنوع من المعدن ما أنا؟. تحملني في جيبك أحياًنا.وتديرني لفتح الباب",
  "translationEn": "I am small and made of metal. You put me in the lock and turn me to open the door. Sometimes you carry me in your pocket. What am I?",
  "page": 9,
  "riddleAnswerAr": "المفتاح"
 },
 {
  "id": "beginner-news-01",
  "level": "beginner",
  "type": "news",
  "number": 1,
  "titleAr": "مكتبة الصف",
  "sourceArabic": "وضعوا.افتتح طالب الصف مكتبة صغيرة صباح اليوم يستطيع كل طالب.عشرين كتاًبا على رف جديد .قراءة كتاب في وقت االستراحة",
  "translationEn": "The class opened a small library this morning. The students put twenty books on a new shelf. Each student can read a book during break time.",
  "page": 10
 },
 {
  "id": "beginner-news-02",
  "level": "beginner",
  "type": "news",
  "number": 2,
  "titleAr": "مباراة ودية",
  "sourceArabic": ".لعب فريقان من المدرسة مباراة كرة قدم أمس صافح الالعبون.انتهت المباراة بهدف لكل فريق .بعضهم بعد المباراة",
  "translationEn": "Two school teams played a friendly football match yesterday. The game ended with one goal for each team. The players shook hands afterward.",
  "page": 10
 },
 {
  "id": "beginner-news-03",
  "level": "beginner",
  "type": "news",
  "number": 3,
  "titleAr": "زيارة الحديقة",
  "sourceArabic": "شاهدوا.زار طالب الصف حديقة قريبة صباح أمس عاد الطالب إلى المدرسة ورسموا.األشجار والزهور .ما رأوه",
  "translationEn": "The class visited a nearby park yesterday morning. The students saw trees and flowers. They returned to school and drew what they had seen.",
  "page": 10
 },
 {
  "id": "beginner-news-04",
  "level": "beginner",
  "type": "news",
  "number": 4,
  "titleAr": "يوم الفاكهة",
  "sourceArabic": "أحضر الطالب.نظمت المدرسة يوًم ا للفاكهة اليوم تحدث المعلم عن أسماء. تفاًح ا وموًز ا وبرتقااًل .الفواكه وألوانها",
  "translationEn": "The school held a fruit day today. Students brought apples, bananas, and oranges. The teacher talked about the names and colors of the fruit.",
  "page": 10
 },
 {
  "id": "beginner-news-05",
  "level": "beginner",
  "type": "news",
  "number": 5,
  "titleAr": "معرض الرسم",
  "sourceArabic": "عرض.أقام الصف معرًضا صغيًر ا للرسم أمس زار المعرض عدد.الطالب صوًر ا للبيوت والحيوانات .من المعلمين",
  "translationEn": "The class held a small art exhibition yesterday. Students displayed pictures of houses and animals. Several teachers visited the exhibition.",
  "page": 10
 },
 {
  "id": "beginner-news-06",
  "level": "beginner",
  "type": "news",
  "number": 6,
  "titleAr": "تنظيف الساحة",
  "sourceArabic": "شارك عشرة طالب في تنظيف ساحة المدرسة شكر. جمعوا األوراق ووضعوها في السلة.اليوم .المدير الطالب على مساعدتهم",
  "translationEn": "Ten students helped clean the school playground today. They collected paper and put it in the bin. The principal thanked them for their help.",
  "page": 11
 },
 {
  "id": "beginner-news-07",
  "level": "beginner",
  "type": "news",
  "number": 7,
  "titleAr": "مسابقة قراءة",
  "sourceArabic": "قرأت.فازت مريم بمسابقة القراءة في الصف أمس . أعطاها المعلم كتاًبا هدية.قصة قصيرة بصوت واضح",
  "translationEn": "Mariam won the class reading competition yesterday. She read a short story in a clear voice. The teacher gave her a book as a prize.",
  "page": 11
 },
 {
  "id": "beginner-news-08",
  "level": "beginner",
  "type": "news",
  "number": 8,
  "titleAr": "أشجار جديدة",
  "sourceArabic": ".زرع طالب المدرسة ثالث أشجار في الحديقة اليوم سيعتني الطالب.ساعدهم المعلم في سقيها .باألشجار كل أسبوع",
  "translationEn": "The school’s students planted three trees in the garden today. The teacher helped them water the trees. The students will care for them every week.",
  "page": 11
 },
 {
  "id": "beginner-news-09",
  "level": "beginner",
  "type": "news",
  "number": 9,
  "titleAr": "حصة موسيقى",
  "sourceArabic": "تعلم الطالب أغنية عربية جديدة في حصة كانت. غنوا مع المعلم وصفقوا بأيديهم.الموسيقى .األغنية عن األسرة",
  "translationEn": "Students learned a new Arabic song in music class. They sang with the teacher and clapped their hands. The song was about the family.",
  "page": 11
 },
 {
  "id": "beginner-news-10",
  "level": "beginner",
  "type": "news",
  "number": 10,
  "titleAr": "لوحة جديدة",
  "sourceArabic": ".وضعت المدرسة لوحة جديدة قرب الباب اليوم تساعد.تعرض اللوحة أسماء الصفوف وأماكنها .اللوحة الطالب الجدد على الوصول إلى صفوفهم",
  "translationEn": "The school put up a new sign near the entrance today. It shows the names and locations of the classrooms. The sign helps new students find their classrooms.",
  "page": 11
 },
 {
  "id": "intermediate-scenario-01",
  "level": "intermediate",
  "type": "scenario",
  "number": 1,
  "titleAr": "موعد متأخر",
  "sourceArabic": "وصلت إلى المدرسة متأخًر ا ألن الحافلة تعطلت في . طرقت باب الصف واعتذرت للمعلم.الطريق ثم سألت زميلي عن النشاط،شرحت السبب بهدوء . أكملت العمل في وقت االستراحة.الذي فاتني",
  "translationEn": "I arrived at school late because the bus broke down on the way. I knocked on the classroom door and apologized to the teacher. I calmly explained the reason, then asked my classmate about the activity I had missed. I finished the work during break time.",
  "page": 12
 },
 {
  "id": "intermediate-scenario-02",
  "level": "intermediate",
  "type": "scenario",
  "number": 2,
  "titleAr": "طلب غير صحيح",
  "sourceArabic": "لكن العامل أحضر،طلبت عصير برتقال في المقهى راجع. أخبرته بلطف أن طلبي مختلف.عصير تفاح شكرته. ثم أحضر العصير الصحيح،الطلب واعتذر .ألن الخطأ عولج بسرعة ومن دون خالف",
  "translationEn": "I ordered orange juice at the café, but the server brought apple juice. I politely told him that I had ordered something different. He checked the order, apologized, and brought the correct juice. I thanked him because the mistake was resolved quickly without an argument.",
  "page": 12
 },
 {
  "id": "intermediate-scenario-03",
  "level": "intermediate",
  "type": "scenario",
  "number": 3,
  "titleAr": "زميل يحتاج إلى مساعدة",
  "sourceArabic": "الحظت أن زميلي ال يشارك في القراءة ألنه يخاف جلست معه بعد الحصة وقرأنا فقرة.من الخطأ ثم قرأ الفقرة، تدربنا على الكلمات الصعبة.قصيرة .أمام مجموعتنا وشعر بثقة أكبر",
  "translationEn": "I noticed that my classmate did not join in reading because he was afraid of making mistakes. I sat with him after class, and we read a short paragraph. We practiced the difficult words. He then read it to our group and felt more confident.",
  "page": 12
 },
 {
  "id": "intermediate-scenario-04",
  "level": "intermediate",
  "type": "scenario",
  "number": 4,
  "titleAr": "محفظة على المقعد",
  "sourceArabic": "لم آخذ شيًئا.وجدت محفظة على مقعد في الحديقة وصفت له المكان. وسلمتها إلى موظف األمن،منها ، جاء صاحبها وسأل عنها، بعد قليل.الذي وجدتها فيه .فاستعادها بعد التحقق من ملكيتها",
  "translationEn": "I found a wallet on a bench in the park. I did not take anything from it and handed it to a security officer. I described where I had found it. Soon afterward, its owner came to ask about it and received it after ownership was checked.",
  "page": 12
 },
 {
  "id": "intermediate-scenario-05",
  "level": "intermediate",
  "type": "scenario",
  "number": 5,
  "titleAr": "خالف على الدور",
  "sourceArabic": "كنت أنتظر دوري في المقصف عندما وقف طالب لم. أخبرته أن هناك طابوًر ا يبدأ قرب الباب.أمامي واصلنا. فاعتذر ووقف في آخره،يكن قد الحظه .االنتظار بهدوء من دون أن نرفع أصواتنا",
  "translationEn": "I was waiting for my turn at the canteen when a student stepped in front of me. I told him that the queue started near the door. He had not noticed it, so he apologized and joined the end. We continued waiting calmly without raising our voices.",
  "page": 12
 },
 {
  "id": "intermediate-scenario-06",
  "level": "intermediate",
  "type": "scenario",
  "number": 6,
  "titleAr": "مساعدة زائر",
  "sourceArabic": "شرحت له.سألني زائر عن مكان المكتبة العامة رسمت له. لكنه لم يفهم اسم الشارع،الطريق شكرني.خريطة بسيطة وحددت المبنى القريب منها .وقال إن الرسم جعل االتجاهات أوضح",
  "translationEn": "A visitor asked me where the public library was. I explained the route, but he did not understand the street name. I drew a simple map and marked a nearby building. He thanked me and said that the drawing made the directions clearer.",
  "page": 13
 },
 {
  "id": "intermediate-scenario-07",
  "level": "intermediate",
  "type": "scenario",
  "number": 7,
  "titleAr": "االستعداد للرحلة",
  "sourceArabic": "راجعت قائمة األشياء،قبل الرحلة المدرسية ، جهزت الماء والقبعة ودفتر المالحظات.المطلوبة طلبت من أبي.لكنني لم أجد موافقة ولي األمر . ثم وضعتها في الحقيبة حتى ال أنساها صباًح ا،توقيعها",
  "translationEn": "Before the school trip, I checked the list of required items. I packed water, a hat, and a notebook, but I could not find the parent consent form. I asked my father to sign it and put it in my bag so I would not forget it in the morning.",
  "page": 13
 },
 {
  "id": "intermediate-scenario-08",
  "level": "intermediate",
  "type": "scenario",
  "number": 8,
  "titleAr": "جهاز ال يعمل",
  "sourceArabic": "طلبنا. لكن الحاسوب لم يعمل،أردنا عرض مشروعنا واستخدمنا الصور المطبوعة أثناء،مساعدة المعلم . شرح كل طالب جزًءا من المشروع.االنتظار .استطعنا تقديم أفكارنا رغم المشكلة التقنية",
  "translationEn": "We wanted to present our project, but the computer would not work. We asked the teacher for help and used printed pictures while waiting. Each student explained part of the project. We managed to present our ideas despite the technical problem.",
  "page": 13
 },
 {
  "id": "intermediate-scenario-09",
  "level": "intermediate",
  "type": "scenario",
  "number": 9,
  "titleAr": "اعتذار لصديق",
  "sourceArabic": "ثم سقط عليه قليل من،استعرت كتاًبا من صديقي اعتذرت. أخبرته بما حدث بداًل من إخفاء األمر.الماء اتفقنا على تعويض.وعرضت شراء نسخة جديدة .الكتاب في نهاية األسبوع",
  "translationEn": "I borrowed a book from my friend, and then a little water spilled on it. I told him what had happened instead of hiding it. I apologized and offered to buy a new copy. We agreed that I would replace the book at the weekend.",
  "page": 13
 },
 {
  "id": "intermediate-scenario-10",
  "level": "intermediate",
  "type": "scenario",
  "number": 10,
  "titleAr": "تنظيم الوقت",
  "sourceArabic": "كان علّي إنهاء واجب ومراجعة درس قبل زيارة . كتبت المهمتين وحددت وقًتا لكل واحدة.أقاربي ، أنهيت عملي مبكًر ا.أغلقت التلفاز وبدأت باألصعب .فذهبت إلى الزيارة وأنا مرتاح",
  "translationEn": "I had to finish some homework and review a lesson before visiting my relatives. I wrote down both tasks and set a time for each. I turned off the television and started with the harder task. I finished early and went to the visit feeling relaxed.",
  "page": 13
 },
 {
  "id": "intermediate-dialogue-01",
  "level": "intermediate",
  "type": "dialogue",
  "number": 1,
  "titleAr": "اختيار كتاب",
  "sourceArabic": ". أبحث عن كتاب يناسب مستواي في العربية:سارة هل تفضلين القصص أم الكتب:أمينة المكتبة العلمية؟ لكن الكلمات الطويلة تصعب، أحب القصص:سارة .علي جربي هذا الكتاب؛ فصوله قصيرة وفيه:أمينة المكتبة .صور تساعدك على الفهم",
  "translationEn": "Sara: I’m looking for a book that suits my Arabic level. Librarian: Do you prefer stories or science books? Sara: I like stories, but long words are difficult for me. Librarian: Try this book. Its chapters are short, and the pictures help you understand.",
  "page": 14
 },
 {
  "id": "intermediate-dialogue-02",
  "level": "intermediate",
  "type": "dialogue",
  "number": 2,
  "titleAr": "مشروع جماعي",
  "sourceArabic": "كيف. علينا تسليم المشروع يوم الخميس:عمر نقسم العمل؟ . وأنت تختار الصور، أجمع المعلومات:سالم ومن يكتب المقدمة؟:عمر . نكتبها مًعا بعد أن ننتهي:سالم . ولنراجع المعلومات قبل الطباعة، جيد:عمر تغيير موعد03",
  "translationEn": "Omar: We must submit the project on Thursday. How shall we divide the work? Salem: I’ll collect the information, and you choose the pictures. Omar: Who will write the introduction? Salem: We’ll write it together when we finish. Omar: Good. Let’s check the information before printing.",
  "page": 14
 },
 {
  "id": "intermediate-dialogue-03",
  "level": "intermediate",
  "type": "dialogue",
  "number": 3,
  "titleAr": "تغيير موعد",
  "sourceArabic": "هل يمكن أن نؤجل لقاءنا إلى الخامسة؟ لدي:ليلى .تدريب بعد المدرسة لكن المكتبة تغلق في، الخامسة مناسبة:هند .السادسة إذن نحضر األسئلة مسبًقا حتى نستفيد من:ليلى .الوقت . سأحضر دفتري أيًضا، اتفقنا:هند شراء قميص04",
  "translationEn": "Layla: Can we move our meeting to five? I have practice after school. Hind: Five works, but the library closes at six. Layla: Then let’s prepare our questions in advance to use the time well. Hind: Agreed. I’ll bring my notebook too.",
  "page": 14
 },
 {
  "id": "intermediate-dialogue-04",
  "level": "intermediate",
  "type": "dialogue",
  "number": 4,
  "titleAr": "شراء قميص",
  "sourceArabic": ". لكن مقاسه صغير، أعجبني هذا القميص:الزبون هل تريد. لدينا مقاس أكبر باللون نفسه:البائع تجربته؟ وهل يمكن استبداله إذا لم يناسبني؟، نعم:الزبون يمكنك مراجعة شروط االستبدال المكتوبة:البائع .على الفاتورة قبل الشراء",
  "translationEn": "Customer: I like this shirt, but it’s too small. Salesperson: We have a larger size in the same color. Would you like to try it on? Customer: Yes. Can I exchange it if it doesn’t fit? Salesperson: You can check the exchange terms printed on the receipt before buying.",
  "page": 14
 },
 {
  "id": "intermediate-dialogue-05",
  "level": "intermediate",
  "type": "dialogue",
  "number": 5,
  "titleAr": "ترشيد الماء",
  "sourceArabic": "لماذا وضعت دلًوا تحت الصنبور؟:األخ وقد أخبرت أبي ليطلب، ألنه يسرب الماء:األخت .إصالحه وماذا سنفعل بالماء الذي نجمعه؟:األخ سنستخدمه لسقي النباتات بداًل من إضاعته:األخت .حتى ُيصلح الصنبور",
  "translationEn": "Brother: Why did you put a bucket under the tap? Sister: It’s leaking. I told Dad so he can arrange a repair. Brother: What will we do with the water we collect? Sister: We’ll use it to water the plants instead of wasting it until the tap is fixed.",
  "page": 15
 },
 {
  "id": "intermediate-dialogue-06",
  "level": "intermediate",
  "type": "dialogue",
  "number": 6,
  "titleAr": "اختيار نشاط",
  "sourceArabic": "أي نشاط تقترحون ليوم اللغة العربية؟:المعلم أقترح مسرحية قصيرة ألن الجميع يستطيع:نور .المشاركة . أفضل مسابقة كلمات:أحمد هل يمكن الجمع بين الفكرتين؟:المعلم ثم نسأل الجمهور عن، نقدم المسرحية أواًل، نعم:نور .كلمات وردت فيها التطوع07",
  "translationEn": "Teacher: What activity do you suggest for Arabic Language Day? Noor: I suggest a short play because everyone can take part. Ahmed: I prefer a word competition. Teacher: Can we combine both ideas? Noor: Yes. We can perform the play first, then ask the audience about words used in it.",
  "page": 15
 },
 {
  "id": "intermediate-dialogue-07",
  "level": "intermediate",
  "type": "dialogue",
  "number": 7,
  "titleAr": "التطوع",
  "sourceArabic": "لكنني ال، أريد المشاركة في النشاط التطوعي:مازن .أعرف مهمتي نحتاج إلى من يرتب الكتب حسب:المشرف .الموضوع هل أعمل وحدي؟:مازن وسأشرح لكم طريقة، ستعمل مع طالبين:المشرف .التصنيف قبل أن تبدؤوا",
  "translationEn": "Mazen: I want to join the volunteer activity, but I don’t know my task. Supervisor: We need people to arrange books by subject. Mazen: Will I work alone? Supervisor: You’ll work with two students. I’ll explain how to sort the books before you start.",
  "page": 15
 },
 {
  "id": "intermediate-dialogue-08",
  "level": "intermediate",
  "type": "dialogue",
  "number": 8,
  "titleAr": "طريق المدرسة",
  "sourceArabic": "لماذا تفضل المشي إلى المدرسة اليوم؟:األم . وأريد أن أمشي مع صديقي، الجو لطيف:االبن . اختارا الطريق الذي فيه ممر مشاة:األم وسنخرج مبكًر ا حتى ال نضطر إلى، بالتأكيد:االبن .اإلسراع مراجعة عرض09",
  "translationEn": "today? Son: The weather is nice, and I want to walk with my friend. Mother: Choose the route with a pedestrian crossing. Son: Of course. We’ll leave early so we won’t have to rush.",
  "page": 16
 },
 {
  "id": "intermediate-dialogue-09",
  "level": "intermediate",
  "type": "dialogue",
  "number": 9,
  "titleAr": "مراجعة عرض",
  "sourceArabic": ". لكنني أنسى بعض الجمل، تدربت على العرض:ريم اكتبي الكلمات األساسية على بطاقات:المعلمة .صغيرة هل أقرأ النص كاماًل من الورقة؟:ريم واستخدمي، حاولي شرح الفكرة بطريقتك:المعلمة .البطاقات للتذكير فقط صورة جماعية10",
  "translationEn": "Reem: I practiced my presentation, but I forget some sentences. Teacher: Write the key words on small cards. Reem: Should I read the whole text from the paper? Teacher: Try explaining the idea in your own words and use the cards only as reminders.",
  "page": 16
 },
 {
  "id": "intermediate-dialogue-10",
  "level": "intermediate",
  "type": "dialogue",
  "number": 10,
  "titleAr": "صورة جماعية",
  "sourceArabic": "هل أنشرها في. التقطت صورة لنا في الرحلة:خالد مجموعة الصف؟ اسأل بقية الطالب أواًل ؛ ربما ال يريد بعضهم:علي .نشر صورته . سأطلب موافقتهم، معك حق:خالد ويمكنك مشاركة صورة المكان إذا لم يوافق:علي .الجميع",
  "translationEn": "Khaled: I took a photo of us on the trip. Shall I share it in the class group? Ali: Ask the other students first. Some may not want their photo shared. Khaled: You’re right. I’ll ask for their permission. Ali: You can share a photo of the place if not everyone agrees.",
  "page": 16
 },
 {
  "id": "intermediate-story-01",
  "level": "intermediate",
  "type": "story",
  "number": 1,
  "titleAr": "رسالة في كتاب",
  "sourceArabic": "وجدت داخله.استعارت هبة كتاًبا قديًم ا من المكتبة ال تتوقف عن:بطاقة كتب عليها طالب سابق ، كانت هبة تفكر في ترك مسابقة القراءة.المحاولة وعندما أعادت.لكنها قررت التدرب أسبوًعا آخر . شكرت أمينة المكتبة على تشجيعها،الكتاب",
  "translationEn": "Heba borrowed an old book from the library. Inside, she found a card on which a former student had written, “Keep trying.” Heba had been thinking about leaving the reading competition, but she decided to practice for another week. When she returned the book, she thanked the librarian for her encouragement.",
  "page": 17
 },
 {
  "id": "intermediate-story-02",
  "level": "intermediate",
  "type": "story",
  "number": 2,
  "titleAr": "الحديقة المهملة",
  "sourceArabic": ".كان ركن من حديقة المدرسة مليًئا باألوراق الجافة جمع.اقترح راشد تنظيفه وزراعة أزهار فيه عندما. وتقاسموا العمل خالل أسبوع،أصدقاءه وضعوا لوحة صغيرة تطلب من،ظهرت أول زهرة .الجميع المحافظة على المكان",
  "translationEn": "One corner of the school garden was full of dry leaves. Rashid suggested cleaning it and planting flowers. He gathered his friends, and they shared the work over a week. When the first flower appeared, they put up a small sign asking everyone to look after the area.",
  "page": 17
 },
 {
  "id": "intermediate-story-03",
  "level": "intermediate",
  "type": "story",
  "number": 3,
  "titleAr": "حقيبتان متشابهتان",
  "sourceArabic": "في.أخذ يوسف حقيبة تشبه حقيبته بعد التدريب اتصل بالمدرب. اكتشف أن الكتب ليست له،البيت أعاد الحقيبة، في اليوم التالي.وأخبره بما حدث ثم وضع بطاقة باسمه عليها.لصاحبها واستعاد حقيبته .حتى ال يتكرر الخطأ",
  "translationEn": "Yousef took a bag that looked like his after practice. At home, he discovered that the books were not his. He called the coach and explained what had happened. The next day, he returned the bag and got his own back. He then attached a name tag to prevent the mistake happening again.",
  "page": 17
 },
 {
  "id": "intermediate-story-04",
  "level": "intermediate",
  "type": "story",
  "number": 4,
  "titleAr": "طبق مختلف",
  "sourceArabic": "تردد.أحضرت مينا طعاًم ا من بلدها إلى اليوم الثقافي شرحت.زمالؤها في تجربته ألن شكله جديد عليهم جرب بعضهم قطعة.لهم مكوناته وطريقة إعداده ثم سألوها عن أطعمة أخرى،صغيرة وأعجبهم الطعم .في بلدها",
  "translationEn": "Mina brought food from her country to cultural day. Her classmates hesitated to try it because it looked unfamiliar. She explained its ingredients and how it was made. Some tried a small piece and liked it, then asked her about other foods from her country.",
  "page": 17
 },
 {
  "id": "intermediate-story-05",
  "level": "intermediate",
  "type": "story",
  "number": 5,
  "titleAr": "الفريق الهادئ",
  "sourceArabic": ".كان فريق ناصر يتحدث كثيًر ا وال ينهي المشروع وافق.اقترح أن يكتب كل عضو مهمته وموعد إنجازها انتهى. وأصبح كل طالب يعرف ما عليه فعله،الجميع وتعلم الفريق أن تنظيم العمل،المشروع في موعده .أهم من كثرة الكالم",
  "translationEn": "Nasser’s team talked a lot but made little progress on the project. He suggested that each member write down their task and deadline. Everyone agreed, and each student knew what to do. The project was finished on time, and the team learned that organizing work matters more than talking about it.",
  "page": 17
 },
 {
  "id": "intermediate-story-06",
  "level": "intermediate",
  "type": "story",
  "number": 6,
  "titleAr": "صوت على المسرح",
  "sourceArabic": "كانت سلمى تتكلم بصوت منخفض أثناء التدريب على طلبت منها المعلمة أن تتخيل أنها تخاطب.المسرحية تدربت سلمى عدة مرات مع.شخًص ا في آخر القاعة ، سمعها الجمهور بوضوح، في يوم العرض.صديقتها .وصفق لها زمالؤها",
  "translationEn": "Salma spoke quietly during play rehearsals. The teacher asked her to imagine speaking to someone at the back of the hall. Salma practiced several times with her friend. On performance day, the audience heard her clearly, and her classmates applauded her.",
  "page": 18
 },
 {
  "id": "intermediate-story-07",
  "level": "intermediate",
  "type": "story",
  "number": 7,
  "titleAr": "حصالة الدراجة",
  "sourceArabic": ". فبدأ يدخر جزًءا من مصروفه،أراد كريم شراء دراجة ، بداًل من االستسالم. وجد أن المال ال يكفي،بعد شهر واصل االدخار.راجع األسعار واختار دراجة أبسط . وشعر بقيمة كل مبلغ جمعه،حتى استطاع شراءها",
  "translationEn": "Kareem wanted to buy a bicycle, so he started saving part of his allowance. After a month, he found that he did not have enough. Instead of giving up, he compared prices and chose a simpler bicycle. He kept saving until he could buy it and appreciated every amount he had saved.",
  "page": 18
 },
 {
  "id": "intermediate-story-08",
  "level": "intermediate",
  "type": "story",
  "number": 8,
  "titleAr": "زيارة الجد",
  "sourceArabic": "ظل ينظر إلى.زار طارق جده وهو يحمل هاتفه وضع طارق.الشاشة حتى سأله الجد عن يومه مر.الهاتف جانًبا واستمع إلى قصة من طفولة جده وطلب من جده قصة أخرى قبل أن،الوقت سريًعا .يغادر",
  "translationEn": "Tareq visited his grandfather while carrying his phone. He kept looking at the screen until his grandfather asked about his day. Tareq put the phone aside and listened to a story from his grandfather’s childhood. Time passed quickly, and he asked for another story before leaving.",
  "page": 18
 },
 {
  "id": "intermediate-story-09",
  "level": "intermediate",
  "type": "story",
  "number": 9,
  "titleAr": "خطأ في النتيجة",
  "sourceArabic": ".أعلنت المعلمة فوز دانا في مسابقة الحساب الحظت دانا أن إحدى إجاباتها الخاطئة ُح سبت لم تفز. فتغير ترتيب النتائج، أخبرت المعلمة.صحيحة لكنها حصلت على تقدير زمالئها ألنها،دانا بالجائزة .اختارت الصدق",
  "translationEn": "The teacher announced that Dana had won the mathematics competition. Dana noticed that one wrong answer had been marked correct. She told the teacher, and the results changed. Dana did not win the prize, but she earned her classmates’ respect for choosing honesty.",
  "page": 18
 },
 {
  "id": "intermediate-story-10",
  "level": "intermediate",
  "type": "story",
  "number": 10,
  "titleAr": "مقعد للصداقة",
  "sourceArabic": ".جلس طالب جديد وحده في االستراحة عدة أيام الحظت مجموعة من الطالب ذلك ودعته إلى . اكتشفوا أنه يحب الشطرنج مثلهم.الجلوس معها وأصبح المقعد مكاًنا،أحضروا لوحة في اليوم التالي .يجمعهم للعب والحديث",
  "translationEn": "A new student sat alone during break for several days. A group noticed and invited him to sit with them. They discovered that he liked chess, just as they did. They brought a board the next day, and the bench became a place to play and talk together.",
  "page": 18
 },
 {
  "id": "intermediate-riddle-01",
  "level": "intermediate",
  "type": "riddle",
  "number": 1,
  "titleAr": "مدن بال سكان",
  "sourceArabic": "لكنك ال تسمع في،أعرض لك مدًنا وطرًقا وأنهاًر ا يستخدمني.داخلي صوت سيارة وال ترى ماًء حقيقًيا قد أكون ورقة أو صورة.المسافر ليعرف االتجاهات ما أنا؟.على شاشة",
  "translationEn": "I show cities, roads, and rivers, but you cannot hear a car or see real water inside me. Travelers use me to find directions. I may be on paper or a screen. What am I?",
  "page": 19,
  "riddleAnswerAr": "الخريطة"
 },
 {
  "id": "intermediate-riddle-02",
  "level": "intermediate",
  "type": "riddle",
  "number": 2,
  "titleAr": "ضيف من الضوء",
  "sourceArabic": "وقد أطول أو،أرافقك عندما تقف في ضوء الشمس وقد، ال تستطيع اإلمساك بي.أقصر مع تغير مكانها ما أنا؟. أتحرك حين تتحرك.أختفي في الظالم التام",
  "translationEn": "I accompany you when you stand in sunlight and may grow longer or shorter as the sun changes position. You cannot hold me, and I may disappear in complete darkness. I move when you move. What am I?",
  "page": 19,
  "riddleAnswerAr": "الظل"
 },
 {
  "id": "intermediate-riddle-03",
  "level": "intermediate",
  "type": "riddle",
  "number": 3,
  "titleAr": "صوت يعود",
  "sourceArabic": "فتسمع صوًتا،تنادي في مكان واسع تحيط به الجبال ال يوجد شخص.يشبه صوتك يكرر كلماتك بعد لحظة ما اسم هذه. بل يعود الصوت إليك،آخر يجيبك الظاهرة؟",
  "translationEn": "You call out in an open place surrounded by mountains and hear a sound like your own repeating your words a moment later. No other person is answering. The sound is coming back to you. What is this phenomenon called?",
  "page": 19,
  "riddleAnswerAr": "الصدى"
 },
 {
  "id": "intermediate-riddle-04",
  "level": "intermediate",
  "type": "riddle",
  "number": 4,
  "titleAr": "زائر ذو عنوان",
  "sourceArabic": "قد أسافر.أحمل كلمات كتبها شخص إلى شخص آخر وقد أصل عبر البريد،داخل ظرف عليه عنوان وطابع ما. تحمل كلماتي سؤااًل أو خبًر ا أو تحية.اإللكتروني أنا؟",
  "translationEn": "I carry words written by one person to another. I may travel in an envelope with an address and a stamp, or arrive by email. My words may contain a question, news, or a greeting. What am I?",
  "page": 19,
  "riddleAnswerAr": "الرسالة"
 },
 {
  "id": "intermediate-riddle-05",
  "level": "intermediate",
  "type": "riddle",
  "number": 5,
  "titleAr": "بيت الكلمات",
  "sourceArabic": "يمكنك أن تبحث عنها بين صفحاتي،إذا لم تفهم كلمة وقد أقدم، أشرح المعاني.أو في نسختي اإللكترونية ُترتب كلماتي غالًبا حسب.أمثلة على االستعمال ما أنا؟.الحروف",
  "translationEn": "If you do not understand a word, you can look for it in my pages or electronic version. I explain meanings and may give examples of usage. My words are often arranged alphabetically. What am I?",
  "page": 19,
  "riddleAnswerAr": "القاموس أو المعجم"
 },
 {
  "id": "intermediate-riddle-06",
  "level": "intermediate",
  "type": "riddle",
  "number": 6,
  "titleAr": "أيام مرتبة",
  "sourceArabic": "تنظر.أجمع الشهور واألسابيع واأليام في مكان واحد قد تعلقني.إلي لتعرف تاريخ الرحلة أو يوم االختبار . وتكتب على بعض مربعاتي مواعيدك،على الحائط ما أنا؟",
  "translationEn": "I bring months, weeks, and days together in one place. You look at me to check the date of a trip or an exam. You may hang me on the wall and write appointments in some of my boxes. What am I?",
  "page": 20,
  "riddleAnswerAr": "التقويم"
 },
 {
  "id": "intermediate-riddle-07",
  "level": "intermediate",
  "type": "riddle",
  "number": 7,
  "titleAr": "الفتة بألوان",
  "sourceArabic": "أقف قرب تقاطع الطريق وأستخدم ثالثة ألوان يجب أن تتوقف، عندما يظهر األحمر.لتنظيم المرور تتحرك إذا كان، وعندما يظهر األخضر.السيارات ما أنا؟.الطريق آمًنا",
  "translationEn": "I stand near a road junction and use three colors to control traffic. When red appears, cars must stop. When green appears, they move if the road is safe. What am I?",
  "page": 20,
  "riddleAnswerAr": "إشارة المرور"
 },
 {
  "id": "intermediate-riddle-08",
  "level": "intermediate",
  "type": "riddle",
  "number": 8,
  "titleAr": "الماء الجامد",
  "sourceArabic": "ثم ُوضعت في مكان شديد البرودة، كنت ماًء سائاًل يضعني الناس في المشروبات.فأصبحت صلًبا . وأعود سائاًل عندما ترتفع حرارتي بما يكفي،لتبريدها ما أنا؟",
  "translationEn": "I was liquid water, then I was placed somewhere very cold and became solid. People put me in drinks to cool them. I turn into liquid again when my temperature rises enough. What am I?",
  "page": 20,
  "riddleAnswerAr": "الثلج"
 },
 {
  "id": "intermediate-riddle-09",
  "level": "intermediate",
  "type": "riddle",
  "number": 9,
  "titleAr": "عين المسافر",
  "sourceArabic": ".أنظر من خاللي إلى شيء بعيد فيبدو أكبر وأقرب يحملني بعض الناس لمشاهدة الطيور من دون ما أنا؟. لي عدستان تنظر فيهما بعينيك.االقتراب منها",
  "translationEn": "Look through me at something far away, and it appears larger and closer. Some people carry me to watch birds without approaching them. I have two eyepieces for you to look through. What am I?",
  "page": 20,
  "riddleAnswerAr": "المنظار الثنائي"
 },
 {
  "id": "intermediate-riddle-10",
  "level": "intermediate",
  "type": "riddle",
  "number": 10,
  "titleAr": "درجات بال أرقام",
  "sourceArabic": "تضع. لكنها ليست عالمات اختبار،لي درجات كثيرة .قدمك على درجة ثم األخرى لتصعد إلى طابق أعلى ما أنا؟.أظل ثابًتا بينما يتحرك الناس فوقي",
  "translationEn": "I have many steps, but they are not stages in a plan. You put your foot on one, then another, to reach a higher floor. I remain still while people move over me. What am I?",
  "page": 20,
  "riddleAnswerAr": "السلم أو الدرج"
 },
 {
  "id": "intermediate-news-01",
  "level": "intermediate",
  "type": "news",
  "number": 1,
  "titleAr": "حملة لتبادل الكتب",
  "sourceArabic": "نظم مجلس الطالب حملة لتبادل الكتب في أحضر المشاركون كتًبا.المدرسة صباح االثنين وأوضح المشرف أن.قرؤوها واختاروا كتًبا أخرى الحملة تهدف إلى تشجيع القراءة وتقليل الحاجة إلى .شراء نسخ جديدة",
  "translationEn": "The student council organized a book exchange at school on Monday morning. Participants brought books they had read and chose others. The supervisor explained that the campaign aims to encourage reading and reduce the need to buy new copies.",
  "page": 21
 },
 {
  "id": "intermediate-news-02",
  "level": "intermediate",
  "type": "news",
  "number": 2,
  "titleAr": "ورشة زراعة",
  "sourceArabic": "شارك خمسة وعشرون طالًبا في ورشة زراعة تعلموا نقل الشتالت.أقيمت بحديقة المدرسة أمس اتفقت، وفي نهاية الورشة.وسقيها بكمية مناسبة المجموعات على جدول أسبوعي للعناية بالنباتات .ومتابعة نموها",
  "translationEn": "Twenty-five students attended a gardening workshop in the school garden yesterday. They learned to transplant seedlings and water them appropriately. At the end, the groups agreed on a weekly schedule for caring for the plants and monitoring their growth.",
  "page": 21
 },
 {
  "id": "intermediate-news-03",
  "level": "intermediate",
  "type": "news",
  "number": 3,
  "titleAr": "نشرة طالبية",
  "sourceArabic": "أصدر نادي اللغة العربية العدد األول من نشرته تضمنت النشرة قصًصا.المدرسية هذا األسبوع وسيستقبل النادي.قصيرة ومقابلة مع أمينة المكتبة .مشاركات الطالب للعدد القادم حتى نهاية الشهر",
  "translationEn": "The Arabic club published the first issue of its school newsletter this week. It included short stories and an interview with the librarian. The club will accept student contributions for the next issue until the end of the month.",
  "page": 21
 },
 {
  "id": "intermediate-news-04",
  "level": "intermediate",
  "type": "news",
  "number": 4,
  "titleAr": "يوم بال أكواب ورقية",
  "sourceArabic": "نظمت المدرسة نشاًطا شجع الطالب على إحضار وشارك المعلمون في.أكواب قابلة إلعادة االستخدام وستقارن لجنة.شرح طريقة غسلها والمحافظة عليها البيئة كمية األكواب الورقية المستخدمة قبل النشاط .وبعده",
  "translationEn": "The school organized an activity encouraging students to bring reusable cups. Teachers explained how to wash and care for them. The environment committee will compare the number of paper cups used before and after the activity.",
  "page": 21
 },
 {
  "id": "intermediate-news-05",
  "level": "intermediate",
  "type": "news",
  "number": 5,
  "titleAr": "مسابقة إلقاء",
  "sourceArabic": "اختتمت المدرسة مسابقة اإللقاء أمس بمشاركة ركز التقييم على وضوح.طالب من صفوف مختلفة ، حصل الفائزون على كتب.الصوت وفهم المعنى وأعلنت اللجنة تنظيم تدريب إضافي لجميع الراغبين .في تحسين أدائهم",
  "translationEn": "The school concluded its recitation competition yesterday, with students from different grades taking part. Assessment focused on voice clarity and understanding of meaning. Winners received books, and the committee announced extra training for anyone wishing to improve their performance.",
  "page": 21
 },
 {
  "id": "intermediate-news-06",
  "level": "intermediate",
  "type": "news",
  "number": 6,
  "titleAr": "زاوية للتراث",
  "sourceArabic": "افتتح الطالب زاوية للتراث في بهو المدرسة صباح عرضوا أدوات منزلية قديمة وصوًر ا توضح.اليوم وتولى فريق من الطالب شرح.استعمالها المعروضات للزوار بالعربية واإلنجليزية خالل وقت .االستراحة",
  "translationEn": "Students opened a heritage corner in the school foyer this morning. They displayed old household tools and pictures showing how they were used. A student team explained the exhibits to visitors in Arabic and English during break time.",
  "page": 22
 },
 {
  "id": "intermediate-news-07",
  "level": "intermediate",
  "type": "news",
  "number": 7,
  "titleAr": "تدريب على السالمة",
  "sourceArabic": "نفذت المدرسة تدريًبا على اإلخالء صباح األربعاء انتقل الطالب إلى نقاط.بإشراف فريق السالمة وبعد.التجمع المحددة واتبعوا تعليمات المعلمين راجع المشرفون خطوات الخروج مع،التدريب .الصفوف لتحسين التنظيم",
  "translationEn": "The school held an evacuation drill on Wednesday morning under the safety team’s supervision. Students moved to designated assembly points and followed teachers’ instructions. Afterward, supervisors reviewed the exit procedures with classes to improve organization.",
  "page": 22
 },
 {
  "id": "intermediate-news-08",
  "level": "intermediate",
  "type": "news",
  "number": 8,
  "titleAr": "نادي للمحادثة",
  "sourceArabic": "بدأ نادي المحادثة العربية لقاءاته األسبوعية في شارك الطالب في حوارات عن التسوق.المكتبة وأوضح المعلم أن.والسفر والحياة المدرسية األنشطة تمنح المتعلمين فرصة الستخدام اللغة في .مواقف قريبة من حياتهم",
  "translationEn": "The Arabic conversation club began its weekly meetings in the library. Students took part in conversations about shopping, travel, and school life. The teacher explained that the activities allow learners to use the language in situations related to their lives.",
  "page": 22
 },
 {
  "id": "intermediate-news-09",
  "level": "intermediate",
  "type": "news",
  "number": 9,
  "titleAr": "تكريم المتطوعين",
  "sourceArabic": "كرمت المدرسة مجموعة من الطالب ساعدوا في شملت مهامهم استقبال الزوار.تنظيم معرض العلوم وأكد المشرف.وترتيب الطاوالت وتوجيه المشاركين أن التعاون بين الطالب أسهم في سير المعرض .بصورة منظمة",
  "translationEn": "The school honored students who helped organize the science fair. Their tasks included welcoming visitors, arranging tables, and directing participants. The supervisor said that cooperation among the students helped the fair run smoothly.",
  "page": 22
 },
 {
  "id": "intermediate-news-10",
  "level": "intermediate",
  "type": "news",
  "number": 10,
  "titleAr": "استبيان األنشطة",
  "sourceArabic": "وزع مجلس الطالب استبياًنا لمعرفة األنشطة التي تضمنت الخيارات الرياضة والفنون.يفضلها زمالؤهم وسُتعرض. مع مساحة القتراحات أخرى،والقراءة النتائج على إدارة المدرسة قبل وضع خطة األنشطة .للفصل القادم",
  "translationEn": "The student council distributed a survey to learn which activities their classmates prefer. Options included sports, arts, and reading, with space for other suggestions. The results will be presented to school management before next term’s activity plan is prepared.",
  "page": 22
 },
 {
  "id": "advanced-scenario-01",
  "level": "advanced",
  "type": "scenario",
  "number": 1,
  "titleAr": "خبر غير موثوق",
  "sourceArabic": "وصلت إلى مجموعة الصف رسالة تزعم إلغاء رغم أن بعض. ولم تتضمن مصدًر ا واضًح ا،االختبار امتنعت عن إعادة نشرها،الزمالء بدأوا االحتفال تبين أن الموعد.وراجعت القناة الرسمية للمدرسة فكتبت توضيًح ا هادًئا وأرفقت اإلعالن،لم يتغير المعتمد حتى ال يبني أحد قراره على معلومة غير .موثوقة",
  "translationEn": "A message claiming that the exam was canceled reached the class group without a clear source. Although some classmates began celebrating, I did not forward it and checked the school’s official channel. The date had not changed, so I posted a calm clarification with the official announcement to prevent anyone from acting on unreliable information.",
  "page": 23
 },
 {
  "id": "advanced-scenario-02",
  "level": "advanced",
  "type": "scenario",
  "number": 2,
  "titleAr": "اختالف داخل الفريق",
  "sourceArabic": "أصر زميلي على تصميم،أثناء إعداد مشروع جماعي بداًل من.جميل لكنه صعب التنفيذ في الوقت المتاح طلبت منه تحديد أهم،رفض فكرته مباشرة اتفقنا على االحتفاظ بالفكرة األساسية.عناصرها ثم وزعنا المهام بحسب قدرات،وتبسيط التفاصيل بذلك حافظنا على جودة العمل والتزمنا.األعضاء .بموعد التسليم مالحظة نقدية03",
  "translationEn": "While preparing a group project, my classmate insisted on an attractive design that would be difficult to complete in time. Instead of rejecting it immediately, I asked him to identify its most important elements. We agreed to keep the main idea and simplify the details, then assigned tasks according to members’ abilities. This preserved quality and met the deadline.",
  "page": 23
 },
 {
  "id": "advanced-scenario-03",
  "level": "advanced",
  "type": "scenario",
  "number": 3,
  "titleAr": "مالحظة نقدية",
  "sourceArabic": "لكن المعلم أشار،قدمت عرًض ا اعتقدت أنه متقن شعرت بالضيق.إلى ضعف األدلة التي استخدمتها ثم سألته عن مثال محدد يساعدني على،في البداية راجعت المصادر وأعدت صياغة بعض.الفهم أدركت أن الثقة في العرض ال تعوض.االستنتاجات وأن النقد المحدد يمكن أن يحسن،نقص الدليل .العمل",
  "translationEn": "I gave a presentation I thought was polished, but the teacher pointed out weaknesses in my evidence. I initially felt upset, then asked for a specific example to help me understand. I reviewed my sources and revised some conclusions. I realized that confident delivery cannot compensate for weak evidence and that specific criticism can improve work.",
  "page": 23
 },
 {
  "id": "advanced-scenario-04",
  "level": "advanced",
  "type": "scenario",
  "number": 4,
  "titleAr": "مقعد في اللجنة",
  "sourceArabic": "وكان أقرب،ُر شحت لتمثيل الصف في لجنة األنشطة خشيت أن تؤثر المنافسة في.أصدقائي مرشًح ا أيًض ا اتفقنا على. فتحدثت معه قبل التصويت،عالقتنا وعندما اختاره.عرض أفكارنا باحترام ودعم الفائز هنأته وقدمت له اقتراًح ا يساعده على تنفيذ،الطالب . مع احتفاظي بحقي في إبداء الرأي،برنامجه",
  "translationEn": "I was nominated to represent the class on the activities committee, and my closest friend was also a candidate. Worried that competition might affect our friendship, I spoke with him before voting. We agreed to present our ideas respectfully and support the winner. When students chose him, I congratulated him and offered a useful suggestion while retaining my right to express opinions.",
  "page": 24
 },
 {
  "id": "advanced-scenario-05",
  "level": "advanced",
  "type": "scenario",
  "number": 5,
  "titleAr": "وعد يصعب تنفيذه",
  "sourceArabic": "ثم،وافقت على مساعدة زميلين في يوم واحد لم.اكتشفت أن الوقت ال يكفي للوفاء بالوعدين بل شرحت لهما،أنتظر حتى اللحظة األخيرة تقبال التغيير ألنني.المشكلة واقترحت موعدين بديلين وتعلمت أن تقدير قدرتي قبل االلتزام،كنت واضًح ا أكثر مسؤولية من تقديم وعود كثيرة ال أستطيع .تنفيذها",
  "translationEn": "I agreed to help two classmates on the same day, then realized I lacked the time to keep both promises. Rather than waiting until the last moment, I explained the problem and proposed alternative times. They accepted the change because I was clear. I learned that assessing my capacity before committing is more responsible than making promises I cannot keep.",
  "page": 24
 },
 {
  "id": "advanced-scenario-06",
  "level": "advanced",
  "type": "scenario",
  "number": 6,
  "titleAr": "تعليق جارح",
  "sourceArabic": "فضحك،سمعت زمياًل يسخر من لهجة طالب جديد قلت بهدوء إن اختالف اللهجات ال.بعض الحاضرين وإننا جميًعا نخطئ عندما،يقلل من قيمة المتحدث تحدثت مع الطالب الجديد على، بعد ذلك.نتعلم لغة أردت دعم.انفراد وسألته إن كان يحتاج إلى مساعدة .شعوره باالنتماء من دون إحراجه أمام اآلخرين",
  "translationEn": "I heard a classmate mock a new student’s accent, and some people laughed. I calmly said that different accents do not diminish a speaker’s worth and that everyone makes mistakes when learning a language. Later, I spoke privately with the new student and asked whether he needed help. I wanted to support his sense of belonging without embarrassing him publicly.",
  "page": 24
 },
 {
  "id": "advanced-scenario-07",
  "level": "advanced",
  "type": "scenario",
  "number": 7,
  "titleAr": "تقييم منصف",
  "sourceArabic": "طلب مني صديقي أن أمنحه أعلى درجة في تقييم . مع أنه لم ينجز مهمته كاملة،العمل الجماعي ال،أوضحت له أن التقييم يتعلق بالمشاركة الفعلية ذكرت ما أحسن أداءه وما يحتاج إلى.بقوة الصداقة واقترحت أن يتولى مهمة إضافية قبل،تحسين حاولت أن أجمع بين الصراحة وإتاحة فرصة.التسليم .عادلة للتقدم",
  "translationEn": "My friend asked me to give him the highest score in the group-work assessment, although he had not completed his task. I explained that assessment concerns actual contribution, not friendship. I identified what he had done well and what needed improvement, and suggested an additional task before submission. I tried to combine honesty with a fair opportunity to improve.",
  "page": 25
 },
 {
  "id": "advanced-scenario-08",
  "level": "advanced",
  "type": "scenario",
  "number": 8,
  "titleAr": "قرار استهالكي",
  "sourceArabic": "رأيت إعالًنا عن جهاز جديد يصفه بأنه ضروري لكل قارنت وظائفه بما، قبل أن أطلب شراءه.طالب اكتشفت أن معظم الفروق.يقدمه الجهاز الذي أملكه . فقررت تأجيل الشراء،ال ترتبط بحاجتي الفعلية ساعدني تدوين احتياجاتي على التمييز بين فائدة .حقيقية ورغبة صنعها اإلعالن",
  "translationEn": "I saw an advertisement describing a new device as essential for every student. Before asking to buy it, I compared its functions with those of my current device. Most differences were unrelated to my actual needs, so I postponed the purchase. Writing down my needs helped me distinguish genuine usefulness from a desire created by advertising.",
  "page": 25
 },
 {
  "id": "advanced-scenario-09",
  "level": "advanced",
  "type": "scenario",
  "number": 9,
  "titleAr": "مهمة تطوعية",
  "sourceArabic": "الحظت أن بعض،أثناء تنظيم حملة تبرع بالكتب .الكتب ممزق أو غير مناسب ألعمار المستفيدين رغم،اقترحت فرزها قبل اإلعالن عن العدد النهائي ، وافق الفريق.أن ذلك سيقلل الرقم الذي نحتفل به أدركنا أن نجاح المبادرة.وركزنا على جودة ما نقدمه ال بحجم الصورة التي نصنعها،ُيقاس بنفعها لآلخرين .عنها",
  "translationEn": "While organizing a book donation campaign, I noticed that some books were damaged or unsuitable for the recipients’ ages. I proposed sorting them before announcing the final total, even though this would reduce the number we celebrated. The team agreed and focused on quality. We realized that success is measured by benefit to others, not by the image we create.",
  "page": 25
 },
 {
  "id": "advanced-scenario-10",
  "level": "advanced",
  "type": "scenario",
  "number": 10,
  "titleAr": "حدود الخصوصية",
  "sourceArabic": "طلب مني أحد األصدقاء إرسال لقطة شاشة لمحادثة امتنعت عن.خاصة حتى يفهم خالًفا بين زميلين إرسالها ألن أصحاب الرسائل لم يوافقوا على عرضت بداًل من ذلك تلخيص المشكلة.مشاركتها وشجعت الطرفين،دون أسماء أو تفاصيل شخصية لم يكن الفضول سبًبا كافًيا.على الحديث مباشرة .لكشف ما ائتمنني اآلخرون عليه",
  "translationEn": "A friend asked me to send a screenshot of a private conversation to understand a disagreement between two classmates. I declined because the writers had not agreed to share their messages. Instead, I offered to summarize the issue without names or personal details and encouraged direct discussion. Curiosity was not sufficient reason to reveal what others had entrusted to me.",
  "page": 25
 },
 {
  "id": "advanced-dialogue-01",
  "level": "advanced",
  "type": "dialogue",
  "number": 1,
  "titleAr": "الواجب والتعلم",
  "sourceArabic": "أرى أن كثرة الواجبات تضمن تعلًما أفضل؛:ليلى .فهي تزيد وقت التدريب لكن هل كل تدريب مفيد بالقدر، قد تزيد الوقت:عمر نفسه؟ . ربما تكون بعض األسئلة متكررة:ليلى ، إذن لنجرب واجًبا أقصر يتطلب تفسير اإلجابة:عمر .ثم نقارن مستوى الفهم . بشرط أن نعتمد نتيجة واضحة للحكم، أوافق:ليلى",
  "translationEn": "Layla: I think more homework guarantees better learning because it increases practice time. Omar: It may increase time, but is all practice equally useful? Layla: Some questions may be repetitive. Omar: Then let’s try shorter homework that requires explanations and compare understanding. Layla: I agree, provided we use a clear outcome to judge it.",
  "page": 26
 },
 {
  "id": "advanced-dialogue-02",
  "level": "advanced",
  "type": "dialogue",
  "number": 2,
  "titleAr": "مصدر المعلومة",
  "sourceArabic": "وجدت منشوًر ا يؤكد أن هذه الطريقة تحسن:سالم .الذاكرة لدى الجميع هل يذكر دراسة أو جهة يمكن الرجوع إليها؟:نور . لكنه حصل على آالف اإلعجابات، ال:سالم وكلمة الجميع تحتاج إلى، االنتشار ال يثبت الصحة:نور .دليل قوي سأبحث عن المصدر األصلي قبل أن أتبنى:سالم .النتيجة أو أنشرها",
  "translationEn": "Salem: I found a post claiming that this method improves everyone’s memory. Noor: Does it cite a study or an organization we can consult? Salem: No, but it has thousands of likes. Noor: Popularity does not establish accuracy, and “everyone” requires strong evidence. Salem: I’ll find the original source before accepting or sharing the conclusion.",
  "page": 26
 },
 {
  "id": "advanced-dialogue-03",
  "level": "advanced",
  "type": "dialogue",
  "number": 3,
  "titleAr": "معنى النجاح",
  "sourceArabic": "هل يكفي الفوز بالمسابقة لنصف مشروًعا:المعلم بأنه ناجح؟ . لكنه ليس المعيار الوحيد، الفوز دليل مهم:هند ما المعيار الذي تضيفينه؟:المعلم ، وقدرتنا على تفسير النتائج، مقدار ما تعلمناه:هند .وعدالة توزيع العمل وكيف نتحقق من ذلك؟:المعلم نسجل ما أنجزه كل عضو ونراجع ما تغير في:هند .فهمنا",
  "translationEn": "Teacher: Is winning a competition enough to call a project successful? Hind: Winning is important evidence, but it is not the only criterion. Teacher: What criterion would you add? Hind: How much we learned, our ability to explain the results, and fair distribution of work. Teacher: How can we check that? Hind: We record each member’s contribution and review changes in our understanding.",
  "page": 26
 },
 {
  "id": "advanced-dialogue-04",
  "level": "advanced",
  "type": "dialogue",
  "number": 4,
  "titleAr": "التقنية في الصف",
  "sourceArabic": "أقترح استخدام األجهزة في جميع األنشطة؛:ريم .فهي تجعل التعلم ممتًعا لكن بعض المهام تحتاج إلى، المتعة مفيدة:خالد .نقاش مباشر أو كتابة يدوية هل تقترح تقليل استخدامها؟:ريم . ثم تقييم أثرها، أقترح اختيار األداة وفق الهدف:خالد إذن نبدأ بنشاط واحد ونالحظ هل ساعد الجهاز:ريم . على الفهم فعاًل حماية التراث05",
  "translationEn": "Reem: I suggest using devices in every activity because they make learning enjoyable. Khaled: Enjoyment helps, but some tasks need direct discussion or handwriting. Reem: Are you suggesting less use? Khaled: I suggest choosing the tool according to the goal and assessing its effect. Reem: Then we’ll start with one activity and see whether the device actually helps understanding.",
  "page": 27
 },
 {
  "id": "advanced-dialogue-05",
  "level": "advanced",
  "type": "dialogue",
  "number": 5,
  "titleAr": "حماية التراث",
  "sourceArabic": "كيف نحافظ على الحرف التقليدية من دون أن:مريم تبقى مجرد معروضات؟ يمكن تنظيم ورش يتعلم فيها الشباب من:راشد .الحرفيين . لكن استمرار الحرفة يحتاج أيًضا إلى مشترين:مريم يمكن تطوير منتجات تناسب، صحيح:راشد .االستخدام اليومي مع توضيح أصلها هكذا نحافظ على المعرفة ونمنحها فرصة:مريم .لالستمرار",
  "translationEn": "Mariam: How can we preserve traditional crafts without leaving them as mere exhibits? Rashid: We could organize workshops where young people learn from craftspeople. Mariam: But the craft also needs buyers to survive. Rashid: True. We can develop products for everyday use while explaining their origins. Mariam: That would preserve the knowledge and give it a chance to continue.",
  "page": 27
 },
 {
  "id": "advanced-dialogue-06",
  "level": "advanced",
  "type": "dialogue",
  "number": 6,
  "titleAr": "عدالة المشاركة",
  "sourceArabic": "أريد اختيار أسرع الطالب إلنجاز المشروع:يوسف .حتى ننتهي مبكًر ا . لكن ذلك سيحرم اآلخرين من فرصة التعلم:دانا . أخشى أن نتأخر إذا شارك الجميع:يوسف ، يمكن تقسيم المهمات وتقديم دعم لمن يحتاجه:دانا .مع مواعيد مراجعة قصيرة فالسرعة وحدها ال تكفي لتقييم، لنجرب ذلك:يوسف .العمل الجماعي",
  "translationEn": "Yousef: I want to choose the fastest students so we finish the project early. Dana: But that would deny others a learning opportunity. Yousef: I’m afraid we’ll be late if everyone takes part. Dana: We can divide the tasks, support those who need help, and schedule brief reviews. Yousef: Let’s try it. Speed alone cannot measure teamwork.",
  "page": 27
 },
 {
  "id": "advanced-dialogue-07",
  "level": "advanced",
  "type": "dialogue",
  "number": 7,
  "titleAr": "االعتذار واإلصالح",
  "sourceArabic": "لكنه ما زال غاضًبا ألنني، اعتذرت لصديقي:علي .نشرت صورته دون إذنه هل حذفت الصورة وطلبت ممن نقلها حذفها؟:سارة . حذفتها من حسابي فقط:علي لكن إصالح األثر يحتاج إلى، االعتذار بداية:سارة .خطوة عملية وأحترم حاجته إلى، سأحاول الحد من انتشارها:علي .وقت ليستعيد ثقته بي",
  "translationEn": "Ali: I apologized to my friend, but he is still angry because I posted his photo without permission. Sara: Did you delete it and ask those who shared it to do the same? Ali: I only deleted it from my account. Sara: Apologizing is a start, but repairing the harm requires action. Ali: I’ll try to limit its spread and respect his need for time to trust me again.",
  "page": 28
 },
 {
  "id": "advanced-dialogue-08",
  "level": "advanced",
  "type": "dialogue",
  "number": 8,
  "titleAr": "قراءة النتائج",
  "sourceArabic": "إذن، ارتفعت درجات مجموعتنا بعد النشاط:هبة .النشاط وحده سبب التحسن . لكننا راجعنا الدروس أكثر أيًضا، هذا احتمال:مازن كيف نميز بين السببين؟:هبة نحتاج إلى مقارنة عادلة تراعي وقت المراجعة:مازن .وظروف االختبار لكنها ال تكفي وحدها، سأقول إن النتائج مشجعة:هبة .إلثبات السبب",
  "translationEn": "Heba: Our group’s scores rose after the activity, so the activity alone caused the improvement. Mazen: That is possible, but we also spent more time revising. Heba: How can we distinguish the two causes? Mazen: We need a fair comparison accounting for revision time and test conditions. Heba: I’ll say the results are encouraging but insufficient on their own to establish the cause.",
  "page": 28
 },
 {
  "id": "advanced-dialogue-09",
  "level": "advanced",
  "type": "dialogue",
  "number": 9,
  "titleAr": "المصلحة المشتركة",
  "sourceArabic": "لدينا ميزانية محدودة؛ هل نشتري زينة:رئيس النادي للحفل أم أدوات تستعمل طوال العام؟ لكن األدوات تخدم، الزينة تجذب الحضور:عضو .أنشطة أكثر هل نستغني عن الزينة تماًما؟:رئيس النادي ونخصص، نستطيع صنعها من مواد متاحة:عضو .معظم المال لألدوات فلنعرض التكلفة، اقتراح مناسب:رئيس النادي .المتوقعة قبل التصويت حرية الرأي10",
  "translationEn": "Club president: Our budget is limited. Should we buy decorations for the event or tools to use all year? Member: Decorations attract visitors, but tools support more activities. President: Should we give up decorations entirely? Member: We can make them from available materials and spend most of the money on tools. President: Good suggestion. Let’s present the expected costs before voting.",
  "page": 29
 },
 {
  "id": "advanced-dialogue-10",
  "level": "advanced",
  "type": "dialogue",
  "number": 10,
  "titleAr": "حرية الرأي",
  "sourceArabic": "فمن حقي أن أقول، ما دمت أعّبر عن رأيي:طالب .أي شيء بأي أسلوب لكن كيف تميز ذلك عن، يمكنك نقد الفكرة:المعلمة إهانة صاحبها؟ اًل أذكر سبب اعتراضي بد من وصف الشخص:طالب .بصفة سيئة وهل تستمع إلى رده؟:المعلمة فقد تظهر معلومات تجعلني أعدل، نعم:طالب .موقفي",
  "translationEn": "Student: Since I’m expressing an opinion, I have the right to say anything in any manner. Teacher: You can criticize an idea, but how do you distinguish that from insulting its author? Student: I explain my objection instead of labeling the person negatively. Teacher: And do you listen to their response? Student: Yes. New information may lead me to revise my position.",
  "page": 29
 },
 {
  "id": "advanced-story-01",
  "level": "advanced",
  "type": "story",
  "number": 1,
  "titleAr": "الجسر الورقي",
  "sourceArabic": "لكنه انهار عند أول،بنى فريق مها جسًر ا من الورق ، أراد بعض األعضاء إضافة طبقات عشوائية.اختبار بينما اقترحت مها تسجيل موضع االنهيار وتغيير عنصر حمل الجسر، بعد محاوالت منظمة.واحد كل مرة لكنه أظهر كيف، لم يكن أجمل النماذج.وزًنا أكبر يحول فهم الخطأ تجربة فاشلة إلى تعلم قابل .للتفسير",
  "translationEn": "Maha’s team built a paper bridge, but it collapsed during the first test. Some members wanted to add layers at random, while Maha proposed recording where it failed and changing one element at a time. After systematic attempts, the bridge carried more weight. It was not the prettiest model, but it showed how understanding failure turns an unsuccessful experiment into explainable learning.",
  "page": 30
 },
 {
  "id": "advanced-story-02",
  "level": "advanced",
  "type": "story",
  "number": 2,
  "titleAr": "صاحب الفكرة",
  "sourceArabic": "فلم،اقترح طالب هادئ حاًل لمشكلة في المشروع كرر قائد الفريق الفكرة، بعد دقائق.ينتبه إليه أحد توقف القائد وقال إن االقتراح. فوافق الجميع،نفسها تغيرت طريقة. وطلب منه شرحه،يعود إلى زميله النقاش بعد ذلك؛ صار الفريق يمنح كل عضو وقًتا وأصبحت األفكار ُتناقش بعيًدا عن مكانة،للكالم .أصحابها",
  "translationEn": "A quiet student suggested a solution to a project problem, but nobody noticed. Minutes later, the team leader repeated the same idea, and everyone agreed. The leader paused, credited his classmate, and asked him to explain it. Discussion then changed: each member received speaking time, and ideas were considered independently of the status of the people proposing them.",
  "page": 30
 },
 {
  "id": "advanced-story-03",
  "level": "advanced",
  "type": "story",
  "number": 3,
  "titleAr": "دكان الجد",
  "sourceArabic": "فاقترح التخلص من،أراد فهد تحديث دكان جده سأله الجد.الرفوف القديمة وكل ما يرتبط بالماضي ، تحدث فهد معهم.عما يحبه الزبائن في المكان فاكتشف أنهم يقدرون ترتيب السلع الحديث ودفء وحافظ على ركن، عدل خطته.اللقاء القديم مًعا تعلم أن التطوير يبدأ بفهم قيمة.الصور والحكايات . ال بمحو آثاره،الموجود",
  "translationEn": "Fahad wanted to modernize his grandfather’s shop and proposed removing the old shelves and everything associated with the past. His grandfather asked what customers liked about it. Fahad spoke with them and found that they valued both modern organization and traditional warmth. He revised his plan, preserving the photographs and stories corner. He learned that improvement begins by understanding existing value.",
  "page": 30
 },
 {
  "id": "advanced-story-04",
  "level": "advanced",
  "type": "story",
  "number": 4,
  "titleAr": "الجائزة المؤجلة",
  "sourceArabic": "لكنها اكتشفت أن فقرة،فازت نورة بمسابقة كتابة لم تكن قد.في نصها تشبه كثيًر ا نًصا قرأته سابًقا راجعت اللجنة. ومع ذلك أخبرت اللجنة،نقلتها عمًدا الفقرة وطلبت تعديلها مع توضيح المصدر قبل اعتماد لكنها فهمت أن األمانة، شعرت نورة بالحرج.النتيجة بل تشمل تحمل مسؤولية ما،ال تتوقف عند النية .نقدمه",
  "translationEn": "Noura won a writing competition but discovered that a paragraph closely resembled something she had read earlier. She had not copied it deliberately, yet she informed the committee. They reviewed it and requested revision with source acknowledgment before confirming the result. Noura felt embarrassed but understood that integrity involves responsibility for what we submit, not just our intentions.",
  "page": 31
 },
 {
  "id": "advanced-story-05",
  "level": "advanced",
  "type": "story",
  "number": 5,
  "titleAr": "باب المكتبة",
  "sourceArabic": "فظن أن،الحظ أمين المكتبة أن عدد الزوار يقل سألهم قبل تغيير.الطالب لم يعودوا يحبون القراءة فاكتشف أن وقت االفتتاح يتعارض مع،الكتب فزاد، ُج ّر ب موعد إضافي أسبوعين.أنشطتهم لكنها، لم تحل التجربة كل المشكالت.الحضور كشفت أن تفسير السلوك يحتاج إلى سؤال الناس . ال إلى الحكم عليهم من بعيد،وفهم ظروفهم",
  "translationEn": "The librarian noticed falling attendance and assumed students no longer enjoyed reading. Before replacing the books, he asked them and discovered that opening hours conflicted with their activities. An extra time slot was tried for two weeks, and attendance increased. The trial did not solve every problem, but it showed that explaining behavior requires asking people and understanding their circumstances.",
  "page": 31
 },
 {
  "id": "advanced-story-06",
  "level": "advanced",
  "type": "story",
  "number": 6,
  "titleAr": "شجرة الجيران",
  "sourceArabic": ".اختلف جاران حول شجرة تمتد أغصانها فوق الجدار ورأى اآلخر أوراًقا تسقط في، رأى أحدهما ظاًل جمياًل تحدثا عن، بداًل من مواصلة الشكوى.فناء منزله .حاجتيهما واستعانا ببستاني اقترح تقليًما مناسًبا لم يحصل. وخفت األوراق المتساقطة،بقيت الشجرة لكنهما وجدا حاًل يحفظ،أي منهما على كل ما أراد .الجيرة",
  "translationEn": "Two neighbors disagreed about a tree whose branches extended over a wall. One saw pleasant shade; the other saw leaves falling into his yard. Instead of continuing to complain, they discussed their needs and consulted a gardener who suggested suitable pruning. The tree remained, and fewer leaves fell. Neither got everything he wanted, but they found a solution that preserved their relationship.",
  "page": 31
 },
 {
  "id": "advanced-story-07",
  "level": "advanced",
  "type": "story",
  "number": 7,
  "titleAr": "منصة الخطاب",
  "sourceArabic": ".حفظ آدم خطاًبا طوياًل ليبدو واثًقا أمام الجمهور ، في التدريب التالي. ارتبك وتوقف،عندما نسي جملة طلبت منه المعلمة تلخيص الفكرة في ثالث نقاط لم يصبح أداؤه مثالًيا.وشرحها من دون حفظ حرفي . لكنه استطاع استكمال الحديث عند النسيان،فوًر ا اكتشف أن فهم المعنى يمنحه مرونة ال توفرها .الذاكرة وحدها",
  "translationEn": "Adam memorized a long speech to appear confident before an audience. When he forgot a sentence, he became confused and stopped. At the next rehearsal, his teacher asked him to summarize the idea in three points and explain it without exact memorization. His delivery was not immediately perfect, but he could continue when he forgot words. Understanding gave him flexibility that memory alone could not.",
  "page": 32
 },
 {
  "id": "advanced-story-08",
  "level": "advanced",
  "type": "story",
  "number": 8,
  "titleAr": "الرقم الكبير",
  "sourceArabic": "ففرح،أعلن فريق تطوعي أنه جمع مئات الكتب اكتشفوا نسًخا ناقصة، أثناء الفرز.أعضاؤه بالرقم اقترحت قائدة.وأخرى ال تناسب القراء المستهدفين وشرح ما،الفريق إعالن عدد الكتب الصالحة فقط لكنه صار، بدا اإلنجاز أصغر في اإلعالن.جرى للبقية حدد الفريق، وفي الحملة التالية.أكثر صدًقا وفائدة .شروط التبرع منذ البداية",
  "translationEn": "A volunteer team announced collecting hundreds of books and celebrated the total. During sorting, they found incomplete copies and others unsuitable for the intended readers. The leader proposed announcing only usable books and explaining what happened to the rest. The achievement looked smaller but became more honest and useful. For the next campaign, the team set donation requirements from the beginning.",
  "page": 32
 },
 {
  "id": "advanced-story-09",
  "level": "advanced",
  "type": "story",
  "number": 9,
  "titleAr": "نافذة جديدة",
  "sourceArabic": "كان رامي يظن أن زميله ال يهتم بالعمل ألنه يتأخر ثم، كاد يستبعده من الفريق.في الرد على الرسائل علم أن الزميل يشارك.قرر الحديث معه مباشرة فاتفقا على وسيلة تواصل،جهاًز ا واحًدا مع إخوته وتعلم رامي أن ما، تحسن التعاون.ووقت مناسبين يراه من سلوك ال يكشف دائًم ا الظروف التي تقف .وراءه",
  "translationEn": "Rami assumed his classmate did not care about the work because he replied late to messages. He almost removed him from the team, then decided to speak directly. He learned that the classmate shared one device with his siblings. They agreed on a suitable communication method and time. Cooperation improved, and Rami learned that observed behavior does not always reveal the circumstances behind it.",
  "page": 32
 },
 {
  "id": "advanced-story-10",
  "level": "advanced",
  "type": "story",
  "number": 10,
  "titleAr": "مقعد القائد",
  "sourceArabic": "ظنت أن عليها اتخاذ،عندما تولت سلمى قيادة النادي سرعان ما ازدحمت مهامها.جميع القرارات بنفسها طلبت من األعضاء اقتراح مجاالت.وتأخر العمل واتفقت معهم على مراجعة،يتحملون مسؤوليتها أصبحت أقل انشغااًل بالتفاصيل وأكثر قدرة.أسبوعية فهمت أن القيادة ال تعني احتكار.على متابعة الهدف . بل تمكين اآلخرين مع وضوح المسؤولية،العمل",
  "translationEn": "When Salma became club leader, she thought she had to make every decision herself. Soon her tasks piled up and work fell behind. She asked members to suggest areas they could take responsibility for and agreed on weekly reviews. She became less occupied with details and better able to monitor the goal. She understood that leadership means enabling others with clear responsibility.",
  "page": 32
 },
 {
  "id": "advanced-riddle-01",
  "level": "advanced",
  "type": "riddle",
  "number": 1,
  "titleAr": "حقيقة أم توقع",
  "sourceArabic": "مثل،أقول شيًئا يمكن التحقق منه بالرجوع إلى دليل قد تصح عبارتي أو.عدد الكتب على رف محدد لكنها ال تعبر عن ذوق شخصي،تخطئ بعد الفحص إذا كان، ما نوع العبارة التي أمثلها.مثل جمال الغالف معيار تمييزها إمكان اختبارها؟",
  "translationEn": "I state something that can be checked against evidence, such as the number of books on a particular shelf. My statement may prove true or false after checking, but it does not express a personal preference such as how attractive a cover is. What kind of statement am I, if my defining feature is testability?",
  "page": 33,
  "riddleAnswerAr": "عبارة خبرية قابلة للتحقق وليست بالضرورة صحيحة"
 },
 {
  "id": "advanced-riddle-02",
  "level": "advanced",
  "type": "riddle",
  "number": 2,
  "titleAr": "مفتاح رقمي",
  "sourceArabic": "مع أنني ال أملك أسناًنا معدنية وال،أحمي حسابك قد أتكون من كلمات وحروف.أدخل في قفل حقيقي كلما سهل. وينبغي أال تشاركني مع اآلخرين،ورموز ما أنا في عالم.تخميني ضعفت الحماية التي أوفرها الحسابات الرقمية؟",
  "translationEn": "I protect your account, although I have no metal teeth and fit into no physical lock. I may consist of words, letters, and symbols, and you should not share me with others. The easier I am to guess, the weaker the protection I provide. What am I in the world of digital accounts?",
  "page": 33,
  "riddleAnswerAr": "كلمة المرور"
 },
 {
  "id": "advanced-riddle-03",
  "level": "advanced",
  "type": "riddle",
  "number": 3,
  "titleAr": "قيمة تنمو ببطء",
  "sourceArabic": "أبنيها بيني وبينك عندما ألتزم بوعودي وأصدق في وقد تضعف، قد تستغرق وقًتا طوياًل لتنمو.كالمي ال يكفي أن أطلب، إذا تضررت.بسبب كذبة واحدة ما هذه. بل أحتاج إلى سلوك ثابت يبررها،عودتها العالقة المعنوية التي تجعلنا نطمئن إلى بعضنا؟",
  "translationEn": "I build it between us when I keep promises and speak truthfully. It may take a long time to grow and can weaken because of one lie. If damaged, asking for it back is insufficient; consistent behavior must justify it. What is this bond that allows us to rely on one another?",
  "page": 33,
  "riddleAnswerAr": "الثقة"
 },
 {
  "id": "advanced-riddle-04",
  "level": "advanced",
  "type": "riddle",
  "number": 4,
  "titleAr": "شيء ال يسترجع",
  "sourceArabic": "مهما،تحصل كل يوم على أربع وعشرين ساعة مني ، تستطيع أن تنظم استعمالي.اختلف مقدار مالك .لكنك ال تستطيع ادخار ساعة مضت لتعيشها الحًقا ،يعرف الطالب قيمتي حين يقترب موعد التسليم ما أنا؟.ويضيع بعضي أثناء التأجيل",
  "translationEn": "You receive twenty-four hours of me each day, regardless of your wealth. You can organize how you use me, but cannot save a past hour to live later. Students recognize my value as a deadline approaches, and some of me is lost through procrastination. What am I?",
  "page": 34,
  "riddleAnswerAr": "الوقت"
 },
 {
  "id": "advanced-riddle-05",
  "level": "advanced",
  "type": "riddle",
  "number": 5,
  "titleAr": "موقف بين طرفين",
  "sourceArabic": "وأحاول،أظهر حين أستمع إلى شخص يختلف معي ال.فهم وجهة نظره من دون أن أضطر إلى تبنيها بل احترام اإلنسان مع،أعني الموافقة على اإليذاء أساعد الجماعات المتنوعة على.إمكان نقد الفكرة ما القيمة التي أمثلها؟.العيش مًعا",
  "translationEn": "I appear when I listen to someone who disagrees with me and try to understand their view without having to adopt it. I do not mean accepting harm, but respecting the person while allowing criticism of the idea. I help diverse groups live together. What value do I represent?",
  "page": 34,
  "riddleAnswerAr": "التسامح"
 },
 {
  "id": "advanced-riddle-06",
  "level": "advanced",
  "type": "riddle",
  "number": 6,
  "titleAr": "حلقة قابلة لالختبار",
  "sourceArabic": "أجمع. ثم أقترح تفسيًر ا يمكن اختباره،أبدأ بمالحظة وأعدل التفسير إذا،األدلة وأقارن النتائج بما توقعته ال أعدك بأن تكون فكرتي األولى.لم تؤيده البيانات ما المنهج. بل أعطيك طريقة لمراجعتها،صحيحة الذي تصفه هذه الخطوات؟",
  "translationEn": "I begin with an observation and propose a testable explanation. I collect evidence, compare results with predictions, and revise the explanation if the data do not support it. I do not promise that the first idea is correct; I offer a way to examine it. What method do these steps describe?",
  "page": 34,
  "riddleAnswerAr": "المنهج العلمي"
 },
 {
  "id": "advanced-riddle-07",
  "level": "advanced",
  "type": "riddle",
  "number": 7,
  "titleAr": "خدمة باختيارك",
  "sourceArabic": "أقدم وقتي وجهدي لخدمة اآلخرين من دون أن يكون قد أنظم.األجر المالي هو المقابل المتفق عليه لكن عملي يحتاج،الكتب أو أساعد في تنظيف حديقة ما اسم هذا.إلى التزام وتنظيم رغم أنه اختياري النوع من المشاركة المجتمعية؟",
  "translationEn": "I offer time and effort to serve others without financial pay being the agreed return. I may organize books or help clean a park, but my work still requires commitment and organization even though it is voluntary. What is this type of community participation called?",
  "page": 35,
  "riddleAnswerAr": "التطوع"
 },
 {
  "id": "advanced-riddle-08",
  "level": "advanced",
  "type": "riddle",
  "number": 8,
  "titleAr": "احتمال لم يثبت",
  "sourceArabic": "لكنني ال أطالبك بقبوله،أطرح تفسيًر ا أولًيا لظاهرة يجب أن تسمح صياغتي باختبار.لمجرد أنه يبدو مقنًعا ، أسبق النتيجة النهائية.قد يؤيدني أو يكشف ضعفي ما اسمي.وقد تتغير عبارتي حين تصل أدلة جديدة في البحث العلمي؟",
  "translationEn": "I offer an initial explanation of a phenomenon but do not ask you to accept it merely because it sounds convincing. My wording must allow a test that may support me or reveal weaknesses. I come before the final conclusion and may change when new evidence arrives. What am I called in scientific research?",
  "page": 35,
  "riddleAnswerAr": "الفرضية"
 },
 {
  "id": "advanced-riddle-09",
  "level": "advanced",
  "type": "riddle",
  "number": 9,
  "titleAr": "صوت المستفيدين",
  "sourceArabic": "أنا أداة تتضمن أسئلة منظمة ُتوجه إلى مجموعة من قد أستخدم.الناس لمعرفة آرائهم أو تجاربهم تعتمد فائدة نتائجي.اختيارات محددة وأسئلة مفتوحة وال،على وضوح أسئلتي وطريقة اختيار المشاركين ما أنا؟.أمثل الجميع بالضرورة",
  "translationEn": "I am a tool containing structured questions addressed to a group of people to learn about their opinions or experiences. I may use fixed choices and open-ended questions. My usefulness depends on clear questions and participant selection, and I do not necessarily represent everyone. What am I?",
  "page": 35,
  "riddleAnswerAr": "الاستبيان"
 },
 {
  "id": "advanced-riddle-10",
  "level": "advanced",
  "type": "riddle",
  "number": 10,
  "titleAr": "خطوات قبل التنفيذ",
  "sourceArabic": "،أحدد الهدف والمهام والموارد والوقت المتوقع ال أنجز.وأوضح من يتحمل مسؤولية كل عمل لكنني أساعد الفريق على معرفة،المشروع بنفسي يمكن تعديلي إذا تغيرت.الطريق ومراجعة التقدم ما أنا؟. بشرط أال ُينسى الهدف،الظروف",
  "translationEn": "I specify the goal, tasks, resources, expected time, and who is responsible for each action. I do not complete the project myself, but help the team understand the route and review progress. I can be adjusted when circumstances change, provided the goal is not forgotten. What am I?",
  "page": 35,
  "riddleAnswerAr": "خطة العمل"
 },
 {
  "id": "advanced-news-01",
  "level": "advanced",
  "type": "news",
  "number": 1,
  "titleAr": "تقييم تجربة القراءة",
  "sourceArabic": "أعلنت لجنة األنشطة نتائج أولية لتجربة خصصت وأفاد.عشر دقائق يومًيا للقراءة الحرة خالل شهر بعض المشاركين بأنهم أصبحوا أكثر انتظاًما في وأوضحت اللجنة أن هذه اإلفادات ال تكفي.القراءة وأن المرحلة المقبلة،إلثبات تحسن المهارات ستتضمن أدوات تقييم إضافية ومقارنة تراعي اختالف .مستويات الطالب مشروع لحفظ الذاكرة02",
  "translationEn": "The activities committee announced preliminary results from a month-long trial allocating ten minutes daily to independent reading. Some participants reported reading more regularly. The committee noted that these reports do not establish improved skills and that the next stage will include additional assessment tools and comparisons accounting for different student levels.",
  "page": 36
 },
 {
  "id": "advanced-news-02",
  "level": "advanced",
  "type": "news",
  "number": 2,
  "titleAr": "مشروع لحفظ الذاكرة",
  "sourceArabic": "أطلق نادي التراث مشروًعا لتوثيق حكايات كبار وسيتولى الطالب.السن عن الحياة اليومية قديًم ا تسجيل المقابالت بعد الحصول على موافقة . ثم مراجعة النصوص معهم قبل عرضها،المشاركين ويهدف المشروع إلى تنمية مهارات االستماع مع احترام خصوصية أصحاب الحكايات،والكتابة والتمييز بين الذكريات الشخصية والوقائع التي تحتاج .إلى تحقق مراجعة استخدام الورق03",
  "translationEn": "The heritage club launched a project documenting older people’s stories about daily life in the past. Students will record interviews with participants’ consent, then review transcripts with them before presentation. The project aims to develop listening and writing while respecting privacy and distinguishing personal memories from claims requiring verification.",
  "page": 36
 },
 {
  "id": "advanced-news-03",
  "level": "advanced",
  "type": "news",
  "number": 3,
  "titleAr": "مراجعة استخدام الورق",
  "sourceArabic": "بدأت لجنة البيئة المدرسية مراجعة استهالك الورق وستسجل الكميات.في عدد من الصفوف المستخدمة أسبوعًيا قبل تجربة الطباعة على وأكدت اللجنة.الوجهين وتقليل النسخ غير الضرورية ولن،أنها ستعرض النتائج الفعلية بعد انتهاء التجربة تفترض نجاح المبادرة اعتماًدا على عدد المشاركين .أو كثرة الملصقات الدعائية وحدهما",
  "translationEn": "The school environment committee began reviewing paper consumption in several classes. It will record weekly use before testing double-sided printing and reducing unnecessary copies. The committee said it would report actual results after the trial rather than assume success based solely on participant numbers or the quantity of promotional posters.",
  "page": 36
 },
 {
  "id": "advanced-news-04",
  "level": "advanced",
  "type": "news",
  "number": 4,
  "titleAr": "منتدى للحوار",
  "sourceArabic": "نظم مجلس الطالب منتدى لمناقشة سبل تحسين عرضت.المساحات المشتركة في المدرسة المجموعات مقترحاتها مع التكلفة المتوقعة والفئات . ثم استمعت إلى أسئلة الحضور،المستفيدة وستراجع اإلدارة األفكار القابلة للتنفيذ قبل اختيار مع نشر أسباب االختيار حتى يفهم،مشروع تجريبي .الطالب كيف اُتخذ القرار تعاون بين األندية05",
  "translationEn": "The student council held a forum on improving shared school spaces. Groups presented proposals with expected costs and intended beneficiaries, then answered audience questions. Management will review feasible ideas before selecting a pilot project and publish the reasons for its choice so students understand how the decision was made.",
  "page": 37
 },
 {
  "id": "advanced-news-05",
  "level": "advanced",
  "type": "news",
  "number": 5,
  "titleAr": "تعاون بين األندية",
  "sourceArabic": "أعلنت أندية العلوم والفنون واللغة العربية تعاونها سيقدم نادي العلوم تجارب.إلنتاج معرض عن الماء بينما يراجع، ويعد نادي الفنون نماذج بصرية،مبسطة وأوضح المنظمون أن.نادي اللغة النصوص المصاحبة توزيع األدوار سيشمل مراجعة مشتركة لضمان دقة بداًل من إعداد أجزاء،المعلومات وسهولة فهمها .منفصلة ال يجمعها هدف واضح",
  "translationEn": "The science, arts, and Arabic clubs announced collaboration on a water exhibition. The science club will provide simple experiments, the arts club visual models, and the Arabic club text review. Organizers said shared review would ensure accuracy and clarity, rather than producing separate sections without a clear common purpose.",
  "page": 37
 },
 {
  "id": "advanced-news-06",
  "level": "advanced",
  "type": "news",
  "number": 6,
  "titleAr": "تطوير برنامج التطوع",
  "sourceArabic": "عدلت المدرسة برنامجها التطوعي بعد استطالع آراء شملت التعديالت.المشاركين والجهات المستفيدة .وصًفا أوضح للمهام وتدريًبا قصيًر ا قبل بدء العمل وستتابع اللجنة جودة المساهمة ومدى استجابتها ألن زيادة، إلى جانب ساعات المشاركة،للحاجة الوقت المسجل ال تعني بالضرورة زيادة األثر .اإليجابي",
  "translationEn": "The school revised its volunteering program after gathering feedback from participants and recipient organizations. Changes include clearer task descriptions and brief training before work begins. The committee will monitor contribution quality and responsiveness to need alongside participation hours, because more recorded time does not necessarily mean greater positive impact.",
  "page": 37
 },
 {
  "id": "advanced-news-07",
  "level": "advanced",
  "type": "news",
  "number": 7,
  "titleAr": "ورشة في التحقق",
  "sourceArabic": "أقامت المكتبة ورشة لتعليم الطالب التحقق من تدرب.المعلومات المنشورة على اإلنترنت ،المشاركون على تحديد المصدر وتاريخ النشر كما ناقشوا الفرق.ومقارنة االدعاء بمصادر مستقلة واخُتتمت الورشة بنشاط.بين الخبر والرأي واإلعالن يشرح فيه كل فريق أسباب ثقته في معلومة أو .تحفظه عليها",
  "translationEn": "The library held a workshop on verifying information published online. Participants practiced identifying sources and publication dates and comparing claims with independent sources. They also discussed differences between news, opinion, and advertising. The workshop ended with each team explaining why it trusted or remained cautious about a piece of information.",
  "page": 38
 },
 {
  "id": "advanced-news-08",
  "level": "advanced",
  "type": "news",
  "number": 8,
  "titleAr": "إتاحة معرض الطالب",
  "sourceArabic": "أدخل منظمو معرض الطالب تعديالت لتسهيل شملت.استفادة زوار ذوي احتياجات مختلفة وإتاحة شرح،التعديالت تكبير الخط في اللوحات وتنظيم الممرات بصورة،صوتي لبعض المعروضات وسيجمع الفريق مالحظات الزوار لتحديد ما.أوضح بداًل من اعتبار التعديالت،نجح وما يحتاج إلى تحسين .حاًل نهائًيا يناسب الجميع",
  "translationEn": "Organizers of the student exhibition made changes to support visitors with different needs. These included larger text on display boards, audio explanations for some exhibits, and clearer pathways. The team will collect visitor feedback to identify successes and areas for improvement rather than treating the changes as a final solution suitable for everyone.",
  "page": 38
 },
 {
  "id": "advanced-news-09",
  "level": "advanced",
  "type": "news",
  "number": 9,
  "titleAr": "إعالن نتائج استبيان",
  "sourceArabic": "نشر مجلس الطالب نتائج استبيان شارك فيه ستون وأظهرت اإلجابات اهتماًما بأنشطة.طالًبا من صفين لكن المجلس أوضح أن العينة ال،القراءة والرياضة وسُيوسع االستبيان قبل.تمثل جميع طالب المدرسة مع إتاحة ملخص لألسئلة،تقديم توصيات نهائية وطريقة جمع اإلجابات حتى يمكن فهم النتائج في .سياقها",
  "translationEn": "The student council published survey results from sixty students in two classes. Responses indicated interest in reading and sports, but the council noted that the sample does not represent the entire school. The survey will expand before final recommendations, and a summary of the questions and collection method will be provided to place results in context.",
  "page": 38
 },
 {
  "id": "advanced-news-10",
  "level": "advanced",
  "type": "news",
  "number": 10,
  "titleAr": "مراجعة ميثاق العمل",
  "sourceArabic": "ناقش أعضاء النادي اإلعالمي مسودة ميثاق ينظم تضمنت المسودة.نشر الصور والمقابالت الطالبية ، والتحقق من األسماء والمعلومات،طلب الموافقة وسُتراجع البنود مع.وإتاحة تصحيح األخطاء بعد النشر وأكد األعضاء أن سرعة.المشرف قبل اعتمادها النشر ال ينبغي أن تتقدم على الدقة واحترام .األشخاص الذين تتناولهم المواد المنشورة",
  "translationEn": "Media club members discussed a draft code for publishing student photographs and interviews. It includes seeking consent, checking names and information, and allowing corrections after publication. The clauses will be reviewed with the supervisor before adoption. Members stressed that publication speed should not take priority over accuracy and respect for the people featured.",
  "page": 38
 }
];
