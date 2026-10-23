import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity, Building2, Check, ChevronDown, CircleDollarSign, GraduationCap, Layers3,
  LoaderCircle, Plus, RefreshCw, School, Settings2, ShieldCheck, Users, X
} from 'lucide-react';
import {
  addDoc, collection, deleteField, doc, getDocs, serverTimestamp, setDoc, updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { ALL_SCHOOL_MODULE_IDS, SCHOOL_MODULES } from '../config/schoolPlans';
import { useAuth } from '../components/AuthProvider';

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
      setDataLoadFailed(true);
      setNotice({ type: 'error', text: 'تعذر تحميل البيانات من Firestore. الأرقام غير متاحة حتى تُنشر قواعد Firestore الصحيحة على قاعدة بيانات المشروع.' });
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
    <div dir="rtl" className="min-h-full bg-[#f7f8f6] text-slate-900 flex flex-col">
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between md:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800">
            <ShieldCheck size={21} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wide text-emerald-800">قُل · الإدارة العامة</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">مركز إدارة المنصة</h1>
            <p className="mt-1 text-sm text-slate-500">المدارس، الاشتراكات، والأقسام التعليمية</p>
          </div>
        </div>
        <button onClick={() => void loadData()} disabled={loading} className={`${buttonClass} self-start border border-slate-300 bg-white text-slate-700 hover:border-emerald-700 hover:text-emerald-800 sm:self-auto`}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> تحديث البيانات
        </button>
      </header>
      <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">

        {notice && <div role="status" className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-bold ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
          {notice.type === 'success' ? <Check size={18} /> : <Settings2 size={18} className="mt-0.5 shrink-0" />}
          <div className="flex-1 leading-6">
            {notice.text}
            {notice.type === 'error' && <div className="mt-1 font-normal text-amber-800">لم يتم حذف أي بيانات. لوحة الإدارة لا تستطيع عرض الأعداد أو تعديل سجلات المدارس حتى تُراجع صلاحيات قاعدة البيانات.</div>}
          </div>
          <button onClick={() => setNotice(null)} aria-label="إغلاق التنبيه" className="rounded-lg p-1 text-current/70 hover:bg-black/5"><X size={16}/></button>
        </div>}

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700"><GraduationCap size={19}/></div>
            <div>
              <h2 className="text-sm font-black text-slate-900">تطوير وتجربة الواجهات</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">للتنقل بين الأدمن العام ومدير المدرسة والمعلم والطالب، استخدم زر «معاينة» الثابت أسفل يسار الشاشة.</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-900"><span className="h-2 w-2 rounded-full bg-emerald-500"/> أداة المعاينة جاهزة</span>
        </div>

        {loading ? <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500"><LoaderCircle className="animate-spin" /> جارٍ تحميل بيانات المنصة...</div> : (
          <>
            {tab === 'overview' && <section className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'المدارس المسجلة', value: dataLoadFailed ? '—' : schools.length, icon: Building2, tone: 'bg-blue-50 text-blue-700' },
                  { label: 'المدارس الفعّالة والتجريبية', value: dataLoadFailed ? '—' : schools.filter(s => s.status === 'active' || s.status === 'trial').length, icon: School, tone: 'bg-emerald-50 text-emerald-700' },
                  { label: 'الباقات المعرّفة', value: dataLoadFailed ? '—' : plans.length, icon: Layers3, tone: 'bg-violet-50 text-violet-700' },
                  { label: 'الحسابات المسجلة', value: dataLoadFailed ? '—' : users.length, icon: Users, tone: 'bg-amber-50 text-amber-700' },
                ].map((item) => <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-500">{item.label}</span><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}><item.icon size={21} /></span></div>
                  <div className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">{item.value}</div>
                </div>)}
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black">أحدث المدارس المسجلة</h2><button className="text-sm font-bold text-emerald-800" onClick={() => setTab('schools')}>إدارة المدارس</button></div>
                  {dataLoadFailed ? <EmptyState message="تعذر تحميل بيانات المدارس. انشر قواعد Firestore ثم أعد المحاولة." /> : schools.length ? <div className="space-y-3">{schools.slice(0, 5).map(school => <div key={school.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div className="min-w-0"><div className="truncate font-bold">{school.name}</div><div className="mt-1 text-xs text-slate-500">{currentPlanName(school.planId)} · {userCountForSchool(school.id)} مستخدم</div></div><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${school.status === 'active' ? 'bg-emerald-100 text-emerald-800' : school.status === 'trial' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>{school.status === 'active' ? 'فعّالة' : school.status === 'trial' ? 'تجريبية' : school.status === 'suspended' ? 'موقوفة' : 'غير محددة'}</span></div>)}</div> : <EmptyState message="لم تُضف مدارس بعد. ابدأ بإنشاء أول مدرسة." />}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black">الباقات والأقسام</h2><button className="text-sm font-bold text-emerald-800" onClick={() => setTab('plans')}>إدارة الباقات</button></div>
                  {dataLoadFailed ? <EmptyState message="تعذر تحميل الباقات من قاعدة البيانات." /> : plans.length ? <div className="space-y-3">{plans.map(plan => <div key={plan.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div className="min-w-0"><div className="font-bold">{plan.name}</div><div className="mt-1 text-xs text-slate-500">{(plan.includedModules || []).length} قسم · {schools.filter(s => s.planId === plan.id).length} مدرسة</div></div><button onClick={() => editPlan(plan)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:border-emerald-400">تعديل</button></div>)}</div> : <div className="space-y-3"><EmptyState message="لم تُنشأ باقات بعد." /><button onClick={() => void seedPlans()} disabled={saving} className={`${buttonClass} bg-emerald-800 text-white hover:bg-emerald-900`}><Plus size={16}/> إنشاء الباقات المقترحة</button></div>}
                </div>
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

            {tab === 'plans' && <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black">{editingPlanId ? 'تعديل الباقة' : 'إنشاء باقة جديدة'}</h2><p className="mt-1 text-sm text-slate-500">حدد الأقسام والحدود. القيمة 0 تعني غير محدود، والسعر اختياري.</p></div>{editingPlanId && <button onClick={resetPlanForm} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold">إلغاء التعديل</button>}</div>
                <form onSubmit={savePlan} className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1.5 text-sm font-bold">اسم الباقة<input className={inputClass} value={planName} onChange={e => setPlanName(e.target.value)} required placeholder="مثال: الباقة المتقدمة"/></label>
                    <label className="space-y-1.5 text-sm font-bold">السعر <span className="font-normal text-slate-400">(اختياري)</span><div className="flex gap-2"><input type="number" min="0" step="0.01" className={inputClass} value={planPrice} onChange={e => setPlanPrice(e.target.value)} placeholder="لم يحدد"/><select className="w-28 rounded-xl border border-slate-200 px-2 text-sm" value={planCurrency} onChange={e => setPlanCurrency(e.target.value)}><option value="AED">AED</option><option value="USD">USD</option><option value="SAR">SAR</option></select></div></label>
                  </div>
                  <label className="block space-y-1.5 text-sm font-bold">وصف الباقة<textarea className={inputClass} rows={2} value={planDescription} onChange={e => setPlanDescription(e.target.value)} placeholder="الفئة المستهدفة وما تضمه الباقة"/></label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <NumberField label="الحد الأقصى للمعلمين" value={planMaxTeachers} onChange={setPlanMaxTeachers}/>
                    <NumberField label="الحد الأقصى للطلاب" value={planMaxStudents} onChange={setPlanMaxStudents}/>
                    <NumberField label="مدة الاشتراك بالأيام" value={planDurationDays} onChange={setPlanDurationDays}/>
                  </div>
                  <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-bold"><input type="checkbox" checked={planActive} onChange={e => setPlanActive(e.target.checked)} className="h-4 w-4 accent-emerald-700"/> الباقة متاحة للاشتراكات الجديدة</label>
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-black">أقسام الباقة</h3><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{planModules.length} من {SCHOOL_MODULES.length} قسم</span></div>
                    <div className="grid gap-2 sm:grid-cols-2">{SCHOOL_MODULES.map(module => <label key={module.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${planModules.includes(module.id) ? 'border-emerald-300 bg-emerald-50/70' : 'border-slate-200 hover:border-slate-300'}`}><input type="checkbox" checked={planModules.includes(module.id)} onChange={e => setPlanModules(old => e.target.checked ? [...old, module.id] : old.filter(id => id !== module.id))} className="mt-1 h-4 w-4 accent-emerald-700"/><span><span className="block text-sm font-bold">{module.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{module.description}</span></span></label>)}</div>
                  </div>
                  <button disabled={saving} className={`${buttonClass} w-full bg-emerald-800 text-white hover:bg-emerald-900`}><Check size={17}/>{saving ? 'جارٍ الحفظ...' : editingPlanId ? 'حفظ تعديلات الباقة' : 'إنشاء الباقة'}</button>
                </form>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="mb-3 font-black">الباقات الحالية</h3>{plans.length ? <div className="space-y-3">{plans.map(plan => <button key={plan.id} onClick={() => editPlan(plan)} className={`w-full rounded-xl border p-4 text-right transition hover:border-emerald-400 ${editingPlanId === plan.id ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'}`}><div className="flex items-center justify-between gap-2"><span className="font-black">{plan.name}</span><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${plan.isActive === false ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-800'}`}>{plan.isActive === false ? 'موقوفة' : 'متاحة'}</span></div><div className="mt-2 text-xs text-slate-500">{(plan.includedModules || []).length} قسم · {schools.filter(s => s.planId === plan.id).length} مدرسة مرتبطة</div><div className="mt-3 flex flex-wrap gap-1">{(plan.includedModules || []).slice(0, 5).map(id => <span key={id} className="rounded-md bg-slate-100 px-2 py-1 text-[10px]">{SCHOOL_MODULES.find(m => m.id === id)?.label || id}</span>)}{(plan.includedModules || []).length > 5 && <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px]">+{plan.includedModules.length - 5}</span>}</div></button>)}</div> : <EmptyState message="ابدأ بإنشاء أول باقة، أو جهز الباقات المقترحة."/>}
                  {plans.length === 0 && <button onClick={() => void seedPlans()} disabled={saving} className={`${buttonClass} mt-4 w-full bg-emerald-800 text-white`}><Layers3 size={16}/> إنشاء الباقات المقترحة</button>}
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900"><CircleDollarSign size={19} className="mb-2"/><strong>التحكم التجاري مرن:</strong> الأسعار والحدود غير مفروضة من الكود. ويمكن تعديل أقسام الباقة لاحقًا، وتظهر الأقسام الجديدة للمدارس المرتبطة بها ما لم توجد صلاحية مخصصة للمدرسة.</div>
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
        <footer className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><Settings2 size={20} className="mt-0.5 shrink-0"/><p><strong>ملاحظة تشغيلية:</strong> هذه اللوحة تدير سجلات المدارس والباقات وإسناد الحسابات. بوابات الدفع، الفوترة الآلية، دعوات الحسابات بالبريد، وإحصاءات الاستخدام التفصيلية تحتاج تكاملات مستقلة قبل الإطلاق التجاري.</p></footer>
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
