import React from 'react';

interface ArrivalMasterTicketProps {
  lang: 'ar' | 'en';
  passengerName?: string;
  stationName: string;
  score?: number;
  tripDurationSeconds?: number;
  arrivalTime?: string;
  className?: string;
}

export const ArrivalMasterTicket: React.FC<ArrivalMasterTicketProps> = ({
  lang,
  passengerName,
  stationName,
  score = 0,
  tripDurationSeconds = 0,
  arrivalTime,
  className = '',
}) => {
  const isEn = lang === 'en';

  // Format dynamic arrival time with English digits (e.g. "02:34 مساءً" or "02:34 PM")
  const timeData = React.useMemo(() => {
    if (arrivalTime) {
      // Normalize any Eastern Arabic numerals to English digits
      const western = arrivalTime.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
      const digitsMatch = western.match(/\d{1,2}:\d{2}/);
      const digits = digitsMatch ? digitsMatch[0] : western;
      const period = western.replace(/\d{1,2}:\d{2}/, '').trim() || (isEn ? 'PM' : 'مساءً');
      return { digits, period };
    }
    const now = new Date();
    const hours24 = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const isPM = hours24 >= 12;
    const hours12 = (hours24 % 12 || 12).toString().padStart(2, '0');
    const digits = `${hours12}:${minutes}`;
    const period = isEn ? (isPM ? 'PM' : 'AM') : (isPM ? 'مساءً' : 'صباحًا');
    return { digits, period };
  }, [arrivalTime, isEn]);

  // Dynamic formatted date like "19-09-2026"
  const formattedDate = React.useMemo(() => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  // Clean, crisp Arabic font style preventing any letter separation or disconnection
  const textStyle: React.CSSProperties = {
    fontFamily: isEn 
      ? "'Inter', system-ui, sans-serif" 
      : "'Tajawal', 'Cairo', 'Noto Sans Arabic', system-ui, sans-serif",
    letterSpacing: 'normal',
    wordSpacing: 'normal',
    direction: isEn ? 'ltr' : 'rtl',
  };

  const scriptStyle: React.CSSProperties = {
    fontFamily: isEn
      ? "'Playfair Display', Georgia, serif"
      : "'Aref Ruqaa', 'Katibeh', 'Marhey', 'Cairo', cursive",
    letterSpacing: 'normal',
    wordSpacing: 'normal',
    direction: isEn ? 'ltr' : 'rtl',
  };

  return (
    <div
      id="royal-grammar-master-certificate"
      className={`relative select-none overflow-hidden ${className}`}
      style={{
        width: '1140px',
        height: '740px',
        backgroundColor: '#faf6ee',
        boxSizing: 'border-box',
        ...textStyle,
      }}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      {/* =========================================================================
          1. MATHEMATICALLY PRECISE VECTOR SVG FRAME & ORNAMENTS
             Drawn with SVG so it never blurs, scales smoothly, and never gets cut off
         ========================================================================= */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 1140 740"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Parchment Vignette Filter */}
        <defs>
          <filter id="ticketShadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Outer Solid Navy Border (2.5px) with 4 Ornate Notched Corner Brackets */}
        <path
          d={`
            M 70 30
            L 1070 30
            A 35 35 0 0 1 1105 65
            L 1105 675
            A 35 35 0 0 1 1070 710
            L 70 710
            A 35 35 0 0 1 35 675
            L 35 65
            A 35 35 0 0 1 70 30
            Z
          `}
          stroke="#152b46"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Inner Thin Navy Border (1.2px) */}
        <path
          d={`
            M 74 36
            L 1066 36
            A 32 32 0 0 1 1098 68
            L 1098 672
            A 32 32 0 0 1 1066 704
            L 74 704
            A 32 32 0 0 1 42 672
            L 42 68
            A 32 32 0 0 1 74 36
            Z
          `}
          stroke="#152b46"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Corner Decorative Dots in 4 Corners */}
        <circle cx="52" cy="52" r="3.5" fill="#152b46" />
        <circle cx="1088" cy="52" r="3.5" fill="#152b46" />
        <circle cx="1088" cy="688" r="3.5" fill="#152b46" />
        <circle cx="52" cy="688" r="3.5" fill="#152b46" />

        {/* Ticket Perforation Notches and Dashed Line on the Right (at x=960) */}
        {/* Top Semicircle Cutout */}
        <path d="M 948 30 A 12 12 0 0 0 972 30 Z" fill="#faf6ee" stroke="#152b46" strokeWidth="2" />
        {/* Bottom Semicircle Cutout */}
        <path d="M 948 710 A 12 12 0 0 1 972 710 Z" fill="#faf6ee" stroke="#152b46" strokeWidth="2" />
        {/* Vertical Dashed Perforation Line */}
        <line
          x1="960"
          y1="42"
          x2="960"
          y2="698"
          stroke="#152b46"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
      </svg>

      {/* =========================================================================
          2. THE VERTICAL TICKET STUB (كوبون التذكرة) on the Right
         ========================================================================= */}
      <div
        className="absolute top-[28px] bottom-[28px] right-[28px] w-[140px] rounded-[16px] bg-[#152b46] border border-[#2e4a6e] flex flex-col items-center justify-between py-6 px-2 shadow-inner z-20"
        style={{ boxSizing: 'border-box' }}
      >
        {/* Top Icon of Stub: Passenger Carriage / Train */}
        <div className="flex flex-col items-center gap-2">
          <svg width="42" height="30" viewBox="0 0 48 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="6" width="40" height="20" rx="3" stroke="#f4ede0" strokeWidth="2" fill="#1a3556" />
            <rect x="8" y="10" width="8" height="6" rx="1" fill="#f4ede0" />
            <rect x="20" y="10" width="8" height="6" rx="1" fill="#f4ede0" />
            <rect x="32" y="10" width="8" height="6" rx="1" fill="#f4ede0" />
            <circle cx="12" cy="28" r="3.5" fill="#f4ede0" />
            <circle cx="36" cy="28" r="3.5" fill="#f4ede0" />
            <line x1="2" y1="32" x2="46" y2="32" stroke="#f4ede0" strokeWidth="2" />
          </svg>
          <div className="flex items-center gap-1.5 text-[#d4af37] text-[10px]">
            <span>◆</span>
            <div className="w-8 h-[1px] bg-[#d4af37]/60" />
            <span>◆</span>
          </div>
        </div>

        {/* Center Vertical Text rotated 90 degrees */}
        <div className="flex-1 flex items-center justify-center my-4">
          <div
            className="flex flex-col items-center justify-center gap-1 whitespace-nowrap select-none"
            style={{
              transform: 'rotate(90deg)',
              transformOrigin: 'center center',
            }}
          >
            <span className="text-[#faf6ee] font-black text-xl tracking-normal">
              {isEn ? 'Trip Number' : 'رقم الرحلة'}
            </span>
            <span className="text-[#cbd5e1] text-xs font-semibold tracking-normal font-mono">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Bottom of Stub: Barcode & Serial Number */}
        <div className="flex flex-col items-center gap-1 w-full px-2">
          <div className="w-full flex items-center justify-center py-1">
            <svg width="100" height="34" viewBox="0 0 100 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="3" height="30" fill="#f4ede0" />
              <rect x="8" y="2" width="2" height="30" fill="#f4ede0" />
              <rect x="12" y="2" width="4" height="30" fill="#f4ede0" />
              <rect x="18" y="2" width="1" height="30" fill="#f4ede0" />
              <rect x="22" y="2" width="5" height="30" fill="#f4ede0" />
              <rect x="29" y="2" width="2" height="30" fill="#f4ede0" />
              <rect x="34" y="2" width="3" height="30" fill="#f4ede0" />
              <rect x="40" y="2" width="2" height="30" fill="#f4ede0" />
              <rect x="44" y="2" width="4" height="30" fill="#f4ede0" />
              <rect x="51" y="2" width="1" height="30" fill="#f4ede0" />
              <rect x="55" y="2" width="3" height="30" fill="#f4ede0" />
              <rect x="61" y="2" width="5" height="30" fill="#f4ede0" />
              <rect x="69" y="2" width="2" height="30" fill="#f4ede0" />
              <rect x="74" y="2" width="4" height="30" fill="#f4ede0" />
              <rect x="81" y="2" width="1" height="30" fill="#f4ede0" />
              <rect x="85" y="2" width="3" height="30" fill="#f4ede0" />
              <rect x="91" y="2" width="4" height="30" fill="#f4ede0" />
            </svg>
          </div>
          <span className="text-[11px] font-mono text-[#cbd5e1] font-bold">
            1024-0037
          </span>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN TICKET BODY (Between x=40 and x=940)
         ========================================================================= */}
      <div
        className="absolute top-[36px] bottom-[36px] left-[36px] right-[190px] flex flex-col justify-between px-6 py-3 z-20"
        style={{ boxSizing: 'border-box' }}
      >
        {/* TOP ROW: [Train Logo (Left)] --- [Center Ornate Banner] --- [Postal Stamp (Right)] */}
        <div className="flex items-center justify-between w-full relative">
          
          {/* Top Left: Vintage Locomotive Silhouette & Title */}
          <div className="flex flex-col items-start w-[280px]">
            <div className="flex items-center gap-2">
              <svg width="68" height="38" viewBox="0 0 80 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Horizontal Speed/Motion Streaks */}
                <line x1="2" y1="14" x2="22" y2="14" stroke="#152b46" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="6" y1="20" x2="24" y2="20" stroke="#152b46" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="2" y1="26" x2="20" y2="26" stroke="#152b46" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="8" y1="32" x2="26" y2="32" stroke="#152b46" strokeWidth="2.2" strokeLinecap="round" />

                {/* Locomotive Body */}
                <path
                  d="M 32 32 L 32 16 Q 32 12 36 12 L 52 12 L 52 8 Q 52 6 54 6 L 58 6 Q 60 6 60 8 L 60 12 L 68 12 Q 72 12 72 16 L 72 32 Z"
                  fill="#152b46"
                />
                {/* Cabin Window */}
                <rect x="36" y="16" width="10" height="8" rx="1.5" fill="#faf6ee" />
                {/* Cowcatcher / Front Grill */}
                <path d="M 72 26 L 78 32 L 72 32 Z" fill="#152b46" />
                {/* Wheels */}
                <circle cx="38" cy="34" r="5" fill="#152b46" stroke="#faf6ee" strokeWidth="1.5" />
                <circle cx="50" cy="34" r="5" fill="#152b46" stroke="#faf6ee" strokeWidth="1.5" />
                <circle cx="64" cy="34" r="5" fill="#152b46" stroke="#faf6ee" strokeWidth="1.5" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-[#152b46] mt-1 leading-tight whitespace-nowrap">
              {isEn ? 'Arabic Grammar Train' : 'قطار القواعد العربية'}
            </h2>
          </div>

          {/* Top Center: Clean & Professional Heading (No rectangle, no stars, no journey subtitle) */}
          <div className="flex flex-col items-center justify-center flex-1">
            <h1 className="text-[#152b46] text-3xl font-black tracking-normal leading-none" style={{ fontFamily: isEn ? "'Playfair Display', Georgia, serif" : "'Cairo', 'Tajawal', sans-serif" }}>
              {isEn ? 'Arabic Grammar Train' : 'قطار القواعد العربية'}
            </h1>
          </div>

          {/* Top Right: Circular Postal Cancellation Stamp with Wavy Lines (No stars) */}
          <div className="w-[220px] flex items-center justify-end">
            <div className="flex items-center gap-1 transform -rotate-6">
              {/* 3 Wavy Cancellation Lines */}
              <svg width="50" height="40" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                <path d="M 0 10 Q 12.5 4 25 10 T 50 10" stroke="#152b46" strokeWidth="1.8" fill="none" />
                <path d="M 0 20 Q 12.5 14 25 20 T 50 20" stroke="#152b46" strokeWidth="1.8" fill="none" />
                <path d="M 0 30 Q 12.5 24 25 30 T 50 30" stroke="#152b46" strokeWidth="1.8" fill="none" />
              </svg>

              {/* Double Circle Postmark Stamp */}
              <div className="w-[78px] h-[78px] rounded-full border-[2px] border-[#152b46] p-[2px] flex items-center justify-center bg-[#faf6ee]">
                <div className="w-full h-full rounded-full border border-dashed border-[#152b46] flex flex-col items-center justify-center text-[#152b46] p-1 select-none">
                  {/* Small train in stamp */}
                  <svg width="22" height="12" viewBox="0 0 24 14" fill="currentColor">
                    <path d="M2 10V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6h2v2H2v-2h2zm4-6H4v4h2V4zm6 0H8v4h4V4zm6 0h-4v4h4V4z" />
                    <circle cx="6" cy="12" r="1.5" />
                    <circle cx="14" cy="12" r="1.5" />
                  </svg>
                  <span className="text-[9.5px] font-black leading-tight mt-1 text-center" style={{ fontFamily: isEn ? 'sans-serif' : "'Tajawal', sans-serif" }}>
                    {isEn ? 'Arabic Grammar Train' : 'قطار القواعد العربية'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================================
            MIDDLE BODY: Letter to Parents
           ========================================================================= */}
        <div className="my-2 space-y-1.5 px-4 text-[#152b46]" dir={isEn ? 'ltr' : 'rtl'}>
          <h3 className="text-xl font-bold text-[#152b46]">
            {isEn
              ? `Dear Parent / Guardian${passengerName ? ` of (${passengerName})` : ''},`
              : `عزيزي ولي أمر الطالب/ة${passengerName ? ` (${passengerName})` : ''}،`}
          </h3>
          <p className="text-base font-medium leading-relaxed">
            {isEn
              ? 'We are pleased to inform you that your child has successfully completed their educational journey in the Arabic Grammar Train game,'
              : 'نود أن نخبركم بأن ابنكم/ابنتكم قد أنهى رحلته التعليمية بنجاح في لعبة قطار القواعد العربية،'}
          </p>
          <p className="text-base font-medium">
            {isEn
              ? 'and has arrived at the following station:'
              : 'وقد وصل إلى المحطة التالية:'}
          </p>
        </div>

        {/* =========================================================================
            CENTRAL CARD: Clean Two Columns with Gold Frame [Station] | [Time]
            (Inner blue rectangles removed per user request)
           ========================================================================= */}
        <div
          className="mx-auto w-[740px] rounded-2xl border-[1.8px] border-[#c8a051] bg-[#fdfbf6]/95 py-3.5 px-6 shadow-sm flex items-center justify-between min-h-[96px] overflow-visible"
          dir={isEn ? 'ltr' : 'rtl'}
        >
          {/* Column 1: Station */}
          <div className="flex-[1.3] flex flex-col items-center justify-center min-w-0 px-2 overflow-visible">
            <div className="flex items-center gap-1.5 mb-1 text-[#152b46]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#c8a051" stroke="#152b46" strokeWidth="1">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
              </svg>
              <span className="font-bold text-xs sm:text-sm text-[#152b46]">
                {isEn ? 'Station:' : 'المحطة:'}
              </span>
            </div>
            <div className="text-center w-full px-1 overflow-visible flex items-center justify-center">
              <span 
                className="text-[#152b46] font-black text-lg sm:text-xl block leading-snug overflow-visible" 
                style={{ 
                  fontFamily: isEn ? 'inherit' : "'Tajawal', 'Cairo', sans-serif",
                  lineHeight: '1.45',
                  paddingBottom: '4px',
                }}
              >
                {stationName}
              </span>
            </div>
          </div>

          {/* Golden Vertical Divider */}
          <div className="w-[1.5px] h-12 bg-[#c8a051]/50 mx-4 self-center shrink-0" />

          {/* Column 2: Time */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-0 px-2 overflow-visible">
            <div className="flex items-center gap-1.5 mb-1 text-[#152b46]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8a051" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="font-bold text-xs sm:text-sm text-[#152b46]">
                {isEn ? 'Completed At:' : 'في وقت:'}
              </span>
            </div>
            <div className="text-center w-full overflow-visible flex items-center justify-center gap-1.5 py-0.5">
              <span 
                className="text-[#152b46] font-black text-xl font-mono tracking-wider inline-block" 
                dir="ltr"
                style={{ lineHeight: '1.45', paddingBottom: '4px' }}
              >
                {timeData.digits}
              </span>
              <span 
                className="text-[#152b46] font-bold text-base inline-block"
                style={{ 
                  fontFamily: isEn ? 'inherit' : "'Tajawal', 'Cairo', sans-serif",
                  lineHeight: '1.45',
                  paddingBottom: '4px',
                }}
              >
                {timeData.period}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CLOSING THANKS & BEST WISHES (Centered)
           ========================================================================= */}
        <div className="text-center space-y-1 text-[#152b46] my-1">
          <p className="text-base font-semibold">
            {isEn
              ? 'Thank you for your continuous follow-up and encouragement for our students,'
              : 'نشكركم على متابعتكم ودعمكم المستمر لأبنائنا،'}
          </p>
          <p className="text-base font-semibold">
            {isEn
              ? 'With our best wishes for continuous progress and success.'
              : 'مع تمنياتنا بمزيد من التقدم والنجاح.'}
          </p>
        </div>

        {/* =========================================================================
            BOTTOM ROW: [Locomotive Sketch + Team Signature] --- [Calligraphy Script]
           ========================================================================= */}
        <div className="flex items-end justify-between w-full pt-1 px-4" dir={isEn ? 'ltr' : 'rtl'}>
          {/* Left Side: Vintage Train Illustration & Team Sign-off on single line */}
          <div className="flex items-center gap-3">
            {/* Classic Steam Locomotive Engraving */}
            <svg width="110" height="52" viewBox="0 0 140 68" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
              {/* Soft Distant Mountains */}
              <path d="M 0 35 L 30 18 L 60 35 L 90 22 L 120 38" stroke="#8a9ba8" strokeWidth="1" strokeDasharray="3 3" />
              {/* Railroad Tracks with Perspective */}
              <line x1="0" y1="58" x2="140" y2="58" stroke="#475569" strokeWidth="2" />
              <line x1="0" y1="64" x2="140" y2="64" stroke="#475569" strokeWidth="2.5" />
              <line x1="15" y1="56" x2="12" y2="66" stroke="#475569" strokeWidth="1.5" />
              <line x1="35" y1="56" x2="32" y2="66" stroke="#475569" strokeWidth="1.5" />
              <line x1="55" y1="56" x2="52" y2="66" stroke="#475569" strokeWidth="1.5" />
              <line x1="75" y1="56" x2="72" y2="66" stroke="#475569" strokeWidth="1.5" />
              <line x1="95" y1="56" x2="92" y2="66" stroke="#475569" strokeWidth="1.5" />
              <line x1="115" y1="56" x2="112" y2="66" stroke="#475569" strokeWidth="1.5" />

              {/* Locomotive Boiler & Cab */}
              <path d="M 40 54 L 40 28 Q 40 24 44 24 L 92 24 Q 96 24 96 28 L 96 54 Z" fill="#2d3748" />
              <rect x="42" y="28" width="16" height="12" rx="2" fill="#faf6ee" />
              {/* Smokestack */}
              <path d="M 82 24 L 80 14 L 88 14 L 86 24 Z" fill="#1a202c" />
              <path d="M 76 14 Q 84 8 92 14 Z" fill="#1a202c" />
              {/* Steam Cloud */}
              <path d="M 70 12 Q 62 4 52 8 Q 42 6 36 12" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
              {/* Front Lamp */}
              <polygon points="96,40 104,36 104,44" fill="#d4af37" />
              {/* Wheels */}
              <circle cx="50" cy="56" r="8" fill="#1a202c" stroke="#faf6ee" strokeWidth="2" />
              <circle cx="70" cy="56" r="8" fill="#1a202c" stroke="#faf6ee" strokeWidth="2" />
              <circle cx="88" cy="56" r="8" fill="#1a202c" stroke="#faf6ee" strokeWidth="2" />
              <line x1="48" y1="56" x2="90" y2="56" stroke="#d4af37" strokeWidth="2.5" />
            </svg>

            <div>
              <p className="text-xs font-bold text-[#152b46]/90">
                {isEn ? 'With Best Wishes,' : 'مع أطيب التمنيات'}
              </p>
              <p className="text-xs sm:text-sm font-black text-[#152b46] whitespace-nowrap">
                {isEn ? 'Arabic Grammar Train Team' : 'فريق قطار القواعد العربية'}
              </p>
            </div>
          </div>

          {/* Right Side: Flowing Cursive Script with Graceful Underline */}
          <div className="flex flex-col items-center">
            <div
              className="text-xl sm:text-2xl font-black text-[#152b46] tracking-wide whitespace-nowrap"
              style={scriptStyle}
            >
              {isEn ? 'A New Journey. Moving Forward Together' : 'رحلة جديدة .. قادماً معاً'}
            </div>
            {/* Elegant Calligraphic Underline Curve */}
            <svg width="220" height="14" viewBox="0 0 220 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-1">
              <path
                d="M 10 4 Q 110 14 210 2"
                stroke="#152b46"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
};
