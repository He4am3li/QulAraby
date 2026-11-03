import React, { useEffect, useRef, useState } from 'react';
import './SriFrameHero.css';

export type SriRange = [number, number];
export type SriFrameManifest = {
  fps: number;
  frameCount: number;
  basePath: string;
  ranges: { working: SriRange; left: SriRange; right: SriRange; greeting: SriRange };
};

type Zone = 'working' | 'left' | 'right' | 'greeting';
type Props = {
  lang: 'ar' | 'en';
  manifest: SriFrameManifest;
  onExplore: () => void;
};

const framePath = (manifest: SriFrameManifest, index: number) =>
  manifest.basePath.replace(/\/$/, '') + '/frame_' + String(index + 1).padStart(5, '0') + '.webp';

function isManifestValid(manifest: SriFrameManifest) {
  if (!manifest || !Number.isInteger(manifest.frameCount) || manifest.frameCount <= 0 || manifest.fps <= 0) return false;
  return Object.values(manifest.ranges).every(value => Array.isArray(value) && value.length === 2
    && Number.isInteger(value[0]) && Number.isInteger(value[1]) && value[0] >= 0
    && value[0] < value[1] && value[1] < manifest.frameCount);
}

/**
 * Exact video-frame interaction model from the supplied three-page Sri Tech guide.
 *
 * All character poses are real image frames extracted from ONE source video:
 * working, look left, look right, and center greeting (notice, remove headset,
 * wave, point down). No CSS-rigged face or drawn substitute.
 *
 * Frame changes are DOM updates from requestAnimationFrame. React only
 * rerenders for the occasional contextual label, never for a video frame.
 */
export function SriFrameHero({ lang, manifest, onExplore }: Props) {
  const img = useRef<HTMLImageElement>(null);
  const previous = useRef<HTMLImageElement>(null);
  const currentZone = useRef<Zone>('working');
  const pointerZone = useRef<'left' | 'center' | 'right' | null>(null);
  const raf = useRef<number>(0);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [label, setLabel] = useState<Zone>('working');
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mobile, setMobile] = useState(false);
  const isArabic = lang === 'ar';

  useEffect(() => {
    if (!isManifestValid(manifest)) return;
    const match = window.matchMedia('(prefers-reduced-motion: reduce)');
    const touch = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    const update = () => { setReducedMotion(match.matches); setMobile(touch.matches); };
    update();
    match.addEventListener('change', update);
    touch.addEventListener('change', update);
    const initial = new Image();
    initial.onload = () => setReady(true);
    initial.src = framePath(manifest, manifest.ranges.working[0]);
    return () => {
      match.removeEventListener('change', update);
      touch.removeEventListener('change', update);
      initial.onload = null;
      cancelAnimationFrame(raf.current);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [manifest]);

  const begin = (next: Zone) => {
    if (!ready || !isManifestValid(manifest)) return;
    cancelAnimationFrame(raf.current);
    const earlier = img.current;
    const underlay = previous.current;
    if (!earlier || !underlay) return;
    currentZone.current = next;
    setLabel(next);

    // The single continuous video's ranges may begin at distinct poses.
    // Crossfade at the boundary; never replace the scene with a drawn pose.
    underlay.src = earlier.src;
    underlay.style.opacity = '1';
    earlier.style.transition = reducedMotion ? 'none' : 'opacity 260ms ease';
    earlier.style.opacity = reducedMotion ? '1' : '0';
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    const range = manifest.ranges[next];
    let currentFrame = -1;
    const start = performance.now();
    const duration = next === 'left' || next === 'right' ? 2500 : Infinity;
    const animate = (now: number) => {
      if (currentZone.current !== next) return;
      const elapsed = now - start;
      const fpsFrame = Math.floor(elapsed / 1000 * manifest.fps);
      const length = range[1] - range[0] + 1;
      const frame = next === 'working'
        ? range[0] + (reducedMotion ? 0 : fpsFrame % length)
        : range[0] + (reducedMotion ? 0 : Math.min(length - 1, fpsFrame));
      if (currentFrame !== frame) {
        currentFrame = frame;
        earlier.src = framePath(manifest, frame);
      }
      if (elapsed < duration) raf.current = requestAnimationFrame(animate);
      else if (currentZone.current === next) begin('working');
    };
    earlier.src = framePath(manifest, range[0]);
    // Force a composited fade after the new image source is selected.
    void earlier.offsetWidth;
    earlier.style.opacity = '1';
    fadeTimer.current = setTimeout(() => { underlay.style.opacity = '0'; }, 290);
    if (!reducedMotion) raf.current = requestAnimationFrame(animate);
    else if (next === 'left' || next === 'right') fadeTimer.current = setTimeout(() => begin('working'), 2400);
  };

  const handlePointer = (event: React.PointerEvent<HTMLElement>) => {
    if (mobile || event.pointerType === 'touch' || !ready) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const next = x < 1 / 3 ? 'left' : x > 2 / 3 ? 'right' : 'center';
    if (pointerZone.current === next) return;
    pointerZone.current = next;
    begin(next === 'center' ? 'greeting' : next);
  };

  useEffect(() => {
    if (!ready) return;
    if (mobile) {
      // Mobile has a single central experience, no invisible side zones.
      begin('greeting');
    } else {
      begin('working');
    }
    // This change intentionally starts a new scene when motion preferences change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, mobile, reducedMotion]);

  if (!isManifestValid(manifest)) return null;

  const wording = isArabic ? {
    name: 'قُل', role: 'منصة تفاعلية لتعلّم العربية',
    instruction: 'حرّك المؤشر لتتعرف علينا',
    working: 'هنا تبدأ الرحلة', left: 'أحدٌ هنا إلى اليسار؟',
    right: 'أحدٌ هنا إلى اليمين؟', greeting: 'مرحبًا بك! اكتشف المنصة',
    cta: 'استكشف المنصة', explore: 'اكتشف المزيد'
  } : {
    name: 'QUL', role: 'Interactive Arabic learning',
    instruction: 'Move your cursor to call me!',
    working: 'Your journey begins here', left: 'Anyone here on the left?',
    right: 'Anyone here on the right?', greeting: 'Hey, it\'s you! Hiiii! Explore QUL',
    cta: 'Explore the platform', explore: 'Scroll to explore'
  };

  return <section className="qul-sri-frame-hero" dir={isArabic ? 'rtl' : 'ltr'}
      onPointerMove={handlePointer}
      onPointerLeave={() => { pointerZone.current = null; if (!mobile) begin('working'); }}
      aria-label={isArabic ? 'مقدمة قُل التفاعلية' : 'QUL interactive hero'}>
    <div className="qul-sri-edge-glow" aria-hidden="true" />
    <div className="qul-sri-intro">
      <span className="qul-sri-brand">{wording.name}</span>
      <span className="qul-sri-role">{wording.role}</span>
      <span className="qul-sri-help"><span className="qul-sri-pointer" aria-hidden="true"/>{wording.instruction}</span>
    </div>
    <div className="qul-sri-character" aria-label={isArabic ? 'شخصية تعمل على حاسوب محمول وتستجيب للزائر' : 'Character working at a laptop, reacting to the visitor'}>
      <img ref={previous} className="qul-sri-frame qul-sri-frame-previous" alt="" aria-hidden="true" />
      <img ref={img} className="qul-sri-frame qul-sri-frame-front"
        alt={isArabic ? 'شخصية قُل التفاعلية' : 'QUL interactive character'}
        src={framePath(manifest, manifest.ranges.working[0])} draggable={false}/>
      {!ready && <span className="qul-sri-loading" aria-live="polite">{isArabic ? 'جارٍ تجهيز المشهد' : 'Preparing the scene'}</span>}
    </div>
    <div className="qul-sri-reaction" aria-live="polite">
      <span className="qul-sri-reaction-line" />
      {wording[label]}
    </div>
    {mobile && <button className="qul-sri-mobile-greeting" type="button" onClick={() => begin('greeting')}>
      {isArabic ? 'مرحبًا بك' : 'Say hello'}
    </button>}
    <button className="qul-sri-explore" type="button" onClick={onExplore}>{wording.explore}<span aria-hidden="true">↓</span></button>
  </section>;
}
