/**
 * Offline, mechanically modelled QUL rotary return sound.
 * All ten audio buffers are precomputed when the learner lifts the receiver.
 * A digit press then starts ONE buffer source, avoiding the dozens of audio
 * nodes previously scheduled on every iPhone tap.
 */
export type RotarySoundPlayer = {
  prepare(): void;
  play(digit: string): void;
  close(): void;
};

export const rotaryPulseCount = (digit: string): number =>
  digit === '0' ? 10 : Math.max(1, Math.min(9, Number(digit) || 1));

export const rotaryDurationMs = (digit: string): number =>
  270 + rotaryPulseCount(digit) * 58;

export function createRotarySoundPlayer():RotarySoundPlayer {
  let context:AudioContext|null=null;
  let currentSource:AudioBufferSourceNode|null=null;
  const samples=new Map<string,AudioBuffer>();

  const makeSound=(ctx:AudioContext,digit:string):AudioBuffer=>{
    const pulses=rotaryPulseCount(digit);
    const rate=ctx.sampleRate;
    const duration=rotaryDurationMs(digit)/1000;
    const buffer=ctx.createBuffer(1,Math.ceil(rate*duration),rate);
    const out=buffer.getChannelData(0);

    // A short spring wind, fading as the wheel reaches the finger stop.
    for(let i=0;i<Math.min(out.length,Math.round(rate*.17));i++){
      const t=i/rate;
      const taper=Math.sin(Math.PI*Math.min(1,t/.17))**1.3;
      out[i]=Math.sin(2*Math.PI*(157*t-105*t*t))*.024*taper;
    }
    // Dry metal contacts pulse during the return stroke, matching 1..10 pulses.
    let seed=1125+pulses*7243;
    for(let p=0;p<pulses;p++){
      const offset=Math.floor((.18+p*.057)*rate);
      const count=Math.floor(.023*rate);
      for(let k=0;k<count&&offset+k<out.length;k++){
        seed=(Math.imul(seed,1664525)+1013904223)|0;
        const noise=((seed>>>0)/4294967295)*2-1;
        const t=k/rate;
        const envelope=Math.exp(-t/.004);
        out[offset+k]+=noise*.17*envelope+
          Math.sin(2*Math.PI*620*t)*.055*envelope;
      }
    }
    return buffer;
  };

  const ensure=():AudioContext|null=>{
    if(typeof window==='undefined')return null;
    const Constructor=window.AudioContext||(window as typeof window&{
      webkitAudioContext?:typeof AudioContext;
    }).webkitAudioContext;
    if(!Constructor)return null;
    if(!context||context.state==='closed'){
      context=new Constructor();
      samples.clear();
      for(const digit of '1234567890') samples.set(digit,makeSound(context,digit));
    }
    if(context.state==='suspended')void context.resume().catch(()=>undefined);
    return context;
  };
  return {
    prepare(){try{ensure();}catch{/* Sound is optional, never block speaking. */}},
    play(digit){
      try{
        const ctx=ensure();
        if(!ctx)return;
        const buffer=samples.get(digit);
        if(!buffer)return;
        if(currentSource){try{currentSource.stop();}catch{/* already finished */}}
        const src=ctx.createBufferSource();
        src.buffer=buffer;
        src.connect(ctx.destination);
        src.onended=()=>{if(currentSource===src)currentSource=null;src.disconnect();};
        src.start();
        currentSource=src;
      }catch{/* Fail silently if iOS audio output is unavailable. */}
    },
    close(){
      if(currentSource){try{currentSource.stop();}catch{}currentSource=null;}
      const old=context;context=null;samples.clear();
      if(old&&old.state!=='closed')void old.close().catch(()=>undefined);
    },
  };
}
