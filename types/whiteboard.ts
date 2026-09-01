export interface WhiteboardDrawingPoint {
  x: number;
  y: number;
}

export type WhiteboardTool =
  | 'select'
  | 'pen'
  | 'laser'
  | 'highlighter'
  | 'eraser'
  | 'text'
  | 'line'
  | 'arrow'
  | 'rect'
  | 'circle'
  | 'note';

export type WhiteboardTheme = 
  | 'blackboard'        // سبورة سوداء خشبية + طباشير
  | 'whiteboard'        // سبورة بيضاء ناصعة + قلم سبورة ماركر
  | 'notebook'          // دفتر كشكول مسطر + قلم حبر سائل
  | 'calligraphy_9lines'; // كراسة خط 9 أسطر + قلم رصاص

export type WhiteboardBackgroundType = 
  | 'blank' 
  | 'grid' 
  | 'lined' 
  | 'blackboard_slate'
  | 'whiteboard_clean'
  | 'notebook_ruled'
  | 'calligraphy_naskh' 
  | 'calligraphy_ruqah'
  | 'calligraphy_9lines';

export interface WhiteboardElement {
  id: string;
  type: 'path' | 'highlighter' | 'text' | 'rect' | 'circle' | 'line' | 'arrow' | 'image' | 'pdf_presentation' | 'arabic_card' | 'word_card' | 'word_slicer_card' | 'grammar_card' | 'audio_card' | 'poll_card' | 'shape_card' | 'youtube_card' | 'wheel_card' | 'note' | 'sticker';
  points?: WhiteboardDrawingPoint[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  emoji?: string;
  src?: string;
  rotation?: number;
  scale?: number;
  shapeData?: {
    shapeType: string;
    isFilled?: boolean;
    fillColor?: string;
    strokeColor?: string;
  };
  videoData?: {
    url: string;
    title?: string;
    videoId?: string;
  };
  wheelData?: {
    items: string[];
    selectedItem?: string;
  };
  pdfData?: {
    docName: string;
    pages: string[];
    currentPage: number;
    totalPages: number;
    scale?: number;
  };
  cardData?: {
    letter?: string;
    forms?: { isolated?: string; initial?: string; medial?: string; final?: string };
    harakat?: string[];
    tanween?: string[];
    madd?: string[];
    examples?: string[];
    word?: string;
    translation?: string;
    pos?: string;
    meaning?: string;
    root?: string;
    wazn?: string;
    syllables?: string[];
    audioUrl?: string;
    audioDuration?: number;
    grammarCategory?: string;
    imageUrl?: string;
    imageTitle?: string;
  };
  createdBy?: string;
  createdByName?: string;
}

export interface WhiteboardPageData {
  id: string;
  title: string;
  elements: WhiteboardElement[];
  background: WhiteboardBackgroundType;
  theme?: WhiteboardTheme;
  pdfBackgroundUrl?: string;
  pdfPageNumber?: number;
}

export interface WhiteboardStudent {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  isOnline: boolean;
  handRaised: boolean;
  lastActive: number;
  cursor?: { x: number; y: number };
  role?: 'student' | 'teacher';
  notes?: string;
}

export interface WhiteboardActivity {
  id: string;
  title: string;
  type: 'qa' | 'mcq' | 'word_order' | 'matching' | 'letter_trace';
  question: string;
  options?: string[];
  correctAnswer?: string;
  skill?: string;
  level?: string;
  isActive: boolean;
  submissions: Record<string, {
    studentId: string;
    studentName: string;
    answer: string;
    score?: number;
    feedback?: string;
    timestamp: number;
    evaluated?: boolean;
  }>;
}

export interface WhiteboardSessionState {
  id: string;
  code: string;
  title: string;
  teacherId: string;
  teacherName: string;
  createdAt: number;
  pages: WhiteboardPageData[];
  currentPageIndex: number;
  isLocked: boolean; // Teacher Lock: prevents students from editing canvas
  collaborationMode: boolean;
  timer: {
    duration: number; // in seconds
    remaining: number;
    isRunning: boolean;
    lastUpdated: number;
  };
  students: Record<string, WhiteboardStudent>;
  activeActivity?: WhiteboardActivity | null;
  wordBox: string[];
}
