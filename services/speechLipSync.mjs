/**
 * Audio-clock lip sync. No text-duration guesses, microphone input or mouth loops.
 * Timing follows scheduled output PCM. Vowel shapes are acoustic estimates, not
 * provider phoneme alignment. 10 ms cues, sampled on the audible output clock.
 */
export const LIP_HOP_SECONDS = .01;
export const REST_LIPS = Object.freeze({
  active: false, energy: 0, openness: 0,
  weights: Object.freeze({ Closed: 1, A: 0, E: 0, O: 0, Open: 0, FV: 0 })
});
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const N = 512, RATE = 12000, WINDOW = 384;
const hann = Float64Array.from({ length: WINDOW }, (_, i) => .5 - .5 * Math.cos(2 * Math.PI * i / (WINDOW - 1)));
const twiddleR = Float64Array.from({ length: N / 2 }, (_, i) => Math.cos(-2 * Math.PI * i / N));
const twiddleI = Float64Array.from({ length: N / 2 }, (_, i) => Math.sin(-2 * Math.PI * i / N));
function spectrum(samples, start, real, imag, power) {
  real.fill(0); imag.fill(0);
  for (let i = 0; i < WINDOW; i++) {
    const p = start + i;
    // Pre-emphasis exposes vowel resonances rather than just the pitch peak.
    const value = p >= 0 && p < samples.length ? samples[p] : 0;
    const before = p > 0 && p - 1 < samples.length ? samples[p - 1] : 0;
    real[i] = (value - .95 * before) * hann[i];
  }
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) [real[i], real[j]] = [real[j], real[i]];
  }
  for (let size = 2; size <= N; size <<= 1) {
    const half = size >> 1, stride = N / size;
    for (let base = 0; base < N; base += size) for (let j = 0; j < half; j++) {
      const k = j * stride, even = base + j, odd = even + half;
      const r = twiddleR[k] * real[odd] - twiddleI[k] * imag[odd];
      const im = twiddleR[k] * imag[odd] + twiddleI[k] * real[odd];
      real[odd] = real[even] - r; imag[odd] = imag[even] - im;
      real[even] += r; imag[even] += im;
    }
  }
  for (let i = 0; i < power.length; i++) power[i] = real[i] ** 2 + imag[i] ** 2;
}
function band(power, lo, hi) {
  let value = 0;
  for (let k = Math.ceil(lo * N / RATE); k <= Math.floor(hi * N / RATE); k++) value += power[k] || 0;
  return value;
}
function resonance(power, lo, hi) {
  let best = -1, frequency = (lo + hi) / 2;
  for (let hz = lo; hz <= hi; hz += 40) {
    const score = band(power, hz - 100, hz + 100);
    if (score > best) { best = score; frequency = hz; }
  }
  return frequency;
}
/** PCM is downsampled for analysis only; playback retains its original samples. */
export function analyzeSpeechBuffer(buffer) {
  if (!buffer || !Number.isFinite(buffer.sampleRate) || buffer.sampleRate < 8000 ||
      !Number.isInteger(buffer.length) || buffer.length <= 0 || !buffer.numberOfChannels) {
    throw new TypeError('Lip sync needs a decoded nonempty AudioBuffer');
  }
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
  const duration = buffer.length / buffer.sampleRate;
  const samples = new Float32Array(Math.ceil(duration * RATE));
  const step = buffer.sampleRate / RATE;
  for (let i = 0; i < samples.length; i++) {
    const position = i * step, a = Math.floor(position), f = position - a;
    let value = 0;
    for (const channel of channels) value += (channel[a] || 0) * (1 - f) + (channel[Math.min(a + 1, channel.length - 1)] || 0) * f;
    samples[i] = value / channels.length;
  }
  const count = Math.ceil(duration / LIP_HOP_SECONDS);
  const rms = new Float32Array(count);
  let peak = 0;
  // Non-overlapping amplitude gates preserve real silence and chunk boundaries.
  for (let i = 0; i < count; i++) {
    const from = Math.round(i * LIP_HOP_SECONDS * RATE);
    const to = Math.min(samples.length, Math.round((i + 1) * LIP_HOP_SECONDS * RATE));
    let sum = 0;
    for (let j = from; j < to; j++) sum += samples[j] ** 2;
    rms[i] = Math.sqrt(sum / Math.max(1, to - from)); peak = Math.max(peak, rms[i]);
  }
  // A fixed floor prevents quiet/noise-only chunks from becoming wide-open mouths.
  const gate = Math.max(.0025, peak * .035);
  const real = new Float64Array(N), imag = new Float64Array(N), power = new Float64Array(N / 2);
  const frames = [];
  for (let i = 0; i < count; i++) {
    if (rms[i] <= gate) { frames.push(REST_LIPS); continue; }
    const energy = clamp((20 * Math.log10(Math.max(rms[i], 1e-8)) + 48) / 31);
    spectrum(samples, Math.round((i + .5) * LIP_HOP_SECONDS * RATE) - WINDOW / 2, real, imag, power);
    const f1 = resonance(power, 250, 1050), f2 = resonance(power, 1000, 3000);
    const total = band(power, 200, 5500) + 1e-12;
    const fricative = clamp((band(power, 3000, 5500) / total - .25) / .45);
    const candidates = [
      ['A', 750, 1200], ['E', 400, 2200], ['O', 400, 1050], ['Open', 650, 1800]
    ];
    const weights = { Closed: 0, A: 0, E: 0, O: 0, Open: 0, FV: fricative * .7 };
    let sum = 0;
    for (const [shape, a, b] of candidates) {
      const score = Math.exp(-(((f1 - a) / 280) ** 2 + ((f2 - b) / 650) ** 2));
      weights[shape] = score; sum += score;
    }
    // Soft coarticulation; intensity controls jaw opening independently of shape.
    const opening = clamp(.2 + energy * .8);
    const available = opening * (1 - weights.FV);
    for (const [shape] of candidates) weights[shape] = available * weights[shape] / Math.max(sum, 1e-12);
    weights.FV *= opening;
    weights.Closed = 1 - opening;
    frames.push({ active: true, energy, openness: opening, weights });
  }
  return { duration, hop: LIP_HOP_SECONDS, frames };
}
export function sampleLipTrack(track, seconds) {
  if (!track || seconds < 0 || seconds >= track.duration) return REST_LIPS;
  const position = seconds / track.hop, index = Math.floor(position);
  const a = track.frames[index] || REST_LIPS, b = track.frames[index + 1] || a;
  // Never smear an open mouth across a silent 10 ms interval.
  if (!a.active) return REST_LIPS;
  const mix = position - index, weights = {};
  for (const shape of Object.keys(REST_LIPS.weights)) weights[shape] = a.weights[shape] * (1 - mix) + b.weights[shape] * mix;
  return { active: true, energy: a.energy * (1 - mix) + b.energy * mix,
    openness: a.openness * (1 - mix) + b.openness * mix, weights };
}
/** The speaker clock, rather than when a packet arrives or a source is enqueued. */
export function audibleContextTime(context, nowMs) {
  if (!context || context.state !== 'running') return null;
  if (typeof context.getOutputTimestamp === 'function') {
    const stamp = context.getOutputTimestamp();
    if (stamp && Number.isFinite(stamp.contextTime) && Number.isFinite(stamp.performanceTime) &&
        stamp.performanceTime > 0 && nowMs >= stamp.performanceTime && nowMs - stamp.performanceTime < 1000) {
      return clamp(stamp.contextTime + (nowMs - stamp.performanceTime) / 1000, 0, context.currentTime);
    }
  }
  const delay = Number.isFinite(context.outputLatency) ? context.outputLatency
    : Number.isFinite(context.baseLatency) ? context.baseLatency : 0;
  return Math.max(0, context.currentTime - delay);
}
export class SpeechLipSync {
  constructor(now = () => performance.now()) { this.now = now; this.segments = []; this.nextId = 0; }
  schedule(context, track, startAt, lane = 'speech') {
    if (!Number.isFinite(startAt) || startAt < 0 || !track?.frames || !Number.isFinite(track.duration)) throw new TypeError('Invalid lip playback cue');
    const id = ++this.nextId;
    this.segments.push({ id, context, track, startAt, endAt: startAt + track.duration, lane });
    return id;
  }
  clear(lane) { this.segments = lane === undefined ? [] : this.segments.filter(segment => segment.lane !== lane); }
  cancel(id) { this.segments = this.segments.filter(segment => segment.id !== id); }
  read() {
    const now = this.now(); let frame = REST_LIPS;
    this.segments = this.segments.filter(segment => {
      if (segment.context.state === 'closed') return false;
      const clock = audibleContextTime(segment.context, now);
      if (clock === null) return true;
      if (clock >= segment.startAt && clock < segment.endAt) frame = sampleLipTrack(segment.track, clock - segment.startAt);
      // Keep cues through onended: hardware can still be playing buffered output.
      return clock <= segment.endAt + .05;
    });
    return frame;
  }
}

/** Atomic scheduling: a rejected audio start must not leave a silent talking face. */
export function startLipSyncedSource(context, source, track, startAt, sync, lane) {
  const id = sync.schedule(context, track, startAt, lane);
  try { source.start(startAt); } catch (error) { sync.cancel(id); throw error; }
  return id;
}
