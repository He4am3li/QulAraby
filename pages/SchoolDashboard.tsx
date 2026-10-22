import React from 'react';
import { Building2, CheckCircle2, Clock3, Layers3, LoaderCircle, Users } from 'lucide-react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../components/AuthProvider';
import { SCHOOL_MODULES } from '../config/schoolPlans';
import { FallingLetters } from '../components/Layout';

type SchoolRecord = { name: string; status?: string; planId?: string; contactEmail?: string; expiresAt?: any; enabledModules?: string[] };
type PlanRecord = { name: string; description?: string; includedModules?: string[]; price?: number; currency?: string; maxTeachers?: number; maxStudents?: number; durationDays?: number };

export const SchoolDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [school, setSchool] = React.useState<SchoolRecord | null>(null);
  const [plan, setPlan] = React.useState<PlanRecord | null>(null);
  const [memberCount, setMemberCount] = React.useState(0);
  const [teacherCount, setTeacherCount] = React.useState(0);
  const [studentCount, setStudentCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      if (!profile?.schoolId) {
        setError('لم يتم ربط هذا الحساب بمدرسة. يرجى التواصل مع أدمن منصة قُل.');
        setLoading(false);
        return;
      }
      try {
        const [schoolSnap, membersSnap] = await Promise.all([
          getDoc(doc(db, 'schools', profile.schoolId)),
          getDocs(query(collection(db, 'users'), where('schoolId', '==', profile.schoolId))),
        ]);
        if (!schoolSnap.exists()) throw new Error('لم يتم العثور على بيانات المدرسة.');
        const schoolData = schoolSnap.data() as SchoolRecord;
        let planData: PlanRecord | null = null;
        if (schoolData.planId) {
          const planSnap = await getDoc(doc(db, 'plans', schoolData.planId));
          if (planSnap.exists()) planData = planSnap.data() as PlanRecord;
        }
        if (!active) return;
        const members = membersSnap.docs.map(d => d.data() as { role?: string });
        setSchool(schoolData);
        setPlan(planData);
        setMemberCount(members.length);
        setTeacherCount(members.filter(m => m.role === 'teacher').length);
        setStudentCount(members.filter(m => m.role === 'student').length);
      } catch (e) {
        console.error('School dashboard load failed:', e);
        if (active) setError('تعذر تحميل بيانات المدرسة. تحقق من صلاحيات Firestore أو تواصل مع أدمن المنصة.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [profile?.schoolId]);

  if (loading) return <div className="flex min-h-80 items-center justify-center gap-3 text-slate-500"><LoaderCircle className="animate-spin"/> جارٍ تحميل لوحة المدرسة...</div>;
  if (error) return <div dir="rtl" className="p-4 md:p-6"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 font-bold text-amber-900">{error}</div></div>;
  const modules = (school?.enabledModules || plan?.includedModules || []).map(id => SCHOOL_MODULES.find(module => module.id === id)).filter(Boolean);
  const status = school?.status === 'active' ? 'فعّال' : school?.status === 'trial' ? 'فترة تجريبية' : 'موقوف';
  const expiresAt = school?.expiresAt?.toDate ? school.expiresAt.toDate().toLocaleDateString('ar-AE') : null;

  return <div dir="rtl" className="min-h-full bg-white text-slate-900 flex flex-col">
    <header className="bg-gradient-to-l from-[#0f172a]/95 to-[#064e3b]/95 backdrop-blur-lg px-6 md:px-8 py-5 md:py-6 flex items-center justify-between shrink-0 shadow-lg relative z-10 overflow-hidden border-b border-white/20 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FallingLetters mode="compact" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
      </div>
      <div className="relative z-10 flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 shrink-0 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20"><Building2 size={20}/></div>
        <div className="min-w-0">
          <span className="block text-lg font-bold arabic-font tracking-wide">{school?.name || 'لوحة المدرسة'}</span>
          <span className="block mt-1 text-xs text-white/65">بوابة المدرسة · منصة قُل</span>
        </div>
      </div>
    </header>
    <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Layers3} label="الباقة الحالية" value={plan?.name || 'غير محددة'}/>
        <Metric icon={Users} label="إجمالي الحسابات" value={memberCount}/>
        <Metric icon={Users} label="المعلمون" value={teacherCount}/>
        <Metric icon={Users} label="الطلاب" value={studentCount}/>
      </div>
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
          <h2 className="mb-1 text-xl font-black">الأقسام المتاحة لمدرستك</h2>
          <p className="mb-5 text-sm leading-6 text-slate-500">تتحدد هذه القائمة وفق الباقة المخصصة لمدرستك. تواصل مع إدارة قُل لطلب إضافة أقسام أو ترقية الاشتراك.</p>
          {modules.length ? <div className="grid gap-3 sm:grid-cols-2">{modules.map(module => <div key={module!.id} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3"><span className="mt-0.5 text-emerald-700"><CheckCircle2 size={18}/></span><div><div className="font-bold">{module!.label}</div><div className="mt-1 text-xs leading-5 text-slate-500">{module!.description}</div></div></div>)}</div> : <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">لا توجد أقسام مفعّلة حاليًا. يرجى التواصل مع أدمن المنصة.</div>}
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="mb-4 text-lg font-black">حالة الاشتراك</h2><div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><Clock3 size={21}/></span><div><div className="font-black">{status}</div><div className="mt-1 text-xs text-slate-500">{expiresAt ? `ينتهي في ${expiresAt}` : 'تاريخ الانتهاء غير محدد'}</div></div></div>{school?.contactEmail && <p className="mt-4 text-sm text-slate-600">بريد التواصل: <span className="font-bold">{school.contactEmail}</span></p>}</div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-900"><strong>هل تحتاج إلى تغيير الباقة؟</strong><p className="mt-2">أرسل طلبك إلى مسؤول منصة قُل لإضافة أقسام أو زيادة السعة المخصصة لمدرستك. تعديل الباقات متاح فقط لأدمن المنصة.</p></div>
        </div>
      </section>
      </div>
    </div>
  </div>;
};

const Metric: React.FC<{ icon: React.ElementType; label: string; value: string | number }> = ({ icon: Icon, label, value }) => <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-2 text-sm font-bold text-slate-500"><span>{label}</span><Icon size={20} className="text-emerald-700"/></div><div className="mt-3 text-2xl font-black">{value}</div></div>;
