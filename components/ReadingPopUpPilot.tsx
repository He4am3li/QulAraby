import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * First reading pop-up pilot. Uses the actual reading text, not invented story facts.
 * Lightweight CSS 3D paper craft, suitable for mobile and reduced-motion settings.
 * Kept independent of the existing book and speech/assessment state.
 */
export function ReadingPopUpPilot({ text, lang = 'ar' }: { text: string; lang?: 'ar' | 'en' }) {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [reveal, setReveal] = React.useState(false);
  const words = React.useMemo(() =>
    Array.from(new Set((text.match(/[\u0621-\u064A]+(?:[\u064B-\u065F]*)/g) || [])
      .filter(word => word.length >= 3))).slice(0, 4), [text]);
  if (words.length < 2) return null;
  const isArabic = lang === 'ar';
  return (
    <section dir={isArabic ? 'rtl' : 'ltr'} aria-label={isArabic ? 'مشهد القراءة التفاعلي' : 'Interactive reading scene'}
      className="w-full max-w-3xl mx-auto rounded-2xl border border-amber-200/70 bg-[#f5f0e6] p-3 sm:p-5 text-stone-800 shadow-inner">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-sm">{isArabic ? 'اكتشف كلمات النص' : 'Explore words from the text'}</h3>
          <p className="text-xs opacity-70">{isArabic ? 'نموذج تجريبي لمشهد ورقي تفاعلي' : 'Interactive paper scene pilot'}</p>
        </div>
        <button type="button" aria-expanded={open} onClick={() => setOpen(v => !v)}
          className="rounded-full bg-amber-800 text-white px-4 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">
          {open ? (isArabic ? 'أغلق المشهد' : 'Close scene') : (isArabic ? 'افتح المشهد' : 'Open scene')}
        </button>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-amber-300 bg-[#fffaf0] min-h-40 p-4"
        style={{ perspective: '700px' }}>
        <div className="absolute top-0 bottom-0 left-1/2 w-2 -translate-x-1/2 bg-gradient-to-r from-amber-900/10 via-amber-900/30 to-amber-900/10" aria-hidden="true" />
        <div className="grid grid-cols-2 gap-5 min-h-32 items-center">
          <div className="text-center text-xs leading-relaxed">
            <p className="font-bold mb-2">{isArabic ? 'توقّع ثم اكتشف' : 'Predict, then discover'}</p>
            <p>{isArabic ? 'أي كلمة من النص تريد استكشافها؟' : 'Which word would you like to explore?'}</p>
            <button type="button" onClick={() => setReveal(v => !v)}
              className="mt-3 border border-dashed border-amber-700 rounded-lg p-2 bg-amber-100 focus-visible:outline-2"
              aria-expanded={reveal}>
              {reveal ? (isArabic ? 'اختر كلمة من المجسمات لتجدها في النص.' : 'Choose a word in the scene and find it in the text.')
                : (isArabic ? 'ارفع الورقة للتلميح' : 'Lift flap for a hint')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-center" aria-label={isArabic ? 'كلمات تفاعلية' : 'Interactive words'}>
            {words.map((word, index) => (
              <motion.button key={word} type="button" onClick={() => setSelected(index)}
                aria-pressed={selected === index}
                initial={false}
                animate={{ rotateX: open ? 0 : -85, opacity: open ? 1 : 0.4, y: open ? 0 : 12 }}
                transition={{ duration: reducedMotion ? 0 : 0.45, delay: reducedMotion ? 0 : index * 0.07 }}
                style={{ transformOrigin: 'bottom', transformStyle: 'preserve-3d' }}
                disabled={!open}
                className={`rounded-md border-b-4 border-amber-700 px-3 py-4 text-sm font-bold shadow-md focus-visible:outline-2 ${selected === index ? 'bg-sky-100 border-sky-700' : 'bg-white border-amber-700'}`}>
                {word}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-center" aria-live="polite">
        {selected !== null && open
          ? (isArabic ? `اخترت: ${words[selected]}. ابحث عنها في النص واقرأ الجملة.` : `Selected: ${words[selected]}. Find it in the passage and read the sentence.`)
          : (isArabic ? 'اضغط «افتح المشهد» ثم اختر كلمة.' : 'Open the scene, then select a word.')}
      </p>
    </section>
  );
}
