import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
  const [rotation,setRotation]=React.useState({tick:0,digit:'1'});
  const canDial=offHook&&!loading&&!active;
  const pressDigit=(digit:string)=>{
    if(!canDial)return;
    setRotation(prev=>({tick:prev.tick+1,digit}));
    onDial(digit);
  };
  return (
    <div className={'qul-source-telephone qul-photo-phone '+(offHook?'is-lifted':'is-cradled')}
      role="group" aria-label={ar?'هاتف برونزي تفاعلي':'Interactive bronze telephone'}>
      {/* The body has one unchanging coordinate system in both states. */}
      <motion.img className="qul-phone-static-body" src="/assets/speaking/phone-body-fixed.avif"
        alt="" draggable={false} aria-hidden="true" initial={false}
        animate={{opacity:offHook?1:0}}
        transition={reducedMotion?{duration:0}:{duration:offHook?.08:.18,delay:offHook?0:.55}}/>
      {/* The original, complete ON-HOOK photograph gives a perfectly seated receiver.
          It is aligned to the fixed body's cradle instead of rotating the lifted photo. */}
      <motion.img className="qul-phone-cradled-photo" src="/assets/speaking/phone-closed.avif"
        alt="" draggable={false} aria-hidden="true" initial={false}
        animate={{opacity:offHook?0:1}}
        transition={reducedMotion?{duration:0}:{duration:offHook?.2:.22,delay:offHook?0:.53,ease:'easeInOut'}}/>
      {/* The fully raised endpoint also uses the untouched reference photograph.
          A short handoff from the moving receiver hides the seam in the supplied mask. */}
      <motion.img className="qul-phone-raised-photo" src="/assets/speaking/phone-lifted.avif"
        alt="" draggable={false} aria-hidden="true" initial={false}
        animate={{opacity:offHook?1:0}}
        transition={reducedMotion?{duration:0}:{duration:.2,delay:offHook?.64:0,ease:'easeInOut'}}/>
      {/* Only the receiver animates. Raised endpoint matches the source photograph exactly,
          preventing the detached straight-edge fragment seen in earlier builds. */}
      <motion.div className="qul-phone-independent-handset"
        style={{transformOrigin:'57% 23.4%'}} initial={false}
        animate={offHook
          ? {x:0,y:0,rotate:0,opacity:1}
          : {x:0,y:'10%',rotate:23,opacity:0}}
        transition={reducedMotion?{duration:0}:{duration:.84,ease:[.25,.65,.25,1]}}
        aria-hidden="true">
        <img src="/assets/speaking/phone-handset-layer.avif" draggable={false} alt=""/>
      </motion.div>
      <button type="button" className="qul-phone-receiver-hit" disabled={loading}
        onClick={offHook?onHangup:onLift}
        aria-label={offHook?(ar?'إعادة السماعة إلى مكانها':'Return the receiver'):(ar?'رفع السماعة':'Lift the receiver')}/>
      <div className="qul-phone-native-dial" role="group"
        aria-label={ar?'قرص الأرقام الدوار':'Rotary number dial'}>
        <motion.img key={rotation.tick} src="/assets/speaking/phone-wheel-native.avif"
          draggable={false} alt="" aria-hidden="true"
          initial={{opacity:0,rotate:0}}
          animate={rotation.tick&&!reducedMotion&&offHook?
            {rotate:[0,(rotation.digit==='0'?10:Number(rotation.digit))*16,0],opacity:[0,1,1,0]}:
            {rotate:0,opacity:0}}
          transition={{duration:reducedMotion?0:.79,times:[0,.08,.55,1],ease:'easeInOut'}}/>
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
