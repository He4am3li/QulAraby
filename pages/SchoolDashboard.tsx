import React from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, Clock3, Layers3, LoaderCircle, Users, ChevronLeft } from 'lucide-react';
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
        // Demo preview uses clearly synthetic member identities, not fabricated summary counts.
        setMemberCount(0);
        setTeacherCount(0);
        setStudentCount(0);
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
    <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
      {activeTab === 'overview' && <>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'المعلمون والطلاب', english: 'SCHOOL TEAM', icon: Users, color: 'from-blue-600 to-indigo-700', href: '/school?tab=team' },
            { title: 'الاشتراك والأقسام', english: 'SUBSCRIPTION', icon: Layers3, color: 'from-emerald-600 to-emerald-800', href: '/school?tab=subscription' },
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
      </>}
      {activeTab === 'team' && <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold">المعلمون والطلاب</h2><p className="mt-1 text-sm text-slate-500">الحسابات المرتبطة بمدرستك فقط.</p></div>
        {members.filter(m => m.role === 'teacher' || m.role === 'student').length ? <div className="overflow-x-auto"><table className="w-full min-w-[540px] text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3 font-semibold">الاسم</th><th className="px-5 py-3 font-semibold">البريد الإلكتروني</th><th className="px-5 py-3 font-semibold">الدور</th></tr></thead>
          <tbody>{members.filter(m => m.role === 'teacher' || m.role === 'student').map(member => <tr key={member.uid} className="border-t border-slate-100"><td className="px-5 py-3 font-medium">{member.displayName || 'بدون اسم'}</td><td className="px-5 py-3 text-slate-500">{member.email || 'غير متوفر'}</td><td className="px-5 py-3"><span className="rounded-md bg-slate-100 px-2 py-1 text-xs">{member.role === 'teacher' ? 'معلم' : 'طالب'}</span></td></tr>)}</tbody>
        </table></div> : <div className="p-8 text-center text-sm text-slate-500">لا توجد حسابات مرتبطة بهذه المدرسة حتى الآن.</div>}
      </section>}
      {activeTab === 'subscription' && <section className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.75fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <h2 className="mb-3 text-sm font-bold">الأقسام المشمولة في الباقة</h2>
          {modules.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-2 2xl:grid-cols-3">{modules.map(module => <div key={module!.id} title={module!.description} className="flex min-h-9 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-2"><CheckCircle2 size={15} className="shrink-0 text-emerald-700"/><span className="min-w-0 text-xs font-medium leading-4 text-slate-700">{module!.label}</span></div>)}</div> : <div className="rounded-lg bg-slate-50 p-5 text-sm text-slate-500">لا توجد أقسام مفعّلة حاليًا.</div>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
          <h2 className="font-bold">تفاصيل الاشتراك</h2>
          <dl className="mt-2 divide-y divide-slate-100 text-sm">
            <div className="flex justify-between gap-3 py-2"><dt className="text-slate-500">الباقة</dt><dd className="font-semibold">{plan?.name || 'غير محددة'}</dd></div>
            <div className="flex justify-between gap-3 py-2"><dt className="text-slate-500">الحالة</dt><dd className="font-semibold">{status}</dd></div>
            <div className="flex justify-between gap-3 py-2"><dt className="text-slate-500">تاريخ الانتهاء</dt><dd className="font-semibold">{expiresAt || 'غير محدد'}</dd></div>
            <div className="flex justify-between gap-3 py-2"><dt className="text-slate-500">بريد التواصل</dt><dd className="font-semibold">{school?.contactEmail || 'غير متوفر'}</dd></div>
          </dl>
          {profile?.schoolId === '__demo__' && <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">هذه تفاصيل توضيحية للمعاينة وليست اشتراكًا حقيقيًا.</p>}
        </div>
      </section>}
      </div>
    </div>
  </div>;
};

const Metric: React.FC<{ icon: React.ElementType; label: string; value: string | number }> = ({ icon: Icon, label, value }) => <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-2 text-sm font-bold text-slate-500"><span>{label}</span><Icon size={20} className="text-emerald-700"/></div><div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div></div>;
