import React from 'react';

export type RoleLanguage = 'ar' | 'en';

export const useRoleLanguage = () => {
  const [lang, setLang] = React.useState<RoleLanguage>(() =>
    typeof window !== 'undefined' && localStorage.getItem('hub_lang') === 'en' ? 'en' : 'ar'
  );
  React.useEffect(() => {
    const sync = () => setLang(localStorage.getItem('hub_lang') === 'en' ? 'en' : 'ar');
    window.addEventListener('storage', sync);
    window.addEventListener('langChanged', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('langChanged', sync);
    };
  }, []);
  return { lang, isEnglish: lang === 'en' };
};

const EN: Record<string, string> = {
  'الرئيسية':'Home','المدارس':'Schools','الباقات والأقسام':'Plans & Modules',
  'الحسابات والصلاحيات':'Accounts & Permissions','الاشتراكات والتجديدات':'Subscriptions & Renewals',
  'التحليلات':'Analytics','سجل العمليات':'Audit Log','الدعم الفني':'Technical Support',
  'إعدادات المنصة':'Platform Settings','إضافة مدرسة':'Add School','اسم المدرسة':'School Name',
  'بريد التواصل':'Contact Email','الحالة':'Status','الدور':'Role','السعر':'Price','المدة':'Duration',
  'الفئة المستهدفة وما تضمه الباقة':'Target Audience and Included Modules','أقسام الباقة':'Plan Modules',
  'الاشتراكات':'Subscriptions','الباقات الحالية':'Current Plans',
  'إدارة الباقة والحالة وتجديد المدة من سجل كل مدرسة.':'Manage the plan, status and renewal period from each school record.',
  'أنشئ الباقات أولًا من قسم الباقات والأقسام.':'Create plans first in Plans & Modules.',
  '0 = غير محدود':'0 = Unlimited','0 تعني غير محدود، والسعر اختياري.':'0 means unlimited. Price is optional.',
  '(اختياري)':'(Optional)','اختر باقة':'Select a plan','مثال: الباقة المتقدمة':'e.g. Advanced Plan',
  'عملة السعر':'Price Currency','إنشاء الباقات المقترحة':'Create Suggested Plans','حفظ':'Save','تعديل':'Edit',
  'حذف':'Delete','إلغاء':'Cancel','إغلاق التنبيه':'Dismiss Notification','تحديث':'Refresh',
  'تحديث البيانات':'Refresh Data','تصدير':'Export','تصدير تقرير CSV':'Export CSV Report',
  'تصدير القائمة':'Export List','تحديث الطلبات':'Refresh Requests','إعادة إتاحة':'Make Available Again',
  'فتح إدارة المدارس ←':'Open School Management ←','فتح قواعد الأمان':'Open Security Rules',
  'إدارة المواعيد':'Appointment Management','اليوم والوقت (بتوقيت الإمارات)':'Date and Time (UAE Time)',
  'عنوان الموعد':'Appointment Title','نوع الموعد':'Appointment Type','تدريب على المنصة':'Platform Training',
  'دعم فني':'Technical Support','20 دقيقة':'20 minutes','30 دقيقة':'30 minutes',
  '40 دقيقة':'40 minutes','60 دقيقة':'60 minutes','جلسة تعريف وتدريب':'Orientation and Training Session',
  'إضافة وقت':'Add Time Slot','جارٍ الحفظ...':'Saving...','جارٍ الإرسال...':'Sending...',
  'جارٍ الحجز...':'Booking...','جارٍ الإلغاء...':'Cancelling...','تم الحل':'Resolved',
  'جديد':'New','قيد المعالجة':'In Progress','كل الحالات':'All Statuses','تصفية الطلبات':'Filter Requests',
  'مركز الدعم الفني':'Support Center','طلبات المساعدة التي ترسلها المدارس من حساباتها.':'Support requests submitted by schools.',
  'لا توجد طلبات دعم بهذه الحالة.':'No support requests in this status.',
  'قاعدة البيانات':'Database','قاعدة Firestore المستخدمة في تطبيق قُل':'Firestore database used by QUL',
  'قاعدة البيانات المطلوبة:':'Required Database:','الوحدات التعليمية':'Learning Modules','الأقسام التعليمية':'Learning Modules',
  'الأمان':'Security','التكاملات التجارية':'Commercial Integrations',
  'بوابة الدفع والفوترة الآلية وإرسال دعوات تسجيل الدخول تحتاج إلى تهيئة خدمات خلفية منفصلة قبل تفعيلها.':'Payment processing, automated billing and sign-in invitations require separate backend services before activation.',
  'معلومات تشغيلية مرجعية. لا تُعرض مفاتيح أو أسرار الاتصال في واجهة الإدارة.':'Operational reference information. Connection keys and secrets are not shown in the admin interface.',
  'الأدوار وحدود الوصول تُفرض في Firestore Rules. إخفاء قسم من القائمة ليس بديلًا عن قواعد الأمان.':'Roles and access boundaries are enforced by Firestore Rules. Hiding a menu item does not replace security rules.',
  'تعديل تعريف الأقسام يتم من إعدادات المشروع، ثم اختبار توافق الباقات القائمة.':'Module definitions are managed in project settings, then checked against existing plans.',
  'فتح إعدادات قاعدة البيانات':'Open Database Settings',
  'لم يتم حذف أي بيانات. يحتاج حسابك إلى صلاحية قراءة قاعدة بيانات Firestore المستخدمة في قُل.':'No data was deleted. Your account needs permission to read the Firestore database used by QUL.',
  'هذه الصفحة مخصصة لأدمن منصة قُل.':'This page is for QUL platform administrators.',
  'يجب على المستخدم تسجيل الدخول مرة واحدة على الأقل حتى يظهر هنا. لا يمكن تغيير دور أدمن المنصة من هذه الشاشة.':'A user must sign in at least once to appear here. The platform admin role cannot be changed from this screen.',
  'يُنشأ سجل المدرسة ويُربط بالباقة، ثم يمكن إسناد مدير المدرسة من قسم الحسابات.':'Create the school record and link it to a plan, then assign a school admin from Accounts.',
  'حساب مستقل':'Standalone Account','أدمن المنصة':'Platform Admin','مدير مدرسة':'School Admin',
  'مديرو المدارس':'School Admins','معلم':'Teacher','المعلم':'Teacher','معلمون':'Teachers',
  'طالب':'Student','الطلاب':'Students','المعلمون':'Teachers','الفصول والمجموعات':'Classes & Groups',
  'بيانات المدرسة':'School Details','الاشتراك والأقسام':'Subscription & Modules','التقارير المدرسية':'School Reports',
  'بحث بالاسم أو البريد':'Search by name or email','البريد الإلكتروني':'Email Address','الفصل':'Class',
  'المرحلة أو الصف':'Grade / Year','المعلم المسؤول':'Assigned Teacher','لم يحدد':'Not assigned',
  'كل الفصول':'All Classes','دون فصل':'Unassigned','طلاب دون فصل':'Students without a Class',
  'فصول دون معلم':'Classes without a Teacher','أنشئ الفصول وأسنِد الطلاب إليها لظهور التقرير.':'Create classes and assign students to see this report.',
  'توزيع الطلاب حسب الفصل':'Students by Class','المؤشرات التالية محسوبة من سجلات المدرسة الحالية، ولا تتضمن بيانات افتراضية.':'These metrics are calculated from current school records and contain no sample data.',
  'تعديل اسم المدرسة وبريد التواصل المسموح بهما لمدير المدرسة.':'Update the school name and contact email available to the school admin.',
  'تغيير الباقة أو حالة الاشتراك متاح للأدمن العام فقط.':'Only the platform admin can change the plan or subscription status.',
  'تفاصيل الاشتراك':'Subscription Details','تاريخ الانتهاء':'Expiration Date','غير محدد':'Not specified',
  'لا توجد أقسام مفعّلة حاليًا.':'No modules are currently enabled.',
  'لا توجد فصول بعد. أنشئ أول فصل من الزر أعلاه.':'No classes yet. Create the first class using the button above.',
  'لا توجد نتائج مطابقة.':'No matching results.','إعادة المحاولة':'Retry','إغلاق الرسالة':'Dismiss Message',
  'إنشاء فصل':'Create Class','اسم الفصل':'Class Name','مثال: الصف الخامس أ':'e.g. Grade 5A',
  'مثال: الصف الخامس':'e.g. Grade 5','يمكن إسناد الطلاب إلى الفصل من صفحة الطلاب.':'Students can be assigned to a class from the Students page.',
  'تعديل الفصل':'Edit Class','حذف الفصل':'Delete Class','فصل جديد':'New Class','تصدير CSV':'Export CSV',
  'الأقسام المتاحة':'Available Modules','العنوان':'Title','عنوان المشكلة':'Issue Title',
  'وصف مختصر':'Brief Description','صف المشكلة باختصار.':'Briefly describe the issue.',
  'طلب دعم مكتوب':'Submit a Support Request','طلب دعم':'Support Request','دون موعد':'No appointment needed',
  'حجز موعد':'Book an Appointment','اختر التاريخ ثم الوقت المناسب':'Choose a date, then a time',
  'الشهر التالي':'Next Month','الشهر السابق':'Previous Month','توقيت الإمارات':'UAE Time',
  'متاح':'Available','محدد':'Selected','مواعيد مدرستك':'Your School Appointments',
  'لا توجد مواعيد محجوزة.':'No appointments booked.','لا توجد مواعيد مضافة':'No appointments have been added',
  'لا توجد مواعيد بهذا اليوم':'No appointments on this day','اختر يومًا آخر عليه نقطة خضراء.':'Choose another day marked with a green dot.',
  'تظهر الأوقات هنا بعد إضافتها من الأدمن.':'Times appear here after the admin adds them.',
  'الدعم الفني أو التدريب على المنصة':'Technical support or platform training','معاينة':'Preview',
  'معاينة فقط. لا تُحفظ التغييرات في قاعدة البيانات.':'Preview only. Changes are not saved to the database.',
  'الحجز الفعلي يتطلب حساب مدير مدرسة.':'A real school admin account is required to book.',
  'ستظهر هنا الحالات التي تحتاج مراجعة.':'Schools needing review will appear here.',
  'قائمة مراجعة':'Review Queue','تحتاج إلى متابعة':'Needs Attention',
  'مدارس تحتاج إلى مراجعة بياناتها':'Schools whose records need review','ملخص المنصة':'Platform Summary',
  'معاينة لما ستعرضه اللوحة بعد اكتمال التسجيل':'Preview of the dashboard after registration is complete',
  'بيانات تجريبية قابلة للتغيّر':'Development data, subject to change','معاينة أثناء التطوير':'Development Preview',
  'رؤية موحّدة للمدارس والحسابات والباقات، بتصميم يتطور مع بيانات قُل.':'A unified view of schools, accounts and plans, evolving with QUL data.',
  'توزيع توضيحي لحالات الاشتراك':'Illustrative subscription status breakdown','حالة المدارس':'School Status',
  'إجمالي المدارس':'Total Schools','المدارس المسجلة':'Registered Schools','حسابات المنصة':'Platform Accounts',
  'الباقات المتاحة':'Available Plans','اشتراك فعّال':'Active subscription','معلم مسجل':'registered teachers',
  'الحسابات المسجلة بدور طالب':'Accounts registered as students','باقة مرتبطة بمدارس':'plans assigned to schools',
  'تركيبة الحسابات':'Account Composition','حسب نوع المستخدم':'By User Type',
  'تسجيل المدارس عبر الوقت':'School Registrations Over Time','الأشهر الستة الأخيرة وفق تاريخ الإنشاء':'Last six months by creation date',
  'اتجاه التسجيل':'Registration Trend','المدارس حسب الباقة':'Schools by Plan',
  'مقارنة الارتباط بالخطط':'Plan assignment comparison','ستظهر مقارنة الباقات بعد إدخال بياناتها.':'Plan comparisons will appear when plan data is added.',
  'الإجمالي:':'Total:','حساب':'accounts','سجل العمليات الإدارية':'Administrative Audit Log',
  'يحتوي على العمليات المسجلة بعد تفعيل السجل، ولا يتضمن التغييرات السابقة.':'Includes activity recorded after logging was enabled, not earlier changes.',
  'ستُعرض النتائج الفعلية بعد اعتماد بيانات المدارس.':'Live results will appear once school data is finalized.',
  'الأرقام الحالية استرشادية خلال التطوير، وستتبع النتائج السجلات التي تُدخلها الإدارة وتراجعها.':'Current figures are illustrative during development. Results will reflect records entered and reviewed by the administration.',
  'لم تُنشأ فترات للحجز بعد. أضف أول موعد من النموذج أعلاه.':'No appointment slots have been created. Add the first slot using the form above.',
  'المواعيد والحجوزات':'Appointments & Bookings','حالة الاشتراك':'Subscription Status','فترة تجريبية':'Trial Period',
  'فعّال':'Active','موقوف':'Suspended','بلا باقة':'No Plan','حفظ الحالة':'Save Status','حفظ التعديلات':'Save Changes',
  'إنشاء الفصل':'Create Class','إرسال الطلب':'Submit Request','إرسال طلب دعم':'Submit Support Request',
  'تم إرسال طلب الدعم بنجاح.':'Support request submitted successfully.',
  'تعذر إرسال الطلب. تحقق من نشر قواعد Firestore المحدّثة.':'Could not submit the request. Check that the updated Firestore rules are published.',
  'تعذر حجز الموعد. تحقق من نشر قواعد Firestore الخاصة بالمواعيد ثم أعد المحاولة.':'Could not book the appointment. Check that the Firestore appointment rules are published and try again.',
  'تم حجز الموعد بنجاح. ستظهر تفاصيله ضمن مواعيد المدرسة.':'Appointment booked successfully. Details will appear under your school appointments.',
  'لا يمكن حجز موعد انتهى وقته.':'Past appointments cannot be booked.',
  'هذا الموعد لم يعد متاحًا، حدّث القائمة واختر وقتًا آخر.':'This slot is no longer available. Refresh the list and choose another time.',
  'تم إلغاء الموعد وإتاحته للحجز مرة أخرى.':'Appointment cancelled and made available again.',
  'تعذر إلغاء الموعد. حدّث الصفحة وحاول مرة أخرى.':'Could not cancel the appointment. Refresh and try again.',
  'تم تحديث بيانات المدرسة بنجاح.':'School details updated successfully.',
  'تعذر حفظ بيانات المدرسة.':'Could not save school details.','تم إنشاء الفصل بنجاح.':'Class created successfully.',
  'تم حذف الفصل بنجاح.':'Class deleted successfully.','تم حفظ التعديلات بنجاح.':'Changes saved successfully.',
  'اسم المدرسة مطلوب.':'School name is required.','أدخل عنوان الطلب ووصف المشكلة.':'Enter a request title and issue description.',
  'عنوان الطلب بحد أقصى 160 حرفًا، والوصف بحد أقصى 5000 حرف.':'The title can be up to 160 characters and the description up to 5,000 characters.',
  'هذه معاينة فقط. لن يُرسل الطلب إلى فريق الدعم.':'Preview only. The request will not be sent to support.',
  'هذه معاينة فقط. لن يتم إنشاء حجز حقيقي.':'Preview only. No real booking will be created.',
  'لم يتم ربط هذا الحساب بمدرسة. يرجى التواصل مع أدمن منصة قُل.':'This account is not linked to a school. Contact the QUL platform admin.',
  'لا توجد مواعيد متاحة حاليًا':'No appointments are currently available',
  'سيظهر التقويم هنا عندما يضيف فريق قُل فترات للحجز.':'The calendar appears here once the QUL team adds booking slots.',
  'جارٍ تحميل بيانات المنصة...':'Loading platform data...','جارٍ تحميل لوحة المدرسة...':'Loading school dashboard...',
  'لم يتم تحديد':'Not selected','تمت إضافة الموعد إلى قائمة الحجز.':'Appointment slot added successfully.',
  'تعذر إضافة الموعد. تحقق من نشر قواعد appointment_slots في Firestore.':'Could not add the appointment. Check the appointment_slots Firestore rules.',
  'لا توجد مواعيد متاحة في هذا اليوم':'No appointments available on this day',
  'عرض التفاصيل':'View Details','الاسم':'Name','المعلمون':'Teachers','الطلاب':'Students',
};

const dictionaryEntries = Object.entries(EN).sort((a,b)=>b[0].length-a[0].length);
export function translateRoleText(value: string, lang: RoleLanguage): string {
  if (lang !== 'en' || !/[\u0600-\u06FF]/.test(value)) return value;
  const trimmed = value.trim();
  if (EN[trimmed]) return value.replace(trimmed, EN[trimmed]);
  let result = value;
  for (const [ar,en] of dictionaryEntries) {
    if (ar.length > 8 && result.includes(ar)) result = result.split(ar).join(en);
  }
  return result;
}

function translateNode(node: React.ReactNode, lang: RoleLanguage): React.ReactNode {
  if (typeof node === 'string') return translateRoleText(node, lang);
  if (typeof node === 'number' || node == null || typeof node === 'boolean') return node;
  if (Array.isArray(node)) return node.map((child, index) => <React.Fragment key={index}>{translateNode(child, lang)}</React.Fragment>);
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<any>;
    const props: Record<string, unknown> = {};
    const safeTextProps = ['placeholder','title','aria-label','alt','enterLabel','arTitle','description'];
    for (const key of safeTextProps) {
      if (typeof element.props[key] === 'string') props[key] = translateRoleText(element.props[key], lang);
    }
    if (element.props.children !== undefined) props.children = translateNode(element.props.children, lang);
    return React.cloneElement(element, props);
  }
  return node;
}

export const RoleLocalizer: React.FC<{ children: React.ReactNode; lang: RoleLanguage }> = ({ children, lang }) => (
  <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={lang === 'en' ? 'role-english h-full min-h-0' : 'role-arabic h-full min-h-0'}>
    {translateNode(children, lang)}
    {lang === 'en' && <style>{'.role-english .text-right{text-align:left!important}.role-english .text-left{text-align:right!important}.role-english input,.role-english textarea,.role-english select{direction:ltr}.role-english .font-arabic{font-family:inherit}'}</style>}
  </div>
);
