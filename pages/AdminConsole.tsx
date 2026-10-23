import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity, Building2, Check, ChevronDown, ChevronLeft, CircleDollarSign, GraduationCap, Layers3,
  LoaderCircle, Plus, RefreshCw, School, Settings2, ShieldCheck, Users, X, BarChart3,
  Receipt, Headphones, History, SlidersHorizontal, ExternalLink, CalendarDays
} from 'lucide-react';
import {
  addDoc, collection, deleteField, doc, getDocs, serverTimestamp, setDoc, updateDoc, limit, query
} from 'firebase/firestore';
import { db } from '../firebase';
import { ALL_SCHOOL_MODULE_IDS, SCHOOL_MODULES } from '../config/schoolPlans';
import { useAuth } from '../components/AuthProvider';
import { PlatformTopBar } from '../components/PlatformTopBar';
import { RoleLocalizer, useRoleLanguage } from '../components/RoleLocalizer';
import { ModuleCard } from './Home';
import { RoleActionPanel } from '../components/RoleActionPanel';

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
type TabKey = 'overview' | 'schools' | 'plans' | 'users' | 'subscriptions' | 'analytics' | 'audit' | 'support' | 'settings';
type AdminLogRecord = { id: string; action?: string; target?: string; details?: string; actorEmail?: string; createdAt?: any };
type SupportTicketRecord = { id: string; title?: string; description?: string; category?: string; status?: string; schoolId?: string; schoolName?: string; createdAt?: any; contactEmail?: string };
type AppointmentSlotRecord = { id: string; title?: string; kind?: string; startsAt?: any; durationMinutes?: number; status?: string; schoolId?: string | null; schoolName?: string | null; bookerUid?: string | null; bookerEmail?: string | null; bookedAt?: any; createdAt?: any; timeZone?: string };

const roleLabels: Record<string, string> = {
  admin: 'أدمن المنصة',
  schoolAdmin: 'مدير مدرسة',
  teacher: 'معلم',
  student: 'طالب',
};

const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50';
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

export const AdminConsole: React.FC = () => {
  const { lang, isEnglish } = useRoleLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const tab: TabKey = ['schools','plans','users','subscriptions','analytics','audit','support','settings'].includes(requestedTab || '') ? requestedTab as TabKey : 'overview';
  const setTab = (nextTab: TabKey) => navigate(nextTab === 'overview' ? '/' : `/admin?tab=${nextTab}`);
  const [schools, setSchools] = React.useState<SchoolRecord[]>([]);
  const [plans, setPlans] = React.useState<PlanRecord[]>([]);
  const [users, setUsers] = React.useState<UserRecord[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AdminLogRecord[]>([]);
  const [supportTickets, setSupportTickets] = React.useState<SupportTicketRecord[]>([]);
  const [showRolePanel, setShowRolePanel] = React.useState(false);
  const [appointmentSlots, setAppointmentSlots] = React.useState<AppointmentSlotRecord[]>([]);
  const [appointmentStart, setAppointmentStart] = React.useState('');
  const [appointmentTitle, setAppointmentTitle] = React.useState('');
  const [appointmentKind, setAppointmentKind] = React.useState('training');
  const [appointmentDuration, setAppointmentDuration] = React.useState('30');
  const [ticketFilter, setTicketFilter] = React.useState('all');
  const [ticketStatusDrafts, setTicketStatusDrafts] = React.useState<Record<string, string>>({});
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
      let nextLogs: AdminLogRecord[] = [];
      let nextTickets: SupportTicketRecord[] = [];
      try {
        const snap = await getDocs(query(collection(db, 'admin_audit_logs'), limit(100)));
        nextLogs = snap.docs.map(item => ({ id: item.id, ...item.data() } as AdminLogRecord))
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      } catch (optionalError) { console.info('Audit log collection is not available yet.', optionalError); }
      try {
        const snap = await getDocs(query(collection(db, 'support_tickets'), limit(200)));
        nextTickets = snap.docs.map(item => ({ id: item.id, ...item.data() } as SupportTicketRecord))
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      } catch (optionalError) { console.info('Support ticket collection is not available yet.', optionalError); }
      setSchools(nextSchools.sort((a, b) => a.name.localeCompare(b.name, 'ar')));
      setPlans(nextPlans.sort((a, b) => a.name.localeCompare(b.name, 'ar')));
      setUsers(nextUsers.sort((a, b) => (a.displayName || a.email).localeCompare(b.displayName || b.email, 'ar')));
      setAuditLogs(nextLogs);
      setSupportTickets(nextTickets);
      let nextAppointmentSlots: AppointmentSlotRecord[] = [];
      try {
        const snap = await getDocs(query(collection(db, 'appointment_slots'), limit(300)));
        nextAppointmentSlots = snap.docs.map(item => ({ id: item.id, ...item.data() } as AppointmentSlotRecord))
          .sort((x, y) => (x.startsAt?.toMillis?.() || new Date(x.startsAt || 0).getTime()) - (y.startsAt?.toMillis?.() || new Date(y.startsAt || 0).getTime()));
      } catch (optionalError) { console.info('Appointment collection is not available until appointment_slots rules are published.', optionalError); }
      setAppointmentSlots(nextAppointmentSlots);
      setTicketStatusDrafts(Object.fromEntries(nextTickets.map(ticket => [ticket.id, ticket.status || 'open'])));
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
      await recordAdminEvent(editingPlanId ? 'تحديث باقة' : 'إنشاء باقة', editingPlanId || planName.trim(), `الباقة: ${planName.trim()}`);
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
      await recordAdminEvent('إنشاء مدرسة', schoolName.trim(), `الباقة: ${currentPlanName(schoolPlanId)}، الحالة: ${schoolStatus}`);
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
      await recordAdminEvent('تحديث اشتراك', school.id, `المدرسة: ${school.name}، الباقة: ${currentPlanName(planId)}، الحالة: ${status}`);
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
      await recordAdminEvent('تحديث صلاحيات حساب', userRecord.uid, `الحساب: ${userRecord.email}، الدور: ${roleLabels[draft.role] || draft.role}`);
      await loadData();
      flash('success', `تم تحديث صلاحيات ${userRecord.displayName || userRecord.email}.`);
    } catch (error) {
      console.error('User assignment failed:', error);
      flash('error', 'تعذر تحديث الحساب. قد يحتاج الحساب إلى تسجيل الدخول مجددًا لتحديث بياناته.');
    } finally {
      setSaving(false);
    }
  };

  const recordAdminEvent = async (action: string, target: string, details: string) => {
    try {
      await addDoc(collection(db, 'admin_audit_logs'), {
        action, target, details, actorUid: profile?.uid || '', actorEmail: profile?.email || '',
        createdAt: serverTimestamp(),
      });
    } catch (error) { console.warn('Admin event log was not stored; publish admin_audit_logs rules.', error); }
  };

  const createAppointmentSlot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!appointmentStart || new Date(appointmentStart).getTime() <= Date.now()) {
      flash('error', 'اختر تاريخًا ووقتًا مستقبليًا للموعِد.');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'appointment_slots'), {
        title: appointmentTitle.trim() || (appointmentKind === 'training' ? 'جلسة تعريف وتدريب' : 'جلسة دعم فني'),
        kind: appointmentKind,
        startsAt: new Date(appointmentStart),
        durationMinutes: Number(appointmentDuration),
        timeZone: 'Asia/Dubai',
        status: 'available',
        createdBy: profile?.uid || '',
        createdAt: serverTimestamp(),
      });
      setAppointmentStart('');
      setAppointmentTitle('');
      await loadData();
      flash('success', 'تمت إضافة الموعد إلى قائمة الحجز.');
    } catch (error) {
      console.error('Appointment slot creation failed:', error);
      flash('error', 'تعذر إضافة الموعد. تحقق من نشر قواعد appointment_slots في Firestore.');
    } finally { setSaving(false); }
  };

  const updateAppointmentSlot = async (slot: AppointmentSlotRecord, status: 'available' | 'cancelled') => {
    setSaving(true);
    try {
      if (status === 'available') {
        await updateDoc(doc(db, 'appointment_slots', slot.id), {
          status: 'available', schoolId: null, schoolName: null, bookerUid: null, bookerEmail: null, bookedAt: null,
        });
      } else {
        await updateDoc(doc(db, 'appointment_slots', slot.id), { status: 'cancelled' });
      }
      await loadData();
      flash('success', status === 'available' ? 'أُعيد إتاحة الموعد للحجز.' : 'تم إلغاء الموعد.');
    } catch (error) {
      console.error('Appointment slot update failed:', error);
      flash('error', 'تعذر تحديث الموعد. تحقق من قواعد Firestore الخاصة بالمواعيد.');
    } finally { setSaving(false); }
  };

  const updateTicketStatus = async (ticket: SupportTicketRecord) => {
    const nextStatus = ticketStatusDrafts[ticket.id] || 'open';
    setSaving(true);
    try {
      await updateDoc(doc(db, 'support_tickets', ticket.id), { status: nextStatus, updatedAt: serverTimestamp() });
      await loadData();
      flash('success', 'تم تحديث حالة طلب الدعم.');
    } catch (error) {
      console.error('Support ticket update failed:', error);
      flash('error', 'تعذر تحديث حالة الطلب. تحقق من نشر قواعد support_tickets.');
    } finally { setSaving(false); }
  };

  const currentPlanName = (planId?: string) => plans.find((plan) => plan.id === planId)?.name || 'بلا باقة';
const userCountForSchool = (schoolId: string) => users.filter((item) => item.schoolId === schoolId).length;
  const schoolStatusStats = [
    { key: 'active', label: 'فعّالة', color: '#059669', barClass: 'bg-emerald-500', count: schools.filter(s => s.status === 'active').length },
    { key: 'trial', label: 'تجريبية', color: '#F59E0B', barClass: 'bg-amber-500', count: schools.filter(s => s.status === 'trial').length },
    { key: 'suspended', label: 'موقوفة', color: '#F43F5E', barClass: 'bg-rose-500', count: schools.filter(s => s.status === 'suspended').length },
    { key: 'other', label: 'غير محددة', color: '#94A3B8', barClass: 'bg-slate-400', count: schools.filter(s => !['active', 'trial', 'suspended'].includes(s.status || '')).length },
  ];
  const roleStats = [
    { label: 'الطلاب', color: '#2563EB', count: users.filter(u => u.role === 'student').length },
    { label: 'المعلمون', color: '#7C3AED', count: users.filter(u => u.role === 'teacher').length },
    { label: 'مديرو المدارس', color: '#059669', count: users.filter(u => u.role === 'schoolAdmin').length },
    { label: 'الأدمن', color: '#D97706', count: users.filter(u => u.role === 'admin').length },
    { label: 'أدوار أخرى', color: '#94A3B8', count: users.filter(u => !['student', 'teacher', 'schoolAdmin', 'admin'].includes(u.role)).length },
  ];
  const schoolPlanStats = plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    count: schools.filter(school => school.planId === plan.id).length,
    active: plan.isActive !== false,
  })).sort((a, b) => b.count - a.count);
  const recentRegistrationStats = Array.from({ length: 6 }, (_, index) => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    start.setMonth(start.getMonth() - (5 - index));
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    const count = schools.filter(school => {
      const raw = school.createdAt;
      const created = raw?.toDate ? raw.toDate() : raw instanceof Date ? raw : raw ? new Date(raw) : null;
      return created instanceof Date && !Number.isNaN(created.getTime()) && created >= start && created < end;
    }).length;
    return { label: start.toLocaleDateString(isEnglish ? 'en-US' : 'ar-AE', { month: 'short' }), count };
  });
  const exportAnalyticsReport = () => {
    const csv = [
      ['المؤشر', 'القيمة'],
      ['المدارس المسجلة', String(schools.length)],
      ['الاشتراكات الفعّالة', String(schoolStatusStats.find(x => x.key === 'active')?.count || 0)],
      ['الفترات التجريبية', String(schoolStatusStats.find(x => x.key === 'trial')?.count || 0)],
      ['الاشتراكات الموقوفة', String(schoolStatusStats.find(x => x.key === 'suspended')?.count || 0)],
      ['إجمالي الحسابات', String(users.length)],
      ...roleStats.map(item => [item.label, String(item.count)]),
      ...schoolPlanStats.map(item => [`مدارس باقة ${item.name}`, String(item.count)]),
    ].map(row => row.map(value => '"' + value.replace(/"/g, '""') + '"').join(',')).join('\\r\\n');
    const url = URL.createObjectURL(new Blob(['\\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `QUL-platform-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (profile?.role !== 'admin') {
    return <RoleLocalizer lang={lang}><div dir={isEnglish ? 'ltr' : 'rtl'} className="p-8 text-center font-bold text-red-700">هذه الصفحة مخصصة لأدمن منصة قُل.</div></RoleLocalizer>;
  }

  return (
    <RoleLocalizer lang={lang}>
    <div dir={isEnglish ? 'ltr' : 'rtl'} className={'h-full min-h-0 overflow-hidden bg-[#f7f8f6] text-slate-900 flex flex-col '+(isEnglish?'font-sans':'')}>
      <PlatformTopBar />

      <div className={`flex-1 min-h-0 ${showRolePanel ? 'overflow-hidden p-2 sm:p-3' : tab === 'plans' ? 'overflow-hidden p-2 sm:p-3' : tab === 'analytics' ? 'overflow-y-auto p-2 sm:p-3 xl:overflow-hidden' : 'overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8'}`}>
        <div className={`mx-auto flex min-h-0 flex-col ${showRolePanel ? 'h-full max-w-none gap-2' : tab === 'analytics' ? 'h-full min-h-[740px] max-w-none xl:min-h-0' : tab === 'plans' ? 'h-full max-w-7xl gap-2' : 'max-w-7xl space-y-6'}`}>

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
            {tab === 'overview' && (showRolePanel ? <RoleActionPanel
              lang={lang}
              title={isEnglish ? 'Platform Center' : 'مركز المنصة'}
              icon={<Activity size={24}/>}
              onClose={() => setShowRolePanel(false)}
              items={[
                { id: 'schools', title: isEnglish ? 'Registered Schools' : 'المدارس المسجلة', value: schools.length, icon: <Building2 size={20}/>, tone: 'emerald', onClick: () => { setShowRolePanel(false); setTab('schools'); } },
                { id: 'accounts', title: isEnglish ? 'Platform Accounts' : 'حسابات المنصة', value: users.length, icon: <Users size={20}/>, tone: 'blue', onClick: () => { setShowRolePanel(false); setTab('users'); } },
                { id: 'plans', title: isEnglish ? 'Available Plans' : 'الباقات المتاحة', value: plans.filter(plan => plan.isActive !== false).length, icon: <Layers3 size={20}/>, tone: 'violet', onClick: () => { setShowRolePanel(false); setTab('plans'); } },
                { id: 'support', title: isEnglish ? 'Open Support Requests' : 'طلبات الدعم المفتوحة', value: supportTickets.filter(ticket => (ticket.status || 'open') !== 'resolved').length, icon: <Headphones size={20}/>, tone: 'amber', onClick: () => { setShowRolePanel(false); setTab('support'); } },
              ]}
            /> : <section>
              <div className="flex justify-center mb-8">
                <button type="button" onClick={() => setShowRolePanel(true)} title={isEnglish ? 'Platform Center' : 'مركز المنصة'} aria-label={isEnglish ? 'Platform Center' : 'مركز المنصة'} className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-700 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all group relative border-4 border-white">
                  <Activity size={32}/>
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-black z-20">{isEnglish ? 'Platform Center' : 'مركز المنصة'}</span>
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: 'المدارس', english: 'SCHOOLS', icon: Building2, color: 'from-blue-600 to-indigo-700', tab: 'schools' as TabKey },
                  { title: 'الباقات والأقسام', english: 'PLANS', icon: Layers3, color: 'from-emerald-600 to-emerald-800', tab: 'plans' as TabKey },
                  { title: 'الحسابات والصلاحيات', english: 'ACCOUNTS', icon: Users, color: 'from-violet-600 to-purple-800', tab: 'users' as TabKey },
                  { title: 'الاشتراكات والتجديدات', english: 'SUBSCRIPTIONS', icon: Receipt, color: 'from-amber-500 to-orange-600', tab: 'subscriptions' as TabKey },
                  { title: 'التحليلات', english: 'ANALYTICS', icon: BarChart3, color: 'from-cyan-600 to-blue-700', tab: 'analytics' as TabKey },
                  { title: 'سجل العمليات', english: 'AUDIT LOG', icon: History, color: 'from-slate-600 to-slate-800', tab: 'audit' as TabKey },
                  { title: 'الدعم الفني', english: 'SUPPORT', icon: Headphones, color: 'from-rose-500 to-pink-700', tab: 'support' as TabKey },
                  { title: 'إعدادات المنصة', english: 'PLATFORM SETTINGS', icon: SlidersHorizontal, color: 'from-teal-600 to-emerald-800', tab: 'settings' as TabKey },
                ].map(item => <ModuleCard key={item.tab} icon={<item.icon />} title={item.english} arTitle={item.title} description="" color={item.color} onClick={() => setTab(item.tab)} enterLabel={isEnglish ? 'Open section' : 'فتح القسم'} lang={lang} />)}
              </div>
            </section>)}

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
            {tab === 'subscriptions' && <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">الاشتراكات والتجديدات ({schools.length})</h2><p className="mt-1 text-sm text-slate-500">إدارة الباقة والحالة وتجديد المدة من سجل كل مدرسة.</p></div><button onClick={() => void loadData()} className={`${buttonClass} border border-slate-200 bg-white text-slate-700`}><RefreshCw size={15}/> تحديث البيانات</button></div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {[
                  { label: 'اشتراكات فعّالة', value: schools.filter(s => s.status === 'active').length },
                  { label: 'فترات تجريبية', value: schools.filter(s => s.status === 'trial').length },
                  { label: 'اشتراكات موقوفة', value: schools.filter(s => s.status === 'suspended').length },
                ].map(item => <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4"><div className="text-sm text-slate-500">{item.label}</div><div className="mt-2 text-2xl font-bold">{item.value}</div></div>)}
              </div>
              <div className="space-y-3">{schools.length ? schools.map(school => <SchoolSubscriptionRow key={school.id} school={school} plans={plans} usersCount={userCountForSchool(school.id)} disabled={saving} onSave={saveSchool}/>) : <EmptyState message="لا توجد مدارس مسجلة."/>}</div>
            </section>}

            {tab === 'analytics' && <section className="relative grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_minmax(0,0.82fr)] gap-3 overflow-hidden rounded-[26px] border border-white/90 p-3 text-slate-800 shadow-[0_18px_55px_rgba(62,91,83,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] sm:p-4" style={{ background: 'radial-gradient(ellipse at 8% 0%,rgba(255,255,255,0.98),transparent 36%),radial-gradient(ellipse at 96% 5%,rgba(200,226,226,0.74),transparent 31%),radial-gradient(ellipse at 80% 100%,rgba(211,231,219,0.88),transparent 36%),linear-gradient(135deg,#eef5f1 0%,#e8f0f1 48%,#f5f3ed 100%)' }}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px]">
                <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle,#c4e9dc 0%,rgba(196,233,220,0) 70%)' }}/>
                <div className="absolute -bottom-32 left-[28%] h-80 w-80 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle,#d1e1f0 0%,rgba(209,225,240,0) 70%)' }}/>
                <div className="absolute inset-0 opacity-[0.13]" style={{ backgroundImage: 'linear-gradient(rgba(86,119,110,0.13) 1px,transparent 1px),linear-gradient(90deg,rgba(86,119,110,0.13) 1px,transparent 1px)', backgroundSize: '34px 34px', maskImage: 'linear-gradient(to bottom,black,transparent 80%)' }}/>
              </div>

              <header className="relative z-10 flex min-w-0 items-center justify-between gap-3 border-b border-white/80 pb-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white bg-gradient-to-br from-white via-[#e4eee9] to-[#c1d0cc] text-[#21664f] shadow-[inset_0_1px_1px_white,0_4px_12px_rgba(60,91,82,0.12)]">
                    <div className="absolute inset-[2px] rounded-[13px] border border-white/90"/>
                    <Activity size={19} strokeWidth={1.8}/>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-black tracking-tight text-[#183b30] sm:text-lg">مركز التحليلات</h2>
                      <span className="rounded-full border border-[#d6b879]/60 bg-[#fff9e9]/85 px-2.5 py-1 text-[9px] font-bold text-[#876728] shadow-[inset_0_1px_0_white]">معاينة أثناء التطوير</span>
                    </div>
                    <p className="mt-1 truncate text-[10px] text-slate-500 sm:text-xs">رؤية موحّدة للمدارس والحسابات والباقات، بتصميم يتطور مع بيانات قُل.</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden items-center gap-1.5 rounded-full border border-white/90 bg-white/55 px-2.5 py-1.5 text-[9px] font-medium text-slate-500 shadow-[inset_0_1px_0_white] sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-[#c59a43]"/>بيانات تجريبية قابلة للتغيّر</span>
                  <button onClick={exportAnalyticsReport} title="تصدير تقرير CSV" className="flex h-8 items-center gap-1.5 rounded-xl border border-white bg-white/65 px-2.5 text-[10px] font-semibold text-slate-700 shadow-[0_2px_7px_rgba(60,80,73,0.06),inset_0_1px_0_white] transition-all hover:-translate-y-0.5 hover:bg-white sm:px-3 sm:text-xs"><Activity size={13}/> تصدير</button>
                  <button onClick={() => void loadData()} disabled={loading} title="تحديث البيانات" className="flex h-8 items-center gap-1.5 rounded-xl border border-[#1f6a50] bg-gradient-to-b from-[#277858] to-[#145a42] px-2.5 text-[10px] font-semibold text-white shadow-[0_3px_8px_rgba(24,99,71,0.2),inset_0_1px_0_rgba(255,255,255,0.22)] transition-all hover:-translate-y-0.5 disabled:opacity-50 sm:px-3 sm:text-xs"><RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> تحديث</button>
                </div>
              </header>

              <div className="relative z-10 grid min-h-0 grid-cols-2 gap-3 xl:grid-cols-4 [perspective:1200px]">
                {[
                  { label: 'المدارس المسجلة', value: schools.length, note: (schoolStatusStats.find(x => x.key === 'active')?.count || 0) + ' اشتراك فعّال', code: '01', accent: '#38765D', icon: Building2 },
                  { label: 'حسابات المنصة', value: users.length, note: (roleStats.find(x => x.label === 'المعلمون')?.count || 0) + ' معلم مسجل', code: '02', accent: '#496D91', icon: Users },
                  { label: 'الطلاب', value: roleStats.find(x => x.label === 'الطلاب')?.count || 0, note: 'الحسابات المسجلة بدور طالب', code: '03', accent: '#76669B', icon: GraduationCap },
                  { label: 'الباقات المتاحة', value: plans.filter(p => p.isActive !== false).length, note: schoolPlanStats.filter(x => x.count > 0).length + ' باقة مرتبطة بمدارس', code: '04', accent: '#997841', icon: Layers3 },
                ].map((item, index) => <motion.div key={item.label} initial={{ opacity: 0, y: 10, rotateX: -4 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.42, delay: index * 0.06, ease: [0.2, 0.7, 0.25, 1] }} whileHover={{ y: -3, rotateX: 1.5, rotateY: index % 2 === 0 ? -1.5 : 1.5, transition: { duration: 0.2 } }} style={{ transformStyle: 'preserve-3d' }} className="group relative min-h-0 overflow-hidden rounded-[20px] border border-white/90 p-[1px] shadow-[0_7px_20px_rgba(63,86,79,0.08),inset_0_1px_0_white] transition-shadow duration-300 hover:shadow-[0_12px_26px_rgba(63,86,79,0.13)]">
                  <div className="absolute inset-0 rounded-[20px]" style={{ background: 'linear-gradient(128deg,#ffffff 0%,#b8c5c2 9%,#f8fbfa 20%,#d5dedc 31%,#ffffff 43%,#c0cbc9 55%,#f9fbfa 69%,#b1bfbb 81%,#ffffff 94%)' }}/>
                  <motion.div aria-hidden="true" className="pointer-events-none absolute -inset-y-8 -left-1/2 w-1/2 rotate-[18deg] opacity-0 blur-sm group-hover:opacity-75" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.95),rgba(196,228,218,0.45),transparent)' }} animate={{ x: ['-20%', '245%'], opacity: [0.08, 0.22, 0.08] }} transition={{ duration: 8, repeat: Infinity, repeatDelay: index * 0.8, ease: 'easeInOut' }}/>
                  <div className="relative flex h-full min-h-[90px] flex-col justify-between overflow-hidden rounded-[19px] border border-white/80 px-3 py-2.5 sm:min-h-[102px] sm:px-4 sm:py-3" style={{ background: 'linear-gradient(145deg,rgba(255,255,255,0.88),rgba(234,242,239,0.74) 34%,rgba(255,255,255,0.91) 57%,rgba(216,229,225,0.76) 100%)', backdropFilter: 'blur(16px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,1),inset 0 -1px 0 rgba(105,119,130,0.11)' }}>
                    <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: 'radial-gradient(ellipse at 8% 0%,rgba(255,255,255,0.95),transparent 42%),radial-gradient(ellipse at 100% 100%,rgba(185,210,201,0.38),transparent 53%)' }}/>
                    <div className="relative flex items-start justify-between gap-2">
                      <div className="min-w-0"><div className="mb-1 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.accent, boxShadow: '0 0 0 3px ' + item.accent + '18' }}/><p className="truncate text-[10px] font-semibold tracking-wide text-slate-600 sm:text-xs">{item.label}</p></div>
                        <motion.p initial={{ opacity: 0.65 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.18 + index * 0.07 }} className="text-2xl font-black leading-none tracking-[-0.04em] text-slate-800 tabular-nums sm:text-3xl" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.95),0 -1px 0 rgba(87,101,112,0.08)' }}>{item.value.toLocaleString(isEnglish ? 'en-US' : 'ar-AE')}</motion.p>
                      </div>
                      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/90 bg-gradient-to-br from-white via-slate-100 to-slate-300 text-slate-600 shadow-[inset_0_1px_2px_rgba(255,255,255,0.98),0_2px_5px_rgba(47,60,70,0.10)] sm:h-10 sm:w-10"><div className="absolute inset-[2px] rounded-full border border-white/90"/><item.icon size={17} strokeWidth={1.7} style={{ color: item.accent }}/></div>
                    </div>
                    <div className="relative mt-2 flex items-end justify-between gap-2 border-t border-slate-300/50 pt-2"><p className="truncate text-[9px] text-slate-500 sm:text-[10px]">{item.note}</p><span className="shrink-0 font-mono text-[9px] tracking-[0.18em] text-slate-400">{item.code}</span></div>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg,transparent,' + item.accent + '88,rgba(255,255,255,0.95),transparent)' }}/>
                  </div>
                </motion.div>)}
              </div>

              <div className="relative z-10 grid min-h-0 grid-cols-1 gap-3 xl:grid-cols-[1fr_1.14fr_0.86fr]">
                <section className="relative flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/90 bg-white/55 p-3 shadow-[0_8px_24px_rgba(70,99,88,0.07),inset_0_1px_0_white] backdrop-blur-xl sm:p-4">
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.72),rgba(224,238,232,0.22) 48%,rgba(211,225,235,0.36))' }}/>
                  <div className="relative flex items-start justify-between gap-2"><div><h3 className="text-xs font-bold text-[#244638] sm:text-sm">حالة المدارس</h3><p className="mt-1 text-[9px] text-slate-500 sm:text-[10px]">توزيع توضيحي لحالات الاشتراك</p></div><span className="rounded-full border border-white bg-white/65 px-2 py-1 text-[9px] text-slate-500 shadow-sm">الاشتراكات</span></div>
                  <div className="relative flex min-h-0 flex-1 items-center justify-center gap-3">
                    <div className="relative flex aspect-square max-h-full w-[43%] max-w-[132px] items-center justify-center rounded-full p-[5px] shadow-[0_6px_18px_rgba(43,95,73,0.12)]" style={{ background: schools.length ? 'conic-gradient(' + schoolStatusStats.map((item,index)=>{ const before=schoolStatusStats.slice(0,index).reduce((sum,part)=>sum+part.count,0); const after=before+item.count; const total=schools.length||1; return item.color+' '+before/total*100+'% '+after/total*100+'%'; }).join(', ') + ')' : 'conic-gradient(#dbe8e1 0% 100%)' }}>
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(235,243,239,0.9))] shadow-[inset_0_2px_5px_rgba(74,102,91,0.08)]"><span className="text-2xl font-black tabular-nums text-[#203b30] sm:text-3xl">{schools.length.toLocaleString('ar-AE')}</span><span className="mt-1 text-center text-[8px] text-slate-500 sm:text-[9px]">إجمالي المدارس</span></div>
                    </div>
                    <div className="relative min-w-0 flex-1 space-y-3">{schoolStatusStats.map(item=><div key={item.key} className="flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-1.5"><span className="h-2 w-2 shrink-0 rounded-full shadow-sm" style={{backgroundColor:item.color}}/><span className="truncate text-[10px] text-slate-600 sm:text-xs">{item.label}</span></div><div className="text-left"><span className="text-xs font-bold tabular-nums text-slate-800">{item.count}</span><span className="mr-1 text-[9px] text-slate-400">{schools.length?Math.round(item.count/schools.length*100):0}%</span></div></div>)}</div>
                  </div>
                  <p className="relative border-t border-white/70 pt-2 text-[9px] text-slate-400">ستُعرض النتائج الفعلية بعد اعتماد بيانات المدارس.</p>
                </section>

                <section className="relative flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/90 bg-white/58 p-3 shadow-[0_8px_24px_rgba(70,99,88,0.07),inset_0_1px_0_white] backdrop-blur-xl sm:p-4">
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 0%,rgba(190,226,216,0.34),transparent 52%),linear-gradient(150deg,rgba(255,255,255,0.7),rgba(244,249,247,0.38))' }}/>
                  <div className="relative flex items-start justify-between gap-2"><div><h3 className="text-xs font-bold text-[#244638] sm:text-sm">تسجيل المدارس عبر الوقت</h3><p className="mt-1 text-[9px] text-slate-500 sm:text-[10px]">الأشهر الستة الأخيرة وفق تاريخ الإنشاء</p></div><span className="rounded-full border border-white bg-white/70 px-2 py-1 text-[9px] text-slate-500">اتجاه التسجيل</span></div>
                  <div className="relative mt-3 flex min-h-0 flex-1 items-end gap-2 overflow-hidden rounded-xl border border-white/85 bg-white/36 px-2 pt-3">
                    <div className="pointer-events-none absolute inset-2 flex flex-col justify-between pb-5 pt-1">{[0,1,2].map(line=><div key={line} className="border-t border-dashed border-slate-300/65"/>)}</div>
                    {recentRegistrationStats.map((item,index)=>{const max=Math.max(1,...recentRegistrationStats.map(x=>x.count));const height=item.count?Math.max(9,item.count/max*100):3;return <div key={item.label+index} className="relative z-10 flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"><span className="text-[9px] font-semibold tabular-nums text-slate-500">{item.count}</span><motion.div initial={{height:0}} animate={{height:height+'%'}} transition={{duration:0.55,delay:index*0.05,ease:'easeOut'}} title={item.label+': '+item.count+' مدرسة'} className={'w-full max-w-8 rounded-t-md border-x border-t border-white/70 '+(index===recentRegistrationStats.length-1?'bg-gradient-to-t from-[#287254] via-[#56ad87] to-[#c4e8d4] shadow-[0_3px_9px_rgba(52,125,88,0.12)]':'bg-gradient-to-t from-[#9fcab7] to-[#e8f5ee]')}/></div>;})}
                  </div>
                  <div className="relative mt-2 flex justify-around gap-1">{recentRegistrationStats.map((item,index)=><span key={item.label+index} className={'text-[9px] '+(index===recentRegistrationStats.length-1?'font-bold text-[#28684e]':'text-slate-400')}>{item.label}</span>)}</div>
                </section>

                <section className="relative flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/90 bg-white/58 p-3 shadow-[0_8px_24px_rgba(70,99,88,0.07),inset_0_1px_0_white] backdrop-blur-xl sm:p-4">
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(140deg,rgba(255,255,255,0.78),rgba(232,239,248,0.37) 58%,rgba(223,239,232,0.4))' }}/>
                  <div className="relative flex items-start justify-between gap-2"><div><h3 className="text-xs font-bold text-[#244638] sm:text-sm">تركيبة الحسابات</h3><p className="mt-1 text-[9px] text-slate-500 sm:text-[10px]">حسب نوع المستخدم</p></div><span className="rounded-full border border-white bg-white/70 px-2 py-1 text-[9px] text-slate-500">الأدوار</span></div>
                  <div className="relative mt-4 flex h-2.5 overflow-hidden rounded-full border border-white/90 bg-slate-200/65 shadow-[inset_0_1px_2px_rgba(41,63,55,0.08)]">{roleStats.filter(item=>item.count>0).map(item=><div key={item.label} title={item.label+': '+item.count} style={{width:(users.length?item.count/users.length*100:0)+'%',backgroundColor:item.color}}/>)}</div>
                  <div className="relative mt-4 min-h-0 space-y-3">{roleStats.slice(0,4).map(item=>{const percent=users.length?Math.round(item.count/users.length*100):0;return <div key={item.label} className="flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><span className="h-2 w-2 shrink-0 rounded-full ring-2 ring-white/90" style={{backgroundColor:item.color}}/><span className="truncate text-[10px] text-slate-600 sm:text-xs">{item.label}</span></div><span className="text-[10px] tabular-nums text-slate-500 sm:text-xs">{item.count} <span className="text-slate-400">({percent}%)</span></span></div>;})}</div>
                  <p className="relative mt-auto border-t border-white/75 pt-2 text-[9px] text-slate-400">الإجمالي: {users.length.toLocaleString('ar-AE')} حساب</p>
                </section>
              </div>

              <div className="relative z-10 grid min-h-0 grid-cols-1 gap-3 xl:grid-cols-[1fr_1.05fr_0.95fr]">
                <section className="relative flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/90 bg-white/58 p-3 shadow-[0_8px_24px_rgba(70,99,88,0.07),inset_0_1px_0_white] backdrop-blur-xl sm:p-4">
                  <div className="pointer-events-none absolute inset-0" style={{background:'linear-gradient(145deg,rgba(255,255,255,0.83),rgba(233,241,237,0.35) 55%,rgba(224,234,242,0.4))'}}/>
                  <div className="relative mb-3 flex items-center justify-between gap-2"><div><h3 className="text-xs font-bold text-[#244638] sm:text-sm">المدارس حسب الباقة</h3><p className="mt-1 text-[9px] text-slate-500 sm:text-[10px]">مقارنة الارتباط بالخطط</p></div><div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white bg-gradient-to-br from-white to-slate-200 text-[#527c68] shadow-sm"><Layers3 size={15}/></div></div>
                  {schoolPlanStats.length ? <div className="relative min-h-0 flex-1 space-y-3 overflow-hidden">{schoolPlanStats.slice(0,4).map(item=>{const percent=schools.length?Math.round(item.count/schools.length*100):0;return <div key={item.id} className="space-y-1.5"><div className="flex items-center justify-between gap-2"><span className="truncate text-[10px] font-medium text-slate-700 sm:text-xs">{item.name}{!item.active?' · موقوفة':''}</span><span className="shrink-0 text-[10px] tabular-nums text-slate-500">{item.count}</span></div><div className="h-1.5 overflow-hidden rounded-full border border-white bg-slate-200/75 shadow-inner"><motion.div initial={{width:0}} animate={{width:percent+'%'}} transition={{duration:0.5,ease:'easeOut'}} className="h-full rounded-full bg-gradient-to-l from-[#216b4e] via-[#5ba987] to-[#c9e8d6]"/></div></div>;})}</div> : <div className="relative flex flex-1 items-center justify-center text-xs text-slate-400">ستظهر مقارنة الباقات بعد إدخال بياناتها.</div>}
                  <div className="relative mt-2 border-t border-white/75 pt-2 text-[9px] text-slate-400">{schools.filter(s=>!s.planId).length} مدرسة دون باقة مرتبطة</div>
                </section>

                <section className="relative flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/90 bg-white/58 p-3 shadow-[0_8px_24px_rgba(70,99,88,0.07),inset_0_1px_0_white] backdrop-blur-xl sm:p-4">
                  <div className="pointer-events-none absolute inset-0" style={{background:'linear-gradient(135deg,rgba(255,255,255,0.88),rgba(246,244,236,0.42) 58%,rgba(226,239,232,0.35))'}}/>
                  <div className="relative mb-2 flex items-center justify-between gap-2"><div><h3 className="text-xs font-bold text-[#244638] sm:text-sm">تحتاج إلى متابعة</h3><p className="mt-1 text-[9px] text-slate-500 sm:text-[10px]">مدارس تحتاج إلى مراجعة بياناتها</p></div><span className="rounded-full border border-[#e7d8b6] bg-[#fff9e9]/80 px-2 py-1 text-[9px] font-semibold text-[#8f702e]">قائمة مراجعة</span></div>
                  <div className="relative min-h-0 flex-1 divide-y divide-white/80 overflow-hidden">{schools.filter(s=>s.status==='suspended'||!s.planId||s.status==='trial').slice(0,4).map(school=><div key={school.id} className="flex min-w-0 items-center justify-between gap-2 py-2"><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-slate-800 sm:text-xs">{school.name}</p><p className="truncate text-[9px] text-slate-500">{currentPlanName(school.planId)}</p></div><span className={'shrink-0 rounded-md px-2 py-1 text-[9px] '+(school.status==='suspended'?'bg-rose-50/90 text-rose-700':school.status==='trial'?'bg-[#fff5dd] text-[#8f702e]':'bg-slate-100/80 text-slate-600')}>{school.status==='suspended'?'موقوفة':school.status==='trial'?'تجريبية':'بلا باقة'}</span></div>)}
                    {!schools.some(s=>s.status==='suspended'||!s.planId||s.status==='trial')&&<div className="flex h-full items-center justify-center text-xs text-slate-400">ستظهر هنا الحالات التي تحتاج مراجعة.</div>}
                  </div>
                  <button onClick={()=>setTab('schools')} className="relative mt-2 border-t border-white/75 pt-2 text-right text-[10px] font-bold text-[#246749] transition-colors hover:text-[#174c35]">فتح إدارة المدارس ←</button>
                </section>

                <section className="relative flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/90 p-3 shadow-[0_8px_24px_rgba(70,99,88,0.07),inset_0_1px_0_white] backdrop-blur-xl sm:p-4" style={{background:'linear-gradient(145deg,rgba(225,239,231,0.78),rgba(255,255,255,0.66) 48%,rgba(221,234,242,0.70))'}}>
                  <div className="pointer-events-none absolute inset-0" style={{background:'radial-gradient(ellipse at 90% 0%,rgba(255,255,255,0.9),transparent 50%),linear-gradient(130deg,rgba(255,255,255,0.30),transparent 50%)'}}/>
                  <div className="relative"><h3 className="text-xs font-bold text-[#244638] sm:text-sm">ملخص المنصة</h3><p className="mt-1 text-[9px] text-slate-500 sm:text-[10px]">معاينة لما ستعرضه اللوحة بعد اكتمال التسجيل</p></div>
                  <div className="relative mt-3 space-y-3">
                    <div className="flex items-center justify-between gap-2"><span className="text-[10px] text-slate-600">الأقسام التعليمية</span><span className="text-sm font-bold text-slate-900">{SCHOOL_MODULES.length}</span></div>
                    <div className="flex items-center justify-between gap-2"><span className="text-[10px] text-slate-600">الباقات المسجلة</span><span className="text-sm font-bold text-slate-900">{plans.length}</span></div>
                    <div className="flex items-center justify-between gap-2"><span className="text-[10px] text-slate-600">مديرو المدارس</span><span className="text-sm font-bold text-slate-900">{users.filter(u=>u.role==='schoolAdmin').length}</span></div>
                  </div>
                  <div className="relative mt-auto rounded-xl border border-white/80 bg-white/45 p-2.5 text-[9px] leading-4 text-slate-500 shadow-[inset_0_1px_0_white]">الأرقام الحالية استرشادية خلال التطوير، وستتبع النتائج السجلات التي تُدخلها الإدارة وتراجعها.</div>
                </section>
              </div>
            </section>}

            {tab === 'audit' && <section className="space-y-3"><div><h2 className="text-xl font-black">سجل العمليات الإدارية</h2><p className="mt-1 text-sm text-slate-500">يحتوي على العمليات المسجلة بعد تفعيل السجل، ولا يتضمن التغييرات السابقة.</p></div>{auditLogs.length ? <div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="divide-y divide-slate-100">{auditLogs.map(log=><div key={log.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)]"><div className="text-xs text-slate-500">{log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString('ar-AE') : 'وقت غير متاح'}</div><div className="text-sm font-semibold">{log.action || 'عملية إدارية'}</div><div className="text-xs text-slate-500">{log.details || log.target || ''} · {log.actorEmail || ''}</div></div>)}</div></div>:<EmptyState message="لا توجد سجلات عمليات متاحة بعد. ستظهر العمليات المسجلة بعد نشر قواعد سجل التدقيق."/>}</section>}

            {tab === 'support' && <section className="space-y-4">
              <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-[#f8fbf9] to-[#edf5f0] p-4 shadow-sm">
                <div className="mb-3"><h2 className="font-bold text-slate-900">إدارة المواعيد</h2><p className="mt-1 text-xs text-slate-500">أنشئ فترات فعلية للحجز، ثم راجع الحجوزات الواردة من المدارس. التوقيت المعتمد هو الإمارات (Asia/Dubai).</p></div>
                <form onSubmit={createAppointmentSlot} className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] xl:items-end">
                  <label className="space-y-1 text-xs font-semibold text-slate-700">اليوم والوقت (بتوقيت الإمارات)<input type="datetime-local" className={inputClass} value={appointmentStart} onChange={e=>setAppointmentStart(e.target.value)} required/></label>
                  <label className="space-y-1 text-xs font-semibold text-slate-700">عنوان الموعد<input className={inputClass} value={appointmentTitle} onChange={e=>setAppointmentTitle(e.target.value)} maxLength={120} placeholder="جلسة تعريف وتدريب"/></label>
                  <label className="space-y-1 text-xs font-semibold text-slate-700">نوع الموعد<select className={inputClass} value={appointmentKind} onChange={e=>setAppointmentKind(e.target.value)}><option value="training">تدريب على المنصة</option><option value="support">دعم فني</option></select></label>
                  <label className="space-y-1 text-xs font-semibold text-slate-700">المدة<select className={inputClass} value={appointmentDuration} onChange={e=>setAppointmentDuration(e.target.value)}><option value="20">20 دقيقة</option><option value="30">30 دقيقة</option><option value="40">40 دقيقة</option><option value="60">60 دقيقة</option></select></label>
                  <button disabled={saving} className={`${buttonClass} bg-emerald-800 text-white`}><CalendarDays size={15}/>{saving?'جارٍ الحفظ...':'إضافة وقت'}</button>
                </form>
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-bold">المواعيد والحجوزات ({appointmentSlots.length})</h3><button onClick={()=>void loadData()} className={`${buttonClass} border border-slate-200 bg-white text-slate-700`}><RefreshCw size={14}/> تحديث</button></div>
                {appointmentSlots.length ? <div className="grid gap-2 md:grid-cols-2">{appointmentSlots.map(slot=><div key={slot.id} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{slot.title || (slot.kind==='training'?'جلسة تدريب':'جلسة دعم')}</p><p className="mt-1 text-xs text-slate-500">{slot.startsAt?.toDate?new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'ar-AE',{timeZone:'Asia/Dubai',dateStyle:'medium',timeStyle:'short'}).format(slot.startsAt.toDate()):slot.startsAt?new Intl.DateTimeFormat('ar-AE',{timeZone:'Asia/Dubai',dateStyle:'medium',timeStyle:'short'}).format(new Date(slot.startsAt)):'وقت غير محدد'} · {slot.durationMinutes||30} دقيقة</p><p className="mt-1 truncate text-xs text-slate-500">{slot.status==='booked'?'حجز: '+(slot.schoolName||'مدرسة')+' · '+(slot.bookerEmail||'') : slot.status==='cancelled'?'ملغى':'متاح للحجز'}</p></div><div className="flex shrink-0 flex-col gap-1.5">{slot.status==='cancelled'?<button disabled={saving} onClick={()=>void updateAppointmentSlot(slot,'available')} className="rounded-lg border border-emerald-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-emerald-800">إعادة إتاحة</button>:<button disabled={saving} onClick={()=>void updateAppointmentSlot(slot,'cancelled')} className="rounded-lg border border-rose-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-rose-700">{slot.status==='booked'?'إلغاء الحجز':'إلغاء الموعد'}</button>}</div></div>)}</div>:<p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">لم تُنشأ فترات للحجز بعد. أضف أول موعد من النموذج أعلاه.</p>}
              </section>
              <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-xl font-black">مركز الدعم الفني</h2><p className="mt-1 text-sm text-slate-500">طلبات المساعدة التي ترسلها المدارس من حساباتها.</p></div><button onClick={() => void loadData()} className={`${buttonClass} border border-slate-200 bg-white text-slate-700`}><RefreshCw size={15}/> تحديث الطلبات</button></div><div className="flex flex-wrap items-center gap-2"><label className="text-sm font-semibold">تصفية الطلبات</label><select value={ticketFilter} onChange={e=>setTicketFilter(e.target.value)} className={inputClass + ' max-w-56'}><option value="all">كل الحالات</option><option value="open">جديد</option><option value="in_progress">قيد المعالجة</option><option value="resolved">تم الحل</option></select></div>{supportTickets.filter(t=>ticketFilter==='all'||(t.status||'open')===ticketFilter).length ? <div className="space-y-3">{supportTickets.filter(t=>ticketFilter==='all'||(t.status||'open')===ticketFilter).map(ticket=><div key={ticket.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px_auto] md:items-center"><div className="min-w-0"><div className="font-bold">{ticket.title || 'طلب دعم'}</div><div className="mt-1 text-xs text-slate-500">{ticket.schoolName || ticket.schoolId || 'مدرسة غير محددة'} · {ticket.contactEmail || ''} · {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleString('ar-AE') : 'تاريخ غير متاح'}</div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{ticket.description || ''}</p></div><select value={ticketStatusDrafts[ticket.id] || ticket.status || 'open'} onChange={e=>setTicketStatusDrafts(old=>({...old,[ticket.id]:e.target.value}))} className={inputClass}><option value="open">جديد</option><option value="in_progress">قيد المعالجة</option><option value="resolved">تم الحل</option></select><button disabled={saving || (ticketStatusDrafts[ticket.id] || ticket.status || 'open')===(ticket.status||'open')} onClick={()=>void updateTicketStatus(ticket)} className={`${buttonClass} bg-emerald-800 text-white`}><Check size={15}/> حفظ الحالة</button></div>)}</div>:<EmptyState message="لا توجد طلبات دعم بهذه الحالة."/>}</section></section>}

            {tab === 'settings' && <section className="space-y-4"><div><h2 className="text-xl font-black">إعدادات المنصة</h2><p className="mt-1 text-sm text-slate-500">معلومات تشغيلية مرجعية. لا تُعرض مفاتيح أو أسرار الاتصال في واجهة الإدارة.</p></div><div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="font-bold">قاعدة البيانات</h3><p className="mt-2 text-xs text-slate-500">قاعدة Firestore المستخدمة في تطبيق قُل</p><code dir="ltr" className="mt-2 block break-all text-xs">ai-studio-d8ed89a2-6662-4aa5-9cc7-1e8d0693722e</code></div><div className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="font-bold">الوحدات التعليمية</h3><p className="mt-2 text-xs text-slate-500">{SCHOOL_MODULES.length} قسمًا معرّفًا في إعدادات المنصة.</p><p className="mt-2 text-xs text-slate-500">تعديل تعريف الأقسام يتم من إعدادات المشروع، ثم اختبار توافق الباقات القائمة.</p></div><div className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="font-bold">الأمان</h3><p className="mt-2 text-sm text-slate-600">الأدوار وحدود الوصول تُفرض في Firestore Rules. إخفاء قسم من القائمة ليس بديلًا عن قواعد الأمان.</p><a className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-emerald-800" href="https://console.cloud.google.com/firestore/databases/ai-studio-d8ed89a2-6662-4aa5-9cc7-1e8d0693722e/security?project=gen-lang-client-0558881211" target="_blank" rel="noreferrer">فتح قواعد الأمان <ExternalLink size={14}/></a></div><div className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="font-bold">التكاملات التجارية</h3><p className="mt-2 text-sm text-slate-600">بوابة الدفع والفوترة الآلية وإرسال دعوات تسجيل الدخول تحتاج إلى تهيئة خدمات خلفية منفصلة قبل تفعيلها.</p></div></div></section>}

          </>
        )}

        </div>
      </div>
    </div>
    </RoleLocalizer>
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
