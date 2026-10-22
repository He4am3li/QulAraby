import React from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole, School } from 'lucide-react';
import { useSchoolAccess } from './SchoolAccessProvider';

export const FeatureGate: React.FC<{ moduleId: string; children: React.ReactNode }> = ({ moduleId, children }) => {
  const access = useSchoolAccess();

  if (access.loading) {
    return <div className="min-h-[40vh] flex items-center justify-center text-slate-500">جارٍ التحقق من صلاحية القسم...</div>;
  }

  if (!access.canAccess(moduleId)) {
    return (
      <div dir="rtl" className="min-h-[55vh] flex items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            {access.accessError ? <School size={30} /> : <LockKeyhole size={30} />}
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {access.accessError ? 'الاشتراك غير متاح' : 'هذا القسم غير مشمول في باقة المدرسة'}
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            {access.accessError || 'يمكن لمسؤول المدرسة التواصل مع إدارة منصة قُل لتعديل الباقة أو تفعيل هذا القسم.'}
          </p>
          {access.schoolName && <p className="mt-2 text-sm text-slate-500">{access.schoolName}</p>}
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800">
            العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
