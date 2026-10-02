import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess, Move } from 'chess.js';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  Trophy, 
  History, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  User,
  Cpu,
  Maximize2,
  Volume2,
  Home,
  Timer as TimerIcon,
  Brain,
  CheckCircle2,
  XCircle,
  BarChart2,
  X
} from 'lucide-react';
import { ChessPieceIcon } from './ChessPieces';

// --- Types ---
type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
type Color = 'w' | 'b';

interface ChessProProps {
  onBack?: () => void;
  lang?: 'ar' | 'en';
}

interface Question {
  q: string;
  a: string;
  options: string[];
}

// --- Educational Questions (Arabic Focus) ---
const QUESTIONS: Question[] = [
  { q: "ما هو جمع كلمة 'قلم'؟", a: "أقلام", options: ["قلمون", "أقلام", "قلمات", "أقلمة"] },
  { q: "ما هو ضد كلمة 'سريع'؟", a: "بطيء", options: ["قوي", "بطيء", "كبير", "صغير"] },
  { q: "أي من هذه الكلمات فعل؟", a: "كتب", options: ["كتاب", "مكتبة", "كاتب", "كتب"] },
  { q: "ما هو مرادف كلمة 'جميل'؟", a: "وسيم", options: ["قبيح", "وسيم", "طويل", "قصير"] },
  { q: "ما هي عاصمة المملكة العربية السعودية؟", a: "الرياض", options: ["جدة", "مكة", "الرياض", "الدمام"] },
  { q: "كم عدد أركان الإسلام؟", a: "5", options: ["3", "4", "5", "6"] },
  { q: "ما هو الحرف الذي يأتي بعد 'س'؟", a: "ش", options: ["ص", "ش", "ض", "ط"] },
  { q: "ما هو ناتج 7 + 8؟", a: "15", options: ["13", "14", "15", "16"] },
  { q: "ما هو مفرد كلمة 'أشجار'؟", a: "شجرة", options: ["شجر", "شجرة", "شجيرات", "مشجر"] },
  { q: "ما هو عكس كلمة 'نهار'؟", a: "ليل", options: ["شمس", "قمر", "ليل", "فجر"] },
  { q: "أين يقع المسجد الحرام؟", a: "مكة المكرمة", options: ["المدينة المنورة", "القدس", "مكة المكرمة", "الرياض"] },
  { q: "ما هو الحيوان الملقب بـ 'سفينة الصحراء'؟", a: "الجمل", options: ["الحصان", "الجمل", "الفيل", "الأسد"] },
  { q: "ما هو لون العلم السعودي؟", a: "أخضر", options: ["أبيض", "أخضر", "أحمر", "أزرق"] },
  { q: "ما هو الشهر الذي يصوم فيه المسلمون؟", a: "رمضان", options: ["شوال", "رمضان", "رجب", "شعبان"] },
];

// --- Evaluation Tables for AI ---
const PIECE_VALUES: Record<PieceType, number> = {
  p: 10, n: 30, b: 30, r: 50, q: 90, k: 900
};

const PAWN_EVAL_WHITE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_EVAL = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

// --- Custom 3D Sculpted Chess Pieces (Matching Miniature Set) ---
const PieceIcon = ChessPieceIcon;

// 3D Piece Dimensions, Offsets and Shadows for realistic upright posture
const PIECE_3D_CONFIG: Record<PieceType, { height: number; width: number; verticalOffset: number; shadowWidth: number }> = {
  p: { height: 72, width: 56, verticalOffset: -6, shadowWidth: 46 },  // Pawn: Armored Knight
  r: { height: 78, width: 58, verticalOffset: -8, shadowWidth: 48 },  // Rook: Stone Citadel
  n: { height: 82, width: 62, verticalOffset: -10, shadowWidth: 50 }, // Knight: Stallion Bust
  b: { height: 84, width: 64, verticalOffset: -10, shadowWidth: 52 }, // Bishop: Elephant Bust
  q: { height: 90, width: 66, verticalOffset: -12, shadowWidth: 54 }, // Queen: Empress Tiara Bust
  k: { height: 96, width: 68, verticalOffset: -14, shadowWidth: 56 }, // King: Emperor Crown Bust
};

// --- Main Component ---
export const ChessPro: React.FC<ChessProProps> = ({ onBack }) => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [captured, setCaptured] = useState<{ w: PieceType[]; b: PieceType[] }>({ w: [], b: [] });
  const [isCPUThinking, setIsCPUThinking] = useState(false);
  const [gameMode, setGameMode] = useState<'pvp' | 'pvc'>('pvc');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null);
  const [draggingSquare, setDraggingSquare] = useState<string | null>(null);
  const [viewMode3D, setViewMode3D] = useState<'cinematic' | 'tactical' | 'flat'>('cinematic');
  const [customTilt, setCustomTilt] = useState<number>(36);
  const boardRef = useRef<HTMLDivElement>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [whiteTime, setWhiteTime] = useState(600); // 10 mins
  const [blackTime, setBlackTime] = useState(600);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [pendingMove, setPendingMove] = useState<{ from: string; to: string } | null>(null);
  const [analysisMode, setAnalysisMode] = useState(false);
  const [usedQuestionIndices, setUsedQuestionIndices] = useState<number[]>([]);

  const audioCtx = useRef<AudioContext | null>(null);

  // Timers logic
  useEffect(() => {
    if (isGameOver || isQuestionModalOpen) return;
    
    const interval = setInterval(() => {
      if (game.turn() === 'w') {
        setWhiteTime(t => Math.max(0, t - 1));
      } else {
        setBlackTime(t => Math.max(0, t - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game, isGameOver, isQuestionModalOpen]);

  // Handle mouse move for subtle 3D tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 10,
        y: (e.clientY / window.innerHeight - 0.5) * 10,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // --- Sound Effects (Procedural) ---
  const playSound = (type: 'move' | 'capture' | 'check' | 'gameover') => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'move') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'capture') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'check') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  };

  // --- AI Logic (Minimax) ---
  const evaluateBoard = (gameInstance: Chess) => {
    let totalEvaluation = 0;
    const board = gameInstance.board();
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          let val = PIECE_VALUES[piece.type];
          // Add positional bonuses
          if (piece.type === 'p') {
            val += piece.color === 'w' ? PAWN_EVAL_WHITE[i][j] : PAWN_EVAL_WHITE[7-i][j];
          } else if (piece.type === 'n') {
            val += KNIGHT_EVAL[i][j];
          }
          totalEvaluation += piece.color === 'w' ? val : -val;
        }
      }
    }
    return totalEvaluation;
  };

  const minimax = (gameInstance: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
    if (depth === 0) return -evaluateBoard(gameInstance);

    const moves = gameInstance.moves();
    if (isMaximizing) {
      let bestEval = -Infinity;
      for (const move of moves) {
        gameInstance.move(move);
        const evaluation = minimax(gameInstance, depth - 1, alpha, beta, false);
        gameInstance.undo();
        bestEval = Math.max(bestEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return bestEval;
    } else {
      let bestEval = Infinity;
      for (const move of moves) {
        gameInstance.move(move);
        const evaluation = minimax(gameInstance, depth - 1, alpha, beta, true);
        gameInstance.undo();
        bestEval = Math.min(bestEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return bestEval;
    }
  };

  const getBestMove = (gameInstance: Chess) => {
    const moves = gameInstance.moves();
    let bestMove = null;
    let bestValue = -Infinity;

    // Shuffle moves to avoid repetitive play
    moves.sort(() => Math.random() - 0.5);

    for (const move of moves) {
      gameInstance.move(move);
      const boardValue = minimax(gameInstance, difficulty === 'hard' ? 3 : 2, -Infinity, Infinity, false);
      gameInstance.undo();
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }
    return bestMove;
  };

  const makeCPUMove = useCallback(() => {
    if (game.isGameOver() || game.turn() === 'w') return;

    setIsCPUThinking(true);
    
    setTimeout(() => {
      const bestMove = getBestMove(new Chess(game.fen()));
      if (!bestMove) return;

      const moveResult = game.move(bestMove);
      
      if (moveResult) {
        if (moveResult.captured) {
          setCaptured(prev => ({
            ...prev,
            [moveResult.color === 'w' ? 'b' : 'w']: [...prev[moveResult.color === 'w' ? 'b' : 'w'], moveResult.captured]
          }));
          playSound('capture');
        } else {
          playSound('move');
        }

        setGame(new Chess(game.fen()));
        setLastMove({ from: moveResult.from, to: moveResult.to });
        setHistory(prev => [...prev, moveResult.san]);
        
        if (game.isCheck()) playSound('check');
        if (game.isGameOver()) handleGameOver();
      }
      setIsCPUThinking(false);
    }, 800);
  }, [game, difficulty]);

  useEffect(() => {
    if (gameMode === 'pvc' && game.turn() === 'b' && !isGameOver) {
      makeCPUMove();
    }
  }, [game, gameMode, isGameOver, makeCPUMove]);

  const handleGameOver = () => {
    setIsGameOver(true);
    playSound('gameover');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FACC15', '#FFD700', '#FFFFFF']
    });
    if (game.isCheckmate()) {
      setWinner(game.turn() === 'w' ? 'Black' : 'White');
    } else if (game.isDraw()) {
      setWinner('Draw');
    }
  };

  const onSquareClick = (square: string) => {
    if (isGameOver || isCPUThinking || isQuestionModalOpen) return;

    const piece = game.get(square as any);

    // If selecting own piece
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square: square as any, verbose: true });
      setValidMoves(moves.map(m => m.to));
      return;
    }

    // If clicking a valid move square
    if (selectedSquare && validMoves.includes(square)) {
      const isPromotion = (game.get(selectedSquare as any)?.type === 'p') && 
                          ((game.turn() === 'w' && square[1] === '8') || (game.turn() === 'b' && square[1] === '1'));

      if (isPromotion) {
        setPromotionPending({ from: selectedSquare, to: square });
        return;
      }

      // Educational Question Logic
      if (game.turn() === 'w') {
        let availableIndices = QUESTIONS.map((_, i) => i).filter(i => !usedQuestionIndices.includes(i));
        if (availableIndices.length === 0) {
          // Reset if all questions used
          availableIndices = QUESTIONS.map((_, i) => i);
          setUsedQuestionIndices([]);
        }
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        const randomQ = QUESTIONS[randomIndex];
        
        setUsedQuestionIndices(prev => [...prev, randomIndex]);
        setCurrentQuestion(randomQ);
        setPendingMove({ from: selectedSquare, to: square });
        setIsQuestionModalOpen(true);
      } else {
        executeMove(selectedSquare, square);
      }
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const handleQuestionAnswer = (answer: string) => {
    const targetMove = pendingMove;
    setIsQuestionModalOpen(false);
    setPendingMove(null);

    if (currentQuestion && answer === currentQuestion.a) {
      if (targetMove) {
        executeMove(targetMove.from, targetMove.to);
      }
    } else {
      // Wrong answer penalty: close modal and reset selection
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const executeMove = (from: string, to: string, promotion?: string) => {
    try {
      const gameCopy = new Chess(game.fen());
      const moveOptions: any = { from, to };
      if (promotion) moveOptions.promotion = promotion;

      const move = gameCopy.move(moveOptions);

      if (move) {
        if (move.captured) {
          setCaptured(prev => ({
            ...prev,
            [move.color === 'w' ? 'b' : 'w']: [...prev[move.color === 'w' ? 'b' : 'w'], move.captured]
          }));
          playSound('capture');
        } else {
          playSound('move');
        }

        setGame(gameCopy);
        setLastMove({ from: move.from, to: move.to });
        setHistory(prev => [...prev, move.san]);
        setSelectedSquare(null);
        setValidMoves([]);
        setPromotionPending(null);

        if (gameCopy.isCheck()) playSound('check');
        if (gameCopy.isGameOver()) handleGameOver();
      }
    } catch (e) {
      console.warn("Move execution skipped or invalid:", from, to);
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setHistory([]);
    setCaptured({ w: [], b: [] });
    setIsGameOver(false);
    setWinner(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- 3D Perspective Calculations ---
  const boardTiltX = viewMode3D === 'cinematic' 
    ? (customTilt + mousePos.y * 4) 
    : viewMode3D === 'tactical' 
      ? (22 + mousePos.y * 2.5) 
      : 0;
  const boardTiltY = viewMode3D === 'flat' ? 0 : (mousePos.x * 4);
  const pieceTiltX = viewMode3D === 'flat' ? 0 : -boardTiltX;

  // --- Render Board ---
  const renderBoard = () => {
    const board = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

    for (const rank of ranks) {
      for (const file of files) {
        const square = `${file}${rank}`;
        const piece = game.get(square as any);
        const isDark = (files.indexOf(file) + ranks.indexOf(rank)) % 2 !== 0;
        const isSelected = selectedSquare === square;
        const isValidMove = validMoves.includes(square);
        const isLastMove = lastMove?.from === square || lastMove?.to === square;
        const isCheck = game.isCheck() && piece?.type === 'k' && piece?.color === game.turn();
        const isCapture = isValidMove && piece !== null;
        
        // Focus Mode: Dim non-player pieces during player's turn
        const isPlayerTurn = game.turn() === 'w';
        const isDimmed = isPlayerTurn && piece && piece.color === 'b' && !isSelected && !isLastMove && !isCheck;

        const rankIndex = ranks.indexOf(rank); // 0 (rank 8, top) to 7 (rank 1, bottom)
        const isThisDragging = draggingSquare === square;
        const config = piece ? PIECE_3D_CONFIG[piece.type] : null;
        
        // Stacking order: Rank 1 (closest to player) has highest z-index so standing pieces correctly overlap pieces behind them
        const baseZIndex = (rankIndex + 1) * 10;
        const squareZIndex = isThisDragging ? 999 : isSelected ? 300 : baseZIndex;

        board.push(
          <div 
            key={square}
            onClick={() => onSquareClick(square)}
            onMouseEnter={() => setHoveredSquare(square)}
            onMouseLeave={() => setHoveredSquare(null)}
            className={`relative flex items-center justify-center cursor-pointer transition-colors duration-200
              ${isDark ? 'bg-[#241e19]' : 'bg-[#3d332a]'}
              ${isSelected ? 'ring-4 ring-amber-400/80' : ''}
              ${isLastMove ? 'bg-amber-700/35' : ''}
              ${isCheck ? 'bg-rose-600/40' : ''}
              ${isDimmed ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}
            `}
            style={{
              boxShadow: isDark 
                ? 'inset 0 0 16px rgba(0,0,0,0.5), inset 0 0 2px rgba(0,0,0,0.9)' 
                : 'inset 0 0 16px rgba(0,0,0,0.2), inset 0 0 2px rgba(255,255,255,0.08)',
              transformStyle: 'preserve-3d',
              zIndex: squareZIndex,
            }}
          >
            {/* Coordinates */}
            {file === 'a' && (
              <span className="absolute top-1 left-1.5 text-[8px] font-black text-amber-200/30 uppercase pointer-events-none select-none">{rank}</span>
            )}
            {rank === 1 && (
              <span className="absolute bottom-1 right-1.5 text-[8px] font-black text-amber-200/30 uppercase pointer-events-none select-none">{file}</span>
            )}

            {/* Valid Move Indicator */}
            {isValidMove && (
              <div 
                className={`absolute z-20 rounded-full transition-all pointer-events-none ${
                  isCapture 
                    ? 'w-10 h-10 border-4 border-rose-500/80 bg-rose-500/25 animate-pulse' 
                    : 'w-5 h-5 bg-amber-400/70 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                }`}
                style={{ transform: 'translateZ(4px)' }}
              />
            )}

            {/* 3D Contact Pedestal Shadow on the Tile Floor */}
            {piece && config && viewMode3D !== 'flat' && (
              <div 
                className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full pointer-events-none transition-all duration-300"
                style={{
                  width: `${config.shadowWidth}px`,
                  height: '14px',
                  background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 55%, transparent 75%)',
                  transform: 'scaleY(0.45)',
                  filter: isThisDragging ? 'blur(5px) scale(1.4)' : 'blur(1.5px)',
                  opacity: isThisDragging ? 0.35 : 0.9,
                }}
              />
            )}

            {/* Standing 3D Sculpted Piece */}
            {piece && config && (
              <motion.div 
                layoutId={square}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: 0,
                  y: 0
                }}
                whileHover={{ scale: 1.06 }}
                drag={!isGameOver && !isCPUThinking && piece.color === game.turn()}
                dragConstraints={boardRef}
                dragElastic={0.1}
                dragSnapToOrigin={true}
                onDragStart={() => {
                  setDraggingSquare(square);
                  onSquareClick(square);
                }}
                onDragEnd={() => {
                  setDraggingSquare(null);
                  if (hoveredSquare && hoveredSquare !== square) {
                    onSquareClick(hoveredSquare);
                  }
                }}
                whileDrag={{ scale: 1.25, zIndex: 999 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 400, 
                  damping: 30,
                  duration: 0.2 
                }}
                className="absolute bottom-1 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing flex items-end justify-center select-none"
                style={{
                  width: `${config.width}px`,
                  height: `${config.height}px`,
                  transformOrigin: 'bottom center',
                  transformStyle: 'preserve-3d',
                }}
              >
                <motion.div
                  animate={{ 
                    rotateX: pieceTiltX,
                    y: isThisDragging ? -26 : config.verticalOffset,
                    translateZ: isThisDragging ? 40 : 12,
                    scale: isThisDragging ? 1.15 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="w-full h-full flex items-end justify-center filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.6)]"
                  style={{
                    transformOrigin: 'bottom center',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <PieceIcon type={piece.type} color={piece.color} />
                </motion.div>
              </motion.div>
            )}
          </div>
        );
      }
    }
    return board;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0f172a] to-[#064e3b] flex flex-col items-center justify-center overflow-hidden font-sans select-none">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm" />
      <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)" />

      {/* Main Game Layout */}
      <div className="relative flex gap-12 items-center justify-center z-10 -translate-x-48">
        {/* Left Sidebar - Captured Black Pieces */}
        <div className="flex flex-col gap-6 w-32">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center gap-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shadow-inner">
              <Cpu size={32} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">CPU</p>
              <div className="flex items-center gap-2 text-white font-mono text-2xl font-black">
                <TimerIcon size={18} className="text-slate-500" />
                {formatTime(blackTime)}
              </div>
            </div>
            <div className="flex flex-wrap gap-1 justify-center min-h-[60px]">
              {captured.w.map((p, i) => (
                <motion.div 
                   key={i} 
                   initial={{ scale: 0, opacity: 0 }}
                   animate={{ scale: 1, opacity: 0.6 }}
                   className="w-6 h-6"
                 >
                   <PieceIcon type={p} color="w" />
                 </motion.div>
               ))}
             </div>
           </div>
         </div>
 
         {/* Board Container */}
         <div className="relative group">
           {/* Board Glow */}
           <div className="absolute -inset-8 bg-amber-500/10 rounded-[40px] blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
           
           {/* 3D Board Frame */}
           <motion.div 
             initial={{ rotateX: 25, scale: 0.9, opacity: 0 }}
             animate={{ 
               rotateX: boardTiltX, 
               rotateY: boardTiltY,
               scale: 1, 
               opacity: 1 
             }}
             transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
             className="relative p-6 bg-gradient-to-br from-[#1c1815] to-[#120f0d] rounded-[36px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.95),0_0_0_2px_rgba(255,255,255,0.06)] border-[14px] border-[#2a221b] perspective-[1200px]"
             style={{ transformStyle: 'preserve-3d' }}
           >
             {/* Board Bevel Thickness (3D Edge Slab) */}
             {viewMode3D !== 'flat' && (
               <div 
                 className="absolute inset-x-0 -bottom-5 h-5 bg-gradient-to-b from-[#18130f] to-[#0a0806] rounded-b-[24px] border-b-2 border-amber-950/40 pointer-events-none shadow-2xl"
                 style={{ transform: 'rotateX(-90deg)', transformOrigin: 'top center' }}
               />
             )}

             {/* Inner Board - Preserves 3D and allows standing pieces to project vertically */}
             <div ref={boardRef} className="grid grid-cols-8 grid-rows-8 w-[600px] h-[600px] rounded-xl relative border-4 border-black/80 shadow-[inset_0_0_35px_rgba(0,0,0,0.85)]" style={{ transformStyle: 'preserve-3d' }}>
               {renderBoard()}
             </div>
 
             {/* Side Labels */}
             <div className="absolute -left-6 top-6 bottom-6 flex flex-col justify-around py-2 text-[11px] font-black text-amber-200/40 pointer-events-none select-none">
               {[8,7,6,5,4,3,2,1].map(n => <span key={n}>{n}</span>)}
             </div>
             <div className="absolute -bottom-6 left-6 right-6 flex justify-around px-2 text-[11px] font-black text-amber-200/40 pointer-events-none select-none">
               {['A','B','C','D','E','F','G','H'].map(l => <span key={l}>{l}</span>)}
             </div>
           </motion.div>
         </div>
 
         {/* Right Sidebar - Captured White Pieces */}
         <div className="flex flex-col gap-6 w-32">
           <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center gap-6 shadow-2xl">
             <div className="w-16 h-16 rounded-full bg-amber-900/20 border border-amber-500/20 flex items-center justify-center shadow-inner">
               <User size={32} className="text-amber-400" />
             </div>
             <div className="text-center">
               <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Player</p>
               <div className="flex items-center gap-2 text-white font-mono text-2xl font-black">
                 <TimerIcon size={18} className="text-amber-500" />
                 {formatTime(whiteTime)}
               </div>
             </div>
             <div className="flex flex-wrap gap-1 justify-center min-h-[60px]">
               {captured.b.map((p, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ scale: 0, opacity: 0 }}
                   animate={{ scale: 1, opacity: 0.6 }}
                   className="w-6 h-6"
                 >
                   <PieceIcon type={p} color="b" />
                 </motion.div>
               ))}
             </div>
           </div>
         </div>

        {/* Right Side Control Panel */}
        <div className="absolute left-[calc(100%+4rem)] top-0 bottom-0 flex flex-col gap-4 justify-center w-64">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex flex-col gap-4 shadow-2xl">
            {/* 3D Camera Perspective Controls */}
            <div className="flex flex-col gap-2 bg-black/25 p-3 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between px-1">
                <span className="text-amber-400 text-[10px] font-black uppercase tracking-wider">منظور العرض 3D</span>
                <span className="text-white/40 font-mono text-[10px]">{Math.round(boardTiltX)}°</span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => { setViewMode3D('cinematic'); setCustomTilt(36); }}
                  className={`py-1.5 px-1 text-[9px] font-black rounded-lg transition-all ${
                    viewMode3D === 'cinematic' ? 'bg-amber-500 text-black shadow-md font-extrabold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  3D سينمائي
                </button>
                <button
                  onClick={() => { setViewMode3D('tactical'); setCustomTilt(22); }}
                  className={`py-1.5 px-1 text-[9px] font-black rounded-lg transition-all ${
                    viewMode3D === 'tactical' ? 'bg-amber-500 text-black shadow-md font-extrabold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  3D تكتيكي
                </button>
                <button
                  onClick={() => { setViewMode3D('flat'); setCustomTilt(0); }}
                  className={`py-1.5 px-1 text-[9px] font-black rounded-lg transition-all ${
                    viewMode3D === 'flat' ? 'bg-amber-500 text-black shadow-md font-extrabold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  2D علوي
                </button>
              </div>

              {viewMode3D !== 'flat' && (
                <div className="flex items-center gap-2 pt-1 px-1">
                  <span className="text-[9px] text-white/50 font-bold whitespace-nowrap">إمالة:</span>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    value={customTilt}
                    onChange={(e) => {
                      setCustomTilt(Number(e.target.value));
                      setViewMode3D('cinematic');
                    }}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest px-2">Difficulty</p>
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3">
                <Cpu size={16} className="text-white/60" />
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="bg-transparent text-white font-bold text-xs uppercase outline-none cursor-pointer w-full"
                >
                  <option value="easy" className="bg-[#1a1a1a]">Easy</option>
                  <option value="medium" className="bg-[#1a1a1a]">Medium</option>
                  <option value="hard" className="bg-[#1a1a1a]">Hard</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest px-2">Status</p>
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full animate-pulse ${game.turn() === 'w' ? 'bg-amber-400' : 'bg-slate-400'}`} />
                <span className="text-white font-bold text-xs uppercase truncate">
                  {game.turn() === 'w' ? 'White Turn' : 'Black Turn'}
                </span>
              </div>
            </div>

            <div className="h-px bg-white/10 my-2" />

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetGame}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
            >
              <RotateCcw size={16} /> Reset Match
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAnalysisMode(!analysisMode)}
              className={`w-full py-4 border border-white/10 rounded-2xl text-white font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 transition-all ${analysisMode ? 'bg-blue-500/20 border-blue-500/50' : 'bg-white/5 hover:bg-white/10'}`}
            >
              <BarChart2 size={16} /> Analysis
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="w-full py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-rose-500/20 transition-all"
            >
              <Home size={16} /> Exit Game
            </motion.button>
          </div>
        </div>
      </div>

      {/* Educational Question Modal */}
      <AnimatePresence>
        {isQuestionModalOpen && currentQuestion && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-xl w-full bg-[#1a1a1a] border border-white/10 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <Brain size={24} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-white font-black text-xl uppercase tracking-tighter">Knowledge Challenge</h3>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Answer to make your move</p>
                </div>
              </div>

              <p className="text-2xl text-white font-bold mb-12 leading-relaxed text-center">
                {currentQuestion.q}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(59,130,246,0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuestionAnswer(opt)}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-lg hover:border-blue-500/50 transition-all"
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Overlay */}
      <AnimatePresence>
        {analysisMode && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute right-12 top-12 bottom-12 w-80 bg-[#1a1a1a]/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 flex flex-col gap-6 z-50 shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <BarChart2 size={20} className="text-blue-500" />
                </div>
                <h3 className="text-white font-black text-lg uppercase tracking-tighter italic">Analysis</h3>
              </div>
              <button 
                onClick={() => setAnalysisMode(false)}
                className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-2">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <History size={48} className="mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">No moves yet</p>
                </div>
              ) : (
                history.map((move, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-white/20 font-mono text-[10px] w-4">{Math.floor(i/2) + 1}.</span>
                      <span className="text-white font-bold text-sm">{move}</span>
                    </div>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded ${i % 2 === 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-400'}`}>
                      {i % 2 === 0 ? 'WHITE' : 'BLACK'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-6 border-t border-white/10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">
                <span>Advantage</span>
                <span className={evaluateBoard(game) > 0 ? 'text-amber-500' : 'text-slate-400'}>
                  {evaluateBoard(game) > 0 ? 'White' : 'Black'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                <motion.div 
                  initial={{ width: '50%' }}
                  animate={{ width: `${50 + (evaluateBoard(game) / 10)}%` }}
                  className="h-full bg-amber-500 transition-all duration-500" 
                />
                <div className="flex-1 bg-slate-600" />
              </div>
              <p className="text-[8px] text-white/20 mt-2 text-center font-bold uppercase tracking-widest">
                Evaluation: {(evaluateBoard(game) / 100).toFixed(1)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="max-w-md w-full bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-[3rem] p-12 text-center shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
            >
              <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(251,191,36,0.3)] relative">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Trophy size={48} className="text-amber-900" />
                </motion.div>
                {game.isCheckmate() && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-4 -right-4 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg"
                  >
                    CHECKMATE
                  </motion.div>
                )}
              </div>
              <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">Match Over</h2>
              <p className="text-white/60 mb-12 text-lg">
                {winner === 'Draw' ? "It's a draw!" : `${winner} wins by checkmate!`}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="w-full py-5 bg-amber-400 text-amber-900 font-black text-lg rounded-2xl shadow-xl hover:bg-amber-300 transition-all uppercase tracking-widest"
              >
                New Match
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promotion Modal */}
      <AnimatePresence>
        {promotionPending && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#1a1a1a] border border-white/10 p-8 rounded-3xl flex gap-6 shadow-2xl"
            >
              {(['q', 'r', 'b', 'n'] as PieceType[]).map(type => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => executeMove(promotionPending.from, promotionPending.to, type)}
                  className="w-20 h-20 p-2 rounded-2xl border border-white/5 transition-all"
                >
                  <PieceIcon type={type} color={game.turn()} />
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CPU Thinking Indicator */}
      <AnimatePresence>
        {isCPUThinking && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-32 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 -translate-x-32"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div 
                  key={i}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                />
              ))}
            </div>
            <span className="text-slate-400 font-black text-[10px] tracking-[0.2em] uppercase">CPU is thinking...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
