import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ShelfTape, getStoryForShelfTape } from '../src/data/shelfCassettes';
import './CassetteLibrary.css';

export type CassetteLibraryHandle = { selectTape: (id: string) => void };
type Props = {
  tapes: ShelfTape[];
  activeTapeId: string | null;
  isPlaying: boolean;
  busy: boolean;
  onSelect: (tape: ShelfTape, event: React.MouseEvent<HTMLButtonElement>) => void;
};
const PAGE_SIZE = 6;

export const CassetteLibrary = forwardRef<CassetteLibraryHandle, Props>(function CassetteLibrary(
  { tapes, activeTapeId, isPlaying, busy, onSelect }, ref
) {
  const [page, setPage] = useState(0);
  const cabinet = useRef<HTMLElement>(null);
  const totalPages = Math.max(1, Math.ceil(tapes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const start = currentPage * PAGE_SIZE;
  useImperativeHandle(ref, () => ({
    selectTape(id) {
      const index = tapes.findIndex(tape => tape.id === id);
      if (index < 0 || busy) return;
      // Render the correct drawer before measuring the cassette's flight origin.
      flushSync(() => setPage(Math.floor(index / PAGE_SIZE)));
      const button = [...(cabinet.current?.querySelectorAll<HTMLButtonElement>('[data-tape-id]') || [])]
        .find(item => item.dataset.tapeId === id);
      button?.click();
    }
  }), [tapes, busy]);

  return <section ref={cabinet} className="qul-cassette-archive" aria-label="مكتبة الأشرطة" dir="rtl">
    <header className="qul-archive-header">
      <div><span className="qul-archive-eyebrow" dir="ltr">QUL / AUDIO ARCHIVE</span><h2>خزانة الحكايات</h2></div>
      <div className="qul-archive-count"><strong>{String(tapes.length).padStart(2, '0')}</strong><span>شريطًا</span></div>
    </header>
    <div className="qul-archive-divider"><span>اختر حكايتك</span><i aria-hidden="true"/><span dir="ltr">SIDE A</span></div>
    <div className="qul-archive-drawer" aria-busy={busy}>
      {tapes.slice(start, start + PAGE_SIZE).map((tape, index) => {
        const active = activeTapeId === tape.id;
        const recording = getStoryForShelfTape(tape);
        return <button key={tape.id} type="button" data-tape-id={tape.id}
          className={'qul-archive-tape' + (active ? ' is-active' : '')}
          aria-label={tape.titleAr} aria-pressed={active} disabled={busy}
          onClick={event => onSelect(tape, event)}>
          <span className="qul-archive-position" dir="ltr">{String(start + index + 1).padStart(2, '0')} <span>{active ? (isPlaying ? 'PLAYING' : 'LOADED') : 'QUL'}</span></span>
          <span className={`qul-archive-shell bg-gradient-to-r ${tape.tapeColor}`} aria-hidden="true">
            <span className="qul-archive-brand" dir="ltr"><b>{tape.brand}</b><span>{tape.model}</span></span>
            <span className="qul-archive-window">
              <i className={active && isPlaying ? 'qul-archive-reel spinning' : 'qul-archive-reel'}/>
              <span className="qul-archive-tape-line"/>
              <i className={active && isPlaying ? 'qul-archive-reel spinning' : 'qul-archive-reel'}/>
            </span>
            <span className="qul-archive-shell-foot" dir="ltr"><span>A</span><span>STEREO</span><span>{tape.cassetteNumber}</span></span>
          </span>
          <span className="qul-archive-label"><strong>{tape.titleAr}</strong><small dir="ltr">{recording?.durationApprox || 'AUDIO'}<i aria-hidden="true"/></small></span>
        </button>;
      })}
      {!tapes.length && <p className="qul-archive-empty">لا توجد أشرطة لهذا المستوى.</p>}
    </div>
    <footer className="qul-archive-footer">
      <button type="button" aria-label="الدرج السابق" disabled={currentPage === 0 || busy} onClick={() => setPage(currentPage - 1)}><ChevronRight size={17}/></button>
      <span role="status">الدرج <b>{currentPage + 1}</b> من {totalPages}</span>
      <button type="button" aria-label="الدرج التالي" disabled={currentPage >= totalPages - 1 || busy} onClick={() => setPage(currentPage + 1)}><ChevronLeft size={17}/></button>
    </footer>
  </section>;
});
