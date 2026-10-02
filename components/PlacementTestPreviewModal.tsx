import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2 } from 'lucide-react';
import { generate80QuestionsHTML, downloadPlacementTestPDF } from '../services/placementTestPdf';

interface PlacementTestPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName?: string;
  lang?: 'ar' | 'en';
}

export const PlacementTestPreviewModal: React.FC<PlacementTestPreviewModalProps> = ({
  isOpen,
  onClose,
  teacherName = 'المعلم',
  lang = 'ar'
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const htmlContent = generate80QuestionsHTML(teacherName, false);
      
      const timer = setTimeout(() => {
        if (iframeRef.current) {
          const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();
          }
          setLoading(false);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, teacherName]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle PDF Download
  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await downloadPlacementTestPDF(teacherName);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-300"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl w-full max-w-5xl h-[94vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200/80 relative"
        >
          {/* Floating Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-50 w-10 h-10 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-white/90 hover:text-white flex items-center justify-center shadow-xl border border-white/20 transition-all active:scale-95 cursor-pointer"
            title={lang === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X size={20} />
          </button>

          {/* Modal Content Body */}
          <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col rounded-3xl">
            {loading && (
              <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-xs font-bold text-slate-600 arabic-font">جاري إعداد معاينة الورقة الكاملة...</span>
              </div>
            )}
            <iframe
              ref={iframeRef}
              title="Placement Test Preview"
              className="w-full flex-1 border-0 bg-slate-100 rounded-3xl"
            />

            {/* Floating Download PDF Button (matching Vocabulary & Letters preview worksheets) */}
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="absolute bottom-5 left-5 w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 border-2 border-white/80 z-30 cursor-pointer group"
              title={lang === 'ar' ? 'تحميل PDF' : 'Download PDF'}
            >
              {downloading ? (
                <Loader2 size={22} className="animate-spin text-white" />
              ) : (
                <Download size={22} className="group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
