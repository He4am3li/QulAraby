import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity, Building2, Check, ChevronDown, ChevronLeft, CircleDollarSign, GraduationCap, Layers3,
  LoaderCircle, Plus, RefreshCw, School, Settings2, ShieldCheck, Users, X
} from 'lucide-react';
import {
  addDoc, collection, deleteField, doc, getDocs, serverTimestamp, setDoc, updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { ALL_SCHOOL_MODULE_IDS, SCHOOL_MODULES } from '../config/schoolPlans';
import { useAuth } from '../components/AuthProvider';
import { PlatformTopBar } from '../components/PlatformTopBar';

type PlanRecord = {
  id: string; name: string; description?: string; price?: number; currency?: string;
  includedModules: string[]; maxTeachers?: number; maxStudents?: number; durationDays?: number;
  isActive?: boolean;
};
type SchoolRecord = {
  id: string; name: string; contactEmail?: string; planId?: string; status?: string;
  createdAt?: any; expiresAt?: any;
};
type UserRecord = {
  uid: string; email: string; displayName?: string; role: string; schoolId?: string;
};
type TabKey = 'overview' | 'schools' | 'plans' | 'users';

const roleLabels: Record<string, string> = {
  admin: 'أدمن المنصة',
  schoolAdmin: 'مدير مدرسة',
  teacher: 'معلم',
  student: 'طالب',
};

const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50';
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

export const AdminConsole: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const tab: TabKey = requestedTab === 'schools' || requestedTab === 'plans' || requestedTab === 'users' ? requestedTab : 'overview';
  const setTab = (nextTab: TabKey) => navigate(nextTab === 'overview' ? '/' : `/admin?tab=${nextTab}`);
  const [schools, setSchools] = React.useState<SchoolRecord[]>([]);
  const [plans, setPlans] = React.useState<PlanRecord[]>([]);
  const [users, setUsers] = React.useState<UserRecord[]>([]);
  const [drafts, setDrafts] = React.useState<Record<string, { role: string; schoolId: string }>>({});
  const [loading, setLoading] = React.useState(true);
  const [dataLoadFailed, setDataLoadFailed] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [notice, setNotice] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [schoolName, setSchoolName] = React.useState('');
  const [schoolEmail, setSchoolEmail] = React.useState('');
  const [schoolPlanId, setSchoolPlanId] = React.useState('');
  const [schoolStatus, setSchoolStatus] = React.useState('trial');
  const [editingPlanId, setEditingPlanId] = React.useState<string | null>(null);
  const [planName, setPlanName] = React.useState('');
  const [planDescription, setPlanDescription] = React.useState('');
  const [planPrice, setPlanPrice] = React.useState('');
  const [planCurrency, setPlanCurrency] = React.useState('AED');
  const [planMaxTeachers, setPlanMaxTeachers] = React.useState('0');
  const [planMaxStudents, setPlanMaxStudents] = React.useState('0');
  const [planDurationDays, setPlanDurationDays] = React.useState('0');
  const [planActive, setPlanActive] = React.useState(true);
  const [planModules, setPlanModules] = React.useState<string[]>([]);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setDataLoadFailed(false);
    try {
      const [schoolSnap, planSnap, userSnap] = await Promise.all([
        getDocs(collection(db, 'schools')),
        getDocs(collection(db, 'plans')),
        getDocs(collection(db, 'users')),
      ]);
      const nextSchools = schoolSnap.docs.map((item) => ({ id: item.id, ...item.data() } as SchoolRecord));
      const nextPlans = planSnap.docs.map((item) => ({ id: item.id, ...item.data() } as PlanRecord));
      const nextUsers = userSnap.docs.map((item) => ({ uid: item.id, ...item.data() } as UserRecord));
      setSchools(nextSchools.sort((a, b) => a.name.localeCompare(b.name, 'ar')));
      setPlans(nextPlans.sort((a, b) => a.name.localeCompare(b.name, 'ar')));
      setUsers(nextUsers.sort((a, b) => (a.displayName || a.email).localeCompare(b.displayName || b.email, 'ar')));
      setDrafts(Object.fromEntries(nextUsers.map((u) => [u.uid, { role: u.role || 'student', schoolId: u.schoolId || '' }])));
      setSchoolPlanId((current) => current || nextPlans.find((plan) => plan.isActive !== false)?.id || '');
      setDataLoadFailed(false);
      setNotice(null);
    } catch (error) {
      console.error('Admin data load failed:', error);
      const errorCode = typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code || '')
        : '';
      setDataLoadFailed(true);
      const errorText = errorCode.includes('permission-denied')
        ? 'رفضت قاعدة بيانات Firestore صلاحية القراءة. يجب نشر firestore.rules على قاعدة البيانات المسماة المستخدمة في التطبيق، وليس على قاعدة (default) فقط.'
        : errorCode.includes('unavailable')
          ? 'تعذر الاتصال بخدمة Firestore حاليًا. تحقق من اتصال الإنترنت وحالة خدمة Firebase ثم أعد المحاولة.'
          : 'تعذر تحميل بيانات الإدارة من Firestore. تحقق من إعدادات قاعدة البيانات وصلاحيات حساب الأدمن.';
      setNotice({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void loadData(); }, [loadData]);

  const flash = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 5000);
  };

  const seedPlans = async () => {
    setSaving(true);
    try {
      const presets: PlanRecord[] = [
        {
          id: 'basic', name: 'الباقة الأساسية', description: 'الأساسيات اللازمة لتعلم العربية للناطقين بلغات أخرى',
          includedModules: ['letters', 'vocabulary', 'listening', 'speaking', 'reading', 'writing', 'placement'],
          maxTeachers: 0, maxStudents: 0, durationDays: 0, isActive: true, currency: 'AED',
        },
        {
          id: 'advanced', name: 'الباقة المتقدمة', description: 'مهارات اللغة مع أدوات وأنشطة تعليمية إضافية',
          includedModules: ['letters', 'vocabulary', 'listening', 'speaking', 'reading', 'writing', 'placement', 'translator', 'grammar', 'games', 'worksheets', 'quizzes', 'memory', 'achievements'],
          maxTeachers: 0, maxStudents: 0, durationDays: 0, isActive: true, currency: 'AED',
        },
        {
          id: 'complete', name: 'الباقة الشاملة', description: 'جميع الأقسام المتاحة في منصة قُل',
          includedModules: [...ALL_SCHOOL_MODULE_IDS], maxTeachers: 0, maxStudents: 0,
          durationDays: 0, isActive: true, currency: 'AED',
        },
      ];
      for (const plan of presets) {
        const { id, ...data } = plan;
        await setDoc(doc(db, 'plans', id), { ...data, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
      }
      await loadData();
      flash('success', 'تم تجهيز ثلاث باقات قابلة للتعديل. الأسعار والحدود غير محددة افتراضيًا.');
    } catch (error) {
      console.error('Default plan setup failed:', error);
      flash('error', 'تعذر إنشاء الباقات الافتراضية.');
    } finally {
      setSaving(false);
    }
  };

  const resetPlanForm = () => {
    setEditingPlanId(null);
    setPlanName('');
    setPlanDescription('');
    setPlanPrice('');
    setPlanCurrency('AED');
    setPlanMaxTeachers('0');
    setPlanMaxStudents('0');
    setPlanDurationDays('0');
    setPlanActive(true);
    setPlanModules([]);
  };

  const editPlan = (plan: PlanRecord) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.name || '');
    setPlanDescription(plan.description || '');
    setPlanPrice(plan.price === undefined ? '' : String(plan.price));
    setPlanCurrency(plan.currency || 'AED');
    setPlanMaxTeachers(String(plan.maxTeachers ?? 0));
    setPlanMaxStudents(String(plan.maxStudents ?? 0));
    setPlanDurationDays(String(plan.durationDays ?? 0));
    setPlanActive(plan.isActive !== false);
    setPlanModules(Array.isArray(plan.includedModules) ? plan.includedModules : []);
    setTab('plans');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const savePlan = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!planName.trim() || planModules.length === 0) {
      flash('error', 'اكتب اسم الباقة واختر قسمًا واحدًا على الأقل.');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        name: planName.trim(),
        description: planDescription.trim(),
        currency: planCurrency,
        includedModules: planModules,
        maxTeachers: Math.max(0, Number(planMaxTeachers) || 0),
        maxStudents: Math.max(0, Number(planMaxStudents) || 0),
        durationDays: Math.max(0, Number(planDurationDays) || 0),
        isActive: planActive,
        updatedAt: serverTimestamp(),
      };
      if (planPrice.trim() !== '') payload.price = Math.max(0, Number(planPrice) || 0);
      else if (editingPlanId) payload.price = deleteField();
      if (editingPlanId) {
        await updateDoc(doc(db, 'plans', editingPlanId), payload);
        flash('success', 'تم تحديث الباقة، وستنعكس الأقسام الجديدة على المدارس المرتبطة بها.');
      } else {
        await addDoc(collection(db, 'plans'), { ...payload, createdAt: serverTimestamp() });
        flash('success', 'تم إنشاء الباقة.');
      }
      resetPlanForm();
      await loadData();
    } catch (error) {
      console.error('Plan save failed:', error);
      flash('error', 'تعذر حفظ الباقة. تحقق من الصلاحيات والبيانات.');
    } finally {
      setSaving(false);
    }
  };

  const createSchool = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!schoolName.trim() || !schoolPlanId) {
      flash('error', 'اكتب اسم المدرسة واختر باقة.');
      return;
    }
    setSaving(true);
    try {
      const selectedPlan = plans.find((item) => item.id === schoolPlanId);
      if (!selectedPlan || selectedPlan.isActive === false) {
        flash('error', 'اختر باقة متاحة للاشتراكات الجديدة.');
        return;
      }
      await addDoc(collection(db, 'schools'), {
        name: schoolName.trim(),
        contactEmail: schoolEmail.trim(),
        planId: schoolPlanId,
        status: schoolStatus,
        ...(selectedPlan.durationDays && selectedPlan.durationDays > 0
          ? { expiresAt: new Date(Date.now() + selectedPlan.durationDays * 24 * 60 * 60 * 1000) }
          : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSchoolName('');
      setSchoolEmail('');
      setSchoolStatus('trial');
      await loadData();
      flash('success', 'تمت إضافة المدرسة وربطها بالباقة المحددة.');
    } catch (error) {
      console.error('School creation failed:', error);
      flash('error', 'تعذر إنشاء المدرسة. تحقق من إعدادات Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const saveSchool = async (school: SchoolRecord, planId: string, status: string) => {
    const selectedPlan = plans.find((item) => item.id === planId);
    if (!selectedPlan || selectedPlan.isActive === false) {
      flash('error', 'اختر باقة متاحة للاشتراكات الجديدة.');
      return;
    }
    setSaving(true);
    try {
      const expiry = school.expiresAt?.toDate ? school.expiresAt.toDate() : null;
      const renewalNeeded = planId !== school.planId || ((status === 'active' || status === 'trial') && !!expiry && expiry.getTime() < Date.now());
      const updatePayload: Record<string, any> = { planId, status, updatedAt: serverTimestamp() };
      if (renewalNeeded) {
        if (selectedPlan.durationDays && selectedPlan.durationDays > 0) {
          updatePayload.expiresAt = new Date(Date.now() + selectedPlan.durationDays * 24 * 60 * 60 * 1000);
        } else {
          updatePayload.expiresAt = deleteField();
        }
      }
      await updateDoc(doc(db, 'schools', school.id), updatePayload);
      await loadData();
      flash('success', `تم تحديث اشتراك مدرسة «${school.name}».`);
    } catch (error) {
      console.error('School update failed:', error);
      flash('error', 'تعذر تعديل اشتراك المدرسة.');
    } finally {
      setSaving(false);
    }
  };

  const saveUser = async (userRecord: UserRecord) => {
    const draft = drafts[userRecord.uid];
    if (!draft) return;
    if (draft.role === 'schoolAdmin' && !draft.schoolId) {
      flash('error', 'يجب ربط مدير المدرسة بمدرسة محددة.');
      return;
    }
    if (draft.schoolId) {
      const targetSchool = schools.find((item) => item.id === draft.schoolId);
      if (!targetSchool || !['active', 'trial'].includes(targetSchool.status || '')) {
        flash('error', 'لا يمكن إسناد حساب إلى مدرسة موقوفة أو غير موجودة.');
        return;
      }
      const targetPlan = plans.find((item) => item.id === targetSchool.planId);
      if (!targetPlan || targetPlan.isActive === false) {
        flash('error', 'مدرسة المستخدم غير مرتبطة بباقة متاحة.');
        return;
      }
      const limit = draft.role === 'teacher' ? (targetPlan.maxTeachers || 0)
        : draft.role === 'student' ? (targetPlan.maxStudents || 0) : 0;
      if (limit > 0) {
        const sameTypeCount = users.filter((item) => item.uid !== userRecord.uid && item.schoolId === draft.schoolId && item.role === draft.role).length;
        if (sameTypeCount >= limit) {
          flash('error', `وصلت المدرسة إلى الحد الأقصى المسموح به لهذه الفئة في الباقة (${limit}).`);
          return;
        }
      }
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', userRecord.uid), {
        role: draft.role,
        schoolId: draft.schoolId || deleteField(),
        updatedAt: serverTimestamp(),
      });
      await loadData();
      flash('success', `تم تحديث صلاحيات ${userRecord.displayName || userRecord.email}.`);
    } catch (error) {
      console.error('User assignment failed:', error);
      flash('error', 'تعذر تحديث الحساب. قد يحتاج الحساب إلى تسجيل الدخول مجددًا لتحديث بياناته.');
    } finally {
      setSaving(false);
    }
  };

  const currentPlanName = (planId?: string) => plans.find((plan) => plan.id === planId)?.name || 'بلا باقة';
  const userCountForSchool = (schoolId: string) => users.filter((item) => item.schoolId === schoolId).length;

  if (profile?.role !== 'admin') {
    return <div dir="rtl" className="p-8 text-center font-bold text-red-700">هذه الصفحة مخصصة لأدمن منصة قُل.</div>;
  }

  return (
    <div dir="rtl" className="h-full min-h-0 overflow-hidden bg-[#f7f8f6] text-slate-900 flex flex-col">
      <PlatformTopBar />

      <div className={`flex-1 min-h-0 ${tab === 'plans' ? 'overflow-hidden p-2 sm:p-3' : 'overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8'}`}>
        <div className={`mx-auto flex min-h-0 max-w-7xl flex-col ${tab === 'plans' ? 'h-full gap-2' : 'space-y-6'}`}>

        {notice && <div role="status" className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
          {notice.type === 'success' ? <Check size={18} /> : <Settings2 size={18} className="mt-0.5 shrink-0" />}
          <div className="flex-1 leading-6">
            {notice.text}
            {notice.type === 'error' && <div className="mt-2 space-y-2 font-normal text-amber-900">
              <p>لم يتم حذف أي بيانات. يحتاج حسابك إلى صلاحية قراءة قاعدة بيانات Firestore المستخدمة في قُل.</p>
              <p className="text-xs leading-5 text-amber-800">قاعدة البيانات المطلوبة: <code dir="ltr" className="rounded bg-amber-100 px-1 py-0.5">ai-studio-d8ed89a2-6662-4aa5-9cc7-1e8d0693722e</code></p>
              <a href="https://console.firebase.google.com/project/gen-lang-client-0558881211/firestore" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-950 transition hover:bg-amber-100">
                فتح إعدادات قاعدة البيانات <span aria-hidden="true">↗</span>
              </a>
              <p className="text-xs leading-5 text-amber-800">في Firebase، اختر قاعدة البيانات المذكورة، ثم Rules، وانشر محتوى ملف <code dir="ltr">firestore.rules</code> من GitHub. بعدها ارجع إلى هنا واضغط «تحديث البيانات».</p>
            </div>}
          </div>
          <button onClick={() => setNotice(null)} aria-label="إغلاق التنبيه" className="rounded-lg p-1 text-current/70 hover:bg-black/5"><X size={16}/></button>
        </div>}

        {loading ? <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500"><LoaderCircle className="animate-spin" /> جارٍ تحميل بيانات المنصة...</div> : (
          <>
            {tab === 'overview' && <section>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: 'المدارس', english: 'SCHOOLS', icon: Building2, color: 'from-blue-600 to-indigo-700', href: '/admin?tab=schools' },
                  { title: 'الباقات والأقسام', english: 'PLANS', icon: Layers3, color: 'from-emerald-600 to-emerald-800', href: '/admin?tab=plans' },
                  { title: 'الحسابات والصلاحيات', english: 'ACCOUNTS', icon: Users, color: 'from-violet-600 to-purple-800', href: '/admin?tab=users' },
                ].map((item) => (
                  <motion.button key={item.href} whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }} whileTap={{ scale: 0.98 }} layout onClick={() => navigate(item.href)} className="relative group p-3 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:border-blue-200 transition-colors text-right">
                    <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white mb-2 shadow-md mr-0 ml-auto`}><item.icon size={18}/></div>
                    <div className="text-right">
                      <h4 className="text-[8px] font-black text-slate-400 uppercase mb-0.5">{item.english}</h4>
                      <h3 className="text-base font-black text-slate-800 mb-0.5 arabic-font leading-normal pb-1">{item.title}</h3>
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-1 text-[8px] font-black text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">فتح القسم <ChevronLeft size={8}/></div>
                  </motion.button>
                ))}
              </div>
            </section>}

            {tab === 'schools' && <section className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
                <h2 className="mb-1 flex items-center gap-2 text-xl font-black"><Plus size={20} className="text-emerald-700"/> إضافة مدرسة</h2>
                <p className="mb-5 text-sm leading-6 text-slate-500">يُنشأ سجل المدرسة ويُربط بالباقة، ثم يمكن إسناد مدير المدرسة من قسم الحسابات.</p>
                <form onSubmit={createSchool} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <label className="space-y-1.5 text-sm font-bold">اسم المدرسة<input className={inputClass} value={schoolName} onChange={e => setSchoolName(e.target.value)} required placeholder="اسم المدرسة"/></label>
                  <label className="space-y-1.5 text-sm font-bold">بريد التواصل <span className="font-normal text-slate-400">(اختياري)</span><input className={inputClass} type="email" value={schoolEmail} onChange={e => setSchoolEmail(e.target.value)} placeholder="school@example.com"/></label>
                  <label className="space-y-1.5 text-sm font-bold">الباقة<select className={inputClass} value={schoolPlanId} onChange={e => setSchoolPlanId(e.target.value)} required><option value="">اختر باقة</option>{plans.filter(p => p.isActive !== false).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
                  <label className="space-y-1.5 text-sm font-bold">حالة الاشتراك<select className={inputClass} value={schoolStatus} onChange={e => setSchoolStatus(e.target.value)}><option value="trial">فترة تجريبية</option><option value="active">فعّال</option><option value="suspended">موقوف</option></select></label>
                  <div className="md:col-span-2 xl:col-span-4"><button disabled={saving || plans.filter(p => p.isActive !== false).length === 0} className={`${buttonClass} bg-emerald-800 text-white hover:bg-emerald-900`}><Plus size={17}/>{saving ? 'جارٍ الحفظ...' : 'إنشاء المدرسة'}</button>{plans.length === 0 && <p className="mt-2 text-xs text-amber-700">أنشئ الباقات أولًا من قسم الباقات والأقسام.</p>}</div>
                </form>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="mb-4 text-xl font-black">المدارس المسجلة ({schools.length})</h2>
                {schools.length === 0 ? <EmptyState message="لا توجد مدارس بعد."/> : <div className="space-y-3">{schools.map(school => <SchoolSubscriptionRow key={school.id} school={school} plans={plans} usersCount={userCountForSchool(school.id)} disabled={saving} onSave={saveSchool}/>)}</div>}
              </div>
            </section>}

            {tab === 'plans' && <section className="grid min-h-0 flex-1 items-stretch gap-3 overflow-hidden xl:grid-cols-[minmax(0,1.45fr)_minmax(290px,0.75fr)]">
              <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-base font-bold">{editingPlanId ? 'تعديل الباقة' : 'إنشاء باقة جديدة'}</h2>
                    <p className="mt-0.5 text-[11px] text-slate-500">0 تعني غير محدود، والسعر اختياري.</p>
                  </div>
                  {editingPlanId && <button onClick={resetPlanForm} className="shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold">إلغاء</button>}
                </div>
                <form onSubmit={savePlan} className="flex min-h-0 flex-1 flex-col gap-2">
                  <div className="grid shrink-0 grid-cols-2 gap-2">
                    <label className="space-y-1 text-xs font-semibold">اسم الباقة
                      <input className={inputClass} value={planName} onChange={e => setPlanName(e.target.value)} required placeholder="مثال: الباقة المتقدمة"/>
                    </label>
                    <label className="space-y-1 text-xs font-semibold">السعر <span className="font-normal text-slate-400">(اختياري)</span>
                      <div className="flex gap-1.5">
                        <input type="number" min="0" step="0.01" className={inputClass} value={planPrice} onChange={e => setPlanPrice(e.target.value)} placeholder="غير محدد"/>
                        <select aria-label="عملة السعر" className="w-[76px] shrink-0 rounded-lg border border-slate-200 px-1 text-xs" value={planCurrency} onChange={e => setPlanCurrency(e.target.value)}><option value="AED">AED</option><option value="USD">USD</option><option value="SAR">SAR</option></select>
                      </div>
                    </label>
                  </div>
                  <label className="block shrink-0 space-y-1 text-xs font-semibold">وصف الباقة
                    <textarea className={inputClass} rows={1} value={planDescription} onChange={e => setPlanDescription(e.target.value)} placeholder="الفئة المستهدفة وما تضمه الباقة"/>
                  </label>
                  <div className="grid shrink-0 grid-cols-3 gap-2">
                    <NumberField label="الحد الأقصى للمعلمين" value={planMaxTeachers} onChange={setPlanMaxTeachers}/>
                    <NumberField label="الحد الأقصى للطلاب" value={planMaxStudents} onChange={setPlanMaxStudents}/>
                    <NumberField label="المدة (يوم)" value={planDurationDays} onChange={setPlanDurationDays}/>
                  </div>
                  <label className="flex shrink-0 items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs font-semibold">
                    <input type="checkbox" checked={planActive} onChange={e => setPlanActive(e.target.checked)} className="h-4 w-4 accent-emerald-700"/>
                    الباقة متاحة للاشتراكات الجديدة
                  </label>
                  <div className="min-h-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold">أقسام الباقة</h3>
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800">{planModules.length} من {SCHOOL_MODULES.length}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 md:grid-cols-4 2xl:grid-cols-5">
                      {SCHOOL_MODULES.map(module => <label key={module.id} title={module.description} className={`flex min-w-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors ${planModules.includes(module.id) ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input type="checkbox" checked={planModules.includes(module.id)} onChange={e => setPlanModules(old => e.target.checked ? [...old, module.id] : old.filter(id => id !== module.id))} className="h-3.5 w-3.5 shrink-0 accent-emerald-700"/>
                        <span className="truncate text-[11px] font-medium leading-4">{module.label}</span>
                      </label>)}
                    </div>
                  </div>
                  <button disabled={saving} className={`${buttonClass} mt-0 w-full shrink-0 justify-center bg-emerald-800 py-2 text-sm text-white hover:bg-emerald-900`}><Check size={16}/>{saving ? 'جارٍ الحفظ...' : editingPlanId ? 'حفظ التعديلات' : 'إنشاء الباقة'}</button>
                </form>
              </div>
              <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
                  <h3 className="text-base font-bold">الباقات الحالية</h3>
                  <span className="text-xs text-slate-500">{plans.length} باقات</span>
                </div>
                <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
                  {plans.length ? plans.map(plan => <button key={plan.id} onClick={() => editPlan(plan)} className={`w-full rounded-lg border px-3 py-2 text-right transition-colors hover:border-emerald-400 ${editingPlanId === plan.id ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{plan.name}</span>
                      <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${plan.isActive === false ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-800'}`}>{plan.isActive === false ? 'موقوفة' : 'متاحة'}</span>
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[10px] text-slate-500">
                      <span>{(plan.includedModules || []).length} قسم</span>
                      <span>{schools.filter(s => s.planId === plan.id).length} مدرسة</span>
                      {typeof plan.price === 'number' && <span>{plan.price} {plan.currency || 'AED'}</span>}
                    </span>
                  </button>) : <EmptyState message="لا توجد باقات بعد."/>}
                </div>
                {plans.length === 0 && <button onClick={() => void seedPlans()} disabled={saving} className={`${buttonClass} mt-2 w-full shrink-0 justify-center bg-emerald-800 py-2 text-sm text-white`}><Layers3 size={15}/> إنشاء الباقات المقترحة</button>}
              </div>
            </section>}

            {tab === 'users' && <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
              <div className="mb-5"><h2 className="text-xl font-black">الحسابات والصلاحيات ({users.length})</h2><p className="mt-1 text-sm leading-6 text-slate-500">يجب على المستخدم تسجيل الدخول مرة واحدة على الأقل حتى يظهر هنا. لا يمكن تغيير دور أدمن المنصة من هذه الشاشة.</p></div>
              {users.length === 0 ? <EmptyState message="لم تظهر حسابات بعد."/> : <div className="space-y-3">{users.map(userRecord => {
                const draft = drafts[userRecord.uid] || { role: userRecord.role, schoolId: userRecord.schoolId || '' };
                const isPlatformAdmin = userRecord.role === 'admin';
                return <div key={userRecord.uid} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[minmax(0,1.2fr)_minmax(130px,0.7fr)_minmax(170px,0.9fr)_auto] md:items-center">
                  <div className="min-w-0"><div className="truncate font-bold">{userRecord.displayName || 'مستخدم قُل'}</div><div className="truncate text-xs text-slate-500">{userRecord.email}</div><div className="mt-1 text-[11px] text-slate-400">UID: {userRecord.uid}</div></div>
                  {isPlatformAdmin ? <div className="rounded-xl bg-violet-50 px-3 py-2 text-sm font-bold text-violet-800">أدمن المنصة</div> : <label className="space-y-1 text-xs font-bold text-slate-500">الدور<select className={inputClass} value={draft.role} onChange={e => setDrafts(old => ({ ...old, [userRecord.uid]: { ...draft, role: e.target.value } }))}><option value="student">طالب</option><option value="teacher">معلم</option><option value="schoolAdmin">مدير مدرسة</option></select></label>}
                  <label className="space-y-1 text-xs font-bold text-slate-500">المدرسة المرتبط بها<select disabled={isPlatformAdmin} className={inputClass} value={draft.schoolId} onChange={e => setDrafts(old => ({ ...old, [userRecord.uid]: { ...draft, schoolId: e.target.value } }))}><option value="">حساب مستقل</option>{schools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label>
                  <button disabled={saving || isPlatformAdmin || (draft.role === userRecord.role && draft.schoolId === (userRecord.schoolId || ''))} onClick={() => void saveUser(userRecord)} className={`${buttonClass} bg-slate-900 text-white hover:bg-slate-700`}><Check size={15}/> حفظ</button>
                </div>;
              })}</div>}
            </section>}
          </>
        )}

        </div>
      </div>
    </div>
  );
};

const SchoolSubscriptionRow: React.FC<{ school: SchoolRecord; plans: PlanRecord[]; usersCount: number; disabled: boolean; onSave: (school: SchoolRecord, planId: string, status: string) => Promise<void> }> = ({ school, plans, usersCount, disabled, onSave }) => {
  const [planId, setPlanId] = React.useState(school.planId || '');
  const [status, setStatus] = React.useState(school.status || 'trial');
  React.useEffect(() => { setPlanId(school.planId || ''); setStatus(school.status || 'trial'); }, [school.planId, school.status]);
  return <div className="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_minmax(160px,0.8fr)_minmax(130px,0.6fr)_auto] md:items-center">
    <div className="min-w-0"><div className="truncate font-black">{school.name}</div><div className="mt-1 truncate text-xs text-slate-500">{school.contactEmail || 'لا يوجد بريد تواصل'}</div><div className="mt-1 text-xs text-slate-500">{usersCount} مستخدم مرتبط</div><div className="mt-1 text-[10px] text-slate-400">معرّف المدرسة: {school.id}</div></div>
    <label className="space-y-1 text-xs font-bold text-slate-500">الباقة<select className={inputClass} value={planId} onChange={e => setPlanId(e.target.value)}><option value="">بلا باقة</option>{plans.map(p => <option key={p.id} value={p.id}>{p.name}{p.isActive === false ? ' (موقوفة)' : ''}</option>)}</select></label>
    <label className="space-y-1 text-xs font-bold text-slate-500">الحالة<select className={inputClass} value={status} onChange={e => setStatus(e.target.value)}><option value="trial">فترة تجريبية</option><option value="active">فعّال</option><option value="suspended">موقوف</option></select></label>
    <button disabled={disabled || !planId || (planId === school.planId && status === school.status)} onClick={() => void onSave(school, planId, status)} className={`${buttonClass} bg-emerald-800 text-white hover:bg-emerald-900`}><Check size={15}/> حفظ</button>
  </div>;
};

const NumberField: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <label className="space-y-1.5 text-sm font-bold">{label}<input type="number" min="0" step="1" className={inputClass} value={value} onChange={e => onChange(e.target.value)}/><span className="block text-[11px] font-normal text-slate-400">0 = غير محدود</span></label>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">{message}</div>;
