import React from 'react';
import { AnimatePresence,motion,useReducedMotion } from 'framer-motion';
import { ARABIC_DIRECTORY_LETTERS,directoryLetterOf } from '../data/speakingDirectory';
import type { CallContact } from './SpeakingCallBooth';
import './SpeakingMinimalPolish.css';

type Props={lang:'ar'|'en';contacts:readonly CallContact[];selectedId:string|null;disabled:boolean;onSelect:(contact:CallContact)=>void};
const PAGE_SIZE=6;
export const SpeakingPhoneBook:React.FC<Props>=({lang,contacts,selectedId,disabled,onSelect})=>{
  const ar=lang==='ar';
  const reduced=useReducedMotion();
  const [open,setOpen]=React.useState(false);
  const [letter,setLetter]=React.useState<string>('أ');
  const [page,setPage]=React.useState(0);
  const [direction,setDirection]=React.useState(1);
  const [turn,setTurn]=React.useState(0);
  const found=React.useMemo(()=>contacts.filter(c=>directoryLetterOf(c.ar)===letter).sort((a,b)=>a.ar.localeCompare(b.ar,'ar')),[contacts,letter]);
  const pages=Math.max(1,Math.ceil(found.length/PAGE_SIZE));
  const visible=found.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  const change=(nextLetter:string,nextPage=0,dir=1)=>{
    if(disabled)return;
    setDirection(dir);setLetter(nextLetter);setPage(nextPage);setTurn(n=>n+1);
  };
  const entry=(contact:CallContact)=>(
    <button key={contact.id} type="button" disabled={disabled}
      onClick={()=>onSelect(contact)} className={'qul-clean-book-entry '+(selectedId===contact.id?'selected':'')}
      aria-label={contact.ar+', '+contact.en+', '+contact.extension} aria-pressed={selectedId===contact.id}>
      <span className="qul-clean-book-ar">{contact.ar}</span>
      <span className="qul-clean-book-en" dir="ltr">{contact.en}</span>
      <strong className="qul-clean-book-ext" dir="ltr">{contact.extension}</strong>
    </button>
  );
  return <section className="qul-clean-book" aria-label={ar?'دليل الأرقام الهجائي':'Alphabetical directory'}>
    <div className="qul-clean-book-stage" dir="rtl">
      <AnimatePresence initial={false} mode="sync">
        {!open ? (
          <motion.button type="button" key="cover" className="qul-clean-book-cover"
            onClick={()=>setOpen(true)}
            aria-label={ar?'افتح دفتر الهاتف من الغلاف أو الجزء المعدني':'Open the telephone book'}
            initial={false} animate={{rotateY:0,opacity:1}}
            exit={reduced?{opacity:0}:{rotateY:165,opacity:0}}
            transition={{duration:reduced?0:.9,ease:[.28,.05,.24,1]}}>
            <img src="/assets/speaking/phonebook-cover.avif" alt="" draggable={false}/>
          </motion.button>
        ):(
          <motion.div key="inside" className="qul-clean-book-inside"
            initial={reduced?false:{opacity:0,scale:.97}}
            animate={{opacity:1,scale:1}} transition={{duration:reduced?0:.48}}>
            <img src="/assets/speaking/phonebook-open.avif" alt="" draggable={false}
              className="qul-clean-book-photo"/>
            <div className="qul-clean-book-tabs" role="group" aria-label={ar?'الحروف الهجائية':'Arabic alphabet'}>
              {ARABIC_DIRECTORY_LETTERS.map(ch=>(
                <button type="button" key={ch} disabled={disabled} onClick={()=>change(ch)}
                  aria-label={(ar?'الحرف ':'Letter ')+ch} aria-pressed={letter===ch}
                  className={letter===ch?'active':''}>{ch}</button>
              ))}
            </div>
            <div className="qul-clean-book-spread">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div className="qul-clean-book-sheet" key={letter+':'+page+':'+turn}
                  initial={reduced?false:{rotateY:direction>0?20:-20,opacity:.5}}
                  animate={{rotateY:0,opacity:1}}
                  exit={reduced?{opacity:0}:{rotateY:direction>0?-20:20,opacity:.3}}
                  transition={{duration:reduced?0:.4,ease:'easeInOut'}}>
                  <div className="qul-clean-book-page">{visible.slice(0,3).map(entry)}</div>
                  <div className="qul-clean-book-page">{visible.slice(3,6).map(entry)}</div>
                </motion.div>
              </AnimatePresence>
              {page>0&&<button type="button" className="qul-clean-book-corner previous"
                disabled={disabled} onClick={()=>change(letter,page-1,-1)}
                aria-label={ar?'الصفحة السابقة':'Previous page'} />}
              {page+1<pages&&<button type="button" className="qul-clean-book-corner next"
                disabled={disabled} onClick={()=>change(letter,page+1,1)}
                aria-label={ar?'الصفحة التالية':'Next page'}/>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </section>;
};