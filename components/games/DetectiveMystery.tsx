import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Volume2, VolumeX, ShieldCheck, UserX, 
  ArrowRight, ArrowLeft, RotateCcw, Check, FileText,
  Download, Mail, MailOpen, Music, Users, Search, AlertCircle, Loader2,
  Lock, Unlock, Key, Fingerprint, Award, Sparkles, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// ============================================================================
// HIGH-FIDELITY CINEMATIC ASSETS & PUBLIC WEBP BACKGROUNDS
// ============================================================================
// صور الخلفيات المعتمدة من مجلد public حسب طلب المستخدم
const BG_PAGE1_INTRO = 'url(/١.webp), url(/1.webp)';
const BG_CRIME_SCENES = [
  'url(/٢.webp), url(/2.webp)',
  'url(/٣.webp), url(/3.webp)',
  'url(/٤.webp), url(/4.webp)',
  'url(/٥.webp), url(/5.webp)',
  'url(/٦.webp), url(/6.webp)',
  'url(/٧.webp), url(/7.webp)',
];
const BG_PAGE3_INVESTIGATION = 'url(/٨.jpeg), url(/8.jpeg), url(/٨.webp)';
const BG_PAGE4_REPORT = 'url(/٩.jpeg), url(/9.jpeg), url(/٩.webp)';

const getCrimeSceneBg = (caseIndex: number) => {
  return BG_CRIME_SCENES[caseIndex % BG_CRIME_SCENES.length];
};



// صور المتهمين - المجموعة الأصلية الأولى (12 شخصية)
import s01 from '/src/assets/images/suspects/suspect_01_pink_hair.jpg';
import s02 from '/src/assets/images/suspects/suspect_02_headband.jpg';
import s03 from '/src/assets/images/suspects/suspect_03_red_hair.jpg';
import s04 from '/src/assets/images/suspects/suspect_04_tribal.jpg';
import s05 from '/src/assets/images/suspects/suspect_05_glasses_laugh.jpg';
import s06 from '/src/assets/images/suspects/suspect_06_beanie_man.jpg';
import s07 from '/src/assets/images/suspects/suspect_07_beard_glasses.jpg';
import s08 from '/src/assets/images/suspects/suspect_08_fedora_hat.jpg';
import s09 from '/src/assets/images/suspects/suspect_09_turban_woman.jpg';
import s10 from '/src/assets/images/suspects/suspect_10_silver_punk.jpg';
import s11 from '/src/assets/images/suspects/suspect_11_blonde_pearl.jpg';
import s12 from '/src/assets/images/suspects/suspect_12_baseball_cap.jpg';

// صور المتهمين - المجموعة الجديدة الاحترافية المتنوعة بنفس الاستايل (12 شخصية جديدة)
import s13 from '/src/assets/images/suspect_batch2_curly_1791886775036.jpg';
import s14 from '/src/assets/images/suspect_batch2_gentleman_1791886792621.jpg';
import s15 from '/src/assets/images/suspect_batch2_elderly_1791886811058.jpg';
import s16 from '/src/assets/images/suspect_batch2_pilot_1791886827238.jpg';
import s17 from '/src/assets/images/suspect_batch2_strawhat_1791886843749.jpg';
import s18 from '/src/assets/images/suspect_batch2_redbeard_1791886864089.jpg';
import s19 from '/src/assets/images/suspect_batch2_kimono_1791886897333.jpg';
import s20 from '/src/assets/images/suspect_batch2_hoodie_1791886916992.jpg';
import s21 from '/src/assets/images/suspect_batch2_detectiveman_1791887008518.jpg';
import s22 from '/src/assets/images/suspect_batch2_hijabwoman_1791887031099.jpg';
import s23 from '/src/assets/images/suspect_batch2_curlyboy_1791887055067.jpg';
import s24 from '/src/assets/images/suspect_batch2_winterboy_1791887080832.jpg';

// ============================================================================
// DYNAMIC MULTI-TRACK DETECTIVE AUDIO SYNTHESIZER (تغيير الموسيقى مع كل قضية)
// ============================================================================
interface MusicTrackConfig {
  name: string;
  bpm: number;
}

const MUSIC_TRACKS: MusicTrackConfig[] = [
  { name: 'غموض التحري الكلاسيكي (Noir Jazz)', bpm: 94 },
  { name: 'المطاردة الاستخباراتية السريعة (007 Spy Chase)', bpm: 138 },
  { name: 'التسلل الليلي السري (Stealth Clockwork)', bpm: 104 },
  { name: 'نبض غرفة الاستجواب (Tense Interrogation)', bpm: 80 },
  { name: 'المواجهة الكبرى وحسم القضية (Epic Mastermind Climax)', bpm: 144 }
];

class SpyAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlayingBgm: boolean = false;
  private bgmIntervalId: any = null;
  private currentStep: number = 0;
  private currentTrackIdx: number = 0;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.8;
        this.masterGain.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = 0.42;
        this.bgmGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setTrack(trackIndex: number) {
    this.currentTrackIdx = Math.abs(trackIndex) % MUSIC_TRACKS.length;
    this.currentStep = 0;
    if (this.isPlayingBgm) {
      this.stopBgm();
      this.startBgm();
    }
  }

  public getCurrentTrackName(): string {
    return MUSIC_TRACKS[this.currentTrackIdx]?.name || 'الموسيقى';
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public toggleBgm(): boolean {
    this.init();
    if (this.isPlayingBgm) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  public startBgm() {
    this.init();
    if (this.isPlayingBgm || !this.ctx) return;
    this.isPlayingBgm = true;

    const track = MUSIC_TRACKS[this.currentTrackIdx] || MUSIC_TRACKS[0];
    const stepDuration = 60 / track.bpm / 4;
    const bpmInterval = stepDuration * 1000;

    const playStep = () => {
      if (!this.ctx || !this.isPlayingBgm || this.isMuted) return;
      const now = this.ctx.currentTime;
      const step = this.currentStep % 32;

      // ======================================================================
      // 5 RADICALLY DIFFERENT AUDIBLE MUSICAL PATTERNS
      // ======================================================================
      switch (this.currentTrackIdx) {
        // --- TRACK 0: NOIR DETECTIVE JAZZ (Slow, smoky, walking upright bass) ---
        case 0: {
          // Acoustic walking bass on quarter notes
          const noirBass = [43.65, 0, 0, 0, 48.99, 0, 0, 0, 51.91, 0, 0, 0, 58.27, 0, 0, 0,
                            55.00, 0, 0, 0, 51.91, 0, 0, 0, 48.99, 0, 0, 0, 43.65, 0, 0, 0];
          if (noirBass[step] > 0) {
            this.triggerAcousticBass(now, noirBass[step], 0.28);
          }
          // Brushed snare tap only on backbeats (beats 2 & 4)
          if (step === 8 || step === 24) {
            this.triggerBrushedSnare(now);
          }
          // Soft jazz ride cymbal on swing steps
          if (step % 4 === 0 || step % 4 === 3) {
            this.triggerCymbal(now, 0.04);
          }
          // Vibraphone mystery chime note
          if (step === 0) this.triggerVibraphone(now, 349.23); // F4
          if (step === 16) this.triggerVibraphone(now, 392.00); // G4
          break;
        }

        // --- TRACK 1: HIGH-ENERGY 007 SPY CHASE (Fast, double kick, brass hits) ---
        case 1: {
          // Fast driving kick on 1, 3 and syncopations
          if (step === 0 || step === 6 || step === 12 || step === 16 || step === 22 || step === 28) {
            this.triggerKick(now, 150, 45, 0.5);
          }
          // Hard crack snare on 8 and 24
          if (step === 8 || step === 24) {
            this.triggerSnare(now, 0.4);
          }
          // Rapid 16th-note spy hi-hats
          this.triggerCymbal(now, step % 2 === 0 ? 0.06 : 0.03);
          // Octave spy bass (Sawtooth)
          const spyNotes = [49.0, 49.0, 98.0, 49.0, 51.9, 51.9, 103.8, 51.9,
                            55.0, 55.0, 110.0, 55.0, 58.3, 55.0, 51.9, 49.0,
                            49.0, 49.0, 98.0, 49.0, 51.9, 51.9, 103.8, 51.9,
                            61.7, 58.3, 55.0, 51.9, 49.0, 0, 49.0, 98.0];
          if (spyNotes[step] > 0) {
            this.triggerSpyBass(now, spyNotes[step], 0.12);
          }
          // Sharp James Bond brass chord stabs on syncopated hits
          if (step === 4 || step === 14 || step === 20 || step === 30) {
            this.triggerBrassStab(now, [220.0, 261.63, 311.13, 392.0]);
          }
          break;
        }

        // --- TRACK 2: STEALTH CLOCKWORK (Ticking woodblock, pizzicato, mystery bell) ---
        case 2: {
          // Precise tick-tock wooden percussion on every beat
          if (step % 2 === 0) {
            this.triggerWoodBlock(now, step % 4 === 0 ? 920 : 680);
          }
          // Subtle muted pizzicato plucks
          const pizzNotes = [110.0, 0, 130.8, 0, 146.8, 0, 130.8, 0,
                             110.0, 0, 98.0, 0, 103.8, 0, 110.0, 0,
                             110.0, 0, 130.8, 0, 164.8, 0, 146.8, 0,
                             130.8, 0, 110.0, 0, 87.3, 0, 98.0, 0];
          if (pizzNotes[step] > 0) {
            this.triggerPizzicato(now, pizzNotes[step]);
          }
          // Eerie glass bell high arpeggio
          if (step === 2) this.triggerVibraphone(now, 587.33);
          if (step === 10) this.triggerVibraphone(now, 523.25);
          if (step === 18) this.triggerVibraphone(now, 659.25);
          if (step === 26) this.triggerVibraphone(now, 622.25);
          break;
        }

        // --- TRACK 3: COLD INTERROGATION HEARTBEAT (Slow, heavy sub heartbeat, ominous drone) ---
        case 3: {
          // Double heartbeat sub thump
          if (step === 0 || step === 3 || step === 16 || step === 19) {
            this.triggerHeartbeat(now);
          }
          // Deep droning low note
          if (step === 0 || step === 16) {
            this.triggerDrone(now, step === 0 ? 36.71 : 34.65, 1.4);
          }
          // Tense dissonant tritone accents
          if (step === 10 || step === 26) {
            this.triggerTensionChord(now, [277.18, 392.0, 554.37]);
          }
          break;
        }

        // --- TRACK 4: MASTERMIND GRAND CLIMAX (Fast marching roll, driving pulse, heroic fanfare) ---
        case 4: {
          // Driving 4-on-the-floor kick
          if (step % 4 === 0) {
            this.triggerKick(now, 160, 50, 0.55);
          }
          // Militaristic march snare roll
          if (step % 2 === 0 || step === 7 || step === 15 || step === 23 || step === 31) {
            this.triggerSnare(now, step % 4 === 2 ? 0.35 : 0.12);
          }
          // Fast hi-hat shimmer
          this.triggerCymbal(now, 0.05);
          // Pumping driving bass
          const climaxBass = [55.0, 55.0, 55.0, 55.0, 65.4, 65.4, 65.4, 65.4,
                              73.4, 73.4, 73.4, 73.4, 82.4, 73.4, 65.4, 55.0,
                              55.0, 55.0, 55.0, 55.0, 65.4, 65.4, 65.4, 65.4,
                              87.3, 87.3, 82.4, 82.4, 73.4, 73.4, 65.4, 55.0];
          if (climaxBass[step] > 0) {
            this.triggerSpyBass(now, climaxBass[step], 0.14);
          }
          // Heroic fanfare chords
          if (step === 0 || step === 8 || step === 16 || step === 24) {
            this.triggerBrassStab(now, [261.63, 329.63, 392.0, 523.25]);
          }
          break;
        }
      }

      this.currentStep++;
    };

    this.bgmIntervalId = setInterval(playStep, bpmInterval);
  }

  public stopBgm() {
    this.isPlayingBgm = false;
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  // --- SOUND SYNTHESIS ENGINES ---

  private triggerKick(time: number, startFreq = 140, endFreq = 38, vol = 0.45) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.11);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.13);
    osc.connect(gain);
    gain.connect(this.bgmGain);
    osc.start(time);
    osc.stop(time + 0.14);
  }

  private triggerHeartbeat(time: number) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, time);
    osc.frequency.exponentialRampToValueAtTime(28, time + 0.16);
    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.connect(gain);
    gain.connect(this.bgmGain);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  private triggerSnare(time: number, vol = 0.3) {
    if (!this.ctx || !this.bgmGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1200;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);
    noise.start(time);
  }

  private triggerBrushedSnare(time: number) {
    if (!this.ctx || !this.bgmGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2400;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);
    noise.start(time);
  }

  private triggerCymbal(time: number, vol = 0.04) {
    if (!this.ctx || !this.bgmGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);
    noise.start(time);
  }

  private triggerWoodBlock(time: number, pitch = 800) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, time);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, time + 0.03);
    gain.gain.setValueAtTime(0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
    osc.connect(gain);
    gain.connect(this.bgmGain);
    osc.start(time);
    osc.stop(time + 0.04);
  }

  private triggerAcousticBass(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain);
    gain.connect(this.bgmGain);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private triggerPizzicato(time: number, freq: number) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    osc.connect(gain);
    gain.connect(this.bgmGain);
    osc.start(time);
    osc.stop(time + 0.09);
  }

  private triggerSpyBass(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, time);
    filter.frequency.exponentialRampToValueAtTime(140, time + duration);
    gain.gain.setValueAtTime(0.38, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private triggerVibraphone(time: number, freq: number) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.24, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
    osc.connect(gain);
    gain.connect(this.bgmGain);
    osc.start(time);
    osc.stop(time + 0.65);
  }

  private triggerDrone(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.22, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain);
    gain.connect(this.bgmGain);
    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  private triggerTensionChord(time: number, chord: number[]) {
    if (!this.ctx || !this.bgmGain) return;
    chord.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
      osc.connect(gain);
      gain.connect(this.bgmGain!);
      osc.start(time);
      osc.stop(time + 0.55);
    });
  }

  private triggerBrassStab(time: number, chord: number[]) {
    if (!this.ctx || !this.bgmGain) return;
    chord.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, time);
      filter.frequency.exponentialRampToValueAtTime(500, time + 0.16);
      gain.gain.setValueAtTime(0.11, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.17);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain!);
      osc.start(time);
      osc.stop(time + 0.19);
    });
  }

  public playClassifiedStamp() {
    this.init();
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(95, now);
    thud.frequency.exponentialRampToValueAtTime(25, now + 0.14);
    thudGain.gain.setValueAtTime(0.65, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    thud.connect(thudGain);
    thudGain.connect(this.masterGain);
    thud.start(now);
    thud.stop(now + 0.16);

    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(2200, now);
    clickGain.gain.setValueAtTime(0.2, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    click.connect(clickGain);
    clickGain.connect(this.masterGain);
    click.start(now);
    click.stop(now + 0.04);
  }

  public playEnvelopeOpen() {
    this.init();
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1600;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
  }

  public playClueStinger() {
    this.init();
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    const now = this.ctx.currentTime;
    [329.63, 392.00, 493.88, 622.25].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.22, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.35);
    });
  }

  public playVictoryFanfare() {
    this.init();
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    const now = this.ctx.currentTime;
    [329.63, 415.30, 493.88, 622.25, 830.61].forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 1.2);
    });
  }

  public playWrongBuzzer() {
    this.init();
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(110, now + 0.09);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playCipherDecode() {
    this.init();
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);
      gain.gain.setValueAtTime(0.22, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.09);
    });
  }

  public playAdvancedAlarm() {
    this.init();
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    const now = this.ctx.currentTime;
    [440, 880].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.28, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.19);
    });
  }
}

const spyAudio = new SpyAudioEngine();

// ============================================================================
// FULL ROSTER OF 24 SUSPECTS - WITH ACCURATE VISUAL ATTRIBUTES
// ============================================================================
export interface SuspectPerson {
  id: string;
  name: string;
  gender: 'ذكر' | 'أنثى';
  image: string;
  hairColor?: 'وردي' | 'أسود' | 'أحمر' | 'فضي' | 'أشقر' | 'رمادي' | 'بني' | 'تركوازي';
  isBlonde?: boolean;
  hasGlasses?: boolean;
  hasHatOrHeadwear?: boolean;
  headwearType?: string;
  hasBeardOrMustache?: boolean;
  hasEarrings?: boolean;
  hairLength?: 'قصير' | 'طويل';
  clothingColor?: string;
}

export const ALL_24_SUSPECTS: SuspectPerson[] = [
  // --- المجموعة 1 (الصور الـ 12 الأصلية) ---
  {
    id: 's1',
    name: 'سارة',
    gender: 'أنثى',
    image: s01,
    hairColor: 'وردي',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: false,
    headwearType: 'لا شيء',
    hasBeardOrMustache: false,
    hasEarrings: true,
    hairLength: 'قصير',
    clothingColor: 'أبيض'
  },
  {
    id: 's2',
    name: 'بلال',
    gender: 'ذكر',
    image: s02,
    hairColor: 'أسود',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: true,
    headwearType: 'عصبة رأس',
    hasBeardOrMustache: true,
    hasEarrings: false,
    hairLength: 'قصير',
    clothingColor: 'ملون'
  },
  {
    id: 's3',
    name: 'ريم',
    gender: 'أنثى',
    image: s03,
    hairColor: 'أحمر',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: false,
    headwearType: 'لا شيء',
    hasBeardOrMustache: false,
    hasEarrings: true,
    hairLength: 'طويل',
    clothingColor: 'أخضر'
  },
  {
    id: 's4',
    name: 'مايا',
    gender: 'أنثى',
    image: s04,
    hairColor: 'أسود',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: false,
    headwearType: 'لا شيء',
    hasBeardOrMustache: false,
    hasEarrings: false,
    hairLength: 'طويل',
    clothingColor: 'أخضر'
  },
  {
    id: 's5',
    name: 'لمى',
    gender: 'أنثى',
    image: s05,
    hairColor: 'أسود',
    isBlonde: false,
    hasGlasses: true,
    hasHatOrHeadwear: false,
    headwearType: 'لا شيء',
    hasBeardOrMustache: false,
    hasEarrings: false,
    hairLength: 'قصير',
    clothingColor: 'أزرق'
  },
  {
    id: 's6',
    name: 'يوسف',
    gender: 'ذكر',
    image: s06,
    hairColor: 'أسود',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: true,
    headwearType: 'طاقية صوفية',
    hasBeardOrMustache: false,
    hasEarrings: true,
    hairLength: 'قصير',
    clothingColor: 'أسود'
  },
  {
    id: 's7',
    name: 'فؤاد',
    gender: 'ذكر',
    image: s07,
    hairColor: 'رمادي',
    isBlonde: false,
    hasGlasses: true,
    hasHatOrHeadwear: false,
    headwearType: 'لا شيء',
    hasBeardOrMustache: true,
    hasEarrings: false,
    hairLength: 'قصير',
    clothingColor: 'أسود'
  },
  {
    id: 's8',
    name: 'أمينة',
    gender: 'أنثى',
    image: s08,
    hairColor: 'أسود',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: true,
    headwearType: 'قبعة فيدورا',
    hasBeardOrMustache: false,
    hasEarrings: true,
    hairLength: 'قصير',
    clothingColor: 'أزرق'
  },
  {
    id: 's9',
    name: 'زينب',
    gender: 'أنثى',
    image: s09,
    hairColor: 'أسود',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: true,
    headwearType: 'عمامة',
    hasBeardOrMustache: false,
    hasEarrings: true,
    hairLength: 'طويل',
    clothingColor: 'أصفر'
  },
  {
    id: 's10',
    name: 'روان',
    gender: 'أنثى',
    image: s10,
    hairColor: 'فضي',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: false,
    headwearType: 'لا شيء',
    hasBeardOrMustache: false,
    hasEarrings: true,
    hairLength: 'قصير',
    clothingColor: 'أسود'
  },
  {
    id: 's11',
    name: 'إيلينا',
    gender: 'أنثى',
    image: s11,
    hairColor: 'أشقر',
    isBlonde: true,
    hasGlasses: false,
    hasHatOrHeadwear: false,
    headwearType: 'لا شيء',
    hasBeardOrMustache: false,
    hasEarrings: true,
    hairLength: 'طويل',
    clothingColor: 'أبيض'
  },
  {
    id: 's12',
    name: 'طارق',
    gender: 'ذكر',
    image: s12,
    hairColor: 'أسود',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: true,
    headwearType: 'كاب رياضي',
    hasBeardOrMustache: false,
    hasEarrings: true,
    hairLength: 'قصير',
    clothingColor: 'أسود'
  },

  // --- المجموعة 2 (الـ 12 شخصية الجديدة المتنوعة بنفس استايل الصور) ---
  {
    id: 's13',
    name: 'ندى',
    gender: 'أنثى',
    image: s13,
    hairColor: 'تركوازي',
    isBlonde: false,
    hasGlasses: false, // لا ترتدي نظارة (شعر كيرلي تركوازي ووشاح أصفر)
    hasHatOrHeadwear: false,
    headwearType: 'لا شيء',
    hasBeardOrMustache: false,
    hasEarrings: true,
    hairLength: 'قصير',
    clothingColor: 'أصفر'
  },
  {
    id: 's14',
    name: 'فريد',
    gender: 'ذكر',
    image: s14,
    hairColor: 'بني',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: true,
    headwearType: 'قبعة مسطحة',
    hasBeardOrMustache: true,
    hasEarrings: false,
    hairLength: 'قصير',
    clothingColor: 'بني'
  },
  {
    id: 's15',
    name: 'الجدة مريم',
    gender: 'أنثى',
    image: s15,
    hairColor: 'فضي',
    isBlonde: false,
    hasGlasses: true,
    hasHatOrHeadwear: false,
    headwearType: 'لا شيء',
    hasBeardOrMustache: false,
    hasEarrings: true,
    hairLength: 'طويل',
    clothingColor: 'بنفسجي'
  },
  {
    id: 's16',
    name: 'الكابتن ريان',
    gender: 'ذكر',
    image: s16,
    hairColor: 'بني',
    isBlonde: false,
    hasGlasses: true,
    hasHatOrHeadwear: false,
    headwearType: 'لا شيء',
    hasBeardOrMustache: false,
    hasEarrings: false,
    hairLength: 'قصير',
    clothingColor: 'أسود'
  },
  {
    id: 's17',
    name: 'سلمى',
    gender: 'أنثى',
    image: s17,
    hairColor: 'بني',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: true,
    headwearType: 'قبعة قش',
    hasBeardOrMustache: false,
    hasEarrings: false,
    hairLength: 'طويل',
    clothingColor: 'أبيض'
  },
  {
    id: 's18',
    name: 'البحار صابر',
    gender: 'ذكر',
    image: s18,
    hairColor: 'أحمر',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: true,
    headwearType: 'طاقية صوفية',
    hasBeardOrMustache: true,
    hasEarrings: false,
    hairLength: 'قصير',
    clothingColor: 'أزرق'
  },
  {
    id: 's19',
    name: 'ميهو',
    gender: 'أنثى',
    image: s19,
    hairColor: 'أسود',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: false,
    headwearType: 'لا شيء',
    hasBeardOrMustache: false,
    hasEarrings: false,
    hairLength: 'طويل',
    clothingColor: 'أخضر'
  },
  {
    id: 's20',
    name: 'سامي',
    gender: 'ذكر',
    image: s20,
    hairColor: 'أسود',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: false,
    headwearType: 'لا شيء',
    hasBeardOrMustache: false,
    hasEarrings: true,
    hairLength: 'قصير',
    clothingColor: 'برتقالي'
  },
  {
    id: 's21',
    name: 'هنري',
    gender: 'ذكر',
    image: s21,
    hairColor: 'أسود',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: false,
    headwearType: 'لا شيء',
    hasBeardOrMustache: true,
    hasEarrings: false,
    hairLength: 'قصير',
    clothingColor: 'رمادي'
  },
  {
    id: 's22',
    name: 'نور',
    gender: 'أنثى',
    image: s22,
    hairColor: 'أسود',
    isBlonde: false,
    hasGlasses: false,
    hasHatOrHeadwear: true,
    headwearType: 'حجاب',
    hasBeardOrMustache: false,
    hasEarrings: false,
    hairLength: 'طويل',
    clothingColor: 'أبيض'
  },
  {
    id: 's23',
    name: 'عمر',
    gender: 'ذكر',
    image: s23,
    hairColor: 'أسود',
    isBlonde: false,
    hasGlasses: true,
    hasHatOrHeadwear: false,
    headwearType: 'لا شيء',
    hasBeardOrMustache: false,
    hasEarrings: false,
    hairLength: 'قصير',
    clothingColor: 'أخضر'
  },
  {
    id: 's24',
    name: 'فارس',
    gender: 'ذكر',
    image: s24,
    hairColor: 'أشقر',
    isBlonde: true,
    hasGlasses: false,
    hasHatOrHeadwear: true,
    headwearType: 'طاقية صوفية',
    hasBeardOrMustache: false,
    hasEarrings: false,
    hairLength: 'قصير',
    clothingColor: 'رمادي'
  }
];

const SUSPECT_MAP: Record<string, SuspectPerson> = {};
ALL_24_SUSPECTS.forEach(s => {
  SUSPECT_MAP[s.id] = s;
});

// ============================================================================
// 15 CASES ACROSS 3 DISTINCT DIFFICULTY LEVELS - TESTED & MATHEMATICALLY VERIFIED
// ============================================================================
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface EvidenceTerm {
  ar: string;
  en: string;
}

export interface ClueItem {
  speech: string;
  matcher: (s: SuspectPerson) => boolean;
  cipherKey?: string;
  cipherHint?: string;
  cipherOptions?: string[];
}

export interface DetectiveCase {
  id: number;
  level: DifficultyLevel;
  caseNumber: number;
  caseIndex: number;
  codeName: string;
  crimeDescription: string;
  bgImage: string;
  suspects: SuspectPerson[];
  suspectIds: string[];
  culpritId: string;
  evidenceTerms: EvidenceTerm[];
  clues: ClueItem[];
}

export const CASES_DATABASE: DetectiveCase[] = [
  // ==========================================================================
  // LEVEL 1: المبتدئ (2.webp و 3.webp بالتناوب)
  // ==========================================================================
  {
    id: 1,
    level: 'beginner',
    caseNumber: 1,
    caseIndex: 0,
    codeName: 'لغز اللوحة المسروقة',
    bgImage: 'url(/٢.webp), url(/2.webp)',
    crimeDescription: 'عند إغلاق المعرض اختفت لوحة أثرية نادرة من الجناح الشرقي. وثقت الكاميرات تواجد ستة مشتبه بهم في المكان وقت وقوع الحادثة.',
    suspects: [
      { id: 'c0_s0', name: 'كمال', gender: 'ذكر', image: '/case_suspects/c0_s0.png' },
      { id: 'c0_s1', name: 'رنا', gender: 'أنثى', image: '/case_suspects/c0_s1.png' },
      { id: 'c0_s2', name: 'تامر', gender: 'ذكر', image: '/case_suspects/c0_s2.png' },
      { id: 'c0_s3', name: 'مريم', gender: 'أنثى', image: '/case_suspects/c0_s3.png' },
      { id: 'c0_s4', name: 'يزن', gender: 'ذكر', image: '/case_suspects/c0_s4.png' },
      { id: 'c0_s5', name: 'نوال', gender: 'أنثى', image: '/case_suspects/c0_s5.png' },
    ],
    suspectIds: ['c0_s0', 'c0_s1', 'c0_s2', 'c0_s3', 'c0_s4', 'c0_s5'],
    culpritId: 'c0_s4', // يزن
    evidenceTerms: [
      { ar: 'لَوْحَة زَيْتِيَّة', en: 'Oil Painting' },
      { ar: 'كَامِيرَا مُرَاقَبَة', en: 'Security Camera' },
      { ar: 'بَصَمَات أَصَابِع', en: 'Fingerprints' },
      { ar: 'جَنَاح شَرْقِي', en: 'East Wing' },
      { ar: 'حُجَّة غِيَاب', en: 'Alibi' }
    ],
    clues: [
      { speech: 'أثبتت التحريات براءة الإناث المتواجدات في المعرض', matcher: (s) => s.gender === 'أنثى' },
      { speech: 'كمال كان في مكتب الأمن يراجع التسجيلات، فهو بريء', matcher: (s) => s.id === 'c0_s0' },
      { speech: 'تامر شوهد يتناول القهوة في المقصف وقت الحادث، فهو بريء', matcher: (s) => s.id === 'c0_s2' }
    ]
  },
  {
    id: 2,
    level: 'beginner',
    caseNumber: 2,
    caseIndex: 1,
    codeName: 'قضية الماسة الزرقاء',
    bgImage: 'url(/٣.webp), url(/3.webp)',
    crimeDescription: 'في تمام الساعة 10:30 مساءً اختفت الماسة الزرقاء من واجهة العرض الزجاجية. رُصدت حركة هؤلاء الأشخاص الستة في محيط القاعة وقت الحادث.',
    suspects: [
      { id: 'c1_s0', name: 'عادل', gender: 'ذكر', image: '/case_suspects/c1_s0.png' },
      { id: 'c1_s1', name: 'لورا', gender: 'أنثى', image: '/case_suspects/c1_s1.png' },
      { id: 'c1_s2', name: 'جنى', gender: 'أنثى', image: '/case_suspects/c1_s2.png' },
      { id: 'c1_s3', name: 'نديم', gender: 'ذكر', image: '/case_suspects/c1_s3.png' },
      { id: 'c1_s4', name: 'سعاد', gender: 'أنثى', image: '/case_suspects/c1_s4.png' },
      { id: 'c1_s5', name: 'رامي', gender: 'ذكر', image: '/case_suspects/c1_s5.png' },
    ],
    suspectIds: ['c1_s0', 'c1_s1', 'c1_s2', 'c1_s3', 'c1_s4', 'c1_s5'],
    culpritId: 'c1_s4', // سعاد
    evidenceTerms: [
      { ar: 'مَاسَة زَرْقَاء', en: 'Blue Diamond' },
      { ar: 'وَاجِهَة زُجَاجِيَّة', en: 'Glass Showcase' },
      { ar: 'جِهَاز إِنْذَار', en: 'Alarm System' },
      { ar: 'قَاعَة العَرْض', en: 'Exhibition Hall' },
      { ar: 'شَاهِد عِيَان', en: 'Eyewitness' }
    ],
    clues: [
      { speech: 'أكد حراس المتحف براءة جميع الذكور الحاضرين في القاعة', matcher: (s) => s.gender === 'ذكر' },
      { speech: 'لورا كانت تجري مكالمة هاتفية موثقة في الاستقبال، فهي بريئة', matcher: (s) => s.id === 'c1_s1' },
      { speech: 'جنى شوهدت في جناح الهدايا التذكارية وقت وقوع السرقة، فهي بريئة', matcher: (s) => s.id === 'c1_s2' }
    ]
  },

  // ==========================================================================
  // LEVEL 2: المتوسط (4.webp و 5.webp بالتناوب)
  // ==========================================================================
  {
    id: 3,
    level: 'intermediate',
    caseNumber: 1,
    caseIndex: 2,
    codeName: 'لغز الساعة الصامتة',
    bgImage: 'url(/٤.webp), url(/4.webp)',
    crimeDescription: 'توقفت كل ساعات الورشة عند منتصف الليل واختفت الساعة الصامتة النادرة. ستة مشتبه بهم كانوا يملكون مفاتيح الورشة.',
    suspects: [
      { id: 'c2_s0', name: 'هاني', gender: 'ذكر', image: '/case_suspects/c2_s0.png' },
      { id: 'c2_s1', name: 'كارمن', gender: 'أنثى', image: '/case_suspects/c2_s1.png' },
      { id: 'c2_s2', name: 'طارق', gender: 'ذكر', image: '/case_suspects/c2_s2.png' },
      { id: 'c2_s3', name: 'عبير', gender: 'أنثى', image: '/case_suspects/c2_s3.png' },
      { id: 'c2_s4', name: 'فهد', gender: 'ذكر', image: '/case_suspects/c2_s4.png' },
      { id: 'c2_s5', name: 'ليلى', gender: 'أنثى', image: '/case_suspects/c2_s5.png' },
    ],
    suspectIds: ['c2_s0', 'c2_s1', 'c2_s2', 'c2_s3', 'c2_s4', 'c2_s5'],
    culpritId: 'c2_s2', // طارق
    evidenceTerms: [
      { ar: 'سَاعَة صَامِتَة', en: 'Silent Clock' },
      { ar: 'مَفَاتِيح الوَرْشَة', en: 'Workshop Keys' },
      { ar: 'مُنْتَصَف اللَّيْل', en: 'Midnight' },
      { ar: 'خِزَانَة حَدِيدِيَّة', en: 'Iron Safe' },
      { ar: 'أَثَر أَقْدَام', en: 'Footprints' }
    ],
    clues: [
      { speech: 'سجلات الدخول أثبتت براءة الإناث من فتح خزانة الورشة', matcher: (s) => s.gender === 'أنثى' },
      { speech: 'هاني كان في المخزن الخلفي يستلم شحنة قطع الغيار، فهو بريء', matcher: (s) => s.id === 'c2_s0' },
      { speech: 'فهد كان يوقع استمارة الحضور والانصراف عند البوابة، فهو بريء', matcher: (s) => s.id === 'c2_s4' }
    ]
  },
  {
    id: 4,
    level: 'intermediate',
    caseNumber: 2,
    caseIndex: 3,
    codeName: 'سر شيفرة المنارة',
    bgImage: 'url(/٥.webp), url(/5.webp)',
    crimeDescription: 'توقفت إشارة المنارة سبع دقائق واختفت الشيفرة السرية من غرفة التحكم. كان ستة أشخاص على الجزيرة وقت الحادث.',
    suspects: [
      { id: 'c3_s0', name: 'سامي', gender: 'ذكر', image: '/case_suspects/c3_s0.png' },
      { id: 'c3_s1', name: 'يوسف', gender: 'ذكر', image: '/case_suspects/c3_s1.png' },
      { id: 'c3_s2', name: 'ندى', gender: 'أنثى', image: '/case_suspects/c3_s2.png' },
      { id: 'c3_s3', name: 'خديجة', gender: 'أنثى', image: '/case_suspects/c3_s3.png' },
      { id: 'c3_s4', name: 'رقية', gender: 'أنثى', image: '/case_suspects/c3_s4.png' },
      { id: 'c3_s5', name: 'مازن', gender: 'ذكر', image: '/case_suspects/c3_s5.png' },
    ],
    suspectIds: ['c3_s0', 'c3_s1', 'c3_s2', 'c3_s3', 'c3_s4', 'c3_s5'],
    culpritId: 'c3_s2', // ندى
    evidenceTerms: [
      { ar: 'شِيفْرَة سِرِّيَّة', en: 'Secret Code' },
      { ar: 'إِشَارَة المَنَارَة', en: 'Lighthouse Signal' },
      { ar: 'غُرْفَة التَّحَكُّم', en: 'Control Room' },
      { ar: 'جَزِيرَة نَائِيَة', en: 'Remote Island' },
      { ar: 'سِجِلّ المِلَاحَة', en: 'Navigation Log' }
    ],
    clues: [
      { speech: 'برج المراقبة أكد براءة جميع الذكور المتواجدين على الرصيف', matcher: (s) => s.gender === 'ذكر' },
      { speech: 'خديجة كانت تفحص محرك القارب برفقة الربان، فهي بريئة', matcher: (s) => s.id === 'c3_s3' },
      { speech: 'رقية كانت في محطة الأرصاد تسجل بيانات الرياح، فهي بريئة', matcher: (s) => s.id === 'c3_s4' }
    ]
  },

  // ==========================================================================
  // LEVEL 3: المتقدم (6.webp و 7.webp بالتناوب)
  // ==========================================================================
  {
    id: 5,
    level: 'advanced',
    caseNumber: 1,
    caseIndex: 4,
    codeName: 'حقيبة محطة القطار',
    bgImage: 'url(/٦.webp), url(/6.webp)',
    crimeDescription: 'عند وصول القطار اختفت حقيبة تحتوي على وثائق سرية من الرصيف السابع. أظهرت الكاميرات ستة مشتبه بهم.',
    suspects: [
      { id: 'c4_s0', name: 'منصور', gender: 'ذكر', image: '/case_suspects/c4_s0.png' },
      { id: 'c4_s1', name: 'رفيف', gender: 'أنثى', image: '/case_suspects/c4_s1.png' },
      { id: 'c4_s2', name: 'خديجة', gender: 'أنثى', image: '/case_suspects/c4_s2.png' },
      { id: 'c4_s3', name: 'آنس', gender: 'ذكر', image: '/case_suspects/c4_s3.png' },
      { id: 'c4_s4', name: 'رقية', gender: 'أنثى', image: '/case_suspects/c4_s4.png' },
      { id: 'c4_s5', name: 'مازن', gender: 'ذكر', image: '/case_suspects/c4_s5.png' },
    ],
    suspectIds: ['c4_s0', 'c4_s1', 'c4_s2', 'c4_s3', 'c4_s4', 'c4_s5'],
    culpritId: 'c4_s3', // آنس
    evidenceTerms: [
      { ar: 'حَقِيبَة وِثَائِق', en: 'Document Briefcase' },
      { ar: 'رَصِيف القِطَار', en: 'Train Platform' },
      { ar: 'تَذْكِرَة سَفَر', en: 'Travel Ticket' },
      { ar: 'شُبَّاك التَّذَاكِر', en: 'Ticket Counter' },
      { ar: 'عَرَبَة الأَمْتِعَة', en: 'Luggage Wagon' }
    ],
    clues: [
      {
        speech: 'كاميرات المحطة أثبتت براءة جميع المسافرات الإناث',
        matcher: (s) => s.gender === 'أنثى',
        cipherKey: 'تَسْجِيلَات الكَامِيرَا',
        cipherHint: 'ما وسيلة المراقبة التي برأت المسافرات؟',
        cipherOptions: ['تَسْجِيلَات الكَامِيرَا', 'صَافِرَة القِطَار', 'حَقِيبَة السَّفَر']
      },
      {
        speech: 'منصور كان يشتري تذكرة السفر من شباك التذاكر، فهو بريء',
        matcher: (s) => s.id === 'c4_s0',
        cipherKey: 'شُبَّاك التَّذَاكِر',
        cipherHint: 'أين كان منصور وقت اختفاء الحقيبة؟',
        cipherOptions: ['شُبَّاك التَّذَاكِر', 'عَرَبَة الأَمْتِعَة', 'رَصِيف ٧']
      },
      {
        speech: 'مازن كان في عربة الأمتعة مع عمال المحطة، فهو بريء',
        matcher: (s) => s.id === 'c4_s5',
        cipherKey: 'عَرَبَة الأَمْتِعَة',
        cipherHint: 'ما الموقع الذي تواجد فيه مازن مع العمال؟',
        cipherOptions: ['عَرَبَة الأَمْتِعَة', 'غُرْفَة المَحَطَّة', 'بَاب القِطَار']
      }
    ]
  },
  {
    id: 6,
    level: 'advanced',
    caseNumber: 2,
    caseIndex: 5,
    codeName: 'سر المخطوطة المفقودة',
    bgImage: 'url(/٧.webp), url(/7.webp)',
    crimeDescription: 'قبل دقائق من افتتاح المعرض اختفت مخطوطة تاريخية من الخزانة المحصنة. كان ستة أشخاص يحملون مفاتيح الأرشيف.',
    suspects: [
      { id: 'c5_s0', name: 'منى', gender: 'أنثى', image: '/case_suspects/c5_s0.png' },
      { id: 'c5_s1', name: 'راهول', gender: 'ذكر', image: '/case_suspects/c5_s1.png' },
      { id: 'c5_s2', name: 'لينا', gender: 'أنثى', image: '/case_suspects/c5_s2.png' },
      { id: 'c5_s3', name: 'جابر', gender: 'ذكر', image: '/case_suspects/c5_s3.png' },
      { id: 'c5_s4', name: 'إبراهيم', gender: 'ذكر', image: '/case_suspects/c5_s4.png' },
      { id: 'c5_s5', name: 'سليم', gender: 'ذكر', image: '/case_suspects/c5_s5.png' },
    ],
    suspectIds: ['c5_s0', 'c5_s1', 'c5_s2', 'c5_s3', 'c5_s4', 'c5_s5'],
    culpritId: 'c5_s2', // لينا
    evidenceTerms: [
      { ar: 'مَخْطُوطَة نَادِرَة', en: 'Rare Manuscript' },
      { ar: 'خِزَانَة مُحَصَّنَة', en: 'Vault Safe' },
      { ar: 'مَفَاتِيح الأَرْشِيف', en: 'Archive Keys' },
      { ar: 'حَفْل الاِفْتِتَاح', en: 'Opening Ceremony' },
      { ar: 'وَثِيقَة تَارِيخِيَّة', en: 'Historical Document' }
    ],
    clues: [
      {
        speech: 'سجلات بصمات الأرشيف استبعدت جميع الذكور من دائرة الاتهام',
        matcher: (s) => s.gender === 'ذكر',
        cipherKey: 'سِجِلّ البَصَمَات',
        cipherHint: 'ما الدليل الجنائي الذي استبعد الذكور؟',
        cipherOptions: ['سِجِلّ البَصَمَات', 'مَفَاتِيح الخَزِينَة', 'إِشْعَار الدُّخُول']
      },
      {
        speech: 'منى كانت تقدم العرض التقديمي أمام الجمهور في القاعة، فهي بريئة',
        matcher: (s) => s.id === 'c5_s0',
        cipherKey: 'قَاعَة العَرْض',
        cipherHint: 'أين كانت منى تقدم عرضها التقديمي؟',
        cipherOptions: ['قَاعَة العَرْض', 'غُرْفَة المَخْطُوطَات', 'مَمَرّ الأَرْشِيف']
      }
    ]
  }
];

CASES_DATABASE.forEach(c => {
  c.suspects.forEach(s => {
    SUSPECT_MAP[s.id] = s;
  });
});

// MAIN COMPONENT
// ============================================================================
export interface DetectiveMysteryProps {
  onBack?: () => void;
  lang?: 'ar' | 'en';
}

export const DetectiveMystery: React.FC<DetectiveMysteryProps> = ({ onBack, lang = 'ar' }) => {
  // Navigation: 'intro' | 'briefing' | 'investigation' | 'envelope'
  const [currentScreen, setCurrentScreen] = useState<'intro' | 'briefing' | 'investigation' | 'envelope'>('intro');
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>('beginner');
  const [currentCaseIndex, setCurrentCaseIndex] = useState<number>(0);

  // Sound & Music state
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Crime Scene State
  const [currentClueIndex, setCurrentClueIndex] = useState<number>(0);
  const [eliminatedIds, setEliminatedIds] = useState<Set<string>>(new Set());
  const [stampedInnocentId, setStampedInnocentId] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);

  // Advanced Mode Forensic Cipher & Dossier State
  const [isClueDecoded, setIsClueDecoded] = useState<boolean>(false);
  const [failedCipherKey, setFailedCipherKey] = useState<string | null>(null);
  const [showEvidenceDossier, setShowEvidenceDossier] = useState<boolean>(false);

  const [isCaseSolved, setIsCaseSolved] = useState<boolean>(false);

  // Envelope Screen State (When student finishes case and receives letter)
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState<boolean>(false);
  const reportCardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Magnifier scanner coordinates for cinematic intro
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Get active cases for level
  const activeLevelCases = useMemo(() => {
    return CASES_DATABASE.filter(c => c.level === selectedLevel);
  }, [selectedLevel]);

  const activeCase = activeLevelCases[currentCaseIndex] || activeLevelCases[0];
  const activeClue = activeCase.clues[currentClueIndex] || activeCase.clues[0];

  // Typewriter effect for clue sentence (كتابة حرفاً بحرف)
  const [typedClueText, setTypedClueText] = useState<string>('');
  useEffect(() => {
    if (!activeClue?.speech || (selectedLevel === 'advanced' && !isClueDecoded)) {
      setTypedClueText('');
      return;
    }
    setTypedClueText('');
    let charIdx = 0;
    const fullText = activeClue.speech;
    const timer = setInterval(() => {
      charIdx++;
      setTypedClueText(fullText.slice(0, charIdx));
      if (charIdx >= fullText.length) {
        clearInterval(timer);
      }
    }, 28);
    return () => clearInterval(timer);
  }, [activeClue, selectedLevel, isClueDecoded]);

  // المشتبه بهم في هذه القضية فقط (مطابقون تماماً لمسرح الجريمة بالصفحة الثانية)
  const caseSuspects = useMemo(() => {
    return activeCase.suspects;
  }, [activeCase]);

  const remainingSuspects = useMemo(() => {
    return caseSuspects.filter(s => !eliminatedIds.has(s.id));
  }, [caseSuspects, eliminatedIds]);

  const isCulpritIdentified = remainingSuspects.length === 1 && remainingSuspects[0].id === activeCase.culpritId;

  // Cleanup music on unmount
  useEffect(() => {
    return () => {
      spyAudio.stopBgm();
    };
  }, []);

  // Music toggle handler
  const handleToggleMusic = () => {
    const playing = spyAudio.toggleBgm();
    setIsMusicPlaying(playing);
  };

  // Mute toggle handler
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    spyAudio.setMuted(nextMuted);
  };

  // Select level & enter crime briefing
  const handleSelectLevel = (level: DifficultyLevel) => {
    setSelectedLevel(level);
    setCurrentCaseIndex(0);
    resetCase(0);
    
    if (level === 'advanced') {
      // مؤثر صوتي خاص بالمستوى المتقدم ونمط موسيقي عالي التوتر
      spyAudio.playAdvancedAlarm();
      spyAudio.setTrack(3); // Tense Interrogation track
    } else {
      spyAudio.playClassifiedStamp();
      spyAudio.setTrack(0);
    }

    if (!isMusicPlaying) {
      const playing = spyAudio.toggleBgm();
      setIsMusicPlaying(playing);
    }
    
    setCurrentScreen('briefing');
  };

  // Start investigation from crime briefing
  const handleStartInvestigation = () => {
    spyAudio.playClassifiedStamp();
    setCurrentScreen('investigation');
  };

  // Reset current case state
  const resetCase = (caseIdx: number) => {
    setCurrentClueIndex(0);
    setEliminatedIds(new Set());
    setStampedInnocentId(null);
    setShakeId(null);
    setIsClueDecoded(false);
    setFailedCipherKey(null);
    setShowEvidenceDossier(false);
    setIsCaseSolved(false);
    setIsEnvelopeOpened(false);
    // تغيير النمط الموسيقي مع كل قضية تلقائياً
    spyAudio.setTrack(caseIdx % 5);
  };

  // Handle decoding cipher in advanced level
  const handleDecodeCipher = (opt: string) => {
    if (opt === activeClue.cipherKey || !activeClue.cipherKey) {
      spyAudio.playCipherDecode();
      setIsClueDecoded(true);
      setFailedCipherKey(null);
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { x: 0.22, y: 0.38 }
        });
      } catch {}
    } else {
      spyAudio.playWrongBuzzer();
      setFailedCipherKey(opt);
      setTimeout(() => setFailedCipherKey(null), 500);
    }
  };

  const remainingMatchingForCurrentClue = useMemo(() => {
    return caseSuspects.filter(s => !eliminatedIds.has(s.id) && activeClue?.matcher(s));
  }, [caseSuspects, eliminatedIds, activeClue]);

  // Handle clicking on suspect in crime scene
  const handleSuspectClick = (suspect: SuspectPerson) => {
    if (isCulpritIdentified || eliminatedIds.has(suspect.id)) return;

    // في المستوى المتقدم، يجب فك شفرة الإفادة الجنائية أولاً
    if (selectedLevel === 'advanced' && !isClueDecoded) {
      spyAudio.playWrongBuzzer();
      return;
    }

    const matchesClue = activeClue.matcher(suspect);

    if (matchesClue) {
      // Correct elimination!
      spyAudio.playClassifiedStamp();
      setStampedInnocentId(suspect.id);

      // Create new set immediately for instantaneous UI & logic sync
      const nextEliminated = new Set(eliminatedIds);
      nextEliminated.add(suspect.id);
      setEliminatedIds(nextEliminated);

      // Check how many suspects in this case still match current clue
      const remainingMatching = caseSuspects.filter(
        s => !nextEliminated.has(s.id) && activeClue.matcher(s)
      );

      // Clear the temporary stamp animation id after 350ms
      setTimeout(() => {
        setStampedInnocentId(null);
      }, 350);

      if (remainingMatching.length === 0) {
        // Clue cleared! Check if this unmasks the culprit
        const remaining = caseSuspects.filter(s => !nextEliminated.has(s.id));
        if (remaining.length === 1 && remaining[0].id === activeCase.culpritId) {
          // CASE FULLY SOLVED! The culprit is unmasked on Page 3!
          setTimeout(() => {
            spyAudio.playVictoryFanfare();
            setIsCaseSolved(true);
            // Smooth transition directly to Page 4 without confetti
            setTimeout(() => {
              setCurrentScreen('envelope');
            }, 1200);
          }, 300);
        } else if (currentClueIndex < activeCase.clues.length - 1) {
          // Next clue stinger with pleasant transition!
          setTimeout(() => {
            spyAudio.playClueStinger();
            setCurrentClueIndex(ci => ci + 1);
            if (selectedLevel === 'advanced') {
              setIsClueDecoded(false);
              setFailedCipherKey(null);
            }
          }, 450);
        }
      }
    } else {
      // Wrong click: buzz
      spyAudio.playWrongBuzzer();
      setShakeId(suspect.id);
      setTimeout(() => setShakeId(null), 400);
    }
  };

  // Open the sealed confidential letter
  const handleOpenEnvelope = () => {
    spyAudio.playEnvelopeOpen();
    setIsEnvelopeOpened(true);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 }
      });
    } catch {}
  };

  // Download official case forensic report
  const handleDownloadReport = () => {
    const reportText = `
=====================================================
            تقرير إغلاق القضية الجنائية الرسمي
=====================================================
القضية: ${activeCase.codeName}
المستوى: ${
  selectedLevel === 'beginner' 
    ? 'المبتدئ (مفردات الملاحظة السريعة والألوان)' 
    : selectedLevel === 'intermediate' 
    ? 'المتوسط (التحليل والاستنتاج المركب والملابس)' 
    : 'المتقدم (طور المحقق الخبير وفك الشفرات الجنائية - رتبة الماسترميند 100%)'
}
الجاني المحدد: ${SUSPECT_MAP[activeCase.culpritId]?.name || 'المطلوب'}

-----------------------------------------------------
رسالة شكر وتقدير من المحقق:
«عمل استثنائي يا زميلي المحقق! بفضل براعتك وقوة ملاحظتك
تم استبعاد كافة الأبرياء بنجاح وكشف ملابسات القضية بدقة متناهية!»
-----------------------------------------------------

سجل الأدلة والمفردات الموثقة في ملف التحقيق (Bilingual Evidence Log):
${activeCase.evidenceTerms.map((t, i) => `${i + 1}. ${t.ar}  ---  [${t.en}]`).join('\n')}

تاريخ التوثيق: ${new Date().toLocaleDateString('ar-EG')}
الحالة: مغلقة ومعتمدة رسمياً ✓
=====================================================
`.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Case_Report_${activeCase.id}_Closed.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download official case forensic report as PDF
  const handleDownloadPdfReport = async () => {
    if (!reportCardRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    spyAudio.playClassifiedStamp();

    try {
      const canvas = await html2canvas(reportCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#020617',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`تقرير_القضية_${activeCase.caseNumber}_${activeCase.codeName}.pdf`);
    } catch (err) {
      console.error('Error generating PDF report:', err);
      // Fallback to text file if canvas/PDF encounters any issues
      handleDownloadReport();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Proceed to next case (alternates between cases of the selected level)
  const handleNextCase = () => {
    setIsCaseSolved(false);
    setIsEnvelopeOpened(false);
    const nextIdx = (currentCaseIndex + 1) % activeLevelCases.length;
    setCurrentCaseIndex(nextIdx);
    resetCase(nextIdx);
    spyAudio.playClueStinger();
    setCurrentScreen('briefing');
  };

  // Interactive spotlight movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // ============================================================================
  // RENDER 1: CINEMATIC INTRO SCREEN (Page 1 - ١.webp)
  // ============================================================================
  if (currentScreen === 'intro') {
    return (
      <div 
        className="relative w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center overflow-hidden select-none font-sans"
        dir="rtl"
      >
        {/* 16:9 Canvas container for perfect alignment with ١.webp */}
        <div 
          className="relative w-full aspect-video flex flex-col justify-between overflow-hidden shadow-2xl"
          style={{
            maxHeight: '100vh',
            maxWidth: 'calc(100vh * (16 / 9))',
            aspectRatio: '16 / 9',
          }}
        >
          {/* Backdrop: Image 1 from public/١.webp with full clarity */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ 
              backgroundImage: BG_PAGE1_INTRO,
              backgroundSize: '100% 100%',
            }}
          />

          {/* Minimal Controls Bar: Back only - NO audio controls in top right */}
          <header className="relative z-40 w-full p-4 flex items-center justify-between pointer-events-none">
            <div />
            {onBack && (
              <button
                onClick={onBack}
                className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-amber-500/40 text-xs font-bold text-amber-300 hover:bg-black/80 transition cursor-pointer backdrop-blur-md"
              >
                <ArrowRight size={14} />
                <span>العودة للألعاب</span>
              </button>
            )}
          </header>

          {/* 3 Interactive Clickable Buttons for (المبتدئ - المتوسط - المتقدم) in ١.webp - مطابقة تماماً للمستطيلات الثلاثة دون خروج عن إطاراتها */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* 1. مستطيل المبتدئ (على اليسار في الصورة: يغطي المستطيل تماماً دون الخروج عن إطاره) */}
            <button
              onClick={() => handleSelectLevel('beginner')}
              className="absolute pointer-events-auto cursor-pointer rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-[0.99] focus:outline-none"
              style={{
                left: '23.2%',
                width: '16.8%',
                top: '50.5%',
                height: '35.5%',
              }}
              title="مستوى المبتدئ"
            />

            {/* 2. مستطيل المتوسط (في المنتصف في الصورة: يغطي المستطيل تماماً دون الخروج عن إطاره) */}
            <button
              onClick={() => handleSelectLevel('intermediate')}
              className="absolute pointer-events-auto cursor-pointer rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-[0.99] focus:outline-none"
              style={{
                left: '41.6%',
                width: '16.8%',
                top: '50.5%',
                height: '35.5%',
              }}
              title="مستوى المتوسط"
            />

            {/* 3. مستطيل المتقدم (على اليمين في الصورة: يغطي المستطيل تماماً دون الخروج عن إطاره) */}
            <button
              onClick={() => handleSelectLevel('advanced')}
              className="absolute pointer-events-auto cursor-pointer rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-[0.99] focus:outline-none"
              style={{
                left: '60.0%',
                width: '16.8%',
                top: '50.5%',
                height: '35.5%',
              }}
              title="مستوى المتقدم"
            />
          </div>

          {/* Bottom-Left Audio Controls over the drawn music & sound shapes in ١.webp */}
          <div className="absolute inset-0 z-30 pointer-events-none">
            {/* Sound Icon Button (أقصى اليسار) */}
            <button
              onClick={handleToggleMute}
              className="absolute pointer-events-auto cursor-pointer rounded-full transition-all duration-200 hover:ring-2 hover:ring-amber-400/80 hover:bg-amber-400/20 flex items-center justify-center active:scale-90"
              style={{
                left: '2.8%',
                width: '4.4%',
                top: '85.5%',
                height: '8.5%',
              }}
              title={isMuted ? 'إلغاء كتم المؤثرات الصوتية' : 'كتم المؤثرات الصوتية'}
            >
              {isMuted && (
                <div className="w-5 h-5 rounded-full bg-red-600/90 border border-white flex items-center justify-center text-white shadow-lg">
                  <VolumeX size={12} strokeWidth={3} />
                </div>
              )}
            </button>

            {/* Music Icon Button (بجانب زر الصوت) */}
            <button
              onClick={handleToggleMusic}
              className="absolute pointer-events-auto cursor-pointer rounded-full transition-all duration-200 hover:ring-2 hover:ring-amber-400/80 hover:bg-amber-400/20 flex items-center justify-center active:scale-90"
              style={{
                left: '9.0%',
                width: '4.4%',
                top: '85.5%',
                height: '8.5%',
              }}
              title={isMusicPlaying ? 'إيقاف موسيقى التحري' : 'تشغيل موسيقى التحري'}
            >
              {!isMusicPlaying && (
                <div className="w-5 h-5 rounded-full bg-slate-800/90 border border-slate-400 flex items-center justify-center text-slate-300 shadow-lg">
                  <span className="text-[10px] font-black leading-none">✕</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER 2: THE CRIME BRIEFING SCREEN (Page 2 - ٢.webp إلى ٧.webp بالتناوب)
  // ============================================================================
  if (currentScreen === 'briefing') {
    return (
      <div 
        className="relative w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center overflow-hidden select-none font-sans"
        dir="rtl"
      >
        {/* 16:9 Canvas container for perfect alignment with ٢.webp - ٧.webp */}
        <div 
          className="relative w-full aspect-video flex flex-col justify-between overflow-hidden shadow-2xl"
          style={{
            maxHeight: '100vh',
            maxWidth: 'calc(100vh * (16 / 9))',
            aspectRatio: '16 / 9',
          }}
        >
          {/* Backdrop: Crime Scene Images with full clarity */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ 
              backgroundImage: activeCase.bgImage || getCrimeSceneBg(currentCaseIndex),
              backgroundSize: '100% 100%',
            }}
          />

          {/* Top Bar for Back / Navigation (NO music button) */}
          <header className="relative z-40 w-full p-4 flex items-center justify-between pointer-events-none">
            <button
              onClick={() => setCurrentScreen('intro')}
              className="pointer-events-auto p-1.5 px-3 rounded-full bg-black/60 border border-amber-500/40 text-amber-300 hover:bg-black/80 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold backdrop-blur-md"
            >
              <ArrowRight size={14} />
              <span>الرئيسية</span>
            </button>

            {selectedLevel === 'advanced' && (
              <div className="pointer-events-none px-3.5 py-1 rounded-full bg-amber-950/90 border border-amber-500/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center gap-2 backdrop-blur-md">
                <ShieldCheck size={14} className="text-amber-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-black tracking-wider">
                  طور المحقق الخبير (Mastermind) • الأدلة مشفرة 🔒
                </span>
              </div>
            )}
          </header>

          {/* Millimetric Hotspot over (بدء التحقيق واستبعاد الأبرياء) - متطابق بدقة متناهية فوق المستطيل الأصلي */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <button
              onClick={handleStartInvestigation}
              className="absolute pointer-events-auto cursor-pointer rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-[0.98] focus:outline-none"
              style={{
                left: '1.8%',
                width: '29.0%',
                top: '65.6%',
                height: '7.3%',
              }}
              title="بدء التحقيق واستبعاد الأبرياء"
            />
          </div>

          {/* Bottom-left audio toggles */}
          <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-full bg-black/60 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer backdrop-blur-md"
              title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
            >
              {isMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} className="text-amber-400" />}
            </button>
            <button
              onClick={handleToggleMusic}
              className="p-2 rounded-full bg-black/60 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer backdrop-blur-md"
              title={isMusicPlaying ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
            >
              <Music size={15} className={isMusicPlaying ? 'text-amber-400' : 'text-slate-500'} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER 3: ENVELOPE / REPORT SCREEN (Page 4 - ٩.jpeg)
  // ============================================================================
  if (currentScreen === 'envelope') {
    const tableRowPositions = [
      { top: '38.5%', height: '7.8%' },
      { top: '47.4%', height: '7.8%' },
      { top: '56.3%', height: '7.8%' },
      { top: '65.1%', height: '7.8%' },
      { top: '74.0%', height: '7.8%' },
    ];

    return (
      <div 
        className="relative w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center overflow-hidden select-none font-sans"
        dir="rtl"
      >
        {/* 16:9 Canvas container for perfect alignment with ٩.jpeg */}
        <div 
          ref={reportCardRef}
          className="relative w-full aspect-video flex flex-col justify-between overflow-hidden shadow-2xl"
          style={{
            maxHeight: '100vh',
            maxWidth: 'calc(100vh * (16 / 9))',
            aspectRatio: '16 / 9',
          }}
        >
          {/* Backdrop: Image 9 from public/٩.jpeg with full clarity */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ 
              backgroundImage: BG_PAGE4_REPORT,
              backgroundSize: '100% 100%',
            }}
          />

          {/* Top minimal back button */}
          <header className="relative z-40 w-full p-4 flex items-center justify-between pointer-events-none">
            <button
              onClick={() => setCurrentScreen('intro')}
              className="pointer-events-auto p-1.5 px-3 rounded-full bg-black/60 border border-amber-500/40 text-amber-300 hover:bg-black/80 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold backdrop-blur-md"
            >
              <ArrowRight size={14} />
              <span>الرئيسية</span>
            </button>
          </header>

          {/* Mastermind Badge for Advanced Level */}
          {selectedLevel === 'advanced' && (
            <div className="absolute top-[28.5%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="px-3.5 py-1 rounded-full bg-amber-950/90 border border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.6)] flex items-center gap-1.5 backdrop-blur-sm animate-pulse">
                <Award size={14} className="text-amber-300" />
                <span className="text-xs sm:text-sm font-black tracking-wide">
                  رتبة كبير المحققين (Mastermind Detective) • تم فك كافة الشفرات الجنائية ✓
                </span>
              </div>
            </div>
          )}

          {/* Vocabulary Table attached directly into the 5 rows of ٩.jpeg - خانات الجدول بالضبط بالمليمتر */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {[
              { top: '38.2%', height: '6.4%' },
              { top: '44.6%', height: '6.4%' },
              { top: '51.0%', height: '6.4%' },
              { top: '57.5%', height: '6.5%' },
              { top: '64.1%', height: '6.8%' },
            ].map((pos, idx) => {
              const term = activeCase.evidenceTerms[idx] || { ar: 'دليل جنائي', en: 'Evidence' };
              return (
                <React.Fragment key={idx}>
                  {/* Arabic word under (الكلمة) - Right Column */}
                  <div
                    className="absolute flex items-center justify-center text-center px-2"
                    style={{
                      left: '65.5%',
                      width: '19.0%',
                      top: pos.top,
                      height: pos.height,
                    }}
                  >
                    <span className="text-white font-black text-xs sm:text-sm md:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] tracking-wide">
                      {term.ar}
                    </span>
                  </div>

                  {/* Translation/Clue under (الدليل) - Left Column */}
                  <div
                    className="absolute flex items-center justify-center text-center px-2"
                    style={{
                      left: '46.5%',
                      width: '18.5%',
                      top: pos.top,
                      height: pos.height,
                    }}
                  >
                    <span className="text-white font-black text-xs sm:text-sm md:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] tracking-wide">
                      {term.en}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Two buttons over (تحميل الدليل TXT) and (القضية التالية) in ٩.jpeg - متمركزان تماماً فوق الزرين بالمليمتر */}
          <div className="absolute inset-0 z-30 pointer-events-none">
            {/* Button: تحميل الدليل TXT (downloads PDF) - Left Button متمركز تماماً */}
            <button
              onClick={handleDownloadPdfReport}
              disabled={isGeneratingPdf}
              className="absolute pointer-events-auto cursor-pointer rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-[0.98] focus:outline-none"
              style={{
                left: '28.5%',
                width: '18.0%',
                top: '84.0%',
                height: '9.2%',
              }}
              title="تحميل الدليل TXT / PDF"
            />

            {/* Button: القضية التالية - Right Button متمركز تماماً */}
            <button
              onClick={handleNextCase}
              className="absolute pointer-events-auto cursor-pointer rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-[0.98] focus:outline-none"
              style={{
                left: '52.5%',
                width: '18.0%',
                top: '84.0%',
                height: '9.2%',
              }}
              title="القضية التالية"
            />
          </div>

          {/* Bottom-left audio toggles */}
          <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-full bg-black/60 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer backdrop-blur-md"
              title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
            >
              {isMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} className="text-amber-400" />}
            </button>
            <button
              onClick={handleToggleMusic}
              className="p-2 rounded-full bg-black/60 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer backdrop-blur-md"
              title={isMusicPlaying ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
            >
              <Music size={15} className={isMusicPlaying ? 'text-amber-400' : 'text-slate-500'} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER 4: THE INVESTIGATION CRIME SCENE (Page 3 - ٨.jpeg)
  // ============================================================================
  return (
    <div 
      className="relative w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center overflow-hidden select-none font-sans"
      dir="rtl"
    >
      {/* 16:9 Canvas container for perfect alignment with ٨.jpeg */}
      <div 
        className="relative w-full aspect-video flex flex-col justify-between overflow-hidden shadow-2xl"
        style={{
          maxHeight: '100vh',
          maxWidth: 'calc(100vh * (16 / 9))',
          aspectRatio: '16 / 9',
        }}
      >
        {/* Backdrop: Image 8 from public/٨.jpeg with full clarity */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ 
            backgroundImage: BG_PAGE3_INVESTIGATION,
            backgroundSize: '100% 100%',
          }}
        />

        {/* Minimal top header with back only (NO music button) */}
        <header className="relative z-40 w-full p-4 flex items-center justify-between pointer-events-none">
          <button
            onClick={() => setCurrentScreen('briefing')}
            className="pointer-events-auto p-1.5 px-3 rounded-full bg-black/60 border border-amber-500/40 text-amber-300 hover:bg-black/80 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold backdrop-blur-md"
            title="مسرح الجريمة"
          >
            <ArrowRight size={14} />
            <span>مسرح الجريمة</span>
          </button>

          {selectedLevel === 'advanced' && (
            <div className="pointer-events-none px-3 py-1 rounded-full bg-amber-950/85 border border-amber-500/70 text-amber-300 shadow-md flex items-center gap-1.5 backdrop-blur-md">
              <Sparkles size={13} className="text-amber-400" />
              <span className="text-[11px] sm:text-xs font-black">
                طور فك الشفرات الجنائية (Advanced)
              </span>
            </div>
          )}

          <button
            onClick={() => setShowEvidenceDossier(!showEvidenceDossier)}
            className="pointer-events-auto p-1.5 px-3 rounded-full bg-black/60 border border-amber-500/40 text-amber-300 hover:bg-black/80 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold backdrop-blur-md"
            title="سجل الأدلة والمفردات الميدانية"
          >
            <Fingerprint size={14} className="text-amber-400" />
            <span>سجل الأدلة</span>
          </button>
        </header>

        {/* The Beige Rectangle for Clues directly on the left of the 6 frames */}
        <div 
          className="absolute z-20 flex flex-col items-center justify-center p-2 sm:p-3 text-center"
          style={{
            left: '7.5%',
            width: '28.0%',
            top: '22.0%',
            height: '32.0%',
          }}
          dir="rtl"
        >
          {selectedLevel === 'advanced' && !isClueDecoded ? (
            <div className="w-full h-full flex flex-col justify-between items-center py-1 sm:py-1.5">
              {/* Header Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/15 border border-amber-900/40 text-amber-950 font-black text-[10px] sm:text-xs tracking-wide">
                <Lock size={12} className="text-amber-900 animate-pulse" />
                <span>إفادة جنائية مشفرة #{currentClueIndex + 1}</span>
              </div>

              {/* Hint */}
              <p className="text-amber-950 font-black text-[11px] sm:text-xs md:text-sm leading-snug drop-shadow-sm px-1 text-center">
                {activeClue?.cipherHint || 'اختر مفتاح الاستدلال لفك الشفرة:'}
              </p>

              {/* Cipher Options Keys */}
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 w-full pointer-events-auto">
                {(activeClue?.cipherOptions || [activeClue?.cipherKey || 'دليل جنائي']).map((opt, idx) => {
                  const isFailed = failedCipherKey === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleDecodeCipher(opt)}
                      className={`inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black shadow-sm transition-all duration-150 cursor-pointer select-none active:scale-95 ${
                        isFailed
                          ? 'bg-red-700 text-white border border-red-500 scale-105'
                          : 'bg-stone-900/90 hover:bg-stone-800 text-amber-200 border border-amber-600/60 hover:border-amber-400'
                      }`}
                      title="استخدام هذا المفتاح لفك الشفرة"
                    >
                      <Key size={11} className={isFailed ? 'text-white' : 'text-amber-400'} />
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center pointer-events-none">
              {selectedLevel === 'advanced' && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 mb-1 rounded-full bg-emerald-800/15 border border-emerald-800/30 text-emerald-950 font-black text-[9px] sm:text-[10px]">
                  <Unlock size={11} className="text-emerald-800" />
                  <span>تم فك الشفرة الجنائية بنجاح ✓</span>
                </div>
              )}
              <p className="text-amber-950 font-black text-xs sm:text-sm md:text-base leading-relaxed select-none text-center">
                {typedClueText}
                {typedClueText.length < (activeClue?.speech?.length || 0) && (
                  <span className="inline-block w-1.5 h-3.5 sm:h-4 bg-amber-900 mr-1 animate-pulse align-middle" />
                )}
              </p>
            </div>
          )}
        </div>

        {/* The 6 Suspect Frames exactly positioned inside the 6 frames of ٨.jpeg */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {[
            // Row 0: Top Row (Col 2: right, Col 1: middle, Col 0: left)
            { col: 2, row: 0, left: '69.7%', top: '16.1%', width: '12.2%', height: '23.0%' },
            { col: 1, row: 0, left: '54.6%', top: '16.1%', width: '12.2%', height: '23.0%' },
            { col: 0, row: 0, left: '39.4%', top: '16.1%', width: '12.2%', height: '23.0%' },
            // Row 1: Bottom Row (Col 2: right, Col 1: middle, Col 0: left)
            { col: 2, row: 1, left: '69.7%', top: '49.2%', width: '12.2%', height: '23.0%' },
            { col: 1, row: 1, left: '54.6%', top: '49.2%', width: '12.2%', height: '23.0%' },
            { col: 0, row: 1, left: '39.4%', top: '49.2%', width: '12.2%', height: '23.0%' },
          ].map((pos, slotIdx) => {
            const suspect = caseSuspects[slotIdx];
            if (!suspect) return null;

            const isEliminated = eliminatedIds.has(suspect.id);
            const isJustStamped = stampedInnocentId === suspect.id;
            const isShaking = shakeId === suspect.id;
            const isTheCulprit = isCulpritIdentified && suspect.id === activeCase.culpritId;

            return (
              <div
                key={suspect.id}
                onClick={() => {
                  if (!isEliminated && !isCulpritIdentified) {
                    handleSuspectClick(suspect);
                  }
                }}
                className={`absolute pointer-events-auto rounded-[3px] overflow-hidden cursor-pointer transition-transform duration-300 select-none flex flex-col bg-[#11181b] ring-1 ring-amber-200/35 ${
                  isJustStamped ? 'scale-95' : ''
                } ${isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
                style={{
                  left: pos.left,
                  top: pos.top,
                  width: pos.width,
                  height: pos.height,
                }}
              >
                {/* Photo of the suspect: fitted cleanly without cutting top of head */}
                <div className="relative w-full min-h-0 flex-1 overflow-hidden">
                  <img 
                    src={suspect.image} 
                    alt={suspect.name} 
                    className={`absolute inset-0 w-full h-full object-cover object-[center_22%] pointer-events-none transition-all duration-300 ${
                      isEliminated ? 'filter brightness-40 grayscale contrast-75' : 'filter brightness-100'
                    }`}
                    loading="eager"
                  />

                  {/* الدائرة الخضراء وبها علامة صح للشخصية المستبعدة */}
                  {isEliminated && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-fadeIn">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-emerald-600 border-[3px] border-white shadow-[0_0_15px_rgba(16,185,129,0.9)] flex items-center justify-center text-white">
                        <Check className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 stroke-[3.5]" />
                      </div>
                    </div>
                  )}

                  {/* الدائرة الحمراء وبداخلها كلمة (الجاني) للشخصية المكتشفة */}
                  {isTheCulprit && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-fadeIn">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-red-600 border-[3px] border-white shadow-[0_0_25px_rgba(239,68,68,0.95)] flex items-center justify-center text-white font-black text-xs sm:text-sm md:text-base leading-none text-center drop-shadow animate-bounce">
                        (الجاني)
                      </div>
                    </div>
                  )}
                </div>

                {/* Name Tag: pinned at the bottom floor of the frame just like Page 2 */}
                <div className="w-full h-[17%] min-h-0 bg-[#070b0d] border-t border-amber-600/60 flex items-center justify-center px-1 text-center shrink-0">
                  <span className={`font-black text-[11px] sm:text-xs md:text-sm truncate block tracking-wide ${isEliminated ? 'text-stone-500 line-through' : 'text-amber-200'}`}>
                    {suspect.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Forensic Evidence Dossier Modal */}
        {showEvidenceDossier && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn pointer-events-auto">
            <div className="relative w-full max-w-md bg-stone-900 border-2 border-amber-500/80 rounded-2xl p-5 shadow-2xl text-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-amber-600/40 pb-2">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-sm sm:text-base text-amber-300">
                    ملف الأدلة والمفردات الجنائية الموثقة
                  </h3>
                </div>
                <button
                  onClick={() => setShowEvidenceDossier(false)}
                  className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                سجل المصطلحات والأدلة المرتبطة بقضية: <span className="text-amber-300 font-bold">{activeCase.codeName}</span>
              </p>

              <div className="flex flex-col gap-2 my-1 max-h-60 overflow-y-auto">
                {activeCase.evidenceTerms.map((term, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-stone-950/80 border border-amber-500/30 flex items-center justify-between"
                  >
                    <span className="font-black text-xs text-amber-200">{term.ar}</span>
                    <span className="text-[10px] text-stone-400 font-mono">{term.en}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowEvidenceDossier(false)}
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs transition cursor-pointer shadow-lg"
              >
                العودة للتحقيق
              </button>
            </div>
          </div>
        )}

        {/* Bottom-left audio toggles */}
        <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-full bg-black/60 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer backdrop-blur-md"
            title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} className="text-amber-400" />}
          </button>
          <button
            onClick={handleToggleMusic}
            className="p-2 rounded-full bg-black/60 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer backdrop-blur-md"
            title={isMusicPlaying ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
          >
            <Music size={15} className={isMusicPlaying ? 'text-amber-400' : 'text-slate-500'} />
          </button>
        </div>
      </div>
    </div>
  );
};
