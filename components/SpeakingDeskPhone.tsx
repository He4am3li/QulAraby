import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { createRotarySoundPlayer, rotaryDurationMs, rotaryPulseCount } from '../services/rotaryDialAudio';
import { Mic, MicOff } from 'lucide-react';
import type { CallContact } from './SpeakingCallBooth';
import './SpeakingSourceAssets.css';
import './SpeakingMinimalPolish.css';

interface DeskPhoneProps {
  lang: 'ar' | 'en'; dialed: string; offHook: boolean; active: boolean; loading: boolean;
  micMuted: boolean; isAiSpeaking: boolean; selected: CallContact | null;
  onDial: (digit: string) => void; onLift: () => void; onHangup: () => void;
  onToggleMic: () => void; meterRef: React.RefObject<HTMLDivElement | null>;
}
/** Number coordinates follow the precise photographed disc, not drawn substitute numbers. */
const DIAL_HOLES = [
  ['1',81.4,26.1], ['2',65.2,15.5], ['3',48.9,11.4], ['4',32.6,16.7],
  ['5',19.7,26.1], ['6',10.2,43.6], ['7',12.5,60.6], ['8',23.1,73.5],
  ['9',39.8,81.4], ['0',57.2,82.9],
] as const;
export const SpeakingDeskPhone: React.FC<DeskPhoneProps> = ({
  lang,dialed,offHook,active,loading,micMuted,isAiSpeaking,
  onDial,onLift,onHangup,onToggleMic,meterRef,
}) => {
  const ar=lang==='ar', reducedMotion=useReducedMotion();
  const wheelRef = React.useRef<HTMLImageElement | null>(null);
  const currentMotionRef = React.useRef<Animation | null>(null);
  const soundRef = React.useRef<ReturnType<typeof createRotarySoundPlayer> | null>(null);
  React.useEffect(() => () => {
    currentMotionRef.current?.cancel();
    soundRef.current?.close();
    soundRef.current = null;
  }, []);
  const canDial=offHook&&!loading&&!active;
  const pressDigit=(digit:string)=>{
    if(!canDial)return;
    // The learner gets the new digit immediately even if a previous turn is still finishing.
    onDial(digit);
    if (!soundRef.current) soundRef.current = createRotarySoundPlayer();
    soundRef.current.play(digit);
    const wheel = wheelRef.current;
    if (!wheel || reducedMotion || typeof wheel.animate !== 'function') return;
    currentMotionRef.current?.cancel();
    const sweep = Math.min(152, 19 + rotaryPulseCount(digit) * 12.6);
    currentMotionRef.current = wheel.animate([
      { transform:'rotate(0deg)', opacity:0, offset:0 },
      { transform:`rotate(${sweep}deg)`, opacity:1, offset:.22 },
      { transform:`rotate(${sweep}deg)`, opacity:1, offset:.31 },
      { transform:'rotate(0deg)', opacity:0, offset:1 }
    ], { duration:rotaryDurationMs(digit), easing:'cubic-bezier(.22,.65,.27,1)', fill:'none' });
  };
  return (
    <div className={'qul-source-telephone qul-photo-phone '+(offHook?'is-lifted':'is-cradled')}
      role="group" aria-label={ar?'هاتف برونزي تفاعلي':'Interactive bronze telephone'}>
      {/* Keep the original complete telephone photographs intact.
          Both states are registered to the SAME stationary base. No clipped
          receiver masks or extra cord layers are allowed. */}
      <div className="qul-phone-intrinsic-size" aria-hidden="true"/>
      <motion.img className="qul-phone-cradled-photo"
        src="/assets/speaking/phone-closed.avif" alt="" draggable={false}
        aria-hidden="true" initial={false}
        animate={{opacity:offHook?0:1}}
        transition={reducedMotion?{duration:0}:{duration:.3,ease:'easeInOut'}}/>
      <motion.img className="qul-phone-lifted-photo"
        src="/assets/speaking/phone-lifted.avif" alt="" draggable={false}
        aria-hidden="true" initial={false}
        animate={{opacity:offHook?1:0}}
        transition={reducedMotion?{duration:0}:{duration:.42,ease:'easeInOut'}}/>
      <button type="button" className="qul-phone-receiver-hit" disabled={loading}
        onClick={offHook?onHangup:onLift}
        aria-label={offHook?(ar?'إعادة السماعة إلى مكانها':'Return the receiver'):(ar?'رفع السماعة':'Lift the receiver')}/>
      <div className="qul-phone-native-dial" role="group"
        aria-label={ar?'قرص الأرقام الدوار':'Rotary number dial'}>
        <img ref={wheelRef} src="/assets/speaking/phone-wheel-native.avif"
          draggable={false} alt="" aria-hidden="true" decoding="async" />
        {DIAL_HOLES.map(([digit,x,y])=>(
          <button type="button" key={digit} className="qul-phone-native-key"
            disabled={!canDial} style={{left:x+'%',top:y+'%'}} onClick={()=>pressDigit(digit)}
            aria-label={(ar?'رقم ':'Digit ')+digit}>
            <span className="sr-only">{digit}</span>
          </button>
        ))}
      </div>
      {!!dialed && <output dir="ltr" className="qul-phone-number-minimal" aria-live="polite">{dialed}</output>}
      {(loading||active) && <div className="qul-phone-live-badge" aria-live="polite">
        <span>{loading?(ar?'جارٍ الاتصال':'Connecting'):isAiSpeaking?(ar?'يتحدث':'Speaking'):(ar?'متصل':'Connected')}</span>
        {active && <>
          <div ref={meterRef} className="qul-phone-live-bars" style={{'--phone-mic':.12} as React.CSSProperties} aria-hidden="true">
            {Array.from({length:12},(_,i)=><i key={i} style={{height:(7+Math.abs(Math.sin(i*.65))*13)+'px',transform:'scaleY(var(--phone-mic, .12))'}}/>)}
          </div>
          <button type="button" onClick={onToggleMic}
            aria-label={micMuted?(ar?'تشغيل الميكروفون':'Unmute microphone'):(ar?'كتم الميكروفون':'Mute microphone')}>
            {micMuted?<MicOff size={16}/>:<Mic size={16}/>}
          </button>
        </>}
      </div>}
    </div>
  );
};
