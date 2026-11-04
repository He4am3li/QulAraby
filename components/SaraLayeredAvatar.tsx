import React from 'react';
import { useReducedMotion } from 'framer-motion';
import { REST_LIPS, type SpeechLipSync } from '../services/speechLipSync.mjs';
import { createMouthCompositor } from '../services/speechMouth.mjs';
import { SARA_MANIFEST_URL, SARA_ORIGINAL_URL, paintSara, validateSaraManifest } from '../services/saraFacialRig.mjs';

type Reaction = 'idle' | 'greeting' | 'correct' | 'retry';
type State = Reaction | 'speaking' | 'listening' | 'thinking';
type Layer = { x: number; y: number; w: number; h: number; visible: boolean; url: string };
type Manifest = {
  width: number;
  height: number;
  mouthVisible: false;
  layers: Record<string, Layer>;
  order: string[];
  eyeClips: Record<'R' | 'L', string>;
};
type Assets = { manifest: Manifest; images: Record<string, HTMLImageElement>; clips: Record<'R' | 'L', Path2D>; mouth: ReturnType<typeof createMouthCompositor> };
interface Props {
  isSpeaking?: boolean;
  isListening?: boolean;
  isLoading?: boolean;
  audioLevel?: number;
  lipSync?: SpeechLipSync;
  reaction?: Reaction;
  view?: 'portrait' | 'full';
  className?: string;
}

let sharedAssets: Promise<Assets> | null = null;
function loadSara(): Promise<Assets> {
  if (sharedAssets) return sharedAssets;
  sharedAssets = Promise.all([fetch(SARA_MANIFEST_URL, { cache: 'force-cache' }), fetch('/avatars/sara-mouth-v1.json', { cache: 'force-cache' })])
    .then(async ([response, mouthResponse]) => {
      if (!response.ok) throw new Error('Sara layers missing: ' + response.status);
      const manifest = validateSaraManifest(await response.json()) as Manifest | null;
      if (!manifest) throw new Error('Invalid Sara face layer manifest');
      const clips = { R: new Path2D(manifest.eyeClips.R), L: new Path2D(manifest.eyeClips.L) };
      const images: Record<string, HTMLImageElement> = {};
      await Promise.all(Object.entries(manifest.layers).map(([name, layer]) => new Promise<void>((resolve, reject) => {
        const sprite = new Image();
        sprite.decoding = 'async';
        sprite.onload = () => {
          if (sprite.naturalWidth !== layer.w || sprite.naturalHeight !== layer.h) {
            reject(new Error('Sara sprite dimensions changed: ' + name));
          } else {
            images[name] = sprite;
            resolve();
          }
        };
        sprite.onerror = () => reject(new Error('Cannot decode Sara sprite: ' + name));
        sprite.src = layer.url;
      })));
      if (!mouthResponse.ok) throw new Error('Sara speech mouth artwork missing');
      const speech = await mouthResponse.json();
      if (speech?.version !== 1 || speech.characterId !== 'saudi_female' || !speech.layers) throw new Error('Invalid Sara mouth artwork');
      const mouthImages: Record<string, HTMLImageElement> = {};
      await Promise.all(['Closed', 'A', 'E', 'O', 'FV'].map(name => new Promise<void>((resolve, reject) => {
        const part = speech.layers[name];
        if (!part || part.x !== 448 || part.y !== 186 || part.w !== 80 || part.h !== 44 ||
            typeof part.url !== 'string' || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(part.url)) { reject(new Error('Invalid Sara mouth sprite')); return; }
        const image = new Image(); image.onload = () => {
          if (image.naturalWidth !== part.w || image.naturalHeight !== part.h) reject(new Error('Sara mouth sprite dimensions changed'));
          else { mouthImages[name] = image; resolve(); }
        }; image.onerror = reject; image.src = part.url;
      })));
      const covering = Object.entries(manifest.layers).filter(([name, layer]) => /^FaceCover(?:_|$)/.test(name) && layer.visible)
        .map(([name, layer]) => ({ ...layer, image: images[name] }));
      const mouth = createMouthCompositor(speech.layers, mouthImages, { Closed: 'Closed', A: 'A', E: 'E', O: 'O', Open: 'A', FV: 'FV' }, () => document.createElement('canvas'), covering);
      return { manifest, clips, images, mouth };
    })
    .catch(error => {
      sharedAssets = null;
      throw error;
    });
  return sharedAssets;
}

/** Salman-style facial layers, with Sara's original body and face covering fixed. */
export const SaraLayeredAvatar: React.FC<Props> = ({
  isSpeaking = false, isListening = false, isLoading = false,
  audioLevel = 0, lipSync, reaction = 'idle', view = 'full', className = ''
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const nativeFrameRef = React.useRef<HTMLCanvasElement | null>(null);
  const assetsRef = React.useRef<Assets | null>(null);
  const [ready, setReady] = React.useState(false);
  const reduceMotion = useReducedMotion();
  const viewport = view === 'portrait'
    ? { x: 350, y: 25, w: 300, h: 650 }
    : { x: 200, y: 0, w: 780, h: 1536 };
  const state: State = isSpeaking ? 'speaking' : isListening ? 'listening' : isLoading ? 'thinking' : reaction;
  const motionRef = React.useRef({ state, lipSync });
  motionRef.current = { state, lipSync };

  React.useEffect(() => {
    let mounted = true;
    loadSara().then(assets => {
      if (mounted) {
        assetsRef.current = assets;
        setReady(true);
      }
    }).catch(error => console.warn('Sara rig unavailable; displaying original Sara artwork.', error));
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
    // The complete original silhouette remains inside the viewport, including shoes.
    const paint = (time: number) => {
      if (!active) return;
      raf = requestAnimationFrame(paint);
      if (document.hidden || time - lastFrame < 15) return;
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
      if (!reduceMotion && time >= nextBlink) {
        blinkStart = time;
        nextBlink = time + 3400 + Math.random() * 2600;
      }
      const phase = (time - blinkStart) / 220;
      const blink = !reduceMotion && phase > 0 && phase < 1 ? Math.sin(Math.PI * phase) : 0;
      const current = motionRef.current;
      const gazeX = reduceMotion ? 0 : current.state === 'thinking' ? 1.2
        : current.state === 'listening' ? -0.55
          : current.state === 'speaking' ? 0.3 * Math.sin(time / 1100) : 0;
      const gazeY = !reduceMotion && current.state === 'thinking' ? -0.6 : 0;
      nativeContext.clearRect(0, 0, nativeFrame.width, nativeFrame.height);
      paintSara(nativeContext, assets, {
        blink, state: reduceMotion ? 'idle' : current.state, gazeX, gazeY, lips: current.lipSync?.read() ?? REST_LIPS
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
      aria-label="سارة، معلمة اللهجة السعودية، من الرسم الأصلي مع رمش العينين والنظرات وحركة الشفاه المتزامنة مع الصوت"
      style={{ background: 'transparent' }}>
      <svg viewBox={`${viewport.x} ${viewport.y} ${viewport.w} ${viewport.h}`}
        aria-hidden="true" preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full object-contain pointer-events-none"
        style={{ opacity: ready && !reduceMotion ? 0 : 1, background: 'transparent' }}>
        <image href={SARA_ORIGINAL_URL} x="0" y="0" width="1024" height="1536" />
      </svg>
      <canvas ref={canvasRef} aria-hidden="true"
        className="absolute inset-0 h-full w-full pointer-events-none"
        style={{ opacity: ready && !reduceMotion ? 1 : 0, background: 'transparent' }} />
    </div>
  );
};
