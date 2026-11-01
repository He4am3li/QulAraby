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
};
type LoadedRig = { eyesClosed: string; mouth: Partial<Record<Viseme, string>> };
type LoadState = 'loading' | 'available' | 'missing';

const basePath = (countryId: string, gender: string) =>
  '/avatars/original-rigs/' + countryId + '/' + gender + '/';

const loadImage = (url: string): Promise<void> => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve();
  img.onerror = () => reject(new Error('Missing approved facial layer'));
  img.src = url;
});

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
        const mouth: Partial<Record<Viseme, string>> = {};
        if (data.mouthVisible) {
          for (const shape of ['A', 'E', 'O'] as Viseme[]) {
            const name = data.mouth?.[shape];
            if (!name || !safeName(name)) return;
            mouth[shape] = base + name;
          }
        }
        const eyesClosed = base + data.eyesClosed;
        await Promise.all([loadImage(eyesClosed), ...Object.values(mouth).map(loadImage)]);
        if (alive) setRig({ eyesClosed, mouth });
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
        animate={{ opacity: isSelected ? 1 : .96 }}
        transition={{ duration: .22 }}
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
            {mouthSrc && (
              <motion.img
                src={mouthSrc}
                alt=""
                draggable={false}
                aria-hidden="true"
                className={maskClass}
                initial={false}
                animate={{ opacity: isSpeaking ? .82 : 0 }}
                transition={{ duration: .1 }}
              />
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
