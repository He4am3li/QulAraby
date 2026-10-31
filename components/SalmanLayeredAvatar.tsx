import React from 'react';

/**
 * Salman uses the original approved 42 PSD sprites.
 * Render directly to a transparent canvas in the parent document.
 * An iframe can acquire an opaque dark background on some browsers.
 *
 * This is a layered 2D facial rig, NOT a genuine 3D mesh. Do not substitute
 * an unrelated procedurally generated person for the approved Salman artwork.
 */
type SalmanReaction = 'idle' | 'greeting' | 'correct' | 'retry';
type RigState = SalmanReaction | 'speaking' | 'listening' | 'thinking';
type Layer = { x: number; y: number; w: number; h: number; visible: boolean; url: string };
type Assets = {
  layers: Record<string, Layer>;
  images: Record<string, HTMLImageElement>;
  order: string[];
};

interface SalmanLayeredAvatarProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  isLoading?: boolean;
  reaction?: SalmanReaction;
  audioLevel?: number;
  view?: 'portrait' | 'full';
  className?: string;
}

const EYES = new Set([
  'EyeWhite_R_Original', 'EyeWhite_L_Original',
  'LidUpper_R', 'LidUpper_L', 'LidLower_R', 'LidLower_L',
  'Iris_R', 'Iris_L', 'Pupil_R', 'Pupil_L'
]);
const HIDDEN = new Set([
  'Face_HiddenSkin_Rebuilt', 'Neck_HiddenExtension_Rebuilt',
  'Torso_HiddenShoulders_Rebuilt', 'EyeWhite_R_Rebuilt', 'EyeWhite_L_Rebuilt'
]);
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

let sharedAssets: Promise<Assets> | null = null;
function loadSalman(): Promise<Assets> {
  if (sharedAssets) return sharedAssets;
  sharedAssets = fetch('/avatars/salman-layers.json', { cache: 'force-cache' })
    .then(async response => {
      if (!response.ok) throw new Error('Salman layers missing: ' + response.status);
      const data = await response.json() as { layers: Record<string, Layer> };
      const order = Object.keys(data.layers).reverse();
      const images: Record<string, HTMLImageElement> = {};
      await Promise.all(Object.entries(data.layers).map(([name, layer]) => new Promise<void>((resolve, reject) => {
        const image = new Image();
        images[name] = image;
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Cannot decode Salman sprite: ' + name));
        image.src = layer.url;
      })));
      return { layers: data.layers, images, order };
    })
    .catch(error => {
      sharedAssets = null; // Allow retry after network failures.
      throw error;
    });
  return sharedAssets;
}

export const SalmanLayeredAvatar: React.FC<SalmanLayeredAvatarProps> = ({
  isSpeaking = false,
  isListening = false,
  isLoading = false,
  reaction = 'idle',
  audioLevel = 0,
  view = 'full',
  className = ''
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const assetsRef = React.useRef<Assets | null>(null);
  const [ready, setReady] = React.useState(false);

  const state: RigState = isSpeaking
    ? 'speaking'
    : isListening
      ? 'listening'
      : isLoading
        ? 'thinking'
        : reaction;

  const motionRef = React.useRef({ state, since: 0, audioLevel });
  if (motionRef.current.state !== state) {
    motionRef.current.state = state;
    motionRef.current.since = 0;
  }
  motionRef.current.audioLevel = audioLevel;

  React.useEffect(() => {
    let mounted = true;
    loadSalman()
      .then(assets => {
        if (!mounted) return;
        assetsRef.current = assets;
        setReady(true);
      })
      .catch(error => {
        console.warn('Salman rig unavailable; displaying approved static artwork.', error);
      });
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const assets = assetsRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ctx || !assets) return;

    let active = true;
    let raf = 0;
    let lastFrame = 0;
    let nextBlink = performance.now() + 1900 + Math.random() * 2300;
    let blinkStart = -1000;
    const viewport = view === 'full'
      ? { x: 150, y: -5, w: 725, h: 1540 }
      : { x: 185, y: 0, w: 665, h: 950 };

    const paint = (time: number) => {
      if (!active) return;
      raf = requestAnimationFrame(paint);
      if (document.hidden || time - lastFrame < 32) return; // ~30 fps, mobile friendly.
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
      // Clear the actual drawing surface; never paint a black background.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      const padding = 2;
      const scale = Math.min((width - padding * 2) / viewport.w, (height - padding * 2) / viewport.h);
      const x = (width - viewport.w * scale) / 2 - viewport.x * scale;
      const y = (height - viewport.h * scale) / 2 - viewport.y * scale;
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, x * dpr, y * dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (time > nextBlink) {
        blinkStart = time;
        nextBlink = time + 3200 + Math.random() * 2900;
      }
      const phase = clamp((time - blinkStart) / 220, 0, 1);
      const blink = phase > 0 && phase < 1 ? Math.sin(Math.PI * phase) : 0;

      const motion = motionRef.current;
      if (!motion.since) motion.since = time;
      const elapsed = (time - motion.since) / 1000;
      const speaking = motion.state === 'speaking';
      const smile = ['greeting', 'correct', 'retry'].includes(motion.state);
      const mouthBeat = (elapsed * (speaking ? 3.4 : 1)) % 1;

      const draw = (name: string, alpha = 1, dx = 0, dy = 0) => {
        const layer = assets.layers[name];
        const sprite = assets.images[name];
        if (!layer || !sprite?.naturalWidth || alpha <= 0.005) return;
        ctx.globalAlpha = clamp(alpha, 0, 1);
        ctx.drawImage(sprite, layer.x + dx, layer.y + dy, layer.w, layer.h);
        ctx.globalAlpha = 1;
      };

      for (const name of assets.order) {
        const layer = assets.layers[name];
        if (!layer.visible || HIDDEN.has(name)) continue;
        if (name === 'Mouth_Closed') {
          if (speaking) {
            // Simple speaking animation. Accurate phoneme alignment requires
            // timestamps from speech synthesis, not only a boolean flag.
            const energy = clamp(motion.audioLevel, 0, 1);
            const beat = (mouthBeat + energy * 0.12) % 1;
            const shape = beat < 0.16 ? 'Mouth_Closed'
              : beat < 0.35 ? 'Mouth_E'
              : beat < 0.52 ? 'Mouth_O'
              : beat < 0.73 ? 'Mouth_A'
              : beat < 0.86 ? 'Mouth_Open'
              : 'Mouth_Closed';
            draw(shape);
          } else {
            draw(smile ? 'Mouth_Smile' : 'Mouth_Closed');
          }
          continue;
        }
        if (name === 'Brow_R' || name === 'Brow_L') {
          const suffix = motion.state === 'thinking' ? '_Thinking'
            : motion.state === 'listening' ? '_Attentive' : '';
          if (suffix) {
            draw(name, 0.3);
            draw(name + suffix, 0.7);
          } else draw(name);
          continue;
        }
        if (EYES.has(name)) {
          const isPupil = name.startsWith('Iris_') || name.startsWith('Pupil_');
          const gaze = motion.state === 'thinking' ? 0.7 : motion.state === 'listening' ? -0.45 : 0;
          draw(name, 1 - blink, isPupil ? gaze : 0);
          if (name === 'Pupil_R') draw('Blink_R_Closed', blink);
          if (name === 'Pupil_L') draw('Blink_L_Closed', blink);
          continue;
        }
        draw(name);
      }
    };

    raf = requestAnimationFrame(paint);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [ready, view]);

  return (
    <div
      className={'relative overflow-hidden ' + className}
      role="img"
      aria-label="سلمان، معلم اللهجة السعودية، من الرسم الأصلي مع رمش العينين وحركة الشفاه"
      style={{ background: 'transparent' }}
    >
      <img
        src="/avatars/salman-original.svg"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ opacity: ready ? 0 : 1, background: 'transparent' }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: ready ? 1 : 0, background: 'transparent' }}
      />
    </div>
  );
};
