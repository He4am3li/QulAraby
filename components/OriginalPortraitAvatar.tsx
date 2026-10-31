import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Live3DCharacter } from './Live3DCharacter';

/**
 * Original-pixel portrait runtime for QUL dialect tutors.
 *
 * A portrait becomes the displayed character only once its own local
 * image has loaded successfully. Otherwise the established WebGL tutor is
 * retained, so incomplete uploads cannot break the learning experience.
 *
 * Non-destructive, subtle pose motion is possible on an intact portrait.
 * This is NOT a segmented or phoneme-rigged Cubism model. Mouth/eye animation
 * requires approved layers with reconstructed hidden geometry.
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
type LoadState = 'loading' | 'available' | 'missing';
const basePath = (countryId: string, gender: string) =>
  '/avatars/original-rigs/' + countryId + '/' + gender + '/source.webp';

export const OriginalPortraitAvatar: React.FC<Props> = ({
  countryId, gender, nameAr, isSelected, isSpeaking, isListening, isLoading,
  audioLevel = 0, reaction = 'idle', className = '', fallbackImage
}) => {
  const source = basePath(countryId, gender);
  const [load, setLoad] = React.useState<LoadState>('loading');
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    let alive = true;
    setLoad('loading');
    const image = new Image();
    image.onload = () => { if (alive) setLoad('available'); };
    image.onerror = () => { if (alive) setLoad('missing'); };
    image.src = source;
    return () => { alive = false; image.onload = null; image.onerror = null; };
  }, [source]);

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

  return (
    <div
      className={'relative h-full w-full overflow-visible ' + className}
      role="img"
      aria-label={nameAr + '، الشخصية الأصلية المعتمدة'}
    >
      <div className="pointer-events-none absolute inset-[7%_12%_8%] rounded-full bg-slate-900/[.045] blur-3xl" />
      <motion.img
        key={source}
        src={source}
        alt=""
        draggable={false}
        loading="eager"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        style={{
          transformOrigin: 'center bottom',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
          maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{
          opacity: isSelected ? 1 : .96,
          y: reducedMotion ? 0 : (reaction === 'correct' ? [-1,-7,0] : [0,-2,0]),
          scale: reducedMotion ? 1 : (isSpeaking ? [1.003,1.012,1.003] : [1,1.005,1]),
          rotate: reducedMotion ? 0 : (isListening ? [0,-.32,0] : [0,.14,0]),
        }}
        transition={{
          opacity: { duration: .28 },
          y: { duration: reaction === 'correct' ? .5 : 3.3, repeat: reaction === 'correct' ? 0 : Infinity, ease: 'easeInOut' },
          scale: { duration: isSpeaking ? 1.0 : 3.7, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </div>
  );
};
