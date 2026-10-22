export interface SchoolModule {
  id: string;
  label: string;
  description: string;
}

export const SCHOOL_MODULES: SchoolModule[] = [
  { id: 'letters', label: 'الحروف', description: 'تعلم الحروف وأصواتها وأشكالها' },
  { id: 'vocabulary', label: 'المفردات', description: 'بناء الرصيد اللغوي ومراجعة الكلمات' },
  { id: 'listening', label: 'الاستماع', description: 'فهم اللغة العربية المسموعة' },
  { id: 'speaking', label: 'التحدث', description: 'التدرب على النطق والتعبير الشفهي' },
  { id: 'reading', label: 'القراءة', description: 'نصوص وأنشطة الفهم القرائي' },
  { id: 'writing', label: 'الكتابة', description: 'التعبير الكتابي والتدرب على الكتابة' },
  { id: 'translator', label: 'المترجم', description: 'الترجمة وتحليل المفردات' },
  { id: 'grammar', label: 'القواعد', description: 'القواعد والتراكيب اللغوية' },
  { id: 'games', label: 'الألعاب التعليمية', description: 'ألعاب تفاعلية لتعلم العربية' },
  { id: 'dialects', label: 'اللهجات', description: 'التعرف إلى اللهجات العربية' },
  { id: 'worksheets', label: 'أوراق العمل', description: 'أوراق وأنشطة تعليمية' },
  { id: 'quizzes', label: 'الاختبارات القصيرة', description: 'اختبارات ومراجعات' },
  { id: 'preparation', label: 'تحضير المعلم', description: 'أدوات إعداد الدروس' },
  { id: 'placement', label: 'تحديد المستوى', description: 'قياس مستوى المتعلم في العربية' },
  { id: 'whiteboard', label: 'السبورة التفاعلية', description: 'التفاعل الصفي المباشر' },
  { id: 'calligraphy', label: 'الخط العربي', description: 'التدرب على الخط العربي' },
  { id: 'memory', label: 'ذاكرتي اللغوية', description: 'مراجعة المفردات والأخطاء السابقة' },
  { id: 'achievements', label: 'الإنجازات', description: 'متابعة الإنجازات والتقدم' },
];

export const ALL_SCHOOL_MODULE_IDS = SCHOOL_MODULES.map((module) => module.id);

export const ROUTE_MODULES: Record<string, string> = {
  '/whiteboard': 'whiteboard',
  '/calligraphy': 'calligraphy',
  '/test': 'placement',
  '/letters': 'letters',
  '/vocabulary': 'vocabulary',
  '/listening': 'listening',
  '/speak': 'speaking',
  '/reading': 'reading',
  '/writing': 'writing',
  '/translator': 'translator',
  '/assistant': 'grammar',
  '/games': 'games',
  '/dialects': 'dialects',
  '/worksheets': 'worksheets',
  '/quizzes': 'quizzes',
  '/preparation': 'preparation',
  '/memory': 'memory',
  '/achievements': 'achievements',
};

export const SCHOOL_STATUS_LABELS: Record<string, string> = {
  active: 'فعّالة',
  trial: 'فترة تجريبية',
  suspended: 'موقوفة',
};
