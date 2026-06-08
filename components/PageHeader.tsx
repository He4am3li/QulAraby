import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="w-full text-right border-b border-slate-100 pb-5 mb-6" dir="rtl">
      <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

// تصدير افتراضي لتجنب أخطاء الاستدعاء في حال تم استيراده بدون أقواس {}
export default PageHeader;
