import React from 'react';
import { CalligraphyBackgroundId } from './calligraphyStudioData';

interface BackgroundRendererProps {
  bgId: CalligraphyBackgroundId;
}

export const CalligraphyBackgroundRenderer: React.FC<BackgroundRendererProps> = ({ bgId }) => {
  switch (bgId) {
    // 1. ورق قطني مائي يدوي ناعم معتدل (لك في القلب مقام)
    case 'card_1_watercolor_paper':
      return (
        <div className="absolute inset-0 w-full h-full bg-[#faf7f2] overflow-hidden">
          {/* Subtle paper grain texture */}
          <div 
            className="absolute inset-0 opacity-40 mix-blend-multiply"
            style={{
              backgroundImage: `radial-gradient(#dcd5c7 1px, transparent 1px), radial-gradient(#e5dfd2 1px, #faf7f2 1px)`,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px'
            }}
          />
          {/* Soft ambient vignette */}
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#ebd9bf]/30" />
        </div>
      );

    // 2. كانفاس عاجي فاخر معتق (شكر وتقدير)
    case 'card_2_cream_canvas':
      return (
        <div className="absolute inset-0 w-full h-full bg-[#fbf6ea] overflow-hidden">
          {/* Canvas cross-weave */}
          <div 
            className="absolute inset-0 opacity-25 mix-blend-multiply"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(160,130,90,0.12) 1px, transparent 1px), linear-gradient(0deg, rgba(160,130,90,0.12) 1px, transparent 1px)`,
              backgroundSize: '6px 6px'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f5ede0]/60 via-transparent to-[#ecdcc8]/60" />
        </div>
      );

    // 3. ورق كتان ناصع البياض (وقل رب زدني علما)
    case 'card_3_white_linen':
      return (
        <div className="absolute inset-0 w-full h-full bg-[#fcfcfd] overflow-hidden">
          {/* Very delicate linen weave */}
          <div 
            className="absolute inset-0 opacity-20 mix-blend-multiply"
            style={{
              backgroundImage: `linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)`,
              backgroundSize: '8px 8px'
            }}
          />
          <div className="absolute inset-0 border-[6px] border-white/80 shadow-inner" />
        </div>
      );

    // 4. ورق قطن دافئ معتق نقي (بسم الله نبدأ)
    case 'card_4_cotton_deckle':
      return (
        <div className="absolute inset-0 w-full h-full bg-[#f6f3eb] overflow-hidden">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(#b8af9b 0.75px, transparent 0.75px)',
              backgroundSize: '12px 12px'
            }}
          />
          <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(180,160,130,0.2)]" />
        </div>
      );

    // 5. إكليل أزهار الباستيل الرقيقة (دع الأيام تفعل ما تشاء)
    case 'card_5_pastel_floral_wreath':
      return (
        <div className="absolute inset-0 w-full h-full bg-[#faf8f5] overflow-hidden">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500" preserveAspectRatio="none">
            <defs>
              <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Elliptical wreath ring */}
            <ellipse cx="250" cy="250" rx="200" ry="190" fill="none" stroke="#fbcfe8" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
            
            {/* Top Floral Cluster */}
            <g transform="translate(250, 45)">
              <circle cx="0" cy="0" r="18" fill="#fda4af" opacity="0.85" />
              <circle cx="-16" cy="6" r="14" fill="#f472b6" opacity="0.8" />
              <circle cx="16" cy="6" r="14" fill="#fb7185" opacity="0.8" />
              <circle cx="-4" cy="-4" r="10" fill="#fff1f2" />
              {/* Eucalyptus leaves */}
              <path d="M-30,-5 C-45,-15 -50,-5 -35,5 Z" fill="#86efac" opacity="0.8" />
              <path d="M30,-5 C45,-15 50,-5 35,5 Z" fill="#86efac" opacity="0.8" />
            </g>

            {/* Bottom Floral Cluster */}
            <g transform="translate(250, 455)">
              <circle cx="0" cy="0" r="18" fill="#fda4af" opacity="0.85" />
              <circle cx="-16" cy="-6" r="14" fill="#f472b6" opacity="0.8" />
              <circle cx="16" cy="-6" r="14" fill="#fb7185" opacity="0.8" />
              <circle cx="4" cy="4" r="10" fill="#fff1f2" />
              <path d="M-30,5 C-45,15 -50,5 -35,-5 Z" fill="#86efac" opacity="0.8" />
              <path d="M30,5 C45,15 50,5 35,-5 Z" fill="#86efac" opacity="0.8" />
            </g>

            {/* Left Leaf Vines */}
            <g transform="translate(45, 250)">
              <circle cx="0" cy="0" r="12" fill="#fed7aa" opacity="0.8" />
              <path d="M-5,-25 Q-15,-10 0,0 Q-15,10 -5,25" stroke="#a7f3d0" strokeWidth="3" fill="none" />
              <circle cx="0" cy="-20" r="6" fill="#f472b6" opacity="0.7" />
              <circle cx="0" cy="20" r="6" fill="#f472b6" opacity="0.7" />
            </g>

            {/* Right Leaf Vines */}
            <g transform="translate(455, 250)">
              <circle cx="0" cy="0" r="12" fill="#fed7aa" opacity="0.8" />
              <path d="M5,-25 Q15,-10 0,0 Q15,10 5,25" stroke="#a7f3d0" strokeWidth="3" fill="none" />
              <circle cx="0" cy="-20" r="6" fill="#f472b6" opacity="0.7" />
              <circle cx="0" cy="20" r="6" fill="#f472b6" opacity="0.7" />
            </g>
          </svg>
        </div>
      );

    // 6. باقات وتوريقات أزهار ربيعية متناسقة (بالخير واللطف تزهر القلوب)
    case 'card_6_vertical_spring_vines':
      return (
        <div className="absolute inset-0 w-full h-full bg-[#fbf9f4] overflow-hidden">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500" preserveAspectRatio="none">
            {/* Left Vertical Vine */}
            <g transform="translate(25, 0)">
              <path d="M15,20 Q30,120 15,250 Q0,380 15,480" stroke="#15803d" strokeWidth="2.5" fill="none" opacity="0.7" />
              {/* Leaves & Blooms along the vine */}
              <circle cx="22" cy="70" r="8" fill="#ec4899" opacity="0.85" />
              <path d="M18,90 Q35,80 30,95 Q15,105 18,90 Z" fill="#22c55e" />
              <circle cx="10" cy="180" r="9" fill="#f43f5e" opacity="0.85" />
              <circle cx="20" cy="300" r="8" fill="#a855f7" opacity="0.8" />
              <path d="M18,330 Q35,320 30,335 Q15,345 18,330 Z" fill="#22c55e" />
              <circle cx="12" cy="420" r="9" fill="#ec4899" opacity="0.85" />
            </g>

            {/* Right Vertical Vine */}
            <g transform="translate(460, 0)">
              <path d="M15,20 Q0,120 15,250 Q30,380 15,480" stroke="#15803d" strokeWidth="2.5" fill="none" opacity="0.7" />
              <circle cx="8" cy="70" r="8" fill="#ec4899" opacity="0.85" />
              <path d="M12,90 Q-5,80 0,95 Q15,105 12,90 Z" fill="#22c55e" />
              <circle cx="20" cy="180" r="9" fill="#f43f5e" opacity="0.85" />
              <circle cx="10" cy="300" r="8" fill="#a855f7" opacity="0.8" />
              <path d="M12,330 Q-5,320 0,335 Q15,345 12,330 Z" fill="#22c55e" />
              <circle cx="18" cy="420" r="9" fill="#ec4899" opacity="0.85" />
            </g>
          </svg>
        </div>
      );

    // 7. صحن خزف صيني أندلسي أزرق مصقول (فن يلامس الروح)
    case 'card_7_delft_ceramic_plate':
      return (
        <div className="absolute inset-0 w-full h-full bg-[#f8fafc] flex items-center justify-center overflow-hidden">
          {/* Ceramic Plate concentric circles */}
          <div className="relative w-[92%] h-[92%] rounded-full bg-white shadow-[0_10px_35px_rgba(30,58,138,0.12),inset_0_2px_12px_rgba(255,255,255,0.9),inset_0_-8px_20px_rgba(30,58,138,0.06)] border border-slate-200 flex items-center justify-center">
            {/* Delft Cobalt Blue Ornamental Circular Wreath */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none p-4" viewBox="0 0 400 400">
              {/* Outer Ring */}
              <circle cx="200" cy="200" r="180" fill="none" stroke="#1d4ed8" strokeWidth="2" opacity="0.8" />
              <circle cx="200" cy="200" r="172" fill="none" stroke="#1d4ed8" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
              
              {/* Cobalt Delft decorative petals along the border */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
                <g key={angle} transform={`rotate(${angle} 200 200)`}>
                  <path d="M200,22 C194,32 190,40 200,46 C210,40 206,32 200,22 Z" fill="#1d4ed8" />
                  <circle cx="200" cy="52" r="2.5" fill="#3b82f6" />
                </g>
              ))}

              {/* Inner subtle rim */}
              <circle cx="200" cy="200" r="145" fill="none" stroke="#93c5fd" strokeWidth="0.75" opacity="0.5" />
            </svg>
          </div>
        </div>
      );

    // 8. ورق ألوان مائية ثقيل مع تأثير بروز ثلاثي الأبعاد (عز وفخر)
    case 'card_8_embossed_heavy_paper':
      return (
        <div className="absolute inset-0 w-full h-full bg-[#f5f1e8] overflow-hidden">
          {/* Heavy cold-press paper grain */}
          <div 
            className="absolute inset-0 opacity-45 mix-blend-overlay"
            style={{
              backgroundImage: 'radial-gradient(#a3937d 1px, transparent 1px)',
              backgroundSize: '10px 10px'
            }}
          />
          {/* Embossed inset bevel */}
          <div className="absolute inset-3 border-2 border-white/60 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.08),inset_-2px_-2px_6px_rgba(255,255,255,0.9)] rounded-sm" />
        </div>
      );

    // 9. مخمل ليلي كحلي داكن ملكي (الحمد لله)
    case 'card_9_midnight_velvet_gold':
      return (
        <div className="absolute inset-0 w-full h-full bg-[#0b0f19] overflow-hidden">
          {/* Obsidian dark texture */}
          <div 
            className="absolute inset-0 opacity-30 mix-blend-soft-light"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 0.5px, transparent 0.5px)',
              backgroundSize: '16px 16px'
            }}
          />
          {/* Royal gold subtle border line */}
          <div className="absolute inset-4 border border-amber-500/20 rounded-md" />
          <div className="absolute inset-5 border border-amber-400/10 rounded-sm" />
          {/* Ambient center lighting */}
          <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-black/80 pointer-events-none" />
        </div>
      );

    // 10. أشعة ريترو سبعينية منطلقة (سبعينيات)
    case 'card_10_retro_sunburst':
      return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#faeed1]">
          {/* 1970s Sunburst Radial Rays */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500" preserveAspectRatio="none">
            <g transform="translate(250, 250)">
              {/* Radial striped rays */}
              {[
                { angle: 0, color: '#d9532f' },
                { angle: 22.5, color: '#faeed1' },
                { angle: 45, color: '#f28e2b' },
                { angle: 67.5, color: '#faeed1' },
                { angle: 90, color: '#4e79a7' },
                { angle: 112.5, color: '#faeed1' },
                { angle: 135, color: '#76b7b2' },
                { angle: 157.5, color: '#faeed1' },
                { angle: 180, color: '#d9532f' },
                { angle: 202.5, color: '#faeed1' },
                { angle: 225, color: '#f28e2b' },
                { angle: 247.5, color: '#faeed1' },
                { angle: 270, color: '#4e79a7' },
                { angle: 292.5, color: '#faeed1' },
                { angle: 315, color: '#76b7b2' },
                { angle: 337.5, color: '#faeed1' }
              ].map((ray, i) => (
                <path
                  key={i}
                  d={`M0,0 L${500 * Math.cos((ray.angle * Math.PI) / 180)},${500 * Math.sin((ray.angle * Math.PI) / 180)} L${500 * Math.cos(((ray.angle + 22.5) * Math.PI) / 180)},${500 * Math.sin(((ray.angle + 22.5) * Math.PI) / 180)} Z`}
                  fill={ray.color}
                  opacity={ray.color === '#faeed1' ? 0.9 : 0.85}
                />
              ))}
            </g>
          </svg>
          {/* Retro grain filter overlay */}
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply" />
        </div>
      );

    // 11. باقة أزهار برية رقيقة في الأسفل (ستبدي لك الأيام ما كنت جاهلا)
    case 'card_11_bottom_wildflowers':
      return (
        <div className="absolute inset-0 w-full h-full bg-[#faf9f6] overflow-hidden flex flex-col justify-between">
          <div className="flex-1" />
          {/* Bottom Wildflower Garden Border */}
          <svg className="w-full h-28 pointer-events-none overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
            {/* Green stems */}
            {[20, 50, 85, 120, 160, 200, 240, 280, 320, 360, 400, 440, 475].map((x, i) => (
              <path
                key={i}
                d={`M${x},120 Q${x + (i % 2 === 0 ? 10 : -10)},60 ${x},${30 + (i % 3) * 15}`}
                stroke="#15803d"
                strokeWidth="2"
                fill="none"
              />
            ))}
            {/* Blossom heads */}
            <circle cx="50" cy="45" r="10" fill="#f43f5e" />
            <circle cx="50" cy="45" r="4" fill="#fef08a" />

            <circle cx="120" cy="35" r="12" fill="#3b82f6" />
            <circle cx="120" cy="35" r="5" fill="#fde047" />

            <circle cx="200" cy="50" r="11" fill="#ec4899" />
            <circle cx="200" cy="50" r="4" fill="#fff" />

            <circle cx="280" cy="30" r="13" fill="#f97316" />
            <circle cx="280" cy="30" r="5" fill="#fef08a" />

            <circle cx="360" cy="48" r="10" fill="#a855f7" />
            <circle cx="360" cy="48" r="4" fill="#fef08a" />

            <circle cx="440" cy="38" r="12" fill="#e11d48" />
            <circle cx="440" cy="38" r="4" fill="#fef08a" />
          </svg>
        </div>
      );

    // 12. ورق رسم هندسي ومحاور معمارية (مكتبة المجد)
    case 'card_12_architectural_grid':
      return (
        <div className="absolute inset-0 w-full h-full bg-[#f8fafc] overflow-hidden">
          {/* Grid lines */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `linear-gradient(#0284c7 0.75px, transparent 0.75px), linear-gradient(90deg, #0284c7 0.75px, transparent 0.75px)`,
              backgroundSize: '24px 24px'
            }}
          />
          {/* Major Grid Lines */}
          <div 
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `linear-gradient(#0369a1 1.5px, transparent 1.5px), linear-gradient(90deg, #0369a1 1.5px, transparent 1.5px)`,
              backgroundSize: '120px 120px'
            }}
          />
          {/* Architectural Draft Crosshairs */}
          <div className="absolute top-4 left-4 text-[#0284c7]/60 text-[10px] font-mono select-none">
            + 0.00 / SCALE 1:1
          </div>
          <div className="absolute bottom-4 right-4 text-[#0284c7]/60 text-[10px] font-mono select-none">
            REV. A-12
          </div>
        </div>
      );

    default:
      return <div className="absolute inset-0 bg-[#faf8f5]" />;
  }
};
