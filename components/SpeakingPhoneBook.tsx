import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Search, X, MapPin } from 'lucide-react';
import type { CallContact } from './SpeakingCallBooth';
import './SpeakingPhoneBook.css';

const GROUPS = {
  restaurant: 'daily',
  hotel: 'travel',
  friend: 'daily',
  support: 'services',
  taxi: 'travel',
  clinic: 'services',
  library: 'study',
  bakery: 'daily',
  school: 'study',
  museum: 'travel',
} as const;

const CATEGORY_OPTIONS = [
  { id: 'all', ar: 'الكل', en: 'All' },
  { id: 'daily', ar: 'الحياة اليومية', en: 'Everyday' },
  { id: 'travel', ar: 'تنقل وزيارات', en: 'Travel' },
  { id: 'services', ar: 'خدمات', en: 'Services' },
  { id: 'study', ar: 'تعليم وثقافة', en: 'Learning' },
] as const;

type Category = typeof CATEGORY_OPTIONS[number]['id'];

interface Props {
  lang: 'ar' | 'en';
  contacts: readonly CallContact[];
  selectedId: string | null;
  disabled: boolean;
  onSelect: (contact: CallContact) => void;
}

export const SpeakingPhoneBook: React.FC<Props> = ({ lang, contacts, selectedId, disabled, onSelect }) => {
  const ar = lang === 'ar';
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<Category>('all');
  const [spread, setSpread] = React.useState(0);
  const [direction, setDirection] = React.useState(1);

  const filtered = React.useMemo(() => {
    const term = query.toLocaleLowerCase().trim();
    return contacts.filter(c =>
      (category === 'all' || GROUPS[c.id] === category) &&
      (!term || (c.ar + ' ' + c.en + ' ' + c.agentAr + ' ' + c.extension)
        .toLocaleLowerCase().includes(term))
    );
  }, [contacts, query, category]);
  const perSpread = 4;
  const pages = Math.max(1, Math.ceil(filtered.length / perSpread));
  const spreadIndex = Math.min(spread, pages - 1);
  const entries = filtered.slice(spreadIndex * perSpread, spreadIndex * perSpread + perSpread);

  const chooseCategory = (next: Category) => {
    setCategory(next);
    setSpread(0);
    setDirection(1);
  };
  const nextPage = (delta: number) => {
    setDirection(delta);
    setSpread(current => Math.max(0, Math.min(pages - 1, current + delta)));
  };

  const Entry: React.FC<{ item: CallContact }> = ({ item }) => (
    <button type="button" disabled={disabled} onClick={() => onSelect(item)}
      className={'qul-book-entry ' + (item.id === selectedId ? 'selected' : '')}
      aria-pressed={item.id === selectedId}
      aria-label={(ar ? item.ar : item.en) + ', ' + item.extension}>
      <span className="qul-book-entry-icon" aria-hidden="true">{item.symbol}</span>
      <span className="qul-book-entry-copy">
        <strong>{ar ? item.ar : item.en}</strong>
        <small>{ar ? item.en : item.ar}</small>
      </span>
      <span className="qul-book-entry-number" dir="ltr">{item.extension}</span>
    </button>
  );

  const openBook = () => {
    setOpen(true);
    setSpread(0);
  };

  return (
    <section className="qul-book-area" aria-label={ar ? 'أجندة دليل الاتصالات' : 'Telephone address book'}>
      <div className="qul-book-intro">
        <div>
          <span className="qul-book-overline">QUL CONTACTS • 10</span>
          <h3>{ar ? 'أجندة الاتصالات' : 'Telephone directory'}</h3>
          <p>{ar ? 'ابحث عن الجهة، اقرأ الرقم ثم اطلبه بنفسك.' : 'Find a place, read its number, then dial it yourself.'}</p>
        </div>
        {open && (
          <button type="button" onClick={() => setOpen(false)} className="qul-book-close">
            <X size={16} />{ar ? 'إغلاق' : 'Close'}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.button type="button" key="cover" onClick={openBook}
            className="qul-book-closed"
            initial={reducedMotion ? false : { rotateY: 12, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { rotateY: -65, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.48 }}>
            <span className="qul-book-binding" aria-hidden="true" />
            <span className="qul-book-cover-emboss" aria-hidden="true">Q</span>
            <span className="qul-book-cover-heading">QUL</span>
            <strong>{ar ? 'دليل الاتصالات' : 'THE TELEPHONE BOOK'}</strong>
            <span className="qul-book-cover-detail">{ar ? 'عشرة عناوين ومهمات حقيقية للتدريب' : 'Ten fictional places, ten speaking missions'}</span>
            <span className="qul-book-open-action"><BookOpen size={17}/>{ar ? 'افتح الأجندة' : 'Open the book'}</span>
          </motion.button>
        ) : (
          <motion.div key="pages" className="qul-book-open"
            initial={reducedMotion ? false : { rotateY: -28, scale: .94, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: .98 }}
            transition={{ duration: reducedMotion ? 0.01 : .44 }}>
            <div className="qul-book-toolbar">
              <div className="qul-book-search">
                <Search size={16} />
                <input value={query}
                  onChange={e => { setQuery(e.target.value); setSpread(0); setDirection(1); }}
                  placeholder={ar ? 'ابحث عن اسم أو جهة...' : 'Search a place or contact...'}
                  aria-label={ar ? 'البحث في دليل الاتصالات' : 'Search telephone directory'}
                  disabled={disabled} />
                {query && <button type="button" onClick={() => { setQuery(''); setSpread(0); }} aria-label={ar ? 'مسح البحث' : 'Clear search'}><X size={13}/></button>}
              </div>
              <div className="qul-book-filters" aria-label={ar ? 'تصنيف جهات الاتصال' : 'Contact category'}>
                {CATEGORY_OPTIONS.map(group => (
                  <button type="button" key={group.id} onClick={() => chooseCategory(group.id)}
                    className={category === group.id ? 'active' : ''}
                    aria-pressed={category === group.id}>
                    {ar ? group.ar : group.en}
                  </button>
                ))}
              </div>
            </div>
            <div className="qul-book-pages-shell">
              <div className="qul-book-page-stack" aria-hidden="true"/>
              <div className="qul-book-page-spine" aria-hidden="true"/>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={category + ':' + query + ':' + spreadIndex}
                  className="qul-book-page-pair"
                  initial={reducedMotion ? false : { rotateY: direction > 0 ? 14 : -14, opacity: .3 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={reducedMotion ? { opacity: 0 } : { rotateY: direction > 0 ? -14 : 14, opacity: .2 }}
                  transition={{ duration: reducedMotion ? 0.01 : .27 }}>
                  <div className="qul-book-page">
                    <div className="qul-book-page-label">{ar ? 'الجهات' : 'CONTACTS'} <span>Q / 01</span></div>
                    {entries.slice(0,2).map(c => <Entry item={c} key={c.id}/>)}
                    {!entries.length && <div className="qul-book-no-results"><Search size={22}/>{ar ? 'لا توجد جهة بهذا الاسم' : 'No matching contacts'}</div>}
                    <span className="qul-book-page-number" dir="ltr">{spreadIndex * 2 + 1}</span>
                  </div>
                  <div className="qul-book-page">
                    <div className="qul-book-page-label">{ar ? 'أرقام التدريب' : 'EXTENSIONS'} <span>Q / 02</span></div>
                    {entries.slice(2,4).map(c => <Entry item={c} key={c.id}/>)}
                    <div className="qul-book-page-watermark" aria-hidden="true">قُل</div>
                    <span className="qul-book-page-number" dir="ltr">{spreadIndex * 2 + 2}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="qul-book-navigation">
              <button type="button" onClick={() => nextPage(-1)} disabled={spreadIndex === 0}
                aria-label={ar ? 'الصفحة السابقة' : 'Previous page'}><ChevronRight size={17}/>{ar ? 'السابق' : 'Back'}</button>
              <span>{ar ? 'صفحات الدليل' : 'DIRECTORY'} <b dir="ltr">{spreadIndex + 1} / {pages}</b></span>
              <button type="button" onClick={() => nextPage(1)} disabled={spreadIndex >= pages - 1}
                aria-label={ar ? 'الصفحة التالية' : 'Next page'}>{ar ? 'التالي' : 'Next'}<ChevronLeft size={17}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="qul-book-tip">
        <MapPin size={14} />
        <p>{selectedId
          ? (ar ? 'وجدت الجهة. انظر إلى رقمها في الصفحة واكتبه على الهاتف يدويًا.' : 'Contact found. Read its extension and enter it manually on the phone.')
          : (ar ? 'افتح الأجندة واختر الجهة التي تريد الاتصال بها.' : 'Open the book and select who you want to call.')}
        </p>
      </div>
    </section>
  );
};
