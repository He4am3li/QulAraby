import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import type { CallContact } from './SpeakingCallBooth';
import './SpeakingSourceAssets.css';

interface DeskPhoneProps {
  lang: 'ar' | 'en';
  dialed: string;
  offHook: boolean;
  active: boolean;
  loading: boolean;
  micMuted: boolean;
  isAiSpeaking: boolean;
  selected: CallContact | null;
  onDial: (digit: string) => void;
  onLift: () => void;
  onHangup: () => void;
  onToggleMic: () => void;
  meterRef: React.RefObject<HTMLDivElement | null>;
}

/* Exact numerals in the user's supplied rotary dial close-up, not drawn circles. */
const DIAL_HOLES = [
  ['1',79,31], ['2',66,22], ['3',51,15], ['4',34,22],
  ['5',21,34], ['6',16,48], ['7',18,62], ['8',29,75],
  ['9',46,81], ['0',60,82],
] as const;

export const SpeakingDeskPhone: React.FC<DeskPhoneProps> = ({
  lang, dialed, offHook, active, loading, micMuted, isAiSpeaking, selected,
  onDial, onLift, onHangup, onToggleMic, meterRef,
}) => {
  const ar = lang === 'ar';
  const reducedMotion = useReducedMotion();
  const [rotation, setRotation] = React.useState({ tick: 0, digit: '1' });
  const canDial = offHook && !loading && !active;
  const turn = (digit: string) => {
    if (!canDial) return;
    setRotation(prev => ({ tick: prev.tick + 1, digit }));
    onDial(digit);
  };

  return (
    <div className={'qul-source-telephone ' + (offHook ? 'is-lifted' : 'is-cradled')}
      role="group" aria-label={ar ? 'هاتف برونزي من الصور الأصلية' : 'Original photographic bronze telephone'}>
      <img src="/assets/speaking/phone-closed.avif" className="qul-source-phone-image is-closed"
        draggable={false} alt="" aria-hidden="true" />
      <img src="/assets/speaking/phone-lifted.avif" className="qul-source-phone-image is-open"
        draggable={false} alt="" aria-hidden="true" />

      <button type="button" className="qul-source-handset-action"
        disabled={loading}
        onClick={offHook ? onHangup : onLift}
        aria-label={offHook
          ? (ar ? 'أعد السماعة إلى مكانها لإنهاء المكالمة' : 'Put the receiver down to hang up')
          : (ar ? 'ارفع السماعة من فوق الهاتف' : 'Lift the receiver from the cradle')}
        title={offHook ? (ar ? 'أغلق السماعة' : 'Hang up') : (ar ? 'ارفع السماعة' : 'Lift receiver')}
      />

      <div className="qul-source-dial-mount" role="group"
        aria-label={ar ? 'القرص الدوار بالأرقام من صفر إلى تسعة' : 'Rotary dial with ten real digits'}>
        <motion.img key={rotation.tick} src="/assets/speaking/phone-dial.avif"
          className="qul-source-dial-image" draggable={false} alt=""
          animate={rotation.tick && !reducedMotion ? {
            rotate: [0, (rotation.digit === '0' ? 10 : Number(rotation.digit)) * 17, 0],
          } : { rotate: 0 }}
          transition={{ duration: reducedMotion ? 0 : .77, times: [0, .36, 1], ease: 'easeInOut' }}
          aria-hidden="true" />
        {DIAL_HOLES.map(([digit,x,y]) => (
          <button type="button" key={digit} className="qul-source-dial-hit"
            style={{ left: x + '%', top: y + '%' }} disabled={!canDial}
            onClick={() => turn(digit)}
            aria-label={(ar ? 'اطلب الرقم ' : 'Dial digit ') + digit}
            title={digit}>
            <span className="sr-only">{digit}</span>
          </button>
        ))}
      </div>
      <div className="qul-source-number" dir="ltr" aria-live="polite">{dialed || (offHook ? '···' : '')}</div>
      {offHook && (
        <div className="qul-source-call-state" aria-live="polite">
          <strong>{loading ? (ar ? 'جارٍ الاتصال' : 'Connecting')
            : active ? (isAiSpeaking ? (ar ? 'الطرف الآخر يتحدث' : 'Contact speaking') : (ar ? 'المكالمة متصلة' : 'Connected'))
              : selected ? (ar ? 'اطلب الرقم من الدليل' : 'Dial the number')
                : (ar ? 'اختر جهة من الدليل' : 'Choose a contact')}</strong>
          {active && <>
            <div className="qul-source-audio-meter" ref={meterRef} style={{ '--phone-mic': .12 } as React.CSSProperties} aria-hidden="true">
              {Array.from({ length: 14 }, (_,i) => (
                <i key={i} style={{ height: (8 + Math.abs(Math.sin(i * .65)) * 15) + 'px', transform: 'scaleY(var(--phone-mic, .12))' }}/>
              ))}
            </div>
            <button type="button" className="qul-source-mute" onClick={onToggleMic} aria-label={ar ? 'كتم الميكروفون' : 'Mute microphone'}>
              {micMuted ? <MicOff size={16}/> : <Mic size={16}/>}
            </button>
          </>}
          <button type="button" className="qul-source-hangup" onClick={onHangup} disabled={loading}
            title={ar ? 'إنهاء المكالمة' : 'Hang up'} aria-label={ar ? 'إنهاء المكالمة وإعادة السماعة' : 'Hang up and replace handset'}>
            <PhoneOff size={16}/>
          </button>
        </div>
      )}
    </div>
  );
};