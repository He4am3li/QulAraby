import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { ARABIC_DIRECTORY_LETTERS, directoryLetterOf } from '../data/speakingDirectory';
import type { CallContact } from './SpeakingCallBooth';
import './SpeakingAlphabetBook.css';
import './SpeakingReferencePhoto.css';

interface Props {
  lang: 'ar' | 'en';
  contacts: readonly CallContact[];
  selectedId: string | null;
  disabled: boolean;
  onSelect: (contact: CallContact) => void;
}

const ITEMS_PER_SPREAD = 6;
const FIRST_LETTER = ARABIC_DIRECTORY_LETTERS[0];

export const SpeakingPhoneBook: React.FC<Props> = ({ lang, contacts, selectedId, disabled, onSelect }) => {
  const ar = lang === 'ar';
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const [activeLetter, setActiveLetter] = React.useState<string>(FIRST_LETTER);
  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [turnDirection, setTurnDirection] = React.useState(1);
  const [lastTurn, setLastTurn] = React.useState(0);
  const flipCounterRef = React.useRef(0);
  const [flippingLeaf, setFlippingLeaf] = React.useState<{
    key: number; direction: number; entries: CallContact[];
  } | null>(null);

  const matching = React.useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return contacts.filter(entry => q
      ? [entry.ar, entry.en, entry.extension].some(field => field.toLocaleLowerCase().includes(q))
      : directoryLetterOf(entry.ar) === activeLetter
    ).sort((a,b) => a.ar.localeCompare(b.ar, 'ar'));
  }, [contacts, activeLetter, query]);

  const totalPages = Math.max(1, Math.ceil(matching.length / ITEMS_PER_SPREAD));
  const currentPage = Math.min(page, totalPages - 1);
  const visible = matching.slice(currentPage * ITEMS_PER_SPREAD, (currentPage + 1) * ITEMS_PER_SPREAD);
  const turnLeaf = (direction: number) => {
    if (!reducedMotion) {
      setFlippingLeaf({
        key: ++flipCounterRef.current,
        direction,
        entries: visible.slice(direction > 0 ? 0 : 3, direction > 0 ? 3 : 6),
      });
    }
    setTurnDirection(direction);
    setLastTurn(value => value + 1);
  };
  const changePage = (direction: number) => {
    turnLeaf(direction);
    setPage(prev => Math.max(0, Math.min(totalPages - 1, prev + direction)));
  };
  const goToLetter = (letter: string) => {
    if (disabled) return;
    setQuery('');
    setActiveLetter(letter);
    setPage(0);
    turnLeaf(1);
  };

  const displayEntry = (item: CallContact) => (
    <button key={item.id} type="button" disabled={disabled} className={'qul-index-entry ' + (selectedId === item.id ? 'chosen' : '')}
      onClick={() => onSelect(item)} aria-pressed={selectedId === item.id}
      aria-label={(ar ? item.ar : item.en) + '، ' + item.extension}>
      <div className="qul-index-entry-name">
        <strong>{ar ? item.ar : item.en}</strong>
        <span dir="auto">{ar ? item.en : item.ar}</span>
      </div>
      <span className="qul-index-extension" dir="ltr">{item.extension}</span>
    </button>
  );

  return (
    <section className="qul-alphabet-directory" aria-label={ar ? 'دليل الهاتف الهجائي' : 'Arabic alphabetical telephone directory'}>
      <div className="qul-alphabet-heading">
        <div>
          <span>QUL · TELEPHONE ADDRESS BOOK</span>
          <h3>{ar ? 'دليل الهاتف' : 'Telephone directory'}</h3>
        </div>
        {open && (
          <button type="button" className="qul-alphabet-close" onClick={() => setOpen(false)}
            aria-label={ar ? 'إغلاق دليل الهاتف' : 'Close address book'}><X size={15}/>{ar ? 'إغلاق' : 'Close'}</button>
        )}
      </div>

      <div className={'qul-alphabet-stage ' + (open ? 'is-open' : 'is-closed')}>
        <div className="qul-alphabet-book" dir="rtl">
          <div className="qul-reference-book-photo" aria-hidden="true"/>
          <div className="qul-alphabet-book-edge" aria-hidden="true"/>
          <div className="qul-alphabet-book-spine" aria-hidden="true"/>

          <div className="qul-alphabet-paper-content" aria-hidden={!open}>
            <div className="qul-alphabet-tabs" role="group" aria-label={ar ? 'الحروف الهجائية' : 'Arabic alphabet'}>
              {ARABIC_DIRECTORY_LETTERS.map((letter, index) => (
                <button key={letter} type="button" disabled={!open || disabled}
                  aria-label={(ar ? 'حرف ' : 'Arabic letter ') + letter}
                  aria-pressed={query.length === 0 && activeLetter === letter}
                  className={'qul-alphabet-tab ' + (query.length === 0 && activeLetter === letter ? 'selected' : '')}
                  onClick={() => goToLetter(letter)}
                  style={{ '--tab-group': index < 14 ? 0 : 1 } as React.CSSProperties}>
                  {letter}
                </button>
              ))}
            </div>
            <div className="qul-alphabet-book-pages">
              <div className="qul-alphabet-search">
                <Search size={13}/>
                <input disabled={!open || disabled} dir={ar ? 'rtl' : 'ltr'}
                  value={query}
                  onChange={event => {setQuery(event.target.value); setPage(0);setTurnDirection(1);setLastTurn(x=>x+1);}}
                  placeholder={ar ? 'ابحث عن اسم أو رقم' : 'Search name or number'}
                  aria-label={ar ? 'بحث في دليل الهاتف' : 'Search address book'}/>
                {query && <button type="button" onClick={() => {setQuery('');setPage(0);}} aria-label={ar ? 'مسح البحث' : 'Clear search'}><X size={12}/></button>}
              </div>
              <div className="qul-alphabet-pages-frame">
                <div className="qul-alphabet-center-fold" aria-hidden="true"/>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeLetter + ':' + query + ':' + currentPage + ':' + lastTurn}
                    className="qul-alphabet-visible-spread"
                    initial={reducedMotion ? false : { opacity: .45, scale: .985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: .65, scale: .985 }}
                    transition={{ duration: reducedMotion ? 0 : .33 }}
                    style={{ transformOrigin: 'center center' }}>
                    <div className="qul-alphabet-page">
                      <header>
                        <strong>{query ? (ar ? 'نتائج البحث' : 'Search results') : (ar ? 'حرف ' + activeLetter : 'Letter ' + activeLetter)}</strong>
                        <span>QUL / {String(currentPage * 2 + 1).padStart(2,'0')}</span>
                      </header>
                      <div className="qul-alphabet-page-lines">
                        {visible.slice(0,3).map(displayEntry)}
                        {!matching.length && <span className="qul-index-no-results">{ar ? 'لا توجد نتائج' : 'No results'}</span>}
                      </div>
                      <footer>قُل <span>• {currentPage * 2 + 1} •</span></footer>
                    </div>
                    <div className="qul-alphabet-page">
                      <header><strong>{ar ? 'الأسماء والأرقام' : 'Names and numbers'}</strong><span>QUL / {String(currentPage * 2 + 2).padStart(2,'0')}</span></header>
                      <div className="qul-alphabet-page-lines">{visible.slice(3,6).map(displayEntry)}</div>
                      <footer>{ar ? 'دليل التدريب' : 'TRAINING DIRECTORY'} <span>• {currentPage * 2 + 2} •</span></footer>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <AnimatePresence initial={false}>
                  {flippingLeaf && (
                    <motion.div key={flippingLeaf.key}
                      className={'qul-alphabet-flipping-leaf ' + (flippingLeaf.direction < 0 ? 'backward' : 'forward')}
                      initial={{ rotateY: 0, opacity: 1 }}
                      animate={{ rotateY: flippingLeaf.direction > 0 ? -176 : 176, opacity: .9 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: .82, ease: [.29, .06, .34, 1] }}
                      onAnimationComplete={() => setFlippingLeaf(current => current?.key === flippingLeaf.key ? null : current)}>
                      <div className="qul-alphabet-flip-front">
                        <div className="qul-alphabet-flip-label">{query ? 'QUL' : activeLetter}</div>
                        {flippingLeaf.entries.map(entry => (
                          <div key={entry.id} className="qul-alphabet-flip-ruled">
                            <span>{ar ? entry.ar : entry.en}</span>
                            <b dir="ltr">{entry.extension}</b>
                          </div>
                        ))}
                      </div>
                      <div className="qul-alphabet-flip-back" aria-hidden="true">
                        <span>QUL · قُل</span>
                        <i/><i/><i/><i/><i/>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="qul-alphabet-navigation">
                <button type="button" disabled={!open || currentPage === 0} onClick={() => changePage(-1)}><ChevronRight size={15}/>{ar ? 'السابق' : 'Previous'}</button>
                <span dir="ltr">{currentPage + 1} / {totalPages}</span>
                <button type="button" disabled={!open || currentPage === totalPages - 1} onClick={() => changePage(1)}>{ar ? 'التالي' : 'Next'}<ChevronLeft size={15}/></button>
              </div>
            </div>
          </div>

          <motion.div className="qul-alphabet-cover" aria-hidden={open} style={{ transformOrigin: 'right center' }}
            animate={open ? { rotateY: 175, opacity: 0.12 } : { rotateY: 0, opacity: 1 }}
            transition={reducedMotion ? { duration: .01 } : { duration: 1.16, ease: [.48, .01, .2, 1] }}>
            <div className="qul-alphabet-cover-ridge" aria-hidden="true"/>
            <span className="qul-alphabet-cover-monogram">قُل</span>
            <span className="qul-alphabet-cover-title">دليل الهاتف</span>
            <span className="qul-alphabet-cover-subtitle">QUL PHONE DIRECTORY</span>
            <span className="qul-alphabet-cover-decoration" aria-hidden="true"/>
            <button type="button" disabled={open} className="qul-alphabet-cover-opener" onClick={() => setOpen(true)}
              aria-label={ar ? 'افتح الغلاف من أسفل اليسار' : 'Open book from lower left corner'}
              tabIndex={open ? -1 : 0}>
              <BookOpen size={17} />
              <span>{ar ? 'افتح الدليل' : 'OPEN BOOK'}</span>
            </button>
          </motion.div>
        </div>
      </div>
      <p className="qul-alphabet-instruction">
        {open
          ? (selectedId
            ? (ar ? 'اكتب رقم الجهة المختارة بنفسك على قرص الهاتف.' : 'Manually dial the selected entry on the phone.')
            : (ar ? 'اختر حرفًا، ثم اسم الجهة لمعرفة رقمها.' : 'Choose a letter and then an entry to find its number.'))
          : (ar ? 'اضغط أسفل يسار الغلاف لفتح الدليل.' : 'Press the lower-left corner to open the address book.')}
      </p>
    </section>
  );
};
