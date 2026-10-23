import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, Clock3, Layers3, LoaderCircle, Users } from 'lucide-react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../components/AuthProvider';
import { SCHOOL_MODULES } from '../config/schoolPlans';
import { PlatformTopBar } from '../components/PlatformTopBar';

type SchoolRecord = { name: string; status?: string; planId?: string; contactEmail?: string; expiresAt?: any; enabledModules?: string[] };
type MemberRecord = { uid: string; displayName?: string; email?: string; role?: string };
type PlanRecord = { name: string; description?: string; includedModules?: string[]; price?: number; currency?: string; maxTeachers?: number; maxStudents?: number; durationDays?: number };

export const SchoolDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedTab = searchParams.get('tab');
  const activeTab: 'overview' | 'team' | 'subscription' = requestedTab === 'team' || requestedTab === 'subscription' ? requestedTab : 'overview';
  const [school, setSchool] = React.useState<SchoolRecord | null>(null);
  const [plan, setPlan] = React.useState<PlanRecord | null>(null);
  const [memberCount, setMemberCount] = React.useState(0);
  const [teacherCount, setTeacherCount] = React.useState(0);
  const [studentCount, setStudentCount] = React.useState(0);
  const [members, setMembers] = React.useState<MemberRecord[]>([]);
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
      if (profile.schoolId === '__demo__') {
        setSchool({
          name: 'مدرسة تجريبية، بيانات للعرض فقط',
          status: 'trial',
          contactEmail: 'demo@example.com',
        });
        setPlan({
          name: 'الباقة الشاملة التجريبية',
          description: 'بيانات توضيحية غير مرتبطة بمدرسة حقيقية',
          includedModules: SCHOOL_MODULES.map(module => module.id),
          maxTeachers: 0,
          maxStudents: 0,
          durationDays: 30,
        });
        setMemberCount(27);
        setTeacherCount(3);
        setStudentCount(24);
        setMembers([
          { uid: 'demo-t1', displayName: 'معلم تجريبي 1', email: 'teacher1@example.com', role: 'teacher' },
          { uid: 'demo-t2', displayName: 'معلم تجريبي 2', email: 'teacher2@example.com', role: 'teacher' },
          { uid: 'demo-t3', displayName: 'معلم تجريبي 3', email: 'teacher3@example.com', role: 'teacher' },
          { uid: 'demo-s1', displayName: 'طالب تجريبي 1', email: 'student1@example.com', role: 'student' },
          { uid: 'demo-s2', displayName: 'طالب تجريبي 2', email: 'student2@example.com', role: 'student' },
          { uid: 'demo-s3', displayName: 'طالب تجريبي 3', email: 'student3@example.com', role: 'student' },
        ]);
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
        const memberData = membersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as MemberRecord));
        setMembers(memberData);
        setSchool(schoolData);
        setPlan(planData);
        setMemberCount(memberData.length);
        setTeacherCount(memberData.filter(m => m.role === 'teacher').length);
        setStudentCount(memberData.filter(m => m.role === 'student').length);
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

  return <div dir="rtl" className="min-h-full bg-[#f7f8f6] text-slate-900 flex flex-col">
    <PlatformTopBar />
    {profile?.schoolId === '__demo__' && <div className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-900"><CheckCircle2 size={17} className="shrink-0"/> وضع معاينة تجريبي. الأعداد وبيانات المدرسة الظاهرة أمثلة توضيحية وليست بيانات حقيقية.</div>}
    <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-5 md:px-7">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800"><Building2 size={21} strokeWidth={1.8}/></div>
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-wide text-emerald-800">قُل · بوابة المدرسة</p>
        <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{school?.name || 'لوحة المدرسة'}</h1>
        <p className="mt-1 text-sm text-slate-500">الاشتراك، المستخدمون، والأقسام المتاحة لمدرستك</p>
      </div>
    </header>
    <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
      {activeTab === 'overview' && <>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-emerald-800">قُل · بوابة المدرسة</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">الرئيسية</h2>
            <p className="mt-1 text-sm text-slate-500">الوصول السريع إلى إدارة فريق المدرسة واشتراكها.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-500">
          {[
            { title: 'المعلمون والطلاب', english: 'SCHOOL TEAM', icon: Users, color: 'from-blue-600 to-indigo-700', href: '/school?tab=team' },
            { title: 'الاشتراك والأقسام', english: 'SUBSCRIPTION', icon: Layers3, color: 'from-emerald-600 to-emerald-800', href: '/school?tab=subscription' },
          ].map((item) => (
            <button key={item.href} onClick={() => navigate(item.href)} className="group relative rounded-[1.5rem] border border-slate-100 bg-white p-3 text-right shadow-sm transition-colors hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20">
              <span className={`mb-2 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${item.color} text-white shadow-md transition-transform group-hover:scale-105`}><item.icon size={18} strokeWidth={1.9}/></span>
              <span className="block text-[8px] font-black uppercase leading-none text-slate-400">{item.english}</span>
              <span className="mt-1 block pb-1 text-base font-black leading-normal text-slate-800">{item.title}</span>
              <span className="mt-2 flex items-center justify-end gap-1 text-[9px] font-black text-emerald-700 opacity-0 transition-opacity group-hover:opacity-100">فتح القسم ←</span>
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Layers3} label="الباقة الحالية" value={plan?.name || 'غير محددة'}/>
          <Metric icon={Users} label="إجمالي الحسابات" value={memberCount}/>
          <Metric icon={Users} label="المعلمون" value={teacherCount}/>
          <Metric icon={Users} label="الطلاب" value={studentCount}/>
        </div>
        <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-bold">ملخص الاشتراك</h2><p className="mt-1 text-sm text-slate-500">نظرة سريعة على باقة المدرسة وحالتها.</p></div>
            <button onClick={() => navigate('/school?tab=subscription')} className="text-sm font-semibold text-emerald-800 hover:text-emerald-950">عرض التفاصيل</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">الباقة</p><p className="mt-1 font-semibold">{plan?.name || 'غير محددة'}</p></div>
            <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">حالة الاشتراك</p><p className="mt-1 font-semibold">{status}</p></div>
            <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">انتهاء الاشتراك</p><p className="mt-1 font-semibold">{expiresAt || 'غير محدد'}</p></div>
          </div>
        </section>
      </>}
      {activeTab === 'team' && <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold">المعلمون والطلاب</h2><p className="mt-1 text-sm text-slate-500">الحسابات المرتبطة بمدرستك فقط.</p></div>
        {members.filter(m => m.role === 'teacher' || m.role === 'student').length ? <div className="overflow-x-auto"><table className="w-full min-w-[540px] text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3 font-semibold">الاسم</th><th className="px-5 py-3 font-semibold">البريد الإلكتروني</th><th className="px-5 py-3 font-semibold">الدور</th></tr></thead>
          <tbody>{members.filter(m => m.role === 'teacher' || m.role === 'student').map(member => <tr key={member.uid} className="border-t border-slate-100"><td className="px-5 py-3 font-medium">{member.displayName || 'بدون اسم'}</td><td className="px-5 py-3 text-slate-500">{member.email || 'غير متوفر'}</td><td className="px-5 py-3"><span className="rounded-md bg-slate-100 px-2 py-1 text-xs">{member.role === 'teacher' ? 'معلم' : 'طالب'}</span></td></tr>)}</tbody>
        </table></div> : <div className="p-8 text-center text-sm text-slate-500">لا توجد حسابات مرتبطة بهذه المدرسة حتى الآن.</div>}
      </section>}
      {activeTab === 'subscription' && <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
          <h2 className="font-bold">الأقسام المشمولة في الباقة</h2>
          <p className="mb-5 mt-1 text-sm text-slate-500">هذه هي الأقسام التي يسمح اشتراك المدرسة باستخدامها.</p>
          {modules.length ? <div className="divide-y divide-slate-100">{modules.map(module => <div key={module!.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-700"/><div><p className="text-sm font-semibold">{module!.label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{module!.description}</p></div></div>)}</div> : <div className="rounded-lg bg-slate-50 p-5 text-sm text-slate-500">لا توجد أقسام مفعّلة حاليًا.</div>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
          <h2 className="font-bold">تفاصيل الاشتراك</h2>
          <dl className="mt-4 divide-y divide-slate-100 text-sm">
            <div className="flex justify-between gap-3 py-3"><dt className="text-slate-500">الباقة</dt><dd className="font-semibold">{plan?.name || 'غير محددة'}</dd></div>
            <div className="flex justify-between gap-3 py-3"><dt className="text-slate-500">الحالة</dt><dd className="font-semibold">{status}</dd></div>
            <div className="flex justify-between gap-3 py-3"><dt className="text-slate-500">تاريخ الانتهاء</dt><dd className="font-semibold">{expiresAt || 'غير محدد'}</dd></div>
            <div className="flex justify-between gap-3 py-3"><dt className="text-slate-500">بريد التواصل</dt><dd className="font-semibold">{school?.contactEmail || 'غير متوفر'}</dd></div>
          </dl>
          <div className="mt-4 rounded-lg border border-slate-200 p-4 text-sm leading-6 text-slate-600">لطلب تغيير الباقة أو إضافة أقسام، تواصل مع إدارة منصة قُل. إدارة الاشتراكات متاحة للأدمن العام.</div>
        </div>
      </section>}
      </div>
    </div>
  </div>;
};

const Metric: React.FC<{ icon: React.ElementType; label: string; value: string | number }> = ({ icon: Icon, label, value }) => <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-2 text-sm font-bold text-slate-500"><span>{label}</span><Icon size={20} className="text-emerald-700"/></div><div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div></div>;
