import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

export const QuotaWarning: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleQuotaError = (event: CustomEvent<{ message?: string }>) => {
      setErrorMessage(event.detail?.message || 'تم تجاوز الحد المسموح به لطلبات الذكاء الاصطناعي مؤقتاً.');
      setShowWarning(true);
    };

    window.addEventListener('ai-quota-warning' as any, handleQuotaError as any);
    return () => {
      window.removeEventListener('ai-quota-warning' as any, handleQuotaError as any);
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md bg-amber-500/95 text-slate-950 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-300">
      <AlertCircle size={20} className="shrink-0 text-slate-950" />
      <p className="text-xs font-bold flex-1">{errorMessage}</p>
      <button 
        onClick={() => setShowWarning(false)}
        className="p-1 hover:bg-black/10 rounded-lg transition"
      >
        <X size={16} />
      </button>
    </div>
  );
};
