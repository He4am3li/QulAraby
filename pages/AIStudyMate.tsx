<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>Qul - Smart Language Learning</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&family=Aref+Ruqaa:wght@400;700&family=Zain:wght@200;300;400;700;800&family=Amiri:wght@400;700&family=Cairo:wght@400;700;900&family=Almarai:wght@300;400;700;800&family=Lalezar&family=Reem+Kufi:wght@400;700&display=swap" rel="stylesheet">
    <style>
      /* --- إعدادات الشاشة والتجاوب للهواتف والأيباد --- */
      html, body {
        height: 100%;
        min-height: 100dvh; /* حل مشكلة أشرطة تصفح الهواتف الذكية */
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior-y: contain; /* يمنع سحب الصفحة لتحديث المتصفح بالخطأ أثناء اللمس */
        -webkit-overflow-scrolling: touch;
      }
      
      /* شاشات الحاسوب والمكتب فقط يقفل فيها التمرير العام */
      @media (min-width: 1024px) {
        body {
          overflow: hidden;
          position: fixed;
          inset: 0;
        }
      }

      body {
        font-family: 'Inter', 'Tajawal', sans-serif;
        background-color: #f8fafc;
        width: 100%;
        -webkit-tap-highlight-color: transparent; /* يمنع الوميض الأزرق عند الضغط في الموبايل */
      }

      /* ضبط الخطوط العربية لمنع تقطع الحروف وتداخلها في الشاشات الصغيرة */
      .arabic-font { font-family: 'Tajawal', sans-serif; }
      .arabic-font, [dir="rtl"] {
        letter-spacing: 0 !important;
        line-height: 1.6;
      }

      .font-amiri { font-family: 'Amiri', serif; }
      .font-cairo { font-family: 'Cairo', sans-serif; }
      .font-almarai { font-family: 'Almarai', sans-serif; }
      .font-lalezar { font-family: 'Lalezar', system-ui; }
      .font-reem { font-family: 'Reem Kufi', sans-serif; }
      .font-tajawal { font-family: 'Tajawal', sans-serif; }
      .font-aref { font-family: 'Aref Ruqaa', serif; }
      .font-zain { font-family: 'Zain', sans-serif; }
      .handwritten-font { font-family: 'Aref Ruqaa', serif; }

      /* --- تحسين الحروف المتساقطة للأجهزة المحمولة --- */
      @keyframes rainFall {
        0% { transform: translateY(-10vh); opacity: 0; }
        10% { opacity: 0.15; }
        90% { opacity: 0.15; }
        100% { transform: translateY(110vh); opacity: 0; }
      }

      .falling-char {
        position: absolute;
        color: rgba(255, 255, 255, 0.25);
        pointer-events: none;
        animation: rainFall linear infinite;
        z-index: 0;
        font-weight: 800;
        user-select: none;
        will-change: transform, opacity;
        font-size: 1.1rem; /* حجم أصغر متناسق مع الموبايل */
      }

      @media (min-width: 768px) {
        .falling-char { font-size: 2rem; }
      }

      /* --- كروت قلب الكلمات المتجاوبة (Flip Cards) --- */
      .flip-card {
        perspective: 800px; /* تقليل المنظور قليلاً لثبات العرض على الهواتف */
      }
      .flip-card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transition: transform 0.5s ease;
        transform-style: preserve-3d;
      }
      /* دعم اللمس والتحويم معاً */
      .flip-card:hover .flip-card-inner,
      .flip-card:active .flip-card-inner {
        transform: rotateY(180deg);
      }
      .flip-card-front, .flip-card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
      }
      @media (min-width: 768px) {
        .flip-card-front, .flip-card-back { border-radius: 1.5rem; }
      }
      .flip-card-back {
        transform: rotateY(180deg);
      }

      /* --- المؤثرات البصرية والخلفيات --- */
      .noor-noise {
        position: fixed;
        inset: 0;
        z-index: 9999;
        pointer-events: none;
        opacity: 0.012;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      }

      .glass-card {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.4);
      }

      .bg-pattern-dots {
        background-color: #f8fafc;
        background-image: radial-gradient(#e2e8f0 1.2px, transparent 1.2px);
        background-size: 20px 20px;
      }
      @media (min-width: 768px) {
        .bg-pattern-dots { background-size: 30px 30px; }
      }

      /* اهتزاز المكونات التفاعلية عند الخطأ */
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
      }
      .animate-shake { animation: shake 0.15s ease-in-out double; }

      /* شريط التمرير المخصص للهواتف والأجهزة */
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

      /* حاوية التطبيق الهيكلية */
      .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100dvh;
        width: 100%;
      }
      @media (min-width: 1024px) {
        .app-container { flex-direction: row; height: 100vh; }
      }
    </style>
  </head>
  <body class="bg-pattern-dots">
    <div class="noor-noise"></div>
    
    <div id="root" class="app-container relative z-10 mx-auto w-full Box-border px-3 py-2 sm:px-4 md:p-6 lg:p-0"></div>

    <script type="module" src="/index.tsx"></script>
  </body>
</html>
