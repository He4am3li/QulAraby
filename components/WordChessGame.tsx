import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, AlertCircle, Hash, Target } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface Piece {
  type: 'rook' | 'bishop' | 'knight';
  word: string;
}

interface WordChessProps {
  boardSize?: number;
  initialPos: Position;
  targetPos: Position;
  pieceType: 'rook' | 'bishop' | 'knight';
  gridData: string[][];
  onWin: () => void;
  lang?: 'ar' | 'en';
}

export const WordChessGame = ({
  boardSize = 5,
  initialPos,
  targetPos,
  pieceType,
  gridData,
  onWin,
  lang = 'ar'
}: WordChessProps) => {
  const [currentPos, setCurrentPos] = useState<Position>(initialPos);
  const [moves, setMoves] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isValidMove = (from: Position, to: Position, type: string) => {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    switch (type) {
      case 'rook':
        return dx === 0 || dy === 0;
      case 'bishop':
        return dx === dy;
      case 'knight':
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
      default:
        return false;
    }
  };

  const handleCellClick = (x: number, y: number) => {
    if (x === currentPos.x && y === currentPos.y) return;

    if (isValidMove(currentPos, { x, y }, pieceType)) {
      setCurrentPos({ x, y });
      setMoves(prev => prev + 1);
      setError(null);
      
      if (x === targetPos.x && y === targetPos.y) {
        setTimeout(onWin, 600);
      }
    } else {
      setError(lang === 'ar' ? 'حركة غير مسموح بها لهذه القطعة!' : 'Invalid move for this piece type!');
      setTimeout(() => setError(null), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      {/* HUD Controller */}
      <div className="flex items-center gap-6 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col items-center px-4">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{lang === 'ar' ? 'الحركات' : 'Moves'}</span>
              <span className="text-xl font-black text-slate-900">{moves}</span>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="flex items-center gap-3 px-4">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Shield size={16} />
              </div>
              <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{lang === 'ar' ? 'نوع الحركة' : 'Move Type'}</span>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{pieceType}</span>
              </div>
          </div>
      </div>

      {/* Board Container */}
      <div 
        className="bg-slate-50 p-3 rounded-[2.5rem] border-2 border-slate-100 shadow-inner relative"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gap: '8px'
        }}
      >
        {Array.from({ length: boardSize * boardSize }).map((_, idx) => {
          const x = idx % boardSize;
          const y = Math.floor(idx / boardSize);
          const isTarget = x === targetPos.x && y === targetPos.y;
          const isCurrent = x === currentPos.x && y === currentPos.y;
          const content = gridData[y]?.[x] || '';

          return (
            <motion.button
              key={`${x}-${y}`}
              whileHover={{ scale: 0.96 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleCellClick(x, y)}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[1.8rem] flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden border-2 ${
                isCurrent 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-500/20 z-10' 
                  : isTarget 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 animate-pulse' 
                  : 'bg-white border-white hover:border-slate-200 text-slate-900'
              }`}
            >
              {isCurrent && (
                <motion.div 
                   layoutId="piece-shadow"
                   className="absolute inset-0 bg-blue-500/20 blur-xl"
                />
              )}
              
              <span className="text-[10px] md:text-xs font-black arabic-font relative z-10 leading-tight p-2 text-center">
                {content}
              </span>
              
              {isTarget && !isCurrent && (
                <Target size={14} className="opacity-40" />
              )}
              
              {isCurrent && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-white/20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest"
                >
                  {pieceType}
                </motion.div>
              )}
            </motion.button>
          );
        })}

        <AnimatePresence>
          {error && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl shadow-rose-500/20 whitespace-nowrap"
            >
                <AlertCircle size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-xs text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
             {lang === 'ar' 
               ? `تحرك باستخدام منطق "${pieceType}" لتصل إلى المربع الصحيح` 
               : `Move using "${pieceType}" logic to reach the target cell`}
          </p>
      </div>
    </div>
  );
};
