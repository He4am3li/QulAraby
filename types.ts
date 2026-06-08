
export enum MasteryLevel {
  NEW = 1,
  LEARNING = 2,
  FLUENT = 3,
  MASTERED = 4
}

export type WordType = 'noun' | 'verb' | 'particle';

export interface LinguisticAnalysis {
  type: WordType;
  details_ar: {
    category: string; 
    sub_category: string; 
    root?: string;
    weight?: string;
    rule: string;
    example: string;
  };
  details_en: {
    category: string;
    sub_category: string;
    root?: string;
    weight?: string;
    rule: string;
    example: string;
  };
}

export interface QuizQuestion {
  id: string;
  type: 'meaning' | 'audio' | 'translation' | 'grammar_id' | 'usage' | 'form' | 'mcq' | 'true_false' | 'short_answer' | 'fill_blank' | 'ordering' | 'drag_drop' | 'matching' | 'chess_puzzle';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  audioText?: string;
  chessConfig?: {
    boardSize: number;
    initialPos: { x: number; y: number };
    targetPos: { x: number; y: number };
    pieceType: 'rook' | 'bishop' | 'knight';
    gridData: string[][]; // Words on the grid
  };
}

export interface Vocabulary {
  id: string;
  original_word: string;
  translation: string;
  is_english_to_arabic: boolean;
  english_definition: string;
  arabic_definition: string;
  image_data?: string;
  emoji?: string;
  analysis: LinguisticAnalysis;
  review_count: number;
  last_reviewed: string;
  next_review: string;
  mastery_level: MasteryLevel;
}

export interface GrammarNode {
  id: string;
  text: string;
  label: string;
  color: string;
}

export interface GrammarConnection {
  from: string;
  to: string;
  relation: string;
}

// Redefining GrammarInfographic to match actual application data structure used in AIStudyMate
export interface GrammarInfographic {
  title_ar: string;
  title_en: string;
  main_concept_ar: string;
  main_concept_en: string;
  concept_items: {
    word_ar: string;
    word_en: string;
    example_ar: string;
    example_en: string;
    color: string;
    icon: string;
  }[];
  positional_examples: {
    scenario_ar: string;
    scenario_en: string;
    example_ar: string;
    example_en: string;
  }[];
  notes: { ar: string; en: string }[];
  parsing_guide: {
    role_ar: string;
    role_en: string;
    state_ar: string;
    state_en: string;
    sign_ar: string;
    sign_en: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content_ar: string;
  content_en: string;
  type: 'explanation' | 'interaction' | 'quiz' | 'feedback' | 'congrats';
  options?: string[];
  correctAnswer?: string;
  infographic?: GrammarInfographic;
}


export interface CertificateData {
  id?: string;
  userId?: string;
  userName?: string;
  studentName?: string;
  courseName?: string;
  topic?: string;
  date: any;
  score: number;
  level?: string;
  type?: 'writing' | 'reading' | 'vocabulary' | 'grammar';
  certificateId?: string;
}

export interface LiveElement {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  content: string;
  color?: string;
  authorName?: string;
  isFrozen?: boolean;
  type: 'text' | 'sticky' | 'sticker';
}

export interface LiveSession {
  id: string;
  teacherId: string;
  activeTool: 'magnify' | 'highlight' | 'text' | 'sticky' | 'emoji' | null;
  magnifyPosition: { x: number; y: number } | null;
  highlights: { id: string; points: {x: number, y: number}[]; color: string; width: number; mode: 'pen' | 'highlight' | 'eraser' }[];
  texts: LiveElement[];
  stickyNotes: LiveElement[];
  stickers: LiveElement[];
  timer: {
    endTime: number | null;
    duration: number;
    isActive: boolean;
  };
  poll: {
    question: string;
    options: string[];
    votes: { [userId: string]: { option: number; name: string; photo: string } };
    isActive: boolean;
  } | null;
  sharedFile: {
    url: string;
    isActive: boolean;
  } | null;
  lastUpdate: any;
  reaction?: { emoji: string; timestamp: number };
}

export interface WritingBoard {
  id: string;
  studentId: string;
  content: string; // JSON or HTML
  attachments: { id: string; url: string; type: 'image' | 'file'; name: string }[];
  teacherComments: { id: string; x: number; y: number; text: string; authorId: string; timestamp: any }[];
  lastUpdate: any;
}
