import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Phone, Mic, MicOff, PhoneOff } from 'lucide-react';
import type { CallContact } from './SpeakingCallBooth';
import './SpeakingDeskPhone.css';
import './SpeakingReferencePhoto.css';

type DeskPhoneProps = {
  lang: 'ar' | 'en';
  dialed: string;
  active: boolean;
  loading: boolean;
  micMuted: boolean;
  isAiSpeaking: boolean;
  selected: CallContact | null;
  onDial: (digit: string) => void;
  onCall: () => void;
  onEnd: () => void;
  onToggleMic: () => void;
  meterRef: React.RefObject<HTMLDivElement | null>;
};

/** Real bronze telephone photographed in the approved QUL reference, with accessible dial hotspots. */
const DIAL_POSITIONS = [
  ['1',68.0,41.0], ['2',57.6,35.2], ['3',45.9,31.3], ['4',35.5,35.0],
  ['5',27.5,40.5], ['6',23.8,50.0], ['7',24.5,59.0], ['8',32.3,69.0],
  ['9',42.9,71.6], ['0',53.2,71.5],
] as const;

export const SpeakingDeskPhone: React.FC<DeskPhoneProps> = ({
  lang, dialed, active, loading, micMuted, isAiSpeaking, selected,
  onDial, onCall, onEnd, onToggleMic, meterRef,
}) => {
  const ar = lang === 'ar';
  const reduced = useReducedMotion();
  const busy = active || loading;
  const [lastDigit,setLastDigit] = React.useState('1');
  const [dialTurn,setDialTurn] = React.useState(0);

  return (
    <div className="qul-reference-telephone" role="group"
      aria-label={ar ? 'الهاتف البرونزي التفاعلي، مطابق للمرجع' : 'Interactive reference-matched bronze telephone'}>
      <div className="qul-ref-phone-shadow" aria-hidden="true"/>
      <motion.div className="qul-ref-phone-cord" aria-hidden="true"
        animate={busy ? { scaleY: 1.035, y: -4 } : {scaleY:1,y:0}}
        transition={{duration:reduced?0:.58}}/>
      <div className="qul-ref-phone-base" role="group"
        aria-label={ar ? 'قرص طلب الأرقام' : 'Rotary dial'}>
        <motion.div className="qul-ref-dial-glint" key={dialTurn}
          initial={{rotate:0,opacity:0}}
          animate={dialTurn?{rotate:[0,(lastDigit==='0'?10:Number(lastDigit))*17,0],opacity:[0,.35,0]}:{rotate:0,opacity:0}}
          transition={{duration:reduced?0:.74,ease:'easeInOut'}}
          aria-hidden="true"/>
        {DIAL_POSITIONS.map(([digit,x,y])=>(
          <button key={digit} type="button"
            className="qul-ref-dial-hit"
            style={{left:x+'%',top:y+'%'}}
            disabled={busy}
            title={(ar?'الرقم ':'Digit ')+digit}
            aria-label={(ar?'اتصل بالرقم ':'Dial digit ')+digit}
            onClick={()=>{
              setLastDigit(digit);
              setDialTurn(t=>t+1);
              onDial(digit);
            }}>
            <span className="sr-only">{digit}</span>
          </button>
        ))}
      </div>
      <motion.button type="button"
        className="qul-ref-phone-receiver"
        disabled={loading}
        title={busy?(ar?'إنهاء المكالمة':'Hang up'):(ar?'رفع السماعة للاتصال':'Lift receiver to call')}
        aria-label={busy?(ar?'إغلاق السماعة وإنهاء المكالمة':'Hang up the handset'):
          (ar?'رفع السماعة بالكامل وبدء المكالمة':'Lift the receiver completely to call')}
        onClick={busy?onEnd:onCall}
        initial={false}
        animate={busy
          ? {x:26,y:-49,rotate:8,scale:1.025}
          : {x:0,y:0,rotate:0,scale:1}}
        transition={reduced?{duration:0}:{type:'spring',stiffness:76,damping:15,mass:1.2}}
      />
      {busy && (
        <div className="qul-ref-call-indicator" aria-live="polite">
          <div className="qul-ref-call-message">
            {loading?(ar?'جارٍ الاتصال':'Connecting')
             : isAiSpeaking?(ar?'الطرف الآخر يتحدث':'Contact speaking')
             : micMuted?(ar?'الميكروفون مكتوم':'Muted')
             :(ar?'المكالمة متصلة':'Connected')}
          </div>
          <div className="qul-ref-meter" ref={meterRef}
            style={{'--phone-mic':.12} as React.CSSProperties} aria-hidden="true">
            {Array.from({length:15},(_,i)=>
              <i key={i} style={{
                height:(8+Math.abs(Math.sin(i*.61))*21)+'px',
                transform:'scaleY(var(--phone-mic, .12))',
              }}/>
            )}
          </div>
          <div className="qul-ref-inline-actions">
            <button type="button" disabled={!active} onClick={onToggleMic}>
              {micMuted?<MicOff size={15}/>:<Mic size={15}/>}
              <span>{micMuted?(ar?'تشغيل':'Unmute'):(ar?'كتم':'Mute')}</span>
            </button>
            <button type="button" onClick={onEnd}><PhoneOff size={16}/>{ar?'إنهاء':'End'}</button>
          </div>
        </div>
      )}
      {dialed && !busy && (
        <div className="qul-ref-dialed-number" role="status">
          <Phone size={12}/><span dir="ltr">{dialed}</span>
        </div>
      )}
    </div>
  );
};