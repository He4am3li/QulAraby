/**
 * Reviewed learning contexts for the 30 built-in vocabulary topics.
 * [[wordIndex|spoken form]] links a grammatically correct occurrence to the
 * unchanged numbered vocabulary card.  The index is 0-based within each topic.
 * Never replace inflected words with the dictionary/card form in running text.
 */
export interface VocabularyContextStory { ar: string; en: string; }
export const VOCABULARY_CONTEXTS: Record<string, VocabularyContextStory> = {
  "about_me": {
    "ar": "دخلتُ المدرسة صباحًا، فقلتُ لصديقي: [[0|مرحبًا]]! فقال: [[1|أهلًا]]! ثم قلتُ: [[2|صباح الخير]]، فأجابني بابتسامة. وفي المساء أقول لجاري: [[3|مساء الخير]]. وعندما يأتي ضيف إلى بيتنا أرحب به قائلًا: [[4|أهلًا وسهلًا]].\n\nسألتُ زميلًا جديدًا: [[5|كيف حالك؟]] فقال: [[6|أنا بخير]]. ثم قلتُ: [[7|سعيد بلقائك]]. سألته: [[8|ما اسمك؟]] فأجاب: [[9|اسمي]] عمر. ثم سألني: [[10|من أين أنت؟]] فقلتُ: [[11|أنا من الإمارات]]. شكرني قائلًا: [[12|شكرًا]]، فقلتُ: [[13|على الرحب والسعة]]. وقبل أن نغادر قلتُ: [[14|مع السلامة]]، فأجاب: [[15|أراك لاحقًا]].",
    "en": "I entered school in the morning and greeted my friend. I said hello and good morning. In the evening, I greet my neighbor, and I welcome guests to our home.\n\nI met a new classmate and asked how he was. He said he was fine. We introduced ourselves and talked about where we came from. We thanked each other and said goodbye."
  },
  "family_hobbies": {
    "ar": "تعيش [[11|أسرتي]] في بيت صغير. تتكوَّن من [[12|الوالدين]] والأبناء. يعمل [[0|أبي]] في المستشفى، وتعمل [[1|أمي]] في المدرسة. لديَّ [[2|أخ]] صغير و[[3|أخت]] كبيرة. وأنا [[8|ابن]] هذه الأسرة، وأختي [[9|ابنة]] والديّ.\n\nفي العطلة يزورنا [[4|جدي]] و[[5|جدتي]]. ويزورنا [[6|عمي]]، وتزورنا [[7|خالتي]] أيضًا. أحب اللعب مع [[13|ابن عمي]]، ونساعد في رعاية [[10|طفل رضيع]] في العائلة. ويساعد [[14|زوج]] عمتي [[15|زوجته]] في إعداد وجبة تجمعنا جميعًا.",
    "en": "My family lives in a small house. It consists of parents and children. My father works at a hospital and my mother at a school. I have a younger brother and an older sister. We are the son and daughter of our parents.\n\nDuring the holiday, my grandfather and grandmother visit us. My uncle and aunt come with their children. I play with my cousin, and we help care for a baby. The family gathers to prepare a meal."
  },
  "feelings": {
    "ar": "عندما أنجح في الاختبار أكون [[0|سعيدًا]] و[[2|متحمسًا]]، وأشعر بأنني [[13|فخور]] بعملي. لكنني قد أكون [[10|قلقًا]] و[[11|متوترًا]] قبل الامتحان. وإذا نسيتُ إجابتي أمام زملائي أشعر بأنني [[3|مُحرج]] و[[14|حائر]].\n\nإذا مرض صديقي أصبح [[4|حزينًا]]، وقد أصبح [[1|غاضبًا]] أو [[9|منزعجًا]] عندما يزعجني الضجيج. وإذا شاهدتُ شيئًا غير متوقَّع أكون [[6|متفاجئًا]] و[[8|مذهولًا]]. أحيانًا أكون [[5|مريضًا]] أو [[7|متعبًا]] فأحتاج إلى الراحة. وإذا جلست وحدي أشعر بأنني [[12|وحيد]]، لكنني لا أريد أن أكون [[15|كسولًا]].",
    "en": "I feel happy and excited when I succeed, and I am proud of my work. Before an exam I may be worried or nervous. If I forget an answer in front of classmates, I may feel embarrassed and confused.\n\nWhen a friend is sick, I feel sad. Noise may make me angry or annoyed. A surprise can leave me amazed. If I am ill or tired, I rest. I may feel lonely when sitting alone, but I try not to be lazy."
  },
  "body_parts": {
    "ar": "في [[1|الرأس]] نجد [[15|الشعر]]، وفي [[0|الوجه]] نجد [[2|العينين]] و[[3|الأنف]] و[[4|الأذنين]] و[[5|الفم]]. نستخدم [[6|اللسان]] في الكلام، وننظف [[7|الأسنان]] كل يوم. وتتحرك [[8|الشفتان]] عندما نتحدث.\n\nأمسك القلم [[11|بيدي]]، وأشير [[9|بإصبعي]] إلى [[10|ظفري]]، ثم أبدأ الكتابة. وأرفع حقيبتي [[12|بذراعي]]، وأمشي على [[13|قدمي]] وأحرّك [[14|ساقي]] أثناء الرياضة.",
    "en": "The head has hair, and the face has eyes, a nose, ears, and a mouth. We use the tongue to speak and clean our teeth every day. The lips move when we talk.\n\nI hold a pen with my hand and use my fingers to write. I can see a nail at the end of a finger. I lift my bag with my arm and use my foot and leg to walk."
  },
  "clothing": {
    "ar": "في الصباح أرتدي [[0|قميصًا]] و[[3|بنطالًا]] و[[10|حذاءً]] مريحًا، وأحيانًا أضع [[2|ربطة عنق]]. وترتدي أختي [[1|بلوزة]] في العمل أو [[5|فستانًا]] في الحفلات، وقد تختار [[11|حذاءً ذا كعب عالٍ]]. وفي الصيف أرتدي [[6|شورتًا]] وأضع [[13|نظارة شمسية]].\n\nعندما يصبح الجو باردًا أرتدي [[4|معطفًا]] و[[7|وشاحًا]] و[[8|قفازات]] و[[9|جوارب]] دافئة، وأضع [[12|قبعة]] على رأسي. أخي يحتاج إلى [[14|نظارة طبية]] عند القراءة، ونحمل [[15|مظلة]] عندما تمطر السماء.",
    "en": "In the morning I wear a shirt, trousers, and comfortable shoes. Sometimes I wear a tie. My sister wears a blouse or a dress for celebrations and may choose high heels. In summer I wear shorts and sunglasses.\n\nWhen the weather is cold, I wear a coat, scarf, gloves, warm socks, and a hat. My brother wears glasses when reading, and we carry an umbrella when it rains."
  },
  "living": {
    "ar": "في بيتنا [[0|غرفة نوم]] هادئة، فيها [[8|سرير]] و[[9|دولاب]] و[[2|مرآة]]. وبجانبها [[1|غرفة المعيشة]]، وفيها [[11|أريكة]] و[[12|سجادة]] و[[14|تلفاز]]. نضع الطعام على [[13|طاولة]] صغيرة.\n\nتطبخ أمي في [[3|المطبخ]]، ونغسل أيدينا في [[4|الحمام]]. نفتح [[5|الشباك]] خلف [[15|الستارة]]، ونجلس في [[6|الشرفة]] عندما يكون الجو لطيفًا. عند العودة ندخل من [[10|البوابة]] ونصعد [[7|السلم]] إلى الطابق العلوي.",
    "en": "Our house has a quiet bedroom with a bed, wardrobe, and mirror. The living room has a sofa, rug, and television. We put food on a small table.\n\nMy mother cooks in the kitchen, and we wash our hands in the bathroom. We open the window behind the curtain and sit on the balcony in pleasant weather. We enter through the gate and go upstairs."
  },
  "routine": {
    "ar": "كل صباح [[0|أستيقظ]] مبكرًا، ثم [[1|أرتب سريري]] و[[2|أستحم]] و[[3|أنظف أسناني]]. بعد ذلك [[4|أرتدي ملابسي]] و[[5|أتناول الإفطار]] مع أسرتي، ثم [[6|أذهب إلى المدرسة]] حيث [[7|أدرس]] مع أصدقائي.\n\nبعد انتهاء الدروس [[8|أعود إلى المنزل]] و[[9|أتناول الغداء]]. وفي المساء [[10|أمارس الرياضة]] و[[11|ألعب]] قليلًا، ثم [[12|أسترخي]] مع أسرتي. بعد ذلك [[13|أتناول العشاء]] و[[14|أصلي]]، وأخيرًا [[15|أنام]] مبكرًا.",
    "en": "Every morning I wake up early, make my bed, shower, brush my teeth, get dressed, and have breakfast. Then I go to school and study with my friends.\n\nAfter school I return home and have lunch. In the evening I exercise and play, then relax with my family. I have dinner, pray, and go to sleep early."
  },
  "food_drink": {
    "ar": "في الغداء نأكل [[0|الأرز]] مع [[1|اللحم]] أو [[2|الدجاج]] أو [[3|السمك]]. وفي الإفطار أحب [[4|البيض المسلوق]]، بينما يفضّل أخي [[5|البيض المقلي]] مع [[10|الخبز]].\n\nفي عطلة نهاية الأسبوع قد نأكل [[6|النودلز]] أو [[7|البيتزا]]، ومعهما [[8|سلطة]] و[[9|بطاطس مقلية]]. تشرب أمي [[11|القهوة]] ويشرب أبي [[12|الشاي]]، وأشرب أنا [[13|الحليب]] أو [[14|العصير]]، وأحاول التقليل من تناول [[15|المشروبات الغازية]].",
    "en": "For lunch we eat rice with meat, chicken, or fish. For breakfast I like boiled eggs, while my brother prefers fried eggs with bread.\n\nOn weekends we may eat noodles or pizza with salad and fries. My mother drinks coffee, my father drinks tea, and I drink milk or juice. I try to drink fewer fizzy drinks."
  },
  "fruits": {
    "ar": "ذهبت إلى السوق مع أمي، فاشترينا [[0|التفاح]] و[[1|الموز]] و[[2|البرتقال]] و[[3|البطيخ]]. اخترتُ [[4|العنب]] و[[5|المانجو]] و[[6|الأناناس]] و[[7|الفراولة]] لإعداد طبق فاكهة.\n\nفي الصندوق الآخر وجدنا [[8|الخوخ]] و[[9|الكيوي]] و[[10|التوت الأزرق]] و[[11|اليوسفي]] و[[12|الكرز]]. اشترينا أيضًا [[13|الكمثرى]] و[[14|جوز الهند]] و[[15|الشمام]]، ثم عدنا إلى البيت لنغسل الفاكهة ونتناولها.",
    "en": "I went to the market with my mother. We bought apples, bananas, oranges, and watermelon. I chose grapes, mangoes, pineapple, and strawberries for a fruit plate.\n\nWe also found peaches, kiwis, blueberries, mandarins, cherries, pears, coconuts, and melons. We took the fruit home, washed it, and ate it together."
  },
  "vegetables": {
    "ar": "نعدّ السلطة باستخدام [[0|الطماطم]] و[[1|الخيار]] و[[2|الجزر]] و[[3|الخس]]. ثم نضيف قليلًا من [[7|البازلاء]] و[[10|الزيتون]] و[[8|الفلفل الرومي]]، ويمكن لمن يحب الطعام الحار أن يضيف [[9|الشطة]].\n\nفي المطبخ نطهو [[4|البطاطس]] مع [[5|البصل]] و[[6|الثوم]]. وأحيانًا نعدّ طبقًا من [[11|الذرة]] و[[12|الباذنجان]] و[[13|القرنبيط]] و[[14|البطاطا الحلوة]] و[[15|عيش الغراب]].",
    "en": "We make a salad with tomatoes, cucumbers, carrots, and lettuce. We add peas, olives, and bell peppers. People who like spicy food can add chili.\n\nIn the kitchen we cook potatoes with onions and garlic. Sometimes we prepare a dish with corn, eggplant, cauliflower, sweet potatoes, and mushrooms."
  },
  "key_phrases": {
    "ar": "يدخل [[9|الطالب]] الفصل، ويحيّيه [[10|المعلم]]. يفتح [[3|كتابه]] و[[4|دفتره]]، ثم يكتب باستخدام [[0|قلم]] أو [[1|قلم رصاص]]. ويستعمل [[2|قلم تلوين]] لرسم صورة. إذا أخطأ يستخدم [[5|الممحاة]]، وإذا انكسر سن القلم يستخدم [[6|المبراة]].\n\nيكتب المعلم على [[7|السبورة]] ويضع الكتاب فوق [[8|الطاولة]]. وعندما يقول للطالب: [[14|قِف]]، يقف، ثم يجلس عند سماع [[15|اجلس]]. وبعد الإجابة الصحيحة يسمع: [[12|أحسنت]]، عملك [[13|رائع]]! وعندما يحتاج إلى الذهاب إلى [[11|الحمام]] يطلب الإذن.",
    "en": "A student enters the classroom and greets the teacher. The student opens a book and notebook, writes with a pen or pencil, and draws with a colored pencil. An eraser fixes mistakes and a sharpener sharpens a pencil.\n\nThe teacher writes on the board and puts the book on the table. Students follow instructions to stand and sit. The teacher says “well done” and “wonderful” after a correct answer. A student asks permission to use the bathroom."
  },
  "survival": {
    "ar": "في مدرستنا ندرس [[0|اللغة العربية]] و[[1|اللغة الإنجليزية]] و[[2|اللغة الفرنسية]]، ونتعلم في [[3|العلوم]] كيفية إجراء التجارب، وفي [[4|الرياضيات]] كيفية حل المسائل. كما ندرس [[5|التربية الإسلامية]] و[[6|التربية الأخلاقية]] و[[7|الدراسات الاجتماعية]].\n\nنرسم في حصة [[8|الفن]] ونعزف في حصة [[9|الموسيقى]]، ونلعب في حصة [[10|التربية الرياضية]]، ونتعلم البرمجة في حصة [[11|الحاسب الآلي]]. يبدأ يومنا [[12|بطابور الصباح]]، ونستمع إلى [[13|النشيد الوطني]] و[[14|الإذاعة المدرسية]]. ثم تأتي [[15|الاستراحة]] لنتناول طعامنا.",
    "en": "At school we study Arabic, English, and French. In science we conduct experiments, and in mathematics we solve problems. We also study Islamic education, moral education, and social studies.\n\nWe draw in art, play music, exercise in physical education, and use computers in IT. Our day begins with the morning assembly, national anthem, and school broadcast. Then we have a break."
  },
  "time": {
    "ar": "سألت أمي: كم [[0|الساعة الآن]]؟ فقالت إن الوقت [[1|الواحدة]] بعد الظهر. يبدأ التدريب عند [[2|الثانية]] وينتهي عند [[3|الثالثة]]، ثم نزور جدتي عند [[4|الرابعة]]. نتناول وجبة خفيفة عند [[5|الخامسة]] ونعود إلى البيت عند [[6|السادسة]].\n\nفي يوم المدرسة أستيقظ عند [[7|السابعة]] [[14|صباحًا]]، وتبدأ الحصة عند [[8|الثامنة]]، ثم تأتي حصة أخرى عند [[9|التاسعة]] و[[10|العاشرة]]. نأخذ استراحة عند [[11|الحادية عشرة]]، ونتناول الغداء عند [[12|الثانية عشرة]] [[13|والنصف]]. أما في العطلة فنزور أقاربنا عند السابعة [[15|مساءً]].",
    "en": "I asked my mother for the time. It was one o’clock in the afternoon. Training begins at two and ends at three. We visit Grandma at four, eat a snack at five, and return home at six.\n\nOn school days I wake up at seven in the morning. Classes start at eight, followed by lessons at nine and ten. We have a break at eleven and lunch at half past twelve. On holidays we visit relatives at seven in the evening."
  },
  "weather": {
    "ar": "تتعاقب [[2|فصول]] السنة الأربعة، ولكل [[1|فصل]] طقسه الخاص: [[3|الربيع]] و[[4|الصيف]] و[[5|الخريف]] و[[6|الشتاء]]. [[0|أنا أفضّل]] الربيع لأن الجو فيه [[9|معتدل]]، أما في الصيف فيكون الجو [[7|حارًا]]، وقد يكون [[13|رطبًا]].\n\nفي الشتاء يصبح الجو [[8|باردًا]]، وقد نشاهد [[12|الثلج]] في بعض البلدان. أحيانًا يكون الطقس [[10|عاصفًا]] أو [[11|ممطرًا]]، وقد تكون السماء [[14|غائمة]] أو يكون الصباح [[15|ضبابيًا]].",
    "en": "We learn about the four seasons: spring, summer, autumn, and winter. I prefer spring because the weather is mild. Summer can be hot and humid.\n\nWinter can be cold and snowy in some countries. The weather may be windy or rainy. The sky may be cloudy, and mornings may be foggy."
  },
  "instructions": {
    "ar": "تبدأ [[14|السنة]] الجديدة في [[0|يناير]]، ثم يأتي [[1|فبراير]] و[[2|مارس]]. وفي [[3|أبريل]] و[[4|مايو]] يعتدل الجو في بعض البلاد، ثم تبدأ العطلة في [[5|يونيو]]. نخطط للسفر في [[6|يوليو]] والعودة في [[7|أغسطس]].\n\nيبدأ العام الدراسي عادة في [[8|سبتمبر]]، ثم يأتي [[9|أكتوبر]] و[[10|نوفمبر]] و[[11|ديسمبر]]. كل [[12|شهر]] جزء من اثني عشر شهرًا، وتتعاقب [[13|الشهور]] خلال العام. وبعد مرور [[15|سنين]] نتذكر أجمل أيام الطفولة.",
    "en": "The new year begins in January, followed by February and March. The weather becomes mild in some places in April and May. Holidays may begin in June. We plan to travel in July and return in August.\n\nThe school year often starts in September, followed by October, November, and December. Every month is one of twelve months. Many years later, we remember our childhood."
  },
  "colours": {
    "ar": "سألتُ الرسام: ما اسم [[0|هذا اللون]]؟ فأشار إلى وردة [[1|حمراء]]، وبرتقالة [[2|برتقالية]]، وشمس [[3|صفراء]]، وشجرة [[4|خضراء]]، وسماء [[5|زرقاء]]، وزهرة [[6|بنفسجية]].\n\nرسمتُ قطة [[7|سوداء]] قرب منزل [[8|أبيض]]، وبابًا [[9|بنيًا]] ووردة [[10|وردية]]. ولونتُ البحر [[11|بالأزرق الفاتح]]، والغيوم [[12|بالرمادي]]. أصبح الرسم [[13|ملونًا]]، وبعض أجزائه بلون [[14|فاتح]]، وبعضها بلون [[15|غامق]].",
    "en": "I asked the painter about colors. He pointed to a red flower, an orange fruit, a yellow sun, a green tree, a blue sky, and a purple flower.\n\nI drew a black cat near a white house, a brown door, and a pink rose. I used light blue for the sea and gray for the clouds. The picture became colorful with both light and dark shades."
  },
  "animals": {
    "ar": "في حديقة الحيوان رأيت [[0|أسدًا]] و[[1|نمرًا]] و[[2|فهدًا]] سريعًا و[[3|ذئبًا]]. ثم شاهدتُ [[4|زرافة]] طويلة و[[5|حمارًا وحشيًا]] و[[6|ثعلبًا]] و[[7|فيلًا]] ضخمًا.\n\nوفي القسم الآخر كانت هناك [[8|قطة]] و[[9|كلب]] أليفان، و[[10|خروف]] و[[11|ماعز]] و[[12|جمل]] و[[13|حصان]] و[[14|حمار]] و[[15|بقرة]]. تعلَّمنا أن الحيوانات تختلف في غذائها وبيئتها.",
    "en": "At the zoo I saw a lion, tiger, cheetah, wolf, giraffe, zebra, fox, and elephant.\n\nIn another area I saw a cat, dog, sheep, goat, camel, horse, donkey, and cow. We learned that animals differ in their food and habitats."
  },
  "birds": {
    "ar": "في رحلة الطبيعة شاهدنا [[0|نسرًا]] يحلّق عاليًا و[[2|بومة]] فوق شجرة، ثم رأينا [[3|طاووسًا]] و[[4|فلامينجو]] قرب الماء. كان [[5|عصفور]] يغني و[[6|حمامة]] تقف على السور، بينما يتجول [[7|ديك رومي]] في الحقل.\n\nفي المزرعة رأينا [[8|دجاجة]] مع [[9|ديك]] و[[10|صوص]] صغير، وبجانب البركة [[11|بطة]] و[[12|أوزة]]. وفي مركز الطيور شاهدنا [[13|ببغاء]] و[[14|بجعةً]] و[[15|بطريقًا]]. وشاهدنا [[1|صقرًا]] قويًا يراقب الحقل من أعلى شجرة.",
    "en": "On a nature trip we saw an eagle and an owl, then a peacock and flamingo near the water. A sparrow sang, a pigeon stood on a wall, and a turkey moved nearby.\n\nAt a farm we saw a hen, rooster, chick, duck, and goose. At the bird center we saw a parrot, swan, and penguin. We also spotted a falcon watching the field from a tree."
  },
  "fish_creatures": {
    "ar": "في متحف البحر رأينا مجسمًا [[0|لحوت]] ضخم و[[1|لقرش]] و[[2|لدولفين]] و[[3|لفقمة]]. وفي حوض الماء شاهدنا [[4|أخطبوطًا]] و[[8|حبارًا]] و[[9|قنديل البحر]] و[[10|محارًا]] و[[11|حلزونًا بحريًا]] و[[12|دودة بحرية]].\n\nوفي قسم الأطعمة البحرية تعرَّفنا إلى [[5|الجمبري]] و[[6|الاستاكوزا]] و[[7|الكابوريا]]، وشاهدنا طبق [[13|السوشي]]. وفي النهاية رأينا [[14|سنارة]] للصيد وحوضًا فيه [[15|سمكة زينة]] ملونة.",
    "en": "At the sea museum we saw models of a whale, shark, dolphin, and seal. In the aquarium we saw an octopus, squid, jellyfish, shellfish, sea snail, and marine worm.\n\nIn the seafood section we learned about shrimp, lobster, and crab, and saw a sushi dish. Finally, we saw a fishing rod and a colorful ornamental fish."
  },
  "insects_reptiles": {
    "ar": "في الحديقة وقفت [[0|فراشة]] فوق زهرة، وحلّقت [[1|نحلة]] قربها. كانت [[2|نملة]] تحمل طعامًا، ومرّت [[3|ذبابة]] و[[4|بعوضة]] و[[5|جرادة]]، بينما اختبأ [[6|صرصور]] تحت ورقة. وعلى الغصن شاهدنا [[7|خنفساء]] و[[8|يرقة]]، وبالقرب منهما [[9|دعسوقةً]] على ورقة خضراء.\n\nفي قسم الزواحف رأينا [[10|ثعبانًا]] و[[11|سلحفاة]] و[[12|تمساحًا]] و[[13|سحلية]]، ثم شاهدنا [[14|وزغًا]] يتسلق جدارًا، و[[15|حرباء]] تغيّر لونها بين النباتات.",
    "en": "In the garden a butterfly landed on a flower and a bee flew nearby. We saw an ant, fly, mosquito, grasshopper, cockroach, beetle, caterpillar, and ladybug.\n\nIn the reptile area we saw a snake, turtle, crocodile, and lizard, then a gecko climbing a wall and a chameleon changing color among the plants."
  },
  "places": {
    "ar": "في مدينتي [[0|مدرسة]] و[[1|مستشفى]] و[[2|مطعم]] و[[3|فندق]] و[[4|صيدلية]]. وعند السفر نذهب إلى [[5|المطار]]. نشتري حاجاتنا من [[6|محل]] صغير أو [[7|سوبر ماركت]] كبير.\n\nفي العطلة نذهب إلى [[8|المسرح]] أو [[9|السينما]] أو [[10|السيرك]]. ونقضي وقتًا على [[11|الشاطئ]] أو في [[12|مدينة الألعاب]]، وقد نشاهد مباراة في [[13|الاستاد]]، أو نزور [[14|حديقة الحيوان]] و[[15|المتحف]].",
    "en": "My city has a school, hospital, restaurant, hotel, and pharmacy. When traveling, we go to the airport. We shop in a small store or large supermarket.\n\nOn holidays we visit the theater, cinema, or circus. We may go to the beach or amusement park, watch a match at the stadium, or visit the zoo and museum."
  },
  "sports": {
    "ar": "في النادي يلعب صديقي [[0|كرة القدم]]، وتلعب أختي [[1|كرة السلة]]، ويشاهد أخي [[2|البيسبول]]. أما أنا فأحب [[3|التنس]] و[[4|الكرة الطائرة]] و[[5|تنس الطاولة]] و[[6|الريشة الطائرة]].\n\nفي الصالة نتدرب على [[7|الملاكمة]] و[[8|المصارعة]] و[[9|رفع الأثقال]]. وفي الخارج نمارس ركوب [[10|الدراجات]] و[[11|السباحة]] و[[12|التزلج]]. وفي المسابقات نشاهد [[13|سباق الخيل]] و[[14|الجمباز]] ورياضة [[15|التسلق]].",
    "en": "At the club my friend plays football, my sister plays basketball, and my brother watches baseball. I like tennis, volleyball, table tennis, and badminton.\n\nAt the gym we practice boxing, wrestling, and weightlifting. Outdoors we ride bikes, swim, and skate. At competitions we watch horse racing, gymnastics, and climbing."
  },
  "transport": {
    "ar": "ذهبت إلى المدرسة في [[0|سيارة]] أبي، وشاهدت [[1|سيارة أجرة]] و[[2|حافلة]] في الطريق. ثم مرّت [[3|سيارة شرطة]] و[[4|سيارة إسعاف]] و[[5|سيارة إطفاء]] بجوار [[6|شاحنة]] كبيرة. وفي الحديقة رأيت طفلًا يركب [[7|سكوترًا]] وآخر يركب [[8|دراجة]]، وبالقرب منهما [[9|دراجة نارية]].\n\nفي رحلة أخرى ركبنا [[10|قطارًا]] ثم [[11|المترو]]، وشاهدنا [[12|التلفريك]] فوق الجبل. وعند الميناء رأينا [[13|سفينة]] و[[15|قاربًا شراعيًا]]، وفي السماء حلّقت [[14|طائرة]].",
    "en": "I went to school in my father's car and saw a taxi and bus. A police car, ambulance, and fire engine passed a truck. At the park I saw a child on a scooter, another on a bicycle, and a motorcycle nearby.\n\nOn another trip we took a train and the metro and saw a cable car above the mountain. At the harbor we saw a ship and a sailboat, while a plane flew overhead."
  },
  "jobs": {
    "ar": "في المستشفى يعمل [[0|طبيب]] و[[1|ممرض]]. وفي الشارع يساعدنا [[2|شرطي]]، ويطفئ الحرائق [[3|رجل إطفاء]]. وفي المزرعة يعمل [[4|مزارع]]، وفي المطعم [[5|طباخ]]. ويبني البيوت [[6|مهندس]] مع [[7|عامل]].\n\nفي المدرسة يشرح الدرس [[8|معلم]]، وفي المختبر يبحث [[9|عالم]] عن اكتشاف جديد. ويصمم البرامج [[10|مبرمج]]، ويقود الطائرة [[11|طيار]]، ويسافر إلى الفضاء [[12|رائد فضاء]]. وفي المحكمة يعمل [[13|قاضٍ]]، ويرسم اللوحات [[14|فنان]]، ويصلح الأنابيب [[15|سباك]].",
    "en": "A doctor and nurse work at the hospital. A police officer helps us in the street, and a firefighter puts out fires. A farmer works on a farm, a cook in a restaurant, and an engineer builds houses with workers.\n\nA teacher gives lessons, a scientist makes discoveries, a programmer writes software, a pilot flies planes, and an astronaut travels to space. A judge works in court, an artist paints, and a plumber repairs pipes."
  },
  "shopping": {
    "ar": "ذهبنا إلى [[0|المول]] ودخلنا من [[13|المدخل]] القريب من [[15|موقف السيارات]]. صعدنا باستخدام [[14|المصعد]]، ثم أخذنا [[1|عربة تسوق]] و[[2|سلة تسوق]] للأشياء الصغيرة. وجدنا [[6|تخفيضات]] كثيرة بعد قراءة [[9|إعلان العروض]]، وساعدنا [[7|موظف المبيعات]].\n\nدفعنا عند [[4|الصندوق]] باستخدام [[10|النقود]] أو [[11|بطاقة الدفع]]، ثم أخذنا [[12|الإيصال]] ووضعنا المشتريات في [[3|أكياس التسوق]]. بعد ذلك ذهبنا إلى ركن [[5|تغليف الهدايا]]. وفي البيت جرّبنا [[8|التسوق الإلكتروني]] لشراء كتاب.",
    "en": "We went to the mall and entered near the parking lot. We took the elevator, then a shopping cart and basket. We found discounts advertised on a sale poster, and a sales assistant helped us.\n\nAt checkout we paid with cash or a payment card, took the receipt, and packed our purchases in shopping bags. Then we visited gift wrapping. Later we tried online shopping for a book."
  },
  "health": {
    "ar": "في العيادة فحص الطبيب الطفل باستخدام [[2|سماعة الطبيب]] و[[3|ميزان الحرارة]]. أعطاه [[0|دواءً]]، وقد يحتاج بعض المرضى إلى [[1|إبرة]]. وأوضح لنا أن [[5|الجراثيم]] قد تسبب المرض، لذلك نستخدم [[6|المعقم]] ونضع [[7|لاصقًا طبيًا]] على الجرح الصغير إذا احتجنا.\n\nتعلمنا في درس العلوم أن [[4|الدم]] يسير في الجسم بفضل [[9|القلب]]، وأن [[10|الرئتين]] تساعدان على التنفس، وأن [[11|الدماغ]] يتحكم في وظائف كثيرة. ونحافظ على كل [[12|سن]] ونحمي كل [[13|عظم]]. وعند الطوارئ نطلب [[8|سيارة إسعاف]]، وقد يستخدم بعض الناس [[14|كرسيًا متحركًا]] أو [[15|عكازًا]] للتنقل.",
    "en": "At the clinic a doctor examined a child with a stethoscope and thermometer. The child received medicine, and some patients may need an injection. We learned that germs can cause illness, so we use sanitizer and a medical bandage when needed.\n\nIn science we learned that blood flows thanks to the heart, lungs help us breathe, and the brain controls many functions. We care for our teeth and bones. In emergencies we call an ambulance, and some people use wheelchairs or crutches to move."
  },
  "tech": {
    "ar": "أستخدم [[0|هاتفًا ذكيًا]] للاتصال، وفي المنزل لدينا [[1|حاسوب]] مكتبي و[[2|لابتوب]]. أكتب على [[3|لوحة المفاتيح]] وأحرّك المؤشر باستخدام [[4|الفأرة]]، ثم أطبع ورقتي على [[5|الطابعة]]. شاهدت في المتحف [[6|قرصًا مرنًا]] قديمًا و[[7|قرصًا مدمجًا]].\n\nألتقط الصور [[8|بالكاميرا]] وأسجّل المقاطع باستخدام [[9|كاميرا الفيديو]]. وإذا ضعفت [[10|إشارة]] الشبكة أفحص اتصال [[12|الواي فاي]]. أضع [[11|الشاحن]] في الكهرباء عندما تضعف [[13|البطارية]]، ثم أراجع [[14|الإعدادات]]. ونتعلم كيف يساعدنا [[15|الذكاء الاصطناعي]] في بعض المهام.",
    "en": "I use a smartphone, desktop computer, and laptop. I type with a keyboard, move the pointer with a mouse, and print pages with a printer. At a museum I saw an old floppy disk and compact disc.\n\nI take photos with a camera and record video with a video camera. If the signal is weak I check Wi-Fi. I connect the charger when the battery is low, review the settings, and learn how artificial intelligence can help."
  },
  "nature": {
    "ar": "في رحلتنا رأينا [[0|شجرة]] كبيرة داخل [[1|غابة]]، وبجانبها [[2|نخلة]] و[[3|صبار]] و[[4|نبات]] صغير. سقطت [[5|ورقة شجر]] قرب حقل [[6|القمح]]، وعلى الطريق كانت [[7|زهرة]] صفراء و[[8|زهرة دوّار الشمس]].\n\nصعدنا [[9|جبلًا]] ووقفنا على [[10|تلة]] قريبة، ثم شاهدنا صورة [[11|لجبل بركاني]]. مررنا [[12|بوادٍ]] جميل، ووصلنا إلى [[13|شاطئ]] [[14|جزيرة]] صغيرة تطل على [[15|البحر]].",
    "en": "On our trip we saw a tree in a forest, along with a palm tree, cactus, and small plant. A leaf fell beside a wheat field, and we saw a flower and a sunflower.\n\nWe climbed a mountain and stopped on a hill, then saw a picture of a volcano. We crossed a valley and reached the beach of a small island overlooking the sea."
  },
  "music": {
    "ar": "في غرفة الموسيقى عزف طالب على [[0|البيانو]] وآخر على [[1|الغيتار]]، وعزفت طالبة على [[2|الكمان]]. سمعت إيقاع [[3|الطبول]] وصوت [[4|الساكسفون]] و[[5|الترومبيت]] و[[6|الأكورديون]].\n\nاستخدم الأطفال [[7|الماراكاس]] و[[8|البانجو]] و[[9|البوق]] و[[10|الناي]]، وعلّقوا [[11|أجراس الرياح]] قرب النافذة. قرأ المعلم [[12|نوتة موسيقية]]، ثم تحدث في [[13|الميكروفون]]، ووصل الصوت عبر [[14|مكبر الصوت]] بعد تشغيل [[15|نظام الصوت]].",
    "en": "In the music room, students played the piano, guitar, and violin. We heard drums, saxophone, trumpet, and accordion.\n\nThe children used maracas, banjo, horn, and flute, and hung wind chimes near the window. The teacher read a music score and spoke into a microphone. We heard the sound through a speaker and sound system."
  },
  "travel": {
    "ar": "في المطار حملت [[6|حقيبة سفر]] كبيرة و[[7|حقيبة ظهر]] صغيرة، وكان مع أبي [[8|حقيبة عمل]] ومع أمي [[9|حقيبة يد]]. أظهرت [[10|جواز السفر]] و[[14|التذكرة]]، ثم سلّمنا [[11|الأمتعة]] وتأكدنا من الطريق على [[15|الخريطة]].\n\nجلست في [[5|مقعد الطائرة]]، ورحبت بنا [[4|مضيفة الطيران]]، ثم أعلن [[3|الطيار]] موعد [[1|الإقلاع]]. حدث [[13|تأخير]] قصير، وبعد ذلك أقلعت [[0|الطائرة]] بأمان. وعند [[2|الهبوط]] اتجهنا إلى استلام الحقائب ثم مررنا على [[12|الجمارك]].",
    "en": "At the airport I carried a suitcase and backpack. My father had a briefcase and my mother a handbag. I showed my passport and ticket, checked in our luggage, and looked at a map.\n\nI sat in my airplane seat. A flight attendant greeted us, and the pilot announced takeoff. There was a short delay, but the plane departed safely. After landing we collected our bags and went through customs."
  }
};
