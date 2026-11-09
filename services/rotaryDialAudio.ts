/**
 * Local mechanical sound for QUL's simulated rotary phone.
 * Offline Web Audio clicks, no network fetch or delayed media decoding.
 * Each pulse corresponds to a rotary contact closing; zero has ten pulses.
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

export function createRotarySoundPlayer(): RotarySoundPlayer {
  let context: AudioContext | null = null;
  let transient: AudioBuffer | null = null;
  let lastNodes: AudioScheduledSourceNode[] = [];
  const stopPending = () => {
    for (const node of lastNodes) {
      try { node.stop(); } catch { /* already finished */ }
    }
    lastNodes = [];
  };
  const ensure = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    const Constructor = window.AudioContext || (window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;
    if (!Constructor) return null;
    if (!context || context.state === 'closed') {
      context = new Constructor();
      transient = context.createBuffer(1, Math.ceil(context.sampleRate * .022), context.sampleRate);
      const samples = transient.getChannelData(0);
      // Fast crackle taper sounds like a telephone contact, not a keypad DTMF tone.
      for (let i = 0; i < samples.length; i++) {
        const envelope = Math.exp(-i / (context.sampleRate * .0042));
        samples[i] = (Math.random() * 2 - 1) * envelope;
      }
    }
    if (context.state === 'suspended') void context.resume().catch(() => undefined);
    return context;
  };
  return {
    // Initialise in the receiver-lift gesture so the first digit never waits for
    // AudioContext creation or iOS audio-session activation.
    prepare() {
      try { ensure(); } catch { /* audio remains optional */ }
    },
    play(digit) {
      try {
        const ctx = ensure();
        if (!ctx || !transient) return;
        stopPending();
        const pulses = rotaryPulseCount(digit);
        const start = ctx.currentTime + .018;
        // Brief mechanical winding whisper before the dry return clicks.
        const spring = ctx.createOscillator();
        spring.type = 'triangle';
        spring.frequency.setValueAtTime(155, start);
        spring.frequency.exponentialRampToValueAtTime(74, start + .16);
        const springGain = ctx.createGain();
        springGain.gain.setValueAtTime(.0001, start);
        springGain.gain.exponentialRampToValueAtTime(.012, start + .028);
        springGain.gain.exponentialRampToValueAtTime(.0001, start + .175);
        spring.connect(springGain).connect(ctx.destination);
        spring.start(start);
        spring.stop(start + .18);
        lastNodes.push(spring);

        for (let i = 0; i < pulses; i++) {
          const when = start + .18 + i * .057;
          const click = ctx.createBufferSource();
          click.buffer = transient;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(.0001, when);
          gain.gain.linearRampToValueAtTime(.09, when + .002);
          gain.gain.exponentialRampToValueAtTime(.0001, when + .021);
          click.connect(gain).connect(ctx.destination);
          click.start(when);
          click.stop(when + .022);
          lastNodes.push(click);
        }
      } catch {
        // Audio is optional: inaccessible or suspended hardware must never block dialing.
      }
    },
    close() {
      stopPending();
      const old = context;
      context = null;
      transient = null;
      if (old && old.state !== 'closed') void old.close().catch(() => undefined);
    }
  };
}
