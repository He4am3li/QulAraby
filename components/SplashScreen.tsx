
import React from 'react';

const LANGUAGES = [
  { label: 'English', isHero: false },
  { label: 'Français', isHero: false },
  { label: 'हिंदी भाषा', isHero: false },
  { label: '中文', isHero: false },
  { label: 'اللغة العربية', isHero: true },
  { label: 'Indonesia', isHero: false },
  { label: '한국어', isHero: false },
  { label: 'Wikang Pilipino', isHero: false },
  { label: 'اردو', isHero: false },
];

const AR_CHARS = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'];

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = React.useState<'entry' | 'wait' | 'open' | 'burst' | 'exit'>('entry');

  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase('wait'), 600);   
    const t2 = setTimeout(() => setPhase('open'), 1600);  
    const t3 = setTimeout(() => setPhase('burst'), 2400); 
    const t4 = setTimeout(() => setPhase('exit'), 5500);  
    const t5 = setTimeout(onComplete, 6800); // Trigger completion slightly before peel animation ends for overlap

    return () => {
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[1000] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0d9488] overflow-hidden">
      
      {/* THE MAIN PAGE LAYER */}
      <div 
        className={`absolute inset-0 z-[1001] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0d9488] flex items-center justify-center transition-all duration-[1600ms] ease-in-out transform-gpu will-change-[clip-path,transform,opacity]
        ${phase === 'exit' ? 'animate-page-peel opacity-0' : ''}`}
      >
        {/* Shadow Overlay for the Peel Effect */}
        <div className={`absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-transparent pointer-events-none transition-opacity duration-1000 ${phase === 'exit' ? 'opacity-100' : 'opacity-0'}`} />

        {/* Subtle Ambient Light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(37,99,235,0.1),_transparent_70%)] animate-pulse" />

        {/* 3D Grid Content */}
        <div className={`relative grid grid-cols-3 gap-8 md:gap-16 p-8 transform-gpu transition-all duration-[1000ms] ease-out
          ${phase === 'exit' ? 'scale-95 blur-md' : 'scale-100 blur-0'}`}
             style={{ transform: 'rotateX(50deg) rotateZ(-30deg)', transformStyle: 'preserve-3d' }}>
          
          {LANGUAGES.map((lang, i) => (
            <div 
              key={i}
              className={`relative w-24 h-24 md:w-44 md:h-44 transition-all duration-700
                ${phase === 'entry' ? 'translate-z-[-800px] opacity-0 scale-50' : 'translate-z-0 opacity-100 scale-100'}
              `}
              style={{ transitionDelay: `${i * 30}ms`, transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
                {/* Glow behind boxes */}
                <div className={`absolute inset-0 bg-blue-500/10 translate-z-[-30px] blur-[40px] rounded-full scale-110 transition-all duration-1000 ${lang.isHero && (phase === 'open' || phase === 'burst') ? 'bg-cyan-400/40 blur-[80px] scale-150 opacity-100' : 'opacity-50'}`} />
                
                {/* BOX BASE & INNER LIGHT (Visible when lid lifts) */}
                {lang.isHero && (
                  <div className="absolute inset-0 rounded-[2.5rem] translate-z-[-10px] flex items-center justify-center overflow-visible" style={{ transformStyle: 'preserve-3d' }}>
                     {/* RADIANT INNER CORE - THE LIGHT SOURCE */}
                     <div className={`absolute inset-0 bg-gradient-to-t from-cyan-300 via-white to-white rounded-[2.5rem] transition-all duration-1000 blur-xl shadow-[0_0_100px_rgba(255,255,255,1)]
                       ${phase === 'burst' ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`} />
                     
                     {/* VOLUMETRIC LIGHT BEAM */}
                     <div className={`absolute w-16 h-80 bg-gradient-to-t from-white via-cyan-200/40 to-transparent blur-3xl origin-bottom transition-all duration-1000 transform-gpu
                       ${phase === 'burst' ? 'opacity-90 -translate-z-60 scale-y-150' : 'opacity-0 scale-y-0'}`} 
                       style={{ transform: 'rotateX(-90deg)' }} />

                     {/* CHARACTERS BURSTING FROM THE INNER BLUE PART (BELOW THE LID) */}
                     {phase === 'burst' && (
                      <div className="absolute inset-0 z-[100]" style={{ transformStyle: 'preserve-3d' }}>
                        {[...Array(90)].map((_, idx) => (
                          <div
                            key={idx}
                            className="absolute arabic-font animate-fountain-flow-enhanced"
                            style={{
                              left: '50%',
                              top: '70%', // Start from the bottom interior of the opening
                              fontSize: `${14 + Math.random() * 12}px`,
                              color: 'rgba(255, 255, 255, 0.95)',
                              fontWeight: '900',
                              textShadow: '0 0 10px rgba(0,0,0,1), 0 0 20px rgba(34, 211, 238, 0.5)',
                              zIndex: 150,
                              '--tx': `${800 + Math.random() * 1200}px`, 
                              '--ty': `${(Math.random() - 0.5) * 1400}px`,
                              '--tz': `${1200 + Math.random() * 1600}px`,
                              '--tr': `${Math.random() * 1080}deg`,
                              animationDelay: `${idx * 20}ms`
                            } as React.CSSProperties}
                        >
                          {AR_CHARS[Math.floor(Math.random() * AR_CHARS.length)]}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* BOX LID - SLIDES UP VERTICALLY CARRYING THE TEXT */}
              <div 
                className={`absolute inset-0 rounded-[2.5rem] shadow-2xl z-20 border border-white/30 flex items-center justify-center transition-all duration-[1200ms] cubic-bezier(0.2, 0.8, 0.2, 1) transform-gpu origin-top
                  bg-gradient-to-br from-[#2563eb] to-[#059669]
                  ${lang.isHero && (phase === 'open' || phase === 'burst' || phase === 'exit') ? 'translate-z-[160px] -translate-y-24 shadow-[0_80px_120px_rgba(0,0,0,0.7)]' : ''}
                  ${!lang.isHero || phase === 'entry' || phase === 'wait' ? 'rotate-x-0 opacity-100 scale-100 translate-y-0 shadow-2xl translate-z-0' : ''}
                `}
                style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
              >
                {/* Surface Shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent opacity-80 rounded-[2.5rem]" />
                
                {/* THE LABEL - UNIFIED SIZE FOR ALL */}
                <div className="flex flex-col items-center text-center px-4 relative z-10">
                  <span className={`text-white font-black tracking-widest transition-all duration-700 text-xs md:text-sm
                    ${lang.isHero ? 'arabic-font' : 'opacity-95'}
                    ${lang.isHero && (phase === 'open' || phase === 'burst') ? 'drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]' : ''}
                  `}>
                    {lang.label}
                  </span>
                </div>
              </div>

              {/* BOX INTERIOR BASE */}
              {lang.isHero && (
                <div className={`absolute inset-0 rounded-[2.5rem] bg-slate-900 border-2 border-white/10 translate-z-[-15px] shadow-[inset_0_0_80px_rgba(37,99,235,0.6)] transition-opacity duration-500 ${phase === 'entry' || phase === 'wait' ? 'opacity-0' : 'opacity-100'}`} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

      <style>{`
        @keyframes page-peel {
          0% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); transform: translateX(0); }
          100% { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); transform: translateX(-20%); }
        }
        @keyframes fountain-flow-enhanced {
          0% { 
            transform: translate(-50%, 0) translateZ(-50px) scale(0) rotate(0); 
            opacity: 0; 
            filter: blur(10px); 
          }
          /* Pop out from the deep blue interior revealed under the lifted lid */
          15% { 
            transform: translate(-50%, -240%) translateZ(600px) scale(1.8) rotate(45deg); 
            opacity: 1; 
            filter: blur(0px); 
          }
          80% { opacity: 0.9; }
          100% { 
            transform: translate(var(--tx), var(--ty)) translateZ(var(--tz)) rotate(var(--tr)) scale(0.9); 
            opacity: 0; 
            filter: blur(6px); 
          }
        }
        .animate-fountain-flow-enhanced { animation: fountain-flow-enhanced 5.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards; }
        .animate-page-peel { animation: page-peel 1.8s cubic-bezier(0.645, 0.045, 0.355, 1) forwards; }
      `}</style>
    </div>
  );
};
