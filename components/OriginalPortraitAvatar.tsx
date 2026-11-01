import React from 'react';
import { motion } from 'framer-motion';
import { Live3DCharacter } from './Live3DCharacter';

/**
 * Original-pixel portrait runtime for QUL dialect tutors.
 *
 * Only a transparent portrait cutout can be displayed. The old black-background
 * source.webp is NEVER rendered as a cutout; it remains archived for reference.
 * A transparent cutout becomes the displayed character once its local image has loaded. Otherwise the established WebGL tutor is
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
  '/avatars/original-rigs/' + countryId + '/' + gender + '/cutout.webp';

export const OriginalPortraitAvatar: React.FC<Props> = ({
  countryId, gender, nameAr, isSelected, isSpeaking, isListening, isLoading,
  audioLevel = 0, reaction = 'idle', className = '', fallbackImage
}) => {
  const source = basePath(countryId, gender);
  const [load, setLoad] = React.useState<LoadState>('loading');

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

  // Whole-image swaying and repeated scaling made the portrait appear to float.
  // An approved layered face/body rig is required before introducing lip, eye
  // or arm motion. Until then keep the original image and feet stable.
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
          className="absolute inset-0 h-full w-full select-none object-contain object-bottom"
        />
      </motion.div>
      {isSelected && (isSpeaking || isListening) && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[24%] bottom-[1%] h-[4px] rounded-full bg-emerald-400/35 blur-[7px]" />
      )}
    </div>
  );
};
