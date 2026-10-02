import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  FileText, 
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  Award,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { WhiteboardElement } from '../../types/whiteboard';

interface SpellingRuleCardProps {
  element: WhiteboardElement;
  isSelected?: boolean;
  isReadOnly?: boolean;
  onUpdate: (data: Partial<WhiteboardElement>) => void;
  onDelete?: () => void;
}

// Hand-drawn sketch doodles in teacher pen style (خربشات القلم باليد)
const HandDrawnUnderline: React.FC<{ className?: string; color?: string }> = ({ 
  className = "w-full h-2.5", 
  color = "#dc2626" 
}) => (
  <svg viewBox="0 0 300 12" preserveAspectRatio="none" className={className} fill="none">
    <path 
      d="M2 5 Q 75 10, 150 4 T 298 6" 
      stroke={color} 
      strokeWidth="2.2" 
      strokeLinecap="round" 
    />
    <path 
      d="M10 9 Q 80 12, 160 8 T 290 10" 
      stroke={color} 
      strokeWidth="1.2" 
      strokeLinecap="round" 
      opacity="0.8" 
    />
  </svg>
);

const TeacherHandwrittenStickman: React.FC<{ className?: string }> = ({ className = "w-9 h-14" }) => (
  <svg viewBox="0 0 80 120" className={className} fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Head */}
    <circle cx="40" cy="22" r="14" stroke="#dc2626" />
    <circle cx="35" cy="20" r="1.5" fill="#dc2626" />
    <circle cx="45" cy="20" r="1.5" fill="#dc2626" />
    <path d="M35 28 Q40 32 45 28" stroke="#dc2626" />
    {/* Body */}
    <line x1="40" y1="36" x2="40" y2="76" />
    {/* Arms pointing to ruled line */}
    <path d="M40 48 L14 36 L4 32" stroke="#dc2626" />
    <path d="M40 48 L62 62" />
    {/* Legs on the notebook line */}
    <path d="M40 76 L24 112" />
    <path d="M40 76 L56 112" />
  </svg>
);

export const SpellingRuleCard: React.FC<SpellingRuleCardProps> = ({
  element,
  isSelected,
  isReadOnly,
  onUpdate
}) => {
  const ruleData = element.spellingRuleData;
  const [showDictationOverlay, setShowDictationOverlay] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTeacherPeeking, setIsTeacherPeeking] = useState(false);

  if (!ruleData) return null;

  const isCoveredForDictation = Boolean(ruleData.isDictationMode);

  const toggleDictationMode = () => {
    onUpdate({
      spellingRuleData: {
        ...ruleData,
        isDictationMode: !isCoveredForDictation
      }
    });
  };

  // Calibrated Arabic TTS for clear pronunciation
  const handleReadAloud = (textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.86;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const topicNum = ruleData.topicNumber || 1;

  return (
    <div 
      className={`relative w-full select-none bg-transparent transition-all duration-150 ${
        isSelected ? 'ring-2 ring-blue-400/40 rounded-xl p-0.5' : 'p-0'
      }`}
      style={{
        fontFamily: "'Al-Wissam', 'AlWissam', 'Al-Wissam Script', 'Tajawal', serif",
        direction: 'rtl'
      }}
      dir="rtl"
    >
      {/* 🎛️ Floating Discreet Teacher Actions */}
      <div className="absolute -top-7 right-1 flex items-center gap-1.5 opacity-85 hover:opacity-100 transition-opacity z-30 no-drag">
        {/* Toggle Dictation Mode (إخفاء / إظهار القاعدة للتملية) */}
        {!isReadOnly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleDictationMode();
            }}
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-black flex items-center gap-1 shadow-xs transition ${
              isCoveredForDictation 
                ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 ring-1 ring-amber-600/30' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            title={isCoveredForDictation ? "القاعدة مخفية عن الطلاب - انقر لكشفها للتصحيح" : "إخفاء القاعدة عن الطلاب أثناء التملية"}
          >
            {isCoveredForDictation ? <Eye size={12} /> : <EyeOff size={12} />}
            <span>{isCoveredForDictation ? 'كشف القاعدة للتصحيح 👁️' : 'إخفاء للتملية 🙈'}</span>
          </button>
        )}

        {/* Dictation Paragraph Button */}
        {ruleData.dictationParagraph && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDictationOverlay(true);
            }}
            className="px-2.5 py-0.5 rounded-md text-[11px] font-black flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
            title="عرض فقرة الإملاء المجهزة للتملية للطلاب"
          >
            <FileText size={12} />
            <span>فقرة الإملاء</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* 🔒 DICTATION COVER OVERLAY (ستارة إخفاء القاعدة أثناء التملية) */}
      {/* ======================================================== */}
      {isCoveredForDictation && !isTeacherPeeking ? (
        <div 
          className="w-full text-slate-800 select-none pr-12 pl-4"
          style={{
            minHeight: '380px'
          }}
        >
          {/* Top Line 1: Cover Header */}
          <div className="h-[32px] flex items-center justify-center border-b border-amber-300/80">
            <span className="text-amber-800 text-sm font-black flex items-center gap-1.5">
              <Lock size={14} className="text-amber-600" />
              <span>وضع التملية مفعّل — القاعدة مخفية عن الطلاب</span>
            </span>
          </div>

          {/* Line 2: Teacher's Guidance Instruction */}
          <div className="h-[32px] flex items-center justify-center text-xs sm:text-sm font-black text-blue-900 leading-[32px]">
            <span>«استمع لقراءة المعلم واكتب الكلمات والفقرة في الصفحة اليسرى المقابلة»</span>
          </div>

          {/* Main Cover Blinder Container (Takes exactly 6 notebook lines = 192px) */}
          <div className="h-[192px] my-2 bg-gradient-to-b from-amber-50/90 via-amber-100/60 to-amber-50/90 border-2 border-dashed border-amber-400/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
            <div className="text-3xl mb-1 select-none animate-bounce">✍️</div>
            <h4 className="text-base sm:text-lg font-black text-slate-900 mb-1">
              دفتر الإملاء المدرسي في انتظار كتابتك
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 font-bold max-w-md leading-relaxed">
              القاعدة والكلمات النموذجية محجوبة مؤقتاً لاختبار إتقانك الإملائي.
              ركّز في سماع حركات الحروف واكتب بدقة في الصفحة المقابلة!
            </p>

            {/* Quick Actions for Teacher on the Cover */}
            {!isReadOnly && (
              <div className="flex items-center gap-2 mt-3 no-drag">
                <button
                  onClick={toggleDictationMode}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Unlock size={13} />
                  <span>كشف القاعدة للتصحيح الذاتي 👁️</span>
                </button>
                <button
                  onMouseDown={() => setIsTeacherPeeking(true)}
                  onMouseUp={() => setIsTeacherPeeking(false)}
                  onTouchStart={() => setIsTeacherPeeking(true)}
                  onTouchEnd={() => setIsTeacherPeeking(false)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-slate-100 rounded-lg text-xs font-black flex items-center gap-1 shadow-sm active:scale-95 transition"
                  title="اضغط واستمر بالضغط للاطلاع الخاطف على القاعدة للمعلم"
                >
                  <Eye size={13} />
                  <span>نظرة سريعة للمعلم (معاينة)</span>
                </button>
                {ruleData.dictationParagraph && (
                  <button
                    onClick={() => setShowDictationOverlay(true)}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black flex items-center gap-1 shadow-sm active:scale-95 transition"
                  >
                    <FileText size={13} />
                    <span>قراءة فقرة التملية</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Line: Motivational Slogan */}
          <div className="h-[32px] flex items-center justify-between text-xs font-bold text-slate-600 border-t border-dashed border-amber-300/80">
            <span>✨ الخطوة التالية: كشف القاعدة ومطابقة الكلمات المكتوبة ذاتياً</span>
            <span className="text-amber-800 font-black">قُلْ 🌟 Qul Arabic</span>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 📜 HANDWRITTEN MILLIMETER NOTEBOOK RULING CONTENT */
        /* (توزيع القاعدة على سطور الكشكول بالملي بخط الوسام) */
        /* ======================================================== */
        <div 
          className="w-full text-slate-900 select-text pr-12 pl-4"
          style={{
            fontFamily: "'Al-Wissam', 'AlWissam', 'Al-Wissam Script', 'Tajawal', serif"
          }}
        >
          {/* Peeking Banner if teacher is holding preview */}
          {isCoveredForDictation && isTeacherPeeking && (
            <div className="bg-amber-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded text-center mb-1 animate-pulse">
              👀 نظرة خاطفة للمعلم (القاعدة ما زالت مخفية عن شاشات الطلاب)
            </div>
          )}

          {/* 🌟 Line 1: Header Title in Teacher Red Ink (Sitting on Line 1, height 32px) */}
          <div className="h-[32px] flex flex-col justify-center relative select-none m-0 p-0">
            <div className="flex items-center justify-center">
              <span 
                className="text-red-700 text-base sm:text-lg font-black tracking-normal select-text leading-[28px]"
                style={{
                  textShadow: '0.3px 0.3px 0.5px rgba(185, 28, 28, 0.25)',
                  transform: 'rotate(-0.15deg)'
                }}
              >
                درس الإملاء ({topicNum}): {ruleData.title}
              </span>
            </div>
            <div className="w-56 sm:w-72 mx-auto -mt-0.5">
              <HandDrawnUnderline color="#dc2626" className="w-full h-1 mx-auto" />
            </div>
          </div>

          {/* 🌟 Line 2: Golden Rule in Rich Blue Ink (Sitting on Line 2, height 32px) */}
          <div className="h-[32px] flex items-center gap-2 bg-amber-100/50 border-r-4 border-red-600 px-2 rounded-xs m-0">
            <span className="text-red-600 font-black text-xs shrink-0 select-none">★</span>
            <p 
              className="text-blue-950 text-xs sm:text-sm font-black leading-[32px] m-0 truncate"
              style={{ textShadow: '0.2px 0.2px 0.4px rgba(30, 58, 138, 0.2)' }}
            >
              <span className="text-red-700 font-black ml-1">القاعدة الذهبية:</span>
              {ruleData.goldenRule}
            </p>
          </div>

          {/* 🌟 Line 3: Thinking Question / Hook (Sitting on Line 3, height 32px) */}
          {ruleData.questionBubble?.text && (
            <div className="h-[32px] flex items-center gap-1.5 pr-0.5 m-0">
              <span className="text-amber-700 text-xs shrink-0 select-none">💡</span>
              <p className="text-slate-800 text-xs sm:text-sm font-bold leading-[32px] m-0 truncate">
                <span className="text-blue-900 font-black ml-1">سؤال الدرس:</span>
                {ruleData.questionBubble.text}
              </p>
            </div>
          )}

          {/* 🌟 Line 4: Cases & Positions Header (Sitting on Line 4, height 32px) */}
          <div className="h-[32px] flex items-center justify-between border-t border-dashed border-blue-400/40 pr-0.5 m-0">
            <div className="text-red-800 text-xs sm:text-sm font-black flex items-center gap-1.5 leading-[32px]">
              <span>مواضع وحالات الكتابة الإملائية:</span>
            </div>
            <span className="text-[11px] text-slate-500 font-normal">خط الوسام المدرسي</span>
          </div>

          {/* Render Concepts / Bullets (Each sitting exactly on its own 32px notebook line) */}
          {ruleData.conceptBox?.bullets.map((bullet, idx) => (
            <div 
              key={idx} 
              className="h-[32px] flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-950 pr-0.5 m-0 truncate"
            >
              <span className="text-red-600 font-black text-xs shrink-0 select-none">
                {idx === 0 ? '١.' : idx === 1 ? '٢.' : idx === 2 ? '٣.' : '•'}
              </span>
              <span className="select-text leading-[32px] truncate">{bullet}</span>
            </div>
          ))}

          {/* 🌟 Lines: Movement Hierarchy Ladder & Equation (Takes exactly 64px = 2 Notebook Lines) */}
          <div className="h-[64px] bg-blue-50/60 border border-blue-300/60 rounded-lg px-2 flex flex-col justify-around my-0">
            <div className="h-[30px] flex items-center justify-between text-xs font-black text-blue-900 leading-[30px]">
              <span className="flex items-center gap-1">
                <span>🪜</span>
                <span>سلم قوة الحركات:</span>
              </span>
              <span className="text-xs text-red-700 bg-red-100/70 px-2 py-0.5 rounded font-black">
                الكسرة ( ِ ) ➔ الضمة ( ُ ) ➔ الفتحة ( َ ) ➔ السكون ( ْ )
              </span>
            </div>

            <div className="h-[30px] text-xs font-black text-emerald-900 flex items-center gap-1 leading-[30px]">
              <span className="text-emerald-700 font-black">✍️ المعادلة:</span>
              <span className="bg-emerald-100/80 text-emerald-950 px-2 py-0.5 rounded border border-emerald-300/80 font-black">
                {ruleData.conceptBox?.formula?.result || ruleData.goldenRule}
              </span>
            </div>
          </div>

          {/* 🌟 Exemplary Words Header (Sitting on a 32px Notebook Line) */}
          {ruleData.examples && ruleData.examples.length > 0 && (
            <>
              <div className="h-[32px] flex items-center justify-between text-red-800 text-xs sm:text-sm font-black pr-0.5 border-t border-dashed border-blue-300/50 m-0 leading-[32px]">
                <span>كلمات نموذجية:</span>
                <span className="text-[10px] text-slate-400 font-normal">اضغط على الكلمة للاستماع</span>
              </div>

              {/* Exemplary Words (Sitting neatly on a 32px line) */}
              <div className="h-[32px] flex items-center gap-2 overflow-x-auto pr-0.5 py-0 m-0 no-scrollbar">
                {ruleData.examples.map((word, wIdx) => (
                  <button
                    key={wIdx}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReadAloud(word);
                    }}
                    className="px-2.5 py-0.5 bg-white/95 hover:bg-blue-50 text-blue-950 border border-blue-400/80 hover:border-blue-600 rounded-md text-xs sm:text-sm font-black shadow-2xs transition active:scale-95 flex items-center gap-1 shrink-0"
                    title={`استماع لنطق: ${word}`}
                  >
                    <span>{word}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* 🌟 Handwritten Teacher Stamp & Slogan (Sitting on the Bottom Line, height 32px) */}
          <div className="h-[32px] flex items-center justify-between text-xs font-black text-slate-700 border-t border-dashed border-slate-300/80 m-0 px-0.5 leading-[32px]">
            <div className="flex items-center gap-1 text-emerald-800">
              <Sparkles size={12} className="text-amber-500 fill-amber-400" />
              <span>{ruleData.footerConclusion?.slogan || 'اتعلم صح .. افهم صح .. وطبق صح ✨'}</span>
            </div>

            <div className="flex items-center gap-1 text-blue-900">
              <span>قُلْ 🌟 Qul Arabic</span>
              <TeacherHandwrittenStickman className="w-5 h-7 shrink-0 inline-block" />
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 📝 FULLSCREEN DICTATION MODAL FOR TEACHER */}
      {/* (فقرة الإملاء المجهزة للتملية مع تحكم وضع التملية) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showDictationOverlay && ruleData.dictationParagraph && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm no-drag"
            onClick={() => setShowDictationOverlay(false)}
          >
            <div 
              className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border-2 border-emerald-500 text-slate-900 relative"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                    ✍️
                  </div>
                  <div>
                    <h3 className="text-base font-black text-emerald-900">
                      فقرة التملية: {ruleData.dictationParagraph.title}
                    </h3>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      المستوى المستهدف: {ruleData.dictationParagraph.gradeLevel}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowDictationOverlay(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Dictation Mode Sync Banner in Modal */}
              <div className={`p-2.5 rounded-xl mb-3 flex items-center justify-between border ${
                isCoveredForDictation 
                  ? 'bg-amber-50 border-amber-300 text-amber-900' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center gap-2 text-xs font-black">
                  {isCoveredForDictation ? <Lock size={14} className="text-amber-600" /> : <Eye size={14} className="text-slate-500" />}
                  <span>{isCoveredForDictation ? 'القاعدة مخفية عن الطلاب حالياً 🙈' : 'القاعدة ظاهرة للطلاب'}</span>
                </div>
                <button
                  onClick={toggleDictationMode}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                    isCoveredForDictation 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  }`}
                >
                  {isCoveredForDictation ? 'كشف القاعدة للطلاب 👁️' : 'إخفاء القاعدة للتملية 🙈'}
                </button>
              </div>

              {/* Formatted Paragraph with full Tashkeel */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 text-slate-900 text-sm sm:text-base font-bold leading-loose selection:bg-emerald-200 font-serif">
                {ruleData.dictationParagraph.text}
              </div>

              {/* Target Words */}
              <div className="mt-3">
                <div className="text-xs font-black text-slate-700 mb-1.5">
                  الكلمات المستهدفة للتطبيق الإملائي المباشر في الصفحة المقابلة:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ruleData.dictationParagraph.targetWords.map((word, wIdx) => (
                    <span 
                      key={wIdx}
                      className="text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-md"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 mt-4">
                <button
                  onClick={() => handleReadAloud(ruleData.dictationParagraph?.text || '')}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition shadow-md ${
                    isPlayingAudio ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Volume2 size={16} />
                  <span>قراءة الفقرة بصوت واضح للتملية</span>
                </button>

                <button
                  onClick={() => setShowDictationOverlay(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

