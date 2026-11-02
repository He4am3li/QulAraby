import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Lightbulb, X } from 'lucide-react';
import { VOCABULARY_USAGE_TIPS } from '../data/vocabularyUsageTips';
import type { Vocabulary } from '../types';

type Language = 'ar' | 'en';

interface Props {
  topicId: string;
  words: Partial<Vocabulary>[];
  lang: Language;
  open: boolean;
  onClose: () => void;
  focusedWordIndex: number | null;
}

/** Compact, in-page micro-lesson. Does not mutate vocabulary mastery or cards. */
export const VocabularyUsageTips: React.FC<Props> = ({
  topicId, words, lang, open, onClose, focusedWordIndex
}) => {
  const tips = VOCABULARY_USAGE_TIPS[topicId] || [];
  const [tipIndex, setTipIndex] = React.useState(0);
  const [exampleIndex, setExampleIndex] = React.useState(0);
  const [choiceIndex, setChoiceIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    const foundTip = focusedWordIndex === null
      ? 0
      : tips.findIndex(t => t.examples.some(e => e.wordIndex === focusedWordIndex));
    const nextTip = Math.max(0, foundTip);
    setTipIndex(nextTip);
    const example = tips[nextTip]?.examples.findIndex(e => e.wordIndex === focusedWordIndex) ?? -1;
    setExampleIndex(Math.max(0, example));
    setChoiceIndex(null);
  }, [topicId, focusedWordIndex]);

  const chooseTip = (index: number) => {
    setTipIndex(index);
    setExampleIndex(0);
    setChoiceIndex(null);
  };

  const tip = tips[Math.min(tipIndex, tips.length - 1)];
  if (!tip) return null;
  const correct = choiceIndex === tip.practice.correctIndex;

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          key={topicId}
          role="dialog"
          aria-label={lang === 'ar' ? 'تلميحات استخدام المفردات' : 'Vocabulary usage tips'}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          className={`absolute top-[70px] ${lang === 'ar' ? 'left-3 md:left-6' : 'right-3 md:right-6'} z-[120] w-[calc(100%-1.5rem)] sm:w-[400px] max-h-[calc(100%-5rem)] overflow-y-auto custom-scroll rounded-2xl border border-amber-200 bg-white p-4 shadow-2xl ${lang === 'ar' ? 'text-right arabic-font' : 'text-left font-sans'}`}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-600"><Lightbulb size={16}/></span>
              <h3 className="font-black text-slate-800 text-sm">
                {lang === 'ar' ? 'تلميحات الاستخدام' : 'Usage Tips'}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={lang === 'ar' ? 'إغلاق التلميحات' : 'Close usage tips'}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            ><X size={18}/></button>
          </div>

          {tips.length > 1 && (
            <div className="flex gap-1.5 mb-2.5 flex-wrap" role="tablist"
              aria-label={lang === 'ar' ? 'اختر التلميح' : 'Choose a tip'}>
              {tips.map((item, index) => (
                <button key={index} type="button" role="tab"
                  aria-selected={index === tipIndex}
                  onClick={() => chooseTip(index)}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-colors ${index === tipIndex
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'}`}
                >{item.title[lang]}</button>
              ))}
            </div>
          )}

          <p className="font-black text-slate-800 text-xs mb-1">{tip.title[lang]}</p>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">{tip.instruction[lang]}</p>
          <p className="text-[10px] font-bold text-slate-500 mb-1.5">
            {lang === 'ar' ? 'طبّق على كلمات الموضوع' : 'Apply it to these topic words'}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tip.examples.map((example, index) => (
              <button
                key={example.wordIndex}
                type="button"
                onClick={() => setExampleIndex(index)}
                aria-pressed={exampleIndex === index}
                className={`rounded-lg px-2 py-1 text-xs arabic-font font-bold border ${exampleIndex === index
                  ? 'bg-amber-100 border-amber-400 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50'}`}
              >{words[example.wordIndex]?.original_word || ''}</button>
            ))}
          </div>
          <div dir="rtl"
            className="text-center bg-amber-50 rounded-lg border border-amber-100 px-3 py-2 mb-3 arabic-font font-bold text-sm text-amber-950">
            {tip.examples[exampleIndex]?.usage}
          </div>

          <div className="border-t border-slate-100 pt-2">
            <p className="text-[11px] font-black text-slate-800 mb-1">
              {lang === 'ar' ? 'جرّب بنفسك' : 'Try it yourself'}
            </p>
            <p className="text-[11px] text-slate-700 mb-2">{tip.practice.question[lang]}</p>
            <div className="grid grid-cols-3 gap-1.5" dir="rtl">
              {tip.practice.options.map((option, index) => (
                <button key={index} type="button"
                  onClick={() => setChoiceIndex(index)}
                  aria-pressed={choiceIndex === index}
                  className={`px-1.5 py-2 rounded-lg border text-xs arabic-font font-bold leading-relaxed ${choiceIndex === index
                    ? (index === tip.practice.correctIndex
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-rose-50 border-rose-400 text-rose-700')
                    : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400'}`}
                >{option}</button>
              ))}
            </div>
            {choiceIndex !== null && (
              <p role="status"
                className={`flex items-center gap-1 text-[11px] font-bold mt-2 ${correct ? 'text-emerald-700' : 'text-rose-600'}`}>
                {correct && <CheckCircle2 size={14}/>}
                {correct
                  ? (lang === 'ar' ? 'أحسنت! إجابة صحيحة.' : 'Well done! Correct.')
                  : (lang === 'ar' ? 'حاول مرة أخرى.' : 'Try again.')}
              </p>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};
