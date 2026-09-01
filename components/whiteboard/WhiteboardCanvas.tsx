import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  WhiteboardElement, 
  WhiteboardTool, 
  WhiteboardDrawingPoint,
  WhiteboardBackgroundType,
  WhiteboardTheme
} from '../../types/whiteboard';
import { 
  Volume2, Trash2, Scissors, GitFork, Play, Music, Check, Sparkles,
  ZoomIn, ZoomOut, Maximize2, Minimize2, Move, ChevronRight, ChevronLeft,
  BookOpen, RefreshCw, FileText, StickyNote, Youtube, Disc, Shapes, Film
} from 'lucide-react';
import { GEOMETRIC_SHAPES } from './GeometricShapesHelper';
import { SpinningWheel } from './SpinningWheelModal';
import { speakArabic, analyzeArabicWord } from './ArabicLinguisticData';

interface LaserPoint {
  x: number;
  y: number;
  time: number;
}

interface WhiteboardCanvasProps {
  elements: WhiteboardElement[];
  onElementsChange: (elements: WhiteboardElement[]) => void;
  activeTool: WhiteboardTool;
  activeColor: string;
  activeStrokeWidth: number;
  isReadOnly?: boolean;
  theme?: WhiteboardTheme;
  background?: WhiteboardBackgroundType;
  currentUserId?: string;
  currentUserName?: string;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  elements,
  onElementsChange,
  activeTool,
  activeColor,
  activeStrokeWidth,
  isReadOnly = false,
  theme = 'blackboard',
  background,
  currentUserId,
  currentUserName
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<WhiteboardDrawingPoint[]>([]);
  const [laserPoints, setLaserPoints] = useState<LaserPoint[]>([]);
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [currentTextValue, setCurrentTextValue] = useState('');

  // Selected element for resizing / controls
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Auto resize canvas
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 800 });

  const updateElement = (id: string, updates: Partial<WhiteboardElement>) => {
    onElementsChange(elements.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeElement = (id: string) => {
    onElementsChange(elements.filter(item => item.id !== id));
  };

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setCanvasDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Laser Pointer Animation Loop (Fades out laser points after 1.5 seconds)
  useEffect(() => {
    let animId: number;
    const loop = () => {
      const now = Date.now();
      setLaserPoints(prev => {
        const filtered = prev.filter(p => now - p.time < 1500);
        return filtered.length !== prev.length ? filtered : prev;
      });
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Resolve effective background
  const effectiveBackground = useMemo(() => {
    if (background && background !== 'blank') return background;
    if (theme === 'blackboard') return 'blackboard_slate';
    if (theme === 'whiteboard') return 'whiteboard_clean';
    if (theme === 'notebook') return 'notebook_ruled';
    if (theme === 'calligraphy_9lines') return 'calligraphy_9lines';
    return 'blank';
  }, [background, theme]);

  // Redraw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Render Theme Backgrounds & Educational Lines
    if (effectiveBackground === 'blackboard_slate' || theme === 'blackboard') {
      // Chalkboard subtle grid or faint guideline
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let y = 60; y < canvas.height; y += 60) {
        ctx.fillRect(0, y, canvas.width, 1);
      }
    } else if (effectiveBackground === 'whiteboard_clean' || theme === 'whiteboard') {
      // Crisp subtle marker grid
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    } else if (effectiveBackground === 'notebook_ruled' || theme === 'notebook') {
      // Authentic Arabic Notebook: Blue Ruled Horizontal Lines + Right Margin (Red Line for RTL)
      const lineGap = 32;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.28)'; // Soft blue ruled lines
      ctx.lineWidth = 1;
      for (let y = 50; y < canvas.height; y += lineGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Vertical Red Margin Line on the right side for Arabic RTL notebooks
      const rightMarginX = canvas.width - 70;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rightMarginX, 0);
      ctx.lineTo(rightMarginX, canvas.height);
      ctx.stroke();

      // Margin label
      ctx.font = '10px "Tajawal", sans-serif';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.fillText('هامش الدفتر', rightMarginX - 45, 30);
    } else if (effectiveBackground === 'calligraphy_9lines' || theme === 'calligraphy_9lines') {
      // 9-LINE ARABIC CALLIGRAPHY NOTEBOOK SYSTEM (نظام التسعة أسطر لكراسة الخط العربي)
      const groupHeight = 160;
      for (let yStart = 40; yStart < canvas.height; yStart += groupHeight) {
        // Line 1: Top Ascender (خط القمة الأعلى للألف واللام - أخضر)
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, yStart);
        ctx.lineTo(canvas.width, yStart);
        ctx.stroke();

        // Line 2: Upper Head Line (خط ترويسة الحروف - أزرق خافت)
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.3)';
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(0, yStart + 20);
        ctx.lineTo(canvas.width, yStart + 20);
        ctx.stroke();

        // Line 3: Upper Mid Line (خط الوسط العلوي للطاء والظاء)
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(0, yStart + 40);
        ctx.lineTo(canvas.width, yStart + 40);
        ctx.stroke();

        // Line 4: Body Line (خط جسم الحروف - الفاء والقاف والواو)
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(0, yStart + 60);
        ctx.lineTo(canvas.width, yStart + 60);
        ctx.stroke();

        // Line 5: ⭐ MAIN BASELINE (خط الأساس الرئيسي - أحمر عريض صلب)
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, yStart + 80);
        ctx.lineTo(canvas.width, yStart + 80);
        ctx.stroke();

        // Line 6: Lower Mid Line (خط انحدار الباء والتاء)
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(0, yStart + 100);
        ctx.lineTo(canvas.width, yStart + 100);
        ctx.stroke();

        // Line 7: Cup Descender (خط كاسات النون والسين والصاد)
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, yStart + 120);
        ctx.lineTo(canvas.width, yStart + 120);
        ctx.stroke();

        // Line 8: Tail Descender (خط هبوط الراء والواو والياء)
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.45)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, yStart + 140);
        ctx.lineTo(canvas.width, yStart + 140);
        ctx.stroke();

        // Line 9: Deep Loop Descender (خط قاع الجيم والحاء والخين والعين)
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.5)';
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(0, yStart + 155);
        ctx.lineTo(canvas.width, yStart + 155);
        ctx.stroke();

        // Baseline Label
        ctx.font = 'bold 10px "Tajawal", sans-serif';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.fillText('سطر الأساس (Baseline)', 14, yStart + 76);
      }
    } else if (effectiveBackground === 'calligraphy_naskh') {
      // 4-Line Calligraphy Grid (Naskh)
      const groupHeight = 130;
      for (let yStart = 60; yStart < canvas.height; yStart += groupHeight) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, yStart);
        ctx.lineTo(canvas.width, yStart);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
        ctx.beginPath();
        ctx.moveTo(0, yStart + 30);
        ctx.lineTo(canvas.width, yStart + 30);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, yStart + 70);
        ctx.lineTo(canvas.width, yStart + 70);
        ctx.stroke();

        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, yStart + 105);
        ctx.lineTo(canvas.width, yStart + 105);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 2. Render Existing Elements
    elements.forEach(el => {
      ctx.save();
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Chalk / Pencil Texture Effect
      if (theme === 'blackboard') {
        ctx.shadowColor = el.color;
        ctx.shadowBlur = 1.5;
      }

      if (el.type === 'path' && el.points && el.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      } else if (el.type === 'highlighter' && el.points && el.points.length > 0) {
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = el.strokeWidth * 3;
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      } else if (el.type === 'line' && el.points && el.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        ctx.lineTo(el.points[1].x, el.points[1].y);
        ctx.stroke();
      } else if (el.type === 'arrow' && el.points && el.points.length >= 2) {
        const from = el.points[0];
        const to = el.points[1];
        const headlen = Math.max(12, el.strokeWidth * 3.5);
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI / 6), to.y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI / 6), to.y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = el.color;
        ctx.fill();
      } else if (el.type === 'rect' && el.x !== undefined && el.y !== undefined && el.width && el.height) {
        ctx.strokeRect(el.x, el.y, el.width, el.height);
      } else if (el.type === 'circle' && el.x !== undefined && el.y !== undefined && el.width) {
        ctx.beginPath();
        ctx.arc(el.x, el.y, Math.abs(el.width / 2), 0, Math.PI * 2);
        ctx.stroke();
      } else if (el.type === 'text' && el.text && el.x !== undefined && el.y !== undefined) {
        ctx.font = `bold ${el.fontSize || 24}px 'Amiri', 'Tajawal', sans-serif`;
        ctx.fillText(el.text, el.x, el.y);
      }

      ctx.restore();
    });

    // 3. Render In-Progress Drawing Stroke & Shapes
    if (isDrawing && currentPoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = activeColor;
      ctx.fillStyle = activeColor;
      ctx.lineWidth = activeTool === 'highlighter' ? activeStrokeWidth * 3 : activeStrokeWidth;
      ctx.globalAlpha = activeTool === 'highlighter' ? 0.35 : 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (theme === 'blackboard') {
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 2;
      }

      if (activeTool === 'pen' || activeTool === 'highlighter') {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        for (let i = 1; i < currentPoints.length; i++) {
          ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }
        ctx.stroke();
      } else if (activeTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        ctx.lineTo(currentPoints[currentPoints.length - 1].x, currentPoints[currentPoints.length - 1].y);
        ctx.stroke();
      } else if (activeTool === 'arrow') {
        const from = currentPoints[0];
        const to = currentPoints[currentPoints.length - 1];
        const headlen = Math.max(12, activeStrokeWidth * 3.5);
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI / 6), to.y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI / 6), to.y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (activeTool === 'rect') {
        const p0 = currentPoints[0];
        const p1 = currentPoints[currentPoints.length - 1];
        const rx = Math.min(p0.x, p1.x);
        const ry = Math.min(p0.y, p1.y);
        const rw = Math.abs(p1.x - p0.x);
        const rh = Math.abs(p1.y - p0.y);
        ctx.strokeRect(rx, ry, rw, rh);
      } else if (activeTool === 'circle') {
        const p0 = currentPoints[0];
        const p1 = currentPoints[currentPoints.length - 1];
        const radius = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        ctx.beginPath();
        ctx.arc(p0.x, p0.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    // 4. Render Laser Pointer Glowing Trail
    if (laserPoints.length > 1) {
      const now = Date.now();
      for (let i = 1; i < laserPoints.length; i++) {
        const p1 = laserPoints[i - 1];
        const p2 = laserPoints[i];
        const age = now - p2.time;
        const opacity = Math.max(0, 1 - age / 1500);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(239, 68, 68, ${opacity})`;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
        ctx.shadowBlur = 16;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
        ctx.shadowBlur = 4;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      const lastPt = laserPoints[laserPoints.length - 1];
      ctx.save();
      ctx.beginPath();
      ctx.arc(lastPt.x, lastPt.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.restore();
    }
  }, [elements, isDrawing, currentPoints, laserPoints, activeColor, activeStrokeWidth, activeTool, effectiveBackground, theme, canvasDimensions]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    const coords = getCanvasCoords(e);

    if (activeTool === 'laser') {
      setIsDrawing(true);
      setLaserPoints(prev => [...prev, { ...coords, time: Date.now() }]);
      return;
    }

    if (activeTool === 'text') {
      setTextInputPos(coords);
      return;
    }

    if (['pen', 'highlighter', 'line', 'arrow', 'rect', 'circle'].includes(activeTool)) {
      setIsDrawing(true);
      setCurrentPoints([coords]);
    } else if (activeTool === 'note') {
      const newEl: WhiteboardElement = {
        id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: 'note',
        x: Math.max(20, coords.x - 110),
        y: Math.max(20, coords.y - 75),
        width: 230,
        height: 150,
        color: activeColor && activeColor !== '#ffffff' ? activeColor : '#fef08a',
        strokeWidth: 2,
        text: 'ملاحظة لاصقة جديدة...',
        cardData: {
          word: 'ملاحظة لاصقة جديدة...',
          meaning: 'انقر للكتابة والتحريك'
        },
        createdBy: currentUserId,
        createdByName: currentUserName
      };
      onElementsChange([...elements, newEl]);
    } else if (activeTool === 'eraser') {
      setIsDrawing(true);
    }
  };

  const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (!isDrawing) return;

    if (activeTool === 'laser') {
      setLaserPoints(prev => [...prev, { ...coords, time: Date.now() }]);
      return;
    }

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setCurrentPoints(prev => [...prev, coords]);
    } else if (['line', 'arrow', 'rect', 'circle'].includes(activeTool)) {
      setCurrentPoints(prev => [prev[0], coords]);
    } else if (activeTool === 'eraser') {
      // Erase strokes and cards/elements within distance or bounding box of eraser point
      const eraseRadius = activeStrokeWidth * 8 + 25;
      const remaining = elements.filter(el => {
        if (el.points && el.points.length > 0) {
          const hit = el.points.some(p => Math.hypot(p.x - coords.x, p.y - coords.y) < eraseRadius);
          return !hit;
        }
        if (el.x !== undefined && el.y !== undefined) {
          const w = el.width || 240;
          const h = el.height || 180;
          const inBounds = coords.x >= (el.x - 25) && coords.x <= (el.x + w + 25) &&
                           coords.y >= (el.y - 25) && coords.y <= (el.y + h + 25);
          return !inBounds;
        }
        return true;
      });
      if (remaining.length !== elements.length) {
        onElementsChange(remaining);
      }
    }
  };

  const handleEndDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (activeTool === 'laser') return;

    if (currentPoints.length > 0) {
      if (activeTool === 'pen' || activeTool === 'highlighter') {
        const newEl: WhiteboardElement = {
          id: `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          type: activeTool === 'pen' ? 'path' : 'highlighter',
          points: currentPoints,
          color: activeColor,
          strokeWidth: activeStrokeWidth,
          createdBy: currentUserId,
          createdByName: currentUserName
        };
        onElementsChange([...elements, newEl]);
      } else if (activeTool === 'line' && currentPoints.length >= 2) {
        const newEl: WhiteboardElement = {
          id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          type: 'line',
          points: [currentPoints[0], currentPoints[currentPoints.length - 1]],
          color: activeColor,
          strokeWidth: activeStrokeWidth,
          createdBy: currentUserId,
          createdByName: currentUserName
        };
        onElementsChange([...elements, newEl]);
      } else if (activeTool === 'arrow' && currentPoints.length >= 2) {
        const newEl: WhiteboardElement = {
          id: `arrow_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          type: 'arrow',
          points: [currentPoints[0], currentPoints[currentPoints.length - 1]],
          color: activeColor,
          strokeWidth: activeStrokeWidth,
          createdBy: currentUserId,
          createdByName: currentUserName
        };
        onElementsChange([...elements, newEl]);
      } else if (activeTool === 'rect' && currentPoints.length >= 2) {
        const p0 = currentPoints[0];
        const p1 = currentPoints[currentPoints.length - 1];
        const newEl: WhiteboardElement = {
          id: `rect_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          type: 'rect',
          x: Math.min(p0.x, p1.x),
          y: Math.min(p0.y, p1.y),
          width: Math.abs(p1.x - p0.x),
          height: Math.abs(p1.y - p0.y),
          color: activeColor,
          strokeWidth: activeStrokeWidth,
          createdBy: currentUserId,
          createdByName: currentUserName
        };
        onElementsChange([...elements, newEl]);
      } else if (activeTool === 'circle' && currentPoints.length >= 2) {
        const p0 = currentPoints[0];
        const p1 = currentPoints[currentPoints.length - 1];
        const radius = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        const newEl: WhiteboardElement = {
          id: `circle_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          type: 'circle',
          x: p0.x,
          y: p0.y,
          width: radius * 2,
          height: radius * 2,
          color: activeColor,
          strokeWidth: activeStrokeWidth,
          createdBy: currentUserId,
          createdByName: currentUserName
        };
        onElementsChange([...elements, newEl]);
      }
    }
    setCurrentPoints([]);
  };

  const handleAddText = () => {
    if (textInputPos && currentTextValue.trim()) {
      const newEl: WhiteboardElement = {
        id: `text_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: 'text',
        x: textInputPos.x,
        y: textInputPos.y,
        text: currentTextValue.trim(),
        color: activeColor,
        strokeWidth: 2,
        fontSize: activeStrokeWidth * 6 + 18,
        createdBy: currentUserId,
        createdByName: currentUserName
      };
      onElementsChange([...elements, newEl]);
      setCurrentTextValue('');
      setTextInputPos(null);
    }
  };

  const speakArabic = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Ultra-Smooth, Zero-Lag Pointer Drag Handler for all cards, media, notes, and PDFs
  const handleElementPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    elementId: string,
    initialX: number,
    initialY: number
  ) => {
    if (isReadOnly) return;
    const target = e.target as HTMLElement;
    // Do not initiate drag if clicking on interactive controls
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('.no-drag')
    ) {
      return;
    }

    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    let currentX = initialX;
    let currentY = initialY;

    const elDom = e.currentTarget;
    try {
      elDom.setPointerCapture(e.pointerId);
    } catch (err) {}

    const onPointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - startX;
      const deltaY = moveEv.clientY - startY;
      currentX = Math.max(10, Math.round(initialX + deltaX));
      currentY = Math.max(10, Math.round(initialY + deltaY));

      // Direct DOM update during drag for 120fps/60fps silky smooth response without state thrashing
      elDom.style.left = `${currentX}px`;
      elDom.style.top = `${currentY}px`;
    };

    const onPointerUp = (upEv: PointerEvent) => {
      try {
        elDom.releasePointerCapture(upEv.pointerId);
      } catch (err) {}
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      // Commit final position to state once on release
      updateElement(elementId, { x: currentX, y: currentY });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Outer Board Container Styles per Theme
  const containerThemeStyles = useMemo(() => {
    switch (theme) {
      case 'blackboard':
        return {
          wrapper: 'bg-[#1b1c1f] border-[14px] border-[#4a2e19] shadow-[0_25px_70px_rgba(0,0,0,0.85)] rounded-3xl',
          chalkDust: `
            radial-gradient(ellipse 80% 50% at 75% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 70%),
            radial-gradient(ellipse 70% 60% at 20% 75%, rgba(255, 255, 255, 0.07) 0%, transparent 65%),
            radial-gradient(ellipse 90% 40% at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%),
            radial-gradient(circle 400px at 85% 80%, rgba(255, 255, 255, 0.06) 0%, transparent 60%),
            radial-gradient(circle 350px at 15% 25%, rgba(255, 255, 255, 0.06) 0%, transparent 55%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 40%, rgba(255, 255, 255, 0.04) 60%, transparent 100%),
            linear-gradient(225deg, rgba(255, 255, 255, 0.025) 0%, transparent 50%, rgba(255, 255, 255, 0.03) 100%),
            radial-gradient(ellipse at 50% 50%, #25282d 0%, #1c1d21 55%, #131416 100%)
          `,
          shelfClass: 'bg-gradient-to-r from-[#3d2311] via-[#5c371d] to-[#3d2311] border-t-2 border-[#78431e] shadow-lg'
        };
      case 'whiteboard':
        return {
          wrapper: 'bg-[#fcfdff] border-[12px] border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-3xl',
          chalkDust: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(241,245,249,0.7) 100%)',
          shelfClass: 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border-t border-slate-400/50 shadow-inner'
        };
      case 'notebook':
        return {
          wrapper: 'bg-[#fcfbf7] border-r-[26px] border-r-[#78350f] border-l-4 border-l-slate-200 border-y-4 border-y-slate-200 shadow-2xl rounded-2xl',
          chalkDust: 'linear-gradient(135deg, rgba(254,252,232,0.6) 0%, rgba(253,250,240,0.9) 100%)',
          shelfClass: 'bg-[#78350f] border-t border-amber-900 shadow-md text-amber-100'
        };
      case 'calligraphy_9lines':
        return {
          wrapper: 'bg-[#fdfbf7] border-[12px] border-[#854d0e] shadow-2xl rounded-2xl',
          chalkDust: 'radial-gradient(circle at 50% 30%, rgba(254,240,138,0.06) 0%, rgba(0,0,0,0.05) 100%)',
          shelfClass: 'bg-[#854d0e] border-t border-amber-700 shadow-md text-amber-200'
        };
    }
  }, [theme]);

  return (
    <div
      ref={containerRef}
      id="whiteboard-canvas-container"
      onMouseLeave={handleEndDraw}
      className={`whiteboard-board-container relative w-full h-full min-h-[580px] overflow-hidden select-none cursor-crosshair ${containerThemeStyles.wrapper}`}
      style={{ backgroundImage: containerThemeStyles.chalkDust }}
    >
      {/* Authentic Chalkboard Smudges & Dust Waves Overlay (matching real slate chalkboard) */}
      {theme === 'blackboard' && (
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <defs>
              <filter id="chalk-smudge-filter" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.015 0.008" numOctaves="4" result="noise" seed="42" />
                <feColorMatrix type="matrix" values="1 0 0 0 1  0 1 0 0 1  0 0 1 0 1  0 0 0 0.18 -0.04" />
              </filter>
              <linearGradient id="chalk-wipe-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                <stop offset="30%" stopColor="#ffffff" stopOpacity="0.02" />
                <stop offset="55%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="80%" stopColor="#ffffff" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.09" />
              </linearGradient>
              <radialGradient id="chalk-cloud" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                <stop offset="40%" stopColor="#ffffff" stopOpacity="0.06" />
                <stop offset="80%" stopColor="#ffffff" stopOpacity="0.01" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" filter="url(#chalk-smudge-filter)" />
            <rect width="100%" height="100%" fill="url(#chalk-wipe-1)" />
            <rect width="100%" height="100%" fill="url(#chalk-cloud)" />
            {/* Organic duster sweeping wave paths */}
            <path d="M -50 120 Q 200 40 450 180 T 950 100 T 1400 220" stroke="rgba(255,255,255,0.08)" strokeWidth="80" fill="none" filter="blur(25px)" />
            <path d="M 0 380 Q 300 260 650 420 T 1200 320 T 1600 450" stroke="rgba(255,255,255,0.07)" strokeWidth="120" fill="none" filter="blur(35px)" />
            <path d="M -100 580 Q 350 480 800 620 T 1500 520" stroke="rgba(255,255,255,0.06)" strokeWidth="90" fill="none" filter="blur(30px)" />
          </svg>
        </div>
      )}

      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        onMouseDown={handleStartDraw}
        onMouseMove={handleDrawMove}
        onMouseUp={handleEndDraw}
        onTouchStart={handleStartDraw}
        onTouchMove={handleDrawMove}
        onTouchEnd={handleEndDraw}
        className="w-full h-full block"
      />

      {/* Render High-Level Interactive Educational Cards, Media, PDFs & Sticky Notes */}
      {(() => {
        const seenIds = new Set<string>();
        return elements
          .filter(el => {
            if (!el || !el.id) return false;
            if (seenIds.has(el.id)) return false;
            seenIds.add(el.id);
            return [
              'arabic_card', 
              'word_card', 
              'word_slicer_card', 
              'grammar_card', 
              'audio_card', 
              'image', 
              'pdf_presentation', 
              'note',
              'poll_card',
              'shape_card',
              'youtube_card',
              'wheel_card',
              'sticker'
            ].includes(el.type) || 
            el.id?.startsWith('note_') || 
            el.id?.startsWith('poll_') ||
            el.id?.startsWith('shape_') ||
            el.id?.startsWith('youtube_') ||
            el.id?.startsWith('wheel_') ||
            el.id?.startsWith('sticker_');
          })
          .map((el, index) => {
            const posX = el.x ?? 100;
            const posY = el.y ?? 100;

          // Card 1A: Arabic Letter Card (بطاقة الحرف الشاملة: الأشكال، الحركات، التنوين، المدود)
          if (el.type === 'arabic_card' && el.cardData?.letter) {
            const letter = el.cardData.letter;
            const forms = el.cardData.forms || { isolated: letter, initial: letter, medial: letter, final: letter };
            const harakat = el.cardData.harakat || [];
            const tanween = el.cardData.tanween || [];
            const madd = el.cardData.madd || [];
            const examples = el.cardData.examples || [];

            return (
              <div
                key={el.id}
                onPointerDown={(e) => handleElementPointerDown(e, el.id, posX, posY)}
                style={{ left: posX, top: posY }}
                className="absolute z-20 bg-slate-950/95 border-2 border-emerald-500 rounded-3xl p-4 shadow-2xl text-white w-80 backdrop-blur-md cursor-grab active:cursor-grabbing ring-1 ring-emerald-500/20 touch-none select-none"
                dir="rtl"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-emerald-400 arabic-font leading-none">{letter}</span>
                    <span className="text-xs text-emerald-300 font-bold arabic-font">بطاقة حرف ({letter})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => speakArabic(`${letter} ${examples.join(' ')}`)}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400 transition"
                      title="استماع"
                    >
                      <Volume2 size={16} />
                    </button>
                    {!isReadOnly && (
                      <button
                        onClick={() => removeElement(el.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Forms of the Letter (أشكال الحرف) */}
                <div className="mb-2">
                  <div className="text-[10px] text-slate-400 font-bold mb-1">أشكال الحرف ومواضعه:</div>
                  <div className="grid grid-cols-4 gap-1 text-center bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                    <div className="p-1 rounded bg-white/5">
                      <div className="text-[9px] text-slate-400 mb-0.5">منفصل</div>
                      <div className="text-base font-black text-emerald-400 arabic-font">{forms.isolated || letter}</div>
                    </div>
                    <div className="p-1 rounded bg-white/5">
                      <div className="text-[9px] text-slate-400 mb-0.5">أول</div>
                      <div className="text-base font-black text-emerald-400 arabic-font">{forms.initial || letter}</div>
                    </div>
                    <div className="p-1 rounded bg-white/5">
                      <div className="text-[9px] text-slate-400 mb-0.5">وسط</div>
                      <div className="text-base font-black text-emerald-400 arabic-font">{forms.medial || letter}</div>
                    </div>
                    <div className="p-1 rounded bg-white/5">
                      <div className="text-[9px] text-slate-400 mb-0.5">آخر</div>
                      <div className="text-base font-black text-emerald-400 arabic-font">{forms.final || letter}</div>
                    </div>
                  </div>
                </div>

                {/* Short Vowels (الحركات القصيرة) */}
                {harakat.length > 0 && (
                  <div className="mb-2">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">الحركات القصيرة:</div>
                    <div className="flex justify-around bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                      {harakat.map((h: string, i: number) => (
                        <span key={i} className="text-base font-black text-amber-300 arabic-font px-1">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tanween (التنوين) */}
                {tanween.length > 0 && (
                  <div className="mb-2">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">التنوين:</div>
                    <div className="flex justify-around bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                      {tanween.map((t: string, i: number) => (
                        <span key={i} className="text-base font-black text-sky-300 arabic-font px-1">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Madd (المدود) */}
                {madd.length > 0 && (
                  <div className="mb-2">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">المدود الطويلة:</div>
                    <div className="flex justify-around bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                      {madd.map((m: string, i: number) => (
                        <span key={i} className="text-sm font-black text-rose-300 arabic-font px-1">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Examples (أمثلة) */}
                {examples.length > 0 && (
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold mb-1">أمثلة شائعة:</div>
                    <div className="flex flex-wrap gap-1 text-xs text-white arabic-font">
                      {examples.map((ex: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700 text-slate-200">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Card 1B: Arabic Question / Exercise Card (From AI Wand or Random Generator)
          if (el.type === 'arabic_card' && (el.cardData?.word || el.text)) {
            const questionTitle = el.cardData?.word || el.text || '';
            const questionAnswer = el.cardData?.meaning || el.cardData?.translation || '';
            const categoryBadge = el.cardData?.pos || el.cardData?.grammarCategory || 'سؤال وتدريب';

            return (
              <div
                key={el.id}
                onPointerDown={(e) => handleElementPointerDown(e, el.id, posX, posY)}
                style={{ left: posX, top: posY }}
                className="absolute z-20 bg-slate-950/95 border-2 border-purple-500/80 rounded-3xl p-4 shadow-2xl text-white w-80 backdrop-blur-md cursor-grab active:cursor-grabbing ring-2 ring-purple-500/20 touch-none select-none"
                dir="rtl"
              >
                <div className="flex items-center justify-between border-b border-purple-500/30 pb-2 mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-purple-300 font-black">
                    <Sparkles size={14} className="text-purple-400" />
                    <span>{categoryBadge}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => speakArabic(questionTitle)}
                      className="p-1 hover:bg-white/10 rounded-lg text-purple-300 transition"
                      title="استماع للسؤال"
                    >
                      <Volume2 size={16} />
                    </button>
                    {!isReadOnly && (
                      <button
                        onClick={() => removeElement(el.id)}
                        className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition"
                        title="حذف البطاقة"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-base font-black text-amber-300 arabic-font leading-relaxed mb-2.5">
                  {questionTitle}
                </div>

                {questionAnswer && (
                  <div className="bg-purple-950/40 border border-purple-500/30 p-2.5 rounded-2xl text-xs text-purple-200">
                    <div className="text-[10px] text-purple-400 font-bold mb-0.5">الإجابة والشرح:</div>
                    <div className="arabic-font">{questionAnswer}</div>
                  </div>
                )}
              </div>
            );
          }

          // Card 1C: Interactive Live Poll Card
          if (el.type === 'poll_card' || el.id?.startsWith('poll_')) {
            const pollData = el.cardData as any;
            const question = pollData?.word || el.text || 'تصويت تفاعلي';
            const options: string[] = pollData?.examples || ['نعم', 'لا'];
            const votes: number[] = pollData?.harakat?.map((v: string) => parseInt(v) || 0) || options.map(() => 0);
            const totalVotes = votes.reduce((a, b) => a + b, 0);

            return (
              <div
                key={el.id}
                onPointerDown={(e) => handleElementPointerDown(e, el.id, posX, posY)}
                style={{ left: posX, top: posY }}
                className="absolute z-20 bg-slate-950/95 border-2 border-amber-500/80 rounded-3xl p-4 shadow-2xl text-white w-80 backdrop-blur-md cursor-grab active:cursor-grabbing ring-2 ring-amber-500/20 touch-none select-none"
                dir="rtl"
              >
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2 mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-black">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>تصويت فوري للطلاب</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-amber-300/80 font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded-md">
                      {totalVotes} صوت
                    </span>
                    {!isReadOnly && (
                      <button
                        onClick={() => removeElement(el.id)}
                        className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition"
                        title="حذف التصويت"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-sm font-black text-white arabic-font mb-3">
                  {question}
                </div>

                <div className="flex flex-col gap-2">
                  {options.map((opt, idx) => {
                    const optVotes = votes[idx] || 0;
                    const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;

                    return (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          const newVotes = [...votes];
                          newVotes[idx] = (newVotes[idx] || 0) + 1;
                          updateElement(el.id, {
                            cardData: {
                              ...pollData,
                              harakat: newVotes.map(v => v.toString())
                            }
                          });
                        }}
                        className="relative overflow-hidden w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-400/50 transition text-right group no-drag"
                      >
                        {/* Vote bar fill */}
                        <div
                          className="absolute inset-y-0 right-0 bg-amber-500/25 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                        <div className="relative z-10 flex items-center justify-between text-xs font-bold">
                          <span className="arabic-font text-white group-hover:text-amber-300">{opt}</span>
                          <span className="font-mono text-amber-400 text-[11px]">{percent}% ({optVotes})</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Card 2: Word Slicer & Root Card (تحليل الكلمات)
          if (el.type === 'word_slicer_card' && el.cardData?.word) {
            const cardWord = el.cardData.word;
            return (
              <div
                key={el.id}
                onPointerDown={(e) => handleElementPointerDown(e, el.id, posX, posY)}
                style={{ left: posX, top: posY }}
                className="absolute z-20 bg-slate-950/95 border-2 border-cyan-500 rounded-3xl p-4 shadow-2xl text-white w-80 backdrop-blur-md cursor-grab active:cursor-grabbing ring-2 ring-cyan-500/20 touch-none select-none"
                dir="rtl"
              >
                {/* Header: Centered title "تحليل كلمة" without any icon next to it */}
                <div className="relative flex items-center justify-center border-b border-white/10 pb-2 mb-2.5">
                  <span className="text-xs font-black text-cyan-300 tracking-wider text-center">
                    تحليل كلمة
                  </span>
                  
                  <div className="absolute left-0 flex items-center gap-1">
                    <button
                      onClick={() => speakArabic(cardWord)}
                      className="p-1 hover:bg-white/10 rounded-lg text-cyan-400 transition"
                      title="استماع"
                    >
                      <Volume2 size={16} />
                    </button>
                    {!isReadOnly && (
                      <button
                        onClick={() => removeElement(el.id)}
                        className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct Word Input & Analyze on Card */}
                {!isReadOnly && (
                  <div className="flex items-center gap-1.5 mb-2.5 bg-slate-900/90 p-1 rounded-xl border border-white/10 no-drag">
                    <input
                      type="text"
                      placeholder="اكتب كلمة جديدة للتحليل..."
                      defaultValue=""
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.currentTarget;
                          const val = target.value.trim();
                          if (val) {
                            const analyzed = analyzeArabicWord(val);
                            updateElement(el.id, {
                              cardData: {
                                ...el.cardData,
                                word: analyzed.word,
                                syllables: analyzed.syllables,
                                root: analyzed.root,
                                wazn: analyzed.wazn,
                                meaning: analyzed.meaning
                              }
                            });
                            speakArabic(analyzed.word);
                            target.value = '';
                          }
                        }
                      }}
                      className="flex-1 bg-transparent px-2 py-1 text-xs text-white placeholder:text-white/30 arabic-font outline-none text-right"
                      dir="rtl"
                    />
                    <button
                      onClick={(e) => {
                        const inputEl = (e.currentTarget.previousSibling as HTMLInputElement);
                        const val = inputEl?.value.trim();
                        if (val) {
                          const analyzed = analyzeArabicWord(val);
                          updateElement(el.id, {
                            cardData: {
                              ...el.cardData,
                              word: analyzed.word,
                              syllables: analyzed.syllables,
                              root: analyzed.root,
                              wazn: analyzed.wazn,
                              meaning: analyzed.meaning
                            }
                          });
                          speakArabic(analyzed.word);
                          inputEl.value = '';
                        }
                      }}
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-black transition whitespace-nowrap"
                    >
                      تحليل
                    </button>
                  </div>
                )}

                {/* Displayed Word */}
                <div className="text-2xl font-black text-white arabic-font text-center my-1">
                  {cardWord}
                </div>

                {/* Slices / Syllables */}
                {el.cardData.syllables && (
                  <div className="flex items-center justify-center gap-1.5 my-2">
                    {el.cardData.syllables.map((s, i) => (
                      <span
                        key={i}
                        onClick={() => speakArabic(s)}
                        className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-500/50 rounded-xl text-cyan-300 font-black text-base cursor-pointer hover:scale-105 transition"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Root & Wazn */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 p-2 rounded-xl border border-white/5 my-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">الجذر:</span>
                    <span className="text-emerald-400 font-black arabic-font text-sm">{el.cardData.root}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الوزن الصرفي:</span>
                    <span className="text-amber-400 font-black arabic-font text-sm">{el.cardData.wazn}</span>
                  </div>
                </div>
              </div>
            );
          }

          // Card 3: Grammar Sorter Card
          if (el.type === 'grammar_card') {
            return (
              <div
                key={el.id}
                onPointerDown={(e) => handleElementPointerDown(e, el.id, posX, posY)}
                style={{ left: posX, top: posY }}
                className="absolute z-20 bg-slate-950/95 border-2 border-purple-500 rounded-3xl p-4 shadow-2xl text-white w-72 backdrop-blur-md cursor-grab active:cursor-grabbing ring-2 ring-purple-500/20 touch-none select-none"
                dir="rtl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-purple-400 font-black">
                    <GitFork size={14} />
                    <span>بطاقة تصنيف النحو</span>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={() => removeElement(el.id)}
                      className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="text-base font-black text-white arabic-font mb-1">
                  {el.cardData?.word}
                </div>
                <div className="text-xs text-purple-300 font-bold mb-2">
                  {el.cardData?.grammarCategory}
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  {el.cardData?.translation}
                </div>
              </div>
            );
          }

          // Card 4: Audio Player Model Card
          if (el.type === 'audio_card') {
            return (
              <div
                key={el.id}
                onPointerDown={(e) => handleElementPointerDown(e, el.id, posX, posY)}
                style={{ left: posX, top: posY }}
                className="absolute z-20 bg-slate-950/95 border-2 border-amber-500 rounded-3xl p-4 shadow-2xl text-white w-72 backdrop-blur-md cursor-grab active:cursor-grabbing ring-2 ring-amber-500/20 touch-none select-none"
                dir="rtl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-black">
                    <Music size={14} />
                    <span>{el.cardData?.meaning || 'نموذج نطق صوتي'}</span>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={() => removeElement(el.id)}
                      className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="text-lg font-black text-white arabic-font mb-3">
                  {el.cardData?.word}
                </div>

                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-2xl border border-white/5">
                  <button
                    onClick={() => speakArabic(el.cardData?.word || '')}
                    className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg transition"
                  >
                    <Play size={18} className="mr-0.5" />
                  </button>
                  <div className="text-xs text-slate-300 font-bold">
                    {el.cardData?.translation || 'تسجيل صوتي للمعلم'}
                  </div>
                </div>
              </div>
            );
          }

          // Card 5: Interactive Resizable Image / Media Element
          if (el.type === 'image' && el.src) {
            const currentWidth = el.width || 340;
            const currentScale = el.scale || 1;
            const isSelected = selectedElementId === el.id;

            return (
              <div
                key={el.id}
                onPointerDown={(e) => handleElementPointerDown(e, el.id, posX, posY)}
                onClick={() => setSelectedElementId(el.id)}
                style={{
                  left: posX,
                  top: posY,
                  width: currentWidth * currentScale
                }}
                className={`absolute z-20 bg-slate-900/95 border-2 rounded-2xl p-2 shadow-2xl group transition-shadow cursor-grab active:cursor-grabbing touch-none select-none ${
                  isSelected ? 'border-emerald-400 ring-4 ring-emerald-500/20' : 'border-white/20 hover:border-emerald-500/50'
                }`}
              >
                {/* Floating Image Control Bar */}
                {!isReadOnly && (
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-xs px-1">
                    <div className="flex items-center gap-1 text-slate-300 font-bold text-[11px] select-none">
                      <Move size={12} className="text-emerald-400" />
                      <span>{el.cardData?.imageTitle || 'صورة توضيحية'}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950/80 rounded-lg p-0.5 border border-white/10 no-drag">
                      {/* Zoom Out / Shrink */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateElement(el.id, {
                            width: Math.max(160, currentWidth * 0.85)
                          });
                        }}
                        className="p-1 hover:bg-white/15 rounded text-slate-300 hover:text-white transition"
                        title="تصغير الصورة"
                      >
                        <ZoomOut size={13} />
                      </button>

                      {/* Zoom In / Enlarge */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateElement(el.id, {
                            width: Math.min(1000, currentWidth * 1.15)
                          });
                        }}
                        className="p-1 hover:bg-white/15 rounded text-slate-300 hover:text-white transition"
                        title="تكبير الصورة"
                      >
                        <ZoomIn size={13} />
                      </button>

                      {/* Reset standard width */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateElement(el.id, { width: 360, scale: 1 });
                        }}
                        className="px-1.5 py-0.5 text-[10px] font-bold hover:bg-white/15 rounded text-slate-400 hover:text-white transition"
                        title="الحجم الافتراضي"
                      >
                        100%
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeElement(el.id);
                        }}
                        className="p-1 hover:bg-red-500/30 rounded text-red-400 transition ml-0.5"
                        title="حذف الصورة"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* The Image Itself */}
                <div className="relative overflow-hidden rounded-xl bg-slate-950/50 flex items-center justify-center pointer-events-none">
                  <img
                    src={el.src}
                    alt={el.cardData?.imageTitle || "Media"}
                    className="w-full h-auto object-contain rounded-xl select-none pointer-events-none"
                    draggable={false}
                  />
                </div>

                {/* Direct Drag-to-Resize Handle */}
                {!isReadOnly && (
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const startResizeX = e.clientX;
                      const initialW = currentWidth;

                      const onMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = moveEvent.clientX - startResizeX;
                        const newWidth = Math.max(160, Math.min(1100, initialW + deltaX));
                        updateElement(el.id, { width: newWidth });
                      };

                      const onMouseUp = () => {
                        window.removeEventListener('mousemove', onMouseMove);
                        window.removeEventListener('mouseup', onMouseUp);
                      };

                      window.addEventListener('mousemove', onMouseMove);
                      window.addEventListener('mouseup', onMouseUp);
                    }}
                    className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-lg cursor-nwse-resize z-30 transition border-2 border-white no-drag"
                    title="اسحب لتكبير أو تصغير الحجم بحرية"
                  >
                    <Maximize2 size={10} className="text-slate-950 rotate-90" />
                  </div>
                )}
              </div>
            );
          }

          // Card 6: Interactive Educational PDF Presentation Board (عرض الكتب للشرح التفاعلي)
          if (el.type === 'pdf_presentation' && el.pdfData) {
            const currentWidth = el.width || 560;
            const currentScale = el.scale || 1;
            const pdfInfo = el.pdfData;
            const currentPageNum = pdfInfo.currentPage || 1;
            const totalPages = pdfInfo.totalPages || pdfInfo.pages.length || 1;
            const currentPageSrc = pdfInfo.pages[currentPageNum - 1] || el.src;
            const isSelected = selectedElementId === el.id;

            return (
              <div
                key={el.id}
                onPointerDown={(e) => handleElementPointerDown(e, el.id, posX, posY)}
                onClick={() => setSelectedElementId(el.id)}
                style={{
                  left: posX,
                  top: posY,
                  width: currentWidth * currentScale
                }}
                className={`absolute z-20 bg-slate-900/95 border-2 rounded-3xl p-3 shadow-2xl text-white backdrop-blur-xl cursor-grab active:cursor-grabbing touch-none select-none ${
                  isSelected ? 'border-teal-400 ring-4 ring-teal-500/30 shadow-teal-950/50' : 'border-teal-500/40 hover:border-teal-400'
                }`}
                dir="rtl"
              >
                {/* PDF Header & Interactive Navigation Toolbar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  {/* Title & Document Badge */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white arabic-font leading-tight">
                        {pdfInfo.docName || 'كتاب مدرسي للشرح التفاعلي'}
                      </div>
                      <div className="text-[10px] text-teal-400 font-bold">
                        عارض تفاعلي متقدم • يمكنك الكتابة والتأشير فوقه
                      </div>
                    </div>
                  </div>

                  {/* Page Navigation & Controls */}
                  <div className="flex items-center gap-1.5 bg-slate-950/90 px-2 py-1 rounded-2xl border border-white/10 no-drag">
                    {/* Previous Page */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentPageNum > 1) {
                          updateElement(el.id, {
                            pdfData: {
                              ...pdfInfo,
                              currentPage: currentPageNum - 1
                            }
                          });
                        }
                      }}
                      disabled={currentPageNum <= 1}
                      className="p-1 hover:bg-white/15 rounded-lg disabled:opacity-30 text-teal-300 transition"
                      title="الصفحة السابقة"
                    >
                      <ChevronRight size={16} />
                    </button>

                    {/* Page Indicator */}
                    <span className="text-xs font-mono font-black text-teal-300 px-1 select-none">
                      {currentPageNum} / {totalPages}
                    </span>

                    {/* Next Page */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentPageNum < totalPages) {
                          updateElement(el.id, {
                            pdfData: {
                              ...pdfInfo,
                              currentPage: currentPageNum + 1
                            }
                          });
                        }
                      }}
                      disabled={currentPageNum >= totalPages}
                      className="p-1 hover:bg-white/15 rounded-lg disabled:opacity-30 text-teal-300 transition"
                      title="الصفحة التالية"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="w-px h-4 bg-white/15 mx-0.5" />

                    {/* Zoom Out */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateElement(el.id, {
                          width: Math.max(280, currentWidth * 0.85)
                        });
                      }}
                      className="p-1 hover:bg-white/15 rounded-lg text-slate-300 transition"
                      title="تصغير العارض"
                    >
                      <ZoomOut size={13} />
                    </button>

                    {/* Zoom In */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateElement(el.id, {
                          width: Math.min(1200, currentWidth * 1.15)
                        });
                      }}
                      className="p-1 hover:bg-white/15 rounded-lg text-slate-300 transition"
                      title="تكبير العارض للشرح"
                    >
                      <ZoomIn size={13} />
                    </button>

                    {/* Delete Board */}
                    {!isReadOnly && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeElement(el.id);
                        }}
                        className="p-1 hover:bg-red-500/30 rounded-lg text-red-400 transition"
                        title="إزالة العارض"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* PDF Page Display Frame */}
                <div className="relative rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center min-h-[350px] pointer-events-none">
                  {currentPageSrc ? (
                    <img
                      src={currentPageSrc}
                      alt={`PDF Page ${currentPageNum}`}
                      className="w-full h-auto object-contain select-none pointer-events-none rounded-xl"
                      draggable={false}
                    />
                  ) : (
                    <div className="p-12 text-center text-slate-400 text-xs">
                      جارٍ تحميل صفحة المستند...
                    </div>
                  )}
                </div>

                {/* Direct Resize Grip */}
                {!isReadOnly && (
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const startResizeX = e.clientX;
                      const initialW = currentWidth;

                      const onMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = moveEvent.clientX - startResizeX;
                        const newWidth = Math.max(300, Math.min(1300, initialW + deltaX));
                        updateElement(el.id, { width: newWidth });
                      };

                      const onMouseUp = () => {
                        window.removeEventListener('mousemove', onMouseMove);
                        window.removeEventListener('mouseup', onMouseUp);
                      };

                      window.addEventListener('mousemove', onMouseMove);
                      window.addEventListener('mouseup', onMouseUp);
                    }}
                    className="absolute -bottom-2.5 -left-2.5 w-7 h-7 bg-teal-500 hover:bg-teal-400 rounded-full flex items-center justify-center shadow-lg cursor-nwse-resize z-30 transition border-2 border-white no-drag"
                    title="اسحب لتكبير حجم صفحة الكتاب للشرح"
                  >
                    <Maximize2 size={12} className="text-slate-950 rotate-90" />
                  </div>
                )}
              </div>
            );
          }

          // Card 7: Word Card (Standard)
          if (el.type === 'word_card' && el.cardData?.word) {
            return (
              <div
                key={el.id}
                onPointerDown={(e) => handleElementPointerDown(e, el.id, posX, posY)}
                style={{ left: posX, top: posY }}
                className="absolute z-20 bg-slate-950/90 border-2 border-teal-500 rounded-2xl p-4 shadow-2xl text-white w-56 backdrop-blur-md cursor-grab active:cursor-grabbing touch-none select-none"
                dir="rtl"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded-md border border-teal-500/30">
                    {el.cardData.pos || 'مفردة'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => speakArabic(el.cardData?.word || '')}
                      className="p-1 hover:bg-white/10 rounded-lg text-teal-400"
                    >
                      <Volume2 size={14} />
                    </button>
                    {!isReadOnly && (
                      <button
                        onClick={() => removeElement(el.id)}
                        className="p-1 hover:bg-red-500/20 rounded-lg text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-2xl font-black text-white arabic-font my-1 text-center">
                  {el.cardData.word}
                </div>

                {el.cardData.translation && (
                  <div className="text-xs text-slate-400 text-center font-sans">
                    {el.cardData.translation}
                  </div>
                )}
              </div>
            );
          }

          // Card 8: Interactive Sticky Note (ملاحظة لاصقة قابلة للتعديل والمسح والتحريك بدقة)
          if (el.type === 'note' || el.id?.startsWith('note_')) {
            const noteText = el.text !== undefined ? el.text : (el.cardData?.word || '');
            const noteBg = el.color && el.color.startsWith('#') && el.color !== '#ffffff' ? el.color : '#fef08a';

            return (
              <div
                key={el.id}
                onPointerDown={(e) => handleElementPointerDown(e, el.id, posX, posY)}
                onClick={() => setSelectedElementId(el.id)}
                style={{
                  left: posX,
                  top: posY,
                  width: el.width || 230,
                  backgroundColor: noteBg
                }}
                className="absolute z-20 rounded-2xl p-3.5 shadow-2xl text-slate-900 cursor-grab active:cursor-grabbing border-2 border-black/10 ring-2 ring-black/5 select-none touch-none"
                dir="rtl"
              >
                {/* Header with Note Title and Delete Button */}
                <div className="flex items-center justify-between border-b border-black/10 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                    <StickyNote size={14} className="text-amber-800" />
                    <span>ملاحظة لاصقة</span>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeElement(el.id);
                      }}
                      className="p-1 hover:bg-black/10 rounded-lg text-rose-700 hover:text-rose-900 transition no-drag"
                      title="حذف الملاحظة اللاصقة"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {/* Editable Text Area */}
                <textarea
                  value={noteText}
                  onChange={(e) => {
                    updateElement(el.id, {
                      text: e.target.value,
                      cardData: {
                        ...(el.cardData || {}),
                        word: e.target.value
                      }
                    });
                  }}
                  readOnly={isReadOnly}
                  placeholder="اكتب ملاحظتك هنا..."
                  className="w-full bg-transparent resize-none outline-none font-bold text-sm text-slate-900 arabic-font placeholder:text-slate-600/60 h-20 no-drag"
                />
              </div>
            );
          }

          // Card 9: Geometric Shape Card (الأشكال الهندسية)
          if (el.type === 'shape_card' || el.shapeData) {
            const shapeInfo = el.shapeData || { shapeType: 'triangle', isFilled: false };
            const shapeDef = GEOMETRIC_SHAPES.find(s => s.id === shapeInfo.shapeType) || GEOMETRIC_SHAPES[0];
            const isFilled = shapeInfo.isFilled ?? false;
            const shapeColor = el.color || shapeInfo.fillColor || shapeDef.defaultColor;
            const currentSize = el.width || 140;

            return (
              <div
                key={el.id}
                onPointerDown={(e) => handleElementPointerDown(e, el.id, posX, posY)}
                onClick={() => setSelectedElementId(el.id)}
                style={{
                  left: posX,
                  top: posY,
                  width: currentSize,
                  height: currentSize
                }}
                className={`absolute z-20 rounded-2xl p-2 group transition-shadow cursor-grab active:cursor-grabbing select-none touch-none flex flex-col items-center justify-center ${
                  selectedElementId === el.id ? 'ring-2 ring-amber-400 bg-white/5 backdrop-blur-sm' : 'hover:bg-white/5'
                }`}
                dir="rtl"
              >
                {/* Floating Shape Toolbar */}
                {!isReadOnly && (
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-950/95 border border-white/15 px-2 py-1 rounded-xl shadow-2xl z-30 no-drag">
                    {/* Toggle Filled / Outline */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateElement(el.id, {
                          shapeData: {
                            ...shapeInfo,
                            isFilled: !isFilled
                          }
                        });
                      }}
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded-lg transition ${
                        isFilled ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-white/80'
                      }`}
                      title={isFilled ? 'تغيير إلى مفرغ' : 'تغيير إلى مصمت'}
                    >
                      {isFilled ? 'مصمت' : 'مفرغ'}
                    </button>

                    {/* Color Presets */}
                    <div className="flex gap-0.5">
                      {['#10b981', '#ec4899', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'].map((c) => (
                        <button
                          key={c}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateElement(el.id, {
                              color: c,
                              shapeData: { ...shapeInfo, fillColor: c, strokeColor: c }
                            });
                          }}
                          className="w-3.5 h-3.5 rounded-full border border-white/20 hover:scale-125 transition"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>

                    {/* Zoom In / Out */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateElement(el.id, { width: Math.max(70, currentSize * 0.85) });
                      }}
                      className="p-1 hover:bg-white/15 text-slate-300 rounded"
                      title="تصغير"
                    >
                      <ZoomOut size={11} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateElement(el.id, { width: Math.min(450, currentSize * 1.15) });
                      }}
                      className="p-1 hover:bg-white/15 text-slate-300 rounded"
                      title="تكبير"
                    >
                      <ZoomIn size={11} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeElement(el.id);
                      }}
                      className="p-1 hover:bg-red-500/30 text-red-400 rounded"
                      title="حذف الشكل"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}

                {/* SVG Shape Render */}
                <div className="w-full h-full flex items-center justify-center pointer-events-none drop-shadow-md">
                  {shapeDef.renderSVG(isFilled, shapeColor, currentSize - 16)}
                </div>
              </div>
            );
          }

          // Card 10: Interactive YouTube Video Card (فيديو يوتيوب)
          if (el.type === 'youtube_card' || el.videoData) {
            const video = el.videoData || { url: '', videoId: '', title: 'فيديو تعليمي' };
            const currentWidth = el.width || 420;
            const videoId = video.videoId || video.url.replace(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/, '$1');

            return (
              <div
                key={el.id}
                onPointerDown={(e) => handleElementPointerDown(e, el.id, posX, posY)}
                onClick={() => setSelectedElementId(el.id)}
                style={{
                  left: posX,
                  top: posY,
                  width: currentWidth
                }}
                className={`absolute z-20 bg-slate-950/95 border-2 rounded-3xl p-3 shadow-2xl text-white backdrop-blur-xl cursor-grab active:cursor-grabbing touch-none select-none ${
                  selectedElementId === el.id ? 'border-red-500 ring-4 ring-red-500/20' : 'border-red-500/40 hover:border-red-400'
                }`}
                dir="rtl"
              >
                {/* Header Toolbar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/30">
                      <Youtube size={16} />
                    </div>
                    <div className="text-xs font-black text-white arabic-font truncate max-w-[200px]">
                      {video.title || 'فيديو يوتيوب للشرح'}
                    </div>
                  </div>

                  {!isReadOnly && (
                    <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-0.5 rounded-xl border border-white/10 no-drag">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateElement(el.id, { width: Math.max(260, currentWidth * 0.85) });
                        }}
                        className="p-1 hover:bg-white/15 rounded text-slate-300 transition"
                        title="تصغير"
                      >
                        <ZoomOut size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateElement(el.id, { width: Math.min(850, currentWidth * 1.15) });
                        }}
                        className="p-1 hover:bg-white/15 rounded text-slate-300 transition"
                        title="تكبير"
                      >
                        <ZoomIn size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeElement(el.id);
                        }}
                        className="p-1 hover:bg-red-500/30 rounded text-red-400 transition"
                        title="حذف الفيديو"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Responsive 16:9 Iframe Container */}
                <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-video border border-white/10">
                  {videoId ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`}
                      title={video.title || "YouTube video player"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs gap-2">
                      <Film size={28} className="text-slate-600" />
                      <span>رابط الفيديو غير صالح</span>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Card 11: Interactive Spinning Wheel Card (العجلة الدوارة)
          if (el.type === 'wheel_card' || el.wheelData) {
            const wheelData = el.wheelData || { items: ['أحمد', 'سارة', 'محمد', 'فاطمة', 'يوسف', 'مريم'] };

            return (
              <div
                key={el.id}
                onPointerDown={(e) => handleElementPointerDown(e, el.id, posX, posY)}
                onClick={() => setSelectedElementId(el.id)}
                style={{ left: posX, top: posY }}
                className="absolute z-20 bg-slate-950/95 border-2 border-amber-400 rounded-3xl p-3 shadow-2xl text-white backdrop-blur-xl cursor-grab active:cursor-grabbing touch-none select-none ring-2 ring-amber-400/20"
                dir="rtl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                    <Disc size={15} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>عجلة السحب التفاعلية</span>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeElement(el.id);
                      }}
                      className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition no-drag"
                      title="حذف العجلة"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="no-drag">
                  <SpinningWheel
                    initialItems={wheelData.items}
                    isCompact={true}
                  />
                </div>
              </div>
            );
          }

          // Card 12: Interactive Sticker / Emoji Card
          if (el.type === 'sticker' || el.emoji) {
            const emojiChar = el.emoji || el.text || '⭐';
            const stickerSize = el.width || 90;
            return (
              <div
                key={el.id}
                onPointerDown={(e) => handleElementPointerDown(e, el.id, posX, posY)}
                onClick={() => setSelectedElementId(el.id)}
                style={{
                  left: posX,
                  top: posY,
                  width: stickerSize,
                  height: stickerSize
                }}
                className="absolute z-20 flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none group"
              >
                {!isReadOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeElement(el.id);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30 no-drag"
                    title="حذف الملصق"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                <span
                  style={{ fontSize: `${stickerSize * 0.7}px`, lineHeight: 1 }}
                  className="select-none pointer-events-none drop-shadow-xl filter transition-transform group-hover:scale-110"
                >
                  {emojiChar}
                </span>
              </div>
            );
          }

          return null;
        });
      })()}

      {/* Floating Text Input Box */}
      {textInputPos && (
        <div
          style={{ left: textInputPos.x, top: textInputPos.y }}
          className="absolute z-30 bg-slate-900 border-2 border-emerald-400 rounded-2xl p-2 shadow-2xl flex items-center gap-2 -translate-y-full"
        >
          <input
            type="text"
            autoFocus
            value={currentTextValue}
            onChange={(e) => setCurrentTextValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
            placeholder="اكتب باللغة العربية..."
            className="bg-transparent text-white px-3 py-1.5 arabic-font text-lg focus:outline-none w-64"
            dir="rtl"
          />
          <button
            onClick={handleAddText}
            className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition"
          >
            <Check size={16} />
          </button>
        </div>
      )}

      {/* Physical Bottom Shelf Tray (Without Text Labels) */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-6 sm:h-7 pointer-events-none z-10 flex items-center justify-between px-6 ${containerThemeStyles.shelfClass}`}
      >
        {/* Left side physical tools tray */}
        <div className="flex items-center gap-2">
          {theme === 'blackboard' && (
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-0.5 rounded-md border border-white/10 shadow-inner">
              <span className="w-6 h-2 rounded-sm bg-white shadow-xs" />
              <span className="w-6 h-2 rounded-sm bg-yellow-200 shadow-xs" />
              <span className="w-6 h-2 rounded-sm bg-cyan-200 shadow-xs" />
              <span className="w-6 h-2 rounded-sm bg-pink-300 shadow-xs" />
              <span className="w-10 h-3 rounded-sm bg-[#5c371d] border border-[#78431e] shadow-sm ml-2" />
            </div>
          )}
          {theme === 'whiteboard' && (
            <div className="flex items-center gap-1.5 bg-slate-300/80 px-3 py-0.5 rounded-md border border-slate-400/40 shadow-inner">
              <span className="w-8 h-2 rounded-full bg-slate-900 shadow-xs" />
              <span className="w-8 h-2 rounded-full bg-blue-600 shadow-xs" />
              <span className="w-8 h-2 rounded-full bg-red-600 shadow-xs" />
              <span className="w-8 h-2 rounded-full bg-emerald-600 shadow-xs" />
              <span className="w-10 h-3 rounded-md bg-slate-700 shadow-sm ml-2" />
            </div>
          )}
          {theme === 'notebook' && (
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-0.5 rounded-md border border-white/10">
              <span className="w-8 h-2 rounded-full bg-blue-900 shadow-xs" />
              <span className="w-8 h-2 rounded-full bg-black shadow-xs" />
              <span className="w-8 h-2 rounded-full bg-red-800 shadow-xs" />
            </div>
          )}
          {theme === 'calligraphy_9lines' && (
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-0.5 rounded-md border border-amber-900/30">
              <span className="w-8 h-2 rounded-sm bg-slate-700 shadow-xs" />
              <span className="w-8 h-2 rounded-sm bg-amber-900 shadow-xs" />
              <span className="w-8 h-2 rounded-sm bg-red-900 shadow-xs" />
            </div>
          )}
        </div>

        {/* Right side subtle metallic / wood notch */}
        <div className="flex items-center gap-1.5 opacity-40">
          <div className="w-12 h-1 rounded-full bg-black/30" />
        </div>
      </div>
    </div>
  );
};
