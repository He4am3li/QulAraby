import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users, GraduationCap, BookOpenCheck, Layers3, Settings2, Building2, Search,
  Plus, Save, X, Pencil, Trash2, Download, RefreshCw, CheckCircle2, Clock3,
  LoaderCircle, ChevronLeft, School, Mail, CalendarDays, ShieldCheck, Headphones, BarChart3, Send
} from 'lucide-react';
import {
  addDoc, collection, deleteDoc, deleteField, doc, getDoc, getDocs, query, runTransaction, serverTimestamp,
  updateDoc, where, writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../components/AuthProvider';
import { SCHOOL_MODULES } from '../config/schoolPlans';
import { PlatformTopBar } from '../components/PlatformTopBar';
import { ModuleCard } from './Home';

type SchoolRecord = {
  name: string;
  status?: string;
  planId?: string;
  contactEmail?: string;
  expiresAt?: any;
  enabledModules?: string[];
};
type MemberRecord = {
  uid: string;
  displayName?: string;
  email?: string;
  role?: string;
  schoolId?: string;
  classId?: string;
};
type PlanRecord = {
  name: string;
  description?: string;
  includedModules?: string[];
  price?: number;
  currency?: string;
  maxTeachers?: number;
  maxStudents?: number;
  durationDays?: number;
};
type ClassRecord = {
  id: string;
  name: string;
  grade?: string;
  teacherId?: string;
  schoolId: string;
  createdAt?: any;
  updatedAt?: any;
};

type AppointmentSlotRecord = { id: string; title?: string; kind?: string; startsAt?: any; durationMinutes?: number; status?: string; schoolId?: string; schoolName?: string; bookerUid?: string; bookerEmail?: string; bookedAt?: any; createdAt?: any; timeZone?: string };
type SchoolTab = 'overview' | 'teachers' | 'students' | 'classes' | 'settings' | 'subscription' | 'reports' | 'support';

const tabCards = [
  { id: 'teachers', title: 'المعلمون', english: 'TEACHERS', description: 'استعراض قائمة المعلمين وإسنادهم إلى الفصول.', icon: GraduationCap },
  { id: 'students', title: 'الطلاب', english: 'STUDENTS', description: 'البحث عن الطلاب وإدارة إسنادهم إلى الفصول.', icon: Users },
  { id: 'classes', title: 'الفصول والمجموعات', english: 'CLASSES', description: 'إنشاء الفصول وتحديد المعلم المسؤول.', icon: BookOpenCheck },
  { id: 'settings', title: 'بيانات المدرسة', english: 'SCHOOL DETAILS', description: 'تحديث اسم المدرسة وبريد التواصل.', icon: Settings2 },
  { id: 'subscription', title: 'الاشتراك والأقسام', english: 'SUBSCRIPTION', description: 'مراجعة الباقة والحدود والأقسام المتاحة.', icon: Layers3 },
  { id: 'reports', title: 'التقارير المدرسية', english: 'SCHOOL REPORTS', description: 'ملخصات فعلية عن فريق المدرسة والفصول والأقسام.', icon: BarChart3 },
  { id: 'support', title: 'الدعم الفني', english: 'SCHOOL SUPPORT', description: 'إرسال طلب للدعم ومتابعة الطلبات السابقة.', icon: Headphones },
] as const;

const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10';
const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryButton = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-700 hover:text-emerald-900 disabled:opacity-50';

export const SchoolDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedTab = searchParams.get('tab');
  const activeTab: SchoolTab =
    requestedTab === 'teachers' || requestedTab === 'students' || requestedTab === 'classes' ||
    requestedTab === 'settings' || requestedTab === 'subscription' ||
    requestedTab === 'reports' || requestedTab === 'support'
      ? requestedTab
      : requestedTab === 'team' ? 'teachers' : 'overview';

  const [school, setSchool] = React.useState<SchoolRecord | null>(null);
  const [plan, setPlan] = React.useState<PlanRecord | null>(null);
  const [members, setMembers] = React.useState<MemberRecord[]>([]);
  const [classes, setClasses] = React.useState<ClassRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [classFilter, setClassFilter] = React.useState('all');
  const [schoolName, setSchoolName] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [className, setClassName] = React.useState('');
  const [classGrade, setClassGrade] = React.useState('');
  const [classTeacher, setClassTeacher] = React.useState('');
  const [editingClassId, setEditingClassId] = React.useState<string | null>(null);
  const [supportTitle, setSupportTitle] = React.useState('');
  const [supportDescription, setSupportDescription] = React.useState('');
  const [schoolTickets, setSchoolTickets] = React.useState<Array<{ id: string; title?: string; description?: string; status?: string; createdAt?: any }>>([]);
  const [appointmentSlots, setAppointmentSlots] = React.useState<AppointmentSlotRecord[]>([]);
  const [selectedAppointmentDate, setSelectedAppointmentDate] = React.useState('');

  const schoolId = profile?.schoolId || '';
  const isDemo = schoolId === '__demo__';

  const loadData = React.useCallback(async () => {
    if (!schoolId) {
      setError('لم يتم ربط هذا الحساب بمدرسة. يرجى التواصل مع أدمن منصة قُل.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (schoolId === '__demo__') {
        const demoSchool: SchoolRecord = {
          name: 'مدرسة تجريبية، بيانات للعرض فقط',
          status: 'trial',
          contactEmail: 'demo@example.com',
        };
        const demoPlan: PlanRecord = {
          name: 'معاينة تجريبية',
          description: 'بيانات توضيحية وليست اشتراكًا فعليًا',
          includedModules: SCHOOL_MODULES.map(module => module.id),
          maxTeachers: 0,
          maxStudents: 0,
          durationDays: 30,
        };
        setSchool(demoSchool);
        setPlan(demoPlan);
        setMembers([
          { uid: 'demo-t1', displayName: 'معلم تجريبي 1', email: 'teacher1@example.com', role: 'teacher', schoolId },
          { uid: 'demo-t2', displayName: 'معلم تجريبي 2', email: 'teacher2@example.com', role: 'teacher', schoolId },
          { uid: 'demo-s1', displayName: 'طالب تجريبي 1', email: 'student1@example.com', role: 'student', schoolId, classId: 'demo-c1' },
          { uid: 'demo-s2', displayName: 'طالب تجريبي 2', email: 'student2@example.com', role: 'student', schoolId },
        ]);
        setClasses([{ id: 'demo-c1', name: 'الصف التجريبي', grade: 'المرحلة الابتدائية', teacherId: 'demo-t1', schoolId }]);
        setSchoolTickets([]);
        setAppointmentSlots([]);
        setSchoolName(demoSchool.name);
        setContactEmail(demoSchool.contactEmail || '');
        return;
      }

      const [schoolSnap, membersSnap, classesSnap] = await Promise.all([
        getDoc(doc(db, 'schools', schoolId)),
        getDocs(query(collection(db, 'users'), where('schoolId', '==', schoolId))),
        getDocs(collection(db, 'schools', schoolId, 'classes')),
      ]);
      let nextTickets: Array<{ id: string; title?: string; description?: string; status?: string; createdAt?: any }> = [];
      try {
        const ticketSnap = await getDocs(query(collection(db, 'support_tickets'), where('schoolId', '==', schoolId)));
        nextTickets = ticketSnap.docs.map(item => ({ id: item.id, ...item.data() } as { id: string; title?: string; description?: string; status?: string; createdAt?: any }));
      } catch (ticketError) {
        // Support is optional until support_tickets rules have been published.
        console.info('School support tickets are not available yet.', ticketError);
      }
      let nextAppointmentSlots: AppointmentSlotRecord[] = [];
      try {
        const [availableSnap, schoolBookingsSnap] = await Promise.all([
          getDocs(query(collection(db, 'appointment_slots'), where('status', '==', 'available'))),
          getDocs(query(collection(db, 'appointment_slots'), where('schoolId', '==', schoolId))),
        ]);
        const combined = [...availableSnap.docs, ...schoolBookingsSnap.docs];
        nextAppointmentSlots = Array.from(new Map(combined.map(item => [item.id, { id: item.id, ...item.data() } as AppointmentSlotRecord])).values())
          .sort((x, y) => (x.startsAt?.toMillis?.() || new Date(x.startsAt || 0).getTime()) - (y.startsAt?.toMillis?.() || new Date(y.startsAt || 0).getTime()));
      } catch (appointmentError) {
        console.info('Appointment booking is not available until appointment_slots rules are published.', appointmentError);
      }
      if (!schoolSnap.exists()) throw new Error('لم يتم العثور على بيانات المدرسة.');
      const schoolData = schoolSnap.data() as SchoolRecord;
      let planData: PlanRecord | null = null;
      if (schoolData.planId) {
        const planSnap = await getDoc(doc(db, 'plans', schoolData.planId));
        if (planSnap.exists()) planData = planSnap.data() as PlanRecord;
      }
      const memberData = membersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as MemberRecord));
      const classData = classesSnap.docs.map(d => ({ id: d.id, ...d.data() } as ClassRecord));
      setSchool(schoolData);
      setPlan(planData);
      setMembers(memberData);
      setClasses(classData);
      setSchoolTickets(nextTickets.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
      setAppointmentSlots(nextAppointmentSlots);
      setSchoolName(schoolData.name || '');
      setContactEmail(schoolData.contactEmail || '');
    } catch (e) {
      console.error('School dashboard load failed:', e);
      setError('تعذر تحميل بيانات المدرسة أو الفصول. تحقق من نشر قواعد Firestore المحدثة، ثم أعد المحاولة.');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  React.useEffect(() => { void loadData(); }, [loadData]);

  const teachers = members.filter(member => member.role === 'teacher');
  const students = members.filter(member => member.role === 'student');
  const modules = (school?.enabledModules || plan?.includedModules || [])
    .map(id => SCHOOL_MODULES.find(module => module.id === id))
    .filter(Boolean);
  const subscriptionStatus = school?.status === 'active' ? 'فعّال' : school?.status === 'trial' ? 'فترة تجريبية' : 'موقوف';
  const expiresAt = school?.expiresAt?.toDate ? school.expiresAt.toDate().toLocaleDateString('ar-AE') : 'غير محدد';

  const filteredMembers = (list: MemberRecord[]) => list.filter(member => {
    const text = search.trim().toLocaleLowerCase();
    const matchesSearch = !text || (member.displayName || '').toLocaleLowerCase().includes(text) || (member.email || '').toLocaleLowerCase().includes(text);
    const matchesClass = classFilter === 'all' || (member.classId || '') === classFilter;
    return matchesSearch && matchesClass;
  });

  const saveSchoolDetails = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isDemo) {
      setSchool(current => current ? { ...current, name: schoolName.trim(), contactEmail: contactEmail.trim() } : current);
      setNotice('تم تحديث بيانات المعاينة فقط.');
      return;
    }
    if (!schoolId || !schoolName.trim()) {
      setNotice('أدخل اسم المدرسة أولًا.');
      return;
    }
    setSaving(true);
    setNotice('');
    try {
      await updateDoc(doc(db, 'schools', schoolId), {
        name: schoolName.trim(),
        contactEmail: contactEmail.trim(),
        updatedAt: serverTimestamp(),
      });
      setSchool(current => current ? { ...current, name: schoolName.trim(), contactEmail: contactEmail.trim() } : current);
      setNotice('تم حفظ بيانات المدرسة.');
    } catch (e) {
      console.error('School details save failed:', e);
      setNotice('تعذر حفظ البيانات. تأكد من نشر قواعد Firestore المحدثة.');
    } finally {
      setSaving(false);
    }
  };

  const resetClassForm = () => {
    setEditingClassId(null);
    setClassName('');
    setClassGrade('');
    setClassTeacher('');
  };

  const editClass = (item: ClassRecord) => {
    setEditingClassId(item.id);
    setClassName(item.name);
    setClassGrade(item.grade || '');
    setClassTeacher(item.teacherId || '');
  };

  const saveClass = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!className.trim()) {
      setNotice('أدخل اسم الفصل.');
      return;
    }
    if (classTeacher && !teachers.some(teacher => teacher.uid === classTeacher)) {
      setNotice('اختر معلمًا من معلمي المدرسة فقط.');
      return;
    }
    if (isDemo) {
      const item: ClassRecord = {
        id: editingClassId || 'demo-c' + Date.now(),
        name: className.trim(),
        grade: classGrade.trim(),
        teacherId: classTeacher,
        schoolId,
      };
      setClasses(current => editingClassId ? current.map(row => row.id === editingClassId ? item : row) : [...current, item]);
      resetClassForm();
      setNotice('تم تحديث معاينة الفصل فقط.');
      return;
    }
    if (!schoolId) return;
    setSaving(true);
    setNotice('');
    try {
      const payload = {
        name: className.trim(),
        grade: classGrade.trim(),
        teacherId: classTeacher,
        schoolId,
        updatedAt: serverTimestamp(),
      };
      if (editingClassId) {
        await updateDoc(doc(db, 'schools', schoolId, 'classes', editingClassId), payload);
      } else {
        await addDoc(collection(db, 'schools', schoolId, 'classes'), { ...payload, createdAt: serverTimestamp() });
      }
      await loadData();
      resetClassForm();
      setNotice(editingClassId ? 'تم تحديث الفصل.' : 'تم إنشاء الفصل.');
    } catch (e) {
      console.error('Class save failed:', e);
      setNotice('تعذر حفظ الفصل. تحقق من نشر قواعد Firestore المحدثة.');
    } finally {
      setSaving(false);
    }
  };

  const deleteClass = async (item: ClassRecord) => {
    const enrolled = students.filter(student => student.classId === item.id);
    if (!window.confirm(enrolled.length
      ? `سيتم فك إسناد ${enrolled.length} طالبًا ثم حذف الفصل «${item.name}». هل تريد المتابعة؟`
      : `هل تريد حذف الفصل «${item.name}»؟`)) return;
    if (isDemo) {
      setClasses(current => current.filter(row => row.id !== item.id));
      setMembers(current => current.map(member => member.classId === item.id ? { ...member, classId: '' } : member));
      setNotice('تم حذف الفصل من المعاينة فقط.');
      return;
    }
    if (!schoolId) return;
    setSaving(true);
    setNotice('');
    try {
      if (enrolled.length) {
        const batch = writeBatch(db);
        enrolled.forEach(student => batch.update(doc(db, 'users', student.uid), { classId: '', updatedAt: serverTimestamp() }));
        await batch.commit();
      }
      await deleteDoc(doc(db, 'schools', schoolId, 'classes', item.id));
      await loadData();
      setNotice('تم حذف الفصل وفك إسناد الطلاب المرتبطين به.');
    } catch (e) {
      console.error('Class delete failed:', e);
      setNotice('تعذر حذف الفصل. تحقق من صلاحيات Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const assignStudentClass = async (student: MemberRecord, nextClassId: string) => {
    if (nextClassId && !classes.some(item => item.id === nextClassId)) {
      setNotice('اختر فصلًا تابعًا لمدرستك.');
      return;
    }
    if (isDemo) {
      setMembers(current => current.map(item => item.uid === student.uid ? { ...item, classId: nextClassId } : item));
      setNotice('تم تحديث إسناد الطالب في المعاينة فقط.');
      return;
    }
    setSaving(true);
    setNotice('');
    try {
      await updateDoc(doc(db, 'users', student.uid), { classId: nextClassId, updatedAt: serverTimestamp() });
      setMembers(current => current.map(item => item.uid === student.uid ? { ...item, classId: nextClassId } : item));
      setNotice('تم تحديث فصل الطالب.');
    } catch (e) {
      console.error('Student class assignment failed:', e);
      setNotice('تعذر إسناد الطالب إلى الفصل. تحقق من نشر قواعد Firestore المحدثة.');
    } finally {
      setSaving(false);
    }
  };

  const appointmentDateKey = (slot: AppointmentSlotRecord) => {
    const raw = slot.startsAt?.toDate ? slot.startsAt.toDate() : slot.startsAt instanceof Date ? slot.startsAt : new Date(slot.startsAt || 0);
    if (Number.isNaN(raw.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(raw);
  };
  const appointmentDateLabel = (dateKey: string) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Intl.DateTimeFormat('ar-AE', { timeZone: 'Asia/Dubai', weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(Date.UTC(year, month - 1, day, 8)));
  };
  const appointmentTimeLabel = (slot: AppointmentSlotRecord) => {
    const raw = slot.startsAt?.toDate ? slot.startsAt.toDate() : slot.startsAt instanceof Date ? slot.startsAt : new Date(slot.startsAt || 0);
    return Number.isNaN(raw.getTime()) ? 'وقت غير محدد' : new Intl.DateTimeFormat('ar-AE', { timeZone: 'Asia/Dubai', hour: 'numeric', minute: '2-digit' }).format(raw);
  };
  const availableAppointmentDates = Array.from(new Set(appointmentSlots.filter(slot => slot.status === 'available' && slot.startsAt && new Date(slot.startsAt?.toDate ? slot.startsAt.toDate() : slot.startsAt).getTime() > Date.now()).map(appointmentDateKey).filter(Boolean))).sort();
  const currentAppointmentDate = availableAppointmentDates.includes(selectedAppointmentDate) ? selectedAppointmentDate : availableAppointmentDates[0] || '';
  const availableAppointmentSlots = appointmentSlots.filter(slot => slot.status === 'available' && appointmentDateKey(slot) === currentAppointmentDate && new Date(slot.startsAt?.toDate ? slot.startsAt.toDate() : slot.startsAt).getTime() > Date.now())
    .sort((x, y) => new Date(x.startsAt?.toDate ? x.startsAt.toDate() : x.startsAt).getTime() - new Date(y.startsAt?.toDate ? y.startsAt.toDate() : y.startsAt).getTime());

  const bookAppointment = async (slot: AppointmentSlotRecord) => {
    if (isDemo || !schoolId || !school || !profile) {
      setNotice('الحجز متاح للحساب المدرسي الفعلي فقط، وليس في وضع المعاينة.');
      return;
    }
    setSaving(true);
    setNotice('');
    try {
      await runTransaction(db, async transaction => {
        const slotRef = doc(db, 'appointment_slots', slot.id);
        const snapshot = await transaction.get(slotRef);
        if (!snapshot.exists() || snapshot.data().status !== 'available') throw new Error('APPOINTMENT_SLOT_UNAVAILABLE');
        const startValue = snapshot.data().startsAt;
        const startDate = startValue?.toDate ? startValue.toDate() : new Date(startValue);
        if (startDate.getTime() <= Date.now()) throw new Error('APPOINTMENT_SLOT_PAST');
        transaction.update(slotRef, {
          status: 'booked', schoolId, schoolName: school.name,
          bookerUid: profile.uid, bookerEmail: profile.email || '',
          bookedAt: serverTimestamp(),
        });
      });
      await loadData();
      setNotice('تم حجز الموعد بنجاح. ستظهر تفاصيله ضمن مواعيد المدرسة.');
    } catch (e) {
      console.error('Appointment booking failed:', e);
      setNotice(e instanceof Error && e.message === 'APPOINTMENT_SLOT_UNAVAILABLE'
        ? 'هذا الموعد لم يعد متاحًا، حدّث القائمة واختر وقتًا آخر.'
        : e instanceof Error && e.message === 'APPOINTMENT_SLOT_PAST'
          ? 'لا يمكن حجز موعد انتهى وقته.'
          : 'تعذر حجز الموعد. تحقق من نشر قواعد Firestore الخاصة بالمواعيد ثم أعد المحاولة.');
    } finally { setSaving(false); }
  };

  const cancelAppointment = async (slot: AppointmentSlotRecord) => {
    if (!profile || !schoolId || slot.schoolId !== schoolId || slot.bookerUid !== profile.uid) {
      setNotice('لا يمكن إلغاء هذا الحجز من هذا الحساب.');
      return;
    }
    setSaving(true);
    setNotice('');
    try {
      await runTransaction(db, async transaction => {
        const ref = doc(db, 'appointment_slots', slot.id);
        const snap = await transaction.get(ref);
        if (!snap.exists() || snap.data().status !== 'booked' || snap.data().bookerUid !== profile.uid || snap.data().schoolId !== schoolId) {
          throw new Error('APPOINTMENT_NOT_OWNED');
        }
        transaction.update(ref, { status: 'available', schoolId: null, schoolName: null, bookerUid: null, bookerEmail: null, bookedAt: null });
      });
      await loadData();
      setNotice('تم إلغاء الموعد وإتاحته للحجز مرة أخرى.');
    } catch (e) {
      console.error('Appointment cancellation failed:', e);
      setNotice('تعذر إلغاء الموعد. حدّث الصفحة وحاول مرة أخرى.');
    } finally { setSaving(false); }
  };

  const submitSupportTicket = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supportTitle.trim() || !supportDescription.trim()) {
      setNotice('أدخل عنوان الطلب ووصف المشكلة.');
      return;
    }
    if (supportTitle.trim().length > 160 || supportDescription.trim().length > 5000) {
      setNotice('عنوان الطلب بحد أقصى 160 حرفًا، والوصف بحد أقصى 5000 حرف.');
      return;
    }
    if (isDemo) {
      setNotice('هذه معاينة فقط. لن يُرسل الطلب إلى فريق الدعم.');
      return;
    }
    if (!schoolId || !school) return;
    setSaving(true);
    setNotice('');
    try {
      await addDoc(collection(db, 'support_tickets'), {
        title: supportTitle.trim(),
        description: supportDescription.trim(),
        schoolId,
        schoolName: school.name,
        contactEmail: school.contactEmail || profile?.email || '',
        status: 'open',
        createdAt: serverTimestamp(),
      });
      setSupportTitle('');
      setSupportDescription('');
      const refreshed = await getDocs(query(collection(db, 'support_tickets'), where('schoolId', '==', schoolId)));
      setSchoolTickets(refreshed.docs.map(item => ({ id: item.id, ...item.data() } as { id: string; title?: string; description?: string; status?: string; createdAt?: any }))
        .sort((a,b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
      setNotice('تم إرسال طلب الدعم بنجاح.');
    } catch (e) {
      console.error('Support ticket creation failed:', e);
      setNotice('تعذر إرسال الطلب. تحقق من نشر قواعد Firestore المحدّثة.');
    } finally { setSaving(false); }
  };

  const exportMembers = (list: MemberRecord[], label: string) => {
    const escapeCsv = (value: string) => '"' + value.replace(/"/g, '""') + '"';
    const rows = [
      ['الاسم', 'البريد الإلكتروني', 'الدور', 'الفصل'].map(escapeCsv).join(','),
      ...list.map(member => [
        member.displayName || '',
        member.email || '',
        member.role === 'teacher' ? 'معلم' : 'طالب',
        classes.find(item => item.id === member.classId)?.name || '',
      ].map(escapeCsv).join(',')),
    ];
    const blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `QUL-${label}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const pageTitle: Record<SchoolTab, string> = {
    overview: 'الرئيسية',
    teachers: 'المعلمون',
    students: 'الطلاب',
    classes: 'الفصول والمجموعات',
    settings: 'بيانات المدرسة',
    subscription: 'الاشتراك والأقسام',
    reports: 'التقارير المدرسية',
    support: 'الدعم الفني',
  };

  if (loading) return <div className="flex h-full min-h-80 items-center justify-center gap-3 text-slate-500"><LoaderCircle className="animate-spin"/> جارٍ تحميل لوحة المدرسة...</div>;
  if (error) return <div dir="rtl" className="p-4 md:p-6"><div className="rounded-xl border border-amber-200 bg-amber-50 p-5 font-semibold text-amber-900"><p>{error}</p><button onClick={() => void loadData()} className={secondaryButton + ' mt-3'}><RefreshCw size={15}/> إعادة المحاولة</button></div></div>;

  const renderMemberTable = (list: MemberRecord[], kind: 'teacher' | 'student') => {
    const visibleMembers = filteredMembers(list);
    return <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div><h2 className="font-bold">{kind === 'teacher' ? 'قائمة المعلمين' : 'قائمة الطلاب'}</h2><p className="mt-0.5 text-xs text-slate-500">{visibleMembers.length} من {list.length} حساب</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative"><Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو البريد" className={fieldClass + ' w-52 pr-9'}/></div>
          {kind === 'student' && <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className={fieldClass + ' w-40'}><option value="all">كل الفصول</option><option value="">دون فصل</option>{classes.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}
          <button onClick={() => exportMembers(visibleMembers, kind === 'teacher' ? 'teachers' : 'students')} className={secondaryButton}><Download size={15}/> تصدير CSV</button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {visibleMembers.length ? <table className="w-full min-w-[620px] text-right text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3 font-semibold">الاسم</th><th className="px-4 py-3 font-semibold">البريد الإلكتروني</th>{kind === 'student' && <th className="px-4 py-3 font-semibold">الفصل</th>}<th className="px-4 py-3 font-semibold">الحالة</th></tr></thead>
          <tbody>{visibleMembers.map(member => <tr key={member.uid} className="border-t border-slate-100">
            <td className="px-4 py-3 font-medium">{member.displayName || 'بدون اسم'}</td>
            <td className="px-4 py-3 text-slate-500">{member.email || 'غير متوفر'}</td>
            {kind === 'student' && <td className="px-4 py-2"><select disabled={saving} value={member.classId || ''} onChange={e => void assignStudentClass(member, e.target.value)} className={fieldClass + ' min-w-36'}><option value="">دون فصل</option>{classes.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></td>}
            <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-xs text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600"/>{member.role === 'teacher' ? 'معلم مرتبط بالمدرسة' : 'طالب مرتبط بالمدرسة'}</span></td>
          </tr>)}</tbody>
        </table> : <div className="p-10 text-center text-sm text-slate-500">لا توجد نتائج مطابقة.</div>}
      </div>
    </section>;
  };

  return <div dir="rtl" className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f8f6] text-slate-900">
    <PlatformTopBar />
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-3">
        {notice && <div role="status" className="flex shrink-0 items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="إغلاق الرسالة"><X size={14}/></button></div>}

        {activeTab === 'overview' && <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {tabCards.map(item => <ModuleCard
            key={item.id}
            icon={<item.icon />}
            title={item.english}
            arTitle={item.title}
            description=""
            color={item.id === 'teachers' ? 'from-blue-600 to-indigo-700' : item.id === 'students' ? 'from-violet-600 to-purple-800' : item.id === 'classes' ? 'from-emerald-600 to-emerald-800' : item.id === 'settings' ? 'from-slate-600 to-slate-800' : 'from-orange-500 to-amber-600'}
            onClick={() => navigate('/school?tab=' + item.id)}
            enterLabel="فتح القسم"
            lang="ar"
          />)}
        </section>}

        {activeTab === 'teachers' && <div className="flex min-h-0 flex-1 flex-col gap-2"><div className="flex items-center justify-between gap-2"><h1 className="text-lg font-bold">المعلمون</h1><button onClick={() => exportMembers(filteredMembers(teachers), 'teachers')} className={secondaryButton}><Download size={15}/> تصدير القائمة</button></div>{renderMemberTable(teachers, 'teacher')}</div>}

        {activeTab === 'students' && <div className="flex min-h-0 flex-1 flex-col gap-2"><div className="flex items-center justify-between gap-2"><h1 className="text-lg font-bold">الطلاب</h1><span className="text-xs text-slate-500">{students.length} طالبًا</span></div>{renderMemberTable(students, 'student')}</div>}

        {activeTab === 'classes' && <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.75fr)]">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3"><div><h1 className="font-bold">الفصول والمجموعات</h1><p className="mt-0.5 text-xs text-slate-500">{classes.length} فصل</p></div><button onClick={resetClassForm} className={secondaryButton}><Plus size={15}/> فصل جديد</button></div>
            <div className="min-h-0 flex-1 overflow-auto">
              {classes.length ? <div className="divide-y divide-slate-100">{classes.map(item => <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{item.name}</p><p className="mt-1 text-xs text-slate-500">{item.grade || 'مرحلة غير محددة'} · {students.filter(student => student.classId === item.id).length} طالب · {teachers.find(teacher => teacher.uid === item.teacherId)?.displayName || 'لم يحدد معلم'}</p></div>
                <div className="flex shrink-0 gap-1"><button title="تعديل الفصل" onClick={() => editClass(item)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Pencil size={15}/></button><button title="حذف الفصل" disabled={saving} onClick={() => void deleteClass(item)} className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"><Trash2 size={15}/></button></div>
              </div>)}</div> : <div className="p-8 text-center text-sm text-slate-500">لا توجد فصول بعد. أنشئ أول فصل من الزر أعلاه.</div>}
            </div>
          </section>
          <form onSubmit={saveClass} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div><h2 className="font-bold">{editingClassId ? 'تعديل الفصل' : 'إنشاء فصل'}</h2><p className="mt-1 text-xs text-slate-500">يمكن إسناد الطلاب إلى الفصل من صفحة الطلاب.</p></div>
            <label className="space-y-1 text-xs font-semibold">اسم الفصل<input className={fieldClass} value={className} onChange={e => setClassName(e.target.value)} required placeholder="مثال: الصف الخامس أ"/></label>
            <label className="space-y-1 text-xs font-semibold">المرحلة أو الصف<input className={fieldClass} value={classGrade} onChange={e => setClassGrade(e.target.value)} placeholder="مثال: الصف الخامس"/></label>
            <label className="space-y-1 text-xs font-semibold">المعلم المسؤول<select className={fieldClass} value={classTeacher} onChange={e => setClassTeacher(e.target.value)}><option value="">لم يحدد</option>{teachers.map(teacher => <option key={teacher.uid} value={teacher.uid}>{teacher.displayName || teacher.email || teacher.uid}</option>)}</select></label>
            <div className="mt-auto flex gap-2"><button disabled={saving} className={primaryButton + ' flex-1'}><Save size={15}/>{saving ? 'جارٍ الحفظ...' : editingClassId ? 'حفظ التعديلات' : 'إنشاء الفصل'}</button>{editingClassId && <button type="button" onClick={resetClassForm} className={secondaryButton}>إلغاء</button>}</div>
          </form>
        </div>}

        {activeTab === 'settings' && <section className="mx-auto w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-700"><Building2 size={20}/></span><div><h1 className="font-bold">بيانات المدرسة</h1><p className="mt-1 text-xs text-slate-500">تعديل اسم المدرسة وبريد التواصل المسموح بهما لمدير المدرسة.</p></div></div>
          <form onSubmit={saveSchoolDetails} className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold">اسم المدرسة<input className={fieldClass} value={schoolName} onChange={e => setSchoolName(e.target.value)} required maxLength={150}/></label>
            <label className="space-y-1.5 text-sm font-semibold">بريد التواصل<input className={fieldClass} type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="school@example.com"/></label>
            <div className="sm:col-span-2 flex items-center justify-between gap-3"><p className="text-xs text-slate-500">تغيير الباقة أو حالة الاشتراك متاح للأدمن العام فقط.</p><button disabled={saving} className={primaryButton}><Save size={15}/>{saving ? 'جارٍ الحفظ...' : 'حفظ البيانات'}</button></div>
          </form>
        </section>}

        {activeTab === 'reports' && <section className="min-h-0 flex-1 space-y-3 overflow-auto">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h1 className="text-lg font-bold">التقارير المدرسية</h1><p className="mt-1 text-xs text-slate-500">المؤشرات التالية محسوبة من سجلات المدرسة الحالية، ولا تتضمن بيانات افتراضية.</p></div><button onClick={() => exportMembers([...teachers, ...students], 'school-report')} className={secondaryButton}><Download size={15}/> تصدير تقرير CSV</button></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'المعلمون', value: teachers.length, icon: GraduationCap },
              { label: 'الطلاب', value: students.length, icon: Users },
              { label: 'الفصول', value: classes.length, icon: BookOpenCheck },
              { label: 'الأقسام المتاحة', value: modules.length, icon: Layers3 },
              { label: 'طلاب دون فصل', value: students.filter(student => !student.classId).length, icon: School },
              { label: 'فصول دون معلم', value: classes.filter(item => !item.teacherId).length, icon: ShieldCheck },
            ].map(item => <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-sm text-slate-500"><span>{item.label}</span><item.icon size={18}/></div><div className="mt-3 text-2xl font-bold">{item.value}</div></div>)}
          </div>
          <section className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="mb-3 font-bold">توزيع الطلاب حسب الفصل</h2>{classes.length ? <div className="space-y-3">{classes.map(item=>{const count=students.filter(student=>student.classId===item.id).length;return <div key={item.id} className="grid grid-cols-[minmax(100px,180px)_minmax(0,1fr)_40px] items-center gap-3 text-sm"><span className="truncate">{item.name}</span><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-emerald-700" style={{width:students.length?`${count/students.length*100}%`:'0%'}}/></div><span className="text-left tabular-nums">{count}</span></div>})}</div>:<p className="text-sm text-slate-500">أنشئ الفصول وأسنِد الطلاب إليها لظهور التقرير.</p>}</section>
        </section>}

        {activeTab === 'support' && <section className="min-h-0 flex-1 space-y-4 overflow-auto">
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-[#f7fbf8] to-[#edf5f0] p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h1 className="font-bold text-slate-900">حجز موعد مع فريق قُل</h1><p className="mt-1 text-xs text-slate-500">اختر يومًا ثم وقتًا متاحًا لجلسة تدريب أو دعم. جميع الأوقات بتوقيت الإمارات (Asia/Dubai).</p></div>
              <div className="rounded-xl border border-white bg-white/80 px-3 py-2 text-xs text-slate-600">المدة موضحة بجوار كل موعد</div>
            </div>
            {isDemo && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">هذه معاينة فقط. يلزم حساب مدير مدرسة حقيقي لإجراء حجز.</p>}
            {availableAppointmentDates.length ? <>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{availableAppointmentDates.map(dateKey=><button key={dateKey} type="button" onClick={()=>setSelectedAppointmentDate(dateKey)} className={`min-w-[98px] rounded-xl border px-3 py-2 text-right transition ${currentAppointmentDate===dateKey?'border-emerald-800 bg-emerald-800 text-white shadow-sm':'border-slate-200 bg-white text-slate-700 hover:border-emerald-500'}`}><span className="block text-xs font-bold">{appointmentDateLabel(dateKey)}</span><span className={`mt-1 block text-[10px] ${currentAppointmentDate===dateKey?'text-emerald-100':'text-slate-400'}`}>{appointmentSlots.filter(slot=>slot.status==='available'&&appointmentDateKey(slot)===dateKey).length} مواعيد متاحة</span></button>)}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{availableAppointmentSlots.map(slot=><button type="button" key={slot.id} disabled={saving || isDemo} onClick={()=>void bookAppointment(slot)} className="group rounded-xl border border-slate-200 bg-white px-3 py-3 text-right shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:border-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"><span className="block text-base font-bold tabular-nums text-slate-800">{appointmentTimeLabel(slot)}</span><span className="mt-1 block text-[10px] text-slate-500">{slot.kind==='training'?'جلسة تدريب':'موعد دعم'} · {slot.durationMinutes || 30} دقيقة</span><span className="mt-2 block text-[10px] font-bold text-emerald-800 group-hover:text-emerald-600">{saving?'جارٍ الحجز...':'حجز هذا الموعد ←'}</span></button>)}</div>
            </> : <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white/65 p-5 text-center"><CalendarDays size={24} className="mx-auto text-slate-400"/><p className="mt-2 text-sm font-semibold text-slate-700">لا توجد مواعيد متاحة حاليًا</p><p className="mt-1 text-xs text-slate-500">سيظهر التقويم هنا عندما يضيف فريق قُل فترات للحجز.</p></div>}
          </section>
          <section className="grid gap-3 xl:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 font-bold">مواعيد مدرستك</h2>
              {appointmentSlots.filter(slot=>slot.schoolId===schoolId&&['booked','cancelled'].includes(slot.status||'')).length ? <div className="space-y-2">{appointmentSlots.filter(slot=>slot.schoolId===schoolId&&['booked','cancelled'].includes(slot.status||'')).map(slot=><div key={slot.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"><div><p className="text-sm font-semibold">{slot.title || (slot.kind==='training'?'جلسة تدريب':'موعد دعم')}</p><p className="mt-1 text-xs text-slate-500">{slot.startsAt?.toDate ? new Intl.DateTimeFormat('ar-AE',{timeZone:'Asia/Dubai',dateStyle:'medium',timeStyle:'short'}).format(slot.startsAt.toDate()) : slot.startsAt ? new Intl.DateTimeFormat('ar-AE',{timeZone:'Asia/Dubai',dateStyle:'medium',timeStyle:'short'}).format(new Date(slot.startsAt)) : 'وقت غير محدد'} · {slot.durationMinutes || 30} دقيقة</p></div><div className="flex items-center gap-2"><span className={`rounded-md px-2 py-1 text-[10px] ${slot.status==='booked'?'bg-emerald-100 text-emerald-800':'bg-slate-200 text-slate-600'}`}>{slot.status==='booked'?'مؤكد':'ملغى'}</span>{slot.status==='booked'&&slot.bookerUid===profile?.uid&&<button disabled={saving} onClick={()=>void cancelAppointment(slot)} className="text-xs font-semibold text-rose-700 hover:underline disabled:opacity-50">إلغاء</button>}</div></div>)}</div> : <p className="text-sm text-slate-500">لا توجد حجوزات مسجلة لهذه المدرسة.</p>}
            </section>
            <form onSubmit={submitSupportTicket} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div><h2 className="font-bold">إرسال طلب دعم مكتوب</h2><p className="mt-1 text-xs text-slate-500">للمشكلات التي لا تحتاج إلى اجتماع مباشر.</p></div>
              <label className="space-y-1 text-xs font-semibold">عنوان الطلب<input className={fieldClass} value={supportTitle} onChange={e=>setSupportTitle(e.target.value)} maxLength={160} required placeholder="مثال: مشكلة في حساب أحد الطلاب"/></label>
              <label className="flex min-h-24 flex-1 flex-col space-y-1 text-xs font-semibold">وصف المشكلة<textarea className={fieldClass+' min-h-24 flex-1'} value={supportDescription} onChange={e=>setSupportDescription(e.target.value)} maxLength={5000} required placeholder="اذكر ما حدث والخطوات التي أدت إلى المشكلة."/></label>
              <button disabled={saving || isDemo} className={primaryButton}><Send size={15}/>{saving ? 'جارٍ الإرسال...' : 'إرسال الطلب'}</button>
              {isDemo && <p className="text-xs text-amber-700">المعاينة لا ترسل طلبات حقيقية.</p>}
              {schoolTickets.length>0&&<div className="border-t border-slate-100 pt-3"><h3 className="mb-2 text-sm font-semibold">طلباتك السابقة</h3><div className="max-h-32 space-y-2 overflow-auto">{schoolTickets.map(ticket=><div key={ticket.id} className="rounded-lg bg-slate-50 p-2"><div className="flex justify-between gap-2 text-xs"><span className="font-semibold">{ticket.title||'طلب دعم'}</span><span>{ticket.status==='resolved'?'تم الحل':ticket.status==='in_progress'?'قيد المعالجة':'جديد'}</span></div><p className="mt-1 text-[10px] text-slate-500">{ticket.description}</p></div>)}</div></div>}
            </form>
          </section>
        </section>}

        {activeTab === 'subscription' && <div className="grid min-h-0 flex-1 gap-3 overflow-auto xl:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2"><h1 className="font-bold">الأقسام المتاحة</h1><span className="text-xs text-slate-500">{modules.length} قسم</span></div>
            {modules.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{modules.map(module => <div key={module!.id} title={module!.description} className="flex min-h-9 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-2"><CheckCircle2 size={14} className="shrink-0 text-emerald-700"/><span className="min-w-0 text-xs font-medium leading-4 text-slate-700">{module!.label}</span></div>)}</div> : <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">لا توجد أقسام مفعّلة حاليًا.</div>}
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-2 font-bold">تفاصيل الاشتراك</h2>
            <dl className="divide-y divide-slate-100 text-sm">
              <div className="flex justify-between gap-3 py-2"><dt className="text-slate-500">الباقة</dt><dd className="text-left font-semibold">{plan?.name || 'غير محددة'}</dd></div>
              <div className="flex justify-between gap-3 py-2"><dt className="text-slate-500">الحالة</dt><dd className="font-semibold">{subscriptionStatus}</dd></div>
              <div className="flex justify-between gap-3 py-2"><dt className="text-slate-500">تاريخ الانتهاء</dt><dd className="font-semibold">{expiresAt}</dd></div>
              <div className="flex justify-between gap-3 py-2"><dt className="text-slate-500">المعلمون</dt><dd className="font-semibold">{teachers.length}{plan?.maxTeachers ? ` / ${plan.maxTeachers}` : ' / غير محدود'}</dd></div>
              <div className="flex justify-between gap-3 py-2"><dt className="text-slate-500">الطلاب</dt><dd className="font-semibold">{students.length}{plan?.maxStudents ? ` / ${plan.maxStudents}` : ' / غير محدود'}</dd></div>
              <div className="flex justify-between gap-3 py-2"><dt className="text-slate-500">بريد التواصل</dt><dd className="max-w-[180px] truncate font-semibold" title={school?.contactEmail}>{school?.contactEmail || 'غير متوفر'}</dd></div>
            </dl>
            {isDemo && <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">معاينة فقط. لا تُحفظ التغييرات في قاعدة البيانات.</p>}
          </section>
        </div>}
      </div>
    </div>
  </div>;
};
