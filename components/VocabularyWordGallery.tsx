import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen, BookText, ChevronLeft, ChevronRight, Check, Search, Volume2,
  Trash2, X, RefreshCcw, Layers, ListChecks, ArrowLeft, RotateCcw
} from 'lucide-react';
import { MasteryLevel, Vocabulary } from '../types';
import { getWordDeepAnalysis } from '../services/gemini';
import './vocabulary-word-gallery.css';

type GalleryFilter = 'all' | 'learning' | 'mastered' | 'due';
type StageMode = 'word' | 'practice' | 'analysis';
type PracticeGame = 'scramble' | 'meaning';
type Letter = { id: number; char: string };

interface Props {
  words: Vocabulary[];
  lang: 'ar' | 'en';
  onSpeak: (text: string, lang: 'ar' | 'en') => void;
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
  const time = getReviewTime(word.next_review);
  return time !== null && time <= Date.now();
};
const isMastered = (level: MasteryLevel): boolean =>
  level === MasteryLevel.FLUENT || level === MasteryLevel.MASTERED;
const getStatus = (word: Vocabulary, lang: 'ar' | 'en') => {
  if (word.mastery_level === MasteryLevel.MASTERED) return lang === 'ar' ? 'متقنة' : 'Mastered';
  if (word.mastery_level === MasteryLevel.FLUENT) return lang === 'ar' ? 'متمكن' : 'Fluent';
  if (word.mastery_level === MasteryLevel.NEW) return lang === 'ar' ? 'جديدة' : 'New';
  return lang === 'ar' ? 'قيد التعلم' : 'Learning';
};
const shuffle = <T,>(values: T[]): T[] => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
const wordLetters = (value: string): Letter[] =>
  (value.replace(/\s+/g, '').match(/.\p{M}*/gu) || []).map((char, id) => ({ id, char }));
const displayDetail = (text: unknown): text is string =>
  typeof text === 'string' && !!text.trim() && !['general', 'unknown', 'n/a', 'none'].includes(text.trim().toLowerCase());

export const VocabularyWordGallery: React.FC<Props> = ({ words, lang, onSpeak, onDelete }) => {
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<GalleryFilter>('all');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [showMobileDetail, setShowMobileDetail] = React.useState(false);
  const [showExampleTranslation, setShowExampleTranslation] = React.useState(false);
  const [mode, setMode] = React.useState<StageMode>('word');
  const [game, setGame] = React.useState<PracticeGame>('scramble');
  const [remaining, setRemaining] = React.useState<Letter[]>([]);
  const [guess, setGuess] = React.useState<Letter[]>([]);
  const [scrambleCorrect, setScrambleCorrect] = React.useState<boolean | null>(null);
  const [quizOptions, setQuizOptions] = React.useState<string[]>([]);
  const [quizAnswer, setQuizAnswer] = React.useState<string | null>(null);
  const [extraAnalysis, setExtraAnalysis] = React.useState<Record<string, any>>({});
  const [loadingExtra, setLoadingExtra] = React.useState<string | null>(null);
  const [extraError, setExtraError] = React.useState<string | null>(null);
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
    setMode('word');
    setShowExampleTranslation(false);
    setConfirmDeleteId(null);
    setExtraError(null);
  }, [selected?.id]);

  const chooseWord = (word: Vocabulary) => {
    setSelectedId(word.id);
    setShowMobileDetail(true);
  };

  const beginScramble = (word: Vocabulary) => {
    setGame('scramble');
    setRemaining(shuffle(wordLetters(word.original_word)));
    setGuess([]);
    setScrambleCorrect(null);
  };
  const beginQuiz = (word: Vocabulary) => {
    setGame('meaning');
    setQuizAnswer(null);
    const wrong = shuffle(Array.from(new Set(
      words.filter(other => other.id !== word.id && other.translation &&
        other.translation.trim().toLowerCase() !== word.translation.trim().toLowerCase())
        .map(other => other.translation.trim())
    )));
    setQuizOptions(wrong.length >= 2 ? shuffle([word.translation, ...wrong.slice(0, 2)]) : []);
  };
  const chooseLetter = (letter: Letter) => {
    if (!selected || scrambleCorrect !== null) return;
    const next = [...guess, letter];
    setGuess(next);
    setRemaining(previous => previous.filter(item => item.id !== letter.id));
    if (next.length === wordLetters(selected.original_word).length) {
      setScrambleCorrect(next.map(item => item.char).join('') ===
        wordLetters(selected.original_word).map(item => item.char).join(''));
    }
  };
  const beginPractice = () => {
    if (!selected) return;
    beginScramble(selected);
    setMode('practice');
  };

  // Analysis opens instantly from the stored word record, without a network
  // request. Only the separate, explicitly requested extended view calls the
  // language service, and its results stay cached for repeated visits.
  const openAnalysis = () => {
    setMode('analysis');
    setExtraError(null);
  };
  const requestExtraAnalysis = async () => {
    if (!selected || loadingExtra || extraAnalysis[selected.original_word]) return;
    const term = selected.original_word;
    setLoadingExtra(term);
    setExtraError(null);
    try {
      const detail = await getWordDeepAnalysis(term);
      if (!detail) throw new Error('Empty analysis');
      setExtraAnalysis(previous => ({ ...previous, [term]: detail }));
    } catch {
      setExtraError(lang === 'ar' ? 'تعذر تحميل التفاصيل الإضافية.' : 'Could not load additional details.');
    } finally {
      setLoadingExtra(null);
    }
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
      setSelectedId(null);
      setMode('word');
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
  const details = lang === 'ar' ? selected?.analysis?.details_ar : selected?.analysis?.details_en;
  const extended = selected ? extraAnalysis[selected.original_word] : null;
  const hasLocalAnalysis = !!(selected && (
    displayDetail(details?.category) || displayDetail(details?.sub_category) ||
    displayDetail(details?.root) || displayDetail(details?.weight) ||
    displayDetail(details?.rule) || displayDetail(details?.example)
  ));

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
                onChange={event => { setSearch(event.target.value); setMode('word'); }}
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
                  onClick={() => { setFilter(tab.key); setShowMobileDetail(false); setMode('word'); }}
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
                onClick={() => { setShowMobileDetail(false); setMode('word'); }}
                className="md:hidden rounded-lg p-1.5 bg-white/70 text-slate-600"
                aria-label={lang === 'ar' ? 'عودة إلى قائمة الكلمات' : 'Back to word list'}
              >
                {lang === 'ar' ? <ChevronRight size={19}/> : <ChevronLeft size={19}/>}
              </button>
              {mode !== 'word' && selected ? (
                <button type="button" onClick={() => setMode('word')}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 hover:bg-white/70">
                  <ArrowLeft size={14} className={lang === 'ar' ? 'rotate-180' : ''}/>
                  {lang === 'ar' ? 'عودة للكلمة' : 'Back to word'}
                </button>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 arabic-font">
                  {lang === 'ar' ? 'الكلمة المختارة' : 'Selected word'}
                </span>
              )}
            </div>
            {selected && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-100 px-3 py-1 rounded-full arabic-font">
              {getStatus(selected, lang)}
            </span>}
          </div>

          {selected ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected.id + ':' + mode}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-h-0 flex flex-col text-center px-4 sm:px-6 pb-3 sm:pb-5 pt-2"
              >
                {mode === 'word' ? (
                  <>
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
                        <button type="button" onClick={beginPractice}
                          className="qul-word-gallery-action px-3 sm:px-4 py-2.5 rounded-xl inline-flex items-center gap-2 text-xs font-bold text-slate-800">
                          <RefreshCcw size={15}/>
                          {lang === 'ar' ? 'تدرّب' : 'Practice'}
                        </button>
                        <button type="button" onClick={openAnalysis}
                          className="qul-word-gallery-action px-3 sm:px-4 py-2.5 rounded-xl inline-flex items-center gap-2 text-xs font-bold text-slate-800">
                          <BookText size={15}/>
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
                  </>
                ) : mode === 'analysis' ? (
                  <div data-testid="word-inline-analysis" className="flex-1 min-h-0 flex flex-col text-start gap-3 overflow-y-auto custom-scroll py-2">
                    <div className="flex items-center justify-between gap-3 shrink-0">
                      <div className="min-w-0">
                        <h2 className="arabic-font font-black text-xl sm:text-2xl text-slate-800" dir="rtl">{selected.original_word}</h2>
                        <p className="text-xs text-slate-500" dir="ltr">{selected.translation}</p>
                      </div>
                      <button type="button" onClick={() => onSpeak(selected.original_word, 'ar')}
                        className="qul-word-gallery-speak w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-emerald-700"
                        aria-label={lang === 'ar' ? 'استمع إلى الكلمة' : 'Hear word'}>
                        <Volume2 size={18}/>
                      </button>
                    </div>

                    <div className="qul-word-gallery-example rounded-2xl p-3 sm:p-4 space-y-2">
                      <h3 className="font-bold text-slate-700 text-sm arabic-font">
                        {lang === 'ar' ? 'التحليل اللغوي' : 'Language details'}
                      </h3>
                      {hasLocalAnalysis || displayDetail(selected.analysis?.type) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selected.analysis?.type && (
                            <div className="qul-word-gallery-detail">
                              <span>{lang === 'ar' ? 'نوع الكلمة' : 'Word type'}</span>
                              <strong>{selected.analysis.type === 'noun' ? (lang === 'ar' ? 'اسم' : 'Noun')
                                : selected.analysis.type === 'verb' ? (lang === 'ar' ? 'فعل' : 'Verb')
                                : (lang === 'ar' ? 'حرف' : 'Particle')}</strong>
                            </div>
                          )}
                          {displayDetail(details?.category) && (
                            <div className="qul-word-gallery-detail">
                              <span>{lang === 'ar' ? 'التصنيف' : 'Category'}</span><strong>{details.category}</strong>
                            </div>
                          )}
                          {displayDetail(details?.sub_category) && (
                            <div className="qul-word-gallery-detail">
                              <span>{lang === 'ar' ? 'التصنيف الفرعي' : 'Subcategory'}</span><strong>{details.sub_category}</strong>
                            </div>
                          )}
                          {displayDetail(details?.root) && (
                            <div className="qul-word-gallery-detail">
                              <span>{lang === 'ar' ? 'الجذر' : 'Root'}</span><strong dir="rtl">{details.root}</strong>
                            </div>
                          )}
                          {displayDetail(details?.weight) && (
                            <div className="qul-word-gallery-detail">
                              <span>{lang === 'ar' ? 'الوزن' : 'Pattern'}</span><strong dir="rtl">{details.weight}</strong>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 arabic-font">
                          {lang === 'ar' ? 'لا توجد تفاصيل لغوية محفوظة لهذه الكلمة بعد.' : 'No stored grammar details for this word yet.'}
                        </p>
                      )}
                      {displayDetail(details?.rule) && <p className="text-xs sm:text-sm leading-relaxed text-slate-700 arabic-font">{details.rule}</p>}
                    </div>

                    {displayDetail(details?.example) && (
                      <div className="qul-word-gallery-example rounded-2xl p-3 sm:p-4">
                        <span className="text-[10px] text-slate-500 block mb-1">{lang === 'ar' ? 'مثال' : 'Example'}</span>
                        <p className="arabic-font text-sm text-slate-800 leading-relaxed" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{details.example}</p>
                      </div>
                    )}

                    {extended && (
                      <div className="qul-word-gallery-example rounded-2xl p-3 sm:p-4 space-y-2">
                        {Array.isArray(extended.root_letters) && extended.root_letters.length > 0 && (
                          <div className="qul-word-gallery-detail">
                            <span>{lang === 'ar' ? 'حروف الجذر' : 'Root letters'}</span>
                            <strong dir="rtl">{extended.root_letters.join('، ')}</strong>
                          </div>
                        )}
                        {Array.isArray(extended.word_family) && extended.word_family.length > 0 && (
                          <>
                            <h3 className="text-xs font-bold text-slate-600">{lang === 'ar' ? 'عائلة الكلمة' : 'Word family'}</h3>
                            <div className="flex flex-wrap gap-2">
                              {extended.word_family.slice(0, 6).map((item: any, index: number) => (
                                <span key={index} className="text-xs text-slate-700 bg-white/80 rounded-lg px-2 py-1 border border-white">
                                  {item.word}{item.meaning ? ' (' + item.meaning + ')' : ''}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {!extended && (
                      <div className="shrink-0 flex flex-col items-start gap-2">
                        <button type="button" onClick={requestExtraAnalysis} disabled={loadingExtra !== null}
                          className="qul-word-gallery-action rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 disabled:opacity-55">
                          {loadingExtra === selected.original_word
                            ? (lang === 'ar' ? 'جارٍ تحميل التفاصيل...' : 'Loading more details...')
                            : (lang === 'ar' ? 'عرض تفاصيل إضافية' : 'More details')}
                        </button>
                        {extraError && <p role="status" className="text-xs text-rose-600">{extraError}</p>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div data-testid="word-inline-practice" className="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto custom-scroll py-2">
                    <h2 className="arabic-font font-black text-xl sm:text-2xl text-slate-800" dir="rtl">{selected.original_word}</h2>
                    <div className="flex justify-center gap-2 shrink-0">
                      <button type="button" onClick={() => beginScramble(selected)} aria-pressed={game === 'scramble'}
                        className={['rounded-xl text-xs font-bold px-3 py-2 transition-colors',
                          game === 'scramble' ? 'bg-slate-800 text-white' : 'qul-word-gallery-action text-slate-700'].join(' ')}>
                        {lang === 'ar' ? 'ترتيب الحروف' : 'Letter order'}
                      </button>
                      <button type="button" onClick={() => beginQuiz(selected)} aria-pressed={game === 'meaning'}
                        className={['rounded-xl text-xs font-bold px-3 py-2 transition-colors',
                          game === 'meaning' ? 'bg-slate-800 text-white' : 'qul-word-gallery-action text-slate-700'].join(' ')}>
                        {lang === 'ar' ? 'اختر المعنى' : 'Choose meaning'}
                      </button>
                    </div>

                    {game === 'scramble' ? (
                      <div className="qul-word-gallery-example rounded-2xl p-3 sm:p-4 space-y-3">
                        <p className="text-xs font-medium text-slate-600">{lang === 'ar' ? 'رتّب الحروف لتكوين الكلمة.' : 'Put the letters in the correct order.'}</p>
                        <div className="min-h-[43px] flex flex-wrap justify-center gap-1.5" dir="rtl">
                          {guess.map(letter => (
                            <button type="button" key={letter.id} onClick={() => {
                                if (scrambleCorrect !== null) return;
                                setGuess(previous => previous.filter(l => l.id !== letter.id));
                                setRemaining(previous => [...previous, letter]);
                              }} className="qul-word-gallery-letter bg-emerald-50 text-emerald-800">
                              {letter.char}
                            </button>
                          ))}
                        </div>
                        {scrambleCorrect === null ? (
                          <div className="flex flex-wrap justify-center gap-1.5" dir="rtl">
                            {remaining.map(letter => (
                              <button type="button" key={letter.id} onClick={() => chooseLetter(letter)}
                                className="qul-word-gallery-letter bg-white/80 text-slate-800 hover:bg-white">
                                {letter.char}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p role="status" className={scrambleCorrect ? 'text-emerald-700 text-sm font-bold' : 'text-rose-600 text-sm font-bold'}>
                            {scrambleCorrect
                              ? (lang === 'ar' ? 'أحسنت! الترتيب صحيح.' : 'Well done! Correct order.')
                              : (lang === 'ar' ? 'حاول مرة أخرى.' : 'Try again.')}
                          </p>
                        )}
                        <button type="button" onClick={() => beginScramble(selected)}
                          className="qul-word-gallery-action rounded-xl px-3 py-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <RotateCcw size={13}/>{lang === 'ar' ? 'إعادة' : 'Reset'}
                        </button>
                      </div>
                    ) : (
                      <div className="qul-word-gallery-example rounded-2xl p-3 sm:p-4 space-y-3">
                        <p className="text-xs font-medium text-slate-600">{lang === 'ar' ? 'ما معنى هذه الكلمة؟' : 'What does the word mean?'}</p>
                        {quizOptions.length < 3 ? (
                          <p className="text-xs text-slate-500 arabic-font">
                            {lang === 'ar' ? 'احفظ ثلاث كلمات على الأقل لاستخدام اختبار المعاني.' : 'Save at least three different words to practice meanings.'}
                          </p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {quizOptions.map(option => (
                              <button type="button" key={option} disabled={quizAnswer !== null} onClick={() => setQuizAnswer(option)}
                                className={[
                                  'qul-word-gallery-action text-start rounded-xl px-3 py-2.5 text-sm text-slate-800 font-semibold disabled:opacity-80',
                                  quizAnswer !== null && option === selected.translation ? 'border-emerald-300 bg-emerald-50' : ''
                                ].join(' ')} dir="ltr">
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                        {quizAnswer !== null && (
                          <p role="status" className={quizAnswer === selected.translation ? 'text-emerald-700 text-sm' : 'text-rose-600 text-sm'}>
                            {quizAnswer === selected.translation
                              ? (lang === 'ar' ? 'إجابة صحيحة!' : 'Correct!')
                              : (lang === 'ar' ? 'الإجابة الصحيحة: ' : 'Correct answer: ') + selected.translation}
                          </p>
                        )}
                        <button type="button" onClick={() => beginQuiz(selected)}
                          className="qul-word-gallery-action rounded-xl px-3 py-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <RotateCcw size={13}/>{lang === 'ar' ? 'سؤال جديد' : 'New question'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
