import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Download, FileText, Calendar, Users, Award, Trash2, ArrowRight, Play, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { WhiteboardSessionState } from '../../types/whiteboard';

interface SessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: WhiteboardSessionState;
  onRestoreSession: (session: WhiteboardSessionState) => void;
  onExportPdf: () => void;
  onExportImage: () => void;
}

interface SavedSessionRecord {
  id: string;
  code: string;
  title: string;
  date: string;
  studentsCount: number;
  pagesCount: number;
  totalScore: number;
  data: WhiteboardSessionState;
}

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onRestoreSession,
  onExportPdf,
  onExportImage
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'history'>('export');
  const [savedRecords, setSavedRecords] = useState<SavedSessionRecord[]>(() => {
    const raw = localStorage.getItem('qul_whiteboard_archive');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return [
      {
        id: 'rec_1',
        code: 'QUL-9821',
        title: 'درس المفردات وتراكيب السفر والمطار',
        date: '2026-08-28',
        studentsCount: 6,
        pagesCount: 3,
        totalScore: 85,
        data: currentSession
      },
      {
        id: 'rec_2',
        code: 'QUL-4412',
        title: 'حصة تدريب الخط العربي ورسم الحروف',
        date: '2026-08-25',
        studentsCount: 4,
        pagesCount: 2,
        totalScore: 60,
        data: currentSession
      }
    ];
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveCurrentSession = () => {
    const newRecord: SavedSessionRecord = {
      id: 'rec_' + Date.now(),
      code: currentSession.code,
      title: currentSession.title || 'حصة اللغة العربية التفاعلية',
      date: new Date().toISOString().split('T')[0],
      studentsCount: Object.keys(currentSession.students || {}).length,
      pagesCount: currentSession.pages.length,
      totalScore: Object.values(currentSession.students || {}).reduce((acc, s) => acc + (s.score || 0), 0),
      data: currentSession
    };

    const updated = [newRecord, ...savedRecords];
    setSavedRecords(updated);
    localStorage.setItem('qul_whiteboard_archive', JSON.stringify(updated));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedRecords.filter(r => r.id !== id);
    setSavedRecords(updated);
    localStorage.setItem('qul_whiteboard_archive', JSON.stringify(updated));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 w-full max-w-2xl shadow-2xl text-slate-800 relative overflow-hidden flex flex-col max-h-[88vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200/60 shadow-sm">
                <History size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 arabic-font flex items-center gap-2">
                  سجل الحصص والتصدير والأرشفة 📁
                </h3>
                <p className="text-xs text-slate-500 font-medium">حفظ السبورة وتصدير الشروحات كملفات PDF وصور عالية الدقة</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-100/80 p-1.5 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold arabic-font transition ${
                activeTab === 'export'
                  ? 'bg-white text-indigo-700 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Download size={16} />
              <span>تصدير وحفظ الشرح</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold arabic-font transition ${
                activeTab === 'history'
                  ? 'bg-white text-indigo-700 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <History size={16} />
              <span>الحصص السابقة والمحفوظة ({savedRecords.length})</span>
            </button>
          </div>

          {/* Tab 1: Export Options */}
          {activeTab === 'export' && (
            <div className="space-y-4 flex-1 overflow-y-auto custom-scroll pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PDF Export Card */}
                <div
                  onClick={onExportPdf}
                  className="p-5 bg-gradient-to-br from-indigo-50/80 to-slate-50 border border-indigo-200/80 hover:border-indigo-400 rounded-2xl cursor-pointer transition shadow-xs hover:shadow-md group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                      <FileText size={20} />
                    </div>
                    <h4 className="text-base font-black text-slate-900 arabic-font mb-1">
                      تصدير كملف PDF
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      تجميع جميع صفحات السبورة في ملف PDF منسق عالي الدقة لمشاركته مع الطلاب
                    </p>
                  </div>

                  <button className="w-full mt-4 py-2 bg-indigo-600 group-hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
                    <Download size={14} />
                    تحميل ملف PDF
                  </button>
                </div>

                {/* Image Export Card */}
                <div
                  onClick={onExportImage}
                  className="p-5 bg-gradient-to-br from-emerald-50/80 to-slate-50 border border-emerald-200/80 hover:border-emerald-400 rounded-2xl cursor-pointer transition shadow-xs hover:shadow-md group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                      <ImageIcon size={20} />
                    </div>
                    <h4 className="text-base font-black text-slate-900 arabic-font mb-1">
                      حفظ كصورة PNG
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      التقاط وحفظ الصفحة الحالية للشاشة كصورة واضحة للنشر السريع
                    </p>
                  </div>

                  <button className="w-full mt-4 py-2 bg-emerald-600 group-hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
                    <Download size={14} />
                    تحميل الصورة
                  </button>
                </div>
              </div>

              {/* Save To Archive */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-0.5">حفظ الحصة في أرشيف المتصفح:</h4>
                  <p className="text-[11px] text-slate-500">حفظ محتويات جميع الصفحات مع نقاط وتفاعل الطلاب</p>
                </div>
                <button
                  onClick={handleSaveCurrentSession}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  {savedSuccess ? <Check size={14} className="text-emerald-400" /> : <History size={14} />}
                  <span>{savedSuccess ? 'تم الحفظ في الأرشيف!' : 'حفظ الآن'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: History List */}
          {activeTab === 'history' && (
            <div className="space-y-3 flex-1 overflow-y-auto custom-scroll pr-1">
              {savedRecords.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  لا توجد حصص سابقة محفوظة في الأرشيف
                </div>
              ) : (
                savedRecords.map(rec => (
                  <div
                    key={rec.id}
                    className="p-4 bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 rounded-2xl transition flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 arabic-font">{rec.title}</h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                          {rec.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {rec.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {rec.studentsCount} طلاب
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 font-bold">
                          <Award size={12} />
                          {rec.totalScore} نقطة
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onRestoreSession(rec.data);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <Play size={12} />
                        استعادة
                      </button>
                      <button
                        onClick={(e) => handleDeleteRecord(rec.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="حذف من الأرشيف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
