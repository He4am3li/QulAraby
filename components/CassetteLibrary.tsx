import React, { forwardRef, useImperativeHandle, useRef } from 'react';
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

export const CassetteLibrary = forwardRef<CassetteLibraryHandle, Props>(function CassetteLibrary(
  { tapes, activeTapeId, isPlaying, busy, onSelect }, ref
) {
  const cabinet = useRef<HTMLElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    selectTape(id) {
      if (busy) return;
      const button = [...(cabinet.current?.querySelectorAll<HTMLButtonElement>('[data-tape-id]') || [])]
        .find(item => item.dataset.tapeId === id);
      const viewport = drawer.current;
      if (button && viewport && (button.offsetTop < viewport.scrollTop ||
          button.offsetTop + button.offsetHeight > viewport.scrollTop + viewport.clientHeight)) {
        // Scroll only the cabinet, before measuring the cassette flight origin.
        viewport.scrollTop = Math.max(0, button.offsetTop - (viewport.clientHeight - button.offsetHeight) / 2);
      }
      button?.click();
    }
  }), [tapes, busy]);

  return <section ref={cabinet} className="qul-cassette-archive" aria-label="مكتبة الأشرطة" dir="rtl">
    <span className="qul-archive-glass" aria-hidden="true"/>
    <header className="qul-archive-header">
      <div><span className="qul-archive-eyebrow" dir="ltr">QUL / AUDIO ARCHIVE</span><h2>خزانة الحكايات</h2></div>
      <div className="qul-archive-count"><strong>{String(tapes.length).padStart(2, '0')}</strong><span>شريطًا</span></div>
    </header>
    <div className="qul-archive-divider"><span>اختر حكايتك</span><i aria-hidden="true"/><span dir="ltr">SIDE A</span></div>
    <div ref={drawer} className="qul-archive-drawer" aria-busy={busy} role="region" aria-label="الأشرطة، مرّر لاستعراض المزيد" tabIndex={0}>
      {tapes.map((tape, index) => {
        const active = activeTapeId === tape.id;
        const recording = getStoryForShelfTape(tape);
        return <button key={tape.id} type="button" data-tape-id={tape.id}
          className={'qul-archive-tape' + (active ? ' is-active' : '')}
          aria-label={tape.titleAr} aria-pressed={active} disabled={busy}
          onClick={event => onSelect(tape, event)}>
          <span className="qul-archive-position" dir="ltr">{String(index + 1).padStart(2, '0')} <span>{active ? (isPlaying ? 'PLAYING' : 'LOADED') : 'QUL'}</span></span>
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

  </section>;
});
