import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ChevronDown, GraduationCap, ShieldCheck, UserCircle, X } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth, UserRole } from './AuthProvider';

type SchoolOption = { id: string; name: string };
const OPTIONS: { id: UserRole; label: string; icon: React.ElementType }[] = [
  { id: 'admin', label: 'الأدمن العام', icon: ShieldCheck },
  { id: 'schoolAdmin', label: 'مدير المدرسة', icon: Building2 },
  { id: 'teacher', label: 'المعلم', icon: GraduationCap },
  { id: 'student', label: 'الطالب', icon: UserCircle },
];

export const RoleSwitcher: React.FC = () => {
  const { user, profile, updateRole } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [role, setRole] = React.useState<UserRole>(profile?.role || 'admin');
  const [schoolId, setSchoolId] = React.useState(profile?.schoolId || '');
  const [schools, setSchools] = React.useState<SchoolOption[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const enabled = user?.email === 'he4amali22@gmail.com';

  React.useEffect(() => {
    if (!enabled) return;
    let live = true;
    getDocs(collection(db, 'schools')).then(snap => {
      if (live) setSchools(snap.docs.map(d => ({ id: d.id, name: String(d.data().name || 'مدرسة') })));
    }).catch(() => {
      if (live) setMessage('تعذر تحميل أسماء المدارس، لكن يمكنك معاينة الطالب والمعلم دون اختيار مدرسة.');
    });
    return () => { live = false; };
  }, [enabled]);

  React.useEffect(() => {
    setRole(profile?.role || 'admin');
    setSchoolId(profile?.schoolId || '');
  }, [profile?.role, profile?.schoolId]);

  if (!enabled) return null;
  const ActiveIcon = OPTIONS.find(o => o.id === profile?.role)?.icon || ShieldCheck;

  const apply = async () => {
    if (role === 'schoolAdmin' && !schoolId) {
      setMessage('للمعاينة كمدير مدرسة، اختر مدرسة أولًا. إذا لم تظهر مدرسة، أنشئها من الأدمن بعد حل اتصال البيانات.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await updateRole(role, role === 'admin' || (role !== 'schoolAdmin' && schoolId === '__demo__') ? null : schoolId || null);
      setMessage(`تم التبديل إلى وضع ${OPTIONS.find(o => o.id === role)?.label}. هذا وضع معاينة محلي.`);
      setOpen(false);
      window.location.assign(role === 'admin' ? '/admin' : role === 'schoolAdmin' ? '/school' : '/');
    } catch (err) {
      console.error(err);
      setMessage('تعذّر تغيير وضع المعاينة. أعد تحميل الصفحة وجرب مرة أخرى.');
    } finally { setSaving(false); }
  };

  return <div className="fixed bottom-4 left-4 z-[1000]" dir="rtl">
    <AnimatePresence>
      {open && <motion.div initial={{opacity:0,y:10,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:10,scale:.98}} className="mb-3 w-[min(340px,calc(100vw-2rem))] rounded-xl border border-slate-300 bg-white p-4 text-slate-900 shadow-lg">
        <div className="mb-3 flex items-start justify-between gap-2"><div><h3 className="font-black">التنقل بين واجهات قُل</h3><p className="mt-1 text-xs leading-5 text-slate-500">هذه معاينة محلية لا تغيّر دورك الحقيقي في قاعدة البيانات.</p></div><button onClick={()=>setOpen(false)} aria-label="إغلاق" className="rounded-lg p-1 hover:bg-slate-100"><X size={18}/></button></div>
        <div className="grid grid-cols-2 gap-2">{OPTIONS.map(o=>{const Icon=o.icon;return <button key={o.id} onClick={()=>setRole(o.id)} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold ${role===o.id?'border-emerald-700 bg-emerald-50 text-emerald-900':'border-slate-200 text-slate-600 hover:bg-slate-50'}`}><Icon size={17}/>{o.label}</button>})}</div>
        {role==='schoolAdmin' && <label className="mt-3 block text-xs font-bold text-slate-600">المدرسة<select value={schoolId} onChange={e=>setSchoolId(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="">اختر مدرسة</option><option value="__demo__">معاينة تجريبية ببيانات وهمية</option>{schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><span className="mt-1 block font-normal text-slate-400">اختر المعاينة التجريبية إذا لم تكن قاعدة البيانات مهيأة بعد.</span></label>}
        {message && <p role="status" className="mt-3 rounded-lg bg-amber-50 p-2 text-xs leading-5 text-amber-900">{message}</p>}
        <button disabled={saving} onClick={()=>void apply()} className="mt-3 w-full rounded-xl bg-emerald-800 px-4 py-3 text-sm font-black text-white hover:bg-emerald-900 disabled:opacity-50">{saving?'جارٍ التبديل...':'فتح هذه الواجهة'}</button>
        <button onClick={()=>{localStorage.removeItem('qul_dev_preview_role');localStorage.removeItem('qul_dev_preview_school_id');window.location.assign('/admin');}} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">إعادة الوضع الحقيقي للأدمن</button>
      </motion.div>}
    </AnimatePresence>
    <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 shadow-md transition hover:border-emerald-700 hover:text-emerald-900"><ActiveIcon size={18}/><span>معاينة: {OPTIONS.find(o=>o.id===profile?.role)?.label || 'الأدمن العام'}</span><ChevronDown size={16}/></button>
  </div>;
};
