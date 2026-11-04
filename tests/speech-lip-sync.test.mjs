import test from 'node:test';
import assert from 'node:assert/strict';
import { REST_LIPS, analyzeSpeechBuffer, sampleLipTrack, SpeechLipSync, audibleContextTime, startLipSyncedSource } from '../services/speechLipSync.mjs';

function pcm(duration = .6, rate = 24000, frequency = 700, amplitude = .15) {
  const data = Float32Array.from({ length: Math.round(duration * rate) }, (_, i) => {
    const t = i / rate;
    return (t >= .1 && t < .25) || (t >= .4 && t < .5) ? amplitude * Math.sin(2 * Math.PI * frequency * t) : 0;
  });
  return { length: data.length, numberOfChannels: 1, sampleRate: rate, getChannelData: () => data };
}
const vowel = name => ({ active: true, energy: .8, openness: .9,
  weights: Object.fromEntries(Object.keys(REST_LIPS.weights).map(n => [n, n === name ? 1 : 0])) });
const cue = (name = 'A', duration = .2) => ({ duration, hop: .01, frames: Array(Math.ceil(duration / .01)).fill(vowel(name)) });

test('PCM silence closes lips within a single 10 ms cue, before and between words', () => {
  const track = analyzeSpeechBuffer(pcm());
  for (const t of [0, .05, .09, .26, .3, .39, .51, .59, .6]) assert.equal(sampleLipTrack(track, t).active, false, 'silence at ' + t);
  for (const t of [.11, .18, .24, .41, .46, .49]) assert.equal(sampleLipTrack(track, t).active, true, 'voice at ' + t);
  assert.equal(track.hop, .01);
});

test('quiet/noise-only PCM cannot normalize itself into a speaking mouth', () => {
  const track = analyzeSpeechBuffer(pcm(.6, 24000, 700, .0002));
  assert.ok(track.frames.every(frame => !frame.active && frame.openness === 0));
});

test('acoustic weights are normalized; vowel colors come from audio rather than a timer', () => {
  const low = sampleLipTrack(analyzeSpeechBuffer(pcm(.6, 24000, 450)), .15);
  const high = sampleLipTrack(analyzeSpeechBuffer(pcm(.6, 24000, 2300)), .15);
  assert.notDeepEqual(low.weights, high.weights);
  for (const frame of [low, high]) {
    assert.ok(Math.abs(Object.values(frame.weights).reduce((a, b) => a + b, 0) - 1) < 1e-6);
    assert.ok(Object.values(frame.weights).every(value => value >= 0 && value <= 1));
  }
});

test('a resampled input keeps its exact playback duration and silence boundaries', () => {
  for (const rate of [16000, 24000, 44100, 48000]) {
    const track = analyzeSpeechBuffer(pcm(.6, rate));
    assert.equal(track.duration, .6);
    assert.equal(sampleLipTrack(track, .05).active, false);
    assert.equal(sampleLipTrack(track, .15).active, true);
    assert.equal(sampleLipTrack(track, .6).active, false);
  }
});

test('future queued packets do not open the mouth until they reach the speaker clock', () => {
  const context = { state: 'running', currentTime: 1, outputLatency: .08 };
  const sync = new SpeechLipSync(() => 1000);
  sync.schedule(context, cue(), 1.1, 'live');
  context.currentTime = 1.15; assert.equal(sync.read().active, false);
  context.currentTime = 1.19; assert.equal(sync.read().active, true);
  context.currentTime = 1.39; assert.equal(sync.read().active, false);
});

test('hardware timestamp is used once, without subtracting output latency a second time', () => {
  const context = { state: 'running', currentTime: 3, outputLatency: .2,
    getOutputTimestamp: () => ({ contextTime: 2.7, performanceTime: 1000 }) };
  assert.ok(Math.abs(audibleContextTime(context, 1050) - 2.75) < 1e-9);
  const sync = new SpeechLipSync(() => 1050);
  sync.schedule(context, cue(), 2.72);
  assert.equal(sync.read().active, true);
});

test('adjacent chunks use their own cues; gaps and hardware-buffered tails are preserved', () => {
  const context = { state: 'running', currentTime: 0, outputLatency: .05 };
  const sync = new SpeechLipSync(() => 1000);
  sync.schedule(context, cue('A'), 1, 'live');
  sync.schedule(context, cue('O'), 1.2, 'live');
  sync.schedule(context, cue('E'), 1.6, 'live');
  context.currentTime = 1.24; assert.equal(sync.read().weights.A, 1); // source A has ended in render time, still audible
  context.currentTime = 1.26; assert.equal(sync.read().weights.O, 1);
  context.currentTime = 1.55; assert.equal(sync.read().active, false);
  context.currentTime = 1.66; assert.equal(sync.read().weights.E, 1);
});

test('interruption/persona change clears queued and playing cues immediately', () => {
  const context = { state: 'running', currentTime: 1.1, outputLatency: 0 };
  const sync = new SpeechLipSync(() => 1000);
  sync.schedule(context, cue(), 1, 'live'); sync.schedule(context, cue('O'), 1.2, 'live');
  assert.equal(sync.read().active, true); sync.clear('live');
  assert.equal(sync.read().active, false);
  context.currentTime = 1.3; assert.equal(sync.read().active, false);
});

test('suspended contexts close lips; resuming follows frozen audio time, not wall time', () => {
  const context = { state: 'running', currentTime: 1.1, outputLatency: 0 };
  const sync = new SpeechLipSync(() => 5000); sync.schedule(context, cue(), 1);
  assert.equal(sync.read().active, true); context.state = 'suspended';
  assert.equal(sync.read().active, false); context.state = 'running';
  assert.equal(sync.read().active, true); context.state = 'closed';
  assert.equal(sync.read().active, false); assert.equal(sync.segments.length, 0);
});

test('failed source start cancels only its matching cue and rejects invalid buffers', () => {
  const context = { state: 'running', currentTime: 1.1, outputLatency: 0 };
  const sync = new SpeechLipSync(() => 1000); const id = sync.schedule(context, cue(), 1);
  sync.cancel(id); assert.equal(sync.read().active, false);
  assert.throws(() => analyzeSpeechBuffer({ length: 0, sampleRate: 24000 }));
  assert.throws(() => sync.schedule(context, cue(), NaN));
});

test('audio and mouth share the exact scheduled start and a failed start rolls back the mouth', () => {
  const context = { state: 'running', currentTime: 1, outputLatency: 0 };
  const sync = new SpeechLipSync(() => 1000); let startedAt;
  startLipSyncedSource(context, { start: when => { startedAt = when; } }, cue(), 1.125, sync, 'live');
  assert.equal(startedAt, sync.segments[0].startAt);
  assert.equal(sync.read().active, false);
  assert.throws(() => startLipSyncedSource(context, { start: () => { throw new Error('Audio device closed'); } }, cue('O'), 2, sync, 'live'));
  assert.equal(sync.segments.length, 1);
  context.currentTime = 2.05; assert.equal(sync.read().active, false);
});
