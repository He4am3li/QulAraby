import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, BookOpen, Gamepad2, Headphones, MessageCircle, Sparkles } from 'lucide-react';
import './LandingExperience.css';

type Language = 'ar' | 'en';
type Zone = 'idle' | 'left' | 'right' | 'center';

const steps = [
  { id: 'letters', glyph: 'أ', en: '01', arTitle: 'من الحرف تبدأ الحكاية', enTitle: 'Every story starts with a letter', arNote: 'الحروف والمفردات', enNote: 'Letters and vocabulary', accent: 'mint', icon: BookOpen },
  { id: 'listening', glyph: 'ص', en: '02', arTitle: 'استمع، ثم انطلق بالكلام', enTitle: 'Listen. Then find your voice.', arNote: 'الاستماع والتحدث', enNote: 'Listening and speaking', accent: 'blue', icon: Headphones },
  { id: 'reading', glyph: 'ق', en: '03', arTitle: 'عالم من القصص والمعاني', enTitle: 'A world of stories and meaning', arNote: 'القراءة والكتابة', enNote: 'Reading and writing', accent: 'gold', icon: MessageCircle },
  { id: 'games', glyph: 'ل', en: '04', arTitle: 'كل تحدٍّ خطوة إلى الإتقان', enTitle: 'Learn by playing, grow by exploring', arNote: 'الألعاب والمغامرات', enNote: 'Games and adventures', accent: 'mint', icon: Gamepad2 },
] as const;

function QulGuide({ zone }: { zone: Zone }) {
  return (
    <svg className={'qul-story-guide qul-story-guide-' + zone} viewBox="0 0 540 530" role="img" aria-label="مرشد قُل التفاعلي يرحب بالزائر" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="qul-hero-aura"><stop stopColor="#e5fff5" stopOpacity=".8"/><stop offset=".55" stopColor="#4dbbd0" stopOpacity=".19"/><stop offset="1" stopColor="#2766af" stopOpacity="0"/></radialGradient>
        <linearGradient id="qul-hero-robe" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#183c49"/><stop offset=".48" stopColor="#0b2335"/><stop offset="1" stopColor="#071723"/></linearGradient>
        <linearGradient id="qul-hero-skin" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#eac4a2"/><stop offset=".48" stopColor="#c89b7a"/><stop offset="1" stopColor="#a97458"/></linearGradient>
        <linearGradient id="qul-hero-glass" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#d9fff1" stopOpacity=".4"/><stop offset=".48" stopColor="#7be3d9" stopOpacity=".12"/><stop offset="1" stopColor="#319dbb" stopOpacity=".3"/></linearGradient>
        <linearGradient id="qul-hero-device" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#304d5d"/><stop offset=".5" stopColor="#122b3a"/><stop offset="1" stopColor="#071825"/></linearGradient>
        <filter id="qul-hero-shadow" x="-40%" y="-50%" width="180%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
      </defs>
      <circle cx="268" cy="260" r="238" fill="url(#qul-hero-aura)"/>
      <ellipse cx="269" cy="487" rx="173" ry="19" fill="#06151a" opacity=".65" filter="url(#qul-hero-shadow)"/>
      <g className="qul-story-orbit" fill="none" stroke="#a5f7df" strokeOpacity=".22">
        <ellipse cx="269" cy="273" rx="218" ry="189" strokeWidth="1.5" strokeDasharray="4 13"/>
        <ellipse cx="269" cy="273" rx="178" ry="215" strokeWidth="1" transform="rotate(-29 269 273)"/>
        <circle cx="96" cy="214" r="5" fill="#afffe5" stroke="none"/>
        <circle cx="448" cy="315" r="4" fill="#9ed4ff" stroke="none"/>
      </g>
      <g className="qul-story-figure">
        <path d="M145 400 Q153 324 199 309 L237 298 L305 298 L343 310 Q393 328 398 400 L416 465 L130 465Z" fill="url(#qul-hero-robe)" stroke="#93cdd1" strokeOpacity=".34" strokeWidth="2"/>
        <path d="M225 297 L259 345 L288 297 L304 318 L271 380 L203 320Z" fill="#1c5361" opacity=".7"/>
        <path d="M232 296 L264 344 L285 296" fill="none" stroke="#92d6bd" strokeWidth="2" strokeOpacity=".6"/>
        <path d="M167 340 Q144 354 132 399" fill="none" stroke="#9fe1d1" strokeOpacity=".18" strokeWidth="5"/>
        <path d="M368 340 Q395 362 396 420" fill="none" stroke="#a7e4eb" strokeOpacity=".16" strokeWidth="5"/>
        <g className="qul-story-head">
          <path d="M238 276 H289 V316 Q266 336 240 309Z" fill="url(#qul-hero-skin)"/>
          <path d="M208 210 Q205 145 265 137 Q331 146 327 216 L315 273 Q293 304 263 307 Q234 304 216 270Z" fill="url(#qul-hero-skin)"/>
          <path d="M206 235 Q187 154 226 132 Q274 94 315 133 Q348 166 332 239 L322 216 Q318 183 305 172 Q268 186 225 165 Q215 193 215 224Z" fill="#081620"/>
          <path d="M212 205 Q213 157 246 136 Q293 119 319 167" fill="none" stroke="#4f7680" strokeOpacity=".45" strokeWidth="5"/>
          <path d="M219 235 Q225 222 241 226 M283 225 Q301 221 311 232" stroke="#533d39" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <g className="qul-story-eyes" fill="#15232c">
            <ellipse cx="237" cy="238" rx="3.8" ry="4.8"/>
            <ellipse cx="295" cy="238" rx="3.8" ry="4.8"/>
          </g>
          <path d="M265 241 L261 259 Q267 264 273 260" fill="none" stroke="#a36c57" strokeWidth="2" strokeLinecap="round"/>
          <path className="qul-story-smile" d="M246 276 Q265 288 285 275" fill="none" stroke="#7e4b42" strokeWidth="3.2" strokeLinecap="round"/>
          <path d="M208 224 Q194 213 196 240 Q197 256 216 256 M325 221 Q341 215 337 241 Q335 255 320 254" fill="url(#qul-hero-skin)"/>
          <g className="qul-story-headset"><path d="M198 221 Q188 177 218 151 M327 221 Q343 179 320 149" fill="none" stroke="#b2dfd0" strokeWidth="5" strokeLinecap="round" opacity=".58"/>
          <rect x="181" y="211" width="18" height="38" rx="9" fill="#163741" stroke="#80c5c7" strokeWidth="2"/>
          <rect x="335" y="211" width="18" height="38" rx="9" fill="#163741" stroke="#80c5c7" strokeWidth="2"/></g>
        </g>
        <g className="qul-story-greeting-arm">
          <path d="M358 340 Q405 333 430 280" fill="none" stroke="#102b37" strokeWidth="31" strokeLinecap="round"/>
          <path d="M358 340 Q405 333 430 280" fill="none" stroke="#77bec6" strokeWidth="1.8" strokeOpacity=".48"/>
          <path d="M421 285 Q418 267 424 252 L428 221 Q429 216 434 221 L440 247 L443 208 Q446 200 451 209 L453 246 L462 212 Q467 206 470 215 L466 251 L477 231 Q485 225 484 236 L471 272 Q467 286 453 295Z" fill="url(#qul-hero-skin)"/>
        </g>
        <path d="M175 378 Q183 357 199 361 L221 393 L217 431 L158 431Z" fill="#183948"/>
      </g>
      <g className="qul-story-laptop">
        <path d="M164 342 L370 342 Q379 342 378 353 L356 445 Q354 453 344 453 L186 453 Q178 453 177 445 L155 352 Q153 342 164 342Z" fill="url(#qul-hero-device)" stroke="#8bdfd5" strokeOpacity=".7" strokeWidth="2"/>
        <path d="M164 353 H368 L348 440 H184Z" fill="url(#qul-hero-glass)" stroke="#aaf6e4" strokeOpacity=".3"/>
        <text x="267" y="411" textAnchor="middle" fill="#eafff7" fontSize="52" fontWeight="800" fontFamily="serif">قُل</text>
        <rect x="131" y="452" width="272" height="14" rx="7" fill="#2a525b" stroke="#a5d8cd" strokeOpacity=".5"/>
        <path d="M158 454 H375" stroke="#e6fff5" strokeOpacity=".25" strokeWidth="2"/>
      </g>
      <g className="qul-story-floating-mark" fontFamily="serif" fontWeight="700">
        <text x="87" y="124" fontSize="46" fill="#a9f6dc" opacity=".9">أ</text>
        <text x="400" y="174" fontSize="36" fill="#bde8fb" opacity=".8">ب</text>
        <text x="420" y="409" fontSize="27" fill="#eddbab" opacity=".75">ت</text>
      </g>
    </svg>
  );
}

export function LandingCinematicHero({ lang, onExplore, onEnter }: { lang: Language; onExplore: () => void; onEnter: () => void }) {
  const [zone, setZone] = useState<Zone>('idle');
  const zoneRef = useRef<Zone>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAr = lang === 'ar';
  const chooseZone = useCallback((next: Zone) => {
    if (zoneRef.current === next) return;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    zoneRef.current = next;
    setZone(next);
    if (next === 'left' || next === 'right') {
      resetTimer.current = setTimeout(() => { zoneRef.current = 'idle'; setZone('idle'); }, 2400);
    }
  }, []);
  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);
  const pointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch' || !window.matchMedia('(min-width: 901px)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = (event.clientX - rect.left) / rect.width;
    // RTL coordinates stay physical. The guide looks toward the actual pointer.
    chooseZone(fraction < .32 ? 'left' : fraction > .68 ? 'right' : 'center');
  };
  const messages = {
    ar: { idle: 'حرّك المؤشر لتبدأ الحكاية', left: 'من هنا تبدأ الحروف', right: 'وهنا تكتشف عالمًا جديدًا', center: 'أهلًا بك في عالم قُل!' },
    en: { idle: 'Move your cursor to start the story', left: 'Your first letters await', right: 'A new world awaits', center: 'Welcome to the world of QUL!' }
  };
  return (
    <section className="qul-story-hero" aria-label={isAr ? 'مقدمة تفاعلية لمنصة قُل' : 'QUL interactive introduction'}
      onPointerMove={pointerMove}
      onPointerLeave={() => chooseZone('idle')}
      onPointerDown={event => { if (event.pointerType === 'touch' && !(event.target as HTMLElement).closest('button')) chooseZone('center'); }}>
      <div className="qul-story-hero-halo" aria-hidden="true"/>
      <div className="qul-story-hero-grid">
        <div className="qul-story-copy">
          <span className="qul-story-overline"><span className="qul-story-dot"/> QUL LANGUAGE EXPERIENCE</span>
          <h1>{isAr ? <>تعلّم العربية <em>بطريقة تشعر بها.</em></> : <>Experience Arabic <em>in a new way.</em></>}</h1>
          <span className="qul-story-slogan">{isAr ? 'حتى تقول: أنا عربي' : 'Until you can say: ANA ARABI'}</span>
          <p>{isAr ? 'من أول حرف إلى أول حكاية، كل خطوة في قُل تجربة تستحق أن تعيشها.' : 'From your first letter to your first story, every step with QUL is an experience.'}</p>
          <div className="qul-story-hero-actions">
            <button type="button" onClick={onExplore} className="qul-story-primary">{isAr ? 'اكتشف الرحلة' : 'Explore the journey'} <ArrowDown size={18}/></button>
            <button type="button" onClick={onEnter} className="qul-story-secondary">{isAr ? 'دخول المنصة' : 'Enter QUL'} <ArrowUpRight size={17}/></button>
          </div>
          <span className="qul-story-interaction-hint"><span aria-hidden="true" className="qul-story-cursor"/> {messages[lang].idle}</span>
        </div>
        <div className="qul-story-art-zone" aria-live="off">
          <div className="qul-story-art-back" aria-hidden="true"/>
          <QulGuide zone={zone}/>
          <div className={'qul-story-reaction is-' + zone} role="status" aria-live="polite">{messages[lang][zone]}</div>
        </div>
        <div className="qul-story-side-note" aria-hidden="true">
          <span>قُل</span><i/>
          <span>{isAr ? 'لغة تُعاش' : 'LANGUAGE, ALIVE'}</span>
        </div>
      </div>
      <button type="button" className="qul-story-scroll-cue" onClick={onExplore} aria-label={isAr ? 'انتقل إلى رحلة استكشاف المنصة' : 'Go to the QUL journey'}>
        <span>{isAr ? 'اسحب لتكتشف' : 'SCROLL TO EXPLORE'}</span><ArrowDown size={15}/>
      </button>
    </section>
  );
}

export function LandingJourney({ lang, onEnter }: { lang: Language; onEnter: () => void }) {
  const [active, setActive] = useState(0);
  const isAr = lang === 'ar';
  const panels = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      const candidate = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (candidate) {
        const index = Number((candidate.target as HTMLElement).dataset.step);
        if (Number.isInteger(index)) setActive(index);
      }
    }, { threshold: [0.15, 0.35, 0.6], rootMargin: '-12% 0px -25% 0px' });
    panels.current.forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);
  const scene = steps[active];
  return (
    <section id="qul-journey" className="qul-journey" aria-label={isAr ? 'رحلة عبر أقسام منصة قُل' : 'A journey through QUL'}>
      <div className="qul-journey-heading">
        <span className="qul-story-overline"><Sparkles size={14}/> {isAr ? 'رحلتك تبدأ الآن' : 'YOUR JOURNEY STARTS HERE'}</span>
        <h2>{isAr ? 'أربع محطات، وآفاق بلا حدود' : 'Four chapters. Endless possibilities.'}</h2>
      </div>
      <div className="qul-journey-layout">
        <div className="qul-journey-stage" aria-label={isAr ? 'المحطة الحالية' : 'Current chapter'}>
          <div className={'qul-journey-scene qul-journey-scene-' + scene.accent} key={scene.id}>
            <div className="qul-journey-orbit one"/><div className="qul-journey-orbit two"/>
            <div className="qul-journey-scene-glass"/>
            <div className="qul-journey-sculpture" aria-hidden="true">{scene.glyph}</div>
            <span className="qul-journey-scene-top">QUL / CHAPTER {scene.en}</span>
            <span className="qul-journey-scene-bottom">{isAr ? scene.arNote : scene.enNote}</span>
          </div>
          <div className="qul-journey-progress" aria-label={isAr ? 'مراحل الرحلة' : 'Journey chapters'}>
            {steps.map((step, i) => <button key={step.id} type="button" className={i === active ? 'is-current' : ''}
              aria-label={(isAr ? 'انتقل إلى ' + step.arNote : 'Go to ' + step.enNote)}
              aria-current={i === active ? 'step' : undefined}
              onClick={() => panels.current[i]?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })}>{step.en}</button>)}
          </div>
        </div>
        <div className="qul-journey-chapters">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return <article key={step.id} data-step={index} ref={el => { panels.current[index] = el; }}
              className={'qul-journey-chapter' + (active === index ? ' is-active' : '')}>
              <span className="qul-journey-index">CHAPTER / {step.en}</span>
              <Icon size={27} strokeWidth={1.5} aria-hidden="true"/>
              <h3>{isAr ? step.arTitle : step.enTitle}</h3>
              <p>{isAr ? step.arNote : step.enNote}</p>
              <span className="qul-journey-rule"/>
            </article>;
          })}
        </div>
      </div>
      <div className="qul-journey-end">
        <span>{isAr ? 'الحكاية التالية تكتبها أنت.' : 'You write the next chapter.'}</span>
        <button type="button" className="qul-story-primary" onClick={onEnter}>{isAr ? 'ابدأ في قُل' : 'Start in QUL'} <ArrowUpRight size={18}/></button>
      </div>
    </section>
  );
}
