import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Live3DCharacter } from './Live3DCharacter';

/**
 * Approved, identity-preserving portrait renderer.
 *
 * The full-body source remains untouched. Independent facial layers are shown
 * ONLY when a reviewed rig-approved.json is present and every required sprite
 * has loaded. Automated draft layers must never be displayed to students.
 */
interface Props {
  countryId: string;
  gender: 'male' | 'female';
  nameAr: string;
  isSelected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isLoading: boolean;
  audioLevel?: number;
  reaction?: 'idle' | 'correct' | 'retry' | 'greeting';
  className?: string;
  fallbackImage?: string;
}

type Viseme = 'A' | 'E' | 'O';
type ApprovedRig = {
  status: 'approved';
  source: 'cutout.webp';
  eyesClosed: string;
  mouth?: Partial<Record<Viseme, string>>;
  mouthVisible?: boolean;
  /** Optional, individually reviewed Salman-style expression sprites. */
  smile?: string;
  thinkingBrows?: string;
  listeningBrows?: string;
};
type LoadedRig = {
  eyesClosed: string;
  mouth: Partial<Record<Viseme, string>>;
  smile?: string;
  thinkingBrows?: string;
  listeningBrows?: string;
};
type LoadState = 'loading' | 'available' | 'missing';

const basePath = (countryId: string, gender: string) =>
  '/avatars/original-rigs/' + countryId + '/' + gender + '/';

const loadImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('Missing approved facial layer: ' + url));
  img.src = url;
});

const spriteIsConservative = (image: HTMLImageElement, source: HTMLImageElement): boolean => {
  if (image.naturalWidth !== source.naturalWidth || image.naturalHeight !== source.naturalHeight) {
    return false;
  }
  // A complete replacement portrait is NOT an expression layer. Only a small
  // fraction of the canvas may be painted. Skip this sprite if validation fails.
  try {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return false;
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let visible = 0;
    let sampled = 0;
    for (let pixel = 3; pixel < pixels.length; pixel += 32) {
      sampled++;
      if (pixels[pixel] > 20) visible++;
    }
    return visible > 0 && visible / sampled < 0.22;
  } catch {
    return false;
  }
};

export const OriginalPortraitAvatar: React.FC<Props> = ({
  countryId, gender, nameAr, isSelected, isSpeaking, isListening, isLoading,
  audioLevel = 0, reaction = 'idle', className = '', fallbackImage
}) => {
  const base = basePath(countryId, gender);
  const source = base + 'cutout.webp';
  const [load, setLoad] = React.useState<LoadState>('loading');
  const [rig, setRig] = React.useState<LoadedRig | null>(null);
  const [viseme, setViseme] = React.useState<Viseme>('A');
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    let alive = true;
    setLoad('loading');
    setRig(null);
    const photo = new Image();
    photo.onload = () => { if (alive) setLoad('available'); };
    photo.onerror = () => { if (alive) setLoad('missing'); };
    photo.src = source;

    // Optional. An absent rig is normal, never a reason to hide the portrait.
    const controller = new AbortController();
    void fetch(base + 'rig-approved.json', { signal: controller.signal })
      .then(async response => {
        if (!response.ok) return null;
        return await response.json() as ApprovedRig;
      })
      .then(async data => {
        if (!data || data.status !== 'approved' || data.source !== 'cutout.webp' ||
            typeof data.eyesClosed !== 'string') return;
        const safeName = (name: string) => /^[A-Za-z0-9_-]+\.webp$/.test(name);
        if (!safeName(data.eyesClosed)) return;
        // A full set of visemes is mandatory unless a face covering hides the mouth.
        const mouth: Partial<Record<Viseme, string>> = {};
        if (data.mouthVisible) {
          for (const shape of ['A', 'E', 'O'] as Viseme[]) {
            const name = data.mouth?.[shape];
            if (!name || !safeName(name)) return;
            mouth[shape] = base + name;
          }
        } else if (data.mouth && Object.keys(data.mouth).length > 0) {
          return; // Never reveal a covered mouth by accident.
        }
        const optional = {
          smile: data.mouthVisible ? data.smile : undefined,
          thinkingBrows: data.thinkingBrows,
          listeningBrows: data.listeningBrows
        };
        if (Object.values(optional).some(name => name !== undefined && !safeName(name))) return;
        const approved: LoadedRig = {
          eyesClosed: base + data.eyesClosed,
          mouth,
          ...(optional.smile ? { smile: base + optional.smile } : {}),
          ...(optional.thinkingBrows ? { thinkingBrows: base + optional.thinkingBrows } : {}),
          ...(optional.listeningBrows ? { listeningBrows: base + optional.listeningBrows } : {})
        };
        const sprites = [
          approved.eyesClosed, ...Object.values(approved.mouth),
          approved.smile, approved.thinkingBrows, approved.listeningBrows
        ].filter((url): url is string => Boolean(url));
        // Load and validate every sprite before enabling ANY face animation.
        const images = await Promise.all([loadImage(source), ...sprites.map(loadImage)]);
        if (images.slice(1).some(image => !spriteIsConservative(image, images[0]))) return;
        if (alive) setRig(approved);
      })
      .catch(() => { /* Absent or invalid draft means original portrait only. */ });
    return () => {
      alive = false;
      controller.abort();
      photo.onload = null;
      photo.onerror = null;
    };
  }, [base, source]);

  React.useEffect(() => {
    if (!rig || !isSpeaking || reduceMotion || Object.keys(rig.mouth).length !== 3) {
      setViseme('A');
      return;
    }
    let tick = 0;
    const sequence: Viseme[] = ['A', 'E', 'O', 'E', 'A', 'O'];
    const id = window.setInterval(() => {
      tick++;
      setViseme(sequence[tick % sequence.length]);
    }, Math.max(115, 175 - audioLevel * 55));
    return () => window.clearInterval(id);
  }, [rig, isSpeaking, audioLevel, reduceMotion]);

  if (load !== 'available') {
    return (
      <Live3DCharacter
        countryId={countryId}
        gender={gender}
        nameAr={nameAr}
        imageSrc={fallbackImage}
        isSelected={isSelected}
        isSpeaking={isSpeaking}
        isListening={isListening}
        isLoading={isLoading}
        audioLevel={audioLevel}
        reaction={reaction}
        className={className}
      />
    );
  }

  const maskClass = 'pointer-events-none absolute inset-0 h-full w-full select-none object-contain object-bottom';
  const mouthSrc = rig?.mouth[viseme] || null;
  const isThinking = isLoading;
  const activeBrows = isThinking ? rig?.thinkingBrows : isListening ? rig?.listeningBrows : null;
  const smile = !isSpeaking && (reaction === 'correct' || reaction === 'greeting')
    ? rig?.smile : null;
  // The whole original portrait moves by less than 0.3%; no pixels, colors,
  // face details or clothing are regenerated or geometrically repainted.
  const subtleMotion = reduceMotion
    ? { y: 0, scale: 1 }
    : { y: [0, -1.6, 0], scale: [1, isSpeaking ? 1.0028 : 1.0018, 1] };

  return (
    <div
      className={'relative h-full w-full overflow-visible ' + className}
      role="img"
      aria-label={nameAr + '، الشخصية الأصلية المعتمدة'}
    >
      <div aria-hidden="true"
        className="pointer-events-none absolute inset-x-[26%] bottom-[0.3%] h-[3.3%] rounded-[50%] bg-[#284c43]/20 blur-[9px]" />
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={subtleMotion}
        transition={{ duration: isSpeaking ? 2.2 : 4.6, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50% 90%', opacity: isSelected ? 1 : .97 }}
      >
        <img
          src={source}
          alt=""
          draggable={false}
          loading="eager"
          decoding="async"
          className={maskClass}
        />
        {rig && !reduceMotion && (
          <>
            <motion.img
              src={rig.eyesClosed}
              alt=""
              draggable={false}
              aria-hidden="true"
              className={maskClass}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0, 1, 0, 0] }}
              transition={{
                duration: 4.1,
                times: [0, .86, .92, .945, .97, 1],
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            {activeBrows && (
              <img src={activeBrows} alt="" draggable={false} aria-hidden="true" className={maskClass} />
            )}
            {smile && (
              <img src={smile} alt="" draggable={false} aria-hidden="true" className={maskClass} />
            )}
            {mouthSrc && isSpeaking && (
              <img src={mouthSrc} alt="" draggable={false} aria-hidden="true" className={maskClass} />
            )}
          </>
        )}
      </motion.div>
      {isSelected && (isSpeaking || isListening) && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[24%] bottom-[1%] h-[4px] rounded-full bg-emerald-400/35 blur-[7px]" />
      )}
    </div>
  );
};
