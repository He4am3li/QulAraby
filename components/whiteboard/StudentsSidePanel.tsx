import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Star, Hand, Plus, Minus, 
  ChevronLeft, Sparkles
} from 'lucide-react';
import { WhiteboardStudent } from '../../types/whiteboard';

interface StudentsSidePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  students: Record<string, WhiteboardStudent>;
  isTeacher: boolean;
  onScoreChange: (studentId: string, delta: number) => void;
  onSelectStudent: (studentId: string) => void;
  selectedStudentId?: string | null;
  onClearHands?: () => void;
}

export const StudentsSidePanel: React.FC<StudentsSidePanelProps> = ({
  isOpen,
  onToggle,
  students,
  isTeacher,
  onScoreChange,
  onSelectStudent,
  selectedStudentId,
  onClearHands
}) => {
  const studentList = Object.values(students);
  const raisedHandsCount = studentList.filter(s => s.handRaised).length;

  return (
    <div className="absolute top-3 left-3 z-30 select-none" dir="rtl">
      {/* Main Panel Content */}
      <motion.div
        animate={{ width: isOpen ? (window.innerWidth < 640 ? 280 : 310) : 52 }}
        className="bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[calc(100vh-170px)] ring-1 ring-white/10 transition-all"
      >
        {/* Header */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onToggle}
              className="w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black flex items-center justify-center shadow-md hover:from-emerald-400 hover:to-teal-400 transition shrink-0"
              title={isOpen ? 'طي قائمة الطلاب' : 'إظهار قائمة الطلاب'}
            >
              <Users size={16} />
            </button>
            {isOpen && (
              <div className="truncate">
                <h3 className="font-black text-xs arabic-font text-emerald-400 flex items-center gap-1.5 truncate">
                  الطلاب المشاركون
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                    {studentList.length}
                  </span>
                </h3>
              </div>
            )}
          </div>

          {isOpen && (
            <div className="flex items-center gap-1.5">
              {isTeacher && raisedHandsCount > 0 && (
                <button
                  onClick={onClearHands}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-[11px] font-bold flex items-center gap-1 transition shadow-sm animate-pulse"
                  title="تنزيل جميع الأيدي"
                >
                  <Hand size={12} />
                  <span>{raisedHandsCount}</span>
                </button>
              )}
              <button
                onClick={onToggle}
                className="w-7 h-7 rounded-xl text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
                title="طي القائمة"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Students List */}
        {isOpen ? (
          <div className="flex-1 overflow-y-auto custom-scroll p-2.5 space-y-2">
            {studentList.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-xs font-medium arabic-font">
                في انتظار انضمام الطلاب للحصة...
              </div>
            ) : (
              studentList.map((student) => {
                const isSelected = selectedStudentId === student.id;
                return (
                  <div
                    key={student.id}
                    className={`p-2.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400/40 shadow-md'
                        : 'bg-black/40 border-white/10 hover:border-emerald-500/40 hover:bg-black/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        onClick={() => onSelectStudent(student.id)}
                        className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                      >
                        {/* Avatar & Online status dot */}
                        <div className="relative shrink-0">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-sm">
                            {student.name.charAt(0)}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                              student.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                            }`}
                          />
                        </div>

                        {/* Name & Hand Raised badge */}
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white truncate arabic-font">{student.name}</span>
                            {student.handRaised && (
                              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded text-[9px] flex items-center gap-0.5 animate-pulse">
                                <Hand size={9} /> رفع يده
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono font-bold mt-0.5">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            <span>{student.score} نقطة</span>
                          </div>
                        </div>
                      </div>

                      {/* Teacher Score Actions (+ / -) */}
                      {isTeacher && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onScoreChange(student.id, -1)}
                            disabled={student.score <= 0}
                            className="w-6 h-6 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 disabled:opacity-30 border border-rose-500/30 flex items-center justify-center transition"
                            title="خصم نقطة"
                          >
                            <Minus size={12} />
                          </button>
                          <button
                            onClick={() => onScoreChange(student.id, 1)}
                            className="w-6 h-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-md flex items-center justify-center transition"
                            title="إضافة نقطة تشجيعية"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="p-2.5 flex flex-col items-center gap-2 text-white/50">
            <span className="text-[10px] font-bold font-mono text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-1.5 py-0.5">
              {studentList.length}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
