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

// --- Piece SVGs (Chess.com Neo + Neon Style) ---
const PieceIcon: React.FC<{ type: PieceType; color: Color }> = ({ type, color }) => {
  const isWhite = color === 'w';
  const glowColor = isWhite ? '#FACC15' : '#A855F7'; // Amber vs Purple
  const primaryColor = isWhite ? '#FFF7ED' : '#F3E8FF';
  const strokeColor = isWhite ? '#EAB308' : '#7E22CE';
  const filterId = `neon-glow-${color}-${type}`;

  const icons: Record<PieceType, React.ReactNode> = {
    p: (
      <svg viewBox="0 0 45 45" className="w-full h-full">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <path 
          d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" 
          fill={`url(#grad-${color})`}
          stroke={strokeColor}
          strokeWidth="1.5"
          filter={`url(#${filterId})`}
          className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
        />
      </svg>
    ),
    r: (
      <svg viewBox="0 0 45 45" className="w-full h-full">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path 
          d="M9 39h27v-3H9v3zM12 36h21l-1.5-4H13.5L12 36zM11 14V9h4v2h5V9h5v2h5V9h4v5h-23V9zM34 14l-3 3H14l-3-3M31 17v12.5l-2 2.5H16l-2-2.5V17M31 29.5l1.5 2.5h-20l1.5-2.5" 
          fill={`url(#grad-${color})`}
          stroke={strokeColor}
          strokeWidth="1.5"
          filter={`url(#${filterId})`}
          className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
        />
      </svg>
    ),
    n: (
      <svg viewBox="0 0 45 45" className="w-full h-full">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path 
          d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21 0 0 2 2.5 2 2.5s-1.5 1.5-2 1.5M24 18c.3 1.2 2 2.5 2 2.5s-1.5 1.5-2 1.5M9.5 25.5A.5.5 0 1 1 9 25a.5.5 0 0 1 .5.5zM15 15.5c4.5 2 5 2 5 2s1 1.5 1 3" 
          fill={`url(#grad-${color})`}
          stroke={strokeColor}
          strokeWidth="1.5"
          filter={`url(#${filterId})`}
          className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
        />
      </svg>
    ),
    b: (
      <svg viewBox="0 0 45 45" className="w-full h-full">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <g fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${filterId})`}>
          <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 0 2 .5 3s-3 3-3 3H11s-3.5-2-3-3 .5-3 .5-3z" />
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
          <path d="M17.5 26h10M15 30h15" fill="none" stroke={strokeColor} strokeWidth="1" />
        </g>
      </svg>
    ),
    q: (
      <svg viewBox="0 0 45 45" className="w-full h-full">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <g fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${filterId})`}>
          <path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM11 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM38 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12z" />
          <path d="M9 26c0 2 1.5 2 2.5 4 2.5 4 17 4 19.5 4 1 2 2.5 2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
          <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" />
        </g>
      </svg>
    ),
    k: (
      <svg viewBox="0 0 45 45" className="w-full h-full">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <g fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${filterId})`}>
          <path d="M22.5 11.63V6M20 8h5" stroke={strokeColor} strokeWidth="1.5" />
          <path d="M22.5 25s4.5-7.5 3-10c-1.5-2.5-6-2.5-6 0-1.5 2.5 3 10 3 10z" />
          <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-1-1-4-1-1.5 1.5-2.5 3.5-2.5 3.5s-4.5 0-4 5.5c-1 0-1 0-1 0V13c0-4-5-4-5 0v14s0 0-1 0c.5-5.5-4-5.5-4-5.5s-1-2-2.5-3.5c-3 0 0 0-4 1-3 6 6 10.5 6 10.5v7z" />
          <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" fill="none" />
        </g>
      </svg>
    ),
  };

  return icons[type];
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

        board.push(
          <div 
            key={square}
            onClick={() => onSquareClick(square)}
            onMouseEnter={() => setHoveredSquare(square)}
            onMouseLeave={() => setHoveredSquare(null)}
            className={`relative flex items-center justify-center cursor-pointer transition-all duration-300
              ${isDark ? 'bg-[#2a2a2a]' : 'bg-[#4a4a4a]'}
              ${isSelected ? 'ring-4 ring-amber-400/50 z-10' : ''}
              ${isLastMove ? 'bg-[#FACC15]/30' : ''}
              ${isCheck ? 'bg-rose-500/40' : ''}
              ${isDimmed ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}
            `}
            style={{
              boxShadow: isDark ? 'inset 0 0 20px rgba(0,0,0,0.3)' : 'inset 0 0 20px rgba(255,255,255,0.05)'
            }}
          >
            {/* Coordinates */}
            {file === 'a' && (
              <span className="absolute top-1 left-1 text-[8px] font-bold text-white/20 uppercase">{rank}</span>
            )}
            {rank === 1 && (
              <span className="absolute bottom-1 right-1 text-[8px] font-bold text-white/20 uppercase">{file}</span>
            )}

            {/* Valid Move Indicator */}
            {isValidMove && (
              <div className={`w-4 h-4 rounded-full ${isCapture ? 'border-4 border-rose-500/50' : 'bg-amber-400/30'}`} />
            )}

            {/* Piece */}
            {piece && (
              <motion.div 
                layoutId={square}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: 0,
                  y: 0
                }}
                whileHover={{ scale: 1.05 }}
                drag={!isGameOver && !isCPUThinking && piece.color === game.turn()}
                dragConstraints={boardRef}
                dragElastic={0.1}
                dragSnapToOrigin={true}
                onDragStart={() => onSquareClick(square)}
                onDragEnd={() => {
                  if (hoveredSquare && hoveredSquare !== square) {
                    onSquareClick(hoveredSquare);
                  }
                }}
                whileDrag={{ scale: 1.2, zIndex: 100 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 400, 
                  damping: 30,
                  duration: 0.2 
                }}
                className="w-4/5 h-4/5 p-1 cursor-grab active:cursor-grabbing"
              >
                <PieceIcon type={piece.type} color={piece.color} />
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
             initial={{ rotateX: 20, scale: 0.9, opacity: 0 }}
             animate={{ 
               rotateX: 15 + mousePos.y, 
               rotateY: mousePos.x,
               scale: 1, 
               opacity: 1 
             }}
             transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
             className="relative p-4 bg-[#1a1a1a] rounded-[32px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-[12px] border-[#252525] perspective-[1000px]"
             style={{ transformStyle: 'preserve-3d' }}
           >
             {/* Inner Board */}
             <div ref={boardRef} className="grid grid-cols-8 grid-rows-8 w-[600px] h-[600px] rounded-lg overflow-hidden border-4 border-black/50 shadow-inner">
               {renderBoard()}
             </div>
 
             {/* Side Labels */}
             <div className="absolute -left-10 top-0 bottom-0 flex flex-col justify-around py-8 text-[10px] font-black text-white/20">
               {[8,7,6,5,4,3,2,1].map(n => <span key={n}>{n}</span>)}
             </div>
             <div className="absolute -bottom-10 left-0 right-0 flex justify-around px-8 text-[10px] font-black text-white/20">
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
