import React from 'react';
import { Delete, Space, CornerDownLeft, Eye, EyeOff } from 'lucide-react';

interface ArabicFullKeyboardProps {
  onInsertChar: (char: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onClear?: () => void;
  onSubmit?: () => void;
  lang?: 'ar' | 'en';
}

export const ArabicFullKeyboard: React.FC<ArabicFullKeyboardProps> = ({
  onInsertChar,
  onBackspace,
  onSpace,
  onClear,
  onSubmit,
  lang = 'ar'
}) => {
  const [showTashkeelRow, setShowTashkeelRow] = React.useState<boolean>(false);

  // Standard Arabic keyboard rows layout
  const row1 = ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د', 'ذ'];
  const row2 = ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'];
  const row3 = ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'];
  const rowSpecial = ['أ', 'إ', 'آ', '؟', '!', '،', '.'];

  // Tashkeel / Harakat (optional row for learners who want vowels)
  const tashkeel = ['َ', 'ُ', 'ِ', 'ً', 'ٌ', 'ٍ', 'ْ', 'ّ'];

  return (
    <div className="w-full bg-slate-100/95 border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-inner space-y-1.5 select-none" dir="rtl">
      
      {/* Keyboard Top Mini Bar */}
      <div className="flex items-center justify-between px-1 pb-1 text-[11px] font-bold text-slate-500 border-b border-slate-200/70">
        <span className="flex items-center gap-1">
          <span>{lang === 'ar' ? 'لوحة المفاتيح العربية المتكاملة' : 'Arabic Virtual Keyboard'}</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTashkeelRow(!showTashkeelRow)}
            className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-[10px] font-semibold transition-colors"
          >
            {showTashkeelRow ? <EyeOff size={11} /> : <Eye size={11} />}
            <span>{showTashkeelRow ? (lang === 'ar' ? 'إخفاء التشكيل' : 'Hide Vowels') : (lang === 'ar' ? 'إظهار التشكيل' : 'Show Vowels')}</span>
          </button>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors"
            >
              {lang === 'ar' ? 'مسح الكل' : 'Clear all'}
            </button>
          )}
        </div>
      </div>

      {/* Optional Tashkeel Row */}
      {showTashkeelRow && (
        <div className="flex items-center justify-center gap-1 p-1 bg-purple-50/70 border border-purple-200/60 rounded-xl animate-in fade-in duration-200">
          <span className="text-[10px] text-purple-700 font-bold px-1">{lang === 'ar' ? 'حركات:' : 'Vowels:'}</span>
          {tashkeel.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onInsertChar(t)}
              className="w-8 h-7 bg-white hover:bg-purple-600 hover:text-white text-purple-900 border border-purple-200 rounded-lg text-base font-bold shadow-2xs transition-all active:scale-90 flex items-center justify-center arabic-font"
            >
              ـ{t}
            </button>
          ))}
        </div>
      )}

      {/* Row 1 */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5">
        {row1.map((char) => (
          <button
            key={char}
            type="button"
            onClick={() => onInsertChar(char)}
            className="flex-1 max-w-[42px] h-9 sm:h-10 bg-white hover:bg-slate-50 active:bg-slate-200 text-slate-900 border border-slate-200/90 rounded-lg text-base sm:text-lg font-bold shadow-2xs hover:shadow-xs transition-all active:scale-95 flex items-center justify-center arabic-font"
          >
            {char}
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 px-2">
        {row2.map((char) => (
          <button
            key={char}
            type="button"
            onClick={() => onInsertChar(char)}
            className="flex-1 max-w-[44px] h-9 sm:h-10 bg-white hover:bg-slate-50 active:bg-slate-200 text-slate-900 border border-slate-200/90 rounded-lg text-base sm:text-lg font-bold shadow-2xs hover:shadow-xs transition-all active:scale-95 flex items-center justify-center arabic-font"
          >
            {char}
          </button>
        ))}
      </div>

      {/* Row 3 */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5">
        {row3.map((char) => (
          <button
            key={char}
            type="button"
            onClick={() => onInsertChar(char)}
            className="flex-1 max-w-[42px] h-9 sm:h-10 bg-white hover:bg-slate-50 active:bg-slate-200 text-slate-900 border border-slate-200/90 rounded-lg text-base sm:text-lg font-bold shadow-2xs hover:shadow-xs transition-all active:scale-95 flex items-center justify-center arabic-font"
          >
            {char}
          </button>
        ))}
        {/* Backspace Button on Row 3 End */}
        <button
          type="button"
          onClick={onBackspace}
          className="flex-1 max-w-[54px] h-9 sm:h-10 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold shadow-2xs transition-all active:scale-95 flex items-center justify-center"
          title="حذف"
        >
          <Delete size={17} />
        </button>
      </div>

      {/* Row 4: Special Alef Forms & Punctuation + Space Bar + Submit */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 pt-0.5">
        {rowSpecial.map((char) => (
          <button
            key={char}
            type="button"
            onClick={() => onInsertChar(char)}
            className="w-7 sm:w-8 h-8 sm:h-9 bg-slate-50 hover:bg-white text-slate-700 border border-slate-200/80 rounded-lg text-xs sm:text-sm font-bold shadow-2xs transition-all active:scale-95 flex items-center justify-center arabic-font"
          >
            {char}
          </button>
        ))}

        {/* Space Bar */}
        <button
          type="button"
          onClick={onSpace}
          className="flex-1 h-8 sm:h-9 bg-white hover:bg-slate-50 active:bg-slate-200 text-slate-700 border border-slate-200/90 rounded-lg text-xs font-bold shadow-2xs hover:shadow-xs transition-all active:scale-98 flex items-center justify-center gap-1.5 px-3"
        >
          <Space size={14} className="text-slate-400" />
          <span className="text-[11px] font-sans">{lang === 'ar' ? 'مسافة' : 'Space'}</span>
        </button>

        {onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            className="h-8 sm:h-9 px-3 bg-slate-900 hover:bg-slate-800 active:bg-black text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1"
          >
            <CornerDownLeft size={13} />
            <span>{lang === 'ar' ? 'تقييم' : 'Send'}</span>
          </button>
        )}
      </div>

    </div>
  );
};
