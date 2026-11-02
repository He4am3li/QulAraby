import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, BookText, ChevronLeft, ChevronRight, Check, Headphones,
  Search, Volume2, Sparkles, Trash2, X, RefreshCcw, Layers
} from 'lucide-react';
import { MasteryLevel, Vocabulary } from '../types';
import './vocabulary-word-gallery.css';

type GalleryFilter = 'all' | 'learning' | 'mastered' | 'due';

interface Props {
  words: Vocabulary[];
  lang: 'ar' | 'en';
  onSpeak: (text: string, lang: 'ar' | 'en') => void;
  onAnalyze: (word: Vocabulary) => void;
  onPractice: (word: Vocabulary) => void;
  onDelete: (id: string) => Promise<void>;
}

const getReviewTime = (value: unknown): number | null => {
  if (!value) return null;
  const date = typeof value === 'object' && value !== null && 'toDate' in value
    ? (value as { toDate: () => Date }).toDate()
    : new Date(value as string);
  const time = date.getTime();
  return Number.isFinite(time) ? time : null;
};

const isDue = (word: Vocabulary): boolean => {
  const when = getReviewTime(word.next_review);
  return when !== null && when <= Date.now();
};

const isMastered = (level: MasteryLevel): boolean =>
  level === MasteryLevel.FLUENT || level === MasteryLevel.MASTERED;

const getStatus = (word: Vocabulary, lang: 'ar' | 'en') => {
  if (word.mastery_level === MasteryLevel.MASTERED) return lang === 'ar' ? 'متقنة' : 'Mastered';
  if (word.mastery_level === MasteryLevel.FLUENT) return lang === 'ar' ? 'متمكن' : 'Fluent';
  if (word.mastery_level === MasteryLevel.NEW) return lang === 'ar' ? 'جديدة' : 'New';
  return lang === 'ar' ? 'قيد التعلم' : 'Learning';
};

export const VocabularyWordGallery: React.FC<Props> = ({
  words, lang, onSpeak, onAnalyze, onPractice, onDelete
}) => {
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<GalleryFilter>('all');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [showMobileDetail, setShowMobileDetail] = React.useState(false);
  const [showExampleTranslation, setShowExampleTranslation] = React.useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filtered = words.filter(word => {
    const matchesSearch = !normalizedSearch ||
      (word.original_word || '').toLocaleLowerCase().includes(normalizedSearch) ||
      (word.translation || '').toLocaleLowerCase().includes(normalizedSearch);
    const matchesStatus = filter === 'all' ||
      (filter === 'learning' && !isMastered(word.mastery_level)) ||
      (filter === 'mastered' && isMastered(word.mastery_level)) ||
      (filter === 'due' && isDue(word));
    return matchesSearch && matchesStatus;
  });

  const selected = filtered.find(word => word.id === selectedId) || filtered[0] || null;
  const selectedExample = selected?.analysis?.details_ar?.example || '';
  const selectedTranslation = selected?.analysis?.details_en?.example || '';
  const totalMastered = words.filter(word => isMastered(word.mastery_level)).length;
  const reviewCount = words.filter(isDue).length;

  React.useEffect(() => {
    setShowExampleTranslation(false);
    setConfirmDeleteId(null);
  }, [selected?.id]);

  const chooseWord = (word: Vocabulary) => {
    setSelectedId(word.id);
    setShowMobileDetail(true);
  };

  const deleteSelected = async () => {
    if (!selected?.id || deleting) return;
    if (confirmDeleteId !== selected.id) {
      setConfirmDeleteId(selected.id);
      return;
    }
    setDeleting(true);
    try {
      await onDelete(selected.id);
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const tabs: { key: GalleryFilter; ar: string; en: string }[] = [
    { key: 'all', ar: 'الكل', en: 'All' },
    { key: 'learning', ar: 'قيد التعلم', en: 'Learning' },
    { key: 'mastered', ar: 'متقنة', en: 'Mastered' },
    { key: 'due', ar: 'للمراجعة', en: 'To review' }
  ];

  return (
    <section
      data-testid="vocabulary-word-gallery"
      className="qul-word-gallery w-full h-full min-h-0 flex flex-col rounded-[28px] overflow-hidden"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      aria-label={lang === 'ar' ? 'معرض الكلمات' : 'Word Gallery'}
    >
      <header className="qul-word-gallery-header shrink-0 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen size={19} className="text-slate-600 shrink-0" />
            <h1 className="text-lg sm:text-xl font-black text-slate-800 arabic-font truncate">
              {lang === 'ar' ? 'معرض الكلمات' : 'Word Gallery'}
            </h1>
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 arabic-font">
            {lang === 'ar' ? 'مكتبتك الخاصة، كلمة تستحق أن تتذكرها' : 'Your personal collection of words'}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 sm:gap-3 text-center">
          <div className="qul-word-gallery-count px-3 py-1.5 rounded-xl">
            <div className="text-base font-black tabular-nums leading-none text-slate-800">{words.length}</div>
            <span className="text-[9px] font-medium text-slate-500">{lang === 'ar' ? 'كلمة' : 'Words'}</span>
          </div>
          <div className="qul-word-gallery-count px-3 py-1.5 rounded-xl">
            <div className="text-base font-black tabular-nums leading-none text-emerald-700">{totalMastered}</div>
            <span className="text-[9px] font-medium text-slate-500">{lang === 'ar' ? 'متقنة' : 'Fluent'}</span>
          </div>
          {reviewCount > 0 && (
            <div className="qul-word-gallery-count px-3 py-1.5 rounded-xl">
              <div className="text-base font-black tabular-nums leading-none text-amber-700">{reviewCount}</div>
              <span className="text-[9px] font-medium text-slate-500">{lang === 'ar' ? 'للمراجعة' : 'Due'}</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 flex gap-3 sm:gap-4 p-3 sm:p-4">
        <div className={[
          'qul-word-gallery-shelf flex-col min-w-0 min-h-0 overflow-hidden w-full md:w-[39%] md:min-w-[205px] md:flex',
          showMobileDetail ? 'hidden' : 'flex'
        ].join(' ')}>
          <div className="shrink-0 p-3 sm:p-4 border-b border-slate-200/70 space-y-3">
            <label className="relative block">
              <Search size={17} className={[
                'absolute top-1/2 -translate-y-1/2 text-slate-400',
                lang === 'ar' ? 'right-3' : 'left-3'
              ].join(' ')} />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder={lang === 'ar' ? 'ابحث عن كلمة...' : 'Search words...'}
                className={[
                  'w-full h-10 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-800 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 arabic-font',
                  lang === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'
                ].join(' ')}
                aria-label={lang === 'ar' ? 'البحث في الكلمات' : 'Search saved words'}
              />
            </label>
            <div className="flex gap-1.5 flex-wrap" role="group" aria-label={lang === 'ar' ? 'تصفية الكلمات' : 'Filter words'}>
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => { setFilter(tab.key); setShowMobileDetail(false); }}
                  aria-pressed={filter === tab.key}
                  className={[
                    'rounded-full px-2.5 py-1.5 text-[10px] font-bold arabic-font transition-colors',
                    filter === tab.key
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-white/80 text-slate-600 border border-white hover:bg-white'
                  ].join(' ')}
                >
                  {lang === 'ar' ? tab.ar : tab.en}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scroll p-2.5 sm:p-3 space-y-2" data-testid="word-gallery-list">
            {filtered.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-5 text-center gap-3 text-slate-400">
                <BookOpen size={32} strokeWidth={1.5} />
                <p className="text-xs arabic-font">
                  {words.length === 0
                    ? (lang === 'ar' ? 'كلماتك المحفوظة ستظهر هنا بعد رحلة الكلمات.' : 'Words saved in Word Journey will appear here.')
                    : (lang === 'ar' ? 'لا توجد كلمات مطابقة.' : 'No matching words.')}
                </p>
              </div>
            ) : filtered.map(word => (
              <button
                type="button"
                key={word.id}
                onClick={() => chooseWord(word)}
                aria-pressed={selected?.id === word.id}
                className={[
                  'qul-word-gallery-item w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-start transition-all',
                  selected?.id === word.id ? 'qul-word-gallery-item-active' : ''
                ].join(' ')}
              >
                <div className="qul-word-gallery-tile h-10 w-10 rounded-xl shrink-0 flex items-center justify-center text-lg text-slate-600">
                  {word.emoji && !word.emoji.startsWith('/')
                    ? <span>{word.emoji}</span> : <BookText size={18} strokeWidth={1.7}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-black arabic-font text-slate-800 truncate" dir="rtl">{word.original_word}</div>
                  <div className="text-[10px] text-slate-500 truncate" dir="ltr">{word.translation}</div>
                </div>
                <span className={[
                  'h-2 w-2 rounded-full shrink-0',
                  isMastered(word.mastery_level) ? 'bg-emerald-500'
                    : isDue(word) ? 'bg-amber-400' : 'bg-sky-400'
                ].join(' ')} aria-hidden="true"/>
              </button>
            ))}
          </div>
        </div>

        <div className={[
          'qul-word-gallery-stage flex-1 min-w-0 min-h-0 overflow-hidden flex-col relative',
          showMobileDetail ? 'flex' : 'hidden md:flex'
        ].join(' ')}>
          <div className="qul-word-gallery-stage-top relative z-10 flex items-center justify-between gap-2 px-4 sm:px-6 pt-3 sm:pt-4">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setShowMobileDetail(false)}
                className="md:hidden rounded-lg p-1.5 bg-white/70 text-slate-600"
                aria-label={lang === 'ar' ? 'عودة إلى قائمة الكلمات' : 'Back to word list'}
              >
                {lang === 'ar' ? <ChevronRight size={19}/> : <ChevronLeft size={19}/>}
              </button>
              <span className="text-[10px] font-bold text-slate-500 arabic-font">
                {lang === 'ar' ? 'الكلمة المختارة' : 'Selected word'}
              </span>
            </div>
            {selected && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-100 px-3 py-1 rounded-full arabic-font">
              {getStatus(selected, lang)}
            </span>}
          </div>

          {selected ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
                className="flex-1 min-h-0 flex flex-col items-center justify-between text-center px-4 sm:px-6 pb-3 sm:pb-5 pt-2"
              >
                <div className="flex-1 min-h-0 w-full flex flex-col justify-center items-center gap-2">
                  <div className="qul-word-gallery-orb shrink-0 flex items-center justify-center" aria-hidden="true">
                    {selected.image_data
                      ? <img src={selected.image_data} alt="" className="w-[66%] h-[66%] object-contain relative z-10" referrerPolicy="no-referrer" />
                      : selected.emoji && !selected.emoji.startsWith('/')
                        ? <span className="relative z-10 text-4xl sm:text-5xl">{selected.emoji}</span>
                        : <BookOpen size={40} strokeWidth={1.2} className="relative z-10 text-slate-500" />}
                  </div>
                  <h2 className="arabic-font font-black text-slate-900 text-2xl sm:text-3xl leading-normal max-w-full break-words" dir="rtl">
                    {selected.original_word}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 font-semibold" dir="ltr">{selected.translation}</p>
                  <button
                    type="button"
                    onClick={() => onSpeak(selected.original_word, 'ar')}
                    className="qul-word-gallery-speak w-10 h-10 rounded-full flex items-center justify-center text-emerald-700"
                    aria-label={lang === 'ar' ? 'استمع لنطق الكلمة' : 'Hear pronunciation'}
                  >
                    <Volume2 size={19}/>
                  </button>
                </div>

                <div className="w-full space-y-2.5 shrink-0">
                  {selectedExample && (
                    <button
                      type="button"
                      onClick={() => selectedTranslation && setShowExampleTranslation(current => !current)}
                      className="qul-word-gallery-example w-full px-3 py-3 rounded-2xl text-center"
                      title={selectedTranslation ? (lang === 'ar' ? 'اضغط لعرض الترجمة' : 'Tap to show translation') : undefined}
                    >
                      <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                        {lang === 'ar' ? 'في جملة' : 'In a sentence'}
                      </span>
                      <span className="text-sm font-bold arabic-font text-slate-800 block leading-relaxed" dir={showExampleTranslation && selectedTranslation ? 'ltr' : 'rtl'}>
                        {showExampleTranslation && selectedTranslation ? selectedTranslation : selectedExample}
                      </span>
                    </button>
                  )}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button type="button" onClick={() => onPractice(selected)}
                      className="qul-word-gallery-action px-3 sm:px-4 py-2.5 rounded-xl inline-flex items-center gap-2 text-xs font-bold text-slate-800">
                      <RefreshCcw size={15}/>
                      {lang === 'ar' ? 'تدرب' : 'Practice'}
                    </button>
                    <button type="button" onClick={() => onAnalyze(selected)}
                      className="qul-word-gallery-action px-3 sm:px-4 py-2.5 rounded-xl inline-flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Sparkles size={15}/>
                      {lang === 'ar' ? 'حلّل' : 'Analyze'}
                    </button>
                    <button type="button" onClick={deleteSelected} disabled={deleting}
                      className={[
                        'qul-word-gallery-action px-3 sm:px-4 py-2.5 rounded-xl inline-flex items-center gap-2 text-xs font-bold disabled:opacity-50',
                        confirmDeleteId === selected.id ? 'text-red-600 border-red-200' : 'text-slate-500'
                      ].join(' ')}>
                      {confirmDeleteId === selected.id ? <Check size={15}/> : <Trash2 size={15}/>}
                      {confirmDeleteId === selected.id
                        ? (lang === 'ar' ? 'تأكيد الحذف' : 'Confirm delete')
                        : (lang === 'ar' ? 'حذف' : 'Delete')}
                    </button>
                    {confirmDeleteId === selected.id && (
                      <button type="button" onClick={() => setConfirmDeleteId(null)}
                        className="text-slate-500 p-2" aria-label={lang === 'ar' ? 'إلغاء الحذف' : 'Cancel delete'}>
                        <X size={16}/>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
              <div className="qul-word-gallery-orb flex items-center justify-center" aria-hidden="true">
                <Layers size={36} className="text-slate-400"/>
              </div>
              <p className="text-sm text-slate-500 arabic-font">
                {words.length === 0
                  ? (lang === 'ar' ? 'ابدأ من رحلة الكلمات، وستظهر مجموعتك هنا.' : 'Start in Word Journey to build your collection.')
                  : (lang === 'ar' ? 'اختر كلمة من المعرض لعرضها.' : 'Choose a word to view it.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
