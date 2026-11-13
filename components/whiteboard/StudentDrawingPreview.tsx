import React from 'react';
import type { WhiteboardElement } from '../../types/whiteboard';

/** Compact, view-only preview of a student's submitted drawing. */
export const StudentDrawingPreview: React.FC<{ elements: WhiteboardElement[] }> = ({ elements }) => {
  const positions = elements.flatMap(el => [
    ...(el.points || []),
    ...(typeof el.x === 'number' && typeof el.y === 'number'
      ? [{ x: el.x, y: el.y }] : [])
  ]);
  const maxX = Math.max(800, ...positions.map(p => p.x + 100));
  const maxY = Math.max(500, ...positions.map(p => p.y + 100));
  return (
    <svg viewBox={'0 0 ' + maxX + ' ' + maxY} role="img" aria-label="معاينة رسم الطالب"
      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-50"
      style={{ maxHeight: 260 }}>
      {elements.slice(0, 150).map(el => {
        const color = el.color || '#334155';
        if (el.points?.length && ['path', 'highlighter', 'line', 'arrow'].includes(el.type)) {
          return <polyline key={el.id}
            points={el.points.map(p => p.x + ',' + p.y).join(' ')}
            fill="none" stroke={color} opacity={el.type === 'highlighter' ? 0.45 : 1}
            strokeWidth={el.strokeWidth || 3} strokeLinecap="round" strokeLinejoin="round" />;
        }
        if (el.type === 'image' && el.src) {
          return <image key={el.id} href={el.src} x={el.x || 0} y={el.y || 0}
            width={el.width || 220} height={el.height || 160} />;
        }
        if (el.type === 'text' || el.type === 'note') {
          return <text key={el.id} x={el.x || 0} y={el.y || 20} direction="rtl"
            fill={el.type === 'note' ? '#92400e' : color}
            fontSize={el.fontSize || 22}>{(el.text || '').slice(0, 200)}</text>;
        }
        if (el.type === 'rect' || el.type === 'circle') {
          return el.type === 'rect'
            ? <rect key={el.id} x={el.x || 0} y={el.y || 0} width={el.width || 100}
                height={el.height || 70} fill="none" stroke={color} strokeWidth={el.strokeWidth || 3} />
            : <circle key={el.id} cx={el.x || 0} cy={el.y || 0} r={el.width || 30}
                fill="none" stroke={color} strokeWidth={el.strokeWidth || 3} />;
        }
        return null;
      })}
    </svg>
  );
};
