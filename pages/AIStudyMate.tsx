import React from 'react';

export const AIStudyMate: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 md:p-6 text-right" dir="rtl">
      {/* تنظيف الكود:
         ضع هنا فقط المحتويات التي كانت موجودة داخل وسم الـ <body> في ملفك القديم.
         تأكد من تغيير كلمة class إلى className إذا كنت تستخدم تنسيقات Tailwind.
      */}
      <h1 className="text-2xl font-black text-slate-950">مساعد الدراسة بالذكاء الاصطناعي</h1>
      <p className="text-slate-600 mt-2">مرحباً بك في صفحة الذكاء الاصطناعي.</p>
    </div>
  );
};

// التصدير الافتراضي لضمان التوافق مع نظام التوجيه لديك
export default AIStudyMate;
