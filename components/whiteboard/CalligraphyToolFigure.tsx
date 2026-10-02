import React from 'react';
import { CalligraphyPenNibId } from './calligraphyStudioData';

interface CalligraphyToolFigureProps {
  toolId: CalligraphyPenNibId;
  isSelected?: boolean;
  className?: string;
}

export const CalligraphyToolFigure: React.FC<CalligraphyToolFigureProps> = ({
  toolId,
  isSelected = false,
  className = 'w-full h-full'
}) => {
  // Normalize IDs to the 7 authentic pens from the reference image
  const resolvedTool = (() => {
    switch (toolId) {
      case 'qasab_pen':
      case 'reed_qalam':
      case 'graphite_pencil':
        return 'qasab_pen';
      case 'bamboo_pen':
      case 'wet_wash':
        return 'bamboo_pen';
      case 'metal_pen':
      case 'flex_quill':
      case 'tashkeel_dotting':
        return 'metal_pen';
      case 'quill_pen':
        return 'quill_pen';
      case 'glass_pen':
        return 'glass_pen';
      case 'modern_pen':
      case 'sable_brush':
        return 'modern_pen';
      case 'marker_pen':
      case 'broad_tomar':
        return 'marker_pen';
      default:
        return 'qasab_pen';
    }
  })();

  return (
    <div className={`relative flex items-center justify-center ${className} transition-transform duration-200 ${isSelected ? 'scale-105 drop-shadow-[0_4px_12px_rgba(212,175,55,0.35)]' : 'hover:scale-102'}`}>
      
      {/* =================================================================== */}
      {/* 1. قلم قصب / QASAB PEN: Authentic Reed Calligraphy Pen              */}
      {/* Slender natural cane reed, caramel woodgrain, carved 35° bevel nib */}
      {/* =================================================================== */}
      {resolvedTool === 'qasab_pen' && (
        <svg viewBox="0 0 44 116" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="qasabShaftGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#87582b" />
              <stop offset="20%" stopColor="#b27e44" />
              <stop offset="50%" stopColor="#d9a568" />
              <stop offset="78%" stopColor="#b68147" />
              <stop offset="100%" stopColor="#6e441d" />
            </linearGradient>
            <linearGradient id="qasabBevelGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="35%" stopColor="#edd09b" />
              <stop offset="70%" stopColor="#cfa066" />
              <stop offset="100%" stopColor="#966c37" />
            </linearGradient>
            <linearGradient id="qasabHollowCavity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14110f" />
              <stop offset="40%" stopColor="#2c221a" />
              <stop offset="100%" stopColor="#4a392b" />
            </linearGradient>
            <linearGradient id="qasabPithBack" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3d2a1a" />
              <stop offset="50%" stopColor="#66462c" />
              <stop offset="100%" stopColor="#2c1d11" />
            </linearGradient>
          </defs>

          {/* Reed Cane Main Cylinder Shaft */}
          <path
            d="M14 26 L14 114 L30 114 L30 22 C30 22 29 25 25 25.5 C20 26 18 23 18 23 L14 26 Z"
            fill="url(#qasabShaftGrad)"
          />

          {/* Natural Reed Fine Fiber Striations */}
          <line x1="17" y1="28" x2="17" y2="114" stroke="#68411d" strokeWidth="0.45" strokeOpacity="0.4" />
          <line x1="22" y1="29" x2="22" y2="114" stroke="#ffebc2" strokeWidth="0.5" strokeOpacity="0.35" />
          <line x1="26" y1="27" x2="26" y2="114" stroke="#68411d" strokeWidth="0.45" strokeOpacity="0.4" />

          {/* Organic Reed Cane Node Rings */}
          <ellipse cx="22" cy="74" rx="8" ry="1.1" stroke="#5a3717" strokeWidth="0.75" strokeOpacity="0.45" fill="none" />
          <line x1="14" y1="74" x2="30" y2="74" stroke="#ffde9e" strokeWidth="0.4" strokeOpacity="0.3" />

          {/* Carved 35° Calligraphy Bevel Cut Face */}
          <path
            d="M14 26 Q15 13 19.5 4.5 Q24.5 1.5 27 2 L29.5 16 C30 22 25 26.5 20 26.5 C16 26.5 14 26 14 26 Z"
            fill="url(#qasabBevelGrad)"
          />

          {/* Inner Hollow Cavity with Classical Carbon Ink Wash */}
          <path
            d="M17 22 Q17.5 14 20.5 7.5 Q23.5 5 25.5 5.5 L27 15 C27.5 19.5 24 23 20 23 C18 23 17 22 17 22 Z"
            fill="url(#qasabHollowCavity)"
          />

          {/* Ink Slit (الشق الحبري) down to the writing tip */}
          <line x1="23.5" y1="3.2" x2="22" y2="14" stroke="#090807" strokeWidth="0.75" />

          {/* Razor-sharp 35° Chisel Nib Edge with ink patina */}
          <path
            d="M19.5 4.5 L27 2"
            stroke="#16120e"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* =================================================================== */}
      {/* 2. قلم خيزران / BAMBOO PEN: Broad Golden Bamboo Calligraphy Pen      */}
      {/* Stouter golden bamboo stalk, prominent node ring, large scoop cut   */}
      {/* =================================================================== */}
      {resolvedTool === 'bamboo_pen' && (
        <svg viewBox="0 0 44 116" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bambooGoldBody" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b58a43" />
              <stop offset="22%" stopColor="#e3ba6d" />
              <stop offset="50%" stopColor="#fae29f" />
              <stop offset="78%" stopColor="#ddaf5c" />
              <stop offset="100%" stopColor="#9a712f" />
            </linearGradient>
            <linearGradient id="bambooPithCut" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff8e7" />
              <stop offset="40%" stopColor="#f5e0b3" />
              <stop offset="80%" stopColor="#d8b475" />
              <stop offset="100%" stopColor="#ad8744" />
            </linearGradient>
            <linearGradient id="bambooCavityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1510" />
              <stop offset="50%" stopColor="#352617" />
              <stop offset="100%" stopColor="#553e26" />
            </linearGradient>
          </defs>

          {/* Broad Cylindrical Bamboo Stalk */}
          <path
            d="M12 28 L12 114 L32 114 L32 23 C32 23 30 26 26 27 C20 28 17 25 17 25 L12 28 Z"
            fill="url(#bambooGoldBody)"
          />

          {/* Bamboo Striations & Fibers */}
          <line x1="16" y1="30" x2="16" y2="114" stroke="#8d682a" strokeWidth="0.55" strokeOpacity="0.4" />
          <line x1="22" y1="31" x2="22" y2="114" stroke="#fff1cd" strokeWidth="0.65" strokeOpacity="0.4" />
          <line x1="28" y1="29" x2="28" y2="114" stroke="#8d682a" strokeWidth="0.55" strokeOpacity="0.4" />

          {/* Prominent Bamboo Joint Node (عقدة الخيزران الطبيعية) */}
          <g>
            <ellipse cx="22" cy="62" rx="10.2" ry="1.6" fill="#886324" fillOpacity="0.35" />
            <ellipse cx="22" cy="61.5" rx="10" ry="1.3" stroke="#714e16" strokeWidth="0.85" fill="none" />
            <ellipse cx="22" cy="60.8" rx="9.8" ry="1.1" stroke="#fae29f" strokeWidth="0.5" strokeOpacity="0.75" fill="none" />
          </g>

          {/* Deep Bamboo Scoop Carving (قطع عريض جلي) */}
          <path
            d="M12 28 Q13 14 18 4 Q25 1.2 28.5 2.5 L31.5 17 C32 24 26 29 19 29 C15 29 12 28 12 28 Z"
            fill="url(#bambooPithCut)"
          />

          {/* Deep Inner Hollow Channel with Dried Arabic Ink */}
          <path
            d="M16 23 Q16.5 13 20 6.5 Q24 4 27 5.5 L28.5 16 C29 21 24.5 25 19.5 25 C17 25 16 23 16 23 Z"
            fill="url(#bambooCavityGrad)"
          />

          {/* Center Ink Slit */}
          <line x1="24" y1="3" x2="22" y2="16" stroke="#0e0a06" strokeWidth="0.85" />

          {/* Broad Chisel Nib Blade Edge (سن جلي عريض) */}
          <path
            d="M18 4 L28.5 2.5"
            stroke="#1c160e"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* =================================================================== */}
      {/* 3. قلم معدني / METAL PEN: Fine Stainless Steel Dipping Pen         */}
      {/* Sleek chrome tapered cone holder & engraved steel calligraphy nib  */}
      {/* =================================================================== */}
      {resolvedTool === 'metal_pen' && (
        <svg viewBox="0 0 44 116" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="silverConeHandle" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="25%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="metalFerruleCollar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="30%" stopColor="#f1f5f9" />
              <stop offset="60%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="steelNibMetallic" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#718096" />
              <stop offset="25%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#4a5568" />
            </linearGradient>
          </defs>

          {/* Classical Stainless Steel Calligraphy Dip Nib */}
          <path
            d="M22 2 L26.5 12 C27.5 17 27.2 22 26 26 L18 26 C16.8 22 16.5 17 17.5 12 L22 2 Z"
            fill="url(#steelNibMetallic)"
          />

          {/* Breather Hole & Center Nib Slit Line */}
          <line x1="22" y1="2" x2="22" y2="16.5" stroke="#1e293b" strokeWidth="0.65" />
          <circle cx="22" cy="16.5" r="1.3" fill="#1e293b" />

          {/* Engraved Filigree Ornamentation on Steel Nib */}
          <path d="M19 12 Q22 14 25 12" stroke="#64748b" strokeWidth="0.45" fill="none" />
          <path d="M19.5 20 Q22 21.5 24.5 20" stroke="#94a3b8" strokeWidth="0.4" fill="none" />

          {/* Polished Metal Ferrule Grip Rings */}
          <rect x="17.5" y="26" width="9" height="5.5" rx="0.5" fill="url(#metalFerruleCollar)" />
          <line x1="17.5" y1="28.5" x2="26.5" y2="28.5" stroke="#1e293b" strokeWidth="0.5" />
          <line x1="17.5" y1="29.5" x2="26.5" y2="29.5" stroke="#ffffff" strokeWidth="0.35" />

          {/* Sleek Tapered Metallic Cone Handle */}
          <path
            d="M18.5 31.5 
               C18.5 33 17 38 17 46 
               C17 56 19 68 20 80 
               C20.8 90 21.2 104 21.5 114 
               L22.5 114 
               C22.8 104 23.2 90 24 80 
               C25 68 27 56 27 46 
               C27 38 25.5 33 25.5 31.5 Z"
            fill="url(#silverConeHandle)"
          />

          {/* Specular White Highlight Reflection Line down the stem */}
          <line x1="21.6" y1="32" x2="21.8" y2="112" stroke="#ffffff" strokeWidth="0.75" strokeOpacity="0.6" />
          <line x1="22.8" y1="32" x2="22.8" y2="112" stroke="#334155" strokeWidth="0.4" strokeOpacity="0.3" />
        </svg>
      )}

      {/* =================================================================== */}
      {/* 4. قلم ريشة / QUILL PEN: Pure White Goose Feather Calligraphy Pen  */}
      {/* Realistic soft feather barbs, ivory translucent calamus & ink tip   */}
      {/* =================================================================== */}
      {resolvedTool === 'quill_pen' && (
        <svg viewBox="0 0 44 116" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="quillFeatherGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="30%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="80%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="quillShaftGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d4c7b0" />
              <stop offset="35%" stopColor="#fff9ed" />
              <stop offset="60%" stopColor="#faecd5" />
              <stop offset="100%" stopColor="#c5b699" />
            </linearGradient>
            <linearGradient id="quillInkedTip" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="70%" stopColor="#2a231d" />
              <stop offset="100%" stopColor="#faecd5" />
            </linearGradient>
          </defs>

          {/* Left Feather Vane Barbs (ريشة الإوزة الناعمة من اليسار) */}
          <path
            d="M21 34 
               C17 38 10 46 9 58 
               C8 70 12 84 15 94 
               C17 100 19 106 20 110 
               L21 110 
               L21 34 Z"
            fill="url(#quillFeatherGrad)"
          />

          {/* Right Feather Vane Barbs (ريشة الإوزة من اليمين) */}
          <path
            d="M22 34 
               C26 38 33 46 34 58 
               C35 70 31 84 28 94 
               C26 100 24 106 23 110 
               L22 110 
               L22 34 Z"
            fill="url(#quillFeatherGrad)"
          />

          {/* Delicate Feather Texture Striations (شعيرات وتسننات الريشة) */}
          <path d="M12 52 Q17 56 21 60" stroke="#94a3b8" strokeWidth="0.35" strokeOpacity="0.5" />
          <path d="M10 64 Q16 68 21 72" stroke="#94a3b8" strokeWidth="0.35" strokeOpacity="0.5" />
          <path d="M11 78 Q17 82 21 86" stroke="#94a3b8" strokeWidth="0.35" strokeOpacity="0.5" />
          <path d="M31 54 Q26 58 22 62" stroke="#94a3b8" strokeWidth="0.35" strokeOpacity="0.5" />
          <path d="M33 66 Q27 70 22 74" stroke="#94a3b8" strokeWidth="0.35" strokeOpacity="0.5" />
          <path d="M31 80 Q26 84 22 88" stroke="#94a3b8" strokeWidth="0.35" strokeOpacity="0.5" />

          {/* Central Quill Rachis / Shaft (قصبة الريشة العاجية الممتدة) */}
          <path
            d="M21 12 L21 114 L23 114 L23 12 Z"
            fill="url(#quillShaftGrad)"
          />

          {/* Translucent Ivory Quill Shaft Barrel (المقبض العاجي) */}
          <path
            d="M20.2 12 L20.2 36 L23.8 36 L23.8 12 Z"
            fill="url(#quillShaftGrad)"
          />

          {/* Carved Hand-Cut Quill Writing Nib (سن الريشة المشطوف المحبور) */}
          <path
            d="M22 2 L24.2 14 L19.8 14 Z"
            fill="url(#quillInkedTip)"
          />
          {/* Fine Quill Nib Split Line */}
          <line x1="22" y1="2" x2="22" y2="11" stroke="#000000" strokeWidth="0.6" />
          {/* Subtle ink reservoir notch */}
          <circle cx="22" cy="11" r="0.8" fill="#1c1917" />
        </svg>
      )}

      {/* =================================================================== */}
      {/* 5. قلم زجاجي / GLASS PEN: Venetian Twisted Murano Glass Dip Pen    */}
      {/* Fluted spiral twisted glass stem, crystal refractions, spiral nib  */}
      {/* =================================================================== */}
      {resolvedTool === 'glass_pen' && (
        <svg viewBox="0 0 44 116" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="glassBodyGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.6" />
              <stop offset="25%" stopColor="#e0f2fe" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#bae6fd" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="glassRibHighlight" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="glassInkTipGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="40%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Venetian Spiraling Fluted Glass Nib Tip (سن زجاجي حلزوني بنظام الشعريات) */}
          <path
            d="M22 2 L25 15 C25.5 19 25 22 24.5 24 L19.5 24 C19 22 18.5 19 19 15 L22 2 Z"
            fill="url(#glassInkTipGrad)"
          />

          {/* Spiral Capillary Grooves (القنوات الحلزونية الدقيقة لحبس الحبر) */}
          <path d="M22 2 Q24 7 21 12 Q24.5 17 22 22" stroke="#ffffff" strokeWidth="0.65" fill="none" opacity="0.85" />
          <path d="M22 2 Q20 7 23 12 Q19.5 17 22 22" stroke="#0284c7" strokeWidth="0.5" fill="none" opacity="0.7" />
          <path d="M21 4 Q25 9 22 15 Q25 20 23 24" stroke="#ffffff" strokeWidth="0.45" fill="none" opacity="0.75" />

          {/* Glass Collar Transition Ring */}
          <ellipse cx="22" cy="24.5" rx="3.5" ry="0.9" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.5" />

          {/* Twisted Hand-Blown Murano Glass Barrel (المقبض الزجاجي اللولبي البديع) */}
          <path
            d="M19 25.5 
               C18 32 16.5 42 16.5 54 
               C16.5 68 18.5 82 19 96 
               C19.5 104 20 110 21 114 
               L23 114 
               C24 110 24.5 104 25 96 
               C25.5 82 27.5 68 27.5 54 
               C27.5 42 26 32 25 25.5 Z"
            fill="url(#glassBodyGrad)"
          />

          {/* 3D Glass Spiral Twists running along the barrel (التواءات الزجاج اليدوي) */}
          <path d="M17 32 Q22 36 27 40" stroke="#ffffff" strokeWidth="1.1" strokeOpacity="0.8" fill="none" />
          <path d="M16.5 44 Q22 48 27.5 52" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.85" fill="none" />
          <path d="M17 56 Q22 60 27 64" stroke="#ffffff" strokeWidth="1.1" strokeOpacity="0.8" fill="none" />
          <path d="M17.5 68 Q22 72 26.5 76" stroke="#ffffff" strokeWidth="1.0" strokeOpacity="0.8" fill="none" />
          <path d="M18 80 Q22 84 26 88" stroke="#ffffff" strokeWidth="0.9" strokeOpacity="0.75" fill="none" />
          <path d="M18.5 92 Q22 95 25.5 98" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.7" fill="none" />
          <path d="M19 104 Q22 106 25 108" stroke="#ffffff" strokeWidth="0.7" strokeOpacity="0.65" fill="none" />

          {/* Counter Spiral Shadow Ribs for 3D depth */}
          <path d="M27 34 Q22 38 17 42" stroke="#0284c7" strokeWidth="0.6" strokeOpacity="0.45" fill="none" />
          <path d="M27.5 46 Q22 50 16.5 54" stroke="#0284c7" strokeWidth="0.65" strokeOpacity="0.45" fill="none" />
          <path d="M27 58 Q22 62 17 66" stroke="#0284c7" strokeWidth="0.6" strokeOpacity="0.45" fill="none" />
          <path d="M26.5 70 Q22 74 17.5 78" stroke="#0284c7" strokeWidth="0.55" strokeOpacity="0.4" fill="none" />
        </svg>
      )}

      {/* =================================================================== */}
      {/* 6. قلم حديث / MODERN PEN: Turned Walnut & Two-Tone Gold Nib Pen    */}
      {/* Polished walnut wood body, gold/chrome band, 18k two-tone nib      */}
      {/* =================================================================== */}
      {resolvedTool === 'modern_pen' && (
        <svg viewBox="0 0 44 116" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="walnutBodyGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2c1810" />
              <stop offset="20%" stopColor="#4a2c1d" />
              <stop offset="50%" stopColor="#784b33" />
              <stop offset="80%" stopColor="#432618" />
              <stop offset="100%" stopColor="#20110b" />
            </linearGradient>
            <linearGradient id="modernGoldNib" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9a6e24" />
              <stop offset="25%" stopColor="#e5b84c" />
              <stop offset="50%" stopColor="#fff3b0" />
              <stop offset="75%" stopColor="#d4a33c" />
              <stop offset="100%" stopColor="#7a5012" />
            </linearGradient>
            <linearGradient id="nibSilverInlay" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <linearGradient id="chromeRingGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>

          {/* Two-Tone 18K Gold Fountain Pen Nib (سن حبر مذهب مطعم بالفضة) */}
          <path
            d="M22 2 L26.2 13 C27 17 27 21 26 25 L18 25 C17 21 17 17 17.8 13 L22 2 Z"
            fill="url(#modernGoldNib)"
          />

          {/* Silver Filigree Center Inlay on Nib */}
          <path
            d="M22 4 L24.5 13 C25 16 24.5 19 24 21 L20 21 C19.5 19 19 16 19.5 13 L22 4 Z"
            fill="url(#nibSilverInlay)"
            opacity="0.85"
          />

          {/* Center Breather Slit & Keyhole Hole */}
          <line x1="22" y1="2" x2="22" y2="15.5" stroke="#1c1917" strokeWidth="0.65" />
          <circle cx="22" cy="15.5" r="1.1" fill="#1c1917" />

          {/* Engraved Classical Scroll Filigree Details */}
          <path d="M20.5 10 Q22 11.5 23.5 10" stroke="#9a6e24" strokeWidth="0.4" fill="none" />
          <path d="M20.5 18 Q22 19 23.5 18" stroke="#9a6e24" strokeWidth="0.4" fill="none" />

          {/* Black Resin Section Grip */}
          <rect x="17" y="25" width="10" height="4.5" fill="#171717" />

          {/* 24K Gold Plated Accent Ring & Collar */}
          <rect x="16.5" y="29.5" width="11" height="3" fill="url(#chromeRingGrad)" />
          <line x1="16.5" y1="31" x2="27.5" y2="31" stroke="#ffffff" strokeWidth="0.4" />

          {/* Turned Polished Walnut Hardwood Barrel (جسم خشب الجوز المخرط الأنيق) */}
          <path
            d="M17.5 32.5 
               C17.5 34 16 42 16 52 
               C16 66 18 82 19 96 
               C19.5 104 20 110 20.5 114 
               L23.5 114 
               C24 110 24.5 104 25 96 
               C26 82 28 66 28 52 
               C28 42 26.5 34 26.5 32.5 Z"
            fill="url(#walnutBodyGrad)"
          />

          {/* Walnut Natural Wood Grain Patterns */}
          <path d="M19 35 Q18 60 21 110" stroke="#381e13" strokeWidth="0.45" strokeOpacity="0.5" fill="none" />
          <path d="M21 34 Q22.5 70 22 112" stroke="#9a6344" strokeWidth="0.55" strokeOpacity="0.4" fill="none" />
          <path d="M25 35 Q26 60 23 110" stroke="#381e13" strokeWidth="0.45" strokeOpacity="0.5" fill="none" />

          {/* Gloss Specular Highlight Line */}
          <line x1="21.5" y1="34" x2="21.5" y2="112" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.35" />
        </svg>
      )}

      {/* =================================================================== */}
      {/* 7. قلم ماركر / MARKER PEN: Contemporary Chisel Calligraphy Marker  */}
      {/* Satin black body, stepped grip section, sharp broad felt chisel    */}
      {/* =================================================================== */}
      {resolvedTool === 'marker_pen' && (
        <svg viewBox="0 0 44 116" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="chiselFeltTipGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#171717" />
              <stop offset="35%" stopColor="#262626" />
              <stop offset="70%" stopColor="#1f1f1f" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            <linearGradient id="markerCollarStepped" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#262626" />
              <stop offset="40%" stopColor="#525252" />
              <stop offset="100%" stopColor="#171717" />
            </linearGradient>
            <linearGradient id="markerBodySatin" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#171717" />
              <stop offset="20%" stopColor="#2a2a2a" />
              <stop offset="50%" stopColor="#404040" />
              <stop offset="80%" stopColor="#262626" />
              <stop offset="100%" stopColor="#0f0f0f" />
            </linearGradient>
          </defs>

          {/* Broad Angled Chisel Felt Nib (سن لبادي مشطوف فاحم) */}
          <path
            d="M17 5 L27 2 L27 15 L17 15 Z"
            fill="url(#chiselFeltTipGrad)"
          />

          {/* Felt Fiber Micro-Lines */}
          <line x1="19.5" y1="5" x2="19.5" y2="14" stroke="#44403c" strokeWidth="0.4" />
          <line x1="22" y1="4" x2="22" y2="14" stroke="#525252" strokeWidth="0.4" />
          <line x1="24.5" y1="3" x2="24.5" y2="14" stroke="#44403c" strokeWidth="0.4" />

          {/* Stepped Collar Shoulder */}
          <path
            d="M15.5 15 L28.5 15 L27.5 22 L16.5 22 Z"
            fill="url(#markerCollarStepped)"
          />

          {/* Stepped Ribbed Neck Ring Section */}
          <rect x="15" y="22" width="14" height="4.5" fill="#171717" />
          <line x1="15" y1="24.5" x2="29" y2="24.5" stroke="#333333" strokeWidth="0.6" />

          <rect x="14" y="26.5" width="16" height="4" fill="#262626" />
          <line x1="14" y1="28.5" x2="30" y2="28.5" stroke="#404040" strokeWidth="0.5" />

          {/* Sleek Satin Black Hex-Rounded Marker Body */}
          <rect x="13" y="30.5" width="18" height="83.5" rx="1.5" fill="url(#markerBodySatin)" />

          {/* Chamfered Edge Highlights & Shadows */}
          <line x1="14" y1="31.5" x2="14" y2="114" stroke="#737373" strokeWidth="0.5" strokeOpacity="0.5" />
          <line x1="18.5" y1="31.5" x2="18.5" y2="114" stroke="#525252" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="30" y1="31.5" x2="30" y2="114" stroke="#000000" strokeWidth="0.6" />
        </svg>
      )}

    </div>
  );
};
