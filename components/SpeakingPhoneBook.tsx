import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ARABIC_DIRECTORY_LETTERS, directoryLetterOf } from '../data/speakingDirectory';
import type { CallContact } from './SpeakingCallBooth';
import './SpeakingMinimalPolish.css';
import './SpeakingBookRefinement.css';

type Props = {
  lang: 'ar' | 'en';
  contacts: readonly CallContact[];
  selectedId: string | null;
  disabled: boolean;
  onSelect: (contact: CallContact) => void;
};
const PAGE_SIZE = 6;
type TurningLeaf = {
  serial: number;
  direction: number;
  previous: CallContact[];
};

export const SpeakingPhoneBook: React.FC<Props> = ({ lang, contacts, selectedId, disabled, onSelect }) => {
  const ar = lang === 'ar';
  const reduced = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const [letter, setLetter] = React.useState<string>('أ');
  const [page, setPage] = React.useState(0);
  const [turn, setTurn] = React.useState(0);
  const [leaf, setLeaf] = React.useState<TurningLeaf | null>(null);
  const found = React.useMemo(
    () => contacts.filter(c => directoryLetterOf(c.ar)===letter).sort((a,b) => a.ar.localeCompare(b.ar,'ar')),
    [contacts, letter]
  );
  const pages = Math.max(1, Math.ceil(found.length/PAGE_SIZE));
  const visible = found.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);

  const change = (nextLetter: string, nextPage=0, dir=1) => {
    if (disabled || (nextLetter===letter && nextPage===page)) return;
    if (!reduced) {
      setLeaf({
        serial: turn+1,
        direction: dir,
        previous: visible.slice(dir>0 ? 3 : 0, dir>0 ? 6 : 3),
      });
    }
    setLetter(nextLetter);
    setPage(nextPage);
    setTurn(n => n+1);
  };
  const entry = (contact:CallContact) => (
    <button key={contact.id} type="button" disabled={disabled}
      onClick={()=>onSelect(contact)} className={'qul-clean-book-entry '+(selectedId===contact.id?'selected':'')}
      aria-label={(ar?contact.ar:contact.en)+', '+(ar?contact.en:contact.ar)+', '+contact.extension}
      aria-pressed={selectedId===contact.id}>
      <span className="qul-clean-book-ar" lang="ar" dir="rtl">{contact.ar}</span>
      <span className="qul-clean-book-en" lang="en" dir="ltr">{contact.en}</span>
      <strong className="qul-clean-book-ext" dir="ltr">{contact.extension}</strong>
    </button>
  );
  const hint = open
    ? (ar ? 'اختر الحرف ثم اضغط على اسم الجهة' : 'Choose a letter, then tap a contact')
    : (ar ? 'اضغط على الغلاف لفتح دليل الهاتف' : 'Tap the leather cover to open the directory');

  return (
    <section className="qul-clean-book qul-object-hint-host"
      aria-label={ar?'دليل الأرقام الهجائي':'Arabic alphabetical telephone directory'}>
      <div className={'qul-clean-book-stage '+(open?'is-open':'is-closed')} dir="rtl">
        <AnimatePresence initial={false} mode="sync">
          {!open ? (
            <motion.button type="button" key="cover" className="qul-clean-book-cover"
              onClick={()=>setOpen(true)}
              aria-label={ar?'افتح دفتر الهاتف من الغلاف أو الجزء المعدني':'Open the telephone book using its cover'}
              initial={false} animate={{rotateY:0,opacity:1}}
              exit={reduced?{opacity:0}:{rotateY:165,opacity:0}}
              transition={{duration:reduced?0:.9,ease:[.28,.05,.24,1]}}>
              <img src="/assets/speaking/phonebook-cover.avif" alt="" draggable={false}/>
            </motion.button>
          ) : (
            <motion.div key="inside" className="qul-clean-book-inside"
              initial={reduced?false:{opacity:0,scale:.97}}
              animate={{opacity:1,scale:1}}
              transition={{duration:reduced?0:.38}}>
              <img src="/assets/speaking/phonebook-open-clean.avif" alt="" draggable={false}
                className="qul-clean-book-photo"/>
              <div className="qul-clean-book-tabs" role="group"
                aria-label={ar?'الحروف الهجائية':'Arabic alphabet'}>
                {ARABIC_DIRECTORY_LETTERS.map(ch=>(
                  <button type="button" key={ch} disabled={disabled} onClick={()=>change(ch)}
                    aria-label={(ar?'الحرف ':'Arabic letter ')+ch} aria-pressed={letter===ch}
                    className={letter===ch?'active':''}>{ch}</button>
                ))}
              </div>
              <div className="qul-clean-book-spread">
                {/* Always-rendered paper: the original printed names can never flash through a page transition. */}
                <div className="qul-clean-book-sheet">
                  <div className="qul-clean-book-page">{visible.slice(0,3).map(entry)}</div>
                  <div className="qul-clean-book-page">{visible.slice(3,6).map(entry)}</div>
                </div>
                <AnimatePresence initial={false}>
                  {leaf && !reduced && (
                    <motion.div key={leaf.serial}
                      className={'qul-clean-book-turnleaf '+(leaf.direction>0?'forward':'backward')}
                      initial={{rotateY:0,opacity:1}}
                      animate={{rotateY:leaf.direction>0?170:-170,opacity:1}}
                      exit={{opacity:0}}
                      transition={{duration:.72,ease:[.34,.04,.22,1]}}
                      onAnimationComplete={()=>setLeaf(prev=>prev?.serial===leaf.serial?null:prev)}>
                      <div className="qul-clean-book-leaf-face front">
                        {leaf.previous.map(c=>(
                          <div key={c.id} className="qul-clean-book-entry" aria-hidden="true">
                            <span className="qul-clean-book-ar">{c.ar}</span>
                            <span className="qul-clean-book-en" dir="ltr">{c.en}</span>
                            <strong className="qul-clean-book-ext" dir="ltr">{c.extension}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="qul-clean-book-leaf-face back" aria-hidden="true"/>
                    </motion.div>
                  )}
                </AnimatePresence>
                {page>0&&<button type="button" className="qul-clean-book-corner previous"
                  disabled={disabled} onClick={()=>change(letter,page-1,-1)}
                  aria-label={ar?'الصفحة السابقة':'Previous page'}/>}
                {page+1<pages&&<button type="button" className="qul-clean-book-corner next"
                  disabled={disabled} onClick={()=>change(letter,page+1,1)}
                  aria-label={ar?'الصفحة التالية':'Next page'}/>}
              </div>
              {/* The untouched leather and metal binding are preserved in the cleaned photo. */}
              <img className="qul-clean-book-spine-photo"
                src="/assets/speaking/phonebook-open-clean.avif" alt="" draggable={false} aria-hidden="true"/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="qul-object-hint" role="tooltip">{hint}</span>
    </section>
  );
};
