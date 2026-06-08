import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

export const QuotaWarning: React.FC = () => {
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const message = 'reason' in event ? event.reason?.message : event.message;
      if (message && (message.includes('resource-exhausted') || message.includes('Quota exceeded'))) {
        setError(message);
        setShow(true);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-md px-4"
      >
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-2xl flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-amber-900 mb-1 arabic-font">تم تجاوز حصة البيانات اليومية</h3>
            <p className="text-xs text-amber-700 arabic-font leading-relaxed">
              لقد استهلك التطبيق الحد الأقصى المسموح به من العمليات المجانية لهذا اليوم. سيتم تصفير العداد غداً. 
              حاول تقليل عدد الرسومات أو التفاعلات السريعة حالياً.
            </p>
          </div>
          <button 
            onClick={() => setShow(false)}
            className="p-1 text-amber-400 hover:text-amber-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
