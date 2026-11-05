import React from 'react';
import { useReducedMotion } from 'framer-motion';
import { REST_LIPS, type SpeechLipSync } from '../services/speechLipSync.mjs';
import { createMouthCompositor } from '../services/speechMouth.mjs';
import { TUTOR_BODY_VIEWPORT } from '../services/tutorAttention.mjs';
import { SAUDI_MANIFEST_URLS, SAUDI_SOURCE_URLS, validateSaudiManifest, resolveSaudiAttention, paintSaudi } from '../services/saudiFacialRig.mjs';

type Actor = 'salman' | 'sara';
type Layer = { x: number; y: number; w: number; h: number; visible: boolean; url: string };
type Manifest = { width: number; height: number; source: string; layers: Record<string, Layer>; coverings: string[]; eyeClips: Record<'R' | 'L', string> };
type Assets = { manifest: Manifest; original: HTMLImageElement; images: Record<string, HTMLImageElement>; clips: Record<'R' | 'L', Path2D>; mouth: ReturnType<typeof createMouthCompositor> };
export interface SaudiAvatarProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  isLoading?: boolean;
  partnerSpeaking?: boolean;
  partnerDirection?: 'left' | 'right';
  reaction?: 'idle' | 'greeting' | 'correct' | 'retry';
  audioLevel?: number;
  lipSync?: SpeechLipSync;
  view?: 'portrait' | 'full';
  className?: string;
}
const shared: Record<Actor, Promise<Assets> | null> = { salman: null, sara: null };
function loadActor(actor: Actor): Promise<Assets> {
  if (shared[actor]) return shared[actor]!;
  shared[actor] = fetch(SAUDI_MANIFEST_URLS[actor], { cache: 'force-cache' }).then(async response => {
    if (!response.ok) throw new Error(actor + ' facial layers missing');
    const manifest = validateSaudiManifest(await response.json(), actor) as Manifest | null;
    if (!manifest) throw new Error('Invalid ' + actor + ' facial manifest');
    const decode = (url: string, width: number, height: number) => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image(); image.decoding = 'async';
      image.onload = () => image.naturalWidth === width && image.naturalHeight === height ? resolve(image) : reject(new Error(actor + ' sprite size changed'));
      image.onerror = () => reject(new Error(actor + ' artwork unavailable')); image.src = url;
    });
    const images: Record<string, HTMLImageElement> = {};
    const [original] = await Promise.all([
      decode(manifest.source, manifest.width, manifest.height),
      Promise.all(Object.entries(manifest.layers).map(async ([key, layer]) => { images[key] = await decode(layer.url, layer.w, layer.h); }))
    ]);
    const covering = manifest.coverings.map(key => ({ ...manifest.layers[key], image: images[key] }));
    const mouth = createMouthCompositor(manifest.layers, images,
      { Closed: 'Mouth_Closed', A: 'Mouth_A', E: 'Mouth_E', O: 'Mouth_O', Open: 'Mouth_A', FV: 'Mouth_FV' },
      () => document.createElement('canvas'), covering);
    return { manifest, original, images, mouth, clips: { R: new Path2D(manifest.eyeClips.R), L: new Path2D(manifest.eyeClips.L) } };
  }).catch(error => { shared[actor] = null; throw error; });
  return shared[actor]!;
}

/** Registered face overlays on the reviewed inward-facing full-body artwork. */
export const SaudiLayeredAvatar: React.FC<SaudiAvatarProps & { actor: Actor }> = ({
  actor, isSpeaking = false, isListening = false, isLoading = false, partnerSpeaking = false,
  partnerDirection = 'left', reaction = 'idle', lipSync, view = 'full', className = ''
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null), nativeRef = React.useRef<HTMLCanvasElement | null>(null);
  const assetsRef = React.useRef<Assets | null>(null);
  const [ready, setReady] = React.useState(false);
  const reduced = useReducedMotion();
  const viewport = view === 'full' ? TUTOR_BODY_VIEWPORT : { x: 340, y: 0, w: 340, h: 650 };
  const attention = resolveSaudiAttention({ isSpeaking, isListening, isLoading, partnerSpeaking, partnerDirection, reaction });
  const motionRef = React.useRef({ ...attention, lipSync }); motionRef.current = { ...attention, lipSync };
  React.useEffect(() => {
    let mounted = true; setReady(false); assetsRef.current = null;
    loadActor(actor).then(assets => { if (mounted) { assetsRef.current = assets; setReady(true); } })
      .catch(error => console.warn('Saudi tutor layers unavailable; displaying reviewed artwork.', error));
    return () => { mounted = false; };
  }, [actor]);
  React.useEffect(() => {
    const canvas = canvasRef.current, assets = assetsRef.current, destination = canvas?.getContext('2d', { alpha: true });
    if (!ready || reduced || !canvas || !assets || !destination) return;
    const native = nativeRef.current ?? document.createElement('canvas'); nativeRef.current = native;
    native.width = assets.manifest.width; native.height = assets.manifest.height;
    const context = native.getContext('2d', { alpha: true }); if (!context) return;
    context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
    let active = true, raf = 0, last = -Infinity, nextBlink = performance.now() + 2200 + Math.random() * 1900;
    let blinkStart = -Infinity, requestedGaze = 0, displayedGaze = 0, emphasis = 0;
    const paint = (time: number) => {
      if (!active) return; raf = requestAnimationFrame(paint);
      if (document.hidden || time - last < 15) return;
      const elapsed = Math.min(100, Math.max(0, time - last)); last = time;
      const width = canvas.clientWidth, height = canvas.clientHeight; if (width <= 1 || height <= 1) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2), cw = Math.round(width * dpr), ch = Math.round(height * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      destination.setTransform(1, 0, 0, 1, 0, 0); destination.clearRect(0, 0, cw, ch);
      const scale = Math.min(width / viewport.w, height / viewport.h), x = (width - viewport.w * scale) / 2 - viewport.x * scale, y = (height - viewport.h * scale) / 2 - viewport.y * scale;
      destination.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * x, dpr * y);
      destination.imageSmoothingEnabled = true; destination.imageSmoothingQuality = 'high';
      const current = motionRef.current;
      if (current.gazeX !== requestedGaze) { requestedGaze = current.gazeX; blinkStart = time; nextBlink = time + 3400 + Math.random() * 2600; }
      else if (time >= nextBlink) { blinkStart = time; nextBlink = time + 3400 + Math.random() * 2600; }
      const phase = (time - blinkStart) / 220, blink = phase > 0 && phase < 1 ? Math.sin(Math.PI * phase) : 0;
      if (phase >= 0.5) displayedGaze = requestedGaze;
      const lips = current.state === 'speaking' ? current.lipSync?.read() ?? REST_LIPS : REST_LIPS;
      const target = lips.active ? Math.min(0.35, Math.max(0, lips.energy) * 0.35) : 0;
      emphasis += (target - emphasis) * (1 - Math.exp(-elapsed / 140));
      context.clearRect(0, 0, native.width, native.height);
      paintSaudi(context, assets, { state: current.state, gazeX: displayedGaze * 2, blink, emphasis: lips.active ? emphasis : 0, lips });
      destination.drawImage(native, 0, 0);
    };
    raf = requestAnimationFrame(paint);
    return () => { active = false; cancelAnimationFrame(raf); };
  }, [ready, reduced, view, actor]);
  return <div className={'relative overflow-hidden ' + className} role="img"
    aria-label={actor === 'salman' ? 'سلمان، معلم اللهجة السعودية، مع تعابير الوجه والنظرات والشفاه المتزامنة مع الصوت' : 'سارة، معلمة اللهجة السعودية، مع تعابير الوجه والنظرات والشفاه الظاهرة أسفل البرقع المعدني'} style={{ background: 'transparent' }}>
    <svg viewBox={`${viewport.x} ${viewport.y} ${viewport.w} ${viewport.h}`} aria-hidden="true" preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full object-contain pointer-events-none" style={{ opacity: ready && !reduced ? 0 : 1, background: 'transparent' }}>
      <image href={SAUDI_SOURCE_URLS[actor]} x="0" y="0" width="1024" height="1536" />
    </svg>
    <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ opacity: ready && !reduced ? 1 : 0, background: 'transparent' }} />
  </div>;
};
