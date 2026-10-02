import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Star, Award, CheckCircle2, MessageSquare, Hand, Sparkles, X, Plus, Minus } from 'lucide-react';
import { WhiteboardStudent, WhiteboardSessionState } from '../../types/whiteboard';

interface StudentWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: WhiteboardSessionState;
  onScoreChange: (studentId: string, delta: number) => void;
  onGradeSubmission?: (studentId: string, score: number, feedback: string) => void;
}

export const StudentWorksModal: React.FC<StudentWorksModalProps> = ({
  isOpen,
  onClose,
  session,
  onScoreChange,
  onGradeSubmission
}) => {
  if (!isOpen) return null;

  const studentsList = Object.values(session.students || {});
  const activity = session.activeActivity;
  const submissions = activity?.submissions ? Object.values(activity.submissions) : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" dir="rtl">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl max-w-2xl w-full text-white ring-1 ring-white/10 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Users size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-white arabic-font">لوحة أعمال ومشاركات الطلاب</h3>
                <p className="text-xs text-emerald-400">متابعة إجابات النشاط، رفع اليد، وتقييم الأداء الفوري</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-2xl text-white/60 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Active Activity Question Banner */}
          {activity && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-2xl mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={13} /> {activity.title || 'النشاط التفاعلي النشط'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  {submissions.length} إجابات مرسلة
                </span>
              </div>
              <p className="text-xs text-white/90 font-bold arabic-font leading-relaxed">
                {activity.question}
              </p>
            </div>
          )}

          {/* Submissions & Students Content */}
          <div className="flex-1 overflow-y-auto custom-scroll space-y-3 pr-1">
            <h4 className="text-xs font-black text-amber-400 mb-2 flex items-center gap-1.5">
              <MessageSquare size={14} /> إجابات الطلاب على النشاط:
            </h4>

            {submissions.length === 0 ? (
              <div className="text-center py-6 bg-black/20 rounded-2xl border border-white/5 text-white/40 text-xs font-medium arabic-font">
                لم يرسل أي طالب إجابته بعد، بانتظار مشاركات الطلاب...
              </div>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.studentId}
                  className="bg-black/40 border border-emerald-500/20 p-3.5 rounded-2xl hover:border-emerald-500/40 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-black text-xs flex items-center justify-center">
                        {sub.studentName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-white arabic-font">{sub.studentName}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onScoreChange(sub.studentId, 1)}
                        className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span>+1 تشجيع</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-white/5 text-xs text-emerald-200 arabic-font font-medium mb-2">
                    {sub.answer}
                  </div>

                  {sub.feedback && (
                    <div className="text-[11px] text-amber-300 font-bold bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                      ملاحظة المعلم: {sub.feedback}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* General Class Roster & Scores */}
            <div className="pt-3 border-t border-white/10 mt-4">
              <h4 className="text-xs font-black text-teal-400 mb-2 flex items-center gap-1.5">
                <Award size={14} /> سجل تفاعل الطلاب ونقاط التميز:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {studentsList.map((st) => (
                  <div
                    key={st.id}
                    className="p-2.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center border border-white/10">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white arabic-font flex items-center gap-1">
                          <span>{st.name}</span>
                          {st.handRaised && <span className="text-amber-400 text-[10px]">✋</span>}
                        </div>
                        <div className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-0.5">
                          <Star size={10} className="fill-amber-400" />
                          <span>{st.score} نقطة</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onScoreChange(st.id, -1)}
                        disabled={st.score <= 0}
                        className="w-6 h-6 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 disabled:opacity-25 flex items-center justify-center"
                      >
                        <Minus size={11} />
                      </button>
                      <button
                        onClick={() => onScoreChange(st.id, 1)}
                        className="w-6 h-6 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center shadow-xs"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
