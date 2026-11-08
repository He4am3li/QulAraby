import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Delete, RotateCcw } from 'lucide-react';
import type { CallContact } from './SpeakingCallBooth';
import './SpeakingDeskPhone.css';

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

const ROTARY_DIGITS = ['1','2','3','4','5','6','7','8','9','0'] as const;

export const SpeakingDeskPhone: React.FC<DeskPhoneProps> = ({
  lang,dialed,active,loading,micMuted,isAiSpeaking,selected,onDial,onCall,onEnd,onToggleMic,meterRef,
}) => {
  const ar=lang==='ar';
  const reduced=useReducedMotion();
  const [turned,setTurned]=React.useState(0);
  const [lastDigit,setLastDigit]=React.useState('1');
  const busy=active||loading;
  const fingerPosition=lastDigit==='0'?10:Number(lastDigit);

  return (
    <div className="qul-vintage-device" aria-label={ar ? 'هاتف المكتب الكلاسيكي التفاعلي' : 'Interactive classic desk telephone'}>
      <div className="qul-vintage-stage-halo" aria-hidden="true"/>
      <div className="qul-vintage-cable" aria-hidden="true">
        <motion.svg viewBox="0 0 170 245" preserveAspectRatio="none"
          animate={{ y: busy ? -17 : 0, x: busy ? -6 : 0 }}
          transition={{ duration:reduced?0:.7 }}>
          <path d="M153 10 C101 10 127 42 85 44 C54 46 65 69 87 70 C110 71 117 93 94 102 C70 110 76 128 98 131 C126 134 122 156 91 162 C63 171 80 196 55 217 C42 231 18 231 6 241"/>
          <path className="qul-vintage-cord-shine" d="M153 10 C101 10 127 42 85 44 C54 46 65 69 87 70 C110 71 117 93 94 102 C70 110 76 128 98 131 C126 134 122 156 91 162 C63 171 80 196 55 217 C42 231 18 231 6 241"/>
        </motion.svg>
      </div>

      <motion.button type="button" className="qul-vintage-handset" aria-label={
        busy ? (ar?'إغلاق السماعة وإنهاء المكالمة':'Hang up the receiver')
          : (ar?'رفع السماعة وبدء المكالمة':'Lift receiver and call')
      }
        onClick={busy?onEnd:onCall} disabled={loading}
        initial={false}
        animate={busy
          ? { x:-60,y:-122,rotate:-16,rotateY:-7 }
          : { x:-26,y:-52,rotate:-8,rotateY:0 }}
        transition={reduced?{duration:0}:{type:'spring',stiffness:92,damping:16,mass:1.4}}>
        <span className="qul-vintage-ear left"><i/></span>
        <span className="qul-vintage-handle"><i/><i/></span>
        <span className="qul-vintage-ear right"><i/></span>
      </motion.button>

      <div className="qul-vintage-rest" aria-hidden="true"><span/><span/></div>
      <div className="qul-vintage-body">
        <div className="qul-vintage-enamel" aria-hidden="true"/>
        <div className="qul-vintage-reflection" aria-hidden="true"/>
        <div className="qul-vintage-dial-label" dir="ltr">
          <span>QUL · 1968</span>
          <strong>{busy && selected ? (ar?selected.ar:selected.en) : (ar?'الهاتف':'TELEPHONE')}</strong>
          <small>{dialed || '•••'} <i className={active?'live':''}/></small>
        </div>
        <div className="qul-vintage-rotary-groove">
          <div className="qul-vintage-bezel"/>
          <motion.div className="qul-vintage-rotary-wheel" key={turned}
            animate={turned===0||reduced?{rotate:0}:{rotate:[0,fingerPosition*13,0]}}
            transition={{duration:reduced?0:.72,times:[0,.42,1],ease:'easeInOut'}}>
            <span className="qul-vintage-dial-scratches" aria-hidden="true"/>
            <button type="button" onClick={onCall} disabled={busy} className="qul-vintage-center-call"
              aria-label={ar?'اتصال':'Call'}>
              <Phone size={23} fill="currentColor"/>
              <strong>{ar?'اتصال':'CALL'}</strong>
            </button>
            {ROTARY_DIGITS.map((digit,i)=>{
              const radians=(-128+i*36)*Math.PI/180;
              const x=50+39*Math.cos(radians);
              const y=50+39*Math.sin(radians);
              return (
                <button type="button" key={digit} disabled={busy} className="qul-vintage-hole"
                  style={{left:x+'%',top:y+'%'}}
                  aria-label={(ar?'الرقم ':'Dial ') + digit}
                  onClick={() => {setLastDigit(digit);setTurned(x=>x+1);onDial(digit);}}>
                  <span>{digit}</span>
                </button>
              );
            })}
          </motion.div>
          <div className="qul-vintage-rotary-stop" aria-hidden="true"/>
        </div>
        <div className="qul-vintage-bottom-actions">
          <button type="button" disabled={busy||!dialed} onClick={()=>onDial('#')}>
            <Delete size={15}/>{ar?'حذف':'DELETE'}
          </button>
          <button type="button" disabled={busy||!dialed} onClick={()=>onDial('*')}>
            <RotateCcw size={14}/>{ar?'مسح':'CLEAR'}
          </button>
        </div>
        <div className="qul-vintage-feet" aria-hidden="true"><i/><i/></div>
      </div>
      {busy && (
        <div className="qul-vintage-call-console">
          <span className="qul-vintage-call-status">
            {loading ? (ar?'جارٍ توصيل المكالمة':'CONNECTING')
              : isAiSpeaking ? (ar?'الجهة تتحدث':'AGENT SPEAKING')
              : (ar?'المكالمة متصلة':'CONNECTED')}
          </span>
          <div ref={meterRef} className="qul-vintage-call-wave" style={{'--phone-mic':.12} as React.CSSProperties}>
            {Array.from({length:19},(_,i)=><i key={i} style={{
              height:(7+Math.abs(Math.sin(i*.57))*18)+'px',
              transform:'scaleY(var(--phone-mic, .12))',
            }}/>)}
          </div>
          <div className="qul-vintage-call-buttons">
            <button type="button" onClick={onToggleMic} disabled={!active}>
              {micMuted?<MicOff size={17}/>:<Mic size={17}/>}
              <span>{micMuted?(ar?'تشغيل':'Unmute'):(ar?'كتم':'Mute')}</span>
            </button>
            <button type="button" onClick={onEnd} className="qul-vintage-call-hangup">
              <PhoneOff size={18}/><span>{ar?'إنهاء':'End'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
