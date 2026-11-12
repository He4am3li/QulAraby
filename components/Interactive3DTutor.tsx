import React from 'react';
import type { SpeechLipSync } from '../services/speechLipSync.mjs';
import { motion } from 'framer-motion';
import { OriginalPortraitAvatar } from './OriginalPortraitAvatar';
import { AlgerianLayeredAvatar } from './AlgerianLayeredAvatar';
import { TunisianLayeredAvatar } from './TunisianLayeredAvatar';
import { LebaneseLayeredAvatar } from './LebaneseLayeredAvatar';
import { IraqiLayeredAvatar } from './IraqiLayeredAvatar';
import { MoroccanLayeredAvatar } from './MoroccanLayeredAvatar';
import { EmiratiLayeredAvatar } from './EmiratiLayeredAvatar';
import { SalmanLayeredAvatar } from './SalmanLayeredAvatar';
import { SaraLayeredAvatar } from './SaraLayeredAvatar';
import { AhmedLayeredAvatar } from './AhmedLayeredAvatar';
import { FatimaLayeredAvatar } from './FatimaLayeredAvatar';

interface TutorCharacter {
  nameAr: string;
  nameEn: string;
  clothingAr?: string;
  clothingEn?: string;
  image: string;
}

interface Interactive3DTutorProps {
  countryId?: string;
  character: TutorCharacter;
  gender: 'male' | 'female';
  isSelected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isLoading: boolean;
  partnerState?: 'idle' | 'speaking' | 'listening';
  partnerDirection?: 'left' | 'right';
  audioLevel?: number;
  lipSync?: SpeechLipSync;
  countryNameAr: string;
  countryNameEn: string;
  dialectName: string;
  currentSpeechText?: string;
  lang: 'ar' | 'en';
  onSelect: () => void;
  onQuickTalk?: () => void;
  onStartLive?: () => void;
  successSignal?: number;
}

/** Full-height interactive character, with a cinematic name signature and no cards or floor line. */
export const Interactive3DTutor: React.FC<Interactive3DTutorProps> = ({
  countryId = 'saudi',
  character,
  gender,
  isSelected,
  isSpeaking,
  isListening,
  isLoading,
  partnerState = 'idle',
  partnerDirection = 'left',
  audioLevel = 0,
  lipSync,
  lang,
  onSelect,
  successSignal = 0
}) => {
  const [celebrating, setCelebrating] = React.useState(false);
  const previousSuccessRef = React.useRef(successSignal);
  const isLayeredSalman = countryId === 'saudi' && gender === 'male';
  const isLayeredAhmed = countryId === 'egypt' && gender === 'male';
  const isLayeredFatima = countryId === 'egypt' && gender === 'female';
  const isLayeredSara = countryId === 'saudi' && gender === 'female';

  React.useEffect(() => {
    const previous = previousSuccessRef.current;
    previousSuccessRef.current = successSignal;
    if (!isSelected || successSignal <= previous) return;
    setCelebrating(true);
    const timeout = window.setTimeout(() => setCelebrating(false), 2400);
    return () => window.clearTimeout(timeout);
  }, [successSignal, isSelected]);

  const choose = () => {
    if (!isSelected) onSelect();
  };

  return (
    <div
      onClick={choose}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          choose();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={(lang === 'ar' ? 'اختيار ' : 'Select ') + (lang === 'ar' ? character.nameAr : character.nameEn)}
      className={'group relative flex h-full min-h-0 min-w-0 w-full cursor-pointer select-none flex-col items-center justify-end rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ' +
        (isSelected ? 'z-20' : 'z-10')}
    >
      <motion.div
        animate={{
          opacity: isSelected ? 1 : 0.97,
          scale: 1
        }}
        transition={{ duration: .32, ease: 'easeOut' }}
        className="relative w-full min-h-0 flex-1 overflow-visible"
      >
        {isSelected && (
          <div className="absolute inset-x-[14%] top-[19%] bottom-[5%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(73,187,163,.16),transparent_71%)] pointer-events-none" aria-hidden="true"/>
        )}
        <div className="absolute inset-0 overflow-visible">
          {countryId === 'algeria' ? (
            <AlgerianLayeredAvatar
              actor={gender === 'male' ? 'amin' : 'meriem'}
              view="full"
              isSpeaking={isSpeaking}
              isListening={isListening || partnerState === 'listening'}
              isLoading={isLoading}
              partnerSpeaking={partnerState === 'speaking'}
              partnerDirection={partnerDirection}
              lipSync={lipSync}
              reaction={celebrating ? 'correct' : 'idle'}
              className="h-full w-full"
            />
          ) : countryId === 'tunisia' ? (
            <TunisianLayeredAvatar
              actor={gender === 'male' ? 'sami' : 'ons'}
              view="full"
              isSpeaking={isSpeaking}
              isListening={isListening || partnerState === 'listening'}
              isLoading={isLoading}
              partnerSpeaking={partnerState === 'speaking'}
              partnerDirection={partnerDirection}
              lipSync={lipSync}
              reaction={celebrating ? 'correct' : 'idle'}
              className="h-full w-full"
            />
          ) : countryId === 'lebanon' ? (
            <LebaneseLayeredAvatar
              actor={gender === 'male' ? 'jad' : 'layla'}
              view="full"
              isSpeaking={isSpeaking}
              isListening={isListening || partnerState === 'listening'}
              isLoading={isLoading}
              partnerSpeaking={partnerState === 'speaking'}
              partnerDirection={partnerDirection}
              lipSync={lipSync}
              reaction={celebrating ? 'correct' : 'idle'}
              className="h-full w-full"
            />
          ) : countryId === 'iraq' ? (
            <IraqiLayeredAvatar
              actor={gender === 'male' ? 'sinan' : 'zeina'}
              view="full"
              isSpeaking={isSpeaking}
              isListening={isListening || partnerState === 'listening'}
              isLoading={isLoading}
              partnerSpeaking={partnerState === 'speaking'}
              partnerDirection={partnerDirection}
              lipSync={lipSync}
              reaction={celebrating ? 'correct' : 'idle'}
              className="h-full w-full"
            />
          ) : countryId === 'morocco' ? (
            <MoroccanLayeredAvatar
              actor={gender === 'male' ? 'yassine' : 'kenza'}
              view="full"
              isSpeaking={isSpeaking}
              isListening={isListening || partnerState === 'listening'}
              isLoading={isLoading}
              partnerSpeaking={partnerState === 'speaking'}
              partnerDirection={partnerDirection}
              lipSync={lipSync}
              reaction={celebrating ? 'correct' : 'idle'}
              className="h-full w-full"
            />
          ) : countryId === 'uae' ? (
            <EmiratiLayeredAvatar
              actor={gender === 'male' ? 'zayed' : 'maitha'}
              view="full"
              isSpeaking={isSpeaking}
              isListening={isListening || partnerState === 'listening'}
              isLoading={isLoading}
              partnerSpeaking={partnerState === 'speaking'}
              partnerDirection={partnerDirection}
              lipSync={lipSync}
              reaction={celebrating ? 'correct' : 'idle'}
              className="h-full w-full"
            />
          ) : isLayeredSalman ? (
            <SalmanLayeredAvatar
              view="full"
              isSpeaking={isSpeaking}
              isListening={isListening || partnerState === 'listening'}
              isLoading={isLoading}
              partnerSpeaking={partnerState === 'speaking'}
              partnerDirection={partnerDirection}
              audioLevel={audioLevel}
              lipSync={lipSync}
              reaction={celebrating ? 'correct' : 'idle'}
              className="h-full w-full"
            />
          ) : isLayeredSara ? (
            <SaraLayeredAvatar
              view="full"
              isSpeaking={isSpeaking}
              isListening={isListening || partnerState === 'listening'}
              isLoading={isLoading}
              partnerSpeaking={partnerState === 'speaking'}
              partnerDirection={partnerDirection}
              audioLevel={audioLevel}
              lipSync={lipSync}
              reaction={celebrating ? 'correct' : 'idle'}
              className="h-full w-full"
            />
          ) : isLayeredAhmed ? (
            <AhmedLayeredAvatar
              view="full"
              isSpeaking={isSpeaking}
              isListening={isListening || partnerState === 'listening'}
              isLoading={isLoading}
              partnerSpeaking={partnerState === 'speaking'}
              partnerDirection={partnerDirection}
              lipSync={lipSync}
              reaction={celebrating ? 'correct' : 'idle'}
              className="h-full w-full"
            />
          ) : isLayeredFatima ? (
            <FatimaLayeredAvatar
              view="full"
              isSpeaking={isSpeaking}
              isListening={isListening || partnerState === 'listening'}
              isLoading={isLoading}
              partnerSpeaking={partnerState === 'speaking'}
              partnerDirection={partnerDirection}
              lipSync={lipSync}
              reaction={celebrating ? 'correct' : 'idle'}
              className="h-full w-full"
            />
          ) : (
            <OriginalPortraitAvatar
              countryId={countryId}
              gender={gender}
              isSelected={isSelected}
              isSpeaking={isSpeaking}
              isListening={isListening}
              isLoading={isLoading}
              audioLevel={audioLevel}
              reaction={celebrating ? 'correct' : 'idle'}
              fallbackImage={character.image}
              nameAr={character.nameAr}
              className="h-full w-full"
            />
          )}
        </div>
      </motion.div>

      <div className="relative z-10 flex h-[38px] shrink-0 flex-col items-center justify-center gap-[1px] text-center">
        <div className="flex items-center justify-center gap-1.5">
          {isSelected && <span className="h-[6px] w-[6px] rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,.65)]" aria-hidden="true"/>}
          <span className={'text-[clamp(16px,1.65vw,22px)] font-black leading-tight arabic-font ' +
            (isSelected ? 'text-slate-900' : 'text-slate-600')}>
            {lang === 'ar' ? character.nameAr : character.nameEn}
          </span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-slate-400" dir="ltr">
          {lang === 'ar' ? character.nameEn : character.nameAr}
        </span>
      </div>
    </div>
  );
};
