export interface StoryCassette {
  id: string;
  titleAr: string;
  titleEn: string;
  category: 'values' | 'society' | 'science' | 'heritage';
  categoryAr: string;
  categoryEn: string;
  audioSrc: string;
  tapeColor: string;
  labelBgColor?: string;
  labelTextColor?: string;
  accentColor?: string;
  vintageBrand?: string;
  modelCode?: string;
  year?: string;
  cassetteNumber: string;
  durationApprox: string;
  summaryAr: string;
  moralLessonAr: string;
  keyVocab: { word: string; meaning: string }[];
  paragraphs: string[];
  /** Verified word-level alignment against the actual audio, in seconds. */
  wordTimings?: { startTime: number; endTime: number }[];
}

export const STORY_CASSETTES: StoryCassette[] = [
  {
    id: 'shepherd-lion',
    titleAr: 'الراعي والأسد الوفي',
    titleEn: 'The Shepherd and the Loyal Lion',
    category: 'values',
    categoryAr: 'حكايات وقيم',
    categoryEn: 'Moral Tales',
    audioSrc: '/assets/aistudio/___________dbf86190.mp3',
    tapeColor: 'from-amber-600 via-yellow-600 to-amber-800',
    labelBgColor: 'bg-amber-50',
    labelTextColor: 'text-amber-950',
    accentColor: '#d97706',
    vintageBrand: 'PHILIPS',
    modelCode: 'UC-II 90',
    year: '1975',
    cassetteNumber: 'C-01',
    durationApprox: '02:44',
    summaryAr: 'راعي أغنام ينقذ أسداً مصاباً بنزع شوكة من كفه، وتدور الأيام ليقع الراعي في الأسر ويواجه الأسد في حلبة المبارزة، فماذا سيفعل الأسد؟',
    moralLessonAr: 'صنائع المعروف لا تضيع أبداً؛ فالإحسان يُثمر وفاءً ومودة حتى في أشد المواقف خطورة.',
    keyVocab: [
      { word: 'ذعر', meaning: 'خوف شديد وفزع مفاجئ' },
      { word: 'أمعن النظر', meaning: 'دقق وتأمل بتركيز شديد' },
      { word: 'ضراوة', meaning: 'شجاعة وقوة وشدة في الدفاع' }
    ],
    paragraphs: [
      'في إحدى البلاد البعيدة، وبينما كان أحد الرعاة يرعى أغنامه في أحد الأيام، تفاجأ على غير العادة أن أغنامه تركض بذعر وخوف في جميع الاتجاهات.',
      'التفت الراعي ليجد أسداً كبيراً مرعباً يتقدم نحوه، فخاف الراعي كثيراً وعلم أنه ميت لا محالة.',
      'لكن الأسد لم يهجم عليه، بل تقدم منه رافعاً يده، فلما أمعن الراعي النظر وجد شوكة مغروزة في يد الأسد، ففهم أن الأسد يطلب مساعدته فنزعها.',
      'مضت سنوات، وتعرضت أرض الراعي لغزو الأعداء ووقع أسيراً، وحين استُدعي للمبارزة واجه أسداً جائعاً، فإذا به الأسد ذاته يدافع عنه ويجلس بجواره وفاءً لجميله!'
    ]
  },
  {
    id: 'civil-defense-heroes',
    titleAr: 'أبطال الدفاع المدني (حريق في المطبخ)',
    titleEn: 'Heroes of Civil Defense',
    category: 'society',
    categoryAr: 'الأسرة والمجتمع',
    categoryEn: 'Family & Society',
    audioSrc: '/assets/aistudio/__________________b4ea8fcc.mp3',
    tapeColor: 'from-rose-600 via-red-600 to-red-800',
    labelBgColor: 'bg-rose-50',
    labelTextColor: 'text-rose-950',
    accentColor: '#e11d48',
    vintageBrand: 'BASF',
    modelCode: 'FERRO EXTRA 90',
    year: '1976',
    cassetteNumber: 'C-02',
    durationApprox: '02:04',
    summaryAr: 'موقف بطولي أثناء اندلاع حريق في المطبخ، وسرعة استجابة رجال الإطفاء والدفاع المدني لإنقاذ العائلة وتنظيم الإخلاء.',
    moralLessonAr: 'الهدوء وسرعة التصرف عند الطوارئ، وتقدير الدور العظيم الذي يبذله رجال الدفاع المدني في حماية الأرواح.',
    keyVocab: [
      { word: 'هبَّ الجيران', meaning: 'أسرعوا ونهضوا للمساعدة والنجدة' },
      { word: 'تتنحى جانباً', meaning: 'تفسح الطريق والمسار لسيارات الإسعاف' },
      { word: 'تقيهم', meaning: 'تحميهم وتدفع عنهم الأذى والحرارة' }
    ],
    paragraphs: [
      'ذات مساء، وبينما كنت في غرفتي ألعب بالرجل الآلي، انطلقت صفارة الإنذار في بيتنا، فظهرت أمي وأمسكت بيدي مسرعة: يجب أن نخرج، شب حريق في المطبخ!',
      'خرجنا إلى الحديقة والجيران يمدون يد المساعدة، واتصل أحدهم بالدفاع المدني والإسعاف على الفور.',
      'وصل رجال الإطفاء الأبطال يرتدون خوذاً وزياً موحداً، وبسرعة البرق فكوا خراطيم المياه ووجهوها صوب النيران حتى أخمِدت تماماً بفضل الله.',
      'شكرنا رجال الإطفاء فقالوا: هذا واجبنا الوطني، فنحن نعمل دائماً على خدمة أبناء مجتمعنا وسلامتهم.'
    ]
  },
  {
    id: 'apple-secrets',
    titleAr: 'أسرار وفوائد التفاح',
    titleEn: 'Secrets & Health Benefits of Apples',
    category: 'science',
    categoryAr: 'العلم والصحة',
    categoryEn: 'Science & Health',
    audioSrc: '/assets/aistudio/_______2cfbbbbd.mp3',
    tapeColor: 'from-emerald-600 via-teal-600 to-green-800',
    labelBgColor: 'bg-emerald-50',
    labelTextColor: 'text-emerald-950',
    accentColor: '#059669',
    vintageBrand: 'TDK',
    modelCode: 'SUPER D 90',
    year: '1977',
    cassetteNumber: 'C-03',
    durationApprox: '02:51',
    summaryAr: 'استكشاف علمي شيق لأنواع التفاح وفوائده الغذائية والوقائية العجيبة للجسم والمناعة ومكافحة السموم.',
    moralLessonAr: '«تفاحة كل يوم تغنيك عن زيارة الطبيب»؛ الغذاء الصحي الطبيعي هو خط الدفاع الأول لصحة الإنسان.',
    keyVocab: [
      { word: 'دائمة الخضرة', meaning: 'أشجار تظل أوراقها خضراء طوال فصول العام' },
      { word: 'مضادات الأكسدة', meaning: 'عناصر طبيعية تحمي خلايا الجسم من الأمراض والتلف' },
      { word: 'البكتين', meaning: 'ألياف نباتية مفيدة جداً لصحة المعدة والهضم' }
    ],
    paragraphs: [
      'التفاح من الأشجار المباركة التي تحمل ثماراً بألوان متعددة: الأخضر والأصفر والأحمر، وتختلف نكهاته بين الحامض والحلو المنعش.',
      'المثل الشعبي العالمي يقول: تناول تفاحة كل يوم يغنيك عن الذهاب للطبيب، وذلك لقيمته الغذائية الفريدة في طرد السموم وتقوية مناعة الجسم.',
      'تحتوي قشور التفاح على نسب عالية من مضادات الأكسدة والألياف، مما يجعله صديقاً لصحة القلب والمفاصل والجهاز الهضمي.'
    ]
  },
  {
    id: 'wheat-grain-wisdom',
    titleAr: 'حكمة حبة القمح والعصفورين',
    titleEn: 'The Wisdom of the Wheat Grain',
    category: 'values',
    categoryAr: 'حكايات وقيم',
    categoryEn: 'Moral Tales',
    audioSrc: '/assets/aistudio/_____________________9825072e.mp3',
    tapeColor: 'from-yellow-600 via-amber-500 to-orange-700',
    labelBgColor: 'bg-amber-100/70',
    labelTextColor: 'text-amber-950',
    accentColor: '#d97706',
    vintageBrand: 'MAXELL',
    modelCode: 'UD-XL II 90',
    year: '1978',
    cassetteNumber: 'C-04',
    durationApprox: '04:00',
    summaryAr: 'حوار فلسفي طريف بين حبة قمح حكيمة وعصفورين جائعين، يعلمهما درساً خالداً في التخطيط للمستقبل والاستثمار الزراعي.',
    moralLessonAr: 'لا تستهلك كل ما تملك في اللحظة الراهنة؛ بل استثمر جزءاً للمستقبل لتجني أضعافاً مضاعفة.',
    keyVocab: [
      { word: 'الحوصلة', meaning: 'مكان تخزين الطعام في حلق الطائر' },
      { word: 'تدّخران', meaning: 'تجمعان وتوفران للغد والأيام القادمة' },
      { word: 'سنابل', meaning: 'جمع سنبلة، وهي رأس ساق القمح المليء بالحبوب' }
    ],
    paragraphs: [
      'وجدت حبة قمح نفسها وحيدة على الأرض يوم الحصاد، وسمعت عصفورين يتحدثان على فرع شجرة قريبة جائعين يريدان التقاطها.',
      'قالت الحبة بذكاء: أنا حبة صغيرة لن تشبعكما، احملاني وضعاني عند حافة القناة حيث يجري الماء، وسأكبر وأصبح شجرة قمح خضراء مليئة بالسنابل!',
      'أعجب العصفوران بالفكرة وغرساها، ولما نمت نصحتهما الحبة بتقسيم المحصول: ثلث للأكل، وثلث للزميل، وثلث يدخر في الأرض للمستقبل.'
    ]
  },
  {
    id: 'neighbor-rights',
    titleAr: 'أصدقاء الحي وحق الجار',
    titleEn: 'Neighborhood Friends & Rights of Neighbors',
    category: 'society',
    categoryAr: 'الأسرة والمجتمع',
    categoryEn: 'Family & Society',
    audioSrc: '/assets/aistudio/_____________________69407c3c.mp3',
    tapeColor: 'from-blue-600 via-indigo-600 to-slate-800',
    labelBgColor: 'bg-blue-50',
    labelTextColor: 'text-blue-950',
    accentColor: '#2563eb',
    vintageBrand: 'SONY',
    modelCode: 'HF-S 90',
    year: '1980',
    cassetteNumber: 'C-05',
    durationApprox: '03:00',
    summaryAr: 'مباراة كرة قدم بين أولاد الحي تسقط فيها الكرة في فناء الجيران، فيتعلم الأصدقاء درساً عظيماً في أدب الاستئذان وحقوق الجار.',
    moralLessonAr: 'الجار له حرمة ومكانة رفيعة في ديننا؛ والأدب والاحترام والاعتذار من شيم الفرسان الصالحين.',
    keyVocab: [
      { word: 'فناء', meaning: 'الساحة المفتوحة التابعة للمنزل' },
      { word: 'طأطأ رأسه', meaning: 'خفض رأسه خجلاً وحياءً واعترافاً بالخطأ' },
      { word: 'كف الأذى', meaning: 'منع الضرر والإزعاج عن الآخرين' }
    ],
    paragraphs: [
      'كانت أمتع الأوقات عند أولاد الحي عندما يجتمعون ويلعبون الكرة، لكن الكرة سقطت في فناء بيت الجار أبي عبد الله.',
      'ذهب راشد أولاً واستأذن بلطف وأدب قائلاً: السلام عليكم يا عم، هل تسمح لي باستعادة الكرة؟ فابتسم الجار وأعطاه إياها.',
      'ثم سقطت الكرة مرة أخرى، فذهب خالد وطرق الباب بعنف وصراخ، فنبهه الجار بحكمة: أهكذا نكلم من هم أكبر منا سناً؟ ألا تعلم حقوق الجار؟ فخجل خالد واعتذر ووعد بحفظ حقوق الجيران.'
    ]
  },
  {
    id: 'farmer-company-manager',
    titleAr: 'المزارعة الذكية ومدير الشركة',
    titleEn: 'The Smart Farmer and the Company Manager',
    category: 'values',
    categoryAr: 'حكايات وقيم',
    categoryEn: 'Moral Tales',
    audioSrc: '/assets/aistudio/______________________b74697b9.mp3',
    tapeColor: 'from-purple-600 via-fuchsia-700 to-purple-900',
    labelBgColor: 'bg-purple-50',
    labelTextColor: 'text-purple-950',
    accentColor: '#9333ea',
    vintageBrand: 'AGFA',
    modelCode: 'SUPER COLOR 60',
    year: '1982',
    cassetteNumber: 'C-06',
    durationApprox: '02:59',
    summaryAr: 'سيدة قروية ترفض إدخال الكهرباء إلى منزلها، لكن مدير الشركة الذكي يستخدم أسلوب الإقناع بالمنفعة ليركب لها المصباح وتضاعف إنتاجها.',
    moralLessonAr: 'الإقناع الهادئ القائم على فهم مصلحة الطرف الآخر يفتح الأبواب المغلقة أكثر من الجدال والفرض.',
    keyVocab: [
      { word: 'نائية', meaning: 'بعيدة عن العمران والمدن' },
      { word: 'تفتقر', meaning: 'تحتاج بشدة وتخلو من الخدمات' },
      { word: 'انفرجت أساريره', meaning: 'ظهر السرور والانشراح على ملامح وجهه' }
    ],
    paragraphs: [
      'عاشت سيدة في قرية نائية تربي دجاجات وتبيع بيضها، وكانت ترفض دخول الكهرباء لمنزلها وتغلق الباب في وجه ممثلي الشركة.',
      'ذهب مدير الشركة إليها ولم يقل لها اشتركي في الكهرباء، بل اشترى كل ما لديها من بيض، وقال لها: دجاجاتك ممتازة، ولدي فكرة تجعلكِ تكسبين أضعاف ذلك!',
      'اقترح عليها تركيب مصباح كهربائي واحد في الحظيرة لتصحو الدجاجات مدة أطول وتضاعف الإنتاج، فاقتنعت المزارعة ووصلت الكهرباء لكوخها بنجاح.'
    ]
  },
  {
    id: 'palm-tree-emirates',
    titleAr: 'سيدة الشجر: نخلة الإمارات',
    titleEn: 'The Palm Tree: Heritage of the UAE',
    category: 'heritage',
    categoryAr: 'تراث وهوية',
    categoryEn: 'Heritage & Identity',
    audioSrc: '/assets/aistudio/____________bd80264b.mp3',
    tapeColor: 'from-amber-700 via-yellow-700 to-emerald-900',
    labelBgColor: 'bg-stone-100',
    labelTextColor: 'text-amber-950',
    accentColor: '#b45309',
    vintageBrand: 'SCOTCH',
    modelCode: 'MASTER III 90',
    year: '1984',
    cassetteNumber: 'C-07',
    durationApprox: '02:44',
    summaryAr: 'قصة النخلة المباركة ومكانتها التاريخية في دولة الإمارات كرمز للكرم والبناء، وأنواع التمور الفاخرة كالخنيزي واللولو والإخلاص.',
    moralLessonAr: 'الاعتزاز بالتراث الوطني وشجرة النخيل المعطاءة التي كانت ولا تزال شريان الحياة في شبه الجزيرة العربية.',
    keyVocab: [
      { word: 'العريش', meaning: 'بيت تقليدي مصنوع من سعف النخيل وجذوعه' },
      { word: 'الخنيزي والإخلاص', meaning: 'من أشهر وأجود أنواع التمور في الخليج' },
      { word: 'عبق العراقة', meaning: 'رائحة الأصالة والتاريخ المجيد المتوارث' }
    ],
    paragraphs: [
      'تمثل النخلة في دولة الإمارات العربية المتحدة إرثاً تاريخياً وحضارياً، وقد ورد ذكر التمر ونخيله في القرآن الكريم 26 مرة.',
      'كانت النخلة غذاءً وملاذاً؛ جذوعها أعمدة للخيام، وسعفها مواد لبناء بيوت العريش ومختلف الأدوات المنزلية التراثية.',
      'واليوم تتصدر الإمارات المراتب العالمية في زراعة النخيل ومهرجانات الرطب، فالتمر رمز الكرم والضيافة العربية الأصيلة.'
    ]
  },
  {
    id: 'forehead-sweat-value',
    titleAr: 'عرق الجبين وقيمة العمل',
    titleEn: 'The Sweat of the Brow & Value of Work',
    category: 'values',
    categoryAr: 'حكايات وقيم',
    categoryEn: 'Moral Tales',
    audioSrc: '/assets/aistudio/___________8419d842.mp3',
    tapeColor: 'from-orange-700 via-amber-700 to-stone-900',
    labelBgColor: 'bg-orange-50',
    labelTextColor: 'text-stone-900',
    accentColor: '#c2410c',
    vintageBrand: 'TDK',
    modelCode: 'SA-90 HIGH BIAS',
    year: '1986',
    cassetteNumber: 'C-08',
    durationApprox: '03:38',
    summaryAr: 'فلاح يطلب من السلطان عملاً بعد انحباس المطر، ويطلب أن يكون أجره وزن منديله ذهباً، ليتعلم الجميع درساً مبهراً في وزن عرق الكدح الحلال.',
    moralLessonAr: 'العمل الشريف هو تاج الكرامة؛ وعرق الكدح والجهد المخلص أثقل في ميزان الحياة من كل ذهب الأرض.',
    keyVocab: [
      { word: 'ميسور الحال', meaning: 'كريم العيش وغني بما رزقه الله' },
      { word: 'تكسير الصخور', meaning: 'عمل شاق يتطلب قوة وعزيمة شديدة' },
      { word: 'لا يوزن بمثقال', meaning: 'قيمته أغلى وأثمن من أن تقاس بوزن مادي' }
    ],
    paragraphs: [
      'عاش فلاح ميسور الحال مع عائلته، وفي موسم الغرس انحبس المطر فخرج باحثاً عن مصدر رزق حتى وصل لقصر السلطان.',
      'عرض عليه السلطان تكسير الصخور بدينار ذهبي كل أسبوع، فاقترح الفلاح بدلاً من ذلك أن يزن منديله ذهباً في نهاية الأسبوع.',
      'عمل الفلاح بتفانٍ وإخلاص يمسح عرق جبينه بالمنديل طوال الأسبوع، وعند وضعه في الميزان رجحت كفة المنديل أمام عشرة دنانير ذهبية؛ لأن عرق العمل الصادق أثقل ما يكون!'
    ]
  },
  {
    id: 'school-radio-curlew',
    titleAr: 'كروان الإذاعة المدرسية',
    titleEn: 'The School Radio Star',
    category: 'society',
    categoryAr: 'الأسرة والمجتمع',
    categoryEn: 'Family & Society',
    audioSrc: '/assets/aistudio/____________________1a0a0b0e.mp3',
    tapeColor: 'from-cyan-600 via-sky-600 to-blue-800',
    labelBgColor: 'bg-sky-50',
    labelTextColor: 'text-sky-950',
    accentColor: '#0284c7',
    vintageBrand: 'PHILIPS',
    modelCode: 'SUPER FERRO 60',
    year: '1988',
    cassetteNumber: 'C-09',
    durationApprox: '01:58',
    summaryAr: 'تلميذ شغوف بالقراءة يخشى مواجهة الجمهور في طابور الصباح، لكن معلمه المخلص يدربه حتى أطلق عليه الجميع لقب "كروان الإذاعة".',
    moralLessonAr: 'الثقة بالنفس والتغلب على الخوف هما مفتاح إطلاق المواهب والتميز في الحياة المدرسية والعملية.',
    keyVocab: [
      { word: 'كروان', meaning: 'طائر يضرب به المثل في عذوبة الصوت وجماله' },
      { word: 'أتلعثم', meaning: 'أتردد في الكلام وتتعثر الكلمات على لساني' },
      { word: 'ضجت المدرسة', meaning: 'علت أصوات التصفيق الحار والتشجيع في أرجائها' }
    ],
    paragraphs: [
      'قال لي معلم اللغة العربية: أنت تلميذ متميز وأرشحك للتقديم في الإذاعة المدرسية، فشكرته لكني خشيت مواجهة مئات التلاميذ والأساتذة.',
      'طمأنني المعلم وقال: كن واثقاً من نفسك، كلنا مررنا بهذه التجربة، وتذكر أنك تملك موهبة حقيقية في القراءة.',
      'تدربت في غرفتي طوال الليل، وفي الصباح ألقيت كلمتي بثبات، فصفق لي الجميع حتى أطلقوا عليّ لقب «كروان الإذاعة»!'
    ]
  },
  {
    id: 'little-sister-love',
    titleAr: 'أختي الصغيرة وسر المحبة',
    titleEn: 'My Little Sister & The Secret of Love',
    category: 'society',
    categoryAr: 'الأسرة والمجتمع',
    categoryEn: 'Family & Society',
    audioSrc: '/assets/aistudio/_______________df689613.mp3',
    tapeColor: 'from-pink-600 via-rose-500 to-fuchsia-800',
    labelBgColor: 'bg-pink-50',
    labelTextColor: 'text-pink-950',
    accentColor: '#db2777',
    vintageBrand: 'FUJI',
    modelCode: 'GT-I 90',
    year: '1990',
    cassetteNumber: 'C-10',
    durationApprox: '02:59',
    summaryAr: 'مشاعر الغيرة الطبيعية لأخ عند قدوم مولودة جديدة تستحوذ على اهتمام المنزل، وتتحول الغيرة إلى حب عميق ومسؤولية لحمايتها ورعايتها.',
    moralLessonAr: 'المحبة الأسرية تتضاعف ولا تنقص بمجيء الإخوة الصغار؛ ورعايتهم شرف وسعادة للأخ الأكبر.',
    keyVocab: [
      { word: 'استحوذت', meaning: 'شغلت ونالت كامل الاهتمام والرعاية' },
      { word: 'يهوي إلى الأرض', meaning: 'يسقط من شدة الخوف والفزع على سلامتها' },
      { word: 'عبء', meaning: 'حمل وثقل في المسؤولية' }
    ],
    paragraphs: [
      'حينما عادت أمي من المستشفى تحمل أختي الصغيرة، شعرت بالغيرة لأنها استأثرت باهتمام الجميع ولم نعد نقرأ القصص سوياً.',
      'في أحد الأيام تركتني أمي معها، فاقتربت الطفلة من حافة السرير وكادت تسقط فأنقذتها في اللحظة الأخيرة!',
      'عندها أدركت كم أحبها وخفت عليها، وجلست أحكي لها قصصي المصورة، ولم تعد أختي عبئاً بل أصبحت صديقتي المقربة.'
    ]
  },
  {
    id: 'homeland-journey',
    titleAr: 'رحلة استكشاف في ربوع الوطن',
    titleEn: 'An Exploration Journey Across the Homeland',
    category: 'heritage',
    categoryAr: 'تراث وهوية',
    categoryEn: 'Heritage & Identity',
    audioSrc: '/assets/aistudio/_________dcf6d087.mp3',
    tapeColor: 'from-teal-600 via-emerald-600 to-amber-800',
    labelBgColor: 'bg-emerald-50',
    labelTextColor: 'text-teal-950',
    accentColor: '#0d9488',
    vintageBrand: 'BASF',
    modelCode: 'CHROMDIOXID II 90',
    year: '1992',
    cassetteNumber: 'C-11',
    durationApprox: '03:19',
    summaryAr: 'عرض شيق لأجمل معالم الطبيعة في الإمارات: من كثبان عوافي في رأس الخيمة، إلى سدود وجبال حتا في دبي، وعيون المبزرة الخضراء في العين.',
    moralLessonAr: 'استكشاف معالم الوطن والتأمل في جمال تضاريسه يغرس في النفوس حب الأرض والاعتزاز بالهوية.',
    keyVocab: [
      { word: 'الكثبان الرملية', meaning: 'تلال من الرمال الناعمة تشكلت بفعل الرياح' },
      { word: 'الشاهقة', meaning: 'المرتفعة جداً وعالية القمم' },
      { word: 'المبزرة الخضراء', meaning: 'واحة خلابة في مدينة العين تشتهر بالينابيع والمياه الدافئة' }
    ],
    paragraphs: [
      'اجتمع الإخوة للتخطيط لرحلة الشتاء في ربوع الوطن، وقدم خالد عرضاً رائعاً لأبرز الوجهات.',
      'بدأ بمنطقة عوافي في رأس الخيمة لممارسة ركوب الدراجات في الكثبان الذهبية، ثم جبال حتا في دبي وقريتها التراثية وسدها الشهير.',
      'واختتم الجولة بواحة المبزرة الخضراء تحت سفح جبل حفيت في العين بمياهها الكبريتية وبحيراتها الصافية.'
    ]
  },
  {
    id: 'school-furniture-trust',
    titleAr: 'أمانة المقعد والمرافق المدرسية',
    titleEn: 'School Furniture as a Sacred Trust',
    category: 'society',
    categoryAr: 'الأسرة والمجتمع',
    categoryEn: 'Family & Society',
    audioSrc: '/assets/aistudio/____________________6f062bac.mp3',
    tapeColor: 'from-slate-700 via-slate-800 to-stone-900',
    labelBgColor: 'bg-slate-100',
    labelTextColor: 'text-slate-900',
    accentColor: '#475569',
    vintageBrand: 'SONY',
    modelCode: 'HF 90 TYPE I',
    year: '1994',
    cassetteNumber: 'C-12',
    durationApprox: '03:24',
    summaryAr: 'حوار بين تلاميذ في الفصل حول الرسم على الطاولات المدرسية، وتدخل المعلمة لتبيان مفهوم المواطنة الصالحة وحفظ الممتلكات العامة.',
    moralLessonAr: 'مرافق المدرسة والوطن أمانة في أيدينا؛ والمواطن الصالح يحميها كأنها بيته الخاص لتبقى للأجيال القادمة.',
    keyVocab: [
      { word: 'مستنكراً', meaning: 'رافضاً للعمل ومعتبراً إياه تصرفاً غير لائق' },
      { word: 'المرافق العامة', meaning: 'المنشآت المخصصة لخدمة الجميع كالمستشفيات والمدارس والحدائق' },
      { word: 'أمانة', meaning: 'مسؤولية وواجب حفظ الشيء وصيانته من التلف' }
    ],
    paragraphs: [
      'أراد أحمد رسم خريطة على طاولته المدرسية ليوصف لصديقه موقع محل أحذية، فغضب سلطان وقال: لا يجوز تشويه الطاولة المدرسية فهي ملك للجميع.',
      'احتج أحمد بأنها طاولته وهو حر فيها، لكن المعلمة دخلت ووجهت سؤالاً للجميع: هل تحبون وطنكم؟ قالوا: نعم!',
      'فقالت المعلمة: المواطن الصالح يحافظ على مباني وطنه، ولا يمزق مقاعد الحافلات ولا يتلف مختبرات المدرسة، فاعتذر التلاميذ ووعدوا بالحفاظ عليها.'
    ]
  },
  {
    id: 'earth-ozone-letter',
    titleAr: 'رسالة كوكب الأرض وثقب الأوزون',
    titleEn: 'Letter from Planet Earth & The Ozone Layer',
    category: 'science',
    categoryAr: 'العلم والصحة',
    categoryEn: 'Science & Health',
    audioSrc: '/assets/aistudio/___________09d0d69a.mp3',
    tapeColor: 'from-blue-700 via-sky-600 to-indigo-950',
    labelBgColor: 'bg-blue-50',
    labelTextColor: 'text-blue-950',
    accentColor: '#1d4ed8',
    vintageBrand: 'TDK',
    modelCode: 'SUPER CDing 90',
    year: '1998',
    cassetteNumber: 'C-13',
    durationApprox: '05:00',
    summaryAr: 'كوكب الأرض يتحدث بلسانه لأبنائه البشر ليشرح أهمية طبقة الأوزون كدرع واقٍ من الأشعة فوق البنفسجية، وواجبنا في وقف التلوث وغرس الأشجار.',
    moralLessonAr: 'حماية كوكب الأرض مسؤولية جماعية تتطلب ترشيد الاستهلاك واستبدال المواد الضارة بالحلول الصديقة للبيئة.',
    keyVocab: [
      { word: 'الغلاف الجوي', meaning: 'طبقات الهواء والغازات المحيطة بالكرة الأرضية' },
      { word: 'الأشعة فوق البنفسجية', meaning: 'أشعة شمسية غير مرئية تكون ضارة بالجلد والعيون إذا زادت نسبتها' },
      { word: 'ثقب الأوزون', meaning: 'نقص وترقق في سمك طبقة الأوزون الواقية بسبب الانبعاثات الصناعية' }
    ],
    paragraphs: [
      'أنا كوكب الأرض، سأحدثكم عن نفسي؛ لقد سخر الله لي الماء والغطاء النباتي لأكون واحة الحياة في هذا الكون الفسيح.',
      'تحيط بي طبقة الأوزون المباركة كالدرع الحامي الذي يصد الأشعة الضارة ويطهر الهواء، لكن بعض الغازات الصناعية تسببت في ثقب الأوزون.',
      'ندائي لكم: اغرسوا الأشجار، قللوا من الانبعاثات الضارة، وحافظوا على نقاء كوكبكم لتنعموا أنتم وأبناؤكم بالصحة والهواء العليل.'
    ]
  },
  {
    id: 'diligence-and-work',
    titleAr: 'سفينة العلم والاجتهاد',
    titleEn: 'The Ship of Knowledge & Diligence',
    category: 'values',
    categoryAr: 'حكايات وقيم',
    categoryEn: 'Moral Tales',
    audioSrc: '/assets/aistudio/_____________________34608a41.mp3',
    tapeColor: 'from-red-900 via-amber-800 to-stone-950',
    labelBgColor: 'bg-amber-100/50',
    labelTextColor: 'text-stone-900',
    accentColor: '#991b1b',
    vintageBrand: 'METAL',
    modelCode: 'METAL CD 90',
    year: '2005',
    cassetteNumber: 'C-14',
    durationApprox: '04:12',
    summaryAr: 'قصة ملهمة في فضل طلب العلم والمثابرة على الصعاب، وكيف يرتقي الإنسان بعقله وإخلاصه في خدمة أهله ومجتمعه.',
    moralLessonAr: 'لا يُنال العلم براحة الجسد؛ ومن طلب العلا سهر الليالي وجدّ في العمل لينال الثمار اليانعة.',
    keyVocab: [
      { word: 'المثابرة', meaning: 'المداومة والاستمرار على الجهد دون ملل' },
      { word: 'الارتقاء', meaning: 'الصعود نحو المراتب العالية في الفهم والأخلاق' },
      { word: 'ينال العلا', meaning: 'يبلغ القمة والشرف الرفيع في مجتمعه' }
    ],
    paragraphs: [
      'العلم بحر واسع لا ساحل له، وخير ما يبحر به طالب العلم هو سفينة الصبر والمثابرة والجد والاجتهاد.',
      'كان العلماء والأدباء يقطعون المسافات الطويلة ويسهرون الليالي لجمع الأحاديث وتدوين الحكايات واللغة، فخلّد التاريخ ذكراهم.',
      'استثمروا أوقاتكم في القراءة والإنصات للمعرفة، فالعلم نور يضيء الدروب ويهدي العقول لأرقى المراتب.'
    ]
  }
];


export const JUHA_STORIES: StoryCassette[] = [
  {
    id: 'juha-donkey',
    titleAr: 'جحا والحمار',
    titleEn: 'Juha and the Donkey',
    category: 'heritage',
    categoryAr: 'نوادر التراث',
    categoryEn: 'Heritage Anecdotes',
    audioSrc: '/assets/aistudio/______________a3845121.mp3',
    tapeColor: 'from-amber-700 via-stone-800 to-amber-900',
    labelBgColor: 'bg-amber-100',
    labelTextColor: 'text-amber-950',
    accentColor: '#b45309',
    vintageBrand: 'TDK',
    modelCode: 'SUPER D 90',
    year: '1979',
    cassetteNumber: 'J-01',
    durationApprox: '00:24',
    summaryAr: 'جحا يركب حماره في الشارع، وحين يسأله رجل إلى أين يذهب، يجيبه إجابة ساخرة طريفة تعكس خفة ظله.',
    moralLessonAr: 'الدعابة الذكية ترسم الابتسامة على وجوه الناس وتخفف من أعباء الحياة اليومية.',
    keyVocab: [
      { word: 'يمشي', meaning: 'يسير ويتحرك على قدميه' },
      { word: 'تعجب', meaning: 'أصابه الاندهاش والاستغراب' }
    ],
    paragraphs: [
      "في يومٍ من الأيام، كان جُحا يركب حِمارَه.",
      "رآه رجلٌ وسأله:",
      "«يا جُحا، إلى أين تذهب؟»",
      "قال جُحا: «لا أعرف!»",
      "تعجَّب الرجلُ وقال: «كيف لا تعرف؟»",
      "ضحك جُحا وقال:",
      "«اسأل الحِمار، فهو الذي يمشي، وليس أنا!»",
      "فضحك الرجلُ من كلام جُحا."
]
  },
  {
    id: 'juha-pot',
    titleAr: 'جحا والقدر',
    titleEn: 'Juha and the Pot',
    category: 'heritage',
    categoryAr: 'نوادر التراث',
    categoryEn: 'Heritage Anecdotes',
    audioSrc: '/assets/aistudio/______________b153c318.mp3',
    tapeColor: 'from-orange-800 via-stone-900 to-amber-950',
    labelBgColor: 'bg-orange-100',
    labelTextColor: 'text-orange-950',
    accentColor: '#c2410c',
    vintageBrand: 'BASF',
    modelCode: 'FERRO 90',
    year: '1981',
    cassetteNumber: 'J-02',
    durationApprox: '00:40',
    summaryAr: 'يستعير جحا قدراً من جاره ويعيده ومعه قدر صغير بحجة أنه أنجب، لكنه بعد ذلك يستعيره ويدعي أنه مات!',
    moralLessonAr: 'من يقبل بالربح غير المنطقي يلزمه منطقياً قبول الخسارة المماثلة؛ والطمع يضر بصاحبه.',
    keyVocab: [
      { word: 'قدر', meaning: 'إناء كبير يستخدم لطهي الطعام' },
      { word: 'أنجب', meaning: 'ولد وأتى بمولود جديد' }
    ],
    paragraphs: [
      "في يومٍ من الأيام، أخذ جُحا قِدْرًا من جارِه.",
      "وبعد يومين، أعاد جُحا القِدْرَ، ومعه قِدْرٌ صغيرٌ.",
      "سأله الجارُ: «ما هذا يا جُحا؟»",
      "قال جُحا: «قِدْرُكَ أنجبَ قِدْرًا صغيرًا!»",
      "فرح الجارُ وأخذ القِدْرَيْن.",
      "وبعد أيام، أخذ جُحا القِدْرَ الكبيرَ مرةً أخرى، ولم يُعِدْهُ.",
      "سأله الجارُ: «أين قِدْري يا جُحا؟»",
      "قال جُحا بحزنٍ: «لقد ماتَ القِدْرُ!»",
      "تعجَّب الجارُ وقال: «وهل يموتُ القِدْرُ؟»",
      "ضحك جُحا وقال: «إذا كان القِدْرُ يُنْجِبُ، فلماذا لا يموتُ؟!»"
]
  },
  {
    id: 'juha-fish',
    titleAr: 'جحا والسمك',
    titleEn: 'Juha and the Fish',
    category: 'heritage',
    categoryAr: 'نوادر التراث',
    categoryEn: 'Heritage Anecdotes',
    audioSrc: '/assets/aistudio/_______________6537d92e.mp3',
    tapeColor: 'from-cyan-800 via-blue-900 to-stone-950',
    labelBgColor: 'bg-cyan-100',
    labelTextColor: 'text-cyan-950',
    accentColor: '#0e7490',
    vintageBrand: 'SONY',
    modelCode: 'HF 90',
    year: '1983',
    cassetteNumber: 'J-03',
    durationApprox: '00:34',
    summaryAr: 'جحا يختبر صدق بائع السمك بوضع أذنه عند السمكة، كاشفاً بأسلوب ساخر أن السمك قديم وليس طازجاً.',
    moralLessonAr: 'الصدق والأمانة في البيع والشراء فضيلة، والذكاء يكشف الخداع بطريقة مهذبة وطريفة.',
    keyVocab: [
      { word: 'طازج', meaning: 'حديث الصيد ولم يفسد أو يتغير طعمه' },
      { word: 'اصطدته', meaning: 'أخرجته من الماء بالصيد' }
    ],
    paragraphs: [
      "في يومٍ من الأيام، ذهب جُحا إلى السُّوقِ ليشتريَ سَمَكًا.",
      "سألَ البائعَ: «هل هذا السَّمَكُ طازَجٌ؟»",
      "قالَ البائعُ: «نَعَمْ، لقد اصطَدْتُهُ اليومَ!»",
      "اقتربَ جُحا من السَّمَكِ، ووضعَ أُذُنَهُ بجانبِهِ.",
      "تَعَجَّبَ البائعُ وسألَهُ: «ماذا تَفْعَلُ يا جُحا؟»",
      "قالَ جُحا: «أَسْأَلُ السَّمَكَ عن أَخْبارِ البَحْرِ!»",
      "ضحكَ البائعُ وقالَ: «وماذا قالَ لكَ؟»",
      "قالَ جُحا: «قالَ إنَّهُ لا يَعْرِفُ شَيْئًا؛ لأنَّهُ خَرَجَ مِنَ البَحْرِ مُنْذُ أُسْبُوعٍ!»"
]
  },
  {
    id: 'juha-shoes',
    titleAr: 'جحا والحذاء',
    titleEn: 'Juha and the Shoes',
    category: 'heritage',
    categoryAr: 'نوادر التراث',
    categoryEn: 'Heritage Anecdotes',
    audioSrc: '/assets/aistudio/______________8857296c.mp3',
    tapeColor: 'from-emerald-800 via-stone-900 to-teal-950',
    labelBgColor: 'bg-emerald-100',
    labelTextColor: 'text-emerald-950',
    accentColor: '#047857',
    vintageBrand: 'PHILIPS',
    modelCode: 'UC-II 90',
    year: '1985',
    cassetteNumber: 'J-04',
    durationApprox: '00:29',
    summaryAr: 'يحمل جحا حذاءه في كيس إلى داخل المسجد، وحين يطلب منه رجل أن يتركه بالباب ويتوكل، يجيبه بحكمة ساخرة.',
    moralLessonAr: 'اعقلها وتوكل؛ التوكل الحقيقي على الله يقترن بالأخذ بالأسباب وحفظ الممتلكات.',
    keyVocab: [
      { word: 'خلع', meaning: 'نزع حذاءه من قدمه' },
      { word: 'توكل', meaning: 'اعتمد على الله وفوض الأمر إليه مع العمل' }
    ],
    paragraphs: [
      "في يومٍ من الأيام، ذهبَ جُحا إلى المسجدِ.",
      "خَلَعَ حِذاءَهُ، ووضعَهُ في كيسٍ، ثمَّ دخلَ المسجدَ.",
      "سألَهُ رجلٌ: «يا جُحا، لماذا تَحْمِلُ حِذاءَكَ مَعَكَ؟»",
      "قالَ جُحا: «أَخافُ أَنْ يَسْرِقَهُ أَحَدٌ!»",
      "قالَ الرجلُ: «ضَعْهُ عِنْدَ البابِ، وتَوَكَّلْ عَلَى اللهِ!»",
      "ابتسمَ جُحا وقالَ:",
      "«أنا أَتَوَكَّلُ عَلَى اللهِ، وَلَكِنَّ حِذائِي لا يَعْرِفُ الطَّريقَ إلى البَيْتِ!»"
]
  },
  {
    id: 'juha-honey',
    titleAr: 'جحا والعسل',
    titleEn: 'Juha and the Honey',
    category: 'heritage',
    categoryAr: 'نوادر التراث',
    categoryEn: 'Heritage Anecdotes',
    audioSrc: '/assets/aistudio/_______________83e222b9.mp3',
    tapeColor: 'from-yellow-700 via-amber-800 to-stone-950',
    labelBgColor: 'bg-yellow-100',
    labelTextColor: 'text-yellow-950',
    accentColor: '#a16207',
    vintageBrand: 'MAXELL',
    modelCode: 'UD-XL II 90',
    year: '1987',
    cassetteNumber: 'J-05',
    durationApprox: '00:32',
    summaryAr: 'يعود جحا للبيت فيجد جرة العسل فارغة، فينكر ابنه علمه بها، إلا أن آثار العسل حول فمه تكشف الحقيقة فوراً.',
    moralLessonAr: 'حبل الكذب قصير، ومشاعر الصدق والأمانة في البيت تبني الثقة والمحبة.',
    keyVocab: [
      { word: 'جرة', meaning: 'وعاء فخاري كبير لتخزين السوائل والعسل' },
      { word: 'فارغة', meaning: 'ليس فيها شيء وخالية من محتواها' }
    ],
    paragraphs: [
      "في يومٍ من الأيام، اشترى جُحا جَرَّةً مِنَ العَسَلِ.",
      "وَضَعَ الجَرَّةَ في المَطْبَخِ، وَخَرَجَ مِنَ البَيْتِ.",
      "عادَ جُحا، فَوَجَدَ الجَرَّةَ فارِغَةً!",
      "سَأَلَ ابْنَهُ: «مَنْ أَكَلَ العَسَلَ؟»",
      "قالَ الابْنُ: «لا أَعْرِفُ يا أَبي!»",
      "نَظَرَ جُحا إلى وَجْهِ ابْنِهِ، فَوَجَدَ العَسَلَ حَوْلَ فَمِهِ.",
      "ضَحِكَ جُحا وَقالَ:",
      "«يا بُنَيَّ، لِسانُكَ يَقولُ لا أَعْرِفُ، وَلَكِنَّ وَجْهَكَ يَقولُ: أَنا أَكَلْتُ العَسَلَ!»"
]
  },
  {
    id: 'juha-glasses',
    titleAr: 'جحا والنظارة',
    titleEn: 'Juha and the Glasses',
    category: 'heritage',
    categoryAr: 'نوادر التراث',
    categoryEn: 'Heritage Anecdotes',
    audioSrc: '/assets/aistudio/____________________4ed35416.mp3',
    tapeColor: 'from-purple-800 via-stone-900 to-indigo-950',
    labelBgColor: 'bg-purple-100',
    labelTextColor: 'text-purple-950',
    accentColor: '#7e22ce',
    vintageBrand: 'AGFA',
    modelCode: 'SUPER COLOR',
    year: '1989',
    cassetteNumber: 'J-06',
    durationApprox: '00:34',
    summaryAr: 'يدخل جحا متجر نظارات ويجرب واحدة تلو الأخرى للقراءة دون جدوى، حتى يكشف للبائع أنه أميّ أصلاً!',
    moralLessonAr: 'الأدوات والوسائل لا تعوض الجهد والتعلم الذاتي؛ فالمعرفة تكتسب بالدراسة وليس بالمظاهر.',
    keyVocab: [
      { word: 'المتجر', meaning: 'المحل أو الدكان المخصص للبيع' },
      { word: 'يستطع', meaning: 'يقدر ويتمكن من الفعل' }
    ],
    paragraphs: [
      "في يَوْمٍ مِنَ الأَيَّامِ، ذَهَبَ جُحا إِلى السُّوقِ لِيَشْتَرِيَ نَظَّارَةً.",
      "دَخَلَ المَتْجَرَ، وَلَبِسَ نَظَّارَةً، ثُمَّ حاوَلَ قِراءَةَ كِتابٍ، وَلَكِنَّهُ لَمْ يَسْتَطِعْ.",
      "جَرَّبَ نَظَّارَةً ثانِيَةً وَثالِثَةً، وَلَكِنَّهُ لَمْ يَسْتَطِعِ القِراءَةَ أَيْضًا.",
      "سَأَلَهُ البائِعُ: «يا جُحا، هَلْ تَعْرِفُ القِراءَةَ؟»",
      "قالَ جُحا: «لا!»",
      "تَعَجَّبَ البائِعُ وَقالَ: «إِذَنْ، لِماذا تُرِيدُ نَظَّارَةً؟»",
      "أَجابَ جُحا: «لِكَيْ أَتَعَلَّمَ القِراءَةَ!»"
]
  },
  {
    id: 'juha-key',
    titleAr: 'جحا والمفتاح',
    titleEn: 'Juha and the Key',
    category: 'heritage',
    categoryAr: 'نوادر التراث',
    categoryEn: 'Heritage Anecdotes',
    audioSrc: '/assets/aistudio/_________________84a1d036.mp3',
    tapeColor: 'from-amber-600 via-yellow-700 to-stone-900',
    labelBgColor: 'bg-amber-100',
    labelTextColor: 'text-amber-950',
    accentColor: '#b45309',
    vintageBrand: 'PHILIPS',
    modelCode: 'LC-100',
    year: '1991',
    cassetteNumber: 'J-07',
    durationApprox: '00:32',
    summaryAr: 'يبحث جحا عن مفتاح بيته الضائع تحت ضوء الشارع رغم أنه أضاعه في عتمة البيت، لأن الرؤية في الشارع أسهل!',
    moralLessonAr: 'عالج أسباب المشكلات في موضعها الحقيقي ولا تهرب إلى الحلول السهلة في غير مكانها.',
    keyVocab: [
      { word: 'فقدته', meaning: 'أضعته ولم أعد أعرف مكانه' },
      { word: 'الضوء', meaning: 'النور والإشراق الذي يساعد على الإبصار' }
    ],
    paragraphs: [
      "في يَوْمٍ مِنَ الأَيَّامِ، كانَ جُحا يَبْحَثُ عَنْ مِفْتاحِهِ في الشَّارِعِ.",
      "رَآهُ جارُهُ، فَسَأَلَهُ: «ماذا تَبْحَثُ عَنْهُ يا جُحا؟»",
      "قالَ جُحا: «أَبْحَثُ عَنْ مِفْتاحِ بَيْتِي».",
      "ساعَدَهُ الجارُ في البَحْثِ، وَلَكِنَّهُما لَمْ يَجِداهُ.",
      "سَأَلَ الجارُ: «أَيْنَ فَقَدْتَ المِفْتاحَ؟»",
      "قالَ جُحا: «فَقَدْتُهُ داخِلَ البَيْتِ!»",
      "تَعَجَّبَ الجارُ وَقالَ: «إِذَنْ، لِماذا تَبْحَثُ عَنْهُ هُنا؟»",
      "أَجابَ جُحا: «لِأَنَّ الضَّوْءَ هُنا أَفْضَلُ!»"
]
  },
  {
    id: 'juha-doctor',
    titleAr: 'جحا والطبيب',
    titleEn: 'Juha and the Doctor',
    category: 'heritage',
    categoryAr: 'نوادر التراث',
    categoryEn: 'Heritage Anecdotes',
    audioSrc: '/assets/aistudio/________________65803506.mp3',
    tapeColor: 'from-red-800 via-rose-900 to-stone-900',
    labelBgColor: 'bg-rose-100',
    labelTextColor: 'text-rose-950',
    accentColor: '#be123c',
    vintageBrand: 'SONY',
    modelCode: 'UX-S 60',
    year: '1993',
    cassetteNumber: 'J-08',
    durationApprox: '00:30',
    summaryAr: 'يشتكي جحا للطبيب من وجع في عينه عند شرب الشاي، فيطلب الطبيب منه أن يشرب أمامه ليكتشف أن الملعقة في الكوب هي السبب.',
    moralLessonAr: 'الانتباه إلى التفاصيل البسيطة يحل أحياناً أكبر المشكلات التي نعتقد أنها معقدة.',
    keyVocab: [
      { word: 'تشكو', meaning: 'تتألم وتعاني من عرض أو مرض' },
      { word: 'الملعقة', meaning: 'أداة التقليب وتناول السوائل' }
    ],
    paragraphs: [
      "في يَوْمٍ مِنَ الأَيَّامِ، ذَهَبَ جُحا إِلى الطَّبيبِ.",
      "سَأَلَهُ الطَّبيبُ: «مِمَّ تَشْكُو يا جُحا؟»",
      "قالَ جُحا: «كُلَّما شَرِبْتُ الشَّايَ، شَعَرْتُ بِأَلَمٍ في عَيْنِي!»",
      "تَعَجَّبَ الطَّبيبُ وَقالَ: «هَذَا أَمْرٌ غَرِيبٌ! أَرِنِي كَيْفَ تَشْرَبُ الشَّايَ».",
      "أَحْضَرَ الطَّبيبُ كُوبًا مِنَ الشَّايِ.",
      "أَخَذَ جُحا الكُوبَ وَبَدَأَ يَشْرَبُ.",
      "ضَحِكَ الطَّبيبُ وَقالَ:",
      "«يا جُحا، أَخْرِجِ المِلْعَقَةَ مِنَ الكُوبِ قَبْلَ أَنْ تَشْرَبَ!»"
]
  },
  {
    id: 'juha-clever-donkey',
    titleAr: 'جحا والحمار العجيب',
    titleEn: 'Juha and the Wondrous Donkey',
    category: 'heritage',
    categoryAr: 'نوادر التراث',
    categoryEn: 'Heritage Anecdotes',
    audioSrc: '/assets/aistudio/________________________6a4ab495.mp3',
    tapeColor: 'from-teal-800 via-slate-800 to-stone-900',
    labelBgColor: 'bg-teal-100',
    labelTextColor: 'text-teal-950',
    accentColor: '#0f766e',
    vintageBrand: 'TDK',
    modelCode: 'DJ2 90',
    year: '1995',
    cassetteNumber: 'J-09',
    durationApprox: '00:32',
    summaryAr: 'يعرض جحا حماره للبيع بمئة درهم زاعماً أنه ذكي للغاية؛ لأن دليله على ذكائه هو هروبه كلما حان وقت العمل!',
    moralLessonAr: 'الذكاء الحقيقي في العمل والمثابرة، والكسل حيلة لا تنطلي على العقلاء إلا على سبيل الفكاهة.',
    keyVocab: [
      { word: 'درهم', meaning: 'عملة نقدية قديمة متداولة في التجارة' },
      { word: 'يهرب', meaning: 'يفر ويبتعد مسرعاً' }
    ],
    paragraphs: [
      "في يَوْمٍ مِنَ الأَيَّامِ، ذَهَبَ جُحا إِلى السُّوقِ لِيَبِيعَ حِمارَهُ.",
      "سَأَلَهُ رَجُلٌ: «بِكَمْ تَبِيعُ الحِمارَ يا جُحا؟»",
      "قالَ جُحا: «بِمِئَةِ دِرْهَمٍ».",
      "قالَ الرَّجُلُ: «هَذَا ثَمَنٌ كَبِيرٌ! هَلْ حِمارُكَ ذَكِيٌّ؟»",
      "قالَ جُحا: «نَعَمْ، إِنَّهُ ذَكِيٌّ جِدًّا!»",
      "سَأَلَ الرَّجُلُ: «وَما الدَّليلُ؟»",
      "قالَ جُحا: «كُلَّما أَرَدْتُ الذَّهابَ إِلى العَمَلِ، يَهْرُبُ مِنِّي!»",
      "ضَحِكَ الرَّجُلُ وَقالَ: «يَبْدُو أَنَّهُ أَذْكَى مِنَّا جَمِيعًا!»"
]
  },
  {
    id: 'juha-door',
    titleAr: 'جحا والباب',
    titleEn: 'Juha and the Door',
    category: 'heritage',
    categoryAr: 'نوادر التراث',
    categoryEn: 'Heritage Anecdotes',
    audioSrc: '/assets/aistudio/______________9a33cab3.mp3',
    tapeColor: 'from-stone-700 via-zinc-800 to-black',
    labelBgColor: 'bg-stone-200',
    labelTextColor: 'text-stone-950',
    accentColor: '#3f3f46',
    vintageBrand: 'SCOTCH',
    modelCode: 'BX 90',
    year: '1997',
    cassetteNumber: 'J-10',
    durationApprox: '00:35',
    summaryAr: 'يخلع جحا باب بيته ويحمله للسوق لحماية بيته من اللصوص، معتقداً بسذاجة أن اللص لا يدخل إلا بمفتاح الباب المحمول معه!',
    moralLessonAr: 'الفهم السليم للأمن والحماية يقوم على الواقع وليس على التصورات الواهية والمفارقات العجيبة.',
    keyVocab: [
      { word: 'لص', meaning: 'سارق يأخذ مال غيره خلسة دون حق' },
      { word: 'مفتاح', meaning: 'أداة فتح وإغلاق القفل' }
    ],
    paragraphs: [
      "في يَوْمٍ مِنَ الأَيَّامِ، خَرَجَ جُحا مِنْ بَيْتِهِ، وَحَمَلَ بابَ البَيْتِ عَلَى ظَهْرِهِ.",
      "رَآهُ جارُهُ، فَسَأَلَهُ:",
      "«يا جُحا، إِلى أَيْنَ تَذْهَبُ بِهَذَا البَابِ؟»",
      "قالَ جُحا: «أَذْهَبُ إِلى السُّوقِ».",
      "سَأَلَهُ الجارُ: «وَلِماذا تَحْمِلُ بابَ بَيْتِكَ؟»",
      "قالَ جُحا: «أَخافُ أَنْ يَدْخُلَ لِصٌّ إِلى بَيْتِي!»",
      "ضَحِكَ الجارُ وَقالَ: «وَلَكِنَّ بَيْتَكَ الآنَ بِلا بابٍ!»",
      "ابْتَسَمَ جُحا وَقالَ:",
      "«لا تَخَفْ! لَنْ يَدْخُلَ اللِّصُّ؛ لِأَنَّ مِفْتاحَ البَيْتِ مَعِي!»"
]
  }
];
