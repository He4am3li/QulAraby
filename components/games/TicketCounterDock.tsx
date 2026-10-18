import React from 'react';
import { motion } from 'framer-motion';

export interface DestinationLine {
  id: string;
  title: string;
  label: string;
  subtitle: string;
  isCurrent: boolean;
}

export const DESTINATION_LINES: DestinationLine[] = [
  {
    id: 'parts_of_speech_sentence',
    title: 'الجملة الاسمية والفعلية',
    label: 'الاسم والفعل والحرف',
    subtitle: 'رحلة ممتعة لاكتشاف الجملة الاسمية والجملة الفعلية',
    isCurrent: true,
  },
  {
    id: 'singular_dual_plural',
    title: 'المفرد والمثنى والجمع',
    label: 'المفرد والمثنى والجمع',
    subtitle: 'رحلة استكشاف دلالات العدد وتحويل حمولة العربات',
    isCurrent: false,
  },
  {
    id: 'verb_and_subject',
    title: 'الفعل والفاعل',
    label: 'الفعل والفاعل',
    subtitle: 'رحلة اكتشاف من قام بالفعل ووصل عربة الفاعل',
    isCurrent: false,
  },
  {
    id: 'mubtada_and_khabar',
    title: 'المبتدأ والخبر',
    label: 'المبتدأ والخبر',
    subtitle: 'رحلة استكشاف ركني الجملة الاسمية وتطابقهما',
    isCurrent: false,
  },
  {
    id: 'kana_and_sisters',
    title: 'الأفعال الناسخة',
    label: 'الأفعال الناسخة',
    subtitle: 'رحلة كان وأخواتها وتغيير حركات المبتدأ والخبر',
    isCurrent: false,
  },
  {
    id: 'inna_and_sisters',
    title: 'الحروف الناسخة',
    label: 'الحروف الناسخة',
    subtitle: 'رحلة إنّ وأخواتها وتوكيد الجملة وتركيبها',
    isCurrent: false,
  },
  {
    id: 'prepositions',
    title: 'حروف الجر',
    label: 'حروف الجر',
    subtitle: 'رحلة قطار الجر والاسم المجرور وتجرير المعاني',
    isCurrent: false,
  },
];

interface TicketCounterDockProps {
  selectedLineId: string;
  onSelectLine: (line: DestinationLine) => void;
  playSound?: (type: string) => void;
}

export const TicketCounterDock: React.FC<TicketCounterDockProps> = ({
  selectedLineId,
  onSelectLine,
  playSound,
}) => {
  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Title Badge Pill above dock: "شباك التذاكر" with NO stars, exactly as requested */}
      <div className="relative z-10 -mb-3">
        <div className="px-6 py-1 rounded-full bg-[#051c22] border border-teal-400/50 shadow-[0_4px_12px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wider font-serif">
            شباك التذاكر
          </span>
        </div>
      </div>

      {/* Main Glassmorphic Dock Container */}
      <div className="w-full bg-[#041619]/90 backdrop-blur-xl border border-teal-500/40 rounded-3xl pt-5 pb-3.5 px-3 sm:px-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        {/* Scrollable / Responsive Row of 7 Destination Buttons */}
        <div 
          className="flex items-center justify-between gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1 px-1"
          dir="rtl"
        >
          {DESTINATION_LINES.map((dest) => {
            const isSelected = selectedLineId === dest.id;

            return (
              <motion.button
                key={dest.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (playSound) playSound('click');
                  onSelectLine(dest);
                }}
                className={`flex flex-col items-center justify-between min-w-[76px] sm:min-w-[100px] flex-1 py-2 px-1.5 rounded-2xl transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-500/25 via-teal-900/50 to-[#021316]/90 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                    : 'bg-[#061d22]/70 hover:bg-teal-950/80 border border-teal-500/30 hover:border-teal-400/60'
                }`}
                title={dest.title}
              >
                {/* Visual Icon Art matching image.png */}
                <div className="h-12 w-full flex items-center justify-center mb-1.5">
                  {dest.id === 'parts_of_speech_sentence' && (
                    /* 3 Blocks: [ أ ] [ ف ] [ ح ] */
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-7 sm:w-7 sm:h-8 rounded-lg bg-gradient-to-b from-amber-200/90 to-amber-600/90 border border-amber-300 flex items-center justify-center shadow-md">
                        <span className="text-xs sm:text-sm font-black text-amber-950 font-serif">ح</span>
                      </div>
                      <div className="w-6 h-7 sm:w-7 sm:h-8 rounded-lg bg-gradient-to-b from-amber-200/90 to-amber-600/90 border border-amber-300 flex items-center justify-center shadow-md">
                        <span className="text-xs sm:text-sm font-black text-amber-950 font-serif">ف</span>
                      </div>
                      <div className="w-6 h-7 sm:w-7 sm:h-8 rounded-lg bg-gradient-to-b from-amber-200/90 to-amber-600/90 border border-amber-300 flex items-center justify-center shadow-md">
                        <span className="text-xs sm:text-sm font-black text-amber-950 font-serif">أ</span>
                      </div>
                    </div>
                  )}

                  {dest.id === 'singular_dual_plural' && (
                    /* Open Book with 3 sections: مفرد / مثنى / جمع */
                    <div className="relative w-11 h-9 sm:w-12 sm:h-10 rounded-lg bg-[#0b2b30] border border-amber-400/70 p-1 flex items-center justify-around shadow-md">
                      <div className="flex flex-col items-center text-[7px] font-black text-amber-200 leading-tight">
                        <span>مفرد</span>
                        <div className="w-3 h-[1px] bg-amber-400/50 my-0.5" />
                        <span>مثنى</span>
                      </div>
                      <div className="w-[1px] h-6 bg-amber-400/60" />
                      <div className="flex flex-col items-center text-[7px] font-black text-amber-200 leading-tight">
                        <span>جمع</span>
                        <div className="w-3 h-[1px] bg-amber-400/50 my-0.5" />
                        <span>سالم</span>
                      </div>
                    </div>
                  )}

                  {dest.id === 'verb_and_subject' && (
                    /* Dynamic Running Silhouette with ball / action */
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-600/30 to-teal-800/40 border border-amber-400/60 flex items-center justify-center shadow-md">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-300 fill-current">
                        {/* Running athlete figure */}
                        <circle cx="15" cy="5" r="2.2" />
                        <path d="M 14 8 L 11 11 L 8 10 L 5 12 L 6 13.5 L 9 12 L 12 14 L 10 19 L 12 19.5 L 14 15 L 17 15 L 18 13 L 14 13 L 14.5 9.5 Z" />
                        {/* Ball */}
                        <circle cx="18" cy="18" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    </div>
                  )}

                  {dest.id === 'mubtada_and_khabar' && (
                    /* Two Stacked Cards: [ المبتدأ ] / [ الخبر ] */
                    <div className="flex flex-col gap-1 w-12 sm:w-14">
                      <div className="py-0.5 px-1 rounded-md bg-amber-400/20 border border-amber-400/60 text-center shadow-xs">
                        <span className="text-[8px] sm:text-[9px] font-black text-amber-200">المبتدأ</span>
                      </div>
                      <div className="py-0.5 px-1 rounded-md bg-amber-400/20 border border-amber-400/60 text-center shadow-xs">
                        <span className="text-[8px] sm:text-[9px] font-black text-amber-200">الخبر</span>
                      </div>
                    </div>
                  )}

                  {dest.id === 'kana_and_sisters' && (
                    /* Oval Cartouche with Calligraphy: كان */
                    <div className="w-12 h-8 sm:w-14 sm:h-9 rounded-full bg-gradient-to-r from-amber-950/70 via-amber-900/60 to-amber-950/70 border border-amber-400/80 flex items-center justify-center shadow-md">
                      <span className="text-xs sm:text-sm font-black text-amber-200 font-serif tracking-wide drop-shadow">
                        كانَ
                      </span>
                    </div>
                  )}

                  {dest.id === 'inna_and_sisters' && (
                    /* Oval Cartouche with Calligraphy: إنّ */
                    <div className="w-12 h-8 sm:w-14 sm:h-9 rounded-full bg-gradient-to-r from-amber-950/70 via-amber-900/60 to-amber-950/70 border border-amber-400/80 flex items-center justify-center shadow-md">
                      <span className="text-xs sm:text-sm font-black text-amber-200 font-serif tracking-wide drop-shadow">
                        إِنَّ
                      </span>
                    </div>
                  )}

                  {dest.id === 'prepositions' && (
                    /* Round Emblem with Calligraphy: الجَرّ */
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#061e22] border-2 border-amber-400/80 flex items-center justify-center shadow-md">
                      <span className="text-xs sm:text-sm font-black text-amber-200 font-serif tracking-tight drop-shadow">
                        الجَرّ
                      </span>
                    </div>
                  )}
                </div>

                {/* Destination Label */}
                <span className={`text-[10px] sm:text-[11px] font-bold text-center leading-tight transition-colors ${
                  isSelected ? 'text-amber-200 font-black' : 'text-teal-200/80 group-hover:text-amber-300'
                }`}>
                  {dest.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
