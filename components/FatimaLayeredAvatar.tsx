import React from 'react';
import { useReducedMotion } from 'framer-motion';
import { REST_LIPS, type SpeechLipSync } from '../services/speechLipSync.mjs';
import { createMouthCompositor } from '../services/speechMouth.mjs';
import { FATIMA_MANIFEST_URL, FATIMA_ORIGINAL_URL, paintFatima, resolveFatimaAttention, validateFatimaManifest } from '../services/fatimaFacialRig.mjs';

type Reaction = 'idle' | 'greeting' | 'correct' | 'retry';
type Layer = { x: number; y: number; w: number; h: number; visible: boolean; url: string };
type Manifest = {
  width: number;
  height: number;
  source: string;
  layers: Record<string, Layer>;
  order: string[];
};
type Assets = { original: HTMLImageElement; manifest: Manifest; images: Record<string, HTMLImageElement>; mouth: ReturnType<typeof createMouthCompositor> };
interface Props {
  isSpeaking?: boolean;
  isListening?: boolean;
  isLoading?: boolean;
  partnerSpeaking?: boolean;
  partnerDirection?: 'left' | 'right';
  audioLevel?: number;
  lipSync?: SpeechLipSync;
  reaction?: Reaction;
  view?: 'portrait' | 'full';
  className?: string;
}

let sharedAssets: Promise<Assets> | null = null;
function loadFatima(): Promise<Assets> {
  if (sharedAssets) return sharedAssets;
  sharedAssets = fetch(FATIMA_MANIFEST_URL, { cache: 'force-cache' })
    .then(async response => {
      if (!response.ok) throw new Error('Fatima layers missing: ' + response.status);
      const manifest = validateFatimaManifest(await response.json()) as Manifest | null;
      if (!manifest) throw new Error('Invalid Fatima facial manifest');
      const images: Record<string, HTMLImageElement> = {};
      const decode = (url: string, w: number, h: number) => new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image(); image.decoding = 'async';
        image.onload = () => image.naturalWidth === w && image.naturalHeight === h
          ? resolve(image) : reject(new Error('Fatima sprite dimensions changed'));
        image.onerror = () => reject(new Error('Cannot decode Fatima artwork'));
        image.src = url;
      });
      const original = await decode(manifest.source, manifest.width, manifest.height);
      await Promise.all(Object.entries(manifest.layers).map(async ([name, layer]) => {
        images[name] = await decode(layer.url, layer.w, layer.h);
      }));
      const mouth = createMouthCompositor(manifest.layers, images,
        { Closed: 'Mouth_Closed', A: 'Mouth_A', E: 'Mouth_E', O: 'Mouth_O', Open: 'Mouth_A', FV: 'Mouth_FV' },
        () => document.createElement('canvas'));
      return { manifest, images, mouth, original };
    })
    .catch(error => {
      sharedAssets = null;
      throw error;
    });
  return sharedAssets;
}

/** Original Fatima artwork with independent facial animation and output-audio lip sync. */
export const FatimaLayeredAvatar: React.FC<Props> = ({
  isSpeaking = false, isListening = false, isLoading = false,
  partnerSpeaking = false, partnerDirection = 'left',
  audioLevel = 0, lipSync, reaction = 'idle', view = 'full', className = ''
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const nativeFrameRef = React.useRef<HTMLCanvasElement | null>(null);
  const assetsRef = React.useRef<Assets | null>(null);
  const [ready, setReady] = React.useState(false);
  const reduceMotion = useReducedMotion();
  const viewport = view === 'portrait'
    ? { x: 325, y: 0, w: 375, h: 540 }
    : { x: 100, y: 0, w: 824, h: 1536 };
  const attention = resolveFatimaAttention({ isSpeaking, isListening, isLoading, partnerSpeaking, partnerDirection, reaction });
  const motionRef = React.useRef({ ...attention, lipSync });
  motionRef.current = { ...attention, lipSync };

  React.useEffect(() => {
    let mounted = true;
    loadFatima().then(assets => {
      if (mounted) {
        assetsRef.current = assets;
        setReady(true);
      }
    }).catch(error => console.warn('Fatima rig unavailable; displaying original Fatima artwork.', error));
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const assets = assetsRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!ready || reduceMotion || !canvas || !assets || !context) return;
    // Compose source partitions at integer native coordinates before scaling.
    // Scaling each cropped part independently can expose fractional-pixel seams.
    const nativeFrame = nativeFrameRef.current ?? document.createElement('canvas');
    nativeFrameRef.current = nativeFrame;
    nativeFrame.width = assets.manifest.width;
    nativeFrame.height = assets.manifest.height;
    const nativeContext = nativeFrame.getContext('2d', { alpha: true });
    if (!nativeContext) {
      setReady(false);
      return;
    }
    nativeContext.imageSmoothingEnabled = true;
    nativeContext.imageSmoothingQuality = 'high';
    let active = true;
    let raf = 0;
    let lastFrame = -Infinity;
    let nextBlink = performance.now() + 2200 + Math.random() * 1900;
    let blinkStart = -Infinity;
    let displayedGaze = 0;
    let requestedGaze = 0;
    let emphasis = 0;
    // The complete original silhouette remains inside the viewport, including shoes.
    const paint = (time: number) => {
      if (!active) return;
      raf = requestAnimationFrame(paint);
      if (document.hidden || time - lastFrame < 15) return;
      const elapsed = Math.min(100, Math.max(0, time - lastFrame));
      lastFrame = time;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width <= 1 || height <= 1) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.max(1, Math.round(width * dpr));
      const ch = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, cw, ch);
      const scale = Math.min(width / viewport.w, height / viewport.h);
      const x = (width - viewport.w * scale) / 2 - viewport.x * scale;
      const y = (height - viewport.h * scale) / 2 - viewport.y * scale;
      context.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * x, dpr * y);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      const current = motionRef.current;
      if (current.gazeX !== requestedGaze) {
        requestedGaze = current.gazeX;
        blinkStart = time;
        nextBlink = time + 3400 + Math.random() * 2600;
      } else if (time >= nextBlink) {
        blinkStart = time;
        nextBlink = time + 3400 + Math.random() * 2600;
      }
      const phase = (time - blinkStart) / 220;
      const blink = !reduceMotion && phase > 0 && phase < 1 ? Math.sin(Math.PI * phase) : 0;
      if (phase >= 0.5) displayedGaze = requestedGaze;
      const lips = current.state === 'speaking' ? current.lipSync?.read() ?? REST_LIPS : REST_LIPS;
      const targetEmphasis = lips.active ? Math.min(0.35, Math.max(0, lips.energy) * 0.35) : 0;
      emphasis += (targetEmphasis - emphasis) * (1 - Math.exp(-elapsed / 140));
      nativeContext.clearRect(0, 0, nativeFrame.width, nativeFrame.height);
      paintFatima(nativeContext, assets, {
        blink, state: current.state, gazeX: displayedGaze, emphasis: lips.active ? emphasis : 0, lips
      });
      context.drawImage(nativeFrame, 0, 0);
    };
    raf = requestAnimationFrame(paint);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [ready, reduceMotion, view]);

  return (
    <div className={'relative overflow-hidden ' + className} role="img"
      aria-label="فاطمة، معلمة اللهجة المصرية، من الرسم الأصلي مع رمش العينين والنظرات وحركة الشفاه المتزامنة مع الصوت"
      style={{ background: 'transparent' }}>
      <svg viewBox={`${viewport.x} ${viewport.y} ${viewport.w} ${viewport.h}`}
        aria-hidden="true" preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full object-contain pointer-events-none"
        style={{ opacity: ready && !reduceMotion ? 0 : 1, background: 'transparent' }}>
        <image href={FATIMA_ORIGINAL_URL} x="0" y="0" width="1024" height="1536" />
      </svg>
      <canvas ref={canvasRef} aria-hidden="true"
        className="absolute inset-0 h-full w-full pointer-events-none"
        style={{ opacity: ready && !reduceMotion ? 1 : 0, background: 'transparent' }} />
    </div>
  );
};
