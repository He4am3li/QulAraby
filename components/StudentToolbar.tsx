import React, { useState, useEffect } from 'react';
import { Type, Image, Pencil, StickyNote, X, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentToolbarProps {
  onAction: (action: string) => void;
}

export const StudentToolbar: React.FC<StudentToolbarProps> = ({ onAction }) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [lang, setLang] = useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const updateLang = () => {
      setLang((localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar');
    };
    window.addEventListener('langChanged', updateLang);
    return () => window.removeEventListener('langChanged', updateLang);
  }, []);

  // Calculate the exact center of the whiteboard container (not the entire page)
  const [boardCenterX, setBoardCenterX] = useState<string>('50%');

  useEffect(() => {
    const updatePosition = () => {
      const whiteboardContainer = document.getElementById('qul-whiteboard-container') || document.getElementById('qul-whiteboard-canvas-area') || document.querySelector('main');
      if (whiteboardContainer) {
        const rect = whiteboardContainer.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        setBoardCenterX(`${center}px`);
      } else {
        const isMobileScreen = window.innerWidth < 768;
        if (isMobileScreen) {
          setBoardCenterX('50%');
        } else {
          setBoardCenterX(lang === 'ar' ? 'calc(50% - 40px)' : 'calc(50% + 40px)');
        }
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    let observer: ResizeObserver | null = null;
    const whiteboardContainer = document.getElementById('qul-whiteboard-container') || document.querySelector('main');
    if (whiteboardContainer) {
      observer = new ResizeObserver(updatePosition);
      observer.observe(whiteboardContainer);
    }

    const interval = setInterval(updatePosition, 250);

    return () => {
      window.removeEventListener('resize', updatePosition);
      if (observer) observer.disconnect();
      clearInterval(interval);
    };
  }, [lang]);

  const isSidebarRight = lang === 'ar';
  const sidebarGradient = 'linear-gradient(to left, #0f172a 0%, #064e3b 100%)';

  const tools = [
    { id: 'text', icon: <Type size={18} />, label: 'نص', color: 'bg-indigo-500' },
    { id: 'sticky', icon: <StickyNote size={18} />, label: 'ملاحظة لاصقة', color: 'bg-amber-500' },
    { id: 'image', icon: <Image size={18} />, label: 'إرفاق صورة', color: 'bg-emerald-500' },
    { id: 'pen', icon: <Pencil size={18} />, label: 'قلم', color: 'bg-amber-500' },
  ];

  return (
    <div 
      className="fixed bottom-6 z-[9999] flex items-center gap-3 student-toolbar-container -translate-x-1/2 transition-all duration-300 pointer-events-auto"
      style={{
        left: boardCenterX,
        direction: isSidebarRight ? 'rtl' : 'ltr'
      }}
    >
      <AnimatePresence>
        {!isMinimized && (
          <motion.div 
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            className="border border-white/10 p-1 rounded-2xl shadow-2xl flex flex-row items-center gap-0.5 relative overflow-visible"
            style={{ background: sidebarGradient }}
          >
            {/* Glass Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none rounded-2xl" />
            
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onAction(tool.id)}
                className={`
                  relative group p-2 rounded-xl transition-all duration-300
                  text-white/60 hover:bg-white/5 hover:text-white relative z-10
                `}
                title={tool.label}
              >
                {tool.icon}
                <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-xl">
                  {tool.label}
                </div>
              </button>
            ))}
            
            <div className="mx-1 h-6 w-px bg-white/10 relative z-10" />
            
            <button 
              onClick={() => onAction('submit')}
              className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-900/20 hover:bg-amber-400 transition-all relative z-10"
              title="تسليم"
            >
              <Send size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMinimized(!isMinimized)}
        className="backdrop-blur-xl border border-white/10 p-1.5 rounded-full text-white/70 hover:text-white transition-all shadow-xl hover:border-white/20 active:scale-95 flex items-center justify-center"
        style={{ background: sidebarGradient }}
        title={isMinimized ? 'إظهار شريط أدوات الطالب' : 'تصغير شريط الأدوات'}
      >
        <div className="flex items-center justify-center">
          {isMinimized ? (
            <ChevronUp size={16} className="text-white/80 hover:text-white transition-colors" />
          ) : (
            <ChevronDown size={16} className="text-white/80 hover:text-white transition-colors" />
          )}
        </div>
      </motion.button>
    </div>
  );
};
